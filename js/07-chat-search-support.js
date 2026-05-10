// Split from app.js lines 5167-6843. app.js is kept as the untouched fallback.
// ─── ABORT CONTROLLERS ───
let browseAbortController = null;
let expertsAbortController = null;

// ─── CHAT STATE ───
let currentChatId = null;
let chatPollingInterval = null;
let notificationInterval = null;

// ─── HELPER: get correct element ID based on role ───
function chatEl(clientId, expertId) {
  return document.getElementById(
    state.user?.role === 'expert' ? expertId : clientId
  );
}

// ─── SHOW CHAT LIST (back button) ───
function showChatList() {
  currentChatId = null;
  clearInterval(chatPollingInterval);

  // Hide message view, show list view
  const listView = chatEl('clientChatListView', 'expertChatListView');
  const msgView  = chatEl('clientChatMessageView', 'expertChatMessageView');
  if (listView) listView.style.display = 'block';
  if (msgView)  msgView.style.display  = 'none';

  loadChats();
}

// ─── LOAD ALL CHATS ───
async function loadChats() {
  try {
    const res = await fetch(`${API_URL}/chats`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!data.success) return;

    const container = chatEl('clientChatConversations', 'expertChatConversations');
    if (!container) return;

    if (!data.chats.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h3 class="empty-title">No conversations yet</h3>
          <p class="empty-text">${state.user?.role === 'expert' 
            ? 'Approach a request to start chatting' 
            : 'Experts who approach your requests will appear here'}</p>
        </div>`;
      return;
    }

    container.innerHTML = data.chats.map(chat => {
      const other = state.user?.role === 'expert' ? chat.client : chat.expert;
      const initials = (other?.name || '?').substring(0, 2).toUpperCase();
      const photo = other?.profilePhoto
        ? `<img src="${other.profilePhoto}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
        : initials;

      return `
        <div onclick="openChat('${chat._id}')"
          style="display:flex;align-items:center;gap:12px;padding:14px;border-radius:12px;
                 cursor:pointer;border:1px solid var(--border);margin-bottom:10px;background:var(--bg);">
          <div class="avatar">${photo}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;margin-bottom:2px;">${other?.name || 'Unknown'}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">${chat.request?.title || ''}</div>
            <div style="font-size:13px;color:var(--text-light);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${chat.lastMessage || 'No messages yet'}
            </div>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    console.error('Load chats error:', err);
  }
}

// ─── OPEN SPECIFIC CHAT ───
async function openChat(chatId) {
  currentChatId = chatId;

  const listView = chatEl('clientChatListView', 'expertChatListView');
  const msgView  = chatEl('clientChatMessageView', 'expertChatMessageView');
  if (listView) listView.style.display = 'none';
  if (msgView)  { msgView.style.display = 'flex'; }

  await loadMessages(chatId);

  // Poll every 5 seconds for new messages
  clearInterval(chatPollingInterval);
  chatPollingInterval = setInterval(() => loadMessages(chatId), 5000);
}

// ─── LOAD MESSAGES ───
async function loadMessages(chatId) {
  try {
    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!data.success) return;

    // Update header with other person's name
    const chatsRes = await fetch(`${API_URL}/chats`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const chatsData = await chatsRes.json();
    const chat = chatsData.chats?.find(c => c._id === chatId);
    if (chat) {
      const other = state.user?.role === 'expert' ? chat.client : chat.expert;
      const nameEl    = chatEl('chatWithName', 'expertChatWithName');
      const titleEl   = chatEl('chatRequestTitle', 'expertChatRequestTitle');
      const avatarEl  = chatEl('chatWithAvatar', 'expertChatWithAvatar');
      if (nameEl)   nameEl.textContent  = other?.name || '';
      if (titleEl)  titleEl.textContent = chat.request?.title || '';
      if (avatarEl) avatarEl.innerHTML  = other?.profilePhoto
        ? `<img src="${other.profilePhoto}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
        : (other?.name || '?').substring(0, 2).toUpperCase();
    }

    // Render messages
    const container = chatEl('chatMessages', 'expertChatMessages');
    if (!container) return;

    const myId = state.user?._id || state.user?.id;
    container.innerHTML = data.messages.map(msg => {
      const senderId = msg.sender?._id || msg.sender;
      const isMe = senderId === myId;
      const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `
        <div style="display:flex;justify-content:${isMe ? 'flex-end' : 'flex-start'};">
          <div style="max-width:70%;padding:10px 14px;
            border-radius:${isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
            background:${isMe ? 'var(--primary)' : '#f1f1f1'};
            color:${isMe ? 'white' : 'var(--text)'};
            font-size:14px;line-height:1.4;">
            ${msg.text}
            <div style="font-size:10px;opacity:0.7;margin-top:4px;text-align:right;">${time}</div>
          </div>
        </div>`;
    }).join('');

    container.scrollTop = container.scrollHeight;

  } catch (err) {
    console.error('Load messages error:', err);
  }
}

