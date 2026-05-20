import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';
import { success, fail } from '../../shared/response.js';
import {
  signAccessToken,
  createRefreshTokenRecord,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  verifyRefreshToken,
} from '../../services/tokenService.js';
import { getUserOrganizations } from '../../services/organizationService.js';
import { createError } from '../../middleware/errorHandler.js';

async function buildAuthResponse(user, activeOrgId = null) {
  const organizations = await getUserOrganizations(user._id);
  const orgId = activeOrgId || user.lastActiveOrganizationId?.toString() || organizations[0]?.id;
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    activeOrganizationId: orgId || null,
  });
  const refreshToken = await createRefreshTokenRecord(user._id);
  return {
    user: { id: user._id.toString(), name: user.name, email: user.email },
    accessToken,
    refreshToken,
    organizations,
  };
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return fail(res, { status: 409, code: 'CONFLICT', message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
    const data = await buildAuthResponse(user);
    return success(res, data, null, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return fail(res, { status: 401, code: 'UNAUTHORIZED', message: 'Invalid email or password' });
    }
    const data = await buildAuthResponse(user);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const header = req.headers.authorization;
    const raw = header?.startsWith('Bearer ') ? header.slice(7) : req.body?.refreshToken;
    if (!raw) {
      return fail(res, { status: 401, code: 'UNAUTHORIZED', message: 'Refresh token required' });
    }

    verifyRefreshToken(raw);
    const record = await validateRefreshToken(raw);
    if (!record) {
      return fail(res, { status: 401, code: 'UNAUTHORIZED', message: 'Invalid refresh token' });
    }

    const user = await User.findById(record.userId);
    if (!user || user.deletedAt) {
      return fail(res, { status: 401, code: 'UNAUTHORIZED', message: 'User not found' });
    }

    await revokeRefreshToken(raw);
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      activeOrganizationId: user.lastActiveOrganizationId?.toString() || null,
    });
    const refreshToken = await createRefreshTokenRecord(user._id);
    return success(res, { accessToken, refreshToken });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return fail(res, { status: 401, code: 'UNAUTHORIZED', message: 'Refresh token expired' });
    }
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const header = req.headers.authorization;
    const raw = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (raw) await revokeRefreshToken(raw).catch(() => {});
    await revokeAllUserTokens(req.user.id);
    return success(res, {});
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.deletedAt) {
      return fail(res, { status: 401, code: 'UNAUTHORIZED', message: 'User not found' });
    }
    const organizations = await getUserOrganizations(user._id);
    return success(res, {
      user: { id: user._id.toString(), name: user.name, email: user.email },
      organizations,
    });
  } catch (err) {
    next(err);
  }
}
