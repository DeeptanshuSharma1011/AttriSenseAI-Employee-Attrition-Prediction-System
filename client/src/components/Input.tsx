/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, hint, className = '', disabled, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={`
              block w-full rounded-xl border-slate-200/80 bg-white text-xs text-slate-900 transition-all duration-200
              placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
              disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200'}
              ${className}
            `}
            style={{ minHeight: '40px' }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-[11px] font-semibold text-rose-500">{error}</p>}
        {!error && hint && <p className="mt-1 text-[10px] font-medium text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
