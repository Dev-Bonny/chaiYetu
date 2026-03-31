from fastapi import APIRouter, Depends
from datetime import datetime
import psutil
import os

from schemas.health import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        uptime=psutil.Process(os.getpid()).create_time(),
        memory_usage=psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024,  # MB
        service="ml_service"
    )