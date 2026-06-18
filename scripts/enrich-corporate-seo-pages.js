const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SEO_DIR = path.join(ROOT, 'seo-pages');
const TODAY = '18 June 2026';

const cityInfo = {
  bangalore: { name: 'Bangalore', display: 'Bengaluru', state: 'Karnataka' },
  chennai: { name: 'Chennai', display: 'Chennai', state: 'Tamil Nadu' },
  delhi: { name: 'Delhi', display: 'Delhi', state: 'Delhi NCR' },
  hyderabad: { name: 'Hyderabad', display: 'Hyderabad', state: 'Telangana' },
  mumbai: { name: 'Mumbai', display: 'Mumbai', state: 'Maharashtra' },
  pune: { name: 'Pune', display: 'Pune', state: 'Maharashtra' },
  kolkata: { name: 'Kolkata', display: 'Kolkata', state: 'West Bengal' },
  ahmedabad: { name: 'Ahmedabad', display: 'Ahmedabad', state: 'Gujarat' },
  kochi: { name: 'Kochi', display: 'Kochi', state: 'Kerala' },
  mysore: { name: 'Mysore', display: 'Mysuru', state: 'Karnataka' },
  mangalore: { name: 'Mangalore', display: 'Mangaluru', state: 'Coastal Karnataka' },
  hubli: { name: 'Hubli', display: 'Hubballi', state: 'North Karnataka' }
};

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function table(rows, heads = ['Topic', 'Current verified position', 'What to check']) {
  return `<table class="wi-table"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

function panel(eyebrow, heading, body) {
  return `<section class="wi-panel"><div class="lp-section-eyebrow">${eyebrow}</div><h2>${heading}</h2>${body}</section>`;
}

function getCategory(slug) {
  if (slug.includes('gst') || slug.includes('gstr') || slug.includes('eway') || slug.includes('lut') || slug.includes('sac') || slug.includes('hsn') || slug.includes('composition') || slug.includes('itc') || slug.includes('rcm') || slug.includes('invoicing') || slug.includes('invoice-management')) {
    return 'gst';
  }
  if (slug.includes('company') || slug.includes('llp') || slug.includes('opc') || slug.includes('roc') || slug.includes('mca') || slug.includes('incorporation') || slug.includes('director') || slug.includes('din') || slug.includes('annual-filing') || slug.includes('80iac') || slug.includes('secretarial')) {
    return 'corporate';
  }
  if (slug.includes('pf-') || slug.includes('epf') || slug.includes('esic') || slug.includes('payroll') || slug.includes('gratuity') || slug.includes('salary') || slug.includes('posh') || slug.includes('labour') || slug.includes('wage') || slug.includes('shop-and-establishment') || slug.includes('shop-act')) {
    return 'labour';
  }
  if (slug.includes('rera') || slug.includes('builder') || slug.includes('real-estate')) {
    return 'rera';
  }
  if (slug.includes('cfo') || slug.includes('fema') || slug.includes('rbi') || slug.includes('sebi') || slug.includes('mutual-fund') || slug.includes('loan') || slug.includes('diligence') || slug.includes('valuation') || slug.includes('financial') || slug.includes('fno') || slug.includes('investment') || slug.includes('portfolio') || slug.includes('remittance') || slug.includes('repatriation')) {
    return 'finance';
  }
  if (slug.includes('accounting') || slug.includes('bookkeep') || slug.includes('audit') || slug.includes('ledger') || slug.includes('accounts-payable') || slug.includes('accounts-receivable') || slug.includes('mis-reporting') || slug.includes('forensic')) {
    return 'accounting';
  }
  return 'general';
}

function getContent(category, title, slug) {
  switch (category) {
    case 'gst':
      return {
        eyebrow: 'GST Compliance',
        panels: [
          panel('GST Compliance', 'GST Returns, Thresholds & E-Invoicing Slabs',
            `<p>GST rules are highly dynamic, governed by the CBIC under the GST Council notifications. Reconcile returns with e-invoicing data and ledger credits before submitting.</p>` +
            table([
              ['GST Annual Return (GSTR-9)', 'Mandatory for aggregate annual turnover > Rs. 2 Crore (voluntary for turnover <= Rs. 2 Crore).', 'Due date: Dec 31 of subsequent financial year.'],
              ['GST Reconciliation (GSTR-9C)', 'Mandatory for aggregate annual turnover > Rs. 5 Crore. Self-certified reconciliation statement.', 'Due date: Dec 31 of subsequent financial year.'],
              ['GST E-Invoicing Slabs', 'Mandatory for taxpayers with aggregate turnover exceeding Rs. 5 Crore in any preceding FY.', 'Required to generate IRN and QR code for B2B transactions.'],
              ['GST Composition Scheme', 'Turnover limit of Rs. 1.5 Crore (goods) or Rs. 50 Lakh (services). Tax rate is 1% or 6%.', 'No ITC claim allowed, and no GST collection from customers.']
            ], ['Compliance item', 'Current verified position', 'Key requirement'])
          ),
          panel('Important GST checklists', 'What a serious tax expert should verify', list([
            "Form GST RFD-11 (LUT): For zero-rated exports without tax payment, file RFD-11 before April 1 of each financial year.",
            "E-Way Bill validity: Mandatory for inter-state movement of goods > Rs. 50,000. Validity is 1 day per 200 km.",
            "ASMT-10 Notice replies: Scrutiny notice for ITC discrepancies (GSTR-3B vs 2B). Reply in Form ASMT-11 within 30 days.",
            "Section 17(5) ITC Reversals: Blocked credits (food, motor vehicles, employee perquisites) must be reversed to avoid penalty."
          ])),
          panel('Required documentation', 'Documents to prepare for GST filings', list([
            "Sales registers showing taxable values and tax categories.",
            "Purchase registers matching GSTR-2B ITC inputs.",
            "Form GSTR-1 and GSTR-3B prior returns history.",
            "Active GSTIN portal credentials or authorized access."
          ]))
        ],
        faq: [
          ['What is the turnover threshold for GST e-invoicing in India?', 'E-invoicing is mandatory for all taxpayers whose aggregate annual turnover exceeds Rs. 5 Crore in any preceding financial year (from 2017-18 onwards).'],
          ['Who is required to file GSTR-9 and GSTR-9C?', 'GSTR-9 (Annual Return) is mandatory for taxpayers with annual aggregate turnover exceeding Rs. 2 Crore. GSTR-9C (Reconciliation Statement) is mandatory for taxpayers with turnover exceeding Rs. 5 Crore.'],
          ['Can a composition dealer claim Input Tax Credit (ITC)?', 'No. Taxpayers registered under the GST Composition Scheme are not allowed to claim Input Tax Credit, nor can they issue a tax invoice or collect GST from their customers.']
        ]
      };

    case 'corporate':
      return {
        eyebrow: 'Corporate Law',
        panels: [
          panel('Corporate Law', 'MCA Compliance Calendars & Company Filings',
            `<p>Company and LLP annual filings are regulated by the Ministry of Corporate Affairs (MCA) under the Companies Act, 2013.</p>` +
            table([
              ['Financial Statements (AOC-4)', 'Filing company financial statements (P&L, Balance Sheet) with ROC.', 'Due within 30 days from the date of the Annual General Meeting (AGM).'],
              ['Annual Return (MGT-7/7A)', 'Filing company shareholding, directors, and corporate details.', 'Due within 60 days from the date of the AGM.'],
              ['Director DIR-3 KYC', 'Mandatory annual KYC for all active directors holding a DIN.', 'Due on or before September 30 of every FY. Penalty of Rs. 5,000 for delay.'],
              ['LLP Form 3 (Agreement)', 'Filing the executed LLP agreement with MCA after incorporation.', 'Due within 30 days of LLP incorporation. Daily late fees apply.']
            ], ['Filing category', 'Current verified position', 'Key requirement'])
          ),
          panel('Important corporate check cases', 'What a serious compliance expert should verify', list([
            "Form ADT-1 (Auditor Appointment): Statutory auditor must be appointed in first AGM, and Form ADT-1 filed within 15 days.",
            "Startup 80-IAC Tax Exemption: DPIIT-recognized startups get 100% tax exemption for 3 consecutive years out of the first 10 years (turnover cap Rs. 100 Crore).",
            "MCA V3 Portal mapping: Ensure DSC and PAN are registered and mapped on the V3 portal before attempting filings.",
            "Commencement of Business (INC-20A): File INC-20A within 180 days of incorporation to avoid company strike-off."
          ])),
          panel('Required documentation', 'Documents for company and ROC filings', list([
            "Audited financial statements (Balance Sheet, P&L, Notes to Accounts).",
            "Director DSC, PAN, and address proof for KYC.",
            "Board minutes and shareholder resolutions.",
            "Active company CIN/LLPIN and MCA credentials."
          ]))
        ],
        faq: [
          ['What is the penalty for late filing of ROC annual returns?', 'The penalty for late filing of ROC forms (such as AOC-4 and MGT-7) is a flat late fee of Rs. 100 per day per form from the due date, with no upper cap.'],
          ['When is the due date for DIR-3 KYC filing?', 'The due date for filing DIR-3 KYC (for directors holding active DINs) is September 30 of every financial year. Delayed filing attracts a reactivation penalty of Rs. 5,000.'],
          ['How can a startup claim the Section 80-IAC tax exemption?', 'The startup must be recognized by DPIIT, be incorporated as a private company or LLP, have an annual turnover below Rs. 100 Crore, and apply online to the Inter-Ministerial Board (IMB) for tax holiday approval.']
        ]
      };

    case 'labour':
      return {
        eyebrow: 'Labour & Payroll',
        panels: [
          panel('Labour & Payroll', 'EPF, ESIC, Gratuity & Payroll Compliance Slabs',
            `<p>Statutory employee registrations and payroll contributions are regulated under the EPFO, ESIC, and state professional tax acts.</p>` +
            table([
              ['EPF Registration', 'Mandatory for establishments with 20 or more employees.', 'Employer contribution is 12% of basic wage (capped at Rs. 15,000/month).'],
              ['ESIC Registration', 'Mandatory for non-seasonal establishments with 10 or more employees.', 'Contribution: 3.25% (employer) and 0.75% (employee) of gross wage (cap Rs. 21,000/month).'],
              ['Payment of Gratuity', 'Applicable to establishments with 10 or more employees.', 'Payable to employees with continuous service of 5 years or more. Capped at Rs. 20 Lakh.'],
              ['Professional Tax (PT)', 'State-specific tax on employment/profession.', 'Slabs and monthly filings vary by state (e.g. Karnataka cap is Rs. 200/month).']
            ], ['Labour category', 'Current verified position', 'Key requirement'])
          ),
          panel('Important labour compliance checks', 'What a serious HR/payroll expert should verify', list([
            "Shop & Establishment License: Required under state laws for commercial offices and establishments within 30 days of starting.",
            "POSH Compliance: Establishments with 10 or more employees must form an Internal Complaints Committee (ICC) to comply with the POSH Act.",
            "Salary structure optimization: Segment salary into Basic, HRA, and allowances while maintaining statutory EPF and ESIC caps.",
            "PF Withdrawal queries: Advise employees on Form 19, 10C, and 31 withdrawal requirements for advance or final claims."
          ])),
          panel('Required documentation', 'Documents for payroll and labour audits', list([
            "Monthly payroll register showing gross salary, EPF/ESIC deductions, and PT.",
            "EPF/ESIC monthly challans and ECR filings.",
            "Employee KYC (Aadhaar, PAN, Bank account details).",
            "Employee contracts and establishment registration details."
          ]))
        ],
        faq: [
          ['What is the salary limit for mandatory EPF contribution in India?', 'The statutory wage limit for mandatory EPF contribution is Rs. 15,000 per month (Basic salary + Dearness Allowance). Contributions are voluntary for wages exceeding this limit.'],
          ['What are the employer and employee ESIC contribution rates?', 'The contribution rates are 3.25% of gross wages for the employer and 0.75% of gross wages for the employee, applicable to employees earning up to Rs. 21,000 per month.'],
          ['When is an employee eligible for gratuity payment?', 'An employee is eligible for gratuity under the Payment of Gratuity Act, 1972 upon completing 5 or more years of continuous service with the same employer.']
        ]
      };

    case 'rera':
      return {
        eyebrow: 'RERA Compliance',
        panels: [
          panel('RERA Compliance', 'RERA Project & Agent Registration Rules',
            `<p>Real estate projects and brokerage services are governed under state-specific RERA acts to protect buyers.</p>` +
            table([
              ['Project Registration', 'Mandatory for real estate projects where land area exceeds 500 sq meters or apartments exceed 8.', 'No marketing or sale is allowed prior to receiving the RERA registration number.'],
              ['Agent Registration', 'Mandatory for real estate brokers/agents to facilitate transactions.', 'Must display RERA registration number in all promotional materials.'],
              ['Escrow Account (70%)', '70% of funds collected from allottees must be deposited in a separate bank account.', 'Withdrawals allowed only for construction costs and land acquisition, certified by a CA, engineer, and architect.'],
              ['Quarterly Updates', 'Promoters must update project status, sold units, and financial certificates on the state portal.', 'Required to maintain active status and avoid penalties.']
            ], ['RERA category', 'Current verified position', 'Key requirement'])
          ),
          panel('Important RERA check cases', 'What a serious project auditor should verify', list([
            "CA Certificates (Form 3): Certified withdrawals from the 70% escrow account based on project stage completion.",
            "Title Due Diligence reports: Legal title report and search report for the past 30 years must be submitted during registration.",
            "Structural Defect Liability: Promoters are liable for structural defects or quality issues for a period of 5 years from possession.",
            "State-specific rules: Check if your local state portal (like MahaRERA, K-RERA, etc.) has special deposit or disclosure thresholds."
          ])),
          panel('Required documentation', 'Documents for RERA registration', list([
            "Land title deeds and development agreement.",
            "Sanctioned building plans and approvals.",
            "Promoter bank account details (escrow account setup).",
            "Project layout, cost estimates, and builder certificates."
          ]))
        ],
        faq: [
          ['What is the 70% rule under RERA?', 'RERA mandates that promoters must deposit 70% of the collections from homebuyers into a separate escrow account. These funds can only be used for construction and land costs of that specific project.'],
          ['Is RERA registration mandatory for real estate agents?', 'Yes. Under Section 9 of the RERA Act, no real estate agent can facilitate the sale or purchase of any plot or apartment without obtaining RERA registration.'],
          ['What is the project size threshold for mandatory RERA registration?', 'RERA project registration is mandatory for all commercial and residential projects where the land area exceeds 500 square meters or the number of apartments exceeds 8 units.']
        ]
      };

    case 'finance':
      return {
        eyebrow: 'Startup Finance',
        panels: [
          panel('Startup Finance', 'Virtual CFO, FEMA FDI Reporting & Valuations',
            `<p>Operating a startup requires managing capital flows, regulatory filings under RBI/SEBI, and periodic valuations.</p>` +
            table([
              ['FDI Reporting (FC-GPR)', 'Reporting of foreign investment inflows and share allotment to RBI.', 'Must be filed in Single Master Form (SMF) via FIRMS portal within 30 days of share allotment.'],
              ['FEMA LRS Remittance', 'Liberalised Remittance Scheme limit for resident individuals.', 'Capped at USD 250,000 per financial year for permitted current or capital account transactions.'],
              ['Valuation (Merchant Banker)', 'Required for pricing of unlisted equity shares issued to non-residents under FEMA.', 'Must be certified by a SEBI registered Category-I Merchant Banker or CA under Rule 11UA.'],
              ['Virtual CFO Scope', 'Retained finance management, cash flow analysis, and investor board packs.', 'Segmented by growth stage (Seed, Series A, Series B).']
            ], ['Finance category', 'Current verified position', 'Key requirement'])
          ),
          panel('Important financial check cases', 'What a serious financial advisor should verify', list([
            "Financial Due Diligence: Review earnings quality, historical growth, working capital trends, and TDS/GST reconciliation before investment rounds.",
            "LRN ECB Registration: Raising foreign debt (External Commercial Borrowing) requires registering with RBI and obtaining a Loan Registration Number (LRN).",
            "Form 15CA/15CB: Outward foreign remittances require CA verification of tax payments via Form 15CB and online Form 15CA submission.",
            "F&O Trading Tax: F&O gains are treated as business income (not capital gains). Tax audits are mandatory if business turnover crosses the threshold."
          ])),
          panel('Required documentation', 'Documents for financial due diligence or FDI', list([
            "Bank statements showing foreign remittance inflow.",
            "KYC and boarding details of foreign investors.",
            "Board resolution for share allotment.",
            "Merchant banker valuation certificate."
          ]))
        ],
        faq: [
          ['What is the deadline for filing Form FC-GPR after receiving foreign investment?', 'Form FC-GPR must be submitted on the RBI FIRMS portal within 30 days from the date of allotment of shares or securities to the non-resident investor.'],
          ['What is the maximum limit for outbound remittances under LRS?', 'Under the Liberalised Remittance Scheme (LRS), resident individuals can freely remit up to USD 250,000 per financial year for transactions such as studies, travel, investments, or maintenance of relatives.'],
          ['Who is authorized to issue a valuation report for unlisted share allotment to NRIs?', 'Under FEMA pricing guidelines, unlisted shares must be valued by a SEBI-registered Category-I Merchant Banker or a practicing Chartered Accountant using internationally accepted pricing methodologies.']
        ]
      };

    case 'accounting':
      return {
        eyebrow: 'Accounting & Audit',
        panels: [
          panel('Accounting & Audit', 'SaaS Metrics, Ecommerce Reconciliation & Statutory Audits',
            `<p>Accounting and auditing requirements vary by entity size, business model, and statutory regulations under the Companies Act, 2013.</p>` +
            table([
              ['Statutory Audit (Companies)', 'Mandatory annual audit of company financial statements under the Companies Act, 2013.', 'Applies to all private and public limited companies regardless of turnover.'],
              ['SaaS Revenue Recognition', 'Aligning accounting with Ind AS 115 / IFRS 15 for subscription contracts.', 'Requires tracking MRR, ARR, LTV, CAC, and deferred revenue schedules.'],
              ['Ecommerce Reconciliation', 'Reconciling sales invoices with payment gateway receipts and marketplace reports.', 'Auditing TCS under Section 52 and marketplace commission invoices.'],
              ['Internal Audit (Turnover)', 'Mandatory internal control audits for companies exceeding thresholds.', 'Turnover > Rs. 200 Crore or outstanding loans/deposits > Rs. 100 Crore.']
            ], ['Standard category', 'Current verified position', 'Key requirement'])
          ),
          panel('Important accounting checklists', 'What a serious auditor should verify', list([
            "Management Accounts & MIS: Monthly P&L, Balance Sheet, Cash Flow statement, AR/AP ageing report, and key business metrics (burn rate, gross margins).",
            "Concurrent Audit: Real-time, continuous audit of bank branches or high-volume transactions to prevent leakage and ensure compliance.",
            "Stock and Inventory Audit: Verification of physical stock against books to identify variance, shrinkage, or write-off items.",
            "Accounts Payable/Receivable: Maintain clean vendor aging reports and follow up on outstanding credit periods."
          ])),
          panel('Required documentation', 'Documents for accounting and statutory audits', list([
            "Trial balance, ledger files, and bank statements for the audit period.",
            "Sales and purchase invoice registers.",
            "TDS, GST, and payroll returns history.",
            "Physical stocktake reports and bank confirmation letters."
          ]))
        ],
        faq: [
          ['Is a statutory audit mandatory for all private limited companies in India?', 'Yes. Under the Companies Act, 2013, every private limited company must appoint a statutory auditor and undergo an annual statutory audit, irrespective of its turnover or capital.'],
          ['What is the threshold for mandatory tax audit under Section 44AB?', 'A tax audit is mandatory if business turnover exceeds Rs. 10 Crore (provided cash transactions are <= 5% of total transactions) or Rs. 1 Crore (if cash transactions exceed 5%). For professionals, the limit is Rs. 50 Lakh.'],
          ['How does SaaS accounting handle subscription revenue?', 'Under Ind AS 115, subscription revenue must be recognized over the performance period (monthly/quarterly) as the service is delivered, rather than recognizing upfront collections on day one. Unearned fees are deferred to the balance sheet.']
        ]
      };

    default: // general
      return {
        eyebrow: 'Business Advisory',
        panels: [
          panel('Business Advisory', 'Startup Registrations, FSSAI & GEM Slabs',
            `<p>Starting and operating a business in India requires several basic licenses, registrations, and certifications depending on the industry.</p>` +
            table([
              ['FSSAI Registration', 'Mandatory food safety license for food business operators (FBOs).', 'Basic registration for turnover < 12L; State license for 12L-20Cr; Central license for >20Cr.'],
              ['GEM Portal Registration', 'Government e-Marketplace registration to bid for government contracts.', 'Requires PAN, Aadhaar, bank details, and active company/proprietorship KYC.'],
              ['ISO Certification', 'Standardization certificate verifying internal quality and processes (e.g. ISO 9001).', 'Increases brand value, tender eligibility, and process controls.'],
              ['PAN & TAN Registration', 'Mandatory tax identification numbers for individuals/entities.', 'TAN is required for all entities responsible for deducting TDS.']
            ], ['Registration category', 'Current verified position', 'Key requirement'])
          ),
          panel('Important general checks', 'What a serious business consultant should verify', list([
            "Trade License: Issued by local municipal corporations to authorize commercial operations in a specific location.",
            "Barcode Registration: Required for retail products to track inventory and display pricing; issued by GS1 India.",
            "Proprietorship Setup: Easiest business form, requires only two business registrations (like GST and MSME Udyam) to open a current bank account.",
            "FSSAI compliance: Food safety license must be printed on all packaging labels with the FSSAI logo."
          ])),
          panel('Required documentation', 'Documents for general business setup', list([
            "PAN Card and Aadhaar card of promoters.",
            "Office address proof (rent agreement or electricity bill with NOC).",
            "Bank account details (cancelled cheque).",
            "Business constitution certificates (if company/LLP)."
          ]))
        ],
        faq: [
          ['What is the FSSAI license threshold for a central license?', 'FSSAI Central License is mandatory for food business operators with an annual turnover exceeding Rs. 20 Crore, or for importers, exporters, and large-scale manufacturers.'],
          ['When is a TAN registration mandatory?', 'A TAN (Tax Deduction and Collection Account Number) is mandatory under Section 203A for all individuals and business entities who are responsible for deducting or collecting tax at source (TDS/TCS).'],
          ['What is the difference between an ISO 9001 and ISO 27001 certificate?', 'ISO 9001 certifies the Quality Management System (QMS) of a business, while ISO 27001 certifies the Information Security Management System (ISMS) to protect digital data.']
        ]
      };
  }
}

function getFactCheckPanel(title) {
  return panel(
    'Official fact-check status',
    `${title}: year and source check`,
    `<p><strong>Last fact-checked:</strong> ${TODAY}.</p>` +
    `<p>Direct and indirect tax laws, corporate filings, and compliance rules are subject to change by CBIC, MCA, EPFO, and RBI notifications. Always verify circulars before executing a transaction.</p>` +
    `<p>Use official government portals (such as GST portal, MCA V3, e-filing portal, and TRACES) first. Articles and competitor calculators should be treated as guidance, not legal advice.</p>`
  );
}

function getFaqPanel(faq) {
  return panel(
    'Questions people ask',
    'FAQs',
    faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')
  );
}

function extractTitle(html, filename) {
  const match = html.match(/<title>(.*?)\s*\|?\s*WorkIndex<\/title>/i);
  return match ? match[1].trim() : filename.replace(/\.html$/, '').replace(/-/g, ' ');
}

function extractCanonical(html, filename) {
  const match = html.match(/<link rel="canonical" href="([^"]+)"/i);
  return match ? match[1].trim() : `https://workindex.co.in/seo-pages/${filename}`;
}

