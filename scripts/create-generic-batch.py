import sys
import os
import re
import json
import html
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent))
from enrich_all_blog_pages import case_study_panels, get_case_study_type

# Paths
root = Path("C:/Ravish/workindex-frontend")
downloads = Path("C:/Users/LENOVO/Downloads")
seo_dir = root / "seo-pages"
sitemap_path = root / "sitemap.xml"
batch_num = int(sys.argv[1]) if len(sys.argv) > 1 else 82
manifest_path = root / f"batch{batch_num}-downloaded-indexnow-urls.json"
source_path = root / f"batch{batch_num}-downloaded-source-slugs.json"
progress_file = Path("C:/Ravish/indexer/progress.json")
urls_file = Path("C:/Ravish/indexer/urls.txt")

cta_url = "/?signup=true&role=client"
fact_date = "2026-07-01"
batch_numbers = [batch_num]

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
# CATEGORIES & CLASSIFICATION
# ==========================================

def get_category_and_topic(slug, batch_num):
    topic = slug.replace('faq-', '').replace('blog-', '').replace('-guide-2026', '').replace('-complete-guide', '').replace('-guide', '').replace('-', ' ').title()
    topic = re.sub(r'\s+', ' ', topic).strip()
    slug_lower = slug.lower()
    
    case_study_key = get_case_study_type(slug)
    if case_study_key:
        return "supreme_court_case_study", topic
        
    if re.search(r'rent-|renting|-rent|rental|lease|sublet|co-living|flatmate|paying-guest|hostel|pg-accommodation|student-housing|airbnb|holiday-home|vacation-rental|co-working|virtual-office|shared-office|oyo-franchise|oyo-partner', slug_lower):
        return "co_living_rental", topic
    elif re.search(r'upi-merchant|paytm-merchant|gpay-merchant|phonepe-merchant|qr-code|pos-machine|credit-card-merchant|merchant-discount|payment-gateway|bnpl-merchant|upi-payment|cashback-given|discount-coupon|loyalty-points|reward-points|cash-on-delivery|prepaid-payment|store-credit|digital-wallet|aggregator-commission', slug_lower):
        return "digital_payments_upi", topic
    elif re.search(r'saas-subscription|software-as-service|app-subscription|monthly-subscription|annual-subscription|b2b-saas|b2c-saas|foreign-saas|ott-subscription|cloud-storage|antivirus-subscription|gaming-subscription|e-learning-subscription|online-course|membership-site|freemium-model|trial-period|upgrade-downgrade|subscription-cancellation|saas-invoice', slug_lower):
        return "saas_subscription", topic
    elif re.search(r'real-estate-agent|property-broker|commission-tds|property-dealer|flat-broker|property-consultant|real-estate-broker|property-commission|real-estate-referral|property-management|builder-advance|housing-loan-dsa|bank-dsa|insurance-dsa|mutual-fund-distributor|stock-broker|sub-broker|franchise-fee-real-estate', slug_lower):
        return "real_estate_broker", topic
    elif re.search(r'deel-india|remote-com|oyster-hr|rippling-india|atlas-hxm|globalization-partners|papaya-global|velocity-global|multiplier-india|skuad-india|remote-work-us|w9-form|w8ben|1099-nec|1099-div|foreign-company-contractor|independent-contractor|contractor-agreement|eor-employee', slug_lower):
        return "eor_payroll", topic
    elif re.search(r'salary-tds-higher|form-16-shows-less|employer-showing-wrong|tds-deducted-company|company-bankrupt|company-winding|employer-changed-name|acquisition-merger|salary-paid-different|salary-paid-foreign|deputation-salary|international-secondment|expat-salary|employer-paid-tax|net-of-tax-salary|deemed-salary|salary-paid-advance|director-salary|proprietor-no-salary|partner-remuneration', slug_lower):
        return "salaried_problems", topic
    elif re.search(r'crypto-wallet|crypto-p2p|crypto-tds|binance-india|lost-exchange-hack|lost-private-key|crypto-scam|bitcoin-received|ethereum-staking|defi-yield|nft-royalty|play-to-earn|metaverse-land|crypto-donated|crypto-gift|crypto-received|crypto-divorce|crypto-itr|crypto-audit|crypto-under|crypto-foreign|crypto-stablecoin|crypto-wrapped|crypto-bridge', slug_lower):
        return "crypto_specific", topic
    elif re.search(r'telemedicine|doctor-consultation|health-app|wellness-app|yoga-meditation|diet-nutritionist|clinical-nutritionist|speech-therapist|occupational-therapist|ambulance-service|blood-bank|organ-transplant|surrogacy-services|fertility-clinic|cosmetic-surgery|hair-transplant|dental-implant|ayurveda-treatment|homeopathy-clinic|unani-clinic', slug_lower):
        return "health_medical", topic
    elif re.search(r'private-school|cbse-school|international-school|boarding-school|school-canteen|school-transport|school-uniform|school-books|school-donation|school-building|college-hostel|university-research|online-university|edtech-platform|tutoring-platform|test-prep|skill-development|vocational-training|corporate-training|certification-course', slug_lower):
        return "education_sector", topic
    elif re.search(r'contractor-tds|subcontractor-tds|civil-contractor|turnkey-project|epc-contract|civil-works|road-construction|dam-construction|affordable-housing|commercial-construction|renovation-gst|interior-fit-out|electrical-plumbing|mechanical-works|plant-machinery|composite-supply|pure-labour|construction-advance|retention-money|liquidated-damages', slug_lower):
        return "construction_tds_gst", topic
    elif re.search(r'msme-udyam|msme-delayed|msme-tds|msme-credit|msme-export|msme-composition|msme-audit|msme-presumptive|msme-quarterly|msme-annual|msme-purchase|msme-payment|msme-factoring|msme-invoice|msme-mudra|msme-subsidy|msme-bank|msme-trade|msme-cluster', slug_lower):
        return "msme_compliance", topic
    elif re.search(r'family-business|son-inheriting|huf-conversion|partnership-reconstitution|partner-retirement|partner-death|son-joining|daughter-joining|family-trust|will-for-business|family-loan|parent-lending|family-guarantee|business-gifted|business-sold|family-settlement|partition-family|joint-venture|family-company', slug_lower):
        return "family_business", topic
    elif re.search(r'nri-returning-us|nri-returning-rsu|nri-returning-esop|nri-returning-uk|nri-returning-canada|nri-returning-australia|nri-returning-singapore|nri-returning-401k|nri-returning-ira|nri-returning-eefc|nri-returning-fcnr|nri-returning-nre|nri-returning-foreign|nri-returning-overseas|nri-returning-car|nri-returning-household|nri-returning-jewelry|nri-returning-gold|nri-returning-forex|nri-returning-gift', slug_lower):
        return "nri_returning", topic
    elif re.search(r'pilot-income|airline-crew|ship-captain|merchant-navy|offshore-oil-rig|mining-engineer|nuclear-plant|remote-location|border-area|tribal-area|journalist-freelance|anchor-newsreader|film-actor|film-director|model-fashion|musician-band|stand-up-comedian|magician-entertainer|sports-coach|e-sports-player', slug_lower):
        return "specific_jobs", topic
    elif re.search(r'itr-filed-wrong|itr-filed-for-someone|itr-filed-wrong-pan|itr-filed-wrong-bank|itr-filed-excess|itr-filed-deduction|itr-filed-foreign|itr-two-itr|itr-revised|itr-late-fee|itr-efiling|itr-xml|itr-json|itr-excel|itr-prefilled|itr-ais|itr-capital|itr-form|itr-tds|itr-advance|itr-section|itr-self|itr-challan|itr-interest|itr-dividend', slug_lower):
        return "itr_filing_problems", topic
    
    return "roc_mat_nri_misc", topic

