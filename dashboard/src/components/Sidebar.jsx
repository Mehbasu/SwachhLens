import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogOut,
  Sparkles,
  ShieldCheck,
  Building2,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Complaints', path: '/complaints', icon: ClipboardList },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 }
  ];

  const handleLogout = () => {
    localStorage.removeItem('swachhlens_auth_token');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-extrabold">
              <Sparkles className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-white tracking-wide">SwachhLens</h1>
                <span className="bg-teal-500/10 text-teal-400 text-[10px] px-1.5 py-0.2 rounded border border-teal-500/20 font-mono font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Municipal Admin Portal</p>
            </div>
          </div>

          {/* Patna Municipal Corporation Sub-bar */}
          <div className="mx-3 mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">Patna Municipal Corp.</div>
              <div className="text-[10px] text-slate-400 truncate">Control Room #04</div>
            </div>
          </div>

          {/* Nav Navigation */}
          <nav className="p-3 space-y-1.5 mt-4">
            <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Main Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-600/90 to-emerald-600/90 text-white shadow-lg shadow-teal-500/15 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / Officer Info & Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-3 bg-slate-900/50">
          <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs border border-teal-500/30">
              PMC
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                <span>Insp. A. K. Verma</span>
                <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 truncate">Senior Officer</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>
    </>
  );
}
