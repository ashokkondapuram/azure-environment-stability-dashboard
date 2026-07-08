import axios from 'axios';

const BASE = process.env.REACT_APP_API_BASE || '/api';
const G    = `${BASE}/grafana`;

export const fetchGrafanaHealth      = () => axios.get(`${G}/health`).then(r => r.data);
export const fetchGrafanaDashboards  = () => axios.get(`${G}/dashboards`).then(r => r.data);
export const fetchGrafanaDashboard   = (uid) => axios.get(`${G}/dashboards/${uid}`).then(r => r.data);
export const fetchGrafanaAlerts      = () => axios.get(`${G}/alerts`).then(r => r.data);
export const fetchGrafanaDatasources = () => axios.get(`${G}/datasources`).then(r => r.data);
export const postGrafanaQuery        = (payload) => axios.post(`${G}/query`, payload).then(r => r.data);
