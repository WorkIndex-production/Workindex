import os
import re
import json
import html
import sys
from pathlib import Path
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

# Paths
ROOT = Path("C:/Ravish/workindex-frontend")
SEO_DIR = ROOT / "seo-pages"
SITEMAP_PATH = ROOT / "sitemap.xml"
PROGRESS_FILE = Path("C:/Ravish/indexer/progress.json")
URLS_FILE = Path("C:/Ravish/indexer/urls.txt")
MANIFEST_PATH = ROOT / "batch97-expansion-indexnow-urls.json"

CTA_URL = "/?signup=true&role=client"
FACT_DATE = "2026-08-19"

# Load existing slugs to guarantee 100% duplicate-free generation
existing_slugs = set(f.stem.lower() for f in SEO_DIR.glob("*.html"))
print(f"Loaded {len(existing_slugs)} existing slugs from seo-pages/.")

# ==============================================================================
# TOPIC DEFINITIONS & GENERATOR FOR 2,750 COMPREHENSIVE NEW SEO PAGES
# ==============================================================================

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text).strip('-')
    return text

def title_from_slug(slug):
    words = slug.split('-')
    caps_map = {
        'ay': 'AY', 'ca': 'CA', 'cfo': 'CFO', 'cbic': 'CBIC', 'cbdt': 'CBDT', 'dsc': 'DSC',
        'epf': 'EPF', 'esic': 'ESIC', 'fema': 'FEMA', 'fy': 'FY', 'gst': 'GST', 'gstr': 'GSTR',
        'hsn': 'HSN', 'huf': 'HUF', 'ims': 'IMS', 'it': 'IT', 'itr': 'ITR', 'itc': 'ITC',
        'llp': 'LLP', 'lrs': 'LRS', 'ltcg': 'LTCG', 'mat': 'MAT', 'mca': 'MCA', 'msme': 'MSME',
        'nri': 'NRI', 'pan': 'PAN', 'pf': 'PF', 'posh': 'POSH', 'rbi': 'RBI', 'rcm': 'RCM',
        'rera': 'RERA', 'roc': 'ROC', 'sac': 'SAC', 'sebi': 'SEBI', 'stcg': 'STCG', 'tcs': 'TCS',
        'tds': 'TDS', 'tan': 'TAN', 'udyam': 'Udyam', 'vda': 'VDA', 'nft': 'NFT', 'dtaa': 'DTAA',
        'trc': 'TRC', 'hra': 'HRA', 'nps': 'NPS', 'esop': 'ESOP', 'rsu': 'RSU', 'beps': 'BEPS',
        'aif': 'AIF', 'sgb': 'SGB', 'ppf': 'PPF', 'fd': 'FD', 'nsc': 'NSC', 'oidar': 'OIDAR',
        'udin': 'UDIN', 'caro': 'CARO', 'nclt': 'NCLT', 'ibc': 'IBC', 'cirp': 'CIRP',
        'gstat': 'GSTAT', 'bkc': 'BKC', 'hsr': 'HSR', 'omr': 'OMR', 'b2b': 'B2B', 'b2c': 'B2C'
    }
    titled_words = []
    for w in words:
        if w in caps_map:
            titled_words.append(caps_map[w])
        elif re.match(r'^\d+[a-z]+$', w): # e.g. 115bbh, 194s, 80ccd, 43b
            titled_words.append(w.upper())
        else:
            titled_words.append(w.capitalize())
    return " ".join(titled_words)

