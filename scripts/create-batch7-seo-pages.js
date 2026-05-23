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
  const upper = { gst: 'GST', itr: 'ITR', tds: 'TDS', tcs: 'TCS', itc: 'ITC', rcm: 'RCM', lut: 'LUT', hsn: 'HSN', sac: 'SAC', mca: 'MCA', rera: 'RERA', gem: 'GeM', nsic: 'NSIC', epfo: 'EPFO', posh: 'POSH', ind: 'Ind', as: 'AS', ca: 'CA', cfo: 'CFO', sme: 'SME', smes: 'SMEs', nris: 'NRIs', nri: 'NRI', rsu: 'RSU', rsus: 'RSUs', esop: 'ESOP', esops: 'ESOPs', fema: 'FEMA', ai: 'AI', ml: 'ML', aws: 'AWS', gcp: 'GCP', ay: 'AY', pan: 'PAN', bis: 'BIS', oidar: 'OIDAR', irn: 'IRN', qr: 'QR', ltcg: 'LTCG', stcg: 'STCG' };
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
  tax: [
    { label: 'Income Tax e-Filing portal', href: 'https://www.incometax.gov.in/iec/foportal/' },
    { label: 'Income Tax Department', href: 'https://www.incometaxindia.gov.in/' },
    { label: 'TRACES', href: 'https://www.tdscpc.gov.in/' }
  ],
  gst: [
    { label: 'GST portal', href: 'https://www.gst.gov.in/' },
    { label: 'GST Council', href: 'https://gstcouncil.gov.in/' },
    { label: 'CBIC GST', href: 'https://cbic-gst.gov.in/' }
  ],
  company: [
    { label: 'MCA portal', href: 'https://www.mca.gov.in/' },
    { label: 'GeM portal', href: 'https://gem.gov.in/' },
    { label: 'NSIC', href: 'https://www.nsic.co.in/' }
  ],
  labour: [
    { label: 'EPFO', href: 'https://www.epfindia.gov.in/' },
    { label: 'Ministry of Labour and Employment', href: 'https://labour.gov.in/' },
    { label: 'ESIC', href: 'https://www.esic.gov.in/' }
  ],
  tech: [
    { label: 'MDN Web Docs', href: 'https://developer.mozilla.org/' },
    { label: 'Google Search Central', href: 'https://developers.google.com/search' },
    { label: 'Python documentation', href: 'https://www.python.org/doc/' }
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

function renderSection(page, s) {
  return `<section class="wi-panel"><div class="lp-section-eyebrow">${esc(s.eyebrow || page.type)}</div><h2>${esc(s.title)}</h2>${s.html || (s.table ? table(s.table.headers, s.table.rows) : s.steps ? steps(s.steps) : s.items ? list(s.items) : `<p>${s.body}</p>`)}</section>`;
}

function render(page) {
  const canonical = `https://workindex.co.in/seo-pages/${page.slug}.html`;
  const refs = officialRefs[page.refType || 'tax'] || officialRefs.tax;
  const body = page.sections.map(s => renderSection(page, s)).join('');
  const common = [
    `${page.h1} depends on the assessment year or financial year, notification date, state, turnover, registration status, product or income classification, portal status and the exact documents available.`,
    `Use this as preparation guidance. Before filing, responding, registering, appealing, changing GST treatment or making tax decisions, share notices, DIN/ARN/order numbers, invoices, portal screenshots, dates and amounts with a qualified professional.`,
    `For recently changed law, ask the expert to identify the exact circular, notification, form instruction, portal advisory or statutory section they are relying on. Older search results often keep stale rates and thresholds online.`,
    `A strong WorkIndex quote should state scope, assumptions, records required, government fees, professional fees, timeline, exclusions, correction support and whether follow-up with a department or portal is included.`
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
<section class="wi-panel"><div class="lp-section-eyebrow">Expert Screening</div><h2>How to compare WorkIndex responses</h2>${list(['Ask whether the expert has handled this exact notice, form, registration, city, industry, assessment year or portal workflow before.', 'Confirm whether the quote includes filing only, advisory only, or also reconciliation, correction, drafting, hearing support and follow-up.', 'For urgent matters, include statutory deadline, notice or order date, current portal status and estimated financial exposure.', 'Prefer experts who ask for source records before final pricing instead of quoting blindly from only the page title.', 'Keep acknowledgements, challans, UDIN, computations, working papers, board documents and communication trail after completion.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Records Checklist</div><h2>Keep these ready before requesting quotes</h2>${list(['PAN, Aadhaar, GSTIN, TAN, CIN, LLPIN, IEC, DSC, Udyam, FSSAI, DIN, RERA, GeM, EPFO or other registration numbers as applicable.', 'Portal access or screenshots from Income Tax, GST, MCA, TRACES, EPFO, GeM, RERA, state drug authority or state labour portals.', 'Previous filings, acknowledgements, challans, certificates, orders, notices, audit reports and working papers.', 'Bank statements, invoices, contracts, payroll records, books export, cap table, product catalogue, HSN/SAC mapping, transaction reports or project documents relevant to the case.', 'A short written summary of what happened, what deadline exists, what help you need and whether support can be remote or must be local.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">WorkIndex Posting Tips</div><h2>How to get better quotes faster</h2>${list(['Mention whether you need one-time filing, urgent correction, registration, calculator review, audit, monthly retainer, appeal, technology build or advisory review.', 'Add transaction count, employee count, turnover range, city/state, pending years, notice deadline and software used so experts can size the work properly.', 'For tax notices, include section number, DIN, assessment year, response deadline, disputed amount and exact issue flagged.', 'For GST pages, share HSN/SAC, rate charged, invoice period, GSTR-1/3B/2B status and whether customers already claimed ITC.', 'For developer, design and content pages, share existing URL, scope, examples, integrations, budget range, timeline and maintenance expectation.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Questions People Ask</div><h2>FAQs</h2>${page.faqs.map(f => `<h3>${esc(f.q)}</h3><p>${f.a}</p>`).join('')}</section></div>
<aside class="wi-side"><div class="wi-panel"><h2>Post once, compare experts</h2><p>Share your requirement once and compare relevant WorkIndex experts by scope, price, timeline and profile strength.</p><a href="${ctaUrl}" class="lp-hero-cta" style="padding:12px 18px;font-size:14px">Get Expert Quotes</a></div><div class="wi-panel wi-related"><h2>Related pages</h2>${linkList(page.related)}</div><div class="wi-panel wi-ref"><h2>Official references</h2>${refs.map(r => `<a href="${r.href}" rel="nofollow">${esc(r.label)}</a>`).join('')}</div></aside></div></main>
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
  p('section-148a-notice-help','Problem help','Section 148A Notice Help - Income Escaping Assessment | WorkIndex','Help responding to Section 148A show cause notice for income escaping assessment. Deadline, documents, hearing process and strategy.','Section 148A Notice Help','Income escaping assessment - respond before the deadline','A Section 148A notice is the warning stage before reassessment. The response should address the exact material, not give a generic explanation.',[
    {title:'Section 148A is the pre-notice step',body:'Before issuing a Section 148 reassessment notice, the Assessing Officer normally gives an opportunity under Section 148A. Current Income Tax Department guidance states the 148A(b) show-cause time must be not less than 7 days and not more than 30 days, or further time if extended on application.'},
    {title:'Process step by step',items:['AO conducts inquiry or reviews information suggesting income escaped assessment.','AO issues 148A(b) notice with material or grounds.','Taxpayer files a point-wise response and evidence within the specified time.','AO passes order under 148A(d), either dropping the case or proceeding with Section 148 notice.']},
    {title:'Situations this page is built for',items:['Cash deposits, property purchase or investments not matching ITR.','NRI with Indian financial transactions.','Business turnover discrepancy.','High-value SFT/AIS entry.','148A response rejected and Section 148 notice received.']},
    {title:'Documents required',items:['148A notice with DIN and grounds.','ITR for relevant year.','AIS and Form 26AS.','Bank statements.','Source of funds proof such as salary, loan, gift deed or sale proceeds.','Earlier correspondence.']}
  ],[{q:'What is the difference between Section 148 and 148A?',a:'148A is the opportunity/show-cause stage before reassessment. Section 148 starts the reassessment proceeding if the officer decides to proceed.'},{q:'How many years back can it go?',a:'Time limits depend on assessment year, escaped income amount and current law. A CA should verify limitation before replying.'},{q:'What if I do not respond?',a:'The officer can pass an order based on available material and proceed ex parte.'}],['income-tax-scrutiny-help','income-tax-appeal-services','stf-high-value-transaction-notice-help','income-tax-demand-notice-help'],'tax'),

  p('income-tax-faceless-assessment-help','Problem help','Faceless Assessment Notice Help | WorkIndex','Help with income tax faceless assessment, online response, document upload, virtual hearing request and appeal strategy.','Faceless Assessment Notice Help','Online response, document upload and virtual hearing','Faceless assessment happens through the income-tax portal, so missing an e-Proceeding deadline can be as serious as ignoring a physical notice.',[
    {title:'Faceless assessment is portal-first',body:'Scrutiny notices, responses, show cause notices, hearings and orders are handled through the e-Proceedings workflow. The taxpayer generally does not meet the officer physically.'},
    {title:'Situations this page is built for',items:['Faceless scrutiny notice received.','Documents uploaded but response status unclear.','Show-cause notice proposing additions.','Assessment order passed and appeal needed.','Virtual hearing request needed for complex facts.']},
    {title:'Process',steps:[{title:'Open e-Proceedings',body:'Login and download every notice and annexure.'},{title:'Read query-wise',body:'Map each question to evidence.'},{title:'Upload response',body:'Use accepted file formats and submit, not just save draft.'},{title:'Track order',body:'Download acknowledgements and next notices.'}]},
    {title:'Common mistakes',items:['Not checking portal regularly.','Uploading wrong file format or oversized files.','Saving draft but not submitting.','Not requesting virtual hearing when needed.','Replying without reconciling AIS and books.']}
  ],defaultFaqs,['section-148a-notice-help','income-tax-scrutiny-help','income-tax-appeal-services','income-tax-demand-notice-help'],'tax'),

  p('section-80g-donation-deduction-guide','Info guide','Section 80G Donation Deduction Guide | WorkIndex','Claim Section 80G deduction for eligible donations. Form 10BE, 100% vs 50%, qualifying limit and ITR filing explained.','Section 80G Donation Deduction','100% or 50% deduction - know before you donate','80G deduction depends on the donee, payment mode, Form 10BE and tax regime. Donation receipt alone may not be enough.',[
    {title:'80G varies by organisation',items:['Some notified funds allow 100% deduction without qualifying limit.','Some institutions are subject to the 10% adjusted gross total income limit.','Many NGOs fall under 50% deduction subject to limit.','Company CSR donations need separate eligibility review.']},
    {title:'What changed from AY 2022-23 onward',items:['Donee institution files Form 10BD.','Donor receives Form 10BE.','Donation appears in AIS when correctly reported.','Cash donations above Rs. 2,000 are not eligible.','Old/unrenewed 80G registration can lead to disallowance.']},
    {title:'Regime note',body:'80G is generally an old-regime deduction for individuals. If you are in the new regime, check current ITR instructions before claiming.'},
    {title:'Documents required',items:['Form 10BE.','Receipt with PAN and 80G registration.','Bank proof.','Donation category.','CSR board approval where applicable.']}
  ],defaultFaqs,['for-trusts-and-ngos','accounting-for-ngo-trust','itr-filing-for-salaried-employees','income-tax-new-regime-deductions'],'tax'),

  p('tax-on-inheritance-india','Info guide','Tax on Inherited Property and Assets in India | WorkIndex','How inheritance is taxed in India. No inheritance tax, capital gains on sale, cost basis and gift-tax rules explained.','Tax on Inherited Property and Assets in India','No inheritance tax - but capital gains when you sell','Receiving inheritance is usually not taxed in India, but selling inherited property, shares, gold or funds can trigger capital gains.',[
    {title:'No inheritance tax, but sale can be taxable',body:'Estate duty was abolished decades ago. Inheriting an asset by will or succession is generally not taxable, but sale of that asset is taxable using the original owner holding period and cost rules.'},
    {title:'Inherited property capital gains',items:['Holding period generally includes original owner holding.','Cost is usually original owner cost or fair market value as on 1 April 2001 for older assets.','Rate and indexation treatment depend on sale date, taxpayer type and current law.','Section 54 or 54F may apply if conditions are met.']},
    {title:'Shares and mutual funds',items:['Holding period can include original owner period.','Listed equity grandfathering may apply for pre-31 January 2018 holdings.','Unlisted shares and foreign assets need separate rate and reporting review.']},
    {title:'Gift and family planning note',items:['Inheritance from relatives or by will is generally exempt.','Non-relative gifts can be taxable above threshold.','HUF partition has separate treatment.','Documentation of succession is critical.']}
  ],defaultFaqs,['capital-gains-tax-services','section-54-capital-gains-exemption-help','itr-filing-for-rental-income','itr-filing-for-capital-gains'],'tax'),

  p('income-tax-clearance-certificate','Service help','Income Tax Clearance Certificate | WorkIndex','Obtain income tax clearance certificate for emigration, foreign nationals, business closure or specific regulatory needs.','Income Tax Clearance Certificate','Required for emigration, business exits and regulatory filings','Tax clearance is needed only in specific situations, but when required it can block travel, exit or regulatory approval if pending demands exist.',[
    {title:'When tax clearance is required',items:['Certain persons leaving India with continuing Indian tax exposure.','Foreign nationals leaving India after assignment.','Specific regulatory or business closure requirements.','Cases where authorities ask for no-dues confirmation.']},
    {title:'Documents required',items:['PAN.','Last filed ITR acknowledgements.','Current-year income details.','Outstanding demand status.','Advance/self-assessment tax challans.','Passport, visa and travel/employment documents.']},
    {title:'Process',steps:[{title:'Clear filings',body:'File pending returns and update demand status.'},{title:'Pay dues',body:'Resolve open demand or obtain stay/clarification.'},{title:'Apply',body:'Approach portal/AO route as applicable.'},{title:'Receive certificate',body:'Keep certificate for specified purpose and validity.'}]},
    {title:'Common issues',items:['Old demand not visible to taxpayer until portal review.','Mismatch between AIS and filed income.','Foreign national payroll exit tax.','Business closure with unresolved GST/TDS.']}
  ],defaultFaqs,['itr-filing-for-nri','income-tax-demand-notice-help','fema-compliance-services','itr-filing-services'],'tax'),

  p('gst-audit-section-65-help','Service help','GST Department Audit - Section 65 Help | WorkIndex','Help with GST audit under Section 65. ADT-01 notice, document preparation, officer visit, audit findings and SCN response.','GST Department Audit Under Section 65','Officer visit, documents and post-audit SCN response','Section 65 audit needs preparation before officers arrive because books, returns, ITC and e-way bills must reconcile.',[
    {title:'Section 65 audit basics',body:'A departmental GST audit is initiated through FORM GST ADT-01. The officer audits records, returns, books and documents and later communicates findings. Discrepancies may lead to tax, interest, penalty or show-cause proceedings.'},
    {title:'Documents to prepare',items:['GSTR-1, GSTR-3B and GSTR-2B.','Sales, purchase, input and stock registers.','Bank statements.','E-way bill records.','RCM workings.','Annual financial statements.','Previous notices and audit reports.']},
    {title:'Common audit findings',items:['Blocked ITC.','Supplier cancelled or non-filing mismatch.','Books turnover higher than GST returns.','RCM not paid.','GSTR-1 and 3B discrepancy.','Export refund documentation gap.']},
    {title:'Process',steps:[{title:'Read ADT-01',body:'Confirm period and records requested.'},{title:'Reconcile',body:'Prepare books-return-ITC reconciliations.'},{title:'Attend audit',body:'Keep authorised person and records ready.'},{title:'Respond to findings',body:'Reply before demand escalates.'}]}
  ],defaultFaqs,['gst-notice-reply-help','gst-demand-under-section-73-74','itc-reversal-help','gst-annual-return-filing-gstr-9'],'gst'),

  p('gst-registration-for-jewellers','Segment service','GST for Jewellers and Gold Businesses | WorkIndex','GST rates and compliance for jewellers. Gold jewellery, making charges, diamonds, hallmarking, ITC and exchange transactions explained.','GST for Jewellers and Gold Businesses','Gold, making charges, diamonds and ITC rules','Jewellery GST needs product-wise billing, hallmarking records, stock control and careful treatment of old-gold exchange.',[
    {title:'Jewellery GST rate review',body:'Gold jewellery commonly attracts GST at 3%, while job work or making charges and precious-stone categories can require separate treatment. Because CBIC notifications control the rate, jewellers should map every HSN and invoice line rather than use a single blanket rate.'},
    {title:'Situations this page is built for',items:['Retail jeweller registering for GST.','Manufacturer supplying B2B.','Old gold exchange or buyback.','Custom order advance.','Diamond or precious-stone billing.','Hallmarking and invoice controls.']},
    {title:'Compliance needs',items:['GST invoice with HSN and rate.','Stock register by purity and item.','HUID/hallmarking records where applicable.','ITC chain for business purchases.','E-way bill where applicable.','Cash transaction monitoring.']},
    {title:'Documents required',items:['PAN/Aadhaar.','Premises proof.','Bank details.','Business type: retail/wholesale/manufacturing.','BIS/hallmarking details if relevant.']}
  ],defaultFaqs,['gst-filing-services','gst-2-rate-changes-guide','gst-hsn-code-finder','for-small-businesses'],'gst'),

  p('gst-for-rental-commercial-property','Niche guide','GST on Commercial Property Rent in India | WorkIndex','GST registration and compliance for commercial property landlords. Threshold, 18% rate, RCM on residential rent and tenant ITC explained.','GST on Commercial Property Rent','Threshold, rate, RCM and tenant ITC','Commercial rent can make a landlord GST-registrable even if they do not run a traditional business.',[
    {title:'Commercial rent threshold',body:'Commercial property rent is generally taxable if aggregate turnover crosses the GST threshold. Landlords should consider all taxable supplies, not one lease in isolation.'},
    {title:'Residential rent RCM twist',items:['Residential use by individual remains exempt in common cases.','GST-registered business renting residential premises for business may trigger RCM.','RCM ITC can be restricted depending on use and Section 17(5).','Commercial office/warehouse/shop rent is treated differently.']},
    {title:'Situations this page is built for',items:['Landlord crossing threshold.','Tenant wants GST invoice.','Residential flat rented to business.','Co-working operator.','Past rent without GST correction.']},
    {title:'Documents',items:['Property documents.','Rent agreements.','PAN/Aadhaar.','Bank statement.','Tenant GSTIN.','Past invoice and receipt records.']}
  ],defaultFaqs,['blog-gst-on-rent-india','gst-for-real-estate-developers','rcm-reverse-charge-help','for-rental-income-earners'],'gst'),

  p('gst-for-healthcare-hospitals','Niche segment','GST for Hospitals and Healthcare Providers | WorkIndex','GST rules for hospitals, clinics, nursing homes and healthcare businesses. Exempt clinical services, taxable supplies and ITC reversal explained.','GST for Hospitals and Healthcare Providers','Exempt services, taxable supplies and ITC reversal','Healthcare GST is exemption-heavy, but pharmacies, cafeteria, cosmetics, room packages and mixed taxable supplies can complicate ITC.',[
    {title:'Healthcare is exemption-first, not tax-first',body:'Clinical healthcare services by clinical establishments, authorised medical practitioners and paramedics are generally exempt. Diagnostic services also commonly fall within exempt healthcare treatment when supplied as clinical diagnostic services. Non-clinical services, pharmacy goods, cafeteria or cosmetic services need separate review.'},
    {title:'Mixed-supply situations',items:['Hospital with pharmacy.','Standalone diagnostics versus clinical package.','Cosmetic/beauty treatment.','Cafeteria or parking income.','Medical equipment purchase and ITC.','Rule 42 reversal for exempt plus taxable turnover.']},
    {title:'Documents required',items:['Clinic/hospital registration.','Service and revenue breakup.','Pharmacy sales records.','Equipment purchase invoices.','GST returns.','ITC reversal workings.']},
    {title:'Common mistakes',items:['Charging GST on exempt clinical consultation.','Claiming full ITC despite exempt output.','No revenue split between clinical, pharmacy and non-clinical.','Ignoring RCM on foreign tools/services.']}
  ],defaultFaqs,['gst-registration-for-doctors','for-doctors','bookkeeping-for-clinics','itc-reversal-help'],'gst'),

  p('gst-on-digital-services-india','Niche guide','GST on Digital Services in India - 2026 Guide | WorkIndex','GST treatment for digital services: OTT, gaming, app purchases, cloud storage, online ads and OIDAR rules.','GST on Digital Services in India','OTT, gaming, apps, cloud and OIDAR services','Digital GST depends on whether the supplier is Indian or foreign, whether the recipient is B2B or B2C, and whether OIDAR or RCM applies.',[
    {title:'Digital services to review',items:['OTT subscriptions.','App store purchases.','Cloud storage and SaaS.','Online advertising.','Software downloads.','Online gaming and platform fees.','OIDAR by foreign suppliers.']},
    {title:'OIDAR and RCM',items:['Foreign supplier to Indian non-business users may need OIDAR registration.','Indian GST-registered business buying foreign digital services often reviews RCM.','Google/Meta/AWS-style invoices need GSTIN and import-of-service treatment review.','ITC depends on business use and eligibility.']},
    {title:'Situations this page is built for',items:['Business paying foreign SaaS.','Online gaming platform.','App developer.','ITC on ads/cloud tools.','Foreign platform serving Indian users.']},
    {title:'Records',items:['Vendor invoices.','GSTIN on platform accounts.','Foreign currency payment proof.','RCM challans.','ITC ledger.','Customer location data.']}
  ],defaultFaqs,['gst-for-saas-companies','rcm-reverse-charge-help','gst-2-rate-changes-guide','gst-registration-for-startups'],'gst'),

  p('gem-registration-services','Service hub','GeM Registration Services | Government e-Marketplace | WorkIndex','Register on GeM portal to sell products and services to government buyers. Eligibility, documents, catalogues and bidding explained.','GeM Registration - Sell to the Government','Products, services and works contracts on government marketplace','GeM gives sellers access to government procurement, but registration quality, catalogue accuracy and compliance documents determine whether bids work.',[
    {title:'Who should register on GeM',items:['MSME manufacturers.','Service providers for IT, security, cleaning, logistics or catering.','DPIIT-recognised startups.','Consultants and professional service providers.','Resellers and OEMs with compliant catalogues.']},
    {title:'Documents required',items:['Business PAN.','GSTIN.','Udyam certificate where applicable.','Bank account.','Product/service specifications.','Certifications such as BIS/ISO where relevant.','Authorised signatory details.']},
    {title:'Process',steps:[{title:'Create seller profile',body:'Register and verify business identity.'},{title:'Add catalogue',body:'Upload accurate product/service details.'},{title:'Link documents',body:'GST/Udyam/bank and OEM/reseller status.'},{title:'Bid and manage orders',body:'Track L1, delivery, invoice and payment cycles.'}]},
    {title:'Common issues',items:['Wrong product specification.','Incomplete KYC.','No required certification.','Uncompetitive pricing.','Poor order fulfilment records.']}
  ],defaultFaqs,['msme-udyam-registration-services','fssai-registration-services','business-registration','startup-80iac-tax-exemption'],'company'),

  p('rera-registration-services','Service hub','RERA Registration Services | WorkIndex','Register real estate project or agent under RERA. State-wise process, documents, builder compliance and penalties explained.','RERA Registration Services','Builder project registration and real estate agent compliance','RERA registration is state-wise and must be handled before marketing or selling covered projects.',[
    {title:'Two RERA registrations',items:['Project registration before advertising or sale.','Agent registration before facilitating sale/purchase.','Ongoing quarterly updates for projects.','State portal compliance differs.']},
    {title:'Builder project documents',items:['Promoter KYC.','Land title deed.','Approved plan and layout.','Land-use permissions.','Architect/engineer/contractor details.','Escrow account details.','Project photos and declarations.']},
    {title:'Situations this page is built for',items:['New builder project.','Agent registration.','Buyer checking project registration.','Missed registration penalty.','Quarterly RERA update compliance.']},
    {title:'State authorities',items:['MahaRERA.','K-RERA.','TNRERA.','TGRERA.','DRERA and other state portals.']}
  ],defaultFaqs,['accounting-for-real-estate','gst-for-real-estate-developers','for-real-estate-agents','company-compliance-services'],'company'),

  p('drug-license-registration-services','Service hub','Drug License Registration Services | WorkIndex','Get drug license for pharmacy, medical store, wholesale distributor or manufacturer. Forms, documents and state authority process explained.','Drug License Registration','Retail pharmacy, wholesale and manufacturing licences','Drug licence is a sector registration: pharmacy, wholesale, e-pharmacy and manufacturing models have different licensing and pharmacist requirements.',[
    {title:'Main license types',items:['Retail pharmacy/medical store licence.','Wholesale drug distribution licence.','Manufacturing licence.','Loan licence or additional premises/amendment where applicable.','State-specific renewal and inspection.']},
    {title:'Situations this page is built for',items:['New pharmacy opening.','Wholesale distributor entering new state.','Hospital pharmacy setup.','E-pharmacy compliance.','Manufacturer expanding capacity.']},
    {title:'Documents required',items:['Owner/director KYC.','Premises proof and layout.','Registered pharmacist certificate.','Storage and cold-chain details.','Affidavit/appointment documents.','Business registration and GST.']},
    {title:'Process',steps:[{title:'Prepare premises',body:'Meet area, storage and pharmacist requirements.'},{title:'Apply to state authority',body:'Upload forms and documents.'},{title:'Inspection',body:'Drug inspector verifies premises and records.'},{title:'Licence grant',body:'Maintain registers and renew on time.'}]}
  ],defaultFaqs,['fssai-registration-services','shop-and-establishment-registration','for-doctors','business-registration'],'company'),

  p('epfo-registration-services','Service specific','EPFO Employer Registration Services | WorkIndex','Register for Employee Provident Fund as an employer. Mandatory threshold, documents, UAN generation and monthly ECR compliance.','EPFO Employer Registration','When mandatory, how to register and monthly compliance','PF registration becomes a monthly compliance engine, not a one-time certificate.',[
    {title:'When PF registration applies',body:'EPFO registration is generally mandatory when covered establishments reach 20 employees, with voluntary coverage possible earlier. Employee wage, excluded employee and contractor treatment should be reviewed before registration.'},
    {title:'Situations this page is built for',items:['Business crossed 20 employees.','Startup wants voluntary PF.','Contract/gig worker headcount confusion.','Employer registered but not filing ECR.','Employee PF transfer and UAN issues.']},
    {title:'Documents required',items:['Establishment PAN.','Owner/director Aadhaar.','Address proof.','Bank details.','Employee list with Aadhaar, DOB, DOJ and bank.','Salary register.','Shop Act or business registration.']},
    {title:'Process',steps:[{title:'Register establishment',body:'Get EPFO establishment code.'},{title:'Create UANs',body:'Link eligible employees.'},{title:'Run payroll',body:'Compute employer and employee contribution.'},{title:'File ECR',body:'Pay by monthly due date and maintain records.'}]}
  ],defaultFaqs,['esi-pf-compliance-services','payroll-processing-services','labour-law-compliance-services','professional-tax-registration-services'],'labour'),

  p('nsic-registration-services','Service hub','NSIC Registration Services for MSMEs | WorkIndex','NSIC registration for MSMEs under Single Point Registration Scheme. Tender benefits, EMD waiver, documents and process.','NSIC Registration for MSMEs','Government tender benefits and EMD waiver','NSIC registration can help MSMEs participate in government procurement, but it does not guarantee orders. Capability, pricing and tender fit still matter.',[
    {title:'Benefits to review',items:['Single Point Registration Scheme.','Earnest Money Deposit exemption in eligible tenders.','Tender document benefits where applicable.','Government procurement preference.','Vendor credibility for PSUs.']},
    {title:'Documents required',items:['Udyam registration.','Financial statements and ITRs.','CA certificate.','Machinery/equipment list.','Product/service specifications.','Bank solvency.','BIS/ISO certificates if available.']},
    {title:'Process',steps:[{title:'Apply online',body:'Create NSIC profile and pay fee.'},{title:'Document review',body:'Upload financial and business records.'},{title:'Inspection',body:'Premises and capability may be verified.'},{title:'Certificate',body:'SPRS certificate is issued and renewed periodically.'}]},
    {title:'Common issues',items:['Weak financials.','No technical certification.','Mismatch with Udyam activity.','No bank solvency.','Renewal missed.']}
  ],defaultFaqs,['msme-udyam-registration-services','gem-registration-services','financial-due-diligence-for-msme-loan','for-manufacturing-businesses'],'company'),

  p('ind-as-accounting-services','Service hub','Ind AS (Indian Accounting Standards) Compliance | WorkIndex','Ind AS adoption and compliance for listed companies, large unlisted companies and subsidiaries. Revenue, leases, financial instruments and ESOP accounting.','Ind AS Compliance Services','First-time adoption, revenue recognition and lease accounting','Ind AS conversion changes numbers, disclosures, systems and auditor expectations, not just note formatting.',[
    {title:'Who needs Ind AS review',items:['Listed companies.','Large unlisted companies crossing threshold.','Holding/subsidiary/associate of covered company.','IPO-preparing company.','Foreign group subsidiary requiring consolidation.','NBFC/banking/insurance roadmap cases.']},
    {title:'Key Ind AS areas',items:['Ind AS 115 revenue recognition.','Ind AS 116 leases.','Ind AS 109 financial instruments.','Ind AS 102 share-based payments.','Ind AS 12 deferred tax.','First-time adoption reconciliations.']},
    {title:'Documents required',items:['Last 3 years financials.','Fixed asset register.','Lease agreements.','ESOP documents.','Revenue contracts.','Investment portfolio.','Loan and derivative documents.']},
    {title:'Situations this page is built for',items:['Net worth threshold crossed.','Auditor flagged non-compliance.','IPO readiness.','Foreign consolidation.','CFO team needs implementation support.']}
  ],defaultFaqs,['statutory-audit-services','virtual-cfo-for-startups','esop-implementation-services','for-startups'],'tax'),

  p('forensic-accounting-services','Service hub','Forensic Accounting Services | WorkIndex','Forensic accounting and fraud investigation services in India. Employee fraud, vendor fraud, financial manipulation and litigation support.','Forensic Accounting Services','Fraud detection, investigation and litigation support','Forensic accounting follows money trails, preserves evidence and quantifies losses rather than issuing a routine audit opinion.',[
    {title:'Common use cases',items:['Employee cash or payroll fraud.','Vendor duplicates or fictitious vendors.','Revenue inflation or profit manipulation.','Partnership disputes.','Insurance loss quantification.','Hidden asset tracing.','Lender loan-diversion review.']},
    {title:'What forensic accountants do differently',items:['Chain of custody documentation.','Multi-year bank analysis.','Books versus external records.','Accounting software log review.','Benford/statistical analysis.','Litigation support and expert report.']},
    {title:'Situations this page is built for',items:['Business owner suspects fraud.','Investor distrusts portfolio company financials.','Lender suspects diversion.','Court or mediator needs financial tracing.','Partner dispute with missing funds.']},
    {title:'Documents required',items:['Books export.','Bank statements.','Vendor master.','Payroll records.','Contracts.','Email/software logs where available.','Board or dispute correspondence.']}
  ],defaultFaqs,['forensic-audit-services','due-diligence-services','internal-audit-for-startups','fema-compliance-services'],'tax'),

  p('itr-filing-for-stock-options-rsus','Segment service','ITR Filing for RSUs and ESOPs | WorkIndex','File ITR for RSUs and ESOPs from Indian or foreign companies. Perquisite tax, capital gains, Schedule FA and Form 67 explained.','ITR Filing for RSUs and ESOPs','Perquisite tax, capital gains and foreign tax credit','RSUs and ESOPs usually create two tax events: vesting/exercise and sale. Foreign plans add exchange-rate and disclosure complexity.',[
    {title:'Two taxable events',items:['At vesting/exercise: perquisite or salary tax on FMV less exercise price.','At sale: capital gains from FMV/cost basis to sale value.','Holding period and listing status decide STCG/LTCG.','Employer TDS may not cover sale-side tax.']},
    {title:'Foreign RSU complexity',items:['US or foreign parent stock.','Form 67 for foreign tax credit where applicable.','Schedule FSI/FA reporting.','USD to INR conversion by prescribed rates.','Multiple vesting lots and sale dates.']},
    {title:'Documents required',items:['Form 16 with perquisite breakup.','Vesting statements.','Sale confirmations.','Foreign tax paid certificate.','Broker account statement.','AIS and exchange-rate workings.']},
    {title:'Common mistakes',items:['Reporting vesting but not sale.','Using exercise price instead of FMV cost.','Missing Schedule FA.','Late Form 67.','Ignoring advance tax on large sale.']}
  ],defaultFaqs,['blog-esop-taxation-india','itr-filing-for-salaried-employees','capital-gains-tax-services','tcs-on-foreign-remittance-lrs'],'tax'),

  p('accounts-payable-receivable-services','Service hub','Accounts Payable and Receivable Management | WorkIndex','Outsource AP/AR management. Vendor payments, debtor follow-up, ageing reports, invoice processing and cash-flow control.','Accounts Payable and Receivable Management','Vendor payments, debtor follow-up and cash flow control','AP and AR management turns accounting from year-end recordkeeping into weekly cash-flow control.',[
    {title:'What AP/AR includes',items:['AP invoice receipt and validation.','PO/GRN/invoice matching.','Vendor reconciliation and payment scheduling.','AR invoice dispatch.','Overdue debtor follow-up.','Receipt posting.','Ageing reports and dashboards.']},
    {title:'Situations this page is built for',items:['Founder chasing payments personally.','Large overdue debtors.','Many vendors and no payment calendar.','MSME payment rule risk.','Outsourced accounts team needed.']},
    {title:'What to mention',items:['Monthly AP invoices.','Number of customers.','Payment terms.','Software used.','Primary pain: vendor disputes, overdue debtors or MSME compliance.','Whether GST/payroll are in scope.']},
    {title:'Reporting output',items:['Weekly debtor ageing.','Vendor payment calendar.','Cash-flow forecast.','Dispute list.','MSME overdue list.','Month-end AP/AR dashboard.']}
  ],defaultFaqs,['accounting-bookkeeping-services','payroll-processing-services','management-accounts-mis-reporting','section-43b-payment-deadline-help'],'tax'),

  p('taxation-for-smes-india','Service hub','Tax Advisory and Planning for SMEs | WorkIndex','Comprehensive tax advisory for Indian SMEs covering GST, income tax, TDS, payroll, MSME compliance and legal tax planning.','Tax Advisory and Planning for SMEs','GST, income tax, TDS and MSME compliance in one place','SME tax planning works best when GST, TDS, payroll, MSME rules, books and audit are reviewed together.',[
    {title:'SME compliance stack',items:['GST returns and ITC.','Income tax, advance tax and audit.','TDS deposits and returns.','Payroll, PF, ESI and PT.','MSME/Udyam and 43B payment rules.','ROC filings for companies.','Industry registrations such as FSSAI or Shop Act.']},
    {title:'Tax planning opportunities',items:['Presumptive versus books.','Depreciation and capital expenditure planning.','Working capital interest deduction.','MSME vendor payment discipline.','Correct ITC claims.','QRMP where suitable.','Employment-linked deductions where eligible.']},
    {title:'Situations this page is built for',items:['Fast-growing business.','Family business restructuring.','Multi-year notice.','Bank loan preparation.','Poor books causing audit pain.']},
    {title:'What to mention',items:['Business type.','Turnover.','Employees.','Current pain.','Entity type.','Pending notices or filings.']}
  ],defaultFaqs,['for-small-businesses','virtual-cfo-services-india','accounting-bookkeeping-services','compliance-calendar-india-2026-27'],'tax'),

  p('blog-how-to-read-gst-invoice','Blog','How to Read a GST Invoice - Mandatory Fields Explained | WorkIndex','Understand GST invoice fields: GSTIN, HSN/SAC, place of supply, GST rates, reverse charge, e-invoice IRN and QR code.','How to Read a GST Invoice','Mandatory fields and validity checks','A GST invoice is not valid just because it says GST. The fields decide ITC, rate, place of supply and audit trail.',[
    {title:'Mandatory fields to check',items:['Supplier GSTIN and legal name.','Recipient GSTIN for B2B.','Invoice number and date.','Place of supply.','HSN/SAC.','Taxable value.','CGST/SGST/IGST split.','Reverse charge indication.','IRN and QR code where e-invoice applies.']},
    {title:'Before paying an invoice',items:['Check supplier GSTIN active status.','Check rate and HSN/SAC.','Check place of supply.','Confirm it appears in GSTR-2B for ITC.','Match PO, GRN and contract.']},
    {title:'Common invalid invoice issues',items:['Wrong GSTIN.','Missing HSN/SAC.','Wrong tax split.','No IRN when e-invoice applies.','Supplier cancelled.','Invoice not reported in GSTR-1.']}
  ],defaultFaqs,['gst-e-invoicing-applicability','gst-hsn-code-finder','gst-filing-services','blog-gstr-1-vs-gstr-3b-difference'],'gst'),

  p('blog-income-tax-for-beginners-india','Blog','Income Tax Basics for Beginners in India | WorkIndex','Income tax basics for first-time filers: taxable income, slabs, deductions, TDS, AIS, ITR filing and consequences.','Income Tax Basics for Beginners in India','First-time filer guide','Income tax is easier when you separate income heads, deductions, TDS credits and return filing into a simple sequence.',[
    {title:'Who needs to file/pay',body:'Tax depends on income level, age, regime, deductions and whether filing is mandatory due to transactions, refunds, foreign assets or other conditions.'},
    {title:'Five heads of income',items:['Salary.','House property.','Profits and gains of business/profession.','Capital gains.','Other sources such as interest and dividends.']},
    {title:'Key concepts',items:['Tax slabs and rebate.','Old versus new regime.','Deductions and exemptions.','TDS and TCS credits.','AIS and Form 26AS.','Refund and demand.']},
    {title:'First-time checklist',items:['PAN and bank pre-validation.','Form 16.','AIS review.','Interest income.','Investment proofs.','Choose correct ITR form.','E-verify after filing.']}
  ],defaultFaqs,['itr-filing-for-salaried-employees','blog-what-is-tds-india','income-tax-slab-rates-guide','hire-ca-online-india'],'tax'),

  p('blog-gst-input-tax-credit-guide','Blog','GST Input Tax Credit (ITC) - Complete Guide 2026 | WorkIndex','How to claim GST input tax credit in India. Eligible and blocked credits, GSTR-2B matching, Section 17(5), reversal and mistakes.','GST Input Tax Credit Guide','Eligibility, blocked credits and reconciliation','ITC is the heart of GST cash flow, but it only works when invoices, suppliers, payment and GSTR-2B align.',[
    {title:'What ITC is',body:'Input tax credit lets a registered business reduce GST payable on sales by eligible GST paid on business purchases.'},
    {title:'Conditions to claim',items:['Valid tax invoice.','Goods or services received.','Supplier reported invoice.','ITC appears in GSTR-2B.','Tax paid by supplier.','Payment made within prescribed period.']},
    {title:'Blocked credits',items:['Motor vehicles in many cases.','Food, health club, beauty and employee benefit items.','Works contract for immovable property.','Personal use.','CSR and restricted items where current law blocks credit.']},
    {title:'Reversal scenarios',items:['Supplier cancelled or non-filing.','Payment overdue.','Rule 42 exempt/taxable ratio.','Wrong rate or ineligible expense.','Credit note received.']}
  ],defaultFaqs,['itc-reversal-help','gst-input-tax-credit-mismatch','gst-2-rate-changes-guide','gst-filing-services'],'gst'),

  p('blog-how-to-save-capital-gains-tax','Blog','How to Save Capital Gains Tax in India - 2026 Guide | WorkIndex','Legal ways to save capital gains tax in India. Section 54, 54F, 54EC, CGAS, equity threshold and loss harvesting.','How to Save Capital Gains Tax in India','Section 54, 54F, 54EC, CGAS and loss set-off','Capital gains tax planning is mostly about timing, asset type, holding period, exemption conditions and documentation.',[
    {title:'Asset and holding period first',body:'Short-term and long-term rules differ for property, listed equity, unlisted shares, debt funds, gold and crypto. Do not apply one rate to all gains.'},
    {title:'Common saving routes',items:['Section 54 for residential property sale reinvestment.','Section 54F for other asset sale with house investment.','Section 54EC bonds within 6 months, subject to limit.','Capital Gains Account Scheme before filing deadline where needed.','Tax-loss harvesting and set-off.','Use annual equity LTCG threshold where available.']},
    {title:'Common mistakes',items:['Missing six-month bond deadline.','Buying wrong number/type of houses.','Not depositing CGAS before due date.','Ignoring surcharge.','Treating crypto loss like normal capital loss.']}
  ],defaultFaqs,['capital-gains-tax-services','section-54-capital-gains-exemption-help','itr-filing-for-capital-gains','blog-crypto-tax-guide-india'],'tax'),

  p('blog-posh-compliance-guide-india','Blog','POSH Compliance for Employers in India - 2026 Guide | WorkIndex','POSH Act compliance for employers. Internal Committee, annual report, training, inquiry process and penalties explained.','POSH Compliance for Employers in India','Policy, committee, training and annual reporting','POSH applies broadly to workplaces. The Internal Committee requirement is generally triggered at 10 or more employees; smaller workplaces rely on the Local Committee mechanism.',[
    {title:'What POSH requires',items:['Workplace anti-sexual-harassment policy.','Internal Committee where employee threshold applies.','External member on committee.','Awareness and sensitisation.','Complaint inquiry process.','Annual reporting as applicable.']},
    {title:'Common startup mistakes',items:['No policy before hiring.','No external IC member.','No training records.','No annual report.','No documented inquiry procedure.','Assuming remote workers are outside scope.']},
    {title:'Penalty and risk',body:'Non-compliance can attract monetary penalty and reputational risk. Repeat or serious failures can affect licences and management liability depending on facts.'}
  ],defaultFaqs,['labour-law-compliance-services','esi-pf-compliance-services','for-startups','startup-compliance-checklist'],'labour'),

  p('blog-what-is-form-16a-16b-16c','Blog','Form 16, 16A, 16B, 16C - Differences Explained | WorkIndex','Understand Form 16 vs 16A vs 16B vs 16C. Who issues each, income covered and how to use them for ITR filing.','Form 16, 16A, 16B, 16C Explained','Salary, non-salary, property and rent TDS certificates','Different Form 16 series certificates represent different TDS events. Use them to reconcile Form 26AS, AIS and ITR schedules.',[
    {title:'Quick comparison',table:{headers:['Form','Issued by','Covers'],rows:[['Form 16','Employer','Salary TDS.'],['Form 16A','Deductor/client/bank','Non-salary TDS such as professional fees, contractor, interest, rent.'],['Form 16B','Property buyer','TDS on property purchase under 194-IA.'],['Form 16C','Tenant','Rent TDS under 194-IB.']]}},
    {title:'How to use in ITR',items:['Match TDS certificate with Form 26AS.','Report corresponding income under correct head.','Claim TDS credit only once.','Check PAN, amount and assessment year.']},
    {title:'Common issues',items:['TDS deducted but not deposited.','Wrong PAN.','Certificate not downloaded.','Income not reported though TDS appears.','Mismatch between AIS and return.']}
  ],defaultFaqs,['form-16-download-help','form-26qb-tds-on-property-help','tds-filing-services','itr-filing-for-salaried-employees'],'tax'),

  p('blog-accounting-for-beginners-india','Blog','Accounting Basics for Small Business Owners in India | WorkIndex','Simple accounting guide for small businesses. P&L, balance sheet, cash flow, bank reconciliation, GST accounting and hiring help.','Accounting Basics for Small Business Owners','Reports, reconciliation and GST accounting','Small-business accounting is not paperwork for tax season. It tells you profit, cash, dues and compliance status every month.',[
    {title:'Why accounting matters',items:['GST returns.','ITR and audit.','Bank loans.','Investor or partner reporting.','Pricing and margin decisions.','Cash-flow control.']},
    {title:'Five reports every business needs',items:['Profit and loss.','Balance sheet.','Cash flow.','Debtor ageing.','Creditor ageing.']},
    {title:'Monthly habits',items:['Bank reconciliation.','Invoice entry.','GST payable and ITC review.','Expense classification.','Stock or service WIP tracking.','Owner drawings separation.']},
    {title:'Software note',body:'Excel can start very small businesses, but Tally, Zoho, Busy, Vyapar or other software becomes useful once GST, inventory, payroll or multiple users are involved.'}
  ],defaultFaqs,['accounting-bookkeeping-services','blog-top-accounting-software-india-2026','blog-how-to-hire-accountant-india','accounting-services-cost-india'],'tax'),

  p('blog-new-labour-codes-india','Blog','New Labour Codes in India - What Employers Must Know | WorkIndex','India four labour codes explained: wages, industrial relations, social security, occupational safety, implementation status and payroll impact.','New Labour Codes in India','Wages, social security, IR and workplace safety','The four labour codes consolidate many old laws, but implementation depends on central and state notifications, so employers should prepare without assuming every rule is live in every state.',[
    {title:'Four codes overview',items:['Code on Wages.','Code on Social Security.','Industrial Relations Code.','Occupational Safety, Health and Working Conditions Code.']},
    {title:'Payroll impact areas',items:['Definition of wages.','PF and gratuity base.','Overtime and minimum wage.','Standing orders.','Gig and platform worker social security.','Working hours and safety registers.']},
    {title:'2026 implementation note',body:'Central laws exist, but state rules and enforcement timelines can vary. Multi-state employers should track state-specific adoption before changing payroll formulas.'}
  ],defaultFaqs,['labour-law-compliance-services','esi-pf-compliance-services','payroll-processing-services','blog-professional-tax-india-guide'],'labour'),

  p('for-aws-cloud-businesses','Segment','Tax and GST Compliance for Cloud and AWS Businesses | WorkIndex','GST, TDS and ITR compliance for AWS, GCP, Azure and cloud-heavy Indian businesses. RCM, ITC, SaaS exports and contracts.','Tax and GST Compliance for Cloud Businesses','RCM on cloud bills, ITC and SaaS exports','Cloud-first businesses often miss RCM on foreign tools even when their output invoices are GST-compliant.',[
    {title:'Cloud compliance areas',items:['RCM on AWS/GCP/Azure/Cloudflare where treated as import of services.','ITC on RCM if used for taxable output.','GSTR-3B Table 4A(3) review.','TDS on tech contracts.','Export SaaS with LUT.','Startup tax and DPIIT benefits.']},
    {title:'Documents',items:['Cloud invoices.','Credit card/bank payments.','GSTIN configured on accounts.','LUT.','Customer location data.','RCM challans.','ITC ledger.']},
    {title:'Common mistakes',items:['No RCM ledger.','Foreign vendor invoices not captured.','Using founder personal card.','No LUT before export invoices.','Wrong SAC.']}
  ],defaultFaqs,['gst-for-saas-companies','rcm-reverse-charge-help','for-saas-founders','startup-80iac-tax-exemption'],'gst'),

  p('for-medical-device-companies','Segment','Tax and Compliance for Medical Device Companies | WorkIndex','GST rates, CDSCO licensing, import compliance, ITC and income tax for medical device manufacturers and distributors.','Tax and Compliance for Medical Device Companies','GST, CDSCO, import and manufacturing compliance','Medical device businesses combine regulated product licensing, import documentation, GST rate classification and manufacturing accounting.',[
    {title:'Compliance areas',items:['GST rate classification by device.','CDSCO registration/licensing for device class.','Import-export code and customs.','ITC on raw materials and equipment.','TDS on foreign OEM or technical services.','Manufacturing tax and depreciation planning.']},
    {title:'Situations this page is built for',items:['Manufacturer launching device.','Importer of diagnostic equipment.','Distributor entering hospital supply.','Startup building healthcare hardware.','GST classification dispute.']},
    {title:'Documents',items:['Product catalogue.','CDSCO licence/status.','Import documents.','GST returns.','Vendor/OEM contracts.','BIS/quality certificates where applicable.']}
  ],defaultFaqs,['for-manufacturing-businesses','gst-for-healthcare-hospitals','drug-license-registration-services','import-export-code-registration'],'gst'),

  p('hire-python-ml-developer-india','Tech hire','Hire Machine Learning / AI Developer India | WorkIndex','Find verified ML and AI developers for model building, MLOps, LLM integration, computer vision and data science projects.','Hire ML / AI Developer India','Model building, LLM integration and MLOps','ML hiring succeeds when you define data availability, success metrics and deployment needs before asking for a model.',[
    {title:'What ML/AI developers build',items:['Predictive models.','Fraud/churn/demand forecasting.','LLM RAG systems and chatbots.','Computer vision and OCR.','Recommendation engines.','MLOps pipelines.','Exploratory data analysis and dashboards.']},
    {title:'What to mention',items:['Project type.','Data source and size.','Python/TensorFlow/PyTorch/scikit-learn/LangChain preference.','Cloud deployment.','Monitoring/MLOps needs.','Budget and timeline.']},
    {title:'Typical pricing',table:{headers:['Profile','Typical range'],rows:[['Junior data scientist','Rs. 25,000-55,000/month'],['Mid-level ML engineer','Rs. 60,000-1,20,000/month'],['Senior ML/LLM specialist','Rs. 1,20,000-2,50,000/month'],['LLM chatbot project','Rs. 60,000-3,00,000+']]}}
  ],defaultFaqs,['python-developer-india','nodejs-developer-india','react-developer-india','web-developer-india'],'tech'),

  p('hire-content-writer-india','Hire page','Hire Content Writer India | WorkIndex','Find verified content writers in India for blogs, website copy, technical writing, SEO content and product descriptions.','Hire Content Writer India','Blog, SEO, technical and website copy','Good content hiring starts with audience, topic depth, examples, SEO expectation and ownership terms.',[
    {title:'What content writers produce',items:['SEO blog posts.','Website copy.','Technical documentation.','Product descriptions.','Social captions.','Email newsletters.','LinkedIn thought leadership.','White papers.']},
    {title:'What to mention',items:['Content type.','Industry and audience.','Tone.','Word count or monthly volume.','SEO research expectation.','References and outline quality.','Budget per piece or retainer.']},
    {title:'Typical pricing',table:{headers:['Writer type','Typical range'],rows:[['Junior','Rs. 1.5-4/word'],['Mid-level SEO','Rs. 4-8/word'],['Senior technical/BFSI','Rs. 8-20/word'],['5-page website copy','Rs. 10,000-40,000']]}}
  ],defaultFaqs,['hire-seo-expert-india','hire-digital-marketing-expert-india','web-developer-india','business-website-development'],'tech'),

  p('hire-data-analyst-india','Hire page','Hire Data Analyst India | WorkIndex','Find verified data analysts in India for Excel, Power BI, Tableau, SQL, dashboards and business intelligence projects.','Hire Data Analyst India','Excel, Power BI, SQL and dashboard experts','Data analysts turn messy operational data into dashboards, MIS reports and decisions, without necessarily building predictive models.',[
    {title:'What data analysts do',items:['Clean and structure data.','Build Excel/Power BI/Tableau dashboards.','Write SQL queries.','Create MIS reports.','Analyse sales and marketing funnels.','Build financial models.','Present insights to management.']},
    {title:'What to mention',items:['Tools.','Data sources.','Deliverable.','One-time or ongoing.','Industry context.','Data volume and refresh frequency.']},
    {title:'Typical pricing',table:{headers:['Profile/project','Typical range'],rows:[['Junior analyst','Rs. 20,000-45,000/month'],['Mid-level Power BI/SQL','Rs. 45,000-90,000/month'],['Senior BI analyst','Rs. 90,000-1,60,000/month'],['Dashboard project','Rs. 20,000-80,000']]}}
  ],defaultFaqs,['management-accounts-mis-reporting','hire-python-ml-developer-india','virtual-cfo-for-startups','accounting-bookkeeping-services'],'tech'),

  p('how-to-file-gst-return-first-time','How-to','How to File Your First GST Return | WorkIndex','Step-by-step guide for first-time GST return filing: GSTR-1, GSTR-2B, GSTR-3B, payment and common mistakes.','How to File Your First GST Return','GSTR-1, GSTR-2B and GSTR-3B step by step','Your first GST return sets the pattern for invoice discipline, ITC discipline and monthly compliance.',[
    {title:'Three returns work together',body:'GSTR-1 reports outward supplies and feeds buyer ITC. GSTR-2B shows eligible purchase ITC based on supplier filings. GSTR-3B is the summary return where tax is paid after ITC.'},
    {title:'Steps',steps:[{title:'File GSTR-1',body:'Upload sales invoices, B2B GSTINs, B2C totals and credit/debit notes.'},{title:'Review GSTR-2B',body:'Reconcile supplier invoices with purchase register.'},{title:'File GSTR-3B',body:'Enter outward tax, eligible ITC and pay net liability.'},{title:'Save records',body:'Download acknowledgements and challans.'}]},
    {title:'First-timer mistakes',items:['Claiming ITC not in 2B.','Not filing NIL return.','Wrong customer GSTIN.','Wrong tax split.','Missing QRMP option review.']}
  ],defaultFaqs,['gst-filing-services','gst-qrmp-scheme-guide','blog-gstr-1-vs-gstr-3b-difference','gst-registration-help'],'gst'),

  p('faq-gst-registration','FAQ','GST Registration FAQ - Common Questions Answered | WorkIndex','Answers to common GST registration questions: threshold, voluntary registration, documents, timeline, GSTIN and first return.','GST Registration FAQ','Common questions answered','GST registration creates ongoing return and invoice obligations, so threshold and voluntary registration should be decided carefully.',[
    {title:'Topics covered',items:['Threshold.','Voluntary versus mandatory registration.','Documents.','Timeline and ARN tracking.','GSTIN format.','First invoice and first return.','LUT for exporters.','Cancellation and multiple states.']},
    {title:'Quick checklist before registering',items:['Turnover and business type.','Inter-state supply.','Marketplace sales.','Export and LUT.','B2B customer requirements.','Address proof and Aadhaar/DSC readiness.']}
  ],[{q:'When is GST registration mandatory?',a:'It depends on turnover, supply type, state and special categories such as ecommerce. Check your exact facts.'},{q:'Can I register voluntarily?',a:'Yes, but it creates return filing duties even if turnover is low.'},{q:'How long does registration take?',a:'Eligible applications can be quick, but clarifications or biometric checks can extend the timeline.'},{q:'What happens after GSTIN is issued?',a:'Set invoice format, return calendar and books immediately.'}],['gst-registration-help','gst-registration-for-startups','documents-required-for-gst-registration','gst-filing-services'],'gst'),

  p('faq-virtual-cfo','FAQ','Virtual CFO FAQ - Questions Answered | WorkIndex','Common questions about hiring a virtual CFO in India: role, cost, CA difference, startup timing and deliverables.','Virtual CFO FAQ','Questions answered','A virtual CFO is part-time strategic finance leadership, not just bookkeeping or annual tax filing.',[
    {title:'Topics covered',items:['vCFO versus CA.','When startups should hire.','Monthly deliverables.','Cost range.','Investor reporting.','Board packs.','MIS and runway.','Industry fit.']},
    {title:'Deliverables to expect',items:['Monthly MIS.','Cash-flow forecast.','Runway and burn report.','Compliance calendar.','Investor or lender reporting.','Budget versus actual.','Fundraising model support.']}
  ],[{q:'What does a virtual CFO do?',a:'They manage financial strategy, MIS, cash flow, investor reporting, controls and finance processes part-time.'},{q:'Is a vCFO the same as a CA?',a:'No. A CA may file or audit; a vCFO manages ongoing finance decisions and reporting.'},{q:'When should a startup hire one?',a:'Usually when investor reporting, runway, hiring, audit or fundraising complexity outgrows basic bookkeeping.'},{q:'Can WorkIndex find industry-specific vCFOs?',a:'Yes. Mention industry, stage, revenue, funding and reporting needs.'}],['virtual-cfo-services-india','virtual-cfo-for-startups','blog-what-is-virtual-cfo','management-accounts-mis-reporting'],'tax'),

  p('faq-tds-india','FAQ','TDS FAQ - Common Questions Answered | WorkIndex','Answers to common TDS questions in India: who deducts, deposit, Form 16A, refunds, correction returns and missed deduction.','TDS FAQ','Common questions answered','TDS is a payer-side obligation, and mistakes create interest, late fee, demands and payee credit problems.',[
    {title:'Topics covered',items:['What TDS is.','Who deducts.','Thresholds.','Deposit due dates.','Quarterly returns.','Form 16/16A.','Refund of excess TDS.','Correction return.','Missed deduction.']},
    {title:'Records to keep',items:['PAN of payee.','Invoice and payment date.','Section and rate.','Challan.','Form 26Q/24Q/27Q.','Form 16A issued.','TRACES demand if any.']}
  ],[{q:'What is TDS?',a:'Tax deducted at source by payer from specified payments and deposited against the payee PAN.'},{q:'What if TDS is not deducted?',a:'Interest, late fee, disallowance and Section 201 consequences may apply.'},{q:'Can excess TDS be refunded?',a:'Yes, the payee claims it as credit in ITR.'},{q:'Can TDS returns be corrected?',a:'Yes, correction statements can be filed through the prescribed process.'}],['tds-filing-services','tds-calculator-india','tds-mismatch-notice-help','blog-what-is-tds-india'],'tax'),

  p('how-to-track-gst-registration-status','How-to','How to Track GST Registration Status | WorkIndex','Step-by-step guide to checking GST registration status with ARN: pending, clarification, approved or rejected.','How to Track GST Registration Status','From ARN to GSTIN - checking every stage','After filing GST registration, ARN tracking tells you whether to wait, respond, attend biometric verification or reapply.',[
    {title:'Track using ARN',body:'Use the GST portal registration status tool with your Application Reference Number. Status can show pending, clarification needed, approved, rejected or other action states.'},
    {title:'How to check',steps:[{title:'Open GST portal',body:'Go to Services, Registration, Track Application Status.'},{title:'Enter ARN',body:'Use exact ARN from application acknowledgement.'},{title:'Read status',body:'Download notice/order if clarification or rejection appears.'},{title:'Act quickly',body:'Reply to clarification within deadline.'}]},
    {title:'Status meanings',items:['Pending for processing: wait and monitor.','Pending for clarification: login and reply.','Approved: download certificate and start returns.','Rejected: read order and decide reapply or appeal.','Biometric triggered: attend centre within timeline.']}
  ],defaultFaqs,['gst-registration-help','gst-registration-rejected-help','gst-registration-rule-14a','documents-required-for-gst-registration'],'gst'),

  p('itr-filing-jaipur','City service','ITR Filing in Jaipur | WorkIndex','Find CAs for ITR filing in Jaipur for textile, jewellery, marble, handicraft, salaried and startup income.','ITR Filing in Jaipur','Textile, jewellery, marble and startup tax filing','Jaipur tax filing often combines traditional trade income, jewellery and handicraft exports, property/rental income and a growing startup employee base.',[
    {title:'Jaipur tax context',body:'Rajasthan commercial activity around textiles, jewellery, marble, tourism and handicrafts creates ITR needs for traders, exporters, salaried employees, property owners and entrepreneurs.'},
    {title:'Common customer types',items:['Textile traders.','Jewellers.','Marble businesses.','Handicraft exporters.','IT/startup employees.','Tourism and hospitality owners.']},
    {title:'Popular needs',items:['Business ITR.','Capital gains.','AIS/TDS reconciliation.','GST-books match.','NRI family property filing.']}
  ],defaultFaqs,['gst-services-jaipur','accounting-services-jaipur','itr-filing-india','itr-filing-services'],'tax'),

  p('gst-services-jaipur','City service','GST Services in Jaipur | WorkIndex','Find GST consultants in Jaipur for textiles, jewellery, marble, handicrafts, ecommerce and GST notices.','GST Services in Jaipur','Jewellery, textile, marble and handicraft GST support','Jaipur GST needs are shaped by HSN classification, export documents, jewellery billing, marble rates and tourism-linked businesses.',[
    {title:'Jaipur GST context',body:'Jewellery, textiles, handicrafts, marble and ecommerce sellers need careful rate, HSN, e-way bill, LUT and ITC reconciliation support.'},
    {title:'Common needs',items:['GST registration.','GSTR-1 and 3B filing.','Jewellery/marble HSN review.','Export LUT/refund.','Notice reply.','Ecommerce reconciliation.']}
  ],defaultFaqs,['itr-filing-jaipur','accounting-services-jaipur','gst-registration-for-jewellers','gst-filing-services'],'gst'),

  p('accounting-services-jaipur','City service','Accounting Services in Jaipur | WorkIndex','Find accountants in Jaipur for bookkeeping, GST, payroll and financial statements for textile, jewellery, marble and tourism businesses.','Accounting Services in Jaipur','Trading, jewellery, marble and hospitality accounts','Jaipur accounting often requires inventory, GST, export and family-business reporting discipline.',[
    {title:'Jaipur accounting context',body:'Textile, jewellery, marble, handicraft, tourism and IT firms need bookkeeping that handles stock, GST, payroll, export records and bank finance reporting.'},
    {title:'Common needs',items:['Monthly bookkeeping.','Inventory and stock records.','GST reconciliation.','Payroll.','Financial statements.','Export BRC/FIRC support.']}
  ],defaultFaqs,['itr-filing-jaipur','gst-services-jaipur','accounting-services-bangalore','accounting-bookkeeping-services'],'tax'),

  p('itr-filing-surat','City service','ITR Filing in Surat | WorkIndex','Find CAs for ITR filing in Surat for diamond, textile, trading, salaried, exporter and capital gains cases.','ITR Filing in Surat','Diamond, textile and trading tax filing','Surat ITR work often involves diamond valuation, textile trading books, export income, family businesses and cash-to-digital accounting transitions.',[
    {title:'Surat tax context',body:'Surat is a diamond processing and textile hub. ITR cases can involve business income, capital gains, stock valuation, export receipts and GST-books reconciliation.'},
    {title:'Common customer types',items:['Diamond merchants.','Textile traders.','Exporters.','Manufacturing units.','Salaried professionals.','Family businesses.']}
  ],defaultFaqs,['gst-services-surat','accounting-services-surat','itr-filing-india','capital-gains-tax-services'],'tax'),

  p('gst-services-surat','City service','GST Services in Surat | WorkIndex','Find GST consultants in Surat for textile GST, diamond businesses, exports, GSTR filing and notices.','GST Services in Surat','Textile, diamond and export GST support','Surat GST work is high-volume and rate-sensitive, especially across textile, diamond and export-linked businesses.',[
    {title:'Surat GST context',body:'Textile fabric versus garment rates, GST 2.0 category changes, diamond supply chain, export LUT and high-volume GSTR-1 are common issues.'},
    {title:'Popular service needs',items:['GST registration.','Monthly returns.','HSN/rate mapping.','Export LUT/refund.','ITC reconciliation.','Notice response.']}
  ],defaultFaqs,['itr-filing-surat','accounting-services-surat','gst-2-rate-changes-guide','gst-filing-services'],'gst'),

  p('accounting-services-surat','City service','Accounting Services in Surat | WorkIndex','Find accountants in Surat for diamond, textile, export, GST, payroll and trading bookkeeping.','Accounting Services in Surat','Diamond, textile and trading accounts','Surat accounting needs accurate stock valuation, trading ledgers, GST reconciliation and export documentation.',[
    {title:'Surat accounting context',body:'Diamond and textile businesses need high-volume purchase/sales entry, stock records, GST reconciliation, broker/agent ledgers and bank finance statements.'},
    {title:'Common needs',items:['Daily bookkeeping.','Stock valuation.','GST and TDS.','Export records.','Debtor/creditor ageing.','Monthly MIS.']}
  ],defaultFaqs,['itr-filing-surat','gst-services-surat','bookkeeping-for-trading-companies','accounting-bookkeeping-services'],'tax'),

  p('web-developer-jaipur','City service','Web Developer in Jaipur | WorkIndex','Find web developers in Jaipur for tourism websites, handicraft ecommerce, React apps, WordPress and SME websites.','Web Developer in Jaipur','Tourism, handicraft ecommerce and SME websites','Jaipur web demand comes from hotels, tourism operators, handicraft exporters and SMEs moving product catalogues online.',[
    {title:'Jaipur web development context',body:'The city has growing developer talent around Sitapura, Malviya Nagar and Mansarovar, with demand for WordPress, PHP, React, Shopify and ecommerce catalogues.'},
    {title:'Common project types',items:['Hotel and tourism websites.','Handicraft ecommerce.','Exporter catalogues.','SME manufacturing websites.','React dashboards.','Booking forms and payment integrations.']}
  ],defaultFaqs,['web-developer-india','web-developer-bangalore','react-developer-india','hire-content-writer-india'],'tech'),

  p('itr-filing-nagpur','City service','ITR Filing in Nagpur | WorkIndex','Find CAs for ITR filing in Nagpur for traders, contractors, farmers, salaried professionals and government contractors.','ITR Filing in Nagpur','Central India trading, contractor and salary tax filing','Nagpur tax filing spans transport, trading, steel distribution, mining contractors, orange-agri income and government contractor records.',[
    {title:'Nagpur tax context',body:'As central India transport and commercial hub, Nagpur has business ITR, contractor TDS, salary filings, rental income, agri-plus-business cases and capital gains needs.'},
    {title:'Common customer types',items:['Transporters.','Steel distributors.','Mining contractors.','Government contractors.','Textile traders.','Salaried professionals.']}
  ],defaultFaqs,['gst-services-nagpur','itr-filing-india','tds-filing-services','for-small-businesses'],'tax'),

  p('gst-services-nagpur','City service','GST Services in Nagpur | WorkIndex','Find GST consultants in Nagpur for contractors, logistics, traders, steel distributors and GST notices.','GST Services in Nagpur','Contractor, logistics and trading GST support','Nagpur GST work is driven by transport, contractors, goods movement, e-way bills, mining suppliers and trading businesses.',[
    {title:'Nagpur GST context',body:'Central location means logistics and e-way bill issues are common, alongside contractor GST, steel distribution, mining and government vendor compliance.'},
    {title:'Popular service needs',items:['GST filing.','E-way bill help.','Works contract GST.','RCM.','ITC reconciliation.','Notice response.']}
  ],defaultFaqs,['itr-filing-nagpur','gst-for-logistics-transport','gst-registration-for-contractors','gst-filing-services'],'gst'),

  p('accounting-services-nagpur','City service','Accounting Services in Nagpur | WorkIndex','Find accountants in Nagpur for bookkeeping, GST, payroll and financial statements for traders, contractors, logistics and steel businesses.','Accounting Services in Nagpur','Transport, contractor and trading accounts','Nagpur accounting work often combines logistics ledgers, contractor billing, trading stock, payroll and bank finance statements for central India businesses.',[
    {title:'Nagpur accounting context',body:'As a transport and commercial hub, Nagpur businesses need books that track goods movement, project/vendor payments, stock, GST, TDS, receivables and loan documentation.'},
    {title:'Common customer types',items:['Transporters.','Steel distributors.','Mining contractors.','Government contractors.','Textile traders.','Small manufacturers.']},
    {title:'Popular service needs',items:['Monthly bookkeeping.','GST reconciliation.','TDS on contractors and vendors.','Payroll and PF/ESI.','Stock and debtor ageing.','Financial statements for bank limits.']}
  ],defaultFaqs,['itr-filing-nagpur','gst-services-nagpur','accounting-bookkeeping-services','bookkeeping-for-trading-companies'],'tax'),

  p('gst-services-kochi','City service','GST Services in Kochi | WorkIndex','Find GST consultants in Kochi for tourism, hospitality, spice and marine exports, IT companies and GST notices.','GST Services in Kochi','Tourism, export and IT GST support','Kochi GST work includes tourism packages, hotels, spice and marine exports, Infopark IT services and port-linked logistics.',[
    {title:'Kochi GST context',body:'Hospitality, tour operators, exporters, IT companies and maritime businesses need GST registration, returns, LUT/refund, RCM and ITC support.'},
    {title:'Common needs',items:['GST returns.','Export LUT/refund.','Hotel/tour GST.','RCM on foreign services.','E-way bills.','Notice reply.']}
  ],defaultFaqs,['itr-filing-kochi','gst-lut-filing-services','for-hotel-hospitality-businesses','gst-filing-services'],'gst'),

  p('itr-filing-kochi','City service','ITR Filing in Kochi | WorkIndex','Find CAs for ITR filing in Kochi for NRIs, tourism businesses, exporters, IT employees and rental income.','ITR Filing in Kochi','NRI, tourism, export and IT tax filing','Kochi ITR work frequently involves NRI property income, tourism business accounts, spice/marine export income and Infopark salary returns.',[
    {title:'Kochi tax context',body:'Kerala NRI families, tourism operators, exporters, maritime businesses and IT employees often need ITR support with rent, capital gains, DTAA, business income and TDS credits.'},
    {title:'Common customer types',items:['NRIs with Kerala property.','Hotel and tour operators.','Spice/marine exporters.','IT employees.','Maritime/logistics businesses.','Rental income earners.']}
  ],defaultFaqs,['gst-services-kochi','itr-filing-for-nri','for-hotel-hospitality-businesses','itr-filing-services'],'tax')
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
