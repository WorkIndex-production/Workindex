const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);
const ctaUrl = '/?signup=true&role=client';

function esc(v) {
  return String(v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function titleFromSlug(slug) {
  const upper = { gst: 'GST', itr: 'ITR', tds: 'TDS', hsn: 'HSN', sac: 'SAC', itc: 'ITC', isd: 'ISD', qrmp: 'QRMP', fssai: 'FSSAI', iec: 'IEC', dsc: 'DSC', stt: 'STT', fno: 'F&O', 'f&o': 'F&O', sgb: 'SGB', huf: 'HUF', ca: 'CA', cfo: 'CFO', ui: 'UI', ux: 'UX', seo: 'SEO', msme: 'MSME', udyam: 'Udyam', pf: 'PF', esi: 'ESI', roc: 'ROC', mca: 'MCA', rcm: 'RCM', lut: 'LUT' };
  return slug.split('-').map(p => upper[p] || p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

function table(headers, rows) {
  return `<table class="wi-table"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function steps(items) {
  return `<div class="lp-steps">${items.map(s => `<div class="lp-step"><h3>${esc(s.title)}</h3><p>${s.body}</p></div>`).join('')}</div>`;
}

function linkList(slugs) {
  return slugs.map(slug => `<a href="/seo-pages/${slug}.html">${esc(titleFromSlug(slug))}</a>`).join('');
}

const officialRefs = {
  gst: [
    { label: 'GST portal', href: 'https://www.gst.gov.in/' },
    { label: 'GST Council', href: 'https://gstcouncil.gov.in/' },
    { label: 'CBIC GST', href: 'https://cbic-gst.gov.in/' }
  ],
  tax: [
    { label: 'Income Tax e-Filing portal', href: 'https://www.incometax.gov.in/iec/foportal/' },
    { label: 'Income Tax Department', href: 'https://www.incometaxindia.gov.in/' },
    { label: 'CBDT', href: 'https://incometaxindia.gov.in/Pages/communications/circulars.aspx' }
  ],
  company: [
    { label: 'MCA portal', href: 'https://www.mca.gov.in/' },
    { label: 'DGFT', href: 'https://www.dgft.gov.in/' },
    { label: 'Startup India', href: 'https://www.startupindia.gov.in/' }
  ],
  payroll: [
    { label: 'Income Tax e-Filing portal', href: 'https://www.incometax.gov.in/iec/foportal/' },
    { label: 'EPFO', href: 'https://www.epfindia.gov.in/' },
    { label: 'ESIC', href: 'https://www.esic.gov.in/' }
  ],
  food: [
    { label: 'FoSCoS FSSAI', href: 'https://foscos.fssai.gov.in/' },
    { label: 'FSSAI', href: 'https://www.fssai.gov.in/' },
    { label: 'GST portal', href: 'https://www.gst.gov.in/' }
  ],
  tech: [
    { label: 'MDN Web Docs', href: 'https://developer.mozilla.org/' },
    { label: 'Google Search Central', href: 'https://developers.google.com/search' },
    { label: 'Web.dev', href: 'https://web.dev/' }
  ]
};

function schema(page) {
  const url = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': 'https://workindex.co.in/#organization', name: 'WorkIndex', url: 'https://workindex.co.in', description: 'India-focused marketplace to hire verified finance, tax, GST, accounting, audit, compliance and web development experts.' },
      { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.meta, about: { '@id': 'https://workindex.co.in/#organization' } },
      { '@type': 'Service', name: page.h1, serviceType: page.h1, provider: { '@id': 'https://workindex.co.in/#organization' }, areaServed: { '@type': 'Country', name: 'India' }, description: page.meta },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'WorkIndex', item: 'https://workindex.co.in' }, { '@type': 'ListItem', position: 2, name: page.h1, item: url }] },
      { '@type': 'FAQPage', mainEntity: page.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } })) }
    ]
  });
}

function render(page) {
  const canonical = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  const refs = officialRefs[page.refType || 'tax'] || officialRefs.tax;
  const related = page.related || ['itr-filing-services', 'gst-filing-services', 'accounting-bookkeeping-services', 'hire-ca-online-india'];
  const body = page.sections.map(s => `<section class="wi-panel"><div class="lp-section-eyebrow">${esc(s.eyebrow || page.type)}</div><h2>${esc(s.title)}</h2>${s.html || (s.table ? table(s.table.headers, s.table.rows) : s.steps ? steps(s.steps) : s.items ? list(s.items) : `<p>${s.body}</p>`)}</section>`).join('');
  const common = [
    `${page.h1} can depend on the financial year, notification date, state, turnover, product/service classification, portal status, documentation and prior filings.`,
    `Use this page as preparation guidance. Before filing, registering, responding to notices, changing rates, or making tax decisions, share exact invoices, notices, portal screenshots, dates and amounts with a qualified professional.`,
    `A strong WorkIndex quote should clearly state scope, assumptions, records needed, timeline, exclusions, correction support and whether follow-up with department/portal is included.`,
    `If a rule changed recently, ask the expert to identify the specific circular, notification, portal advisory or department guidance they are relying on, because search snippets and older articles often keep stale thresholds or forms online.`
  ];
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(page.title)}</title><meta name="description" content="${esc(page.meta)}"/><meta name="keywords" content="${esc([page.h1, page.title, 'WorkIndex'].join(', '))}"/>
<link rel="canonical" href="${canonical}"/><meta property="og:title" content="${esc(page.title)}"/><meta property="og:description" content="${esc(page.meta)}"/><meta property="og:url" content="${canonical}"/><meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/><link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-rich{padding:56px 24px;max-width:1160px;margin:0 auto}.wi-rich-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;align-items:start}.wi-panel{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}.wi-panel+.wi-panel{margin-top:20px}.wi-panel h2{font-size:24px;margin:0 0 14px}.wi-panel h3{font-size:17px;margin:18px 0 8px}.wi-panel p{color:var(--text-muted);font-size:15px;margin:0 0 12px;line-height:1.75}.wi-detail-list{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}.wi-detail-list li{margin-bottom:7px}.wi-side{position:sticky;top:82px}.wi-table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}.wi-table th,.wi-table td{border:1px solid var(--border);padding:11px;text-align:left;vertical-align:top}.wi-table th{background:var(--bg-gray);font-weight:800}.wi-ref a,.wi-related a{display:block;color:var(--primary);font-weight:800;text-decoration:none;margin:8px 0}@media(max-width:860px){.wi-rich-grid{grid-template-columns:1fr}.wi-side{position:static}}</style>
<script type="application/ld+json">${schema(page)}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body><nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="${ctaUrl}" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(page.h1)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${esc(page.type)}</div><h1>${esc(page.h1)}<br><span>${esc(page.subtitle)}</span></h1><p>${page.hero}</p><a href="${ctaUrl}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Verified expert discovery</div><div class="lp-trust-item">Compare quotes and timelines</div><div class="lp-trust-item">India-specific guidance</div><div class="lp-trust-item">Structured requirements</div></div></section>
<main class="wi-rich"><div class="wi-rich-grid"><div>${body}
<section class="wi-panel"><div class="lp-section-eyebrow">Accuracy Notes</div><h2>How to use this page safely</h2>${common.map(n => `<p>${esc(n)}</p>`).join('')}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Expert Screening</div><h2>How to compare WorkIndex responses</h2>${list(['Ask whether the expert has handled this exact service, industry, product category or portal workflow before.', 'Confirm whether the quote includes filing only, advisory only, or also reconciliation, correction, response drafting and follow-up.', 'Prefer experts who ask for records before final pricing instead of quoting blindly.', 'For urgent matters, include statutory deadline, notice/order date, current portal status and financial exposure.', 'Keep acknowledgement, computation, challan, report, working papers and communication trail after completion.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Records Checklist</div><h2>Keep these ready before requesting quotes</h2>${list(['PAN, Aadhaar, GSTIN, TAN, CIN, LLPIN, IEC, FSSAI number, DSC, Udyam or registration number as applicable.', 'Portal login access or screenshots from Income Tax, GST, MCA, DGFT, FSSAI/FoSCoS, e-way bill, ICEGATE or state labour portals.', 'Previous filings, acknowledgements, challans, certificates, orders, notices, audit reports and working papers.', 'Bank statements, invoices, contracts, payroll records, books export, product catalogues, HSN/SAC mapping, transaction reports or project documents relevant to the case.', 'A short written summary of what happened, what deadline exists, what help you need and whether support can be remote or must be local.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">WorkIndex Posting Tips</div><h2>How to get better quotes faster</h2>${list(['Mention whether you need one-time filing, urgent correction, registration, calculator review, audit, monthly retainer, appeal, technology build or advisory review.', 'Add approximate transaction count, employee count, turnover range, number of filings/years pending, and any notice deadline so experts can size the work properly.', 'For GST 2.0 pages, share the exact HSN/SAC, old rate charged, new rate you believe applies, invoice period and whether customers already claimed ITC.', 'For developer/marketing pages, share existing URL, scope, integrations, design readiness, budget range and maintenance expectation.', 'For tax and GST disputes, upload or summarise the section/form/order number, demand amount, date of service, due date and current portal status before asking for a quote.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Questions People Ask</div><h2>FAQs</h2>${page.faqs.map(f => `<h3>${esc(f.q)}</h3><p>${f.a}</p>`).join('')}</section></div>
<aside class="wi-side"><div class="wi-panel"><h2>Post once, compare experts</h2><p>Share your requirement once and compare relevant WorkIndex experts by scope, price, timeline and profile strength.</p><a href="${ctaUrl}" class="lp-hero-cta" style="padding:12px 18px;font-size:14px">Get Expert Quotes</a></div><div class="wi-panel wi-related"><h2>Related pages</h2>${linkList(related)}</div><div class="wi-panel wi-ref"><h2>Official references</h2>${refs.map(r => `<a href="${r.href}" rel="nofollow">${esc(r.label)}</a>`).join('')}</div></aside></div></main>
<section class="lp-cta-section"><h2>Need a professional to review your case?</h2><p>Post your requirement on WorkIndex and compare relevant experts before hiring.</p><a href="${ctaUrl}" class="lp-hero-cta">Post Requirement as Customer</a></section>
<footer class="lp-footer"><a href="/seo-pages/itr-filing-all-cities.html">ITR cities</a><a href="/seo-pages/gst-services-all-cities.html">GST cities</a><a href="/seo-pages/accounting-services-all-cities.html">Accounting cities</a><a href="/seo-pages/audit-services-all-cities.html">Audit cities</a><a href="/contact.html">Contact</a></footer></body></html>`;
}

function p(slug, type, title, meta, h1, subtitle, hero, sections, faqs, related, refType = 'tax') {
  return { slug, type, title, meta, h1, subtitle, hero, sections, faqs, related, refType };
}

const defaultFaqs = [
  { q: 'Is posting on WorkIndex free?', a: 'Yes. Customers can post a requirement for free and compare relevant experts before hiring.' },
  { q: 'Can this be handled online?', a: 'Many tax, GST, registration, accounting and web development tasks can be handled online if records and access are clear.' },
  { q: 'How should I compare quotes?', a: 'Compare scope, experience, timeline, required documents, follow-up support and whether the expert has handled similar work before.' }
];

const pages = [
  p('gst-2-rate-changes-guide','Informational hub','GST 2.0 Rate Changes - New 5%, 18% and 40% Slabs | WorkIndex','Complete guide to GST 2.0 rate changes effective September 2025. New 5%, 18% and 40% structure, impact on businesses and updated invoicing.','GST 2.0 Rate Changes','New rate slabs and transition checks for 2026','GST 2.0 simplified several rate buckets and created major rate-transition work for billing, HSN mapping, pricing, GSTR-1 and ITC review.',[
    { title:'What changed in GST 2.0', body:'GST 2.0 rationalised the rate structure around broad 5%, 18% and 40% buckets for many items. Businesses should not assume every old 12% or 28% item automatically moved the same way; the actual notification and HSN classification control the rate.' },
    { title:'Common rate movements to verify', items:['Many essential and mass-consumption items moved to lower-rate treatment.','Several consumer durables and automotive categories moved from higher slabs to standard-rate treatment.','Luxury/sin categories can fall into the 40% bucket.','Insurance, medicines and education-related exemptions need product-specific review.'] },
    { title:'What businesses need to update', items:['Invoice templates and billing software.','Tally, Zoho or ERP HSN-rate mapping.','Price lists, quotations and customer contracts.','Purchase orders with vendors.','GSTR-1 rate-wise reporting and credit note process.'] },
    { title:'Common confusion areas', items:['Most professional and IT services continue to need separate 18% review.','Construction and real estate rates depend on project type.','Restaurants and food supplies need notification-specific classification.','Insurance exemption depends on individual versus business/group product.'] }
  ],[{q:'Is 12% GST still applicable?',a:'For many items the old middle slabs were rationalised, but always check the specific HSN notification before changing rates.'},{q:'What is 40% GST for?',a:'It is generally for luxury/sin goods categories identified by GST notifications.'},{q:'Did restaurant GST change?',a:'Restaurant treatment needs category and notification review; do not change billing without checking.'},{q:'Can WorkIndex find a GST transition expert?',a:'Yes. Share HSN, product list, old rate and invoices.'}],['gst-filing-services','gst-hsn-code-finder','gst-registration-help','itc-reversal-help'],'gst'),

  p('gst-2-impact-on-ecommerce','Niche guide','GST 2.0 Impact on Ecommerce Sellers | WorkIndex','How GST 2.0 rate changes affect Amazon, Flipkart and D2C sellers. Rate changes by category, invoice updates, TCS reconciliation and GSTR-1 corrections.','GST 2.0 Impact on Ecommerce Sellers','Category rate changes, invoicing and GSTR-1 corrections','Marketplace sellers must keep HSN-rate mapping, product listings, TCS reconciliation and return amendments aligned after GST 2.0.',[
    { title:'Why ecommerce sellers feel rate changes faster', body:'Marketplace catalogues auto-map products by HSN/category. If mapping is wrong, customers see wrong prices, TCS is computed on wrong taxable values, and GSTR-1 can mismatch settlement reports.' },
    { title:'Categories sellers should review', items:['Electronics and consumer durables.','Clothing and footwear value bands.','Personal care and FMCG products.','Sports goods, toys and packaged food.','Luxury goods or restricted categories.'] },
    { title:'Seller action checklist', items:['Update HSN-rate mapping on marketplace seller portals.','Check whether marketplace auto-updated rates correctly.','Review old inventory and pricing margin.','Issue credit/debit notes for wrong post-change invoices.','Reconcile GSTR-1 with settlement and TCS reports.'] }
  ],[{q:'Does marketplace auto-update GST rates?',a:'Sometimes, but sellers should verify HSN and category mapping themselves.'},{q:'Can I amend old GSTR-1 rate errors?',a:'Amendment or credit-note route depends on period, invoice and portal window.'},{q:'How does rate change affect ITC?',a:'Output rate and input rate changes can alter working capital and ITC utilisation.'}],['gst-2-rate-changes-guide','gst-registration-for-ecommerce-sellers','bookkeeping-for-ecommerce-sellers','for-ecommerce-sellers'],'gst'),

  p('gst-insurance-exemption-2025','Informational help','GST on Insurance - Exemption Guide 2026 | WorkIndex','Individual life and health insurance GST treatment after September 2025. Understand personal policies, group covers, business insurance and ITC impact.','GST on Insurance','Individual premiums, business covers and ITC impact','Insurance GST treatment changed for several individual policies, but business, commercial and group insurance still need careful classification.',[
    { title:'What is and is not exempt', table:{headers:['Insurance type','GST treatment to review','Notes'],rows:[['Individual life/health/personal accident','Often exempt after GST 2.0 changes','Check policy and invoice date.'],['Group health insurance','May remain taxable/business-specific','Employer ITC is often restricted under Section 17(5).'],['Property, fire, marine, PI, vehicle commercial','Usually taxable','ITC depends on business use and blocked-credit rules.']] } },
    { title:'Situations this page is built for', items:['Individual checking renewal bill after rate change.','Business reviewing group health policy accounting.','Insurance agent updating invoices.','Accountant splitting pre- and post-change premiums.'] },
    { title:'What businesses need to check', items:['Policy renewal date after rate change.','Whether insurer still charged GST.','ITC on commercial insurance.','Blocked-credit treatment for employee benefit covers.'] }
  ],[{q:'Are all insurance products GST-free?',a:'No. Individual policy changes do not automatically exempt every business or commercial insurance product.'},{q:'Can I claim refund for GST paid before exemption?',a:'Usually old-law GST paid before effective date is not automatically refundable.'},{q:'Does exemption affect ITC?',a:'ITC depends on whether GST was charged and whether the credit is blocked.'}],['gst-2-rate-changes-guide','gst-filing-services','accounting-bookkeeping-services','rcm-reverse-charge-help'],'gst'),

  p('gst-qrmp-scheme-guide','Service guide','GST QRMP Scheme - Quarterly Return, Monthly Payment | WorkIndex','Understand the GST QRMP scheme for businesses with turnover up to Rs. 5 crore. Opt-in rules, IFF, PMT-06 payments and when QRMP helps.','GST QRMP Scheme','File quarterly, pay monthly - less returns, same discipline','QRMP reduces return count for eligible small businesses, but monthly tax payment and buyer ITC needs still require discipline.',[
    { title:'QRMP is for eligible small and mid-size businesses', body:'Businesses with aggregate turnover up to Rs. 5 crore can generally opt for quarterly GSTR-1/GSTR-3B while paying tax monthly through PMT-06.' },
    { title:'How QRMP works', items:['Month 1 and 2: pay tax through PMT-06 by the due date.','Optional IFF helps B2B buyers get invoice visibility monthly.','Quarter end: file GSTR-1 and GSTR-3B.','Buyers may need IFF where ITC timing matters.'] },
    { title:'When QRMP makes sense', items:['Mostly B2C business.','Lower transaction volume.','Limited accounting support.','Customers do not urgently need monthly ITC.'] },
    { title:'Common mistakes', items:['Missing monthly PMT-06 payment.','Skipping IFF when B2B buyers need ITC.','Trying to switch outside opt-in window.'] }
  ],[{q:'Can I switch to QRMP anytime?',a:'No. Opt-in windows and eligibility apply.'},{q:'Is IFF mandatory?',a:'No, but it helps B2B customers receive invoice details monthly.'},{q:'Does QRMP delay customer ITC?',a:'It can, unless IFF is used properly.'}],['gst-filing-services','gst-composition-scheme-filing','gst-2-rate-changes-guide','gst-for-small-business'],'gst'),

  p('gst-eway-bill-new-rules','Help guide','E-Way Bill Rules 2026 - Updated Threshold and Compliance | WorkIndex','Updated e-way bill rules for 2026. Thresholds, validity, blocking for non-filers, e-invoice linkage and common violations explained.','E-Way Bill Rules 2026','Thresholds, blocking rules and invoice linkage','E-way bill compliance connects transport, invoicing, e-invoicing, GST return filing and goods detention risk.',[
    { title:'Key e-way bill points for 2026', items:['Rs. 50,000 value threshold is the most common rule, but state and goods exceptions must be checked.','E-invoicing and e-way bill data increasingly connect for eligible taxpayers.','Non-filers can face e-way bill portal blocking.','Validity depends on distance and vehicle movement.'] },
    { title:'Situations this page is built for', items:['E-way bill portal blocked due to return non-filing.','Business confused between e-invoice and e-way bill.','Transporter has expired e-way bill mid-route.','Goods detained for wrong or missing vehicle details.'] },
    { title:'Documents required', items:['GSTIN and e-way bill login.','Invoice or bill of supply.','Transporter ID or vehicle number.','Distance and delivery address.','IRN where e-invoice applies.'] },
    { title:'Process', steps:[{title:'Generate Part A',body:'Enter invoice and supply details.'},{title:'Enter Part B',body:'Add vehicle/transporter details.'},{title:'Share EWB',body:'Give number to transporter.'},{title:'Track validity',body:'Extend or update where allowed.'}] }
  ],[{q:'Is e-way bill needed for intra-state movement?',a:'Often yes above threshold, but state exceptions and goods category matter.'},{q:'What if e-way bill expires?',a:'Goods can be detained; extension options depend on timing and facts.'},{q:'Is e-way bill required for services?',a:'E-way bill is for movement of goods, not pure services.'}],['eway-bill-help','gst-e-invoicing-applicability','gst-2-rate-changes-guide','gst-notice-reply-help'],'gst'),

  p('new-income-tax-act-2025-guide','Informational hub','New Income Tax Act 2025 - Complete Guide | WorkIndex','India Income Tax Act 2025 is live from April 2026. Simplified structure, new section numbering, tax year concept, TDS updates and taxpayer transition guidance.','New Income Tax Act 2025','Live from April 2026 - what taxpayers should check','The Income Tax Act 2025 changes structure, wording and references. Taxpayers still need year-specific form, slab and deduction checks.',[
    { title:'What changes and what does not', body:'The new Act modernises and reorganises income-tax law from April 2026. Core compliance remains familiar: compute income, claim eligible deductions, pay taxes, file returns and respond to notices.' },
    { title:'Key structural changes', items:['Simpler language and reorganised clauses.','New references for old section numbers.','Tax year terminology needs software and payroll updates.','Digital assets and platform economy provisions are clearer.','Old provisions remain relevant for past assessments and appeals.'] },
    { title:'What taxpayers must do', items:['File FY 2025-26 using applicable current-year forms and instructions.','From FY 2026-27, verify new Act references in payroll and ITR tools.','Keep old investment certificates; deduction treatment is mapped through law/software.','Ask CA to map old-to-new references in notices.'] },
    { title:'TDS and declaration changes to review', items:['Section 194T partner remuneration TDS.','Revised thresholds/rates where notified.','Form 121 transition if applicable.','Payroll and vendor master updates.'] }
  ],[{q:'Do I file under old Act for FY 2025-26?',a:'Use the return form and law applicable to that assessment year; check portal instructions.'},{q:'What happens to 80C investments?',a:'Existing eligible investments remain relevant through mapped provisions, subject to regime and year rules.'},{q:'Does new Act change GST?',a:'No. GST is a separate law.'}],['income-tax-slab-rates-guide','income-tax-new-regime-deductions','old-vs-new-tax-regime','itr-filing-services'],'tax'),

  p('form-121-self-declaration-guide','Help guide','Form 121 - New Self-Declaration Replacing 15G and 15H | WorkIndex','Form 121 self-declaration guide for avoiding TDS where eligible. Understand transition from Form 15G/15H, income estimates and deductor communication.','Form 121 Self-Declaration','One declaration workflow for TDS exemption checks','Form 121-style self-declaration workflows require correct estimated income. Wrong declarations can create tax, interest and penalty problems.',[
    { title:'What Form 121 is meant to solve', body:'The new self-declaration framework aims to reduce duplicate 15G/15H style submissions and align deductors with income-tax portal data. Taxpayers should verify current portal availability and deductor instructions before relying on it.' },
    { title:'Who should review applicability', items:['Senior citizens with FD interest.','Individuals with total income below taxable limit.','EPF withdrawal cases where TDS can apply.','Dividend or interest recipients with no final tax payable.','Taxpayers with multiple deductors.'] },
    { title:'Process to expect', steps:[{title:'Estimate annual income',body:'Include salary, pension, interest, rent, capital gains and other income.'},{title:'Check tax liability',body:'Declaration is only safe where conditions are met.'},{title:'Submit declaration',body:'Use the prescribed portal/deductor route.'},{title:'Share reference',body:'Give deductor acknowledgement/reference where required.'}] },
    { title:'Common mistakes', items:['Assuming last year declaration continues.','Declaring below actual income.','Forgetting multiple banks/deductors.','Ignoring AIS/Form 26AS after TDS deduction.'] }
  ],[{q:'Is Form 121 mandatory if income is below threshold?',a:'If TDS would otherwise apply, declaration may help avoid deduction; check current portal and deductor process.'},{q:'Can I use it for PF withdrawal?',a:'Applicability depends on withdrawal facts and prescribed forms.'},{q:'What if I forget and TDS is deducted?',a:'Claim credit in ITR if eligible.'}],['itr-filing-for-pensioners','form-16-download-help','tds-filing-services','income-tax-refund-delay-help'],'tax'),

  p('section-43b-payment-deadline-help','Informational help','Section 43B - Payment Deadline for Deductions | WorkIndex','Understand Section 43B payment rules for PF, ESI, interest, government dues and MSME vendor payments before claiming deductions.','Section 43B Deductions','Pay before due date or lose deduction','Section 43B can disallow expenses that are booked in accounts but not actually paid within the permitted time.',[
    { title:'Section 43B overrides accrual', body:'Certain expenses are deductible only when actually paid. If unpaid by the relevant due date, the deduction can be disallowed and added back to taxable income.' },
    { title:'Expenses covered', items:['Employer PF/ESI and welfare fund contributions.','Interest payable to banks/financial institutions/government.','Government duties, cess and taxes.','Leave encashment, bonus and commission where applicable.','MSME vendor payments under the 2023 amendment framework.'] },
    { title:'MSME payment rule', items:['Registered MSME vendor payments should be tracked separately.','15-day or 45-day rule depends on written agreement and MSMED Act limits.','Disallowed amount may reverse in year of actual payment.','Vendor Udyam status must be captured before year-end.'] },
    { title:'Before ITR due date check', items:['Unpaid statutory dues.','Overdue MSME vendors.','Loan interest arrears.','Bonus/commission provisions.','Tax audit reporting impact.'] }
  ],[{q:'What is 43B MSME rule?',a:'It restricts deduction for delayed payment to registered MSME vendors beyond permitted timelines.'},{q:'Can PF arrears paid after March 31 be claimed?',a:'It depends on due dates and actual payment timing.'},{q:'Does 43B apply to proprietorship?',a:'Yes, if the covered expense exists.'}],['esi-pf-compliance-services','msme-udyam-registration-services','itr-filing-for-business-owners','tax-audit-applicability'],'tax'),

  p('sovereign-gold-bond-tax-guide','Informational','Sovereign Gold Bond Tax Treatment 2026 | WorkIndex','Tax treatment for Sovereign Gold Bonds in India. Interest, maturity redemption, premature exit, exchange sale and capital gains reporting explained.','Sovereign Gold Bond Tax Guide 2026','Redemption, premature exit and interest income','SGB taxation depends on whether bonds are held to RBI redemption, prematurely redeemed, or sold on exchange. Do not assume every exit is tax-free.',[
    { title:'SGB tax treatment needs exit-type review', body:'SGB interest is taxable at slab rate. Capital gains treatment differs between redemption by individual on maturity, premature RBI exit and market sale. Recent law changes and bond issue terms should be checked before filing.' },
    { title:'Tax treatment breakdown', items:['Annual interest is taxable as income from other sources.','RBI redemption by eligible individual may have specific exemption treatment under applicable law/issue terms.','Premature exit needs capital gains and indexation review.','Exchange sale before maturity is taxed like a transfer of security.'] },
    { title:'What investors should do', items:['Track SGB tranche and issue date.','Collect RBI redemption statement or broker contract note.','Include interest in ITR even if TDS not deducted.','Plan advance tax if gains are large.'] }
  ],[{q:'Is SGB interest taxable?',a:'Yes, SGB interest is generally taxable at slab rate.'},{q:'Is maturity redemption always taxable?',a:'No. It depends on holder type, redemption mode and law applicable to the tranche/year.'},{q:'How is exchange sale taxed?',a:'It is generally treated as transfer and capital gains rules apply.'}],['capital-gains-tax-services','itr-filing-for-capital-gains','section-54-capital-gains-exemption-help','income-tax-slab-rates-guide'],'tax'),

  p('fno-trading-tax-guide','Segment informational','F&O Trading Tax Guide India 2026 | WorkIndex','How F&O income is taxed in India. Business income treatment, audit threshold, STT, ITR-3, advance tax and loss carry-forward.','F&O Trading Tax Guide 2026','Business income, STT and audit threshold','F&O income is generally treated as business income, not capital gains, which changes ITR form, audit, loss and advance-tax treatment.',[
    { title:'F&O income is business income', body:'Futures and options trading is generally treated as non-speculative business income under tax law. It is usually reported in ITR-3 with books or trading statements, not as ordinary capital gains.' },
    { title:'STT and transaction cost correction', body:'The briefed STT rates were understated. From the current post-amendment framework, options and futures STT rates are higher than pre-2024 levels and active traders should use broker statements instead of manual assumptions.' },
    { title:'Tax treatment and thresholds', items:['Turnover is not net profit; it uses absolute profit/loss style calculations.','Audit depends on turnover, profit percentage and income facts.','Loss carry-forward requires timely return filing.','Advance tax applies where tax liability arises.'] },
    { title:'Documents required', items:['Broker P&L report.','Contract notes.','Ledger and bank statements.','AIS entries and STT data.','Advance-tax challans.'] }
  ],[{q:'Can F&O loss offset salary?',a:'No, business loss cannot be set off against salary income.'},{q:'Is audit mandatory in F&O loss?',a:'It depends on turnover, profit declaration, income level and audit rules.'},{q:'Do F&O traders pay advance tax?',a:'Yes where tax liability exceeds advance-tax threshold.'}],['itr-filing-for-stock-market-traders','itr-filing-for-crypto-traders','capital-gains-tax-services','tax-audit-applicability'],'tax'),

  p('fssai-registration-services','Service hub','FSSAI Registration and License Services | WorkIndex','Get FSSAI Basic Registration, State License or Central License for your food business. Documents, FoSCoS process, renewal and compliance explained.','FSSAI Registration and License Services','Basic, State and Central license for food businesses','Food businesses need FSSAI registration or licence before operating, from home bakers and cloud kitchens to manufacturers and importers.',[
    { title:'Every food business needs FSSAI category review', body:'The right category depends on turnover, activity, manufacturing, storage, import/export, number of states and food category.' },
    { title:'Three broad categories', table:{headers:['Category','Typical business','Notes'],rows:[['Basic Registration','Petty food business / low turnover','Simpler Form A process.'],['State License','Restaurants, processors, retailers within turnover band','Form B and state fee/documents.'],['Central License','Large turnover, importers, multi-state operators','More documents and longer review.']] } },
    { title:'Situations this page is built for', items:['New restaurant or cloud kitchen.','Home baker applying first FSSAI.','Food seller on Swiggy/Zomato.','Manufacturer expanding to multiple states.','Renewal before expiry.'] },
    { title:'Documents required', items:['Owner ID and address proof.','Premises proof.','Food category description.','Form A or B.','Manufacturing layout/equipment list if applicable.','Water test report where applicable.'] }
  ],[{q:'Does home food business need FSSAI?',a:'Yes, food businesses generally need appropriate FSSAI registration/licence.'},{q:'How long does FSSAI take?',a:'Basic can be faster; State/Central licences can take longer with inspections/queries.'},{q:'Can WorkIndex help FSSAI and GST together?',a:'Yes. Post food category, turnover and state.'}],['business-registration','msme-udyam-registration-services','for-restaurants','bookkeeping-for-restaurants'],'food'),

  p('shop-and-establishment-registration','Service hub','Shop and Establishment Registration | WorkIndex','Register under the Shops and Establishments Act in your state. Required for business premises, employees, bank account and labour compliance.','Shop and Establishment Registration','State labour registration for business premises','Shop Act registration is state-specific and often needed for premises, bank accounts, GST address support and employee compliance.',[
    { title:'State-specific but widely required', body:'Shops, offices, restaurants, studios, clinics and commercial establishments usually need registration under the state Shops and Establishments law.' },
    { title:'Why it matters', items:['Banks may ask for certificate for proprietorship current accounts.','GST officers may ask for address support.','Professional tax registration can rely on it.','Labour inspectors can penalise non-registration.','Certificate must often be displayed.'] },
    { title:'Situations this page is built for', items:['New shop, office, clinic or studio.','Proprietor opening current account.','Home business moved to commercial premises.','New state branch.','Change in owner, premises or business activity.'] },
    { title:'Documents required', items:['PAN and Aadhaar of owner.','Rent agreement, NOC or property proof.','Nature of business.','Employee count.','State-specific form and fee.'] }
  ],defaultFaqs,['business-registration','msme-udyam-registration-services','gst-registration-help','fssai-registration-services'],'company'),

  p('import-export-code-registration','Service hub','Import Export Code (IEC) Registration | WorkIndex','Get your IEC from DGFT for importing or exporting goods and services from India. Documents, process, annual update and cost explained.','Import Export Code Registration','One-time registration for import and export','IEC is the basic DGFT registration for import/export of goods and many trade benefits, with annual update requirements.',[
    { title:'IEC is gateway to international trade', body:'Any business importing/exporting goods generally needs IEC. Some service exporters need IEC for benefits or specific banking/compliance situations.' },
    { title:'Situations this page is built for', items:['New exporter/importer applying first IEC.','Business updating directors, address or bank.','Freelancer/service exporter checking IEC need.','IEC deactivated due to missed annual update.'] },
    { title:'Documents required', items:['Business PAN.','Aadhaar/passport of proprietor/director.','Establishment proof.','Cancelled cheque or bank certificate.','DSC or Aadhaar OTP access.'] },
    { title:'Process', steps:[{title:'Register on DGFT',body:'Create login and entity profile.'},{title:'Fill IEC application',body:'Add entity, address, bank and activity.'},{title:'Pay fee',body:'Submit prescribed fee online.'},{title:'Verify',body:'Use DSC or Aadhaar OTP as applicable.'},{title:'Update annually',body:'Keep IEC active every April-June window.'}] }
  ],[{q:'Does service exporter need IEC?',a:'Not always, but IEC may be needed for benefits or specific export compliance.'},{q:'Is IEC same as GST?',a:'No. IEC is DGFT trade code; GST is indirect tax registration.'},{q:'Can WorkIndex bundle IEC, LUT and refund?',a:'Yes. Mention goods/services export and current GST status.'}],['gst-lut-filing-services','gst-refund-for-exporters','for-import-export-businesses','itr-filing-for-import-export-businesses'],'company'),

  p('digital-signature-certificate-services','Service hub','Digital Signature Certificate (DSC) Services | WorkIndex','Get a Class 3 Digital Signature Certificate for GST, MCA ROC, income tax, DGFT, e-tendering and government portal filings in India.','Digital Signature Certificate Services','Class 3 DSC for GST, MCA, DGFT and e-tendering','DSC is needed for many company, GST, income-tax, DGFT and government tender workflows, especially for companies and LLPs.',[
    { title:'DSC is mandatory for several filings', items:['MCA/ROC forms for directors and companies.','GST registration for companies/LLPs.','DGFT/IEC filings.','Income tax returns for companies.','E-tendering and GeM/CPPP participation.'] },
    { title:'Situations this page is built for', items:['New director needs MCA filing DSC.','Proprietor/partner needs GST DSC.','Business joining government tenders.','DSC expired or token lost.','CA/CS needs professional filing DSC.'] },
    { title:'Documents required', items:['PAN card.','Aadhaar card.','Photo.','Video verification or Aadhaar eKYC.','Organisation documents for organisation DSC.'] },
    { title:'Types available', items:['Class 3 Individual.','Class 3 Organisation.','1-year or 2-year validity.','USB token-based signing.'] }
  ],[{q:'Class 2 vs Class 3 DSC?',a:'Class 3 is now the common standard for many official filings.'},{q:'Is Aadhaar OTP same as DSC?',a:'No. OTP/eSign and DSC are different mechanisms; portal rules decide what is accepted.'},{q:'Can WorkIndex help set up DSC workflow?',a:'Yes. Post portal and filing type.'}],['roc-annual-filing-services','director-din-kyc-services','import-export-code-registration','hire-company-secretary'],'company'),

  p('professional-tax-registration-services','Service hub','Professional Tax Registration Services | WorkIndex','Register for professional tax as an employer in Karnataka, Maharashtra, Telangana, Tamil Nadu and other states. Monthly and annual compliance explained.','Professional Tax Registration','Employer registration, deduction and monthly compliance','Professional tax is state-level payroll compliance. Employers need registration, deduction, payment and return filing by state.',[
    { title:'Professional tax is employer-level compliance', body:'Every employer in PT states should register and deduct PT from eligible employee salaries. Rates, due dates and return frequency differ by state.' },
    { title:'Situations this page is built for', items:['Startup hiring first employees.','Business expanding to new state.','Employer deducted PT but did not remit.','PF, ESI and PT setup needed together.','Annual or half-yearly PT return due.'] },
    { title:'Documents required', items:['Company PAN and GST/CIN if available.','Incorporation or establishment proof.','Office address proof.','Employee salary list.','Bank details.'] },
    { title:'State-wise compliance examples', items:['Karnataka monthly payment by state portal.','Maharashtra employer/enrolment process.','Telangana monthly payment.','Tamil Nadu half-yearly framework.','West Bengal slab-based compliance.'] }
  ],defaultFaqs,['esi-pf-compliance-services','payroll-processing-services','blog-professional-tax-india-guide','payroll-services-cost-india'],'payroll'),

  p('hire-wordpress-developer','Tech hire','Hire WordPress Developer India | WorkIndex','Find verified WordPress developers in India for business websites, WooCommerce stores, theme customisation, speed optimisation and maintenance.','Hire WordPress Developer India','Business websites, WooCommerce and speed optimisation','WordPress developers can build fast business websites, WooCommerce stores, LMS, directories and content-heavy sites with manageable cost.',[
    { title:'What WordPress developers build', items:['Business websites.','Blogs and news portals.','WooCommerce stores.','Membership and LMS sites.','Real estate listings and directories.','Landing pages and campaign sites.'] },
    { title:'Situations this page is built for', items:['Small business needs 5-10 page website.','Retailer wants WooCommerce store.','Slow WordPress site needs optimisation.','Hacked site needs cleanup.','Agency wants outsourced developer.'] },
    { title:'What to mention when posting', items:['New site or modification.','Page count and features.','Theme preference such as Elementor, Divi or Astra.','Product count and payment gateway.','Domain/hosting status.','Budget and timeline.'] },
    { title:'Typical pricing in India', items:['5-page site: Rs. 8,000-25,000.','WooCommerce store: Rs. 20,000-60,000.','Custom Figma theme: Rs. 30,000-1,00,000.','Maintenance: Rs. 3,000-10,000/month.'] }
  ],defaultFaqs,['web-developer-india','shopify-development-services','seo-friendly-website-development','ecommerce-website-development'],'tech'),

  p('hire-shopify-developer','Tech hire','Hire Shopify Developer India | WorkIndex','Find verified Shopify developers in India for D2C store setup, theme customisation, app integrations, Razorpay, Shiprocket and Shopify Plus.','Hire Shopify Developer India','D2C store setup, integrations and performance','Shopify developers help D2C brands launch, migrate, customise, integrate payments/shipping and improve conversion.',[
    { title:'What Shopify developers build', items:['New D2C stores.','Liquid theme customisation.','Razorpay, PayU and shipping integrations.','WooCommerce/Magento migrations.','Shopify Plus customisation.','Headless Shopify with React/Next.js.'] },
    { title:'Situations this page is built for', items:['First Shopify store.','Migration from WooCommerce or Magento.','Payment or shipping integration.','Performance/conversion issues.','COD, pincode serviceability and GST invoice needs.'] },
    { title:'What to mention when posting', items:['New store or migration.','Current platform.','Required apps.','Theme or Figma design.','Product catalogue size.','Shopify plan and India-specific requirements.'] },
    { title:'Typical pricing in India', items:['Basic store: Rs. 15,000-40,000.','Custom Figma theme: Rs. 40,000-1,50,000.','Large migration: Rs. 25,000-80,000.','Monthly retainer: Rs. 8,000-25,000.'] }
  ],defaultFaqs,['shopify-development-services','ecommerce-website-development','web-developer-india','gst-registration-for-ecommerce-sellers'],'tech'),

  p('hire-seo-expert-india','Hire page','Hire SEO Expert India | WorkIndex','Find verified SEO consultants in India for on-page SEO, technical SEO, link building, local SEO and Google ranking improvement.','Hire SEO Expert India','Rankings, traffic and technical SEO from verified experts','SEO experts improve crawlability, content, technical quality, local visibility and long-term organic traffic.',[
    { title:'What SEO experts do', items:['Keyword research and strategy.','On-page optimisation.','Technical SEO and Core Web Vitals.','Link building and digital PR.','Local SEO and Google Business Profile.','Ecommerce SEO and reporting.'] },
    { title:'Situations this page is built for', items:['New website has no organic traffic.','Business is stuck on page 2-3.','Ecommerce store needs product/category SEO.','Local business wants near-me rankings.','Rankings dropped after algorithm update.'] },
    { title:'What to mention when posting', items:['Website URL and niche.','Current traffic if known.','Competitors.','Target keywords.','Whether technical audit is needed.','Monthly or one-time budget.'] },
    { title:'Typical pricing in India', items:['Freelance SEO: Rs. 15,000-50,000/month.','Small agency: Rs. 20,000-80,000/month.','Technical audit: Rs. 10,000-40,000.','Link campaigns vary by quality and targets.'] }
  ],defaultFaqs,['seo-friendly-website-development','web-developer-india','business-website-development','hire-freelancers-india'],'tech'),

  p('hire-ui-ux-designer-india','Hire page','Hire UI/UX Designer India | WorkIndex','Find verified UI/UX designers in India for app design, website redesign, Figma prototypes, design systems and user research.','Hire UI/UX Designer India','Figma, design systems and user-centred product design','UI/UX designers turn rough ideas into usable screens, flows, prototypes and developer-ready design systems.',[
    { title:'What UI/UX designers do', items:['User research and personas.','Wireframes and information architecture.','Figma or Adobe XD UI design.','Clickable prototypes.','Design systems and components.','Mobile app and responsive web handoff.'] },
    { title:'Situations this page is built for', items:['Startup needs Figma before development.','Website/app redesign.','Developer needs product designer.','Company needs design system.','Agency needs design capacity.'] },
    { title:'What to mention when posting', items:['Mobile app, web app, website or design system.','Platform.','Brand/logo status.','Existing design files.','Developer handoff needs.','Budget and timeline.'] },
    { title:'Typical pricing in India', items:['Junior UI designer: Rs. 15,000-35,000/month.','Mid-level UX/UI: Rs. 40,000-80,000/month.','Senior product designer: Rs. 80,000-1,50,000/month.','10-15 screen app: Rs. 20,000-60,000.'] }
  ],defaultFaqs,['web-developer-india','react-developer-india','business-website-development','landing-page-development'],'tech'),

  p('hire-digital-marketing-expert-india','Hire page','Hire Digital Marketing Expert India | WorkIndex','Find verified digital marketing consultants in India for Google Ads, Meta Ads, social media, email marketing and growth strategy.','Hire Digital Marketing Expert India','Paid ads, social media, SEO and growth strategy','Digital marketing experts manage paid ads, campaign analytics, creative testing, email, WhatsApp, social and growth channels.',[
    { title:'What digital marketing experts handle', items:['Google Search, Display, Shopping and YouTube Ads.','Meta Ads.','LinkedIn Ads for B2B.','Email and WhatsApp marketing.','Social content strategy.','Influencer campaign management.','GA4 and attribution reporting.'] },
    { title:'Situations this page is built for', items:['D2C brand launching ads.','B2B SaaS needs LinkedIn leads.','Local business wants nearby customers.','Ecommerce brand scaling ad spend.','CAC too high and campaigns need optimisation.'] },
    { title:'What to mention when posting', items:['Current channels and ad spend.','Target audience.','Industry and product.','Creative availability.','KPI: ROAS, leads or awareness.','Retainer/ad spend budget.'] },
    { title:'Typical pricing in India', items:['Freelancer: Rs. 20,000-60,000/month.','Agency: Rs. 30,000-1,50,000/month plus ad-spend percentage.','Social-only: Rs. 15,000-50,000/month.'] }
  ],defaultFaqs,['hire-seo-expert-india','web-developer-india','business-website-development','hire-freelancers-india'],'tech'),

  p('blog-gst-2-impact-on-small-business','Blog','GST 2.0 Impact on Small Businesses in India | WorkIndex','How GST 2.0 rate changes affect small traders, manufacturers and service providers in India. Updated invoice requirements and compliance steps.','GST 2.0 Impact on Small Businesses','Rate changes, invoices and compliance actions','Small businesses need to translate GST 2.0 from headline rates into billing software, inventory, HSN mapping and customer pricing.',[
    { title:'What changed for common small businesses', items:['FMCG and essentials may have lower-rate impact.','Electronics and consumer goods categories need HSN review.','Most services need separate 18% review.','Insurance and exempt categories need invoice changes.'] },
    { title:'Immediate compliance actions', items:['Update accounting software rate mapping.','Reprogram billing/POS software.','Notify customers of price changes.','Review ITC ratio and working capital.','Check old quotes and contracts.'] },
    { title:'What did not change automatically', items:['GST registration threshold.','Composition scheme basics.','GSTR-1/3B filing logic.','E-invoicing applicability unless separately notified.'] }
  ],defaultFaqs,['gst-2-rate-changes-guide','gst-for-small-business','gst-filing-services','gst-qrmp-scheme-guide'],'gst'),

  p('blog-income-tax-act-2025-section-mapping','Blog','Income Tax Act 2025 - Old to New Section Mapping | WorkIndex','Map old Income Tax Act 1961 sections to new Income Tax Act 2025 clauses. Understand deduction and TDS reference transition.','Income Tax Act 2025 Section Mapping','Old references, new clauses and payroll transition','The new Act changes references, but taxpayers will keep seeing old section numbers on certificates, policies, payroll records and notices for some time.',[
    { title:'Why section numbers changed', body:'The new Act reorganises provisions for readability. Old sections from the 1961 Act are mapped into new clauses, but old-year filings and notices may continue to use old references.' },
    { title:'Common mappings to track', table:{headers:['Old reference','Topic','Action'],rows:[['80C','Savings and investments','Map through software/current form instructions.'],['24(b)','Home loan interest','Check old/new regime availability.'],['139','Return filing','Use new Act filing clause for FY 2026-27 onward.'],['194J','Professional fees TDS','Update vendor/payroll systems.'],['234A/B/C','Interest','Map in notices and computations.']] } },
    { title:'What documents may still reference old law', items:['PPF/LIC/ULIP certificates.','Form 16 and older salary declarations.','Bank TDS certificates.','Loan interest certificates.','Notices for earlier years.'] }
  ],defaultFaqs,['new-income-tax-act-2025-guide','income-tax-new-regime-deductions','itr-filing-services','hire-ca-online-india'],'tax'),

  p('blog-gst-notices-types-india','Blog','Types of GST Notices in India - What Each Means | WorkIndex','Complete guide to GST notices: ASMT-10, DRC-01, DRC-07, REG-17, REG-31 and how to respond.','Types of GST Notices in India','ASMT, DRC and REG notices explained','The first step in any GST notice response is identifying the form type, section, deadline and whether it is scrutiny, demand, cancellation or order.',[
    { title:'Common GST notices', table:{headers:['Notice/Form','Meaning','Urgency'],rows:[['ASMT-10','Scrutiny of returns','Reply with ASMT-11, usually within notice time.'],['DRC-01','Summary of SCN/demand','High; review tax, interest, penalty.'],['DRC-07','Summary of order','Appeal/recovery stage.'],['REG-17','Cancellation notice','Respond quickly.'],['REG-31','Suspension/cancellation-related action','Check GSTIN status.']] } },
    { title:'ASMT-10 response basics', items:['Log into GST portal.','Read exact objection.','Reconcile GSTR-1, 3B, 2B and books.','Reply with documents and working.'] },
    { title:'When CA is essential', items:['DRC-07 order already passed.','Section 74 fraud allegation.','Large ITC reversal.','Multiple years or high demand.'] }
  ],defaultFaqs,['gst-notice-reply-help','gst-demand-under-section-73-74','itc-reversal-help','gst-registration-cancelled-by-officer'],'gst'),

  p('blog-top-accounting-software-india-2026','Blog','Top Accounting Software in India 2026 - Tally, Zoho, QuickBooks Compared | WorkIndex','Compare top accounting software in India for 2026. Tally Prime, Zoho Books, QuickBooks, Vyapar, Busy, Marg and more.','Top Accounting Software in India 2026','Tally, Zoho, QuickBooks and retail tools compared','The right accounting software depends on GST, inventory, payroll, branch access, ecommerce, bank feeds and how your accountant works.',[
    { title:'Quick comparison', table:{headers:['Software','Best for','Cloud/Desktop'],rows:[['Tally Prime','Traditional Indian SMEs, CAs, GST/TDS','Desktop-first with connected features.'],['Zoho Books','Startups and cloud-first SMEs','Cloud.'],['QuickBooks','International-client workflows','Cloud.'],['Vyapar','Small retailers and mobile billing','Mobile/cloud.'],['Busy/Marg','Distribution, manufacturing, inventory','Desktop/enterprise-style.']] } },
    { title:'What to ask your CA', items:['Which software do you support daily?','Can it handle GST 2.0 rate changes?','Does it integrate with bank/ecommerce?','Does it support payroll/TDS?','Can reports be exported for audit?'] }
  ],defaultFaqs,['accounting-bookkeeping-services','virtual-cfo-for-startups','management-accounts-mis-reporting','accounting-services-cost-india'],'tax'),

  p('blog-partnership-vs-llp-vs-pvt-ltd','Blog','Partnership vs LLP vs Pvt Ltd - Which to Choose? | WorkIndex','Compare Partnership Firm, LLP, and Private Limited Company in India. Liability, compliance, taxation, investment readiness and conversion options.','Partnership vs LLP vs Pvt Ltd','Choose the right business structure','The right structure depends on liability, investment plans, compliance budget, credibility, taxation and whether founders need ESOP or external funding.',[
    { title:'Quick comparison', table:{headers:['Structure','Liability','Best for'],rows:[['Partnership','Partners personally liable','Small trusted partner businesses.'],['LLP','Limited liability','Professional/service partnerships.'],['Pvt Ltd','Limited liability, investor-ready','Startups seeking funding or ESOP.']] } },
    { title:'Decision factors', items:['Need external investment: Pvt Ltd usually fits.','Two-person professional practice: LLP often fits.','Small trading business: partnership or Pvt Ltd depending risk.','Personal asset protection: LLP or Pvt Ltd.'] },
    { title:'Conversion paths', items:['Partnership to LLP.','LLP to Pvt Ltd under company law process.','Pvt Ltd to LLP with tax/compliance review.'] }
  ],defaultFaqs,['llp-registration-services','opc-registration-services','company-registration-cost','faq-company-registration'],'company'),

  p('blog-gst-on-freelancers-india','Blog','GST for Freelancers in India - Complete Guide 2026 | WorkIndex','When freelancers need GST registration. Threshold, foreign client payments, LUT, invoice format, GSTR-1/3B and international earnings.','GST for Freelancers in India','Threshold, LUT and domestic versus export invoices','Freelancers should separate domestic services, export services, LUT, TDS, GST returns and income-tax reporting.',[
    { title:'GST threshold for freelancers', body:'Service threshold is commonly Rs. 20 lakh, with lower limits in some states and special cases. Gross receipts, including foreign clients, should be reviewed.' },
    { title:'Foreign client payments', items:['Export of service can be zero-rated if conditions are met.','LUT should be filed annually to export without IGST.','Payment receipt and place-of-supply proof matter.'] },
    { title:'Domestic freelancer invoicing', items:['Typically charge GST where registered and taxable.','Client TDS under income tax is separate from GST.','Keep invoices and bank receipts aligned.'] },
    { title:'GST 2.0 impact', body:'Most professional services remain standard-rate services; freelancers should not assume goods-rate rationalisation changes their service invoices.' }
  ],defaultFaqs,['gst-registration-for-freelancers','for-freelancers','gst-lut-filing-services','itr-filing-for-freelancers'],'gst'),

  p('blog-what-is-virtual-cfo','Blog','What is a Virtual CFO? India Guide 2026 | WorkIndex','What a virtual CFO does, when a startup or SME needs one, cost comparison vs full-time CFO, and what to look for when hiring a vCFO.','What is a Virtual CFO?','India guide for startups and SMEs','A virtual CFO gives part-time strategic finance support without the cost of a full-time CFO.',[
    { title:'What a virtual CFO does', items:['Monthly MIS and investor reporting.','Cash-flow and runway tracking.','Financial model maintenance.','Fundraising preparation.','ESOP and cap table support.','Audit coordination.','Compliance calendar.','Banking relationships.'] },
    { title:'vCFO versus full-time CFO', table:{headers:['Option','Typical cost','Best fit'],rows:[['Virtual CFO','Rs. 50,000-2,50,000/month','Seed to growth SMEs needing part-time finance leadership.'],['Full-time CFO','High annual CTC','Larger companies with daily strategic finance needs.']] } },
    { title:'When startup needs vCFO', items:['Investor asks for board pack.','Crossing Rs. 1 crore ARR.','First 10+ employees.','Planning funding round.','Banks request audited financials.'] }
  ],defaultFaqs,['virtual-cfo-services-india','virtual-cfo-for-startups','management-accounts-mis-reporting','for-startups'],'tax'),

  p('blog-how-to-hire-accountant-india','Blog','How to Hire an Accountant in India - CA vs Accountant Guide | WorkIndex','Difference between a CA and an accountant in India, when each is needed, what to check, pricing and red flags.','How to Hire an Accountant in India','CA vs accountant, pricing and red flags','Businesses often need both: an accountant for daily books and a CA for tax, audit, GST representation and statutory certification.',[
    { title:'CA versus accountant', table:{headers:['Role','What they do','Limit'],rows:[['CA','Audit, tax, GST representation, statutory certification','Higher fee; not always doing daily data entry.'],['Accountant','Bookkeeping, bank reconciliation, payroll data, MIS','Cannot sign statutory audit/tax reports.']] } },
    { title:'When you need CA specifically', items:['Statutory audit.','Tax audit.','Income tax notices.','GST assessments.','Transfer pricing.','ROC and certification work.'] },
    { title:'When accountant is sufficient', items:['Monthly bookkeeping.','Payroll processing.','Bank reconciliation.','MIS preparation.','GST data preparation.'] },
    { title:'Red flags', items:['No written scope.','Very low quote without seeing books.','No acknowledgement sharing.','Accountant claiming to sign statutory documents.'] }
  ],defaultFaqs,['hire-accountant-india','hire-ca-online-india','accounting-services-cost-india','how-to-hire-a-ca'],'tax'),

  p('web-developer-delhi','City service','Web Developer in Delhi NCR | WorkIndex','Find verified web developers in Delhi, Noida and Gurugram for business websites, React apps, WordPress and custom web development.','Web Developer in Delhi NCR','Websites, portals and ecommerce for Delhi NCR businesses','Delhi NCR demand spans government contractors, media, fashion, B2B services, fintech, consulting and edtech web platforms.',[
    { title:'Delhi NCR web development context', body:'Noida has IT product companies, Gurugram has fintech and consulting, and Delhi has media, events and government-facing businesses. Projects often need performance, lead generation and compliance awareness.' },
    { title:'Common project types', items:['Government contractor websites and tender portals.','Fashion ecommerce stores.','Media/news platforms.','B2B lead-generation websites.','Event company websites.','Edtech platforms.'] }
  ],defaultFaqs,['web-developer-india','web-developer-bangalore','react-developer-india','ecommerce-website-development'],'tech'),

  p('web-developer-mumbai','City service','Web Developer in Mumbai | WorkIndex','Find verified web developers in Mumbai for BFSI portals, media platforms, Shopify D2C stores and custom React or WordPress websites.','Web Developer in Mumbai','BFSI, media, D2C and high-traffic web projects','Mumbai web development is shaped by BFSI, media, entertainment, agencies, luxury brands and D2C ecommerce.',[
    { title:'Mumbai web development context', body:'Mumbai developers often work on financial portals, media platforms, campaign microsites, real estate websites, brand ecommerce and performance-critical marketing sites.' },
    { title:'Common project types', items:['Financial services and fintech apps.','Media and entertainment platforms.','Luxury and fashion D2C ecommerce.','Advertising campaign microsites.','Real estate project websites.'] }
  ],defaultFaqs,['web-developer-india','web-developer-bangalore','nodejs-developer-india','shopify-development-services'],'tech'),

  p('itr-filing-ahmedabad','City service','ITR Filing in Ahmedabad | WorkIndex','Find verified CAs for ITR filing in Ahmedabad for textile traders, diamond merchants, MSME owners, salaried professionals and NRIs with Gujarat assets.','ITR Filing in Ahmedabad','Tax filing for traders, MSMEs and families','Ahmedabad ITR work often includes business income, family wealth, HUFs, exports, capital gains and salaried professionals in pharma/chemical sectors.',[
    { title:'Ahmedabad tax context', body:'Ahmedabad has textile traders, diamond and jewellery merchants, chemical/pharma businesses, exporters and family-owned trading houses. ITRs may involve business books, HUFs, GST, capital gains and NRI property.' },
    { title:'Common customer types', items:['Textile and garment traders.','Diamond and jewellery merchants.','Chemical/pharma employees.','MSME exporters.','Family trading groups.','NRIs with Gujarat property/investments.'] }
  ],defaultFaqs,['gst-services-ahmedabad','accounting-services-ahmedabad','itr-filing-india','itr-filing-services'],'tax'),

  p('gst-services-ahmedabad','City service','GST Services in Ahmedabad | WorkIndex','Find verified GST consultants in Ahmedabad for GST registration, GSTR filing, export LUT, textile GST compliance and notice reply.','GST Services in Ahmedabad','Textile, export and trading GST support','Ahmedabad GST work includes textile HSN/rate classification, exporter LUT/refunds, chemical/pharma ITC and high-volume trading returns.',[
    { title:'Ahmedabad GST context', body:'Textile fabric versus garment classification, export LUT compliance, pharma/chemical ITC and trading GSTR-1 volume are common Ahmedabad issues. GST 2.0 makes HSN/rate review especially important.' },
    { title:'Popular GST needs', items:['Registration and monthly returns.','Textile rate and HSN review.','Export LUT and refund.','Notice response.','GSTR-1/GSTR-3B reconciliation.'] }
  ],defaultFaqs,['itr-filing-ahmedabad','accounting-services-ahmedabad','gst-2-rate-changes-guide','gst-services-bangalore'],'gst'),

  p('accounting-services-ahmedabad','City service','Accounting Services in Ahmedabad | WorkIndex','Find verified accountants in Ahmedabad for bookkeeping, GST, payroll, HUF accounts and financial compliance for textile, chemical and trading businesses.','Accounting Services in Ahmedabad','Trading, textile, export and family business accounts','Ahmedabad accounting often combines trading ledgers, textile margins, export records, HUF/family entities and multi-generation business reporting.',[
    { title:'Ahmedabad accounting context', body:'High-volume trading, textile cost accounting, BRC/FIRC reconciliation and family trust/HUF accounts are common. Businesses often need GST, bank finance statements and generational handoff planning.' },
    { title:'Common needs', items:['Monthly books and GST.','Textile/trading reconciliation.','Export accounting.','HUF/family accounts.','Payroll and financial statements.'] }
  ],defaultFaqs,['itr-filing-ahmedabad','gst-services-ahmedabad','accounting-services-bangalore','for-partnership-firms'],'tax'),

  p('gst-2-rate-correction-help','Problem help','GST Rate Correction After GST 2.0 | WorkIndex','Help for businesses that charged wrong GST rates after September 2025. Credit notes, GSTR-1 amendments, buyer ITC impact and notice response.','GST Rate Correction After GST 2.0','Wrong rate charged? Correct invoices and returns','Wrong rate after GST 2.0 can affect customer invoices, GSTR-1, buyer ITC, credit notes, pricing and notice risk.',[
    { title:'Why rate errors happened', body:'Businesses that did not update billing software, HSN mapping or price lists continued charging old rates after the rate transition. This can create overcharge, short payment or ITC mismatch.' },
    { title:'Situations this page is built for', items:['Charged old higher rate after transition.','Charged GST on exempt individual insurance.','Customer ITC mismatch due to invoice/GSTR-1 difference.','Department notice about wrong applicable rate.'] },
    { title:'How to correct', steps:[{title:'Identify invoices',body:'Filter by date, HSN and old rate.'},{title:'Issue notes',body:'Credit/debit note route depends on overcharge/undercharge.'},{title:'Amend GSTR-1',body:'Report correction in appropriate table/window.'},{title:'Coordinate ITC',body:'Customer may need reversal or adjustment.'},{title:'Respond to notice',body:'Attach notification and working.'}] }
  ],defaultFaqs,['gst-2-rate-changes-guide','gst-notice-reply-help','itc-reversal-help','gst-filing-services'],'gst'),

  p('income-tax-act-2025-transition-help','Problem help','Income Tax Act 2025 Transition Help | WorkIndex','Help for businesses and individuals facing Income Tax Act 2025 transition issues: section mapping, software mismatches and deduction migration.','Income Tax Act 2025 Transition Help','Section mismatches, software errors and deduction migration','The new Act transition can create confusion where old section numbers remain in certificates, payroll and notices while new forms use new references.',[
    { title:'Transition creates temporary confusion', body:'Old references may remain in investment certificates, Form 16 history and notices for earlier years. New forms/software may use new clauses. Both need to be mapped correctly.' },
    { title:'Situations this page is built for', items:['Employer TDS software uses old section references.','Defective return due to wrong deduction section.','PPF/ULIP certificate uses old section.','Notice references new section number.','Payroll/accounting software not updated.'] },
    { title:'Practical steps', items:['Cross-reference old and new section.','Update deduction declarations.','Verify tax software update.','File using correct return utility.','Respond with both old and new references where helpful.'] }
  ],defaultFaqs,['new-income-tax-act-2025-guide','itr-filing-services','hire-ca-online-india','tds-filing-services'],'tax'),

  p('stf-high-value-transaction-notice-help','Problem help','High Value Transaction Notice Help | WorkIndex','Help for income tax notices about high-value cash transactions, property purchases, FD, credit card spends or stock purchases reported in AIS.','High Value Transaction Notice Help','AIS mismatch, SFT transactions and source explanation','Banks, registrars, card companies and financial institutions report high-value transactions through SFT, which appear in AIS and can trigger queries.',[
    { title:'High-value transactions are reported', body:'SFT reporting covers specified cash deposits, property transactions, credit card payments, FD/mutual fund/share investments and other high-value activity.' },
    { title:'Common SFT entries', items:['Cash deposits above reportable threshold.','FD investments.','Credit card payments.','Property purchase.','Mutual fund/share/bond purchases.'] },
    { title:'Documents required', items:['AIS entry.','Source of funds proof.','Bank statements.','Loan/gift/sale documents.','Original ITR and prior-year savings records.'] },
    { title:'Process', steps:[{title:'Download AIS',body:'Identify exact SFT entry.'},{title:'Gather source proof',body:'Salary, loan, gift, savings, sale proceeds.'},{title:'Submit feedback',body:'Correct wrong AIS category if needed.'},{title:'Reply notice',body:'Upload explanation and evidence within deadline.'}] }
  ],[{q:'What is SFT?',a:'Statement of Financial Transactions reported by specified institutions to the tax department.'},{q:'Does every large transaction trigger notice?',a:'No, but mismatch with income increases risk.'},{q:'Can WorkIndex connect urgently?',a:'Yes. Post notice deadline, AIS entry and source documents.'}],['ais-mismatch-help','income-tax-scrutiny-help','income-tax-demand-notice-help','itr-notice-help'],'tax'),

  p('documents-required-for-fssai-registration','Documents','Documents Required for FSSAI Registration | WorkIndex','Complete checklist of documents for FSSAI Basic Registration, State License and Central License. FoSCoS portal submission requirements explained.','Documents Required for FSSAI Registration','Basic, State and Central license checklist','FSSAI documents depend on food activity, turnover, manufacturing, import/export and whether Basic, State or Central licence applies.',[
    { title:'Basic registration documents', items:['Owner photo ID.','Premises address proof.','Owner photograph.','Food category description.','Form A declaration.'] },
    { title:'State licence documents', items:['Basic documents plus detailed food business category.','Layout plan for processing unit.','Equipment list.','Form B.','Local body NOC where required.'] },
    { title:'Central licence documents', items:['State licence documents plus IEC for import/export.','States of operation.','CA turnover certificate.','DGFT/IE code details.','Form B central application.'] },
    { title:'Common rejection reasons', items:['Address mismatch.','Wrong food category.','Premises photo missing.','Wrong licence category selected.'] }
  ],defaultFaqs,['fssai-registration-services','documents-required-for-gst-registration','for-restaurants','bookkeeping-for-restaurants'],'food'),

  p('documents-required-for-iec-registration','Documents','Documents Required for IEC Registration | WorkIndex','Complete document checklist for Import Export Code registration with DGFT. Proprietorship, Pvt Ltd, LLP and partnership firm requirements listed.','Documents Required for IEC Registration','DGFT portal checklist for all entity types','IEC registration needs entity PAN, business address, bank details and authorised person verification. Entity type changes the supporting documents.',[
    { title:'Common documents', items:['Business PAN.','Address proof.','Cancelled cheque or bank certificate.','Mobile and email for OTP.','Aadhaar for proprietor eKYC where applicable.'] },
    { title:'Entity-specific documents', items:['Proprietorship: proprietor PAN/Aadhaar and business proof.','Partnership: deed and partner KYC.','LLP: incorporation certificate and LLP agreement.','Pvt Ltd: COI, MOA/AOA, director KYC and board resolution.','Trust/Society: registration and trustee details.'] },
    { title:'After IEC is issued', items:['Annual update in April-June.','Link IEC with GSTIN if exporting goods.','Register DSC on DGFT where needed.','Keep certificate for shipments and bank.'] }
  ],defaultFaqs,['import-export-code-registration','gst-lut-filing-services','documents-required-for-gst-registration','for-import-export-businesses'],'company'),

  p('gst-interest-calculator','Calculator','GST Interest Calculator | WorkIndex','Calculate GST interest on late tax payment, ITC reversal interest and Section 50 interest for GSTR-3B delays.','GST Interest Calculator','Late payment, ITC reversal and Section 50 interest','GST interest is usually calculated day-wise on unpaid tax or wrongly availed/utilised ITC, depending on the issue.',[
    { title:'Calculator widget concept', body:'Inputs: unpaid tax amount, due date, payment date, interest type. Output: days of delay, interest at 18% or 24% as applicable, principal plus interest.' },
    { title:'Formula used', table:{headers:['Case','Indicative rate','Formula'],rows:[['Late tax payment','18% p.a.','Tax x days x 18% / 365'],['Wrongly availed/utilised ITC','24% p.a. in specified cases','Amount x days x 24% / 365']] } },
    { title:'When interest applies', items:['Late GSTR-3B payment.','Short payment discovered later.','ITC reversed late.','Audit or annual return reconciliation.'] },
    { title:'How to pay', body:'Interest may be paid through GST cash ledger or DRC-03 depending on context and portal workflow.' }
  ],defaultFaqs,['gst-late-fee-calculator','late-gst-filing-penalty-help','gst-filing-services','itc-reversal-help'],'gst'),

  p('tds-rate-chart-2026-27','Reference guide','TDS Rate Chart FY 2026-27 | WorkIndex','Complete TDS rate chart for FY 2026-27 under the Income Tax Act 2025. Sections, rates, thresholds and Section 194T for partners.','TDS Rate Chart FY 2026-27','Rates, thresholds and new partner TDS checks','TDS rates should be checked every year because thresholds, forms and sections change through budgets and the new Act transition.',[
    { title:'Common TDS chart format', table:{headers:['Payment','Common section/reference','Rate/threshold note'],rows:[['Salary','192','Slab-based after declarations.'],['Contractor','194C','Rate differs by payee type.'],['Professional fees','194J','Threshold/rate should be checked for year.'],['Rent','194I/194IB','Asset/payee type matters.'],['Partner remuneration','194T','Newer partner-payment TDS rule.']] } },
    { title:'Key 2026-27 checks', items:['Section 194T partner remuneration.','Form 121 declaration impact.','No PAN higher-rate rules.','New Act section mapping.','Vendor master PAN and threshold tracking.'] }
  ],defaultFaqs,['tds-filing-services','tds-calculator-india','new-income-tax-act-2025-guide','form-121-self-declaration-guide'],'tax'),

  p('section-194t-partner-tds-guide','Informational','Section 194T - TDS on Partner Salary and Remuneration | WorkIndex','New Section 194T: TDS on salary, bonus, commission and interest paid by partnership firms to partners. Threshold, rate and compliance.','Section 194T - Partner TDS','TDS on partner salary, interest, bonus and commission','Partnership firms must review partner payments for TDS applicability, agreement clauses and Form 26Q reporting.',[
    { title:'What Section 194T covers', items:['Salary/remuneration to partner.','Bonus or commission.','Interest paid to partner.','Threshold and rate as notified for the year.','Partnership and LLP payment workflow review.'] },
    { title:'What firms must do now', items:['Update partnership deed/payment classification.','Track annual partner-wise payment.','Deduct TDS where threshold applies.','Deposit challan.','Report in Form 26Q.','Issue TDS certificate.'] },
    { title:'Common mistakes', items:['Treating partner payments like owner drawings.','Missing interest payment TDS.','No PAN in partner master.','Not updating accounting software.'] }
  ],defaultFaqs,['tds-filing-services','itr-filing-for-partnership-firms','for-partnership-firms','tds-rate-chart-2026-27'],'tax'),

  p('for-interior-designers','Segment','Tax and Accounting for Interior Designers in India | WorkIndex','GST, ITR and bookkeeping for interior designers. Works contract vs pure service, TDS, material split and advance tax planning.','Tax and Accounting for Interior Designers','Design fees, material supply and project accounting','Interior designers may provide pure design services or composite material-plus-service contracts, and tax treatment changes accordingly.',[
    { title:'GST and income-tax treatment', items:['Pure design service is usually standard service rate.','Material plus design can move into works-contract/composite supply review.','Professional receipts may use 44ADA if eligible.','Corporate clients may deduct TDS under 194J.'] },
    { title:'Bookkeeping needs', items:['Project-wise advances.','Material purchases.','Vendor/subcontractor bills.','Milestone revenue recognition.','Travel and site expense records.'] },
    { title:'Questions before hiring', items:['Do you handle interior/project accounting?','Can you split design fee and material supply?','Will you compare 44ADA and actual expenses?'] }
  ],defaultFaqs,['for-freelancers','itr-filing-for-freelancers','gst-registration-for-contractors','bookkeeping-for-freelancers'],'tax'),

  p('for-photographers','Segment','Tax and Accounting for Photographers in India | WorkIndex','GST, ITR and bookkeeping for wedding, commercial and stock photographers. TDS, equipment depreciation, travel deductions and registration.','Tax and Accounting for Photographers','Shoots, royalties, equipment and GST','Photographers need records for shoot fees, advances, editing, equipment depreciation, travel, TDS and GST threshold.',[
    { title:'Tax and GST basics', items:['Photography service is generally taxable service if registered.','GST threshold for services should be monitored.','Corporate clients may deduct TDS.','ITR can use 44ADA or actual expenses where eligible.'] },
    { title:'Expenses and documents', items:['Camera/lens purchase invoices.','Editing software subscriptions.','Travel and accommodation bills.','Client contracts and advances.','Stock photo royalty statements.','Bank and UPI receipts.'] },
    { title:'Common mistakes', items:['Not depreciating equipment.','Mixing personal travel with shoot travel.','Missing TDS credits.','Ignoring GST after crossing threshold.'] }
  ],defaultFaqs,['for-freelancers','itr-filing-for-freelancers','gst-registration-for-freelancers','bookkeeping-for-freelancers'],'tax'),

  p('bookkeeping-for-construction','Niche bookkeeping','Bookkeeping for Construction Companies | WorkIndex','Bookkeeping for construction companies and civil contractors. Project P&L, WIP, subcontractor TDS, GST split, retention and RA bill reconciliation.','Bookkeeping for Construction','Project-wise P&L, WIP and RA bill reconciliation','Construction bookkeeping must track each project separately, with WIP, RA bills, retention, subcontractors, material and GST treatment.',[
    { title:'Scope of construction bookkeeping', items:['Project-wise P&L.','WIP accounting.','Subcontractor TDS under 194C.','Material versus labour split.','Retention money.','Equipment hire.','RA bill reconciliation.'] },
    { title:'Documents needed', items:['Contracts.','RA bills.','Subcontractor invoices.','Material GRNs.','TDS certificates.','Vehicle/equipment hire records.'] },
    { title:'Avoid these issues', items:['Cash accounting.','Missed subcontractor TDS.','Wrong GST rate on composite/labour-only contracts.','No retention tracking.'] }
  ],defaultFaqs,['accounting-for-construction','gst-registration-for-contractors','tds-filing-services','for-small-businesses'],'gst'),

  p('gst-services-kolkata','City service','GST Services in Kolkata | WorkIndex','Find verified GST consultants in Kolkata for trading, tea, jute, IT, real estate and GST notice compliance.','GST Services in Kolkata','Trading, commodity and service GST support','Kolkata GST work often includes Burrabazar trading accounts, tea and jute export compliance, Salt Lake/New Town IT services and real estate projects.',[
    { title:'Kolkata GST context', body:'Kolkata is a major commercial hub with high-volume trading, commodity businesses, IT services and real estate. GST needs often include GSTR-1 volume, export LUT/refunds, ITC reconciliation and notices.' },
    { title:'Common needs', items:['GST registration and returns.','Trading GSTR-1 reconciliation.','Export compliance for tea/jute.','IT service GST.','Notice response.'] }
  ],defaultFaqs,['itr-filing-kolkata','accounting-services-kolkata','gst-services-bangalore','gst-filing-services'],'gst'),

  p('itr-filing-kolkata','City service','ITR Filing in Kolkata | WorkIndex','Find verified CAs for ITR filing in Kolkata for traders, tea and jute businesses, IT employees, real estate investors and NRIs.','ITR Filing in Kolkata','Tax filing for traders, IT employees and commodity businesses','Kolkata ITR needs include trading income, commodity businesses, salary, rental income, capital gains and family business structures.',[
    { title:'Kolkata ITR context', body:'Kolkata has Burrabazar trading, jute/tea industries, Salt Lake/New Town IT employees and real estate development. Returns may combine salary, business, GST data, capital gains and rental income.' },
    { title:'Common customer types', items:['Traders and wholesalers.','Tea and jute business owners.','IT employees.','Real estate investors.','NRIs with Kolkata assets.'] }
  ],defaultFaqs,['gst-services-kolkata','accounting-services-kolkata','itr-filing-bangalore','itr-filing-services'],'tax'),

  p('accounting-services-kolkata','City service','Accounting Services in Kolkata | WorkIndex','Find verified accountants in Kolkata for bookkeeping, GST, payroll and compliance for trading, tea, jute, IT and real estate businesses.','Accounting Services in Kolkata','Trading, commodity and IT accounting support','Kolkata accounting work spans high-volume trading ledgers, tea/jute export records, IT payroll and New Town real estate project accounting.',[
    { title:'Kolkata accounting context', body:'Businesses in Kolkata often need commodity stock records, export documents, GST return reconciliation, payroll and financial statements for bank and tax use.' },
    { title:'Common service needs', items:['Monthly bookkeeping.','GST and TDS.','Commodity stock records.','Export BRC/FIRC.','Payroll and MIS.'] }
  ],defaultFaqs,['itr-filing-kolkata','gst-services-kolkata','accounting-services-bangalore','accounting-bookkeeping-services'],'tax'),

  p('audit-services-bangalore','City service','Audit Services in Bangalore | WorkIndex','Find verified audit firms in Bangalore for statutory audit, tax audit, internal audit and GST audit. Compare CA firms and get quotes.','Audit Services in Bangalore','Statutory, tax, internal and startup audits','Bangalore has high audit demand from startups, technology companies, funded businesses and manufacturing SMEs in Peenya and Bommasandra.',[
    { title:'Bangalore audit context', body:'Tech startups need investor-grade statutory audit, internal controls and diligence readiness. Manufacturing SMEs need tax audit, stock records and GST reconciliation.' },
    { title:'Audit services needed', items:['Statutory audit.','Tax audit.','Internal audit.','GST reconciliation audit support.','Startup due-diligence readiness.','Manufacturing stock and cost review.'] }
  ],defaultFaqs,['statutory-audit-services','audit-for-startups','audit-services-cost-india','accounting-services-bangalore'],'tax'),

  p('how-to-start-a-proprietorship-india','How-to','How to Start a Sole Proprietorship in India | WorkIndex','Step-by-step guide to starting a sole proprietorship in India. GST, Udyam, Shop Act, PAN and bank account steps explained.','How to Start a Sole Proprietorship in India','Simplest business structure, registrations and bank setup','A proprietorship is easy to start, but the business still may need GST, Udyam, Shop Act, FSSAI or other registrations based on activity.',[
    { title:'Why proprietorship', items:['No separate incorporation required.','Uses proprietor PAN.','Simple for small traders, freelancers and local businesses.','Lower compliance than company or LLP.'] },
    { title:'What you may still need', items:['PAN and Aadhaar.','GST if threshold/mandatory category applies.','Udyam for MSME benefits.','Shop Act for premises.','Current account.','FSSAI for food business.'] },
    { title:'Step-by-step', steps:[{title:'Start with PAN/Aadhaar',body:'Proprietor identity is the base.'},{title:'Check GST',body:'Review turnover and business model.'},{title:'Get Udyam',body:'Useful for MSME benefits.'},{title:'Register Shop Act',body:'Needed for premises in many states.'},{title:'Open bank account',body:'Use registrations as business proof.'}] },
    { title:'When to upgrade', items:['Need limited liability.','Need co-founders or investors.','Want ESOP or funding.','Business risk or turnover grows.'] }
  ],defaultFaqs,['business-registration','gst-registration-help','msme-udyam-registration-services','shop-and-establishment-registration'],'company'),

  p('documents-required-for-msme-udyam','Documents','Documents Required for Udyam Registration | WorkIndex','Complete checklist for MSME Udyam registration on the Udyam portal. Aadhaar, PAN, GSTIN, bank details and NIC code requirements explained.','Documents Required for Udyam Registration','Aadhaar, PAN, GSTIN and NIC checklist','Udyam registration is self-declaration based, but correct Aadhaar/PAN/GSTIN, bank and activity details prevent future mismatch.',[
    { title:'Core details required', items:['Aadhaar of proprietor/partner/director for OTP.','Business PAN.','GSTIN if registered.','Bank account details.','NIC activity code.','Investment and turnover self-declaration.'] },
    { title:'What you do not need', items:['No physical certificates in most cases.','No audited accounts for basic self-declaration.','No paid government fee.','No agent is mandatory if details are clear.'] },
    { title:'Process', steps:[{title:'Aadhaar OTP',body:'Verify authorised person.'},{title:'Enter business details',body:'PAN, GSTIN, address and activity.'},{title:'Self-declare',body:'Investment and turnover category.'},{title:'Download certificate',body:'Save Udyam certificate for bank/tender use.'}] },
    { title:'Updating Udyam', body:'Update when business details, turnover, investment or classification changes. Keep GST/PAN data consistent.' }
  ],defaultFaqs,['msme-udyam-registration-services','documents-required-for-msme-registration','gst-registration-help','shop-and-establishment-registration'],'company')
];

fs.mkdirSync(seoDir, { recursive: true });
const created = [];
for (const page of pages) {
  const file = path.join(seoDir, `${page.slug}.html`);
  fs.writeFileSync(file, render(page));
  created.push(`seo-pages/${page.slug}.html`);
}

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const page of pages) {
  const loc = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  if (!sitemap.includes(loc)) {
    sitemap = sitemap.replace('</urlset>', `  <url><loc>${loc}</loc><priority>0.74</priority><changefreq>monthly</changefreq><lastmod>${today}</lastmod></url>\n</urlset>`);
  }
}
fs.writeFileSync(sitemapPath, sitemap);

console.log(JSON.stringify({ created, count: created.length }, null, 2));
