from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class TrainingRequest(BaseModel):
    training_data: Dict[str, Any]
    models: List[str]
    parameters: Optional[Dict[str, Any]] = None

class TrainingResponse(BaseModel):
    status: str
    message: str
    models: List[str]
    timestamp: Optional[datetime] = None

class ModelMetrics(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape: float
    r2: float
    accuracy: float

class ModelEvaluationResponse(BaseModel):
    weight_model: ModelMetrics
    payment_model: ModelMetrics
    overall_accuracy: float
    evaluation_date: datetime