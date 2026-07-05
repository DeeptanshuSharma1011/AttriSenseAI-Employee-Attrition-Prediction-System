"""
AttriSense AI - Feature Engineering Module
SPDX-License-Identifier: Apache-2.0

Implements high-value HR domain-specific features and logs transformations
to amplify linear predictive signals.
"""

import logging
import numpy as np
import pandas as pd
from typing import List, Optional

logger = logging.getLogger("FeatureEngineer")


class FeatureEngineer:
    """
    Constructs high-value domain indicators and handles mathematical transforms.
    """

    def __init__(self, apply_log_transform: bool = True):
        self.apply_log_transform = apply_log_transform

    def construct_domain_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Builds HR-specific ratio features:
        1. TenureRatio: YearsAtCompany / TotalWorkingYears
        2. IncomePerAge: MonthlyIncome / Age
        3. WorkLifeBurnoutIndex: OverTime (mapped to 1/0) * (5 - WorkLifeBalance)
        4. SatisfactionProduct: JobSatisfaction * EnvironmentSatisfaction
        """
        new_df = df.copy()
        
        # 1. Tenure Ratio
        if "YearsAtCompany" in new_df.columns and "TotalWorkingYears" in new_df.columns:
            # Prevent division by zero
            total_years_safe = new_df["TotalWorkingYears"].replace(0, 1)
            new_df["TenureRatio"] = new_df["YearsAtCompany"] / total_years_safe
            # Clip between 0 and 1
            new_df["TenureRatio"] = new_df["TenureRatio"].clip(0.0, 1.0)
            
        # 2. Income Per Age
        if "MonthlyIncome" in new_df.columns and "Age" in new_df.columns:
            age_safe = new_df["Age"].replace(0, 1)
            new_df["IncomePerAge"] = new_df["MonthlyIncome"] / age_safe
            
        # 3. Work-Life Burnout Rating
        if "WorkLifeBalance" in new_df.columns:
            # Map Overtime to indicator if present
            if "OverTime" in new_df.columns:
                ot_indicator = new_df["OverTime"].apply(lambda x: 1 if str(x).strip().lower() == 'yes' else 0)
                new_df["WorkLifeBurnoutIndex"] = ot_indicator * (5 - new_df["WorkLifeBalance"])
            else:
                new_df["WorkLifeBurnoutIndex"] = 4 - new_df["WorkLifeBalance"]
                
        # 4. Satisfaction Product
        if "JobSatisfaction" in new_df.columns and "EnvironmentSatisfaction" in new_df.columns:
            new_df["SatisfactionProduct"] = new_df["JobSatisfaction"] * new_df["EnvironmentSatisfaction"]
            
        logger.info("Created highly discriminative HR domain features successfully.")
        return new_df

    def apply_transformations(self, df: pd.DataFrame, log_columns: List[str]) -> pd.DataFrame:
        """
        Applies Log(x+1) transforms to squash continuous features with extreme positive skewness.
        """
        transformed_df = df.copy()
        
        if self.apply_log_transform:
            for col in log_columns:
                if col in transformed_df.columns:
                    # Log1p avoids negative infinity on zeros
                    transformed_df[col] = np.log1p(transformed_df[col])
                    logger.debug(f"Applied Log1p transformation to column: '{col}'")
                    
        return transformed_df

    def fit_transform(self, df: pd.DataFrame, log_columns: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Executes complete domain feature construction and curve transformations.
        """
        engineered_df = self.construct_domain_features(df)
        if log_columns:
            engineered_df = self.apply_transformations(engineered_df, log_columns)
        return engineered_df
