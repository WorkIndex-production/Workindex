// Split from index.html inline script 3.
// ─── LOGIN ROLE ──────────────────────────────────────────
let selectedLoginRole = 'client';

function selectLoginRole(role) {
  selectedLoginRole = role;
  document.getElementById('loginRoleClient').classList.toggle('active', role === 'client');
  document.getElementById('loginRoleExpert').classList.toggle('active', role === 'expert');
}

// ─── AUTH MODE SWITCH ────────────────────────────────────
function switchAuthMode(mode) {
  const loginForm  = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginBtn   = document.getElementById('loginBtn');
  const signupBtn  = document.getElementById('signupBtn');
  if (mode === 'login') {
    loginForm.style.display  = 'block';
    signupForm.style.display = 'none';
    loginBtn.classList.add('active');
    signupBtn.classList.remove('active');
  } else {
    loginForm.style.display  = 'none';
    signupForm.style.display = 'block';
    loginBtn.classList.remove('active');
    signupBtn.classList.add('active');
    showSignupStep(1);
  }
}

// ─── SIGNUP ROLE ─────────────────────────────────────────
let selectedRole = 'expert';

function selectRole(role) {
  selectedRole = role;
  document.getElementById('roleClient').classList.toggle('active', role === 'client');
  document.getElementById('roleExpert').classList.toggle('active', role === 'expert');
}

// ─── SIGNUP STEPS ────────────────────────────────────────
function showSignupStep(step) {
  document.getElementById('signupStep1').style.display = step === 1 ? 'block' : 'none';
  document.getElementById('signupStep2').style.display = step === 2 ? 'block' : 'none';
}

// ─── SIGNUP STEP 1: Send OTP ─────────────────────────────
async function handleSignup() {
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const phone    = document.getElementById('signupPhone').value.trim();
  const password = document.getElementById('signupPassword').value;
  if (!name || !email || !phone || !password) {
    showToast('Please fill all fields', 'error'); return;
  }
  // ─── NAME VALIDATION ───
const namePhonePattern = /(\+?\d[\s\-.]?){9,13}\d|\b\d{10}\b/;
const nameWordPattern = /\b(zero|one|two|three|four|five|six|seven|eight|nine|call|contact|reach|whatsapp|telegram|dm)\b/gi;
const nameWordMatches = name.match(nameWordPattern) || [];
if (namePhonePattern.test(name) || nameWordMatches.length >= 4) {
  showToast('Name cannot contain phone numbers or contact information', 'error'); return;
}
if (name.length < 2 || name.length > 60) {
  showToast('Name must be between 2 and 60 characters', 'error'); return;
}
if (/[^a-zA-Z\s\.\-']/.test(name)) {
  showToast('Name can only contain letters, spaces, dots and hyphens', 'error'); return;
}
  if (!/^[0-9]{10}$/.test(phone)) {
    showToast('Enter a valid 10-digit phone number', 'error'); return;
  }
  if (!/^[6-9]/.test(phone)) {
    showToast('Phone number must start with 6, 7, 8 or 9', 'error'); return;
  }
  if (/^(\d)\1{9}$/.test(phone)) {
    showToast('Enter a valid phone number', 'error'); return;
  }
  var _invalidSeq = ['1234567890','0987654321','1234554321'];
  if (_invalidSeq.indexOf(phone) !== -1) {
    showToast('Enter a valid phone number', 'error'); return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error'); return;
  }
  const btn = document.getElementById('signupSubmitBtn');
  btn.disabled    = true;
  btn.textContent = 'Sending OTP...';
  try {
    const res  = await fetch(`${API_URL}/auth/send-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, phone, password, role: selectedRole })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Code sent to ${email}`, 'success');
      document.getElementById('otpEmailDisplay').textContent = email;
      showSignupStep(2);
      startResendCountdown('signupResendBtn', 'signupResendTimer', () => resendSignupOTP(email));
    } else {
      showToast(data.message || 'Failed to send OTP', 'error');
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Send OTP';
  }
}

// ─── SIGNUP STEP 2: Verify OTP ───────────────────────────
async function handleVerifySignupOTP() {
  const email = document.getElementById('signupEmail').value.trim();
  const otp   = document.getElementById('signupOTP').value.trim();
  if (otp.length !== 6) {
    showToast('Enter the 6-digit code', 'error'); return;
  }
  const btn = document.getElementById('verifyOtpBtn');
  btn.disabled    = true;
  btn.textContent = 'Verifying...';
  try {
    const res  = await fetch(`${API_URL}/auth/verify-otp-register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (data.success) {
      state.token = data.token;
      state.user  = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('Account created!', 'success');

      // Google users need to add phone before questionnaire
    if (data.needsPhone) {
      showGooglePhoneScreen(data.user);
      return;
    }
      
      if (state.pendingServiceFlow && data.user.role === 'client') {
        const svc = state.pendingServiceFlow;
        state.pendingServiceFlow = null;
        qState = {
          step: 1,
          sequence: [],
          answers: { service: svc },
          role: 'client'
        };
        qState.sequence = buildQuestionSequence();
        showPage('questionnaire');
        renderQuestion();
      } else if (data.user.role === 'expert') {
        showExpertWelcomeModal();
      } else if (!state._guestQuestionnaire) {
  startQuestionnaire(data.user.role);
} else {
  state._guestQuestionnaire = false;
  await submitQuestionnaire();
}
    } else {
      showToast(data.message || 'Invalid code', 'error');
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Verify & Create Account';
  }
}

// ─── RESEND SIGNUP OTP ───────────────────────────────────
async function resendSignupOTP(email) {
  try {
    const res  = await fetch(`${API_URL}/auth/resend-signup-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email })
    });
    const data = await res.json();
    showToast(data.success ? 'Code resent!' : (data.message || 'Failed to resend'), data.success ? 'success' : 'error');
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ─── LOGIN ───────────────────────────────────────────────
function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) {
    showToast('Please fill all fields', 'error'); return;
  }
  login(email, password, selectedLoginRole);
}

