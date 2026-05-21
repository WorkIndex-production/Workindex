const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);
const ctaUrl = '/?signup=true&role=client';

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function cards(items) {
  return `<div class="lp-steps">${items.map(item => `<div class="lp-step"><h3>${esc(item.title)}</h3><p>${item.body}</p></div>`).join('')}</div>`;
}

function links(items) {
  return items.map(item => `<a href="${item.href}">${esc(item.label)}</a>`).join('');
}

function requestChecklist(page) {
  if (page.slug.includes('website') || page.slug.includes('web-developer') || page.slug.includes('ecommerce')) {
    return [
      'Your business type, target customers and the main goal of the website.',
      'Approximate page count, must-have sections and example websites you like.',
      'Whether you need WordPress, Shopify, custom development or help choosing the stack.',
      'Required features such as forms, payments, WhatsApp, booking, catalogue, login or admin panel.',
      'Launch deadline, budget range and whether content/images are ready.'
    ];
  }
  if (page.slug.includes('gst')) {
    return [
      'GSTIN status, business type and the period/months involved.',
      'Whether the need is registration, return filing, notice reply, cancellation or reconciliation.',
      'Approximate invoice count and whether ecommerce/e-way bill/e-invoice data is involved.',
      'Any due date, notice reference number or cancellation order date.',
      'Whether books, invoices and GST login access are ready.'
    ];
  }
  if (page.slug.includes('audit') || page.slug.includes('roc') || page.slug.includes('private-limited')) {
    return [
      'Entity type, financial year, turnover and compliance deadline.',
      'Whether books are final, partly ready or need cleanup before filing/audit.',
      'Which forms/reports are needed: audit report, ROC forms, ITR, financial statements or board records.',
      'Number of pending years, if any.',
      'Whether DSC, MCA login, previous filings and financial statements are available.'
    ];
  }
  if (page.slug.includes('accounting')) {
    return [
      'Business type, monthly invoice count and accounting software currently used.',
      'Whether you need bookkeeping only or GST, payroll, TDS, MIS and bank reconciliation too.',
      'How many bank accounts, payment gateways and credit cards need reconciliation.',
      'Whether old months need cleanup before monthly accounting starts.',
      'Preferred reporting frequency and response-time expectations.'
    ];
  }
  return [
    'Assessment year, income type and exact problem you are trying to solve.',
    'Whether the return is not filed, already filed, defective, revised or under notice.',
    'Any due date, notice date, demand amount or refund issue.',
    'Whether Form 16, AIS/TIS, Form 26AS, bank statements and capital gain reports are ready.',
    'If urgent, mention the deadline and what response has already been submitted.'
  ];
}

function hireChecklist(page) {
  if (page.slug.includes('website') || page.slug.includes('web-developer') || page.slug.includes('ecommerce')) {
    return [
      'Ask for live portfolio links, not only screenshots.',
      'Confirm source-code/admin access ownership after final payment.',
      'Check whether mobile responsiveness, SEO metadata, analytics and sitemap are included.',
      'Use milestone-based payments tied to design, development, testing and launch.',
      'Clarify post-launch bug fixes, content edits and maintenance charges.'
    ];
  }
  if (page.slug.includes('gst')) {
    return [
      'Choose someone who asks for return data before quoting complex work.',
      'Check experience with GSTR-1, GSTR-3B, 2B reconciliation and portal replies.',
      'Ask whether late fee, interest and tax payment calculations are included.',
      'For notices, confirm that the expert will prepare a point-wise reply with attachments.',
      'For monthly retainers, clarify filing calendar and document collection process.'
    ];
  }
  if (page.slug.includes('audit') || page.slug.includes('roc') || page.slug.includes('private-limited')) {
    return [
      'Confirm professional qualification and whether certification/signature is included.',
      'Ask for a document checklist before work starts.',
      'Clarify whether accounting cleanup is included or billed separately.',
      'Check who coordinates CA, CS, DSC, MCA and tax filing steps.',
      'Insist on deadline tracking and proof of filing/challans.'
    ];
  }
  if (page.slug.includes('accounting')) {
    return [
      'Ask for monthly deliverables: books, bank reconciliation, GST summary and reports.',
      'Confirm software access, data backup and who owns the accounting file.',
      'Check whether GST/TDS/payroll are included in the retainer.',
      'Set a monthly closing date and escalation process for missing documents.',
      'Review sample MIS or financial reports before finalising.'
    ];
  }
  return [
    'Choose a professional who asks for AIS, Form 26AS and supporting documents before giving final advice.',
    'For notices, check experience with portal replies and section-wise responses.',
    'Ask for clear fee breakup for review, computation, filing and notice support.',
    'Avoid anyone promising a refund without checking records.',
    'Keep all workings and acknowledgements after the engagement.'
  ];
}

function faqJson(page) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a.replace(/<[^>]+>/g, '') }
    }))
  }, null, 2);
}

function serviceJson(page) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    provider: { '@type': 'Organization', name: 'WorkIndex', url: 'https://workindex.co.in' },
    areaServed: { '@type': 'Country', name: 'India' },
    serviceType: page.service,
    description: page.metaDescription
  }, null, 2);
}

function render(page) {
  const canonical = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="google-adsense-account" content="ca-pub-2627739469695660">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.metaDescription)}"/>