// ─── SEND MESSAGE ───
async function sendMessage() {
  if (isUserRestricted()) { showRestrictedToast(); return; }
  const inputEl = chatEl('chatInput', 'expertChatInput');
  const text = inputEl?.value.trim();
  if (!text || !currentChatId) return;
  inputEl.value = '';

  try {
    await fetch(`${API_URL}/chats/${currentChatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    await loadMessages(currentChatId);
  } catch (err) {
    console.error('Send message error:', err);
  }
}

// ─── START CHAT (from Contact button) ───
async function startChat(requestId, expertId, clientId) {
  if (isUserRestricted()) { showRestrictedToast(); return; }
  try {
    const res = await fetch(`${API_URL}/chats/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requestId, expertId, clientId })
    });
    const data = await res.json();
    if (data.success) {
      // ✅ Close all open modals correctly
      document.querySelectorAll('[style*="position: fixed"]').forEach(m => m.remove());
      switchTab('chat');
      openChat(data.chat._id);
    } else {
      showToast(data.message || 'Could not start chat', 'error');
    }
  } catch (err) {
    showToast('Network error', 'err');
  }
}
// ─── EXPERT STARTS CHAT FROM APPROACH DETAIL ───
async function expertStartChat(requestId, expertId, clientId) {
  if (isUserRestricted()) { showRestrictedToast(); return; }
  try {
    const res = await fetch(`${API_URL}/chats/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requestId, expertId, clientId })
    });
    const data = await res.json();
    if (data.success) {
      // Close all open modals
      document.querySelectorAll('[style*="position: fixed"]').forEach(m => m.remove());
      switchTab('chat');
      openChat(data.chat._id);
    } else {
      showToast(data.message || 'Could not start chat', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}
async function lookupPincode(value) {
  if (value.length !== 6 || !/^\d+$/.test(value)) return;
  
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
    const data = await res.json();
    
    if (data[0].Status === 'Success') {
      const post = data[0].PostOffice[0];
      const area = post.Name;
      const city = post.District;
      const stateVal = post.State;
      
      // Auto-fill city if empty (expert)
      const cityInput = document.getElementById('q_city');
      if (cityInput && !cityInput.value) {
        cityInput.value = city;
        qState.answers['city'] = city;
      }
      
      // Auto-fill state if empty (expert) — targets the select dropdown
      if (!qState.answers['state']) {
        qState.answers['state'] = stateVal;
        // Re-render so the dropdown shows the selected state
        renderQuestion();
        return; // renderQuestion resets pincodeResult so we stop here
      }
      
      const pincodeResult = document.getElementById('pincodeResult');
      if (pincodeResult) {
        pincodeResult.innerHTML = `
          <div style="font-size: 13px; color: #4CAF50; margin-top: 6px;">
            📍 ${area}, ${city}, ${stateVal}
          </div>`;
      }
    } else {
      const pincodeResult = document.getElementById('pincodeResult');
      if (pincodeResult) {
        pincodeResult.innerHTML = `
          <div style="font-size: 13px; color: #e74c3c; margin-top: 6px;">Invalid pincode</div>`;
      }
    }
  } catch (err) {
    console.error('Pincode lookup error:', err);
  }
}

// ─── PINCODE LOOKUP FOR CLIENT FULL ADDRESS (in-person) ───
async function lookupAddressPincode(value) {
  if (value.length !== 6 || !/^\d+$/.test(value)) return;
  
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
    const data = await res.json();
    
    if (data[0].Status === 'Success') {
      const post = data[0].PostOffice[0];
      const area = post.Name;
      const city = post.District;
      const stateVal = post.State;
      
      if (!qState.answers.fullAddress) qState.answers.fullAddress = {};
      
      // Auto-fill city if empty
      const cityInput = document.getElementById('q_fullAddress_city');
      if (cityInput && !cityInput.value) {
        cityInput.value = city;
        qState.answers.fullAddress.city = city;
      }
      
      // Auto-fill state if empty
      const stateInput = document.getElementById('q_fullAddress_state');
      if (stateInput && !stateInput.value) {
        stateInput.value = stateVal;
        qState.answers.fullAddress.state = stateVal;
      }
      
      // Auto-fill area if empty
      const areaInput = document.getElementById('q_fullAddress_area');
      if (areaInput && !areaInput.value) {
        areaInput.value = area;
        qState.answers.fullAddress.area = area;
      }
      
      const resultEl = document.getElementById('addressPincodeResult');
      if (resultEl) {
        resultEl.innerHTML = `
          <div style="font-size: 13px; color: #4CAF50; margin-top: 6px;">
            📍 ${area}, ${city}, ${stateVal}
          </div>`;
      }
      
      checkCanProceed();
    } else {
      const resultEl = document.getElementById('addressPincodeResult');
      if (resultEl) {
        resultEl.innerHTML = `
          <div style="font-size: 13px; color: #e74c3c; margin-top: 6px;">Invalid pincode</div>`;
      }
    }
  } catch (err) {
    console.error('Address pincode lookup error:', err);
  }
}

// ─── PINCODE LOOKUP FOR CLIENT ONLINE LOCATION ───
async function lookupClientLocationPincode(value) {
  if (value.length !== 6 || !/^\d+$/.test(value)) return;
  
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
    const data = await res.json();
    
    if (data[0].Status === 'Success') {
      const post = data[0].PostOffice[0];
      const area = post.Name;
      const city = post.District;
      const stateVal = post.State;
      
      if (!qState.answers.clientLocation) qState.answers.clientLocation = {};
      
      // Auto-fill city if empty
      const cityInput = document.getElementById('q_clientLocation_city');
      if (cityInput && !cityInput.value) {
        cityInput.value = city;
        qState.answers.clientLocation.city = city;
      }
      
      // Auto-fill state if empty
      const stateInput = document.getElementById('q_clientLocation_state');
      if (stateInput && !stateInput.value) {
        stateInput.value = stateVal;
        qState.answers.clientLocation.state = stateVal;
      }
      
      const resultEl = document.getElementById('clientLocationPincodeResult');
      if (resultEl) {
        resultEl.innerHTML = `
          <div style="font-size: 13px; color: #4CAF50; margin-top: 6px;">
            📍 ${area}, ${city}, ${stateVal}
          </div>`;
      }
      
      checkCanProceed();
    } else {
      const resultEl = document.getElementById('clientLocationPincodeResult');
      if (resultEl) {
        resultEl.innerHTML = `
          <div style="font-size: 13px; color: #e74c3c; margin-top: 6px;">Invalid pincode</div>`;
      }
    }
  } catch (err) {
    console.error('Client location pincode lookup error:', err);
  }
}
// ─── EXPERT SEARCH AUTOCOMPLETE ───
const SEARCH_SUGGESTIONS = {
  services: WI_SERVICES.list.map(s => ({ label: s.label, value: s.value, type: 'service' }))
};

let searchTimeout = null;
let landingLocationTimeout = null;

function handleExpertSearch(value) {
  clearTimeout(searchTimeout);
  hideSearchSuggestions();

  if (!value) {
    // User cleared the box — debounce the reload too
    searchTimeout = setTimeout(() => loadExperts(), 300);
    return;
  }

  if (value.length < 2) return; // wait for at least 2 chars

  showSearchSuggestions(value);
  searchTimeout = setTimeout(() => {
    loadExperts({ location: value });
  }, 500);
}

function showSearchSuggestions(value) {
  const el = document.getElementById('searchSuggestions');
  if (!el) return;
  const lower = value.toLowerCase();
  const suggestions = [];

  SEARCH_SUGGESTIONS.services.forEach(s => {
    if (s.label.toLowerCase().includes(lower)) suggestions.push(s);
  });

  const cities = [...new Set(
    (state.experts || []).map(e => e.location?.city || e.profile?.city).filter(Boolean)
  )];
  cities.forEach(city => {
    if (city.toLowerCase().includes(lower))
      suggestions.push({ label: city, value: city, type: 'city' });
  });

  const pincodes = [...new Set(
    (state.experts || []).map(e => e.location?.pincode || e.profile?.pincode).filter(Boolean)
  )];
  pincodes.forEach(pin => {
    if (pin.includes(value))
      suggestions.push({ label: pin, value: pin, type: 'pincode' });
  });

  if (!suggestions.length) { hideSearchSuggestions(); return; }

  const icons = { service: '🔧', city: '🏙️', pincode: '📍' };
  const labels = { service: 'Service', city: 'City', pincode: 'Pincode' };

  el.innerHTML = suggestions.slice(0, 6).map(s => `
    <div onclick="selectSearchSuggestion('${s.value}','${s.type}')"
      style="padding:12px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border);"
      onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='transparent'">
      <span style="font-size:18px;">${icons[s.type]}</span>
      <div>
        <div style="font-size:14px;font-weight:600;">${s.label}</div>
        <div style="font-size:11px;color:#888;">${labels[s.type]}</div>
      </div>
    </div>
  `).join('');
  el.style.display = 'block';
}

function selectSearchSuggestion(value, type) {
  const input = document.getElementById('expertSearchInput');
  if (input) input.value = value;
  hideSearchSuggestions();
  if (type === 'service') {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-service="${value}"]`)?.classList.add('active');
    loadExperts({ service: value });
  } else {
    loadExperts({ location: value });
  }
}

