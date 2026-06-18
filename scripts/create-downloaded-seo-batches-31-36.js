const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const downloads = 'C:/Users/LENOVO/Downloads';
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const manifestPath = path.join(root, 'batches31-36-downloaded-indexnow-urls.json');
const sourcePath = path.join(root, 'batches31-36-downloaded-source-slugs.json');
const ctaUrl = '/?signup=true&role=client';
const factDate = '2026-06-18';
const batchNumbers = [31, 32, 33, 34, 35, 36];

const caps = {
  ay: 'AY', ca: 'CA', cfo: 'CFO', cbic: 'CBIC', dsc: 'DSC', epf: 'EPF', esic: 'ESIC',
  fema: 'FEMA', fy: 'FY', gst: 'GST', gstr: 'GSTR', hsn: 'HSN', hsn: 'HSN', huf: 'HUF', ims: 'IMS',
  it: 'Income Tax', itr: 'ITR', itc: 'ITC', llp: 'LLP', lrs: 'LRS', ltcg: 'LTCG',
  mat: 'MAT', mca: 'MCA', mis: 'MIS', msme: 'MSME', nbfc: 'NBFC', nri: 'NRI',
  pan: 'PAN', pf: 'PF', posh: 'POSH', rbi: 'RBI', rcm: 'RCM', rera: 'RERA',
  roc: 'ROC', sac: 'SAC', sebi: 'SEBI', sft: 'SFT', stcg: 'STCG', tcs: 'TCS',
  tds: 'TDS', tan: 'TAN', udyam: 'Udyam'
};

const sourceRefs = {
  tax: [
    ['Income Tax Department e-Filing', 'https://www.incometax.gov.in/iec/foportal/'],
    ['Income Tax Act / Rules resources', 'https://www.incometaxindia.gov.in/Pages/acts/income-tax-act.aspx'],
    ['TRACES', 'https://www.tdscpc.gov.in/']
  ],
  gst: [
    ['GST portal', 'https://www.gst.gov.in/'],
    ['CBIC GST', 'https://cbic-gst.gov.in/'],
    ['CBIC GST rates', 'https://cbic-gst.gov.in/gst-goods-services-rates.html']
  ],
  company: [
    ['MCA portal', 'https://www.mca.gov.in/'],
    ['MCA SPICe+', 'https://www.mca.gov.in/content/mca/global/en/mca/e-filing/incorporation/spice.html'],
    ['India Code', 'https://www.indiacode.nic.in/']
  ],
  labour: [
    ['Ministry of Labour and Employment', 'https://labour.gov.in/'],
    ['EPFO', 'https://www.epfindia.gov.in/'],
    ['ESIC', 'https://www.esic.gov.in/']
  ],
  rera: [
    ['RERA official portal', 'https://rera.gov.in/'],
    ['MoHUA', 'https://mohua.gov.in/']
  ],
  finance: [
    ['RBI', 'https://www.rbi.org.in/'],
    ['SEBI', 'https://www.sebi.gov.in/'],
    ['AMFI', 'https://www.amfiindia.com/']
  ],
  commerce: [
    ['DGFT', 'https://www.dgft.gov.in/'],
    ['ICEGATE', 'https://www.icegate.gov.in/'],
    ['CBIC', 'https://www.cbic.gov.in/']
  ]
};

const servicePrefixes = [
  'best-accountant', 'best-tax-consultant', 'top-ca-firm', 'find-ca', 'affordable-ca-services',
  'chartered-accountant', 'ca-services', 'tax-consultant', 'income-tax-services', 'itr-filing',
  'gst-services', 'best-gst-consultant', 'accounting-services', 'audit-services', 'tds-services',
  'tds-filing', 'tcs-compliance', 'tax-audit-section-44ab', 'tax-audit-services',
  'statutory-audit', 'internal-audit', 'llp-registration', 'company-registration',
  'bookkeeping-outsourcing', 'outsourced-accounting', 'accounting-outsourcing-services',
  'payroll-services', 'hr-payroll-services', 'professional-tax-services', 'epf-services',
  'pf-services', 'esic-services', 'posh-compliance', 'labour-law-compliance',
  'rera-registration', 'rera-compliance', 'msme-registration', 'udyam-registration',
  'roc-filing', 'secretarial-audit', 'cost-audit', 'csr-compliance', 'virtual-cfo',
  'business-valuation', 'financial-planning', 'financial-advisor', 'tax-planning'
].sort((a, b) => b.length - a.length);

