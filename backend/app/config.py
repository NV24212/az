from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Load settings from a .env file.
    # The `extra='ignore'` option prevents errors if there are
    # extra environment variables not defined in this model.
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    DATABASE_URL: str
    ADMIN_PASSWORD: str
    AZHAR_ADMIN_EMAIL: str
    CORS_ORIGINS: str = "https://beta.azhar.store"

    # JWT settings
    SECRET_KEY: str = "a_very_secret_key"  # Should be overridden in .env for production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

# Create a single, reusable instance of the settings
settings = Settings()
