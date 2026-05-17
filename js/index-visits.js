// Split from index.html inline script 4.
(function() {
  const visitsApiBase = 'https://workindex-production.up.railway.app/api';
  let sessionId = sessionStorage.getItem('wi_session');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('wi_session', sessionId);
    const params = new URLSearchParams(window.location.search || '');
    fetch(visitsApiBase + '/visits/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        sessionId: sessionId,
        referrer: document.referrer || '',
        source: params.get('utm_source') || params.get('source') || params.get('ref') || '',
        medium: params.get('utm_medium') || ''
      })
    }).catch(() => {});
  }
})();
