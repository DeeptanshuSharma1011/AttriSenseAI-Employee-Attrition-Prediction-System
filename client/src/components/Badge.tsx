/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'slate';
  size?: 'xs' | 'sm';
  className?: string;
}

export function Badge({ children, variant = 'slate', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200/80',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[9px] font-bold rounded-md',
    sm: 'px-2 py-0.5 text-[10px] font-bold rounded-lg',
  };

  return (
    <span
      className={`
        inline-flex items-center border font-semibold tracking-wide uppercase leading-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