function hideSearchSuggestions() {
  const el = document.getElementById('searchSuggestions');
  if (el) el.style.display = 'none';
}
// ─── LANDING SEARCH ───
function escapeLandingSuggestion(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function landingSuggestionRow(item, handlerName) {
  return '<div onmousedown="' + handlerName + '(\'' + escapeLandingSuggestion(item.value) + '\',\'' + escapeLandingSuggestion(item.type) + '\',\'' + escapeLandingSuggestion(item.label) + '\')" ' +
    'style="padding:11px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border);">' +
      '<span style="font-size:16px;">' + (item.icon || '') + '</span>' +
      '<div><div style="font-size:14px;font-weight:700;color:var(--text);">' + item.label + '</div>' +
      '<div style="font-size:11px;color:var(--text-muted);">' + item.typeLabel + '</div></div>' +
    '</div>';
}

function getLandingServiceList() {
  if (typeof WI_SERVICES !== 'undefined' && Array.isArray(WI_SERVICES.list)) return WI_SERVICES.list;
  if (typeof SEARCH_SUGGESTIONS !== 'undefined' && Array.isArray(SEARCH_SUGGESTIONS.services)) return SEARCH_SUGGESTIONS.services;
  return [];
}

function showLandingServiceSuggestions(value) {
  const el = document.getElementById('landingServiceSuggestions');
  if (!el) return;
  const input = document.getElementById('landingServiceInput');
  if (input) delete input.dataset.service;
  const lower = String(value || '').trim().toLowerCase();
  const items = getLandingServiceList()
    .filter(s => !lower || s.label.toLowerCase().includes(lower) || String(s.value).includes(lower))
    .slice(0, 6)
    .map(s => ({ label: s.label, value: s.value, type: 'service', typeLabel: 'Service', icon: '-' }));
  if (!items.length) { el.style.display = 'none'; return; }
  el.innerHTML = items.map(item => landingSuggestionRow(item, 'selectLandingServiceSuggestion')).join('');
  el.style.display = 'block';
}

function selectLandingServiceSuggestion(value, type, label) {
  const input = document.getElementById('landingServiceInput');
  if (input) {
    input.value = label || value;
    input.dataset.service = value;
  }
  const el = document.getElementById('landingServiceSuggestions');
  if (el) el.style.display = 'none';
}

function handleLandingLocationInput(value) {
  clearTimeout(landingLocationTimeout);
  landingLocationTimeout = setTimeout(() => loadLandingLocationSuggestions(value || ''), 180);
}

async function loadLandingLocationSuggestions(value) {
  const el = document.getElementById('landingLocationSuggestions');
  if (!el) return;
  try {
    const q = encodeURIComponent(String(value || '').trim());
    const res = await fetch(API_URL + '/users/location-suggestions?q=' + q);
    const data = await res.json();
    const items = (data.suggestions || []).slice(0, 6).map(s => ({
      label: s.label,
      value: s.value,
      type: s.type,
      typeLabel: s.type === 'pincode' ? 'Pincode' : 'City',
      icon: s.type === 'pincode' ? '#' : '-'
    }));
    if (!items.length) { el.style.display = 'none'; return; }
    el.innerHTML = items.map(item => landingSuggestionRow(item, 'selectLandingLocationSuggestion')).join('');
    el.style.display = 'block';
  } catch (err) {
    el.style.display = 'none';
  }
}

function selectLandingLocationSuggestion(value, type, label) {
  const input = document.getElementById('landingLocationInput');
  if (input) input.value = value || label;
  const el = document.getElementById('landingLocationSuggestions');
  if (el) el.style.display = 'none';
}

function initLandingSearchSuggestions() {
  const serviceInput = document.getElementById('landingServiceInput');
  const locationInput = document.getElementById('landingLocationInput');

  if (serviceInput && !serviceInput.dataset.suggestionsBound) {
    serviceInput.dataset.suggestionsBound = '1';
    serviceInput.addEventListener('focus', () => showLandingServiceSuggestions(serviceInput.value));
    serviceInput.addEventListener('input', () => showLandingServiceSuggestions(serviceInput.value));
  }

  if (locationInput && !locationInput.dataset.suggestionsBound) {
    locationInput.dataset.suggestionsBound = '1';
    locationInput.addEventListener('focus', () => handleLandingLocationInput(locationInput.value));
    locationInput.addEventListener('input', () => handleLandingLocationInput(locationInput.value));
  }
}

window.showLandingServiceSuggestions = showLandingServiceSuggestions;
window.selectLandingServiceSuggestion = selectLandingServiceSuggestion;
window.handleLandingLocationInput = handleLandingLocationInput;
window.selectLandingLocationSuggestion = selectLandingLocationSuggestion;
document.addEventListener('DOMContentLoaded', initLandingSearchSuggestions);
window.addEventListener('workindex:ready', initLandingSearchSuggestions);
setTimeout(initLandingSearchSuggestions, 0);

function landingSearch() {
  const serviceInput = document.getElementById('landingServiceInput');
  const service = serviceInput?.value.trim().toLowerCase();
  const location = document.getElementById('landingLocationInput')?.value.trim();

  const serviceMap = WI_SERVICES.searchAliases;
  const mappedService = serviceInput?.dataset.service || serviceMap[service] || null;

  // Store so findProfessionals page can pick it up
  state.pendingSearch = { service: mappedService, location: location || null };

  showPage('findProfessionals');
}
// ═══════════════════════════════════════════════════════════
//  USER SUPPORT TICKET SYSTEM
// ═══════════════════════════════════════════════════════════

var _tkUserSelectedIssue = null;

var USER_TICKET_CATEGORIES = {
  expert: [
    { group: '🔐 Account & Login Issues', items: [
      'Unable to login',
      'Forgot password / OTP not received',
      'Account locked or suspended',
      'Change my phone number or email',
      'Delete my account',
      'Profile update not saving'
    ]},
    { group: '💳 Credits & Refunds', items: [
      'Spent credits on fake or spam request',
      'Spent credits but client never responded',
      'I was charged credits incorrectly',
      'Credits deducted but approach was not submitted',
      'Credits purchased but not added to my account',
      'Payment failed but amount deducted from bank',
      'I want a refund for unused credits',
      'I need a receipt or invoice for my credit purchase'
    ]},
    { group: '📋 My Profile & Visibility', items: [
      'My profile is not showing in search results',
      'My services are not listed correctly',
      'Profile photo or documents not uploading',
      'My KYC verification is stuck or rejected',
      'My approval status has not been updated',
      'My rating or review count is showing wrong'
    ]},
    { group: '💬 Client Interaction Issues', items: [
      'Client is not responding after I submitted an approach',
      'Client behaviour was rude or unprofessional',
      'Client asked me to work outside the platform',
      'Client posted fake or misleading requirements',
      'I want to report a client',
      'Client threatened or harassed me'
    ]},
    { group: '⚖️ Dispute & Resolution', items: [
      'Client is disputing work that was completed',
      'Client left a false or unfair review',
      'I want to dispute a decision made by admin',
      'Client filed a complaint against me unfairly'
    ]},
    { group: '⭐ Reviews & Ratings', items: [
      'A fake or unfair review was posted on my profile',
      'My overall rating seems incorrect',
      'Want to respond to a review'
    ]},
    { group: '🛡️ Privacy & Safety', items: [
      'A client shared my contact details without consent',
      'I am receiving unwanted contact from a client',
      'Report harassment or threatening behaviour',
      'Request to delete all my data (DPDP Act)'
    ]},
    { group: '⚙️ Technical Issues', items: [
      'App or website not loading',
      'Page showing an error',
      'Chat messages not sending or receiving',
      'Documents or files not uploading',
      'Notifications not working',
      'A feature is not working correctly',
      'Bug report'
    ]},
    { group: '❓ General Support', items: [
      'I need help understanding how credits work',
      'I have a question about how approaches work',
      'I want to give feedback or a suggestion',
      'Other issue not listed above'
    ]}
  ],
  client: [
    { group: '🔐 Account & Login Issues', items: [
      'Unable to login',
      'Forgot password / OTP not received',
      'Account locked or suspended',
      'Change my phone number or email',
      'Delete my account',
      'Profile update not saving'
    ]},
    { group: '📋 My Requests & Posts', items: [
      'Unable to post a request',
      'My request is not visible to experts',
      'Want to edit or cancel my request',
      'Request was closed without my approval',
      'Request expired without a response',
      'I want to reopen a closed request',
      'Wrong service category selected',
      'Duplicate request created by mistake',
      'Request marked completed incorrectly',
      'Too many spam responses on my request'
    ]},
    { group: '💬 Expert Interaction Issues', items: [
      'Expert is not responding after I accepted',
      'Expert behaviour was rude or unprofessional',
      'Expert asked for payment outside the platform',
      'Expert provided wrong or misleading information',
      'Expert approach was misleading',
      'Fake or fraudulent expert profile',
      'Expert did not deliver what was promised',
      'I want to report an expert'
    ]},
    { group: '💰 Payment & Billing Issues', items: [
      'Payment failed but amount was deducted from bank',
      'Payment went through but credits not added',
      'I was charged the wrong amount',
      'I need a receipt or invoice for my payment',
      'Payment method not working',
      'I want a refund for a failed transaction'
    ]},
    { group: '⚖️ Dispute & Resolution', items: [
      'Work quality was not as agreed',
      'Expert did not complete the service',
      'I want to dispute a completed service',
      'Expert is blackmailing or threatening me',
      'Fraudulent activity by expert'
    ]},
    { group: '⭐ Reviews & Ratings', items: [
      'Unable to submit a review',
      'I want to edit or remove my review',
      'Fake review was posted about me by an expert',
      'Rating shown is incorrect'
    ]},
    { group: '🛡️ Privacy & Safety', items: [
      'My personal data was shared without consent',
      'I am receiving unwanted contact from an expert',
      'Expert shared my contact details without consent',
      'Report harassment or threatening behaviour',
      'Request to delete all my data (DPDP Act)'
    ]},
    { group: '⚙️ Technical Issues', items: [
      'App or website not loading',
      'Page showing an error',
      'Chat messages not sending or receiving',
      'Documents or files not uploading',
      'Notifications not working',
      'A feature is not working correctly',
      'Bug report',
      'Mobile app issue'
    ]},
    { group: '❓ General Support', items: [
      'I need help understanding how WorkIndex works',
      'I have a question about pricing or credits',
      'I want to give feedback or a suggestion',
      'Other issue not listed above'
    ]}
  ]
};

function openTicketModal() {
  _tkUserSelectedIssue = null;
  var role = state.user && state.user.role === 'expert' ? 'expert' : 'client';
  var cats = USER_TICKET_CATEGORIES[role] || USER_TICKET_CATEGORIES.client;

  // Build category list
  var html = '';
  cats.forEach(function(cat) {
    html += '<div style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; padding:10px 4px 6px;">' + cat.group + '</div>';
    cat.items.forEach(function(item) {
      html += '<div class="tk-user-item" onclick="tkUserSelectIssue(this, \'' + item.replace(/'/g, "\\'") + '\')" style="padding:12px 14px; border:1.5px solid var(--border); border-radius:10px; cursor:pointer; font-size:14px; font-weight:500; color:var(--text); margin-bottom:6px; transition:all 0.2s;">' + item + '</div>';
    });
  });

  document.getElementById('tkUserCatList').innerHTML = html;
  document.getElementById('tkUserStep1').style.display = 'block';
  document.getElementById('tkUserStep2').style.display = 'none';
  document.getElementById('ticketModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

var CREDIT_REFUND_TRIGGERS = [
  'Spent credits on fake or spam request',
  'Spent credits but client never responded',
  'I was charged credits incorrectly',
  'Credits deducted but approach was not submitted'
];

function tkUserSelectIssue(el, issue) {
  _tkUserSelectedIssue = issue;
  document.getElementById('tkUserSelectedCat').textContent = issue;
  document.getElementById('tkUserDescription').value = '';
  document.getElementById('tkUserDescription').placeholder = 'Describe your issue: "' + issue + '"...';
  document.getElementById('tkUserStep1').style.display = 'none';
  document.getElementById('tkUserStep2').style.display = 'block';

  // Remove any previous approach selector
  var existingSelector = document.getElementById('tkApproachSelector');
  if (existingSelector) existingSelector.remove();

  // Show approach selector for credit refund issues (experts only)
  var isRefundIssue = CREDIT_REFUND_TRIGGERS.indexOf(issue) >= 0;
  if (isRefundIssue && state.user && state.user.role === 'expert') {
    var step2 = document.getElementById('tkUserStep2');
    var selectorDiv = document.createElement('div');
    selectorDiv.id = 'tkApproachSelector';
    selectorDiv.style.cssText = 'margin-bottom:14px;';
    selectorDiv.innerHTML =
      '<label style="display:block;font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;font-weight:700;margin-bottom:8px;">Select Approach for Refund</label>' +
      '<div id="tkApproachList" style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;border:1.5px solid var(--border);border-radius:10px;padding:8px;">' +
        '<div style="font-size:13px;color:var(--text-muted);padding:8px;text-align:center;">Loading your approaches...</div>' +
      '</div>' +
      '<div id="tkSelectedApproach" style="display:none;margin-top:8px;padding:10px 12px;background:rgba(252,128,25,0.08);border:1px solid rgba(252,128,25,0.25);border-radius:8px;font-size:12px;color:var(--primary);line-height:1.5;"></div>';

    // Insert before description field
    var descWrapper = document.getElementById('tkUserDescription');
    if (descWrapper && descWrapper.parentNode) {
      descWrapper.parentNode.insertBefore(selectorDiv, descWrapper);
    } else if (step2) {
      step2.insertBefore(selectorDiv, step2.firstChild);
    }

    // Fetch approaches AND existing tickets in parallel
    Promise.all([
      fetch(API_URL + '/approaches', { headers: { 'Authorization': 'Bearer ' + state.token } }).then(function(r) { return r.json(); }),
      fetch(API_URL + '/users/tickets', { headers: { 'Authorization': 'Bearer ' + state.token } }).then(function(r) { return r.json(); })
    ])
    .then(function(results) {
      var d = results[0];
      var ticketData = results[1];

      // Collect approachIds already submitted for refund (any status except open)
      var usedApproachIds = {};
      (ticketData.tickets || []).forEach(function(t) {
        if (t.isExpertRefund && t.relatedApproachId) {
          usedApproachIds[String(t.relatedApproachId)] = {
            status: t.status,
            decision: t.decision || ''
          };
        }
      });

      var approaches = (d.approaches || []).filter(function(a) {
        if (!a.creditsSpent || a.creditsSpent <= 0) return false;
        var existing = usedApproachIds[String(a._id)];
        if (!existing) return true;
        // Block if pending admin review — don't allow duplicate submission
        if (existing.status === 'pending_review') return false;
        // Block if approved — credits already returned
        var dec = (existing.decision || '').toUpperCase();
if (dec === 'REFUND_APPROVED' || dec === 'REFUND_APPROVED') return false;
if (dec === 'NOT_ELIGIBLE') return false; // also block rejected — no retry
        // Allow if rejected (not_eligible) or resolved without approval — let them retry
        return true;
      });
       
      var listEl = document.getElementById('tkApproachList');
      if (!listEl) return;
      if (!approaches.length) {
        listEl.innerHTML = '<div style="font-size:13px;color:var(--text-muted);padding:8px;text-align:center;">No approaches with credit spend found.</div>';
        return;
      }
      listEl.innerHTML = approaches.map(function(a) {
        var reqTitle = (a.request && a.request.title) ? a.request.title : 'Unknown Request';
        var clientName = (a.client && a.client.name) ? a.client.name : 'Client';
        var date = a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '';
        return '<div class="tk-approach-option" data-approach-id="' + a._id + '" data-credits="' + (a.creditsSpent||0) + '" data-title="' + encodeURIComponent(reqTitle) + '" data-client="' + encodeURIComponent(clientName) + '" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;transition:border-color .15s;">' +
          '<div style="flex:1;">' +
            '<div style="font-size:13px;font-weight:600;color:var(--text);">' + reqTitle + '</div>' +
            '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + clientName + ' · ' + date + '</div>' +
          '</div>' +
          '<div style="font-size:13px;font-weight:700;color:var(--primary);white-space:nowrap;">' + (a.creditsSpent||0) + ' cr</div>' +
          '<div style="width:18px;height:18px;border-radius:50%;border:2px solid var(--border);flex-shrink:0;transition:all .15s;" class="tk-approach-radio"></div>' +
        '</div>';
      }).join('');

      // Wire selection
      listEl.querySelectorAll('.tk-approach-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
          listEl.querySelectorAll('.tk-approach-option').forEach(function(o) {
            o.style.borderColor = 'var(--border)';
            o.querySelector('.tk-approach-radio').style.background = 'transparent';
            o.querySelector('.tk-approach-radio').style.borderColor = 'var(--border)';
            delete o.dataset.selected;
          });
          this.style.borderColor = 'var(--primary)';
          this.querySelector('.tk-approach-radio').style.background = 'var(--primary)';
          this.querySelector('.tk-approach-radio').style.borderColor = 'var(--primary)';
          this.dataset.selected = 'true';

          var credits = this.dataset.credits;
          var title = decodeURIComponent(this.dataset.title);
          var client = decodeURIComponent(this.dataset.client);
          var selectedEl = document.getElementById('tkSelectedApproach');
          if (selectedEl) {
            selectedEl.style.display = 'block';
            selectedEl.innerHTML = '✓ Selected: <strong>' + title + '</strong> · ' + client + ' · <strong>' + credits + ' credits</strong> will be requested for refund';
          }
        });
      });
    })
    .catch(function() {
      var listEl = document.getElementById('tkApproachList');
      if (listEl) listEl.innerHTML = '<div style="font-size:13px;color:var(--text-muted);padding:8px;text-align:center;">Could not load approaches.</div>';
    });
  }
}

function tkUserGoBack() {
  _tkUserSelectedIssue = null;
  document.getElementById('tkUserStep1').style.display = 'block';
  document.getElementById('tkUserStep2').style.display = 'none';
}

function closeTicketModal() {
  document.getElementById('ticketModal').style.display = 'none';
  document.body.style.overflow = '';
  _tkUserSelectedIssue = null;
}

async function submitUserTicket() {
  if (!_tkUserSelectedIssue) { showToast('Please select an issue category', 'error'); return; }

  var description = document.getElementById('tkUserDescription').value.trim();
  var priority = document.getElementById('tkUserPriority').value;

  var btn = document.getElementById('tkUserSubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    var selectedApproachEl = document.querySelector('.tk-approach-option[data-selected="true"]');
    var approachId = selectedApproachEl ? selectedApproachEl.dataset.approachId : null;
    var approachCredits = selectedApproachEl ? parseInt(selectedApproachEl.dataset.credits) : 0;

    var payload = {
      subject: _tkUserSelectedIssue,
      issueType: _tkUserSelectedIssue,
      description: description || _tkUserSelectedIssue,
      priority: priority
    };
    if (approachId) {
      payload.relatedApproachId = approachId;
      payload.eligibleCredits = approachCredits;
      payload.isExpertRefund = true;
    }

    var res = await fetch(API_URL + '/users/tickets', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + state.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
     
    var data = await res.json();
    btn.disabled = false;
    btn.textContent = '🎫 Submit Ticket';

    if (data.success) {
      closeTicketModal();
      showToast('Ticket raised successfully! We\'ll get back to you soon.', 'success');
    } else {
      showToast(data.message || 'Failed to raise ticket', 'error');
    }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = '🎫 Submit Ticket';
    showToast('Network error. Please try again.', 'error');
  }
}
function renderFollowUpButton(ticket) {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return '';

  var createdMs = ticket.createdAt ? new Date(ticket.createdAt).getTime() : 0;
  var hoursSinceCreated = (Date.now() - createdMs) / (1000 * 60 * 60);
  if (hoursSinceCreated < 48) {
    var hoursLeft = Math.ceil(48 - hoursSinceCreated);
    return '<div style="margin-top:10px; padding:8px 12px; background:var(--bg-gray); border-radius:8px; font-size:12px; color:var(--text-muted); text-align:center;">⏳ Follow Up available in ' + hoursLeft + ' hour(s)</div>';
  }

  // Check 24hr cooldown since last follow up
  if (ticket.lastFollowUp) {
    var hoursSinceFollowUp = (Date.now() - new Date(ticket.lastFollowUp).getTime()) / (1000 * 60 * 60);
    if (hoursSinceFollowUp < 24) {
      var hoursLeft2 = Math.ceil(24 - hoursSinceFollowUp);
      return '<div style="margin-top:10px; padding:8px 12px; background:var(--bg-gray); border-radius:8px; font-size:12px; color:var(--text-muted); text-align:center;">⏳ Next Follow Up in ' + hoursLeft2 + ' hour(s)</div>';
    }
  }

  return '<button onclick="sendTicketFollowUp(\'' + ticket._id + '\', this)" style="width:100%; margin-top:10px; padding:10px; border:1.5px solid #f59e0b; border-radius:8px; background:rgba(245,158,11,0.08); color:#f59e0b; font-size:13px; font-weight:700; cursor:pointer;">🔔 Follow Up</button>';
}

async function sendTicketFollowUp(ticketId, btn) {
  if (!confirm('Send a follow up to admin? This will escalate your ticket.')) return;
  btn.disabled = true;
  btn.textContent = 'Sending...';
  try {
    var res = await fetch(API_URL + '/users/tickets/' + ticketId + '/followup', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + state.token }
    });
    var data = await res.json();
    if (data.success) {
      showToast('Follow up sent! Admin has been notified.', 'success');
      loadMyTickets();
    } else {
      showToast(data.message || 'Could not send follow up', 'error');
      btn.disabled = false;
      btn.textContent = '🔔 Follow Up';
    }
  } catch (err) {
    showToast('Network error', 'error');
    btn.disabled = false;
    btn.textContent = '🔔 Follow Up';
  }
}