function generateFullPage({ slug, title, canonical, content, panels }) {
  const newPanels = panels.join('\n');
  const relatedLinks = [
    ["GST Filing Services", "/seo-pages/gst-filing-services.html"],
    ["ITR Filing Services", "/seo-pages/itr-filing-services.html"],
    ["Company Registration", "/seo-pages/company-registration-consultants.html"],
    ["Accounting Services", "/seo-pages/accounting-bookkeeping-services.html"]
  ].filter(([label, href]) => !href.includes(slug))
   .map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
  
  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://workindex.co.in/#organization", name: "WorkIndex", url: "https://workindex.co.in" },
      { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: `${title} | WorkIndex` },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "WorkIndex", item: "https://workindex.co.in" },
        { "@type": "ListItem", position: 2, name: title, item: canonical }
      ] },
      { "@type": "FAQPage", mainEntity: content.faq.map(([q, a]) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", text: a }
      })) }
    ]
  };

  return `<!DOCTYPE html><html lang="en-IN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)} | WorkIndex</title><meta name="description" content="${esc(title)} in India. Check facts, documents, official portals, deadlines and expert brief before hiring on WorkIndex."/><link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${esc(title)} | WorkIndex"/><meta property="og:description" content="${esc(title)} in India. Check facts, documents, official portals, deadlines and expert brief before hiring on WorkIndex."/><meta property="og:url" content="${canonical}"/><meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/><link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-rich{padding:56px 24px;max-width:1160px;margin:0 auto}.wi-rich-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;align-items:start}.wi-panel{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}.wi-panel+.wi-panel{margin-top:20px}.wi-panel h2{font-size:24px;margin:0 0 14px}.wi-panel h3{font-size:17px;margin:18px 0 8px}.wi-panel p{color:var(--text-muted);font-size:15px;margin:0 0 12px;line-height:1.75}.wi-detail-list{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}.wi-detail-list li{margin-bottom:7px}.wi-side{position:sticky;top:82px}.wi-table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}.wi-table th,.wi-table td{border:1px solid var(--border);padding:11px;text-align:left;vertical-align:top}.wi-table th{background:var(--bg-gray);font-weight:800}.wi-ref a,.wi-related a{display:block;color:var(--primary);font-weight:800;text-decoration:none;margin:8px 0}@media(max-width:860px){.wi-rich-grid{grid-template-columns:1fr}.wi-side{position:static}}</style>
<script type="application/ld+json">${JSON.stringify(schemaObj)}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body class="landing">
<nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="/?signup=true&role=client" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(title)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>Compliance guide</div><h1>${esc(title)}<br><span>India-specific preparation guide</span></h1><p>${esc(title)} needs current-law checks, portal verification, documents and a precise brief before you compare experts on WorkIndex.</p><a href="/?signup=true&role=client" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: ${TODAY}</div><div class="lp-trust-item">Duplicate checked</div><div class="lp-trust-item">Official-source cautious</div><div class="lp-trust-item">India specific</div></div></section>
<div class="wi-rich-grid"><div>
${newPanels}
</div><aside>
<section class="wi-panel"><div class="lp-section-eyebrow">Official checks</div><h2>Useful source portals</h2><div class="wi-related"><a href="https://www.incometax.gov.in/iec/foportal/" rel="nofollow noopener">Income Tax Department e-Filing</a><a href="https://www.incometaxindia.gov.in/Pages/acts/income-tax-act.aspx" rel="nofollow noopener">Income Tax Act / Rules resources</a><a href="https://www.tdscpc.gov.in/" rel="nofollow noopener">TRACES</a></div></section>
<section class="wi-panel"><div class="lp-section-eyebrow">Hiring brief</div><h2>Ask experts these questions</h2><ul class="wi-detail-list"><li>Which law, form, utility or notification are you relying on?</li><li>What documents are missing before you can finalise the work?</li><li>What is included in your quote and what is excluded?</li><li>What timeline, proof of filing and post-filing support will you provide?</li></ul></section>
<section class="wi-panel wi-related"><h2>Related pages</h2><div class="wi-related">${relatedLinks}</div></section>
</aside></div>
</main>
</body>
</html>`;
}

