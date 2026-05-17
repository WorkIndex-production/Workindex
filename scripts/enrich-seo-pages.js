const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const site = 'https://workindex.co.in';
const today = '2026-05-13';

const slugs = [
  'hire-ca-online-india',
  'find-chartered-accountants-india',
  'hire-gst-consultant',
  'find-tax-consultant-online',
  'hire-accountant-india',
  'freelance-ca-platform',
  'finance-freelancers-india',
  'hire-compliance-expert',
  'hire-business-consultants',
  'verified-professionals-india',
  'professional-services-marketplace',
  'hire-freelancers-india',
  'startup-compliance-services',
  'gst-registration-help',
  'company-registration-consultants',
  'virtual-cfo-services-india',
  'best-sites-to-hire-cas',
  'upwork-alternative-india',
  'best-freelance-platform-india',
  'best-platform-for-gst-consultants',
  'itr-filing-services',
  'gst-filing-services',
  'business-registration',
  'trademark-registration',
  'accounting-bookkeeping-services',
  'company-compliance-services',
  'blog-how-to-hire-a-ca-online',
  'blog-how-to-choose-a-gst-consultant',
  'blog-freelancer-vs-agency-accountant',
  'blog-gst-filing-checklist',
  'blog-accounting-practices-for-startups',
  'blog-documents-needed-for-itr-filing',
  'blog-best-websites-to-hire-finance-freelancers',
  'blog-top-freelance-platforms-india',
  'faq-hiring-ca-online',
  'faq-gst-consultants',
  'faq-freelancers',
  'faq-business-registration',
  'verification-process',
  'expert-onboarding',
  'trust-safety',
  'how-ratings-work',
  'dispute-handling',
  'data-privacy',
  'professional-screening'
];