async function loadMyTickets() {
  var container = document.getElementById('myTicketsList');
  if (!container) return;

  try {
    var res = await fetch(API_URL + '/users/tickets', {
      headers: { 'Authorization': 'Bearer ' + state.token }
    });
    var data = await res.json();

    if (!data.success || !data.tickets || !data.tickets.length) {
      container.innerHTML = '<div style="text-align:center; padding:40px;"><div style="font-size:48px; margin-bottom:16px;">🎫</div><h3 style="color:var(--text);">No tickets yet</h3><p style="color:var(--text-muted); margin-top:8px;">Raise a ticket if you need help</p><button class="btn-primary" style="margin-top:20px; padding:12px 24px;" onclick="openTicketModal()">+ Raise a Ticket</button></div>';
      return;
    }

    var statusColor = { open: '#3b82f6', pending_review: '#f59e0b', resolved: '#22c55e', closed: '#6b7280' };
    var statusLabel = { open: 'Open', pending_review: 'Under Review', resolved: 'Resolved', closed: 'Closed' };

window._tkCache = data.tickets;
    container.innerHTML = data.tickets.map(function(t) {
      var sc = statusColor[t.status] || '#6b7280';
      var sl = statusLabel[t.status] || t.status;
      var date = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '-';
      var tkIdx = data.tickets.indexOf(t);
      return '<div onclick="openMyTicketDetail(_tkCache[' + tkIdx + '])" style="background:var(--bg); border:1.5px solid var(--border); border-radius:14px; padding:16px; margin-bottom:12px; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'var(--border)\'">' +        '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">' +
          '<div style="font-size:15px; font-weight:700; color:var(--text); flex:1; margin-right:12px;">' + (t.issueType || t.subject || 'Support Ticket') + '</div>' +
          '<span style="padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700; background:' + sc + '20; color:' + sc + ';">' + sl + '</span>' +
        '</div>' +
        (t.description && t.description !== t.subject ? '<p style="font-size:13px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;">' + t.description.substring(0, 80) + (t.description.length > 80 ? '...' : '') + '</p>' : '') +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span style="font-size:12px; color:var(--text-muted);">' + date + '</span>' +
          (t.adminNote ? '<span style="font-size:12px; color:#22c55e;">💬 Admin replied</span>' : '') +
        '</div>' +
      '</div>';
    }).join('');
  } catch (err) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">Failed to load tickets</div>';
  }
}

