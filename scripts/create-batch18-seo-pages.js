const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const sourcePath = path.join(root, 'batch18-new-slugs.json');
const manifestPath = path.join(root, 'batch18-indexnow-urls.json');
const today = new Date().toISOString().slice(0, 10);
const factDate = '2026-06-05';
const ctaUrl = '/?signup=true&role=client';

const caps = {
  ca: 'CA', cfo: 'CFO', csr: 'CSR', dsc: 'DSC', epf: 'EPF', esic: 'ESIC',
  fema: 'FEMA', gst: 'GST', gstr: 'GSTR', huf: 'HUF', itr: 'ITR', llp: 'LLP',
  ltcg: 'LTCG', mca: 'MCA', msme: 'MSME', nbfc: 'NBFC', nri: 'NRI', pan: 'PAN',
  pf: 'PF', posh: 'POSH', rbi: 'RBI', rcm: 'RCM', rera: 'RERA', roc: 'ROC',
  sebi: 'SEBI', stcg: 'STCG', tcs: 'TCS', tds: 'TDS', udyam: 'Udyam'
};

const refs = {
  tax: [
    ['Income Tax e-Filing portal', 'https://www.incometax.gov.in/iec/foportal/'],
    ['Income-tax Act 2025 FAQs', 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act-faq'],
    ['TRACES portal', 'https://www.tdscpc.gov.in/']
  ],
  gst: [
    ['GST portal', 'https://www.gst.gov.in/'],
    ['GST tutorials', 'https://tutorial.gst.gov.in/'],
    ['CBIC GST', 'https://cbic-gst.gov.in/']
  ],
  company: [
    ['MCA portal', 'https://www.mca.gov.in/'],
    ['SPICe+ information', 'https://www.mca.gov.in/content/mca/global/en/mca/e-filing/incorporation/spice.html'],
    ['India Code', 'https://www.indiacode.nic.in/']
  ],
  labour: [
    ['Ministry of Labour and Employment', 'https://labour.gov.in/'],
    ['EPFO', 'https://www.epfindia.gov.in/'],
    ['ESIC', 'https://www.esic.gov.in/']
  ],
  rera: [
    ['RERA official portal', 'https://rera.gov.in/'],
    ['Ministry of Housing and Urban Affairs', 'https://mohua.gov.in/']
  ],
  finance: [
    ['SEBI', 'https://www.sebi.gov.in/'],
    ['RBI', 'https://www.rbi.org.in/'],
    ['AMFI', 'https://www.amfiindia.com/']
  ]
};

const knownPlaces = new Set([
  'koramangala','hsr-layout','btm-layout','indiranagar','whitefield','marathahalli','electronic-city','jayanagar','jp-nagar','rr-nagar','hebbal','yelahanka','bellandur','sarjapur-road','rajajinagar','malleshwaram','mahadevapura','vijayanagar','banashankari','basavanagudi','kengeri','kr-puram','uttarahalli','gandhi-bazar','brookefield','yeshwanthpur',
  'andheri','bandra','borivali','malad','goregaon','kandivali','powai','vikhroli','ghatkopar','kurla','chembur','dadar','worli','lower-parel','fort-mumbai','navi-mumbai','thane-west','kharghar','vashi','nerul','mira-road','vasai-virar','kalyan','dombivli',
  'south-delhi','east-delhi','west-delhi','north-delhi','central-delhi','dwarka','rohini','pitampura','lajpat-nagar','karol-bagh','connaught-place','saket','janakpuri','mayur-vihar','preet-vihar','laxmi-nagar','gurgaon',
  'hitech-city','gachibowli','kondapur','madhapur','banjara-hills','jubilee-hills','secunderabad','ameerpet','kukatpally','lb-nagar','dilsukhnagar','uppal',
  'anna-nagar','adyar','velachery','t-nagar','kodambakkam','nungambakkam','porur','sholinganallur','omr-road','ambattur','tambaram','chromepet',
  'kothrud','hinjewadi','wakad','baner','aundh','hadapsar','koregaon-park','shivajinagar','viman-nagar','pimpri-chinchwad','kharadi','magarpatta',
  'salt-lake','new-town','rajarhat','park-street','ballygunge','behala','howrah-station-area','dumdum','jadavpur','ultadanga',
  'sg-highway','prahlad-nagar','satellite-ahmedabad','navrangpura','vastrapur','bodakdev','thaltej','chandkheda','bopal','naranpura'
]);

const cityContext = {
  bangalore: 'startup, IT, SaaS and professional-services businesses',
  mumbai: 'finance, media, trading, export and head-office teams',
  delhi: 'professionals, traders, NGOs, contractors and NCR businesses',
  hyderabad: 'technology, pharma, consulting and startup teams',
  chennai: 'manufacturing, logistics, IT and export businesses',
  pune: 'IT, automotive, startup and manufacturing businesses',
  kolkata: 'trading, logistics, professional and legacy businesses',
  ahmedabad: 'textile, chemical, manufacturing and trading businesses'
};

function esc(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => caps[part] || part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bPvt\b/g, 'Private');
}