const topics = {
  ca: {
    who: ['salaried employees with Form 16 and deductions', 'business owners needing ITR, audit or GST-linked review', 'freelancers and consultants with professional income', 'investors with capital gains from shares, mutual funds, crypto or property', 'startups needing CA support for compliance and finance records'],
    docs: ['PAN and Aadhaar', 'Form 16, AIS/TIS and Form 26AS', 'bank statements and interest certificates', 'investment proofs for 80C/80D and home loan certificates', 'capital gains statements, P&L and balance sheet where applicable'],
    pricing: 'Basic salaried ITR work often starts around Rs. 1,000 to Rs. 2,500. Business, freelancer, capital gains or foreign income filings commonly range from Rs. 3,000 to Rs. 15,000. Audit-linked work can be higher depending on turnover and books quality.'
  },
  gst: {
    who: ['businesses registered under GST', 'ecommerce sellers and service providers', 'traders with monthly or quarterly returns', 'businesses facing notices, amendments or cancellation', 'startups needing registration and ongoing compliance'],
    docs: ['GSTIN and login access or authorization', 'sales invoices, purchase invoices and debit/credit notes', 'bank statements and payment details', 'GSTR-1, GSTR-3B and e-way bill data', 'ITC ledger, vendor reconciliation and notice copies if any'],
    pricing: 'GST registration usually ranges from Rs. 1,000 to Rs. 5,000. Nil or micro filings may be Rs. 500 to Rs. 1,500 per month, while higher turnover or reconciliation-heavy work can range from Rs. 3,000 to Rs. 15,000 per month.'
  },
  accounting: {
    who: ['freelancers and small businesses needing monthly books', 'startups needing investor-ready records', 'SMEs needing GST-linked reconciliation', 'businesses moving from Excel to Tally, Zoho or QuickBooks', 'owners needing MIS, P&L and balance sheet support'],
    docs: ['bank statements and cash book', 'sales and purchase invoices', 'expense bills and receipts', 'GST returns and ledgers if applicable', 'payroll, loan, asset and previous books data'],
    pricing: 'Micro bookkeeping can start around Rs. 1,000 to Rs. 2,500 per month. Small business bookkeeping commonly ranges from Rs. 2,500 to Rs. 5,000 per month, and higher transaction volumes can move to Rs. 10,000 to Rs. 25,000 per month.'
  },
  compliance: {
    who: ['private limited companies and LLPs', 'businesses needing ROC, GST, TDS or payroll compliance', 'founders who want annual compliance reminders', 'companies preparing for audit, funding or due diligence'],
    docs: ['company incorporation documents and PAN/TAN', 'board minutes, registers and shareholding records', 'financial statements and ledgers', 'GST, TDS and payroll records', 'previous ROC forms and audit reports'],
    pricing: 'Compliance pricing depends on entity type and scope. Basic filings can be a few thousand rupees, while annual company compliance, audit-linked work or catch-up filings can move materially higher.'
  },
  marketplace: {
    who: ['customers who want to compare verified professionals', 'business owners hiring for finance and compliance work', 'experts who want relevant leads with better context', 'people who prefer online discovery before sharing contact details'],
    docs: ['clear service requirement', 'budget and timeline', 'location or online preference', 'documents specific to the service', 'any notices, prior filings or special complexity'],
    pricing: 'Customers can post requirements for free. Experts spend credits when they decide a lead is relevant, helping reduce blind outreach and improving transparency.'
  },
  registration: {
    who: ['founders starting a private limited company, LLP, OPC or partnership', 'proprietors moving to a registered entity', 'businesses needing GST, PAN/TAN and bank-readiness', 'startups planning funding or formal contracts'],
    docs: ['PAN and Aadhaar of promoters', 'address proof and photo of promoters', 'registered office proof, rent agreement or NOC', 'DSC and DIN details where applicable', 'proposed business name and activity details'],
    pricing: 'Company or LLP registration pricing depends on entity type, state fees, professional scope, stamp duty and add-ons like GST, PAN/TAN, MSME, trademark or startup registration.'
  },
  startup: {
    who: ['new founders', 'private limited companies and LLPs', 'founders setting up GST, accounting, payroll and ROC compliance', 'startups preparing for funding or due diligence'],
    docs: ['incorporation certificate or proposed entity details', 'PAN/TAN, DSC and DIN details where applicable', 'founder KYC and address proof', 'bank account and accounting data', 'GST, payroll, contracts and funding documents if available'],
    pricing: 'Startup compliance support can range from one-time setup fees to monthly retainers. Company registration, GST, accounting, payroll, annual filings and virtual CFO work should be scoped separately.'
  },
  cfo: {
    who: ['startups needing investor reporting', 'SMEs needing cash flow planning', 'founders who need MIS and board packs', 'businesses preparing budgets, controls and forecasts'],
    docs: ['monthly P&L and balance sheet', 'bank statements and cash flow data', 'sales pipeline and receivables ageing', 'budget and expense data', 'investor, loan or board reporting requirements'],
    pricing: 'Virtual CFO pricing depends on monthly involvement, reporting depth, business size and whether the expert owns budgeting, MIS, controls, fundraising support or compliance coordination.'
  },
  trademark: {
    who: ['brands protecting names, logos or product lines', 'startups preparing for launch or funding', 'businesses selling online or across states', 'founders who want to reduce brand-copy risk'],
    docs: ['brand name or logo', 'applicant PAN and address proof', 'business registration proof if company/LLP', 'description of goods or services', 'date of first use evidence if already used'],
    pricing: 'Trademark pricing depends on applicant type, number of classes, professional search, filing, objections and hearings. Government fees and professional fees should be considered separately.'
  }
};

