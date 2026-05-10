// Split from app.js lines 3519-5166. app.js is kept as the untouched fallback.
// ─── CONTACT EXPERT ───
async function contactExpert(expertId, requestId, clientId) {
  showToast('Opening chat...', 'info');
  await startChat(requestId, expertId, clientId);
}

// ═══════════════════════════════════════════════════════════
//  ✅ NEW: EXPERT APPROACHES FEATURES
//  Added below to handle expert viewing their approaches
// ═══════════════════════════════════════════════════════════

// ─── LOAD EXPERT'S APPROACHES ───
async function loadMyApproaches() {
  try {
    // Load regular approaches
    const res = await fetch(`${API_URL}/approaches`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (data.success) {
      state.myApproaches = data.approaches || [];
    }

    // Load customer interest notifications
    const notifRes = await fetch(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const notifData = await notifRes.json();
    const interests = (notifData.notifications || []).filter(
      n => n.type === 'customer_interest'
    );

    renderMyApproaches(interests);
  } catch (error) {
    console.error('Load my approaches error:', error);
  }
}
// ─── RENDER EXPERT'S APPROACHES ───
function renderMyApproaches(interests = []) {
  const container = document.getElementById('approachesList');
  if (!container) return;

  // ── Customer Interested Section ──
  let interestHTML = '';
  if (interests.length > 0) {
    interestHTML = `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:16px; font-weight:700; color:var(--text); margin-bottom:12px;">
          🎯 Customer Interest (${interests.length})
        </h3>
        ${interests.map(n => {
          const d = n.data || {};
          const unlocked = d.unlocked;
          return `
            <div style="background:var(--bg); border:2px solid ${unlocked ? '#22c55e' : 'var(--primary)'}; border-radius:14px; padding:16px; margin-bottom:12px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                <span style="font-size:14px; font-weight:700; color:var(--text);">🎯 Client wants to hire you</span>
                <span style="font-size:11px; padding:3px 8px; border-radius:20px; background:${unlocked ? 'rgba(34,197,94,0.1)' : 'rgba(252,128,25,0.1)'}; color:${unlocked ? '#22c55e' : 'var(--primary)'}; font-weight:700;">
                  ${unlocked ? 'Unlocked' : '15 credits'}
                </span>
              </div>

              <div style="padding:12px; background:var(--bg-gray); border-radius:10px; margin-bottom:12px;">
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:6px;">Client contact:</div>
                ${unlocked ? `
                  <div style="font-size:15px; font-weight:700; color:var(--text); margin-bottom:4px;">
                    👤 ${d.clientName || 'Client'}
                  </div>
                  <div style="font-size:14px; color:#22c55e; margin-bottom:4px;">
                    📞 ${d.fullPhone || d.maskedPhone}
                  </div>
                  <div style="font-size:14px; color:#22c55e;">
                    ✉️ ${d.fullEmail || d.maskedEmail}
                  </div>
                ` : `
                  <div style="font-size:15px; font-weight:600; color:var(--text); margin-bottom:4px; letter-spacing:1px;">
                    📞 ${d.maskedPhone || '98XXXXXX21'}
                  </div>
                  <div style="font-size:15px; font-weight:600; color:var(--text); letter-spacing:1px;">
                    ✉️ ${d.maskedEmail || 'r****@gmail.com'}
                  </div>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:6px;">
                    🔒 Spend 15 credits to see full details
                  </div>
                `}
              </div>

              <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
                ${formatDate(n.createdAt)}
              </div>

              ${unlocked ? `
                <div style="display:flex; gap:8px; margin-bottom:8px;">
                  <a href="tel:${d.fullPhone}" style="flex:1; padding:10px; background:#22c55e; color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; text-align:center; text-decoration:none;">
                    📞 Call
                  </a>
                  <a href="mailto:${d.fullEmail}" style="flex:1; padding:10px; background:var(--primary); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; text-align:center; text-decoration:none;">
                    ✉️ Email
                  </a>
                </div>
                <div style="display:flex; gap:8px;">
                  <button onclick="viewClientDocumentsFromInterest('${d.clientId}')"
                    style="flex:1; padding:10px; border:1.5px solid var(--primary); border-radius:10px; background:transparent; color:var(--primary); font-size:12px; font-weight:700; cursor:pointer;">
                    📄 View Docs
                  </button>
                  <button onclick="messageClientFromInterest('${d.clientId}')"
                    style="flex:1; padding:10px; border:1.5px solid var(--border); border-radius:10px; background:transparent; color:var(--text); font-size:12px; font-weight:700; cursor:pointer;">
                    💬 Message
                  </button>
                </div>
              ` : `
                <button onclick="unlockInterest('${n._id}')"
                  style="width:100%; padding:12px; background:var(--primary); color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer;">
                  🔓 Unlock for 15 Credits
                </button>
              `}
            </div>
          `;
        }).join('')}
      </div>
      <hr style="border:none; border-top:1px solid var(--border); margin-bottom:20px;">
    `;
  }

  // ── Regular Approaches Section ──
  if (!state.myApproaches || state.myApproaches.length === 0) {
    container.innerHTML = interestHTML + `
      <div class="empty-state">
        <div class="empty-icon">💼</div>
        <h3 class="empty-title">No approaches yet</h3>
        <p class="empty-text">Approach requests to see them here</p>
      </div>
    `;
    return;
  }

  const statusColors = {
    pending: 'badge-warning',
    accepted: 'badge-success',
    rejected: 'badge-danger'
  };

  const allApproaches = state.myApproaches || [];
  const pagedApproaches = paginate(allApproaches, 'expertApproaches');

  container.innerHTML = interestHTML + `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <h3 style="font-size:18px;font-weight:800;color:var(--text);letter-spacing:-0.3px;">My Approaches</h3>
      <span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;background:var(--bg-gray);color:var(--text-muted);">${allApproaches.length} total</span>
    </div>
  ` + pagedApproaches.map(app => {
    const req = app.request;
    if (!req) return '';

    // Time ago
    const ago = (() => {
      if (!app.createdAt) return '';
      const diff = Date.now() - new Date(app.createdAt).getTime();
      const hrs = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (hrs < 1) return 'just now';
      if (hrs < 24) return hrs + 'h ago';
      if (days === 1) return 'Yesterday';
      return days + 'd ago';
    })();

    // Service color
    const svcColors = WI_SERVICES.colors;
    const svcColor = svcColors[(req.service || '').toLowerCase()] || '#FC8019';

    // Status config
    const stConfig = {
      pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  icon: '⏳' },
      accepted:  { label: 'Accepted',  color: '#16a34a', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.3)',   icon: '✅' },
      rejected:  { label: 'Rejected',  color: '#dc2626', bg: 'rgba(220,38,38,0.1)',   border: 'rgba(220,38,38,0.3)',   icon: '❌' },
      completed: { label: 'Completed', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.3)',  icon: '🏆' },
      withdrawn: { label: 'Withdrawn', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', icon: '↩️' }
    };
    const st = stConfig[app.status] || stConfig.pending;

    return `
      <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:12px;transition:all 0.2s;border-left:4px solid ${st.color};"
        onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)';this.style.transform='translateY(-1px)'"
        onmouseout="this.style.boxShadow='none';this.style.transform='translateY(0)'">

        <!-- Top strip -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-gray);border-bottom:1px solid var(--border);">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:${svcColor}18;color:${svcColor};text-transform:uppercase;letter-spacing:.04em;">${req.service || 'Service'}</span>
            <span style="font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:${st.bg};color:${st.color};border:1px solid ${st.border};">${st.icon} ${st.label}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:11px;color:var(--text-muted);">🕐 ${ago}</span>
            <span style="font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:rgba(252,128,25,0.1);color:var(--primary);">🔥 ${app.creditsSpent || 0} cr</span>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:14px;">
          <div style="margin-bottom:10px;">
            <h4 style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:5px;line-height:1.3;">${req.title || 'Service Request'}</h4>
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:20px;height:20px;border-radius:50%;background:${svcColor};color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${(req.client?.name || 'C').charAt(0).toUpperCase()}</div>
              <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${req.client?.name || 'Client'}</span>
              ${req.budget ? `<span style="font-size:11px;color:var(--text-muted);">· ₹${Number(req.budget).toLocaleString('en-IN')}</span>` : ''}
            </div>
          </div>

          <p style="font-size:13px;color:var(--text-light);line-height:1.6;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${app.message || req.description || ''}</p>

          ${app.status === 'pending'   ? `<div style="font-size:12px;color:#f59e0b;background:rgba(245,158,11,0.06);border-radius:8px;padding:8px 10px;margin-bottom:12px;">⏳ Waiting for client to review your proposal</div>` : ''}
          ${app.status === 'accepted'  ? `<div style="font-size:12px;color:#16a34a;background:rgba(22,163,74,0.06);border-radius:8px;padding:8px 10px;margin-bottom:12px;">✅ Client accepted! Check your chat for messages.</div>` : ''}
          ${app.status === 'rejected'  ? `<div style="font-size:12px;color:#dc2626;background:rgba(220,38,38,0.06);border-radius:8px;padding:8px 10px;margin-bottom:12px;">❌ Client chose another professional this time.</div>` : ''}
          ${app.status === 'completed' ? `<div style="font-size:12px;color:#3b82f6;background:rgba(59,130,246,0.06);border-radius:8px;padding:8px 10px;margin-bottom:12px;">🏆 Service completed successfully!</div>` : ''}

          <button onclick="showMyApproachDetail('${app._id}')"
            style="width:100%;padding:10px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text);font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;"
            onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'"
            onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text)'">
            View Details →
          </button>
        </div>
      </div>`;
  }).join('') + paginationControlsHTML(allApproaches, 'expertApproaches');
}
// ─── SHOW APPROACH DETAIL WITH CONTACT INFO ───
async function showMyApproachDetail(approachId) {
  try {
    const res = await fetch(`${API_URL}/approaches/${approachId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      const approach = data.approach;
      const request = approach.request;
      const client = approach.client;
      
      const modal = document.createElement('div');
      modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;';
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
      
      modal.innerHTML = `
        <div style="background: var(--bg); border-radius: 16px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text);">${request.title}</h2>
            <button onclick="this.closest('div').parentElement.remove()" style="padding: 8px; border: none; background: transparent; font-size: 24px; cursor: pointer; color: var(--text-muted);">×</button>
          </div>
          
          <div style="padding: 16px; background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #4CAF50; margin-bottom: 12px;">✅ Contact Unlocked</h3>
            <div style="font-size: 15px; color: var(--text); line-height: 1.8;">
              <div style="margin-bottom: 8px;"><strong>Client:</strong> ${client.name}</div>
              <div style="margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:${client.email}" style="color: var(--primary); text-decoration: none;">${client.email}</a></div>
              <div><strong>Phone:</strong> <a href="tel:${client.phone}" style="color: var(--primary); text-decoration: none;">${client.phone}</a></div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 12px;">Request Details</h3>
            <p style="font-size: 14px; color: var(--text-light); line-height: 1.6;">${request.description}</p>
          </div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: var(--text-muted); margin-bottom: 20px;">
            <span>📍 ${request.location}</span>
            <span>💰 ₹${request.budget || 'Negotiable'}</span>
            <span>⏱️ ${request.timeline || 'Flexible'}</span>
          </div>
          
          
<button onclick="viewClientDocuments('${client._id}', '${request._id}')" style="width: 100%; padding: 14px; border: 1.5px solid var(--primary); border-radius: 10px; background: transparent; color: var(--primary); font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 12px; transition: all 0.2s;" onmouseover="this.style.background='var(--primary)'; this.style.color='#fff'" onmouseout="this.style.background='transparent'; this.style.color='var(--primary)'">
  📄 View Client Documents
</button>

<button onclick="expertStartChat('${request._id}', '${state.user._id}', '${client._id}')" style="width: 100%; padding: 14px; border: none; border-radius: 10px; background: var(--primary); color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 12px;">
  💬 Message Client
</button>
          
          ${approach.quote ? `
          <div style="margin-bottom: 12px; padding: 12px; background: rgba(252,128,25,0.08); border-radius: 8px; display:flex; align-items:center; justify-content:space-between;">
            <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Your Quote</span>
            <span style="font-size: 22px; font-weight: 800; color: var(--primary);">₹${approach.quote.toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div style="padding: 12px; background: var(--bg-gray); border-radius: 8px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px;">Your message:</div>
            <div style="font-size: 14px; color: var(--text);">${approach.message}</div>
          </div>
          
          <div style="margin-top: 16px; padding: 12px; background: rgba(252, 128, 25, 0.1); border-radius: 8px; font-size: 13px; color: var(--text-muted);">
            <strong>Status:</strong> ${approach.status} • <strong>Credits spent:</strong> ${approach.creditsSpent}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    }
  } catch (error) {
    console.error('Show approach detail error:', error);
    showToast('Error loading approach details', 'error');
  }
}

async function viewClientDocuments(clientId, requestId) {
  try {
    showToast('Loading documents...', 'info');
    
    const res = await fetch(`${API_URL}/documents/client/${clientId}/request/${requestId}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    
    const data = await res.json();
    
    if (!data.success) { showToast(data.message || 'Failed to load documents', 'error'); return; }
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1001; padding: 20px;';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    const docsHTML = data.documents && data.documents.length > 0 ? data.documents.map(doc => {
      const sizeKB = (doc.fileSize / 1024).toFixed(1);
      const icon = doc.fileType === 'pdf' ? '📄' : doc.fileType === 'word' ? '📝' : doc.fileType === 'excel' ? '📊' : doc.fileType === 'image' ? '🖼️' : '📎';
      
      if (doc.hasAccess) {
        // ✅ Has access - show download
        return `
          <div style="padding: 16px; background: var(--bg-gray); border-radius: 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">${icon}</span>
              <div style="flex: 1;">
                <div style="font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 2px;">${doc.originalFileName}</div>
                <div style="font-size: 13px; color: var(--text-muted);">${sizeKB} KB • ${doc.fileType.toUpperCase()}</div>
                <div style="font-size: 12px; color: #4CAF50; margin-top: 2px;">✅ Access granted</div>
              </div>
              <button onclick="downloadDocument('${doc._id}')" style="padding: 8px 16px; background: var(--primary); color: #fff; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; border: none; cursor: pointer;">Download</button>
            </div>
          </div>
        `;
      } else if (doc.accessRequestStatus === 'pending') {
        // ⏳ Request sent, waiting
        return `
          <div style="padding: 16px; background: var(--bg-gray); border-radius: 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">${icon}</span>
              <div style="flex: 1;">
                <div style="font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 2px;">${doc.originalFileName}</div>
                <div style="font-size: 13px; color: var(--text-muted);">${sizeKB} KB • ${doc.fileType.toUpperCase()}</div>
                <div style="font-size: 12px; color: #f39c12; margin-top: 2px;">⏳ Access request pending</div>
              </div>
              <span style="padding: 8px 12px; background: rgba(243,156,18,0.1); color: #f39c12; border-radius: 8px; font-size: 12px; font-weight: 600;">Pending</span>
            </div>
          </div>
        `;
      } else if (doc.accessRequestStatus === 'rejected') {
        // ❌ Rejected
        return `
          <div style="padding: 16px; background: var(--bg-gray); border-radius: 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px;">${icon}</span>
              <div style="flex: 1;">
                <div style="font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 2px;">${doc.originalFileName}</div>
                <div style="font-size: 13px; color: var(--text-muted);">${sizeKB} KB • ${doc.fileType.toUpperCase()}</div>
                <div style="font-size: 12px; color: #e74c3c; margin-top: 2px;">❌ Access denied by client</div>
              </div>
            </div>
          </div>
        `;
      } else {
        // 🔒 Locked - show request access button
        return `
          <div style="padding: 16px; background: var(--bg-gray); border-radius: 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 32px; filter: grayscale(1); opacity: 0.5;">${icon}</span>
              <div style="flex: 1;">
                <div style="font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 2px;">${doc.originalFileName}</div>
                <div style="font-size: 13px; color: var(--text-muted);">${sizeKB} KB • ${doc.fileType.toUpperCase()}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">🔒 Access required</div>
              </div>
              <button onclick="requestDocumentAccess('${doc._id}', '${clientId}', '${requestId}')" style="padding: 8px 12px; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer;">Request Access</button>
            </div>
          </div>
        `;
      }
    }).join('') : `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
        <h3 style="font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 8px;">No documents yet</h3>
        <p style="font-size: 14px; color: var(--text-muted);">Client hasn't uploaded any documents</p>
      </div>
    `;
    
    modal.innerHTML = `
      <div style="background: var(--bg); border-radius: 16px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto; padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="font-size: 20px; font-weight: 700; color: var(--text);">Client Documents</h2>
          <button onclick="this.closest('[style*=fixed]').remove()" style="border: none; background: none; font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div style="padding: 12px; background: rgba(252,128,25,0.1); border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: var(--text-muted);">
          🔒 Documents require client approval before you can download them
        </div>
        ${docsHTML}
      </div>
    `;
    
    document.body.appendChild(modal);
    
  } catch (error) {
    console.error('View documents error:', error);
    showToast('Error loading documents', 'error');
  }
}

async function requestDocumentAccess(documentId, clientId, requestId) {
  try {
    // Step 1: Get the expert's approach for this request
    const approachRes = await fetch(`${API_URL}/approaches`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const approachData = await approachRes.json();
    
    if (!approachData.success) {
      showToast('Could not find your approach', 'error');
      return;
    }

    // Find the approach matching this requestId
    const approach = approachData.approaches && approachData.approaches.find(a => {
      const approachRequestId = a.request?._id || a.request;
      return approachRequestId && approachRequestId.toString() === requestId.toString();
    });

    if (!approach) {
      showToast('Could not find your approach for this request', 'error');
      return;
    }

    // Step 2: Send access request with all required fields
    const res = await fetch(`${API_URL}/access-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentId: documentId,
        approachId: approach._id,
        message: 'I would like to access this document for your request.'
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      showToast('Access request sent to client!', 'success');
      // Refresh documents modal
      document.querySelectorAll('[style*="position: fixed"]').forEach(m => {
        if (m.style.zIndex === '1001') m.remove();
      });
      viewClientDocuments(clientId, requestId);
    } else {
      showToast(data.message || 'Failed to send request', 'error');
    }
  } catch (error) {
    console.error('Request access error:', error);
    showToast('Failed to send access request', 'error');
  }
}

// ─── LOAD SETTINGS ─── 
function wireNotificationToggle(toggleId, prefKey, enabledText, disabledText) {
  const toggle = document.getElementById(toggleId);
  if (!toggle || !state.user) return;
  const notifPrefs = state.user.preferences && state.user.preferences.notifications;
  const prefValue = notifPrefs && notifPrefs[prefKey];
  toggle.checked = prefValue !== false;
  toggle.onchange = async function() {
    const enabled = this.checked;
    try {
      const res = await fetch(`${API_URL}/users/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notifications: { [prefKey]: enabled } })
      });
      const data = await res.json();
      if (data.success) {
        if (!state.user.preferences) state.user.preferences = {};
        if (!state.user.preferences.notifications) state.user.preferences.notifications = {};
        state.user.preferences.notifications[prefKey] = enabled;
        localStorage.setItem('user', JSON.stringify(state.user));
        showToast(enabled ? enabledText : disabledText, 'success');
      } else {
        showToast('Failed to save preference', 'error');
        this.checked = !enabled;
      }
    } catch(err) {
      showToast('Network error', 'error');
      this.checked = !enabled;
    }
  };
}

