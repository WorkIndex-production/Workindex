const ADMIN_PARTIALS = [
  '/admin-partials/00-admin-login.html',
  '/admin-partials/01-admin-layout.html',
  '/admin-partials/02-admin-sections-main.html',
  '/admin-partials/03-admin-sections-tools.html',
  '/admin-partials/04-admin-actions-drawers.html',
  '/admin-partials/05-admin-modals.html'
];
const ADMIN_ASSET_VERSION = '20260517-inactivity-session-1';

async function loadAdminPartials() {
  const root = document.getElementById('admin-root');
  if (!root) throw new Error('Missing admin-root container');

  const html = await Promise.all(ADMIN_PARTIALS.map(async path => {
    const res = await fetch(path + '?v=' + ADMIN_ASSET_VERSION);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.text();
  }));

  root.innerHTML = html.join('\n');

  const script = document.createElement('script');
  script.src = '/admin-js/admin-app-loader.js?v=' + ADMIN_ASSET_VERSION;
  script.defer = true;
  document.body.appendChild(script);
}

loadAdminPartials().catch(error => {
  console.error('Admin bootstrap failed:', error);
  document.body.innerHTML = '<div style="padding:32px;color:#fff;background:#111;font-family:Arial,sans-serif">Admin console failed to load. Check the browser console.</div>';
});
