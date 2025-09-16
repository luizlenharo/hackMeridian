import json
import logging
from datetime import datetime

from app.database import get_db
from app.models import database_models
from app.models.schemas import APIResponse, AuditorCreate
from app.services.stellarService import StellarService
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
router = APIRouter()
stellar_service = StellarService()


@router.post("/register", response_model=APIResponse)
async def register_auditor(auditor: AuditorCreate, db: Session = Depends(get_db)):
    """Registra um novo auditor na plataforma"""
    try:
        logger.info("Recieve request to create a new auditor")
        stellar_wallet_info = stellar_service.create_new_wallet()

        if not stellar_wallet_info["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create Stellar wallet: {stellar_wallet_info.get('error', 'Erro desconhecido')}",
            )

        stellar_public_key = stellar_wallet_info["public_key"]

        existing_email = (
            db.query(database_models.Auditor)
            .filter(database_models.Auditor.email == auditor.email)
            .first()
        )

        if existing_email:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        new_auditor = database_models.Auditor(
            name=auditor.name,
            email=auditor.email,
            specializations=json.dumps(
                auditor.specializations
            ),  # Converter lista para JSON
            stellar_public_key=stellar_public_key,
            is_active=True,  # Por simplicidade, aprovamos automaticamente
            certifications_issued=0,
            created_at=datetime.now(),
        )

        db.add(new_auditor)
        db.commit()
        db.refresh(new_auditor)

        return APIResponse(
            success=True,
            message="Auditor registrado com sucesso",
            data={"auditor_id": new_auditor.id},
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro de integridade de dados")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao registrar auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/list", response_model=APIResponse)
async def list_auditors(db: Session = Depends(get_db)):
    """Lista todos os auditores ativos"""
    try:
        # Buscar auditores ativos
        active_auditors_query = (
            db.query(database_models.Auditor)
            .filter(database_models.Auditor.is_active == True)
            .all()
        )

        # Converter para lista de dicionários
        active_auditors = []
        for auditor in active_auditors_query:
            active_auditors.append(
                {
                    "id": auditor.id,
                    "name": auditor.name,
                    "email": auditor.email,
                    "specializations": json.loads(auditor.specializations),
                    "stellar_public_key": auditor.stellar_public_key,
                    "is_active": auditor.is_active,
                    "certifications_issued": auditor.certifications_issued,
                    "created_at": auditor.created_at.isoformat(),
                }
            )

        return APIResponse(
            success=True,
            message=f"Encontrados {len(active_auditors)} auditores ativos",
            data={"auditors": active_auditors},
        )

    except Exception as e:
        logger.error(f"Erro ao listar auditores: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{auditor_id}", response_model=APIResponse)
async def get_auditor(auditor_id: int, db: Session = Depends(get_db)):
    """Obtém detalhes de um auditor específico"""
    try:
        # Buscar auditor
        auditor = (
            db.query(database_models.Auditor)
            .filter(database_models.Auditor.id == auditor_id)
            .first()
        )

        if not auditor:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        # Converter para dicionário
        auditor_dict = {
            "id": auditor.id,
            "name": auditor.name,
            "email": auditor.email,
            "specializations": json.loads(auditor.specializations),
            "stellar_public_key": auditor.stellar_public_key,
            "is_active": auditor.is_active,
            "certifications_issued": auditor.certifications_issued,
            "created_at": auditor.created_at.isoformat(),
        }

        return APIResponse(
            success=True, message="Auditor encontrado", data=auditor_dict
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{auditor_id}/deactivate", response_model=APIResponse)
async def deactivate_auditor(auditor_id: int, db: Session = Depends(get_db)):
    """Desativa um auditor"""
    try:
        # Buscar auditor
        auditor = (
            db.query(database_models.Auditor)
            .filter(database_models.Auditor.id == auditor_id)
            .first()
        )

        if not auditor:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        # Desativar auditor
        auditor.is_active = False
        db.commit()

        return APIResponse(success=True, message="Auditor desativado com sucesso")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao desativar auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/{auditor_id}/activate", response_model=APIResponse)
async def activate_auditor(auditor_id: int, db: Session = Depends(get_db)):
    """Reativa um auditor"""
    try:
        # Buscar auditor
        auditor = (
            db.query(database_models.Auditor)
            .filter(database_models.Auditor.id == auditor_id)
            .first()
        )

        if not auditor:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        # Ativar auditor
        auditor.is_active = True
        db.commit()

        return APIResponse(success=True, message="Auditor ativado com sucesso")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao ativar auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{auditor_id}/stats", response_model=APIResponse)
async def get_auditor_stats(auditor_id: int, db: Session = Depends(get_db)):
    """Obtém estatísticas de um auditor"""
    try:
        # Buscar auditor
        auditor = (
            db.query(database_models.Auditor)
            .filter(database_models.Auditor.id == auditor_id)
            .first()
        )

        if not auditor:
            raise HTTPException(status_code=404, detail="Auditor não encontrado")

        # Para um sistema mais completo, aqui calcularíamos estatísticas detalhadas
        # Por enquanto, retornamos dados básicos
        stats = {
            "auditor_id": auditor.id,
            "name": auditor.name,
            "certifications_issued": auditor.certifications_issued,
            "specializations": json.loads(auditor.specializations),
            "is_active": auditor.is_active,
            "member_since": auditor.created_at.isoformat(),
        }

        return APIResponse(success=True, message="Estatísticas do auditor", data=stats)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do auditor: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

