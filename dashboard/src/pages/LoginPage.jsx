import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import LightRays from '../components/ui/LightRays';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginPage() {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.register || false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('inspector'); // 'inspector' | 'commissioner'
  const [name, setName] = useState('');
  const [stateLoc, setStateLoc] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAutoDetect = () => {
    setIsDetecting(true);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsDetecting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data && data.address) {
            setStateLoc(data.address.state || '');
            setDistrict(data.address.state_district || data.address.county || '');
            setCity(data.address.city || data.address.town || data.address.village || '');
            // Ward usually can't be auto-detected accurately via nominatim, leave it for manual entry or keep what's there
          }
        } catch (err) {
          console.error("Failed to reverse geocode:", err);
          setError("Failed to auto-detect location");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setError("Location permission denied or unavailable");
        setIsDetecting(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const token = await userCredential.user.getIdToken();

      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const payload = { role: role };
      if (isRegister) {
        payload.name = name;
        if (role === 'inspector') {
          payload.state = stateLoc;
          payload.district = district;
          payload.city = city;
          payload.ward = ward;
        }
      }

      const response = await fetch(`${BASE_URL}/auth/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // We still store this for the PrivateRoute checks if we don't refactor PrivateRoute
      localStorage.setItem('swachhlens_auth_token', token);
      localStorage.setItem('swachhlens_role', data.role);
      
      if (data.state) localStorage.setItem('swachhlens_state', data.state);
      if (data.district) localStorage.setItem('swachhlens_district', data.district);
      if (data.city) localStorage.setItem('swachhlens_city', data.city);

      navigate('/');
    } catch (err) {
      setError(err.message);
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
          raysColor="#ff7b00" /* Changed to match the warm cinematic vibe of the screenshot */
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
          <h1 className="text-[26px] font-semibold text-white tracking-tight">
            {isRegister ? 'Request Access' : 'Welcome Back'}
          </h1>
          <p className="text-[13px] text-slate-400 font-medium mt-1">
            {isRegister 
              ? 'Apply for clearance to the cinematic control center' 
              : 'Authenticate to access the cinematic control center'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Conditional Role Toggle for Registration */}
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Access Level
              </label>
              <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setRole('inspector')}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    role === 'inspector'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sanitation Inspector
                </button>
                <button
                  type="button"
                  onClick={() => setRole('commissioner')}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    role === 'commissioner'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Administrator
                </button>
              </div>

              {/* Name Field */}
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Insp. A. K. Verma"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 focus:border-white/10 transition-all placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Jurisdiction Fields for Inspector */}
              {role === 'inspector' && (
                <div className="space-y-4 mb-4 border border-white/10 p-4 rounded-2xl bg-black/20">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Jurisdiction Area
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoDetect}
                      disabled={isDetecting}
                      className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-1 rounded-md hover:bg-teal-500/30 transition-colors disabled:opacity-50"
                    >
                      {isDetecting ? 'Detecting...' : 'Auto-detect GPS'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={stateLoc}
                      onChange={(e) => setStateLoc(e.target.value)}
                      placeholder="State (e.g. Bihar)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-xs focus:outline-none focus:bg-white/10"
                      required
                    />
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="District (e.g. Patna)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-xs focus:outline-none focus:bg-white/10"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City (e.g. Patna)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-xs focus:outline-none focus:bg-white/10"
                      required
                    />
                    <input
                      type="text"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder="Ward (e.g. Ward 14)"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-xs focus:outline-none focus:bg-white/10"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@netshield.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 focus:border-white/10 transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              {!isRegister && (
                <span className="text-[11px] text-slate-400 hover:text-white cursor-pointer transition-colors">
                  Forgot password?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 focus:border-white/10 transition-all placeholder:text-slate-600 tracking-widest font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Registration Only) */}
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:bg-white/10 focus:border-white/10 transition-all placeholder:text-slate-600 tracking-widest font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-white hover:bg-slate-200 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Processing...' : (isRegister ? 'Request Access' : 'Login to Control Center')}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center">
          {isRegister ? (
            <p className="text-xs text-slate-400">
              Already have an access clearance?{' '}
              <button 
                onClick={() => setIsRegister(false)}
                className="font-bold text-white hover:underline ml-1"
              >
                Login
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Need access clearance?{' '}
              <button 
                onClick={() => setIsRegister(true)}
                className="font-bold text-white hover:underline ml-1"
              >
                Request Access
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
