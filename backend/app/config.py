import os
from typing import Optional
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "TraceBack AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # AI Provider
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    
    # Supabase (Optional cloud sync)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", None)
    SUPABASE_ANON_KEY: Optional[str] = os.getenv("SUPABASE_ANON_KEY", None)
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", None)
    
    # Maps
    MAPBOX_ACCESS_TOKEN: Optional[str] = os.getenv("MAPBOX_ACCESS_TOKEN", None)
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "traceback-super-secret-key-2026")
    
    @property
    def is_ai_live(self) -> bool:
        return bool(self.GEMINI_API_KEY and len(self.GEMINI_API_KEY.strip()) > 10)
    
    @property
    def ai_engine_status(self) -> str:
        if self.is_ai_live:
            return "TraceBack Intelligence • Active Gemini 2.0"
        return "TraceBack Intelligence • Demo Engine"

settings = Settings()
