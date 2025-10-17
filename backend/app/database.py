from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.engine.url import make_url
from .config import settings

# We use `make_url` to create a mutable URL object, allowing us to
# robustly set the async driver without relying on fragile string replacement.
db_url = make_url(settings.DATABASE_URL)
db_url = db_url.set(drivername="postgresql+asyncpg")

# When connecting directly to PostgreSQL, we use SQLAlchemy's default,
# efficient connection pool.
engine = create_async_engine(db_url)

SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session

import os

async def run_migrations():
    """
    Connects to the database and executes the SQL commands from migrations.sql.
    """
    # Construct the path to the migrations file relative to this script's location
    # This is more robust than assuming the script is run from the project root.
    migrations_file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'migrations.sql')

    async with engine.begin() as conn:
        with open(migrations_file_path, 'r') as f:
            await conn.exec_driver_sql(f.read())