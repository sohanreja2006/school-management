/**
 * Central JWT secret access — never fall back to a known default in production.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim();
  if (secret && secret.length >= 32) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is required in production and must be at least 32 characters.'
    );
  }
  if (secret && secret.length > 0) {
    console.warn(
      '[saas] JWT_SECRET is shorter than 32 characters. Use a longer secret before production deploy.'
    );
    return secret;
  }
  console.warn(
    '[saas] JWT_SECRET is not set. Using a development-only default; set JWT_SECRET in .env for stable sessions.'
  );
  return 'dev-only-jwt-secret-min-32-chars!!';
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '30d';
}

module.exports = { getJwtSecret, getJwtExpiresIn };
