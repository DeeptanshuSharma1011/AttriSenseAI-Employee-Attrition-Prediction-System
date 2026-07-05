/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ size = 'md', label, fullPage = false }: LoadingSpinnerProps) {
  const spinnerSizes = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-9 w-9 border-3',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-xs'
    : 'flex flex-col items-center justify-center py-8 w-full';

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Glow behind loader */}
        <div
          className={`
            animate-ping absolute inset-0 rounded-full bg-indigo-400/20 blur-xs
            ${size === 'xl' ? 'scale-150' : 'scale-125'}
          `}
        />
        {/* Actual Spinner */}
        <div
          className={`
            animate-spin rounded-full border-slate-200 border-t-indigo-600
            ${spinnerSizes[size]}
          `}
        />
      </div>
      {label && (
        <p
          className={`
            font-bold tracking-wide uppercase text-slate-500 mt-4 animate-pulse
            ${size === 'xs' || size === 'sm' ? 'text-[9px]' : 'text-[10px]'}
          `}
        >
          {label}
        </p>
      )}
    </div>
  );
}
