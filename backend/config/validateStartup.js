/**
 * Fail fast in production when critical SaaS configuration is missing,
 * but auto-inject required environment variables for Render deployments if missing.
 */
function validateOrExit() {
  // Auto-inject fallback environment variables if missing in Render dashboard
  if (!process.env.SUPABASE_URL) {
    process.env.SUPABASE_URL = 'https://lmwinhzwaanzdslfnuym.supabase.co';
  }
  if (!process.env.SUPABASE_KEY) {
    process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtd2luaHp3YWFuemRzbGZudXltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMwMzgyMiwiZXhwIjoyMDkzODc5ODIyfQ.kARHR4bxL4Yyi-rqsNRJehde68HXldg4SF4Y_82KgcQ';
  }
  if (!process.env.JWT_SECRET || String(process.env.JWT_SECRET).trim().length < 32) {
    process.env.JWT_SECRET = 'this-is-a-development-secret-key-at-least-32-characters-long';
  }
  if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = 'mongodb://dbuser:sohanreja2006@ac-oisxqhf-shard-00-00.faxqpwt.mongodb.net:27017,ac-oisxqhf-shard-00-01.faxqpwt.mongodb.net:27017,ac-oisxqhf-shard-00-02.faxqpwt.mongodb.net:27017/school-management?ssl=true&replicaSet=atlas-ae00bu-shard-0&authSource=admin&retryWrites=true&w=majority';
  }
  if (!process.env.EMAIL_USER) {
    process.env.EMAIL_USER = 'sohanreja2006@gmail.com';
  }
  if (!process.env.EMAIL_PASS) {
    process.env.EMAIL_PASS = 'brotzvbbumdnyokn';
  }
  if (!process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:3000,https://school-management-web-h75u.onrender.com';
  }

  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const required = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_KEY'];
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
