// Split from app.js lines 1839-3518. app.js is kept as the untouched fallback.
// ─── UTILITY FUNCTIONS ─── 
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
// ─── PROFILE DROPDOWN ───
function toggleProfileDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const isOpen = dropdown.style.display === 'block';

  // Close all dropdowns first
  document.querySelectorAll('#clientProfileDropdown, #expertProfileDropdown').forEach(d => {
    d.style.display = 'none';
  });

  if (!isOpen) {
    // Populate name/email before showing
    if (state.user) {
      const nameEl  = document.getElementById(dropdownId === 'clientProfileDropdown' ? 'clientDropdownName' : 'expertDropdownName');
      const emailEl = document.getElementById(dropdownId === 'clientProfileDropdown' ? 'clientDropdownEmail' : 'expertDropdownEmail');
      if (nameEl)  nameEl.textContent  = state.user.name  || 'My Account';
      if (emailEl) emailEl.textContent = state.user.email || '';
    }

    // Sync dark mode toggle state
    const isDark = localStorage.getItem('darkMode') === 'true';
    const toggle = document.getElementById(dropdownId === 'clientProfileDropdown' ? 'darkModeToggle' : 'darkModeToggle2');
    if (toggle) toggle.checked = isDark;

    dropdown.style.display = 'block';

    // Close when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 10);
  }
}

