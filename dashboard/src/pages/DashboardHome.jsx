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
import { FloatingPathsBackground } from '../components/ui/floating-paths';
import ShapeGrid from '../components/ui/shape-grid';


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

  const stateStr = localStorage.getItem('swachhlens_state');
  const districtStr = localStorage.getItem('swachhlens_district');
  const cityStr = localStorage.getItem('swachhlens_city');
  const wardStr = localStorage.getItem('swachhlens_ward');

  let jurisdictionText = 'National Overview';
  if (wardStr && wardStr !== 'null') {
    jurisdictionText = `${wardStr.charAt(0).toUpperCase() + wardStr.slice(1)}, ${cityStr}`;
  } else if (cityStr && cityStr !== 'null') {
    jurisdictionText = `${cityStr} City Sector`;
  } else if (districtStr && districtStr !== 'null') {
    jurisdictionText = `${districtStr} District Sector`;
  } else if (stateStr && stateStr !== 'null') {
    jurisdictionText = `${stateStr} State Sector`;
  }

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
        {/* Background ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />

        {/* Page Title & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Municipal Waste Control Dashboard
              </h1>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Real-time AI priority map, grievance triage, and squad dispatch monitoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700/50 backdrop-blur-md flex items-center gap-1.5 transition-all hover:shadow-lg hover:shadow-slate-200 dark:hover:shadow-slate-900/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Grid</span>
            </button>
            <button
              onClick={() => navigate('/complaints')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/90 to-emerald-600/90 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition-all hover:-translate-y-0.5 backdrop-blur-md border border-teal-400/30"
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
            trend="up"
            trendValue="12%"
          />
          <SummaryCard
            title="Pending / Submitted"
            value={pendingCount}
            icon={Clock}
            color="bg-amber-600"
            accentColor="bg-amber-500"
            active={activeFilter === 'pending'}
            onClick={() => setActiveFilter('pending')}
            trend="down"
            trendValue="5%"
          />
          <SummaryCard
            title="In Progress"
            value={inProgressCount}
            icon={Loader2}
            color="bg-blue-600"
            accentColor="bg-blue-500"
            active={activeFilter === 'in_progress'}
            onClick={() => setActiveFilter('in_progress')}
            trend="up"
            trendValue="24%"
          />
          <SummaryCard
            title="Resolved"
            value={resolvedCount}
            icon={CheckCircle2}
            color="bg-emerald-600"
            accentColor="bg-emerald-500"
            active={activeFilter === 'resolved'}
            onClick={() => setActiveFilter('resolved')}
            trend="up"
            trendValue="18%"
          />
          <SummaryCard
            title="Urgent / Escalated"
            value={urgentCount}
            icon={AlertTriangle}
            color="bg-rose-600"
            accentColor="bg-rose-500"
            active={activeFilter === 'urgent'}
            onClick={() => setActiveFilter('urgent')}
            trend="up"
            trendValue="2%"
          />
        </div>

        {/* Map View & Urgent Queue Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaflet Map (2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Geolocation Waste Map
                </h2>
                {activeFilter !== 'all' && (
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-medium bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    Filter: {activeFilter.replace('_', ' ')} ({filteredComplaints.length})
                  </span>
                )}
              </div>

            </div>

            <div className="p-1 rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 ring-1 ring-slate-200 dark:ring-white/5">
              <MapView complaints={filteredComplaints} height="480px" />
            </div>
          </div>

          {/* Urgent Action Queue (1 column on desktop) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Urgent Priority Queue
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {urgentCount} Critical
              </span>
            </div>

            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 space-y-3 max-h-[480px] overflow-y-auto ring-1 ring-slate-200 dark:ring-white/5 shadow-2xl">
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
                      className="relative p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 hover:border-teal-400 dark:hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-300 space-y-2 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-900/20"
                    >
                      {/* Subtle pulse indicator for urgent items */}
                      <div className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-slate-900"></span>
                      </div>

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
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0 group-hover:border-teal-500/50 transition-colors"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                            {cat.label}
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0 group-hover:text-teal-500 dark:group-hover:text-teal-400/70 transition-colors" />
                            <span className="truncate">{item.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-slate-950/80 p-2 rounded-lg border border-amber-200 dark:border-slate-800/80 text-[11px] text-amber-700 dark:text-amber-300 font-medium group-hover:border-amber-400 dark:group-hover:border-amber-500/30 transition-colors">
                        ⚡ Action: {item.recommended_action}
                      </div>
                    </div>
                  );
                })
              )}

              <button
                onClick={() => navigate('/complaints')}
                className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-center block border border-slate-200 dark:border-slate-700/50"
              >
                View Full Complaints List &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
