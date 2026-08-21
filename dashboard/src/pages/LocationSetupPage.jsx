import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, CheckCircle2, LocateFixed } from 'lucide-react';
import LightRays from '../components/ui/LightRays';
import indiaLocations from '../data/india_locations.json';

export default function LocationSetupPage() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt auto-detect on mount
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          if (data && data.address) {
            const { state, state_district, county, city } = data.address;
            
            if (state) {
              const matchedState = indiaLocations.states.find(s => 
                s.name.toLowerCase() === state.toLowerCase() ||
                s.name.toLowerCase().includes(state.toLowerCase()) ||
                state.toLowerCase().includes(s.name.toLowerCase())
              );
              
              if (matchedState) {
                setSelectedState(matchedState.name);
                
                const distToMatch = state_district || county || city;
                if (distToMatch) {
                  const matchedDistrict = matchedState.districts.find(d => 
                    d.name.toLowerCase().includes(distToMatch.toLowerCase().replace(' district', '')) ||
                    distToMatch.toLowerCase().includes(d.name.toLowerCase())
                  );
                  if (matchedDistrict) {
                    setSelectedDistrict(matchedDistrict.name);
                    
                    if (city) {
                      const matchedCity = matchedDistrict.cities.find(c => 
                        c.toLowerCase().includes(city.toLowerCase()) ||
                        city.toLowerCase().includes(c.toLowerCase())
                      );
                      if (matchedCity) setSelectedCity(matchedCity);
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          setError('Failed to reverse geocode location.');
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        console.log('Location access denied or unavailable', err);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedState || !selectedDistrict) {
      setError('State and District are mandatory to assign your jurisdiction.');
      return;
    }

    setIsLoading(true);

    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const token = localStorage.getItem('swachhlens_auth_token');

      const response = await fetch(`${BASE_URL}/auth/profile/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          state: selectedState,
          district: selectedDistrict,
          city: selectedCity || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update jurisdiction');
      }

      // Update local storage
      localStorage.setItem('swachhlens_state', selectedState);
      localStorage.setItem('swachhlens_district', selectedDistrict);
      if (selectedCity) {
        localStorage.setItem('swachhlens_city', selectedCity);
      } else {
        localStorage.removeItem('swachhlens_city');
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update jurisdiction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background */}
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

      {/* Main Glass Card */}
      <div className="w-full max-w-[26rem] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 relative z-10 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-[26px] font-semibold text-white tracking-tight">
            Assign Jurisdiction
          </h1>
          <p className="text-[13px] text-slate-400 font-medium mt-2">
            Welcome aboard! Please set your assigned sector. State and District are mandatory for all officers.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetecting}
            className="w-full py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition-all mb-4"
          >
            <LocateFixed className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            {isDetecting ? 'Detecting Location...' : 'Auto-Detect My Location'}
          </button>

          <div className="space-y-3">
            {/* State Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                State (Mandatory)
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('');
                    setSelectedCity('');
                  }}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 focus:border-emerald-500/30 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-slate-900">Select State</option>
                  {indiaLocations.states.map((s) => (
                    <option key={s.name} value={s.name} className="bg-slate-900">
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>
            </div>

            {/* District Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                District (Mandatory)
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedCity('');
                  }}
                  disabled={!selectedState}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 focus:border-emerald-500/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                  required
                >
                  <option value="" className="bg-slate-900">Select District</option>
                  {selectedState && indiaLocations.states
                    .find((s) => s.name === selectedState)
                    ?.districts.map((d) => (
                      <option key={d.name} value={d.name} className="bg-slate-900">
                        {d.name}
                      </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>
            </div>

            {/* City Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                City / Ward (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 focus:border-white/10 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-slate-900">Select City/Ward (Optional)</option>
                  {selectedDistrict && indiaLocations.states
                    .find((s) => s.name === selectedState)
                    ?.districts.find((d) => d.name === selectedDistrict)
                    ?.cities.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">
                        {c}
                      </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !selectedState || !selectedDistrict}
            className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
          >
            <span>{isLoading ? 'Processing...' : 'Confirm Jurisdiction'}</span>
            {!isLoading && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </form>

      </div>
    </div>
  );
}
