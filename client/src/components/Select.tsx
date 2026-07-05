/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, hint, className = '', disabled, ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && (
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          <select
            ref={ref}
            disabled={disabled}
            className={`
              block w-full rounded-xl border-slate-200 bg-white text-xs text-slate-900 transition-all duration-200
              focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10
              disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100
              ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200'}
              ${className}
            `}
            style={{ minHeight: '40px' }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="mt-1 text-[11px] font-semibold text-rose-500">{error}</p>}
        {!error && hint && <p className="mt-1 text-[10px] font-medium text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
