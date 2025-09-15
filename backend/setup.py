#!/usr/bin/env python3
"""
Setup script para FoodTrust - Certificação Alimentar na Blockchain
Cria chaves Stellar para o emissor de tokens e configura o ambiente
"""

from stellar_sdk import Keypair


def create_env_file():
    """Cria arquivo .env com configurações"""

    print("🚀 Configurando FoodTrust - Certificação Alimentar")
    print("=" * 50)

    # Gerar keypair para o emissor de tokens
    issuer_keypair = Keypair.random()

    print("✅ Chave do Emissor Gerada:")
    print(f"   Public Key:  {issuer_keypair.public_key}")
    print(f"   Secret Key:  {issuer_keypair.secret}")
    print()

    # Criar arquivo .env
    env_content = f"""# FoodTrust - Configurações da Blockchain Stellar
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Chaves do Emissor de Tokens (MANTENHA SEGURO!)
ISSUER_PUBLIC_KEY={issuer_keypair.public_key}
ISSUER_SECRET_KEY={issuer_keypair.secret}

# Assets de Certificação
VEGAN_ASSET=VEGAN
GLUTEN_FREE_ASSET=GLUTENFREE
SEAFOOD_FREE_ASSET=SEAFOODFREE
KOSHER_ASSET=KOSHER
HALAL_ASSET=HALAL

# Configurações da API
API_VERSION=v1
DEBUG=true
"""

    with open(".env", "w") as f:
        f.write(env_content)

    print("✅ Arquivo .env criado com sucesso!")
    print()

    # Criar conta no testnet
    print("🌟 Criando conta no Stellar Testnet...")
    try:
        import requests

        response = requests.get(
            f"https://friendbot.stellar.org?addr={issuer_keypair.public_key}"
        )
        if response.status_code == 200:
            print("✅ Conta criada no testnet com sucesso!")
            print(f"   Endereço: {issuer_keypair.public_key}")
        else:
            print("⚠️  Erro ao criar conta no testnet. Verifique sua conexão.")
    except Exception as e:
        print(f"⚠️  Erro ao criar conta no testnet: {e}")

    print()
    print("🎯 Próximos passos:")
    print("1. Execute: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("2. Acesse: http://localhost:8000 para ver a API")
    print("3. Acesse: http://localhost:8000/docs para ver a documentação")
    print()
    print(
        "⚠️  IMPORTANTE: Mantenha o arquivo .env seguro e não compartilhe suas chaves!"
    )


if __name__ == "__main__":
    create_env_file()
