import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .services.database import db
from .api import (
    auth, lost_items, found_items, ai, claims,
    notifications, analytics, heatmap, audit_logs, upload
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TraceBack AI — Multimodal Campus Lost & Found Assistant REST API"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers with /api prefix
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(lost_items.router, prefix=settings.API_PREFIX)
app.include_router(found_items.router, prefix=settings.API_PREFIX)
app.include_router(ai.router, prefix=settings.API_PREFIX)
app.include_router(claims.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(heatmap.router, prefix=settings.API_PREFIX)
app.include_router(audit_logs.router, prefix=settings.API_PREFIX)
app.include_router(upload.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "project": "TraceBack AI",
        "tagline": "Find what you've lost. Prove what is yours.",
        "status": "online",
        "engine": settings.ai_engine_status,
        "api_docs": "/docs"
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "engine": settings.ai_engine_status,
        "is_ai_live": settings.is_ai_live
    }

@app.post("/api/reset-demo")
def reset_demo():
    db.reset_to_seed()
    return {"status": "success", "message": "Demo data reset successfully"}
