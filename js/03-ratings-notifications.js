// Split from app.js lines 733-1247. app.js is kept as the untouched fallback.

// ─── RATING SYSTEM ─── 
function openRatingModal(expertId, expertName, approachId, requestId) {
  const modal = document.getElementById('ratingModal');
  document.getElementById('ratingExpertName').textContent = expertName;
  modal.dataset.expertId = expertId;
  modal.dataset.approachId = approachId;
  modal.dataset.requestId = requestId || '';  // ← ADD THIS
  modal.classList.add('open');
  
  // Reset form
  state.selectedRating = 0;
  document.querySelectorAll('.rating-stars .star').forEach(star => {
    star.classList.remove('filled');
  });
  document.getElementById('reviewText').value = '';
  document.getElementById('wouldRecommend').checked = true;
}


function closeRatingModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('ratingModal').classList.remove('open');
}

function selectRating(rating) {
  state.selectedRating = rating;
  
  // Handle modal stars with data-rating attributes
  const modalStars = document.querySelectorAll('#ratingModal .rating-stars .star');
  if (modalStars.length > 0) {
    modalStars.forEach(star => {
      const starRating = parseInt(star.getAttribute('data-rating'));
      if (starRating <= rating) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
  }
  
  // Also handle any other stars using index (for display purposes)
  const otherStars = document.querySelectorAll('.rating-stars .star:not([data-rating])');
  otherStars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
}
async function submitRating() {
  const modal = document.getElementById('ratingModal');
  const expertId = modal.dataset.expertId;
  const approachId = modal.dataset.approachId;
  const requestId = modal.dataset.requestId;  // ✅ DECLARE IT FIRST
  const rating = state.selectedRating;
  const review = document.getElementById('reviewText').value.trim();
  const wouldRecommend = document.getElementById('wouldRecommend').checked;
  
  
  
  if (rating === 0) {
    showToast('Please select a rating', 'warning');
    return;
  }
  
  if (!review || review.length < 10) {
    showToast('Please write at least 10 characters', 'warning');
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expertId,
        requestId,  // ✅ USE THE VARIABLE
        approachId,
        rating,
        review,
        wouldRecommend
      })
    });
    
    const data = await res.json();
    
    if (data.success) {
      showToast('Review submitted successfully!', 'success');
      closeRatingModal();
      loadClientData(); // Refresh data
    } else {
      showToast(data.message || 'Failed to submit review', 'error');
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    showToast('Failed to submit review', 'error');
  }
}

