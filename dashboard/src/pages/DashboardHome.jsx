import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getComplaints } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import MapView from '../components/MapView';
import PriorityBadge from '../components/PriorityBadge';
import StatusTag from '../components/StatusTag';
import { categoriesConfig } from '../data/mockData';
import {
  ClipboardList,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function DashboardHome() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  const { globalSearch } = useOutletContext() || {};

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getComplaints({ search: globalSearch });
    if (res.success) {
      setComplaints(res.data);
    } else {
      setError(res.error || 'Unable to connect to SwachhLens Backend at http://localhost:8000. Please ensure the server is running.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [globalSearch]);


  // Filtered complaints based on summary card click
  const filteredComplaints = complaints.filter((c) => {
    if (activeFilter === 'pending') return c.status === 'submitted';
    if (activeFilter === 'in_progress') return c.status === 'in_progress';
    if (activeFilter === 'resolved') return c.status === 'resolved';
    if (activeFilter === 'urgent') return c.priority_score >= 75;
    return true;
  });

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'submitted').length;
  const inProgressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const urgentCount = complaints.filter((c) => c.priority_score >= 75).length;

  const urgentList = complaints.filter((c) => c.priority_score >= 75).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Municipal Waste Control Dashboard
            </h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
              Patna Sector
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time AI priority map, grievance triage, and squad dispatch monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Grid</span>
          </button>
          <button
            onClick={() => navigate('/complaints')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition-all"
          >
            <span>View All Complaints</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span><strong>Backend Connection Error:</strong> {error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Reports"
          value={totalCount}
          icon={ClipboardList}
          color="bg-slate-700"
          accentColor="bg-slate-500"
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        />
        <SummaryCard
          title="Pending / Submitted"
          value={pendingCount}
          icon={Clock}
          color="bg-amber-600"
          accentColor="bg-amber-500"
          active={activeFilter === 'pending'}
          onClick={() => setActiveFilter('pending')}
        />
        <SummaryCard
          title="In Progress"
          value={inProgressCount}
          icon={Loader2}
          color="bg-blue-600"
          accentColor="bg-blue-500"
          active={activeFilter === 'in_progress'}
          onClick={() => setActiveFilter('in_progress')}
        />
        <SummaryCard
          title="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          color="bg-emerald-600"
          accentColor="bg-emerald-500"
          active={activeFilter === 'resolved'}
          onClick={() => setActiveFilter('resolved')}
        />
        <SummaryCard
          title="Urgent / Escalated"
          value={urgentCount}
          icon={AlertTriangle}
          color="bg-rose-600"
          accentColor="bg-rose-500"
          active={activeFilter === 'urgent'}
          onClick={() => setActiveFilter('urgent')}
        />
      </div>

      {/* Map View & Urgent Queue Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map (2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Geolocation Waste Map
              </h2>
              {activeFilter !== 'all' && (
                <span className="text-xs text-teal-400 font-medium bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Filter: {activeFilter.replace('_', ' ')} ({filteredComplaints.length})
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">Patna Coordinates [25.59, 85.13]</span>
          </div>

          <MapView complaints={filteredComplaints} height="480px" />
        </div>

        {/* Urgent Action Queue (1 column on desktop) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Urgent Priority Queue
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {urgentCount} Critical
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3 max-h-[480px] overflow-y-auto">
            {urgentList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No urgent priority complaints at this moment.
              </div>
            ) : (
              urgentList.map((item) => {
                const cat = categoriesConfig[item.category] || { label: item.category };

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/complaints/${item.id}`)}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-teal-500 cursor-pointer transition-all duration-200 space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-400 text-xs">{item.id}</span>
                        <PriorityBadge score={item.priority_score} size="small" />
                      </div>
                      <StatusTag status={item.status} size="small" />
                    </div>

                    <div className="flex items-start gap-2.5">
                      <img
                        src={item.image_url}
                        alt={cat.label}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-xs truncate group-hover:text-teal-300 transition-colors">
                          {cat.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px] text-amber-300 font-medium">
                      ⚡ Action: {item.recommended_action}
                    </div>
                  </div>
                );
              })
            )}

            <button
              onClick={() => navigate('/complaints')}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors text-center block"
            >
              View Full Complaints List &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
