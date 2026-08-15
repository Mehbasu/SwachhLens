import React, { useState } from 'react';
import { Menu, Search, Bell, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { resetMockData } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { GooeySearchBar } from './ui/animated-search-bar';

export default function Navbar({ searchValue, onSearchChange }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const handleResetData = async () => {
    setIsResetting(true);
    await resetMockData();
    setIsResetting(false);
    window.location.reload();
  };

  const notifications = [
    { id: 1, title: 'Urgent Bio-Hazard Report', time: '10 mins ago', desc: 'Hospital waste at Kurji Holy Family', type: 'urgent' },
    { id: 2, title: 'JCB Excavator Deployed', time: '25 mins ago', desc: 'Gandhi Maidan garbage dump clearance', type: 'info' },
    { id: 3, title: 'Complaint Resolved', time: '1 hr ago', desc: 'Rajendra Nagar overbridge cleaned', type: 'success' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 px-4 md:px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      {/* Left side: Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <GooeySearchBar onGlobalSearch={onSearchChange} />
      </div>

      {/* Right side: Live badge, reset data button, notifications */}
      <div className="flex items-center gap-2.5">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Patna Grid</span>
        </div>

        {/* Demo Reset Helper */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          title="Reset state to initial 18 mock complaints"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline">Reset Mock Data</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in ring-1 ring-white/5">
              <div className="p-3 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Control Alerts</span>
                <span className="bg-teal-500/20 text-teal-400 text-[10px] px-1.5 py-0.5 rounded font-bold">3 New</span>
              </div>

              <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/complaints');
                    }}
                    className="p-3 hover:bg-slate-800/60 cursor-pointer transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {n.type === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                        {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
