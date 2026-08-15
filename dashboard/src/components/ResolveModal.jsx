import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';

const SAMPLE_CLEANUP_PHOTOS = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=800&q=80'
];

export default function ResolveModal({ isOpen, onClose, onConfirm, complaintId }) {
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_CLEANUP_PHOTOS[0]);
  const [notes, setNotes] = useState('');
  const [officerName, setOfficerName] = useState('Insp. R. K. Sharma (Patna Central)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onConfirm({
      photoUrl,
      notes: notes || 'Sanitation team cleared the waste dump and disinfected the area.',
      officerName
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mark Complaint as Resolved</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {complaintId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Photo Upload Section */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>After-Cleanup Verification Photo *</span>
              <span className="text-[11px] text-teal-400 font-normal">Required by Municipal Policy</span>
            </label>

            {/* Photo preview or dropzone */}
            <div className="relative h-44 w-full rounded-xl overflow-hidden border-2 border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center group hover:border-emerald-500 transition-colors">
              {photoUrl ? (
                <div className="relative w-full h-full">
                  <img src={photoUrl} alt="After Cleanup" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer bg-slate-900/90 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  <span className="absolute bottom-2 left-2 bg-emerald-500/90 text-slate-950 px-2 py-0.5 rounded font-bold text-[10px] tracking-wide flex items-center gap-1 shadow">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Photo Attached</span>
                  </span>
                </div>
              ) : (
                <label className="cursor-pointer text-center p-4">
                  <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-emerald-400 transition-colors" />
                  <p className="font-semibold text-slate-300">Click to upload cleanup photo</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG up to 10MB</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Quick Demo Photo Presets */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-amber-400" /> Demo Photos:
              </span>
              <div className="flex gap-1.5 overflow-x-auto">
                {SAMPLE_CLEANUP_PHOTOS.map((url, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setPhotoUrl(url)}
                    className={`relative w-9 h-7 rounded overflow-hidden border ${
                      photoUrl === url ? 'ring-2 ring-emerald-400 border-transparent' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Inspector Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Inspecting Officer Name</label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Resolution Summary / Notes</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared 2.5 tons waste, sprayed disinfectant, reopened road..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !photoUrl}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Resolving...' : 'Confirm Resolution'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
