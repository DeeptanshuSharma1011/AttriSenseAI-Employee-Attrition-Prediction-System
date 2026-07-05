/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface SignupPageProps {
  onSignup: (email: string, name: string, password?: string) => Promise<any>;
}

export default function SignupPage({ onSignup }: SignupPageProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) {
      setErrorMsg('Please fulfill all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSignup(email, name, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Get Started with AttriSense AI</h2>
        <p className="text-sm text-slate-500">Create your administrator credential to predict attrition risk</p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-3 text-xs bg-rose-50 text-rose-800 border border-rose-100 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700" htmlFor="name">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              id="name"
              type="text"
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition"
              placeholder="Dr. Evelyn Carter"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

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
              placeholder="carter@organization.com"
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
          {isSubmitting ? 'Registering Workspace...' : 'Register Session'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
