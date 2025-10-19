from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router, admin_router
from app.config import settings
from app.logging_config import setup_logging
from app.errors import global_exception_handler

setup_logging()

app = FastAPI(title="AzharStore API", version="0.1.0")

app.add_exception_handler(Exception, global_exception_handler)

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
    return None

app.include_router(api_router)
app.include_router(admin_router)
