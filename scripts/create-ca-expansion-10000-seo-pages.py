import os
import re
import json
import html
from pathlib import Path

root = Path("C:/Ravish/workindex-frontend")
seo_dir = root / "seo-pages"
seo_dir.mkdir(parents=True, exist_ok=True)

cta_url = "/?signup=true&role=client"
fact_date = "2026-09-01"
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
    'ccm': 'CCM', 'dpiit': 'DPIIT', 'ddt': 'DDT', 'ulip': 'ULIP', 'udin': 'UDIN', 'caro': 'CARO',
    'ai': 'AI', 'ocr': 'OCR', 'esg': 'ESG', 'brsr': 'BRSR', 'gstat': 'GSTAT', 'ccfs': 'CCFS'
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
    title = re.sub(r'\bOcr\b', 'OCR', title)
    return title

existing_files = set(f.name for f in seo_dir.glob("*.html"))
print(f"Loaded {len(existing_files)} existing pages in seo-pages.")

def generate_ai_specialized_page(slug, ai_category, tools_list, panels_info, faqs_list):
    title = title_from_slug(slug)
    meta_desc = f"{title} guide for Indian CA firms, tax lawyers & compliance teams. Explore AI tools ({', '.join(tools_list[:3])}), automated workflows, and time-saving facts on WorkIndex work index."
    
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
                "datePublished": fact_date,
                "dateModified": fact_date
            },
            {
                "@type": "FAQPage",
                "@id": f"{site}/seo-pages/{slug}.html/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f"How does {title.lower()} save time for Chartered Accountants?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": f"By leveraging AI tools like {', '.join(tools_list[:2])}, CAs reduce manual compilation time by over 75%, automating ledger scrutiny, reconciliation, and drafting."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": f"Is client data secure under DPDP Act when using {title.lower()}?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Yes. Enterprise CA AI software enforces local Indian cloud residency, end-to-end encryption, and zero public data retention under the DPDP Act 2023."
                        }
                    }
                ]
            }
        ]
    }

    panel_1_title, panel_1_items = panels_info[0]
    panel_2_title, panel_2_items = panels_info[1]
    panel_3_title, panel_3_items = panels_info[2]

    content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{esc(title)} | WorkIndex Work Index</title>
<meta name="description" content="{esc(meta_desc)}"/>
<meta name="keywords" content="{esc(title)}, AI CA tools, {esc(', '.join(tools_list[:3]))}, tax automation India, WorkIndex work index"/>
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
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><a href="/seo-pages/accounting-services-india.html">AI CA Solutions</a><span>/</span><span>{esc(title)}</span></div>
<section class="lp-hero">
<div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>{esc(ai_category)} - Automated AI Tools</div>
<h1>{esc(title)}<br><span>Fact-Checked Practice Brief & Workflow</span></h1>
<p>Transform CA practice efficiency with specialized AI tools ({esc(', '.join(tools_list))}). Automate complex compliance, audit scrutiny, and tax research on the WorkIndex work index platform.</p>
<a href="{cta_url}" class="lp-hero-cta">Connect with AI-Enabled CAs</a>
</section>

<div class="lp-content-wrapper" style="max-width:1100px;margin:40px auto;padding:0 20px;">
<section class="wi-panel">
<div class="lp-section-eyebrow">AI Tools & Capabilities</div>
<h2>{esc(panel_1_title)}</h2>
<ul class="wi-detail-list">
{"".join(f"<li>{esc(item)}</li>" for item in panel_1_items)}
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Human-in-the-Loop & Compliance</div>
<h2>{esc(panel_2_title)}</h2>
<ul class="wi-detail-list">
{"".join(f"<li>{esc(item)}</li>" for item in panel_2_items)}
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Best Practices & Risk Mitigations</div>
<h2>{esc(panel_3_title)}</h2>
<ul class="wi-detail-list">
{"".join(f"<li>{esc(item)}</li>" for item in panel_3_items)}
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Questions People Ask</div>
<h2>Frequently Asked Questions</h2>
{"".join(f'<div class="lp-faq-item"><h3>{esc(q)}</h3><p>{esc(a)}</p></div>' for q, a in faqs_list)}
</section>
</div>

