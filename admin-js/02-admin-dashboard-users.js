  function loadDashboard() {
    api('stats' + qs({})).then(function(d) {
      if (!d.success) return;
      var st = d.stats, cr = st.credits || {};
      g('sgrid').innerHTML = [
        sc('Total Clients', st.totalClients, 'cb', 'clients'),
        sc('Total Experts', st.totalExperts, 'co', 'experts'),
        sc('Approaches', st.totalApproaches, '', 'approaches', (st.openApproaches||0) + ' open / ' + (st.closedApproaches||0) + ' closed'),
        sc('Requests', st.totalRequests, '', 'posts'),
        sc('Reviews', st.totalReviews || 0, 'cy', 'reviews'),
        sc('Credits Purchased', cr.totalPurchased || 0, 'cg', 'credits-purchase'),
        sc('Amount Paid (₹)', '₹' + (cr.totalAmountPaid || 0).toLocaleString('en-IN'), 'cg', 'credits'),
        sc('Credits Spent', cr.totalSpent || 0, 'co', 'credits-spent'),
        sc('Credits Refunded', cr.totalRefunded || 0, 'cpu', 'credits-refund'),
        sc('Pending Refunds', st.pendingRefunds || 0, 'cy', 'refunds'),
        sc('Open Tickets', st.openTickets || 0, 'cb', 'tickets')
      ].join('');
      var rb = g('rbadge'); if ((st.pendingRefunds||0) > 0) { rb.textContent = st.pendingRefunds; rb.style.display = 'inline-block'; }
      var tb = g('tkbadge'); if ((st.openTickets||0) > 0) { tb.textContent = st.openTickets; tb.style.display = 'inline-block'; }
      setT('recentTbl', (d.recentUsers || []).map(function(u) {
        return '<tr><td>' + uLnk(u._id, u.name) + '</td><td>' + bdg(u.role) + '</td><td style="font-size:12px;color:#a0a0b8">' + esc(u.email) + '</td><td style="color:#f59e0b">' + (u.credits || 0) + '</td><td style="font-size:12px;color:#a0a0b8">' + fmt(u.createdAt) + '</td></tr>';
      }).join(''));
    }).catch(function(e) { console.error('Dashboard err:', e); });
  }

  function sc(label, val, col, goto_, sub) {
    var cl = goto_ ? ' cl" data-goto="' + goto_ + '"' : '"';
    var colorMap = { cb:'#3b82f6', co:'#FC8019', cg:'#22c55e', cy:'#f59e0b', cpu:'#a855f7', cblu:'#3b82f6', '':'#f0f0f4' };
    var clr = colorMap[col] || '#f0f0f4';
    return '<div class="sc' + cl + '><div class="sclbl">' + label + '</div><div class="scval" style="color:' + clr + '">' + val + '</div>' + (sub ? '<div class="scsub">' + sub + '</div>' : '') + (goto_ ? '<div class="sclink">View &rarr;</div>' : '') + '</div>';
  }

  /* ═══ USERS ══════════════════════════════════════════════════════════════ */
  function loadUsers(role) {
    var si = role === 'expert' ? 'eSrch' : 'cSrch', ti = role === 'expert' ? 'eTbl' : 'cTbl';
    var key = role === 'expert' ? 'experts' : 'clients';
    var srch = g(si) ? g(si).value : '';
    _pages[key] = 1;
    setT(ti, spin());
    api('users' + qs({ role: role, search: srch })).then(function(d) {
      if (!d.success) { setT(ti, ''); return; }
      var card = document.querySelector('#sec-' + (role==='expert'?'experts':'clients') + ' .ch');
      if (card && !card.querySelector('.exp-btn')) {
        var eb = document.createElement('button');
        eb.className = 'btn bgho exp-btn'; eb.textContent = 'Export CSV';
        eb.onclick = function() {
          exportCSV((d.users||[]).map(function(u) {
            return { Name: u.name, Email: u.email, Phone: u.phone||'', Role: u.role, Credits: u.credits||0, Status: u.isBanned?'Banned':u.isFlagged?'Flagged':'Active', Joined: fmt(u.createdAt) };
          }), role + 's-export');
        };
        card.appendChild(eb);
      }
      pagSlice(key, d.users || []);
      renderUsersPage(role);
    }).catch(function() { setT(ti, ''); });
  }

  function renderUsersPage(role) {
    var key = role === 'expert' ? 'experts' : 'clients';
    var ti = role === 'expert' ? 'eTbl' : 'cTbl';
    var page = pagSlice(key, _pageData[key] || []);
    var existing = document.getElementById('pag-' + key);
    if (existing) existing.remove();
    if (role === 'expert') {
  setT('eTbl', page.map(function(u) {
    var str = calculateAdminProfileStrength(u);
    var strColor = str.score >= 70 ? '#22c55e' : str.score >= 40 ? '#f59e0b' : '#ef4444';
    var strBar = '<div style="display:flex;align-items:center;gap:6px;">' +
      '<div style="width:48px;height:5px;background:#2a2a38;border-radius:3px;overflow:hidden;">' +
        '<div style="height:100%;width:' + str.score + '%;background:' + strColor + ';border-radius:3px;"></div>' +
      '</div>' +
      '<span style="font-size:12px;font-weight:700;color:' + strColor + ';">' + str.score + '</span>' +
    '</div>';
    return '<tr><td>' + uLnk(u._id, u.name) + '</td><td style="font-size:12px;color:#a0a0b8">' + esc(u.email) + '</td><td style="font-size:12px">' + (u.phone||'-') + '</td><td style="color:#f59e0b">' + (u.credits||0) + '</td><td>' + (u.rating||'-') + '</td><td>' + strBar + '</td><td>' + ust(u) + '</td><td style="font-size:12px;color:#a0a0b8">' + fmt(u.createdAt) + '</td><td><span class="btn bgho" data-uid="' + esc(u._id) + '">View</span></td></tr>';
  }).join(''));
    } else {
      setT('cTbl', page.map(function(u) {
        return '<tr><td>' + uLnk(u._id, u.name) + '</td><td style="font-size:12px;color:#a0a0b8">' + esc(u.email) + '</td><td style="font-size:12px">' + (u.phone||'-') + '</td><td>' + ust(u) + '</td><td style="font-size:12px;color:#a0a0b8">' + fmt(u.createdAt) + '</td><td><span class="btn bgho" data-uid="' + esc(u._id) + '">View</span></td></tr>';
      }).join(''));
    }
    pagHTML(key, ti);
  }

  /* ═══ USER DRAWER ════════════════════════════════════════════════════════ */
  function scoreForRanking(u) {
    var profileScore = calculateAdminProfileStrength(u).score;
    var ratingScore = Math.min(((Number(u.rating) || 0) / 5) * 30, 30);
    var approachScore = Math.min((Number(u.totalApproaches) || 0) * 2, 20);
    var adminBoost = Math.max(0, Math.min(Number(u.adminBoost || u.rankingBoost || 0), 50));
    return Math.round(profileScore * 0.5 + ratingScore + approachScore + adminBoost);
  }

  function compareExpertRanking(a, b) {
    var ar = Number(a.adminRank || 0);
    var br = Number(b.adminRank || 0);
    if (ar > 0 && br > 0 && ar !== br) return ar - br;
    if (ar > 0 && !br) return -1;
    if (!ar && br > 0) return 1;
    return scoreForRanking(b) - scoreForRanking(a);
  }

  function loadBoosts() {
    var refreshBtn = g('boostRefresh');
    if (refreshBtn) refreshBtn.onclick = loadBoosts;
    setT('boostTbl', spin());
    api('expert-boosts').then(function(d) {
      if (!d.success) { setT('boostTbl', ''); return; }
      var experts = (d.experts || d.users || []).slice().sort(compareExpertRanking);
      setT('boostTbl', experts.map(function(u) {
        var profile = calculateAdminProfileStrength(u).score;
        var boost = Number(u.adminBoost || u.rankingBoost || 0);
        var rank = u.adminRank === null || u.adminRank === undefined ? '' : Number(u.adminRank || 0);
        var combined = scoreForRanking(u);
        return '<tr>' +
          '<td><input type="number" min="1" id="rank_' + esc(u._id) + '" value="' + (rank || '') + '" placeholder="Auto" style="width:70px;padding:7px 8px;background:#18181d;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
          '<td>' + uLnk(u._id, u.name) + '<br><small style="color:#606078">' + esc(u.email || '') + '</small></td>' +
          '<td style="color:#f59e0b">' + (u.rating ? Number(u.rating).toFixed(1) : '-') + '</td>' +
          '<td>' + (u.totalApproaches || 0) + '</td>' +
          '<td>' + profile + '</td>' +
          '<td><input type="number" min="0" max="50" id="boost_' + esc(u._id) + '" value="' + boost + '" style="width:76px;padding:7px 8px;background:#18181d;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
          '<td><span class="badge ' + (combined >= 80 ? 'bgr' : combined >= 50 ? 'byw' : 'brd') + '">' + combined + '</span></td>' +
          '<td>' + (u.profileViews || u.profileViewCount || 0) + '</td>' +
          '<td><button class="btn bpri" style="font-size:12px;padding:6px 12px" onclick="saveExpertBoost(\'' + esc(u._id) + '\')">Save</button></td>' +
        '</tr>';
      }).join(''));
    }).catch(function() { setT('boostTbl', ''); });
  }

  window.saveExpertBoost = function(uid) {
    var input = g('boost_' + uid);
    var rankInput = g('rank_' + uid);
    var adminBoost = Math.max(0, Math.min(Number(input && input.value) || 0, 50));
    var rawRank = rankInput ? String(rankInput.value || '').trim() : '';
    var adminRank = rawRank ? Math.max(1, Number(rawRank) || 0) : null;
    api('experts/' + uid + '/boost', 'PUT', { adminBoost: adminBoost, adminRank: adminRank }).then(function(d) {
      if (d.success) { toast('Boost saved'); loadBoosts(); return; }
      return api('users/' + uid, 'PUT', { adminBoost: adminBoost, adminRank: adminRank }).then(function(d2) {
        if (d2.success) { toast('Boost saved'); loadBoosts(); }
        else toast(d2.message || d.message || 'Failed to save boost', 'e');
      });
    }).catch(function() { toast('Failed to save boost', 'e'); });
  };

  function openDr(uid) {
    if (!uid) return;
    g('ov1').classList.add('on'); g('dr1').classList.add('on');
    g('drB').innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';
    g('drTabs').innerHTML = '';
    api('users/' + uid + qs({})).then(function(d) {
      if (!d.success) { g('drB').innerHTML = '<div class="empty"><h3>Failed to load</h3></div>'; return; }
      g('drT').textContent = d.user.name;
      buildDr(d.user, d);
    }).catch(function() { g('drB').innerHTML = '<div class="empty"><h3>Error</h3></div>'; });
  }

   /* ═══ PROFILE STRENGTH ═══════════════════════════════════════════════════ */
