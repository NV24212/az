from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi import HTTPException
import httpx
import structlog
import traceback
import sys # FIX: Ensure sys is imported
from pocketbase.models.errors import PocketBaseError # <-- New: Import base PB exception

logger = structlog.get_logger(__name__)


async def global_exception_handler(request: Request, exc: Exception):
    """
    A global exception handler to catch all unhandled exceptions, log them
    in a structured format, and return a generic 500 error response.
    Includes a failsafe print statement.
    """
    try:
        # The primary logging method
        logger.error(
            "unhandled_exception",
            error=str(exc),
            traceback=traceback.format_exc(),
            request_method=request.method,
            request_url=str(request.url),
        )
    except Exception as log_exc:
        # Failsafe: If logging fails, print the original exception directly to stderr
        print("--- FAILSAFE: LOGGER FAILED ---", file=sys.stderr)
        print(f"Original Exception: {exc}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        print("--- Logging Exception ---", file=sys.stderr)
        print(f"Logging Exception: {log_exc}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected internal server error occurred."},
    )

def handle_pocketbase_error(e: Exception):
    """
    Translates PocketBase SDK errors into FastAPI HTTPExceptions.
    """

    # 1. Check for PocketBase-specific exceptions (derived from httpx.HTTPStatusError)
    if isinstance(e, PocketBaseError):
        status_code = e.status
        # Use the message from the PocketBase error payload
        detail = e.data.get("message", "An unknown PocketBase error occurred.")

    # 2. Fallback for generic httpx errors (should be rare if PB client is configured)
    elif isinstance(e, httpx.HTTPStatusError):
        status_code = e.response.status_code
        try:
            # Access the JSON data correctly from the httpx response object
            pb_error_data = e.response.json()
            detail = pb_error_data.get("message", "An unknown PocketBase error occurred.")
        except:
            detail = "An unknown PocketBase connection or HTTP error occurred."

    else:
        # Fallback for unexpected non-HTTP errors
        # Note: This should never be reached if all HTTP errors are covered above
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An internal server error occurred: {type(e).__name__}: {str(e)}")


    # 3. Map the extracted status_code and detail to the appropriate FastAPI HTTPException

    if status_code == 400:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
    if status_code == 401:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized: " + detail)
    if status_code == 403:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: " + detail)
    if status_code == 404:
        # Raise a clear 404 Not Found for missing records (the correct REST response) [3]
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found or user unauthorized to access it.")

    # 4. Fallback for 5xx errors
    if status_code >= 500:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"PocketBase Service Error ({status_code}): {detail}")

    # Final generic fallback
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unknown Database Error: {detail}")
