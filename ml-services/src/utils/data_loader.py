import sys
import os

# --- PATH FIX: Add the parent 'src' directory to Python's search path ---
current_dir = os.path.dirname(os.path.abspath(__file__)) # src/utils
parent_dir = os.path.dirname(current_dir)                # src
sys.path.append(parent_dir)
# ----------------------------------------------------------------------
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from pymongo import MongoClient
import redis
import json

from config.settings import settings

logger = logging.getLogger(__name__)

class DataLoader:
    def __init__(self):
        self.mongo_client = None
        self.redis_client = None
        self.db = None

    def get_mongo_client(self):
        """Get MongoDB client with connection pooling"""
        if self.mongo_client is None:
            try:
                self.mongo_client = MongoClient(settings.MONGODB_URI)
                self.db = self.mongo_client[settings.MONGODB_DB]
                logger.info("MongoDB connection established")
            except Exception as e:
                logger.error(f"MongoDB connection failed: {e}")
        return self.db

    def get_redis_client(self):
        """Get Redis client"""
        if self.redis_client is None:
            try:
                self.redis_client = redis.from_url(settings.REDIS_URL)
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Redis connection failed: {e}")
        return self.redis_client

    async def get_farmer_historical_data(self, farmer_id: str, days: int = 90) -> pd.DataFrame:
        """Get historical data for a farmer"""
        try:
            db = self.get_mongo_client()
            if db is None:
                return pd.DataFrame()

            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            collections = db.collections.find({
                'farmer': farmer_id,
                'collectionDate': {'$gte': cutoff_date},
                'status': 'verified'
            }).sort('collectionDate', 1)

            data = []
            for collection in collections:
                data.append({
                    'date': collection['collectionDate'],
                    'weight': collection['weight'],
                    'quality': collection['quality'],
                    'price': collection.get('pricePerKg', 0),
                    'amount': collection.get('totalAmount', 0),
                    'location': collection.get('location', {})
                })

            return pd.DataFrame(data)
            
        except Exception as e:
            logger.error(f"Failed to load historical data for farmer {farmer_id}: {e}")
            return pd.DataFrame()

    async def get_training_data(self, days: int = 365) -> Dict[str, Any]:
        """Get comprehensive raw data (legacy method)"""
        try:
            db = self.get_mongo_client()
            if db is None:
                return {}

            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            collections = list(db.collections.find({
                'collectionDate': {'$gte': cutoff_date},
                'status': 'verified'
            }))
            
            payments = list(db.payments.find({
                'paymentDate': {'$gte': cutoff_date},
                'status': 'completed'
            }))
            
            farmers = list(db.farmers.find({
                'status': 'active'
            }))

            return {
                'collections': collections,
                'payments': payments,
                'farmers': farmers,
                'timestamp': datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Failed to load training data: {e}")
            return {}

    async def fetch_model_training_data(self) -> pd.DataFrame:
        """
        Fetch and merge Weather and Collection data for ML Model Training.
        Returns a flattened Pandas DataFrame.
        """
        try:
            db = self.get_mongo_client()
            if db is None:
                return pd.DataFrame()

            logger.info("Starting extraction of training data...")

            # 1. Fetch Collections (Target Variable)
            # Group by Date to get total daily yield across the region
            pipeline = [
                {
                    "$group": {
                        "_id": { 
                            "$dateToString": { "format": "%Y-%m-%d", "date": "$collectionDate" } 
                        },
                        "total_weight": { "$sum": "$weight" },
                        "collection_count": { "$sum": 1 }
                    }
                },
                { "$sort": { "_id": 1 } }
            ]
            
            collections_cursor = db.collections.aggregate(pipeline)
            df_collections = pd.DataFrame(list(collections_cursor))
            
            if df_collections.empty:
                logger.warning("No collection data found for training.")
                return pd.DataFrame()

            df_collections.rename(columns={"_id": "date"}, inplace=True)

            # 2. Fetch Weather (Features)
            # We explicitly fetch the nested fields to flatten them later
            weather_projection = {
                "date": 1,
                "temperature.avg": 1,
                "temperature.min": 1,
                "temperature.max": 1,
                "precipitation.rainfall": 1,
                "precipitation.humidity": 1,
                "wind.speed": 1,
                "solarRadiation.dailyTotal": 1
            }
            
            # Note: We query the 'weathers' collection (lowercase plural is typical Mongoose default)
            # Adjust to 'Weather' if your collection name is capitalized in Mongo
            weather_cursor = db.weathers.find({}, weather_projection)
            df_weather = pd.DataFrame(list(weather_cursor))
            
            if df_weather.empty:
                logger.warning("No weather data found for training.")
                return pd.DataFrame()

            # Flatten nested columns safely
            df_weather["date"] = pd.to_datetime(df_weather["date"]).dt.strftime("%Y-%m-%d")
            
            # Use apply to handle potential missing nested keys safely
            df_weather["temp_avg"] = df_weather["temperature"].apply(lambda x: x.get("avg") if isinstance(x, dict) else 0)
            df_weather["temp_min"] = df_weather["temperature"].apply(lambda x: x.get("min") if isinstance(x, dict) else 0)
            df_weather["temp_max"] = df_weather["temperature"].apply(lambda x: x.get("max") if isinstance(x, dict) else 0)
            df_weather["rainfall"] = df_weather["precipitation"].apply(lambda x: x.get("rainfall") if isinstance(x, dict) else 0)
            df_weather["humidity"] = df_weather["precipitation"].apply(lambda x: x.get("humidity") if isinstance(x, dict) else 0)
            df_weather["wind_speed"] = df_weather["wind"].apply(lambda x: x.get("speed") if isinstance(x, dict) else 0)
            
            # Handle optional solar radiation
            if "solarRadiation" in df_weather.columns:
                df_weather["solar_radiation"] = df_weather["solarRadiation"].apply(lambda x: x.get("dailyTotal", 0) if isinstance(x, dict) else 0)
            else:
                df_weather["solar_radiation"] = 0

            # Drop original nested columns
            cols_to_drop = ["temperature", "precipitation", "wind", "solarRadiation", "_id"]
            df_weather.drop(columns=[c for c in cols_to_drop if c in df_weather.columns], inplace=True)

            # 3. Merge Data
            # Inner merge ensures we only train on days where we have BOTH weather and tea data
            df_merged = pd.merge(df_weather, df_collections, on="date", how="inner")
            
            # Sort chronologically
            df_merged.sort_values("date", inplace=True)
            
            logger.info(f"Successfully loaded training dataset with shape: {df_merged.shape}")
            return df_merged

        except Exception as e:
            logger.error(f"Error loading model training data: {e}")
            return pd.DataFrame()

    def cache_prediction(self, farmer_id: str, prediction_type: str, prediction: Dict[str, Any], ttl: int = 3600):
        """Cache prediction result"""
        try:
            redis_client = self.get_redis_client()
            if redis_client:
                key = f"prediction:{farmer_id}:{prediction_type}"
                redis_client.setex(
                    key, 
                    ttl, 
                    json.dumps(prediction, default=str)
                )
        except Exception as e:
            logger.error(f"Failed to cache prediction: {e}")

    def get_cached_prediction(self, farmer_id: str, prediction_type: str) -> Optional[Dict[str, Any]]:
        """Get cached prediction result"""
        try:
            redis_client = self.get_redis_client()
            if redis_client:
                key = f"prediction:{farmer_id}:{prediction_type}"
                cached = redis_client.get(key)
                if cached:
                    return json.loads(cached)
        except Exception as e:
            logger.error(f"Failed to get cached prediction: {e}")
        return None