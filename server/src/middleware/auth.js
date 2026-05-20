import { verifyAccessToken } from '../services/tokenService.js';
import { fail } from '../shared/response.js';
import { createError } from './errorHandler.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return fail(res, { status: 401, code: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  const token = header.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, email: decoded.email };
    req.activeOrganizationId = decoded.activeOrganizationId || null;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return fail(res, { status: 401, code: 'TOKEN_EXPIRED', message: 'Access token expired' });
    }
    return fail(res, { status: 401, code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const decoded = verifyAccessToken(header.slice(7));
    req.user = { id: decoded.sub, email: decoded.email };
  } catch {
    /* ignore */
  }
  next();
}
