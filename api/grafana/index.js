const axios = require('axios');

/**
 * Grafana API Proxy — Azure Function
 *
 * Routes:
 *   GET  /api/grafana/dashboards              - list all dashboards
 *   GET  /api/grafana/dashboards/{uid}        - get single dashboard
 *   GET  /api/grafana/dashboards/{uid}/panels - get panels for a dashboard
 *   GET  /api/grafana/alerts                  - list Grafana alert rules
 *   GET  /api/grafana/datasources             - list configured data sources
 *   GET  /api/grafana/health                  - Grafana health check
 *   POST /api/grafana/query                   - proxy a raw Grafana datasource query
 *
 * Auth: Uses a Grafana Service Account token stored in Function App settings.
 * The token never reaches the browser — the Function acts as a secure proxy.
 */

const GRAFANA_URL   = process.env.GRAFANA_URL;   // e.g. https://myworkspace.grafana.azure.com
const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN; // Grafana Service Account token

function grafanaClient() {
  if (!GRAFANA_URL || !GRAFANA_TOKEN) {
    throw new Error('GRAFANA_URL and GRAFANA_TOKEN must be set in Function App configuration.');
  }
  return axios.create({
    baseURL: `${GRAFANA_URL}/api`,
    headers: {
      Authorization: `Bearer ${GRAFANA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
}

module.exports = async function (context, req) {
  try {
    const client   = grafanaClient();
    const route    = req.params?.route || '';
    const segments = route.split('/').filter(Boolean);

    // GET /grafana/health
    if (req.method === 'GET' && segments[0] === 'health') {
      const { data } = await client.get('/health');
      context.res = { status: 200, body: data };
      return;
    }

    // GET /grafana/datasources
    if (req.method === 'GET' && segments[0] === 'datasources') {
      const { data } = await client.get('/datasources');
      context.res = { status: 200, body: data };
      return;
    }

    // GET /grafana/alerts
    if (req.method === 'GET' && segments[0] === 'alerts') {
      const { data } = await client.get('/v1/provisioning/alert-rules');
      const normalized = (Array.isArray(data) ? data : data.rules || []).map(r => ({
        uid:         r.uid,
        title:       r.title,
        state:       r.state || r.health,
        severity:    r.labels?.severity || 'unknown',
        environment: r.labels?.environment || 'unknown',
        folder:      r.folderUID,
        updatedAt:   r.updated,
      }));
      context.res = { status: 200, body: normalized };
      return;
    }

    // GET /grafana/dashboards  — list all
    if (req.method === 'GET' && segments[0] === 'dashboards' && !segments[1]) {
      const { data } = await client.get('/search?type=dash-db&limit=50');
      const normalized = data.map(d => ({
        uid:       d.uid,
        title:     d.title,
        folder:    d.folderTitle || 'General',
        url:       `${GRAFANA_URL}${d.url}`,
        tags:      d.tags || [],
        updatedAt: d.sortMeta,
      }));
      context.res = { status: 200, body: normalized };
      return;
    }

    // GET /grafana/dashboards/{uid}  — single dashboard metadata
    if (req.method === 'GET' && segments[0] === 'dashboards' && segments[1] && !segments[2]) {
      const uid = segments[1];
      const { data } = await client.get(`/dashboards/uid/${uid}`);
      context.res = { status: 200, body: {
        uid:       data.dashboard.uid,
        title:     data.dashboard.title,
        url:       `${GRAFANA_URL}/d/${uid}`,
        panels:    (data.dashboard.panels || []).map(p => ({
          id:    p.id,
          title: p.title,
          type:  p.type,
        })),
        tags:      data.dashboard.tags || [],
      }};
      return;
    }

    // POST /grafana/query  — raw datasource query proxy
    if (req.method === 'POST' && segments[0] === 'query') {
      const { data } = await client.post('/ds/query', req.body);
      context.res = { status: 200, body: data };
      return;
    }

    context.res = { status: 404, body: { error: 'Grafana proxy route not found' } };
  } catch (err) {
    context.log.error('Grafana proxy error:', err.message);
    const status = err.response?.status || 500;
    context.res = { status, body: { error: err.message, grafanaStatus: err.response?.data } };
  }
};
