/**
 * Fail fast in production when critical SaaS configuration is missing.
 */
function validateOrExit() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const required = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_KEY', 'ALLOWED_ORIGINS'];
  const missing = required.filter((k) => !process.env[k] || !String(process.env[k]).trim());

  if (missing.length) {
    console.error(
      '[saas] Refusing to start: missing required environment variables:',
      missing.join(', ')
    );
    process.exit(1);
  }

  if (String(process.env.JWT_SECRET).trim().length < 32) {
    console.error('[saas] Refusing to start: JWT_SECRET must be at least 32 characters in production.');
    process.exit(1);
  }

  if (!process.env.MONGO_URI || !String(process.env.MONGO_URI).trim()) {
    console.warn(
      '[saas] MONGO_URI is not set. Mongo-backed routes (e.g. some fee verification) will not work until it is configured.'
    );
  }
}

module.exports = { validateOrExit };
