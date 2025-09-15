import logging
import uuid
from datetime import datetime

from app.models.schemas import APIResponse, AuditorCreate
from app.services.stellarService import StellarService
from fastapi import APIRouter, HTTPException

logger = logging.getLogger(__name__)
router = APIRouter()

# Banco de dados de auditores em memória
auditors_db = {}
stellar_service = StellarService()


@router.post("/register", response_model=APIResponse)
async def register_auditor(auditor: AuditorCreate):
    """Registra um novo auditor na plataforma"""
    try:
        # Validar chave pública Stellar
        if not stellar_service.validate_stellar_address(auditor.stellar_public_key):
            raise HTTPException(status_code=400, detail="Endereço Stellar inválido")

        # Verificar se email já existe
        for existing_auditor in auditors_db.values():
            if existing_auditor["email"] == auditor.email:
                raise HTTPException(status_code=400, detail="Email já cadastrado")
            if existing_auditor["stellar_public_key"] == auditor.stellar_public_key:
                raise HTTPException(
                    status_code=400, detail="Endereço Stellar já cadastrado"
                )

        # Gerar ID único
        auditor_id = str(uuid.uuid4())

        # Salvar auditor
        auditors_db[auditor_id] = {
            "id": auditor_id,
            "name": auditor.name,
            "email": auditor.email,
            "specializations": auditor.specializations,
            "credentials": auditor.credentials,
            "stellar_public_key": auditor.stellar_public_key,
            "is_active": True,  # Por simplicidade, aprovamos automaticamente
            "certifications_issued": 0,
            "created_at": datetime.now().isoformat(),
        }

        return APIResponse(
            success=True,
            message="Auditor registrado com sucesso",
            data={"auditor_id": auditor_id},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao registrar auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/list", response_model=APIResponse)
async def list_auditors():
    """Lista todos os auditores ativos"""
    try:
        active_auditors = [
            auditor for auditor in auditors_db.values() if auditor["is_active"]
        ]

        return APIResponse(
            success=True,
            message=f"Encontrados {len(active_auditors)} auditores ativos",
            data={"auditors": active_auditors},
        )

    except Exception as e:
        logger.error(f"Erro ao listar auditores: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{auditor_id}", response_model=APIResponse)
async def get_auditor(auditor_id: str):
    """Obtém detalhes de um auditor específico"""
    try:
        if auditor_id not in auditors_db:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        auditor = auditors_db[auditor_id]

        return APIResponse(success=True, message="Auditor encontrado", data=auditor)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{auditor_id}/deactivate", response_model=APIResponse)
async def deactivate_auditor(auditor_id: str):
    """Desativa um auditor"""
    try:
        if auditor_id not in auditors_db:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        auditors_db[auditor_id]["is_active"] = False

        return APIResponse(success=True, message="Auditor desativado com sucesso")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao desativar auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{auditor_id}/activate", response_model=APIResponse)
async def activate_auditor(auditor_id: str):
    """Reativa um auditor"""
    try:
        if auditor_id not in auditors_db:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        auditors_db[auditor_id]["is_active"] = True

        return APIResponse(success=True, message="Auditor ativado com sucesso")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao ativar auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{auditor_id}/stats", response_model=APIResponse)
async def get_auditor_stats(auditor_id: str):
    """Obtém estatísticas de um auditor"""
    try:
        if auditor_id not in auditors_db:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        auditor = auditors_db[auditor_id]

        # Para um sistema mais completo, aqui calcularíamos estatísticas detalhadas
        # Por enquanto, retornamos dados básicos
        stats = {
            "auditor_id": auditor_id,
            "name": auditor["name"],
            "certifications_issued": auditor["certifications_issued"],
            "specializations": auditor["specializations"],
            "is_active": auditor["is_active"],
            "member_since": auditor["created_at"],
        }

        return APIResponse(success=True, message="Estatísticas do auditor", data=stats)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
