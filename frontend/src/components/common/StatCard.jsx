import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  trend,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      badge: 'bg-indigo-50 text-indigo-700',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      badge: 'bg-emerald-50 text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      badge: 'bg-amber-50 text-amber-700',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      badge: 'bg-blue-50 text-blue-700',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-100',
      badge: 'bg-violet-50 text-violet-700',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      badge: 'bg-rose-50 text-rose-700',
    },
  };

  const currentTheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`bg-white rounded-2xl p-6 border ${currentTheme.border} shadow-sm card-hover relative overflow-hidden flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${currentTheme.bg} ${currentTheme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
          {value !== undefined && value !== null ? value.toLocaleString() : '0'}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 font-medium">{subtitle}</div>
        )}
      </div>
    </div>
  );
};
