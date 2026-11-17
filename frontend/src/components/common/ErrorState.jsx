import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Failed to load records',
  message = 'An error occurred while connecting to the library server. Please ensure the backend is available.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-rose-50/40 rounded-xl border border-rose-200 my-4 shadow-sm">
      <div className="w-12 h-12 bg-rose-100/80 rounded-xl flex items-center justify-center text-rose-700 mb-3 border border-rose-200 shadow-inner">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-base font-bold text-rose-950 mb-1">{title}</h3>
      <p className="text-xs text-rose-700/80 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-library-charcoal bg-white hover:bg-library-cream-dark/50 border border-library-border rounded-lg transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-library-walnut" />
          <span>Reload Catalog</span>
        </button>
      )}
    </div>
  );
};
