import os
import re
import json
import html
from pathlib import Path

root = Path("C:/Ravish/workindex-frontend")
seo_dir = root / "seo-pages"
seo_dir.mkdir(parents=True, exist_ok=True)

cta_url = "/?signup=true&role=client"
fact_date = "2026-07-01"

site = "https://workindex.co.in"

caps = {
    'ay': 'AY', 'ca': 'CA', 'cfo': 'CFO', 'cbic': 'CBIC', 'dsc': 'DSC', 'epf': 'EPF', 'esic': 'ESIC',
    'fema': 'FEMA', 'fy': 'FY', 'gst': 'GST', 'gstr': 'GSTR', 'hsn': 'HSN', 'huf': 'HUF', 'ims': 'IMS',
    'it': 'Income Tax', 'itr': 'ITR', 'itc': 'ITC', 'llp': 'LLP', 'lrs': 'LRS', 'ltcg': 'LTCG',
    'mat': 'MAT', 'mca': 'MCA', 'mis': 'MIS', 'msme': 'MSME', 'nbfc': 'NBFC', 'nri': 'NRI',
    'pan': 'PAN', 'pf': 'PF', 'posh': 'POSH', 'rbi': 'RBI', 'rcm': 'RCM', 'rera': 'RERA',
    'roc': 'ROC', 'sac': 'SAC', 'sebi': 'SEBI', 'sft': 'SFT', 'stcg': 'STCG', 'tcs': 'TCS',
    'tds': 'TDS', 'tan': 'TAN', 'udyam': 'Udyam', 'ptrc': 'PTRC', 'ptec': 'PTEC', 'vda': 'VDA', 'nft': 'NFT',
    'dtaa': 'DTAA', 'trc': 'TRC', 'hra': 'HRA', 'nps': 'NPS', 'espp': 'ESPP', 'rsu': 'RSU', 'paye': 'PAYE',
    'ira': 'IRA', 'cpf': 'CPF', 'fiu': 'FIU', 'p2p': 'P2P', 'vc': 'VC', 'sha': 'SHA', 'spa': 'SPA', 'ncd': 'NCD',
    'ifsc': 'IFSC', 'aif': 'AIF', 'sgb': 'SGB', 'ppf': 'PPF', 'fd': 'FD', 'nsc': 'NSC', 'rd': 'RD', 'oidar': 'OIDAR',
    'ota': 'OTA', 'scss': 'SCSS', 'pe': 'PE', 'mli': 'MLI', 'beps': 'BEPS', 'ppt': 'PPT', 'map': 'MAP',
    'amc': 'AMC', 'kyc': 'KYC', 'pre-emi': 'Pre-EMI', 'emi': 'EMI', 'dcf': 'DCF', 'nav': 'NAV',
    'ccm': 'CCM', 'dpiit': 'DPIIT', 'ddt': 'DDT', 'ulip': 'ULIP', 'udin': 'UDIN', 'caro': 'CARO', 'ai': 'AI', 'ocr': 'OCR'
}

def esc(value):
    return html.escape(str(value or ""), quote=True)

def title_from_slug(slug):
    words = slug.split('-')
    capitalized = [caps.get(w.lower(), w.capitalize()) for w in words]
    title = ' '.join(capitalized)
    title = re.sub(r'\bVs\b', 'vs', title)
    title = re.sub(r'\bPvt\b', 'Private', title)
    title = re.sub(r'\bLtd\b', 'Limited', title)
    title = re.sub(r'\bCbdt\b', 'CBDT', title)
    title = re.sub(r'\bRoi\b', 'ROI', title)
    title = re.sub(r'\bAi\b', 'AI', title)
    return title

existing_files = set(f.name for f in seo_dir.glob("*.html"))
print(f"Loaded {len(existing_files)} existing pages in seo-pages.")

