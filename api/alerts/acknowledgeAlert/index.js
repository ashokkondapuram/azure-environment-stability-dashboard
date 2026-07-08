const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');

/**
 * POST /api/alerts/{id}/acknowledge
 * Requires editor or admin role.
 */
module.exports = async function (context, req) {
  const principal = getPrincipal(req);
  const roles = principal?.userRoles || [];
  if (!roles.includes('editor') && !roles.includes('admin')) {
    context.res = { status: 403, body: { error: 'Forbidden: editor or admin role required' } };
    return;
  }

  const alertId = req.params.id;
  const credential = new DefaultAzureCredential();
  const storageUrl = process.env.STORAGE_ACCOUNT_URL;
  const blobClient = new BlobServiceClient(storageUrl, credential);
  const container = blobClient.getContainerClient('alerts');

  const blob = container.getBlockBlobClient(`${alertId}.json`);
  const exists = await blob.exists();
  if (!exists) {
    context.res = { status: 404, body: { error: 'Alert not found' } };
    return;
  }

  const text = await streamToString((await blob.download()).readableStreamBody);
  const alerts = JSON.parse(text);
  const updated = alerts.map(a => a.id === alertId ? { ...a, acknowledged: true, acknowledgedBy: principal.userDetails, acknowledgedAt: new Date().toISOString() } : a);
  await blob.upload(JSON.stringify(updated), JSON.stringify(updated).length, { overwrite: true });

  context.res = { status: 200, body: { success: true } };
};

function getPrincipal(req) {
  try {
    const header = req.headers['x-ms-client-principal'];
    if (!header) return null;
    return JSON.parse(Buffer.from(header, 'base64').toString('utf-8'));
  } catch { return null; }
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}
