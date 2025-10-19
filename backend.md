# Backend Source Code

## `backend/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router, admin_router
from app.config import settings
from app.logging_config import setup_logging
from app.dependencies import get_pocketbase_admin_client
from app.collection_schemas import PRODUCTS_SCHEMA, CATEGORIES_SCHEMA
from app.errors import global_exception_handler
from app.seeding import seed_database
import asyncio

setup_logging()

app = FastAPI(title="AzharStore API", version="0.1.0")

# Register the global exception handler
app.add_exception_handler(Exception, global_exception_handler)

@app.on_event("startup")
async def ensure_collections_exist():
    """
    On application startup, connect to PocketBase and ensure that the
    necessary collections exist.
    """
    pb_client_generator = get_pocketbase_admin_client()
    pb_client = await anext(pb_client_generator)

    await pb_client.create_collection(CATEGORIES_SCHEMA)
    await pb_client.create_collection(PRODUCTS_SCHEMA)
    await seed_database(pb_client)

# Determine the allowed origins for CORS based on the settings.
# For local development and debugging, it's often useful to allow all origins.
# In a production environment, this should be a comma-separated list of specific domains.
if not settings.CORS_ORIGINS or settings.CORS_ORIGINS == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"name": "AzharStore API", "status": "ok", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.head("/health", status_code=200)
async def health_head():
    """
    Responds to HEAD requests for health checks from services like Dokploy.
    """
    return None

app.include_router(api_router)
app.include_router(admin_router)
```

## `backend/app/api.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from . import services, schemas
from .dependencies import PBAdminClient
import httpx

# Main router for the API
router = APIRouter(prefix="/api")

# Router for admin-specific endpoints
admin_router = APIRouter(
    prefix="/api/admin",
    dependencies=[Depends(services.get_current_admin_user)]
)

