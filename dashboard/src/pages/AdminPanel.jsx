import React, { useState, useEffect } from 'react';
import { Shield, Check, MapPin } from 'lucide-react';
import indiaLocations from '../data/india_locations.json';

export default function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [processing, setProcessing] = useState({});

  const role = localStorage.getItem('swachhlens_role');
  
  const fetchPendingUsers = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const token = localStorage.getItem('swachhlens_auth_token');
      const res = await fetch(`${BASE_URL}/auth/users/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch pending users');
      const data = await res.json();
      setPendingUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'commissioner') {
      fetchPendingUsers();
    } else {
      setLoading(false);
    }
  }, [role]);

  if (role !== 'commissioner') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 mt-2">You must be a Commissioner to access this panel.</p>
      </div>
    );
  }

  const handleAssignmentChange = (email, field, value) => {
    setAssignments(prev => ({
      ...prev,
      [email]: {
        ...prev[email],
        [field]: value,
        // reset downstream fields
        ...(field === 'state' ? { district: '', city: '' } : {}),
        ...(field === 'district' ? { city: '' } : {})
      }
    }));
  };

  const submitAssignment = async (email) => {
    const data = assignments[email];
    if (!data || !data.state || !data.district) {
      alert("State and District are mandatory");
      return;
    }

    setProcessing(p => ({ ...p, [email]: true }));
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      const token = localStorage.getItem('swachhlens_auth_token');
      const res = await fetch(`${BASE_URL}/auth/users/${email}/jurisdiction`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Assignment failed');
      
      // Remove from list on success
      setPendingUsers(prev => prev.filter(u => u.email !== email));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(p => ({ ...p, [email]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
          <Shield className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Control Panel</h1>
          <p className="text-slate-400 text-sm">Assign jurisdictions to pending officers</p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading pending requests...</p>
      ) : error ? (
        <p className="text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</p>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">All Clear</h3>
          <p className="text-slate-400">No pending officers requiring jurisdiction assignment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map(user => {
            const userAssignment = assignments[user.email] || {};
            const stateObj = indiaLocations.states.find(s => s.name === userAssignment.state);
            const districtObj = stateObj?.districts.find(d => d.name === userAssignment.district);

            return (
              <div key={user.email} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-1">{user.email}</h3>
                  <p className="text-slate-400 text-xs mb-4 uppercase tracking-wider">Role: {user.role}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <select
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-2.5 outline-none focus:border-teal-500"
                      value={userAssignment.state || ''}
                      onChange={e => handleAssignmentChange(user.email, 'state', e.target.value)}
                    >
                      <option value="">Select State</option>
                      {indiaLocations.states.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>

                    <select
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-2.5 outline-none focus:border-teal-500"
                      value={userAssignment.district || ''}
                      onChange={e => handleAssignmentChange(user.email, 'district', e.target.value)}
                      disabled={!userAssignment.state}
                    >
                      <option value="">Select District</option>
                      {stateObj?.districts.map(d => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>

                    <select
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-2.5 outline-none focus:border-teal-500"
                      value={userAssignment.city || ''}
                      onChange={e => handleAssignmentChange(user.email, 'city', e.target.value)}
                      disabled={!userAssignment.district}
                    >
                      <option value="">Select City (Optional)</option>
                      {districtObj?.cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Ward (Optional)"
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl p-2.5 outline-none focus:border-teal-500 placeholder-slate-600"
                      value={userAssignment.ward || ''}
                      onChange={e => handleAssignmentChange(user.email, 'ward', e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={() => submitAssignment(user.email)}
                  disabled={processing[user.email] || !userAssignment.state || !userAssignment.district}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 h-10 flex items-center justify-center shrink-0"
                >
                  {processing[user.email] ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
