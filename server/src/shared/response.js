export function success(res, data, meta = null, status = 200) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function fail(res, { status = 400, code = 'ERROR', message = 'Request failed', details = null }) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ success: false, error });
}
