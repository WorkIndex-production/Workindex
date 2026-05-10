  function loadAudit() {
    var action = g('auditAction') ? g('auditAction').value : '';
    var role   = g('auditRole')   ? g('auditRole').value   : '';
    var search = g('auditSearch') ? g('auditSearch').value : '';
    var from   = g('auditFrom')   ? g('auditFrom').value   : '';
    var to     = g('auditTo')     ? g('auditTo').value     : '';
    var qp = 'audit?limit=200' +
      (action && action !== 'all' ? '&action=' + encodeURIComponent(action) : '') +
      (role   && role   !== 'all' ? '&role='   + encodeURIComponent(role)   : '') +
      (search ? '&search=' + encodeURIComponent(search) : '') +
      (from   ? '&from='   + encodeURIComponent(from)   : '') +
      (to     ? '&to='     + encodeURIComponent(to)     : '');
    var tbody = g('auditTbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px"><div class="spin"></div></td></tr>';
    api(qp).then(function(d) {
      var logs  = d.logs  || [];
      var total = d.total || logs.length;
      var tc = g('auditTotal'); if (tc) tc.textContent = total + ' events';
      window._auditLogs = logs;
      _pages['audit'] = 1;
      _pageData['audit'] = logs;
      renderAuditPage();
    }).catch(function() {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#ef4444">Error loading audit log</td></tr>';
    });
  }

  function renderAuditPage() {
    var tbody = g('auditTbody');
    if (!tbody) return;
    var existing = document.getElementById('pag-audit');
    if (existing) existing.remove();
    var page = pagSlice('audit', _pageData['audit'] || []);
    if (!page.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:#606078">No audit events found</td></tr>';
      return;
    }
    var roleColors = { admin:'#a855f7', expert:'#FC8019', client:'#3b82f6' };
    var actionColors = {
      login:'#22c55e', request_created:'#3b82f6', approach_submitted:'#FC8019',
      approach_accepted:'#22c55e', approach_rejected:'#ef4444',
      service_completed:'#a855f7', ticket_followup:'#f59e0b',
      ticket_canned_response:'#06b6d4', expert_profile_viewed:'#3b82f6',
      service_received:'#22c55e', client_hired_expert:'#f59e0b',
      expert_accepted_hire:'#22c55e'
    };
    tbody.innerHTML = page.map(function(l) {
      var rc = roleColors[l.actorRole]  || '#a0a0b8';
      var ac = actionColors[l.action]   || '#a0a0b8';
      var meta = l.targetName || '';
      return '<tr>' +
        '<td style="font-size:12px;font-weight:600;color:#f0f0f4">' + esc(l.actorName||'-') +
          '<br><span class="badge" style="background:' + rc + '20;color:' + rc + ';font-size:10px">' + (l.actorRole||'-') + '</span></td>' +
        '<td><span style="font-size:12px;font-weight:600;color:' + ac + '">' + esc((l.action||'-').replace(/_/g,' ')) + '</span></td>' +
        '<td style="font-size:12px;color:#a0a0b8">' + esc(l.targetType||'-') + '</td>' +
        '<td style="font-size:12px;color:#a0a0b8;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(meta) + '</td>' +
        '<td style="font-size:12px;color:#606078">' + fmtT(l.createdAt) + '</td>' +
        '<td><button class="btn bgho" style="font-size:11px;padding:4px 8px" onclick="showAuditMeta(\'' + l._id + '\')">Details</button></td>' +
      '</tr>';
    }).join('');
    pagHTML('audit', 'auditTbody');
  }
   
  window.showAuditMeta = function(id) {
    var logs = window._auditLogs || [];
    var l = logs.filter(function(x){ return x._id === id; })[0];
    if (!l) return;
    var meta = JSON.stringify(l.metadata || {}, null, 2);
    alert('Action: ' + l.action + '\nActor: ' + l.actorName + ' (' + l.actorRole + ')\nTarget: ' + (l.targetName||'-') + '\nMetadata:\n' + meta);
  };

  window.exportAuditCSV = function() {
    var logs = window._auditLogs || [];
    if (!logs.length) { toast('No data to export', 'i'); return; }
    exportCSV(logs.map(function(l) {
      return { Actor: l.actorName, Role: l.actorRole, Action: l.action, Target: l.targetName||'-', Date: fmtT(l.createdAt) };
    }), 'audit-log-' + new Date().toISOString().slice(0,10));
  };
   
/* ═══ REPORTS ════════════════════════════════════════════════════════════ */
  function loadReports() {
    _pages['reports'] = 1;
    setT('reportsTbl', spin());
    api('reports').then(function(d) {
      var reports = d.reports || [];
      if (!reports.length) {
        setT('reportsTbl', '<tr><td colspan="8" style="text-align:center;padding:30px;color:#606078">No reports yet</td></tr>');
        return;
      }
      renderReportsPage(reports);
    }).catch(function() { setT('reportsTbl', ''); });
  }

  function renderReportsPage(arr) {
    if (arr) pagSlice('reports', arr);
    var page = pagSlice('reports', _pageData['reports'] || []);
    var existing = document.getElementById('pag-reports');
    if (existing) existing.remove();
    setT('reportsTbl', page.map(function(r) {
      var reporterRole = r.reporterRole || 'expert';
      var roleBadge = reporterRole === 'expert'
        ? '<span class="badge bo">Expert</span>'
        : '<span class="badge bbl">Client</span>';
      var targetStatus = r.targetIsRestricted
        ? '<span class="badge brd">Restricted</span>'
        : r.targetIsBanned
        ? '<span class="badge brd">Banned</span>'
        : '<span class="badge bgr">Active</span>';
      var actions = '';
      if (!r.targetIsRestricted && !r.targetIsBanned) {
        actions += '<button class="btn brdn" style="font-size:11px;padding:5px 8px" data-act="restrict" data-uid="' + esc(r.reportedUserId) + '" data-nm="' + esc(r.reportedUserName) + '">Restrict</button> ';
      } else if (r.targetIsRestricted) {
        actions += '<button class="btn bgrn" style="font-size:11px;padding:5px 8px" data-act="unrestrict" data-uid="' + esc(r.reportedUserId) + '" data-nm="' + esc(r.reportedUserName) + '">Unrestrict</button> ';
      }
      if (!r.targetIsBanned) {
        actions += '<button class="btn brdn" style="font-size:11px;padding:5px 8px;background:rgba(239,68,68,.15)" data-act="ban" data-uid="' + esc(r.reportedUserId) + '" data-nm="' + esc(r.reportedUserName) + '">Ban</button>';
      }
      return '<tr>' +
        '<td>' + roleBadge + '<br><span style="font-size:12px;color:#f0f0f4;font-weight:600">' + esc(r.reporterName || '-') + '</span><br><small style="color:#606078">' + esc(r.reporterEmail || '') + '</small></td>' +
        '<td>' + uLnk(r.reportedUserId || '', r.reportedUserName || '-', '#3b82f6') + '<br><small style="color:#606078">' + esc(r.reportedUserEmail || '') + '</small></td>' +
        '<td>' + targetStatus + '</td>' +
        '<td style="font-size:12px;max-width:140px"><strong>' + esc(r.category || r.reason || '-') + '</strong></td>' +
        '<td style="font-size:12px;color:#a0a0b8;max-width:160px;overflow:hidden;text-overflow:ellipsis">' + esc((r.message || r.note || '-').substring(0, 80)) + '</td>' +
        '<td style="font-size:12px;color:#a0a0b8">' + fmtT(r.createdAt) + '</td>' +
        '<td style="font-size:12px">' + (r.requestTitle ? '<span style="color:#f59e0b">' + esc(r.requestTitle.substring(0, 30)) + '</span>' : '-') + '</td>' +
        '<td><div style="display:flex;gap:4px;flex-wrap:wrap">' + actions + '</div></td>' +
        '</tr>';
    }).join(''));
    pagHTML('reports', 'reportsTbl');
    var tbl = document.getElementById('reportsTbl');
    if (tbl) {
      tbl.onclick = function(ev) {
        var btn = ev.target.closest('[data-act]');
        if (!btn) return;
        ev.preventDefault(); ev.stopPropagation();
        var act = btn.dataset.act, uid = btn.dataset.uid, nm = btn.dataset.nm;
        if (act === 'restrict') {
          if (!confirm('Restrict ' + nm + '?')) return;
          doAct(uid, 'warn', 'Reported by multiple users');
        } else if (act === 'unrestrict') {
          if (!confirm('Unrestrict ' + nm + '?')) return;
          doAct(uid, 'unrestrict', '');
        } else if (act === 'ban') {
          if (!confirm('Ban ' + nm + '?')) return;
          doAct(uid, 'ban', '');
        }
      };
    }
  }
   
/* ═══ SUSPENDED REQUESTS ════════════════════════════════════════════════ */
  function loadSuspendedRequests() {
    _pages['suspReq'] = 1;
    setT('suspReqTbl', spin());
    api('suspended-requests').then(function(d) {
      var reqs = d.requests || [];
      if (!reqs.length) {
        setT('suspReqTbl', '<tr><td colspan="6" style="text-align:center;padding:30px;color:#606078">No suspended requests</td></tr>');
        return;
      }
      pagSlice('suspReq', reqs);
      renderSuspendedPage(reqs);
    }).catch(function() { setT('suspReqTbl', ''); });
  }

  function renderSuspendedPage(arr) {
    if (arr) pagSlice('suspReq', arr);
    var page = pagSlice('suspReq', _pageData['suspReq'] || []);
    var existing = document.getElementById('pag-suspReq');
    if (existing) existing.remove();
    setT('suspReqTbl', page.map(function(r) {
      var reportList = (r.reports || []).map(function(rp) {
        return '<div style="font-size:11px;color:#a0a0b8;margin-bottom:2px">• ' + esc(rp.reason||'') + (rp.note ? ' — ' + esc(rp.note) : '') + '</div>';
      }).join('');
      var cname = r.client ? esc(r.client.name||'-') : '-';
      var cid = r.client ? r.client._id : '';
      return '<tr>' +
        '<td style="font-weight:600">' + esc((r.title||'-').substring(0,40)) + '</td>' +
        '<td>' + uLnk(cid, cname, '#3b82f6') + '</td>' +
        '<td style="font-size:12px">' + esc(r.service||'-') + '</td>' +
        '<td style="font-size:12px">' + (r.reports||[]).length + ' reports<br>' + reportList + '</td>' +
        '<td style="font-size:12px;color:#a0a0b8">' + fmt(r.suspendedAt) + '</td>' +
        '<td><div style="display:flex;gap:6px;">' +
          '<button class="btn bgrn" data-sr-id="' + r._id + '" data-sr-act="restore">✓ Restore</button>' +
          '<button class="btn brdn" data-sr-id="' + r._id + '" data-sr-act="delete">🗑 Delete</button>' +
        '</div></td>' +
      '</tr>';
    }).join(''));
    pagHTML('suspReq', 'suspReqTbl');
    var tbl = document.getElementById('suspReqTbl');
    if (tbl) {
      tbl.onclick = function(ev) {
        var btn = ev.target.closest('[data-sr-act]');
        if (!btn) return;
        var act = btn.dataset.srAct, id = btn.dataset.srId;
        var label = act === 'restore' ? 'Restore this request and unrestrict the client?' : 'Permanently delete this request?';
        if (!confirm(label)) return;
        api('suspended-requests/' + id + '/action', 'POST', { action: act }).then(function(d) {
          if (d.success) { toast(d.message); loadSuspendedRequests(); }
          else toast(d.message || 'Failed', 'e');
        }).catch(function() { toast('Error', 'e'); });
      };
    }
  }
   
  /* ═══════════════════════════════════════════════════════════
     SETTINGS TAB
  ═══════════════════════════════════════════════════════════ */
  function loadSettingsTab() {
    // Show API URL
    if (g('settApiUrl')) g('settApiUrl').value = API;
    // Wire download report buttons
    if (g('dlExperts'))  g('dlExperts').onclick  = function() { downloadReport('experts'); };
    if (g('dlClients'))  g('dlClients').onclick  = function() { downloadReport('clients'); };
    if (g('dlApproaches')) g('dlApproaches').onclick = function() { downloadReport('approaches'); };
    if (g('dlPosts'))    g('dlPosts').onclick    = function() { downloadReport('posts'); };
    if (g('dlCredits'))  g('dlCredits').onclick  = function() { downloadReport('credits'); };
    // Show admin info
    if (g('settAdminInfo')) {
      g('settAdminInfo').innerHTML =
        '<strong>' + esc((adm&&adm.adminId)||(adm&&adm.name)||'Admin') + '</strong>' +
        '<div style="color:#606078;margin-top:4px;font-size:12px">Last login: ' + ((adm&&adm.lastLogin) ? new Date(adm.lastLogin).toLocaleString('en-IN') : 'N/A') + '</div>';
    }
    // Load platform stats
    loadSettingsStats();
    // Password change
    if (g('settSavePwBtn')) {
      g('settSavePwBtn').onclick = function() {
        var old = g('settOldPw').value, nw = g('settNewPw').value, nw2 = g('settNewPw2').value;
        if (!old || !nw || !nw2) { toast('Fill all password fields', 'e'); return; }
        if (nw !== nw2) { toast('Passwords do not match', 'e'); return; }
        if (nw.length < 8) { toast('Password must be 8+ characters', 'e'); return; }
        api('settings/change-password', 'POST', { currentPassword: old, newPassword: nw })
          .then(function(d) {
            if (d.success) { toast('Password updated'); g('settOldPw').value=''; g('settNewPw').value=''; g('settNewPw2').value=''; }
            else toast(d.message||'Failed', 'e');
          }).catch(function() { toast('Error', 'e'); });
      };
    }
    if (g('settRefreshStats')) g('settRefreshStats').onclick = loadSettingsStats;
     loadVisitStats();
  }

  function loadSettingsStats() {
    if (!g('settStats')) return;
    g('settStats').innerHTML = '<div class="spin"></div>';
    api('stats' + qs({})).then(function(d) {
      if (!d.success) { g('settStats').innerHTML = '<p style="color:#606078;text-align:center">Could not load stats</p>'; return; }
      var s = d.stats || {};
      var cr = s.credits || {};
      var items = [
        { label: 'Total Experts', val: s.totalExperts||0, color: '#FC8019' },
        { label: 'Total Clients', val: s.totalClients||0, color: '#3b82f6' },
        { label: 'Requests', val: s.totalRequests||0, color: '#f0f0f4' },
        { label: 'Approaches', val: s.totalApproaches||0, color: '#f0f0f4' },
        { label: 'Credits Spent', val: cr.totalSpent||0, color: '#f59e0b' },
        { label: 'Credits Refunded', val: cr.totalRefunded||0, color: '#a855f7' }
      ];
      g('settStats').innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        items.map(function(it) {
          return '<div style="background:#18181d;border-radius:8px;padding:10px"><div style="font-size:10px;color:#606078;text-transform:uppercase;margin-bottom:4px">' + it.label + '</div><div style="font-size:20px;font-weight:800;color:' + it.color + '">' + it.val + '</div></div>';
        }).join('') + '</div>';
    }).catch(function() { g('settStats').innerHTML = '<p style="color:#606078;text-align:center">Could not load stats</p>'; });
  }
   
window.loadVisitStats = function loadVisitStats() {
    var statesEl    = g('visitStates');
    var pagesEl     = g('visitPages');
    var devicesEl   = g('visitDevices');

    fetch(API_BASE + '/visits/stats', {
      headers: { 'Authorization': 'Bearer ' + tok, 'Content-Type': 'application/json' }
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (!d.success || !d.stats) throw new Error('bad response');
      var s = d.stats;

      // ── Core counters ──
      var el;
      el = g('visitTotal');    if (el) el.textContent = (s.total  || 0).toLocaleString('en-IN');
      el = g('visitToday');    if (el) el.textContent = (s.today  || 0).toLocaleString('en-IN');
      el = g('visitWeek');     if (el) el.textContent = (s.week   || 0).toLocaleString('en-IN');
      el = g('visitMonth');    if (el) el.textContent = (s.month  || 0).toLocaleString('en-IN');

      // ── Unique / New / Returning ──
      el = g('visitUnique');    if (el) el.textContent = (s.unique    || 0).toLocaleString('en-IN');
      el = g('visitNew');       if (el) el.textContent = (s.newVisitors || 0).toLocaleString('en-IN');
      el = g('visitReturning'); if (el) el.textContent = (s.returning  || 0).toLocaleString('en-IN');

      // ── Devices ──
      var devices = s.devices || [];
      var mobile = 0, desktop = 0;
      devices.forEach(function(d) {
        if (d.device === 'Mobile') mobile  = d.count;
        else                       desktop = d.count;
      });
      el = g('visitMobile');  if (el) el.textContent = mobile.toLocaleString('en-IN');
      el = g('visitDesktop'); if (el) el.textContent = desktop.toLocaleString('en-IN');

      // ── Top Pages ──
      if (pagesEl) {
        var pages = s.pages || [];
        if (!pages.length) {
          pagesEl.innerHTML = '<div style="font-size:13px;color:#606078;">No page data yet</div>';
        } else {
          var maxP = pages[0].count || 1;
          pagesEl.innerHTML = pages.map(function(p) {
            var pct = Math.round((p.count / maxP) * 100);
            var label = p.page === '/' ? '🏠 Home' : '📄 ' + p.page;
            return '<div style="display:flex;align-items:center;gap:8px;">' +
              '<div style="font-size:12px;color:#a0a0b8;width:120px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + label + '</div>' +
              '<div style="flex:1;height:6px;background:#1e1e2e;border-radius:3px;overflow:hidden;">' +
                '<div style="height:100%;width:' + pct + '%;background:#3b82f6;border-radius:3px;"></div>' +
              '</div>' +
              '<div style="font-size:12px;font-weight:700;color:#f0f0f4;width:28px;text-align:right;">' + p.count + '</div>' +
            '</div>';
          }).join('');
        }
      }

      // ── States ──
      if (statesEl) {
        var states = s.states || [];
        if (!states.length) {
          statesEl.innerHTML = '<div style="font-size:13px;color:#606078;">No visit data yet</div>';
        } else {
          var maxS = states[0].count || 1;
          statesEl.innerHTML = states.map(function(st) {
            var pct = Math.round((st.count / maxS) * 100);
            return '<div style="display:flex;align-items:center;gap:8px;">' +
              '<div style="font-size:12px;color:#a0a0b8;width:130px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (st.state || 'Unknown') + '</div>' +
              '<div style="flex:1;height:6px;background:#1e1e2e;border-radius:3px;overflow:hidden;">' +
                '<div style="height:100%;width:' + pct + '%;background:#FC8019;border-radius:3px;"></div>' +
              '</div>' +
              '<div style="font-size:12px;font-weight:700;color:#f0f0f4;width:28px;text-align:right;">' + st.count + '</div>' +
            '</div>';
          }).join('');
        }
      }

      // ── Extended section — only render if already expanded ──
      var ext = g('visitExtended');
      if (ext && ext.style.display !== 'none') {
        renderVisitExtended(s);
      } else {
        // Store data for when user clicks See More
        window._visitStatsCache = s;
      }
    })
    .catch(function() {
      if (statesEl) statesEl.innerHTML = '<div style="font-size:13px;color:#606078;">Could not load visit data</div>';
    });
  };

  function renderVisitExtended(s) {
    // ── Browsers ──
    var browsersEl = g('visitBrowsers');
    if (browsersEl) {
      var browsers = s.browsers || [];
      var browserColors = { Chrome: '#4285f4', Safari: '#f59e0b', Firefox: '#f97316', Edge: '#06b6d4', Opera: '#ef4444', Other: '#606078' };
      if (!browsers.length) {
        browsersEl.innerHTML = '<div style="font-size:13px;color:#606078;">No data yet</div>';
      } else {
        var maxB = browsers[0].count || 1;
        browsersEl.innerHTML = browsers.map(function(b) {
          var pct = Math.round((b.count / maxB) * 100);
          var color = browserColors[b.browser] || '#a0a0b8';
          return '<div style="display:flex;align-items:center;gap:8px;">' +
            '<div style="font-size:12px;color:#a0a0b8;width:80px;flex-shrink:0;">' + (b.browser || 'Other') + '</div>' +
            '<div style="flex:1;height:6px;background:#1e1e2e;border-radius:3px;overflow:hidden;">' +
              '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;"></div>' +
            '</div>' +
            '<div style="font-size:12px;font-weight:700;color:#f0f0f4;width:28px;text-align:right;">' + b.count + '</div>' +
          '</div>';
        }).join('');
      }
    }

    // ── Traffic Sources ──
    var sourcesEl = g('visitSources');
    if (sourcesEl) {
      var sources = s.sources || [];
      var sourceIcons = { Direct: 'Link', Google: 'Search', Facebook: 'FB', Instagram: 'IG', 'Twitter/X': 'X', LinkedIn: 'IN', WhatsApp: 'WA', YouTube: 'YT', Bing: 'Bing', Other: 'Web' };
      var sourceColors = { Direct: '#a0a0b8', Google: '#4285f4', Facebook: '#1877f2', Instagram: '#e1306c', 'Twitter/X': '#1da1f2', LinkedIn: '#0077b5', WhatsApp: '#25d366', YouTube: '#ff0000', Bing: '#008373', Other: '#606078' };
      if (!sources.length) {
        sourcesEl.innerHTML = '<div style="font-size:13px;color:#606078;">No referrer data yet (add referrer to track call)</div>';
      } else {
        var maxSrc = sources[0].count || 1;
        sourcesEl.innerHTML = sources.map(function(src) {
          var pct = Math.round((src.count / maxSrc) * 100);
          var icon = sourceIcons[src.source] || 'Web';
          var color = sourceColors[src.source] || '#a0a0b8';
          return '<div style="display:flex;align-items:center;gap:8px;">' +
            '<div style="font-size:12px;color:#a0a0b8;width:90px;flex-shrink:0;">' + icon + ' ' + (src.source || 'Direct') + '</div>' +
            '<div style="flex:1;height:6px;background:#1e1e2e;border-radius:3px;overflow:hidden;">' +
              '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;"></div>' +
            '</div>' +
            '<div style="font-size:12px;font-weight:700;color:#f0f0f4;width:28px;text-align:right;">' + src.count + '</div>' +
          '</div>';
        }).join('');
      }
    }

    // ── Countries ──
    var countriesEl = g('visitCountries');
    if (countriesEl) {
      var countries = s.countries || [];
      if (!countries.length) {
        countriesEl.innerHTML = '<div style="font-size:13px;color:#606078;">No country data yet</div>';
      } else {
        var maxC = countries[0].count || 1;
        countriesEl.innerHTML = countries.map(function(c) {
          var pct = Math.round((c.count / maxC) * 100);
          return '<div style="display:flex;align-items:center;gap:8px;">' +
            '<div style="font-size:12px;color:#a0a0b8;width:120px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (c.country || 'Unknown') + '</div>' +
            '<div style="flex:1;height:6px;background:#1e1e2e;border-radius:3px;overflow:hidden;">' +
              '<div style="height:100%;width:' + pct + '%;background:#22c55e;border-radius:3px;"></div>' +
            '</div>' +
            '<div style="font-size:12px;font-weight:700;color:#f0f0f4;width:28px;text-align:right;">' + c.count + '</div>' +
          '</div>';
        }).join('');
      }
    }

    // ── Hourly heatmap ──
    var hourlyEl = g('visitHourly');
    if (hourlyEl) {
      var hourly = s.hourly || [];
      if (!hourly.length) {
        hourlyEl.innerHTML = '<div style="font-size:13px;color:#606078;">No hourly data yet</div>';
      } else {
        var hourMap = {};
        hourly.forEach(function(h) { hourMap[h.hour] = h.count; });
        var maxH = Math.max.apply(null, hourly.map(function(h) { return h.count; })) || 1;
        var allHours = [];
        for (var hr = 0; hr < 24; hr++) {
          allHours.push({ hour: hr, count: hourMap[hr] || 0 });
        }
        // Group into rows of 6
        var rows = '';
        for (var row = 0; row < 4; row++) {
          rows += '<div style="display:flex;gap:4px;margin-bottom:6px;">';
          for (var col = 0; col < 6; col++) {
            var h = allHours[row * 6 + col];
            var intensity = maxH > 0 ? h.count / maxH : 0;
            var r = Math.round(26 + intensity * 226);
            var gv = Math.round(26 + intensity * 102);
            var b2 = Math.round(36);
            var bg = h.count > 0 ? ('rgb(' + r + ',' + gv + ',' + b2 + ')') : '#18181d';
            var label12 = h.hour === 0 ? '12am' : h.hour < 12 ? h.hour + 'am' : h.hour === 12 ? '12pm' : (h.hour - 12) + 'pm';
            rows += '<div style="flex:1;background:' + bg + ';border-radius:6px;padding:6px 4px;text-align:center;cursor:default;" title="' + label12 + ': ' + h.count + ' visits">' +
              '<div style="font-size:10px;color:rgba(255,255,255,0.6);">' + label12 + '</div>' +
              '<div style="font-size:12px;font-weight:700;color:#fff;">' + h.count + '</div>' +
            '</div>';
          }
          rows += '</div>';
        }
        hourlyEl.innerHTML = rows;
      }
    }
  }

  window.toggleVisitDetails = function() {
    var ext = g('visitExtended');
    var btn = g('visitSeeMoreBtn');
    if (!ext) return;
    if (ext.style.display === 'none') {
      ext.style.display = 'block';
      if (btn) btn.innerHTML = '📊 See Less ▴';
      // Render extended data from cache or re-fetch
      if (window._visitStatsCache) {
        renderVisitExtended(window._visitStatsCache);
      } else {
        loadVisitStats();
      }
    } else {
      ext.style.display = 'none';
      if (btn) btn.innerHTML = '📊 See More Analytics ▾';
    }
  };
   
/* ═══ DOWNLOAD REPORTS ══════════════════════════════════════════════════ */
  function downloadReport(type) {
    var btn = g('dl' + type.charAt(0).toUpperCase() + type.slice(1));
    if (btn) { btn.textContent = 'Loading...'; btn.disabled = true; }

    var promise;
    if (type === 'experts') {
      promise = api('users?role=expert&limit=500').then(function(d) {
        return (d.users||[]).map(function(u) {
          return { Name: u.name, Email: u.email, Phone: u.phone||'', Credits: u.credits||0, Rating: u.rating||'-', Status: u.isBanned?'Banned':u.isRestricted?'Restricted':u.isFlagged?'Flagged':'Active', Joined: fmt(u.createdAt) };
        });
      });
    } else if (type === 'clients') {
      promise = api('users?role=client&limit=500').then(function(d) {
        return (d.users||[]).map(function(u) {
          return { Name: u.name, Email: u.email, Phone: u.phone||'', Credits: u.credits||0, Rating: u.rating||'-', Status: u.isBanned?'Banned':u.isRestricted?'Restricted':u.isFlagged?'Flagged':'Active', Joined: fmt(u.createdAt) };
        });
      });
    } else if (type === 'approaches') {
      promise = api('approaches?limit=500').then(function(d) {
        return (d.approaches||[]).map(function(a) {
          return { Expert: a.expert?a.expert.name:'-', Client: a.client?a.client.name:'-', Request: a.request?a.request.title:'-', Quote: a.quote||'-', Message: (a.message||'').substring(0,100), Credits: a.creditsSpent||0, Status: a.status||'-', Date: fmt(a.createdAt) };
        });
      });
    } else if (type === 'posts') {
      promise = api('requests?limit=500').then(function(d) {
        return (d.requests||[]).map(function(p) {
          return { Title: p.title||'-', Client: p.client?p.client.name:'-', Service: p.service||'-', Budget: p.budget||'-', Status: p.status||'-', Credits: p.credits||0, Date: fmt(p.createdAt) };
        });
      });
    } else if (type === 'credits') {
      promise = api('credits?limit=500').then(function(d) {
        return (d.transactions||[]).map(function(tx) {
          return { Expert: tx.user?tx.user.name:'-', Email: tx.user?tx.user.email:'-', Type: tx.type||'-', Amount: tx.amount||0, Balance: tx.balanceAfter||0, Description: (tx.description||'-').substring(0,80), Date: fmtT(tx.createdAt) };
        });
      });
    }

    if (!promise) return;
    promise.then(function(rows) {
      if (btn) { btn.textContent = btn.dataset.label || 'Download'; btn.disabled = false; }
      if (!rows.length) { toast('No data to export', 'i'); return; }
      // Show format picker
      var fmt2 = confirm('Click OK for Excel (CSV), Cancel for printable PDF view');
      if (fmt2) {
        exportCSV(rows, type + '-report-' + new Date().toISOString().slice(0,10));
        toast('CSV downloaded ✓');
      } else {
        exportPrintPDF(rows, type);
      }
    }).catch(function() {
      if (btn) { btn.textContent = btn.dataset.label || 'Download'; btn.disabled = false; }
      toast('Error loading data', 'e');
    });
  }

  function exportPrintPDF(rows, title) {
    if (!rows.length) return;
    var keys = Object.keys(rows[0]);
    var w = window.open('', '_blank');
    var tableRows = rows.map(function(r) {
      return '<tr>' + keys.map(function(k) { return '<td>' + String(r[k]||'').replace(/</g,'&lt;') + '</td>'; }).join('') + '</tr>';
    }).join('');
    w.document.write(
      '<html><head><title>WorkIndex ' + title + ' Report</title>' +
      '<style>body{font-family:system-ui;padding:20px;font-size:12px}' +
      'h2{color:#FC8019;margin-bottom:4px}' +
      'table{width:100%;border-collapse:collapse;margin-top:14px}' +
      'th{background:#FC8019;color:#fff;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase}' +
      'td{padding:7px 10px;border-bottom:1px solid #eee;vertical-align:top}' +
      'tr:nth-child(even){background:#f9f9f9}' +
      '@media print{body{padding:8px}}' +
      '</style></head><body>' +
      '<h2>WorkIndex — ' + title.charAt(0).toUpperCase()+title.slice(1) + ' Report</h2>' +
      '<div style="font-size:11px;color:#888;margin-bottom:10px">Generated: ' + new Date().toLocaleString('en-IN') + ' · Total: ' + rows.length + ' records</div>' +
      '<table><thead><tr>' + keys.map(function(k){return '<th>'+k+'</th>';}).join('') + '</tr></thead><tbody>' + tableRows + '</tbody></table>' +
      '</body></html>'
    );
    w.document.close();
    setTimeout(function() { w.print(); }, 600);
  }
   
  function dangerAction(action) {
    var msgs = { clearLogs: 'Clear all communication logs older than 90 days?', clearFailedPayments: 'Clear all failed payment logs?' };
    if (!confirm(msgs[action]||'Are you sure?')) return;
    api('settings/danger/' + action, 'POST', {}).then(function(d) {
      toast(d.message||'Done');
    }).catch(function() { toast('Error', 'e'); });
  }
window.deleteCategoryData = function() {
    var sel = g('deleteCategorySelect');
    if (!sel || !sel.value) { toast('Select a category first', 'e'); return; }
    var category = sel.value;
    if (!confirm('Delete ALL ' + category + '? This cannot be undone.')) return;
    var confirmText = prompt('Type DELETE to confirm:');
    if (confirmText !== 'DELETE') { toast('Cancelled', 'i'); return; }
    api('danger/clear-category', 'POST', { category: category }).then(function(d) {
      if (d.success) { toast(d.message, 's'); sel.value = ''; }
      else toast(d.message || 'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  };
   
  /* ═══════════════════════════════════════════════════════════
     INVOICE — TAX RATE TOGGLE
  ═══════════════════════════════════════════════════════════ */
  function initInvoiceTaxToggle() {
    var sel = g('invTaxRate');
    if (!sel) return;
    sel.addEventListener('change', function() {
      var box = g('invCustomTaxBox');
      if (box) box.style.display = this.value === 'custom' ? 'block' : 'none';
      previewInvoice();
    });
    var customInput = g('invCustomTax');
    if (customInput) customInput.addEventListener('input', previewInvoice);
  }

  /* ═══════════════════════════════════════════════════════════
     INDIA SVG CHOROPLETH HEATMAP
     Proper state paths — replaces the tile grid approach
  ═══════════════════════════════════════════════════════════ */
  // Full India SVG viewBox path data for all states
  // Using simplified but geographically accurate paths
  var INDIA_STATES_SVG = {
    viewBox: "0 0 950 1050",
    states: [
      { id: "Jammu & Kashmir", name: "Jammu & Kashmir", abbr: "J&K", d: "M 285 30 L 320 25 L 365 45 L 385 80 L 360 110 L 330 125 L 295 115 L 270 85 Z" },
      { id: "Himachal Pradesh", name: "Himachal Pradesh", abbr: "HP", d: "M 320 115 L 370 108 L 390 135 L 370 165 L 335 160 L 318 140 Z" },
      { id: "Punjab", name: "Punjab", abbr: "PB", d: "M 265 120 L 320 115 L 318 140 L 300 158 L 270 155 L 255 138 Z" },
      { id: "Haryana", name: "Haryana", abbr: "HR", d: "M 285 158 L 330 155 L 340 185 L 318 205 L 288 198 L 278 178 Z" },
      { id: "Delhi", name: "Delhi", abbr: "DL", d: "M 318 185 L 335 182 L 338 198 L 322 202 Z" },
      { id: "Rajasthan", name: "Rajasthan", abbr: "RJ", d: "M 190 170 L 280 158 L 290 200 L 280 270 L 240 320 L 188 310 L 158 268 L 162 210 Z" },
      { id: "Uttar Pradesh", name: "Uttar Pradesh", abbr: "UP", d: "M 335 180 L 445 168 L 490 200 L 480 265 L 430 295 L 360 285 L 320 255 L 308 215 Z" },
      { id: "Uttarakhand", name: "Uttarakhand", abbr: "UK", d: "M 370 148 L 420 142 L 450 168 L 415 185 L 380 178 Z" },
      { id: "Bihar", name: "Bihar", abbr: "BR", d: "M 490 200 L 560 195 L 580 235 L 555 265 L 500 260 L 482 235 Z" },
      { id: "Jharkhand", name: "Jharkhand", abbr: "JH", d: "M 500 265 L 562 268 L 575 310 L 545 340 L 500 335 L 482 300 Z" },
      { id: "West Bengal", name: "West Bengal", abbr: "WB", d: "M 580 220 L 620 215 L 645 260 L 630 320 L 595 350 L 565 310 L 580 270 Z" },
      { id: "Sikkim", name: "Sikkim", abbr: "SK", d: "M 620 195 L 640 190 L 645 210 L 625 215 Z" },
      { id: "Assam", name: "Assam", abbr: "AS", d: "M 650 215 L 720 210 L 740 240 L 710 265 L 660 258 L 645 238 Z" },
      { id: "Arunachal Pradesh", name: "Arunachal Pradesh", abbr: "AR", d: "M 660 165 L 760 158 L 785 195 L 740 210 L 655 210 Z" },
      { id: "Meghalaya", name: "Meghalaya", abbr: "ML", d: "M 655 268 L 710 265 L 720 292 L 685 300 L 655 288 Z" },
      { id: "Nagaland", name: "Nagaland", abbr: "NL", d: "M 740 240 L 775 235 L 780 262 L 748 268 L 740 255 Z" },
      { id: "Manipur", name: "Manipur", abbr: "MN", d: "M 748 268 L 780 265 L 785 295 L 758 305 L 742 290 Z" },
      { id: "Tripura", name: "Tripura", abbr: "TR", d: "M 690 305 L 715 300 L 718 328 L 695 332 Z" },
      { id: "Mizoram", name: "Mizoram", abbr: "MZ", d: "M 718 310 L 748 308 L 752 340 L 722 345 Z" },
      { id: "Madhya Pradesh", name: "Madhya Pradesh", abbr: "MP", d: "M 230 310 L 370 290 L 440 310 L 450 370 L 410 420 L 320 435 L 235 420 L 200 370 L 208 330 Z" },
      { id: "Gujarat", name: "Gujarat", abbr: "GJ", d: "M 125 295 L 192 312 L 205 370 L 195 420 L 160 455 L 110 465 L 80 440 L 70 390 L 90 340 Z" },
      { id: "Maharashtra", name: "Maharashtra", abbr: "MH", d: "M 195 425 L 315 438 L 370 455 L 380 520 L 340 570 L 270 585 L 200 565 L 162 510 L 158 458 Z" },
      { id: "Chhattisgarh", name: "Chhattisgarh", abbr: "CG", d: "M 450 375 L 535 368 L 555 430 L 520 480 L 460 475 L 435 430 Z" },
      { id: "Odisha", name: "Odisha", abbr: "OD", d: "M 540 345 L 600 340 L 625 390 L 610 445 L 565 465 L 525 445 L 520 395 Z" },
      { id: "Telangana", name: "Telangana", abbr: "TS", d: "M 355 575 L 440 565 L 475 600 L 460 650 L 400 658 L 355 630 L 342 600 Z" },
      { id: "Andhra Pradesh", name: "Andhra Pradesh", abbr: "AP", d: "M 420 580 L 570 555 L 600 600 L 580 660 L 520 695 L 450 685 L 408 648 L 424 608 Z" },
      { id: "Karnataka", name: "Karnataka", abbr: "KA", d: "M 200 595 L 345 585 L 365 640 L 345 700 L 295 730 L 230 720 L 185 680 L 175 635 Z" },
      { id: "Goa", name: "Goa", abbr: "GA", d: "M 162 590 L 198 585 L 202 612 L 168 618 Z" },
      { id: "Tamil Nadu", name: "Tamil Nadu", abbr: "TN", d: "M 295 735 L 375 710 L 430 750 L 420 830 L 375 880 L 320 870 L 275 810 L 268 760 Z" },
      { id: "Kerala", name: "Kerala", abbr: "KL", d: "M 222 730 L 290 738 L 285 830 L 258 880 L 215 850 L 200 790 L 208 755 Z" },
      { id: "Lakshadweep", name: "Lakshadweep", abbr: "LD", d: "M 120 780 L 130 780 L 132 792 L 120 792 Z" },
      { id: "Andaman & Nicobar", name: "Andaman & Nicobar", abbr: "AN", d: "M 790 580 L 800 575 L 808 615 L 796 618 Z" }
    ]
  };

  function renderIndiaSvgMap(byState, total) {
    var stateData = byState || {};
    var maxCount = 0;
    Object.keys(stateData).forEach(function(s) {
      if (stateData[s] && stateData[s].count > maxCount) maxCount = stateData[s].count;
    });

    var svgPaths = INDIA_STATES_SVG.states.map(function(st) {
      // Try to match by exact name, then by abbr
      var data = stateData[st.name] || stateData[st.id] || stateData[st.abbr] || null;
      // Also try city-level match (experts stored by city)
      if (!data) {
        var firstWord = st.name.toLowerCase().split(' ')[0];
        Object.keys(stateData).forEach(function(k) {
          if (k.toLowerCase().indexOf(firstWord) >= 0) data = stateData[k];
        });
      }
      // Also try matching city data directly to state (experts store by city name)
      if (!data) {
        Object.keys(stateData).forEach(function(k) {
          var kl = k.toLowerCase();
          var nl = st.name.toLowerCase();
          if (kl === nl || nl.indexOf(kl) >= 0) data = stateData[k];
        });
      }
      var count = data ? data.count : 0;
      var intensity = maxCount > 0 ? count / maxCount : 0;
      // Color: dark (#1a1a24) to orange (#FC8019)
      var r = Math.round(26 + intensity * (252-26));
      var g2 = Math.round(26 + intensity * (128-26));
      var b = Math.round(36 + intensity * (25-36));
      var fill = count > 0 ? ('rgb('+r+','+g2+','+b+')') : '#1a1a24';
      var opacity = count > 0 ? (0.4 + intensity * 0.6) : 0.5;
      return '<path class="hm-state" id="hms-' + st.abbr + '" d="' + st.d + '" fill="' + fill + '" opacity="' + opacity + '" data-state="' + esc(st.name) + '" data-count="' + count + '" data-abbr="' + st.abbr + '"><title>' + esc(st.name) + ': ' + count + ' users</title></path>' +
        (count > 0 ? '<text x="' + svgCentroid(st.d).x + '" y="' + (svgCentroid(st.d).y+4) + '" text-anchor="middle" fill="white" font-size="7" font-weight="700" pointer-events="none" style="text-shadow:0 1px 2px rgba(0,0,0,.8)">' + st.abbr + '</text><text x="' + svgCentroid(st.d).x + '" y="' + (svgCentroid(st.d).y+14) + '" text-anchor="middle" fill="rgba(255,255,255,.85)" font-size="6" pointer-events="none">' + count + '</text>' : '<text x="' + svgCentroid(st.d).x + '" y="' + (svgCentroid(st.d).y+4) + '" text-anchor="middle" fill="rgba(150,150,180,.4)" font-size="6" pointer-events="none">' + st.abbr + '</text>');
    }).join('');

    return '<svg id="indiaSvgMap" viewBox="' + INDIA_STATES_SVG.viewBox + '" style="width:100%;max-height:500px;cursor:pointer" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="950" height="1050" fill="#0d0d14" rx="10"/>' +
      svgPaths +
      '</svg>' +
      '<div id="hmTip" style="position:fixed;background:#111115;border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:8px 12px;font-size:12px;pointer-events:none;display:none;z-index:9999;min-width:130px;box-shadow:0 4px 20px rgba(0,0,0,.5)"></div>';
  }

  function svgCentroid(d) {
    // Rough centroid from path data
    var nums = d.match(/[\d.]+/g)||[];
    var xs = [], ys = [];
    for (var i=0; i<nums.length-1; i+=2) { xs.push(parseFloat(nums[i])); ys.push(parseFloat(nums[i+1])); }
    var cx = xs.reduce(function(a,b){return a+b;},0)/xs.length;
    var cy = ys.reduce(function(a,b){return a+b;},0)/ys.length;
    return { x: Math.round(cx), y: Math.round(cy) };
  }

  function attachSvgMapEvents() {
    var svg = document.getElementById('indiaSvgMap');
    if (!svg) return;
    var tip = document.getElementById('hmTip');
    svg.querySelectorAll('.hm-state').forEach(function(path) {
      path.addEventListener('mouseenter', function(ev) {
        var cnt = parseInt(this.dataset.count)||0;
        if (tip) {
          tip.innerHTML = '<strong>' + esc(this.dataset.state) + '</strong><br>' + cnt + ' users';
          tip.style.display = 'block';
        }
      });
      path.addEventListener('mousemove', function(ev) {
        if (tip) { tip.style.left = (ev.clientX+12)+'px'; tip.style.top = (ev.clientY-10)+'px'; }
      });
      path.addEventListener('mouseleave', function() {
        if (tip) tip.style.display = 'none';
      });
      path.addEventListener('click', function() {
        if (tip) tip.style.display = 'none';
        drillHeatmapState(this.dataset.state);
      });
    });
  }

  function drillHeatmapState(stateName) {
    if (!_hmData || !_hmData.byState) return;
    var data = _hmData.byState[stateName];
    if (!data || !data.cities) {
      toast('No city data for ' + stateName);
      return;
    }
    _hmState = stateName;
    g('hmCrumbs').innerHTML = '<span class="hm-crumb" data-level="country" style="cursor:pointer">India</span><span class="hm-crumb"> › ' + esc(stateName) + '</span>';
    // Build city breakdown
    var cities = data.cities;
    var sorted = Object.keys(cities).sort(function(a,b){return cities[b]-cities[a];});
    var maxC = cities[sorted[0]]||1;
    var cityHtml = sorted.map(function(city) {
      var cnt = cities[city];
      var w = Math.max(4, Math.round((cnt/maxC)*200));
      return '<div class="hm-bar-row"><div class="hm-bar-label">' + esc(city) + '</div>' +
        '<div class="hm-bar" style="width:'+w+'px;background:linear-gradient(90deg,#FC8019,#e06b0a)"></div>' +
        '<div class="hm-bar-val">' + cnt + '</div></div>';
    }).join('');
    g('hmMapArea').innerHTML = '<div style="padding:10px">' +
      '<div style="font-size:13px;font-weight:700;margin-bottom:12px;color:#FC8019">Cities in ' + esc(stateName) + '</div>' +
      (sorted.length ? cityHtml : '<p style="color:#606078">No city data available</p>') +
      '</div>';
    g('hmBarTitle').textContent = 'Cities in ' + stateName;
    // Update bar chart with city data
    renderHmBars({}, cities);
  }

   

// ═══════════════════════════════════════════════════════════
// ADD TO: admin-app.js
// 1. Add 'emailNotifications' to sectionLoaders()
// 2. Add to PT and PS objects
// 3. Add the full loadEmailNotifications function below
// ═══════════════════════════════════════════════════════════
/* ═══ REVENUE DASHBOARD ══════════════════════════════════ */
  var _revChart = null, _revSvcChart = null;

  window.loadRevenue = function loadRevenue() {
    var period = (g('revPeriod') || {}).value || 'month';
   g('revSummary').innerHTML = '<div style="color:#a0a0b8;font-size:13px;padding:8px;">Loading...</div>';

    var svcPeriod = (g('revSvcPeriod') || {}).value || 'all';
    api('revenue?period=' + period + '&svcPeriod=' + svcPeriod).then(function(d) {
       if (!d.success) return;
      var s = d.summary || {};

      // ── Summary cards ──
      var cards = [
        { label: 'Amount Received',    value: '₹' + (s.amountReceived||0).toLocaleString('en-IN'), color: '#22c55e' },
        { label: 'Credits Purchased',  value: (s.purchased||0).toLocaleString(),                   color: '#3b82f6' },
        { label: 'Credits Spent',      value: (s.spent||0).toLocaleString(),                       color: '#FC8019' },
        { label: 'Credits Refunded',   value: (s.refunded||0).toLocaleString(),                    color: '#a855f7' },
        { label: 'Bonus Credits',      value: (s.bonus||0).toLocaleString(),                       color: '#f59e0b' },
        { label: 'Total Purchases',    value: (s.txCount||0).toLocaleString(),                     color: '#06b6d4' }
      ];
      g('revSummary').innerHTML = cards.map(function(c) {
        return '<div style="background:#18181d;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px 18px;">' +
          '<div style="font-size:12px;color:#a0a0b8;margin-bottom:6px;">' + c.label + '</div>' +
          '<div style="font-size:22px;font-weight:700;color:' + c.color + '">' + c.value + '</div>' +
          '</div>';
      }).join('');

      // ── Time series chart ──
      var bp = d.byPeriod || [];
      var labels  = bp.map(function(r) { return r.label; });
      var purch   = bp.map(function(r) { return r.purchased  || 0; });
      var spent   = bp.map(function(r) { return r.spent      || 0; });
      var refund  = bp.map(function(r) { return r.refunded   || 0; });
      var revenue = bp.map(function(r) { return r.amountReceived || 0; });

      var ctx = g('revChart');
      if (!ctx) return;
      if (_revChart) { _revChart.destroy(); _revChart = null; }
      var chartType = (g('revChartType') || {}).value || 'bar';

      _revChart = new Chart(ctx, {
        type: chartType,
        data: {
          labels: labels,
          datasets: [
            { label: '₹ Revenue',   data: revenue, backgroundColor: 'rgba(34,197,94,0.7)',  borderColor: '#22c55e', borderWidth: 2, tension: 0.3, fill: chartType==='line' },
            { label: 'Purchased',   data: purch,   backgroundColor: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', borderWidth: 2, tension: 0.3 },
            { label: 'Spent',       data: spent,   backgroundColor: 'rgba(252,128,25,0.7)', borderColor: '#FC8019', borderWidth: 2, tension: 0.3 },
            { label: 'Refunded',    data: refund,  backgroundColor: 'rgba(168,85,247,0.7)', borderColor: '#a855f7', borderWidth: 2, tension: 0.3 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#a0a0b8', font: { size: 12 } } } },
          scales: {
            x: { ticks: { color: '#a0a0b8' }, grid: { color: 'rgba(255,255,255,.05)' } },
            y: { ticks: { color: '#a0a0b8' }, grid: { color: 'rgba(255,255,255,.05)' } }
          }
        }
      });

      // ── Service breakdown ──
      var bs = d.byService || [];
      var svcLabels = bs.map(function(r) { return (r._id||'Other').toUpperCase(); });
      var svcData   = bs.map(function(r) { return r.totalCredits || 0; });
      var svcColors = ['#FC8019','#3b82f6','#22c55e','#f59e0b','#a855f7','#06b6d4','#ef4444','#84cc16'];

      var svcCtx = g('revSvcChart');
      if (svcCtx) {
        if (_revSvcChart) { _revSvcChart.destroy(); _revSvcChart = null; }
        var svcType = (g('revSvcChartType') || {}).value || 'bar';
        _revSvcChart = new Chart(svcCtx, {
          type: svcType,
          data: {
            labels: svcLabels,
            datasets: [{ label: 'Credits Spent', data: svcData, backgroundColor: svcColors, borderColor: svcColors, borderWidth: 1, tension: 0.3 }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: svcType==='pie', labels: { color: '#a0a0b8' } } },
            scales: svcType === 'pie' ? {} : {
              x: { ticks: { color: '#a0a0b8' }, grid: { color: 'rgba(255,255,255,.05)' } },
              y: { ticks: { color: '#a0a0b8' }, grid: { color: 'rgba(255,255,255,.05)' } }
            }
          }
        });
      }

   // ── Service table ──
      var totalReqs = bs.reduce(function(a,r){return a+r.count;},0)||1;
      g('revSvcTable').innerHTML = '<table style="width:100%;font-size:13px;border-collapse:collapse;">' +
        '<thead><tr>' +
          '<th style="text-align:left;padding:8px 6px;color:#a0a0b8;border-bottom:1px solid rgba(255,255,255,.07);">Service</th>' +
          '<th style="text-align:right;padding:8px 6px;color:#a0a0b8;border-bottom:1px solid rgba(255,255,255,.07);">Experts</th>' +
          '<th style="text-align:right;padding:8px 6px;color:#a0a0b8;border-bottom:1px solid rgba(255,255,255,.07);">Requests</th>' +
          '<th style="text-align:right;padding:8px 6px;color:#a0a0b8;border-bottom:1px solid rgba(255,255,255,.07);">Share</th>' +
        '</tr></thead><tbody>' +
        bs.map(function(r,i) {
          var pct = r.share !== undefined ? r.share : Math.round((r.count/totalReqs)*100);
          return '<tr>' +
            '<td style="padding:8px 6px;color:#f0f0f4;font-weight:600;">' +
              '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + svcColors[i%svcColors.length] + ';margin-right:6px;"></span>' +
              (r._id||'Other').toUpperCase() +
            '</td>' +
            '<td style="padding:8px 6px;text-align:right;color:#22c55e;font-weight:600;">' + (r.expertCount||0) + '</td>' +
            '<td style="padding:8px 6px;text-align:right;color:#a0a0b8;">' + (r.count||0) + '</td>' +
            '<td style="padding:8px 6px;text-align:right;">' +
              '<div style="display:flex;align-items:center;justify-content:flex-end;gap:6px;">' +
                '<div style="width:60px;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;">' +
                  '<div style="width:' + pct + '%;height:100%;background:' + svcColors[i%svcColors.length] + ';border-radius:3px;"></div>' +
                '</div>' +
                '<span style="color:#f0f0f4;font-weight:600;min-width:32px;">' + pct + '%</span>' +
              '</div>' +
            '</td>' +
          '</tr>';
        }).join('') +
        '</tbody></table>';

    }).catch(function(e) { console.error('Revenue err:', e); });
  }

  document.addEventListener('change', function(e) {
    if (e.target.id === 'revPeriod' || e.target.id === 'revChartType' || e.target.id === 'revSvcChartType' || e.target.id === 'revSvcPeriod') {
      loadRevenue();
    }
  });
   
/* ═══ EMAIL NOTIFICATIONS TAB ════════════════════════════ */
var _emailSettings = {};

function loadEmailNotifications() {
  var sec = g('sec-emailNotifications');
  if (!sec) return;