function loadSettings() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
  }
// Load email notification preference
  const emailToggle = document.getElementById('emailNotif');
  if (false && emailToggle && state.user) {
    // Check from state.user.preferences first
    const emailPref = state.user.preferences &&
                      state.user.preferences.notifications &&
                      state.user.preferences.notifications.email;
    // Default to true if not set
    emailToggle.checked = (emailPref !== false);

    // Wire the toggle to save preference
    emailToggle.onchange = async function() {
      const enabled = this.checked;
      try {
        const res = await fetch(`${API_URL}/users/preferences`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notifications: { email: enabled } })
        });
        const data = await res.json();
        if (data.success) {
          // Update local state
          if (!state.user.preferences) state.user.preferences = {};
          if (!state.user.preferences.notifications) state.user.preferences.notifications = {};
          state.user.preferences.notifications.email = enabled;
          localStorage.setItem('user', JSON.stringify(state.user));
          showToast(enabled ? 'Email notifications enabled' : 'Email notifications disabled', 'success');
        } else {
          showToast('Failed to save preference', 'error');
          this.checked = !enabled; // revert toggle
        }
      } catch(err) {
        showToast('Network error', 'error');
        this.checked = !enabled; // revert toggle
      }
    };
  }
   
  // Populate user info
  if (state.user) {
    const u = state.user;
    const av = document.getElementById('settingsAvatar');
    const nm = document.getElementById('settingsName');
    const em = document.getElementById('settingsEmail');
    const rl = document.getElementById('settingsRole');
    if (av) av.textContent = (u.name || '?').charAt(0).toUpperCase();
    if (nm) nm.textContent = u.name || 'My Account';
    if (em) em.textContent = u.email || '';
    if (rl) rl.textContent = u.role === 'expert' ? 'Professional' : 'Customer';
    // Sync profile photo
    if (u.profilePhoto && av) {
      av.innerHTML = `<img src="${u.profilePhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }
  }
}

// ─── INIT ON PAGE LOAD ─── 
document.addEventListener('DOMContentLoaded', () => {
  // ── Public routes — bypass auth entirely ──
  if (window.location.pathname.startsWith('/expert/')) {
    loadPublicExpertPage();
    return;
  }

  initDarkMode();
   
  // ── Handle back/forward browser buttons ──
  window.addEventListener('popstate', (e) => {
    if (e.state?.pageId) {
      showPage(e.state.pageId, false);
    } else {
      navigateToPath(window.location.pathname, false);
    }
  });

  // ── Route on initial load ──
  const initialPath = window.location.pathname;

  if (state.token && state.user) {
  const authedRoutes = ['/settings', '/my-tickets', '/dashboard'];
  if (authedRoutes.includes(initialPath)) {
    navigateToPath(initialPath, false);
    // ─── Start inactivity watcher on page reload too ───
    startInactivityWatcher();
    loadNotifications();
    if (notificationInterval) clearInterval(notificationInterval);
    notificationInterval = setInterval(loadNotifications, 30000);
  } else {
    enterDashboard();
  }
} 
  else {
    navigateToPath(initialPath, false);
  }
});

// ── Path → pageId mapper ──
function navigateToPath(path, pushState = true) {
  const pathToPage = {
    '/':                   'landing',
    '/find-professionals': 'findProfessionals',
    '/how-it-works':       'howItWorks',
    '/pricing':            'pricing',
    '/dashboard':          state.user?.role === 'client' ? 'clientDash' : 'expertDash',
    '/settings':           'settings',
    '/my-tickets':         'myTickets',
       '/credits-history':    'creditsHistory',
  };

  const pageId = pathToPage[path] || 'landing';

  // Guard protected routes
  const protectedPages = ['clientDash', 'expertDash', 'settings', 'myTickets', 'creditsHistory'];
  if (protectedPages.includes(pageId) && !state.token) {
    showPage('landing', pushState);
    return;
  }

  showPage(pageId, pushState);
}
// ─── SERVICE RECEIVED CONFIRMATION ───
function confirmServiceReceived(requestId, expertId, expertName, approachId) {
  // Close current modal first
  document.querySelectorAll('[style*="position: fixed"]').forEach(m => {
    if (m.style.zIndex === '1000') m.remove();
  });

  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background: var(--bg); border-radius: 16px; max-width: 400px; width: 100%; padding: 28px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
      <h2 style="font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 8px;">Service Received?</h2>
      <p style="font-size: 15px; color: var(--text-muted); margin-bottom: 24px;">Did <strong>${expertName}</strong> complete the service for you?</p>
      
      <div style="display: flex; gap: 12px;">
        <button onclick="markServiceComplete('${requestId}', '${expertId}', '${expertName}', '${approachId}')" 
          style="flex: 1; padding: 14px; border: none; border-radius: 12px; background: #4CAF50; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;">
          ✓ Yes
        </button>
        <button onclick="this.closest('[style*=fixed]').remove()" 
          style="flex: 1; padding: 14px; border: 1.5px solid var(--border); border-radius: 12px; background: transparent; color: var(--text); font-size: 16px; font-weight: 600; cursor: pointer;">
          ✕ No
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// ─── MARK SERVICE COMPLETE & GO TO RATING ───
async function markServiceComplete(requestId, expertId, expertName, approachId) {
  try {
    // Close confirmation modal
    document.querySelectorAll('[style*="position: fixed"]').forEach(m => {
      if (m.style.zIndex === '1000') m.remove();
    });

    // Mark request as completed
    const res = await fetch(`${API_URL}/requests/${requestId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expertId })
    });

    const data = await res.json();

    if (data.success) {
      showToast('Request marked as completed!', 'success');
    }
    // Even if completion fails, still show rating modal
    
    // Reload client data in background
    loadClientData();

    // Show rating modal
    setTimeout(() => {
      showRatingPrompt(expertId, expertName, requestId, approachId);
    }, 500);

  } catch (error) {
    console.error('Mark complete error:', error);
    // Still show rating even if API fails
    showRatingPrompt(expertId, expertName, requestId, approachId);
  }
}

