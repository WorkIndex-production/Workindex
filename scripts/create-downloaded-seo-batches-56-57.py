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
manifest_path = root / "batches56-57-downloaded-indexnow-urls.json"
source_path = root / "batches56-57-downloaded-source-slugs.json"
progress_file = Path("C:/Ravish/indexer/progress.json")
urls_file = Path("C:/Ravish/indexer/urls.txt")

cta_url = "/?signup=true&role=client"
fact_date = "2026-06-24"
batch_numbers = [56, 57]

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
    'ccm': 'CCM', 'dpiit': 'DPIIT', 'ddt': 'DDT', 'ulip': 'ULIP', 'mat': 'MAT', 'udin': 'UDIN', 'caro': 'CARO',
    'rcm': 'RCM'
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
        ['IFSCA Portal', 'https://ifsca.gov.in/']
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
    title = re.sub(r'\bF\s+And\s+O\b', 'F&O', title, flags=re.I)
    return title

def list_to_html(items):
    lis = "".join(f"<li>{esc(item)}</li>" for item in items)
    return f'<ul class="wi-detail-list">{lis}</ul>'

def ref_type(slug):
    if re.search(r'gst|gstr|hsn|sac|itc|rcm|ims|e-invoice|einvoice|eway|e-way|composition|gstin', slug):
        return 'gst'
    if re.search(r'company|llp|opc|roc|mca|director|din|aoc|mgt|adt|share|secretarial|cost-audit|csr|startup|incorporation|spice|strike-off|fundraising|term-sheet', slug):
        return 'company'
    if re.search(r'labour|payroll|wage|pf-|epf|esic|posh|gratuity|bonus|professional-tax|shops-act|contract-labour', slug):
        return 'labour'
    if re.search(r'rera|real-estate|builder|project', slug):
        return 'rera'
    if re.search(r'rbi|sebi|nbfc|fema|mutual-fund|sgb|bond|valuation|financial|investment|portfolio|foreign-asset|lrs|sbi|bank|loan|credit|ifsc|gift-city', slug):
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

# ==========================================
# CATEGORIES & CLASSIFICATION (BATCH 56/57)
# ==========================================

def get_category_and_topic(slug, batch_num):
    # Extract clean topic
    topic = slug.replace('faq-', '').replace('blog-', '').replace('-guide-2026', '').replace('-complete-guide', '').replace('-guide', '').replace('-', ' ').title()
    topic = re.sub(r'\s+', ' ', topic).strip()
    
    slug_lower = slug.lower()
    
    if batch_num == 56:
        if re.search(r'gift-city|ifsc|aif|banking-unit|insurance-unit|aircraft-leasing|ship-leasing|global-inhouse|fintech-entity', slug_lower):
            return "gift_city_ifsc", topic
        elif re.search(r'sgb|ppf|epf|nsc|fd-|corporate-bond|post-office|savings-investment|rule-9d|10-11|10-12|194a', slug_lower):
            return "savings_investment_income", topic
        elif re.search(r'gaming|fantasy|194ba|dream11|esports|poker|rummy|betting|lottery', slug_lower):
            return "online_gaming_fantasy", topic
        elif re.search(r'oidar|ota-|aggregator|influencer|dropshipping|app-developer|game-developer|digital-economy', slug_lower):
            return "gst_digital_economy", topic
        elif re.search(r'will|nominee|heir|death|transmission|estate|succession|inheritance|claim-tax|joint-property', slug_lower):
            return "estate_succession", topic
        elif re.search(r'80eea|home-loan|pre-emi|top-up|balance-transfer|let-out|second-house', slug_lower):
            return "home_loan_deep", topic
        else:
            return "roc_mat_nri_misc", topic
            
    elif batch_num == 57:
        if re.search(r'angel-tax|56-2-viib|56-2-x|11ua|dcf|nav-valuation|dpiit|premium', slug_lower):
            return "angel_tax_buyback_budget", topic
        elif re.search(r'buyback|115qa|deemed-dividend|cost-acquisition|share-repurchase', slug_lower):
            return "angel_tax_buyback_budget", topic
        elif re.search(r'budget-2024|budget-2025|finance-act-2024|finance-act-2025|standard-deduction|80ccd|ulip|12-5|12\.5|15-percent|20-percent', slug_lower):
            return "angel_tax_buyback_budget", topic
        elif re.search(r'nri-|usa|uk-|uae|singapore|australia|canada|germany|dubai|gulf|repatriation|remittance|fema', slug_lower):
            return "roc_mat_nri_misc", topic
        elif re.search(r'e-invoicing|eway|e-way|einvoice|qr-code|gstr-1|gstr-3b', slug_lower):
            return "gst_digital_economy", topic
        elif re.search(r'clubbing|family-tax|gift-spouse|gift-child|minor-income', slug_lower):
            return "roc_mat_nri_misc", topic
        elif re.search(r'mat-|115jb|book-profit|corporate-tax|company-income', slug_lower):
            return "roc_mat_nri_misc", topic
        elif re.search(r'customs|import|export|dgft|icegate|ad-code|shipping-bill|lut|duty|tariff', slug_lower):
            return "roc_mat_nri_misc", topic
        elif re.search(r'secretarial|24a|peer-reviewed|cs-|roc-|mca|director-disqualification|meeting|aoc-4|mgt-7|mr-3', slug_lower):
            return "roc_mat_nri_misc", topic
        else:
            return "roc_mat_nri_misc", topic
            
    return "roc_mat_nri_misc", topic

