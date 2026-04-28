# Pendo Test App

A small JavaScript app — Express backend, vanilla-JS frontend — set up so you have realistic surfaces for testing [Pendo](https://novus.pendo.io/): page tracking, visitor/account identification, custom events, feature tagging, and guides.

## Setup

```bash
npm install
npm start
```

The app runs on http://localhost:3000.

Test users (password: `password`):

| Email                | Role  | Account            | Plan       |
| -------------------- | ----- | ------------------ | ---------- |
| ada@example.com      | admin | Acme Corp          | enterprise |
| grace@example.com    | user  | Acme Corp          | enterprise |
| alan@example.com     | user  | Bletchley Inc      | starter    |

Different account/plan combinations let you test segmentation in Pendo without spinning up extra users.

## Wire up Pendo

1. Sign in at https://novus.pendo.io/ and grab your API key  
   *(Subscription Settings → Install Settings → API Key)*.
2. Open `public/js/pendo.js` and replace:
   ```js
   window.PENDO_API_KEY = 'YOUR_PENDO_API_KEY_HERE';
   ```
   with your real key.
3. Restart the server (or just refresh — it's a static asset).

That's it. Pendo's agent will auto-track page loads and clicks. Visitors are identified by `public/js/auth.js` after `/api/me` resolves.

## What's already trackable

**Pages** (each is a real navigation, so Pendo's auto page tracking just works):
- `/` — login
- `/dashboard` — stats + quick actions + recent activity
- `/products` — filterable product catalog with favorite/subscribe buttons
- `/settings` — profile form, notification toggles, danger zone

**Custom events** fired via `pendo.track()`:
- `User Signed In` (with `role`)
- `Weekly Report Run`
- `Quick Action Clicked` (with `action` payload)
- `Activity Item Clicked`
- `Product Favorited`, `Product Subscribed`
- `Product Filter Changed`
- `New Product Clicked`
- `Settings Saved`, `Settings Cancelled`
- `Delete Account Clicked`

**Form interactions** (settings page) — useful for testing Pendo guides triggered by form behavior.

**DOM targets for feature tagging** — buttons, links, and cards have stable `id`s so Pendo Designer can attach to them without worrying about generated class names.

## Project structure

```
pendo-test-app/
├── server.js              Express server, mock auth, mock API
├── package.json
├── public/
│   ├── index.html         Login page (anonymous Pendo init)
│   ├── dashboard.html     Post-login landing
│   ├── products.html      Catalog
│   ├── settings.html      Profile + notifications
│   ├── css/styles.css
│   └── js/
│       ├── pendo.js       Install snippet + identify/track helpers
│       └── auth.js        /api/me → identifyPendoUser → render header
└── README.md
```

## Notes

- The "auth" is a fake in-memory session cookie. Don't ship this anywhere real.
- The frontend is plain HTML + ES6 — no build step, no framework — so changes are instant on refresh.
- For testing SPA-style page tracking instead of full reloads, replace the `<a href>` navigation with client-side routing and call `pendo.pageLoad()` on each route change.
