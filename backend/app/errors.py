from fastapi import HTTPException, status
import httpx

def handle_pocketbase_error(e: Exception):
    """
    Translates PocketBase SDK errors into FastAPI HTTPExceptions.
    """
    if isinstance(e, httpx.HTTPStatusError):
        # Extract the PocketBase-specific error details if available
        pb_error_data = e.response.json().get("data", {})
        detail = pb_error_data.get("message", "An unknown PocketBase error occurred.")

        # Map PocketBase status codes to appropriate FastAPI status codes
        if e.response.status_code == 400:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
        if e.response.status_code == 401:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized: " + detail)
        if e.response.status_code == 403:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: " + detail)
        if e.response.status_code == 404:
            # Distinguish between a missing collection and a missing record
            if "collection" in detail.lower():
                 raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database error: A required collection is missing.")
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    # Fallback for unexpected errors
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An internal server error occurred: {str(e)}")