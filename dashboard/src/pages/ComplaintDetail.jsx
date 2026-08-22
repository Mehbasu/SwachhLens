import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getComplaintById, updateComplaintStatus, assignTeam } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusTag from '../components/StatusTag';
import ResolveModal from '../components/ResolveModal';
import { useToasts } from '../components/ui/toast';
import { categoriesConfig } from '../data/mockData';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Sparkles,
  AlertTriangle,
  Copy,
  CheckCircle2,
  Truck,
  ShieldAlert,
  ExternalLink,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('submitted');
  const [assignedTeamInput, setAssignedTeamInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Resolution modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const toasts = useToasts();

  const fetchComplaint = async () => {
    setLoading(true);
    const res = await getComplaintById(id);
    if (res.success) {
      setComplaint(res.data);
      setSelectedStatus(res.data.status);
      setAssignedTeamInput(res.data.assigned_team || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleStatusSave = async () => {
    if (selectedStatus === 'resolved' && complaint.status !== 'resolved') {
      // Trigger resolve modal for cleanup photo upload
      setIsResolveModalOpen(true);
      return;
    }

    setIsSaving(true);
    const res = await updateComplaintStatus(id, selectedStatus);
    if (res.success) {
      setComplaint(res.data);
      triggerToast(`Status updated to ${selectedStatus}`);
    }
    setIsSaving(false);
  };

  const handleTeamSave = async () => {
    const res = await assignTeam(id, assignedTeamInput);
    if (res.success) {
      setComplaint(res.data);
      triggerToast('Assigned team updated');
    }
  };

  const handleResolveConfirm = async (resolveData) => {
    setIsSaving(true);
    const res = await updateComplaintStatus(id, 'resolved', resolveData);
    if (res.success) {
      setComplaint(res.data);
      setSelectedStatus('resolved');
      triggerToast('Complaint successfully resolved with cleanup photo!');
    }
    setIsSaving(false);
  };

  const triggerToast = (msg) => {
    toasts.success(msg);
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-400">Loading complaint inspection details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-20 text-center space-y-4 bg-slate-900 rounded-2xl border border-slate-800 p-8">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Complaint Not Found or Server Error</h2>
        <p className="text-xs text-slate-400">Unable to load details for Complaint ID {id}. Please verify backend server status.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={fetchComplaint}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Retry Connection
          </button>
          <button
            onClick={() => navigate('/complaints')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            &larr; Back to Complaints Directory
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = categoriesConfig[complaint.category] || { label: complaint.category };
  const formattedDate = new Date(complaint.timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="space-y-6">

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/complaints')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-teal-400 font-bold bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
            {complaint.id}
          </span>
          <StatusTag status={complaint.status} />
        </div>
      </div>

      {/* Duplicate Warning Banner */}
      {complaint.is_duplicate && (
        <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-300 text-xs flex items-start gap-3 shadow-lg">
          <Copy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="font-bold text-amber-200 flex items-center gap-2">
              <span>DUPLICATE COMPLAINT DETECTED BY AI</span>
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                Flagged
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              This grievance matches another complaint reported in the immediate vicinity ({complaint.address}).
            </p>
            {complaint.duplicate_of && (
              <Link
                to={`/complaints/${complaint.duplicate_of}`}
                className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-200 underline mt-1 text-xs"
              >
                <span>View Original Ticket ({complaint.duplicate_of})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Left Column (Image & AI), Right Column (Metadata & Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image & AI Classification */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Large Image */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-2xl group">
            <img
              src={complaint.image_url}
              alt={categoryInfo.label}
              className="w-full h-80 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <PriorityBadge score={complaint.priority_score} />
              <span className="bg-slate-900/90 backdrop-blur-md text-slate-200 px-3 py-1 rounded-full text-xs font-medium border border-slate-700">
                Vol: <strong className="capitalize">{complaint.volume.replace('_', ' ')}</strong>
              </span>
            </div>

            <button
              onClick={() => setShowImageLightbox(true)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow transition-colors"
              title="Expand Image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Image Footer Caption */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span className="truncate">{complaint.address}</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{formattedDate}</span>
            </div>
          </div>

          {/* Lightbox Modal */}
          {showImageLightbox && (
            <div
              onClick={() => setShowImageLightbox(false)}
              className="fixed inset-0 z-[3000] bg-slate-950/90 flex items-center justify-center p-4 cursor-pointer"
            >
              <img
                src={complaint.image_url}
                alt="Full View"
                className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
              />
            </div>
          )}

          {/* AI Detection & Confidence Box */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Vision Analysis & Classification</h3>
                  <p className="text-xs text-slate-400">Automated waste tag matching model v2.4</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-extrabold text-teal-400 font-mono">
                  {complaint.ai_confidence || 94}%
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Model Confidence</div>
              </div>
            </div>

            {/* Recommended Action Callout Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 text-xs space-y-1.5">
              <div className="font-bold text-teal-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Truck className="w-4 h-4 text-teal-400" />
                <span>AI Recommended Action Plan</span>
              </div>
              <p className="text-slate-100 font-semibold text-sm">
                "{complaint.recommended_action}"
              </p>
            </div>

            {/* AI Reasoning */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>AI Volume Estimation Reasoning</span>
              </div>
              <p className="text-slate-200 italic">
                "{complaint.ai_reasoning || 'AI reasoning not available for this complaint'}"
              </p>
            </div>
          </div>

          {/* Resolution Details Display (if resolved) */}
          {complaint.status === 'resolved' && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm">Complaint Cleanup Verified & Resolved</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleString() : 'Recently'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaint.resolution_photo && (
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold text-[11px]">After-Cleanup Verification Photo:</label>
                    <img
                      src={complaint.resolution_photo}
                      alt="Resolved Cleanup"
                      className="w-full h-40 object-cover rounded-xl border border-emerald-500/30"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 font-medium">Verified By:</span>
                    <p className="text-slate-200 font-semibold">{complaint.resolved_by || 'Sanitation Inspector'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Resolution Notes:</span>
                    <p className="text-slate-300 italic">{complaint.resolution_notes || 'Cleaned and disinfected area.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata Details & Status Update Form */}
        <div className="space-y-6">
          {/* Status Update Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Management & Workflow Transition
            </h3>

            {/* Status Select */}
            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-1">
                Current Status Workflow
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-semibold text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="submitted">Submitted / Pending</option>
                <option value="in_progress">In Progress (Squad Dispatched)</option>
                <option value="resolved">Resolved (Cleanup Finished)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleStatusSave}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-teal-600/20"
              >
                {isSaving ? 'Updating...' : 'Save Workflow Status'}
              </button>

              {complaint.status !== 'resolved' && (
                <button
                  onClick={() => setIsResolveModalOpen(true)}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 font-bold text-xs transition-colors"
                  title="Mark Resolved with Photo Upload"
                >
                  Mark Resolved
                </button>
              )}
            </div>

            {/* Team Assignment */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-slate-300 font-semibold text-xs">Assigned Sanitation Team</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={assignedTeamInput}
                  onChange={(e) => setAssignedTeamInput(e.target.value)}
                  placeholder="e.g. Patna West Ward 14 Fleet"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleTeamSave}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3.5 text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Report Metadata
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="font-bold text-slate-100 text-sm">{categoryInfo.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block mb-0.5">Volume Size</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {complaint.volume.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Priority Score</span>
                  <PriorityBadge score={complaint.priority_score} size="small" />
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">GPS Location Coordinates</span>
                <div className="font-mono text-teal-400 font-bold bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span>{complaint.gps.lat.toFixed(4)}° N, {complaint.gps.lng.toFixed(4)}° E</span>
                  <a
                    href={`https://maps.google.com/?q=${complaint.gps.lat},${complaint.gps.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-teal-400 hover:underline"
                  >
                    Open Maps
                  </a>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Public Reporter Comment</span>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 italic">
                  "{complaint.reporter_comment || 'No comment provided'}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cleanup Photo Upload Modal */}
      <ResolveModal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={handleResolveConfirm}
        complaintId={complaint.id}
      />
    </div>
  );
}
