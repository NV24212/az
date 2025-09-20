from fastapi import FastAPI
from app.api import router as api_router, admin_router

app = FastAPI(title="AzharStore API", version="0.1.0")

@app.get("/")
async def root():
    return {"name": "AzharStore API", "status": "ok", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

app.include_router(api_router)
app.include_router(admin_router)