import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import MinMaxScaler
import joblib
import os
import logging
from datetime import datetime
from typing import Dict, List, Any, Tuple

from config.settings import settings

logger = logging.getLogger(__name__)

class WeightPredictor:
    def __init__(self):
        self.model = None
        self.scaler = MinMaxScaler()
        self.sequence_length = settings.WEIGHT_PREDICTION_SEQUENCE_LENGTH
        self.model_version = "weight_lstm_v1.0"
        self.model_path = os.path.join(settings.MODEL_DIR, "weight_lstm.h5")
        self.scaler_path = os.path.join(settings.MODEL_DIR, "weight_scaler.pkl")

    async def load_model(self):
        """Load pre-trained model and scaler"""
        try:
            if os.path.exists(self.model_path):
                self.model = load_model(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                logger.info("Weight prediction model loaded successfully")
            else:
                logger.warning("No pre-trained weight model found. Please train the model first.")
                await self._create_default_model()
        except Exception as e:
            logger.error(f"Failed to load weight model: {e}")
            await self._create_default_model()

    async def _create_default_model(self):
        """Create a simple default model"""
        try:
            self.model = Sequential([
                LSTM(settings.LSTM_UNITS, return_sequences=True, 
                     input_shape=(self.sequence_length, 1)),
                Dropout(settings.DROPOUT_RATE),
                LSTM(settings.LSTM_UNITS, return_sequences=False),
                Dropout(settings.DROPOUT_RATE),
                Dense(25),
                Dense(1)
            ])
            
            self.model.compile(
                optimizer=Adam(learning_rate=settings.LEARNING_RATE),
                loss='mse',
                metrics=['mae']
            )
            
            logger.info("Default weight prediction model created")
        except Exception as e:
            logger.error(f"Failed to create default weight model: {e}")

    async def predict(self, features: pd.DataFrame, prediction_days: int = 7) -> Dict[str, Any]:
        """Predict future tea weights"""
        try:
            if self.model is None:
                await self.load_model()

            # Prepare data for prediction
            prepared_data = self._prepare_prediction_data(features)
            
            if prepared_data is None:
                return await self._get_simple_prediction(features)

            # Make prediction
            predictions = []
            current_sequence = prepared_data[-1].copy()
            
            for _ in range(prediction_days):
                # Reshape for LSTM
                lstm_input = current_sequence.reshape(1, self.sequence_length, 1)
                
                # Predict next value
                next_pred = self.model.predict(lstm_input, verbose=0)[0][0]
                predictions.append(next_pred)
                
                # Update sequence
                current_sequence = np.roll(current_sequence, -1)
                current_sequence[-1] = next_pred

            # Inverse transform predictions
            predictions = self.scaler.inverse_transform(
                np.array(predictions).reshape(-1, 1)
            ).flatten()

            # Calculate confidence based on recent data variability
            confidence = self._calculate_confidence(features)
            
            return {
                "predicted_weight": float(np.mean(predictions)),
                "confidence": float(confidence),
                "predictions": predictions.tolist(),
                "model_used": "lstm"
            }
            
        except Exception as e:
            logger.error(f"Weight prediction failed: {e}")
            return await self._get_simple_prediction(features)

    def _prepare_prediction_data(self, features: pd.DataFrame) -> np.ndarray:
        """Prepare data for LSTM prediction"""
        try:
            if 'weight' not in features.columns or len(features) < self.sequence_length:
                return None

            # Use weight data
            weight_data = features['weight'].values.reshape(-1, 1)
            
            # Fit scaler if not fitted
            if not hasattr(self.scaler, 'n_features_in_'):
                self.scaler.fit(weight_data)
            
            # Scale data
            scaled_data = self.scaler.transform(weight_data)
            
            # Create sequences
            sequences = []
            for i in range(len(scaled_data) - self.sequence_length + 1):
                sequences.append(scaled_data[i:(i + self.sequence_length), 0])
            
            return np.array(sequences)
            
        except Exception as e:
            logger.error(f"Data preparation failed: {e}")
            return None

    def _calculate_confidence(self, features: pd.DataFrame) -> float:
        """Calculate prediction confidence based on data quality"""
        try:
            if len(features) < 10:
                return 0.5
            
            # Calculate coefficient of variation
            weights = features['weight'].dropna()
            if len(weights) < 5:
                return 0.5
                
            cv = weights.std() / weights.mean()
            
            # More consistent data = higher confidence
            confidence = max(0.1, 1.0 - cv)
            
            # Adjust for data volume
            data_volume_factor = min(1.0, len(features) / 30)
            confidence *= data_volume_factor
            
            return round(confidence, 2)
            
        except Exception as e:
            logger.error(f"Confidence calculation failed: {e}")
            return 0.5

    async def _get_simple_prediction(self, features: pd.DataFrame) -> Dict[str, Any]:
        """Simple prediction using moving average"""
        try:
            if 'weight' not in features.columns or features.empty:
                return {
                    "predicted_weight": 15.0,
                    "confidence": 0.3,
                    "predictions": [15.0] * 7,
                    "model_used": "simple_average"
                }

            weights = features['weight'].dropna()
            if len(weights) == 0:
                avg_weight = 15.0
            else:
                # Use weighted average (recent data more important)
                recent_weights = weights.tail(7)
                avg_weight = recent_weights.mean()

            return {
                "predicted_weight": float(avg_weight),
                "confidence": 0.5,
                "predictions": [float(avg_weight)] * 7,
                "model_used": "moving_average"
            }
        except Exception as e:
            logger.error(f"Simple prediction failed: {e}")
            return {
                "predicted_weight": 15.0,
                "confidence": 0.3,
                "predictions": [15.0] * 7,
                "model_used": "fallback"
            }

    async def train(self, training_data: pd.DataFrame, validation_data: pd.DataFrame = None):
        """Train the LSTM model"""
        try:
            logger.info("Starting weight prediction model training...")
            
            # Prepare training data
            X_train, y_train = self._prepare_training_data(training_data)
            
            if X_train is None or len(X_train) == 0:
                logger.warning("Insufficient training data for weight model")
                return

            # Create model if not exists
            if self.model is None:
                await self._create_default_model()

            # Train model
            history = self.model.fit(
                X_train, y_train,
                epochs=50,
                batch_size=32,
                validation_split=0.2,
                verbose=1,
                callbacks=[
                    tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
                    tf.keras.callbacks.ReduceLROnPlateau(patience=5)
                ]
            )

            # Save model
            os.makedirs(settings.MODEL_DIR, exist_ok=True)
            self.model.save(self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            
            logger.info("Weight prediction model trained and saved successfully")
            
        except Exception as e:
            logger.error(f"Weight model training failed: {e}")

    def _prepare_training_data(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare training data for LSTM"""
        try:
            if 'weight' not in data.columns or len(data) < self.sequence_length + 1:
                return None, None

            weight_data = data['weight'].values.reshape(-1, 1)
            
            # Scale data
            scaled_data = self.scaler.fit_transform(weight_data)
            
            # Create sequences and targets
            X, y = [], []
            for i in range(len(scaled_data) - self.sequence_length):
                X.append(scaled_data[i:(i + self.sequence_length), 0])
                y.append(scaled_data[i + self.sequence_length, 0])
            
            return np.array(X), np.array(y)
            
        except Exception as e:
            logger.error(f"Training data preparation failed: {e}")
            return None, None