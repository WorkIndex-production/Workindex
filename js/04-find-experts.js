// Split from app.js lines 1248-1838. app.js is kept as the untouched fallback.
// ─── FIND PROFESSIONALS ─── 
async function loadExperts(filters = {}) {
  const loading = document.getElementById('expertsLoading');
  const grid = document.getElementById('expertGrid');
  const empty = document.getElementById('expertsEmpty');
  
  loading.style.display = 'block';
  grid.innerHTML = '';
  empty.style.display = 'none';

  // Cancel any previous experts fetch
  if (expertsAbortController) expertsAbortController.abort();
  expertsAbortController = new AbortController();

  try {
    const params = new URLSearchParams();
Object.entries(filters).forEach(([k, v]) => {
  if (v !== undefined && v !== null && v !== '') params.append(k, v);
});
    const res = await fetch(`${API_URL}/users/experts?${params}`, {
      signal: expertsAbortController.signal
    });
    const data = await res.json();
    
    loading.style.display = 'none';
    
    if (data.success && data.experts.length > 0) {
      state.experts = sortExpertsByCombinedScore(data.experts);
      renderExperts();
    } else {
      empty.style.display = 'block';
    }
  } catch (error) {
    if (error.name === 'AbortError') return; // navigation cancelled this — ignore
    console.error('Load experts error:', error);
    loading.style.display = 'none';
    empty.style.display = 'block';
  }
}
function expertProfileCompletenessScore(expert) {
  const profile = expert.profile || {};
  const fields = [
    expert.profilePhoto,
    profile.bio || expert.bio,
    profile.specialization || expert.specialization,
    profile.city || expert.location?.city,
    profile.pincode || expert.location?.pincode,
    profile.experience || expert.yearsOfExperience,
    profile.servicesOffered || expert.servicesOffered,
    profile.education,
    profile.portfolio,
    expert.kyc?.status === 'approved'
  ];
  const done = fields.filter(value => Array.isArray(value) ? value.length > 0 : !!value).length;
  return Math.round((done / fields.length) * 100);
}

function expertCombinedRankingScore(expert) {
  const profileScore = Number(expert.profileScore ?? expert.profileCompleteness ?? expertProfileCompletenessScore(expert)) || 0;
  const ratingScore = Math.min(((Number(expert.rating) || 0) / 5) * 30, 30);
  const approachScore = Math.min((Number(expert.totalApproaches) || 0) * 2, 20);
  const adminBoost = Math.max(0, Math.min(Number(expert.adminBoost || expert.rankingBoost || 0), 50));
  return Math.round(profileScore * 0.5 + ratingScore + approachScore + adminBoost);
}

