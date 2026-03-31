import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os
import logging
from datetime import datetime
from typing import Dict, List, Any, Tuple

from config.settings import settings

logger = logging.getLogger(__name__)

class PaymentForecaster:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_version = "payment_rf_v1.0"
        self.model_path = os.path.join(settings.MODEL_DIR, "payment_rf.pkl")
        self.scaler_path = os.path.join(settings.MODEL_DIR, "payment_scaler.pkl")

    async def load_model(self):
        """Load pre-trained model and scaler"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                logger.info("Payment forecasting model loaded successfully")
            else:
                logger.warning("No pre-trained payment model found. Please train the model first.")
                await self._create_default_model()
        except Exception as e:
            logger.error(f"Failed to load payment model: {e}")
            await self._create_default_model()

    async def _create_default_model(self):
        """Create a simple default model"""
        try:
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            logger.info("Default payment forecasting model created")
        except Exception as e:
            logger.error(f"Failed to create default payment model: {e}")

    async def predict(self, features: pd.DataFrame, prediction_days: int = 30) -> Dict[str, Any]:
        """Predict future payment amounts"""
        try:
            if self.model is None:
                await self.load_model()

            # Prepare features for prediction
            X_pred = self._prepare_prediction_features(features, prediction_days)
            
            if X_pred is None:
                return await self._get_simple_payment_prediction(features)

            # Make prediction
            predicted_amount = self.model.predict(X_pred)[0]
            
            # Calculate confidence
            confidence = self._calculate_payment_confidence(features)
            
            return {
                "predicted_amount": float(predicted_amount),
                "confidence": float(confidence),
                "model_used": "random_forest"
            }
            
        except Exception as e:
            logger.error(f"Payment prediction failed: {e}")
            return await self._get_simple_payment_prediction(features)

    def _prepare_prediction_features(self, features: pd.DataFrame, prediction_days: int) -> np.ndarray:
        """Prepare features for payment prediction"""
        try:
            # Extract relevant features
            feature_columns = [
                'total_collections_30d', 'avg_daily_weight', 'total_amount_30d',
                'collection_frequency', 'avg_price_per_kg', 'seasonal_factor'
            ]
            
            # Create feature vector
            feature_vector = []
            for col in feature_columns:
                if col in features.columns:
                    feature_vector.append(features[col].iloc[0] if not features.empty else 0)
                else:
                    feature_vector.append(0)  # Default value
            
            # Add prediction horizon factor
            feature_vector.append(prediction_days)
            
            # Scale features
            feature_vector = self.scaler.transform([feature_vector])
            
            return feature_vector
            
        except Exception as e:
            logger.error(f"Feature preparation failed: {e}")
            return None

    def _calculate_payment_confidence(self, features: pd.DataFrame) -> float:
        """Calculate prediction confidence for payments"""
        try:
            if features.empty:
                return 0.3
            
            confidence_factors = []
            
            # Data completeness factor
            if 'total_collections_30d' in features.columns:
                collections = features['total_collections_30d'].iloc[0]
                completeness = min(1.0, collections / 20)  # More collections = higher confidence
                confidence_factors.append(completeness)
            
            # Data recency factor (simplified)
            recency_factor = 0.7  # Would be based on actual timestamps
            confidence_factors.append(recency_factor)
            
            # Seasonal consistency factor
            seasonal_factor = 0.8
            confidence_factors.append(seasonal_factor)
            
            return round(np.mean(confidence_factors), 2)
            
        except Exception as e:
            logger.error(f"Payment confidence calculation failed: {e}")
            return 0.5

    async def _get_simple_payment_prediction(self, features: pd.DataFrame) -> Dict[str, Any]:
        """Simple payment prediction using historical averages"""
        try:
            if features.empty:
                return {
                    "predicted_amount": 1000.0,
                    "confidence": 0.3,
                    "model_used": "simple_average"
                }

            # Calculate average daily payment
            if 'avg_daily_amount' in features.columns:
                avg_daily = features['avg_daily_amount'].iloc[0]
            elif 'total_amount_30d' in features.columns:
                avg_daily = features['total_amount_30d'].iloc[0] / 30
            else:
                avg_daily = 33.33  # ~1000 per month

            predicted_amount = avg_daily * 30  # Monthly prediction

            return {
                "predicted_amount": float(predicted_amount),
                "confidence": 0.5,
                "model_used": "historical_average"
            }
        except Exception as e:
            logger.error(f"Simple payment prediction failed: {e}")
            return {
                "predicted_amount": 1000.0,
                "confidence": 0.3,
                "model_used": "fallback"
            }

    async def train(self, training_data: pd.DataFrame, validation_data: pd.DataFrame = None):
        """Train the payment forecasting model"""
        try:
            logger.info("Starting payment forecasting model training...")
            
            # Prepare training data
            X_train, y_train = self._prepare_training_data(training_data)
            
            if X_train is None or len(X_train) == 0:
                logger.warning("Insufficient training data for payment model")
                return

            # Create model if not exists
            if self.model is None:
                await self._create_default_model()

            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            
            # Train model
            self.model.fit(X_train_scaled, y_train)
            
            # Save model
            os.makedirs(settings.MODEL_DIR, exist_ok=True)
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            # Log training performance
            if validation_data is not None:
                X_val, y_val = self._prepare_training_data(validation_data)
                if X_val is not None:
                    X_val_scaled = self.scaler.transform(X_val)
                    y_pred = self.model.predict(X_val_scaled)
                    mae = mean_absolute_error(y_val, y_pred)
                    logger.info(f"Payment model training completed. Validation MAE: {mae:.2f}")
            
            logger.info("Payment forecasting model trained and saved successfully")
            
        except Exception as e:
            logger.error(f"Payment model training failed: {e}")

    def _prepare_training_data(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data for payment forecasting"""
        try:
            # This would extract features and targets from the training data
            # For now, return dummy data
            if len(data) < 10:
                return None, None

            # Example feature extraction (simplified)
            features = []
            targets = []
            
            # In practice, you'd extract meaningful features from the data
            # For demo purposes, creating simple synthetic data
            for i in range(len(data) - 30):
                # Feature: rolling averages, totals, etc.
                feature_vector = [
                    data['total_amount'].iloc[i],  # Total amount last 30 days
                    data['collection_count'].iloc[i],  # Number of collections
                    data['avg_weight'].iloc[i],  # Average weight
                    np.random.normal(1, 0.1),  # Seasonal factor
                    30  # Prediction horizon
                ]
                
                # Target: total amount next 30 days
                target = data['total_amount'].iloc[i + 30]
                
                features.append(feature_vector)
                targets.append(target)
            
            return np.array(features), np.array(targets)
            
        except Exception as e:
            logger.error(f"Payment training data preparation failed: {e}")
            return None, None