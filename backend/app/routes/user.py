import logging
from datetime import datetime, timedelta
from typing import List, Optional

from app.database import get_db
from app.models import database_models
from app.models.schemas import (
    APIResponse,
    PaginatedResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from app.services.stellarService import StellarService
from app.utils.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
router = APIRouter()
stellar_service = StellarService()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Função para obter o usuário atual a partir do token
async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        from app.utils.security import SECRET_KEY, ALGORITHM

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(database_models.User).filter(database_models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=APIResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Registra um novo usuário na plataforma"""
    try:
        # Verificar se o email já existe
        existing_user = (
            db.query(database_models.User)
            .filter(database_models.User.email == user.email)
            .first()
        )
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já cadastrado")

        # Criar uma nova carteira Stellar para o usuário
        logger.info(f"Criando nova carteira Stellar para o usuário: {user.name}")
        stellar_wallet_info = stellar_service.create_new_wallet()

        if not stellar_wallet_info["success"]:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao criar carteira Stellar: {stellar_wallet_info.get('error', 'Erro desconhecido')}",
            )

        stellar_public_key = stellar_wallet_info["public_key"]
        
        # Verificar se as trustlines foram configuradas
        trustlines = stellar_wallet_info.get("trustlines", [])
        if trustlines:
            logger.info(f"Trustlines configuradas com sucesso: {', '.join(trustlines)}")
        else:
            logger.warning("Nenhuma trustline foi configurada durante a criação da carteira")

        # Hash da senha
        hashed_password = get_password_hash(user.password)

        # Criar novo usuário no banco de dados
        new_user = database_models.User(
            name=user.name,
            email=user.email,
            password_hash=hashed_password,
            stellar_public_key=stellar_public_key,
            created_at=datetime.now(),
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Preparar resposta
        response_data = {"user_id": new_user.id}

        # Incluir informações da carteira criada
        response_data["wallet"] = {
            "public_key": stellar_wallet_info["public_key"],
            "secret_key": stellar_wallet_info["secret_key"],
            "trustlines_configured": trustlines,
            "message": "IMPORTANTE: Guarde a chave secreta em um local seguro. Ela não será mostrada novamente."
        }

        return APIResponse(
            success=True,
            message="Usuário registrado com sucesso",
            data=response_data,
        )

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro de integridade de dados")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao registrar usuário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.post("/login", response_model=APIResponse)
async def login_user(user_login: UserLogin, db: Session = Depends(get_db)):
    """Autentica um usuário e retorna um token de acesso"""
    try:
        # Buscar usuário pelo email
        user = (
            db.query(database_models.User)
            .filter(database_models.User.email == user_login.email)
            .first()
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Verificar senha
        if not verify_password(user_login.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Criar token de acesso
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return APIResponse(
            success=True,
            message="Login realizado com sucesso",
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "stellar_public_key": user.stellar_public_key,
                }
            },
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao fazer login: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/me", response_model=APIResponse)
async def get_user_me(current_user: database_models.User = Depends(get_current_user)):
    """Obtém informações do usuário atual"""
    try:
        user_data = {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "stellar_public_key": current_user.stellar_public_key,
            "created_at": current_user.created_at.isoformat(),
        }
        
        # Obter saldo da carteira Stellar
        account_info = stellar_service.get_account_info(current_user.stellar_public_key)
        if account_info:
            balances = []
            for balance in account_info.get("balances", []):
                if balance["asset_type"] == "native":
                    balances.append({
                        "asset_type": "XLM",
                        "balance": balance["balance"]
                    })
                else:
                    balances.append({
                        "asset_type": balance["asset_code"],
                        "balance": balance["balance"],
                        "issuer": balance["asset_issuer"]
                    })
            user_data["balances"] = balances
        
        return APIResponse(
            success=True,
            message="Informações do usuário obtidas com sucesso",
            data=user_data,
        )
        
    except Exception as e:
        logger.error(f"Erro ao obter informações do usuário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/me", response_model=APIResponse)
async def update_user_me(
    user_update: UserUpdate,
    current_user: database_models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza informações do usuário atual"""
    try:
        # Verificar se o email já existe (se estiver sendo atualizado)
        if user_update.email and user_update.email != current_user.email:
            existing_user = (
                db.query(database_models.User)
                .filter(database_models.User.email == user_update.email)
                .first()
            )
            if existing_user:
                raise HTTPException(status_code=400, detail="Email já cadastrado")
            current_user.email = user_update.email
            
        # Atualizar nome se fornecido
        if user_update.name:
            current_user.name = user_update.name
            
        # Atualizar senha se fornecida
        if user_update.password:
            current_user.password_hash = get_password_hash(user_update.password)
            
        db.commit()
        
        return APIResponse(
            success=True,
            message="Informações do usuário atualizadas com sucesso",
            data={
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
            },
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar informações do usuário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/list", response_model=PaginatedResponse)
async def list_users(
    name: Optional[str] = Query(None, description="Filtrar por nome"),
    email: Optional[str] = Query(None, description="Filtrar por email"),
    page: int = Query(1, ge=1, description="Página"),
    size: int = Query(10, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user),
):
    """Lista usuários com filtros e paginação"""
    try:
        # Construir query base
        query = db.query(database_models.User)

        # Aplicar filtros
        if name:
            query = query.filter(database_models.User.name.ilike(f"%{name}%"))
        if email:
            query = query.filter(database_models.User.email.ilike(f"%{email}%"))

        # Contar total de registros
        total = query.count()

        # Aplicar paginação
        users = query.offset((page - 1) * size).limit(size).all()

        # Converter para dicionários
        user_list = []
        for user in users:
            user_dict = {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "stellar_public_key": user.stellar_public_key,
                "created_at": user.created_at.isoformat(),
            }
            user_list.append(user_dict)

        return PaginatedResponse(
            items=user_list,
            total=total,
            page=page,
            size=size,
            pages=(total + size - 1) // size,
        )

    except Exception as e:
        logger.error(f"Erro ao listar usuários: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{user_id}", response_model=APIResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user),
):
    """Obtém detalhes de um usuário específico"""
    try:
        user = (
            db.query(database_models.User)
            .filter(database_models.User.id == user_id)
            .first()
        )

        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        # Converter para dicionário
        user_dict = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "stellar_public_key": user.stellar_public_key,
            "created_at": user.created_at.isoformat(),
        }

        return APIResponse(
            success=True, message="Usuário encontrado", data=user_dict
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/{user_id}", response_model=APIResponse)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: database_models.User = Depends(get_current_user),
):
    """Remove um usuário da plataforma (apenas administradores)"""
    try:
        # Verificar se o usuário atual é o mesmo que está sendo excluído
        if current_user.id != user_id:
            # Aqui você poderia adicionar uma verificação de permissão de administrador
            raise HTTPException(status_code=403, detail="Permissão negada")
            
        user = (
            db.query(database_models.User)
            .filter(database_models.User.id == user_id)
            .first()
        )

        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        db.delete(user)
        db.commit()

        return APIResponse(success=True, message="Usuário removido com sucesso")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")