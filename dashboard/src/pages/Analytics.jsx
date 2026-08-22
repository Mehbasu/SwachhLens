import React, { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '../services/api';
import { categoriesConfig, statusConfig } from '../data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { Sparkles, Calendar, Building2, PieChart as PieIcon, TrendingUp, BarChart3 } from 'lucide-react';
import ShapeGrid from '../components/ui/shape-grid';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    const res = await getAnalyticsSummary();
    if (res.success) {
      setData(res);
    } else {
      setError(res.error || 'Failed to fetch analytics data from backend.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-400">Loading civic analytics insights...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <BarChart3 className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analytics Unavailable</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">{error || 'Unable to connect to analytics server at http://localhost:8001.'}</p>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Format data for Category Bar Chart
  const categoryBarData = Object.entries(data.categoryCounts).map(([catKey, count]) => ({
    name: categoriesConfig[catKey]?.label || catKey,
    count,
    color: categoriesConfig[catKey]?.color || '#3b82f6'
  }));

  // Format data for Status Pie Chart
  const statusPieData = [
    { name: 'Submitted / Pending', value: data.summary.pending, color: '#f59e0b' },
    { name: 'In Progress', value: data.summary.inProgress, color: '#3b82f6' },
    { name: 'Resolved', value: data.summary.resolved, color: '#10b981' }
  ];

  return (
    <div className="w-full relative min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ShapeGrid 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='rgba(20, 184, 166, 0.15)'
          hoverFillColor='rgba(59, 130, 246, 0.2)'
          shape='hexagon'
          hoverTrailAmount={5}
        />
      </div>
      <div className="space-y-6 relative z-10">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sanitation Analytics & Insights
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Data intelligence on grievance trends, category breakdown, and ward response times across Patna.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
              <span>Last 30 Days</span>
            </span>
          </div>
        </div>

        {/* Advanced Statistic Cards from Shadcn (Removed due to missing dependency) */}

        {/* Grid Row 1: Category Bar Chart & Status Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Bar Chart (2 columns) */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Complaints by Waste Category
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Count</span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {categoryBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Pie Chart (1 column) */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Status Distribution
              </h3>
            </div>

            <div className="h-72 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Grid Row 2: 30-Day Timeline Trend Area Chart */}
        <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                30-Day Complaint Volume & Resolution Velocity
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Submitted
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> In Progress
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Resolved
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="submitted" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSubmitted)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                <Line type="monotone" dataKey="in_progress" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
