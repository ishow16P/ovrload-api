export function notFound(req, res) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message])),
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value', fields: err.keyValue });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message });
}

export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}