function calculateAdminProfileStrength(u) {
  var pr = u.profile || {};

  // ── Normalize questionnaire keys (same as app.js renderExpertProfile) ──
  var bio            = pr.bio            || pr.expert_bio            || '';
  var specialization = pr.specialization || pr.expert_specialization || u.specialization || '';
  var locDet         = (pr.expert_location_details && typeof pr.expert_location_details === 'object') ? pr.expert_location_details : null;
  var city           = pr.city           || pr.expert_city           || (locDet && locDet.city)    || (u.location && u.location.city)    || '';
  var pincode        = pr.pincode        || pr.expert_pincode        || (locDet && locDet.pincode) || (u.location && u.location.pincode) || '';
  var experience     = pr.experience     || pr.expert_experience     || u.yearsOfExperience || '';
   var businessType   = pr.businessType   || pr.expert_business_type  || '';
  var teamSize       = pr.teamSize       || pr.expert_team_size       || '';
  var gstNumber      = pr.gstNumber      || pr.expert_gst_number || pr.gst_number || '';
  var licenseNumber  = pr.licenseNumber  || pr.expert_license_number || pr.license_number || pr.professionalLicense || '';
  var certNum        = pr.certificationNumber || pr.expert_certification_number || pr.certification_number || '';
  var education      = pr.education      || pr.expert_education || '';
  var portfolio      = pr.portfolio      || pr.expert_portfolio || '';
  var profAddress    = pr.professionalAddress || pr.expert_professional_address || pr.professional_address || pr.address || '';

  var items = [
    { label: 'Profile photo',        done: !!u.profilePhoto,                     pts: 10 },
    { label: 'Bio (30+ chars)',       done: !!(bio && bio.length >= 30),          pts: 10 },
    { label: 'Specialization',       done: !!specialization,                     pts: 10 },
    { label: 'City + Pincode',       done: !!(city && pincode),                  pts: 10 },
    { label: 'GST / License / Cert', done: !!(gstNumber || licenseNumber || certNum), pts: 8  },
    { label: 'Education',            done: !!(education && education.trim()),     pts: 8  },
    { label: 'Portfolio / Proof',    done: !!(portfolio && portfolio.trim()),     pts: 8  },
    { label: 'Experience',           done: !!experience,                         pts: 8  },
    { label: 'Professional address', done: !!(profAddress && profAddress.trim()), pts: 8  },
    { label: 'At least 1 review',   done: (u.reviewCount || 0) >= 1,            pts: 5  },
    { label: 'At least 1 approach', done: (u.totalApproaches || 0) >= 1,        pts: 5  },
    { label: 'KYC verified',         done: !!(u.kyc && u.kyc.status === 'approved'), pts: 10 },
  ];

  var score = 0;
  items.forEach(function(c) { if (c.done) score += c.pts; });
  return { score: Math.min(score, 100), items: items };
}
function renderAdminStrengthMeter(u) {
  var result  = calculateAdminProfileStrength(u);
  var score   = result.score;
  var items   = result.items;
  var missing = items.filter(function(i) { return !i.done; });
  var done    = items.filter(function(i) { return i.done; });

  var label, color, bg;
  if      (score >= 90) { label = 'Elite';   color = '#10b981'; bg = 'rgba(16,185,129,0.12)'; }
  else if (score >= 70) { label = 'Strong';  color = '#3b82f6'; bg = 'rgba(59,130,246,0.12)'; }
  else if (score >= 50) { label = 'Good';    color = '#f59e0b'; bg = 'rgba(245,158,11,0.12)'; }
  else if (score >= 30) { label = 'Fair';    color = '#f97316'; bg = 'rgba(249,115,22,0.12)'; }
  else                  { label = 'Starter'; color = '#ef4444'; bg = 'rgba(239,68,68,0.12)'; }

  var radius = 28, circ = +(2 * Math.PI * radius).toFixed(1);
  var dash   = +((score / 100) * circ).toFixed(1);

  var missingRows = missing.length
    ? missing.map(function(i) {
        return '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;">' +
          '<span style="font-size:11px;color:#606078;">○</span>' +
          '<span style="font-size:12px;color:#a0a0b8;">' + i.label + '</span>' +
          '<span style="font-size:10px;color:#FC8019;margin-left:auto;">+' + i.pts + 'pts</span>' +
        '</div>';
      }).join('')
    : '<div style="font-size:12px;color:#22c55e;padding:3px 0;">🎉 All sections complete!</div>';

  return '<div style="background:#18181d;border-radius:12px;padding:16px;margin-bottom:14px;">' +

    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:' + (missing.length ? '12' : '0') + 'px;">' +

      '<div style="position:relative;flex-shrink:0;width:64px;height:64px;">' +
        '<svg width="64" height="64" style="transform:rotate(-90deg);">' +
          '<circle cx="32" cy="32" r="' + radius + '" fill="none" stroke="#2a2a38" stroke-width="6"/>' +
          '<circle cx="32" cy="32" r="' + radius + '" fill="none" stroke="' + color + '" stroke-width="6"' +
            ' stroke-dasharray="' + dash + ' ' + circ + '" stroke-linecap="round"/>' +
        '</svg>' +
        '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">' +
          '<span style="font-size:17px;font-weight:800;color:#f0f0f4;line-height:1;">' + score + '</span>' +
          '<span style="font-size:9px;color:#606078;">/ 100</span>' +
        '</div>' +
      '</div>' +

      '<div style="flex:1;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">' +
          '<span style="font-size:14px;font-weight:700;color:#f0f0f4;">Profile Strength</span>' +
          '<span style="padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;background:' + bg + ';color:' + color + ';">' + label + '</span>' +
        '</div>' +
        '<div style="height:6px;background:#2a2a38;border-radius:3px;overflow:hidden;margin-bottom:5px;">' +
          '<div style="height:100%;width:' + score + '%;background:' + color + ';border-radius:3px;"></div>' +
        '</div>' +
        '<div style="font-size:11px;color:#606078;">' + done.length + ' / ' + items.length + ' sections complete</div>' +
      '</div>' +
    '</div>' +

    (missing.length
      ? '<div style="border-top:1px solid #222230;padding-top:10px;">' +
          '<div style="font-size:10px;font-weight:700;color:#606078;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">Missing from profile</div>' +
          missingRows +
        '</div>'
      : '') +

  '</div>';
}

