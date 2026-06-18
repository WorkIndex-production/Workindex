const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const manifestPath = path.join(root, 'batch16-indexnow-urls.json');
const today = new Date().toISOString().slice(0, 10);
const factDate = '2026-06-04';
const ctaUrl = '/?signup=true&role=client';

const caps = {
  ca: 'CA',
  cfo: 'CFO',
  gst: 'GST',
  hsn: 'HSN',
  huf: 'HUF',
  itr: 'ITR',
  llp: 'LLP',
  mca: 'MCA',
  nda: 'NDA',
  ngo: 'NGO',
  ngos: 'NGOs',
  opc: 'OPC',
  pf: 'PF',
  roc: 'ROC',
  tds: 'TDS'
};

const refs = {
  tax: [
    ['Income Tax e-Filing portal', 'https://www.incometax.gov.in/iec/foportal/'],
    ['Income-tax Act 2025 FAQs', 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act-faq'],
    ['TDS Compliance FAQs', 'https://www.incometax.gov.in/iec/foportal/node/11726'],
    ['TRACES portal', 'https://www.tdscpc.gov.in/']
  ],
  gst: [
    ['GST portal', 'https://www.gst.gov.in/'],
    ['GST tutorials', 'https://tutorial.gst.gov.in/'],
    ['CBIC GST', 'https://cbic-gst.gov.in/'],
    ['GST Council', 'https://gstcouncil.gov.in/']
  ],
  company: [
    ['MCA portal', 'https://www.mca.gov.in/'],
    ['SPICe+ information', 'https://www.mca.gov.in/content/mca/global/en/mca/e-filing/incorporation/spice.html'],
    ['Income Tax e-Filing portal', 'https://www.incometax.gov.in/iec/foportal/']
  ],
  trademark: [
    ['Trade Marks Registry', 'https://www.ipindia.gov.in/trade-mark-registry'],
    ['Trade Marks', 'https://www.ipindia.gov.in/Trademarks/trademarks'],
    ['Intellectual Property India', 'https://www.ipindia.gov.in/']
  ],
  hr: [
    ['EPFO employer portal', 'https://unifiedportal-emp.epfindia.gov.in/epfo/'],
    ['EPFO ECR resources', 'https://www.epfindia.gov.in/'],
    ['ESIC portal', 'https://www.esic.gov.in/']
  ],
  legal: [
    ['Department of Legal Affairs', 'https://legalaffairs.gov.in/'],
    ['eCourts Services', 'https://ecourts.gov.in/'],
    ['India Code', 'https://www.indiacode.nic.in/']
  ],
  finance: [
    ['SEBI Investment Advisers', 'https://www.sebi.gov.in/'],
    ['RBI', 'https://www.rbi.org.in/'],
    ['AMFI', 'https://www.amfiindia.com/']
  ]
};

const cityNotes = {
  bangalore: 'startup teams, IT services, SaaS companies, consultants and fast-growing service businesses',
  mumbai: 'finance teams, exporters, agencies, traders, media companies and corporate head offices',
  delhi: 'consultants, traders, professionals, NGOs, contractors and NCR business owners',
  hyderabad: 'technology companies, pharma units, contractors, consultants and startup finance teams',
  chennai: 'manufacturing units, exporters, logistics businesses, IT companies and professional firms',
  pune: 'automotive suppliers, IT companies, startups, manufacturers and service businesses',
  ahmedabad: 'textile, chemicals, trading, manufacturing and family-owned businesses',
  kolkata: 'trading houses, professional firms, logistics businesses and legacy companies',
  kochi: 'NRI families, exporters, tourism businesses, professional firms and SMEs',
  jaipur: 'gems, jewellery, tourism, handicrafts, traders and growing service companies',
  surat: 'textile, diamond, trading, export and manufacturing businesses',
  indore: 'MSMEs, food businesses, education providers, traders and service firms',
  nagpur: 'logistics, trading, professionals, contractors and central India SMEs',
  chandigarh: 'professionals, service businesses, traders and Punjab-Haryana regional offices',
  lucknow: 'professionals, contractors, educational institutions and service businesses',
  bhopal: 'MSMEs, pharma units, government contractors and service companies',
  coimbatore: 'textile, engineering, pumps, motors, export and manufacturing businesses',
  visakhapatnam: 'port logistics, steel, pharma, defence ecosystem and manufacturing businesses',
  guwahati: 'trading, logistics, tea, regional distribution and North East service businesses',
  ranchi: 'mining-linked businesses, contractors, education, healthcare and regional SMEs'
};

const serviceCities20 = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'kolkata', 'kochi', 'jaipur', 'surat', 'indore', 'nagpur', 'chandigarh', 'lucknow', 'bhopal', 'coimbatore', 'visakhapatnam', 'guwahati', 'ranchi'];
const virtualCfoCities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'kolkata', 'kochi', 'jaipur', 'surat', 'indore', 'chandigarh', 'guwahati', 'coimbatore'];
const trademarkCities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'kolkata', 'kochi', 'jaipur', 'surat', 'indore', 'chandigarh', 'coimbatore', 'nagpur'];
const rocCities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'kolkata', 'kochi', 'jaipur', 'surat', 'indore', 'chandigarh', 'nagpur', 'lucknow'];
const bestCaCities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'kolkata', 'kochi', 'jaipur', 'surat'];
const bestGstCities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'ahmedabad', 'kolkata'];
const hrCities = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai'];
const financeCities = ['bangalore', 'mumbai', 'delhi', 'hyderabad'];
const auditLocalities = ['bellandur', 'electronic-city', 'hsr-layout', 'indiranagar', 'koramangala', 'whitefield'];

const pages = [];
const expectedSlugs = [];

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => caps[part] || part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function cityName(slug) {
  return titleFromSlug(slug);
}

function normalizeSlug(slug) {
  return slug.trim().toLowerCase();
}

function addExpected(slugs) {
  for (const slug of slugs) expectedSlugs.push(normalizeSlug(slug));
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function relatedLinks(slugs) {
  return slugs.map((slug) => `<a href="/seo-pages/${normalizeSlug(slug)}.html">${esc(titleFromSlug(normalizeSlug(slug)))}</a>`).join('');
}

function sourceLinks(type) {
  return (refs[type] || refs.tax).map(([label, href]) => `<a href="${href}" rel="nofollow">${esc(label)}</a>`).join('');
}

function schema(page) {
  const url = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': 'https://workindex.co.in/#organization', name: 'WorkIndex', url: 'https://workindex.co.in' },
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.meta },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'WorkIndex', item: 'https://workindex.co.in' },
        { '@type': 'ListItem', position: 2, name: page.h1, item: url }
      ] },
      { '@type': 'FAQPage', mainEntity: page.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) },
      { '@type': 'Service', name: page.h1, serviceType: page.type, provider: { '@id': 'https://workindex.co.in/#organization' }, areaServed: page.area || { '@type': 'Country', name: 'India' }, description: page.meta }
    ]
  });
}

function factPanel(page) {
  const notes = {
    tax: 'AY 2026-27 return filing for FY 2025-26 is governed by the Income-tax Act, 1961. The Income-tax Act, 2025 applies from Tax Year 2026-27 onward, so new-section references must be checked against the live portal before filing.',
    gst: 'GST registration, return, RCM, HSN, LUT, ITC and refund positions should be verified against the live GST portal, CBIC notifications and current return utilities before filing.',
    company: 'MCA forms, company incorporation, ROC filing and LLP compliance should be verified against current MCA V3 forms, master data and applicable company/LLP facts before submission.',
    trademark: 'Trademark applications should be checked against the Trade Marks Act, class selection, registry search results, user evidence and current IP India filing status.',
    hr: 'Payroll, PF, ESIC and labour compliance depend on employee count, wage structure, state-specific rules, current EPFO/ESIC portal settings and monthly challan evidence.',
    legal: 'Legal templates are not one-size-fits-all. Contract, notice and property legal work should be reviewed by a qualified lawyer for jurisdiction, facts, stamp duty and enforceability.',
    finance: 'Investment advisory, retirement planning and wealth management should be handled by appropriately registered or qualified professionals where regulated advice is involved.'
  };
  return `<section class="wi-panel"><div class="lp-section-eyebrow">Official fact-check status</div><h2>Fact-check notes</h2><p><strong>Last fact-checked:</strong> ${factDate}</p><p>${notes[page.refType] || notes.tax}</p><p>This page is preparation guidance for scoping work on WorkIndex. Ask the expert to verify active law, portal forms, notifications and your documents before filing or signing anything.</p></section>`;
}

function render(page) {
  const canonical = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(page.title)}</title><meta name="description" content="${esc(page.meta)}"/><link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${esc(page.title)}"/><meta property="og:description" content="${esc(page.meta)}"/><meta property="og:url" content="${canonical}"/><meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/><link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-rich{padding:56px 24px;max-width:1160px;margin:0 auto}.wi-rich-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;align-items:start}.wi-panel{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}.wi-panel+.wi-panel{margin-top:20px}.wi-panel h2{font-size:24px;margin:0 0 14px}.wi-panel h3{font-size:17px;margin:18px 0 8px}.wi-panel p{color:var(--text-muted);font-size:15px;margin:0 0 12px;line-height:1.75}.wi-detail-list{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}.wi-detail-list li{margin-bottom:7px}.wi-side{position:sticky;top:82px}.wi-ref a,.wi-related a{display:block;color:var(--primary);font-weight:800;text-decoration:none;margin:8px 0}.wi-table{width:100%;border-collapse:collapse;margin-top:12px}.wi-table th,.wi-table td{border:1px solid var(--border);padding:10px;text-align:left;font-size:14px}.wi-table th{background:var(--bg-gray);color:var(--text-dark)}@media(max-width:860px){.wi-rich-grid{grid-template-columns:1fr}.wi-side{position:static}}</style>
