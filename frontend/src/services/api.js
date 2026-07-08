import axios from 'axios';

const BASE = process.env.REACT_APP_API_BASE || '/api';

export const fetchAlerts        = () => axios.get(`${BASE}/alerts`).then(r => r.data);
export const acknowledgeAlert   = (id) => axios.post(`${BASE}/alerts/${id}/acknowledge`).then(r => r.data);
export const fetchMetrics       = (resourceId) => axios.get(`${BASE}/metrics?resourceId=${encodeURIComponent(resourceId)}`).then(r => r.data);
export const fetchActivityLogs  = () => axios.get(`${BASE}/activityLogs`).then(r => r.data);
export const fetchResourceHealth = () => axios.get(`${BASE}/resourceHealth`).then(r => r.data);
export const fetchMonitorLogs   = () => axios.get(`${BASE}/monitorLogs`).then(r => r.data);
export const queryLogs          = (kql) => axios.post(`${BASE}/monitorLogs`, { query: kql }).then(r => r.data);

// Admin-only
export const fetchUsers         = () => axios.get(`${BASE}/admin/users`).then(r => r.data);
export const updateUserRole     = (userId, role) => axios.patch(`${BASE}/admin/users/${userId}`, { role }).then(r => r.data);
export const fetchSystemConfig  = () => axios.get(`${BASE}/admin/config`).then(r => r.data);
export const updateSystemConfig = (config) => axios.put(`${BASE}/admin/config`, config).then(r => r.data);
