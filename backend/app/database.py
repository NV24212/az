from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from .config import settings

# The `NullPool` class is used to disable SQLAlchemy's connection pooling,
# which is necessary when using an external connection pooler like PgBouncer.
# The `statement_cache_size=0` argument is recommended for PgBouncer
# to prevent errors related to prepared statements.
engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    poolclass=NullPool,
    connect_args={"statement_cache_size": 0}
)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session