function buildDr(u, d) {
    var tabs = ['Profile', 'Transactions', u.role === 'expert' ? 'Approaches' : 'Requests', 'Tickets'];
    g('drTabs').innerHTML = tabs.map(function(t, i) {
      return '<div class="drt' + (i===0?' on':'') + '" data-panel="dp' + i + '">' + t + '</div>';
    }).join('');
    g('drTabs').addEventListener('click', function(ev) {
      var tab = ev.target.closest('.drt'); if (!tab) return;
      qa('.drt').forEach(function(e) { e.classList.remove('on'); });
      qa('.drp').forEach(function(e) { e.classList.remove('on'); });
      tab.classList.add('on');
      var p = g(tab.dataset.panel); if (p) p.classList.add('on');
    });

    var pr = u.profile || {};
var av = u.profilePhoto ? '<img src="' + esc(u.profilePhoto) + '" alt="">' : esc((u.name||'?').charAt(0).toUpperCase());
var p0 = '<div class="uhero"><div class="uav">' + av + '</div><div class="uhi"><h3>' + esc(u.name) + '</h3><p>' + esc(u.email) + ' / ' + esc(u.phone||'No phone') + '</p><div style="display:flex;gap:5px;flex-wrap:wrap">' + bdg(u.role) + ust(u) + (u.warnings ? '<span class="badge bo">' + u.warnings + ' warns</span>' : '') + '</div></div></div>';

var loc = u.location || {};
var locDet2 = (pr.expert_location_details && typeof pr.expert_location_details === 'object') ? pr.expert_location_details : null;
var locStr = [loc.city, loc.state, loc.pincode].filter(Boolean).join(', ')
  || [pr.city || (locDet2 && locDet2.city), pr.state || (locDet2 && locDet2.state), pr.pincode || (locDet2 && locDet2.pincode)].filter(Boolean).join(', ')
  || '-';
var kycStatus = (u.kyc && u.kyc.status) || 'not_submitted';
var kycColor = kycStatus==='approved'?'#22c55e':kycStatus==='pending'?'#f59e0b':kycStatus==='rejected'?'#ef4444':'#606078';
var warnColor = (u.warnings||0)>=3?'#ef4444':(u.warnings||0)>0?'#f59e0b':'#22c55e';
var lastLoginStr = u.lastLogin
  ? new Date(u.lastLogin).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }) + ' IST'
  : '<span style="color:#606078;font-style:italic">Never logged in</span>';
     
