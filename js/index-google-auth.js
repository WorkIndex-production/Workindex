// Split from index.html inline script 6.
// ─── GOOGLE SIGN-IN INTEGRATION ────────────────────────────────────────────
 
const GOOGLE_CLIENT_ID = '385283993547-m41gp8puiq8a71f2856tu0bbskn7qir1.apps.googleusercontent.com';
 
// State for Google OTP flow
let _gOtpEmail = null;  // email address waiting for OTP verification

function handleOTPVerify() {
  // Route to correct handler depending on whether this is a Google OTP flow
  if (_gOtpEmail) {
    handleGoogleVerifyOTP();
  } else {
    handleVerifySignupOTP();
  }
}
  
// ── Render Google button into a container ──────────────────────────────────
function renderGoogleButton(containerId, context) {
  if (!window.google || !window.google.accounts) return;
  const container = document.getElementById(containerId);
  if (!container) return;
 
  container.innerHTML = '';
 
  window.google.accounts.id.initialize({
    client_id:             GOOGLE_CLIENT_ID,
    callback:              (response) => handleGoogleCredential(response, context),
    auto_select:           false,
    cancel_on_tap_outside: true,
    ux_mode:               'popup',
  });
 
  window.google.accounts.id.renderButton(container, {
    theme:          'outline',
    size:           'large',
    width:          container.offsetWidth > 50 ? container.offsetWidth : 340,
    text:           context === 'signup' ? 'signup_with' : 'signin_with',
    shape:          'rectangular',
    logo_alignment: 'left',
  });
}
 
// ── Called when user picks a Google account ────────────────────────────────
async function handleGoogleCredential(response, context) {
  const credential = response.credential;
  if (!credential) {
    showToast('Google sign-in failed. Please try again.', 'error');
    return;
  }
 
  // For signup, use the currently selected role
  const role = context === 'signup' ? (selectedRole || 'client') : undefined;
  const inviteCode = context === 'signup'
    ? ((document.getElementById('signupInviteCode')?.value || '').trim().toUpperCase())
    : undefined;
  if (context === 'signup' && role === 'expert' && inviteCode && typeof verifyInviteCodeInput === 'function') {
    const inviteOk = await verifyInviteCodeInput();
    if (!inviteOk) return;
  }
 
  try {
    showToast('Connecting with Google...', 'info');
 
    const res = await fetch(`${API_URL}/auth/google-init`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ credential, role, inviteCode }),
    });
 
    const data = await res.json();
 
    if (!data.success) {
      showToast(data.message || 'Google sign-in failed.', 'error');
      return;
    }
 
    if (data.action === 'login') {
      // ── Returning user — go straight to dashboard ────────────────────
      state.token = data.token;
      state.user  = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
 
      showToast('Welcome back!', 'success');
 
      enterDashboard();
 
    } else if (data.action === 'verify_otp') {
      // ── New user — show OTP screen ───────────────────────────────────
      _gOtpEmail = data.email;
      showGoogleOTPScreen(data.email);
    }
 
  } catch (err) {
    console.error('Google auth error:', err);
    showToast('Network error. Please try again.', 'error');
  }
}
 
// ── Show OTP verification screen for new Google users ──────────────────────
function showGoogleOTPScreen(email) {
    _gOtpEmail = email; // re-assign here as safety net

  // Re-use signupStep2 UI — same look as normal OTP screen
  document.getElementById('signupStep1').style.display = 'none';
  document.getElementById('signupStep2').style.display = 'block';
 
  // Update the email display
  const emailDisplay = document.getElementById('otpEmailDisplay');
  if (emailDisplay) emailDisplay.textContent = email;
 
  // Override the verify button to call Google OTP handler
  const verifyBtn = document.getElementById('verifyOtpBtn');
  if (verifyBtn) {
    verifyBtn.onclick = handleGoogleVerifyOTP;
    verifyBtn.textContent = 'Verify & Create Account';
  }
 
  // Override the OTP input Enter key
  const otpInput = document.getElementById('signupOTP');
  if (otpInput) {
    otpInput.value = '';
    otpInput.onkeypress = (e) => { if (e.key === 'Enter') handleGoogleVerifyOTP(); };
  }
 
  // Override resend button
  startResendCountdown(
    'signupResendBtn',
    'signupResendTimer',
    () => resendGoogleOTP(email)
  );
 
  // Override "Change details" back button to reset Google flow
  const changeBtn = document.querySelector('#signupStep2 button:last-of-type');
  if (changeBtn) {
    changeBtn.onclick = () => {
      _gOtpEmail = null;
      document.getElementById('signupStep2').style.display = 'none';
      document.getElementById('signupStep1').style.display = 'block';
      // Restore normal OTP verify button behaviour
      const vBtn = document.getElementById('verifyOtpBtn');
      if (vBtn) {
        vBtn.onclick = handleVerifySignupOTP;
        vBtn.textContent = 'Verify & Create Account';
      }
    };
  }
 
  showToast(`Verification code sent to ${email}`, 'success');
}
 
