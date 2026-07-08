const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');

// This function receives Site24x7 webhook payloads and stores them in Blob Storage
module.exports = async function (context, req) {
  try {
    if (req.method !== 'POST') {
      context.res = { status: 405, body: 'Method Not Allowed' };
      return;
    }

    const payload = req.body;
    const normalized = {
      source: 'Site24x7',
      name: payload.MONITOR_NAME || payload.monitor_name,
      severity: mapSeverity(payload.STATUS || payload.status),
      environment: payload.TAG || payload.tag || 'Production',
      resource: payload.MONITOR_URL || payload.monitor_url,
      description: payload.REASON || payload.reason,
      firedAt: new Date().toISOString()
    };

    const credential = new DefaultAzureCredential();
    const storageUrl = process.env.STORAGE_ACCOUNT_URL;
    const blobClient = new BlobServiceClient(storageUrl, credential);
    const containerClient = blobClient.getContainerClient('alerts');
    await containerClient.createIfNotExists();

    const blobName = `site24-${Date.now()}.json`;
    const blockBlob = containerClient.getBlockBlobClient(blobName);
    await blockBlob.upload(JSON.stringify([normalized]), JSON.stringify([normalized]).length);

    context.res = { status: 200, body: { received: true, id: blobName } };
  } catch (err) {
    context.log.error('Site24x7 webhook error:', err);
    context.res = { status: 500, body: { error: err.message } };
  }
};

function mapSeverity(status = '') {
  const s = status.toUpperCase();
  if (s === 'DOWN' || s === 'CRITICAL') return 'Critical';
  if (s === 'TROUBLE' || s === 'WARNING') return 'Warning';
  return 'Informational';
}
