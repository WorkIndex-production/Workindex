const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const site = 'https://workindex.co.in';
const today = '2026-05-14';

const groups = {
  'for-startups': ['Best Accounting, GST and Compliance Services for Startups in India', 'startup founders', 'company registration, GST, bookkeeping, payroll, ROC annual filings, DPIIT/startup readiness and investor reporting', 'founders need clean books, tax compliance and documentation before funding, loans, vendor contracts or audits', ['incorporation certificate or proposed entity details', 'PAN/TAN, DSC and DIN details', 'founder KYC and address proof', 'bank account, invoices and accounting data', 'GST, payroll and funding documents if available']],
  'for-small-businesses': ['Accounting and GST Services for Small Businesses in India', 'small business owners', 'GST filing, bookkeeping, ITR, TDS, payroll, tax planning and annual compliance', 'small businesses often lose time on invoices, GST returns and books instead of sales and operations', ['GSTIN, sales and purchase invoices', 'bank statements and cash book', 'expense bills', 'salary and vendor payment details', 'previous ITR/GST filings']],
  'for-freelancers': ['Tax Filing and Accounting Services for Freelancers in India', 'freelancers and consultants', 'ITR-3/ITR-4 guidance, presumptive taxation, GST applicability, invoices, expense tracking and advance tax', 'freelancers need to report client income, claim valid business expenses and avoid AIS or bank-credit mismatch issues', ['PAN, Aadhaar and bank statements', 'client invoices and payment receipts', 'Form 26AS, AIS and TIS', 'expense proofs for laptop, internet, software and travel', 'GST returns if registered']],
  'for-restaurants': ['GST and Accounting Services for Restaurants in India', 'restaurants, cafes and cloud kitchens', 'GST, POS sales reconciliation, food aggregator statements, payroll, vendor payments and bookkeeping', 'restaurants handle daily sales, cash, delivery platform deductions and vendor purchases that need careful reconciliation', ['POS reports and Zomato/Swiggy statements', 'sales and purchase invoices', 'GST returns and input credit data', 'staff salary records', 'rent, utilities and vendor bills']],
  'for-ecommerce-sellers': ['Best Accounting and GST Services for Ecommerce Sellers in India', 'ecommerce sellers', 'GST registration, marketplace reconciliation, TCS/TDS, inventory, returns, bookkeeping and ITR', 'ecommerce sellers need to reconcile Amazon/Flipkart/Meesho statements with GST, bank credits and inventory', ['marketplace settlement reports', 'sales return and cancellation reports', 'GSTIN and GSTR-1/GSTR-3B data', 'purchase and inventory records', 'bank statements and payment gateway reports']],
  'for-youtubers': ['Tax Filing Services for YouTubers in India', 'YouTubers', 'ITR, GST on sponsorships, foreign remittances, AdSense income, expenses and advance tax', 'creator income can include AdSense, sponsorships, affiliate payouts, events and foreign receipts that need correct tax treatment', ['AdSense and platform statements', 'sponsorship invoices', 'bank/FIRC details for foreign receipts', 'equipment and software expense bills', 'AIS/TIS and Form 26AS']],
  'for-content-creators': ['Tax and Accounting Services for Content Creators in India', 'content creators and influencers', 'brand invoices, GST, TDS, ITR, expense tracking and creator business setup', 'creators need clean records for brand deals, GST thresholds, TDS credits and professional expense claims', ['brand collaboration invoices', 'payment proofs and TDS certificates', 'equipment, studio and travel expenses', 'platform income statements', 'GST data if registered']],
  'for-shop-owners': ['GST and Accounting Services for Shop Owners in India', 'retail shop owners', 'GST filing, sales/purchase books, cash reconciliation, stock records, ITR and local compliance', 'shop owners need accurate books for GST, supplier credit, bank loans and tax filing', ['daily sales summary', 'purchase invoices', 'cash and bank records', 'stock and supplier ledgers', 'GST and ITR history']],
  'for-saas-founders': ['Accounting and Compliance Services for SaaS Founders in India', 'SaaS founders', 'subscription revenue, GST/export treatment, accounting, TDS, payroll, investor reporting and virtual CFO support', 'SaaS businesses need clean MRR, deferred revenue, export documentation and finance controls', ['subscription/payment gateway reports', 'export invoices and FIRC/BRC where applicable', 'payroll and contractor payments', 'cloud/software expenses', 'MIS and investor reporting requirements']],
  'for-nris': ['ITR and Tax Consultant Services for NRIs in India', 'NRIs', 'NRI ITR, property sale capital gains, rental income, TDS, DTAA, NRO/NRE income and notice support', 'NRIs often need help with Indian income, TDS, property transactions and foreign-residency documentation', ['PAN and passport/residency details', 'NRO/NRE bank statements', 'Form 26AS, AIS and TIS', 'property sale/rent documents', 'DTAA and tax residency documents if applicable']],
  'for-doctors': ['Accounting and Tax Services for Doctors and Clinics in India', 'doctors and clinics', 'professional ITR, clinic bookkeeping, GST where applicable, payroll, equipment depreciation and TDS', 'doctors need separate professional records for consultation income, clinic expenses and equipment purchases', ['consultation receipts and bank deposits', 'clinic rent, staff salary and equipment bills', 'professional expense proofs', 'Form 26AS and AIS', 'books or clinic software exports']],
  'for-lawyers': ['Accounting and Tax Services for Lawyers in India', 'lawyers and legal consultants', 'professional income ITR, GST applicability, TDS credits, office expenses and advance tax', 'lawyers need clean fee records, client receipts, chambers expenses and correct professional income reporting', ['fee invoices and receipts', 'client TDS details', 'office rent and library/software expenses', 'bank statements', 'Form 26AS and AIS']],
  'for-real-estate-agents': ['Tax and GST Services for Real Estate Agents in India', 'real estate agents', 'commission income, GST, TDS, ITR, brokerage invoices and expense records', 'agents need to report brokerage correctly, reconcile TDS and maintain proof for commissions and marketing expenses', ['brokerage invoices', 'TDS certificates', 'bank credits and cash records', 'marketing/travel expense bills', 'property transaction references']],
};