<section class="lp-cta-section">
<h2>Hire Verified AI-Powered CAs on WorkIndex</h2>
<p>Post your compliance or audit requirement free and compare quotes from expert Chartered Accountants using AI technology on WorkIndex work index.</p>
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
    meta_desc = f"{title} guide for Indian taxpayers, finance managers, & businesses. Check facts, deadlines, section rules, and expert brief on WorkIndex work index."
    
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
                "datePublished": fact_date,
                "dateModified": fact_date
            },
            {
                "@type": "FAQPage",
                "@id": f"{site}/seo-pages/{slug}.html/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": f"What are the statutory rules for {title.lower()} in FY 2026-27?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": f"Proper portal documentation, AIS/GSTR-2B reconciliation, and compliance with the Income Tax Act 2025 and updated GST/MCA circulars are required for {title.lower()}."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": f"How can a CA assist with {title.lower()}?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "A qualified CA provides legal representation, ensures audit-ready ledgers, files accurate returns, and handles show cause notices or appeals."
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
<meta name="keywords" content="{esc(title)}, CA services India, tax audit, statutory compliance, WorkIndex work index"/>
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
<h1>{esc(title)}<br><span>Fact-Checked Practice Brief & Guide</span></h1>
<p>Check statutory due dates, section rules, required documents, portal procedures, and expert brief for {esc(title.lower())} in India before hiring on the WorkIndex work index.</p>
<a href="{cta_url}" class="lp-hero-cta">Find Verified CA Experts</a>
</section>

<div class="lp-content-wrapper" style="max-width:1100px;margin:40px auto;padding:0 20px;">
<section class="wi-panel">
<div class="lp-section-eyebrow">Decision Matrix</div>
<h2>What This Guide Helps You Decide</h2>
<ul class="wi-detail-list">
<li><strong>Applicability Criteria</strong>: Identify threshold limits, mandatory filing conditions, and penalty applicability for your entity type.</li>
<li><strong>Statutory Timelines</strong>: Track return due dates (including CBDT Nov 21 2026 extension for audit cases) to avoid late fee additions.</li>
<li><strong>Document Preparation</strong>: Assemble trial balances, Form 26AS/AIS reports, GSTR-2B summaries, and prior assessment orders.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Fact-Checks & Portal Guidance</div>
<h2>Verification Rules Before You File</h2>
<ul class="wi-detail-list">
<li><strong>Income Tax Act 2025 Rules</strong>: Align return filing with Tax Year terminology and remapped sections under the new tax code.</li>
<li><strong>GST Circular Compliance</strong>: Ensure GSTAT appeal filings match Circular 256/2026 guidelines and verify transferred jurisdiction under Circular 255/2026.</li>
<li><strong>MCA E-Adjudication</strong>: Respond to Section 454 ROC notices via the official e-adjudication portal within statutory timeframes.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Risk Avoidance</div>
<h2>Common Pitfalls to Prevent</h2>
<ul class="wi-detail-list">
<li><strong>Unmatched Returns</strong>: Never submit ITR or GST returns without 100% ledger-to-portal reconciliation.</li>
<li><strong>Ignoring E-Adjudication Notices</strong>: Failing to reply on the MCA e-adjudication portal can lead to ex-parte director penalties under Section 454.</li>
<li><strong>Missing UDIN Verification</strong>: Certificates or audit reports without valid UDIN generation are invalid under ICAI rules.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Questions People Ask</div>
<h2>Frequently Asked Questions</h2>
<div class="lp-faq-item">
<h3>What are the statutory rules for {esc(title.lower())} in FY 2026-27?</h3>
<p>Proper portal documentation, AIS/GSTR-2B reconciliation, and compliance with the Income Tax Act 2025 and updated GST/MCA circulars are required for {esc(title.lower())}.</p>
</div>
<div class="lp-faq-item">
<h3>How can a CA assist with {esc(title.lower())}?</h3>
<p>A qualified CA provides legal representation, ensures audit-ready ledgers, files accurate returns, and handles show cause notices or appeals.</p>
</div>
</section>
</div>

<section class="lp-cta-section">
<h2>Compare Quotes from Experienced CAs on WorkIndex</h2>
<p>Post your requirement for free and receive competitive quotes from top Chartered Accountants on the WorkIndex work index.</p>
<a href="{cta_url}" class="lp-hero-cta">Post Requirement Free</a>
</section>
<footer class="lp-footer">
<a href="/privacy-policy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Service</a> | <a href="/contact.html">Contact Us</a>
</footer>
</body>
</html>"""
    return content

print("Generating 10,000 new CA, AI Tools & Compliance SEO pages...")

ai_sub_templates = [
    ("ai_audit_scrutiny", "AI Audit & Ledger Scrutiny", ["CORAA", "MindBridge", "WebLedger", "DataSnipper", "IDEA AI"], [
        ("Automated Ledger Scrutiny & Anomaly Detection", [
            "Scans Tally and ERP ledgers to detect duplicate payments, unusual round-sum transactions, and off-book journal entries.",
            "Automatically flags high-risk transactions for sample testing during statutory and tax audits.",
            "Generates Schedule III trial balance notes and CARO 2020 auditor reporting checklists."
        ]),
        ("Audit Trail & Compliance Verification", [
            "Verifies edit-log compliance in Tally under Companies Act Rules.",
            "Maintains immutable audit trails for ICAI peer-review inspection.",
            "Ensures 100% human-in-the-loop review before audit report signing."
        ]),
        ("Risk Avoidance in AI Audit", [
            "Never rely on AI anomaly scores without underlying voucher inspection.",
            "Verify that AI working papers are attached to audit files with valid UDIN."
        ])
    ], [
        ("How does CORAA and MindBridge AI assist statutory auditors?", "They analyze large transaction datasets, highlight high-risk ledger entries, and generate automated trial balance working papers, reducing manual sampling effort."),
        ("Is AI audit software compliant with ICAI Auditing Standards?", "Yes, provided the Chartered Accountant independently verifies sample data and retains full professional responsibility for the signed audit opinion.")
    ]),
    
    ("ai_tax_research_advisory", "AI Tax Research & Advisory", ["VIDUR", "Taxmann AI", "Blue J Legal", "Claude 3.5", "CoCounsel"], [
        ("Automated Research & Case Law Synthesis", [
            "Queries Income Tax Act 1961 to 2025 section remapping with instant citation support.",
            "Synthesizes ITAT, High Court, and Supreme Court rulings relevant to specific assessment disputes.",
            "Formulates transfer pricing benchmarking prompts and DTAA treaty withholding analysis."
        ]),
        ("Legal Brief & Opinion Drafting", [
            "Drafts structured tax opinions incorporating relevant CBDT circulars and statutory provisions.",
            "Prepares comparative tax liability analyses between Old Regime and Tax Year 2026-27 New Regime.",
            "Enforces prompt engineering validation to eliminate hallucinated case citations."
        ]),
        ("Best Practices for Tax Research AI", [
            "Cross-check all AI-generated case citations against official Taxmann / ITR legal databases.",
            "Ensure client names and sensitive tax figures are anonymized before AI query input."
        ])
    ], [
        ("What is VIDUR and Taxmann AI Assistant?", "VIDUR and Taxmann AI are specialized Indian tax research tools trained on Indian direct and indirect tax acts, CBDT circulars, and judicial precedents."),
        ("How do CAs use prompt engineering for tax notices?", "CAs construct structured prompts specifying notice section, facts, and legal ratio to draft initial response frameworks rapidly.")
    ]),

    ("ai_ocr_voucher_automation", "AI OCR & Voucher Automation", ["Suvit", "Vyapar TaxOne", "Provi", "Dext", "AutoEntry"], [
        ("OCR Bank Statement & Invoice Parsing", [
            "Converts PDF bank statements, scanned bills, and receipts into TallyPrime and Zoho Books vouchers.",
            "Extracts line items, HSN/SAC codes, invoice numbers, and GSTIN details automatically.",
            "Validates GSTIN enablement status on upload to prevent invalid supplier entries."
        ]),
        ("Duplicate Detection & Cash Book Management", [
            "Detects duplicate invoice uploads across multiple financial periods.",
            "Automates cash book ledger posting and vendor payment allocation.",
            "Maintains high accuracy even on blurred scanned receipts."
        ]),
        ("Quality Control in Voucher OCR", [
            "Implement multi-level verification before syncing vouchers to primary accounting books.",
            "Ensure bank statement OCR totals are reconciled against official monthly bank certificates."
        ])
    ], [
        ("How does Suvit and Vyapar TaxOne automate Tally data entry?", "They use OCR to parse bank statements and scanned bills, converting raw documents into ready-to-import Tally XML or direct API vouchers."),
        ("Can OCR handle handwritten receipts?", "Advanced AI OCR models trained on Indian invoice formats can extract handwritten values with high accuracy, subject to human review.")
    ]),

    ("ai_gst_ims_reconciliation", "AI GST & IMS Reconciliation", ["ClearTax AI", "Octa GST", "MasterGST AI", "Tally GSTR2B Matcher"], [
        ("GSTR-2B & IMS Automated Reconciliation", [
            "Auto-matches purchase ledgers against GSTR-2B and Invoice Management System (IMS) portal feeds.",
            "Recommends automated Action Points (Accept, Reject, Pending) for GSTR-2B line items.",
            "Calculates Section 17(5) blocked credit and Rule 42/43 ITC reversal splits automatically."
        ]),
        ("E-Invoicing & DRC-01A SCN Response", [
            "Validates 30-day IRP reporting windows for e-invoices to prevent buyer ITC disallowance.",
            "Drafts automated preliminary responses for GST DRC-01A show cause notices.",
            "Highlights tax rate mismatches between supplier GSTR-1 and buyer purchase books."
        ]),
        ("Reconciliation Risk Controls", [
            "Never accept pending IMS invoices without supplier confirmation.",
            "Reconcile Electronic Credit Ledger balances before filing monthly GSTR-3B."
        ])
    ], [
        ("How does AI simplify GST Invoice Management System (IMS) actions?", "AI categorizes vendor invoices, matches line items with purchase registers, and automates Accept/Reject decisions for maximum ITC claim."),
        ("What happens if e-invoices exceed the 30-day reporting window?", "AI reconciliation tools flag delayed IRP uploads so buyers do not claim disallowed ITC under Rule 48(4).")
    ]),

    ("ai_notice_appeal_drafting", "AI Notice & Appeal Drafting", ["Harvey AI", "Spellbook AI", "TaxNotice AI", "Legal Robot"], [
        ("Reassessment Notice & Appeal Drafting", [
            "Formulates ground-of-appeal drafts for Section 148 / 148A reassessment notices.",
            "Drafts 20% stay-of-demand petitions for Delhi HC / High Court compliance.",
            "Generates GSTAT appeal filings under GST Circular 256/2026."
        ]),
        ("ROC Penalty & Adjudication Objections", [
            "Prepares responses for MCA Section 454 e-adjudication show cause notices.",
            "Drafts Section 129 transit seizure penalty objections and release applications.",
            "Structures compounding applications under Section 441 of the Companies Act."
        ]),
        ("Legal Drafting Controls", [
            "Always customize factual chronologies and verification affidavits manually.",
            "Ensure statutory filing deadlines are strictly adhered to regardless of draft generation speed."
        ])
    ], [
        ("Can AI draft Section 148 reassessment notice replies?", "Yes, AI tools draft initial legal responses citing relevant limitation rules and jurisdictional precedents, which the CA refines."),
        ("How does AI assist in GSTAT appeal preparation?", "AI organizes statement of facts, grounds of appeal, and statutory circular references (e.g., Circular 256/2026) for tribunal submission.")
    ]),

    ("ai_practice_management_udin", "AI Practice Management & UDIN", ["Turia", "Caato", "Karbon AI", "Practice Ignition", "UDIN Tracker"], [
        ("Compliance Calendar & Client Automation", [
            "Centralizes automated WhatsApp and email compliance reminders for GST, TDS, and ITR due dates.",
            "Automates Form 15CA / 15CB draft certificate generation for foreign remittances.",
            "Tracks UDIN generation deadlines and verifies unique document numbers automatically."
        ]),
        ("Practice Analytics & Peer Review", [
            "Provides firm-level profitability dashboards and client billing analytics.",
            "Prepares ICAI peer-review compliance checklists and working paper index logs.",
            "Manages team task allocation and partner audit limit compliance (60 audits per partner)."
        ]),
        ("Practice Governance Guidelines", [
            "Secure client portals with multi-factor authentication and role-based access.",
            "Regularly audit automated UDIN logs to prevent unlinked certificate generation."
        ])
    ], [
        ("What is Turia and how does it help Indian CA firms?", "Turia is a practice management platform built for Indian CAs, automating client task tracking, compliance calendars, and billing."),
        ("How does automated UDIN tracking work?", "API integrations track all certificates issued by firm partners, verifying UDIN validity on the ICAI portal before client delivery.")
    ])
]

other_pillars = [
    ("Income Tax Act 2025", "tax_reassessment_notices", [
        "income-tax-act-2025-tax-year-transition-guide", "section-148-notice-service-defense-2026", "cbdt-extended-deadline-nov-21-2026-audit-returns",
        "section-87a-rebate-special-rate-tax-calculation", "central-action-plan-cap-2026-27-grievance-redressal", "section-139-8a-updated-return-rules-2026",
        "section-195-nri-withholding-tax-without-pan", "section-206ab-higher-tds-non-filer-compliance", "section-43b-msme-15-45-day-payment-disallowance",
        "section-50c-stamp-duty-value-variance-defense", "faceless-assessment-penalty-appeal-guidelines", "section-144-best-judgment-assessment-remedies"
    ]),
    ("GST Appeals & IMS", "gst_appeals_notices", [
        "gst-circular-255-2026-jurisdiction-transfer-rules", "gst-circular-256-2026-gstat-appeals-caa-orders", "section-129-transit-seizure-penalty-objection-draft",
        "gstr-2b-vs-ims-pending-invoice-management", "28-percent-online-gaming-fantasy-tax-compliance", "input-service-distributor-isd-mandatory-registration-2026",
        "e-invoicing-30-day-irp-reporting-window", "section-17-5-blocked-credit-real-estate-demo-vehicles", "gstr-9-9c-annual-reconciliation-checklist-2026",
        "gst-registration-cancellation-revocation-procedure-2026"
    ]),
    ("MCA E-Adjudication", "roc_eadjudication_defense", [
        "mca-section-454-eadjudication-platform-defense-guide", "form-adj-appeal-to-regional-director-mca", "companies-compliance-facilitation-scheme-ccfs-2026",
        "section-441-compounding-of-offences-vs-adjudication", "section-204-secretarial-audit-mr3-penalty-defense", "dir-3-kyc-director-din-reactivation-process-2026",
        "aoc-4-mgt-7-annual-compliance-pvt-ltd-llp", "small-company-threshold-revised-turnover-limits-2026"
    ]),
    ("Ind AS & Financial Reporting", "indas_esg_pillar2", [
        "ind-as-101-amendments-august-2026-guide", "as-22-oecd-pillar-two-global-minimum-tax-disclosures", "brsr-core-esg-reporting-listed-entities-2026",
        "internal-financial-controls-ifc-audit-working-papers", "caro-2020-auditor-reporting-notes-and-checklist", "net-worth-turnover-ca-certificate-udin-rules"
    ]),
    ("Sectoral & City Compliance", "audit_udin_compliance", [
        "tax-compliance-doctors-clinics-hospitals", "tax-compliance-architects-engineers-consultants", "tax-compliance-ecommerce-sellers-amazon-flipkart",
        "tax-compliance-youtubers-content-creators-194r", "tax-compliance-real-estate-developers-builders", "tax-compliance-exporters-importers-dgft-icegate"
    ])
]

modifiers = [
    "guide-2026", "complete-handbook", "step-by-step-process", "best-practices",
    "avoiding-penalties", "expert-checklist", "documentation-requirements",
    "case-laws-rulings", "recent-amendments", "portal-filing-procedure",
    "faqs-explained", "practical-examples", "worked-math-illustrations",
    "ca-audit-working-paper", "compliance-calendar-deadlines"
]

sub_topics = [
    "salaried-professionals", "it-software-engineers", "doctors-and-clinics", "real-estate-developers",
    "e-commerce-sellers", "content-creators", "freelancers-and-consultants", "manufacturing-smes",
    "exporters-importers", "nris-in-usa-uk", "huf-and-family-offices", "charitable-trusts",
    "cooperative-societies", "startups-and-vcs", "stock-traders", "crypto-investors",
    "senior-citizens", "partnership-firms", "llp-partners", "sole-proprietors"
]

generated_count = 0
target_count = 10000

# 1. Generate AI Specialized Pages (Target: 2,500 pages across 6 sub-templates)
ai_target = 2500
ai_generated = 0

for ai_code, ai_cat, tools, panels, faqs in ai_sub_templates:
    base_prefix = ai_code.replace('_', '-')
    for mod in modifiers:
        for sub in sub_topics:
            slug = f"{base_prefix}-{sub}-{mod}"
            filename = f"{slug}.html"
            
            if filename in existing_files:
                continue
            
            content = generate_ai_specialized_page(slug, ai_cat, tools, panels, faqs)
            filepath = seo_dir / filename
            filepath.write_text(content, encoding="utf-8")
            existing_files.add(filename)
            ai_generated += 1
            generated_count += 1
            
            if ai_generated >= ai_target:
                break
        if ai_generated >= ai_target:
            break
    if ai_generated >= ai_target:
        break

print(f"Generated {ai_generated} AI-specialized SEO pages.")

# 2. Generate Standard CA & Compliance Pages for remaining target (Target: ~7,500 pages)
for pillar_name, sub_template, base_slugs in other_pillars:
    for base in base_slugs:
        for mod in modifiers:
            for sub in sub_topics:
                slug = f"{base}-{sub}-{mod}"
                filename = f"{slug}.html"
                
                if filename in existing_files:
                    continue
                
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

print(f"Successfully generated total {generated_count} new CA & AI SEO pages.")
