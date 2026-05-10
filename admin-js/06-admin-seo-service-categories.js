  sec.innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';
  // Load settings + logs in parallel
  Promise.all([
    api('email-settings'),
    api('email-logs?limit=100')
  ]).then(function(results) {
    var settingsData = results[0];
    var logsData     = results[1];

    _emailSettings = (settingsData.success && settingsData.settings) ? settingsData.settings : {};
    var logs = (logsData.success && logsData.logs) ? logsData.logs : [];
    var total = logsData.total || logs.length;

    sec.innerHTML = buildEmailNotificationsUI(_emailSettings);
    // Feed logs through pagination system instead of rendering inline
    _pageData['emailLogs'] = logs;
    _pages['emailLogs'] = 1;
    var tc = g('emailLogTotal'); if (tc) tc.textContent = (total || logs.length) + ' total';
    renderEmailLogsPage();
     
    // Wire toggle changes
    sec.querySelectorAll('.email-toggle').forEach(function(toggle) {
      toggle.addEventListener('change', function() {
        var key = this.dataset.key;
        var val = this.checked;
        _emailSettings[key] = val;
        // Update visual slider
        var span = this.nextElementSibling;
        if (span) {
          span.style.background = val ? '#FC8019' : '#2a2a38';
          var thumb = span.querySelector('span');
          if (thumb) thumb.style.left = val ? '23px' : '3px';
        }
        api('email-settings', 'PUT', { [key]: val }).then(function(d) {
          if (d.success) {
            toast((val ? '✅ Enabled: ' : '🔕 Disabled: ') + key.replace(/_/g, ' '));
          } else {
            toast('Failed to save setting', 'e');
          }
        });
      });
    });

    // Wire filter changes
    var catFilter  = g('emailLogCat');
    var statFilter = g('emailLogStat');
    if (catFilter)  catFilter.onchange  = function() { reloadEmailLogs(); };
    if (statFilter) statFilter.onchange = function() { reloadEmailLogs(); };

    // Wire test digest button
    var testBtn = g('testDigestBtn');
    if (testBtn) {
      testBtn.onclick = function() {
        testBtn.textContent = 'Sending...';
        testBtn.disabled = true;
        api('email-test-digest', 'POST', {}).then(function(d) {
          testBtn.textContent = '📋 Test Daily Digest';
          testBtn.disabled = false;
          toast(d.message || 'Done', d.success ? 's' : 'e');
        });
      };
    }
  }).catch(function() {
    var sec = g('sec-emailNotifications');
    if (sec) sec.innerHTML = '<div class="empty"><h3>Failed to load email settings</h3></div>';
  });
}

function reloadEmailLogs() {
  var cat  = g('emailLogCat')  ? g('emailLogCat').value  : 'all';
  var stat = g('emailLogStat') ? g('emailLogStat').value : 'all';
  var qs   = 'email-logs?limit=500' + (cat !== 'all' ? '&category=' + cat : '') + (stat !== 'all' ? '&status=' + stat : '');
  g('emailLogsTbody').innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px"><div class="spin"></div></td></tr>';
  _pages['emailLogs'] = 1;
  api(qs).then(function(d) {
    renderEmailLogsTable(d.logs || [], d.total || 0);
  });
}
   
function renderEmailLogsTable(logs, total) {
  _pageData['emailLogs'] = logs;
  _pages['emailLogs'] = 1;
  var tc = g('emailLogTotal'); if (tc) tc.textContent = (total || logs.length) + ' total';
  renderEmailLogsPage();
}

function renderEmailLogsPage() {
  var tbody = g('emailLogsTbody');
  if (!tbody) return;
  var existing = document.getElementById('pag-emailLogs');
  if (existing) existing.remove();

  var page = pagSlice('emailLogs', _pageData['emailLogs'] || []);

  if (!page.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#606078">No email logs found</td></tr>';
    return;
  }

  tbody.innerHTML = page.map(function(l) {
    var statusBadge = l.status === 'sent'
      ? '<span class="badge bgr">Sent</span>'
      : '<span class="badge brd">Failed</span>';
    var catColor = { client: '#3b82f6', expert: '#FC8019', admin: '#a855f7' };
    var catBadge = '<span class="badge" style="background:' + (catColor[l.category] || '#606078') + '20;color:' + (catColor[l.category] || '#606078') + ';border:1px solid ' + (catColor[l.category] || '#606078') + '40;">' + (l.category || '—') + '</span>';
    var typeLabel = (l.type || '').replace(/_/g, ' ');
    var date = l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
    return '<tr>' +
      '<td style="font-size:12px;color:#f0f0f4">' + esc(l.to) + '<br><small style="color:#606078">' + esc(l.toName || '') + '</small></td>' +
      '<td>' + catBadge + '</td>' +
      '<td style="font-size:12px;color:#a0a0b8">' + esc(typeLabel) + '</td>' +
      '<td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(l.reason || l.subject || '—') + '</td>' +
      '<td>' + statusBadge + (l.error ? '<br><small style="color:#ef4444">' + esc(l.error.substring(0,40)) + '</small>' : '') + '</td>' +
      '<td style="font-size:12px;color:#606078">' + date + '</td>' +
    '</tr>';
  }).join('');

  pagHTML('emailLogs', 'emailLogsTbody');
}
   
