import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Mail, Shield, X } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  
  // Hardcoded for demo - in a real app, you'd fetch this from context/auth state
  const user = {
    name: 'Insp. A. K. Verma',
    role: 'Sanitation Inspector',
    email: 'inspector.verma@patna.gov.in',
    clearance: 'Level 2 Clearance'
  };

  const handleLogout = () => {
    localStorage.removeItem('swachhlens_auth_token');
    onClose();
    navigate('/welcome');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Top decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 p-0.5 shadow-lg shadow-teal-500/20 mb-4">
                <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <User className="w-8 h-8 text-teal-400" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mt-2">
                <Shield className="w-3 h-3" />
                {user.role}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-medium text-slate-200">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Access Level</span>
                  <span className="text-sm font-medium text-slate-200">{user.clearance}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-6 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-all group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Log Out of Console</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
