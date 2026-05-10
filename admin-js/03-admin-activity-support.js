  function loadChats() {
    _pages['chats'] = 1;
    setT('chTbl', spin());
    api('chats' + qs({})).then(function(d) {
      var chats = d.chats || [];
      pagSlice('chats', chats);
      renderChatsPage(chats);
    }).catch(function() { setT('chTbl', ''); });
  }

  function renderChatsPage(arr) {
    if (arr) pagSlice('chats', arr);
    var page = pagSlice('chats', _pageData['chats'] || []);
    var existing = document.getElementById('pag-chats');
    if (existing) existing.remove();
    setT('chTbl', page.map(function(c) {
        var en = c.expert ? esc(c.expert.name||'-') : '-', eid = c.expert ? c.expert._id : '';
        var cn = c.client ? esc(c.client.name||'-') : '-', cid2 = c.client ? c.client._id : '';
        var rt = c.request ? esc(c.request.title||'-') : (c.requestTitle ? esc(c.requestTitle) : '-');
        var lm = esc(((c.lastMessage||'No messages yet').substring(0, 50)));
        return '<tr>' +
          '<td><span data-uid="' + eid + '" style="cursor:pointer;color:#FC8019;font-weight:600">' + en + '</span></td>' +
          '<td><span data-uid="' + cid2 + '" style="cursor:pointer;color:#3b82f6;font-weight:600">' + cn + '</span></td>' +
          '<td style="font-size:12px">' + rt + '</td>' +
          '<td style="font-size:12px;color:#a0a0b8;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + lm + '</td>' +
          '<td style="font-size:12px;color:#a0a0b8">' + fmt(c.lastMessageAt||c.updatedAt||c.createdAt) + '</td>' +
          '<td><button class="btn bgho chat-view-btn" data-chat-id="' + c._id + '" data-en="' + en + '" data-cn="' + cn + '" data-rt="' + rt + '">View Chat</button></td>' +
          '</tr>';
      }).join(''));
    pagHTML('chats', 'chTbl');
    var tbl = document.getElementById('chTbl');
    if (tbl) {
      tbl.onclick = function(ev) {
        var btn = ev.target.closest('.chat-view-btn');
        if (!btn) return;
        viewChat(btn.dataset.chatId, btn.dataset.en, btn.dataset.cn, btn.dataset.rt);
      };
    }
  }

  function viewChat(cid, en, cn, rt) {
    g('ov2').classList.add('on'); g('dr2').classList.add('on');
    g('chDrT').textContent = en + ' ↔ ' + cn;
    g('chDrMeta').innerHTML = '<span class="badge bgy" style="margin-bottom:10px">' + esc(rt) + '</span>';
    g('chDrMsgs').innerHTML = '<div style="text-align:center;padding:20px"><div class="spin"></div></div>';
    // Render messages with smart name resolution using chat participants
    function renderChatMsgs(msgs, chatInfo) {
      if (!msgs.length) {
        g('chDrMsgs').innerHTML = '<div class="empty"><h3>No messages yet</h3><p style="font-size:13px;color:#606078">Conversation started but no messages sent yet</p></div>';
        return;
      }
      // Build lookup: expertId → expertName, clientId → clientName from backend response
      var expertId = chatInfo && chatInfo.expertId;
      var clientId = chatInfo && chatInfo.clientId;
      var expertName = (chatInfo && chatInfo.expert && chatInfo.expert.name) || en;
      var clientName = (chatInfo && chatInfo.client && chatInfo.client.name) || cn;

      g('chDrMsgs').innerHTML = msgs.map(function(m) {
        var senderObj = (m.sender && typeof m.sender === 'object') ? m.sender : null;
        // Try every possible field for sender name
        var sName = (senderObj && senderObj.name)
          || m.senderName || m.senderUsername || '';
        var sRole = (senderObj && senderObj.role)
          || m.senderRole || m.role || '';
        var sid   = senderObj ? String(senderObj._id || '') : String(m.sender || '');

        // If name still blank, resolve from chat participants by ID or role
        if (!sName) {
          if (expertId && sid && sid === String(expertId)) sName = expertName;
          else if (clientId && sid && sid === String(clientId)) sName = clientName;
          else if (sRole === 'expert') sName = expertName;
          else if (sRole === 'client') sName = clientName;
          else sName = en || cn || 'User';   // last resort
        }

        var isAdmin  = m.isAdminMessage || sRole === 'admin';
        var isExpert = !isAdmin && (sRole === 'expert' || (!sRole && sName === expertName));
        var cls = isAdmin ? 'admin' : (isExpert ? 'out' : 'in');
        var label = isAdmin ? '🔑 Admin' : esc(sName);
        var msgText = m.text || m.message || m.content || m.body || '';
        return '<div class="cmsg ' + cls + '">' +
          '<div class="cmeta">' + label +
            (sRole && !isAdmin ? '<span style="opacity:.55;font-size:10px;margin-left:5px">(' + sRole + ')</span>' : '') +
          '</div>' +
          '<div style="margin-top:3px;white-space:pre-wrap">' + esc(msgText || '[media]') + '</div>' +
          '<div class="cmeta" style="margin-top:4px;text-align:right">' + fmtT(m.createdAt) + '</div>' +
          '</div>';
      }).join('');
      setTimeout(function() { g('chDrMsgs').scrollTop = g('chDrMsgs').scrollHeight; }, 50);
    }

    api('chats/' + cid + '/messages').then(function(d) {
      var msgs = d.messages || (d.chat && d.chat.messages) || [];
      var chatInfo = d.chat || {};
      renderChatMsgs(msgs, chatInfo);
    }).catch(function() {
      // Fallback: GET the chat object directly
      api('chats/' + cid).then(function(d2) {
        var msgs2 = (d2.chat && d2.chat.messages) || d2.messages || [];
        renderChatMsgs(msgs2, d2.chat || {});
      }).catch(function() {
        g('chDrMsgs').innerHTML = '<p style="text-align:center;color:#ef4444;padding:20px">Error loading messages</p>';
      });
    });
  }

  function closeChDr() { g('ov2').classList.remove('on'); g('dr2').classList.remove('on'); }

  /* ═══ CREDITS ════════════════════════════════════════════════════════════ */
  function loadCredits() {
    var type = g('crType').value, srch = g('crSrch').value.toLowerCase();
    _pages['credits'] = 1;
    setT('crTbl', spin());
    api('credits' + qs({ type: type })).then(function(d) {
      var txs = d.transactions || [];
      if (srch) { txs = txs.filter(function(t) { return t.user && ((t.user.name||'').toLowerCase().indexOf(srch) >= 0 || (t.user.email||'').toLowerCase().indexOf(srch) >= 0); }); }
      pagSlice('credits', txs);
      renderCreditsPage(txs);
    }).catch(function() { setT('crTbl', ''); });
  }

  function renderCreditsPage(arr) {
    if (arr) pagSlice('credits', arr);
    var page = pagSlice('credits', _pageData['credits'] || []);
    var existing = document.getElementById('pag-credits');
    if (existing) existing.remove();

    // Bulk toolbar
    var crTbl = document.getElementById('crTbl');
    var crParent = crTbl ? crTbl.closest('table') : null;
    var crToolbar = document.getElementById('crBulkToolbar');
    if (!crToolbar && crParent) {
      crToolbar = document.createElement('div');
      crToolbar.id = 'crBulkToolbar';
      crToolbar.style.cssText = 'display:none;align-items:center;gap:10px;padding:10px 0;margin-bottom:8px;';
      crToolbar.innerHTML =
        '<span id="crSelCount" style="font-size:13px;color:#a0a0b8;">0 selected</span>' +
        '<button class="btn brdn" style="font-size:12px;padding:6px 14px;" onclick="bulkDeleteCredits()">🗑 Delete Selected</button>' +
        '<button class="btn bgho" style="font-size:12px;padding:6px 14px;" onclick="clearCreditSelection()">Clear</button>';
      crParent.parentNode.insertBefore(crToolbar, crParent);
    }

    // Select-all in thead
    var crThead = crTbl ? crTbl.closest('table').querySelector('thead tr') : null;
    if (crThead && !crThead.querySelector('.cr-chk-all')) {
      var crTh = document.createElement('th');
      crTh.innerHTML = '<input type="checkbox" class="cr-chk-all" onchange="toggleAllCredits(this)" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;" title="Select all">';
      crThead.insertBefore(crTh, crThead.firstChild);
    }

    var tc = { purchase:'bgr', spent:'bo', refund:'bpu', bonus:'btl' };
    setT('crTbl', page.map(function(tx) {
      var uid = tx.user ? tx.user._id : '', un = tx.user ? esc(tx.user.name||'-') : '-', ue = tx.user ? esc(tx.user.email||'') : '';
      var displayAmt = (tx.type === 'purchase' && tx.purchaseDetails && tx.purchaseDetails.amountPaid) ? '₹' + tx.purchaseDetails.amountPaid.toLocaleString('en-IN') : (tx.amount > 0 ? '+' : '') + tx.amount + ' cr';
      return '<tr><td><input type="checkbox" class="cr-chk" data-txid="' + tx._id + '" onchange="onCreditCheck()" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;"></td><td><span data-uid="' + uid + '" style="cursor:pointer;color:#FC8019;font-weight:600">' + un + '</span><br><small style="color:#606078">' + ue + '</small></td><td><span class="badge ' + (tc[tx.type]||'bgy') + '">' + (tx.type||'') + '</span></td><td style="color:' + (tx.amount>0?'#22c55e':'#ef4444') + '">' + displayAmt + '</td><td style="color:#f59e0b">' + (tx.balanceAfter||0) + '</td><td style="font-size:12px;color:#a0a0b8">' + esc((tx.description||'-').substring(0, 40)) + '</td><td style="font-size:12px;color:#a0a0b8">' + fmtT(tx.createdAt) + '</td></tr>';
    }).join(''));
    pagHTML('credits', 'crTbl');
  }

  window.onCreditCheck = function() {
    var checked = document.querySelectorAll('.cr-chk:checked').length;
    var toolbar = document.getElementById('crBulkToolbar');
    var countEl = document.getElementById('crSelCount');
    if (toolbar) toolbar.style.display = checked > 0 ? 'flex' : 'none';
    if (countEl) countEl.textContent = checked + ' selected';
    var all = document.querySelectorAll('.cr-chk').length;
    var allChk = document.querySelector('.cr-chk-all');
    if (allChk) allChk.checked = checked > 0 && checked === all;
  };

  window.toggleAllCredits = function(masterChk) {
    document.querySelectorAll('.cr-chk').forEach(function(chk) { chk.checked = masterChk.checked; });
    onCreditCheck();
  };

  window.clearCreditSelection = function() {
    document.querySelectorAll('.cr-chk').forEach(function(chk) { chk.checked = false; });
    var allChk = document.querySelector('.cr-chk-all');
    if (allChk) allChk.checked = false;
    onCreditCheck();
  };

  window.bulkDeleteCredits = function() {
    var ids = Array.from(document.querySelectorAll('.cr-chk:checked')).map(function(c) { return c.dataset.txid; });
    if (!ids.length) { toast('Nothing selected', 'i'); return; }
    if (!confirm('Permanently delete ' + ids.length + ' transaction record(s)?\n\nNote: This only removes the log record, it does NOT reverse the credit balance.')) return;
    var done = 0, failed = 0;
    var next = function() {
      if (!ids.length) {
        toast('Deleted ' + done + (failed ? ', ' + failed + ' failed' : '') + ' records');
        loadCredits();
        return;
      }
      var id = ids.shift();
      api('credits/' + id, 'DELETE').then(function(d) {
        if (d.success) done++; else failed++;
        next();
      }).catch(function() { failed++; next(); });
    };
    next();
  };

  /* ═══ REFUNDS ════════════════════════════════════════════════════════════ */
  function loadRefunds() {
    g('rfList').innerHTML = '<div style="text-align:center;padding:40px"><div class="spin"></div></div>';
    /* load all experts too so admin can manually add credits */
    api('tickets?status=pending_review&limit=100').then(function(d) {
      var ts = d.tickets || [];
      var header = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><div style="font-size:13px;color:#a0a0b8">' + ts.length + ' pending requests</div><button class="btn bywn" id="manualCreditBtn">+ Manual Credit Adjustment</button></div>';
      if (!ts.length) {
        g('rfList').innerHTML = header + '<div class="empty"><h3>No pending refunds</h3></div>';
        g('manualCreditBtn').onclick = function() { openManualCredit(); };
        return;
      }
      g('rfList').innerHTML = header + ts.map(function(t) {
        var u = t.user || {}, uid = u._id || '', un = esc(u.name||'-'), ue = esc(u.email||'');
        var bk = (t.transactionBreakdown||[]).filter(function(b) { return b.eligible; }).map(function(b) {
          return '<div class="trow"><span>' + esc(b.clientName||'Client') + '</span><span style="color:#606078">' + esc(b.reason||'') + '</span><span style="color:#f59e0b">' + (b.creditsSpent||0) + ' cr</span></div>';
        }).join('');
        return '<div class="tcard" id="tc-' + t._id + '"><div class="ttop"><div class="ttu"><div class="ttav">' + esc((u.name||'U').charAt(0).toUpperCase()) + '</div><div class="tti"><strong>' + un + '</strong><small>' + ue + ' / ' + (u.credits||0) + ' credits</small></div></div><span class="badge byw">Pending</span></div><div class="tamt">+' + (t.eligibleCredits||0) + ' credits requested</div>' + bk + '<div style="font-size:12px;color:#606078;margin:8px 0">' + fmtT(t.createdAt) + '</div><textarea class="tnote" id="tn-' + t._id + '" rows="2" placeholder="Admin note (optional)..."></textarea><div class="tacrow"><button class="btn bgrn" style="flex:1;padding:10px" data-approve="' + t._id + '" data-credits="' + (t.eligibleCredits||0) + '">Approve ' + (t.eligibleCredits||0) + ' credits</button><button class="btn brdn" style="flex:1;padding:10px" data-reject="' + t._id + '">Reject</button><span class="btn bgho" style="padding:10px" data-uid="' + uid + '">Profile</span></div></div>';
      }).join('');
      g('manualCreditBtn').onclick = function() { openManualCredit(); };
    }).catch(function() { g('rfList').innerHTML = '<div class="empty"><h3>Failed to load</h3></div>'; });
  }

  function openManualCredit() {
    /* search for expert first */
    var nm = prompt('Enter expert name or email to add credits:');
    if (!nm) return;
    api('users' + qs({ role: 'expert', search: nm })).then(function(d) {
      var users = d.users || [];
      if (!users.length) { toast('No expert found', 'e'); return; }
      var u = users[0];
      openCreditModal(u._id, u.name, u.credits || 0);
    }).catch(function() { toast('Error', 'e'); });
  }

  /* ═══ TICKETS ════════════════════════════════════════════════════════════ */
  function loadTickets() {
    _pages['tickets'] = 1;
    setT('tkTbl', spin());
    var st = g('tkSt').value, srch = g('tkSrch').value;
    api('tickets' + qs({ status: st })).then(function(d) {
      var ts = d.tickets || [];
      if (srch) { srch = srch.toLowerCase(); ts = ts.filter(function(t) { return t.user && ((t.user.name||'').toLowerCase().indexOf(srch)>=0||(t.user.email||'').toLowerCase().indexOf(srch)>=0); }); }
      pagSlice('tickets', ts);
      renderTicketsPage(ts);
    }).catch(function() { setT('tkTbl', ''); });
  }

  function renderTicketsPage(arr) {
    if (arr) pagSlice('tickets', arr);
    var page = pagSlice('tickets', _pageData['tickets'] || []);
    var existing = document.getElementById('pag-tickets');
    if (existing) existing.remove();
    setT('tkTbl', page.map(function(t) {
      var u = t.user || {};
      var priMap = { high:'<span class="badge brd">🔴 High</span>', medium:'<span class="badge byw">🟡 Medium</span>', low:'<span class="badge bgy">🟢 Low</span>' };
        var priBadge = priMap[t.priority||'medium'] || priMap['medium'];
        return '<tr><td>' + uLnk(u._id||'', u.name||'-') + '<br><small style="color:#606078">' + esc(u.email||'') + '</small></td><td style="font-size:12px">' + esc(t.issueType||'-') + '</td><td style="font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc((t.subject||t.description||'-').substring(0,60)) + '</td><td>' + priBadge + '</td><td>' + bdg(t.status) + '</td><td style="color:#f59e0b">' + (t.eligibleCredits||0) + '</td><td style="font-size:12px;color:#a0a0b8">' + fmt(t.createdAt) + '</td><td><button class="btn bgho" data-tk-id="' + t._id + '">View</button></td></tr>';    }).join(''));
    pagHTML('tickets', 'tkTbl');
  }

  function openTicketModal(tid) {
    _tkId = tid;
    g('tkModalBody').innerHTML = '<div style="text-align:center;padding:20px"><div class="spin"></div></div>';
    openModal('ticketModal');
    api('tickets/' + tid).then(function(d) {
      if (!d.success || !d.ticket) { g('tkModalBody').innerHTML = '<p style="color:#606078">Failed to load</p>'; return; }
      var t = d.ticket, u = t.user || {};
      g('tkModalTitle').textContent = 'Ticket: ' + (t.issueType || 'Support');
      var html = '<div class="uhero" style="margin-bottom:12px"><div class="ttav">' + esc((u.name||'U').charAt(0).toUpperCase()) + '</div><div><strong>' + esc(u.name||'-') + '</strong><div style="font-size:12px;color:#a0a0b8">' + esc(u.email||'') + '</div></div></div>';
      html += '<div class="igrid" style="margin-bottom:12px"><div class="ic"><label>Status</label>' + bdg(t.status) + '</div><div class="ic"><label>Credits Req</label><span style="color:#f59e0b">' + (t.eligibleCredits||0) + '</span></div><div class="ic"><label>Created</label><span>' + fmt(t.createdAt) + '</span></div><div class="ic"><label>Decision</label><span>' + (t.decision||'Pending') + '</span></div></div>';
      if (t.description) html += '<div class="tk-body" style="background:#18181d;padding:12px;border-radius:8px;margin-bottom:12px">' + esc(t.description) + '</div>';
      // ── Expert refund: show linked approach ──
if (t.isExpertRefund && t.relatedApproachId) {
  html += '<div style="background:#18181d;border:1px solid rgba(252,128,25,.25);border-radius:10px;padding:14px 16px;margin-bottom:12px;">' +
    '<div style="font-size:10px;font-weight:700;color:#FC8019;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px;">💳 Expert Credit Refund Request</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span style="font-size:13px;color:#a0a0b8;">Credits Requested</span>' +
      '<span style="font-size:18px;font-weight:800;color:#FC8019;">' + (t.eligibleCredits||0) + ' credits</span>' +
    '</div>' +
    '<button onclick="loadApproachDetail(\'' + (t.relatedApproachId._id || t.relatedApproachId) + '\')" style="padding:8px 14px;border-radius:7px;border:1px solid rgba(252,128,25,.3);background:rgba(252,128,25,.1);color:#FC8019;font-size:12px;font-weight:600;cursor:pointer;width:100%;">🔍 View Linked Approach Details</button>' +
  '</div>';
}
       if ((t.transactionBreakdown||[]).length) {
        html += '<div class="slbl">Breakdown</div>';
        t.transactionBreakdown.forEach(function(b) {
          html += '<div class="trow"><span>' + esc(b.clientName||'Client') + '</span><span>' + esc(b.reason||'') + '</span><span style="color:' + (b.eligible?'#22c55e':'#606078') + '">' + (b.creditsSpent||0) + ' cr</span></div>';
        });
      }
      if (t.adminNote) html += '<div style="margin-top:12px;padding:10px;background:#18181d;border-radius:8px;font-size:12px;color:#a0a0b8">Admin note: ' + esc(t.adminNote) + '</div>';
      html += '<textarea class="tnote" id="tkNote" rows="2" placeholder="Add admin note..." style="margin-top:12px">' + (t.adminNote||'') + '</textarea>';

      // Canned responses
      var isActive = t.status === 'open' || t.status === 'escalated' || t.status === 'pending_review';
      if (isActive) {
        html += '<div style="margin-top:16px;border-top:1px solid #2a2a38;padding-top:14px">';
        html += '<div style="font-size:11px;color:#606078;text-transform:uppercase;letter-spacing:.07em;margin-bottom:10px;font-weight:700">Quick Canned Response</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px">';
        var canned = [
          { type:'refund_approved',      label:'✅ Approve Refund',        color:'#22c55e' },
          { type:'not_eligible',         label:'❌ Not Eligible',           color:'#ef4444' },
          { type:'under_investigation',  label:'🔍 Under Investigation',    color:'#f59e0b' },
          { type:'resolved_no_action',   label:'✔ Resolved',               color:'#3b82f6' },
          { type:'contact_support',      label:'📞 Contact Support',        color:'#a855f7' }
        ];
        canned.forEach(function(c) {
          html += '<button onclick="sendCannedResponse(\'' + _tkId + '\',\'' + c.type + '\',this)" style="padding:7px 13px;border-radius:7px;border:1px solid ' + c.color + '40;background:' + c.color + '15;color:' + c.color + ';font-size:12px;font-weight:600;cursor:pointer">' + c.label + '</button>';
        });
        html += '</div></div>';
      }

      // Client Activity button
      html += '<div style="margin-top:12px">';
      html += '<button onclick="loadClientActivity(\'' + (t.user && t.user._id ? t.user._id : '') + '\',\'' + esc(t.user && t.user.name ? t.user.name : 'User') + '\')" style="padding:7px 14px;border-radius:7px;border:1px solid rgba(252,128,25,.3);background:rgba(252,128,25,.1);color:#FC8019;font-size:12px;font-weight:600;cursor:pointer">📋 Client Activity Log</button>';
      html += '</div>';

      g('tkModalBody').innerHTML = html;
      var isPending = t.status === 'pending_review';
      g('tkApproveBtn').style.display = isPending ? 'inline-flex' : 'none';
      g('tkRejectBtn').style.display = isPending ? 'inline-flex' : 'none';
      g('tkResolveBtn').style.display = (t.status === 'open' || t.status === 'escalated') ? 'inline-flex' : 'none';
    }).catch(function() { g('tkModalBody').innerHTML = '<p style="color:#606078">Error</p>'; });
  }

  function processTicket(action) {
    if (!_tkId) return;
    var note = ''; var nt = g('tkNote'); if (nt) note = nt.value;
    var path = action === 'resolve' ? ('tickets/' + _tkId + '/resolve') : ('tickets/' + _tkId + '/' + action);
    api(path, 'POST', { note: note }).then(function(d) {
      if (d.success) { toast(action === 'approve' ? 'Refund approved!' : action === 'reject' ? 'Rejected' : 'Resolved'); closeModal('ticketModal'); loadTickets(); loadDashboard(); }
      else toast(d.message || 'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  }

  /* ═══ POSTS ══════════════════════════════════════════════════════════════ */
  function loadPosts() {
    _pages['posts'] = 1;
    setT('poTbl', spin());
    var srch = g('poSrch').value, st = g('poSt').value;
    api('requests' + qs({ search: srch, status: st })).then(function(d) {
      var posts = d.requests || [];
      pagSlice('posts', posts);
      renderPostsPage(posts);
    }).catch(function() { setT('poTbl', ''); });
  }

  function renderPostsPage(arr) {
    if (arr) pagSlice('posts', arr);
    var page = pagSlice('posts', _pageData['posts'] || []);
    var existing = document.getElementById('pag-posts');
    if (existing) existing.remove();

    // Bulk toolbar
    var poTbl = document.getElementById('poTbl');
    var poParent = poTbl ? poTbl.closest('table') : null;
    var poToolbar = document.getElementById('poBulkToolbar');
    if (!poToolbar && poParent) {
      poToolbar = document.createElement('div');
      poToolbar.id = 'poBulkToolbar';
      poToolbar.style.cssText = 'display:none;align-items:center;gap:10px;padding:10px 0;margin-bottom:8px;';
      poToolbar.innerHTML =
        '<span id="poSelCount" style="font-size:13px;color:#a0a0b8;">0 selected</span>' +
        '<button class="btn brdn" style="font-size:12px;padding:6px 14px;" onclick="bulkDeletePosts()">🗑 Delete Selected</button>' +
        '<button class="btn bgho" style="font-size:12px;padding:6px 14px;" onclick="clearPostSelection()">Clear</button>';
      poParent.parentNode.insertBefore(poToolbar, poParent);
    }

    // Select-all in thead
    var poThead = poTbl ? poTbl.closest('table').querySelector('thead tr') : null;
    if (poThead && !poThead.querySelector('.po-chk-all')) {
      var poTh = document.createElement('th');
      poTh.innerHTML = '<input type="checkbox" class="po-chk-all" onchange="toggleAllPosts(this)" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;" title="Select all">';
      poThead.insertBefore(poTh, poThead.firstChild);
    }

    setT('poTbl', page.map(function(p) {
      var cname = p.client ? esc(p.client.name||'-') : '-';
      var cr = p.creditsRequired || p.creditsSpent || p.credits || 0;
      return '<tr><td><input type="checkbox" class="po-chk" data-pid="' + p._id + '" onchange="onPostCheck()" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;"></td><td style="font-size:13px;font-weight:600">' + esc((p.title||'-').substring(0,40)) + '</td><td>' + uLnk(p.client?p.client._id:'', cname, '#3b82f6') + '</td><td style="font-size:12px">' + esc(p.service||p.category||'-') + '</td><td style="color:#f59e0b">' + (p.budget||'-') + '</td><td>' + bdg(p.status||'open') + '</td><td style="color:#FC8019;font-weight:600">' + cr + '</td><td style="font-size:12px;color:#a0a0b8">' + fmt(p.createdAt) + '</td><td><button class="btn bgho" data-edit-post="' + p._id + '">Edit</button></td></tr>';
    }).join(''));
    pagHTML('posts', 'poTbl');
  }

  window.onPostCheck = function() {
    var checked = document.querySelectorAll('.po-chk:checked').length;
    var toolbar = document.getElementById('poBulkToolbar');
    var countEl = document.getElementById('poSelCount');
    if (toolbar) toolbar.style.display = checked > 0 ? 'flex' : 'none';
    if (countEl) countEl.textContent = checked + ' selected';
    var all = document.querySelectorAll('.po-chk').length;
    var allChk = document.querySelector('.po-chk-all');
    if (allChk) allChk.checked = checked > 0 && checked === all;
  };

  window.toggleAllPosts = function(masterChk) {
    document.querySelectorAll('.po-chk').forEach(function(chk) { chk.checked = masterChk.checked; });
    onPostCheck();
  };

  window.clearPostSelection = function() {
    document.querySelectorAll('.po-chk').forEach(function(chk) { chk.checked = false; });
    var allChk = document.querySelector('.po-chk-all');
    if (allChk) allChk.checked = false;
    onPostCheck();
  };

  window.bulkDeletePosts = function() {
    var ids = Array.from(document.querySelectorAll('.po-chk:checked')).map(function(c) { return c.dataset.pid; });
    if (!ids.length) { toast('Nothing selected', 'i'); return; }
    if (!confirm('Permanently delete ' + ids.length + ' post(s)?')) return;
    var confirmText = prompt('Type DELETE to confirm:');
    if (confirmText !== 'DELETE') { toast('Cancelled', 'i'); return; }
    var done = 0, failed = 0;
    var next = function() {
      if (!ids.length) {
        toast('Deleted ' + done + (failed ? ', ' + failed + ' failed' : '') + ' posts');
        loadPosts();
        return;
      }
      var id = ids.shift();
      api('requests/' + id, 'DELETE').then(function(d) {
        if (d.success) done++; else failed++;
        next();
      }).catch(function() { failed++; next(); });
    };
    next();
  };
   
function normalizePostAnswersForAdmin(answers) {
    var normalized = Object.assign({}, answers || {});
    if (normalized.fullAddress && !normalized.full_address) normalized.full_address = normalized.fullAddress;
    if (normalized.clientLocation && !normalized.client_location) normalized.client_location = normalized.clientLocation;
    if (normalized.serviceLocationType && !normalized.service_location_type) normalized.service_location_type = normalized.serviceLocationType;
    delete normalized.fullAddress;
    delete normalized.clientLocation;
    delete normalized.serviceLocationType;
    return normalized;
  }

  function formatPostLocationFromAnswers(answers, fallback) {
    var normalized = normalizePostAnswersForAdmin(answers);
    var locType = normalized.service_location_type || normalized.serviceLocationType;
    var addr = (locType === 'my-location' || locType === 'professional-office')
      ? (normalized.full_address || normalized.fullAddress)
      : (normalized.client_location || normalized.clientLocation || normalized.full_address || normalized.fullAddress);
    if (addr && (addr.area || addr.city || addr.state || addr.pincode)) {
      return [addr.area, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
    }
    return fallback || (locType === 'online' ? 'Online' : 'Location not provided');
  }

function openPostModal(pid) {
    _editPostId = pid;
    api('requests/' + pid).then(function(d) {
      var p = d.request || {};
      var answers = normalizePostAnswersForAdmin(p.answers || {});
      g('postTitle').value = p.title || '';
      g('postDesc').value = p.description || '';
      g('postStatus').value = p.status || '';
      g('postCredits').value = p.credits || p.creditsRequired || 0;
      if (g('postTimeline')) g('postTimeline').value = p.timeline || answers.urgency || '';
      if (g('postBudget')) g('postBudget').value = p.budget || answers.budget || '';
      if (g('postLocation')) g('postLocation').value = (p.location && p.location !== 'Online') ? p.location : formatPostLocationFromAnswers(answers, p.location || '');
      if (g('postAnswers')) g('postAnswers').value = JSON.stringify(answers, null, 2);
      openModal('postModal');
    }).catch(function() { toast('Error loading post', 'e'); });
  }

  function savePost() {
    if (!_editPostId) return;
    var statusVal = g('postStatus').value;
    var creditsVal = parseInt(g('postCredits').value) || 0;
    var answers = {};
    if (g('postAnswers')) {
      try {
        answers = normalizePostAnswersForAdmin(JSON.parse(g('postAnswers').value || '{}'));
      } catch (e) {
        toast('Questionnaire answers must be valid JSON', 'e');
        return;
      }
    }
    var payload = {
      title: g('postTitle').value,
      description: g('postDesc').value,
      creditsRequired: creditsVal,
      answers: answers
    };
    if (g('postTimeline')) payload.timeline = g('postTimeline').value;
    if (g('postBudget')) payload.budget = g('postBudget').value;
    if (g('postLocation')) payload.location = g('postLocation').value || formatPostLocationFromAnswers(answers, '');
    // Only send status if admin explicitly chose one - empty means keep current
    if (statusVal) payload.status = statusVal;
    var btn = g('savePostBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    api('requests/' + _editPostId, 'PUT', payload)
      .then(function(d) {
        if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
        if (d.success) {
          toast('Post updated');
          closeModal('postModal');
          _editPostId = null;
          loadPosts(); // fresh reload from server
        } else toast(d.message || 'Failed', 'e');
      }).catch(function() {
        if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
        toast('Error saving', 'e');
      });
  }

  function deletePost() {
    if (!_editPostId || !confirm('Delete this post permanently?')) return;
    api('requests/' + _editPostId, 'DELETE')
      .then(function(d) {
        if (d.success) { toast('Post deleted'); closeModal('postModal'); loadPosts(); }
        else toast(d.message || 'Failed', 'e');
      }).catch(function() { toast('Error', 'e'); });
  }

  /* ═══ REVIEWS ════════════════════════════════════════════════════════════ */
  function loadReviews() {
    _pages['reviews'] = 1;
    setT('rvTbl', spin());
    var srch = g('rvSrch').value;
    api('ratings' + qs({ search: srch })).then(function(d) {
      var reviews = d.ratings || [];
      pagSlice('reviews', reviews);
      renderReviewsPage(reviews);
    }).catch(function() { setT('rvTbl', ''); });
  }

  function renderReviewsPage(arr) {
    if (arr) pagSlice('reviews', arr);
    var page = pagSlice('reviews', _pageData['reviews'] || []);
    var existing = document.getElementById('pag-reviews');
    if (existing) existing.remove();
    setT('rvTbl', page.map(function(r) {
      var en = r.expert ? esc(r.expert.name||'-') : '-', eid = r.expert ? r.expert._id : '';
      var cl = r.client ? esc(r.client.name||'-') : '-';
      return '<tr><td><span data-uid="' + eid + '" style="cursor:pointer;color:#FC8019;font-weight:600">' + en + '</span></td><td style="color:#a0a0b8">' + cl + '</td><td>' + stars(r.rating||0) + ' <span style="font-size:11px;color:#f59e0b">' + (r.rating||0) + '</span></td><td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis">' + esc((r.review||r.comment||'-').substring(0,80)) + '</td><td style="font-size:12px;color:#a0a0b8">' + fmt(r.createdAt) + '</td><td><button class="btn brdn" data-del-review="' + r._id + '">Delete</button></td></tr>';
    }).join(''));
    pagHTML('reviews', 'rvTbl');
  }

  /* ═══ REGISTRATIONS ══════════════════════════════════════════════════════ */
  function loadRegistrations() {
    _pages['registrations'] = 1;
    setT('rgTbl', spin());
    var st = g('rgSt').value;
    api('users' + qs({ role: 'expert', registrationStatus: st })).then(function(d) {
      var users = d.users || [];
       
      /* filter by approval status if field exists */
      if (st !== 'all') {
        users = users.filter(function(u) {
          if (st === 'pending') return !u.isApproved && !u.isRejected && !u.isBanned;
          if (st === 'approved') return u.isApproved;
          if (st === 'rejected') return u.isRejected || u.isBanned;
          return true;
        });
      }
      pagSlice('registrations', users);
      renderRegistrationsPage(users);
    }).catch(function() { setT('rgTbl', ''); });
  }

  function renderRegistrationsPage(arr) {
    if (arr) pagSlice('registrations', arr);
    var page = pagSlice('registrations', _pageData['registrations'] || []);
    var existing = document.getElementById('pag-registrations');
    if (existing) existing.remove();
    setT('rgTbl', page.map(function(u) {
        var pr = u.profile || {};
        var actions = '';
        if (!u.isApproved) actions += '<button class="btn bgrn" data-reg-action="' + u._id + '" data-action="approve" data-nm="' + esc(u.name) + '">Approve</button> ';
        if (!u.isBanned) actions += '<button class="btn brdn" data-reg-action="' + u._id + '" data-action="ban" data-nm="' + esc(u.name) + '">Reject</button>';
        var kycCount = [u.aadharDoc, u.panDoc, u.certificateDoc, u.kycDocument,
  (u.profile&&u.profile.aadhar), (u.profile&&u.profile.pan), (u.profile&&u.profile.certificate),
  (u.kyc && u.kyc.status && u.kyc.status !== 'not_submitted' ? u.kyc.docType : null)
].filter(Boolean).length;

var kycBtn = kycCount > 0
  ? '<button class="btn bpri" data-kyc-uid="' + u._id + '" data-kyc-name="' + esc(u.name) + '">' + (u.kyc && u.kyc.docType ? u.kyc.docType : kycCount + ' doc') + '</button>'
  : '<span style="font-size:11px;color:#606078">No docs</span>';
                var kycStatusMap = {
          not_submitted: '<span class="badge bgy">—</span>',
          pending:       '<span class="badge byw">⏳ Under Review</span>',
          approved:      '<span class="badge bgr">✅ Verified</span>',
          rejected:      '<span class="badge brd">❌ Rejected</span>'
        };
        var kycStatusBadge = kycStatusMap[(u.kyc && u.kyc.status) || 'not_submitted'];
        return '<tr><td>' + uLnk(u._id, u.name) + '</td><td style="font-size:12px;color:#a0a0b8">' + esc(u.email) + '</td><td style="font-size:12px">' + (u.phone||'-') + '</td><td style="font-size:12px">' + esc(pr.specialization||u.specialization||'-') + '</td><td>' + kycBtn + '</td><td>' + kycStatusBadge + '</td><td>' + (u.isApproved ? '<span class="badge bgr">Approved</span>' : u.isBanned ? '<span class="badge brd">Rejected</span>' : '<span class="badge byw">Pending</span>') + '</td><td style="font-size:12px;color:#a0a0b8">' + fmt(u.createdAt) + '</td><td>' + actions + '</td></tr>';
      }).join(''));
    pagHTML('registrations', 'rgTbl');
  }

  /* ═══ PAYMENTS ═══════════════════════════════════════════════════════════ */
  var _pyStatus = 'all';
  var _allPayments = [];

  function loadPayments() {
    setT('pyTbl', spin());

    // Wire up filter dropdown
    var filterSel = g('pyStatusFilter');
    if (filterSel && !filterSel._wired) {
      filterSel._wired = true;
      filterSel.onchange = function() { _pyStatus = this.value; _pages['payments'] = 1; loadPayments(); };
    }

    var statusParam = (_pyStatus && _pyStatus !== 'all') ? '&status=' + _pyStatus : '';
    api('payments?limit=500' + statusParam + (dF ? '&from=' + dF : '') + (dT ? '&to=' + dT : ''))
      .then(function(d) {
        _allPayments = d.payments || [];
        var pc = g('pyCount'); if (pc) pc.textContent = _allPayments.length + ' records';
        _pages['payments'] = 1;
        pagSlice('payments', _allPayments);
        renderPaymentsPage();
      }).catch(function() {
        setT('pyTbl', '<tr><td colspan="10" style="text-align:center;padding:30px;color:#606078">Error loading payments</td></tr>');
      });
  }

  function renderPaymentsPage() {
    var existing = document.getElementById('pag-payments');
    if (existing) existing.remove();

    var page = pagSlice('payments', _pageData['payments'] || []);

    if (!page.length) {
      setT('pyTbl', '<tr><td colspan="10" style="text-align:center;padding:30px;color:#606078">No payments found</td></tr>');
      return;
    }

    var statusMap = {
      success:  '<span class="badge bgr">✅ Success</span>',
      failed:   '<span class="badge brd">❌ Failed</span>',
      pending:  '<span class="badge byw">⏳ Pending</span>',
      refunded: '<span class="badge bpu">💸 Refunded</span>'
    };

    // Bulk delete toolbar (injected above table)
    var tblEl = g('pyTbl');
    var tblParent = tblEl ? tblEl.closest('table') : null;
    var toolbar = document.getElementById('pyBulkToolbar');
    if (!toolbar && tblParent) {
      toolbar = document.createElement('div');
      toolbar.id = 'pyBulkToolbar';
      toolbar.style.cssText = 'display:none;align-items:center;gap:10px;padding:10px 0;margin-bottom:8px;';
      toolbar.innerHTML =
        '<span id="pySelCount" style="font-size:13px;color:#a0a0b8;">0 selected</span>' +
        '<button class="btn brdn" style="font-size:12px;padding:6px 14px;" onclick="bulkDeletePayments()">🗑 Delete Selected</button>' +
        '<button class="btn bgho" style="font-size:12px;padding:6px 14px;" onclick="clearPaymentSelection()">Clear</button>';
      tblParent.parentNode.insertBefore(toolbar, tblParent);
    }

    setT('pyTbl', page.map(function(p) {
      var u = p.user || {};
      var meta = p.metadata || {};
      var statusBadge = statusMap[p.paymentStatus] || '<span class="badge bgy">' + esc(p.paymentStatus||'-') + '</span>';
      var creditedVia = meta.creditedVia ? '<div style="font-size:10px;color:#a855f7;">via ' + esc(meta.creditedVia) + '</div>' : '';
      var amtColor = p.paymentStatus === 'success' ? '#22c55e' : p.paymentStatus === 'failed' ? '#ef4444' : '#f59e0b';
      var rpPay = meta.razorpayPaymentId ? '<div style="font-size:10px;color:#606078;font-family:monospace" title="' + esc(meta.razorpayPaymentId) + '">pay:…' + meta.razorpayPaymentId.slice(-8) + '</div>' : '';
      var rpOrd = meta.razorpayOrderId   ? '<div style="font-size:10px;color:#606078;font-family:monospace" title="' + esc(meta.razorpayOrderId) + '">ord:…' + meta.razorpayOrderId.slice(-8) + '</div>' : '';
      var failReason = meta.failureReason ? '<div style="font-size:11px;color:#f59e0b;margin-top:2px">' + esc(meta.failureReason.substring(0,50)) + '</div>' : '';

      return '<tr id="pyrow_' + esc(p._id) + '">' +
        '<td><input type="checkbox" class="py-chk" data-pid="' + esc(p._id||'') + '" onchange="onPaymentCheck()" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;"></td>' +
        '<td>' + uLnk(u._id||'', u.name||'-') + '<br><small style="color:#606078">' + esc(u.email||'') + '</small><br><small style="color:#606078">' + esc(u.phone||'') + '</small></td>' +
        '<td><span style="color:' + amtColor + ';font-weight:700;">₹' + (p.amount||0).toLocaleString('en-IN') + '</span></td>' +
        '<td style="color:#f59e0b;font-weight:600;font-size:15px;">' + (p.credits||0) + '</td>' +
        '<td>' + statusBadge + creditedVia + '</td>' +
        '<td style="font-size:12px;color:#3b82f6;font-weight:600">' + esc(meta.paymentMethod||p.paymentMethod||'razorpay') + '</td>' +
        '<td style="font-size:12px;color:#a0a0b8">' + esc(meta.paymentInstrument||'-') + '</td>' +
        '<td>' + rpPay + rpOrd + failReason + '</td>' +
        '<td style="font-size:12px;color:#a0a0b8">' + fmtT(p.createdAt) + '</td>' +
        '<td style="display:flex;gap:4px;">' +
          '<span class="btn bgho" style="font-size:12px;padding:5px 8px" data-uid="' + esc(u._id||'') + '">Profile</span>' +
          '<button class="btn brdn" style="font-size:12px;padding:5px 8px" onclick="deletePayment(\'' + esc(p._id||'') + '\')">Delete</button>' +
        '</td>' +
      '</tr>';
    }).join(''));

    // Select-all checkbox in header
    var thead = tblEl ? tblEl.closest('table').querySelector('thead tr') : null;
    if (thead && !thead.querySelector('.py-chk-all')) {
      var th = document.createElement('th');
      th.innerHTML = '<input type="checkbox" class="py-chk-all" onchange="toggleAllPayments(this)" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;" title="Select all on this page">';
      thead.insertBefore(th, thead.firstChild);
    }

    pagHTML('payments', 'pyTbl');
  }

  window.onPaymentCheck = function() {
    var checked = document.querySelectorAll('.py-chk:checked').length;
    var toolbar = g('pyBulkToolbar');
    var countEl = g('pySelCount');
    if (toolbar) toolbar.style.display = checked > 0 ? 'flex' : 'none';
    if (countEl) countEl.textContent = checked + ' selected';
    // Sync select-all checkbox state
    var all = document.querySelectorAll('.py-chk').length;
    var allChk = document.querySelector('.py-chk-all');
    if (allChk) allChk.checked = checked > 0 && checked === all;
  };

  window.toggleAllPayments = function(masterChk) {
    document.querySelectorAll('.py-chk').forEach(function(chk) { chk.checked = masterChk.checked; });
    onPaymentCheck();
  };

  window.clearPaymentSelection = function() {
    document.querySelectorAll('.py-chk').forEach(function(chk) { chk.checked = false; });
    var allChk = document.querySelector('.py-chk-all');
    if (allChk) allChk.checked = false;
    onPaymentCheck();
  };

  window.bulkDeletePayments = function() {
    var ids = Array.from(document.querySelectorAll('.py-chk:checked')).map(function(c) { return c.dataset.pid; });
    if (!ids.length) { toast('Nothing selected', 'i'); return; }
    if (!confirm('Permanently delete ' + ids.length + ' payment record(s)?')) return;
    var done = 0, failed = 0;
    var next = function() {
      if (!ids.length) {
        toast('Deleted ' + done + (failed ? ', ' + failed + ' failed' : '') + ' records');
        loadPayments();
        return;
      }
      var id = ids.shift();
      api('payments/' + id, 'DELETE').then(function(d) {
        if (d.success) done++; else failed++;
        next();
      }).catch(function() { failed++; next(); });
    };
    next();
  };

  window.deletePayment = function(id) {
    if (!confirm('Permanently delete this payment record?')) return;
    api('payments/' + id, 'DELETE').then(function(d) {
      if (d.success) { toast('Payment record deleted'); loadPayments(); }
      else toast(d.message || 'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  };
   
  /* ═══ COMMUNICATION ══════════════════════════════════════════════════════ */
    var _allCommHistory = [];
   function previewComm() {
    var target = g('commTarget').value;
    var label = { all:'All Users', experts:'All Experts', clients:'All Clients', custom:'Custom List' }[target] || target;
    toast('Will send to: ' + label, 'i');
  }

  function sendComm() {
    var subj = g('commSubj').value.trim();
    var msg = g('commMsg').value.trim();
    var target = g('commTarget').value;
    if (!subj || !msg) { toast('Subject and message required', 'e'); return; }
    var payload = { subject: subj, message: msg, target: target };
    if (target === 'custom') { payload.emails = g('commEmails').value.split(',').map(function(e) { return e.trim(); }).filter(Boolean); }
    g('commStatus').textContent = 'Sending...';
    api('communications/send', 'POST', payload).then(function(d) {
      if (d.success) {
        g('commStatus').textContent = 'Sent to ' + (d.recipientCount || '?') + ' recipients!';
        g('commSubj').value = ''; g('commMsg').value = '';
        loadCommHistory();
      } else { g('commStatus').textContent = 'Failed: ' + (d.message || 'Unknown error'); g('commStatus').style.color = '#ef4444'; }
    }).catch(function() { g('commStatus').textContent = 'Error - check server logs'; g('commStatus').style.color = '#ef4444'; });
  }

  function loadCommHistory() {
    api('communications/history').then(function(d) {
      _allCommHistory = d.logs || [];
      _pages['commHistory'] = 1;
      pagSlice('commHistory', _allCommHistory);
      renderCommHistoryPage();
    }).catch(function() {});
  }

  function renderCommHistoryPage() {
    var existing = document.getElementById('pag-commHistory');
    if (existing) existing.remove();

    var page = pagSlice('commHistory', _pageData['commHistory'] || []);

    // Bulk toolbar
    var tbl = document.getElementById('commHist');
    var tblParent = tbl ? tbl.closest('table') : null;
    var toolbar = document.getElementById('commBulkToolbar');
    if (!toolbar && tblParent) {
      toolbar = document.createElement('div');
      toolbar.id = 'commBulkToolbar';
      toolbar.style.cssText = 'display:none;align-items:center;gap:10px;padding:10px 0;margin-bottom:8px;';
      toolbar.innerHTML =
        '<span id="commSelCount" style="font-size:13px;color:#a0a0b8;">0 selected</span>' +
        '<button class="btn brdn" style="font-size:12px;padding:6px 14px;" onclick="bulkDeleteCommHistory()">🗑 Delete Selected</button>' +
        '<button class="btn bgho" style="font-size:12px;padding:6px 14px;" onclick="clearCommSelection()">Clear</button>';
      tblParent.parentNode.insertBefore(toolbar, tblParent);
    }

    if (!page.length) {
      setT('commHist', '<tr><td colspan="6" style="text-align:center;padding:20px;color:#606078">No history yet</td></tr>');
      return;
    }

    // Select-all in thead
    var thead = tbl ? tbl.closest('table').querySelector('thead tr') : null;
    if (thead && !thead.querySelector('.comm-chk-all')) {
      var th = document.createElement('th');
      th.innerHTML = '<input type="checkbox" class="comm-chk-all" onchange="toggleAllComm(this)" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;" title="Select all">';
      thead.insertBefore(th, thead.firstChild);
    }

    setT('commHist', page.map(function(l) {
      var typeTag = l.type === 'announcement' ? '<span class="badge bo">&#128276; Announcement</span>' : '<span class="badge bgy">&#128140; Email</span>';
      return '<tr>' +
        '<td><input type="checkbox" class="comm-chk" data-cid="' + esc(l._id||'') + '" onchange="onCommCheck()" style="accent-color:#FC8019;width:15px;height:15px;cursor:pointer;"></td>' +
        '<td>' + typeTag + '</td>' +
        '<td style="font-size:13px">' + esc(l.subject||l.title||'-') + '</td>' +
        '<td>' + bdg(l.target||'all') + '</td>' +
        '<td style="color:#22c55e">' + (l.recipientCount||0) + '</td>' +
        '<td style="font-size:12px;color:#a0a0b8">' + fmtT(l.createdAt) + '</td>' +
        '<td><button class="btn brdn" style="font-size:12px;padding:5px 8px" onclick="deleteSingleCommHistory(\'' + esc(l._id||'') + '\')">Delete</button></td>' +
      '</tr>';
    }).join(''));

    pagHTML('commHistory', 'commHist');
  }

  window.onCommCheck = function() {
    var checked = document.querySelectorAll('.comm-chk:checked').length;
    var toolbar = document.getElementById('commBulkToolbar');
    var countEl = document.getElementById('commSelCount');
    if (toolbar) toolbar.style.display = checked > 0 ? 'flex' : 'none';
    if (countEl) countEl.textContent = checked + ' selected';
    var all = document.querySelectorAll('.comm-chk').length;
    var allChk = document.querySelector('.comm-chk-all');
    if (allChk) allChk.checked = checked > 0 && checked === all;
  };

  window.toggleAllComm = function(masterChk) {
    document.querySelectorAll('.comm-chk').forEach(function(chk) { chk.checked = masterChk.checked; });
    onCommCheck();
  };

  window.clearCommSelection = function() {
    document.querySelectorAll('.comm-chk').forEach(function(chk) { chk.checked = false; });
    var allChk = document.querySelector('.comm-chk-all');
    if (allChk) allChk.checked = false;
    onCommCheck();
  };

  window.deleteSingleCommHistory = function(id) {
    if (!id || !confirm('Delete this communication log?')) return;
    api('communications/history/' + id, 'DELETE').then(function(d) {
      if (d.success) { toast('Deleted'); loadCommHistory(); }
      else toast(d.message || 'Failed', 'e');
    }).catch(function() { toast('Error', 'e'); });
  };

  window.bulkDeleteCommHistory = function() {
    var ids = Array.from(document.querySelectorAll('.comm-chk:checked')).map(function(c) { return c.dataset.cid; });
    if (!ids.length) { toast('Nothing selected', 'i'); return; }
    if (!confirm('Permanently delete ' + ids.length + ' communication log(s)?')) return;
    var done = 0, failed = 0;
    var next = function() {
      if (!ids.length) {
        toast('Deleted ' + done + (failed ? ', ' + failed + ' failed' : '') + ' records');
        loadCommHistory();
        return;
      }
      var id = ids.shift();
      api('communications/history/' + id, 'DELETE').then(function(d) {
        if (d.success) done++; else failed++;
        next();
      }).catch(function() { failed++; next(); });
    };
    next();
  };

  /* ═══ INVOICES ═══════════════════════════════════════════════════════════ */
  var _invExpertName = '';

  function loadInvExperts() {
    api('users' + qs({ role: 'expert', limit: 200 })).then(function(d) {
      var sel = g('invUserSel');
      sel.innerHTML = '<option value="">-- Select Expert --</option>';
      (d.users||[]).forEach(function(u) {
        var opt = document.createElement('option');
        opt.value = u._id;
        opt.textContent = u.name + ' (' + (u.email||'') + ')';
        opt.dataset.name = u.name;
        opt.dataset.email = u.email||'';
        opt.dataset.credits = u.credits||0;
        sel.appendChild(opt);
      });
    }).catch(function() {});
  }

  function onInvExpertChange() {
    var sel = g('invUserSel');
    var opt = sel.options[sel.selectedIndex];
    var uid = sel.value;
    var txSel = g('invTxSel');

    if (!uid) {
      txSel.innerHTML = '<option value="">-- Select Expert first --</option>';
      txSel.disabled = true;
      _invExpertName = '';
      g('invPreview').innerHTML = '<div class="empty"><h3>Select expert to preview</h3></div>';
      return;
    }

    _invExpertName = opt.dataset.name || opt.textContent;
    txSel.innerHTML = '<option value="">Loading transactions...</option>';
    txSel.disabled = true;

    // Load ALL credit transactions for this expert
    api('credits/expert/' + uid).then(function(d) {
      var txs = d.transactions || [];
      txSel.innerHTML = '<option value="">-- Select Transaction (optional) --</option>';
      if (!txs.length) {
        txSel.innerHTML += '<option value="" disabled>No transactions found</option>';
      } else {
        var typeIcon = { purchase:'🟢', bonus:'🟡', refund:'🟣', spent:'🔴', adjustment:'⚪' };
        txs.forEach(function(tx) {
          var opt = document.createElement('option');
          opt.value = tx._id;
          var dt = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '';
          var icon = typeIcon[tx.type] || '⚫';
          var sign = tx.amount > 0 ? '+' : '';
          var label = icon + ' ' + dt + ' | ' + (tx.type||'?').toUpperCase() + ' | ' + sign + tx.amount + ' cr | ' + esc((tx.description||tx.type||'').substring(0,25));
          opt.textContent = label;
          opt.dataset.amount = Math.abs(tx.amount) || 0;
          opt.dataset.desc = tx.description || tx.type || '';
           opt.dataset.amountPaid = (tx.purchaseDetails && tx.purchaseDetails.amountPaid) || 0;
          opt.dataset.date = tx.createdAt ? tx.createdAt.split('T')[0] : '';
          opt.dataset.type = tx.type || '';
          txSel.appendChild(opt);
        });
      }
      txSel.disabled = false;
      previewInvoice();
    }).catch(function() {
      txSel.innerHTML = '<option value="">-- Select Transaction (optional) --</option>';
      txSel.disabled = false;
    });
  }

  function onInvTxChange() {
    var txSel = g('invTxSel');
    var opt = txSel.options[txSel.selectedIndex];
    if (!opt || !opt.value) { previewInvoice(); return; }

    // Auto-fill form fields from selected transaction
    var amt = parseFloat(opt.dataset.amount) || 0;
    var desc = opt.dataset.desc || '';
    var date = opt.dataset.date || '';

    // Convert credits to INR (adjust rate as needed — 1 credit = ₹10 by default)
    var txOpt = txSel.options[txSel.selectedIndex];
var actualPaid = parseFloat(txOpt.dataset.amountPaid) || 0;
var inrAmt = actualPaid > 0 ? actualPaid : amt * 10;
g('invAmt').value = inrAmt > 0 ? inrAmt : '';
    if (desc) g('invDesc').value = desc;
    if (date) g('invDate').value = date;

    previewInvoice();
  }

  function previewInvoice() {
    var sel = g('invUserSel');
    var userName = _invExpertName || (sel && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].dataset.name : '') || 'Expert Name';
    var desc = g('invDesc').value;
    var amt = parseFloat(g('invAmt').value)||0;
    var date = g('invDate').value;
    var due = g('invDue').value;
    var notes = g('invNotes').value;

    if (!userName || userName === 'Expert Name') {
      g('invPreview').innerHTML = '<div class="empty"><h3>Select expert to preview</h3></div>';
      return;
    }

    // Tax rate — ALWAYS read live from select, never hardcode 18
    var taxRateSel = g('invTaxRate');
    var taxRate = 0; // default to 0, let user pick
    if (taxRateSel) {
      var tv = taxRateSel.value;
      if (tv === 'custom') {
        var ctEl = g('invCustomTax');
        taxRate = parseFloat((ctEl && ctEl.value) || '0') || 0;
      } else {
        taxRate = parseFloat(tv) || 0;
      }
    }
    var inv_no = 'WI-' + Date.now().toString().slice(-6);
    var taxAmt = (amt * taxRate / 100);
    var total = amt + taxAmt;
    var taxLabel = taxRate > 0 ? ('GST / Tax (' + taxRate + '%)') : 'Tax (Exempt)';
    var fmtDate = function(d) { return d ? new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '--'; };
    var fmtMoney = function(v) { return '&#8377;' + v.toFixed(2); };

    g('invPreview').innerHTML = '<div class="inv-preview">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">' +
        '<div><h2 style="font-size:22px;font-weight:800;color:#FC8019;margin-bottom:2px">WorkIndex</h2>' +
        '<div style="font-size:11px;color:#888;font-weight:600;letter-spacing:.08em">TAX INVOICE</div></div>' +
        '<div style="text-align:right;font-size:11px;color:#666">' +
          '<div>Invoice #: <strong style="color:#111">' + inv_no + '</strong></div>' +
          '<div>Date: ' + fmtDate(date) + '</div>' +
          '<div>Due: ' + fmtDate(due) + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:14px;padding:10px;background:#f9f9f9;border-radius:6px">' +
        '<div style="font-size:10px;color:#888;font-weight:700;text-transform:uppercase;margin-bottom:4px">Bill To</div>' +
        '<div style="font-weight:700;font-size:14px;color:#111">' + esc(userName) + '</div>' +
      '</div>' +
      '<div class="inv-row" style="font-weight:700;font-size:10px;color:#888;text-transform:uppercase"><span>Description</span><span>Amount</span></div>' +
      '<div class="inv-row"><span>' + esc(desc||'Professional Services') + '</span><span style="color:#111">' + fmtMoney(amt) + '</span></div>' +
      (taxRate > 0 ? '<div class="inv-tax-row"><span style="color:#888">' + taxLabel + '</span><span style="color:#888">' + fmtMoney(taxAmt) + '</span></div>' : '') +
      '<div class="inv-total" style="margin-top:8px;border-top:2px solid #FC8019;padding-top:10px"><span>Total Payable</span><span style="color:#FC8019">' + fmtMoney(total) + '</span></div>' +
      (notes ? '<div style="margin-top:12px;padding:8px;background:#f9f9f9;border-radius:5px;font-size:11px;color:#666"><strong>Notes:</strong> ' + esc(notes) + '</div>' : '') +
      '<div style="margin-top:16px;padding-top:10px;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:center">WorkIndex Platform · workindex-frontend.vercel.app</div>' +
    '</div>';
  }

  function genInvoice() {
    var preview = g('invPreview').querySelector('.inv-preview');
    if (!preview) { toast('Select an expert first', 'e'); return; }
    var w = window.open('', '_blank');
    w.document.write('<html><head><title>Invoice - WorkIndex</title><style>' +
      'body{font-family:system-ui;padding:30px;max-width:620px;margin:auto;color:#111}' +
      'h2{color:#FC8019;font-size:22px;font-weight:800;margin:0}' +
      '.inv-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:13px}' +
      '.inv-total{display:flex;justify-content:space-between;padding:10px 0;font-weight:800;font-size:16px;border-top:2px solid #FC8019;margin-top:8px}' +
      '@media print{body{padding:10px}}' +
    '</style></head><body>' + g('invPreview').innerHTML + '</body></html>');
    w.document.close();
    setTimeout(function() { w.print(); }, 600);
  }

  /* ═══ ACTIONS ════════════════════════════════════════════════════════════ */