import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md card-white rounded-3xl p-8 border border-slate-200/90 shadow-xl">
        <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">404 - Page Not Found</h1>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          The requested page or ticket verification link could not be located on the Techmiya Drive portal.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all hover:scale-105"
        >
          <Home className="w-4 h-4" />
          <span>Return to Portal Home</span>
        </Link>
      </div>
    </div>
  );
}