<meta name="keywords" content="${esc(page.keywords.join(', '))}"/>
<link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${esc(page.title)}"/>
<meta property="og:description" content="${esc(page.metaDescription)}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="stylesheet" href="/lp-styles.css"/>
<style>
.wi-rich{padding:64px 24px;max-width:1120px;margin:0 auto}
.wi-rich-grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:28px;align-items:start}
.wi-panel{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}
.wi-panel + .wi-panel{margin-top:20px}
.wi-panel h2{font-size:24px;margin:0 0 14px}
.wi-panel h3{font-size:17px;margin:18px 0 8px}
.wi-panel p{color:var(--text-muted);font-size:15px;margin:0 0 12px}
.wi-detail-list{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}
.wi-detail-list li{margin-bottom:7px}
.wi-side{position:sticky;top:82px}
.wi-price-table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}
.wi-price-table th,.wi-price-table td{border:1px solid var(--border);padding:11px;text-align:left;vertical-align:top}
.wi-price-table th{background:var(--bg-gray);font-weight:800}
.wi-ref a,.wi-related a{display:block;color:var(--primary);font-weight:700;text-decoration:none;margin:8px 0}
.wi-ref a:hover,.wi-related a:hover{text-decoration:underline}
.wi-callout{border-left:4px solid var(--primary);background:var(--primary-light);padding:16px;border-radius:12px;color:var(--text)}
@media(max-width:860px){.wi-rich-grid{grid-template-columns:1fr}.wi-side{position:static}.lp-hero{padding:58px 20px 72px}}
</style>
<script type="application/ld+json">${serviceJson(page)}</script>
<script type="application/ld+json">${faqJson(page)}</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script>
</head>
<body>
<nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="${ctaUrl}" class="lp-nav-cta">Post for Free</a></nav>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${esc(page.eyebrow)}</div><h1>${esc(page.h1)}<br><span>${esc(page.h1Span)}</span></h1><p>${esc(page.hero)}</p><a href="${ctaUrl}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Verified professional discovery</div><div class="lp-trust-item">Compare quotes and timelines</div><div class="lp-trust-item">India-specific guidance</div><div class="lp-trust-item">No cold-call marketplace</div></div></section>
<div class="lp-stats"><div class="lp-stat"><div class="lp-stat-value">${esc(page.stats[0])}</div><div class="lp-stat-label">Common Need</div></div><div class="lp-stat"><div class="lp-stat-value">${esc(page.stats[1])}</div><div class="lp-stat-label">Typical Timeline</div></div><div class="lp-stat"><div class="lp-stat-value">${esc(page.stats[2])}</div><div class="lp-stat-label">WorkIndex Fit</div></div></div>
<main class="wi-rich"><div class="wi-rich-grid"><div>
<section class="wi-panel"><div class="lp-section-eyebrow">Quick Answer</div><h2>${esc(page.quickTitle)}</h2><p>${page.quick}</p><div class="wi-callout">${page.callout}</div></section>
<section class="wi-panel"><div class="lp-section-eyebrow">When You Need This</div><h2>Situations this page is built for</h2>${list(page.when)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Keep Ready</div><h2>Documents and details usually required</h2>${list(page.documents)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">How It Works</div><h2>Practical process before hiring</h2>${cards(page.process)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Costs and Timeline</div><h2>What to expect in India</h2><table class="wi-price-table"><thead><tr><th>Work type</th><th>Typical price range</th><th>Timeline</th></tr></thead><tbody>${page.pricing.map(row => `<tr><td>${esc(row.type)}</td><td>${esc(row.price)}</td><td>${esc(row.timeline)}</td></tr>`).join('')}</tbody></table><p style="margin-top:12px">Prices vary by documents, urgency, city, professional experience and whether previous periods need cleanup.</p></section>
<section class="wi-panel"><div class="lp-section-eyebrow">Avoid Mistakes</div><h2>Common red flags and mistakes</h2>${list(page.mistakes)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">WorkIndex Request Checklist</div><h2>What to mention when you post</h2>${list(requestChecklist(page))}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Hiring Criteria</div><h2>How to choose the right professional</h2>${list(hireChecklist(page))}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">FAQs</div><h2>Questions people ask before hiring</h2>${page.faqs.map(faq => `<h3>${esc(faq.q)}</h3><p>${faq.a}</p>`).join('')}</section>
</div><aside class="wi-side">
<div class="wi-panel"><h2>Post once, compare experts</h2><p>${esc(page.sidePitch)}</p><a href="${ctaUrl}" class="lp-hero-cta" style="padding:12px 18px;font-size:14px">Get Expert Quotes</a></div>
<div class="wi-panel wi-related"><h2>Related WorkIndex pages</h2>${links(page.related)}</div>
<div class="wi-panel wi-ref"><h2>Helpful references</h2>${links(page.references)}</div>
</aside></div></main>
<section class="lp-cta-section"><h2>${esc(page.ctaTitle)}</h2><p>${esc(page.ctaText)}</p><a href="${ctaUrl}" class="lp-hero-cta">Post Requirement as Customer</a></section>
<footer class="lp-footer"><a href="/seo-pages/itr-filing-all-cities.html">ITR cities</a><a href="/seo-pages/gst-services-all-cities.html">GST cities</a><a href="/seo-pages/accounting-services-all-cities.html">Accounting cities</a><a href="/seo-pages/audit-services-all-cities.html">Audit cities</a><a href="/contact.html">Contact</a></footer>
</body>
</html>`;
}

const taxRefs = [
  { label: 'Income Tax e-Filing portal', href: 'https://www.incometax.gov.in/iec/foportal/' },
  { label: 'ITR forms and utilities', href: 'https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns' },
  { label: 'Annual Information Statement overview', href: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/ais' }
];
const gstRefs = [
  { label: 'GST portal', href: 'https://www.gst.gov.in/' },
  { label: 'GST cancellation user guide', href: 'https://tutorial.gst.gov.in/userguide/registration/Cancellation_of_Registration_manual.htm' },
  { label: 'GST returns user guide', href: 'https://tutorial.gst.gov.in/userguide/returns/index.htm' }
];
const auditRefs = [
  { label: 'ICAI standards on internal audit', href: 'https://internalaudit.icai.org/standards-on-internal-audit/' },
  { label: 'Income Tax e-Filing portal', href: 'https://www.incometax.gov.in/iec/foportal/' },
  { label: 'MCA portal', href: 'https://www.mca.gov.in/' }
];
const webRefs = [
  { label: 'Google Search Central SEO starter guide', href: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
  { label: 'web.dev performance guidance', href: 'https://web.dev/learn/performance' },
  { label: 'PageSpeed Insights', href: 'https://pagespeed.web.dev/' }
];

const commonItt = [
  { href: '/seo-pages/itr-filing-services.html', label: 'ITR filing services' },
  { href: '/seo-pages/itr-notice-help.html', label: 'ITR notice help' },
  { href: '/seo-pages/documents-required-for-itr-filing-freelancers.html', label: 'ITR documents for freelancers' },
  { href: '/seo-pages/itr-filing-cost-india.html', label: 'ITR filing cost India' }
];
const commonGst = [
  { href: '/seo-pages/gst-filing-services.html', label: 'GST filing services' },
  { href: '/seo-pages/gst-registration-cost.html', label: 'GST registration cost' },
  { href: '/seo-pages/documents-required-for-gst-registration.html', label: 'GST registration documents' },
  { href: '/seo-pages/gst-late-fee-calculator.html', label: 'GST late fee calculator' }
];
const commonAccounting = [
  { href: '/seo-pages/accounting-bookkeeping-services.html', label: 'Accounting and bookkeeping services' },
  { href: '/seo-pages/accounting-for-ecommerce.html', label: 'Accounting for ecommerce' },
  { href: '/seo-pages/company-compliance-services.html', label: 'Company compliance services' },
  { href: '/seo-pages/virtual-cfo-services-india.html', label: 'Virtual CFO services' }
];
const commonWeb = [
  { href: '/seo-pages/web-developer-india.html', label: 'Hire web developers in India' },
  { href: '/seo-pages/web-developer-bangalore.html', label: 'Web developer in Bengaluru' },
  { href: '/seo-pages/how-to-hire-a-ca.html', label: 'How WorkIndex hiring works' },
  { href: '/seo-pages/professional-services-marketplace.html', label: 'Professional services marketplace' }
];

const pages = [
  {
    slug: 'ais-mismatch-help',
    title: 'AIS Mismatch Help in India | Compare Tax Experts on WorkIndex',
    metaDescription: 'Get help with AIS mismatch, missing income, duplicate entries, TDS differences, capital gains data and ITR correction before filing income tax return.',
    keywords: ['AIS mismatch help', 'Annual Information Statement mismatch', 'ITR AIS correction', 'tax expert India'],
    service: 'Income tax return and AIS review',
    eyebrow: 'Income Tax Help',
    h1: 'AIS Mismatch Help',
    h1Span: 'Before You File ITR',
    hero: 'AIS mismatches can happen when salary, interest, securities, property, GST, TDS or high-value transaction data does not match your records. Compare tax experts before you respond or file.',
    stats: ['AIS review', '1-3 days', 'Tax experts'],
    quickTitle: 'Do not ignore AIS differences',
    quick: 'The Annual Information Statement is used to show information reported by banks, employers, brokers, registrars and other reporting entities. A mismatch does not always mean extra tax, but it should be reviewed before filing or revising the return.',
    callout: 'Best practice: compare AIS, TIS, Form 26AS, Form 16, bank statements and broker capital gain reports before finalising taxable income.',
    when: ['AIS shows income that you do not recognise or shows it twice.', 'TDS in AIS is different from Form 16 or Form 26AS.', 'Interest from savings, fixed deposits or bonds is missing from your working.', 'Stock or mutual fund sale value is visible but capital gain statement differs.', 'Foreign remittance, rent, property or high-value transaction data needs explanation.'],
    documents: ['PAN and Aadhaar details.', 'Downloaded AIS and TIS PDFs/JSON from income tax portal.', 'Form 26AS and Form 16, if salaried.', 'Bank statements for the financial year.', 'Capital gain statement from broker or mutual fund platform.', 'Interest certificates, rent details, property papers or other proof for disputed entries.'],
    process: [{ title: 'Match reported data', body: 'Map every AIS line item to a real source such as employer, bank, broker, tenant or sale transaction.' }, { title: 'Identify true mismatch', body: 'Separate timing differences and duplicate records from actual missed income or wrong reporting.' }, { title: 'Decide correction path', body: 'Depending on facts, you may file with correct income, give AIS feedback, revise ITR or keep a clear explanation ready.' }, { title: 'Document the position', body: 'Keep statements, emails, certificates and workings in one file in case a notice or query comes later.' }],
    pricing: [{ type: 'Basic AIS review', price: 'Rs. 1,000 - Rs. 3,000', timeline: 'Same day to 2 days' }, { type: 'AIS plus ITR computation', price: 'Rs. 2,500 - Rs. 7,500', timeline: '1-3 days' }, { type: 'Capital gains / foreign income review', price: 'Rs. 5,000 - Rs. 20,000+', timeline: '2-7 days' }],
    mistakes: ['Filing only from Form 16 and ignoring AIS/TIS.', 'Accepting every AIS entry without checking duplicates or incorrect reporting.', 'Ignoring bank interest income because no TDS was deducted.', 'Not preserving capital gain calculation reports.', 'Waiting until notice stage when the mismatch was visible before filing.'],
    faqs: [{ q: 'Should AIS always match my ITR exactly?', a: 'Not always. AIS can have reporting errors, timing differences or duplicate entries. Your ITR should report correct taxable income backed by documents.' }, { q: 'Can an expert fix AIS data?', a: 'An expert can review facts, guide AIS feedback and prepare the correct tax position. The original reporting entity may need to correct wrong source data.' }, { q: 'Is AIS mismatch serious?', a: 'It can become serious if income is missed or unexplained. Small differences can often be explained with proper working.' }, { q: 'Can I revise ITR after finding AIS mismatch?', a: 'If eligible within the prescribed timelines, a revised return may be possible. A tax expert can check the right route.' }],
    sidePitch: 'Share your AIS issue once and compare professionals who understand ITR, TDS, capital gains and notice handling.',
    related: commonItt,
    references: taxRefs,
    ctaTitle: 'Need help reconciling AIS?',
    ctaText: 'Post your mismatch details and compare tax experts before filing or revising your return.'
  },
  {
    slug: 'form-26as-mismatch-help',
    title: 'Form 26AS Mismatch Help | TDS and Tax Credit Support in India',
    metaDescription: 'Find tax experts to resolve Form 26AS mismatch, missing TDS, advance tax, self-assessment tax and Form 16 differences before ITR filing.',
    keywords: ['Form 26AS mismatch', 'TDS mismatch help', 'missing TDS credit', 'Form 16 mismatch'],
    service: 'Form 26AS and TDS reconciliation',
    eyebrow: 'TDS Credit Help',
    h1: 'Form 26AS Mismatch Help',
    h1Span: 'TDS Credit Review',
    hero: 'If Form 26AS does not show the correct TDS, advance tax or self-assessment tax, your refund or tax payable can be affected. Get the mismatch reviewed before filing.',
    stats: ['TDS credit', '1-4 days', 'ITR support'],
    quickTitle: 'Form 26AS is the tax credit trail',
    quick: 'Form 26AS is commonly used to verify tax deducted, tax collected, advance tax and self-assessment tax. Mismatches usually need source-level checking with the employer, bank, deductor, challan or filing data.',
    callout: 'A missing TDS entry is not solved by simply claiming it in ITR. The deductor may need to correct the TDS return or challan details.',
    when: ['Form 16 shows TDS but Form 26AS does not.', 'Bank TDS on interest is missing or underreported.', 'Advance tax or self-assessment tax challan is not visible.', 'Wrong PAN was used by deductor or challan was filled incorrectly.', 'Refund is lower because tax credit is not matching.'],
    documents: ['Form 26AS downloaded from income tax portal.', 'Form 16 or Form 16A.', 'Salary slips and employer TDS details.', 'Challan receipts for advance tax/self-assessment tax.', 'Bank interest certificates and TDS certificates.', 'Communication with employer, bank or deductor.'],
    process: [{ title: 'Compare source records', body: 'Match Form 16, Form 16A, challans and Form 26AS line by line.' }, { title: 'Trace the deductor', body: 'Identify whether the issue is employer filing, bank TDS, challan CIN, PAN error or timing.' }, { title: 'Plan correction', body: 'Ask the deductor to revise TDS return or correct challan details where required.' }, { title: 'File with evidence', body: 'Prepare the ITR and keep proof ready if the credit is still under correction.' }],
    pricing: [{ type: 'Simple TDS mismatch review', price: 'Rs. 1,000 - Rs. 2,500', timeline: 'Same day to 2 days' }, { type: 'Multiple deductor reconciliation', price: 'Rs. 2,500 - Rs. 8,000', timeline: '2-5 days' }, { type: 'Notice/refund follow-up support', price: 'Rs. 5,000 - Rs. 15,000+', timeline: 'Depends on department/deductor' }],
    mistakes: ['Claiming TDS without checking whether it appears against your PAN.', 'Not verifying challan BSR code, challan serial number and payment date.', 'Assuming employer Form 16 is always final.', 'Ignoring Form 16A for non-salary income.', 'Waiting until refund failure to investigate.'],
    faqs: [{ q: 'Why is my TDS not showing in Form 26AS?', a: 'Common reasons include deductor filing delay, wrong PAN, challan mismatch or TDS return errors.' }, { q: 'Can I claim TDS if it is not in Form 26AS?', a: 'It is risky without support. The better route is to get the deductor correction started and file based on proper evidence.' }, { q: 'Who should fix wrong TDS data?', a: 'Usually the deductor such as employer, bank or client must correct TDS return details.' }, { q: 'Does AIS replace Form 26AS?', a: 'AIS gives broader information, but Form 26AS remains important for tax credit verification.' }],
    sidePitch: 'Post your mismatch and compare experts who can review Form 26AS, Form 16, AIS and challan proof together.',
    related: commonItt,
    references: taxRefs,
    ctaTitle: 'TDS credit not matching?',
    ctaText: 'Get expert help before you file, revise or chase a refund.'
  },
  {
    slug: 'income-tax-notice-response',
    title: 'Income Tax Notice Response Help in India | WorkIndex',
    metaDescription: 'Compare tax experts for income tax notice replies, 143(1), defective return, AIS mismatch, scrutiny support, refund adjustment and demand response.',
    keywords: ['income tax notice response', 'tax notice reply', '143(1) notice', 'defective return notice'],
    service: 'Income tax notice response',
    eyebrow: 'Tax Notice Support',
    h1: 'Income Tax Notice Response',
    h1Span: 'Expert Reply Help',
    hero: 'Income tax notices need a careful reply with facts, documents and portal compliance. Compare experts before responding to a demand, mismatch, defect or scrutiny query.',
    stats: ['Notice reply', '2-7 days', 'Tax experts'],
    quickTitle: 'Read the section and deadline first',
    quick: 'Notices can be intimation, demand, defect, mismatch, scrutiny or information requests. The right response depends on notice section, assessment year, due date, portal action required and supporting evidence.',
    callout: 'Do not upload random documents or ignore a small demand. A weak response can create follow-up proceedings, interest or refund adjustment.',
    when: ['You received intimation with demand or reduced refund.', 'Return is marked defective and needs correction.', 'AIS/Form 26AS mismatch is questioned.', 'Notice asks for source of income, investment or transaction.', 'You need help drafting and uploading a response on the portal.'],
    documents: ['Full notice PDF with DIN and assessment year.', 'Filed ITR acknowledgement and computation.', 'AIS, TIS and Form 26AS.', 'Bank statements and investment proofs.', 'Salary, business, capital gain or rent documents.', 'Previous correspondence and payment challans.'],
    process: [{ title: 'Classify the notice', body: 'Identify whether it is intimation, defect, demand, mismatch, scrutiny or penalty-related communication.' }, { title: 'Build factual reply', body: 'Prepare a point-wise response with documents rather than a generic explanation.' }, { title: 'Check tax impact', body: 'Compute whether demand is valid, partly valid or incorrect due to credit/data mismatch.' }, { title: 'Submit and track', body: 'Upload response on the correct portal section and monitor acknowledgement or next action.' }],
    pricing: [{ type: 'Simple intimation/demand review', price: 'Rs. 1,500 - Rs. 5,000', timeline: '1-3 days' }, { type: 'Defective return / mismatch response', price: 'Rs. 3,000 - Rs. 10,000', timeline: '2-5 days' }, { type: 'Scrutiny or detailed notice support', price: 'Rs. 10,000 - Rs. 50,000+', timeline: 'Case-specific' }],
    mistakes: ['Responding without checking assessment year and notice section.', 'Paying demand without verifying TDS and challan credits.', 'Missing the response deadline.', 'Uploading incomplete bank statements or unrelated files.', 'Treating scrutiny notice like a simple email query.'],
    faqs: [{ q: 'Can I reply to an income tax notice myself?', a: 'For simple intimations, yes. For mismatch, defect, demand or scrutiny, expert review reduces risk.' }, { q: 'What if the notice demand is wrong?', a: 'You can disagree with reasons and documents if the portal route allows it. The tax position should be backed by computation and evidence.' }, { q: 'How fast should I act?', a: 'Act immediately. Notices usually specify a response date and late action can create avoidable complications.' }, { q: 'Will WorkIndex reply directly?', a: 'WorkIndex helps you compare experts. The selected professional can guide or handle the reply based on your documents.' }],
    sidePitch: 'Upload the notice context in your request and compare professionals experienced in ITR, TDS and tax portal responses.',
    related: commonItt,
    references: taxRefs,
    ctaTitle: 'Received a tax notice?',
    ctaText: 'Post the notice type and deadline. Compare experts before you respond.'
  },
  {
    slug: 'gst-notice-reply-help',
    title: 'GST Notice Reply Help | Compare GST Experts in India',
    metaDescription: 'Find GST consultants for notice reply, mismatch response, ITC issues, GSTR-1 vs 3B differences, late filing, cancellation and demand notices.',
    keywords: ['GST notice reply help', 'GST consultant notice', 'GST demand notice', 'ITC mismatch help'],
    service: 'GST notice reply',
    eyebrow: 'GST Notice Support',
    h1: 'GST Notice Reply Help',
    h1Span: 'For Businesses in India',
    hero: 'GST notices often involve return mismatch, ITC reconciliation, late filing, cancellation risk, registration details or tax demand. Compare GST experts before submitting a reply.',
    stats: ['GST notice', '2-7 days', 'GST experts'],
    quickTitle: 'GST replies need return data and proof',
    quick: 'A useful GST notice response normally compares GSTR-1, GSTR-3B, 2A/2B, e-way bills, invoices, payments, ledgers and portal notices. The right reply depends on the notice reason and due date.',
    callout: 'Do not reply only with a short explanation. GST notices usually need transaction-level reconciliation and attachments.',
    when: ['GSTR-1 and GSTR-3B turnover mismatch.', 'ITC mismatch with GSTR-2B or supplier data.', 'Late filing or tax demand notice.', 'Registration cancellation or suspension notice.', 'E-way bill, invoice or place-of-supply issue.'],
    documents: ['GST notice/order PDF and reference number.', 'GST login access or downloaded returns.', 'GSTR-1, GSTR-3B, 2A/2B and electronic ledgers.', 'Sales and purchase invoices.', 'E-way bill and e-invoice data where applicable.', 'Books of accounts and bank statements.'],
    process: [{ title: 'Read notice grounds', body: 'Identify section, period, due date, amount and portal action expected.' }, { title: 'Reconcile returns', body: 'Compare outward supply, ITC, tax paid and ledger data period-wise.' }, { title: 'Prepare attachments', body: 'Create concise workings and attach invoices, ledgers or explanations where required.' }, { title: 'File reply and monitor', body: 'Submit through the GST portal and track personal hearing or further clarification.' }],
    pricing: [{ type: 'Simple GST notice review', price: 'Rs. 2,000 - Rs. 6,000', timeline: '1-3 days' }, { type: 'Return/ITC reconciliation notice', price: 'Rs. 5,000 - Rs. 20,000', timeline: '3-7 days' }, { type: 'Demand/cancellation/hearing support', price: 'Rs. 10,000 - Rs. 50,000+', timeline: 'Case-specific' }],
    mistakes: ['Replying without reconciling GSTR-1 and GSTR-3B.', 'Ignoring supplier ITC mismatches.', 'Missing the portal deadline.', 'Uploading raw invoices without summary workings.', 'Not checking interest, late fee and tax paid ledgers.'],
    faqs: [{ q: 'Can a GST notice be resolved online?', a: 'Many replies can be filed online on the GST portal, but the exact route depends on notice type.' }, { q: 'What is the first thing to check?', a: 'Check notice period, due date, tax amount, mismatch reason and whether personal hearing is offered.' }, { q: 'Do I need a CA for GST notice?', a: 'Not always, but an experienced GST consultant helps when mismatch, ITC, demand or cancellation risk is involved.' }, { q: 'Can WorkIndex help urgently?', a: 'You can post the notice deadline and compare GST experts who can respond quickly.' }],
    sidePitch: 'Post notice details once and compare GST consultants who understand return reconciliation and portal replies.',
    related: commonGst,
    references: gstRefs,
    ctaTitle: 'Need a GST notice reply?',
    ctaText: 'Compare GST experts before the response deadline.'
  },
  {
    slug: 'gst-cancellation-revocation-help',
    title: 'GST Cancellation Revocation Help | Restore GST Registration',
    metaDescription: 'Compare GST consultants for cancellation revocation, suspended GST registration, non-filing cancellation, pending returns and GST restoration support.',
    keywords: ['GST cancellation revocation', 'restore GST registration', 'GST registration cancelled help'],
    service: 'GST registration cancellation revocation',
    eyebrow: 'GST Registration Help',
    h1: 'GST Cancellation Revocation Help',
    h1Span: 'Restore Registration Correctly',
    hero: 'If GST registration is cancelled or suspended, business billing, ITC flow and compliance can be affected. Get pending returns, dues and revocation steps reviewed.',
    stats: ['Revocation', '3-15 days', 'GST experts'],
    quickTitle: 'Revocation usually starts with compliance cleanup',
    quick: 'GST cancellation often arises from non-filing, non-response, business closure, wrong details or officer action. Revocation generally needs pending returns, dues, reply and proper portal application where eligible.',
    callout: 'Before filing revocation, confirm why registration was cancelled and whether pending returns, late fees, interest or documents must be fixed first.',
    when: ['GST registration cancelled due to non-filing.', 'Registration suspended after notice.', 'You need to restart GST billing.', 'Customers are unable to claim ITC because GSTIN is inactive.', 'You want to understand appeal/revocation options.'],
    documents: ['GST cancellation order or notice.', 'GST login details and business registration proof.', 'Pending GSTR-1, GSTR-3B and annual return status.', 'Sales/purchase invoices and books.', 'Tax, interest and late fee ledger details.', 'Address proof, bank details and authorised signatory documents.'],
    process: [{ title: 'Find cancellation reason', body: 'Read the order and identify non-filing, verification, documents or business-status issue.' }, { title: 'Clear pending compliance', body: 'Prepare returns, tax payment, interest and late fee workings before applying.' }, { title: 'Draft revocation response', body: 'Explain facts with supporting documents and attach compliance proof.' }, { title: 'Track approval', body: 'Monitor portal status and respond to further officer queries if raised.' }],
    pricing: [{ type: 'Eligibility and pending return review', price: 'Rs. 2,000 - Rs. 5,000', timeline: '1-2 days' }, { type: 'Revocation filing support', price: 'Rs. 5,000 - Rs. 15,000', timeline: '3-10 days' }, { type: 'Complex cancellation/appeal support', price: 'Rs. 15,000 - Rs. 50,000+', timeline: 'Case-specific' }],
    mistakes: ['Filing revocation without clearing pending returns.', 'Ignoring tax, interest and late fee impact.', 'Using a generic reason instead of facts from the cancellation order.', 'Missing revocation timelines.', 'Continuing to issue invoices without checking GSTIN status.'],
    faqs: [{ q: 'Can cancelled GST registration be restored?', a: 'In eligible cases, revocation or appeal routes may be available. Facts and timelines matter.' }, { q: 'Do pending returns need to be filed first?', a: 'Usually, pending compliance must be cleaned up for non-filing cancellation cases.' }, { q: 'How long does revocation take?', a: 'Simple cases can move in days, but officer review and pending compliance can extend timelines.' }, { q: 'Can I get quotes before selecting a consultant?', a: 'Yes. Post the cancellation reason and compare GST experts on WorkIndex.' }],
    sidePitch: 'Share your cancellation order and pending-return status to compare GST experts for restoration support.',
    related: commonGst,
    references: gstRefs,
    ctaTitle: 'GSTIN cancelled or suspended?',
    ctaText: 'Post the issue and compare GST consultants for revocation support.'
  },
  {
    slug: 'gst-return-filing-cost-india',
    title: 'GST Return Filing Cost in India | Monthly GST Pricing Guide',
    metaDescription: 'Understand GST return filing cost in India for GSTR-1, GSTR-3B, nil returns, reconciliation, ecommerce sellers and monthly compliance.',
    keywords: ['GST return filing cost India', 'GSTR 3B filing fees', 'monthly GST filing charges'],
    service: 'GST return filing pricing',
    eyebrow: 'GST Pricing Guide',
    h1: 'GST Return Filing Cost',
    h1Span: 'India Pricing Guide',
    hero: 'GST filing price depends on invoice volume, number of GSTINs, reconciliation, ecommerce marketplaces, e-way bills, e-invoicing and pending periods. Use this guide before hiring.',
    stats: ['Monthly GST', '1-5 days', 'Compare fees'],
    quickTitle: 'GST filing is priced by complexity, not just one return',
    quick: 'A nil return may be simple, while active businesses need sales, purchase, ITC, tax payment, e-way bill and accounting reconciliation. Marketplace sellers and multi-branch businesses usually need deeper work.',
    callout: 'Ask whether the quote includes GSTR-1, GSTR-3B, ITC reconciliation, payment challan support and amendment handling.',
    when: ['You want monthly GST filing support.', 'You have pending GST returns.', 'You sell through Amazon, Flipkart, Swiggy, Zomato or other platforms.', 'You need invoice-wise reconciliation.', 'You want to compare monthly retainer vs per-return fees.'],
    documents: ['GST login access.', 'Sales invoices and credit/debit notes.', 'Purchase invoices and expense bills.', 'GSTR-2B/2A and supplier reconciliation.', 'E-way bill and e-invoice data where applicable.', 'Bank statements and accounting data.'],
    process: [{ title: 'Estimate transaction volume', body: 'Count monthly sales and purchase invoices, GSTINs and platforms.' }, { title: 'Define filing scope', body: 'Confirm whether GSTR-1, GSTR-3B, reconciliation and payment support are included.' }, { title: 'Check pending periods', body: 'Older returns may need cleanup, interest and late-fee calculations.' }, { title: 'Compare retainers', body: 'Monthly retainer can be better than one-off filing for active businesses.' }],
    pricing: [{ type: 'Nil or very small filing', price: 'Rs. 500 - Rs. 1,500 per month', timeline: 'Same day to 2 days' }, { type: 'Small business monthly GST', price: 'Rs. 1,500 - Rs. 5,000 per month', timeline: '1-4 days' }, { type: 'Ecommerce / high-volume GST', price: 'Rs. 5,000 - Rs. 25,000+ per month', timeline: '3-7 days' }],
    mistakes: ['Choosing the cheapest quote without reconciliation.', 'Not asking if amendments and notices are included.', 'Ignoring GSTR-2B before claiming ITC.', 'Filing sales but not matching books and bank receipts.', 'Waiting until due date with unprepared invoices.'],
    faqs: [{ q: 'Why do GST filing charges vary so much?', a: 'Invoice volume, reconciliation, pending returns, ecommerce data and number of GSTINs change the work involved.' }, { q: 'Is nil GST return filing chargeable?', a: 'Professionals may charge a small fee even for nil filing because login, review and submission responsibility remain.' }, { q: 'Does monthly GST fee include accounting?', a: 'Not always. Ask separately whether bookkeeping, bank reconciliation and MIS are included.' }, { q: 'Can I compare GST monthly retainers?', a: 'Yes. Post your invoice count and business type to compare quotes.' }],
    sidePitch: 'Post your monthly invoice count and GST filing need to compare realistic quotes.',
    related: commonGst,
    references: gstRefs,
    ctaTitle: 'Compare GST filing costs',
    ctaText: 'Tell WorkIndex your invoice volume and GSTIN count. Experts can quote accurately.'
  },
  {
    slug: 'tax-audit-applicability',
    title: 'Tax Audit Applicability in India | Section 44AB Help',
    metaDescription: 'Understand tax audit applicability for business, profession, presumptive taxation, turnover thresholds, trading and audit report preparation.',
    keywords: ['tax audit applicability', 'section 44AB audit', 'tax audit for business', 'tax audit for profession'],
    service: 'Tax audit applicability review',
    eyebrow: 'Audit Guidance',
    h1: 'Tax Audit Applicability',
    h1Span: 'For Indian Businesses',
    hero: 'Tax audit applicability depends on turnover, profession receipts, presumptive taxation choices, losses and business facts. Get it reviewed before filing ITR.',
    stats: ['44AB review', '1-5 days', 'Audit experts'],
    quickTitle: 'Applicability is fact-specific',
    quick: 'Tax audit under income tax law can apply based on turnover/gross receipts, profession category, presumptive taxation conditions and reporting requirements. Businesses should check applicability before year-end filing.',
    callout: 'Do not decide only from turnover. Presumptive taxation, cash receipts/payments, losses and profession rules can change the answer.',
    when: ['Business turnover or professional receipts are near threshold.', 'You used or exited presumptive taxation.', 'Trading/F&O income creates uncertainty.', 'Books are incomplete and ITR deadline is close.', 'You need audit report, financial statements and ITR alignment.'],
    documents: ['Sales and purchase register.', 'Profit and loss account and balance sheet.', 'Bank statements and cash book.', 'GST returns and books reconciliation.', 'Previous year ITR and audit report.', 'Details of presumptive income, losses and trading activity.'],
    process: [{ title: 'Review activity type', body: 'Classify business, profession, trading or mixed income correctly.' }, { title: 'Check thresholds and conditions', body: 'Review turnover, receipts, cash transactions and presumptive rules.' }, { title: 'Prepare books', body: 'Ensure ledger, bank, GST and financial statements are audit-ready.' }, { title: 'Coordinate filing', body: 'Align audit report, tax computation and ITR filing before deadline.' }],
    pricing: [{ type: 'Applicability consultation', price: 'Rs. 1,500 - Rs. 5,000', timeline: 'Same day to 2 days' }, { type: 'Small business tax audit', price: 'Rs. 15,000 - Rs. 50,000', timeline: '5-15 days' }, { type: 'Complex/multi-branch audit', price: 'Rs. 50,000+', timeline: 'Case-specific' }],
    mistakes: ['Checking only GST turnover and ignoring income tax audit rules.', 'Not preparing books before audit deadline.', 'Treating F&O or intraday trading casually.', 'Not coordinating GST, books and ITR figures.', 'Missing audit report filing deadline.'],
    faqs: [{ q: 'Is tax audit needed for every business?', a: 'No. Applicability depends on turnover, receipts, tax regime choices and facts.' }, { q: 'Can a CA decide tax audit applicability?', a: 'Yes, a CA can review your books and tax position for audit applicability.' }, { q: 'Is GST audit same as tax audit?', a: 'No. GST compliance and income tax audit are different requirements.' }, { q: 'When should I start?', a: 'Start before the ITR/audit deadline because books cleanup often takes time.' }],
    sidePitch: 'Post turnover, business type and filing status to compare tax audit experts.',
    related: [{ href: '/seo-pages/audit-services-all-cities.html', label: 'Audit experts by city' }, { href: '/seo-pages/company-compliance-services.html', label: 'Company compliance services' }, ...commonItt.slice(0, 2)],
    references: auditRefs,
    ctaTitle: 'Unsure about tax audit?',
    ctaText: 'Get applicability checked before filing season pressure begins.'
  },
  {
    slug: 'statutory-audit-services',
    title: 'Statutory Audit Services in India | Compare Audit Professionals',
    metaDescription: 'Find statutory audit services for companies, LLPs, societies and businesses. Compare audit scope, documents, timeline and pricing on WorkIndex.',
    keywords: ['statutory audit services', 'company statutory audit', 'audit professionals India'],
    service: 'Statutory audit services',
    eyebrow: 'Audit Services',
    h1: 'Statutory Audit Services',
    h1Span: 'For Compliance and Assurance',
    hero: 'Statutory audits need proper books, confirmations, ledgers, financial statements and compliance review. Compare audit professionals before finalising.',
    stats: ['Audit report', '7-30 days', 'Audit experts'],
    quickTitle: 'Statutory audit is not just signature work',
    quick: 'A meaningful statutory audit reviews books, financial statements, controls, bank balances, receivables, payables, statutory dues and supporting documents before issuing a report.',
    callout: 'A low quote without clear scope can create risk. Ask what documents, review steps and timelines are included.',
    when: ['Company or entity requires statutory audit.', 'Books need cleanup before audit.', 'Bank, debtor, creditor or inventory balances need verification.', 'You need financial statements for ROC, banks or investors.', 'Previous auditor remarks need follow-up.'],
    documents: ['Trial balance, ledgers and financial statements.', 'Bank statements and bank confirmation details.', 'Sales, purchase, expense and payroll records.', 'GST, TDS, PF/ESI and statutory dues details.', 'Fixed asset register and depreciation working.', 'Board minutes, agreements and loan confirmations where applicable.'],
    process: [{ title: 'Define audit scope', body: 'Confirm entity type, period, reporting requirement and deadlines.' }, { title: 'Prepare books', body: 'Complete accounting, bank reconciliation and schedules before audit review.' }, { title: 'Perform audit checks', body: 'Auditor reviews balances, samples, controls, statutory dues and supporting documents.' }, { title: 'Close observations', body: 'Resolve queries, finalise financial statements and issue audit report.' }],
    pricing: [{ type: 'Small company/entity audit', price: 'Rs. 20,000 - Rs. 60,000', timeline: '7-20 days' }, { type: 'Medium business audit', price: 'Rs. 60,000 - Rs. 2,00,000', timeline: '15-30 days' }, { type: 'Complex/group audit', price: 'Rs. 2,00,000+', timeline: 'Case-specific' }],
    mistakes: ['Starting audit before books are reconciled.', 'Not sharing statutory dues and compliance details.', 'Ignoring auditor queries until deadline.', 'Confusing tax audit and statutory audit.', 'Selecting only on price without checking audit experience.'],
    faqs: [{ q: 'Who can perform statutory audit?', a: 'For companies, statutory audit generally needs a qualified auditor as required under applicable law.' }, { q: 'How long does statutory audit take?', a: 'Small entities may finish in 1-3 weeks if books are ready. Complex audits take longer.' }, { q: 'Does statutory audit include ROC filing?', a: 'Not always. Ask whether financial statement filing support is included.' }, { q: 'Can WorkIndex help find an auditor?', a: 'Yes. Post scope and deadlines to compare audit professionals.' }],
    sidePitch: 'Post entity type, turnover, deadline and books status to compare audit quotes.',
    related: [{ href: '/seo-pages/audit-services-all-cities.html', label: 'Audit experts by city' }, ...commonAccounting],
    references: auditRefs,
    ctaTitle: 'Need statutory audit support?',
    ctaText: 'Compare audit professionals with clear scope, timeline and pricing.'
  },
  {
    slug: 'monthly-accounting-services',
    title: 'Monthly Accounting Services in India | Bookkeeping and MIS Support',
    metaDescription: 'Compare monthly accounting services for bookkeeping, bank reconciliation, GST-linked accounts, payroll, receivables, payables and MIS reporting.',
    keywords: ['monthly accounting services', 'bookkeeping retainer India', 'monthly accountant for small business'],
    service: 'Monthly accounting services',
    eyebrow: 'Accounting Retainers',
    h1: 'Monthly Accounting Services',
    h1Span: 'For Growing Businesses',
    hero: 'Monthly accounting keeps books updated, GST filing clean, payments traceable and reports ready. Compare accountants based on transaction volume, reporting needs and response time.',
    stats: ['Monthly books', 'Ongoing', 'Accountants'],
    quickTitle: 'Monthly accounting prevents year-end cleanup',
    quick: 'A monthly accountant can record sales, purchases, expenses, bank entries, payroll, GST data, receivables and payables so business owners avoid messy books at filing or audit time.',
    callout: 'The best quote is not always the cheapest. Ask about monthly closing date, bank reconciliation, GST coordination, MIS and document collection process.',
    when: ['Your books are updated only during tax season.', 'GST filing does not match accounting records.', 'Receivables and payables are unclear.', 'You need monthly P&L, cash-flow or expense reports.', 'You want payroll, TDS or vendor payment tracking.'],
    documents: ['Bank statements and payment gateway reports.', 'Sales invoices, purchase bills and expense receipts.', 'GST returns and portal downloads.', 'Payroll, contractor and TDS details.', 'Loan, EMI and credit card statements.', 'Previous accounting data from Tally, Zoho, QuickBooks or spreadsheets.'],
    process: [{ title: 'Set monthly scope', body: 'Define transaction volume, software, GST, payroll and reporting expectations.' }, { title: 'Collect documents', body: 'Create a monthly process for invoices, bills, bank files and approvals.' }, { title: 'Reconcile and close', body: 'Match bank, GST, receivables, payables and ledgers every month.' }, { title: 'Review reports', body: 'Use P&L, balance sheet, cash-flow and GST summaries to make decisions.' }],
    pricing: [{ type: 'Small freelancer/proprietor books', price: 'Rs. 2,000 - Rs. 6,000 per month', timeline: 'Monthly' }, { type: 'Small business accounting', price: 'Rs. 6,000 - Rs. 20,000 per month', timeline: 'Monthly close' }, { type: 'High-volume/MIS accounting', price: 'Rs. 20,000 - Rs. 75,000+ per month', timeline: 'Ongoing' }],
    mistakes: ['Not defining transaction volume before asking price.', 'Mixing personal and business expenses without notes.', 'Ignoring bank reconciliation.', 'Treating GST filing and accounting as separate silos.', 'Not reviewing reports monthly.'],
    faqs: [{ q: 'What is included in monthly accounting?', a: 'Usually bookkeeping, bank reconciliation, ledger review and reports. GST, payroll and TDS may be included depending on scope.' }, { q: 'Can remote accountants manage books?', a: 'Yes, if document sharing, software access and review process are clear.' }, { q: 'Which software is best?', a: 'It depends on business size. Tally, Zoho, QuickBooks and spreadsheets are common; consistency matters more.' }, { q: 'Can WorkIndex help compare retainers?', a: 'Yes. Post your transaction volume and required reports to compare monthly quotes.' }],
    sidePitch: 'Tell experts your invoice count, software and reporting needs to get realistic monthly quotes.',
    related: commonAccounting,
    references: auditRefs,
    ctaTitle: 'Need monthly accounting?',
    ctaText: 'Post your bookkeeping scope and compare accountants before selecting a retainer.'
  },
  {
    slug: 'private-limited-company-annual-compliance',
    title: 'Private Limited Company Annual Compliance in India | WorkIndex',
    metaDescription: 'Understand private limited company annual compliance: accounting, statutory audit, AOC-4, MGT-7, board records, income tax return and ROC filing support.',
    keywords: ['private limited company annual compliance', 'company ROC filing', 'AOC-4 MGT-7 filing'],
    service: 'Private limited company annual compliance',
    eyebrow: 'Company Compliance',
    h1: 'Private Limited Company',
    h1Span: 'Annual Compliance Guide',
    hero: 'Private limited companies need accounting, statutory audit, income tax return and ROC filings. Compare compliance professionals before deadlines pile up.',
    stats: ['ROC + tax', '15-45 days', 'CA/CS support'],
    quickTitle: 'Annual compliance is a bundle, not one filing',
    quick: 'A company normally needs books closure, financial statements, statutory audit, board/shareholder records, income tax return and ROC forms such as financial statement and annual return filings where applicable.',
    callout: 'Start early. ROC filings depend on finalised accounts and audit, so delayed books can delay every compliance step.',
    when: ['Your company financial year has ended.', 'Books are not closed for audit.', 'AOC-4/MGT-7 or annual return filing is pending.', 'You need auditor/CA/CS coordination.', 'You want to regularise old pending compliance.'],
    documents: ['Incorporation documents, PAN, TAN and GST details.', 'Books of accounts and bank statements.', 'Invoices, expense proofs and payroll details.', 'Shareholding and director details.', 'Board minutes, agreements and statutory registers.', 'Previous year financial statements and ROC filings.'],
    process: [{ title: 'Close books', body: 'Complete accounting, bank reconciliation and schedules.' }, { title: 'Prepare financial statements', body: 'Finalise P&L, balance sheet, notes and supporting schedules.' }, { title: 'Complete audit and tax filing', body: 'Coordinate statutory audit and income tax return.' }, { title: 'File ROC forms', body: 'Prepare and file applicable annual forms after approvals and signatures.' }],
    pricing: [{ type: 'Small company annual package', price: 'Rs. 20,000 - Rs. 60,000', timeline: '15-30 days' }, { type: 'Company with cleanup/audit complexity', price: 'Rs. 60,000 - Rs. 1,50,000', timeline: '30-45 days' }, { type: 'Multiple years pending', price: 'Case-specific', timeline: 'Depends on backlog' }],
    mistakes: ['Assuming zero business means zero compliance.', 'Not maintaining board minutes and statutory registers.', 'Waiting until ROC additional fees start.', 'Separating accountant, auditor and CS without coordination.', 'Not reconciling GST/TDS before final accounts.'],
    faqs: [{ q: 'Does every private company need annual compliance?', a: 'Yes, annual statutory and filing obligations generally continue even if business activity is low.' }, { q: 'Is ROC filing same as income tax return?', a: 'No. ROC/MCA filings and income tax return are separate compliance requirements.' }, { q: 'Can one professional handle everything?', a: 'Some firms coordinate accounting, audit, tax and ROC. Others may involve CA and CS separately.' }, { q: 'Can WorkIndex help compare packages?', a: 'Yes. Post company status, turnover and pending years to compare quotes.' }],
    sidePitch: 'Post your company compliance status and compare CA/CS-led packages with clear scope.',
    related: commonAccounting,
    references: auditRefs,
    ctaTitle: 'Company annual compliance pending?',
    ctaText: 'Compare professionals for accounting, audit, tax and ROC filing support.'
  },
  {
    slug: 'roc-filing-services',
    title: 'ROC Filing Services in India | MCA Annual Filing Support',
    metaDescription: 'Compare ROC filing services for AOC-4, MGT-7, annual return, financial statement filing, director KYC, ADT-1 and company compliance.',
    keywords: ['ROC filing services', 'MCA annual filing', 'AOC-4 filing', 'MGT-7 filing'],
    service: 'ROC filing services',
    eyebrow: 'MCA Compliance',
    h1: 'ROC Filing Services',
    h1Span: 'For Companies and LLPs',
    hero: 'ROC filing needs correct financial statements, company data, digital signatures, board records and MCA form preparation. Compare professionals before filing.',
    stats: ['MCA forms', '3-20 days', 'CA/CS support'],
    quickTitle: 'ROC filing depends on accurate company records',
    quick: 'ROC/MCA filings commonly involve annual financial statements, annual returns, auditor details, director details, registered office and event-based changes. Wrong or late filing can create additional fees and compliance issues.',
    callout: 'Check whether your quote includes form preparation, attachments, DSC coordination, professional certification and resubmission support.',
    when: ['Annual ROC filing is due or pending.', 'You need AOC-4, MGT-7/MGT-7A or related forms.', 'Director KYC or auditor appointment details need filing.', 'Company master data needs correction/update.', 'Multiple years of filings are pending.'],
    documents: ['Company CIN, PAN and MCA login details if available.', 'Financial statements and audit report.', 'Director and shareholder details.', 'Digital signature certificates.', 'Board/shareholder meeting dates and minutes.', 'Previous ROC filings and challans.'],
    process: [{ title: 'Confirm applicable forms', body: 'Identify annual and event-based forms based on company type and status.' }, { title: 'Prepare attachments', body: 'Collect financial statements, audit report, resolutions and declarations.' }, { title: 'Check DSC and certification', body: 'Ensure authorised signatory and professional certification are ready.' }, { title: 'File and track challans', body: 'Submit forms, save SRN/challan and handle resubmission if raised.' }],
    pricing: [{ type: 'Single ROC form support', price: 'Rs. 1,500 - Rs. 7,500', timeline: '1-3 days' }, { type: 'Annual ROC filing package', price: 'Rs. 8,000 - Rs. 30,000', timeline: '3-15 days' }, { type: 'Backlog or complex filings', price: 'Rs. 30,000+', timeline: 'Case-specific' }],
    mistakes: ['Uploading unsigned or inconsistent attachments.', 'Missing DSC validity.', 'Not matching financial statements with audit report.', 'Ignoring resubmission remarks.', 'Treating additional fees as professional fees without breakup.'],
    faqs: [{ q: 'Who handles ROC filing?', a: 'Company compliance is often handled by CA/CS professionals depending on form and certification needs.' }, { q: 'Can ROC filing be done without completed accounts?', a: 'Annual financial statement filings need finalised accounts and relevant approvals.' }, { q: 'What if old filings are pending?', a: 'A professional can check master data, pending forms, fees and sequence of filings.' }, { q: 'Can WorkIndex compare ROC filing quotes?', a: 'Yes. Share company type, pending forms and years to compare professionals.' }],
    sidePitch: 'Post your CIN, pending forms and filing year to compare ROC filing support.',
    related: commonAccounting,
    references: auditRefs,
    ctaTitle: 'Need ROC filing help?',
    ctaText: 'Compare CA/CS professionals for MCA forms and company compliance.'
  },
  {
    slug: 'website-development-cost-india',
    title: 'Website Development Cost in India | Business Website Pricing Guide',
    metaDescription: 'Understand website development cost in India for business websites, ecommerce, landing pages, SEO-ready pages, maintenance and custom web apps.',
    keywords: ['website development cost India', 'business website price', 'web development charges India'],
    service: 'Website development pricing',
    eyebrow: 'Web Development Pricing',
    h1: 'Website Development Cost',
    h1Span: 'India Pricing Guide',
    hero: 'Website cost depends on pages, design quality, content, CMS, ecommerce, SEO setup, speed, integrations and maintenance. Compare developers with a clear scope.',
    stats: ['Website quote', '1-6 weeks', 'Developers'],
    quickTitle: 'Cost follows scope and ownership',
    quick: 'A simple static site, WordPress site, ecommerce store and custom web app are different products. Ask for deliverables, hosting, admin panel, revisions, SEO basics, performance and handover terms.',
    callout: 'A professional quote should mention number of pages, tech stack, responsive design, forms, analytics, SEO metadata, deployment and maintenance.',
    when: ['You need a new business website.', 'Your current site looks outdated or slow.', 'You want SEO-ready service pages.', 'You need ecommerce, bookings, forms or payment integration.', 'You want to compare freelancer vs agency pricing.'],
    documents: ['Business logo, brand colors and domain details.', 'Page list and content outline.', 'Reference websites you like.', 'Photos, product/service details and testimonials.', 'Required forms, payment, WhatsApp or CRM integrations.', 'Hosting/admin access if redesigning.'],
    process: [{ title: 'Define page scope', body: 'List pages, sections, forms, languages and assets before asking for price.' }, { title: 'Choose build type', body: 'Static, WordPress, Shopify, custom app or no-code depends on business goals.' }, { title: 'Check SEO basics', body: 'Confirm metadata, schema, sitemap, speed and mobile responsiveness.' }, { title: 'Plan maintenance', body: 'Clarify bug fixes, content updates, backups and support after launch.' }],
    pricing: [{ type: 'Landing page / one-page site', price: 'Rs. 5,000 - Rs. 25,000', timeline: '3-10 days' }, { type: 'Business website', price: 'Rs. 20,000 - Rs. 1,00,000', timeline: '1-4 weeks' }, { type: 'Ecommerce/custom web app', price: 'Rs. 75,000 - Rs. 5,00,000+', timeline: '4-12 weeks' }],
    mistakes: ['Comparing quotes without a page list.', 'Ignoring mobile and page speed.', 'Not asking who owns domain, hosting and source code.', 'Skipping SEO basics such as title, description, sitemap and schema.', 'Not agreeing maintenance terms.'],
    faqs: [{ q: 'Why are website quotes so different?', a: 'Design quality, content, CMS, custom features, integrations and support change the cost.' }, { q: 'Should I choose WordPress or custom development?', a: 'WordPress is good for content-heavy business sites. Custom is better for unique workflows and applications.' }, { q: 'Does website cost include hosting?', a: 'Not always. Ask whether hosting, domain, email and SSL are included.' }, { q: 'Can WorkIndex help compare developers?', a: 'Yes. Post your scope and compare developer quotes.' }],
    sidePitch: 'Post your website scope and compare developers who can explain cost, timeline and handover clearly.',
    related: commonWeb,
    references: webRefs,
    ctaTitle: 'Need a website quote?',
    ctaText: 'Post your page list and features. Compare developers before you pay an advance.'
  },
  {
    slug: 'small-business-website-development',
    title: 'Small Business Website Development in India | WorkIndex',
    metaDescription: 'Find small business website developers for service pages, lead forms, WhatsApp CTA, Google-ready SEO pages, fast mobile design and maintenance.',
    keywords: ['small business website development', 'business website developer India', 'local business website'],
    service: 'Small business website development',
    eyebrow: 'Business Websites',
    h1: 'Small Business Website Development',
    h1Span: 'Built to Generate Leads',
    hero: 'A small business website should explain services clearly, load fast on mobile, collect enquiries and help Google understand your location and expertise.',
    stats: ['Lead website', '1-4 weeks', 'Web experts'],
    quickTitle: 'Small business websites need clarity first',
    quick: 'For clinics, consultants, CA firms, restaurants, shops and local services, the site should show services, location, proof, pricing clues, FAQs, contact options and trust signals.',
    callout: 'Do not build only a pretty homepage. Service pages, local SEO, enquiry forms and WhatsApp/contact flows matter more for leads.',
    when: ['You do not have a business website yet.', 'Customers cannot find enough information about your services.', 'You need local SEO pages for city/area searches.', 'You want leads from Google, WhatsApp or forms.', 'Your old website is slow or not mobile-friendly.'],
    documents: ['Business name, logo and brand colors.', 'Service list and location coverage.', 'Photos, office/store images and team details.', 'Customer reviews, testimonials and case studies.', 'Phone, email, WhatsApp and map location.', 'Domain and hosting details if already purchased.'],
    process: [{ title: 'Plan service pages', body: 'Create pages for main services and local areas customers search for.' }, { title: 'Write useful content', body: 'Explain who the service is for, process, documents, price range and FAQs.' }, { title: 'Build mobile-first', body: 'Design for fast loading, easy reading and clear call buttons on phones.' }, { title: 'Launch and track', body: 'Set up analytics, Search Console basics, sitemap and enquiry tracking.' }],
    pricing: [{ type: 'Basic small business site', price: 'Rs. 15,000 - Rs. 40,000', timeline: '1-2 weeks' }, { type: 'SEO-ready service website', price: 'Rs. 40,000 - Rs. 1,20,000', timeline: '2-5 weeks' }, { type: 'Website plus content/local pages', price: 'Rs. 75,000+', timeline: '4-8 weeks' }],
    mistakes: ['Using generic stock text that does not explain real services.', 'No clear contact CTA above the fold.', 'No separate service pages.', 'Forgetting Google Business Profile and map consistency.', 'Not maintaining content after launch.'],
    faqs: [{ q: 'How many pages does a small business need?', a: 'Usually home, about, services, individual service pages, contact, privacy/terms and local pages if SEO matters.' }, { q: 'Should pricing be shown?', a: 'Ranges or starting prices help qualify leads, even if final quote depends on scope.' }, { q: 'Can a website bring leads?', a: 'Yes, if content, SEO, speed, trust signals and contact flow are handled properly.' }, { q: 'Can WorkIndex help find developers?', a: 'Yes. Post your business type and desired pages to compare developers.' }],
    sidePitch: 'Share your business category and page list to get practical website quotes.',
    related: commonWeb,
    references: webRefs,
    ctaTitle: 'Build a better business website',
    ctaText: 'Compare developers for a mobile-first, SEO-ready small business website.'
  },
  {
    slug: 'ecommerce-website-development',
    title: 'Ecommerce Website Development in India | Store Setup and Pricing',
    metaDescription: 'Compare ecommerce website developers for product catalogues, cart, checkout, payment gateway, shipping, GST invoice flow, SEO and maintenance.',
    keywords: ['ecommerce website development India', 'online store development', 'Shopify developer India'],
    service: 'Ecommerce website development',
    eyebrow: 'Online Stores',
    h1: 'Ecommerce Website Development',
    h1Span: 'For Indian Sellers',
    hero: 'Ecommerce websites need more than product pages. Payments, shipping, GST invoice flow, inventory, returns, speed, SEO and support should be planned before development.',
    stats: ['Online store', '3-10 weeks', 'Web experts'],
    quickTitle: 'Ecommerce scope must be specific',
    quick: 'A 20-product Shopify store, WooCommerce site and custom marketplace are very different. Define product count, payment gateway, shipping partners, GST needs, coupons, returns and admin workflow before asking for quotes.',
    callout: 'Ask whether the quote includes product upload, payment gateway setup, shipping integration, GST invoice support, analytics and training.',
    when: ['You want to sell products online.', 'Marketplace commissions are high and you need your own store.', 'You need product catalogue, cart and checkout.', 'You want Shopify, WooCommerce or custom ecommerce.', 'You need integrations with shipping, payment or inventory tools.'],
    documents: ['Product list, categories, prices and images.', 'GST, business and bank/payment gateway details.', 'Shipping rules, zones and courier partners.', 'Return/refund policy and terms.', 'Brand assets and content.', 'Required integrations such as WhatsApp, CRM, inventory or accounting.'],
    process: [{ title: 'Define store model', body: 'Single brand, multi-vendor, digital products, subscriptions or B2B each need different architecture.' }, { title: 'Choose platform', body: 'Shopify, WooCommerce or custom depends on budget, scale and control needs.' }, { title: 'Plan checkout operations', body: 'Payment, tax, invoice, shipping, returns and email/SMS updates must work together.' }, { title: 'Launch with tracking', body: 'Set up analytics, search indexing, product SEO and conversion tracking.' }],
    pricing: [{ type: 'Basic Shopify/WooCommerce store', price: 'Rs. 35,000 - Rs. 1,00,000', timeline: '2-5 weeks' }, { type: 'Custom ecommerce with integrations', price: 'Rs. 1,00,000 - Rs. 5,00,000+', timeline: '6-12 weeks' }, { type: 'Maintenance and improvements', price: 'Rs. 5,000 - Rs. 50,000 per month', timeline: 'Ongoing' }],
    mistakes: ['Starting design before product data is ready.', 'Ignoring shipping and GST invoice workflow.', 'No plan for returns/refunds.', 'Choosing custom development when a platform store is enough.', 'Skipping speed and mobile checkout testing.'],
    faqs: [{ q: 'Which platform is best for ecommerce?', a: 'Shopify is simple and hosted, WooCommerce is flexible with WordPress, custom development fits unique workflows.' }, { q: 'Do I need GST for ecommerce?', a: 'GST requirements depend on your business and marketplace/channel. Ask a tax professional for your case.' }, { q: 'Can developers upload products?', a: 'Yes, but confirm number of products and whether data cleanup is included.' }, { q: 'Can WorkIndex compare ecommerce developers?', a: 'Yes. Post product count, platform preference and integrations to compare quotes.' }],
    sidePitch: 'Post product count, platform preference and integrations to get realistic ecommerce quotes.',
    related: commonWeb,
    references: webRefs,
    ctaTitle: 'Need an ecommerce store?',
    ctaText: 'Compare developers for store setup, payment, shipping and ongoing support.'
  },
  {
    slug: 'how-to-hire-web-developer',
    title: 'How to Hire a Web Developer in India | WorkIndex Guide',
    metaDescription: 'Learn how to hire a web developer in India: scope, portfolio, pricing, technology, SEO, hosting, payment milestones and maintenance checklist.',
    keywords: ['how to hire web developer', 'hire web developer India', 'web developer checklist'],
    service: 'Web developer hiring guide',
    eyebrow: 'Hiring Guide',
    h1: 'How to Hire a Web Developer',
    h1Span: 'Without Scope Confusion',
    hero: 'Hiring a developer is easier when you define pages, features, content, budget, ownership and maintenance before comparing quotes.',
    stats: ['Hiring guide', '10 min read', 'Developer quotes'],
    quickTitle: 'Start with scope, not technology',
    quick: 'Most web development disputes happen because scope, revisions, content, hosting, SEO, payment milestones and maintenance were not clear. A good developer helps clarify these before work starts.',
    callout: 'Before paying an advance, get deliverables, timeline, milestones, ownership, hosting, source code and post-launch support in writing.',
    when: ['You are hiring your first developer.', 'You have multiple quotes with different pricing.', 'You do not know whether to choose WordPress, Shopify or custom.', 'You want to avoid delays and unclear handover.', 'You need SEO and speed considered from day one.'],
    documents: ['Business goals and target audience.', 'Page list and feature list.', 'Reference websites and design preferences.', 'Content, logo, photos and brand guidelines.', 'Domain/hosting details if available.', 'Budget range and launch deadline.'],
    process: [{ title: 'Write a brief', body: 'Mention business, pages, forms, integrations, content readiness and desired launch date.' }, { title: 'Review portfolio', body: 'Check live websites, mobile layout, speed, clarity and relevance to your business.' }, { title: 'Compare scope, not just price', body: 'Confirm what each quote includes and excludes.' }, { title: 'Use milestones', body: 'Split payment by design approval, development, testing, launch and handover.' }],
    pricing: [{ type: 'Freelancer landing page', price: 'Rs. 5,000 - Rs. 25,000', timeline: '3-10 days' }, { type: 'Business website developer', price: 'Rs. 20,000 - Rs. 1,00,000', timeline: '1-4 weeks' }, { type: 'Custom web app developer/team', price: 'Rs. 1,00,000+', timeline: '4+ weeks' }],
    mistakes: ['Hiring only from the lowest quote.', 'Not checking live portfolio links.', 'No agreement on revisions.', 'No SEO, analytics or sitemap setup.', 'No maintenance plan after launch.'],
    faqs: [{ q: 'Should I hire freelancer or agency?', a: 'Freelancers can be cost-effective for clear small scopes. Agencies may suit larger design, content, integrations and support needs.' }, { q: 'How much advance is normal?', a: 'Milestone-based payment is safer than paying most of the amount upfront.' }, { q: 'What should be included in handover?', a: 'Domain/hosting access, source files, admin credentials, documentation and backup details.' }, { q: 'Can WorkIndex help compare developers?', a: 'Yes. Post your brief and compare developers with scope-specific quotes.' }],
    sidePitch: 'Post your website brief and compare developers on scope, price and timeline.',
    related: commonWeb,
    references: webRefs,
    ctaTitle: 'Ready to hire a developer?',
    ctaText: 'Post your website scope and compare quotes from WorkIndex professionals.'
  }
];

fs.mkdirSync(seoDir, { recursive: true });
for (const page of pages) {
  fs.writeFileSync(path.join(seoDir, `${page.slug}.html`), render(page));
}

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const page of pages) {
  const loc = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  if (!sitemap.includes(loc)) {
    const entry = `  <url><loc>${loc}</loc><priority>0.75</priority><changefreq>monthly</changefreq><lastmod>${today}</lastmod></url>\n`;
    sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
  }
}
fs.writeFileSync(sitemapPath, sitemap);

console.log(JSON.stringify({ created: pages.map(page => `seo-pages/${page.slug}.html`), count: pages.length }, null, 2));
