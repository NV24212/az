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