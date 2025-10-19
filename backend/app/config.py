from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    CORS_ORIGINS: str = "*"
    SUPABASE_URL: str
    SUPABASE_KEY: str
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()