// ── Verify OTP for new Google user ─────────────────────────────────────────
async function handleGoogleVerifyOTP() {
  
  const otp = document.getElementById('signupOTP')?.value?.trim();
  if (!otp || otp.length !== 6) {
    showToast('Enter the 6-digit code', 'error');
    return;
  }
 
  const btn = document.getElementById('verifyOtpBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }
 
  try {
    const res = await fetch(`${API_URL}/auth/google-verify-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: _gOtpEmail, otp }),
    });
 
    const data = await res.json();   
 
    
    if (!data.success) {
      showToast(data.message || 'Invalid code', 'error');
      return;
    }
 
    // ── Account created — route to onboarding ────────────────────────
    state.token = data.token;
    state.user  = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    _gOtpEmail = null;
 
    showToast('Account created!', 'success');

    if (data.needsPhone) {
      showGooglePhoneScreen(data.user);
      return;
    }

    
    if (data.needsPhone) {
      console.log('[GoogleOTP] → needsPhone branch, calling showGooglePhoneScreen');
      showGooglePhoneScreen(data.user);
      return;
    }

    if (state.pendingServiceFlow && data.user.role === 'client') {
      console.log('[GoogleOTP] → pendingServiceFlow branch');
      const svc = state.pendingServiceFlow;
      state.pendingServiceFlow = null;
      qState = {
        step:     1,
        sequence: [],
        answers:  { service: svc },
        role:     'client',
      };
      qState.sequence = buildQuestionSequence();
      showPage('questionnaire');
      renderQuestion();
    } else if (state._guestQuestionnaire) {
      
      state._guestQuestionnaire = false;
      showToast('Account created! Posting your request...', 'success');
      setTimeout(async () => {
        await submitQuestionnaire();
      }, 300);
    } else {
      
      startQuestionnaire(data.user.role);
    }
 
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Verify & Create Account'; }
  }
}
 
// ── Resend OTP for Google signup ───────────────────────────────────────────
async function resendGoogleOTP(email) {
  try {
    const res = await fetch(`${API_URL}/auth/google-resend-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    showToast(data.success ? 'Code resent!' : (data.message || 'Failed to resend'), data.success ? 'success' : 'error');
  } catch (e) {
    showToast('Network error', 'error');
  }
}

// ── Phone collection for Google sign-up users ─────────────────────────────
function showGooglePhoneScreen(user) {
  const existing = document.getElementById('googlePhoneOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'googlePhoneOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: var(--bg); z-index: 2000;
    display: flex; align-items: center; justify-content: center; padding: 20px;
  `;

  overlay.innerHTML = `
    <div style="background: var(--bg); width: 100%; max-width: 400px; border-radius: 16px;
                border: 1.5px solid var(--border); padding: 32px 24px; text-align: center;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);">
      <div style="font-size:48px; margin-bottom:12px;">📱</div>
      <h3 style="font-size:20px; font-weight:800; margin-bottom:8px; color: var(--text);">
        One last thing
      </h3>
      <p style="font-size:14px; color:var(--text-muted); line-height:1.5; margin-bottom:24px;">
        Add your phone number to complete your profile.<br>
        <span style="font-size:12px;">Google doesn't share phone numbers with us.</span>
      </p>
      <div style="text-align:left; margin-bottom:16px;">
        <label style="font-size:13px; font-weight:600; color:var(--text);
                      display:block; margin-bottom:8px;">Phone Number</label>
        <div style="display:flex; gap:8px;">
          <span style="padding:12px 14px; border:1.5px solid var(--border); border-radius:10px;
                       font-size:15px; font-weight:600; background:var(--bg-gray);
                       color:var(--text-muted); flex-shrink:0;">
            +91
          </span>
          <input type="tel" id="googlePhoneInput" placeholder="10-digit mobile number"
            maxlength="10" inputmode="numeric"
            style="flex:1; padding:12px; border:1.5px solid var(--border); border-radius:10px;
                   font-size:15px; background:var(--bg); color:var(--text);"
            oninput="this.value=this.value.replace(/\\D/g,'')">
        </div>
      </div>
      <button class="btn-primary" style="width:100%; margin-bottom:12px;"
        onclick="submitGooglePhone('${user._id}')">
        Save & Continue →
      </button>
      
    </div>
  `;

  document.body.appendChild(overlay);
}
async function submitGooglePhone(userId) {
  const phone = document.getElementById('googlePhoneInput')?.value?.trim();
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    showToast('Enter a valid 10-digit phone number', 'error'); return;
  }

  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (data.success) {
      state.user.phone = phone;
      localStorage.setItem('user', JSON.stringify(state.user));
      showToast('Phone saved!', 'success');
    }
  } catch (e) {
   showToast('Could not save phone. Please try again.', 'error');
    return;  
  }

  proceedAfterGoogleSignup();
}


function proceedAfterGoogleSignup() {
  
  const overlay = document.getElementById('googlePhoneOverlay');
  if (overlay) overlay.remove();

  const user = state.user;
  if (state.pendingServiceFlow && user.role === 'client') {
    const svc = state.pendingServiceFlow;
    state.pendingServiceFlow = null;
    qState = { step:1, sequence:[], answers:{ service: svc }, role:'client' };
    qState.sequence = buildQuestionSequence();
    showPage('questionnaire');
    renderQuestion();
  } else if (state._guestQuestionnaire) {
    
    state._guestQuestionnaire = false;
    showToast('Account created! Posting your request...', 'success');
    setTimeout(async () => {
      await submitQuestionnaire();
    }, 300);
  } else {
    
    startQuestionnaire(user.role);
  }
}
  
// ── Hook: re-render buttons when auth mode switches ───────────────────────
const __origSwitchAuthMode = switchAuthMode;
switchAuthMode = function(mode) {
  __origSwitchAuthMode(mode);
  setTimeout(() => {
    if (mode === 'login')  renderGoogleButton('googleLoginBtn',  'login');
    else                   renderGoogleButton('googleSignupBtn', 'signup');
  }, 60);
};
 
// ── Hook: re-render signup button when role changes ───────────────────────
const __origSelectRole = typeof selectRole === 'function' ? selectRole : null;
if (__origSelectRole) {
  selectRole = function(role) {
    __origSelectRole(role);
    setTimeout(() => renderGoogleButton('googleSignupBtn', 'signup'), 60);
  };
}
 
// ── Hook: render on auth page load ────────────────────────────────────────
function hookShowPage() {
  if (typeof showPage === 'function') {
    const __origShowPage = showPage;
    showPage = function(pageId, pushState = true) {
      __origShowPage(pageId, pushState);
      if (pageId === 'auth') {
        setTimeout(() => {
          const loginVisible =
            document.getElementById('loginForm') &&
            document.getElementById('loginForm').style.display !== 'none';
          if (loginVisible) renderGoogleButton('googleLoginBtn',  'login');
          else              renderGoogleButton('googleSignupBtn', 'signup');
        }, 100);
      }
    };
  } else {
    setTimeout(hookShowPage, 50);
  }
}
hookShowPage();
 
// ── Initial render: wait for GSI script to load ───────────────────────────
(function waitForGSI() {
  if (window.google && window.google.accounts) {
    const authPage = document.getElementById('auth');
    if (authPage && authPage.classList.contains('active')) {
      renderGoogleButton('googleLoginBtn', 'login');
    }
  } else {
    setTimeout(waitForGSI, 250);
  }
})();