function openMyTicketDetail(ticket) {
  var existing = document.getElementById('myTicketDetailOverlay');
  if (existing) existing.remove();

  var statusColor = { open: '#3b82f6', pending_review: '#f59e0b', resolved: '#22c55e', closed: '#6b7280', escalated: '#f97316' };
  var statusLabel = { open: 'Open', pending_review: 'Under Review', resolved: 'Resolved', closed: 'Closed', escalated: 'Escalated' };
  var sc = statusColor[ticket.status] || '#6b7280';
  var sl = statusLabel[ticket.status] || ticket.status;
  var date = ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '-';
  var priorityMap = { low: '🟢 Low', medium: '🟡 Medium', high: '🔴 High' };

  var overlay = document.createElement('div');
  overlay.id = 'myTicketDetailOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:2000;overflow-y:auto;';

  overlay.innerHTML =
    '<div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px;position:sticky;top:0;background:var(--bg);z-index:1;">' +
      '<button onclick="document.getElementById(\'myTicketDetailOverlay\').remove()" style="width:36px;height:36px;border:none;background:var(--bg-gray);border-radius:50%;font-size:18px;cursor:pointer;color:var(--text);">←</button>' +
      '<div>' +
        '<h2 style="font-size:17px;font-weight:800;color:var(--text);margin:0 0 2px;">Ticket Detail</h2>' +
        '<p style="font-size:12px;color:var(--text-muted);margin:0;">' + date + '</p>' +
      '</div>' +
    '</div>' +

    '<div style="padding:20px;max-width:600px;margin:0 auto;">' +

      '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">' +
        '<span style="padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700;background:' + sc + '20;color:' + sc + ';">' + sl + '</span>' +
        '<span style="padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600;background:var(--bg-gray);color:var(--text-muted);">' + (priorityMap[ticket.priority] || '🟡 Medium') + '</span>' +
        (ticket.isExpertRefund ? '<span style="padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600;background:rgba(252,128,25,0.1);color:var(--primary);">💳 Credit Refund</span>' : '') +
      '</div>' +

      '<div style="background:var(--bg-gray);border-radius:12px;padding:16px;margin-bottom:14px;">' +
        '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">Issue</div>' +
        '<div style="font-size:16px;font-weight:700;color:var(--text);">' + (ticket.issueType || ticket.subject || '—') + '</div>' +
      '</div>' +

      (ticket.description && ticket.description !== ticket.subject ?
        '<div style="background:var(--bg-gray);border-radius:12px;padding:16px;margin-bottom:14px;">' +
          '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">Your Description</div>' +
          '<div style="font-size:14px;color:var(--text);line-height:1.7;">' + ticket.description + '</div>' +
        '</div>' : '') +

      (ticket.isExpertRefund && ticket.eligibleCredits ?
        '<div style="background:rgba(252,128,25,0.06);border:1px solid rgba(252,128,25,0.2);border-radius:12px;padding:16px;margin-bottom:14px;">' +
          '<div style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">Credit Refund Requested</div>' +
          '<div style="font-size:22px;font-weight:800;color:var(--primary);">' + ticket.eligibleCredits + ' credits</div>' +
          (ticket.creditsRefunded ? '<div style="font-size:13px;color:#22c55e;margin-top:4px;">✅ ' + ticket.creditsRefunded + ' credits refunded</div>' : '') +
        '</div>' : '') +

      (ticket.adminNote ?
        '<div style="background:rgba(34,197,94,0.06);border:1.5px solid rgba(34,197,94,0.2);border-radius:12px;padding:16px;margin-bottom:14px;">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' +
            '<span style="font-size:16px;">💬</span>' +
            '<div style="font-size:11px;font-weight:700;color:#22c55e;text-transform:uppercase;letter-spacing:.07em;">Admin Response</div>' +
          '</div>' +
          '<div style="font-size:14px;color:var(--text);line-height:1.7;">' + ticket.adminNote + '</div>' +
        '</div>' : '') +

      (ticket.decision && ticket.decision !== 'Pending' ?
        '<div style="background:var(--bg-gray);border-radius:12px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;">' +
          '<span style="font-size:13px;color:var(--text-muted);">Decision</span>' +
          '<span style="font-size:13px;font-weight:700;color:var(--text);">' + ticket.decision.replace(/_/g,' ') + '</span>' +
        '</div>' : '') +

      renderFollowUpButton(ticket) +

    '</div>';

  document.body.appendChild(overlay);
}