<script type="application/ld+json">${schema(page)}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body><nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="${ctaUrl}" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(page.h1)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${esc(page.type)}</div><h1>${esc(page.h1)}<br><span>${esc(page.subtitle)}</span></h1><p>${page.summary}</p><a href="${ctaUrl}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: ${factDate}</div><div class="lp-trust-item">Duplicate checked</div><div class="lp-trust-item">Official-source cautious</div><div class="lp-trust-item">India specific</div></div></section>
<main class="wi-rich"><div class="wi-rich-grid"><div>
${factPanel(page)}
<section class="wi-panel"><div class="lp-section-eyebrow">${esc(page.type)}</div><h2>${esc(page.coverTitle || 'What this covers')}</h2><p>${page.summary}</p>${list(page.points)}</section>
${page.table ? `<section class="wi-panel"><div class="lp-section-eyebrow">Quick reference</div><h2>${esc(page.table.title)}</h2><table class="wi-table"><thead><tr>${page.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${page.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></section>` : ''}
<section class="wi-panel"><div class="lp-section-eyebrow">Use cases</div><h2>Who this is for</h2>${list(page.useCases)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Records</div><h2>Documents and details to prepare</h2>${list(page.records)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Care points</div><h2>Common mistakes to avoid</h2>${list(page.mistakes)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Action</div><h2>How to brief the expert</h2>${list(page.process)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Questions people ask</div><h2>FAQs</h2>${page.faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${a}</p>`).join('')}</section>
</div><aside class="wi-side"><div class="wi-panel"><h2>Find the right expert</h2><p>Post the exact facts, documents available, deadline and expected output. WorkIndex helps compare relevant specialists by scope, price and timeline.</p><a href="${ctaUrl}" class="lp-hero-cta" style="padding:12px 18px;font-size:14px">Get Expert Quotes</a></div><div class="wi-panel wi-related"><h2>Related pages</h2>${relatedLinks(page.related)}</div><div class="wi-panel wi-ref"><h2>Sources used</h2>${sourceLinks(page.refType)}</div></aside></div></main>
<section class="lp-cta-section"><h2>Need this reviewed by a specialist?</h2><p>Share your requirement once and compare relevant WorkIndex experts before hiring.</p><a href="${ctaUrl}" class="lp-hero-cta">Post Requirement as Customer</a></section>
<footer class="lp-footer"><a href="/seo-pages/itr-filing-all-cities.html">ITR cities</a><a href="/seo-pages/gst-services-all-cities.html">GST cities</a><a href="/seo-pages/accounting-services-all-cities.html">Accounting cities</a><a href="/seo-pages/audit-services-all-cities.html">Audit cities</a><a href="/contact.html">Contact</a></footer></body></html>`;
}

function page(input) {
  const slug = normalizeSlug(input.slug);
  pages.push({
    process: [
      'Mention the city, entity type, transaction value, deadline and current portal status.',
      'Upload or list the records available so the expert can quote accurately.',
      'Ask for scope, deliverables, timeline, assumptions and government fee exclusions in writing.',
      'Keep acknowledgements, challans, filings, certificates and advice notes after completion.'
    ],
    faqs: [
      ['Can WorkIndex help with this?', 'Yes. Post your requirement and compare relevant experts by scope, quote, timeline and supporting documents needed.'],
      ['Is this page legal or tax advice?', 'No. It is a preparation guide. Your expert should verify current law, portal forms, notifications and your documents before filing or signing.'],
      ['What should I include in my post?', 'Include the city, year or period, entity type, deadline, notices if any, documents available and whether you need filing, review, drafting or ongoing support.']
    ],
    ...input,
    slug
  });
}

function cityServicePage(service, slugPrefix, city, options) {
  const name = cityName(city);
  const note = cityNotes[city] || 'local businesses, professionals and growing SMEs';
  page({
    slug: `${slugPrefix}-${city}`,
    refType: options.refType,
    type: options.type,
    title: `${options.title} in ${name} | WorkIndex`,
    meta: `Find ${options.metaService} in ${name} for ${note}. Compare experts by scope, documents, compliance risk and timeline.`,
    h1: `${options.h1} in ${name}`,
    subtitle: options.subtitle,
    area: { '@type': 'City', name },
    summary: `${name} ${options.summaryService} work commonly involves ${note}. The right expert should ask for entity type, records, prior filings, pending notices and deadlines before quoting.`,
    points: options.points(name, note),
    useCases: options.useCases(name, note),
    records: options.records,
    mistakes: options.mistakes,
    related: options.related(city),
    table: options.table ? options.table(name) : undefined
  });
}

function addCitySet(prefix, cities, options) {
  addExpected(cities.map((city) => `${prefix}-${city}`));
  for (const city of cities) cityServicePage(options.serviceLabel, prefix, city, options);
}

addCitySet('tds-filing', serviceCities20, {
  refType: 'tax',
  type: 'TDS filing city service',
  title: 'TDS Filing',
  metaService: 'TDS filing consultants',
  h1: 'TDS Filing',
  subtitle: 'Quarterly TDS returns, challans and correction support',
  summaryService: 'TDS filing',
  points: (name, note) => [
    `TDS work in ${name} often covers salary, contractor, professional-fee, rent, commission and interest deductions for ${note}.`,
    'Quarterly returns should reconcile challans, deductee PAN, section codes, rates and Form 26AS/AIS impact.',
    'TRACES defaults, late fees, interest, short deduction and PAN errors should be checked before filing corrections.',
    'Ask whether Form 16/16A generation, correction returns and notice support are included in the quote.'
  ],
  useCases: (name) => [`Employer filing salary TDS in ${name}.`, 'Business with vendor and professional fee deductions.', 'Company receiving TRACES defaults or short-payment notices.', 'Startup setting up TAN, challan and return workflow.'],
  records: ['TAN, PAN and deductor profile.', 'Salary sheet, vendor ledger, rent agreement and payment register.', 'Challans, deduction dates, section mapping and deductee PAN list.', 'Prior TDS returns, defaults and Form 16/16A status.'],
  mistakes: ['Paying challans under wrong section or assessment year.', 'Using invalid PAN or mismatched deductee details.', 'Missing nil/lower deduction certificates.', 'Filing return without challan-to-deduction reconciliation.'],
  related: (city) => [`payroll-services-${city}`, 'tds-on-salary-guide', 'tds-on-professional-fees-194j', 'tds-filing-services'],
  table: (name) => ({ title: `TDS filing checklist for ${name}`, head: ['Area', 'What to verify'], rows: [['Payroll', 'Salary breakup, exemptions, Form 16 data'], ['Vendors', '194C, 194J, 194H and 194I mapping'], ['Portal', 'Challan match, defaults and certificate status']] })
});

addCitySet('payroll-services', serviceCities20, {
  refType: 'hr',
  type: 'Payroll city service',
  title: 'Payroll Services',
  metaService: 'payroll service providers',
  h1: 'Payroll Services',
  subtitle: 'Salary processing, payslips, PF, ESIC and TDS coordination',
  summaryService: 'payroll',
  points: (name, note) => [
    `Payroll teams in ${name} support ${note} with monthly salary processing, payslips, reimbursements and full-and-final calculations.`,
    'PF, ESIC, professional tax, labour welfare fund and TDS applicability should be mapped before payroll is run.',
    'Monthly payroll should connect HR inputs, attendance, leave, CTC structure, deductions, reimbursements and bank advice.',
    'Ask whether statutory challans, returns, employee helpdesk and year-end Form 16 support are included.'
  ],
  useCases: (name) => [`Startup hiring first employees in ${name}.`, 'SME moving from spreadsheet payroll to managed payroll.', 'Company needing PF/ESIC and TDS coordination.', 'Employer handling exits, bonuses and arrears.'],
  records: ['Employee master, CTC letters and joining dates.', 'Attendance, leave, reimbursement and variable pay data.', 'PF, ESIC, PT, LWF and TAN details.', 'Prior payslips, challans and return records.'],
  mistakes: ['Running salary without statutory applicability review.', 'No audit trail for attendance and variable pay changes.', 'Confusing CTC with taxable salary.', 'Missing arrears, bonus and full-and-final tax impact.'],
  related: (city) => [`hr-payroll-services-${city}`, `tds-filing-${city}`, 'payroll-compliance-services', 'payroll-software-vs-outsourcing']
});

addCitySet('company-registration', serviceCities20, {
  refType: 'company',
  type: 'Company registration city service',
  title: 'Company Registration',
  metaService: 'company registration consultants',
  h1: 'Company Registration',
  subtitle: 'Private limited, OPC, LLP and startup incorporation support',
  summaryService: 'company registration',
  points: (name, note) => [
    `${name} incorporation work usually starts with choosing private limited, OPC, LLP or partnership based on liability, investors, tax and compliance cost.`,
    `Founders in ${note} should check name availability, object clause, registered office proof, director KYC and post-incorporation registrations.`,
    'SPICe+ incorporation, PAN/TAN, GST, bank account, professional tax and Shops Act needs vary by business model and state.',
    'Ask the consultant to separate government fees, DSC fees, stamp duty and post-incorporation compliance from professional fees.'
  ],
  useCases: (name) => [`Founder registering a startup in ${name}.`, 'Family business converting to private limited or LLP.', 'Freelancer forming OPC or LLP.', 'Foreign client asking for incorporated Indian vendor.'],
  records: ['PAN, Aadhaar and address proof of directors/partners.', 'Registered office proof, NOC and utility bill.', 'Proposed names, object clause and shareholding/partner ratios.', 'DSC/DIN status and post-registration tax registrations.'],
  mistakes: ['Choosing entity type only by lowest setup cost.', 'Weak name search before application.', 'Not planning ROC, accounting and tax compliance after incorporation.', 'Ignoring state-level registrations and bank KYC timelines.'],
  related: (city) => [`roc-filing-${city}`, `virtual-cfo-${city}`, 'pvt-ltd-vs-llp-comparison', 'mca-spice-plus-registration-guide']
});

addCitySet('virtual-cfo', virtualCfoCities, {
  refType: 'company',
  type: 'Virtual CFO city service',
  title: 'Virtual CFO',
  metaService: 'virtual CFO consultants',
  h1: 'Virtual CFO',
  subtitle: 'MIS, cash flow, compliance control and founder finance support',
  summaryService: 'virtual CFO',
  points: (name, note) => [
    `Virtual CFO support in ${name} is useful for ${note} that need finance leadership without a full-time CFO.`,
    'Scope can include MIS, cash-flow forecast, unit economics, budget variance, investor reporting, tax coordination and internal controls.',
    'The best quote separates bookkeeping cleanup, monthly reporting, statutory compliance and strategic advisory hours.',
    'Ask for sample MIS formats, cadence, review calls and escalation workflow before hiring.'
  ],
  useCases: (name) => [`Founder needing monthly finance review in ${name}.`, 'SME planning bank funding or investor reporting.', 'Business with poor receivable and cash-flow visibility.', 'Company needing compliance calendar ownership.'],
  records: ['Accounting software access or trial balance.', 'Bank statements, receivables, payables and loan schedules.', 'GST/TDS/ROC compliance status.', 'Sales pipeline, budgets and investor reporting needs.'],
  mistakes: ['Hiring CFO advisory before books are cleaned up.', 'No agreement on MIS format and review cadence.', 'Ignoring tax and statutory compliance backlog.', 'Expecting fundraising help without financial model readiness.'],
  related: (city) => [`accounting-services-${city}`, `company-registration-${city}`, `roc-filing-${city}`, 'hire-accounting-software-consultant']
});

addCitySet('trademark-registration', trademarkCities, {
  refType: 'trademark',
  type: 'Trademark city service',
  title: 'Trademark Registration',
  metaService: 'trademark registration consultants',
  h1: 'Trademark Registration',
  subtitle: 'Brand search, class selection, application and objection support',
  summaryService: 'trademark registration',
  points: (name, note) => [
    `Trademark registration in ${name} should begin with a class-wise search for similar marks before filing.`,
    `Brands from ${note} often need class selection across services, goods, software, education, retail or manufacturing lines.`,
    'Application filing is only the first step; examination report, objection reply, hearing and opposition risk should be discussed.',
    'Ask whether logo, wordmark, user affidavit and objection response are included in the scope.'
  ],
  useCases: (name) => [`Startup protecting a brand name in ${name}.`, 'Business launching product packaging or ecommerce store.', 'Agency registering logo and service mark.', 'Founder responding to trademark objection.'],
  records: ['Brand name, logo and date of first use.', 'Business registration proof and applicant identity.', 'Product/service list and target trademark classes.', 'Prior invoices, website, packaging and social proof for user claim.'],
  mistakes: ['Filing without a similarity search.', 'Choosing wrong classes to save filing fee.', 'Assuming TM application equals final registration.', 'Ignoring objection or opposition deadlines.'],
  related: (city) => [`startup-legal-services`, `company-registration-${city}`, 'contract-drafting-services', 'legal-services-india']
});

addCitySet('roc-filing', rocCities, {
  refType: 'company',
  type: 'ROC filing city service',
  title: 'ROC Filing',
  metaService: 'ROC filing consultants',
  h1: 'ROC Filing',
  subtitle: 'Annual filing, AOC-4, MGT-7, ADT-1 and company compliance',
  summaryService: 'ROC filing',
  points: (name, note) => [
    `ROC filing in ${name} covers companies and LLPs that need annual forms, financial statements, board records and audit coordination.`,
    `Businesses in ${note} should reconcile books, audit status, director KYC and shareholding before filing.`,
    'AOC-4, MGT-7/MGT-7A, ADT-1, DIR-3 KYC, LLP Form 8 and LLP Form 11 have different triggers and due dates.',
    'Ask whether the quote includes financial statement preparation, audit support, form certification and additional fee review.'
  ],
  useCases: (name) => [`Private company with pending annual filing in ${name}.`, 'LLP needing Form 8 and Form 11 support.', 'Company changing auditor, directors or registered office.', 'Startup cleaning up ROC defaults before funding.'],
  records: ['Audited financials, board reports and AGM details.', 'Director DSC/DIN/KYC status.', 'Shareholding, transfers and allotment details.', 'Prior MCA forms, challans and additional fee exposure.'],
  mistakes: ['Treating accounting finalisation and ROC filing as the same task.', 'Missing auditor appointment or director KYC status.', 'No check for additional fees and delayed forms.', 'Filing wrong small company/OPC/LLP form variant.'],
  related: (city) => [`company-registration-${city}`, 'mca-form-aoc-4-financials-filing', 'mca-form-mgt-7-annual-return', 'mca-roc-compliance-calendar']
});

for (const city of bestCaCities) {
  addExpected([`best-ca-${city}`]);
  const name = cityName(city);
  page({
    slug: `best-ca-${city}`,
    refType: 'tax',
    type: 'Hire CA city page',
    title: `Best CA in ${name} | WorkIndex`,
    meta: `Find the best CA in ${name} for ITR, GST, audit, accounting, TDS, company compliance and advisory. Compare scope, experience and quotes on WorkIndex.`,
    h1: `Best CA in ${name}`,
    subtitle: 'Compare verified CAs by scope, documents and timeline',
    area: { '@type': 'City', name },
    summary: `The best CA in ${name} depends on your exact work: ITR, GST, audit, accounting cleanup, TDS, ROC filing, startup advisory or notice response. Use WorkIndex to post the facts once and compare relevant specialists.`,
    points: [`For tax filing, ask about AY/FY, income heads, AIS/Form 26AS reconciliation and special schedules.`, `For GST, check return backlog, ITC reconciliation, notices, LUT/refund and registration amendments.`, `For audit or ROC, confirm whether books, financial statements, audit report and MCA forms are all included.`, `For ${name}, mention your locality, business type and deadline so quotes are not generic.`],
    useCases: [`Salaried or business taxpayer in ${name}.`, 'Startup needing accounting, GST and ROC support.', 'Business facing tax or GST notice.', 'Founder comparing CA quotes before hiring.'],
    records: ['PAN, entity details and login status.', 'AIS/Form 26AS, GST returns, books and bank statements.', 'Notices, orders, challans and prior filings.', 'Scope list: filing, review, audit, advisory or representation.'],
    mistakes: ['Choosing only by lowest fee.', 'Not asking whether notice or correction support is included.', 'Sharing incomplete data and expecting fixed quote.', 'Hiring a generalist for specialist litigation or valuation work.'],
    related: [`itr-filing-${city}`, `gst-services-${city}`, `accounting-services-${city}`, `audit-services-${city}`]
  });
}

for (const city of bestGstCities) {
  addExpected([`best-gst-consultant-${city}`]);
  const name = cityName(city);
  page({
    slug: `best-gst-consultant-${city}`,
    refType: 'gst',
    type: 'Hire GST consultant city page',
    title: `Best GST Consultant in ${name} | WorkIndex`,
    meta: `Find the best GST consultant in ${name} for registration, returns, ITC reconciliation, notices, LUT, refunds and monthly compliance.`,
    h1: `Best GST Consultant in ${name}`,
    subtitle: 'Registration, returns, ITC, notices and refund support',
    area: { '@type': 'City', name },
    summary: `The best GST consultant in ${name} should understand your business model, tax invoices, HSN/SAC, ITC eligibility, e-way bill/e-invoice needs and pending notices before quoting.`,
    points: [`Ask for GSTR-1, GSTR-3B and GSTR-2B reconciliation experience.`, `If you export, confirm LUT, refund and foreign inward remittance documentation.`, `If you received a notice, mention section, tax period, demand amount and reply deadline.`, `${name} businesses should clarify sector-specific issues before hiring.`],
    useCases: [`Business registering for GST in ${name}.`, 'Monthly GST return filing and ITC review.', 'GST notice, cancellation or revocation case.', 'Exporter or ecommerce seller needing refund/reconciliation support.'],
    records: ['GSTIN or registration application status.', 'Sales, purchase, credit notes and debit notes.', 'GSTR-1, GSTR-3B, GSTR-2B and e-way/e-invoice data.', 'Notice, order, refund ARN or cancellation status.'],
    mistakes: ['Filing only from sales summary without purchase reconciliation.', 'Claiming ITC without eligibility and vendor check.', 'Missing notice reply deadline.', 'Ignoring HSN/SAC and place-of-supply issues.'],
    related: [`gst-services-${city}`, `gst-registration-${city}`, `tds-filing-${city}`, 'gst-notice-reply-help']
  });
}

addExpected(['hr-payroll-services-india', ...hrCities.map((city) => `hr-payroll-services-${city}`), 'payroll-compliance-services', 'payroll-outsourcing-services', 'pf-esic-compliance-monthly', 'employee-onboarding-services', 'hr-policy-drafting-services', 'offer-letter-appointment-letter-drafting', 'hr-audit-services']);
page({
  slug: 'hr-payroll-services-india',
  refType: 'hr',
  type: 'HR and payroll service',
  title: 'HR Payroll Services in India | WorkIndex',
  meta: 'Find HR payroll service providers in India for payroll processing, PF, ESIC, TDS, onboarding, HR policies, offer letters and audits.',
  h1: 'HR Payroll Services in India',
  subtitle: 'Payroll, statutory compliance and HR documentation',
  summary: 'HR payroll services combine monthly salary processing with statutory compliance, employee records, joining and exit documentation, HR policies and audit-ready payroll evidence.',
  points: ['A good HR payroll expert checks employee count, wage structure, state presence and statutory triggers before quoting.', 'Monthly payroll should cover payslips, bank advice, reimbursements, arrears, deductions and employee queries.', 'PF, ESIC, professional tax, labour welfare fund and TDS require separate applicability checks.', 'For multi-state teams, ask for state-wise compliance scope.'],
  useCases: ['Startup hiring employees across India.', 'SME moving payroll out of spreadsheets.', 'Employer cleaning PF/ESIC or payroll audit gaps.', 'Founder needing HR policies and appointment letters.'],
  records: ['Employee master and CTC structure.', 'Attendance, leave, reimbursement and variable pay inputs.', 'PF, ESIC, PT, LWF and TAN registrations.', 'Offer letters, appointment letters and HR policies.'],
  mistakes: ['Treating payroll as only salary calculation.', 'No statutory applicability review.', 'Weak employee-document trail.', 'No approval workflow for monthly payroll changes.'],
  related: ['payroll-services-bangalore', 'payroll-compliance-services', 'pf-esic-compliance-monthly', 'hr-audit-services']
});
for (const city of hrCities) {
  const name = cityName(city);
  page({
    slug: `hr-payroll-services-${city}`,
    refType: 'hr',
    type: 'HR and payroll city service',
    title: `HR Payroll Services in ${name} | WorkIndex`,
    meta: `Find HR payroll services in ${name} for salary processing, PF, ESIC, TDS, onboarding, HR policies and employee documentation.`,
    h1: `HR Payroll Services in ${name}`,
    subtitle: 'Monthly payroll plus HR compliance support',
    area: { '@type': 'City', name },
    summary: `HR payroll services in ${name} help employers connect salary processing with statutory compliance, joining records, HR policies, employee queries and exit documentation.`,
    points: [`${name} employers should clarify employee count, state registrations, remote workers and payroll frequency before asking for a quote.`, 'Payroll scope can include payslips, bank advice, PF ECR, ESIC, professional tax, TDS and Form 16 coordination.', 'HR scope can include onboarding, appointment letters, policy drafting and exit checklist.', 'Ask for monthly timelines and data-lock dates.'],
    useCases: [`Startup team in ${name}.`, 'SME with monthly payroll and compliance backlog.', 'Employer setting up PF/ESIC process.', 'Company needing employee documentation cleanup.'],
    records: ['Employee list, CTC and salary components.', 'Attendance, leave and variable pay inputs.', 'PF/ESIC/PT/TAN status.', 'Existing HR letters, policies and exit records.'],
    mistakes: ['No cutoff date for monthly payroll inputs.', 'Ignoring state professional tax and labour welfare requirements.', 'No employee master validation.', 'Not documenting payroll approvals.'],
    related: [`payroll-services-${city}`, 'payroll-compliance-services', 'employee-onboarding-services', 'hr-policy-drafting-services']
  });
}

const simpleServicePages = [
  ['payroll-compliance-services', 'hr', 'Payroll Compliance Services', 'Payroll compliance services for PF, ESIC, professional tax, TDS, payslips, registers, challans and monthly compliance calendar.', 'Payroll Compliance Services', 'PF, ESIC, TDS and payroll records', ['PF/ESIC applicability and contribution workflow.', 'Professional tax and labour welfare checks by state.', 'TDS on salary and Form 16 data coordination.', 'Payroll registers, payslips and audit-ready records.'], ['payroll-services-bangalore', 'pf-esic-compliance-monthly', 'tds-on-salary-guide']],
  ['payroll-outsourcing-services', 'hr', 'Payroll Outsourcing Services', 'Payroll outsourcing services for salary processing, payslips, statutory challans, employee support and monthly reporting.', 'Payroll Outsourcing Services', 'Managed payroll for growing teams', ['Outsourced payroll reduces founder/admin load when employee count grows.', 'Scope should define data inputs, approval cutoff, payslip release and statutory returns.', 'Ask whether employee query handling and year-end Form 16 support are included.', 'Keep owner approval over salary changes and bank files.'], ['payroll-software-vs-outsourcing', 'payroll-compliance-services', 'payroll-for-small-business']],
  ['pf-esic-compliance-monthly', 'hr', 'PF ESIC Monthly Compliance Services', 'PF and ESIC monthly compliance support for ECR, challans, employee master, contribution checks and employer records.', 'PF ESIC Monthly Compliance', 'Monthly employee statutory filings', ['PF and ESIC compliance depends on coverage, wage structure and employee eligibility.', 'Monthly ECR/challan data should reconcile with payroll and employee master.', 'New joinees, exits, UAN, IP numbers and arrears need careful handling.', 'Keep proof of challans and return acknowledgements.'], ['payroll-compliance-services', 'hr-payroll-services-india', 'payroll-for-manufacturing']],
  ['employee-onboarding-services', 'hr', 'Employee Onboarding Services', 'Employee onboarding services for joining forms, KYC, offer letters, statutory forms, payroll setup and HR documentation.', 'Employee Onboarding Services', 'Joining documents, KYC and payroll setup', ['Onboarding should collect identity, bank, tax, PF/ESIC and emergency details.', 'Offer and appointment terms should match salary structure and role expectations.', 'Remote workers need secure document collection and policy acknowledgement.', 'Good onboarding prevents payroll and compliance errors later.'], ['offer-letter-appointment-letter-drafting', 'hr-policy-drafting-services', 'payroll-services-bangalore']],
  ['hr-policy-drafting-services', 'hr', 'HR Policy Drafting Services', 'HR policy drafting services for leave, attendance, reimbursement, remote work, POSH, code of conduct and disciplinary process.', 'HR Policy Drafting Services', 'Practical policies for Indian employers', ['Policies should match company size, state presence and actual work practices.', 'Core policies include leave, attendance, reimbursement, conduct, IT assets, confidentiality and grievance process.', 'POSH policy and committee requirements should be checked where applicable.', 'Policies must be acknowledged by employees and updated as the company grows.'], ['employee-onboarding-services', 'offer-letter-appointment-letter-drafting', 'hr-audit-services']],
  ['offer-letter-appointment-letter-drafting', 'legal', 'Offer Letter and Appointment Letter Drafting | WorkIndex', 'Offer letter and appointment letter drafting for salary terms, probation, notice period, confidentiality, IP and joining conditions.', 'Offer Letter and Appointment Letter Drafting', 'Clear employment terms before joining', ['Offer letters usually confirm role, CTC, joining date, location and conditions.', 'Appointment letters should cover probation, notice period, confidentiality, IP, policies and termination clauses.', 'Salary annexures should align with payroll and statutory deductions.', 'Get legal review for senior roles, sales incentives and restrictive covenants.'], ['employee-onboarding-services', 'hr-policy-drafting-services', 'contract-drafting-services']],
  ['hr-audit-services', 'hr', 'HR Audit Services', 'HR audit services for payroll records, employee files, statutory compliance, policies, onboarding, exits and risk gaps.', 'HR Audit Services', 'Payroll, employee files and compliance risk review', ['HR audit checks employee master, joining files, payroll records, statutory registrations and exits.', 'Audit output should identify compliance gaps, missing documents and process fixes.', 'High-risk areas include PF/ESIC, professional tax, POSH, leave and full-and-final records.', 'Ask for a written gap report with severity and action plan.'], ['payroll-compliance-services', 'hr-policy-drafting-services', 'pf-esic-compliance-monthly']]
];
for (const [slug, refType, title, meta, h1, subtitle, points, related] of simpleServicePages) {
  page({ slug, refType, type: 'Service guide', title, meta, h1, subtitle, summary: `${h1} helps Indian businesses scope the work clearly before hiring an expert on WorkIndex.`, points, useCases: ['Employer setting up the process for the first time.', 'Business with compliance or documentation backlog.', 'Founder comparing quotes and deliverables.', 'Company preparing for audit or due diligence.'], records: ['Current policy/process documents.', 'Employee master and payroll records where relevant.', 'Prior notices, challans, acknowledgements or agreements.', 'Expected deliverable and timeline.'], mistakes: ['Using downloaded templates without adapting facts.', 'No owner approval for compliance-sensitive documents.', 'Ignoring state-specific or employee-count triggers.', 'Not keeping signed acknowledgements.'], related });
}

addExpected(['legal-services-india', 'legal-services-bangalore', 'legal-services-mumbai', 'legal-services-delhi', 'legal-services-hyderabad', 'contract-drafting-services', 'nda-drafting-services', 'business-agreement-drafting', 'legal-notice-services', 'property-legal-services', 'startup-legal-services', 'legal-due-diligence-services']);
page({
  slug: 'legal-services-india',
  refType: 'legal',
  type: 'Legal service',
  title: 'Legal Services in India | WorkIndex',
  meta: 'Find legal services in India for contracts, NDAs, business agreements, legal notices, property legal review, startup legal and due diligence.',
  h1: 'Legal Services in India',
  subtitle: 'Contracts, notices, property review and startup legal support',
  summary: 'Legal services on WorkIndex should be scoped by jurisdiction, facts, documents, urgency and expected deliverable so you compare the right lawyers and legal professionals.',
  points: ['Contract drafting and review should reflect actual business risk, payment flow and dispute forum.', 'Legal notices need facts, evidence, claim amount and desired remedy before drafting.', 'Property legal work should verify title chain, encumbrance, approvals, possession and stamp/registration issues.', 'Startup legal support often covers founder agreements, ESOPs, vendor contracts, privacy terms and compliance.'],
  useCases: ['Business needing contract or NDA drafting.', 'Founder receiving or sending a legal notice.', 'Buyer checking property documents.', 'Startup preparing legal paperwork for customers or investors.'],
  records: ['Draft agreement, notice, title papers or correspondence.', 'Names, addresses, dates, payment proof and dispute facts.', 'Jurisdiction, deadline and desired outcome.', 'Prior legal advice or pending court/authority status.'],
  mistakes: ['Using generic templates for high-value deals.', 'Sending legal notice without evidence review.', 'Ignoring stamp duty and jurisdiction.', 'Mixing legal drafting with tax or accounting advice without coordination.'],
  related: ['contract-drafting-services', 'nda-drafting-services', 'property-legal-services', 'startup-legal-services']
});
for (const city of ['bangalore', 'mumbai', 'delhi', 'hyderabad']) {
  const name = cityName(city);
  page({
    slug: `legal-services-${city}`,
    refType: 'legal',
    type: 'Legal city service',
    title: `Legal Services in ${name} | WorkIndex`,
    meta: `Find legal services in ${name} for contracts, notices, property review, startup legal, due diligence and business agreements.`,
    h1: `Legal Services in ${name}`,
    subtitle: 'Business, property and startup legal support',
    area: { '@type': 'City', name },
    summary: `Legal services in ${name} should be matched to the matter type, court or authority, documents, urgency and commercial risk before you hire.`,
    points: [`${name} businesses often need contract drafting, vendor agreements, employment terms and legal notices.`, 'Property matters require title and local document review.', 'Startup legal work needs coordination with CA/CS where shares, tax or compliance are involved.', 'Ask whether consultation, drafting, revisions and filing/appearance are included.'],
    useCases: [`Business owner in ${name}.`, 'Founder needing startup paperwork.', 'Property buyer or seller.', 'Person preparing a legal notice or reply.'],
    records: ['Draft documents, correspondence and proof.', 'Identity and address details of parties.', 'Payment records, title papers or agreement copies.', 'Deadline, forum and desired remedy.'],
    mistakes: ['Hiring without checking matter-specific experience.', 'Not disclosing pending disputes.', 'Assuming one template works for every deal.', 'Ignoring stamp and registration issues.'],
    related: ['contract-drafting-services', 'legal-notice-services', 'property-legal-services', 'startup-legal-services']
  });
}

for (const [slug, h1, subtitle, points, related] of [
  ['contract-drafting-services', 'Contract Drafting Services', 'Commercial contracts with clear obligations and remedies', ['A contract should define parties, scope, price, delivery, taxes, liability, termination and dispute resolution.', 'Service, vendor, consulting, SaaS, agency and partnership contracts each need different clauses.', 'Ask for review notes explaining key risks, not just a clean draft.', 'High-value contracts should be checked for stamp duty and jurisdiction.'], ['business-agreement-drafting', 'nda-drafting-services', 'startup-legal-services']],
  ['nda-drafting-services', 'NDA Drafting Services', 'Confidentiality agreements for business discussions', ['NDAs should define confidential information, permitted use, exclusions, term and remedies.', 'Mutual and one-way NDAs suit different negotiations.', 'Startups should check IP ownership, employee/contractor access and investor discussions.', 'Avoid overbroad templates that are hard to enforce.'], ['contract-drafting-services', 'startup-legal-services', 'business-agreement-drafting']],
  ['business-agreement-drafting', 'Business Agreement Drafting', 'Founder, vendor, client and partnership agreements', ['Business agreements should convert commercial understanding into enforceable duties.', 'Scope, payment, milestones, tax, confidentiality, IP and termination must be specific.', 'Partnership or collaboration agreements need decision rights and exit terms.', 'Ask for clause-by-clause explanation for important obligations.'], ['contract-drafting-services', 'startup-legal-services', 'legal-due-diligence-services']],
  ['legal-notice-services', 'Legal Notice Services', 'Draft, send or reply with evidence-backed facts', ['Legal notice work starts with facts, evidence, claim amount and legal basis.', 'Replies should respond point-by-point without admissions that hurt later proceedings.', 'The tone and remedy should match commercial goals.', 'Keep dispatch proof and all annexures.'], ['contract-drafting-services', 'property-legal-services', 'legal-services-india']],
  ['property-legal-services', 'Property Legal Services', 'Title, agreement and due diligence review', ['Property legal review should inspect title chain, encumbrance, approvals, tax receipts and possession status.', 'Sale agreements need payment milestones, default remedies and registration readiness.', 'Apartment, plot, lease and commercial property checks differ.', 'Coordinate legal review with loan and tax advice.'], ['legal-due-diligence-services', 'legal-notice-services', 'contract-drafting-services']],
  ['startup-legal-services', 'Startup Legal Services', 'Founder, investor, employee and customer legal docs', ['Startup legal work covers founder agreements, ESOP planning, employment terms, customer contracts and privacy terms.', 'Share issuance, funding and cap table work should be coordinated with CS/CA support.', 'SaaS and marketplace startups need strong terms, privacy and vendor contracts.', 'Ask for a legal document roadmap instead of one-off templates.'], ['company-registration-bangalore', 'contract-drafting-services', 'nda-drafting-services']],
  ['legal-due-diligence-services', 'Legal Due Diligence Services', 'Document review before investment, acquisition or property deal', ['Legal due diligence checks ownership, contracts, disputes, compliance, licences and encumbrances.', 'Scope should define whether it is company, property, vendor or investment diligence.', 'Output should include red flags, risk rating and closing conditions.', 'Coordinate legal, tax and financial diligence for larger transactions.'], ['property-legal-services', 'startup-legal-services', 'business-agreement-drafting']]
]) {
  page({ slug, refType: 'legal', type: 'Legal service guide', title: `${h1} | WorkIndex`, meta: `${h1} in India for ${subtitle.toLowerCase()}. Compare legal experts by scope, facts, documents and timeline.`, h1, subtitle, summary: `${h1} helps convert facts, documents and commercial intent into a usable legal deliverable.`, points, useCases: ['Business owner preparing a transaction.', 'Founder or professional needing legal drafting.', 'Person dealing with property or notice risk.', 'Team wanting document review before signing.'], records: ['Existing drafts and correspondence.', 'Party details, dates, payment and proof.', 'Desired outcome and deadline.', 'Prior notices, disputes or registrations.'], mistakes: ['Using generic templates without fact review.', 'Not checking stamp duty, jurisdiction or authority.', 'Leaving payment and termination terms vague.', 'Not saving signed final copies and annexures.'], related });
}

addExpected(['financial-advisor-services-india', ...financeCities.map((city) => `financial-advisor-${city}`), 'investment-advisor-services', 'retirement-planning-services', 'mutual-fund-advisor-india', 'wealth-management-services']);
page({
  slug: 'financial-advisor-services-india',
  refType: 'finance',
  type: 'Financial advisory service',
  title: 'Financial Advisor Services in India | WorkIndex',
  meta: 'Find financial advisor services in India for investment planning, retirement planning, mutual funds, insurance review and wealth management.',
  h1: 'Financial Advisor Services in India',
  subtitle: 'Investment, retirement and wealth planning support',
  summary: 'Financial advisory work should start with goals, risk profile, time horizon, cash flow, insurance, tax position and whether regulated investment advice is being provided.',
  points: ['Check adviser registration, qualifications and compensation model before acting on investment advice.', 'A plan should separate emergency fund, insurance, goals, tax, retirement and estate documents.', 'Product recommendations should disclose risk, costs, liquidity and conflicts.', 'Coordinate with a CA for tax-heavy decisions.'],
  useCases: ['Professional planning investments.', 'Family preparing retirement plan.', 'NRI or HNI reviewing portfolio and tax impact.', 'Founder managing liquidity after business income or share sale.'],
  records: ['Income, expenses, assets and liabilities.', 'Existing investments, insurance and loans.', 'Goals, risk tolerance and time horizon.', 'Tax returns and capital gains records where relevant.'],
  mistakes: ['Buying products before writing goals.', 'Ignoring insurance and emergency fund.', 'Chasing past returns without risk review.', 'Not checking adviser credentials and fees.'],
  related: ['investment-advisor-services', 'retirement-planning-services', 'mutual-fund-advisor-india', 'wealth-management-services']
});
for (const city of financeCities) {
  const name = cityName(city);
  page({
    slug: `financial-advisor-${city}`,
    refType: 'finance',
    type: 'Financial advisor city service',
    title: `Financial Advisor in ${name} | WorkIndex`,
    meta: `Find financial advisors in ${name} for investment planning, retirement, insurance review, mutual funds and wealth management.`,
    h1: `Financial Advisor in ${name}`,
    subtitle: 'Goal-based planning and portfolio review',
    area: { '@type': 'City', name },
    summary: `A financial advisor in ${name} should understand your income, expenses, tax profile, goals, risk tolerance and existing products before recommending anything.`,
    points: [`${name} professionals may need salary, business income, ESOP, capital gains and retirement planning coordination.`, 'Ask about adviser registration, fee model and product commissions.', 'Written plans should show assumptions, risk, liquidity and tax points.', 'Coordinate tax filing with investment decisions.'],
    useCases: [`Professional in ${name} planning investments.`, 'Family preparing for retirement or child education.', 'Founder or HNI reviewing concentrated wealth.', 'NRI family checking Indian investments.'],
    records: ['Income, expenses and goals.', 'Portfolio statement, insurance and loans.', 'Tax returns, capital gains and Form 26AS/AIS where relevant.', 'Risk profile and liquidity needs.'],
    mistakes: ['Acting on product tips without plan.', 'Ignoring tax and exit load.', 'No emergency fund or insurance review.', 'Not checking adviser credentials.'],
    related: ['investment-advisor-services', 'retirement-planning-services', 'mutual-fund-advisor-india', 'wealth-management-services']
  });
}
for (const [slug, h1, subtitle, points, related] of [
  ['investment-advisor-services', 'Investment Advisor Services', 'Risk-profiled investment planning', ['Investment advice should begin with goals, risk tolerance, time horizon and liquidity needs.', 'Check whether the adviser is registered where regulated investment advice is offered.', 'Compare direct fees, commissions, product costs and conflicts.', 'Written recommendations should explain risk and tax impact.'], ['financial-advisor-services-india', 'mutual-fund-advisor-india', 'wealth-management-services']],
  ['retirement-planning-services', 'Retirement Planning Services', 'Corpus, cash flow and tax planning for retirement', ['Retirement planning estimates corpus needs, inflation, healthcare, insurance and withdrawal strategy.', 'Senior citizens should review pension, annuity, SCSS, FD interest and tax slabs.', 'Plans should test longevity, market risk and emergency cash.', 'Coordinate nominee and estate records.'], ['financial-advisor-services-india', 'itr-for-senior-citizens', 'wealth-management-services']],
  ['mutual-fund-advisor-india', 'Mutual Fund Advisor India', 'Portfolio review and goal-based fund selection', ['Mutual fund advice should map funds to goals, risk and time horizon.', 'Review expense ratio, category, overlap, taxation and exit load.', 'Direct vs regular plans and adviser compensation should be clear.', 'Do not choose funds only by last-year returns.'], ['investment-advisor-services', 'financial-advisor-services-india', 'portfolio-management-services']],
  ['wealth-management-services', 'Wealth Management Services', 'Portfolio, tax, succession and risk coordination', ['Wealth management combines investments, tax, insurance, estate planning and reporting.', 'HNIs should coordinate Schedule AL/FA, capital gains and surcharge exposure with tax advisors.', 'Family portfolios need governance, nominees and documentation.', 'Ask for transparent fees and reporting cadence.'], ['financial-advisor-services-india', 'investment-advisor-services', 'itr-filing-for-hni-high-net-worth']]
]) {
  page({ slug, refType: 'finance', type: 'Financial advisory guide', title: `${h1} | WorkIndex`, meta: `${h1} in India for ${subtitle.toLowerCase()}. Compare advisors by credentials, fee model, scope and planning approach.`, h1, subtitle, summary: `${h1} should be goal-led, risk-aware and transparent about fees, assumptions and product conflicts.`, points, useCases: ['Professional or family planning finances.', 'Investor reviewing portfolio risk.', 'Retired person or senior citizen planning income.', 'HNI or founder coordinating tax and wealth.'], records: ['Income, expenses and goals.', 'Portfolio, insurance and loans.', 'Tax records and capital gains.', 'Risk profile and time horizon.'], mistakes: ['Product-first advice without written plan.', 'No fee or commission clarity.', 'Ignoring tax and liquidity.', 'Not reviewing periodically.'], related });
}

function industryPage(prefix, industry, refType, baseTitle, specifics) {
  const name = titleFromSlug(industry);
  const slug = `${prefix}-${industry}`;
  addExpected([slug]);
  page({
    slug,
    refType,
    type: `${baseTitle} industry guide`,
    title: `${baseTitle} for ${name} | WorkIndex`,
    meta: `${baseTitle} for ${name} in India. Prepare records, compliance details, sector risks and expert brief before hiring on WorkIndex.`,
    h1: `${baseTitle} for ${name}`,
    subtitle: specifics.subtitle,
    summary: `${baseTitle} for ${name} needs sector-specific records and compliance checks instead of generic bookkeeping or filing.`,
    points: specifics.points,
    useCases: specifics.useCases,
    records: specifics.records,
    mistakes: specifics.mistakes,
    related: specifics.related
  });
}

const payrollIndustries = {
  startups: 'founder salary, first hires, ESOP coordination, consultants versus employees and PF/ESIC triggers',
  'small-business': 'owner-managed payroll, cash-flow limits, statutory thresholds and simple approval workflow',
  manufacturing: 'shift attendance, overtime, contractor labour, PF/ESIC and wage records',
  'it-companies': 'remote teams, variable pay, reimbursements, contractor classification and Form 16 coordination',
  restaurants: 'shift rosters, service charge distribution, part-time staff, PF/ESIC and high attrition',
  'retail-stores': 'store staff, incentives, attendance, weekly offs, exits and multi-location payroll',
  hospitals: 'doctor retainers, nurses, technicians, shifts, overtime and statutory registers'
};
for (const [industry, detail] of Object.entries(payrollIndustries)) {
  industryPage('payroll-for', industry, 'hr', 'Payroll', {
    subtitle: detail,
    points: [`Payroll for ${titleFromSlug(industry)} should map ${detail}.`, 'Employee master, attendance and salary changes need monthly approval.', 'Statutory applicability should be reviewed before payroll goes live.', 'Ask whether payslips, bank advice, challans and employee query support are included.'],
    useCases: [`${titleFromSlug(industry)} employer setting up payroll.`, 'Business moving from spreadsheets.', 'Company cleaning compliance gaps.', 'Founder comparing payroll outsourcing quotes.'],
    records: ['Employee master and role list.', 'Attendance, shifts, leave and overtime data.', 'CTC, variable pay and reimbursement policy.', 'PF, ESIC, PT, LWF and TAN status.'],
    mistakes: ['No monthly payroll cutoff.', 'Misclassifying contractors and employees.', 'Ignoring sector-specific shift or incentive data.', 'Weak payroll approval trail.'],
    related: ['payroll-compliance-services', 'payroll-outsourcing-services', 'pf-esic-compliance-monthly']
  });
}

const accountingIndustries = ['pharmacies', 'logistics-companies', 'it-companies', 'coaching-institutes', 'gyms', 'clinics', 'architects', 'interior-designers', 'photographers', 'travel-agencies', 'schools-colleges', 'security-agencies', 'media-companies'];
for (const industry of accountingIndustries) {
  industryPage('accounting-for', industry, 'company', 'Accounting', {
    subtitle: 'Books, GST, expenses and management reporting',
    points: [`Accounting for ${titleFromSlug(industry)} should separate revenue streams, direct costs, staff/vendor payments and tax records.`, 'GST, TDS and professional receipts may need different treatment by sector.', 'Monthly reports should track receivables, margins, cash flow and compliance dues.', 'Ask whether bookkeeping cleanup, GST data and MIS are included.'],
    useCases: [`${titleFromSlug(industry)} owner needing monthly books.`, 'Business preparing ITR or GST filing.', 'Company needing bank loan or investor records.', 'Founder wanting profitability by project/customer.'],
    records: ['Sales invoices and receipts.', 'Purchase bills, expenses and vendor ledgers.', 'Bank, cash, UPI and payment gateway statements.', 'GST/TDS registrations and prior returns.'],
    mistakes: ['Mixing personal and business expenses.', 'Not reconciling payment gateways and bank.', 'No project/customer-wise profitability.', 'Ignoring TDS/GST triggers.'],
    related: ['accounting-bookkeeping-services', 'gst-filing-services', 'tds-filing-services']
  });
}

const gstIndustries = ['coaching-institutes', 'gyms-fitness-studios', 'clinics-doctors', 'lawyers-advocates', 'interior-designers', 'photographers', 'ngos-charitable-trusts', 'exporters', 'importers', 'manufacturers', 'traders', 'professionals'];
for (const industry of gstIndustries) {
  const prefix = ['exporters', 'importers', 'manufacturers', 'traders', 'professionals'].includes(industry) ? 'gst-filing-for' : 'gst-for';
  industryPage(prefix, industry, 'gst', prefix === 'gst-for' ? 'GST' : 'GST Filing', {
    subtitle: 'Registration, invoicing, ITC and return treatment',
    points: [`GST for ${titleFromSlug(industry)} depends on supply type, threshold, place of supply, exemption status and invoicing pattern.`, 'Check whether registration is mandatory or voluntary before filing.', 'ITC, RCM, HSN/SAC and e-invoice/e-way bill needs should be mapped to actual transactions.', 'For nil or exempt supplies, returns and records may still be required if registered.'],
    useCases: [`${titleFromSlug(industry)} checking GST registration or filing.`, 'Business receiving GST notice or mismatch.', 'Entity reviewing ITC eligibility.', 'Owner planning monthly compliance.'],
    records: ['Sales and purchase invoices.', 'GSTIN or registration application status.', 'GSTR-1, GSTR-3B and GSTR-2B data.', 'Contracts, payment records and exemption support.'],
    mistakes: ['Assuming every activity has the same GST treatment.', 'Claiming ITC without eligibility review.', 'Wrong SAC/HSN or place-of-supply treatment.', 'Missing nil return or notice deadlines.'],
    related: ['gst-registration-help', 'gst-filing-services', 'gst-notice-reply-help']
  });
}

for (const profession of ['architects', 'coaches-trainers', 'interior-designers', 'photographers', 'travel-agents']) {
  industryPage('gst-registration-for', profession, 'gst', 'GST Registration', {
    subtitle: 'Threshold, documents and professional service invoicing',
    points: [`GST registration for ${titleFromSlug(profession)} should start with turnover, interstate supply, platform sales and client billing pattern.`, 'Documents usually include PAN, Aadhaar, address proof, bank proof and business premises evidence.', 'SAC/HSN selection, LUT/export status and composition eligibility should be checked where relevant.', 'Ask whether post-registration return setup is included.'],
    useCases: [`${titleFromSlug(profession)} crossing GST threshold.`, 'Professional serving B2B clients.', 'Service provider exporting or billing interstate.', 'New business needing GSTIN for marketplace or corporate clients.'],
    records: ['PAN, Aadhaar and address proof.', 'Business address proof and NOC/rent agreement.', 'Bank proof and nature of services.', 'Expected turnover and client locations.'],
    mistakes: ['Registering under wrong constitution or address.', 'No plan for returns after GSTIN is issued.', 'Wrong SAC or service description.', 'Ignoring cancellation risk if business proof is weak.'],
    related: ['documents-required-for-gst-registration', 'gst-registration-help', 'gst-filing-services']
  });
}

const tdsGuides = [
  ['tds-on-salary-guide', 'TDS on Salary Guide', 'Section 192 payroll TDS, Form 16 and employee declarations', ['Salary TDS generally falls under section 192 and depends on projected annual salary, regime choice, deductions and exemptions.', 'Employers should collect declarations, investment proofs and previous employer salary details.', 'Form 16 should reconcile with quarterly TDS returns and salary records.', 'AY 2026-27 for FY 2025-26 remains under the Income-tax Act, 1961.']],
  ['tds-on-rent-section-194i', 'TDS on Rent Section 194-I', 'Rent TDS for business tenants and high-value rent payments', ['Section 194-I applies to specified rent payments by deductors covered by TDS rules.', 'Individuals/HUFs paying high rent may have separate TDS workflows under other sections/forms.', 'Lease agreement, GST on commercial rent and deposit terms should be reviewed.', 'PAN, threshold and lower/nil certificate status matter.']],
  ['tds-on-contractor-payments-194c', 'TDS on Contractor Payments 194C', 'Contractor and subcontractor payment TDS', ['Section 194C covers many work contracts and subcontractor payments.', 'Check whether the contract is service, works contract, carriage, labour supply or professional service.', 'PAN, threshold, payment timing and GST invoice value should be reconciled.', 'Wrong section selection can create short deduction defaults.']],
  ['tds-on-professional-fees-194j', 'TDS on Professional Fees 194J', 'Professional, technical and royalty payment TDS', ['Section 194J is commonly used for professional fees, technical services, royalty and non-compete type payments.', 'CA, lawyer, consultant, architect, doctor and technical invoices need section review.', 'GST, reimbursements and out-of-pocket expenses should be treated carefully.', 'Lower/nil certificates and PAN status affect deduction.']],
  ['tds-on-interest-194a', 'TDS on Interest 194A', 'Interest other than securities', ['Section 194A applies to many interest payments other than interest on securities.', 'Banks, NBFCs, companies and some entities have different operational workflows.', 'Form 15G/15H, PAN, threshold and exemption status should be checked.', 'Interest accrual and payment dates should reconcile with books.']],
  ['tds-on-commission-194h', 'TDS on Commission 194H', 'Commission and brokerage TDS', ['Section 194H covers commission and brokerage payments subject to threshold and deductor rules.', 'Sales incentives, referral fees, marketplace commission and agency payouts need contract review.', 'GST invoices and TDS base should be reconciled.', 'Do not treat every discount as commission without facts.']],
  ['tds-on-property-purchase-26qb', 'TDS on Property Purchase 26QB', 'Property buyer TDS under section 194-IA', ['Property buyer TDS is commonly paid through Form 26QB for section 194-IA transactions.', 'Buyer/seller PAN, property value, payment instalments and ownership share must be accurate.', 'TDS certificate and challan acknowledgement should be saved.', 'NRI seller cases are different and generally need section 195 review.']],
  ['tds-on-dividends-194', 'TDS on Dividends Section 194', 'Dividend TDS and shareholder records', ['Companies distributing dividends should check section 194 withholding rules, shareholder PAN and exemption documents.', 'Residents, non-residents and treaty cases need different review.', 'Dividend records must reconcile with corporate approvals and payment files.', 'Form 15G/15H or lower certificate claims need evidence.']],
  ['tds-for-nri-payments', 'TDS for NRI Payments', 'Section 195, DTAA and Form 15CA/15CB review', ['Payments to non-residents require section 195 characterisation before remittance.', 'DTAA, TRC, Form 10F, permanent establishment and gross-up clauses can change withholding.', 'Property purchase from NRI seller needs special care.', 'Bank remittance forms and CA certificates should match the tax note.']],
  ['tds-vs-advance-tax-comparison', 'TDS vs Advance Tax Comparison', 'Deduction at source versus self-estimated instalments', ['TDS is deducted by payer from specified payments; advance tax is paid by taxpayer based on estimated total tax liability.', 'A taxpayer may need advance tax even if some TDS is deducted.', 'AIS/Form 26AS reconciliation helps avoid underpayment and interest.', 'For Tax Year 2026-27 onward, check new Act references on the portal.']]
];
addExpected(tdsGuides.map(([slug]) => slug));
for (const [slug, h1, subtitle, points] of tdsGuides) {
  page({ slug, refType: 'tax', type: 'TDS guide', title: `${h1} | WorkIndex`, meta: `${h1} for Indian taxpayers and businesses. Check section, threshold, records, challan, return and certificate treatment.`, h1, subtitle, summary: `${h1} helps deductors and taxpayers understand what to verify before payment, return filing or correction.`, points, useCases: ['Business deducting TDS.', 'Taxpayer reconciling Form 26AS/AIS.', 'Finance team preparing quarterly return.', 'Person receiving notice or default.'], records: ['PAN/TAN and deductor profile.', 'Agreement, invoice and payment dates.', 'Challan, return and certificate status.', 'Lower/nil certificate or exemption proof if any.'], mistakes: ['Wrong section or assessment year.', 'Deducting after payment deadline.', 'Invalid PAN or certificate data.', 'No reconciliation before filing return.'], related: ['tds-filing-services', 'tds-filing-bangalore', 'how-to-check-tds-credit-form-26as'] });
}

const taxActPages = [
  ['section-202-tax-slabs-guide', 'Section 202 Tax Slabs Guide', 'Income-tax Act, 2025 new regime reference', ['Official FAQs state the new tax regime under the Income-tax Act, 2025 is provided in section 202.', 'AY 2026-27 income for FY 2025-26 is still filed under the 1961 Act.', 'Tax Year 2026-27 advance tax and later compliance should be checked against 2025 Act portal guidance.', 'Do not mix AY 2026-27 old-form filing with new Act section labels.']],
  ['section-70-set-off-losses-guide', 'Section 70 Set-Off Losses Guide', 'Old Act intra-head loss set-off reference', ['Section 70 is an Income-tax Act, 1961 reference for intra-head set-off of losses.', 'For the 2025 Act, verify the official section mapping before quoting a new section number.', 'Capital loss, business loss, speculation and house property losses have separate limits.', 'Return schedules and audit trail matter for carry-forward claims.']],
  ['section-71-inter-head-set-off', 'Section 71 Inter-Head Set-Off', 'Old Act inter-head loss set-off reference', ['Section 71 is an Income-tax Act, 1961 reference for inter-head loss set-off.', 'House property, business, capital gains and speculative losses cannot be freely mixed.', 'AY 2026-27 filing should use old Act schedule logic unless official utility says otherwise.', 'Keep computation working papers with return acknowledgement.']],
  ['section-72-carry-forward-business-losses', 'Section 72 Carry Forward Business Losses', 'Business loss carry-forward under old Act reference', ['Section 72 is an Income-tax Act, 1961 reference for carry-forward and set-off of business losses.', 'Filing return within due date is important for many carry-forward claims.', 'Audit, books and continuity facts should be checked.', 'Verify new Act mapping before using section labels for Tax Year 2026-27.']],
  ['section-73-speculation-loss-guide', 'Section 73 Speculation Loss Guide', 'Speculation loss treatment and company deeming rules', ['Section 73 is an Income-tax Act, 1961 reference for speculation business losses.', 'Share trading, derivatives and company deeming provisions need careful classification.', 'F&O is generally treated differently from speculative delivery trades, subject to facts.', 'Carry-forward depends on correct return schedules and records.']],
  ['section-74-capital-loss-carry-forward', 'Section 74 Capital Loss Carry Forward', 'Short-term and long-term capital loss treatment', ['Section 74 is an Income-tax Act, 1961 reference for carry-forward and set-off of capital losses.', 'Long-term and short-term capital losses have different set-off restrictions.', 'Broker statements, property records and indexed cost workings should be preserved.', 'File on time and verify schedule CG details.']],
  ['new-tax-act-2025-deductions-guide', 'New Tax Act 2025 Deductions Guide', 'Transition-aware deduction planning', ['Income Tax Department guidance says old and new Acts run in parallel for transition years.', 'AY 2026-27 for FY 2025-26 is governed by the 1961 Act.', 'For Tax Year 2026-27 onward, deduction references should be checked against 2025 Act forms and FAQs.', 'Do not assume old section numbers remain unchanged in client communication.']],
  ['new-tax-act-2025-exemptions-guide', 'New Tax Act 2025 Exemptions Guide', 'Transition-aware exemption planning', ['Exemptions for earlier years must be claimed under the law applicable to that year.', 'New Act terminology and form mapping should be verified on the e-filing portal.', 'Salary, HRA, capital gains and retirement exemptions need separate evidence.', 'Keep old Act and new Act working papers separate during transition.']],
  ['new-tax-act-2025-compliance-guide', 'New Tax Act 2025 Compliance Guide', 'Portal, tax year and form transition checklist', ['Official FAQs state the e-filing portal will facilitate compliance under old and new Acts concurrently.', 'AY 2026-27 return filing for FY 2025-26 uses old Act forms.', 'Tax Year 2026-27 onward introduces new Act references.', 'Finance teams should update templates, checklists and client notes.']],
  ['presumptive-income-section-44ad-new-act', 'Presumptive Income Section 44AD New Act Guide', 'Old 44AD reference with new Act transition caution', ['Section 44AD is an Income-tax Act, 1961 presumptive taxation reference for eligible businesses.', 'For new Act years, verify official mapping before quoting section numbers.', 'Turnover, digital receipt conditions, audit triggers and lower-profit declaration should be reviewed.', 'GST turnover and books should reconcile with ITR figures.']],
  ['presumptive-income-section-44ada-new-act', 'Presumptive Income Section 44ADA New Act Guide', 'Old 44ADA professional presumptive income reference', ['Section 44ADA is an Income-tax Act, 1961 reference for eligible professionals.', 'For Tax Year 2026-27 onward, verify new Act section mapping and form utility.', 'Profession type, gross receipts, expenses and GST/TDS data should be checked.', 'Lower profit or ineligible profession cases may need books and audit review.']]
];
addExpected(taxActPages.map(([slug]) => slug));
for (const [slug, h1, subtitle, points] of taxActPages) {
  page({ slug, refType: 'tax', type: 'Income tax transition guide', title: `${h1} | WorkIndex`, meta: `${h1} with fact-checked transition notes for AY 2026-27, Tax Year 2026-27 and old versus new Act references.`, h1, subtitle, summary: `${h1} is written with a transition caution: AY 2026-27 for FY 2025-26 remains under the 1961 Act, while the 2025 Act applies from Tax Year 2026-27 onward.`, points, useCases: ['Taxpayer preparing AY 2026-27 filing.', 'CA updating checklists for new Act transition.', 'Business finance team training staff.', 'Founder trying to understand old and new section labels.'], records: ['Assessment year and tax year.', 'Return forms and official portal utility.', 'Computation and evidence for claim.', 'Old Act and new Act section mapping notes.'], mistakes: ['Using new Act section labels for old Act filings.', 'Relying on unofficial mappings without portal check.', 'Not keeping evidence for loss or deduction claims.', 'Missing due-date conditions for carry-forward.'], related: ['itr-filing-services', 'income-tax-calculator-ay-2026-27', 'how-to-check-tds-credit-form-26as'] });
}

const mcaPages = [
  ['mca-form-adt-1-appointment-auditor', 'MCA Form ADT-1 Appointment of Auditor', 'Auditor appointment filing support', ['ADT-1 is linked to auditor appointment reporting for companies.', 'Check appointment date, AGM/board resolution, auditor consent and eligibility certificate.', 'Additional fees may apply if filed late.', 'Coordinate with statutory audit timeline.']],
  ['mca-form-dir-12-changes-directors', 'MCA Form DIR-12 Change in Directors', 'Director appointment, resignation and change filing', ['DIR-12 is used for director/KMP appointment or cessation reporting.', 'DIN, DSC, consent, resignation and board/shareholder approvals should match facts.', 'DIR-3 KYC status can affect filing readiness.', 'Keep proof of appointment/resignation dates.']],
  ['mca-form-mgt-7-annual-return', 'MCA Form MGT-7 Annual Return', 'Company annual return filing', ['MGT-7 or MGT-7A annual return depends on company type and facts.', 'Shareholding, directors, meetings and indebtedness data must reconcile.', 'Annual return is separate from financial statement filing.', 'Certification requirements should be checked.']],
  ['mca-form-aoc-4-financials-filing', 'MCA Form AOC-4 Financial Statements Filing', 'Financial statement filing with ROC', ['AOC-4 is used for filing financial statements and related documents.', 'Audit report, board report, AGM date and financials must align.', 'XBRL applicability should be checked for eligible companies.', 'Delayed filing can trigger additional fees.']],
  ['mca-form-pas-3-allotment-shares', 'MCA Form PAS-3 Return of Allotment', 'Share allotment reporting', ['PAS-3 is used for return of allotment of securities.', 'Board/shareholder approvals, valuation, bank receipt and allottee details are key.', 'Private placement and rights issue records differ.', 'Cap table and share certificates should be updated.']],
  ['mca-spice-plus-registration-guide', 'MCA SPICe+ Registration Guide', 'Company incorporation through SPICe+', ['SPICe+ is the integrated MCA incorporation workflow for companies.', 'Name, directors, registered office, object clause and capital structure must be ready.', 'PAN/TAN and linked registrations may be part of the flow.', 'Post-incorporation compliance should be planned before filing.']],
  ['mca-roc-compliance-calendar', 'MCA ROC Compliance Calendar', 'Company and LLP due-date planning', ['ROC compliance calendars should track annual filings, event-based filings and director KYC.', 'Company, LLP and OPC due dates differ.', 'Audit, AGM and financial finalisation drive annual filing readiness.', 'Maintain proof of filings and challans.']],
  ['llp-form-8-solvency-statement', 'LLP Form 8 Statement of Account and Solvency', 'LLP annual financial filing', ['LLP Form 8 relates to statement of account and solvency.', 'Partner details, contribution, books and solvency declaration must be checked.', 'Audit applicability depends on turnover/contribution thresholds.', 'Delayed filing can create additional fees.']],
  ['llp-form-11-annual-return', 'LLP Form 11 Annual Return', 'LLP annual return filing', ['LLP Form 11 is annual return reporting for LLPs.', 'Partner/designated partner details and contribution data should match MCA records.', 'Form 11 is separate from Form 8.', 'Keep LLP agreement amendments and partner changes aligned.']],
  ['opc-annual-compliance', 'OPC Annual Compliance', 'One Person Company annual filing checklist', ['OPCs have annual ROC, accounting and income tax compliance despite single ownership.', 'AOC-4, MGT-7A, financial statements and audit status need review.', 'Nominee, director KYC and registered office status should be checked.', 'Conversion triggers may apply as business grows.']]
];
addExpected(mcaPages.map(([slug]) => slug));
for (const [slug, h1, subtitle, points] of mcaPages) {
  page({ slug, refType: 'company', type: 'MCA form guide', title: `${h1} | WorkIndex`, meta: `${h1} guide for Indian companies and LLPs. Prepare documents, approvals, DSC, due dates and MCA filing details.`, h1, subtitle, summary: `${h1} should be prepared with current MCA master data, approvals, attachments and due-date status before submission.`, points, useCases: ['Company director preparing ROC filing.', 'CS/CA coordinating company compliance.', 'Startup cleaning MCA records before funding.', 'LLP or OPC owner checking annual filing.'], records: ['MCA master data and login/DSC status.', 'Board/shareholder/partner approvals.', 'Financial statements, audit reports or event documents.', 'Prior forms, challans and due-date notes.'], mistakes: ['Filing without checking master data.', 'Missing attachments or consent letters.', 'Confusing annual and event-based forms.', 'Ignoring additional fee exposure.'], related: ['roc-filing-bangalore', 'company-registration-bangalore', 'mca-roc-compliance-calendar'] });
}

const howTos = [
  ['how-to-file-gst-nil-return', 'How to File GST Nil Return', 'Nil GSTR-3B/GSTR-1 preparation', 'gst', ['A nil GST return is only appropriate when there are no outward supplies, inward supplies, ITC claims, reverse charge liability, interest or late fee to report for the period.', 'Check GST portal system data before selecting nil return.', 'Save acknowledgement after filing.', 'If any transaction exists, file the normal return instead.']],
  ['how-to-add-hsn-code-in-gst', 'How to Add HSN Code in GST', 'HSN/SAC reporting and registration data', 'gst', ['HSN/SAC should match actual goods or services.', 'GST portal and return tables may require digit-level reporting depending on turnover and phase-in rules.', 'Product master and invoice software should be updated together.', 'Wrong HSN can affect rate and compliance review.']],
  ['how-to-check-gst-registration-status', 'How to Check GST Registration Status', 'GSTIN and ARN tracking', 'gst', ['Use GST portal search or ARN tracking for registration status.', 'Check legal name, trade name, address and status before invoicing.', 'If application is pending or rejected, review SCN and document mismatch.', 'Save screenshots or status proof for records.']],
  ['how-to-check-tds-credit-form-26as', 'How to Check TDS Credit in Form 26AS', 'AIS/Form 26AS reconciliation', 'tax', ['Form 26AS and AIS help verify TDS/TCS and tax payments.', 'Match deductor, amount, section and quarter with salary/vendor records.', 'If credit is missing, ask deductor to correct TDS return.', 'Do not file return from bank credits alone.']],
  ['how-to-claim-huf-tax-benefits', 'How to Claim HUF Tax Benefits', 'HUF records and tax filing', 'tax', ['HUF benefit depends on valid HUF existence, separate PAN, bank account and HUF income/assets.', 'Do not mix personal and HUF income without documentation.', 'Gifts, ancestral property and partition facts need care.', 'File ITR and maintain books where required.']],
  ['how-to-form-a-huf', 'How to Form a HUF', 'HUF PAN, deed and bank setup', 'tax', ['A HUF is based on Hindu law family status, not just a tax-saving template.', 'Prepare HUF deed, PAN, bank account and contribution records.', 'Income should belong to HUF assets or activities.', 'Get professional advice before moving assets.']],
  ['how-to-file-itr-for-house-property', 'How to File ITR for House Property', 'Rent, interest and co-owner reporting', 'tax', ['House property income needs ownership, rent, municipal tax and interest details.', 'Self-occupied, let-out and deemed-let-out treatment differs.', 'Co-owners should split income and deductions correctly.', 'TDS on rent and AIS should be reconciled.']],
  ['how-to-file-itr-for-agriculture-income', 'How to File ITR for Agriculture Income', 'Exempt income and partial integration', 'tax', ['Agricultural income is generally exempt centrally but may affect rate calculation through partial integration.', 'Report exempt income properly in ITR schedules.', 'Keep land, crop, sale and expense records.', 'Non-agricultural processing or trading income may be taxable.']],
  ['how-to-register-a-partnership-firm', 'How to Register a Partnership Firm', 'Deed, PAN and state registration', 'company', ['Partnership setup starts with deed terms, partners, capital, profit share and business address.', 'State registration process varies.', 'PAN, bank, GST and Shops Act may be needed after deed.', 'LLP may be better where limited liability is important.']],
  ['how-to-wind-up-a-company', 'How to Wind Up a Company', 'Closure, strike-off and compliance cleanup', 'company', ['Company closure requires checking assets, liabilities, bank accounts, tax dues and ROC status.', 'Strike-off and winding-up are different routes.', 'Pending filings and creditors must be addressed.', 'Get CA/CS/legal review before applying.']],
  ['how-to-remove-director-from-company', 'How to Remove Director from Company', 'Board, shareholder and ROC process', 'company', ['Director removal or resignation depends on facts, consent, notices and Companies Act process.', 'DIR-12 and board/shareholder records should match.', 'Disputes need legal handling.', 'Update bank, GST and other registrations after change.']],
  ['how-to-transfer-shares-private-company', 'How to Transfer Shares in Private Company', 'Share transfer restrictions and records', 'company', ['Private company share transfer must follow articles, transfer deed, stamp duty and board approval process.', 'Cap table, share certificate and register updates are important.', 'Tax and valuation impact may apply.', 'Investor agreements can restrict transfer.']],
  ['how-to-change-company-registered-office', 'How to Change Company Registered Office', 'MCA filing and address proof', 'company', ['Registered office change process depends on whether the move is within city, ROC or state.', 'Board/shareholder approvals, utility bill, NOC and lease proof may be needed.', 'MCA forms and GST/bank updates should be coordinated.', 'Keep signage and statutory records updated.']],
  ['how-to-file-form-15ca-15cb', 'How to File Form 15CA 15CB', 'Foreign remittance declaration and CA certificate', 'tax', ['Form 15CA/15CB is used for specified foreign remittance tax declarations and CA certification.', 'Payment nature, DTAA, TRC, Form 10F and withholding rate need review.', 'Bank purpose code and tax note should match.', 'Do not submit without contract/invoice review.']]
];
addExpected(howTos.map(([slug]) => slug));
for (const [slug, h1, subtitle, refType, points] of howTos) {
  page({ slug, refType, type: 'How-to guide', title: `${h1} | WorkIndex`, meta: `${h1} in India. Step-by-step preparation checklist, documents, common mistakes and when to hire an expert.`, h1, subtitle, summary: `${h1} starts with verifying eligibility, collecting documents and checking portal status before submission.`, points, useCases: ['Person doing initial research.', 'Business owner preparing documents.', 'Taxpayer with portal mismatch or notice.', 'Founder deciding whether to hire expert help.'], records: ['Identity/entity details.', 'Portal login/status and prior filings.', 'Supporting documents and payment records.', 'Deadline and desired output.'], mistakes: ['Starting without eligibility check.', 'Using wrong form or year.', 'Not saving acknowledgement.', 'Ignoring expert review for high-risk facts.'], related: ['itr-filing-services', 'gst-filing-services', 'company-registration-bangalore'] });
}

const itrAudiences = [
  ['itr-for-senior-citizens', 'ITR for Senior Citizens', 'Pension, FD interest, 80TTB and regime choice'],
  ['itr-for-government-employees', 'ITR for Government Employees', 'Salary, pension, allowances and Form 16 review'],
  ['itr-for-commission-agents', 'ITR for Commission Agents', 'Commission income, TDS and expense records'],
  ['itr-for-insurance-agents', 'ITR for Insurance Agents', 'Commission, renewal income, TDS and deductions'],
  ['itr-for-ca-students', 'ITR for CA Students', 'Stipend, freelance income and investments'],
  ['itr-for-landlords', 'ITR for Landlords', 'Rental income, interest and TDS reconciliation'],
  ['itr-for-agricultural-income', 'ITR for Agricultural Income', 'Exempt income reporting and partial integration'],
  ['itr-for-defence-personnel', 'ITR for Defence Personnel', 'Salary, allowances, pension and deductions'],
  ['itr-for-teachers-professors', 'ITR for Teachers Professors', 'Salary, consulting, honorarium and investments'],
  ['itr-for-retired-professionals', 'ITR for Retired Professionals', 'Pension plus consulting or professional income'],
  ['itr-filing-marathahalli-road', 'ITR Filing on Marathahalli Road', 'Local ITR support for salaried, IT and landlord cases']
];
addExpected(itrAudiences.map(([slug]) => slug));
for (const [slug, h1, subtitle] of itrAudiences) {
  page({ slug, refType: 'tax', type: 'ITR audience guide', title: `${h1} | WorkIndex`, meta: `${h1} in India with documents, income heads, AIS/Form 26AS checks, deductions and common filing mistakes.`, h1, subtitle, summary: `${h1} should be scoped by income type, assessment year, deductions, AIS/Form 26AS data and whether business/professional schedules apply.`, points: [`${subtitle} need specific schedule and document review.`, 'AY 2026-27 for FY 2025-26 should be filed under Income-tax Act, 1961 forms.', 'AIS/Form 26AS, bank interest, TDS and capital gains should be reconciled before filing.', 'Select ITR form based on actual income heads, not profession label alone.'], useCases: ['Taxpayer preparing annual ITR.', 'Person with salary plus additional income.', 'Retired or professional taxpayer with mixed income.', 'Taxpayer checking refund or notice risk.'], records: ['PAN, Aadhaar and bank details.', 'Form 16, AIS/Form 26AS and interest certificates.', 'Capital gains, rent, pension or professional income records.', 'Deduction proofs and prior return.'], mistakes: ['Wrong ITR form.', 'Missing interest or capital gains.', 'Claiming deductions without proof.', 'Ignoring special-rate income and rebate limits.'], related: ['itr-filing-services', 'income-tax-calculator-ay-2026-27', 'documents-required-for-itr-filing-business'] });
}

const comparisons = [
  ['pvt-ltd-vs-llp-comparison', 'Private Limited vs LLP', 'Liability, compliance, tax and investor-readiness comparison'],
  ['pvt-ltd-vs-opc-comparison', 'Private Limited vs OPC', 'Single founder versus scalable company structure'],
  ['llp-vs-partnership-firm', 'LLP vs Partnership Firm', 'Limited liability and compliance trade-offs'],
  ['sole-proprietorship-vs-pvt-ltd', 'Sole Proprietorship vs Private Limited', 'Simple start versus separate legal entity'],
  ['gst-regular-vs-composition', 'GST Regular vs Composition Scheme', 'Return, ITC and customer trade-offs'],
  ['ca-vs-cs-for-startups', 'CA vs CS for Startups', 'Tax, accounts and company law role clarity'],
  ['payroll-software-vs-outsourcing', 'Payroll Software vs Outsourcing', 'Tool control versus managed compliance support']
];
addExpected(comparisons.map(([slug]) => slug));
for (const [slug, h1, subtitle] of comparisons) {
  const refType = slug.includes('gst') ? 'gst' : slug.includes('payroll') ? 'hr' : 'company';
  page({ slug, refType, type: 'Comparison guide', title: `${h1} | WorkIndex`, meta: `${h1} comparison for Indian businesses. Compare compliance, cost, tax, control, liability and when to hire an expert.`, h1, subtitle, summary: `${h1} is a decision page for founders and business owners who need to understand cost, compliance, liability, control and future plans before choosing.`, points: ['Compare based on your business model, risk, funding plans and compliance capacity.', 'Lowest setup cost is not always the best long-term structure.', 'Tax, GST, ROC, payroll and legal consequences should be reviewed together.', 'Ask experts to explain assumptions and recurring compliance cost.'], useCases: ['Founder choosing a business structure.', 'Business reviewing compliance burden.', 'Owner comparing software versus expert support.', 'Startup preparing for investors or hiring.'], records: ['Business model and revenue plan.', 'Founder/partner count and ownership expectations.', 'Expected turnover, employees and state presence.', 'Funding, tax and compliance priorities.'], mistakes: ['Choosing only by registration cost.', 'Ignoring recurring filing and professional fees.', 'Not planning bank, GST, payroll and ROC needs.', 'Using generic advice without facts.'], related: ['company-registration-bangalore', 'roc-filing-bangalore', 'gst-registration-help', 'payroll-compliance-services'] });
}

addExpected(['annual-filing-cost-comparison-india', 'portfolio-management-services', 'section-8-company-compliance']);
page({
  slug: 'annual-filing-cost-comparison-india',
  refType: 'company',
  type: 'Cost comparison guide',
  title: 'Annual Filing Cost Comparison India | WorkIndex',
  meta: 'Annual filing cost comparison in India for private limited companies, OPCs, LLPs and partnership firms. Compare ROC, accounting, audit and tax compliance scope.',
  h1: 'Annual Filing Cost Comparison India',
  subtitle: 'Private limited, OPC, LLP and firm compliance cost planning',
  summary: 'Annual filing cost in India depends on entity type, bookkeeping quality, audit applicability, ROC forms, tax return complexity and whether GST/TDS cleanup is needed before filing.',
  points: ['Private limited companies usually need accounts, statutory audit, AOC-4/MGT-7 or relevant variants, ITR and event-form cleanup if pending.', 'LLPs usually compare Form 8, Form 11, ITR, accounting and audit applicability based on contribution and turnover.', 'OPCs can have simpler ownership but still need annual compliance and audit/tax review.', 'Ask experts to separate government fees, additional fees, accounting cleanup, audit and filing professional fees.'],
  useCases: ['Founder choosing entity type.', 'Company with annual filing backlog.', 'LLP comparing recurring compliance cost.', 'Startup preparing a yearly compliance budget.'],
  records: ['Entity type, incorporation date and MCA master data.', 'Books, bank statements and financial statements.', 'Audit applicability and auditor details.', 'Prior filings, challans and pending additional fees.'],
  mistakes: ['Comparing quotes without stating entity type and backlog.', 'Ignoring accounting cleanup before ROC filing.', 'Forgetting auditor appointment or director KYC.', 'Treating government fee and professional fee as one amount.'],
  related: ['pvt-ltd-vs-llp-comparison', 'roc-filing-bangalore', 'mca-roc-compliance-calendar', 'opc-annual-compliance']
});
page({
  slug: 'portfolio-management-services',
  refType: 'finance',
  type: 'Financial advisory guide',
  title: 'Portfolio Management Services | WorkIndex',
  meta: 'Portfolio management services in India for portfolio review, asset allocation, risk, tax impact, reporting and adviser selection.',
  h1: 'Portfolio Management Services',
  subtitle: 'Portfolio review, asset allocation and risk reporting',
  summary: 'Portfolio management services should be evaluated through risk profile, investment objective, cost, tax impact, liquidity needs and the adviser or manager credentials.',
  points: ['Portfolio review should start with asset allocation, concentration risk, liquidity and tax exposure.', 'Regulated portfolio management and investment advisory have different roles, documentation and suitability expectations.', 'Tax impact on equity, debt, mutual funds, PMS, AIF and foreign assets should be reviewed with a tax expert where relevant.', 'Ask for fee structure, reporting cadence, benchmark, risk controls and exit process.'],
  useCases: ['HNI reviewing concentrated portfolio.', 'Founder managing liquidity after share sale.', 'Family office or NRI reviewing India investments.', 'Investor comparing adviser, PMS and mutual fund options.'],
  records: ['Current portfolio statement and transaction history.', 'Goals, risk profile and liquidity needs.', 'Capital gains and tax records.', 'Existing adviser agreements and fee schedules.'],
  mistakes: ['Choosing manager only by past returns.', 'Ignoring fees, tax and liquidity.', 'No written risk profile or investment policy.', 'Not checking registration and conflict disclosures.'],
  related: ['wealth-management-services', 'investment-advisor-services', 'financial-advisor-services-india', 'itr-filing-for-hni-high-net-worth']
});
page({
  slug: 'section-8-company-compliance',
  refType: 'company',
  type: 'Company compliance guide',
  title: 'Section 8 Company Compliance | WorkIndex',
  meta: 'Section 8 company compliance guide for NGOs and non-profits in India covering ROC filing, books, audit, donor records, tax and registration checks.',
  h1: 'Section 8 Company Compliance',
  subtitle: 'Non-profit ROC, accounts, audit and donor-record compliance',
  summary: 'Section 8 company compliance needs company law filings, proper books, audit, donor and grant records, tax registrations and restrictions linked to non-profit objects.',
  points: ['Section 8 companies must maintain books and file applicable ROC annual forms like other companies, with non-profit object restrictions.', 'Audit, board records, member details, grants, donation receipts and utilisation records should be maintained carefully.', 'Income tax exemption, 12A/80G, CSR eligibility and FCRA issues are separate checks and should not be assumed from Section 8 status alone.', 'Ask whether the expert covers ROC, accounting, audit, tax exemption and donor reporting separately.'],
  useCases: ['NGO incorporated as Section 8 company.', 'Founder setting up non-profit compliance calendar.', 'Section 8 company preparing annual filing.', 'Organisation cleaning donor and grant records.'],
  records: ['Certificate of incorporation, licence and MOA/AOA.', 'Books, bank statements, donation and grant records.', 'Board minutes, member registers and project utilisation details.', '12A/80G/FCRA/CSR documents where applicable.'],
  mistakes: ['Assuming no compliance because the entity is non-profit.', 'Mixing donor-restricted funds with general funds.', 'Missing ROC annual filing or audit timelines.', 'Claiming tax/donor benefits without valid registrations.'],
  related: ['mca-roc-compliance-calendar', 'accounting-for-ngos-charitable-trusts', 'audit-services-bangalore', 'legal-services-india']
});

addExpected(auditLocalities.map((locality) => `audit-services-${locality}`));
for (const locality of auditLocalities) {
  const name = cityName(locality);
  page({
    slug: `audit-services-${locality}`,
    refType: 'company',
    type: 'Audit locality service',
    title: `Audit Services in ${name}, Bangalore | WorkIndex`,
    meta: `Find audit services in ${name}, Bangalore for statutory audit, tax audit, internal audit, GST review, startup audit and due diligence.`,
    h1: `Audit Services in ${name}`,
    subtitle: 'Bangalore locality audit support for companies and startups',
    area: { '@type': 'Place', name: `${name}, Bangalore` },
    summary: `Audit services in ${name}, Bangalore are useful for startups, SMEs, service businesses and companies that need statutory audit, tax audit, internal controls or due diligence readiness.`,
    points: [`${name} businesses should clarify whether they need statutory audit, tax audit, internal audit, GST audit-style review or investor due diligence.`, 'Audit scope should include books, bank reconciliation, GST/TDS, fixed assets, receivables and payables.', 'Ask whether financial statement preparation is included or only audit review.', 'Timeline depends on books readiness and management responses.'],
    useCases: [`Startup or SME in ${name}.`, 'Company preparing annual financials.', 'Business facing investor or bank diligence.', 'Founder needing internal control review.'],
    records: ['Trial balance, ledgers and financial statements.', 'Bank, GST, TDS and ROC records.', 'Invoices, contracts, payroll and fixed asset register.', 'Prior audit report and management response status.'],
    mistakes: ['Calling audit after books are incomplete.', 'No GST/TDS reconciliation before audit.', 'Ignoring related-party and loan documentation.', 'Not agreeing deliverables and audit timeline.'],
    related: ['audit-services-bangalore', `accounting-services-${locality}`, `gst-services-${locality}`, 'tax-audit-applicability']
  });
}

const duplicateExpected = expectedSlugs.filter((slug, index) => expectedSlugs.indexOf(slug) !== index);
if (duplicateExpected.length) {
  throw new Error(`Duplicate generated slug definitions: ${[...new Set(duplicateExpected)].join(', ')}`);
}

if (!fs.existsSync(seoDir)) fs.mkdirSync(seoDir, { recursive: true });

const created = [];
const skipped = [];
const generatedSlugs = pages.map((item) => item.slug);
const missing = expectedSlugs.filter((slug) => !generatedSlugs.includes(slug));
if (missing.length) {
  throw new Error(`Missing generated pages for slugs: ${missing.join(', ')}`);
}

for (const item of pages) {
  const file = path.join(seoDir, `${item.slug}.html`);
  if (fs.existsSync(file)) {
    skipped.push(item.slug);
    continue;
  }
  fs.writeFileSync(file, render(item), 'utf8');
  created.push(item.slug);
}

let sitemap = fs.existsSync(sitemapPath)
  ? fs.readFileSync(sitemapPath, 'utf8')
  : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n';

const urls = [];
let additions = '';
let sitemapAdditions = 0;
for (const slug of generatedSlugs) {
  const loc = `https://workindex.co.in/seo-pages/${slug}.html`;
  urls.push(loc);
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    additions += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    sitemapAdditions += 1;
  }
}

if (additions) {
  sitemap = sitemap.replace(/\s*<\/urlset>\s*$/, `\n${additions}</urlset>\n`);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

fs.writeFileSync(manifestPath, JSON.stringify({
  batch: 16,
  factDate,
  createdCount: created.length,
  skippedCount: skipped.length,
  urlCount: urls.length,
  urls
}, null, 2), 'utf8');

console.log(`Batch 16 pages generated: ${pages.length}`);
console.log(`Created: ${created.length}`);
console.log(`Skipped existing: ${skipped.length}`);
console.log(`Sitemap additions: ${sitemapAdditions}`);
console.log(`IndexNow manifest: ${manifestPath}`);
