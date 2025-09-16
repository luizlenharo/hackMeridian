from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine
from app.models import database_models
from app.routes import auditor, auth, certification, restaurant, user

# Criar tabelas no banco de dados
database_models.Base.metadata.create_all(bind=engine)

settings = get_settings()

app = FastAPI(
    title="FoodTrust - Certificação Alimentar na Blockchain",
    description="Sistema descentralizado para certificação de estabelecimentos alimentares",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(restaurant.router, prefix="/api/restaurant", tags=["restaurant"])
app.include_router(
    certification.router, prefix="/api/certification", tags=["certification"]
)
app.include_router(auditor.router, prefix="/api/auditor", tags=["auditor"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


@app.get("/")
async def root():
    return {
        "message": "FoodTrust API",
        "version": "1.0.0",
        "network": settings.STELLAR_NETWORK,
        "horizon_url": settings.STELLAR_HORIZON_URL,
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}