function sentenceCaseTitle(slug) {
  const text = titleFromSlug(slug);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function relatedLinks(slugs) {
  return slugs.map((slug) => `<a href="/seo-pages/${slug}.html">${esc(titleFromSlug(slug))}</a>`).join('');
}

function refType(slug) {
  if (/gst|gstr|input-tax-credit|itc|rcm/.test(slug)) return 'gst';
  if (/labour|posh|pf-|epf|esic|gratuity|bonus|minimum-wage|shops-act|contract-labour|professional-tax|payroll/.test(slug)) return 'labour';
  if (/rera|real-estate/.test(slug)) return 'rera';
  if (/sebi|rbi|nbfc|fema|valuation|financial|investment|portfolio|business-valuation/.test(slug)) return 'finance';
  if (/company|llp|opc|roc|mca|secretarial|cost-audit|csr|ccfs|udyam|msme|registration|audit|accounting|bookkeeping/.test(slug)) return 'company';
  return 'tax';
}

function factNote(slug, type) {
  if (/ccfs-2026/.test(slug)) {
    return 'CCFS-2026 is treated as an unverified, forward-looking MCA-scheme topic from the supplied brief. Do not rely on amnesty dates, forms or fee relief unless MCA has published the scheme and the live portal confirms eligibility.';
  }
  if (/budget-2026|fy-2026-27|ay-2026-27|income-tax-act-2025|new-income-tax|fast-ds|stt-hike/.test(slug)) {
    return 'Forward-looking tax and Budget 2026 topics must be verified against official Income Tax Department utilities, notifications and Finance Act text before filing or advising. AY 2026-27 and Tax Year 2026-27 should not be mixed.';
  }
  const notes = {
    tax: 'Income-tax, TDS, TCS, advance tax, deduction, appeal and notice positions should be verified against the active assessment year, portal utility, AIS/Form 26AS, TRACES and current notifications before filing.',
    gst: 'GST return, registration, ITC, RCM, GSTR form, notice and litigation positions should be checked against the live GST portal, CBIC notifications and current return utilities before submission.',
    company: 'MCA, ROC, company, LLP, audit, CSR, secretarial and cost-audit compliance should be verified against current MCA V3 forms, company master data, board records and applicable thresholds.',
    labour: 'Labour law, POSH, PF, ESIC, professional tax and payroll compliance depend on employee count, wage structure, state-specific rules, registrations and current government portals.',
    rera: 'RERA compliance is state-specific. Registration, quarterly updates, project documents, complaints and penalties should be checked on the applicable state RERA portal and current rules.',
    finance: 'SEBI, RBI, NBFC, FEMA, valuation and investment-related pages require regulator-specific verification, registration checks, thresholds and professional judgement before acting.'
  };
  return notes[type] || notes.tax;
}

function servicePrefix(slug) {
  const prefixes = [
    'chartered-accountant','income-tax-services','tax-consultant','ca-services','tds-services','statutory-audit','internal-audit','transfer-pricing','llp-registration','virtual-cfo',
    'tax-planning','annual-compliance','nri-services','startup-services','professional-tax-services','epf-services','pf-services','esic-services','business-valuation','tax-advisory','financial-planning',
    'financial-advisor','legal-services','hr-payroll-services','roc-filing','trademark-registration','best-gst-consultant','best-ca','company-registration','itr-filing','gst-services','accounting-services','audit-services','tds-filing','payroll-services',
    'labour-law-compliance','posh-compliance','msme-registration','udyam-registration','rera-registration','rera-compliance','secretarial-audit','cost-audit','csr-compliance','sebi-compliance','rbi-compliance','nbfc-compliance'
  ];
  return prefixes.find((prefix) => slug === prefix || slug.startsWith(`${prefix}-`));
}

function areaFromSlug(slug, prefix) {
  if (!prefix || slug === prefix) return '';
  return slug.slice(prefix.length + 1);
}

function sourceLinks(type) {
  return (refs[type] || refs.tax).map(([label, href]) => `<a href="${href}" rel="nofollow">${esc(label)}</a>`).join('');
}

function makePage(slug) {
  const type = refType(slug);
  const prefix = servicePrefix(slug);
  const area = areaFromSlug(slug, prefix);
  const isLocation = area && (knownPlaces.has(area) || !/^(for|cost|fees|guide|help|calculator|checker|faq|blog|documents|required|how-to)/.test(area));
  const serviceName = prefix ? titleFromSlug(prefix) : titleFromSlug(slug);
  const areaName = area ? titleFromSlug(area) : '';

  let pageType = 'Service guide';
  let h1 = sentenceCaseTitle(slug);
  let title = `${h1} | WorkIndex`;
  let subtitle = 'India-specific preparation guide';
  let summary = `${h1} needs clear facts, documents, portal status, deadlines and deliverables before you compare expert quotes on WorkIndex.`;
  let points = [
    'Define the exact scope: filing, registration, advisory, correction, notice reply, audit, review or recurring compliance.',
    'Check official portal status before relying on old forms, old due dates or generic internet summaries.',
    'Share documents, year or period, entity type, city and deadline so the expert quote is specific.',
    'Ask for assumptions, exclusions, government-fee breakup, timeline and final deliverables in writing.'
  ];

  if (isLocation) {
    const context = cityContext[area] || 'local businesses, professionals, startups and SMEs';
    h1 = `${serviceName} in ${areaName}`;
    title = `${h1} | WorkIndex`;
    subtitle = 'Local expert comparison by scope, documents and timeline';
    pageType = 'Local service page';
    summary = `${areaName} ${serviceName.toLowerCase()} work commonly involves ${context}. The right expert should ask for entity type, records, prior filings, notices and deadlines before quoting.`;
    points = [
      `${serviceName} in ${areaName} should be scoped around entity type, industry, year or period, and current compliance status.`,
      `For ${areaName}, mention locality-specific context, remote/on-site preference and deadline so the quote is not generic.`,
      'Ask whether filing, review, correction, notice support and government fees are included.',
      'Keep acknowledgements, challans, workings and advice notes after completion.'
    ];
  } else if (slug.includes('-for-')) {
    const [left, right] = slug.split('-for-');
    h1 = `${titleFromSlug(left)} for ${titleFromSlug(right)}`;
    title = `${h1} | WorkIndex`;
    subtitle = 'Profession or industry-specific records and compliance scope';
    pageType = 'Profession-specific page';
    summary = `${h1} should reflect the actual income model, billing pattern, expenses, registrations, notices and records for that profession or industry.`;
    points = [
      'A profession-specific page should not use a generic checklist; income, GST, TDS, accounting and expense records vary by work type.',
      'Mention whether the work is salary, professional fees, business income, retainer, commission, export, platform or mixed income.',
      'Reconcile AIS/Form 26AS, GST data, bank statements, invoices and contracts before filing.',
      'Ask if the expert has handled similar clients and can explain form selection and record gaps.'
    ];
  } else if (slug.startsWith('blog-')) {
    h1 = sentenceCaseTitle(slug.replace(/^blog-/, ''));
    title = `${h1} | WorkIndex`;
    subtitle = 'Practical guide for Indian taxpayers and businesses';
    pageType = 'Blog guide';
    summary = `${h1} is an informational guide to help you understand the issue, prepare records and decide when expert help is worth it.`;
  } else if (slug.startsWith('faq-')) {
    h1 = `${sentenceCaseTitle(slug.replace(/^faq-/, ''))} FAQ`;
    title = `${h1} | WorkIndex`;
    subtitle = 'Short answers before hiring an expert';
    pageType = 'FAQ page';
  } else if (slug.startsWith('documents-required-for-')) {
    h1 = `Documents Required for ${sentenceCaseTitle(slug.replace(/^documents-required-for-/, ''))}`;
    title = `${h1} | WorkIndex`;
    subtitle = 'Checklist before filing, registration or review';
    pageType = 'Documents checklist';
  } else if (slug.startsWith('how-to-')) {
    h1 = `How to ${sentenceCaseTitle(slug.replace(/^how-to-/, ''))}`;
    title = `${h1} | WorkIndex`;
    subtitle = 'Preparation steps before using the portal or hiring an expert';
    pageType = 'How-to guide';
  } else if (/(cost|fees)-india$/.test(slug)) {
    h1 = `${sentenceCaseTitle(slug.replace(/-(cost|fees)-india$/, ''))} Cost in India`;
    title = `${h1} | WorkIndex`;
    subtitle = 'Fee factors, scope and quote comparison';
    pageType = 'Cost guide';
  } else if (/(calculator|checker)$/.test(slug)) {
    h1 = sentenceCaseTitle(slug);
    title = `${h1} | WorkIndex`;
    subtitle = 'Inputs, assumptions and expert review points';
    pageType = slug.endsWith('checker') ? 'Checker guide' : 'Calculator guide';
  } else if (/-help$/.test(slug) || /notice|appeal|litigation|demand|penalty/.test(slug)) {
    pageType = 'Problem-solving page';
    subtitle = 'Notice, correction, appeal or compliance support';
  }

  const meta = `${h1} in India. Prepare documents, official portal status, scope, risks, cost questions and expert brief before hiring on WorkIndex.`;
  return {
    slug, refType: type, type: pageType, title, meta, h1, subtitle, summary,
    factNote: factNote(slug, type),
    coverTitle: pageType === 'Cost guide' ? 'What affects pricing' : pageType === 'Documents checklist' ? 'Document checklist' : 'What this covers',
    points,
    useCases: ['User comparing experts on WorkIndex.', 'Business owner preparing compliance records.', 'Taxpayer, founder or finance team with a deadline.', 'Case involving notices, filings, registration, audit or advisory.'],
    records: ['Identity, PAN/GSTIN/TAN/MCA or registration details.', 'Official portal status, prior filings, challans and acknowledgements.', 'Invoices, contracts, bank statements, books, payroll or transaction records.', 'Notice, order, demand, deadline or expected deliverable if any.'],
    mistakes: ['Using future-dated or unofficial claims without checking official sources.', 'Comparing quotes without sharing complete facts.', 'Ignoring portal mismatch, old defaults or pending notices.', 'Not separating professional fees, government fees and taxes.'],
    process: ['Mention city, entity type, year or period, deadline and current portal status.', 'List documents available and gaps you already know.', 'Ask for scope, assumptions, exclusions, fee breakup and timeline.', 'Save final filings, challans, acknowledgements, workings and advice notes.'],
    faqs: [
      ['Can WorkIndex help with this?', 'Yes. Post your requirement once and compare relevant experts by scope, quote, documents and timeline.'],
      ['Is this page final legal or tax advice?', 'No. It is a preparation guide. Your expert should verify current law, portal forms, notifications and your documents.'],
      ['What should I mention while posting?', 'Mention the year or period, city, entity type, deadline, portal status, documents available and exact output needed.']
    ],
    related: related(slug, type)
  };
}

function related(slug, type) {
  if (type === 'gst') return ['gst-filing-services', 'gst-registration-help', 'gst-notice-reply-help', 'best-gst-consultant-bangalore'];
  if (type === 'company') return ['company-registration-bangalore', 'roc-filing-bangalore', 'annual-filing-cost-comparison-india', 'audit-services-bangalore'];
  if (type === 'labour') return ['payroll-compliance-services', 'hr-payroll-services-india', 'pf-esic-compliance-monthly', 'payroll-services-bangalore'];
  if (type === 'finance') return ['financial-advisor-services-india', 'portfolio-management-services', 'business-valuation-services', 'virtual-cfo-bangalore'];
  if (type === 'rera') return ['legal-services-india', 'accounting-for-real-estate', 'audit-services-bangalore', 'gst-for-construction-contracts'];
  return ['hire-ca-online-india', 'itr-filing-services', 'tds-filing-services', 'ca-services-bangalore'];
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
      { '@type': 'Service', name: page.h1, serviceType: page.type, provider: { '@id': 'https://workindex.co.in/#organization' }, areaServed: { '@type': 'Country', name: 'India' }, description: page.meta }
    ]
  });
}

