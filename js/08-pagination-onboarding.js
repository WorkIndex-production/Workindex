// Split from app.js lines 6844-7471. app.js is kept as the untouched fallback.
// ═══════════════════════════════════════════════════════════
//  PAGINATION SYSTEM v1.0
//  Sections: clientRequests, expertBrowse, expertApproaches, findExperts
//  Style: Numbered pages only | 8 per page
// ═══════════════════════════════════════════════════════════

var PAGINATION = {
  clientRequests:   { page: 1, perPage: 8 },
  expertBrowse:     { page: 1, perPage: 8 },
  expertApproaches: { page: 1, perPage: 8 },
  findExperts:      { page: 1, perPage: 8 },
  clientExplore:    { page: 1, perPage: 8 },
};

function paginate(items, section) {
  const { page, perPage } = PAGINATION[section];
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

function paginationControlsHTML(items, section) {
  const { page, perPage } = PAGINATION[section];
  const totalPages = Math.ceil(items.length / perPage);
  if (totalPages <= 1) return '';

  const start = (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, items.length);

  // Smart ellipsis: always show first, last, and ±2 around current
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1); // fill single gap
      } else if (i - l > 2) {
        rangeWithDots.push('…');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  const buttons = rangeWithDots.map(i => {
    if (i === '…') {
      return `<span style="padding:0 6px;color:var(--text-muted);line-height:36px;">…</span>`;
    }
    const isActive = i === page;
    return `
      <button
        onclick="changePage('${section}', ${i})"
        style="
          width:36px;height:36px;
          border:1.5px solid ${isActive ? 'var(--primary)' : 'var(--border)'};
          border-radius:8px;
          background:${isActive ? 'var(--primary)' : 'var(--bg)'};
          color:${isActive ? '#fff' : 'var(--text)'};
          font-size:14px;
          font-weight:${isActive ? '700' : '500'};
          cursor:pointer;
          transition:all 0.15s;
        ">
        ${i}
      </button>`;
  }).join('');

  return `
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border);">
      <div style="font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:10px;">
        Showing <strong>${start}–${end}</strong> of <strong>${items.length}</strong>
      </div>
      <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;">
        ${buttons}
      </div>
    </div>`;
}