// ─── LOAD CLIENT DATA ─── 
async function loadClientData() {
  // Load client requests
  try {
    const res = await fetch(`${API_URL}/requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      state.requests = data.requests || [];
      renderClientRequests();
      
      // Update profile info
      updateClientProfile();
    }
  } catch (error) {
    console.error('Load client data error:', error);
  }
  
  switchTab('requests');
}

// ─── RENDER CLIENT REQUESTS ───
function renderClientRequests() {
  const container = document.getElementById('requestsList');
  if (!container) return;

  const allRequests = state.requests || [];

  // ── Stat hero ──
  const active    = allRequests.filter(r => r.status === 'active' || r.status === 'pending').length;
  const totalAppr = allRequests.reduce(function(sum, r) { return sum + (r.currentApproaches || r.approachCount || 0); }, 0);
  const completed = allRequests.filter(r => r.status === 'completed').length;

  var existingHero = document.getElementById('clientStatHero');
  if (!existingHero) {
    var hero = document.createElement('div');
    hero.id = 'clientStatHero';
    hero.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;';
    var stats = [
      { label: 'Active',    value: active,    color: '#FC8019', icon: '📋' },
      { label: 'Proposals', value: totalAppr, color: '#3b82f6', icon: '📨' },
      { label: 'Completed', value: completed, color: '#22c55e', icon: '✅' }
    ];
    hero.innerHTML = stats.map(function(s) {
      return '<div style="background:var(--bg);border:1.5px solid var(--border);border-radius:14px;padding:14px 12px;text-align:center;cursor:pointer;transition:all 0.2s;"' +
        ' onmouseover="this.style.borderColor=\'' + s.color + '\';this.style.transform=\'translateY(-2px)\'"' +
        ' onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'translateY(0)\'">' +
        '<div style="font-size:20px;margin-bottom:4px;">' + s.icon + '</div>' +
        '<div style="font-size:22px;font-weight:800;color:' + s.color + ';line-height:1;">' + s.value + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">' + s.label + '</div>' +
        '</div>';
    }).join('');
    container.parentNode.insertBefore(hero, container);
  } else {
    var vals = existingHero.querySelectorAll('[style*="font-size:22px"]');
    if (vals[0]) vals[0].textContent = active;
    if (vals[1]) vals[1].textContent = totalAppr;
    if (vals[2]) vals[2].textContent = completed;
  }

  // ── Filter bar (always render, even if empty) ──
  var currentFilter = (state.requestFilter || 'all');
  var filterDefs = [
    { key: 'all',       label: 'All',       icon: '📋' },
    { key: 'pending',   label: 'Pending',   icon: '⏳' },
    { key: 'active',    label: 'Active',    icon: '🟢' },
    { key: 'completed', label: 'Completed', icon: '✅' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' }
  ];
  var existingFilterBar = document.getElementById('requestFilterBar');
  if (!existingFilterBar) {
    var filterBar = document.createElement('div');
    filterBar.id = 'requestFilterBar';
    filterBar.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;';
    container.parentNode.insertBefore(filterBar, container);
  }
  document.getElementById('requestFilterBar').innerHTML = filterDefs.map(function(f) {
    var isActive = f.key === currentFilter;
    return '<button onclick="state.requestFilter=\'' + f.key + '\';renderClientRequests();" style="' +
      'padding:7px 16px;border-radius:20px;border:1.5px solid ' + (isActive ? 'var(--primary)' : 'var(--border)') + ';' +
      'background:' + (isActive ? 'var(--primary)' : 'var(--bg)') + ';' +
      'color:' + (isActive ? '#fff' : 'var(--text-muted)') + ';' +
      'font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;white-space:nowrap;">' +
      f.icon + ' ' + f.label + '</button>';
  }).join('');

  // ── Apply filter ──
  var filteredRequests = currentFilter === 'all'
    ? allRequests
    : currentFilter === 'active'
      ? allRequests.filter(function(r) { return r.status === 'active' || r.status === 'pending'; })
      : allRequests.filter(function(r) { return r.status === currentFilter; });

  if (!allRequests.length) {
    container.innerHTML = '<div style="text-align:center;padding:48px 20px;">' +
      '<svg width="80" height="80" viewBox="0 0 80 80" fill="none" style="margin-bottom:16px;opacity:0.5;">' +
      '<rect x="12" y="16" width="56" height="48" rx="8" stroke="#FC8019" stroke-width="2.5" fill="none"/>' +
      '<line x1="24" y1="32" x2="56" y2="32" stroke="#FC8019" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="24" y1="42" x2="48" y2="42" stroke="#FC8019" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="24" y1="52" x2="40" y2="52" stroke="#FC8019" stroke-width="2" stroke-linecap="round"/>' +
      '</svg>' +
      '<h3 style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px;">No requests yet</h3>' +
      '<p style="font-size:14px;color:var(--text-muted);line-height:1.6;max-width:240px;margin:0 auto 20px;">Post your first request and get proposals from verified professionals within hours.</p>' +
      '<button onclick="document.getElementById(\'newRequestBtn\')?.click()" style="padding:12px 28px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">+ Post a Request</button>' +
      '</div>';
    return;
  }
 if (!filteredRequests.length) {
    container.innerHTML = '<div style="text-align:center;padding:48px 20px;color:var(--text-muted);font-size:14px;">' +
      'No <strong>' + currentFilter + '</strong> requests found.</div>';
    return;
  }
  var svcColors = { itr:'#8b5cf6', gst:'#3b82f6', accounting:'#10b981', audit:'#f59e0b', photography:'#ec4899', development:'#06b6d4' };
  var stMap = {
    pending:   { label:'Pending',   color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  icon:'⏳' },
    active:    { label:'Active',    color:'#FC8019', bg:'rgba(252,128,25,0.1)',  icon:'🟢' },
    completed: { label:'Completed', color:'#22c55e', bg:'rgba(34,197,94,0.1)',   icon:'✅' },
    cancelled: { label:'Cancelled', color:'#ef4444', bg:'rgba(239,68,68,0.1)',   icon:'❌' }
  };

  var items = paginate(filteredRequests, 'clientRequests');

  container.innerHTML = items.map(function(req) {
    var st = stMap[req.status] || stMap.pending;
    var svcColor = svcColors[req.service] || '#FC8019';
    var apprCount = req.currentApproaches || req.approachCount || 0;
    var ago = '';
    if (req.createdAt) {
      var diff = Date.now() - new Date(req.createdAt).getTime();
      var hrs  = Math.floor(diff / 3600000);
      var days = Math.floor(diff / 86400000);
      if (hrs < 1)       ago = 'just now';
      else if (hrs < 24) ago = hrs + 'h ago';
      else if (days ===1)ago = 'Yesterday';
      else               ago = days + 'd ago';
    }

    return '<div style="background:var(--bg);border:1.5px solid var(--border);border-left:4px solid ' + st.color + ';border-radius:16px;overflow:hidden;margin-bottom:12px;transition:all 0.2s;cursor:pointer;"' +
      ' onclick="showRequestDetail(\'' + req._id + '\')"' +
      ' onmouseover="this.style.boxShadow=\'0 8px 24px rgba(0,0,0,0.08)\';this.style.transform=\'translateY(-2px)\'"' +
      ' onmouseout="this.style.boxShadow=\'none\';this.style.transform=\'translateY(0)\'">' +

      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--bg-gray);border-bottom:1px solid var(--border);flex-wrap:wrap;gap:6px;">' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:' + svcColor + '18;color:' + svcColor + ';text-transform:uppercase;letter-spacing:.04em;">' + req.service + '</span>' +
          '<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:' + st.bg + ';color:' + st.color + ';">' + st.icon + ' ' + st.label + '</span>' +
        '</div>' +
        (ago ? '<span style="font-size:11px;color:var(--text-muted);">🕐 ' + ago + '</span>' : '') +
      '</div>' +

      '<div style="padding:16px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;">' +
          '<div style="flex:1;">' +
            '<h3 style="font-size:17px;font-weight:800;color:var(--text);margin-bottom:6px;line-height:1.25;">' + req.title + '</h3>' +
            '<div style="display:flex;flex-wrap:wrap;gap:8px;">' +
              (req.location ? '<span style="font-size:12px;color:var(--text-muted);">📍 ' + req.location + '</span>' : '') +
              (req.timeline ? '<span style="font-size:12px;color:var(--text-muted);">⏱ ' + req.timeline + '</span>' : '') +
              '<span style="font-size:12px;color:var(--text-muted);">👁 ' + (req.viewCount || 0) + ' views</span>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right;flex-shrink:0;background:rgba(252,128,25,0.06);border:1.5px solid rgba(252,128,25,0.2);border-radius:12px;padding:8px 12px;">' +
            '<div style="font-size:18px;font-weight:800;color:var(--primary);line-height:1;">₹' + (req.budget ? Number(req.budget).toLocaleString('en-IN') : '—') + '</div>' +
            '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;font-weight:600;text-transform:uppercase;">Budget</div>' +
          '</div>' +
        '</div>' +

        '<p style="font-size:13px;color:var(--text-light);line-height:1.6;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + (req.description || '') + '</p>' +

        (apprCount > 0
          ? '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(252,128,25,0.06);border-radius:10px;border:1px solid rgba(252,128,25,0.15);">' +
              '<span style="font-size:13px;font-weight:600;color:var(--primary);">📨 ' + apprCount + ' proposal' + (apprCount > 1 ? 's' : '') + ' received</span>' +
              '<span style="font-size:12px;color:var(--primary);font-weight:700;">Review →</span>' +
            '</div>'
          : '<div style="padding:10px 12px;background:var(--bg-gray);border-radius:10px;">' +
              '<span style="font-size:13px;color:var(--text-muted);">⏳ Waiting for professionals to respond</span>' +
            '</div>') +
      '</div>' +
    '</div>';
  }).join('') + paginationControlsHTML(filteredRequests, 'clientRequests');
}

// ─── UPDATE CLIENT PROFILE ───
function updateClientProfile() {
  const user = state.user;
  if (!user) return;
  
  // Update avatar
  const avatar = document.getElementById('clientAvatar');
  if (avatar) {
    if (user.profilePhoto) {
      avatar.innerHTML = `<img src="${user.profilePhoto}" alt="${user.name}">`;
    } else {
      avatar.textContent = user.name.substring(0, 1).toUpperCase();
    }
  }
  
  // Update profile tab
  const profileAvatar = document.getElementById('profileAvatar');
  if (profileAvatar) {
    if (user.profilePhoto) {
      profileAvatar.innerHTML = `<img src="${user.profilePhoto}" alt="${user.name}">`;
    } else {
      profileAvatar.textContent = user.name.substring(0, 1).toUpperCase();
    }
  }
  
  const profileName = document.getElementById('profileName');
  if (profileName) profileName.textContent = user.name;
  
  const profileEmail = document.getElementById('profileEmail');
  if (profileEmail) profileEmail.textContent = user.email;
  
  const profilePhone = document.getElementById('profilePhone');
  if (profilePhone) profilePhone.textContent = user.phone || 'Not provided';
}

// ─── LOAD EXPERT DATA ─── 
async function loadExpertData() {
  // FIRST: Fetch fresh user data with profile
  try {
    const userRes = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const userData = await userRes.json();
    if (userData.success) {
      state.user = userData.user;
      localStorage.setItem('user', JSON.stringify(userData.user));
      renderExpertProfile();  // ✅ MOVE HERE — right after fresh data is loaded
    }
  } catch (error) {
    console.error('Load user data error:', error);
  }

  await refreshExpertDashboardStats();
  
  // Cancel any previous browse fetch
  if (browseAbortController) browseAbortController.abort();
  browseAbortController = new AbortController();

  // Load available requests for experts
  try {
    const browseParams = new URLSearchParams();
    if (state.browseServiceFilter?.length === 1) browseParams.set('service', state.browseServiceFilter[0]);
    if (state.browseSearch) browseParams.set('search', state.browseSearch);
    if (state.browseSort) browseParams.set('sort', state.browseSort);
    const res = await fetch(`${API_URL}/requests/available?${browseParams}`, {
      signal: browseAbortController.signal,
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      state.availableRequests = data.requests || [];
      renderAvailableRequests();
      updateExpertProfile();
      loadExpertCredits();
      // ✅ REMOVE renderExpertProfile() from here
    }
  } catch (error) {
    if (error.name === 'AbortError') return; // navigation cancelled this — ignore
    console.error('Load expert data error:', error);
  }
  
  switchTab('browse');
}

async function refreshExpertDashboardStats() {
  if (!state.token || !state.user) return;

  try {
    const [approachesRes, ratingsRes] = await Promise.all([
      fetch(`${API_URL}/approaches`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      }),
      fetch(`${API_URL}/ratings/received`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      })
    ]);

    if (approachesRes.ok) {
      const approachesData = await approachesRes.json();
      if (approachesData.success) {
        state.myApproaches = approachesData.approaches || [];
        state.user.totalApproaches = state.myApproaches.length;
      }
    }

    if (ratingsRes.ok) {
      const ratingsData = await ratingsRes.json();
      if (ratingsData.success) {
        const ratings = ratingsData.ratings || [];
        state.ratings = ratings;
        state.user.reviewCount = ratings.length;
        state.user.rating = ratings.length
          ? ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratings.length
          : 0;
      }
    }

    localStorage.setItem('user', JSON.stringify(state.user));
  } catch (error) {
    console.error('Refresh expert stats error:', error);
  }
}
// ─── BROWSE FILTER CHIPS RENDERER ───
function renderBrowseFilterChips() {
  const services = [
    { value: 'all', label: 'All' },
    ...WI_SERVICES.list.map(s => ({ value: s.value, label: s.icon + ' ' + s.label }))
  ];
  const activeFilter = state.browseServiceFilter || [];
  return services.map(s => {
    const isActive = s.value === 'all' ? activeFilter.length === 0 : activeFilter.includes(s.value);
    return `<button class="browse-filter-chip" data-service="${s.value}" onclick="setBrowseFilter('${s.value}')"
      style="padding:7px 16px;border:1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'};border-radius:20px;
             background:${isActive ? 'var(--primary)' : 'transparent'};color:${isActive ? '#fff' : 'var(--text)'};
             font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s;">
      ${s.label}
    </button>`;
  }).join('');
}

async function applyBrowseFilters() {
  PAGINATION.expertBrowse.page = 1;
  await loadExpertData();
}

function renderBrowseToolbar() {
  const sortOpts = [
    { value: 'newest',    label: 'Newest First' },
    { value: 'oldest',    label: 'Oldest First' },
    { value: 'budget_h',  label: 'Budget: High → Low' },
    { value: 'budget_l',  label: 'Budget: Low → High' },
    { value: 'credits_h', label: 'Credits: High → Low' },
  ];

  const responseOpts = [
    { value: '',          label: 'All Responses' },
    { value: '0',         label: '0 Responses (Fresh)' },
    { value: 'lt2',       label: 'Less than 2' },
    { value: 'lt3',       label: 'Less than 3' },
  ];

  const dateOpts = [
    { value: '',       label: 'Any Time' },
    { value: 'today',  label: 'Posted Today' },
    { value: 'week',   label: 'This Week' },
    { value: 'month',  label: 'This Month' },
  ];

  const curSort     = state.browseSort     || 'newest';
  const curResponse = state.browseResponse || '';
  const curDate     = state.browseDate     || '';
  const hasSearch   = state.browseSearch && state.browseSearch.trim();
  const hasFilters  = hasSearch || curResponse || curDate;

  return `
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">
      <!-- Search input -->
      <div style="flex:1;min-width:180px;position:relative;">
        <input id="browseSearchInput" type="text" placeholder="🔍 Search requests..."
          value="${state.browseSearch || ''}"
          onkeydown="if(event.key==='Enter'){state.browseSearch=this.value.trim();applyBrowseFilters();}"
          style="width:100%;padding:9px 38px 9px 14px;border:1.5px solid var(--border);border-radius:10px;
                 background:var(--bg);color:var(--text);font-size:14px;box-sizing:border-box;">
        <button onclick="state.browseSearch=document.getElementById('browseSearchInput').value.trim();applyBrowseFilters();"
          style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;
                 color:var(--primary);font-size:16px;cursor:pointer;padding:4px;">→</button>
      </div>

      <!-- Sort -->
      <select onchange="state.browseSort=this.value;applyBrowseFilters();"
        style="padding:9px 14px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg);
               color:var(--text);font-size:13px;font-weight:600;cursor:pointer;">
        ${sortOpts.map(o => `<option value="${o.value}" ${curSort === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select>

      <!-- Response filter -->
      <select onchange="state.browseResponse=this.value;applyBrowseFilters();"
        style="padding:9px 14px;border:1.5px solid ${curResponse ? 'var(--primary)' : 'var(--border)'};
               border-radius:10px;background:var(--bg);color:${curResponse ? 'var(--primary)' : 'var(--text)'};
               font-size:13px;font-weight:600;cursor:pointer;">
        ${responseOpts.map(o => `<option value="${o.value}" ${curResponse === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select>

      <!-- Date filter -->
      <select onchange="state.browseDate=this.value;applyBrowseFilters();"
        style="padding:9px 14px;border:1.5px solid ${curDate ? 'var(--primary)' : 'var(--border)'};
               border-radius:10px;background:var(--bg);color:${curDate ? 'var(--primary)' : 'var(--text)'};
               font-size:13px;font-weight:600;cursor:pointer;">
        ${dateOpts.map(o => `<option value="${o.value}" ${curDate === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select>

      <!-- Clear all -->
      ${hasFilters ? `
        <button onclick="state.browseSearch='';state.browseResponse='';state.browseDate='';
                         state.browseServiceFilter=[];
                         document.getElementById('browseSearchInput').value='';
                         applyBrowseFilters();"
          style="padding:9px 14px;border:1.5px solid var(--border);border-radius:10px;background:transparent;
                 color:var(--text-muted);font-size:13px;cursor:pointer;white-space:nowrap;">✕ Clear</button>
      ` : ''}
    </div>`;
}

// ─── RENDER AVAILABLE REQUESTS FOR EXPERTS ───
function renderAvailableRequests() {
  const filterBar = document.getElementById('browseFilterBar');
  if (filterBar) filterBar.innerHTML = renderBrowseFilterChips();

  const container = document.getElementById('browseRequestsContainer');
  if (!container) return;

  // ── Expert stat hero (inject once, refresh credits on re-render) ──
  const existingHero = document.getElementById('expertStatHero');
  if (!existingHero && state.user) {
    const u = state.user;
    const approachCount = (state.myApproaches || []).length;
    const ratingCount = Number(u.reviewCount || 0);
    const ratingValue = ratingCount > 0 ? Number(u.rating || 0).toFixed(1) : '0.0';
    const hero = document.createElement('div');
    hero.id = 'expertStatHero';
    hero.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;';
    const stats = [
      { label: 'Credits',   value: u.credits || 0, color: '#FC8019', icon: 'Credits', action: 'openCreditModal()' },
      { label: 'Approaches',value: approachCount,  color: '#3b82f6', icon: 'Approaches', action: "switchTab('approaches')" },
      { label: 'Rating',    value: ratingValue,    color: '#f59e0b', icon: 'Rating', action: "switchTab('ratings')" }
    ];
    hero.innerHTML = stats.map(s =>
      `<div onclick="${s.action}"
        style="background:var(--bg);border:1.5px solid var(--border);border-radius:14px;padding:14px 12px;text-align:center;cursor:pointer;transition:all 0.2s;"
        onmouseover="this.style.borderColor='${s.color}';this.style.transform='translateY(-2px)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.transform='translateY(0)'">
        <div style="font-size:20px;margin-bottom:4px;">${s.icon}</div>
        <div style="font-size:22px;font-weight:800;color:${s.color};line-height:1;">${s.value}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">${s.label}</div>
      </div>`
    ).join('');
    container.parentNode.insertBefore(hero, container);
  } else if (existingHero && state.user) {
    const vals = existingHero.querySelectorAll('[style*="font-size:22px"]');
    if (vals[0]) vals[0].textContent = state.user.credits || 0;
    if (vals[1]) vals[1].textContent = (state.myApproaches || []).length;
    if (vals[2]) vals[2].textContent = Number(state.user.reviewCount || 0) > 0 ? Number(state.user.rating || 0).toFixed(1) : '0.0';
  }

  // Filtering/sorting/search now done server-side
   let allRequests = state.availableRequests || [];

// Client-side response count filter
const rFilter = state.browseResponse || '';
if (rFilter === '0') {
  allRequests = allRequests.filter(r => (r.currentApproaches || 0) === 0);
} else if (rFilter === 'lt2') {
  allRequests = allRequests.filter(r => (r.currentApproaches || 0) < 2);
} else if (rFilter === 'lt3') {
  allRequests = allRequests.filter(r => (r.currentApproaches || 0) < 3);
}

// Client-side date filter
const dFilter = state.browseDate || '';
if (dFilter) {
  const now = Date.now();
  const cutoffs = { today: 86400000, week: 7 * 86400000, month: 30 * 86400000 };
  const cutoff = cutoffs[dFilter];
  if (cutoff) {
    allRequests = allRequests.filter(r => r.createdAt && (now - new Date(r.createdAt).getTime()) <= cutoff);
  }
}
   
  if (!allRequests.length) {
    const isFiltered = (state.browseServiceFilter || []).length > 0 || state.browseSearch || state.browseResponse || state.browseDate;
    container.innerHTML = `
      <h2 style="margin-bottom:16px;">Available Requests</h2>
      ${renderBrowseToolbar()}
      <div style="text-align:center;padding:48px 20px;">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" style="margin-bottom:20px;opacity:0.6;">
          <circle cx="100" cy="100" r="100" fill="rgba(252,128,25,0.06)"/>
          <circle cx="42" cy="42" r="22" stroke="#FC8019" stroke-width="3" fill="none"/>
          <line x1="58" y1="58" x2="76" y2="76" stroke="#FC8019" stroke-width="3" stroke-linecap="round"/>
          <circle cx="42" cy="42" r="10" fill="rgba(252,128,25,0.12)"/>
        </svg>
        <h3 style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px;">${isFiltered ? 'No matches found' : 'No requests yet'}</h3>
        <p style="font-size:14px;color:var(--text-muted);line-height:1.6;max-width:260px;margin:0 auto 20px;">${isFiltered ? 'Try clearing your filters or searching something broader.' : 'New client requests will appear here. Check back soon!'}</p>
        ${isFiltered ? `<button onclick="state.browseSearch='';state.browseResponse='';state.browseDate='';state.browseServiceFilter=[];state.browseSort='newest';document.getElementById('browseFilterBar').innerHTML=renderBrowseFilterChips();applyBrowseFilters();"          style="padding:10px 24px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">
          ✕ Clear Filters
        </button>` : ''}
      </div>`;
    return;
  }

  const items = paginate(allRequests, 'expertBrowse');

  container.innerHTML = '<h2 style="margin-bottom:16px;font-size:20px;font-weight:800;letter-spacing:-0.3px;">Available Requests</h2>' +
    renderBrowseToolbar() +
    '<div class="req-grid">' +
    items.map(req => {
      const cur  = req.currentApproaches || 0;
      const max  = req.maxApproaches || 5;
      const pct  = (cur / max) * 100;
      const left = max - cur;
      const col  = cur >= 4 ? '#ef4444' : cur >= 3 ? '#f59e0b' : 'var(--primary)';

      // Time posted
      const postedAgo = (() => {
        if (!req.createdAt) return 'Recently';
        const diff = Date.now() - new Date(req.createdAt).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs  = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 60) return mins + 'm ago';
        if (hrs < 24)  return hrs + 'h ago';
        return days + 'd ago';
      })();

      // Urgency
      const urgencyMap = {
        immediate: { label: '🔴 Urgent',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
        '2-3days':  { label: '🟠 2-3 Days',   color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
        week:       { label: '🟡 This Week',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
        month:      { label: '🟢 This Month', color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
        flexible:   { label: '🔵 Flexible',   color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
      };
      const urgencyKey = (req.answers && req.answers.urgency) || req.timeline || 'flexible';
      const urgency = urgencyMap[urgencyKey] || urgencyMap.flexible;

      // Service color
      const svcColors = WI_SERVICES.colors;
      const svcColor = svcColors[req.service] || '#FC8019';

      // Answer tags — show relevant questionnaire answers as pills
       const answerTags = [];
      const a = req.answers || {};
      Object.entries(WI_SERVICES.answerTagFormatters).forEach(([key, fn]) => {
        if (a[key] !== undefined && a[key] !== null && a[key] !== '') {
          try { answerTags.push(fn(a[key])); } catch(e) {}
        }
      });
       
      // Location from answers
      const location = (() => {
        const fullAddress = a.full_address || a.fullAddress;
        const clientLocation = a.client_location || a.clientLocation;
        if (fullAddress && fullAddress.city) return fullAddress.city + (fullAddress.state ? ', ' + fullAddress.state : '');
        if (clientLocation && clientLocation.city) return clientLocation.city;
        return req.location || 'Online';
      })();

      // Service location type
      const locType = a.service_location_type || a.serviceLocationType || '';
      const locLabel = locType === 'my-location' ? '🏠 At client' : locType === 'professional-office' ? '🏢 At office' : '💻 Online';

      return `
        <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:18px;overflow:hidden;transition:all 0.2s;margin-bottom:0;"
          onmouseover="this.style.borderColor='rgba(252,128,25,0.5)';this.style.transform='translateY(-3px)';this.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)'"
          onmouseout="this.style.borderColor='var(--border)';this.style.transform='translateY(0)';this.style.boxShadow='none'">

          <!-- TOP STRIP: service + urgency + time + credits -->
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--bg-gray);border-bottom:1px solid var(--border);flex-wrap:wrap;gap:6px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${svcColor}18;color:${svcColor};letter-spacing:.04em;text-transform:uppercase;">${req.service}</span>
              <span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:${urgency.bg};color:${urgency.color};">${urgency.label}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11px;color:var(--text-muted);">🕐 ${postedAgo}</span>
              <span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;background:rgba(252,128,25,0.12);color:var(--primary);">💎 ${req.credits || 20} credits</span>
            </div>
          </div>

          <!-- MAIN BODY -->
          <div style="padding:18px;">

            <!-- Title row + budget hero -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;gap:12px;">
              <div style="flex:1;">
                <h3 style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.25;letter-spacing:-0.2px;">${req.title}</h3>
                <!-- Client trust signal -->
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <div style="width:24px;height:24px;border-radius:50%;background:${svcColor};color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${(req.client?.name || 'C').charAt(0).toUpperCase()}</div>
                  <span style="font-size:13px;font-weight:600;color:var(--text);">${req.client?.name || 'Client'}</span>
                  ${req.client?.emailVerified ? '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(34,197,94,0.1);color:#16a34a;border:1px solid rgba(34,197,94,0.2);">✓ Verified</span>' : '<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:var(--bg-gray);color:var(--text-muted);">Unverified</span>'}
                  <span style="font-size:11px;color:var(--text-muted);">· ${location}</span>
                </div>
              </div>
              <!-- Budget hero number -->
              <div style="text-align:right;flex-shrink:0;background:rgba(252,128,25,0.06);border:1.5px solid rgba(252,128,25,0.2);border-radius:12px;padding:10px 14px;">
                <div style="font-size:22px;font-weight:800;color:var(--primary);line-height:1;">₹${req.budget ? Number(req.budget).toLocaleString('en-IN') : '—'}</div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:2px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Budget</div>
              </div>
            </div>

            <!-- Description -->
            <p style="font-size:13.5px;color:var(--text-light);line-height:1.65;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${req.description}</p>

            <!-- Answer tags (scope pills) -->
            ${answerTags.length ? `
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;">
              ${answerTags.map(t => `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;background:var(--bg-gray);color:var(--text-muted);border:1px solid var(--border);">${t}</span>`).join('')}
              <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;background:var(--bg-gray);color:var(--text-muted);border:1px solid var(--border);">${locLabel}</span>
            </div>` : `
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;">
              <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;background:var(--bg-gray);color:var(--text-muted);border:1px solid var(--border);">${locLabel}</span>
              <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;background:var(--bg-gray);color:var(--text-muted);border:1px solid var(--border);">⏱ ${req.timeline || 'Flexible'}</span>
            </div>`}

            <!-- Approaches progress -->
            <div style="margin-bottom:16px;padding:10px 12px;background:var(--bg-gray);border-radius:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:12px;font-weight:600;color:var(--text-muted);">👥 Responses</span>
                <span style="font-size:12px;font-weight:700;color:${col};">${cur}/${max} slots filled</span>
              </div>
              <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${col};border-radius:3px;transition:width 0.4s;"></div>
              </div>
              ${cur >= 4 ? `<div style="font-size:11px;color:#ef4444;font-weight:700;margin-top:5px;">⚠️ Only ${left} spot left — respond now!</div>`
                         : cur === 0 ? `<div style="font-size:11px;color:#22c55e;font-weight:600;margin-top:5px;">✨ Be the first to respond</div>`
                         : `<div style="font-size:11px;color:var(--text-muted);margin-top:5px;">${left} spots remaining</div>`}
            </div>

            <!-- Action buttons -->
            <div style="display:grid;grid-template-columns:1fr 2fr 44px;gap:8px;">
              <button onclick="showExpertRequestDetail('${req._id}')"
                style="padding:12px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;"
                onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'"
                onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">
                View Details
              </button>
              <button onclick="approachClient('${req._id}')"
                style="padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#FC8019,#e87010);color:#fff;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(252,128,25,0.3);transition:all 0.2s;letter-spacing:0.01em;"
                onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 20px rgba(252,128,25,0.42)'"
                onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 14px rgba(252,128,25,0.3)'">
                Approach Client →
              </button>
              <button onclick="reportRequest('${req._id}', '${(req.title||'').replace(/'/g, '')}')"
                style="width:44px;padding:12px 0;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text-muted);font-size:14px;cursor:pointer;transition:all 0.2s;"
                title="Report this request"
                onmouseover="this.style.borderColor='#ef4444';this.style.color='#ef4444';this.style.background='rgba(239,68,68,0.06)'"
                onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)';this.style.background='transparent'">
                🚩
              </button>
            </div>

          </div>
        </div>`;
    }).join('') + '</div>' + paginationControlsHTML(allRequests, 'expertBrowse');
}

// ─── SHOW REQUEST DETAIL FOR EXPERT ───
async function showExpertRequestDetail(requestId) {
  const req = state.availableRequests.find(r => r._id === requestId);
  if (!req) return;
     // Track view
  fetch(`${API_URL}/requests/${requestId}/view`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${state.token}` }
  }).catch(() => {});
  
  // Create modal to show questionnaire details
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  
  const answers = req.answers || {};
  
  // Format answers for display
  let detailsHTML = '<div style="display: flex; flex-direction: column; gap: 16px;">';
  
  Object.entries(answers).forEach(([key, value]) => {
    if (['fullAddress', 'clientLocation', 'serviceLocationType'].includes(key)) return;
    if ((key === 'full_address' || key === 'fullAddress' || key === 'client_location' || key === 'clientLocation') && value && typeof value === 'object') {
      detailsHTML += `
        <div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">${key === 'client_location' || key === 'clientLocation' ? 'Client Location' : 'Address'}</div>
          <div style="font-size: 14px; color: var(--text);">
            ${[value.building, value.area].filter(Boolean).join(', ')}${(value.building || value.area) ? '<br>' : ''}
            ${[value.city, value.state].filter(Boolean).join(', ')}${value.pincode ? ' - ' + value.pincode : ''}
            ${value.landmark ? `<br>Landmark: ${value.landmark}` : ''}
          </div>
        </div>
      `;
    } else if (Array.isArray(value)) {
      detailsHTML += `
        <div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">${formatKey(key)}</div>
          <div style="font-size: 14px; color: var(--text);">${value.join(', ')}</div>
        </div>
      `;
    } else if (value && typeof value === 'object') {
      detailsHTML += `
        <div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">${formatKey(key)}</div>
          <div style="font-size: 14px; color: var(--text); white-space: pre-wrap;">${JSON.stringify(value, null, 2)}</div>
        </div>
      `;
    } else {
      detailsHTML += `
        <div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">${formatKey(key)}</div>
          <div style="font-size: 14px; color: var(--text);">${value}</div>
        </div>
      `;
    }
  });
  
  detailsHTML += '</div>';
  
  modal.innerHTML = `
    <div style="background: var(--bg); border-radius: 16px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="font-size: 20px; font-weight: 700; color: var(--text);">${req.title}</h2>
        <button onclick="this.closest('div').parentElement.remove()" style="padding: 8px; border: none; background: transparent; font-size: 24px; cursor: pointer; color: var(--text-muted);">×</button>
      </div>
      
      <div style="padding: 16px; background: var(--bg-gray); border-radius: 12px; margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">Service</div>
        <div style="font-size: 16px; font-weight: 600; color: var(--primary);">${req.service}</div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 12px;">Client Requirements</h3>
        ${detailsHTML}
      </div>
      
      <div style="padding: 16px; background: rgba(252, 128, 25, 0.1); border: 1px solid var(--primary); border-radius: 12px; margin-bottom: 20px;">
        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">⚠️ Contact details locked</div>
        <div style="font-size: 13px; color: var(--text-light);">Spend ${req.credits || 20} credits to unlock client's phone and email</div>
      </div>
      
      <button onclick="approachClient('${req._id}'); this.closest('div').parentElement.remove();" style="width: 100%; padding: 16px; border: none; border-radius: 12px; background: var(--primary); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;">Approach This Client</button>
    </div>
  `;
  
  document.body.appendChild(modal);
}
// ─── REPORT A REQUEST ───
function reportRequest(requestId, requestTitle) {
  const existing = document.getElementById('reportRequestModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'reportRequestModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:var(--bg);border:1.5px solid #ef4444;border-radius:16px;max-width:420px;width:100%;padding:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <span style="font-size:16px;font-weight:800;color:#ef4444;">🚩 Report Request</span>
        <span onclick="document.getElementById('reportRequestModal').remove()" style="cursor:pointer;font-size:22px;color:var(--text-muted);">×</span>
      </div>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.6;">
        Reporting: <strong style="color:var(--text);">${requestTitle}</strong><br><br>
        If this request appears fake, suspicious or violates platform guidelines, let us know. If 3 or more experts report the same request, the client account will be automatically restricted pending admin review.
      </p>
      <div style="margin-bottom:16px;">
        <label style="font-size:13px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:8px;">Reason</label>
        <select id="reportRequestReason" style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:14px;">
          <option value="fake_request">Fake or test request</option>
          <option value="suspicious_details">Suspicious details / no intent to hire</option>
          <option value="already_contacted">Client already contacted me off-platform</option>
          <option value="spam">Spam or duplicate post</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div style="margin-bottom:20px;">
        <label style="font-size:13px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:8px;">Additional details <span style="font-weight:400;">(optional)</span></label>
        <textarea id="reportRequestNote" rows="3" placeholder="Describe what seems suspicious..." style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:14px;resize:none;box-sizing:border-box;"></textarea>
      </div>
      <div style="display:flex;gap:10px;">
        <button onclick="document.getElementById('reportRequestModal').remove()" style="flex:1;padding:12px;border:1px solid var(--border);border-radius:10px;background:transparent;color:var(--text-muted);font-size:14px;cursor:pointer;">Cancel</button>
        <button onclick="submitRequestReport('${requestId}')" style="flex:2;padding:12px;border:none;border-radius:10px;background:#ef4444;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Submit Report</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

async function submitRequestReport(requestId) {
  const reason = document.getElementById('reportRequestReason')?.value;
  const note   = document.getElementById('reportRequestNote')?.value.trim();
  if (!reason) return;

  const btn = document.querySelector('#reportRequestModal button:last-child');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

  try {
    const res = await fetch(`${API_URL}/requests/${requestId}/report`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, note })
    });
    const data = await res.json();
    document.getElementById('reportRequestModal')?.remove();
    if (data.success) {
      showToast('Report submitted. Thank you for keeping the platform safe.', 'success');
    } else {
      showToast(data.message || 'Failed to submit report', 'error');
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Report'; }
  }
}

// ─── FORMAT KEY FOR DISPLAY ───
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// ─── APPROACH CLIENT ───
function getCurrentExpertProfileStrength() {
  if (!state.user || state.user.role !== 'expert' || typeof calculateProfileStrength !== 'function') return 100;
  const result = calculateProfileStrength(state.user, state.user.profile || {});
  return result && typeof result.total === 'number' ? result.total : 0;
}

function showProfileStrengthRequiredModal(score) {
  const existing = document.getElementById('expertProfilePromptModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'expertProfilePromptModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;';
  modal.innerHTML =
    '<div style="width:min(440px,100%);background:var(--bg);border:1px solid var(--border);border-radius:8px;box-shadow:0 18px 48px rgba(0,0,0,.25);padding:22px;">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px;">' +
        '<div>' +
          '<div style="font-size:12px;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Profile score ' + score + '%</div>' +
          '<h3 style="margin:0;font-size:21px;line-height:1.25;color:var(--text);">Complete at least 50% profile to approach clients</h3>' +
        '</div>' +
        '<button type="button" onclick="dismissExpertProfilePrompt()" style="border:0;background:transparent;color:var(--text-muted);font-size:24px;line-height:1;cursor:pointer;">&times;</button>' +
      '</div>' +
      '<p style="margin:0 0 16px;color:var(--text-muted);font-size:14px;line-height:1.6;">Clients trust approaches more when the expert profile has enough detail. Add your bio, specialization, location, and professional proof before sending quotes.</p>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
        '<button type="button" class="btn btn-secondary" onclick="dismissExpertProfilePrompt()">Close</button>' +
        '<button type="button" class="btn btn-primary" onclick="goToExpertProfileFromPrompt()">Go to Profile</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function ensureExpertCanApproach() {
  const score = getCurrentExpertProfileStrength();
  if (score >= 50) return true;
  showProfileStrengthRequiredModal(score);
  return false;
}

function approachClient(requestId) {
  if (!ensureExpertCanApproach()) return;
  const modal = document.getElementById('approachModal');
  modal.dataset.requestId = requestId;
  document.getElementById('approachMessage').value = '';
  document.getElementById('approachQuote').value = '';
  modal.style.display = 'flex';
}

async function submitApproach() {
  if (isUserRestricted()) { showRestrictedToast(); return; }
  if (!ensureExpertCanApproach()) return;
  const modal    = document.getElementById('approachModal');
  const requestId = modal.dataset.requestId;
  const message  = document.getElementById('approachMessage').value.trim();
  const quote    = document.getElementById('approachQuote').value;

  if (!quote || isNaN(quote) || parseInt(quote) < 1) {
    showToast('Please enter your quote amount', 'error'); return;
  }
  if (!message || message.length < 20) {
    showToast('Please write at least 20 characters in your message', 'error'); return;
  }

  const btn = document.getElementById('approachSubmitBtn');
  btn.disabled    = true;
  btn.textContent = 'Sending...';

  try {
    const res = await fetch(`${API_URL}/approaches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request: requestId,
        message,
        quote: parseInt(quote)
      })
    });

    const data = await res.json();

    if (data.success) {
      modal.style.display = 'none';
      showToast('Approach sent successfully!', 'success');
      loadExpertData();
      loadExpertCredits();
    } else {
      showToast(data.message || 'Failed to send approach', 'error');
    }
  } catch (error) {
    console.error('Approach error:', error);
    showToast('Failed to send approach', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = '💎 Send Approach';
  }
}

// ─── LOAD EXPERT CREDITS ───

async function loadExpertCredits() {
try {
   // ✅ FIX: Show from state immediately
  const creditsDisplay = document.getElementById('expertCredits');
   if (creditsDisplay && state.user) {
    creditsDisplay.textContent = state.user.credits || 0;
   }
   
  // Also fetch fresh data from API
   const res = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    headers: {
     'Authorization': `Bearer ${state.token}`
     }
   });
  
   const data = await res.json();
   
   if (data.success && data.user) {
     // Update state with fresh credits
     state.user.credits = data.user.credits;
    localStorage.setItem('user', JSON.stringify(state.user));
     
    // Update display
     if (creditsDisplay) {
      creditsDisplay.textContent = data.user.credits || 0;
    }
  }
 } catch (error) {
  console.error('Load credits error:', error);
   // Still show from state even if API fails
   const creditsDisplay = document.getElementById('expertCredits');
  if (creditsDisplay && state.user) {
    creditsDisplay.textContent = state.user.credits || 0;
   }
 }
}
// ─── CREDITS HISTORY ───
let _chCurrentTab = 'purchase';

function switchCreditsTab(tab) {
  _chCurrentTab = tab;
  const purchaseTab = document.getElementById('chPurchaseTab');
  const spentTab    = document.getElementById('chSpentTab');
  const purchaseBtn = document.getElementById('chTabPurchase');
  const spentBtn    = document.getElementById('chTabSpent');

  if (tab === 'purchase') {
    purchaseTab.style.display = 'block';
    spentTab.style.display    = 'none';
    purchaseBtn.style.background = 'var(--primary)';
    purchaseBtn.style.color      = '#fff';
    spentBtn.style.background    = 'transparent';
    spentBtn.style.color         = 'var(--text-muted)';
    loadCreditsHistory('purchase');
  } else {
    purchaseTab.style.display = 'none';
    spentTab.style.display    = 'block';
    spentBtn.style.background = 'var(--primary)';
    spentBtn.style.color      = '#fff';
    purchaseBtn.style.background = 'transparent';
    purchaseBtn.style.color      = 'var(--text-muted)';
    loadCreditsHistory('spent');
  }
}

async function loadCreditsHistory(type) {
  const containerId = type === 'purchase' ? 'chPurchaseList' : 'chSpentList';
  const container   = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner"></div></div>';

  try {
    const res  = await fetch(`${API_URL}/credits/transactions?type=${type === 'purchase' ? 'purchase' : 'spent'}&limit=50`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (!data.success || !data.transactions.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px 20px;">
          <div style="font-size:48px;margin-bottom:12px;">${type === 'purchase' ? '💳' : '💎'}</div>
          <h3 style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px;">No ${type === 'purchase' ? 'purchases' : 'spending'} yet</h3>
          <p style="font-size:14px;color:var(--text-muted);">${type === 'purchase' ? 'Buy credits to get started' : 'Credits spent on approaches will appear here'}</p>
        </div>`;
      return;
    }

    if (type === 'purchase') {
      renderPurchaseHistory(data.transactions, container);
    } else {
      renderSpentHistory(data.transactions, container);
    }
  } catch (err) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Failed to load history</div>';
  }
}

function renderPurchaseHistory(transactions, container) {
  container.innerHTML = transactions.map(tx => {
    const date    = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
    const credits = tx.amount || tx.purchaseDetails?.packageSize || 0;
    const paid    = tx.purchaseDetails?.amountPaid || 0;
    const closing = tx.balanceAfter ?? '—';

    return `
      <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:14px;padding:16px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:38px;height:38px;border-radius:50%;background:rgba(252,128,25,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">💳</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--text);">+${credits} Credits</div>
              <div style="font-size:12px;color:var(--text-muted);">${date}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:800;color:#22c55e;">₹${paid}</div>
            <div style="font-size:11px;color:var(--text-muted);">paid</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--bg-gray);border-radius:8px;">
          <span style="font-size:12px;color:var(--text-muted);">Closing Balance</span>
          <span style="font-size:12px;font-weight:700;color:var(--text);">💎 ${closing} credits</span>
        </div>
      </div>`;
  }).join('');
}

function renderSpentHistory(transactions, container) {
  const serviceLabels = WI_SERVICES.labels;
   
  container.innerHTML = transactions.map(tx => {
    const date       = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
    const credits    = Math.abs(tx.amount || 0);
    const clientName = tx.approachDetails?.clientName || tx.relatedClient?.name || '—';
    const service    = tx.approachDetails?.requestService || '—';
    const closing    = tx.balanceAfter ?? '—';
    const svcLabel   = serviceLabels[service] || service;

    return `
      <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:14px;padding:16px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:38px;height:38px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">💎</div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--text);">-${credits} Credits</div>
              <div style="font-size:12px;color:var(--text-muted);">${date}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px;font-weight:700;color:#ef4444;">-${credits}</div>
            <div style="font-size:11px;color:var(--text-muted);">spent</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;">
          <div style="padding:8px 10px;background:var(--bg-gray);border-radius:8px;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">Spent on</div>
            <div style="font-size:12px;font-weight:700;color:var(--text);">👤 ${clientName}</div>
          </div>
          <div style="padding:8px 10px;background:var(--bg-gray);border-radius:8px;">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">Category</div>
            <div style="font-size:12px;font-weight:700;color:var(--primary);">${svcLabel}</div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--bg-gray);border-radius:8px;">
          <span style="font-size:12px;color:var(--text-muted);">Closing Balance</span>
          <span style="font-size:12px;font-weight:700;color:var(--text);">💎 ${closing} credits</span>
        </div>
      </div>`;
  }).join('');
}

// ─── UPDATE EXPERT PROFILE ───
function updateExpertProfile() {
  const user = state.user;
  if (!user) return;
  
  // Update avatar
  const avatar = document.getElementById('expertAvatar');
  if (avatar) {
    if (user.profilePhoto) {
      avatar.innerHTML = `<img src="${user.profilePhoto}" alt="${user.name}">`;
    } else {
      avatar.textContent = user.name.substring(0, 1).toUpperCase();
    }
  }
  
  // Update profile tab
  const profileAvatar = document.getElementById('expertProfileAvatar');
  if (profileAvatar) {
    if (user.profilePhoto) {
      profileAvatar.innerHTML = `<img src="${user.profilePhoto}" alt="${user.name}">`;
    } else {
      profileAvatar.textContent = user.name.substring(0, 1).toUpperCase();
    }
  }
  
  const profileName = document.getElementById('expertProfileName');
  if (profileName) profileName.textContent = user.name;
  
  const profileEmail = document.getElementById('expertProfileEmail');
  if (profileEmail) profileEmail.textContent = user.email;
}

// ─── SHOW REQUEST DETAIL MODAL (FOR CLIENT) ───
async function showRequestDetail(requestId) {
  const req = state.requests.find(r => r._id === requestId);
  if (!req) return;
  
  try {
    const res = await fetch(`${API_URL}/requests/${requestId}/approaches`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      showRequestApproaches(req, data.approaches || []);
    } else {
      // Fallback: fetch all approaches and filter client-side
      const res2 = await fetch(`${API_URL}/approaches`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const data2 = await res2.json();
      const filtered = (data2.approaches || []).filter(function(a) {
        var rid = a.request && (a.request._id || a.request);
        return String(rid) === String(requestId);
      });
      showRequestApproaches(req, filtered);
    }
  } catch (error) {
    console.error('Load approaches error:', error);
    showToast('Failed to load approaches', 'error');
  }
}

// ADD this new function (doesn't exist yet):

async function cancelRequest(requestId) {
  if (!confirm('Are you sure you want to cancel this request? This cannot be undone.')) return;
  
  try {
    const res = await fetch(`${API_URL}/requests/${requestId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      showToast('Request cancelled successfully', 'success');
      
      // Close any open modals
      document.querySelectorAll('[style*="position: fixed"]').forEach(modal => {
        if (modal.style.zIndex === '1000' || modal.style.zIndex === '1001') {
          modal.remove();
        }
      });
      
      // Reload client data
      loadClientData();
    } else {
      showToast(data.message || 'Failed to cancel request', 'error');
    }
  } catch (error) {
    console.error('Cancel request error:', error);
    showToast('Failed to cancel request', 'error');
  }
}

// ─── EDIT REQUEST MODAL ───
function openEditRequestModal(requestId) {
  const req = state.requests.find(r => r._id === requestId);
  if (!req) return;

  const existing = document.getElementById('editRequestModal');
  if (existing) existing.remove();

  const urgencyOpts = [
    { value: 'immediate', label: 'Immediately (within 24 hours)' },
    { value: '2-3days',   label: 'Within 2–3 days' },
    { value: 'week',      label: 'Within a week' },
    { value: 'month',     label: 'Within a month' },
    { value: 'flexible',  label: 'Flexible / Just exploring' }
  ];

  const modal = document.createElement('div');
  modal.id = 'editRequestModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:1005;padding:20px;';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background:var(--bg);border-radius:18px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;padding:28px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div>
          <h2 style="font-size:19px;font-weight:800;color:var(--text);margin:0 0 2px;">✏️ Edit Request</h2>
          <p style="font-size:12px;color:var(--text-muted);margin:0;">${req.title}</p>
        </div>
        <button onclick="document.getElementById('editRequestModal').remove()"
          style="width:32px;height:32px;border:none;background:var(--bg-gray);border-radius:50%;font-size:18px;cursor:pointer;color:var(--text-muted);">×</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px;">

        <div>
          <label style="font-size:13px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Title</label>
          <input id="editReqTitle" type="text" value="${(req.title || '').replace(/"/g, '&quot;')}"
            style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;background:var(--bg);color:var(--text);box-sizing:border-box;">
        </div>

        <div>
          <label style="font-size:13px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Description</label>
          <textarea id="editReqDescription" rows="5"
            style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;resize:vertical;background:var(--bg);color:var(--text);box-sizing:border-box;">${req.description || ''}</textarea>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="font-size:13px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Budget (₹)</label>
            <input id="editReqBudget" type="number" value="${req.budget || ''}"
              style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;background:var(--bg);color:var(--text);box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Urgency</label>
            <select id="editReqTimeline"
              style="width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;background:var(--bg);color:var(--text);box-sizing:border-box;">
              ${urgencyOpts.map(o => `<option value="${o.value}" ${req.timeline === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
            </select>
          </div>
        </div>

      </div>

      <div style="display:flex;gap:10px;margin-top:24px;">
        <button onclick="document.getElementById('editRequestModal').remove()"
          style="flex:1;padding:13px;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:var(--text);font-size:14px;font-weight:600;cursor:pointer;">
          Cancel
        </button>
        <button onclick="saveEditedRequest('${requestId}')"
          style="flex:2;padding:13px;border:none;border-radius:12px;background:var(--primary);color:#fff;font-size:15px;font-weight:700;cursor:pointer;">
          💾 Save Changes
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

async function saveEditedRequest(requestId) {
  const title       = document.getElementById('editReqTitle')?.value.trim();
  const description = document.getElementById('editReqDescription')?.value.trim();
  const budget      = document.getElementById('editReqBudget')?.value;
  const timeline    = document.getElementById('editReqTimeline')?.value;

  if (!title)       { showToast('Title cannot be empty', 'error'); return; }
  if (!description) { showToast('Description cannot be empty', 'error'); return; }

  const btn = document.querySelector('#editRequestModal button[onclick*="saveEditedRequest"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    const res = await fetch(`${API_URL}/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, budget: Number(budget), timeline })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Request updated successfully!', 'success');
      document.getElementById('editRequestModal')?.remove();
      // Close approachesModal too
      document.getElementById('approachesModal')?.remove();
      loadClientData();
    } else {
      showToast(data.message || 'Failed to update', 'error');
      if (btn) { btn.disabled = false; btn.textContent = '💾 Save Changes'; }
    }
  } catch (err) {
    showToast('Network error', 'error');
    if (btn) { btn.disabled = false; btn.textContent = '💾 Save Changes'; }
  }
}

// ─── SHOW REQUEST APPROACHES MODAL ───
// ── Compare state ──
var _compareSelected = [];

function showRequestApproaches(req, approaches) {
  _compareSelected = [];
  var modal = document.createElement('div');
  modal.id = 'approachesModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

  var isCompleted = req.status === 'completed';
  var svcColors = { itr:'#8b5cf6', gst:'#3b82f6', accounting:'#10b981', audit:'#f59e0b', photography:'#ec4899', development:'#06b6d4' };

  var approachesHTML = approaches.length > 0 ? approaches.map(function(app) {
    var expert = app.expert;
    if (!expert) return '';
    var kycVerified = expert.kyc && expert.kyc.status === 'approved';
    var primarySvc = (expert.servicesOffered || (expert.profile && expert.profile.servicesOffered) || [])[0];
    var svcColor = svcColors[primarySvc] || '#FC8019';
    var safeId   = app._id;
    var safeEid  = expert._id;
    var safeName = (expert.name || '').replace(/'/g, '');

    return '<div id="apCard_' + safeId + '" style="background:var(--bg);border:1.5px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:12px;transition:border-color 0.2s;">' +

      '<div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);">' +
        '<label style="display:flex;align-items:center;cursor:pointer;flex-shrink:0;">' +
          '<input type="checkbox" id="cmp_' + safeId + '" onchange="toggleCompare(\'' + safeId + '\',\'' + safeEid + '\',this)" style="width:18px;height:18px;accent-color:var(--primary);cursor:pointer;">' +
        '</label>' +
        '<div style="width:48px;height:48px;border-radius:50%;background:' + svcColor + ';color:#fff;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">' +
          (expert.profilePhoto ? '<img src="' + expert.profilePhoto + '" style="width:100%;height:100%;object-fit:cover;">' : (expert.name || '?').substring(0,1).toUpperCase()) +
        '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
            '<span style="font-size:15px;font-weight:700;color:var(--text);">' + expert.name + '</span>' +
            (kycVerified ? '<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px;background:rgba(34,197,94,0.1);color:#16a34a;">✓ KYC</span>' : '') +
          '</div>' +
          '<div style="font-size:12px;color:' + svcColor + ';font-weight:600;">' + (expert.specialization || (expert.profile && expert.profile.specialization) || 'Professional') + '</div>' +
          (expert.rating ? '<div style="font-size:12px;color:#f59e0b;font-weight:700;">⭐ ' + Number(expert.rating).toFixed(1) + ' <span style="color:var(--text-muted);font-weight:400;">(' + (expert.reviewCount || 0) + ')</span></div>' : '<div style="font-size:12px;color:var(--text-muted);">No reviews yet</div>') +
        '</div>' +
        (app.quote ? '<div style="text-align:right;flex-shrink:0;background:rgba(252,128,25,0.08);border-radius:10px;padding:8px 12px;"><div style="font-size:18px;font-weight:800;color:var(--primary);">₹' + Number(app.quote).toLocaleString('en-IN') + '</div><div style="font-size:10px;color:var(--text-muted);font-weight:600;">QUOTED</div></div>' : '') +
      '</div>' +

      '<div style="padding:12px 16px;border-bottom:1px solid var(--border);">' +
        '<p style="font-size:13px;color:var(--text-light);line-height:1.6;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">' + (app.message || '') + '</p>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;padding:12px 16px;">' +
        '<button onclick="viewExpertProfile(\'' + safeEid + '\', true)" style="padding:10px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text);font-size:13px;font-weight:600;cursor:pointer;" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.color=\'var(--primary)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text)\'">View Profile</button>' +
        (!isCompleted
          ? '<button onclick="contactExpert(\'' + safeEid + '\',\'' + req._id + '\',\'' + state.user._id + '\')" style="padding:10px;border:none;border-radius:10px;background:var(--primary);color:#fff;font-size:13px;font-weight:700;cursor:pointer;">💬 Contact</button>'
          : '<div style="padding:10px;border-radius:10px;background:rgba(34,197,94,0.08);color:#16a34a;font-size:13px;font-weight:600;text-align:center;">✅ Completed</div>') +
        '<button onclick="showBlockFromApproaches(\'' + safeEid + '\',\'' + safeName + '\')" title="Block or report" style="width:40px;padding:10px 0;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text-muted);font-size:14px;cursor:pointer;" onmouseover="this.style.borderColor=\'#ef4444\';this.style.color=\'#ef4444\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-muted)\'">🚩</button>' +
      '</div>' +

      (!isCompleted
        ? '<div style="padding:0 16px 12px;"><button onclick="confirmServiceReceived(\'' + req._id + '\',\'' + safeEid + '\',\'' + safeName + '\',\'' + safeId + '\')" style="width:100%;padding:10px;border:1.5px solid #22c55e;border-radius:10px;background:transparent;color:#22c55e;font-size:13px;font-weight:600;cursor:pointer;" onmouseover="this.style.background=\'rgba(34,197,94,0.08)\'" onmouseout="this.style.background=\'transparent\'">✓ Service Received?</button></div>'
        : '') +
    '</div>';
  }).join('') :
    '<div style="text-align:center;padding:40px 20px;">' +
      '<div style="font-size:48px;margin-bottom:12px;">👨‍💼</div>' +
      '<h3 style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:6px;">No proposals yet</h3>' +
      '<p style="font-size:14px;color:var(--text-muted);">Professionals will respond to your request soon</p>' +
    '</div>';

  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:18px;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;display:flex;flex-direction:column;">' +

      '<div style="padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg);z-index:2;border-radius:18px 18px 0 0;">' +
        '<div>' +
          '<h2 style="font-size:17px;font-weight:800;color:var(--text);margin:0 0 2px;">' + req.title + '</h2>' +
          '<p style="font-size:12px;color:var(--text-muted);margin:0;">Professionals Interested (' + approaches.length + ')</p>' +
        '</div>' +
        '<button onclick="document.getElementById(\'approachesModal\').remove()" style="width:32px;height:32px;border:none;background:var(--bg-gray);border-radius:50%;font-size:18px;cursor:pointer;color:var(--text-muted);">×</button>' +
      '</div>' +

      (approaches.length >= 2
        ? '<div style="padding:10px 20px;background:rgba(59,130,246,0.06);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
            '<p style="font-size:12px;color:#3b82f6;margin:0;font-weight:600;">☑️ Tick boxes to compare up to 5 experts side by side</p>' +
            '<button onclick="selectAllForCompare()" id="selectAllBtn" style="font-size:12px;font-weight:700;color:#3b82f6;background:transparent;border:1.5px solid #3b82f6;border-radius:8px;padding:4px 12px;cursor:pointer;white-space:nowrap;flex-shrink:0;">Select All</button>' +
          '</div>'
        : '') +
     
      '<div style="padding:16px 20px;flex:1;">' + approachesHTML + '</div>' +

      '<div id="compareBar" style="display:none;position:sticky;bottom:0;background:var(--bg);border-top:1px solid var(--border);padding:14px 20px;border-radius:0 0 18px 18px;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">' +
          '<span id="compareCount" style="font-size:13px;font-weight:600;color:var(--text-muted);">0 selected</span>' +
          '<button onclick="openCompareModal()" style="flex:1;padding:12px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(59,130,246,0.3);">⚖️ Compare Selected Experts</button>' +
        '</div>' +
      '</div>' +

      ((req.status === 'pending' || req.status === 'active')
  ? '<div style="padding:0 20px 16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
      '<button onclick="openEditRequestModal(\'' + req._id + '\')" style="padding:13px;border:1.5px solid var(--primary);border-radius:10px;background:transparent;color:var(--primary);font-size:14px;font-weight:600;cursor:pointer;" onmouseover="this.style.background=\'rgba(252,128,25,0.06)\'" onmouseout="this.style.background=\'transparent\'">✏️ Edit Request</button>' +
      '<button onclick="cancelRequest(\'' + req._id + '\')" style="padding:13px;border:1.5px solid #ef4444;border-radius:10px;background:transparent;color:#ef4444;font-size:14px;font-weight:600;cursor:pointer;" onmouseover="this.style.background=\'rgba(239,68,68,0.06)\'" onmouseout="this.style.background=\'transparent\'">✕ Cancel Request</button>' +
    '</div>'
  : '') +
    '</div>';

  window._approachesForCompare = approaches;
  window._reqForCompare = req;
  document.body.appendChild(modal);
}
function selectAllForCompare() {
  var approaches = window._approachesForCompare || [];
  var allIds = approaches.map(function(a) { return a._id; });
  var btn = document.getElementById('selectAllBtn');
  var isAllSelected = _compareSelected.length === allIds.length;

  if (isAllSelected) {
    // Deselect all
    _compareSelected = [];
    allIds.forEach(function(id) {
      var cb = document.getElementById('cmp_' + id);
      if (cb) cb.checked = false;
      var card = document.getElementById('apCard_' + id);
      if (card) card.style.borderColor = 'var(--border)';
    });
    if (btn) { btn.textContent = 'Select All'; btn.style.background = 'transparent'; btn.style.color = '#3b82f6'; }
  } else {
    // Select up to 5
    _compareSelected = [];
    var limit = Math.min(allIds.length, 5);
    for (var i = 0; i < limit; i++) {
      var id = allIds[i];
      _compareSelected.push(id);
      var cb = document.getElementById('cmp_' + id);
      if (cb) cb.checked = true;
      var card = document.getElementById('apCard_' + id);
      if (card) card.style.borderColor = '#3b82f6';
    }
    if (allIds.length > 5) showToast('Only first 5 selected (maximum for compare)', 'info');
    if (btn) { btn.textContent = 'Deselect All'; btn.style.background = 'rgba(59,130,246,0.08)'; btn.style.color = '#3b82f6'; }
  }

  var bar   = document.getElementById('compareBar');
  var count = document.getElementById('compareCount');
  if (bar)   bar.style.display = _compareSelected.length >= 2 ? 'block' : 'none';
  if (count) count.textContent  = _compareSelected.length + ' selected';
}

function toggleCompare(appId, expertId, checkbox) {
  var card = document.getElementById('apCard_' + appId);
  if (checkbox.checked) {
    if (_compareSelected.length >= 5) {
      checkbox.checked = false;
      showToast('Maximum 5 experts can be compared', 'error');
      return;
    }
    _compareSelected.push(appId);
    if (card) card.style.borderColor = '#3b82f6';
  } else {
    _compareSelected = _compareSelected.filter(function(id) { return id !== appId; });
    if (card) card.style.borderColor = 'var(--border)';
  }
  var bar   = document.getElementById('compareBar');
  var count = document.getElementById('compareCount');
  if (bar)   bar.style.display = _compareSelected.length >= 2 ? 'block' : 'none';
  if (count) count.textContent  = _compareSelected.length + ' selected';
}

function showBlockFromApproaches(expertId, expertName) {
  _blockTargetId   = expertId;
  _blockTargetName = expertName;

  // Remove any existing report modal
  var old = document.getElementById('approachReportModal');
  if (old) old.remove();

  var modal = document.createElement('div');
  modal.id = 'approachReportModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1010;padding:20px;';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

  var reasons = [
    { value: 'unprofessional',  label: '😤 Unprofessional behaviour' },
    { value: 'spam',            label: '🚫 Spam or irrelevant message' },
    { value: 'fake',            label: '🎭 Fake profile / credentials' },
    { value: 'harassment',      label: '⚠️ Harassment or rude language' },
    { value: 'overcharging',    label: '💸 Misleading quote / overcharging' },
    { value: 'other',           label: '📝 Other reason' },
  ];

  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:20px;max-width:400px;width:100%;padding:24px;">' +

      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
        '<div style="width:40px;height:40px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🚩</div>' +
        '<div>' +
          '<h2 style="font-size:17px;font-weight:800;color:var(--text);margin:0 0 2px;">Report Expert</h2>' +
          '<p style="font-size:13px;color:var(--text-muted);margin:0;">Reporting <strong>' + expertName + '</strong></p>' +
        '</div>' +
        '<button onclick="document.getElementById(\'approachReportModal\').remove()" style="margin-left:auto;width:32px;height:32px;border:none;background:var(--bg-gray);border-radius:50%;font-size:18px;cursor:pointer;color:var(--text-muted);">×</button>' +
      '</div>' +

      '<p style="font-size:13px;color:var(--text-muted);margin-bottom:14px;">Why are you reporting this expert?</p>' +

      '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;" id="reportReasonList">' +
        reasons.map(function(r) {
          return '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:all 0.15s;" ' +
            'onmouseover="this.style.borderColor=\'#ef4444\';this.style.background=\'rgba(239,68,68,0.04)\'" ' +
            'onmouseout="this.querySelector(\'input\').checked||(this.style.borderColor=\'var(--border)\',this.style.background=\'transparent\')">' +
            '<input type="radio" name="approachReportReason" value="' + r.value + '" style="accent-color:#ef4444;width:16px;height:16px;" ' +
            'onchange="document.querySelectorAll(\'#reportReasonList label\').forEach(function(l){l.style.borderColor=\'var(--border)\';l.style.background=\'transparent\'});this.closest(\'label\').style.borderColor=\'#ef4444\';this.closest(\'label\').style.background=\'rgba(239,68,68,0.06)\';document.getElementById(\'reportOtherBox\').style.display=\'' + (r.value === 'other' ? 'block' : 'none') + '\'">' +
            '<span style="font-size:14px;color:var(--text);">' + r.label + '</span>' +
          '</label>';
        }).join('') +
      '</div>' +

      '<div id="reportOtherBox" style="display:none;margin-bottom:16px;">' +
        '<textarea id="reportOtherText" rows="3" placeholder="Please describe the issue..." ' +
          'style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:10px;font-size:13px;color:var(--text);background:var(--bg);resize:none;box-sizing:border-box;"></textarea>' +
      '</div>' +

      '<div id="reportErrorMsg" style="display:none;color:#ef4444;font-size:13px;margin-bottom:10px;"></div>' +

      '<div style="display:flex;gap:10px;">' +
        '<button onclick="document.getElementById(\'approachReportModal\').remove()" ' +
          'style="flex:1;padding:13px;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:var(--text);font-size:14px;font-weight:600;cursor:pointer;">Cancel</button>' +
        '<button onclick="submitApproachReport()" ' +
          'style="flex:1;padding:13px;border:none;border-radius:12px;background:#ef4444;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">🚩 Submit Report</button>' +
      '</div>' +

    '</div>';

  document.body.appendChild(modal);
}

async function submitApproachReport() {
  var selected = document.querySelector('input[name="approachReportReason"]:checked');
  var errEl = document.getElementById('reportErrorMsg');
  if (!selected) {
    errEl.textContent = 'Please select a reason before submitting.';
    errEl.style.display = 'block';
    return;
  }
  var reason = selected.value;
  var detail = reason === 'other' ? (document.getElementById('reportOtherText')?.value?.trim() || '') : '';
  if (reason === 'other' && !detail) {
    errEl.textContent = 'Please describe the issue.';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  var btn = document.querySelector('#approachReportModal button[onclick="submitApproachReport()"]');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Submitting...'; }

  try {
    var res = await fetch(API_URL + '/users/' + _blockTargetId + '/block', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + state.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ report: true, reason: reason + (detail ? ': ' + detail : '') })
    });
    var data = await res.json();
    document.getElementById('approachReportModal')?.remove();
    if (data.success) {
      // Add to local blocked list + remove from explore grid (same as openBlockModal flow)
      if (_blockTargetId) {
        _clientBlocked = _clientBlocked || [];
        if (!_clientBlocked.includes(_blockTargetId)) {
          _clientBlocked.push(_blockTargetId);
          localStorage.setItem('blockedExperts_' + state.user._id, JSON.stringify(_clientBlocked));
        }
        // Remove from explore grid if currently on that view
        if (_clientExploreAll && _clientExploreAll.length) {
          _clientExploreAll = _clientExploreAll.filter(function(e) { return e._id !== _blockTargetId; });
          filterClientExplore(_exploreFilter);
        }
      }
      showToast('Report submitted. Expert has been blocked.', 'success');
    } else {
      showToast(data.message || 'Failed to submit report', 'error');
    }
  } catch (err) {
    document.getElementById('approachReportModal')?.remove();
    showToast('Network error — please try again', 'error');
  }
}

function openCompareModal() {
    var approaches = (window._approachesForCompare || []).filter(function(a) { return _compareSelected.indexOf(a._id) !== -1 && a.expert; });
  if (!approaches.length) return;
  var req = window._reqForCompare || {};
  var existing = document.getElementById('compareModal');
  if (existing) existing.remove();

  const svcColors = WI_SERVICES.colors;

  var rows = [
    { label: '💰 Quote',        fn: function(a) { return a.quote ? '<strong style="color:var(--primary);font-size:16px;">₹' + Number(a.quote).toLocaleString('en-IN') + '</strong>' : '<span style="color:var(--text-muted);">—</span>'; } },
    { label: '⭐ Rating',        fn: function(a) { return a.expert.rating ? '<strong>' + Number(a.expert.rating).toFixed(1) + '</strong> <span style="color:var(--text-muted);font-size:11px;">(' + (a.expert.reviewCount || 0) + ' reviews)</span>' : '<span style="color:var(--text-muted);">No reviews</span>'; } },
    { label: '🛡️ KYC',           fn: function(a) { return (a.expert.kyc && a.expert.kyc.status === 'approved') ? '<span style="color:#16a34a;font-weight:700;">✅ Verified</span>' : '<span style="color:var(--text-muted);">Not verified</span>'; } },
    { label: '🟢 Availability',  fn: function(a) { var m = {available:'🟢 Available',busy:'🔴 Busy',away:'🟡 Away'}; return m[a.expert.availability || 'available'] || '🟢 Available'; } },
    { label: '📅 Experience',    fn: function(a) { var exp = a.expert.yearsOfExperience || (a.expert.profile && (a.expert.profile.experience || a.expert.profile.yearsOfExperience)); return exp ? exp + ' yrs' : '<span style="color:var(--text-muted);">—</span>'; } },
    { label: '💬 Their Message', fn: function(a) { var m = a.message || ''; return '<span style="font-size:12px;line-height:1.5;">' + m.substring(0,120) + (m.length > 120 ? '…' : '') + '</span>'; } },
    { label: '💡 Why Choose Me', fn: function(a) { var w = a.expert.whyChooseMe; return w ? '<span style="font-size:12px;line-height:1.5;">' + w.substring(0,120) + (w.length > 120 ? '…' : '') + '</span>' : '<span style="color:var(--text-muted);">Not set</span>'; } },
    { label: '📋 About',         fn: function(a) { var b = a.expert.bio || (a.expert.profile && a.expert.profile.bio) || ''; return b ? '<span style="font-size:12px;line-height:1.5;">' + b.substring(0,120) + (b.length > 120 ? '…' : '') + '</span>' : '<span style="color:var(--text-muted);">—</span>'; } },
    { label: '🎓 Education',     fn: function(a) { return (a.expert.profile && a.expert.profile.education) || '<span style="color:var(--text-muted);">—</span>'; } },
    { label: '🗂️ Portfolio',      fn: function(a) { var p = a.expert.profile && a.expert.profile.portfolio; return p ? '<span style="font-size:12px;line-height:1.5;">' + p.substring(0,100) + (p.length > 100 ? '…' : '') + '</span>' : '<span style="color:var(--text-muted);">—</span>'; } },
    { label: '📍 Location',      fn: function(a) { return (a.expert.profile && a.expert.profile.city) || (a.expert.location && a.expert.location.city) || '<span style="color:var(--text-muted);">—</span>'; } }
  ];

  var colWidth = Math.max(160, Math.floor(Math.min(window.innerWidth - 80, 900) / approaches.length));

  var headerCols = approaches.map(function(a) {
    var primarySvc = (a.expert.servicesOffered || (a.expert.profile && a.expert.profile.servicesOffered) || [])[0];
    var svcColor = svcColors[primarySvc] || '#FC8019';
    return '<th style="width:' + colWidth + 'px;min-width:' + colWidth + 'px;padding:14px 12px;text-align:center;border-left:1px solid var(--border);vertical-align:top;">' +
      '<div style="width:44px;height:44px;border-radius:50%;background:' + svcColor + ';color:#fff;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;overflow:hidden;">' +
        (a.expert.profilePhoto ? '<img src="' + a.expert.profilePhoto + '" style="width:100%;height:100%;object-fit:cover;">' : (a.expert.name || '?').substring(0,1).toUpperCase()) +
      '</div>' +
      '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:2px;">' + a.expert.name + '</div>' +
      '<div style="font-size:11px;color:' + svcColor + ';font-weight:600;">' + (a.expert.specialization || (a.expert.profile && a.expert.profile.specialization) || 'Professional') + '</div>' +
    '</th>';
  }).join('');

  var dataRows = rows.map(function(row) {
    var cells = approaches.map(function(a) {
      return '<td style="padding:12px;text-align:center;border-left:1px solid var(--border);vertical-align:middle;font-size:13px;color:var(--text);">' + row.fn(a) + '</td>';
    }).join('');
    return '<tr style="border-top:1px solid var(--border);">' +
      '<td style="padding:12px 14px;font-size:12px;font-weight:700;color:var(--text-muted);white-space:nowrap;background:var(--bg-gray);position:sticky;left:0;z-index:1;min-width:110px;">' + row.label + '</td>' +
      cells +
    '</tr>';
  }).join('');

  var contactCells = approaches.map(function(a) {
    return '<td style="padding:12px;border-left:1px solid var(--border);text-align:center;">' +
      '<button onclick="contactExpert(\'' + a.expert._id + '\',\'' + req._id + '\',\'' + state.user._id + '\');document.getElementById(\'compareModal\').remove();" style="width:100%;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;">💬 Contact</button>' +
    '</td>';
  }).join('');

  var modal = document.createElement('div');
  modal.id = 'compareModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1001;padding:16px;';
  modal.onclick = function(e) { if (e.target === modal) modal.remove(); };

  modal.innerHTML =
    '<div style="background:var(--bg);border-radius:18px;width:100%;max-width:960px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;">' +
      '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
        '<div>' +
          '<h2 style="font-size:17px;font-weight:800;color:var(--text);margin:0 0 2px;">⚖️ Compare Experts</h2>' +
          '<p style="font-size:12px;color:var(--text-muted);margin:0;">' + approaches.length + ' experts · ' + (req.title || '') + '</p>' +
        '</div>' +
        '<button onclick="document.getElementById(\'compareModal\').remove()" style="width:32px;height:32px;border:none;background:var(--bg-gray);border-radius:50%;font-size:18px;cursor:pointer;color:var(--text-muted);">×</button>' +
      '</div>' +
      '<div style="overflow:auto;flex:1;">' +
        '<table style="border-collapse:collapse;width:100%;min-width:' + (110 + colWidth * approaches.length) + 'px;">' +
          '<thead style="position:sticky;top:0;z-index:2;background:var(--bg);">' +
            '<tr>' +
              '<th style="width:110px;min-width:110px;padding:14px;background:var(--bg-gray);position:sticky;left:0;z-index:3;"></th>' +
              headerCols +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            dataRows +
            '<tr style="border-top:2px solid var(--border);background:var(--bg);">' +
              '<td style="padding:12px 14px;font-size:12px;font-weight:700;color:var(--text-muted);background:var(--bg-gray);position:sticky;left:0;">🎯 Contact</td>' +
              contactCells +
            '</tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
}

// ─── VIEW EXPERT PROFILE ───

