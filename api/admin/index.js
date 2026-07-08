const { BlobServiceClient } = require('@azure/storage-blob');
const { DefaultAzureCredential } = require('@azure/identity');

/**
 * Admin Function — handles:
 *   GET  /api/admin/users          → list users with roles
 *   PATCH /api/admin/users/{id}    → update user role
 *   GET  /api/admin/config         → get system config
 *   PUT  /api/admin/config         → update system config
 *
 * Role enforcement: This function checks the x-ms-client-principal header
 * injected by Azure Static Web Apps after authentication.
 */
module.exports = async function (context, req) {
  // Extract caller role from SWA-injected header
  const principal = getPrincipal(req);
  if (!principal || !principal.userRoles.includes('admin')) {
    context.res = { status: 403, body: { error: 'Forbidden: admin role required' } };
    return;
  }

  const credential = new DefaultAzureCredential();
  const storageUrl = process.env.STORAGE_ACCOUNT_URL;
  const blobClient = new BlobServiceClient(storageUrl, credential);
  const container  = blobClient.getContainerClient('admin-config');
  await container.createIfNotExists();

  const route = req.params?.route || '';
  const segments = route.split('/').filter(Boolean); // ['users'] or ['users', '{id}'] or ['config']

  // GET /admin/users
  if (req.method === 'GET' && segments[0] === 'users') {
    const blob = container.getBlockBlobClient('users.json');
    const exists = await blob.exists();
    const users = exists ? JSON.parse(await streamToString((await blob.download()).readableStreamBody)) : [];
    context.res = { status: 200, body: users };
    return;
  }

  // PATCH /admin/users/{id}
  if (req.method === 'PATCH' && segments[0] === 'users' && segments[1]) {
    const userId = segments[1];
    const { role } = req.body || {};
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      context.res = { status: 400, body: { error: 'Invalid role' } };
      return;
    }
    const blob = container.getBlockBlobClient('users.json');
    const exists = await blob.exists();
    const users = exists ? JSON.parse(await streamToString((await blob.download()).readableStreamBody)) : [];
    const updated = users.map(u => u.id === userId ? { ...u, role } : u);
    await blob.upload(JSON.stringify(updated), JSON.stringify(updated).length, { overwrite: true });
    context.res = { status: 200, body: { success: true } };
    return;
  }

  // GET /admin/config
  if (req.method === 'GET' && segments[0] === 'config') {
    const blob = container.getBlockBlobClient('config.json');
    const exists = await blob.exists();
    const config = exists ? JSON.parse(await streamToString((await blob.download()).readableStreamBody)) : defaultConfig();
    context.res = { status: 200, body: config };
    return;
  }

  // PUT /admin/config
  if (req.method === 'PUT' && segments[0] === 'config') {
    const config = req.body || {};
    const blob = container.getBlockBlobClient('config.json');
    await blob.upload(JSON.stringify(config), JSON.stringify(config).length, { overwrite: true });
    context.res = { status: 200, body: { success: true } };
    return;
  }

  context.res = { status: 404, body: { error: 'Not found' } };
};

function getPrincipal(req) {
  try {
    const header = req.headers['x-ms-client-principal'];
    if (!header) return null;
    return JSON.parse(Buffer.from(header, 'base64').toString('utf-8'));
  } catch { return null; }
}

function defaultConfig() {
  return {
    grafanaUrl: '',
    refreshInterval: 60,
    criticalThreshold: 1,
    warningThreshold: 3,
    notifyEmail: '',
  };
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf-8');
}
