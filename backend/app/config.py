from functools import lru_cache


class Settings:
    # Stellar Configuration
    STELLAR_NETWORK: str = "testnet"
    STELLAR_HORIZON_URL: str = "https://horizon-testnet.stellar.org"

    # Platform Issuer (sua conta que emitirá os tokens de certificação)
    ISSUER_SECRET_KEY: str = ""  # Configure com sua chave secreta
    ISSUER_PUBLIC_KEY: str = ""  # Configure com sua chave pública

    # Certification Assets
    VEGAN_ASSET: str = "VEGAN"
    GLUTEN_FREE_ASSET: str = "GLUTENFREE"
    SEAFOOD_FREE_ASSET: str = "SEAFOODFREE"
    KOSHER_ASSET: str = "KOSHER"
    HALAL_ASSET: str = "HALAL"

    # API Configuration
    API_VERSION: str = "v1"
    DEBUG: bool = True

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


# Assets disponíveis para certificação
CERTIFICATION_ASSETS = {
    "vegan": "VEGAN",
    "gluten_free": "GLUTENFREE",
    "seafood_free": "SEAFOODFREE",
    "kosher": "KOSHER",
    "halal": "HALAL",
}
