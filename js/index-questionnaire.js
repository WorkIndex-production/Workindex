// Split from index.html inline script 2.
// ─── QUESTIONNAIRE STATE ───
let qState = {
  step: 0,
  sequence: [],
  answers: {},
  role: null
};

// ─── BUILD QUESTION SEQUENCE DYNAMICALLY ───
function buildQuestionSequence() {
    const answers = qState.answers;
    const role = qState.role || state.user?.role || selectedRole;
    const q = WI_SERVICES.questionnaire;

    if (role === 'expert') {
      return q.expert.map(step => step.id);
    }

    const seq = [];
    seq.push(q.serviceSelection.id);

    const service = answers.service;
    if (service && q.byService[service]) {
      q.byService[service].forEach(step => {
        // skip steps whose key is 'urgency' — common section handles it
        if (step.key !== 'urgency') seq.push(step.id);
      });
    }

    seq.push(q.common.service_location_type.id);

    // uses service_location_type key (snake_case matches the answer key)
    const locType = answers.service_location_type;
    if (locType === 'my-location' || locType === 'professional-office') {
      seq.push(q.common.full_address.id);
    } else if (locType === 'online') {
      // client_location is the key in common object (matches q.id)
      const clientLocStep = q.common.client_location || q.common.clientLocation;
      if (clientLocStep) seq.push(clientLocStep.id);
    }

    seq.push(
      q.common.urgency.id,
      q.common.budget.id,
      q.common.description.id,
      q.common.preferred_professional.id,
      q.common.contact_method.id
    );

    return seq;
  }

