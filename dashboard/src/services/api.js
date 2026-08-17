import axios from 'axios';

// Configure Axios instance for backend connection
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor to attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('swachhlens_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Fetch complaints list from real backend with optional filtering, search, and sorting.
 */
export const getComplaints = async (filters = {}) => {
  try {
    const params = {};

    if (filters.category && filters.category !== 'all') {
      params.category = filters.category;
    }

    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    if (filters.priorityRange && filters.priorityRange !== 'all') {
      if (filters.priorityRange === 'urgent') params.min_priority = 75;
      else if (filters.priorityRange === 'high') params.min_priority = 50;
      else if (filters.priorityRange === 'medium') params.min_priority = 25;
      else if (filters.priorityRange === 'low') params.min_priority = 0;
    }

    if (filters.sortBy) {
      params.sort_by = filters.sortBy;
    }

    if (filters.sortOrder) {
      params.sort_order = filters.sortOrder;
    }

    const response = await apiClient.get('/complaints', { params });
    let list = response.data;

    // Search keyword filtering (address, ID, reporter comment, assigned team)
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (item) =>
          (item.address && item.address.toLowerCase().includes(q)) ||
          (item.id && item.id.toLowerCase().includes(q)) ||
          (item.reporter_comment && item.reporter_comment.toLowerCase().includes(q)) ||
          (item.comment && item.comment.toLowerCase().includes(q)) ||
          (item.assigned_team && item.assigned_team.toLowerCase().includes(q))
      );
    }

    return {
      success: true,
      data: list,
      total: list.length
    };
  } catch (error) {
    console.error('Failed to fetch complaints from backend:', error);
    return {
      success: false,
      data: [],
      total: 0,
      error: error.response?.data?.detail || error.message || 'Failed to connect to backend server'
    };
  }
};

/**
 * Fetch single complaint by ID from real backend.
 */
export const getComplaintById = async (id) => {
  try {
    const response = await apiClient.get(`/complaints/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Failed to fetch complaint ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Complaint not found'
    };
  }
};

/**
 * Update complaint status and optional resolution/team details.
 */
export const updateComplaintStatus = async (id, status, resolveData = null) => {
  try {
    const payload = { status };
    if (resolveData?.officerName || resolveData?.assigned_team) {
      payload.assigned_team = resolveData.officerName || resolveData.assigned_team;
    }

    const response = await apiClient.patch(`/complaints/${id}/status`, payload);
    return {
      success: true,
      data: response.data,
      message: `Status updated to ${status}`
    };
  } catch (error) {
    console.error(`Failed to update complaint status for ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to update status'
    };
  }
};

/**
 * Update team assignment for a complaint.
 */
export const assignTeam = async (id, assigned_team) => {
  try {
    const response = await apiClient.patch(`/complaints/${id}/status`, {
      status: 'in_progress',
      assigned_team
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Failed to assign team for ${id}:`, error);
    return {
      success: false,
      message: error.response?.data?.detail || 'Failed to assign team'
    };
  }
};

/**
 * Fetch hotspot cluster aggregations.
 */
export const getHotspots = async () => {
  try {
    const response = await apiClient.get('/complaints/hotspots');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Failed to fetch hotspots:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

/**
 * Reset mock data (no-op helper for UI button compatibility).
 */
export const resetMockData = async () => {
  try {
    // Attempt re-fetching to verify connection
    await apiClient.get('/health');
    return { success: true };
  } catch (e) {
    return { success: false };
  }
};

/**
 * Get aggregated analytics metrics from backend.
 */
export const getAnalyticsSummary = async () => {
  try {
    const response = await apiClient.get('/analytics/summary');
    const summaryData = response.data;

    return {
      success: true,
      summary: {
        total: summaryData.total || 0,
        pending: summaryData.by_status?.submitted || 0,
        inProgress: summaryData.by_status?.in_progress || 0,
        resolved: summaryData.by_status?.resolved || 0,
        urgentCount: summaryData.urgent_count || 0
      },
      categoryCounts: summaryData.by_category || {},
      timeline: summaryData.timeline || [],
      wardPerformance: summaryData.ward_performance || []
    };
  } catch (error) {
    console.error('Failed to fetch analytics summary:', error);
    return {
      success: false,
      summary: { total: 0, pending: 0, inProgress: 0, resolved: 0, urgentCount: 0 },
      categoryCounts: {},
      timeline: [],
      wardPerformance: [],
      error: error.message
    };
  }
};