function sortExpertsByCombinedScore(experts) {
  return (experts || []).slice().sort((a, b) => {
    const aRank = Number(a.adminRank || 0);
    const bRank = Number(b.adminRank || 0);
    if (aRank > 0 && bRank > 0 && aRank !== bRank) return aRank - bRank;
    if (aRank > 0 && !bRank) return -1;
    if (!aRank && bRank > 0) return 1;
    const aScore = Number(a.combinedScore ?? a.rankingScore ?? expertCombinedRankingScore(a));
    const bScore = Number(b.combinedScore ?? b.rankingScore ?? expertCombinedRankingScore(b));
    return bScore - aScore;
  });
}
function renderExperts() {
  const grid = document.getElementById('expertGrid');
  if (!grid) return;

  const allExperts = state.experts || [];

  if (!allExperts.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px 20px;">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style="margin-bottom:16px;opacity:0.4;">
          <circle cx="32" cy="24" r="12" stroke="#FC8019" stroke-width="2.5" fill="none"/>
          <path d="M8 56c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="#FC8019" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </svg>
        <h3 style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:6px;">No experts found</h3>
        <p style="font-size:14px;color:var(--text-muted);">Try a different service or clear your filters</p>
      </div>`;
    return;
  }

   const serviceLabels = WI_SERVICES.labels;
  const svcColors = WI_SERVICES.colors;
   
  const availMap = {
    available: { dot: '#22c55e', label: 'Available' },
    busy:      { dot: '#ef4444', label: 'Busy' },
    away:      { dot: '#f59e0b', label: 'Away' }
  };

  const items = paginate(allExperts, 'findExperts');

  grid.innerHTML = items.map(expert => {
    const profile = expert.profile || {};
    const spec = expert.specialization || profile.specialization || 'Professional';
    const bio = expert.bio || profile.bio || '';
    const services = expert.servicesOffered || profile.servicesOffered || [];
    const city = expert.location?.city || profile.city || '';
    const exp = expert.yearsOfExperience || profile.yearsOfExperience || profile.experience || '';
    const avail = availMap[expert.availability || 'available'];
    const kycVerified = expert.kyc?.status === 'approved';
    const initials = (expert.name || '?').substring(0, 2).toUpperCase();
    const primarySvc = services[0];
    const svcColor = svcColors[primarySvc] || '#FC8019';
    const isShortlisted = (_clientShortlisted || []).includes(expert._id);

    return `
      <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:16px;overflow:hidden;transition:all 0.2s;display:flex;flex-direction:column;"
        onmouseover="this.style.borderColor='rgba(252,128,25,0.4)';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'"
        onmouseout="this.style.borderColor='var(--border)';this.style.transform='translateY(0)';this.style.boxShadow='none'">

        <!-- Colored top bar -->
        <div style="height:5px;background:linear-gradient(90deg,${svcColor},${svcColor}88);"></div>

        <!-- Card body -->
        <div style="padding:16px;flex:1;display:flex;flex-direction:column;">

          <!-- Avatar + name row -->
          <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
            <div style="width:52px;height:52px;border-radius:50%;background:${svcColor};color:#fff;font-size:17px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;">
              ${expert.profilePhoto
                ? `<img src="${expert.profilePhoto}" style="width:100%;height:100%;object-fit:cover;">`
                : initials}
              <!-- Availability dot -->
              <span style="position:absolute;bottom:1px;right:1px;width:12px;height:12px;border-radius:50%;background:${avail.dot};border:2px solid var(--bg);"></span>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:2px;">
                <span style="font-size:15px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${expert.name}</span>
                ${kycVerified ? `<span style="font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px;background:rgba(34,197,94,0.1);color:#16a34a;flex-shrink:0;">✓ KYC</span>` : ''}
              </div>
              <div style="font-size:12px;font-weight:600;color:${svcColor};">${spec}</div>
              <div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap;">
                ${expert.rating ? `<span style="font-size:12px;font-weight:700;color:#f59e0b;">⭐ ${Number(expert.rating).toFixed(1)} <span style="color:var(--text-muted);font-weight:400;">(${expert.reviewCount || 0})</span></span>` : '<span style="font-size:12px;color:var(--text-muted);">No reviews yet</span>'}
                ${city ? `<span style="font-size:11px;color:var(--text-muted);">📍 ${city}</span>` : ''}
                ${exp ? `<span style="font-size:11px;color:var(--text-muted);">${exp}yr exp</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Bio -->
          ${bio ? `<p style="font-size:12.5px;color:var(--text-light);line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${bio}</p>` : ''}

          <!-- Service tags -->
          ${services.length ? `
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px;">
            ${services.slice(0, 3).map(s => `<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;background:${(svcColors[s]||'#FC8019')}14;color:${svcColors[s]||'#FC8019'};">${serviceLabels[s] || s}</span>`).join('')}
          </div>` : '<div style="flex:1;"></div>'}

          <!-- Action buttons -->
          <div style="margin-top:auto;">
            <button onclick="viewExpertProfile('${expert._id}', true)"
              style="padding:10px;background:var(--primary);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s;"
              onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              View Profile
            </button>
            </div>
        </div>
      </div>`;
  }).join('') + paginationControlsHTML(allExperts, 'findExperts');
}
function toggleShortlist(expertId, btn) {
  _clientShortlisted = _clientShortlisted || [];
  const idx = _clientShortlisted.indexOf(expertId);
  if (idx === -1) {
    _clientShortlisted.push(expertId);
    btn.innerHTML = '❤️';
    btn.style.color = '#ef4444';
    btn.style.background = 'rgba(239,68,68,0.08)';
    showToast('Expert saved to shortlist', 'success');
  } else {
    _clientShortlisted.splice(idx, 1);
    btn.innerHTML = '🤍';
    btn.style.color = 'var(--text-muted)';
    btn.style.background = 'transparent';
    showToast('Removed from shortlist', 'info');
  }
}

function filterExperts(service) {
  // Update active filter chip immediately (instant UI feedback)
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  document.querySelector(`[data-service="${service}"]`)?.classList.add('active');

  // Debounce the API call — prevents rapid chip clicks firing multiple requests
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const filters = service !== 'all' ? { service } : {};
    loadExperts(filters);
  }, 300);
}

