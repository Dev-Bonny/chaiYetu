import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class FeatureEngineer:
    def __init__(self):
        self.weather_data = {}  # Would be populated from weather API

    def create_weight_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create features for weight prediction"""
        try:
            if data.empty:
                return pd.DataFrame()

            df = data.copy()
            
            # Convert date if needed
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'])
                df = df.sort_values('date')
            
            # Basic features
            features = {
                'weight': df['weight'].iloc[-1] if not df.empty else 0,
                'avg_weight_7d': self._rolling_average(df, 'weight', 7),
                'avg_weight_30d': self._rolling_average(df, 'weight', 30),
                'weight_trend_7d': self._calculate_trend(df, 'weight', 7),
                'weight_std_7d': self._rolling_std(df, 'weight', 7),
                'collection_count_7d': len(df.tail(7)),
                'collection_count_30d': len(df.tail(30)),
            }
            
            # Quality features
            if 'quality' in df.columns:
                quality_mapping = {'grade1': 1, 'grade2': 2, 'grade3': 3}
                df['quality_numeric'] = df['quality'].map(quality_mapping)
                features['avg_quality_7d'] = self._rolling_average(df, 'quality_numeric', 7)
            
            # Seasonal features
            features.update(self._get_seasonal_features())
            
            # Weather features (simulated)
            features.update(self._get_weather_features())
            
            return pd.DataFrame([features])
            
        except Exception as e:
            logger.error(f"Weight feature engineering failed: {e}")
            return pd.DataFrame()

    def create_payment_features(self, collection_data: pd.DataFrame, payment_data: pd.DataFrame) -> pd.DataFrame:
        """Create features for payment prediction"""
        try:
            features = {}
            
            # Collection-based features
            if not collection_data.empty:
                coll_df = collection_data.copy()
                if 'date' in coll_df.columns:
                    coll_df['date'] = pd.to_datetime(coll_df['date'])
                    coll_df = coll_df.sort_values('date')
                
                features.update({
                    'total_collections_30d': len(coll_df.tail(30)),
                    'avg_daily_weight': coll_df['weight'].mean() if 'weight' in coll_df.columns else 0,
                    'total_amount_30d': coll_df['amount'].sum() if 'amount' in coll_df.columns else 0,
                    'collection_frequency': self._calculate_frequency(coll_df),
                    'avg_price_per_kg': coll_df['price'].mean() if 'price' in coll_df.columns else 0,
                })
            
            # Payment-based features
            if not payment_data.empty:
                pay_df = payment_data.copy()
                if 'date' in pay_df.columns:
                    pay_df['date'] = pd.to_datetime(pay_df['date'])
                    pay_df = pay_df.sort_values('date')
                
                features.update({
                    'total_payments_30d': len(pay_df.tail(30)),
                    'avg_payment_amount': pay_df['amount'].mean() if 'amount' in pay_df.columns else 0,
                    'payment_consistency': self._calculate_consistency(pay_df, 'amount'),
                })
            
            # Combined features
            features.update({
                'collections_to_payments_ratio': features.get('total_collections_30d', 0) / max(features.get('total_payments_30d', 1), 1),
                'seasonal_factor': self._get_seasonal_factor(),
                'day_of_week': datetime.utcnow().weekday(),
                'month': datetime.utcnow().month,
            })
            
            return pd.DataFrame([features])
            
        except Exception as e:
            logger.error(f"Payment feature engineering failed: {e}")
            return pd.DataFrame()

    def _rolling_average(self, df: pd.DataFrame, column: str, window: int) -> float:
        """Calculate rolling average"""
        try:
            if len(df) < window:
                return df[column].mean() if not df.empty else 0
            return df[column].tail(window).mean()
        except:
            return 0

    def _rolling_std(self, df: pd.DataFrame, column: str, window: int) -> float:
        """Calculate rolling standard deviation"""
        try:
            if len(df) < window:
                return df[column].std() if not df.empty else 0
            return df[column].tail(window).std()
        except:
            return 0

    def _calculate_trend(self, df: pd.DataFrame, column: str, window: int) -> float:
        """Calculate trend using linear regression slope"""
        try:
            if len(df) < window:
                return 0
            
            recent = df[column].tail(window).values
            x = np.arange(len(recent))
            slope = np.polyfit(x, recent, 1)[0]
            return slope
        except:
            return 0

    def _calculate_frequency(self, df: pd.DataFrame) -> float:
        """Calculate collection/payment frequency"""
        try:
            if len(df) < 2:
                return 0
            
            dates = pd.to_datetime(df['date'])
            date_diff = dates.diff().dt.total_seconds().mean()
            return 86400 / date_diff if date_diff > 0 else 0  # Collections per day
        except:
            return 0

    def _calculate_consistency(self, df: pd.DataFrame, column: str) -> float:
        """Calculate consistency (1 - coefficient of variation)"""
        try:
            if len(df) < 2:
                return 0
            
            values = df[column].dropna()
            if len(values) < 2:
                return 0
                
            cv = values.std() / values.mean()
            return max(0, 1 - cv)
        except:
            return 0

    def _get_seasonal_features(self) -> Dict[str, Any]:
        """Get seasonal features"""
        now = datetime.utcnow()
        month = now.month
        
        # Kenya tea season factors
        seasonal_factors = {
            'long_rains': month in [3, 4, 5],
            'short_rains': month in [9, 10, 11],
            'dry_season': month in [1, 2, 12],
            'cold_season': month in [6, 7, 8],
            'seasonal_factor': self._get_seasonal_factor()
        }
        
        return seasonal_factors

    def _get_seasonal_factor(self) -> float:
        """Get seasonal adjustment factor"""
        month = datetime.utcnow().month
        
        seasonal_factors = {
            1: 0.9, 2: 0.8, 3: 1.1, 4: 1.3, 5: 1.2,
            6: 1.0, 7: 0.9, 8: 0.9, 9: 1.1, 10: 1.2,
            11: 1.1, 12: 0.9
        }
        
        return seasonal_factors.get(month, 1.0)

    def _get_weather_features(self) -> Dict[str, Any]:
        """Get weather features (simulated)"""
        # In production, integrate with weather API
        return {
            'temperature': 20 + np.random.normal(0, 5),
            'rainfall_last_7d': np.random.gamma(2, 2),
            'humidity': 70 + np.random.normal(0, 10),
            'rainfall_expected': np.random.random() > 0.5
        }