import React from 'react';

export default function PriorityScoreBar({ breakdown, totalScore }) {
  const defaultBreakdown = breakdown || {
    volume: Math.round(totalScore * 0.38),
    location: Math.round(totalScore * 0.32),
    public_impact: Math.round(totalScore * 0.20),
    age: Math.round(totalScore * 0.10)
  };

  const factors = [
    { label: 'Waste Volume Weight', score: defaultBreakdown.volume, max: 40, color: 'bg-emerald-500', text: 'text-emerald-400' },
    { label: 'Location Risk & Proximity', score: defaultBreakdown.location, max: 35, color: 'bg-blue-500', text: 'text-blue-400' },
    { label: 'Public Footfall Impact', score: defaultBreakdown.public_impact, max: 15, color: 'bg-amber-500', text: 'text-amber-400' },
    { label: 'Age Decay Factor', score: defaultBreakdown.age, max: 10, color: 'bg-purple-500', text: 'text-purple-400' }
  ];

  return (
    <div className="bg-slate-800/90 rounded-xl border border-slate-700/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          AI Priority Calculation Breakdown
        </h4>
        <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
          Total Score: {totalScore}/100
        </span>
      </div>

      {/* Stacked bar preview */}
      <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-700/50">
        {factors.map((f, i) => (
          <div
            key={i}
            className={`h-full ${f.color} rounded-sm transition-all duration-500`}
            style={{ width: `${(f.score / totalScore) * 100}%` }}
            title={`${f.label}: +${f.score} pts`}
          />
        ))}
      </div>

      {/* Factor list grid */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {factors.map((f, i) => (
          <div key={i} className="bg-slate-900/60 p-2 rounded.lg border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 truncate pr-1">{f.label}</span>
            <span className={`font-mono font-bold ${f.text}`}>+{f.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
