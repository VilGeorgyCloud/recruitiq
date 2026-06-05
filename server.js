require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── SERVE STATIC FRONTEND ─────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API ROUTES ────────────────────────────────────────────────
app.use('/api/candidates', require('./routes/candidates'));
app.use('/api/entries',    require('./routes/entries'));
app.use('/api',            require('./routes/misc'));

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── FALLBACK: serve index.html for all other routes ───────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RecruitIQ server running on port ${PORT}`);
});
