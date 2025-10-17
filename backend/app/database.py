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

from sqlalchemy import text

async def run_migrations():
    """
    Connects to the database and executes the SQL commands from migrations.sql.
    """
    migrations_file_path = "migrations.sql"

    async with engine.connect() as conn:
        with open(migrations_file_path, 'r') as f:
            sql_commands = f.read().split(';')
            for command in sql_commands:
                if command.strip():
                    await conn.execute(text(command))
        await conn.commit()