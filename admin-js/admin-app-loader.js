(function loadAdminAppChunks(){
  var chunks = [
    '/admin-js/01-admin-core-auth.js',
    '/admin-js/02-admin-dashboard-users.js',
    '/admin-js/03-admin-activity-support.js',
    '/admin-js/04-admin-actions-heatmap-kyc.js',
    '/admin-js/05-admin-reports-settings-revenue.js',
    '/admin-js/06-admin-seo-service-categories.js'
  ];

  Promise.all(chunks.map(function(path) {
    return fetch(path).then(function(res) {
      if (!res.ok) throw new Error('Failed to load ' + path);
      return res.text();
    });
  })).then(function(parts) {
    var source = parts.join('\n\n//# sourceURL=admin-app-chunks.js\n\n');
    (0, eval)(source);
  }).catch(function(error) {
    console.error('Admin app failed to load:', error);
    var toast = document.getElementById('toast');
    if (toast) toast.textContent = 'Admin app failed to load';
  });
})();
