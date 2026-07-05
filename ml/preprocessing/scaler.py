"""
AttriSense AI - Feature Scaler Module
SPDX-License-Identifier: Apache-2.0

Implements automated column scaling (StandardScaler, MinMaxScaler, RobustScaler)
preserving calculated train scales for seamless test inference.
"""

import logging
import pandas as pd
from typing import List, Dict, Optional, Tuple

logger = logging.getLogger("FeatureScaler")


class FeatureScaler:
    """
    Standardizes or normalizes continuous variables to speed up convergence
    and prevent distance biases in distance-sensitive algorithms.
    """

    def __init__(self, method: str = "minmax"):
        """
        Args:
            method (str): Scaling strategy. Options: 'standard', 'minmax', 'robust'.
        """
        self.method = method
        
        # Saves statistics per column (mean, std, min, max, median, iqr)
        self.stats_: Dict[str, Dict[str, float]] = {}

    def fit(self, df: pd.DataFrame, columns: List[str]) -> "FeatureScaler":
        """
        Computes range matrices per continuous feature.
        """
        self.stats_ = {}
        
        for col in columns:
            if col not in df.columns:
                continue
                
            series = df[col].dropna()
            if series.empty:
                continue
                
            col_stats = {}
            if self.method == "standard":
                col_stats["mean"] = float(series.mean())
                # Avoid division by zero
                std = float(series.std())
                col_stats["std"] = std if std > 0 else 1.0
                
            elif self.method == "minmax":
                col_stats["min"] = float(series.min())
                diff = float(series.max() - series.min())
                col_stats["range"] = diff if diff > 0 else 1.0
                
            elif self.method == "robust":
                col_stats["median"] = float(series.median())
                q75 = float(series.quantile(0.75))
                q25 = float(series.quantile(0.25))
                iqr = q75 - q25
                col_stats["iqr"] = iqr if iqr > 0 else 1.0
                
            self.stats_[col] = col_stats
            
        logger.info(f"Calculated scaling statistics for {len(self.stats_)} features utilizing: {self.method}")
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Scales active feature values.
        """
        transformed_df = df.copy()
        
        for col, col_stats in self.stats_.items():
            if col not in transformed_df.columns:
                continue
                
            if self.method == "standard":
                transformed_df[col] = (transformed_df[col] - col_stats["mean"]) / col_stats["std"]
                
            elif self.method == "minmax":
                transformed_df[col] = (transformed_df[col] - col_stats["min"]) / col_stats["range"]
                
            elif self.method == "robust":
                transformed_df[col] = (transformed_df[col] - col_stats["median"]) / col_stats["iqr"]
                
            logger.debug(f"Scaled continuous feature: '{col}'")
            
        return transformed_df

    def fit_transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        """
        Saves parameter statistics and scales targeted attributes.
        """
        return self.fit(df, columns).transform(df)
