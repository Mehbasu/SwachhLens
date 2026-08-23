import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LogOut, ArrowRight } from 'lucide-react';
import LightRays from '../components/ui/LightRays';
import indiaLocations from '../data/india_locations.json';

export default function LocationSetupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [stateLoc, setStateLoc] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('swachhlens_auth_token');
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

    try {
      const response = await fetch(`${BASE_URL}/auth/jurisdiction/self`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ state: stateLoc, district, city, ward })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update jurisdiction');
      }

      // Update local storage
      localStorage.setItem('swachhlens_state', stateLoc);
      localStorage.setItem('swachhlens_district', district);
      localStorage.setItem('swachhlens_city', city);
      localStorage.setItem('swachhlens_ward', ward);

      // Navigate to dashboard
      navigate('/');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
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
          raysColor="#10b981" 
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.5}
          followMouse={true}
          mouseInfluence={0.2}
          pulsating={true}
        />
      </div>

      <div className="w-full max-w-[26rem] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 relative z-10 shadow-2xl text-center">
        
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <MapPin className="w-8 h-8" />
        </div>
        
        <h1 className="text-[26px] font-semibold text-white tracking-tight mb-3">
          Set Jurisdiction
        </h1>
        
        <p className="text-[13px] text-slate-400 font-medium mb-6 leading-relaxed">
          Please specify the region you are responsible for to continue.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left mb-6">
          <div className="grid grid-cols-2 gap-3">
                <select
                  value={stateLoc}
                  onChange={(e) => { setStateLoc(e.target.value); setDistrict(''); setCity(''); }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 appearance-none"
                  required
                >
                  <option value="" className="bg-[#0a0a0a]">Select State *</option>
                  {indiaLocations.states.map((s) => (
                    <option key={s.name} value={s.name} className="bg-[#0a0a0a]">{s.name}</option>
                  ))}
                </select>
                <select
                  value={district}
                  onChange={(e) => { setDistrict(e.target.value); setCity(''); }}
                  disabled={!stateLoc}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 appearance-none disabled:opacity-50"
                  required
                >
                  <option value="" className="bg-[#0a0a0a]">Select District *</option>
                  {stateLoc && indiaLocations.states.find(s => s.name === stateLoc)?.districts.map((d) => (
                    <option key={d.name} value={d.name} className="bg-[#0a0a0a]">{d.name}</option>
                  ))}
                </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!district}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 appearance-none disabled:opacity-50"
                  required
                >
                  <option value="" className="bg-[#0a0a0a]">Select City *</option>
                  {district && indiaLocations.states.find(s => s.name === stateLoc)?.districts.find(d => d.name === district)?.cities.map((c) => (
                    <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>
                  ))}
                </select>
            <input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="Ward (Optional)"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
          >
            <span>{isLoading ? 'Saving...' : 'Save & Continue'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

      </div>
    </div>
  );
}
