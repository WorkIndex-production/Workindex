const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SEO_DIR = path.join(ROOT, "seo-pages");
const TODAY = "25 May 2026";

const officialLinks = [
  ["Income Tax e-Filing portal", "https://www.incometax.gov.in/iec/foportal/"],
  ["AY 2026-27 ITR downloads", "https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns"],
  ["AY 2026-27 salaried guidance", "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1"],
  ["AY 2026-27 business/profession guidance", "https://www.incometax.gov.in/iec/foportal/help/individual-business-profession"],
  ["Income Tax Act 2025 transition FAQ", "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act-faq"],
  ["TRACES", "https://www.tdscpc.gov.in/"],
  ["ICAI BoS Direct Tax modules", "https://boslive.icai.org/sm_module.php?module=157"],
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function titleFromSlug(slug) {
  return slug
    .replace(/\.html$/, "")
    .split("-")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ")
    .replace(/\bAy\b/g, "AY")
    .replace(/\bItr\b/g, "ITR")
    .replace(/\bTds\b/g, "TDS")
    .replace(/\bTcs\b/g, "TCS")
    .replace(/\bHra\b/g, "HRA")
    .replace(/\bVda\b/g, "VDA");
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function table(rows, heads = ["Topic", "Current verified position", "What to check"]) {
  return `<table class="wi-table"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function panel(eyebrow, heading, body) {
  return `<section class="wi-panel"><div class="lp-section-eyebrow">${eyebrow}</div><h2>${heading}</h2>${body}</section>`;
}

function page({
  slug,
  title,
  description,
  eyebrow = "Income tax guide",
  h1,
  subtitle,
  intro,
  panels,
  related = [],
  faq = [],
}) {
  const canonical = `https://workindex.co.in/seo-pages/${slug}.html`;
  const relatedHtml = related.length
    ? related.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")
    : [
        ["Income Tax Calculator", "/seo-pages/income-tax-calculator.html"],
        ["AY 2026-27 Calculator", "/seo-pages/income-tax-calculator-ay-2026-27.html"],
        ["ITR Filing Services", "/seo-pages/itr-filing-services.html"],
      ].map(([label, href]) => `<a href="${href}">${label}</a>`).join("");
  const faqItems = (faq.length ? faq : [
    ["Which law year should I use?", "Use AY 2026-27 for FY 2025-26 income under the Income-tax Act, 1961. Use Tax Year 2026-27 for FY 2026-27 income under the Income Tax Act, 2025."],
    ["Can WorkIndex help me verify this?", "Yes. Share the income year, portal screen, forms, notices and source documents so a tax expert can quote with the correct scope."],
  ]);
  const faqJson = faqItems.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)} | WorkIndex</title><meta name="description" content="${esc(description)}"/><link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${esc(title)} | WorkIndex"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/><link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-rich{padding:56px 24px;max-width:1160px;margin:0 auto}.wi-rich-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;align-items:start}.wi-panel{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}.wi-panel+.wi-panel{margin-top:20px}.wi-panel h2{font-size:24px;margin:0 0 14px}.wi-panel h3{font-size:17px;margin:18px 0 8px}.wi-panel p{color:var(--text-muted);font-size:15px;margin:0 0 12px;line-height:1.75}.wi-detail-list{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}.wi-detail-list li{margin-bottom:7px}.wi-side{position:sticky;top:82px}.wi-table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}.wi-table th,.wi-table td{border:1px solid var(--border);padding:11px;text-align:left;vertical-align:top}.wi-table th{background:var(--bg-gray);font-weight:800}.wi-note{border-left:4px solid var(--primary);background:var(--primary-light);padding:16px;border-radius:12px;color:var(--text);line-height:1.7;margin-top:14px}.wi-ref a,.wi-related a{display:block;color:var(--primary);font-weight:800;text-decoration:none;margin:8px 0}@media(max-width:860px){.wi-rich-grid{grid-template-columns:1fr}.wi-side{position:static}}</style>
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://workindex.co.in/#organization", name: "WorkIndex", url: "https://workindex.co.in" },
      { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: `${title} | WorkIndex`, description },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "WorkIndex", item: "https://workindex.co.in" },
        { "@type": "ListItem", position: 2, name: title, item: canonical },
      ] },
      { "@type": "FAQPage", mainEntity: faqJson },
    ],
  })}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body><nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="/?signup=true&role=client" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(title)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>${eyebrow}</div><h1>${h1 || title}<br><span>${subtitle}</span></h1><p>${intro}</p><a href="/?signup=true&role=client" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: ${TODAY}</div><div class="lp-trust-item">Official source first</div><div class="lp-trust-item">AY/FY separated</div><div class="lp-trust-item">No placeholder calculator content</div></div></section>
