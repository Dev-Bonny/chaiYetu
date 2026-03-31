import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # FastAPI Settings
    APP_NAME: str = "ChaiYetu ML Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Server Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # MongoDB Settings
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/chaiyetu")
    MONGODB_DB: str = os.getenv("MONGODB_DB", "chaiyetu")
    
    # Redis Settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Backend API
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:5000")
    
    # Model Settings
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./data/models")
    DATA_DIR: str = os.getenv("DATA_DIR", "./data/processed")
    
    # Feature Settings
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    
    # Training Settings
    TRAINING_DAYS: int = int(os.getenv("TRAINING_DAYS", "365"))
    PREDICTION_DAYS: int = int(os.getenv("PREDICTION_DAYS", "30"))
    
    # Model Parameters
    WEIGHT_PREDICTION_SEQUENCE_LENGTH: int = 30
    PAYMENT_PREDICTION_SEQUENCE_LENGTH: int = 90
    LSTM_UNITS: int = 50
    DROPOUT_RATE: float = 0.2
    LEARNING_RATE: float = 0.001

settings = Settings()