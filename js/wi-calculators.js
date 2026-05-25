(function () {
  'use strict';

  const LAST_CHECKED = '2026-05-25';
  const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

  const sources = {
    income: [
      ['Income Tax e-Filing portal', 'https://www.incometax.gov.in/iec/foportal/'],
      ['ITR downloads and validation rules', 'https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns'],
      ['ICAI BoS Direct Tax modules', 'https://boslive.icai.org/sm_module.php?module=157']
    ],
    gst: [
      ['GST portal', 'https://www.gst.gov.in/'],
      ['CBIC GST', 'https://cbic-gst.gov.in/']
    ]
  };

  const configs = {
    'income-tax-calculator.html': { kind: 'income', title: 'Income Tax Calculator India', subtitle: 'FY 2025-26 / AY 2026-27, old and new regime' },
    'income-tax-calculator-ay-2026-27.html': { kind: 'income', title: 'Income Tax Calculator AY 2026-27', subtitle: 'FY 2025-26 under Income-tax Act, 1961 as applicable to AY 2026-27' },
    'salary-tax-calculator.html': { kind: 'salary', title: 'Salary Tax Calculator India', subtitle: 'Salary, deductions, regime comparison and TDS/refund estimate' },
    'freelance-tax-calculator.html': { kind: 'freelance', title: 'Freelance Tax Calculator India', subtitle: 'Professional receipts, expenses or 44ADA style estimate, tax and advance tax view' },
    'advance-tax-calculator.html': { kind: 'advance', title: 'Advance Tax Calculator India', subtitle: 'Annual tax, credits and quarterly instalment schedule' },
    'tds-calculator-india.html': { kind: 'tds', title: 'TDS Calculator India', subtitle: 'Common sections, thresholds, PAN availability and estimated deduction' },
    'tds-return-late-fee-calculator.html': { kind: 'tdsLate', title: 'TDS Return Late Fee Calculator', subtitle: 'Section 234E late fee estimate capped at TDS amount' },
    'gst-calculator.html': { kind: 'gst', title: 'GST Calculator India', subtitle: 'Inclusive and exclusive GST amount calculator' },
    'gst-2-rate-calculator.html': { kind: 'gst2', title: 'GST Rate Impact Calculator', subtitle: 'Rate comparison calculator; classification still needs official HSN/SAC verification' },
    'gst-interest-calculator.html': { kind: 'gstInterest', title: 'GST Interest Calculator', subtitle: 'Section 50 day-wise interest estimate' },
    'gst-late-fee-calculator.html': { kind: 'gstLate', title: 'GST Late Fee Calculator', subtitle: 'Return-type late fee estimate with common caps' },
    'hra-exemption-calculator.html': { kind: 'hra', title: 'HRA Exemption Calculator', subtitle: 'Actual HRA, rent minus 10% salary and 40%/50% salary comparison' },
    'business-loan-emi-calculator.html': { kind: 'emi', title: 'Business Loan EMI Calculator', subtitle: 'EMI, total interest and total repayment' }
  };

  function n(id) {
    const el = document.getElementById(id);
    return el ? Math.max(0, Number(el.value) || 0) : 0;
  }

  function v(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function money(amount) {
    return 'Rs. ' + INR.format(Math.round(amount || 0));
  }

  function slabTax(income, slabs) {
    let tax = 0;
    let lower = 0;
    for (const [upper, rate] of slabs) {
      if (income > lower) tax += (Math.min(income, upper) - lower) * rate;
      lower = upper;
      if (income <= upper) break;
    }
    return Math.max(0, tax);
  }

  function oldSlabs(age, resident) {
    if (resident === 'resident' && age === 'super') return [[500000, 0], [1000000, 0.20], [Infinity, 0.30]];
    if (resident === 'resident' && age === 'senior') return [[300000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]];
    return [[250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]];
  }

  function newSlabs() {
    return [[400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]];
  }

  function surchargeRate(totalIncome) {
    if (totalIncome > 50000000) return 0.37;
    if (totalIncome > 20000000) return 0.25;
    if (totalIncome > 10000000) return 0.15;
    if (totalIncome > 5000000) return 0.10;
    return 0;
  }

  function calcIncome(values) {
    const regime = values.regime;
    const resident = values.resident;
    const age = values.age;
    const taxpayer = values.taxpayer;
    const standardDeduction = values.salary > 0 ? (regime === 'new' ? 75000 : 50000) : 0;
    const deductions = regime === 'old' ? values.deductions : values.employerNps;
    const normalIncome = Math.max(0, values.salary - standardDeduction + values.house + values.business + values.other - deductions);
    const slabs = regime === 'new' ? newSlabs() : oldSlabs(age, resident);
    const slabTaxValue = slabTax(normalIncome, slabs);
    const ltcgTaxable = Math.max(0, values.ltcg112a - 125000);
    const specialTax = values.stcg111a * 0.20 + ltcgTaxable * 0.125 + values.ltcgOther * 0.125 + values.vda * 0.30;
    const totalIncome = normalIncome + values.stcg111a + values.ltcg112a + values.ltcgOther + values.vda;
    let rebate = 0;
    if (taxpayer === 'individual' && resident === 'resident') {
      if (regime === 'new' && normalIncome <= 1200000) rebate = Math.min(60000, slabTaxValue);
      if (regime === 'old' && normalIncome <= 500000) rebate = Math.min(12500, slabTaxValue);
    }
    const taxAfterRebate = Math.max(0, slabTaxValue - rebate) + specialTax;
    const surcharge = taxAfterRebate * surchargeRate(totalIncome);
    const cess = (taxAfterRebate + surcharge) * 0.04;
    const liability = Math.round(taxAfterRebate + surcharge + cess);
    const credits = values.tds + values.advanceTax + values.tcs;
    return { normalIncome, standardDeduction, deductions, slabTaxValue, ltcgTaxable, specialTax, rebate, taxAfterRebate, surcharge, cess, liability, credits, payable: liability - credits };
  }

  function resultRows(rows) {
    return `<div class="wi-calc-results">${rows.map(([label, value, strong]) => `<div class="${strong ? 'strong' : ''}"><span>${label}</span><b>${value}</b></div>`).join('')}</div>`;
  }

  function sourceBlock(type) {
    const list = (type === 'gst' ? sources.gst : sources.income)
      .map(([label, href]) => `<a href="${href}" rel="nofollow">${label}</a>`).join('');
    return `<section class="wi-calc-note"><h2>Last fact-checked: ${LAST_CHECKED}</h2><p>Calculator logic is for common Indian cases only. Special facts, notices, treaty claims, marginal relief, exemptions and amended notifications can change the final amount.</p><div class="wi-source-links">${list}</div></section>`;
  }

  function shell(config, inner) {
    return `<section class="wi-calc-shell" data-wi-calculator="${config.kind}">
      <div class="wi-calc-head"><div><p class="lp-section-eyebrow">Working calculator</p><h2>${config.title}</h2><p>${config.subtitle}</p></div><a href="/?signup=true&role=client" class="lp-hero-cta">Ask a CA to Review</a></div>
      ${inner}
      ${sourceBlock(config.kind.startsWith('gst') ? 'gst' : 'income')}
    </section>`;
  }

  function incomeForm(config, preset) {
    const salary = preset === 'salary' ? 1275000 : 1599000;
    const business = preset === 'freelance' ? 1200000 : 0;
    const expenses = preset === 'freelance' ? 400000 : 0;
    return shell(config, `<div class="wi-calc-tabs"><span>Basic details</span><span>Income details</span><span>Deductions</span><span>Results</span></div>
      <div class="wi-calc-grid">
        <label>Assessment year<select id="wi-ay"><option>2026-27</option></select></label>
        <label>Taxpayer<select id="wi-taxpayer"><option value="individual">Individual</option><option value="huf">HUF</option></select></label>
        <label>Age category<select id="wi-age"><option value="below60">Less than 60 years</option><option value="senior">60 to 79 years</option><option value="super">80 years or above</option></select></label>
        <label>Residential status<select id="wi-resident"><option value="resident">Resident</option><option value="nonresident">Non-resident</option></select></label>
        <label>Tax regime<select id="wi-regime"><option value="new">New regime (default)</option><option value="old" ${preset === 'official-old' ? 'selected' : ''}>Old regime / opting out of 115BAC(1A)</option></select></label>
        <label>Salary / pension income<input id="wi-salary" type="number" value="${salary}"></label>
        <label>House property income<input id="wi-house" type="number" value="0"></label>
        <label>Business / professional income<input id="wi-business" type="number" value="${business}"></label>
        <label>Business expenses<input id="wi-expenses" type="number" value="${expenses}"></label>
        <label>Other normal income<input id="wi-other" type="number" value="0"></label>
        <label>STCG u/s 111A<input id="wi-stcg111a" type="number" value="0"></label>
        <label>LTCG u/s 112A<input id="wi-ltcg112a" type="number" value="0"></label>
        <label>Other LTCG at 12.5%<input id="wi-ltcg-other" type="number" value="0"></label>
        <label>VDA / crypto income<input id="wi-vda" type="number" value="0"></label>
        <label>Old-regime deductions<input id="wi-deductions" type="number" value="0"></label>
        <label>Employer NPS u/s 80CCD(2)<input id="wi-employer-nps" type="number" value="0"></label>
        <label>TDS credit<input id="wi-tds" type="number" value="0"></label>
        <label>TCS credit<input id="wi-tcs" type="number" value="0"></label>
        <label>Advance tax paid<input id="wi-advance-tax" type="number" value="0"></label>
      </div>
      <button class="lp-hero-cta wi-calc-button" type="button" id="wi-calc-income">Calculate tax</button>
      <div id="wi-income-result" aria-live="polite"></div>
      <p class="wi-calc-small">Section 87A rebate is applied only to slab-rate tax in this calculator. Special-rate income is shown separately and is not reduced by the rebate.</p>`);
  }

  function renderIncomeResult() {
    const businessNet = Math.max(0, n('wi-business') - n('wi-expenses'));
    const values = {
      regime: v('wi-regime'), taxpayer: v('wi-taxpayer'), age: v('wi-age'), resident: v('wi-resident'),
      salary: n('wi-salary'), house: n('wi-house'), business: businessNet, other: n('wi-other'),
      stcg111a: n('wi-stcg111a'), ltcg112a: n('wi-ltcg112a'), ltcgOther: n('wi-ltcg-other'), vda: n('wi-vda'),
      deductions: n('wi-deductions'), employerNps: n('wi-employer-nps'), tds: n('wi-tds'), tcs: n('wi-tcs'), advanceTax: n('wi-advance-tax')
    };
    const selected = calcIncome(values);
    const alt = calcIncome(Object.assign({}, values, { regime: values.regime === 'new' ? 'old' : 'new' }));
    const target = document.getElementById('wi-income-result');
    target.innerHTML = resultRows([
      ['Standard deduction used', money(selected.standardDeduction)],
      ['Normal taxable income', money(selected.normalIncome)],
      ['Income tax before rebate', money(selected.slabTaxValue + selected.specialTax)],
      ['Rebate under section 87A', money(selected.rebate)],
      ['Income tax after rebate', money(selected.taxAfterRebate)],
      ['Surcharge', money(selected.surcharge)],
      ['Health and education cess', money(selected.cess)],
      ['Total tax liability', money(selected.liability), true],
      ['TDS/TCS/advance tax credits', money(selected.credits)],
      [selected.payable >= 0 ? 'Estimated tax payable' : 'Estimated refund', money(Math.abs(selected.payable)), true],
      [`${values.regime === 'new' ? 'Old' : 'New'} regime comparison`, money(alt.liability)]
    ]);
  }

  function gstForm(config, compare) {
    return shell(config, `<div class="wi-calc-grid">
      <label>Amount<input id="wi-gst-amount" type="number" value="100000"></label>
      <label>Amount type<select id="wi-gst-mode"><option value="exclusive">Exclusive of GST</option><option value="inclusive">Inclusive of GST</option></select></label>
      <label>GST rate %<input id="wi-gst-rate" type="number" value="18"></label>
      ${compare ? '<label>Old GST rate %<input id="wi-gst-old-rate" type="number" value="12"></label>' : ''}
      </div><button class="lp-hero-cta wi-calc-button" type="button" id="wi-calc-gst">Calculate GST</button><div id="wi-gst-result"></div><p class="wi-calc-small">This calculates arithmetic only. HSN/SAC classification and notification conditions decide the legal GST rate.</p>`);
  }

  function renderGst(compare) {
    const amount = n('wi-gst-amount');
    const rate = n('wi-gst-rate') / 100;
    const inclusive = v('wi-gst-mode') === 'inclusive';
    const taxable = inclusive ? amount / (1 + rate) : amount;
    const gst = inclusive ? amount - taxable : amount * rate;
    const rows = [['Taxable value', money(taxable)], ['GST amount', money(gst)], ['Invoice total', money(taxable + gst), true]];
    if (compare) {
      const oldRate = n('wi-gst-old-rate') / 100;
      const oldGst = taxable * oldRate;
      rows.push(['Old-rate GST on same taxable value', money(oldGst)], ['Difference', money(gst - oldGst), true]);
    }
    document.getElementById('wi-gst-result').innerHTML = resultRows(rows);
  }

  function simpleForm(config, fields, button, note) {
    return shell(config, `<div class="wi-calc-grid">${fields.map((f) => `<label>${f.label}${f.select ? `<select id="${f.id}">${f.select.map((o) => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select>` : `<input id="${f.id}" type="${f.type || 'number'}" value="${f.value}">`}</label>`).join('')}</div><button class="lp-hero-cta wi-calc-button" type="button" id="${button.id}">${button.label}</button><div id="${button.result}"></div><p class="wi-calc-small">${note}</p>`);
  }

  function attach(config) {
    const host = document.createElement('section');
    host.className = 'lp-section wi-calculator-upgrade';
    let html = '';
    if (['income', 'salary', 'freelance'].includes(config.kind)) html = incomeForm(config, config.kind === 'salary' ? 'salary' : config.kind === 'freelance' ? 'freelance' : config.kind === 'income' && location.pathname.includes('ay-2026-27') ? 'official-old' : '');
    if (config.kind === 'advance') html = incomeForm(config, 'salary');
    if (config.kind === 'gst' || config.kind === 'gst2') html = gstForm(config, config.kind === 'gst2');
    if (config.kind === 'emi') html = simpleForm(config, [
      { id: 'wi-loan', label: 'Loan amount', value: 1000000 }, { id: 'wi-rate', label: 'Annual interest rate %', value: 12 }, { id: 'wi-months', label: 'Tenure in months', value: 36 }
    ], { id: 'wi-calc-emi', label: 'Calculate EMI', result: 'wi-simple-result' }, 'EMI is computed using the standard reducing-balance formula.');
    if (config.kind === 'hra') html = simpleForm(config, [
      { id: 'wi-basic', label: 'Basic salary + DA for period', value: 900000 }, { id: 'wi-hra', label: 'HRA received', value: 360000 }, { id: 'wi-rent', label: 'Rent paid', value: 420000 }, { id: 'wi-metro', label: 'City category', select: [['metro', 'Metro: Delhi, Mumbai, Chennai, Kolkata'], ['nonmetro', 'Other city / unverified expansion claim']] }
    ], { id: 'wi-calc-hra', label: 'Calculate HRA exemption', result: 'wi-simple-result' }, 'Uses the statutory minimum of actual HRA, rent paid minus 10% salary, and 50%/40% of salary. Any expanded metro list should be used only after official notification for the relevant year.');
    if (config.kind === 'gstLate') html = simpleForm(config, [
      { id: 'wi-days', label: 'Days delayed', value: 10 }, { id: 'wi-return-type', label: 'Return type', select: [['gstr3b', 'GSTR-3B / GSTR-1 regular'], ['nil', 'Nil return']] }
    ], { id: 'wi-calc-gst-late', label: 'Calculate late fee', result: 'wi-simple-result' }, 'Common late fee estimate only; portal-calculated fee and notified waivers/caps prevail.');
    if (config.kind === 'gstInterest') html = simpleForm(config, [
      { id: 'wi-tax', label: 'Unpaid tax / ITC amount', value: 100000 }, { id: 'wi-days', label: 'Days delayed', value: 30 }, { id: 'wi-interest-type', label: 'Interest type', select: [['18', 'Late tax payment - 18% p.a.'], ['24', 'Wrongly availed/utilised ITC - 24% p.a.']] }
    ], { id: 'wi-calc-gst-interest', label: 'Calculate interest', result: 'wi-simple-result' }, 'Interest is estimated day-wise. Use portal computation or professional review for notices, DRC-03 and audit cases.');
    if (config.kind === 'tdsLate') html = simpleForm(config, [
      { id: 'wi-days', label: 'Days delayed', value: 20 }, { id: 'wi-tds-amount', label: 'TDS amount in statement', value: 50000 }
    ], { id: 'wi-calc-tds-late', label: 'Calculate 234E late fee', result: 'wi-simple-result' }, 'Section 234E late fee is Rs. 200 per day, capped at the TDS amount.');
    if (config.kind === 'tds') html = simpleForm(config, [
      { id: 'wi-payment', label: 'Payment amount', value: 100000 }, { id: 'wi-section', label: 'Common TDS section', select: [['194J10', '194J professional fees - 10%'], ['194C1', '194C contractor individual/HUF - 1%'], ['194C2', '194C contractor others - 2%'], ['194H', '194H commission - 5%'], ['194I10', '194I rent land/building - 10%'], ['194A', '194A interest - 10%']] }, { id: 'wi-pan', label: 'PAN available?', select: [['yes', 'Yes'], ['no', 'No - apply 20% minimum']] }
    ], { id: 'wi-calc-tds', label: 'Calculate TDS', result: 'wi-simple-result' }, 'This covers common resident-payment sections only. Thresholds, exemptions, lower deduction certificates and non-resident payments need separate review.');
    host.innerHTML = html;
    const richContent = document.querySelector('main .wi-rich-grid > div');
    if (richContent) {
      richContent.replaceWith(host);
    } else {
      document.querySelectorAll('section.lp-section').forEach((section) => {
        const text = section.textContent || '';
        if (section.querySelector('.calc') || section.querySelector('.formula') || text.includes('Formula used')) section.remove();
      });
      const hero = document.querySelector('.lp-hero');
      if (hero && hero.parentNode) hero.insertAdjacentElement('afterend', host);
      else document.body.insertBefore(host, document.querySelector('.lp-cta-section') || document.body.firstChild);
    }

    if (document.getElementById('wi-calc-income')) {
      document.getElementById('wi-calc-income').addEventListener('click', renderIncomeResult);
      renderIncomeResult();
      if (config.kind === 'advance') {
        const originalRender = renderIncomeResult;
        const button = document.getElementById('wi-calc-income');
        const target = document.getElementById('wi-income-result');
        button.textContent = 'Calculate advance tax';
        const renderAdvance = () => {
          originalRender();
          const businessNet = Math.max(0, n('wi-business') - n('wi-expenses'));
          const values = {
            regime: v('wi-regime'), taxpayer: v('wi-taxpayer'), age: v('wi-age'), resident: v('wi-resident'),
            salary: n('wi-salary'), house: n('wi-house'), business: businessNet, other: n('wi-other'),
            stcg111a: n('wi-stcg111a'), ltcg112a: n('wi-ltcg112a'), ltcgOther: n('wi-ltcg-other'), vda: n('wi-vda'),
            deductions: n('wi-deductions'), employerNps: n('wi-employer-nps'), tds: n('wi-tds'), tcs: n('wi-tcs'), advanceTax: n('wi-advance-tax')
          };
          const result = calcIncome(values);
          const netAdvance = Math.max(0, result.liability - values.tds - values.tcs);
          const paid = values.advanceTax;
          const schedule = [['15 June', 0.15], ['15 September', 0.45], ['15 December', 0.75], ['15 March', 1]]
            .map(([date, pct]) => `<div><span>${date} cumulative target</span><b>${money(Math.max(0, netAdvance * pct - paid))}</b></div>`).join('');
          target.innerHTML += `<h3 style="margin-top:22px">Advance tax instalment targets</h3><div class="wi-calc-results">${schedule}</div><p class="wi-calc-small">Advance tax applies when net tax payable after TDS/TCS is Rs. 10,000 or more. Interest under sections 234B/234C depends on actual payment dates and shortfall.</p>`;
        };
        button.removeEventListener('click', renderIncomeResult);
        button.addEventListener('click', renderAdvance);
        renderAdvance();
      }
    }
    if (document.getElementById('wi-calc-gst')) {
      document.getElementById('wi-calc-gst').addEventListener('click', () => renderGst(config.kind === 'gst2'));
      renderGst(config.kind === 'gst2');
    }
    const simple = document.getElementById('wi-simple-result');
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) { el.addEventListener('click', fn); fn(); } };
    bind('wi-calc-emi', () => { const p = n('wi-loan'), r = n('wi-rate') / 1200, m = n('wi-months'); const emi = r ? p * r * Math.pow(1 + r, m) / (Math.pow(1 + r, m) - 1) : p / m; simple.innerHTML = resultRows([['Monthly EMI', money(emi), true], ['Total interest', money(emi * m - p)], ['Total repayment', money(emi * m)]]); });
    bind('wi-calc-hra', () => { const basic = n('wi-basic'), hra = n('wi-hra'), rent = n('wi-rent'), pct = v('wi-metro') === 'metro' ? 0.5 : 0.4; const exempt = Math.max(0, Math.min(hra, Math.max(0, rent - basic * 0.1), basic * pct)); simple.innerHTML = resultRows([['Actual HRA', money(hra)], ['Rent minus 10% salary', money(Math.max(0, rent - basic * 0.1))], [`${pct * 100}% of salary`, money(basic * pct)], ['HRA exemption', money(exempt), true], ['Taxable HRA', money(Math.max(0, hra - exempt))]]); });
    bind('wi-calc-gst-late', () => { const fee = n('wi-days') * (v('wi-return-type') === 'nil' ? 20 : 50); simple.innerHTML = resultRows([['Estimated daily fee', v('wi-return-type') === 'nil' ? 'Rs. 20/day' : 'Rs. 50/day'], ['Estimated late fee', money(fee), true]]); });
    bind('wi-calc-gst-interest', () => { const interest = n('wi-tax') * n('wi-days') * (Number(v('wi-interest-type')) / 100) / 365; simple.innerHTML = resultRows([['Days of delay', INR.format(n('wi-days'))], ['Estimated interest', money(interest), true], ['Total with principal', money(n('wi-tax') + interest)]]); });
    bind('wi-calc-tds-late', () => { const fee = Math.min(n('wi-days') * 200, n('wi-tds-amount')); simple.innerHTML = resultRows([['Uncapped fee at Rs. 200/day', money(n('wi-days') * 200)], ['Cap based on TDS amount', money(n('wi-tds-amount'))], ['Estimated 234E late fee', money(fee), true]]); });
    bind('wi-calc-tds', () => { const rates = { '194J10': 0.10, '194C1': 0.01, '194C2': 0.02, '194H': 0.05, '194I10': 0.10, '194A': 0.10 }; const rate = v('wi-pan') === 'no' ? Math.max(0.20, rates[v('wi-section')]) : rates[v('wi-section')]; simple.innerHTML = resultRows([['Rate used', (rate * 100).toFixed(0) + '%'], ['Estimated TDS', money(n('wi-payment') * rate), true], ['Net payable after TDS', money(n('wi-payment') * (1 - rate))]]); });
  }

  function addStyles() {
    if (document.getElementById('wi-calculator-styles')) return;
    const style = document.createElement('style');
    style.id = 'wi-calculator-styles';
    style.textContent = `.wi-calc-shell{max-width:1160px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:28px;box-shadow:0 18px 45px rgba(15,23,42,.08)}.wi-calc-head{display:flex;gap:20px;align-items:flex-start;justify-content:space-between;margin-bottom:22px}.wi-calc-head h2{font-size:30px;margin:4px 0}.wi-calc-head p{color:#64748b}.wi-calc-tabs{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #e5e7eb;margin-bottom:22px}.wi-calc-tabs span{padding:12px;font-weight:800;color:#1d4ed8}.wi-calc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.wi-calc-grid label{font-weight:800;color:#0f172a}.wi-calc-grid input,.wi-calc-grid select{width:100%;box-sizing:border-box;margin-top:8px;padding:12px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}.wi-calc-button{margin-top:18px}.wi-calc-results{margin-top:20px;border:1px solid #dbeafe;border-radius:8px;overflow:hidden}.wi-calc-results div{display:flex;justify-content:space-between;gap:16px;padding:14px 16px;border-bottom:1px solid #e0f2fe;background:#fff}.wi-calc-results div.strong{background:#fff7ed;font-size:18px}.wi-calc-results div:last-child{border-bottom:0}.wi-calc-small,.wi-calc-note p{font-size:14px;color:#64748b;line-height:1.7}.wi-calc-note{margin-top:24px;padding:18px;border:1px solid #fed7aa;background:#fff7ed;border-radius:10px}.wi-calc-note h2{font-size:18px;margin:0 0 8px}.wi-source-links{display:flex;flex-wrap:wrap;gap:10px}.wi-source-links a{font-weight:800;color:#1d4ed8;text-decoration:none}@media(max-width:760px){.wi-calc-grid,.wi-calc-tabs{grid-template-columns:1fr}.wi-calc-head{display:block}.wi-calc-results div{display:block}.wi-calc-results b{display:block;margin-top:4px}}`;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const slug = location.pathname.split('/').pop();
    const config = configs[slug];
    if (!config) return;
    addStyles();
    attach(config);
  });
})();
