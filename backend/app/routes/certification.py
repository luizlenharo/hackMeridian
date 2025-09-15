import logging
import uuid
from datetime import datetime, timedelta

from app.models.schemas import (
    APIResponse,
    CertificationRequest,
    CertificationStatus,
)
from app.routes.auditor import auditors_db
from app.routes.restaurant import restaurants_db
from app.services.stellarService import StellarService
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)
router = APIRouter()

# Banco de dados de certificações em memória
certifications_db = {}
stellar_service = StellarService()


@router.post("/request", response_model=APIResponse)
async def request_certification(cert_request: CertificationRequest):
    """Solicita nova certificação para um restaurante"""
    try:
        # Verificar se restaurante existe
        if cert_request.restaurant_id not in restaurants_db:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        restaurant = restaurants_db[cert_request.restaurant_id]

        # Verificar se já existe solicitação pendente do mesmo tipo
        for cert in certifications_db.values():
            if (
                cert["restaurant_id"] == cert_request.restaurant_id
                and cert["certification_type"] == cert_request.certification_type
                and cert["status"] == CertificationStatus.PENDING
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Já existe uma solicitação pendente deste tipo",
                )

        # Criar nova solicitação
        cert_id = str(uuid.uuid4())
        certification = {
            "id": cert_id,
            "restaurant_id": cert_request.restaurant_id,
            "certification_type": cert_request.certification_type,
            "products": cert_request.products,
            "status": CertificationStatus.PENDING,
            "auditor_id": None,
            "issued_at": None,
            "expires_at": None,
            "transaction_hash": None,
            "notes": cert_request.notes,
            "documentation": cert_request.documentation or [],
            "created_at": datetime.now().isoformat(),
        }

        certifications_db[cert_id] = certification

        return APIResponse(
            success=True,
            message="Solicitação de certificação criada com sucesso",
            data={"certification_id": cert_id},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao solicitar certificação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/pending", response_model=APIResponse)
async def get_pending_certifications(
    auditor_id: str = Query(None, description="Filtrar por auditor"),
    cert_type: str = Query(None, description="Filtrar por tipo de certificação"),
):
    """Lista certificações pendentes de aprovação"""
    try:
        pending_certs = []

        for cert in certifications_db.values():
            if cert["status"] != CertificationStatus.PENDING:
                continue

            if auditor_id and cert.get("auditor_id") != auditor_id:
                continue

            if cert_type and cert["certification_type"] != cert_type:
                continue

            # Adicionar informações do restaurante
            restaurant = restaurants_db.get(cert["restaurant_id"])
            cert_with_restaurant = cert.copy()
            cert_with_restaurant["restaurant"] = restaurant

            pending_certs.append(cert_with_restaurant)

        return APIResponse(
            success=True,
            message=f"Encontradas {len(pending_certs)} certificações pendentes",
            data={"certifications": pending_certs},
        )

    except Exception as e:
        logger.error(f"Erro ao buscar certificações pendentes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{certification_id}/approve", response_model=APIResponse)
async def approve_certification(certification_id: str, auditor_id: str):
    """Aprova uma certificação e emite token na blockchain"""
    try:
        # Verificar se certificação existe
        if certification_id not in certifications_db:
            raise HTTPException(status_code=404, detail="Certificação não encontrada")

        certification = certifications_db[certification_id]

        if certification["status"] != CertificationStatus.PENDING:
            raise HTTPException(
                status_code=400, detail="Certificação não está pendente"
            )

        # Verificar se auditor existe e está ativo
        if auditor_id not in auditors_db:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        auditor = auditors_db[auditor_id]
        if not auditor["is_active"]:
            raise HTTPException(status_code=400, detail="Auditor não está ativo")

        # Verificar se auditor tem especialização no tipo de certificação
        if certification["certification_type"] not in auditor["specializations"]:
            raise HTTPException(
                status_code=400,
                detail="Auditor não tem especialização neste tipo de certificação",
            )

        # Obter restaurante
        restaurant = restaurants_db[certification["restaurant_id"]]

        # Configurar trustline se necessário (seria feito pelo restaurante normalmente)
        # stellar_service.setup_trust_line(restaurant_secret, certification["certification_type"])

        # Emitir token de certificação na blockchain
        issued_at = datetime.now()
        expires_at = issued_at + timedelta(days=365)  # Certificação válida por 1 ano

        metadata = {
            "restaurant_id": certification["restaurant_id"],
            "issued_at": issued_at.isoformat(),
            "expires_at": expires_at.isoformat(),
            "auditor_id": auditor_id,
        }

        result = stellar_service.issue_certification_token(
            restaurant["stellar_public_key"],
            certification["certification_type"],
            metadata,
        )

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao emitir certificação: {result['error']}",
            )

        # Atualizar certificação
        certification["status"] = CertificationStatus.APPROVED
        certification["auditor_id"] = auditor_id
        certification["issued_at"] = issued_at.isoformat()
        certification["expires_at"] = expires_at.isoformat()
        certification["transaction_hash"] = result["transaction_hash"]

        # Atualizar contador do auditor
        auditor["certifications_issued"] += 1

        return APIResponse(
            success=True,
            message="Certificação aprovada e token emitido com sucesso",
            data={
                "transaction_hash": result["transaction_hash"],
                "asset_code": result["asset_code"],
                "expires_at": expires_at.isoformat(),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao aprovar certificação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{certification_id}/reject", response_model=APIResponse)
async def reject_certification(certification_id: str, auditor_id: str, reason: str):
    """Rejeita uma certificação"""
    try:
        if certification_id not in certifications_db:
            raise HTTPException(status_code=404, detail="Certificação não encontrada")

        certification = certifications_db[certification_id]

        if certification["status"] != CertificationStatus.PENDING:
            raise HTTPException(
                status_code=400, detail="Certificação não está pendente"
            )

        # Verificar auditor
        if auditor_id not in auditors_db:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        # Atualizar certificação
        certification["status"] = CertificationStatus.REJECTED
        certification["auditor_id"] = auditor_id
        certification["notes"] = f"Rejeitada: {reason}"

        return APIResponse(
            success=True,
            message="Certificação rejeitada",
            data={"certification_id": certification_id},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao rejeitar certificação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/restaurant/{restaurant_id}", response_model=APIResponse)
async def get_restaurant_certifications(restaurant_id: str):
    """Obtém todas as certificações de um restaurante"""
    try:
        if restaurant_id not in restaurants_db:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        restaurant = restaurants_db[restaurant_id]

        # Certificações do banco de dados local
        local_certs = [
            cert
            for cert in certifications_db.values()
            if cert["restaurant_id"] == restaurant_id
        ]

        # Certificações ativas na blockchain
        blockchain_certs = stellar_service.get_restaurant_certifications(
            restaurant["stellar_public_key"]
        )

        return APIResponse(
            success=True,
            message="Certificações encontradas",
            data={
                "restaurant_id": restaurant_id,
                "local_certifications": local_certs,
                "blockchain_certifications": blockchain_certs,
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter certificações do restaurante: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{certification_id}", response_model=APIResponse)
async def get_certification_details(certification_id: str):
    """Obtém detalhes de uma certificação específica"""
    try:
        if certification_id not in certifications_db:
            raise HTTPException(status_code=404, detail="Certificação não encontrada")

        certification = certifications_db[certification_id]

        # Adicionar informações do restaurante e auditor
        restaurant = restaurants_db.get(certification["restaurant_id"])
        auditor = (
            auditors_db.get(certification["auditor_id"])
            if certification["auditor_id"]
            else None
        )

        cert_details = certification.copy()
        cert_details["restaurant"] = restaurant
        cert_details["auditor"] = auditor

        return APIResponse(
            success=True, message="Certificação encontrada", data=cert_details
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter certificação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
