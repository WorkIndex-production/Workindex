// Split from index.html inline script 1.
function switchCityTab(service) {
    ['itr','gst','accounting','development'].forEach(function(s) {
      var grid = document.getElementById('cityGrid_' + s);
      var tab  = document.getElementById('cityTab_' + s);
      if (!grid || !tab) return;
      var isActive = s === service;
      grid.style.display = isActive ? 'block' : 'none';
      tab.style.background   = isActive ? 'var(--primary)' : 'transparent';
      tab.style.color        = isActive ? '#fff' : 'var(--text)';
      tab.style.borderColor  = isActive ? 'var(--primary)' : 'var(--border)';
    });
  }
