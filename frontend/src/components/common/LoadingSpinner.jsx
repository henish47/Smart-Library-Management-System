import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Accessing archives...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-7 h-7',
    large: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-library-green mb-3`} />
      <p className="font-serif text-xs text-library-charcoal-muted tracking-wide italic">{message}</p>
    </div>
  );
};
