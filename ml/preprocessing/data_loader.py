"""
AttriSense AI - Dataset Loader Module
SPDX-License-Identifier: Apache-2.0

This module provides reusable, high-quality utilities for loading tabular 
datasets, verifying file existence, parsing schemas, and executing 
preliminary diagnostic summary reports.
"""

import os
import logging
import pandas as pd
from typing import Tuple, Dict, Any, Optional

# Configure standard logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("DataLoader")


class DataLoader:
    """
    Handles robust loading and metadata inspection of structured CSV datasets
    for machine learning training pipelines.
    """

    def __init__(self, filepath: str):
        """
        Initialize DataLoader with the path to the target CSV.
        
        Args:
            filepath (str): Relative or absolute path to the CSV file.
        """
        self.filepath = filepath
        self.df: Optional[pd.DataFrame] = None

    def load_data(self) -> pd.DataFrame:
        """
        Validates file presence and loads the dataset into a Pandas DataFrame.
        
        Returns:
            pd.DataFrame: The loaded dataset.
            
        Raises:
            FileNotFoundError: If the specified file does not exist.
            ValueError: If the file is empty or corrupted.
        """
        logger.info(f"Initiating load sequence for dataset: {self.filepath}")
        
        if not os.path.exists(self.filepath):
            err_msg = f"Target dataset not found at path: {self.filepath}"
            logger.error(err_msg)
            raise FileNotFoundError(err_msg)
            
        try:
            self.df = pd.read_csv(self.filepath)
            
            if self.df.empty:
                err_msg = "The loaded dataset contains no records (empty file)."
                logger.error(err_msg)
                raise ValueError(err_msg)
                
            logger.info(
                f"Successfully loaded dataset. Shape: {self.df.shape[0]} rows, "
                f"{self.df.shape[1]} columns."
            )
            return self.df
            
        except Exception as e:
            logger.error(f"Failed to read CSV dataset: {str(e)}")
            raise

    def get_basic_info(self) -> Dict[str, Any]:
        """
        Extracts high-level statistical summaries and schema info.
        
        Returns:
            Dict[str, Any]: Dictionary containing shape, dtypes, missing values rate, 
                            and duplicates count.
        """
        if self.df is None:
            self.load_data()
            
        assert self.df is not None
        
        info = {
            "shape": self.df.shape,
            "column_count": len(self.df.columns),
            "row_count": len(self.df),
            "missing_values_total": int(self.df.isnull().sum().sum()),
            "duplicate_rows": int(self.df.duplicated().sum()),
            "dtypes": {col: str(dtype) for col, dtype in self.df.dtypes.items()},
        }
        
        logger.info(
            f"Metadata profile created. Duplicate Rows: {info['duplicate_rows']}, "
            f"Total Null Fields: {info['missing_values_total']}"
        )
        return info


def load_dataset_from_path(filepath: str) -> pd.DataFrame:
    """
    Functional wrapper for easy loading of datasets in unified pipelines.
    
    Args:
        filepath (str): Path to CSV data file.
        
    Returns:
        pd.DataFrame: Loaded Pandas dataframe.
    """
    loader = DataLoader(filepath)
    return loader.load_data()
