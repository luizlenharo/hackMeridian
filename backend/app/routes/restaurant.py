import json
import logging
from datetime import datetime
from typing import List, Optional

from app.database import get_db
from app.models import database_models
from app.models.schemas import (
    APIResponse,
    PaginatedResponse,
    RestaurantCreate,
)
from app.services.stellarService import StellarService
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
router = APIRouter()
stellar_service = StellarService()


@router.post("/register", response_model=APIResponse)
async def register_restaurant(
    restaurant: RestaurantCreate, db: Session = Depends(get_db)
):
    """Registra um novo restaurante na plataforma"""
    try:
        stellar_wallet_info = None
        
        # Criar uma nova carteira Stellar para o restaurante
        stellar_wallet_info = stellar_service.create_new_wallet()
        
        if not stellar_wallet_info["success"]:
            raise HTTPException(
                status_code=500, 
                detail=f"Erro ao criar carteira Stellar: {stellar_wallet_info.get('error', 'Erro desconhecido')}"
            )
        
        stellar_public_key = stellar_wallet_info["public_key"]

        # Criar novo restaurante no banco de dados
        new_restaurant = database_models.Restaurant(
            name=restaurant.name,
            address=restaurant.address,
            stellar_public_key=stellar_public_key,
            created_at=datetime.now()
        )
        
        db.add(new_restaurant)
        db.commit()
        db.refresh(new_restaurant)

        # Preparar resposta
        response_data = {"restaurant_id": new_restaurant.id}
        
        # Incluir informações da carteira criada, se aplicável
        if stellar_wallet_info:
            response_data["wallet"] = {
                "public_key": stellar_wallet_info["public_key"],
                "secret_key": stellar_wallet_info["secret_key"],
                "message": "IMPORTANTE: Guarde a chave secreta em um local seguro. Ela não será mostrada novamente."
            }

        return APIResponse(
            success=True,
            message="Restaurante registrado com sucesso",
            data=response_data,
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro de integridade de dados")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao registrar restaurante: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/list", response_model=PaginatedResponse)
async def list_restaurants(
    name: Optional[str] = Query(None, description="Filtrar por nome"),
    address: Optional[str] = Query(None, description="Filtrar por endereço"),
    page: int = Query(1, ge=1, description="Página"),
    size: int = Query(10, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db)
):
    """Lista restaurantes com filtros e paginação"""
    try:
        # Construir query base
        query = db.query(database_models.Restaurant)
        
        # Aplicar filtros
        if name:
            query = query.filter(database_models.Restaurant.name.ilike(f"%{name}%"))
        if address:
            query = query.filter(database_models.Restaurant.address.ilike(f"%{address}%"))
        
        # Contar total de registros
        total = query.count()
        
        # Aplicar paginação
        restaurants = query.offset((page - 1) * size).limit(size).all()
        
        # Converter para dicionários e adicionar certificações
        restaurant_list = []
        for restaurant in restaurants:
            restaurant_dict = {
                "id": restaurant.id,
                "name": restaurant.name,
                "address": restaurant.address,
                "stellar_public_key": restaurant.stellar_public_key,
                "created_at": restaurant.created_at.isoformat(),
            }
            
            # Adicionar certificações atualizadas da blockchain
            certifications = stellar_service.get_restaurant_certifications(
                restaurant.stellar_public_key
            )
            restaurant_dict["certifications"] = certifications
            
            restaurant_list.append(restaurant_dict)

        return PaginatedResponse(
            items=restaurant_list,
            total=total,
            page=page,
            size=size,
            pages=(total + size - 1) // size,
        )

    except Exception as e:
        logger.error(f"Erro ao listar restaurantes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{restaurant_id}", response_model=APIResponse)
async def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """Obtém detalhes de um restaurante específico"""
    try:
        restaurant = db.query(database_models.Restaurant).filter(
            database_models.Restaurant.id == restaurant_id
        ).first()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        # Converter para dicionário
        restaurant_dict = {
            "id": restaurant.id,
            "name": restaurant.name,
            "address": restaurant.address,
            "stellar_public_key": restaurant.stellar_public_key,
            "created_at": restaurant.created_at.isoformat(),
        }

        # Obter certificações atualizadas da blockchain
        certifications = stellar_service.get_restaurant_certifications(
            restaurant.stellar_public_key
        )
        restaurant_dict["certifications"] = certifications

        # Obter histórico de transações de certificação
        certification_history = stellar_service.get_certification_transactions(
            restaurant.stellar_public_key
        )
        restaurant_dict["certification_history"] = certification_history

        return APIResponse(
            success=True, message="Restaurante encontrado", data=restaurant_dict
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter restaurante {restaurant_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/search/by-certification")
async def search_by_certification(
    certifications: List[str] = Query(..., description="Lista de certificações"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Busca restaurantes por certificações específicas"""
    try:
        # Obter todos os restaurantes
        restaurants = db.query(database_models.Restaurant).all()
        
        certified_restaurants = []
        
        for restaurant in restaurants:
            restaurant_certs = stellar_service.get_restaurant_certifications(
                restaurant.stellar_public_key
            )
            cert_codes = [cert["asset_code"] for cert in restaurant_certs]

            # Verificar se tem todas as certificações solicitadas
            has_all_certs = all(cert.upper() in cert_codes for cert in certifications)

            if has_all_certs:
                restaurant_dict = {
                    "id": restaurant.id,
                    "name": restaurant.name,
                    "address": restaurant.address,
                    "stellar_public_key": restaurant.stellar_public_key,
                    "created_at": restaurant.created_at.isoformat(),
                    "certifications": restaurant_certs
                }
                certified_restaurants.append(restaurant_dict)

        # Paginação
        total = len(certified_restaurants)
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        paginated_restaurants = certified_restaurants[start_idx:end_idx]

        return PaginatedResponse(
            items=paginated_restaurants,
            total=total,
            page=page,
            size=size,
            pages=(total + size - 1) // size,
        )

    except Exception as e:
        logger.error(f"Erro ao buscar por certificações: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/{restaurant_id}", response_model=APIResponse)
async def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """Remove um restaurante da plataforma"""
    try:
        restaurant = db.query(database_models.Restaurant).filter(
            database_models.Restaurant.id == restaurant_id
        ).first()
        
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        db.delete(restaurant)
        db.commit()

        return APIResponse(success=True, message="Restaurante removido com sucesso")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar restaurante {restaurant_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")