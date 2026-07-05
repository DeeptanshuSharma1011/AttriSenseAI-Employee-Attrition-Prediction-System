/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  title?: string;
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Alert({ title, children, variant = 'info', className = '' }: AlertProps) {
  const styles = {
    success: {
      bg: 'bg-emerald-50/85 border-emerald-100',
      text: 'text-emerald-800',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50/85 border-amber-100',
      text: 'text-amber-800',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
    },
    danger: {
      bg: 'bg-rose-50/85 border-rose-100',
      text: 'text-rose-800',
      icon: <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50/85 border-blue-100',
      text: 'text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />,
    },
  };

  const current = styles[variant];

  return (
    <div className={`flex items-start gap-3.5 p-4 border rounded-2xl ${current.bg} ${className}`}>
      <div className="mt-0.5">{current.icon}</div>
      <div className={`flex-1 text-xs font-semibold ${current.text}`}>
        {title && <h5 className="font-bold tracking-tight mb-1">{title}</h5>}
        <div className="leading-relaxed font-medium">{children}</div>
      </div>
    </div>
  );
}
