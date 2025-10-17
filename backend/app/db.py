import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv
from .models import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL set for the connection")

# Ensure the URL uses the asyncpg driver and is a transaction-level Supabase URL
if not DATABASE_URL.startswith("postgresql+asyncpg://"):
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    else:
        raise ValueError("DATABASE_URL must be a valid PostgreSQL connection string")

if "pooler.supabase.com" not in DATABASE_URL:
    raise ValueError("Please use the transaction-level Supabase URL for the connection pooler.")



# The `connect_args={"statement_cache_size": 0}` is required to disable
# prepared statement caching, which is not supported by pgbouncer.
# For this to work, the DATABASE_URL must be the "Transaction Pooler"
# connection string from the Supabase dashboard.
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"statement_cache_size": 0}
)

AsyncSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session