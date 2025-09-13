"""
Application Configuration
Centralized configuration management using Pydantic Settings.
"""

import secrets
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, BaseSettings, PostgresDsn, RedisDsn, validator


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Project Information
    PROJECT_NAME: str = "Real-time Analytics Dashboard"
    PROJECT_VERSION: str = "1.0.0"
    DESCRIPTION: str = "A modern real-time analytics dashboard with interactive charts and live data streaming"
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Configuration
    DATABASE_URL: Optional[PostgresDsn] = None
    ASYNC_DATABASE_URL: Optional[str] = None
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str]) -> str:
        """Assemble database connection string."""
        if v is None:
            return "postgresql://postgres:postgres@localhost:5432/analytics_db"
        return v
    
    @validator("ASYNC_DATABASE_URL", pre=True)
    def assemble_async_db_connection(cls, v: Optional[str], values: dict) -> str:
        """Assemble async database connection string."""
        if v is None:
            db_url = values.get("DATABASE_URL")
            if db_url:
                return db_url.replace("postgresql://", "postgresql+asyncpg://")
            return "postgresql+asyncpg://postgres:postgres@localhost:5432/analytics_db"
        return v
    
    # Redis Configuration
    REDIS_URL: RedisDsn = "redis://localhost:6379"
    REDIS_PASSWORD: Optional[str] = None
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS origins from environment variable."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = None
    
    # WebSocket Configuration
    WS_MAX_CONNECTIONS: int = 100
    WS_HEARTBEAT_INTERVAL: int = 30
    
    # Cache Configuration
    CACHE_TTL: int = 300  # 5 minutes
    CACHE_PREFIX: str = "analytics:"
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    
    # Email Configuration (Optional)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["csv", "json", "xlsx"]
    
    # Background Tasks
    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None
    
    @validator("CELERY_BROKER_URL", pre=True)
    def assemble_celery_broker(cls, v: Optional[str], values: dict) -> str:
        """Assemble Celery broker URL."""
        if v is None:
            redis_url = str(values.get("REDIS_URL", "redis://localhost:6379"))
            return f"{redis_url}/1"
        return v
    
    @validator("CELERY_RESULT_BACKEND", pre=True)
    def assemble_celery_backend(cls, v: Optional[str], values: dict) -> str:
        """Assemble Celery result backend URL."""
        if v is None:
            redis_url = str(values.get("REDIS_URL", "redis://localhost:6379"))
            return f"{redis_url}/2"
        return v
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings instance."""
    return settings
