import React from 'react';
import { BookOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No records found',
  description = 'There are no items to display matching your criteria.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center bg-white/80 rounded-xl border border-dashed border-library-border my-4 shadow-sm">
      <div className="w-14 h-14 bg-library-cream/60 rounded-xl flex items-center justify-center text-library-walnut mb-4 border border-library-border shadow-inner">
        <Icon className="w-7 h-7 text-library-gold" />
      </div>
      <h3 className="font-serif text-base font-bold text-library-charcoal mb-1">{title}</h3>
      <p className="text-xs text-library-charcoal-muted max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-library-ivory bg-library-green hover:bg-library-green-dark border border-library-gold/30 rounded-lg transition-all shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
