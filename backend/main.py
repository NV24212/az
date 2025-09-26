from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import router as api_router, admin_router
from app.config import settings
from app.db import get_db, engine
from app.models import Base
from app.services import initialize_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    print("--- Ensuring database schema exists ---")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("--- Initializing default settings ---")
    async for db in get_db():
        await initialize_database(db)
        break # We only need one session to do this
    yield
    # On shutdown
    print("--- Application shutting down ---")
    pass

app = FastAPI(title="AzharStore API", version="0.1.0", lifespan=lifespan)

# Hardcode the allowed origins to ensure stability
origins = [
    "https://beta.azhar.store",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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