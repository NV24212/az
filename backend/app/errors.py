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