const problemPages = {
  'late-gst-filing-penalty-help': ['Late GST Filing Penalty Help', 'late GST return filers', 'GSTR-3B is a summary return for declaring GST liabilities and normal taxpayers file it for each tax period. GST portal guidance also notes that interest and late fee may be system-computed while filing GSTR-3B.', ['identify pending GSTR-1 and GSTR-3B periods', 'reconcile sales, purchases and ITC before filing', 'estimate late fee, interest and tax payable', 'file sequential pending returns where required', 'download acknowledgements and update books']],
  'itr-notice-help': ['ITR Notice Help in India', 'taxpayers who received income tax notices', 'Income tax notices can relate to AIS mismatch, TDS, deductions, high-value transactions, defective returns or scrutiny. The response should match the notice section and deadline.', ['download the notice from the income tax portal', 'compare notice data with ITR, AIS, TIS and Form 26AS', 'prepare explanation and supporting documents', 'respond before deadline', 'keep acknowledgement and future follow-up ready']],
  'gst-cancellation-help': ['GST Cancellation Help', 'businesses closing or correcting GST registration', 'GST cancellation may require final returns, pending return cleanup and careful review of tax liabilities before closure.', ['check pending GST returns', 'reconcile liability and ITC', 'prepare cancellation reason and documents', 'file final return where applicable', 'monitor approval or officer queries']],
  'income-tax-scrutiny-help': ['Income Tax Scrutiny Help', 'taxpayers facing scrutiny or detailed verification', 'Scrutiny needs careful document trails, bank reconciliation, income explanation and professional response drafting.', ['collect ITR, computation and financial statements', 'map bank credits to income sources', 'reconcile AIS/Form 26AS', 'prepare evidence for deductions and expenses', 'respond through the portal with professional review']],
  'missed-itr-deadline': ['Missed ITR Deadline Help', 'taxpayers who missed the due date', 'A belated or updated return may be possible depending on assessment year, time limits and additional tax rules. Late filing can also affect loss carry-forward and interest.', ['check whether belated return window is open', 'calculate tax, interest and late fee', 'review AIS/Form 26AS before filing', 'choose correct ITR form', 'avoid repeating the delay next year']],
  'how-to-save-tax-legally': ['How to Save Tax Legally in India', 'individuals and business owners planning taxes', 'Legal tax planning means using valid deductions, regimes, business expenses, timing, exemptions and documentation, not hiding income.', ['compare old vs new regime', 'track 80C, 80D, HRA and loan benefits where applicable', 'record business expenses with proof', 'plan advance tax', 'review capital gains before selling assets']],
  'gst-for-small-business': ['GST for Small Business in India', 'small businesses evaluating GST', 'GST decisions involve registration threshold, composition vs regular scheme, invoice process, ITC, returns and penalties.', ['check registration applicability', 'choose regular or composition scheme where eligible', 'set invoice and purchase record process', 'file GSTR-1 and GSTR-3B on time', 'reconcile ITC monthly']],
  'startup-compliance-checklist': ['Startup Compliance Checklist India', 'startup founders', 'Startups need entity, tax, labour, accounting, GST, ROC and investor-readiness compliance from the beginning.', ['incorporation and PAN/TAN', 'bank account and accounting setup', 'GST and professional tax applicability', 'payroll, TDS and contracts', 'ROC annual compliance and board records']],
  'how-to-file-itr-for-freelancers': ['How to File ITR for Freelancers in India', 'freelancers with professional income', 'Freelancers need to report professional receipts, claim legitimate expenses, reconcile TDS/AIS and choose the correct ITR form or presumptive scheme where eligible.', ['collect client invoices and payments', 'separate business expenses', 'review Form 26AS, AIS and TIS', 'check GST and advance tax', 'file correct ITR and preserve proofs']],
};

