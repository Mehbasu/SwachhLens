import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function SummaryCard({ title, value, icon: Icon, trend, trendValue, color, accentColor, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 p-5 ${
        onClick ? 'cursor-pointer hover:border-slate-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/20' : ''
      } ${
        active
          ? 'bg-slate-800/90 border-teal-500/50 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/30'
          : 'bg-slate-900/40 border-slate-700/50 shadow-md backdrop-blur-xl'
      }`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
        </div>

        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {(trend || trendValue) && (
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
          <span className={`inline-flex items-center gap-1 font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-slate-400'}`}>
            {trend === 'up' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
            {trendValue}
          </span>
          <span className="text-slate-500 font-medium">vs last week</span>
        </div>
      )}

      {accentColor && (
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${accentColor}`} />
      )}
    </div>
  );
}
