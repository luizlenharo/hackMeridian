import logging
import uuid
from datetime import datetime
from typing import List, Optional

from app.models.schemas import (
    APIResponse,
    PaginatedResponse,
    RestaurantCreate,
)
from app.services.stellarService import StellarService
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)
router = APIRouter()

# Simulação de banco de dados em memória (para hackathon)
restaurants_db = {}
stellar_service = StellarService()


@router.post("/register", response_model=APIResponse)
async def register_restaurant(restaurant: RestaurantCreate):
    """Registra um novo restaurante na plataforma"""
    try:
        stellar_wallet_info = None

        # Criar uma nova carteira Stellar para o restaurante
        stellar_wallet_info = stellar_service.create_new_wallet()

        if not stellar_wallet_info["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar carteira Stellar: {stellar_wallet_info.get('error', 'Erro desconhecido')}",
            )

        stellar_public_key = stellar_wallet_info["public_key"]

        # Gerar ID único
        restaurant_id = str(uuid.uuid4())

        # Salvar restaurante
        restaurants_db[restaurant_id] = {
            "id": restaurant_id,
            "name": restaurant.name,
            "address": restaurant.address,
            "stellar_public_key": stellar_public_key,
            "created_at": datetime.now().isoformat(),
            "certifications": [],
        }

        # Preparar resposta
        response_data = {"restaurant_id": restaurant_id}

        # Incluir informações da carteira criada, se aplicável
        if stellar_wallet_info:
            response_data["wallet"] = {
                "public_key": stellar_wallet_info["public_key"],
                "secret_key": stellar_wallet_info["secret_key"],
                "message": "IMPORTANTE: Guarde a chave secreta em um local seguro. Ela não será mostrada novamente.",
            }

        return APIResponse(
            success=True,
            message="Restaurante registrado com sucesso",
            data=response_data,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao registrar restaurante: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/list", response_model=PaginatedResponse)
async def list_restaurants(
    name: Optional[str] = Query(None, description="Filtrar por nome"),
    address: Optional[str] = Query(None, description="Filtrar por endereço"),
    page: int = Query(1, ge=1, description="Página"),
    size: int = Query(10, ge=1, le=100, description="Itens por página"),
):
    """Lista restaurantes com filtros e paginação"""
    try:
        # Aplicar filtros
        filtered_restaurants = []
        for restaurant in restaurants_db.values():
            if name and name.lower() not in restaurant["name"].lower():
                continue
            if address and address.lower() not in restaurant["address"].lower():
                continue

            # Adicionar certificações atualizadas
            certifications = stellar_service.get_restaurant_certifications(
                restaurant["stellar_public_key"]
            )
            restaurant["certifications"] = certifications

            filtered_restaurants.append(restaurant)

        # Paginação
        total = len(filtered_restaurants)
        start_idx = (page - 1) * size
        end_idx = start_idx + size
        paginated_restaurants = filtered_restaurants[start_idx:end_idx]

        return PaginatedResponse(
            items=paginated_restaurants,
            total=total,
            page=page,
            size=size,
            pages=(total + size - 1) // size,
        )

    except Exception as e:
        logger.error(f"Erro ao listar restaurantes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{restaurant_id}", response_model=APIResponse)
async def get_restaurant(restaurant_id: str):
    """Obtém detalhes de um restaurante específico"""
    try:
        if restaurant_id not in restaurants_db:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        restaurant = restaurants_db[restaurant_id].copy()

        # Obter certificações atualizadas da blockchain
        certifications = stellar_service.get_restaurant_certifications(
            restaurant["stellar_public_key"]
        )
        restaurant["certifications"] = certifications

        # Obter histórico de transações de certificação
        certification_history = stellar_service.get_certification_transactions(
            restaurant["stellar_public_key"]
        )
        restaurant["certification_history"] = certification_history

        return APIResponse(
            success=True, message="Restaurante encontrado", data=restaurant
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
):
    """Busca restaurantes por certificações específicas"""
    try:
        certified_restaurants = []

        for restaurant in restaurants_db.values():
            restaurant_certs = stellar_service.get_restaurant_certifications(
                restaurant["stellar_public_key"]
            )
            cert_codes = [cert["asset_code"] for cert in restaurant_certs]

            # Verificar se tem todas as certificações solicitadas
            has_all_certs = all(cert.upper() in cert_codes for cert in certifications)

            if has_all_certs:
                restaurant_copy = restaurant.copy()
                restaurant_copy["certifications"] = restaurant_certs
                certified_restaurants.append(restaurant_copy)

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
async def delete_restaurant(restaurant_id: str):
    """Remove um restaurante da plataforma"""
    try:
        if restaurant_id not in restaurants_db:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        del restaurants_db[restaurant_id]

        return APIResponse(success=True, message="Restaurante removido com sucesso")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar restaurante {restaurant_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

