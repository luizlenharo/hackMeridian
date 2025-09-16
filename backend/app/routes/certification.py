import json
import logging
from datetime import datetime, timedelta

from app.database import get_db
from app.models import database_models
from app.models.schemas import (
    APIResponse,
    CertificationRequest,
    CertificationStatus,
)
from app.services.stellarService import StellarService
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
router = APIRouter()
stellar_service = StellarService()


@router.post("/request", response_model=APIResponse)
async def request_certification(
    cert_request: CertificationRequest, db: Session = Depends(get_db)
):
    """Solicita nova certificação para um restaurante"""
    try:
        # Verificar se restaurante existe
        restaurant = db.query(database_models.Restaurant).filter(
            database_models.Restaurant.id == cert_request.restaurant_id
        ).first()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        # Verificar se já existe solicitação pendente do mesmo tipo
        existing_cert = db.query(database_models.Certification).filter(
            database_models.Certification.restaurant_id == cert_request.restaurant_id,
            database_models.Certification.certification_type == cert_request.certification_type,
            database_models.Certification.status == CertificationStatus.PENDING
        ).first()
        
        if existing_cert:
            raise HTTPException(
                status_code=400,
                detail="Já existe uma solicitação pendente deste tipo",
            )

        # Criar nova solicitação
        new_certification = database_models.Certification(
            restaurant_id=cert_request.restaurant_id,
            certification_type=cert_request.certification_type,
            products=json.dumps(cert_request.products),  # Converter lista para JSON
            status=CertificationStatus.PENDING,
            notes=cert_request.notes,
            created_at=datetime.now()
        )
        
        db.add(new_certification)
        db.commit()
        db.refresh(new_certification)

        return APIResponse(
            success=True,
            message="Solicitação de certificação criada com sucesso",
            data={"certification_id": new_certification.id},
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao solicitar certificação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/pending", response_model=APIResponse)
async def get_pending_certifications(
    auditor_id: int = Query(None, description="Filtrar por auditor"),
    cert_type: str = Query(None, description="Filtrar por tipo de certificação"),
    db: Session = Depends(get_db)
):
    """Lista certificações pendentes de aprovação"""
    try:
        # Construir query base
        query = db.query(database_models.Certification).filter(
            database_models.Certification.status == CertificationStatus.PENDING
        )
        
        # Aplicar filtros adicionais
        if auditor_id:
            query = query.filter(database_models.Certification.auditor_id == auditor_id)
        
        if cert_type:
            query = query.filter(database_models.Certification.certification_type == cert_type)
        
        # Executar query
        pending_certs = query.all()
        
        # Preparar resultado
        result = []
        for cert in pending_certs:
            # Obter informações do restaurante
            restaurant = db.query(database_models.Restaurant).filter(
                database_models.Restaurant.id == cert.restaurant_id
            ).first()
            
            # Converter para dicionário
            cert_dict = {
                "id": cert.id,
                "restaurant_id": cert.restaurant_id,
                "certification_type": cert.certification_type,
                "products": json.loads(cert.products),
                "status": cert.status,
                "auditor_id": cert.auditor_id,
                "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
                "expires_at": cert.expires_at.isoformat() if cert.expires_at else None,
                "transaction_hash": cert.transaction_hash,
                "notes": cert.notes,
                "created_at": cert.created_at.isoformat(),
                "restaurant": {
                    "id": restaurant.id,
                    "name": restaurant.name,
                    "address": restaurant.address,
                    "stellar_public_key": restaurant.stellar_public_key,
                    "created_at": restaurant.created_at.isoformat()
                } if restaurant else None
            }
            
            result.append(cert_dict)

        return APIResponse(
            success=True,
            message=f"Encontradas {len(result)} certificações pendentes",
            data={"certifications": result},
        )

    except Exception as e:
        logger.error(f"Erro ao buscar certificações pendentes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{certification_id}/approve", response_model=APIResponse)
async def approve_certification(
    certification_id: int, auditor_id: int, db: Session = Depends(get_db)
):
    """Aprova uma certificação e emite token na blockchain"""
    try:
        # Verificar se certificação existe
        certification = db.query(database_models.Certification).filter(
            database_models.Certification.id == certification_id
        ).first()
        
        if not certification:
            raise HTTPException(status_code=404, detail="Certificação não encontrada")

        if certification.status != CertificationStatus.PENDING:
            raise HTTPException(
                status_code=400, detail="Certificação não está pendente"
            )

        # Verificar se auditor existe e está ativo
        auditor = db.query(database_models.Auditor).filter(
            database_models.Auditor.id == auditor_id
        ).first()
        
        if not auditor:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")
            
        if not auditor.is_active:
            raise HTTPException(status_code=400, detail="Auditor não está ativo")

        # Verificar se auditor tem especialização no tipo de certificação
        auditor_specializations = json.loads(auditor.specializations)
        if certification.certification_type not in auditor_specializations:
            raise HTTPException(
                status_code=400,
                detail="Auditor não tem especialização neste tipo de certificação",
            )

        # Obter restaurante
        restaurant = db.query(database_models.Restaurant).filter(
            database_models.Restaurant.id == certification.restaurant_id
        ).first()

        # Emitir token de certificação na blockchain
        issued_at = datetime.now()
        expires_at = issued_at + timedelta(days=365)  # Certificação válida por 1 ano

        metadata = {
            "restaurant_id": certification.restaurant_id,
            "issued_at": issued_at.isoformat(),
            "expires_at": expires_at.isoformat(),
            "auditor_id": auditor_id,
        }

        result = stellar_service.issue_certification_token(
            restaurant.stellar_public_key,
            certification.certification_type,
            metadata,
        )

        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao emitir certificação: {result.get('error', 'Erro desconhecido')}",
            )

        # Atualizar certificação
        certification.status = CertificationStatus.APPROVED
        certification.auditor_id = auditor_id
        certification.issued_at = issued_at
        certification.expires_at = expires_at
        certification.transaction_hash = result["transaction_hash"]

        # Atualizar contador do auditor
        auditor.certifications_issued += 1

        # Salvar alterações
        db.commit()

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
        db.rollback()
        logger.error(f"Erro ao aprovar certificação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{certification_id}/reject", response_model=APIResponse)
