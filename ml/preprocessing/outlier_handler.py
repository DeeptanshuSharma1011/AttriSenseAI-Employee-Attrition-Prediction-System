"""
AttriSense AI - Outlier Handler Module
SPDX-License-Identifier: Apache-2.0

Provides robust outlier detection mechanisms (using IQR or Z-Score techniques)
along with strategies like capping (Winsorization), deletion, or power transformations.
"""

import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Union, Optional

logger = logging.getLogger("OutlierHandler")


class OutlierHandler:
    """
    Identifies, caps, or mitigates numerical outliers in tabular employee features.
    """

    def __init__(self, method: str = "iqr", threshold: float = 1.5, strategy: str = "cap"):
        """
        Initialize the handler.
        
        Args:
            method (str): Detection method: 'iqr' (Interquartile Range) or 'zscore'.
            threshold (float): Variance threshold. For IQR, 1.5 represents mild outliers,
                               3.0 represents extreme. For z-score, 3.0 is typical.
            strategy (str): Mitigation strategy: 'cap' (Winsorization), 'remove', or 'log_transform'.
        """
        self.method = method
        self.threshold = threshold
        self.strategy = strategy
        
        # State variables holding learned capping boundaries
        self.boundaries_: Dict[str, Tuple[float, float]] = {}

    def fit(self, df: pd.DataFrame, columns: List[str]) -> "OutlierHandler":
        """
        Learns valid upper and lower bounds for numerical variables from the training set.
        """
        self.boundaries_ = {}
        
        for col in columns:
            if not pd.api.types.is_numeric_dtype(df[col].dtype):
                logger.warning(f"Skipping non-numerical feature for outlier detection: '{col}'")
                continue
                
            col_data = df[col].dropna()
            if col_data.empty:
                continue

            if self.method == "iqr":
                q25 = np.percentile(col_data, 25)
                q75 = np.percentile(col_data, 75)
                iqr = q75 - q25
                lower_bound = q25 - (self.threshold * iqr)
                upper_bound = q75 + (self.threshold * iqr)
            else: # z-score
                mean = col_data.mean()
                std = col_data.std()
                # Prevent divide by zero on zero variance columns (e.g. EmployeeCount)
                std = std if std > 0 else 1.0
                lower_bound = mean - (self.threshold * std)
                upper_bound = mean + (self.threshold * std)
                
            self.boundaries_[col] = (lower_bound, upper_bound)
            
        logger.info(f"Learned outlier boundaries for {len(self.boundaries_)} numerical features.")
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Applies learned boundaries to mitigate outlier skewness.
        """
        transformed_df = df.copy()
        
        for col, (lower, upper) in self.boundaries_.items():
            if col not in transformed_df.columns:
                continue
                
            if self.strategy == "cap":
                # Winsorization capping
                capped_count = ((transformed_df[col] < lower) | (transformed_df[col] > upper)).sum()
                if capped_count > 0:
                    transformed_df[col] = np.clip(transformed_df[col], lower, upper)
                    logger.debug(f"Winsorized/Capped {capped_count} outliers in column: '{col}'")
                    
            elif self.strategy == "remove":
                # Drops records falling outside the boundaries
                outlier_mask = (transformed_df[col] < lower) | (transformed_df[col] > upper)
                if outlier_mask.any():
                    transformed_df = transformed_df[~outlier_mask]
                    logger.info(f"Purged {outlier_mask.sum()} outlier rows based on column: '{col}'")
                    
        return transformed_df

    def fit_transform(self, df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
        """
        Helper fitting bounds and transforming training dataframe.
        """
        return self.fit(df, columns).transform(df)

    @staticmethod
    def get_strategy_documentation() -> Dict[str, str]:
        """
        Returns engineering descriptions specifying appropriate outlier mitigation tactics.
        """
        return {
            "capping": (
                "Winsorization limits the influence of outliers by forcing extreme values to a maximum/minimum boundary "
                "percentile. Recommended for attrition analytics because high salaries or long tenure elements are real, "
                "legitimate values that should not be dropped, but should be prevented from biasing models."
            ),
            "removal": (
                "Drops record coordinates completely. Suitable only for anomalous entry errors (such as negative Ages "
                "or Hourly Rates > $10,000). Highly discouraged for true business variance."
            ),
            "transformation": (
                "Applying mathematical functions (such as Log1p or Box-Cox) normalizes extreme right-skewed curves, "
                "compressing long tails naturally. Best practice for financial elements like MonthlyIncome."
            )
        }
