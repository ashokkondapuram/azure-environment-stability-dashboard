/**
 * GET /api/snapshots
 * Fetches snapshot records from Azure Table Storage scoped to authenticated client.
 * Table: Snapshots | PartitionKey = clientId | RowKey = snapshotId
 */
const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables');
const { requireAuth } = require('../_middleware/auth');

const ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
const KEY     = process.env.AZURE_STORAGE_KEY;

module.exports = async function (context, req) {
  const claims = requireAuth(context, req);
  if (!claims) return;

  try {
    const cred   = new AzureNamedKeyCredential(ACCOUNT, KEY);
    const client = new TableClient(`https://${ACCOUNT}.table.core.windows.net`, 'Snapshots', cred);

    const rows = [];
    for await (const entity of client.listEntities({
      queryOptions: { filter: `PartitionKey eq '${claims.clientId}'` }
    })) rows.push(entity);

    const now = Date.now();
    const enriched = rows.map(r => ({
      id:            r.rowKey,
      clientId:      r.partitionKey,
      resourceGroup: r.resourceGroup,
      snapshotName:  r.snapshotName,
      sourceVm:      r.sourceVm,
      diskSizeGB:    r.diskSizeGB,
      sizeGB:        r.sizeGB,
      state:         r.state || 'Succeeded',
      type:          r.incrementalOrFull || 'Full',
      createdAt:     r.createdAt,
      expiryDate:    r.expiryDate,
      retentionDays: r.retentionDays || 30,
      ageWarning:    r.expiryDate
        ? new Date(r.expiryDate).getTime() - now < 7 * 86400000
        : false,
      notes:         r.notes || '',
    }));

    // Sort: expiring soonest first
    enriched.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });

    context.res = { status: 200, body: enriched };
  } catch (err) {
    context.log.error('Snapshots error:', err.message);
    context.res = { status: 500, body: { error: err.message } };
  }
};