async def reject_certification(
    certification_id: int, auditor_id: int, reason: str, db: Session = Depends(get_db)
):
    """Rejeita uma certificação"""
    try:
        # Verificar se certificação existe
        certification = db.query(database_models.Certification).filter(
            database_models.Certification.id == certification_id
        ).first()
        
        if not certification:
            raise HTTPException(status_code=404, detail="Certificação não encontrada")

        if certification.status != CertificationStatus.PENDING:
            raise HTTPException(
                status_code=400, detail="Certificação não está pendente"
            )

        # Verificar auditor
        auditor = db.query(database_models.Auditor).filter(
            database_models.Auditor.id == auditor_id
        ).first()
        
        if not auditor:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        # Atualizar certificação
        certification.status = CertificationStatus.REJECTED
        certification.auditor_id = auditor_id
        certification.notes = f"Rejeitada: {reason}"
        
        # Salvar alterações
        db.commit()

        return APIResponse(
            success=True,
            message="Certificação rejeitada",
            data={"certification_id": certification_id},
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao rejeitar certificação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/restaurant/{restaurant_id}", response_model=APIResponse)
async def get_restaurant_certifications(restaurant_id: int, db: Session = Depends(get_db)):
    """Obtém todas as certificações de um restaurante"""
    try:
        # Verificar se restaurante existe
        restaurant = db.query(database_models.Restaurant).filter(
            database_models.Restaurant.id == restaurant_id
        ).first()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        # Certificações do banco de dados local
        local_certs_query = db.query(database_models.Certification).filter(
            database_models.Certification.restaurant_id == restaurant_id
        ).all()
        
        # Converter para lista de dicionários
        local_certs = []
        for cert in local_certs_query:
            local_certs.append({
                "id": cert.id,
                "restaurant_id": cert.restaurant_id,
                "certification_type": cert.certification_type,
                "products": json.loads(cert.products),
                "status": cert.status,
                "auditor_id": cert.auditor_id,
                "issued_at": cert.issued_at.isoformat() if cert.issued_at else None,
                "expires_at": cert.expires_at.isoformat() if cert.expires_at else None,
                "transaction_hash": cert.transaction_hash,
                "notes": cert.notes,
                "created_at": cert.created_at.isoformat()
            })

        # Certificações ativas na blockchain
        blockchain_certs = stellar_service.get_restaurant_certifications(
            restaurant.stellar_public_key
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
async def get_certification_details(certification_id: int, db: Session = Depends(get_db)):
    """Obtém detalhes de uma certificação específica"""
    try:
        # Buscar certificação
        certification = db.query(database_models.Certification).filter(
            database_models.Certification.id == certification_id
        ).first()
        
        if not certification:
            raise HTTPException(status_code=404, detail="Certificação não encontrada")

        # Buscar restaurante e auditor relacionados
        restaurant = db.query(database_models.Restaurant).filter(
            database_models.Restaurant.id == certification.restaurant_id
        ).first()
        
        auditor = None
        if certification.auditor_id:
            auditor = db.query(database_models.Auditor).filter(
                database_models.Auditor.id == certification.auditor_id
            ).first()

        # Montar resposta
        cert_details = {
            "id": certification.id,
            "restaurant_id": certification.restaurant_id,
            "certification_type": certification.certification_type,
            "products": json.loads(certification.products),
            "status": certification.status,
            "auditor_id": certification.auditor_id,
            "issued_at": certification.issued_at.isoformat() if certification.issued_at else None,
            "expires_at": certification.expires_at.isoformat() if certification.expires_at else None,
            "transaction_hash": certification.transaction_hash,
            "notes": certification.notes,
            "created_at": certification.created_at.isoformat(),
            "restaurant": {
                "id": restaurant.id,
                "name": restaurant.name,
                "address": restaurant.address,
                "stellar_public_key": restaurant.stellar_public_key,
                "created_at": restaurant.created_at.isoformat()
            } if restaurant else None,
            "auditor": {
                "id": auditor.id,
                "name": auditor.name,
                "email": auditor.email,
                "specializations": json.loads(auditor.specializations),
                "is_active": auditor.is_active
            } if auditor else None
        }

        return APIResponse(
            success=True, message="Certificação encontrada", data=cert_details
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter certificação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")