def generate_ai_ca_page(slug):
    title = title_from_slug(slug)
    meta_desc = f"{title} guide for Indian CA firms & taxpayers. Learn how AI tools, prompt engineering, and OCR automation speed up compliance on WorkIndex work index."
    
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": f"{site}/#organization",
                "name": "WorkIndex",
                "alternateName": "Work Index",
                "url": site
            },
            {
                "@type": "Article",
                "@id": f"{site}/seo-pages/{slug}.html/#article",
                "headline": title,
                "description": meta_desc,
                "author": {"@id": f"{site}/#organization"},
                "publisher": {"@id": f"{site}/#organization"},
                "datePublished": "2026-07-01",
                "dateModified": "2026-07-01"
            },
            {
                "@type": "FAQPage",
                "@id": f"{site}/seo-pages/{slug}.html/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f"How does {title.lower()} improve efficiency in CA firms?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "AI automation reduces manual data entry, parses scanned statements into Tally/Zoho vouchers via OCR, and auto-matches GSTR-2B ledgers, saving up to 70% of routine processing time."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": f"Is data processed through {title.lower()} compliant with India DPDP Act?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Indian tax-native AI tools must comply with the Digital Personal Data Protection (DPDP) Act 2023, ensuring zero client data leakage and local cloud data residency."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can AI replace professional Chartered Accountants?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. AI operates under a human-in-the-loop framework, handling mechanical compilation while the CA provides strategic judgment, audit signing, and legal representation."
                        }
                    }
                ]
            }
        ]
    }

    content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{esc(title)} | WorkIndex Work Index</title>
<meta name="description" content="{esc(meta_desc)}"/>
<meta name="keywords" content="{esc(title)}, AI CA tools India, tax automation, Tally OCR parser, GSTR-2B AI reconciliation, WorkIndex"/>
<link rel="canonical" href="{site}/seo-pages/{slug}.html"/>
<meta property="og:title" content="{esc(title)} | WorkIndex"/>
<meta property="og:description" content="{esc(meta_desc)}"/>
<meta property="og:url" content="{site}/seo-pages/{slug}.html"/>
<meta property="og:type" content="article"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="stylesheet" href="/lp-styles.css"/>
<script type="application/ld+json">{json.dumps(schema, indent=2)}</script>
</head>
<body>
<nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="{cta_url}" class="lp-nav-cta">Post Requirement</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><a href="/seo-pages/accounting-services-india.html">CA & AI Services</a><span>/</span><span>{esc(title)}</span></div>
<section class="lp-hero">
<div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>AI in CA Practice & Tax Automation</div>
<h1>{esc(title)}<br><span>Fact-Checked Guide & Workflow</span></h1>
<p>Discover how AI tools, OCR statement parsers, and automated reconciliation transform tax compliance and audit execution for Chartered Accountants and businesses in India. Check requirements on the WorkIndex work index platform.</p>
<a href="{cta_url}" class="lp-hero-cta">Connect with AI-Powered CA Experts</a>
</section>

