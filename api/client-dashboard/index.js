/**
 * GET /api/client-dashboard
 * Aggregates all dashboard data for the authenticated client from Azure Table Storage.
 * All tables are scoped to PartitionKey = clientId so clients never see each other's data.
 */
const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables');
const { requireAuth } = require('../_middleware/auth');

const ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
const KEY     = process.env.AZURE_STORAGE_KEY;

function tableClient(table) {
  const cred = new AzureNamedKeyCredential(ACCOUNT, KEY);
  return new TableClient(`https://${ACCOUNT}.table.core.windows.net`, table, cred);
}

async function fetchAll(table, clientId, extraFilter = '') {
  const client = tableClient(table);
  const filter = extraFilter
    ? `PartitionKey eq '${clientId}' and ${extraFilter}`
    : `PartitionKey eq '${clientId}'`;
  const rows = [];
  for await (const e of client.listEntities({ queryOptions: { filter } })) rows.push(e);
  return rows;
}

module.exports = async function (context, req) {
  const claims = requireAuth(context, req);
  if (!claims) return;

  const cid = claims.clientId;

  try {
    const [alerts, cpuMem, httpErrors, siteDown, disks, snapshots, activity] = await Promise.all([
      fetchAll('ClientAlerts',      cid),
      fetchAll('ClientMetrics',     cid),
      fetchAll('ClientHttpErrors',  cid),
      fetchAll('ClientSiteStatus',  cid),
      fetchAll('ClientDisks',       cid, `attached eq false`),
      fetchAll('Snapshots',         cid),
      fetchAll('ClientActivityLog', cid),
    ]);

    const now = Date.now();

    context.res = {
      status: 200,
      body: {
        clientId:    cid,
        projectName: claims.projectName,
        fetchedAt:   new Date().toISOString(),

        summary: {
          totalAlerts:       alerts.length,
          criticalAlerts:    alerts.filter(a => a.severity === 'Critical').length,
          sitesDown:         siteDown.filter(s => s.status === 'Down').length,
          unattachedDisks:   disks.length,
          snapshotsExpiring: snapshots.filter(s => s.expiryDate && new Date(s.expiryDate).getTime() - now < 7 * 86400000).length,
          httpErrors5xx:     httpErrors.filter(e => (e.statusCode || 0) >= 500).length,
        },

        alerts: alerts.map(a => ({
          id: a.rowKey, name: a.alertName, severity: a.severity,
          resource: a.resourceName, resourceGroup: a.resourceGroup,
          environment: a.environment, firedAt: a.firedAt,
          status: a.status, description: a.description,
        })),

        cpuMemory: cpuMem.map(m => ({
          id: m.rowKey, resource: m.resourceName, resourceGroup: m.resourceGroup,
          cpu: parseFloat(m.cpuPercent || 0), memory: parseFloat(m.memoryPercent || 0),
          timestamp: m.Timestamp,
          cpuAlert: parseFloat(m.cpuPercent || 0) > 85,
          memAlert: parseFloat(m.memoryPercent || 0) > 85,
        })),

        httpErrors: httpErrors.map(e => ({
          id: e.rowKey, url: e.url, statusCode: e.statusCode,
          method: e.method, resourceGroup: e.resourceGroup,
          count: e.count || 1, firstSeen: e.firstSeen,
          lastSeen: e.lastSeen, message: e.message,
        })),

        siteDown: siteDown.map(s => ({
          id: s.rowKey, siteName: s.siteName, url: s.siteUrl,
          status: s.status, lastChecked: s.lastChecked,
          downtimeSince: s.downtimeSince, resourceGroup: s.resourceGroup,
          responseMs: s.responseMs,
        })),

        disksUnattached: disks.map(d => ({
          id: d.rowKey, diskName: d.diskName, resourceGroup: d.resourceGroup,
          sizeGB: d.sizeGB, sku: d.sku, region: d.region,
          createdAt: d.createdAt, costPerMonth: d.costPerMonth,
        })),

        snapshots: snapshots.map(s => ({
          id: s.rowKey, snapshotName: s.snapshotName,
          resourceGroup: s.resourceGroup, sourceVm: s.sourceVm,
          diskSizeGB: s.diskSizeGB, sizeGB: s.sizeGB,
          state: s.state, type: s.incrementalOrFull,
          createdAt: s.createdAt, expiryDate: s.expiryDate,
          ageWarning: s.expiryDate
            ? new Date(s.expiryDate).getTime() - now < 7 * 86400000
            : false,
        })),

        activityLog: activity.slice(0, 50).map(a => ({
          id: a.rowKey, operation: a.operationName,
          caller: a.caller, resourceGroup: a.resourceGroup,
          status: a.operationStatus, timestamp: a.eventTimestamp,
          description: a.description,
        })),
      }
    };
  } catch (err) {
    context.log.error('Client dashboard error:', err.message);
    context.res = { status: 500, body: { error: err.message } };
  }
};
