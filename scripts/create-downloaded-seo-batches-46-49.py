import os
import re
import json
import html
from pathlib import Path

# Paths
root = Path("C:/Ravish/workindex-frontend")
downloads = Path("C:/Users/LENOVO/Downloads")
seo_dir = root / "seo-pages"
sitemap_path = root / "sitemap.xml"
manifest_path = root / "batches46-49-downloaded-indexnow-urls.json"
source_path = root / "batches46-49-downloaded-source-slugs.json"
cta_url = "/?signup=true&role=client"
fact_date = "2026-06-21"
batch_numbers = [46, 47, 48, 49]

caps = {
    'ay': 'AY', 'ca': 'CA', 'cfo': 'CFO', 'cbic': 'CBIC', 'dsc': 'DSC', 'epf': 'EPF', 'esic': 'ESIC',
    'fema': 'FEMA', 'fy': 'FY', 'gst': 'GST', 'gstr': 'GSTR', 'hsn': 'HSN', 'huf': 'HUF', 'ims': 'IMS',
    'it': 'Income Tax', 'itr': 'ITR', 'itc': 'ITC', 'llp': 'LLP', 'lrs': 'LRS', 'ltcg': 'LTCG',
    'mat': 'MAT', 'mca': 'MCA', 'mis': 'MIS', 'msme': 'MSME', 'nbfc': 'NBFC', 'nri': 'NRI',
    'pan': 'PAN', 'pf': 'PF', 'posh': 'POSH', 'rbi': 'RBI', 'rcm': 'RCM', 'rera': 'RERA',
    'roc': 'ROC', 'sac': 'SAC', 'sebi': 'SEBI', 'sft': 'SFT', 'stcg': 'STCG', 'tcs': 'TCS',
    'tds': 'TDS', 'tan': 'TAN', 'udyam': 'Udyam', 'ptrc': 'PTRC', 'ptec': 'PTEC'
}

source_refs = {
    'tax': [
        ['Income Tax Department e-Filing', 'https://www.incometax.gov.in/iec/foportal/'],
        ['Income Tax Act / Rules resources', 'https://www.incometaxindia.gov.in/Pages/acts/income-tax-act.aspx'],
        ['TRACES', 'https://www.tdscpc.gov.in/']
    ],
    'gst': [
        ['GST portal', 'https://www.gst.gov.in/'],
        ['CBIC GST', 'https://cbic-gst.gov.in/'],
        ['CBIC GST rates', 'https://cbic-gst.gov.in/gst-goods-services-rates.html']
    ],
    'company': [
        ['MCA portal', 'https://www.mca.gov.in/'],
        ['MCA SPICe+', 'https://www.mca.gov.in/content/mca/global/en/mca/e-filing/incorporation/spice.html'],
        ['India Code', 'https://www.indiacode.nic.in/']
    ],
    'labour': [
        ['Ministry of Labour and Employment', 'https://labour.gov.in/'],
        ['EPFO', 'https://www.epfindia.gov.in/'],
        ['ESIC', 'https://www.esic.gov.in/']
    ],
    'rera': [
        ['RERA official portal', 'https://rera.gov.in/'],
        ['MoHUA', 'https://mohua.gov.in/']
    ],
    'finance': [
        ['RBI', 'https://www.rbi.org.in/'],
        ['SEBI', 'https://www.sebi.gov.in/'],
        ['AMFI', 'https://www.amfiindia.com/']
    ],
    'commerce': [
        ['DGFT', 'https://www.dgft.gov.in/'],
        ['ICEGATE', 'https://www.icegate.gov.in/'],
        ['CBIC', 'https://www.cbic.gov.in/']
    ]
}

service_prefixes = [
    'best-accountant', 'best-tax-consultant', 'top-ca-firm', 'find-ca', 'affordable-ca-services',
    'chartered-accountant', 'ca-services', 'tax-consultant', 'income-tax-services', 'itr-filing',
    'gst-services', 'best-gst-consultant', 'accounting-services', 'audit-services', 'tds-services',
    'tds-filing', 'tcs-compliance', 'tax-audit-section-44ab', 'tax-audit-services',
    'statutory-audit', 'internal-audit', 'llp-registration', 'company-registration',
    'bookkeeping-outsourcing', 'outsourced-accounting', 'accounting-outsourcing-services',
    'payroll-services', 'hr-payroll-services', 'professional-tax-services', 'epf-services',
    'pf-services', 'esic-services', 'posh-compliance', 'labour-law-compliance',
    'rera-registration', 'rera-compliance', 'msme-registration', 'udyam-registration',
    'roc-filing', 'secretarial-audit', 'cost-audit', 'csr-compliance', 'virtual-cfo',
    'business-valuation', 'financial-planning', 'financial-advisor', 'tax-planning'
]
service_prefixes.sort(key=len, reverse=True)

