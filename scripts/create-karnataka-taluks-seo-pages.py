import os
import re
import json
import html
from pathlib import Path

root = Path("C:/Ravish/workindex-frontend")
seo_dir = root / "seo-pages"
seo_dir.mkdir(parents=True, exist_ok=True)

cta_url = "/?signup=true&role=client"
site = "https://workindex.co.in"

karnataka_towns = [
    "sirsi", "siddapur", "sagara", "yellapur", "mundgod", "haliyal", "bhatkal", "honnavar",
    "ankola", "karwar", "kumta", "joida", "soraba", "shikaripura", "hosanagara", "thirthahalli",
    "bhadravathi", "koppa", "sringeri", "mudigere", "tarikere", "kadur", "ajjampura",
    "channagiri", "honnali", "nyamathi", "jagalur", "ranebennur", "haveri", "savanur",
    "shiggaon", "byadgi", "hirekerur", "hangal", "rattihalli", "lakshmeshwar", "shirahatti",
    "ron", "nargund", "gajendragad", "mundargi", "badami", "guledgudda", "ilkal", "bilgi",
    "jamkhandi", "mudhol", "rabkavi-banhatti", "terdal", "gokak", "nipani", "chikodi",
    "raybag", "hukkeri", "khanapur", "bailhongal", "saundatti", "ramdurg", "mudalgi",
    "kagwad", "chincholi", "sedam", "chittapur", "afzalpur", "aland", "jevargi",
    "shorapur", "shahpur", "yadgir", "gurmatkal", "devadurga", "lingsugur", "manvi",
    "sindhanur", "maski", "siruguppa", "kampli", "sandur", "kudligi", "hagaribommanahalli",
    "harapanahalli", "hadagali", "hosapete", "molakalmuru", "challakere", "hiriyur",
    "hosadurga", "holalkere", "pavagada", "sira", "madhugiri", "koratagere", "gubbi",
    "chiknayakanhalli", "turuvekere", "kunigal", "tiptur", "channapatna", "ramanagara",
    "kanakapura", "magadi", "nelamangala", "doddaballapura", "devanahalli", "hoskote",
    "malur", "bangarapet", "mulbagal", "srinivaspur", "kgf", "bagepalli", "gudibanda",
    "gauribidanur", "sidlaghatta", "chintamani", "chikkaballapura", "hunsur", "periyapatna",
    "kr-nagar", "nanjangud", "t-narasipura", "hd-kote", "sargur", "gundlupet",
    "chamarajanagar", "yelandur", "kollegal", "hanur", "somwarpet", "virajpet",
    "kushalnagar", "madikeri", "sullia", "puttur", "belthangady", "bantwal",
    "moodabidri", "karkala", "kundapura", "byndoor", "kapu", "brahmavar"
]

services = [
    ("itr-filing-in", "ITR Filing", "Income Tax Return Filing", "File income tax returns with AIS/Form 26AS review, agricultural/business income, salary, capital gains, and tax planning."),
    ("gst-return-filing-in", "GST Return Filing", "GST Compliance & Filing", "GSTR-1, GSTR-3B, ITC reconciliation with GSTR-2B, IMS pending invoice actions, and monthly GST return support."),
    ("gst-registration-in", "GST Registration", "GST Registration Services", "New GSTIN registration, amendment, core field updates, cancellation, and trade license compliance."),
    ("income-tax-consultant-in", "Income Tax Consultant", "Tax Advisory & Consultancy", "Expert tax consultation for Section 143(1) intimations, advance tax, Section 87A rebate, and Notice response."),
    ("chartered-accountant-in", "Chartered Accountant", "CA & Statutory Compliance", "Find verified Chartered Accountants for tax audit Section 44AB, company audit, books cleanup, and UDIN certificates."),
    ("accounting-services-in", "Accounting Services", "Bookkeeping & Accounting", "Monthly bookkeeping, Tally/Zoho ledger entry, bank statement reconciliation, and financial statement preparation."),
    ("tax-audit-services-in", "Tax Audit Services", "Section 44AB Tax Audit", "Turnover calculation, Form 3CA-3CD / 3CB-3CD filing, inventory audit, and tax audit compliance.")
]

existing_files = set(f.name for f in seo_dir.glob("*.html"))
print(f"Loaded {len(existing_files)} existing pages in seo-pages.")

def esc(v):
    return html.escape(str(v or ""), quote=True)

def title_case(town):
    return ' '.join(w.capitalize() for w in town.split('-'))

generated_count = 0