// ─── FORGOT PASSWORD ─────────────────────────────────────
let _fpResetToken = null;

function openForgotPassword() {
  _fpResetToken = null;
  document.getElementById('fpEmail').value           = '';
  document.getElementById('fpOTP').value             = '';
  document.getElementById('fpNewPassword').value     = '';
  document.getElementById('fpConfirmPassword').value = '';
  showForgotStep('fp-step-email');
  document.getElementById('forgotPasswordModal').style.display = 'flex';
}

function closeForgotPassword() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
}

function showForgotStep(stepId) {
  ['fp-step-email', 'fp-step-otp', 'fp-step-reset'].forEach(id => {
    document.getElementById(id).style.display = id === stepId ? 'block' : 'none';
  });
}

async function fpSendOTP() {
  const email = document.getElementById('fpEmail').value.trim();
  if (!email) { showToast('Enter your email address', 'error'); return; }
  const btn = document.getElementById('fpSendOtpBtn');
  btn.disabled    = true;
  btn.textContent = 'Sending...';
  try {
    const res  = await fetch(`${API_URL}/auth/forgot-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Code sent! Check your inbox.', 'success');
      document.getElementById('fpOTPEmailDisplay').textContent = email;
      showForgotStep('fp-step-otp');
      startResendCountdown('fpResendBtn', 'fpResendTimer', () => fpResendOTP(email));
    } else {
      showToast(data.message || 'Error sending code', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Send OTP';
  }
}

async function fpVerifyOTP() {
  const email = document.getElementById('fpEmail').value.trim();
  const otp   = document.getElementById('fpOTP').value.trim();
  if (otp.length !== 6) { showToast('Enter the 6-digit code', 'error'); return; }
  const btn = document.getElementById('fpVerifyBtn');
  btn.disabled    = true;
  btn.textContent = 'Verifying...';
  try {
    const res  = await fetch(`${API_URL}/auth/verify-reset-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (data.success) {
      _fpResetToken = data.resetToken;
      showForgotStep('fp-step-reset');
    } else {
      showToast(data.message || 'Invalid code', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Verify OTP';
  }
}

async function fpResendOTP(email) {
  try {
    await fetch(`${API_URL}/auth/forgot-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email })
    });
    showToast('Code resent!', 'success');
  } catch (err) {
    showToast('Network error', 'error');
  }
}

async function fpResetPassword() {
  const newPassword     = document.getElementById('fpNewPassword').value;
  const confirmPassword = document.getElementById('fpConfirmPassword').value;
  if (newPassword.length < 6) {
    showToast('Password must be at least 6 characters', 'error'); return;
  }
  if (newPassword !== confirmPassword) {
    showToast('Passwords do not match', 'error'); return;
  }
  if (!_fpResetToken) {
    showToast('Session expired. Please start again.', 'error');
    showForgotStep('fp-step-email'); return;
  }
  const btn = document.getElementById('fpResetBtn');
  btn.disabled    = true;
  btn.textContent = 'Saving...';
  try {
    const res  = await fetch(`${API_URL}/auth/reset-password`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ resetToken: _fpResetToken, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Password updated! Please log in.', 'success');
      closeForgotPassword();
      switchAuthMode('login');
    } else {
      showToast(data.message || 'Reset failed', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Set New Password';
  }
}

// ─── RESEND COUNTDOWN UTILITY ────────────────────────────
function startResendCountdown(btnId, timerId, onResend) {
  const btn   = document.getElementById(btnId);
  const timer = document.getElementById(timerId);
  if (!btn) return;
  let seconds       = 30;
  btn.disabled      = true;
  btn.style.opacity = '0.5';
  if (timer) timer.textContent = `(${seconds}s)`;
  const interval = setInterval(() => {
    seconds--;
    if (timer) timer.textContent = `(${seconds}s)`;
    if (seconds <= 0) {
      clearInterval(interval);
      btn.disabled      = false;
      btn.style.opacity = '1';
      if (timer) timer.textContent = '';
      btn.onclick = onResend;
    }
  }, 1000);
}
// ─── SERVICE-FIRST FLOW FROM LANDING ────────────────────
function startServiceFlow(serviceKey) {
  if (state.user && state.token) {
    // Already logged in — go straight to questionnaire with service pre-selected
    qState = {
      step: 0,
      sequence: ['service'],
      answers: { service: serviceKey },
      role: 'client'
    };
    qState.answers.service = serviceKey;
    qState.sequence = buildQuestionSequence();
    qState.step = 1;
    showPage('questionnaire');
    renderQuestion();
  } else {
    // Not logged in — run questionnaire first, signup at end
    qState = {
      step: 1,
      sequence: [],
      answers: { service: serviceKey },
      role: 'client'
    };
    qState.sequence = buildQuestionSequence();
    state._guestQuestionnaire = true; // flag: show signup at end
    showPage('questionnaire');
    renderQuestion();
  }
}
// ─── TERMS MODAL ─────────────────────────────────────────
function openTermsModal(role) {
  switchTermsTab(role || selectedRole || 'client');
  document.getElementById('termsModal').style.display = 'flex';
}

function closeTermsModal() {
  document.getElementById('termsModal').style.display = 'none';
}

function acceptTermsAndClose() {
  const checkbox = document.getElementById('termsCheckbox');
  if (checkbox) {
    checkbox.checked = true;
    const btn = document.getElementById('signupSubmitBtn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  }
  closeTermsModal();
}

function switchTermsTab(tab) {
  const expertContent = document.getElementById('termsContentExpert');
  const clientContent = document.getElementById('termsContentClient');
  const expertTab     = document.getElementById('termsTabExpert');
  const clientTab     = document.getElementById('termsTabClient');
  if (tab === 'expert') {
    expertContent.style.display = 'block';
    clientContent.style.display = 'none';
    expertTab.style.background  = 'var(--primary)';
    expertTab.style.color       = '#fff';
    clientTab.style.background  = 'var(--bg-gray)';
    clientTab.style.color       = 'var(--text-muted)';
  } else {
    expertContent.style.display = 'none';
    clientContent.style.display = 'block';
    clientTab.style.background  = 'var(--primary)';
    clientTab.style.color       = '#fff';
    expertTab.style.background  = 'var(--bg-gray)';
    expertTab.style.color       = 'var(--text-muted)';
  }
}

// ─── NEW REQUEST ─────────────────────────────────────────
function showNewRequestForm() {
    startQuestionnaire(state.user?.role);
}

function exitQuestionnaire() {
  if (!confirm('Exit questionnaire? Progress will be lost.')) return;
  state._guestQuestionnaire = false;
  document.getElementById('questionnaire').classList.remove('active');
  if (!document.querySelector('.page.active')) {
    if (state.user && state.user.role) {
      showPage(state.user.role === 'expert' ? 'expertDash' : 'clientDash');
    } else {
      showPage('landing');
    }
  }
}
  
  
// Attach terms modal backdrop close — runs after DOM ready
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('termsModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) closeTermsModal();
    });
  }
});

// ─── EXPLORE MEGA MENU ───────────────────────────────────────────────────────
let _exploreMenuOpen  = false;
let _exploreL2CatKey  = null; // which category is active at level 2

// ── Data: level-2 subcategories ──────────────────────────────────────────────
const EXPLORE_L2 = {
  compliance: {
    icon: '💼', label: 'Business & Compliance',
    items: [
      { label: '📄 ITR Filing',    key: 'itr' },
      { label: '🧾 GST Services',  key: 'gst' },
      { label: '🔍 Audit',         key: 'audit' },
    ]
  },
  accounting: {
    icon: '📊', label: 'Accounting & Finance',
    items: [
      { label: '📊 Accounting', key: 'accounting' },
    ]
  },
  digital: {
    icon: '🌐', label: 'Digital & Tech',
    items: [
      { label: '💻 Development', key: 'development' },
    ]
  },
  creative: {
    icon: '📸', label: 'Creative & Media',
    items: [
      { label: '📷 Photography', key: 'photography' },
    ]
  }
};

// ── Data: level-3 leaf items per service key ─────────────────────────────────
const EXPLORE_L3 = {
  itr: {
    label: '📄 ITR Filing',
    catKey: 'compliance',
    items: [
      { label: 'All ITR Filing',        serviceKey: 'itr', pre: {} },
      { label: 'Salaried Employee',     serviceKey: 'itr', pre: { itrTaxpayerType: 'salaried' } },
      { label: 'Business Owner',        serviceKey: 'itr', pre: { itrTaxpayerType: 'business' } },
      { label: 'Freelancer / Consultant', serviceKey: 'itr', pre: { itrTaxpayerType: 'freelancer' } },
      { label: 'NRI Returns',           serviceKey: 'itr', pre: { itrTaxpayerType: 'nri' } },
    ]
  },
  gst: {
    label: '🧾 GST Services',
    catKey: 'compliance',
    items: [
      { label: 'All GST Services',      serviceKey: 'gst', pre: {} },
      { label: 'New Registration',      serviceKey: 'gst', pre: { gstServiceType: 'new_registration' } },
      { label: 'Monthly Filing',        serviceKey: 'gst', pre: { gstServiceType: 'monthly_filing' } },
      { label: 'GST Notice / Scrutiny', serviceKey: 'gst', pre: { gstServiceType: 'notice_handling' } },
      { label: 'ITC Reconciliation',    serviceKey: 'gst', pre: { gstServiceType: 'itc_reconciliation' } },
    ]
  },
  audit: {
    label: '🔍 Audit',
    catKey: 'compliance',
    items: [
      { label: 'All Audit Services',    serviceKey: 'audit', pre: {} },
      { label: 'Statutory Audit',       serviceKey: 'audit', pre: { auditType: 'statutory_audit' } },
      { label: 'Tax Audit',             serviceKey: 'audit', pre: { auditType: 'tax_audit' } },
      { label: 'Internal Audit',        serviceKey: 'audit', pre: { auditType: 'internal_audit' } },
      { label: 'GST Audit',             serviceKey: 'audit', pre: { auditType: 'gst_audit' } },
    ]
  },
  accounting: {
    label: '📊 Accounting',
    catKey: 'accounting',
    items: [
      { label: 'All Accounting',        serviceKey: 'accounting', pre: {} },
      { label: 'Monthly Bookkeeping',   serviceKey: 'accounting', pre: { accountingServiceType: 'bookkeeping' } },
      { label: 'Payroll Processing',    serviceKey: 'accounting', pre: { accountingServiceType: 'payroll' } },
      { label: 'Annual Accounts',       serviceKey: 'accounting', pre: { accountingServiceType: 'annual_accounts' } },
      { label: 'TDS Filing',            serviceKey: 'accounting', pre: { accountingServiceType: 'tds_filing' } },
    ]
  },
  development: {
    label: '💻 Development',
    catKey: 'digital',
    items: [
      { label: 'All Development',       serviceKey: 'development', pre: {} },
      { label: '🌐 Website',            serviceKey: 'development', pre: { devProjectType: 'website' } },
      { label: '🛒 E-Commerce Store',   serviceKey: 'development', pre: { devProjectType: 'ecommerce' } },
      { label: '💻 Web App / SaaS',     serviceKey: 'development', pre: { devProjectType: 'webapp' } },
      { label: '📱 Mobile App',         serviceKey: 'development', pre: { devProjectType: 'mobile-app' } },
      { label: '🔌 API / Backend',      serviceKey: 'development', pre: { devProjectType: 'api' } },
      { label: '🎨 Website Redesign',   serviceKey: 'development', pre: { devProjectType: 'redesign' } },
      { label: '🔧 Maintenance / Bug Fix', serviceKey: 'development', pre: { devProjectType: 'maintenance' } },
    ]
  },
  photography: {
    label: '📷 Photography',
    catKey: 'creative',
    items: [
      { label: 'All Photography',       serviceKey: 'photography', pre: {} },
      { label: '💍 Wedding Photography', serviceKey: 'photography', pre: { photographyType: 'wedding' } },
      { label: '🤳 Portrait / Headshots', serviceKey: 'photography', pre: { photographyType: 'portrait' } },
      { label: '📦 Product / E-Commerce', serviceKey: 'photography', pre: { photographyType: 'product' } },
      { label: '🏢 Corporate / Events', serviceKey: 'photography', pre: { photographyType: 'corporate' } },
      { label: '🏠 Real Estate',        serviceKey: 'photography', pre: { photographyType: 'real_estate' } },
    ]
  }
};

function toggleExploreMenu() {
  _exploreMenuOpen = !_exploreMenuOpen;
  const menu    = document.getElementById('exploreMegaMenu');
  const chevron = document.getElementById('exploreChevron');
  const btn     = document.getElementById('exploreMenuBtn');
  if (menu)    menu.style.display      = _exploreMenuOpen ? 'block' : 'none';
  if (chevron) chevron.style.transform = _exploreMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  if (btn)     btn.style.color         = _exploreMenuOpen ? 'var(--primary)' : 'var(--text)';

  if (_exploreMenuOpen) {
    // Always start at level 1
    exploreGoLevel1();
    setTimeout(() => {
      document.addEventListener('click', _exploreOutsideClick);
    }, 10);
  } else {
    document.removeEventListener('click', _exploreOutsideClick);
  }
}

function _exploreOutsideClick(e) {
  const wrapper = document.getElementById('exploreMenuWrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeExploreMenu();
  }
}

function closeExploreMenu() {
  _exploreMenuOpen = false;
  const menu    = document.getElementById('exploreMegaMenu');
  const chevron = document.getElementById('exploreChevron');
  const btn     = document.getElementById('exploreMenuBtn');
  if (menu)    menu.style.display      = 'none';
  if (chevron) chevron.style.transform = 'rotate(0deg)';
  if (btn)     btn.style.color         = 'var(--text)';
  document.removeEventListener('click', _exploreOutsideClick);
}

function exploreGoLevel1() {
  document.getElementById('explore-level-1').style.display = 'block';
  document.getElementById('explore-level-2').style.display = 'none';
  document.getElementById('explore-level-3').style.display = 'none';
  _exploreL2CatKey = null;
}

function exploreGoLevel2(catKey) {
  _exploreL2CatKey = catKey;
  const cat = EXPLORE_L2[catKey];
  if (!cat) return;

  // Set title
  document.getElementById('explore-l2-title').innerHTML =
    `<span style="font-size:20px;">${cat.icon}</span> ${cat.label}`;

  // Populate list
  const list = document.getElementById('explore-l2-list');
  list.innerHTML = cat.items.map(item => `
    <div onclick="exploreGoLevel3('${item.key}')"
      style="display:flex;align-items:center;justify-content:space-between;padding:11px 10px;
             border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;color:var(--text);
             transition:all 0.15s;margin-bottom:3px;"
      onmouseover="this.style.background='var(--bg-gray)';this.style.color='var(--primary)'"
      onmouseout="this.style.background='transparent';this.style.color='var(--text)'">
      <span>${item.label}</span>
      <span style="color:var(--text-muted);font-size:16px;">›</span>
    </div>
  `).join('');
  
  // If only one subcategory (accounting, development, photography), go straight to level 3
  if (cat.items.length === 1) {
    document.getElementById('explore-level-1').style.display = 'none';
    document.getElementById('explore-level-2').style.display = 'none';
    exploreGoLevel3(cat.items[0].key);
    return;
  }

  document.getElementById('explore-level-1').style.display = 'none';
  document.getElementById('explore-level-2').style.display = 'block';
  document.getElementById('explore-level-3').style.display = 'none';
}

function exploreGoLevel2Back() {
  // Go back to level 2 from level 3
  if (_exploreL2CatKey) {
    const cat = EXPLORE_L2[_exploreL2CatKey];
    if (cat && cat.items.length > 1) {
      document.getElementById('explore-level-3').style.display = 'none';
      document.getElementById('explore-level-2').style.display = 'block';
      return;
    }
  }
  // Otherwise go back to level 1
  exploreGoLevel1();
}

function exploreGoLevel3(serviceKey) {
  const svc = EXPLORE_L3[serviceKey];
  if (!svc) return;

  // Set back button label
  const catKey = svc.catKey;
  const cat    = EXPLORE_L2[catKey];
  const backLabel = cat ? cat.label : 'Back to Explore';
  document.getElementById('explore-l3-back-label').textContent = backLabel;

  // Set title
  document.getElementById('explore-l3-title').textContent = svc.label;

  // Populate leaf items
  const list = document.getElementById('explore-l3-list');
  list.innerHTML = svc.items.map((item, idx) => {
    const dataKey = 'exploreL3_' + idx + '_' + Date.now();
    window[dataKey] = item;
    return `
    <div onclick="(function(){ var d=window['${dataKey}']; exploreStartFlow(d.serviceKey, d.pre); })()"
      style="padding:10px 10px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:600;
             color:var(--text);transition:all 0.15s;margin-bottom:3px;"
      onmouseover="this.style.background='rgba(252,128,25,0.08)';this.style.color='var(--primary)'"
      onmouseout="this.style.background='transparent';this.style.color='var(--text)'">
      ${item.label}
    </div>`;
  }).join('');

  document.getElementById('explore-level-1').style.display = 'none';
  document.getElementById('explore-level-2').style.display = 'none';
  document.getElementById('explore-level-3').style.display = 'block';
}

function exploreStartFlow(serviceKey, preAnswers) {
  closeExploreMenu();

  if (state.user && state.token) {
    qState = {
      step: 0, sequence: [],
      answers: { service: serviceKey, ...preAnswers },
      role: 'client'
    };
    qState.sequence = buildQuestionSequence();
    while (
      qState.step < qState.sequence.length - 1 &&
      _isStepAnswered(qState.sequence[qState.step], qState.answers)
    ) { qState.step++; }
    showPage('questionnaire');
    renderQuestion();
  } else {
    qState = {
      step: 0, sequence: [],
      answers: { service: serviceKey, ...preAnswers },
      role: 'client'
    };
    qState.sequence = buildQuestionSequence();
    state._guestQuestionnaire = true;
    while (
      qState.step < qState.sequence.length - 1 &&
      _isStepAnswered(qState.sequence[qState.step], qState.answers)
    ) { qState.step++; }
    showPage('questionnaire');
    renderQuestion();
  }
}

function _isStepAnswered(stepId, answers) {
  if (!stepId || !answers) return false;
  if (stepId === 'service') return true;
  const q = _lookupQuestion(stepId);
  if (!q) return false;
  const val = answers[q.key];
  if (val === undefined || val === null) return false;
  if (typeof val === 'string' && val.trim() === '') return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}