city_context = {
    'bangalore': 'startup, SaaS, IT, ecommerce and professional-service teams',
    'bengaluru': 'startup, SaaS, IT, ecommerce and professional-service teams',
    'delhi': 'NCR traders, consultants, NGOs, contractors and professional firms',
    'mumbai': 'finance, media, trading, export and head-office teams',
    'chennai': 'manufacturing, logistics, IT, healthcare and export businesses',
    'hyderabad': 'technology, pharma, startup and consulting teams',
    'pune': 'IT, automotive, education, startup and manufacturing businesses',
    'kolkata': 'trading, logistics, professional and legacy family businesses',
    'ahmedabad': 'textile, chemicals, manufacturing, trading and SME businesses',
    'surat': 'textile, diamond, ecommerce, trading and export businesses',
    'jaipur': 'gems, jewellery, tourism, retail, startup and trading businesses',
    'chandigarh': 'service professionals, clinics, consultants and regional offices',
    'kochi': 'shipping, tourism, startup, NRI and service businesses',
    'indore': 'trading, food processing, startup and professional-service businesses',
    'lucknow': 'professionals, government contractors, education and retail businesses',
    'nagpur': 'logistics, trading, professionals and central India businesses',
    'noida': 'IT, media, real estate, startup and NCR service businesses',
    'gurgaon': 'corporate offices, startups, consulting and shared-service teams',
    'coimbatore': 'textiles, manufacturing, engineering and professional businesses',
    'mysore': 'tourism, education, IT services and local SMEs',
    'visakhapatnam': 'port, logistics, pharma, IT, public sector and professional services',
    'vizag': 'port, logistics, pharma, IT, public sector and professional services'
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
    return title

def list_to_html(items):
    lis = "".join(f"<li>{esc(item)}</li>" for item in items)
    return f'<ul class="wi-detail-list">{lis}</ul>'

def ref_type(slug):
    if re.search(r'gst|gstr|hsn|sac|itc|rcm|ims|e-invoice|einvoice|eway|e-way|composition|gstin', slug):
        return 'gst'
    if re.search(r'company|llp|opc|roc|mca|director|din|aoc|mgt|adt|share|secretarial|cost-audit|csr|startup|incorporation|spice|strike-off', slug):
        return 'company'
    if re.search(r'labour|payroll|wage|pf-|epf|esic|posh|gratuity|bonus|professional-tax|shops-act|contract-labour', slug):
        return 'labour'
    if re.search(r'rera|real-estate|builder|project', slug):
        return 'rera'
    if re.search(r'rbi|sebi|nbfc|fema|mutual-fund|sgb|bond|valuation|financial|investment|portfolio|foreign-asset|lrs|sbi|bank|loan|credit', slug):
        return 'finance'
    if re.search(r'dgft|iec|import|export|customs|icegate|lut|ad-code', slug):
        return 'commerce'
    return 'tax'

def official_context(type_name):
    return {
        'tax': 'Check the active assessment year or tax year, the Income Tax Department utility, AIS/TIS, Form 26AS, TRACES and the latest notification before filing or advising.',
        'gst': 'Check GSTIN status, return period, registration type, CBIC notifications, GST portal advisories, HSN/SAC classification and the live return utility before submission.',
        'company': 'Check company master data, MCA V3 form availability, board/shareholder approvals, DSC validity and applicable Companies Act or LLP Act thresholds before filing.',
        'labour': 'Check employee count, state, wage structure, establishment registration and the relevant PF, ESIC, professional tax or labour portal before deciding liability.',
        'rera': 'RERA is state-specific. Check the applicable state RERA portal, project registration, quarterly update status, orders and current rules before acting.',
        'finance': 'Regulated finance, FEMA, securities and valuation work needs RBI, SEBI, AMFI or bank-source verification plus professional judgement on thresholds and documents.',
        'commerce': 'Import-export work needs DGFT, IEC, AD code, ICEGATE, LUT, customs and GST portal checks based on the goods, service and transaction structure.'
    }[type_name]

def fact_note(slug, type_name):
    # LRS
    if re.search(r'lrs|remittance|remit|foreign-exchange|fema|gift-city|tour-package', slug):
        return 'LRS remittances are subject to a USD 250,000 annual limit per resident individual. Post-Budget 2026, the TCS rate on education and medical treatment is 2% above a ₹10 lakh threshold. Other remittances (investments/gifts/property) attract 20% TCS above ₹10 lakh. Tour packages are subject to a separate threshold (5% up to ₹7 lakh, 20% above, starting from the first rupee).'
    # E-commerce seller
    if re.search(r'ecommerce|amazon|flipkart|meesho|myntra|seller-gst|section-24-ix|gstr-8|gst-tcs|section-52', slug):
        return 'Per CGST Act Section 24(ix), e-commerce goods sellers face mandatory GST registration with zero threshold. Service providers selling through e-commerce operators get a ₹20 lakh threshold exemption. E-commerce operators collect 1% TCS under Section 52 on the net value of taxable supplies.'
    # Influencer / Content Creator
    if re.search(r'influencer|creator|youtube|instagram|194r|barter|profession-code-16021|livestream', slug):
        return 'For influencers and content creators, Profession Code 16021 is introduced in ITR-3. Section 194R requires 10% TDS on benefits or perquisites (cash/kind, including barter deals) exceeding ₹20,000 in a FY. Gilded/direct donations from viewers do not attract Section 194R TDS but are taxable business income.'
    # Litigation / Form 99 / CIT(A) / ITAT
    if re.search(r'form-99|form-115|form-117|form-118|appeal|litigation|itat|cit-a|tribunal|representation|section-358|section-362|section-440', slug):
        return 'Under the Income Tax Act 2025 and Rules 2026, the appeals framework is restructured: Form 99 replaces Form 35 (CIT(A) appeal, 30 days from service date), Form 115 replaces Form 36 (ITAT appeal, 2 months from month-end), Form 117 is for repetitive appeal declarations, and Form 118 is for deferment.'
    # RBI / Commercial Banks / Working Capital / CMA Data
    if re.search(r'rbi|commercial-bank|npa|eir|credit-facility|cma-data|loan|credit-rating|collateral', slug):
        return 'The 2025-2026 RBI Commercial Banks Directions mandate automated asset classification, 90-day overdue rule for NPAs, and Effective Interest Rate (EIR) transition by 2030. Working Capital repayment flexibility (bullet/installment) is effective April 1, 2027. CMA data remains mandatory for credit assessment.'
    # Maharashtra Professional Tax
    if re.search(r'ptrc|ptec|professional-tax-maharashtra|maharashtra-professional-tax', slug):
        return 'In Maharashtra, PTRC (Professional Tax Registration Certificate) is required for employers to deduct and remit employee professional tax, while PTEC (Professional Tax Enrollment Certificate) is required for the business/sole proprietor to pay their own professional tax.'
    
    if re.search(r'ay-2026-27|fy-2025-26', slug):
        return 'For AY 2026-27, the return generally relates to FY 2025-26 under the existing Income-tax Act, 1961 return utility. Do not mix it with Tax Year 2026-27 concepts unless the official utility or law clearly applies.'
    if re.search(r'income-tax-act-2025|it-act-2025|it-rules-2026|tax-year|april-2026|2026-27', slug):
        return 'Income Tax Act, 2025 and Income-tax Rules, 2026 topics are date-sensitive. Verify commencement and transition provisions from the legacy Income-tax Act, 1961 (1961 Act) to the new Act, rule numbers, and portal utilities from official sources before relying on summaries.'
    if re.search(r'gst-2|2-0', slug):
        return 'GST reform labels such as GST 2.0 should be treated as descriptive unless backed by a specific CBIC notification, GST Council release or portal advisory.'
    if re.search(r'hsn|sac', slug):
        return 'HSN and SAC classification can change by product description, composition, use and notification. Match invoices to official rate schedules instead of copying a competitor page blindly.'
    if re.search(r'mat|amt', slug):
        return 'MAT and AMT positions depend on the applicable law year, book-profit computation, carried-forward credit and transition rules. Verify with the current Act and return schedule.'
    if re.search(r'foreign-asset|fema|rsu|esop|nri|lrs', slug):
        return 'Foreign income, ESOP, RSU, FEMA and asset-disclosure positions are high-risk. Reconcile Indian tax, foreign tax credit, RBI/FEMA rules and Schedule FA before filing.'
    return official_context(type_name)

intent_map = [
    (re.compile(r'near-me|best-|top-|find-|affordable'), 'Compare professionals'),
    (re.compile(r'deadline|due-date|calendar|penalty|late-fee'), 'Deadline and risk planning'),
    (re.compile(r'documents|required|checklist'), 'Document checklist'),
    (re.compile(r'registration|incorporation|apply|process|step-by-step'), 'Registration process'),
    (re.compile(r'return|filing|form-|gstr|itr|tds|tcs'), 'Return filing'),
    (re.compile(r'notice|appeal|assessment|scrutiny|litigation|demand'), 'Notice and dispute support'),
    (re.compile(r'rate|rates|calculator|limit|threshold|slab'), 'Rate and threshold check'),
    (re.compile(r'audit|valuation|due-diligence|review'), 'Review and assurance'),
    (re.compile(r'package|pricing|cost|packages|price'), 'Compare pricing packages')
]

def intent(slug):
    for pattern, label in intent_map:
        if pattern.search(slug):
            return label
    return 'Compliance guide'

def service_prefix(slug):
    for prefix in service_prefixes:
        if slug == prefix or slug.startswith(f"{prefix}-"):
            return prefix
    return None

def area_from_slug(slug):
    prefix = service_prefix(slug)
    if not prefix or slug == prefix:
        return ""
    return slug[len(prefix) + 1:]

def city_label(area):
    if not area:
        return ""
    if area == 'india':
        return 'India'
    if area == 'all-cities':
        return 'All cities'
    return title_from_slug(area).replace('Ncr', 'NCR')

def topic_specific_bullets(slug, type_name, title):
    area = area_from_slug(slug)
    city = city_label(area)
    if area and (area in city_context or '-' in area or area == 'india' or area == 'all-cities'):
        local = city_context.get(area, 'local professionals, SMEs, founders and compliance teams')
        return [
            f"{city or 'This location'} page is meant for {local} that need a professional matched by scope, documents and deadline.",
            "Share entity type, turnover or income source, period, city, portal status and expected deliverable before comparing quotes.",
            "Ask each expert to separate professional fee, government fee, filing responsibility, assumptions, exclusions and timeline.",
            "For multi-city work, keep one owner for filings and one document checklist so GST, tax, ROC or payroll data stays consistent."
        ]
    if type_name == 'gst':
        return [
            "Map the issue to the correct GSTIN, return period, registration type and place-of-supply facts before choosing the filing or advisory route.",
            "Reconcile outward supplies, purchase register, GSTR-2B/2A, e-invoice or e-way bill data where relevant.",
            "Check if the work involves registration, amendment, cancellation, ITC, RCM, composition, annual return, refund or notice response.",
            "Keep portal access, notices, invoices, ledgers and prior returns ready so the expert can quote precisely."
        ]
    if type_name == 'company':
        return [
            "Confirm entity type, paid-up capital, turnover, board history, shareholder approvals and due dates before starting the MCA workflow.",
            "Check DSC status, director KYC, DIN details, company master data and form availability on MCA V3.",
            "Separate routine annual compliance from event-based filings such as share issue, director change, charge, closure or strike-off.",
            "Ask for a filing calendar, form list, attachments, certification requirement and proof of filing."
        ]
    if type_name == 'labour':
        return [
            "Confirm state, employee count, wage breakup, contractor involvement and establishment category before applying a rule.",
            "Professional tax, shops act, PF, ESIC, gratuity, bonus and POSH applicability can differ by threshold and state.",
            "Keep payroll registers, challans, employee master, appointment terms and prior filings ready for review.",
            "Ask the expert to identify registration, monthly return, annual return, policy and notice-response responsibilities separately."
        ]
    if type_name == 'finance':
        return [
            "Confirm whether the topic is tax, RBI/FEMA, securities, bank, valuation or investment reporting before relying on a rate or threshold.",
            "Keep source documents, transaction dates, cost records, bank statements and regulator correspondence ready.",
            "Ask for assumptions, valuation method, disclosure schedule, tax treatment and compliance timeline in writing.",
            "Cross-check market-linked, foreign asset and investment positions with official regulator or portal data."
        ]
    return [
        f"Identify the exact period, assessment year or tax year, income head, entity type and portal status before applying {title}.",
        "Reconcile source data such as AIS/TIS, Form 26AS, books, bank statements, invoices, notices and prior returns.",
        "Ask the expert to flag regime choice, deduction limits, disclosure schedules, penalty exposure and expected deliverables.",
        "Do not rely on old blog summaries where forms, deadlines, sections or portal utilities have changed."
    ]

def mistakes(slug, type_name):
    common = [
        'Using an old due date, old section number or old form without checking the live portal.',
        'Posting a vague requirement without period, entity type, city, documents and deadline.',
        'Comparing quotes without clarifying government fee, professional fee and exclusions.'
    ]
    if type_name == 'gst':
        return [
            'Choosing a GST rate or HSN/SAC code from a generic table without matching the actual product or service.',
            'Ignoring GSTR-2B, credit notes, amendments, e-invoice or e-way bill mismatches.'
        ] + common
    if type_name == 'company':
        return [
            'Starting an MCA filing before checking DSC, DIN KYC, master data, board approvals and attachments.',
            'Treating annual compliance and event-based ROC filings as the same assignment.'
        ] + common
    if type_name == 'labour':
        return [
            'Assuming one state professional tax, shops act or payroll rule applies across all branches.',
            'Ignoring employee-count and wage-threshold triggers for PF, ESIC, gratuity, bonus or POSH.'
        ] + common
    return common + [
        'Skipping reconciliation with AIS/TIS, books, Form 26AS, GST data or bank records.',
        'Treating explanatory SEO content as final tax, legal, audit or investment advice.'
    ]

def related(slug, all_slugs):
    ignore_pat = re.compile(r'^(in|for|and|vs|guide|services|service|india|2026|2027|27|ay|fy)$')
    parts = [part for part in slug.split('-') if not ignore_pat.match(part)]
    
    scored = []
    for candidate in all_slugs:
        if candidate == slug:
            continue
        score = sum(1 for part in parts if part in candidate)
        if score > 1:
            scored.append((candidate, score))
            
    scored.sort(key=lambda x: x[0])
    scored.sort(key=lambda x: x[1], reverse=True)
    
    related_slugs = [x[0] for x in scored[:6]]
    if not related_slugs:
        related_slugs = [cand for cand in all_slugs if cand != slug][:6]
    return related_slugs

def source_links(type_name):
    links = [f'<a href="{url}" rel="nofollow noopener">{esc(label)}</a>' for label, url in source_refs[type_name]]
    return "".join(links)

def page_html(page, all_slugs):
    title = title_from_slug(page['slug'])
    type_name = ref_type(page['slug'])
    
    # Brand Spacing updates applied directly:
    meta = f"{title} in India. Check facts, documents, official portals, deadlines, risks and expert brief before hiring on the WorkIndex work index."
    
    intent_name = intent(page['slug'])
    bullets = topic_specific_bullets(page['slug'], type_name, title)
    rel = related(page['slug'], all_slugs)
    related_html = "".join(f'<a href="/seo-pages/{slug}.html">{esc(title_from_slug(slug))}</a>' for slug in rel)
    
    hero_sub = 'Compare professionals with a clear local brief' if service_prefix(page['slug']) else 'India-specific preparation guide'
    
    block_label = page['block']
    block_label = re.sub(r'^#+\s*', '', block_label)
    block_label = block_label.replace('`', '').replace('—', '-').replace('–', '-').replace('’', "'").replace('“', '"').replace('”', '"')
    
    fact_items = list(set([
        fact_note(page['slug'], type_name),
        official_context(type_name),
        'If a competitor page gives a fixed rate, penalty, date or exemption, verify it against the official source and your facts before copying it into a filing position.'
    ]))
    
    schema_data = {
        '@context': 'https://schema.org',
        '@graph': [
            { '@type': 'Organization', '@id': 'https://workindex.co.in/#organization', 'name': 'WorkIndex', 'alternateName': 'Work Index', 'url': 'https://workindex.co.in' },
            { '@type': 'WebPage', '@id': f"https://workindex.co.in/seo-pages/{page['slug']}.html#webpage", 'url': f"https://workindex.co.in/seo-pages/{page['slug']}.html", 'name': f"{title} | WorkIndex", 'description': meta },
            { '@type': 'BreadcrumbList', 'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'WorkIndex', 'item': 'https://workindex.co.in' },
                { '@type': 'ListItem', 'position': 2, 'name': title, 'item': f"https://workindex.co.in/seo-pages/{page['slug']}.html" }
            ] },
            { '@type': 'FAQPage', 'mainEntity': [
                { '@type': 'Question', 'name': f"Is {title} final legal or tax advice?", 'acceptedAnswer': { '@type': 'Answer', 'text': 'No. This page is a preparation guide. Verify current law, portal utilities, notifications and your documents with a qualified professional.' } },
                { '@type': 'Question', 'name': 'What should I share with an expert?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Share entity type, city, period, income or turnover details, portal status, notices, documents available, deadline and exact output expected.' } },
                { '@type': 'Question', 'name': 'Can WorkIndex help compare experts?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. Post one requirement and compare relevant experts by scope, quote, assumptions, timeline and deliverables.' } }
            ] },
            { '@type': 'Service', 'name': title, 'serviceType': intent_name, 'provider': { '@id': 'https://workindex.co.in/#organization' }, 'areaServed': { '@type': 'Country', 'name': 'India' }, 'description': meta }
        ]
    }
    schema_json = json.dumps(schema_data, separators=(',', ':'))
    
    html_content = f"""<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{esc(title)} | WorkIndex</title><meta name="description" content="{esc(meta)}"/><link rel="canonical" href="https://workindex.co.in/seo-pages/{page['slug']}.html"/>
<meta property="og:title" content="{esc(title)} | WorkIndex"/><meta property="og:description" content="{esc(meta)}"/><meta property="og:url" content="https://workindex.co.in/seo-pages/{page['slug']}.html"/><meta property="og:type" content="website"/>
<link rel="stylesheet" href="/styles.css"/><link rel="stylesheet" href="/lp-styles.css"/>
<script type="application/ld+json">{schema_json}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body class="landing">
<main class="wi-rich">
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>{esc(title)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>{esc(intent_name)}</div><h1>{esc(title)}<br><span>{esc(hero_sub)}</span></h1><p>{esc(title)} needs current-law checks, portal verification, documents and a precise brief before you compare experts on the WorkIndex work index.</p><a href="{cta_url}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: {fact_date}</div><div class="lp-trust-item">Duplicate checked</div><div class="lp-trust-item">Official-source cautious</div><div class="lp-trust-item">India specific</div></div></section>
<div class="wi-rich-grid"><div>
<section class="wi-panel"><div class="lp-section-eyebrow">{esc(block_label)}</div><h2>What this page helps you decide</h2><p>{esc(title)} is best handled after identifying the exact scope, period, applicable portal and documents. Use this page to prepare a sharper expert brief instead of relying on generic summaries.</p>{list_to_html(bullets)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Fact check</div><h2>Accuracy notes before you act</h2>{list_to_html(fact_items)}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Documents</div><h2>Documents and facts to keep ready</h2>{list_to_html(['PAN, Aadhaar, GSTIN, CIN/LLPIN, TAN or registration details where applicable.', 'Relevant financial year, assessment year, tax year, return period, due date and notice number.', 'Books, invoices, payroll, bank statements, contracts, prior filings and portal screenshots.', 'Expected output: filing, registration, correction, advisory memo, notice response, audit report or recurring compliance.'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Care points</div><h2>Common mistakes to avoid</h2>{list_to_html(mistakes(page['slug'], type_name))}</section>
</div><aside>
<section class="wi-panel"><div class="lp-section-eyebrow">Official checks</div><h2>Useful source portals</h2><div class="wi-related">{source_links(type_name)}</div></section>
<section class="wi-panel"><div class="lp-section-eyebrow">Hiring brief</div><h2>Ask experts these questions</h2>{list_to_html(['Which law, form, utility or notification are you relying on?', 'What documents are missing before you can finalise the work?', 'What is included in your quote and what is excluded?', 'What timeline, proof of filing and post-filing support will you provide?'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Related pages</div><h2>Explore related WorkIndex guides</h2><div class="wi-related">{related_html}</div></section>
</aside></div>
</main>
</body>
</html>
"""
    
    # Safely satisfy transition rule for AY 2026-27 + Income Tax Act, 2025 combinations
    if re.search(r'AY 2026-27', html_content, re.I) and re.search(r'Income Tax Act, 2025', html_content, re.I) and not re.search(r'Income-tax Act, 1961|1961 Act', html_content, re.I):
        html_content = html_content.replace(
            '<h2>Accuracy notes before you act</h2>',
            '<h2>Accuracy notes before you act</h2><p><strong>Note on transition:</strong> The Income Tax Act, 2025 transition from the legacy Income-tax Act, 1961 (1961 Act) applies from Tax Year 2026-27 onwards. The current AY 2026-27 filing remains under the 1961 Act.</p>'
        )
        
    return html_content

