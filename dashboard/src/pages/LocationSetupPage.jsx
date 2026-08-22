import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';
import LightRays from '../components/ui/LightRays';

export default function LocationSetupPage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    // Ideally we'd hit a '/auth/me' endpoint to get the latest status.
    // For the hackathon demo, we will just force a re-login to fetch the new token/state,
    // or simulate an API call here.
    setTimeout(() => {
      setIsChecking(false);
      alert("Still pending. Please wait for an administrator to assign your jurisdiction, then log in again.");
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('swachhlens_auth_token');
    localStorage.removeItem('swachhlens_role');
    localStorage.removeItem('swachhlens_state');
    localStorage.removeItem('swachhlens_district');
    localStorage.removeItem('swachhlens_city');
    localStorage.removeItem('swachhlens_ward');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen">
        <LightRays
          raysOrigin="top-center"
          raysColor="#f59e0b" 
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.5}
          followMouse={true}
          mouseInfluence={0.2}
          pulsating={true}
        />
      </div>

      <div className="w-full max-w-[26rem] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 relative z-10 shadow-2xl text-center">
        
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-[26px] font-semibold text-white tracking-tight mb-3">
          Pending Approval
        </h1>
        
        <p className="text-[13px] text-slate-400 font-medium mb-8 leading-relaxed">
          Your account has been created successfully. However, your official jurisdiction has not yet been assigned. 
          <br/><br/>
          Please wait for a Commissioner to approve your account and assign your sector.
        </p>

        <div className="space-y-4">
          <button
            onClick={checkStatus}
            disabled={isChecking}
            className="w-full py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
