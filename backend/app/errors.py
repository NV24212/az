from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi import HTTPException
import httpx
import structlog
import traceback
import sys

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
    # Check if the exception is one of the PocketBase exceptions derived from httpx.HTTPStatusError
    if hasattr(e, 'status') and hasattr(e, 'data'):
        # This handles pocketbase.models.errors.* exceptions
        status_code = e.status
        # Use the message from the PocketBase error payload
        detail = e.data.get("message", "An unknown PocketBase error occurred.")

    elif isinstance(e, httpx.HTTPStatusError):
        # Fallback for generic httpx errors
        status_code = e.response.status_code
        try:
            # FIX: Access the JSON data correctly from the httpx response object
            pb_error_data = e.response.json()
            detail = pb_error_data.get("message", "An unknown PocketBase error occurred.")
        except:
            detail = "An unknown PocketBase connection or HTTP error occurred."

    else:
        # Fallback for unexpected non-HTTP errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An internal server error occurred: {str(e)}")


    # Now, map the extracted status_code and detail to the appropriate FastAPI HTTPException

    if status_code == 400:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
    if status_code == 401:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized: " + detail)
    if status_code == 403:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: " + detail)
    if status_code == 404:
        # FIX: Raise a clear 404 Not Found for missing records (the correct REST response)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found or user unauthorized to access it.")

    # Fallback for other 5xx errors (should be rare if not handled globally)
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"PocketBase server error ({status_code}): {detail}")