// ─── RATING PROMPT AFTER SERVICE ───
function showRatingPrompt(expertId, expertName, requestId, approachId) {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;';

  modal.innerHTML = `
    <div style="background: var(--bg); border-radius: 16px; max-width: 400px; width: 100%; padding: 28px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">⭐</div>
      <h2 style="font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 8px;">Rate ${expertName}</h2>
      <p style="font-size: 15px; color: var(--text-muted); margin-bottom: 24px;">How was your experience? Your review helps others find great professionals.</p>
      
      <div style="display: flex; gap: 12px;">
        <button id="rateNowBtn" style="flex: 1; padding: 14px; border: none; border-radius: 12px; background: var(--primary); color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;">
          ⭐ Rate Now
        </button>
        <button onclick="this.closest('[style*=fixed]').remove()" 
          style="flex: 1; padding: 14px; border: 1.5px solid var(--border); border-radius: 12px; background: transparent; color: var(--text); font-size: 15px; font-weight: 600; cursor: pointer;">
          Skip
        </button>
      </div>
    </div>
  `;

  // Use addEventListener to avoid inline quote escaping issues
  modal.querySelector('#rateNowBtn').addEventListener('click', function() {
    modal.remove();
    openRatingModal(expertId, expertName, approachId, requestId);
  });

  document.body.appendChild(modal);
}
// ═══════════════════════════════════════════════════════════
//  EXPERT PROFILE ENHANCEMENT — COMPLETE REPLACEMENT
//  Replace the existing renderExpertProfile() in app.js
//  Also add all new functions below it
// ═══════════════════════════════════════════════════════════