const costPages = {
  'itr-filing-cost-india': ['ITR Filing Cost in India', 'ITR filing', 'Rs. 1,000 to Rs. 2,500 for simple salaried returns; Rs. 3,000 to Rs. 15,000 for business, freelancer, capital gains or foreign income cases; audit-linked work can be higher.'],
  'gst-registration-cost': ['GST Registration Cost in India', 'GST registration', 'Rs. 1,000 to Rs. 5,000 for basic registration support. Costs rise when documents are unclear, additional places of business, ecommerce, amendments or officer queries are involved.'],
  'ca-consultation-fees': ['CA Consultation Fees in India', 'CA consultation', 'Simple consultations may start around Rs. 500 to Rs. 2,000. Detailed tax planning, notice response, audit or business advisory can be several thousand rupees or more depending on complexity.'],
  'virtual-cfo-pricing': ['Virtual CFO Pricing in India', 'virtual CFO support', 'Pricing depends on monthly involvement, MIS depth, cash-flow planning, investor reporting and controls. Small businesses may start with light retainers while funded startups often need deeper monthly support.'],
  'company-registration-cost': ['Company Registration Cost in India', 'company registration', 'Costs depend on private limited, LLP, OPC or partnership structure, government fees, stamp duty, professional scope and add-ons like GST, MSME, trademark or startup registration.'],
  'trademark-registration-fees': ['Trademark Registration Fees in India', 'trademark registration', 'Fees depend on applicant type, number of classes, government filing fee, professional search, objections and hearing support. A proper search can reduce later objection risk.'],
};