fact_check_bullets = {
    "gift_city_ifsc": [
        "Units in GIFT City/IFSC are eligible for a 100% corporate tax holiday for any 10 consecutive years within a 15-year block under Section 80LA.",
        "Minimum Alternate Tax (MAT) is reduced from 15% to 9% under Section 115JB for units operating in the IFSC.",
        "Under Section 10(15), interest income paid to non-residents on monies borrowed by an IFSC unit is fully tax-exempt.",
        "Transactions within IFSC or between an IFSC unit and a foreign client are treated as exports and qualify for zero-rated GST GST status."
    ],
    "savings_investment_income": [
        "Sovereign Gold Bonds (SGB) offer tax-free capital gains on redemption for individuals under Section 47(viib). Interest of 2.5% p.a. is fully taxable under slab rates.",
        "Public Provident Fund (PPF) continues under the Exempt-Exempt-Exempt (EEE) regime, making contributions, annual interest, and maturity proceeds fully tax-free.",
        "EPF interest on employee contributions exceeding ₹2.5 lakh in a financial year (or ₹5 lakh if no employer contribution) is taxable under Rule 9D.",
        "TDS on bank FD interest applies under Section 194A if interest exceeds ₹40,000 for regular individuals or ₹50,000 for senior citizens (increased to ₹1,00,000 under Budget 2026/2025)."
    ],
    "online_gaming_fantasy": [
        "Net winnings from online games, poker, rummy, and fantasy sports are taxed at a flat rate of 30% without basic exemptions under Section 115BBJ.",
        "Under Section 194BA, TDS must be deducted at 30% on net winnings at the time of withdrawal or at the end of the financial year.",
        "Section 58(4) prohibits deducting any expenditure or offsetting losses from online gaming against other income heads.",
        "GST on online money gaming is levied at a flat rate of 28% on the full face value of the bets placed/entry pool."
    ],
    "gst_digital_economy": [
        "OIDAR (Online Information Database Access and Retrieval) services provided by foreign entities to non-taxable online recipients in India are subject to 18% GST.",
        "Online Travel Aggregators (OTAs) and cab aggregators must collect TCS under Section 52 of the CGST Act at 1% of net taxable supplies.",
        "E-commerce platforms facilitating sales must deduct income tax TDS at 1% under Section 194O on the gross amount of sales.",
        "GST registration is mandatory for social media content creators, YouTubers, and influencers if their annual service turnover exceeds ₹20 lakh (₹10 lakh in special category states)."
    ],
    "estate_succession": [
        "A nominee acts only as a custodian; the legal heirs hold the ultimate beneficial ownership of assets under Indian succession laws.",
        "Transmission of shares or mutual funds to nominees or legal heirs does not trigger capital gains tax under Section 47(iii).",
        "Life insurance death claim proceeds are fully exempt under Section 10(10D) regardless of the premium-to-sum-assured ratio.",
        "For subsequent sale of inherited assets, the holding period includes the period held by the deceased, and cost of acquisition is the cost to the original owner."
    ],
    "home_loan_deep": [
        "Section 24(b) interest deduction is capped at ₹2 lakh for self-occupied properties, but let-out properties have no cap (net loss set-off against other income capped at ₹2 lakh).",
        "Section 80EEA provides an additional deduction of up to ₹1.5 lakh on home loan interest for first-time buyers of affordable housing.",
        "Pre-construction interest must be accumulated and claimed in 5 equal annual installments starting from the FY when construction is completed.",
        "Principal repayments qualify for Section 80C deduction up to ₹1.5 lakh under the Old Tax Regime (not available under the default New Regime)."
    ],
    "angel_tax_buyback_budget": [
        "Angel Tax under Section 56(2)(viib) is fully abolished for all classes of investors for shares issued on or after April 1, 2025 (FY 2025-26 onwards).",
        "Legacy angel tax disputes for prior AYs remain active and require validation of share premiums under Rule 11UA DCF/NAV methods.",
        "Buyback Tax under Section 115QA is abolished for companies from October 1, 2024; buyback proceeds are taxed as deemed dividends for shareholders at slab rates.",
        "LTCG on listed equity is taxed at a flat 12.5% (exemption threshold ₹1.25L) and STCG is taxed at 20% under the current Finance Act."
    ],
    "roc_mat_nri_misc": [
        "Minimum Alternate Tax (MAT) u/s 115JB applies to companies at 15% of book profits if normal corporate tax liability is lower.",
        "Secretarial Audit in Form MR-3 is mandatory under Section 204 for listed companies, large public companies, and companies with bank debt > ₹100 crore.",
        "Income of a spouse or minor child from assets gifted without adequate consideration is clubbed with the transferor's income under Section 64.",
        "Non-Resident Indians (NRIs) must file ITR-2 or ITR-3 in India to declare Indian-sourced income (interest, capital gains, rental) and can claim DTAA relief u/s 90."
    ]
}