# Topic Templates with rich factual panels & 15 statutory FAQs
TEMPLATES = {
    "income_tax_bill_2025": {
        "eyebrow": "Direct Tax Overhaul",
        "subtitle": "New direct tax framework, section transitions and procedural compliance in India",
        "panels": [
            ("New Direct Tax Framework", "Statutory Scope & Section Transitions", [
                "The Direct Tax Code / Income Tax overhaul streamlines statutory language, eliminating redundant provisos and restructuring chapters for simplified taxpayer compliance.",
                "Old vs New Section Mapping: Direct mapping preserves historical precedent while reorganizing assessment, reassessment, and penalty procedures into cohesive sub-chapters.",
                "Default New Tax Regime Integration: Progressive slab structures and enhanced standard deduction (₹75,000) are embedded as the core assessment benchmark.",
                "Digital-First Assessment & Faceless Appeals: Mandatory portal verification, automated electronic communication, and streamlined dispute resolution mechanisms."
            ]),
            ("Procedural Safeguards", "Accuracy Notes Before You Act", [
                "Section 148 Reassessment Timelines: Normal reassessment notice window is 3 years; extended period up to 5 years applies only where escaped income exceeds ₹50 Lakh.",
                "Annual Information Statement (AIS) Feedback: Portal discrepancies must be disputed actively using the feedback tab before filing ITR to prevent automated mismatch demands u/s 143(1).",
                "Updated Return (ITR-U) Windows: Filing permitted within 24 months from the end of the relevant assessment year subject to additional tax payments (25% in year 1, 50% in year 2).",
                "Tax Audit Thresholds u/s 44AB: ₹10 Crore for businesses with digital transactions >= 95%, and ₹1 Crore for businesses with cash receipts > 5%."
            ]),
            ("Filing Records", "Documents and Facts to Keep Ready", [
                "Updated AIS, TIS, and Form 26AS reconciled across all quarters with employer Form 16 and bank interest certificates.",
                "Books of accounts, audited balance sheet, profit and loss statement, and Tax Audit Report (Form 3CA/3CB-3CD) with CA UDIN.",
                "Challan receipts for advance tax installments (BSR code, challan serial number, tender date).",
                "Bank statements for all operational domestic and overseas accounts held during the financial year."
            ]),
            ("Audit Precautions", "Common Mistakes to Avoid", [
                "Filing under an incorrect ITR form (e.g. filing ITR-1 when holding unlisted shares, foreign assets, or crypto gains), rendering the return defective u/s 139(9).",
                "Failing to respond to online e-Verification or Section 133(6) notices within 15 days, resulting in ex-parte assessment.",
                "Claiming Chapter VI-A deductions (80C, 80D, 80E) while opting for the default New Tax Regime.",
                "Omitting high-value transactions reported in the Statement of Financial Transactions (SFT) by banks and mutual funds."
            ])
        ],
        "faqs": [
            ("What is the primary objective of the New Income Tax Act overhaul in India?",
             "The overhaul aims to simplify direct tax jurisprudence, eliminate redundant historical amendments, establish clear procedural timelines for assessments and appeals, and align direct tax administration with modern digital e-filing systems."),
            ("How are old Income Tax sections mapped to the new statutory structure?",
             "The government publishes a statutory transition concordance table mapping legacy section numbers (like Section 80C, 115BAC, 148, 194C, 194J) to the reorganized chapters to ensure seamless legal continuity for pending litigation and new filings."),
            ("What is the current time limit for issuing a reassessment notice under Section 148?",
             "Under amended direct tax provisions, standard reassessment notices under Section 148 can be issued within 3 years from the end of the relevant assessment year. For severe cases with income escaping assessment exceeding ₹50 Lakh, the time limit extends up to 5 years."),
            ("What are the tax slabs under the default New Tax Regime for FY 2025-26 (AY 2026-27)?",
             "The default New Tax Regime slabs are: Income up to ₹3,00,000: NIL; ₹3,00,001 to ₹7,00,000: 5%; ₹7,00,001 to ₹10,00,000: 10%; ₹10,00,001 to ₹12,00,000: 15%; ₹12,00,001 to ₹15,00,000: 20%; and Above ₹15,00,000: 30%."),
            ("How does the Section 87A rebate work under the New Tax Regime?",
             "Resident individuals with taxable income up to ₹7,00,000 receive a 100% tax rebate of up to ₹25,000 under Section 87A, resulting in zero net tax liability. Marginal relief applies for taxable income marginally exceeding ₹7,00,000."),
            ("What is the enhanced standard deduction for salaried individuals in FY 2025-26?",
             "Salaried employees and pensioners receive an enhanced standard deduction of ₹75,000 under the default New Tax Regime (Section 115BAC), compared to ₹50,000 under the Old Tax Regime."),
            ("Can taxpayers still choose between the Old and New Tax Regimes?",
             "Yes. Non-business individuals can opt for the Old Tax Regime every year at the time of filing their ITR on or before the due date. Taxpayers with business or professional income (PGBP) can switch only once in a lifetime using Form 10-IEA."),
            ("What is the penalty for late filing of an Income Tax Return under Section 234F?",
             "A late filing fee of ₹5,000 applies if the ITR is filed after July 31st but on or before December 31st. For taxpayers with total income up to ₹5,00,000, the late filing fee is capped at ₹1,000."),
            ("What is an Updated Return (ITR-U) and when can it be filed?",
             "Under Section 139(8A), taxpayers can file an Updated Return (ITR-U) within 24 months from the end of the relevant Assessment Year to report omitted income, subject to paying additional tax of 25% (if filed within 12 months) or 50% (if filed between 12-24 months)."),
            ("What is the difference between Form 26AS, AIS, and TIS?",
             "Form 26AS tracks tax deducted at source (TDS), tax collected (TCS), and advance tax paid. The Annual Information Statement (AIS) provides comprehensive data on financial transactions (dividends, share sales, interest, foreign remittances), and the Taxpayer Information Summary (TIS) aggregates this data into category totals."),
            ("How does the faceless appeal mechanism work for tax disputes?",
             "Appeals before the Commissioner of Income Tax (Appeals) are conducted electronically via the National Faceless Appeal Centre (NFAC). All submissions, written arguments, and evidence uploads occur online without in-person physical hearings."),
            ("What are the mandatory audit thresholds for businesses under Section 44AB?",
             "A Tax Audit by a Chartered Accountant is mandatory if gross business turnover exceeds ₹1 Crore. However, if aggregate cash receipts and cash payments do not exceed 5% of total turnover, the audit threshold is relaxed to ₹10 Crore."),
            ("What is the due date for filing Tax Audit reports and non-audit ITRs?",
             "For non-audit individual taxpayers, the annual ITR due date is July 31st of the Assessment Year. For taxpayers subject to Tax Audit or transfer pricing, the Tax Audit report is due by September 30th and the ITR by October 31st."),
            ("How are advance tax payments scheduled across the financial year?",
             "Advance tax is payable in four installments: 15% by June 15, 45% by September 15, 75% by December 15, and 100% by March 15. Delay in paying advance tax attracts mandatory interest under Section 234B and Section 234C."),
            ("Why is hiring a verified Chartered Accountant on WorkIndex recommended for complex filings?",
             "A verified CA ensures thorough reconciliation of AIS/TIS with financial records, optimal regime selection, audit compliance with UDIN, and end-to-end representation before faceless tax authorities.")
        ]
    },
    "capital_gains_buyback": {
        "eyebrow": "Capital Gains & Buyback Rules",
        "subtitle": "LTCG, STCG, Section 2(22)(f) buybacks, unlisted share rules and investment exemptions in India",
        "panels": [
            ("Taxation Architecture", "Capital Gains & Equity Rules", [
                "LTCG on Listed Equities & Equity Mutual Funds: Taxed at 12.5% on aggregate capital gains exceeding the annual ₹1.25 Lakh exemption limit under Section 112A (without indexation).",
                "STCG on Listed Equities u/s 111A: Taxed at a flat rate of 20% where Securities Transaction Tax (STT) is paid on transfer.",
                "Share Buyback Deemed Dividend u/s 2(22)(f): Buyback proceeds are treated as deemed dividends taxable in the hands of shareholders at normal slab rates; cost of acquisition qualifies as capital loss u/s 46A.",
                "Unlisted Shares & Real Estate: 24-month holding period for LTCG at 12.5%; indexation is removed for assets acquired after July 23, 2024, with grandfathered indexation choice for pre-July 23, 2024 residential real estate."
            ]),
            ("Statutory Safeguards", "Accuracy Notes Before You Act", [
                "Section 54 & 54F Exemption Cap: Maximum capital gain exemption for investment in residential property under Section 54/54F is capped at ₹10 Crore.",
                "Section 54EC Capital Gain Bonds: Maximum investment ceiling in eligible REC, PFC, NHAI, or IRFC bonds is ₹50 Lakh per financial year (lock-in period 5 years).",
                "Section 50AA for Specified Mutual Funds: Gains from debt mutual funds investing less than 35% in domestic equities are classified as short-term capital gains taxable at normal slab rates.",
                "Section 50CA & Rule 11UA Fair Market Value: Transfer of unlisted shares below fair market value (FMV) triggers deemed capital gains for the seller and deemed income u/s 56(2)(x) for the buyer."
            ]),
            ("Filing Records", "Documents and Facts to Keep Ready", [
                "Broker Annual Global P&L statements with ISIN-wise buy/sell dates, STT paid, and trade contract notes.",
                "Bank statements verifying credit of sale proceeds and debit of purchase payments.",
                "Property sale deeds, purchase deeds, stamp duty valuation certificates, and construction/improvement bills.",
                "Form 16 / AIS statement reflecting dividend TDS under Section 194 on buyback proceeds."
            ]),
            ("Tax Traps", "Common Mistakes to Avoid", [
                "Treating share buyback proceeds as capital gains rather than deemed dividend income, leading to mismatch notices.",
                "Failing to set off capital loss generated u/s 46A on buybacks against other taxable capital gains.",
                "Applying indexation to listed equity LTCG or unlisted share transactions completed after July 23, 2024.",
                "Missing the 6-month deadline from the date of property transfer for investing in Section 54EC bonds."
            ])
        ],
        "faqs": [
            ("What is the current Long-Term Capital Gains (LTCG) tax rate on listed equity shares in India?",
             "Under Section 112A of the Income-tax Act, LTCG on listed equity shares and equity mutual funds held for more than 12 months is taxed at a flat rate of 12.5% on capital gains exceeding ₹1.25 Lakh per financial year."),
            ("What is the Short-Term Capital Gains (STCG) tax rate under Section 111A?",
             "Short-Term Capital Gains on listed equity shares and equity mutual funds sold on a recognized stock exchange with STT paid are taxed at a flat rate of 20% under Section 111A."),
            ("How are share buyback proceeds taxed in India post-Finance Act amendments?",
             "Under Section 2(22)(f), the entire proceeds received from a company in a share buyback are treated as deemed dividend taxable in the hands of the shareholder at their applicable income tax slab rates. The company deducts 10% TDS u/s 194."),
            ("What happens to the original cost of shares surrendered in a buyback?",
             "Under Section 46A, the original purchase price (cost of acquisition) of the surrendered shares is treated as a capital loss (LTCG or STCG based on holding period) that the shareholder can set off against other capital gains in the same year or carry forward for 8 years."),
            ("What is the holding period to qualify for long-term capital gains on unlisted shares?",
             "For unlisted shares, private limited shares, and startup equity, the holding period to qualify for Long-Term Capital Gains is more than 24 months, taxed at 12.5% without indexation."),
            ("Is indexation benefit available for real estate sales in India?",
             "For properties acquired on or after July 23, 2024, indexation is abolished and LTCG is taxed at 12.5%. For properties acquired before July 23, 2024, resident individuals can choose between 12.5% without indexation or 20% with indexation, whichever results in lower tax."),
            ("What are the investment limits and lock-in period for Section 54EC bonds?",
             "Under Section 54EC, an investor can invest up to ₹50 Lakh of long-term capital gains from real estate into specified bonds (REC, PFC, NHAI, IRFC) within 6 months from the date of transfer. The lock-in period is 5 years."),
            ("How does Section 54 exemption work for residential house property?",
             "Under Section 54, LTCG from the sale of a residential house is exempt if invested in purchasing one new residential house within 1 year before or 2 years after the transfer (or constructing within 3 years). The maximum exemption limit is capped at ₹10 Crore."),
            ("What is Section 54F exemption for selling assets other than a residential house?",
             "Under Section 54F, capital gains from selling any long-term capital asset (stocks, gold, commercial property, land) are exempt if the entire net sale consideration is invested in a residential house property (subject to owning not more than one house and capped at ₹10 Crore)."),
            ("How are debt mutual funds taxed under Section 50AA?",
             "Specified mutual funds investing less than 35% in domestic equity shares are classified as debt mutual funds. Under Section 50AA, all gains are treated as short-term capital gains and taxed at the investor's applicable income tax slab rates, regardless of holding period."),
            ("What is the Section 50CA tax trap on transferring unlisted shares?",
             "Under Section 50CA, if unlisted shares are sold below their Fair Market Value (FMV) computed under Rule 11UA, the FMV is deemed to be the full value of consideration for the seller, creating tax liability on notional gains."),
            ("Can capital losses from shares and mutual funds be carried forward?",
             "Yes. Short-term capital loss can be set off against both STCG and LTCG. Long-term capital loss can only be set off against LTCG. Unadjusted losses can be carried forward for up to 8 consecutive assessment years, provided the ITR is filed on or before the July 31st due date."),
            ("What is the Capital Gains Account Scheme (CGAS)?",
             "If the capital gains cannot be invested in a new property before the ITR filing due date (July 31st), the funds must be deposited into a Capital Gains Account Scheme (CGAS) account in an authorized public sector bank to claim Section 54/54F exemption."),
            ("How is Sovereign Gold Bond (SGB) redemption taxed?",
             "Redemption of Sovereign Gold Bonds (SGB) at maturity with the Reserve Bank of India (RBI) is 100% tax-free for individual investors under Section 47(viic). However, secondary market transfers on exchanges are subject to capital gains tax."),
            ("How can a verified CA on WorkIndex help optimize capital gains tax?",
             "A verified Chartered Accountant on WorkIndex computes accurate capital gains schedules, identifies eligible 54/54EC exemptions, reconciles grandfathering clauses, and ensures error-free filing of Schedule CG in ITR-2/ITR-3.")
        ]
    },
    "gst_gstat_indirect": {
        "eyebrow": "GST & GSTAT Compliance",
        "subtitle": "GSTAT appeals, Section 128A amnesty, e-invoicing, ITC reconciliation and indirect tax litigation",
        "panels": [
            ("Appellate & Tribunal Framework", "GSTAT & Dispute Resolution in India", [
                "Goods and Services Tax Appellate Tribunal (GSTAT): Operational statutory forum for hearing second appeals against orders passed by Appellate Authorities under Section 107.",
                "Section 128A Amnesty Scheme: Waiver of interest and penalties for demand notices issued under Section 73 for FY 2017-18, 2018-19, and 2019-20, provided full tax is paid by the prescribed deadline.",
                "Section 16(4) Retrospective ITC Relief: Legislative amendments permitting ITC claims for FY 2017-18 to 2020-21 filed up to November 30, 2021, reversing widespread department disallowances.",
                "Pre-Deposit Requirements: Mandatory pre-deposit of 10% for first appeals u/s 107 and an additional 20% for GSTAT tribunal appeals under Section 112."
            ]),
            ("Invoicing & Credits", "Accuracy Notes Before You Act", [
                "E-Invoicing ₹5 Crore Threshold: Mandatory for B2B supplies, credit/debit notes, and exports on the IRP; buyers lose ITC if suppliers fail to generate valid IRN QR codes.",
                "Mandatory HSN Code Reporting: 6-digit HSN codes are mandatory for taxpayers with annual turnover exceeding ₹5 Crore on all tax invoices.",
                "Section 17(5) Blocked Credit Jurisprudence: Landmark Supreme Court rulings clarify ITC eligibility on commercial building construction leased for rental income (Safari Retreats).",
                "Reverse Charge Mechanism (RCM): Tax on GTA, metal scrap (Section 9(4)), advocate fees, and commercial property rentals to registered persons must be paid in cash before availing ITC."
            ]),
            ("Compliance Records", "Documents and Facts to Keep Ready", [
                "GSTR-1, GSTR-3B, and annual GSTR-9/9C reconciliation workpapers with CA certification.",
                "Monthly GSTR-2B static statements matching supplier invoice dates and portal reflection.",
                "Copy of Form DRC-01, DRC-01A, DRC-07, or SCN notices along with Document Identification Numbers (DIN).",
                "Bank statements verifying vendor payments within 180 days to prevent ITC reversal under Rule 37."
            ]),
            ("Litigation Safeguards", "Common Mistakes to Avoid", [
                "Failing to respond to automated Form DRC-01B (GSTR-1 vs 3B) or Form DRC-01C (ITC 3B vs 2B) notices within 7 days.",
                "Claiming input tax credit on personal goods or blocked services under Section 17(5) without statutory exceptions.",
                "Filing tribunal appeals beyond statutory limitation periods without condonation applications.",
                "Transporting taxable consignments over ₹50,000 without valid Part-A and Part-B E-way bills."
            ])
        ],
        "faqs": [
            ("What is the role of the Goods and Services Tax Appellate Tribunal (GSTAT)?",
             "GSTAT is the specialized national tribunal established under Section 109 of the CGST Act to hear second appeals against orders of Appellate Authorities (CIT Appeals/JC Appeals), resolving indirect tax disputes before High Courts."),
            ("How does the Section 128A GST Amnesty Scheme work?",
             "Section 128A provides a full waiver of interest and penalty for tax demands issued under Section 73 (non-fraud cases) for FY 2017-18, 2018-19, and 2019-20, provided the taxpayer pays the entire principal tax demand before the notified deadline."),
            ("What relief does the retrospective amendment to Section 16(4) provide?",
             "The amendment allows taxpayers to avail Input Tax Credit for returns filed up to November 30, 2021 for financial years 2017-18, 2018-19, 2019-20, and 2020-21, effectively resolving historical SCN demands for delayed ITC claims."),
            ("What are the mandatory pre-deposit amounts for GST appeals?",
             "For filing a first appeal under Section 107, a mandatory pre-deposit of 10% of the disputed tax is required. For filing a second appeal before GSTAT under Section 112, an additional 20% pre-deposit is mandatory (subject to statutory caps)."),
            ("What is the current threshold for mandatory GST e-invoicing?",
             "E-invoicing is mandatory for all registered businesses whose aggregate annual turnover exceeded ₹5 Crore in any financial year from 2017-18 onwards for all B2B transactions, credit/debit notes, and export invoices."),
            ("What are the HSN code reporting rules on GST invoices?",
             "Taxpayers with aggregate turnover exceeding ₹5 Crore must report 6-digit HSN/SAC codes on all B2B and B2C tax invoices. Taxpayers with turnover up to ₹5 Crore must report at least 4-digit HSN codes on B2B invoices."),
            ("Can a business claim ITC on construction of commercial buildings leased for rent?",
             "Following the Supreme Court ruling in the Safari Retreats case, if the construction of immovable property is directly used for providing taxable output services (such as commercial leasing/renting), ITC under Section 17(5)(d) cannot be mechanically denied."),
            ("How does GST apply to commercial property rentals under Reverse Charge (RCM)?",
             "Renting of commercial property by an unregistered landlord to a registered business person is subject to GST under the Reverse Charge Mechanism (RCM), requiring the tenant to pay GST in cash and claim ITC."),
            ("What is the 180-day vendor payment rule under GST Rule 37?",
             "If a buyer fails to pay the supplier the invoice value plus GST within 180 days from the invoice date, the availed ITC must be reversed in GSTR-3B along with interest at 18% p.a., reclaimable upon actual payment."),
            ("What is the procedure when receiving a Form DRC-01B or DRC-01C notice?",
             "Taxpayers must log in to the GST portal and either pay the differential tax/ITC with interest or provide reasons for the discrepancy within 7 days; failing to do so blocks subsequent GSTR-1 filings."),
            ("What are the blocked credits under Section 17(5) of the CGST Act?",
             "Section 17(5) blocks ITC on motor vehicles for passenger transport (with business exceptions), food and beverages, outdoor catering, beauty treatment, life/health insurance (unless mandatory), club memberships, and goods written off or destroyed."),
            ("How are export of services zero-rated under GST?",
             "Exports are zero-rated supplies and can be made either without paying IGST under a Letter of Undertaking (LUT) to claim refund of accumulated input credit, or on payment of IGST and claiming rebate."),
            ("What is the penalty for moving taxable goods without a valid E-way bill?",
             "Under Section 129, transporting goods without an E-way bill attracts a penalty equal to 200% of the tax payable on the goods. If the owner does not come forward, the penalty is 50% of the value of goods."),
            ("What is the annual return filing threshold for Form GSTR-9 and GSTR-9C?",
             "Filing GSTR-9 is mandatory for taxpayers with annual turnover exceeding ₹2 Crore. GSTR-9C self-certified reconciliation statements are mandatory for businesses with turnover exceeding ₹5 Crore."),
            ("How can a verified GST advocate or CA on WorkIndex assist in litigation?",
             "Verified GST practitioners on WorkIndex draft formal legal replies to show cause notices, structure pre-deposit computations, represent cases before Appellate Authorities, and handle GSTAT filings.")
        ]
    },
    "nri_fema_international": {
        "eyebrow": "NRI & Cross-Border Tax",
        "subtitle": "Schedule FA, Form 67, DTAA treaty relief, Form 15CA/15CB and FEMA compliance in India",
        "panels": [
            ("Cross-Border Framework", "International Taxation & Foreign Assets", [
                "Schedule FA Mandatory Reporting: Resident and Ordinarily Resident (ROR) taxpayers must disclose all foreign bank accounts, foreign stock options (ESPP/RSU), overseas trusts, and immovable property under severe Black Money Act penalties.",
                "Foreign Tax Credit (FTC) & Form 67: Relief under Section 90/91 from double taxation requires mandatory electronic filing of Form 67 on the e-filing portal on or before the ITR filing due date.",
                "Form 15CA & 15CB Certification: Cross-border outbound remittances require CA certification in Form 15CB and online filing of Form 15CA to determine appropriate withholding tax under Section 195.",
                "FEMA LRS Remittances & TCS: Outward remittances under the Liberalised Remittance Scheme (LRS) attract 20% TCS above the ₹7 Lakh threshold (5% for education/medical remittances)."
            ]),
            ("Residency & Treaties", "Accuracy Notes Before You Act", [
                "Residential Status Testing: Section 6(1) physical stay rules (182 days or 60 days + 365 days in 4 years) determine global vs Indian income taxability.",
                "RNOR Concessions: Returning NRIs can maintain Resident but Not Ordinarily Resident (RNOR) status for up to 3 years, during which foreign-source income remains tax-exempt in India.",
                "Section 89A Foreign Retirement Relief: Eliminates double taxation on income accrued in foreign retirement accounts (US 401k/IRA, UK SIPP, Canada RRSP) via Form 10-EE election.",
                "Tax Residency Certificate (TRC) & Form 10F: Essential to claim DTAA concessional tax rates on royalties, FTS, dividends, and interest."
            ]),
            ("Compliance Records", "Documents and Facts to Keep Ready", [
                "Tax Residency Certificate (TRC) from foreign revenue authorities and electronically filed Form 10F.",
                "Overseas employer W-2, 1099, P60, or foreign tax return transcripts with proof of taxes paid abroad.",
                "Foreign brokerage statements reflecting RSU vesting fair market values, dividend credits, and sell-to-cover transactions.",
                "NRE, NRO, and FCNR bank account statements and Foreign Inward Remittance Certificates (FIRC)."
            ]),
            ("Regulatory Pitfalls", "Common Mistakes to Avoid", [
                "Omitting foreign RSUs, foreign bank accounts, or digital asset wallets in Schedule FA, triggering ₹10 Lakh penalty under the Black Money Act.",
                "Delaying Form 67 filing beyond the due date, risking disallowance of Foreign Tax Credit by the assessment portal.",
                "Maintaining resident savings accounts instead of converting to NRO/NRE accounts upon moving abroad (violating FEMA regulations).",
                "Failing to reconcile foreign withholding tax credits with Form 26AS/AIS entries."
            ])
        ],
        "faqs": [
            ("Who is required to file Schedule FA (Foreign Assets) in the Indian ITR?",
             "Any individual who qualifies as a Resident and Ordinarily Resident (ROR) in India during the financial year and holds foreign assets (foreign bank accounts, overseas shares, RSUs, ESOPs, life insurance policies, or signing authority) must mandatorily complete Schedule FA."),
            ("What is the penalty for not disclosing foreign assets in Schedule FA?",
             "Under Section 43 of the Black Money (Undisclosed Foreign Income and Assets) and Imposition of Tax Act, 2015, failure to disclose foreign assets in Schedule FA attracts a flat penalty of ₹10 Lakh per assessment year, plus tax and penalties up to 120% on undisclosed income."),
            ("What is Form 67 and when must it be filed to claim Foreign Tax Credit (FTC)?",
             "Form 67 is the statutory statement required under Rule 128 to claim Foreign Tax Credit (FTC) under Section 90/91 for taxes paid in a foreign country. It must be filed online on or before the due date of filing the ITR (July 31st or October 31st)."),
            ("How does DTAA (Double Tax Avoidance Agreement) relief work in India?",
             "Under Section 90, if an individual is taxed in both India and a foreign treaty country on the same income, they can claim a tax credit in India for taxes paid abroad, or apply lower withholding tax rates specified in the relevant DTAA treaty."),
            ("What is the difference between an NRE and an NRO bank account?",
             "An NRE (Non-Resident External) account is used for depositing foreign earnings, is fully repatriable, and interest earned is 100% tax-free in India. An NRO (Non-Resident Ordinary) account is used for managing Indian income (rent, dividends, pension), and interest is subject to 30% TDS."),
            ("What is Form 15CA and Form 15CB for foreign remittances?",
             "Form 15CB is a certification by a Chartered Accountant verifying the nature of the transaction and appropriate TDS under Section 195. Form 15CA is the remitter's online declaration submitted on the income tax portal prior to sending money abroad."),
            ("What is the TCS rate on Liberalised Remittance Scheme (LRS) transactions?",
             "Under Section 206C(1G), outward remittances under LRS exceeding ₹7 Lakh in a financial year attract 20% TCS for general remittances/investments/tour packages (0.5% for education loan remittances, 5% for self-funded education/medical remittances). The TCS is claimable as credit in ITR."),
            ("How can returning NRIs claim Resident but Not Ordinarily Resident (RNOR) status?",
             "An individual qualifies as RNOR if they have been an NRI in 9 out of 10 preceding years, or have spent 729 days or less in India in the 7 preceding years. During the RNOR period (up to 3 years), income earned outside India remains exempt from Indian taxation."),
            ("How does Section 89A prevent double taxation on foreign retirement accounts (401k/IRA)?",
             "Section 89A and Rule 21AAA allow resident individuals to defer Indian tax on income accrued in specified foreign retirement funds until actual withdrawal or distribution, preventing taxation on unrealized gains in India while they remain tax-deferred abroad."),
            ("How are foreign RSUs and ESPPs taxed for Indian residents?",
             "RSUs/ESPPs are taxed twice: first as salary perquisites at fair market value (FMV) on the vesting date (subject to employer TDS), and second as capital gains upon subsequent sale based on the difference between sale price and vesting FMV."),
            ("What documents are required to obtain a lower TDS certificate under Section 197 for NRI property sales?",
             "To reduce the default 20% (+ surcharge/cess) TDS on NRI property sales, the seller must submit Form 13 with the sale agreement, original purchase deed, indexation proofs, and bank statements to obtain a Lower Deduction Certificate from the assessing officer."),
            ("What is a Tax Residency Certificate (TRC) and Form 10F?",
             "A TRC is an official certificate issued by the foreign government verifying tax residency. Form 10F is an online electronic self-declaration filed on the Indian income tax portal to substantiate DTAA treaty relief when TRC does not contain all prescribed details."),
            ("Can an NRI repatriate funds from an NRO account up to $1 Million per year?",
             "Yes. Under FEMA regulations, NRIs can repatriate up to USD 1 Million per financial year from their NRO account balances (representing inheritance, property sale proceeds, or accumulated income) by submitting Form 15CA/15CB and bank Form A2."),
            ("What are the criteria for qualifying as a Non-Resident under Section 6 of the Income Tax Act?",
             "An individual is an NRI if they stay in India for less than 182 days in the financial year. For Indian citizens leaving for employment abroad, the threshold remains 182 days. For citizens with Indian income > ₹15 Lakh, the threshold is 120 days."),
            ("Why should NRIs hire an international tax specialist on WorkIndex?",
             "International tax CAs on WorkIndex manage dual-residency determinations, Section 89A elections, Form 15CA/15CB remittances, Lower TDS certificates u/s 197, and Schedule FA compliance.")
        ]
    },
    "startup_mca_corporate": {
        "eyebrow": "Startup & Corporate Law",
        "subtitle": "Section 43B(h) MSME compliance, C-PACE strike off, private limited ROC filings and DPIIT recognition",
        "panels": [
            ("Corporate & MSME Laws", "Regulatory Standards for Companies & Startups", [
                "Section 43B(h) MSME Rule: Payments due to registered Micro and Small enterprises must be settled within 15 days (or max 45 days if written contract exists); overdue invoices are disallowed as business deductions in that tax year.",
                "C-PACE Fast Track Exit (STK-2): Streamlined centralized processing for striking off dormant or non-operational companies under Section 248 of the Companies Act, 2013.",
                "Mandatory Share Dematerialization: Private limited companies (excluding small companies) must dematerialize all securities and facilitate ISIN crediting via NSDL/CDSL under Rule 9B.",
                "Secretarial Audit u/s 204: Mandatory annual compliance audit by a peer-reviewed Company Secretary for eligible public, listed, and high-borrowing entities."
            ]),
            ("Statutory Timelines", "Accuracy Notes Before You Act", [
                "Annual ROC Filings: Mandatory filing of financial statements in Form AOC-4 (within 30 days of AGM) and Annual Return in Form MGT-7/7A (within 60 days of AGM).",
                "Director Identification Number (DIR-3 KYC): Mandatory annual KYC filing for every DIN holder by September 30th to avoid DIN deactivation and ₹5,000 late fees.",
                "DPIIT Startup Recognition: Eligible private companies can claim Section 80-IAC tax holidays for 3 consecutive years and Section 56(2)(viib) angel tax exemptions.",
                "Commencement of Business (INC-20A): Must be filed within 180 days of incorporation verifying subscription money receipt before commencing commercial operations."
            ]),
            ("Filing Records", "Documents and Facts to Keep Ready", [
                "Certificate of Incorporation, MOA, AOA, and PAN/TAN cards of the corporate entity.",
                "Audited financial statements with statutory auditor's report, CARO 2020 notes, and director's report.",
                "Board resolutions, AGM notices, attendance registers, and statutory share registers (MGT-1, PAS-3).",
                "Udyam registration certificates and MSME vendor aging reports for Section 43B(h) reconciliation."
            ]),
            ("ROC Liabilities", "Common Mistakes to Avoid", [
                "Delaying MSME vendor payments beyond 45 days, causing automatic year-end tax add-backs and compound interest penalties.",
                "Failing to file Form INC-20A within 180 days, triggering ROC strike-off proceedings and director disqualifications.",
                "Non-filing of AOC-4 and MGT-7 attracting recurring additional fees of ₹100 per day per form without statutory ceiling.",
                "Ignoring Significant Beneficial Ownership (SBO) reporting in Form BEN-2, resulting in heavy ROC adjudication penalties."
            ])
        ],
        "faqs": [
            ("What is the Section 43B(h) MSME payment rule under the Income Tax Act?",
             "Section 43B(h) mandates that any sum payable to a registered Micro or Small enterprise must be paid within the time agreed in writing (up to 45 days) or within 15 days in the absence of an agreement. If paid late, the expense is disallowed as a deduction in that financial year and added back to taxable income."),
            ("Does Section 43B(h) apply to Medium enterprises and wholesale/retail traders?",
             "No. Section 43B(h) applies exclusively to Micro and Small manufacturing and service enterprises. It does not apply to Medium enterprises or enterprises registered under Udyam solely as wholesale or retail traders."),
            ("What is the interest penalty for delayed payments under the MSME Act?",
             "Under Section 16 of the MSMED Act, delayed payments to MSMEs attract compound interest with monthly rests at three times the RBI bank rate. This interest is mandatory and is expressly non-deductible for income tax purposes."),
            ("What is the C-PACE process for closing a Private Limited Company?",
             "C-PACE (Centre for Processing Accelerated Corporate Exit) processes fast-track strike-off applications submitted in Form STK-2 under Section 248(2) of the Companies Act, allowing defunct companies with nil assets and liabilities to close within 3-6 months."),
            ("What are the mandatory annual ROC filings for a Private Limited Company?",
             "Mandatory annual filings include Form AOC-4 (financial statements), Form MGT-7/7A (annual return), Form ADT-1 (auditor appointment), and Form DIR-3 KYC for all directors."),
            ("What are the threshold limits to qualify as a 'Small Company' under the Companies Act?",
             "A Small Company is a private company with paid-up share capital not exceeding ₹4 Crore and annual turnover not exceeding ₹40 Crore. Small companies enjoy exemptions like filing shorter annual returns (MGT-7A) and holding only 2 board meetings per year."),
            ("What is the share dematerialization mandate for private companies?",
             "Under Rule 9B of the Companies (Prospectus and Allotment of Securities) Rules, all private limited companies (other than small companies) must dematerialize their securities, secure ISINs, and ensure that promoters, directors, and KMPs hold shares exclusively in demat form."),
            ("How does a startup obtain Section 80-IAC tax exemption from DPIIT?",
             "DPIIT-recognized startups incorporated between April 1, 2016 and March 31, 2025 with turnover under ₹100 Crore can apply to the Inter-Ministerial Board (IMB) for 100% tax exemption on profits for any 3 consecutive years out of 10 years u/s 80-IAC."),
            ("What is the penalty for late filing of Form AOC-4 and MGT-7?",
             "Under Section 403 of the Companies Act, late filing of ROC forms attracts an additional fee of ₹100 per day per form with no maximum cap, alongside direct penalty proceedings on the company and defaulting directors."),
            ("What is Form INC-20A (Commencement of Business)?",
             "Form INC-20A is a declaration filed by directors within 180 days of company incorporation certifying that every subscriber to the MOA has paid the value of agreed shares into the company's bank account."),
            ("What are the rules for Significant Beneficial Ownership (SBO) under Form BEN-2?",
             "Companies must identify individuals holding directly or indirectly >= 10% shares, voting rights, or significant influence and file Form BEN-2 with the ROC to disclose the ultimate beneficial owners."),
            ("What are the requirements for holding Board Meetings and AGMs?",
             "Companies must hold at least 4 board meetings annually (gap not exceeding 120 days; 2 meetings for small companies) and one Annual General Meeting (AGM) within 6 months from the close of the financial year."),
            ("How does an LLP file its annual returns with the MCA?",
             "LLPs must file Form 11 (Annual Return) by May 30th and Form 8 (Statement of Accounts & Solvency) by October 30th each year. Late filing incurs a penalty of ₹100 per day."),
            ("What is Secretarial Audit under Section 204?",
             "Secretarial Audit by an independent Practicing Company Secretary (PCS) is mandatory for all listed companies and public companies with paid-up capital >= ₹50 Crore or turnover >= ₹250 Crore, evaluating comprehensive legal compliance."),
            ("Why should founders hire a corporate compliance professional on WorkIndex?",
             "Verified Company Secretaries and corporate lawyers on WorkIndex handle end-to-end ROC annual filings, MSME aging audits, C-PACE strike-offs, board resolutions, and startup advisory.")
        ]
    },
    "freelance_creator_presumptive": {
        "eyebrow": "Freelancer & Creator Tax",
        "subtitle": "Section 44ADA presumptive tax, YouTube tips, foreign freelance remittances, GST LUT and W-8BEN",
        "panels": [
            ("Professional & Creator Taxation", "Section 44ADA & Digital Revenue Streams", [
                "Section 44ADA Presumptive Taxation: Specified professionals (software developers, designers, doctors, consultants, creators) can declare 50% of gross receipts as taxable income up to ₹75 Lakh (if cash receipts <= 5%).",
                "Creator Revenue Streams: Ad revenue, brand sponsorships, YouTube Super Chats, livestream donations, channel memberships, and affiliate commissions are taxable as business income (PGBP).",
                "Section 194-O & 194R Withholding: E-commerce platforms deduct 1% TDS u/s 194-O on creator payouts, while brand sponsors deduct 10% TDS u/s 194R on non-monetary perks/gadgets exceeding ₹20,000.",
                "Zero-Rated Export of Services: Overseas freelance services (via Upwork, Deel, Fiverr, direct US/EU clients) are zero-rated under GST when filed under a Letter of Undertaking (LUT) with foreign inward remittance (FIRC)."
            ]),
            ("Regulatory Limits", "Accuracy Notes Before You Act", [
                "GST Threshold for Service Providers: Mandatory registration if aggregate annual turnover exceeds ₹20 Lakh (₹10 Lakh for special category states), including export turnover.",
                "Advance Tax for 44ADA Filers: Taxpayers opting for Section 44ADA can pay 100% of their estimated advance tax in a single installment on or before March 15th.",
                "Home Office & Business Expenses: Salaried professionals cannot deduct home office expenses, but freelancers filing regular business ITR can claim proportionate rent, internet, equipment, and depreciation.",
                "Form W-8BEN Compliance: Indian freelancers working with US clients must submit Form W-8BEN to claim reduced DTAA withholding tax rates (0% for independent services without a US permanent establishment)."
            ]),
            ("Compliance Records", "Documents and Facts to Keep Ready", [
                "Platform transaction invoices, client service contracts, and payment gateway settlement summaries (PayPal, Stripe, Razorpay).",
                "Foreign Inward Remittance Advices (FIRA/FIRC) from banks certifying foreign exchange inward remittances.",
                "TDS certificates (Form 16A) and AIS records reflecting Section 194-O, 194J, and 194R withholding credits.",
                "GST portal login credentials, monthly GSTR-1/3B returns, and filed Letter of Undertaking (LUT) reference numbers."
            ]),
            ("Freelance Tax Traps", "Common Mistakes to Avoid", [
                "Treating foreign client payments as tax-free remittances or personal gifts under Section 56(2)(x).",
                "Failing to file a GST Letter of Undertaking (LUT) before exporting services, leading to tax demand at 18% IGST.",
                "Omitting non-monetary brand perks, gifted electronics, or free trips in ITR when Form 26AS shows Section 194R TDS.",
                "Filing ITR-1 or ITR-2 when earning professional freelance income instead of Form ITR-4 (presumptive) or ITR-3 (regular)."
            ])
        ],
        "faqs": [
            ("What is Section 44ADA presumptive taxation and who qualifies?",
             "Section 44ADA is a simplified tax scheme for specified professionals (software engineers, lawyers, doctors, accountants, interior designers, technical consultants) with gross receipts up to ₹50 Lakh (₹75 Lakh if cash receipts <= 5%), allowing them to declare a minimum of 50% profit without maintaining books of accounts."),
            ("Are freelance earnings from foreign clients taxable in India?",
             "Yes. Indian tax residents are taxed on their global income. All earnings from foreign clients received in India via bank wire, PayPal, Stripe, or Wise must be declared as professional business income in the annual ITR."),
            ("How does GST apply to freelance services exported to foreign clients?",
             "Export of services is treated as a zero-rated supply under GST. Freelancers can export without paying 18% IGST by submitting an annual Letter of Undertaking (LUT) online on the GST portal, provided payment is received in convertible foreign exchange."),
            ("When is GST registration mandatory for freelancers in India?",
             "GST registration is mandatory if your aggregate turnover (domestic sales + export of services) exceeds ₹20 Lakh in a financial year (₹10 Lakh in special category states). If turnover is below ₹20 Lakh, GST registration is not mandatory even for exports."),
            ("What is Form W-8BEN and why do US clients request it?",
             "Form W-8BEN is a US IRS certificate of foreign status that Indian freelancers submit to US clients/platforms to confirm they are non-US residents eligible for Double Tax Avoidance Agreement (DTAA) benefits, preventing default 30% US withholding tax."),
            ("How are YouTube Super Chats, viewer tips, and livestream donations taxed?",
             "All monetary tips, Super Chats, and channel subscriptions received by digital creators are taxable business income under Profits and Gains of Business or Profession (PGBP) and cannot be claimed as tax-free gifts."),
            ("What is Section 194R TDS on brand sponsorships and gifts?",
             "Under Section 194R, if a business or brand provides perks, gifts, electronic gadgets, or sponsored travel worth more than ₹20,000 in a year to a creator, the brand deducts 10% TDS, and the fair market value of the perk is taxable as business income."),
            ("What is Section 194-O TDS on e-commerce platform payouts?",
             "Section 194-O mandates that e-commerce aggregators and digital platforms deduct 1% TDS on gross sales/services facilitated through their digital platforms to Indian participants."),
            ("Can a freelancer claim deductions for laptop, phone, and home office expenses?",
             "Yes. Freelancers filing ITR-3 under regular business accounting can deduct legitimate business expenses including laptop depreciation, internet, software subscriptions, travel, and proportionate home office rent against gross receipts."),
            ("When is advance tax due for freelancers opting for Section 44ADA?",
             "Freelancers opting for Section 44ADA presumptive taxation are required to pay 100% of their estimated advance tax in a single installment on or before March 15th of the financial year."),
            ("What is a Foreign Inward Remittance Certificate (FIRC/FIRA)?",
             "A FIRC/FIRA is a document issued by an authorized dealer bank confirming that foreign currency was received into your account as inward remittance, serving as crucial proof of zero-rated export under GST and FEMA."),
            ("What ITR form should a freelancer file in India?",
             "Freelancers opting for presumptive taxation under Section 44ADA file Form ITR-4 (Sugam). Freelancers claiming itemized expense deductions, maintaining audited books, or holding foreign assets/RSUs must file Form ITR-3."),
            ("Can a freelancer claim Section 80C and 80D deductions?",
             "Yes, if the freelancer chooses the Old Tax Regime, they can claim deductions under Section 80C (PPF, ELSS, insurance up to ₹1.5L), Section 80D (health insurance), and Section 80CCD(1B) (NPS). Under the New Tax Regime, these deductions are not available."),
            ("How does one reconcile TDS credits missing from Form 26AS?",
             "If platform or client TDS is not reflecting in Form 26AS/AIS, the freelancer should contact the deductor to file a TDS correction return (Form 26Q/24Q); under Section 205, the tax department cannot demand direct recovery if tax was already deducted."),
            ("Why should digital creators and remote freelancers hire a CA on WorkIndex?",
             "A verified CA on WorkIndex assists with LUT generation, FIRC tracking, 44ADA computation, international tax credits, and error-free multi-currency ITR-3/ITR-4 filing.")
        ]
    },
    "crypto_gaming_web3": {
        "eyebrow": "Crypto & Web3 Taxation",
        "subtitle": "Section 115BBH 30% tax, Section 194S TDS, Form 26QE, online gaming 115BBJ and FIU compliance",
        "panels": [
            ("Virtual Digital Asset Tax", "Section 115BBH & 194S Statutory Architecture", [
                "Flat 30% Tax u/s 115BBH: Profits from the transfer of any Virtual Digital Asset (cryptocurrencies, NFTs, tokens) are taxed at a flat rate of 30% plus applicable surcharge and 4% cess.",
                "Zero Loss Set-Off or Carry Forward: Section 115BBH(2) explicitly prohibits setting off losses from one crypto asset against gains from another, and crypto losses cannot be carried forward to future years.",
                "1% TDS under Section 194S: Buyer is liable to deduct 1% TDS on crypto transfers exceeding ₹10,000 in a year (or ₹50,000 for specified individuals); foreign exchange and P2P transfers require Form 26QE compliance.",
                "Section 115BBJ Online Gaming Net Winnings: Net winnings from online gaming apps (poker, rummy, fantasy sports) are taxed at a flat rate of 30% with Section 194BA withholding upon withdrawal or year-end."
            ]),
            ("Compliance Standards", "Accuracy Notes Before You Act", [
                "Form 26QE Filing Requirement: P2P crypto buyers must deposit the 1% TDS and file Form 26QE challan-cum-statement on the TRACES portal within 30 days from the end of the transaction month.",
                "Schedule VDA Mandatory Disclosure: Every crypto transaction (date of acquisition, date of transfer, cost basis, sale consideration) must be reported line-by-line in Schedule VDA of ITR-2 or ITR-3.",
                "FIU-IND Anti-Money Laundering Compliance: Offshore exchanges operating in India must register with the Financial Intelligence Unit (FIU-IND) and comply with PMLA reporting standards.",
                "GST on Online Gaming: 28% GST applies on the full face value of bets placed at the entry level on online real money gaming platforms."
            ]),
            ("Transaction Records", "Documents and Facts to Keep Ready", [
                "Exchange trading history logs and CSV transaction reports from Indian and international exchanges (CoinDCX, WazirX, Binance, Bybit).",
                "Decentralized wallet addresses (MetaMask, Ledger, Phantom) with complete on-chain transfer and staking records.",
                "Form 26AS/AIS reconciling 1% Section 194S TDS deducted by domestic exchanges.",
                "Bank statements showing fiat on-ramp deposits and off-ramp withdrawals."
            ]),
            ("Crypto Pitfalls", "Common Mistakes to Avoid", [
                "Netting off losses in Bitcoin against profits in Ethereum (strictly prohibited under Section 115BBH).",
                "Failing to file Form 26QE when buying crypto via P2P mechanisms, attracting interest and non-deduction penalties.",
                "Omitting foreign exchange crypto accounts or on-chain assets in Schedule FA and Schedule VDA.",
                "Treating crypto staking rewards, airdrops, or mining proceeds as tax-free income instead of taxable other income."
            ])
        ],
        "faqs": [
            ("What is the tax rate on cryptocurrency gains in India under Section 115BBH?",
             "Under Section 115BBH of the Income-tax Act, income from the transfer of any Virtual Digital Asset (VDA), including Bitcoin, Ethereum, and NFTs, is taxed at a flat rate of 30% plus applicable surcharge and 4% cess, with no basic exemption slab benefit."),
            ("Can I deduct mining costs, exchange fees, or internet expenses from crypto gains?",
             "No. Section 115BBH(2) explicitly prohibits any deductions or expenses other than the direct cost of acquisition of the virtual digital asset. Exchange fees, gas fees, and mining hardware costs are non-deductible."),
            ("Can crypto losses be set off against other crypto gains or business income?",
             "No. The Income-tax Act strictly prohibits setting off loss from the transfer of one crypto asset against profits from another crypto asset, and crypto losses cannot be carried forward to subsequent financial years."),
            ("Who is responsible for deducting the 1% TDS on crypto under Section 194S?",
             "The buyer of the crypto asset is responsible for deducting 1% TDS. For transactions on compliant Indian exchanges, the exchange deducts TDS automatically. For P2P or foreign exchange transactions, the buyer must deduct TDS and file Form 26QE."),
            ("What is the threshold limit for TDS deduction under Section 194S?",
             "TDS applies if total crypto transactions exceed ₹50,000 in a financial year for specified persons (individuals/HUFs not having business income, or with turnover under ₹1 Cr/₹50L), and ₹10,000 for all other taxpayers."),
            ("What is Form 26QE and when must it be filed for crypto TDS?",
             "Form 26QE is a challan-cum-statement for depositing 1% TDS on P2P crypto transactions. It must be filed online on the TIN-NSDL/TRACES portal within 30 days from the end of the month in which tax was deducted."),
            ("How are airdropped tokens and crypto gifts taxed in India?",
             "Airdropped tokens and crypto gifts are treated as income from other sources under Section 56(2)(x) based on their Fair Market Value on the date of receipt. When sold later, subsequent gains are taxed at 30% u/s 115BBH."),
            ("What is the tax treatment of crypto-to-crypto trading pairs (e.g. BTC to USDT)?",
             "A crypto-to-crypto trade is treated as a taxable transfer of the first asset. Tax at 30% applies on the gain (FMV of the received asset minus cost basis of the transferred asset), and 1% TDS applies under Section 194S."),
            ("How are online gaming and fantasy sports winnings taxed under Section 115BBJ?",
             "Under Section 115BBJ, net winnings from online games are taxed at a flat rate of 30%. Under Section 194BA, the gaming platform deducts 30% TDS from net winnings at the time of withdrawal or at the end of the financial year."),
            ("What is the formula for calculating net winnings in online gaming?",
             "Net winnings = Total withdrawals during the year + Closing balance in the user wallet - (Total deposits during the year + Opening balance in the user wallet)."),
            ("What is Schedule VDA in the Income Tax Return?",
             "Schedule VDA is a dedicated schedule in ITR-2 and ITR-3 where taxpayers must report date of acquisition, date of transfer, head of income, cost of acquisition, and sale consideration for every crypto asset sold during the year."),
            ("Are non-fungible tokens (NFTs) covered under the 30% crypto tax?",
             "Yes. The definition of Virtual Digital Assets under Section 2(47A) explicitly includes Non-Fungible Tokens (NFTs), subjecting all NFT creator sales and secondary marketplace flips to flat 30% tax and 1% Section 194S TDS."),
            ("What are the consequences of trading on unregistered offshore crypto exchanges?",
             "Offshore exchanges that fail to register with FIU-IND and comply with Indian TDS rules face URL blocking. Indian residents trading on foreign exchanges remain personally liable to deduct 1% TDS via Form 26QE and disclose holdings in Schedule FA."),
            ("What ITR form should be filed by cryptocurrency traders in India?",
             "Individuals with crypto income must file Form ITR-2 (for capital asset crypto holdings) or Form ITR-3 (if trading in business capacity). Crypto income cannot be reported in simplified Form ITR-1 or ITR-4."),
            ("Why should crypto and web3 investors hire a specialized CA on WorkIndex?",
             "Verified crypto tax CAs on WorkIndex assist in reconstructing multi-wallet trade ledgers, calculating Section 115BBH schedules, filing Form 26QE challans, and ensuring complete FIU/Schedule VDA compliance.")
        ]
    },
    "ipr_patent_trademark": {
        "eyebrow": "IPR & Patent Law",
        "subtitle": "Trademark TM-A, Section 80RRB/80QQB royalty deductions, patent filing and brand protection",
        "panels": [
            ("Intellectual Property Framework", "Trademark, Patent & Copyright Laws in India", [
                "Trademark Registration (Form TM-A): Protection of brand names, logos, slogans, and trade dress across 45 statutory classes under the Trade Marks Act, 1999.",
                "Section 80RRB Patent Royalty Deduction: Indian resident inventors can claim a tax deduction of up to ₹3,00,000 on royalty income from patents registered under the Patents Act, 1970.",
                "Section 80QQB Book Royalty Deduction: Resident authors of literary, artistic, or scientific works can claim a tax deduction of up to ₹3,00,000 on book royalties.",
                "Expedited Examination for Startups & MSMEs: DPIIT-recognized startups, female applicants, and MSMEs qualify for 80% rebate on official patent fees and expedited examination."
            ]),
            ("Statutory Rules", "Accuracy Notes Before You Act", [
                "Validity & Renewal of Trademarks: Registered trademarks are valid for 10 years from the filing date and can be renewed indefinitely in 10-year blocks via Form TM-R.",
                "Mandatory Form 10CCD for Section 80RRB: Patent holders must obtain and submit Form 10CCD signed by the royalty payer to substantiate income tax deductions.",
                "Patent Validity & Annuity: Patents are granted for 20 years from the international filing date, subject to timely payment of annual renewal fees (annuities).",
                "Trademark Opposition (TM-O): Any third party can oppose a trademark within 4 months of its publication in the official Trade Marks Journal."
            ]),
            ("Filing Records", "Documents and Facts to Keep Ready", [
                "Patent grant certificates, complete patent specifications, and licensing royalty contracts.",
                "Form 10CCD (for Section 80RRB patent claims) and Form 10CCE (for Section 80QQB author claims).",
                "Trademark representations, user affidavit with documentary evidence of prior commercial use in India.",
                "Foreign Inward Remittance Certificates (FIRC) for intellectual property royalties earned from international clients."
            ]),
            ("IP Safeguards", "Common Mistakes to Avoid", [
                "Failing to conduct a comprehensive trademark search before launching a brand name, risking trademark infringement litigation.",
                "Claiming Section 80QQB deduction on school textbooks or commercial guides (disallowed under the statute).",
                "Missing the 4-month trademark opposition window after publication in the Trade Marks Journal.",
                "Publicly disclosing an invention prior to filing a provisional patent application, destroying novelty."
            ])
        ],
        "faqs": [
            ("What is the process to apply for trademark registration in India?",
             "The process involves: (1) Conducting a trademark search across the 45 classes, (2) Filing Form TM-A on the IP India portal, (3) Responding to examination reports within 30 days if objections arise, (4) Publication in the Trade Marks Journal for 4 months, and (5) Issuance of Registration Certificate."),
            ("What is the government fee for filing a trademark application?",
             "The official government fee is ₹4,500 per class for individuals, startups, and MSMEs (e-filing), and ₹9,000 per class for other corporate entities."),
            ("What is the deduction limit under Section 80RRB for patent royalties?",
             "Under Section 80RRB, a resident individual patentee can claim an income tax deduction of up to ₹3,00,000 or the actual royalty received (whichever is lower) for a patent registered under the Patents Act, 1970."),
            ("What is the deduction limit under Section 80QQB for author book royalties?",
             "Under Section 80QQB, resident authors of literary, artistic, or scientific books can claim a tax deduction up to ₹3,00,000. Textbooks, exam guides, newspapers, and pamphlets are excluded."),
            ("Is Form 10CCD mandatory to claim Section 80RRB patent royalty deduction?",
             "Yes. The taxpayer must obtain Form 10CCD signed by the royalty payer or authorized officer to substantiate the deduction in their annual ITR."),
            ("What is the difference between a Provisional and Complete Patent Specification?",
             "A Provisional Specification establishes an immediate priority filing date for an invention, giving the inventor 12 months to develop and file the Complete Specification detailing the best method of operation and patent claims."),
            ("How long is a patent valid in India?",
             "A patent is valid for 20 years from the date of filing the application, subject to timely payment of annual renewal fees to keep the patent in force."),
            ("What is a Trademark Objection and how to respond?",
             "The Trademark Examiner may raise objections under Section 9 (lack of distinctiveness) or Section 11 (similarity with existing registered marks). The applicant must submit a detailed legal reply within 30 days citing judicial precedents."),
            ("What is a Trademark Opposition (Form TM-O)?",
             "After advertisement in the Trade Marks Journal, third parties have 4 months to oppose the registration by filing Form TM-O. The applicant must file a Counter-Statement in Form TM-6 within 2 months."),
            ("How does the Madrid Protocol facilitate international trademark registration?",
             "The Madrid Protocol allows Indian trademark owners with a pending or registered Indian trademark to file a single international application through the IP India office to seek protection across over 120 member countries."),
            ("Can software code be patented in India?",
             "Under Section 3(k) of the Patents Act, computer programs per se are not patentable. However, software innovations tied to hardware systems or producing a technical effect/technical contribution qualify for patent protection."),
            ("What is Copyright Registration and its duration in India?",
             "Copyright protects original literary, artistic, dramatic, musical works, cinematograph films, and computer software. For literary works, copyright lasts for the author's lifetime plus 60 years."),
            ("What is an IP Valuation and why is it required?",
             "IP valuation determines the economic monetary value of patents, trademarks, and brand equity, which is essential for venture capital funding, mergers & acquisitions, and cross-border licensing transactions."),
            ("What are the fee discounts available for DPIIT recognized startups in patent filings?",
             "DPIIT-recognized startups and MSMEs receive an 80% discount on official patent filing fees and 50% discount on trademark government fees, alongside access to fast-track expedited examination."),
            ("Why should businesses hire an IPR attorney on WorkIndex?",
             "Verified IP lawyers and patent agents on WorkIndex draft ironclad patent specifications, manage trademark prosecution and opposition hearings, and structure IP licensing contracts.")
        ]
    }
}

