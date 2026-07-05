/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { Shield, Brain, BarChart3, Database, ArrowRight, UserCheck, Settings2 } from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export default function LandingPage({ user, onLogout }: LandingPageProps) {
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
            {user ? (
              <Link
                to="/profile"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0"
              >
                Go to Profile Settings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
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
              </>
            )}
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
        {user ? (
          <div className="text-xs text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
            Signed in as: <strong className="text-slate-700">{user.name}</strong>
          </div>
        ) : (
          <Link
            to="/signup"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            Create Sandbox Account <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
