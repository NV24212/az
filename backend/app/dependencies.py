from fastapi import Depends, HTTPException, status
from pocketbase import PocketBase
import httpx
from typing import Annotated
from .config import settings
from .pocketbase_client import PocketBaseClient

async def get_pocketbase_admin_client() -> PocketBaseClient:
    """
    Dependency that provides an admin-authenticated PocketBase client
    for a single request.
    """
    try:
        client = PocketBase(settings.POCKETBASE_URL)
        await client.collection("_superusers").auth.with_password(
            settings.POCKETBASE_ADMIN_EMAIL, settings.POCKETBASE_ADMIN_PASSWORD
        )
        yield PocketBaseClient(client)
    except httpx.HTTPStatusError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not authenticate with the database service."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred with the database service: {str(e)}"
        )

PBAdminClient = Annotated[PocketBaseClient, Depends(get_pocketbase_admin_client)]