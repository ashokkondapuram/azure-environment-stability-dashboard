/**
 * Shared JWT auth middleware for Azure Functions.
 * Usage: const { requireAuth } = require('../_middleware/auth');
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function requireAuth(context, req) {
  const auth  = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) {
    context.res = { status: 401, body: { error: 'Authentication required' } };
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    context.res = { status: 401, body: { error: 'Invalid or expired token' } };
    return null;
  }
}

module.exports = { requireAuth };