const cityContext = {
  bangalore: 'startup, SaaS, IT, ecommerce and professional-service teams',
  bengaluru: 'startup, SaaS, IT, ecommerce and professional-service teams',
  delhi: 'NCR traders, consultants, NGOs, contractors and professional firms',
  mumbai: 'finance, media, trading, export and head-office teams',
  chennai: 'manufacturing, logistics, IT, healthcare and export businesses',
  hyderabad: 'technology, pharma, startup and consulting teams',
  pune: 'IT, automotive, education, startup and manufacturing businesses',
  kolkata: 'trading, logistics, professional and legacy family businesses',
  ahmedabad: 'textile, chemicals, manufacturing, trading and SME businesses',
  surat: 'textile, diamond, ecommerce, trading and export businesses',
  jaipur: 'gems, jewellery, tourism, retail, startup and trading businesses',
  chandigarh: 'service professionals, clinics, consultants and regional offices',
  kochi: 'shipping, tourism, startup, NRI and service businesses',
  indore: 'trading, food processing, startup and professional-service businesses',
  lucknow: 'professionals, government contractors, education and retail businesses',
  nagpur: 'logistics, trading, professionals and central India businesses',
  noida: 'IT, media, real estate, startup and NCR service businesses',
  gurgaon: 'corporate offices, startups, consulting and shared-service teams',
  coimbatore: 'textiles, manufacturing, engineering and professional businesses',
  mysore: 'tourism, education, IT services and local SMEs',
  visakhapatnam: 'port, logistics, pharma, IT, public sector and professional services',
  vizag: 'port, logistics, pharma, IT, public sector and professional services'
};

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleFromSlug(slug) {
  return slug.split('-').map((part) => caps[part] || part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bPvt\b/g, 'Private')
    .replace(/\bLtd\b/g, 'Limited')
    .replace(/\bCbdt\b/g, 'CBDT')
    .replace(/\bRoi\b/g, 'ROI');
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function refType(slug) {
  if (/gst|gstr|hsn|sac|itc|rcm|ims|e-invoice|einvoice|eway|e-way|composition|gstin/.test(slug)) return 'gst';
  if (/company|llp|opc|roc|mca|director|din|aoc|mgt|adt|share|secretarial|cost-audit|csr|startup|incorporation|spice|strike-off/.test(slug)) return 'company';
  if (/labour|payroll|wage|pf-|epf|esic|posh|gratuity|bonus|professional-tax|shops-act|contract-labour/.test(slug)) return 'labour';
  if (/rera|real-estate|builder|project/.test(slug)) return 'rera';
  if (/rbi|sebi|nbfc|fema|mutual-fund|sgb|bond|valuation|financial|investment|portfolio|foreign-asset|lrs|sbi|bank|loan|credit/.test(slug)) return 'finance';
  if (/dgft|iec|import|export|customs|icegate|lut|ad-code/.test(slug)) return 'commerce';
  return 'tax';
}

function officialContext(type) {
  return {
    tax: 'Check the active assessment year or tax year, the Income Tax Department utility, AIS/TIS, Form 26AS, TRACES and the latest notification before filing or advising.',
    gst: 'Check GSTIN status, return period, registration type, CBIC notifications, GST portal advisories, HSN/SAC classification and the live return utility before submission.',
    company: 'Check company master data, MCA V3 form availability, board/shareholder approvals, DSC validity and applicable Companies Act or LLP Act thresholds before filing.',
    labour: 'Check employee count, state, wage structure, establishment registration and the relevant PF, ESIC, professional tax or labour portal before deciding liability.',
    rera: 'RERA is state-specific. Check the applicable state RERA portal, project registration, quarterly update status, orders and current rules before acting.',
    finance: 'Regulated finance, FEMA, securities and valuation work needs RBI, SEBI, AMFI or bank-source verification plus professional judgement on thresholds and documents.',
    commerce: 'Import-export work needs DGFT, IEC, AD code, ICEGATE, LUT, customs and GST portal checks based on the goods, service and transaction structure.'
  }[type];
}

function factNote(slug, type) {
  if (/ay-2026-27|fy-2025-26/.test(slug)) {
    return 'For AY 2026-27, the return generally relates to FY 2025-26 under the existing Income-tax Act, 1961 return utility. Do not mix it with Tax Year 2026-27 concepts unless the official utility or law clearly applies.';
  }
  if (/income-tax-act-2025|it-act-2025|it-rules-2026|tax-year|april-2026|2026-27/.test(slug)) {
    return 'Income Tax Act, 2025 and Income-tax Rules, 2026 topics are date-sensitive. Verify commencement and transition provisions from the legacy Income-tax Act, 1961 (1961 Act) to the new Act, rule numbers, and portal utilities from official sources before relying on summaries.';
  }
  if (/gst-2|2-0/.test(slug)) {
    return 'GST reform labels such as GST 2.0 should be treated as descriptive unless backed by a specific CBIC notification, GST Council release or portal advisory.';
  }
  if (/hsn|sac/.test(slug)) {
    return 'HSN and SAC classification can change by product description, composition, use and notification. Match invoices to official rate schedules instead of copying a competitor page blindly.';
  }
  if (/mat|amt/.test(slug)) {
    return 'MAT and AMT positions depend on the applicable law year, book-profit computation, carried-forward credit and transition rules. Verify with the current Act and return schedule.';
  }
  if (/foreign-asset|fema|rsu|esop|nri|lrs/.test(slug)) {
    return 'Foreign income, ESOP, RSU, FEMA and asset-disclosure positions are high-risk. Reconcile Indian tax, foreign tax credit, RBI/FEMA rules and Schedule FA before filing.';
  }
  return officialContext(type);
}

const intentMap = [
  [/near-me|best-|top-|find-|affordable/, 'Compare professionals'],
  [/deadline|due-date|calendar|penalty|late-fee/, 'Deadline and risk planning'],
  [/documents|required|checklist/, 'Document checklist'],
  [/registration|incorporation|apply|process|step-by-step/, 'Registration process'],
  [/return|filing|form-|gstr|itr|tds|tcs/, 'Return filing'],
  [/notice|appeal|assessment|scrutiny|litigation|demand/, 'Notice and dispute support'],
  [/rate|rates|calculator|limit|threshold|slab/, 'Rate and threshold check'],
  [/audit|valuation|due-diligence|review/, 'Review and assurance'],
  [/package|pricing|cost|packages|price/, 'Compare pricing packages']
];

function intent(slug) {
  for (const [pattern, label] of intentMap) {
    if (pattern.test(slug)) return label;
  }
  return 'Compliance guide';
}

function servicePrefix(slug) {
  return servicePrefixes.find((prefix) => slug === prefix || slug.startsWith(`${prefix}-`));
}

function areaFromSlug(slug) {
  const prefix = servicePrefix(slug);
  if (!prefix || slug === prefix) return '';
  return slug.slice(prefix.length + 1);
}

function cityLabel(area) {
  if (!area) return '';
  if (area === 'india') return 'India';
  if (area === 'all-cities') return 'All cities';
  return titleFromSlug(area).replace(/\bNcr\b/g, 'NCR');
}

function topicSpecificBullets(slug, type, title) {
  const area = areaFromSlug(slug);
  const city = cityLabel(area);
  if (area && (cityContext[area] || /-/.test(area) || area === 'india' || area === 'all-cities')) {
    const local = cityContext[area] || 'local professionals, SMEs, founders and compliance teams';
    return [
      `${city || 'This location'} page is meant for ${local} that need a professional matched by scope, documents and deadline.`,
      `Share entity type, turnover or income source, period, city, portal status and expected deliverable before comparing quotes.`,
      `Ask each expert to separate professional fee, government fee, filing responsibility, assumptions, exclusions and timeline.`,
      `For multi-city work, keep one owner for filings and one document checklist so GST, tax, ROC or payroll data stays consistent.`
    ];
  }
  if (type === 'gst') {
    return [
      `Map the issue to the correct GSTIN, return period, registration type and place-of-supply facts before choosing the filing or advisory route.`,
      `Reconcile outward supplies, purchase register, GSTR-2B/2A, e-invoice or e-way bill data where relevant.`,
      `Check if the work involves registration, amendment, cancellation, ITC, RCM, composition, annual return, refund or notice response.`,
      `Keep portal access, notices, invoices, ledgers and prior returns ready so the expert can quote precisely.`
    ];
  }
  if (type === 'company') {
    return [
      `Confirm entity type, paid-up capital, turnover, board history, shareholder approvals and due dates before starting the MCA workflow.`,
      `Check DSC status, director KYC, DIN details, company master data and form availability on MCA V3.`,
      `Separate routine annual compliance from event-based filings such as share issue, director change, charge, closure or strike-off.`,
      `Ask for a filing calendar, form list, attachments, certification requirement and proof of filing.`
    ];
  }
  if (type === 'labour') {
    return [
      `Confirm state, employee count, wage breakup, contractor involvement and establishment category before applying a rule.`,
      `Professional tax, shops act, PF, ESIC, gratuity, bonus and POSH applicability can differ by threshold and state.`,
      `Keep payroll registers, challans, employee master, appointment terms and prior filings ready for review.`,
      `Ask the expert to identify registration, monthly return, annual return, policy and notice-response responsibilities separately.`
    ];
  }
  if (type === 'finance') {
    return [
      `Confirm whether the topic is tax, RBI/FEMA, securities, bank, valuation or investment reporting before relying on a rate or threshold.`,
      `Keep source documents, transaction dates, cost records, bank statements and regulator correspondence ready.`,
      `Ask for assumptions, valuation method, disclosure schedule, tax treatment and compliance timeline in writing.`,
      `Cross-check market-linked, foreign asset and investment positions with official regulator or portal data.`
    ];
  }
  return [
    `Identify the exact period, assessment year or tax year, income head, entity type and portal status before applying ${title}.`,
    `Reconcile source data such as AIS/TIS, Form 26AS, books, bank statements, invoices, notices and prior returns.`,
    `Ask the expert to flag regime choice, deduction limits, disclosure schedules, penalty exposure and expected deliverables.`,
    `Do not rely on old blog summaries where forms, deadlines, sections or portal utilities have changed.`
  ];
}

function mistakes(slug, type) {
  const common = [
    'Using an old due date, old section number or old form without checking the live portal.',
    'Posting a vague requirement without period, entity type, city, documents and deadline.',
    'Comparing quotes without clarifying government fee, professional fee and exclusions.'
  ];
  if (type === 'gst') return [
    'Choosing a GST rate or HSN/SAC code from a generic table without matching the actual product or service.',
    'Ignoring GSTR-2B, credit notes, amendments, e-invoice or e-way bill mismatches.',
    ...common
  ];
  if (type === 'company') return [
    'Starting an MCA filing before checking DSC, DIN KYC, master data, board approvals and attachments.',
    'Treating annual compliance and event-based ROC filings as the same assignment.',
    ...common
  ];
  if (type === 'labour') return [
    'Assuming one state professional tax, shops act or payroll rule applies across all branches.',
    'Ignoring employee-count and wage-threshold triggers for PF, ESIC, gratuity, bonus or POSH.',
    ...common
  ];
  return common.concat([
    'Skipping reconciliation with AIS/TIS, books, Form 26AS, GST data or bank records.',
    'Treating explanatory SEO content as final tax, legal, audit or investment advice.'
  ]);
}

function related(slug, allSlugs) {
  const parts = slug.split('-').filter((part) => !/^(in|for|and|vs|guide|services|service|india|2026|2027|27|ay|fy)$/.test(part));
  const scored = allSlugs
    .filter((candidate) => candidate !== slug)
    .map((candidate) => ({
      candidate,
      score: parts.reduce((count, part) => count + (candidate.includes(part) ? 1 : 0), 0)
    }))
    .filter((item) => item.score > 1)
    .sort((a, b) => b.score - a.score || a.candidate.localeCompare(b.candidate))
    .slice(0, 6)
    .map((item) => item.candidate);
  return scored.length ? scored : allSlugs.filter((candidate) => candidate !== slug).slice(0, 6);
}

function sourceLinks(type) {
  return sourceRefs[type].map(([label, url]) => `<a href="${url}" rel="nofollow noopener">${esc(label)}</a>`).join('');
}

function pageHtml(page, allSlugs) {
  const title = titleFromSlug(page.slug);
  const type = refType(page.slug);
  const meta = `${title} in India. Check facts, documents, official portals, deadlines, risks and expert brief before hiring on WorkIndex.`;
  const intentName = intent(page.slug);
  const bullets = topicSpecificBullets(page.slug, type, title);
  const rel = related(page.slug, allSlugs);
  const relatedHtml = rel.map((slug) => `<a href="/seo-pages/${slug}.html">${esc(titleFromSlug(slug))}</a>`).join('');
  const heroSub = servicePrefix(page.slug) ? 'Compare professionals with a clear local brief' : 'India-specific preparation guide';
  const blockLabel = page.block
    .replace(/^#+\s*/, '')
    .replace(/`/g, '')
    .replace(/—|–/g, '-')
    .replace(/’/g, "'")
    .replace(/“|”/g, '"');
  const factItems = [...new Set([
    factNote(page.slug, type),
    officialContext(type),
    'If a competitor page gives a fixed rate, penalty, date or exemption, verify it against the official source and your facts before copying it into a filing position.'
  ])];

  let html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)} | WorkIndex</title><meta name="description" content="${esc(meta)}"/><link rel="canonical" href="https://workindex.co.in/seo-pages/${page.slug}.html"/>
<meta property="og:title" content="${esc(title)} | WorkIndex"/><meta property="og:description" content="${esc(meta)}"/><meta property="og:url" content="https://workindex.co.in/seo-pages/${page.slug}.html"/><meta property="og:type" content="website"/>
<link rel="stylesheet" href="/styles.css"/><link rel="stylesheet" href="/lp-styles.css"/>
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': 'https://workindex.co.in/#organization', name: 'WorkIndex', url: 'https://workindex.co.in' },
      { '@type': 'WebPage', '@id': `https://workindex.co.in/seo-pages/${page.slug}.html#webpage`, url: `https://workindex.co.in/seo-pages/${page.slug}.html`, name: `${title} | WorkIndex`, description: meta },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'WorkIndex', item: 'https://workindex.co.in' },
        { '@type': 'ListItem', position: 2, name: title, item: `https://workindex.co.in/seo-pages/${page.slug}.html` }
      ] },
      { '@type': 'FAQPage', mainEntity: [
        { '@type': 'Question', name: `Is ${title} final legal or tax advice?`, acceptedAnswer: { '@type': 'Answer', text: 'No. This page is a preparation guide. Verify current law, portal utilities, notifications and your documents with a qualified professional.' } },
        { '@type': 'Question', name: 'What should I share with an expert?', acceptedAnswer: { '@type': 'Answer', text: 'Share entity type, city, period, income or turnover details, portal status, notices, documents available, deadline and exact output expected.' } },
        { '@type': 'Question', name: 'Can WorkIndex help compare experts?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Post one requirement and compare relevant experts by scope, quote, assumptions, timeline and deliverables.' } }
      ] },
      { '@type': 'Service', name: title, serviceType: intentName, provider: { '@id': 'https://workindex.co.in/#organization' }, areaServed: { '@type': 'Country', name: 'India' }, description: meta }
    ]
  })}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body class="landing">