function sortExperts(sortBy) {
  loadExperts({ sortBy });
}

// ─── VIEW EXPERT PROFILE ───
async function viewExpertProfile(expertId, loggedIn = false) {
  // Guard — prevent stacking
  if (document.getElementById('expertProfileModal')) return;

  // Insert placeholder immediately so rapid clicks are blocked
  const placeholder = document.createElement('div');
  placeholder.id = 'expertProfileModal';
  document.body.appendChild(placeholder);

  try {
    const res = await fetch(`${API_URL}/users/expert/${expertId}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    const data = await res.json();

    // Remove placeholder before building real modal
    placeholder.remove();

    // Re-check in case of rapid clicks during fetch
    if (document.getElementById('expertProfileModal')) return;

    if (!data.success) { showToast('Could not load profile', 'error'); return; }

    const expert = data.expert || data.user;
    const profile = expert.profile || {};

    const specialization = profile.specialization || expert.specialization || 'Professional';
    const bio            = profile.bio || expert.bio || '';
    const experience     = profile.experience || expert.yearsOfExperience || '—';
    const services       = profile.servicesOffered || expert.servicesOffered || [];
    const companyName    = profile.companyName || expert.companyName || '';
    const companySize    = profile.companySize || '';
    const hasWebsite     = profile.hasWebsite || false;
    const websiteUrl     = profile.websiteUrl || expert.websiteUrl || '';
    const locationType   = profile.serviceLocationType || '';
    const certifications = profile.certifications || expert.certifications || [];
    const city           = profile.city || expert.location?.city || '';

    const education      = profile.education || '';
    const portfolio      = profile.portfolio || '';
    const whyChooseMe    = expert.whyChooseMe || '';
    const availability   = expert.availability || 'available';
    const lastOnline     = expert.lastOnline;

    const availabilityMap = {
      available: { icon: '🟢', label: 'Available',      color: '#10b981' },
      busy:      { icon: '🔴', label: 'Busy This Week', color: '#ef4444' },
      away:      { icon: '🟡', label: 'Away',           color: '#f59e0b' }
    };
    const avail = availabilityMap[availability] || availabilityMap.available;

    const lastOnlineText = (() => {
      if (!lastOnline) return '🕐 Recently active';
      const diff = Date.now() - new Date(lastOnline).getTime();
      const mins = Math.floor(diff / 60000);
      const hrs  = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (mins < 5)  return '🟢 Online now';
      if (mins < 60) return `🕐 ${mins}m ago`;
      if (hrs < 24)  return `🕐 ${hrs}h ago`;
      return `📅 ${days}d ago`;
    })();

    const locationLabels = {
      online: '💻 Online / Remote only',
      local:  '📍 Local (in-person)',
      both:   '🌐 Both online & in-person'
    };
    const serviceLabels = WI_SERVICES.labels;

    const modal = document.createElement('div');
    modal.id = 'expertProfileModal';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1001; padding: 20px;';
    modal.onclick = (e) => { if (e.target === modal) document.getElementById('expertProfileModal')?.remove(); };

    modal.innerHTML = `
      <div style="background: var(--bg); border-radius: 16px; max-width: 480px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 24px;">

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="font-size: 20px; font-weight: 700; color: var(--text);">Expert Profile</h2>
          <button onclick="document.getElementById('expertProfileModal')?.remove()" style="border: none; background: none; font-size: 24px; cursor: pointer; color: var(--text-muted);">×</button>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 32px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; overflow: hidden;">
            ${expert.profilePhoto ? `<img src="${expert.profilePhoto}" style="width:100%;height:100%;object-fit:cover;">` : expert.name.charAt(0).toUpperCase()}
          </div>
          <h3 style="font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 4px;">${expert.name}</h3>
          <p style="font-size: 15px; color: var(--primary); font-weight: 600;">${specialization}</p>
          ${city ? `<p style="font-size: 13px; color: var(--text-muted);">📍 ${city}</p>` : ''}
          ${expert.rating ? `
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 8px;">
              <span style="color: #f39c12; font-size: 18px;">★</span>
              <span style="font-size: 16px; font-weight: 700;">${expert.rating.toFixed(1)}</span>
              <span style="font-size: 13px; color: var(--text-muted);">(${expert.reviewCount || 0} reviews)</span>
            </div>
          ` : ''}
          ${loggedIn ? `
            <div style="display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:5px 14px;border-radius:20px;background:rgba(0,0,0,0.05);border:1.5px solid ${avail.color};font-size:13px;font-weight:700;color:${avail.color};">
              ${avail.icon} ${avail.label}
            </div>
          ` : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="text-align: center; padding: 12px; background: var(--bg-gray); border-radius: 10px;">
            <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${expert.reviewCount || 0}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Reviews</div>
          </div>
          <div style="text-align: center; padding: 12px; background: var(--bg-gray); border-radius: 10px;">
            <div style="font-size: 18px; font-weight: 700; color: var(--primary);">${experience}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Experience</div>
          </div>
          <div style="text-align: center; padding: 12px; background: var(--bg-gray); border-radius: 10px;">
            <div style="font-size: 20px; font-weight: 700; color: var(--primary);">${expert.rating ? expert.rating.toFixed(1) : '—'}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Rating</div>
          </div>
        </div>

        ${loggedIn ? `
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:20px;font-size:13px;color:var(--text-muted);">
            ${lastOnlineText}
          </div>
        ` : ''}

        ${loggedIn && whyChooseMe ? `
          <div style="margin-bottom:20px;padding:14px 16px;background:rgba(252,128,25,0.06);border-left:3px solid var(--primary);border-radius:0 10px 10px 0;">
            <h4 style="font-size:13px;font-weight:700;color:var(--text-muted);margin-bottom:6px;">💡 WHY CHOOSE ME</h4>
            <p style="font-size:14px;color:var(--text-light);line-height:1.6;margin:0;">${whyChooseMe}</p>
          </div>
        ` : ''}

        ${services.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">SERVICES OFFERED</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${services.map(s => `<span style="padding: 6px 12px; background: rgba(252,128,25,0.1); color: var(--primary); border-radius: 20px; font-size: 13px; font-weight: 600;">${serviceLabels[s] || s}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${bio ? `
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">ABOUT</h4>
            <p style="font-size: 14px; color: var(--text-light); line-height: 1.6;">${bio}</p>
          </div>
        ` : ''}

        ${loggedIn && education ? `
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">🎓 EDUCATION</h4>
            <p style="font-size: 14px; color: var(--text);">${education}</p>
          </div>
        ` : ''}

        ${loggedIn && portfolio ? `
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">🗂️ PORTFOLIO & PROOF OF WORK</h4>
            <p style="font-size: 14px; color: var(--text-light); line-height: 1.6; white-space: pre-line;">${portfolio}</p>
          </div>
        ` : ''}

        ${companyName ? `
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">COMPANY</h4>
            <div style="font-size: 14px; color: var(--text);">🏢 ${companyName}${companySize ? ` · ${companySize} employees` : ''}</div>
            ${hasWebsite && websiteUrl ? `<a href="${websiteUrl}" target="_blank" style="font-size: 13px; color: var(--primary);">🌐 ${websiteUrl}</a>` : ''}
          </div>
        ` : ''}

        ${certifications.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">CERTIFICATIONS</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${certifications.map(c => `<span style="padding: 6px 12px; background: var(--bg-gray); border-radius: 20px; font-size: 13px;">🏅 ${c}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${locationType ? `
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">SERVICE LOCATION</h4>
            <div style="font-size: 14px; color: var(--text);">${locationLabels[locationType] || locationType}</div>
          </div>
        ` : ''}

        ${data.ratings && data.ratings.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text-muted); margin-bottom: 12px;">CUSTOMER REVIEWS</h4>
            ${data.ratings.map(r => `
              <div style="padding: 14px; background: var(--bg-gray); border-radius: 12px; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${(r.client?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 600; color: var(--text);">${r.client?.name || 'Client'}</div>
                    <div style="font-size: 12px; color: #f39c12;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted);">${new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                </div>
                <p style="font-size: 13px; color: var(--text-light); line-height: 1.5; margin: 0;">${r.review}</p>
                ${r.wouldRecommend ? '<div style="font-size: 11px; color: #4CAF50; margin-top: 6px;">✓ Would recommend</div>' : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <button onclick="document.getElementById('expertProfileModal')?.remove()" style="width: 100%; padding: 14px; border: 1.5px solid var(--border); border-radius: 10px; background: transparent; color: var(--text); font-size: 15px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;

    document.body.appendChild(modal);

  } catch (error) {
    // Clean up placeholder on error so future clicks work
    document.getElementById('expertProfileModal')?.remove();
    console.error('View profile error:', error);
    showToast('Failed to load profile', 'error');
  }
}

// ─── PROFILE PHOTO UPLOAD ─── 
async function uploadProfilePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error');
    return;
  }
  
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image too large. Max size is 5MB.', 'error');
    return;
  }
  
  const formData = new FormData();
  formData.append('profilePhoto', file);
  
  try {
    const res = await fetch(`${API_URL}/users/profile-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`
      },
      body: formData
    });
    
    const data = await res.json();
    
    if (data.success) {
      showToast('Profile photo updated!', 'success');
      state.user.profilePhoto = data.profilePhoto;
      localStorage.setItem('user', JSON.stringify(state.user));
      
      // Update all avatar instances
      if (state.user.role === 'client') {
        updateClientProfile();
      } else {
        updateExpertProfile();
      }
    } else {
      showToast(data.message || 'Upload failed', 'error');
    }
  } catch (error) {
    console.error('Upload photo error:', error);
    showToast('Upload failed', 'error');
  }
}

function updateProfilePhoto(photoUrl) {
  // Update all avatar instances
  document.querySelectorAll('.avatar').forEach(avatar => {
    if (avatar.dataset.userId === state.user._id) {
      avatar.innerHTML = `<img src="${photoUrl}" alt="${state.user.name}">`;
    }
  });
}

// ─── CREDIT PURCHASE ─── 
async function openCreditModal() {
  // Show credits overview screen instead of direct purchase modal
  showPage('creditsHistory');
  
  // Update balance display
  const balEl = document.getElementById('chBalanceDisplay');
  if (balEl && state.user) balEl.textContent = state.user.credits || 0;

  // Load last 3 purchases for quick view
  loadCreditsHistory('purchase');
}

function closeCreditModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('creditModal').classList.remove('open');
}

async function proceedToPayment() {
  const selected = document.querySelector('input[name="creditPack"]:checked');
  if (!selected) {
    showToast('Please select a package', 'warning');
    return;
  }

  const packId = selected.dataset.packId;

  try {
    showToast('Preparing payment...', 'info');

    // Step 1: Create Razorpay order on our backend
    const res = await fetch(`${API_URL}/credits/purchase/initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ packId })
    });

    const data = await res.json();
    if (!data.success) {
      showToast(data.message || 'Could not initiate payment', 'error');
      return;
    }

    closeCreditModal();

    // Step 2: Open Razorpay checkout popup
    const options = {
      key: data.keyId,
      amount: data.amount,       // in paise
      currency: data.currency,
      name: 'WorkIndex',
      description: `${data.prefill.credits} Credits`,
      image: '/favicon.png',
      order_id: data.orderId,
      // Step 3: After user pays, Razorpay calls this handler
      handler: async function (response) {
        await verifyRazorpayPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          transactionId: data.transactionId
        });
      },
      prefill: {
        name: state.user?.name || '',
        email: state.user?.email || ''
      },
      theme: { color: '#F97316' }, // WorkIndex orange
      modal: {
        ondismiss: function () {
          showToast('Payment cancelled', 'info');
        }
      }
    };

    const rzp = new Razorpay(options);

    // Handle payment failure inside the checkout (wrong PIN, bank decline, etc.)
    rzp.on('payment.failed', function (response) {
      showToast(`Payment failed: ${response.error.description}`, 'error');
      console.error('Razorpay payment failed:', response.error);
    });

    rzp.open();

  } catch (error) {
    console.error('Payment initiation error:', error);
    showToast('Could not start payment. Please try again.', 'error');
  }
}

// ⭐ Called by Razorpay handler after successful payment
// Sends Razorpay's 3 IDs to our backend for signature verification
async function verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId }) {
  try {
    showToast('Verifying payment...', 'info');

    const res = await fetch(`${API_URL}/credits/purchase/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId })
    });

    const data = await res.json();

    if (data.success) {
      state.user.credits = data.newBalance;
      localStorage.setItem('user', JSON.stringify(state.user));
      updateCreditDisplay(data.newBalance);
      showToast(`${data.transaction.credits} credits added successfully!`, 'success');
      // Refresh transaction history if the user is on the credits page
      if (typeof loadCreditHistory === 'function') loadCreditHistory();
    } else {
      showToast(data.message || 'Payment verification failed — contact support', 'error');
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    showToast('Verification failed — your payment is safe, contact support with your payment ID', 'error');
  }
}

function updateCreditDisplay(credits) {
  document.querySelectorAll('.credit-display').forEach(el => {
    el.textContent = credits;
  });
}

