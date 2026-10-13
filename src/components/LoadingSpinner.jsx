import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-blue-500 animate-spin mb-3`} />
      {text && <p className="text-xs sm:text-sm text-slate-400 font-medium">{text}</p>}
    </div>
  );
}
