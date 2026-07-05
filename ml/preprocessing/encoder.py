"""
AttriSense AI - Categorical Feature Encoder Module
SPDX-License-Identifier: Apache-2.0

Implements standard, reusable column transformers for converting qualitative
and nominal categorical elements into numeric arrays (using One-Hot and Ordinal encoding).
"""

import logging
import pandas as pd
from typing import Dict, List, Optional, Any

logger = logging.getLogger("CategoricalEncoder")


class CategoricalEncoder:
    """
    Manages robust mapping and encoding of text category traits into dense numeric vectors.
    """

    def __init__(self, one_hot_cols: List[str], ordinal_mappings: Optional[Dict[str, Dict[str, int]]] = None):
        """
        Args:
            one_hot_cols (List[str]): Columns for binary dummy variable expansion.
            ordinal_mappings (Dict[str, Dict[str, int]]): Custom ordinal scales (e.g. {'OverTime': {'No': 0, 'Yes': 1}})
        """
        self.one_hot_cols = one_hot_cols
        self.ordinal_mappings = ordinal_mappings or {}
        
        # Saves unique categories discovered in train set to guarantee shape match on test set
        self.one_hot_categories_: Dict[str, List[Any]] = {}

    def fit(self, df: pd.DataFrame) -> "CategoricalEncoder":
        """
        Records present category sets for multi-class dummy arrays.
        """
        self.one_hot_categories_ = {}
        
        for col in self.one_hot_cols:
            if col in df.columns:
                unique_cats = df[col].dropna().unique().tolist()
                self.one_hot_categories_[col] = sorted(unique_cats)
                
        logger.info(f"Registered dummy category maps for: {list(self.one_hot_categories_.keys())}")
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Executes dummy expansion and replaces ordinal values based on registered mappings.
        """
        transformed_df = df.copy()
        
        # 1. Map Ordinal Scales
        for col, mapping in self.ordinal_mappings.items():
            if col in transformed_df.columns:
                # Convert values, using the mode as fallback for unmatched elements
                fallback_val = list(mapping.values())[0] if mapping else 0
                transformed_df[col] = transformed_df[col].map(mapping).fillna(fallback_val).astype(int)
                logger.debug(f"Applied ordinal mapping on feature '{col}': {mapping}")
                
        # 2. Map One-Hot Columns
        for col in self.one_hot_cols:
            if col not in transformed_df.columns:
                continue
                
            categories = self.one_hot_categories_.get(col, [])
            
            # Create a column for each registered category to avoid column misalignment
            for cat in categories:
                col_name = f"{col}_{str(cat).replace(' ', '_')}"
                transformed_df[col_name] = (transformed_df[col] == cat).astype(int)
                
            # Drop original unencoded object column
            transformed_df = transformed_df.drop(columns=[col])
            logger.debug(f"Expanded One-Hot dummy variables for column: '{col}'")
            
        return transformed_df

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fits categories and executes encoding transformations.
        """
        return self.fit(df).transform(df)
