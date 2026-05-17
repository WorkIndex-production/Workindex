// Split from index.html inline script 5.
// Auto-open auth page if ?signup=true or ?invite=CODE is in URL
(function() {
  var params = new URLSearchParams(window.location.search);
  var invite = (params.get('invite') || '').trim().toUpperCase();
  if (params.get('signup') === 'true' || invite) {
    // Wait for app.js to load then show auth
    var openSignup = function() {
      setTimeout(function() {
        if (typeof showPage === 'function') {
          showPage('auth');
          if (typeof switchAuthMode === 'function') switchAuthMode('signup');
          if (invite) {
            if (typeof selectRole === 'function') selectRole('expert');
            var inviteInput = document.getElementById('signupInviteCode');
            if (inviteInput) inviteInput.value = invite;
            if (typeof verifyInviteCodeInput === 'function') verifyInviteCodeInput();
          }
        }
      }, 100);
    };
    window.addEventListener('workindex:ready', openSignup, { once: true });
    if (typeof showPage === 'function') openSignup();
  }
})();
