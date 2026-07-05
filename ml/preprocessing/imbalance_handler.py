"""
AttriSense AI - Class Imbalance Handler Module
SPDX-License-Identifier: Apache-2.0

Implements standard techniques for handling severely skewed target labels
common in employee attrition datasets (e.g. 15% attrition, 85% stay).
"""

import logging
import numpy as np
import pandas as pd
from typing import Tuple, Dict

logger = logging.getLogger("ClassImbalanceHandler")


class ClassImbalanceHandler:
    """
    Adjusts class balances to avoid bias towards dominant labels in supervised training.
    """

    def __init__(self, target_column: str = "Attrition", strategy: str = "oversample"):
        """
        Args:
            target_column (str): The column representing the prediction goal.
            strategy (str): Method to balance. Options: 'oversample', 'undersample', 'none'.
        """
        self.target_column = target_column
        self.strategy = strategy

    def balance_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Balances the dataset classes based on the selected strategy.
        
        Args:
            df (pd.DataFrame): Dataframe to balance.
            
        Returns:
            pd.DataFrame: Re-balanced dataframe.
        """
        if self.target_column not in df.columns or self.strategy == "none":
            return df

        # Group by target class
        grouped = df.groupby(self.target_column)
        class_sizes = grouped.size().to_dict()
        
        if len(class_sizes) < 2:
            logger.warning("Target class contains fewer than 2 unique categories. Balancing skipped.")
            return df
            
        # Identify majority and minority categories
        classes_sorted = sorted(class_sizes.items(), key=lambda x: x[1])
        minority_class, min_size = classes_sorted[0]
        majority_class, max_size = classes_sorted[1]
        
        logger.info(
            f"Class balance audit. Majority: '{majority_class}' (N={max_size}), "
            f"Minority: '{minority_class}' (N={min_size}). Strategy selected: {self.strategy}"
        )
        
        minority_df = df[df[self.target_column] == minority_class]
        majority_df = df[df[self.target_column] == majority_class]

        if self.strategy == "oversample":
            # Simple random replication of minority class
            replicated_minority = minority_df.sample(n=max_size, replace=True, random_state=42)
            balanced_df = pd.concat([majority_df, replicated_minority]).sample(frac=1.0, random_state=42)
            logger.info(f"Oversampled minority class to match majority. Balanced dataset row count: {len(balanced_df)}")
            return balanced_df
            
        elif self.strategy == "undersample":
            # Simple random downsampling of majority class
            shrunk_majority = majority_df.sample(n=min_size, replace=False, random_state=42)
            balanced_df = pd.concat([shrunk_majority, minority_df]).sample(frac=1.0, random_state=42)
            logger.info(f"Undersampled majority class to match minority. Balanced dataset row count: {len(balanced_df)}")
            return balanced_df
            
        return df

    @staticmethod
    def get_strategy_documentation() -> Dict[str, str]:
        """
        Provides critical guidelines specifying when to invoke each balancing approach.
        """
        return {
            "oversampling": (
                "Replicates minority classes randomly. Ideal for small datasets to retain absolute informational entropy. "
                "Drawback: Risk of overfitting on the replicated minority records."
            ),
            "undersampling": (
                "Shrinks majority classes randomly. Best for extremely large big-data systems to minimize training duration. "
                "Drawback: Discards valuable data patterns and statistical variance from dropped majority samples."
            ),
            "smote": (
                "Synthetic Minority Over-sampling Technique. Generates completely synthetic data points along line segments "
                "connecting nearest neighbors of minority classes. Solves overfitting but may introduce noisy synthetic samples "
                "where classes overlap."
            )
        }
