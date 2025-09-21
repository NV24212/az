from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router, admin_router
from app.config import settings

app = FastAPI(title="AzharStore API", version="0.1.0")

# --- DIAGNOSTIC CHANGE: Hardcoding CORS origins for debugging ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://beta.azhar.store",
]
# original_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Using hardcoded list
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