for town in karnataka_towns:
    town_display = title_case(town)
    for prefix, s_title, s_type, s_desc in services:
        slug = f"{prefix}-{town}"
        filename = f"{slug}.html"
        
        if filename in existing_files:
            continue
            
        title = f"{s_title} in {town_display}"
        meta_desc = f"{s_title} in {town_display}, Karnataka. Expert local guidance, documents needed, pricing, and compliance support on WorkIndex work index."
        
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
                    "@type": "Service",
                    "name": title,
                    "serviceType": s_type,
                    "provider": {"@id": f"{site}/#organization"},
                    "areaServed": {"@type": "Place", "name": f"{town_display}, Karnataka"},
                    "description": meta_desc
                },
                {
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": f"How do I get {s_title.lower()} in {town_display}?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": f"Post your requirements on WorkIndex to connect with verified tax consultants and CAs serving {town_display}, Karnataka."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": f"What documents are needed for {s_title.lower()} in {town_display}?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Keep your PAN, Aadhaar, bank statements, Form 16, AIS/TIS data, sales/purchase registers, and prior tax returns ready."
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
<meta name="keywords" content="{esc(title)}, CA in {esc(town_display)}, tax consultant {esc(town_display)}, GST filing Karnataka, WorkIndex"/>
<link rel="canonical" href="{site}/seo-pages/{slug}.html"/>
<meta property="og:title" content="{esc(title)} | WorkIndex"/>
<meta property="og:description" content="{esc(meta_desc)}"/>
<meta property="og:url" content="{site}/seo-pages/{slug}.html"/>
<meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/>
<link rel="stylesheet" href="/lp-styles.css"/>
<script type="application/ld+json">{json.dumps(schema, indent=2)}</script>
</head>
<body>
<nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="{cta_url}" class="lp-nav-cta">Post Requirement</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><a href="/seo-pages/accounting-services-karnataka.html">Karnataka Compliance</a><span>/</span><span>{esc(town_display)}</span></div>
<section class="lp-hero">
<div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>{esc(town_display)}, Karnataka Local Service</div>
<h1>{esc(title)}<br><span>Verified Experts for Local Business Context</span></h1>
<p>{esc(s_desc)} Serving traders, farmers, contractors, professionals, and MSMEs in {esc(town_display)} and surrounding taluk areas. Check details on WorkIndex work index.</p>
<a href="{cta_url}" class="lp-hero-cta">Get Quotes from Local Experts</a>
</section>

<div class="lp-content-wrapper" style="max-width:1100px;margin:40px auto;padding:0 20px;">
<section class="wi-panel">
<div class="lp-section-eyebrow">Local Economy & Scope</div>
<h2>Why Taxpayers in {esc(town_display)} Need Professional Support</h2>
<p>{esc(town_display)} economy consists of agriculture, trade, small manufacturing, services, and local contractors. Ensuring accurate tax filings prevents automatic portal notices and audit penalties.</p>
<ul class="wi-detail-list">
<li><strong>Salaried & Pensioners</strong>: Form 16 matching, AIS/TIS interest income verification, and Section 87A tax rebate optimization.</li>
<li><strong>Traders & Retailers</strong>: Monthly GSTR-1, GSTR-3B filings, purchase ITC reconciliation, and turnover tax limits under presumptive scheme.</li>
<li><strong>Agri & Plantation Owners</strong>: Exemption under Section 10(1), partial integration rules, and land sale capital gains advice.</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Documents to Keep Ready</div>
<h2>Checklist for {esc(s_title)} in {esc(town_display)}</h2>
<ul class="wi-detail-list">
<li>PAN Card and Aadhaar Card copy</li>
<li>Bank Account statements for the financial year</li>
<li>Sales bills, purchase vouchers, and GST portal login details (for business cases)</li>
<li>Form 16, Form 26AS, AIS, and TIS statements (for individual tax returns)</li>
</ul>
</section>

<section class="wi-panel">
<div class="lp-section-eyebrow">Questions People Ask</div>
<h2>Frequently Asked Questions</h2>
<div class="lp-faq-item">
<h3>How do I get {esc(s_title.lower())} in {esc(town_display)}?</h3>
<p>Post your requirements on WorkIndex to connect with verified tax consultants and CAs serving {esc(town_display)}, Karnataka.</p>
</div>
<div class="lp-faq-item">
<h3>What documents are needed for {esc(s_title.lower())} in {esc(town_display)}?</h3>
<p>Keep your PAN, Aadhaar, bank statements, Form 16, AIS/TIS data, sales/purchase registers, and prior tax returns ready.</p>
</div>
</section>
</div>

<section class="lp-cta-section">
<h2>Find Local Experts in {esc(town_display)}</h2>
<p>Post your service requirement for free and compare quotes from qualified Chartered Accountants and tax consultants serving {esc(town_display)}.</p>
<a href="{cta_url}" class="lp-hero-cta">Post Requirement Free</a>
</section>
<footer class="lp-footer">
<a href="/privacy-policy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Service</a> | <a href="/contact.html">Contact Us</a>
</footer>
</body>
</html>"""
        
        filepath = seo_dir / filename
        filepath.write_text(content, encoding="utf-8")
        existing_files.add(filename)
        generated_count += 1

print(f"Successfully generated {generated_count} new Karnataka taluk & small city SEO pages.")
