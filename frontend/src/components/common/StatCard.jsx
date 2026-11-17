import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'green',
}) => {
  const colorMap = {
    green: {
      bg: 'bg-library-green/10',
      text: 'text-library-green',
      border: 'border-library-border',
      accent: 'border-l-library-green',
    },
    gold: {
      bg: 'bg-library-gold/15',
      text: 'text-library-walnut',
      border: 'border-library-border',
      accent: 'border-l-library-gold',
    },
    walnut: {
      bg: 'bg-library-walnut/10',
      text: 'text-library-walnut',
      border: 'border-library-border',
      accent: 'border-l-library-walnut',
    },
    darkgreen: {
      bg: 'bg-library-green-dark/10',
      text: 'text-library-green-dark',
      border: 'border-library-border',
      accent: 'border-l-library-green-dark',
    },
  };

  const currentTheme = colorMap[color] || colorMap.green;

  return (
    <div className={`bg-white rounded-xl p-5 border ${currentTheme.border} border-l-4 ${currentTheme.accent} shadow-sm card-hover relative overflow-hidden flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-library-charcoal-muted tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentTheme.bg} ${currentTheme.text} border border-library-border/50 shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <div className="font-serif text-3xl font-bold text-library-charcoal tracking-tight mb-1">
          {value !== undefined && value !== null ? value.toLocaleString() : '0'}
        </div>
        {subtitle && (
          <div className="text-xs text-library-walnut font-medium">{subtitle}</div>
        )}
      </div>
    </div>
  );
};
