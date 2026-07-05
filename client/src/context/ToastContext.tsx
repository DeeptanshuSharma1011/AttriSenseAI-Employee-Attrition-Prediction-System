/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Floating Toasts Stack */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />,
              error: <AlertCircle className="h-4.5 w-4.5 text-rose-600" />,
              warning: <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />,
              info: <Info className="h-4.5 w-4.5 text-blue-600" />,
            };

            const colors = {
              success: 'bg-white border-emerald-100/80 shadow-emerald-50/50',
              error: 'bg-white border-rose-100/80 shadow-rose-50/50',
              warning: 'bg-white border-amber-100/80 shadow-amber-50/50',
              info: 'bg-white border-blue-100/80 shadow-blue-50/50',
            };

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={`
                  pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border
                  shadow-lg text-xs font-semibold text-slate-700 ${colors[toast.type]}
                `}
              >
                <div className="mt-0.5 flex-shrink-0">{icons[toast.type]}</div>
                <div className="flex-1 leading-normal pr-4">{toast.message}</div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