def get_specific_faqs(category, topic):
    if category == "gift_city_ifsc":
        return [
            (f"What are the corporate tax benefits for GIFT City IFSC units under {topic}?",
             f"Units established in GIFT City IFSC enjoy a 100% corporate tax holiday for any 10 consecutive years within a 15-year block under Section 80LA. This is a core focus of {topic}."),
            ("How does Minimum Alternate Tax (MAT) apply in GIFT City?",
             "MAT is reduced from 15% to 9% under Section 115JB for units operating within the IFSC. Companies opting for the new tax regime u/s 115BAA/115BAB are exempt from MAT."),
            ("Are non-resident investors in GIFT City exempt from PAN requirements?",
             "Yes, under Rule 114AAB, non-resident investors who do not have any other source of taxable income in India are exempt from the mandatory requirement to obtain a PAN."),
            ("What is the tax treatment of Category III AIFs in GIFT City?",
             "Category III AIFs in IFSC enjoy tax exemptions on transfer of foreign securities, derivatives, and rupee-denominated bonds. Other income is taxed at the fund level at treaty-favored rates."),
            ("Is there a GST exemption for transactions inside GIFT City IFSC?",
             "Yes. Services provided to or by units inside IFSC, or transactions between IFSC units and foreign entities, are treated as exports and are zero-rated under GST."),
            ("How is aircraft leasing taxed in GIFT City?",
             "IFSC units engaged in aircraft leasing receive a 100% tax holiday u/s 80LA, and foreign lessors are exempt from tax on royalty/rental income paid by IFSC units u/s 10(4F)."),
            ("What are the tax incentives for ship leasing in GIFT City?",
             "Similar to aircraft leasing, income from royalty or lease rentals of ships received by a non-resident from an IFSC unit is exempt from tax under Section 10(4F)."),
            ("How does LRS investment in GIFT City work for Indian residents?",
             "Resident individuals can remit funds up to USD 250,000 per financial year under the Liberalised Remittance Scheme (LRS) to invest in GIFT City funds or shares."),
            ("Are banking units in IFSC exempt from tax?",
             "Offshore Banking Units (OBUs) in IFSC are eligible for the 100% tax holiday u/s 80LA on business profits and exempt from SLR/CRR requirements."),
            ("What is Section 10(15) interest tax exemption in IFSC?",
             "Interest paid to non-residents on loans or deposits in foreign currency with an IFSC banking unit is fully exempt from tax in India."),
            ("Do startups in GIFT City get additional benefits?",
             "Yes, they qualify for regulatory sandbox programs, IFSCA grants, and lower compliance overheads alongside standard IFSC tax holidays."),
            ("What is a Global In-house Centre (GIC) in GIFT City?",
             "GICs provide captive financial and administrative services to their global groups. If registered in GIFT City, they qualify for the 10-year 100% tax holiday."),
            ("What stamp duty exemptions apply in GIFT City?",
             "All transactions on IFSC exchanges (NSE IX, India INX) are fully exempt from stamp duty, securities transaction tax (STT), and commodity transaction tax (CTT)."),
            ("Is tax residency certificate (TRC) required for claiming treaty benefits in GIFT City?",
             "Yes. Non-resident entities claiming lower tax rates or exemptions under a DTAA must submit a valid TRC from their home country and file Form 10F online."),
            ("What are the regular compliance reporting filings for GIFT City entities?",
             "Entities must file monthly, quarterly, and annual returns with the IFSCA, along with standard corporate tax filings (Form 1120 equivalent, ITR-6) with the Income Tax Department.")
        ]
        
    elif category == "savings_investment_income":
        return [
            (f"How is interest from PPF, EPF, and SGB taxed under {topic}?",
             f"PPF interest is 100% tax-free. SGB interest is taxable at slab rates but capital gains on redemption are tax-exempt. EPF interest is taxable if employee contributions exceed ₹2.5L in a FY under Rule 9D, which is critical for {topic}."),
            ("What is the EEE tax regime for PPF?",
             "EEE stands for Exempt-Exempt-Exempt. It means the contribution (up to ₹1.5L u/s 80C), the interest accumulated annually, and the final maturity amount are all exempt from tax."),
            ("How is Sovereign Gold Bond (SGB) interest and redemption taxed?",
             "SGB interest of 2.5% per annum is taxable under 'Income from Other Sources' at slab rates. However, capital gains on redemption of bonds at maturity (8 years) are fully tax-exempt for individuals."),
            ("What is the TDS threshold on FD interest for senior citizens?",
             "TDS applies under Section 194A if interest exceeds ₹40,000 for regular individuals or ₹50,000 for senior citizens. Budget 2026/2025 has enhanced the senior citizen TDS threshold to ₹1,00,000."),
            ("How does Rule 9D determine taxable EPF interest?",
             "Rule 9D splits your EPF account into a non-taxable contribution account (up to ₹2.5L/year) and a taxable contribution account (excess). Interest earned on the taxable account is added to your income annually."),
            ("Is interest on corporate bonds subject to TDS?",
             "Yes, interest on corporate bonds is subject to 10% TDS under Section 193. The interest income must be declared in Schedule OS at slab rates, and credit claimed for TDS."),
            ("Is Post Office Recurring Deposit (RD) interest tax-free?",
             "No, interest on post office RD is fully taxable under 'Income from Other Sources' at your normal tax slab rates."),
            ("How is NSC (National Savings Certificate) interest taxed?",
             "NSC interest is taxable but is deemed to be reinvested. Thus, the interest for the first 4 years qualifies for Section 80C deduction. The 5th-year interest is fully taxable and not eligible for deduction."),
            ("What is the tax treatment of Senior Citizens Savings Scheme (SCSS)?",
             "Interest is taxable at slab rates, but senior citizens can claim a deduction of up to ₹50,000 (₹1,00,000 under current Budget rules) u/s 80TTB on SCSS interest."),
            ("Are dividends from mutual funds taxable in India?",
             "Yes, dividends from equity or debt mutual funds are taxable in the hands of the investor at slab rates. AMC deducts 10% TDS u/s 194K if dividends exceed ₹5,000 in a FY."),
            ("How are capital gains on SGB secondary market sales taxed?",
             "If you sell SGBs in the secondary market (on stock exchanges) before maturity, gains are taxed as LTCG at 12.5% if held for >24 months, or at slab rates as STCG."),
            ("What is the tax treatment of Sukanya Samriddhi Yojana (SSY)?",
             "SSY follows the EEE model: contributions (u/s 80C), interest earned, and final withdrawals by the girl child are 100% tax-free."),
            ("Can I claim Section 80TTB deduction for NSC interest?",
             "No. Section 80TTB deduction is only available to senior citizens on interest from bank deposits, post office deposits, and cooperative bank deposits, not on NSC or bonds."),
            ("How is interest on RBI Taxable Bonds taxed?",
             "Interest is paid half-yearly and is fully taxable at your income tax slab rates. TDS at 7.5% applies if annual interest exceeds ₹10,000."),
            ("How do I reconcile investment interest in my ITR with the AIS?",
             "You must verify all FD, savings, and bond interest shown in your Annual Information Statement (AIS) and report matching figures under Schedule OS in ITR-1, 2, or 3.")
        ]
        
    elif category == "online_gaming_fantasy":
        return [
            (f"What is the tax rate on online gaming winnings under {topic}?",
             f"Net winnings from online games (including fantasy sports, poker, rummy) are taxed at a flat rate of 30% under Section 115BBJ. No basic exemption slab is available. This forms the basis of {topic}."),
            ("How is TDS calculated on online gaming under Section 194BA?",
             "TDS is deducted at 30% on net winnings at the time of withdrawal or at the end of the financial year. The platform computes net winnings based on deposit-withdrawal balances."),
            ("Can I deduct platform fees or internet costs from my gaming winnings?",
             "No. Under Section 58(4), no deductions for expenses or allowances are permitted against online gaming winnings."),
            ("Can I offset losses in one gaming application against winnings in another?",
             "No. Loss set-off is not allowed. Winnings in one game cannot be reduced by losses in another; each platform must deduct TDS independently on net winnings."),
            ("What is the GST rate on online money gaming?",
             "GST is levied at a flat rate of 28% on the full face value of the bets placed or entry fees paid by players to the platform."),
            ("How is 'Net Winnings' calculated under Rule 133?",
             "Net Winnings = (Total withdrawals during FY + Closing balance at year-end) - (Total deposits during FY + Opening balance at start of FY)."),
            ("Is eSports tournament prize money subject to Section 115BBJ?",
             "Yes, if the eSports tournament is played online on a digital network, winnings are taxed at 30% u/s 115BBJ. Physical eSports tournaments are taxed u/s 115BB."),
            ("Is there a minimum threshold for TDS deduction on online gaming?",
             "No. Unlike the legacy ₹10,000 threshold for offline lotteries, Section 194BA requires TDS deduction on any amount of net winnings, even if it is ₹1."),
            ("How are sign-up bonuses and referral credits taxed?",
             "If the bonus can be withdrawn as cash, it is included in net winnings and taxed at 30%. If it is restricted to gameplay, it is treated as a deposit credit and taxed upon withdrawal."),
            ("Which ITR form must online gamers file?",
             "Casual players must file ITR-2 to report gaming income under 'Schedule OS'. Professional gamers or streamers must file ITR-3 to report business/professional income."),
            ("What is the penalty for not reporting gaming winnings in ITR?",
             "Under Section 270A, a penalty of 50% of tax payable is levied for under-reporting, which increases to 200% if due to misreporting of income."),
            ("Are international gaming platform winnings taxable in India?",
             "Yes. Resident Indians must report global gaming winnings in their ITR and pay tax at 30% plus surcharge. Such foreign earnings must also be disclosed in Schedule FSI."),
            ("Is playing online rummy taxed differently from fantasy sports?",
             "No. Both are classified as online games and are governed by the same tax rate of 30% flat and 1% / 30% TDS rules."),
            ("How is TDS on non-cash prizes (like gadgets or holidays) handled?",
             "Before releasing the non-cash prize, the gaming platform must verify that the winner has deposited the 30% tax or deduct it from the player's cash wallet."),
            ("What are the company-side GST compliance rules for gaming platforms?",
             "Platforms must register as online money gaming providers, pay 28% GST on entry pool deposits, file GSTR-1 and GSTR-3B monthly, and deposit TDS u/s 194BA.")
        ]
        
    elif category == "gst_digital_economy":
        return [
            (f"What is OIDAR and how does GST apply to digital services under {topic}?",
             f"OIDAR covers services delivered over the internet with minimal human intervention (e.g. cloud subscriptions, SaaS). Foreign OIDAR providers must register and pay 18% GST on services to non-taxable consumers in India, which is critical for {topic}."),
            ("What is e-commerce TCS under Section 52 of GST?",
             "E-commerce aggregators (like Amazon or MakeMyTrip) must collect TCS at 1% on the net value of taxable supplies made through their platforms by third-party sellers."),
            ("How does Section 194O TDS apply to digital platforms?",
             "E-commerce operators must deduct TDS at 1% on the gross amount of sales facilitated for e-commerce participants. The threshold for individuals/HUFs is ₹5 lakh."),
            ("Do social media influencers and YouTubers need GST registration?",
             "Yes, if their total turnover from services (brand sponsorships, ad share, affiliate income) exceeds ₹20 lakh (₹10 lakh in special category states) in a FY."),
            ("Is dropshipping subject to GST in India?",
             "Yes. If the goods enter India, standard GST applies. If the goods are shipped directly from a foreign supplier to a foreign customer, it is an out-of-scope supply but documentation is required."),
            ("What is e-invoicing and who is it mandatory for?",
             "E-invoicing is mandatory for business-to-business (B2B) and export transactions of taxpayers with aggregate annual turnover exceeding ₹5 crore in any preceding FY."),
            ("What is the penalty for not generating e-invoices?",
             "Failure to generate a mandatory e-invoice attracts a penalty of 100% of the tax due or ₹10,000 per invoice, whichever is higher, and renders the invoice invalid for input tax credit (ITC)."),
            ("When is an E-way bill mandatory for digital and physical movement of goods?",
             "An E-way bill is required for transport of goods valued above ₹50,000. It is now seamlessly integrated with the e-invoicing system."),
            ("How are app developers taxed on Google Play or Apple App Store payouts?",
             "The app store acts as an e-commerce operator, deducting 1% TDS u/s 194O on gross sales. The developer must register for GST if aggregate turnover exceeds ₹20 lakh."),
            ("Are international SaaS subscriptions subject to GST?",
             "Yes, they are treated as import of OIDAR services. Business customers pay 18% GST under Reverse Charge Mechanism (RCM); retail customers are charged 18% IGST by the foreign provider."),
            ("Can e-commerce sellers opt for composition scheme?",
             "Yes, eligible e-commerce sellers of goods can opt for composition scheme for intra-state sales up to ₹1.5 crore, paying a flat tax of 1% or 5% without claiming ITC."),
            ("How do online booking portals handle CGST, SGST, and IGST?",
             "The place of supply is determined based on the location of the hotel/service. If in a different state from the portal registration, IGST applies; otherwise CGST and SGST apply."),
            ("What monthly filings must e-commerce operators complete?",
             "Operators must file GSTR-8 by the 10th of the following month to report TCS collected, GSTR-7 for TDS if applicable, and standard GSTR-1 and GSTR-3B returns."),
            ("How can digital content creators claim input tax credit (ITC)?",
             "Registered creators can claim ITC on business expenses like cameras, editing laptops, studio rent, and internet services, offsetting their GST output tax liability."),
            ("What are the registration requirements for foreign OIDAR providers?",
             "They must obtain a simplified single-point GST registration in India (Form GST REG-10) and file monthly GSTR-5A returns.")
        ]
        
    elif category == "estate_succession":
        return [
            (f"What is the difference between a nominee and a legal heir under {topic}?",
             f"A nominee is only a custodian/trustee who holds the assets until they are legally distributed. The legal heirs are the actual beneficial owners of the assets under personal succession laws, which is vital for {topic}."),
            ("Does share transmission trigger capital gains tax?",
             "No. Under Section 47(iii), transmission of shares, mutual funds, or other assets under a Will, gift, or inheritance is not treated as a transfer, hence zero capital gains tax applies."),
            ("How is a demat account processed after the death of the holder?",
             "If there is a nominee, the shares are transmitted by submitting a transmission form, death certificate, and KYC of the nominee. If no nominee, a succession certificate or probate of Will is required."),
            ("How is capital gains calculated when an inherited property is eventually sold?",
             "The cost of acquisition is the cost to the original owner who bought it (u/s 49(1)). The holding period is calculated from the date the original owner acquired the property."),
            ("Is there an inheritance tax or estate duty in India?",
             "No. Inheritance tax and estate duty were fully abolished in India in 1985. However, income earned from inherited assets (rent, dividends) is taxable."),
            ("What happens to joint bank accounts with 'Either or Survivor' clauses?",
             "The survivor gets immediate access to the funds, but they hold the money as a trustee. The legal heirs of the deceased can still claim their share under succession laws."),
            ("Are life insurance death claims taxable?",
             "Death claims paid to the nominee/heir are 100% tax-free under Section 10(10D), irrespective of whether the annual premium exceeded the sum-assured threshold."),
            ("Can a nominee sell inherited property or shares?",
             "No. A nominee cannot sell the property unless they are also the sole legal heir or have the consent/POA of all legal heirs."),
            ("What happens to the unabsorbed capital losses of a deceased person?",
             "Capital losses cannot be transferred to the legal heirs. They lapse upon the death of the taxpayer, except in cases of succession of a sole proprietorship business."),
            ("How is a succession certificate obtained?",
             "A succession certificate is issued by a civil court to verify the legal heirs of a deceased person who died intestate (without a Will) to claim movable properties like bank accounts."),
            ("What is the tax treatment of mutual fund units transmitted to legal heirs?",
             "The transmission is tax-free. When the heir eventually redeems the units, capital gains tax applies using the original owner's purchase cost and holding period."),
            ("How are dividends earned during the transmission process taxed?",
             "Dividends are taxable in the hands of the legal representative or the estate of the deceased until the transmission is officially completed, and later in the hands of the heir."),
            ("What is the significance of a probated Will?",
             "A probate is a court-certified copy of a Will. In metropolitan areas like Mumbai, Chennai, and Kolkata, probate is often mandatory to transmit real estate or large financial assets."),
            ("How is the cost of acquisition determined for property inherited before April 1, 2001?",
             "Heirs can opt for the Fair Market Value (FMV) of the property as of April 1, 2001, as their cost of acquisition, and apply indexation from FY 2001-02 onwards."),
            ("What are the tax rules for inheritance received under an HUF partition?",
             "Assets received by HUF members upon partial or complete partition are fully exempt from tax under Section 47(i) at the time of distribution.")
        ]
        
    elif category == "home_loan_deep":
        return [
            (f"Can joint owners both claim home loan deductions under {topic}?",
             f"Yes. Co-owners who are also co-borrowers can claim up to ₹2 lakh interest deduction u/s 24(b) and up to ₹1.5 lakh principal deduction u/s 80C each, in proportion to their ownership share. This is central to {topic}."),
            ("What is pre-construction interest and how is it claimed?",
             "Interest paid during the construction phase of a property is accumulated and claimed in 5 equal annual installments starting from the financial year in which construction is completed."),
            ("Is interest on a top-up home loan tax-deductible?",
             "Interest on a top-up loan is deductible u/s 24(b) only if the funds are utilized for the purchase, construction, repair, or renovation of the house. Principal repayment on top-up loans is not eligible for Section 80C."),
            ("How does home loan balance transfer affect tax benefits?",
             "Balance transfer does not affect benefits. The interest paid to the new lender remains deductible u/s 24(b). However, any prepayment penalties or new processing fees are not deductible."),
            ("What is the interest deduction limit on let-out properties?",
             "There is no cap u/s 24(b) on interest paid for let-out properties. However, any net loss under 'Income from House Property' that can be set off against other income heads is capped at ₹2 lakh per year."),
            ("What is Section 80EEA and who qualifies?",
             "Section 80EEA provides an additional ₹1.5 lakh interest deduction for first-time homebuyers of affordable properties (stamp value < ₹45L) with loans sanctioned between April 2019 and March 2022."),
            ("Can I claim both HRA and home loan interest tax benefits?",
             "Yes, if you live in a rented house in one city (or different part of the same city due to employment) and own a house that is self-occupied by family or vacant in another city."),
            ("Can NRIs claim home loan tax benefits in India?",
             "Yes, NRIs paying home loan EMIs for a property in India can claim Section 24(b) interest deduction and Section 80C principal deduction in their Indian tax returns."),
            ("Are municipal taxes paid on let-out property tax-deductible?",
             "Yes, municipal taxes actually paid during the financial year are deductible from the gross annual rent to determine the net annual value of the property."),
            ("What is the 30% standard deduction under Section 24(a)?",
             "For let-out or deemed let-out properties, a flat 30% deduction is allowed on the net annual value (rent minus municipal taxes) for repairs and maintenance, regardless of actual expenses."),
            ("What happens to tax benefits if I sell the property within 5 years?",
             "If you sell the house within 5 years of the end of the FY in which possession was obtained, all Section 80C principal deductions claimed in prior years will be treated as taxable income in the year of sale."),
            ("Is interest paid to a friend or relative for a home loan deductible?",
             "Yes, interest is deductible u/s 24(b) if the lender issues a certificate of interest. However, principal repayment is not eligible for Section 80C in this case."),
            ("What is the tax treatment of a second self-occupied house?",
             "Up to two houses can be declared as self-occupied (zero annual value). The aggregate interest deduction u/s 24(b) for both properties combined cannot exceed ₹2 lakh."),
            ("Can I claim home loan benefits under the New Tax Regime?",
             "No. Section 80C principal deductions are not available under the New Tax Regime. Also, interest deduction u/s 24(b) is not allowed for self-occupied properties under the new regime."),
            ("How do I calculate home loan eligibility for tax purposes?",
             "Deduction eligibility is strictly based on the interest certificate (actual interest accrued) and principal repayment statement issued by the financial institution for that FY.")
        ]
        
    elif category == "angel_tax_buyback_budget":
        return [
            (f"What is the status of Angel Tax under {topic}?",
             f"Angel Tax (Section 56(2)(viib)) is fully abolished for all classes of investors for shares issued on or after April 1, 2025 (FY 2025-26 onwards). This is a landmark change for {topic}."),
            ("How are legacy angel tax assessments defended?",
             "Disputes for prior AYs are still active. Startups must defend valuations using Rule 11UA (DCF/NAV reports) and utilize DPIIT recognition certificates to claim exemptions."),
            ("What is the buyback tax change effective October 1, 2024?",
             "The 20% tax paid by companies u/s 115QA is abolished. Instead, buyback proceeds are treated as deemed dividends in the hands of shareholders and taxed at normal slab rates."),
            ("How is the cost of acquisition adjusted for buybacks under the new rule?",
             "The shareholder can declare a capital loss equivalent to the cost of acquisition of the bought-back shares. This loss can be offset against other capital gains u/s 70/74."),
            ("What are the revised LTCG tax rates on shares?",
             "LTCG on listed equity is increased from 10% to 12.5% (with exemption raised to ₹1.25 lakh). LTCG on unlisted/foreign shares is 12.5% without indexation under Finance Act 2024."),
            ("What is the STCG tax rate on listed shares?",
             "STCG on listed equity shares is increased from 15% to 20% under the current Finance Act."),
            ("Does Section 56(2)(x) apply to share issuances?",
             "Yes. While Section 56(2)(viib) (angel tax on company) is abolished, Section 56(2)(x) (tax on recipient of shares for inadequate consideration) remains fully active."),
            ("What is Rule 11UA valuation and when is it required?",
             "Rule 11UA prescribes methods (NAV, DCF, Comparable Company Method) to value unlisted shares for FEMA, Section 56(2)(x), and legacy angel tax disputes."),
            ("What is the standard deduction under the New Tax Regime for FY 2025-26?",
             "The standard deduction is enhanced to ₹75,000 under the New Tax Regime (compared to ₹50,000 under the Old Regime)."),
            ("Is 6% Equalization Levy still applicable on digital ads?",
             "No. The 6% Equalization Levy (Google Tax) on online advertisement services is abolished from April 1, 2025."),
            ("What is Significant Economic Presence (SEP) for digital taxation?",
             "SEP taxes digital businesses without physical presence if Indian transactions exceed ₹2 crore or active users exceed 3 lakh, acting as the successor to Equalization Levy."),
            ("How are ULIP maturity proceeds taxed?",
             "Maturity proceeds of ULIPs issued after February 1, 2021, are taxable as capital gains if the annual aggregate premium exceeds ₹2.5 lakh."),
            ("What is the new Section 80CCD(2) employer NPS deduction limit?",
             "The deduction limit for employer contributions to NPS is raised to 14% of salary for private sector employees (matching government sector rules)."),
            ("What are the grandfathering rules for property capital gains tax?",
             "For properties acquired before July 23, 2024, taxpayers can choose between 12.5% without indexation or 20% with indexation to ensure fair taxation."),
            ("Is indexation available for unlisted shares under the new budget?",
             "No, indexation benefits are entirely removed for unlisted and foreign shares; all LTCG is taxed at a flat 12.5%.")
        ]
        
    else:
        return [
            (f"What are the MAT and ROC secretarial compliance rules under {topic}?",
             f"MAT applies at 15% u/s 115JB. Secretarial Audit in Form MR-3 is mandatory under Section 204 for public companies exceeding paid-up capital of ₹50 crore or turnover of ₹250 crore, which is a key part of {topic}."),
            ("What is the carry forward period for MAT credit?",
             "MAT credit (difference between MAT paid and normal corporate tax) can be carried forward and set off against normal tax for up to 15 assessment years."),
            ("Who must undergo a Secretarial Audit under Section 204?",
             "Listed companies, public companies with paid-up capital >= ₹50 crore or turnover >= ₹250 crore, or any company with outstanding bank/PFI loans >= ₹100 crore."),
            ("What is the penalty for delayed ROC filings?",
             "Late filing of AOC-4 (financials) and MGT-7 (annual returns) attracts a daily penalty of ₹100. Continuous default can lead to director disqualification for 5 years."),
            ("How does clubbing of income work for gifted assets?",
             "Under Section 64, if you gift assets to your spouse or minor child without adequate consideration, any income generated from those assets is clubbed and taxed with your income."),
            ("How do NRIs file country-specific tax returns?",
             "NRIs must file ITR-2 or ITR-3 in India to declare Indian-sourced income (savings interest, rental, capital gains). They can claim lower TDS u/s 90 by submitting a TRC and Form 10F."),
            ("What is UDIN and why is it mandatory?",
             "Unique Document Identification Number (UDIN) is a secure number generated by Chartered Accountants on the ICAI portal for all audit reports and certificates to prevent fraud."),
            ("When does a partnership firm or LLP require a tax audit?",
             "A tax audit u/s 44AB is required if the annual business turnover exceeds ₹1 crore (₹10 crore if 95% of transactions are digital) or professional receipts exceed ₹50 lakh."),
            ("How is GST applied on legal and accounting services?",
             "Legal services by advocates are subject to GST under Reverse Charge Mechanism (RCM) where the service recipient pays. Accounting and auditing services are charged 18% GST by the provider."),
            ("What are the core reporting points in CARO 2020?",
             "CARO 2020 requires auditors to report on inventory verification, fixed asset titles, loan defaults, internal audit systems, and statutory dues compliance."),
            ("Is Profession Tax mandatory for businesses in India?",
             "Yes, Profession Tax is state-specific. Employers must register for PT (Certificate of Enrollment & Registration) and deduct tax from employee salaries (typically ₹200/month)."),
            ("What is Section 44AD presumptive taxation?",
             "Eligible businesses with turnover under ₹2 crore (₹3 crore if digital) can declare 6% or 8% of turnover as taxable income, avoiding the need to maintain detailed books of accounts."),
            ("How are customs duties determined on imports?",
             "Customs duty is calculated based on the HSN code classification, transaction value of the goods, basic customs duty (BCD), social welfare surcharge, and IGST."),
            ("What is an AD Code registration and why is it needed?",
             "Authorized Dealer (AD) Code registration with port customs is mandatory for exporters to generate shipping bills and claim export benefits or GST refunds."),
            ("What are the board meeting requirements under the Companies Act?",
             "Every company must hold at least 4 board meetings in a calendar year, with the gap between two consecutive meetings not exceeding 120 days.")
        ]

