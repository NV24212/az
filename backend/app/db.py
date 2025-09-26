import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from fastapi import Request
from .models import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL set for the connection")

# Ensure the URL uses the asyncpg driver
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# The statement_cache_size=0 is required for compatibility with pgbouncer
# on services like Supabase.
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    connect_args={"statement_cache_size": 0}
)
AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# New dependency to get the DB session from the request state
def get_db(request: Request) -> AsyncSession:
    """
    FastAPI dependency that retrieves the session from the request state.
    The session is managed by the db_session_middleware.
    """
    return request.state.db