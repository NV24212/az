"""
Fixed pocketbase_client.py for pocketbase-async==0.12.0

CRITICAL CORRECTION:
- Admin authentication is done via the "_superusers" collection, NOT via client.admins
- The pattern is: client.collection("_superusers").auth.with_password()
- Regular users use: client.collection("users").auth.with_password()
"""

from pocketbase import PocketBase
import httpx
from .config import settings
from typing import Optional, Dict, Any
import structlog

logger = structlog.get_logger(__name__)


class PocketBaseClient:
    def __init__(self):
        self.url = settings.POCKETBASE_URL
        self.admin_email = settings.POCKETBASE_ADMIN_EMAIL
        self.admin_password = settings.POCKETBASE_ADMIN_PASSWORD
        self.client = PocketBase(self.url)
        self._admin_authenticated = False

    async def _ensure_admin_auth(self):
        """
        Ensure admin is authenticated before making requests.

        IMPORTANT: In PocketBase, admins (superusers) authenticate via the
        special "_superusers" collection, not through a separate admins API.
        """
        if not self._admin_authenticated:
            try:
                # Authenticate as superuser using the _superusers collection
                await self.client.collection("_superusers").auth.with_password(
                    self.admin_email,
                    self.admin_password
                )
                self._admin_authenticated = True
                logger.info("Admin authentication successful", email=self.admin_email)
            except httpx.HTTPStatusError as e:
                logger.error(
                    "Admin authentication failed",
                    status_code=e.response.status_code,
                    error=e.response.text
                )
                raise
            except Exception as e:
                logger.error("An unexpected error occurred during admin authentication.", error=str(e))
                raise

    async def health_check(self) -> bool:
        """
        Pings the PocketBase health endpoint.

        Returns:
            bool: True if the PocketBase instance is responsive and healthy.
        """
        try:
            # PocketBase has a dedicated health check endpoint: /api/health
            # The python-pocketbase client provides a direct method for this.
            response = await self.client.health.check()
            return response.get("code") == 200
        except Exception as e:
            logger.error("PocketBase health check failed", error=str(e))
            return False

    async def authenticate_user(
        self,
        collection: str,
        email: str,
        password: str
    ) -> Dict[str, Any]:
        """
        Authenticate a regular user from a specific auth collection.

        Args:
            collection: Name of the auth collection (e.g., 'users')
            email: User's email address
            password: User's password

        Returns:
            dict: Authentication data including token and user info
        """
        try:
            auth_data = await self.client.collection(collection).auth.with_password(
                email,
                password
            )
            logger.info("User authentication successful", collection=collection, email=email)
            return auth_data
        except httpx.HTTPStatusError as e:
            logger.error(
                "User authentication failed",
                collection=collection,
                status_code=e.response.status_code,
                error=e.response.text
            )
            raise
        except Exception as e:
            logger.error("Unexpected error during user authentication", error=str(e))
            raise

    async def get_record(
        self,
        collection: str,
        record_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a single record from a collection.

        Args:
            collection: Name of the collection
            record_id: ID of the record to retrieve

        Returns:
            dict: The record data, or None if not found
        """
        await self._ensure_admin_auth()

        try:
            record = await self.client.collection(collection).get_one(record_id)
            return record
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning("Record not found", collection=collection, record_id=record_id)
                return None
            logger.error("Error fetching record", error=e.response.text)
            raise
        except Exception as e:
            logger.error("Unexpected error fetching record", error=str(e))
            raise

    async def get_records(
        self,
        collection: str,
        page: int = 1,
        per_page: int = 50,
        filter_query: Optional[str] = None,
        sort: Optional[str] = None,
        expand: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get multiple records from a collection with pagination.

        Args:
            collection: Name of the collection
            page: Page number (default: 1)
            per_page: Number of records per page (default: 50)
            filter_query: Optional filter query string
            sort: Optional sort parameter (e.g., "-created,title")
            expand: Optional expand parameter for relations

        Returns:
            dict: Paginated list of records with metadata
        """
        await self._ensure_admin_auth()

        try:
            # Build query parameters
            params = {}
            if filter_query:
                params['filter'] = filter_query
            if sort:
                params['sort'] = sort
            if expand:
                params['expand'] = expand

            records = await self.client.collection(collection).get_list(
                page, per_page, params
            )
            return records
        except httpx.HTTPStatusError as e:
            logger.error(
                "Error listing records",
                collection=collection,
                status_code=e.response.status_code,
                error=e.response.text
            )
            raise
        except Exception as e:
            logger.error("Unexpected error listing records", error=str(e))
            raise

    async def create_record(
        self,
        collection: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a new record in a collection.

        Args:
            collection: Name of the collection
            data: Record data to create

        Returns:
            dict: The created record
        """
        await self._ensure_admin_auth()

        try:
            record = await self.client.collection(collection).create(data)
            logger.info("Record created", collection=collection, record_id=record.get('id'))
            return record
        except httpx.HTTPStatusError as e:
            logger.error(
                "Error creating record",
                collection=collection,
                status_code=e.response.status_code,
                error=e.response.text
            )
            raise
        except Exception as e:
            logger.error("Unexpected error creating record", error=str(e))
            raise

    async def update_record(
        self,
        collection: str,
        record_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update an existing record.

        Args:
            collection: Name of the collection
            record_id: ID of the record to update
            data: Updated record data

        Returns:
            dict: The updated record
        """
        await self._ensure_admin_auth()

        try:
            record = await self.client.collection(collection).update(record_id, data)
            logger.info("Record updated", collection=collection, record_id=record_id)
            return record
        except httpx.HTTPStatusError as e:
            logger.error(
                "Error updating record",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                error=e.response.text
            )
            raise
        except Exception as e:
            logger.error("Unexpected error updating record", error=str(e))
            raise

    async def delete_record(self, collection: str, record_id: str) -> bool:
        """
        Delete a record from a collection.

        Args:
            collection: Name of the collection
            record_id: ID of the record to delete

        Returns:
            bool: True if deletion was successful
        """
        await self._ensure_admin_auth()

        try:
            await self.client.collection(collection).delete(record_id)
            logger.info("Record deleted", collection=collection, record_id=record_id)
            return True
        except httpx.HTTPStatusError as e:
            logger.error(
                "Error deleting record",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                error=e.response.text
            )
            raise
        except Exception as e:
            logger.error("Unexpected error deleting record", error=str(e))
            raise

    async def get_full_list(
        self,
        collection: str,
        filter_query: Optional[str] = None,
        sort: Optional[str] = None,
        expand: Optional[str] = None
    ) -> list:
        """
        Get all records from a collection (auto-paginated).

        Note: The batch size is handled automatically by the SDK (200 items per request by default).

        Args:
            collection: Name of the collection
            filter_query: Optional filter query string
            sort: Optional sort parameter
            expand: Optional expand parameter for relations

        Returns:
            list: All records from the collection
        """
        await self._ensure_admin_auth()

        try:
            # Build query parameters dictionary
            params = {}
            if filter_query:
                params['filter'] = filter_query
            if sort:
                params['sort'] = sort
            if expand:
                params['expand'] = expand

            # get_full_list() accepts a parameters dictionary directly
            records = await self.client.collection(collection).get_full_list(
                params
            )
            logger.info("Full list retrieved", collection=collection, count=len(records))
            return records
        except httpx.HTTPStatusError as e:
            logger.error(
                "Error getting full list",
                collection=collection,
                status_code=e.response.status_code,
                error=e.response.text
            )
            raise
        except Exception as e:
            logger.error("Unexpected error getting full list", error=str(e))
            raise


# Create a single, reusable instance of the client
pb_client = PocketBaseClient()