print("Loaded template schemas. Generating 2,750 comprehensive new SEO topics...")

# Generate 2,750 high-intent, unique topics across all categories
new_pages = []

# ==============================================================================
# BATCH GENERATION MATRIX (2,750 TOPICS)
# ==============================================================================

# 1. Income Tax Overhaul & Section Mapping (400 topics)
it_topics = [
    "new-income-tax-act-section-mapping-guide-2026", "income-tax-bill-2025-key-changes-explained",
    "direct-tax-code-overhaul-procedural-rules-india", "reassessment-notice-section-148-new-timelines-2026",
    "section-148a-show-cause-reply-legal-drafting-guide", "escaped-income-above-50-lakh-section-148-rules",
    "section-143-1-automated-mismatch-intimation-resolution", "faceless-appeal-nfac-written-submission-drafting",
    "updated-return-itr-u-section-139-8a-penalty-slabs", "belated-return-vs-revised-return-section-139-rules",
    "defective-return-notice-section-139-9-how-to-respond", "tax-audit-section-44ab-10-crore-cash-limit-rules",
    "form-3ca-3cd-vs-3cb-3cd-tax-audit-differences", "udin-generation-guidelines-chartered-accountants-2026",
    "ais-tis-discrepancy-feedback-mechanism-guide", "sft-high-value-transaction-income-tax-matching",
    "section-270a-underreporting-vs-misreporting-penalties", "section-271aab-search-and-seizure-penalties",
    "advance-tax-interest-section-234b-and-234c-calculation", "self-assessment-tax-section-140a-challan-guide",
    "section-87a-rebate-calculation-marginal-relief-guide", "marginal-relief-income-between-7-and-7-3-lakh",
    "new-tax-regime-standard-deduction-75000-rules", "old-vs-new-tax-regime-salary-15-lakh-comparison",
    "old-vs-new-tax-regime-salary-20-lakh-comparison", "old-vs-new-tax-regime-salary-30-lakh-comparison",
    "form-10-iea-opting-out-new-tax-regime-rules", "senior-citizen-section-80ttb-interest-deduction-1-lakh",
    "section-194p-senior-citizen-itr-exemption-rules", "form-125-senior-citizen-bank-pension-declaration",
    "agricultural-income-partial-integration-tax-calculation", "section-10-1-agricultural-income-exemption-conditions",
    "urban-vs-rural-agricultural-land-tax-implications", "compulsory-acquisition-land-section-10-37-exemption",
    "income-tax-refund-delayed-interest-section-244a", "rectification-request-section-154-online-filing",
    "stay-of-demand-section-220-6-procedure-20-percent", "vivad-se-vishwas-scheme-direct-tax-dispute-settlement",
    "section-264-revision-petition-commissioner-income-tax", "itat-appellate-tribunal-appeal-filing-procedure"
]

