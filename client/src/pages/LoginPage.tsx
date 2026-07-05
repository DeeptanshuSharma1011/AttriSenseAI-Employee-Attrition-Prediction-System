/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password?: string) => Promise<any>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuickLogin = async (demoEmail: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onLogin(demoEmail, 'Temporary_123!');
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please provide your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please provide your access key / password.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onLogin(email, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials or register.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to AttriSense AI</h2>
        <p className="text-sm text-slate-500">Access the machine learning employee attrition control room</p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-3 text-xs bg-rose-50 text-rose-800 border border-rose-100 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700" htmlFor="email">
            Corporate Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition"
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700" htmlFor="password">
            Access Key / Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              id="password"
              type="password"
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-slate-950 font-semibold rounded-xl text-sm transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 shadow-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Authenticating...' : 'Sign In'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Quick Demo Section */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
          Portfolio Review Quick Sandbox
        </span>
        <button
          onClick={() => handleQuickLogin('mle.architect@organization.com')}
          disabled={isSubmitting}
          className="w-full text-left p-3 bg-white hover:bg-emerald-50 hover:border-emerald-200 transition border border-slate-200 rounded-xl text-xs flex justify-between items-center"
        >
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-800 block">Sarah Jenkins (HR Manager)</span>
            <span className="text-slate-500">mle.architect@organization.com</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Click to Login
          </span>
        </button>
      </div>

      <div className="text-center text-xs text-slate-500">
        New operator?{' '}
        <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
          Register new sandbox session
        </Link>
      </div>
    </div>
  );
}
