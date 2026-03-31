from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class WeightPredictionRequest(BaseModel):
    farmer_id: str
    historical_data: List[Dict[str, Any]]
    prediction_days: int = 7
    include_confidence: bool = True

class WeightPredictionResponse(BaseModel):
    farmer_id: str
    predicted_weight: float
    confidence: float
    prediction_date: datetime
    factors: Dict[str, Any]
    recommendations: List[str]
    model_version: str

class PaymentPredictionRequest(BaseModel):
    farmer_id: str
    collection_data: List[Dict[str, Any]]
    payment_data: List[Dict[str, Any]]
    prediction_days: int = 30
    include_breakdown: bool = True

class PaymentPredictionResponse(BaseModel):
    farmer_id: str
    predicted_amount: float
    confidence: float
    prediction_date: datetime
    expected_payments: List[Dict[str, Any]]
    factors: Dict[str, Any]
    model_version: str

class PredictionResult(BaseModel):
    farmer_id: str
    prediction_type: str
    predicted_value: float
    confidence: float
    actual_value: Optional[float] = None
    features: Dict[str, Any]
    timestamp: datetime