const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);
const factDate = '2026-05-30';
const ctaUrl = '/?signup=true&role=client';

const caps = {
  gst: 'GST', itr: 'ITR', tds: 'TDS', tcs: 'TCS', nri: 'NRI', hni: 'HNI',
  ais: 'AIS', tis: 'TIS', ltcg: 'LTCG', stcg: 'STCG', esop: 'ESOP',
  rsu: 'RSU', fa: 'FA', al: 'AL', itc: 'ITC', irn: 'IRN', hsn: 'HSN',
  mca: 'MCA', dir: 'DIR', inc: 'INC', v3: 'V3', fy: 'FY', ay: 'AY',
  vda: 'VDA', gstat: 'GSTAT', ecrs: 'ECRS', ca: 'CA'
};

const refs = {
  tax: [
    ['Income Tax e-Filing portal', 'https://www.incometax.gov.in/iec/foportal/'],
    ['Income-tax Act 2025 official page', 'https://www.incometax.gov.in/iec/foportal/newdownloads/income-tax-act-2025'],
    ['Income tax return utilities', 'https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns'],
    ['TRACES portal', 'https://www.tdscpc.gov.in/']
  ],
  gst: [
    ['GST portal', 'https://www.gst.gov.in/'],
    ['CBIC GST', 'https://cbic-gst.gov.in/'],
    ['GSTN e-invoice resources', 'https://www.gstn.org.in/e-invoicing'],
    ['GST Council', 'https://gstcouncil.gov.in/']
  ],
  company: [
    ['MCA portal', 'https://www.mca.gov.in/'],
    ['Income Tax e-Filing portal', 'https://www.incometax.gov.in/iec/foportal/']
  ],
  tech: [
    ['Microsoft Power BI documentation', 'https://learn.microsoft.com/power-bi/'],
    ['MDN Web Docs', 'https://developer.mozilla.org/'],
    ['Google Search Central', 'https://developers.google.com/search']
  ]
};

function esc(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => caps[part] || part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function relatedLinks(slugs) {
  return slugs.map((slug) => `<a href="/seo-pages/${slug}.html">${esc(titleFromSlug(slug))}</a>`).join('');
}

function factPanel(page) {
  const tax = page.refType === 'tax'
    ? '<p><strong>Tax caution:</strong> AY 2026-27 covers FY 2025-26 and continues under the Income-tax Act, 1961. New Act, new section and new form references should be verified against official utilities before filing.</p>'
    : '';
  const gst = page.refType === 'gst'
    ? '<p><strong>GST caution:</strong> GST return limits, IMS, IRN reporting, ITC, appeal windows and rate classifications should be checked against the live GST portal, CBIC notifications and current utilities before filing.</p>'
    : '';
  const company = page.refType === 'company'
    ? '<p><strong>Compliance caution:</strong> MCA, audit, accounting and city-service details should be verified against current portal status, company master data, engagement scope and local professional rules.</p>'
    : '';
  const future = page.future
    ? '<p><strong>Research note:</strong> This page uses Batch 15 competitor-gap research and supplied forward-looking 2026 topics. Treat future-dated form or section references as planning notes until official utilities confirm them.</p>'
    : '';
  return `<section class="wi-panel"><div class="lp-section-eyebrow">Official fact-check status</div><h2>Fact-check notes</h2><p><strong>Last fact-checked:</strong> ${factDate}</p>${tax}${gst}${company}${future}<p>Use this page as preparation guidance. A professional should verify the active law year, notification, portal utility and source records before filing or taking a tax position.</p></section>`;
}

function schema(page) {
  const url = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  const graph = [
    { '@type': 'Organization', '@id': 'https://workindex.co.in/#organization', name: 'WorkIndex', url: 'https://workindex.co.in' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.meta },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'WorkIndex', item: 'https://workindex.co.in' }, { '@type': 'ListItem', position: 2, name: page.h1, item: url }] },
    { '@type': 'FAQPage', mainEntity: page.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) },
    { '@type': 'Service', name: page.h1, serviceType: page.type, provider: { '@id': 'https://workindex.co.in/#organization' }, areaServed: { '@type': 'Country', name: 'India' }, description: page.meta }
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function render(page) {
  const canonical = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  const official = refs[page.refType] || refs.tax;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(page.title)}</title><meta name="description" content="${esc(page.meta)}"/><link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${esc(page.title)}"/><meta property="og:description" content="${esc(page.meta)}"/><meta property="og:url" content="${canonical}"/><meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/><link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-rich{padding:56px 24px;max-width:1160px;margin:0 auto}.wi-rich-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;align-items:start}.wi-panel{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}.wi-panel+.wi-panel{margin-top:20px}.wi-panel h2{font-size:24px;margin:0 0 14px}.wi-panel h3{font-size:17px;margin:18px 0 8px}.wi-panel p{color:var(--text-muted);font-size:15px;margin:0 0 12px;line-height:1.75}.wi-detail-list{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}.wi-detail-list li{margin-bottom:7px}.wi-side{position:sticky;top:82px}.wi-ref a,.wi-related a{display:block;color:var(--primary);font-weight:800;text-decoration:none;margin:8px 0}.wi-table{width:100%;border-collapse:collapse;margin-top:12px}.wi-table th,.wi-table td{border:1px solid var(--border);padding:10px;text-align:left;font-size:14px}.wi-table th{background:var(--bg-gray);color:var(--text-dark)}@media(max-width:860px){.wi-rich-grid{grid-template-columns:1fr}.wi-side{position:static}}</style>