// Close modal when clicking backdrop
document.addEventListener('DOMContentLoaded', function() {
  var ticketModalEl = document.getElementById('ticketModal');
  if (ticketModalEl) {
    ticketModalEl.addEventListener('click', function(e) {
      if (e.target === this) closeTicketModal();
    });
  }
});

// ═══════════════════════════════════════════════════════════
//  CLIENT EXPLORE TAB — HIRE / SHORTLIST / BLOCK
// ═══════════════════════════════════════════════════════════

var _clientExploreAll = [];       // all loaded experts
var _clientShortlisted = [];      // shortlisted expert IDs
var _clientBlocked = [];          // blocked expert IDs (local)
var _blockTargetId = null;
var _blockTargetName = null;
var _exploreFilter = 'all';

// ─── CLIENT INVITES TAB ───
async function loadClientInvites() {
  const container = document.getElementById('clientInvitesList');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner"></div></div>';

  try {
    const res = await fetch(`${API_URL}/users/my-invites`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (!data.success || !data.invites || !data.invites.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📨</div>
          <h3 class="empty-title">No invites sent yet</h3>
          <p class="empty-text">Hire an expert from All Experts — they'll appear here with their response status</p>
        </div>`;
      return;
    }

    container.innerHTML = data.invites.map(inv => {
      const status = inv.unlocked ? 'accepted' : 'pending';
      const statusColor = inv.unlocked ? '#22c55e' : '#f59e0b';
      const statusBg = inv.unlocked ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)';
      const statusLabel = inv.unlocked ? '✅ Accepted' : '⏳ Pending';
      const expert = inv.expert || {};

      return `
        <div style="background:var(--bg); border:1.5px solid var(--border); border-radius:14px; padding:16px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
            <div style="width:48px; height:48px; border-radius:50%; background:var(--primary); color:#fff; font-size:18px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden;">
              ${expert.profilePhoto ? `<img src="${expert.profilePhoto}" style="width:100%;height:100%;object-fit:cover;">` : (expert.name || 'E').charAt(0).toUpperCase()}
            </div>
            <div style="flex:1;">
              <div style="font-size:15px; font-weight:700; color:var(--text);">${expert.name || 'Expert'}</div>
              <div style="font-size:12px; color:var(--text-muted);">${expert.specialization || ''}</div>
            </div>
            <span style="padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; background:${statusBg}; color:${statusColor};">${statusLabel}</span>
          </div>
          <div style="font-size:12px; color:var(--text-muted); padding-top:8px; border-top:1px solid var(--border);">
            📅 Sent ${formatDate(inv.createdAt)}
            <span style="margin-left:12px; color:${statusColor};">
              ${inv.unlocked ? 'Expert has viewed your contact details' : 'Waiting for expert to respond'}
            </span>
          </div>
          ${inv.unlocked && !inv.completed ? `
  <button onclick="confirmInviteComplete('${inv._id}', '${inv.expert?._id || ''}', '${(inv.expert?.name || 'Expert').replace(/'/g, '')}')"
    style="width:100%; margin-top:10px; padding:10px; border:1.5px solid #4CAF50; border-radius:10px; background:transparent; color:#4CAF50; font-size:13px; font-weight:600; cursor:pointer;">
    ✓ Service Received?
  </button>
` : inv.completed ? `
  <div style="width:100%; margin-top:10px; padding:10px; border-radius:10px; background:#f0fff4; color:#4CAF50; font-size:13px; font-weight:600; text-align:center;">
    ✅ Service Completed
  </div>
` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Failed to load invites</div>';
  }
}
// ─── LOAD EXPLORE PAGE ───
async function loadClientExplorePage() {
  const grid = document.getElementById('clientExploreGrid');
  const empty = document.getElementById('clientExploreEmpty');
  if (!grid) return;
  
  grid.innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner"></div></div>';
  if (empty) empty.style.display = 'none';
  
  try {
    // Load blocked list from localStorage (persisted locally)
    _clientBlocked = JSON.parse(localStorage.getItem('blockedExperts_' + state.user._id) || '[]');
    
    // Load shortlisted
    const slRes = await fetch(`${API_URL}/users/shortlisted`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const slData = await slRes.json();
    if (slData.success) {
      _clientShortlisted = (slData.experts || []).map(e => e._id || e);
    }
    
    // Load experts
    const res = await fetch(`${API_URL}/users/experts?limit=50`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    
    if (data.success) {
      // Filter out blocked
      _clientExploreAll = (data.experts || []).filter(e => 
        !_clientBlocked.includes(e._id)
      );
      renderClientExploreGrid(_clientExploreAll);
    }
  } catch (err) {
    console.error('Load explore error:', err);
    if (grid) grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Failed to load experts</div>';
  }
}

// ─── FILTER (all / shortlisted) ───
function filterClientExplore(filter) {
  _exploreFilter = filter;
  
  const allBtn = document.getElementById('exploreFilterAll');
  const slBtn = document.getElementById('exploreFilterShortlisted');
  const invBtn = document.getElementById('exploreFilterInvites');
  const searchBar = document.getElementById('exploreSearchBar');
  const grid = document.getElementById('clientExploreGrid');
  const empty = document.getElementById('clientExploreEmpty');
  const invPanel = document.getElementById('clientInvitesPanel');

  // Update button styles
  [
    { btn: allBtn, active: filter === 'all' },
    { btn: slBtn, active: filter === 'shortlisted' },
    { btn: invBtn, active: filter === 'invites' }
  ].forEach(({ btn, active }) => {
    if (!btn) return;
    btn.style.background = active ? 'var(--primary)' : 'transparent';
    btn.style.color = active ? '#fff' : 'var(--text)';
    btn.style.borderColor = active ? 'var(--primary)' : 'var(--border)';
  });

  if (filter === 'invites') {
    // Show invites panel, hide grid
    if (searchBar) searchBar.style.display = 'none';
    if (grid) grid.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (invPanel) invPanel.style.display = 'block';
    loadClientInvites();
  } else {
    // Show grid, hide invites
    if (searchBar) searchBar.style.display = 'flex';
    if (grid) grid.style.display = 'block';
    if (invPanel) invPanel.style.display = 'none';

    PAGINATION.clientExplore.page = 1;
    if (filter === 'shortlisted') {
      const shortlisted = _clientExploreAll.filter(e => _clientShortlisted.includes(e._id));
      renderClientExploreGrid(shortlisted);
    } else {
      renderClientExploreGrid(_clientExploreAll);
    }
  }
}

// ─── SEARCH ───
function searchClientExperts(value) {
  if (!value.trim()) {
    filterClientExplore(_exploreFilter);
    return;
  }
  const lower = value.toLowerCase();
  const filtered = _clientExploreAll.filter(e =>
    (e.name || '').toLowerCase().includes(lower) ||
    (e.specialization || '').toLowerCase().includes(lower) ||
    (e.profile?.specialization || '').toLowerCase().includes(lower) ||
    (e.location?.city || '').toLowerCase().includes(lower) ||
    (e.profile?.city || '').toLowerCase().includes(lower)
  );
  renderClientExploreGrid(filtered);
}

// ─── RENDER GRID ───
function renderClientExploreGrid(experts) {
  const grid = document.getElementById('clientExploreGrid');
  const empty = document.getElementById('clientExploreEmpty');
  if (!grid) return;
  
  if (!experts || !experts.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  // Store full list for pagination
  renderClientExploreGrid._currentList = experts;
  const items = paginate(experts, 'clientExplore');

  const svcColors = WI_SERVICES.colors;
  const serviceLabels = WI_SERVICES.labels;
   
  const availMap = {
    available: { dot: '#22c55e', label: 'Available' },
    busy:      { dot: '#ef4444', label: 'Busy' },
    away:      { dot: '#f59e0b', label: 'Away' }
  };

  grid.innerHTML = '<div class="client-expert-grid">' + items.map(expert => {
    const profile = expert.profile || {};
    const name = expert.name || 'Expert';
    const spec = profile.specialization || expert.specialization || 'Professional';
    const city = profile.city || expert.location?.city || '';
    const rating = expert.rating || 0;
    const reviews = expert.reviewCount || 0;
    const photo = expert.profilePhoto;
    const isShortlisted = _clientShortlisted.includes(expert._id);
    const bio = profile.bio || expert.bio || '';
    const services = expert.servicesOffered || profile.servicesOffered || [];
    const exp = expert.yearsOfExperience || profile.yearsOfExperience || profile.experience || '';
    const kycVerified = expert.kyc?.status === 'approved';
    const avail = availMap[expert.availability || 'available'];
    const primarySvc = services[0];
    const svcColor = svcColors[primarySvc] || '#FC8019';
    const initials = name.substring(0, 2).toUpperCase();

    return `
      <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:16px;overflow:hidden;transition:all 0.2s;display:flex;flex-direction:column;"
        onmouseover="this.style.borderColor='rgba(252,128,25,0.4)';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.transform='translateY(0)';this.style.boxShadow='none'">

        <!-- Colored top bar -->
        <div style="height:5px;background:linear-gradient(90deg,${svcColor},${svcColor}88);"></div>

        <!-- Body -->
        <div style="padding:16px;flex:1;display:flex;flex-direction:column;">

          <!-- Avatar + info row -->
          <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:10px;">
            <div style="width:52px;height:52px;border-radius:50%;background:${svcColor};color:#fff;font-size:17px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;">
              ${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;">` : initials}
              <span style="position:absolute;bottom:1px;right:1px;width:12px;height:12px;border-radius:50%;background:${avail.dot};border:2px solid var(--bg);"></span>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:2px;">
                <span style="font-size:15px;font-weight:700;color:var(--text);">${name}</span>
                ${kycVerified ? `<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px;background:rgba(34,197,94,0.1);color:#16a34a;flex-shrink:0;">✓ KYC</span>` : ''}
              </div>
              <div style="font-size:12px;font-weight:600;color:${svcColor};margin-bottom:3px;">${spec}</div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                ${rating ? `<span style="font-size:12px;font-weight:700;color:#f59e0b;">⭐ ${parseFloat(rating).toFixed(1)} <span style="color:var(--text-muted);font-weight:400;">(${reviews})</span></span>` : `<span style="font-size:12px;color:var(--text-muted);">No reviews</span>`}
                ${city ? `<span style="font-size:11px;color:var(--text-muted);">📍 ${city}</span>` : ''}
                ${exp ? `<span style="font-size:11px;color:var(--text-muted);">${exp}yr exp</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Bio -->
          ${bio ? `<p style="font-size:12.5px;color:var(--text-light);line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${bio}</p>` : ''}

          <!-- Service tags -->
          ${services.length ? `
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">
            ${services.slice(0, 3).map(s => `<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;background:${(svcColors[s]||'#FC8019')}14;color:${svcColors[s]||'#FC8019'};">${serviceLabels[s]||s}</span>`).join('')}
          </div>` : '<div style="flex:1;"></div>'}

          <!-- Action buttons -->
          <div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;margin-top:auto;">
            <button onclick="viewExpertProfile('${expert._id}', true)"
              style="padding:10px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;">
              View Profile
            </button>
            <button onclick="hireExpert('${expert._id}', '${name.replace(/'/g, '')}')"
              title="Hire this expert"
              style="width:40px;padding:10px 0;border:1.5px solid rgba(34,197,94,0.3);border-radius:10px;background:rgba(34,197,94,0.08);color:#16a34a;font-size:16px;cursor:pointer;transition:all 0.2s;"
              onmouseover="this.style.background='rgba(34,197,94,0.15)'"
              onmouseout="this.style.background='rgba(34,197,94,0.08)'">
              ✅
            </button>
            <button id="sl_${expert._id}" onclick="shortlistExpert('${expert._id}', '${name.replace(/'/g, '')}')"
              title="${isShortlisted ? 'Remove from shortlist' : 'Save expert'}"
              style="width:40px;padding:10px 0;border:1.5px solid ${isShortlisted ? 'rgba(239,68,68,0.3)' : 'var(--border)'};border-radius:10px;background:${isShortlisted ? 'rgba(239,68,68,0.08)' : 'transparent'};color:${isShortlisted ? '#ef4444' : 'var(--text-muted)'};font-size:16px;cursor:pointer;transition:all 0.2s;"
              onmouseover="this.style.borderColor='rgba(239,68,68,0.4)';this.style.color='#ef4444'"
              onmouseout="this.style.borderColor='${isShortlisted ? 'rgba(239,68,68,0.3)' : 'var(--border)'}';this.style.color='${isShortlisted ? '#ef4444' : 'var(--text-muted)'}'">
              ${isShortlisted ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('') + '</div>' + paginationControlsHTML(experts, 'clientExplore');
}
   
// ─── HIRE EXPERT ───
async function hireExpert(expertId, expertName) {
  if (isUserRestricted()) { showRestrictedToast(); return; } // ← ADD THIS
  
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1002;padding:20px;';
  modal.onclick = e => { if (e.target === modal) modal.remove(); };
  
  modal.innerHTML = `
    <div style="background:var(--bg);border-radius:16px;max-width:360px;width:100%;padding:28px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">Hire ${expertName}?</h3>
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:20px;line-height:1.5;">
        We'll notify this expert that you're interested in hiring them. They can spend credits to see your contact details.
      </p>
      <p style="font-size:13px;color:var(--text-muted);padding:10px;background:var(--bg-gray);border-radius:8px;margin-bottom:20px;">
        Your contact will show as:<br>
        <strong>📞 ${maskPhone(state.user.phone || '9999999999')}</strong><br>
        <strong>✉️ ${maskEmail(state.user.email || 'you@email.com')}</strong>
      </p>
      <div style="display:flex;gap:10px;">
        <button onclick="confirmHireExpert('${expertId}'); this.closest('[style*=fixed]').remove();"
          style="flex:1;padding:14px;background:#22c55e;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">
          ✅ Yes, Notify
        </button>
        <button onclick="this.closest('[style*=fixed]').remove()"
          style="flex:1;padding:14px;border:1.5px solid var(--border);border-radius:12px;background:transparent;color:var(--text);font-size:14px;font-weight:600;cursor:pointer;">
          Cancel
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function confirmHireExpert(expertId) {
  if (isUserRestricted()) { showRestrictedToast(); return; } // ← ADD THIS
  
  try {
    const res = await fetch(`${API_URL}/users/${expertId}/interest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'hire' })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Expert notified! They will reach out soon.', 'success');
    } else {
      showToast(data.message || 'Failed', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ─── SHORTLIST EXPERT ───
async function shortlistExpert(expertId, expertName) {
  try {
    const isCurrentlyShortlisted = _clientShortlisted.includes(expertId);
    
    const res = await fetch(`${API_URL}/users/${expertId}/interest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'shortlist' })
    });
    const data = await res.json();
    
    if (data.success) {
      if (isCurrentlyShortlisted) {
        _clientShortlisted = _clientShortlisted.filter(id => id !== expertId);
        showToast('Removed from shortlist', 'info');
      } else {
        _clientShortlisted.push(expertId);
        showToast(`${expertName} shortlisted!`, 'success');
      }
      // Re-render to update heart button
      filterClientExplore(_exploreFilter);
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ─── BLOCK / REPORT ───
function openBlockModal(expertId, expertName) {
  _blockTargetId = expertId;
  _blockTargetName = expertName;
  
  const modal = document.getElementById('blockReportModal');
  document.getElementById('blockModalName').textContent = expertName;
  
  // Show/hide reason box based on selection
  document.querySelectorAll('input[name="blockType"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const reasonBox = document.getElementById('blockReasonBox');
      if (reasonBox) reasonBox.style.display = this.value === 'report' ? 'block' : 'none';
    });
  });
  
  modal.style.display = 'flex';
}

function closeBlockModal() {
  document.getElementById('blockReportModal').style.display = 'none';
  _blockTargetId = null;
  _blockTargetName = null;
}

async function confirmBlock() {
  if (!_blockTargetId) return;
  
  const blockType = document.querySelector('input[name="blockType"]:checked')?.value || 'block';
  const reason = document.getElementById('blockReason')?.value || '';
  const isReport = blockType === 'report';
  
  try {
    const res = await fetch(`${API_URL}/users/${_blockTargetId}/block`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ report: isReport, reason })
    });
    const data = await res.json();
    
    if (data.success) {
      // Add to local blocked list
      _clientBlocked.push(_blockTargetId);
      localStorage.setItem('blockedExperts_' + state.user._id, JSON.stringify(_clientBlocked));
      
      // Remove from explore grid
      _clientExploreAll = _clientExploreAll.filter(e => e._id !== _blockTargetId);
      filterClientExplore(_exploreFilter);
      
      closeBlockModal();
      showToast(isReport ? 'Expert blocked and reported to admin' : 'Expert blocked', 'success');
    } else {
      showToast(data.message || 'Failed', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ─── MASK HELPERS ───
function maskPhone(phone) {
  const p = String(phone).replace(/\D/g, '');
  if (p.length < 4) return 'XXXXXXXXXX';
  return p.slice(0,2) + 'XXXXXX' + p.slice(-2);
}

function maskEmail(email) {
  const parts = String(email).split('@');
  if (parts.length < 2) return '****@****.com';
  return parts[0][0] + '****@' + parts[1];
}
// ─── UNLOCK CUSTOMER INTEREST ───
async function unlockInterest(notifId) {
  const btn = event.target;
  btn.disabled = true;
  btn.textContent = '⏳ Unlocking...';

  try {
    const res = await fetch(`${API_URL}/users/unlock-interest/${notifId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Unlocked! ${data.creditsSpent} credits spent. ${data.newBalance} remaining.`, 'success');
      // Update credits display
      if (state.user) {
        state.user.credits = data.newBalance;
        localStorage.setItem('user', JSON.stringify(state.user));
        document.querySelectorAll('.credit-display').forEach(el => {
          el.textContent = data.newBalance;
        });
      }
      // Reload to show full details
      loadMyApproaches();
    } else if (data.needCredits) {
      showToast(data.message, 'error');
      btn.disabled = false;
      btn.textContent = '🔓 Unlock for 5 Credits';
      // Open credit purchase modal
      setTimeout(() => openCreditModal(), 500);
    } else {
      showToast(data.message || 'Failed to unlock', 'error');
      btn.disabled = false;
      btn.textContent = '🔓 Unlock for 5 Credits';
    }
  } catch (err) {
    showToast('Network error', 'error');
    btn.disabled = false;
    btn.textContent = '🔓 Unlock for 5 Credits';
  }
}
// ─── VIEW DOCS FROM INTEREST UNLOCK ───
async function viewClientDocumentsFromInterest(clientId) {
  if (!clientId || clientId === 'undefined') { showToast('Client info not available', 'error'); return; }
  
  try {
    showToast('Loading documents...', 'info');
    
    const res = await fetch(`${API_URL}/documents/client/${clientId}/interest`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    
    if (!data.success) {
      showToast(data.message || 'Could not load documents', 'error');
      return;
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1001;padding:20px;';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    const docsHTML = data.documents && data.documents.length > 0 ? data.documents.map(doc => {
      const sizeKB = ((doc.fileSize || 0) / 1024).toFixed(1);
      const icon = doc.fileType === 'pdf' ? '📄' : doc.fileType === 'word' ? '📝' : doc.fileType === 'excel' ? '📊' : doc.fileType === 'image' ? '🖼️' : '📎';
      
      if (doc.hasAccess) {
        return `
          <div style="padding:16px;background:var(--bg-gray);border-radius:12px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:32px;">${icon}</span>
              <div style="flex:1;">
                <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:2px;">${doc.originalFileName}</div>
                <div style="font-size:13px;color:var(--text-muted);">${sizeKB} KB • ${(doc.fileType||'').toUpperCase()}</div>
                <div style="font-size:12px;color:#4CAF50;margin-top:2px;">✅ Access granted</div>
              </div>
              <button onclick="downloadDocument('${doc._id}')" style="padding:8px 16px;background:var(--primary);color:#fff;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;">Download</button>
            </div>
          </div>`;
      } else {
        return `
          <div style="padding:16px;background:var(--bg-gray);border-radius:12px;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:32px;filter:grayscale(1);opacity:0.5;">${icon}</span>
              <div style="flex:1;">
                <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:2px;">${doc.originalFileName}</div>
                <div style="font-size:13px;color:var(--text-muted);">${sizeKB} KB • ${(doc.fileType||'').toUpperCase()}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">🔒 Access required</div>
              </div>
              <button onclick="requestDocumentAccessFromInterest('${doc._id}', '${clientId}')" style="padding:8px 12px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">Request</button>
            </div>
          </div>`;
      }
    }).join('') : `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:48px;margin-bottom:16px;">📁</div>
        <h3 style="font-size:18px;font-weight:600;color:var(--text);margin-bottom:8px;">No documents yet</h3>
        <p style="font-size:14px;color:var(--text-muted);">Client hasn't uploaded any documents</p>
      </div>`;
    
    modal.innerHTML = `
      <div style="background:var(--bg);border-radius:16px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;padding:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:700;color:var(--text);">Client Documents</h2>
          <button onclick="this.closest('[style*=fixed]').remove()" style="border:none;background:none;font-size:24px;cursor:pointer;">×</button>
        </div>
        <div style="padding:12px;background:rgba(252,128,25,0.1);border-radius:8px;margin-bottom:20px;font-size:13px;color:var(--text-muted);">
          🔒 Documents require client approval before you can download them
        </div>
        ${docsHTML}
      </div>`;
    
    document.body.appendChild(modal);
  } catch (err) {
    console.error('View docs from interest error:', err);
    showToast('Could not load documents', 'error');
  }
}
async function requestDocumentAccessFromInterest(documentId, clientId) {
  try {
    const res = await fetch(`${API_URL}/documents/${documentId}/request-access`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'I would like to access this document.' })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Access request sent to client!', 'success');
      document.querySelectorAll('[style*="position: fixed"]').forEach(m => {
        if (m.style.zIndex === '1001') m.remove();
      });
      viewClientDocumentsFromInterest(clientId);
    } else {
      showToast(data.message || 'Already requested or failed', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ─── MESSAGE CLIENT FROM INTEREST UNLOCK ───
async function messageClientFromInterest(clientId) {
  if (!clientId || clientId === 'undefined') { showToast('Client info not available', 'error'); return; }
  try {
    showToast('Opening chat...', 'info');
    // Use a direct chat endpoint that doesn't require a requestId
    const res = await fetch(`${API_URL}/chats/direct`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expertId: state.user._id,
        clientId: clientId
      })
    });
    const data = await res.json();
    if (data.success) {
      document.querySelectorAll('[style*="position: fixed"]').forEach(m => m.remove());
      switchTab('chat');
      openChat(data.chat._id);
    } else {
      showToast(data.message || 'Could not start chat', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}
async function confirmInviteComplete(notifId, expertId, expertName) {
  const confirmed = confirm(`Did ${expertName} complete the service for you?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_URL}/users/invite-complete/${notifId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    // Refresh invites first
    loadClientInvites();

    // Open rating modal — set state vars then show modal
    state.ratingExpertId = expertId;
    state.ratingExpertName = expertName;
    state.ratingRequestId = null;
    state.ratingApproachId = null;

    const ratingModal = document.getElementById('ratingModal');
    document.getElementById('ratingExpertName').textContent = expertName;
    ratingModal.dataset.expertId = expertId;
    ratingModal.dataset.approachId = '';
    ratingModal.dataset.requestId = '';
    ratingModal.classList.add('open');
    
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}
