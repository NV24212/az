from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import router as api_router, admin_router
from app.config import settings
from app.logging_config import setup_logging

setup_logging()

import time
import structlog

logger = structlog.get_logger(__name__)

app = FastAPI(title="AzharStore API", version="0.1.0")

# Determine the allowed origins for CORS based on the settings.
# If CORS_ORIGINS is a wildcard "*", then allow all origins.
# Otherwise, it's expected to be a comma-separated string of URLs.
if settings.CORS_ORIGINS == "*":
    allow_origins = ["*"]
    allow_origin_regex = None
else:
    allow_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    # To be more secure, you could also implement a regex to validate the origins.
    # For example: r"https://.*\.azhar\.store"
    allow_origin_regex = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
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

app.include_router(api_router)
app.include_router(admin_router)