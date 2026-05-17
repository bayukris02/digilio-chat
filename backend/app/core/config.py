import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digilio AI-Agentic ERP"
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "digilio_admin")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "digilio_secure_password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "digilio_erp")
    # Using 'localhost' for development, but could be 'db' if running inside docker network
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost") 
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