const genericPages = [
  ['best-ca-services-india', 'Best CA Services in India', 'best/top', 'Compare CA services for ITR, GST, accounting, audit, tax planning, compliance and startup finance support.'],
  ['top-gst-consultants-india', 'Top GST Consultants in India', 'best/top', 'Find GST consultants for registration, filing, notices, cancellation, reconciliation and monthly compliance.'],
  ['best-accounting-services-bangalore', 'Best Accounting Services in Bangalore', 'best/top', 'Compare accounting and bookkeeping experts in Bangalore for startups, SMEs, GST books and monthly reporting.'],
  ['top-tax-consultants-for-startups', 'Top Tax Consultants for Startups', 'best/top', 'Startups need tax consultants who understand GST, TDS, ESOPs, funding, compliance and founder documentation.'],
  ['best-platform-for-business-services', 'Best Platform for Business Services', 'best/top', 'Compare platforms to hire verified professionals for finance, tax, compliance and business services.'],
  ['fiverr-alternative-india', 'Fiverr Alternative in India for Professional Services', 'alternative', 'WorkIndex is built for Indian finance, tax, compliance and accounting services, where structured requirements matter more than generic gigs.'],
  ['freelancer-alternative-india', 'Freelancer Alternative in India', 'alternative', 'Compare WorkIndex with broad freelance marketplaces when hiring CA, GST, tax, accounting and compliance experts.'],
  ['toptal-alternative-india', 'Toptal Alternative in India for Finance Experts', 'alternative', 'For Indian finance and compliance work, WorkIndex focuses on service-specific professional matching and local tax context.'],
  ['urban-company-alternative', 'Urban Company Alternative for Business Services', 'alternative', 'WorkIndex focuses on CA, GST, accounting, tax and compliance experts rather than home-service categories.'],
  ['linkedin-services-alternative', 'LinkedIn Services Alternative for Hiring Professionals', 'alternative', 'Instead of cold-searching profiles, customers can post structured requirements and compare expert responses.'],
  ['gst-for-restaurants', 'GST for Restaurants in India', 'industry', 'Restaurants need GST, POS sales reconciliation, delivery platform statement matching, vendor ITC and monthly bookkeeping.'],
  ['accounting-for-ecommerce', 'Accounting for Ecommerce Sellers in India', 'industry', 'Ecommerce accounting needs marketplace settlement reconciliation, GST, inventory, returns, TCS/TDS and bank matching.'],
  ['tax-filing-for-youtubers', 'Tax Filing for YouTubers in India', 'industry', 'YouTubers should report AdSense, sponsorships, affiliate income, foreign remittances, TDS and creator expenses correctly.'],
  ['compliance-for-startups', 'Compliance for Startups in India', 'industry', 'Startup compliance includes registration, accounting, GST, TDS, payroll, ROC filings, contracts and investor-ready records.'],
  ['bookkeeping-for-clinics', 'Bookkeeping for Clinics in India', 'industry', 'Clinics need consultation receipts, staff payroll, equipment records, expense tracking, GST applicability review and tax filing support.'],
  ['gst-services-for-contractors', 'GST Services for Contractors in India', 'industry', 'Contractors need GST invoices, work contract classification, TDS/TCS reconciliation, ITC and return filing support.'],
  ['how-to-file-itr-online', 'How to File ITR Online in India', 'how-to', 'A practical step-by-step guide to prepare documents, choose the right ITR form, review AIS/Form 26AS and file online.'],
  ['how-to-hire-a-ca', 'How to Hire a CA in India', 'how-to', 'Define your scope, collect documents, compare CA responses, verify service fit and agree on fees before sharing full details.'],
  ['how-to-register-gst', 'How to Register GST in India', 'how-to', 'GST registration involves checking applicability, preparing KYC and business address proof, filing the application and responding to officer queries.'],
  ['how-to-start-a-business-india', 'How to Start a Business in India', 'how-to', 'Choose entity type, register the business, set up banking, GST, accounting, contracts and recurring compliance.'],
  ['how-to-find-freelance-accountants', 'How to Find Freelance Accountants in India', 'how-to', 'Compare freelance accountants by transaction volume experience, GST knowledge, software comfort, monthly reporting and response quality.'],
  ['documents-required-for-gst-registration', 'Documents Required for GST Registration', 'documents', 'Keep PAN, Aadhaar, promoter KYC, business address proof, bank details, photographs and constitution documents ready for GST registration.'],
  ['documents-required-for-company-registration', 'Documents Required for Company Registration', 'documents', 'Company registration generally needs promoter KYC, address proof, DSC/DIN details, registered office proof, name choices and incorporation forms.'],
  ['documents-required-for-trademark', 'Documents Required for Trademark Registration', 'documents', 'Trademark filing needs applicant details, brand name/logo, class and goods/services description, power of attorney and prior-use proof where claimed.'],
  ['documents-required-for-msme-registration', 'Documents Required for MSME Registration', 'documents', 'Udyam registration is based on self-declaration on the official MSME portal and normally does not require uploading documents, papers, certificates or proof.'],
  ['documents-required-for-itr-filing-freelancers', 'Documents Required for ITR Filing for Freelancers', 'documents', 'Freelancers should keep invoices, bank statements, TDS details, AIS/TIS, expense proofs, GST returns if applicable and advance tax details.'],
  ['itr-filing-checklist', 'ITR Filing Checklist', 'checklist', 'Review PAN-Aadhaar, Form 16, AIS, Form 26AS, bank interest, deductions, capital gains, correct ITR form and regime before filing.'],
  ['gst-registration-checklist', 'GST Registration Checklist', 'checklist', 'Check GST applicability, constitution type, promoter KYC, address proof, bank details, business activity and portal OTP readiness.'],
  ['business-registration-checklist', 'Business Registration Checklist', 'checklist', 'Choose entity type, prepare promoter KYC, office proof, name options, bank readiness, GST/MSME/trademark needs and compliance calendar.'],
  ['freelancer-vs-full-time-accountant', 'Freelancer vs Full-Time Accountant', 'vs', 'Compare cost, control, availability, transaction volume, confidentiality and reporting needs before choosing accounting support.'],
  ['ca-vs-tax-consultant', 'CA vs Tax Consultant', 'vs', 'A CA can handle audit and certification work; tax consultants may help with return filing and advisory depending on qualification and scope.'],
  ['gst-composition-vs-regular', 'GST Composition vs Regular Scheme', 'vs', 'Compare GST composition and regular schemes by eligibility, ITC, invoice rules, customer type, return burden and growth plans.'],
  ['old-vs-new-tax-regime', 'Old vs New Tax Regime', 'vs', 'Compare deductions, slab rates, employer benefits, home loan, HRA, investments and business income restrictions before choosing a regime.'],
];

