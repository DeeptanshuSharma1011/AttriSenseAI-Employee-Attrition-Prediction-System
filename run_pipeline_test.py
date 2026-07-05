"""
AttriSense AI - Preprocessing Pipeline Verification Runner
SPDX-License-Identifier: Apache-2.0
"""

import os
import sys
import logging

# Ensure root directory is in path so we can import ml and visualization packages
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from ml.preprocessing import preprocess_data, DataLoader
from visualization import VisualizerEDA

# Set logging to display informative messages
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def main():
    print("======================================================================")
    print("🚀 Running AttriSense AI Preprocessing Pipeline Verification...")
    print("======================================================================")
    
    raw_csv = "datasets/raw/ibm_hr_attrition.csv"
    
    if not os.path.exists(raw_csv):
        print(f"❌ Error: Required seed dataset not found at: {raw_csv}")
        sys.exit(1)
        
    # 1. Test DataLoader and load raw data
    print("\n[Step 1] Loading raw dataset...")
    loader = DataLoader(raw_csv)
    df = loader.load_data()
    print(f"✅ Loaded raw dataset successfully. Shape: {df.shape}")
    
    # 2. Test EDA & Visualization
    print("\n[Step 2] Executing VisualizerEDA suite...")
    viz = VisualizerEDA()
    viz.plot_target_distribution(df, "Attrition")
    viz.plot_numerical_distributions(df, ["Age", "DailyRate", "DistanceFromHome", "MonthlyIncome"])
    viz.plot_correlation_heatmap(df, ["Age", "DailyRate", "DistanceFromHome", "MonthlyIncome"])
    viz.plot_categorical_vs_target(df, ["BusinessTravel", "Department"])
    viz.plot_box_and_violin_outliers(df, "MonthlyIncome")
    print("✅ Created and saved professional visualizations under visualization/reports/.")
    
    # 3. Test Unified Preprocessing Pipeline
    print("\n[Step 3] Running full preprocessing pipeline fit-transform...")
    train_df, test_df = preprocess_data(raw_csv)
    print(f"✅ Preprocessing pipeline complete.")
    print(f"   - Train Split Shape: {train_df.shape}")
    print(f"   - Test Split Shape: {test_df.shape}")
    print(f"   - Train Attrition Distribution: {train_df['Attrition'].value_counts().to_dict()}")
    
    # Verify file saves
    assert os.path.exists("datasets/processed/train.csv"), "Missing train.csv"
    assert os.path.exists("datasets/processed/test.csv"), "Missing test.csv"
    print("\n🎉 Preprocessing Pipeline Validation successful!")
    print("======================================================================")


if __name__ == "__main__":
    main()
