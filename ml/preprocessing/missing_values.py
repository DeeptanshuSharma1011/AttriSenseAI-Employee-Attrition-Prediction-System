"""
AttriSense AI - Missing Values Imputation Module
SPDX-License-Identifier: Apache-2.0

Implements automated identification and strategies for missing value
imputations (mean, median, mode) across categorical and numerical columns.
"""

import logging
import pandas as pd
from typing import Dict, List, Optional

logger = logging.getLogger("MissingValuesImputer")


class MissingValuesImputer:
    """
    Identifies and resolves missing values in structured data vectors.
    """

    def __init__(self, numerical_strategy: str = "median", categorical_strategy: str = "mode"):
        """
        Initialize the imputer with default fallback strategies.
        
        Args:
            numerical_strategy (str): Imputation rule for numerical traits. 
                                      Options: 'mean', 'median', 'constant'.
            categorical_strategy (str): Imputation rule for categorical traits.
                                        Options: 'mode', 'constant'.
        """
        self.numerical_strategy = numerical_strategy
        self.categorical_strategy = categorical_strategy
        
        # State variable saving calculated values during training to apply on inference data
        self.impute_values_: Dict[str, Any] = {}

    def fit(self, df: pd.DataFrame, target_column: Optional[str] = None) -> "MissingValuesImputer":
        """
        Calculates substitution parameters (mean/median/mode) for all features, 
        ensuring zero lookahead leakage into test folds.
        
        Args:
            df (pd.DataFrame): Training set dataframe.
            target_column (str): Target column to skip during imputation calculation.
        """
        self.impute_values_ = {}
        columns_to_process = [col for col in df.columns if col != target_column]
        
        for col in columns_to_process:
            null_count = df[col].isnull().sum()
            
            # Skip if there are zero missing elements to conserve computation
            if null_count == 0:
                continue
                
            col_type = df[col].dtype
            
            # 1. Numerical strategy
            if pd.api.types.is_numeric_dtype(col_type):
                if self.numerical_strategy == "mean":
                    val = df[col].mean()
                elif self.numerical_strategy == "median":
                    val = df[col].median()
                else:
                    val = 0 # absolute constant fallback
                self.impute_values_[col] = val
                
            # 2. Categorical strategy
            else:
                if self.categorical_strategy == "mode":
                    mode_series = df[col].mode()
                    val = mode_series.iloc[0] if not mode_series.empty else "Unknown"
                else:
                    val = "Unknown"
                self.impute_values_[col] = val
                
        logger.info(f"Fitted imputation rules for {len(self.impute_values_)} columns.")
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Applies learned substitution matrices on input features.
        
        Args:
            df (pd.DataFrame): Target dataframe to impute.
            
        Returns:
            pd.DataFrame: Imputed copy of the dataframe.
        """
        transformed_df = df.copy()
        
        for col, fill_value in self.impute_values_.items():
            if col in transformed_df.columns:
                null_before = transformed_df[col].isnull().sum()
                if null_before > 0:
                    transformed_df[col] = transformed_df[col].fillna(fill_value)
                    logger.debug(f"Imputed {null_before} missing entries in column: '{col}' with: {fill_value}")
                    
        return transformed_df

    def fit_transform(self, df: pd.DataFrame, target_column: Optional[str] = None) -> pd.DataFrame:
        """
        Combines parameter calculations and substitutions.
        """
        return self.fit(df, target_column).transform(df)

    @staticmethod
    def get_strategy_documentation() -> Dict[str, str]:
        """
        Returns professional guidelines specifying when to select each imputation technique.
        """
        return {
            "mean": (
                "Ideal for numerical values following a normal/Gaussian distribution with zero outliers. "
                "Limitation: Highly sensitive to extreme outliers, which can skew the substituted values."
            ),
            "median": (
                "Standard recommendation for skewed numerical distributions (such as Monthly Income or Total Working Years). "
                "Resistant to outliers; preserves typical employee representative values."
            ),
            "mode": (
                "Default standard for all categorical and nominal traits (such as MaritalStatus or OverTime). "
                "Substitutes missing fields with the most frequent/dominant class."
            ),
            "constant": (
                "Appropriate when missingness represents a specific design feature (e.g., missing certification score "
                "implies the employee does not hold the certificate)."
            )
        }