const specialSections = {
  'blog-documents-needed-for-itr-filing': [
    ['Basic Documents Required for Everyone', ['PAN card and PAN number', 'Aadhaar card, ideally linked with PAN', 'bank account number, IFSC and pre-validated refund account', 'bank statements or passbook for interest and transactions', 'Form 26AS for TDS, advance tax, self-assessment tax and high-value transactions', 'AIS and TIS for salary, interest, securities, mutual funds, property and foreign remittance information']],
    ['Documents for Salaried Employees', ['Form 16 from employer', 'salary slips for HRA, allowances and verification', 'rent receipts and landlord PAN where applicable', 'investment proofs such as ELSS, PPF, LIC, tuition fees and tax-saving FD', 'home loan interest certificate and principal repayment certificate']],
    ['Documents for Freelancers and Professionals', ['invoices raised to clients', 'payment receipts, UPI entries and bank credits', 'client statements or platform statements', 'expense proofs such as internet, laptop, software, travel and office rent', 'GST returns such as GSTR-1 and GSTR-3B if registered']],
    ['Documents for Business Owners', ['profit and loss statement', 'balance sheet', 'sales and purchase registers', 'GST records and reconciliation', 'audit report if applicable', 'MSME/Udyam and business registration documents']],
    ['Documents for Capital Gains, Rental and Foreign Income', ['broker capital gain statement for shares and mutual funds', 'purchase and sale documents for property', 'crypto exchange statements if applicable', 'rent agreement and municipal tax receipts', 'home loan interest certificate for let-out property', 'foreign bank statements, RSU/ESOP statements, foreign asset details and tax-paid-abroad proof']],
    ['Important Checks Before Filing', ['PAN is linked with Aadhaar', 'Form 16, AIS and Form 26AS are reconciled', 'bank interest and freelance income are not missed', 'old vs new tax regime is compared', 'correct ITR form is selected', 'deductions are supported by proofs']]
  ],
  'blog-gst-filing-checklist': [
    ['Monthly GST Filing Checklist', ['download GSTR-2B and compare ITC with purchase register', 'prepare sales invoice summary for GSTR-1', 'match taxable value, tax rate, CGST, SGST and IGST', 'check e-way bills and ecommerce data if applicable', 'prepare GSTR-3B liability and ITC summary', 'pay tax, interest or late fees before filing']],
    ['Records to Keep Ready', ['sales invoices and credit notes', 'purchase invoices and debit notes', 'bank statements', 'RCM expense details', 'export, LUT and SEZ documents where applicable', 'vendor GSTIN and reconciliation notes']],
    ['Common GST Filing Mistakes', ['claiming ITC not appearing in GSTR-2B', 'wrong place of supply', 'not reversing blocked credits', 'late filing nil returns', 'forgetting amendments in later returns', 'not reconciling books with GST portal data']]
  ],
  'blog-how-to-hire-a-ca-online': [
    ['Step-by-Step Hiring Checklist', ['define whether you need ITR, GST, audit, accounting or advisory', 'write the income type, turnover, urgency and city/online preference', 'ask the CA about similar cases handled', 'confirm pricing, deliverables and timeline before sharing full documents', 'check rating, profile completeness and response quality', 'keep communication and documents organized']],
    ['Questions to Ask Before Hiring', ['Which ITR form or compliance applies to my case?', 'What documents do you need before quoting final fees?', 'Will you check AIS, TIS and Form 26AS mismatch?', 'What is included and excluded in your fee?', 'How will notices or post-filing corrections be handled?']]
  ],
  'blog-how-to-choose-a-gst-consultant': [
    ['How to Evaluate a GST Consultant', ['experience with your business type', 'comfort with GSTR-1, GSTR-3B, annual return and reconciliation', 'ability to handle notices and amendments', 'clarity on monthly process and deadlines', 'pricing based on invoice volume and complexity']],
    ['Red Flags', ['quotes without asking invoice volume', 'no mention of ITC reconciliation', 'unclear responsibility for late fees', 'poor explanation of notices', 'no structured document request']]
  ],
  'blog-accounting-practices-for-startups': [
    ['Startup Accounting Practices', ['separate personal and business bank accounts', 'raise invoices consistently', 'capture expenses with bills', 'close books monthly', 'reconcile GST and TDS with books', 'track receivables and payables', 'prepare MIS before investor or bank discussions']],
    ['What Founders Should Review Monthly', ['cash runway', 'gross margin', 'burn rate', 'vendor dues', 'GST payable and ITC', 'payroll costs', 'tax and compliance calendar']]
  ],
  'blog-freelancer-vs-agency-accountant': [
    ['Choose a Freelancer When', ['transaction volume is low to medium', 'you need cost-effective monthly bookkeeping', 'the owner can review work directly', 'requirements are stable and well-defined']],
    ['Choose an Agency or CA Firm When', ['you need backup staff', 'GST, payroll, accounting and audit must be coordinated', 'transaction volume is high', 'you need review controls and escalation support']]
  ]
};

function topicFor(slug) {
  if (slug.includes('gst')) return topics.gst;
  if (slug.includes('account') || slug.includes('bookkeeping')) return topics.accounting;
  if (slug.includes('registration') || slug.includes('business-registration')) return topics.registration;
  if (slug.includes('startup')) return topics.startup;
  if (slug.includes('cfo')) return topics.cfo;
  if (slug.includes('trademark')) return topics.trademark;
  if (slug.includes('compliance') || slug.includes('dispute')) return topics.compliance;
  if (slug.includes('freelance') || slug.includes('professional') || slug.includes('trust') || slug.includes('verification') || slug.includes('privacy') || slug.includes('rating') || slug.includes('screening') || slug.includes('onboarding') || slug.includes('upwork')) return topics.marketplace;
  return topics.ca;
}

