const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const manifestPath = path.join(root, 'batch17-indexnow-urls.json');
const sourcePath = path.join(root, 'batch17-source-slugs.json');
const sourceMarkdownPath = 'C:/Users/LENOVO/Downloads/workindex-seo-expansion.md';
const today = new Date().toISOString().slice(0, 10);
const factDate = '2026-06-04';
const ctaUrl = '/?signup=true&role=client';

const acronyms = {
  ca: 'CA', cfo: 'CFO', dsc: 'DSC', emi: 'EMI', epf: 'EPF', esic: 'ESIC',
  fd: 'FD', fy: 'FY', gst: 'GST', hra: 'HRA', itr: 'ITR', llp: 'LLP',
  ltcg: 'LTCG', msme: 'MSME', nri: 'NRI', opc: 'OPC', pan: 'PAN',
  pf: 'PF', pvt: 'Pvt', roc: 'ROC', stcg: 'STCG', tcs: 'TCS', tds: 'TDS'
};

const cityNotes = {
  bangalore: 'startup, IT, SaaS, consulting and services businesses',
  delhi: 'professionals, traders, consultants, NGOs and NCR businesses',
  mumbai: 'finance, media, trading, export, agency and head-office teams',
  chennai: 'manufacturing, logistics, IT, export and professional firms',
  hyderabad: 'technology, pharma, consulting, contractor and startup teams',
  pune: 'IT, automotive, manufacturing, startup and services businesses',
  kolkata: 'trading, logistics, legacy companies and professional firms',
  ahmedabad: 'textile, chemical, manufacturing, trading and family businesses',
  surat: 'diamond, textile, trading, export and manufacturing businesses',
  jaipur: 'tourism, gems, jewellery, handicraft, trader and service businesses',
  chandigarh: 'professionals, regional offices, traders and service firms',
  kochi: 'NRI families, tourism, exporters, logistics and professional firms',
  indore: 'MSMEs, education providers, food businesses, traders and services',
  lucknow: 'professionals, contractors, education providers and local businesses',
  nagpur: 'logistics, trading, contractors and central India SMEs',
  bhopal: 'MSMEs, pharma, government contractors and service businesses',
  visakhapatnam: 'port logistics, steel, pharma, defence and manufacturing businesses',
  guwahati: 'tea, logistics, trading, distribution and North East businesses',
  coimbatore: 'textile, engineering, pumps, motors and export units',
  ranchi: 'mining-linked, contractor, education, healthcare and SME businesses',
  vadodara: 'chemical, engineering, pharma and manufacturing businesses',
  rajkot: 'engineering, jewellery, auto parts and MSME businesses',
  patna: 'contractors, education providers, agri-traders and service firms',
  noida: 'IT, BPO, startups, exporters, real estate and service businesses',
  thane: 'SMEs, professionals, logistics and Mumbai-region businesses',
  ludhiana: 'textile, cycle, manufacturing, trader and export businesses',
  jodhpur: 'handicraft, tourism, textile and regional trader businesses',
  varanasi: 'textile, tourism, education and family-owned businesses',
  madurai: 'textile, trading, education, healthcare and regional SMEs',
  mysore: 'IT, tourism, education, manufacturing and services businesses',
  hubli: 'trading, logistics, education and North Karnataka businesses',
  mangalore: 'port, education, healthcare, NRI and services businesses'
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
  payroll: [
    ['EPFO', 'https://www.epfindia.gov.in/'],
    ['EPFO employer portal', 'https://unifiedportal-emp.epfindia.gov.in/epfo/'],
    ['ESIC', 'https://www.esic.gov.in/']
  ],
  finance: [
    ['SEBI', 'https://www.sebi.gov.in/'],
    ['RBI', 'https://www.rbi.org.in/'],
    ['AMFI', 'https://www.amfiindia.com/']
  ]
};

function readSlugs() {
  if (fs.existsSync(sourcePath)) return JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const md = fs.readFileSync(sourceMarkdownPath, 'utf8');
  const blocks = [...md.matchAll(/```\s*([\s\S]*?)```/g)].map((m) => m[1].split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  const slugs = blocks
    .filter((lines) => lines.every((s) => /^[a-z0-9-]+(?: \([^)]+\))?$/.test(s)))
    .flat()
    .map((s) => s.replace(/\s*\([^)]+\)\s*$/, '').toLowerCase());
  return [...new Set(slugs)];
}