# Generate list HTML for fact check bullets
def generate_fact_check_html(bullets):
    return "".join(f"<li>{esc(item)}</li>" for item in bullets)

# Generate HTML FAQ block
def generate_html_faqs(faqs):
    html_str = '<section class="wi-panel"><div class="lp-section-eyebrow">Questions People Ask</div><h2>Frequently Asked Questions</h2><div class="wi-detail-list">\n'
    for idx, (q, a) in enumerate(faqs, 1):
        html_str += f'  <div style="margin-bottom: 16px;">\n'
        html_str += f'    <h3 style="font-size: 16px; margin: 12px 0 6px;">{idx}. {esc(q)}</h3>\n'
        html_str += f'    <p style="color: var(--text-muted); font-size: 14px; margin: 0 0 10px; line-height: 1.6;">{esc(a)}</p>\n'
        html_str += f'  </div>\n'
    html_str += '</div></section>\n'
    return html_str

def page_html(page, all_slugs):
    slug = page['slug']
    title = title_from_slug(slug)
    type_name = ref_type(slug)
    
    # Category-specific check
    category, topic = get_category_and_topic(slug, page['batch'])
    
    # Brand Spacing updates applied directly:
    meta = f"{title} in India. Check facts, documents, official portals, deadlines, risks and expert brief before hiring on the WorkIndex work index."
    
    intent_name = intent(slug)
    bullets = topic_specific_bullets(slug, type_name, title)
    
    # Related links (exclude self)
    rel = related(slug, all_slugs)
    related_html = "".join(f'<a href="/seo-pages/{s}.html">{esc(title_from_slug(s))}</a>' for s in rel)
    
    hero_sub = 'Compare professionals with a clear local brief' if service_prefix(slug) else 'India-specific preparation guide'
    
    block_label = page['block']
    block_label = re.sub(r'^#+\s*', '', block_label)
    block_label = block_label.replace('`', '').replace('—', '-').replace('–', '-').replace('’', "'").replace('“', '"').replace('”', '"')
    
    # Fact checks
    cat_bullets = fact_check_bullets.get(category, [])
    if cat_bullets:
        fact_items = cat_bullets
    else:
        fact_items = list(set([
            official_context(type_name),
            'If a competitor page gives a fixed rate, penalty, date or exemption, verify it against the official source and your facts before copying it into a filing position.'
        ]))
        
    schema_data = {
        '@context': 'https://schema.org',
        '@graph': [
            { '@type': 'Organization', '@id': 'https://workindex.co.in/#organization', 'name': 'WorkIndex', 'alternateName': 'Work Index', 'url': 'https://workindex.co.in' },
            { '@type': 'WebPage', '@id': f"https://workindex.co.in/seo-pages/{slug}.html#webpage", 'url': f"https://workindex.co.in/seo-pages/{slug}.html", 'name': f"{title} | WorkIndex", 'description': meta },
            { '@type': 'BreadcrumbList', 'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'WorkIndex', 'item': 'https://workindex.co.in' },
                { '@type': 'ListItem', 'position': 2, 'name': title, 'item': f"https://workindex.co.in/seo-pages/{slug}.html" }
            ] },
            { '@type': 'FAQPage', 'mainEntity': [
                { '@type': 'Question', 'name': f"Is {title} final legal or tax advice?", 'acceptedAnswer': { '@type': 'Answer', 'text': 'No. This page is a preparation guide. Verify current law, portal utilities, notifications and your documents with a qualified professional.' } },
                { '@type': 'Question', 'name': 'What should I share with an expert?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Share entity type, city, period, income or turnover details, portal status, notices, documents available, deadline and exact output expected.' } },
                { '@type': 'Question', 'name': 'Can WorkIndex help compare experts?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. Post one requirement and compare relevant experts by scope, quote, assumptions, timeline and deliverables.' } }
            ] },
            { '@type': 'Service', 'name': title, 'serviceType': intent_name, 'provider': { '@id': 'https://workindex.co.in/#organization' }, 'areaServed': { '@type': 'Country', 'name': 'India' }, 'description': meta }
        ]
    }
    
    # Specific FAQs injection for FAQ pages in schema
    if slug.startswith('faq-'):
        faqs = get_specific_faqs(category, topic)
        if faqs:
            for item in schema_data['@graph']:
                if item.get('@type') == 'FAQPage':
                    item['mainEntity'] = [
                        {
                            "@type": "Question",
                            "name": q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": a
                            }
                        } for q, a in faqs
                    ]
                    break
                    
    schema_json = json.dumps(schema_data, separators=(',', ':'))
    
    # Build HTML body structures
    faq_body_html = ""
    if slug.startswith('faq-'):
        faqs = get_specific_faqs(category, topic)
        if faqs:
            faq_body_html = generate_html_faqs(faqs)
            
    html_content = f"""<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{esc(title)} | WorkIndex</title><meta name="description" content="{esc(meta)}"/><link rel="canonical" href="https://workindex.co.in/seo-pages/{slug}.html"/>
<meta property="og:title" content="{esc(title)} | WorkIndex"/><meta property="og:description" content="{esc(meta)}"/><meta property="og:url" content="https://workindex.co.in/seo-pages/{slug}.html"/><meta property="og:type" content="website"/>
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
<section class="wi-panel"><div class="lp-section-eyebrow">Care points</div><h2>Common mistakes to avoid</h2>{list_to_html(mistakes(slug, type_name))}</section>
{faq_body_html}</div><aside>
<section class="wi-panel"><div class="lp-section-eyebrow">Official checks</div><h2>Useful source portals</h2><div class="wi-related">{source_links(type_name)}</div></section>
<section class="wi-panel"><div class="lp-section-eyebrow">Hiring brief</div><h2>Ask experts these questions</h2>{list_to_html(['Which law, form, utility or notification are you relying on?', 'What documents are missing before you can finalise the work?', 'What is included in your quote and what is excluded?', 'What timeline, proof of filing and post-filing support will you provide?'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Related pages</div><h2>Explore related WorkIndex guides</h2><div class="wi-related">{related_html}</div></section>
</aside></div>
</main>
</body>
</html>
"""
    # Satisfy transition rule for AY 2026-27 + Income Tax Act, 2025 combinations
    if re.search(r'AY 2026-27', html_content, re.I) and re.search(r'Income Tax Act, 2025', html_content, re.I) and not re.search(r'Income-tax Act, 1961|1961 Act', html_content, re.I):
        html_content = html_content.replace(
            '<h2>Accuracy notes before you act</h2>',
            '<h2>Accuracy notes before you act</h2><p><strong>Note on transition:</strong> The Income Tax Act, 2025 transition from the legacy Income-tax Act, 1961 (1961 Act) applies from Tax Year 2026-27 onwards. The current AY 2026-27 filing remains under the 1961 Act.</p>'
        )
        
    return html_content

