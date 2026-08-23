import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Mail, Shield, X, Edit2, Check, Camera } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('swachhlens_auth_token');
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setEditName(data.name || '');
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('swachhlens_auth_token');
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editName })
      });
      if (res.ok) {
        setUser({ ...user, name: editName });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('swachhlens_auth_token');
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const res = await fetch(`${BASE_URL}/auth/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, avatar_url: data.avatar_url });
      }
    } catch (err) {
      console.error("Failed to upload avatar", err);
    }
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
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 p-0.5 shadow-lg shadow-teal-500/20 mb-4 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm overflow-hidden relative">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-teal-400" />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
              </div>
              
              {isLoading ? (
                <div className="h-6 w-32 bg-white/10 animate-pulse rounded-md mt-1"></div>
              ) : isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:border-teal-500"
                    autoFocus
                  />
                  <button onClick={handleSaveProfile} disabled={isSaving} className="p-1.5 rounded-md bg-teal-500/20 text-teal-400 hover:bg-teal-500/30">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="p-1.5 rounded-md bg-white/10 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group mt-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">{user?.name || user?.email?.split('@')[0] || 'Unknown User'}</h2>
                  <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mt-2 capitalize">
                <Shield className="w-3 h-3" />
                {user?.role || 'User'}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-medium text-slate-200">
                    {isLoading ? <div className="h-4 w-24 bg-white/10 animate-pulse rounded mt-1"></div> : user?.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Access Level</span>
                  <span className="text-sm font-medium text-slate-200 capitalize">
                    {isLoading ? <div className="h-4 w-20 bg-white/10 animate-pulse rounded mt-1"></div> : `${user?.role} Clearance`}
                  </span>
                </div>
              </div>
              
              {user?.role === 'inspector' && user?.state && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jurisdiction</span>
                    <span className="text-sm font-medium text-slate-200">
                      {[user.city, user.district, user.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              )}
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