<main class="wi-rich"><div class="wi-rich-grid"><div>
${panels.join("\n")}
${panel("Official fact-check status", "Applicable year and source discipline", `<p><strong>Last fact-checked:</strong> ${TODAY}.</p><p>AY 2026-27 means FY 2025-26 income and is still filed under the Income-tax Act, 1961 using forms/instructions for that assessment year. Tax Year 2026-27 means FY 2026-27 income under the Income Tax Act, 2025. The two should not be mixed.</p><p>Where this page discusses a new form, rate, portal label or transition item, treat it as usable only when supported by the live e-filing portal, a CBDT notification, the Income Tax Department guidance page, the supplied Act PDF, or ICAI material.</p>`) }
${panel("Source-backed review checklist", "What a serious tax expert should verify", list([
    "Financial year, assessment year or tax year being handled.",
    "Residential status, age category, taxpayer type and whether business/professional income exists.",
    "Correct ITR form, utility validation rules and schedule requirements.",
    "AIS, TIS, Form 26AS, Form 16/Form 16A, TDS/TCS credits and advance-tax challans.",
    "Special-rate income such as section 111A, 112, 112A or VDA before applying section 87A rebate.",
    "Whether a claim is notified law, portal functionality, a draft/proposal, or a competitor summary.",
  ])) }
