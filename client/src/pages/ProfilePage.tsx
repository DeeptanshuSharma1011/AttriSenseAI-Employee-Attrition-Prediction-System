/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, AlertTriangle, CheckCircle, Flame, Sparkles, Building2, Calendar, IndianRupee, RefreshCw } from 'lucide-react';

interface ProfilePageProps {
  user: UserProfile | null;
  onUpdateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
}

export default function ProfilePage({ user, onUpdateProfile }: ProfilePageProps) {
  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500">Please authenticate to access the employee factor controls.</p>
      </div>
    );
  }

  // Core Factor Sliders State
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [jobRole, setJobRole] = useState(user.jobRole);
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthlyIncome);
  const [yearsAtCompany, setYearsAtCompany] = useState(user.yearsAtCompany);
  const [workLifeBalance, setWorkLifeBalance] = useState(user.workLifeBalance);
  const [jobSatisfaction, setJobSatisfaction] = useState(user.jobSatisfaction);
  const [environmentSatisfaction, setEnvironmentSatisfaction] = useState(user.environmentSatisfaction);
  const [overTime, setOverTime] = useState<"Yes" | "No">(user.overTime);

  // Status & Indicator states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Re-sync if the auth session user changes
  useEffect(() => {
    setName(user.name);
    setDepartment(user.department);
    setJobRole(user.jobRole);
    setMonthlyIncome(user.monthlyIncome);
    setYearsAtCompany(user.yearsAtCompany);
    setWorkLifeBalance(user.workLifeBalance);
    setJobSatisfaction(user.jobSatisfaction);
    setEnvironmentSatisfaction(user.environmentSatisfaction);
    setOverTime(user.overTime);
  }, [user]);

  // Dynamic simulated Attrition Risk calculation based on logical statistical correlations
  // (mirrors the coefficients of a standard logistic regression model)
  const calculateSimulatedRisk = () => {
    let score = 50; // base score

    // Lower income increases risk (e.g., target 150000 as high-income boundary in INR)
    const incomeFactor = (150000 - monthlyIncome) / 150000;
    score += incomeFactor * 25;

    // Overtime significantly increases risk
    if (overTime === 'Yes') {
      score += 20;
    } else {
      score -= 10;
    }

    // Job satisfaction reductions increase risk (Scale 1 to 4)
    score += (4 - jobSatisfaction) * 8;

    // Work-life balance reductions increase risk (Scale 1 to 4)
    score += (4 - workLifeBalance) * 8;

    // Environment satisfaction (Scale 1 to 4)
    score += (4 - environmentSatisfaction) * 6;

    // Short-tenured employees are at higher risk
    if (yearsAtCompany <= 1) {
      score += 15;
    } else if (yearsAtCompany > 5) {
      score -= 10;
    }

    // Clip between 5% and 95%
    return Math.max(5, Math.min(95, Math.round(score)));
  };

  const riskScore = calculateSimulatedRisk();

  // Determine risk category and styling
  const getRiskDetails = (score: number) => {
    if (score >= 70) {
      return {
        label: 'Critical Turnover Risk',
        colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
        barColor: 'bg-rose-600',
        badge: 'bg-rose-500 text-white',
        icon: Flame,
        action: 'Immediate action advised. Compensation audit, overtime relief, and active feedback loops are highly recommended.',
      };
    } else if (score >= 40) {
      return {
        label: 'Moderate Attrition Risk',
        colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        badge: 'bg-amber-500 text-slate-950',
        icon: AlertTriangle,
        action: 'Monitor factors carefully. Improving work environment rating and job-role match could transition this employee to low risk.',
      };
    } else {
      return {
        label: 'Healthy Retentive Status',
        colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-500',
        badge: 'bg-emerald-500 text-slate-950',
        icon: CheckCircle,
        action: 'No direct retention threats detected. Maintain current structural parameters and compensation packages.',
      };
    }
  };

  const risk = getRiskDetails(riskScore);
  const RiskIcon = risk.icon;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    try {
      await onUpdateProfile({
        name,
        department,
        jobRole,
        monthlyIncome: Number(monthlyIncome),
        yearsAtCompany: Number(yearsAtCompany),
        workLifeBalance: Number(workLifeBalance),
        jobSatisfaction: Number(jobSatisfaction),
        environmentSatisfaction: Number(environmentSatisfaction),
        overTime,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update employee profile factors.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Retention Sandbox</h2>
          <p className="text-slate-500 text-sm">
            Tune specific behavioral, compensation, and career factors to observe real-time predicted attrition risk.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full font-medium">
          <Sparkles className="h-4 w-4 animate-pulse" />
          Powered by AttriSense AI Sandbox Engine
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Hand: Factor Tuning Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Employee Core Attributes
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="empName">Employee / Operator Name</label>
              <input
                id="empName"
                type="text"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="dept">Department</label>
              <select
                id="dept"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Human Resources">Human Resources</option>
                <option value="Research & Development">Research & Development</option>
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="jobRole">Job Role</label>
              <input
                id="jobRole"
                type="text"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700" htmlFor="years">Years at Company</label>
              <input
                id="years"
                type="number"
                min="0"
                max="40"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition"
                value={yearsAtCompany}
                onChange={(e) => setYearsAtCompany(Number(e.target.value))}
              />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2">
            Predictive Model Variables
          </h3>

          <div className="space-y-5">
            {/* Monthly Income Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-slate-500" />
                  Monthly Income (INR)
                </span>
                <span className="text-emerald-700 font-bold">₹{monthlyIncome.toLocaleString('en-IN')}/mo</span>
              </div>
              <input
                type="range"
                min="15000"
                max="500000"
                step="5000"
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Entry (₹15,000)</span>
                <span>Executive (₹5,00,000)</span>
              </div>
            </div>

            {/* Overtime Toggle */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-800 block">Required Overtime Duty</span>
                <span className="text-[11px] text-slate-500">Adds substantial burn-out multipliers to attrition forecasts</span>
              </div>
              <div className="flex gap-1.5 p-1 bg-slate-200/60 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOverTime('Yes')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    overTime === 'Yes'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setOverTime('No')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    overTime === 'No'
                      ? 'bg-emerald-600 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Work Life Balance */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Work-Life Balance (Rating)</span>
                <span className="text-indigo-600">{workLifeBalance} / 4</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                value={workLifeBalance}
                onChange={(e) => setWorkLifeBalance(Number(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>1 (Poor)</span>
                <span>2 (Fair)</span>
                <span>3 (Good)</span>
                <span>4 (Best)</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-1">
              {/* Job Satisfaction */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block" htmlFor="jobSat">Job Satisfaction</label>
                <select
                  id="jobSat"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition"
                  value={jobSatisfaction}
                  onChange={(e) => setJobSatisfaction(Number(e.target.value))}
                >
                  <option value={1}>1 - Low Satisfaction</option>
                  <option value={2}>2 - Medium Satisfaction</option>
                  <option value={3}>3 - High Satisfaction</option>
                  <option value={4}>4 - Outstanding Satisfaction</option>
                </select>
              </div>

              {/* Environment Satisfaction */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block" htmlFor="envSat">Work Environment Rating</label>
                <select
                  id="envSat"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition"
                  value={environmentSatisfaction}
                  onChange={(e) => setEnvironmentSatisfaction(Number(e.target.value))}
                >
                  <option value={1}>1 - Low Environment Quality</option>
                  <option value={2}>2 - Medium Environment Quality</option>
                  <option value={3}>3 - High Environment Quality</option>
                  <option value={4}>4 - Exceptional Quality</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-6">
            <div>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-bounce">
                  <CheckCircle className="h-4 w-4" /> Attributes persisted in DB sandbox!
                </span>
              )}
              {errorMsg && <span className="text-xs font-semibold text-rose-600">{errorMsg}</span>}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Profile Factors
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Hand: Prediction HUD */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Risk HUD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">
              Attrition Predictor Dashboard
            </h3>

            {/* Risk Gauge */}
            <div className="text-center py-6 space-y-3 relative overflow-hidden bg-slate-50 rounded-2xl border border-slate-100">
              <div className="relative inline-flex items-center justify-center">
                {/* Visual Circle Gauge Outline */}
                <div className="text-4xl md:text-5xl font-extrabold text-slate-800 flex items-baseline tracking-tight">
                  {riskScore}
                  <span className="text-lg font-semibold text-slate-400">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${risk.badge}`}>
                  <RiskIcon className="h-3.5 w-3.5" />
                  {risk.label}
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">Turnover Probability Index</span>
              </div>
            </div>

            {/* Probability Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Predictive Thresholds</span>
                <span>Score: {riskScore} / 100</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                <div className={`h-full transition-all duration-300 ${risk.barColor}`} style={{ width: `${riskScore}%` }}></div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                <span className="text-emerald-600">Low (&lt;40%)</span>
                <span className="text-amber-600">Med (40-70%)</span>
                <span className="text-rose-600">High (&gt;70%)</span>
              </div>
            </div>

            {/* Dynamic Model Output Actions */}
            <div className={`p-4 border rounded-xl text-xs space-y-2 leading-relaxed ${risk.colorClass}`}>
              <span className="font-bold block uppercase tracking-wide text-[10px]">Recommended Retention Response:</span>
              <p className="font-medium text-slate-700">{risk.action}</p>
            </div>
          </div>

          {/* Model Feature Mapping */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2">
              Model Inputs Debug Panel
            </h3>
            <div className="space-y-2 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-500">TENURE_YEARS</span>
                <span className="text-slate-100">{yearsAtCompany}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-500">MONTHLY_INCOME</span>
                <span className="text-slate-100">₹{monthlyIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-500">REQUIRED_OVERTIME</span>
                <span className="text-slate-100">"{overTime}"</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-500">JOB_SATISFACTION</span>
                <span className="text-slate-100">{jobSatisfaction}.0</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-500">ENV_SATISFACTION</span>
                <span className="text-slate-100">{environmentSatisfaction}.0</span>
              </div>
              <div className="flex justify-between pb-1 text-emerald-400 font-bold">
                <span>SIMULATED_PREDICTION</span>
                <span>{riskScore / 100}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