// ─── PROFILE STRENGTH CALCULATOR ───
function calculateProfileStrength(user, profile) {
  const scores = {
    basic: { earned: 0, max: 40, items: [] },
    professional: { earned: 0, max: 40, items: [] },
    trust: { earned: 0, max: 10, items: [] },
    response: { earned: 0, max: 10, items: [] }
  };

  // ── BASIC INFO (40%) ──
  // Support both old BARK keys and new WI keys
  const bio = profile.bio || profile.expert_bio || '';
  const specialization = profile.specialization || profile.expert_specialization || '';
  const city = profile.city || profile.expert_city || '';
  const pincode = profile.pincode || profile.expert_pincode || '';

  if (user.profilePhoto)                        { scores.basic.earned += 10; scores.basic.items.push({ done: true,  label: 'Profile photo' }); }
  else                                          {                             scores.basic.items.push({ done: false, label: 'Profile photo' }); }
  if (bio && bio.length >= 30)                  { scores.basic.earned += 10; scores.basic.items.push({ done: true,  label: 'Bio (30+ chars)' }); }
  else                                          {                             scores.basic.items.push({ done: false, label: 'Bio (30+ chars)' }); }
  if (specialization)                           { scores.basic.earned += 10; scores.basic.items.push({ done: true,  label: 'Specialization' }); }
  else                                          {                             scores.basic.items.push({ done: false, label: 'Specialization' }); }
  if (city && pincode)                          { scores.basic.earned += 10; scores.basic.items.push({ done: true,  label: 'Location (city + pincode)' }); }
  else                                          {                             scores.basic.items.push({ done: false, label: 'Location (city + pincode)' }); }

  // ── PROFESSIONAL DETAILS (40%) ──
  const profItems = [
    { key: 'gstNumber',          label: 'GST number',           points: 8  },
    { key: 'licenseNumber',      label: 'Professional license', points: 8  },
    { key: 'certificationNumber',label: 'Certification number', points: 8  },
    { key: 'education',          label: 'Education details',    points: 8  },
    { key: 'portfolio',          label: 'Portfolio / Proof of work', points: 8 },
  ];
  profItems.forEach(item => {
    const val = profile[item.key];
    const done = val && (typeof val === 'string' ? val.trim().length > 0 : true);
    if (done) scores.professional.earned += item.points;
    scores.professional.items.push({ done, label: item.label, points: item.points });
  });

  // ── TRUST SIGNALS (10%) ──
  const hasReview = (user.reviewCount || 0) >= 1;
  const hasApproach = (user.totalApproaches || 0) >= 1 || (state.myApproaches && state.myApproaches.length >= 1);
  if (hasReview)  { scores.trust.earned += 5;  scores.trust.items.push({ done: true,  label: 'Min 1 client review' }); }
  else            {                             scores.trust.items.push({ done: false, label: 'Min 1 client review' }); }
  if (hasApproach){ scores.trust.earned += 5;  scores.trust.items.push({ done: true,  label: 'Min 1 approach sent' }); }
  else            {                             scores.trust.items.push({ done: false, label: 'Min 1 approach sent' }); }

  // ── RESPONSE RATE (10%) ──
  const responseRate = user.responseRate || 0;
  if (responseRate >= 80)       { scores.response.earned = 10; scores.response.items.push({ done: true,  label: `Response rate: ${responseRate}%` }); }
  else if (responseRate >= 50)  { scores.response.earned = 5;  scores.response.items.push({ done: false, label: `Response rate: ${responseRate}% (need 80%+)` }); }
  else                          {                               scores.response.items.push({ done: false, label: 'Response rate (approach more requests)' }); }

  const total = scores.basic.earned + scores.professional.earned + scores.trust.earned + scores.response.earned;

  return { total, scores };
}