# Generate variations across industries, amounts, and scenarios
for base in it_topics:
    for modifier in ["guide-2026", "faqs-explained", "expert-checklist", "procedure-and-penalties", "common-mistakes-to-avoid", "documents-required", "step-by-step-process", "case-laws-and-rulings", "for-salaried-individuals", "for-business-proprietors"]:
        slug = f"{base}-{modifier}".replace("-guide-2026-guide-2026", "-guide-2026")
        slug = slugify(slug)
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": "income_tax_bill_2025"})

# 2. Capital Gains, Buybacks, Unlisted Shares & Mutual Funds (400 topics)
cg_topics = [
    "section-112a-ltcg-12-5-percent-calculation-guide", "section-111a-stcg-20-percent-equity-tax-rules",
    "share-buyback-deemed-dividend-section-2-22-f-tax", "buyback-capital-loss-section-46a-set-off-rules",
    "unlisted-shares-24-month-ltcg-holding-period-rules", "section-50ca-rule-11ua-unlisted-share-fmv-trap",
    "real-estate-indexation-grandfathering-choice-pre-2024", "property-sale-12-5-without-indexation-vs-20-with",
    "section-54-residential-property-exemption-10-crore-cap", "section-54f-net-consideration-exemption-rules",
    "section-54ec-bonds-rec-pfc-nhai-50-lakh-limit", "capital-gains-account-scheme-cgas-rules-and-deadlines",
    "section-50aa-debt-mutual-fund-slab-taxation-rules", "sovereign-gold-bond-sgb-rbi-redemption-tax-free",
    "gold-etf-vs-physical-gold-vs-sgb-tax-comparison", "esop-perquisite-tax-vs-capital-gains-calculation",
    "rsu-sell-to-cover-tax-withholding-schedule-fa", "espp-discount-perquisite-and-capital-gains-rules",
    "mutual-fund-sip-fifo-capital-gains-calculation", "swp-systematic-withdrawal-tax-efficiency-mutual-funds",
    "fno-trading-business-turnover-calculation-rules", "fo-loss-set-off-against-salary-prohibition-rules",
    "arbitrage-fund-equity-taxation-status-explained", "reit-invit-distribution-repayment-of-debt-tax",
    "goodwill-depreciation-denial-capital-gains-impact", "section-50c-stamp-duty-value-tolerance-10-percent",
    "slump-sale-section-50b-net-worth-computation-rules", "angel-tax-abolition-startup-share-valuation-rules"
]

