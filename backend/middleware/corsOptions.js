const { isProduction } = require('../utils/saas');

function buildCorsOptions() {
  const raw = process.env.ALLOWED_ORIGINS;
  const list = raw
    ? raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (!isProduction()) {
        if (list.length === 0) {
          return callback(null, true);
        }
        if (list.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      }
      if (list.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  };
}

module.exports = { buildCorsOptions };
