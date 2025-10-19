from sqlmodel import create_engine, SQLModel, Session
from .config import settings

# The database URL is taken from the environment variables via the settings object
DATABASE_URL = settings.DATABASE_URL

# Create the database engine.
# The `echo=True` argument is useful for debugging, as it logs all SQL statements.
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """
    Creates the database and all the tables defined by SQLModel models.
    This is typically called once on application startup.
    """
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    Dependency to get a database session for a single request.
    The `with` statement ensures the session is always closed, even if there are exceptions.
    """
    with Session(engine) as session:
        yield session
