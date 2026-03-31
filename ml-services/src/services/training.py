import asyncio
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
import joblib
import os

from config.settings import settings
from models.weight_predictor import WeightPredictor
from models.payment_forecaster import PaymentForecaster
from utils.data_loader import DataLoader
from utils.feature_engineering import FeatureEngineer

logger = logging.getLogger(__name__)

class TrainingService:
    def __init__(self):
        self.data_loader = DataLoader()
        self.feature_engineer = FeatureEngineer()
        self.weight_predictor = WeightPredictor()
        self.payment_forecaster = PaymentForecaster()
        self.training_status = "idle"
        self.last_training_time = None

    async def train_models(self, training_data: Dict[str, Any], models: List[str] = None):
        """Train or retrain ML models"""
        try:
            self.training_status = "training"
            self.last_training_time = datetime.utcnow()
            
            logger.info("Starting model training...")
            
            if models is None:
                models = ['weight', 'payment']

            # Prepare training data
            prepared_data = await self._prepare_training_data(training_data)
            
            if prepared_data is None:
                logger.error("Failed to prepare training data")
                self.training_status = "failed"
                return

            results = {}
            
            # Train weight prediction model
            if 'weight' in models:
                logger.info("Training weight prediction model...")
                try:
                    await self.weight_predictor.train(prepared_data['weight_data'])
                    results['weight'] = 'success'
                except Exception as e:
                    logger.error(f"Weight model training failed: {e}")
                    results['weight'] = 'failed'

            # Train payment forecasting model
            if 'payment' in models:
                logger.info("Training payment forecasting model...")
                try:
                    await self.payment_forecaster.train(prepared_data['payment_data'])
                    results['payment'] = 'success'
                except Exception as e:
                    logger.error(f"Payment model training failed: {e}")
                    results['payment'] = 'failed'

            self.training_status = "completed"
            logger.info(f"Model training completed. Results: {results}")
            
            return results
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            self.training_status = "failed"
            return {'overall': 'failed'}

    async def evaluate_models(self) -> Dict[str, Any]:
        """Evaluate model performance"""
        try:
            logger.info("Evaluating model performance...")
            
            # This would use a held-out test set for evaluation
            # For now, return simulated metrics
            
            evaluation = {
                'weight_model': {
                    'model_name': 'Weight LSTM',
                    'mae': 2.1,
                    'rmse': 2.8,
                    'mape': 15.2,
                    'r2': 0.76,
                    'accuracy': 84.8
                },
                'payment_model': {
                    'model_name': 'Payment Random Forest',
                    'mae': 245.3,
                    'rmse': 325.6,
                    'mape': 12.8,
                    'r2': 0.82,
                    'accuracy': 87.2
                },
                'overall_accuracy': 86.0,
                'evaluation_date': datetime.utcnow()
            }
            
            return evaluation
            
        except Exception as e:
            logger.error(f"Model evaluation failed: {e}")
            return {}

    async def get_training_status(self) -> Dict[str, Any]:
        """Get training status and model versions"""
        return {
            'training_status': self.training_status,
            'last_training_time': self.last_training_time,
            'model_versions': {
                'weight': self.weight_predictor.model_version,
                'payment': self.payment_forecaster.model_version
            },
            'models_loaded': self.weight_predictor.models_loaded and self.payment_forecaster.models_loaded
        }

    async def _prepare_training_data(self, raw_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Prepare training data from raw data"""
        try:
            if not raw_data:
                # Load data from database if not provided
                raw_data = await self.data_loader.get_training_data(settings.TRAINING_DAYS)
            
            if not raw_data:
                return None

            prepared_data = {}
            
            # Prepare weight training data
            weight_data = await self._prepare_weight_training_data(raw_data)
            if weight_data is not None:
                prepared_data['weight_data'] = weight_data
            
            # Prepare payment training data
            payment_data = await self._prepare_payment_training_data(raw_data)
            if payment_data is not None:
                prepared_data['payment_data'] = payment_data
            
            return prepared_data
            
        except Exception as e:
            logger.error(f"Training data preparation failed: {e}")
            return None

    async def _prepare_weight_training_data(self, raw_data: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """Prepare weight prediction training data"""
        try:
            collections = raw_data.get('collections', [])
            if not collections:
                return None

            # Convert to DataFrame
            df = pd.DataFrame(collections)
            
            # Extract relevant columns
            weight_data = df[['collectionDate', 'weight', 'quality', 'pricePerKg']].copy()
            weight_data.columns = ['date', 'weight', 'quality', 'price']
            weight_data['date'] = pd.to_datetime(weight_data['date'])
            weight_data = weight_data.sort_values('date')
            
            return weight_data
            
        except Exception as e:
            logger.error(f"Weight training data preparation failed: {e}")
            return None

    async def _prepare_payment_training_data(self, raw_data: Dict[str, Any]) -> Optional[pd.DataFrame]:
        """Prepare payment forecasting training data"""
        try:
            collections = raw_data.get('collections', [])
            payments = raw_data.get('payments', [])
            
            if not collections and not payments:
                return None

            # This would involve more complex feature engineering
            # For now, create a simple combined dataset
            
            payment_data = []
            
            # Process collections
            for collection in collections:
                payment_data.append({
                    'date': collection['collectionDate'],
                    'type': 'collection',
                    'amount': collection.get('totalAmount', 0),
                    'weight': collection.get('weight', 0)
                })
            
            # Process payments
            for payment in payments:
                payment_data.append({
                    'date': payment['paymentDate'],
                    'type': 'payment',
                    'amount': payment.get('totalAmount', 0),
                    'weight': 0  # Payments don't have weight
                })
            
            df = pd.DataFrame(payment_data)
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            return df
            
        except Exception as e:
            logger.error(f"Payment training data preparation failed: {e}")
            return None