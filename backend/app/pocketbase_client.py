from pocketbase import PocketBase
from .config import settings
import structlog
import asyncio
import httpx

logger = structlog.get_logger(__name__)

class PocketBaseClient:
    def __init__(self):
        self.base_url = settings.POCKETBASE_URL
        self.admin_email = settings.POCKETBASE_ADMIN_EMAIL
        self.admin_password = settings.POCKETBASE_ADMIN_PASSWORD
        self.client = PocketBase(self.base_url)
        self._lock = asyncio.Lock()

    async def _ensure_admin_auth(self):
        """
        Ensures that the client is authenticated as an admin.
        Uses a lock to prevent multiple concurrent authentication attempts.
        """
        async with self._lock:
            if not self.client.auth_store.is_auth_record or self.client.auth_store.is_expired:
                logger.info("Admin token is missing or expired. Authenticating with PocketBase...")
                try:
                    await self.client.admins.auth_with_password(
                        self.admin_email, self.admin_password
                    )
                    logger.info("Successfully authenticated with PocketBase as admin.")
                except httpx.HTTPStatusError as e:
                    logger.error(
                        "Failed to authenticate with PocketBase as admin.",
                        status_code=e.response.status_code,
                        response=e.response.text
                    )
                    raise
                except Exception as e:
                    logger.error("An unexpected error occurred during PocketBase admin authentication.", error=str(e))
                    raise

    async def get_records(self, collection: str, params: dict = None):
        """Fetches records from a collection."""
        await self._ensure_admin_auth()
        try:
            return await self.client.collection(collection).get_list(1, 50, params)
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to fetch records from PocketBase.",
                collection=collection,
                status_code=e.response.status_code,
                response=e.response.text
            )
            return None

    async def create_record(self, collection: str, data: dict):
        """Creates a new record in a collection."""
        await self._ensure_admin_auth()
        try:
            return await self.client.collection(collection).create(data)
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to create record in PocketBase.",
                collection=collection,
                status_code=e.response.status_code,
                response=e.response.text
            )
            return None

    async def update_record(self, collection: str, record_id: str, data: dict):
        """Updates a record in a collection."""
        await self._ensure_admin_auth()
        try:
            return await self.client.collection(collection).update(record_id, data)
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to update record in PocketBase.",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                response=e.response.text
            )
            return None

    async def delete_record(self, collection: str, record_id: str):
        """Deletes a record from a collection."""
        await self._ensure_admin_auth()
        try:
            await self.client.collection(collection).delete(record_id)
            return True
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to delete record from PocketBase.",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                response=e.response.text
            )
            return False

    async def health_check(self):
        """Checks the health of the PocketBase service."""
        try:
            response = await self.client.health.check()
            return response.get("code") == 200
        except Exception as e:
            logger.error("PocketBase health check failed.", error=str(e))
            return False

# Create a single, reusable instance of the client
pb_client = PocketBaseClient()