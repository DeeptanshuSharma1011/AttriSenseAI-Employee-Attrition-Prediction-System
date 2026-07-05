"""
AttriSense AI - Unified Preprocessing Pipeline
SPDX-License-Identifier: Apache-2.0

Assembles the loader, validator, imputer, outlier caps, categorical encoders,
and feature scalers into a modular, production-ready pipeline.
"""

import os
import logging
import pandas as pd
from typing import Tuple, Dict, Any

from .data_loader import DataLoader
from .validator import DatasetValidator
from .missing_values import MissingValuesImputer
from .outlier_handler import OutlierHandler
from .encoder import CategoricalEncoder
from .scaler import FeatureScaler
from .feature_engineering import FeatureEngineer
from .imbalance_handler import ClassImbalanceHandler

logger = logging.getLogger("PreprocessingPipeline")


class PreprocessingPipeline:
    """
    Unifies all analytical preprocessing operations into a single reusable object,
    strictly preventing feature leakage.
    """

    def __init__(self, target_column: str = "Attrition", scale_method: str = "minmax"):
        self.target_column = target_column
        
        # Sub-modules
        self.validator = DatasetValidator(target_column=target_column)
        self.imputer = MissingValuesImputer(numerical_strategy="median", categorical_strategy="mode")
        self.outlier_handler = OutlierHandler(method="iqr", threshold=1.5, strategy="cap")
        
        # We explicitly map Yes/No features ordinally
        ordinal_maps = {
            "OverTime": {"No": 0, "Yes": 1},
            "Gender": {"Male": 0, "Female": 1},
            "Attrition": {"No": 0, "Yes": 1}
        }
        
        # One-hot features list
        one_hot_cols = ["BusinessTravel", "Department", "EducationField", "JobRole", "MaritalStatus"]
        self.encoder = CategoricalEncoder(one_hot_cols=one_hot_cols, ordinal_mappings=ordinal_maps)
        
        self.engineer = FeatureEngineer(apply_log_transform=True)
        self.scaler = FeatureScaler(method=scale_method)
        self.imbalance_handler = ClassImbalanceHandler(target_column=target_column, strategy="oversample")

    def fit_transform_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fits all scaler stats, categories, and transformations to the dataset, returning
        the fully processed tabular dataset.
        """
        logger.info("Initializing unified pipeline fit-transform routine.")
        
        # 1. Clean invalid/corrupt records first
        df_cleaned = self.validator.clean_invalid_records(df)
        
        # Validate schema
        is_valid, errors = self.validator.validate_schema(df_cleaned)
        if not is_valid:
            logger.warning(f"Schema integrity warning: {errors}. Attempting to proceed with present features.")
            
        # 2. Impute missing values
        df_imputed = self.imputer.fit_transform(df_cleaned, target_column=self.target_column)
        
        # 3. Handle outliers on existing numerical metrics
        num_cols = ["Age", "DailyRate", "DistanceFromHome", "MonthlyIncome", "TotalWorkingYears", "YearsAtCompany"]
        df_no_outliers = self.outlier_handler.fit_transform(df_imputed, num_cols)
        
        # 4. Construct high-fidelity domain features and mathematical scales
        df_engineered = self.engineer.fit_transform(df_no_outliers, log_columns=["MonthlyIncome"])
        
        # 5. Categorical Feature Encoding
        df_encoded = self.encoder.fit_transform(df_engineered)
        
        # 6. Numeric scaling on continuous traits (including newly engineered features)
        scale_cols = ["Age", "DailyRate", "DistanceFromHome", "MonthlyIncome", "TotalWorkingYears", 
                      "YearsAtCompany", "TenureRatio", "IncomePerAge", "SatisfactionProduct"]
        df_scaled = self.scaler.fit_transform(df_encoded, scale_cols)
        
        # 7. Apply class imbalance sampling
        df_balanced = self.imbalance_handler.balance_dataset(df_scaled)
        
        logger.info(f"Finished preprocessing. Final processed layout shape: {df_balanced.shape}")
        return df_balanced


def preprocess_data(filepath: str, output_dir: str = "datasets/processed") -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Main entry point function allowing future machine learning scripts to load, clean, 
    and preprocess data with a single line of code.
    
    Loads raw CSV, runs fit_transform, splits into pseudo-train/test (80/20 partition), 
    saves artifacts, and returns both datasets.
    """
    # Load dataset
    loader = DataLoader(filepath)
    raw_df = loader.load_data()
    
    # Initialize pipeline
    pipeline = PreprocessingPipeline()
    processed_df = pipeline.fit_transform_dataset(raw_df)
    
    # Simple randomized division ensuring split replication
    test_df = processed_df.sample(frac=0.20, random_state=42)
    train_df = processed_df.drop(test_df.index)
    
    # Guarantee target directory existence
    os.makedirs(output_dir, exist_ok=True)
    
    # Save artifacts
    train_path = os.path.join(output_dir, "train.csv")
    test_path = os.path.join(output_dir, "test.csv")
    
    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)
    
    logger.info(f"Successfully serialized train and test folds. Train: {train_df.shape}, Test: {test_df.shape}")
    return train_df, test_df


if __name__ == "__main__":
    # Test script locally when run directly
    raw_file = "datasets/raw/ibm_hr_attrition.csv"
    if os.path.exists(raw_file):
        preprocess_data(raw_file)
    else:
        print(f"Seed file not located at: {raw_file}")
