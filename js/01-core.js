// Split from app.js lines 1-395. app.js is kept as the untouched fallback.
/* ═══════════════════════════════════════════════════════════
   WORKINDEX COMPLETE JAVASCRIPT v2.0
   Add this inside your <script> tag
   ═══════════════════════════════════════════════════════════ */

// ─── CONFIGURATION ─── 
const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:5000/api'
  : 'https://workindex-production.up.railway.app/api';

// ─── STATE MANAGEMENT ─── 
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  currentPage: 'landing',
  currentTab: 'requests',
  selectedRating: 0,
  documents: [],
  accessRequests: [],
  ratings: [],
  experts: [],
  approachedRequests: [],
  myApproaches: []  // ← NEW: Store expert's approaches
};
// ─── INACTIVITY LOGOUT (30 minutes) ───
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
let inactivityTimer = null;

function resetInactivityTimer() {
  if (!state.token || !state.user) return;
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    handleSessionExpired();
  }, INACTIVITY_TIMEOUT);
}

function startInactivityWatcher() {
  const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
  events.forEach(event => {
    window.addEventListener(event, resetInactivityTimer, { passive: true });
  });
  resetInactivityTimer();
}

function stopInactivityWatcher() {
  clearTimeout(inactivityTimer);
  inactivityTimer = null;
}

function handleSessionExpired() {
  stopInactivityWatcher();
  if (notificationInterval) clearInterval(notificationInterval);
  if (chatPollingInterval) clearInterval(chatPollingInterval);
  notificationInterval = null;
  chatPollingInterval = null;
  currentChatId = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  state.token = null;
  state.user  = null;
  showToast('Session expired due to inactivity. Please log in again.', 'error');
  setTimeout(() => {
    showPage('landing');
  }, 1500);
}

// ─── DARK MODE ─── 
function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = true;
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDark);
  // Sync both toggles
  const t1 = document.getElementById('darkModeToggle');
  const t2 = document.getElementById('darkModeToggle2');
  if (t1) t1.checked = isDark;
  if (t2) t2.checked = isDark;
  showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

// ─── NAVIGATION ─── 
function showPage(pageId, pushState = true) {
  if (pageId === 'questionnaire') {
    document.getElementById('questionnaire').classList.add('active');
    state.currentPage = pageId;
    return;
  }

  document.getElementById('questionnaire')?.classList.remove('active');

  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    state.currentPage = pageId;

    // ── URL mapping ──
    const pageToPath = {
      landing:           '/',
      findProfessionals: '/find-professionals',
      howItWorks:        '/how-it-works',
      pricing:           '/pricing',
      clientDash:        '/dashboard',
      expertDash:        '/dashboard',
      settings:          '/settings',
      myTickets:         '/my-tickets',
         creditsHistory:    '/credits-history',
    };

    const path = pageToPath[pageId] || '/';
    if (pushState && window.location.pathname !== path) {
      history.pushState({ pageId }, '', path);
    }

    // ── Existing page load logic ──
    if (pageId === 'myTickets') {
      loadMyTickets();
    }
    if (pageId === 'findProfessionals') {
      const pending = state.pendingSearch || {};
      state.pendingSearch = null;
      if (pending.service) {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        document.querySelector(`[data-service="${pending.service}"]`)?.classList.add('active');
      }
      if (pending.location) {
        setTimeout(() => {
          const input = document.getElementById('expertSearchInput');
          if (input) input.value = pending.location;
        }, 100);
      }
      const expertFilters = {};
if (pending.service) expertFilters.service = pending.service;
if (pending.location) expertFilters.location = pending.location;
loadExperts(expertFilters);
       
    } else if (pageId === 'clientDash' && state.user?.role === 'client') {
      loadClientData();
    } else if (pageId === 'expertDash' && state.user?.role === 'expert') {
      loadExpertData();
    } else if (pageId === 'settings') {
      loadSettings();
    }
  }
}
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else if (state.user) {
    showPage(state.user.role === 'client' ? 'clientDash' : 'expertDash');
  } else {
    showPage('landing');
  }
}

