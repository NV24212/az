from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import router as api_router, admin_router
from app.config import settings
from app.db import get_db, create_tables
from app.services import initialize_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    await create_tables()
    async for db in get_db():
        await initialize_database(db)
        break
    yield
    # On shutdown
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