def extract_pages(file_name, batch_num):
    path = downloads / file_name
    if not path.exists():
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
            pages.append({'slug': line, 'file': file_name, 'block': current_block, 'batch': batch_num})
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

def get_bow(slug):
    words = slug.split('-')
    noise = {'in', 'for', 'and', 'vs', 'guide', 'services', 'service', 'india', '2026', '2027', 'ay', 'fy', 'best', 'top', 'affordable'}
    filtered = [w for w in words if w not in noise]
    normalized = []
    for w in filtered:
        if w.endswith('ies'):
            w = w[:-3] + 'y'
        elif w.endswith('s') and not w.endswith('ss'):
            w = w[:-1]
        normalized.append(w)
    return tuple(sorted(normalized))

def main():
    os.makedirs(seo_dir, exist_ok=True)
    
    # 1. Load existing database slugs (for strict duplicate removal)
    existing_seo_slugs = set(f[:-5].lower() for f in os.listdir(seo_dir) if f.endswith('.html'))
    sitemap_slugs = set()
    if sitemap_path.exists():
        urls = re.findall(r'<loc>https://workindex\.co\.in/seo-pages/(.*?)\.html</loc>', sitemap_path.read_text(encoding="utf-8"))
        sitemap_slugs = set(u.lower() for u in urls)
        
    progress_slugs = set()
    if progress_file.exists():
        progress = json.loads(progress_file.read_text(encoding="utf-8"))
        for url in progress.get("submitted", []):
            m = re.search(r'/seo-pages/(.*?)\.html', url)
            if m:
                progress_slugs.add(m.group(1).lower())
                
    urls_txt_slugs = set()
    if urls_file.exists():
        content = urls_file.read_text(encoding="utf-8").splitlines()
        for line in content:
            url = line.strip()
            if not url or url.startswith("#"):
                continue
            m = re.search(r'/seo-pages/(.*?)\.html', url)
            if m:
                urls_txt_slugs.add(m.group(1).lower())
                
    master_existing = existing_seo_slugs | sitemap_slugs | progress_slugs | urls_txt_slugs
    print(f"Master existing slugs pool: {len(master_existing)}")
    
    # Pre-calculate existing BOWs
    existing_bows = set(get_bow(s) for s in master_existing)
    
    # 2. Extract pages from batch 56 and 57
    raw_pages = []
    for num in batch_numbers:
        raw_pages.extend(extract_pages(f"workindex-seo-batch{num}.md", num))
        
    # 3. Deduplicate
    pages = []
    seen_slugs = set()
    seen_bows = set()
    duplicate_in_source = []
    duplicate_against_existing = []
    
    for page in raw_pages:
        slug_lower = page['slug'].lower()
        bow = get_bow(slug_lower)
        
        # Check exact and semantic duplicates against existing
        if slug_lower in master_existing or bow in existing_bows:
            duplicate_against_existing.append(page)
            continue
            
        # Check exact and semantic duplicates within the source batch
        if slug_lower in seen_slugs or bow in seen_bows:
            duplicate_in_source.append(page)
            continue
            
        seen_slugs.add(slug_lower)
        seen_bows.add(bow)
        pages.append(page)
        
    print(f"Extracted raw      : {len(raw_pages)}")
    print(f"Unique new to build: {len(pages)}")
    print(f"Duplicates in new  : {len(duplicate_in_source)}")
    print(f"Dupes vs existing  : {len(duplicate_against_existing)}")
    
    # 4. Aggregate all slugs (new + existing)
    all_slugs_set = master_existing.copy()
    for p in pages:
        all_slugs_set.add(p['slug'].lower())
    all_slugs_list = sorted(list(all_slugs_set))
    
    # 5. Generate unique pages in single-pass
    created = []
    for page in pages:
        out = seo_dir / f"{page['slug']}.html"
        html_data = page_html(page, all_slugs_list)
        with open(out, 'w', encoding='utf-8') as f:
            f.write(html_data)
        created.append(page['slug'])
        
    # 6. Rebuild sitemap
    sitemap = update_sitemap()
    
    # 7. Write outputs
    created_urls = [f"https://workindex.co.in/seo-pages/{slug}.html" for slug in created]
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(created_urls, f, indent=2)
        
    with open(source_path, 'w', encoding='utf-8') as f:
        json.dump({
            'batches': batch_numbers,
            'extracted': len(raw_pages),
            'unique': len(pages),
            'duplicateInSource': [{'slug': p['slug'], 'file': p['file']} for p in duplicate_in_source],
            'duplicateAgainstExisting': [{'slug': p['slug'], 'file': p['file']} for p in duplicate_against_existing],
            'created': created
        }, f, indent=2)
        
    print(json.dumps({
        'extracted': len(raw_pages),
        'unique': len(pages),
        'duplicateInSource': len(duplicate_in_source),
        'duplicateAgainstExisting': len(duplicate_against_existing),
        'created': len(created),
        'sitemapUrls': sitemap['total'],
        'seoPages': sitemap['seo'],
        'manifest': str(manifest_path.relative_to(root)),
        'source': str(source_path.relative_to(root))
    }, indent=2))

if __name__ == '__main__':
    main()
