require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const { requireAuth } = require('./middleware/auth');

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'recruitiq-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: null, // session cookie — expires when browser closes (per requirement: no persistence)
  },
}));

// ── AUTH ROUTES (always public — needed to log in) ────────────
app.use('/auth', require('./routes/auth'));

// ── PUBLIC STATIC FILES (only login page + its assets) ─────────
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ── GATE: everything else requires a session ───────────────────
app.use((req, res, next) => {
  // Allow auth routes and login page through (already handled above)
  if (req.path.startsWith('/auth')) return next();
  if (req.path === '/login.html') return next();

  // API routes: return JSON 401 instead of redirecting
  if (req.path.startsWith('/api')) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Everything else (pages, assets): redirect to login if not authenticated
  if (req.session && req.session.user) return next();
  return res.redirect('/login.html');
});

// ── SERVE STATIC FRONTEND (only reached if authenticated) ──────
app.use(express.static(path.join(__dirname, 'public')));

// ── API ROUTES (already gated above) ────────────────────────────
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api', require('./routes/misc'));

// ── HEALTH CHECK (public, for Railway healthcheck) ──────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── FALLBACK: serve index.html for all other authenticated routes ─
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RecruitIQ server running on port ${PORT}`);
});
