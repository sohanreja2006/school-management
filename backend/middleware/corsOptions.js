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
      if (
        list.includes(origin) ||
        origin.includes('vercel.app') ||
        origin.includes('onrender.com') ||
        origin.includes('railway.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  };
}

module.exports = { buildCorsOptions };
