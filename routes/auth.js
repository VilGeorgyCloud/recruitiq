const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db/pool');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // e.g. https://yourapp.up.railway.app/auth/google/callback

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// ── STEP 1: Redirect user to Google's login page ──────────────
router.get('/google', (req, res) => {
  const url = client.generateAuthUrl({
    access_type: 'online',
    scope: ['profile', 'email'],
    prompt: 'select_account',
  });
  res.redirect(url);
});

// ── STEP 2: Google redirects back here with a code ────────────
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect('/login.html?error=no_code');

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Verify and decode the ID token to get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    // Check if this email exists in appuser table
    const { rows } = await pool.query(
      `SELECT * FROM appuser WHERE email = $1 AND isactive = true`,
      [email]
    );

    if (!rows.length) {
      // Not authorized — redirect to a "no access" page
      return res.redirect(`/login.html?error=no_access&email=${encodeURIComponent(email)}`);
    }

    // Store session
    req.session.user = {
      email: rows[0].email,
      name: rows[0].name,
      role: rows[0].role,
      appUserId: rows[0].id,
    };

    res.redirect('/index.html');
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect('/login.html?error=auth_failed');
  }
});

// ── Check current session (used by frontend to verify login) ──
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// ── Logout ──────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

module.exports = router;
