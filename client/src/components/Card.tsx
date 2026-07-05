/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  className?: string;
}

export function Card({ children, hoverable = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]
        ${hoverable ? 'hover:shadow-md hover:border-slate-300/80 transition-all duration-300 hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between pb-4 mb-4 border-b border-slate-100 ${className}`} {...props}>
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-slate-700 text-xs leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