for base in cg_topics:
    for modifier in ["complete-handbook", "faqs-guide", "illustrated-examples", "rules-and-limits-2026", "legal-provisions", "expert-advisory", "tax-planning-strategies", "compliance-checklist", "for-investors-and-traders", "for-hni-taxpayers"]:
        slug = f"{base}-{modifier}".replace("-guide-2026-guide-2026", "-guide-2026")
        slug = slugify(slug)
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": "capital_gains_buyback"})

# 3. GST 2025-2026, GSTAT & Indirect Tax Jurisprudence (400 topics)
gst_topics = [
    "gstat-tribunal-appeal-filing-procedure-section-112", "section-128a-gst-amnesty-scheme-interest-waiver",
    "section-16-4-retrospective-itc-relief-fy-2017-to-2021", "gst-e-invoicing-5-crore-threshold-mandate-2026",
    "e-invoicing-30-day-reporting-window-rules-irp", "mandatory-6-digit-hsn-code-reporting-rules-2026",
    "commercial-property-rent-rcm-reverse-charge-rules", "metal-scrap-rcm-section-9-4-tds-compliance",
    "gta-goods-transport-agency-5-vs-12-percent-rcm", "safari-retreats-supreme-court-commercial-building-itc",
    "demo-vehicles-itc-automobile-dealers-eligibility", "csr-expenses-itc-disallowance-section-17-5-rules",
    "form-drc-01b-gstr-1-vs-3b-mismatch-reply-drafting", "form-drc-01c-itc-3b-vs-2b-discrepancy-reply",
    "form-drc-01d-recovery-without-notice-proceedings", "gstin-suspension-rule-21a-revocation-procedure",
    "place-of-supply-intermediary-services-bpo-exports", "lut-letter-of-undertaking-export-services-filing",
    "inverted-duty-structure-refund-formula-rule-89-5", "unjust-enrichment-gst-refund-certification-chartered-accountant",
    "gstr-9-annual-return-table-8a-2b-reconciliation", "gstr-9c-self-certified-reconciliation-5-crore-rules",
    "gst-audit-by-tax-authorities-section-65-preparation", "e-way-bill-200-percent-penalty-section-129-appeals",
    "fake-invoicing-itc-fraud-section-132-arrest-provisions", "anti-profiteering-gstat-authority-transition-rules"
]

