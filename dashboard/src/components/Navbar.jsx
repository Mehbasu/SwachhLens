import React, { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useNotifications } from "../hooks/useNotifications";

export default function Navbar({ searchValue, onSearchChange }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, unseenCount, markAllSeen } = useNotifications();

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening && unseenCount > 0) {
      markAllSeen();
    }
  };

  return (
    <div className="sticky top-0 z-30 pt-4 px-4 flex justify-center pointer-events-none">
      <header className="pointer-events-auto w-[98%] max-w-full h-16 bg-white/80 dark:bg-[#1a1b26]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl px-5 flex items-center justify-between shadow-lg dark:shadow-2xl transition-all">
        {/* Left: Branding */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent tracking-wide">
            SwachhLens
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span>Live</span>
          </div>

          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unseenCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#1a1b26] animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#1a1b26]" />
                </>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 ring-1 ring-slate-200 dark:ring-white/5">
                {/* Header */}
                <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    Complaint Alerts
                  </span>
                  {notifications.length > 0 && (
                    <span className="bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] px-1.5 py-0.5 rounded font-bold">
                      {notifications.length} Recent
                    </span>
                  )}
                </div>

                {/* List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No pending complaints in your area
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { setShowNotifications(false); navigate("/complaints"); }}
                        className={"p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors text-xs space-y-1" + (!n.seen ? " bg-teal-50/60 dark:bg-teal-900/10 border-l-2 border-teal-500" : "")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                            {n.type === "urgent"
                              ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              : <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            }
                            <span className="truncate">{n.title}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate pl-5">{n.desc}</p>
                        {!n.seen && (
                          <span className="inline-block ml-5 text-[9px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                            New
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div
                    className="p-2 text-center text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 cursor-pointer border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 font-semibold transition-colors"
                    onClick={() => { setShowNotifications(false); navigate("/complaints"); }}
                  >
                    View All Complaints →
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