<div class="lp-content-wrapper" style="max-width:1100px;margin:40px auto;padding:0 20px;">
<section class="wi-panel">
<div class="lp-section-eyebrow">AI Capabilities & Time Savings</div>
<h2>Key Features of {esc(title)}</h2>
<ul class="wi-detail-list">
<li><strong>Automated Data Ingestion</strong>: Converts PDF bank statements, handwritten receipts, and scanned tax invoices into clean Tally / Zoho Books vouchers using India-tax trained OCR models.</li>
<li><strong>Smart Reconciliation</strong>: Auto-matches GSTR-2B purchase ledgers against 3B returns, highlighting mismatched GSTINs, missing invoices, and ineligible ITC claims in seconds.</li>
<li><strong>Prompt-Assisted Research</strong>: Enables CAs to query complex Income-tax Act 2025 sections, DTAA treaties, and GST circulars with instant citation support.</li>
<li><strong>Audit Working Papers</strong>: Generates automated Schedule III trial balance notes, ratio analysis, and preliminary CARO 2020 audit checklists.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Human-in-the-Loop & Governance</div>
<h2>Verification Rules & DPDP Compliance</h2>
<p>While AI speeds up mechanical execution by over 70%, professional accountability remains paramount:</p>
<ul class="wi-detail-list">
<li><strong>Human Review Mandatory</strong>: Every AI-generated voucher, tax calculation, or notice reply draft must be validated by a qualified Chartered Accountant before filing.</li>
<li><strong>DPDP Act Compliance</strong>: Client financial data must be encrypted, hosted locally in Indian servers, and excluded from global AI model retraining.</li>
<li><strong>Audit Trail Maintenance</strong>: Systems maintain immutable log records showing which voucher was parsed by AI and approved by the reviewer for ICAI peer-review readiness.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Common Implementation Pitfalls</div>
<h2>What to Avoid When Adopting AI in Tax Work</h2>
<ul class="wi-detail-list">
<li><strong>Relying on Generic Foreign AI</strong>: Global AI models often fail on Indian TDS slabs, Section 194J vs 194C distinctions, or GST RCM rules. Always use India-tax native solutions.</li>
<li><strong>Skipping Bank Reconciliation Verification</strong>: Bank statement OCR can misinterpret blurred figures; multi-pass validation rules must be enforced.</li>
<li><strong>Ignoring UDIN Requirements</strong>: Certificates and audit reports created with AI assistance still require mandatory UDIN generation on the official ICAI portal.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Questions People Ask</div>
<h2>Frequently Asked Questions</h2>
<div class="lp-faq-item">
<h3>How does {esc(title.lower())} improve efficiency in CA firms?</h3>
<p>AI automation reduces manual data entry, parses scanned statements into Tally/Zoho vouchers via OCR, and auto-matches GSTR-2B ledgers, saving up to 70% of routine processing time.</p>
</div>
<div class="lp-faq-item">
<h3>Is data processed through {esc(title.lower())} compliant with India DPDP Act?</h3>
<p>Yes. Indian tax-native AI tools comply with the Digital Personal Data Protection (DPDP) Act 2023, ensuring zero client data leakage and local cloud data residency.</p>
</div>
<div class="lp-faq-item">
<h3>Can AI replace professional Chartered Accountants?</h3>
<p>No. AI operates under a human-in-the-loop framework, handling mechanical compilation while the CA provides strategic judgment, audit signing, and legal representation.</p>
</div>
</section>
</div>

