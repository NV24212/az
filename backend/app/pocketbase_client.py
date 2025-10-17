import httpx
from .config import settings
import structlog

logger = structlog.get_logger(__name__)

class PocketBaseClient:
    def __init__(self):
        self.base_url = f"{settings.POCKETBASE_URL}/api"
        self.admin_email = settings.POCKETBASE_ADMIN_EMAIL
        self.admin_password = settings.POCKETBASE_ADMIN_PASSWORD
        self.admin_token = None
        self.client = httpx.AsyncClient()

    async def get_admin_token(self):
        """Authenticates as admin and retrieves a token."""
        if self.admin_token:
            # Here you might add logic to check if the token is expired
            return self.admin_token

        logger.info("Authenticating with PocketBase as admin...")
        try:
            resp = await self.client.post(
                f"{self.base_url}/admins/auth-with-password",
                json={"identity": self.admin_email, "password": self.admin_password}
            )
            resp.raise_for_status()  # Raise an exception for bad status codes
            self.admin_token = resp.json()["token"]
            logger.info("Successfully authenticated with PocketBase.")
            return self.admin_token
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to authenticate with PocketBase.",
                status_code=e.response.status_code,
                response_text=e.response.text
            )
            raise
        except Exception as e:
            logger.error("An unexpected error occurred during PocketBase authentication.", error=str(e))
            raise

    async def get_records(self, collection: str, params: dict = None):
        """Fetches records from a collection."""
        token = await self.get_admin_token()
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = await self.client.get(
                f"{self.base_url}/collections/{collection}/records",
                headers=headers,
                params=params
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to fetch records from PocketBase.",
                collection=collection,
                status_code=e.response.status_code,
                response_text=e.response.text
            )
            return None # Or raise an exception

    async def create_record(self, collection: str, data: dict):
        """Creates a new record in a collection."""
        token = await self.get_admin_token()
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = await self.client.post(
                f"{self.base_url}/collections/{collection}/records",
                headers=headers,
                json=data
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to create record in PocketBase.",
                collection=collection,
                status_code=e.response.status_code,
                response_text=e.response.text
            )
            return None

    async def update_record(self, collection: str, record_id: str, data: dict):
        """Updates a record in a collection."""
        token = await self.get_admin_token()
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = await self.client.patch(
                f"{self.base_url}/collections/{collection}/records/{record_id}",
                headers=headers,
                json=data
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to update record in PocketBase.",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                response_text=e.response.text
            )
            return None

    async def delete_record(self, collection: str, record_id: str):
        """Deletes a record from a collection."""
        token = await self.get_admin_token()
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = await self.client.delete(
                f"{self.base_url}/collections/{collection}/records/{record_id}",
                headers=headers
            )
            resp.raise_for_status()
            return True
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to delete record from PocketBase.",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                response_text=e.response.text
            )
            return False

# Create a single, reusable instance of the client
pb_client = PocketBaseClient()