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
manifest_path = root / "batches54-55-downloaded-indexnow-urls.json"
source_path = root / "batches54-55-downloaded-source-slugs.json"
progress_file = Path("C:/Ravish/indexer/progress.json")
urls_file = Path("C:/Ravish/indexer/urls.txt")

cta_url = "/?signup=true&role=client"
fact_date = "2026-06-23"
batch_numbers = [54, 55]

caps = {
    'ay': 'AY', 'ca': 'CA', 'cfo': 'CFO', 'cbic': 'CBIC', 'dsc': 'DSC', 'epf': 'EPF', 'esic': 'ESIC',
    'fema': 'FEMA', 'fy': 'FY', 'gst': 'GST', 'gstr': 'GSTR', 'hsn': 'HSN', 'huf': 'HUF', 'ims': 'IMS',
    'it': 'Income Tax', 'itr': 'ITR', 'itc': 'ITC', 'llp': 'LLP', 'lrs': 'LRS', 'ltcg': 'LTCG',
    'mat': 'MAT', 'mca': 'MCA', 'mis': 'MIS', 'msme': 'MSME', 'nbfc': 'NBFC', 'nri': 'NRI',
    'pan': 'PAN', 'pf': 'PF', 'posh': 'POSH', 'rbi': 'RBI', 'rcm': 'RCM', 'rera': 'RERA',
    'roc': 'ROC', 'sac': 'SAC', 'sebi': 'SEBI', 'sft': 'SFT', 'stcg': 'STCG', 'tcs': 'TCS',
    'tds': 'TDS', 'tan': 'TAN', 'udyam': 'Udyam', 'ptrc': 'PTRC', 'ptec': 'PTEC', 'vda': 'VDA', 'nft': 'NFT',
    'dtaa': 'DTAA', 'trc': 'TRC', 'hra': 'HRA', 'nps': 'NPS', 'espp': 'ESPP', 'rsu': 'RSU', 'paye': 'PAYE',
    'ira': 'IRA', 'cpf': 'CPF', 'fiu': 'FIU', 'p2p': 'P2P', 'vc': 'VC', 'sha': 'SHA', 'spa': 'SPA', 'ncd': 'NCD'
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
# 8 CATEGORY DATABASES & CLASSIFICATION
# ==========================================

def get_category_and_topic(slug, batch_num):
    # Extract clean topic
    topic = slug.replace('faq-', '').replace('blog-', '').replace('-guide-2026', '').replace('-complete-guide', '').replace('-guide', '').replace('-', ' ').title()
    topic = re.sub(r'\s+', ' ', topic).strip()
    
    if batch_num == 54:
        if re.search(r'rsu|espp|foreign-share|vesting|exercise|perquisite|broker|charles-schwab|robinhood|stock-option|foreign-stock|shares-vest|schedule-fa|black-money|w-8ben|workday-apportionment|restricted-stock', slug.lower()):
            return "rsu_espp_foreign", topic
        elif re.search(r'salary|pension|401k|paye|cpf|ira|h1b|move-back|mid-year|returning-to-india|foreign-pension|superannuation|w2-|w-2|employer-contribution', slug.lower()):
            return "foreign_salary_pension", topic
        else:
            return "localities_fundraising_litigation", topic
            
    elif batch_num == 55:
        if re.search(r'crypto|vda|wazirx|zebpay|coindcx|coinswitch|mudrex|bitbns|binance|kraken|coinbase|okx|bybit|kucoin|huobi|htx|mexc|staking|nft|defi|p2p|1-percent|carf|tax-reporting', slug.lower()):
            return "crypto_vda", topic
        elif re.search(r'dtaa|france|japan|ireland|hong-kong|switzerland|spain|italy|sweden|norway|denmark|zealand|belgium|finland|austria|israel|south-africa|qatar|bahrain|china|korea|russia|mexico|brazil|cyprus|treaty', slug.lower()):
            return "dtaa_countries", topic
        elif re.search(r'tds|tcs|194c|194i|194ia|194n|194o|194q|194r|194s|206c|quarterly-tds|late-deposit|section-40', slug.lower()):
            return "tds_sections", topic
        elif re.search(r'audit|account|bookkeep|tally|zoho|cfo|udin|networth|turnover-certificate|solvency-certificate|caro|44ab|statutory-audit|internal-audit|auditor-rotation|fraud-reporting', slug.lower()):
            return "audit_accounting", topic
        elif re.search(r'tax|slab|80c|87a|80d|80e|80u|89-|salary|pension|capital-gain|ltcg|stcg|notice|appeal|assessment|pan-|aadhaar|double-tax|residential-status|speculative|presumptive|senior-citizen|deduction|exemption|itr-2|itr-3|hra|rent|updated-return|139-8a|defective-return|presumptive-tax|doctor|lawyer|engineer|architect|consultant|youtuber|coach', slug.lower()):
            return "income_tax_2025_hra_itr", topic
        else:
            return "localities_fundraising_litigation", topic
            
    return None, topic

fact_check_bullets = {
    "rsu_espp_foreign": [
        "RSUs and ESPPs are taxed twice in India: first as a salary perquisite under Section 17 on the vesting/purchase date (based on FMV in INR), and second as capital gains when sold (LTCG at 12.5% if held for >24 months).",
        "For foreign/unlisted shares, the long-term holding period is 24 months, not 12 months. Surcharge and 4% cess apply to all stages.",
        "Under Rule 115, the foreign currency value must be converted using the SBI TT Buying Rate (TTBR) on the date of vesting/purchase.",
        "Schedule FA disclosure is mandatory for Resident and Ordinarily Resident (ROR) individuals every year on a calendar year basis (Jan-Dec). Failure to disclose attracts a ₹10 lakh flat penalty under the Black Money Act."
    ],
    "foreign_salary_pension": [
        "Global income (including foreign salary and pension) is fully taxable in India once an individual qualifies as a Resident and Ordinarily Resident (ROR) under Section 6.",
        "Mid-year movers and H1B returnees must count days precisely; if ROR, US/UK/Singapore earnings received during the year must be declared in India, with credit claimed via Form 67.",
        "Section 89A / Form 10-EE allows deferring tax on income from specified foreign retirement funds (like US 401k or UK pensions) until withdrawal to avoid mismatch timing.",
        "UAE salary is not taxable in UAE, so no tax credit is available. For an Indian resident, UAE salary is fully taxable in India under the DTAA without relief."
    ],
    "crypto_vda": [
        "Under Section 115BBH, VDA/crypto transfers are taxed at a flat rate of 30% on gains. No deductions for expenses (other than cost of acquisition) or set-off/carry-forward of losses are allowed.",
        "Section 194S requires a 1% TDS on crypto transfers. For P2P transactions, the buyer must deduct and file TDS.",
        "Offshore exchanges are subject to the same tax rules, and compliance is monitored under FIU-IND registration requirements.",
        "All transactions must be declared in Schedule VDA of ITR-2 or ITR-3. You cannot file ITR-1 or ITR-4 if you hold or trade VDAs."
    ],
    "dtaa_countries": [
        "DTAA relief under Section 90 requires obtaining a Tax Residency Certificate (TRC) from the respective foreign country and filing Form 10F online.",
        "Treaty provisions override domestic tax laws to the extent they are more beneficial to the taxpayer under Section 90(2).",
        "Most DTAAs limit the tax rate on dividends in the source country to 10% or 15% (compared to resident slabs or non-resident 20%).",
        "Business profits of a foreign enterprise are taxable in India under DTAAs only if it operates through a Permanent Establishment (PE) in India."
    ],
    "tds_sections": [
        "TDS thresholds must be verified: Section 194C (contractors, 1%/2%), Section 194I (rent, 10% build/2% plant, threshold ₹2.4L), Section 194-IA (property purchase, 1% above ₹50L).",
        "Section 194N levies TDS on cash withdrawals exceeding ₹1 crore (or ₹20 lakh for non-filers). Section 194Q levies 0.1% TDS on purchases exceeding ₹50 lakh.",
        "Section 194R levies 10% TDS on business benefits/perquisites exceeding ₹20,000 in value. Section 194S levies 1% TDS on crypto transfers.",
        "Failure to deduct/deposit TDS attracts interest at 1% / 1.5% per month and disallows 30% of the expenditure under Section 40(a)(ia)."
    ],
    "audit_accounting": [
        "Tax Audit under Section 44AB is mandatory if business turnover exceeds ₹1 crore (₹10 crore for 95% digital transactions) or professional receipts exceed ₹50 lakh (₹75 lakh for digital).",
        "Statutory Audit is mandatory for all registered companies (Private Limited, Public, OPC) under the Companies Act, 2013, regardless of capital or turnover.",
        "Failure to submit a Tax Audit report in Form 3CD by September 30 attracts a penalty of 0.5% of turnover up to ₹1.5 lakh under Section 271B.",
        "LLPs must undergo audit under the LLP Act if their annual turnover exceeds ₹40 lakh or partner contributions exceed ₹25 lakh."
    ],
    "income_tax_2025_hra_itr": [
        "The default New Tax Regime slabs apply automatically for FY 2025-26 unless you actively opt for the Old Tax Regime. Standard deduction is enhanced to ₹75,000 under the New Regime.",
        "Section 139(8A) allows filing an Updated Return (ITR-U) within 24 months from the end of the AY, subject to an additional tax of 25% or 50% (ITR-U cannot claim a refund or increase loss).",
        "HRA exemption under Section 10(13A) is only available under the Old Tax Regime. Landlord PAN is mandatory if annual rent exceeds ₹1,00,000.",
        "Professionals (doctors, lawyers, YouTubers, consultants) earning professional fees must file ITR-3, or ITR-4 if choosing presumptive taxation under Section 44ADA."
    ],
    "localities_fundraising_litigation": [
        "Startup fundraising involves VC term sheets, Shareholder Agreements (SHA), valuation reports under DCF method, and compliance with angel tax (Section 56(2)(viib)) rules.",
        "DPIIT-registered startups get tax holiday benefits under Section 80-IAC and exemption from angel tax under Section 56(2)(viib).",
        "Tax litigation requires filing an appeal in Form 35 before the CIT(A) within 30 days. Stay of demand typically requires paying 20% of the disputed demand.",
        "Local CA firms in Bangalore localities (Koramangala, HSR Layout, Whitefield) specialize in startup incorporation, VC funding, and FEMA compliances."
    ]
}

def get_specific_faqs(category, topic):
    # Category 1: RSU & ESPP
    if category == "rsu_espp_foreign":
        return [
            ("What is the tax treatment of RSUs (Restricted Stock Units) in India?",
             "RSUs are taxed at two stages: (1) At vesting: the Fair Market Value (FMV) of the vested shares is treated as perquisite income under Section 17(2)(vi) and taxed at your slab rate. (2) At sale: capital gains tax applies on the difference between the sale price and the FMV on the vesting date."),
            ("What is the holding period for Long-Term Capital Gains (LTCG) on foreign shares?",
             "Foreign shares (such as US stocks) are treated as unlisted shares in India. Therefore, the holding period for LTCG is 24 months or more (not 12 months). LTCG is taxed at a flat rate of 12.5% without indexation."),
            ("How is the perquisite value of RSUs converted to Indian Rupees (INR)?",
             "As per Rule 115 of the Income-tax Rules, the foreign currency value (e.g., USD) of the RSUs must be converted into INR using the telegraphic transfer buying rate (TTBR) of the State Bank of India (SBI) on the date of vesting."),
            ("What is 'sell-to-cover' and how does it affect my Form 16?",
             "Sell-to-cover is a mechanism where your broker automatically sells a portion of your vested shares (typically ~30%) to cover the perquisite TDS. The remaining ~70% of shares are deposited in your account. However, your Form 16 will show 100% of the vested value as perquisite salary income."),
            (f"Is Schedule FA disclosure mandatory for RSUs and ESPPs in relation to {topic}?",
             f"Yes. Resident and Ordinarily Resident (ROR) individuals must disclose all foreign assets, including vested RSUs, ESPP shares, and broker accounts, in Schedule FA (Foreign Assets) of their ITR. This is a critical compliance check for {topic}."),
            ("What is the calendar year basis for Schedule FA?",
             "Schedule FA reporting follows the calendar year (January 1 to December 31) of the year preceding the relevant Assessment Year, not the Indian financial year (April to March). Ensure all holdings during that calendar year are disclosed."),
            ("Which ITR form should I file if I hold foreign shares or RSUs?",
             "You cannot file ITR-1 (Sahaj) if you own foreign shares or have foreign assets. You must file either ITR-2 (for salary/capital gains) or ITR-3 (if you have business/professional income)."),
            ("How does W-8BEN help Indian residents with US brokers?",
             "Submitting a W-8BEN form to your US broker certifies your tax residency in India, reducing or eliminating US withholding tax on stock sales and interest under the India-US DTAA. No US tax is withheld on RSU vesting."),
            ("What is the tax treatment of ESPPs (Employee Stock Purchase Plans)?",
             "ESPPs are taxed similarly to RSUs: (1) At purchase: the discount (difference between FMV and purchase price) is taxed as a salary perquisite. (2) At sale: capital gains tax applies on the difference between sale price and FMV at purchase."),
            ("How is the cost of acquisition determined for foreign shares?",
             "Under Section 49(2AA), the cost of acquisition for calculating capital gains on the sale of RSUs/ESPPs is the Fair Market Value (FMV) on the vesting/purchase date that was already taxed as a perquisite."),
            ("How is work apportionment handled if I moved between countries during vesting?",
             "If you spent part of the vesting period outside India, the perquisite value is apportioned based on the number of days worked in India. The foreign-sourced portion is taxable in the other country, and you can claim DTAA relief to avoid double taxation."),
            ("Are unvested stock options or RSUs disclosable in Schedule FA?",
             "No. Only vested shares need to be disclosed in Schedule FA. Unvested RSUs or options are not assets until they vest or are exercised, so they do not require disclosure."),
            ("What is the tax treatment of dividend income from US stocks in India?",
             "Dividends from foreign shares are taxed in India at your slab rate under the head 'Income from Other Sources.' Any US withholding tax (typically 25% under treaty) can be claimed as a Foreign Tax Credit (FTC) by filing Form 67."),
            ("What is the penalty for not reporting foreign dividend income?",
             "Undisclosed foreign income is taxed at 30% under the Black Money Act, along with a 300% penalty and interest. Voluntary compliance through proper disclosure in ITR Schedule FA is critical."),
            ("Can I claim indexation benefit on the sale of foreign shares?",
             "No. Under the latest tax amendments, indexation benefits are no longer available for the sale of unlisted/foreign shares. LTCG is taxed at a flat 12.5%.")
        ]
    
    # Category 2: Foreign Salary & Pension
    elif category == "foreign_salary_pension":
        return [
            ("How is my tax residency determined when returning to India mid-year?",
             "Under Section 6 of the Income Tax Act, you are a Resident if you are in India for 182 days or more in the FY, or 60 days or more in the FY plus 365 days or more in the preceding 4 years. If you qualify as Resident, your global income is taxable in India."),
            (f"Is my H1B salary earned in the US taxable in India, and how does it affect {topic}?",
             f"If you qualify as a Resident of India for the full financial year, your global income, including salary earned in the US, is taxable in India. However, you can claim credit for taxes paid in the US using Form 67 under the India-US DTAA. This is highly relevant for {topic} scenarios."),
            ("How do I avoid double taxation on foreign salary?",
             "You can claim relief under Section 90/91 of the Income Tax Act by filing Form 67 online before the due date of your ITR. This form provides details of the foreign income and the taxes paid abroad to claim Foreign Tax Credit (FTC)."),
            ("What is Section 89A relief for foreign retirement accounts?",
             "Section 89A allows Indian residents to defer taxation on income earned in specified foreign retirement funds (like US 401k or UK pensions) until withdrawal, preventing double taxation arising from mismatching tax years. Form 10-EE must be filed."),
            ("How is a US 401(k) account taxed when I return to India?",
             "Under Article 20 of the India-US DTAA, pension distributions from a US 401(k) are taxable in India (resident country). If the US broker deducts withholding tax, you can claim a Foreign Tax Credit (FTC) in India."),
            ("What is the tax treatment of UK salary and PAYE in India?",
             "If you are an Indian resident, UK salary is taxable. You can claim credit for the PAYE (Pay As You Earn) tax deducted in the UK by filing Form 67 and reporting the income in ITR Schedule FSI and TR."),
            ("Is UAE salary taxable in India for returned residents?",
             "Since the UAE does not levy personal income tax, no tax credit is available. If you return to India and qualify as a resident, UAE salary received or accrued after becoming a resident is fully taxable in India at your slab rate."),
            ("How does the India-Singapore DTAA affect CPF (Central Provident Fund) withdrawals?",
             "CPF contributions and earnings are exempt from tax in Singapore. For an Indian resident, CPF distributions are taxable in India as pension/other income. DTAA benefits should be analyzed based on residency status during contribution vs withdrawal."),
            ("What is the tax status of a Roth IRA in India?",
             "Roth IRA distributions are tax-free in the US. However, India does not have a direct equivalent exemption, and such distributions may be taxed as 'Income from Other Sources' in India. You must check treaty rules and professional advice."),
            ("How do I convert foreign salary in USD/GBP to INR for ITR filing?",
             "You must use the telegraphic transfer buying rate (TTBR) of the State Bank of India (SBI) on the last day of the month in which the salary was due or paid, as per Rule 115."),
            ("What is Form 10-EE and when is it filed?",
             "Form 10-EE is the electronic form filed under Rule 21AAA to claim tax deferral on income from specified foreign retirement funds under Section 89A. It must be filed before the due date of ITR."),
            ("Can I claim credit for foreign state taxes in India?",
             "Generally, the Indian tax department allows credit only for federal income taxes paid abroad, not state or local taxes, under most DTAAs. However, judicial precedents have occasionally allowed state tax credit; check specific DTAA clauses."),
            ("What is the tax treatment of foreign relocation allowances?",
             "Relocation allowances received from a foreign employer are taxable in India if you are a resident, unless they represent actual reimbursement of travel and moving expenses supported by bills."),
            ("What happens if I fail to file Form 67 before filing ITR?",
             "Filing Form 67 is a mandatory procedural requirement for claiming Foreign Tax Credit. If you file ITR without filing Form 67 first, the tax department may disallow your FTC claim, resulting in a tax demand."),
            ("How does India tax foreign interest income (e.g. US bank savings)?",
             "Foreign bank interest is fully taxable in India under 'Income from Other Sources' at slab rates. It must be declared in Schedule OS and Schedule FA.")
        ]
        
    # Category 3: Crypto / VDA
    elif category == "crypto_vda":
        return [
            ("How is crypto/VDA income taxed in India?",
             "Under Section 115BBH, income from the transfer of Virtual Digital Assets (VDAs) is taxed at a flat rate of 30% (plus applicable surcharge and 4% cess). No deductions for expenses (other than cost of acquisition) or allowances are permitted."),
            ("Can I offset losses in one coin against gains in another?",
             "No. The Income Tax Act explicitly prohibits the set-off of losses from the transfer of one VDA against gains from the transfer of another VDA. Each transaction is taxed in isolation."),
            ("Can I carry forward crypto losses to future years?",
             "No. Crypto/VDA losses cannot be carried forward to subsequent financial years to be offset against future crypto profits."),
            ("What is the TDS rate on crypto transactions under Section 194S?",
             "Section 194S mandates a 1% TDS on the transfer of VDAs. The threshold for deduction is ₹50,000 in a FY for specified persons (individuals/HUFs with no business income or low turnover) and ₹10,000 for others."),
            (f"Who is responsible for deducting TDS on P2P crypto trades for {topic}?",
             f"In Peer-to-Peer (P2P) trades, the buyer is responsible for deducting 1% TDS before paying the seller. For {topic}, on domestic exchanges, the platform automatically handles TDS compliance, but on international platforms, the user must comply."),
            ("What are the tax implications of trading on international exchanges (like Binance)?",
             "Yes. Any Indian resident trading on international exchanges is subject to the 30% flat tax on gains and the 1% TDS requirement. Transactions must be reported in Schedule VDA of the ITR."),
            ("How is crypto staking income taxed in India?",
             "Staking rewards are taxed twice: (1) At receipt: the market value of the rewarded coins is taxed as business income or other sources at slab rates. (2) At transfer: the sale of the rewarded coins is subject to the 30% flat VDA tax."),
            ("What is Schedule VDA in the ITR form?",
             "Schedule VDA is a dedicated schedule introduced in ITR-2 and ITR-3 where taxpayers must disclose transaction-wise details of crypto/VDA sales, including date of acquisition, date of transfer, cost of acquisition, and sale consideration."),
            ("How are NFTs (Non-Fungible Tokens) taxed in India?",
             "NFTs are classified as Virtual Digital Assets (VDAs) and are taxed under the same VDA rules: 30% flat tax on transfer gains, 1% TDS, and zero set-off of losses."),
            ("Is gifting crypto taxable in India?",
             "Yes. If you gift crypto/VDAs to a non-relative, the recipient is taxed on the value under 'Income from Other Sources' if the total gift value exceeds ₹50,000. For the donor, the transfer may still trigger VDA tax based on FMV."),
            ("What is the FIU (Financial Intelligence Unit) registration requirement for exchanges?",
             "To operate legally in India, both domestic and offshore crypto exchanges must register with the FIU-IND as reporting entities and comply with anti-money laundering (PMLA) rules."),
            ("Are mining rewards taxable?",
             "Yes. Mining rewards are taxable at slab rates upon receipt under 'Income from Other Sources' or business income. The cost of mining (electricity, rigs) is not deductible against the subsequent 30% tax on transfer."),
            ("What happens if I fail to report crypto transactions in my ITR?",
             "Non-reporting attracts high penalties, interest under Section 234A/B/C, and exposure to scrutiny or search operations under the Black Money Act or Income Tax Act."),
            ("Is utility token or stablecoin transfer subject to VDA tax?",
             "Yes. The definition of Virtual Digital Assets under Section 2(47A) is broad and covers all forms of cryptographic tokens, including stablecoins (USDT, USDC) and utility tokens."),
            ("Can a freelancer receiving payment in crypto claim exemptions?",
             "Freelancers receiving VDA payments must treat the FMV of the token as professional receipts taxable at slab rates. Any subsequent transfer of the token is taxed at 30% under Section 115BBH.")
        ]
        
    # Category 4: DTAA Countries
    elif category == "dtaa_countries":
        return [
            ("What is a Double Taxation Avoidance Agreement (DTAA)?",
             "DTAA is a tax treaty signed between India and another country to prevent taxpayers from being taxed twice on the same income. It defines taxing rights for salary, business profits, dividends, interest, and capital gains."),
            (f"How do I claim DTAA benefits in India, especially for {topic}?",
             f"To claim treaty benefits for {topic}, you must obtain a Tax Residency Certificate (TRC) from the government of the foreign country and file Form 10F online on the Indian e-filing portal."),
            ("What is Form 10F under the Income Tax Act?",
             "Form 10F is a self-declaration required under Section 90(4) to provide details like nationality, tax identification number, and address when claiming DTAA relief, particularly when certain details are not printed on the TRC."),
            ("Does DTAA override domestic tax laws?",
             "Yes. Under Section 90(2), the provisions of the DTAA override the domestic Income Tax Act to the extent they are more beneficial to the taxpayer."),
            ("What is the significance of the Tax Residency Certificate (TRC)?",
             "The TRC is the official certificate issued by the tax authority of a foreign nation certifying that you are a resident of that country for tax purposes. Without a valid TRC, you cannot claim DTAA benefits in India."),
            ("How are dividends taxed under DTAAs compared to domestic rates?",
             "Under domestic law, dividends are taxed at slab rates for residents and 20% for non-residents. Most DTAAs limit the tax rate on dividends in the source country to 10% or 15%, providing significant tax savings."),
            ("What is a Permanent Establishment (PE) under DTAAs?",
             "A Permanent Establishment is a fixed place of business through which the enterprise carries out its activities. Under DTAAs, a foreign company's business profits are taxable in India only if it operates through a PE in India."),
            ("How is capital gains tax handled under DTAAs?",
             "Capital gains taxing rights vary by treaty. Some treaties (like the legacy Mauritius/Singapore treaties) historically exempted capital gains, but most modern treaties allow the source country (India) to tax capital gains on shares."),
            ("What is the Multilateral Instrument (MLI)?",
             "The MLI is an international convention designed to implement treaty-based measures to prevent base erosion and profit shifting (BEPS). It modifies existing DTAAs to introduce anti-abuse rules and the Principal Purpose Test (PPT)."),
            ("How is professional or independent service income taxed under DTAAs?",
             "Income from independent professional services is generally taxable in the resident country unless the professional has a fixed base regularly available to them in the other country, or stays there for a specified period (e.g. 90 or 183 days)."),
            ("Can an NRI claim DTAA benefits on NRO account interest?",
             "Yes. NRO interest is subject to 30% TDS under domestic law. NRIs can submit their TRC and Form 10F to their bank to reduce the TDS rate to 10% or 15% under the respective DTAA."),
            ("What is the difference between Section 90 and Section 91 relief?",
             "Section 90 applies to relief claimed under a bilateral DTAA signed between India and another country. Section 91 provides unilateral tax relief for taxes paid in a country with which India does *not* have a DTAA."),
            ("How does the DTAA affect teachers or researchers visiting India?",
             "Most DTAAs contain a specific article exempting visiting teachers, researchers, or students from tax in the host country for a limited period (typically 2 to 3 years) on remittances or income received for teaching/research."),
            ("What is the Mutual Agreement Procedure (MAP)?",
             "MAP is a dispute resolution mechanism under DTAAs where the competent authorities of both countries negotiate to resolve cases of taxation not in accordance with the treaty, such as transfer pricing adjustments."),
            ("Is Form 67 required for claiming treaty benefits?",
             "Yes. If you are an Indian resident claiming credit for taxes paid abroad under a DTAA, you must submit Form 67 online before filing your ITR.")
        ]
        
    # Category 5: TDS Sections
    elif category == "tds_sections":
        return [
            (f"What is the applicability of TDS under Section {topic}?",
             f"The TDS rate and threshold depend on the specific section. For example, Section 194C (contractors, 1%/2%), Section 194I (rent, 10% build/2% plant, threshold ₹2.4L), Section 194-IA (property purchase, 1% above ₹50L), Section 194Q (buyer TDS, 0.1% above ₹50L)."),
            ("What is Section 194C TDS on contractors?",
             "Section 194C requires TDS to be deducted at 1% for individuals/HUFs and 2% for other entities on payments to contractors. The threshold is ₹30,000 for a single transaction or ₹1,00,000 in aggregate in a financial year."),
            ("What is Section 194I TDS on rent?",
             "Section 194I applies to rent payments exceeding ₹2,40,000 in a FY. The rates are: 10% for renting land, buildings, or furniture; and 2% for renting plant, machinery, or equipment."),
            ("What is Section 194-IA TDS on property sale?",
             "Section 194-IA requires the buyer of immovable property to deduct 1% TDS if the sale consideration or stamp duty value of the property is ₹50 lakh or more. TDS must be paid using Form 26QB."),
            ("What is Section 194N TDS on cash withdrawals?",
             "Section 194N applies to cash withdrawals from banks/post offices exceeding ₹1 crore in a FY (rate is 2%). For non-filers of ITR, a lower threshold of ₹20 lakh triggers 2% TDS, and 5% TDS applies above ₹1 crore."),
            ("What is Section 194O TDS on e-commerce operators?",
             "Section 194O requires e-commerce platforms to deduct 1% TDS on the gross amount of sales facilitated for e-commerce participants. The threshold is ₹5 lakh for individuals/HUFs."),
            ("What is Section 194Q TDS on purchase of goods?",
             "Section 194Q requires buyers with turnover exceeding ₹10 crore to deduct 0.1% TDS on purchases of goods from a seller exceeding ₹50 lakh in a financial year."),
            ("What is Section 194R TDS on business benefits or perquisites?",
             "Section 194R requires a TDS of 10% on the value of any benefit or perquisite arising from business or profession, if the aggregate value exceeds ₹20,000 in a FY."),
            ("What is Section 194S TDS on VDA/crypto transfers?",
             "Section 194S mandates 1% TDS on the transfer of Virtual Digital Assets. The threshold is ₹50,000 for specified persons (individuals/HUFs) and ₹10,000 for other buyers."),
            ("What happens if I fail to deduct TDS under these sections?",
             "Non-deduction attracts 1% interest per month from the due date to the actual deduction date. Under Section 40(a)(ia), 30% of the corresponding expenditure is disallowed as a tax deduction for the buyer."),
            ("What is the penalty for late deposit of TDS?",
             "Delayed deposit of TDS attracts interest at 1.5% per month or part of a month from the date of deduction to the actual payment date. Late filing of quarterly TDS returns attracts a late fee of ₹200 per day under Section 234E."),
            ("How does a payee claim credit for TDS deducted?",
             "The deducted TDS is deposited against the payee's PAN and appears in their Form 26AS/AIS. The payee can claim this credit while filing their annual ITR to reduce final tax liability."),
            ("Can a payee get a lower or nil TDS certificate?",
             "Yes. Under Section 197, a payee can apply to the Assessing Officer in Form 13 for a certificate authorizing lower or nil TDS deduction if their estimated total tax liability is nil or lower than the TDS rate."),
            ("What is the TDS rate if the payee has no PAN?",
             "Under Section 206AA, if the payee does not furnish their PAN to the deductor, the TDS must be deducted at the higher of: the rate specified in the Act, the rate in force, or a flat 20% (or 5% for certain sections)."),
            ("What is the difference between Section 194Q TDS and Section 206C(1H) TCS?",
             "Section 194Q is TDS deducted by the buyer. Section 206C(1H) is TCS collected by the seller. If both apply to a transaction, the buyer's TDS obligation under Section 194Q takes priority over the seller's TCS obligation.")
        ]
        
    # Category 6: Audit & Accounting
    elif category == "audit_accounting":
        return [
            (f"What is the role of statutory and tax audits in relation to {topic}?",
             f"A Statutory Audit ensures financial statement compliance under the Companies Act, while a Tax Audit under Section 44AB ensures tax compliance for {topic} activities based on specific turnover thresholds."),
            ("What is the threshold for a mandatory Tax Audit under Section 44AB?",
             "Under Section 44AB, a Tax Audit is mandatory if a business's annual turnover exceeds ₹1 crore (or ₹10 crore if 95% of transactions are digital). For professionals, the threshold is ₹50 lakh (or ₹75 lakh if 95% of receipts are digital)."),
            ("Is Statutory Audit mandatory for all companies in India?",
             "Yes. Under the Companies Act, 2013, a Statutory Audit is mandatory for all registered companies (Private Limited, Public, OPC), regardless of their share capital, turnover, or business activity."),
            ("What is the difference between a Statutory Audit and a Tax Audit?",
             "A Statutory Audit focuses on financial statement accuracy under the Companies Act (for shareholders). A Tax Audit focuses on compliance with tax rules and verification of Form 3CD disclosures under the Income Tax Act."),
            ("What is the due date for submitting a Tax Audit report?",
             "The Tax Audit report (Form 3CA/3CB and 3CD) must be submitted on the e-filing portal on or before September 30 of the relevant Assessment Year."),
            ("What is the penalty for not getting books audited under Section 44AB?",
             "Failure to get books audited attracts a penalty under Section 271B, which is the lower of: 0.5% of total sales/turnover or gross receipts, or ₹1,50,000."),
            ("What is the role of an Internal Auditor under the Companies Act?",
             "Under Section 138, specific classes of listed and unlisted public/private companies must appoint an internal auditor to evaluate and improve risk management, internal controls, and governance."),
            ("What is CARO 2020 and which companies does it apply to?",
             "CARO (Companies Auditor's Report Order) requires statutory auditors to report on specific matters like asset verification, inventory, related-party transactions, and internal audits. It applies to all public and private companies, excluding OPCs, small companies, and specific sectors."),
            ("Is an audit mandatory for a Limited Liability Partnership (LLP)?",
             "Under the LLP Act, 2008, an LLP must get its accounts audited by a Chartered Accountant if its annual turnover exceeds ₹40 lakh or its partner contribution/capital exceeds ₹25 lakh."),
            ("What is the due date for filing ROC Form AOC-4 and MGT-7?",
             "Form AOC-4 (financial statements) must be filed with the ROC within 30 days of the AGM. Form MGT-7 (annual return) must be filed within 60 days of the AGM."),
            ("What is the consequence of delayed ROC filing?",
             "Delayed filing of Form AOC-4 and MGT-7 attracts a late fee of ₹100 per day per form. Persistent default can lead to director disqualification and striking off of the company."),
            ("What accounting standards must Indian companies follow?",
             "Companies must follow Accounting Standards (AS) or Indian Accounting Standards (Ind AS) notified under Section 133 of the Companies Act. Ind AS is aligned with global IFRS and is mandatory for listed and large companies (net worth >= ₹250cr)."),
            ("What is a Cost Audit, and who needs it?",
             "Under Section 148, companies engaged in manufacturing specific regulated or non-regulated sectors must undergo a Cost Audit by a Cost Accountant if their turnover exceeds specified limits."),
            ("Can a proprietor opt for presumptive taxation to avoid a Tax Audit?",
             "Yes. Under Section 44AD/44ADA, eligible proprietors can declare presumptive profits (8%/6% for business, 50% for profession) to avoid maintaining books and undergoing tax audits, provided their turnover is below thresholds."),
            ("What is the statutory auditor's duty regarding fraud reporting?",
             "Under Section 143(12), if the auditor has reason to believe that a fraud involving ₹1 crore or more is being committed against the company by its officers/employees, they must report it to the Central Government (MCA) within 60 days.")
        ]
        
    # Category 7: Income Tax 2025, HRA, ITR Forms
    elif category == "income_tax_2025_hra_itr":
        return [
            ("What is the default tax regime for FY 2025-26 (AY 2026-27)?",
             "The New Tax Regime is the default tax regime. Tax slabs are: up to ₹4 lakh (Nil), ₹4L to ₹8L (5%), ₹8L to ₹12L (10%), ₹12L to ₹16L (15%), ₹16L to ₹20L (20%), ₹20L to ₹24L (25%), and above ₹24L (30%)."),
            ("What is Section 139(8A) Updated Return (ITR-U)?",
             "Section 139(8A) allows taxpayers to file an Updated Return (ITR-U) within 24 months from the end of the relevant Assessment Year to correct omissions or errors, subject to paying additional tax."),
            ("What is the additional tax rate for filing an ITR-U?",
             "The additional tax is 25% of the aggregate tax and interest if filed within 12 months from the end of the relevant Assessment Year, and 50% if filed between 12 and 24 months."),
            ("Can I file an ITR-U to claim a tax refund?",
             "No. An Updated Return (ITR-U) cannot be filed if it results in a tax refund, increases a refund, or increases/reports a loss compared to the original return. It is solely for declaring additional income."),
            (f"What is the HRA (House Rent Allowance) exemption calculation formula for {topic}?",
             f"HRA exemption under Section 10(13A) is the minimum of: (1) Actual HRA received, (2) Rent paid minus 10% of basic salary, or (3) 50% of basic salary (for metro cities) or 40% (for non-metro cities). This affects {topic} directly."),
            ("Is HRA exemption available under the default New Tax Regime?",
             "No. House Rent Allowance (HRA) exemption is not available under the New Tax Regime. It can only be claimed if you actively opt for the Old Tax Regime."),
            ("When is the landlord's PAN mandatory for HRA exemption?",
             "It is mandatory to provide the landlord's PAN to your employer to claim HRA exemption if the annual rent paid exceeds ₹1,00,000 (approx. ₹8,333 per month)."),
            ("Can I pay rent to my parents to claim HRA exemption?",
             "Yes. You can pay rent to your parents and claim HRA exemption, provided they own the property, you pay them through bank transfer/cheque, they report it as rental income in their ITR, and there is a valid rental agreement."),
            ("What is the difference between ITR-2 and ITR-3?",
             "ITR-2 is for individuals/HUFs who do not have income from business or profession. ITR-3 is mandatory for individuals/HUFs who have income from business or profession (such as partnership firm partners, freelancers, or sole proprietors)."),
            ("Which ITR form must a YouTuber, blogger, or digital creator file?",
             "Digital creators earning from ad revenues or sponsorships have business/professional income. They must file ITR-3 (or ITR-4 if they opt for presumptive taxation under Section 44ADA)."),
            ("How does presumptive taxation under Section 44ADA benefit professionals?",
             "Eligible professionals (lawyers, doctors, engineers, consultants) with gross receipts up to ₹50 lakh (₹75 lakh if 95% of receipts are digital) can declare 50% of gross receipts as taxable income, eliminating the need to maintain books."),
            ("What is the Standard Deduction for salaried taxpayers in FY 2025-26?",
             "The standard deduction is ₹75,000 under the New Tax Regime, and ₹50,000 under the Old Tax Regime."),
            ("How is a defective return notice under Section 139(9) handled?",
             "If you receive a defective return notice, you must respond online on the e-filing portal within 15 days (or seek extension) by filing a corrected return. Failure to respond will make your return invalid."),
            ("What is Section 115BAC?",
             "Section 115BAC is the legal section governing the rates and rules of the New Tax Regime for individuals, HUFs, and cooperative societies."),
            ("What is the rebate under Section 87A for FY 2025-26?",
             "Under the New Tax Regime, resident individuals with total taxable income up to ₹12,00,000 receive a full tax rebate of up to ₹60,000 under Section 87A.")
        ]
        
    # Category 8: Localities, Fundraising, Litigation
    elif category == "localities_fundraising_litigation":
        return [
            ("What is the first step for a startup to raise VC funding in India?",
             "Startups must ensure clean corporate governance, register for DPIIT startup recognition, prepare a detailed financial model, and negotiate a non-binding Term Sheet with prospective venture capital investors."),
            ("What is a Term Sheet in venture capital transactions?",
             "Tax, legal, and operational terms are negotiated here. A Term Sheet outlines the valuation, investment amount, liquidation preference, and voting rights of the VC investor."),
            ("What is a Shareholder Agreement (SHA) and why is it important?",
             "An SHA is a binding contract among a company's shareholders that defines their rights, duties, board seat representation, voting rules, and restrictions on share transfers (like Right of First Refusal and Tag-Along/Drag-Along rights)."),
            ("What is the significance of DPIIT Startup Recognition?",
             "DPIIT recognition grants startups eligibility for significant government benefits, including tax holidays under Section 80-IAC, angel tax exemptions under Section 56(2)(viib), relaxed procurement norms, and fast-track IP filing."),
            ("What is the angel tax exemption under Section 56(2)(viib)?",
             "Section 56(2)(viib) taxes share premium received by a company exceeding its Fair Market Value as 'Income from Other Sources.' DPIIT-registered startups are exempt from this tax, subject to declaring that they will not invest in specific assets like real estate or loans."),
            ("What is the role of a Chartered Accountant (CA) in startup fundraising?",
             "CAs assist startups in valuation reports (e.g. using Discounted Cash Flow method as required by income tax rules), financial due diligence, tax structuring of ESOPs, and filing necessary ROC forms for share allotment (Form PAS-3)."),
            (f"How does tax litigation proceed in India, and how does it relate to {topic}?",
             f"If a taxpayer disagrees with an assessment order regarding {topic}, they must file an appeal before the Commissioner of Income Tax (Appeals) [CIT(A)] within 30 days. Subsequent appeals go to the ITAT, High Court, and Supreme Court."),
            ("What is the Faceless Appeal Scheme in income tax?",
             "The Faceless Appeal Scheme allows CIT(A) appeals to be conducted electronically without physical interaction between the taxpayer and the tax officer, aiming to eliminate corruption and promote transparency."),
            ("What is a Stay of Demand in tax litigation?",
             "A Stay of Demand is an application filed to defer the payment of disputed tax demands during the pendency of an appeal. Typically, the taxpayer must pay 20% of the disputed demand to get a stay from the Assessing Officer."),
            ("What is the penalty for under-reporting of income under Section 270A?",
             "Under Section 270A, a penalty of 50% of the tax payable on under-reported income is levied. If under-reporting is due to misreporting of income, the penalty increases to 200% of the tax payable."),
            (f"Where can I find top CA firms in Bangalore (Bengaluru) for {topic}?",
             f"Top CA firms are located across key business hubs in Bangalore like Koramangala, Whitefield, Indiranagar, HSR Layout, Electronic City, and Marathahalli, specializing in startup compliance, international tax, and GST for {topic}."),
            ("Why do startups need local CAs in Bangalore?",
             "Local CAs understand the city's active startup ecosystem (SaaS, e-commerce, deep tech) and have direct experience with VC funding, FEMA compliances for foreign direct investments, and Karnataka Professional Tax/Shop Act registrations."),
            ("What is a tax audit due diligence report?",
             "It is a report prepared by an auditor evaluating the tax compliance history, open tax disputes, and potential tax exposures of a target company before an acquisition or major funding round."),
            ("What is a Share Purchase Agreement (SPA)?",
             "An SPA is the binding legal contract governing the sale and transfer of shares from existing shareholders to an investor, containing representations, warranties, and indemnification clauses."),
            ("Can a foreign VC invest in an Indian company directly?",
             "Yes. Foreign venture capital investments are governed by the RBI's FEMA regulations. The transaction must be reported to the RBI on the FIRMS portal by filing a Single Master Form (SMF) within 30 days of share allotment.")
        ]
        
    return []

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
    
    # 2. Extract pages from batch 54 and 55
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
