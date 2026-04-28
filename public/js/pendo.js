/**
 * Pendo install + identify helper.
 *
 * 1. Drop your Pendo API key into PENDO_API_KEY below. You'll find this
 *    in your Pendo subscription settings at https://novus.pendo.io/.
 *    Subscription Settings → Install Settings → API Key.
 *
 * 2. The install snippet below is Pendo's standard agent loader. It
 *    queues calls before pendo.js finishes downloading, so it's safe
 *    to call pendo.initialize / identify / track immediately.
 *
 * 3. After login, call `identifyPendoUser(visitor, account)` to bind
 *    the session to a real visitor and account. Before login (e.g. on
 *    the public landing page) we initialize anonymously.
 */

window.PENDO_API_KEY = 'YOUR_PENDO_API_KEY_HERE';

// --- Pendo install snippet (do not modify) --------------------------------
(function (apiKey) {
  (function (p, e, n, d, o) {
    var v, w, x, y, z;
    o = p[d] = p[d] || {};
    o._q = o._q || [];
    v = ['initialize', 'identify', 'updateOptions', 'pageLoad', 'track'];
    for (w = 0, x = v.length; w < x; ++w)
      (function (m) {
        o[m] =
          o[m] ||
          function () {
            o._q[m === v[0] ? 'unshift' : 'push'](
              [m].concat([].slice.call(arguments, 0))
            );
          };
      })(v[w]);
    y = e.createElement(n);
    y.async = !0;
    y.src = 'https://cdn.pendo.io/agent/static/' + apiKey + '/pendo.js';
    z = e.getElementsByTagName(n)[0];
    z.parentNode.insertBefore(y, z);
  })(window, document, 'script', 'pendo');
})(window.PENDO_API_KEY);
// --------------------------------------------------------------------------

/**
 * Initialize Pendo with a known visitor + account. Safe to call on any
 * page after the user is authenticated.
 */
window.identifyPendoUser = function identifyPendoUser(visitor, account) {
  if (!window.pendo) return;
  window.pendo.initialize({
    visitor: {
      id: visitor.id,
      email: visitor.email,
      full_name: visitor.full_name,
      role: visitor.role,
    },
    account: {
      id: account.id,
      name: account.name,
      planLevel: account.planLevel,
    },
  });
  console.log('[pendo] identified', visitor.id, 'in account', account.id);
};

/**
 * Initialize Pendo anonymously (for the login / landing page). Visitor
 * and account ids must still be set so Pendo will record events.
 */
window.initAnonymousPendo = function initAnonymousPendo() {
  if (!window.pendo) return;
  window.pendo.initialize({
    visitor: { id: 'VISITOR_UNIQUE_ID' }, // anonymous
    account: { id: 'ACCOUNT_UNIQUE_ID' },
  });
};

/**
 * Convenience wrapper for custom events. Pendo auto-tracks clicks and
 * page loads, so you only need this for things you can't pin to a DOM
 * element (form submissions, async results, etc.).
 */
window.trackPendoEvent = function trackPendoEvent(name, properties = {}) {
  if (!window.pendo || typeof window.pendo.track !== 'function') return;
  window.pendo.track(name, properties);
  console.log('[pendo] track', name, properties);
};
