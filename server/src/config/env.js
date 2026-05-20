import dotenv from 'dotenv';

dotenv.config();

/** Comma-separated origins, e.g. https://app.vercel.app,http://localhost:5173 */
function parseClientUrls() {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/opsflow',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  clientUrls: parseClientUrls(),
  uploadDir: process.env.UPLOAD_DIR || '',
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB) || 5,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
};

export function validateProductionEnv() {
  if (env.nodeEnv !== 'production') return;
  const weak = (s) =>
    !s || s.includes('change-me') || s.includes('dev-access') || s.includes('dev-refresh');
  if (weak(env.jwtAccessSecret) || weak(env.jwtRefreshSecret)) {
    console.warn(
      '[opsflow] WARNING: Set strong JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in production.'
    );
  }
  if (!process.env.MONGO_URI) {
    console.warn('[opsflow] WARNING: MONGO_URI is not set — using default local MongoDB URI.');
  }
}