function buildEmailNotificationsUI(settings) {
  var groups = [
    {
      label: '👤 Client Emails',
      items: [
        { key: 'client_welcome',           label: 'Welcome Email',                  desc: 'Sent when a client registers' },
        { key: 'client_post_created',      label: 'Request Posted',                 desc: 'Sent when client posts a new request' },
        { key: 'client_expert_approached', label: 'Expert Approached',              desc: 'Sent when an expert submits a proposal' },
        { key: 'client_post_suspended',    label: 'Post Suspended',                 desc: 'Sent when client\'s post is suspended (3 reports)' },
        { key: 'client_restricted',        label: 'Account Restricted',             desc: 'Sent when client account is restricted' },
        { key: 'client_banned',            label: 'Account Banned',                 desc: 'Sent when client account is banned' }
      ]
    },
    {
      label: '🧑‍💼 Expert Emails',
      items: [
        { key: 'expert_welcome',           label: 'Welcome Email',                  desc: 'Sent when an expert registers' },
        { key: 'expert_credits_purchased', label: 'Credits Purchased',              desc: 'Sent when expert buys credits' },
        { key: 'expert_credits_refunded',  label: 'Credits Refunded',               desc: 'Sent when admin refunds credits' },
        { key: 'expert_approach_sent',     label: 'Approach Submitted',             desc: 'Sent when expert submits an approach' },
        { key: 'expert_new_post',          label: 'New Request Posted',             desc: 'Sent when a matching client request is posted' },
        { key: 'expert_restricted',        label: 'Account Restricted',             desc: 'Sent when expert account is restricted' },
        { key: 'expert_banned',            label: 'Account Banned',                 desc: 'Sent when expert account is banned' }
      ]
    },
    {
      label: '🔑 Admin Emails',
      items: [
        { key: 'admin_post_suspended',     label: 'Post Suspended Alert',           desc: 'Admin notified when a post is auto-suspended' },
        { key: 'admin_user_restricted',    label: 'User Restricted Alert',          desc: 'Admin notified when any user is auto-restricted' },
         { key: 'admin_ticket_escalated',   label: 'Ticket Escalated Alert',         desc: 'Admin notified when a user sends a follow-up and ticket is escalated' },
        { key: 'admin_daily_tickets',      label: 'Daily Ticket Digest (9:30 PM)',  desc: 'Daily summary of open tickets sent to admin' }
      ]
    }
  ];

  var togglesHTML = groups.map(function(group) {
    var rows = group.items.map(function(item) {
      var isOn = settings[item.key] !== false;
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #18181d;">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:600;color:#f0f0f4">' + item.label + '</div>' +
          '<div style="font-size:12px;color:#606078;margin-top:2px">' + item.desc + '</div>' +
        '</div>' +
        '<label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;">' +
          '<input type="checkbox" class="email-toggle" data-key="' + item.key + '" ' + (isOn ? 'checked' : '') + ' style="opacity:0;width:0;height:0;">' +
          '<span style="position:absolute;cursor:pointer;inset:0;background:' + (isOn ? '#FC8019' : '#2a2a38') + ';border-radius:24px;transition:.2s;">' +
            '<span style="position:absolute;content:\'\';height:18px;width:18px;left:' + (isOn ? '23px' : '3px') + ';bottom:3px;background:#fff;border-radius:50%;transition:.2s;"></span>' +
          '</span>' +
        '</label>' +
      '</div>';
    }).join('');
    return '<div class="ch" style="margin-bottom:20px;">' +
      '<div style="font-size:13px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;">' + group.label + '</div>' +
      rows +
    '</div>';
  }).join('');

  var logsHTML = '<div class="ch">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">' +
      '<div style="font-size:15px;font-weight:700;color:#f0f0f4">📬 Email Log <span id="emailLogTotal" style="font-size:12px;color:#606078;margin-left:6px">0 total</span></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<select id="emailLogCat" style="padding:6px 10px;background:#18181d;border:1px solid #2a2a38;border-radius:6px;color:#a0a0b8;font-size:13px;">' +
          '<option value="all">All Categories</option>' +
          '<option value="client">Client</option>' +
          '<option value="expert">Expert</option>' +
          '<option value="admin">Admin</option>' +
        '</select>' +
        '<select id="emailLogStat" style="padding:6px 10px;background:#18181d;border:1px solid #2a2a38;border-radius:6px;color:#a0a0b8;font-size:13px;">' +
          '<option value="all">All Status</option>' +
          '<option value="sent">Sent</option>' +
          '<option value="failed">Failed</option>' +
        '</select>' +
        '<button id="testDigestBtn" class="btn bgho" style="font-size:12px;padding:6px 12px;">📋 Test Daily Digest</button>' +
      '</div>' +
    '</div>' +
    '<div style="overflow-x:auto;">' +
    '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
      '<thead><tr style="background:#18181d;color:#606078;font-size:11px;text-transform:uppercase;">' +
        '<th style="padding:10px 12px;text-align:left;">Sent To</th>' +
        '<th style="padding:10px 12px;text-align:left;">Category</th>' +
        '<th style="padding:10px 12px;text-align:left;">Type</th>' +
        '<th style="padding:10px 12px;text-align:left;">Reason</th>' +
        '<th style="padding:10px 12px;text-align:left;">Status</th>' +
        '<th style="padding:10px 12px;text-align:left;">Time</th>' +
      '</tr></thead>' +
      '<tbody id="emailLogsTbody">' +
        '<tr><td colspan="6" style="text-align:center;padding:20px"><div class="spin"></div></td></tr>' +
      '</tbody>' +
    '</table></div></div>';

   
  return '<div style="max-width:860px;">' + togglesHTML + logsHTML + '</div>';
}
/* ═══ EXPERT INVITE ADMIN ACTIONS ═══════════════════════════════════════ */
window.adminMarkInviteComplete = function(invId, el) {
  if (!confirm('Mark this invite as completed?')) return;
  api('interests/' + invId + '/complete', 'POST', {}).then(function(d) {
    if (d.success) { toast('Marked as completed'); loadApproaches(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};

window.adminResetInvite = function(invId, el) {
  if (!confirm('Reset this invite back to pending?')) return;
  api('interests/' + invId + '/reset', 'POST', {}).then(function(d) {
    if (d.success) { toast('Reset to pending'); loadApproaches(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};

window.adminDeleteInvite = function(invId, el) {
  if (!confirm('Permanently delete this invite?')) return;
  api('interests/' + invId, 'DELETE').then(function(d) {
    if (d.success) { toast('Invite deleted'); loadApproaches(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};

/* ═══ ADMIN MANAGEMENT ══════════════════════════════════════════════════ */

function isSuperAdmin() {
  return adm && adm.role === 'super_admin';
}

var _adminsList = [];

window.loadAdmins = function loadAdmins() {
  if (!isSuperAdmin()) {
    var sec = g('sec-admins');
    if (sec) sec.innerHTML = '<div class="empty"><h3>🔒 Super Admin Only</h3><p style="color:#606078;font-size:13px;margin-top:8px">Only super admins can manage other admins.</p></div>';
    return;
  }
  var sec = g('sec-admins');
  if (sec) sec.innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';
  api('admins').then(function(d) {
    if (!d.success) { toast('Failed to load admins', 'e'); return; }
    _adminsList = d.admins || [];
    _pageData['admins'] = _adminsList;
    renderAdminsPage();
  }).catch(function() { toast('Error loading admins', 'e'); });
}

window.renderAdminsPage = function renderAdminsPage() {
  var sec = g('sec-admins');
  if (!sec) return;
  var page = pagSlice('admins', _pageData['admins'] || []);

  var roleColor = { super_admin: '#22c55e', admin: '#FC8019', readonly: '#3b82f6' };
  var roleLabel = { super_admin: '👑 Super Admin', admin: '🔧 Admin', readonly: '👁 Read Only' };

  var rows = page.map(function(a) {
    var rc = roleColor[a.role] || '#a0a0b8';
    var rl = roleLabel[a.role] || a.role;
    var isSelf = adm && adm.id === String(a._id);
    var statusBadge = a.isActive
      ? '<span class="badge bgr">Active</span>'
      : '<span class="badge brd">Inactive</span>';
    var actions = '';
    if (!isSelf) {
      actions += '<button class="btn bgho" style="font-size:12px;padding:5px 10px" onclick="openEditAdminModal(\'' + a._id + '\')">Edit</button> ';
      actions += '<button class="btn bywn" style="font-size:12px;padding:5px 10px" onclick="toggleAdmin(\'' + a._id + '\',\'' + esc(a.name) + '\',' + a.isActive + ')">' + (a.isActive ? 'Deactivate' : 'Activate') + '</button> ';
      actions += '<button class="btn brdn" style="font-size:12px;padding:5px 10px" onclick="deleteAdmin(\'' + a._id + '\',\'' + esc(a.name) + '\')">Delete</button>';
    } else {
      actions = '<span style="font-size:11px;color:#606078;font-style:italic">You</span>';
    }
    return '<tr>' +
      '<td style="font-weight:600;color:#f0f0f4">' + esc(a.name) + (isSelf ? ' <span style="font-size:10px;color:#606078">(you)</span>' : '') + '</td>' +
      '<td style="font-size:12px;color:#a0a0b8">' + esc(a.adminId) + '</td>' +
      '<td style="font-size:12px;color:#606078">' + esc(a.email || '—') + '</td>' +
      '<td><span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:' + rc + '20;color:' + rc + '">' + rl + '</span></td>' +
      '<td>' + statusBadge + '</td>' +
      '<td style="font-size:12px;color:#606078">' + (a.createdAt ? fmtT(a.createdAt) : '-') + '</td>' +
      '<td style="font-size:12px;color:#606078">' + (a.lastLogin ? fmtT(a.lastLogin) : 'Never') + '</td>' +
      '<td style="font-size:12px;color:#606078">' + esc(a.createdBy || 'system') + '</td>' +
      '<td><div style="display:flex;gap:4px;flex-wrap:wrap">' + actions + '</div></td>' +
    '</tr>';
  }).join('');

  sec.innerHTML =
    '<div class="card">' +
      '<div class="ch" style="justify-content:space-between">' +
        '<h3>👥 Admin Accounts <span style="font-size:13px;color:#606078;font-weight:400">(' + (_pageData['admins']||[]).length + ' total)</span></h3>' +
        '<button class="btn bpri" onclick="openCreateAdminModal()" style="padding:8px 18px">+ Create Admin</button>' +
      '</div>' +
      '<div class="tw"><table><thead><tr>' +
        '<th>Name</th><th>Admin ID</th><th>Email</th><th>Role</th><th>Status</th><th>Signed Up</th><th>Last Login</th><th>Created By</th><th>Actions</th>' +
      '</tr></thead><tbody id="adminsTbl">' + rows + '</tbody></table></div>' +
    '</div>';

  pagHTML('admins', 'adminsTbl');
}

window.openCreateAdminModal = function openCreateAdminModal() {
  var html =
    '<div class="mfld"><label>Admin ID</label><input type="text" id="cAdminId" placeholder="e.g. support_raj"></div>' +
    '<div class="mfld"><label>Name</label><input type="text" id="cAdminName" placeholder="Full name"></div>' +
    '<div class="mfld"><label>Email (optional)</label><input type="email" id="cAdminEmail" placeholder="admin@workindex.co.in"></div>' +
    '<div class="mfld"><label>Password</label><input type="password" id="cAdminPw" placeholder="Min 8 characters"></div>' +
    '<div class="mfld"><label>Role</label>' +
      '<select id="cAdminRole" onchange="onAdminRoleChange()">' +
        '<option value="readonly">👁 Read Only</option>' +
        '<option value="admin">🔧 Admin (custom permissions)</option>' +
        '<option value="super_admin">👑 Super Admin (full access)</option>' +
      '</select>' +
    '</div>' +
    '<div class="mfld"><label>Permission Template</label>' +
      '<select id="cAdminTemplate">' +
        '<option value="readonly">Readonly — view only</option>' +
        '<option value="support">Support Agent — users + tickets + kyc</option>' +
        '<option value="finance">Finance — credits + transactions</option>' +
        '<option value="moderator">Moderator — posts + reports + kyc</option>' +
      '</select>' +
    '</div>' +
    '<div id="cAdminPermBox" style="display:none;margin-top:10px;">' + buildPermissionCheckboxes({}) + '</div>' +
    '<div id="cAdminTabBox">' + buildTabCheckboxes([]) + '</div>';

  showAdminModal('Create Admin', html, function() {
    var payload = {
      adminId:     g('cAdminId').value.trim(),
      name:        g('cAdminName').value.trim(),
      email:       g('cAdminEmail').value.trim(),
      password:    g('cAdminPw').value,
      role:        g('cAdminRole').value,
      template:    g('cAdminTemplate').value,
      permissions: g('cAdminRole').value === 'admin' ? collectPermissions() : undefined,
      allowedTabs: collectAllowedTabs('c')
    };
     
    if (!payload.adminId || !payload.name || !payload.password) { toast('adminId, name and password are required', 'e'); return; }
    api('admins', 'POST', payload).then(function(d) {
      if (d.success) { toast('Admin created!'); closeAdminModal(); loadAdmins(); }
      else toast(d.message || 'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  });
}

window.onAdminRoleChange = function() {
  var role = g('cAdminRole') ? g('cAdminRole').value : '';
  var box = g('cAdminPermBox');
  var tpl = g('cAdminTemplate');
  if (!box || !tpl) return;
  if (role === 'admin') {
    box.style.display = 'block';
    tpl.style.display = 'none';
  } else if (role === 'super_admin') {
    box.style.display = 'none';
    tpl.style.display = 'none';
  } else {
    box.style.display = 'none';
    tpl.style.display = 'block';
  }
};

window.openEditAdminModal = function openEditAdminModal(id) {
  var a = (_adminsList || []).filter(function(x) { return x._id === id; })[0];
  if (!a) { toast('Admin not found', 'e'); return; }

  var perms = a.permissions || {};
  var html =
    '<div class="mfld"><label>Name</label><input type="text" id="eAdminName" value="' + esc(a.name) + '"></div>' +
    '<div class="mfld"><label>Email</label><input type="email" id="eAdminEmail" value="' + esc(a.email || '') + '"></div>' +
    '<div class="mfld"><label>Role</label>' +
      '<select id="eAdminRole">' +
        '<option value="readonly"' + (a.role==='readonly'?' selected':'') + '>👁 Read Only</option>' +
        '<option value="admin"' + (a.role==='admin'?' selected':'') + '>🔧 Admin</option>' +
        '<option value="super_admin"' + (a.role==='super_admin'?' selected':'') + '>👑 Super Admin</option>' +
      '</select>' +
    '</div>' +
    '<div class="mfld"><label>Apply Template (overwrites permissions)</label>' +
      '<select id="eAdminTemplate">' +
        '<option value="">— keep current —</option>' +
        '<option value="readonly">Readonly</option>' +
        '<option value="support">Support Agent</option>' +
        '<option value="finance">Finance</option>' +
        '<option value="moderator">Moderator</option>' +
      '</select>' +
    '</div>' +
    '<div style="margin-top:12px">' + buildPermissionCheckboxes(perms, 'e') + '</div>' +
    buildTabCheckboxes(a.allowedTabs || [], 'e');

  showAdminModal('Edit — ' + a.name, html, function() {
    var template = g('eAdminTemplate').value;
    var payload = {
      name:     g('eAdminName').value.trim(),
      email:    g('eAdminEmail').value.trim(),
      role:     g('eAdminRole').value,
      template: template || undefined,
      permissions: template ? undefined : collectPermissions('e'),
      allowedTabs: collectAllowedTabs('e')
    };
    api('admins/' + id, 'PUT', payload).then(function(d) {
      if (d.success) { toast('Admin updated'); closeAdminModal(); loadAdmins(); }
      else toast(d.message || 'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  });
}

window.toggleAdmin = function(id, name, isActive) {
  if (!confirm((isActive ? 'Deactivate ' : 'Activate ') + name + '?')) return;
  api('admins/' + id + '/toggle', 'POST', {}).then(function(d) {
    if (d.success) { toast(d.message); loadAdmins(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};

window.deleteAdmin = function(id, name) {
  if (!confirm('Permanently delete admin "' + name + '"? This cannot be undone.')) return;
  api('admins/' + id, 'DELETE').then(function(d) {
    if (d.success) { toast('Admin deleted'); loadAdmins(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};

var MODULES = ['users','experts','requests','tickets','credits','chats','reports','kyc','settings','admins'];
var MODULE_LABELS = { users:'Users', experts:'Experts', requests:'Posts/Requests', tickets:'Tickets', credits:'Credits', chats:'Chats', reports:'Reports', kyc:'KYC', settings:'Settings', admins:'Admins' };
var ACTIONS = ['read','write','delete'];

function buildPermissionCheckboxes(perms, prefix) {
  prefix = prefix || 'c';
  var html = '<div style="font-size:11px;font-weight:700;color:#606078;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px">Custom Permissions</div>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">';
  MODULES.forEach(function(mod) {
    var modPerms = (perms && perms[mod]) || {};
    html += '<div style="background:#18181d;border-radius:8px;padding:10px 12px;">';
    html += '<div style="font-size:12px;font-weight:700;color:#f0f0f4;margin-bottom:7px">' + MODULE_LABELS[mod] + '</div>';
    html += '<div style="display:flex;gap:10px;">';
    ACTIONS.forEach(function(act) {
      var checked = modPerms[act] ? 'checked' : '';
      html += '<label style="display:flex;align-items:center;gap:4px;font-size:11px;color:#a0a0b8;cursor:pointer;">' +
        '<input type="checkbox" id="' + prefix + 'perm_' + mod + '_' + act + '" ' + checked + ' style="accent-color:#FC8019"> ' + act +
        '</label>';
    });
    html += '</div></div>';
  });
  html += '</div>';
  return html;
}

function buildTabCheckboxes(allowedTabs, prefix) {
  prefix = prefix || 'c';
  allowedTabs = allowedTabs || [];
  var allTabs = [
    { id:'dashboard',         label:'Dashboard' },
    { id:'heatmap',           label:'Geo Heatmap' },
    { id:'experts',           label:'Experts' },
    { id:'clients',           label:'Clients' },
    { id:'approaches',        label:'Approaches' },
    { id:'chats',             label:'Chats' },
    { id:'credits',           label:'Credits' },
    { id:'refunds',           label:'Refunds' },
    { id:'tickets',           label:'Tickets' },
    { id:'actions',           label:'Actions' },
    { id:'posts',             label:'Posts' },
    { id:'reviews',           label:'Reviews' },
    { id:'registrations',     label:'Registrations' },
    { id:'kyc',               label:'KYC' },
    { id:'payments',          label:'Payments' },
    { id:'reports',           label:'Reports' },
    { id:'suspReq',           label:'Suspended Requests' },
    { id:'revenue',           label:'Revenue' },
    { id:'communication',     label:'Communication' },
    { id:'invoices',          label:'Invoices' },
    { id:'emailNotifications',label:'Email Notifications' },
    { id:'audit',             label:'Audit Log' },
    { id:'settings',          label:'Settings' },
    { id:'admins',            label:'Manage Admins' }
  ];
  var html = '<div style="font-size:11px;font-weight:700;color:#606078;text-transform:uppercase;letter-spacing:.07em;margin:14px 0 10px">Allowed Tabs</div>';
  html += '<div style="display:flex;gap:4px;flex-wrap:wrap;">';
  allTabs.forEach(function(t) {
    var checked = allowedTabs.indexOf(t.id) >= 0 ? 'checked' : '';
    html += '<label style="display:flex;align-items:center;gap:4px;font-size:12px;color:#a0a0b8;cursor:pointer;background:#18181d;padding:5px 10px;border-radius:6px;margin-bottom:4px;">' +
      '<input type="checkbox" class="' + prefix + 'tab-check" data-tab="' + t.id + '" ' + checked + ' style="accent-color:#FC8019"> ' + t.label +
      '</label>';
  });
  html += '</div>';
  return html;
}

function collectAllowedTabs(prefix) {
  prefix = prefix || 'c';
  var tabs = [];
  document.querySelectorAll('.' + prefix + 'tab-check:checked').forEach(function(el) {
    tabs.push(el.dataset.tab);
  });
  return tabs;
}
   
function collectPermissions(prefix) {
  prefix = prefix || 'c';
  var perms = {};
  MODULES.forEach(function(mod) {
    perms[mod] = {};
    ACTIONS.forEach(function(act) {
      var el = g(prefix + 'perm_' + mod + '_' + act);
      perms[mod][act] = el ? el.checked : false;
    });
  });
  return perms;
}

var _adminModalCallback = null;

function showAdminModal(title, bodyHtml, onSave) {
  _adminModalCallback = onSave;
  var existing = g('adminMgmtModal');
  if (existing) existing.remove();
  var div = document.createElement('div');
  div.id = 'adminMgmtModal';
  div.className = 'modal-bg on';
  div.innerHTML =
    '<div class="modal" style="max-width:600px;max-height:85vh;overflow-y:auto">' +
      '<div class="modal-h"><h3>' + title + '</h3><button class="modal-x" onclick="closeAdminModal()">&#215;</button></div>' +
      '<div class="modal-b">' + bodyHtml + '</div>' +
      '<div class="mfoot">' +
        '<button class="btn bgho" onclick="closeAdminModal()">Cancel</button>' +
        '<button class="btn bpri" onclick="if(window._adminModalCallback) window._adminModalCallback()">Save</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(div);
  window._adminModalCallback = onSave;
}

window.closeAdminModal = function() {
  var m = g('adminMgmtModal');
  if (m) m.remove();
};

/* ═══ SEO PAGE MANAGER ══════════════════════════════════════════════════ */
var _seoPages = [];

window.loadSeoPages = function() {
  var sec = g('sec-seo');
  if (!sec) return;
  sec.innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';
  api('seo/pages').then(function(d) {
    _seoPages = d.pages || [];
    renderSeoPages();
  }).catch(function() { toast('Failed to load SEO pages', 'e'); });
};

function renderSeoPages() {
  var sec = g('sec-seo');
  if (!sec) return;
  var rows = _seoPages.map(function(p) {
    return '<tr>' +
      '<td style="font-weight:600;color:#f0f0f4">' + esc(p.slug) + '.html</td>' +
      '<td style="font-size:12px;color:#a0a0b8;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(p.title) + '</td>' +
      '<td style="font-size:12px;color:#606078">' + esc(p.city || p.state || '—') + '</td>' +
      '<td style="font-size:12px;color:#606078">' + esc(p.service || '—') + '</td>' +
      '<td style="font-size:12px;color:#606078">' + fmt(p.createdAt) + '</td>' +
      '<td>' +
        '<a href="https://workindex.co.in/' + esc(p.slug) + '.html" target="_blank" class="btn bgho" style="font-size:12px;padding:5px 10px;margin-right:4px">View</a>' +
        '<button class="btn bywn" style="font-size:12px;padding:5px 10px;margin-right:4px" onclick="copySeoPage(\'' + p._id + '\')">Copy</button>' +
        '<button class="btn brdn" style="font-size:12px;padding:5px 10px" onclick="deleteSeoPage(\'' + p._id + '\',\'' + esc(p.slug) + '\')">Delete</button>' +      '</td>' +
    '</tr>';
  }).join('');

  sec.innerHTML =
    '<div class="card">' +
      '<div class="ch" style="justify-content:space-between">' +
        '<h3>🌐 SEO Pages <span style="font-size:13px;color:#606078;font-weight:400">(' + _seoPages.length + ' pages)</span></h3>' +
        '<button class="btn bpri" onclick="openSeoModal()" style="padding:8px 18px">+ Create SEO Page</button>' +
      '</div>' +
      '<div class="tw"><table><thead><tr>' +
        '<th>Slug / File</th><th>Title</th><th>City / State</th><th>Service</th><th>Created</th><th>Actions</th>' +
      '</tr></thead><tbody>' + (rows || '<tr><td colspan="6" style="text-align:center;padding:30px;color:#606078">No SEO pages created yet</td></tr>') + '</tbody></table></div>' +
    '</div>';
}

window.deleteSeoPage = function(id, slug) {
  if (!confirm('Delete record for ' + slug + '.html?\n\nNote: This only removes the DB record. Delete the file from GitHub manually if needed.')) return;
  api('seo/pages/' + id, 'DELETE').then(function(d) {
    if (d.success) { toast('Record deleted'); loadSeoPages(); }
    else toast(d.message || 'Failed', 'e');
  });
};

var SEO_TEMPLATES = {
  itr: {
    service: 'Income Tax Return Filing',
    statsPrice: '₹999',
    step1Title: 'Post Your Requirement',
    step1P: 'Tell us your taxpayer type, income sources, and filing requirement. Takes under 2 minutes. 100% free.',
    step2Title: 'Receive Quotes from CAs',
    step2P: 'Verified CAs send you personalised quotes. You compare fees, experience, and choose the right CA.',
    step3Title: 'Get Your Return Filed',
    step3P: 'Share documents securely online. Your CA files on the income tax portal and sends you the acknowledgement.',
    step4Title: 'Rate Your CA',
    step4P: 'Leave an honest review after completion and help others find verified CA services.',
    price1Label: 'Salaried Employee', price1Range: '₹999 – ₹1,500', price1Desc: 'Form 16 based ITR filing. Simple returns done in 24–48 hours.',
    price2Label: 'Freelancer / Consultant', price2Range: '₹2,000 – ₹5,000', price2Desc: 'ITR-3 and ITR-4 for independent professionals and consultants.',
    price3Label: 'Business Owner', price3Range: '₹3,000 – ₹10,000', price3Desc: 'P&L, balance sheet, and business ITR with complete documentation.',
    price4Label: 'Capital Gains / NRI', price4Range: '₹2,500 – ₹15,000', price4Desc: 'Equity, mutual funds, property sale, or NRI income tax returns.',
    faq1Q: 'What documents do I need for ITR filing?',
    faq1A: 'For salaried: Form 16, PAN, Aadhaar, bank statements, investment proofs (80C, 80D), AIS from IT portal. For business: P&L, balance sheet, GST returns. Your CA will provide a complete checklist.',
    faq2Q: 'What is the ITR filing deadline?',
    faq2A: '31 July for individuals (non-audit cases). 31 October for audit cases. Belated returns can be filed until 31 December with a late fee under Section 234F.',
    faq3Q: 'How long does ITR filing take?',
    faq3A: 'Simple salaried returns are completed within 24–48 hours of document submission. Business returns may take 3–7 days depending on complexity.',
    faq4Q: 'Old tax regime vs new tax regime — which is better?',
    faq4A: 'It depends on your deductions. A verified CA will calculate your tax under both regimes and recommend whichever saves you more money.',
    faq5Q: 'Can I file ITR online with a CA from another city?',
    faq5A: 'Yes. ITR filing is done entirely online through the income tax portal. Your CA\'s city does not matter — you share documents digitally and receive acknowledgement via email.',
    ctaH2: 'Ready to get your ITR filed?',
    ctaP: 'Post your requirement for free. Verified CAs will send you personalised quotes within 24 hours.',
    footerLinks: '/seo-pages/itr-filing-india.html|ITR Filing India\n/seo-pages/itr-filing-karnataka.html|ITR Filing Karnataka\n/seo-pages/gst-services-india.html|GST Services\n/seo-pages/accounting-services-india.html|Accounting'
  },
  gst: {
    service: 'GST Consulting',
    statsPrice: '₹1,000',
    step1Title: 'Post Your GST Need',
    step1P: 'Select the service — registration, filing, notice, or consultation. Add your business details. Free and takes 2 minutes.',
    step2Title: 'Get Expert Quotes',
    step2P: 'Verified GST consultants respond with personalised quotes and timelines. Compare and choose the right fit.',
    step3Title: 'Stay GST Compliant',
    step3P: 'Work directly with your chosen consultant online. Documents shared securely. Returns filed on time, every time.',
    step4Title: 'Rate Your Expert',
    step4P: 'Leave an honest review after completion and help other businesses find reliable GST professionals.',
    price1Label: 'New GST Registration', price1Range: '₹1,000 – ₹3,000', price1Desc: 'Document collection, portal filing, department follow-up. Done in 3–7 days.',
    price2Label: 'Monthly GSTR Filing', price2Range: '₹500 – ₹3,000/mo', price2Desc: 'GSTR-1 + GSTR-3B filing. Timely filing to avoid late fees and interest.',
    price3Label: 'Annual GST Return (GSTR-9)', price3Range: '₹2,000 – ₹8,000', price3Desc: 'Annual reconciliation filing including GSTR-9C for eligible businesses.',
    price4Label: 'GST Notice Handling', price4Range: '₹3,000 – ₹15,000', price4Desc: 'SCN, scrutiny and audit notice responses by verified GST consultants.',
    faq1Q: 'Who needs GST registration?',
    faq1A: 'Any business with annual turnover above ₹20 lakh (₹10 lakh for some service sectors) must register. E-commerce sellers and inter-state suppliers must register regardless of turnover.',
    faq2Q: 'What is the QRMP scheme?',
    faq2A: 'QRMP allows businesses with turnover up to ₹5 crore to file GSTR-1 and GSTR-3B quarterly while making monthly tax payments. It significantly reduces compliance burden for small businesses.',
    faq3Q: 'What happens if I miss a GST filing deadline?',
    faq3A: 'Late fees of ₹50/day (₹20/day for nil returns) apply, plus 18% per annum interest on outstanding tax. A GST consultant can help file overdue returns and minimise penalties.',
    faq4Q: 'How long does GST registration take?',
    faq4A: 'Typically 3–7 working days after submitting all documents. The consultant handles the application, document submission, and department follow-up on your behalf.',
    faq5Q: 'Can I hire a GST consultant from another city?',
    faq5A: 'Yes. GST registration and filing are done entirely online through the GST portal. A consultant from any city can handle your compliance without physical visits.',
    ctaH2: 'Need a GST consultant?',
    ctaP: 'Post your requirement free. Verified GST experts will send you personalised quotes within 24 hours.',
    footerLinks: '/seo-pages/gst-services-india.html|GST Services India\n/seo-pages/gst-services-karnataka.html|GST Services Karnataka\n/seo-pages/itr-filing-india.html|ITR Filing\n/seo-pages/accounting-services-india.html|Accounting'
  },
  accounting: {
    service: 'Accounting & Bookkeeping',
    statsPrice: '₹1,500',
    step1Title: 'Post Your Requirement',
    step1P: 'Describe your business size, accounting software used, and specific needs. Free and takes 2 minutes.',
    step2Title: 'Receive Quotes',
    step2P: 'Verified accountants send personalised quotes based on your transaction volume and complexity.',
    step3Title: 'Get Your Books in Order',
    step3P: 'Work with your chosen accountant online. Share documents securely. Books maintained accurately every month.',
    step4Title: 'Rate Your Accountant',
    step4P: 'Leave an honest review and help other businesses find reliable accounting professionals.',
    price1Label: 'Startup / Small Business', price1Range: '₹1,500 – ₹4,000/mo', price1Desc: 'Monthly bookkeeping, P&L, balance sheet for businesses with up to 100 transactions/month.',
    price2Label: 'Growing SME', price2Range: '₹4,000 – ₹10,000/mo', price2Desc: '100–500 transactions/month. Accounts payable, receivable, bank reconciliation included.',
    price3Label: 'Payroll Processing', price3Range: '₹2,000 – ₹8,000/mo', price3Desc: 'Monthly payroll, PF, ESI, TDS on salary for businesses with up to 50 employees.',
    price4Label: 'Annual Accounts Preparation', price4Range: '₹5,000 – ₹20,000', price4Desc: 'Year-end financial statements, P&L, balance sheet for statutory filing and audit.',
    faq1Q: 'What is the difference between bookkeeping and accounting?',
    faq1A: 'Bookkeeping involves recording daily financial transactions — invoices, payments, expenses. Accounting involves interpreting, classifying, and summarising those records into financial statements, tax returns, and business insights.',
    faq2Q: 'What accounting software do your accountants use?',
    faq2A: 'Most accountants on WorkIndex work with Tally, QuickBooks, Zoho Books, and Excel. Mention your preferred software when posting your requirement and they will match accordingly.',
    faq3Q: 'Do I need an accountant if I use Tally or Zoho?',
    faq3A: 'Software helps you record transactions, but a qualified accountant ensures entries are categorised correctly, GST is reconciled, TDS is deducted, and your books are audit-ready. Most businesses need both.',
    faq4Q: 'How often should I get my books updated?',
    faq4A: 'Monthly is the standard for most businesses. It helps with GST filing, accurate P&L tracking, and early identification of cash flow issues. Year-end accounting is insufficient for any growing business.',
    faq5Q: 'Can the accountant work remotely with my business?',
    faq5A: 'Yes. All accountants on WorkIndex offer fully remote services. You share invoices, bank statements, and expense records digitally — they maintain your books and share reports monthly.',
    ctaH2: 'Find an Accountant for Your Business',
    ctaP: 'Post your requirement free. Verified accountants will send you personalised quotes within 24 hours.',
    footerLinks: '/seo-pages/accounting-services-india.html|Accounting India\n/seo-pages/itr-filing-india.html|ITR Filing\n/seo-pages/gst-services-india.html|GST Services'
  }
};

window.applySeoTemplate = function(category) {
  var t = SEO_TEMPLATES[category];
  if (!t) return;
  var map = {
    seoService: t.service, seoStatsPrice: t.statsPrice,
    seoS1T: t.step1Title, seoS1P: t.step1P,
    seoS2T: t.step2Title, seoS2P: t.step2P,
    seoS3T: t.step3Title, seoS3P: t.step3P,
    seoS4T: t.step4Title, seoS4P: t.step4P,
    seoP1L: t.price1Label, seoP1R: t.price1Range, seoP1D: t.price1Desc,
    seoP2L: t.price2Label, seoP2R: t.price2Range, seoP2D: t.price2Desc,
    seoP3L: t.price3Label, seoP3R: t.price3Range, seoP3D: t.price3Desc,
    seoP4L: t.price4Label, seoP4R: t.price4Range, seoP4D: t.price4Desc,
    seoF1Q: t.faq1Q, seoF1A: t.faq1A,
    seoF2Q: t.faq2Q, seoF2A: t.faq2A,
    seoF3Q: t.faq3Q, seoF3A: t.faq3A,
    seoF4Q: t.faq4Q, seoF4A: t.faq4A,
    seoF5Q: t.faq5Q, seoF5A: t.faq5A,
    seoCtaH: t.ctaH2, seoCtaP: t.ctaP,
    seoFooter: t.footerLinks || ''
  };
  Object.keys(map).forEach(function(id) {
    var el = document.getElementById(id);
    if (el && map[id]) el.value = map[id];
  });
  toast('✅ ' + category.toUpperCase() + ' template applied — fill in the city-specific details', 'i');
};   
   
window.openSeoModal = function(prefill) {
  prefill = prefill || {};
  var existing = g('seoCreateModal');
  if (existing) existing.remove();

  var div = document.createElement('div');
  div.id = 'seoCreateModal';
  div.className = 'modal-bg on';
  div.style.cssText = 'overflow-y:auto;';
  div.innerHTML = `
  <div class="modal" style="max-width:700px;max-height:90vh;overflow-y:auto;">
    <div class="modal-h"><h3>🌐 Create SEO Page</h3><button class="modal-x" onclick="closeSeoModal()">&#215;</button></div>
    <div class="modal-b">

      <div style="background:rgba(252,128,25,0.08);border:1px solid rgba(252,128,25,0.25);border-radius:10px;padding:14px 16px;margin-bottom:16px;">
        <div style="font-size:12px;font-weight:700;color:#FC8019;margin-bottom:10px;">⚡ Autofill from Template</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="applySeoTemplate('itr')" style="padding:7px 14px;border-radius:7px;border:1px solid rgba(252,128,25,0.4);background:rgba(252,128,25,0.1);color:#FC8019;font-size:13px;font-weight:600;cursor:pointer;">📄 ITR Filing</button>
          <button onclick="applySeoTemplate('gst')" style="padding:7px 14px;border-radius:7px;border:1px solid rgba(59,130,246,0.4);background:rgba(59,130,246,0.1);color:#3b82f6;font-size:13px;font-weight:600;cursor:pointer;">🏢 GST Services</button>
          <button onclick="applySeoTemplate('accounting')" style="padding:7px 14px;border-radius:7px;border:1px solid rgba(34,197,94,0.4);background:rgba(34,197,94,0.1);color:#22c55e;font-size:13px;font-weight:600;cursor:pointer;">📊 Accounting</button>
        </div>
        <div style="font-size:11px;color:#606078;margin-top:8px;">Select a template to autofill steps, pricing, FAQs and CTA. Then just fill in the city-specific details above.</div>
      </div>
      <div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Page Identity</div>
      <div class="mfld"><label>Slug (filename without .html)</label><input type="text" id="seoSlug" placeholder="e.g. itr-filing-belgaum" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9-]/g,'-')"></div>
      <div class="mfld"><label>Page Title (browser tab)</label><input type="text" id="seoTitle" placeholder="ITR Filing in Belgaum — WorkIndex | Verified CA Services"></div>
      <div class="mfld"><label>Meta Description</label><textarea id="seoMetaDesc" rows="2" placeholder="Find verified CAs for ITR filing in Belgaum..."></textarea></div>
      <div class="mfld"><label>Meta Keywords</label><input type="text" id="seoMetaKw" placeholder="ITR filing Belgaum, income tax Belgaum, CA Belgaum..."></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="mfld"><label>Service Type</label><input type="text" id="seoService" placeholder="Income Tax Return Filing"></div>
        <div class="mfld"><label>City (leave blank for state page)</label><input type="text" id="seoCity" placeholder="Belgaum"></div>
        <div class="mfld"><label>State</label><input type="text" id="seoState" placeholder="Karnataka"></div>
        <div class="mfld"><label>Stats Label</label><input type="text" id="seoStatsLabel" placeholder="Verified Belgaum CAs"></div>
        <div class="mfld"><label>Stats Starting Price</label><input type="text" id="seoStatsPrice" placeholder="₹999"></div>
      </div>

      <div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin:16px 0 12px">Hero Section</div>
      <div class="mfld"><label>Hero Eyebrow</label><input type="text" id="seoEyebrow" placeholder="📄 ITR Filing · Belgaum, Karnataka"></div>
      <div class="mfld"><label>Hero H1 (line 1)</label><input type="text" id="seoH1" placeholder="ITR Filing in Belgaum"></div>
      <div class="mfld"><label>Hero H1 Span (orange text line 2)</label><input type="text" id="seoH1Span" placeholder="Verified CA Services"></div>
      <div class="mfld"><label>Hero Paragraph</label><textarea id="seoHeroP" rows="2" placeholder="Find verified CAs in Belgaum for income tax return filing..."></textarea></div>

      <div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin:16px 0 12px">Steps (How It Works)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="mfld"><label>Step 1 Title</label><input type="text" id="seoS1T" placeholder="Post Your Requirement"></div>
        <div class="mfld"><label>Step 1 Text</label><input type="text" id="seoS1P" placeholder="Tell us your taxpayer type..."></div>
        <div class="mfld"><label>Step 2 Title</label><input type="text" id="seoS2T" placeholder="Receive Quotes"></div>
        <div class="mfld"><label>Step 2 Text</label><input type="text" id="seoS2P" placeholder="Verified CAs send personalised quotes..."></div>
        <div class="mfld"><label>Step 3 Title</label><input type="text" id="seoS3T" placeholder="Get Your Return Filed"></div>
        <div class="mfld"><label>Step 3 Text</label><input type="text" id="seoS3P" placeholder="Share documents securely..."></div>
        <div class="mfld"><label>Step 4 Title</label><input type="text" id="seoS4T" placeholder="Rate Your CA"></div>
        <div class="mfld"><label>Step 4 Text</label><input type="text" id="seoS4P" placeholder="Leave an honest review..."></div>
      </div>

      <div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin:16px 0 12px">Pricing Cards</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="mfld"><label>Price Card 1 Label</label><input type="text" id="seoP1L" placeholder="Salaried Employee"></div>
        <div class="mfld"><label>Price Card 1 Range</label><input type="text" id="seoP1R" placeholder="₹999 – ₹1,500"></div>
        <div class="mfld"><label>Price Card 1 Description</label><input type="text" id="seoP1D" placeholder="Form 16 based filing..."></div>
        <div class="mfld"><label>Price Card 2 Label</label><input type="text" id="seoP2L" placeholder="Freelancer / Consultant"></div>
        <div class="mfld"><label>Price Card 2 Range</label><input type="text" id="seoP2R" placeholder="₹2,000 – ₹5,000"></div>
        <div class="mfld"><label>Price Card 2 Description</label><input type="text" id="seoP2D" placeholder="ITR-3 and ITR-4 filing..."></div>
        <div class="mfld"><label>Price Card 3 Label</label><input type="text" id="seoP3L" placeholder="Business Owner"></div>
        <div class="mfld"><label>Price Card 3 Range</label><input type="text" id="seoP3R" placeholder="₹3,000 – ₹10,000"></div>
        <div class="mfld"><label>Price Card 3 Description</label><input type="text" id="seoP3D" placeholder="P&L, balance sheet..."></div>
        <div class="mfld"><label>Price Card 4 Label</label><input type="text" id="seoP4L" placeholder="Capital Gains / NRI"></div>
        <div class="mfld"><label>Price Card 4 Range</label><input type="text" id="seoP4R" placeholder="₹2,500 – ₹15,000"></div>
        <div class="mfld"><label>Price Card 4 Description</label><input type="text" id="seoP4D" placeholder="DTAA, foreign income..."></div>
      </div>

      <div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin:16px 0 12px">FAQ (5 Questions)</div>
      <div class="mfld"><label>FAQ 1 Question</label><input type="text" id="seoF1Q" placeholder="How much does ITR filing cost in Belgaum?"></div>
      <div class="mfld"><label>FAQ 1 Answer</label><textarea id="seoF1A" rows="2"></textarea></div>
      <div class="mfld"><label>FAQ 2 Question</label><input type="text" id="seoF2Q"></div>
      <div class="mfld"><label>FAQ 2 Answer</label><textarea id="seoF2A" rows="2"></textarea></div>
      <div class="mfld"><label>FAQ 3 Question</label><input type="text" id="seoF3Q"></div>
      <div class="mfld"><label>FAQ 3 Answer</label><textarea id="seoF3A" rows="2"></textarea></div>
      <div class="mfld"><label>FAQ 4 Question</label><input type="text" id="seoF4Q"></div>
      <div class="mfld"><label>FAQ 4 Answer</label><textarea id="seoF4A" rows="2"></textarea></div>
      <div class="mfld"><label>FAQ 5 Question</label><input type="text" id="seoF5Q"></div>
      <div class="mfld"><label>FAQ 5 Answer</label><textarea id="seoF5A" rows="2"></textarea></div>

      <div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin:16px 0 12px">CTA Banner</div>
      <div class="mfld"><label>CTA Heading</label><input type="text" id="seoCtaH" placeholder="Find a CA for ITR Filing in Belgaum — Free"></div>
      <div class="mfld"><label>CTA Paragraph</label><input type="text" id="seoCtaP" placeholder="Post your requirement free. Verified CAs will respond within 24 hours."></div>

      <div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin:16px 0 12px">Footer Links (one per line: url|Label)</div>
      <div class="mfld"><textarea id="seoFooter" rows="4" placeholder="/seo-pages/itr-filing-india.html|ITR Filing India&#10;/seo-pages/itr-filing-karnataka.html|ITR Filing Karnataka&#10;/seo-pages/gst-services-india.html|GST Services"></textarea></div>

    </div>
    <div class="mfoot" style="justify-content:space-between">
      <button class="btn bgho" onclick="closeSeoModal()">Cancel</button>
      <div style="display:flex;gap:8px">
        <button class="btn bywn" onclick="previewSeoPage()">👁 Preview</button>
        <button class="btn bpri" id="seoSubmitBtn" onclick="submitSeoPage()">🚀 Publish to Vercel</button>
      </div>
    </div>
  </div>`;
   window._seoModalPrefill = prefill || null;
  document.body.appendChild(div);
  // Prefill fields if copying an existing page
  (function() {
    var p = window._seoModalPrefill || {};
    if (!p || !p.slug) return;
    var fields = {
      seoSlug: p.slug ? p.slug + '-copy' : '',
      seoTitle: p.title || '',
      seoMetaDesc: p.metaDescription || '',
      seoMetaKw: p.metaKeywords || '',
      seoService: p.service || '',
      seoCity: p.city || '',
      seoState: p.state || '',
      seoStatsLabel: p.statsLabel || '',
      seoStatsPrice: p.statsPrice || '',
      seoEyebrow: p.heroEyebrow || '',
      seoH1: p.heroH1 || '',
      seoH1Span: p.heroH1Span || '',
      seoHeroP: p.heroP || '',
      seoS1T: p.step1Title || '', seoS1P: p.step1P || '',
      seoS2T: p.step2Title || '', seoS2P: p.step2P || '',
      seoS3T: p.step3Title || '', seoS3P: p.step3P || '',
      seoS4T: p.step4Title || '', seoS4P: p.step4P || '',
      seoP1L: p.price1Label || '', seoP1R: p.price1Range || '', seoP1D: p.price1Desc || '',
      seoP2L: p.price2Label || '', seoP2R: p.price2Range || '', seoP2D: p.price2Desc || '',
      seoP3L: p.price3Label || '', seoP3R: p.price3Range || '', seoP3D: p.price3Desc || '',
      seoP4L: p.price4Label || '', seoP4R: p.price4Range || '', seoP4D: p.price4Desc || '',
      seoF1Q: p.faq1Q || '', seoF1A: p.faq1A || '',
      seoF2Q: p.faq2Q || '', seoF2A: p.faq2A || '',
      seoF3Q: p.faq3Q || '', seoF3A: p.faq3A || '',
      seoF4Q: p.faq4Q || '', seoF4A: p.faq4A || '',
      seoF5Q: p.faq5Q || '', seoF5A: p.faq5A || '',
      seoCtaH: p.ctaH2 || '',
      seoCtaP: p.ctaP || '',
      seoFooter: (p.footerLinks || []).map(function(l){ return l.href + '|' + l.label; }).join('\n')
    };
    Object.keys(fields).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = fields[id];
    });
    window._seoModalPrefill = null;
  })();
};
   
function collectSeoData() {
  var footerRaw = (g('seoFooter') && g('seoFooter').value) || '';
  var footerLinks = footerRaw.split('\n').filter(Boolean).map(function(line) {
    var parts = line.split('|');
    return { href: (parts[0] || '').trim(), label: (parts[1] || '').trim() };
  }).filter(function(l) { return l.href && l.label; });

  return {
    slug:            g('seoSlug').value.trim(),
    title:           g('seoTitle').value.trim(),
    metaDescription: g('seoMetaDesc').value.trim(),
    metaKeywords:    g('seoMetaKw').value.trim(),
    service:         g('seoService').value.trim(),
    city:            g('seoCity').value.trim(),
    state:           g('seoState').value.trim(),
    statsLabel:      g('seoStatsLabel').value.trim(),
    statsPrice:      g('seoStatsPrice').value.trim(),
    heroEyebrow:     g('seoEyebrow').value.trim(),
    heroH1:          g('seoH1').value.trim(),
    heroH1Span:      g('seoH1Span').value.trim(),
    heroP:           g('seoHeroP').value.trim(),
    step1Title: g('seoS1T').value, step1P: g('seoS1P').value,
    step2Title: g('seoS2T').value, step2P: g('seoS2P').value,
    step3Title: g('seoS3T').value, step3P: g('seoS3P').value,
    step4Title: g('seoS4T').value, step4P: g('seoS4P').value,
    price1Label: g('seoP1L').value, price1Range: g('seoP1R').value, price1Desc: g('seoP1D').value,
    price2Label: g('seoP2L').value, price2Range: g('seoP2R').value, price2Desc: g('seoP2D').value,
    price3Label: g('seoP3L').value, price3Range: g('seoP3R').value, price3Desc: g('seoP3D').value,
    price4Label: g('seoP4L').value, price4Range: g('seoP4R').value, price4Desc: g('seoP4D').value,
    faq1Q: g('seoF1Q').value, faq1A: g('seoF1A').value,
    faq2Q: g('seoF2Q').value, faq2A: g('seoF2A').value,
    faq3Q: g('seoF3Q').value, faq3A: g('seoF3A').value,
    faq4Q: g('seoF4Q').value, faq4A: g('seoF4A').value,
    faq5Q: g('seoF5Q').value, faq5A: g('seoF5A').value,
    ctaH2: g('seoCtaH').value,
    ctaP:  g('seoCtaP').value,
    footerLinks: footerLinks
  };
}

window.previewSeoPage = function() {
  var data = collectSeoData();
  if (!data.slug) { toast('Enter a slug first', 'e'); return; }
  api('seo/pages/preview', 'POST', data).then(function(d) {
    if (d.success) {
      var w = window.open('', '_blank');
      w.document.write(d.html);
      w.document.close();
    } else toast(d.message || 'Preview failed', 'e');
  });
};

window.submitSeoPage = function() {
  var data = collectSeoData();
  if (!data.slug || !data.title || !data.metaDescription) {
    toast('Slug, title and meta description are required', 'e'); return;
  }
  var btn = g('seoSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Publishing...'; }
  api('seo/pages', 'POST', data).then(function(d) {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Publish to Netlify'; }
    if (d.success) {
      toast('✅ Page published! Live in ~30 seconds: ' + d.url);
      g('seoCreateModal') && g('seoCreateModal').remove();
      loadSeoPages();
    } else toast(d.message || 'Failed', 'e');
  }).catch(function() {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Publish to Netlify'; }
    toast('Error', 'e');
  });
};

window.closeSeoModal = function() {
  var m = document.getElementById('seoCreateModal');
  if (m) m.remove();
};

window.copySeoPage = function(id) {
  var page = _seoPages.filter(function(p) { return p._id === id; })[0];
  if (!page) { toast('Page not found', 'e'); return; }
  openSeoModal(page); // pass existing data to pre-fill
};
   
window.goBackToTicket = function() {
  var tid = _tkId;
  closeDr();
  if (tid) {
    setTimeout(function() { openTicketModal(tid); }, 250);
  }
};
   
/* ═══ APPROACH DETAIL VIEWER (from ticket modal) ═══════════════════════ */
window.loadApproachDetail = function(approachId) {
  // Open in the existing drawer
  g('ov1').classList.add('on'); g('dr1').classList.add('on');
  g('drT').textContent = '📋 Approach Detail';
  g('drTabs').innerHTML = '';
  g('drB').innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';

  api('approaches/' + approachId).then(function(d) {
    if (!d.success || !d.approach) {
      // Fallback: search approaches
      return api('approaches?limit=200').then(function(d2) {
        var found = (d2.approaches||[]).filter(function(a) { return a._id === approachId; })[0];
        return { success: !!found, approach: found };
      });
    }
    return d;
  }).then(function(d) {
    if (!d.success || !d.approach) {
      g('drB').innerHTML = '<div class="empty"><h3>Approach not found</h3></div>';
      return;
    }
    var a = d.approach;
    var expert = a.expert || {};
    var client = a.client || {};
    var request = a.request || {};

    var statusColor = { pending:'#f59e0b', accepted:'#22c55e', rejected:'#ef4444', completed:'#3b82f6' };
    var sColor = statusColor[a.status] || '#a0a0b8';

    var html =
      // Expert + Client header
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
        '<div style="background:#18181d;border-radius:10px;padding:12px 14px;">' +
          '<div style="font-size:10px;color:#606078;text-transform:uppercase;margin-bottom:5px;">Expert</div>' +
          '<div style="font-size:14px;font-weight:700;color:#FC8019;cursor:pointer;" data-uid="' + (expert._id||'') + '">' + esc(expert.name||'—') + '</div>' +
          '<div style="font-size:11px;color:#606078;">' + esc(expert.email||'') + '</div>' +
        '</div>' +
        '<div style="background:#18181d;border-radius:10px;padding:12px 14px;">' +
          '<div style="font-size:10px;color:#606078;text-transform:uppercase;margin-bottom:5px;">Client</div>' +
          '<div style="font-size:14px;font-weight:700;color:#3b82f6;cursor:pointer;" data-uid="' + (client._id||'') + '">' + esc(client.name||'—') + '</div>' +
          '<div style="font-size:11px;color:#606078;">' + esc(client.email||'') + '</div>' +
        '</div>' +
      '</div>' +

      // Stats row
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px;">' +
        '<div style="background:#18181d;border-radius:10px;padding:12px 14px;text-align:center;">' +
          '<div style="font-size:10px;color:#606078;margin-bottom:4px;">Status</div>' +
          '<div style="font-size:14px;font-weight:700;color:' + sColor + ';">' + esc(a.status||'—') + '</div>' +
        '</div>' +
        '<div style="background:#18181d;border-radius:10px;padding:12px 14px;text-align:center;">' +
          '<div style="font-size:10px;color:#606078;margin-bottom:4px;">Credits Spent</div>' +
          '<div style="font-size:20px;font-weight:800;color:#FC8019;">' + (a.creditsSpent||0) + '</div>' +
        '</div>' +
        '<div style="background:#18181d;border-radius:10px;padding:12px 14px;text-align:center;">' +
          '<div style="font-size:10px;color:#606078;margin-bottom:4px;">Quote</div>' +
          '<div style="font-size:14px;font-weight:700;color:#f59e0b;">' + (a.quote ? '₹' + Number(a.quote).toLocaleString('en-IN') : '—') + '</div>' +
        '</div>' +
      '</div>' +

      // Request
      '<div style="background:#18181d;border-radius:10px;padding:12px 14px;margin-bottom:12px;">' +
        '<div style="font-size:10px;color:#606078;text-transform:uppercase;margin-bottom:6px;">Request</div>' +
        '<div style="font-size:13px;font-weight:600;color:#f0f0f4;">' + esc(request.title||'—') + '</div>' +
        (request.service ? '<div style="font-size:11px;color:#606078;margin-top:3px;">' + esc(request.service) + '</div>' : '') +
      '</div>' +

      // Message
      (a.message ?
        '<div style="background:#18181d;border-radius:10px;padding:12px 14px;margin-bottom:12px;">' +
          '<div style="font-size:10px;color:#606078;text-transform:uppercase;margin-bottom:6px;">Expert\'s Message</div>' +
          '<div style="font-size:13px;color:#c0c0d8;line-height:1.7;white-space:pre-wrap;">' + esc(a.message) + '</div>' +
        '</div>' : '') +

      // Date
      '<div style="font-size:12px;color:#606078;margin-bottom:16px;">Submitted: ' + fmtT(a.createdAt) + '</div>' +

      // Refund action
      '<div style="background:rgba(252,128,25,.06);border:1px solid rgba(252,128,25,.2);border-radius:10px;padding:14px 16px;">' +
        '<div style="font-size:12px;color:#a0a0b8;margin-bottom:10px;">This approach is linked to an expert refund ticket. If you approve the ticket, <strong style="color:#FC8019;">' + (a.creditsSpent||0) + ' credits</strong> will be returned to the expert.</div>' +
        '<button onclick="goBackToTicket()" style="padding:8px 16px;border-radius:7px;border:1px solid #2a2a38;background:#18181d;color:#a0a0b8;font-size:13px;cursor:pointer;">← Back to Ticket</button>' +
      '</div>';

    g('drB').innerHTML = html;
  }).catch(function() {
    g('drB').innerHTML = '<div class="empty"><h3>Error loading approach</h3></div>';
  });
};

/* ═══ SERVICE CATEGORIES CMS ════════════════════════════════════════════ */
 
var _serviceCategories = [];
var _editingCategoryId = null;
var _platformSettings = null;
 
// Question type definitions
var Q_TYPES = [
  { value: 'radio',          label: '⚪ Single Choice (Radio)' },
  { value: 'checkbox',       label: '☑️ Multiple Choice (Checkbox)' },
  { value: 'text',           label: '✏️ Short Text Input' },
     { value: 'date',     label: '📅 Date Picker' },
  { value: 'textarea',       label: '📝 Long Text (Textarea)' },
  { value: 'select',         label: '🔽 Dropdown Select' },
  { value: 'address',        label: '📍 Address (Full — building, area, city, state, pincode)' },
  { value: 'address-simple', label: '📍 Address (Simple — city, state, pincode only)' },
  { value: 'slider',         label: '🎚️ Budget Slider (₹ range)' },
  { value: 'pincode',        label: '🔢 Pincode Input' },
];
 
window.loadServiceCategories = function() {
  var sec = g('sec-serviceCategories');
  if (!sec) return;
  sec.innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';
  Promise.all([
    api('service-categories'),
    api('service-categories/settings/platform').catch(function() { return { success:false }; })
  ]).then(function(results) {
    var d = results[0], s = results[1];
    _serviceCategories = d.categories || [];
    _platformSettings = s && s.settings ? s.settings : null;
    renderServiceCategoriesPage();
  }).catch(function() { toast('Failed to load service categories', 'e'); });
};
 
function renderServiceCategoriesPage() {
  var sec = g('sec-serviceCategories');
  if (!sec) return;
 
  var rows = _serviceCategories.filter(function(c) { return !c.value.startsWith('_'); }).map(function(c) {
    var statusBadge = c.isActive
      ? '<span class="badge bgr">Active</span>'
      : '<span class="badge brd">Inactive</span>';
    return '<tr>' +
      '<td><span style="font-size:20px;">' + esc(c.icon) + '</span></td>' +
      '<td style="font-weight:700;color:#f0f0f4">' + esc(c.value) + '</td>' +
      '<td style="color:#a0a0b8">' + esc(c.label) + '</td>' +
      '<td><span style="background:' + esc(c.color) + '25;color:' + esc(c.color) + ';padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">' + esc(c.color) + '</span></td>' +
      '<td style="color:#f59e0b;font-weight:600">' + (c.creditCost || 20) + ' cr</td>' +
      '<td style="color:#a0a0b8">' + (c.questions ? c.questions.length : 0) + ' questions</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' +
        '<button class="btn bgho" style="font-size:12px;padding:5px 10px;margin-right:4px" onclick="openEditCategoryModal(\'' + c._id + '\')">Edit</button>' +
        '<button class="btn bywn" style="font-size:12px;padding:5px 10px;margin-right:4px" onclick="previewCategoryConfig(\'' + c._id + '\')">Preview</button>' +
        '<button class="btn brdn" style="font-size:12px;padding:5px 10px" onclick="deleteCategory(\'' + c._id + '\',\'' + esc(c.label) + '\')">Delete</button>' +
      '</td>' +
    '</tr>';
  }).join('');
 
  sec.innerHTML =
    '<div class="card">' +
      '<div class="ch" style="justify-content:space-between;flex-wrap:wrap;gap:10px">' +
        '<h3>⚙️ Service Categories <span style="font-size:13px;color:#606078;font-weight:400">(' + _serviceCategories.length + ' total)</span></h3>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<button class="btn bgho" onclick="syncCategoriesToGitHub()" style="padding:8px 14px;font-size:13px">🔄 Force Sync GitHub</button>' +
          '<button class="btn bywn" onclick="seedDefaultCategories()" style="padding:8px 14px;font-size:13px">🌱 Seed Services</button>' +
          '<button class="btn bywn" style="padding:8px 14px;font-size:13px;background:rgba(99,102,241,0.15);color:#6366f1;border-color:rgba(99,102,241,0.4)" onclick="seedCommonSteps()">🔗 Seed Common Steps</button>' +
          '<button class="btn bywn" style="padding:8px 14px;font-size:13px;background:rgba(245,158,11,0.15);color:#f59e0b;border-color:rgba(245,158,11,0.4)" onclick="seedExpertSteps()">⭐ Seed Expert Steps</button>' +
          '<button class="btn brdn" style="padding:8px 14px;font-size:13px" onclick="resetExpertSteps()">🗑 Reset Expert</button>' +
          '<button class="btn bpri" onclick="openCreateCategoryModal()" style="padding:8px 18px">+ Add Category</button>' +
        '</div>' +
      '</div>' +
      '<div style="padding:0 0 12px;font-size:12px;color:#606078;line-height:1.6;">' +
        'Changes are automatically pushed to <strong style="color:#f0f0f4">services-config.js</strong> on GitHub → Vercel auto-deploys in ~60 seconds. ' +
        'The questionnaire appears in the client\'s "Post a Request" flow.' +
      '</div>' +
      '<div id="specialCategoryCards" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;padding:0 0 4px;"></div>' +
      '<div id="platformCreditSettings" style="margin-bottom:20px;"></div>' +
      '<div class="tw"><table><thead><tr>' +
        '<th>Icon</th><th>Value (key)</th><th>Label</th><th>Color</th><th>Credits</th><th>Questions</th><th>Status</th><th>Actions</th>' +
      '</tr></thead><tbody>' +
      (rows || '<tr><td colspan="8" style="text-align:center;padding:30px;color:#606078">No categories yet.</td></tr>') +
      '</tbody></table></div>' +
    '</div>';
    // Render special category cards (common + expert)
  renderSpecialCategoryCards();
  renderPlatformCreditSettings();
}
window.loadEmailNotifications = loadEmailNotifications;

function renderPlatformCreditSettings() {
  var container = document.getElementById('platformCreditSettings');
  if (!container) return;
  var settings = _platformSettings || {};
  var packs = settings.creditPacks || [
    { id:'starter', label:'Starter', credits:15, price:100, active:true },
    { id:'basic', label:'Basic', credits:40, price:250, active:true },
    { id:'popular', label:'Popular', credits:180, price:1000, active:true },
    { id:'pro', label:'Pro', credits:500, price:2500, active:true }
  ];
  var rows = packs.map(function(p, idx) {
    return '<tr data-pack-row="' + idx + '">' +
      '<td><input class="pack-id" value="' + esc(p.id || '') + '" style="width:100%;padding:7px;background:#0f0f13;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
      '<td><input class="pack-label" value="' + esc(p.label || '') + '" style="width:100%;padding:7px;background:#0f0f13;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
      '<td><input class="pack-credits" type="number" min="1" value="' + (p.credits || 1) + '" style="width:90px;padding:7px;background:#0f0f13;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
      '<td><input class="pack-price" type="number" min="1" value="' + (p.price || 1) + '" style="width:90px;padding:7px;background:#0f0f13;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
      '<td style="text-align:center"><input class="pack-active" type="checkbox" ' + (p.active !== false ? 'checked' : '') + ' style="accent-color:#FC8019"></td>' +
      '<td><button class="btn brdn" style="font-size:12px;padding:5px 10px" onclick="removeCreditPackRow(this)">Delete</button></td>' +
    '</tr>';
  }).join('');
  container.innerHTML =
    '<div class="ch" style="display:block;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">' +
        '<div><h3 style="margin:0 0 4px;">Credit Pricing & Defaults</h3><div style="font-size:12px;color:#606078;">Controls expert credit packs and fallback credits for customer posts when a service has no category credit cost.</div></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn bgho" onclick="addCreditPackRow()">+ Add Pack</button><button class="btn bpri" onclick="savePlatformCreditSettings()">Save Pricing</button></div>' +
      '</div>' +
      '<div class="mfld" style="max-width:260px;margin-bottom:12px;"><label>Default Customer Post Credits</label><input type="number" id="defaultPostCredits" min="1" value="' + (settings.defaultPostCredits || 20) + '"></div>' +
      '<div class="tw"><table><thead><tr><th>Pack ID</th><th>Label</th><th>Credits</th><th>Price</th><th>Active</th><th></th></tr></thead><tbody id="creditPackRows">' + rows + '</tbody></table></div>' +
    '</div>';
}

window.addCreditPackRow = function() {
  var body = document.getElementById('creditPackRows');
  if (!body) return;
  var idx = body.querySelectorAll('tr').length;
  var tr = document.createElement('tr');
  tr.setAttribute('data-pack-row', idx);
  tr.innerHTML =
    '<td><input class="pack-id" value="custom_' + (idx + 1) + '" style="width:100%;padding:7px;background:#0f0f13;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
    '<td><input class="pack-label" value="Custom" style="width:100%;padding:7px;background:#0f0f13;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
    '<td><input class="pack-credits" type="number" min="1" value="100" style="width:90px;padding:7px;background:#0f0f13;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
    '<td><input class="pack-price" type="number" min="1" value="500" style="width:90px;padding:7px;background:#0f0f13;border:1px solid #2a2a38;border-radius:6px;color:#f0f0f4"></td>' +
    '<td style="text-align:center"><input class="pack-active" type="checkbox" checked style="accent-color:#FC8019"></td>' +
    '<td><button class="btn brdn" style="font-size:12px;padding:5px 10px" onclick="removeCreditPackRow(this)">Delete</button></td>';
  body.appendChild(tr);
};

window.removeCreditPackRow = function(btn) {
  var row = btn && btn.closest ? btn.closest('tr') : null;
  if (row) row.remove();
};

window.savePlatformCreditSettings = function() {
  var defaultInput = document.getElementById('defaultPostCredits');
  var packs = Array.prototype.slice.call(document.querySelectorAll('#creditPackRows tr')).map(function(row) {
    return {
      id: row.querySelector('.pack-id').value,
      label: row.querySelector('.pack-label').value,
      credits: parseInt(row.querySelector('.pack-credits').value) || 0,
      price: parseInt(row.querySelector('.pack-price').value) || 0,
      active: row.querySelector('.pack-active').checked
    };
  });
  api('service-categories/settings/platform', 'PUT', {
    defaultPostCredits: parseInt(defaultInput ? defaultInput.value : 20) || 20,
    creditPacks: packs
  }).then(function(d) {
    if (d.success) { toast('Credit pricing saved'); _platformSettings = d.settings; renderPlatformCreditSettings(); }
    else toast(d.message || 'Failed to save pricing', 'e');
  }).catch(function() { toast('Error saving pricing', 'e'); });
};

// ── Render Common + Expert cards above the table ──────────
function renderSpecialCategoryCards() {
  var container = document.getElementById('specialCategoryCards');
  if (!container) return;

  var commonCat  = _serviceCategories.find(function(c) { return c.value === '_common'; });
  var expertCat  = _serviceCategories.find(function(c) { return c.value === '_expert'; });

  function specialCard(cat, label, icon, color, seedFn) {
    if (!cat) {
      return '<div style="background:#18181d;border:2px dashed rgba(255,255,255,0.1);border-radius:14px;padding:20px;text-align:center;">' +
        '<div style="font-size:28px;margin-bottom:8px;">' + icon + '</div>' +
        '<div style="font-size:14px;font-weight:700;color:#f0f0f4;margin-bottom:4px;">' + label + '</div>' +
        '<div style="font-size:12px;color:#606078;margin-bottom:14px;">Not yet in DB — click Seed to initialize</div>' +
        '<button onclick="' + seedFn + '()" style="padding:8px 18px;background:rgba(252,128,25,0.15);border:1px solid rgba(252,128,25,0.4);border-radius:8px;color:#FC8019;font-size:13px;font-weight:600;cursor:pointer;">🌱 Seed ' + label + '</button>' +
        '</div>';
    }
    return '<div style="background:#18181d;border:1.5px solid ' + color + '40;border-radius:14px;padding:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">' +
        '<div>' +
          '<div style="font-size:22px;margin-bottom:4px;">' + icon + '</div>' +
          '<div style="font-size:15px;font-weight:700;color:#f0f0f4;">' + label + '</div>' +
          '<div style="font-size:12px;color:' + color + ';margin-top:2px;">' + (cat.questions||[]).length + ' steps configured</div>' +
        '</div>' +
        '<span style="background:' + color + '20;color:' + color + ';padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">Active</span>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">' +
        (cat.questions||[]).map(function(q) {
          return '<span style="background:#0f0f13;border:1px solid #2a2a38;padding:3px 8px;border-radius:6px;font-size:11px;color:#a0a0b8;">' + esc(q.id||'?') + '</span>';
        }).join('') +
      '</div>' +
      '<button onclick="openEditCategoryModal(\'' + cat._id + '\')" style="width:100%;padding:9px;background:rgba(252,128,25,0.1);border:1px solid rgba(252,128,25,0.3);border-radius:8px;color:#FC8019;font-size:13px;font-weight:600;cursor:pointer;">✏️ Edit ' + label + '</button>' +
      '</div>';
  }

  container.innerHTML =
    specialCard(commonCat, 'Common Steps', '🔗', '#6366f1', 'seedCommonSteps') +
    specialCard(expertCat, 'Expert Onboarding Steps', '⭐', '#f59e0b', 'seedExpertSteps');
}

window.seedCommonSteps = function() {
  if (!confirm('Seed the 8 common questionnaire steps (location, urgency, budget, description, etc.) into the database?')) return;
  api('service-categories/seed-common', 'POST', {}).then(function(d) {
    if (d.success) { toast('✅ ' + d.message + ' — click Force Sync to push to GitHub'); loadServiceCategories(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};

   window.resetExpertSteps = function() {
  if (!confirm('This will DELETE the current expert steps from DB so you can re-seed with the correct order. Continue?')) return;
  api('service-categories/reset-expert', 'POST', {}).then(function(d) {
    if (d.success) { toast('✅ ' + d.message); loadServiceCategories(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};
window.seedExpertSteps = function() {
  if (!confirm('Seed the 8 expert onboarding steps (specialization, experience, city, bio, etc.) into the database?')) return;
  api('service-categories/seed-expert', 'POST', {}).then(function(d) {
    if (d.success) { toast('✅ ' + d.message + ' — click Force Sync to push to GitHub'); loadServiceCategories(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};
   
// ── Seed default categories ──────────────────────────────────
window.seedDefaultCategories = function() {
  if (!confirm('Seed the 6 default service categories (ITR, GST, Accounting, Audit, Photography, Development)?\n\nThis only works if no categories exist yet.')) return;
  api('service-categories/seed', 'POST', {}).then(function(d) {
    if (d.success) { toast('✅ ' + d.message); loadServiceCategories(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error seeding', 'e'); });
};
 
// ── Force sync to GitHub ─────────────────────────────────────
window.syncCategoriesToGitHub = function() {
  if (!confirm('Push current categories to services-config.js on GitHub?')) return;
  api('service-categories/sync', 'POST', {}).then(function(d) {
    if (d.success) toast('✅ ' + d.message);
    else toast(d.message || 'Sync failed', 'e');
  }).catch(function() { toast('Sync error', 'e'); });
};
 
// ── Preview generated config ─────────────────────────────────
window.previewCategoryConfig = function(id) {
  api('service-categories/preview/config').then(function(d) {
    if (!d.success) { toast('Preview failed', 'e'); return; }
    var w = window.open('', '_blank');
    w.document.write('<html><head><title>services-config.js Preview</title>' +
      '<style>body{background:#0f0f13;color:#c0c0d8;font-family:monospace;font-size:13px;padding:20px;white-space:pre-wrap;line-height:1.6}</style>' +
      '</head><body>' + d.content.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</body></html>');
    w.document.close();
  }).catch(function() { toast('Error', 'e'); });
};
 
// ── Delete category ──────────────────────────────────────────
window.deleteCategory = function(id, label) {
  if (!confirm('Delete "' + label + '"?\n\nThis removes it from the DB and pushes updated services-config.js to GitHub. Vercel deploys in ~60s.')) return;
  api('service-categories/' + id, 'DELETE').then(function(d) {
    if (d.success) { toast('Deleted' + (d.githubPushed ? ' + GitHub synced ✅' : '')); loadServiceCategories(); }
    else toast(d.message || 'Failed', 'e');
  }).catch(function() { toast('Error', 'e'); });
};
 
// ── Build question editor HTML ───────────────────────────────
function buildQuestionsEditor(questions, prefix) {
  prefix = prefix || 'qe';
  questions = questions || [];
  var html = '<div id="' + prefix + 'QList" style="display:flex;flex-direction:column;gap:12px;">';
 
  questions.forEach(function(q, idx) {
    html += buildSingleQuestionBlock(q, idx, prefix);
  });
 
  html += '</div>';
  html += '<button onclick="addQuestion(\'' + prefix + '\')" style="margin-top:10px;padding:8px 16px;border:1.5px dashed rgba(252,128,25,0.5);border-radius:8px;background:rgba(252,128,25,0.05);color:#FC8019;font-size:13px;font-weight:600;cursor:pointer;width:100%">+ Add Question</button>';
  return html;
}
 
function buildSingleQuestionBlock(q, idx, prefix) {
  var optionsHtml = '';
  if (q.options && q.options.length) {
    optionsHtml = '<div id="' + prefix + 'opts_' + idx + '" style="margin-top:8px;">';
    q.options.forEach(function(opt, oi) {
      optionsHtml += '<div style="display:flex;gap:6px;margin-bottom:5px;">' +
        '<input type="text" placeholder="Value (e.g. salaried)" value="' + esc(opt.value) + '" style="flex:1;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;" class="' + prefix + 'optVal_' + idx + '">' +
        '<input type="text" placeholder="Label shown to user" value="' + esc(opt.label) + '" style="flex:2;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;" class="' + prefix + 'optLbl_' + idx + '">' +
        '<button onclick="removeOption(\'' + prefix + '\',' + idx + ',' + oi + ')" style="padding:4px 10px;border:1px solid rgba(239,68,68,0.3);border-radius:6px;background:rgba(239,68,68,0.08);color:#ef4444;font-size:12px;cursor:pointer;">✕</button>' +
        '</div>';
    });
    optionsHtml += '</div>';
    optionsHtml += '<button onclick="addOption(\'' + prefix + '\',' + idx + ')" style="padding:5px 12px;border:1px dashed #2a2a38;border-radius:6px;background:transparent;color:#606078;font-size:12px;cursor:pointer;margin-top:4px;">+ Add Option</button>';
  }
 
  var typeOpts = Q_TYPES.map(function(t) {
    return '<option value="' + t.value + '"' + (q.type === t.value ? ' selected' : '') + '>' + t.label + '</option>';
  }).join('');
 
  return '<div class="qblock" id="' + prefix + 'q_' + idx + '" style="background:#18181d;border:1px solid #2a2a38;border-radius:10px;padding:14px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
      '<span style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;">Question ' + (idx+1) + '</span>' +
      '<div style="display:flex;gap:6px;">' +
        '<button onclick="moveQuestion(\'' + prefix + '\',' + idx + ',-1)" style="padding:3px 8px;border:1px solid #2a2a38;border-radius:5px;background:transparent;color:#a0a0b8;font-size:12px;cursor:pointer;">↑</button>' +
        '<button onclick="moveQuestion(\'' + prefix + '\',' + idx + ',1)" style="padding:3px 8px;border:1px solid #2a2a38;border-radius:5px;background:transparent;color:#a0a0b8;font-size:12px;cursor:pointer;">↓</button>' +
        '<button onclick="removeQuestion(\'' + prefix + '\',' + idx + ')" style="padding:3px 8px;border:1px solid rgba(239,68,68,0.3);border-radius:5px;background:rgba(239,68,68,0.08);color:#ef4444;font-size:12px;cursor:pointer;">🗑</button>' +
      '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Question ID (no spaces)</label>' +
        '<input type="text" id="' + prefix + 'qid_' + idx + '" value="' + esc(q.id||'') + '" placeholder="e.g. itrTaxpayerType" style="width:100%;padding:8px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:13px;box-sizing:border-box;"></div>' +
      '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Type</label>' +
        '<select id="' + prefix + 'qtype_' + idx + '" onchange="onQTypeChange(\'' + prefix + '\',' + idx + ')" style="width:100%;padding:8px 10px;border:1px solid #2a2a38;border-radius:6px;background:#18181d;color:#f0f0f4;font-size:13px;">' + typeOpts + '</select></div>' +
    '</div>' +
    '<div style="margin-bottom:8px;"><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Question title (shown to client)</label>' +
      '<input type="text" id="' + prefix + 'qqn_' + idx + '" value="' + esc(q.question||'') + '" placeholder="e.g. What is your taxpayer type?" style="width:100%;padding:8px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:13px;box-sizing:border-box;"></div>' +
    '<div style="margin-bottom:8px;"><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Subtitle / helper text (optional)</label>' +
      '<input type="text" id="' + prefix + 'qsub_' + idx + '" value="' + esc(q.subtitle||'') + '" placeholder="Optional sub-text shown below the title" style="width:100%;padding:8px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:13px;box-sizing:border-box;"></div>' +    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
      '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Alias (optional, e.g. urgency)</label>' +
        '<input type="text" id="' + prefix + 'qalias_' + idx + '" value="' + esc(q.alias||'') + '" placeholder="urgency" style="width:100%;padding:8px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:13px;box-sizing:border-box;"></div>' +
      '<div style="display:flex;align-items:center;gap:8px;padding-top:18px;">' +
        '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#a0a0b8;cursor:pointer;">' +
          '<input type="checkbox" id="' + prefix + 'qreq_' + idx + '"' + (q.required !== false ? ' checked' : '') + ' style="accent-color:#FC8019"> Required' +
        '</label>' +
      '</div>' +
    '</div>' +
    (q.type === 'radio' || q.type === 'checkbox' || q.type === 'select'
      ? '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:6px;">Options (value | label | icon emoji | desc)</label>' + optionsHtml + '</div>'
      : q.type === 'slider'
      ? '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">' +
          '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Min ₹</label><input type="number" id="' + prefix + 'qslMin_' + idx + '" value="' + (q.sliderMin||1000) + '" style="width:100%;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;box-sizing:border-box;"></div>' +
          '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Max ₹</label><input type="number" id="' + prefix + 'qslMax_' + idx + '" value="' + (q.sliderMax||100000) + '" style="width:100%;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;box-sizing:border-box;"></div>' +
          '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Step ₹</label><input type="number" id="' + prefix + 'qslStep_' + idx + '" value="' + (q.sliderStep||500) + '" style="width:100%;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;box-sizing:border-box;"></div>' +
          '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Default ₹</label><input type="number" id="' + prefix + 'qslDef_' + idx + '" value="' + (q.sliderDefault||5000) + '" style="width:100%;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;box-sizing:border-box;"></div>' +
          '<div style="grid-column:1/-1"><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Format string (use {value})</label><input type="text" id="' + prefix + 'qslFmt_' + idx + '" value="' + esc(q.sliderFormat||'₹{value}') + '" placeholder="₹{value}" style="width:100%;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;box-sizing:border-box;"></div>' +
        '</div>'
      : (q.type === 'address' || q.type === 'address-simple')
      ? '<div>' +
          '<div style="font-size:11px;color:#606078;margin-bottom:8px;">Address fields are fixed. The ID determines which variant is used: <code style="color:#FC8019">full_address</code> = full address (building/area/city/state/pincode), <code style="color:#FC8019">client_location</code> = city/state/pincode only.</div>' +
          '<div style="background:rgba(252,128,25,0.05);border:1px solid rgba(252,128,25,0.2);border-radius:6px;padding:10px;font-size:12px;color:#a0a0b8;">Fields auto-generated from ID. Set ID to <strong style="color:#FC8019">full_address</strong> or <strong style="color:#FC8019">client_location</strong>.</div>' +
        '</div>'
      : q.type === 'pincode'
      ? '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Placeholder text</label><input type="text" id="' + prefix + 'qph_' + idx + '" value="' + esc(q.placeholder||'Enter 6-digit pincode') + '" style="width:100%;padding:8px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:13px;box-sizing:border-box;"></div>'
      : '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Placeholder text</label><input type="text" id="' + prefix + 'qph_' + idx + '" value="' + esc(q.placeholder||'') + '" style="width:100%;padding:8px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:13px;box-sizing:border-box;"></div>'
    ) +
 (q.type === 'textarea'
      ? '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px;">' +
          '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Min Length</label><input type="number" id="' + prefix + 'qMinLen_' + idx + '" value="' + (q.minLength||0) + '" style="width:100%;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;box-sizing:border-box;"></div>' +
          '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Max Length</label><input type="number" id="' + prefix + 'qMaxLen_' + idx + '" value="' + (q.maxLength||1000) + '" style="width:100%;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;box-sizing:border-box;"></div>' +
          '<div><label style="font-size:11px;color:#606078;display:block;margin-bottom:3px;">Validation message</label><input type="text" id="' + prefix + 'qVal_' + idx + '" value="' + esc(q.validation||'') + '" placeholder="e.g. Min 20 chars" style="width:100%;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;box-sizing:border-box;"></div>' +
        '</div>'
      : '') +
    (q.type === 'checkbox'
      ? '<div style="margin-top:8px;padding:8px 10px;background:#18181d;border-radius:6px;"><label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#a0a0b8;cursor:pointer;">' +
          '<input type="checkbox" id="' + prefix + 'qusl_' + idx + '"' + (q.useServiceList ? ' checked' : '') + ' style="accent-color:#FC8019"> <span>Use Service List (auto-populate options from WI_SERVICES.list)</span></label></div>'
      : '') +
     
  '</div>';
}
 
// ── Question manipulation functions ──────────────────────────
var _qEditorState = {}; // prefix → array of question objects
 
window.onQTypeChange = function(prefix, idx) {
  var sel = g(prefix + 'qtype_' + idx);
  if (!sel) return;
  var newType = sel.value;
  // Refresh just this question block
  var block = g(prefix + 'q_' + idx);
  if (!block) return;
  var currentQ = collectSingleQuestion(prefix, idx);
  currentQ.type = newType;
  if ((newType === 'radio' || newType === 'checkbox' || newType === 'select') && (!currentQ.options || !currentQ.options.length)) {
    currentQ.options = [{ value: '', label: '' }];
  }
  block.outerHTML = buildSingleQuestionBlock(currentQ, idx, prefix);
};
 
window.addQuestion = function(prefix) {
  var list = g(prefix + 'QList');
  if (!list) return;
  var idx = list.querySelectorAll('.qblock').length;
  var newQ = { id: '', question: '', type: 'radio', required: true, options: [{ value: '', label: '' }] };
  var div = document.createElement('div');
  div.innerHTML = buildSingleQuestionBlock(newQ, idx, prefix);
  list.appendChild(div.firstElementChild);
};
 
window.removeQuestion = function(prefix, idx) {
  var block = g(prefix + 'q_' + idx);
  if (block) block.remove();
  renumberQuestions(prefix);
};
 
window.moveQuestion = function(prefix, idx, dir) {
  var list = g(prefix + 'QList');
  if (!list) return;
  var blocks = Array.from(list.querySelectorAll('.qblock'));
  var target = blocks[idx];
  var swap   = blocks[idx + dir];
  if (!target || !swap) return;
  if (dir === -1) list.insertBefore(target, swap);
  else list.insertBefore(swap, target);
  renumberQuestions(prefix);
};
 
window.addOption = function(prefix, qIdx) {
  var optsDiv = g(prefix + 'opts_' + qIdx);
  if (!optsDiv) return;
  var newRow = document.createElement('div');
  var oi = optsDiv.querySelectorAll('[class*="optVal_"]').length;
  newRow.style.cssText = 'display:flex;gap:6px;margin-bottom:5px;';
  newRow.innerHTML =
    '<input type="text" placeholder="Value" style="flex:1;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;" class="' + prefix + 'optVal_' + qIdx + '">' +
    '<input type="text" placeholder="Label shown to user" style="flex:2;padding:7px 10px;border:1px solid #2a2a38;border-radius:6px;background:#0f0f13;color:#f0f0f4;font-size:12px;" class="' + prefix + 'optLbl_' + qIdx + '">' +
    '<button onclick="this.closest(\'div\').remove()" style="padding:4px 10px;border:1px solid rgba(239,68,68,0.3);border-radius:6px;background:rgba(239,68,68,0.08);color:#ef4444;font-size:12px;cursor:pointer;">✕</button>';
  optsDiv.appendChild(newRow);
};
 
window.removeOption = function(prefix, qIdx, optIdx) {
  var optsDiv = g(prefix + 'opts_' + qIdx);
  if (!optsDiv) return;
  var rows = optsDiv.querySelectorAll('div');
  if (rows[optIdx]) rows[optIdx].remove();
};
 
function renumberQuestions(prefix) {
  var list = g(prefix + 'QList');
  if (!list) return;
  var blocks = list.querySelectorAll('.qblock');
  blocks.forEach(function(block, newIdx) {
    // Update id and label
    block.id = prefix + 'q_' + newIdx;
    var label = block.querySelector('span');
    if (label) label.textContent = 'Question ' + (newIdx + 1);
  });
}
 
// ── Collect questions from the editor ───────────────────────
function collectSingleQuestion(prefix, idx) {
  var qid   = g(prefix + 'qid_'   + idx);
  var qtype = g(prefix + 'qtype_' + idx);
  var qqn   = g(prefix + 'qqn_'   + idx);
  var qalias= g(prefix + 'qalias_'+ idx);
  var qreq  = g(prefix + 'qreq_'  + idx);
  var qph   = g(prefix + 'qph_'   + idx);
  var qsub  = g(prefix + 'qsub_'  + idx); // subtitle (if exists)

  var type = qtype ? qtype.value : 'radio';
  var options = [];

  if (type === 'radio' || type === 'checkbox' || type === 'select') {
    var valEls = document.querySelectorAll('.' + prefix + 'optVal_' + idx);
    var lblEls = document.querySelectorAll('.' + prefix + 'optLbl_' + idx);
    valEls.forEach(function(el, i) {
      var v = el.value.trim();
      var l = lblEls[i] ? lblEls[i].value.trim() : '';
      if (v || l) options.push({ value: v || l, label: l || v });
    });
  }

  var q = {
    id:       qid   ? qid.value.trim()   : '',
    question: qqn   ? qqn.value.trim()   : '',
    type:     type,
    required: qreq  ? qreq.checked       : true,
    alias:    qalias && qalias.value.trim() ? qalias.value.trim() : undefined,
    placeholder: qph && qph.value.trim() ? qph.value.trim() : undefined,
    options:  options
  };

var qsubEl = g(prefix + 'qsub_' + idx);
  if (qsubEl && qsubEl.value.trim()) q.subtitle = qsubEl.value.trim();
   
  // Slider fields
  if (type === 'slider') {
    var slMin  = g(prefix + 'qslMin_'  + idx);
    var slMax  = g(prefix + 'qslMax_'  + idx);
    var slStep = g(prefix + 'qslStep_' + idx);
    var slDef  = g(prefix + 'qslDef_'  + idx);
    var slFmt  = g(prefix + 'qslFmt_'  + idx);
    q.sliderMin    = slMin  ? parseInt(slMin.value)  || 1000   : 1000;
    q.sliderMax    = slMax  ? parseInt(slMax.value)  || 100000 : 100000;
    q.sliderStep   = slStep ? parseInt(slStep.value) || 500    : 500;
    q.sliderDefault= slDef  ? parseInt(slDef.value)  || 5000   : 5000;
    q.sliderFormat = slFmt  ? slFmt.value || '₹{value}'       : '₹{value}';
    delete q.options;
    delete q.placeholder;
  }

  // Textarea fields
  if (type === 'textarea') {
    var minL = g(prefix + 'qMinLen_' + idx);
    var maxL = g(prefix + 'qMaxLen_' + idx);
    var valM = g(prefix + 'qVal_'    + idx);
    if (minL) q.minLength  = parseInt(minL.value) || 0;
    if (maxL) q.maxLength  = parseInt(maxL.value) || 1000;
    if (valM && valM.value.trim()) q.validation = valM.value.trim();
  }

  // useServiceList for checkbox (expert services)
  if (type === 'checkbox') {
    var usl = g(prefix + 'qusl_' + idx);
    if (usl && usl.checked) q.useServiceList = true;
  }

  // Preserve addressFields based on question ID
  if (type === 'address' || type === 'address-simple') {
    var qidVal = qid ? qid.value.trim() : '';
    if (qidVal === 'full_address') {
      q.addressFields = {
        building: { label: 'Flat / Building / House No.', placeholder: 'e.g. 4B, Sunrise Apartments', required: true },
        area:     { label: 'Area / Street / Locality',    placeholder: 'e.g. Koramangala 5th Block',  required: true },
        pincode:  { label: 'Pincode',                     placeholder: 'e.g. 560095',                 required: true, autoFillTrigger: true },
        city:     { label: 'City',                        placeholder: 'e.g. Bengaluru',              required: true, autoFilled: true },
        state:    { label: 'State',                       placeholder: 'Select your state',            required: true, type: 'select', autoFilled: true },
        landmark: { label: 'Landmark (optional)',         placeholder: 'e.g. Near Indiranagar metro',  required: false }
      };
    } else if (qidVal === 'client_location') {
      q.addressFields = {
        pincode: { label: 'Pincode', placeholder: 'e.g. 560095',    required: true, autoFillTrigger: true },
        city:    { label: 'City',    placeholder: 'e.g. Bengaluru', required: true, autoFilled: true },
        state:   { label: 'State',   placeholder: 'Select state',    required: true, type: 'select', autoFilled: true }
      };
    } else if (qidVal === 'expert_location_details') {
      q.addressFields = {
        pincode: { label: 'Pincode', placeholder: 'e.g. 560095',    required: true, autoFillTrigger: true },
        city:    { label: 'City',    placeholder: 'e.g. Bengaluru', required: true, autoFilled: true },
        state:   { label: 'State',   placeholder: 'Select state',    required: true, type: 'select', autoFilled: true }
      };
    }
  }

  return q;
}
 
function collectAllQuestions(prefix) {
  var list = g(prefix + 'QList');
  if (!list) return [];
  var blocks = list.querySelectorAll('.qblock');
  var questions = [];
  blocks.forEach(function(block, idx) {
    var q = collectSingleQuestion(prefix, idx);
    if (q.id && q.question) questions.push(q);
  });
  return questions;
}
 
// ── Create modal ─────────────────────────────────────────────
window.openCreateCategoryModal = function() {
  _editingCategoryId = null;
  showCategoryModal('Create Service Category', null);
};
 
window.openEditCategoryModal = function(id) {
  var cat = _serviceCategories.filter(function(c) { return c._id === id; })[0];
  if (!cat) { toast('Category not found', 'e'); return; }
  _editingCategoryId = id;
  showCategoryModal('Edit — ' + cat.label, cat);
};
 
function showCategoryModal(title, cat) {
  var existing = g('catModal');
  if (existing) existing.remove();
 
  var isEdit = !!cat;
  var prefix = 'qe';
 
  var questionsHTML = buildQuestionsEditor(cat ? cat.questions : [], prefix);
 
  var div = document.createElement('div');
  div.id = 'catModal';
  div.className = 'modal-bg on';
  div.style.cssText = 'overflow-y:auto;';
  div.innerHTML =
    '<div class="modal" style="max-width:720px;max-height:92vh;overflow-y:auto;">' +
      '<div class="modal-h"><h3>⚙️ ' + title + '</h3><button class="modal-x" onclick="closeCategoryModal()">&#215;</button></div>' +
      '<div class="modal-b">' +
 
        '<div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin-bottom:12px">Category Identity</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">' +
          '<div class="mfld"><label>Value / Key (lowercase, no spaces)</label><input type="text" id="catValue" value="' + esc((cat&&cat.value)||'') + '" placeholder="e.g. legal_services"' + (isEdit?' readonly style="opacity:0.5"':'') + '></div>' +
          '<div class="mfld"><label>Display Label</label><input type="text" id="catLabel" value="' + esc((cat&&cat.label)||'') + '" placeholder="e.g. Legal Services"></div>' +
          '<div class="mfld"><label>Icon (emoji)</label><input type="text" id="catIcon" value="' + esc((cat&&cat.icon)||'⚖️') + '" placeholder="⚖️" style="font-size:20px;"></div>' +
          '<div class="mfld"><label>Color (hex)</label><div style="display:flex;gap:8px;align-items:center;">' +
            '<input type="color" id="catColorPicker" value="' + esc((cat&&cat.color)||'#FC8019') + '" style="width:44px;height:38px;border:none;border-radius:6px;cursor:pointer;">' +
            '<input type="text" id="catColor" value="' + esc((cat&&cat.color)||'#FC8019') + '" placeholder="#FC8019" style="flex:1;" oninput="document.getElementById(\'catColorPicker\').value=this.value;">' +
          '</div></div>' +
          '<div class="mfld"><label>Credit Cost (per approach)</label><input type="number" id="catCreditCost" value="' + ((cat&&cat.creditCost)||20) + '" min="1" max="100"></div>' +
          '<div class="mfld"><label>Max Approaches per Request</label><input type="number" id="catMaxApproaches" value="' + ((cat&&cat.maxApproaches)||5) + '" min="1" max="10"></div>' +
          '<div class="mfld" style="grid-column:1/-1"><label>Search Aliases (comma-separated — users typing these will find this service)</label><input type="text" id="catAliases" value="' + esc((cat&&cat.searchAliases)||'') + '" placeholder="e.g. legal, lawyer, advocate, legal advice"></div>' +
          '<div style="padding-top:8px;display:flex;align-items:center;gap:8px;">' +
            '<label style="display:flex;align-items:center;gap:6px;font-size:14px;color:#a0a0b8;cursor:pointer;">' +
              '<input type="checkbox" id="catIsActive"' + ((cat&&cat.isActive!==false)?' checked':'') + ' style="accent-color:#FC8019;"> Active (visible to users)' +
            '</label>' +
          '</div>' +
          '<div class="mfld"><label>Sort Order (lower = shown first)</label><input type="number" id="catSortOrder" value="' + ((cat&&cat.sortOrder)||99) + '" min="1" max="999"></div>' +
        '</div>' +
 
        '<div style="font-size:11px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin:4px 0 14px">Questionnaire Steps</div>' +
        '<div style="font-size:12px;color:#606078;margin-bottom:14px;line-height:1.6;">' +
          'These questions appear in the client\'s "Post a Request" form when they select this service. ' +
          'Use Question IDs without spaces (e.g. <code style="color:#FC8019">legalCaseType</code>). ' +
          'The last question should typically ask about urgency with alias <code style="color:#FC8019">urgency</code>.' +
        '</div>' +
        questionsHTML +
 
      '</div>' +
      '<div class="mfoot" style="justify-content:space-between">' +
        '<button class="btn bgho" onclick="closeCategoryModal()">Cancel</button>' +
        '<button class="btn bpri" id="catSaveBtn" onclick="submitCategory()">' + (isEdit ? '💾 Save Changes' : '🚀 Create & Push to GitHub') + '</button>' +
      '</div>' +
    '</div>';
 
  document.body.appendChild(div);
 
  // Sync color picker to text input
  var picker = g('catColorPicker');
  var colorInput = g('catColor');
  if (picker && colorInput) {
    picker.oninput = function() { colorInput.value = this.value; };
  }
}
 
window.closeCategoryModal = function() {
  var m = g('catModal');
  if (m) m.remove();
  _editingCategoryId = null;
};
 
window.submitCategory = function() {
  var value   = g('catValue')   ? g('catValue').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'_') : '';
  var label   = g('catLabel')   ? g('catLabel').value.trim()   : '';
  var icon    = g('catIcon')    ? g('catIcon').value.trim()    : '🔧';
  var color   = g('catColor')   ? g('catColor').value.trim()   : '#FC8019';
  var creditCost    = parseInt(g('catCreditCost')    ? g('catCreditCost').value    : 20)  || 20;
  var maxApproaches = parseInt(g('catMaxApproaches') ? g('catMaxApproaches').value : 5)   || 5;
  var searchAliases = g('catAliases')    ? g('catAliases').value.trim()    : '';
  var isActive      = g('catIsActive')   ? g('catIsActive').checked         : true;
  var sortOrder     = parseInt(g('catSortOrder') ? g('catSortOrder').value : 99) || 99;
 
  if (!value) { toast('Value/key is required', 'e'); return; }
  if (!label) { toast('Label is required', 'e');     return; }
 
  var questions = collectAllQuestions('qe');
 
  var payload = { value, label, icon, color, creditCost, maxApproaches, searchAliases, isActive, sortOrder, questions };
 
  var btn = g('catSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving & pushing to GitHub...'; }
 
  var method = _editingCategoryId ? 'PUT' : 'POST';
  var path   = _editingCategoryId ? 'service-categories/' + _editingCategoryId : 'service-categories';
 
  api(path, method, payload).then(function(d) {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Create & Push to GitHub'; }
    if (d.success) {
      toast(d.message || 'Saved!');
      closeCategoryModal();
      loadServiceCategories();
    } else {
      toast(d.message || 'Failed', 'e');
    }
  }).catch(function() {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Create & Push to GitHub'; }
    toast('Error', 'e');
  });
};
    
   
})();