<script type="application/ld+json">${schema(page)}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body><nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="${ctaUrl}" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(page.h1)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${esc(page.type)}</div><h1>${esc(page.h1)}<br><span>${esc(page.subtitle)}</span></h1><p>${page.summary}</p><a href="${ctaUrl}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: ${factDate}</div><div class="lp-trust-item">Official sources reviewed</div><div class="lp-trust-item">Duplicate-checked slug</div><div class="lp-trust-item">India-specific page</div></div></section>
<main class="wi-rich"><div class="wi-rich-grid"><div>
${factPanel(page)}
<section class="wi-panel"><div class="lp-section-eyebrow">${esc(page.type)}</div><h2>What this covers</h2><p>${page.summary}</p>${list(page.points)}</section>
${page.table ? `<section class="wi-panel"><div class="lp-section-eyebrow">Quick reference</div><h2>${esc(page.table.title)}</h2><table class="wi-table"><thead><tr>${page.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${page.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></section>` : ''}
<section class="wi-panel"><div class="lp-section-eyebrow">Use cases</div><h2>Who this is for</h2>${list(page.useCases)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Records</div><h2>Documents and data to verify</h2>${list(page.records)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Care points</div><h2>Common mistakes to avoid</h2>${list(page.mistakes)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Action</div><h2>How to proceed</h2>${list(page.process)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Questions people ask</div><h2>FAQs</h2>${page.faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${a}</p>`).join('')}</section>
</div><aside class="wi-side"><div class="wi-panel"><h2>Find the right expert</h2><p>Post the exact facts, documents available, deadline and expected output. WorkIndex helps compare relevant specialists by scope, price and timeline.</p><a href="${ctaUrl}" class="lp-hero-cta" style="padding:12px 18px;font-size:14px">Get Expert Quotes</a></div><div class="wi-panel wi-related"><h2>Related pages</h2>${relatedLinks(page.related)}</div><div class="wi-panel wi-ref"><h2>Sources used</h2>${official.map(([label, href]) => `<a href="${href}" rel="nofollow">${esc(label)}</a>`).join('')}</div></aside></div></main>
<section class="lp-cta-section"><h2>Need this reviewed by a specialist?</h2><p>Share your requirement once and compare relevant WorkIndex experts before hiring.</p><a href="${ctaUrl}" class="lp-hero-cta">Post Requirement as Customer</a></section>
<footer class="lp-footer"><a href="/seo-pages/itr-filing-all-cities.html">ITR cities</a><a href="/seo-pages/gst-services-all-cities.html">GST cities</a><a href="/seo-pages/accounting-services-all-cities.html">Accounting cities</a><a href="/seo-pages/audit-services-all-cities.html">Audit cities</a><a href="/contact.html">Contact</a></footer></body></html>`;
}

function makePage(input) {
  return {
    refType: 'tax',
    future: /2026|2027|new Act|Form 128|Form 145|Form 146|Form 156|Form 138|Form 140|Form 143|Form 144|Section 263|Section 393|Section 394|GST|IMS|IRN|GSTAT|MCA V3/i.test(`${input.title} ${input.summary} ${(input.points || []).join(' ')}`),
    process: ['Confirm the applicable financial year, assessment year, taxpayer type, state and portal status before acting.', 'Reconcile portal data with books, AIS/Form 26AS, GST returns, contracts, invoices, bank statements and source documents.', 'Prepare a written computation, checklist, filing note or response with assumptions clearly stated.', 'Download acknowledgements, challans, workings and evidence after filing or submission.'],
    faqs: [
      ['Can WorkIndex help with this?', 'Yes. Post the facts and documents; relevant experts can quote for filing, advisory, reconciliation, registration, appeal support or ongoing compliance.'],
      ['Is this page final legal advice?', 'No. Use it to prepare. A professional should verify the active law year, notification, portal utility and records before filing or taking a tax position.'],
      ['What should I mention while posting?', 'Mention the year, state, form, deadline, amount involved, documents available, portal status and whether you need filing, correction, advisory or representation.']
    ],
    ...input
  };
}

const baseRecords = ['AIS/Form 26AS or GST portal data, if relevant.', 'Invoices, contracts, bank statements and ledgers.', 'Working papers, computation sheets and past filings.', 'Notices, deadlines, acknowledgements and challans, if any.'];
const baseMistakes = ['Using future-dated rates or form numbers without verifying the active notification.', 'Filing from summary data without reconciling portal records.', 'Missing TDS/TCS/GST credit mismatches.', 'Not keeping proof for deductions, exemptions, ITC claims or disclosures.'];

const formPoints = (name, oldContext) => [
  `${name} is treated as a Batch 15 planning topic based on competitor-gap research and new-form discussions.`,
  oldContext,
  'The live portal form, acknowledgement format and certificate workflow should be checked before filing.',
  'Keep payer/payee identity, amount, section, tax rate, challan and supporting document trails together.'
];

const pages = [
  makePage({
    slug: 'form-128-lower-nil-tds-certificate', type: 'Form guide',
    title: 'Form 128 - Lower or Nil TDS Certificate Guide | WorkIndex',
    meta: 'Form 128 planning guide for lower or nil TDS/TCS certificate applications, replacing old Form 13 style workflows in new Act research.',
    h1: 'Form 128 Lower or Nil TDS Certificate', subtitle: 'Planning for lower deduction certificate applications',
    summary: 'Form 128 is a high-intent lower/nil TDS certificate topic for taxpayers facing excess TDS on recurring receipts, foreign payments, rent, contract income or professional fees.',
    points: formPoints('Form 128', 'It maps to lower or nil deduction certificate planning, similar in purpose to old Form 13 workflows.'),
    useCases: ['Taxpayer with high TDS but low final tax liability.', 'NRI seller or payee seeking lower deduction.', 'Professional receiving recurring 194J TDS.', 'Business planning cash flow before large receipts.'],
    records: ['PAN, residential status and prior returns.', 'Projected income and tax computation.', 'Contracts, invoices and expected receipts.', 'Past TDS details and demand/refund history.'],
    mistakes: ['Applying without a defensible projected income computation.', 'Ignoring old demands or pending proceedings.', 'Uploading incomplete payer details.', 'Assuming certificate validity without checking conditions.'],
    related: ['lower-tds-certificate-section-195', 'tds-filing-services', 'tds-rate-chart-2026-27', 'traces-2-portal-guide'],
    table: { title: 'When Form 128 planning helps', head: ['Situation', 'Risk', 'Expert check'], rows: [['Recurring TDS', 'Cash blocked in refund cycle', 'Projected tax vs deduction'], ['NRI payment', 'Excess deduction or wrong rate', 'DTAA, TRC and section mapping'], ['Business receipt', 'Working capital impact', 'Customer-wise payer details']] }
  }),
  makePage({
    slug: 'form-145-foreign-remittance-guide', type: 'Form guide',
    title: 'Form 145 Foreign Remittance Guide | WorkIndex',
    meta: 'Form 145 foreign remittance planning guide for overseas payments, declaration data, TDS check and bank documentation.',
    h1: 'Form 145 Foreign Remittance Guide', subtitle: 'Planning declarations for foreign payments',
    summary: 'Form 145 is treated as a new foreign remittance declaration planning page for taxpayers making overseas payments where TDS, DTAA, invoice and bank records must align.',
    points: formPoints('Form 145', 'It is positioned as a foreign remittance declaration workflow connected to old Form 15CA style compliance.'),
    useCases: ['Company paying a foreign vendor.', 'Individual remitting fees or purchase consideration overseas.', 'Startup paying SaaS, royalty or technical service invoices.', 'Bank requesting tax declaration before remittance.'],
    records: ['Foreign invoice and contract.', 'Payee country, tax residency certificate and Form 10F where relevant.', 'Nature of payment and withholding analysis.', 'Bank remittance request and board/approval records.'],
    mistakes: ['Treating every foreign invoice as tax-free.', 'No DTAA documentation.', 'Wrong payment classification as reimbursement.', 'Submitting bank paperwork before tax review.'],
    related: ['section-195-tds-non-resident-payments', 'dtaa-benefit-claim-india', 'lower-tds-certificate-section-195', 'fema-compliance-services']
  }),
  makePage({
    slug: 'form-146-ca-certificate-foreign-remittance', type: 'Form guide',
    title: 'Form 146 CA Certificate for Foreign Remittance | WorkIndex',
    meta: 'Form 146 guide for CA certificate planning on foreign remittances, withholding review, DTAA documents and bank submission.',
    h1: 'Form 146 CA Certificate for Foreign Remittance', subtitle: 'CA certificate planning before overseas payments',
    summary: 'Form 146 is the CA-certificate companion topic for foreign remittances where a professional reviews the payment nature, TDS rate, DTAA claim and evidence before bank submission.',
    points: formPoints('Form 146', 'It is positioned as the CA certificate counterpart to foreign remittance declarations, similar to old Form 15CB style workflows.'),
    useCases: ['Business remitting royalty, FTS or software payments.', 'Importer or service buyer asked for CA certificate by bank.', 'Startup with foreign SaaS or cloud subscriptions.', 'NRI or resident making high-value overseas remittance.'],
    records: ['Agreement, invoice and payment advice.', 'TRC, Form 10F and no-PE declaration where relevant.', 'Withholding computation and DTAA article note.', 'Purpose code and bank form draft.'],
    mistakes: ['Certificate issued without reviewing contract substance.', 'No gross-up check for net-of-tax clauses.', 'Ignoring GST RCM or FEMA angle.', 'Mismatch between bank purpose code and tax note.'],
    related: ['section-195-tds-non-resident-payments', 'dtaa-benefit-claim-india', 'fema-compliance-services', 'traces-2-portal-guide']
  }),
  makePage({
    slug: 'form-156-departure-compliance-guide', type: 'Form guide',
    title: 'Form 156 Departure Compliance Guide | WorkIndex',
    meta: 'Form 156 departure compliance guide for people leaving India, tax clearance checks, pending dues and income disclosure readiness.',
    h1: 'Form 156 Departure Compliance Guide', subtitle: 'Tax checks before leaving India',
    summary: 'Form 156 is a niche but high-risk departure compliance topic for people leaving India where tax dues, residency, employment income and pending proceedings must be reviewed.',
    points: formPoints('Form 156', 'It is positioned as a departure compliance declaration topic for taxpayers who may need tax clearance or income confirmation before leaving India.'),
    useCases: ['Expat employee completing Indian assignment.', 'NRI returning abroad after property sale.', 'Foreign national leaving India after local income.', 'Employer handling departure compliance for senior staff.'],
    records: ['Passport and travel dates.', 'Employment contract, Form 16 and payslips.', 'Indian income, capital gains and bank records.', 'Outstanding demand and notice status.'],
    mistakes: ['Leaving with unresolved tax demand.', 'Incorrect residency year treatment.', 'Missing capital gains from India property or shares.', 'No employer exit tax reconciliation.'],
    related: ['itr-filing-for-nri', 'income-tax-clearance-certificate', 'dtaa-benefit-claim-india', 'fema-compliance-services']
  }),
  makePage({
    slug: 'form-138-tds-salary-return-guide', type: 'TDS guide',
    title: 'Form 138 Salary TDS Return Guide | WorkIndex',
    meta: 'Form 138 salary TDS return planning guide for employers, payroll teams, salary certificates and quarterly reconciliation.',
    h1: 'Form 138 Salary TDS Return Guide', subtitle: 'Payroll TDS return planning for employers',
    summary: 'Form 138 is a payroll TDS return planning topic for employers that need clean employee declarations, monthly deductions, challans and salary certificate data.',
    points: formPoints('Form 138', 'It is treated as a salary TDS return planning reference linked to payroll deduction and employee certificate workflows.'),
    useCases: ['Employer setting up payroll TDS.', 'Startup issuing first salary certificates.', 'Payroll team reconciling challans and employee PANs.', 'Company migrating to new-form TDS workflow.'],
    records: ['Employee master and PAN/Aadhaar records.', 'Salary structure, perquisites and investment declarations.', 'Monthly TDS challans and payroll registers.', 'TDS return acknowledgements and correction history.'],
    mistakes: ['Late challan payment.', 'Wrong employee PAN or regime flag.', 'Mismatch between payroll and return data.', 'No perquisite documentation.'],
    related: ['tds-filing-services', 'form-130-vs-form-16', 'payroll-processing-services', 'tds-rate-chart-2026-27']
  }),
  makePage({
    slug: 'form-140-tds-non-salary-return-guide', type: 'TDS guide',
    title: 'Form 140 Non-Salary TDS Return Guide | WorkIndex',
    meta: 'Form 140 non-salary TDS return guide for professional fees, contractor payments, rent, interest, commission and correction readiness.',
    h1: 'Form 140 Non-Salary TDS Return Guide', subtitle: 'Vendor and non-salary deduction reporting',
    summary: 'Form 140 is a non-salary TDS return planning topic for businesses deducting tax on vendor, contractor, professional, rent, interest and commission payments.',
    points: formPoints('Form 140', 'It is treated as a non-salary TDS return planning reference for vendor payment reporting.'),
    useCases: ['Company paying vendors under multiple TDS sections.', 'Finance team reconciling 194C, 194J, rent and commission deductions.', 'Business correcting PAN or challan mismatch.', 'CA filing quarterly non-salary TDS returns.'],
    records: ['Vendor master and PAN validation.', 'Expense ledger section-wise mapping.', 'TDS challans and payment dates.', 'Lower deduction certificates and declarations.'],
    mistakes: ['Wrong section mapping between contractor and professional fees.', 'Missing TDS on provisions or year-end entries.', 'No lower certificate validation.', 'Challan short payment after return filing.'],
    related: ['tds-filing-services', 'missed-tds-deduction-help', 'tds-mismatch-notice-help', 'tds-rate-chart-2026-27']
  }),
  makePage({
    slug: 'form-144-nri-tds-return-guide', type: 'TDS/NRI guide',
    title: 'Form 144 NRI TDS Return Guide | WorkIndex',
    meta: 'Form 144 NRI TDS return planning guide for payments to non-residents, DTAA documents, TRC, Form 10F and withholding records.',
    h1: 'Form 144 NRI TDS Return Guide', subtitle: 'Reporting deductions on non-resident payments',
    summary: 'Form 144 is a non-resident TDS return planning page for payments where residential status, DTAA, TRC, Form 10F and Section 195 withholding must be clear.',
    points: formPoints('Form 144', 'It is positioned as an NRI/non-resident TDS reporting topic connected with foreign payee withholding compliance.'),
    useCases: ['Buyer paying NRI seller.', 'Company paying foreign consultant.', 'Indian business remitting royalty or interest.', 'CA reconciling non-resident withholding.'],
    records: ['Payee residency and PAN, if available.', 'TRC, Form 10F and DTAA note.', 'Agreement and invoice.', 'Challan and certificate evidence.'],
    mistakes: ['Using resident TDS rates for non-resident payees.', 'No TRC for DTAA benefit.', 'Ignoring capital gains withholding on NRI property sale.', 'Incomplete payee address/country data.'],
    related: ['section-195-tds-non-resident-payments', 'itr-filing-for-nri', 'dtaa-benefit-claim-india', 'lower-tds-certificate-section-195']
  }),
  makePage({
    slug: 'form-143-tcs-return-guide', type: 'TCS guide',
    title: 'Form 143 TCS Return Guide | WorkIndex',
    meta: 'Form 143 TCS return guide for sellers and collectors handling LRS, motor vehicle, ecommerce, scrap, tendu leaves and other TCS cases.',
    h1: 'Form 143 TCS Return Guide', subtitle: 'Collector reporting and certificate planning',
    summary: 'Form 143 is a TCS return planning topic for businesses that collect tax at source and need clean buyer, challan and certificate records.',
    points: formPoints('Form 143', 'It is positioned as a TCS return planning reference for collectors under new-form discussions.'),
    useCases: ['Seller collecting TCS on specified goods.', 'Travel or LRS-linked business checking TCS records.', 'Dealer handling motor vehicle TCS.', 'Finance team correcting TCS certificates.'],
    records: ['Buyer PAN and invoice records.', 'TCS section and rate mapping.', 'Monthly challans and quarterly returns.', 'Credit notes, cancellations and refunds.'],
    mistakes: ['Collecting TCS but not depositing on time.', 'Wrong buyer PAN.', 'No reconciliation between sales register and TCS return.', 'Ignoring TCS certificate corrections.'],
    related: ['tcs-uniform-2-percent-guide', 'tds-filing-services', 'tds-rate-chart-2026-27', 'traces-2-portal-guide']
  }),
  makePage({
    slug: 'section-263-return-filing-new-act', type: 'New Act guide',
    title: 'Section 263 Return Filing Under New Income Tax Act | WorkIndex',
    meta: 'Section 263 return filing guide under the new Act research, mapping return filing obligations, due dates, revised returns and belated filing checks.',
    h1: 'Section 263 Return Filing Under New Act', subtitle: 'Return filing obligation planning',
    summary: 'Section 263 is a competitor-fresh new Act topic for return filing obligations. Use it as a planning map while verifying the active return utility and applicable law year.',
    points: ['Maps return filing obligation discussions from old Act filing concepts to new Act language.', 'Useful for due-date, belated return, revised return and taxpayer-category checks.', 'AY 2026-27 transition should be handled carefully because FY 2025-26 filing remains linked to the 1961 Act.', 'Portal year selection controls which form and rule set applies.'],
    useCases: ['Taxpayer checking whether return filing is mandatory.', 'Business owner comparing original, belated and revised return options.', 'CA explaining new Act mapping to clients.', 'NRI or HNI with disclosure-heavy return.'],
    records: ['Income summary by head.', 'TDS/TCS and AIS/Form 26AS data.', 'Prior returns and notice history.', 'Due date and audit applicability notes.'],
    mistakes: ['Using new Act language for the wrong assessment year.', 'Missing mandatory return triggers beyond taxable income.', 'Ignoring revised/belated deadline differences.', 'No disclosure review for foreign assets or capital gains.'],
    related: ['itr-filing-services', 'belated-itr-filing-help', 'revised-return-filing-help', 'income-tax-act-2025-transition-help']
  }),
  makePage({
    slug: 'section-393-tds-new-act-guide', type: 'New Act/TDS guide',
    title: 'Section 393 TDS Under New Income Tax Act | WorkIndex',
    meta: 'Section 393 TDS guide for new Act transition planning, TDS sections, rates, certificates, returns and deduction controls.',
    h1: 'Section 393 TDS Under New Act', subtitle: 'Tax deduction at source transition planning',
    summary: 'Section 393 is treated as the new Act TDS consolidation reference in competitor research. It helps deductors plan rates, challans, returns and certificates without mixing law years.',
    points: ['Summarises TDS compliance areas that businesses must track under new Act terminology.', 'Deduction rate, section and certificate must still be checked from the active rate chart.', 'Payroll and vendor TDS need separate workflows.', 'Wrong or missed TDS can create interest, fee and disallowance risk.'],
    useCases: ['Company setting up TDS compliance.', 'Startup hiring contractors and consultants.', 'Finance team mapping vendor ledger to TDS sections.', 'CA reviewing deduction defaults.'],
    records: ['Vendor and employee master data.', 'Expense ledgers and payment register.', 'TDS challans, returns and certificates.', 'Lower/nil deduction certificates.'],
    mistakes: ['Assuming all service payments use the same TDS section.', 'Not deducting on year-end provisions.', 'Missing non-resident TDS review.', 'No challan-return reconciliation.'],
    related: ['tds-filing-services', 'tds-rate-chart-2026-27', 'missed-tds-deduction-help', 'section-195-tds-non-resident-payments']
  }),
  makePage({
    slug: 'section-394-tcs-new-act-guide', type: 'New Act/TCS guide',
    title: 'Section 394 TCS Under New Income Tax Act | WorkIndex',
    meta: 'Section 394 TCS guide for new Act transition planning, collection at source, buyer records, returns and certificate reconciliation.',
    h1: 'Section 394 TCS Under New Act', subtitle: 'Tax collection at source planning',
    summary: 'Section 394 is treated as the new Act TCS reference for businesses that collect tax at source and need buyer-level records, challans and return reconciliation.',
    points: ['Covers TCS planning for specified sales, LRS-like cases and collector reporting workflows.', 'Buyer PAN, invoice value, rate and collection date must be reliable.', 'TCS return and certificate data should reconcile with sales records.', 'Refund/adjustment cases need careful documentation.'],
    useCases: ['Seller collecting TCS on specified goods.', 'Dealer or travel business checking TCS controls.', 'Finance team reconciling TCS credit complaints.', 'CA filing TCS returns.'],
    records: ['Buyer details and invoices.', 'TCS rate and section mapping.', 'Challans and return acknowledgements.', 'Credit notes and cancellations.'],
    mistakes: ['No buyer PAN validation.', 'Mismatch between sales and TCS returns.', 'Late deposit after collection.', 'Unclear treatment of refunds or cancellations.'],
    related: ['form-143-tcs-return-guide', 'tcs-uniform-2-percent-guide', 'tds-filing-services', 'traces-2-portal-guide']
  }),
  makePage({
    slug: 'tds-return-due-dates-fy-2026-27', type: 'Due-date guide',
    title: 'TDS Return Due Dates FY 2026-27 | WorkIndex',
    meta: 'TDS return due dates FY 2026-27 guide for quarterly filing, challan payment, certificates, late fee and reconciliation controls.',
    h1: 'TDS Return Due Dates FY 2026-27', subtitle: 'Quarterly filing calendar and deduction controls',
    summary: 'This page helps businesses prepare a TDS calendar for FY 2026-27, covering challan payment, quarterly returns, certificates and correction tracking.',
    points: ['TDS compliance is a monthly payment and quarterly return workflow.', 'Salary and non-salary returns must reconcile with challans and PAN-level deductee records.', 'Certificates should be downloaded and shared after return processing.', 'Actual due dates should be verified from the live portal and notification calendar.'],
    useCases: ['Startup creating a compliance calendar.', 'Payroll team planning salary TDS.', 'Finance team filing vendor TDS returns.', 'CA handling quarterly TDS for multiple clients.'],
    records: ['Monthly deduction register.', 'TDS challans and BSR details.', 'Deductee PAN and payment details.', 'Return acknowledgements and correction files.'],
    mistakes: ['Paying challan but missing return filing.', 'Wrong quarter selection.', 'PAN errors causing credit mismatch.', 'Missing certificate download after filing.'],
    related: ['tds-filing-services', 'tds-return-late-fee-calculator', 'missed-tds-deduction-help', 'tds-rate-chart-2026-27']
  }),
  makePage({
    slug: 'tds-late-filing-fee-section-427', type: 'Penalty/help',
    title: 'TDS Late Filing Fee Under Section 427 | WorkIndex',
    meta: 'TDS late filing fee planning guide under new Act section mapping, daily fee, penalty risk, correction and return filing support.',
    h1: 'TDS Late Filing Fee Under Section 427', subtitle: 'Late TDS return fee and correction planning',
    summary: 'Section 427 is a new Act mapping topic for late TDS return fee planning. Deductors should verify active section mapping, fee amount and return status before filing.',
    points: ['Late TDS return filing generally creates fee and sometimes penalty exposure.', 'Fee should be computed with challan and quarter status, not guessed.', 'TDS return processing can also trigger interest and short-payment demands.', 'Correction filings should be planned if PAN, challan or amount is wrong.'],
    useCases: ['Business missed quarterly TDS return.', 'Company received late fee demand.', 'CA regularising old TDS quarters.', 'Deductor fixing wrong PAN or challan data.'],
    records: ['Quarter-wise deduction data.', 'Payment challans and delay calculation.', 'TDS return status and defaults file.', 'Correction statement history.'],
    mistakes: ['Filing return without paying late fee where required.', 'Ignoring interest or short deduction defaults.', 'No deductee credit check after correction.', 'Treating challan payment as return completion.'],
    related: ['tds-return-late-fee-calculator', 'tds-filing-services', 'tds-mismatch-notice-help', 'missed-tds-deduction-help']
  }),
  makePage({
    slug: 'income-tax-interest-234a-234b-234c-new-act', type: 'Penalty/help',
    title: 'Income Tax Interest 234A, 234B and 234C Guide | WorkIndex',
    meta: 'Income tax interest guide for 234A, 234B and 234C: late filing, advance tax shortfall, instalment shortfall and new Act transition planning.',
    h1: 'Income Tax Interest 234A, 234B and 234C', subtitle: 'Late filing and advance tax interest planning',
    summary: 'Sections 234A, 234B and 234C are core filing-season pain points. This page helps taxpayers identify whether interest relates to late filing, advance tax shortfall or instalment shortfall.',
    points: ['234A is generally linked to delay in filing return.', '234B generally relates to shortfall in total advance tax.', '234C generally relates to instalment-wise shortfall.', 'New Act mapping should be verified when preparing future-year computations.'],
    useCases: ['Taxpayer seeing unexpected interest in ITR utility.', 'F&O trader who missed advance tax.', 'Freelancer with TDS lower than final tax.', 'Business checking quarterly payment discipline.'],
    records: ['Tax computation and return utility output.', 'Advance tax challans.', 'TDS/TCS credits and AIS.', 'Income timing by quarter.'],
    mistakes: ['Blaming the portal without checking advance tax.', 'Ignoring special-rate capital gains timing.', 'Not deducting TDS credit before computing advance tax.', 'Missing senior citizen exceptions where applicable.'],
    related: ['advance-tax-calculator', 'advance-tax-penalty-help', 'itr-filing-services', 'income-tax-calculator-ay-2026-27']
  }),
  makePage({
    slug: 'itr-1-ay-2026-27-filing-errors', type: 'ITR help',
    title: 'ITR-1 AY 2026-27 Filing Errors and Fixes | WorkIndex',
    meta: 'Common ITR-1 AY 2026-27 filing errors, wrong form selection, AIS mismatch, rebate issues, bank validation and revised return fixes.',
    h1: 'ITR-1 AY 2026-27 Filing Errors', subtitle: 'Common mistakes before submitting Sahaj',
    summary: 'ITR-1 errors are usually caused by wrong form selection, AIS mismatch, missing deductions, bank validation issues or special-income cases that require another ITR.',
    points: ['ITR-1 is not for every salaried taxpayer; capital gains, foreign assets and business income can force another form.', 'AIS, Form 16 and bank interest should be reconciled before filing.', 'Refund bank account must be validated.', 'If an error is found after filing, revised return options should be checked before the deadline.'],
    useCases: ['Salaried taxpayer with AIS mismatch.', 'Pensioner filing ITR-1.', 'Taxpayer unsure if capital gains disqualify ITR-1.', 'Person correcting wrong return before deadline.'],
    records: ['Form 16 and salary breakup.', 'AIS/Form 26AS and bank interest certificate.', 'Deduction proofs and HRA records.', 'Refund bank validation status.'],
    mistakes: ['Using ITR-1 despite capital gains or foreign assets.', 'Ignoring AIS interest entries.', 'Wrong regime selection.', 'Not e-verifying after filing.'],
    related: ['blog-itr-1-ay-2026-27-guide', 'itr-filing-services', 'ais-mismatch-help', 'how-to-e-verify-itr']
  }),
  makePage({
    slug: 'itr-2-capital-gains-rsu-foreign-assets', type: 'ITR guide',
    title: 'ITR-2 for Capital Gains, RSUs and Foreign Assets | WorkIndex',
    meta: 'ITR-2 guide for salaried taxpayers with capital gains, RSUs, ESOPs, foreign assets, Schedule FA and Schedule CG.',
    h1: 'ITR-2 for Capital Gains, RSUs and Foreign Assets', subtitle: 'Schedule CG, FA and disclosure-heavy returns',
    summary: 'ITR-2 is often needed when a salaried taxpayer has capital gains, RSUs, ESOP sale, foreign bank/broker accounts or Schedule FA disclosures.',
    points: ['Capital gains generally require Schedule CG and broker/FIFO workings.', 'Foreign RSUs can create salary, capital gains and Schedule FA disclosure issues.', 'Dividend and foreign tax credit should be reconciled with statements.', 'ITR-2 is not for business or F&O business income cases.'],
    useCases: ['Tech employee with RSUs.', 'Investor with equity or MF capital gains.', 'Resident with foreign broker account.', 'Salaried taxpayer with multiple disclosures.'],
    records: ['Broker capital gains statement.', 'RSU vest/exercise/sale statement.', 'Foreign account and dividend records.', 'Form 67/foreign tax credit documents where relevant.'],
    mistakes: ['Missing Schedule FA even when foreign assets exist.', 'Using wrong acquisition date for RSUs.', 'Ignoring foreign dividend.', 'Using ITR-1 despite capital gains.'],
    related: ['itr-2-ay-2026-27-guide', 'foreign-rsu-esop-tax-guide', 'schedule-fa-foreign-assets-disclosure', 'capital-gains-tax-services']
  }),
  makePage({
    slug: 'schedule-fa-foreign-assets-disclosure', type: 'ITR disclosure',
    title: 'Schedule FA Foreign Assets Disclosure Guide | WorkIndex',
    meta: 'Schedule FA guide for foreign bank accounts, shares, RSUs, ESOPs, broker accounts, signing authority and disclosure risk.',
    h1: 'Schedule FA Foreign Assets Disclosure', subtitle: 'Foreign assets and income reporting in ITR',
    summary: 'Schedule FA is a high-risk disclosure schedule for residents with foreign assets such as bank accounts, brokerage accounts, RSUs, ESOPs, shares or signing authority.',
    points: ['Resident taxpayers may need to disclose foreign assets even when income is small or already taxed abroad.', 'Schedule FA is different from Schedule AL and foreign income schedules.', 'Calendar-year vs financial-year statement periods can create reconciliation issues.', 'Black Money Act exposure makes omission risky.'],
    useCases: ['Resident employee with foreign RSUs.', 'Person with foreign bank or brokerage account.', 'Founder/director with overseas entity interest.', 'Taxpayer claiming foreign tax credit.'],
    records: ['Foreign account statements.', 'RSU/ESOP vesting and sale reports.', 'Foreign dividend and tax withholding records.', 'TRC/Form 67 documents where relevant.'],
    mistakes: ['Assuming no disclosure because asset value is small.', 'Only reporting income but not asset.', 'Wrong peak balance or ownership period.', 'Missing signing authority accounts.'],
    related: ['itr-2-capital-gains-rsu-foreign-assets', 'dtaa-benefit-claim-india', 'itr-filing-for-stock-options-rsus', 'income-tax-scrutiny-assessment-guide']
  }),
  makePage({
    slug: 'schedule-al-vs-schedule-fa', type: 'ITR disclosure',
    title: 'Schedule AL vs Schedule FA - Asset Disclosure Guide | WorkIndex',
    meta: 'Schedule AL vs Schedule FA guide for high-income taxpayers, foreign assets, Indian assets, liabilities and ITR disclosure checks.',
    h1: 'Schedule AL vs Schedule FA', subtitle: 'Indian asset disclosure vs foreign asset disclosure',
    summary: 'Schedule AL and Schedule FA solve different disclosure problems: AL tracks Indian assets/liabilities for high-income taxpayers, while FA tracks foreign assets for residents.',
    points: ['Schedule AL generally focuses on assets and liabilities for high-income taxpayers.', 'Schedule FA focuses on foreign assets, accounts, income and signing authority.', 'The same taxpayer may need both schedules.', 'Incorrect disclosure can create scrutiny or penalty risk.'],
    useCases: ['HNI filing ITR-2.', 'Resident with foreign bank or RSU account.', 'Taxpayer above income disclosure threshold.', 'CA reconciling asset schedule with AIS.'],
    records: ['Property, vehicle, jewellery and financial asset details.', 'Foreign account and securities statements.', 'Loan and liability records.', 'Prior-year schedule values for consistency.'],
    mistakes: ['Treating Schedule AL and FA as substitutes.', 'Not disclosing inherited or jointly held assets correctly.', 'Ignoring foreign signing authority.', 'Using market value where cost/value field requires a different basis.'],
    related: ['wealth-tax-india-guide', 'itr-filing-for-hni-high-net-worth', 'schedule-fa-foreign-assets-disclosure', 'blog-schedule-al-mandatory-disclosure']
  }),
  makePage({
    slug: 'ais-tis-mismatch-ay-2026-27', type: 'ITR help',
    title: 'AIS and TIS Mismatch AY 2026-27 | WorkIndex',
    meta: 'AIS and TIS mismatch guide for AY 2026-27 ITR filing, incorrect income entries, duplicate transactions, feedback and reconciliation.',
    h1: 'AIS and TIS Mismatch AY 2026-27', subtitle: 'How to reconcile before filing ITR',
    summary: 'AIS/TIS mismatch is a filing-season problem where income, TDS, securities transactions, interest, dividend or property entries do not match taxpayer records.',
    points: ['AIS is transaction-level information; TIS is a processed summary for return prefill.', 'Incorrect or duplicate entries should be reviewed before filing.', 'Feedback can be submitted on AIS, but return positions should be supported by records.', 'Mismatch with Form 26AS, broker statements or bank records needs careful reconciliation.'],
    useCases: ['Taxpayer seeing duplicate interest or dividend.', 'Investor with broker capital gains mismatch.', 'Salaried taxpayer with wrong TDS credit.', 'NRI with property sale entry mismatch.'],
    records: ['AIS and TIS downloads.', 'Form 26AS.', 'Bank, broker and mutual fund statements.', 'Sale deeds, invoices and TDS certificates.'],
    mistakes: ['Blindly accepting AIS as final income.', 'Ignoring TIS prefill differences.', 'Not saving AIS feedback proof.', 'Filing before reconciling large entries.'],
    related: ['ais-mismatch-help', 'form-26as-mismatch-help', 'blog-how-to-read-form-26as-ais', 'itr-filing-services']
  }),
  makePage({
    slug: 'form-16-not-available-itr-filing', type: 'How-to',
    title: 'How to File ITR When Form 16 Is Not Available | WorkIndex',
    meta: 'Guide to filing ITR without Form 16 using salary slips, AIS, Form 26AS, bank statements, HRA and deduction proofs.',
    h1: 'File ITR When Form 16 Is Not Available', subtitle: 'Use salary slips, AIS and Form 26AS carefully',
    summary: 'If Form 16 is delayed or unavailable, a salaried taxpayer can still prepare an ITR from salary slips, bank credits, AIS/Form 26AS and deduction evidence.',
    points: ['Form 16 is convenient but not the only source for salary computation.', 'Salary, allowances, perquisites and TDS must be reconstructed carefully.', 'AIS/Form 26AS helps verify TDS credit.', 'Employer corrections may still be needed if TDS data is wrong.'],
    useCases: ['Employer delayed Form 16.', 'Employee changed jobs.', 'Company closed or HR unreachable.', 'Taxpayer filing before deadline with available records.'],
    records: ['Monthly payslips.', 'Bank salary credits.', 'AIS/Form 26AS.', 'Investment, HRA, rent and deduction proofs.'],
    mistakes: ['Using net salary as taxable salary.', 'Ignoring perquisites or allowances.', 'Claiming TDS not visible in Form 26AS without follow-up.', 'Missing second employer income.'],
    related: ['form-16-download-help', 'itr-for-multiple-form-16', 'itr-filing-for-salaried-employees', 'blog-understanding-your-salary-slip']
  }),
  makePage({
    slug: 'revised-return-deadline-march-31-2027', type: 'ITR guide',
    title: 'Revised Return Deadline March 31, 2027 | WorkIndex',
    meta: 'Revised return deadline guide for AY 2026-27 planning, correction options, belated return, ITR-U and e-verification checks.',
    h1: 'Revised Return Deadline March 31, 2027', subtitle: 'Correction planning for AY 2026-27 returns',
    summary: 'Revised return deadlines are time-sensitive and should be checked in the active portal. This page helps taxpayers plan corrections before the window closes.',
    points: ['Revised return is used to correct mistakes in an already filed return.', 'Deadline changes should be verified from official announcements and portal utilities.', 'E-verification is required after revised return filing.', 'If revised return window is closed, updated return options may be different and costlier.'],
    useCases: ['Taxpayer missed income or deduction.', 'Wrong ITR form filed.', 'AIS mismatch discovered after filing.', 'Refund bank or TDS credit correction needed.'],
    records: ['Original return acknowledgement.', 'Defect/mismatch reason and corrected records.', 'AIS/Form 26AS and revised computation.', 'E-verification proof.'],
    mistakes: ['Assuming revised return is complete without e-verification.', 'Using rectification instead of revised return for factual mistakes.', 'Missing deadline while waiting for refund.', 'Not preserving old and revised computations.'],
    related: ['how-to-change-itr-filing-status', 'revised-return-filing-help', 'itr-u-48-months-window-guide', 'belated-itr-filing-help']
  }),
  makePage({
    slug: 'itr-4-ay-2026-27-common-mistakes', type: 'ITR help',
    title: 'ITR-4 AY 2026-27 Common Mistakes | WorkIndex',
    meta: 'Common ITR-4 AY 2026-27 mistakes for presumptive taxpayers, 44AD, 44ADA, GST turnover, capital gains and wrong form selection.',
    h1: 'ITR-4 AY 2026-27 Common Mistakes', subtitle: 'Presumptive filing checks before submission',
    summary: 'ITR-4 is useful for eligible presumptive taxpayers, but mistakes happen when turnover, profession type, capital gains, foreign assets or GST data make the form unsuitable.',
    points: ['ITR-4 eligibility should be checked before using presumptive income schedules.', 'GST turnover and bank receipts should support declared receipts.', 'Capital gains, foreign assets or certain directorship/partnership cases may need another form.', 'Lower-than-presumptive profit can trigger books/audit questions.'],
    useCases: ['Freelancer using 44ADA.', 'Small business using 44AD.', 'Consultant with GST registration.', 'Taxpayer unsure between ITR-3 and ITR-4.'],
    records: ['Gross receipts and bank statements.', 'GST returns and invoices.', 'Expense summary if comparing actual vs presumptive.', 'AIS/Form 26AS and TDS certificates.'],
    mistakes: ['Using ITR-4 despite capital gains or foreign assets.', 'Ignoring GST turnover mismatch.', 'Declaring low profit without audit review.', 'Wrong profession/business code.'],
    related: ['itr-4-ay-2026-27-guide', 'presumptive-taxation-44ad-44ada-guide', 'itr-3-ay-2026-27-guide', 'itr-filing-for-freelancers']
  }),
  makePage({
    slug: 'section-112a-ltcg-equity-guide', type: 'Capital gains',
    title: 'Section 112A LTCG on Equity Guide | WorkIndex',
    meta: 'Section 112A guide for long-term capital gains on listed equity and equity mutual funds, exemption threshold, STT, grandfathering and ITR reporting.',
    h1: 'Section 112A LTCG on Equity', subtitle: 'Listed equity and equity mutual fund capital gains',
    summary: 'Section 112A covers long-term capital gains on listed equity shares and equity-oriented mutual funds where STT and holding-period conditions affect tax reporting.',
    points: ['LTCG classification depends on asset type, holding period and STT conditions.', 'Annual exemption threshold and rate should be checked for the active year.', 'Grandfathering may matter for old holdings acquired before the specified cut-off.', 'ITR schedules need scrip-wise or summary reporting depending on utility requirements.'],
    useCases: ['Investor selling listed shares.', 'Mutual fund investor redeeming equity funds.', 'Taxpayer with old grandfathered holdings.', 'CA reconciling broker statement with AIS.'],
    records: ['Broker capital gains report.', 'Demat statement and contract notes.', 'STT evidence and purchase cost.', 'AIS securities transaction data.'],
    mistakes: ['Using wrong holding period.', 'Ignoring grandfathering for old shares.', 'Mismatch between broker report and AIS.', 'Not setting off losses correctly.'],
    related: ['equity-mutual-fund-tax-guide-2026', 'capital-gains-tax-services', 'itr-filing-for-mutual-fund-investors', 'section-111a-stcg-equity-guide']
  }),
  makePage({
    slug: 'section-111a-stcg-equity-guide', type: 'Capital gains',
    title: 'Section 111A STCG on Equity Guide | WorkIndex',
    meta: 'Section 111A guide for short-term capital gains on listed equity and equity mutual funds, STT conditions, rate check and ITR reporting.',
    h1: 'Section 111A STCG on Equity', subtitle: 'Short-term equity capital gains reporting',
    summary: 'Section 111A applies to short-term capital gains on specified equity transactions where STT and asset classification determine special-rate taxation.',
    points: ['STCG on listed equity/equity funds can have a special tax rate when conditions are met.', 'Intraday and F&O are not Section 111A capital gains and need separate classification.', 'Broker reports should be reviewed for STCG vs LTCG split.', 'Loss set-off and carry-forward depend on timely filing.'],
    useCases: ['Active equity investor.', 'Taxpayer with short-term share sales.', 'Person confusing intraday/F&O with capital gains.', 'CA preparing Schedule CG.'],
    records: ['Broker capital gains statement.', 'Trade-wise report for STT and dates.', 'AIS securities transactions.', 'Prior-year capital loss records.'],
    mistakes: ['Treating F&O as capital gains.', 'Missing STT condition.', 'Wrong date of acquisition/sale.', 'Not carrying forward losses due to late filing.'],
    related: ['section-112a-ltcg-equity-guide', 'fno-trading-tax-guide', 'capital-loss-setoff-carry-forward', 'capital-gains-tax-services']
  }),
  makePage({
    slug: 'debt-mutual-fund-taxation-2026', type: 'Investment tax',
    title: 'Debt Mutual Fund Taxation 2026 | WorkIndex',
    meta: 'Debt mutual fund taxation guide for 2026, slab-rate treatment, capital gains statement, indexation history and ITR reporting.',
    h1: 'Debt Mutual Fund Taxation 2026', subtitle: 'Tax treatment for debt fund redemptions',
    summary: 'Debt mutual fund taxation remains confusing because rules changed across periods. Investors need purchase-date, fund-type and redemption records before filing.',
    points: ['Debt fund tax treatment depends on acquisition date and fund composition rules.', 'Many debt fund gains are taxed at slab rate under newer rules.', 'Broker/CAMS/KFin statements should be reconciled with AIS.', 'Indexation assumptions should not be used without checking eligibility.'],
    useCases: ['Investor redeeming debt funds.', 'Retiree with liquid/short-term funds.', 'Taxpayer with old and new debt fund units.', 'CA preparing capital gains schedule.'],
    records: ['CAMS/KFin capital gains statement.', 'Purchase and redemption dates.', 'Fund classification and statement.', 'AIS mutual fund entries.'],
    mistakes: ['Applying equity fund treatment to debt funds.', 'Assuming indexation for all old holdings.', 'Ignoring IDCW/dividend income.', 'Not using FIFO for units.'],
    related: ['itr-filing-for-mutual-fund-investors', 'equity-mutual-fund-tax-guide-2026', 'capital-gains-tax-services', 'blog-equity-mf-tax-guide-2026']
  }),
  makePage({
    slug: 'tax-loss-harvesting-india-guide', type: 'Investment tax',
    title: 'Tax Loss Harvesting India Guide | WorkIndex',
    meta: 'Tax loss harvesting India guide for equity, mutual funds, capital gains, loss set-off, wash-sale caution and year-end planning.',
    h1: 'Tax Loss Harvesting in India', subtitle: 'Capital gains planning before year end',
    summary: 'Tax loss harvesting means realising eligible capital losses to set off capital gains, but the strategy needs timing, asset classification and documentation discipline.',
    points: ['Short-term and long-term losses have different set-off rules.', 'Harvesting must be based on actual sale transactions and broker records.', 'Repurchase timing should be discussed with an advisor to avoid artificial planning concerns.', 'Loss carry-forward usually requires timely return filing.'],
    useCases: ['Investor with large equity gains.', 'Mutual fund investor before March 31.', 'HNI doing year-end tax planning.', 'CA comparing gain/loss scenarios.'],
    records: ['Portfolio holdings and unrealised gain/loss report.', 'Realised capital gains statement.', 'Prior-year carried losses.', 'Trade confirmations after sale/rebuy.'],
    mistakes: ['Harvesting without checking STCG/LTCG bucket.', 'Missing return deadline and losing carry-forward.', 'Ignoring transaction cost and market risk.', 'No evidence of actual sale.'],
    related: ['capital-loss-setoff-carry-forward', 'section-112a-ltcg-equity-guide', 'section-111a-stcg-equity-guide', 'capital-gains-tax-services']
  }),
  makePage({
    slug: 'capital-loss-setoff-carry-forward', type: 'Capital gains',
    title: 'Capital Loss Set-Off and Carry Forward Guide | WorkIndex',
    meta: 'Capital loss set-off and carry forward guide for STCL, LTCL, equity, property, mutual funds, timely filing and ITR schedules.',
    h1: 'Capital Loss Set-Off and Carry Forward', subtitle: 'Use losses correctly in ITR',
    summary: 'Capital losses can reduce future capital gains only when classified, set off and carried forward correctly under ITR rules.',
    points: ['Short-term capital loss and long-term capital loss have different set-off rules.', 'Capital losses generally cannot be set off against salary or business income.', 'Timely return filing is important for carry-forward.', 'Prior-year loss schedules must be continued accurately.'],
    useCases: ['Investor with share market loss.', 'Property seller with capital loss.', 'Mutual fund investor with mixed gains and losses.', 'Taxpayer correcting loss schedule.'],
    records: ['Capital gains/loss statement.', 'Prior-year ITR loss schedule.', 'Trade and sale documents.', 'AIS/Form 26AS capital gains entries.'],
    mistakes: ['Setting off LTCL against STCG incorrectly.', 'Missing carry-forward due to late filing.', 'Not reporting small losses.', 'Forgetting prior-year loss expiry.'],
    related: ['tax-loss-harvesting-india-guide', 'capital-gains-tax-services', 'itr-filing-for-capital-gains', 'section-111a-stcg-equity-guide']
  }),
  makePage({
    slug: 'foreign-rsu-esop-tax-guide', type: 'ESOP/NRI',
    title: 'Foreign RSU and ESOP Tax Guide India | WorkIndex',
    meta: 'Foreign RSU and ESOP tax guide for Indian residents, salary perquisite, capital gains, Schedule FA, foreign tax credit and ITR-2 filing.',
    h1: 'Foreign RSU and ESOP Tax Guide', subtitle: 'Salary, capital gains and foreign asset disclosure',
    summary: 'Foreign RSUs and ESOPs can create salary perquisite, capital gains, dividend, foreign tax credit and Schedule FA reporting in the same return.',
    points: ['Vesting or exercise may create salary/perquisite income depending on plan structure.', 'Sale creates capital gains with foreign currency conversion and acquisition-date issues.', 'Holding foreign shares can trigger Schedule FA disclosure.', 'Foreign tax credit needs Form 67 and supporting tax documents where eligible.'],
    useCases: ['Indian resident employee of MNC.', 'Tech employee selling US RSUs.', 'Startup employee exercising ESOPs.', 'CA preparing ITR-2 with foreign assets.'],
    records: ['Grant, vest and exercise statements.', 'Sale confirmation and broker statement.', 'Foreign tax withholding documents.', 'Exchange rate and Schedule FA data.'],
    mistakes: ['Only reporting sale and missing vest perquisite.', 'No Schedule FA disclosure.', 'Wrong cost basis in INR.', 'Missing foreign dividend.'],
    related: ['itr-filing-for-stock-options-rsus', 'itr-2-capital-gains-rsu-foreign-assets', 'schedule-fa-foreign-assets-disclosure', 'blog-esop-taxation-india']
  }),
  makePage({
    slug: 'unlisted-shares-capital-gains-tax', type: 'Capital gains',
    title: 'Unlisted Shares Capital Gains Tax Guide | WorkIndex',
    meta: 'Unlisted shares capital gains tax guide for startup shares, holding period, valuation, cost basis, share transfer and ITR reporting.',
    h1: 'Unlisted Shares Capital Gains Tax', subtitle: 'Startup and private company share sale planning',
    summary: 'Unlisted share sales need careful holding-period classification, valuation support, cost basis, transfer documents and ITR reporting.',
    points: ['Unlisted shares generally have a different holding-period threshold than listed equity.', 'Share transfer documents and valuation records matter.', 'Resident/non-resident and FEMA issues may apply.', 'Buyback, secondary sale and company purchase need different tax analysis.'],
    useCases: ['Startup founder selling shares.', 'Angel investor exiting private company.', 'Employee selling ESOP shares.', 'NRI selling Indian private company shares.'],
    records: ['Share certificate or demat record.', 'Subscription/exercise cost documents.', 'Share purchase agreement and valuation report.', 'Bank receipt and TDS records, if any.'],
    mistakes: ['Using listed equity rates blindly.', 'No valuation or transfer proof.', 'Ignoring FEMA/non-resident withholding.', 'Confusing buyback with sale.'],
    related: ['itr-filing-for-startup-founders', 'share-buyback-capital-gains-2026', 'capital-gains-tax-services', 'foreign-rsu-esop-tax-guide']
  }),
  makePage({
    slug: 'deemed-dividend-section-2-22-guide', type: 'Dividend tax',
    title: 'Deemed Dividend Section 2(22) Guide | WorkIndex',
    meta: 'Deemed dividend Section 2(22) guide for loans, advances, buybacks, closely held companies, shareholder taxation and ITR reporting.',
    h1: 'Deemed Dividend Section 2(22) Guide', subtitle: 'Loans, advances and shareholder tax risk',
    summary: 'Deemed dividend rules can tax certain company payments, loans or distributions to shareholders even when they are not labelled as dividend.',
    points: ['Closely held company loans/advances to shareholders can create deemed dividend risk.', 'Buyback-related deemed dividend treatment depends on transaction date and law year.', 'Shareholding percentage and accumulated profits must be reviewed.', 'Company books and shareholder ITR treatment should match.'],
    useCases: ['Director-shareholder receiving company loan.', 'Closely held company making advances.', 'Founder reviewing buyback treatment.', 'CA reviewing related-party ledger.'],
    records: ['Shareholding pattern.', 'Loan/advance ledger.', 'Accumulated profits computation.', 'Board minutes and repayment records.'],
    mistakes: ['Calling it a loan without checking deemed dividend rules.', 'No shareholder percentage review.', 'Ignoring accumulated profits.', 'Mismatch between company and shareholder returns.'],
    related: ['dividend-taxation-india-guide', 'share-buyback-capital-gains-2026', 'itr-filing-for-startup-founders', 'income-from-other-sources-guide']
  }),
  makePage({
    slug: 'gst-3-year-return-filing-limit', type: 'GST compliance',
    refType: 'gst',
    title: 'GST 3-Year Return Filing Limit Guide | WorkIndex',
    meta: 'GST 3-year return filing limit guide for GSTR-1, GSTR-3B, GSTR-9 and late filing risk after portal restrictions.',
    h1: 'GST 3-Year Return Filing Limit', subtitle: 'Late return restriction and compliance cleanup',
    summary: 'GST return filing is increasingly time-restricted by portal controls. Businesses with old pending returns should clean up before the filing window closes.',
    points: ['GSTN advisories have highlighted return filing restrictions after a specified time window.', 'Old GSTR-1, GSTR-3B and annual return defaults can block compliance cleanup.', 'Late fee, interest and demand exposure should be computed before filing.', 'Portal status should be checked GSTIN-wise and period-wise.'],
    useCases: ['Business with old pending GST returns.', 'Consultant cleaning up non-compliant GSTIN.', 'Company preparing for cancellation revocation.', 'CA checking annual return backlog.'],
    records: ['GSTIN return dashboard.', 'Period-wise sales and purchase data.', 'Tax payment and cash ledger details.', 'Late fee/interest workings.'],
    mistakes: ['Waiting until portal restriction locks the period.', 'Filing GSTR-1 without matching GSTR-3B.', 'Ignoring annual return impact.', 'No books vs GST reconciliation.'],
    related: ['gst-filing-services', 'gstr-3b-filing-help', 'gstr-1-filing-help', 'gst-annual-return-filing-gstr-9']
  }),
  makePage({
    slug: 'e-invoice-30-day-irn-limit', type: 'GST/e-invoice',
    refType: 'gst',
    title: 'E-Invoice 30-Day IRN Limit Guide | WorkIndex',
    meta: 'E-invoice 30-day IRN reporting limit guide for applicable taxpayers, invoice upload timing, credit notes and compliance controls.',
    h1: 'E-Invoice 30-Day IRN Limit', subtitle: 'Invoice reporting timing controls',
    summary: 'E-invoice reporting restrictions can reject delayed IRN generation for applicable taxpayers. Businesses need invoice-date discipline and ERP controls.',
    points: ['IRN generation time limits depend on current e-invoice portal rules and taxpayer category.', 'Invoice date, upload date and cancellation windows should be controlled.', 'Delayed IRN can affect customer ITC and dispatch documentation.', 'ERP alerts help avoid month-end backlogs.'],
    useCases: ['Company subject to e-invoicing.', 'ERP/accounting team designing invoice controls.', 'Business facing delayed IRN rejection.', 'GST consultant setting monthly close workflow.'],
    records: ['Invoice register and IRN status.', 'E-invoice portal rejection messages.', 'ERP upload logs.', 'Credit/debit note register.'],
    mistakes: ['Generating invoices offline and uploading too late.', 'No IRN status reconciliation.', 'Ignoring cancelled/failed invoices.', 'Not informing customers about corrected invoices.'],
    related: ['gst-e-invoicing-help', 'gst-e-invoicing-applicability', 'gst-fresh-invoice-numbering-fy-2026-27', 'gst-reconciliation-services']
  }),
  makePage({
    slug: 'gst-ims-pending-actions-guide', type: 'GST IMS',
    refType: 'gst',
    title: 'GST IMS Pending Actions Guide | WorkIndex',
    meta: 'GST Invoice Management System pending actions guide for accepting, rejecting, keeping pending invoices and ITC reconciliation.',
    h1: 'GST IMS Pending Actions Guide', subtitle: 'Accept, reject or keep invoices pending',
    summary: 'GST IMS adds a workflow layer where recipient action on supplier invoices can affect ITC reconciliation and monthly return discipline.',
    points: ['IMS actions should be reviewed before finalising ITC claim.', 'Pending invoices require follow-up with suppliers or internal teams.', 'Rejected invoices should be documented with reason.', 'IMS data should be reconciled with GSTR-2B and purchase books.'],
    useCases: ['Business reviewing supplier invoices.', 'GST consultant closing monthly ITC.', 'Accounts team tracking pending supplier corrections.', 'Company reducing ITC mismatch notices.'],
    records: ['IMS dashboard export.', 'GSTR-2B and purchase register.', 'Supplier invoices and credit notes.', 'Follow-up notes for disputed invoices.'],
    mistakes: ['Leaving large invoices pending without owner.', 'Rejecting without business reason.', 'Claiming ITC from books without portal reconciliation.', 'No supplier communication trail.'],
    related: ['gst-invoice-management-system-guide', 'gst-input-tax-credit-mismatch', 'gst-reconciliation-services', 'gst-itc-reclaim-ledger-guide']
  }),
  makePage({
    slug: 'gst-itc-reclaim-ledger-guide', type: 'GST ITC',
    refType: 'gst',
    title: 'GST ITC Reclaim Ledger Guide | WorkIndex',
    meta: 'GST ITC reclaim ledger guide for reversed credit, reclaim tracking, Table 4D, GSTR-3B controls and mismatch resolution.',
    h1: 'GST ITC Reclaim Ledger Guide', subtitle: 'Track reversed and reclaimed input tax credit',
    summary: 'The ITC reclaim ledger helps track credits reversed earlier and reclaimed later. Businesses need clean invoice-level and return-level evidence.',
    points: ['Reversal and reclaim should be linked to original invoice and return period.', 'GSTR-3B table treatment should match portal instructions.', 'Supplier corrections and payment conditions can affect reclaim timing.', 'Ledger balances should be reviewed monthly.'],
    useCases: ['Business reversing ITC for mismatch.', 'GST consultant preparing GSTR-3B.', 'Company reclaiming credit after supplier correction.', 'Accounts team auditing ITC ledger.'],
    records: ['Original invoice and 2B status.', 'Reversal working and return period.', 'Supplier correction proof.', 'Reclaim ledger screenshot/export.'],
    mistakes: ['Reclaiming without supplier correction or eligibility.', 'No link between reversal and reclaim.', 'Wrong GSTR-3B table reporting.', 'Double claiming same credit.'],
    related: ['gst-input-tax-credit-mismatch', 'gst-ims-pending-actions-guide', 'gst-reconciliation-services', 'itc-reversal-help']
  }),
  makePage({
    slug: 'gst-fresh-invoice-numbering-fy-2026-27', type: 'GST invoicing',
    refType: 'gst',
    title: 'GST Fresh Invoice Numbering FY 2026-27 | WorkIndex',
    meta: 'GST fresh invoice numbering FY 2026-27 guide for April series setup, invoice format, e-invoice controls and audit trail.',
    h1: 'GST Fresh Invoice Numbering FY 2026-27', subtitle: 'April invoice series setup',
    summary: 'At the start of a financial year, businesses should set a clean invoice number series that stays unique, chronological and GST/e-invoice compliant.',
    points: ['Invoice numbers should be unique for the financial year and GSTIN/business unit setup.', 'E-invoice and accounting software should use the same series logic.', 'Credit notes and debit notes need their own controlled numbering.', 'Series changes should be documented before issuing invoices.'],
    useCases: ['Business starting April billing.', 'Company migrating accounting software.', 'Multi-branch GSTIN setting invoice series.', 'CA reviewing invoice compliance.'],
    records: ['Invoice format and series policy.', 'Accounting software settings.', 'E-invoice upload configuration.', 'Credit/debit note numbering rules.'],
    mistakes: ['Duplicate invoice numbers after software migration.', 'Changing series without documentation.', 'Mismatch between invoice PDF and e-invoice data.', 'No branch-wise numbering control.'],
    related: ['gst-e-invoicing-help', 'gst-invoice-management-system-guide', 'gst-filing-services', 'gst-hsn-8-digit-reporting-guide']
  }),
  makePage({
    slug: 'gst-composition-withdrawal-reg-32', type: 'GST composition',
    refType: 'gst',
    title: 'GST Composition Withdrawal Reg 32 Guide | WorkIndex',
    meta: 'GST composition withdrawal guide for businesses moving from composition to regular scheme, stock ITC, invoices and return changes.',
    h1: 'GST Composition Withdrawal Reg 32', subtitle: 'Move from composition to regular GST carefully',
    summary: 'Businesses leaving composition scheme need to manage effective date, invoice format, stock ITC, return type and customer communication.',
    points: ['Withdrawal may be voluntary or forced by eligibility breach.', 'Regular scheme invoice and tax collection starts from the effective date.', 'Opening stock ITC may require detailed evidence.', 'Return filing frequency and tax payment workflow changes.'],
    useCases: ['Small business crossing composition threshold.', 'Trader wanting ITC chain for B2B clients.', 'Restaurant/service business checking scheme eligibility.', 'GST consultant filing withdrawal.'],
    records: ['Composition registration status.', 'Turnover and eligibility calculation.', 'Stock and purchase invoices.', 'Customer contract/invoice transition note.'],
    mistakes: ['Continuing composition invoices after withdrawal date.', 'Claiming stock ITC without evidence.', 'Not updating billing software.', 'Missing regular returns after transition.'],
    related: ['gst-composition-vs-regular', 'gst-composition-scheme-filing', 'gst-registration-for-small-business', 'gst-filing-services']
  }),
  makePage({
    slug: 'gst-ecrs-negative-balance-help', type: 'GST ITC help',
    refType: 'gst',
    title: 'GST ECRS Negative Balance Help | WorkIndex',
    meta: 'GST ECRS negative balance help for electronic credit reversal and reclaim statement issues, ITC mismatch and GSTR-3B correction.',
    h1: 'GST ECRS Negative Balance Help', subtitle: 'Fix credit reversal and reclaim statement issues',
    summary: 'A negative or incorrect ECRS balance can indicate reversal/reclaim mismatch, wrong reporting or portal-data inconsistency that needs invoice-level review.',
    points: ['ECRS should be reconciled with ITC reversals and reclaims reported in returns.', 'Negative balances need period-wise traceability.', 'Incorrect reclaim can create future ITC restriction or notice risk.', 'GST consultant review should include books, 2B and portal ledgers.'],
    useCases: ['Business seeing negative ECRS balance.', 'GST consultant correcting ITC reclaim.', 'Accounts team reviewing past GSTR-3B periods.', 'Company preparing for audit or notice response.'],
    records: ['ECRS and ITC ledger exports.', 'GSTR-3B filed returns.', 'Invoice-level reversal/reclaim working.', 'Supplier 2B status.'],
    mistakes: ['Adjusting current return blindly.', 'No invoice-level trail.', 'Treating portal warning as cosmetic.', 'Reclaiming credits already used.'],
    related: ['gst-itc-reclaim-ledger-guide', 'gst-input-tax-credit-mismatch', 'itc-reversal-help', 'gst-reconciliation-services']
  }),
  makePage({
    slug: 'gst-gstr-1-3b-mismatch-help', type: 'GST mismatch',
    refType: 'gst',
    title: 'GSTR-1 and GSTR-3B Mismatch Help | WorkIndex',
    meta: 'GSTR-1 and GSTR-3B mismatch help for sales, tax liability, amendments, notices, reconciliation and correction planning.',
    h1: 'GSTR-1 and GSTR-3B Mismatch Help', subtitle: 'Sales return vs tax payment reconciliation',
    summary: 'Mismatch between GSTR-1 outward supplies and GSTR-3B tax payment can trigger notices, customer ITC issues and audit questions.',
    points: ['GSTR-1 reports invoice-level outward supply; GSTR-3B reports tax payment summary.', 'Timing, amendments, credit notes and wrong tax heads can create mismatch.', 'Mismatch should be reconciled period-wise and GSTIN-wise.', 'Correction depends on whether invoice, tax head or return period is wrong.'],
    useCases: ['Business received mismatch notice.', 'Customer complaining ITC not visible.', 'CA reconciling annual return.', 'Accounts team closing monthly GST.'],
    records: ['GSTR-1 and GSTR-3B returns.', 'Sales register and tax liability working.', 'Credit/debit note register.', 'Notices and portal comparison reports.'],
    mistakes: ['Changing current return without reconciling past period.', 'Ignoring amendments already filed.', 'No customer-wise invoice tracking.', 'Mismatch between IGST/CGST/SGST heads.'],
    related: ['gst-reconciliation-services', 'gstr-1-filing-help', 'gstr-3b-filing-help', 'gst-notice-reply-help']
  }),
  makePage({
    slug: 'gst-hsn-8-digit-reporting-guide', type: 'GST invoicing',
    refType: 'gst',
    title: 'GST HSN 8-Digit Reporting Guide | WorkIndex',
    meta: 'GST HSN 8-digit reporting guide for turnover-based HSN disclosure, export invoices, classification checks and GSTR-1 accuracy.',
    h1: 'GST HSN 8-Digit Reporting Guide', subtitle: 'Classification and invoice reporting checks',
    summary: 'HSN reporting affects invoice accuracy, GSTR-1 data and customs/export documentation. Higher-detail HSN may be required based on turnover and supply type.',
    points: ['HSN digit requirement depends on turnover, supply type and current notification.', 'Wrong HSN can affect rate, invoice validity and analytics scrutiny.', 'Exports often need more detailed classification discipline.', 'Product master should be reviewed before year-end and rate changes.'],
    useCases: ['Manufacturer updating product master.', 'Exporter preparing invoices.', 'Trader with many SKUs.', 'GST consultant reviewing rate classification.'],
    records: ['Product catalogue and HSN master.', 'Sales invoices and GSTR-1 HSN summary.', 'Rate notification and classification note.', 'Customs/export documents if relevant.'],
    mistakes: ['Using generic HSN for all products.', 'No turnover-based digit check.', 'Wrong rate because of wrong classification.', 'Not updating software product master.'],
    related: ['gst-hsn-code-finder', 'gst-2-rate-changes-guide', 'gst-fresh-invoice-numbering-fy-2026-27', 'gst-filing-services']
  }),
  makePage({
    slug: 'gst-appeal-gstat-deadline-guide', type: 'GST appeal',
    refType: 'gst',
    title: 'GST Appeal and GSTAT Deadline Guide | WorkIndex',
    meta: 'GST appeal and GSTAT deadline guide for demand orders, pre-deposit, limitation period, documents and representation planning.',
    h1: 'GST Appeal and GSTAT Deadline Guide', subtitle: 'Demand order appeal planning',
    summary: 'GST appeals are deadline-driven. Taxpayers need order copy, limitation calculation, pre-deposit planning and grounds of appeal before filing.',
    points: ['Appeal forum and deadline depend on the order type and date of communication.', 'Pre-deposit and disputed tax computation should be verified before filing.', 'GSTAT transition windows should be checked from official notifications.', 'Evidence and grounds should address the original demand order, not just tax amount.'],
    useCases: ['Business received GST demand order.', 'Taxpayer missed reply and wants appeal.', 'CA drafting grounds and pre-deposit working.', 'Company tracking GSTAT filing window.'],
    records: ['Demand order and ARN.', 'Show cause notice and reply filed.', 'Tax/interest/penalty computation.', 'Evidence, ledgers and legal grounds.'],
    mistakes: ['Missing limitation date.', 'Wrong pre-deposit computation.', 'Appealing without complete order documents.', 'No reconciliation evidence attached.'],
    related: ['gst-demand-under-section-73-74', 'gst-section-74a-notice-help', 'gst-notice-reply-help', 'income-tax-appeal-services']
  }),
  makePage({
    slug: 'mca-director-penalty-non-filing-financial-statements', type: 'MCA penalty',
    refType: 'company',
    title: 'MCA Director Penalty for Non-Filing Financial Statements | WorkIndex',
    meta: 'MCA director penalty guide for non-filing financial statements, annual return defaults, additional fees and director disqualification risk.',
    h1: 'MCA Director Penalty for Non-Filing Financial Statements', subtitle: 'Company annual filing default risk',
    summary: 'Non-filing of company financial statements and annual returns can create company penalties, director exposure and disqualification risk.',
    points: ['Company annual filings should be checked year-wise on MCA master data.', 'Delay can create additional fees, penalties and prosecution exposure.', 'Repeated default can affect director status and company compliance standing.', 'Professional review should include financials, board approvals and ROC forms.'],
    useCases: ['Company missed annual filing.', 'Director received MCA notice.', 'Startup cleaning up old ROC defaults.', 'CA/CS preparing delayed filing.'],
    records: ['Financial statements and audit report.', 'Board/shareholder meeting records.', 'MCA master data and filing history.', 'Penalty/additional fee calculations.'],
    mistakes: ['Filing only one form while another remains pending.', 'Ignoring director KYC or disqualification angle.', 'No board approval trail.', 'Waiting until bank/investor due diligence discovers default.'],
    related: ['roc-annual-filing-services', 'company-compliance-services', 'mca-v3-portal-guide', 'director-din-kyc-services']
  }),
  makePage({
    slug: 'form-inc-22a-active-company-status', type: 'MCA form guide',
    refType: 'company',
    title: 'Form INC-22A ACTIVE Company Status Guide | WorkIndex',
    meta: 'Form INC-22A ACTIVE guide for company active status, registered office verification, non-compliance consequences and MCA master data checks.',
    h1: 'Form INC-22A ACTIVE Company Status', subtitle: 'Registered office and active company tagging',
    summary: 'Form INC-22A ACTIVE status affects company compliance visibility and may restrict filings when registered office or KYC data is not in order.',
    points: ['ACTIVE status should be verified from MCA master data.', 'Registered office, directors, email and statutory records must align.', 'Non-compliant status can affect further corporate actions.', 'Correction may need registered office, KYC and form filing cleanup.'],
    useCases: ['Company checking ACTIVE status.', 'Startup preparing investor due diligence.', 'CS cleaning MCA compliance defaults.', 'Director updating registered office data.'],
    records: ['MCA master data.', 'Registered office proof.', 'Director KYC and DSC status.', 'Prior INC-22/ACTIVE filings.'],
    mistakes: ['Ignoring master data status.', 'Wrong registered office proof.', 'Director KYC pending while filing company forms.', 'No email/OTP access for company records.'],
    related: ['registered-office-change-services', 'company-compliance-services', 'mca-company-master-data-check-guide', 'director-din-kyc-services']
  }),
  makePage({
    slug: 'mca-company-master-data-check-guide', type: 'How-to/MCA',
    refType: 'company',
    title: 'MCA Company Master Data Check Guide | WorkIndex',
    meta: 'How to check MCA company master data, company status, directors, charges, annual filing status and compliance red flags.',
    h1: 'MCA Company Master Data Check Guide', subtitle: 'Company status, directors and filing red flags',
    summary: 'MCA company master data is a quick way to check company status, registered office, directors, charges and basic compliance red flags before dealing with a company.',
    points: ['Master data can show active/defaulting status, incorporation details and registered office.', 'Director and charge information can help with due diligence.', 'Annual filing status should be cross-checked with documents.', 'Master data is not a substitute for full due diligence.'],
    useCases: ['Vendor due diligence.', 'Investor checking startup compliance.', 'Customer verifying service provider company.', 'Founder reviewing own company status.'],
    records: ['Company name or CIN.', 'MCA master data extract.', 'Charge and director details.', 'Financial statements and annual returns if available.'],
    mistakes: ['Relying only on company website.', 'Ignoring charges or default status.', 'Not checking director disqualification/KYC.', 'Assuming active status means financial health.'],
    related: ['due-diligence-services', 'company-compliance-services', 'mca-v3-portal-guide', 'roc-annual-filing-services']
  }),
  makePage({
    slug: 'dir-3-kyc-late-fee-help', type: 'Director KYC',
    refType: 'company',
    title: 'DIR-3 KYC Late Fee Help | WorkIndex',
    meta: 'DIR-3 KYC late fee help for directors, DIN KYC default, deactivated DIN, filing process, DSC and annual compliance.',
    h1: 'DIR-3 KYC Late Fee Help', subtitle: 'Reactivate DIN and complete director KYC',
    summary: 'DIR-3 KYC is an annual director compliance requirement. Missing it can deactivate DIN and create late fee before filing is restored.',
    points: ['DIN status should be checked before company filings.', 'Director mobile/email OTP and DSC may be needed depending on filing type.', 'Late fee and reactivation process should be verified on MCA portal.', 'Director KYC default can delay company compliance work.'],
    useCases: ['Director DIN deactivated due to KYC default.', 'Company unable to file forms because director KYC is pending.', 'CS completing annual KYC for directors.', 'Startup founder missed DIR-3 KYC deadline.'],
    records: ['DIN and PAN.', 'Aadhaar/passport and address proof.', 'Mobile/email OTP access.', 'DSC status and MCA login.'],
    mistakes: ['Waiting until ROC filing deadline.', 'Wrong mobile/email linked to director.', 'Expired DSC.', 'Assuming KYC is one-time only.'],
    related: ['director-din-kyc-services', 'company-compliance-services', 'digital-signature-certificate-services', 'mca-v3-portal-guide']
  }),
  makePage({
    slug: 'mca-v3-company-forms-guide', type: 'MCA guide',
    refType: 'company',
    title: 'MCA V3 Company Forms Guide | WorkIndex',
    meta: 'MCA V3 company forms guide for login, DSC association, web forms, company compliance filings and common portal errors.',
    h1: 'MCA V3 Company Forms Guide', subtitle: 'Portal filing workflow and common errors',
    summary: 'MCA V3 changed many company filing workflows into web-based forms with role checks, DSC association and portal validation steps.',
    points: ['MCA V3 filings depend on correct business user login and role mapping.', 'DSC association, director KYC and company master data can block filings.', 'Attachments should match form purpose and size/type rules.', 'Payment and SRN acknowledgement should be saved after filing.'],
    useCases: ['Company filing annual forms.', 'CS handling MCA portal migration issues.', 'Director facing DSC association error.', 'Startup preparing ROC compliance.'],
    records: ['MCA login and role status.', 'DSC and DIN details.', 'Company master data and SRN history.', 'Form attachments and board approvals.'],
    mistakes: ['Using wrong MCA user role.', 'Expired DSC or KYC default.', 'Attachment mismatch.', 'Not downloading SRN/payment acknowledgement.'],
    related: ['blog-mca-v3-portal-guide', 'company-compliance-services', 'roc-filing-services', 'director-din-kyc-services']
  }),
  makePage({
    slug: 'audit-services-patna', type: 'City audit',
    refType: 'company',
    title: 'Audit Services in Patna | WorkIndex',
    meta: 'Find audit firms in Patna for government contractors, education institutions, agri-traders, real estate and statutory audit.',
    h1: 'Audit Services in Patna', subtitle: 'Government contractor, education and real estate audit',
    summary: 'Patna audit demand comes from government contractors, educational institutions, agri-traders, real estate developers and growing Bihar-based businesses.',
    points: ['Audit scope can include statutory audit, tax audit, trust/institution audit and GST reconciliation.', 'Government contractor books need tender, billing and TDS/GST records.', 'Education institutions may need trust/society-specific audit review.', 'Real estate project accounts need project-wise cost and revenue evidence.'],
    useCases: ['Patna company needing statutory audit.', 'Government contractor preparing books.', 'School/college/trust audit.', 'Real estate business requiring project audit.'],
    records: ['Financial statements and ledgers.', 'GST/TDS returns.', 'Contracts, bills and bank statements.', 'Board/trust records where relevant.'],
    mistakes: ['Combining multiple projects without schedules.', 'No grant/tender reconciliation.', 'Missing GST/TDS cross-check.', 'Late audit appointment.'],
    related: ['audit-services-bangalore', 'accounting-services-patna', 'itr-filing-patna', 'gst-services-patna']
  }),
  makePage({
    slug: 'audit-services-vadodara', type: 'City audit',
    refType: 'company',
    title: 'Audit Services in Vadodara | WorkIndex',
    meta: 'Find audit firms in Vadodara for petrochemical, pharma, engineering, manufacturing, export and statutory audit work.',
    h1: 'Audit Services in Vadodara', subtitle: 'Petrochemical, pharma and engineering audit',
    summary: 'Vadodara audit work is shaped by petrochemical, pharmaceutical, engineering, manufacturing and export businesses around Gujarat industrial clusters.',
    points: ['Manufacturing audits need inventory, job work and cost control checks.', 'Pharma and chemical businesses need HSN/GST and regulatory expense trails.', 'Exporters need LUT, BRC/FIRC and refund documentation.', 'Statutory audit should reconcile GST, TDS, payroll and fixed assets.'],
    useCases: ['Manufacturer needing statutory audit.', 'Exporter preparing audit schedules.', 'Pharma/chemical unit reviewing compliance.', 'MSME seeking bank finance audit records.'],
    records: ['Inventory and fixed asset register.', 'GST/TDS and export records.', 'Payroll and PF/ESI data.', 'Financial statements and bank confirmations.'],
    mistakes: ['Weak inventory valuation support.', 'No export realisation reconciliation.', 'Mismatch between GST returns and books.', 'Ignoring related-party disclosures.'],
    related: ['audit-services-bangalore', 'accounting-services-vadodara', 'gst-services-vadodara', 'statutory-audit-services']
  }),
  makePage({
    slug: 'web-developer-bhopal', type: 'City web dev',
    refType: 'tech',
    title: 'Web Developer in Bhopal | WorkIndex',
    meta: 'Hire web developers in Bhopal for government contractor portals, education websites, healthcare, tourism, ecommerce and business websites.',
    h1: 'Web Developer in Bhopal', subtitle: 'Education, healthcare and government contractor websites',
    summary: 'Bhopal web development demand includes education platforms, government contractor portals, healthcare websites, tourism projects and ecommerce for local businesses.',
    points: ['Local developers can build brochure sites, ecommerce, portals and dashboards.', 'Government contractor projects may need document upload and status workflows.', 'Education and healthcare websites need mobile-first design and enquiry flows.', 'Scope should define hosting, maintenance, SEO and content ownership.'],
    useCases: ['School or coaching website.', 'Healthcare clinic website.', 'Government contractor portal.', 'Local ecommerce store.'],
    records: ['Feature list and reference websites.', 'Logo, content and photos.', 'Domain/hosting access.', 'Payment gateway or enquiry requirements.'],
    mistakes: ['Starting without content ownership.', 'No mobile QA.', 'Unclear maintenance responsibility.', 'No analytics/search setup.'],
    related: ['web-developer-bangalore', 'website-development-cost-india', 'small-business-website-development', 'seo-friendly-website-development']
  }),
  makePage({
    slug: 'web-developer-amritsar', type: 'City web dev',
    refType: 'tech',
    title: 'Web Developer in Amritsar | WorkIndex',
    meta: 'Hire web developers in Amritsar for hospitality, tourism, textile, NRI services, ecommerce and local business websites.',
    h1: 'Web Developer in Amritsar', subtitle: 'Hospitality, textile and local ecommerce websites',
    summary: 'Amritsar web projects often serve hospitality, pilgrimage tourism, textile/hosiery businesses, NRI services and regional ecommerce brands.',
    points: ['Hospitality sites need booking/enquiry flows and local SEO.', 'Textile businesses may need catalogues and wholesale enquiry forms.', 'NRI-focused services need trust signals and documentation pages.', 'Project scope should include content, photography, hosting and maintenance.'],
    useCases: ['Hotel or travel business website.', 'Textile catalogue site.', 'NRI service provider website.', 'Retail ecommerce launch.'],
    records: ['Service/product catalogue.', 'Photos, pricing and contact details.', 'Domain/hosting access.', 'SEO keywords and city targets.'],
    mistakes: ['Using generic stock content.', 'No WhatsApp/enquiry tracking.', 'Slow mobile performance.', 'No local business schema or map setup.'],
    related: ['web-developer-bangalore', 'business-website-development', 'ecommerce-website-development', 'website-maintenance-services']
  }),
  makePage({
    slug: 'hire-power-bi-developer-india', type: 'Hire page',
    refType: 'tech',
    title: 'Hire Power BI Developer India | WorkIndex',
    meta: 'Hire Power BI developers in India for dashboards, DAX, data modelling, SQL integration, finance reports and business intelligence automation.',
    h1: 'Hire Power BI Developer India', subtitle: 'Dashboards, DAX and business intelligence reports',
    summary: 'Power BI developers help businesses turn accounting, sales, operations, marketing and finance data into dashboards, automated reports and decision workflows.',
    points: ['Power BI work includes data modelling, DAX measures, Power Query, report design and refresh setup.', 'Finance dashboards need clean chart of accounts and KPI definitions.', 'Data sources may include Excel, SQL, ERP, Zoho, Tally exports, Google Sheets and APIs.', 'Access control, refresh schedule and ownership should be agreed before build.'],
    useCases: ['CFO dashboard for monthly MIS.', 'Sales dashboard for regional teams.', 'Operations dashboard with automated refresh.', 'Startup investor metrics reporting.'],
    records: ['Sample data and source systems.', 'KPI definitions and desired visuals.', 'User roles and access needs.', 'Refresh frequency and hosting preference.'],
    mistakes: ['Building visuals before cleaning data model.', 'No DAX ownership or documentation.', 'Unclear refresh responsibility.', 'Sharing sensitive data without access rules.'],
    related: ['hire-data-analyst-india', 'financial-modelling-services', 'management-accounts-mis-reporting', 'virtual-cfo-services-india'],
    table: { title: 'Typical Power BI scope', head: ['Scope', 'What to specify', 'Output'], rows: [['Finance MIS', 'COA, monthly P&L, cash flow', 'CFO dashboard'], ['Sales analytics', 'Region, product, channel', 'Revenue and margin reports'], ['Operations', 'Daily source refresh', 'Exception dashboard']] }
  })
];

if (pages.length !== 50) {
  throw new Error(`Expected 50 Batch 15 pages, got ${pages.length}`);
}

if (!fs.existsSync(seoDir)) fs.mkdirSync(seoDir, { recursive: true });

const created = [];
const skipped = [];
for (const item of pages) {
  const file = path.join(seoDir, `${item.slug}.html`);
  if (fs.existsSync(file)) {
    skipped.push(item.slug);
    continue;
  }
  fs.writeFileSync(file, render(item));
  created.push(item.slug);
}

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const slug of pages.map((item) => item.slug)) {
  if (!fs.existsSync(path.join(seoDir, `${slug}.html`))) continue;
  const loc = `https://workindex.co.in/seo-pages/${slug}.html`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    sitemap = sitemap.replace('</urlset>', `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`);
  }
}
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Batch 15 pages created: ${created.length}`);
console.log(`Skipped existing slugs: ${skipped.length}${skipped.length ? ` (${skipped.join(', ')})` : ''}`);
