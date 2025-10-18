"""
A stateless, refactored PocketBase client designed for use with
FastAPI's dependency injection system.
"""
from pocketbase import PocketBase
from typing import Optional, Dict, Any
import structlog
# Import necessary error classes and handler function
import httpx
from.errors import handle_pocketbase_error
from pocketbase.models.errors import PocketBaseBadRequestError, PocketBaseError

logger = structlog.get_logger(__name__)

class PocketBaseClient:
    def __init__(self, client: PocketBase):
        self.client = client

    async def get_full_list(
        self,
        collection: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> list:
        """
        Get all records from a collection (auto-paginated).
        """
        try:
            records = await self.client.collection(collection).get_full_list(query_params=params or {})
            logger.info("Full list retrieved", collection=collection, count=len(records))
            return records
        except Exception as e:
            # FIX: Catch all exceptions and translate them immediately
            handle_pocketbase_error(e)

    async def get_list(
        self,
        collection: str,
        page: int = 1,
        per_page: int = 30,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Get a paginated list of records from a collection.
        """
        try:
            records = await self.client.collection(collection).get_list(page, per_page, query_params=params or {})
            return records
        except Exception as e:
            # FIX: Catch all exceptions and translate them immediately
            handle_pocketbase_error(e)


    async def get_record(
        self,
        collection: str,
        record_id: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Get a single record by ID. Returns None if not found.
        """
        try:
            record = await self.client.collection(collection).get_one(record_id, params or {})
            return record
        except httpx.HTTPStatusError as e:
            # FIX: Use explicit httpx exception handling
            if e.response.status_code == 404:
                logger.warn("Record not found", collection=collection, record_id=record_id)
                return None

            # If it's another error (400, 403, 500), translate it
            handle_pocketbase_error(e)
        except Exception as e:
            # Catch other unexpected errors and re-raise after translation attempt
            handle_pocketbase_error(e)


    async def create_record(
        self,
        collection: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Create a new record.
        """
        try:
            record = await self.client.collection(collection).create(data)
            logger.info("Record created", collection=collection, record_id=record.get('id'))
            return record
        except Exception as e:
            # FIX: Catch all exceptions and translate them immediately
            handle_pocketbase_error(e)


    async def update_record(
        self,
        collection: str,
        record_id: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Update a record by ID.
        """
        try:
            record = await self.client.collection(collection).update(record_id, data)
            logger.info("Record updated", collection=collection, record_id=record_id)
            return record
        except Exception as e:
            # FIX: Catch all exceptions and translate them immediately
            handle_pocketbase_error(e)


    async def delete_record(self, collection: str, record_id: str) -> bool:
        """
        Delete a record by ID.
        """
        try:
            await self.client.collection(collection).delete(record_id)
            logger.info("Record deleted", collection=collection, record_id=record_id)
            return True
        except Exception as e:
            # FIX: Catch all exceptions and translate them immediately
            handle_pocketbase_error(e)

    async def health_check(self) -> bool:
        """
        Pings the PocketBase health endpoint.

        Returns:
            bool: True if the PocketBase instance is responsive and healthy.
        """
        # (No change here, as health checks are typically handled separately)
        try:
            response = await self.client.health.check()
            return response.get("code") == 200
        except Exception as e:
            logger.error("PocketBase health check failed", error=str(e))
            return False

    async def create_collection(self, schema: Dict[str, Any]):
        """
        Creates a new collection from a schema.
        """
        try:
            await self.client.collections.create(schema)
            logger.info("Collection created successfully", collection_name=schema.get("name"))
        except Exception as e:
            # FIX 1: Explicitly handle the expected "already exists" error during startup.
            if isinstance(e, PocketBaseBadRequestError):
                error_detail = e.data.get("message", "") # Use e.data to access the JSON error structure
                # Check for the PocketBase internal error message
                if "name must be unique" in error_detail.lower():
                    logger.warn("Collection already exists, skipping creation.", collection_name=schema.get("name"))
                    return # SUCCESS: Exit cleanly without raising an exception

            # FIX 2: For any other unhandled error (like a bad schema definition),
            # fall back to the generic PocketBase error handler.
            from.errors import handle_pocketbase_error
            handle_pocketbase_error(e)
