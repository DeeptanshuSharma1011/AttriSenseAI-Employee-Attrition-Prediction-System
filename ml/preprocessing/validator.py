"""
AttriSense AI - Dataset Validator Module
SPDX-License-Identifier: Apache-2.0

Provides rigid data validation checks including structure validation, 
unexpected data types detection, missing required columns, target verification, 
and abnormal boundary checks.
"""

import logging
import pandas as pd
from typing import List, Dict, Tuple, Any

logger = logging.getLogger("DatasetValidator")


class DatasetValidator:
    """
    Enforces rigid data schemas and data quality rules for HR Analytics data.
    """

    def __init__(self, target_column: str = "Attrition"):
        """
        Initialize the validator with specific target rules.
        """
        self.target_column = target_column
        
        # Expected baseline features for the IBM Attrition dataset format
        self.expected_columns = {
            "Age": ["int64", "float64"],
            "BusinessTravel": ["object"],
            "DailyRate": ["int64", "float64"],
            "Department": ["object"],
            "DistanceFromHome": ["int64", "float64"],
            "Education": ["int64", "float64"],
            "EducationField": ["object"],
            "EnvironmentSatisfaction": ["int64", "float64"],
            "Gender": ["object"],
            "JobInvolvement": ["int64", "float64"],
            "JobLevel": ["int64", "float64"],
            "JobRole": ["object"],
            "JobSatisfaction": ["int64", "float64"],
            "MaritalStatus": ["object"],
            "MonthlyIncome": ["int64", "float64"],
            "OverTime": ["object"],
            "TotalWorkingYears": ["int64", "float64"],
            "WorkLifeBalance": ["int64", "float64"],
            "YearsAtCompany": ["int64", "float64"],
        }

    def validate_schema(self, df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Verifies all vital features and target columns are present with valid types.
        
        Returns:
            Tuple[bool, List[str]]: (is_valid, list_of_error_strings)
        """
        errors = []
        
        # 1. Check target presence
        if self.target_column not in df.columns:
            errors.append(f"Missing mandatory target column: '{self.target_column}'")
            
        # 2. Check essential column presence and basic data types
        for col, expected_types in self.expected_columns.items():
            if col not in df.columns:
                errors.append(f"Missing expected feature column: '{col}'")
            else:
                col_type = str(df[col].dtype)
                # Verify type overlap
                type_match = False
                for exp_type in expected_types:
                    if exp_type in col_type or col_type in exp_type:
                        type_match = True
                        break
                if not type_match:
                    errors.append(
                        f"Type mismatch on '{col}'. Expected one of {expected_types}, got '{col_type}'"
                    )
                    
        is_valid = len(errors) == 0
        if is_valid:
            logger.info("Schema integrity verification passed completely.")
        else:
            logger.warning(f"Schema integrity check failed with {len(errors)} error(s).")
            
        return is_valid, errors

    def validate_quality_rules(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Runs analytical boundary audits checking for logical contradictions or corrupt values:
        - Age must be greater than 0 (or > 18)
        - MonthlyIncome must be greater than 0
        - Target values should not be null
        - Duplicate checks
        """
        report = {
            "null_target_count": 0,
            "negative_age_count": 0,
            "negative_income_count": 0,
            "invalid_records_found": False,
            "duplicate_records_count": int(df.duplicated().sum()),
        }
        
        # Audit target column nulls
        if self.target_column in df.columns:
            report["null_target_count"] = int(df[self.target_column].isnull().sum())
            
        # Audit Age boundary
        if "Age" in df.columns:
            report["negative_age_count"] = int((df["Age"] <= 0).sum())
            
        # Audit MonthlyIncome boundary
        if "MonthlyIncome" in df.columns:
            report["negative_income_count"] = int((df["MonthlyIncome"] <= 0).sum())
            
        if (report["null_target_count"] > 0 or 
            report["negative_age_count"] > 0 or 
            report["negative_income_count"] > 0):
            report["invalid_records_found"] = True
            logger.warning("Quality audits identified invalid records in the feature vector.")
        else:
            logger.info("Quality audits and boundary constraints validated successfully.")
            
        return report

    def clean_invalid_records(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Applies hard boundary cleanses (e.g., removing records with missing targets,
        or removing duplicate records) to protect subsequent feature-engineering processes.
        """
        cleaned_df = df.copy()
        
        # Remove duplicate records
        duplicates = cleaned_df.duplicated().sum()
        if duplicates > 0:
            cleaned_df = cleaned_df.drop_duplicates()
            logger.info(f"Purged {duplicates} identical duplicate records.")
            
        # Remove records where target is null
        if self.target_column in cleaned_df.columns:
            null_targets = cleaned_df[self.target_column].isnull().sum()
            if null_targets > 0:
                cleaned_df = cleaned_df.dropna(subset=[self.target_column])
                logger.info(f"Purged {null_targets} records lacking active target parameters.")
                
        return cleaned_df
