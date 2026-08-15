import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, MapPin, Activity } from 'lucide-react';

export default function GetStartedPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to login with state to automatically open Register view
    navigate('/login', { state: { register: true } });
  };

  const handleLogin = () => {
    // Navigate normally for existing users
    navigate('/login', { state: { register: false } });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background Mesh Gradient Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Nav (Logo only) */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl w-full mx-auto mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-wide">SwachhLens</span>
        </div>
        <button 
          onClick={handleLogin}
          className="px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all"
        >
          Officer Login
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto flex-1 mt-12 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold tracking-wider uppercase mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          Next-Gen Sanitation AI
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-teal-100 to-emerald-100 tracking-tight leading-tight mb-6">
          Smarter Waste Management for a Cleaner Tomorrow.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl leading-relaxed mb-10">
          Empowering municipal corporations with real-time AI computer vision to track, prioritize, and resolve citizen grievances instantly.
        </p>

        <button 
          onClick={handleGetStarted}
          className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-lg tracking-wide shadow-xl shadow-teal-500/25 flex items-center gap-3 transition-all transform hover:-translate-y-1"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md text-left flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base">Real-Time AI Processing</h3>
            <p className="text-slate-400 text-sm">Automatically analyzes and prioritizes complaints using computer vision.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md text-left flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base">Live Geolocation</h3>
            <p className="text-slate-400 text-sm">Interactive map tracking for pinpoint dispatching and route optimization.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md text-left flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base">Secure Verification</h3>
            <p className="text-slate-400 text-sm">Tamper-proof closure reports with post-resolution photo verification.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto text-xs text-slate-500">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Leaf className="w-4 h-4 text-emerald-500" />
          <span>SwachhLens Initiative &copy; 2026</span>
        </div>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-slate-300 transition-colors">Privacy Policy</span>
          <span className="cursor-pointer hover:text-slate-300 transition-colors">Terms of Service</span>
          <span className="cursor-pointer hover:text-slate-300 transition-colors">Support</span>
        </div>
      </footer>
    </div>
  );
}