function switchTab(tabName) {
  state.currentTab = tabName;
  
  document.querySelectorAll('.dash-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
  
  const isExpert = state.user?.role === 'expert';

  // Determine correct content div ID
  let contentId;
  if (tabName === 'profile' && isExpert) {
    contentId = 'expertProfileTab';
  } else if (tabName === 'chat' && isExpert) {
    contentId = 'expertChatTab';
  } else if (tabName === 'chat' && !isExpert) {
    contentId = 'clientChatTab';
  } else {
    contentId = tabName + 'Tab';
  }
  
  const content = document.getElementById(contentId);
  if (content) {
    content.style.display = 'block';
    if (tabName === 'documents') loadDocuments();
        else if (tabName === 'explore' && !isExpert) {
  loadClientExplorePage().then(() => {
    // Wire buttons AFTER async load completes
    const invBtn = document.getElementById('exploreFilterInvites');
    if (invBtn) invBtn.onclick = () => filterClientExplore('invites');
    const allBtn = document.getElementById('exploreFilterAll');
    if (allBtn) allBtn.onclick = () => filterClientExplore('all');
    const slBtn = document.getElementById('exploreFilterShortlisted');
    if (slBtn) slBtn.onclick = () => filterClientExplore('shortlisted');
    // Force render in case grid is empty on first load
    if (_clientExploreAll && _clientExploreAll.length > 0) {
      filterClientExplore('all');
    }
  });
}
    else if (tabName === 'invites' && !isExpert) loadClientInvites();
    else if (tabName === 'access') loadAccessRequests();
    else if (tabName === 'ratings') loadMyRatings();
    else if (tabName === 'approaches' && isExpert) loadMyApproaches();
    else if (tabName === 'profile' && isExpert) renderExpertProfile();
    else if (tabName === 'chat') showChatList();
    
  // If switching AWAY from chat, clear the poll
  if (tabName !== 'chat' && chatPollingInterval) {
    clearInterval(chatPollingInterval);
    chatPollingInterval = null;
    currentChatId = null;
  }
  }
}

function showHowItWorks(type) {
  const isClient = type === 'client';
  document.getElementById('clientSteps').style.display = isClient ? 'block' : 'none';
  document.getElementById('expertSteps').style.display = isClient ? 'none' : 'block';
  const tc = document.getElementById('hiwToggleClient');
  const te = document.getElementById('hiwToggleExpert');
  if (tc) tc.classList.toggle('active', isClient);
  if (te) te.classList.toggle('active', !isClient);
}
// ─── AUTHENTICATION ─── 
async function login(email, password, role) {  // ← accept role as parameter
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: role })  // ← use passed role
    });
    
    const data = await res.json();
    
    if (data.success) {
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user?.role === 'expert' && data.user?._id) {
        sessionStorage.removeItem('expertProfilePromptSkipped_' + data.user._id);
      }
      
      enterDashboard();
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login failed. Please try again.', 'error');
  }
}

async function register(formData) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await res.json();
    
   if (data.success && data.token) {
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(state.user));
  
  showToast('Registration successful!', 'success');
if (state.user.role === 'expert') {
  showExpertWelcomeModal();
} else if (!state._guestQuestionnaire) {
  startQuestionnaire(state.user.role);
} else {
  state._guestQuestionnaire = false;
  submitQuestionnaire();
}
}  else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Registration failed. Please try again.', 'error');
  }
}