<section class="lp-cta-section">
<h2>Hire Top AI-Enabled CA Firms on WorkIndex</h2>
<p>Post your compliance requirement for free and get competitive quotes from verified Chartered Accountants on the WorkIndex work index platform.</p>
<a href="{cta_url}" class="lp-hero-cta">Post Requirement Free</a>
</section>
<footer class="lp-footer">
<a href="/privacy-policy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Service</a> | <a href="/contact.html">Contact Us</a>
</footer>
</body>
</html>"""
    return content

def generate_standard_ca_page(slug, category_name, eyebrow_text):
    title = title_from_slug(slug)
    meta_desc = f"{title} guide for taxpayers & companies. Verify rules, deadlines, documents, and expert brief before hiring on the WorkIndex work index."
    
    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": f"{site}/#organization",
                "name": "WorkIndex",
                "alternateName": "Work Index",
                "url": site
            },
            {
                "@type": "Article",
                "@id": f"{site}/seo-pages/{slug}.html/#article",
                "headline": title,
                "description": meta_desc,
                "author": {"@id": f"{site}/#organization"},
                "publisher": {"@id": f"{site}/#organization"},
                "datePublished": "2026-07-01",
                "dateModified": "2026-07-01"
            },
            {
                "@type": "FAQPage",
                "@id": f"{site}/seo-pages/{slug}.html/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f"What are the compliance requirements for {title.lower()}?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": f"Proper documentation, portal filing before statutory deadlines, and fact-checking against current Indian acts and rules are mandatory for {title.lower()}."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": f"How can a Chartered Accountant help with {title.lower()}?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "A CA ensures accurate tax calculation, reconciles portal data (AIS/TIS/GSTR-2B), files valid returns, and handles official notices or appeals."
                        }
                    }
                ]
            }
        ]
    }

    content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{esc(title)} | WorkIndex Work Index</title>
<meta name="description" content="{esc(meta_desc)}"/>
<meta name="keywords" content="{esc(title)}, CA services India, tax filing, compliance, WorkIndex work index"/>
<link rel="canonical" href="{site}/seo-pages/{slug}.html"/>
<meta property="og:title" content="{esc(title)} | WorkIndex"/>
<meta property="og:description" content="{esc(meta_desc)}"/>
<meta property="og:url" content="{site}/seo-pages/{slug}.html"/>
<meta property="og:type" content="article"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="stylesheet" href="/lp-styles.css"/>
<script type="application/ld+json">{json.dumps(schema, indent=2)}</script>
</head>
<body>
<nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="{cta_url}" class="lp-nav-cta">Post Requirement</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><a href="/seo-pages/accounting-services-india.html">{esc(category_name)}</a><span>/</span><span>{esc(title)}</span></div>
<section class="lp-hero">
<div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>{esc(eyebrow_text)}</div>
<h1>{esc(title)}<br><span>Fact-Checked Expert Brief & Guide</span></h1>
<p>Check facts, documents, official portal procedures, deadlines, risks, and expert briefs for {esc(title.lower())} in India before hiring on the WorkIndex work index.</p>
<a href="{cta_url}" class="lp-hero-cta">Find Verified CA Experts</a>
</section>

<div class="lp-content-wrapper" style="max-width:1100px;margin:40px auto;padding:0 20px;">
<section class="wi-panel">
<div class="lp-section-eyebrow">Decision Matrix</div>
<h2>What This Guide Helps You Decide</h2>
<ul class="wi-detail-list">
<li><strong>Applicability & Scope</strong>: Determine if {esc(title.lower())} applies to your business entity or individual tax profile under current regulations.</li>
<li><strong>Filing Deadlines</strong>: Understand statutory due dates and late fee penalties to ensure timely portal submission.</li>
<li><strong>Documentation Requirements</strong>: Keep PAN, Aadhaar, bank statements, ledger data, and prior portal filings ready.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Accuracy Notes</div>
<h2>Fact-Checks Before You Act</h2>
<p>Always verify tax slabs, exemption thresholds, and portal rules against official government portals (Income Tax, GST, MCA):</p>
<ul class="wi-detail-list">
<li><strong>Income Tax Compliance</strong>: Reconcile Form 26AS, AIS, and TIS before submitting returns to avoid automatic Section 143(1) mismatch intimations.</li>
<li><strong>GST Reconciliation</strong>: Verify GSTR-2B ITC against purchase registers and manage IMS pending actions.</li>
<li><strong>Corporate & Legal Filings</strong>: Ensure valid UDIN generation for all CA certificates and statutory audit reports.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Common Pitfalls</div>
<h2>Mistakes to Avoid</h2>
<ul class="wi-detail-list">
<li><strong>Filing Without Reconciliation</strong>: Never file returns based solely on draft figures without matching official portal data.</li>
<li><strong>Missing Notice Deadlines</strong>: Respond to Section 148, DRC-01, or ROC notices within the specified time to avoid ex-parte orders.</li>
<li><strong>Unverified Consultants</strong>: Always work with verified Chartered Accountants and subject matter experts.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Questions People Ask</div>
<h2>Frequently Asked Questions</h2>
<div class="lp-faq-item">
<h3>What are the compliance requirements for {esc(title.lower())}?</h3>
<p>Proper documentation, portal filing before statutory deadlines, and fact-checking against current Indian acts and rules are mandatory for {esc(title.lower())}.</p>
</div>
<div class="lp-faq-item">
<h3>How can a Chartered Accountant help with {esc(title.lower())}?</h3>
<p>A CA ensures accurate tax calculation, reconciles portal data (AIS/TIS/GSTR-2B), files valid returns, and handles official notices or appeals.</p>
</div>
</section>
</div>

<section class="lp-cta-section">
<h2>Compare Quotes from Top CAs on WorkIndex</h2>
<p>Post your compliance requirement for free and receive quotes from experienced professionals on the WorkIndex work index.</p>
<a href="{cta_url}" class="lp-hero-cta">Post Requirement Free</a>
</section>
<footer class="lp-footer">
<a href="/privacy-policy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Service</a> | <a href="/contact.html">Contact Us</a>
</footer>
</body>
</html>"""
    return content

