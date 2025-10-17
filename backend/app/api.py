import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
logger = structlog.get_logger(__name__)

from . import services, schemas

# Main router for the API
router = APIRouter(prefix="/api")

# Router for admin-specific endpoints
admin_router = APIRouter(prefix="/api/admin")


# --- Authentication Endpoint ---
@admin_router.post("/login", response_model=schemas.Token)
async def login_for_access_token(form_data: schemas.AdminLoginRequest):
    try:
        admin_creds = await services.get_admin_credentials()
        if not services.verify_password(form_data.password, admin_creds["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = services.create_access_token(data={"sub": admin_creds["email"]})
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not find admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --- Public Endpoints ---
@router.get("/status")
async def status_check():
    return {"api": "ok"}

@router.get("/products", response_model=List[schemas.Product])
async def list_products(skip: int = 0, limit: int = 100):
    return await services.get_products(skip=skip, limit=limit)

@router.get("/categories", response_model=List[schemas.Category])
async def list_categories(skip: int = 0, limit: int = 100):
    return await services.get_categories(skip=skip, limit=limit)

# The remaining endpoints will be refactored to use the Supabase client.
# For now, I will leave them as they are and focus on the public endpoints.