from pydantic import BaseModel
from datetime import datetime

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    uptime: float
    memory_usage: float
    service: str