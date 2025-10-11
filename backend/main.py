from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import router as api_router, admin_router
from app.config import settings
from app.db import AsyncSessionLocal, engine
from app.models import Base
from app.services import initialize_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    print("--- Ensuring database schema exists ---")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("--- Initializing default settings ---")
    async with AsyncSessionLocal() as session:
        await initialize_database(session)
    yield
    # On shutdown
    print("--- Application shutting down ---")
    pass

app = FastAPI(title="AzharStore API", version="0.1.0", lifespan=lifespan)

@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    session = None
    try:
        session = AsyncSessionLocal()
        request.state.db = session
        response = await call_next(request)
    finally:
        if session:
            await session.close()
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.get("/")
async def root():
    return {"name": "AzharStore API", "status": "ok", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(api_router)
app.include_router(admin_router)