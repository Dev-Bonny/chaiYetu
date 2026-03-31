import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import joblib
import os
from sklearn.preprocessing import MinMaxScaler

from config.settings import settings
from models.weight_predictor import WeightPredictor
from models.payment_forecaster import PaymentForecaster
from utils.data_loader import DataLoader
from utils.feature_engineering import FeatureEngineer

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self):
        self.data_loader = DataLoader()
        self.feature_engineer = FeatureEngineer()
        self.weight_predictor = None
        self.payment_forecaster = None
        self.models_loaded = False

    async def initialize_models(self):
        """Initialize and load trained models"""
        try:
            self.weight_predictor = WeightPredictor()
            self.payment_forecaster = PaymentForecaster()
            
            # Load pre-trained models
            await self.weight_predictor.load_model()
            await self.payment_forecaster.load_model()
            
            self.models_loaded = True
            logger.info("Models initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            self.models_loaded = False

    async def predict_weight(
        self, 
        farmer_id: str, 
        historical_data: List[Dict[str, Any]], 
        prediction_days: int = 7
    ) -> Dict[str, Any]:
        """Predict tea weight for a farmer"""
        if not self.models_loaded:
            await self.initialize_models()

        try:
            # Convert to DataFrame
            df = pd.DataFrame(historical_data)
            if df.empty:
                return await self._get_fallback_weight_prediction(farmer_id)

            # Feature engineering
            features = self.feature_engineer.create_weight_features(df)
            
            # Make prediction
            prediction = await self.weight_predictor.predict(
                features, 
                prediction_days
            )
            
            # Get additional factors
            factors = await self._get_prediction_factors(df, prediction_days)
            recommendations = self._generate_weight_recommendations(prediction, factors)
            
            return {
                "farmer_id": farmer_id,
                "predicted_weight": prediction["predicted_weight"],
                "confidence": prediction["confidence"],
                "prediction_date": datetime.utcnow(),
                "factors": factors,
                "recommendations": recommendations,
                "model_version": self.weight_predictor.model_version
            }
            
        except Exception as e:
            logger.error(f"Weight prediction failed for farmer {farmer_id}: {e}")
            return await self._get_fallback_weight_prediction(farmer_id)

    async def predict_payment(
        self,
        farmer_id: str,
        collection_data: List[Dict[str, Any]],
        payment_data: List[Dict[str, Any]],
        prediction_days: int = 30
    ) -> Dict[str, Any]:
        """Predict payment amount for a farmer"""
        if not self.models_loaded:
            await self.initialize_models()

        try:
            # Convert to DataFrames
            collection_df = pd.DataFrame(collection_data)
            payment_df = pd.DataFrame(payment_data)
            
            if collection_df.empty and payment_df.empty:
                return await self._get_fallback_payment_prediction(farmer_id)

            # Feature engineering
            features = self.feature_engineer.create_payment_features(
                collection_df, 
                payment_df
            )
            
            # Make prediction
            prediction = await self.payment_forecaster.predict(
                features, 
                prediction_days
            )
            
            # Get additional factors
            factors = await self._get_payment_factors(collection_df, payment_df)
            expected_payments = self._generate_expected_payments(prediction, prediction_days)
            
            return {
                "farmer_id": farmer_id,
                "predicted_amount": prediction["predicted_amount"],
                "confidence": prediction["confidence"],
                "prediction_date": datetime.utcnow(),
                "expected_payments": expected_payments,
                "factors": factors,
                "model_version": self.payment_forecaster.model_version
            }
            
        except Exception as e:
            logger.error(f"Payment prediction failed for farmer {farmer_id}: {e}")
            return await self._get_fallback_payment_prediction(farmer_id)

    async def start_batch_prediction(self, farmer_ids: List[str]) -> str:
        """Start batch prediction for multiple farmers"""
        task_id = f"batch_prediction_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        # This would typically run in a background task using Celery or similar
        logger.info(f"Starting batch prediction task {task_id} for {len(farmer_ids)} farmers")
        
        return task_id

    async def _get_prediction_factors(self, df: pd.DataFrame, prediction_days: int) -> Dict[str, Any]:
        """Get factors influencing the prediction"""
        try:
            # Analyze trends
            if len(df) >= 7:
                recent_trend = self._calculate_trend(df['weight'].tail(7))
                seasonal_factor = self._get_seasonal_factor()
                weather_factors = await self._get_weather_factors()
            else:
                recent_trend = "stable"
                seasonal_factor = 1.0
                weather_factors = {}
            
            return {
                "trend": recent_trend,
                "seasonal_factor": seasonal_factor,
                "weather_factors": weather_factors,
                "data_points": len(df),
                "avg_historical_weight": df['weight'].mean() if not df.empty else 0
            }
        except Exception as e:
            logger.error(f"Error getting prediction factors: {e}")
            return {}

    async def _get_payment_factors(self, collection_df: pd.DataFrame, payment_df: pd.DataFrame) -> Dict[str, Any]:
        """Get factors influencing payment prediction"""
        try:
            factors = {
                "collection_trend": {},
                "price_trend": {},
                "seasonal_factor": self._get_seasonal_factor()
            }
            
            if not collection_df.empty:
                # Collection trend
                if len(collection_df) >= 30:
                    factors["collection_trend"] = {
                        "direction": self._calculate_trend(collection_df['weight'].tail(30)),
                        "rate": self._calculate_growth_rate(collection_df['weight'].tail(30))
                    }
                
                # Price trend
                if 'price' in collection_df.columns:
                    factors["price_trend"] = {
                        "direction": self._calculate_trend(collection_df['price'].tail(30)),
                        "rate": self._calculate_growth_rate(collection_df['price'].tail(30))
                    }
            
            return factors
        except Exception as e:
            logger.error(f"Error getting payment factors: {e}")
            return {}

    def _calculate_trend(self, series: pd.Series) -> str:
        """Calculate trend direction"""
        if len(series) < 2:
            return "stable"
        
        first_half = series.iloc[:len(series)//2].mean()
        second_half = series.iloc[len(series)//2:].mean()
        
        if second_half > first_half * 1.1:
            return "increasing"
        elif second_half < first_half * 0.9:
            return "decreasing"
        else:
            return "stable"

    def _calculate_growth_rate(self, series: pd.Series) -> float:
        """Calculate growth rate"""
        if len(series) < 2:
            return 0.0
        
        return ((series.iloc[-1] - series.iloc[0]) / series.iloc[0]) * 100

    def _get_seasonal_factor(self) -> float:
        """Get seasonal adjustment factor"""
        month = datetime.utcnow().month
        
        # Kenya tea seasons adjustment factors
        seasonal_factors = {
            1: 0.9,   # January - Dry season
            2: 0.8,   # February - Dry season
            3: 1.1,   # March - Start long rains
            4: 1.3,   # April - Long rains peak
            5: 1.2,   # May - Long rains
            6: 1.0,   # June - Cold season start
            7: 0.9,   # July - Cold season
            8: 0.9,   # August - Cold season
            9: 1.1,   # September - Short rains start
            10: 1.2,  # October - Short rains peak
            11: 1.1,  # November - Short rains
            12: 0.9   # December - Dry season start
        }
        
        return seasonal_factors.get(month, 1.0)

    async def _get_weather_factors(self) -> Dict[str, Any]:
        """Get weather factors (simulated - integrate with weather API)"""
        # In production, integrate with weather API
        return {
            "rainfall_expected": np.random.random() > 0.5,
            "temperature": 20 + np.random.normal(0, 5),
            "humidity": 70 + np.random.normal(0, 10)
        }

    def _generate_weight_recommendations(self, prediction: Dict[str, Any], factors: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on prediction"""
        recommendations = []
        
        if prediction["confidence"] < 0.7:
            recommendations.append("Low prediction confidence. Consider manual inspection.")
        
        if prediction["predicted_weight"] < 10:
            recommendations.append("Low predicted yield. Check soil moisture and fertilizer application.")
        
        if factors.get("weather_factors", {}).get("rainfall_expected"):
            recommendations.append("Rain expected. Plan collection accordingly.")
        
        if factors.get("trend") == "decreasing":
            recommendations.append("Yield trend decreasing. Review farming practices.")
        
        recommendations.extend([
            "Maintain regular pruning schedule for optimal yield.",
            "Ensure proper fertilizer application based on soil testing."
        ])
        
        return recommendations[:5]  # Return top 5 recommendations

    def _generate_expected_payments(self, prediction: Dict[str, Any], prediction_days: int) -> List[Dict[str, Any]]:
        """Generate expected payment schedule"""
        expected_payments = []
        base_amount = prediction["predicted_amount"] / (prediction_days / 7)  # Weekly payments
        
        for i in range(0, prediction_days, 7):
            payment_date = datetime.utcnow() + timedelta(days=i)
            expected_payments.append({
                "date": payment_date.strftime("%Y-%m-%d"),
                "amount": round(base_amount * (0.8 + 0.4 * np.random.random()), 2),
                "confidence": max(0.5, prediction["confidence"] * (0.8 + 0.2 * np.random.random()))
            })
        
        return expected_payments

    async def _get_fallback_weight_prediction(self, farmer_id: str) -> Dict[str, Any]:
        """Fallback weight prediction when ML fails"""
        logger.warning(f"Using fallback weight prediction for farmer {farmer_id}")
        
        return {
            "farmer_id": farmer_id,
            "predicted_weight": 15.0,  # Default average
            "confidence": 0.5,
            "prediction_date": datetime.utcnow(),
            "factors": {"fallback": True},
            "recommendations": ["Using fallback prediction. ML service unavailable."],
            "model_version": "fallback_1.0"
        }

    async def _get_fallback_payment_prediction(self, farmer_id: str) -> Dict[str, Any]:
        """Fallback payment prediction when ML fails"""
        logger.warning(f"Using fallback payment prediction for farmer {farmer_id}")
        
        return {
            "farmer_id": farmer_id,
            "predicted_amount": 1000.0,  # Default average
            "confidence": 0.5,
            "prediction_date": datetime.utcnow(),
            "expected_payments": [],
            "factors": {"fallback": True},
            "model_version": "fallback_1.0"
        }