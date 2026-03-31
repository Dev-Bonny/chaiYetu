from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List

from schemas.prediction import (
    WeightPredictionRequest,
    WeightPredictionResponse,
    PaymentPredictionRequest,
    PaymentPredictionResponse,
    PredictionResult
)
from services.prediction import PredictionService

router = APIRouter()
prediction_service = PredictionService()

@router.post("/predict/weight", response_model=WeightPredictionResponse)
async def predict_weight(request: WeightPredictionRequest):
    """Predict tea weight for a farmer"""
    try:
        result = await prediction_service.predict_weight(
            farmer_id=request.farmer_id,
            historical_data=request.historical_data,
            prediction_days=request.prediction_days
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict/payment", response_model=PaymentPredictionResponse)
async def predict_payment(request: PaymentPredictionRequest):
    """Predict payment amount for a farmer"""
    try:
        result = await prediction_service.predict_payment(
            farmer_id=request.farmer_id,
            collection_data=request.collection_data,
            payment_data=request.payment_data,
            prediction_days=request.prediction_days
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict/batch", response_model=Dict[str, Any])
async def predict_batch(background_tasks: BackgroundTasks, farmer_ids: List[str]):
    """Batch prediction for multiple farmers"""
    try:
        # This would run in background for large datasets
        task_id = await prediction_service.start_batch_prediction(farmer_ids)
        return {
            "task_id": task_id,
            "status": "started",
            "message": "Batch prediction started in background"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")