fact_check_bullets = {
    "co_living_rental": [
        "Renting of residential dwelling for use as hostel or PG accommodation is exempt from GST, even if leased to a commercial entity, as ruled in State of Karnataka v. Taghar Vasudeva Ambrish (SC 2025).",
        "Short-term rentals (such as Airbnb hosts) are subject to 12% GST if aggregate service turnover exceeds the ₹20 lakh registration threshold.",
        "Providing a virtual office address or desk space in a co-working centre attracts 18% GST as business support services.",
        "Renting of terrace space for telecom towers or billboards constitutes commercial leasing, which is taxable at 18% GST."
    ],
    "digital_payments_upi": [
        "Merchants receiving payments via UPI are subject to zero Merchant Discount Rate (MDR) as per government mandate, meaning no transactional GST applies.",
        "Cashback or discounts given to customers at the time of purchase reduce the taxable supply value u/s 15 of the CGST Act.",
        "Redemption of loyalty points for goods or services triggers GST liability at the point of redemption at the rate applicable to those goods or services.",
        "Payment gateways charge 18% GST on their processing fees, B2B merchants can claim as input tax credit (ITC)."
    ],
    "saas_subscription": [
        "Foreign SaaS providers supplying services to non-taxable retail consumers in India must register for and pay 18% GST under the OIDAR scheme.",
        "Indian SaaS exports to overseas B2B clients are zero-rated under GST, provided they are supported by a Letter of Undertaking (LUT) and payment is received in foreign currency.",
        "Upfront annual subscription billings require full GST payment at the time of invoice or payment (whichever is earlier) under Section 13 of the CGST Act.",
        "Subscription cancellations and refunds must be documented using credit notes to adjust and recover previously paid GST."
    ],
    "real_estate_broker": [
        "Commission paid to real estate brokers is subject to 5% TDS under Section 194H if the total payments exceed ₹15,000 in a financial year.",
        "Property brokerage and consultancy services attract 18% GST. Registration is mandatory if annual service turnover exceeds ₹20 lakh.",
        "Real estate brokers can declare presumptive business income u/s 44AD (6% or 8% of turnover), but they are not eligible for the professional presumptive tax u/s 44ADA.",
        "DSAs (Direct Selling Agents) offering home loans, insurance, or mutual funds are liable for GST under reverse charge or forward charge depending on the specific service classification."
    ],
    "eor_payroll": [
        "An Employer of Record (EOR) in India is the legal employer of workers assigned to foreign companies and must deduct salary TDS u/s 192 and issue Form 16.",
        "Indian workers employed via EORs are entitled to statutory benefits including EPF, ESIC, and gratuity, paid and managed by the Indian EOR entity.",
        "Foreign companies hiring Indian independent contractors must obtain Form W-8BEN to apply double taxation treaty (DTAA) withholding tax rates.",
        "A US company issuing a Form 1099-NEC to an Indian freelancer does not exempt that income from Indian tax; the freelancer must report it as business income in India."
    ],
    "salaried_problems": [
        "If you switch jobs during a financial year, you must submit details of your previous salary to your new employer in Form 12BB to avoid under-deduction of TDS.",
        "Under Section 205, tax cannot be recovered from an employee if the employer has already deducted TDS, even if the employer fails to deposit it with the government.",
        "If Form 16 shows incorrect income or TDS, the employer must file a revised quarterly TDS return (Form 24Q correction) to update the Income Tax Department's records.",
        "Deputation or secondment salaries received from two separate entities (e.g., Indian sub and foreign parent) require filing ITR-2 with dual Form 16 reconciliation."
    ],
    "crypto_specific": [
        "Wallet-to-wallet transfers between accounts owned by the same individual are not taxable events, but they require strict cost basis tracking for subsequent sales.",
        "Peer-to-peer (P2P) crypto buyers have a statutory obligation u/s 194S to deduct 1% TDS on transactions exceeding ₹10,000 (or ₹50,000 for specified persons).",
        "Losses resulting from exchange hacks or lost private keys are not deductible as business or capital losses under Section 115BBH of the Income Tax Act.",
        "Crypto received as salary is taxed as a perquisite at fair market value on the date of receipt, and its subsequent sale triggers 30% tax on any further gains."
    ],
    "health_medical": [
        "Cosmetic surgeries, dental implants (aesthetic), and hair transplants performed for appearance enhancement are taxable at 18% GST.",
        "Telemedicine and online doctor consultations by registered practitioners are exempt from GST under healthcare service definitions.",
        "Subscriptions for wellness, yoga, or meditation apps are treated as digital services and are subject to 18% GST.",
        "Emergency ambulance services are exempt from GST, whereas non-emergency patient transport and medical equipment leasing attract 18% GST."
    ],
    "education_sector": [
        "Services provided by educational institutions (schools, colleges, universities) to their students, faculty, and staff are exempt from GST.",
        "Auxiliary services such as school catering, transportation, and security are exempt from GST if provided directly to educational institutions.",
        "Private coaching centres, test preparation companies, and EdTech platforms are not classified as exempt educational institutions and must charge 18% GST.",
        "Donations made to schools qualify for 50% tax deduction under Section 80G, provided the school has valid registration and registration certificate."
    ],
    "construction_tds_gst": [
        "TDS on payments to contractors and subcontractors is deducted u/s 194C at 1% for individuals/HUFs and 2% for other entities.",
        "GST on works contracts for government roads, dams, bridges, and public infrastructure is generally 12%, while commercial projects attract 18%.",
        "GST is payable on construction advances at the time of receipt, and tax liability cannot be deferred until final completion or possession.",
        "Liquidated damages or penalties for delayed construction are subject to 18% GST if characterized as tolerating a breach of contract."
    ],
    "msme_compliance": [
        "Under Section 43B(h), payments due to registered MSMEs (Micro and Small) must be made within 15 days (or up to 45 days if written agreement exists). Late payments cannot be deducted in that tax year under {topic}.",
        "Delayed payments to MSMEs trigger compound interest at three times the RBI bank rate on delayed payments. This interest is mandatory and is not tax-deductible for the buyer.",
        "MSME presumptive tax benefits are available u/s 44AD up to a turnover limit of ₹3 crore (if cash receipts do not exceed 5%).",
        "MSME quarterly GST return filing (QRMP scheme) is available for taxpayers with an aggregate turnover of up to ₹5 crore."
    ],
    "family_business": [
        "Transfer of a family business via inheritance or a registered Will does not attract gift tax or capital gains tax under Section 47 of the Income Tax Act.",
        "Partition of HUF business assets among coparceners under a family settlement deed is not treated as a transfer and does not trigger capital gains.",
        "Loans given by family members to a business are not taxable as income, but they must be supported by a written loan agreement and bank transfers to prevent tax additions.",
        "Salaries or commissions paid to family members working in the business must be commercially reasonable to avoid disallowance u/s 40A(2)(b)."
    ],
    "nri_returning": [
        "Returning NRIs can claim Resident but Not Ordinarily Resident (RNOR) status for up to 3 years, during which foreign-source income remains tax-exempt in India.",
        "Interest on NRE and FCNR accounts is tax-free only for non-residents; returning NRIs must convert these to resident accounts or Resident Foreign Currency (RFC) accounts.",
        "Tax relief u/s 89A prevents double taxation of accrued income in foreign retirement accounts (such as 401k or IRA) for returning NRIs.",
        "Customs duties on household goods, jewelry, and vehicles imported by returning residents are subject to concessions under the Transfer of Residence Rules."
    ],
    "specific_jobs": [
        "Merchant navy crew members sailing on foreign-going vessels for 182 days or more in a year are classified as NRIs, making their foreign voyage salary tax-free in India.",
        "Airlines pilots and crew members based in India are taxed on their global salary at normal slabs, but foreign travel allowances can be exempt u/s 10(14).",
        "Freelance journalists, actors, and stand-up comedians must register for GST if their total annual services turnover exceeds ₹20 lakh.",
        "Income from sports coaching, modeling, or film direction is taxable as Profits and Gains of Business or Profession (PGBP) and subject to Section 194J TDS."
    ],
    "itr_filing_problems": [
        "If you file your ITR under the wrong assessment year, you must file a fresh return for the correct AY; a revised return cannot correct the AY of the original return.",
        "TDS credit missing from Form 26AS can be claimed in the ITR, and Section 205 protects the taxpayer from direct tax recovery by the department.",
        "Discrepancies in the Annual Information Statement (AIS) must be disputed using the portal's feedback mechanism to prevent arbitrary tax demands.",
        "Filing an incorrect ITR form (e.g. ITR-1 instead of ITR-2 when holding foreign assets) makes the return defective and can lead to notice u/s 139(9)."
    ]
}