function getStrengthLabel(pct) {
  if (pct >= 90) return { label: 'Elite', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
  if (pct >= 70) return { label: 'Strong', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
  if (pct >= 50) return { label: 'Good',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  if (pct >= 30) return { label: 'Fair',   color: '#f97316', bg: 'rgba(249,115,22,0.12)' };
  return                { label: 'Starter', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
}

function showExpertProfileCompletionPromptIfNeeded() {
  if (!state.user || state.user.role !== 'expert') return;
  if (document.getElementById('expertProfilePromptModal')) return;
  if (sessionStorage.getItem('expertProfilePromptSkipped_' + state.user._id) === 'true') return;
  if (typeof calculateProfileStrength !== 'function') return;

  const profile = state.user.profile || {};
  const result = calculateProfileStrength(state.user, profile);
  if (!result || result.total >= 50) return;

  const missing = [];
  Object.keys(result.scores || {}).forEach(key => {
    (result.scores[key].items || []).forEach(item => {
      if (!item.done && missing.length < 3) missing.push(item.label);
    });
  });

  const modal = document.createElement('div');
  modal.id = 'expertProfilePromptModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;';
  modal.innerHTML =
    '<div style="width:min(440px,100%);background:var(--bg);border:1px solid var(--border);border-radius:8px;box-shadow:0 18px 48px rgba(0,0,0,.25);padding:22px;">' +
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px;">' +
        '<div>' +
          '<div style="font-size:12px;font-weight:800;color:var(--primary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">Profile score ' + result.total + '%</div>' +
          '<h3 style="margin:0;font-size:21px;line-height:1.25;color:var(--text);">Complete at least 50% profile to approach clients</h3>' +
        '</div>' +
        '<button type="button" onclick="dismissExpertProfilePrompt()" style="border:0;background:transparent;color:var(--text-muted);font-size:24px;line-height:1;cursor:pointer;">&times;</button>' +
      '</div>' +
      '<p style="margin:0 0 14px;color:var(--text-muted);font-size:14px;line-height:1.6;">Clients trust approaches more when the expert profile has enough detail. Add a few trust details before sending quotes.</p>' +
      (missing.length ? '<div style="background:var(--bg-gray);border-radius:8px;padding:12px 14px;margin-bottom:16px;"><div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:8px;">Suggested next steps</div>' + missing.map(item => '<div style="font-size:13px;color:var(--text-muted);padding:3px 0;">- ' + item + '</div>').join('') + '</div>' : '') +
      '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
        '<button type="button" class="btn btn-secondary" onclick="dismissExpertProfilePrompt()">Skip</button>' +
        '<button type="button" class="btn btn-primary" onclick="goToExpertProfileFromPrompt()">Go to Profile</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function dismissExpertProfilePrompt() {
  if (state.user && state.user._id) {
    sessionStorage.setItem('expertProfilePromptSkipped_' + state.user._id, 'true');
  }
  wireNotificationToggle('emailNotif', 'email', 'Email notifications enabled', 'Email notifications disabled');
  wireNotificationToggle('smsNotif', 'sms', 'SMS notifications enabled', 'SMS notifications disabled');
  wireNotificationToggle('newPostNotif', 'newPosts', 'New request emails enabled', 'New request emails disabled');
  const newPostRow = document.getElementById('newPostNotifRow');
  if (newPostRow) newPostRow.style.display = state.user && state.user.role === 'expert' ? 'flex' : 'none';
  const modal = document.getElementById('expertProfilePromptModal');
  if (modal) modal.remove();
}

function goToExpertProfileFromPrompt() {
  dismissExpertProfilePrompt();
  showPage('expertDash');
  switchTab('profile');
}

function renderStrengthMeter(user, profile) {
  const { total, scores } = calculateProfileStrength(user, profile);
  const { label, color, bg } = getStrengthLabel(total);

  // Ring SVG
  const radius = 32, circ = 2 * Math.PI * radius;
  const dash = (total / 100) * circ;

  const sections = [
    { key: 'basic',        icon: '👤', title: 'Basic Info',           pct: 40 },
    { key: 'professional', icon: '💼', title: 'Professional Details', pct: 40 },
    { key: 'trust',        icon: '🛡️', title: 'Trust Signals',        pct: 10 },
    { key: 'response',     icon: '⚡', title: 'Response Rate',        pct: 10 },
  ];

  const sectionsHTML = sections.map(s => {
    const sec = scores[s.key];
    const secPct = Math.round((sec.earned / sec.max) * 100);
    const itemsHTML = sec.items.map(i =>
      `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
        <span style="font-size:13px;color:${i.done ? '#10b981' : '#cbd5e1'};">${i.done ? '✓' : '○'}</span>
        <span style="font-size:13px;color:${i.done ? 'var(--text)' : 'var(--text-muted)'};">${i.label}</span>
      </div>`
    ).join('');

    return `
      <details style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:8px;">
        <summary style="padding:12px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;list-style:none;user-select:none;">
          <span style="font-size:16px;">${s.icon}</span>
          <span style="flex:1;font-size:14px;font-weight:600;color:var(--text);">${s.title}</span>
          <span style="font-size:12px;font-weight:700;color:${sec.earned === sec.max ? '#10b981' : color};">${sec.earned}/${sec.max}pts</span>
        </summary>
        <div style="padding:4px 14px 12px 14px;border-top:1px solid var(--border);">${itemsHTML}</div>
      </details>`;
  }).join('');

  return `
    <div id="profileStrengthMeter" style="background:var(--bg);border:1.5px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
        <!-- Ring -->
        <div style="position:relative;flex-shrink:0;width:80px;height:80px;">
          <svg width="80" height="80" style="transform:rotate(-90deg);">
            <circle cx="40" cy="40" r="${radius}" fill="none" stroke="var(--border)" stroke-width="7"/>
            <circle cx="40" cy="40" r="${radius}" fill="none" stroke="${color}" stroke-width="7"
              stroke-dasharray="${dash} ${circ}" stroke-linecap="round"
              style="transition:stroke-dasharray 0.8s ease;"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:18px;font-weight:800;color:var(--text);line-height:1;">${total}</span>
            <span style="font-size:9px;color:var(--text-muted);font-weight:600;">/ 100</span>
          </div>
        </div>
        <!-- Label + bar -->
        <div style="flex:1;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:16px;font-weight:700;color:var(--text);">Profile Strength</span>
            <span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${bg};color:${color};">${label}</span>
          </div>
          <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${total}%;background:${color};border-radius:4px;transition:width 0.8s ease;"></div>
          </div>
          <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">
            ${total < 100 ? `Complete your profile to attract more clients` : '🎉 Perfect profile!'}
          </p>
        </div>
      </div>
      <!-- Breakdown accordion -->
      <div>${sectionsHTML}</div>
    </div>`;
}

// ─── KYC STATUS BADGE ───
function kycBadgeHTML(status) {
  const map = {
    not_submitted: { icon: '📋', text: 'Not submitted',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    pending:       { icon: '⏳', text: 'Under review',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
    approved:      { icon: '✅', text: 'KYC Verified',   color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
    rejected:      { icon: '❌', text: 'Rejected - resubmit', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const s = map[status] || map.not_submitted;
  return `<span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${s.bg};color:${s.color};">${s.icon} ${s.text}</span>`;
}

// ─── RENDER EXPERT PROFILE (FULL REPLACEMENT) ───
function renderExpertProfile() {
  if (!state.user) return;

  const user    = state.user;
  const profile = user.profile || {};
  // Normalize new WI questionnaire keys to profile display keys
  if (!profile.bio && profile.expert_bio)                       profile.bio = profile.expert_bio;
  if (!profile.specialization && profile.expert_specialization) profile.specialization = profile.expert_specialization;
  // Support both flat keys and nested address object from expert_location_details
const locDetails = profile.expert_location_details;
if (locDetails && typeof locDetails === 'object') {
  if (!profile.city)    profile.city    = locDetails.city    || profile.expert_city    || '';
  if (!profile.pincode) profile.pincode = locDetails.pincode || profile.expert_pincode || '';
  if (!profile.state)   profile.state   = locDetails.state   || profile.expert_state   || '';
} else {
  if (!profile.city    && profile.expert_city)    profile.city    = profile.expert_city;
  if (!profile.pincode && profile.expert_pincode) profile.pincode = profile.expert_pincode;
  if (!profile.state   && profile.expert_state)   profile.state   = profile.expert_state;
}
  if (!profile.experience && profile.expert_experience)         profile.experience = profile.expert_experience;
   if (!profile.businessType && profile.expert_business_type)    profile.businessType = profile.expert_business_type;
  if (!profile.teamSize && profile.expert_team_size)            profile.teamSize = profile.expert_team_size;
  if (!profile.servicesOffered && profile.expert_services)      profile.servicesOffered = profile.expert_services;
  if (!profile.serviceLocationType && profile.expert_location)  profile.serviceLocationType = profile.expert_location;
  const kyc     = user.kyc    || {};

  const profileTab = document.getElementById('expertProfileTab');
  if (!profileTab) return;

  // Service display labels
  const serviceLabels = WI_SERVICES.labels;
  const locationLabels = { online: '💻 Online / Remote', local: '📍 Local (in-person)', both: '🌐 Both online & in-person' };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently joined';

  // Services badges
  const servicesBadges = (profile.servicesOffered || []).map(s =>
    `<span style="padding:5px 12px;background:rgba(252,128,25,0.1);color:var(--primary);border-radius:20px;font-size:13px;font-weight:600;">${serviceLabels[s] || s}</span>`
  ).join('');

  profileTab.innerHTML = `
    <!-- ── PROFILE HERO ── -->
    <div style="background:linear-gradient(135deg,rgba(252,128,25,0.08),rgba(252,128,25,0.02));border-bottom:1px solid var(--border);padding:28px 20px 20px;text-align:center;">
      <!-- Avatar -->
      <div style="position:relative;display:inline-block;margin-bottom:14px;">
        <div id="expertProfileAvatar" style="width:88px;height:88px;border-radius:50%;background:var(--primary);color:#fff;font-size:28px;font-weight:800;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 16px rgba(252,128,25,0.25);overflow:hidden;margin:0 auto;">
          ${user.profilePhoto ? `<img src="${user.profilePhoto}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;">` : (user.name || 'E').substring(0,2).toUpperCase()}
        </div>
        <button onclick="document.getElementById('expertPhotoInput').click()"
          style="position:absolute;bottom:2px;right:2px;width:26px;height:26px;border-radius:50%;background:var(--primary);color:#fff;border:2px solid var(--bg);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);">📷</button>
        <input type="file" id="expertPhotoInput" style="display:none;" accept="image/*" onchange="uploadProfilePhoto(event)">
        <!-- Online indicator -->
        <span style="position:absolute;top:4px;right:4px;width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid var(--bg);"></span>
      </div>

      <!-- Name + role -->
      <h2 style="font-size:22px;font-weight:800;color:var(--text);margin:0 0 3px;" id="expertProfileName">${user.name || 'Expert'}</h2>
      ${profile.specialization ? `<p style="font-size:14px;font-weight:600;color:var(--primary);margin:0 0 3px;">${profile.specialization}</p>` : ''}
      <p style="font-size:13px;color:var(--text-muted);margin:0 0 14px;" id="expertProfileEmail">${user.email || ''}</p>

      <!-- Stat pills row -->
      <div style="display:inline-flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:16px;">
        ${user.rating ? `<span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;background:rgba(245,158,11,0.1);color:#b45309;">⭐ ${Number(user.rating).toFixed(1)} (${user.reviewCount || 0})</span>` : ''}
        <span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;background:rgba(252,128,25,0.1);color:var(--primary);">💎 ${user.credits || 0} credits</span>
        ${profile.city ? `<span style="font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;background:var(--bg-gray);color:var(--text-muted);">📍 ${profile.city}</span>` : ''}
        ${(user.kyc && user.kyc.status === 'approved') ? `<span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;background:rgba(22,163,74,0.1);color:#16a34a;">✅ KYC Verified</span>` : ''}
      </div>

      <!-- Share button -->
      <button onclick="openPublicProfile('${user._id}')"
        style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:11px;border:1.5px solid var(--primary);border-radius:10px;background:transparent;color:var(--primary);font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;"
        onmouseover="this.style.background='rgba(252,128,25,0.06)'"
        onmouseout="this.style.background='transparent'">
        🔗 Share My Profile
      </button>
    </div>
    
    <div style="padding:0 20px 40px;">
<!-- ── BASIC INFO (EDITABLE) ── -->
      <div class="settings-section" style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <h3 class="settings-section-title" style="margin:0;">👤 Basic Info</h3>
          <button onclick="toggleBasicEditMode()" id="basicEditBtn" style="padding:6px 14px;border:1.5px solid var(--primary);border-radius:8px;background:transparent;color:var(--primary);font-size:13px;font-weight:600;cursor:pointer;">✏️ Edit</button>
        </div>

        <div style="padding:12px 0;border-bottom:1px solid var(--border);" class="basic-field-row">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Full Name</div>
          <div id="basic_display_name" style="font-size:14px;font-weight:500;color:var(--text);">${user.name || 'Not set'}</div>
          <input id="basic_edit_name" type="text" value="${user.name || ''}" style="display:none;width:100%;padding:10px 12px;border:1.5px solid var(--primary);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text);box-sizing:border-box;">
        </div>

        <div style="padding:12px 0;border-bottom:1px solid var(--border);" class="basic-field-row">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">City</div>
          <div id="basic_display_city" style="font-size:14px;font-weight:500;color:var(--text);">${profile.city || user.location?.city || '<span style="color:var(--text-muted);font-style:italic;">Not set</span>'}</div>
          <input id="basic_edit_city" type="text" value="${profile.city || user.location?.city || ''}" placeholder="e.g. Bengaluru" style="display:none;width:100%;padding:10px 12px;border:1.5px solid var(--primary);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text);box-sizing:border-box;">
        </div>

        <div style="padding:12px 0;border-bottom:1px solid var(--border);" class="basic-field-row">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Pincode</div>
          <div id="basic_display_pincode" style="font-size:14px;font-weight:500;color:var(--text);">${profile.pincode || user.location?.pincode || '<span style="color:var(--text-muted);font-style:italic;">Not set</span>'}</div>
          <input id="basic_edit_pincode" type="text" value="${profile.pincode || user.location?.pincode || ''}" placeholder="e.g. 560001" maxlength="6" style="display:none;width:100%;padding:10px 12px;border:1.5px solid var(--primary);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text);box-sizing:border-box;">
        </div>

        <div style="padding:12px 0;border-bottom:1px solid var(--border);" class="basic-field-row">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">State</div>
          <div id="basic_display_state" style="font-size:14px;font-weight:500;color:var(--text);">${profile.state || user.location?.state || '<span style="color:var(--text-muted);font-style:italic;">Not set</span>'}</div>
          <input id="basic_edit_state" type="text" value="${profile.state || user.location?.state || ''}" placeholder="e.g. Karnataka" style="display:none;width:100%;padding:10px 12px;border:1.5px solid var(--primary);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text);box-sizing:border-box;">
        </div>

        <div id="basicSaveRow" style="display:none;margin-top:16px;">
          <button onclick="saveBasicInfo()" style="width:100%;padding:14px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">💾 Save Basic Info</button>
        </div>
      </div>

      <!-- ── PROFILE STRENGTH ── -->
      ${renderStrengthMeter(user, profile)}

      <!-- ── KYC VERIFICATION ── -->
      <div class="settings-section" style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <h3 class="settings-section-title" style="margin:0;">🛡️ KYC Verification</h3>
          ${kycBadgeHTML(kyc.status || 'not_submitted')}
        </div>
        ${kyc.status === 'approved' ? `
          <div style="padding:12px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:10px;font-size:13px;color:#10b981;">
            Your identity has been verified. A ✅ verified badge appears on your public profile.
          </div>
        ` : kyc.status === 'pending' ? `
          <div style="padding:12px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:10px;font-size:13px;color:#f59e0b;">
            ⏳ Documents submitted. Admin will review within 24–48 hours.
          </div>
        ` : `
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:14px;">Upload one government ID to get a verified badge on your profile. Verified experts get 3× more client trust.</p>
          <!-- Step 1: Pick doc type -->
          <!-- Submit KYC button — shown first, hides on click -->
          <button id="kycStartBtn" onclick="showKycOptions()"
            style="width:100%;padding:12px;border:none;border-radius:10px;background:var(--primary);color:#fff;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:4px;">
            📋 Submit KYC Documents
          </button>

          <div id="kycStep1" style="display:none;">
            <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Select document type to upload:</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px;">
            ${['Aadhaar Card','PAN Card','Voter ID','Driving License'].map(doc => `
                <label id="kyc_label_${doc.replace(/\s/g,'_')}"
                  style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.2s;"
                  onmouseover="this.style.borderColor='var(--primary)'"
                  onmouseout="if(window._kycSelected!=='${doc}')this.style.borderColor='var(--border)'">
                  <input type="radio" name="kycDocType" value="${doc}" onchange="selectKycDocType('${doc}')" style="accent-color:var(--primary);">
                  ${doc}
                </label>`).join('')}
            </div>
          </div>
          <div id="kycUploadArea" style="display:none;margin-top:12px;">
            <div id="kycPreview" style="display:none;margin-bottom:10px;"></div>
            <label style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px;border:2px dashed var(--border);border-radius:12px;cursor:pointer;background:var(--bg-gray);" onclick="document.getElementById('kycFileInput').click()">
              <span style="font-size:32px;">📄</span>
              <span style="font-size:14px;font-weight:600;color:var(--text);">Tap to upload document</span>
              <span style="font-size:12px;color:var(--text-muted);">JPG, PNG or PDF • Max 5MB</span>
            </label>
            <input type="file" id="kycFileInput" style="display:none;" accept="image/*,.pdf" onchange="previewKycDoc(event)">
            <button id="kycSubmitBtn" onclick="submitKycDocument()" style="display:none;width:100%;margin-top:12px;padding:14px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">
              🛡️ Submit for Verification
            </button>
          </div>
          ${kyc.status === 'rejected' ? `
            <div style="padding:10px 12px;background:rgba(239,68,68,0.08);border-radius:8px;font-size:13px;color:#ef4444;margin-top:8px;">
              ❌ Rejection reason: ${kyc.rejectionReason || 'Document unclear or unreadable. Please resubmit.'}
            </div>` : ''}
        `}
      </div>

      <!-- ── SERVICES OFFERED ── -->
      ${(profile.servicesOffered || []).length > 0 ? `
        <div class="settings-section" style="margin-bottom:20px;">
          <h3 class="settings-section-title">Services Offered</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">${servicesBadges}</div>
        </div>` : ''}

      <!-- ── PROFESSIONAL DETAILS (inline editable) ── -->
      <div class="settings-section" style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <h3 class="settings-section-title" style="margin:0;">💼 Professional Details</h3>
          <button onclick="toggleEditMode()" id="editModeBtn" style="padding:6px 14px;border:1.5px solid var(--primary);border-radius:8px;background:transparent;color:var(--primary);font-size:13px;font-weight:600;cursor:pointer;">✏️ Edit</button>
        </div>

        ${renderInlineField('specialization', 'Specialization', profile.specialization, 'text', 'e.g. Chartered Accountant')}
        ${renderInlineField('experience', 'Experience', profile.experience, 'text', 'e.g. 5-10 years')}
        ${renderInlineField('certificationNumber', 'Certification Number', profile.certificationNumber, 'text', 'e.g. ICAI-MRN-123456')}
        ${renderInlineField('gstNumber', 'GST Number', profile.gstNumber, 'text', 'e.g. 29ABCDE1234F1Z5')}
        ${renderInlineField('licenseNumber', 'Professional License No.', profile.licenseNumber, 'text', 'e.g. LIC/2023/00123')}
        ${renderInlineField('education', 'Education', profile.education, 'text', 'e.g. B.Com, CA Final')}
        ${renderInlineField('professionalAddress', 'Professional Address', profile.professionalAddress, 'text', 'Office address')}
        ${renderInlineField('bio', 'About / Bio', profile.bio, 'textarea', 'Tell clients about your expertise...')}
        ${renderInlineField('portfolio', 'Portfolio & Proof of Work', profile.portfolio, 'textarea', 'Links, achievements, notable projects...')}
        ${renderInlineField('businessType', 'Business Type', profile.businessType, 'text', 'e.g. Proprietorship, Pvt Ltd')}
        ${renderInlineField('teamSize', 'Team Size', profile.teamSize, 'text', 'e.g. Solo, 2-4 members')}

        <div id="editSaveRow" style="display:none;margin-top:16px;">
          <button onclick="saveProfileEdits()" style="width:100%;padding:14px;background:var(--primary);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">💾 Save Changes</button>
        </div>
      </div>

      <!-- ── AVAILABILITY STATUS ── -->
      <div class="settings-section" style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <div>
            <h3 class="settings-section-title" style="margin:0;">Availability Status</h3>
            <p style="font-size:12px;color:var(--text-muted);margin:3px 0 0;">Shown on your public profile</p>
          </div>
          <!-- Current status pill -->
          ${(() => {
            const cur = user.availability || 'available';
            const pillMap = {
              available: { label: "Available",  color: '#16a34a', bg: 'rgba(22,163,74,0.1)',  dot: '#22c55e' },
              busy:      { label: "Busy",       color: '#dc2626', bg: 'rgba(220,38,38,0.1)',  dot: '#ef4444' },
              away:      { label: "Away",       color: '#d97706', bg: 'rgba(217,119,6,0.1)',  dot: '#f59e0b' }
            };
            const p = pillMap[cur];
            return `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;background:${p.bg};color:${p.color};font-size:12px;font-weight:700;">
              <span style="width:7px;height:7px;border-radius:50%;background:${p.dot};display:inline-block;"></span>
              ${p.label}
            </span>`;
          })()}
        </div>
        <!-- Compact 3-button selector -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
          ${['available','busy','away'].map(status => {
            const map = {
              available: { icon: '🟢', label: "Available" },
              busy:      { icon: '🔴', label: "Busy"      },
              away:      { icon: '🟡', label: "Away"      }
            };
            const s = map[status];
            const isActive = (user.availability || 'available') === status;
            return `<label style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 8px;border:2px solid ${isActive ? 'var(--primary)' : 'var(--border)'};border-radius:10px;cursor:pointer;background:${isActive ? 'rgba(252,128,25,0.06)' : 'var(--bg)'};text-align:center;">
              <input type="radio" name="availabilityRadio" value="${status}" ${isActive ? 'checked' : ''} style="display:none;" onchange="updateAvailability('${status}')">
              <span style="font-size:20px;">${s.icon}</span>
              <span style="font-size:12px;font-weight:700;color:${isActive ? 'var(--primary)' : 'var(--text)'};">${s.label}</span>
            </label>`;
          }).join('')}
        </div>
      </div>
      
      <!-- ── WHY CHOOSE ME ── -->
      <div class="settings-section" style="margin-bottom:20px;">
        <h3 class="settings-section-title">Why Choose Me</h3>
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">Shown on your public profile to help clients decide</p>
        <textarea id="whyChooseMeInput" rows="4" maxlength="500"
          placeholder="e.g. I respond within 2 hours, offer free consultation, have 8 years experience with 100+ happy clients..."
          style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;resize:vertical;background:var(--bg);color:var(--text);box-sizing:border-box;"
        >${user.whyChooseMe || ''}</textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
          <span style="font-size:12px;color:var(--text-muted);">Max 500 characters</span>
          <button onclick="saveWhyChooseMe()" style="padding:8px 20px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">Save</button>
        </div>
      </div>

      <!-- ── LAST ONLINE ── -->
      <div class="settings-section" style="margin-bottom:20px;">
        <h3 class="settings-section-title">Last Online</h3>
        <div style="font-size:15px;font-weight:600;color:var(--text);">${(() => {
          if (!user.lastOnline) return '🕐 Recently active';
          const diff = Date.now() - new Date(user.lastOnline).getTime();
          const mins = Math.floor(diff / 60000);
          const hrs  = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);
          if (mins < 5)       return '🟢 Online now';
          if (mins < 60)      return `🕐 ${mins} minute${mins > 1 ? 's' : ''} ago`;
          if (hrs < 24)       return `🕐 ${hrs} hour${hrs > 1 ? 's' : ''} ago`;
          return `📅 ${days} day${days > 1 ? 's' : ''} ago`;
        })()}</div>
      </div>

      <!-- ── CONTACT & ACCOUNT ── -->
      <div class="settings-section" style="margin-bottom:20px;">
        <h3 class="settings-section-title">Contact Information</h3>
        <div style="padding:12px 0;border-bottom:1px solid var(--border);">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Phone</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div id="phoneDisplay" style="font-size:15px;font-weight:600;color:var(--text);">${user.phone || 'Not provided'}</div>
            <button onclick="togglePhoneEdit()" id="phoneEditBtn"
              style="padding:5px 12px;border:1.5px solid var(--primary);border-radius:8px;background:transparent;color:var(--primary);font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;">
              ✏️ Edit
            </button>
          </div>
          <div id="phoneEditArea" style="display:none;margin-top:10px;">
            <div style="display:flex;gap:8px;">
              <span style="padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;font-weight:600;background:var(--bg-gray);color:var(--text-muted);flex-shrink:0;">+91</span>
              <input type="tel" id="phoneEditInput" placeholder="10-digit mobile number"
                maxlength="10" inputmode="numeric"
                value="${user.phone || ''}"
                style="flex:1;padding:10px 12px;border:1.5px solid var(--primary);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text);"
                oninput="this.value=this.value.replace(/\D/g,'')">
            </div>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <button onclick="savePhoneEdit()"
                style="flex:1;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">
                Save
              </button>
              <button onclick="togglePhoneEdit()"
                style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:8px;background:transparent;color:var(--text);font-size:13px;cursor:pointer;">
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div style="padding:12px 0;border-bottom:1px solid var(--border);">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Service Location</div>
          <div style="font-size:15px;font-weight:600;color:var(--text);">${locationLabels[profile.serviceLocationType] || '—'}</div>
        </div>
        <div style="padding:12px 0;">
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Member Since</div>
          <div style="font-size:15px;font-weight:600;color:var(--text);">${memberSince}</div>
        </div>
      </div>

    </div><!-- end padding wrapper -->
  `;
}

// ─── INLINE FIELD RENDERER ───
function renderInlineField(key, label, value, type, placeholder) {
  const displayVal = value ? value : `<span style="color:var(--text-muted);font-style:italic;">Not set</span>`;
  const inputEl = type === 'textarea'
    ? `<textarea id="edit_${key}" rows="3" placeholder="${placeholder}" style="display:none;width:100%;padding:10px 12px;border:1.5px solid var(--primary);border-radius:8px;font-size:14px;font-family:inherit;resize:vertical;background:var(--bg);color:var(--text);">${value || ''}</textarea>`
    : `<input type="text" id="edit_${key}" value="${value || ''}" placeholder="${placeholder}" style="display:none;width:100%;padding:10px 12px;border:1.5px solid var(--primary);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text);">`;

  return `
    <div style="padding:12px 0;border-bottom:1px solid var(--border);" class="profile-field-row">
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">${label}</div>
      <div id="display_${key}" style="font-size:14px;font-weight:500;color:var(--text);line-height:1.5;">${displayVal}</div>
      ${inputEl}
    </div>`;
}

// ─── TOGGLE EDIT MODE ───
let _editMode = false;
function toggleEditMode() {
  _editMode = !_editMode;
  const btn = document.getElementById('editModeBtn');
  const saveRow = document.getElementById('editSaveRow');

  document.querySelectorAll('.profile-field-row').forEach(row => {
    const displays = row.querySelectorAll('[id^="display_"]');
    const inputs   = row.querySelectorAll('input[id^="edit_"], textarea[id^="edit_"]');
    displays.forEach(d => d.style.display = _editMode ? 'none' : 'block');
    inputs.forEach(i => i.style.display   = _editMode ? 'block' : 'none');
  });

  if (btn) btn.textContent = _editMode ? '✕ Cancel' : '✏️ Edit';
  if (saveRow) saveRow.style.display = _editMode ? 'block' : 'none';

  if (!_editMode) {
    // Cancelled — refresh to restore original values
    renderExpertProfile();
  }
}

// ─── SAVE PROFILE EDITS ───
async function saveProfileEdits() {
  const fields = ['specialization','experience','certificationNumber','gstNumber','licenseNumber','education','professionalAddress','bio','portfolio','businessType','teamSize'];
  const updatedProfile = { ...(state.user.profile || {}) };

  fields.forEach(key => {
    const el = document.getElementById('edit_' + key);
    if (el) updatedProfile[key] = el.value.trim();
  });

  // ─── BIO MODERATION ───
  const bioText = updatedProfile.bio || '';
  const phonePattern = /(\+?\d[\s\-.]?){9,13}\d/;
  const contactPatterns = [
  /\b\d{10}\b/,
  /\+91[\s\-]?\d{10}/,
  /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/,
  /wa\.me\//i,
  /whatsapp/i,
  /telegram/i,
  /instagram\.com/i,
  /t\.me\//i,
  /call me/i,
  /contact me at/i,
  /reach me/i,
  /dm me/i
];

// Word-based phone number pattern (5+ consecutive word digits)
const wordDigits = ['zero','one','two','three','four','five','six','seven','eight','nine'];
const wordPhonePattern = new RegExp(
  '\\b(' + wordDigits.join('|') + ')' +
  '([\\s\\-,]*(' + wordDigits.join('|') + ')){4,}\\b',
  'gi'
);
const contactWordPattern = /\b(call|contact|reach|ring|ping|text|msg|message)\s+(me\s+)?(at\s+|on\s+)?([a-z\s]+\b(zero|one|two|three|four|five|six|seven|eight|nine)\b)/gi;

wordPhonePattern.lastIndex = 0;
contactWordPattern.lastIndex = 0;
phonePattern.lastIndex = 0;   
const hasContact = phonePattern.test(bioText) 
  || contactPatterns.some(p => p.test(bioText))
  || wordPhonePattern.test(bioText)
  || contactWordPattern.test(bioText);
  if (hasContact) {
    showToast('Bio cannot contain phone numbers, emails, or external contact info. Please remove them and try again.', 'error');
    return;
  }

  const btn = document.querySelector('#editSaveRow button');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profile: updatedProfile })
    });

    const data = await res.json();

    if (data.success) {
      state.user.profile = updatedProfile;
      localStorage.setItem('user', JSON.stringify(state.user));
      _editMode = false;
      showToast('Profile updated successfully!', 'success');
      renderExpertProfile();
    } else {
      showToast(data.message || 'Failed to save', 'error');
      if (btn) { btn.disabled = false; btn.textContent = '💾 Save Changes'; }
    }
  } catch (err) {
    console.error('Save profile error:', err);
    showToast('Network error. Please try again.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = '💾 Save Changes'; }
  }
}
// ─── TOGGLE BASIC EDIT MODE ───
let _basicEditMode = false;
function toggleBasicEditMode() {
  _basicEditMode = !_basicEditMode;
  const btn = document.getElementById('basicEditBtn');
  const saveRow = document.getElementById('basicSaveRow');

  document.querySelectorAll('.basic-field-row').forEach(row => {
    row.querySelectorAll('[id^="basic_display_"]').forEach(d => d.style.display = _basicEditMode ? 'none' : 'block');
    row.querySelectorAll('[id^="basic_edit_"]').forEach(i => i.style.display = _basicEditMode ? 'block' : 'none');
  });

  if (btn) btn.textContent = _basicEditMode ? '✕ Cancel' : '✏️ Edit';
  if (saveRow) saveRow.style.display = _basicEditMode ? 'block' : 'none';

  if (!_basicEditMode) renderExpertProfile();
}

// ─── SAVE BASIC INFO ───
async function saveBasicInfo() {
  const nameVal    = document.getElementById('basic_edit_name')?.value.trim();
  const cityVal    = document.getElementById('basic_edit_city')?.value.trim();
  const pincodeVal = document.getElementById('basic_edit_pincode')?.value.trim();
  const stateVal   = document.getElementById('basic_edit_state')?.value.trim();

  if (!nameVal) { showToast('Name cannot be empty', 'error'); return; }

// ─── NAME VALIDATION ───
const namePhonePattern = /(\+?\d[\s\-.]?){9,13}\d|\b\d{10}\b/;
const nameWordPattern = /\b(zero|one|two|three|four|five|six|seven|eight|nine|call|contact|reach|whatsapp|telegram|dm)\b/gi;
const nameWordMatches = nameVal.match(nameWordPattern) || [];
if (namePhonePattern.test(nameVal) || nameWordMatches.length >= 4) {
  showToast('Name cannot contain phone numbers or contact information', 'error');
  return;
}
if (nameVal.length < 2 || nameVal.length > 60) {
  showToast('Name must be between 2 and 60 characters', 'error');
  return;
}
if (/[^a-zA-Z\s\.\-']/.test(nameVal)) {
  showToast('Name can only contain letters, spaces, dots and hyphens', 'error');
  return;
}
  const btn = document.querySelector('#basicSaveRow button');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    const updatedProfile = {
  ...(state.user.profile || {}),
  city: cityVal,
  pincode: pincodeVal,
  state: stateVal,
  // Keep expert_location_details in sync with the flat fields
  expert_location_details: {
    ...(typeof (state.user.profile?.expert_location_details) === 'object'
        ? state.user.profile.expert_location_details : {}),
    pincode: pincodeVal,
    city:    cityVal,
    state:   stateVal
  }
};
    // Save profile (city, pincode, state)
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profile: updatedProfile })
    });
    const data = await res.json();

    if (data.success) {
      // Save name separately via /me
      await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: nameVal })
      });

      state.user.name = nameVal;
      state.user.profile = updatedProfile;
      localStorage.setItem('user', JSON.stringify(state.user));
      _basicEditMode = false;
      showToast('Basic info updated!', 'success');
      renderExpertProfile();
    } else {
      showToast(data.message || 'Failed to save', 'error');
      if (btn) { btn.disabled = false; btn.textContent = '💾 Save Basic Info'; }
    }
  } catch (err) {
    showToast('Network error', 'error');
    if (btn) { btn.disabled = false; btn.textContent = '💾 Save Basic Info'; }
  }
}

function togglePhoneEdit() {
  const area = document.getElementById('phoneEditArea');
  const btn  = document.getElementById('phoneEditBtn');
  if (!area) return;
  const isOpen = area.style.display !== 'none';
  area.style.display = isOpen ? 'none' : 'block';
  if (btn) btn.textContent = isOpen ? '✏️ Edit' : '✕ Cancel';
}

async function savePhoneEdit() {
  const input = document.getElementById('phoneEditInput');
  const phone = input?.value?.trim();
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    showToast('Enter a valid 10-digit phone number', 'error'); return;
  }
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (data.success) {
      state.user.phone = phone;
      localStorage.setItem('user', JSON.stringify(state.user));
      showToast('Phone number updated!', 'success');
      renderExpertProfile();
    } else {
      showToast(data.message || 'Failed to save', 'error');
    }
  } catch (e) {
    showToast('Network error', 'error');
  }
}

function toggleClientPhoneEdit() {
  const area = document.getElementById('clientPhoneEditArea');
  if (!area) return;
  const isOpen = area.style.display !== 'none';
  area.style.display = isOpen ? 'none' : 'block';
  const input = document.getElementById('clientPhoneEditInput');
  if (input && !isOpen) input.value = state.user?.phone || '';
}

async function saveClientPhoneEdit() {
  const input = document.getElementById('clientPhoneEditInput');
  const phone = input?.value?.trim();
  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    showToast('Enter a valid 10-digit phone number', 'error'); return;
  }
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (data.success) {
      state.user.phone = phone;
      localStorage.setItem('user', JSON.stringify(state.user));
      const el = document.getElementById('profilePhone');
      if (el) el.textContent = phone;
      showToast('Phone number updated!', 'success');
      toggleClientPhoneEdit();
    } else {
      showToast(data.message || 'Failed to save', 'error');
    }
  } catch (e) {
    showToast('Network error', 'error');
  }
}

// ─── UPDATE AVAILABILITY ───
async function updateAvailability(status) {
  try {
    const res = await fetch(`${API_URL}/users/availability`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ availability: status })
    });
    const data = await res.json();
    if (data.success) {
      state.user.availability = status;
      localStorage.setItem('user', JSON.stringify(state.user));
      showToast('Availability updated!', 'success');
    } else {
      showToast(data.message || 'Failed to update', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ─── SAVE WHY CHOOSE ME ───
async function saveWhyChooseMe() {
  const text = document.getElementById('whyChooseMeInput')?.value.trim() || '';
  try {
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ whyChooseMe: text })
    });
    const data = await res.json();
    if (data.success) {
      state.user.whyChooseMe = text;
      localStorage.setItem('user', JSON.stringify(state.user));
      showToast('Saved!', 'success');
    } else {
      showToast(data.message || 'Failed to save', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}
// ─── KYC DOC TYPE SELECTION ───
window._kycSelected = null;
window._kycBase64   = null;
window._kycFileName = null;
window._kycMime     = null;

function selectKycDocType(docType) {
  window._kycSelected = docType;
  // Highlight selected card
  document.querySelectorAll('[id^="kyc_label_"]').forEach(el => el.style.borderColor = 'var(--border)');
  const lbl = document.getElementById('kyc_label_' + docType.replace(/\s/g,'_'));
  if (lbl) lbl.style.borderColor = 'var(--primary)';
  // Show upload area
  const area = document.getElementById('kycUploadArea');
  if (area) area.style.display = 'block';
}

function showKycOptions() {
  const step1 = document.getElementById('kycStep1');
  const btn = document.getElementById('kycStartBtn');
  if (step1) step1.style.display = 'block';
  if (btn) btn.style.display = 'none';
}

// ─── KYC DOC PREVIEW ───
function previewKycDoc(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('File too large. Max 5MB.', 'error');
    return;
  }

  window._kycFileName = file.name;
  window._kycMime     = file.type;

  const reader = new FileReader();
  reader.onload = function(e) {
    window._kycBase64 = e.target.result; // full data URL

    const preview = document.getElementById('kycPreview');
    const submitBtn = document.getElementById('kycSubmitBtn');

    if (preview) {
      preview.style.display = 'block';
      if (file.type.startsWith('image/')) {
        preview.innerHTML = `
          <div style="position:relative;border-radius:10px;overflow:hidden;border:1.5px solid var(--border);">
            <img src="${e.target.result}" style="width:100%;max-height:180px;object-fit:cover;display:block;">
            <div style="position:absolute;bottom:0;left:0;right:0;padding:8px 12px;background:rgba(0,0,0,0.6);font-size:12px;color:#fff;">
              📄 ${file.name}
            </div>
          </div>`;
      } else {
        preview.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-gray);border-radius:10px;border:1.5px solid var(--border);">
            <span style="font-size:32px;">📄</span>
            <div>
              <div style="font-size:14px;font-weight:600;">${file.name}</div>
              <div style="font-size:12px;color:var(--text-muted);">${(file.size/1024).toFixed(1)} KB • PDF</div>
            </div>
          </div>`;
      }
    }
    if (submitBtn) submitBtn.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// ─── SUBMIT KYC DOCUMENT ───
async function submitKycDocument() {
  if (!window._kycSelected) { showToast('Please select document type', 'error'); return; }
  if (!window._kycBase64)   { showToast('Please upload a document', 'error');    return; }

  const btn = document.getElementById('kycSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Uploading...'; }

  try {
    const res = await fetch(`${API_URL}/users/kyc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        docType:  window._kycSelected,
        docBase64: window._kycBase64,
        fileName:  window._kycFileName,
        mimeType:  window._kycMime
      })
    });

    const data = await res.json();

    if (data.success) {
      // Update local state
      if (!state.user.kyc) state.user.kyc = {};
      state.user.kyc.status  = 'pending';
      state.user.kyc.docType = window._kycSelected;
      localStorage.setItem('user', JSON.stringify(state.user));

      showToast('KYC submitted! Admin will review within 24–48 hours.', 'success');

      // Reset globals
      window._kycSelected = null;
      window._kycBase64   = null;
      window._kycFileName = null;

      renderExpertProfile();
    } else {
      showToast(data.message || 'KYC submission failed', 'error');
      if (btn) { btn.disabled = false; btn.textContent = '🛡️ Submit for Verification'; }
    }
  } catch (err) {
    console.error('KYC submit error:', err);
    showToast('Network error. Please try again.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = '🛡️ Submit for Verification'; }
  }
}
