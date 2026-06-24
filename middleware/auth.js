// Middleware that requires a logged-in session for API routes
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

module.exports = { requireAuth };