function render(page) {
  const canonical = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(page.title)}</title><meta name="description" content="${esc(page.meta)}"/><link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${esc(page.title)}"/><meta property="og:description" content="${esc(page.meta)}"/><meta property="og:url" content="${canonical}"/><meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/><link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-rich{padding:56px 24px;max-width:1160px;margin:0 auto}.wi-rich-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;align-items:start}.wi-panel{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}.wi-panel+.wi-panel{margin-top:20px}.wi-panel h2{font-size:24px;margin:0 0 14px}.wi-panel h3{font-size:17px;margin:18px 0 8px}.wi-panel p{color:var(--text-muted);font-size:15px;margin:0 0 12px;line-height:1.75}.wi-detail-list{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}.wi-detail-list li{margin-bottom:7px}.wi-side{position:sticky;top:82px}.wi-ref a,.wi-related a{display:block;color:var(--primary);font-weight:800;text-decoration:none;margin:8px 0}@media(max-width:860px){.wi-rich-grid{grid-template-columns:1fr}.wi-side{position:static}}</style>
<script type="application/ld+json">${schema(page)}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body><nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="${ctaUrl}" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(page.h1)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${esc(page.type)}</div><h1>${esc(page.h1)}<br><span>${esc(page.subtitle)}</span></h1><p>${page.summary}</p><a href="${ctaUrl}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: ${factDate}</div><div class="lp-trust-item">Duplicate checked</div><div class="lp-trust-item">Official-source cautious</div><div class="lp-trust-item">India specific</div></div></section>
<main class="wi-rich"><div class="wi-rich-grid"><div>
<section class="wi-panel"><div class="lp-section-eyebrow">Official fact-check status</div><h2>Fact-check notes</h2><p><strong>Last fact-checked:</strong> ${factDate}</p><p>${page.factNote}</p><p>This page is preparation guidance. Ask the expert to verify active law, portal forms, notifications and your documents before filing, signing or paying.</p></section>
<section class="wi-panel"><div class="lp-section-eyebrow">${esc(page.type)}</div><h2>${esc(page.coverTitle)}</h2><p>${page.summary}</p>${list(page.points)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Use cases</div><h2>Who this is for</h2>${list(page.useCases)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Records</div><h2>Documents and details to prepare</h2>${list(page.records)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Care points</div><h2>Common mistakes to avoid</h2>${list(page.mistakes)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Action</div><h2>How to brief the expert</h2>${list(page.process)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Questions people ask</div><h2>FAQs</h2>${page.faqs.map(([q, a]) => `<h3>${esc(q)}</h3><p>${a}</p>`).join('')}</section>
</div><aside class="wi-side"><div class="wi-panel"><h2>Find the right expert</h2><p>Post the exact facts, documents available, deadline and expected output. WorkIndex helps compare relevant specialists by scope, price and timeline.</p><a href="${ctaUrl}" class="lp-hero-cta" style="padding:12px 18px;font-size:14px">Get Expert Quotes</a></div><div class="wi-panel wi-related"><h2>Related pages</h2>${relatedLinks(page.related)}</div><div class="wi-panel wi-ref"><h2>Sources used</h2>${sourceLinks(page.refType)}</div></aside></div></main>
<section class="lp-cta-section"><h2>Need this reviewed by a specialist?</h2><p>Share your requirement once and compare relevant WorkIndex experts before hiring.</p><a href="${ctaUrl}" class="lp-hero-cta">Post Requirement as Customer</a></section>
<footer class="lp-footer"><a href="/seo-pages/itr-filing-all-cities.html">ITR cities</a><a href="/seo-pages/gst-services-all-cities.html">GST cities</a><a href="/seo-pages/accounting-services-all-cities.html">Accounting cities</a><a href="/seo-pages/audit-services-all-cities.html">Audit cities</a><a href="/contact.html">Contact</a></footer></body></html>`;
}

const sourceSlugs = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const created = [];
const skipped = [];
if (!fs.existsSync(seoDir)) fs.mkdirSync(seoDir, { recursive: true });

for (const slug of sourceSlugs) {
  const clean = String(slug).trim().toLowerCase();
  const file = path.join(seoDir, `${clean}.html`);
  if (fs.existsSync(file)) {
    skipped.push(clean);
    continue;
  }
  fs.writeFileSync(file, render(makePage(clean)), 'utf8');
  created.push(clean);
}

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
let additions = '';
let sitemapAdditions = 0;
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
  batch: 18,
  factDate,
  sourceCount: sourceSlugs.length,
  createdCount: created.length,
  skippedExistingCount: skipped.length,
  sitemapAdditions,
  urls
}, null, 2), 'utf8');

console.log(`Batch 18 source slugs: ${sourceSlugs.length}`);
console.log(`Created: ${created.length}`);
console.log(`Skipped existing: ${skipped.length}`);
console.log(`Sitemap additions: ${sitemapAdditions}`);
console.log(`IndexNow manifest: ${manifestPath}`);