function esc(value) {
  return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function extract(file, pattern, fallback) {
  const match = file.match(pattern);
  return match ? match[1].trim() : fallback;
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function card(title, items) {
  return `<div class="lp-step"><h3>${esc(title)}</h3>${Array.isArray(items) ? list(items) : `<p>${esc(items)}</p>`}</div>`;
}

function schema(slug, title, desc, faq) {
  const url = `${site}/seo-pages/${slug}.html`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${site}/#organization`, name: 'WorkIndex', url: site, description: 'India-focused marketplace to hire verified finance, tax, compliance, accounting and professional service experts.' },
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description: desc, about: { '@id': `${site}/#organization` } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'WorkIndex', item: site }, { '@type': 'ListItem', position: 2, name: title, item: url }] },
      { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      { '@type': slug.startsWith('blog-') || slug.startsWith('best-') || slug.includes('alternative') ? 'Article' : 'Service', name: title, headline: title, description: desc, provider: { '@id': `${site}/#organization` }, dateModified: today }
    ]
  }, null, 2);
}

function render(slug) {
  const sourcePath = path.join(seoDir, `${slug}.html`);
  const oldHtml = fs.readFileSync(sourcePath, 'utf8');
  const title = extract(oldHtml, /<title>(.*?)\s*\|\s*WorkIndex<\/title>/i, slug.replace(/-/g, ' '));
  const desc = extract(oldHtml, /<meta name="description" content="([^"]*)"/i, `WorkIndex guide for ${title}.`);
  const t = topicFor(slug);
  const faq = [
    ['How does WorkIndex help?', 'WorkIndex turns a vague hiring need into a structured requirement so relevant experts can understand the scope before responding. Customers can compare responses, profiles, ratings and pricing context.'],
    ['What should I share when posting?', 'Share service type, urgency, budget, location or online preference, documents available, and any notices, past filings or special complexity.'],
    ['Can I compare experts before hiring?', 'Yes. WorkIndex helps customers compare expert responses, profile details, ratings and service fit before choosing whom to proceed with.']
  ];
  const comparisonRows = [
    ['Offline referral', 'Known relationship and local comfort', 'Limited comparison, slower discovery and less pricing transparency'],
    ['Generic freelance marketplace', 'Large pool of freelancers', 'May not be focused on Indian CA, GST, tax, accounting or compliance depth'],
    ['WorkIndex', 'Structured requirements, verified professional discovery and India-focused service categories', 'Best when customers want relevant expert responses before hiring']
  ];
  const related = ['hire-ca-online-india', 'hire-gst-consultant', 'itr-filing-services', 'gst-filing-services', 'accounting-bookkeeping-services', 'best-sites-to-hire-cas']
    .filter((item) => item !== slug)
    .map((item) => `<a class="lp-step" href="/seo-pages/${item}.html" style="text-decoration:none;color:inherit"><h3>${esc(item.replace(/-/g, ' '))}</h3><p>Continue researching this related WorkIndex topic.</p></a>`)
    .join('');
  const special = specialSections[slug] || [];
  const specialHtml = special.map(([heading, items]) => `
<section class="lp-section">
  <div class="lp-section-eyebrow">Practical checklist</div>
  <h2 class="lp-section-title">${esc(heading)}</h2>
  <div class="wi-note">${list(items)}</div>
</section>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)} | WorkIndex</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${site}/seo-pages/${slug}.html"/>
<meta property="og:title" content="${esc(title)} | WorkIndex"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${site}/seo-pages/${slug}.html"/>
<meta property="og:type" content="${slug.startsWith('blog-') || slug.startsWith('best-') ? 'article' : 'website'}"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="stylesheet" href="/lp-styles.css"/>
<style>
.wi-detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.wi-detail-grid ul{margin:10px 0 0;padding-left:20px;line-height:1.7}.wi-table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.wi-table th,.wi-table td{padding:14px;border-bottom:1px solid #eef2f7;text-align:left;vertical-align:top}.wi-table th{background:#f8fafc;color:#334155}.wi-note{padding:16px 18px;border:1px solid rgba(252,128,25,.25);background:rgba(252,128,25,.08);border-radius:12px;line-height:1.7}
</style>
<script type="application/ld+json">${schema(slug, title, desc, faq)}</script>
</head>
<body>
<nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="/?signup=true" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(title)}</span></div>
<section class="lp-hero">
  <div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>India-focused professional hiring</div>
  <h1>${esc(title)}<br><span>Find the right expert with better context</span></h1>
  <p>${esc(desc)} This guide explains what to prepare, how to compare professionals, expected pricing logic and how WorkIndex helps you move from confusion to a clear hiring decision.</p>
  <a href="/?signup=true" class="lp-hero-cta">Post Your Requirement - Free</a>
  <div class="lp-hero-trust"><div class="lp-trust-item">Verified expert discovery</div><div class="lp-trust-item">Structured requirements</div><div class="lp-trust-item">India-specific services</div><div class="lp-trust-item">Compare before hiring</div></div>
</section>
<section class="lp-section">
  <div class="lp-section-eyebrow">Who this helps</div>
  <h2 class="lp-section-title">When this page is relevant</h2>
  <p class="lp-section-sub">Customers usually need help when the work is more specific than a generic online search can solve. The right expert depends on income type, business model, filings, turnover, documents and urgency.</p>
  <div class="wi-detail-grid">${card('Common customer situations', t.who)}${card('Documents or details to keep ready', t.docs)}${card('Pricing expectations', t.pricing)}</div>
</section>
${specialHtml}
<section class="lp-section">
  <div class="lp-section-eyebrow">How to choose</div>
  <h2 class="lp-section-title">What to check before hiring</h2>
  <div class="wi-detail-grid">${card('Questions to ask the expert', ['Have you handled this exact service type before?', 'What documents do you need before confirming price?', 'What is included and excluded in the fee?', 'What timeline is realistic if all documents are ready?', 'How will corrections, notices or follow-up queries be handled?'])}${card('Good signs in a response', ['The expert mentions your actual service type and context', 'The price explanation is tied to complexity, not just a flat vague quote', 'They ask for the right documents', 'They explain timeline, assumptions and next steps clearly', 'Their profile, ratings and service categories match the requirement'])}${card('Red flags', ['Very low quote without understanding scope', 'No mention of AIS, GST reconciliation, books, notices or documents when relevant', 'Pressure to move outside the platform immediately', 'Unclear deliverables', 'Poor explanation of timelines or responsibility'])}</div>
</section>
<section class="lp-section">
  <div class="lp-section-eyebrow">Comparison</div>
  <h2 class="lp-section-title">How WorkIndex fits compared with other options</h2>
  <div style="overflow-x:auto"><table class="wi-table"><thead><tr><th>Option</th><th>Strength</th><th>Where it may fall short</th></tr></thead><tbody>${comparisonRows.map((row) => `<tr><td><strong>${esc(row[0])}</strong></td><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`).join('')}</tbody></table></div>
</section>
<section class="lp-section">
  <div class="lp-section-eyebrow">WorkIndex flow</div>
  <h2 class="lp-section-title">How customers use WorkIndex</h2>
  <div class="lp-steps"><div class="lp-step"><h3>1. Post a structured requirement</h3><p>Choose the service, answer service-specific questions, add budget, location, timeline and documents available.</p></div><div class="lp-step"><h3>2. Experts review the real scope</h3><p>Experts see the requirement context before deciding to respond or unlock contact details. This reduces blind matching.</p></div><div class="lp-step"><h3>3. Compare and proceed</h3><p>Review responses, expert profiles, ratings, chat and pricing before choosing the right professional.</p></div></div>
</section>
<section class="lp-section">
  <div class="lp-section-eyebrow">FAQ</div>
  <h2 class="lp-section-title">Common questions</h2>
  <div class="wi-detail-grid">${faq.map(([q, a]) => `<div class="lp-step"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('')}</div>
</section>
<section class="lp-section">
  <div class="lp-section-eyebrow">Related pages</div>
  <h2 class="lp-section-title">Continue researching</h2>
  <div class="lp-steps">${related}</div>
</section>
<section class="lp-cta-section"><h2>Ready to hire with more clarity?</h2><p>Post your requirement on WorkIndex and let relevant experts respond with context, price expectations and next steps.</p><a href="/?signup=true" class="lp-hero-cta">Post Your Requirement</a></section>
</body>
</html>
`;
}

let rewritten = 0;
for (const slug of slugs) {
  fs.writeFileSync(path.join(seoDir, `${slug}.html`), render(slug), 'utf8');
  rewritten += 1;
}

const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const slug of slugs) {
  const loc = `${site}/seo-pages/${slug}.html`;
  const pattern = new RegExp(`(<url><loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc><priority>[^<]+</priority><changefreq>monthly</changefreq><lastmod>)[^<]+(</lastmod></url>)`, 'g');
  sitemap = sitemap.replace(pattern, `$1${today}$2`);
}
fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log(`rewritten=${rewritten}`);
