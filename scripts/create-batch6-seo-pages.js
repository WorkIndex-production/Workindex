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
  const upper = { gst: 'GST', itr: 'ITR', tds: 'TDS', tcs: 'TCS', lrs: 'LRS', mca: 'MCA', roc: 'ROC', llp: 'LLP', esop: 'ESOP', fema: 'FEMA', fdi: 'FDI', rbi: 'RBI', fc: 'FC', gpr: 'GPR', trs: 'TRS', fla: 'FLA', ecb: 'ECB', odi: 'ODI', apr: 'APR', dsc: 'DSC', din: 'DIN', pan: 'PAN', tan: 'TAN', ca: 'CA', cs: 'CS', posh: 'POSH', pf: 'PF', esi: 'ESI', pvt: 'Pvt', ltd: 'Ltd', nri: 'NRI', dtaa: 'DTAA', huf: 'HUF', cfo: 'CFO', b2b: 'B2B', b2c: 'B2C', saas: 'SaaS', sac: 'SAC', hsn: 'HSN', rcm: 'RCM', lut: 'LUT', itc: 'ITC', ui: 'UI', ux: 'UX', msme: 'MSME', ccfs: 'CCFS', ay: 'AY' };
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
  company: [
    { label: 'MCA portal', href: 'https://www.mca.gov.in/' },
    { label: 'MCA company e-filing', href: 'https://www.mca.gov.in/content/mca/global/en/mca/e-filing.html' },
    { label: 'ICSI', href: 'https://www.icsi.edu/' }
  ],
  tax: [
    { label: 'Income Tax e-Filing portal', href: 'https://www.incometax.gov.in/iec/foportal/' },
    { label: 'Income Tax Department', href: 'https://www.incometaxindia.gov.in/' },
    { label: 'Income Tax tax rates and TDS/TCS resources', href: 'https://www.incometaxindia.gov.in/' }
  ],
  gst: [
    { label: 'GST portal', href: 'https://www.gst.gov.in/' },
    { label: 'GST Council', href: 'https://gstcouncil.gov.in/' },
    { label: 'CBIC GST', href: 'https://cbic-gst.gov.in/' }
  ],
  labour: [
    { label: 'EPFO', href: 'https://www.epfindia.gov.in/' },
    { label: 'ESIC', href: 'https://www.esic.gov.in/' },
    { label: 'Ministry of Labour and Employment', href: 'https://labour.gov.in/' }
  ],
  fema: [
    { label: 'RBI', href: 'https://www.rbi.org.in/' },
    { label: 'FIRMS portal', href: 'https://firms.rbi.org.in/' },
    { label: 'MCA portal', href: 'https://www.mca.gov.in/' }
  ],
  tech: [
    { label: 'MDN Web Docs', href: 'https://developer.mozilla.org/' },
    { label: 'Flutter documentation', href: 'https://docs.flutter.dev/' },
    { label: 'Google Search Central', href: 'https://developers.google.com/search' }
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
  const related = page.related || ['itr-filing-services', 'gst-filing-services', 'accounting-bookkeeping-services', 'hire-ca-online-india'];
  const body = page.sections.map(s => renderSection(page, s)).join('');
  const common = [
    `${page.h1} can depend on the financial year, notification date, state, turnover, residential status, product/service classification, portal status, documents available and prior filings.`,
    `Use this page as preparation guidance. Before filing, registering, responding to notices, changing rates, or making tax decisions, share exact notices, invoices, portal screenshots, dates, amounts and registrations with a qualified professional.`,
    `If a rule changed recently, ask the expert to identify the specific circular, notification, form instruction, portal advisory or department guidance they are relying on. Older search results often keep stale thresholds, dates or section numbers online.`,
    `A strong WorkIndex quote should clearly state scope, assumptions, records needed, timeline, exclusions, correction support, government fee, professional fee and whether follow-up with department or portal is included.`
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
<section class="wi-panel"><div class="lp-section-eyebrow">Expert Screening</div><h2>How to compare WorkIndex responses</h2>${list(['Ask whether the expert has handled this exact form, notice, industry, city, portal workflow or assessment year before.', 'Confirm whether the quote includes filing only, advisory only, or also reconciliation, correction, drafting, hearing support and follow-up.', 'Prefer experts who ask for source records before final pricing instead of quoting blindly from only the page title.', 'For urgent matters, include statutory deadline, notice/order date, current portal status and financial exposure.', 'Keep acknowledgements, challans, UDIN, computation, working papers and communication trail after completion.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Records Checklist</div><h2>Keep these ready before requesting quotes</h2>${list(['PAN, Aadhaar, GSTIN, TAN, CIN, LLPIN, IEC, DSC, Udyam, FSSAI, DIN, company master data or registration number as applicable.', 'Portal login access or screenshots from Income Tax, GST, MCA, DGFT, RBI/FIRMS, EPFO, ESIC, TRACES, e-way bill or state labour portals.', 'Previous filings, acknowledgements, challans, certificates, orders, notices, audit reports and working papers.', 'Bank statements, invoices, contracts, payroll records, books export, cap table, investment agreements, HSN/SAC mapping, transaction reports or project documents relevant to the case.', 'A short written summary of what happened, what deadline exists, what help you need and whether support can be remote or must be local.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">WorkIndex Posting Tips</div><h2>How to get better quotes faster</h2>${list(['Mention whether you need one-time filing, urgent correction, registration, calculator review, audit, monthly retainer, appeal, technology build or advisory review.', 'Add approximate transaction count, employee count, turnover range, number of filings or years pending, and any notice deadline so experts can size the work properly.', 'For MCA, FEMA and startup pages, share company type, incorporation date, funding/investment dates, pending years, DSC status and current master data status.', 'For GST pages, share the exact HSN/SAC, old rate charged, new rate you believe applies, invoice period and whether customers already claimed ITC.', 'For developer/marketing/design pages, share existing URL or app idea, scope, integrations, design readiness, budget range and maintenance expectation.'])}</section>
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
  { q: 'Can this be handled online?', a: 'Many tax, GST, MCA, FEMA, registration, accounting and web development tasks can be handled online if records and access are clear.' },
  { q: 'How should I compare quotes?', a: 'Compare scope, experience, timeline, required documents, follow-up support and whether the expert has handled similar work before.' }
];

const pages = [
  p('ccfs-2026-mca-amnesty-scheme','Service help','CCFS 2026 - MCA Company Compliance Amnesty Scheme | WorkIndex','Clear pending ROC filings under CCFS-2026. MGT-7, AOC-4, ADT-1 backlog filing and MCA amnesty support explained.','CCFS 2026 - MCA Amnesty for Pending ROC Filings','Limited MCA compliance window for overdue company filings','CCFS-2026 gives defaulting companies a time-bound route to regularise overdue annual return and financial statement filings before the window closes.',[
    { title:'What CCFS-2026 offers', body:'MCA General Circular 01/2026 introduced the Companies Compliance Facilitation Scheme, 2026, effective from 15 April 2026 to 15 July 2026. It is meant to help eligible companies file overdue annual return and financial statement documents, or move towards dormancy or closure, with reduced additional-fee exposure as per the scheme.' },
    { title:'Forms and situations to review', items:['MGT-7 or MGT-7A annual return backlog.','AOC-4 or AOC-4 CFS financial statement backlog.','ADT-1 auditor appointment gaps where relevant.','Foreign company annual filings where covered.','Older Companies Act forms that appear in MCA history.','Companies wanting to become dormant or strike off after cleanup.'] },
    { title:'Who should act now', items:['Private limited companies with 1-5 years pending filings.','OPCs, small companies, startups and MSMEs with annual filing defaults.','Companies with large additional-fee build-up.','Dormant or inactive companies that want clean closure.','Directors whose future filings are blocked by old defaults.'] },
    { title:'Process', steps:[{title:'Identify gaps',body:'Check MCA master data and previous filing history year by year.'},{title:'Prepare records',body:'Complete financial statements, audit and board approvals where needed.'},{title:'File within window',body:'Use the scheme period and retain all acknowledgements.'},{title:'Clean next step',body:'Continue compliance, apply for dormancy, or proceed with strike-off as appropriate.'}] }
  ],[{q:'What is the deadline for CCFS-2026?',a:'The scheme window runs from 15 April 2026 to 15 July 2026 as per the published circular references.'},{q:'Can LLPs use CCFS-2026?',a:'CCFS is company-focused. LLP compliance has its own filing framework; ask an expert to verify whether any separate LLP relief applies.'},{q:'What happens after the window closes?',a:'Normal additional fees and enforcement risk can resume. Pending filings should be assessed before the deadline.'}],['roc-annual-filing-services','director-din-kyc-services','private-limited-company-annual-compliance','company-compliance-services'],'company'),

  p('llp-annual-compliance-form-11','Service specific','LLP Annual Compliance - Form 11 and Form 8 | WorkIndex','File LLP Form 11 and Form 8 to keep your LLP compliant and avoid late filing fees.','LLP Annual Compliance','Form 11 by May 30, Form 8 by October 30','Every LLP needs annual compliance even when it has no business activity, no revenue or no change in partners.',[
    { title:'Two mandatory annual filings', table:{headers:['Form','Purpose','Common due date'],rows:[['Form 11','Annual return with partner and contribution details','30 May'],['Form 8','Statement of accounts and solvency','30 October'],['Form 4','Partner/designated partner change','Before annual return if changes are pending']] } },
    { title:'Situations this page is built for', items:['New LLP filing its first annual return.','LLP with Form 11 or Form 8 pending for past years.','Designated partner DSC expired or DIN KYC not done.','LLP conversion, closure or bank due diligence needs clean filings.','Dormant LLP that still needs NIL annual filings.'] },
    { title:'Documents required', items:['Partner list, contribution and profit-sharing ratio.','Changes in partners during the year.','Financial statements and bank statements.','Designated partner DSC.','Audit report if turnover/contribution threshold triggers audit.'] },
    { title:'Common mistakes', items:['Filing Form 11 before updating partner changes.','Missing NIL return.','Expired DSC.','Ignoring audit requirement.','Leaving late fee to compound across years.'] }
  ],[{q:'Is audit mandatory for all LLPs?',a:'No. LLP audit depends on contribution, turnover and other applicable conditions.'},{q:'What is the late fee for LLP Form 11?',a:'LLP late filing fees are date-sensitive and can accumulate daily. Check current portal computation before filing.'},{q:'Can WorkIndex handle Form 11 and Form 8 together?',a:'Yes. Post the pending years and current DSC/DIN status to compare package quotes.'}],['llp-registration-services','roc-annual-filing-services','ccfs-2026-mca-amnesty-scheme','director-din-kyc-services'],'company'),

  p('esop-implementation-services','Service hub','ESOP Implementation Services | WorkIndex','Design and implement ESOP plans for Indian startups and companies. Valuation, vesting, board approvals, ROC filings and tax explained.','ESOP Implementation Services','Pool design, vesting schedule and regulatory filing','ESOP work sits across company law, tax, valuation and HR policy, so the plan should be designed before options are promised to employees.',[
    { title:'ESOPs require combined compliance', body:'An ESOP scheme normally needs board and shareholder approval, scheme document drafting, valuation support, vesting design, exercise process, ROC filings when shares are allotted and payroll/TDS handling when employees exercise options.' },
    { title:'What implementation involves', items:['ESOP pool sizing and dilution modelling.','Vesting schedule with cliff and acceleration terms.','FMV valuation for tax and exercise planning.','Scheme document drafting with CA/CS/legal coordination.','Board and shareholder approvals.','PAS-3 filing on allotment after exercise.','Payroll and Form 16 update for perquisite tax.'] },
    { title:'Employee tax impact', table:{headers:['Stage','Tax position'],rows:[['Grant','Usually no tax.'],['Vesting','Usually no tax.'],['Exercise','FMV minus exercise price treated as salary perquisite and TDS may apply.'],['Sale','Capital gains based on FMV at exercise and sale price.']] } },
    { title:'When startups need this', items:['Before a seed or Series A round.','Before promising options in offer letters.','When employees start exercising.','When investors ask for clean cap table and ESOP documents.','When co-founder vesting needs formal structure.'] }
  ],[{q:'When should a startup create its ESOP pool?',a:'Usually before serious hiring or a funding round, so dilution and grant policy are clear.'},{q:'Is ESOP valuation mandatory?',a:'Valuation is typically needed for unlisted-company tax and compliance workflows.'},{q:'Can WorkIndex find CA+CS teams?',a:'Yes. Mention whether you need design, documentation, valuation, ROC filing, payroll TDS or all of them.'}],['for-startups','startup-compliance-services','virtual-cfo-for-startups','blog-esop-taxation-india'],'company'),

  p('company-name-change-services','Service specific','Company Name Change Services | WorkIndex','Change your company or LLP name on MCA. RUN, MGT-14, INC-24, MOA/AOA update and post-approval changes explained.','Company Name Change Services','From RUN to fresh name approval','A company name change is not just branding. It updates MCA records first, then tax, GST, banking, contracts and invoices.',[
    { title:'Company name change requires multiple filings', body:'For a private company or OPC, the process commonly includes board approval, name availability through RUN/SPICe+ workflow as applicable, shareholder special resolution, MGT-14, INC-24 and updated charter documents. LLP name changes follow an LLP-specific process.' },
    { title:'Situations this page is built for', items:['Startup rebranding after pivot.','Acquired company being renamed.','Name conflict or trademark concern.','Entity name no longer matching business activity.','Group company harmonising legal names.'] },
    { title:'Documents required', items:['Board resolution.','Special resolution or consent where applicable.','Proposed name options.','Reason for name change.','Updated MOA/AOA draft if needed.','Existing incorporation certificate and master data.'] },
    { title:'After approval checklist', items:['Update GST legal name.','Verify PAN and TAN records.','Notify banks and payment gateways.','Update contracts, letterheads, invoices and website.','Review trademark records if the brand changed.'] }
  ],defaultFaqs,['company-registration-consultants','company-compliance-services','roc-annual-filing-services','trademark-registration'],'company'),

  p('registered-office-change-services','Service specific','Registered Office Change Services | WorkIndex','Change your company registered office on MCA. Same city, same state, different ROC and inter-state procedures explained.','Registered Office Change Services','Within city, state, or across states','Registered office change complexity depends on whether the company is moving within the same local limits, between ROC jurisdictions or across states.',[
    { title:'Three levels of address change', table:{headers:['Move type','Typical complexity','Forms/approval to review'],rows:[['Within same city/local limits','Lower','INC-22 and board approval.'],['Within state but ROC jurisdiction changes','Medium','Special resolution, MGT-14 and approval steps.'],['Across states','High','Regional Director process, creditor/public notice and INC-23 workflow.']] } },
    { title:'Situations this page is built for', items:['Startup moving from home to office.','Company relocating to another city or state.','Registered office found non-existent during verification.','Company using virtual office and needing compliant documentation.','GST address also needs update after MCA change.'] },
    { title:'Documents required', items:['New address proof.','Rent agreement or ownership proof.','NOC from owner.','Recent utility bill.','Board resolution.','Special resolution and notices where applicable.'] },
    { title:'Virtual office note', body:'A virtual office can work if it gives a real receivable address, owner NOC, utility/address documents and supports MCA/GST verification. Avoid addresses that cannot receive statutory notices.' }
  ],defaultFaqs,['company-compliance-services','roc-annual-filing-services','company-name-change-services','director-din-kyc-services'],'company'),

  p('itr-filing-for-nri','Segment service','ITR Filing for NRIs in India | WorkIndex','File ITR as an NRI for Indian income, rental income, capital gains, FD interest, salary, DTAA and foreign tax credit claims.','ITR Filing for NRIs in India','Indian income, DTAA benefit and residential status','NRI tax filing starts with residential status, then maps only India-sourced income and treaty claims correctly.',[
    { title:'NRI ITR depends on status and income type', body:'Residential status is determined by stay days and related rules for the relevant year. NRIs are generally taxed in India on income received, accrued or deemed to accrue in India, such as rent, Indian capital gains, NRO interest, India workdays salary and business income from India.' },
    { title:'Situations this page is built for', items:['NRI with rental income from Indian property.','NRI who sold Indian property.','NRO FD interest with high TDS.','Returned Indian with split-year facts.','DTAA claim for USA, UK, UAE, Singapore or other residence country.','Foreign tax credit or Form 67 review.'] },
    { title:'Documents required', items:['Passport travel dates.','PAN and Indian bank details.','NRO/NRE statements and TDS certificates.','Rent agreement and property tax records.','Sale deed and cost documents for capital gains.','TRC and Form 10F for treaty claims where applicable.'] },
    { title:'Process', steps:[{title:'Determine status',body:'Count days and check resident/NRI/RNOR impact.'},{title:'Map income',body:'Separate India-sourced income from foreign income.'},{title:'Check DTAA',body:'Use TRC/Form 10F where treaty benefit applies.'},{title:'File correct ITR',body:'Usually ITR-2 or ITR-3 depending on business/professional income.'}] }
  ],defaultFaqs,['for-nris','gst-registration-for-nris','capital-gains-tax-services','itr-filing-services'],'tax'),

  p('itr-filing-for-teachers-professors','Segment service','ITR Filing for Teachers and Professors | WorkIndex','File ITR for teachers, professors and education professionals. Salary, tuition income, online courses, royalty and allowances explained.','ITR Filing for Teachers and Professors','Salary, tuition income, royalties and allowances','A teacher with only salary may file simply, but tuition, royalties, online courses or consulting can change the ITR form and tax method.',[
    { title:'Teacher ITR complexity rises with multiple income sources', body:'Salary from a school or university is straightforward. Private tuition, coaching fees, paper-setting fees, royalties, online platforms and YouTube/course revenue can create professional or business income that needs ITR-3 or presumptive review.' },
    { title:'Situations this page is built for', items:['Government or private teacher with salary.','Professor with research grants or book royalties.','Teacher running private tuitions.','EdTech creator earning platform income.','Retired professor with pension, gratuity or commuted pension.'] },
    { title:'Documents required', items:['Form 16.','Tuition income records.','Royalty/platform statements.','TDS certificates under 194J where applicable.','AIS and Form 26AS.','Deduction proofs and HRA documents.'] },
    { title:'Common mistakes', items:['Not declaring tuition income.','Using ITR-1 despite professional income.','Missing platform TDS credit.','Not tracking foreign platform income.','Not comparing 44ADA and actual expense method.'] }
  ],defaultFaqs,['itr-filing-for-salaried-employees','itr-filing-for-freelancers','presumptive-taxation-44ad-44ada-guide','itr-filing-services'],'tax'),

  p('itr-filing-for-govt-employees','Segment service','ITR Filing for Government Employees | WorkIndex','File ITR for central and state government employees. NPS, gratuity, LTA, HRA, DA, commuted pension and regime comparison.','ITR Filing for Government Employees','NPS, gratuity, DA and government-specific allowances','Government employee returns need careful treatment of allowances, pension documents, NPS and old versus new regime choice.',[
    { title:'Government employee ITR has specific items', items:['DA is generally taxable.','NPS employer contribution deduction can be higher for certain government employees.','LTC/LTA and HRA need records.','Pension, commuted pension and gratuity require classification.','Outside lecture, textbook or consulting income can change ITR form.'] },
    { title:'Situations this page is built for', items:['Central government employee comparing regimes.','State employee with multiple allowances.','Transferred employee with HRA/LTA questions.','Retired employee with pension and gratuity.','PSU or government employee with side income.'] },
    { title:'Documents required', items:['Form 16 from DDO/PAO/employer.','NPS statement.','LTC claim papers.','HRA rent documents.','Pension/gratuity/commutation papers.','AIS and Form 26AS.'] },
    { title:'Old versus new regime', body:'The best regime depends on deductions, HRA, NPS, LTA, home loan and salary level. Do not assume government employees always benefit from one regime; compare with actual Form 16 and proofs.' }
  ],defaultFaqs,['itr-filing-for-salaried-employees','itr-filing-for-pensioners','income-tax-new-regime-deductions','old-vs-new-tax-regime'],'tax'),

  p('form-26qb-tds-on-property-help','Problem help','Form 26QB - TDS on Property Purchase Help | WorkIndex','File and correct Form 26QB for TDS on property above Rs. 50 lakh. Buyer obligation, deadline, Form 16B and corrections explained.','Form 26QB - TDS on Property Purchase','Buyer TDS obligation and Form 16B','For resident property sellers, the buyer usually deducts TDS under Section 194-IA and reports it through Form 26QB.',[
    { title:'Buyer obligation above Rs. 50 lakh', body:'When a resident seller transfers immovable property and consideration crosses the threshold, the buyer generally deducts 1% TDS and deposits it through Form 26QB within the prescribed timeline. NRI sellers follow Section 195, not the normal 26QB route.' },
    { title:'Situations this page is built for', items:['Buyer forgot TDS.','Wrong seller PAN in 26QB.','Instalment payments with multiple 26QB filings.','Seller cannot see Form 16B credit.','NRI seller involved.','Builder transaction above threshold.'] },
    { title:'Process', steps:[{title:'Calculate TDS',body:'Check total consideration and instalment timing.'},{title:'File 26QB',body:'Deposit through the prescribed challan-cum-statement workflow.'},{title:'Download Form 16B',body:'Give seller certificate after it is available.'},{title:'Correct errors',body:'Use correction workflow for PAN, amount or property details where permitted.'}] },
    { title:'Common mistakes', items:['Ignoring threshold across total consideration.','Treating NRI seller as resident.','Depositing late.','Not issuing Form 16B.','Wrong PAN or assessment year.'] }
  ],defaultFaqs,['tds-filing-services','missed-tds-deduction-help','itr-filing-for-rental-income','capital-gains-tax-services'],'tax'),

  p('tcs-on-foreign-remittance-lrs','Info help','TCS on Foreign Remittance - LRS Guide | WorkIndex','TCS on overseas remittances under LRS India. Current threshold, education and medical rates, other remittances and ITR credit claims explained.','TCS on Foreign Remittance - LRS','Collected at source, then claimed in ITR','LRS TCS is not a final tax. It is collected by the authorised dealer or seller and appears as tax credit that can be claimed in the ITR.',[
    { title:'Corrected 2026 threshold and rates', body:'Official Income Tax material for 2026 refers to a Rs. 10 lakh threshold for LRS TCS, not Rs. 7 lakh. Education and medical remittance rates were proposed/rationalised in Budget 2026 materials, while most non-education/non-medical purposes continue to need higher-rate review. Always verify current bank treatment before remitting.' },
    { title:'Situations this page is built for', items:['Education remittance for child abroad.','Medical treatment remittance.','Foreign investment under LRS.','Gift or family support remittance.','Overseas tour package.','TCS shown in AIS and refund needed.'] },
    { title:'How to claim TCS back', items:['Check Form 26AS and AIS TCS credit.','Claim credit in ITR against final tax.','If total income is below tax payable, refund can arise.','Match PAN across bank and income-tax profile.','Keep bank remittance advice and purpose code.'] },
    { title:'Common mistakes', items:['Assuming TCS is final tax.','Using old Rs. 7 lakh threshold content.','Not tracking remittances across banks.','Missing education/medical documentation.','Forgetting to claim credit in ITR.'] }
  ],defaultFaqs,['itr-filing-for-nri','itr-filing-for-import-export-businesses','income-tax-slab-rates-guide','itr-filing-services'],'tax'),

  p('gst-registration-rule-14a','Help guide','GST Registration under Rule 14A - 3-Day Process | WorkIndex','GST Rule 14A simplified registration in 3 working days for eligible Aadhaar-authenticated applicants. Eligibility, biometric and limits explained.','GST Registration Rule 14A','3-day registration for eligible Aadhaar-verified applicants','Rule 14A is a simplified registration route, but it is eligibility-based and can be interrupted by risk checks, biometric verification or document defects.',[
    { title:'What Rule 14A changes', body:'Rule 14A enables faster GST registration for eligible applicants after successful Aadhaar authentication. Current guidance also highlights eligibility limits such as estimated monthly B2B output tax not exceeding Rs. 2.5 lakh and no existing Rule 14A registration in the same State/UT under the same PAN.' },
    { title:'Rule 14A versus regular registration', table:{headers:['Route','When it fits','Timeline risk'],rows:[['Rule 14A','Eligible low-risk Aadhaar-authenticated applicant','Can be issued in 3 working days if no risk flag.'],['Regular process','Biometric/verification/officer scrutiny needed','Takes longer and can involve queries.'],['SCN/rejection','Documents or facts disputed','Applicant must reply within deadline.']] } },
    { title:'What can trigger biometric or scrutiny', items:['PAN/Aadhaar mismatch.','Risk flags from GSTN.','Prior cancellation or suspicious history.','High-risk address or business category.','Incomplete or inconsistent documents.'] },
    { title:'What to do if triggered', items:['Check email/SMS/portal notice.','Visit GST Suvidha Kendra if biometric is required.','Carry original documents.','Reply to SCN within deadline.','Track ARN until GSTIN is issued or rejected.'] }
  ],defaultFaqs,['gst-registration-help','gst-registration-rejected-help','documents-required-for-gst-registration','gst-registration-for-startups'],'gst'),

  p('gst-tcs-for-ecommerce-operators','Service specific','GST TCS for Ecommerce Operators | Section 52 | WorkIndex','GST TCS obligations for ecommerce operators under Section 52. TCS collection, GSTR-8, seller reconciliation and credits explained.','GST TCS for Ecommerce Operators','Section 52 compliance for marketplace businesses','Marketplace and platform operators have GST TCS duties separate from seller GST return filing.',[
    { title:'Ecommerce operators collect TCS', body:'Under Section 52, qualifying ecommerce operators collect TCS on net taxable supplies made through the platform and report it through GSTR-8. The seller later sees credit subject to correct GSTIN and reporting.' },
    { title:'Situations this page is built for', items:['Marketplace startup setting up TCS.','Food delivery or mobility platform.','Operator missed GSTR-8.','Seller credits missing in GSTR-2B.','D2C brand adding third-party sellers.'] },
    { title:'Documents and data required', items:['Operator GSTIN.','Seller GSTIN master.','Monthly net taxable value by seller.','Settlement reports.','TCS payment challans.','Returns history.'] },
    { title:'Process', steps:[{title:'Register correctly',body:'Operator registration and return type should be set up.'},{title:'Collect TCS',body:'Configure payment/settlement systems.'},{title:'File GSTR-8',body:'Report seller-wise values by due date.'},{title:'Reconcile seller credits',body:'Fix GSTIN or value mismatches quickly.'}] }
  ],defaultFaqs,['gst-registration-for-ecommerce-sellers','bookkeeping-for-ecommerce-sellers','gst-filing-services','for-ecommerce-sellers'],'gst'),

  p('gst-for-saas-companies','Niche segment','GST for SaaS and Software Companies | WorkIndex','GST compliance for Indian SaaS companies. Place of supply, 18% GST, LUT for exports, RCM on cloud tools and invoicing explained.','GST for SaaS Companies','Place of supply, LUT, export rules and RCM on cloud tools','SaaS GST needs separate treatment for Indian customers, overseas exports, foreign vendor tools and recurring subscriptions.',[
    { title:'SaaS companies face multiple GST layers', items:['Indian subscriptions generally need GST if registered/applicable.','Overseas subscriptions can be zero-rated if export-of-service conditions and LUT are in place.','Foreign cloud/software vendors may trigger RCM.','B2B versus B2C place of supply matters.','SAC classification should match the service model.'] },
    { title:'RCM checklist', items:['AWS, Azure or Google Cloud.','Stripe, PayPal or overseas payment tools.','Zoom, Slack, GitHub, Notion or Atlassian.','Foreign consultants or support services.','Invoices in foreign currency with import-of-service treatment.'] },
    { title:'Documents needed', items:['Customer country and GSTIN list.','Subscription invoice format.','LUT acknowledgement.','Foreign vendor invoices.','Payment gateway settlements.','RCM challans and ITC claims.'] },
    { title:'Common mistakes', items:['Not filing LUT before export invoicing.','Treating all foreign revenue as automatically outside GST.','Missing RCM on cloud tools.','Wrong SAC on invoices.','Mixing domestic and export revenue in one ledger.'] }
  ],defaultFaqs,['gst-registration-for-startups','rcm-reverse-charge-help','for-saas-founders','gst-lut-filing-services'],'gst'),

  p('gst-works-contract-construction','Niche service','GST on Works Contract - Construction and Services | WorkIndex','GST rates and ITC rules for works contracts in India. Construction, government contracts, composite supply and ITC blockage explained.','GST on Works Contract','Construction rates, ITC rules and contract compliance','Works contract GST depends on the contract type, property type, recipient, notification date and ITC eligibility.',[
    { title:'Works contract is a composite supply', body:'Works contract usually involves transfer of property in goods while executing construction, erection, installation, repair or renovation. Rate and ITC treatment can differ for residential, commercial, government, repair and plant-and-machinery work.' },
    { title:'Areas needing review', items:['Residential construction rate and no-ITC treatment.','Commercial construction rate after GST rate changes.','Government civil works contracts.','Repair and maintenance.','Subcontractor rate alignment.','Mixed-use project ITC reversal.'] },
    { title:'ITC on works contract', items:['Blocked when used for construction of immovable property in many cases.','Allowed for plant and machinery exceptions.','Contractor ITC differs from developer/customer ITC.','Residential development often has blocked input credit.','Office renovation ITC needs careful review.'] },
    { title:'When to hire an expert', items:['JDA or redevelopment.','Mixed residential/commercial project.','Government contract.','Large cement/steel ITC claim.','GST 2.0 rate migration or notice.'] }
  ],defaultFaqs,['gst-2-rate-changes-guide','gst-registration-for-contractors','bookkeeping-for-construction','accounting-for-construction'],'gst'),

  p('gst-on-rental-cars-transport','Niche guide','GST on Cab Services and Car Rentals | WorkIndex','GST rates on cab services, car rentals, employee transport, ITC block and RCM applicability explained.','GST on Cab Services and Car Rentals','Aggregator, ITC block and employee transport rules','Transport GST changes with the model: aggregator ride, rent-a-cab, employee shuttle, self-drive rental, goods transport or vehicle purchase.',[
    { title:'Different models, different GST treatment', items:['Cab aggregators and passenger transport.','Rent-a-cab with or without ITC model.','Employee transport contracts.','Company car lease or reimbursement.','Goods vehicles and logistics are separate.','RCM can apply in specific renting motor vehicle cases.'] },
    { title:'ITC on motor vehicles', items:['Blocked for many employee commuting or personal-use cars.','Allowed where further supply of transport/cab service is the business.','Goods vehicles have different treatment.','Employee benefits can create separate GST and income-tax issues.'] },
    { title:'Situations this page is built for', items:['Ola/Uber Business bills.','Employee shuttle service.','Car rental company billing setup.','Company car policy review.','New cab aggregator GST setup.'] },
    { title:'Records to keep', items:['Vendor contracts.','Trip logs.','Employee transport policy.','Invoices and GST rate.','ITC claim ledger.','RCM challans where applicable.'] }
  ],defaultFaqs,['rcm-reverse-charge-help','gst-2-rate-changes-guide','itc-reversal-help','gst-filing-services'],'gst'),

  p('fema-compliance-services','Service hub','FEMA Compliance Services | WorkIndex','FEMA compliance for Indian companies with foreign investment. FC-GPR, FC-TRS, FLA, ECB, ODI and RBI compounding explained.','FEMA Compliance Services','FC-GPR, FLA, ECB, ODI and RBI reporting','Foreign investment and overseas investment create RBI reporting timelines that startups often miss during funding and share-transfer activity.',[
    { title:'Every foreign investment triggers reporting review', body:'When an Indian entity receives FDI, issues shares, transfers shares involving non-residents, raises ECB or invests overseas, FEMA reporting through RBI/FIRMS or related systems may apply. Delays can require compounding.' },
    { title:'Key FEMA filings', items:['FC-GPR for fresh foreign investment after allotment.','FC-TRS for transfer between resident and non-resident.','FLA annual return for companies with FDI/ODI outstanding.','ECB-2 monthly reporting for external commercial borrowing.','ODI/APR reporting for overseas investment.','RBI compounding for delays.'] },
    { title:'Situations this page is built for', items:['Startup raised foreign seed round.','Founder transferred shares to foreign investor.','FLA return missed.','Foreign loan/ECB reporting needed.','Indian company investing abroad.'] },
    { title:'Documents required', items:['Term sheet/investment agreement.','Valuation report.','FIRC/KYC from bank.','Board and allotment records.','Cap table.','Financial statements.','Share transfer documents.'] }
  ],defaultFaqs,['hire-company-secretary','startup-compliance-services','transfer-pricing-study-services','virtual-cfo-for-startups'],'fema'),

  p('labour-law-compliance-services','Service hub','Labour Law Compliance Services | WorkIndex','Labour law compliance for employers. PF, ESI, professional tax, gratuity, POSH, Shops Act, factory licence and contract labour explained.','Labour Law Compliance Services','PF, ESI, gratuity, POSH and Shops Act','Employer compliance is not only payroll. Labour, welfare, workplace safety and state registrations grow with employee count, premises and worker type.',[
    { title:'Indian labour law spans central and state requirements', body:'Employers may need PF, ESI, professional tax, Shops and Establishments, POSH, gratuity, maternity benefit, contract labour and factory compliance depending on employee count, wages, state and business activity.' },
    { title:'Compliance by trigger', table:{headers:['Trigger','Compliance to review'],rows:[['First employees','Employment records, payroll, POSH readiness and state registration.'],['10+ employees','ESI and POSH Internal Committee where applicable.'],['20+ employees','PF and expanded labour records.'],['Factory/manufacturing','Factory licence and safety registers.'],['Contract workers','Contract Labour Act and vendor compliance.']] } },
    { title:'POSH compliance', items:['Internal Committee for organisations with 10+ employees.','Policy and awareness training.','Annual reporting where required.','Records of complaints and closure.','Penalties can apply for non-compliance.'] },
    { title:'Situations this page is built for', items:['Startup crossed 10 or 20 employees.','Labour notice received.','Factory setup.','Contract worker deployment.','Multi-state payroll.'] }
  ],defaultFaqs,['esi-pf-compliance-services','payroll-processing-services','professional-tax-registration-services','shop-and-establishment-registration'],'labour'),

  p('startup-80iac-tax-exemption','Service info','Section 80-IAC Startup Tax Exemption | WorkIndex','Section 80-IAC tax exemption for DPIIT-recognised startups. IMB application, eligibility, profit-year planning and 2026 transition explained.','Section 80-IAC Startup Tax Exemption','3 years of profit deduction for eligible startups','80-IAC is a separate tax approval route after DPIIT recognition, so recognition alone does not automatically create the deduction.',[
    { title:'80-IAC benefit in plain English', body:'Eligible DPIIT-recognised startups can claim a 100% deduction of profits for 3 consecutive assessment years out of the eligible window after IMB approval. The best claim years are usually planned around actual profitability.' },
    { title:'Eligibility criteria', items:['Private company, LLP or registered partnership.','DPIIT recognition obtained.','Turnover threshold met.','Not formed by splitting/reconstruction.','Innovation, improvement or scalability narrative.','Separate IMB approval before claiming.'] },
    { title:'2026 transition note', body:'Under the new Income Tax Act transition, section references may be renumbered while the substantive startup benefit should be checked in current forms and guidance. Angel tax abolition is separate from 80-IAC profit deduction.' },
    { title:'Process', steps:[{title:'DPIIT recognition',body:'Confirm entity and startup eligibility.'},{title:'IMB application',body:'Prepare innovation note, financials and founders profile.'},{title:'Approval',body:'Respond to queries or hearing if needed.'},{title:'Claim in ITR',body:'Choose the right 3 profitable years.'}] }
  ],defaultFaqs,['blog-startup-india-dpiit-registration','for-startups','startup-compliance-checklist','virtual-cfo-for-startups'],'tax'),

  p('bookkeeping-for-trading-companies','Niche bookkeeping','Bookkeeping for Trading Companies | WorkIndex','Accounting for wholesale, retail and distribution businesses. Invoice volume, inventory, GST, TDS, debtor ageing and cash flow explained.','Bookkeeping for Trading Companies','High-volume transactions, inventory and GST reconciled','Trading businesses need fast monthly books because inventory, GST ITC and receivables can move daily.',[
    { title:'Practical scope for trading businesses', items:['Daily purchase and sales invoice entry.','Inventory valuation by FIFO or weighted average.','GSTR-1 versus sales register.','GSTR-2B versus purchase register.','TDS under 194Q where applicable.','Creditor and debtor ageing.','Bank reconciliation and cash-flow reporting.'] },
    { title:'Documents to keep ready', items:['Purchase invoices with HSN and GST.','Sales invoices and e-way bills.','Stock register.','Bank statements.','Debtors/creditors list.','TDS challans and vendor ledgers.'] },
    { title:'Why expert help matters', body:'Traders have high transaction volume and working-capital pressure. Monthly reconciliation catches GST mismatches, inventory gaps and overdue debtors before they become year-end tax or bank problems.' },
    { title:'Questions before hiring', items:['Can you handle our invoice volume?','Do you reconcile GSTR-2B monthly?','Can you produce weekly ageing reports?','How soon after month-end is P&L ready?'] }
  ],defaultFaqs,['accounting-bookkeeping-services','gst-filing-services','tds-filing-services','for-small-businesses'],'tax'),

  p('financial-due-diligence-for-msme-loan','Service specific','Financial Due Diligence for MSME Bank Loans | WorkIndex','CA-assisted financial due diligence and reports for MSME bank loans. CMA data, project report, CA certificate, stock statements and collateral support.','Financial Due Diligence for MSME Loans','CMA data, project report and CA certificate','Bank loan files are won or lost on clean financial documents, realistic projections and reconciled books.',[
    { title:'Banks require specific financial documents', body:'Term loans, working capital limits, CGTMSE-backed loans and renewal of CC/OD limits each need different supporting papers. A CA can prepare CMA data, project report, certificates, provisional financials and stock/debtor statements.' },
    { title:'Types of bank documents', items:['CMA data with actuals and projections.','Project report and repayment schedule.','Stock statement and drawing power calculation.','Net worth or turnover certificate.','Audited or provisional financial statements.','Loan utilisation and collateral support documents.'] },
    { title:'Situations this page is built for', items:['First-time MSME loan applicant.','CC/OD renewal.','CGTMSE collateral-free loan.','Loan rejected due to weak financials.','SIDBI, MUDRA or bank-specific format needed.'] },
    { title:'Records needed', items:['Books and bank statements.','GST returns.','ITRs and financial statements.','Stock/debtor data.','Loan sanction terms.','Udyam certificate.'] }
  ],defaultFaqs,['accounting-bookkeeping-services','audit-services-cost-india','virtual-cfo-services-india','for-small-businesses'],'tax'),

  p('blog-ccfs-2026-guide','Blog','CCFS-2026 - How to Use MCA Amnesty Before July 15 | WorkIndex','Guide to Companies Compliance Facilitation Scheme 2026. Eligibility, forms covered, reduced additional fee and step-by-step process.','CCFS-2026 Guide','Use MCA compliance window before July 15','If a company has ignored ROC filings for years, CCFS-2026 is a time-sensitive cleanup route before normal consequences return.',[
    { title:'What CCFS-2026 is', body:'CCFS-2026 is a time-bound MCA scheme effective from 15 April 2026 to 15 July 2026 for eligible companies to regularise specified pending annual return and financial statement filings, or move towards dormancy/closure under the scheme.' },
    { title:'Who should use it', items:['Companies with MGT-7/AOC-4 backlog.','Inactive companies planning strike-off.','Companies wanting dormant status.','Directors needing clean compliance for future business.','Companies facing large additional fee exposure.'] },
    { title:'Step-by-step', steps:[{title:'Check company master data',body:'Identify active/defaulting status and years pending.'},{title:'Prepare financials',body:'Audit and approvals may be needed for each pending year.'},{title:'File forms',body:'Submit within the scheme period and keep acknowledgements.'},{title:'Choose next path',body:'Continue, dormant, or closure.'}] },
    { title:'After July 15', body:'Do not wait for the last week. DSC, audit, missing records and MCA portal issues can delay filings beyond the window.' }
  ],defaultFaqs,['ccfs-2026-mca-amnesty-scheme','roc-annual-filing-services','llp-annual-compliance-form-11','company-compliance-services'],'company'),

  p('blog-section-43b-msme-payment-rule','Blog','Section 43B MSME Payment Rule - 45-Day Deadline Explained | WorkIndex','How Section 43B MSME payment rule works. Payments to registered MSME vendors must be cleared within 45 or 15 days or expense may be disallowed.','Section 43B MSME Payment Rule','45-day deadline and year-end disallowance','Section 43B(h) changed buyer behaviour because delayed MSME payments can increase taxable income even when the expense is booked.',[
    { title:'What the rule is', body:'For specified payments to registered micro and small enterprises, deduction timing can depend on payment within MSMED Act timelines, commonly 15 days without written terms and up to 45 days with written terms.' },
    { title:'How disallowance works', items:['Expense is booked in accounts.','Payment remains overdue beyond permitted period.','Deduction may be disallowed for that year.','Deduction is generally allowed in the year of actual payment.','Vendor Udyam status and agreement terms matter.'] },
    { title:'Practical implications', items:['Large buyers need vendor MSME classification.','March year-end outstanding review is essential.','Procurement teams need payment discipline.','MSME vendors should keep Udyam details current.'] },
    { title:'What to ask your accountant', items:['Have we identified all MSME vendors?','Which payments cross 15/45 day rule?','What is the 43B add-back before ITR?','Can we pay before year-end or filing date?'] }
  ],defaultFaqs,['section-43b-payment-deadline-help','msme-udyam-registration-services','accounting-bookkeeping-services','itr-filing-for-business-owners'],'tax'),

  p('blog-fema-compliance-startup-india','Blog','FEMA Compliance for Startups - FC-GPR, FLA and More | WorkIndex','FEMA obligations when Indian startups raise foreign investment. FC-GPR, FLA, FC-TRS, valuation and compounding explained.','FEMA Compliance for Startups','FC-GPR, FLA and funding-round filings','Foreign money in a startup is not complete when the bank credit arrives. RBI reporting, valuation and allotment records must also line up.',[
    { title:'Why FEMA matters for funded startups', body:'VC, angel, foreign parent or NRI investment can trigger FC-GPR, valuation, share allotment records and FLA return obligations. Missed deadlines become due diligence findings during the next round.' },
    { title:'Core filings', items:['FC-GPR after allotment of shares to non-resident.','FLA return annually where FDI/ODI outstanding exists.','FC-TRS for resident/non-resident share transfer.','Valuation report for unlisted shares.','Compounding where reporting is delayed.'] },
    { title:'What CA+CS teams handle', items:['Cap table and board records.','Valuation coordination.','FIRMS portal filing.','Bank FIRC/KYC follow-up.','FLA return data.','Compounding application where needed.'] },
    { title:'Founder checklist', items:['Keep FIRC.','Do not delay allotment records.','Update cap table.','Track July 15 FLA deadline.','Mention all foreign investors in diligence folders.'] }
  ],defaultFaqs,['fema-compliance-services','startup-compliance-services','hire-company-secretary','virtual-cfo-for-startups'],'fema'),

  p('blog-gst-on-salary-perquisites','Blog','GST on Employee Salary and Benefits - What is Taxable? | WorkIndex','Is salary subject to GST? Employee benefits, canteen, club membership, transport, gifts and reimbursements under GST explained.','GST on Employee Salary and Benefits','Salary is not supply, but benefits need review','Salary itself is outside GST supply, but employer-provided benefits and recoveries can create GST and ITC questions.',[
    { title:'Core principle', body:'Salary paid under employer-employee relationship is not a GST supply. The complexity starts with perquisites, recoveries, reimbursements, gifts, canteen, insurance and employee transport.' },
    { title:'Benefits to review', items:['Canteen recoveries and vendor GST.','Club membership and employee welfare.','Employee transport or cab services.','Gifts above threshold.','Insurance premium treatment after rate/exemption changes.','Reimbursements versus allowances.'] },
    { title:'Common mistakes', items:['Claiming blocked ITC on employee benefits.','Charging GST on salary reimbursement without analysing relationship.','Ignoring GST on employee recoveries.','Mixing payroll accounting and vendor invoices.'] },
    { title:'Documents to keep', items:['HR policy.','Vendor contracts.','Employee recovery ledger.','Payroll register.','GST invoices.','ITC workings.'] }
  ],defaultFaqs,['gst-insurance-exemption-2025','rcm-reverse-charge-help','payroll-processing-services','gst-filing-services'],'gst'),

  p('blog-itr-filing-ay-2026-27-guide','Blog','ITR Filing Guide AY 2026-27 (FY 2025-26) | WorkIndex','Complete ITR filing guide for AY 2026-27. Due dates, forms, old vs new regime, AIS checks and transition notes explained.','ITR Filing Guide AY 2026-27','FY 2025-26 return preparation checklist','AY 2026-27 filing needs careful AIS reconciliation, regime comparison and transition awareness as the new Act framework starts from the next tax cycle.',[
    { title:'What year this guide covers', body:'AY 2026-27 generally corresponds to FY 2025-26. Current return filing should be checked against notified ITR forms and the applicable tax law for that assessment year; the new Income Tax Act transition creates references that may differ for future years.' },
    { title:'Key deadlines to review', items:['31 July for many non-audit individuals.','31 October for many audit cases.','31 December for belated/revised return as applicable.','Advance tax and self-assessment tax before filing.','Audit report deadline where audit applies.'] },
    { title:'What to check before filing', items:['AIS versus books/Form 16.','Old versus new regime.','TDS/TCS credit including LRS TCS.','Capital gains statements.','F&O business income and audit threshold.','Foreign income or assets.'] },
    { title:'Business filer note', body:'GST 2.0 changes may not directly change ITR forms, but they affect sales, purchase, GST payable, ITC and profitability in business books.' }
  ],defaultFaqs,['itr-filing-services','blog-itr-last-date-india','new-income-tax-act-2025-guide','income-tax-slab-rates-guide'],'tax'),

  p('blog-how-to-choose-ca-firm-india','Blog','How to Choose the Right CA Firm in India | WorkIndex','Choosing between CA firm and individual CA. Audit, ITR, GST, startup, international tax work, verification and red flags explained.','How to Choose the Right CA Firm','Firm versus individual CA, specialisation and red flags','The right CA choice depends less on title and more on fit: work type, urgency, industry, signing authority, team bandwidth and communication.',[
    { title:'CA firm versus individual CA', table:{headers:['Option','Best for','Watch-out'],rows:[['Individual CA','Simple ITR, consultation, small-business work','Limited backup if overloaded.'],['Small CA firm','GST, accounting, audit, company compliance','Check actual partner involvement.'],['Specialist firm','TP, FEMA, litigation, funded startup work','Higher fees but lower risk for complex work.']] } },
    { title:'What to verify', items:['ICAI membership where CA certification is needed.','UDIN on certificates.','Industry experience.','Engagement letter.','Data security and document sharing.','Response time during notices.'] },
    { title:'Red flags', items:['No written scope.','Suspiciously low quote for audit or notice.','No acknowledgements shared after filing.','No UDIN where required.','Promises guaranteed refunds or outcomes.'] },
    { title:'Questions to ask', items:['Who will actually do the work?','What is excluded?','What documents are needed?','How many revisions or replies are included?','Will you represent me if notice follows?'] }
  ],defaultFaqs,['hire-ca-online-india','blog-how-to-hire-accountant-india','ca-consultation-fees','how-to-hire-a-ca'],'tax'),

  p('blog-understanding-your-salary-slip','Blog','How to Read Your Salary Slip in India | WorkIndex','Understand salary slip components: basic, HRA, DA, allowances, PF, ESI, PT, TDS and tax impact.','How to Read Your Salary Slip in India','Basic, HRA, PF, ESI, PT and TDS explained','A salary slip is the bridge between payroll, Form 16 and ITR. Reading it early prevents year-end tax surprises.',[
    { title:'Earnings side', items:['Basic salary affects PF, gratuity and HRA formula.','HRA can be exempt under old regime if rent conditions are met.','DA is generally taxable and may affect retirement benefits.','Special allowance is usually taxable.','LTA needs eligible travel records.','Meal coupons/reimbursements need employer policy and limits.'] },
    { title:'Deductions side', items:['PF employee contribution.','ESI where applicable.','Professional tax.','TDS based on projected income and declarations.','Loan/recovery/advance deductions.'] },
    { title:'Cross-check with Form 16', items:['Gross salary total.','Exempt allowances.','Deductions declared and accepted.','TDS deducted each month.','Employer PAN/TAN.','Old/new regime selection.'] },
    { title:'When to ask for help', body:'If you changed jobs, received bonus, RSU/ESOP, relocation allowance, arrears, gratuity, pension or foreign payroll components, have a CA review your salary schedules before filing.' }
  ],defaultFaqs,['itr-filing-for-salaried-employees','hra-exemption-calculator','esi-pf-compliance-services','blog-tax-saving-tips-for-salaried-india'],'tax'),

  p('blog-gst-on-food-beverages-2026','Blog','GST on Food and Beverages in India 2026 - After GST 2.0 | WorkIndex','Updated GST treatment on food after GST 2.0. Restaurant food, packaged food, beverages, dairy, alcohol and cloud kitchens explained.','GST on Food and Beverages in India 2026','Restaurant, packaged food and beverage rate review','Food GST after rate rationalisation is category-specific: restaurant supply, packaged goods, dairy, beverages and alcohol are treated differently.',[
    { title:'GST 2.0 impact on food category', body:'Many food and FMCG categories saw rate rationalisation, but businesses should rely on exact HSN and notification wording. Restaurant food treatment, packaged food, dairy, aerated beverages and alcohol are not interchangeable categories.' },
    { title:'Common food categories', items:['Restaurant and cloud-kitchen food.','Packaged snacks, biscuits and namkeen.','Dairy products.','Sweets and mithai.','Aerated/caffeinated beverages.','Alcohol for human consumption outside GST and state-tax governed.'] },
    { title:'What food businesses need to update', items:['Billing software.','Product HSN mapping.','Menu and price list.','Purchase ITC tracking.','Marketplace food delivery settlement accounting.','FSSAI and GST records.'] },
    { title:'When to consult an expert', items:['Mixed food and beverage billing.','Alcohol plus food restaurant.','Cloud kitchen selling through platforms.','Packaged food manufacturing.','Old versus new rate correction.'] }
  ],defaultFaqs,['gst-2-rate-changes-guide','bookkeeping-for-restaurants','for-restaurants','gst-for-small-business'],'gst'),

  p('flutter-developer-india','Tech hire','Hire Flutter Developer India | WorkIndex','Find verified Flutter developers in India for cross-platform iOS and Android mobile apps. Pricing, skills and hiring checklist.','Hire Flutter Developer India','iOS and Android from one codebase','Flutter developers build mobile apps quickly across iOS and Android with one Dart codebase and consistent UI.',[
    { title:'What Flutter developers build', items:['Cross-platform mobile apps.','Internal business apps.','Fintech, ecommerce and logistics apps.','Complex UI apps.','Firebase-backed apps.','Native feature integrations via platform channels.'] },
    { title:'What to mention when posting', items:['Target platforms.','App category.','Backend integration.','Figma/design readiness.','Store submission needs.','Budget and timeline.'] },
    { title:'Typical pricing in India', table:{headers:['Level/project','Typical range'],rows:[['Junior developer','Rs. 20,000-45,000/month'],['Mid-level','Rs. 50,000-90,000/month'],['Senior','Rs. 90,000-1,60,000/month'],['Simple app project','Rs. 40,000-1,20,000+']] } },
    { title:'Flutter versus React Native', body:'Flutter gives strong UI consistency and performance. React Native may fit JavaScript-heavy teams. Choose based on team skill, integrations, timeline and long-term maintenance.' }
  ],defaultFaqs,['nodejs-developer-india','react-developer-india','python-developer-india','web-developer-india'],'tech'),

  p('mobile-app-developer-india','Tech hire','Hire Mobile App Developer India | WorkIndex','Find verified mobile app developers in India for iOS, Android, Flutter and React Native apps. Pricing and hiring checklist.','Hire Mobile App Developer India','iOS, Android, Flutter or React Native','Mobile app hiring starts with one choice: native, cross-platform or PWA. The right answer depends on product complexity and budget.',[
    { title:'What mobile app developers build', items:['Native iOS apps.','Native Android apps.','Flutter apps.','React Native apps.','Progressive web apps.','Backend-connected apps with payments, maps, chat or notifications.'] },
    { title:'What to mention when posting', items:['Platform.','Technology preference.','Number of screens.','Backend availability.','Features like payments, maps, chat, video and push.','Budget range.','Store publishing and maintenance.'] },
    { title:'Typical project pricing', table:{headers:['Project type','Typical range'],rows:[['Simple app','Rs. 1.5-4 lakh'],['Medium app','Rs. 4-12 lakh'],['Complex app','Rs. 12-40 lakh+'],['Maintenance','Rs. 15,000-50,000/month']] } },
    { title:'Common mistakes', items:['Starting without Figma or feature list.','Ignoring backend/API cost.','No post-launch maintenance plan.','No app-store ownership clarity.','No source-code handover terms.'] }
  ],defaultFaqs,['flutter-developer-india','react-developer-india','nodejs-developer-india','web-developer-india'],'tech'),

  p('web-developer-kolkata','City service','Web Developer in Kolkata | WorkIndex','Find verified web developers in Kolkata for business websites, React apps, ecommerce and WordPress development.','Web Developer in Kolkata','Business websites, ecommerce and custom apps','Kolkata combines a growing Salt Lake/New Town tech ecosystem with traditional trading, export and media demand.',[
    { title:'Kolkata web development context', body:'Kolkata developers support trading catalogues, ecommerce stores, logistics systems, media websites, jute/tea exporter sites and service-company lead generation pages. Many projects need cost-effective execution with clear English communication.' },
    { title:'Common project types', items:['B2B product catalogues.','WordPress business websites.','Shopify or WooCommerce stores.','React dashboards.','Logistics backends.','Media/news platforms.'] },
    { title:'What to mention', items:['Existing URL.','Design readiness.','Preferred stack.','Payment/shipping integrations.','Content and product count.','Maintenance expectations.'] }
  ],defaultFaqs,['web-developer-india','web-developer-bangalore','react-developer-india','nodejs-developer-india'],'tech'),

  p('web-developer-ahmedabad','City service','Web Developer in Ahmedabad | WorkIndex','Find verified web developers in Ahmedabad for business websites, Shopify D2C stores, React apps and custom web development.','Web Developer in Ahmedabad','Shopify, catalogues and startup web builds','Ahmedabad web work is shaped by textiles, FMCG, diamonds, exporters and a strong entrepreneurial small-business base.',[
    { title:'Ahmedabad web development context', body:'Developers around Thaltej, SG Highway and the wider Gujarat tech market often build D2C stores, B2B catalogues, export company sites, custom dashboards and startup MVPs.' },
    { title:'Common project types', items:['Textile catalogue websites.','Shopify D2C stores.','Export business websites.','React dashboards.','Lead generation pages.','WooCommerce stores for local retailers.'] },
    { title:'What to mention', items:['Product categories.','Languages needed.','Shopify/WooCommerce preference.','Payment gateway.','Shipping integration.','SEO and maintenance scope.'] }
  ],defaultFaqs,['web-developer-india','shopify-development-services','hire-shopify-developer','ecommerce-website-development'],'tech'),

  p('graphic-designer-hire-india','Hire page','Hire Graphic Designer India | WorkIndex','Find verified graphic designers in India for logos, brand identity, social media graphics, packaging, brochures and marketing creatives.','Hire Graphic Designer India','Logo, brand identity, social media and packaging','Graphic designers create static and brand communication assets, while UI/UX designers focus on software screens and user journeys.',[
    { title:'What graphic designers deliver', items:['Logo and brand identity.','Social media creative templates.','Packaging design.','Brochures, flyers and catalogues.','Pitch deck visuals.','Print ads and banners.','Email/newsletter creatives.'] },
    { title:'What to mention when posting', items:['Logo only or full brand kit.','Industry and brand tone.','Reference brands.','File formats needed.','Print or digital usage.','Revision expectations.'] },
    { title:'Typical pricing in India', table:{headers:['Deliverable','Typical range'],rows:[['Logo','Rs. 3,000-20,000'],['Brand identity','Rs. 15,000-60,000'],['10 social templates','Rs. 8,000-25,000'],['Packaging design','Rs. 10,000-40,000'],['Monthly retainer','Rs. 12,000-35,000']] } },
    { title:'Ownership checklist', items:['Source files.','Font/license clarity.','Commercial usage rights.','Print-ready exports.','Revision count.','Brand guidelines.'] }
  ],defaultFaqs,['hire-ui-ux-designer-india','hire-digital-marketing-expert-india','business-website-development','web-developer-india'],'tech'),

  p('gst-suspension-help','Problem help','GST Registration Suspended - Help | WorkIndex','Help when GSTIN is suspended by officer. Suspension vs cancellation, reasons, response process and restoration explained.','GST Suspended GSTIN Help','Suspension versus cancellation - act fast','GST suspension can stop valid invoicing and disturb customer ITC, so it should be handled before it becomes cancellation.',[
    { title:'Suspension is a warning stage', body:'When cancellation proceedings begin or certain defaults occur, GSTIN status can show suspended. During suspension, return filing and tax invoice issuance can be restricted and buyers may face ITC uncertainty.' },
    { title:'Common reasons', items:['Non-filing of returns.','Principal place of business issue.','Registration document mismatch.','Voluntary cancellation application pending.','Officer-initiated cancellation proceedings.'] },
    { title:'Process to restore', steps:[{title:'Check portal notices',body:'Download REG-31 or related notice.'},{title:'Identify cause',body:'Non-filing, address, Aadhaar, documents or cancellation application.'},{title:'Fix compliance',body:'File returns/pay dues/update proof as applicable.'},{title:'Respond',body:'Upload response and track restoration.'}] },
    { title:'Urgency', items:['Do not issue invoices casually while suspended.','Warn buyers only after expert review.','Keep acknowledgement of response.','If cancelled, revocation deadlines start mattering.'] }
  ],defaultFaqs,['gst-registration-cancelled-by-officer','gst-cancellation-revocation-help','late-gst-filing-penalty-help','gst-notice-reply-help'],'gst'),

  p('how-to-register-a-startup-india','How-to','How to Register a Startup in India | WorkIndex','Step-by-step startup registration in India. Pvt Ltd or LLP, DPIIT recognition, GST, bank account and first-year compliance explained.','How to Register a Startup in India','Pvt Ltd, DPIIT recognition and first-year compliance','Startup registration is a sequence: entity first, then bank/tax registrations, then DPIIT and compliance calendar.',[
    { title:'Step 1 - choose structure', body:'Most investor-facing startups choose private limited company for fundraising, ESOPs and credibility. LLP can work for professional services. OPC fits a solo founder who is not planning external investment soon.' },
    { title:'Step 2 - incorporate', items:['DSC and DIN.','Name reservation.','SPICe+ or relevant MCA forms.','MOA/AOA or LLP agreement.','PAN/TAN.','Bank account after incorporation.'] },
    { title:'Step 3 - DPIIT recognition', body:'DPIIT recognition is optional but useful for government schemes and 80-IAC pathway. It is not the same as 80-IAC approval.' },
    { title:'First-year compliance calendar', items:['GST if B2B/export/threshold requires.','TDS from salaries or vendor payments.','PT/PF/ESI based on state and employee count.','Bookkeeping from day one.','Annual audit and ROC filings.'] }
  ],defaultFaqs,['business-registration','startup-compliance-services','startup-80iac-tax-exemption','gst-registration-for-startups'],'company'),

  p('gst-notice-response-within-7-days-help','Problem help','Urgent GST Notice Response - 7-Day Deadline Help | WorkIndex','Help responding to urgent GST notices with 7-day deadlines including registration SCN, REG-17 cancellation and REG-31 suspension notices.','Urgent GST Notice - 7-Day Deadline Help','Registration and cancellation notices need immediate action','Some GST notices move fast. Missing a short registration, suspension or cancellation deadline can turn a manageable reply into revocation or appeal work.',[
    { title:'Notices that may have short windows', items:['REG-17 cancellation notice.','REG-31 suspension notice.','Registration SCN during GST application.','Biometric verification appointment timeline.','Document clarification during risk-based registration.'] },
    { title:'Why it is time-critical', body:'A missed response can result in rejection, continued suspension or cancellation. After cancellation, revocation has its own deadline and may require clearing pending returns and dues.' },
    { title:'Process', steps:[{title:'Download notice',body:'Use portal notice reference, not email summary alone.'},{title:'Read grounds',body:'Identify exact objection and legal form.'},{title:'Gather proof',body:'Address, bank, identity, returns, invoices or books.'},{title:'Upload reply',body:'Respond point-wise and save acknowledgement.'}] },
    { title:'What to include in WorkIndex post', items:['Notice form number.','Date served.','Deadline.','Current GSTIN status.','Reason stated by officer.','Documents already available.'] }
  ],defaultFaqs,['gst-registration-cancelled-by-officer','gst-suspension-help','gst-notice-reply-help','gst-registration-rejected-help'],'gst'),

  p('itr-defective-return-139-9-help','Problem help','Defective Return Notice - Section 139(9) Response Help | WorkIndex','Help responding to defective return notice under Section 139(9). Defect codes, 15-day response, correction and refiling explained.','Defective Return Notice 139(9)','15 days to respond - here is how','A 139(9) notice means the return has a structural defect. If not corrected, the return can be treated as invalid.',[
    { title:'What a defective return means', body:'Common defects include wrong ITR form, income schedule mismatch, TDS schedule mismatch, missing balance sheet/P&L, missing audit details or inconsistent totals. The notice code matters.' },
    { title:'Situations this page is built for', items:['ITR-1 filed despite capital gains.','F&O trader used ITR-2 instead of ITR-3.','TDS income not reflected in schedules.','Business return missing balance sheet.','Audit report details missing.','AIS income mismatch.'] },
    { title:'Common defect codes to discuss', items:['Gross total income mismatch.','TDS income not included in income heads.','Wrong ITR form.','Balance sheet/P&L not filled.','Audit report number missing.'] },
    { title:'Process', steps:[{title:'Read defect code',body:'Do not guess from subject line.'},{title:'Choose response',body:'Agree and correct, or disagree with explanation.'},{title:'File corrected return',body:'Use portal response workflow.'},{title:'Save acknowledgement',body:'Track status after submission.'}] }
  ],defaultFaqs,['defective-return-notice-help','itr-processing-failed-help','revised-return-filing-help','itr-notice-help'],'tax'),

  p('gst-2-rate-calculator','Calculator','GST Calculator 2026 - New Rates (5%, 18%, 40%) | WorkIndex','Calculate GST under GST 2.0 rate buckets. Inclusive/exclusive amount, old vs new rate and category review guidance.','GST Calculator 2026','New rate buckets and category checks','A calculator helps with arithmetic, but HSN classification still decides which GST rate applies.',[
    { title:'Calculator widget concept', body:'Inputs: amount, inclusive/exclusive mode, goods/services category and rate bucket. Output: GST amount, net amount, gross amount and old-versus-new comparison where category mapping is known.' },
    { title:'Updated rate table concept', table:{headers:['Bucket','Use case'],rows:[['5%','Essentials and notified lower-rate goods/services.'],['18%','Standard goods/services and many professional/service categories.'],['40%','Notified luxury/sin categories.'],['Exempt/Nil','Specific exempt goods/services only.']] } },
    { title:'When to consult an expert', items:['Mixed supply.','Composite supply.','Food/beverage classification.','Construction or works contract.','Insurance and exempt supply ITC impact.','Old-rate correction after GST 2.0.'] },
    { title:'Common mistakes', items:['Using old 12%/28% rate without checking notification.','Assuming all services changed.','Ignoring HSN notes.','Charging correct rate but wrong place of supply.'] }
  ],defaultFaqs,['gst-2-rate-changes-guide','gst-calculator','gst-hsn-code-finder','gst-filing-services'],'gst'),

  p('income-tax-calculator-ay-2026-27','Calculator','Income Tax Calculator AY 2026-27 | WorkIndex','Calculate income tax for AY 2026-27 under old and new tax regime. Salary, business, capital gains, deductions and surcharge review.','Income Tax Calculator AY 2026-27','Old versus new regime for FY 2025-26','Tax calculators are a starting point. Real optimisation depends on income heads, deductions, TDS/TCS credits and special-rate income.',[
    { title:'Calculator widget concept', body:'Inputs: salary, business income, capital gains, other income, deductions, HRA, home loan, TDS/TCS and regime selection. Output: taxable income, tax under both regimes, effective tax rate and rough recommendation.' },
    { title:'AY 2026-27 slab note', body:'For AY 2026-27, use the notified rates and standard deduction applicable to FY 2025-26. Current official tax-rate pages should be checked before final filing because Finance Act changes can alter slabs or rebates.' },
    { title:'When a CA can optimise beyond calculator', items:['Capital gains with exemptions.','Salary plus business income.','NRI/foreign income.','F&O or crypto.','Old/new regime edge cases.','TCS/LRS credit and refund planning.'] },
    { title:'Documents needed', items:['Form 16.','AIS and Form 26AS.','Capital gains statements.','Deduction proofs.','Bank interest.','Business P&L and balance sheet.'] }
  ],defaultFaqs,['income-tax-calculator','old-vs-new-tax-regime','income-tax-slab-rates-guide','income-tax-new-regime-deductions'],'tax'),

  p('compliance-calendar-india-2026-27','Reference tool','Business Compliance Calendar India FY 2026-27 | WorkIndex','Compliance calendar for Indian businesses in FY 2026-27. GST, TDS, ROC, PF, ESI, advance tax, ITR and FEMA deadlines.','Business Compliance Calendar FY 2026-27','Every deadline, every month','A business compliance calendar prevents penalties, interest, return blocks, credit issues and last-minute filing panic.',[
    { title:'Monthly recurring deadlines', items:['7th: TDS/TCS deposit for previous month.','10th: GSTR-7 and GSTR-8 where applicable.','11th: GSTR-1 monthly.','13th: IFF for QRMP.','15th: PF/ESI and quarterly advance tax instalments where applicable.','20th: GSTR-3B monthly.','25th: PMT-06 for QRMP.'] },
    { title:'Quarterly deadlines', items:['TDS return due dates by quarter.','Advance tax on 15 June, 15 September, 15 December and 15 March.','QRMP GSTR-1 and GSTR-3B quarter-end filings.','Board and investor reporting where required.'] },
    { title:'Annual deadlines', items:['LLP Form 11 and Form 8.','FLA return by July 15 where applicable.','ITR deadlines.','DIR-3 KYC.','GSTR-9 annual return.','ROC AOC-4 and MGT-7 after AGM.','IEC annual update window.'] },
    { title:'How to use this calendar', body:'Create a monthly owner for each compliance: GST, TDS, payroll, MCA, FEMA, income tax and city/state registrations. Do not rely on one annual accountant reminder.' }
  ],defaultFaqs,['startup-compliance-checklist','roc-annual-filing-services','tds-filing-services','ccfs-2026-mca-amnesty-scheme'],'tax'),

  p('for-hotel-hospitality-businesses','Segment','Tax and Accounting for Hotels and Hospitality Businesses | WorkIndex','GST, TDS, payroll, FSSAI, bookkeeping and compliance for hotels, resorts, serviced apartments and hospitality businesses.','Tax and Accounting for Hotels','Room tariffs, food, payroll and licences tracked','Hospitality accounting combines rooms, food and beverages, banquet income, OTAs, payroll, licences and GST classification.',[
    { title:'Typical work needed', items:['Room revenue and OTA settlement reconciliation.','Restaurant and banquet GST.','TDS on rent, contractors and commissions.','Payroll, PF, ESI and professional tax.','FSSAI and local licences.','Inventory for food/beverage.','Monthly MIS by outlet or property.'] },
    { title:'Documents to keep ready', items:['PMS/OTA reports.','Zomato/Swiggy/booking platform settlements.','FSSAI licence.','GST returns.','Vendor invoices.','Payroll register.','Bank/card/UPI settlements.'] },
    { title:'Common mistakes', items:['Not reconciling OTA deductions.','Mixing room and food GST rates.','No inventory control.','Missing TDS on commission.','Weak cash controls.'] }
  ],defaultFaqs,['for-restaurants','bookkeeping-for-restaurants','fssai-registration-services','gst-filing-services'],'gst'),

  p('for-ca-students-articleship','Segment','For CA Students and Articleship Candidates | WorkIndex','Guidance for CA students and articleship candidates. Find CA firms, prepare profiles, compare work exposure and avoid poor-fit articleship choices.','For CA Students and Articleship','Find better firms, exposure and training fit','CA students need the right articleship environment: audit exposure, tax work, learning culture, stipend clarity and exam support.',[
    { title:'What CA students should compare', items:['Audit, tax, GST, ROC, FEMA or startup exposure.','Firm size and industry mix.','Stipend and working hours.','Exam leave policy.','Client visit expectations.','Mentorship and review culture.'] },
    { title:'Profile checklist', items:['Education and CA level cleared.','IT/OC training status.','Excel/Tally/Zoho/GST portal skills.','Preferred city.','Industry interests.','Availability date.'] },
    { title:'Questions before joining', items:['What work will I do in first 6 months?','How is exam leave handled?','Who reviews my work?','Will I get audit field exposure?','Is overtime common during season?'] }
  ],defaultFaqs,['for-chartered-accountants','hire-ca-online-india','audit-services-bangalore','company-compliance-services'],'tax'),

  p('bookkeeping-for-manufacturing','Niche bookkeeping','Bookkeeping for Manufacturing Companies | WorkIndex','Bookkeeping for manufacturers. BOM, inventory, WIP, job work, GST, payroll, costing and monthly MIS explained.','Bookkeeping for Manufacturing','Inventory, WIP, job work and costing','Manufacturing books need material, labour, overhead and finished-goods tracking, not just sales and purchases.',[
    { title:'Scope of manufacturing bookkeeping', items:['Raw material and finished goods inventory.','BOM and production consumption.','WIP valuation.','Job work challans.','Factory payroll and PF/ESI.','GST ITC and e-way bills.','Machine depreciation.','Cost centre reports.'] },
    { title:'Documents needed', items:['Purchase invoices.','GRNs.','Production reports.','Stock register.','Job work records.','Sales invoices.','Payroll and contractor bills.','Utility and factory overhead bills.'] },
    { title:'Avoid these issues', items:['No physical stock reconciliation.','WIP ignored.','Job work not tracked.','GST mismatch.','No product-wise gross margin.'] }
  ],defaultFaqs,['for-manufacturing-businesses','accounting-bookkeeping-services','hire-cost-accountant','audit-services-cost-india'],'tax'),

  p('gst-services-bangalore-north','Sub-city service','GST Services in Bangalore North | WorkIndex','Find GST consultants in Bangalore North for startups, traders, SaaS companies, ecommerce sellers and manufacturing units.','GST Services in Bangalore North','Hebbal, Yelahanka, Manyata and nearby business hubs','Bangalore North has SaaS teams, offices near Manyata Tech Park, airport-linked logistics, traders and growing residential-commercial businesses.',[
    { title:'Local GST needs', items:['Startup GST registration and LUT.','SaaS export invoicing.','Ecommerce seller returns.','Logistics and e-way bill support.','Restaurant and retail GST.','Notice response.'] },
    { title:'What to mention', items:['Business location.','GSTIN status.','Monthly invoice count.','Software used.','Export/RCM exposure.','Pending notices or returns.'] },
    { title:'Why local context helps', body:'A Bangalore North expert can combine remote filing with familiarity around local address proof, startup vendors, ecommerce sellers and logistics-heavy businesses.' }
  ],defaultFaqs,['gst-services-bangalore','gst-registration-for-startups','gst-for-saas-companies','gst-filing-services'],'gst'),

  p('audit-services-mumbai','City-service audit','Audit Services in Mumbai | WorkIndex','Find verified audit firms in Mumbai for statutory audit, tax audit, internal audit, stock audit and startup or BFSI audit work.','Audit Services in Mumbai','BFSI, media, trading and real estate audits','Mumbai audit needs include finance, stockbroking, media, trading, real estate, import-export and group-company reporting.',[
    { title:'Mumbai audit context', body:'Mumbai companies often need statutory audit, tax audit, internal controls, stock audits, investor diligence, related-party review and consolidated reporting across multiple entities.' },
    { title:'Common audit needs', items:['Statutory audit.','Tax audit.','Internal audit.','Stock audit.','Real estate project audit.','BFSI and broker compliance support.','Startup diligence audit.'] },
    { title:'What to mention', items:['Entity type.','Turnover.','Books software.','Previous auditor.','Deadline.','Audit scope and branches.'] }
  ],defaultFaqs,['statutory-audit-services','audit-services-cost-india','accounting-services-mumbai','due-diligence-services'],'tax'),

  p('audit-services-hyderabad','City-service audit','Audit Services in Hyderabad | WorkIndex','Find verified audit firms in Hyderabad for statutory audit, tax audit, internal audit, startup audit and pharma/manufacturing audit work.','Audit Services in Hyderabad','Startup, pharma and services audit firms','Hyderabad audit demand spans HITEC City startups, pharma, hospitals, real estate, manufacturing and IT services.',[
    { title:'Hyderabad audit context', body:'Hyderabad businesses often need audit firms familiar with technology revenue, pharma/manufacturing inventory, hospital accounts, real estate projects and multi-state payroll.' },
    { title:'Common audit needs', items:['Statutory audit.','Tax audit.','Internal audit.','Startup investor readiness.','Pharma/manufacturing stock review.','GST reconciliation support.'] },
    { title:'What to mention', items:['Industry.','Turnover.','Inventory complexity.','Funding status.','Books quality.','Deadline and previous audit status.'] }
  ],defaultFaqs,['statutory-audit-services','audit-for-startups','audit-services-cost-india','accounting-services-india'],'tax'),

  p('documents-required-for-shop-act','Documents','Documents Required for Shop and Establishment Registration | WorkIndex','Document checklist for Shop Act registration in India. Owner KYC, premises proof, employee count, business details and state forms explained.','Documents Required for Shop Act Registration','Owner KYC, premises proof and state form checklist','Shop and Establishment documents vary by state, but identity, address and business details are always central.',[
    { title:'Core documents', items:['PAN and Aadhaar of owner/director/partner.','Business constitution proof.','Premises proof: rent agreement or ownership document.','NOC from owner.','Recent utility bill.','Business name, activity and employee count.','Photograph/signature where required.'] },
    { title:'Entity-specific documents', items:['Proprietorship: proprietor KYC and business proof.','Partnership: partnership deed.','LLP: incorporation certificate and LLP agreement.','Company: COI, MOA/AOA and authorised signatory details.'] },
    { title:'Common rejection reasons', items:['Address mismatch.','Old utility bill.','No owner NOC.','Wrong employee count.','Incorrect state portal selection.'] }
  ],defaultFaqs,['shop-and-establishment-registration','business-registration','documents-required-for-gst-registration','professional-tax-registration-services'],'company'),

  p('how-to-apply-for-pan-card-india','How-to','How to Apply for PAN Card in India | WorkIndex','Step-by-step guide to apply for PAN card in India. Individual, company, partnership and correction process explained.','How to Apply for PAN Card in India','Individual and business PAN application steps','PAN is the base tax identity for individuals and entities. Businesses need the correct entity PAN before GST, bank accounts and tax filings.',[
    { title:'Who needs PAN', items:['Individuals filing ITR.','Companies and LLPs.','Partnership firms.','Trusts and societies.','Foreign nationals/entities with Indian tax transactions.','Businesses applying for GST or IEC.'] },
    { title:'Process', steps:[{title:'Choose applicant type',body:'Individual, company, firm, trust or foreign applicant.'},{title:'Fill form',body:'Use NSDL/Protean or UTIITSL workflow as applicable.'},{title:'Submit KYC',body:'Aadhaar/eKYC or physical documents.'},{title:'Track and receive PAN',body:'Download e-PAN or await physical card.'}] },
    { title:'Correction cases', items:['Name mismatch.','Date of birth/incorporation mismatch.','Address update.','Duplicate PAN issue.','PAN-Aadhaar linking issue for individuals.'] }
  ],defaultFaqs,['business-registration','documents-required-for-company-registration','gst-registration-help','itr-filing-services'],'tax'),

  p('section-80d-health-insurance-deduction','Info guide','Section 80D Health Insurance Deduction | WorkIndex','Section 80D deduction for health insurance premiums, parents, senior citizens, preventive check-up and old vs new regime treatment.','Section 80D Health Insurance Deduction','Health insurance tax benefit under old regime','Section 80D can reduce tax under the old regime, but it is usually not available under the new regime for most taxpayers.',[
    { title:'What Section 80D covers', items:['Health insurance premium for self, spouse and children.','Premium for parents.','Higher limits for senior citizens.','Preventive health check-up within overall limit.','Medical expenditure for uninsured senior citizens in specified cases.'] },
    { title:'Old versus new regime', body:'80D is a major old-regime deduction. Taxpayers under the new regime should not assume the same deduction is available unless current law specifically permits it.' },
    { title:'Documents required', items:['Insurance premium receipt.','Policy document.','Payment proof other than cash for premium.','Parent age proof.','Preventive check-up receipts.'] },
    { title:'Common mistakes', items:['Claiming premium paid in cash.','Claiming employer-paid premium personally.','Missing parents deduction.','Double-claiming reimbursement.'] }
  ],defaultFaqs,['income-tax-new-regime-deductions','old-vs-new-tax-regime','itr-filing-for-salaried-employees','blog-tax-saving-tips-for-salaried-india'],'tax'),

  p('gst-for-logistics-transport','Niche segment','GST for Logistics and Transport Businesses | WorkIndex','GST compliance for logistics, transporters, GTA, e-way bills, RCM, fleet expenses and warehousing businesses in India.','GST for Logistics and Transport','GTA, e-way bills, RCM and fleet accounting','Logistics GST combines GTA rules, e-way bills, RCM, fuel/vehicle ITC restrictions, warehousing and high-volume reconciliations.',[
    { title:'Key GST areas for logistics', items:['GTA versus courier/logistics classification.','RCM on GTA where applicable.','E-way bill generation and expiry.','Fleet expenses and ITC restrictions.','Warehousing and storage services.','Multi-state operations and branch billing.'] },
    { title:'Situations this page is built for', items:['Transporter starting GST compliance.','Fleet operator with e-way bill issues.','Warehouse business billing clients.','Company receiving GTA services and unsure about RCM.','Goods detained due to e-way bill mismatch.'] },
    { title:'Documents required', items:['LR/consignment notes.','Vehicle records.','E-way bills.','Client invoices.','Fuel and repair bills.','Driver/contractor payments.','GSTR-1/3B and GSTR-2B.'] },
    { title:'Common mistakes', items:['Wrong GTA treatment.','Expired e-way bill.','Claiming blocked ITC.','No trip-wise reconciliation.','Missing RCM entries.'] }
  ],defaultFaqs,['rcm-reverse-charge-help','gst-eway-bill-new-rules','gst-filing-services','bookkeeping-for-trading-companies'],'gst')
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
