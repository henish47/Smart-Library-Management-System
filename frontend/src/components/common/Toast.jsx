import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-library-green-dark text-library-ivory border-library-gold/50 shadow-library-lg',
      icon: <CheckCircle2 className="w-5 h-5 text-library-gold flex-shrink-0" />,
    },
    error: {
      bg: 'bg-[#4A1E1E] text-library-ivory border-rose-400/50 shadow-library-lg',
      icon: <AlertCircle className="w-5 h-5 text-rose-300 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-library-walnut text-library-ivory border-library-gold/50 shadow-library-lg',
      icon: <AlertTriangle className="w-5 h-5 text-library-gold flex-shrink-0" />,
    },
    info: {
      bg: 'bg-library-green text-library-ivory border-library-gold/50 shadow-library-lg',
      icon: <Info className="w-5 h-5 text-library-gold flex-shrink-0" />,
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${config.bg}`}
      >
        {config.icon}
        <span className="font-serif text-xs tracking-wide pr-2">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};