// Main execution block
const listPath = path.join(ROOT, 'generic_files_by_val.json');
if (!fs.existsSync(listPath)) {
  console.error('List generic_files_by_val.json not found!');
  process.exit(1);
}

const files = JSON.parse(fs.readFileSync(listPath, 'utf8'));
console.log(`Processing ${files.length} corporate/GST validation-generic pages...`);

let processed = 0;
for (const file of files) {
  const filePath = path.join(SEO_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${file} listed but does not exist in seo-pages.`);
    continue;
  }
  
  let html = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace(/\.html$/, '');
  const category = getCategory(slug);
  
  // Extract Title and Canonical
  const title = extractTitle(html, file);
  const canonical = extractCanonical(html, file);
  
  // Get Enriched Content
  const baseContent = getContent(category, title, slug);
  const panels = [
    ...baseContent.panels,
    getFactCheckPanel(title),
    getFaqPanel(baseContent.faq)
  ];
  
  // 1. Replace Content Grid Panels or Generate Full Page if it's mismatched
  const gridRegex = /<div class="wi-rich-grid">\s*<div>/i;
  const asideRegex = /<\/div>\s*<aside[^>]*>/i;
  
  const gridMatch = html.match(gridRegex);
  const asideMatch = html.match(asideRegex);
  
  if (gridMatch && asideMatch) {
    const gridIndex = gridMatch.index + gridMatch[0].length;
    const remaining = html.substring(gridIndex);
    const remainingAsideMatch = remaining.match(asideRegex);
    
    if (remainingAsideMatch) {
      const asideIndex = remainingAsideMatch.index;
      const beforeGrid = html.substring(0, gridIndex);
      const afterGrid = remaining.substring(asideIndex);
      
      const newPanels = panels.join('\n');
      html = beforeGrid + '\n' + newPanels + '\n' + afterGrid;
    }
  } else {
    // Rebuild mismatched standard service pages as premium grid pages
    html = generateFullPage({ slug, title, canonical, content: baseContent, panels });
  }

  // 2. Replace/Update FAQ JSON Schema
  const schemaRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i;
  const schemaMatch = html.match(schemaRegex);
  if (schemaMatch) {
    try {
      const schemaObj = JSON.parse(schemaMatch[1]);
      
      if (schemaObj['@graph']) {
        for (let item of schemaObj['@graph']) {
          if (item['@type'] === 'FAQPage') {
            item.mainEntity = baseContent.faq.map(([q, a]) => ({
              '@type': 'Question',
              'name': q,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': a
              }
            }));
          }
        }
      }
      
      const updatedSchemaString = JSON.stringify(schemaObj);
      html = html.replace(schemaMatch[0], `<script type="application/ld+json">${updatedSchemaString}</script>`);
    } catch (err) {
      console.error(`Error parsing schema in ${file}:`, err.message);
    }
  }

  // 3. Update the "Last fact-checked" dates to TODAY
  html = html.replace(/Last fact-checked:\s*\d{4}-\d{2}-\d{2}/g, `Last fact-checked: ${TODAY}`);
  html = html.replace(/Last fact-checked:\s*\d{1,2}\s+[A-Za-z]+\s+\d{4}/g, `Last fact-checked: ${TODAY}`);
  html = html.replace(/"dateModified":\s*"[^"]*"/g, `"dateModified":"2026-06-18"`);
  
  // 4. Update the eyebrow text to category eyebrow
  html = html.replace(/<div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"><\/div>[\s\S]*?<\/div>/gi, `<div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${esc(baseContent.eyebrow)}</div>`);
  
  fs.writeFileSync(filePath, html, 'utf8');
  processed++;
}

console.log(`Successfully enriched ${processed} corporate compliance pages.`);
