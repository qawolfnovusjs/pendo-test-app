/**
 * Pendo Test App – Backend
 *
 * Minimal Express server. Responsibilities:
 *   1. Serve static frontend assets from /public
 *   2. Mock auth (POST /api/login, POST /api/logout, GET /api/me)
 *   3. Mock data endpoints to give the UI something to render and
 *      something for Pendo to track interactions against.
 *
 * Auth here is fake: we sign a tiny opaque token and stash it in a
 * cookie. Don't use this in production. It exists so the frontend can
 * call pendo.initialize() with realistic visitor/account fields after
 * "login".
 */

const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Fake user database. Add more users to test segmentation in Pendo
// (e.g. role: "admin" vs "user", different account plans, etc.).
// ---------------------------------------------------------------------------
const USERS = {
  'ada@example.com': {
    id: 'u_ada_001',
    email: 'ada@example.com',
    fullName: 'Ada Lovelace',
    role: 'admin',
    password: 'password',
    account: {
      id: 'acc_acme_001',
      name: 'Acme Corp',
      planLevel: 'enterprise',
    },
  },
  'grace@example.com': {
    id: 'u_grace_002',
    email: 'grace@example.com',
    fullName: 'Grace Hopper',
    role: 'user',
    password: 'password',
    account: {
      id: 'acc_acme_001',
      name: 'Acme Corp',
      planLevel: 'enterprise',
    },
  },
  'alan@example.com': {
    id: 'u_alan_003',
    email: 'alan@example.com',
    fullName: 'Alan Turing',
    role: 'user',
    password: 'password',
    account: {
      id: 'acc_bletchley_002',
      name: 'Bletchley Inc',
      planLevel: 'starter',
    },
  },
};

// In-memory session store: token -> userEmail
const SESSIONS = new Map();

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf('=');
        return [c.slice(0, idx), decodeURIComponent(c.slice(idx + 1))];
      })
  );
}

function getCurrentUser(req) {
  const { session } = parseCookies(req);
  if (!session) return null;
  const email = SESSIONS.get(session);
  if (!email) return null;
  return USERS[email] || null;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = USERS[(email || '').toLowerCase().trim()];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  SESSIONS.set(token, user.email);

  res.setHeader(
    'Set-Cookie',
    `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 8}`
  );

  // Return everything the frontend needs to call pendo.initialize()
  res.json({
    visitor: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
    },
    account: user.account,
  });
});

app.post('/api/logout', (req, res) => {
  const { session } = parseCookies(req);
  if (session) SESSIONS.delete(session);
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({
    visitor: {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
    },
    account: user.account,
  });
});

// ---------------------------------------------------------------------------
// Mock data endpoints – give the frontend something to render so users
// have realistic things to click on (good for Pendo feature tagging).
// ---------------------------------------------------------------------------
const PRODUCTS = [
  { id: 'p_001', name: 'Analytics Pro', category: 'Analytics', price: 49, status: 'active' },
  { id: 'p_002', name: 'Insights Plus', category: 'Analytics', price: 99, status: 'active' },
  { id: 'p_003', name: 'Reports Lite', category: 'Reporting', price: 19, status: 'beta' },
  { id: 'p_004', name: 'Dashboards Studio', category: 'Reporting', price: 79, status: 'active' },
  { id: 'p_005', name: 'Forecast Engine', category: 'Forecasting', price: 149, status: 'active' },
  { id: 'p_006', name: 'Anomaly Detector', category: 'Forecasting', price: 199, status: 'beta' },
];

app.get('/api/products', (req, res) => {
  if (!getCurrentUser(req)) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ products: PRODUCTS });
});

app.post('/api/products/:id/favorite', (req, res) => {
  if (!getCurrentUser(req)) return res.status(401).json({ error: 'Not authenticated' });
  const product = PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true, favorited: product.id });
});

app.post('/api/settings', (req, res) => {
  if (!getCurrentUser(req)) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ ok: true, saved: req.body });
});

// ---------------------------------------------------------------------------
// Static files. Routes that look like pages get the right .html file.
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

['dashboard', 'products', 'settings'].forEach((page) => {
  app.get(`/${page}`, (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

app.listen(PORT, () => {
  console.log(`\n  Pendo test app running on http://localhost:${PORT}`);
  console.log(`  Try logging in as: ada@example.com / password\n`);
});
