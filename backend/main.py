from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import router as api_router, admin_router
from app.config import settings
from app.db import AsyncSessionLocal, engine
from app.models import Base
from app.services import initialize_database
from app.logging_config import setup_logging

setup_logging()

import time
import structlog

logger = structlog.get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    print("--- Starting up application ---")

    # Database connection check with retry
    for i in range(3):
        try:
            async with engine.connect() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("--- Database connection successful ---")
            break
        except Exception as e:
            print(f"--- Database connection failed (attempt {i+1}/3): {e} ---")
            if i < 2:
                time.sleep(3)
            else:
                raise

    print("--- Initializing default settings ---")
    async with AsyncSessionLocal() as session:
        await initialize_database(session)

    yield

    # On shutdown
    print("--- Application shutting down ---")
    pass

app = FastAPI(title="AzharStore API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://azhar.store",
        "https://beta.azhar.store"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import uuid
import sys

@app.middleware("http")
async def unified_middleware(request: Request, call_next):
    correlation_id = str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

    start_time = time.time()

    session = None
    try:
        session = AsyncSessionLocal()
        request.state.db = session

        response = await call_next(request)

        process_time = time.time() - start_time

        if sys.stdout.isatty():
            logger.info("request", method=request.method, url=str(request.url))
            logger.info("response", status_code=response.status_code, process_time=f"{process_time:.4f}s")
        else:
            logger.info(f"\"{request.method} {request.url}\" {response.status_code}", process_time=f"{process_time:.4f}s")

        return response
    except Exception as e:
        logger.exception("unhandled_exception", exc_info=e)
        raise
    finally:
        if session:
            await session.close()
        structlog.contextvars.clear_contextvars()

@app.get("/")
async def root():
    return {"name": "AzharStore API", "status": "ok", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(api_router)
app.include_router(admin_router)