print("Generating 5,000 national CA & tax compliance pages...")

pillars = [
    ("AI in CA Practice", "ai_ca_automation", [
        "ai-automation-for-ca-firms", "ai-tools-for-tally-reconciliation", "ai-driven-bank-statement-parser",
        "ai-ocr-invoice-processing-tally", "ai-gstr2b-matching-software", "ai-prompt-engineering-tax-lawyers",
        "ai-automated-notice-reply-drafting", "ai-working-paper-generator-statutory-audit", "ai-udin-tracking-dashboard",
        "ai-form-15ca-15cb-certification", "ai-transfer-pricing-study-automation", "ai-client-compliance-calendar-ca",
        "ai-dpdp-act-data-privacy-ca-firms", "ai-cma-report-generator-bank-loans", "ai-forensic-audit-ledger-scrutiny"
    ]),
    ("Income-tax Act 2025", "tax_reassessment_notices", [
        "income-tax-act-2025-section-mapping-guide", "tax-year-vs-assessment-year-2026", "section-87a-rebate-new-tax-regime-2026",
        "section-148-reassessment-notice-defense-guide", "20-percent-stay-of-demand-delhi-hc-ruling", "vivad-se-vishwas-2026-dispute-resolution",
        "section-43b-msme-15-45-day-payment-rule", "section-115bac-new-vs-old-regime-salaried", "ais-tis-mismatch-notice-response-guide",
        "belated-itr-filing-penalty-ay-2026-27", "section-139-8a-updated-return-rules", "section-194j-vs-194c-technical-services-tax",
        "section-195-nri-tds-rate-without-pan", "section-206ab-higher-tds-non-filers", "section-50c-stamp-duty-value-property-tax"
    ]),
    ("GST & Indirect Tax", "gst_appeals_notices", [
        "gstr-2b-vs-ims-invoice-management-system", "gstat-appellate-tribunal-filing-rules", "drc-01-show-cause-notice-reply-drafting",
        "section-17-5-blocked-credit-construction-vehicles", "input-service-distributor-isd-mandatory-registration", "e-invoicing-30-day-irp-reporting-limit",
        "28-percent-online-gaming-gst-compliance", "e-commerce-seller-tcs-section-194o-gstr8", "gstr-9-9c-annual-return-reconciliation",
        "lut-export-of-services-without-gst-payment", "reverse-charge-mechanism-rcm-director-remuneration", "gst-registration-cancellation-revocation-procedure",
        "demo-vehicles-itc-eligibility-gst", "safari-retreats-sc-ruling-real-estate-itc", "aberdare-technologies-sc-ruling-gstr3b-error"
    ]),
    ("MCA & Corporate Law", "legal_nclt_insolvency", [
        "section-204-secretarial-audit-peer-reviewed-cs", "roc-adjudication-order-mr3-penalty-defense", "aoc-4-mgt-7-annual-filing-director-disqualification",
        "startup-dpiit-80-iac-tax-exemption-guide", "isafe-convertible-notes-startup-fundraising", "caro-2020-auditor-reporting-checklist",
        "icai-60-tax-audit-limit-per-partner-rule", "private-limited-incorporation-spice-plus-2026", "llp-form-11-form-8-annual-compliance",
        "dir-3-kyc-director-din-deactivation-fix", "small-company-threshold-paid-up-capital-turnover", "section-185-186-intercorporate-loans-guarantees"
    ]),
    ("NRI Taxation & DTAA", "dtaa_nri_compliance", [
        "black-money-act-section-42-43-foreign-asset-notice", "form-10f-electronic-filing-non-resident", "dtaa-trc-tax-residency-certificate-usa-uk",
        "401k-rrsp-superannuation-section-89a-tax-deferral", "nro-to-nre-1-million-dollar-remittance-15ca-15cb", "rnor-residential-status-tax-optimization",
        "significant-economic-presence-sep-digital-pe", "schedule-fa-foreign-shares-rsu-esop-disclosure", "form-67-foreign-tax-credit-ftc-claim-rules"
    ]),
    ("Capital Gains & Buyback", "capital_gains_exemptions", [
        "section-50ca-rule-11ua-unlisted-share-fmv-valuation", "section-115qa-buyback-taxation-shareholder-dividend", "1-percent-194s-tds-30-percent-vda-crypto-tax",
        "fno-loss-tax-audit-turnover-computation-sec-44ab", "sovereign-gold-bonds-sgb-maturity-exemption-rules", "section-54f-residential-house-reinvestment-ltcg",
        "section-54ec-capital-gains-bonds-rec-nhai", "unlisted-shares-24-month-ltcg-holding-period-trap"
    ]),
    ("Virtual CFO & Advisory", "audit_udin_compliance", [
        "virtual-cfo-services-saas-d2c-manufacturing", "cma-data-financial-projections-bank-loan-sanction", "forensic-audit-corporate-fraud-investigation",
        "internal-financial-controls-ifc-framework-audit", "net-worth-certificate-udin-generation-guidelines", "turnover-certificate-for-tenders-ca-attestation"
    ])
]