p0 += '<div style="display:flex;flex-direction:column;gap:12px;margin-top:4px">';

// ── Stat cards ──
p0 += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px"><div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Credits</div><div style="font-size:24px;font-weight:800;color:#f59e0b">' + (u.credits||0) + '</div></div>';
p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px"><div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Rating</div><div style="font-size:24px;font-weight:800;color:#FC8019">' + (u.rating||'–') + '<span style="font-size:12px;color:#606078;font-weight:400;margin-left:4px">(' + (u.reviewCount||0) + ')</span></div></div>';
p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px"><div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Warnings</div><div style="font-size:24px;font-weight:800;color:' + warnColor + '">' + (u.warnings||0) + '<span style="font-size:13px;color:#606078;font-weight:400">/3</span></div></div>';
p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px"><div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Approaches</div><div style="font-size:24px;font-weight:800;color:#f0f0f4">' + (u.totalApproaches||0) + '</div></div>';
p0 += '</div>';

// ── Profile strength (experts only) ──
if (u.role === 'expert') {
  p0 += renderAdminStrengthMeter(u);
}
              
// ── Account info card ──
p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:0">';
p0 += '<div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:10px">Account Info</div>';
p0 += '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #222230"><span style="font-size:12px;color:#606078">Signup Time</span><span style="font-size:13px;color:#f0f0f4;text-align:right">' + (u.createdAt ? fmtT(u.createdAt) : '-') + '</span></div>';
p0 += '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #222230"><span style="font-size:12px;color:#606078">Last Login</span><span style="font-size:13px;color:#f0f0f4">' + lastLoginStr + '</span></div>';
p0 += '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #222230"><span style="font-size:12px;color:#606078">KYC</span><span style="font-size:13px;font-weight:600;color:' + kycColor + '">' + kycStatus.replace(/_/g,' ') + '</span></div>';
p0 += '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0"><span style="font-size:12px;color:#606078">Location</span><span style="font-size:13px;color:#f0f0f4;text-align:right;max-width:62%">' + esc(locStr) + '</span></div>';
p0 += '</div>';

// ── Expert professional info card ──
if (u.role === 'expert') {
  var spec = u.specialization||pr.specialization, comp = u.companyName||pr.companyName||pr.company;
  var exp = u.yearsOfExperience||pr.yearsOfExperience||pr.experience, avail = u.availability||pr.availability;
   var businessType = pr.businessType || pr.expert_business_type || '';
var teamSize = pr.teamSize || pr.expert_team_size || '';
  var website = u.websiteUrl||pr.websiteUrl||pr.website;
  var gstNumber = pr.gstNumber || pr.expert_gst_number || pr.gst_number || '';
  var licenseNumber = pr.licenseNumber || pr.expert_license_number || pr.license_number || pr.professionalLicense || '';
  var certNum = pr.certificationNumber || pr.expert_certification_number || pr.certification_number || '';
  var profAddress = pr.professionalAddress || pr.expert_professional_address || pr.professional_address || pr.address || '';
  var linkedinUrl = pr.linkedinUrl || '';
  if (spec||comp||exp||avail||website||businessType||teamSize||gstNumber||licenseNumber||certNum||profAddress||linkedinUrl) {
    p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:0">';
    p0 += '<div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:10px">Professional</div>';
    var proRows = [];
    if (spec)    proRows.push(['Specialization', esc(spec), '#f0f0f4']);
    if (comp)    proRows.push(['Company', esc(comp), '#f0f0f4']);
    if (exp)     proRows.push(['Experience', esc(String(exp)) + ' yrs', '#f0f0f4']);
    if (avail)   proRows.push(['Availability', esc(avail), '#22c55e']);
    if (businessType) proRows.push(['Business Type',  esc(businessType),'#f0f0f4']);
    if (teamSize)     proRows.push(['Team Size',       esc(teamSize),    '#f0f0f4']);
    if (gstNumber)    proRows.push(['GST Number',      esc(gstNumber),   '#f0f0f4']);
    if (licenseNumber) proRows.push(['Professional License', esc(licenseNumber), '#f0f0f4']);
    if (certNum)      proRows.push(['Certification No.', esc(certNum), '#f0f0f4']);
    if (profAddress)  proRows.push(['Professional Address', esc(profAddress), '#f0f0f4']);
    if (linkedinUrl)  proRows.push(['LinkedIn Profile', '<a href="' + esc(linkedinUrl) + '" target="_blank" style="color:#FC8019;text-decoration:none;font-weight:600">View Profile ↗</a>', '#f0f0f4']);
     proRows.forEach(function(row, i) {
      p0 += '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;' + (i<proRows.length-1||website?'border-bottom:1px solid #222230':'') + '"><span style="font-size:12px;color:#606078">' + row[0] + '</span><span style="font-size:13px;color:' + row[2] + ';font-weight:600">' + row[1] + '</span></div>';
    });
    if (website) p0 += '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0"><span style="font-size:12px;color:#606078">Website</span><a href="' + esc(website) + '" target="_blank" style="font-size:13px;color:#FC8019;text-decoration:none;max-width:65%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(website) + '</a></div>';
    p0 += '</div>';
  }

  // Services
  var services = u.servicesOffered||(pr.servicesOffered)||[];
  if (typeof services === 'string') services = services.split(',').map(function(s){return s.trim();}).filter(Boolean);
   if (services.length) {
    p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px">';
    p0 += '<div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:10px">Services Offered</div>';
    p0 += '<div style="display:flex;flex-wrap:wrap;gap:6px">' + services.map(function(s){ return '<span style="background:rgba(252,128,25,.12);color:#FC8019;border:1px solid rgba(252,128,25,.25);border-radius:6px;padding:5px 11px;font-size:12px;font-weight:600">' + esc(s) + '</span>'; }).join('') + '</div>';
    p0 += '</div>';
  }

  // Bio
  var bio = u.bio||pr.bio||pr.expert_bio||pr.about;
  if (bio) {
    p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px">';
    p0 += '<div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:10px">Bio</div>';
    p0 += '<div style="font-size:13px;color:#c0c0d8;line-height:1.7;white-space:pre-wrap">' + esc(bio) + '</div>';
    p0 += '</div>';
  }

  // Why Choose Me
  var why = u.whyChooseMe||pr.whyChooseMe||pr.why_choose_me;
  if (why) {
    p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px">';
    p0 += '<div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:10px">Why Choose Me</div>';
    p0 += '<div style="font-size:13px;color:#c0c0d8;line-height:1.7;white-space:pre-wrap">' + esc(why) + '</div>';
    p0 += '</div>';
  }

  // Education
  var edu = u.education||pr.education||pr.expert_education;
  if (edu) {
    p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px">';
    p0 += '<div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:10px">Education</div>';
    p0 += '<div style="font-size:13px;color:#c0c0d8;line-height:1.7;white-space:pre-wrap">' + esc(edu) + '</div>';
    p0 += '</div>';
  }

  // Portfolio — stored as plain string in profile
  var portfolioRaw = u.portfolio||pr.portfolio||pr.expert_portfolio||'';
  var portfolioText = Array.isArray(portfolioRaw) ? portfolioRaw.map(function(l){ return typeof l==='string'?l:(l.url||l.title||''); }).join('\n') : portfolioRaw;
  if (portfolioText && portfolioText.trim()) {
    p0 += '<div style="background:#18181d;border-radius:10px;padding:14px 16px">';
    p0 += '<div style="font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.06em;font-weight:700;margin-bottom:10px">Portfolio</div>';
    p0 += '<div style="font-size:13px;color:#c0c0d8;line-height:1.7;white-space:pre-wrap">' + esc(portfolioText) + '</div>';
    p0 += '</div>';
  }
}