function changePage(section, newPage) {
  const items = getItemsForSection(section);
  const totalPages = Math.ceil(items.length / PAGINATION[section].perPage);
  if (newPage < 1 || newPage > totalPages) return;

  PAGINATION[section].page = newPage;

  const renderers = {
    clientRequests:   renderClientRequests,
    expertBrowse:     renderAvailableRequests,
    expertApproaches: () => renderMyApproaches([]),
    findExperts:      renderExperts,
    clientExplore:    () => renderClientExploreGrid(renderClientExploreGrid._currentList || []),
  };
   
  if (renderers[section]) renderers[section]();

  const scrollTargets = {
    clientRequests:   'requestsList',
    expertBrowse:     'browseTab',
    expertApproaches: 'approachesList',
    findExperts:      'expertGrid',
    clientExplore:    'clientExploreGrid',
  };
  const el = document.getElementById(scrollTargets[section]);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getItemsForSection(section) {
  const map = {
    clientRequests:   () => state.requests || [],
    expertBrowse:     () => state.availableRequests || [],
    expertApproaches: () => state.myApproaches || [],
    findExperts:      () => state.experts || [],
    clientExplore:    () => renderClientExploreGrid._currentList || [],
  };
  return (map[section] || (() => []))();
}

function showExpertWelcomeModal() {
     console.log('[WelcomeModal] function called');
  const existing = document.getElementById('expertWelcomeModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'expertWelcomeModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';

  const points = [
    {
      icon: '👥',
      color: 'rgba(59,130,246,0.1)',
      title: 'Up to 5 experts can approach each request',
      desc: 'Client requests are open to a limited number of professionals. The earlier you approach, the better your chances of being noticed before the slots fill up.'
    },
    {
      icon: '📋',
      color: 'rgba(34,197,94,0.1)',
      title: 'A complete profile builds client trust',
      desc: 'Add your bio, experience, certifications, and a profile photo. Clients compare multiple professionals — a strong profile is often the deciding factor.'
    },
    {
      icon: '💰',
      color: 'rgba(245,158,11,0.1)',
      title: 'Quote competitively to win more clients',
      desc: "Price your services fairly relative to the client's budget. A competitive quote paired with a clear, confident message significantly increases your chances of being hired."
    },
    {
      icon: '🎯',
      color: 'rgba(239,68,68,0.1)',
      title: 'WorkIndex opens the door — you close it',
      desc: 'We connect you with verified clients. Your success depends entirely on how you present yourself, respond, and deliver. Make every approach count.'
    }
  ];

  overlay.innerHTML = `
    <div style="background:var(--bg);border-radius:20px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;padding:28px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;margin-bottom:12px;">🌟</div>
        <h2 style="font-size:22px;font-weight:800;color:var(--text);margin:0 0 8px;">Welcome to WorkIndex</h2>
        <p style="font-size:14px;color:var(--text-muted);margin:0;line-height:1.6;">Here's how to make the most of your time on the platform.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
        ${points.map(p => `
          <div style="background:var(--bg-gray);border:1.5px solid var(--border);border-radius:14px;padding:16px;display:flex;gap:14px;align-items:flex-start;">
            <div style="width:40px;height:40px;border-radius:12px;background:${p.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;">${p.icon}</div>
            <div style="flex:1;">
              <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:5px;">${p.title}</div>
              <div style="font-size:13px;color:var(--text-muted);line-height:1.6;">${p.desc}</div>
            </div>
          </div>`).join('')}
      </div>
      <button onclick="document.getElementById('expertWelcomeModal').remove(); if (!(state.user && state.user.questionnaireCompleted)) startQuestionnaire('expert'); else { showPage('expertDash'); loadExpertData(); }"
        style="width:100%;padding:15px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;">
        Let's Get Started →
      </button>
    </div>`;

  document.body.appendChild(overlay);
}

// ─── EXPERT SERVICE FILTER MODAL ───
function showServiceFilterModal(onComplete) {
  const services = WI_SERVICES.list;
   
  // Pre-select from profile if available
  const saved = state.user?.profile?.servicesOffered || [];

  const modal = document.createElement('div');
  modal.id = 'serviceFilterModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:1010;padding:20px;';

  modal.innerHTML = `
    <div style="background:var(--bg);border-radius:20px;max-width:420px;width:100%;padding:28px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:44px;margin-bottom:12px;">🎯</div>
        <h2 style="font-size:20px;font-weight:800;color:var(--text);margin-bottom:8px;">What services do you offer?</h2>
        <p style="font-size:14px;color:var(--text-muted);line-height:1.5;">Select your categories — you'll only see matching client requests in your Browse tab.</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;" id="serviceFilterGrid">
        ${services.map(s => {
          const isSelected = saved.includes(s.value);
          return `
            <div onclick="toggleServiceFilter(this, '${s.value}')"
              data-service="${s.value}"
              style="padding:14px 12px;border:2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'};
                     border-radius:12px;cursor:pointer;text-align:center;
                     background:${isSelected ? 'rgba(252,128,25,0.08)' : 'var(--bg)'};
                     transition:all 0.2s;"
              data-selected="${isSelected}">
              <div style="font-size:28px;margin-bottom:6px;">${s.icon}</div>
              <div style="font-size:13px;font-weight:700;color:${isSelected ? 'var(--primary)' : 'var(--text)'};">${s.label}</div>
            </div>`;
        }).join('')}
      </div>

      <div id="serviceFilterError" style="display:none;color:#e74c3c;font-size:13px;text-align:center;margin-bottom:12px;">
        Please select at least one service
      </div>

      <button onclick="confirmServiceFilter()" 
        style="width:100%;padding:15px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:10px;">
        Show Matching Requests →
      </button>

      <button onclick="skipServiceFilter()"
        style="width:100%;padding:12px;background:transparent;border:none;color:var(--text-muted);font-size:13px;cursor:pointer;">
        Skip — show all requests
      </button>
    </div>
  `;

  // Store callback
  modal._onComplete = onComplete;
  document.body.appendChild(modal);
}

function toggleServiceFilter(el, service) {
  const isSelected = el.dataset.selected === 'true';
  el.dataset.selected = !isSelected;
  el.style.borderColor = !isSelected ? 'var(--primary)' : 'var(--border)';
  el.style.background = !isSelected ? 'rgba(252,128,25,0.08)' : 'var(--bg)';
  el.querySelector('div:last-child').style.color = !isSelected ? 'var(--primary)' : 'var(--text)';
  document.getElementById('serviceFilterError').style.display = 'none';
}

function getSelectedServices() {
  return Array.from(document.querySelectorAll('#serviceFilterGrid [data-selected="true"]'))
    .map(el => el.dataset.service);
}

async function confirmServiceFilter() {
  const selected = getSelectedServices();
  if (!selected.length) {
    document.getElementById('serviceFilterError').style.display = 'block';
    return;
  }

  // Save preference to profile
  try {
    const updatedProfile = { ...(state.user.profile || {}), browseServiceFilter: selected };
    await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profile: updatedProfile })
    });
    state.user.profile = updatedProfile;
    localStorage.setItem('user', JSON.stringify(state.user));
  } catch (err) {
    console.error('Save filter error:', err);
  }

  document.getElementById('serviceFilterModal')?.remove();
  
  // Apply filter to browse
  applyBrowseServiceFilter(selected);
}

