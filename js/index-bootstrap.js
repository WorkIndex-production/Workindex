// Loads the split index.html partials and then preserves the old script order.
(async function bootstrapWorkIndex() {
  const root = document.getElementById('workindex-root');
  const partials = [
  "00-intro.html",
  "01-landing.html",
  "02-find-professionals.html",
  "03-how-it-works.html",
  "04-pricing.html",
  "05-settings.html",
  "06-auth.html",
  "07-request-confirmation.html",
  "08-questionnaire.html",
  "09-client-dashboard.html",
  "10-expert-dashboard.html",
  "11-core-modals.html",
  "12-my-tickets.html",
  "13-account-modals.html",
  "14-terms-modal.html",
  "15-credits-history.html",
  "16-approach-modal.html"
];
  const html = await Promise.all(partials.map(async (name) => {
    const response = await fetch('/partials/' + name);
    if (!response.ok) throw new Error('Failed to load partial: ' + name);
    return response.text();
  }));
  root.innerHTML = html.join('\n');

  const scripts = [
    '/js/index-city-tabs.js',
    '/js/index-questionnaire.js',
    '/js/index-auth-explore.js',
    '/js/index-visits.js',
    '/js/index-auth-trigger.js',
    '/js/index-google-auth.js',
    '/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js',
    '/services-config.js',
    'https://checkout.razorpay.com/v1/checkout.js',
    '/js/01-core.js',
    '/js/02-documents-access.js',
    '/js/03-ratings-notifications.js',
    '/js/04-find-experts.js',
    '/js/05-dashboard-requests.js',
    '/js/06-approaches-settings.js',
    '/js/07-chat-search-support.js',
    '/js/08-pagination-onboarding.js'
  ];

  const assetVersion = '20260517-inactivity-session-1';
  for (const src of scripts) {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src.startsWith('/') && !src.startsWith('/cdn-cgi/')
        ? src + (src.includes('?') ? '&' : '?') + 'v=' + assetVersion
        : src;
      script.onload = resolve;
      script.onerror = resolve;
      document.body.appendChild(script);
    });
  }

  if (document.readyState !== 'loading') {
    document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
  }
  window.dispatchEvent(new Event('workindex:ready'));
})().catch((error) => {
  console.error('WorkIndex bootstrap failed:', error);
  const root = document.getElementById('workindex-root');
  if (root) {
    root.innerHTML = '<div style="padding:24px;font-family:sans-serif;color:#b91c1c;">Failed to load WorkIndex. Check the browser console.</div>';
  }
});