const calculators = [
  ['income-tax-calculator', 'Income Tax Calculator India', 'taxable income', 'Taxable Income x Applicable Slab Rate - Rebate/Credits', 'income'],
  ['gst-calculator', 'GST Calculator India', 'taxable value', 'GST = Taxable Value x GST Rate', 'gst'],
  ['freelance-tax-calculator', 'Freelance Tax Calculator India', 'freelance receipts', 'Estimated Taxable Profit = Receipts - Business Expenses', 'freelance'],
  ['salary-tax-calculator', 'Salary Tax Calculator India', 'annual salary', 'Taxable Salary = Gross Salary - Eligible Exemptions/Deductions', 'salary'],
  ['business-loan-emi-calculator', 'Business Loan EMI Calculator', 'loan amount', 'EMI = P x R x (1+R)^N / ((1+R)^N - 1)', 'emi'],
  ['gst-late-fee-calculator', 'GST Late Fee Calculator', 'days delayed', 'Late Fee Estimate = Days Delayed x Applicable Daily Late Fee', 'latefee'],
];

function esc(value) {
  return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function schema(slug, title, desc, type) {
  const url = `${site}/seo-pages/${slug}.html`;
  const graph = [
    { '@type': 'Organization', '@id': `${site}/#organization`, name: 'WorkIndex', url: site, description: 'India-focused marketplace to hire verified finance, tax, GST, accounting, compliance and professional service experts.' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description: desc, about: { '@id': `${site}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'WorkIndex', item: site }, { '@type': 'ListItem', position: 2, name: title, item: url }] },
    { '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: `How does WorkIndex help with ${title}?`, acceptedAnswer: { '@type': 'Answer', text: 'WorkIndex helps customers post structured requirements and compare expert responses, profiles, pricing expectations and service fit before hiring.' } }, { '@type': 'Question', name: 'Is posting a requirement free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Customers can post a requirement for free and compare relevant professional responses.' } }] }
  ];
  graph.push({ '@type': type === 'calculator' ? 'SoftwareApplication' : type === 'how-to' ? 'HowTo' : type === 'documents' || type === 'checklist' || type === 'vs' || type === 'best/top' || type === 'alternative' ? 'Article' : 'Service', name: title, headline: title, description: desc, dateModified: today, provider: { '@id': `${site}/#organization` } });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function page(slug, title, audience, service, reason, docs, type = 'service') {
  const desc = `${title} - practical India-focused guidance, documents, costs, expert selection tips and WorkIndex hiring flow.`;
  const url = `${site}/seo-pages/${slug}.html`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)} | WorkIndex</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${url}"/>
<meta property="og:title" content="${esc(title)} | WorkIndex"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:type" content="${type === 'service' ? 'website' : 'article'}"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.wi-grid ul{margin:10px 0 0;padding-left:20px;line-height:1.75}.wi-box{padding:16px 18px;border:1px solid rgba(252,128,25,.25);background:rgba(252,128,25,.08);border-radius:12px;line-height:1.75}.wi-table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}.wi-table th,.wi-table td{padding:14px;border-bottom:1px solid #eef2f7;text-align:left;vertical-align:top}.wi-table th{background:#f8fafc}</style>
<script type="application/ld+json">${schema(slug, title, desc, type)}</script>
</head>
<body>
<nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="/?signup=true" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(title)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>WorkIndex guide</div><h1>${esc(title)}<br><span>Clear guidance before you hire</span></h1><p>${esc(reason)} WorkIndex helps ${esc(audience)} post structured requirements and compare relevant experts for ${esc(service)}.</p><a href="/?signup=true" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">India-specific guidance</div><div class="lp-trust-item">Verified expert discovery</div><div class="lp-trust-item">Compare responses</div><div class="lp-trust-item">Finance, tax and compliance focused</div></div></section>
<section class="lp-section"><div class="lp-section-eyebrow">What this covers</div><h2 class="lp-section-title">Practical scope for ${esc(audience)}</h2><div class="wi-grid"><div class="lp-step"><h3>Typical work needed</h3>${list(service.split(', ').map((x) => x.trim()))}</div><div class="lp-step"><h3>Documents and details to keep ready</h3>${list(docs)}</div><div class="lp-step"><h3>Why expert help matters</h3><p>${esc(reason)}</p></div></div></section>
<section class="lp-section"><div class="lp-section-eyebrow">Hiring checklist</div><h2 class="lp-section-title">Questions to ask before hiring</h2><div class="wi-box">${list(['Have you handled this exact type of customer or problem before?', 'What documents do you need before confirming fees?', 'What is included and excluded in the quote?', 'What timeline is realistic if documents are ready?', 'How will notices, corrections or follow-up support be handled?'])}</div></section>
<section class="lp-section"><div class="lp-section-eyebrow">Compare</div><h2 class="lp-section-title">WorkIndex vs searching manually</h2><div style="overflow-x:auto"><table class="wi-table"><thead><tr><th>Option</th><th>What happens</th><th>Risk</th></tr></thead><tbody><tr><td><strong>Manual search</strong></td><td>You call or message professionals one by one.</td><td>Hard to compare scope, price and fit.</td></tr><tr><td><strong>Generic freelance sites</strong></td><td>Broad talent pool for many kinds of work.</td><td>Less India-specific CA, GST and compliance context.</td></tr><tr><td><strong>WorkIndex</strong></td><td>Post structured requirement and compare expert responses.</td><td>Best when service details and trust signals matter.</td></tr></tbody></table></div></section>
<section class="lp-section"><div class="lp-section-eyebrow">Common mistakes</div><h2 class="lp-section-title">Avoid these issues</h2><div class="wi-grid"><div class="lp-step"><h3>Documentation gaps</h3>${list(['missing invoices or bank proof', 'not reconciling AIS/Form 26AS/GST data where applicable', 'unclear business address or KYC documents'])}</div><div class="lp-step"><h3>Hiring mistakes</h3>${list(['choosing only by lowest fee', 'not confirming deliverables', 'sharing incomplete facts', 'waiting until deadline pressure creates penalties'])}</div></div></section>
<section class="lp-section"><div class="lp-section-eyebrow">FAQ</div><h2 class="lp-section-title">Common questions</h2><div class="wi-grid"><div class="lp-step"><h3>Can I hire online?</h3><p>Yes. Many tax, GST, accounting and compliance tasks can be handled online when documents are clear and communication is structured.</p></div><div class="lp-step"><h3>How does WorkIndex help?</h3><p>WorkIndex gives experts more context before they respond, helping customers compare relevant professionals instead of starting from a cold search.</p></div></div></section>
<section class="lp-cta-section"><h2>Need the right expert for this?</h2><p>Post your requirement and compare responses from professionals who understand Indian finance, tax, GST, accounting and compliance work.</p><a href="/?signup=true" class="lp-hero-cta">Get Started</a></section>
</body>
</html>
`;
}

function calculatorPage(slug, title, label, formula, kind) {
  const desc = `${title} with formula, examples and expert hiring guidance for Indian taxpayers and businesses.`;
  const url = `${site}/seo-pages/${slug}.html`;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${esc(title)} | WorkIndex</title><meta name="description" content="${esc(desc)}"/><link rel="canonical" href="${url}"/><meta property="og:title" content="${esc(title)} | WorkIndex"/><meta property="og:description" content="${esc(desc)}"/><meta property="og:url" content="${url}"/><meta property="og:type" content="website"/><link rel="stylesheet" href="/lp-styles.css"/><script type="application/ld+json">${schema(slug, title, desc, 'calculator')}</script><style>.calc{max-width:760px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:22px}.calc input,.calc select{width:100%;padding:12px;border:1px solid #d1d5db;border-radius:10px;margin:8px 0 14px}.calc-result{padding:16px;background:rgba(252,128,25,.1);border:1px solid rgba(252,128,25,.25);border-radius:12px;font-weight:800}.formula{font-family:monospace;background:#0f172a;color:#fff;padding:14px;border-radius:10px;overflow:auto}</style></head>
<body><nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="/?signup=true" class="lp-nav-cta">Post for Free</a></nav><section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>Calculator</div><h1>${esc(title)}<br><span>Estimate first, then speak to an expert</span></h1><p>This tool gives a simple estimate for ${esc(label)}. It is not a substitute for professional tax, GST or finance advice because exemptions, deductions, penalties and eligibility can change by case.</p><a href="/?signup=true" class="lp-hero-cta">Find an Expert</a></section>
<section class="lp-section"><h2 class="lp-section-title">Formula used</h2><div class="formula">${esc(formula)}</div></section>
<section class="lp-section"><div class="calc"><label>Amount</label><input id="amount" type="number" value="100000"/><label>Rate %</label><input id="rate" type="number" value="${kind === 'gst' ? 18 : kind === 'emi' ? 12 : 10}"/><label>${kind === 'emi' ? 'Months' : kind === 'latefee' ? 'Days delayed' : 'Adjustment / deduction'}</label><input id="extra" type="number" value="${kind === 'emi' ? 36 : kind === 'latefee' ? 5 : 0}"/><button class="lp-hero-cta" type="button" onclick="calc()">Calculate</button><div id="result" class="calc-result" style="margin-top:16px;">Result will appear here</div></div></section>
<section class="lp-section"><h2 class="lp-section-title">When to hire an expert</h2><div class="lp-steps"><div class="lp-step"><h3>Multiple variables</h3><p>Hire an expert when deductions, notices, GST credits, loan terms, penalties or business income make the calculation case-specific.</p></div><div class="lp-step"><h3>Before filing or paying</h3><p>Use this estimate as a starting point, then validate with a CA, GST consultant or finance professional before filing or making decisions.</p></div></div></section>
<script>function calc(){var a=+document.getElementById('amount').value||0,r=(+document.getElementById('rate').value||0)/100,e=+document.getElementById('extra').value||0,out=0;if('${kind}'==='emi'){var m=r/12;out=a*m*Math.pow(1+m,e)/(Math.pow(1+m,e)-1);}else if('${kind}'==='latefee'){out=e*(+document.getElementById('rate').value||0);}else if('${kind}'==='freelance'){out=(a-e)*r;}else{out=(a-e)*r;}document.getElementById('result').textContent='Estimated result: Rs. '+Math.max(0,Math.round(out)).toLocaleString('en-IN');}calc();</script>
</body></html>`;
}

function writePage(slug, html) {
  fs.writeFileSync(path.join(seoDir, `${slug}.html`), html, 'utf8');
}

fs.mkdirSync(seoDir, { recursive: true });
const created = [];

for (const [slug, data] of Object.entries(groups)) {
  writePage(slug, page(slug, data[0], data[1], data[2], data[3], data[4], 'for-who'));
  created.push(slug);
}
for (const [slug, data] of Object.entries(problemPages)) {
  writePage(slug, page(slug, data[0], data[1], data[3].join(', '), data[2], data[3], 'problem'));
  created.push(slug);
}
for (const [slug, data] of Object.entries(costPages)) {
  writePage(slug, page(slug, data[0], 'customers comparing fees', data[1], data[2], ['service scope', 'urgency', 'documents available', 'complexity level', 'city or online preference'], 'cost'));
  created.push(slug);
}
for (const [slug, title, type, desc] of genericPages) {
  writePage(slug, page(slug, title, 'Indian customers and businesses', desc, desc, ['PAN/Aadhaar or promoter KYC where applicable', 'business details', 'income or invoice records', 'prior filing records', 'timeline and budget'], type));
  created.push(slug);
}
for (const [slug, title, label, formula, kind] of calculators) {
  writePage(slug, calculatorPage(slug, title, label, formula, kind));
  created.push(slug);
}

let sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n';
const existing = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
let additions = '\n  <!-- SEO Expansion Pages -->\n';
for (const slug of created) {
  const loc = `${site}/seo-pages/${slug}.html`;
  if (existing.has(loc)) continue;
  const priority = slug.includes('calculator') ? '0.85' : slug.startsWith('for-') ? '0.85' : '0.8';
  additions += `  <url><loc>${loc}</loc><priority>${priority}</priority><changefreq>monthly</changefreq><lastmod>${today}</lastmod></url>\n`;
}
if (additions.trim() !== '<!-- SEO Expansion Pages -->') {
  sitemap = sitemap.replace(/\n<\/urlset>\s*$/, `${additions}</urlset>\n`);
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

console.log(`created=${created.length}`);
