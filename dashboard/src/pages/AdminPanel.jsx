import React, { useState, useEffect, useCallback } from "react";
import { Shield, Check, RefreshCw } from "lucide-react";
import indiaLocations from "../data/india_locations.json";

export default function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [processing, setProcessing] = useState({});

  const role = localStorage.getItem("swachhlens_role");

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";
      const token = localStorage.getItem("swachhlens_auth_token");
      const res = await fetch(`${BASE_URL}/auth/users/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending users");
      const data = await res.json();
      setPendingUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAssignmentChange = useCallback((email, field, value) => {
    setAssignments((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        [field]: value,
        ...(field === "state" ? { district: "", city: "" } : {}),
        ...(field === "district" ? { city: "" } : {}),
      },
    }));
  }, []);

  const submitAssignment = useCallback(async (email) => {
    const data = assignments[email];
    if (!data || !data.state || !data.district) {
      alert("Please select State and District first.");
      return;
    }
    setProcessing((p) => ({ ...p, [email]: true }));
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";
      const token = localStorage.getItem("swachhlens_auth_token");
      const res = await fetch(`${BASE_URL}/auth/users/${encodeURIComponent(email)}/jurisdiction`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Assignment failed – " + (await res.text()));
      setPendingUsers((prev) => prev.filter((u) => u.email !== email));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing((p) => ({ ...p, [email]: false }));
    }
  }, [assignments]);

  useEffect(() => {
    if (role === "commissioner") {
      fetchPendingUsers();
    } else {
      setLoading(false);
    }
  }, [role, fetchPendingUsers]);

  // ── Access denied guard ──────────────────────────────────────────────────
  if (role !== "commissioner") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">You must be a Commissioner to access this panel.</p>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Control Panel</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Assign jurisdictions to pending officers</p>
          </div>
        </div>
        <button
          onClick={fetchPendingUsers}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center gap-3 text-slate-500 p-6">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading pending requests…
        </div>
      ) : error ? (
        <p className="text-rose-500 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">{error}</p>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Clear</h3>
          <p className="text-slate-600 dark:text-slate-400">No pending officers requiring jurisdiction assignment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => {
            const ua = assignments[user.email] || {};
            const stateObj = indiaLocations.states.find((s) => s.name === ua.state);
            const districtObj = stateObj?.districts.find((d) => d.name === ua.district);

            const selectCls =
              "w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 " +
              "text-slate-900 dark:text-slate-100 text-sm rounded-xl px-3 py-2.5 " +
              "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors " +
              "disabled:opacity-40 disabled:cursor-not-allowed";

            return (
              <div
                key={user.email}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
              >
                {/* User info */}
                <div className="mb-4">
                  <h3 className="text-slate-900 dark:text-white font-bold">{user.email}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mt-0.5">
                    Role: {user.role}
                  </p>
                </div>

                {/* Dropdowns + Assign */}
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  {/* State */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">State *</label>
                    <select
                      className={selectCls}
                      value={ua.state || ""}
                      onChange={(e) => handleAssignmentChange(user.email, "state", e.target.value)}
                    >
                      <option value="">Select State</option>
                      {indiaLocations.states.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">District *</label>
                    <select
                      className={selectCls}
                      value={ua.district || ""}
                      onChange={(e) => handleAssignmentChange(user.email, "district", e.target.value)}
                      disabled={!ua.state}
                    >
                      <option value="">{ua.state ? "Select District" : "Select State first"}</option>
                      {stateObj?.districts.map((d) => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">City (optional)</label>
                    <select
                      className={selectCls}
                      value={ua.city || ""}
                      onChange={(e) => handleAssignmentChange(user.email, "city", e.target.value)}
                      disabled={!ua.district}
                    >
                      <option value="">{ua.district ? "Select City" : "Select District first"}</option>
                      {districtObj?.cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ward */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Ward (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ward 12"
                      className={selectCls}
                      value={ua.ward || ""}
                      onChange={(e) => handleAssignmentChange(user.email, "ward", e.target.value)}
                    />
                  </div>

                  {/* Assign button */}
                  <button
                    onClick={() => submitAssignment(user.email)}
                    disabled={processing[user.email] || !ua.state || !ua.district}
                    className="shrink-0 h-10 px-6 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 mt-5"
                  >
                    {processing[user.email] ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Assigning…</>
                    ) : (
                      "Assign"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
