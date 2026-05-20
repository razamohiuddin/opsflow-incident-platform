export function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.details?.[0]?.message || 'Validation failed',
        details: err.details?.map((d) => ({ path: d.path.join('.'), message: d.message })),
      },
    });
  }

  if (err.name === 'CastError' && err.path === 'organizationId') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ORG_ID',
        message: 'Invalid organization id. Log out and sign in again.',
      },
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code || 'ERROR', message: err.message },
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}

export function createError(statusCode, code, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}
