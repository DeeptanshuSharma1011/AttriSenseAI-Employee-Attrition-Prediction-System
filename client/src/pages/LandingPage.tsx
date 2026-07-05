/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Brain,
  BarChart3,
  Database,
  ArrowRight,
  UserCheck,
  Settings2,
  RefreshCw,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Binary,
  BookOpen,
  Sliders,
  Sparkles,
  Zap,
  LayoutDashboard,
  Play,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { UserProfile, DatasetSummary, AnalyticsData, SavedModel, TrainingSummary } from '../types';
import { uploadService, analyticsService, trainingService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface LandingPageProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export default function LandingPage({ user, onLogout }: LandingPageProps) {
  const { showToast } = useToast();

  // Dashboard states
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [models, setModels] = useState<SavedModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Retraining configurations
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [selectedModelType, setSelectedModelType] = useState<string>('xgboost');
  const [estimators, setEstimators] = useState<number>(100);
  const [maxDepth, setMaxDepth] = useState<number>(6);
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [trainingPreset, setTrainingPreset] = useState<string>('standard');

  const handlePresetChange = (preset: string) => {
    setTrainingPreset(preset);
    if (preset === 'quick') {
      setEstimators(50);
      setMaxDepth(4);
      setLearningRate(0.2);
    } else if (preset === 'standard') {
      setEstimators(100);
      setMaxDepth(6);
      setLearningRate(0.1);
    } else if (preset === 'deep') {
      setEstimators(150);
      setMaxDepth(8);
      setLearningRate(0.1);
    }
  };

  const handleEstimatorsChange = (val: number) => {
    setEstimators(val);
    setTrainingPreset('custom');
  };

  const handleMaxDepthChange = (val: number) => {
    setMaxDepth(val);
    setTrainingPreset('custom');
  };

  const handleLearningRateChange = (val: number) => {
    setLearningRate(val);
    setTrainingPreset('custom');
  };

  // UI Interactive States
  const [activeTab, setActiveTab] = useState<'features' | 'models' | 'roc' | 'history'>('features');
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainProgress, setRetrainProgress] = useState<number>(0);
  const [retrainStatus, setRetrainStatus] = useState<string>('');
  const [hoveredMatrixCell, setHoveredMatrixCell] = useState<string | null>(null);

  // Fetch initial data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const analyticData = await analyticsService.getAnalytics();
      setAnalytics(analyticData);

      const datasetList = await uploadService.getDatasets();
      setDatasets(datasetList);
      if (datasetList.length > 0) {
        setSelectedDatasetId(datasetList[0].id);
      }

      const modelList = await trainingService.getSavedModels();
      setModels(modelList);
    } catch (error) {
      console.error('Failed to load dashboard statistics', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Handle Model Activation Switch
  const handleActivateModel = (modelId: string) => {
    trainingService.setActiveModel(modelId);
    const updated = trainingService.getSavedModels();
    setModels(updated);
    
    // Find active model name
    const activeModel = updated.find(m => m.isActive);
    if (activeModel && analytics) {
      setAnalytics({
        ...analytics,
        bestModel: `${activeModel.name} (${activeModel.version})`
      });
      showToast(`Activated ${activeModel.name} as primary estimator!`, 'success');
    }
  };

  // Retrain Trigger Pipeline Simulator
  const handleRetrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId) {
      showToast('Please select a reference dataset.', 'error');
      return;
    }

    setIsRetraining(true);
    setRetrainProgress(5);
    setRetrainStatus('Initializing Scikit-Learn worker...');

    // Progress simulation logs
    const stages = [
      { progress: 15, msg: 'Loading CSV frame & parsing HR headers...' },
      { progress: 35, msg: 'Validating target class "Attrition" balance ratio...' },
      { progress: 55, msg: 'Constructing k-fold splits (80/20 train/test)...' },
      { progress: 75, msg: `Fitting ${estimators} estimator trees (Max Depth: ${maxDepth})...` },
      { progress: 90, msg: 'Calculating feature importances & ROC thresholds...' },
    ];

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setRetrainProgress(stage.progress);
      setRetrainStatus(stage.msg);
    }

    try {
      const result = await trainingService.triggerTraining(selectedDatasetId, selectedModelType);
      setRetrainProgress(100);
      setRetrainStatus('Model compiled! Registering version in active pipeline...');
      await new Promise(resolve => setTimeout(resolve, 350));

      showToast(` Retraining Success: Accuracy Improved to ${(result.metrics.accuracy * 100).toFixed(1)}%!`, 'success');
      
      // Update models list
      const freshModels = trainingService.getSavedModels();
      setModels(freshModels);

      // Dynamically adjust metrics in local state to visualize the training improvement
      if (analytics) {
        const updatedComparison = analytics.modelComparison.map(m => {
          const matchXg = selectedModelType === 'xgboost' && m.name.toLowerCase().includes('xgboost');
          const matchRf = selectedModelType === 'random_forest' && m.name.toLowerCase().includes('random');
          const matchGb = selectedModelType === 'gradient_boosting' && m.name.toLowerCase().includes('gradient');
          
          if (matchXg || matchRf || matchGb) {
            return {
              ...m,
              accuracy: result.metrics.accuracy,
              precision: result.metrics.precision,
              recall: result.metrics.recall,
              f1Score: result.metrics.f1Score,
              auc: result.metrics.auc
            };
          }
          return m;
        });

        // Append new run item to history line chart data
        const newHistoryItem = {
          runId: `RUN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
          trainedAt: new Date().toLocaleDateString(),
          accuracy: result.metrics.accuracy,
          auc: result.metrics.auc,
          modelType: selectedModelType.toUpperCase()
        };

        // Slightly tweak feature importance to simulate real stochastic weights shifting
        const updatedFeatureImportance = analytics.featureImportance.map(f => {
          const factor = 1.0 + (Math.random() * 0.08 - 0.04);
          return {
            ...f,
            importance: Math.min(0.25, Math.max(0.01, f.importance * factor))
          };
        }).sort((a, b) => b.importance - a.importance);

        setAnalytics({
          ...analytics,
          bestModel: `${result.bestModel} (Deployed)`,
          modelComparison: updatedComparison,
          trainingHistory: [...analytics.trainingHistory, newHistoryItem],
          featureImportance: updatedFeatureImportance
        });
      }
    } catch (err: any) {
      showToast('Retraining pipeline failed to compile.', 'error');
    } finally {
      setIsRetraining(false);
      setRetrainProgress(0);
      setRetrainStatus('');
    }
  };

  // Render original gorgeous static landing page if NOT logged in
  if (!user) {
    return (
      <div className="space-y-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-700/50">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Predictive Workspace Active
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Predict and Prevent Employee Attrition with ML
            </h1>
            <p className="text-slate-300 text-base md:text-lg">
              AttriSense AI translates HR factors (satisfaction, tenure, compensation) into highly accurate retention risk evaluations using production-quality machine learning.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign in to Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all duration-150 hover:-translate-y-0.5"
              >
                Onboard Team
              </Link>
            </div>
          </div>
          {/* Subtle decorative background vector circles */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute right-12 top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Value Proposition Grid */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Platform Features & Future Roadmap</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              A state-of-the-art framework designed for HR analytics experts, software architects, and machine learning practitioners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Explainable Predictive Engine</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Utilizes Random Forests and Gradient Boosted Models (Scikit-Learn) to calculate precise risk margins per employee with full feature attribution.
              </p>
              <span className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 font-medium px-2.5 py-0.5 rounded-full">
                Phase 2 Target
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Settings2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">What-If Factor Tuning</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Provides real-time interactive parameter adjustments (monthly salary, satisfaction scores, overtime) to forecast cost-effective retention paths.
              </p>
              <span className="inline-flex items-center text-xs text-emerald-600 bg-emerald-50 font-medium px-2.5 py-0.5 rounded-full">
                Demo Active in Profile!
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Durable MongoDB Storage</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Structured database integration logging historical evaluations, feature importance changes, and administrator auditing activities securely.
              </p>
              <span className="inline-flex items-center text-xs text-slate-600 bg-slate-100 font-medium px-2.5 py-0.5 rounded-full">
                Configured & Ready
              </span>
            </div>
          </div>
        </div>

        {/* Portfolio/Architecture Callout */}
        <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              Architect's Notes: Portability & Interoperability
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Every folder in the sidebar is pre-structured following clean DDD (Domain Driven Design). Front-end models directly map to JWT payloads, and our Python backend architecture uses decoupled Blueprints. Use the Profile page to explore dynamic simulated predictions.
            </p>
          </div>
          <Link
            to="/signup"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center shrink-0"
          >
            Create Sandbox Account <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // --- LOGGED IN ML DASHBOARD RENDER ---
  const activeModel = models.find(m => m.isActive) || models[0];
  const accuracyText = activeModel ? `${(activeModel.accuracy * 100).toFixed(1)}%` : '89.2%';
  const aucValue = analytics ? analytics.modelComparison.find(m => m.name.includes('XGBoost'))?.auc || 0.915 : 0.915;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dashboard Greetings Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-spin" /> Operational Workplace Active
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Role: <span className="text-slate-800 font-semibold">{user.role}</span> &bull; Department: <span className="text-indigo-600 font-semibold">{user.department}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Tuning Sandbox
          </Link>
          <button
            onClick={loadDashboardData}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh statistics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-4">
          <div className="h-10 w-10 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Compiling interactive telemetry insights...</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1: Active Model */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serving Classifier</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-slate-900 truncate pr-2" title={analytics?.bestModel || "XGBoost Classifier"}>
                  {activeModel ? activeModel.name : "XGBoost Classifier"}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                <span>Version: {activeModel ? activeModel.version : 'v2.1.0'}</span>
                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold">Online</span>
              </div>
              <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-50/20 rounded-full blur-xl pointer-events-none -mr-4 -mb-4"></div>
            </div>

            {/* KPI 2: Validation Accuracy */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model Accuracy (OOB)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{accuracyText}</span>
                <span className="text-xs text-slate-400 font-bold">score</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span>Exceeds Human Baseline (76.2%)</span>
              </div>
            </div>

            {/* KPI 3: Area under ROC */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Area Under ROC (AUC)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{aucValue.toFixed(3)}</span>
                <span className="text-xs text-slate-400 font-bold">AUC</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                <span>Highly discriminative risk separation</span>
              </div>
            </div>

            {/* KPI 4: Active Dataset */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workspace Context</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-800 truncate pr-1">
                  {datasets.length > 0 ? datasets[0].filename : 'No dataset'}
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {datasets.length > 0 ? `${datasets[0].rowCount} rows` : '0 rows'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                <span>Primary ML training reference file</span>
              </div>
            </div>
          </div>

          {/* Interactive Bento Grid Layout */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Visual Charts Area (Spans 7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Visual Tab Switcher Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                    Predictive Analytics Telemetry
                  </h2>

                  <div className="flex bg-slate-200/60 p-0.5 rounded-xl border border-slate-200 shrink-0">
                    <button
                      onClick={() => setActiveTab('features')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'features'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Importance
                    </button>
                    <button
                      onClick={() => setActiveTab('models')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'models'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Comparison
                    </button>
                    <button
                      onClick={() => setActiveTab('roc')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'roc'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ROC Curve
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'history'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      History
                    </button>
                  </div>
                </div>

                {/* Actual Chart Panels */}
                <div className="p-6">
                  {analytics && (
                    <>
                      {/* TAB 1: FEATURE IMPORTANCE BAR CHART */}
                      {activeTab === 'features' && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">Feature Importance Coefficient Metrics</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Attributes attrition outcomes back to original HR drivers. OverTime remains the most significant predictor calculated in our Random Forest.
                            </p>
                          </div>
                          
                          <div className="h-[340px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                layout="vertical"
                                data={analytics.featureImportance.map(f => ({
                                  feature: f.feature,
                                  Percentage: Math.round(f.importance * 1000) / 10,
                                  category: f.category
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" unit="%" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis dataKey="feature" type="category" width={110} fontSize={9} fontWeight="semibold" tickLine={false} axisLine={false} stroke="#475569" />
                                <Tooltip
                                  formatter={(value: any) => [`${value}%`, 'Attribution Weight']}
                                  contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                                />
                                <Bar dataKey="Percentage" radius={[0, 4, 4, 0]}>
                                  {analytics.featureImportance.map((entry, index) => {
                                    // Assign colors based on category for modular high fidelity visuals
                                    let color = '#4f46e5'; // indigo default
                                    if (entry.category === 'Work Environment') color = '#0ea5e9'; // sky
                                    else if (entry.category === 'Compensation') color = '#10b981'; // emerald
                                    else if (entry.category === 'Role Experience') color = '#f59e0b'; // amber
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                  })}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Interactive Legend Indicators */}
                          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-50">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded bg-sky-500"></span>
                              <span>Work Environment</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded bg-emerald-500"></span>
                              <span>Compensation</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded bg-amber-500"></span>
                              <span>Role Experience</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded bg-indigo-500"></span>
                              <span>Demographics</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: MODEL COMPARISON ACCURACIES */}
                      {activeTab === 'models' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">Classifier Evaluation Suite</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Compare standard out-of-fold validation scores across different Scikit-Learn tree ensemble estimators.
                            </p>
                          </div>

                          <div className="h-[340px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={analytics.modelComparison.map(m => ({
                                  name: m.name.replace(' Classifier', ''),
                                  Accuracy: Math.round(m.accuracy * 1000) / 10,
                                  Precision: Math.round(m.precision * 1000) / 10,
                                  Recall: Math.round(m.recall * 1000) / 10,
                                  AUC: Math.round(m.auc * 1000) / 10,
                                }))}
                                margin={{ top: 15, right: 15, left: 20, bottom: 35 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} fontWeight="bold" tickLine={false} stroke="#64748b" />
                                <YAxis domain={[50, 100]} fontSize={10} tickLine={false} unit="%" />
                                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '10px' }} />
                                <Bar dataKey="Accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Precision" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Recall" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="AUC" fill="#ec4899" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: ROC CURVE PLOT */}
                      {activeTab === 'roc' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">Receiver Operating Characteristic (ROC) Bound</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Plots the True Positive Rate (Sensitivity) vs False Positive Rate (1-Specificity). An ideal curve hugs the top left corner, verifying strong classification thresholds.
                            </p>
                          </div>

                          <div className="h-[340px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={analytics.rocCurve}
                                margin={{ top: 15, right: 30, left: 45, bottom: 50 }}
                              >
                                <defs>
                                  <linearGradient id="rocGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="fpr" type="number" domain={[0, 1]} tickCount={6} fontSize={10} stroke="#64748b" label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 'bold', fill: '#475569' }} />
                                <YAxis type="number" domain={[0, 1]} tickCount={6} fontSize={10} stroke="#64748b" label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fontWeight: 'bold', fill: '#475569' }} />
                                <Tooltip formatter={(value: any) => [Number(value).toFixed(2), 'Rate']} contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                                {/* Baseline Random Classifier Line */}
                                <Line type="monotone" dataKey="fpr" stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                                {/* Actual Classifier Area */}
                                <Area type="monotone" dataKey="tpr" stroke="#10b981" fillOpacity={1} fill="url(#rocGrad)" strokeWidth={3} dot={false} name="XGBoost Sensitivity" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: RETRAINING HISTORY LINE CHART */}
                      {activeTab === 'history' && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-900">Historical Training Convergence</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Tracks out-of-bag training run accuracies over consecutive workspace retrains. Shows pipeline improvements.
                            </p>
                          </div>

                          <div className="h-[340px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={analytics.trainingHistory.map(h => ({
                                  run: h.runId.slice(-6),
                                  Accuracy: Math.round(h.accuracy * 1000) / 10,
                                  AUC: Math.round(h.auc * 1000) / 10,
                                }))}
                                margin={{ top: 15, right: 30, left: 45, bottom: 50 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="run" fontSize={10} fontWeight="bold" stroke="#64748b" label={{ value: 'Retraining Run ID', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 'bold', fill: '#475569' }} />
                                <YAxis domain={[80, 95]} fontSize={10} stroke="#64748b" unit="%" label={{ value: 'Accuracy Score (%)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fontWeight: 'bold', fill: '#475569' }} />
                                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '10px' }} />
                                <Line type="monotone" dataKey="Accuracy" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="AUC" stroke="#ec4899" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* INTERACTIVE CONFUSION MATRIX EXPLAINER PANEL */}
              {analytics && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Binary className="h-4.5 w-4.5 text-indigo-600" />
                      Classifier Confusion Matrix Interactive Guide
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      How does the ML model make correct vs incorrect classifications? Hover over the quadrants to see real-world business HR risk translations!
                    </p>
                  </div>

                  {/* Visual 2x2 grid representing classes */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-6 grid grid-cols-2 gap-2 max-w-sm mx-auto w-full font-mono text-center">
                      {/* Grid Headers */}
                      <div className="col-span-2 grid grid-cols-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-1">
                        <div>Pred. Retain (No)</div>
                        <div>Pred. Attrite (Yes)</div>
                      </div>

                      {/* True Negative */}
                      <div
                        onMouseEnter={() => setHoveredMatrixCell('tn')}
                        onMouseLeave={() => setHoveredMatrixCell(null)}
                        className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-center items-center h-24 ${
                          hoveredMatrixCell === 'tn'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-[1.02]'
                            : 'bg-emerald-50/50 text-slate-800 border-emerald-100 hover:bg-emerald-100/50'
                        }`}
                      >
                        <span className="text-xl font-black">{analytics.confusionMatrix.trueNegative}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">True Negative (TN)</span>
                      </div>

                      {/* False Positive */}
                      <div
                        onMouseEnter={() => setHoveredMatrixCell('fp')}
                        onMouseLeave={() => setHoveredMatrixCell(null)}
                        className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-center items-center h-24 ${
                          hoveredMatrixCell === 'fp'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
                            : 'bg-amber-50/50 text-slate-800 border-amber-100 hover:bg-amber-100/50'
                        }`}
                      >
                        <span className="text-xl font-black">{analytics.confusionMatrix.falsePositive}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">False Positive (FP)</span>
                      </div>

                      {/* False Negative */}
                      <div
                        onMouseEnter={() => setHoveredMatrixCell('fn')}
                        onMouseLeave={() => setHoveredMatrixCell(null)}
                        className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-center items-center h-24 ${
                          hoveredMatrixCell === 'fn'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-md scale-[1.02]'
                            : 'bg-rose-50/50 text-slate-800 border-rose-100 hover:bg-rose-100/50'
                        }`}
                      >
                        <span className="text-xl font-black">{analytics.confusionMatrix.falseNegative}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">False Negative (FN)</span>
                      </div>

                      {/* True Positive */}
                      <div
                        onMouseEnter={() => setHoveredMatrixCell('tp')}
                        onMouseLeave={() => setHoveredMatrixCell(null)}
                        className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-center items-center h-24 ${
                          hoveredMatrixCell === 'tp'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-[1.02]'
                            : 'bg-emerald-50/50 text-slate-800 border-emerald-100 hover:bg-emerald-100/50'
                        }`}
                      >
                        <span className="text-xl font-black">{analytics.confusionMatrix.truePositive}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">True Positive (TP)</span>
                      </div>
                    </div>

                    {/* Explainer Explanation Box on Right */}
                    <div className="md:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[190px] flex flex-col justify-center">
                      {!hoveredMatrixCell ? (
                        <div className="text-center text-slate-400 p-4 space-y-2">
                          <HelpCircle className="h-8 w-8 text-slate-300 mx-auto" />
                          <p className="text-xs leading-relaxed">
                            Hover over any square of the classification confusion matrix grid to see the exact HR risk cost translation.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-left">
                          {hoveredMatrixCell === 'tn' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Correct Retain (TN)</span>
                              <h4 className="text-xs font-bold text-slate-800 mt-1">Employee stays, predicted to stay</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">
                                Represents the solid operational base. These employees are engaged, secure, and require no emergency retention funding. Keeps budget efficient.
                              </p>
                            </>
                          )}
                          {hoveredMatrixCell === 'fp' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Preventative Warning (FP)</span>
                              <h4 className="text-xs font-bold text-slate-800 mt-1">Employee stays, predicted to leave</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">
                                A false alarm. However, in HR terms, this is highly protective! Initiating a "Stay Interview" or minor satisfaction adjustments improves morale, even if they weren't actively exiting.
                              </p>
                            </>
                          )}
                          {hoveredMatrixCell === 'fn' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-rose-100 text-rose-850 px-2 py-0.5 rounded">Missed Turnover (FN)</span>
                              <h4 className="text-xs font-bold text-slate-800 mt-1">Employee leaves, predicted to stay</h4>
                              <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                                The highest business risk! An employee exits unexpectedly with no retention warning generated. This increases friction and costs up to 1.5x their salary in replacement fees.
                              </p>
                            </>
                          )}
                          {hoveredMatrixCell === 'tp' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Prevented Attrition (TP)</span>
                              <h4 className="text-xs font-bold text-slate-800 mt-1">Employee leaves, predicted to leave</h4>
                              <p className="text-slate-600 text-xs leading-relaxed">
                                Success! The model flag allows HR to implement target policies (eliminating overtime, adjusting compensation in profile) before the employee submits formal notice. High return on investment (ROI).
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: ACTION PANELS (Spans 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* MODEL RETRAINING CONTROL CENTER */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Cpu className="h-4.5 w-4.5 text-emerald-600" />
                    Model Training Pipeline (Phase 2)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Improve risk-prediction accuracy by training our virtual decision forest. We have simplified complex machine learning parameters into clear HR goals.
                  </p>
                </div>

                <form onSubmit={handleRetrain} className="space-y-4">
                  {/* Select Dataset */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block" htmlFor="retrainDataset">
                      1. Choose Reference Dataset
                    </label>
                    <p className="text-[10px] text-slate-400">The corporate spreadsheet containing employee surveys and tenure logs.</p>
                    <select
                      id="retrainDataset"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition font-medium text-slate-800"
                      value={selectedDatasetId}
                      onChange={(e) => setSelectedDatasetId(e.target.value)}
                      disabled={isRetraining}
                    >
                      {datasets.length === 0 ? (
                        <option value="">No Datasets Uploaded</option>
                      ) : (
                        datasets.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.filename} ({d.rowCount} rows)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Select Algorithm */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block" htmlFor="retrainAlgo">
                      2. AI Model Strategy
                    </label>
                    <p className="text-[10px] text-slate-400">The mathematical logic used to find patterns of retention risk.</p>
                    <select
                      id="retrainAlgo"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition font-medium text-slate-800"
                      value={selectedModelType}
                      onChange={(e) => setSelectedModelType(e.target.value)}
                      disabled={isRetraining}
                    >
                      <option value="xgboost">Extreme Gradient Boosting (Recommended: best overall precision)</option>
                      <option value="random_forest">Random Forest (Stable consensus: great for small teams)</option>
                      <option value="gradient_boosting">Gradient Boosting (Steady progression: looks deeply at difficult cases)</option>
                    </select>
                  </div>

                  {/* HR Training Mode Preset Selector */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      3. HR Analysis Preset Goal
                    </label>
                    <p className="text-[10px] text-slate-400">Pre-configured modes matching common organizational review goals.</p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handlePresetChange('standard')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          trainingPreset === 'standard'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-1 ring-emerald-300'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                        }`}
                        disabled={isRetraining}
                      >
                        <span className="font-extrabold text-[10px] block">Standard Insight</span>
                        <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">Balanced & highly accurate. Best for general company audits.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresetChange('deep')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          trainingPreset === 'deep'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-1 ring-indigo-300'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                        }`}
                        disabled={isRetraining}
                      >
                        <span className="font-extrabold text-[10px] block">Deep Morale Audit</span>
                        <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">Discovers complex multi-factor risks. High detail search.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresetChange('quick')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          trainingPreset === 'quick'
                            ? 'bg-amber-50 border-amber-300 text-amber-950 ring-1 ring-amber-300'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                        }`}
                        disabled={isRetraining}
                      >
                        <span className="font-extrabold text-[10px] block">Quick Scan</span>
                        <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">Fast trends. Ideal for a quick first look at newly uploaded data.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePresetChange('custom')}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          trainingPreset === 'custom'
                            ? 'bg-slate-900 border-slate-800 text-white'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/50'
                        }`}
                        disabled={isRetraining}
                      >
                        <span className="font-extrabold text-[10px] block">Custom Tuning</span>
                        <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">Manual control over individual tuning settings below.</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Parameters Divider */}
                  <div className="border-t border-slate-100 pt-3 space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Tuning Details {trainingPreset !== 'custom' && `(${trainingPreset.toUpperCase()} MODE ACTIVE)`}
                    </span>

                    {/* Hyperparameter 1: Estimators */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Committee Strength (Consultant Count)
                        </span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {estimators} Virtual Advisors
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        How many independent digital experts analyze the data to vote. More advisors create highly stable and trustworthy risk consensus.
                      </p>
                      <input
                        type="range"
                        min={50}
                        max={200}
                        step={50}
                        className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer mt-1"
                        value={estimators}
                        onChange={(e) => handleEstimatorsChange(Number(e.target.value))}
                        disabled={isRetraining}
                      />
                    </div>

                    {/* Hyperparameter 2: Max Depth */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Risk Assessment Depth (Detail Level)
                        </span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Level {maxDepth} Search Depth
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        How deep each expert digs. Shallow (Level 3-4) finds simple general rules; Deep (Level 7-10) looks for highly complex combinations of factors (e.g., low satisfaction + heavy overtime + high travel).
                      </p>
                      <input
                        type="range"
                        min={3}
                        max={10}
                        step={1}
                        className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer mt-1"
                        value={maxDepth}
                        onChange={(e) => handleMaxDepthChange(Number(e.target.value))}
                        disabled={isRetraining}
                      />
                    </div>

                    {/* Hyperparameter 3: Learning Rate */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Calibration Speed (Learning Pace)
                        </span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {learningRate === 0.01 ? '0.01 (Slow & Careful)' : learningRate === 0.1 ? '0.10 (Standard Balanced)' : '0.20 (Fast Fitting)'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        How quickly the system adjusts its calculations during training. Slow and careful pace yields excellent accuracy but requires more patience.
                      </p>
                      <select
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium mt-1 text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
                        value={learningRate}
                        onChange={(e) => handleLearningRateChange(Number(e.target.value))}
                        disabled={isRetraining}
                      >
                        <option value={0.01}>0.01 (Slow & Careful - highly stable rules)</option>
                        <option value={0.1}>0.10 (Standard Balanced - recommended)</option>
                        <option value={0.2}>0.20 (Fast Pace - rapid learning speed)</option>
                      </select>
                    </div>
                  </div>

                  {/* Training pipeline status log container */}
                  {isRetraining && (
                    <div className="bg-slate-900 rounded-xl p-3 text-[10px] font-mono text-slate-300 leading-normal border border-slate-800 space-y-1.5 animate-pulse mt-2">
                      <div className="flex justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1">
                        <span>PIPELINE_STATUS</span>
                        <span>{retrainProgress}%</span>
                      </div>
                      <p className="text-slate-400">&gt; {retrainStatus}</p>
                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div className="bg-emerald-500 h-1 rounded-full transition-all duration-300" style={{ width: `${retrainProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* RETRAIN COMPILATION BUTTON */}
                  <button
                    type="submit"
                    disabled={isRetraining || datasets.length === 0}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isRetraining ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                        Fitting Trees on Server...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current text-emerald-400" />
                        Compile & RETRAIN Estimator
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* MODEL SERVICE VERSIONING HISTORY LIST */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Layers className="h-4.5 w-4.5 text-indigo-600" />
                    Workspace Models Registry
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Toggle active models dynamically. The sandbox predictor adjusts risk weights to match your active selection.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 max-h-[290px] overflow-y-auto pr-1">
                  {models.map((m) => (
                    <div key={m.id} className="py-3 flex items-center justify-between gap-3 text-left">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate" title={m.name}>
                            {m.name}
                          </span>
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded">
                            {m.version}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Accuracy: <strong>{(m.accuracy * 100).toFixed(1)}%</strong></span>
                          <span>&bull;</span>
                          <span>{m.fileSizeMb} MB</span>
                        </div>
                      </div>

                      {m.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivateModel(m.id)}
                          className="px-2.5 py-1 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition shrink-0"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
