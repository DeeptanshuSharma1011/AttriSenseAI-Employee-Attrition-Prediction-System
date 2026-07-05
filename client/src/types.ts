/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface UserProfile extends User {
  department: string;
  jobRole: string;
  monthlyIncome: number;
  yearsAtCompany: number;
  workLifeBalance: number; // Scale 1-4
  jobSatisfaction: number; // Scale 1-4
  environmentSatisfaction: number; // Scale 1-4
  overTime: 'Yes' | 'No';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PredictionInput {
  age: number;
  department: string;
  jobRole: string;
  monthlyIncome: number;
  yearsAtCompany: number;
  businessTravel: string; // 'Travel_Rarely', 'Travel_Frequently', 'Non-Travel'
  jobSatisfaction: number; // Scale 1-4
  overTime: 'Yes' | 'No';
  distanceFromHome: number; // 1-29 km
  education: number; // 1-5 Scale
  educationField: string; // 'Life Sciences', 'Medical', 'Marketing', etc.
  environmentSatisfaction: number; // 1-4 Scale
  workLifeBalance: number; // 1-4 Scale
  maritalStatus: string; // 'Single', 'Married', 'Divorced'
  gender: 'Male' | 'Female';
  yearsInCurrentRole: number;
  yearsSinceLastPromotion: number;
  numCompaniesWorked: number;
  stockOptionLevel: number; // 0-3
}

export interface PredictionResponse {
  success: boolean;
  prediction: 'Yes' | 'No'; // Yes = High Risk of Attrition
  confidenceScore: number; // Confidence percentage e.g. 84.5
  probability: number; // Probability float e.g. 0.845
  responseTimeMs: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  riskFactors: Array<{ factor: string; impact: 'High' | 'Medium'; description: string }>;
}

export interface DatasetSummary {
  id: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSizeKb: number;
  rowCount: number;
  columnCount: number;
  features: string[];
  classDistribution: {
    retained: number;
    attrited: number;
  };
  validationReport?: {
    isValid: boolean;
    missingFeatures: string[];
    totalMissingValues: number;
    duplicateRows: number;
    corruptedRowsCount: number;
    warnings: Array<{ severity: 'High' | 'Medium' | 'Low'; field: string; message: string }>;
    previewRows?: Array<Record<string, string | number>>;
  };
}

export interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface ModelMetric {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  category: 'Compensation' | 'Work Environment' | 'Role Experience' | 'Demographics';
}

export interface TrainingHistoryItem {
  epoch?: number;
  runId: string;
  trainedAt: string;
  accuracy: number;
  auc: number;
  loss?: number;
  modelType: string;
}

export interface AnalyticsData {
  modelComparison: ModelMetric[];
  bestModel: string;
  confusionMatrix: ConfusionMatrix;
  featureImportance: FeatureImportance[];
  rocCurve: Array<{ fpr: number; tpr: number }>;
  trainingHistory: TrainingHistoryItem[];
}

export interface SavedModel {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  trainedAt: string;
  fileSizeMb: number;
  isActive: boolean;
}

export interface TrainingSummary {
  success: boolean;
  bestModel: string;
  trainingTimeSec: number;
  metrics: ModelMetric;
  accuracyImproved: boolean;
  message: string;
}