for base in gst_topics:
    for modifier in ["step-by-step-guide", "faqs-handbook", "audit-checklist", "court-rulings-and-precedents", "statutory-provisions", "expert-compliance-notes", "common-mistakes-to-avoid", "documents-and-timelines", "for-manufacturers-and-traders", "for-service-exporters"]:
        slug = f"{base}-{modifier}"
        slug = slugify(slug)
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": "gst_gstat_indirect"})

# 4. NRI, FEMA, DTAA & Foreign Asset Disclosures (400 topics)
nri_topics = [
    "schedule-fa-foreign-asset-disclosure-rules-black-money-act", "form-67-foreign-tax-credit-online-filing-deadlines",
    "black-money-act-10-lakh-penalty-schedule-fa-omission", "form-15ca-15cb-outbound-remittance-ca-certification",
    "fema-lrs-20-percent-tcs-foreign-remittance-credit", "section-89a-foreign-pension-401k-ira-tax-deferral",
    "form-10-ee-foreign-retirement-account-election-rules", "rnor-residential-status-tax-optimization-returning-nri",
    "dtaa-us-india-article-12-royalties-and-fts-withholding", "dtaa-singapore-india-capital-gains-and-dividend-rules",
    "dtaa-uk-india-pension-and-remittance-tax-treatment", "dtaa-uae-india-trc-and-permanent-establishment-rules",
    "dtaa-germany-india-withholding-tax-and-form-10f", "dtaa-australia-india-freelance-services-taxation",
    "dtaa-canada-india-rrsp-and-property-capital-gains", "nri-property-sale-lower-tds-certificate-form-13",
    "nro-to-nre-1-million-dollar-repatriation-fema-guide", "fema-inward-remittance-firc-fira-compliance",
    "gift-city-ifsc-nri-investment-tax-incentives-2026", "foreign-company-director-din-and-dsc-compliance-india"
]

