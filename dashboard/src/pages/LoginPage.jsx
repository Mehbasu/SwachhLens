import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, Lock, Mail, ArrowRight, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('officer.patna@swachhlens.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('Sanitation Inspector');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('swachhlens_auth_token', 'mock_jwt_token_patna_2026');
    navigate('/');
  };

  const handleDemoFill = (demoRole) => {
    if (demoRole === 'inspector') {
      setEmail('inspector.verma@patna.gov.in');
      setRole('Sanitation Inspector');
    } else {
      setEmail('commissioner.patna@swachhlens.gov.in');
      setRole('Municipal Commissioner');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Box */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 shadow-xl shadow-teal-500/20 text-white mb-1">
            <Sparkles className="w-7 h-7 fill-white text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">SwachhLens Dashboard</h1>
          <p className="text-xs text-slate-400 font-medium">Municipal Waste Management Admin Portal</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold mt-2">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Patna Municipal Corporation</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Official Email ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@swachhlens.gov.in"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Access Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="Sanitation Inspector">Sanitation Inspector (Ward Level)</option>
              <option value="Municipal Commissioner">Municipal Commissioner (Admin)</option>
              <option value="Control Room Operator">Control Room Operator</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>Access Control Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Auto-fill Helper */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-center">
          <p className="text-[11px] text-slate-400">Select Demo Account Role:</p>
          <div className="flex gap-2 justify-center">
            <button
              type="button"
              onClick={() => handleDemoFill('inspector')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 font-medium transition-colors"
            >
              Inspector Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('commissioner')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 font-medium transition-colors"
            >
              Commissioner Demo
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-500 text-xs flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>SwachhLens Sanitation AI System &copy; 2026</span>
      </footer>
    </div>
  );
}
