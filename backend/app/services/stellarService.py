import json
import logging

from app.config import CERTIFICATION_ASSETS, get_settings
from stellar_sdk import Asset, Keypair, Server, TransactionBuilder

logger = logging.getLogger(__name__)
settings = get_settings()


class StellarService:
    def __init__(self):
        self.server = Server(settings.STELLAR_HORIZON_URL)
        self.issuer_keypair = (
            Keypair.from_secret(settings.ISSUER_SECRET_KEY)
            if settings.ISSUER_SECRET_KEY
            else None
        )
        self.network_passphrase = (
            "Test SDF Network ; September 2015"
            if settings.STELLAR_NETWORK == "testnet"
            else "Public Global Stellar Network ; September 2015"
        )

    def create_new_wallet(self):
        """Cria uma nova carteira Stellar e a financia no testnet"""
        try:
            # Gerar novo par de chaves
            keypair = Keypair.random()
            public_key = keypair.public_key
            secret_key = keypair.secret
            
            # Financiar a conta no testnet
            funded = self.create_test_account(public_key)
            
            if funded:
                return {
                    "success": True,
                    "public_key": public_key,
                    "secret_key": secret_key,
                }
            else:
                return {
                    "success": False,
                    "error": "Não foi possível financiar a conta no testnet"
                }
        except Exception as e:
            logger.error(f"Erro ao criar nova carteira: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def create_test_account(self, public_key: str):
        """Cria conta de teste para o testnet"""
        try:
            if settings.STELLAR_NETWORK == "testnet":
                import requests

                response = requests.get(
                    f"https://friendbot.stellar.org?addr={public_key}"
                )
                return response.status_code == 200
            return False
        except Exception as e:
            logger.error(f"Erro ao criar conta teste: {e}")
            return False

    def get_account_info(self, public_key: str):
        """Obtém informações da conta"""
        try:
            account = self.server.accounts().account_id(public_key).call()
            return account
        except Exception as e:
            logger.error(f"Erro ao obter informações da conta {public_key}: {e}")
            return None

    def issue_certification_token(
        self, restaurant_public_key: str, certification_type: str, metadata: dict
    ):
        """Emite token de certificação para o restaurante"""
        try:
            if not self.issuer_keypair:
                raise ValueError("Chave privada do emissor não configurada")

            # Verificar se a conta do restaurante existe
            restaurant_account = self.get_account_info(restaurant_public_key)
            if not restaurant_account:
                # Tentar criar conta no testnet
                if not self.create_test_account(restaurant_public_key):
                    raise ValueError(
                        "Conta do restaurante não existe e não foi possível criar"
                    )

            # Criar asset de certificação
            asset_code = CERTIFICATION_ASSETS.get(certification_type)
            if not asset_code:
                raise ValueError(f"Tipo de certificação inválido: {certification_type}")

            certification_asset = Asset(asset_code, self.issuer_keypair.public_key)

            # Carregar conta do emissor
            issuer_account = self.server.load_account(self.issuer_keypair.public_key)

            # Criar memo com metadados da certificação
            memo_data = json.dumps(
                {
                    "type": "certification",
                    "cert_type": certification_type,
                    "restaurant_id": metadata.get("restaurant_id"),
                    "issued_at": metadata.get("issued_at"),
                    "auditor_id": metadata.get("auditor_id"),
                }
            )

            # Construir transação
            transaction = (
                TransactionBuilder(
                    source_account=issuer_account,
                    network_passphrase=self.network_passphrase,
                    base_fee=100,
                )
                .add_text_memo(memo_data[:28])  # Stellar memo tem limite de 28 bytes
                .append_payment_op(
                    destination=restaurant_public_key,
                    asset=certification_asset,
                    amount="1",  # 1 token = 1 certificação
                )
                .set_timeout(30)
                .build()
            )

            # Assinar e enviar transação
            transaction.sign(self.issuer_keypair)
            response = self.server.submit_transaction(transaction)

            return {
                "success": True,
                "transaction_hash": response["hash"],
                "asset_code": asset_code,
                "amount": "1",
            }

        except Exception as e:
            logger.error(f"Erro ao emitir certificação: {e}")
            return {"success": False, "error": str(e)}

    def get_restaurant_certifications(self, restaurant_public_key: str):
        """Obtém todas as certificações de um restaurante"""
        try:
            account = self.get_account_info(restaurant_public_key)
            if not account:
                return []

            certifications = []
            for balance in account["balances"]:
                if balance["asset_type"] != "native":  # Ignorar XLM
                    asset_code = balance["asset_code"]
                    asset_issuer = balance["asset_issuer"]

                    # Verificar se é um token de certificação nosso
                    if asset_issuer == self.issuer_keypair.public_key:
                        certifications.append(
                            {
                                "asset_code": asset_code,
                                "balance": balance["balance"],
                                "issuer": asset_issuer,
                            }
                        )

            return certifications

        except Exception as e:
            logger.error(f"Erro ao obter certificações do restaurante: {e}")
            return []

    def get_certification_transactions(self, restaurant_public_key: str):
        """Obtém histórico de transações de certificação"""
        try:
            transactions = (
                self.server.transactions()
                .for_account(restaurant_public_key)
                .order(desc=True)
                .limit(50)
                .call()
            )

            certification_txs = []
            for tx in transactions["_embedded"]["records"]:
                if tx["memo"] and "certification" in tx["memo"]:
                    certification_txs.append(
                        {
                            "hash": tx["hash"],
                            "created_at": tx["created_at"],
                            "memo": tx["memo"],
                            "source_account": tx["source_account"],
                        }
                    )

            return certification_txs

        except Exception as e:
            logger.error(f"Erro ao obter transações de certificação: {e}")
            return []

    def validate_stellar_address(self, public_key: str):
        """Valida formato de endereço Stellar"""
        try:
            Keypair.from_public_key(public_key)
            return True
        except ValueError:
            return False

    def setup_trust_line(self, user_secret_key: str, asset_code: str):
        """Configura trustline para receber tokens de certificação"""
        try:
            user_keypair = Keypair.from_secret(user_secret_key)
            user_account = self.server.load_account(user_keypair.public_key)

            certification_asset = Asset(asset_code, self.issuer_keypair.public_key)

            transaction = (
                TransactionBuilder(
                    source_account=user_account,
                    network_passphrase=self.network_passphrase,
                    base_fee=100,
                )
                .append_change_trust_op(
                    asset=certification_asset,
                    limit="1000",  # Limite de tokens que pode receber
                )
                .set_timeout(30)
                .build()
            )

            transaction.sign(user_keypair)
            response = self.server.submit_transaction(transaction)

            return {"success": True, "transaction_hash": response["hash"]}

        except Exception as e:
            logger.error(f"Erro ao configurar trustline: {e}")
            return {"success": False, "error": str(e)}