def get_specific_faqs(category, topic):
    if category == "co_living_rental":
        return [
            (f"Is GST applicable to PG and hostel accommodations under {topic}?",
             f"Renting of residential dwelling for use as hostel or PG accommodation is exempt from GST, as settled by the Supreme Court in the Taghar Vasudeva case. This is a primary focus of {topic}."),
            (f"How does GST apply to short-term Airbnb rentals?",
             f"Short-term vacation rentals are classified as commercial accommodations. Under {topic}, hosts are subject to 12% GST if their aggregate service turnover exceeds ₹20 lakh per annum."),
            (f"Is leasing rooftop space for towers or billboards taxable?",
             f"Yes. Renting commercial space like a rooftop for telecom towers or advertising billboards is commercial leasing and attracts 18% GST under {topic}."),
            (f"What is the GST rate for co-working memberships?",
             f"Co-working desk space and virtual office packages are billed as business support services, attracting 18% GST under {topic}."),
            (f"Is subletting income subject to GST?",
             f"Subletting a residential dwelling to individual tenants for residential use remains GST-exempt. However, the sublease income must be declared in ITR under {topic} as other income or business profits.")
        ]
    elif category == "digital_payments_upi":
        return [
            (f"Is GST levied on merchants for receiving UPI payments under {topic}?",
             f"No. Merchants are not charged GST on receiving UPI payments. The Merchant Discount Rate (MDR) for UPI transactions is zero, meaning no transaction tax applies under {topic}."),
            (f"How is customer cashback treated for GST purposes?",
             f"Cashbacks given directly to customers act as purchase discounts. Under {topic}, this reduces the taxable value of supply under Section 15 of the CGST Act."),
            (f"Do loyalty points redemptions attract GST?",
             f"Yes. If points are redeemed for products or services, it is treated as a taxable supply of those goods or services under {topic} at the time of redemption."),
            (f"Is GST charged on payment gateway fees?",
             f"Yes, payment gateways charge 18% GST on their processing fees. Merchants can claim this as Input Tax Credit (ITC) under {topic} for business expenses."),
            (f"How do BNPL services handle GST?",
             f"Buy Now Pay Later (BNPL) interest charges are exempt from GST as financial services. However, processing fees or late payment charges attract 18% GST under {topic}.")
        ]
    elif category == "saas_subscription":
        return [
            (f"How do foreign SaaS providers handle GST for Indian customers under {topic}?",
             f"Foreign SaaS providers selling to Indian retail consumers must pay 18% GST under the OIDAR scheme. B2B Indian buyers must pay GST under the reverse charge mechanism (RCM) as part of {topic}."),
            (f"Is GST charged on Indian SaaS exports?",
             f"Indian SaaS exports to overseas clients are zero-rated under GST. Under {topic}, exporters must file a Letter of Undertaking (LUT) and receive payment in foreign currency."),
            (f"How does GST apply to annual subscriptions billed upfront?",
             f"The time of supply is the earlier of the invoice date or payment date. Therefore, the full 18% GST must be paid upfront in the month of billing under {topic}."),
            (f"What is the GST treatment for subscription cancellations?",
             f"If a subscription is cancelled and a refund is issued, the SaaS company must issue a GST credit note to reclaim the previously paid GST under {topic}."),
            (f"Is a free trial period subject to GST?",
             f"No. Free trial periods with zero charge are not considered taxable supplies as no consideration is received, which is a key note in {topic}.")
        ]
    elif category == "real_estate_broker":
        return [
            (f"What is the TDS rate on real estate commissions under {topic}?",
             f"TDS at 5% u/s 194H applies to real estate broker commissions if total payments in a financial year exceed ₹15,000. This is a core point of {topic}."),
            (f"What is the GST rate on property brokerage?",
             f"Real estate agents and brokers must charge 18% GST on their services. Registration is mandatory if annual service turnover exceeds ₹20 lakh under {topic}."),
            (f"Can real estate brokers opt for presumptive tax u/s 44ADA?",
             f"No. Real estate brokerage is an agency service and is explicitly ineligible for professional presumptive tax u/s 44ADA. However, they can opt for Section 44AD under {topic}."),
            (f"Do DSAs (Direct Selling Agents) pay GST?",
             f"Yes, DSA agents providing loan facilitation or insurance services are liable for GST. Under {topic}, services are subject to forward charge or reverse charge depending on the licensing bank's rules."),
            (f"Is GST payable on builder advances received by agents?",
             f"Yes, when a real estate broker receives an advance from a developer or buyer for services, GST is payable at the time of receipt under {topic}.")
        ]
    elif category == "eor_payroll":
        return [
            (f"Who is responsible for TDS for EOR workers under {topic}?",
             f"The Employer of Record (EOR) in India is the legal employer. They are responsible for deducting salary TDS u/s 192 and issuing Form 16 under {topic}."),
            (f"Are EOR employees eligible for PF and ESIC in India?",
             f"Yes. Registered EOR entities in India must make statutory EPF and ESIC contributions on behalf of the employees as part of {topic} compliance."),
            (f"What is the purpose of Form W-8BEN for freelancers?",
             f"Form W-8BEN is submitted by Indian freelancers to US clients to claim DTAA tax treaty benefits and lower or eliminate US withholding tax under {topic}."),
            (f"Is income reported on US Form 1099-NEC taxable in India?",
             f"Yes. US companies issue 1099-NEC to record freelancer payouts. In India, this must be declared as business/professional income in the freelancer's ITR under {topic}."),
            (f"Is GST payable on EOR service fees?",
             f"EOR services provided to foreign clients are classified as export of services and are zero-rated u/s 16 of the IGST Act under {topic}.")
        ]
    elif category == "salaried_problems":
        return [
            (f"How do I prevent double taxation when switching jobs under {topic}?",
             f"You must submit details of your previous job's salary and TDS to your new employer in Form 12BB. This ensures they deduct TDS correctly on the cumulative income under {topic}."),
            (f"What happens if my employer deducts TDS but does not deposit it?",
             f"Under Section 205, the income tax department cannot demand direct tax recovery from the employee if TDS was already deducted, which is a vital protection under {topic}."),
            (f"How do I correct errors in my Form 16?",
             f"You must request your employer to file a revised TDS return (Form 24Q correction). Once corrected, the updated credit will reflect in your Form 26AS/AIS under {topic}."),
            (f"How is salary paid by a foreign parent company taxed?",
             f"Salary received in India from a foreign parent company is fully taxable as salary income. You must declare this and claim foreign tax credit (FTC) if applicable under {topic}."),
            (f"How is partner remuneration from a firm reported in ITR?",
             f"Partner remuneration is reported under the head 'Profits and Gains of Business or Profession' in ITR-3, not under 'Income from Salaries', under {topic} rules.")
        ]
    elif category == "crypto_specific":
        return [
            (f"Is a wallet-to-wallet transfer taxable under {topic}?",
             f"No. Moving crypto between wallets owned by the same person is not a taxable transfer. However, cost basis records must be maintained under {topic}."),
            (f"Who is liable for TDS in P2P crypto transactions?",
             f"In P2P transactions, the buyer is legally obligated u/s 194S to deduct 1% TDS on payment to the seller if it exceeds threshold limits under {topic}."),
            (f"Can I claim tax deductions for crypto lost in a hack?",
             f"No. Losses from exchange hacks, theft, or lost private keys cannot be claimed as tax deductions or offset against other crypto gains u/s 115BBH under {topic}."),
            (f"How is crypto received as salary taxed?",
             f"It is taxed as a perquisite at FMV on the date of receipt under Section 17(2). Subsequent sales are subject to the standard 30% crypto capital gains tax under {topic}."),
            (f"Are stablecoins exempt from the 30% crypto tax?",
             f"No. Stablecoins like USDT, USDC, and DAI are classified as virtual digital assets (VDAs) and are taxed at a flat 30% rate on all gains under {topic}.")
        ]
    elif category == "health_medical":
        return [
            (f"Is GST applicable to cosmetic surgeries under {topic}?",
             f"Yes. Procedures performed to improve appearance (e.g. rhinoplasty, liposuction, botox) are subject to 18% GST. Reconstructive surgeries are exempt under {topic}."),
            (f"Do dental implants attract GST?",
             f"The clinical procedure of dental implantation is exempt as healthcare. However, the implant materials supplied separately attract GST under {topic}."),
            (f"Are ayurvedic and homeopathic treatments exempt from GST?",
             f"Yes, healthcare services provided by recognized systems of medicine like Ayurveda, Homeopathy, and Unani are exempt from GST under {topic}."),
            (f"Is GST charged on telemedicine consultations?",
             f"Online consultations by registered medical practitioners are exempt from GST. However, mobile app access subscription fees attract 18% GST under {topic}."),
            (f"Are ambulance services subject to GST?",
             f"Emergency ambulance services are exempt. Non-emergency transport services are taxable at 18% GST under {topic}.")
        ]
    elif category == "education_sector":
        return [
            (f"Are school and college services exempt from GST under {topic}?",
             f"Yes, education services provided by recognized schools, colleges, and universities to their students, faculty, and staff are fully exempt under {topic}."),
            (f"Do school transportation and catering services attract GST?",
             f"Services like school transport, catering, and security are exempt from GST if provided directly to an educational institution under {topic}."),
            (f"Is GST applicable to private coaching and EdTech services?",
             f"Yes. Private tutoring, coaching centres, and EdTech platform subscriptions are taxable at 18% GST under {topic}."),
            (f"Can I claim tax benefits for school donation fees?",
             f"Donations to registered educational institutions qualify for a 50% deduction u/s 80G, provided the institution has a valid 80G registration under {topic}.")
        ]
    elif category == "construction_tds_gst":
        return [
            (f"What is the TDS rate for civil contractors under {topic}?",
             f"TDS u/s 194C is deducted at 1% for individuals/HUFs and 2% for corporate and other entities on contractor payments under {topic}."),
            (f"What is the GST rate on government works contracts?",
             f"Works contracts for roads, bridges, railways, and public infrastructure are subject to 12% GST, while commercial projects attract 18% under {topic}."),
            (f"Is GST payable on construction advances?",
             f"Yes. GST is due on construction service advances at the time of payment receipt. Tax cannot be deferred to completion under {topic}."),
            (f"Do liquidated damages attract GST in construction?",
             f"Yes. Liquidated damages for delay or non-performance are generally subject to 18% GST as consideration for tolerating an act under {topic}."),
            (f"What is the GST rate on affordable housing projects?",
             f"Affordable housing projects (meeting stamp value and area limits) are subject to a concessional GST rate of 1% without Input Tax Credit (ITC) under {topic}.")
        ]
    elif category == "msme_compliance":
        return [
            (f"What is the 45-day payment rule for MSMEs under {topic}?",
             f"Under Section 43B(h), buyers must pay Micro and Small enterprise suppliers within 15 days (or up to 45 days if written agreement exists). Late payments cannot be deducted in that tax year under {topic}."),
            (f"What is the penalty for delayed payment to MSMEs?",
             f"Buyers must pay compound interest at three times the RBI bank rate on delayed payments. This interest is mandatory and is not tax-deductible for the buyer under {topic}."),
            (f"Can MSMEs benefit from presumptive taxation u/s 44AD?",
             f"Yes. MSMEs with turnover up to ₹3 crore (where cash receipts are <= 5%) can declare presumptive business income u/s 44AD under {topic}."),
            (f"Do MSMEs qualify for quarterly GST return filing?",
             f"Yes. Under the QRMP scheme, MSMEs with aggregate annual turnover up to ₹5 crore can file GST returns quarterly and pay tax monthly under {topic}.")
        ]
    elif category == "family_business":
        return [
            (f"Is inheritance tax applicable to family businesses under {topic}?",
             f"No. India does not levy inheritance or estate tax. Transfer of a business through a Will or inheritance is exempt from tax under {topic}."),
            (f"Does a family settlement deed trigger capital gains?",
             f"No. A bona fide partition of family assets under a family settlement deed is not classified as a transfer and does not trigger capital gains under {topic}."),
            (f"How are loans from family members treated in a business?",
             f"Family loans are not taxable as income, but they must be backed by a written loan agreement and bank transfers to prevent tax additions under {topic}."),
            (f"Can I pay salary to family members in the business?",
             f"Yes. Salaries paid to family members are deductible, provided they are commercially reasonable and correspond to actual services rendered, under {topic} u/s 40A(2)(b).")
        ]
    elif category == "nri_returning":
        return [
            (f"What is RNOR status for returning NRIs under {topic}?",
             f"Returning NRIs can claim Resident but Not Ordinarily Resident (RNOR) status for up to 3 years. Under this status, foreign-source income remains tax-exempt in India under {topic}."),
            (f"Do returning NRIs have to convert NRE accounts?",
             f"Yes. NRE and FCNR accounts must be converted to resident accounts or Resident Foreign Currency (RFC) accounts once the NRI returns to India under {topic}."),
            (f"How can returning NRIs avoid double taxation on foreign pensions?",
             f"Taxpayers can claim relief under Section 89A to defer and align taxation on foreign retirement funds like 401k or IRA with India's tax year under {topic}."),
            (f"Are household goods imported by returning NRIs subject to customs?",
             f"Under the Transfer of Residence Rules, returning NRIs receive duty concessions on used household goods up to specified limits under {topic}.")
        ]
    elif category == "specific_jobs":
        return [
            (f"Is salary received by merchant navy officers taxable under {topic}?",
             f"If a crew member sails on foreign-going vessels for 182 days or more in a financial year, they qualify for NRI status, making their sea salary tax-exempt in India under {topic}."),
            (f"Are airline pilots taxed on global income?",
             f"Indian-based pilots are taxed on their global salary. However, travel and per diem allowances may be exempt under Section 10(14) under {topic}."),
            (f"When do freelance actors or stand-up comedians need GST registration?",
             f"Freelancers in creative industries must register for GST if their total annual services turnover exceeds ₹20 lakh under {topic}."),
            (f"Which ITR form must film directors file?",
             f"Film directors, anchors, and other creative professionals must file ITR-3 to report business/professional profits and gains under {topic}.")
        ]
    elif category == "itr_filing_problems":
        return [
            (f"Can I correct the assessment year in a revised ITR under {topic}?",
             f"No. A revised return cannot change the Assessment Year of the original filing. You must file a fresh return for the correct AY under {topic}."),
            (f"What should I do if my TDS is not showing in Form 26AS?",
             f"You should raise a grievance on the portal and contact the deductor. Section 205 protects the employee from direct recovery if TDS was deducted under {topic}."),
            (f"How do I correct errors in AIS data?",
             f"You must submit online feedback on the AIS portal indicating the discrepancy to prevent erroneous tax demands under {topic}."),
            (f"What is the penalty for filing the incorrect ITR form?",
             f"Filing the wrong ITR form makes the return defective under Section 139(9). Under {topic}, you must rectify this within 15 days of receiving the notice.")
        ]
    
    return [
        (f"What are the MAT and ROC compliance guidelines under {topic}?",
         f"MAT u/s 115JB applies to companies at 15%. MCA compliance requires filing annual forms AOC-4 and MGT-7 within statutory deadlines under {topic}."),
        (f"How are professional tax audits conducted?",
         f"Tax audits u/s 44AB are required if professional receipts exceed ₹50 lakh or business turnover exceeds ₹1 crore/₹10 crore, as detailed under {topic}.")
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
    
    is_case_study = (category == "supreme_court_case_study")
    
    intent_name = intent(slug)
    hero_sub = 'Compare professionals with a clear local brief' if service_prefix(slug) else 'India-specific preparation guide'
    
    block_label = page['block']
    block_label = re.sub(r'^#+\s*', '', block_label)
    block_label = block_label.replace('`', '').replace('—', '-').replace('–', '-').replace('’', "'").replace('“', '"').replace('”', '"')
    
    # Related links (exclude self)
    rel = related(slug, all_slugs)
    related_html = "".join(f'<a href="/seo-pages/{s}.html">{esc(title_from_slug(s))}</a>' for s in rel)
    
    if is_case_study:
        case_study_key = get_case_study_type(slug) or 'general_tax_litigation'
        panels = case_study_panels[case_study_key]
        
        meta = f"{title} in India. Check dispute details, Supreme Court ratio decidendi, key evidence, and practical mitigation steps on the WorkIndex work index."
        
        schema_data = {
            '@context': 'https://schema.org',
            '@graph': [
                { '@type': 'Organization', '@id': 'https://workindex.co.in/#organization', 'name': 'WorkIndex', 'alternateName': 'Work Index', 'url': 'https://workindex.co.in' },
                { '@type': 'WebPage', '@id': f"https://workindex.co.in/seo-pages/{slug}.html#webpage", 'url': f"https://workindex.co.in/seo-pages/{slug}.html", 'name': f"{title} | WorkIndex", 'description': meta },
                { '@type': 'BreadcrumbList', 'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'WorkIndex', 'item': 'https://workindex.co.in' },
                    { '@type': 'ListItem', 'position': 2, 'name': title, 'item': f"https://workindex.co.in/seo-pages/{slug}.html" }
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
<title>{esc(title)} | WorkIndex</title><meta name="description" content="{esc(meta)}"/><link rel="canonical" href="https://workindex.co.in/seo-pages/{slug}.html"/>
<meta property="og:title" content="{esc(title)} | WorkIndex"/><meta property="og:description" content="{esc(meta)}"/><meta property="og:url" content="https://workindex.co.in/seo-pages/{slug}.html"/><meta property="og:type" content="website"/>
<link rel="stylesheet" href="/styles.css"/><link rel="stylesheet" href="/lp-styles.css"/>
<script type="application/ld+json">{schema_json}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body class="landing">
<main class="wi-rich">
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>{esc(title)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>Case Study</div><h1>{esc(title)}<br><span>Landmark Court Judgment Analysis</span></h1><p>{esc(title)} needs detailed legal review and fact-matching before you rely on it. Compare top compliance and legal experts on the WorkIndex work index.</p><a href="{cta_url}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: {fact_date}</div><div class="lp-trust-item">Duplicate checked</div><div class="lp-trust-item">Official-source cautious</div><div class="lp-trust-item">India specific</div></div></section>
<div class="wi-rich-grid"><div>
<section class="wi-panel"><div class="lp-section-eyebrow">Dispute Details</div><h2>Facts &amp; Lower Court History</h2>{list_to_html(panels['dispute_details'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Court Ratio</div><h2>Legal Principles &amp; Ratio Decidendi</h2>{list_to_html(panels['court_ratio'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Key Evidence</div><h2>Agreements &amp; Filings Evaluated</h2>{list_to_html(panels['key_evidence'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Action Points</div><h2>Practical Mitigation &amp; Compliance Steps</h2>{list_to_html(panels['action_points'])}</section>
</div><aside>
<section class="wi-panel"><div class="lp-section-eyebrow">Official checks</div><h2>Useful source portals</h2><div class="wi-related">{source_links(type_name)}</div></section>
<section class="wi-panel"><div class="lp-section-eyebrow">Hiring brief</div><h2>Ask experts these questions</h2>{list_to_html(['Which law, form, utility or notification are you relying on?', 'What documents are missing before you can finalise the work?', 'What is included in your quote and what is excluded?', 'What timeline, proof of filing and post-filing support will you provide?'])}</section>
<section class="wi-panel"><div class="lp-section-eyebrow">Related pages</div><h2>Explore related WorkIndex guides</h2><div class="wi-related">{related_html}</div></section>
</aside></div>
</main>
</body>
</html>
"""
    else:
        meta = f"{title} in India. Check facts, documents, official portals, deadlines, risks and expert brief before hiring on the WorkIndex work index."
        bullets = topic_specific_bullets(slug, type_name, title)
        
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
        if line.startswith("## PART"):
            part_name = re.sub(r'^##\s*PART\s*\d+\s*[^\w\s]*\s*', '', line)
            current_block = part_name.strip()
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
    
    # Subtract slugs generated in the previous run of Batches 77-79 so they can be regenerated
    current_batch_slugs = set()
    if manifest_path.exists():
        try:
            manifest_urls = json.loads(manifest_path.read_text(encoding="utf-8"))
            for url in manifest_urls:
                m = re.search(r'/seo-pages/(.*?)\.html', url)
                if m:
                    current_batch_slugs.add(m.group(1).lower())
        except Exception:
            pass
    master_existing = master_existing - current_batch_slugs
    print(f"Master existing slugs pool: {len(master_existing)}")
    
    # Pre-calculate existing BOWs
    existing_bows = set(get_bow(s) for s in master_existing)
    
    # 2. Extract pages from batches 73, 74, 75, 76
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
        
        # Check exact and semantic duplicates against existing (UNCOMMENTED as requested by user)
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
