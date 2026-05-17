function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function isSupabaseConfigured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_KEY);
}

/**
 * For school data routes: in production, Supabase is mandatory (no mock data).
 * @returns {boolean} true if the response was already sent (caller should return)
 */
function rejectWithoutSupabase(res) {
  if (isSupabaseConfigured()) {
    return false;
  }
  if (isProduction()) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable: database is not configured.',
    });
    return true;
  }
  return false;
}

module.exports = {
  isProduction,
  isSupabaseConfigured,
  rejectWithoutSupabase,
};
