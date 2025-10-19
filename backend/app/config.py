from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Load settings from a .env file.
    # The `extra='ignore'` option prevents errors if there are
    # extra environment variables not defined in this model.
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    CORS_ORIGINS: str = "*"

    # PocketBase settings
    POCKETBASE_URL: str
    POCKETBASE_ADMIN_EMAIL: str
    POCKETBASE_ADMIN_PASSWORD: str

    # Admin auth (single password login for frontend)
    AZHAR_ADMIN_INITIAL_PASSWORD: str | None = None
    AZHAR_ADMIN_EMAIL: str | None = None

    # JWT settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

# Create a single, reusable instance of the settings
settings = Settings()
