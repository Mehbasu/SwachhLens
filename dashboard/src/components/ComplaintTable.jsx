import React from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import StatusTag from './StatusTag';
import { categoriesConfig } from '../data/mockData';
import { MapPin, Clock, Copy, ChevronRight, Layers } from 'lucide-react';

export default function ComplaintTable({ complaints = [], loading = false }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-slate-700/80 p-12 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium">Fetching complaints data...</p>
      </div>
    );
  }

  if (!complaints || complaints.length === 0) {
    return (
      <div className="bg-slate-800/80 rounded-xl border border-slate-700/80 p-12 text-center text-slate-400 space-y-2">
        <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h4 className="text-base font-semibold text-slate-200">No complaints found</h4>
        <p className="text-xs text-slate-400">Try adjusting your category, status, or search filters.</p>
      </div>
    );
  }

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/80 bg-slate-800/80 shadow-lg">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
          <tr>
            <th scope="col" className="py-3.5 px-4">Thumbnail</th>
            <th scope="col" className="py-3.5 px-4">ID & Category</th>
            <th scope="col" className="py-3.5 px-4">Volume</th>
            <th scope="col" className="py-3.5 px-4">Priority Score</th>
            <th scope="col" className="py-3.5 px-4">Status</th>
            <th scope="col" className="py-3.5 px-4">Location</th>
            <th scope="col" className="py-3.5 px-4">Reported Time</th>
            <th scope="col" className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/60">
          {complaints.map((item) => {
            const cat = categoriesConfig[item.category] || { label: item.category };

            return (
              <tr
                key={item.id}
                onClick={() => navigate(`/complaints/${item.id}`)}
                className="hover:bg-slate-700/50 cursor-pointer transition-colors duration-150 group"
              >
                {/* Thumbnail */}
                <td className="py-3 px-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                    <img
                      src={item.image_url}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {item.is_duplicate && (
                      <span className="absolute top-0.5 right-0.5 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow" title="Duplicate Complaint">
                        <Copy className="w-2.5 h-2.5 font-bold" />
                      </span>
                    )}
                  </div>
                </td>

                {/* ID & Category */}
                <td className="py-3 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-teal-400 text-xs">{item.id}</span>
                      {item.is_duplicate && (
                        <span className="bg-amber-500/10 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/20 font-medium">
                          Duplicate
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-100 text-xs truncate max-w-[180px]">
                      {cat.label}
                    </p>
                    <p className="text-[11px] text-slate-400 font-sans truncate max-w-[180px]">
                      {item.assigned_team || 'Unassigned'}
                    </p>
                  </div>
                </td>

                {/* Volume */}
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-medium text-slate-300 capitalize">
                    {item.volume.replace('_', ' ')}
                  </span>
                </td>

                {/* Priority Score */}
                <td className="py-3 px-4">
                  <PriorityBadge score={item.priority_score} size="small" />
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <StatusTag status={item.status} size="small" />
                </td>

                {/* Location */}
                <td className="py-3 px-4 max-w-[200px]">
                  <p className="text-slate-200 truncate flex items-center gap-1 text-xs" title={item.address}>
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </p>
                </td>

                {/* Timestamp */}
                <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                </td>

                {/* Action */}
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/complaints/${item.id}`);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 group-hover:bg-teal-600 text-slate-200 group-hover:text-white text-xs font-medium transition-colors"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
