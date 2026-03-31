from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List

from schemas.training import (
    TrainingRequest,
    TrainingResponse,
    ModelEvaluationResponse
)
from services.training import TrainingService

router = APIRouter()
training_service = TrainingService()

@router.post("/train", response_model=TrainingResponse)
async def train_models(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train or retrain ML models"""
    try:
        # Run training in background
        background_tasks.add_task(
            training_service.train_models,
            request.training_data,
            request.models
        )
        
        return TrainingResponse(
            status="started",
            message="Model training started in background",
            models=request.models,
            timestamp=request.training_data.get('timestamp')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/models/evaluate", response_model=ModelEvaluationResponse)
async def evaluate_models():
    """Evaluate model performance"""
    try:
        evaluation = await training_service.evaluate_models()
        return evaluation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@router.get("/models/status")
async def get_training_status():
    """Get training status and model versions"""
    try:
        status = await training_service.get_training_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get training status: {str(e)}")