function skipServiceFilter() {
  document.getElementById('serviceFilterModal')?.remove();
  // Show all — no filter
  applyBrowseServiceFilter([]);
}

function applyBrowseServiceFilter(services) {
  state.browseServiceFilter = services;
  renderAvailableRequests();
  // Update the filter chips UI in browse tab
  updateBrowseFilterChips(services);
}

function updateBrowseFilterChips(selected) {
  document.querySelectorAll('.browse-filter-chip').forEach(chip => {
    const val = chip.dataset.service;
    const isActive = !selected.length || selected.includes(val) || val === 'all';
    chip.classList.toggle('active', isActive);
    chip.style.background = (val === 'all' ? !selected.length : selected.includes(val))
      ? 'var(--primary)' : 'transparent';
    chip.style.color = (val === 'all' ? !selected.length : selected.includes(val))
      ? '#fff' : 'var(--text)';
    chip.style.borderColor = (val === 'all' ? !selected.length : selected.includes(val))
      ? 'var(--primary)' : 'var(--border)';
  });
}
// ─── BROWSE TAB SERVICE FILTER ───
function setBrowseFilter(service) {
  let activeFilter = state.browseServiceFilter || [];
  if (service === 'all') {
    activeFilter = [];
  } else {
    activeFilter = activeFilter.includes(service)
      ? activeFilter.filter(s => s !== service)
      : [...activeFilter, service];
  }
  state.browseServiceFilter = activeFilter;
  applyBrowseFilters();
}