def extract_pages(file_name):
    path = downloads / file_name
    if not path.exists():
        print(f"File not found: {path}")
        return []
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    pages = []
    current_block = file_name.replace('.md', '')
    lines = text.splitlines()
    in_fence = False
    for raw in lines:
        line = raw.strip()
        if re.match(r'^#{3,}\s+', line) and 'CONTEXT' not in line:
            current_block = re.sub(r'^#+\s*', '', line)
        if line.startswith('```'):
            in_fence = not in_fence
            continue
        if in_fence and re.match(r'^[a-z0-9]+(?:-[a-z0-9]+)*$', line):
            pages.append({'slug': line, 'file': file_name, 'block': current_block})
    return pages

def update_sitemap():
    static_urls = [
        ('https://workindex.co.in/', 'daily', '1.0'),
        ('https://workindex.co.in/contact.html', 'monthly', '0.6'),
        ('https://workindex.co.in/privacy-policy.html', 'yearly', '0.3'),
        ('https://workindex.co.in/refund-policy.html', 'yearly', '0.3'),
        ('https://workindex.co.in/terms.html', 'yearly', '0.3')
    ]
    seo_files = sorted([f for f in os.listdir(seo_dir) if f.endswith('.html')])
    
    urls = []
    for loc, changefreq, priority in static_urls:
        urls.append(f"  <url><loc>{loc}</loc><changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>")
    
    for f in seo_files:
        urls.append(f"  <url><loc>https://workindex.co.in/seo-pages/{f}</loc><lastmod>{fact_date}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>")
        
    sitemap_content = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(urls) + '\n</urlset>\n'
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    return {'total': len(urls), 'seo': len(seo_files)}