p0 += '</div>'; // close outer flex
     /* Action buttons */
    var actionRow = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">';
    actionRow += '<button class="btn bgho" style="justify-content:center" data-ledger-uid="' + u._id + '">Credit Ledger</button>';
    actionRow += '<button class="btn bywn" style="justify-content:center" data-credit-uid="' + u._id + '" data-credit-name="' + esc(u.name) + '" data-credit-bal="' + (u.credits||0) + '">Adjust Credits</button>';
    actionRow += '<button class="btn bgy" style="justify-content:center;background:rgba(255,255,255,.06);color:#f0f0f4" data-pw-uid="' + u._id + '" data-pw-name="' + esc(u.name) + '">Reset Password</button>';
    actionRow += '<button class="btn brdn" style="justify-content:center" data-action-uid="' + u._id + '">Take Action</button>';
    actionRow += '<button class="btn bpri" style="justify-content:center" data-dm-uid="' + u._id + '" data-dm-name="' + esc(u.name) + '">&#128172; Send DM</button>';
    actionRow += '<button class="btn bywn" style="justify-content:center" data-tk-uid="' + u._id + '" data-tk-name="' + esc(u.name) + '" data-tk-role="' + esc(u.role||'user') + '">&#43; Create Ticket</button>';
    actionRow += '</div>';
    p0 += actionRow;

    var cs = d.creditSummary, p1 = '';
    if (cs) { p1 = '<div class="ledger"><div class="lc"><label>Purchased</label><span style="color:#22c55e">+' + (cs.purchased||0) + '</span></div><div class="lc"><label>Spent</label><span style="color:#ef4444">-' + (cs.spent||0) + '</span></div><div class="lc"><label>Refunded</label><span style="color:#a855f7">+' + (cs.refunded||0) + '</span></div><div class="lc"><label>Balance</label><span style="color:#f59e0b">' + (cs.closing||0) + '</span></div></div>'; }
    p1 += '<div class="slbl">Transaction History</div>';
    p1 += (d.transactions||[]).length ? (d.transactions||[]).map(function(tx) {
      return '<div class="txi"><div><div class="txd">' + esc(tx.description||tx.type) + '</div><div class="txm">' + fmtT(tx.createdAt) + '</div></div><span class="txa ' + (tx.amount>0?'p':'n') + '">' + (tx.amount>0?'+':'') + tx.amount + '</span></div>';
    }).join('') : '<p style="color:#606078;font-size:13px;padding:8px">No transactions</p>';

    var items = u.role === 'expert' ? (d.approaches||[]) : (d.requests||[]);
    var p2 = '<div class="slbl">' + (u.role==='expert'?'Approaches':'Requests') + '</div>';
    p2 += items.length ? items.map(function(it) {
      var title = u.role === 'expert' ? ((it.request&&it.request.title)||'-') : (it.title||'-');
      var sub = fmtT(it.createdAt) + (u.role==='expert' ? ' / ' + (it.creditsSpent||0) + ' cr' + (it.client?' / '+esc(it.client.name||''):'') : '');
      return '<div class="txi" style="flex-direction:column;align-items:flex-start;gap:5px"><div style="display:flex;justify-content:space-between;width:100%;align-items:center"><div class="txd">' + esc(title) + '</div>' + bdg(it.status||'pending') + '</div><div class="txm">' + sub + '</div></div>';
    }).join('') : '<p style="color:#606078;font-size:13px;padding:8px">None</p>';

    var p3 = '<div class="slbl">Support Tickets</div>';
    p3 += (d.tickets||[]).length ? (d.tickets||[]).map(function(t) {
      return '<div class="txi" style="flex-direction:column;align-items:flex-start;gap:4px"><div style="display:flex;justify-content:space-between;width:100%"><span class="txd">' + esc(t.issueType||'Support') + '</span>' + bdg(t.status) + '</div><div class="txm">' + fmtT(t.createdAt) + ' / ' + (t.decision||'-') + ' / ' + (t.eligibleCredits||0) + ' cr</div></div>';
    }).join('') : '<p style="color:#606078;font-size:13px;padding:8px">No tickets</p>';

    g('drB').innerHTML = '<div class="drp on" id="dp0">' + p0 + '</div><div class="drp" id="dp1">' + p1 + '</div><div class="drp" id="dp2">' + p2 + '</div><div class="drp" id="dp3">' + p3 + '</div>';
  }

  function closeDr() { g('ov1').classList.remove('on'); g('dr1').classList.remove('on'); }