modifiers = [
    "guide-2026", "complete-handbook", "step-by-step-process", "best-practices",
    "avoiding-penalties", "expert-checklist", "documentation-requirements",
    "case-laws-rulings", "recent-amendments", "portal-filing-procedure",
    "faqs-explained", "practical-examples", "worked-math-illustrations",
    "ca-audit-working-paper", "compliance-calendar-deadlines"
]

sub_topics_extended = [
    "salaried-professionals", "it-software-engineers", "doctors-and-clinics", "real-estate-developers",
    "e-commerce-sellers-amazon-flipkart", "influencers-and-content-creators", "freelancers-and-consultants",
    "manufacturing-smes", "exporters-and-importers", "nris-in-usa-uk-canada", "huf-and-family-offices",
    "charitable-trusts-12a-80g", "cooperative-societies", "startups-and-vcs", "stock-market-traders",
    "crypto-investors", "retired-senior-citizens", "partnership-firms", "llp-partners", "sole-proprietors"
]

generated_count = 0
target_count = 5000

for pillar_name, sub_template, base_slugs in pillars:
    for base in base_slugs:
        for mod in modifiers:
            for sub in sub_topics_extended:
                slug = f"{base}-{sub}-{mod}"
                filename = f"{slug}.html"
                
                if filename in existing_files:
                    continue
                
                if sub_template == "ai_ca_automation" or "ai-" in slug:
                    content = generate_ai_ca_page(slug)
                else:
                    content = generate_standard_ca_page(slug, pillar_name, pillar_name)
                
                filepath = seo_dir / filename
                filepath.write_text(content, encoding="utf-8")
                existing_files.add(filename)
                generated_count += 1
                
                if generated_count >= target_count:
                    break
            if generated_count >= target_count:
                break
        if generated_count >= target_count:
            break
    if generated_count >= target_count:
        break

print(f"Successfully generated {generated_count} new national CA & tax compliance SEO pages.")
