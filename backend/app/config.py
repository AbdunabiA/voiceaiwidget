from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://voiceai:password@localhost:5432/voiceai"
    GEMINI_API_KEY: str = ""
    GOOGLE_CLOUD_PROJECT: str = ""
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    FREE_PLAN_REQUESTS_PER_MONTH: int = 100
    PRO_PLAN_REQUESTS_PER_MONTH: int = 5000
    BUSINESS_PLAN_REQUESTS_PER_MONTH: int = 50000

    class Config:
        env_file = ".env"


settings = Settings()
