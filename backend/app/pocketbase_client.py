"""
Fixed pocketbase_client.py for pocketbase-async==0.12.0

Key differences from JS SDK:
1. No auth_store attribute - the library manages auth differently
2. Admin authentication is done via client.admins.auth.with_password()
3. User authentication is done via client.collection('users').auth.with_password()
4. Authentication is namespaced under .auth
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
        The pocketbase-async library doesn't have auth_store,
        so we track authentication state manually.
        """
        if not self._admin_authenticated:
            try:
                # Admin authentication in pocketbase-async
                await self.client.admins.auth.with_password(
                    self.admin_email,
                    self.admin_password
                )
                self._admin_authenticated = True
                logger.info("Successfully authenticated with PocketBase as admin.")
            except httpx.HTTPStatusError as e:
                logger.error(
                    "Failed to authenticate with PocketBase as admin.",
                    status_code=e.response.status_code,
                    response=e.response.text
                )
                raise
            except Exception as e:
                logger.error("An unexpected error occurred during admin authentication.", error=str(e))
                raise

    async def authenticate_user(self, collection: str, email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate a user from a specific collection.

        Args:
            collection: Name of the auth collection (e.g., 'users')
            email: User's email address
            password: User's password

        Returns:
            dict: Authentication data including token and user info

        Raises:
            httpx.HTTPStatusError: If authentication fails
        """
        try:
            # User authentication is done through collection.auth.with_password
            auth_data = await self.client.collection(collection).auth.with_password(
                email,
                password
            )
            return auth_data
        except httpx.HTTPStatusError as e:
            logger.error(
                "User authentication failed.",
                status_code=e.response.status_code,
                response=e.response.text
            )
            raise
        except Exception as e:
            logger.error("An unexpected error occurred during user authentication.", error=str(e))
            raise

    async def get_record(self, collection: str, record_id: str) -> Optional[Dict[str, Any]]:
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
                logger.warn("Record not found.", collection=collection, record_id=record_id)
                return None
            logger.error(
                "Failed to fetch record from PocketBase.",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                response=e.response.text
            )
            raise
        except Exception as e:
            logger.error("An unexpected error occurred while fetching a record.", error=str(e))
            raise

    async def get_records(
        self,
        collection: str,
        page: int = 1,
        per_page: int = 50,
        filter_query: Optional[str] = None,
        sort: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get multiple records from a collection with pagination.

        Args:
            collection: Name of the collection
            page: Page number (default: 1)
            per_page: Number of records per page (default: 50)
            filter_query: Optional filter query string
            sort: Optional sort parameter

        Returns:
            dict: Paginated list of records
        """
        await self._ensure_admin_auth()

        try:
            # Build query parameters
            params = {
                'page': page,
                'perPage': per_page
            }
            if filter_query:
                params['filter'] = filter_query
            if sort:
                params['sort'] = sort

            records = await self.client.collection(collection).get_list(
                page=page,
                per_page=per_page,
                query_params=params
            )
            return records
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to list records from PocketBase.",
                collection=collection,
                status_code=e.response.status_code,
                response=e.response.text
            )
            raise
        except Exception as e:
            logger.error("An unexpected error occurred while listing records.", error=str(e))
            raise

    async def create_record(self, collection: str, data: Dict[str, Any]) -> Dict[str, Any]:
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
            return record
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to create record in PocketBase.",
                collection=collection,
                status_code=e.response.status_code,
                response=e.response.text
            )
            raise
        except Exception as e:
            logger.error("An unexpected error occurred while creating a record.", error=str(e))
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
            return record
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to update record in PocketBase.",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                response=e.response.text
            )
            raise
        except Exception as e:
            logger.error("An unexpected error occurred while updating a record.", error=str(e))
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
            return True
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to delete record from PocketBase.",
                collection=collection,
                record_id=record_id,
                status_code=e.response.status_code,
                response=e.response.text
            )
            raise
        except Exception as e:
            logger.error("An unexpected error occurred while deleting a record.", error=str(e))
            raise

    async def get_full_list(
        self,
        collection: str,
        batch_size: int = 200,
        filter_query: Optional[str] = None,
        sort: Optional[str] = None
    ) -> list:
        """
        Get all records from a collection (auto-paginated).

        Args:
            collection: Name of the collection
            batch_size: Number of records to fetch per batch
            filter_query: Optional filter query string
            sort: Optional sort parameter

        Returns:
            list: All records from the collection
        """
        await self._ensure_admin_auth()

        try:
            params = {'batch': batch_size}
            if filter_query:
                params['filter'] = filter_query
            if sort:
                params['sort'] = sort

            records = await self.client.collection(collection).get_full_list(
                batch=batch_size,
                query_params=params
            )
            return records
        except httpx.HTTPStatusError as e:
            logger.error(
                "Failed to get full list from PocketBase.",
                collection=collection,
                status_code=e.response.status_code,
                response=e.response.text
            )
            raise
        except Exception as e:
            logger.error("An unexpected error occurred while getting a full list.", error=str(e))
            raise


# Create a single, reusable instance of the client
pb_client = PocketBaseClient()