# --- Authentication Endpoint ---
@router.post("/login", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(form_data: schemas.AdminLoginRequest, pb_client: PBAdminClient):
    """
    Logs in an admin by authenticating with PocketBase, then returns a
    FastAPI-specific JWT access token.
    """
    # The dependency injection now handles the admin authentication.
    # We just need to create our own token if the dependency resolved.
    access_token = services.create_access_token(
        data={"sub": form_data.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Public Endpoints ---
@router.get("/status")
async def status_check():
    """Checks the API status and the connection to PocketBase."""
    # This endpoint does not use the admin client dependency to avoid
    # unnecessary authentication calls for a simple health check.
    from .dependencies import get_pocketbase_admin_client
    pb_client = await anext(get_pocketbase_admin_client())
    pocketbase_healthy = await pb_client.health_check()
    return {
        "api": "ok",
        "pocketbase": "healthy" if pocketbase_healthy else "unhealthy"
    }

@router.get("/products", response_model=List[schemas.Product])
async def list_products(pb_client: PBAdminClient):
    """Retrieves a list of all products from PocketBase."""
    return await services.get_products(pb_client)

@router.get("/categories", response_model=List[schemas.Category])
async def list_categories(pb_client: PBAdminClient):
    """Retrieves a list of all product categories from PocketBase."""
    return await services.get_categories(pb_client)

# --- Admin Endpoints ---
@admin_router.get("/status")
async def admin_status_check():
    """Checks the admin API status."""
    return {"api": "admin ok"}

@admin_router.post("/products", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, pb_client: PBAdminClient):
    """Creates a new product in PocketBase."""
    return await services.create_product(pb_client, product.model_dump())

@admin_router.patch("/products/{product_id}", response_model=schemas.Product)
async def update_product(product_id: str, product: schemas.ProductUpdate, pb_client: PBAdminClient):
    """Updates a product in PocketBase."""
    updated_product = await services.update_product(pb_client, product_id, product.model_dump(exclude_unset=True))
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

@admin_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, pb_client: PBAdminClient):
    """Deletes a product from PocketBase."""
    success = await services.delete_product(pb_client, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None

@admin_router.post("/categories", response_model=schemas.Category)
async def create_category(category: schemas.CategoryCreate, pb_client: PBAdminClient):
    """Creates a new category in PocketBase."""
    return await services.create_category(pb_client, category.model_dump())

@admin_router.patch("/categories/{category_id}", response_model=schemas.Category)
async def update_category(category_id: str, category: schemas.CategoryUpdate, pb_client: PBAdminClient):
    """Updates a category in PocketBase."""
    updated_category = await services.update_category(pb_client, category_id, category.model_dump(exclude_unset=True))
    if updated_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category

@admin_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, pb_client: PBAdminClient):
    """Deletes a category from PocketBase."""
    success = await services.delete_category(pb_client, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return None
```

## `backend/app/collection_schemas.py`

```python
CATEGORIES_SCHEMA = {
    "name": "categories",
    "type": "base",
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''", # Changed from None
    "schema": [
        {
            "name": "name",
            "type": "text",
            "required": True,
            "unique": True,
        }
    ]
}

PRODUCTS_SCHEMA = {
    "name": "products",
    "type": "base",
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != ''", # Changed from None
    "schema": [
        {
            "name": "name",
            "type": "text",
            "required": True,
        },
        {
            "name": "description",
            "type": "text",
        },
        {
            "name": "price",
            "type": "number",
            "required": True,
        },
        {
            "name": "stockQuantity",
            "type": "number",
            "required": True,
        },
        {
            "name": "imageUrl",
            "type": "text",
        },
        {
            "name": "categoryId",
            "type": "relation",
            "required": True,
            "options": {
                "collectionId": "categories",
                "cascadeDelete": False,
                "maxSelect": 1,
            }
        }
    ]
}
```

## `backend/app/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Load settings from a .env file.
    # The `extra='ignore'` option prevents errors if there are
    # extra environment variables not defined in this model.
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    CORS_ORIGINS: str = "*"

    # PocketBase settings
    POCKETBASE_URL: str
    POCKETBASE_ADMIN_EMAIL: str
    POCKETBASE_ADMIN_PASSWORD: str

    # JWT settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

# Create a single, reusable instance of the settings
settings = Settings()
```

## `backend/app/dependencies.py`

```python
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
```

## `backend/app/errors.py`

```python
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
```

## `backend/app/logging_config.py`

```python
import logging
import logging.config
import sys
import structlog
import os

def setup_logging():
    """
    Set up structured logging for the application using the standard Python
    logging.config.dictConfig. This is the most reliable method.
    """
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()

    # This configuration correctly integrates structlog with standard logging
    # It ensures that all logs are processed by structlog's processors
    # and rendered as JSON, including tracebacks for exceptions.
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": structlog.stdlib.ProcessorFormatter,
                "processor": structlog.processors.JSONRenderer(),
                "foreign_pre_chain": [
                    structlog.stdlib.add_logger_name,
                    structlog.stdlib.add_log_level,
                    structlog.processors.TimeStamper(fmt="iso"),
                ],
            },
        },
        "handlers": {
            "default": {
                "level": log_level,
                "class": "logging.StreamHandler",
                "formatter": "json",
            },
        },
        "loggers": {
            "": {
                "handlers": ["default"],
                "level": log_level,
                "propagate": True,
            },
        },
    }

    logging.config.dictConfig(config)

    # Configure the structlog wrapper to process logs through the standard
    # logging pipeline that we just configured.
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    print("--- LOGGING HAS BEEN DEFINITIVELY CONFIGURED ---")
```

## `backend/app/pocketbase_client.py`

```python
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
            records = await self.client.collection(collection).get_full_list(**(params or {}))
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
        """
        try:
            records = await self.client.collection(collection).get_list(page, per_page, **(params or {}))
            return records
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
        """
        try:
            record = await self.client.collection(collection).get_one(record_id, **(params or {}))
            return record
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warn("Record not found", collection=collection, record_id=record_id)
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
                    logger.warn("Collection already exists, skipping creation.", collection_name=schema.get("name"))
                    return
            from.errors import handle_pocketbase_error
            handle_pocketbase_error(e)
```

## `backend/app/schemas.py`

```python
from __future__ import annotations
from pydantic import BaseModel, model_validator, ConfigDict
from typing import Dict, Any, Optional

# --- Pydantic Models for Authentication ---
class AdminLoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Schemas for PocketBase Records ---

# Add configuration to handle PocketBase system fields (like created, updated)
# and allow flexible attribute assignment.
class PBDictBase(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)

class CategoryBase(PBDictBase):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = None

class Category(CategoryBase):
    id: str
    collectionId: str
    collectionName: str
    created: str
    updated: str

class ProductBase(PBDictBase):
    name: str
    description: str | None = None
    price: float
    stockQuantity: int
    imageUrl: str | None = None

class ProductCreate(ProductBase):
    categoryId: str

class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stockQuantity: int | None = None
    imageUrl: str | None = None
    categoryId: str | None = None