${panel("Questions People Ask", "FAQs", faqItems.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join(""))}
</div><aside class="wi-side"><div class="wi-panel"><h2>Post once, compare experts</h2><p>Share your exact year, income breakup, forms, notices and portal screenshots. Experts can quote only when the legal year and records are clear.</p><a href="/?signup=true&role=client" class="lp-hero-cta" style="padding:12px 18px;font-size:14px">Get Expert Quotes</a></div><div class="wi-panel wi-related"><h2>Related pages</h2>${relatedHtml}</div><div class="wi-panel wi-ref"><h2>Official references</h2>${officialLinks.map(([label, href]) => `<a href="${href}" rel="nofollow">${label}</a>`).join("")}</div></aside></div></main>
<section class="lp-cta-section"><h2>Need this checked against your documents?</h2><p>Post your requirement on WorkIndex with the year, amounts and source documents so the quote is based on facts, not generic SEO text.</p><a href="/?signup=true&role=client" class="lp-hero-cta">Post Requirement as Customer</a></section>
<footer class="lp-footer"><a href="/seo-pages/itr-filing-all-cities.html">ITR cities</a><a href="/seo-pages/gst-services-all-cities.html">GST cities</a><a href="/seo-pages/accounting-services-all-cities.html">Accounting cities</a><a href="/contact.html">Contact</a></footer></body></html>`;
}

const configs = [
  {
    slug: "income-tax-slab-rates-guide",
    title: "Income Tax Slab Rates FY 2025-26",
    description: "Officially aligned slab guide for FY 2025-26 / AY 2026-27 with new regime slabs, old regime slabs, surcharge, cess and section 87A notes.",
    subtitle: "AY 2026-27 slabs, rebate, surcharge and cess",
    intro: "For FY 2025-26 income, use AY 2026-27 rates under the Income-tax Act, 1961. The new regime is the default, but eligible taxpayers may opt out.",
    panels: [
      panel("Verified slab table", "New regime slabs for AY 2026-27", table([
        ["Up to Rs. 4,00,000", "Nil", "Default regime under section 115BAC."],
        ["Rs. 4,00,001 to Rs. 8,00,000", "5% above Rs. 4,00,000", "Use taxable income after eligible deductions such as salary standard deduction."],
        ["Rs. 8,00,001 to Rs. 12,00,000", "Rs. 20,000 + 10% above Rs. 8,00,000", "Resident individuals may get section 87A rebate up to Rs. 60,000 if taxable income does not exceed Rs. 12,00,000."],
        ["Rs. 12,00,001 to Rs. 16,00,000", "Rs. 60,000 + 15% above Rs. 12,00,000", "No automatic zero-tax result merely because gross salary was near Rs. 12 lakh; compute taxable income first."],
        ["Rs. 16,00,001 to Rs. 20,00,000", "Rs. 1,20,000 + 20% above Rs. 16,00,000", "Check surcharge only if total income crosses Rs. 50 lakh."],
        ["Rs. 20,00,001 to Rs. 24,00,000", "Rs. 2,00,000 + 25% above Rs. 20,00,000", "Special-rate income needs separate handling."],
        ["Above Rs. 24,00,000", "Rs. 3,00,000 + 30% above Rs. 24,00,000", "Cess is 4% on tax plus surcharge."],
      ], ["Income slab", "Tax rate", "Planning note"])),
      panel("Old regime", "Old regime slabs for AY 2026-27", table([
        ["Below 60 years", "Nil up to Rs. 2.5 lakh; 5% up to Rs. 5 lakh; 20% up to Rs. 10 lakh; 30% above Rs. 10 lakh", "Can claim eligible deductions/exemptions such as 80C, HRA, 80D and self-occupied house-property interest."],
        ["Senior citizen 60 to below 80", "Nil up to Rs. 3 lakh; 5% up to Rs. 5 lakh; 20% up to Rs. 10 lakh; 30% above Rs. 10 lakh", "Old regime basic exemption is higher for resident seniors."],
        ["Super senior 80 or above", "Nil up to Rs. 5 lakh; 20% up to Rs. 10 lakh; 30% above Rs. 10 lakh", "New regime slab does not vary by age."],
      ], ["Taxpayer age", "Old-regime slab", "Key note"])),
      panel("Rebate and surcharge", "Section 87A, cess and surcharge", list([
        "Resident individuals only: 87A rebate is up to Rs. 60,000 in the new regime where taxable income does not exceed Rs. 12 lakh.",
        "Old regime rebate is up to Rs. 12,500 where taxable income does not exceed Rs. 5 lakh.",
        "NRIs do not get section 87A rebate.",
        "Health and education cess is 4% on tax plus surcharge.",
        "Enhanced surcharge on income chargeable under sections 111A, 112, 112A and dividend income is capped as per official guidance; verify high-income cases separately.",
      ])),
    ],
    related: [["Income Tax Calculator", "/seo-pages/income-tax-calculator.html"], ["Old vs New Tax Regime", "/seo-pages/old-vs-new-tax-regime.html"], ["Section 87A Rebate", "/seo-pages/section-87a-rebate-special-rate-help.html"]],
  },
  {
    slug: "old-vs-new-tax-regime",
    title: "Old vs New Tax Regime",
    description: "Compare old and new tax regime for AY 2026-27 using official slabs, deductions, Form 10-IEA rules and salary standard deduction logic.",
    subtitle: "Choose using taxable income, deductions and Form 10-IEA rules",
    intro: "The new regime is the default for AY 2026-27. Non-business taxpayers can choose in the ITR; business/profession taxpayers use Form 10-IEA to opt out by the due date.",
    panels: [
      panel("Decision framework", "Start with taxable income, not gross income", list([
        "Salary or pension should first be reduced by the eligible standard deduction before slab and 87A checks.",
        "Compare old regime only after adding real deductions: HRA, 80C, 80D, home-loan interest, NPS and other eligible claims.",
        "Separate special-rate income such as equity STCG, LTCG, VDA and dividends before assuming section 87A wipes out the tax.",
        "For business/professional income, regime switching has restrictions and Form 10-IEA matters.",
      ])),
      panel("What survives in the new regime", "Common benefits still relevant", list([
        "Standard deduction for salary/pension as per AY 2026-27 rules.",
        "Employer NPS contribution under section 80CCD(2), subject to limits.",
        "Family pension deduction under section 57(iia), where applicable.",
        "Let-out house-property interest is handled differently from self-occupied property; model it carefully.",
      ])),
      panel("What usually pushes taxpayers to old regime", "Old-regime advantages", list([
        "HRA exemption, if rent and salary structure support the claim.",
        "Section 80C investments and home-loan principal within the overall limit.",
        "Section 80D health insurance deduction.",
        "Self-occupied home-loan interest under section 24(b), subject to limits.",
        "NPS employee contribution under section 80CCD(1B).",
      ])),
    ],
    related: [["Form 10-IEA Guide", "/seo-pages/form-10-iea-tax-regime-guide.html"], ["Income Tax Slabs", "/seo-pages/income-tax-slab-rates-guide.html"], ["Home Loan Tax Benefit", "/seo-pages/home-loan-tax-benefit-guide.html"]],
  },
  {
    slug: "form-10-iea-tax-regime-guide",
    title: "Form 10-IEA - Opting Out of New Tax Regime",
    description: "Form 10-IEA guide for AY 2026-27: who needs it, due date under section 139(1), business/profession restrictions and common mistakes.",
    subtitle: "Business and professional taxpayers need the form to opt out",
    intro: "Official AY 2026-27 guidance says business/profession taxpayers who want to opt out of the default new regime furnish Form 10-IEA on or before the section 139(1) due date.",
    panels: [
      panel("Who needs it", "Form 10-IEA applicability", list([
        "Needed when an eligible taxpayer with business or professional income wants to opt out of the default new regime.",
        "Non-business cases generally choose the regime directly in the ITR filed by the due date.",
        "Re-entering the new regime for business/profession taxpayers also uses Form 10-IEA and is subject to one-time switching limits.",
      ])),
      panel("Process", "How to handle Form 10-IEA safely", list([
        "Compute both regimes using complete income and deduction data.",
        "File Form 10-IEA before filing ITR if old regime is chosen by a business/profession taxpayer.",
        "Keep the acknowledgement number and quote it correctly in ITR-3/ITR-4.",
        "Recalculate advance tax if the regime choice changes the liability.",
      ])),
      panel("Common errors", "Mistakes to avoid", list([
        "Filing ITR first and trying to fix the regime later.",
        "A salaried-only taxpayer filing the form unnecessarily.",
        "Ignoring the switching restriction for taxpayers with business or professional income.",
        "Using a tax estimate that ignores special-rate income or disallowed deductions in the new regime.",
      ])),
    ],
    related: [["Old vs New Tax Regime", "/seo-pages/old-vs-new-tax-regime.html"], ["ITR-4 AY 2026-27", "/seo-pages/itr-4-ay-2026-27-guide.html"], ["Income Tax Calculator", "/seo-pages/income-tax-calculator-ay-2026-27.html"]],
  },
  {
    slug: "itr-4-ay-2026-27-guide",
    title: "ITR-4 Filing Guide - AY 2026-27",
    description: "ITR-4 AY 2026-27 guide with official eligibility, presumptive taxation, section 112A LTCG up to Rs. 1.25 lakh and Form 10-IEA notes.",
    subtitle: "Presumptive taxation with AY 2026-27 eligibility checks",
    intro: "ITR-4 is for eligible resident individuals, HUFs and firms other than LLPs using presumptive income. AY 2026-27 guidance allows section 112A LTCG up to Rs. 1.25 lakh, subject to exclusions.",
    panels: [
      panel("Eligibility", "Who can use ITR-4", list([
        "Resident individual, HUF or firm other than LLP.",
        "Business/profession income computed presumptively under sections 44AD, 44ADA or 44AE.",
        "Total income up to Rs. 50 lakh, excluding permitted section 112A LTCG up to Rs. 1.25 lakh as per portal guidance.",
        "May include salary/pension, one house property, other sources, agricultural income up to Rs. 5,000 and permitted section 112A LTCG.",
      ])),
      panel("Cannot use ITR-4", "Key exclusions", list([
        "Director in a company, unlisted equity shares, foreign assets, foreign income or foreign signing authority.",
        "Short-term capital gains or long-term capital gains under section 112A exceeding Rs. 1.25 lakh.",
        "Brought-forward loss or loss to be carried forward under any head.",
        "ESOP tax deferral, section 194N cases or other special exclusions in portal validation rules.",
      ])),
      panel("Before filing", "Records to reconcile", list([
        "AIS, TIS, Form 26AS and TDS certificates.",
        "Bank statements, gross receipts and GST turnover where registered.",
        "Broker capital-gain statement if section 112A gains exist.",
        "Form 10-IEA acknowledgement if opting out of the default new regime.",
      ])),
    ],
    related: [["Form 10-IEA", "/seo-pages/form-10-iea-tax-regime-guide.html"], ["Presumptive Taxation", "/seo-pages/presumptive-taxation-44ad-44ada-guide.html"], ["ITR-2 AY 2026-27", "/seo-pages/itr-2-ay-2026-27-guide.html"]],
  },
  {
    slug: "blog-itr-1-ay-2026-27-guide",
    title: "ITR-1 Filing Guide - AY 2026-27",
    description: "ITR-1 AY 2026-27 guide with official eligibility, two house property update, section 112A LTCG up to Rs. 1.25 lakh and when to switch to ITR-2.",
    eyebrow: "Blog",
    subtitle: "Who can file and when to switch to ITR-2",
    intro: "ITR-1 is for resident individuals with simpler income up to Rs. 50 lakh. AY 2026-27 portal downloads show ITR-1 can include two house properties and section 112A LTCG up to Rs. 1.25 lakh, subject to exclusions.",
    panels: [
      panel("Eligibility", "Who can use ITR-1 for AY 2026-27", list([
        "Resident individual other than not ordinarily resident.",
        "Total income up to Rs. 50 lakh.",
        "Salary/pension, up to two house properties, other sources, agricultural income up to Rs. 5,000.",
        "Long-term capital gains under section 112A up to Rs. 1.25 lakh, subject to no disqualifying losses or exclusions.",
      ])),
      panel("Switch to ITR-2", "When ITR-1 is not enough", list([
        "Short-term capital gains or section 112A LTCG exceeding Rs. 1.25 lakh.",
        "Foreign assets, foreign income or signing authority outside India.",
        "Directorship, unlisted equity shares or ESOP tax deferral.",
        "Brought-forward or carry-forward loss under any head.",
      ])),
      panel("Filing checks", "Before accepting pre-filled data", list([
        "Match Form 16 with salary prefill.",
        "Check AIS/TIS and Form 26AS for bank interest, dividends and TDS.",
        "Check standard deduction before applying new-regime slab and 87A rebate.",
        "Use the current AY 2026-27 ITR utility and validation rules.",
      ])),
    ],
    related: [["ITR-2 AY 2026-27", "/seo-pages/itr-2-ay-2026-27-guide.html"], ["Income Tax Calculator AY 2026-27", "/seo-pages/income-tax-calculator-ay-2026-27.html"], ["Section 87A Rebate", "/seo-pages/section-87a-rebate-special-rate-help.html"]],
  },
  {
    slug: "income-tax-rules-2026-guide",
    title: "Income Tax Rules 2026 - Transition Guide",
    description: "Transition guide for Income Tax Rules 2026 claims, AY 2026-27 under the 1961 Act, Tax Year 2026-27 under the 2025 Act and how to verify forms.",
    subtitle: "Separate notified law from transition noise",
    intro: "Use this page as a transition tracker. AY 2026-27 return filing for FY 2025-26 uses forms under the Income-tax Act, 1961; Tax Year 2026-27 is the first income year under the Income Tax Act, 2025.",
    panels: [
      panel("Verified transition point", "AY 2026-27 is not Tax Year 2026-27", list([
        "AY 2026-27 relates to FY 2025-26 income and is handled under the Income-tax Act, 1961.",
        "Tax Year 2026-27 relates to FY 2026-27 income and is handled under the Income Tax Act, 2025.",
        "The e-filing portal may run old-Act and new-Act compliance concurrently during transition.",
      ])),
      panel("Treat as tracker until notified", "Claims that need source verification", list([
        "Any claim that Form 130, Form 131, Form 97 or new PAN/TAN form numbers replace existing forms for a specific filing year.",
        "Payroll allowance changes such as HRA city expansion or perquisite valuation changes.",
        "TCS/TDS rate changes attributed to a future tax year.",
        "Penalty changes or new form numbers that are not visible in official portal instructions or notifications.",
      ])),
      panel("Safe workflow", "How employers and CAs should verify", list([
        "Check live e-filing/TRACES/GST portal screens.",
        "Retain notification number, form instruction PDF or validation-rule PDF with the working paper.",
        "Do not update payroll or client advice from competitor snippets alone.",
      ])),
    ],
    related: [["New Income Tax Act 2025", "/seo-pages/new-income-tax-act-2025-guide.html"], ["Form 130 vs Form 16", "/seo-pages/form-130-vs-form-16.html"], ["TRACES 2 Guide", "/seo-pages/traces-2-portal-guide.html"]],
  },
  {
    slug: "form-130-vs-form-16",
    title: "Form 130 vs Form 16 - Salary TDS Certificate Tracker",
    description: "Salary TDS certificate transition tracker. For AY 2026-27 Form 16 remains listed in official salaried guidance under the 1961 Act.",
    subtitle: "Use Form 16 for AY 2026-27 unless official instructions say otherwise",
    intro: "The official AY 2026-27 salaried guidance still lists Form 16 and Form 16A under the Income-tax Act, 1961. Treat Form 130 replacement claims as new-Act transition items until verified for the relevant tax year.",
    panels: [
      panel("Current verified position", "AY 2026-27 salary certificate", list([
        "AY 2026-27 relates to FY 2025-26 and official salaried guidance still describes Form 16 as the salary TDS certificate.",
        "Employers should issue the certificate generated/recognised through TRACES for that year.",
        "If a new form applies to Tax Year 2026-27, it should be confirmed against CBDT/e-filing/TRACES instructions before use.",
      ])),
      panel("Employee checks", "What to verify before filing", list([
        "Form 16 Part A and Part B match salary slips.",
        "TDS in Form 16 matches Form 26AS/AIS.",
        "Regime, standard deduction, HRA and perquisites are correctly reflected.",
      ])),
    ],
    related: [["ITR for Salaried Employees", "/seo-pages/itr-filing-for-salaried-employees.html"], ["Form 16 Download Help", "/seo-pages/form-16-download-help.html"], ["Income Tax Rules 2026", "/seo-pages/income-tax-rules-2026-guide.html"]],
  },
  {
    slug: "form-131-tds-certificate-guide",
    title: "Form 131 vs Form 16A - TDS Certificate Tracker",
    description: "Non-salary TDS certificate transition tracker. For AY 2026-27 official guidance still lists Form 16A under the Income-tax Act, 1961.",
    subtitle: "Do not rename Form 16A for AY 2026-27 without official portal support",
    intro: "Official AY 2026-27 guidance still describes Form 16A as the non-salary TDS certificate. Any Form 131 claim should be verified against the new Act/rules and TRACES screen for the specific tax year.",
    panels: [
      panel("Current verified position", "Form 16A still matters for AY 2026-27", list([
        "Form 16A is listed in AY 2026-27 salaried guidance as the TDS certificate for income other than salary.",
        "Recipients should reconcile Form 16A with AIS/Form 26AS before claiming TDS credit.",
        "Deductors should follow TRACES downloads and official certificate formats for the relevant period.",
      ])),
      panel("Use cases", "Where non-salary TDS certificates matter", list([
        "Professional fees under section 194J.",
        "Contractor payments under section 194C.",
        "Bank interest under section 194A.",
        "Rent, commission and other non-salary TDS sections.",
      ])),
    ],
    related: [["TRACES 2 Portal Guide", "/seo-pages/traces-2-portal-guide.html"], ["TDS Filing Services", "/seo-pages/tds-filing-services.html"], ["Form 26AS Mismatch Help", "/seo-pages/form-26as-mismatch-help.html"]],
  },
  {
    slug: "itr-3-itr-4-august-31-deadline",
    title: "ITR-3 and ITR-4 Deadline Tracker - AY 2026-27",
    description: "AY 2026-27 deadline tracker for ITR-3 and ITR-4. Do not assume an August 31 extension unless a CBDT order or portal announcement applies.",
    subtitle: "Verify any extension against CBDT/portal before relying on it",
    intro: "Generic pages often turn rumours into dates. For AY 2026-27, use the live e-filing portal, CBDT order and the applicable ITR form before assuming ITR-3 or ITR-4 has a different due date.",
    panels: [
      panel("Safe position", "How to treat deadline claims", list([
        "Default individual due dates under section 139(1) depend on audit and taxpayer category.",
        "An extension is usable only if backed by CBDT order, official press release or portal announcement.",
        "Keep screenshot/order number if filing after the usual due date based on an extension.",
      ])),
      panel("Who should monitor this", "High-risk filers", list([
        "Freelancers/professionals filing ITR-3 or ITR-4.",
        "F&O traders and business owners.",
        "Tax audit cases, where the due date differs.",
        "Taxpayers waiting for utility release or validation fixes.",
      ])),
    ],
    related: [["ITR-4 AY 2026-27", "/seo-pages/itr-4-ay-2026-27-guide.html"], ["Belated ITR Filing Help", "/seo-pages/belated-itr-filing-help.html"], ["ITR Filing Services", "/seo-pages/itr-filing-services.html"]],
  },
  {
    slug: "tcs-uniform-2-percent-guide",
    title: "TCS on LRS and Overseas Travel - Rate Tracker",
    description: "TCS on LRS and overseas travel tracker. Verify the current bank-applied rate, threshold, purpose code and credit claim before remitting.",
    subtitle: "Check the law and bank rate before assuming a flat rate",
    intro: "TCS on foreign remittance has changed repeatedly. This page is now a rate tracker, not a flat 2 percent claim page.",
    panels: [
      panel("Before remitting", "What decides TCS", list([
        "Purpose code: education loan, education from own funds, medical, travel, overseas tour package, investment or other LRS.",
        "Threshold and cumulative remittances during the financial year.",
        "Whether the collector is an authorised dealer bank or tour operator.",
        "Current law and bank implementation date.",
      ])),
      panel("After remitting", "How to use TCS credit", list([
        "TCS is not final tax; it is a credit/refund item in ITR.",
        "Match TCS in AIS/Form 26AS and certificate/statement from the collector.",
        "Claim the credit in the return for the correct PAN and assessment year.",
      ])),
    ],
    related: [["TCS on Foreign Remittance LRS", "/seo-pages/tcs-on-foreign-remittance-lrs.html"], ["ITR Filing for NRI", "/seo-pages/itr-filing-for-nri.html"], ["DTAA Benefit Claim", "/seo-pages/dtaa-benefit-claim-india.html"]],
  },
  {
    slug: "section-87a-rebate-special-rate-help",
    title: "Section 87A Rebate - Special Rate Income Restriction",
    description: "Section 87A rebate guide for AY 2026-27, covering resident-only rebate, new regime Rs. 12 lakh condition and special-rate income checks.",
    subtitle: "Zero tax depends on taxable income and income type",
    intro: "Section 87A is powerful but not a blanket wipe-out for every tax component. Salary standard deduction, residential status and special-rate schedules must be checked before saying tax is nil.",
    panels: [
      panel("Verified rebate limits", "AY 2026-27 rebate framework", list([
        "New regime: resident individual rebate up to Rs. 60,000 where taxable income does not exceed Rs. 12,00,000.",
        "Old regime: resident individual rebate up to Rs. 12,500 where taxable income does not exceed Rs. 5,00,000.",
        "NRIs are not eligible for section 87A rebate.",
      ])),
      panel("Special-rate warning", "Do not apply rebate blindly", list([
        "Income under sections 111A, 112, 112A and VDA/special-rate schedules needs separate computation in the ITR utility.",
        "If gross salary is Rs. 12.5 lakh, first reduce eligible standard deduction; the rebate check is on taxable income, not gross salary.",
        "If taxable normal income is within the rebate limit but special-rate income exists, use the official utility/computation to confirm the payable amount.",
      ])),
    ],
    related: [["Income Tax Calculator AY 2026-27", "/seo-pages/income-tax-calculator-ay-2026-27.html"], ["Capital Gains Tax Services", "/seo-pages/capital-gains-tax-services.html"], ["ITR Filing for Crypto Traders", "/seo-pages/itr-filing-for-crypto-traders.html"]],
  },
];

for (const cfg of configs) {
  fs.writeFileSync(path.join(SEO_DIR, `${cfg.slug}.html`), page(cfg), "utf8");
}

const incomePatterns = [
  "income-tax",
  "itr-",
  "itr-filing",
  "itr-for",
  "tds",
  "tcs",
  "form-",
  "section-",
  "tax-regime",
  "capital-gains",
  "hra",
  "vda",
  "crypto",
  "advance-tax",
  "ais",
  "26as",
  "outstanding-tax-demand",
  "tax-benefit",
  "tax-deduction",
  "tax-notice",
  "tax-demand",
  "tax-refund",
  "tax-saving",
  "mutual-fund-tax",
  "home-loan-tax",
  "education-loan",
  "44ad",
  "44ada",
  "44ae",
  "zero-tax",
];

const genericPanelRe = /<section class="wi-panel"><div class="lp-section-eyebrow">(Expert Screening|Records Checklist|Posting Brief|Quality Check|WorkIndex Posting Tips)<\/div>[\s\S]*?<\/section>/g;
const genericFaqRe = /<section class="wi-panel"><div class="lp-section-eyebrow">Questions People Ask<\/div><h2>FAQs<\/h2>[\s\S]*?<\/section>/g;

function topicFor(file) {
  const raw = fs.readFileSync(file, "utf8");
  const h1 = raw.match(/<h1>([\s\S]*?)<br>/);
  const title = raw.match(/<title>(.*?)\s*\|?\s*WorkIndex?<\/title>/i);
  const name = h1 ? h1[1].replace(/<[^>]*>/g, "").trim() : title ? title[1].trim() : titleFromSlug(path.basename(file));
  return name.replace(/\s+/g, " ");
}

function verifyPanel(topic, slug) {
  const extra = [];
  if (slug.includes("ay-2026-27") || slug.includes("itr-") || slug.includes("income-tax")) {
    extra.push("For AY 2026-27, check the ITR utility, validation rules and official e-filing guidance before relying on secondary summaries.");
  }
  if (slug.includes("rules-2026") || slug.includes("form-130") || slug.includes("form-131") || slug.includes("form-97") || slug.includes("new-pan")) {
    extra.push("For new form-number claims, confirm whether the page relates to AY 2026-27 under the 1961 Act or Tax Year 2026-27 under the 2025 Act.");
  }
  if (slug.includes("hra") || slug.includes("tcs") || slug.includes("vda")) {
    extra.push("If a rate, city list or penalty is described as new for 2026, insist on the exact official notification or portal instruction before applying it.");
  }
  return panel("Official fact-check status", `${topic}: year and source check`, `<p><strong>Last fact-checked:</strong> ${TODAY}.</p><p>AY 2026-27 means FY 2025-26 income under the Income-tax Act, 1961. Tax Year 2026-27 means FY 2026-27 income under the Income Tax Act, 2025. Do not mix the two labels.</p>${extra.map((x) => `<p>${x}</p>`).join("")}<p>Use official portal pages, CBDT notifications, the supplied Act PDF and ICAI material before making a filing, payroll, TDS/TCS or rebate decision.</p>`);
}

function checklistPanel(topic) {
  return panel("Review checklist", `What to verify for ${topic}`, list([
    "Correct financial year, assessment year or tax year.",
    "Taxpayer type, age category, residential status and business/profession status.",
    "Exact income heads, including salary, house property, business/profession, capital gains, VDA and other sources.",
    "AIS/TIS, Form 26AS, TDS/TCS certificates, challans and portal pre-fill.",
    "Deductions/exemptions allowed in the selected regime and current ITR utility validation rules.",
    "Whether the issue is a calculation, filing, notice response, rectification, appeal or advisory position.",
  ]));
}

function faqPanel(topic) {
  return panel("Questions People Ask", "FAQs", `<h3>Which year should I use for ${topic}?</h3><p>Use AY 2026-27 for FY 2025-26 income under the Income-tax Act, 1961. Use Tax Year 2026-27 for FY 2026-27 income under the Income Tax Act, 2025.</p><h3>What documents should I share with a tax expert?</h3><p>Share the portal screenshot, exact year, income breakup, certificates, AIS/Form 26AS, notices, challans and any computation already prepared.</p><h3>Can WorkIndex help me find a specialist?</h3><p>Yes. Post a requirement with the legal year, records and deadline so experts can quote on the real issue instead of a generic page title.</p>`);
}

let cleaned = 0;
for (const name of fs.readdirSync(SEO_DIR)) {
  if (!name.endsWith(".html")) continue;
  const lower = name.toLowerCase();
  if (!incomePatterns.some((p) => lower.includes(p))) continue;
  const file = path.join(SEO_DIR, name);
  let html = fs.readFileSync(file, "utf8");
  const topic = topicFor(file);
  const original = html;

  html = html
    .replace(/Clear guidance before you hire/g, "Official-year checks before you file")
    .replace(/WorkIndex guide/g, "Fact-checked tax guide")
    .replace(/practical India-focused guidance, documents, costs, expert selection tips and WorkIndex hiring flow\./g, `officially checked ${topic} guidance for the correct financial year, assessment year, records and filing path.`)
    .replace(/WorkIndex helps customers post structured requirements and compare expert responses, profiles, pricing expectations and service fit before hiring\./g, `Use WorkIndex to find an expert after you have the correct year, forms, portal screenshots and source records ready.`)
    .replace(/Open a related WorkIndex local hiring page\./g, "Compare experts for this related compliance requirement.")
    .replace(/We reviewed high-performing Indian tax, GST, accounting and compliance pages and strengthened this page around practical decision points: documents, scope, pricing, timelines, risks and local context\./g, `This page has been revisited for official-year accuracy. For ${topic}, verify the relevant Act, portal utility, notification date, forms, records and deadline before filing or advising.`)
    .replace(/Research the topic before hiring/g, "Verify official sources before hiring")
    .replace(/Is posting on WorkIndex free\?/g, `What should I verify for ${topic}?`)
    .replace(/Yes\. Customers can post a requirement for free and compare relevant experts before hiring\./g, "Verify the financial year or tax year, taxpayer category, portal form, source documents, notices and computations before finalising the filing or advice.")
    .replace(/Can this be handled online\?/g, `Can ${topic} be handled online?`)
    .replace(/Most tax, GST, accounting, registration and web-development tasks can be handled online if records and portal access are clear\./g, "Most income-tax work can be handled online when AIS/Form 26AS, certificates, challans, notices, computations and portal access are available.")
    .replace(/Most tax, GST, registration, accounting, audit and web-development tasks can be handled remotely when records and portal access are clear\./g, "Most income-tax work can be handled remotely when the records and portal access are complete.")
    .replace(/How should I compare quotes\?/g, `How should I compare experts for ${topic}?`)
    .replace(/Compare scope, relevant experience, timeline, records required, exclusions, follow-up support and whether the expert has handled similar work before\./g, "Compare whether the expert identifies the applicable year, law source, form, calculation method, documents, exclusions and follow-up scope.")
    .replace(/Compare scope, experience with the exact issue, timeline, required records, exclusions, follow-up support and whether the expert has handled similar work\./g, "Compare whether the expert identifies the applicable year, law source, form, calculation method, documents, exclusions and follow-up scope.")
    .replace(/Compare scope, experience, timeline, required documents, follow-up support and whether the expert has handled similar work before\./g, "Compare whether the expert identifies the applicable year, law source, form, calculation method, documents, exclusions and follow-up scope.");

  html = html.replace(
    /<section class="lp-section"><div class="lp-section-eyebrow">Hiring checklist<\/div>[\s\S]*?<\/section>/g,
    `<section class="lp-section"><div class="lp-section-eyebrow">Official Checklist</div><h2 class="lp-section-title">What to verify for ${topic}</h2><div class="wi-box"><ul><li>Correct FY/AY or Tax Year.</li><li>Applicable Act: 1961 Act for AY 2026-27, 2025 Act for Tax Year 2026-27.</li><li>Portal utility, form instruction, validation rule or notice section.</li><li>AIS, Form 26AS, TDS/TCS certificates, challans and source records.</li><li>Rebate, surcharge, special-rate income and regime choice before final tax.</li></ul></div></section>`
  );

  html = html.replace(
    /<section class="lp-section"><div class="lp-section-eyebrow">Compare<\/div>[\s\S]*?<\/section>/g,
    `<section class="lp-section"><div class="lp-section-eyebrow">Source Check</div><h2 class="lp-section-title">Official sources before SEO summaries</h2><div class="wi-box">Use the Income Tax e-Filing portal, CBDT notifications, ITR utilities/validation rules, the supplied Act PDF and ICAI material first. Competitor calculators or articles can be useful for UX comparison, but not as the legal source for ${topic}.</div></section>`
  );

  html = html.replace(
    /<section class="lp-section"><div class="lp-section-eyebrow">FAQ<\/div><h2 class="lp-section-title">Common questions<\/h2>[\s\S]*?<\/section>/g,
    `<section class="lp-section"><div class="lp-section-eyebrow">FAQ</div><h2 class="lp-section-title">Common questions</h2><div class="wi-grid"><div class="lp-step"><h3>Which year applies?</h3><p>For FY 2025-26 income, use AY 2026-27 under the Income-tax Act, 1961. For FY 2026-27 income, use Tax Year 2026-27 under the Income Tax Act, 2025.</p></div><div class="lp-step"><h3>What should I share with an expert?</h3><p>Share the portal screen, exact year, income breakup, notices, certificates, AIS/Form 26AS, challans and draft computation.</p></div></div></section>`
  );

  html = html.replace(genericPanelRe, "");
  html = html.replace(genericFaqRe, faqPanel(topic));

  if (html.includes('<div class="lp-section-eyebrow">Accuracy Notes</div>')) {
    html = html.replace(/<section class="wi-panel"><div class="lp-section-eyebrow">Accuracy Notes<\/div>[\s\S]*?<\/section>/, verifyPanel(topic, lower));
  } else if (html.includes("</div>\n<aside class=\"wi-side\"")) {
    html = html.replace("</div>\n<aside class=\"wi-side\"", `${verifyPanel(topic, lower)}\n${checklistPanel(topic)}\n</div>\n<aside class="wi-side"`);
  }

  if (!html.includes("Last fact-checked")) {
    const factSection = `<section class="lp-section"><div class="lp-section-eyebrow">Official fact-check status</div><h2 class="lp-section-title">Last fact-checked: ${TODAY}</h2><p class="lp-section-sub">Tax positions on this page should be checked against official portal instructions, CBDT notifications, the supplied Act PDF and ICAI material for the exact year before filing.</p></section>`;
    if (html.includes("</main>")) {
      html = html.replace("</main>", `${factSection}</main>`);
    } else if (html.includes('<section class="lp-cta-section"')) {
      html = html.replace('<section class="lp-cta-section"', `${factSection}\n<section class="lp-cta-section"`);
    } else {
      html = html.replace("</body>", `${factSection}</body>`);
    }
  }

  if (html !== original) {
    fs.writeFileSync(file, html, "utf8");
    cleaned += 1;
  }
}

console.log(`Rewrote ${configs.length} high-risk pages and cleaned ${cleaned} income-tax SEO pages.`);