// ─── CATEGORY IMAGE MAP ───
const Q_CATEGORY_IMAGES = {
  // Services
  itr:        { url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&fit=crop', label: '📄 ITR Filing' },
  gst:        { url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&fit=crop', label: '🧾 GST Services' },
  accounting: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&fit=crop', label: '📊 Accounting' },
  audit:      { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop', label: '🔍 Audit Services' },
  photography:{ url: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80&fit=crop', label: '📸 Photography' },
  development:{ url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80&fit=crop', label: '💻 Development' },
  // Development sub-types
  website:    { url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80&fit=crop', label: '🌐 Website' },
  ecommerce:  { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80&fit=crop', label: '🛒 E-Commerce Store' },
  webapp:     { url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80&fit=crop', label: '💻 Web Application' },
  'mobile-app':{ url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&fit=crop', label: '📱 Mobile App' },
  api:        { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80&fit=crop', label: '🔌 API / Backend' },
  redesign:   { url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80&fit=crop', label: '🎨 Website Redesign' },
  maintenance:{ url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80&fit=crop', label: '🔧 Maintenance' },
  // Photography sub-types
  wedding:    { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&fit=crop', label: '💍 Wedding Photography' },
  portrait:   { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80&fit=crop', label: '🤳 Portrait / Headshots' },
  product:    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&fit=crop', label: '📦 Product Photography' },
  corporate:  { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80&fit=crop', label: '🏢 Corporate / Events' },
  real_estate:{ url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fit=crop', label: '🏠 Real Estate' },
  // ITR sub-types
  salaried:   { url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&fit=crop', label: '💼 Salaried Employee' },
  business:   { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop', label: '🏢 Business Owner' },
  freelancer: { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80&fit=crop', label: '💻 Freelancer' },
  nri:        { url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&fit=crop', label: '🌍 NRI Returns' },
};

function updateQBanner(answers) {
  const banner = document.getElementById('qCategoryBanner');
  const img    = document.getElementById('qCategoryImg');
  const label  = document.getElementById('qCategoryLabel');
  const exitRow = document.getElementById('qExitRow');
  if (!banner || !img || !label) return;

  // Pick most specific image: sub-type answer first, then service
  const keys = [
    answers.devProjectType,
    answers.photographyType,
    answers.itrTaxpayerType,
    answers.service
  ];

  let match = null;
  for (const k of keys) {
    if (k && Q_CATEGORY_IMAGES[k]) { match = Q_CATEGORY_IMAGES[k]; break; }
  }

  if (match) {
    img.src = match.url;
    label.textContent = match.label;
    banner.style.display = 'block';
    if (exitRow) exitRow.style.display = 'none';
  } else {
    banner.style.display = 'none';
    if (exitRow) exitRow.style.display = 'flex';
  }
}
  
// ─── START QUESTIONNAIRE ───
function startQuestionnaire(forceRole) {
  const role = forceRole || (state.user && state.user.role) || selectedRole;
  qState = { step: 0, sequence: [], answers: {}, role: role };

  if (role === 'expert') {
    const expertSteps = WI_SERVICES && WI_SERVICES.questionnaire && WI_SERVICES.questionnaire.expert;
    if (!expertSteps || !expertSteps.length) {
      console.error('[WorkIndex] WI_SERVICES.questionnaire.expert not loaded');
      showToast('Configuration error. Please refresh.', 'error');
      return;
    }
    qState.sequence = expertSteps.map(function(s) { return s.id; });
    qState.step = 0;
  } else {
    qState.sequence = ['service'];
    qState.step = 0;
  }

  showPage('questionnaire');
  setTimeout(function() {
    // Safety check: re-apply sequence if it got wiped during showPage
    if (role === 'expert') {
      const expertSteps = WI_SERVICES && WI_SERVICES.questionnaire && WI_SERVICES.questionnaire.expert;
      if (expertSteps && expertSteps.length) {
        qState.sequence = expertSteps.map(function(s) { return s.id; });
        qState.step = 0;
        qState.role = 'expert';
      }
    }
    renderQuestion();
  }, 100);
}
  
 // ── Question lookup: finds a step by its id across WI_SERVICES ──
  function _lookupQuestion(stepId) {
    const q = WI_SERVICES.questionnaire;
    if (!q) { console.error('[WorkIndex] WI_SERVICES.questionnaire not loaded'); return null; }
 
    // Step 0: service selection
    if (q.serviceSelection && q.serviceSelection.id === stepId) return q.serviceSelection;
 
    // Expert onboarding steps
    if (q.expert) {
      const expertStep = q.expert.find(s => s.id === stepId);
      if (expertStep) {
        if (expertStep.useServiceList) {
          return {
            ...expertStep,
            options: WI_SERVICES.list.map(s => ({
              value: s.value,
              label: s.label,
              icon:  s.icon,
              desc:  s.label
            }))
          };
        }
        return expertStep;
      }
    }
 
    // Service-specific steps (byService)
    if (q.byService) {
      for (const svcSteps of Object.values(q.byService)) {
        const found = svcSteps.find(s => s.id === stepId);
        if (found) return found;
      }
    }
 
    // Common steps
    if (q.common) {
      for (const step of Object.values(q.common)) {
        if (step && step.id === stepId) return step;
      }
    }
 
    console.error('[WorkIndex] _lookupQuestion: step not found:', stepId);
    return null;
  }
  
// ─── RENDER CURRENT QUESTION ───
function renderQuestion() {
  // Guard: if expert role but sequence got corrupted, rebuild it
  if (qState.role === 'expert' && 
      (qState.sequence.length === 0 || qState.sequence[0] === 'service')) {
    const expertSteps = WI_SERVICES && WI_SERVICES.questionnaire && WI_SERVICES.questionnaire.expert;
    if (expertSteps && expertSteps.length) {
      qState.sequence = expertSteps.map(function(s) { return s.id; });
      qState.step = 0;
    }
  }

  const stepKey = qState.sequence[qState.step];
  const question = _lookupQuestion(stepKey);
  
  if (!question) {
    console.error('[WorkIndex] renderQuestion: null question for step:', stepKey);
    return;
  }
  
  const content = document.getElementById('qContent');
  const nextBtn = document.getElementById('qNextBtn');
  const backBtn = document.getElementById('qBackBtn');
  
  if (!content) {
    console.error('Questionnaire DOM not ready — retrying...');
    setTimeout(() => renderQuestion(), 100);
    return;
  }
  
  // Update progress
  const progress = ((qState.step + 1) / qState.sequence.length) * 100;
  const progressFill = document.getElementById('qProgressFill');
  const stepText = document.getElementById('qStepText');
  if (progressFill) progressFill.style.width = progress + '%';
  if (stepText) stepText.textContent = `Step ${qState.step + 1} of ${qState.sequence.length}`;

  // Update category banner image
  updateQBanner(qState.answers);

  // Show/hide back button
  if (backBtn) backBtn.style.display = qState.step > 0 ? 'block' : 'none';
  
  // Render question based on type
  let html = `
    <div style="margin-bottom: 32px;">
      <h2 style="font-size: 26px; font-weight: 800; color: var(--text); margin-bottom: 12px; line-height: 1.2;">${question.title}</h2>
      ${question.subtitle ? `<p style="font-size: 15px; color: var(--text-light); line-height: 1.5;">${question.subtitle}</p>` : ''}
    </div>
  `;
  
  if (question.type === 'service-picker') {
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;">';
    WI_SERVICES.list.forEach(svc => {
      const isSelected = qState.answers['service'] === svc.value;
      html += `
        <button type="button" data-question-key="service" data-option-value="${svc.value}" class="service-picker-option"
          style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:112px;padding:20px 16px;border:2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'};border-radius:12px;cursor:pointer;background:${isSelected ? 'rgba(252,128,25,0.06)' : 'var(--bg)'};text-align:center;transition:all 0.2s;width:100%;font-family:inherit;">
          <span style="font-size:36px;line-height:1;">${svc.icon}</span>
          <span style="display:block;font-size:15px;font-weight:800;color:var(--text);line-height:1.25;white-space:normal;">${svc.label}</span>
          <span style="display:${isSelected ? 'inline-flex' : 'none'};font-size:12px;font-weight:800;color:var(--primary);">Selected</span>
        </button>`;
    });
    html += '</div>';
  }
  else if (question.type === 'single') {
    html += '<div style="display: flex; flex-direction: column; gap: 12px;">';
    question.options.forEach(opt => {
      const isSelected = qState.answers[question.key] === opt.value;
      const questionKey = question.key;
      const optValue = opt.value;
      
      html += `
        <div data-question-key="${questionKey}" data-option-value="${optValue}" class="questionnaire-option" style="padding: 18px 20px; border: 2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}; border-radius: 12px; cursor: pointer; background: ${isSelected ? 'rgba(252, 128, 25, 0.05)' : 'var(--bg)'}; transition: all 0.2s; box-shadow: ${isSelected ? '0 4px 12px rgba(252, 128, 25, 0.15)' : 'none'};">
          <div style="display: flex; align-items: center; gap: 14px;">
            ${opt.icon ? `<span style="font-size: 28px;">${opt.icon}</span>` : ''}
            <div style="flex: 1;">
              <div style="font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 2px;">${opt.label}</div>
              ${opt.desc ? `<div style="font-size: 14px; color: var(--text-muted);">${opt.desc}</div>` : ''}
            </div>
            <div style="width: 22px; height: 22px; border: 2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${isSelected ? '<div style="width: 12px; height: 12px; background: var(--primary); border-radius: 50%;"></div>' : ''}
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }
  else if (question.type === 'multi') {
    html += '<div style="display: flex; flex-direction: column; gap: 12px;">';
    question.options.forEach(opt => {
      const isSelected = (qState.answers[question.key] || []).includes(opt.value);
      const questionKey = question.key;
      const optValue = opt.value;
      
      html += `
        <div data-question-key="${questionKey}" data-option-value="${optValue}" class="questionnaire-multi-option" style="padding: 18px 20px; border: 2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}; border-radius: 12px; cursor: pointer; background: ${isSelected ? 'rgba(252, 128, 25, 0.05)' : 'var(--bg)'}; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 22px; height: 22px; border: 2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: ${isSelected ? 'var(--primary)' : 'transparent'}; flex-shrink: 0;">
              ${isSelected ? '<span style="color: #fff; font-size: 16px; font-weight: 700;">✓</span>' : ''}
            </div>
            <div style="font-size: 16px; font-weight: 600; color: var(--text);">${opt.label}</div>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }
  else if (question.type === 'textarea') {
    const value = qState.answers[question.key] || '';
    const charCount = value.length;
    const isProtectedField = question.key === 'description' || question.key === 'bio'; // ← ADDED
    html += `
      <div style="position: relative;">
        <textarea id="qTextarea" rows="8" placeholder="${question.placeholder}" style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 15px; font-family: inherit; resize: vertical; line-height: 1.6;" oninput="${isProtectedField ? `sanitizeAndUpdateTextInput('${question.key}', this)` : `updateTextInput('${question.key}', this.value)`}">${value}</textarea>
        <div id="qTextareaWarning" style="display:none; margin-top:6px; padding:8px 12px; background:#fff3cd; border:1px solid #ffc107; border-radius:8px; font-size:12px; color:#856404;">
          ⚠️ Phone numbers and social media handles are not allowed in descriptions
        </div>
        <div style="margin-top: 8px; display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted);">
          <span>${question.validation || ''}</span>
          <span>${charCount} / ${question.maxLength || 1000} characters</span>
        </div>
      </div>
    `;
  }
  else if (question.type === 'input' || question.type === 'date') {
    const value = qState.answers[question.key] || '';
    const inputType = question.type === 'date' ? 'date' : (question.inputType || 'text');
    html += `
      <input type="${inputType}" id="qInput" value="${value}" placeholder="${question.placeholder || ''}" style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 16px; font-family: inherit;" oninput="updateTextInput('${question.key}', this.value)">
    `;
  }
  else if (question.type === 'slider') {
    const value = qState.answers[question.key] || question.defaultValue || question.min;
    const budgetGuide = getBudgetGuide(qState.answers);
    html += `
      <div style="padding: 24px 20px; background: var(--bg-gray); border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Your budget</div>
          <div id="sliderValue" style="font-size: 36px; font-weight: 800; color: var(--primary);">${question.format.replace('{value}', value.toLocaleString('en-IN'))}</div>
        </div>
        <input type="range" id="qSlider" min="${question.min}" max="${question.max}" step="${question.step}" value="${value}" style="width: 100%; height: 8px; border-radius: 4px; background: var(--border); outline: none; -webkit-appearance: none;" oninput="updateSliderValue('${question.key}', this.value, '${question.format}')">
        <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 13px; color: var(--text-muted);">
          <span>₹${question.min.toLocaleString('en-IN')}</span>
          <span>₹${question.max.toLocaleString('en-IN')}</span>
        </div>
      </div>
      ${budgetGuide}
    `;
  }
    
    else if (question.type === 'address') {
    const INDIA_STATES = [
      "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh",
      "Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh",
      "Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Ladakh",
      "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
      "Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim",
      "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand",
      "West Bengal"
    ];

    const addressFields = Object.keys(question.fields).length > 0 ? question.fields : {
      building: { label: 'Flat / Building / Area', placeholder: 'e.g. 12B, Sunrise Apartments', required: true },
      area:     { label: 'Area / Locality', placeholder: 'e.g. Koramangala', required: true },
      pincode:  { label: 'Pincode', placeholder: '560034', required: true, autoFillTrigger: true },
      city:     { label: 'City', placeholder: 'e.g. Bengaluru', required: true, autoFilled: true },
      state:    { label: 'State', placeholder: '', type: 'select', required: true, autoFilled: true }
    };

    html += '<div style="display: flex; flex-direction: column; gap: 16px;">';
    Object.entries(addressFields).forEach(([fieldKey, field]) => {
      const value = (qState.answers[question.key] || {})[fieldKey] || '';
      const questionKey = question.key;
      const isSelect = field.type === 'select';
      const isPincodeTrigger = field.autoFillTrigger === true;
      const isAutoFilled = field.autoFilled === true;

      // Determine autofill status for visual treatment
      const currentVal = (qState.answers[question.key] || {})[fieldKey] || '';
      const wasAutoFilled = isAutoFilled && currentVal && (qState.answers[question.key] || {})[fieldKey + '_autofilled'];

      if (isSelect) {
        const options = INDIA_STATES.map(s =>
          `<option value="${s}" ${value === s ? 'selected' : ''}>${s}</option>`
        ).join('');
        html += `
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px;">
              ${field.label}
              ${isAutoFilled ? `<span id="autofill_badge_${questionKey}_${fieldKey}" style="display:${currentVal ? 'inline' : 'none'}; font-size:11px; color:#10b981; font-weight:700; margin-left:6px;">✓ autofilled</span>` : ''}
            </label>
            <select
              id="q_${questionKey}_${fieldKey}"
              style="width: 100%; padding: 14px; border: 2px solid ${currentVal && isAutoFilled ? '#10b981' : 'var(--border)'}; border-radius: 10px; font-size: 15px; background: ${currentVal && isAutoFilled ? 'rgba(16,185,129,0.04)' : 'var(--bg)'}; color: var(--text); transition: border-color 0.3s, background 0.3s;"
              onchange="updateAddressField('${questionKey}', '${fieldKey}', this.value); clearAutoFillBadge('${questionKey}', '${fieldKey}')">
              <option value="">Select state...</option>
              ${options}
            </select>
          </div>
        `;
      } else if (isPincodeTrigger) {
        html += `
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px;">${field.label}</label>
            <div style="position:relative;">
              <input type="text"
                id="q_${questionKey}_${fieldKey}"
                value="${value}"
                placeholder="${field.placeholder}"
                maxlength="6"
                inputmode="numeric"
                style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 10px; font-size: 15px; box-sizing:border-box;"
                oninput="
                  this.value = this.value.replace(/\\D/g,'');
                  updateAddressField('${questionKey}', '${fieldKey}', this.value);
                  if(this.value.length === 6) triggerPincodeAutofill('${questionKey}', this.value);
                ">
              <div id="pincode_spinner_${questionKey}" style="display:none; position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:12px; color:var(--text-muted);">⏳ Looking up...</div>
            </div>
            <div id="pincode_error_${questionKey}" style="display:none; margin-top:6px; font-size:12px; color:#ef4444;"></div>
          </div>
        `;
      } else if (isAutoFilled) {
        // City or state (text, non-select) that gets autofilled
        html += `
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px;">
              ${field.label}
              <span id="autofill_badge_${questionKey}_${fieldKey}" style="display:${currentVal ? 'inline' : 'none'}; font-size:11px; color:#10b981; font-weight:700; margin-left:6px;">✓ autofilled</span>
            </label>
            <input type="text"
              id="q_${questionKey}_${fieldKey}"
              value="${value}"
              placeholder="${field.placeholder}"
              style="width: 100%; padding: 14px; border: 2px solid ${currentVal ? '#10b981' : 'var(--border)'}; border-radius: 10px; font-size: 15px; background: ${currentVal ? 'rgba(16,185,129,0.04)' : 'var(--bg)'}; transition: border-color 0.3s, background 0.3s; box-sizing:border-box;"
              oninput="updateAddressField('${questionKey}', '${fieldKey}', this.value); clearAutoFillBadge('${questionKey}', '${fieldKey}')">
          </div>
        `;
      } else {
        // Normal non-autofill field (building, area, landmark)
        html += `
          <div>
            <label style="display: block; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px;">${field.label}</label>
            <input type="text"
              id="q_${questionKey}_${fieldKey}"
              data-address-field="${fieldKey}"
              value="${value}"
              placeholder="${field.placeholder}"
              style="width: 100%; padding: 14px; border: 2px solid var(--border); border-radius: 10px; font-size: 15px; box-sizing:border-box;"
              oninput="updateAddressField('${questionKey}', '${fieldKey}', this.value)">
          </div>
        `;
      }
    });
    html += '</div>';
  }
  else if (question.type === 'text') {
    const value = qState.answers[question.key] || '';
    html += `
      <input type="text" id="qInput" value="${value}" 
        placeholder="${question.placeholder || ''}" 
        style="width: 100%; padding: 16px; border: 2px solid var(--border); border-radius: 12px; font-size: 16px; font-family: inherit;" 
        oninput="updateTextInput('${question.key}', this.value)">
    `;
  }
  else if (question.type === 'pincode') {
    const value = qState.answers[question.key] || '';
    html += `
      <div style="position:relative;">
        <input type="text"
          id="qPincodeInput"
          value="${value}"
          placeholder="${question.placeholder || 'Enter 6-digit pincode'}"
          maxlength="6"
          inputmode="numeric"
          style="width:100%; padding:14px; border:2px solid var(--border); border-radius:10px; font-size:15px; box-sizing:border-box; letter-spacing:2px;"
          oninput="
            this.value = this.value.replace(/\\D/g,'');
            updateTextInput('${question.key}', this.value);
            lookupPincode(this.value);
          ">
      </div>
      <div id="pincodeResult" style="margin-top:8px;"></div>
    `;
  }
  content.innerHTML = html;
  checkCanProceed()
  attachQuestionnaireListeners();
}

  // ─── ATTACH CLICK LISTENERS TO OPTIONS ───
function attachQuestionnaireListeners() {
  // Single select options
  document.querySelectorAll('.questionnaire-option').forEach(option => {
    option.addEventListener('click', function() {
      const key = this.getAttribute('data-question-key');
      const value = this.getAttribute('data-option-value');
      selectSingleOption(key, value);
    });
  });
  document.querySelectorAll('.service-picker-option').forEach(option => {
    option.addEventListener('click', function() {
      const key = this.getAttribute('data-question-key');
      const value = this.getAttribute('data-option-value');
      selectSingleOption(key, value);
    });
  });
  
  // Multi select options
  document.querySelectorAll('.questionnaire-multi-option').forEach(option => {
    option.addEventListener('click', function() {
      const key = this.getAttribute('data-question-key');
      const value = this.getAttribute('data-option-value');
      toggleMultiOption(key, value);
    });
  });
}   
// ─── OPTION SELECTION HANDLERS ───
function selectSingleOption(key, value) {
  qState.answers[key] = value;
  
  // If service selected, rebuild sequence
  if (key === 'service') {
    qState.sequence = buildQuestionSequence();
    qState.step = Math.min(qState.step + 1, qState.sequence.length - 1);
  }
  // If location type selected, rebuild to add/remove address
  else if (key === 'service_location_type') {
    qState.answers['service_location_type'] = value;
    qState.sequence = buildQuestionSequence();
  }
  
  renderQuestion();
}

function toggleMultiOption(key, value) {
  if (!qState.answers[key]) qState.answers[key] = [];
  const idx = qState.answers[key].indexOf(value);
  if (idx > -1) {
    qState.answers[key].splice(idx, 1);
  } else {
    qState.answers[key].push(value);
  }
  renderQuestion();
}

function updateTextInput(key, value) {
  qState.answers[key] = value;
  checkCanProceed();
}
function updateTextInput(key, value) {
  qState.answers[key] = value;
  checkCanProceed();
}

function sanitizeAndUpdateTextInput(key, textarea) {
  const raw = textarea.value;
  const warning = document.getElementById('qTextareaWarning');

  // ─── Digit phone numbers ───
  const phonePattern = /(\+?[\d][\d\s\-().]{7,}[\d])/g;

  // ─── Social / contact handles ───
  const socialPattern = /@[a-zA-Z0-9._]{2,}|(?:wa\.me|whatsapp|instagram|insta|facebook|fb\.com|twitter|linkedin|telegram|t\.me|snapchat|youtube|tiktok)[\s:/.]*/gi;

  // ─── Word-based phone numbers ───
  // Catches: "eight eight eight eight eight eight eight eight eight eight"
  // "call me at nine eight seven six five four three two one zero"
  // "nine eight seven six five" (5+ consecutive word digits)
  const wordDigits = ['zero','one','two','three','four','five','six','seven','eight','nine'];
  const wordDigitPattern = new RegExp(
    '\\b(' + wordDigits.join('|') + ')' +
    '([\\s\\-,]*(' + wordDigits.join('|') + ')){4,}\\b',
    'gi'
  );

  // ─── Explicit contact phrases with word numbers ───
  const contactWordPattern = /\b(call|contact|reach|ring|ping|text|msg|message)\s+(me\s+)?(at\s+|on\s+)?([a-z\s]+\b(zero|one|two|three|four|five|six|seven|eight|nine)\b)/gi;

  const hasPhone      = phonePattern.test(raw);    phonePattern.lastIndex = 0;
  const hasSocial     = socialPattern.test(raw);   socialPattern.lastIndex = 0;
  const hasWordPhone  = wordDigitPattern.test(raw); wordDigitPattern.lastIndex = 0;
  const hasContactWord = contactWordPattern.test(raw); contactWordPattern.lastIndex = 0;

  const hasViolation = hasPhone || hasSocial || hasWordPhone || hasContactWord;
  if (warning) warning.style.display = hasViolation ? 'block' : 'none';

  let cleaned = raw
    .replace(phonePattern, '***')
    .replace(socialPattern, '***')
    .replace(wordDigitPattern, '***')
    .replace(contactWordPattern, '***');

  if (cleaned !== raw) {
    const pos = textarea.selectionStart;
    textarea.value = cleaned;
    textarea.setSelectionRange(pos, pos);
  }

  updateTextInput(key, cleaned);
}
  
function updateSliderValue(key, value, format) {
  qState.answers[key] = parseInt(value);
  document.getElementById('sliderValue').textContent = format.replace('{value}', parseInt(value).toLocaleString('en-IN'));
  // Live-update the budget guide as user drags slider
  var guideEl = document.getElementById('budgetGuideBox');
  if (guideEl) {
    var newGuide = getBudgetGuide(qState.answers);
    var tmp = document.createElement('div');
    tmp.innerHTML = newGuide;
    var newBox = tmp.firstElementChild;
    if (newBox) guideEl.replaceWith(newBox);
  }
  checkCanProceed();
}

// ─── BUDGET GUIDE ENGINE ────────────────────────────────────────────────────
// Returns HTML string for the contextual budget guide card.
// Reads qState.answers to pick the most specific guide available.
function getBudgetGuide(answers) {
  if (!answers) return '';
  var service = answers.service;
  if (!service) return '';

  // ── ITR Filing ──────────────────────────────────────────────────────────
  if (service === 'itr') {
    var income    = answers.itrAnnualIncome;
    var taxpayer  = answers.itrTaxpayerType;
    var sources   = answers.itrIncomeSources || [];
    var hasCapGains  = sources.includes('capital');
    var hasForeign   = sources.includes('foreign');
    var hasBusiness  = sources.includes('business') || taxpayer === 'business';

    if (hasForeign) {
      return guide('ITR Filing — Foreign Income / DTAA', '₹3,000 – ₹15,000', 'High complexity — foreign income, DTAA claims, and Form 67 significantly increase CA effort.', [
        '🌍 Foreign income disclosures are highly complex',
        '📋 DTAA relief claims need specialist CAs',
        '💡 Budget on the higher end for quality work'
      ]);
    }
    if (hasCapGains) {
      return guide('ITR Filing — Capital Gains (Stocks / Property)', '₹2,000 – ₹15,000', 'Capital gains calculation, LTCG/STCG, and property sales add significant time for the CA.', [
        '📈 Equity/MF capital gains: ₹2,000 – ₹6,000',
        '🏠 Property sale capital gains: ₹5,000 – ₹15,000',
        '💡 Keep all sale/purchase deeds and statements ready'
      ]);
    }
    if (hasBusiness || taxpayer === 'freelancer') {
      if (income === 'above20') {
        return guide('ITR Filing — Business / Freelancer (High Income)', '₹3,000 – ₹10,000', 'Complex business returns with high turnover, P&L, balance sheet, and tax audit may apply.', [
          '📊 P&L and Balance Sheet preparation needed',
          '⚠️ Tax audit mandatory if turnover > ₹1 Cr (business) or ₹50L (professional)',
          '💡 Audit + filing combined: ₹15,000 – ₹30,000'
        ]);
      }
      return guide('ITR Filing — Business / Freelancer', '₹3,000 – ₹10,000', 'Business returns require P&L statement, balance sheet, and expense documentation.', [
        '📁 Keep all invoices and expense proofs ready',
        '📊 Tally/accounting data speeds up the process',
        '💡 Freelancers: ₹3,000 – ₹5,000 | Businesses: ₹5,000 – ₹10,000'
      ]);
    }
    if (income === 'above20') {
      return guide('ITR Filing — High Income Salaried (> ₹20L)', '₹2,500 – ₹8,000', 'Multiple Form 16s, perquisites, stock options, or NPS deductions increase complexity.', [
        '💼 Multiple employers? Each Form 16 adds complexity',
        '📈 ESOPs / RSUs need specialist handling',
        '💡 Typical salaried HNI: ₹3,500 – ₹6,000'
      ]);
    }
    if (income === '15-20') {
      return guide('ITR Filing — Salaried (₹15L – ₹20L)', '₹1,500 – ₹4,000', 'Standard salaried return with investments, HRA, and 80C deductions.', [
        '📋 Form 16 + AIS is all you need to share',
        '🏠 HRA / home loan interest adds minor complexity',
        '💡 Most CAs complete this in 1–2 days'
      ]);
    }
    if (income === '10-15') {
      return guide('ITR Filing — Salaried (₹10L – ₹15L)', '₹1,000 – ₹2,500', 'Straightforward salaried filing with standard deductions.', [
        '📋 Prepare: Form 16, AIS, investment proofs',
        '⚡ Usually completed within 24 hours',
        '💡 New tax regime vs old regime comparison included'
      ]);
    }
    // Default ITR
    return guide('ITR Filing — Salaried (< ₹10L)', '₹1,000 – ₹1,500', 'Simple salaried return with one employer and standard deductions.', [
      '⚡ Fastest and most affordable filing',
      '📋 Just Form 16 required in most cases',
      '💡 Many CAs offer fixed-price packages at ₹999 – ₹1999'
    ]);
  }

  // ── GST Services ────────────────────────────────────────────────────────
  if (service === 'gst') {
    var gstType     = answers.gstServiceType;
    var bizType     = answers.gstBusinessType;
    var turnover    = answers.gstTurnover;
    var hasExisting = answers.gstExisting === 'yes';

    if (gstType === 'registration') {
      return guide('GST New Registration', '₹1,000 – ₹5,000', 'One-time registration fee — straightforward process handled online.', [
        '📋 Needs PAN, Aadhaar, business address proof',
        '⚡ Typically done in 3–7 working days',
        '💡 Most professionals charge ₹1,500 flat for basic registration'
      ]);
    }
    if (gstType === 'notice' || gstType === 'amendment') {
      return guide('GST Notice / Amendment Handling', '₹3,000 – ₹15,000', 'Depends on complexity of the notice — SCNs and scrutiny notices cost more.', [
        '⚠️ Show Cause Notices (SCN): ₹5,000 – ₹15,000',
        '📝 Amendments (address, category): ₹1,000 – ₹2,500',
        '💡 Always engage a CA/tax lawyer for notices'
      ]);
    }
    if (gstType === 'cancellation') {
      return guide('GST Cancellation', '₹1,500 – ₹4,000', 'Includes filing final return (GSTR-10) and closure compliance.', [
        '📋 Final return GSTR-10 must be filed before cancellation',
        '⚡ Takes 15–30 days typically',
        '💡 Ensure all pending returns are filed first'
      ]);
    }
    // Filing (monthly/quarterly) based on turnover
    if (turnover === 'above50') {
      return guide('GST Return Filing — High Turnover (> ₹50L/month)', '₹5,000 – ₹15,000 /month', 'High volume transactions require detailed reconciliation and expert handling.', [
        '📊 GSTR-1, GSTR-3B, annual GSTR-9 all required',
        '🔍 ITC reconciliation is critical at this scale',
        '💡 Consider retaining a CA firm on monthly contract'
      ]);
    }
    if (turnover === '20-50') {
      return guide('GST Return Filing — Medium Turnover (₹20L – ₹50L/month)', '₹3,000 – ₹6,000 /month', 'Regular monthly filings with moderate reconciliation effort.', [
        '📋 GSTR-1 + GSTR-3B monthly filing',
        '📊 Quarterly GSTR-9 reconciliation',
        '💡 Annual contract saves 20–30% vs per-filing charges'
      ]);
    }
    if (turnover === '5-20') {
      return guide('GST Return Filing — Small Business (₹5L – ₹20L/month)', '₹1,500 – ₹3,000 /month', 'Standard monthly GST filing for growing businesses.', [
        '⚡ QRMP scheme may allow quarterly filing — ask your CA',
        '📋 Keep purchase/sales registers updated',
        '💡 Many CAs bundle GST + accounting at ₹3,000 – ₹5,000/month'
      ]);
    }
    return guide('GST Return Filing — Micro Business (< ₹5L/month)', '₹500 – ₹1,500 /month', 'Simple quarterly or monthly filings for small businesses.', [
      '⚡ QRMP scheme: file quarterly, pay monthly',
      '💡 Composition scheme may be better — ask your CA',
      '📋 Nil returns: often ₹200 – ₹500 per filing'
    ]);
  }

  // ── Accounting / Bookkeeping ─────────────────────────────────────────────
  if (service === 'accounting') {
    var freq  = answers.accountingFrequency;
    var txns  = answers.accountingTransactions;
    var sw    = answers.accountingSoftware;
    var biz   = answers.accountingBusinessType;

    if (freq === 'one-time') {
      return guide('One-Time Accounting Setup', '₹5,000 – ₹20,000', 'One-time cleanup, chart of accounts setup, and historical data entry.', [
        '📁 Backlog data entry is priced per year of records',
        '💻 Tally/Zoho setup: ₹3,000 – ₹8,000 one-time',
        '💡 Bundle with monthly retainer for best value'
      ]);
    }
    if (txns === 'above2000') {
      return guide('Bookkeeping — High Volume (> 2000 txns/month)', '₹10,000 – ₹25,000 /month', 'Dedicated accountant or firm needed for enterprise-level bookkeeping.', [
        '👥 Usually requires a dedicated part-time accountant',
        '🔍 Month-end closing, MIS reports included',
        '💡 Consider hiring in-house if volume is consistently this high'
      ]);
    }
    if (txns === '500-2000') {
      return guide('Bookkeeping — Medium Volume (500 – 2000 txns/month)', '₹5,000 – ₹12,000 /month', 'Regular bookkeeping with monthly P&L and balance sheet.', [
        '📊 Monthly P&L + Balance Sheet included',
        '🔍 Bank reconciliation and ledger management',
        '💡 Most SMEs fall in this range'
      ]);
    }
    if (txns === '100-500') {
      return guide('Bookkeeping — Small Business (100 – 500 txns/month)', '₹2,500 – ₹5,000 /month', 'Standard small business bookkeeping with monthly reports.', [
        '📋 Monthly P&L statement included',
        '⚡ Usually completed within 3–5 days of month end',
        '💡 Tally is most commonly used — share access to save cost'
      ]);
    }
    return guide('Bookkeeping — Micro Business (< 100 txns/month)', '₹1,000 – ₹2,500 /month', 'Basic bookkeeping for freelancers and micro businesses.', [
      '⚡ Simple entry-level bookkeeping',
      '💡 Many accountants offer ₹999/month plans for this',
      '📋 Cash book + bank statement is all you need to share'
    ]);
  }

  // ── Audit Services ──────────────────────────────────────────────────────
  if (service === 'audit') {
    var auditType = answers.auditType;
    var orgTov    = answers.auditTurnover;
    var orgType   = answers.auditOrgType;

    if (auditType === 'diligence') {
      return guide('Due Diligence Audit', '₹25,000 – ₹2,00,000+', 'Highly variable — depends on size of business being assessed.', [
        '🏢 Startup due diligence: ₹25,000 – ₹75,000',
        '🏭 SME acquisition DD: ₹75,000 – ₹2,00,000',
        '💡 Always get fixed-fee quotes from multiple CA firms'
      ]);
    }
    if (auditType === 'tax') {
      if (orgTov === 'above20cr') return guide('Tax Audit (Turnover > ₹20 Cr)', '₹75,000 – ₹3,00,000', 'Large-scale statutory + tax audit by a qualified CA firm.', ['📋 Form 3CA/3CB + 3CD mandatory', '🏢 CA firm engagement recommended', '💡 Negotiate fixed annual fee with the firm']);
      if (orgTov === '5-20cr')   return guide('Tax Audit (₹5 Cr – ₹20 Cr)', '₹30,000 – ₹80,000', 'Detailed tax audit with Form 3CA/3CD filing.', ['📋 Maintain all books of accounts properly', '⚡ Complete by Sept 30 deadline', '💡 Bundle with annual returns for discount']);
      if (orgTov === '1-5cr')    return guide('Tax Audit (₹1 Cr – ₹5 Cr)', '₹15,000 – ₹35,000', 'Mandatory if turnover exceeds threshold. CA certification required.', ['📋 Books must be tax-audit ready', '⚡ Typically 2–3 weeks for completion', '💡 Share Tally data for faster turnaround']);
      return guide('Tax Audit (< ₹1 Cr)', '₹8,000 – ₹18,000', 'If applicable — professional audit with Form 3CB + 3CD.', ['📋 Applies if turnover > ₹1 Cr (business) or ₹50L (professional)', '💡 Verify if you actually need a tax audit first']);
    }
    if (auditType === 'internal') {
      return guide('Internal Audit', '₹15,000 – ₹1,00,000+ /quarter', 'Scope-driven — depends on departments, locations, and risk areas.', [
        '📋 Define audit scope clearly before engaging',
        '🏢 Small cos: ₹15,000 – ₹30,000/quarter',
        '🏭 Mid-size: ₹40,000 – ₹1,00,000/quarter'
      ]);
    }
    // Statutory audit by size
    if (orgTov === 'above20cr') return guide('Statutory Audit — Large Company (> ₹20 Cr)', '₹1,00,000 – ₹5,00,000+', 'Complex audit with multiple locations, subsidiaries, or listed entity.', ['🏢 Engage a reputed CA firm with audit experience', '📋 CARO 2020 reporting applicable', '💡 Fees highly negotiable — get 3 quotes']);
    if (orgTov === '5-20cr')    return guide('Statutory Audit — Mid-Size (₹5 Cr – ₹20 Cr)', '₹40,000 – ₹1,20,000', 'Full statutory audit with Companies Act compliance.', ['📋 Maintain board minutes, registers up to date', '⚡ Plan 4–6 weeks for completion', '💡 Combine with tax audit for bundle discount']);
    if (orgTov === '1-5cr')     return guide('Statutory Audit — Small Company (₹1 Cr – ₹5 Cr)', '₹15,000 – ₹45,000', 'Annual statutory audit for private limited companies.', ['📋 Ensure ROC filings are up to date', '⚡ 2–4 weeks timeline typically', '💡 Ask about small company exemptions under Companies Act']);
    return guide('Statutory / Compliance Audit — Small Org', '₹5,000 – ₹18,000', 'Basic statutory audit for small businesses and proprietorships.', ['📋 Simple audit with limited scope', '⚡ Usually done in 1–2 weeks', '💡 Often bundled with annual ITR filing']);
  }

  // ── Photography ─────────────────────────────────────────────────────────
  if (service === 'photography') {
    var pType  = answers.photographyType;
    var pDur   = answers.photographyDuration;
    var pVideo = answers.photographyVideography === 'yes';

    if (pType === 'wedding') {
      if (pDur === 'multiple') {
        var label = pVideo ? 'Wedding Photography + Videography (Multi-Day)' : 'Wedding Photography (Multi-Day)';
        var range = pVideo ? '₹50,000 – ₹3,00,000+' : '₹40,000 – ₹2,00,000';
        return guide(label, range, 'Complete wedding coverage with pre-wedding, functions, and reception.', [
          '📸 Top photographers book 6–12 months in advance',
          '🎥 Cinematic video + drone coverage adds ₹20,000 – ₹80,000',
          '💡 Always review full portfolio and client testimonials',
          '📋 Confirm: raw files, edited count, delivery timeline'
        ]);
      }
      var wRange = pVideo ? '₹40,000 – ₹1,50,000' : '₹20,000 – ₹80,000';
      return guide('Wedding Photography' + (pVideo ? ' + Videography' : '') + ' — Single Day', wRange, 'Single-day wedding or reception coverage.', [
        '📸 Coverage: getting ready → reception exit',
        pVideo ? '🎥 Video package adds ₹20,000 – ₹50,000 typically' : '💡 Photo-only packages are more affordable',
        '📋 Ask about: edited photo count, album, delivery days'
      ]);
    }
    if (pType === 'pre-wedding') {
      return guide('Pre-Wedding Shoot', pVideo ? '₹25,000 – ₹80,000' : '₹10,000 – ₹40,000', 'Outdoor or studio pre-wedding shoot — 2–4 hours typically.', [
        '📍 Location matters — outdoor shoots may have travel costs',
        pVideo ? '🎥 With video reel: add ₹10,000 – ₹30,000' : '📸 Studio setups: ₹8,000 – ₹15,000',
        '💡 Weekday shoots are 15–25% cheaper'
      ]);
    }
    if (pType === 'product') {
      return guide('Product Photography', '₹3,000 – ₹25,000', 'Depends on number of products, styling, and usage (ecommerce vs print).', [
        '📦 Per-product pricing: ₹100 – ₹500/product',
        '🎨 Styled shoots with props: higher cost',
        '💡 White-background ecommerce shots are cheapest',
        '🛍️ Amazon/Flipkart ready images: ₹200 – ₹400/product'
      ]);
    }
    if (pType === 'commercial') {
      return guide('Commercial Photography', '₹15,000 – ₹1,00,000+', 'Advertising, brand, or corporate photography for business use.', [
        '🏢 Corporate headshots: ₹5,000 – ₹15,000/half day',
        '📸 Brand campaigns: ₹25,000 – ₹1,00,000+',
        '💡 Usage rights (print/digital/exclusive) affect pricing significantly'
      ]);
    }
    if (pType === 'event') {
      if (pDur === 'full-day') return guide('Event Photography — Full Day', pVideo ? '₹25,000 – ₹60,000' : '₹12,000 – ₹30,000', 'Corporate events, conferences, or large parties — full day coverage.', ['📸 Multiple setups and locations in one day', pVideo ? '🎥 Highlight reel included in some packages' : '💡 Ask for same-day previews for social media', '📋 Confirm deliverable count and turnaround time']);
      return guide('Event Photography', pVideo ? '₹12,000 – ₹35,000' : '₹5,000 – ₹18,000', 'Corporate events, birthdays, seminars, and social gatherings.', ['📸 Half-day (4 hrs) is most common booking', pVideo ? '🎥 Short highlight video: add ₹8,000 – ₹15,000' : '💡 Tell them: venue, expected guests, key moments', '⚡ Quick turnaround (24–48 hrs) may cost extra']);
    }
    // Portrait / default
    return guide('Portrait Photography', pVideo ? '₹8,000 – ₹25,000' : '₹3,000 – ₹12,000', 'Professional portraits for LinkedIn, family, or personal branding.', [
      '📸 1–2 hour studio session typical',
      '💡 Includes: 10–20 edited images usually',
      pVideo ? '🎥 Personal brand video reel: ₹8,000 – ₹20,000' : '📍 Outdoor locations may add travel charges'
    ]);
  }

  // ── App / Web Development ────────────────────────────────────────────────
  if (service === 'development') {
    var devType  = answers.devProjectType;
    var devStage = answers.devProjectStage;
    var platform = answers.devPlatform || [];
    var timeline = answers.devTimeline;
    var needsMaint = answers.devMaintenance === 'yes';
    var isASAP   = timeline === 'asap';

    if (devType === 'mobile-app') {
      var bothPlatforms = platform.includes('android') && platform.includes('ios');
      var crossPlat     = platform.includes('cross-platform');
      if (bothPlatforms || crossPlat) {
        return guide('Mobile App — Android + iOS (Cross-Platform)', isASAP ? '₹20,000 – ₹3,00,000+' : '₹15,000 – ₹2,00,000', 'Flutter or React Native for both platforms from single codebase.', [
          '📱 Flutter/RN: more cost-effective than native',
          isASAP ? '⚡ Rush projects: add 30–50% premium' : '⏱️ Timeline: 2–6 months typically',
          needsMaint ? '🔧 Monthly maintenance: ₹5,000 – ₹15,000/month' : '💡 Ask about post-launch bug fix warranty',
          '🏪 App Store + Play Store submission included in most quotes'
        ]);
      }
      return guide('Mobile App — Single Platform (Android or iOS)', isASAP ? '₹20,000 – ₹1,50,000' : '₹15,000 – ₹1,20,000', 'Native or cross-platform development for one OS.', [
        '📱 Android: Flutter/Kotlin | iOS: Flutter/Swift',
        isASAP ? '⚡ Rush delivery adds 30–50% to cost' : '⏱️ Timeline: 6 weeks – 4 months',
        needsMaint ? '🔧 Maintenance retainer: ₹4,000 – ₹12,000/month' : '💡 Clarify: backend API included or frontend only?',
        '💡 Get milestone-based payment agreements'
      ]);
    }
    if (devType === 'web-app') {
      return guide('Web Application / SaaS', isASAP ? '₹40,000 – ₹5,00,000+' : '₹30,000 – ₹3,00,000', 'Custom web applications with user auth, dashboards, and business logic.', [
        '🔐 Auth + admin panel + API: core scope',
        isASAP ? '⚡ Rush deadline: expect 40–60% premium' : '⏱️ MVP in 2–4 months | Full product: 4–12 months',
        needsMaint ? '🔧 Server + maintenance: ₹8,000 – ₹25,000/month' : '💡 Hosting is separate — budget ₹2,000 – ₹10,000/month',
        '📋 Always get detailed scope document before paying'
      ]);
    }
    if (devType === 'ecommerce') {
      return guide('E-Commerce Store', isASAP ? '₹25,000 – ₹1,50,000' : '₹15,000 – ₹1,00,000', 'Online store with product catalog, cart, payments, and order management.', [
        '🛒 Shopify/WooCommerce: ₹15,000 – ₹40,000 (faster)',
        '🏗️ Custom-built: ₹40,000 – ₹1,50,000+',
        needsMaint ? '🔧 Monthly AMC: ₹3,000 – ₹8,000' : '💡 Payment gateway setup (Razorpay/PayU) is separate',
        '📦 Product uploads: ₹10 – ₹30 per product if many SKUs'
      ]);
    }
    if (devType === 'website') {
      return guide('Website Development', isASAP ? '₹15,000 – ₹80,000' : '₹8,000 – ₹60,000', 'Business website, landing page, or portfolio — varies by complexity.', [
        '📄 5-page static site: ₹8,000 – ₹20,000',
        '🏢 Business site with CMS (WordPress): ₹15,000 – ₹40,000',
        isASAP ? '⚡ Rush (< 1 week): expect 30–50% premium' : '⏱️ Typically 1–3 weeks',
        needsMaint ? '🔧 Yearly AMC: ₹5,000 – ₹15,000' : '💡 Domain (₹800/yr) + hosting (₹3,000 – ₹6,000/yr) are extra'
      ]);
    }
    if (devType === 'custom') {
      return guide('Custom Software Development', '₹50,000 – ₹10,00,000+', 'ERP, CRM, automation tools, or bespoke enterprise solutions.', [
        '📋 Detailed requirement document is essential first',
        '🏢 Enterprise projects: always fixed-cost with milestones',
        needsMaint ? '🔧 Annual support contract: 15–20% of project cost/year' : '💡 Open-source base (Laravel/Django) reduces cost significantly',
        '⚠️ Avoid full upfront payment — use 30/40/30 milestone structure'
      ]);
    }
    // Default development
    return guide('Software / App Development', '₹25,000 – ₹3,00,000+', 'Wide range depending on complexity, platforms, and tech stack.', [
      '📋 Define scope clearly — vague projects get expensive quotes',
      '💡 MVP first approach saves 40–60% of initial budget',
      needsMaint ? '🔧 Budget for ongoing maintenance from day one' : '⏱️ Realistic timelines prevent cost overruns',
      '⚠️ Always use milestone-based payment — never pay 100% upfront'
    ]);
  }

  return '';
}

// ─── GUIDE CARD BUILDER ──────────────────────────────────────────────────────
function guide(title, range, note, tips) {
  var tipsHtml = tips.map(function(t) {
    var chars = Array.from(String(t || '').trim());
    var first = chars[0] || '•';
    var isEmoji = first.charCodeAt(0) > 127;
    var icon = isEmoji ? first : '★';
    var text = isEmoji ? chars.slice(1).join('').trim() : chars.join('').trim();
    return '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px;">' +
           '<span style="flex-shrink:0;margin-top:1px;color:var(--primary);">' + icon + '</span>' +
           '<span style="font-size:13px;color:var(--text);line-height:1.5;">' + text + '</span></div>';
  }).join('');
  return '<div id="budgetGuideBox" style="margin-top:16px;border-radius:14px;overflow:hidden;border:1.5px solid rgba(252,128,25,0.3);">' +
    '<div style="background:rgba(252,128,25,0.1);padding:14px 16px;border-bottom:1px solid rgba(252,128,25,0.15);">' +
      '<div style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:4px;">💡 Typical Market Rate in India</div>' +
      '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;">' + title + '</div>' +
      '<div style="font-size:22px;font-weight:800;color:var(--primary);">' + range + '</div>' +
      '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' + note + '</div>' +
    '</div>' +
    '<div style="background:var(--bg);padding:14px 16px;">' +
      '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">What to know</div>' +
      tipsHtml +
    '</div>' +
  '</div>';
}
function updateAddressField(key, fieldKey, value) {
  if (!qState.answers[key]) qState.answers[key] = {};
  qState.answers[key][fieldKey] = value;
  checkCanProceed();
}

function normalizeClientRequestAnswers(answers) {
  const normalized = { ...(answers || {}) };
  if (normalized.fullAddress && !normalized.full_address) normalized.full_address = normalized.fullAddress;
  if (normalized.clientLocation && !normalized.client_location) normalized.client_location = normalized.clientLocation;
  if (normalized.serviceLocationType && !normalized.service_location_type) normalized.service_location_type = normalized.serviceLocationType;
  delete normalized.fullAddress;
  delete normalized.clientLocation;
  delete normalized.serviceLocationType;
  return normalized;
}

function normalizeExpertProfileAnswers(answers) {
  const profile = { ...(answers || {}) };
  if (profile.expert_services && !profile.servicesOffered) profile.servicesOffered = profile.expert_services;
  if (profile.expert_specialization && !profile.specialization) profile.specialization = profile.expert_specialization;
  if (profile.expert_experience && !profile.experience) profile.experience = profile.expert_experience;
  if (profile.expert_location && !profile.serviceLocationType) profile.serviceLocationType = profile.expert_location;
  if (profile.expert_business_type && !profile.businessType) profile.businessType = profile.expert_business_type;
  if (profile.expert_team_size && !profile.teamSize) profile.teamSize = profile.expert_team_size;
  if (profile.expert_bio && !profile.bio) profile.bio = profile.expert_bio;
  const loc = profile.expert_location_details;
  if (loc && typeof loc === 'object') {
    if (!profile.city) profile.city = loc.city || '';
    if (!profile.state) profile.state = loc.state || '';
    if (!profile.pincode) profile.pincode = loc.pincode || '';
  }
  return profile;
}

function getClientRequestAddress(answers) {
  const normalized = normalizeClientRequestAnswers(answers);
  const locType = normalized.service_location_type || normalized.serviceLocationType;
  if (locType === 'my-location' || locType === 'professional-office') {
    return normalized.full_address || normalized.fullAddress || null;
  }
  return normalized.client_location || normalized.clientLocation || normalized.full_address || normalized.fullAddress || null;
}

function formatClientRequestLocation(answers) {
  const normalized = normalizeClientRequestAnswers(answers);
  const address = getClientRequestAddress(normalized);
  if (address && (address.city || address.state || address.area || address.pincode)) {
    return [address.area, address.city, address.state, address.pincode].filter(Boolean).join(', ');
  }
  return (normalized.service_location_type || normalized.serviceLocationType) === 'online' ? 'Online' : 'Location not provided';
}

// ─── PINCODE AUTOFILL ────────────────────────────────────────────────────────
async function triggerPincodeAutofill(questionKey, pincode) {
  if (!/^\d{6}$/.test(pincode)) return;

  const spinner = document.getElementById('pincode_spinner_' + questionKey);
  const errBox  = document.getElementById('pincode_error_' + questionKey);
  if (spinner) spinner.style.display = 'block';
  if (errBox)  errBox.style.display  = 'none';

  try {
    const res  = await fetch('https://api.postalpincode.in/pincode/' + pincode);
    const data = await res.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const po       = data[0].PostOffice[0];
      const district = po.District || '';
      const stateName = po.State   || '';

      // Write into qState
      if (!qState.answers[questionKey]) qState.answers[questionKey] = {};
      qState.answers[questionKey].city  = district;
      qState.answers[questionKey].state = stateName;

      // Update city input (text)
      const cityInput = document.getElementById('q_' + questionKey + '_city');
      if (cityInput) {
        cityInput.value = district;
        cityInput.style.border     = '2px solid #10b981';
        cityInput.style.background = 'rgba(16,185,129,0.04)';
      }

      // Update city autofill badge
      const cityBadge = document.getElementById('autofill_badge_' + questionKey + '_city');
      if (cityBadge) cityBadge.style.display = 'inline';

      // Update state — could be <select> or <input>
      const stateEl = document.getElementById('q_' + questionKey + '_state');
      if (stateEl) {
        stateEl.value = stateName;
        stateEl.style.border     = '2px solid #10b981';
        stateEl.style.background = 'rgba(16,185,129,0.04)';
        const stateBadge = document.getElementById('autofill_badge_' + questionKey + '_state');
        if (stateBadge) stateBadge.style.display = 'inline';
      }

      checkCanProceed();
    } else {
      if (errBox) {
        errBox.textContent = 'Pincode not found. Please enter city and state manually.';
        errBox.style.display = 'block';
      }
    }
  } catch (e) {
    // Silent fail — user fills manually
    if (errBox) {
      errBox.textContent = 'Could not look up pincode. Please fill city and state manually.';
      errBox.style.display = 'block';
    }
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}

// Clears the green autofill badge when user manually edits a field
function clearAutoFillBadge(questionKey, fieldKey) {
  const badge = document.getElementById('autofill_badge_' + questionKey + '_' + fieldKey);
  if (badge) badge.style.display = 'none';
  const el = document.getElementById('q_' + questionKey + '_' + fieldKey);
  if (el) {
    el.style.border     = '2px solid var(--border)';
    el.style.background = 'var(--bg)';
  }
}

// ─── EXPERT PINCODE AUTOFILL ─────────────────────────────────────────────────
async function triggerExpertPincodeAutofill(pincode) {
  if (!/^\d{6}$/.test(pincode)) return;

  const spinner = document.getElementById('expert_pincode_spinner');
  const errBox  = document.getElementById('expert_pincode_error');
  if (spinner) spinner.style.display = 'block';
  if (errBox)  errBox.style.display  = 'none';

  try {
    const res  = await fetch('https://api.postalpincode.in/pincode/' + pincode);
    const data = await res.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const po        = data[0].PostOffice[0];
      const district  = po.District || '';
      const stateName = po.State    || '';

      // Pre-fill expert_city answer and advance to next question if it's upcoming
      qState.answers['city']  = district;
      qState.answers['state'] = stateName;

      // Also set by key in case the questionnaire uses key not id
      qState.answers['expert_city']  = district;
      qState.answers['expert_state'] = stateName;

      // If city input is already rendered (visible), fill it
      const cityInput = document.getElementById('q_city') || document.getElementById('q_expert_city');
      if (cityInput) {
        cityInput.value = district;
        cityInput.style.border     = '2px solid #10b981';
        cityInput.style.background = 'rgba(16,185,129,0.04)';
      }

      // If state is rendered as radio, auto-select the matching option
      // (radio buttons — find the one matching stateName and trigger click)
      const stateRadios = document.querySelectorAll('input[name="q_state"], input[name="q_expert_state"]');
      stateRadios.forEach(function(radio) {
        if (radio.value === stateName) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }
      });

      checkCanProceed();
    } else {
      if (errBox) {
        errBox.textContent = 'Pincode not found. Please enter city and state manually.';
        errBox.style.display = 'block';
      }
    }
  } catch (e) {
    if (errBox) {
      errBox.textContent = 'Could not look up pincode. Please fill city and state manually.';
      errBox.style.display = 'block';
    }
  } finally {
    if (spinner) spinner.style.display = 'none';
  }
}
     
// ─── VALIDATION ───
function checkCanProceed() {
  const stepKey = qState.sequence[qState.step];
  const question = _lookupQuestion(stepKey);
  if (!question) return;
  const answer = qState.answers[question.key];
  const nextBtn = document.getElementById('qNextBtn');
  
  let canProceed = false;
  
  if (question.type === 'multi') {
    canProceed = answer && answer.length > 0;
  } else if (question.type === 'textarea') {
    canProceed = answer && answer.trim().length >= (question.minLength || 0);
  } else if (question.type === 'address') {
    const fields = Object.keys(question.fields).length > 0 ? question.fields : {
      building: { required: true }, area: { required: true },
      city: { required: true }, state: { required: true }, pincode: { required: true }
    };
    canProceed = answer && Object.keys(fields).filter(k => fields[k].required).every(k => answer[k] && answer[k].trim().length > 0);
  } else {
    canProceed = answer !== undefined && answer !== null && (typeof answer === 'string' ? answer.trim().length > 0 : true);
  }
  
  // If not required, can always proceed
  if (!question.required) canProceed = true;
  
  if (canProceed) {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
  } else {
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.5';
    nextBtn.style.cursor = 'not-allowed';
  }
}

// ─── NAVIGATION ───
function qNext() {
  if (qState.step < qState.sequence.length - 1) {
    qState.step++;
    renderQuestion();
  } else {
    submitQuestionnaire();
  }
}

function qBack() {
  if (qState.step > 0) {
    qState.step--;
    renderQuestion();
  }
}

// ─── SUBMIT QUESTIONNAIRE ───
async function submitQuestionnaire() {
  const role = qState.role || state.user?.role || selectedRole;
  
  showToast('Submitting...', 'info');
  
  // ── Guest flow: show signup before submitting ──────────────────────
  if (state._guestQuestionnaire && !state.token) {
    showGuestSignupModal();
    return;
  }

  if (role === 'expert') {
    // Update expert profile
    try {
      
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile: normalizeExpertProfileAnswers(qState.answers) })
      });
      
      const data = await res.json();
      if (data.success) {
        const expertProfile = normalizeExpertProfileAnswers(qState.answers);
        state.user = { ...state.user, ...(data.user || {}), profile: expertProfile, questionnaireCompleted: true };
        localStorage.setItem('user', JSON.stringify(state.user));
        showToast('Profile completed successfully!', 'success');
        document.getElementById('questionnaire')?.classList.remove('active');
        showPage('expertDash');
        loadExpertData();
        setTimeout(function() {
          if (typeof showExpertWelcomeModal === 'function') showExpertWelcomeModal();
        }, 500);
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  } else {
    if (isUserRestricted()) { showRestrictedToast(); return; } // ← ADDED
    // Create client request
    try {
      const requestAnswers = normalizeClientRequestAnswers(qState.answers);
      const requestBudget = Number(requestAnswers.budget || 0);
      if (requestBudget < 1000) {
        showToast('Minimum request budget is ₹1,000', 'error');
        return;
      }
      // Save location to client profile too
      const locationData = {};
      if (requestAnswers.full_address) locationData.fullAddress = requestAnswers.full_address;
      if (requestAnswers.client_location) locationData.clientLocation = requestAnswers.client_location;
      if (Object.keys(locationData).length > 0) {
        const locRes = await fetch(`${API_URL}/users/profile`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${state.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: locationData })
        });
        const locData = await locRes.json();
        state.user = { ...state.user, profile: { ...(state.user.profile || {}), ...locationData } };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
      const service = requestAnswers.service;
      const serviceLabels = {
        itr: 'ITR Filing Service',
        gst: 'GST Services',
        accounting: 'Accounting / Bookkeeping',
        audit: 'Audit Services',
        photography: 'Photography Services',
        development: 'App / Web Development'
      };
      
      const title = serviceLabels[service] || 'Professional Service Request';
      const description = requestAnswers.description || 'Request details in questionnaire';

      if (state.directInviteExpert && state.directInviteExpert.id) {
        const inviteRes = await fetch(`${API_URL}/users/expert-invites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            expertId: state.directInviteExpert.id,
            service,
            title,
            description,
            answers: requestAnswers,
            timeline: requestAnswers.urgency || 'flexible',
            budget: requestBudget,
            location: formatClientRequestLocation(requestAnswers)
          })
        });
        const inviteData = await inviteRes.json();
        if (inviteData.success) {
          const expertName = state.directInviteExpert.name || 'expert';
          state.directInviteExpert = null;
          showToast(`Expert invite sent to ${expertName}`, 'success');
          document.getElementById('questionnaire')?.classList.remove('active');
          showPage('clientDash');
          setTimeout(function() {
            switchTab('explore');
            filterClientExplore('invites');
          }, 250);
          return;
        }
        showToast(inviteData.message || 'Failed to send expert invite', 'error');
        return;
      }
      
      const res = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service,
          title,
          description,
          answers: requestAnswers,
          timeline: requestAnswers.urgency || 'flexible',
          budget: requestBudget,
          location: formatClientRequestLocation(requestAnswers)
        })
      });
      
      const data = await res.json();
      if (data.success) {
        showToast('Request posted successfully!', 'success');
        document.getElementById('questionnaire').classList.remove('active');
        const serviceLabelsConfirm = {
          itr: 'ITR Filing', gst: 'GST Services', accounting: 'Accounting / Bookkeeping',
          audit: 'Audit Services', photography: 'Photography', development: 'App / Web Development'
        };
        const confirmEl = document.getElementById('confirmServiceName');
        if (confirmEl) confirmEl.textContent = serviceLabelsConfirm[qState.answers.service] || 'Your Service';
        showPage('requestConfirmation');
        loadClientData();
      } else {
        showToast(data.message || 'Failed to post request', 'error');
      }
    } catch (error) {
      console.error('Post request error:', error);
      showToast('Network error. Please try again.', 'error');
    }
  }
}
