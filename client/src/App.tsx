/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import DatasetUploadPage from './pages/DatasetUploadPage';
import { Brain, User, ShieldCheck, LogOut, LayoutDashboard, Settings2, Database } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  const { user, isAuthenticated, isLoading, login, signup, logout, updateProfile } = useAuth();

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo Brand */}
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
              <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center text-slate-950 shadow-md">
                <Brain className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <span className="text-base font-extrabold text-slate-900 block tracking-tight">AttriSense AI</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enterprise Predictor</span>
              </div>
            </Link>

            {/* Navigation Middle */}
            <nav className="hidden md:flex items-center gap-1.5">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Settings2 className="h-3.5 w-3.5" />
                Retention Sandbox
              </NavLink>
              <NavLink
                to="/datasets"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Database className="h-3.5 w-3.5" />
                Datasets
              </NavLink>
            </nav>

            {/* Right-hand Auth controls */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin"></div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 hover:bg-slate-100 p-1.5 rounded-xl transition"
                  >
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="hidden sm:block text-left leading-none">
                      <span className="text-xs font-bold text-slate-800 block">{user.name}</span>
                      <span className="text-[9px] text-slate-500 font-semibold">{user.role}</span>
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    title="Sign Out Session"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<LandingPage user={user} onLogout={logout} />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/profile" replace /> : <LoginPage onLogin={login} />}
            />
            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/profile" replace /> : <SignupPage onSignup={signup} />}
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <ProfilePage user={user} onUpdateProfile={updateProfile} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/datasets"
              element={
                isAuthenticated ? (
                  <DatasetUploadPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>AttriSense AI Enterprise Prediction Framework — Operational Pipeline Active</span>
            </div>
            <div>
              <span>Clean Architecture Paradigm &copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
    </ToastProvider>
  );
}