function clearAuthForms() {
  // All auth field IDs
  ['loginEmail', 'loginPassword',
   'signupName', 'signupEmail', 'signupPhone', 'signupPassword', 'signupOTP',
   'fpEmail', 'fpOTP', 'fpNewPassword', 'fpConfirmPassword',
   'guestSignupName', 'guestSignupEmail', 'guestSignupPhone', 'guestSignupPassword',
   'signupInviteCode'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Reset signup to step 1
  const step1 = document.getElementById('signupStep1');
  const step2 = document.getElementById('signupStep2');
  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';

  // Reset terms checkbox and send OTP button
  const terms = document.getElementById('termsCheckbox');
  const signupBtn = document.getElementById('signupSubmitBtn');
  if (terms) terms.checked = false;
  if (signupBtn) { signupBtn.disabled = true; signupBtn.style.opacity = '0.5'; }
}

// ─── GUEST SIGNUP MODAL (shown after questionnaire for non-logged-in users) ───
function showGuestSignupModal() {
  const existing = document.getElementById('guestSignupModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'guestSignupModal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';

  overlay.innerHTML = `
    <div style="background:var(--bg);width:100%;max-width:480px;border-radius:20px 20px 0 0;padding:28px 24px 40px;max-height:90vh;overflow-y:auto;">
      <div style="width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 20px;"></div>
      
      <!-- Progress indicator -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding:12px 16px;background:rgba(252,128,25,0.06);border-radius:12px;border:1px solid rgba(252,128,25,0.2);">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="color:#fff;font-size:16px;">✓</span>
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text);">Your requirements are ready!</div>
          <div style="font-size:12px;color:var(--text-muted);">Create a free account to post and get quotes</div>
        </div>
      </div>

      <h3 style="font-size:20px;font-weight:800;color:var(--text);margin-bottom:6px;">One last step</h3>
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:20px;line-height:1.5;">Sign up free to post your request. Verified professionals will respond within 24 hours.</p>

      <!-- Google signup button -->
      <div id="guestGoogleSignupBtn" style="width:100%;margin-bottom:16px;min-height:44px;"></div>
      
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
        <div style="flex:1;height:1px;background:var(--border);"></div>
        <span style="font-size:12px;color:var(--text-muted);white-space:nowrap;">or sign up with email</span>
        <div style="flex:1;height:1px;background:var(--border);"></div>
      </div>

      <!-- Email signup form -->
      <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:20px;">
        <input type="text" id="guestSignupName" placeholder="Full Name"
          style="width:100%;padding:13px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;background:var(--bg);color:var(--text);box-sizing:border-box;">
        <input type="email" id="guestSignupEmail" placeholder="Email address"
          style="width:100%;padding:13px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;background:var(--bg);color:var(--text);box-sizing:border-box;">
        <input type="tel" id="guestSignupPhone" placeholder="10-digit phone number" maxlength="10"
          style="width:100%;padding:13px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;background:var(--bg);color:var(--text);box-sizing:border-box;"
          oninput="this.value=this.value.replace(/\D/g,'')">
        <input type="password" id="guestSignupPassword" placeholder="Password (min 6 characters)"
          style="width:100%;padding:13px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;background:var(--bg);color:var(--text);box-sizing:border-box;">
      </div>

      <!-- OTP step (hidden initially) -->
      <div id="guestOTPStep" style="display:none;margin-bottom:20px;">
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:36px;margin-bottom:8px;">📧</div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;">Check your email</div>
          <div style="font-size:13px;color:var(--text-muted);">Enter the 6-digit code sent to <strong id="guestOTPEmail"></strong></div>
        </div>
        <input type="text" id="guestOTPInput" placeholder="_ _ _ _ _ _" maxlength="6" inputmode="numeric"
          style="width:100%;padding:16px;border:1.5px solid var(--border);border-radius:10px;font-size:28px;letter-spacing:10px;text-align:center;font-weight:700;box-sizing:border-box;background:var(--bg);color:var(--text);"
          onkeypress="if(event.key==='Enter') verifyGuestOTP()">
        <div style="text-align:center;margin-top:12px;font-size:13px;color:var(--text-muted);">
          Didn't get it? <button onclick="resendGuestOTP()" style="background:none;border:none;color:var(--primary);font-size:13px;font-weight:700;cursor:pointer;">Resend</button>
        </div>
      </div>

      <!-- Terms checkbox -->
      <div id="guestTermsRow" style="margin-bottom:16px;">
        <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:13px;color:var(--text-muted);line-height:1.5;">
          <input type="checkbox" id="guestTermsCheck"
            style="width:18px;height:18px;margin-top:1px;accent-color:var(--primary);flex-shrink:0;cursor:pointer;">
          <span>I agree to the <button type="button" onclick="openTermsModal('client')" style="background:none;border:none;color:var(--primary);font-size:13px;font-weight:700;cursor:pointer;padding:0;text-decoration:underline;">Terms & Conditions</button></span>
        </label>
      </div>

      <!-- Submit button -->
      <div id="guestSignupFormStep">
        <button id="guestSignupSubmitBtn" onclick="submitGuestSignup()"
          style="width:100%;padding:15px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:12px;">
          Send OTP & Continue →
        </button>
      </div>
      <div id="guestVerifyStep" style="display:none;">
        <button onclick="verifyGuestOTP()"
          style="width:100%;padding:15px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:12px;">
          Verify & Post Request →
        </button>
        <button onclick="document.getElementById('guestOTPStep').style.display='none';document.getElementById('guestSignupFormStep').style.display='block';document.getElementById('guestVerifyStep').style.display='none';"
          style="width:100%;padding:12px;background:none;border:1.5px solid var(--border);border-radius:12px;font-size:14px;color:var(--text);cursor:pointer;">
          ← Change details
        </button>
      </div>

      <button onclick="closeGuestSignupModal()"
        style="width:100%;padding:12px;background:none;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;margin-top:4px;">
        Cancel
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeGuestSignupModal(); });

  // Render Google button inside modal
  setTimeout(() => {
    if (window.google && window.google.accounts) {
      const container = document.getElementById('guestGoogleSignupBtn');
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: 'outline', size: 'large',
          width: container.offsetWidth || 340,
          text: 'signup_with'
        });
        // Re-wire callback for guest flow
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handleGuestGoogleCredential(response),
          ux_mode: 'popup'
        });
        window.google.accounts.id.renderButton(container, {
          theme: 'outline', size: 'large',
          width: container.offsetWidth || 340,
          text: 'signup_with'
        });
      }
    }
  }, 100);
}

function closeGuestSignupModal() {
  document.getElementById('guestSignupModal')?.remove();
}

async function submitGuestSignup() {
  const name     = document.getElementById('guestSignupName')?.value.trim();
  const email    = document.getElementById('guestSignupEmail')?.value.trim();
  const phone    = document.getElementById('guestSignupPhone')?.value.trim();
  const password = document.getElementById('guestSignupPassword')?.value;
  const terms    = document.getElementById('guestTermsCheck')?.checked;

  if (!name || !email || !phone || !password) {
    showToast('Please fill all fields', 'error'); return;
  }
  if (!/^[a-zA-Z\s\.\-']{2,60}$/.test(name)) {
    showToast('Enter a valid name', 'error'); return;
  }
  if (!/^[0-9]{10}$/.test(phone) || !/^[6-9]/.test(phone)) {
    showToast('Enter a valid 10-digit phone number', 'error'); return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error'); return;
  }
  if (!terms) {
    showToast('Please agree to Terms & Conditions', 'error'); return;
  }

  const btn = document.getElementById('guestSignupSubmitBtn');
  btn.disabled = true; btn.textContent = 'Sending OTP...';

  try {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, role: 'client' })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('guestOTPEmail').textContent = email;
      document.getElementById('guestOTPStep').style.display = 'block';
      document.getElementById('guestSignupFormStep').style.display = 'none';
      document.getElementById('guestVerifyStep').style.display = 'block';
      document.getElementById('guestTermsRow').style.display = 'none';
      showToast(`Code sent to ${email}`, 'success');
    } else {
      showToast(data.message || 'Failed to send OTP', 'error');
      btn.disabled = false; btn.textContent = 'Send OTP & Continue →';
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
    btn.disabled = false; btn.textContent = 'Send OTP & Continue →';
  }
}

async function verifyGuestOTP() {
  const email = document.getElementById('guestSignupEmail')?.value.trim();
  const otp   = document.getElementById('guestOTPInput')?.value.trim();
  if (!otp || otp.length !== 6) { showToast('Enter the 6-digit code', 'error'); return; }

  const btn = document.querySelector('#guestVerifyStep button:first-child');
  if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }

  try {
    const res = await fetch(`${API_URL}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (data.success && data.token) {
      state.token = data.token;
      state.user  = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // ── Clear guest flag BEFORE calling submit so it doesn't re-trigger modal ──
      state._guestQuestionnaire = false;
      closeGuestSignupModal();
      showToast('Account created! Posting your request...', 'success');
      // Small delay so modal closes cleanly before submit runs
      setTimeout(async () => {
        await submitQuestionnaire();
      }, 300);
    } else {
      showToast(data.message || 'Invalid code', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Verify & Post Request →'; }
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Verify & Post Request →'; }
  }
}

async function resendGuestOTP() {
  const email = document.getElementById('guestSignupEmail')?.value.trim();
  if (!email) return;
  try {
    await fetch(`${API_URL}/auth/resend-signup-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    showToast('Code resent!', 'success');
  } catch (e) { showToast('Network error', 'error'); }
}

async function handleGuestGoogleCredential(response) {
  const credential = response.credential;
  if (!credential) { showToast('Google sign-in failed', 'error'); return; }
  try {
    showToast('Connecting with Google...', 'info');
    const res = await fetch(`${API_URL}/auth/google-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, role: 'client' })
    });
    const data = await res.json();
    if (!data.success) { showToast(data.message || 'Google sign-in failed', 'error'); return; }

    if (data.action === 'login') {
      state.token = data.token;
      state.user  = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      state._guestQuestionnaire = false;
      closeGuestSignupModal();
      showToast('Signed in! Posting your request...', 'success');
      setTimeout(async () => {
        await submitQuestionnaire();
      }, 300);
    } else if (data.action === 'verify_otp') {
      _gOtpEmail = data.email;
      state._guestQuestionnaire = true;
      // CRITICAL: snapshot qState so showPage('auth') can't wipe it
      const _savedQState = JSON.parse(JSON.stringify(qState));
      closeGuestSignupModal();
      showPage('auth');
      // Restore qState after showPage may have reset it
      qState.answers  = _savedQState.answers;
      qState.role     = _savedQState.role;
      qState.sequence = _savedQState.sequence;
      qState.step     = _savedQState.step;
      switchAuthMode('signup');
      showGoogleOTPScreen(data.email);
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  }
}

// ═══ END OF JAVASCRIPT ═══