class Product(ProductBase):
    id: str
    collectionId: str
    collectionName: str
    categoryId: Optional[str] = None
    category: Optional[Category] = None

    @model_validator(mode='before')
    @classmethod
    def move_expand_to_category(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        # Safely extract expand data
        expand_data = data.pop('expand', {}) # <--- Safe, defaults to empty dict

        if expand_data and isinstance(expand_data, dict):
            # The key is the relation field name ('categoryId').
            # Get with .get() for safety
            expanded_category_data = expand_data.get('categoryId') # <--- Use .get()

            if expanded_category_data: # <--- Check if anything was actually found
                if isinstance(expanded_category_data, list):
                    # Should only happen for maxSelect > 1. If it's empty, use None.
                    data['category'] = expanded_category_data[0] if expanded_category_data else None
                else:
                    # If it's a dict (the actual Category record)
                    data['category'] = expanded_category_data
            else:
                # If 'categoryId' key was not in expand_data or its value was None/empty
                data['category'] = None # Explicitly set to None if no expanded category
        else:
            # If there was no 'expand' key or it wasn't a dict
            data['category'] = None # Explicitly set to None

        return data

Product.model_rebuild()
```

## `backend/app/seeding.py`

```python
import structlog
from app.pocketbase_client import PocketBaseClient

logger = structlog.get_logger(__name__)

async def seed_database(pb_client: PocketBaseClient):
    """
    Checks if the database is empty and, if so, populates it with
    sample categories and products.
    """
    try:
        # Check if categories are empty
        existing_categories = await pb_client.get_full_list("categories")
        if not existing_categories:
            logger.info("No categories found. Seeding database with sample data...")

            # Create sample categories
            electronics = await pb_client.create_record("categories", {"name": "Electronics"})
            clothing = await pb_client.create_record("categories", {"name": "Clothing"})
            books = await pb_client.create_record("categories", {"name": "Books"})

            # Create sample products
            await pb_client.create_record("products", {
                "name": "Laptop",
                "description": "A powerful and portable laptop.",
                "price": 1200.00,
                "stockQuantity": 50,
                "imageUrl": "https://example.com/laptop.jpg",
                "categoryId": electronics['id']
            })
            await pb_client.create_record("products", {
                "name": "T-Shirt",
                "description": "A comfortable cotton t-shirt.",
                "price": 25.00,
                "stockQuantity": 200,
                "imageUrl": "https://example.com/tshirt.jpg",
                "categoryId": clothing['id']
            })
            await pb_client.create_record("products", {
                "name": "Programming Book",
                "description": "A book about programming.",
                "price": 50.00,
                "stockQuantity": 100,
                "imageUrl": "https://example.com/book.jpg",
                "categoryId": books['id']
            })
            logger.info("Database seeding complete.")
        else:
            logger.info("Database already contains data. Skipping seeding.")

    except Exception as e:
        logger.error("An error occurred during database seeding.", error=str(e))
```

## `backend/app/services.py`

```python
import structlog
import traceback
from jose import jwt
from datetime import datetime, timedelta, timezone
from .config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .pocketbase_client import PocketBaseClient

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")
logger = structlog.get_logger(__name__)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_admin_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to validate the JWT token and return the user's email.
    Raises HTTPException 401 if the token is invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        return {"email": email}
    except jwt.JWTError:
        raise credentials_exception

async def get_products(pb_client: PocketBaseClient):
    try:
        raw_products = await pb_client.get_full_list("products", params={"expand": "categoryId"})
        logger.info("Raw products retrieved from PocketBase", raw_data=raw_products)
        return raw_products
    except Exception as e:
        logger.error("Error retrieving products in service layer", error=str(e), traceback=traceback.format_exc())
        raise

async def create_product(pb_client: PocketBaseClient, product_data: dict):
    return await pb_client.create_record("products", product_data)

async def update_product(pb_client: PocketBaseClient, product_id: str, product_data: dict):
    return await pb_client.update_record("products", product_id, product_data)

async def delete_product(pb_client: PocketBaseClient, product_id: str):
    return await pb_client.delete_record("products", product_id)

async def get_categories(pb_client: PocketBaseClient):
    try:
        raw_categories = await pb_client.get_full_list("categories")
        logger.info("Raw categories retrieved from PocketBase", raw_data=raw_categories)
        return raw_categories
    except Exception as e:
        logger.error("Error retrieving categories in service layer", error=str(e), traceback=traceback.format_exc())
        raise

async def create_category(pb_client: PocketBaseClient, category_data: dict):
    return await pb_client.create_record("categories", category_data)

async def update_category(pb_client: PocketBaseClient, category_id: str, category_data: dict):
    return await pb_client.update_record("categories", category_id, category_data)

async def delete_category(pb_client: PocketBaseClient, category_id: str):
    return await pb_client.delete_record("categories", category_id)
```
