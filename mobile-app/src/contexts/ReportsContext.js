import React, { createContext, useState, useEffect, useContext } from 'react';
import { initialMockReports, initialNotifications } from '../data/mockData';
import { getMyComplaints } from '../services/api';
import { auth } from '../config/firebase';

const ReportsContext = createContext();

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState(initialMockReports);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const fetchReportsFromBackend = async () => {
    setLoading(true);
    try {
      const data = await getMyComplaints();
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (e) {
      console.warn('Could not fetch backend reports, maintaining current state:', e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchReportsFromBackend();
      } else {
        // Clear reports if logged out
        setReports(initialMockReports);
      }
    });
    return unsubscribe;
  }, []);

  const addReport = (newReport) => {
    setReports((prev) => [newReport, ...prev]);

    // Also trigger a notification for the newly submitted report
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      report_id: newReport.id,
      title: "Report Submitted Successfully ✨",
      message: `Your report (${newReport.id}) for ${newReport.address} has been received by SwachhLens AI Portal.`,
      timestamp: "Just now",
      unread: true,
      icon: "check-circle",
      type: "submitted"
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  const getStats = () => {
    const total = reports.length;
    const submitted = reports.filter((r) => r.status === 'submitted').length;
    const inProgress = reports.filter((r) => r.status === 'in_progress').length;
    const resolved = reports.filter((r) => r.status === 'resolved').length;
    const ecoPoints = resolved * 50 + total * 10;

    return { total, submitted, inProgress, resolved, ecoPoints };
  };

  const getRecentReports = (limit = 3) => {
    return reports.slice(0, limit);
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        loading,
        notifications,
        addReport,
        refreshReports: fetchReportsFromBackend,
        markNotificationRead,
        getStats,
        getRecentReports
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