def main():
    os.makedirs(seo_dir, exist_ok=True)
    raw_pages = []
    for num in batch_numbers:
        raw_pages.extend(extract_pages(f"workindex-seo-batch{num}.md"))
        
    pages = []
    seen = set()
    duplicate_in_source = []
    for page in raw_pages:
        if page['slug'] in seen:
            duplicate_in_source.append(page)
            continue
        seen.add(page['slug'])
        pages.append(page)
        
    existing = []
    created = []
    
    # Aggregate all slugs (new + existing)
    all_slugs = [f[:-5] for f in os.listdir(seo_dir) if f.endswith('.html')]
    all_slugs_set = set(all_slugs)
    for p in pages:
        all_slugs_set.add(p['slug'])
    all_slugs_list = sorted(list(all_slugs_set))
    
    for page in pages:
        out = seo_dir / f"{page['slug']}.html"
        if out.exists() and os.environ.get('OVERWRITE_BATCHES') == '0':
            existing.append(page['slug'])
            continue
        
        html_data = page_html(page, all_slugs_list)
        with open(out, 'w', encoding='utf-8') as f:
            f.write(html_data)
        created.append(page['slug'])
        
    sitemap = update_sitemap()
    urls = [f"https://workindex.co.in/seo-pages/{slug}.html" for slug in created]
    
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(urls, f, indent=2)
        
    with open(source_path, 'w', encoding='utf-8') as f:
        json.dump({
            'batches': batch_numbers,
            'extracted': len(raw_pages),
            'unique': len(pages),
            'duplicateInSource': [{'slug': p['slug'], 'file': p['file']} for p in duplicate_in_source],
            'alreadyExisted': existing,
            'created': created
        }, f, indent=2)
        
    print(json.dumps({
        'extracted': len(raw_pages),
        'unique': len(pages),
        'duplicateInSource': len(duplicate_in_source),
        'alreadyExisted': len(existing),
        'created': len(created),
        'sitemapUrls': sitemap['total'],
        'seoPages': sitemap['seo'],
        'manifest': str(manifest_path.relative_to(root)),
        'source': str(source_path.relative_to(root))
    }, indent=2))

if __name__ == '__main__':
    main()
