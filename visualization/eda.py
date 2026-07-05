"""
AttriSense AI - Exploratory Data Analysis (EDA) & Visualization Module
SPDX-License-Identifier: Apache-2.0

Provides enterprise-quality data visualization routines to generate 
insights on distributions, correlations, outliers, and class distributions.
"""

import os
import logging
import pandas as pd
import numpy as np
import matplotlib
# Use Agg backend to avoid GUI window popup issues in headless/server container environments
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from typing import List, Optional

logger = logging.getLogger("VisualizationEDA")


class VisualizerEDA:
    """
    Renders high-fidelity statistical plots for HR analytics data.
    """

    def __init__(self, output_dir: str = "visualization/reports"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Configure seaborn aesthetics for professional look
        sns.set_theme(style="whitegrid")
        plt.rcParams.update({
            'font.family': 'sans-serif',
            'font.size': 11,
            'axes.labelsize': 12,
            'axes.titlesize': 14,
            'xtick.labelsize': 10,
            'ytick.labelsize': 10,
            'figure.titlesize': 16
        })

    def plot_target_distribution(self, df: pd.DataFrame, target_col: str = "Attrition") -> str:
        """
        Plots count distributions and percentages of the attrition target variable.
        """
        if target_col not in df.columns:
            logger.warning(f"Target column '{target_col}' not found in dataframe.")
            return ""

        plt.figure(figsize=(7, 5))
        counts = df[target_col].value_counts()
        percentages = df[target_col].value_counts(normalize=True) * 100

        ax = sns.countplot(x=target_col, data=df, palette="crest", hue=target_col)
        plt.title("Employee Attrition Distribution Rates", pad=15)
        plt.ylabel("Employee Count")
        plt.xlabel("Attrition Status")
        
        # Annotate percentages
        for i, (count, pct) in enumerate(zip(counts, percentages)):
            ax.annotate(f"{count}\n({pct:.1f}%)", xy=(i, count + (df.shape[0] * 0.02)), 
                        ha='center', va='bottom', fontweight='bold', color='#333333')
            
        plt.tight_layout()
        save_path = os.path.join(self.output_dir, "target_distribution.png")
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Target distribution visualization saved to: {save_path}")
        return save_path

    def plot_numerical_distributions(self, df: pd.DataFrame, num_cols: List[str]) -> str:
        """
        Creates grid histograms of employee numerical values like Age, Income, Tenure.
        """
        valid_cols = [col for col in num_cols if col in df.columns]
        if not valid_cols:
            return ""

        num_features = len(valid_cols)
        cols_per_row = 3
        rows = (num_features + cols_per_row - 1) // cols_per_row

        fig, axes = plt.subplots(rows, cols_per_row, figsize=(15, rows * 4))
        axes = axes.flatten()

        for i, col in enumerate(valid_cols):
            sns.histplot(df[col], kde=True, ax=axes[i], color="#3a86c8", bins=20)
            axes[i].set_title(f"Distribution of {col}")
            axes[i].set_xlabel("")
            axes[i].set_ylabel("Frequency")

        # Hide unused subplots
        for j in range(i + 1, len(axes)):
            fig.delaxes(axes[j])

        plt.suptitle("Distributions of Key Quantitative Employee Attributes", y=0.98)
        plt.tight_layout()
        save_path = os.path.join(self.output_dir, "numerical_distributions.png")
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Numerical distribution grid saved to: {save_path}")
        return save_path

    def plot_correlation_heatmap(self, df: pd.DataFrame, num_cols: List[str]) -> str:
        """
        Plots a clean, readable Pearson correlation heatmap.
        """
        valid_cols = [col for col in num_cols if col in df.columns]
        if not valid_cols:
            return ""

        corr_matrix = df[valid_cols].corr()

        plt.figure(figsize=(10, 8))
        sns.heatmap(
            corr_matrix, 
            annot=True, 
            fmt=".2f", 
            cmap="coolwarm", 
            square=True, 
            cbar_kws={"shrink": 0.8},
            linewidths=0.5
        )
        plt.title("Correlation Matrix of Numeric Features", pad=20)
        plt.tight_layout()
        save_path = os.path.join(self.output_dir, "correlation_heatmap.png")
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Correlation heatmap visualization saved to: {save_path}")
        return save_path

    def plot_categorical_vs_target(self, df: pd.DataFrame, cat_cols: List[str], target_col: str = "Attrition") -> str:
        """
        Generates grouped count plots contrasting categorical columns against the target attrition state.
        """
        valid_cols = [col for col in cat_cols if col in df.columns]
        if not valid_cols:
            return ""

        num_features = len(valid_cols)
        fig, axes = plt.subplots(num_features, 1, figsize=(11, num_features * 4.5))
        if num_features == 1:
            axes = [axes]

        for i, col in enumerate(valid_cols):
            sns.countplot(
                x=col, 
                hue=target_col, 
                data=df, 
                ax=axes[i], 
                palette="viridis",
                edgecolor="0.2"
            )
            axes[i].set_title(f"Attrition Frequency by {col}")
            axes[i].set_xlabel("")
            axes[i].set_ylabel("Employee Count")
            # Rotate labels if categories are text heavy
            if df[col].nunique() > 3:
                axes[i].tick_params(axis='x', rotation=25)

        plt.tight_layout()
        save_path = os.path.join(self.output_dir, "categorical_vs_target.png")
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Categorical comparative distributions saved to: {save_path}")
        return save_path

    def plot_box_and_violin_outliers(self, df: pd.DataFrame, num_col: str, group_col: str = "Attrition") -> str:
        """
        Produces side-by-side Box and Violin plots to visualize skewness and potential outlier densities.
        """
        if num_col not in df.columns:
            return ""

        fig, axes = plt.subplots(1, 2, figsize=(14, 5))
        
        # 1. Boxplot
        sns.boxplot(x=group_col, y=num_col, data=df, ax=axes[0], palette="Set2", hue=group_col)
        axes[0].set_title(f"Boxplot of {num_col} vs {group_col}")
        
        # 2. Violinplot
        sns.violinplot(x=group_col, y=num_col, data=df, ax=axes[1], palette="Set2", hue=group_col)
        axes[1].set_title(f"Violin Plot of {num_col} vs {group_col}")
        
        plt.suptitle(f"Exploratory Outlier Analysis on: '{num_col}' grouped by '{group_col}'")
        plt.tight_layout()
        save_path = os.path.join(self.output_dir, f"outlier_analysis_{num_col}.png")
        plt.savefig(save_path, dpi=300)
        plt.close()
        logger.info(f"Outlier diagnostics plot for {num_col} saved to: {save_path}")
        return save_path