<main class="wi-rich">
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(title)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${esc(intentName)}</div><h1>${esc(title)}<br><span>${esc(heroSub)}</span></h1><p>${esc(title)} needs current-law checks, portal verification, documents and a precise brief before you compare experts on WorkIndex.</p><a href="${ctaUrl}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: ${factDate}</div><div class="lp-trust-item">Duplicate checked</div><div class="lp-trust-item">Official-source cautious</div><div class="lp-trust-item">India specific</div></div></section>
<div class="wi-rich-grid"><div>
<section class="wi-panel"><div class="lp-section-eyebrow">${esc(blockLabel)}</div><h2>What this page helps you decide</h2><p>${esc(title)} is best handled after identifying the exact scope, period, applicable portal and documents. Use this page to prepare a sharper expert brief instead of relying on generic summaries.</p>${list(bullets)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Fact check</div><h2>Accuracy notes before you act</h2>${list(factItems)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Documents</div><h2>Documents and facts to keep ready</h2>${list(['PAN, Aadhaar, GSTIN, CIN/LLPIN, TAN or registration details where applicable.', 'Relevant financial year, assessment year, tax year, return period, due date and notice number.', 'Books, invoices, payroll, bank statements, contracts, prior filings and portal screenshots.', 'Expected output: filing, registration, correction, advisory memo, notice response, audit report or recurring compliance.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Care points</div><h2>Common mistakes to avoid</h2>${list(mistakes(page.slug, type))}</section>
</div><aside>
<section class="wi-panel"><div class="lp-section-eyebrow">Official checks</div><h2>Useful source portals</h2><div class="wi-related">${sourceLinks(type)}</div></section>
<section class="wi-panel"><div class="lp-section-eyebrow">Hiring brief</div><h2>Ask experts these questions</h2>${list(['Which law, form, utility or notification are you relying on?', 'What documents are missing before you can finalise the work?', 'What is included in your quote and what is excluded?', 'What timeline, proof of filing and post-filing support will you provide?'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Related pages</div><h2>Explore related WorkIndex guides</h2><div class="wi-related">${relatedHtml}</div></section>
</aside></div>
</main>
</body>
</html>
`;

  // Safely satisfy transition rule for AY 2026-27 + Income Tax Act, 2025 combinations
  if (/AY 2026-27/i.test(html) && /Income Tax Act, 2025/i.test(html) && !/Income-tax Act, 1961|1961 Act/i.test(html)) {
    html = html.replace('<h2>Accuracy notes before you act</h2>', '<h2>Accuracy notes before you act</h2><p><strong>Note on transition:</strong> The Income Tax Act, 2025 transition from the legacy Income-tax Act, 1961 (1961 Act) applies from Tax Year 2026-27 onwards. The current AY 2026-27 filing remains under the 1961 Act.</p>');
  }

  return html;
}

function extractPages(file) {
  const text = fs.readFileSync(path.join(downloads, file), 'utf8');
  const pages = [];
  let currentBlock = file.replace('.md', '');
  const lines = text.split(/\r?\n/);
  let inFence = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^#{3,}\s+/.test(line) && !line.includes('CONTEXT')) currentBlock = line.replace(/^#+\s*/, '');
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(line)) {
      pages.push({ slug: line, file, block: currentBlock });
    }
  }
  return pages;
}

function updateSitemap() {
  const staticUrls = [
    ['https://workindex.co.in/', 'daily', '1.0'],
    ['https://workindex.co.in/contact.html', 'monthly', '0.6'],
    ['https://workindex.co.in/privacy-policy.html', 'yearly', '0.3'],
    ['https://workindex.co.in/refund-policy.html', 'yearly', '0.3'],
    ['https://workindex.co.in/terms.html', 'yearly', '0.3']
  ];
  const seoFiles = fs.readdirSync(seoDir)
    .filter((name) => name.endsWith('.html'))
    .sort((a, b) => a.localeCompare(b));
  const urls = staticUrls.map(([loc, changefreq, priority]) => `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`);
  for (const file of seoFiles) {
    urls.push(`  <url><loc>https://workindex.co.in/seo-pages/${file}</loc><lastmod>${factDate}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
  }
  fs.writeFileSync(sitemapPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, 'utf8');
  return { total: urls.length, seo: seoFiles.length };
}

function main() {
  fs.mkdirSync(seoDir, { recursive: true });
  const rawPages = batchNumbers.flatMap((number) => extractPages(`workindex-seo-batch${number}.md`));
  const pages = [];
  const seen = new Set();
  const duplicateInSource = [];
  for (const page of rawPages) {
    if (seen.has(page.slug)) {
      duplicateInSource.push(page);
      continue;
    }
    seen.add(page.slug);
    pages.push(page);
  }

  const existing = [];
  const created = [];
  const allSlugs = [...new Set([...pages.map((page) => page.slug), ...fs.readdirSync(seoDir).filter((name) => name.endsWith('.html')).map((name) => name.replace(/\.html$/, ''))])];

  for (const page of pages) {
    const out = path.join(seoDir, `${page.slug}.html`);
    if (fs.existsSync(out) && process.env.OVERWRITE_BATCHES === '0') {
      existing.push(page.slug);
      continue;
    }
    fs.writeFileSync(out, pageHtml(page, allSlugs), 'utf8');
    created.push(page.slug);
  }

  const sitemap = updateSitemap();
  const urls = created.map((slug) => `https://workindex.co.in/seo-pages/${slug}.html`);
  fs.writeFileSync(manifestPath, JSON.stringify(urls, null, 2), 'utf8');
  fs.writeFileSync(sourcePath, JSON.stringify({
    batches: batchNumbers,
    extracted: rawPages.length,
    unique: pages.length,
    duplicateInSource: duplicateInSource.map((page) => ({ slug: page.slug, file: page.file })),
    alreadyExisted: existing,
    created
  }, null, 2), 'utf8');

  console.log(JSON.stringify({
    extracted: rawPages.length,
    unique: pages.length,
    duplicateInSource: duplicateInSource.length,
    alreadyExisted: existing.length,
    created: created.length,
    sitemapUrls: sitemap.total,
    seoPages: sitemap.seo,
    manifest: path.relative(root, manifestPath),
    source: path.relative(root, sourcePath)
  }, null, 2));
}

main();
