import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-[11px] text-slate-400">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