/* ═══ CREDIT MODAL ═══════════════════════════════════════════════════════ */
  function openCreditModal(uid, name, bal) {
    _creditUid = uid;
    g('creditModalInfo').innerHTML = '<strong>' + esc(name) + '</strong><br>Current balance: <span style="color:#f59e0b">' + bal + ' credits</span>';
    g('creditAmount').value = '';
    g('creditReason').value = '';
    // Inject Type selector if not already in modal
    if (!g('creditType')) {
      var ref = g('creditAmount');
      var wrap = ref && ref.parentNode;
      if (wrap) {
        var div = document.createElement('div');
        div.style.cssText = 'margin-bottom:14px';
        div.innerHTML =
          '<label style="display:block;font-size:10px;color:#606078;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">TRANSACTION TYPE</label>' +
          '<select id="creditType" style="width:100%;padding:10px 12px;background:#18181d;border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#f0f0f4;font-size:13px">' +
            '<option value="refund">Refund (credit back to expert)</option>' +
            '<option value="bonus">Bonus (reward/gift credits)</option>' +
            '<option value="adjustment">Adjustment (manual correction)</option>' +
            '<option value="purchase">Purchase (credit buy)</option>' +
          '</select>';
        wrap.parentNode.insertBefore(div, wrap);
      }
    }
    // Reset type to refund when action is add
    var ca = g('creditAction');
    if (ca) ca.onchange = function() {
      var ct = g('creditType');
      if (!ct) return;
      ct.value = this.value === 'add' ? 'refund' : 'adjustment';
    };
    openModal('creditModal');
  }

  function submitCredit() {
    if (!_creditUid) return;
    var action = g('creditAction').value;   // add | deduct | set
    var amount = parseInt(g('creditAmount').value);
    var reason = g('creditReason').value;
    var txType = (g('creditType') && g('creditType').value) || (action === 'add' ? 'refund' : 'adjustment');
    if (!amount || amount <= 0) { toast('Enter valid amount', 'e'); return; }
    api('users/' + _creditUid + '/credits', 'POST', { action: action, amount: amount, reason: reason, type: txType })
      .then(function(d) {
        if (d.success) {
          toast('Credits updated! (' + txType + ')');
          closeModal('creditModal');
          closeDr();
        } else toast(d.message || 'Failed', 'e');
      }).catch(function() { toast('Error', 'e'); });
  }

  /* ═══ RESET PASSWORD MODAL ═══════════════════════════════════════════════ */
  function openPwModal(uid, name) {
    _pwUid = uid;
    g('pwModalInfo').textContent = 'Reset password for: ' + name;
    g('newPw').value = ''; g('newPw2').value = '';
    openModal('pwModal');
  }

  function submitPw() {
    if (!_pwUid) return;
    var p1 = g('newPw').value, p2 = g('newPw2').value;
    if (!p1 || p1.length < 8) { toast('Password must be 8+ characters', 'e'); return; }
    if (p1 !== p2) { toast('Passwords do not match', 'e'); return; }
    api('users/' + _pwUid + '/reset-password', 'POST', { newPassword: p1 })
      .then(function(d) {
        if (d.success) { toast('Password reset!'); closeModal('pwModal'); }
        else toast(d.message || 'Failed', 'e');
      }).catch(function() { toast('Error', 'e'); });
  }

  /* ═══ LEDGER ═════════════════════════════════════════════════════════════ */
  function openLedger(eid) {
    closeDr();
    g('ov1').classList.add('on'); g('dr1').classList.add('on');
    g('drT').textContent = 'Credit Ledger'; g('drTabs').innerHTML = '';
    g('drB').innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';
    api('credits/expert/' + eid + qs({})).then(function(d) {
      if (!d.success) return;
      var sm = d.summary || {}, txs = d.transactions || [];
      var html = '<div class="ledger"><div class="lc"><label>Opening</label><span>' + (sm.opening||0) + '</span></div><div class="lc"><label>Purchased</label><span style="color:#22c55e">+' + (sm.purchased||0) + '</span></div><div class="lc"><label>Spent</label><span style="color:#ef4444">-' + (sm.spent||0) + '</span></div><div class="lc"><label>Balance</label><span style="color:#f59e0b">' + (sm.closing||0) + '</span></div></div>';
      html += '<div class="slbl">All Transactions (' + txs.length + ')</div>';
      html += txs.length ? txs.map(function(tx) {
        var sub = fmtT(tx.createdAt) + (tx.relatedClient&&tx.relatedClient.name?' / '+esc(tx.relatedClient.name):'') + (tx.relatedRequest&&tx.relatedRequest.title?' / '+esc(tx.relatedRequest.title):'');
        return '<div class="txi"><div><div class="txd">' + esc(tx.description||tx.type) + '</div><div class="txm">' + sub + '</div></div><div style="text-align:right"><div class="txa ' + (tx.amount>0?'p':'n') + '">' + (tx.amount>0?'+':'') + tx.amount + '</div><div class="txm">Bal: ' + (tx.balanceAfter||0) + '</div></div></div>';
      }).join('') : '<p style="color:#606078;font-size:13px;padding:8px">No transactions</p>';
      g('drB').innerHTML = html;
    }).catch(function() { g('drB').innerHTML = '<div class="empty"><h3>Error</h3></div>'; });
  }

  /* ═══ APPROACHES ═════════════════════════════════════════════════════════ */
    function loadApproaches() {
    _pages['approaches'] = 1;
    setT('apTbl', spin());

    // Fetch both regular approaches and expert invites in parallel
    Promise.all([
      api('approaches' + qs({ status: g('apSt').value })),
      api('interests' + qs({})).catch(function() { return { success: false, interests: [] }; })
    ]).then(function(results) {
      var d = results[0];
      var inviteData = results[1];
      var invites = (inviteData && inviteData.interests) || [];

      // ── Expert Invites Section (insert above main table if any exist) ──
      var inviteSection = document.getElementById('apInviteSection');
      if (!inviteSection) {
        // Create the invite section container above the approaches table
        var apSection = document.getElementById('apTbl');
        if (apSection) {
          var wrapper = apSection.closest('table') || apSection.parentNode;
          var div = document.createElement('div');
          div.id = 'apInviteSection';
          div.style.cssText = 'margin-bottom:20px;';
          wrapper.parentNode.insertBefore(div, wrapper);
          inviteSection = div;
        }
      }

      if (inviteSection) {
        if (invites.length > 0) {
          inviteSection.innerHTML =
            '<div style="font-size:15px;font-weight:700;color:#f0f0f4;margin-bottom:10px;">🎯 Expert Invites (' + invites.length + ')</div>' +
            '<div style="overflow-x:auto;">' +
            '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
            '<thead><tr style="background:#18181d;color:#606078;font-size:11px;text-transform:uppercase;">' +
'<th style="padding:10px 12px;text-align:left;">Expert</th>' +
'<th style="padding:10px 12px;text-align:left;">Client</th>' +
'<th style="padding:10px 12px;text-align:left;">Masked Contact</th>' +
'<th style="padding:10px 12px;text-align:left;">Status</th>' +
'<th style="padding:10px 12px;text-align:left;">Date</th>' +
'<th style="padding:10px 12px;text-align:left;">Actions</th>' +
'</tr></thead><tbody>' +
invites.map(function(inv) {
  var statusBadge = inv.completed
    ? '<span class="badge bgr">✅ Completed</span>'
    : inv.unlocked
      ? '<span class="badge bbl">🔓 Unlocked</span>'
      : '<span class="badge byw">🔒 Pending</span>';

  var expertId   = inv.expert ? inv.expert._id : '';
  var expertName = inv.expert ? inv.expert.name : '—';
  var invId      = inv._id || '';
  var uid2       = 'inv_' + invId;

  var actions =
    '<div style="position:relative;display:inline-block;">' +
      '<button class="btn bgho" onclick="document.getElementById(\'' + uid2 + '\').style.display=document.getElementById(\'' + uid2 + '\').style.display===\'block\'?\'none\':\'block\';event.stopPropagation();">Actions ▾</button>' +
      '<div id="' + uid2 + '" style="display:none;position:absolute;right:0;top:32px;background:#1a1a24;border:1px solid #2a2a38;border-radius:8px;z-index:100;min-width:150px;box-shadow:0 4px 16px rgba(0,0,0,0.4);">' +
        // View expert profile
        (expertId ? '<div data-uid="' + expertId + '" style="padding:10px 14px;cursor:pointer;color:#f0f0f4;font-size:13px;" onmouseover="this.style.background=\'#2a2a38\'" onmouseout="this.style.background=\'transparent\'">👤 View Expert</div>' : '') +
        // Mark as completed
        (!inv.completed ? '<div onclick="adminMarkInviteComplete(\'' + invId + '\',this)" style="padding:10px 14px;cursor:pointer;color:#22c55e;font-size:13px;font-weight:600;" onmouseover="this.style.background=\'#2a2a38\'" onmouseout="this.style.background=\'transparent\'">✅ Mark Completed</div>' : '') +
        // Reset to pending
        (inv.unlocked || inv.completed ? '<div onclick="adminResetInvite(\'' + invId + '\',this)" style="padding:10px 14px;cursor:pointer;color:#f59e0b;font-size:13px;" onmouseover="this.style.background=\'#2a2a38\'" onmouseout="this.style.background=\'transparent\'">🔄 Reset to Pending</div>' : '') +
        // Delete invite
        '<div onclick="adminDeleteInvite(\'' + invId + '\',this)" style="padding:10px 14px;cursor:pointer;color:#ef4444;font-size:13px;border-top:1px solid #2a2a38;" onmouseover="this.style.background=\'#2a2a38\'" onmouseout="this.style.background=\'transparent\'">🗑 Delete</div>' +
      '</div>' +
    '</div>';

  return '<tr style="border-bottom:1px solid #1a1a24;">' +
    '<td style="padding:10px 12px;color:#FC8019;font-weight:600;">' + esc(expertName) + '</td>' +
    '<td style="padding:10px 12px;color:#a0a0b8;">' + esc(inv.clientName || '—') + '</td>' +
    '<td style="padding:10px 12px;font-family:monospace;font-size:12px;color:#a0a0b8;">' +
      esc(inv.maskedPhone || '') + '<br>' + esc(inv.maskedEmail || '') +
    '</td>' +
    '<td style="padding:10px 12px;">' + statusBadge + '</td>' +
    '<td style="padding:10px 12px;color:#606078;font-size:12px;">' + fmt(inv.createdAt) + '</td>' +
    '<td style="padding:10px 12px;">' + actions + '</td>' +
    '</tr>';
}).join('') +
            '</tbody></table></div>' +
            '<hr style="border:none;border-top:1px solid #1a1a24;margin:16px 0;">';
        } else {
          inviteSection.innerHTML = '';
        }
      }

      // ── Regular Approaches Table ──
      var allApproaches = d.approaches || [];
      pagSlice('approaches', allApproaches);
      renderApproachesPage(allApproaches);

      // Delegated events — set on container, persistent
      var apTblEl = document.getElementById('apTbl');
      if (apTblEl) {
        apTblEl.onclick = function(ev) {
          var ab = ev.target.closest('[data-ap-act]');
          var db = ev.target.closest('[data-ap-del]');
          var rm = ev.target.closest('[data-full-msg]');
          if (ab) { updateApproach(ab.dataset.apId, ab.dataset.apAct); }
          if (db) { if (confirm('Delete this approach?')) deleteApproach(db.dataset.apDel); }
          if (rm) { showMsgModal(rm.dataset.fullMsg); }
        };
      }
    }).catch(function() { setT('apTbl', ''); });
  }
   
  function updateApproach(id, status) {
    api('approaches/' + id, 'PUT', { status: status }).then(function(d) {
      if (d.success) { toast('Approach ' + status); loadApproaches(); }
      else toast(d.message||'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  }

  function deleteApproach(id) {
    api('approaches/' + id, 'DELETE').then(function(d) {
      if (d.success) { toast('Approach deleted'); loadApproaches(); }
      else toast(d.message||'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  }
function renderApproachesPage(arr) {
    if (arr) pagSlice('approaches', arr);
    var page = pagSlice('approaches', _pageData['approaches'] || []);
    var existing = document.getElementById('pag-approaches');
    if (existing) existing.remove();

    // Bulk toolbar
    var apTbl = document.getElementById('apTbl');
    var apParent = apTbl ? apTbl.closest('table') : null;
    var apToolbar = document.getElementById('apBulkToolbar');
    if (!apToolbar && apParent) {
      apToolbar = document.createElement('div');
      apToolbar.id = 'apBulkToolbar';
      apToolbar.style.cssText = 'display:none;align-items:center;gap:10px;padding:10px 0;margin-bottom:8px;';
      apToolbar.innerHTML =
        '<span id="apSelCount" style="font-size:13px;color:#a0a0b8;">0 selected</span>' +
        '<button class="btn brdn" style="font-size:12px;padding:6px 14px;" onclick="bulkDeleteApproaches()">🗑 Delete Selected</button>' +
        '<button class="btn bgho" style="font-size:12px;padding:6px 14px;" onclick="clearApproachSelection()">Clear</button>';
      apParent.parentNode.insertBefore(apToolbar, apParent);
    }

    // Select-all in thead
    var apThead = apTbl ? apTbl.closest('table').querySelector('thead tr') : null;
    if (apThead && !apThead.querySelector('.ap-chk-all')) {
      var apTh = document.createElement('th');
      apTh.innerHTML = '<input type="checkbox" class="ap-chk-all" onchange="toggleAllApproaches(this)" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;" title="Select all">';
      apThead.insertBefore(apTh, apThead.firstChild);
    }

    setT('apTbl', page.map(function(a) {
      var en = a.expert ? esc(a.expert.name||'-') : '-', eid = a.expert ? a.expert._id : '';
      var uid = 'ap_' + a._id;
      var quote = a.quote ? '₹' + Number(a.quote).toLocaleString('en-IN') : '—';
      var fullMsg = esc(a.message || '');
      var shortMsg = a.message ? (a.message.length > 60 ? esc(a.message.substring(0, 60)) + '… <span data-full-msg="' + fullMsg + '" style="color:#FC8019;cursor:pointer;font-size:12px;white-space:nowrap;">read more</span>' : fullMsg) : '—';
      var message = '<div style="max-width:200px;">' + shortMsg + '</div>';
      var actions = '<div style="position:relative;display:inline-block;"><button class="btn bgho" onclick="document.getElementById(\'' + uid + '\').style.display = document.getElementById(\'' + uid + '\').style.display===\'block\'?\'none\':\'block\'; event.stopPropagation();">Actions ▾</button><div id="' + uid + '" style="display:none;position:absolute;right:0;top:32px;background:#1a1a24;border:1px solid #2a2a38;border-radius:8px;z-index:100;min-width:120px;box-shadow:0 4px 16px rgba(0,0,0,0.4);">' + (a.status === 'pending' ? '<div data-ap-id="' + a._id + '" data-ap-act="accepted" style="padding:10px 14px;cursor:pointer;color:#22c55e;font-size:13px;font-weight:600;" onmouseover="this.style.background=\'#2a2a38\'" onmouseout="this.style.background=\'transparent\'">✓ Accept</div><div data-ap-id="' + a._id + '" data-ap-act="rejected" style="padding:10px 14px;cursor:pointer;color:#ef4444;font-size:13px;font-weight:600;" onmouseover="this.style.background=\'#2a2a38\'" onmouseout="this.style.background=\'transparent\'">✕ Reject</div>' : '') + '<div data-ap-del="' + a._id + '" style="padding:10px 14px;cursor:pointer;color:#a0a0b8;font-size:13px;border-top:1px solid #2a2a38;" onmouseover="this.style.background=\'#2a2a38\'" onmouseout="this.style.background=\'transparent\'">🗑 Delete</div></div></div>';
      var statusBadge = a.status === 'completed' ? '<span class="badge bgr">completed</span>' : bdg(a.status);
      return '<tr><td><input type="checkbox" class="ap-chk" data-aid="' + a._id + '" onchange="onApproachCheck()" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;"></td><td><span data-uid="' + eid + '" style="cursor:pointer;color:#FC8019;font-weight:600">' + en + '</span></td><td style="color:#a0a0b8">' + (a.client?esc(a.client.name):'-') + '</td><td style="font-size:12px">' + (a.request?esc(a.request.title):'-') + '</td><td style="color:#f59e0b;font-weight:700;">' + quote + '</td><td style="font-size:12px;color:#a0a0b8;max-width:180px;">' + message + '</td><td style="color:#f59e0b">' + (a.creditsSpent||0) + '</td><td>' + statusBadge + '</td><td style="font-size:12px;color:#a0a0b8">' + fmt(a.createdAt) + '</td><td>' + actions + '</td></tr>';
    }).join(''));
    pagHTML('approaches', 'apTbl');
  }

  window.onApproachCheck = function() {
    var checked = document.querySelectorAll('.ap-chk:checked').length;
    var toolbar = document.getElementById('apBulkToolbar');
    var countEl = document.getElementById('apSelCount');
    if (toolbar) toolbar.style.display = checked > 0 ? 'flex' : 'none';
    if (countEl) countEl.textContent = checked + ' selected';
    var all = document.querySelectorAll('.ap-chk').length;
    var allChk = document.querySelector('.ap-chk-all');
    if (allChk) allChk.checked = checked > 0 && checked === all;
  };

  window.toggleAllApproaches = function(masterChk) {
    document.querySelectorAll('.ap-chk').forEach(function(chk) { chk.checked = masterChk.checked; });
    onApproachCheck();
  };

  window.clearApproachSelection = function() {
    document.querySelectorAll('.ap-chk').forEach(function(chk) { chk.checked = false; });
    var allChk = document.querySelector('.ap-chk-all');
    if (allChk) allChk.checked = false;
    onApproachCheck();
  };

  window.bulkDeleteApproaches = function() {
    var ids = Array.from(document.querySelectorAll('.ap-chk:checked')).map(function(c) { return c.dataset.aid; });
    if (!ids.length) { toast('Nothing selected', 'i'); return; }
    if (!confirm('Permanently delete ' + ids.length + ' approach(es)? Credits will be refunded to experts.')) return;
    var done = 0, failed = 0;
    var next = function() {
      if (!ids.length) {
        toast('Deleted ' + done + (failed ? ', ' + failed + ' failed' : '') + ' approaches');
        loadApproaches();
        return;
      }
      var id = ids.shift();
      api('approaches/' + id, 'DELETE').then(function(d) {
        if (d.success) done++; else failed++;
        next();
      }).catch(function() { failed++; next(); });
    };
    next();
  };
   
function showMsgModal(msg) {
    var existing = document.getElementById('msgReadModal');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'msgReadModal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
    overlay.innerHTML =
      '<div style="background:#1a1a24;border:1px solid #2a2a38;border-radius:12px;max-width:480px;width:100%;padding:24px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
          '<span style="font-size:15px;font-weight:700;color:#f0f0f4;">Expert Message</span>' +
          '<span onclick="document.getElementById(\'msgReadModal\').remove()" style="cursor:pointer;color:#606078;font-size:20px;line-height:1;">×</span>' +
        '</div>' +
        '<p style="font-size:14px;color:#a0a0b8;line-height:1.7;white-space:pre-wrap;">' + msg + '</p>' +
      '</div>';
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }
   
  /* ═══ CHATS ══════════════════════════════════════════════════════════════ */