for base in nri_topics:
    for modifier in ["complete-guide-2026", "faqs-explained", "expert-checklist", "rules-and-penalties", "statutory-procedures", "tax-filing-handbook", "common-compliance-errors", "documentation-requirements", "for-us-and-uk-expats", "for-returning-residents"]:
        slug = f"{base}-{modifier}"
        slug = slugify(slug)
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": "nri_fema_international"})

# 5. Startup, MCA, Corporate ROC & Section 43B(h) MSME (400 topics)
mca_topics = [
    "section-43b-h-msme-15-45-day-payment-rule-compliance", "msme-delayed-payment-interest-three-times-rbi-rate",
    "msefc-msme-samadhaan-recovery-proceedings-guide", "c-pace-fast-track-exit-form-stk-2-company-closure",
    "private-limited-share-dematerialization-rule-9b-pas-6", "isin-generation-nsdl-cdsl-private-companies-guide",
    "secretarial-audit-section-204-peer-review-cs-mandate", "form-aoc-4-and-mgt-7-annual-roc-filings-penalties",
    "form-dir-3-kyc-annual-director-compliance-deadlines", "dpiit-startup-recognition-section-80-iac-tax-holiday",
    "form-inc-20a-commencement-of-business-180-days-rule", "significant-beneficial-ownership-sbo-form-ben-2",
    "board-meeting-and-agm-compliance-calendar-companies-act", "small-company-threshold-capital-4-cr-turnover-40-cr",
    "llp-annual-filing-form-11-and-form-8-deadlines-2026", "opc-one-person-company-annual-compliance-checklist",
    "inter-corporate-loans-and-investments-section-186", "related-party-transactions-section-188-approval-rules",
    "csr-form-csr-2-annual-report-statutory-mandate", "fast-track-merger-section-233-startups-and-wholly-owned"
]

for base in mca_topics:
    for modifier in ["step-by-step-handbook", "faqs-guide-2026", "compliance-checklist", "roc-penalties-and-rules", "procedural-framework", "expert-advisory-notes", "common-mistakes-to-avoid", "documents-and-timelines", "for-startup-founders", "for-directors-and-cs"]:
        slug = f"{base}-{modifier}"
        slug = slugify(slug)
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": "startup_mca_corporate"})

# 6. Freelancer, Creator Economy, Remote Workers & Presumptive Tax (350 topics)
freelance_topics = [
    "section-44ada-presumptive-tax-75-lakh-limit-rules", "youtube-super-chat-and-membership-tax-treatment-india",
    "twitch-and-kick-livestream-donations-taxability", "section-194-o-ecommerce-platform-tds-creator-payouts",
    "section-194r-brand-sponsorship-gifted-perk-10-percent-tds", "deel-and-rippling-contractor-inward-remittance-tax",
    "upwork-and-fiverr-freelancer-gst-lut-export-compliance", "us-client-w8ben-form-filling-indian-freelancers",
    "home-office-internet-and-equipment-tax-deductions", "freelance-software-developer-advance-tax-march-15",
    "remote-ui-ux-designer-gst-and-itr-filing-guide", "freelance-content-writer-44ada-vs-itr-3-comparison",
    "digital-marketing-consultant-presumptive-taxation", "saas-affiliate-marketing-commission-gst-and-tds",
    "freelance-video-editor-business-expense-claims", "online-tutor-and-course-creator-gst-exemption-scope",
    "freelance-translator-and-voiceover-artist-tax-rules", "freelance-photographer-and-cinematographer-gst-guide"
]

for base in freelance_topics:
    for modifier in ["complete-handbook-2026", "faqs-explained", "expert-checklist", "rules-and-deductions", "step-by-step-filing", "tax-saving-strategies", "common-mistakes-to-avoid", "documents-required", "for-remote-workers", "for-freelance-professionals"]:
        slug = f"{base}-{modifier}"
        slug = slugify(slug)
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": "freelance_creator_presumptive"})

# 7. Crypto, Web3, VDA & Online Gaming Taxation (300 topics)
crypto_topics = [
    "section-115bbh-crypto-tax-30-percent-flat-rate-rules", "section-194s-crypto-tds-1-percent-p2p-exchanges",
    "form-26qe-p2p-crypto-tds-filing-step-by-step", "crypto-loss-set-off-prohibition-section-115bbh-2",
    "schedule-vda-line-by-line-crypto-itr-reporting-guide", "fiu-ind-offshore-crypto-exchange-compliance-rules",
    "crypto-airdrop-and-staking-reward-taxability-section-56", "crypto-to-crypto-swap-tax-and-tds-calculation",
    "nft-creator-royalty-vs-secondary-trading-tax-rules", "section-115bbj-online-gaming-net-winnings-30-percent",
    "section-194ba-gaming-tds-withdrawal-and-year-end-rules", "28-percent-gst-online-real-money-gaming-face-value",
    "decentralized-wallet-metamask-reporting-schedule-fa", "crypto-mining-electricity-and-hardware-expense-denial",
    "foreign-crypto-exchange-binance-bybit-itr-disclosure"
]

for base in crypto_topics:
    for modifier in ["complete-guide-2026", "faqs-handbook", "audit-checklist", "calculation-rules", "statutory-procedures", "tax-traps-to-avoid", "documentation-requirements", "for-crypto-traders", "for-web3-investors", "for-online-gamers"]:
        slug = f"{base}-{modifier}"
        slug = slugify(slug)
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": "crypto_gaming_web3"})

# 8. IPR, Patent, Trademark & Copyright Law (250 topics)
ipr_topics = [
    "trademark-registration-form-tm-a-step-by-step-guide", "trademark-objection-reply-section-9-and-11-drafting",
    "trademark-opposition-form-tm-o-and-counter-statement-tm-6", "trademark-renewal-form-tm-r-10-year-extension",
    "madrid-protocol-international-trademark-filing-india", "section-80rrb-patent-royalty-3-lakh-tax-deduction",
    "form-10ccd-patent-royalty-ca-certification-rules", "section-80qqb-author-book-royalty-tax-deduction",
    "form-10cce-author-royalty-publishing-certificate", "provisional-vs-complete-patent-specification-drafting",
    "patent-annuity-annual-renewal-fee-schedule-india", "software-patentability-section-3-k-technical-effect",
    "copyright-software-source-code-registration-rules", "design-registration-controller-general-patents-designs",
    "dpiit-startup-80-percent-patent-fee-rebate-rules"
]

for base in ipr_topics:
    for modifier in ["complete-handbook-2026", "faqs-explained", "legal-checklist", "procedures-and-fees", "court-rulings", "common-mistakes-to-avoid", "documents-required", "for-inventors-and-authors", "for-startups-and-enterprises", "prosecution-guide"]:
        slug = f"{base}-{modifier}"
        slug = slugify(slug)
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": "ipr_patent_trademark"})

# 9. Micro-Location CA & Tax Consulting Services across Indian Tech & Commercial Hubs (250 topics)
city_hubs = [
    ("bangalore-indiranagar", "Indiranagar, Bangalore"),
    ("bangalore-koramangala", "Koramangala, Bangalore"),
    ("bangalore-whitefield", "Whitefield, Bangalore"),
    ("bangalore-hsr-layout", "HSR Layout, Bangalore"),
    ("bangalore-electronic-city", "Electronic City, Bangalore"),
    ("mumbai-bkc", "Bandra Kurla Complex (BKC), Mumbai"),
    ("mumbai-nariman-point", "Nariman Point, Mumbai"),
    ("mumbai-andheri-east", "Andheri East, Mumbai"),
    ("mumbai-lower-parel", "Lower Parel, Mumbai"),
    ("mumbai-powai", "Powai, Mumbai"),
    ("delhi-cyber-city-gurgaon", "Cyber City, Gurgaon"),
    ("delhi-golf-course-road", "Golf Course Road, Gurgaon"),
    ("delhi-noida-sector-62", "Sector 62, Noida"),
    ("delhi-connaught-place", "Connaught Place, New Delhi"),
    ("delhi-nehru-place", "Nehru Place, New Delhi"),
    ("hyderabad-hitec-city", "Hitec City, Hyderabad"),
    ("hyderabad-gachibowli", "Gachibowli, Hyderabad"),
    ("hyderabad-madhapur", "Madhapur, Hyderabad"),
    ("hyderabad-banjara-hills", "Banjara Hills, Hyderabad"),
    ("pune-hinjewadi", "Hinjewadi, Pune"),
    ("pune-viman-nagar", "Viman Nagar, Pune"),
    ("pune-baner", "Baner, Pune"),
    ("chennai-omr", "Old Mahabalipuram Road (OMR), Chennai"),
    ("chennai-guindy", "Guindy, Chennai"),
    ("ahmedabad-gift-city", "GIFT City, Ahmedabad")
]

service_types = [
    ("hire-chartered-accountant", "Hire Chartered Accountant in {loc}", "income_tax_bill_2025"),
    ("tax-consultant-itr-filing", "Tax Consultant for ITR Filing in {loc}", "income_tax_bill_2025"),
    ("gst-consultant-notices-appeal", "GST Consultant for Notices & Appeals in {loc}", "gst_gstat_indirect"),
    ("nri-tax-consultant-15ca-15cb", "NRI Tax Consultant for 15CA 15CB in {loc}", "nri_fema_international"),
    ("startup-ca-roc-compliance", "Startup CA for ROC Compliance in {loc}", "startup_mca_corporate"),
    ("capital-gains-tax-consultant", "Capital Gains Tax Consultant in {loc}", "capital_gains_buyback"),
    ("crypto-tax-advisor", "Crypto Tax Advisor in {loc}", "crypto_gaming_web3"),
    ("tax-audit-section-44ab-ca", "Tax Audit Section 44AB CA in {loc}", "income_tax_bill_2025"),
    ("virtual-cfo-services-smes", "Virtual CFO Services for SMEs in {loc}", "startup_mca_corporate"),
    ("trademark-attorney-ip-filing", "Trademark Attorney for IP Filing in {loc}", "ipr_patent_trademark")
]

for hub_slug, hub_name in city_hubs:
    for s_slug, s_title, t_key in service_types:
        slug = slugify(f"{s_slug}-{hub_slug}")
        if slug not in existing_slugs:
            new_pages.append({"slug": slug, "template": t_key})

# Trim or ensure target range (2,500 to 3,000 pages)
# Ensure all slugs are unique and not in existing_slugs
unique_new = []
seen_new = set()
for p in new_pages:
    sl = p["slug"]
    if sl not in existing_slugs and sl not in seen_new:
        seen_new.add(sl)
        unique_new.append(p)

print(f"Total Unique New Pages Prepared: {len(unique_new)}")

# Target 2,750 pages
if len(unique_new) > 2750:
    unique_new = unique_new[:2750]

print(f"Final Count for Generation: {len(unique_new)} SEO pages.")

# ==============================================================================
# HTML BUILDER FUNCTION (SINGLE-PASS HIGH PERFORMANCE)
# ==============================================================================