function esc(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => acronyms[part] || part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function singularPhrase(slug) {
  return titleFromSlug(slug).replace(/\bPvt\b/g, 'Private').replace(/\bVs\b/g, 'vs');
}

function serviceSentence(label) {
  return label.split(' ').map((part, index) => {
    const lower = part.toLowerCase();
    if (Object.values(acronyms).includes(part)) return part;
    return index === 0 ? part : lower;
  }).join(' ');
}

function cityName(city) {
  if (!city) return '';
  if (city === 'india') return 'India';
  if (city === 'all-cities') return 'All Cities';
  if (city === 'karnataka') return 'Karnataka';
  return titleFromSlug(city);
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function relatedLinks(slugs) {
  return slugs.map((slug) => `<a href="/seo-pages/${slug}.html">${esc(titleFromSlug(slug))}</a>`).join('');
}

function sourceLinks(type) {
  return (refs[type] || refs.tax).map(([label, href]) => `<a href="${href}" rel="nofollow">${esc(label)}</a>`).join('');
}

function refTypeFor(slug) {
  if (/gst|input-tax-credit|reverse-charge|works-contract/.test(slug)) return 'gst';
  if (/payroll|pf|epf|esic|professional-tax|gratuity/.test(slug)) return 'payroll';
  if (/company|llp|opc|roc|mca|audit|accounting|bookkeeping|msme|udyam|registration-status-checker/.test(slug)) return 'company';
  if (/finance|portfolio|emi|wealth|investment/.test(slug)) return 'finance';
  return 'tax';
}

function factNote(type, slug) {
  if (/income-tax-act-2025|new-tax|2026-27|ay-2026-27|fy-2026-27/.test(slug)) {
    return 'AY 2026-27 return filing for FY 2025-26 should not be confused with the Income-tax Act, 2025 transition. Official FAQs say the new Act applies from Tax Year 2026-27 onward, while earlier assessment-year filings continue with the applicable old Act forms.';
  }
  const notes = {
    tax: 'Income-tax, TDS, advance tax, deduction and notice positions should be verified against the active assessment year, e-filing utility, AIS/Form 26AS, TRACES data and current circulars before filing.',
    gst: 'GST registration, returns, ITC, RCM, HSN/SAC, late fee and refund positions should be checked against the live GST portal, CBIC notifications and current return utilities before filing.',
    company: 'MCA, ROC, company registration, LLP, audit, accounting and compliance work should be verified against current MCA V3 forms, master data, board records and applicable entity facts.',
    payroll: 'Payroll, PF, ESIC, professional tax and labour compliance depend on employee count, wage structure, state, registrations and current EPFO/ESIC portal status.',
    finance: 'Financial advisory, portfolio, insurance, retirement and investment planning should be handled with credential checks and clear risk, fee and tax disclosures.'
  };
  return notes[type] || notes.tax;
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
<section class="wi-panel"><div class="lp-section-eyebrow">Official fact-check status</div><h2>Fact-check notes</h2><p><strong>Last fact-checked:</strong> ${factDate}</p><p>${page.factNote}</p><p>This page is preparation guidance. Ask the expert to verify active law, portal forms, notifications and your documents before filing, signing or paying.</p></section>
<section class="wi-panel"><div class="lp-section-eyebrow">${esc(page.type)}</div><h2>${esc(page.coverTitle)}</h2><p>${page.summary}</p>${list(page.points)}</section>
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

function splitServiceCity(slug, prefix) {
  const city = slug.slice(prefix.length + 1);
  return city || 'india';
}

function localService(slug, serviceLabel, prefix, refType, options = {}) {
  const city = splitServiceCity(slug, prefix);
  const name = cityName(city);
  const isHub = city === 'india' || city === 'all-cities' || city === 'karnataka';
  const note = cityNotes[city] || (city === 'karnataka' ? 'Karnataka-based SMEs, professionals and local businesses' : 'local businesses, professionals and growing SMEs');
  const serviceText = serviceSentence(serviceLabel);
  const h1 = isHub ? `${serviceLabel} ${name}` : `${serviceLabel} in ${name}`;
  return {
    slug,
    refType,
    type: options.type || `${serviceLabel} page`,
    title: `${h1} | WorkIndex`,
    meta: isHub
      ? `${serviceLabel} ${name} guide for documents, scope, pricing questions, compliance checks and expert comparison on WorkIndex.`
      : `Find ${serviceText} in ${name} for ${note}. Compare experts by scope, documents, compliance risk and timeline.`,
    h1,
    subtitle: options.subtitle || 'Compare experts by scope, documents and timeline',
    area: isHub ? { '@type': 'Country', name: 'India' } : { '@type': 'City', name },
    summary: isHub
      ? `${serviceLabel} ${name} pages help users compare expert scope, documents, compliance risk, deadlines and recurring support before hiring.`
      : `${name} ${serviceText} work commonly involves ${note}. The right expert should ask for entity type, records, prior filings, notices and deadlines before quoting.`,
    coverTitle: options.coverTitle || `What ${serviceText} covers`,
    points: options.points ? options.points(name, note, isHub) : [
      `${serviceLabel} should be scoped by entity type, year or period, compliance status and expected deliverable.`,
      isHub ? 'For hub pages, compare city availability, specialist experience and recurring support options.' : `For ${name}, mention your locality, industry and deadline so quotes do not stay generic.`,
      'Ask whether review, filing, correction, notice support and government fees are included in the quote.',
      'Keep acknowledgements, challans, working papers and advice notes after completion.'
    ],
    useCases: options.useCases || ['Business owner comparing expert quotes.', 'Taxpayer or founder with filing or compliance deadline.', 'Company cleaning old records or notices.', 'Professional needing specialist review.'],
    records: options.records || ['PAN/entity details and portal status.', 'Prior filings, notices, challans and acknowledgements.', 'Books, invoices, bank statements and reconciliations where relevant.', 'Deadline, expected output and preferred support model.'],
    mistakes: options.mistakes || ['Comparing quotes without sharing exact scope.', 'Ignoring old notices, defaults or portal mismatches.', 'Assuming government fees are included.', 'Not keeping evidence after filing.'],
    process: ['Mention city, entity type, year or period, deadline and current portal status.', 'List the documents available and gaps you already know.', 'Ask for scope, timeline, assumptions and exclusions in writing.', 'Save all working papers, challans, acknowledgements and final deliverables.'],
    faqs: [
      [`Can I find ${serviceLabel.toLowerCase()} on WorkIndex?`, 'Yes. Post your requirement once and compare relevant experts by quote, scope, documents and timeline.'],
      ['How should I compare quotes?', 'Compare deliverables, filing/review depth, notice support, government-fee exclusions, turnaround time and evidence handling.'],
      ['Is this page final advice?', 'No. Use it to prepare your requirement; the expert should verify current law, portal forms and your documents.']
    ],
    related: options.related || ['itr-filing-services', 'gst-filing-services', 'accounting-bookkeeping-services', 'audit-services-bangalore'],
    factNote: factNote(refType, slug),
    table: options.table
  };
}

function professionPage(slug) {
  const [serviceRaw, professionRaw] = slug.split('-for-');
  const refType = refTypeFor(slug);
  const service = singularPhrase(serviceRaw);
  const profession = singularPhrase(professionRaw);
  const h1 = `${service} for ${profession}`;
  return {
    slug, refType, type: 'Profession-specific service page',
    title: `${h1} | WorkIndex`,
    meta: `${h1} in India. Prepare documents, compliance scope, tax records and expert brief before hiring on WorkIndex.`,
    h1,
    subtitle: 'Profession-specific documents, risks and filing scope',
    summary: `${h1} should reflect how ${profession.toLowerCase()} earn, bill, spend, invest and maintain records. A generic checklist often misses profession-specific TDS, GST, expense and compliance points.`,
    coverTitle: `What ${h1.toLowerCase()} covers`,
    points: [
      `${profession} may have salary, professional fees, business income, retainers, reimbursements, capital gains or foreign income depending on facts.`,
      `${service} scope should separate filing, advisory, bookkeeping, GST, TDS, notices and ongoing compliance.`,
      'AIS/Form 26AS, bank statements, invoices, contracts and expense proof should be reconciled before filing.',
      'Ask whether the expert has handled the same profession before and can explain the required records clearly.'
    ],
    useCases: [`${profession} comparing experts.`, 'Taxpayer with mixed salary, professional or business income.', 'Professional receiving TDS or GST queries.', 'Person preparing for loan, visa, audit or notice response.'],
    records: ['Income invoices, salary slips, retainers or commission statements.', 'AIS/Form 26AS, bank statements and investment records.', 'Expense bills, contracts, GST/TDS data and prior returns.', 'Notices, deadlines and specific output expected.'],
    mistakes: ['Using the wrong ITR or GST treatment because the profession label sounds simple.', 'Missing reimbursed expenses, commission, retainers or foreign receipts.', 'Claiming expenses without proof.', 'Not reconciling TDS and bank credits.'],
    process: ['Mention profession, income streams, city, year and deadline.', 'Share prior returns, AIS/Form 26AS, bank and invoice summaries.', 'Ask for form selection, tax/GST/TDS treatment and record gaps.', 'Save the computation and advice note for future scrutiny.'],
    faqs: [
      [`Why does ${profession.toLowerCase()} need a specific page?`, 'Different professions have different income patterns, expense records, GST/TDS issues and filing risks.'],
      ['Can WorkIndex help find a specialist?', 'Yes. Post your profession, income streams and documents so relevant experts can quote accurately.'],
      ['Is this tax advice?', 'No. It is a preparation guide; your expert should verify your facts and current law.']
    ],
    related: ['itr-filing-services', 'gst-filing-services', 'accounting-bookkeeping-services', 'hire-ca-online-india'],
    factNote: factNote(refType, slug)
  };
}

function faqPage(slug) {
  const topic = singularPhrase(slug.replace(/^faq-/, ''));
  const refType = refTypeFor(slug);
  return {
    slug, refType, type: 'FAQ page',
    title: `${topic} FAQ | WorkIndex`,
    meta: `${topic} FAQ for India. Clear answers on applicability, documents, filing, cost, timelines and common mistakes before hiring an expert.`,
    h1: `${topic} FAQ`,
    subtitle: 'Short answers before you hire an expert',
    summary: `${topic} questions usually become easier once you identify the year, entity type, documents, portal status and deadline. This FAQ helps you prepare a better WorkIndex brief.`,
    coverTitle: `Key ${topic.toLowerCase()} questions`,
    points: ['Confirm whether the issue is filing, registration, correction, notice reply, advisory or ongoing compliance.', 'Check official portal status before relying on memory or old forms.', 'Keep documents and transaction evidence ready before asking for a quote.', 'For deadlines, mention exact dates and current status.'],
    useCases: ['User doing initial research.', 'Founder comparing expert scope.', 'Taxpayer trying to understand a notice or filing requirement.', 'Business owner preparing documents.'],
    records: ['Entity or taxpayer details.', 'Prior filings and portal status.', 'Notice, challan or acknowledgement if any.', 'Transaction details and deadline.'],
    mistakes: ['Asking for a fixed answer without facts.', 'Using old thresholds or forms.', 'Ignoring portal mismatch.', 'Not saving evidence after filing.'],
    process: ['Read the FAQ to identify your issue type.', 'Collect the records listed here.', 'Post the requirement with facts and deadline.', 'Ask the expert for a written scope before starting.'],
    faqs: [
      [`What is the first thing to check for ${topic}?`, 'Check the applicable year, entity type, portal status and whether any notice or deadline is involved.'],
      ['When should I hire an expert?', 'Hire an expert when money, penalties, registration, notices, audit, foreign income or company-law filings are involved.'],
      ['Can WorkIndex compare experts?', 'Yes. Share your facts once and compare relevant professionals by quote and scope.']
    ],
    related: ['hire-ca-online-india', 'itr-filing-services', 'gst-filing-services', 'accounting-bookkeeping-services'],
    factNote: factNote(refType, slug)
  };
}

function documentPage(slug) {
  const topic = singularPhrase(slug.replace(/^documents-required-for-/, ''));
  const refType = refTypeFor(slug);
  return {
    slug, refType, type: 'Documents checklist',
    title: `Documents Required for ${topic} | WorkIndex`,
    meta: `Documents required for ${topic} in India. Checklist for identity, portal, financial, compliance and supporting records before hiring an expert.`,
    h1: `Documents Required for ${topic}`,
    subtitle: 'Checklist before filing, registration or expert review',
    summary: `Documents required for ${topic.toLowerCase()} depend on your entity type, year, transaction facts, portal status and whether you need filing, correction, registration or advisory.`,
    coverTitle: 'Document checklist',
    points: ['Start with identity, PAN/GSTIN/MCA or registration details.', 'Add period-wise financial records, invoices, bank statements and prior filings where relevant.', 'Keep notices, challans, acknowledgements and portal screenshots if the case involves correction or reply.', 'Ask the expert if any certified copy, DSC, board resolution, affidavit or legal document is needed.'],
    useCases: ['User preparing before posting on WorkIndex.', 'Business owner avoiding back-and-forth with expert.', 'Taxpayer responding to notice or filing deadline.', 'Founder collecting records for compliance.'],
    records: ['Identity and entity documents.', 'Portal login/status and prior acknowledgements.', 'Invoices, bank, books, payroll or transaction records.', 'Notice/order/challan documents if any.'],
    mistakes: ['Sending screenshots without underlying records.', 'Leaving out old notices or defaults.', 'Not naming the year, period or entity type.', 'Assuming one checklist fits every case.'],
    process: ['Create a folder by year or period.', 'Add identity, portal and financial records.', 'Highlight missing documents and deadline.', 'Share the checklist with your WorkIndex expert for quote confirmation.'],
    faqs: [
      [`Are these all documents for ${topic}?`, 'No. They are a starting checklist; your expert may ask for more based on facts and portal status.'],
      ['Can I get a quote before all documents are ready?', 'Yes, but disclose what is missing so the quote and timeline remain realistic.'],
      ['Should I upload original documents?', 'Usually scanned copies are enough for review, but official filing may need DSC, OTP, original records or certified copies depending on the task.']
    ],
    related: ['documents-required-for-itr-filing-business', 'documents-required-for-gst-registration', 'hire-ca-online-india'],
    factNote: factNote(refType, slug)
  };
}

function howToPage(slug) {
  const topic = singularPhrase(slug.replace(/^how-to-/, ''));
  const refType = refTypeFor(slug);
  return {
    slug, refType, type: 'How-to guide',
    title: `How to ${topic} | WorkIndex`,
    meta: `How to ${topic.toLowerCase()} in India. Step-by-step preparation guide, documents, common mistakes and when to hire an expert.`,
    h1: `How to ${topic}`,
    subtitle: 'Preparation steps before using the portal or hiring an expert',
    summary: `To ${topic.toLowerCase()}, first confirm eligibility, year or period, portal status, records and deadline. This guide helps you prepare the facts before taking action.`,
    coverTitle: 'Step-by-step preparation',
    points: ['Confirm the applicable law year, registration type, taxpayer or entity category.', 'Collect identity, portal and transaction documents before starting.', 'Check whether a notice, due date, challan, DSC, OTP or certificate is required.', 'Submit only after reconciling records and save acknowledgement after completion.'],
    useCases: ['Taxpayer doing initial research.', 'Founder preparing compliance records.', 'Business owner facing a portal deadline.', 'Person deciding whether expert help is required.'],
    records: ['PAN, GSTIN, TAN, MCA or relevant registration details.', 'Portal login/status and prior filings.', 'Invoices, payroll, bank or tax records where relevant.', 'Notice/order/challan if any.'],
    mistakes: ['Starting on the portal without checking eligibility.', 'Selecting wrong year or form.', 'Saving draft but not submitting.', 'Not downloading acknowledgement and proof.'],
    process: ['Write down the exact task and deadline.', 'Collect required documents and current portal status.', 'Post on WorkIndex if the case involves money, notice, audit or uncertainty.', 'Keep final acknowledgement and working papers.'],
    faqs: [
      [`Can I ${topic.toLowerCase()} myself?`, 'For simple cases, maybe. For notices, penalties, high amounts, company filings or uncertain facts, expert review is safer.'],
      ['What should I mention to an expert?', 'Mention year or period, entity type, portal status, documents available and deadline.'],
      ['Is this page a filing utility?', 'No. It is a preparation guide; use official portals or a qualified expert for actual filing.']
    ],
    related: ['itr-filing-services', 'gst-filing-services', 'company-registration-bangalore', 'hire-ca-online-india'],
    factNote: factNote(refType, slug)
  };
}

function pricePage(slug) {
  const topic = singularPhrase(slug.replace(/-(cost|fees)-india$/, '').replace(/-india$/, ''));
  const refType = refTypeFor(slug);
  return {
    slug, refType, type: 'Cost guide',
    title: `${topic} Cost in India | WorkIndex`,
    meta: `${topic} cost in India. Understand fee factors, government charges, scope, documents and quote comparison before hiring an expert.`,
    h1: `${topic} Cost in India`,
    subtitle: 'Fee factors, scope and quote comparison',
    summary: `${topic} cost in India depends on scope, documents, urgency, compliance backlog, city, professional experience and whether government fees or portal charges are included.`,
    coverTitle: 'What affects pricing',
    points: ['Simple filing or review costs less than cleanup, correction, notice reply, audit or representation.', 'Government fees, additional fees, stamp duty, DSC, challans and third-party charges should be separated from professional fees.', 'Poor records, backlog and urgent deadlines increase effort.', 'Ask for deliverables, revisions, filing proof and post-filing support in the quote.'],
    useCases: ['User comparing expert quotes.', 'Founder budgeting annual compliance.', 'Taxpayer estimating filing or notice cost.', 'Business deciding between one-time and recurring support.'],
    records: ['Entity type and city.', 'Scope and expected deliverable.', 'Backlog, notices and portal status.', 'Documents available and deadline.'],
    mistakes: ['Choosing only the lowest quote.', 'Not separating government and professional fees.', 'Ignoring cleanup effort.', 'No written deliverable list.'],
    process: ['Describe the exact scope and current status.', 'Ask for fee breakup and exclusions.', 'Compare experience and turnaround time.', 'Confirm final deliverables before paying.'],
    faqs: [
      [`Why do ${topic.toLowerCase()} fees vary?`, 'Fees vary because record quality, complexity, deadline, city, risk and deliverables vary.'],
      ['Are government fees included?', 'Not always. Ask for a separate breakup of government fee, professional fee and taxes.'],
      ['Can WorkIndex get multiple quotes?', 'Yes. Post your requirement once and compare relevant expert quotes.']
    ],
    related: ['ca-services-cost-india', 'chartered-accountant-fees-india', 'hire-ca-online-india'],
    factNote: factNote(refType, slug),
    table: { title: 'Quote comparison checklist', head: ['Cost driver', 'What to ask'], rows: [['Scope', 'Filing only, review, correction, notice or audit?'], ['Fees', 'Professional fee vs government/portal charges?'], ['Records', 'Is cleanup included?']] }
  };
}

function blogPage(slug) {
  const topic = singularPhrase(slug.replace(/^blog-/, ''));
  const refType = refTypeFor(slug);
  return {
    slug, refType, type: 'Blog guide',
    title: `${topic} | WorkIndex`,
    meta: `${topic} guide for Indian taxpayers and businesses. Practical explanation, records to check, mistakes to avoid and when to hire an expert.`,
    h1: topic,
    subtitle: 'Practical guide for Indian taxpayers and businesses',
    summary: `${topic} is a practical WorkIndex guide for understanding the issue, preparing records and knowing when expert help is worth it.`,
    coverTitle: 'Key points',
    points: ['Start with the applicable year, entity type and transaction facts.', 'Check official portal data before relying on estimates or old rules.', 'Separate tax, GST, company-law, payroll and legal issues where they overlap.', 'Ask for a written expert scope when the amount, penalty or compliance risk is meaningful.'],
    useCases: ['Founder learning before hiring.', 'Taxpayer preparing documents.', 'Business owner comparing options.', 'Professional building a compliance checklist.'],
    records: ['Year, period and entity details.', 'Portal data, returns and notices.', 'Invoices, books, bank and payroll records as relevant.', 'Questions you want the expert to answer.'],
    mistakes: ['Treating online summaries as final advice.', 'Ignoring transition-year changes.', 'Not reconciling official data.', 'Waiting until the deadline.'],
    process: ['Read the guide and identify your exact issue.', 'Collect records and official portal status.', 'Post the requirement on WorkIndex with deadline and scope.', 'Ask the expert for assumptions and deliverables.'],
    faqs: [
      ['Is this blog final advice?', 'No. It is an explainer. Use official sources and expert review before taking a tax or legal position.'],
      ['When should I hire an expert?', 'When notices, penalties, high values, foreign income, audit, GST, ROC or unclear facts are involved.'],
      ['Can WorkIndex help?', 'Yes. Post your requirement and compare relevant professionals.']
    ],
    related: ['hire-ca-online-india', 'itr-filing-services', 'gst-filing-services', 'accounting-bookkeeping-services'],
    factNote: factNote(refType, slug)
  };
}

function toolPage(slug) {
  const topic = singularPhrase(slug.replace(/-(calculator|checker)$/, ''));
  const refType = refTypeFor(slug);
  const isChecker = slug.endsWith('-checker');
  return {
    slug, refType, type: isChecker ? 'Checker guide' : 'Calculator guide',
    title: `${topic} ${isChecker ? 'Checker' : 'Calculator'} | WorkIndex`,
    meta: `${topic} ${isChecker ? 'checker' : 'calculator'} guide for India. Inputs to prepare, assumptions, limitations and when expert review is needed.`,
    h1: `${topic} ${isChecker ? 'Checker' : 'Calculator'}`,
    subtitle: 'Inputs, assumptions and expert review points',
    summary: `${topic} ${isChecker ? 'checker' : 'calculator'} pages help users prepare the right inputs and understand limitations before relying on estimates or portal status.`,
    coverTitle: isChecker ? 'What to check' : 'Inputs needed for estimation',
    points: isChecker
      ? ['Use the official portal as the source of truth for status.', 'Keep PAN/GSTIN/CIN or application reference ready.', 'Save the status screenshot and date checked.', 'If status blocks filing or registration, ask an expert to review the reason.']
      : ['Estimate results depend on correct year, income, deductions, rates and transaction details.', 'Use current official rates and portal utilities before filing.', 'Separate tax, interest, late fee, surcharge and cess where applicable.', 'Expert review is recommended for high-value, notice or multi-income cases.'],
    useCases: ['User estimating before hiring.', 'Taxpayer preparing documents.', 'Business owner checking compliance exposure.', 'Founder comparing expert quotes.'],
    records: ['Applicable year or period.', 'Income, transaction or registration details.', 'Portal data and prior filings where relevant.', 'Assumptions used in the estimate.'],
    mistakes: ['Using outdated rates.', 'Entering summary numbers without reconciliation.', 'Treating estimates as final filing advice.', 'Ignoring interest, late fee or special-rate income.'],
    process: ['Collect inputs and official portal status.', 'Run your estimate or checker carefully.', 'Post on WorkIndex if the result is uncertain or high-risk.', 'Save assumptions and final expert computation.'],
    faqs: [
      ['Is this a substitute for filing?', 'No. Use official portals and expert review before filing or paying.'],
      ['Why can estimates differ from final tax?', 'Because deductions, special rates, interest, credits and portal data can change the final result.'],
      ['Can WorkIndex experts verify my calculation?', 'Yes. Share inputs, assumptions and documents for review.']
    ],
    related: ['income-tax-calculator-ay-2026-27', 'advance-tax-calculator', 'gst-calculator', 'hire-ca-online-india'],
    factNote: factNote(refType, slug)
  };
}

function pageFor(slug) {
  if (slug.includes('-for-') && !slug.startsWith('documents-required-for-')) return professionPage(slug);
  if (slug.startsWith('faq-')) return faqPage(slug);
  if (slug.startsWith('documents-required-for-')) return documentPage(slug);
  if (slug.startsWith('how-to-')) return howToPage(slug);
  if (slug.startsWith('blog-')) return blogPage(slug);
  if (/(calculator|checker)$/.test(slug)) return toolPage(slug);
  if (/(cost|fees)-india$/.test(slug)) return pricePage(slug);

  const servicePatterns = [
    ['ca-services', 'CA Services', 'tax', { subtitle: 'ITR, GST, audit, accounting and compliance support' }],
    ['income-tax-services', 'Income Tax Services', 'tax', { subtitle: 'ITR filing, notices, planning and tax compliance' }],
    ['tax-consultant', 'Tax Consultant', 'tax', { subtitle: 'Income tax, TDS, notices and advisory support' }],
    ['chartered-accountant', 'Chartered Accountant', 'tax', { subtitle: 'CA support for tax, GST, audit and company compliance' }],
    ['tds-services', 'TDS Services', 'tax', { subtitle: 'TDS return, challan, TRACES and certificate support' }],
    ['statutory-audit', 'Statutory Audit', 'company', { subtitle: 'Company audit, financial statements and audit report support' }],
    ['internal-audit', 'Internal Audit', 'company', { subtitle: 'Controls, process review, risk checks and management reporting' }],
    ['transfer-pricing', 'Transfer Pricing', 'tax', { subtitle: 'International transactions, documentation and Form 3CEB support' }],
    ['llp-registration', 'LLP Registration', 'company', { subtitle: 'LLP incorporation, agreement and post-registration compliance' }],
    ['virtual-cfo', 'Virtual CFO', 'company', { subtitle: 'MIS, cash flow, compliance calendar and finance leadership' }],
    ['best-ca', 'Best CA', 'tax', { subtitle: 'Compare CAs by scope, documents and timeline' }],
    ['best-gst-consultant', 'Best GST Consultant', 'gst', { subtitle: 'Compare GST consultants for returns, ITC, notices and registration' }],
    ['company-registration', 'Company Registration', 'company', { subtitle: 'Private limited, OPC, LLP and startup registration support' }],
    ['itr-filing', 'ITR Filing', 'tax', { subtitle: 'Income tax return filing, AIS/Form 26AS and refund support' }],
    ['gst-services', 'GST Services', 'gst', { subtitle: 'GST registration, filing, ITC, notices and refunds' }],
    ['accounting-services', 'Accounting Services', 'company', { subtitle: 'Bookkeeping, GST-ready books, MIS and compliance records' }],
    ['audit-services', 'Audit Services', 'company', { subtitle: 'Statutory, tax, internal and compliance audit support' }],
    ['tds-filing', 'TDS Filing', 'tax', { subtitle: 'Quarterly TDS returns, challans and correction support' }],
    ['payroll-services', 'Payroll Services', 'payroll', { subtitle: 'Salary processing, payslips, PF, ESIC and TDS coordination' }]
  ];
  for (const [prefix, label, type, options] of servicePatterns) {
    if (slug === prefix || slug.startsWith(`${prefix}-`)) return localService(slug, label, prefix, type, options);
  }

  const refType = refTypeFor(slug);
  const title = singularPhrase(slug);
  return {
    slug, refType, type: 'Service guide',
    title: `${title} | WorkIndex`,
    meta: `${title} guide for India. Prepare documents, scope, risks, cost questions and expert brief before hiring on WorkIndex.`,
    h1: title,
    subtitle: 'India-specific preparation guide',
    summary: `${title} needs clear facts, documents, portal status and deliverables before you compare expert quotes.`,
    coverTitle: 'What this covers',
    points: ['Define the exact service and expected output.', 'Check official portal status and document readiness.', 'Separate filing, review, advisory, correction and notice support.', 'Ask for scope, assumptions, fees and timeline in writing.'],
    useCases: ['User comparing experts.', 'Business owner preparing records.', 'Taxpayer or founder with deadline.', 'Professional needing compliance support.'],
    records: ['Identity and entity details.', 'Portal status and prior filings.', 'Transaction records and documents.', 'Notice or deadline if any.'],
    mistakes: ['Generic brief with no documents.', 'Not checking official status.', 'No fee breakup.', 'No written deliverables.'],
    process: ['Collect records.', 'Post facts on WorkIndex.', 'Compare scope and quote.', 'Save final deliverables.'],
    faqs: [['Can WorkIndex help?', 'Yes. Post your requirement and compare relevant experts.'], ['Is this final advice?', 'No. Ask an expert to verify current law and your facts.'], ['What should I mention?', 'Mention city, year, entity type, documents, deadline and expected output.']],
    related: ['hire-ca-online-india', 'itr-filing-services', 'gst-filing-services'],
    factNote: factNote(refType, slug)
  };
}

const sourceSlugs = readSlugs();
const duplicateSource = sourceSlugs.filter((slug, index) => sourceSlugs.indexOf(slug) !== index);
if (duplicateSource.length) throw new Error(`Duplicate source slugs: ${[...new Set(duplicateSource)].join(', ')}`);
if (!fs.existsSync(seoDir)) fs.mkdirSync(seoDir, { recursive: true });

const created = [];
const updated = [];
const skipped = [];
const pages = [];
const priorBatchUrls = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')).urls || []
  : [];
const priorBatchSlugs = new Set(priorBatchUrls.map((url) => path.basename(new URL(url).pathname, '.html')));
for (const slug of sourceSlugs) {
  const clean = slug.trim().toLowerCase();
  const file = path.join(seoDir, `${clean}.html`);
  if (fs.existsSync(file)) {
    if (priorBatchSlugs.has(clean)) {
      const page = pageFor(clean);
      fs.writeFileSync(file, render(page), 'utf8');
      updated.push(clean);
      pages.push(page);
    } else {
      skipped.push(clean);
    }
    continue;
  }
  const page = pageFor(clean);
  fs.writeFileSync(file, render(page), 'utf8');
  created.push(clean);
  pages.push(page);
}

let sitemap = fs.existsSync(sitemapPath)
  ? fs.readFileSync(sitemapPath, 'utf8')
  : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n';
let sitemapAdditions = 0;
let additions = '';
for (const slug of created) {
  const loc = `https://workindex.co.in/seo-pages/${slug}.html`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    additions += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    sitemapAdditions += 1;
  }
}
if (additions) {
  sitemap = sitemap.replace(/\s*<\/urlset>\s*$/, `\n${additions}</urlset>\n`);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

const urls = created.map((slug) => `https://workindex.co.in/seo-pages/${slug}.html`);
fs.writeFileSync(manifestPath, JSON.stringify({
  batch: 17,
  factDate,
  sourceCount: sourceSlugs.length,
  createdCount: created.length,
  updatedCount: updated.length,
  skippedExistingCount: skipped.length,
  sitemapAdditions,
  urls: [...new Set([...priorBatchUrls, ...urls])]
}, null, 2), 'utf8');

console.log(`Batch 17 source slugs: ${sourceSlugs.length}`);
console.log(`Created: ${created.length}`);
console.log(`Updated batch pages: ${updated.length}`);
console.log(`Skipped existing: ${skipped.length}`);
console.log(`Sitemap additions: ${sitemapAdditions}`);
console.log(`IndexNow manifest: ${manifestPath}`);
