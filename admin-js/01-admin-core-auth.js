/* ═══════════════════════════════════════════════════════════
   WorkIndex Admin — admin-app.js
   All application logic. Requires: admin.css, admin.html
   ═══════════════════════════════════════════════════════════ */

(function(){
  var API_BASE = 'https://workindex-production.up.railway.app/api';
  var API = API_BASE + '/admin';
  var tok = localStorage.getItem('admTok') || '';
  var adm = null;
  try { adm = JSON.parse(localStorage.getItem('admData') || 'null'); } catch(e) {}
  var dF = '', dT = '', T = {};
  var _editPostId = null, _creditUid = null, _pwUid = null, _tkId = null;

  // ─── ADMIN PAGINATION ───
  var _pages = {
    experts: 1, clients: 1, approaches: 1, chats: 1,
    credits: 1, tickets: 1, posts: 1, reviews: 1,
    registrations: 1, kyc: 1, suspReq: 1, reports: 1,  audit: 1, actions: 1 , serviceCategories: 1, admins: 1,
    payments: 1, emailLogs: 1, commHistory: 1
  };
  var _pageData = {};
  var PER_PAGE = 10;

  function pagSlice(key, arr) {
    _pageData[key] = arr;
    var p = _pages[key] || 1;
    var total = arr.length;
    var pages = Math.ceil(total / PER_PAGE);
    if (p > pages && pages > 0) { p = pages; _pages[key] = p; }
    return arr.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  }

  function pagHTML(key, containerId) {
    var arr = _pageData[key] || [];
    var total = arr.length;
    var pages = Math.ceil(total / PER_PAGE);
    var p = _pages[key] || 1;
    if (pages <= 1) return;
    var c = document.getElementById(containerId);
    if (!c) return;
    var existing = document.getElementById('pag-' + key);
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.id = 'pag-' + key;
    div.style.cssText = 'display:flex;align-items:center;gap:6px;padding:14px 0;justify-content:center;flex-wrap:wrap;';
    var btns = '';
    btns += '<button onclick="goPage(\'' + key + '\',' + (p-1) + ')" ' + (p<=1?'disabled':'') + ' style="padding:6px 12px;background:#1a1a24;border:1px solid #2a2a38;color:#a0a0b8;border-radius:6px;cursor:pointer;font-size:13px;">&laquo;</button>';
    var start = Math.max(1, p-2), end = Math.min(pages, p+2);
    if (start > 1) btns += '<button onclick="goPage(\'' + key + '\',1)" style="padding:6px 10px;background:#1a1a24;border:1px solid #2a2a38;color:#a0a0b8;border-radius:6px;cursor:pointer;font-size:13px;">1</button>' + (start>2?'<span style="color:#606078;padding:0 4px">…</span>':'');
    for (var i = start; i <= end; i++) {
      var active = i === p;
      btns += '<button onclick="goPage(\'' + key + '\',' + i + ')" style="padding:6px 10px;background:' + (active?'#FC8019':'#1a1a24') + ';border:1px solid ' + (active?'#FC8019':'#2a2a38') + ';color:' + (active?'#fff':'#a0a0b8') + ';border-radius:6px;cursor:pointer;font-size:13px;font-weight:' + (active?'700':'400') + ';">' + i + '</button>';
    }
    if (end < pages) btns += (end<pages-1?'<span style="color:#606078;padding:0 4px">…</span>':'') + '<button onclick="goPage(\'' + key + '\',' + pages + ')" style="padding:6px 10px;background:#1a1a24;border:1px solid #2a2a38;color:#a0a0b8;border-radius:6px;cursor:pointer;font-size:13px;">' + pages + '</button>';
    btns += '<button onclick="goPage(\'' + key + '\',' + (p+1) + ')" ' + (p>=pages?'disabled':'') + ' style="padding:6px 12px;background:#1a1a24;border:1px solid #2a2a38;color:#a0a0b8;border-radius:6px;cursor:pointer;font-size:13px;">&raquo;</button>';
    btns += '<span style="font-size:12px;color:#606078;margin-left:8px">' + total + ' total</span>';
    div.innerHTML = btns;
    c.parentNode.insertBefore(div, c.nextSibling);
  }

  window.goPage = function goPage(key, p) {
    var arr = _pageData[key] || [];
    var pages = Math.ceil(arr.length / PER_PAGE);
    if (p < 1 || p > pages) return;
    _pages[key] = p;
    var reloaders = {
      experts: function() { renderUsersPage('expert'); },
      clients: function() { renderUsersPage('client'); },
      approaches: function() { renderApproachesPage(); },
      chats: function() { renderChatsPage(); },
      credits: function() { renderCreditsPage(); },
      tickets: function() { renderTicketsPage(); },
      posts: function() { renderPostsPage(); },
      reviews: function() { renderReviewsPage(); },
      registrations: function() { renderRegistrationsPage(); },
      kyc: function() { renderKycPage(); },
      audit: function() { renderAuditPage(); },
      actions: function() { renderActTblPage(); },
      admins: function() { renderAdminsPage(); },
      payments: function() { renderPaymentsPage(); },
      emailLogs: function() { renderEmailLogsPage(); },
          commHistory: function() { renderCommHistoryPage(); }

    };
     
    if (reloaders[key]) reloaders[key]();
    // Scroll to top of table
    var tbl = document.getElementById(key === 'experts' ? 'eTbl' : key === 'clients' ? 'cTbl' : key === 'approaches' ? 'apTbl' : key === 'chats' ? 'chTbl' : key === 'credits' ? 'crTbl' : key === 'tickets' ? 'tkTbl' : key === 'posts' ? 'poTbl' : key === 'reviews' ? 'rvTbl' : key === 'registrations' ? 'rgTbl' : 'kycTbl');
    if (tbl) tbl.closest('table') && tbl.closest('table').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ─── ADMIN INACTIVITY LOGOUT (30 minutes) ───
  var _adminInactivityTimer = null;
  var ADMIN_INACTIVITY_TIMEOUT = 30 * 60 * 1000;
  var ADMIN_LAST_ACTIVE_KEY = 'wiAdminLastActiveAt';
  var _adminWatcherStarted = false;

  function clearAdminLoginFields() {
    ['liId', 'liPw'].forEach(function(id) {
      var el = g(id);
      if (el) el.value = '';
    });
    if (g('lerr')) g('lerr').textContent = '';
  }

  function clearAdminSession() {
    localStorage.removeItem('admTok');
    localStorage.removeItem('admData');
    localStorage.removeItem(ADMIN_LAST_ACTIVE_KEY);
    tok = '';
    adm = null;
  }

  function adminSessionExpired() {
    if (!tok) return false;
    var lastActive = Number(localStorage.getItem(ADMIN_LAST_ACTIVE_KEY) || '0');
    return lastActive > 0 && Date.now() - lastActive >= ADMIN_INACTIVITY_TIMEOUT;
  }

  function resetAdminTimer() {
    if (!tok) return;
    localStorage.setItem(ADMIN_LAST_ACTIVE_KEY, String(Date.now()));
    clearTimeout(_adminInactivityTimer);
    _adminInactivityTimer = setTimeout(function() {
      doLogout(true);
      alert('Session expired due to inactivity. Please log in again.');
    }, ADMIN_INACTIVITY_TIMEOUT);
  }

  function startAdminInactivity() {
    if (adminSessionExpired()) {
      doLogout(true);
      alert('Session expired due to inactivity. Please log in again.');
      return;
    }
    if (!_adminWatcherStarted) {
      ['mousemove','mousedown','keydown','touchstart','scroll','click'].forEach(function(ev) {
        window.addEventListener(ev, resetAdminTimer, { passive: true });
      });
      _adminWatcherStarted = true;
    }
    resetAdminTimer();
  }

  function stopAdminInactivity() {
    clearTimeout(_adminInactivityTimer);
    _adminInactivityTimer = null;
  }

  function g(id) { return document.getElementById(id); }
  function qa(s) { return Array.from(document.querySelectorAll(s)); }
  function deb(k, fn) { clearTimeout(T[k]); T[k] = setTimeout(fn, 300); }
  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }

  /* ═══ INIT ═══════════════════════════════════════════════════════════════ */
  function init() {
    if (adminSessionExpired()) { clearAdminSession(); }
    if (tok && adm) { showApp(); }
    g('loginBtn').onclick = doLogin;
    g('liPw').onkeydown = function(e) { if (e.key === 'Enter') doLogin(); };
    g('logoutBtn').onclick = doLogout;
    if(g('mLogoutBtn')) g('mLogoutBtn').onclick = doLogout;
    /* mobile bottom nav */
    qa('.mni').forEach(function(n){ n.onclick = function(){ goTo(n.dataset.s); }; });
    g('applyDF').onclick = applyDates;
    g('clearDF').onclick = clearDates;
    g('drClose').onclick = closeDr;
    g('chDrClose').onclick = closeChDr;
    g('ov1').onclick = closeDr;
    g('ov2').onclick = closeChDr;
    qa('.ni').forEach(function(n) { n.onclick = function() { goTo(n.dataset.s); }; });

    /* search inputs */
    g('eSrch').oninput = function() { deb('e', function() { loadUsers('expert'); }); };
    g('cSrch').oninput = function() { deb('c', function() { loadUsers('client'); }); };
    g('apSt').onchange = loadApproaches;
    g('crType').onchange = loadCredits;
    g('crSrch').oninput = function() { deb('cr', loadCredits); };
    g('acSrch').oninput = function() { deb('ac', searchActions); };
    g('acRole').onchange = searchActions;
    g('tkSt').onchange = loadTickets;
    g('tkSrch').oninput = function() { deb('tk', loadTickets); };
    g('poSrch').oninput = function() { deb('po', loadPosts); };
    g('poSt').onchange = loadPosts;
    g('rvSrch').oninput = function() { deb('rv', loadReviews); };
    g('rvMin').onchange = loadReviews;
    g('rgSt').onchange = loadRegistrations;
         if (g('kycSt')) g('kycSt').onchange = loadKycRequests;
    g('commTarget').onchange = function() {
      g('commCustomBox').style.display = this.value === 'custom' ? 'block' : 'none';
    };
    g('previewCommBtn').onclick = previewComm;
    g('sendCommBtn').onclick = sendComm;
    g('genInvBtn').onclick = genInvoice;
    g('invUserSel').onchange = onInvExpertChange;
    g('invTxSel').onchange = onInvTxChange;
    g('invDesc').oninput = previewInvoice;
    g('invAmt').oninput = previewInvoice;
    g('invDate').oninput = previewInvoice;
    if (g('invDue')) g('invDue').oninput = previewInvoice;
    if (g('invNotes')) g('invNotes').oninput = previewInvoice;
    // Wire tax rate selectors directly in init so they always respond
    if (g('invTaxRate')) {
      g('invTaxRate').onchange = function() {
        var box = g('invCustomTaxBox');
        if (box) box.style.display = (this.value === 'custom') ? 'block' : 'none';
        previewInvoice();
      };
    }
    if (g('invCustomTax')) g('invCustomTax').oninput = previewInvoice;
    loadInvExperts();

     // Close approach action dropdowns when clicking outside
    document.addEventListener('click', function() {
      document.querySelectorAll('[id^="ap_"]').forEach(function(d) { d.style.display = 'none'; });
    });
     
    /* modal close buttons */
    document.addEventListener('click', function(ev) {
      var cl = ev.target.closest('[data-close]');
      if (cl) { closeModal(cl.dataset.close); }
    });

    /* modal submits */
    g('creditSubmit').onclick = submitCredit;
    g('pwSubmit').onclick = submitPw;
    g('savePostBtn').onclick = savePost;
    g('deletePostBtn').onclick = deletePost;
    g('tkApproveBtn').onclick = function() { processTicket('approve'); };
    g('tkRejectBtn').onclick = function() { processTicket('reject'); };
    g('tkResolveBtn').onclick = function() { processTicket('resolve'); };
    g('dmSubmit').onclick = submitDm;
    g('kycApproveBtn').onclick = function() { processKyc('approve'); };
    g('kycRejectBtn').onclick = function() { processKyc('reject'); };
    g('sendAnnBtn').onclick = sendAnnouncement;
    g('hmRole').onchange = function() { loadHeatmap(); };
    g('hmRefresh').onclick = function() { loadHeatmap(); };
    /* delegated: open DM modal */
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-dm-uid]');
      if (btn) { ev.preventDefault(); openDmModal(btn.dataset.dmUid, btn.dataset.dmName); return; }
      var tkb = ev.target.closest('[data-tk-uid]');
      if (tkb) { ev.preventDefault(); openCreateTicketModal(tkb.dataset.tkUid, tkb.dataset.tkName, tkb.dataset.tkRole); return; }
      var kb = ev.target.closest('[data-kyc-uid]');
      if (kb) { ev.preventDefault(); openKycModal(kb.dataset.kycUid, kb.dataset.kycName); return; }
      var hb = ev.target.closest('[data-hm-state]');
      if (hb) { ev.preventDefault(); drillHeatmap(hb.dataset.hmState); return; }
    });

    /* delegated: open user drawer */
    document.addEventListener('click', function(ev) {
      var el = ev.target.closest('[data-uid]');
      if (el && !ev.defaultPrevented) { openDr(el.dataset.uid); }
    });
    /* delegated: stat card nav */
    document.addEventListener('click', function(ev) {
      var el = ev.target.closest('[data-goto]');
      if (!el) return;
      var gt = el.dataset.goto;
      if (gt === 'credits-purchase') { goTo('credits'); g('crType').value = 'purchase'; loadCredits(); }
      else if (gt === 'credits-spent') { goTo('credits'); g('crType').value = 'spent'; loadCredits(); }
      else if (gt === 'credits-refund') { goTo('credits'); g('crType').value = 'refund'; loadCredits(); }
      else { goTo(gt); }
    });
    /* delegated: ledger + action uid buttons in drawer */
    document.addEventListener('click', function(ev) {
      var lb = ev.target.closest('[data-ledger-uid]');
      if (lb) { ev.preventDefault(); openLedger(lb.dataset.ledgerUid); return; }
      var ab = ev.target.closest('[data-action-uid]');
      if (ab) { ev.preventDefault(); closeDr(); goActId(ab.dataset.actionUid); return; }
      var cb = ev.target.closest('[data-credit-uid]');
      if (cb) { ev.preventDefault(); openCreditModal(cb.dataset.creditUid, cb.dataset.creditName, cb.dataset.creditBal); return; }
      var pb = ev.target.closest('[data-pw-uid]');
      if (pb) { ev.preventDefault(); openPwModal(pb.dataset.pwUid, pb.dataset.pwName); return; }
    });
    /* delegated: chat view */
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-cid]');
      if (btn) { ev.preventDefault(); viewChat(btn.dataset.cid, btn.dataset.en, btn.dataset.cn, btn.dataset.rt); }
    });
    /* delegated: approve/reject refunds */
    document.addEventListener('click', function(ev) {
      var ap = ev.target.closest('[data-approve]');
      if (ap) {
        ev.preventDefault();
        var id = ap.dataset.approve, cr = ap.dataset.credits;
        if (!confirm('Approve ' + cr + ' credits?')) return;
        var note = ''; var nt = g('tn-' + id); if (nt) note = nt.value;
        api('tickets/' + id + '/approve', 'POST', { note: note }).then(function(d) {
          if (d.success) { toast('Approved: ' + d.creditsAdded + ' credits'); var c = g('tc-' + id); if (c) c.parentNode.removeChild(c); loadDashboard(); }
          else toast(d.message || 'Failed', 'e');
        }).catch(function() { toast('Error', 'e'); });
        return;
      }
      var rj = ev.target.closest('[data-reject]');
      if (rj) {
        ev.preventDefault();
        var rid = rj.dataset.reject;
        if (!confirm('Reject this refund?')) return;
        var rnote = ''; var rnt = g('tn-' + rid); if (rnt) rnote = rnt.value;
        api('tickets/' + rid + '/reject', 'POST', { note: rnote }).then(function(d) {
          if (d.success) { toast('Rejected', 'i'); var rc = g('tc-' + rid); if (rc) rc.parentNode.removeChild(rc); }
          else toast(d.message || 'Failed', 'e');
        }).catch(function() { toast('Error', 'e'); });
      }
    });
    /* delegated: action buttons (ban/warn/flag) */
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-act]');
      if (!btn) return;
      ev.preventDefault(); ev.stopPropagation();
      var act = btn.dataset.act, uid = btn.dataset.uid, nm = btn.dataset.nm;
      if (act === 'warn') {
        var reason = prompt('Warning reason for ' + nm + ':');
        if (!reason) return;
        doAct(uid, act, reason);
      } else if (act === 'restrict') {
        var rReason = prompt('Restriction reason for ' + nm + ' (this will directly restrict the account):');
        if (!rReason) return;
        // Set warnings to 3 and restrict via warn action x3 — or use unrestrict+warn shortcut
        // We call warn 3 times isn't clean, so use a direct approach:
        api('users/' + uid + '/action', 'POST', { action: 'warn', reason: rReason })
          .then(function() { return api('users/' + uid + '/action', 'POST', { action: 'warn', reason: rReason }); })
          .then(function() { return api('users/' + uid + '/action', 'POST', { action: 'warn', reason: rReason }); })
          .then(function(d) { toast(d.message || 'Restricted'); searchActions(); })
          .catch(function() { toast('Error', 'e'); });
      } else if (act === 'delete') {
        if (!confirm('PERMANENTLY DELETE ' + nm + '? This cannot be undone.')) return;
        var confirmName = prompt('Type the user name to confirm deletion:');
        if (confirmName !== nm) { toast('Name did not match — deletion cancelled', 'e'); return; }
        api('users/' + uid, 'DELETE').then(function(d) {
          if (d.success) { toast('User deleted permanently'); searchActions(); }
          else toast(d.message || 'Failed', 'e');
        }).catch(function() { toast('Error', 'e'); });
      } else {
        if (!confirm(act + ' ' + nm + '?')) return;
        doAct(uid, act, '');
      }
    });
    /* delegated: post edit */
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-edit-post]');
      if (btn) { ev.preventDefault(); openPostModal(btn.dataset.editPost); }
    });
    /* delegated: review delete */
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-del-review]');
      if (btn) {
        ev.preventDefault();
        if (!confirm('Delete this review?')) return;
        api('ratings/' + btn.dataset.delReview, 'DELETE').then(function(d) {
          if (d.success) { toast('Review deleted'); loadReviews(); }
          else toast(d.message || 'Failed', 'e');
        }).catch(function() { toast('Error', 'e'); });
      }
    });
    /* delegated: registration approve/reject */
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-reg-action]');
      if (btn) {
        ev.preventDefault();
        var uid = btn.dataset.regAction, action = btn.dataset.action, nm = btn.dataset.nm;
        if (!confirm(action + ' ' + nm + '?')) return;
        api('users/' + uid + '/action', 'POST', { action: action }).then(function(d) {
          if (d.success) { toast(d.message); loadRegistrations(); }
          else toast(d.message || 'Failed', 'e');
        }).catch(function() { toast('Error', 'e'); });
      }
    });
    /* delegated: open ticket detail */
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-tk-id]');
      if (btn) { ev.preventDefault(); openTicketModal(btn.dataset.tkId); }
    });
    /* delegated: add manual refund */
    document.addEventListener('click', function(ev) {
      var btn = ev.target.closest('[data-manual-refund]');
      if (btn) { ev.preventDefault(); openCreditModal(btn.dataset.manualRefund, btn.dataset.nm, btn.dataset.bal); }
    });
  }

  /* ═══ DATE FILTER ════════════════════════════════════════════════════════ */
  function applyDates() {
    var f = g('dfF').value, t = g('dfT').value;
    if (!f && !t) { toast('Select at least one date', 'i'); return; }
    dF = f; dT = t;
    refresh();
    toast('Date filter applied', 'i');
  }
  function clearDates() {
    dF = ''; dT = '';
    g('dfF').value = ''; g('dfT').value = '';
    refresh();
  }

  /* ═══ AUTH ═══════════════════════════════════════════════════════════════ */
  function doLogin() {
    var id = g('liId').value.trim(), pw = g('liPw').value;
    g('lerr').textContent = '';
    if (!id || !pw) { g('lerr').textContent = 'Please fill all fields'; return; }
    g('lerr').textContent = 'Signing in...';
    g('lerr').style.color = '#a0a0b8';
    fetch(API + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: id, password: pw }) })
      .then(function(r) { return r.json(); })
      .then(function(r) {
        g('lerr').style.color = '#ef4444';
        if (r.success) {
          tok = r.token; adm = r.admin;
          localStorage.setItem('admTok', tok);
          localStorage.setItem('admData', JSON.stringify(adm));
          localStorage.setItem(ADMIN_LAST_ACTIVE_KEY, String(Date.now()));
          clearAdminLoginFields();
          showApp();
        } else { g('lerr').textContent = r.message || 'Invalid credentials'; }
      })
      .catch(function(err) { g('lerr').style.color = '#ef4444'; g('lerr').textContent = 'Connection failed: ' + err.message; });
  }

  function showApp() {
    g('loginWrap').style.display = 'none';
    g('appWrap').style.display = 'block';
    startAdminInactivity();

     // Tab visibility enforcement
    var allowedTabs = adm && adm.allowedTabs && adm.allowedTabs.length ? adm.allowedTabs : null;
    var superOnlyTabs = ['admins','audit','revenue','emailNotifications','settings','communication','invoices','heatmap'];

    document.querySelectorAll('.ni[data-s], .mni[data-s]').forEach(function(el) {
      var tab = el.dataset.s;
      if (!tab) return;
      // Super admin sees everything
      if (adm && adm.role === 'super_admin') return;
      // Hide super-only tabs for all non-super admins
      if (superOnlyTabs.indexOf(tab) >= 0) {
        el.style.display = 'none'; return;
      }
      // If allowedTabs is set, only show those tabs
      if (allowedTabs && allowedTabs.indexOf(tab) < 0) {
        el.style.display = 'none';
      }
    });
     
    // Dashboard stat card clicks
    document.addEventListener('click', function(ev) {
      var sc = ev.target.closest('[data-goto]');
      if (sc) { ev.preventDefault(); goTo(sc.dataset.goto); }
    });
    var nm = (adm && adm.name) ? adm.name : 'Admin';
    g('sbNm').textContent = nm; g('sbId').textContent = (adm && adm.adminId) || ''; g('sbAv').textContent = nm.charAt(0).toUpperCase();
    if(g('msbNm')) g('msbNm').textContent = nm;
    if(g('msbId')) g('msbId').textContent = (adm && adm.adminId) || '';
    if(g('msbAv')) g('msbAv').textContent = nm.charAt(0).toUpperCase();
    loadDashboard();
  }

  function doLogout(expired) {
    stopAdminInactivity();
    clearAdminSession();
    clearAdminLoginFields();
    g('appWrap').style.display = 'none';
    g('loginWrap').style.display = 'flex';
    if (expired && g('lerr')) {
      g('lerr').style.color = '#ef4444';
      g('lerr').textContent = 'Session expired. Please log in again.';
    }
  }

  /* ═══ API ════════════════════════════════════════════════════════════════ */
  function api(path, method, body, noauth) {
    var opts = { method: method || 'GET', headers: { 'Content-Type': 'application/json' } };
    if (!noauth && tok) { opts.headers['Authorization'] = 'Bearer ' + tok; }
    if (body) { opts.body = JSON.stringify(body); }
    return fetch(API + '/' + path, opts).then(function(r) { return r.json(); });
  }

  function qs(obj) {
    var p = [];
    if (obj) { Object.keys(obj).forEach(function(k) { if (obj[k] && obj[k] !== 'all') p.push(k + '=' + encodeURIComponent(obj[k])); }); }
    if (dF) p.push('from=' + dF);
    if (dT) p.push('to=' + dT);
    return p.length ? '?' + p.join('&') : '';
  }

  /* ═══ NAVIGATION ═════════════════════════════════════════════════════════ */
  function refresh() {
    var a = document.querySelector('.sec.on'); if (!a) return;
    var s = a.id.replace('sec-', '');
    var m = sectionLoaders();
    if (m[s]) m[s]();
  }

  function sectionLoaders() {
    return {
      dashboard: loadDashboard,
      heatmap: loadHeatmap,
      experts: function() { loadUsers('expert'); },
      boosts: loadBoosts,
      clients: function() { loadUsers('client'); },
      approaches: loadApproaches,
      chats: loadChats,
      credits: loadCredits,
      refunds: loadRefunds,
      actions: function() { loadAllActions(); },
       tickets: loadTickets,
      posts: loadPosts,
      reviews: loadReviews,
      registrations: loadRegistrations,
             kyc: loadKycRequests,
      payments: loadPayments,
      communication: function() { loadCommHistory(); },
      invoices: function() { loadInvExperts(); },
      settings: function() { loadSettingsTab(); },
       suspReq: loadSuspendedRequests,
       reports: loadReports,
emailNotifications: loadEmailNotifications,
       revenue: loadRevenue,
         audit: loadAudit,
       admins: loadAdmins,
       seo: loadSeoPages,
       serviceCategories: loadServiceCategories
    };
  }

  var PT = { admins:'Manage Admins', dashboard:'Dashboard', revenue:'Revenue Dashboard', audit:'Audit Log', heatmap:'Geographic Heatmap', experts:'Experts', clients:'Clients', approaches:'Approaches', chats:'Chats', credits:'Credits', refunds:'Refunds', actions:'Actions', tickets:'Tickets', posts:'Posts', reviews:'Reviews', registrations:'Registrations', kyc:'KYC Review', payments:'Payments', communication:'Communication', invoices:'Invoices', settings:'Settings', suspReq:'Suspended Requests', reports:'Reports', seo: 'SEO Pages', serviceCategories: 'Service Categories', emailNotifications: 'Email Notifications' };
  var PS = { admins:'Create and manage admin accounts with role-based permissions', dashboard:'Platform overview', revenue:'Credits, earnings & service breakdown', audit:'Full filterable activity log', heatmap:'Expert & client locations across India', experts:'All registered experts', clients:'All registered clients', approaches:'Expert approach activity', chats:'All conversations', credits:'Credit ledger', refunds:'Pending refund requests', actions:'Ban, warn and flag users', tickets:'All support tickets', posts:'User posted requests', reviews:'Ratings & reviews', registrations:'Expert approval queue', kyc:'Identity verification queue', payments:'Failed payment tracking', communication:'Bulk email & notifications', invoices:'Generate invoices', settings:'Admin configuration & platform management', suspReq:'Posts flagged by 3+ experts pending admin review', reports:'All user reports and admin actions' , seo: 'Create and manage SEO landing pages — auto-published to Netlify', serviceCategories: 'Manage service categories and questionnaire — auto-published to Vercel', emailNotifications: 'Email logs and notification settings'};  function goTo(s) {
    PT.boosts = 'Score-Based Boosts';
    PS.boosts = 'Control public ranking with automatic score plus admin boost';
    qa('.sec').forEach(function(e) { e.classList.remove('on'); });
    qa('.ni').forEach(function(e) { e.classList.remove('on'); });
    qa('.mni').forEach(function(e) { e.classList.remove('on'); });
    var sec = g('sec-' + s); if (sec) sec.classList.add('on');
    qa('[data-s="' + s + '"]').forEach(function(el){ el.classList.add('on'); });
    g('ptitle').textContent = PT[s] || s;
    g('psub').textContent = PS[s] || '';
    var m = sectionLoaders();
    if (m[s]) m[s]();
  }

  /* ═══ HELPERS ════════════════════════════════════════════════════════════ */
  function fmt(d) { return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'; }
  function fmtT(d) { return d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'; }

  function toast(msg, t) {
    var el = document.createElement('div'); el.className = 'toast-el ' + (t || 's'); el.textContent = msg;
    document.body.appendChild(el); setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 3500);
  }

  function bdg(s) {
    var m = { pending:'byw', accepted:'bgr', rejected:'brd', active:'bbl', completed:'bgr', cancelled:'brd', purged:'bgy', resolved:'btl', pending_review:'byw', client:'bbl', expert:'bo', banned:'brd', open:'bbl', flagged:'brd', approved:'bgr' };
    return '<span class="badge ' + (m[s] || 'bgy') + '">' + esc(s) + '</span>';
  }
  function ust(u) {
    if (u.isBanned) return '<span class="badge brd">Banned</span>';
      if (u.isRestricted) return '<span class="badge brd">Restricted</span>';
    if (u.isFlagged) return '<span class="badge byw">Flagged</span>';
    return '<span class="badge bgr">Active</span>';
  }
  function stars(n) { var s = ''; for (var i=0;i<5;i++) s += (i<n?'&#11088;':'&#9734;'); return '<span style="font-size:11px">' + s + '</span>'; }
  function setT(id, html) { var el = g(id); if (el) el.innerHTML = html || '<tr><td colspan="20" style="text-align:center;padding:30px;color:#606078">No data found</td></tr>'; }
  function spin() { return '<tr><td colspan="20" style="text-align:center;padding:24px"><div class="spin"></div></td></tr>'; }
  function uLnk(uid, name, col) { return '<span data-uid="' + esc(uid) + '" style="cursor:pointer;color:' + (col || '#FC8019') + ';font-weight:600">' + esc(name) + '</span>'; }

  function openModal(id) { var m = g(id); if (m) m.classList.add('on'); }
  function closeModal(id) { var m = g(id); if (m) m.classList.remove('on'); }

  /* ═══ EXPORT CSV ═════════════════════════════════════════════════════════ */
  function exportCSV(data, filename) {
    if (!data.length) { toast('No data to export', 'i'); return; }
    var keys = Object.keys(data[0]);
    var csv = keys.join(',') + '\n' + data.map(function(row) {
      return keys.map(function(k) {
        var v = row[k] || '';
        return '"' + String(v).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\n');
    var a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = filename + '.csv';
    a.click();
  }

  /* ═══ DASHBOARD ══════════════════════════════════════════════════════════ */
