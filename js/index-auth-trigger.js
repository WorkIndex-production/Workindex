// Split from index.html inline script 5.
// Auto-open auth page if ?signup=true in URL
(function() {
  if (window.location.search.indexOf('signup=true') !== -1) {
    // Wait for app.js to load then show auth
    window.addEventListener('load', function() {
      setTimeout(function() {
        if (typeof showPage === 'function') {
          showPage('auth');
          if (typeof switchAuthMode === 'function') switchAuthMode('signup');
        }
      }, 100);
    });
  }
})();
