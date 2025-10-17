from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from .config import settings

from sqlalchemy.engine.url import make_url

# The `NullPool` class is used to disable SQLAlchemy's connection pooling,
# which is necessary when using an external connection pooler like PgBouncer.
# The `statement_cache_size=0` argument is recommended for PgBouncer
# to prevent errors related to prepared statements.
#
# We use `make_url` to create a mutable URL object, allowing us to
# robustly set the async driver without relying on fragile string replacement.
db_url = make_url(settings.DATABASE_URL)
db_url = db_url.set(drivername="postgresql+asyncpg")

# Append the query parameter to disable prepared statements.
# This is a more direct way to ensure asyncpg disables the cache.
db_url_str = str(db_url) + "?statement_cache_size=0"

engine = create_async_engine(
    db_url_str,
    poolclass=NullPool
)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session