function enterDashboard() {
  const dashPage = state.user.role === 'client' ? 'clientDash' : 'expertDash';
  showPage(dashPage);
  loadNotifications();
  // Clear any existing interval before creating a new one
  if (notificationInterval) clearInterval(notificationInterval);
  notificationInterval = setInterval(loadNotifications, 30000);
  startInactivityWatcher();

  // Always refresh user status from server (warnings, restrictions may have changed)
  fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${state.token}` }
  }).then(r => r.json()).then(data => {
    if (data.success && data.user) {
      state.user = { ...state.user, ...data.user };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  }).catch(err => console.error('[/me failed]', err)).finally(() => {
    setTimeout(() => showWarningPopupIfNeeded(), 600);
    setTimeout(() => showExpertProfileCompletionPromptIfNeeded(), 1000);
  });
   
  // Show service filter modal for new experts
  if (state.user.role === 'expert') {
    const hasFilter = state.user?.profile?.browseServiceFilter?.length > 0;
    const isNewUser = !localStorage.getItem('hasSeenServiceFilter_' + state.user._id);
    if (isNewUser || !hasFilter) {
      localStorage.setItem('hasSeenServiceFilter_' + state.user._id, 'true');
      setTimeout(() => showServiceFilterModal(), 800);
    } else {
      // Returning expert — restore their saved filter silently
      state.browseServiceFilter = state.user.profile.browseServiceFilter;
    }
  }
}

// ─── WARNING / RESTRICTION HELPERS ───
function isUserRestricted() {
  return !!(state.user && state.user.isRestricted);
}

function showRestrictedToast() {
  showToast('Your account has restrictions. Please raise a ticket or contact admin to remove them.', 'error');
}

function showWarningPopupIfNeeded() {
  const u = state.user;
  if (!u) return;
  if (!u.warnings && !u.isRestricted) return;

  // ✅ Restricted users: always show, no suppression ever
  if (u.isRestricted) {
    // Also clear any stale seenKey for warning 3 so it never suppresses
    localStorage.removeItem('warnSeen_' + u._id + '_3');
    localStorage.removeItem('warnSeen_' + u._id + '_' + (u.warnings || 0));
  } else {
    const seenKey = 'warnSeen_' + u._id + '_' + (u.warnings || 0);
    if (localStorage.getItem(seenKey)) return;
    localStorage.setItem(seenKey, '1');
  }
  const isRestricted = u.isRestricted;
  const warnCount = u.warnings || 0;
  const reason = (u.lastWarning && u.lastWarning.reason) ? u.lastWarning.reason : 'Violation of platform guidelines';
  const color = isRestricted ? '#ef4444' : '#f59e0b';
  const icon  = isRestricted ? '🚫' : '⚠️';
  const title = isRestricted ? 'Account Restricted' : `Warning ${warnCount} of 3`;
  const body  = isRestricted
    ? `Your account has been <strong>restricted</strong> due to repeated violations.<br><br>You can still log in and view content, but you cannot approach clients, start chats, or send messages until this restriction is lifted.<br><br><strong>Reason:</strong> ${reason}`
    : `You have received <strong>Warning ${warnCount}/3</strong> on your account.<br><br><strong>Reason:</strong> ${reason}<br><br>${warnCount >= 2 ? '<span style="color:#ef4444;font-weight:600;">⚠️ One more violation will restrict your account.</span>' : 'Please review the platform guidelines to avoid further action.'}`;

  const overlay = document.createElement('div');
  overlay.id = 'warnPopupOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML = `
    <div style="background:#1a1a24;border:2px solid ${color};border-radius:16px;max-width:440px;width:100%;padding:28px;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:40px;margin-bottom:10px;">${icon}</div>
        <div style="font-size:18px;font-weight:800;color:${color};">${title}</div>
      </div>
      <div style="font-size:14px;color:#a0a0b8;line-height:1.7;margin-bottom:20px;">${body}</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button onclick="document.getElementById('warnPopupOverlay').remove(); setTimeout(function(){ openTicketModal(); }, 100);" style="padding:12px;background:${color};border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">🎫 Raise a Support Ticket</button>
        <button onclick="document.getElementById('warnPopupOverlay').remove();" style="padding:12px;background:transparent;border:1px solid #2a2a38;border-radius:10px;color:#a0a0b8;font-size:14px;cursor:pointer;">Dismiss</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function logout() {
  stopInactivityWatcher();
  if (notificationInterval) clearInterval(notificationInterval);
  if (chatPollingInterval) clearInterval(chatPollingInterval);
  notificationInterval = null;
  chatPollingInterval = null;
  currentChatId = null;
  if (browseAbortController) browseAbortController.abort();
  if (expertsAbortController) expertsAbortController.abort();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  state.token = null;
  state.user = null;
  clearAuthForms();
  showPage('landing');
  showToast('Logged out successfully', 'success');
}

