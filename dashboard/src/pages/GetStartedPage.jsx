import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, MapPin, Activity } from 'lucide-react';
import LightRays from '../components/ui/light-rays';

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
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Light Rays Background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#14b8a6" // teal-500
          raysSpeed={1.5}
          lightSpread={0.7}
          rayLength={1.4}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.03}
          distortion={0.05}
        />
      </div>

      {/* Top Nav */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto mt-6 px-6 py-3 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Leaf className="w-5 h-5 text-teal-400" />
          <span className="text-base font-bold text-white tracking-wide">SwachhLens</span>
        </div>
        <button 
          onClick={handleLogin}
          className="px-5 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors"
        >
          Officer Login
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center flex-1 px-6 -mt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-medium mb-6 backdrop-blur-sm">
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-bold text-[10px]">NEW</span>
          AI-Powered Insights
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.2] mb-6 max-w-3xl drop-shadow-lg">
          Smarter Waste Management<br/>for a Cleaner Tomorrow
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl leading-relaxed mb-10">
          Empowering municipal corporations with real-time AI computer vision to track, prioritize, and resolve citizen grievances instantly.
        </p>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleGetStarted}
            className="px-8 py-3 rounded-xl bg-slate-200 hover:bg-white text-slate-900 font-semibold text-base transition-colors inline-block"
          >
            Get started
          </button>
          <button 
            onClick={handleLogin}
            className="px-8 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-base transition-colors inline-block"
          >
            Learn more
          </button>
        </div>
      </main>

    </div>
  );
}
