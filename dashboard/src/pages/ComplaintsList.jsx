import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getComplaints } from '../services/api';
import ComplaintTable from '../components/ComplaintTable';
import { categoriesConfig } from '../data/mockData';
import { Filter, SortAsc, Search, SlidersHorizontal, RefreshCw, Layers } from 'lucide-react';

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort state
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [priorityRange, setPriorityRange] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [localSearch, setLocalSearch] = useState('');

  const { globalSearch } = useOutletContext() || {};

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    const searchParam = localSearch || globalSearch || '';
    const res = await getComplaints({
      category,
      status,
      priorityRange,
      sortBy,
      sortOrder,
      search: searchParam
    });
    if (res.success) {
      setComplaints(res.data);
    } else {
      setError(res.error || 'Failed to fetch complaints from backend.');
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchComplaints();
  }, [category, status, priorityRange, sortBy, sortOrder, localSearch, globalSearch]);

  const handleResetFilters = () => {
    setCategory('all');
    setStatus('all');
    setPriorityRange('all');
    setSortBy('priority');
    setSortOrder('desc');
    setLocalSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Waste Complaints Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter, search, and prioritize incoming civic waste grievances across Patna.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            Showing {complaints.length} Records
          </span>
          <button
            onClick={fetchComplaints}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-lg">
          <div><strong>Error loading complaints:</strong> {error}</div>
          <button
            onClick={fetchComplaints}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search location/ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Waste Categories</option>
              {Object.entries(categoriesConfig).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted / Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Priority Range */}
          <div>
            <select
              value={priorityRange}
              onChange={(e) => setPriorityRange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Priority Levels</option>
              <option value="urgent">Urgent (75 - 100)</option>
              <option value="high">High (50 - 74)</option>
              <option value="medium">Medium (25 - 49)</option>
              <option value="low">Low (0 - 24)</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="priority">Sort by Priority</option>
              <option value="date">Sort by Date</option>
              <option value="volume">Sort by Volume</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white font-mono font-bold"
              title={`Order: ${sortOrder.toUpperCase()}`}
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {/* Quick Filter Tags & Reset */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
            </span>

            {category !== 'all' && (
              <span className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20 font-medium">
                Cat: {categoriesConfig[category]?.label}
              </span>
            )}
            {status !== 'all' && (
              <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-medium">
                Status: {status}
              </span>
            )}
            {priorityRange !== 'all' && (
              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                Priority: {priorityRange}
              </span>
            )}
          </div>

          <button
            onClick={handleResetFilters}
            className="text-slate-400 hover:text-slate-200 text-[11px] font-medium underline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <ComplaintTable complaints={complaints} loading={loading} />
    </div>
  );
}
