/**
 * Auth helpers used on every authenticated page.
 *
 * On load:
 *   - Hits /api/me. If 401, redirect to /. Otherwise calls
 *     identifyPendoUser() so subsequent events are attributed.
 *   - Wires up #logout-button if present.
 *   - Renders user info into [data-user-name] / [data-user-email] /
 *     [data-account-name] elements anywhere on the page.
 */

(async function () {
  try {
    const res = await fetch('/api/me');
    if (res.status === 401) {
      window.location.href = '/';
      return;
    }
    const { visitor, account } = await res.json();

    if (typeof window.identifyPendoUser === 'function') {
      window.identifyPendoUser(visitor, account);
    }

    document
      .querySelectorAll('[data-user-name]')
      .forEach((el) => (el.textContent = visitor.full_name));
    document
      .querySelectorAll('[data-user-email]')
      .forEach((el) => (el.textContent = visitor.email));
    document
      .querySelectorAll('[data-user-role]')
      .forEach((el) => (el.textContent = visitor.role));
    document
      .querySelectorAll('[data-account-name]')
      .forEach((el) => (el.textContent = account.name));
    document
      .querySelectorAll('[data-account-plan]')
      .forEach((el) => (el.textContent = account.planLevel));
  } catch (err) {
    console.error('Auth check failed', err);
  }

  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    });
  }
})();