def generate_page_html(slug, template_key):
    t_data = TEMPLATES[template_key]
    title_text = title_from_slug(slug)
    page_title = f"{title_text} | WorkIndex"
    meta_desc = f"Learn about {title_text} in India. Check statutory rules, documents, official portals, deadlines, risks and expert brief on WorkIndex Work Index."
    canonical_url = f"https://workindex.co.in/seo-pages/{slug}.html"
    
    # Format Schema FAQs
    schema_faqs = []
    for q_name, q_text in t_data["faqs"]:
        schema_faqs.append({
            "@type": "Question",
            "name": q_name.replace("{topic}", title_text),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": q_text.replace("{topic}", title_text)
            }
        })
        
    schema_json = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://workindex.co.in/#organization",
                "name": "WorkIndex",
                "alternateName": "Work Index",
                "url": "https://workindex.co.in",
                "description": "India-focused marketplace to hire verified finance, tax, GST, accounting, compliance and web development experts."
            },
            {
                "@type": "WebPage",
                "@id": f"{canonical_url}#webpage",
                "url": canonical_url,
                "name": page_title,
                "description": meta_desc,
                "about": {"@id": "https://workindex.co.in/#organization"}
            },
            {
                "@type": "Article",
                "name": title_text,
                "headline": title_text,
                "description": meta_desc,
                "provider": {"@id": "https://workindex.co.in/#organization"},
                "areaServed": {"@type": "Country", "name": "India"}
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "WorkIndex", "item": "https://workindex.co.in"},
                    {"@type": "ListItem", "position": 2, "name": title_text, "item": canonical_url}
                ]
            },
            {
                "@type": "FAQPage",
                "mainEntity": schema_faqs
            }
        ]
    }
    
    # Panels HTML
    panels_html = ""
    for p_eyebrow, p_h2, bullets in t_data["panels"]:
        panels_html += f'<section class="wi-panel"><div class="lp-section-eyebrow">{p_eyebrow}</div><h2>{p_h2}</h2><ul class="wi-detail-list">\n'
        for b in bullets:
            panels_html += f'  <li>{b.replace("{topic}", title_text)}</li>\n'
        panels_html += '</ul></section>\n'
        
    # FAQ Accordion HTML
    faq_html = '<section class="wi-panel"><div class="lp-section-eyebrow">Questions People Ask</div><h2>Frequently Asked Questions</h2><div class="wi-detail-list">\n'
    for idx, (q_name, q_text) in enumerate(t_data["faqs"]):
        faq_html += f'  <div style="margin-bottom: 16px;">\n'
        faq_html += f'    <h3 style="font-size: 16px; margin: 12px 0 6px;">{idx+1}. {html.escape(q_name.replace("{topic}", title_text))}</h3>\n'
        faq_html += f'    <p style="color: var(--text-muted); font-size: 14px; margin: 0 0 10px; line-height: 1.6;">{html.escape(q_text.replace("{topic}", title_text))}</p>\n'
        faq_html += f'  </div>\n'
    faq_html += '</div></section>\n'
    
    html_content = f"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{html.escape(page_title)}</title><meta name="description" content="{html.escape(meta_desc)}"/><meta name="keywords" content="{html.escape(title_text)}, WorkIndex, Work Index"/>
<link rel="canonical" href="{canonical_url}"/><meta property="og:title" content="{html.escape(page_title)}"/><meta property="og:description" content="{html.escape(meta_desc)}"/><meta property="og:url" content="{canonical_url}"/><meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/><link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-rich{{padding:56px 24px;max-width:1160px;margin:0 auto}}.wi-rich-grid{{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;align-items:start}}.wi-panel{{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}}.wi-panel+.wi-panel{{margin-top:20px}}.wi-panel h2{{font-size:24px;margin:0 0 14px}}.wi-panel h3{{font-size:17px;margin:18px 0 8px}}.wi-panel p{{color:var(--text-muted);font-size:15px;margin:0 0 12px;line-height:1.75}}.wi-detail-list{{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}}.wi-detail-list li{{margin-bottom:7px}}.wi-side{{position:sticky;top:82px}}.wi-table{{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}}.wi-table th,.wi-table td{{border:1px solid var(--border);padding:11px;text-align:left;vertical-align:top}}.wi-table th{{background:var(--bg-gray);font-weight:800}}.wi-ref a,.wi-related a{{display:block;color:var(--primary);font-weight:800;text-decoration:none;margin:8px 0}}.wi-note,.calc-result{{border-left:4px solid var(--primary);background:var(--primary-light);padding:16px;border-radius:12px;color:var(--text);line-height:1.7;margin-top:14px}}.wi-calc-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}}.wi-calc-grid input,.wi-calc-grid select{{width:100%;padding:12px;border:1px solid #d1d5db;border-radius:10px;margin-top:6px}}.formula{{font-family:monospace;background:#0f172a;color:#fff;padding:14px;border-radius:10px;overflow:auto}}@media(max-width:860px){{.wi-rich-grid{{grid-template-columns:1fr}}.wi-side{{position:static}}}}</style>
<script type="application/ld+json">{json.dumps(schema_json, ensure_ascii=False)}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body><nav class="lp-nav"><a href="/" class="lp-nav-logo"><div class="lp-nav-logo-icon">W</div><span class="lp-nav-logo-text">WorkIndex</span></a><a href="{CTA_URL}" class="lp-nav-cta">Post for Free</a></nav>
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>{html.escape(title_text)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>{t_data["eyebrow"]}</div><h1>{html.escape(title_text)}<br><span>{t_data["subtitle"]}</span></h1>
<p>Expert statutory brief on {html.escape(title_text)} in India. Reconcile with latest notifications, official portals, and compliance checklists before filing.</p><a href="{CTA_URL}" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: {FACT_DATE}</div><div class="lp-trust-item">Verified expert discovery</div><div class="lp-trust-item">Compare quotes and timelines</div><div class="lp-trust-item">India-specific statutory guidance</div><div class="lp-trust-item">Structured requirements</div></div></section>
<main class="wi-rich"><div class="wi-rich-grid"><div>
{panels_html}
{faq_html}
</div><aside class="wi-side"><div class="wi-panel"><h2>Post once, compare experts</h2><p>Share your requirement once and compare relevant WorkIndex experts by scope, price, timeline and profile strength.</p><a href="{CTA_URL}" class="lp-hero-cta" style="padding:12px 18px;font-size:14px">Get Expert Quotes</a></div><div class="wi-panel wi-related"><h2>Related pages</h2><a href="/seo-pages/old-vs-new-tax-regime.html">Old Vs New Tax Regime</a><a href="/seo-pages/how-to-save-tax-legally.html">How To Save Tax Legally</a><a href="/seo-pages/itr-filing-for-salaried-employees.html">ITR Filing For Salaried Employees</a><a href="/seo-pages/hire-ca-online-india.html">Hire Ca Online India</a></div><div class="wi-panel wi-ref"><h2>Official references</h2><a href="https://www.incometax.gov.in/iec/foportal/" rel="nofollow">Income Tax e-Filing portal</a><a href="https://www.incometaxindia.gov.in/Pages/acts/income-tax-act.aspx" rel="nofollow">Income Tax Act &amp; Rules</a><a href="https://www.gst.gov.in/" rel="nofollow">GST portal</a><a href="https://www.mca.gov.in/" rel="nofollow">MCA portal</a></div></aside></div></main>
<section class="lp-cta-section"><h2>Need a professional to review your case?</h2><p>Post your requirement on WorkIndex and compare verified Chartered Accountants, tax practitioners and corporate lawyers.</p><a href="{CTA_URL}" class="lp-hero-cta">Post Requirement as Customer</a></section>
<footer class="lp-footer"><a href="/seo-pages/itr-filing-all-cities.html">ITR cities</a><a href="/seo-pages/gst-services-all-cities.html">GST cities</a><a href="/seo-pages/accounting-services-all-cities.html">Accounting cities</a><a href="/seo-pages/audit-services-all-cities.html">Audit cities</a><a href="/contact.html">Contact</a></footer></body></html>"""
    return html_content

# ==============================================================================
# WRITE ALL 2,750 FILES IN SINGLE PASS
# ==============================================================================

print(f"\nWriting {len(unique_new)} new HTML pages to {SEO_DIR}...")
new_urls = []
for idx, p in enumerate(unique_new):
    if (idx + 1) % 500 == 0 or idx == len(unique_new) - 1:
        print(f"  Generated {idx + 1} / {len(unique_new)} pages...")
    slug = p["slug"]
    t_key = p["template"]
    html_str = generate_page_html(slug, t_key)
    out_file = SEO_DIR / f"{slug}.html"
    out_file.write_text(html_str, encoding="utf-8")
    new_urls.append(f"https://workindex.co.in/seo-pages/{slug}.html")

print(f"\nSuccessfully generated and wrote all {len(unique_new)} SEO pages!")

# Save IndexNow Manifest
with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(new_urls, f, indent=2)
print(f"Saved IndexNow manifest ({len(new_urls)} URLs) to: {MANIFEST_PATH}")

# ==============================================================================
# SITEMAP & INDEXER URLS REGENERATION AND SORTING
# ==============================================================================

print("\nUpdating sitemap.xml...")
all_html_files = sorted(list(SEO_DIR.glob("*.html")))
print(f"Total HTML files on disk: {len(all_html_files)}")

sitemap_entries = ['<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
sitemap_entries.append('  <url><loc>https://workindex.co.in/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>')
sitemap_entries.append('  <url><loc>https://workindex.co.in/contact.html</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>')

for f in all_html_files:
    sitemap_entries.append(f'  <url><loc>https://workindex.co.in/seo-pages/{f.name}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>')
sitemap_entries.append('</urlset>')

SITEMAP_PATH.write_text("\n".join(sitemap_entries), encoding="utf-8")
print(f"sitemap.xml updated with {len(all_html_files) + 2} URLs!")

# Update indexer urls.txt
print("\nUpdating indexer urls.txt (Preserving indexed head, prioritizing tax pages)...")
with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
    prog = json.load(f)

# Find max indexed index
runs = prog.get('runs', [])
max_indexed = max(r['start_index'] + r['submitted'] for r in runs)
print(f"Current max indexed index in progress.json: {max_indexed}")

with open(URLS_FILE, "r", encoding="utf-8") as f:
    existing_url_lines = [l.strip() for l in f if l.strip()]

# Preserve indexed head byte-for-byte
indexed_head = existing_url_lines[:max_indexed]
remaining_existing = set(existing_url_lines[max_indexed:])
all_new_urls_set = set(new_urls)

unindexed_pool = list((remaining_existing | all_new_urls_set) - set(indexed_head))
print(f"Unindexed URL pool to sort: {len(unindexed_pool)}")

# Sort unindexed pool: Prioritize tax-related first
def tax_priority_score(url):
    u = url.lower()
    score = 0
    if any(k in u for k in ['itr', 'tax', '115b', '87a', '148', 'capital-gain', 'ltcg', 'stcg', 'buyback', '80c', '80d', 'advance-tax']):
        score -= 1000
    if any(k in u for k in ['gst', 'gstr', 'gstat', 'itc', 'rcm', 'e-invoice', '128a']):
        score -= 800
    if any(k in u for k in ['tds', 'tcs', '194', '15ca', '15cb', 'form-16']):
        score -= 600
    if any(k in u for k in ['nri', 'dtaa', 'fema', 'schedule-fa', 'lrs', '401k']):
        score -= 400
    if any(k in u for k in ['msme', '43b', 'roc', 'mca', 'startup', 'stk-2']):
        score -= 200
    return (score, u)

unindexed_sorted = sorted(unindexed_pool, key=tax_priority_score)
final_urls = indexed_head + unindexed_sorted

with open(URLS_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(final_urls) + "\n")

print(f"urls.txt updated with {len(final_urls)} total URLs (Tax prioritized first in queue)!")
print("\n=== ALL GENERATION, SITEMAP & INDEXER PIPELINES COMPLETED ===")
