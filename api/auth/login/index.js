/**
 * POST /api/auth/login
 * Validates username=clientname, password=clientname against Azure Table Storage.
 * Returns a signed JWT containing clientId, role, projectName, resourceGroups.
 */
const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables');
const jwt = require('jsonwebtoken');

const ACCOUNT    = process.env.AZURE_STORAGE_ACCOUNT;
const KEY        = process.env.AZURE_STORAGE_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const TABLE      = 'ClientUsers';

module.exports = async function (context, req) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    context.res = { status: 400, body: { error: 'username and password required' } };
    return;
  }

  // Rule: password must equal username (clientname)
  if (username.toLowerCase() !== password.toLowerCase()) {
    context.res = { status: 401, body: { error: 'Invalid credentials' } };
    return;
  }

  try {
    const cred   = new AzureNamedKeyCredential(ACCOUNT, KEY);
    const client = new TableClient(`https://${ACCOUNT}.table.core.windows.net`, TABLE, cred);

    let entity;
    try {
      entity = await client.getEntity(username.toLowerCase(), username.toLowerCase());
    } catch {
      context.res = { status: 401, body: { error: 'User not found' } };
      return;
    }

    const token = jwt.sign(
      {
        clientId:       entity.clientId    || username.toLowerCase(),
        username:       entity.rowKey,
        displayName:    entity.displayName || username,
        role:           entity.role        || 'viewer',
        projectName:    entity.projectName || username,
        resourceGroups: JSON.parse(entity.resourceGroups || '[]'),
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    context.res = {
      status: 200,
      body: { token, clientId: entity.clientId || username.toLowerCase(), displayName: entity.displayName || username }
    };
  } catch (err) {
    context.log.error('Login error:', err.message);
    context.res = { status: 500, body: { error: 'Authentication service error' } };
  }
};