async function loadMyRatings() {
  try {
    const res = await fetch(`${API_URL}/ratings/received`, {
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      state.ratings = data.ratings;
      renderMyRatings(data);
    }
  } catch (error) {
    console.error('Load ratings error:', error);
  }
}

function renderMyRatings(data) {
  const container = document.getElementById('reviewsList');
  const emptyState = document.getElementById('reviewsEmpty');
  
  // Update summary - FIXED to calculate from actual ratings
  if (data.total > 0 && data.ratings && data.ratings.length > 0) {
    // Calculate average from received ratings
    const avgRating = data.ratings.reduce((sum, r) => sum + r.rating, 0) / data.ratings.length;
    document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    document.getElementById('reviewCount').textContent = `${data.total} review${data.total > 1 ? 's' : ''}`;
    
    // Fill the display stars at the top
    const topStars = document.querySelectorAll('#ratingsTab > .settings-section .rating-stars .star');
    const roundedRating = Math.round(avgRating);
    topStars.forEach((star, index) => {
      if (index < roundedRating) {
        star.classList.add('filled');
      } else {
        star.classList.remove('filled');
      }
    });
    
    renderRatingBars(data.ratings);
  }
  
  if (!data.ratings || data.ratings.length === 0) {
    const avgRating = document.getElementById('avgRating');
    const reviewCount = document.getElementById('reviewCount');
    const ratingBars = document.getElementById('ratingBars');
    if (avgRating) avgRating.textContent = '0.0';
    if (reviewCount) reviewCount.textContent = '0 reviews';
    if (ratingBars) ratingBars.innerHTML = '';
    document.querySelectorAll('#ratingsTab > .settings-section .rating-stars .star').forEach(star => {
      star.classList.remove('filled');
    });
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  container.innerHTML = data.ratings.map(rating => `
    <div class="review-card">
      <div class="review-header">
        <div class="avatar">
          ${rating.client.profilePhoto ? 
            `<img src="${rating.client.profilePhoto}" alt="${rating.client.name}">` : 
            rating.client.name.substring(0, 2).toUpperCase()
          }
        </div>
        <div class="review-author">
          <div class="review-author-name">${rating.client.name}</div>
          <div class="review-date">${formatDate(rating.createdAt)}</div>
        </div>
        <div class="rating-stars">
          ${renderStars(rating.rating)}
        </div>
      </div>
      
      <div class="review-text">${rating.review}</div>
      
      ${rating.wouldRecommend ? 
        '<div class="badge badge-success">✓ Would recommend</div>' : ''
      }
      
      ${rating.expertResponse ? `
        <div class="review-response">
          <div class="response-label">Expert Response</div>
          <div class="response-text">${rating.expertResponse.message}</div>
        </div>
      ` : `
        <button class="btn-outline" style="margin-top: 12px; padding: 8px 16px; font-size: 14px;" 
          onclick="respondToReview('${rating._id}')">
          Reply to Review
        </button>
      `}
      
      <div class="review-helpful ${rating.helpful ? 'active' : ''}" 
        onclick="markHelpful('${rating._id}')">
        👍 Helpful (${rating.helpfulCount || 0})
      </div>
    </div>
  `).join('');
}

function renderStars(rating) {
  return Array(5).fill(0).map((_, i) => 
    `<span class="star ${i < rating ? 'filled' : ''}">★</span>`
  ).join('');
}

function renderRatingBars(ratings) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  ratings.forEach(r => {
    distribution[r.rating]++;
  });
  
  const total = ratings.length;
  const barsHTML = [5, 4, 3, 2, 1].map(star => {
    const count = distribution[star];
    const percentage = total > 0 ? (count / total * 100) : 0;
    
    return `
      <div class="rating-bar-row">
        <div class="rating-bar-label">${star} ★</div>
        <div class="rating-bar">
          <div class="rating-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="rating-bar-count">${count}</div>
      </div>
    `;
  }).join('');
  
  document.getElementById('ratingBars').innerHTML = barsHTML;
}
async function openPublicProfile(expertId) {
  const url = `${window.location.origin}/expert/${expertId}`;
  if (navigator.share) {
    navigator.share({ title: 'Check out this expert on WorkIndex', url });
  } else {
    navigator.clipboard.writeText(url).then(() => showToast('Profile link copied!', 'success'));
  }
}

async function loadPublicExpertPage() {
  const match = window.location.pathname.match(/^\/expert\/([a-f0-9]{24})$/i);
  if (!match) return;
  const expertId = match[1];

  document.body.innerHTML = `<div style="min-height:100vh;background:#0f0f13;display:flex;align-items:center;justify-content:center;padding:20px;font-family:'Inter',sans-serif;">
    <div id="pubCard" style="color:#f0f0f4;font-size:15px;">Loading...</div>
  </div>`;

  try {
    const res = await fetch(`${API_URL}/users/public/${expertId}`);
    const data = await res.json();
    if (!data.success) { document.getElementById('pubCard').textContent = 'Expert not found.'; return; }
    const e = data.expert, pr = e.profile || {};
    const spec = e.specialization || pr.specialization || 'Professional';
    const bio = e.bio || pr.bio || '';
    const exp = e.yearsOfExperience || pr.yearsOfExperience || pr.experience || '';
    const services = e.servicesOffered || pr.servicesOffered || [];
    const city = (e.location?.city || pr.city || '');
    const state2 = (e.location?.state || pr.state || '');
    const loc = [city, state2].filter(Boolean).join(', ');
    const kycVerified = e.kyc?.status === 'approved';
    const serviceLabels = WI_SERVICES.labels;
    const initials = (e.name||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

    document.body.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(135deg,#0f0f13 0%,#1a1a24 100%);padding:24px 16px;font-family:'Inter',sans-serif;">
      <div style="max-width:520px;margin:0 auto;">

        <!-- Header branding -->
        <div style="text-align:center;margin-bottom:20px;">
          <span style="font-size:13px;color:#606078;font-weight:600;letter-spacing:.08em;">WORKINDEX</span>
        </div>

        <!-- Main card -->
        <div style="background:#18181d;border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5);border:1px solid #222230;">

          <!-- Top gradient banner -->
          <div style="height:80px;background:linear-gradient(135deg,#FC8019,#e5610a);"></div>

          <!-- Avatar overlapping banner -->
          <div style="padding:0 24px 24px;margin-top:-44px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;">
              <div style="width:80px;height:80px;border-radius:50%;border:4px solid #18181d;overflow:hidden;background:#FC8019;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;flex-shrink:0;">
                ${e.profilePhoto ? `<img src="${e.profilePhoto}" style="width:100%;height:100%;object-fit:cover;">` : initials}
              </div>
              <div style="display:flex;gap:8px;margin-bottom:6px;">
                ${kycVerified ? `<span style="background:rgba(34,197,94,0.12);color:#22c55e;border:1px solid rgba(34,197,94,0.25);border-radius:20px;padding:5px 12px;font-size:12px;font-weight:700;">✅ KYC Verified</span>` : ''}
                ${e.emailVerified ? `<span style="background:rgba(252,128,25,0.12);color:#FC8019;border:1px solid rgba(252,128,25,0.25);border-radius:20px;padding:5px 12px;font-size:12px;font-weight:700;">✉️ Email Verified</span>` : ''}
              </div>
            </div>

            <h1 style="font-size:24px;font-weight:800;color:#f0f0f4;margin:0 0 4px;">${e.name}</h1>
            <p style="font-size:15px;color:#FC8019;font-weight:600;margin:0 0 6px;">${spec}</p>
            ${loc ? `<p style="font-size:13px;color:#606078;margin:0 0 14px;">📍 ${loc}</p>` : ''}

            <!-- Stats row -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
              <div style="background:#111116;border-radius:12px;padding:12px;text-align:center;">
                <div style="font-size:20px;font-weight:800;color:#f59e0b;">${e.rating ? Number(e.rating).toFixed(1) : '—'}</div>
                <div style="font-size:11px;color:#606078;margin-top:2px;">Rating</div>
              </div>
              <div style="background:#111116;border-radius:12px;padding:12px;text-align:center;">
                <div style="font-size:20px;font-weight:800;color:#f0f0f4;">${e.reviewCount || 0}</div>
                <div style="font-size:11px;color:#606078;margin-top:2px;">Reviews</div>
              </div>
              <div style="background:#111116;border-radius:12px;padding:12px;text-align:center;">
                <div style="font-size:18px;font-weight:800;color:#f0f0f4;">${exp ? exp+'yr' : '—'}</div>
                <div style="font-size:11px;color:#606078;margin-top:2px;">Experience</div>
              </div>
            </div>

            ${services.length ? `
            <div style="margin-bottom:20px;">
              <div style="font-size:11px;color:#606078;font-weight:700;letter-spacing:.06em;margin-bottom:8px;">SERVICES</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${services.map(s=>`<span style="background:rgba(252,128,25,0.12);color:#FC8019;border:1px solid rgba(252,128,25,0.25);border-radius:8px;padding:5px 12px;font-size:13px;font-weight:600;">${serviceLabels[s]||s}</span>`).join('')}
              </div>
            </div>` : ''}

            ${bio ? `
            <div style="margin-bottom:20px;">
              <div style="font-size:11px;color:#606078;font-weight:700;letter-spacing:.06em;margin-bottom:8px;">ABOUT</div>
              <p style="font-size:14px;color:#c0c0d8;line-height:1.7;margin:0;">${bio}</p>
            </div>` : ''}

            ${e.whyChooseMe ? `
            <div style="margin-bottom:20px;padding:14px 16px;background:rgba(252,128,25,0.06);border-left:3px solid #FC8019;border-radius:0 10px 10px 0;">
              <div style="font-size:11px;color:#FC8019;font-weight:700;letter-spacing:.06em;margin-bottom:6px;">💡 WHY CHOOSE ME</div>
              <p style="font-size:14px;color:#c0c0d8;line-height:1.7;margin:0;">${e.whyChooseMe}</p>
            </div>` : ''}

            ${data.ratings?.length ? `
            <div style="margin-bottom:20px;">
              <div style="font-size:11px;color:#606078;font-weight:700;letter-spacing:.06em;margin-bottom:10px;">RECENT REVIEWS</div>
              ${data.ratings.map(r=>`
              <div style="background:#111116;border-radius:12px;padding:14px;margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <span style="font-size:14px;font-weight:600;color:#f0f0f4;">${r.client?.name||'Client'}</span>
                  <span style="color:#f59e0b;font-size:14px;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
                </div>
                <p style="font-size:13px;color:#a0a0b8;margin:0;line-height:1.5;">${r.review}</p>
              </div>`).join('')}
            </div>` : ''}

            <!-- CTA -->
            <a href="/" style="display:block;text-align:center;padding:15px;background:#FC8019;color:#fff;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:10px;">
              Post a Request → Get Quotes
            </a>
            <p style="text-align:center;font-size:12px;color:#606078;margin:0;">Connect with ${e.name.split(' ')[0]} on WorkIndex</p>
          </div>
        </div>

        <!-- Share button -->
        <div style="text-align:center;margin-top:16px;">
          <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>this.textContent='✅ Link Copied!')"
            style="background:transparent;border:1px solid #333;color:#606078;padding:8px 20px;border-radius:20px;font-size:13px;cursor:pointer;">
            🔗 Copy Profile Link
          </button>
        </div>
      </div>
    </div>`;
  } catch(err) {
    document.getElementById('pubCard').textContent = 'Failed to load profile.';
  }
}

async function respondToReview(ratingId) {
  const response = prompt('Your response to this review:');
  if (!response || !response.trim()) return;
  
  try {
    const res = await fetch(`${API_URL}/ratings/${ratingId}/respond`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: response.trim() })
    });
    
    const data = await res.json();
    
    if (data.success) {
      showToast('Response posted!', 'success');
      loadExpertData(); // ✅ FIXED: was loadMyRatings()
    } else {
      showToast(data.message || 'Failed to post response', 'error');
    }
  } catch (error) {
    console.error('Respond error:', error);
    showToast('Failed to post response', 'error');
  }
}

async function markHelpful(ratingId) {
  try {
    const res = await fetch(`${API_URL}/ratings/${ratingId}/helpful`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      loadExpertData(); // ✅ FIXED: was loadMyRatings()
    }
  } catch (error) {
    console.error('Mark helpful error:', error);
  }
}
// ─── NOTIFICATIONS ───
async function loadNotifications() {
  try {
    const res = await fetch(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const data = await res.json();
    if (!data.success) return;
    
    const unread = (data.notifications || []).filter(n => !n.isRead).length;
    const badge = document.getElementById('notifBadge');
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
    return data.notifications || [];
  } catch (err) {
    console.error('Load notifications error:', err);
    return [];
  }
}

async function openNotifications() {
  // Guard — prevent stacking including during async load
  if (document.getElementById('notificationsModal')) return;
  
  // Insert placeholder immediately so guard catches rapid clicks
  const placeholder = document.createElement('div');
  placeholder.id = 'notificationsModal';
  document.body.appendChild(placeholder);

  const notifications = await loadNotifications();
  
  // Remove placeholder, build real modal
  placeholder.remove();
  
  // Re-check in case user navigated away during fetch
  if (document.getElementById('notificationsModal')) return;
  
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:flex-start;justify-content:flex-end;z-index:1001;padding:60px 16px 0;';
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  const typeIcons = {
    announcement: '📢',
    admin_dm: '💬',
    refund: '💰',
    approach: '👋',
    chat: '💬',
    system: 'ℹ️',
     admin_action: '🔔',      // ← ADD
  customer_interest: '🎯'
  };

  const listHTML = notifications.length ? notifications.map(n => `
    <div style="padding:14px;border-bottom:1px solid var(--border);background:${n.isRead ? 'transparent' : 'rgba(252,128,25,0.05)'};">
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <span style="font-size:20px;">${typeIcons[n.type] || 'ℹ️'}</span>
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:${n.isRead ? '400' : '700'};color:var(--text);margin-bottom:2px;">${n.title}</div>
          <div style="font-size:13px;color:var(--text-muted);line-height:1.4;">${n.message}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${formatDate(n.createdAt)}</div>
        </div>
        ${!n.isRead ? '<span style="width:8px;height:8px;background:var(--primary);border-radius:50%;flex-shrink:0;margin-top:4px;"></span>' : ''}
      </div>
    </div>
  `).join('') : '<div style="padding:40px;text-align:center;color:var(--text-muted);">No notifications yet</div>';

  modal.innerHTML = `
    <div style="background:var(--bg);border-radius:16px;width:100%;max-width:380px;max-height:70vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.15);">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:var(--bg);">
        <h3 style="font-size:17px;font-weight:700;">Notifications</h3>
        <div style="display:flex;gap:12px;align-items:center;">
          <span onclick="markAllRead()" style="font-size:12px;color:var(--primary);cursor:pointer;font-weight:600;">Mark all read</span>
          <button onclick="this.closest('[style*=fixed]').remove()" style="border:none;background:none;font-size:22px;cursor:pointer;color:var(--text-muted);">×</button>
        </div>
      </div>
      ${listHTML}
    </div>
  `;

  document.body.appendChild(modal);
  markAllRead(); // auto mark as read when opened
}

async function markAllRead() {
  try {
    await fetch(`${API_URL}/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
  } catch (err) {
    console.error('Mark read error:', err);
  }
}

