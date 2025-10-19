"""
A stateless, refactored PocketBase client designed for use with
FastAPI's dependency injection system.

This implementation includes compatibility logic so it can call the
installed PocketBase SDK methods regardless of whether they expect
'query_params', 'params', or plain kwargs for query parameters.
"""
from pocketbase import PocketBase
from typing import Optional, Dict, Any
import structlog
import inspect
import httpx

# Use a relative import for the shared error handler
from .errors import handle_pocketbase_error
from pocketbase.models.errors import PocketBaseBadRequestError, PocketBaseError

logger = structlog.get_logger(__name__)


async def _call_with_compatible_params(func, params: Optional[Dict[str, Any]]):
    """
    Call a PocketBase SDK function (usually async) with the appropriate
    argument style depending on what the installed SDK expects.

    Tries, in order:
    1. call(func, query_params=params)
    2. call(func, params=params)
    3. call(func, **params)  # pass as kwargs (e.g. expand="...", fields="...")
    4. call(func, params)    # positional single-arg (less common)
    """
    params = params or {}

    sig = inspect.signature(func)
    param_names = sig.parameters.keys()

    # Try the common keyword names first
    if "query_params" in param_names:
        return await func(query_params=params)
    if "params" in param_names:
        return await func(params=params)

    # Otherwise, try to pass params as kwargs (expand=..., fields=..., etc.)
    if params:
        try:
            return await func(**params)
        except TypeError:
            # fallthrough to try positional if that exists
            pass

    # As last resort, try calling the function without params
    try:
        return await func()
    except TypeError:
        # Nothing worked; re-raise so the outer except can handle it
        raise


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
        Compatible with different PocketBase SDK parameter names.
        """
        try:
            crud = self.client.collection(collection)
            func = getattr(crud, "get_full_list", None)
            if func is None:
                raise RuntimeError("PocketBase CRUD service does not expose 'get_full_list'")
            records = await _call_with_compatible_params(func, params)
            logger.info("Full list retrieved", collection=collection, count=len(records))
            return records
        except Exception as e:
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
        Compatible with SDKs that accept params/query_params or kwargs.
        """
        try:
            crud = self.client.collection(collection)
            func = getattr(crud, "get_list")
            # Many SDKs expect (page, per_page, query_params=...)
            sig = inspect.signature(func)
            if "query_params" in sig.parameters:
                return await func(page, per_page, query_params=(params or {}))
            if "params" in sig.parameters:
                return await func(page, per_page, params=params or {})
            # fallback: try kwargs for page/per_page + params expansion
            if params:
                try:
                    return await func(page, per_page, **params)
                except TypeError:
                    pass
            # last resort: call with page and per_page only
            return await func(page, per_page)
        except Exception as e:
            handle_pocketbase_error(e)


    async def get_record(
        self,
        collection: str,
        record_id: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Get a single record by ID. Returns None if not found.
        Compatible with SDK differences in query parameter naming.
        """
        try:
            crud = self.client.collection(collection)
            func = getattr(crud, "get_one", None) or getattr(crud, "get_record", None)
            if func is None:
                raise RuntimeError("PocketBase CRUD service does not expose 'get_one' or 'get_record'")

            sig = inspect.signature(func)
            if "query_params" in sig.parameters:
                record = await func(record_id, query_params=(params or {}))
            elif "params" in sig.parameters:
                record = await func(record_id, params=params or {})
            else:
                try:
                    record = await func(record_id, **(params or {}))
                except TypeError:
                    record = await func(record_id)

            return record
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning("Record not found", collection=collection, record_id=record_id)
                return None
            handle_pocketbase_error(e)
        except Exception as e:
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
            handle_pocketbase_error(e)

    async def health_check(self) -> bool:
        """
        Pings the PocketBase health endpoint.

        Returns:
            bool: True if the PocketBase instance is responsive and healthy.
        """
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
            if isinstance(e, PocketBaseBadRequestError):
                name_error_data = e.data.get('data', {}).get('name', {})
                if name_error_data.get('code') == 'validation_collection_name_exists':
                    logger.warning("Collection already exists, skipping creation.", collection_name=schema.get("name"))
                    return
            handle_pocketbase_error(e)
