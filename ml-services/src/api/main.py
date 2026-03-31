from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
from datetime import datetime
import logging

from config.settings import settings
from api.v1.routes import prediction, training, health

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/ml_service.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        debug=settings.DEBUG,
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Add middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure for production
    )

    # Include routers
    application.include_router(health.router, prefix="/api/v1", tags=["Health"])
    application.include_router(prediction.router, prefix="/api/v1", tags=["Predictions"])
    application.include_router(training.router, prefix="/api/v1", tags=["Training"])

    return application

app = create_application()

@app.on_event("startup")
async def startup_event():
    logger.info("Starting ChaiYetu ML Service...")
    # Initialize models and services
    from services.prediction import PredictionService
    from services.training import TrainingService
    
    # Warm up models
    try:
        prediction_service = PredictionService()
        await prediction_service.initialize_models()
        logger.info("Models initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize models: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down ChaiYetu ML Service...")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )