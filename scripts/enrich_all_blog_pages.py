import os
import re
import json
import html
from pathlib import Path

# Paths
root = Path("C:/Ravish/workindex-frontend")
seo_dir = root / "seo-pages"

def clean_blog_slug(filename):
    slug = filename.replace('.html', '')
    if slug.startswith('blog-'):
        slug = slug[5:]
    return slug

def get_gst_e_invoicing_threshold_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">E-Invoicing Applicability</div>
  <h2>Mandatory GST E-Invoicing Threshold and Limits</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked against CGST Rules and active notifications.</span>
  </div>
  <p>Under GST rules in India, e-invoicing is mandatory for all businesses whose aggregate annual turnover (AATO) exceeds <strong>₹5 Crore</strong> in any preceding financial year from 2017-18 onwards. Once the threshold is crossed in any year, e-invoicing remains applicable for all subsequent years.</p>
  
  <h3>Scope of Transactions Covered</h3>
  <ul class="wi-detail-list">
    <li><strong>B2B Supplies</strong>: Tax invoices issued to registered businesses (GSTIN holders) must have an IRN.</li>
    <li><strong>Exports</strong>: All direct and deemed export invoices require e-invoicing.</li>
    <li><strong>Credit & Debit Notes</strong>: Any credit or debit notes associated with B2B/export invoices require separate IRN generation.</li>
    <li><strong>B2C Transactions Excluded</strong>: Business-to-Consumer invoices do not require e-invoicing, though dynamic QR codes may be required if turnover exceeds ₹500 Crore.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Exempt Sectors</div>
  <h2>Who is Exempt from GST E-Invoicing?</h2>
  <p>Certain classes of registered persons are exempt from generating e-invoices, regardless of their annual turnover:</p>
  <ul class="wi-detail-list">
    <li><strong>Special Economic Zone (SEZ) Units</strong>: Exempt under Notification No. 61/2020-Central Tax (Note: SEZ Developers are NOT exempt).</li>
    <li><strong>Insurers and Banking Companies</strong>: Financial institutions and NBFCs are completely exempt.</li>
    <li><strong>Goods Transport Agencies (GTA)</strong>: GTA providing road transport services are exempt.</li>
    <li><strong>Passenger Transportation Services</strong>: Operators providing transport services are exempt.</li>
    <li><strong>Multiplex Admissions</strong>: Admission to exhibition of cinematograph films on screens.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Consequences</div>
  <h2>Non-Compliance Risks and Penalties</h2>
  <p>Failing to generate a valid e-invoice is a serious compliance default with severe legal consequences:</p>
  <ul class="wi-detail-list">
    <li><strong>Invalid Invoice under Law</strong>: An invoice issued without a valid IRP-signed QR code and IRN is not considered a legal document.</li>
    <li><strong>ITC Blocked for Buyer</strong>: The recipient/buyer cannot claim Input Tax Credit (ITC) if the supplier fails to generate a valid e-invoice.</li>
    <li><strong>Direct Penalty</strong>: The penalty for issuing an incorrect invoice is 100% of the tax due or ₹10,000 per invoice, whichever is higher, under Section 122 of the CGST Act.</li>
  </ul>
</section>
"""
    return content

def get_gst_e_invoicing_threshold_faqs():
    return [
        ("What is the current threshold limit for GST e-invoicing?", "The current aggregate annual turnover (AATO) threshold for mandatory e-invoicing is ₹5 Crore. This applies if your turnover exceeded ₹5 Crore in any preceding financial year since the implementation of GST (2017-18 onwards)."),
        ("Does e-invoicing apply to B2C sales?", "No. E-invoicing is strictly applicable to Business-to-Business (B2B) transactions, B2G (Business-to-Government) supplies, and export transactions. Business-to-Consumer (B2C) retail invoices are exempt."),
        ("Are SEZ units exempt from e-invoicing?", "Yes. Special Economic Zone (SEZ) Units are exempt from generating e-invoices under Notification No. 61/2020-Central Tax. However, SEZ Developers are not exempt and must comply if they exceed the ₹5 Crore threshold."),
        ("What is the time limit for generating an e-invoice / IRN?", "For businesses with an aggregate annual turnover of ₹100 Crore or more, the government has imposed a 30-day time limit from the invoice date to report it on the IRP. For businesses below ₹100 Crore, there is currently no official deadline, but immediate generation is highly recommended to avoid ITC delays for buyers."),
        ("Can we cancel or amend an e-invoice on the IRP?", "An e-invoice (IRN) can be cancelled on the IRP portal within 24 hours of generation. However, no amendment is allowed on the IRP. If amendment is required after 24 hours, it must be done manually while filing the GSTR-1 return."),
        ("Can I reuse an invoice number if the e-invoice is cancelled?", "No. Once an e-invoice is reported to the IRP and subsequently cancelled, that specific invoice number cannot be reused to generate a new e-invoice. A fresh invoice number must be used."),
        ("What is the penalty for not generating an e-invoice?", "The penalty under Section 122 of the CGST Act is 100% of the tax due or ₹10,000 per invoice (whichever is higher) for failure to issue a valid invoice. Additionally, a penalty of ₹25,000 applies for incorrect invoicing."),
        ("How does a buyer verify if a supplier is required to generate an e-invoice?", "Buyers can check the e-invoice enablement status of any supplier by entering their GSTIN on the official GST e-invoice portal under the 'Search Enablement Status' tool."),
        ("How is the aggregate annual turnover calculated for e-invoicing?", "The aggregate annual turnover is calculated on a PAN-level basis across all registrations/GSTINs in India for the entire financial year. It includes exempt and export supplies, not just taxable domestic sales."),
        ("Is a printed invoice with a QR code mandatory?", "Yes. The physical copy or PDF copy of the invoice shared with the recipient must display the IRP-signed QR code. Hand-drawn or self-generated QR codes are not valid."),
        ("Do debit and credit notes require e-invoicing?", "Yes. Credit notes and debit notes issued in relation to B2B or export transactions must have an IRN generated on the IRP, matching the rules of regular invoices."),
        ("Does e-invoicing apply to Nil-rated or Exempt supplies?", "No. E-invoicing does not apply to Bill of Supply issued for wholly exempt or Nil-rated goods/services, even if the business exceeds the ₹5 Crore turnover limit."),
        ("Is an E-way bill automatically generated with an e-invoice?", "When generating an e-invoice on the IRP, you can provide transporter details to generate Part-A and Part-B of the E-way bill simultaneously. The IRP will auto-populate the E-way bill portal."),
        ("What are the authorized IRP portals for reporting invoices?", "The government has authorized multiple IRP portals, including the primary NIC portal (einv-apisandbox.nic.in) and private portals operated by companies like Clear, Cygnet, etc."),
        ("What happens to my ITC if the supplier does not generate an e-invoice?", "The buyer's Input Tax Credit (ITC) will be disallowed. Without a valid IRN and IRP-signed QR code, the invoice is invalid under Rule 48(4) of the CGST Rules, making the buyer ineligible to claim ITC.")
    ]

def get_premium_metadata(filename, category, subtopic):
    slug = clean_blog_slug(filename)
    if filename == 'blog-understanding-your-salary-slip.html':
        return {
            'title': 'How to Read and Understand Your Salary Slip in India',
            'h1': 'How to Read and Understand Your Salary Slip in India',
            'subtitle': 'Basic, HRA, PF, ESI, PT and TDS components explained',
            'meta_desc': 'Understand monthly salary slip components: basic salary, allowances, HRA exemptions, EPF contributions, Professional Tax, and TDS calculations.',
            'hero_desc': 'A monthly salary slip is the bridge between payroll, Form 16 and ITR. Understanding it early prevents year-end tax surprises.',
            'eyebrow': 'Salary & EPF'
        }
    elif filename == 'blog-wait-for-ais-before-filing-itr-2026.html':
        return {
            'title': 'Should You Wait for Your AIS Before Filing ITR in 2026?',
            'h1': 'Why You Should Wait for AIS Before Filing ITR (FY 2025-26)',
            'subtitle': 'Understanding the risks of early filing and matching Form 26AS',
            'meta_desc': 'Why taxpayers must wait for the AIS/TIS update (post-May 31st) before filing their Income Tax Return (ITR) to avoid automated mismatch notices.',
            'hero_desc': 'Filing ITR before banks, employers, and mutual funds upload Q4 TDS returns leads to major mismatches and automatic portal notices.',
            'eyebrow': 'Income Tax'
        }
    elif filename == 'blog-gst-e-invoicing-applicability-threshold.html':
        return {
            'title': 'GST E-Invoicing Threshold and Applicability Limit in 2026',
            'h1': 'GST E-Invoicing: Applicability and Threshold Limit',
            'subtitle': 'Mandatory e-invoicing limits, rules, and exemptions under GST law',
            'meta_desc': 'Understand the GST e-invoicing threshold limit of 5 Crore, exempt businesses (SEZ units, banks, NBFCs, GTA), and penalties for non-compliance.',
            'hero_desc': 'Mandatory e-invoicing applies to all taxpayers with aggregate turnover exceeding 5 Crore. Failure to generate IRN blocks buyer ITC.',
            'eyebrow': 'GST compliance'
        }
    elif filename == 'blog-buyback-proceeds-deemed-dividend.html':
        return {
            'title': 'Taxation of Share Buybacks in India: Deemed Dividend vs Capital Gains',
            'h1': 'Taxation of Share Buybacks in India',
            'subtitle': 'Regime 2 deemed dividends and Regime 3 capital gains explained',
            'meta_desc': 'Exhaustive tax guide on share buybacks in India: 3-regime history, Section 2(22)(f) deemed dividend rules, Section 46A capital loss trap, and Finance Act 2026 changes.',
            'hero_desc': 'A comprehensive legal and tax analysis of return of capital, promoter tax rates, and double-taxation traps for retail investors.',
            'eyebrow': 'Income Tax'
        }
    elif filename == 'blog-section-43b-msme-payment-rule.html':
        return {
            'title': 'Section 43B(h) MSME Payment Rules, Deadlines & Disallowance',
            'h1': 'Section 43B(h) MSME Payment Rules',
            'subtitle': 'Timelines, disallowance limits, and compliance for buyers',
            'meta_desc': 'Understand the 15/45-day payment timelines for micro and small enterprises, tax disallowance under Section 43B(h), and interest penalties.',
            'hero_desc': 'Failure to pay registered MSEs within the MSMED Act deadlines leads to year-end tax disallowance and interest at three times the bank rate.',
            'eyebrow': 'Income Tax'
        }
    elif filename == 'blog-pf-withdrawal-taxability-complete-guide.html':
        return {
            'title': 'Provident Fund (PF) Taxability on Withdrawal: Complete Guide',
            'h1': 'PF Withdrawal Taxability & Exemption Rules',
            'subtitle': 'Tax rules for RPF, SPF, URPF, PPF and Section 192A TDS explained',
            'meta_desc': 'Detailed guide on Provident Fund (PF) taxability on withdrawal: RPF 5-year continuous service rule, Section 192A TDS, and the annual 2.5L/5L interest limits.',
            'hero_desc': 'A comprehensive legal analysis of provident fund withdrawals, interest taxation limits, unrecognised fund tax traps, and Form 15G/15H exemptions.',
            'eyebrow': 'Salary & EPF'
        }
    
    words = slug.split('-')
    title_words = []
    for w in words:
        if w in ['itr', 'gst', 'tds', 'tcs', 'pf', 'epf', 'esi', 'pt', 'nri', 'dtaa', 'rsu', 'esop', 'hni', 'mca', 'roc', 'llp', 'opc', 'hsn', 'sac', 'itc', 'irn', 'irp', 'seb', 'sebi', 'rbi', 'sc', 'hc', 'itat', 'cestat', 'nclt', 'nclat', 'ibc']:
            title_words.append(w.upper())
        elif w in ['vs', 'to', 'for', 'in', 'and', 'or', 'of', 'on', 'with', 'by', 'at', 'from', 'under']:
            title_words.append(w)
        else:
            title_words.append(w.capitalize())
    
    cleaned_slug = ' '.join(title_words)
    if cleaned_slug:
        first_word = cleaned_slug.split(' ')[0]
        cleaned_slug = first_word.capitalize() + cleaned_slug[len(first_word):]
    title = cleaned_slug
    h1 = cleaned_slug

    eyebrows = {
        'itr_tax': 'Income Tax',
        'tds': 'TDS compliance',
        'gst': 'GST compliance',
        'mca_roc': 'Corporate Law',
        'salary_epf': 'Salary & EPF',
        'general': 'Financial planning'
    }
    
    eyebrow = eyebrows.get(category, 'Financial planning')
    if subtopic == 'ais_tis_26as':
        eyebrow = 'Income Tax'
    elif subtopic == 'salary_allowances':
        eyebrow = 'Salary & EPF'
    elif subtopic == 'crypto_vda':
        eyebrow = 'Crypto compliance'
    elif subtopic == 'gaming_lottery':
        eyebrow = 'Gaming taxation'

    subtitle = "Compliance and filing guide"
    if eyebrow == 'Income Tax':
        subtitle = "Tax rules and filing guide"
        meta_desc = f"Understand {cleaned_slug} under Indian tax laws. Read expert compliance guides, rules, documentation, and key deadlines."
    elif eyebrow == 'GST compliance':
        subtitle = "GST compliance guide"
        meta_desc = f"Learn about {cleaned_slug} under CGST and SGST rules. Check e-invoicing, ITC rules, return deadlines, and audit requirements."
    elif eyebrow == 'TDS compliance':
        subtitle = "TDS deduction guide"
        meta_desc = f"Check the TDS/TCS rates, threshold limits, sections, and return filing rules for {cleaned_slug} in India."
    elif eyebrow == 'Corporate Law':
        subtitle = "Companies Act compliance"
        meta_desc = f"Understand ROC filing, secretarial audit thresholds, board resolutions, and statutory rules for {cleaned_slug}."
    elif eyebrow == 'Salary & EPF':
        subtitle = "Payroll compliance guide"
        meta_desc = f"Learn about employee benefits, PF/ESI contributions, HRA exemptions, and tax deductions related to {cleaned_slug}."
    elif eyebrow == 'Crypto compliance':
        subtitle = "Crypto tax guide"
        meta_desc = f"Learn about Section 115BBH and {cleaned_slug} in India. Check flat 30% tax rates, 1% TDS, loss set-off restrictions, and ITR filing."
    elif eyebrow == 'Gaming taxation':
        subtitle = "Gaming tax rules"
        meta_desc = f"Understand Section 115BBJ, 194BA TDS and {cleaned_slug} for online gaming in India. Read expert net winnings and GST rules."
    else:
        meta_desc = f"A detailed guide on {cleaned_slug}. Learn about key investment rules, capital gains taxation, and wealth planning in India."

    hero_desc = f"Expert brief on {cleaned_slug} for businesses, promoters, and individuals. Reconcile with latest notifications before filing."
    
    return {
        'title': title,
        'h1': h1,
        'subtitle': subtitle,
        'meta_desc': meta_desc,
        'hero_desc': hero_desc,
        'eyebrow': eyebrow
    }

def update_schema_metadata(schema_json, filename, name, description, faqs):
    try:
        data = json.loads(schema_json)
        
        # If faqs is empty, remove FAQPage entirely
        if not faqs:
            data['@graph'] = [item for item in data.get('@graph', []) if item.get('@type') != 'FAQPage']
        else:
            faq_item = None
            for item in data.get('@graph', []):
                if item.get('@type') == 'FAQPage':
                    faq_item = item
                    break
            
            if faq_item:
                faq_item['mainEntity'] = [
                    {
                        "@type": "Question",
                        "name": q,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": a
                        }
                    } for q, a in faqs
                ]
            else:
                new_faq = {
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": a
                            }
                        } for q, a in faqs
                    ]
                }
                data.setdefault('@graph', []).append(new_faq)
            
        for item in data.get('@graph', []):
            if item.get('@type') in ['WebPage', 'Service']:
                item['name'] = name
                item['description'] = description
                if 'url' in item:
                    item['url'] = f"https://workindex.co.in/seo-pages/{filename}"
                if '@id' in item:
                    item['@id'] = f"https://workindex.co.in/seo-pages/{filename}#webpage"
                if item.get('@type') == 'Service':
                    item['serviceType'] = name
            elif item.get('@type') == 'BreadcrumbList':
                elements = item.get('itemListElement', [])
                if len(elements) >= 2:
                    clean_name = name
                    if clean_name.endswith(" | WorkIndex"):
                        clean_name = clean_name[:-12]
                    elements[1]['name'] = clean_name
                    elements[1]['item'] = f"https://workindex.co.in/seo-pages/{filename}"
                    
        return json.dumps(data, separators=(',', ':'))
    except Exception as e:
        print(f"Error parsing schema JSON: {e}")
        return schema_json

# Define Panel and FAQ structures for each category
categories = {
    'itr_tax': {
        'panels': [
            {
                'eyebrow': 'ITR filing',
                'title': 'What this page helps you decide',
                'items': [
                    'Verify if your total income before deductions exceeds the basic exemption limit (₹4,0,000 under default New Regime, ₹2,50,000 under Old Regime).',
                    'Understand if filing is mandatory due to special criteria (foreign assets, >₹1 crore in current bank accounts, >₹2 lakh on foreign travel, or >₹25,000 TDS/TCS).',
                    'Determine if you should opt for the Old Tax Regime to claim deductions like Section 80C, 80D, 80G, and HRA, or use the default New Tax Regime.',
                    'Review your Annual Information Statement (AIS) and Taxpayer Information Summary (TIS) to check for mismatches before filing.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Section 87A rebate is ₹60,000 under default New Regime (up to ₹12 lakh taxable income) and ₹12,500 under Old Regime (up to ₹5 lakh taxable income).',
                    'Standard deduction for salary income is ₹75,000 under the New Regime and ₹50,000 under the Old Regime.',
                    'Section 80TTB interest deduction limit for senior citizens is ₹50,000 (increased to ₹1,00,000 under the current Finance Act rules).',
                    'Late filing fee under Section 234F is ₹5,000 (if total income > ₹5 lakh) or ₹1,000 (if total income <= ₹5 lakh) for belated returns.',
                    'Compulsory acquisition of urban agricultural land is exempt from tax under Section 10(37), while rural agricultural land is not a capital asset under Section 2(14).'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'PAN card, Aadhaar card, and e-filing portal credentials.',
                    'Form 16 (Part A & Part B) issued by your employer, and Form 16A/16D for other TDS categories.',
                    'Bank account statements showing interest credits, dividends, and salary payments.',
                    'Capital gains statements from your stockbrokers and mutual fund houses.',
                    'Form 26AS, AIS, and TIS downloaded from the e-filing portal for cross-verification.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Filing using the incorrect ITR form (e.g. using ITR-1 instead of ITR-2 when owning foreign assets or having capital gains).',
                    'Failing to e-verify the ITR within 30 days of filing, which makes the return invalid and non-filed.',
                    'Reporting zero value or omitting foreign shares/broker accounts in Schedule FA, attracting a ₹10 lakh Black Money Act penalty.',
                    'Omitting dividend income or interest from savings/FDs, which appears in AIS and triggers automated mismatch notices.',
                    'Choosing the wrong tax regime on the portal without calculating the optimal regime for your specific deduction structure.'
                ]
            }
        ],
        'faqs': [
            ("Who is required to file an ITR in India for FY 2025-26?", "You must file an ITR if your total income before deductions (like Section 80C, 80D, etc.) exceeds the basic exemption limit (₹4,0,000 under the default New Regime; ₹2,50,000 under the Old Regime). Filing is also mandatory if you hold foreign assets, deposited >₹1 crore in current bank accounts, spent >₹2 lakh on foreign travel, or had TDS/TCS exceeding ₹25,000 in the financial year."),
            ("What are the due dates for filing ITR for FY 2025-26?", "For FY 2025-26 (AY 2026-27), the due date is July 31, 2026, for salaried individuals, pensioners, and other non-audit taxpayers. For non-audit business/professional taxpayers filing ITR-3 or ITR-4, the due date is August 31, 2026. For taxpayers requiring a tax audit, the due date is October 31, 2026."),
            ("What is the penalty for filing a belated return?", "If you file after the deadline (belated return under Section 139(4)), a late filing fee is charged under Section 234F: ₹5,000 if your total income exceeds ₹5,0,000, and ₹1,000 if your income is ₹5,0,000 or below. The final deadline to file a belated return for FY 2025-26 is December 31, 2026."),
            ("How does the Section 87A rebate work under the New Tax Regime?", "Under the New Tax Regime, individuals with taxable income up to ₹12,0,000 qualify for a full tax rebate of up to ₹60,000 under Section 87A, making their net tax liability zero. Salaried individuals earning up to ₹12,75,000 can also achieve zero tax after applying the ₹75,000 standard deduction."),
            ("Can I switch from the default New Regime to the Old Tax Regime?", "The New Tax Regime is the default. You can opt-in to the Old Tax Regime at the time of filing your ITR. Salaried employees can switch between regimes every year. Taxpayers with business or professional income can switch back to the Old Regime only once in their lifetime."),
            ("How is agricultural income taxed in India?", "Agricultural income is exempt from tax under Section 10(1) if the land is in India. However, if your agricultural income exceeds ₹5,0,000 (or ₹5,000 if non-agricultural income exceeds the basic exemption limit), the agricultural income is integrated to compute the tax rate applicable to your non-agricultural income."),
            ("What is the standard deduction for salaried individuals?", "For FY 2025-26, salaried employees get an enhanced standard deduction of ₹75,000 under the New Tax Regime, and ₹50,000 under the Old Tax Regime."),
            ("What is the holding period to qualify for LTCG on shares?", "For listed equity shares, the holding period to qualify for Long-Term Capital Gains (LTCG) is more than 12 months. For unlisted shares (including foreign shares), the holding period is more than 24 months."),
            ("How is LTCG on listed equity shares taxed?", "Under the current Finance Act, LTCG on listed equity shares is taxed at a flat rate of 12.5% on gains exceeding the ₹1.25 lakh annual exemption threshold (increased from the previous ₹1 lakh limit)."),
            ("What is the tax rate on STCG under Section 111A?", "Short-Term Capital Gains (STCG) on listed equity shares sold through a recognized stock exchange where STT is paid is taxed at a flat rate of 20% under Section 111A (increased from the previous 15% rate)."),
            ("What is the penalty for not disclosing foreign assets in Schedule FA?", "Resident and Ordinarily Resident (ROR) taxpayers who fail to disclose foreign assets (including foreign bank accounts, shares, RSUs, and properties) in Schedule FA can face a flat penalty of ₹10 lakh under the Black Money Act."),
            ("What are the rules for filing a revised return?", "Under Section 139(5), if you discover any omission or wrong statement in your original return, you can file a revised return. The deadline to file a revised return for FY 2025-26 is March 31, 2027."),
            ("What is an Updated Return (ITR-U) and its late fee?", "Under Section 139(8A), you can file an Updated Return (ITR-U) within 24 months from the end of the relevant Assessment Year to declare additional income. It requires paying an additional tax of 25% (if filed within 12 months) or 50% (if filed within 24 months)."),
            ("How do I claim tax relief under Section 90 (DTAA)?", "To claim relief from double taxation under Section 90, you must file Form 67 online on the e-filing portal before filing your ITR, along with a Tax Residency Certificate (TRC) and Form 10F where applicable."),
            ("How is interest income from savings accounts taxed?", "Interest from savings accounts is taxable under Income from Other Sources. Under the Old Regime, you can claim a deduction of up to ₹10,000 under Section 80TTA (or up to ₹50,000 for senior citizens under Section 80TTB). This deduction is not available under the New Tax Regime.")
        ]
    },
    'tds': {
        'panels': [
            {
                'eyebrow': 'TDS compliance',
                'title': 'What this page helps you decide',
                'items': [
                    'Identify the correct TDS section applicable to the transaction (e.g. Section 194C for contracts vs Section 194J for professional fees).',
                    'Confirm the threshold limits for TDS deduction (e.g. ₹30,000 single / ₹1,00,000 aggregate for Section 194C, or ₹30,000 for Section 194J).',
                    'Determine if the recipient is a resident or non-resident to apply the correct tax rate (standard TDS vs Section 195 treaty-based rates).',
                    'Assess if you can obtain a lower or nil tax deduction certificate from the assessing officer under Section 197.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'TDS under Section 194C is deducted at 1% for individuals/HUFs and 2% for other corporate/firm entities.',
                    'TDS under Section 194J is deducted at 2% for technical services, royalty, or call centre operations, and 10% for professional fees.',
                    'TDS on e-commerce operators under Section 194O is 1% of the gross amount of sales or services.',
                    'TDS on purchase of goods under Section 194Q is 0.1% if the aggregate purchase exceeds ₹50 lakh in a financial year.',
                    'Section 206AA mandates TDS at a higher rate (minimum 20%) if the deductee fails to furnish a valid PAN.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'TAN (Tax Deduction and Collection Account Number) of the deductor, and PAN of the deductee.',
                    'Invoices, work orders, service contracts, and payment vouchers.',
                    'Form 15G or 15H submitted by the recipient for non-deduction of tax.',
                    'Prior TDS return filings (Form 26Q for non-salary, Form 27Q for NRI payments).',
                    'Traces portal login credentials to check defaults and download Form 16A certificates.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Deducting TDS under the wrong section, which leads to demand notices for short-deductions and interest.',
                    'Failing to deposit the deducted TDS into the government treasury by the 7th of the following month (or April 30th for March deductions).',
                    'Delaying the filing of quarterly TDS returns, which attracts a late fee of ₹200 per day under Section 234E.',
                    'Incorrectly entering the deductee\'s PAN in the TDS return, leading to mismatch notices and refusal of tax credit to the deductee.',
                    'Paying interest on late TDS payment at 1% instead of 1.5% per month (standard rate for delay after deduction).'
                ]
            }
        ],
        'faqs': [
            ("What is the difference between Section 194C and Section 194J?", "Section 194C applies to work contracts, catering, advertising, and carriage of goods/passengers (TDS rate 1% or 2%). Section 194J applies to professional services, technical services, royalty, and non-compete fees (TDS rate 2% or 10%)."),
            ("What is the threshold limit for TDS under Section 194C?", "TDS under Section 194C is triggered if a single payment to a contractor exceeds ₹30,000, or if the aggregate of all payments in a financial year exceeds ₹1,00,000."),
            ("What is the TDS rate under Section 194J for professional vs technical services?", "TDS is deducted at 2% for fees for technical services (FTS), royalty, and call centre operations. It is deducted at 10% for professional fees (like CA, legal, medical, etc.) and non-compete fees."),
            ("What is Section 194Q and when does it apply?", "Section 194Q requires a buyer whose turnover exceeds ₹10 crore in the preceding FY to deduct TDS at 0.1% on purchase of goods from a resident seller if the purchase value exceeds ₹50 lakh in a financial year."),
            ("How does TDS under Section 194O affect e-commerce sellers?", "E-commerce operators must deduct TDS at 1% on the gross amount of sales or services facilitated through their digital platform for resident sellers. No TDS applies if the seller is an individual/HUF and gross sales do not exceed ₹5 lakh and PAN/Aadhaar is provided."),
            ("What happens if a deductee does not furnish a PAN?", "Under Section 206AA, if the deductee does not furnish their PAN, TDS is deducted at a higher rate: 20% for most sections (or the rate in force, whichever is higher). For Section 194Q/194O, the rate is 5%."),
            ("What is the due date for depositing TDS with the government?", "TDS must be deposited by the 7th of the following month (e.g., April TDS by May 7). For March deductions, the due date is extended to April 30."),
            ("What is the late fee for delayed filing of TDS returns?", "Under Section 234E, a late fee of ₹200 per day is charged for delayed filing of TDS returns, up to a maximum amount equal to the TDS amount in the return."),
            ("What is the interest rate for delayed TDS deduction and payment?", "Interest for failure to deduct TDS is 1% per month from the date tax was deductible to the date it is deducted. Interest for failure to deposit deducted TDS is 1.5% per month from the date tax was deducted to the date it is paid."),
            ("Can a resident individual avoid TDS by submitting Form 15G/15H?", "Yes, resident individuals whose total tax liability is NIL can submit Form 15G (or Form 15H for senior citizens aged 60+) to banks or financial institutions to avoid TDS on interest income."),
            ("What is Section 206C(1G) and when does TCS apply on foreign remittances?", "TCS applies at 20% on foreign remittances under the Liberalised Remittance Scheme (LRS) exceeding ₹7 lakh in a financial year. If the remittance is for education funded by a loan, the TCS rate is 0.5%; if for education/medical using own funds, the TCS is 5%."),
            ("How do I download Form 16A TDS certificates from TRACES?", "Log in to the TRACES portal as a deductee or deductor, go to the Downloads tab, request Form 16A by entering the financial year, quarter, and form type, and download once processed."),
            ("What is the TDS rate on payments made to Non-Resident Indians (NRIs)?", "TDS on payments to NRIs is governed by Section 195. It is deducted at the maximum rate applicable to the type of income (e.g. 30% on salary/interest, 12.5% on long-term capital gains, 20% on dividends), subject to lower rates under applicable DTAA treaties."),
            ("Can I file a correction return to modify a TDS entry?", "Yes, you can file a correction return on the TRACES portal to rectify PAN errors, payment amounts, interest defaults, or challan mismatches in your original TDS return."),
            ("How does TDS reconcile with the Annual Information Statement (AIS)?", "All TDS transactions filed by deductors appear in the Tax Deducted/Collected at Source information category of your AIS. Mismatches will trigger automated tax portal notices, so they must be reconciled before filing ITR.")
        ]
    },
    'gst': {
        'panels': [
            {
                'eyebrow': 'GST compliance',
                'title': 'What this page helps you decide',
                'items': [
                    'Determine if your aggregate turnover exceeds the registration threshold (₹20 lakh/₹40 lakh for goods, ₹10 lakh/₹20 lakh for services).',
                    'Decide if you qualify for the GST Composition Scheme under Section 10 to pay tax at a lower rate without claiming input tax credit.',
                    'Confirm the correct HSN/SAC code and corresponding tax rate (5%, 12%, 18%, or 28%) applicable to your supplies.',
                    'Identify the blockages in your Input Tax Credit (ITC) under Section 17(5) before claiming it in GSTR-3B.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'HSN code requirements: 6-digit HSN codes are mandatory for all taxpayers with aggregate turnover > ₹5 crore from February 1, 2025.',
                    'Input Tax Credit (ITC) can only be claimed if it is reflected in GSTR-2B and satisfies the conditions of Section 16(2) of the CGST Act.',
                    'An E-way bill is mandatory for the movement of goods of consignment value exceeding ₹50,000 (limit varies by state for intra-state movement).',
                    'Late fee for delayed GSTR-1 or GSTR-3B is ₹50 per day (₹20 per day for NIL returns) up to a maximum cap based on turnover.',
                    'GST interest at 18% per annum is payable on net tax liability if paid after the due date, under Section 50(1).'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'GSTIN (GST Identification Number) and GST portal login details.',
                    'Tax invoices, bill of supply, debit/credit notes, and delivery challans.',
                    'Purchase register and sales register for monthly reconciliation.',
                    'GSTR-2B statement showing ITC auto-populated from suppliers\' GSTR-1 filings.',
                    'E-way bills, transport receipts, and vehicle details where applicable.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Claiming Input Tax Credit (ITC) based on purchase invoices without reconciling with GSTR-2B, leading to tax demand notices.',
                    'Delaying the filing of GST returns, which blocks the filing of subsequent periods and triggers cancellations.',
                    'Misclassifying supplies as zero-rated vs exempt, leading to illegal ITC claims or blocked refund payouts.',
                    'Failing to generate an e-way bill for movement of goods, leading to detention, seizure, and a 200% penalty under Section 129.',
                    'Omitting GSTR-9 annual return and GSTR-9C reconciliation statements for eligible turnover thresholds.'
                ]
            }
        ],
        'faqs': [
            ("What are the threshold limits for GST registration in India?", "The aggregate turnover threshold for GST registration is ₹40 lakh for businesses selling goods (₹20 lakh for special category states), and ₹20 lakh for service providers (₹10 lakh for special category states)."),
            ("Who is eligible for the GST Composition Scheme?", "Taxpayers with aggregate turnover up to ₹1.5 crore (₹75 lakh for special category states) can opt for the Composition Scheme under Section 10 to pay a flat tax rate (1% to 6%) and file quarterly returns, but they cannot claim ITC or issue tax invoices."),
            ("What is the mandate for HSN codes on invoices from 2025?", "Taxpayers with an aggregate turnover exceeding ₹5 crore in the preceding financial year must report 6-digit HSN codes on all B2B and B2C tax invoices. Those with turnover up to ₹5 crore must report at least 4-digit HSN codes on B2B invoices."),
            ("What are the conditions to claim Input Tax Credit (ITC) under Section 16?", "To claim ITC: (1) You must have a valid tax invoice/debit note. (2) You must have received the goods/services. (3) The supplier must have paid the tax to the government. (4) The supplier must have filed their GSTR-1 and the invoice must appear in your GSTR-2B."),
            ("What constitutes blocked credit under Section 17(5) of the CGST Act?", "Blocked credit includes ITC on motor vehicles (with exceptions), food and beverages, outdoor catering, beauty treatment, health services, life insurance, membership of clubs, travel benefits to employees, and goods lost, stolen, destroyed, or written off."),
            ("When is an E-way bill mandatory for transporting goods?", "An E-way bill is mandatory for movement of goods of consignment value exceeding ₹50,000. It applies to both inter-state and intra-state movement (states can increase the threshold for intra-state movement)."),
            ("What is the interest rate for late payment of GST?", "Under Section 50(1), interest at 18% per annum is charged on net tax liability if paid after the due date. If ITC is wrongly availed and utilized, the interest rate is 24% per annum."),
            ("What is the penalty for filing GST returns late?", "Late fee for GSTR-1 and GSTR-3B is ₹50 per day (₹25 CGST + ₹25 SGST) of delay, capped at ₹500 for NIL returns and ₹2,000 to ₹10,000 for regular returns based on turnover."),
            ("How do GSTR-1 and GSTR-3B reconcile on the portal?", "GSTR-1 is the return of outward supplies (sales), and GSTR-3B is the summary return of tax liability and ITC payment. The sales details in GSTR-1 must match GSTR-3B to prevent demand notices for underreported tax."),
            ("What is GSTR-2B and how does it determine my ITC claim?", "GSTR-2B is an auto-drafted, static ITC statement generated on the 14th of every month. It reflects all ITC available based on GSTR-1/IFF filings by your suppliers. Taxpayers can only claim ITC that is reflected in GSTR-2B."),
            ("Is it mandatory to file GSTR-9 (Annual Return)?", "Filing GSTR-9 is mandatory for taxpayers with an aggregate turnover exceeding ₹2 crore in the financial year. Taxpayers with turnover up to ₹2 crore are exempt from filing, though they can file voluntarily."),
            ("What is the penalty for moving goods without an E-way bill?", "Under Section 129 of the CGST Act, moving taxable goods without a valid E-way bill attracts a penalty equal to 200% of the tax payable on the goods. If the owner does not come forward, the penalty is 50% of the value of the goods."),
            ("What is the difference between zero-rated and exempt supplies?", "Zero-rated supplies (exports and SEZ supplies) are taxable but at 0% rate, and ITC is fully claimable. Exempt supplies are not subject to GST, and any ITC associated with exempt supplies must be reversed."),
            ("Can I claim a refund for accumulated Input Tax Credit?", "Yes, you can claim a refund under Section 54(3) for accumulated ITC under two scenarios: (1) Zero-rated supplies made without payment of tax. (2) Inverted duty structure (where tax rate on inputs is higher than tax rate on outward supplies)."),
            ("What is the GST treatment for services exported from India?", "Export of services is treated as an inter-state supply and qualifies as zero-rated. It is exempt from GST if made under a Letter of Undertaking (LUT), allowing the exporter to claim a refund of accumulated ITC.")
        ]
    },
    'mca_roc': {
        'panels': [
            {
                'eyebrow': 'Corporate compliance',
                'title': 'What this page helps you decide',
                'items': [
                    'Confirm the type of entity to incorporate (Private Limited, OPC, LLP, or Public Company) based on funding and liability requirements.',
                    'Assess if you need a mandatory Secretarial Audit under Section 204 of the Companies Act, 2013, based on capital or loan thresholds.',
                    'Identify the event-based ROC filings required (e.g. change in directors, registered office, increase in capital, or charge creation).',
                    'Verify the status of your Digital Signature Certificate (DSC) and Director Identification Number (DIN) compliance.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Secretarial Audit (Form MR-3) is mandatory for listed companies, public companies with paid-up capital >= ₹50 crore or turnover >= ₹250 crore, and any company with outstanding bank/PFI loans >= ₹100 crore.',
                    'Director KYC (Form DIR-3 KYC) must be filed annually by September 30th; failure results in a deactivated DIN and a ₹5,000 late fee.',
                    'LLPs must file Form 11 (Annual Return) by May 30th and Form 8 (Statement of Accounts) by October 30th every year.',
                    'Board meetings: Companies must hold at least 4 board meetings in a calendar year, with the gap between two meetings not exceeding 120 days.',
                    'Active company status (Form INC-22A ACTIVE) is mandatory for companies incorporated on or before August 31, 2018.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'CIN (Corporate Identification Number) or LLPIN, and company master data.',
                    'Memorandum of Association (MOA) and Articles of Association (AOA) of the company.',
                    'Board resolutions, minutes books, share certificates, and registers of members.',
                    'DSC of directors, DIN details, and PAN/Aadhaar of directors.',
                    'Financial statements, balance sheet, audit report, and director\'s report for the relevant financial year.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Delaying annual ROC filings (Form AOC-4 and MGT-7), which attracts a penalty of ₹100 per day per form without any upper limit.',
                    'Executing transactions with directors (like loans or guarantees) without checking restrictions under Section 185 and 186.',
                    'Appointing directors or changing registered offices without filing the required forms within 30 days, leading to heavy late fees.',
                    'Operating with an expired DSC, which blocks e-filing on the MCA V3 portal.',
                    'Missing the AGM (Annual General Meeting) deadline, which must be held within 6 months from the close of the financial year.'
                ]
            }
        ],
        'faqs': [
            ("What are the thresholds for mandatory Secretarial Audit under Section 204?", "Secretarial Audit is mandatory for: (1) Every listed company. (2) Every public company with paid-up capital of ₹50 crore or more. (3) Every public company with turnover of ₹250 crore or more. (4) Every company with outstanding loans/borrowings from banks or public financial institutions of ₹100 crore or more."),
            ("What is DIR-3 KYC and what is the deadline for filing?", "DIR-3 KYC is an annual verification form for every director holding a DIN. The deadline is September 30th of every financial year. Failure to file deactivates the DIN and attracts a flat late fee of ₹5,000."),
            ("What are the annual compliance filings for a Private Limited Company?", "A private company must file: (1) Form AOC-4 (Financial Statements) within 30 days of the AGM. (2) Form MGT-7 (Annual Return) within 60 days of the AGM. (3) Form ADT-1 (Auditor Appointment) once every 5 years."),
            ("What forms must an LLP file annually on the MCA portal?", "An LLP must file: (1) Form 11 (Annual Return) within 60 days of the close of the FY (by May 30th). (2) Form 8 (Statement of Account & Solvency) within 30 days from the end of 6 months of the close of the FY (by October 30th)."),
            ("What is the gap limit between two board meetings?", "A company must hold at least 4 board meetings in a calendar year. The maximum gap between two consecutive board meetings must not exceed 120 days."),
            ("What is the penalty for late filing of AOC-4 and MGT-7?", "The late filing fee for annual ROC forms is ₹100 per day per form, and there is no maximum cap. Directors can also face prosecution and disqualification for long-term defaults."),
            ("Are loans to directors permitted under the Companies Act, 2013?", "Under Section 185, companies are prohibited from advancing loans, giving guarantees, or providing security in connection with loans to directors or persons in whom directors are interested, with specific exemptions for MD/WTD salary terms."),
            ("What is the deadline for holding the Annual General Meeting (AGM)?", "A company must hold its AGM within 6 months from the close of the financial year (by September 30th). For the first AGM, the company has 9 months from the close of the first financial year."),
            ("How is a director appointed or removed in a private company?", "A director is appointed by passing an ordinary resolution in a general meeting and filing Form DIR-12 within 30 days. Removal requires a special notice, passing a resolution u/s 169, and filing Form DIR-12 within 30 days."),
            ("What is the MCA V3 portal and how does it affect company filing?", "The MCA V3 portal is an upgraded online portal of the Ministry of Corporate Affairs where filings are web-based instead of PDF-based. It requires registration, two-factor authentication, and separate workspace logins."),
            ("What is the active company status requirement under INC-22A?", "Every company incorporated on or before August 31, 2018, was required to file Form INC-22A (ACTIVE) to verify its registered office location via geotagged photos. Failure blocks the company from filing major ROC forms."),
            ("What is the penalty for operating with an expired Digital Signature Certificate (DSC)?", "Filings cannot be uploaded on the MCA portal without a valid DSC. Using an expired DSC blocks all statutory filings, leading to late fees on compliance returns."),
            ("What are the compliance requirements for shifting a company's registered office?", "Shifting registered office within the same city requires board approval and filing Form INC-22 within 15 days. Shifting outside the city requires a special resolution. Shifting to another state requires Regional Director approval."),
            ("When is a company required to appoint a Peer-Reviewed Company Secretary?", "Under SEBI and professional guidelines, listed entities must appoint a Peer-Reviewed CS for issuing certificates like Secretarial Audit reports and compliance certificates from April 1, 2025 onwards."),
            ("What is the ROC penalty for MR-3 Secretarial Audit default?", "Failure to file or obtain the Secretarial Audit report under Section 204 attracts a penalty of ₹2,00,000 on the company and ₹50,000 on every officer in default (such as directors), as per recent ROC adjudication orders.")
        ]
    },
    'salary_epf': {
        'panels': [
            {
                'eyebrow': 'HR compliance',
                'title': 'What this page helps you decide',
                'items': [
                    'Reconcile your Cost to Company (CTC) structure to optimize tax savings (allowances like HRA, LTA, and NPS employer share).',
                    'Confirm if your organization meets the threshold for mandatory EPF registration (20 or more employees).',
                    'Determine your eligibility for gratuity payout under the Payment of Gratuity Act, 2013 (minimum 5 years of continuous service).',
                    'Verify if professional tax (PT) is applicable to your state and check the correct rate slabs.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'EPF contribution rate is 12% of basic salary + dearness allowance, with the employer matching the contribution (split into EPF and EPS).',
                    'Gratuity calculation formula: `(15 * Last Drawn Basic Salary * Years of Service) / 26`, subject to a maximum tax-free cap of ₹20,00,000.',
                    'Employer contribution to NPS under Section 80CCD(2) is tax-deductible up to 10% of salary (14% for government employees) under both regimes.',
                    'Form 16 Part A contains TDS details certificate from TRACES, while Part B contains the detailed salary breakdown and tax computations.',
                    'HRA exemption under Section 10(13A) is the minimum of: actual HRA received, 40%/50% of salary, or rent paid minus 10% of salary.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'UAN (Universal Account Number) and EPF member portal credentials.',
                    'Salary slips for the last 12 months, bank statements showing credits, and Form 16.',
                    'Rent receipts, rent agreement, and PAN of the landlord (if rent exceeds ₹1,0,000 per annum) for HRA claims.',
                    'Investment proofs under Section 80C, 80D, and home loan interest certificates.',
                    'Form 12BB (investment declaration) submitted to the employer at the start and end of the financial year.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Claiming HRA exemption without actual rent receipts, rent agreements, or a valid landlord PAN, leading to tax audits.',
                    'Failing to track EPF transfers when switching employers, resulting in multiple inactive accounts and loss of interest.',
                    'Mismatch between salary reported in ITR and Form 16/AIS, triggering immediate tax notices from the portal.',
                    'Omitting other employee benefits (like taxable ESOPs/RSUs at vesting) from tax calculations, leading to short-payment of tax.',
                    'Missing the deadline to submit investment proofs to the HR, leading to high TDS deduction in the months of January to March.'
                ]
            }
        ],
        'faqs': [
            ("What is the contribution rate for EPF for employees and employers?", "Both the employee and the employer contribute 12% of the basic salary plus dearness allowance to the Employee Provident Fund (EPF). The employer\'s 12% is split: 8.33% goes to the Employee Pension Scheme (EPS) and 3.67% goes to the EPF."),
            ("Who is eligible for gratuity under the Payment of Gratuity Act?", "An employee is eligible for gratuity if they have rendered continuous service for 5 years or more with a single employer. The 5-year rule is relaxed in case of death or disablement of the employee."),
            ("How is gratuity calculated for tax-free payouts?", "Gratuity is calculated as: `(15 * Last Drawn Basic Salary * Years of Service) / 26`. For employees not covered under the Gratuity Act, the formula is `(15 * Average Basic Salary of last 10 months * Years of Service) / 30`."),
            ("What is the maximum tax-free limit for gratuity in India?", "The maximum tax-free gratuity amount an employee can receive under the Payment of Gratuity Act is ₹20 lakh (₹2,000,000) during their entire working career."),
            ("Can employers deduct administrative charges from EPF contributions?", "Employers must pay EPF administrative charges (typically 0.50% of monthly pay) and EDLI contribution charges (0.50% of pay) out of their own funds. They cannot deduct these administrative charges from the employee\'s salary."),
            ("What is the standard deduction for salaried employees under both regimes?", "Salaried employees receive a standard deduction of ₹75,000 under the default New Tax Regime (increased from ₹50,000 in FY 2024-25) and ₹50,000 under the Old Tax Regime."),
            ("How is HRA exemption calculated under Section 10(13A)?", "HRA exemption is the minimum of: (1) Actual HRA received. (2) Rent paid minus 10% of basic salary. (3) 50% of basic salary (for metro cities: Delhi, Mumbai, Kolkata, Chennai) or 40% of basic salary (for non-metro cities)."),
            ("What is the employee NPS contribution deduction under Section 80CCD(1B)?", "Under the Old Tax Regime, employees can claim an additional deduction of up to ₹50,000 for contributions made to the NPS Tier-1 account under Section 80CCD(1B), over and above the ₹1.5 lakh limit of Section 80C. This is not available in the New Regime."),
            ("What is Section 80CCD(2) and how does it benefit salaried employees?", "Section 80CCD(2) allows deduction for the employer\'s contribution to the employee\'s NPS account. The deduction is capped at 10% of salary (basic + DA) and is available under both the Old and New Tax Regimes, making it a key tax-saving tool."),
            ("What is the difference between Form 16 Part A and Part B?", "Form 16 Part A is generated by the TRACES portal and contains details of quarterly TDS deducted and deposited by the employer. Part B is prepared by the employer and contains the detailed salary computation, deductions claimed, and net tax payable."),
            ("Is Professional Tax mandatory in all states in India?", "No, Professional Tax is a state-level levy and is only collected by certain states (like Maharashtra, Karnataka, Tamil Nadu, West Bengal). The maximum rate is capped at ₹2,500 per annum."),
            ("How do I transfer my EPF account when changing jobs?", "EPF transfers are initiated online through the Unified Member Portal using your Universal Account Number (UAN). You submit a transfer request which is verified and approved by your current or previous employer."),
            ("Are ESOPs and RSUs taxed as salary perquisites at vesting?", "Yes. At the time of vesting (for RSUs) or exercise (for ESOPs), the difference between the FMV on that date and the purchase price is taxable as a salary perquisite under Section 17(2)(vi) and subject to TDS by the employer."),
            ("What is the due date for employers to deposit EPF contributions?", "Employers must deposit EPF contributions into the government treasury within 15 days from the close of the month (e.g., January contributions by February 15)."),
            ("What is the penalty for employers who delay EPF deposits?", "Delayed EPF deposits attract interest under Section 7Q (12% per annum) and damages under Section 14B (ranging from 5% to 25% per annum based on the period of delay).")
        ]
    },
    'general': {
        'panels': [
            {
                'eyebrow': 'Financial planning',
                'title': 'What this page helps you decide',
                'items': [
                    'Assess if you should invest in equity, debt, or hybrid mutual funds based on your tax slab and time horizon.',
                    'Identify the holding period required to qualify for Long-Term Capital Gains (LTCG) on different asset classes (e.g. 12 months for equity, 24 months for property/unlisted).',
                    'Reconcile your investment portfolio with your long-term goals (Retirement, FIRE, education) using CAGR and SIP calculators.',
                    'Verify if dividend distributions from stocks/mutual funds are taxable in your hands and confirm the applicable TDS rate.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Capital gains on listed equity: LTCG (>12 months) is taxed at 12.5% above ₹1.25 lakh annual exemption, STCG is taxed at 20% under Section 111A.',
                    'Capital gains on debt mutual funds (purchased on or after April 1, 2023) are taxed as short-term capital gains at your individual slab rate, regardless of holding period.',
                    'Dividends are taxable in the hands of shareholders at slab rates under the head "Income from Other Sources".',
                    'Section 54EC allows exemption of capital gains on property sale if invested in NHAI/REC/PFC bonds within 6 months (maximum cap of ₹50 lakh).',
                    'Sovereign Gold Bonds (SGBs) held till maturity (8 years) are completely tax-free on capital gains for individual investors.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Demat account details, broker ledger statements, and contract notes.',
                    'Consolidated Account Statement (CAS) from NSDL or CDSL.',
                    'Capital gains statements generated from mutual fund houses or platforms.',
                    'Bank statements showing dividend credits and investment debits.',
                    'Form 26AS/AIS to verify dividend income and TDS credits.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Underreporting capital gains by ignoring intraday or F&O trades, which appear in AIS and lead to tax notices.',
                    'Redeeming mutual funds without calculating the exit load and short-term capital gains tax impact.',
                    'Failing to report dividend income u/s 56(2)(i), assuming it was tax-free (dividends became taxable at slab rates from FY 2020-21).',
                    'Missing the 6-month deadline for reinvestment under Section 54EC bonds, leading to tax liabilities.',
                    'Neglecting to submit Form 15G/15H to banks for interest payouts, leading to unwanted TDS deductions.'
                ]
            }
        ],
        'faqs': [
            ("How is the sale of mutual funds taxed in India?", "Equity mutual funds (>65% equity) are taxed at 12.5% LTCG (>12 months holding) above the ₹1.25 lakh exemption, or 20% STCG. Debt mutual funds purchased after April 1, 2023 are taxed at slab rates regardless of holding period."),
            ("What is the holding period for LTCG on equity vs debt mutual funds?", "Equity funds qualify for LTCG if held for more than 12 months. Debt mutual funds purchased before April 1, 2023 qualify for LTCG if held for more than 36 months (taxed at 20% with indexation). Debt funds purchased after that date do not qualify for LTCG."),
            ("Are dividends received from shares tax-free in India?", "No, dividend income from equity shares and mutual funds is fully taxable at your individual income tax slab rates. Dividend TDS at 10% applies if the payment exceeds ₹5,0,000 (or ₹10,000 for some types) in a financial year."),
            ("What is Section 54EC and how does it exempt capital gains on property?", "Section 54EC allows you to claim exemption on LTCG from property sale by investing the gains in NHAI, REC, PFC, or IRFC bonds within 6 months of the sale date. The maximum investment is capped at ₹50 lakh in a financial year."),
            ("Are Sovereign Gold Bonds (SGBs) tax-free on maturity?", "Yes, capital gains arising to an individual on the redemption of Sovereign Gold Bonds (SGBs) at maturity (8 years) are completely tax-exempt under Section 47(viib) of the Income Tax Act."),
            ("How is the sale of gold taxed under capital gains?", "LTCG on physical gold or gold mutual funds/ETFs (held for >24 months) is taxed at 12.5% without indexation (or 20% with indexation if applicable under historical choice). STCG (held <=24 months) is taxed at slab rates."),
            ("Do I need to file an ITR if my capital gains are below the exemption limit?", "Yes, if your gross total income before claiming exemptions/deductions (including the Section 54/112A capital gains exemptions) exceeds the basic exemption limit, you must file an ITR."),
            ("What is the difference between SIP and lump sum investments for taxation?", "For tax purposes, each installment of a Systematic Investment Plan (SIP) is treated as a separate investment. The holding period for capital gains is computed individually for each installment from its purchase date."),
            ("How does the double tax avoidance agreement (DTAA) help NRI investors?", "Under DTAA, an NRI can avoid paying tax on the same income in two countries by claiming lower tax rates or tax credits. A Tax Residency Certificate (TRC) and Form 10F are mandatory to claim treaty benefits."),
            ("What is the TDS rate on mutual fund redemptions for residents?", "TDS does not apply to mutual fund redemptions for resident taxpayers. However, for NRIs, TDS is deducted at source: 12.5% for equity LTCG, 20% for equity STCG, and individual slab rates for debt fund gains."),
            ("Can I claim capital losses to offset my salary income?", "No. Capital losses (both short-term and long-term) can only be set off against capital gains. They cannot be set off against salary income, business income, or other heads of income."),
            ("What is the carry-forward period for short-term and long-term capital losses?", "Unabsorbed capital losses can be carried forward for up to 8 assessment years, provided you file your ITR on time. Short-term capital losses can offset both STCG and LTCG. Long-term capital losses can only offset LTCG."),
            ("How does the Consolidated Account Statement (CAS) help in tax preparation?", "The CAS (issued by NSDL or CDSL) provides a consolidated view of all mutual fund holdings and transaction histories across different portfolios. It is the primary source to reconcile purchase costs and holding periods for capital gains."),
            ("What is the tax rate on NRI capital gains on property sale in India?", "LTCG on property sold by an NRI is taxed at 12.5% without indexation. STCG is taxed at slab rates (up to 30%). The buyer must deduct TDS at 20% (for LTCG) or 30% (for STCG) under Section 195."),
            ("Is interest earned on NRE accounts tax-free for NRIs?", "Yes, interest earned on Non-Resident External (NRE) savings and term deposits is completely exempt from income tax in India under Section 10(4)(ii), provided the individual is a person resident outside India under FEMA rules.")
        ]
    }
}

# Country specific DTAA details
def get_country_specific_info(filename, content):
    fn = filename.lower()
    text = content.lower()
    
    if any(k in fn for k in ['usa', 'us-tech', 'india-usa', 'moved-usa']) or ('usa' in text) or ('united states' in text) or ('us mnc' in text):
        return {
            'country': 'USA',
            'rate': '15% or 25%',
            'tds_desc': 'Under the India-USA DTAA, the withholding tax rate on dividends (including Regime 2 deemed dividends) is typically capped at 25% (or 15% for corporate shareholders). For US tax returns, you can claim a Foreign Tax Credit (FTC) using Form 1116 to offset this Indian tax.',
            'dtaa_desc': 'Under the India-USA DTAA, residents of the US can claim relief from double taxation on Indian-sourced income (such as salary perquisites, dividends, and capital gains). Dividends are subject to a capped withholding tax of 15% or 25% in India, and you can claim a Foreign Tax Credit (FTC) on your US Form 1040/1116.'
        }
    elif 'uk' in fn or 'united kingdom' in text or 'london' in text or 'uk-' in fn:
        return {
            'country': 'UK',
            'rate': '15%',
            'tds_desc': 'Under the India-UK DTAA, the withholding tax rate on dividends (including Regime 2 deemed dividends) is capped at 15%. You can claim a tax credit in the UK for the tax deducted in India.',
            'dtaa_desc': 'Under the India-UK DTAA, residents of the UK can claim relief from double taxation. Dividends are subject to a capped tax rate of 15% in India, which can be claimed as a credit against your UK income tax liability.'
        }
    elif 'singapore' in fn or 'singapore' in text:
        return {
            'country': 'Singapore',
            'rate': '10% or 15%',
            'tds_desc': 'Under the India-Singapore DTAA, the withholding tax rate on dividends (including Regime 2 deemed dividends) is capped at 10% or 15% (typically 15% for portfolio investments).',
            'dtaa_desc': 'Under the India-Singapore DTAA, residents of Singapore can claim tax relief. Dividend income is taxed at a capped rate of 10% or 15% in India, and you can claim tax credit under Singapore tax rules.'
        }
    elif 'uae' in fn or 'dubai' in fn or 'uae' in text or 'dubai' in text:
        return {
            'country': 'UAE',
            'rate': '10%',
            'tds_desc': 'Under the India-UAE DTAA, the withholding tax rate on dividends (including Regime 2 deemed dividends) is capped at 10%.',
            'dtaa_desc': 'Under the India-UAE DTAA, residents of the UAE can claim tax relief. Dividends are subject to a capped tax rate of 10% in India, allowing tax optimization for UAE-based NRIs.'
        }
    elif 'germany' in fn or 'germany' in text:
        return {
            'country': 'Germany',
            'rate': '10%',
            'tds_desc': 'Under the India-Germany DTAA, the withholding tax rate on dividends (including Regime 2 deemed dividends) is capped at 10%.',
            'dtaa_desc': 'Under the India-Germany DTAA, residents of Germany can claim relief. Dividends are taxed at a capped rate of 10% in India, which is eligible for tax credits under German tax laws.'
        }
    elif 'canada' in fn or 'canada' in text:
        return {
            'country': 'Canada',
            'rate': '15% or 25%',
            'tds_desc': 'Under the India-Canada DTAA, the withholding tax rate on dividends (including Regime 2 deemed dividends) is capped at 15% or 25%.',
            'dtaa_desc': 'Under the India-Canada DTAA, residents of Canada can claim double taxation relief. Dividends are subject to a capped tax rate of 15% or 25% in India, and can be claimed as a credit on your Canadian tax return.'
        }
    elif 'australia' in fn or 'australia' in text:
        return {
            'country': 'Australia',
            'rate': '15%',
            'tds_desc': 'Under the India-Australia DTAA, the withholding tax rate on dividends (including Regime 2 deemed dividends) is capped at 15%.',
            'dtaa_desc': 'Under the India-Australia DTAA, residents of Australia can claim double taxation relief. Dividends are taxed at a capped rate of 15% in India, which can be credited against your Australian tax liability.'
        }
    return None

def get_category_for_file(filename):
    fn = filename.lower()
    words = set(re.split(r'[^a-zA-Z0-9]+', fn))
    
    # 1. TDS & TCS
    tds_words = {'tds', '194', '195', 'w-8ben', 'w8ben', 'double-taxation', 'tcs', '206c', 'lrs', 'remittance'}
    if (words & tds_words) or any(k in fn for k in ['194', '206c', 'double-taxation']):
        return 'tds'
        
    # 2. GST
    gst_words = {'gst', 'e-invoice', 'e-invoicing', 'irn', 'qr-code', 'irp-portal', 'e-way-bill', 'itc', 'input-tax-credit', 'gstr', 'composition-scheme', 'sac-code', 'hsn'}
    if (words & gst_words) or any(k in fn for k in ['e-invoice', 'e-invoicing', 'qr-code', 'irp-portal', 'e-way-bill', 'input-tax-credit', 'composition-scheme', 'sac-code']):
        return 'gst'
        
    # 3. MCA & Corporate Law
    mca_words = {'mca', 'roc', 'secretarial', 'mr-3', 'companies-act', 'llp', 'incorporation', 'board-meeting', 'agm', 'dsc', 'din', 'director', 'voluntary-liquidation', 'winding-up', 'insolvency', 'bankruptcy', 'ibc'}
    if (words & mca_words) or any(k in fn for k in ['mr-3', 'companies-act', 'board-meeting', 'voluntary-liquidation', 'winding-up']):
        return 'mca_roc'
        
    # 4. Salary & Allowances
    salary_words = {'pf', 'epf', 'salary', 'payroll', 'ctc', 'form-16', 'form16', 'pay-slip', 'salary-slip', 'gratuity', 'bonus', 'provident', 'esi', 'professional-tax'}
    if (words & salary_words) or any(k in fn for k in ['form-16', 'pay-slip', 'salary-slip', 'professional-tax']):
        return 'salary_epf'
        
    # 5. ITR & Income Tax / Capital Gains
    itr_words = {'itr', 'file-itr', 'filing-itr', 'tax', 'taxation', 'slab', 'slabs', 'rebate', '87a', 'reassessment', 'exempt', 'capital-gain', 'capital-gains', 'ltcg', 'stcg', 'angel', 'rsu', 'esop', '43b', 'msme', 'presumptive', '44ad', '44ada', '44ae', 'unlisted-share', 'mutual-fund', 'sgb', 'sovereign-gold', 'gold-tax', 'property-sale', '54ec', '54f', 'rule-11ua', '50ca', 'notice', 'demand', '143-1', 'scrutiny', 'dispute', 'vivad-se-vishwas', 'appeal', 'arbitration', 'tribunal', 'litigation', 'court', 'judgment', 'case-law', 'ruling', 'landmark', 'aar', 'ngo', 'trust', 'charitable', 'religious', '80g', '12a', '12ab', 'donation'}
    if (words & itr_words) or any(k in fn for k in ['file-itr', 'filing-itr', 'capital-gain', 'capital-gains', 'unlisted-share', 'mutual-fund', 'sovereign-gold', 'gold-tax', 'property-sale', 'rule-11ua', '143-1', 'vivad-se-vishwas', 'case-law']):
        return 'itr_tax'
        
    return 'general'

def generate_panel_html(panel_data):
    eyebrow = panel_data['eyebrow']
    title = panel_data['title']
    items = panel_data['items']
    
    html_str = f'<section class="wi-panel"><div class="lp-section-eyebrow">{html.escape(eyebrow)}</div><h2>{html.escape(title)}</h2><ul class="wi-detail-list">\n'
    for item in items:
        html_str += f'  <li>{html.escape(item)}</li>\n'
    html_str += '</ul></section>\n'
    return html_str

def generate_html_faqs(faqs):
    html_str = '<section class="wi-panel"><div class="lp-section-eyebrow">Questions People Ask</div><h2>Frequently Asked Questions</h2><div class="wi-detail-list">\n'
    for idx, (q, a) in enumerate(faqs, 1):
        html_str += f'  <div style="margin-bottom: 16px;">\n'
        html_str += f'    <h3 style="font-size: 16px; margin: 12px 0 6px;">{idx}. {html.escape(q)}</h3>\n'
        html_str += f'    <p style="color: var(--text-muted); font-size: 14px; margin: 0 0 10px; line-height: 1.6;">{html.escape(a)}</p>\n'
        html_str += f'  </div>\n'
    html_str += '</div></section>\n'
    return html_str

def generate_grid_faq_html(faqs):
    html_str = '<section class="lp-section"><div class="lp-section-eyebrow">Questions People Ask</div><h2 class="lp-section-title">Frequently Asked Questions</h2><div class="wi-detail-grid">\n'
    for q, a in faqs:
        html_str += f'  <div class="lp-step">\n'
        html_str += f'    <h3>{html.escape(q)}</h3>\n'
        html_str += f'    <p style="color: var(--text-muted); line-height: 1.6;">{html.escape(a)}</p>\n'
        html_str += f'  </div>\n'
    html_str += '</div></section>\n'
    return html_str

# Special overrides
def get_buyback_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">Tax Evolution</div>
  <h2>The 3-Regime History of Share Buybacks in India</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked against the Income-tax Act, 1961 and Finance Act 2026.</span>
  </div>
  <p>Share buyback taxation in India has undergone a massive shift twice in the span of eighteen months. The applicable tax regime depends strictly on the <strong>date the buyback payment is received</strong> by the shareholder:</p>
  
  <h3>Regime 1: Until 30 September 2024 (Exempt for Shareholders)</h3>
  <p>Under the historical framework, the company repurchasing the shares bore the entire tax burden. The domestic company paid a special buyback tax under <strong>Section 115QA</strong> at a flat rate of 20% (plus surcharge and cess, effectively 23.296%) on the "distributed income" (buyback price minus the amount originally received by the company at issue). The shareholder received the proceeds completely tax-free under <strong>Section 10(34A)</strong>.</p>
  
  <h3>Regime 2: 1 October 2024 to 31 March 2026 (FY 2025-26 - Deemed Dividend)</h3>
  <p>To eliminate the tax arbitrage where promoters and HNIs preferred buybacks over dividends, the Finance (No. 2) Act, 2024 shifted the tax burden entirely to the shareholder. Section 115QA was abolished for companies. Instead:</p>
  <ul class="wi-detail-list">
    <li>The <strong>entire gross buyback proceeds</strong> are treated as a <strong>deemed dividend</strong> under <strong>Section 2(22)(f)</strong>.</li>
    <li>This income is taxed under "Income from Other Sources" at the shareholder's applicable slab rates (up to 39% or 35.8%). No deduction for cost of acquisition is permitted.</li>
    <li>The cost of acquisition of the tendered shares is treated separately as a capital loss under <strong>Section 46A</strong>.</li>
  </ul>
  
  <h3>Regime 3: From 1 April 2026 (FY 2026-27 Onwards - Capital Gains)</h3>
  <p>Recognizing the double-taxation trap created by Regime 2, the Finance Act 2026 restored capital gains treatment for buybacks. Tax is levied only on the actual gain (Buyback Price minus Cost of Acquisition). However, promoters pay normal capital gains plus an additional buyback tax, resulting in an effective tax rate of 22% for corporate promoters and 30% for individual promoters, plus a flat 12% surcharge on that additional tax component.</p>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Double Taxation Risk</div>
  <h2>The Section 46A Capital Mismatch & Phantom Loss Trap</h2>
  <p>Under Regime 2 (applicable for FY 2025-26 buyback receipts), shareholders face a severe mismatch between different tax heads:</p>
  <ul class="wi-detail-list">
    <li><strong>Slab-tax on gross receipts</strong>: If you bought shares at ₹100 and tender them at ₹300, the full ₹300 is taxed at your slab rate (e.g., 30% plus cess = 31.2%).</li>
    <li><strong>Capital loss on cost</strong>: Your ₹100 purchase cost is recorded as a capital loss in your capital gains schedule.</li>
    <li><strong>Set-off restrictions</strong>: This capital loss cannot offset the deemed dividend income, because capital losses can only offset capital gains under Indian tax laws.</li>
    <li><strong>The Phantom Loss Trap</strong>: If a retail investor has no other taxable capital gains (from selling property, gold, or other stocks) in the same financial year, they cannot utilize this capital loss. While the loss can be carried forward for up to 8 years, the investor pays tax on the gross receipt immediately, locking up their capital in a "phantom loss."</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Constitutional Debate</div>
  <h2>Legality of Taxing Return of Capital: Taxmann Legal Analysis</h2>
  <p>The reclassification of gross buyback proceeds as deemed dividends under Section 2(22)(f) has raised critical legal and constitutional debates on platforms like Taxmann:</p>
  <ul class="wi-detail-list">
    <li><strong>Entry 82, List I Scope</strong>: Under the Seventh Schedule of the Constitution, Parliament has the power to tax "income." Taxing the original return of capital (the purchase cost) rather than income is argued to exceed the legislative competence of Parliament.</li>
    <li><strong>Article 265 Compliance</strong>: The Constitution mandates that no tax shall be levied except by authority of law. Taxing capital recoveries under the guise of dividend income challenges the economic reality of the transaction.</li>
    <li><strong>No Accumulated Profits Limitation</strong>: Traditional deemed dividend clauses (Section 2(22)(a)-(e)) are strictly capped to the extent of the company's "accumulated profits." Section 2(22)(f), however, taxes the entire proceeds, meaning it taxes the return of the company's capital/share premium itself.</li>
    <li><strong>Navnit Lal Javeri Precedent</strong>: Courts have historically upheld deemed dividends (such as taxing shareholder loans) only as anti-evasion fictions capped at accumulated profits. Section 2(22)(f) lacks this anti-evasion link by taxing the return of capital, making it constitutionally vulnerable.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Worked Examples</div>
  <h2>Mathematical Tax Computations Across Regimes</h2>
  <p>Consider an individual investor (30% tax slab) who purchased 1,000 shares at ₹100 each (total cost ₹1,00,000) and tenders them in a buyback at ₹300 each (total proceeds ₹3,00,000). Shares held for >12 months:</p>
  
  <h3>Scenario A: Under Regime 2 (FY 2025-26)</h3>
  <ul class="wi-detail-list">
    <li>Deemed Dividend taxable under Other Sources: <strong>₹3,00,000</strong></li>
    <li>Tax payable (at 30% slab plus 4% cess = 31.2%): <strong>₹93,600</strong></li>
    <li>Capital Loss booked under Section 46A: <strong>₹1,00,000</strong></li>
    <li>Net tax if no other capital gains exist to offset loss: <strong>₹93,600</strong> (An effective tax rate of <strong>93.6% on the actual gain</strong> of ₹2,00,000).</li>
  </ul>
  
  <h3>Scenario B: Under Regime 3 (FY 2026-27)</h3>
  <ul class="wi-detail-list">
    <li>Long-Term Capital Gain (Proceeds - Cost): <strong>₹2,00,000</strong></li>
    <li>Tax under Section 112A (12.5% on gain, assuming ₹1.25L exemption already used): <strong>₹25,000</strong></li>
    <li>Net tax: <strong>₹25,000</strong> (A savings of <strong>₹68,600</strong> compared to Regime 2).</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Strategy & Planning</div>
  <h2>Tendering in Buyback vs. Selling on the Stock Exchange</h2>
  <div style="overflow-x: auto; margin: 16px 0;">
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-color); background: var(--bg-muted);">
          <th style="padding: 10px; border: 1px solid var(--border-color);">Particulars</th>
          <th style="padding: 10px; border: 1px solid var(--border-color);">Tendering in Buyback (Regime 2)</th>
          <th style="padding: 10px; border: 1px solid var(--border-color);">Open Market Sale (FY 2025-26)</th>
          <th style="padding: 10px; border: 1px solid var(--border-color);">Regime 3 (FY 2026-27 - Buyback/Sale)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Taxable Income Head</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Income from Other Sources (Gross)</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Capital Gains (Net Gain)</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Capital Gains (Net Gain)</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-muted);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Tax Rate</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Slab Rate (up to 39%)</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">LTCG at 12.5% / STCG at 20%</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">LTCG at 12.5% / STCG at 20%</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Cost Deduction</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">NIL (becomes separate Capital Loss)</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Fully Deductible</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Fully Deductible</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p>In FY 2025-26, selling on the open market was significantly better. In FY 2026-27, they achieve parity, so tendering is preferred if the buyback offer price has a premium over the market price.</p>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">NRI Taxation</div>
  <h2>Double Taxation Relief & TDS Rules for Non-Residents</h2>
  <p>When a Non-Resident Indian (NRI) participates in a buyback, the transaction is subject to specific international tax rules:</p>
  <ul class="wi-detail-list">
    <li><strong>TDS under Section 195</strong>: Under Regime 2, the company deducts TDS on the deemed dividend at a default rate of 20% (plus surcharge and cess). Under Regime 3, TDS applies on capital gains (12.5% for LTCG, 30% or 40% for STCG based on status).</li>
    <li><strong>DTAA Treaty Benefits</strong>: NRIs can claim lower tax rates under Double Taxation Avoidance Agreements (DTAA) between India and their country of residence. For example, under the India-US DTAA, the withholding tax rate on dividends is typically capped at 15% or 25%. Under the India-Singapore or India-Mauritius DTAAs, the rate is capped at 10% or 15%.</li>
    <li><strong>Country-Specific Application</strong>: The actual tax rate applied is determined dynamically based on the NRI's specific tax residence certificate country.</li>
    <li><strong>Mandatory Documentation</strong>: To claim DTAA benefits, the NRI must submit a valid Tax Residency Certificate (TRC) issued by their home government, a declaration in Form 10F (filed online), and their Indian PAN.</li>
    <li><strong>Foreign Tax Credit (FTC)</strong>: Taxes paid in India can be claimed as a credit in the NRI's home country to avoid double taxation, by filing Form 67 (in India) and local tax forms (e.g., Form 1116 in the US).</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">ITR Reporting</div>
  <h2>Reporting Buybacks in ITR Schedules (FY 2025-26 & FY 2026-27)</h2>
  <ol class="wi-detail-list">
    <li><strong>Form Selection</strong>: You must file <strong>ITR-2</strong> (salary, capital gains) or <strong>ITR-3</strong> (business income). ITR-1 cannot be used.</li>
    <li><strong>Deemed Dividend (Regime 2)</strong>: Report the gross proceeds in <strong>Schedule OS</strong> under the head "Income from Other Sources" as "Deemed Dividend under Section 2(22)(f)".</li>
    <li><strong>Capital Loss (Regime 2)</strong>: Report the cost of acquisition in <strong>Schedule CG</strong> as the cost of shares, with sale consideration entered as NIL. This registers the capital loss under Section 46A.</li>
    <li><strong>Capital Gains (Regime 3)</strong>: Report the transaction in <strong>Schedule CG</strong> (under Section 112A for listed shares) with actual buyback price as sale consideration and actual cost as cost of acquisition.</li>
    <li><strong>TDS Verification</strong>: Reconcile TDS credits in <strong>Form 26AS</strong> and <strong>AIS</strong> before filing.</li>
  </ol>
</section>
"""
    return content

def get_pf_withdrawal_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">PF Taxability Chart</div>
  <h2>Statutory Comparison: SPF vs RPF vs URPF vs PPF</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked against the Income-tax Act, 1961 and standard ICAI CA Intermediate study material.</span>
  </div>
  <p>The taxability of Provident Fund (PF) contributions, interest, and ultimate withdrawals depends on the classification of the fund. Below is the detailed statutory comparison chart mapping these rules during employment and at withdrawal:</p>
  <div style="overflow-x: auto; margin: 16px 0;">
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; line-height: 1.5;">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-color); background: var(--bg-muted);">
          <th style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Particulars</th>
          <th style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Statutory PF (SPF)</th>
          <th style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Recognized PF (RPF)</th>
          <th style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Unrecognized PF (URPF)</th>
          <th style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Public PF (PPF)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold; background: var(--bg-muted);">Employer's Contribution</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Fully exempt from income tax.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Exempt up to 12% of salary. Excess u/s 17(1) is taxable as "salary".</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Not taxable at the time of contribution.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Not Applicable (no employer contribution).</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-muted);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold; background: var(--bg-muted);">Employee's Contribution</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Eligible for Sec 80C deduction (if under Old Regime u/s 115BAC(1A)).</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Eligible for Sec 80C deduction (if under Old Regime u/s 115BAC(1A)).</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Not eligible for any tax deduction.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Eligible for Sec 80C deduction (if under Old Regime u/s 115BAC(1A)).</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold; background: var(--bg-muted);">Interest on Employer's Share</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Fully exempt from income tax.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Exempt up to 9.5% p.a. Excess u/s 17(1) is taxable as "salary".</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Not taxable at the time of credit.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Not Applicable.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-muted);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold; background: var(--bg-muted);">Interest on Employee's Share</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Exempt up to annual limit of ₹5,00,000 (if no employer share u/s 10(11)).</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Exempt up to 9.5% p.a. AND u/s 10(12), exempt up to ₹2,50,000 (with employer share) / ₹5,00,000 (no employer share).</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Not taxable at the time of credit.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Exempt up to annual limit of ₹5,00,000 (if no employer share u/s 10(11)).</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold; background: var(--bg-muted);">Lump Sum Withdrawal</td>
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold; color: #10b981;">Fully exempt u/s 10(11).</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Exempt u/s 10(12) if continuous service >= 5 years (or due to ill health, business closure, transfer to new employer RPF/NPS). Else retroactively taxed as URPF.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">
            • Employee contribution: Exempt.<br>
            • Employee interest: Taxed u/h "Other Sources".<br>
            • Employer contribution &amp; interest: Taxed as "Salaries".
          </td>
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold; color: #10b981;">Fully exempt u/s 10(11).</td>
        </tr>
      </tbody>
    </table>
  </div>
  <p><em>*Note: "Salary" for the purpose of the 12% contribution limit refers to Basic Salary + Dearness Allowance (if forming part of retirement benefits) + Commission as a fixed percentage of turnover.</em></p>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Exemption &amp; Withdrawal</div>
  <h2>What This Provident Fund Guide Helps You Decide</h2>
  <ul class="wi-detail-list">
    <li><strong>Withdrawal vs. Transfer</strong>: Whether you should withdraw your EPF balance when changing jobs, or transfer it to your new employer's Recognized Provident Fund (RPF) to maintain your service tenure.</li>
    <li><strong>NPS Route</strong>: Deciding whether to transfer your accumulated RPF balance to your National Pension System (NPS) Tier-1 account under Section 10(12) for long-term retirement planning.</li>
    <li><strong>Tax Regime Selection</strong>: Evaluating if it is beneficial to stick to the Old Tax Regime to claim Section 80C deductions for self-contributions to EPF/PPF, or shift to the default New Regime.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Accuracy &amp; Limits</div>
  <h2>Accuracy Notes Before You Withdraw</h2>
  <ul class="wi-detail-list">
    <li><strong>The 5-Year Continuous Service Rule</strong>: Withdrawal of accumulated balance from a Recognized Provident Fund (RPF) is exempt under Section 10(12) only if the employee has rendered a continuous service period of at least 5 years. Service with a former employer counts if the PF balance was successfully transferred to the new employer.</li>
    <li><strong>Section 192A TDS Threshold</strong>: Tax Deducted at Source (TDS) at 10% is applicable on taxable PF withdrawals (under 5 years of service) if the amount is ₹50,000 or more. If PAN is not furnished, TDS is deducted at the Maximum Marginal Rate (over 30%).</li>
    <li><strong>Form 15G/15H for Nil TDS</strong>: You can submit Form 15G (or Form 15H for senior citizens) to the EPFO if your total income (including the taxable withdrawal) is below the basic exemption threshold, to prevent TDS.</li>
    <li><strong>Interest Accrual Limits (Post-2021)</strong>: Interest on annual employee contributions exceeding ₹2,50,000 (where the employer also contributes) or ₹5,00,000 (where there is no employer contribution) is taxable under Section 10(11) and 10(12).</li>
    <li><strong>Rule 9D Separate Ledger Accounts</strong>: Rule 9D requires the maintainance of two separate accounts within the PF ledger: a Non-Taxable Contribution Account (pre-2021 balance + subsequent below-threshold contributions + interest) and a Taxable Contribution Account (contributions in excess of limits + interest). Only the interest in the taxable account is subject to annual tax.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Required Documents</div>
  <h2>Documents and Facts to Keep Ready</h2>
  <ul class="wi-detail-list">
    <li><strong>Universal Account Number (UAN)</strong>: Must be active and seeded with your Aadhaar, PAN, and bank account details on the EPFO Unified Portal.</li>
    <li><strong>EPF Member Passbook</strong>: Download the latest passbook to check the bifurcation of employer and employee contributions and interest credits.</li>
    <li><strong>Form 15G / Form 15H</strong>: Two signed copies if your withdrawal is taxable (under 5 years) but your total income falls below the taxable limit.</li>
    <li><strong>Form 19 and Form 10C/10D</strong>: Form 19 is used for final EPF settlement; Form 10C is for pension withdrawal benefit (or scheme certificate if service is over 10 years).</li>
    <li><strong>Bank Account Verification</strong>: A cancelled cheque with your name printed, or an attested copy of your bank passbook first page, to ensure direct deposit of funds.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Mistakes to Avoid</div>
  <h2>Common Mistakes to Avoid</h2>
  <ul class="wi-detail-list">
    <li><strong>Premature Withdrawal (Under 5 Years)</strong>: Withdrawing PF before completing 5 years of continuous service triggers retrospective tax liability, where the entire amount is taxed as if the fund were an Unrecognized Provident Fund (URPF).</li>
    <li><strong>Failing to File Form 15G/15H</strong>: Forgetting to submit Form 15G/15H when eligible results in mandatory 10% TDS, requiring you to file ITR and claim a refund.</li>
    <li><strong>Ignoring the Pension Component</strong>: Withdrawing the pension scheme contribution (Form 10C) instead of taking a Scheme Certificate when your service exceeds 10 years. After 10 years, pension withdrawal is blocked and you are only eligible for a monthly pension upon retirement.</li>
    <li><strong>Conflating EPF u/s 10(12) with PPF u/s 10(11)</strong>: Assuming PPF carries a 5-year service limit. PPF withdrawals are fully exempt u/s 10(11) (governed by the PPF scheme maturity rules), and are not subject to the 5-year employer service rule.</li>
    <li><strong>Miscalculating Cost in URPF Withdrawals</strong>: Under URPF, employee's own contribution is not taxed, but interest on it is taxable under "Income from Other Sources". Employer's share and its interest are taxed u/h "Salaries". Misreporting this leads to mismatch notices.</li>
  </ul>
</section>
"""
    return content

def get_pf_withdrawal_faqs():
    return [
        ("What are the four main types of Provident Funds in India?", "Statutory Provident Fund (SPF), Recognized Provident Fund (RPF), Unrecognized Provident Fund (URPF), and Public Provident Fund (PPF). They serve different sectors and carry distinct tax rules."),
        ("What is the tax treatment of employer's contribution to RPF?", "Contributions up to 12% of the employee's salary are exempt. Any amount in excess of 12% is taxable as salary under Section 17(1)."),
        ("Is the employee's contribution to PF eligible for tax deduction?", "Yes, contributions to SPF, RPF, and PPF are eligible for deduction under Section 80C (up to ₹1,50,000) under the Old Tax Regime (if the employee opts out of the default New Regime u/s 115BAC(1A)). Contributions to URPF do not qualify for Section 80C."),
        ("At what rate is interest credited on PF contributions taxable during employment?", "For RPF, interest credited in excess of 9.5% p.a. is taxable as salary u/s 17(1). For URPF, interest is not taxed at the time of credit. For SPF and PPF, interest is fully exempt during employment (subject to Section 10(11) annual limits)."),
        ("What is the ₹2,50,000 annual limit for PF interest taxability?", "Effective from April 1, 2021, if an employee's annual contribution to RPF or SPF exceeds ₹2,50,000, interest on the excess contribution is taxable. This limit applies to funds where the employer also contributes."),
        ("Under what conditions is the ₹5,00,000 higher threshold applicable for PF interest taxability?", "If there is no employer contribution to the fund (e.g., PPF or government GPF), the threshold for interest exemption is raised to ₹5,00,000 per year. Interest on employee contributions above this limit is taxable."),
        ("How is taxable interest calculated under Rule 9D?", "The CBDT mandates maintaining separate accounts within the PF account from FY 2021-22 onwards: a Non-Taxable Contribution Account (closing balance as on 31.03.2021 + contributions within limits + interest) and a Taxable Contribution Account (contributions exceeding limits + interest). Interest on the taxable account is taxed annually."),
        ("Under what conditions is a lump-sum withdrawal from RPF fully exempt from income tax?", "Under Section 10(12), RPF withdrawal is exempt if the employee has rendered continuous service of 5 years or more, or if service is terminated due to ill-health, discontinuance of the employer's business, or other reasons beyond the employee's control."),
        ("What happens if an employee withdraws from RPF before completing 5 years of continuous service?", "If withdrawn before 5 years (and not due to ill-health/discontinuance), the accumulated balance becomes taxable. It is taxed retroactively as if the fund had been an Unrecognized Provident Fund (URPF) from the beginning, and the taxpayer must pay the tax difference."),
        ("How is the 5-year continuous service rule calculated when changing employers?", "If the accumulated balance in the old employer's RPF is transferred to the new employer's RPF, the service period with the former employer is added to the service with the new employer to calculate the 5-year continuous service period."),
        ("Can RPF accumulated balance be transferred to the National Pension System (NPS) tax-free?", "Yes, under Section 10(12), if the entire accumulated balance in RPF is transferred directly to the employee's Tier-1 NPS account u/s 80CCD, the transfer is fully exempt from tax."),
        ("How is a lump-sum withdrawal from an Unrecognized Provident Fund (URPF) taxed?", "URPF withdrawals are taxed as follows: employee's contribution is exempt; interest on the employee's contribution is taxable under 'Income from Other Sources'; employer's contribution and interest thereon are taxable under the head 'Salaries' u/s 17(1)."),
        ("Is a lump-sum withdrawal from Statutory Provident Fund (SPF) or Public Provident Fund (PPF) taxable?", "No. Lumpsum withdrawals from SPF and PPF are fully exempt from income tax under Section 10(11), irrespective of the number of years of contribution, subject only to the post-2021 interest taxability thresholds on high contributions."),
        ("What are the TDS rules for PF withdrawals under Section 192A?", "Under Section 192A, TDS is deducted at 10% on RPF withdrawals if the withdrawal is taxable (i.e. before 5 years) and the amount is ₹50,000 or more. If the employee does not furnish a PAN, TDS is deducted at the maximum marginal rate (30% + surcharge & cess)."),
        ("How can an employee avoid TDS under Section 192A on taxable PF withdrawals?", "If the employee's total income (including the taxable PF withdrawal) is below the basic exemption limit, they can submit Form 15G (or Form 15H for senior citizens) to the PF authorities to claim payment without TDS.")
    ]

def get_buyback_faqs():
    return [
        ("Which buyback tax regime applies to me right now?", "The regime is determined by the date the buyback payment was received, not the date of announcement. Payments received between 1 October 2024 and 31 March 2026 fall under Regime 2 (deemed dividend at slab rate). Payments received from 1 April 2026 onwards fall under Regime 3 (capital gains). Payments received before 1 October 2024 fell under Regime 1 (exempt in shareholder's hands)."),
        ("Under Regime 2, can I deduct my share cost from the buyback proceeds before paying tax?", "No. Under Regime 2, the entire buyback proceeds are taxed as deemed dividend with no deduction for cost of acquisition against that income. The cost of acquisition arises separately as a capital loss under amended Section 46A. This capital loss can only be set off against other capital gains and cannot reduce the deemed dividend income from the same buyback."),
        ("Is the buyback capital loss from Regime 2 wasted if I have no other capital gains?", "Not necessarily. The capital loss can be carried forward for up to 8 assessment years, provided the ITR for the year the loss arose was filed on time. It can be used to offset capital gains in any of those future years, subject to normal set-off rules: short-term capital loss can offset both STCG and LTCG; long-term capital loss can only offset LTCG."),
        ("Under Regime 3, is a promoter always taxed at 22% or 30% on buyback gains?", "These are the effective rates after the additional buyback tax is applied. Non-promoter shareholders pay standard capital gains rates: 12.5% LTCG or 20% STCG on listed shares. The promoter differential applies only to those who meet the promoter definition under the SEBI Buyback Regulations (for listed companies) or the Companies Act definition or above-10% shareholder threshold (for unlisted companies)."),
        ("Is TDS deducted on buyback proceeds?", "Under Regime 2 (October 2024 to March 2026): yes, the company deducts TDS as the proceeds are treated as deemed dividend. Under Section 194, TDS at 10% applies where the total dividend paid to the shareholder during the financial year exceeds ₹10,000. Under Regime 3 (from April 2026): standard TDS rules for capital gains apply. TDS is generally not deducted by the company on capital gains payable to resident investors."),
        ("If I participate in a buyback under Regime 2 and also sell shares on the market in the same year, can the buyback capital loss offset my market sale capital gains?", "Yes. The capital loss from the buyback (your share cost under amended Section 46A) and the capital gains from open-market sales are both in the capital gains head and can be set off against each other. Short-term capital loss from the buyback can offset both STCG and LTCG from market sales. Long-term capital loss can only offset LTCG."),
        ("Which ITR form should I file if I participated in a buyback?", "Under Regime 2, the buyback proceeds appear as dividend income and the capital loss appears in the capital gains schedule. This combination requires ITR-2 for salaried individuals or ITR-3 if business income also exists. ITR-1 cannot be used. Under Regime 3, the buyback is purely a capital gains transaction. ITR-2 applies for salaried individuals with capital gains; ITR-3 if business income is also present."),
        ("What is the definition of distributed income under Section 115QA?", "Under the pre-October 2024 regime, distributed income was defined as the buyback consideration paid by the company to the shareholder less the amount originally received by the company at the time of issuing those shares (the issue price)."),
        ("How does the W-8BEN form help NRI investors in a buyback?", "Submitting a W-8BEN form to the foreign broker certifies the tax residency in a country that has a DTAA treaty with the US, reducing US backup withholding tax on US company stock buybacks. For Indian buybacks, NRIs submit Form 10F and a Tax Residency Certificate to claim lower treaty rates."),
        ("What is the TDS rate on buyback proceeds paid to NRI shareholders under DTAA?", "The TDS rate under Section 195 is typically 20% (plus surcharge and cess) on deemed dividends. However, under DTAA treaties, the rate is often capped at 10% or 15% (e.g. India-Singapore) or 15% or 25% (e.g. India-US), subject to submitting a TRC and Form 10F."),
        ("Why was Regime 2 criticized by retail investors?", "It was criticized because taxing the gross proceeds at individual slab rates (up to 39%) without allowing cost deductions created excessive tax liabilities. The corresponding capital loss on cost under Section 46A could not be set off against the dividend income, resulting in double taxation for investors without other capital gains."),
        ("Can I carry forward capital losses from buybacks if I file a belated return?", "No. To carry forward capital losses to future years, you must file your ITR on or before the original due date under Section 139(1). If you file a belated return, the loss cannot be carried forward."),
        ("What is the holding period threshold for unlisted shares in a buyback under Regime 3?", "For unlisted shares, the holding period to qualify for LTCG is more than 24 months. LTCG is taxed at 12.5% without indexation. STCG (held <= 24 months) is taxed at the individual's slab rate."),
        ("Is compulsory acquisition of land treated similarly to a buyback?", "No. Compulsory acquisition of urban land is a transfer under capital gains but is exempt under Section 10(37) for individual agriculturalists. Buybacks are specifically governed by Section 46A or Section 2(22)(f)."),
        ("What is the surcharge rate for promoters under Regime 3?", "Under the Finance Act 2026, a flat surcharge of 12% applies specifically on the additional promoter buyback tax component, regardless of the promoter's total income level.")
    ]

def get_msme_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">MSME Compliance</div>
  <h2>Section 43B(h) MSME Payment Rules & Deadlines</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked against the Income-tax Act, 1961 and MSMED Act, 2006.</span>
  </div>
  <p>Section 43B(h) of the Income-tax Act, 1961, mandates that payments to Micro and Small Enterprises (MSEs) must be made within the deadlines prescribed under Section 15 of the MSMED Act, 2006. If a business fails to clear these dues within the specified timeline, the corresponding business expenditure is disallowed as a deduction for that financial year, increasing taxable business income and tax liability.</p>
  
  <h3>The 15-Day and 45-Day Payment Timelines</h3>
  <ul class="wi-detail-list">
    <li><strong>No Written Agreement</strong>: If there is no written agreement between the buyer and the MSE supplier, payment must be made within <strong>15 days</strong> from the date of acceptance of the goods/services.</li>
    <li><strong>With Written Agreement</strong>: If there is a written agreement, the payment must be made as per the agreed terms, but this period <strong>cannot exceed 45 days</strong>. Any agreement clause specifying more than 45 days is legally deemed to be 45 days.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Applicability</div>
  <h2>Which Enterprises Qualify under Section 43B(h)?</h2>
  <p>The payment disallowance rule applies strictly based on the size and registration status of the supplier:</p>
  <ul class="wi-detail-list">
    <li><strong>Micro Enterprises</strong>: Investment in plant & machinery/equipment <= ₹1 crore AND annual turnover <= ₹5 crore.</li>
    <li><strong>Small Enterprises</strong>: Investment in plant & machinery/equipment <= ₹10 crore AND annual turnover <= ₹50 crore.</li>
    <li><strong>Udyam Registration Mandatory</strong>: The supplier must hold a valid active Udyam registration on the date of transaction to claim benefits under Section 43B(h).</li>
    <li><strong>Medium Enterprises Excluded</strong>: The rule does <strong>not</strong> apply to Medium Enterprises (turnover up to ₹250 crore).</li>
    <li><strong>Retailers and Wholesalers Excluded</strong>: As per Office Memorandum (OM) No. 5/2(2)/2021-E/P&G/Policy dated 02.07.2021, traders registered under Udyam are eligible only for Priority Sector Lending. They are excluded from the MSMED Act's delayed payment provisions, so purchases from traders are not subject to Section 43B(h) disallowance.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Year-End Impact</div>
  <h2>The March 31 Cut-off and Add-Back Consequences</h2>
  <p>The year-end disallowance mechanics depend strictly on whether the payment was made by March 31:</p>
  <ul class="wi-detail-list">
    <li><strong>Paid within timeline</strong>: The expense is allowed as deduction in the year of accrual.</li>
    <li><strong>Paid delayed but within the same FY</strong>: If the payment is made after the 15/45 day limit but before March 31, the deduction is allowed in the same FY.</li>
    <li><strong>Outstanding on March 31</strong>: If the payment is delayed beyond the 15/45 day limit and remains unpaid as of March 31, the entire expense is disallowed and added back to the business\'s taxable profit for that year.</li>
    <li><strong>Deduction in Year of Payment</strong>: The disallowed expenditure can only be claimed as a deduction in the subsequent financial year in which the payment is actually made.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Worked Example</div>
  <h2>Mathematical Impact of Disallowance</h2>
  <p>Consider a manufacturing company with a net profit before tax of ₹50,00,000 for FY 2025-26. It purchased raw materials worth ₹15,00,000 from a registered micro-manufacturer. The payment was due under agreement within 45 days (by Feb 15, 2026) but was actually paid on May 10, 2026:</p>
  <ul class="wi-detail-list">
    <li><strong>Expense Disallowed</strong>: Since the ₹15,00,000 was unpaid on March 31 and exceeded the 45-day limit, it is added back to taxable profits.</li>
    <li><strong>Adjusted Taxable Income</strong>: ₹50,00,000 + ₹15,00,000 = <strong>₹65,00,000</strong>.</li>
    <li><strong>Additional Tax Payable</strong> (at 30% plus surcharges/cess, approx 31.2%): ₹15,00,000 &times; 31.2% = <strong>₹4,68,000</strong>. This creates a temporary cash outflow in tax.</li>
    <li><strong>FY 2026-27 Relief</strong>: The company can claim the ₹15,00,000 deduction in FY 2026-27 when filing that year\'s ITR.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Compound Interest</div>
  <h2>Three Times Bank Rate Interest Penalty</h2>
  <p>Under Section 16 of the MSMED Act, 2006, delayed payments to registered MSEs attract compound interest with monthly rests at <strong>three times the bank rate</strong> notified by the RBI. Under Section 23 of the MSMED Act, this interest is strictly non-deductible as a business expense under the Income-tax Act, meaning the buyer bears the full interest cost without tax benefits.</p>
</section>
"""
    return content

def get_msme_faqs():
    return [
        ("Does Section 43B(h) apply to outstanding dues of previous years?", "No. Section 43B(h) was introduced by the Finance Act 2023 and applies to expenses incurred on or after April 1, 2024. Dues from previous financial years are not subject to this disallowance rule."),
        ("Does this rule apply if the supplier is not registered on the Udyam portal?", "No. The disallowance under Section 43B(h) applies only to payments due to micro and small enterprises that are registered under the MSMED Act, 2006 (holding an active Udyam registration). It is highly recommended to obtain written confirmation or Udyam certificates from suppliers annually."),
        ("Does Section 43B(h) apply to Medium Enterprises?", "No. The MSMED Act defines three classes: Micro, Small, and Medium. Section 43B(h) specifically references only Micro and Small enterprises. Dues to Medium Enterprises (turnover between ₹50 crore and ₹250 crore) are not subject to year-end tax disallowance."),
        ("Are traders covered under the Section 43B(h) payment rules?", "No. Retail and wholesale traders registered under Udyam are only eligible for Priority Sector Lending (PSL) benefits. Dues to traders are excluded from the delayed payment provisions of the MSMED Act and are not subject to Section 43B(h) disallowance."),
        ("What happens if a payment is made after the 45-day deadline but before March 31?", "If the payment is delayed beyond the 15 or 45-day limit but is cleared on or before March 31 of the same financial year, the deduction is allowed in that financial year itself. No tax add-back is required, though delayed interest under the MSMED Act remains payable."),
        ("Can we agree to a payment term of 60 or 90 days in writing?", "No. Under Section 15 of the MSMED Act, the maximum credit period that can be agreed upon in writing is 45 days. Any clause in a contract or agreement specifying a credit period exceeding 45 days is invalid, and the deadline is legally capped at 45 days."),
        ("Does the Section 43B(h) disallowance apply to capital expenditure?", "No. Section 43B(h) applies to business expenditures claimed as deductions under the profit and loss account (revenue expenses). Capital expenditures (like purchase of machinery or buildings) are capitalized as assets and are not subject to this disallowance."),
        ("What is the rate of interest payable on delayed MSME payments?", "The buyer is liable to pay compound interest with monthly rests at three times the RBI bank rate on the delayed amount. This interest rate is typically around 20-22% per annum, depending on the prevailing RBI bank rate."),
        ("Is the interest paid on delayed MSME payments tax-deductible?", "No. Section 23 of the MSMED Act, 2006, explicitly prohibits the deduction of interest paid on delayed MSME payments. It cannot be claimed as an expense under the Income-tax Act, 1961."),
        ("How does a business verify if a supplier is a registered Micro or Small enterprise?", "You should request the supplier to provide their Udyam Registration Certificate. The certificate details their classification (Micro, Small, or Medium) and enterprise type (Manufacturing, Service, or Trading). You can also verify the Udyam number online on the government portal."),
        ("Does Section 43B(h) apply to provisions made at the end of the year?", "Yes. If provisions are made for expenses payable to registered MSEs at year-end, the invoice date or receipt date determines the payment deadline. If the payment is not made within the 15/45-day limit, the provision will be disallowed."),
        ("Does Section 43B(h) apply to taxpayers filing under presumptive taxation (Sections 44AD/44ADA)?", "No. Taxpayers filing under presumptive taxation schemes (like Section 44AD for business or 44ADA for professionals) pay tax on a flat percentage of turnover. Since they do not claim actual business expenses, Section 43B(h) disallowance is not applicable to them."),
        ("What if the supplier shifts from Small to Medium category during the year?", "If the supplier shifts to the Medium category, the disallowance under Section 43B(h) will not apply to transactions entered into after their category changes, as Medium Enterprises are exempt from the rule."),
        ("Can an MSE supplier waive their right to receive interest on delayed payments?", "No. The provisions of the MSMED Act are statutory and mandatory. Any waiver or agreement to not pay interest is legally void, and the buyer remains liable for the interest."),
        ("How do auditors report Section 43B(h) compliance in Form 3CD?", "Tax auditors must report details of disallowed MSME payments under Clause 22 of Form 3CD, listing the principal amount unpaid beyond the MSMED Act deadlines and interest due thereon.")
    ]

def get_new_act_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">Tax Law Review</div>
  <h2>The New Income Tax Act: Transition & Rules</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked on 2026-06-24 against the draft Income Tax Act, 2025/2026 and the Income-tax Act, 1961.</span>
  </div>
  <p>The Government of India initiated a comprehensive review of the Income-tax Act, 1961, to draft the New Income Tax Act, 2025/2026. The objective is to make the tax code concise, clear, and easy to read, eliminating obsolete sections and reducing dispute rates.</p>
  
  <h3>Transition Machinery for AY 2026-27</h3>
  <p>During the transition period, taxpayers must navigate a dual framework:</p>
  <ul class="wi-detail-list">
    <li><strong>Procedural Compliance</strong>: All filing, processing, assessments, and appeals for AY 2026-27 are governed by the new procedural sections and the updated e-filing utilities.</li>
    <li><strong>Substantive Rights</strong>: Historical claims, accumulated losses, and pre-existing disputes are mapped from the Income-tax Act, 1961 to the corresponding transition sections of the new Act to ensure continuity.</li>
    <li><strong>Default New Regime</strong>: The New Tax Regime serves as the default framework under the new Act, with the basic exemption limit set at ₹4,0,000 and Section 87A rebate extended up to ₹12,0,000 taxable income.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Section Mapping</div>
  <h2>Key Section Mapping: 1961 Act vs. New Act</h2>
  <div style="overflow-x: auto; margin: 16px 0;">
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-color); background: var(--bg-muted);">
          <th style="padding: 10px; border: 1px solid var(--border-color);">Provision Category</th>
          <th style="padding: 10px; border: 1px solid var(--border-color);">Section under 1961 Act</th>
          <th style="padding: 10px; border: 1px solid var(--border-color);">Status / Section under New Act</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Basic Charge / Exemption</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Section 4 & Section 5</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Streamlined charging sections with simplified residential status rules.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-muted);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Salary Standard Deduction</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Section 16(ia)</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Enhanced standard deduction (₹75,000 under New Regime, ₹50,000 under Old Regime).</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Deemed Dividend</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Section 2(22)(e) & 2(22)(f)</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Consolidated dividend income schedule under Other Sources.</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-muted);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">TDS on Professional Fees</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Section 194J</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Simplified TDS schedule with lower rates for technical services (2%).</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Reassessments</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Section 147 to 153</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Streamlined assessment timelines, reducing reassessment windows to 3-5 years.</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
"""
    return content

def get_new_act_faqs():
    return [
        ("Why is a New Income Tax Act being drafted?", "The goal is to simplify the Income-tax Act, 1961, which has become complex and cluttered over six decades due to hundreds of annual amendments. The new Act aims to improve readability, reduce litigation, and enhance tax compliance."),
        ("What happens to old tax cases and disputes during this transition?", "All pending tax disputes, appeals, and reassessments initiated under the 1961 Act will continue under the transitional provisions of the new Act. The substantive rules of the 1961 Act remain applicable to those historical financial years."),
        ("Will the Old Tax Regime be completely abolished under the new Act?", "The default tax regime is the New Tax Regime. The new Act consolidates exemptions and deductions, but switch options are provided for salaried individuals, while business/professional income taxpayers have restricted switching rights."),
        ("Is the basic exemption limit changing under the new Act?", "Yes, the basic exemption limit under the default New Tax Regime is ₹4,0,000. Under the Old Tax Regime, it remains ₹2,50,000."),
        ("How does the Section 87A rebate change under the new Act?", "Under the New Tax Regime, the Section 87A rebate is available for individuals with taxable income up to ₹12,0,000 (tax rebate up to ₹60,000). For the Old Regime, the rebate limit remains at ₹5,0,000 (tax rebate up to ₹12,500)."),
        ("What are the major changes in capital gains taxation?", "The new Act simplifies holding periods into two categories: 12 months for listed securities/equity units, and 24 months for all other assets (unlisted shares, real estate). LTCG rate is simplified to 12.5% without indexation across asset classes."),
        ("Are the due dates for filing ITR changing?", "No. The standard filing due dates remain the same: July 31 for salaried individuals and non-audit cases, October 31 for tax audit cases, and December 31 for belated/revised returns."),
        ("What is the penalty for late filing under the new Act?", "The late fee under Section 234F remains ₹5,000 if total income exceeds ₹5,0,000, and ₹1,000 if total income is ₹5,0,000 or below."),
        ("Are agricultural income exemption rules changing?", "No. Agricultural income from land situated in India remains exempt from tax under Section 10(1) of the Act. The integration method for computing tax rates on non-agricultural income remains unchanged."),
        ("How are TDS and TCS rules simplified under the new Act?", "The new Act consolidates overlapping TDS sections, reduces rates for contract payments and professional fees, and enforces higher TDS (typically 20%) for non-furnishing of PAN."),
        ("What is the status of the Black Money Act disclosures?", "Disclosures of foreign assets and income in Schedule FA remain mandatory for Resident and Ordinarily Resident (ROR) taxpayers. The penalty for non-disclosure remains ₹10 lakh under the Black Money Act."),
        ("How is the standard deduction for salaried individuals affected?", "The standard deduction is ₹75,000 under the New Tax Regime and ₹50,000 under the Old Tax Regime."),
        ("Are corporate tax rates changing under the new Act?", "Corporate tax rates remain stable, with domestic companies having options for concession rates (like 22% u/s 115BAA) without exemptions, and MAT credit transition rules fully mapped."),
        ("What is the reassessment window under the new Act?", "The time limit for reopening tax assessments is generally reduced to 3 years from the end of the relevant assessment year, extendable up to 5 years only in cases of tax evasion exceeding ₹50 lakh."),
        ("How do taxpayers claim credit for foreign taxes paid under DTAA?", "You must file Form 67 online before filing your ITR, along with a Tax Residency Certificate (TRC) to claim Foreign Tax Credit (FTC) under Section 90/91.")
    ]

def get_eq_levy_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">Digital Taxation</div>
  <h2>The Abolition of Equalization Levy & Significant Economic Presence</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked on 2026-06-24 against CBDT circulars and Finance Act rules.</span>
  </div>
  <p>India introduced the <strong>Equalization Levy</strong> (popularly known as the "Google Tax") in 2016 at 6% on online advertisement services, and expanded it in 2020 by adding a 2% levy on e-commerce supplies made by non-resident operators. To prevent double taxation and align with the OECD Pillar Two global minimum tax consensus, India has abolished the 2% Equalization Levy.</p>
  
  <h3>The Transition to Significant Economic Presence (SEP)</h3>
  <p>With the phasing out of the Equalization Levy, digital business taxation is governed by the **Significant Economic Presence (SEP)** provisions under Section 9(1)(i) of the Income-tax Act, 1961:</p>
  <ul class="wi-detail-list">
    <li><strong>Revenue Threshold</strong>: Any non-resident entity carrying out transactions in respect of goods, services, or property with any person in India exceeding <strong>₹2 crore</strong> in a financial year constitutes an SEP in India.</li>
    <li><strong>User Threshold</strong>: Any non-resident entity systematically and continuously soliciting business activities or engaging in interaction with <strong>3,0,000 or more users</strong> in India also constitutes an SEP.</li>
    <li><strong>Business Connection</strong>: Once an SEP is established, the profits attributable to digital transactions in India are deemed to accrue or arise in India and are taxable as corporate income (subject to DTAA treaty benefits).</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Comparison Table</div>
  <h2>Equalization Levy vs. Significant Economic Presence (SEP)</h2>
  <div style="overflow-x: auto; margin: 16px 0;">
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-color); background: var(--bg-muted);">
          <th style="padding: 10px; border: 1px solid var(--border-color);">Particulars</th>
          <th style="padding: 10px; border: 1px solid var(--border-color);">Equalization Levy (Abolished)</th>
          <th style="padding: 10px; border: 1px solid var(--border-color);">Significant Economic Presence (SEP)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">Tax Rate</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">2% on gross e-commerce sales; 6% on online ads.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Standard corporate tax rates (typically 40% on net profits attributable to India).</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--border-color); background: var(--bg-muted);">
          <td style="padding: 10px; border: 1px solid var(--border-color); font-weight: bold;">DTAA Treaty Relief</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Not covered under DTAA; no foreign tax credit available.</td>
          <td style="padding: 10px; border: 1px solid var(--border-color);">Fully covered under DTAA. Non-residents can claim treaty benefits if they do not have a Permanent Establishment (PE).</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Global Minimum Tax</div>
  <h2>Pillar Two Global Minimum Tax Implementation</h2>
  <p>The abolition of the Equalization Levy is part of India\'s commitment to the G20/OECD inclusive framework on BEPS (Base Erosion and Profit Shifting). Pillar Two introduces a global minimum tax rate of <strong>15%</strong> on Multinational Enterprises (MNEs) with consolidated annual revenues exceeding <strong>€750 million</strong>. If an MNE\'s effective tax rate in India falls below 15% (due to tax incentives), other jurisdictions can collect a top-up tax, and vice versa.</p>
</section>
"""
    return content

def get_eq_levy_faqs():
    return [
        ("What is the Equalization Levy in India?", "The Equalization Levy is a direct tax on digital transactions, introduced in 2016 at 6% on online advertising services. In 2020, a 2% levy was added on e-commerce supplies of goods or services made by non-resident operators."),
        ("When was the 2% Equalization Levy abolished?", "The 2% Equalization Levy was abolished effective August 1, 2024, by the Finance (No. 2) Act, 2024. No levy is charged on e-commerce supplies made on or after this date."),
        ("Why did India scrap the 2% Equalization Levy?", "It was scrapped to prevent double taxation, avoid trade disputes (such as Section 301 investigations by the US Trade Representative), and align with the OECD Pillar Two global tax framework which requires countries to phase out unilateral digital services taxes."),
        ("What is Significant Economic Presence (SEP) under Section 9(1)(i)?", "SEP is a rule that establishes a taxable \'business connection\' in India for non-resident digital entities based on revenue (transactions exceeding ₹2 crore) or users (systematically engaging with 3,0,000 or more Indian users)."),
        ("How does the abolition of Equalization Levy affect non-resident digital companies?", "They are no longer subject to the 2% gross levy on Indian sales. However, if they exceed the SEP thresholds, they must evaluate their taxability under Section 9(1)(i) and determine if profits are attributable to India."),
        ("Can non-resident companies claim DTAA treaty benefits for SEP?", "Yes. Unlike the Equalization Levy, corporate income tax under SEP is covered by Double Taxation Avoidance Agreements (DTAAs). If the non-resident\'s home country has a DTAA with India, they can claim that they do not have a Permanent Establishment (PE) in India, which often exempts their business profits from Indian tax."),
        ("What is the threshold limit for SEP transactions in India?", "The transaction revenue threshold is ₹2 crore (₹20,00,000) in a financial year, representing the aggregate value of transactions in respect of any goods, services, or property."),
        ("What is the user threshold limit for establishing an SEP?", "The user threshold is 3,0,000 (three lakh) active users in India with whom the non-resident systematically and continuously interacts or solicits business."),
        ("What is the Pillar Two global minimum tax?", "Pillar Two is a global agreement to ensure that multinational enterprises (MNEs) with revenues exceeding €750 million pay a minimum effective tax rate of 15% on their profits in every jurisdiction where they operate."),
        ("Does the 6% Equalization Levy on online advertising still apply?", "Yes, the 6% levy on online advertising services received by non-resident entities from Indian businesses remains in force, though it is subject to review as digital tax agreements evolve."),
        ("What compliance was required for the 2% Equalization Levy?", "Non-resident e-commerce operators had to deposit the levy quarterly on the 7th of the month following the quarter (or March 31 for the last quarter) and file an annual statement in Form 1 by June 30."),
        ("What is the penalty for delayed payment of Equalization Levy?", "Delayed payments attract simple interest at 1% per month. Failure to deposit the levy can attract a penalty equal to the unpaid levy amount under Section 171 of the Finance Act, 2016."),
        ("How does a non-resident file returns for SEP in India?", "If a non-resident has an SEP and taxable income in India, they must obtain an Indian PAN, file a corporate income tax return in Form ITR-6, and undergo a tax audit if turnover exceeds the statutory thresholds."),
        ("What is the rate of corporate tax for non-resident companies in India?", "The standard corporate tax rate for foreign companies in India is 40% (plus applicable surcharge and cess, making the effective rate up to 43.68%)."),
        ("How do Indian companies verify if a foreign vendor is subject to SEP?", "Indian companies should obtain a declaration from the foreign vendor stating their tax residency, PAN details, and whether they constitute an SEP or PE in India, which determines TDS applicability under Section 195.")
    ]

def get_unlisted_shares_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">Capital Gains</div>
  <h2>Taxation of Unlisted Shares in India</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked on 2026-06-24 against active provisions of the Income-tax Act, 1961.</span>
  </div>
  <p>Unlisted shares (which include shares of private limited companies, startup equity investments, and foreign company shares like RSUs/ESOPs) are subject to specific capital gains tax rules in India. The Finance (No. 2) Act, 2024, overhauled this framework by lowering tax rates but removing indexation benefits.</p>
  
  <h3>The 24-Month Long-Term Capital Gains (LTCG) Rule</h3>
  <ul class="wi-detail-list">
    <li><strong>Long-Term Capital Gains (LTCG)</strong>: Shares held for <strong>more than 24 months</strong> qualify for LTCG. The tax rate is a flat <strong>12.5% without indexation</strong>.</li>
    <li><strong>Short-Term Capital Gains (STCG)</strong>: Shares held for <strong>24 months or less</strong> are treated as short-term capital assets. The gains are added to your total income and taxed at your individual income tax slab rates.</li>
    <li><strong>No Indexation Benefit</strong>: The option to claim indexation (adjusting the cost for inflation using the Cost Inflation Index) has been abolished for all unlisted shares sold after July 23, 2024.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">The Tax Trap</div>
  <h2>The Section 50CA & Rule 11UA Valuation Trap</h2>
  <p>When selling unlisted shares, you cannot arbitrarily determine the sale price. The law enforces strict valuation rules to prevent underreporting of transactions:</p>
  <ul class="wi-detail-list">
    <li><strong>Section 50CA (Seller\'s Side)</strong>: If unlisted shares are sold at a price lower than the Fair Market Value (FMV) calculated under Rule 11UA, the FMV is deemed to be the full value of consideration for computing the seller\'s capital gains tax.</li>
    <li><strong>Section 56(2)(x) (Buyer\'s Side)</strong>: If a buyer acquires unlisted shares for a consideration below the Rule 11UA FMV, the difference (FMV minus purchase price) is taxed in the hands of the buyer as "Income from Other Sources" if the difference exceeds ₹50,000.</li>
    <li><strong>Rule 11UA Valuation</strong>: The FMV of unlisted shares must be certified by a Registered Valuer or Merchant Banker, based on the Net Asset Value (NAV) method or Discounted Cash Flow (DCF) method, depending on the transaction type.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Worked Example</div>
  <h2>Mathematical Example of the Valuation Trap</h2>
  <p>Suppose you own 1,000 shares of a private startup purchased at ₹100 per share (total cost ₹1,00,000). You sell them to a family member at the face value of ₹100. However, the Rule 11UA FMV of the shares is determined to be ₹500 per share (total value ₹5,00,000):</p>
  
  <h3>Seller\'s Capital Gains (Section 50CA):</h3>
  <ul class="wi-detail-list">
    <li>Actual Sale Proceeds: ₹1,00,000</li>
    <li>Deemed Sale Consideration (FMV): <strong>₹5,00,000</strong></li>
    <li>Acquisition Cost: ₹1,00,000</li>
    <li>Taxable Capital Gain: ₹5,00,000 - ₹1,00,000 = <strong>₹4,00,000</strong> (taxed at 12.5% if held >24 months = ₹50,000, despite you only receiving ₹1,00,000 in cash).</li>
  </ul>
  
  <h3>Buyer\'s Other Income (Section 56(2)(x)):</h3>
  <ul class="wi-detail-list">
    <li>Purchase Price: ₹1,00,000</li>
    <li>FMV of Dues: ₹5,00,000</li>
    <li>Deemed Taxable Gift: ₹5,00,000 - ₹1,00,000 = <strong>₹4,00,000</strong> (taxed at the buyer\'s individual slab rate under Other Sources).</li>
  </ul>
</section>
"""
    return content

def get_unlisted_shares_faqs():
    return [
        ("What are unlisted shares under Indian tax laws?", "Unlisted shares are equity shares of companies that are not listed on a recognized stock exchange in India, including private limited companies, unlisted public companies, and foreign companies (such as shares of US tech giants held via RSUs/ESOPs)."),
        ("What is the holding period for LTCG on unlisted shares?", "The holding period to qualify for Long-Term Capital Gains (LTCG) on unlisted shares is more than 24 months (two years). If held for 24 months or less, the gains are classified as Short-Term Capital Gains (STCG)."),
        ("What is the tax rate on LTCG for unlisted shares?", "LTCG on unlisted shares is taxed at a flat rate of 12.5% (plus surcharge and cess) without indexation, for sales made on or after July 23, 2024."),
        ("What is the tax rate on STCG for unlisted shares?", "STCG on unlisted shares is added to your total income and taxed at your applicable individual income tax slab rates (up to 39% or 35.8% under the New Regime)."),
        ("Was indexation benefit abolished for unlisted shares?", "Yes. The Finance (No. 2) Act, 2024, abolished the indexation benefit for the sale of all unlisted shares. The rate was reduced from 20% with indexation to 12.5% without indexation."),
        ("What is Section 50CA of the Income-tax Act?", "Section 50CA mandates that if unlisted shares are sold at a price below their Fair Market Value (FMV) calculated under Rule 11UA, the FMV is deemed to be the sales consideration for computing capital gains tax in the hands of the seller."),
        ("How does Section 56(2)(x) affect the buyer of unlisted shares?", "If a buyer purchases unlisted shares at a price lower than the Rule 11UA FMV, the difference (FMV minus purchase price) is taxable as income in the hands of the buyer under \'Income from Other Sources,\' if it exceeds ₹50,000."),
        ("What is Rule 11UA valuation and how is it calculated?", "Rule 11UA prescribes the method for valuing unlisted shares. For equity shares, it is generally based on the book value of assets and liabilities (Net Asset Value method) or the Discounted Cash Flow (DCF) method certified by a Merchant Banker or Registered Valuer."),
        ("Does Section 50CA apply to the transfer of shares under a buyback?", "No. Share buybacks are governed by specific sections: Section 46A for capital gains, or Section 2(22)(f) for deemed dividends (under Regime 2). Section 50CA applies to standard transfers/sales between parties."),
        ("Are foreign company shares treated as unlisted shares in India?", "Yes. Since foreign companies (like Google, Apple, Microsoft) are not listed on recognized stock exchanges in India, their shares are classified as unlisted shares for Indian capital gains purposes. The 24-month holding period and 12.5% tax rate apply."),
        ("Can capital losses from unlisted shares be set off against other gains?", "Yes. Short-term capital losses from unlisted shares can offset both STCG and LTCG. Long-term capital losses from unlisted shares can only offset LTCG. You cannot set off capital losses against salary or business income."),
        ("What is the carry-forward period for capital losses on unlisted shares?", "Unabsorbed capital losses can be carried forward for up to 8 assessment years, provided you file your ITR on time (on or before the due date under Section 139(1))."),
        ("Which ITR form should I file if I sold unlisted shares?", "You must file ITR-2 (for individuals with capital gains but no business income) or ITR-3 (if you have business or professional income). You cannot file ITR-1 or ITR-4."),
        ("How do I report unlisted shares holding in ITR?", "If you hold unlisted shares at any time during the financial year, you must disclose the company name, PAN, CIN (for Indian companies), opening balance, shares acquired/sold, and closing balance in the dedicated schedule of ITR-2 or ITR-3."),
        ("Is there an exemption available for investing unlisted shares capital gains?", "Yes. Under Section 54F, you can claim exemption on LTCG from selling unlisted shares by investing the net sale consideration in buying or constructing a residential house property in India within the specified timelines, subject to conditions.")
    ]

def get_ais_tis_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">ITR preparation</div>
  <h2>The Role of AIS and TIS in Income Tax Filing</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked against e-filing portal requirements and CBDT notifications.</span>
  </div>
  <p>The <strong>Annual Information Statement (AIS)</strong> is a comprehensive portal-generated document that shows all financial transactions undertaken by a taxpayer during the financial year. The <strong>Taxpayer Information Summary (TIS)</strong> aggregates these details into category-wise summaries for easy entry in your Income Tax Return (ITR).</p>
  
  <h3>Why You Must Wait for the May 31st Update</h3>
  <ul class="wi-detail-list">
    <li><strong>TDS/TCS Filing Deadline</strong>: Deductors (employers, banks, mutual funds) are legally required to file their Q4 TDS returns by <strong>May 31st</strong>.</li>
    <li><strong>AIS Sync Period</strong>: The Income Tax Department processes these filings and updates your AIS/TIS in the first week of June.</li>
    <li><strong>Risk of Early Filing</strong>: Filing your ITR in April or May before the AIS is fully updated often results in omitting bank interest, dividend payments, or capital gains, triggering automated mismatch notices.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Reconciliation</div>
  <h2>Form 26AS vs. AIS/TIS Reconciliation</h2>
  <p>Reconciling your financial statements is mandatory to ensure complete reporting and avoid tax audits:</p>
  <ul class="wi-detail-list">
    <li><strong>Form 26AS Scope</strong>: Shows only taxes deducted or collected at source (TDS/TCS) and self-assessment/advance tax payments.</li>
    <li><strong>AIS Scope</strong>: Shows all financial transactions, including interest from savings accounts, dividends, sale of mutual funds/shares, foreign remittances, and purchase of property, regardless of whether tax was deducted.</li>
    <li><strong>Feedback Mechanism</strong>: If any transaction in your AIS is incorrect, you must submit online feedback (e.g. "Information relates to other taxpayer" or "Information is duplicate") to update the TIS processed value.</li>
  </ul>
</section>
"""
    return content

def get_ais_tis_faqs():
    return [
        ("What is the difference between Form 26AS and AIS?", "Form 26AS primarily displays details of TDS, TCS, tax payments (advance tax, self-assessment tax), and high-value transactions. AIS (Annual Information Statement) is a comprehensive profile containing all financial transactions like savings interest, dividends, mutual fund purchases/redemptions, stock transactions, and foreign remittances, regardless of whether TDS was deducted."),
        ("Why should I wait for the AIS to be updated before filing my ITR?", "Employers, banks, and financial institutions file their quarterly TDS/TCS returns by May 31st. Consequently, the AIS and Form 26AS are fully updated with all interest, salary, and tax details only in the first week of June. Filing before this update may cause mismatches, leading to automated tax notices under Section 143(1)."),
        ("What is the Taxpayer Information Summary (TIS)?", "TIS is a simplified, one-page summary that aggregates the transaction details shown in the AIS category-wise. It shows the original value and the processed value (after feedback), which you can use directly to pre-fill and verify your ITR."),
        ("How do I download my AIS and TIS?", "Log in to the Income Tax e-filing portal, go to the 'Services' tab, select 'Annual Information Statement (AIS)', click 'Proceed' to redirect to the AIS portal, and download the AIS and TIS in PDF or JSON format."),
        ("What should I do if there is an error in my AIS?", "If a transaction in your AIS is incorrect, duplicated, or belongs to someone else, you can submit online feedback on the AIS portal. Select the transaction, click 'Feedback', and choose the appropriate option (e.g., 'Information is duplicate', 'Information is incorrect', 'Information relates to other taxpayer')."),
        ("How long does it take for AIS to update after submitting feedback?", "Once you submit feedback on the AIS portal, the status is updated immediately. The TIS processed value is also updated in real-time, reflecting the corrected amount for your ITR."),
        ("Will the Income Tax Department accept my corrected figures if I change them in TIS?", "Yes, but the tax department may ask for supporting documents if the mismatch between the reported value and your filed ITR is significant. Submitting feedback on the AIS portal helps justify the difference."),
        ("Why is my dividend income in AIS different from my bank statement?", "Dividend income is reported in the AIS on an accrual basis (based on the record date or payment date declared by the company). Banks or companies may also deduct 10% TDS under Section 194, which is reported separately. Check the exact dividend declarations to reconcile."),
        ("Does savings bank interest appear in the AIS?", "Yes. Under the Statement of Financial Transactions (SFT), banks report savings account interest and fixed deposit interest to the tax department, which is populated in your AIS. This interest must be reported under 'Income from Other Sources' in your ITR."),
        ("What happens if I don't report transactions shown in my AIS?", "If your ITR does not match the income reported in your AIS, the CPC (Central Processing Centre) will issue an automated mismatch notice under Section 143(1)(a), asking you to explain the difference or file a revised return."),
        ("Is the AIS always 100% accurate?", "No. Sometimes entities like banks or brokers report incorrect SFT details or duplicate entries. That is why it is essential to download your AIS, cross-verify it with your bank statements, and submit feedback for corrections where necessary."),
        ("What is SFT in AIS?", "SFT stands for Statement of Financial Transactions. It is a reporting mechanism where specified entities (banks, mutual funds, registrars, sub-registrars) report high-value transactions (cash deposits, property buy/sell, mutual fund transactions) to the tax department."),
        ("Does sale of mutual funds and equity shares appear in AIS?", "Yes. The AIS contains a section called 'Information from SFT' which lists the purchase cost, sale proceeds, and date of transaction for all mutual funds and equity shares sold during the financial year, as reported by depository participants (NSDL/CDSL)."),
        ("Can I file my ITR using only Form 26AS?", "No. While Form 26AS is critical for verifying TDS credits, it does not show non-TDS incomes like savings interest, dividends below TDS thresholds, or capital gains. You must use both Form 26AS and AIS/TIS to ensure complete reporting."),
        ("What if my employer has deducted TDS but it doesn't show in 26AS or AIS?", "This occurs if the employer has not filed their TDS return (Form 24Q) or has deposited the tax under an incorrect PAN. You must contact your employer to rectify the TDS return so the credit reflects in your 26AS and AIS, allowing you to claim it in your ITR.")
    ]

def get_salary_allowances_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">Salary structure</div>
  <h2>Understanding Monthly Salary Slip Components</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked against the Code on Wages and Income Tax rules.</span>
  </div>
  <p>A salary slip is a monthly statement issued by an employer detailing the employee's earnings, deductions, and tax withholdings. Understanding its structure is essential for tax planning and ITR filing.</p>
  
  <h3>Key Salary Earnings & Taxability</h3>
  <ul class="wi-detail-list">
    <li><strong>Basic Salary</strong>: The core component of your compensation, which is 100% taxable. It forms the basis for EPF contributions and gratuity calculations.</li>
    <li><strong>House Rent Allowance (HRA)</strong>: Provided to meet rental expenses. HRA is exempt from tax under Section 10(13A) under the Old Regime, subject to specified limits and rent receipts.</li>
    <li><strong>Allowances</strong>: Includes Special Allowance (fully taxable), LTA (exempt for travel ticket costs u/s 10(5) in the Old Regime), and food coupons.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">Deductions</div>
  <h2>Monthly Statutory and Tax Deductions</h2>
  <p>Deductions on your salary slip fall into statutory compliance and tax categories:</p>
  <ul class="wi-detail-list">
    <li><strong>Employee Provident Fund (EPF)</strong>: Standard deduction of 12% of basic salary + DA, matched by the employer. It qualifies for Section 80C deduction under the Old Regime.</li>
    <li><strong>Professional Tax (PT)</strong>: A state-level tax on employment, capped at ₹2,500 per annum, deductible under Section 16(iii).</li>
    <li><strong>Tax Deducted at Source (TDS)</strong>: Monthly tax withheld by the employer based on your projected annual taxable income and declared regime.</li>
  </ul>
</section>
"""
    return content

def get_salary_allowances_faqs():
    return [
        ("What are the key components of a salary slip in India?", "A salary slip contains earnings (Basic Salary, HRA, Dearness Allowance, Special Allowance, LTA, Bonus) and deductions (EPF, Professional Tax, ESI, TDS). Reconciling these monthly components is essential for accurate ITR filing."),
        ("How is House Rent Allowance (HRA) exemption calculated?", "Under Section 10(13A), HRA exemption is the minimum of: (1) Actual HRA received, (2) Rent paid minus 10% of (Basic + DA), or (3) 50% of (Basic + DA) for metro cities (Delhi, Mumbai, Kolkata, Chennai) or 40% for non-metros. Note: This exemption is only available under the Old Tax Regime."),
        ("Is HRA exemption available under the New Tax Regime?", "No. Under the default New Tax Regime, all major deductions and exemptions—including HRA, LTA, and Section 80C deductions—are abolished. Salaried employees can only claim the standard deduction (₹75,000) and NPS employer contribution u/s 80CCD(2)."),
        ("What is the standard deduction for salaried employees for FY 2025-26?", "For FY 2025-26, the standard deduction is ₹75,000 under the default New Tax Regime, and ₹50,000 under the Old Tax Regime. This deduction is automatically subtracted from your gross salary income in your ITR."),
        ("How does EPF contribution affect my salary slip and taxes?", "The employee contributes 12% of basic salary + DA to the EPF, which is deductible under Section 80C (Old Regime only). The employer matches this 12% contribution (split between EPF and EPS). Under Section 80CCD(2), the employer's share is exempt up to ₹7.5 lakh aggregate (including NPS/superannuation)."),
        ("At what point does EPF interest become taxable?", "If an employee's contribution to the EPF exceeds ₹2.5 lakh in a financial year (or ₹5 lakh if there is no employer contribution, such as GPF), the interest earned on the excess contribution is taxable as 'Income from Other Sources' under Section 10(11)/(12)."),
        ("What is Professional Tax (PT) and how is it deducted?", "Professional Tax is a state-level tax levied on salaried employees, capped at a maximum of ₹2,500 per annum. It is deducted from your gross salary monthly and is fully deductible under Section 16(iii) under the Old Tax Regime."),
        ("What is a perquisite under Section 17(2)?", "Perquisites are non-cash benefits provided by an employer to an employee, such as rent-free accommodation, corporate cars, club memberships, or concessional loans. The valuation of perquisites is added to your taxable salary, and the employer deducts TDS on it."),
        ("How is gratuity calculated and is it tax-free?", "Gratuity is paid after 5 years of continuous service. It is calculated as `(15 * Last Drawn Basic Salary * Years of Service) / 26` for employees covered under the Payment of Gratuity Act. It is tax-free up to a lifetime limit of ₹20 lakh."),
        ("What is Form 12BB and why is it important?", "Form 12BB is a mandatory declaration form submitted by employees to their HR at the end of the financial year. It details all tax-saving investments (80C, 80D, home loan interest, rent receipts) along with physical proofs, allowing the HR to calculate and deduct the correct TDS."),
        ("What happens if I change jobs mid-year and do not submit Form 12B?", "If you change jobs and do not declare your previous salary details to your new employer in Form 12B, both employers will apply basic exemptions and standard deductions. This leads to double-benefit claims and results in a large tax liability plus interest when you file your ITR."),
        ("How is Leave Travel Allowance (LTA) exempt from tax?", "LTA covers travel tickets (air, rail, bus) for yourself and your family within India. It can be claimed tax-free twice in a block of 4 calendar years under Section 10(5) (Old Regime only). The exemption is restricted to the actual travel cost, not hotel or food expenses."),
        ("What is the difference between Form 16 Part A and Part B?", "Part A is generated from the income tax portal and contains quarterly TDS summaries deposited under your PAN. Part B is issued by your employer and contains a detailed calculation of your gross salary, exempted allowances, deductions under Chapter VI-A, and net tax payable."),
        ("Why is my monthly TDS in salary slip different from month to month?", "TDS is calculated by projecting your annual taxable income and dividing the estimated tax by the remaining months in the year. If you declare investments late (e.g. in January) or receive a variable bonus, your projected income changes, causing the monthly TDS to be adjusted."),
        ("Can I claim deductions if my employer has already deducted TDS based on full salary?", "Yes. If you missed submitting investment proofs to your HR on time, you can still claim deductions like Section 80C, 80D, and HRA directly when filing your ITR, and claim a refund for the excess TDS deducted by your employer.")
    ]

def get_crypto_vda_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">VDA taxation</div>
  <h2>Virtual Digital Assets (VDA) & Crypto Tax Rules</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked against Section 115BBH of the Income-tax Act, 1961.</span>
  </div>
  <p>Under Section 115BBH of the Income-tax Act, 1961, income from the transfer of any Virtual Digital Asset (VDA)—which includes cryptocurrencies, tokens, and Non-Fungible Tokens (NFTs)—is taxed at a flat rate of <strong>30%</strong> (plus applicable surcharge and cess). This flat rate applies to all transactions regardless of the taxpayer's total income or standard tax slabs.</p>
  
  <h3>No Business Expense or Depreciation Deductions</h3>
  <p>The taxation framework for digital assets is highly restrictive compared to normal business or capital gains rules:</p>
  <ul class="wi-detail-list">
    <li><strong>No Expense Deductions</strong>: No deduction in respect of any expenditure (other than the cost of acquisition of the VDA) or allowance is permitted under Section 115BBH(2)(a).</li>
    <li><strong>Infrastructure Costs Blocked</strong>: Expenses like electricity, mining rig depreciation, staking platform commission, and exchange trading fees are strictly non-deductible. Only the actual purchase price paid for the asset can be deducted.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">No set-off</div>
  <h2>No Set-Off or Carry-Forward of Crypto Losses</h2>
  <p>Taxpayers cannot optimize their tax liability by netting off losses from cryptocurrency transfers:</p>
  <ul class="wi-detail-list">
    <li><strong>No Intra-Asset Offset</strong>: Loss from one crypto transaction cannot be set off against gains from another (e.g. if you make a gain of ₹1,00,000 on Bitcoin and a loss of ₹1,00,000 on Ethereum, you still pay 30% tax on the ₹1,00,000 gain).</li>
    <li><strong>No Head Offset</strong>: Crypto losses cannot offset salary, business income, or capital gains from shares or property.</li>
    <li><strong>No Carry-Forward</strong>: Unabsorbed VDA losses cannot be carried forward to subsequent financial years to reduce future tax liabilities.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">TDS Rules</div>
  <h2>Section 194S 1% TDS and P2P Compliance Risks</h2>
  <p>To track the movement of virtual assets, a withholding tax mechanism applies to all transfers:</p>
  <ul class="wi-detail-list">
    <li><strong>1% Withholding Tax</strong>: Under Section 194S, TDS at 1% is deducted on payment for transfer of VDAs if the aggregate transaction value exceeds ₹10,000 in a financial year (or ₹50,000 for specified persons).</li>
    <li><strong>P2P Transactions</strong>: For peer-to-peer trades, the buyer is legally responsible for deducting the 1% TDS, filing Form 26QE, and issuing Form 16E to the seller. Failing to do so triggers severe interest and penalty actions.</li>
    <li><strong>Offshore Exchanges</strong>: Indian residents trading on foreign, unregistered exchanges (like Binance or Bybit) are still subject to 1% TDS. Failure to deduct is a direct compliance default under Section 194S.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">ITR Reporting</div>
  <h2>Schedule VDA Disclosures and Foreign Asset Schedules</h2>
  <p>Reporting cryptocurrency in your annual tax filing requires choosing the correct form and schedules:</p>
  <ol class="wi-detail-list">
    <li><strong>ITR-2 or ITR-3 Selection</strong>: Taxpayers with crypto transactions cannot file ITR-1 (Sahaj). You must use ITR-2 (as an investor) or ITR-3 (if trading is treated as business income).</li>
    <li><strong>Schedule VDA</strong>: Every transfer must be reported transaction-by-transaction in Schedule VDA, detailing date of acquisition, date of transfer, cost of acquisition, and sale consideration.</li>
    <li><strong>Schedule FA (Foreign Assets)</strong>: Crypto held on foreign exchanges or in international hardware wallets represents a foreign asset. Resident taxpayers must disclose these in Schedule FA to avoid the flat ₹10 lakh penalty under the Black Money Act.</li>
  </ol>
</section>
"""
    return content

def get_crypto_vda_faqs():
    return [
        ("What is the tax rate on cryptocurrency in India?", "Under Section 115BBH of the Income Tax Act, income from the transfer of Virtual Digital Assets (VDAs), including cryptocurrency and NFTs, is taxed at a flat rate of 30% plus applicable surcharge and a 4% health and education cess."),
        ("Can I deduct mining costs or exchange fees from my crypto tax?", "No. Section 115BBH(2) explicitly prohibits any deduction in respect of any expenditure (other than the cost of acquisition) or allowance. Costs like electricity, mining hardware depreciation, internet bills, transaction/exchange fees, or staking fees are strictly non-deductible."),
        ("Can I set off losses from one cryptocurrency against gains from another?", "No. The Income Tax Act does not allow set-off of loss from the transfer of one VDA (e.g., Ethereum) against income from another VDA (e.g., Bitcoin). Each transaction is calculated independently, and only profitable transactions are taxed."),
        ("Can crypto losses be carried forward to future years?", "No. Unlike capital gains on stocks or property, losses incurred from cryptocurrency transactions cannot be carried forward to subsequent assessment years to offset future profits."),
        ("Who is responsible for deducting the 1% TDS on crypto under Section 194S?", "The buyer is responsible for deducting 1% TDS. For transactions on Indian exchanges (like CoinDCX or WazirX), the exchange automatically deducts it. For Peer-to-Peer (P2P) transfers, the buyer must deduct the TDS and deposit it using Form 26QE."),
        ("What is the threshold limit for TDS u/s 194S?", "The threshold is ₹50,000 in a financial year for 'Specified Persons' (individuals/HUFs not having business income or below tax audit limits). For all other taxpayers, the threshold limit is ₹10,000."),
        ("How are crypto airdrops taxed in India?", "Airdrops are treated as gifts and are taxable under Section 56(2)(x) at individual slab rates on the date of receipt, if the total value of gifts exceeds ₹50,000 in a year. When you later sell or transfer the airdropped tokens, the sale proceeds are taxed at 30% u/s 115BBH."),
        ("How is crypto-to-crypto trading taxed?", "Swapping one cryptocurrency for another (e.g. exchanging Bitcoin for USDT) is a taxable event. The transfer of the first asset is treated as a sale, and tax is calculated at 30% on the gain (FMV of the received asset minus cost of the swapped asset)."),
        ("Which ITR form should I file if I have crypto transactions?", "You must file ITR-2 if you hold crypto as an investor, or ITR-3 if you trade in crypto as a business. You cannot file ITR-1 (Sahaj) or ITR-4 (Sugam) if you have any VDA income or holdings."),
        ("How do I report crypto transactions in my ITR?", "You must report the details of every transfer in 'Schedule VDA' of the ITR. You need to disclose the date of acquisition, date of transfer, head of income (Capital Gains or Business Income), cost of acquisition, and sale consideration."),
        ("Do I need to report crypto held on foreign exchanges in Schedule FA?", "Yes. Resident and Ordinarily Resident (ROR) taxpayers who hold crypto on offshore exchanges (like Binance or Bybit) must disclose them in Schedule FA (Foreign Assets). Failure to report can attract a flat ₹10 lakh penalty under the Black Money Act."),
        ("Is GST applicable on cryptocurrency in India?", "Yes, services provided by cryptocurrency exchanges (trading fees, margins) attract GST at 18%. The GST Council has also discussed classifying crypto assets as goods/services to levy tax on transactions, but direct asset sales are currently subject to income tax."),
        ("What is Form 26QE and when is it filed?", "Form 26QE is a challan-cum-statement filed by the buyer of a VDA to deposit the 1% TDS deducted u/s 194S. It must be filed online on the TIN-NSDL portal within 30 days from the end of the month in which the tax was deducted."),
        ("Can I save crypto tax by claiming basic exemption limits?", "No. The 30% tax on crypto under Section 115BBH is a flat tax rate. It applies from the first rupee of profit, and you cannot claim basic exemption limits (like ₹4,0,000 or ₹2,50,000) or other deductions under Chapter VI-A against this income."),
        ("What are the risks of trading crypto on unregistered offshore exchanges?", "Offshore exchanges that do not comply with FIU (Financial Intelligence Unit) registration in India are blocked, creating high risks of asset freezes. Additionally, transactions on these portals without proper 1% TDS deduction and reporting violate both TDS and Black Money Act rules.")
    ]

def get_gaming_lottery_guide_content():
    content = """
<section class="wi-panel">
  <div class="lp-section-eyebrow">Gaming taxation</div>
  <h2>Tax on Online Gaming and Lottery Winnings</h2>
  <div style="margin-bottom: 12px; font-size: 13px; color: var(--text-muted);">
    <span><strong>Official fact-check status:</strong> Last fact-checked against Section 115BBJ of the Income-tax Act, 1961.</span>
  </div>
  <p>Under Section 115BBJ of the Income-tax Act, 1961, net winnings from online games—including fantasy sports, online card games, poker, rummy, and esports—are taxed at a flat rate of <strong>30%</strong> (plus surcharge and cess). Winnings from offline lotteries, betting, gambling, and game shows are taxed under Section 115BB at the same flat rate.</p>
  
  <h3>Computation on 'Net Winnings'</h3>
  <p>Unlike other income heads where business expenses can be claimed, gaming tax features strict computation rules:</p>
  <ul class="wi-detail-list">
    <li><strong>Net Winnings Formula</strong>: Tax is calculated strictly on net winnings (Total withdrawals minus the sum of total deposits and opening wallet balance) in accordance with Rule 133.</li>
    <li><strong>No Expense Deduction</strong>: No deduction for entry fees, platform commission, internet costs, or loss offsets from other activities is allowed.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">TDS Rules</div>
  <h2>Section 194BA 30% TDS with No Minimum Threshold</h2>
  <p>The TDS framework for online gaming enforces a zero-threshold policy:</p>
  <ul class="wi-detail-list">
    <li><strong>30% TDS on Net Winnings</strong>: Online gaming operators must deduct 30% TDS under Section 194BA on net winnings at the time of withdrawal or at the end of the financial year.</li>
    <li><strong>Zero Threshold</strong>: Unlike Section 194B (traditional lottery TDS which triggers only on payouts above ₹10,000), Section 194BA has no minimum threshold. Any amount of net winnings withdrawn is subject to 30% TDS.</li>
    <li><strong>Form 26AS/AIS Sync</strong>: All TDS deductions appear in the taxpayer's Form 26AS and AIS and must match the winnings declared in the ITR.</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">GST on Gaming</div>
  <h2>28% GST on Full Entry Deposits</h2>
  <p>In addition to income tax on winnings, a separate indirect tax applies at the entry stage:</p>
  <ul class="wi-detail-list">
    <li><strong>GST on Deposits</strong>: Effective from October 1, 2023, online money gaming attracts a flat <strong>28% GST</strong> on the deposit value or entry bet value, rather than on the platform fee.</li>
    <li><strong>Direct Balance Reduction</strong>: When a player deposits ₹100 into a gaming wallet, the 28% GST reduces the actual playable balance in the wallet to ₹78.12 (since ₹21.88 goes towards GST).</li>
  </ul>
</section>

<section class="wi-panel">
  <div class="lp-section-eyebrow">ITR Reporting</div>
  <h2>ITR Form Selection & Non-Offset of Losses</h2>
  <p>Reporting gaming income requires careful selection of schedules and filing forms:</p>
  <ul class="wi-detail-list">
    <li><strong>Schedule OS Special Rates</strong>: Gaming winnings must be disclosed under Schedule OS (Income from Other Sources) as income taxable at special rates under Section 115BBJ or 115BB.</li>
    <li><strong>No Basic Exemption Offset</strong>: You cannot use the basic exemption limit (₹4,0,000 under default New Regime) or Chapter VI-A deductions to reduce gaming tax liability.</li>
    <li><strong>Form Selection</strong>: You must file ITR-2 (or ITR-3 if playing professionally as a business activity). ITR-1 cannot be filed if you have special-rate gaming income.</li>
  </ul>
</section>
"""
    return content

def get_gaming_lottery_faqs():
    return [
        ("What is the tax rate on online gaming winnings in India?", "Under Section 115BBJ, net winnings from online games (including fantasy sports, rummy, poker, and esports) are taxed at a flat rate of 30% plus applicable surcharge and 4% cess."),
        ("How is the tax on online games different from traditional lotteries?", "Online games are taxed under Section 115BBJ on 'net winnings' with 30% TDS u/s 194BA on withdrawals of any value (no threshold). Traditional lotteries, betting, and puzzles are taxed under Section 115BB, with TDS u/s 194B only if winnings exceed ₹10,000."),
        ("How are net winnings calculated for online gaming tax?", "Net winnings are calculated as: Total withdrawals during the FY minus (Total deposits during the FY + Opening balance in the user account) minus any amount on which TDS has already been paid. This matches Rule 133 of the Income Tax Rules."),
        ("Can I deduct my entry fees or internet expenses from gaming income?", "No. The Income Tax Act does not permit any deduction for business expenses, platform fees, internet bills, or allowances against gaming or lottery winnings."),
        ("Can I set off losses from one game against winnings from another?", "No. Losses from online games or betting cannot be set off against winnings from another game, nor can they offset salary, business, capital gains, or other income heads."),
        ("Is there a threshold limit for TDS on online gaming under Section 194BA?", "No. Unlike traditional lotteries (which have a ₹10,000 threshold), Section 194BA requires online gaming platforms to deduct 30% TDS on net winnings of any value, even if the withdrawal is ₹100."),
        ("When is the 30% TDS deducted by the gaming platform?", "TDS is deducted either at the time of withdrawal of net winnings from the wallet, or at the end of the financial year (March 31st) on the net winnings remaining in the wallet."),
        ("What is the GST rate on online gaming in India?", "A flat GST of 28% applies to the full face value of the buy-in/deposit amount for online money gaming. This applies at the entry stage and is paid on deposits, not on the platform fee."),
        ("Which ITR form should I file if I have online gaming winnings?", "You must file ITR-2 if you are an individual with gaming winnings. If you trade/play professionally and maintain books of accounts, you must file ITR-3. ITR-1 (Sahaj) cannot be used."),
        ("How do I report gaming winnings in my ITR?", "You must report the gross winnings in 'Schedule OS' under the section for income taxable at special rates (specifically Section 115BBJ for online games or Section 115BB for lotteries)."),
        ("What happens to my winnings if I don't withdraw them by March 31st?", "Even if you do not withdraw the winnings, the platform will automatically calculate the net winnings on March 31st, deduct the 30% TDS, and report it to the tax department, reflecting in your Form 26AS/AIS."),
        ("Are offline lottery winnings and game shows like KBC taxed similarly?", "Yes. Winnings from offline lotteries, TV game shows (like Kaun Banega Crorepati), horse races, and crossword puzzles are taxed at a flat rate of 30% u/s 115BB. TDS is deducted at 30% u/s 194B/194BB if the prize exceeds ₹10,000."),
        ("Can I claim Section 87A rebate or Chapter VI-A deductions against gaming income?", "No. Flat tax incomes under Section 115BB and 115BBJ do not qualify for tax rebates under Section 87A or tax-saving deductions under Chapter VI-A (80C, 80D, etc.). Tax is calculated at a flat 30% on the entire winnings."),
        ("How is a non-cash prize (like a car or phone) taxed in a lottery or game?", "If the prize is given in kind (or partly in cash and cash is insufficient to cover tax), the platform must ensure that the 30% tax is paid by the winner (or deposited by the platform) before releasing the prize."),
        ("What are the penalties for not declaring gaming winnings in ITR?", "Underreporting gaming income will trigger automated mismatch notices u/s 143(1) as the platform reports TDS in Form 26AS/AIS. You can face demand notices for tax, interest u/s 234A/B/C, and penalties for underreporting up to 200% u/s 270A.")
    ]

def get_subtopic_for_file(filename):
    fn = filename.lower()
    words = set(re.split(r'[^a-zA-Z0-9]+', fn))
    
    # 1. AIS / TIS / 26AS
    if ('ais' in words or 'tis' in words or '26as' in words) or any(k in fn for k in ['taxpayer-information', 'annual-information']):
        return 'ais_tis_26as'
        
    # 2. Salary & Allowances
    salary_words = {'pf', 'epf', 'salary', 'payroll', 'ctc', 'form-16', 'form16', 'pay-slip', 'salary-slip', 'gratuity', 'bonus', 'provident', 'esi', 'professional-tax'}
    if (words & salary_words) or any(k in fn for k in ['form-16', 'pay-slip', 'salary-slip', 'professional-tax']):
        return 'salary_allowances'
        
    # 3. Crypto & VDA
    vda_words = {'crypto', 'vda', 'bitcoin', 'ethereum', '115bbh', '194s', '26qe', 'airdrop', 'coindcx'}
    if (words & vda_words) or any(k in fn for k in ['115bbh', '194s', '26qe']):
        return 'crypto_vda'
        
    # 4. Online Gaming & Lottery
    gaming_words = {'gaming', 'lottery', 'betting', '115bbj', '194ba', 'winnings', 'net-winnings'}
    if (words & gaming_words) or any(k in fn for k in ['115bbj', '194ba']):
        return 'gaming_lottery'
        
    return None

def update_schema_faqs(schema_json, faqs):
    try:
        data = json.loads(schema_json)
        faq_item = None
        for item in data.get('@graph', []):
            if item.get('@type') == 'FAQPage':
                faq_item = item
                break
        
        if faq_item:
            faq_item['mainEntity'] = [
                {
                    "@type": "Question",
                    "name": q,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": a
                    }
                } for q, a in faqs
            ]
        else:
            new_faq = {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": q,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": a
                        }
                    } for q, a in faqs
                ]
            }
            data.setdefault('@graph', []).append(new_faq)
            
        return json.dumps(data, separators=(',', ':'))
    except Exception as e:
        print(f"Error parsing schema JSON: {e}")
        return schema_json


SUB_TEMPLATES = {
    'gst_appeals_notices': {
        'eyebrow': 'GST Dispute',
        'panels': [
            {
                'eyebrow': 'Dispute guide',
                'title': 'What this page helps you decide',
                'items': [
                    'Check if your GST notice was issued under Section 73 (non-fraud/honest mistake) or Section 74 (fraud, suppression, or willful misstatement).',
                    'Verify the time limit to file an appeal before the GST Appellate Authority (Form GST APL-01 must be filed within 3 months of the adjudication order, extendable by 1 month).',
                    'Determine the mandatory pre-deposit requirement (typically 10% of the disputed tax amount must be paid using the electronic cash ledger before filing an appeal).',
                    'Verify if the notice carries a Document Identification Number (DIN) and is signed by the competent jurisdictional authority.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Section 73 notices must be issued at least 3 months before the 3-year limitation period for passing the order expires.',
                    'Section 74 notices must be issued at least 6 months before the 5-year limitation period for passing the order expires.',
                    'No GST appeal can be filed without paying the 10% pre-deposit (capped at ₹25 Crore CGST and ₹25 Crore SGST).',
                    'Recovery proceedings are automatically stayed once the appeal is admitted and the pre-deposit is paid.',
                    'A pre-show cause notice in Form GST DRC-01A must be issued before the formal DRC-01 SCN is served.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Copy of the Show Cause Notice (SCN) and the Adjudication Order (OIO) in Form GST DRC-07.',
                    'Form GST APL-01 generated on the GST portal along with grounds of appeal and statement of facts.',
                    'Challan and Electronic Cash Ledger proof showing payment of the 10% pre-deposit.',
                    'Valid GST portal login credentials and digital signature (DSC) or EVC details.',
                    'Reconciliation statements (e.g. GSTR-2B vs GSTR-3B) or invoice logs disputing the demand.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Failing to respond to DRC-01 within 30 days, which triggers an ex-parte demand order in Form DRC-07.',
                    'Filing an appeal after the 4-month maximum timeline (the Appellate Authority has no statutory power to condone delay beyond 4 months).',
                    "Failing to check the portal's 'View Additional Notices' tab, leading to missing deadlines since email alerts are sometimes delayed.",
                    'Paying the pre-deposit under the wrong head or in the wrong ledger, which invalidates the appeal filing.',
                    'Ignoring vague show-cause notices; you must challenge them on grounds of violation of natural justice.'
                ]
            }
        ],
        'faqs': [
            ("What is a GST Show Cause Notice (SCN) in Form GST DRC-01?", "A Show Cause Notice in Form GST DRC-01 is a formal notice issued by GST authorities under Section 73 or 74 of the CGST Act, demanding tax, interest, and penalty. Taxpayers are given an opportunity to show cause why the demand should not be confirmed."),
            ("What is the timeline to reply to a GST Show Cause Notice?", "A taxpayer must submit a detailed reply to the GST SCN in Form GST DRC-06 within 30 days from the date of service of the notice. Extensions may be requested under valid circumstances."),
            ("What is the difference between Section 73 and Section 74 of the CGST Act?", "Section 73 applies to cases of unpaid or short-paid tax without any fraud, suppression, or willful misstatement (penalty is nil or 10%). Section 74 applies to cases involving fraud, suppression of facts, or willful misstatement (penalty is 100% of the tax due)."),
            ("What is a pre-SCN intimation in Form GST DRC-01A?", "Under Rule 142(1A), the proper officer must communicate any tax, interest, and penalty details in Form GST DRC-01A (pre-SCN intimation) before issuing a formal SCN. This allows the taxpayer to pay dues voluntarily with lower penalties."),
            ("What is the timeline to file a GST appeal against an adjudication order?", "An appeal to the First Appellate Authority in Form GST APL-01 must be filed within 3 months from the date of communication of the adjudication order. The authority can condone a delay of up to 1 additional month only."),
            ("What is the pre-deposit requirement for filing a GST appeal?", "To file an appeal, the taxpayer must pay 100% of the admitted tax liability, and a pre-deposit of 10% of the disputed tax amount (capped at ₹25 Crore CGST and ₹25 Crore SGST). The remaining demand is stayed upon payment."),
            ("Can recovery proceedings be initiated while a GST appeal is pending?", "No. Once a GST appeal is successfully filed in Form APL-01 and the mandatory 10% pre-deposit is paid, the recovery of the remaining disputed tax demand is automatically stayed until the appeal is decided."),
            ("What is Form GST DRC-03 and when is it used?", "Form GST DRC-03 is used to make voluntary or demand-based tax payments through the e-payment portal. It is used to pay tax before the SCN u/s 73/74 (voluntary), or to pay pre-deposits, or to settle confirmed demands."),
            ("What is the role of a Document Identification Number (DIN) in GST notices?", "Every official notice, search warrant, or communication issued by the CBIC must carry a unique, system-generated DIN. Any GST notice issued without a valid DIN is legally invalid and void ab initio."),
            ("What is the penalty for not replying to a GST Show Cause Notice?", "If you fail to reply within 30 days, the proper officer will pass an ex-parte assessment order in Form GST DRC-07 confirming the tax, interest, and maximum penalties based on available department records."),
            ("Can I appeal against a GST refund rejection order?", "Yes. An order rejecting a GST refund claim (Form GST RFD-06) can be appealed before the First Appellate Authority in Form GST APL-01 within 3 months of the order date."),
            ("What is the GST Appellate Tribunal (GSTAT)?", "GSTAT is the second appellate forum constituted under Section 109 of the CGST Act to hear appeals against orders passed by the First Appellate Authority or Joint Commissioner (Appeals)."),
            ("What happens if a GST notice is vague or lacks specific grounds?", "Vague notices that do not clearly specify charges, computations, or allegations violate the principles of natural justice. Taxpayers can challenge such notices in court or in their reply as legally unsustainable."),
            ("Is an email or portal upload considered valid service of a GST notice?", "Yes. Under Section 169 of the CGST Act, uploading a notice on the GST portal or sending it to the registered email address is legally considered valid service. Taxpayers must regularly monitor the portal's 'View Additional Notices' section."),
            ("What is a GST audit notice in Form GST ADT-01?", "A notice in Form GST ADT-01 is issued u/s 65 to intimate the taxpayer that a departmental audit of their books and records will be conducted. The taxpayer must submit all required books and documents within 15 days of receipt.")
        ]
    },
    'tax_reassessment_notices': {
        'eyebrow': 'Notice & Dispute',
        'panels': [
            {
                'eyebrow': 'Notice response',
                'title': 'What this page helps you decide',
                'items': [
                    'Confirm if your notice was issued under Section 148, Section 148A, or Section 143(2) scrutiny.',
                    'Check the reassessment reopening window (limited to 3 years from the end of the relevant assessment year, extendable up to 5 years only for tax evasion > ₹50 lakh).',
                    'Determine if the notice carries a mandatory system-generated DIN (Document Identification Number) to verify its legal validity.',
                    'Review prior ITR filings, bank statements, and AIS/TIS records to identify the source of the alleged escaped income.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'A show-cause notice under Section 148A(b) must be issued before any reopening under Section 148.',
                    'Taxpayers must respond to a Section 148A notice within 15 to 30 days of receipt; ignoring it triggers an immediate reassessment order.',
                    'Under Section 270A, the penalty for underreporting income is 50% of the tax payable, rising to 200% for misreporting.',
                    'An order under Section 148A(d) must be passed by the AO before issuing the actual Section 148 reassessment notice.',
                    'Filing an Updated Return (ITR-U) is barred once a notice for assessment or reassessment has been issued for that year.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Copy of the notice and annexures received from the Income Tax Department.',
                    'Active PAN, Aadhaar, and e-filing portal login credentials.',
                    'Corresponding financial statements, ITR filing acknowledgments (Form V), and computation sheets.',
                    'AIS (Annual Information Statement), TIS, and Form 26AS for the relevant assessment year.',
                    'Detailed bank account ledgers and transaction explanations.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Failing to reply within the specified timeline, which results in an ex-parte Best Judgment Assessment under Section 144.',
                    'Filing a standard response without checking procedural defects (such as prior higher-authority approval requirements).',
                    'Submitting new files or evidence that conflict with prior ITR filings without reconciliation.',
                    'Ignoring notices issued to inoperative PANs or old registered email addresses.',
                    'Treating general explanation guides as formal legal or tax opinions.'
                ]
            }
        ],
        'faqs': [
            ("What is Section 148 of the Income Tax Act?", "Section 148 authorizes the Assessing Officer to issue a notice to assess or reassess income that has escaped assessment. A show-cause notice under Section 148A must first be issued to give the taxpayer an opportunity to reply before reopening."),
            ("What is a Section 148A show-cause notice?", "Under Section 148A, the Assessing Officer must conduct an inquiry, provide an opportunity of being heard to the taxpayer by issuing a show-cause notice (Section 148A(b)), consider the taxpayer's reply, and pass an order (Section 148A(d)) deciding whether it is a fit case to issue a reassessment notice."),
            ("What is the time limit for responding to a Section 148A notice?", "A taxpayer must submit a detailed reply to the show-cause notice within the time limit specified by the Assessing Officer, which is usually not less than 7 days and not more than 30 days from the date of issue."),
            ("What is the new time limit for reopening tax assessments?", "The standard time limit for reopening assessments is 3 years from the end of the relevant assessment year. It can be extended up to 5 years (previously 10 years) only if the Assessing Officer has evidence that income escaping assessment exceeds ₹50 lakh."),
            ("What happens if I ignore an Income Tax notice?", "Ignoring a notice will lead the Assessing Officer to pass an ex-parte order under Section 144 (Best Judgment Assessment) or Section 148A(d) based on available SFT records, which often results in heavy tax demands, interest u/s 234A/B, and penalties."),
            ("What is a DIN in tax notices, and why is it mandatory?", "DIN stands for Document Identification Number. Every official communication from the Income Tax Department must carry a unique, system-generated DIN. Any notice issued without a DIN is legally invalid."),
            ("Can a tax assessment be reopened after the audit has been completed?", "Yes, if the Assessing Officer has 'information' suggesting income has escaped assessment, they can initiate reassessment u/s 147 even after standard scrutiny under Section 143(3) was completed, subject to time limits."),
            ("What are the common grounds for issuing a reassessment notice?", "Common grounds include mismatches between filed ITR and SFT data (like high-value cash deposits, property transactions, share trading, or foreign remittances shown in AIS), undisclosed capital gains, or foreign asset omissions."),
            ("Can I file an Updated Return (ITR-U) after receiving a Section 148 notice?", "No. Once a notice for assessment, reassessment, or search/seizure is issued for a financial year, you are barred from filing an Updated Return (ITR-U) under Section 139(8A) for that year."),
            ("What is a Section 143(1) intimation notice?", "An intimation u/s 143(1) is an automated processing letter showing whether your filed ITR calculations match the tax department's database. It is not a reassessment notice, but can contain tax demands or refund adjustments."),
            ("What is a Section 143(2) notice?", "A notice u/s 143(2) is issued to select an ITR for detailed scrutiny. It requires the taxpayer to submit supporting evidence for claims, deductions, and income heads before an assessment order u/s 143(3) is passed."),
            ("What is Section 154 rectification?", "Section 154 allows rectifying apparent mistakes in orders or intimations (like incorrect TDS credit, mathematical errors). It cannot be used to introduce new deduction claims or dispute legal interpretations."),
            ("How do I check notice status on the e-filing portal?", "Log in to the income tax portal, go to 'Pending Actions' > 'e-Proceedings', where all active notices, show-cause letters, and response forms are listed."),
            ("Can I challenge a Section 148 reassessment notice in court?", "Yes. If the procedural requirements (like not issuing a 148A notice, not providing sufficient time, or not obtaining prior higher authority approval) are violated, the taxpayer can file a writ petition in the High Court."),
            ("What is the penalty for underreporting or misreporting income?", "Under Section 270A, the penalty for underreporting income is 50% of the tax payable, which rises to 200% of the tax payable if the underreporting is due to misreporting (undisclosed sources, fake invoices, etc.).")
        ]
    },
    'capital_gains_exemptions': {
        'eyebrow': 'Capital Gains',
        'panels': [
            {
                'eyebrow': 'Tax planning',
                'title': 'What this page helps you decide',
                'items': [
                    'Determine the holding period of your asset to qualify for Long-Term Capital Gains (LTCG) vs Short-Term Capital Gains (STCG).',
                    'Identify if you qualify for exemptions on property sales by reinvesting in residential property (Section 54/54F) or capital gains bonds (Section 54EC).',
                    'Calculate the tax liability under the new flat rates (e.g. 12.5% LTCG without indexation) for sales made on or after July 23, 2024.',
                    'Understand how to declare and offset capital losses against other capital gains during ITR filing.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'LTCG on listed equity/equity mutual funds is taxed at 12.5% on gains exceeding ₹1.25 lakh per financial year.',
                    'LTCG on unlisted shares, gold, and real estate is taxed at 12.5% without indexation (indexation benefits were abolished by the Finance Act 2024).',
                    'Section 54EC capital gains bonds must be purchased within 6 months of the transfer date, up to a maximum cap of ₹50 lakh.',
                    'Holding periods: listed equity/units qualify as long-term after 12 months; unlisted shares, property, and gold qualify after 24 months.',
                    'Debt mutual funds purchased after April 1, 2023 are taxed at slab rates regardless of holding period (no LTCG benefit).'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Purchase and sale deeds (for property) or broker contract notes (for shares/gold).',
                    'Receipts for improvements or registry costs incurred to calculate the cost of acquisition.',
                    'Proof of investment in Section 54EC bonds (REC/NHAI/PFC/IRCON) or capital gains account scheme (CGAS) deposit slips.',
                    'Form 26AS, AIS, and TIS downloaded from the e-filing portal.',
                    'Bank statements showing transaction payments and receipts.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Missing the 6-month deadline to invest in Section 54EC bonds, making the entire capital gain taxable.',
                    'Claiming LTCG exemption under Section 54F when owning more than one residential house on the date of transfer.',
                    'Attempting to set off capital losses (LTCL/STCL) against salary, business, or other heads of income.',
                    'Failing to deposit unutilized gains in a Capital Gains Account Scheme (CGAS) before the ITR filing due date.',
                    'Using the old 20% with indexation rate for transactions concluded after July 23, 2024.'
                ]
            }
        ],
        'faqs': [
            ("What is the difference between Long-Term and Short-Term Capital Gains?", "LTCG applies to assets held beyond the specified holding period (12 months for listed equity, 24 months for property, unlisted shares, and gold). STCG applies to assets held for shorter periods. LTCG is taxed at lower/concessional rates, while STCG is often taxed at slab rates or a flat 20% (for shares)."),
            ("What is the tax rate on LTCG under the current rules?", "Under the current Finance Act rules, LTCG on listed equity, unlisted shares, property, and gold is taxed at a flat rate of 12.5% (plus surcharge and cess). Indexation benefits have been abolished for all assets sold on or after July 23, 2024."),
            ("What are Section 54EC capital gains bonds?", "Section 54EC allows taxpayers to claim tax exemption on LTCG from selling land or buildings by investing the gains in bonds issued by NHAI, REC, PFC, or IRCON. The investment must be made within 6 months of the sale date."),
            ("What is the investment limit for Section 54EC bonds?", "The maximum amount you can invest in Section 54EC capital gains bonds is ₹50 lakh per financial year. These bonds have a mandatory lock-in period of 5 years."),
            ("How does Section 54 residential property exemption work?", "Section 54 allows an individual or HUF to claim exemption on LTCG from selling a residential house by purchasing another residential house within 1 year before or 2 years after, or constructing a house within 3 years from the sale date."),
            ("What is the Section 54F capital gains exemption?", "Section 54F allows tax exemption on LTCG from selling any asset other than a residential house (like land, gold, or shares) by investing the net sale consideration in buying or constructing a residential house within the specified timelines."),
            ("Can I deposit capital gains in a bank account to save tax?", "Yes. If you cannot purchase or construct a house before the ITR filing deadline, you must deposit the unutilized capital gains in a Capital Gains Account Scheme (CGAS) with an authorized bank to claim Section 54/54F exemptions."),
            ("What is the tax rate on STCG for listed equity shares?", "Under Section 111A, Short-Term Capital Gains (STCG) on listed equity shares and equity mutual funds sold through a recognized stock exchange (with STT paid) is taxed at a flat rate of 20%."),
            ("How is the sale of debt mutual funds taxed?", "Capital gains on debt mutual funds (with equity exposure <= 35%) purchased on or after April 1, 2023, are treated as short-term capital gains and taxed at your individual income tax slab rates, regardless of the holding period."),
            ("Can capital losses be set off against other incomes?", "No. Capital losses can only be set off against capital gains. Short-Term Capital Losses (STCL) can offset both STCG and LTCG. Long-Term Capital Losses (LTCL) can only offset LTCG. They cannot offset salary or business income."),
            ("For how many years can capital losses be carried forward?", "Unabsorbed capital losses (both short-term and long-term) can be carried forward for up to 8 assessment years, provided the ITR for the year the loss arose was filed on or before the original due date under Section 139(1)."),
            ("Is there a tax on selling agricultural land in India?", "Capital gains on rural agricultural land are exempt because it is not considered a capital asset under Section 2(14). Gains on urban agricultural land are taxable, but exemption can be claimed u/s 10(37) on compulsory acquisition or u/s 54B on reinvestment."),
            ("How is the sale of gold taxed?", "LTCG on gold (held for more than 24 months) is taxed at 12.5% without indexation. STCG (held for 24 months or less) is added to your total income and taxed at your applicable individual slab rates."),
            ("Which ITR form should I file if I have capital gains?", "You must file ITR-2 (for individuals/HUFs without business income) or ITR-3 (if you have business or professional income). Salaried individuals with capital gains cannot file ITR-1."),
            ("What is Section 50C and how does it affect property sales?", "Section 50C mandates that if the sale consideration of a property is less than the stamp duty value (circle rate) set by the state government, the stamp duty value is deemed to be the full value of consideration for computing capital gains tax, unless the difference is <= 10%.")
        ]
    },
    'ngo_trust_compliance': {
        'eyebrow': 'NGO & Trust',
        'panels': [
            {
                'eyebrow': 'Registration',
                'title': 'What this page helps you decide',
                'items': [
                    'Determine if your NGO requires registration under Section 12AB (for income tax exemption) or Section 80G (for donor tax deduction).',
                    'Check the validity and renewal deadlines for provisional registrations (valid for 3 years) vs regular registrations (valid for 5 years).',
                    'Assess if the NGO qualifies to receive foreign donations under the Foreign Contribution Regulation Act (FCRA).',
                    'Confirm the annual compliance checklist (filing Form 10BD, audit reports in Form 10B/10BB, and ITR-7).'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'NGOs must apply for renewal of 12AB and 80G registrations at least 6 months before their 5-year validity expires.',
                    'To claim tax exemption under Section 11, the trust must apply at least 85% of its income to charitable/religious purposes in India.',
                    'Form 10BD (statement of donations) must be filed online on or before May 31st of the following financial year.',
                    'Anonymous donations exceeding ₹1 lakh or 5% of total donations (whichever is higher) are taxed at 30% under Section 115BBC.',
                    'Donations made to other trusts towards their corpus funds do not qualify as application of income under recent amendments.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Trust Deed, Society Registration Certificate, or Section 8 Company Certificate of Incorporation.',
                    'PAN and Aadhaar cards of the trustees, directors, or governing body members.',
                    'Form 10A/10AB registration orders issued by the Income Tax Department.',
                    'Books of accounts, donation receipts, and bank account statements.',
                    'Donor details (PAN, name, address, donation amount) for Form 10BD filing.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Failing to file Form 10BD by May 31st, which attracts a late fee of ₹200 per day u/s 234G and prevents donors from claiming 80G deductions.',
                    'Delaying the submission of the audit report (Form 10B/10BB) beyond September 30th, resulting in the loss of tax exemptions for that year.',
                    'Receiving foreign contributions in a non-designated bank account, violating FCRA guidelines.',
                    'Failing to file Form 10 online to accumulate unapplied income (up to 15%) before the ITR filing due date.',
                    'Filing a standard ITR-5 instead of ITR-7, leading to defective return notices.'
                ]
            }
        ],
        'faqs': [
            ("What is Section 12A/12AB registration for NGOs?", "Section 12AB (which replaced Section 12A) is the registration under the Income Tax Act that grants income tax exemption to charitable trusts, societies, and Section 8 companies. Once registered, the NGO's income is exempt from tax, subject to compliance conditions."),
            ("What is Section 80G registration?", "Section 80G registration allows donors to claim an income tax deduction on donations made to the NGO. Donors can claim either 50% or 100% of the donation amount as a deduction from their gross total income, subject to qualifying limits."),
            ("What is the validity period of Section 12AB and 80G registrations?", "Both Section 12AB and 80G registrations are granted for a block of 5 years. NGOs must apply for renewal of registrations at least 6 months before the expiry of the 5-year period. Provisional registrations are granted for 3 years."),
            ("What is Form 10BD, and when is it filed?", "Form 10BD is the annual statement of donations that registered NGOs must file on the e-filing portal. It lists details of all donors (PAN, name, donation amount) and must be filed on or before May 31 of the following financial year."),
            ("What is a Section 8 Company?", "A Section 8 Company is a non-profit organization incorporated under the Companies Act, 2013, to promote art, science, sports, education, charity, or environment. Its profits must be applied solely to its objectives, and no dividends can be paid to members."),
            ("What is FCRA registration, and who needs it?", "FCRA (Foreign Contribution Regulation Act) registration is mandatory for any NGO that intends to receive foreign donations or contributions. It is regulated by the Ministry of Home Affairs (MHA) and is valid for 5 years."),
            ("What are the conditions for tax exemption under Section 11 & 12?", "To claim exemption, the NGO must apply at least 85% of its income toward charitable or religious purposes in India during the financial year. If it cannot apply 85%, it can accumulate the income for up to 5 years by filing Form 10 online."),
            ("What is the CSR spend obligation under the Companies Act?", "Under Section 135 of the Companies Act, 2013, companies with a net worth of ₹500 crore or more, turnover of ₹1,000 crore or more, or a net profit of ₹5 crore or more must spend at least 2% of their average net profits of the preceding 3 years on Corporate Social Responsibility (CSR)."),
            ("Can an NGO carry out commercial or business activities?", "Yes, under the proviso to Section 2(15), an NGO can carry out activities in the nature of trade or business, provided the activities are incidental to the main objectives, and the aggregate receipts from such business do not exceed 20% of the total receipts of the NGO in that FY."),
            ("What is the due date for filing ITR for trusts and NGOs?", "Trusts and NGOs registered under Section 12AB must file their ITR in Form ITR-7 by October 31 of the Assessment Year. If audit is required, the audit report in Form 10B/10BB must be submitted by September 30."),
            ("What is the difference between Form 10B and Form 10BB audit reports?", "Form 10B is the audit report required if the trust's total income exceeds ₹5 crore, or if it receives foreign contributions, or if it applies income outside India. Form 10BB is used by other trusts that do not meet these conditions."),
            ("What is the tax rate on anonymous donations received by a trust?", "Under Section 115BBC, anonymous donations received by a religious or charitable trust are taxed at a flat rate of 30% on amounts exceeding ₹1 lakh or 5% of total donations received, whichever is higher."),
            ("Can an NGO make donations to another NGO?", "Yes, an NGO can donate to another registered NGO out of its current year's income. However, such donations cannot be made out of accumulated funds, and donations towards corpus funds of another trust are not allowed as application of income."),
            ("What is NGO Darpan registration?", "NGO Darpan is a portal maintained by NITI Aayog. It provides a unique ID to NGOs, which is mandatory to apply for government grants, schemes, and to file for FCRA registrations."),
            ("What happens if an NGO fails to file its ITR on time?", "If the ITR-7 is not filed before the due date, the NGO loses its tax exemption under Section 11 & 12 for that financial year, and its entire income will be taxed at maximum marginal rates. Late filing fees and interest also apply.")
        ]
    },
    'aar_aaar_rulings': {
        'eyebrow': 'GST Rulings',
        'panels': [
            {
                'eyebrow': 'GST Appeals',
                'title': 'What this page helps you decide',
                'items': [
                    'Determine if you should apply for an Advance Ruling (AAR) to clarify GST rates, classification, or registration requirements.',
                    'Understand the appeal process before the Appellate Authority for Advance Ruling (AAAR) if you disagree with an AAR ruling.',
                    'Check the time limits to file an appeal before the AAAR (typically 30 days from the communication of the AAR order).',
                    'Verify the binding nature of the AAR and AAAR rulings on the applicant and their jurisdictional GST officers.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Advance rulings can only be sought on proposed or ongoing transactions, not on matters already decided in ongoing litigation.',
                    'An appeal to the AAAR must be filed in Form GST ARA-02 along with a filing fee of ₹10,000 (₹5,000 CGST + ₹5,000 SGST).',
                    'The AAAR must pass its order within a period of 90 days from the date of filing of the appeal.',
                    'If members of the AAAR differ on any point, it is deemed that no advance ruling can be issued on that question.',
                    'Rulings are binding only on the applicant and the concerned officer, but serve as strong persuasive value in other cases.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Copy of the AAR order being appealed (for AAAR applications).',
                    'Detailed statement of facts, legal interpretation, and questions on which ruling is sought.',
                    'GST registration details, HSN/SAC classifications, and sample contracts/invoices.',
                    'Challan showing payment of the prescribed filing fee on the GST portal.',
                    'Authorisation letters or board resolutions for representing the case.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Filing an appeal after the 30-day limit without a condonation of delay application (AAAR can condone delay up to 30 additional days only).',
                    'Assuming an AAR ruling applies nationally; rulings are legally binding only on the specific applicant within that state.',
                    'Filing for advance ruling on issues already pending under scrutiny or audit, leading to immediate rejection u/s 98(2).',
                    'Relying on state-level AAR decisions without checking if they were reversed or modified by the AAAR.',
                    'Failing to verify if the AAAR order has been appealed via writ petition in the High Court.'
                ]
            }
        ],
        'faqs': [
            ("What is the Authority for Advance Ruling (AAR) under GST?", "The AAR is a body constituted under GST laws to provide tax certainty. It issues decisions (rulings) on questions raised by taxpayers regarding GST registration, classification of goods/services, tax rates, and eligibility for Input Tax Credit."),
            ("What is the Appellate Authority for Advance Ruling (AAAR)?", "The AAAR is the appellate body constituted in each state to hear appeals filed by taxpayers or GST department officers against rulings passed by the AAR."),
            ("Who can file an appeal before the AAAR?", "An appeal can be filed by the applicant (taxpayer) who is aggrieved by the AAR ruling, or by the jurisdictional GST officer/concerned officer of the GST department who disagrees with the AAR's decision."),
            ("What is the timeline to file an appeal before the AAAR?", "An appeal to the AAAR must be filed within 30 days from the date on which the AAR ruling is communicated to the taxpayer or the tax officer. The AAAR can condone a delay of up to an additional 30 days if sufficient cause is shown."),
            ("What is the filing fee for an appeal to the AAAR?", "The official filing fee for a taxpayer to appeal before the AAAR is ₹10,000 (consisting of ₹5,000 CGST and ₹5,000 SGST/UTGST), paid online through the GST portal. No fee is payable if the department files the appeal."),
            ("Is an AAAR ruling binding on all taxpayers in India?", "No. A ruling passed by the AAR or AAAR is binding only on the specific applicant who sought it and the jurisdictional tax officers in respect of that applicant. It is not legally binding on other taxpayers, though it has persuasive value."),
            ("What happens if the members of the AAAR have differing opinions?", "Under Section 101(3) of the CGST Act, if the members of the AAAR differ on any point referred to in the appeal, it is deemed that no advance ruling can be issued in respect of the questions raised under the appeal."),
            ("Can an AAAR ruling be appealed further in a court of law?", "GST laws do not provide for a direct appeal against an AAAR order to the Appellate Tribunal or High Court. However, aggrieved parties can file a Writ Petition in the High Court under Article 226/227 of the Constitution to challenge the order on grounds of natural justice or legal error."),
            ("On what questions can an Advance Ruling be sought?", "Rulings can be sought on: classification of goods/services, applicability of notifications, determination of time and value of supply, admissibility of ITC, determination of liability to pay tax, and requirement of GST registration."),
            ("Can I seek an Advance Ruling on an issue already pending in my GST audit?", "No. The proviso to Section 98(2) mandates that the AAR shall not admit an application where the question raised is already pending or decided in any proceedings (like audit, scrutiny, notice, or appeal) under any provisions of the GST Act."),
            ("What is the timeline for the AAAR to pass its order?", "The AAAR is required by law to pass its appellate order within 90 days from the date of filing of the appeal under Section 101(1) of the CGST Act."),
            ("Can an Advance Ruling be declared void?", "Yes. Under Section 104, if the AAR or AAAR finds that the ruling was obtained by the applicant by fraud, misrepresentation, or suppression of material facts, they can declare the ruling void ab initio, and GST provisions will apply retrospectively."),
            ("What is the difference between an AAR ruling and a GST circular?", "An AAR/AAAR ruling is case-specific and binding only on the applicant and their concerned officers. A GST circular is an administrative instruction issued by the CBIC that clarifies law provisions and is binding on the entire GST department across India."),
            ("What form is used to file an appeal before the AAAR?", "A taxpayer must file the appeal in Form GST ARA-02 on the GST portal, along with a detailed statement of facts, grounds of appeal, and the prescribed fee challan."),
            ("Does an advance ruling apply to transactions retrospectively?", "No. Advance rulings are prospective in nature and help taxpayers determine their tax liabilities and compliance paths for current or proposed future transactions.")
        ]
    },
    'lrs_tcs_remittance': {
        'eyebrow': 'LRS & TCS',
        'panels': [
            {
                'eyebrow': 'Remittance limits',
                'title': 'What this page helps you decide',
                'items': [
                    'Check the annual remittance limits under the Reserve Bank of India\'s Liberalised Remittance Scheme (LRS).',
                    'Verify the applicable Tax Collected at Source (TCS) rates (0.5%, 5%, or 20%) based on the purpose of your foreign remittance.',
                    'Confirm the threshold limit of ₹7 lakh per financial year below which TCS is nil for specific transaction categories.',
                    'Understand how to claim a refund or credit for TCS deducted in your annual Income Tax Return (ITR).'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Under LRS, resident individuals can remit up to USD 250,0,00 per financial year for permitted current/capital transactions.',
                    'TCS on overseas tour packages is 5% up to ₹7 lakh, and 20% on amounts exceeding ₹7 lakh per annum.',
                    'TCS on other remittances (investments, gifts) is NIL up to ₹7 lakh, and 20% on amounts exceeding ₹7 lakh.',
                    'TCS on remittances for education funded by an education loan is 0.5% for amounts exceeding ₹7 lakh.',
                    'E-commerce operators must deduct TDS/TCS u/s 194O or Section 206C(1H) based on turnover and PAN status.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Valid PAN, Aadhaar card, and Indian passport of the remitter.',
                    'Form A2 (LRS declaration form) completed and signed for the bank.',
                    'For education: admission letter and fee estimate from the foreign university.',
                    'For medical: estimated expenses letter from the overseas hospital.',
                    'TCS certificate (Form 27D) issued by the bank/authorized dealer.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Failing to track aggregate remittances across all bank accounts, leading to unauthorized breaches of the USD 250,000 limit.',
                    'Assuming the ₹7 lakh TCS exemption applies separately per bank account; the limit is PAN-level across all accounts.',
                    'Remitting money for prohibited transactions under FEMA (such as trading in forex abroad or purchasing lottery tickets).',
                    'Neglecting to check Form 26AS/AIS to verify TCS credits, resulting in loss of tax refunds during ITR filing.',
                    'Making remittances with an inoperative PAN, which triggers TCS at double the standard rates.'
                ]
            }
        ],
        'faqs': [
            ("What is the Liberalised Remittance Scheme (LRS)?", "LRS is a scheme by the Reserve Bank of India (RBI) that allows resident individuals to freely remit up to USD 250,000 per financial year for permitted current or capital account transactions (like travel, education, medical, gifts, or investments)."),
            ("What is Tax Collected at Source (TCS) on foreign remittances?", "TCS is an income tax withholding mechanism where authorized dealer banks collect tax from the remitter at the time of executing a foreign remittance under the LRS, which is then credited to the taxpayer's PAN."),
            ("What is the TCS rate on foreign education remittances?", "TCS on education remittances is NIL up to ₹7 lakh per FY. On amounts exceeding ₹7 lakh, the rate is: (1) 0.5% if the remittance is funded by an education loan from a financial institution. (2) 5% if funded by self/other sources."),
            ("What is the TCS rate on overseas tour packages?", "For overseas tour packages, TCS is collected by the tour operator at: (1) 5% on package costs up to ₹7 lakh per financial year. (2) 20% on the portion exceeding ₹7 lakh per financial year."),
            ("What is the TCS rate on other remittances (investments/gifts) under LRS?", "For other remittances like foreign stock investments, bank transfers, or gifts, TCS is NIL up to ₹7 lakh per financial year, and a flat 20% on any amount exceeding the ₹7 lakh threshold."),
            ("Is the ₹7 lakh TCS threshold limit calculated per bank account?", "No. The ₹7 lakh threshold limit is a PAN-level limit calculated across all bank accounts and authorized dealers in a financial year, tracked via the RBI's LRS portal."),
            ("How do I claim a refund for the TCS collected by the bank?", "TCS is not an additional tax; it is a tax credit. The collected TCS reflects in your Form 26AS/AIS. You can claim it against your final tax liability when filing your ITR, or claim a refund if your total tax liability is NIL."),
            ("Can a partnership firm or company remit money under LRS?", "No. The LRS facility is strictly restricted to resident individuals (including minors). Partnership firms, HUFs, LLPs, trusts, and corporate entities are not eligible to remit funds under LRS."),
            ("What are the prohibited transactions under LRS?", "Remittances are prohibited for: margin calls to foreign exchanges, trading in foreign exchange, purchasing lottery tickets, sweepstakes, banned magazines, or making remittances to entities violating FEMA regulations."),
            ("What is Form A2 and why is it required?", "Form A2 is a application-cum-declaration form prescribed by the RBI that must be completed and submitted to the bank for any foreign exchange purchase or outward remittance under LRS."),
            ("Does TCS apply to international credit card transactions?", "International credit card transactions executed while traveling abroad are currently excluded from the LRS limits and do not attract TCS. However, transactions on debit cards or forex cards are counted under LRS and attract TCS."),
            ("What is the TCS rate on e-commerce transactions under Section 206C(1H)?", "Under Section 206C(1H), sellers whose turnover exceeds ₹10 crore must collect TCS at 0.1% on receipts exceeding ₹50 lakh from a buyer in a FY. It is separate from the LRS outward remittance TCS."),
            ("What happens if I remit money without a PAN?", "Outward remittances under LRS are not permitted by banks without a valid PAN. If PAN is inoperative, the bank will refuse the remittance or apply TCS at double the standard rate (minimum 20%)."),
            ("What is Form 27D and when is it issued?", "Form 27D is the official TCS certificate issued by the collecting bank/authorized dealer to the remitter within 15 days from the due date of filing the quarterly TCS return, certifying the tax amount collected."),
            ("Does LRS apply to Non-Resident Indians (NRIs)?", "No. LRS is strictly for resident individuals. NRIs remit funds out of India under different guidelines, such as the USD 1 million scheme for NRO accounts, subject to submitting Form 15CA/15CB.")
        ]
    },
    'dtaa_nri_compliance': {
        'eyebrow': 'NRI & DTAA',
        'panels': [
            {
                'eyebrow': 'DTAA relief',
                'title': 'What this page helps you decide',
                'items': [
                    'Verify your residential status under the Income Tax Act to determine taxability of global vs Indian income.',
                    'Identify if you can claim lower withholding tax rates on interest, dividends, or royalties under Double Taxation Avoidance Agreements (DTAA).',
                    'Confirm the documents needed to claim DTAA benefits (Tax Residency Certificate, Form 10F, and Indian PAN).',
                    'Assess your compliance requirements for disclosing foreign assets in Schedule FA of the ITR (applicable to resident Indians).'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'An individual is a resident in India if they stay for 182 days or more in the FY, or 60 days + 365 days in the preceding 4 years.',
                    'Interest on NRE (Non-Resident External) bank accounts is fully tax-exempt in India under Section 10(4)(ii).',
                    'Interest on NRO (Non-Resident Ordinary) bank accounts is taxable, and subject to 30% TDS unless DTAA relief is claimed.',
                    'To claim DTAA benefits, taxpayers must submit a Tax Residency Certificate (TRC) issued by the foreign country\'s tax authority.',
                    'Failure to declare foreign assets (like US stock/RSUs) in Schedule FA by residents attracts a ₹10 lakh Black Money Act penalty.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Passport pages showing stamps to calculate physical stay in India.',
                    'Tax Residency Certificate (TRC) issued by the tax department of the country of residence.',
                    'Completed Form 10F submitted online on the e-filing portal.',
                    'FCNB, NRE, and NRO bank account interest certificates.',
                    'Form 67 (for claiming Foreign Tax Credit) along with proof of tax paid abroad.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Failing to submit Form 10F online; manual forms are no longer accepted on the e-filing portal, which leads to immediate TDS at 30%.',
                    'Salaried residents omitting US stock grants (RSUs/ESOPs) in Schedule FA, assuming they are covered by employer Form 16.',
                    'NRIs attempting to claim the Section 87A rebate, which is strictly restricted to resident individuals.',
                    'Operating standard savings accounts in India after obtaining NRI status, violating FEMA guidelines (must convert to NRO).',
                    'Filing ITR-1 (Sahaj) as an NRI or resident holding foreign assets, which makes the return defective.'
                ]
            }
        ],
        'faqs': [
            ("Who is considered a Non-Resident Indian (NRI) for tax purposes?", "You are classified as an NRI for tax purposes if you do not meet the residency criteria: (1) Stay in India for 182 days or more in the FY, or (2) Stay in India for 60 days or more in the FY plus 365 days or more in the preceding 4 years."),
            ("Is an NRI's global income taxable in India?", "No. NRIs are only taxed on income that is earned, accrued, or received in India (like Indian salary, property rent, capital gains on Indian assets, or NRO interest). Global income earned outside India is not taxable in India."),
            ("What is the Double Taxation Avoidance Agreement (DTAA)?", "DTAA is a bilateral treaty signed between India and a foreign country to prevent double taxation of the same income in both countries by capping withholding tax rates or providing tax credits."),
            ("What documents are mandatory to claim DTAA treaty benefits?", "Taxpayers must submit: (1) A Tax Residency Certificate (TRC) issued by the tax authority of their country of residence. (2) Form 10F filled out online. (3) A valid Indian PAN."),
            ("Is interest earned on NRE and NRO accounts taxable?", "Interest earned on NRE (Non-Resident External) and FCNB accounts is fully tax-free in India. Interest earned on NRO (Non-Resident Ordinary) accounts is taxable at your slab rate, and subject to 30% TDS."),
            ("How does Form 10F work, and how is it filed?", "Form 10F is a self-declaration filed by non-residents containing details like nationality, tax identification number, and address. It must be filed online on the Income Tax e-filing portal using a digital signature or net banking verification."),
            ("What is the TDS rate on payments made to NRIs?", "TDS on payments to NRIs is governed by Section 195. It is deducted at the maximum rate applicable to the type of income (e.g. 30% on rent/NRO interest, 12.5% on long-term capital gains, 20% on dividends), subject to lower rates under DTAA."),
            ("Can an NRI claim the Section 87A tax rebate?", "No. The Section 87A rebate (which makes tax zero up to ₹12 lakh under the New Regime) is only available to resident individuals. NRIs do not qualify for this rebate and must pay tax on taxable income exceeding basic limits."),
            ("Which ITR form should an NRI file for FY 2025-26?", "NRIs must file ITR-2 (for capital gains, salary, or property income) or ITR-3 (if they have business/professional income). NRIs cannot file ITR-1 (Sahaj)."),
            ("Do NRIs need to declare foreign bank accounts in their Indian ITR?", "No. NRIs do not need to report foreign bank accounts, foreign stocks, or assets in Schedule FA. Only resident taxpayers are mandatory to report foreign assets."),
            ("What is Schedule FA and who must file it?", "Schedule FA (Foreign Assets) is a mandatory schedule in ITR-2/ITR-3 for resident taxpayers. It requires reporting details of all foreign assets (shares, mutual funds, bank accounts, property) held at any time during the calendar year."),
            ("What is the penalty for failing to file Schedule FA?", "Under the Black Money Act, resident taxpayers who fail to disclose foreign assets in Schedule FA or underreport value face a flat penalty of ₹10 lakh per year, plus interest and potential prosecution."),
            ("How do I claim Foreign Tax Credit (FTC) in India?", "To claim credit for taxes paid in a foreign country on double-taxed income, you must file Form 67 online on the e-filing portal along with proof of tax payment/withholding before filing your ITR."),
            ("Are capital gains on Indian mutual funds taxable for NRIs?", "Yes, capital gains are taxable for NRIs. Equity LTCG is taxed at 12.5% (>12 months), STCG at 20%. Debt mutual fund gains are taxed at slab rates. The fund house will deduct TDS on redemptions."),
            ("Can an NRI buy agricultural land in India?", "Under FEMA regulations, an NRI or OCI cannot purchase agricultural land, plantation property, or farmhouse in India. They can, however, inherit such properties or buy commercial/residential properties.")
        ]
    },
    'presumptive_taxation': {
        'eyebrow': 'Presumptive Tax',
        'panels': [
            {
                'eyebrow': 'Presumptive rules',
                'title': 'What this page helps you decide',
                'items': [
                    'Determine if you qualify to declare presumptive profits under Section 44AD (for businesses) or Section 44ADA (for professionals).',
                    'Check the turnover limits for presumptive tax (up to ₹3 crore for businesses and ₹75 lakh for professionals, if 95% of receipts are digital).',
                    'Decide if opting for presumptive tax is more beneficial than maintaining books of accounts and undergoing a tax audit.',
                    'Verify the restricted regime switching rules (opting out of 44AD bars you from re-entering it for the next 5 assessment years).'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Under Section 44AD, businesses must declare a minimum profit of 8% of turnover (6% for digital/banking receipts).',
                    'Under Section 44ADA, specified professionals (CAs, doctors, lawyers, engineers) must declare at least 50% of gross receipts as profit.',
                    'The presumptive tax limit is ₹2 crore for business (increased to ₹3 crore if cash receipts <= 5% of total turnover).',
                    'The presumptive tax limit is ₹50 lakh for professionals (increased to ₹75 lakh if cash receipts <= 5%).',
                    'Presumptive tax filers are exempt from maintaining detailed books of accounts under Section 44AA.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Gross turnover or receipt figures for the financial year.',
                    'Bank account statements showing digital/UPI credits and cash deposits.',
                    'Form 26AS, AIS, and TIS showing TDS credits (under Section 194C, 194J, etc.) to reconcile gross receipts.',
                    'Details of assets (to track depreciation schedule outside the tax P&L).',
                    'Logins and active PAN/Aadhaar details for e-filing portal access.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Declaring a profit lower than the minimum presumptive rates (6%/8% or 50%) without undergoing a tax audit u/s 44AB and maintaining books.',
                    'Failing to pay 100% of advance tax by March 15th, which attracts interest penalty u/s 234C.',
                    'Filing ITR-4 (Sugam) if you have capital gains, foreign assets, or own more than one house (must use ITR-3 instead).',
                    'Switching out of Section 44AD without realizing it locks you out of the presumptive scheme for 5 subsequent years.',
                    'Including retail traders in Section 44ADA; only specified professions qualify for the 50% presumptive rate.'
                ]
            }
        ],
        'faqs': [
            ("What is the presumptive taxation scheme under Section 44AD?", "Section 44AD allows small businesses (individuals, HUFs, and partnership firms, but not LLPs) to declare a presumptive taxable profit of 8% of turnover (6% for digital/banking receipts) without maintaining books of accounts or undergoing audits."),
            ("What is presumptive taxation for professionals under Section 44ADA?", "Section 44ADA allows specified professionals (medical, engineering, legal, accounting, architecture, interior decoration, technical consultancy) to declare a presumptive profit of 50% of their gross receipts, paying tax on that amount."),
            ("What are the revised turnover limits for presumptive taxation?", "Under the current rules, the limit is ₹3 crore for businesses (increased from ₹2 crore) and ₹75 lakh for professionals (increased from ₹50 lakh), provided that cash receipts do not exceed 5% of the total turnover/gross receipts."),
            ("Which ITR form should presumptive tax filers use?", "Taxpayers opting for presumptive taxation under Section 44AD or 44ADA should file Form ITR-4 (Sugam), provided they do not have capital gains, foreign assets, or income from more than one house property. If they do, they must file ITR-3."),
            ("Are presumptive tax filers required to maintain books of accounts?", "No. Taxpayers opting for Section 44AD or 44ADA are exempt from the requirement of maintaining books of accounts under Section 44AA and getting them audited under Section 44AB."),
            ("What is the 5-year lock-in rule under Section 44AD?", "If a business taxpayer opts out of Section 44AD in any year after claiming it, they cannot opt back into the presumptive scheme for the next 5 consecutive assessment years. This lock-in rule does not apply to professionals under Section 44ADA."),
            ("When is the due date to pay advance tax under presumptive taxation?", "Taxpayers opting for Section 44AD or 44ADA must pay 100% of their advance tax liability in a single installment on or before March 15 of the financial year. Failure attracts 1% monthly interest u/s 234C."),
            ("Can I claim business expenses or depreciation under presumptive tax?", "No. The presumptive profit rate (6%/8% or 50%) is deemed to be final. All business expenses, including depreciation on assets and interest to partners, are deemed to have been already allowed. No further deductions can be claimed."),
            ("What happens if my actual profit is higher than the presumptive limit?", "If your actual profits are higher than 8%/6% (for business) or 50% (for professionals), you must declare the higher actual profits in your ITR. The presumptive rates represent the statutory minimum, not a cap."),
            ("Can a partnership firm claim partner salary under Section 44AD?", "No. Under recent amendments, partner salary and interest on capital cannot be deducted from the presumptive income calculated u/s 44AD. The profit must be declared as calculated."),
            ("Does Section 44AD apply to commission or brokerage business?", "No. Section 44AD(6) explicitly excludes commission agents, brokers, agency businesses, and professionals from claiming presumptive tax benefits under this section."),
            ("What is Section 44AE presumptive taxation?", "Section 44AE applies to taxpayers engaged in the business of plying, hiring, or leasing goods carriages. The presumptive profit is calculated per vehicle per month (e.g. ₹1,000 per ton for heavy goods vehicles) up to 10 vehicles."),
            ("What if my turnover exceeds the ₹3 crore / ₹75 lakh limits?", "If your turnover/receipts exceed the limits, you must maintain regular books of accounts u/s 44AA, get them audited u/s 44AB, and file ITR-3 or ITR-5."),
            ("Can a Private Limited Company or LLP opt for presumptive tax?", "No. Presumptive taxation under Section 44AD and 44ADA is strictly restricted to resident individuals, HUFs, and partnership firms. Companies and LLPs are excluded."),
            ("What should I do if my actual business profits are less than 6%/8%?", "If your actual profits are lower than the presumptive rates, you cannot file under the presumptive scheme. You must maintain books of accounts u/s 44AA and get them audited by a Chartered Accountant u/s 44AB.")
        ]
    },
    'audit_udin_compliance': {
        'eyebrow': 'Audit & UDIN',
        'panels': [
            {
                'eyebrow': 'Audit requirements',
                'title': 'What this page helps you decide',
                'items': [
                    'Confirm if your business or profession exceeds the thresholds for a mandatory Tax Audit under Section 44AB.',
                    'Check if your company requires a statutory audit under the Companies Act, 2013 (mandatory for all incorporated companies).',
                    'Verify the applicability of a Secretarial Audit under Section 204 (Form MR-3) for public companies or large borrowers.',
                    'Ensure all CA-certified reports carry a valid UDIN (Unique Document Identification Number) to prevent reject actions on portals.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Tax audit threshold is ₹1 crore, increased to ₹10 crore if at least 95% of receipts and payments are executed digitally.',
                    'The due date for submitting a Tax Audit report (Form 3CA/3CB and 3CD) on the e-filing portal is September 30th of the assessment year.',
                    'Secretarial Audit is mandatory for public companies with capital >= ₹50 crore, turnover >= ₹250 crore, or bank loans >= ₹100 crore.',
                    'ICAI mandates that all Chartered Accountants must generate a UDIN within 60 days of signing any document/certificate.',
                    'The penalty for MR-3 Secretarial Audit compliance defaults is ₹2,00,000 on the company and ₹50,000 on directors in default.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Books of accounts, trial balances, journals, and ledger books.',
                    'Bank statements, digital payment registers, and cash transaction records.',
                    'Prior year audit reports, ITR returns, and Form 3CD schedules.',
                    'PAN, Aadhaar, CIN/LLPIN, and GST registration details.',
                    'UDIN numbers for all certified certificates and audit reports.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Uploading tax audit reports without UDIN verification, leading to the report being treated as invalid by the IT portal.',
                    'Failing to reconcile books of accounts with GST return filings (GSTR-1 vs GSTR-3B vs GSTR-9), leading to audit flags.',
                    'Missing the September 30th tax audit deadline, which attracts a penalty of 0.5% of turnover (up to a maximum of ₹1.5 lakh).',
                    'Appointing statutory auditors without filing Form ADT-1 with the ROC within 15 days.',
                    'Ignoring CARO (Companies Auditor\'s Report Order) reporting requirements for eligible unlisted companies.'
                ]
            }
        ],
        'faqs': [
            ("What is a Tax Audit under Section 44AB?", "A tax audit is a review of a taxpayer's books of accounts to ensure compliance with the provisions of the Income Tax Act. It is conducted by a practicing Chartered Accountant who submits Form 3CA/3CB and Form 3CD."),
            ("What are the threshold limits for a Tax Audit?", "Tax audit is mandatory if: (1) Business turnover exceeds ₹1 crore (increased to ₹10 crore if digital cash receipts and payments are <= 5%). (2) Professional gross receipts exceed ₹50 lakh (increased to ₹75 lakh if cash receipts are <= 5%)."),
            ("What is the due date for submitting the Tax Audit report?", "The due date to file the tax audit report on the income tax portal is September 30 of the Assessment Year (one month prior to the ITR filing due date of October 31 for audited cases)."),
            ("What is the penalty for not getting books of accounts audited?", "Under Section 271B, failure to get books audited u/s 44AB attracts a penalty of 0.5% of the total sales, turnover, or gross receipts, subject to a maximum cap of ₹1.5 lakh (₹150,000)."),
            ("What is UDIN and why is it mandatory for CAs?", "UDIN (Unique Document Identification Number) is a unique 18-digit number generated by Chartered Accountants on the ICAI portal for every certificate, audit report, and document they sign, to prevent forgery and verify CA credentials."),
            ("What happens if a CA fails to generate a UDIN?", "Documents signed by a CA without a UDIN are treated as invalid. If not generated within the 60-day window, the CA can face disciplinary action from the ICAI for professional misconduct."),
            ("What is a Statutory Audit under the Companies Act, 2013?", "A statutory audit is a mandatory review of a company's financial records to verify they present a true and fair view. It is compulsory for all companies (Private Limited, Public, OPC) regardless of turnover or capital."),
            ("What is a Secretarial Audit under Section 204?", "A secretarial audit is an audit of compliance with corporate, securities, and labor laws, conducted by a practicing Company Secretary (CS) who submits Form MR-3. It is mandatory for listed and large public/borrowing unlisted companies."),
            ("What are the thresholds for a mandatory Secretarial Audit?", "Secretarial audit is mandatory for: (1) Listed companies. (2) Public companies with paid-up capital >= ₹50 crore or turnover >= ₹250 crore. (3) Any company with outstanding bank/public financial institution loans >= ₹100 crore."),
            ("What is CARO (Companies Auditor's Report Order)?", "CARO is a set of compliance items that statutory auditors of companies must report on, covering areas like fixed assets, inventory verification, loans to related parties, statutory dues, and internal control structures."),
            ("Are LLPs required to undergo audits?", "Under the LLP Act, 2008, an LLP must get its accounts audited if its annual turnover exceeds ₹40 lakh or if its partner contributions exceed ₹25 lakh."),
            ("What is an Internal Audit? Who is required to appoint an internal auditor?", "An internal audit evaluates a company's risk management and internal controls. Under Section 138 of the Companies Act, listed companies and unlisted public/private companies crossing specific turnover or debt thresholds must appoint an internal auditor."),
            ("What is the difference between Form 3CA and Form 3CB?", "Form 3CA is the audit report used when the business is already required to get its accounts audited under another law (like the Companies Act). Form 3CB is used when the audit is required solely under the Income Tax Act."),
            ("What is Form 3CD?", "Form 3CD is a detailed statement of particulars containing 44 clauses that the tax auditor must complete, detailing business income, expenses, depreciation, MSME dues, TDS compliance, and tax adjustments."),
            ("Can a tax audit report be revised after uploading?", "Yes, a tax audit report can be revised if there are changes in the accounts (like corporate restructuring) or adjustments due to subsequent notifications, certified by the same CA with a fresh UDIN.")
        ]
    },
    'trademark_ip_compliance': {
        'eyebrow': 'IPR & Trademark',
        'panels': [
            {
                'eyebrow': 'IP protection',
                'title': 'What this page helps you decide',
                'items': [
                    'Conduct a trademark search to verify brand name or logo availability and avoid infringement risks.',
                    'Identify the correct Trademark Class (out of 45 classes) for filing your application based on your goods/services.',
                    'Check the legal deadlines for responding to trademark examination reports (written replies must be filed within 30 days).',
                    'Verify if your invention is patentable (novelty, inventive step, industrial use) or if your work qualifies for copyright protection.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'The official government fee for filing a trademark application is ₹4,500 for individuals/startups/MSMEs, and ₹9,000 for other corporate entities.',
                    'A registered trademark is valid for a period of 10 years, renewable indefinitely every 10 years.',
                    'A patent is valid for a maximum period of 20 years from the filing date, with no option for renewal.',
                    'Copyright protection for literary, musical, and artistic works lasts for the lifetime of the author plus 60 years.',
                    'Trademark opposition must be filed within 4 months of the mark\'s publication in the Trademark Journal.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Logo, brand name, slogan, or design to be registered.',
                    'PAN, Aadhaar, and Udyam Registration Certificate (to claim the 50% MSME government fee concession).',
                    'User affidavit (if the trademark is already in use before the filing date) along with invoices and advertisements.',
                    'Power of Attorney (Form TM-M) authorizing the trademark attorney or agent.',
                    'Complete patent specifications, drawings, and claims (for patent applications).'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Failing to file a written reply within 30 days of receiving a trademark objection, leading to the application being marked as "abandoned".',
                    'Filing under the incorrect class, which invalidates protection and requires filing a fresh application.',
                    'Using trademark symbols (®) before the registration certificate is formally issued (only use ™ while pending).',
                    'Copying description clauses directly from other brands, leading to objections u/s 9 or 11.',
                    'Failing to conduct a global patent search before initiating product development.'
                ]
            }
        ],
        'faqs': [
            ("What is a Trademark?", "A trademark is a unique brand name, logo, slogan, symbol, or design used by an individual or business to distinguish their products or services from those of competitors, representing brand identity and goodwill."),
            ("What is the trademark registration process in India?", "The process starts with a trademark search, followed by filing an application (Form TM-A) online. The registry examines it and issues a report. If accepted, the mark is published in the Trademark Journal. If no opposition is filed within 4 months, the registration certificate is issued."),
            ("What is a Trademark Class?", "Trademarks are classified into 45 different classes based on the international Nice Classification. Classes 1 to 34 are for goods (products), and Classes 35 to 45 are for services. You must file in the relevant class matching your business activity."),
            ("What is the government fee for filing a trademark?", "The official filing fee is ₹4,500 per class for individuals, startups, and small enterprises (holding Udyam registration). For other entities (private limited companies, LLPs, partnership firms), the fee is ₹9,000 per class."),
            ("How long is a trademark registration valid?", "A registered trademark is valid for 10 years from the date of application. It can be renewed indefinitely every 10 years by paying the prescribed renewal fee before its expiry."),
            ("What is a Trademark Objection?", "An objection is raised by the trademark examiner if the mark matches absolute grounds (Section 9 - descriptive, generic, lack of distinctiveness) or relative grounds (Section 11 - identical or deceptively similar to an existing registered mark)."),
            ("What is the deadline to reply to a trademark objection?", "You must file a detailed written response to the examination report within 30 days from the date of receipt of the report. Failure to file the reply results in the application being marked as 'Abandoned' by the registry."),
            ("What is Trademark Opposition?", "After examination and acceptance, a trademark is published in the Trademark Journal. Any third party can oppose the registration by filing a notice of opposition (Form TM-O) within 4 months from the publication date."),
            ("What is a Patent?", "A patent is an exclusive legal right granted by the government for a new invention (product or process) that offers a new technical solution. It gives the patentee the right to exclude others from making, using, or selling the invention."),
            ("What are the requirements for an invention to be patentable?", "The invention must meet three criteria: (1) Novelty (must be new and not published anywhere). (2) Inventive step (must not be obvious to a person skilled in the art). (3) Industrial applicability (must be capable of being made or used in an industry)."),
            ("How long is a patent valid in India?", "A patent is valid for a maximum period of 20 years from the date of filing of the patent application. Unlike trademarks, a patent cannot be renewed beyond its 20-year term."),
            ("What is Copyright?", "Copyright is a legal right that protects original works of authorship, including literary works (software code, books), dramatic, musical, artistic works (paintings, logos), cinematographic films, and sound recordings."),
            ("What is the duration of copyright protection in India?", "For literary, dramatic, musical, and artistic works published during the lifetime of the author, copyright lasts for the lifetime of the author plus 60 years from the beginning of the calendar year following the author's death."),
            ("What is Trademark Infringement?", "Infringement is the unauthorized use of a trademark that is identical or deceptively similar to a registered trademark, causing confusion among consumers. The owner can initiate civil injunctions, seek damages, or file criminal cases."),
            ("What is the Madrid Protocol?", "The Madrid Protocol is an international treaty that allows a trademark owner to seek protection in multiple countries (over 120 member nations) by filing a single international application through their home country's trademark office.")
        ]
    },
    'salary_allowances_pf': {
        'eyebrow': 'Salary & EPF',
        'panels': [
            {
                'eyebrow': 'Salary structure',
                'title': 'What this page helps you decide',
                'items': [
                    'Optimize your monthly salary slip components (Basic, HRA, Special Allowance, LTA) to reduce your tax liability under the chosen regime.',
                    'Confirm the EPF contribution rules (12% of basic) and verify if your company meets the mandatory registration threshold (20 employees).',
                    'Determine your eligibility for gratuity payouts under the Payment of Gratuity Act, 2013 (minimum 5 years of continuous service).',
                    'Check the state-specific slabs for Professional Tax (PT) deducted from your gross earnings.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'The standard deduction for salaried individuals is ₹75,000 under the New Tax Regime and ₹50,000 under the Old Tax Regime.',
                    'HRA exemptions, LTA, and Section 80C deductions are only available if you actively opt for the Old Tax Regime.',
                    'Interest earned on employee EPF contributions exceeding ₹2.5 lakh in a financial year is fully taxable under other sources.',
                    'Employer contributions to NPS under Section 80CCD(2) are tax-deductible up to 10% of salary under both tax regimes.',
                    'Gratuity received from an employer is tax-free up to a lifetime statutory limit of ₹20 lakh.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Monthly salary slips for the entire financial year and Form 16 (Part A & Part B).',
                    'Rent receipts, lease agreements, and landlord\'s PAN card (for HRA exemption claims exceeding ₹1 lakh annually).',
                    'Investment certificates for deductions under Section 80C (EPF, ELSS, PPF, LIC) and Section 80D (health insurance).',
                    'UAN (Universal Account Number) and EPF member portal credentials.',
                    'Form 12BB (investment declaration form) submitted to your employer.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Claiming HRA deductions without valid rent receipts or landlord PAN details, which leads to immediate tax scrutiny.',
                    'Changing jobs mid-year without submitting Form 12B to the new employer, leading to double standard deductions and large tax defaults.',
                    'Failing to track EPF transfers when shifting companies, resulting in multiple inactive accounts and lost interest.',
                    'Omitting taxable employee benefits (like RSUs/ESOP perquisites at vesting) from tax calculations.',
                    'Missing the internal HR deadline to submit investment proofs, leading to massive TDS deductions in January-March.'
                ]
            }
        ],
        'faqs': [
            ("What are the key components of a salary slip in India?", "A salary slip contains earnings (Basic Salary, HRA, Special Allowance, LTA, Bonus) and deductions (EPF, Professional Tax, ESI, TDS). Reconciling these monthly components is essential for accurate ITR filing."),
            ("How is House Rent Allowance (HRA) exemption calculated?", "Under Section 10(13A), HRA exemption is the minimum of: (1) Actual HRA received, (2) Rent paid minus 10% of (Basic + DA), or (3) 50% of (Basic + DA) for metro cities or 40% for non-metros. Note: This exemption is only available under the Old Tax Regime."),
            ("Is HRA exemption available under the New Tax Regime?", "No. Under the default New Tax Regime, all major deductions and exemptions—including HRA, LTA, and Section 80C deductions—are abolished. Salaried employees can only claim the standard deduction (₹75,000) and NPS employer contribution u/s 80CCD(2)."),
            ("What is the standard deduction for salaried employees for FY 2025-26?", "For FY 2025-26, the standard deduction is ₹75,000 under the default New Tax Regime, and ₹50,000 under the Old Tax Regime. This deduction is automatically subtracted from your gross salary income in your ITR."),
            ("How does EPF contribution affect my salary slip and taxes?", "The employee contributes 12% of basic salary + DA to the EPF, which is deductible under Section 80C (Old Regime only). The employer matches this 12% contribution. Under Section 80CCD(2), the employer's share is exempt up to ₹7.5 lakh aggregate."),
            ("At what point does EPF interest become taxable?", "If an employee's contribution to the EPF exceeds ₹2.5 lakh in a financial year (or ₹5 lakh if there is no employer contribution), the interest earned on the excess contribution is taxable as 'Income from Other Sources'."),
            ("What is Professional Tax (PT) and how is it deducted?", "Professional Tax is a state-level tax levied on salaried employees, capped at a maximum of ₹2,50,0 per annum. It is deducted from your gross salary monthly and is fully deductible under Section 16(iii) under the Old Tax Regime."),
            ("What is a perquisite under Section 17(2)?", "Perquisites are non-cash benefits provided by an employer to an employee, such as rent-free accommodation, corporate cars, club memberships, or concessional loans. The valuation of perquisites is added to your taxable salary, and the employer deducts TDS on it."),
            ("How is gratuity calculated and is it tax-free?", "Gratuity is paid after 5 years of continuous service. It is calculated as `(15 * Last Drawn Basic Salary * Years of Service) / 26` for employees covered under the Payment of Gratuity Act. It is tax-free up to a lifetime limit of ₹20 lakh."),
            ("What is Form 12BB and why is it important?", "Form 12BB is a mandatory declaration form submitted by employees to their HR at the end of the financial year. It details all tax-saving investments (80C, 80D, home loan interest, rent receipts) along with physical proofs, allowing the HR to calculate and deduct the correct TDS."),
            ("What happens if I change jobs mid-year and do not submit Form 12B?", "If you change jobs and do not declare your previous salary details to your new employer in Form 12B, both employers will apply basic exemptions and standard deductions. This leads to double-benefit claims and results in a large tax liability plus interest when you file your ITR."),
            ("How is Leave Travel Allowance (LTA) exempt from tax?", "LTA covers travel tickets for yourself and your family within India. It can be claimed tax-free twice in a block of 4 calendar years under Section 10(5) (Old Regime only). The exemption is restricted to the actual travel cost, not hotel or food expenses."),
            ("What is the difference between Form 16 Part A and Part B?", "Part A is generated from the income tax portal and contains quarterly TDS summaries deposited under your PAN. Part B is issued by your employer and contains a detailed calculation of your gross salary, exempted allowances, deductions under Chapter VI-A, and net tax payable."),
            ("Why is my monthly TDS in salary slip different from month to month?", "TDS is calculated by projecting your annual taxable income and dividing the estimated tax by the remaining months in the year. If you declare investments late or receive a variable bonus, your projected income changes, causing the monthly TDS to be adjusted."),
            ("Can I claim deductions if my employer has already deducted TDS based on full salary?", "Yes. If you missed submitting investment proofs to your HR on time, you can still claim deductions like Section 80C, 80D, and HRA directly when filing your ITR, and claim a refund for the excess TDS deducted by your employer.")
        ]
    },
    'legal_nclt_insolvency': {
        'eyebrow': 'Corporate Legal',
        'panels': [
            {
                'eyebrow': 'Legal procedures',
                'title': 'What this page helps you decide',
                'items': [
                    'Determine if you need to approach the National Company Law Tribunal (NCLT) for insolvency resolution, oppression-mismanagement, or mergers.',
                    'Check the legal requirements to initiate corporate insolvency under the Insolvency and Bankruptcy Code (IBC).',
                    'Verify the procedure and forms required to close a company (voluntary strike-off via Form STK-2) or liquidate assets.',
                    'Understand the dispute resolution clauses, stamp duty rules, and arbitration frameworks applicable to your agreements.'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'The NCLT is the adjudicating authority for corporate insolvency (IBC) and Companies Act disputes, while NCLAT hears appeals against NCLT orders.',
                    'To initiate insolvency against a corporate debtor, the minimum default threshold is ₹1 crore (increased from ₹1 lakh).',
                    'A company can file for a voluntary strike-off (Form STK-2) only if it has zero assets, zero liabilities, and obtains consent from 75% of shareholders.',
                    'Partnership firms are governed by the Partnership Act 1932, while LLPs are registered separate legal entities under the LLP Act 2008.',
                    'Arbitration awards can be challenged in court only on highly restricted grounds like procedural bias or public policy violations.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Constitutional documents: Certificate of Incorporation, MOA, AOA, or LLP Agreement.',
                    'Board resolutions, general meeting minutes, and shareholder registers.',
                    'For insolvency: proof of default, bank certificates, invoices, and ledger details.',
                    'For strike-off: statement of accounts (not older than 30 days) certified by a CA, and indemnity bonds.',
                    'Signed agreements, legal contracts, and dispute notices.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Filing for voluntary strike-off (STK-2) while having active bank accounts, pending litigation, or outstanding GST/ROC dues.',
                    'Initiating NCLT insolvency proceedings without issuing a mandatory 10-day demand notice under Section 8 of the IBC.',
                    'Signing partnership deeds or leases without checking registration and local stamp duty compliance.',
                    'Appealing NCLT orders to the NCLAT after the strict 45-day limitation period (NCLAT cannot condone delay beyond 15 additional days).',
                    'Ignoring statutory rules under the Companies Act regarding loans to directors (Section 185) or inter-corporate loans.'
                ]
            }
        ],
        'faqs': [
            ("What is the National Company Law Tribunal (NCLT)?", "The NCLT is a quasi-judicial body in India that adjudicates issues relating to companies, including insolvency proceedings (IBC), mergers, acquisitions, oppression and mismanagement, and winding up of companies."),
            ("What is the National Company Law Appellate Tribunal (NCLAT)?", "The NCLAT is the appellate tribunal that hears appeals against orders passed by the NCLT. Appeals against NCLAT orders can be filed in the Supreme Court of India."),
            ("What is the Insolvency and Bankruptcy Code (IBC)?", "The IBC is a consolidated legal framework in India that governs the time-bound insolvency resolution process for corporate entities, partnership firms, and individuals to maximize asset value."),
            ("What is the minimum default limit to file for insolvency under the IBC?", "To initiate the Corporate Insolvency Resolution Process (CIRP) against a corporate debtor, the minimum amount of default required is ₹1 crore (increased from ₹1 lakh to protect MSMEs)."),
            ("What is the Corporate Insolvency Resolution Process (CIRP) timeline?", "The CIRP must be completed within a period of 180 days from the date of admission of the application. The NCLT can grant a one-time extension of up to 90 days, but the process must be completed within 330 days, including litigation."),
            ("Who is an Insolvency Professional (IP)?", "An Insolvency Professional is a licensed professional registered with the IBBI who is appointed by the NCLT to manage the corporate debtor's business operations and lead the resolution process during CIRP."),
            ("What is the difference between a Financial Creditor and an Operational Creditor?", "Financial Creditors are entities whose relationship with the debtor arises from a financial debt (like banks, home buyers). Operational Creditors are entities whose claim arises from the provision of goods, services, employment, or government dues."),
            ("What is a Section 8 demand notice under the IBC?", "An Operational Creditor must first deliver a 10-day demand notice u/s 8 of the IBC to the corporate debtor, demanding payment of the defaulted amount. If the debtor does not pay or raise a dispute within 10 days, the creditor can file for insolvency."),
            ("How can a company close its business voluntarily?", "A company with no assets and liabilities can apply for a voluntary closure (strike-off) by filing Form STK-2 with the ROC, along with a certified statement of accounts, indemnity bond, and affidavit from directors."),
            ("What is the difference between a Partnership Firm and an LLP?", "A Partnership Firm is registered under the Partnership Act 1932, and partners have unlimited personal liability. An LLP is incorporated under the LLP Act 2008, offers limited liability, and is a separate legal entity."),
            ("What is the time limit for filing an appeal to the NCLAT?", "An appeal against an NCLT order must be filed with the NCLAT within 30 days. The NCLAT can condone a delay of up to an additional 15 days only if sufficient cause is shown; no delay can be condoned beyond 45 days."),
            ("What is Arbitration and how does it work?", "Arbitration is an alternative dispute resolution (ADR) mechanism where disputes are resolved outside courts by an independent arbitrator or tribunal, based on an arbitration agreement between the parties."),
            ("Can an arbitration award be challenged in court?", "Yes, under Section 34 of the Arbitration and Conciliation Act, an award can be challenged in court, but only on limited grounds such as invalid agreement, procedural irregularity, bias, or conflict with public policy."),
            ("What is a Shareholder Agreement (SHA)?", "An SHA is a contract among a company's shareholders that defines their rights, duties, share transfer restrictions, board representation, voting rules, and dispute resolution mechanisms."),
            ("What is the role of NCLT in oppression and mismanagement cases?", "Under Sections 241-244 of the Companies Act, minority shareholders (holding >= 10% shares/members) can petition the NCLT for relief if the company's affairs are conducted in a manner oppressive to members or prejudicial to interest.")
        ]
    },
    'tds_commission_brokerage': {
        'eyebrow': 'TDS compliance',
        'panels': [
            {
                'eyebrow': 'Commission TDS',
                'title': 'What this page helps you decide',
                'items': [
                    'Confirm if the payments are classified as commission or brokerage under Section 194H of the Income Tax Act.',
                    'Check the threshold limit (no TDS is required if the aggregate commission paid in a financial year does not exceed ₹15,000).',
                    'Verify the standard TDS rate of 5% (applicable to resident payees) and understand compliance rules if PAN is not furnished.',
                    'Identify exclusions (such as insurance commission u/s 194D or commission paid by MTNL/BSNL to public call office franchise managers).'
                ]
            },
            {
                'eyebrow': 'Fact check',
                'title': 'Accuracy notes before you act',
                'items': [
                    'Section 194H mandates a flat TDS rate of 5% on commission or brokerage paid to resident individuals, firms, or companies.',
                    'If the payee fails to provide a valid PAN, TDS must be deducted at a higher rate of 20% under Section 206AA.',
                    'TDS must be deducted at the time of credit of such income to the account of the payee or at the time of payment, whichever is earlier.',
                    'TDS is not applicable on commission paid by the government, or on bank guarantee commissions/underwriting fees paid to banks.',
                    'Quarterly TDS returns for Section 194H must be filed in Form 26Q.'
                ]
            },
            {
                'eyebrow': 'Documents',
                'title': 'Documents and facts to keep ready',
                'items': [
                    'Valid PAN and address of the commission agent or broker.',
                    'Invoices, commission accounts, and brokerage agreements.',
                    'Challan details showing deposit of TDS into the government treasury.',
                    'Form 16A certificates issued to the payee quarterly.',
                    'Form 26AS/AIS downloaded to check sync and verify tax credits.'
                ]
            },
            {
                'eyebrow': 'Care points',
                'title': 'Common mistakes to avoid',
                'items': [
                    'Failing to deduct TDS when aggregate annual payments exceed ₹15,000, triggering tax demands and interest u/s 201.',
                    'Conflating commission u/s 194H with professional fees u/s 194J (which carries a higher 10% rate) or contract payments u/s 194C.',
                    'Delaying the deposit of deducted tax beyond the 7th of the following month (or April 30th for March deductions), incurring 1.5% monthly interest.',
                    'Failing to report the deductions in the quarterly Form 26Q return, attracting a ₹200 per day late fee u/s 234E.',
                    'Deducting tax on reimbursement of actual expenses, which should be billed separately from the commission amount.'
                ]
            }
        ],
        'faqs': [
            ("What is Section 194H of the Income Tax Act?", "Section 194H governs the deduction of Tax Deducted at Source (TDS) on payments made to a resident individual, Hindu Undivided Family (HUF), firm, or company by way of commission or brokerage."),
            ("What is the TDS rate on commission and brokerage u/s 194H?", "The standard TDS rate under Section 194H is 5% of the payment amount. If the payee does not furnish their PAN, TDS is deducted at a higher rate of 20% u/s 206AA."),
            ("What is the threshold limit for TDS under Section 194H?", "TDS is required to be deducted u/s 194H only if the aggregate amount of commission or brokerage paid or payable during the financial year exceeds ₹15,000. No TDS applies if the total amount is ₹15,000 or less."),
            ("What is the definition of commission or brokerage for tax purposes?", "Commission or brokerage includes any payment received by a person acting on behalf of another person for services rendered (except professional services), or in the course of buying/selling goods, or in relation to any transaction relating to assets, valuable articles, or securities."),
            ("Does Section 194H apply to insurance commission?", "No. Insurance commission is governed by a separate section, Section 194D (TDS rate is 5% for residents), and is subject to its own thresholds (₹15,000)."),
            ("Does Section 194H apply to payments made by individuals?", "Section 194H applies to individuals and HUFs only if they are liable to tax audit under Section 44AB (turnover > ₹1 crore for business or gross receipts > ₹50 lakh for profession) in the preceding financial year."),
            ("Is TDS applicable on bank commission or underwriting fees?", "No. Under CBDT Circular No. 5/2012, no TDS is applicable on payments made to banks towards bank guarantee commission, underwriting fees, credit card commission, or warehousing charges."),
            ("What is the due date for depositing TDS deducted u/s 194H?", "TDS must be deposited into the government treasury by the 7th of the following month (e.g., September TDS by October 7). For March deductions, the due date is April 30."),
            ("What form is used to file quarterly TDS returns for Section 194H?", "All non-salary TDS deductions, including Section 194H, must be reported quarterly in Form 26Q on or before the due date (July 31, October 31, January 31, and May 31)."),
            ("What is the penalty for late filing of TDS returns?", "Under Section 234E, a late fee of ₹200 per day is charged for delayed filing of TDS returns, up to a maximum amount equal to the TDS amount in the return."),
            ("Can a payee obtain a lower TDS deduction certificate under Section 197?", "Yes. If the payee's total income justifies a lower tax rate, they can apply in Form 13 online on the e-filing portal to obtain a lower or nil TDS certificate from their Assessing Officer u/s 197."),
            ("How does the agent verify TDS credits?", "All TDS deductions u/s 194H appear in the taxpayer's Form 26AS and AIS under the deductor's TAN. The agent can verify these credits before filing their ITR."),
            ("Is TDS applicable on brokerage paid on the purchase of securities?", "No. Under the explanation to Section 194H, no TDS is applicable on brokerage or commission paid in relation to transactions in securities on a recognized stock exchange."),
            ("What is the interest rate for delayed TDS payment?", "If TDS is deducted but not deposited within the due date, interest at 1.5% per month is payable from the date of deduction to the date of deposit."),
            ("Does Section 194H apply to payments made to non-residents?", "No. Section 194H applies only to payments made to resident taxpayers. Payments to non-residents or NRIs are governed by Section 195, where TDS rates depend on the DTAA or Income Tax Act provisions.")
        ]
    }
}

case_study_panels = {
    'hyatt_pe': {
        'dispute_details': [
            "Facts: UAE-based Hyatt Southwest Asia entered into 20-year SOSA (Strategic Oversight Services Agreements) with Asian Hotels Ltd. for hotels in Delhi and Mumbai, reporting nil taxable income in India.",
            "Lower Court History: The Assessing Officer, DRP, ITAT, and Delhi High Court all ruled that Hyatt's continuous strategic and operational involvement established a Fixed Place PE under DTAA.",
            "Key Issues: Whether strategic brand and operational oversight services without a dedicated, exclusive office can satisfy the 'fixed place' and 'disposal' tests under Article 5(1) of the India-UAE DTAA."
        ],
        'court_ratio': [
            "Fixed Place PE: The Supreme Court ruled that the 'disposal' test under Article 5(1) does not require ownership or exclusive lease of premises. Effective, regular, and functional access suffices.",
            "Substance Over Form: Core business activities like strategic planning, HR oversight, and financial controls cannot be classified as auxiliary or preparatory under Article 5(4).",
            "Profit Attribution: The Court rejected the argument that global losses prevent tax attribution. Income must be attributed to the Indian PE based on actual functions performed, assets deployed, and risks assumed (FAR)."
        ],
        'key_evidence': [
            "SOSA Agreements: Long-term 20-year agreements outlining day-to-day management standards, operational know-how, and branding controls.",
            "Travel Logs: Detailed records of frequent, purpose-driven visits by Hyatt's foreign personnel to supervise and manage the hotels.",
            "Fee Structure: Remuneration linked directly to hotel revenue and operational profitability, indicating core business involvement."
        ],
        'action_points': [
            "Perform FAR Analysis: Document functions performed, assets used, and risks assumed for all cross-border service transactions.",
            "Restrict Access & Authority: Ensure foreign parent personnel do not exercise operational control or have unrestricted access to local premises.",
            "Standardize Service Terms: Review contracts to distinguish purely advisory, off-shore services from on-site managerial execution."
        ]
    },
    'safari_itc': {
        'dispute_details': [
            "Facts: Businesses claimed Input Tax Credit (ITC) on goods and services used for construction of commercial properties (like malls) meant for renting out, which was blocked under Section 17(5)(d).",
            "Lower Court History: High Courts gave conflicting decisions. The Orissa High Court in Safari Retreats allowed ITC, stating that denying it would lead to double taxation of lease rentals.",
            "Key Issues: Whether Section 17(5)(d) blocks ITC on construction of commercial property when the property is used to generate taxable lease rental income."
        ],
        'court_ratio': [
            "Safari Retreats Ruling: The Supreme Court held that if the constructed building qualifies as a 'plant' under the facts of a business (i.e. is essential for its service operations), ITC is allowable.",
            "Suncraft Principle: Denying ITC to a buyer due to a supplier's non-payment is illegal unless the Revenue first attempts recovery from the defaulting supplier.",
            "Vested Right & Limitation: The Court upheld the constitutional validity of Section 16(4) time limits for claiming ITC, ruling that credit is a statutory benefit, not an absolute right."
        ],
        'key_evidence': [
            "Construction Invoices: Detailed billing for cement, steel, and services utilized in building the commercial structure.",
            "Lease Agreements: Enforceable contracts demonstrating that the building is leased out, generating active output tax liability.",
            "GSTR-2B Records: Supplier filings proving that the taxes were charged and declared in the GST system."
        ],
        'action_points': [
            "Analyze Building Function: Document whether the building functions as a 'plant' (e.g. specialized malls, theatres) to justify construction ITC.",
            "Implement Vendor Indemnity: Include clauses in contracts to hold payments or recover losses if vendors fail to upload invoices.",
            "Track GSTR-2B Monthly: Ensure all ITC claims are supported by matching supplier records before the Section 16(4) deadline."
        ]
    },
    'gameskraft_gaming': {
        'dispute_details': [
            "Facts: Online gaming platforms received massive show-cause notices (e.g. ₹21,000 Crore on Gameskraft) demanding 28% GST on the entire face value of bets placed by players.",
            "Lower Court History: The Karnataka High Court quashed the notice, ruling that rummy and other games of skill are not betting or gambling, and cannot be taxed on the full pool.",
            "Key Issues: Whether online games of skill involve taxable 'actionable claims' like betting and gambling, and whether GST applies to Gross Gaming Revenue (GGR) or the entire bet pool."
        ],
        'court_ratio': [
            "Actionable Claims: The legal dispute focuses on whether games of skill can be categorized as lottery, betting, or gambling under Schedule III of the CGST Act.",
            "Valuation Rule: The government amended the GST rules to mandate 28% GST on the entry pool/face value for online money gaming from October 1, 2023.",
            "Skill vs Chance: Platforms argue that the constitutional distinction between games of skill and games of chance must be maintained for taxation."
        ],
        'key_evidence': [
            "Platform Terms: Enforceable rules proving that the platform only charges a commission/service fee (Rake/GGR) and does not participate in the game.",
            "ESCROW Accounts: Segregated bank accounts holding player stakes separately from platform operational revenues.",
            "Expert Certification: Game design analysis proving that outcomes depend predominantly on the player's cognitive and physical skills."
        ],
        'action_points': [
            "Structure Deposit Flows: Clearly separate platform commission invoices from player pool deposits in the books of accounts.",
            "Audit Platform Rules: Ensure terms of service explicitly state that the platform has no ownership over player stakes.",
            "Monitor GST Filings: File returns in compliance with the amended Rule 31A/31B requirements while litigation is pending."
        ]
    },
    'rajeev_bansal_tola': {
        'dispute_details': [
            "Facts: The Income Tax Department issued thousands of reassessment notices under the old Section 148 after April 1, 2021, relying on TOLA extensions.",
            "Lower Court History: Multiple High Courts quashed the notices. The Supreme Court in Ashish Agarwal and later Rajeev Bansal addressed the validity of these transitions.",
            "Key Issues: Whether the Revenue can use TOLA (Taxation and Other Laws Act) to extend the limitation period for issuing notices under the old law after the new regime commenced."
        ],
        'court_ratio': [
            "New Law Supremacy: The Supreme Court ruled that after April 1, 2021, all reassessment notices must follow the new Section 147-151 procedures.",
            "Deeming Fiction: Notices issued under the old law were deemed as show-cause notices under the new Section 148A(b) to balance revenue interests and taxpayer rights.",
            "Limitation Strictness: Reassessment notices cannot be issued for period beyond 3 years (up to 10 years only for income escaping >₹50 lakh with specific approvals)."
        ],
        'key_evidence': [
            "Notice Dates: The exact dates of issue of Section 148 notices and the corresponding tax years (AY).",
            "Sanction Records: Internal approvals obtained by the Assessing Officer under Section 151 of the Act.",
            "Escaped Income Ledger: Computation of the exact quantum of income alleged to have escaped assessment."
        ],
        'action_points': [
            "Verify Limitation Dates: Check if the reassessment notice was issued within the statutory 3-year or 10-year limit under the new law.",
            "Respond to Section 148A(b): Submit detailed objections within the mandatory 7 to 30 days time limit showing that no income escaped.",
            "Challenge Lack of Sanction: Review if the necessary higher authority approvals under Section 151 were obtained by the AO."
        ]
    },
    'vkc_inverted': {
        'dispute_details': [
            "Facts: Taxpayers claimed refunds of accumulated Input Tax Credit (ITC) under the Inverted Duty Structure (tax on inputs higher than tax on outputs) on both input goods and input services.",
            "Lower Court History: The Gujarat High Court allowed refunds on input services, while the Madras High Court disallowed it, leading to a Supreme Court appeal.",
            "Key Issues: Whether Rule 89(5) of the CGST Rules, which restricts the refund of unutilized ITC to inputs (goods) and excludes input services, is ultra vires Section 54(3)."
        ],
        'court_ratio': [
            "Validity of Rule 89(5): The Supreme Court in VKC Footsteps held that Rule 89(5) is valid. The legislature has the authority to restrict the scope of refunds.",
            "Statutory Right: A tax refund is a statutory right created by law, and cannot be claimed as an inherent constitutional right unless explicitly provided by the statute.",
            "Anomalies Acknowledged: The Court acknowledged that the formula creates minor anomalies for service-heavy businesses but left it to the GST Council to resolve."
        ],
        'key_evidence': [
            "Input vs Output Invoices: Records showing GST rates on raw materials (goods) vs GST rates on professional/rental services (input services).",
            "Refund Applications: RFD-01 forms and calculation sheets submitted on the GST portal.",
            "GST Council Minutes: Discussions showing the intent behind limiting refunds under Rule 89(5)."
        ],
        'action_points': [
            "Optimize ITC Utilization: Plan business purchases to utilize input services ITC against domestic sales rather than expecting refunds.",
            "Re-evaluate Supply Chains: Where possible, source inputs as goods rather than services to maximize inverted duty refund eligibility.",
            "Maintain Clean Books: Maintain separate ledgers for ITC on input goods, input services, and capital goods to simplify audits."
        ]
    },
    'blackstone_trc': {
        'dispute_details': [
            "Facts: Foreign investors claimed tax treaty exemptions (e.g. under India-Mauritius DTAA) on capital gains, but the Revenue denied benefits, alleging the entities were shell companies.",
            "Lower Court History: The Delhi High Court in Blackstone and others ruled that the Tax Residency Certificate (TRC) is sufficient evidence of residency.",
            "Key Issues: Whether the Indian tax authorities can go behind a valid TRC to deny DTAA benefits by alleging tax avoidance or lack of economic substance."
        ],
        'court_ratio': [
            "TRC Sanctity: The Courts held that once a valid TRC is issued by the treaty partner, the Indian Revenue cannot challenge the residency or beneficial ownership status.",
            "Azadi Bachao Andolan Precedent: The landmark ruling of the Supreme Court remains active, confirming that treaty shopping is permissible if within the legal framework.",
            "Anti-Avoidance Limits: GAAR (General Anti-Avoidance Rules) cannot be invoked to override specific DTAA provisions unless clear fraud is proved."
        ],
        'key_evidence': [
            "Tax Residency Certificate (TRC): Form 10F and residency certificate issued by the foreign tax authority.",
            "Board Meetings: Minutes showing that key management decisions were made in the treaty country.",
            "Bank & Office Records: Evidence of local operational expenditures and office presence in the treaty country."
        ],
        'action_points': [
            "Obtain TRC Annually: Ensure a valid TRC is obtained from the treaty partner country at the start of every financial year.",
            "Establish Local Substance: Maintain physical office, local staff, and operational expenses in the treaty country to satisfy substance tests.",
            "File Form 10F: Complete the mandatory online filing of Form 10F on the e-filing portal before claiming DTAA benefits."
        ]
    },
    'section_87a_stcg': {
        'dispute_details': [
            "Facts: Taxpayers claimed the Section 87A rebate (up to ₹25,000/₹60,000) against tax payable on short-term capital gains on listed shares under Section 111A.",
            "Lower Court History: The Income Tax e-filing portal automatically disallowed the rebate on Section 111A gains. Taxpayers appealed to the ITAT (e.g. Surat ITAT).",
            "Key Issues: Whether Section 87A rebate is available against tax calculated at special rates under Section 111A, and whether the portal's automated disallowance is legal."
        ],
        'court_ratio': [
            "Rebate Availability: ITAT rulings clarified that Section 87A rebate applies to the total tax payable. The only exception specified in the law is Section 112A (LTCG).",
            "Literal Interpretation: Since Section 87A does not explicitly exclude Section 111A or other special rate incomes, the rebate must be allowed on those taxes.",
            "Portal Limitations: The automated calculations on the e-filing portal cannot override the clear provisions of the Income Tax Act."
        ],
        'key_evidence': [
            "ITR Acknowledgment: Computation sheets showing total income and tax calculated under Section 111A.",
            "Demand Notices: Intimations under Section 143(1) raising tax demands due to disallowance of Section 87A.",
            "ITAT Orders: Certified copies of tribunal rulings directing the Assessing Officer to allow the rebate."
        ],
        'action_points': [
            "Check Section 143(1) Demands: Review all automated tax intimations to see if Section 87A rebate was incorrectly disallowed.",
            "File Rectification u/s 154: Submit a online rectification request on the portal citing the ITAT rulings to correct the calculation.",
            "File Appeal if Needed: If rectification is rejected, file an appeal before the CIT(Appeals) within 30 days of the order."
        ]
    },
    'rsu_esop_itat': {
        'dispute_details': [
            "Facts: Indian employees of multinational corporations received RSUs or ESOPs of foreign parent companies, and faced tax disputes regarding perquisite valuation and double taxation.",
            "Lower Court History: Various ITAT benches resolved disputes on whether the vesting creates taxable perquisite in India, and how Foreign Tax Credit (FTC) is computed.",
            "Key Issues: How to value foreign shares for perquisite tax, and whether failure to report these assets in Schedule FA triggers the Black Money Act penalty."
        ],
        'court_ratio': [
            "Perquisite Taxation: The value of RSUs/ESOPs is taxed as salary perquisite under Section 17(2) based on the FMV of the shares on the date of exercise/vesting.",
            "Foreign Tax Credit (FTC): Under DTAA, employees are entitled to claim credit for taxes paid abroad on the same shares, subject to filing Form 67.",
            "Schedule FA Penalty: Failure to report foreign assets/shares in the ITR triggers a mandatory ₹10 lakh penalty under the Black Money Act, even if no tax was evaded."
        ],
        'key_evidence': [
            "Vesting & Exercise Statements: Documentation showing the number of shares vested, date, and FMV in foreign currency.",
            "Form 16: Salary certificate showing the perquisite value included and taxed in India.",
            "Form 67 & TRC: Proof of tax deducted abroad and treaty residency filings."
        ],
        'action_points': [
            "Declare in Schedule FA: Ensure all foreign shares, RSUs, and stock accounts are reported in Schedule FA of the ITR-2 or ITR-3.",
            "File Form 67 Timely: File Form 67 online before the ITR due date to secure the Foreign Tax Credit and avoid disallowance.",
            "Reconcile FMV: Obtain certified valuation reports for unlisted foreign shares to avoid perquisite valuation disputes."
        ]
    },
    'penalty_reasonable_cause': {
        'dispute_details': [
            "Facts: Taxpayers faced heavy penalties under Section 271(1)(c) (concealment) or Section 270A (underreporting/misreporting) for making incorrect claims in their returns.",
            "Lower Court History: High Courts and the Supreme Court frequently evaluate whether penalty is leviable when the taxpayer acted on a bona fide belief.",
            "Key Issues: Whether penalty can be imposed for a difference in tax interpretation, and what constitutes 'reasonable cause' under Section 273B."
        ],
        'court_ratio': [
            "Reasonable Cause: Under Section 273B, no penalty can be imposed if the taxpayer proves there was a reasonable cause for the default.",
            "Bona Fide Mistake: The Supreme Court held that making an incorrect claim does not amount to concealment or misreporting if all facts were fully disclosed in the ITR.",
            "No Automatic Penalty: SCNs for penalties must clearly specify the exact charge (underreporting vs misreporting) to satisfy the principles of natural justice."
        ],
        'key_evidence': [
            "ITR Disclosures: Complete details of income and exemptions declared in the tax return schedules.",
            "Legal Opinions: Written advice from CAs or tax experts justifying the filing position taken by the taxpayer.",
            "Show-Cause Notices: Penalty notices issued by the AO under Section 274/270A."
        ],
        'action_points': [
            "Disclose All Facts: Ensure all transactions, even if claimed exempt, are disclosed in the relevant schedules of the ITR.",
            "Document Filing Logic: Maintain a file with the legal reasoning, sections, and case laws relied upon when filing the return.",
            "Invoke Section 273B: Submit a response to any penalty show-cause notice explaining the reasonable cause and bona fide belief."
        ]
    },
    'ibc_priority': {
        'dispute_details': [
            "Facts: The tax departments claimed priority over secured creditors for recovery of tax dues from companies undergoing corporate insolvency under the IBC.",
            "Lower Court History: The NCLT and NCLAT confirmed that the IBC overrides other tax laws. The Supreme Court in Ghanashyam Mishra and Rainbow Papers reviewed this.",
            "Key Issues: Whether government tax dues have priority over secured creditors under the waterfall mechanism of Section 53 of the IBC."
        ],
        'court_ratio': [
            "Clean Slate Principle: The Supreme Court in Ghanashyam Mishra held that once a resolution plan is approved, all past tax claims not in the plan stand extinguished.",
            "IBC Supremacy: Section 238 of the IBC overrides the recovery provisions of the CGST Act, Income Tax Act, and other state tax laws.",
            "Waterfall Mechanism: Government dues are placed subordinate to secured creditors and employee dues under Section 53 of the IBC."
        ],
        'key_evidence': [
            "Approved Resolution Plan: NCLT order approving the corporate resolution and listing the creditor payouts.",
            "Claim Form B/C: Copies of the claims submitted by the tax department to the Resolution Professional.",
            "Demand Notices: Tax department notices issued prior to or during the insolvency proceedings."
        ],
        'action_points': [
            "File Claims Promptly: Tax departments must monitor insolvency notices and file their claims within the specified timelines.",
            "Verify Payout Priority: Ensure the resolution plan complies with the waterfall mechanism under Section 53 of the IBC.",
            "Extinguish Old Demands: Update the tax portal to show nil demand once the NCLT approves a resolution plan under the clean slate rule."
        ]
    },
    'software_royalty': {
        'dispute_details': [
            "Facts: Indian companies paid foreign suppliers for software licenses, and the Revenue demanded tax deduction at source (TDS) claiming the payments were 'Royalty'.",
            "Lower Court History: The ITAT and High Courts had divergent views. The Supreme Court in Engineering Analysis Centre consolidated all cases.",
            "Key Issues: Whether payment for off-the-shelf software constitutes royalty for the use of copyright, or business income exempt under the DTAA."
        ],
        'court_ratio': [
            "Copyrighted Article vs Copyright: The Supreme Court held that buying software is a purchase of a copyrighted article, not a transfer of copyright. Thus, it is not royalty.",
            "DTAA Primacy: Under DTAA, business profits are taxable in India only if the foreign supplier has a Permanent Establishment (PE).",
            "Secondment PE: In secondment cases, if the foreign parent retains employment control over deputed staff, it creates a Service PE in India."
        ],
        'key_evidence': [
            "End User License Agreement (EULA): Terms proving that the buyer only got a right to use the software and no copyright transfer occurred.",
            "Secondment Contract: Agreement detailing the role, control, salary reimbursement, and reporting of deputed employees.",
            "Tax Residency Certificate (TRC): Foreign supplier residency documents for DTAA benefits."
        ],
        'action_points': [
            "Review Software Contracts: Ensure agreements specify that the purchase is for a copyrighted article and no copyright is transferred.",
            "Structure Secondment Contracts: Design secondment contracts to show that the Indian subsidiary acts as the real employer of the deputed staff.",
            "Apply DTAA Cautiously: Obtain a TRC and Form 10F from the foreign software supplier before releasing payments without TDS."
        ]
    },
    'general_tax_litigation': {
        'dispute_details': [
            "Facts: Taxpayers faced disputes regarding tax classifications, exemptions, or procedural compliances under direct or indirect tax laws.",
            "Lower Court History: The disputes passed through the Assessing Officer, Commissioner (Appeals), and Appellate Tribunals before reaching the High Courts or Supreme Court.",
            "Key Issues: How to balance statutory tax provisions with business realities, and whether procedural errors can deny substantial tax benefits."
        ],
        'court_ratio': [
            "Substance Over Form: The Supreme Court and High Courts consistently rule that the real substance of a transaction overrides its formal legal labeling.",
            "Statutory Construction: Tax laws must be interpreted strictly based on their plain language; no equity or assumptions can be read into a tax statute.",
            "Bona Fide Actions: Procedural defaults or clerical errors should not lead to disallowance of substantive tax deductions if compliance was substantial."
        ],
        'key_evidence': [
            "ITR and GST Filings: The relevant tax returns, schedules, and calculations filed for the disputed tax periods.",
            "Assessment Orders: The formal orders, show-cause notices, and audit reports issued by the tax authorities.",
            "Statutory Notifications: Active circulars, rules, and portal guidelines issued by the CBDT or CBIC."
        ],
        'action_points': [
            "Maintain Complete Documentation: Keep all transaction contracts, invoices, and payment receipts archived for at least 8 years.",
            "Verify Against Official Portals: Regularly check the GST portal and e-filing portal for any mismatch notifications or outstanding demands.",
            "Obtain Professional Guidance: Consult qualified tax professionals before taking aggressive positions on exemptions or deductions."
        ]
    },
    'pride_foramer': {
        'dispute_details': [
            "Facts: French company Pride Foramer S.A. engaged in offshore oil drilling had ONGC contracts from 1983-1993. Following contract expiry, a 5-year gap (1993-1998) occurred without active Indian operations, leading to deductions being disallowed.",
            "Lower Court History: ITAT allowed deductions during the inactive lull, but the Uttarakhand High Court reversed it, declaring that no active contract and no permanent office meant cessation of business.",
            "Key Issues: Whether a permanent office or active contract (PE) is a prerequisite under domestic law for business connection taxability, and whether a temporary contract gap represents business cessation."
        ],
        'court_ratio': [
            "PE vs Domestic Law: The Supreme Court ruled that a Permanent Establishment (PE) is a treaty-level allocation concept (DTAA) and has no role in determining domestic business connection taxability under Section 9(1)(i).",
            "Lull in Business: A temporary lull or project gap between contracts does not equal business cessation. The key test is whether conduct shows a continuing intent to carry on business.",
            "Deductions & Depreciation: Section 37(1) business expenditure and Section 32(2) carry-forward of unabsorbed depreciation are fully allowable during contractless inactive phases if business intent is shown."
        ],
        'key_evidence': [
            "ONGC Correspondence: Extensive records of bids submitted, negotiations, and tender correspondence during the 1993-1998 gap period.",
            "Tender Documents: Copy of the bid submitted in 1996 for new ONGC projects, proving active pursuit of business contracts.",
            "Administrative Expenses: General ledger entries for legal, professional, and administrative costs incurred during the inactive years."
        ],
        'action_points': [
            "Claim Inactive Deductions: Non-resident oil/gas, EPC, and project contractors can claim Section 37 deductions and carry forward unabsorbed depreciation during inactive contract gaps.",
            "Document Bid Activity: Maintain comprehensive records of local correspondence, bidding, and tender submissions to prove continuous business intent during gaps.",
            "Analyze Treaty PE Rules: Assess if tax exposure is created under domestic law even without a DTAA PE, as PE is not a prerequisite for domestic taxability."
        ]
    },
    'sharp_business': {
        'dispute_details': [
            "Facts: Sharp Business System (joint venture of Sharp Corporation Japan and L&T India) paid L&T ₹3 Crores in AY 2001-02 as a non-compete fee for L&T agreeing not to compete in electronic office products for 7 years.",
            "Lower Court History: The Assessing Officer, CIT(A), ITAT, and Delhi High Court all disallowed the deduction, treating it as capital expenditure that yields an enduring benefit.",
            "Key Issues: Whether a non-compete fee paid to exclude competition is revenue expenditure u/s 37(1) or capital expenditure creating a depreciable intangible asset u/s 32(1)(ii)."
        ],
        'court_ratio': [
            "Revenue Character: The Supreme Court ruled that a non-compete fee is revenue expenditure under Section 37(1) because it does not create any new capital asset or alter the profit-making apparatus.",
            "Negative Covenant: A non-compete right is a negative covenant (right not to do something) that cannot be 'used' in business operations. Thus, it is not an intangible asset eligible for depreciation u/s 32.",
            "Circulating Capital: Payments made to carry on business more efficiently and profitably represent circulating/working capital, even if they yield an enduring business benefit."
        ],
        'key_evidence': [
            "Non-Compete Agreement: Written JV agreement specifying a 7-year restriction period and the ₹3 Crore payout terms.",
            "Business Operations Log: Evidence of L&T's exit from the office products market and Sharp's subsequent market share records.",
            "Financial Statements: P&L entries showing the ₹3 Crore written off in the year of payment rather than being capitalized."
        ],
        'action_points': [
            "Deduct Fees In Full: Claim 100% tax deduction for non-compete fees in the year of payment under Section 37(1) instead of amortizing them.",
            "Avoid Amortization: Do not capitalize non-compete payments as intangible assets or attempt to claim depreciation under Section 32.",
            "Ensure Commercial Context: Structure agreements with clear documentation showing the payout is to improve profitability and protect existing business."
        ]
    },
    'american_express': {
        'dispute_details': [
            "Facts: Non-resident banks American Express Bank Ltd. and Oman International Bank claimed full deduction u/s 37(1) for head office administrative expenses incurred abroad exclusively for their Indian branches.",
            "Lower Court History: The Bombay High Court (relying on Emirates Commercial Bank) allowed full deduction, ruling that the Section 44C ceiling applies only to common shared expenses, not exclusive ones.",
            "Key Issues: Whether the Section 44C ceiling of 5% of adjusted total income applies to all head office expenditure of non-residents, including expenses incurred exclusively for Indian branches."
        ],
        'court_ratio': [
            "Non-Obstante Supremacy: The Supreme Court held that Section 44C is a non-obstante provision overriding Sections 28 to 43A (including Section 37(1)). Once triggered, the 5% ceiling is absolute.",
            "No Common/Exclusive Split: The statutory text of Section 44C makes no distinction between common and exclusive head office expenses. 'Attributable to' includes exclusive India-specific costs.",
            "Tripartite Test: Case remanded to verify if expenditures satisfy the tripartite test: (a) incurred outside India, (b) executive/general admin in nature, (c) falls within Section 44C explanation categories."
        ],
        'key_evidence': [
            "Head Office Accounts: Invoices, salary records, and office rent vouchers showing expenses incurred outside India for Indian branch oversight.",
            "Branch Profit & Loss: Financial statements of the Indian branch showing the debit of head office expenses.",
            "Adjusted Total Income (ATI): The tax computation sheets showing business profits before the head office deduction."
        ],
        'action_points': [
            "Apply 5% Cap Mandatorily: Limit all head office expense deductions—both common and exclusive—to 5% of Adjusted Total Income under Section 44C.",
            "Perform Tripartite Audit: Audit HO expenses to ensure they meet the criteria: incurred abroad, executive/admin in nature, and fall in defined categories.",
            "Evaluate Subsidiaries: Assess converting branches into Indian subsidiaries, as subsidiaries are not subject to Section 44C caps (though normal tax rates apply)."
        ]
    },
    'prosecution_evasion': {
        'dispute_details': [
            "Facts: The Income Tax Department launched prosecution under Section 276C(1) for tax evasion against taxpayers before the ITAT had decided their penalty appeals.",
            "Lower Court History: Various High Courts gave conflicting orders on prosecution timing. The Supreme Court in K. Krishnamurthy resolved the timing and Section 271AAA search penalty conditions.",
            "Key Issues: Whether the Revenue can launch criminal prosecution u/s 276C before penalty appeals are confirmed, and whether Section 271AAA penalty applies if search income is admitted and paid."
        ],
        'court_ratio': [
            "Prosecution Timing Rule: The Supreme Court held that prosecution under Section 276C(1) can be launched only after the concealment penalty is confirmed by the ITAT, in line with CBDT circulars.",
            "No Penalty u/s 271AAA: Taxpayers are exempt from Section 271AAA penalties (for search-disclosed income) if they admit the income, explain its source, and pay tax during proceedings, even with delay.",
            "Cooperation Protection: Active cooperation and tax payment before assessment completion protects the taxpayer from prosecution and maximum penalties."
        ],
        'key_evidence': [
            "ITAT Penalty Appeal Order: Verified records showing whether the ITAT has confirmed, reduced, or deleted the concealment penalty.",
            "Search Seizure Statement: Statement recorded under Section 132(4) admitting undisclosed income and source details.",
            "Challans & Tax Payment: Proof of deposit of tax and interest on the undisclosed search income."
        ],
        'action_points': [
            "Challenge Early Prosecution: Seek a stay or quashing of Section 276C prosecution if the underlying penalty appeal is still pending before the ITAT.",
            "Disclose and Pay During Search: Cooperate during search operations u/s 132(4) by admitting income and paying taxes immediately to claim immunity.",
            "Verify Penalty Status: Monitor the status of CIT(A) and ITAT penalty appeals to ensure they are resolved before dealing with prosecution notices."
        ]
    },
    'ca_negligence_condonation': {
        'dispute_details': [
            "Facts: A partnership firm filed its income tax return late, resulting in disallowance of losses. The delay was caused by the Chartered Accountant's tardy advice on a complex tax issue.",
            "Lower Court History: The CBDT rejected the condonation of delay. The taxpayer filed a Writ Petition (Balaji Landmarks LLP v. CBDT) in the Bombay High Court.",
            "Key Issues: Whether a taxpayer can be denied condonation of delay u/s 119(2)(b) when the delay in filing returns is due to their professional advisor's belated advice."
        ],
        'court_ratio': [
            "No Penalty for CA Fault: The Bombay High Court ruled that a taxpayer should not suffer severe legal disadvantage or penalties due to a bona fide mistake or delay by their CA.",
            "Condonation u/s 119(2)(b): Genuine hardship caused by professional negligence is a valid ground for the CBDT to condone delay in filing returns or forms.",
            "Bona Fide Reliance: Relying on a professional's advice does not represent negligence on the taxpayer's part, especially in complex tax domains."
        ],
        'key_evidence': [
            "CA Affidavit: An official affidavit signed by the CA admitting that the delay was due to their own belated advice and oversight.",
            "Complex Tax Records: Documents showing the complexity of the tax issues under calculation that caused the delay.",
            "Condonation Application: The formal request and tracking number submitted to the CBDT under Section 119(2)(b)."
        ],
        'action_points': [
            "File Condonation u/s 119(2)(b): Submit a formal delay condonation request to the CBDT if return filing was missed due to professional error.",
            "Obtain CA Affidavit: Secure a signed affidavit from the CA explaining the oversight to support the condonation application.",
            "Verify Deadlines Internally: Maintain a calendar of key tax deadlines independent of the CA to avoid interest or loss disallowances."
        ]
    },
    'search_153a_incriminating': {
        'dispute_details': [
            "Facts: Following a search under Section 132, the Assessing Officer reopened past completed assessments under Section 153A and made tax additions based on post-search foreign intelligence reports.",
            "Lower Court History: The ITAT deleted the additions, and the Bombay High Court in PCIT v. Milan Kavin Parikh evaluated the Revenue's appeal.",
            "Key Issues: Whether tax additions can be made in completed assessments under Section 153A without any incriminating material found during the physical search itself."
        ],
        'court_ratio': [
            "Incriminating Material Requirement: The Bombay High Court held that no addition u/s 153A can be made for completed assessments unless incriminating material is found during the search.",
            "Post-Search Intel Excluded: Information received from foreign authorities or third-party statements obtained after the search cannot justify Section 153A additions.",
            "Assessment Scope: In search cases, completed assessments cannot be disturbed unless linked directly to seized physical documents or digital evidence."
        ],
        'key_evidence': [
            "Search Panchnama: The official list of assets, books, and digital media seized during the physical search operations.",
            "AO Assessment Order: Order detailing the additions made u/s 153A and their sources of information.",
            "Post-Search Reports: Correspondence with foreign tax authorities showing information was received after the search date."
        ],
        'action_points': [
            "Review Panchnama Details: Check if the additions made under Section 153A are linked to items listed in the search Panchnama.",
            "Challenge Post-Search Additions: Dispute tax additions based on subsequent third-party statements or post-search investigations.",
            "Track Assessment Status: Verify if the assessment year was completed or pending on the date of search to apply correct legal standards."
        ]
    },
    'trust_form_9a_condonation': {
        'dispute_details': [
            "Facts: A charitable trust failed to file Form 9A (for accumulation of income u/s 11(2)) on time because the bare Act misprint used by the trust showed an incorrect filing deadline.",
            "Lower Court History: The CIT(A) refused to condone the delay and withdrew the trust's tax exemptions. The trust filed a Writ Petition in the Bombay High Court.",
            "Key Issues: Whether a bona fide mistake by a trust caused by a misprint in a commercial bare Act is a valid ground for condoning delay in filing Form 9A."
        ],
        'court_ratio': [
            "Bona Fide Mistake Condoned: The Bombay High Court condoned the delay, ruling that a charitable trust should not lose its tax exemptions due to a printing error in a bare Act.",
            "Exemption Protection: Technical delays in filing Form 9A or Form 10 should be condoned if the trust's activities are genuinely charitable and there was no deliberate omission.",
            "Substantial Justice: Condonation procedures must be applied liberally to ensure substantial justice rather than penalizing taxpayers for minor procedural defaults."
        ],
        'key_evidence': [
            "Misprinted Bare Act Copy: The pages of the commercial publication showing the incorrect deadline for Form 9A.",
            "Form 9A Filing Date: The electronic receipt showing the actual date Form 9A was filed on the e-filing portal.",
            "Trust Audit Report: Form 10B/10BB showing that the trust's income was accumulated for charitable purposes."
        ],
        'action_points': [
            "Condonate Form 9A Delays: Apply for condonation of delay under Section 119(2)(b) if Form 9A/10 was filed late due to bona fide error.",
            "Verify Portal Dates: Re-check filing deadlines directly on the official e-filing portal rather than relying solely on commercial books.",
            "Submit Complete Audit: Ensure Form 10B/10BB is uploaded on time alongside Form 9A to maintain tax-exempt status."
        ]
    },
    'wise_investment_sec68': {
        'dispute_details': [
            "Facts: The Assessing Officer made tax additions u/s 68 on share premium received by a company, relying on the Delhi High Court's NR Portfolio judgment to demand source-of-source verification.",
            "Lower Court History: The ITAT deleted the addition. The Revenue appealed to the Calcutta High Court in PCIT v. Wise Investment Pvt. Ltd.",
            "Key Issues: Whether the strict source-of-source verification required under Section 68 applies universally, even when the taxpayer has proved the identity and genuineness of the investor."
        ],
        'court_ratio': [
            "Onus Discharged: The Calcutta High Court ruled that the NR Portfolio precedent is not applicable where the assessee has successfully proved the investor's identity and creditworthiness.",
            "Section 68 Limits: The taxpayer is not required to prove the source of the source of funds under Section 68 if the primary transaction is verified and shown to be genuine.",
            "Genuineness Test: Share premium additions are invalid if the company provides bank statements, PANs, and tax filings of the investing entities."
        ],
        'key_evidence': [
            "Investor PAN & ITR: Income tax returns and PAN details of the shareholders investing the share premium.",
            "Bank Statement Ledger: Bank records showing the movement of funds through regular banking channels.",
            "Share Allocation Log: Board resolutions and Form PAS-3 showing the allotment of shares."
        ],
        'action_points': [
            "Collect Shareholder KYC: Obtain ITRs, bank statements, and PANs of all shareholders investing in share premium.",
            "Discharge Section 68 Onus: Provide investor tax filings and banking channel proof to prove identity and creditworthiness.",
            "Challenge Unreasonable Onus: Object to additions u/s 68 if the AO demands source-of-source verification despite primary proof being submitted."
        ]
    },
    'maruti_suzuki_non_existent': {
        'dispute_details': [
            "Facts: The Income Tax Department issued a reassessment notice under Section 148 to a company that had already been amalgamated and ceased to exist, or a dissolved HUF.",
            "Lower Court History: The High Courts quashed the notices. The Supreme Court consolidated the principle in CIT v. Maruti Suzuki India Ltd.",
            "Key Issues: Whether a tax notice issued under Section 148 or Section 153A in the name of a non-existent, dissolved, or amalgamated entity is valid under tax laws."
        ],
        'court_ratio': [
            "Void Ab Initio: The Supreme Court held that issuing a notice to a non-existent entity is a jurisdictional defect that makes the notice void ab initio.",
            "Not a Curable Defect: A notice to a dead company or dissolved HUF is not a curable defect under Section 292B of the Income Tax Act.",
            "Jurisdiction Limits: Reassessment proceedings launched without a valid notice to the existing legal entity are null and void."
        ],
        'key_evidence': [
            "ROC Dissolution Order: Certificate of amalgamation or dissolution from the Registrar of Companies showing the date of cessation.",
            "Section 148 Notice: The official notice showing it was addressed to the defunct or amalgamated company.",
            "Intimation Letter: Prior correspondence notifying the Assessing Officer of the amalgamation/dissolution."
        ],
        'action_points': [
            "Notify AO of Amalgamation: Submit the ROC amalgamation or dissolution order to the Assessing Officer immediately upon merger or dissolution.",
            "Challenge Defunct Notices: File writ petitions to challenge Section 148 notices issued to non-existent HUFs or merged companies.",
            "Object u/s 292B: Plead that notices to defunct entities represent a jurisdictional nullity that cannot be cured by Section 292B."
        ]
    },
    'section_50c_circle_rate': {
        'dispute_details': [
            "Facts: A taxpayer sold a commercial land parcel below the circle rate/stamp duty value. The Assessing Officer substituted the stamp duty value for capital gains calculation u/s 50C.",
            "Lower Court History: The CIT(A) upheld the AO's addition. The taxpayer appealed to the ITAT, disputing the valuation and safe harbour margins.",
            "Key Issues: How Section 50C applies when property is sold below circle rate, and whether the 10% safe harbour margin and Valuation Officer reference are mandatory."
        ],
        'court_ratio': [
            "Safe Harbour Margin: ITAT rulings confirmed that if the actual sale price is within 10% of the circle rate, the actual consideration must be accepted u/s 50C.",
            "DVO Reference: The Assessing Officer must refer the property valuation to the District Valuation Officer (DVO) if the taxpayer disputes the circle rate u/s 50C(2).",
            "Valuation Binding: If the DVO determines the fair market value is lower than the circle rate, the DVO's valuation must be substituted for capital gains."
        ],
        'key_evidence': [
            "Sale Deed: Registered transfer deed showing the actual sale price and the stamp duty value assessed by authorities.",
            "DVO Valuation Report: The official valuation report issued by the District Valuation Officer determining the fair market value.",
            "Circle Rate Notification: The circle rate guidelines active in the locality on the date of sale agreement."
        ],
        'action_points': [
            "Apply 10% Safe Harbour: Ensure property sales are within the 10% circle rate margin to avoid automatic Section 50C additions.",
            "Request DVO Reference: Ask the Assessing Officer in writing to refer the property to a Valuation Officer if circle rates exceed actual market value.",
            "Check Grandfathering Rules: For properties bought before July 23, 2024, evaluate grandfathering options under current Finance Act rules."
        ]
    },
    'deemed_dividend_sec2_22_e': {
        'dispute_details': [
            "Facts: A closely-held company advanced loans to a major shareholder (holding >= 10% voting power). The Assessing Officer treated the loan as a deemed dividend u/s 2(22)(e).",
            "Lower Court History: The ITAT deleted the addition because the loan was a temporary trade advance. The Revenue appealed.",
            "Key Issues: What constitutes a loan/advance under Section 2(22)(e) for deemed dividend taxation, and whether temporary or trade credits are exempt."
        ],
        'court_ratio': [
            "Accumulated Profits Limit: Deemed dividend under Section 2(22)(e) is strictly capped to the extent of the company's accumulated profits on the date of loan.",
            "Trade Advances Exempt: Legitimate business transactions, commercial trade advances, or running business accounts are not deemed dividends.",
            "Year-End Repayment: Loans repaid or squared off before the close of the financial year do not trigger deemed dividend taxation (Bombay HC principle)."
        ],
        'key_evidence': [
            "Shareholding Pattern: Official records showing the exact shareholding percentage of the borrower on the loan date.",
            "Ledger Statements: Company ledger accounts showing the transaction flows and trade advance classifications.",
            "Accumulated Profits Ledger: Balance sheets showing the company's reserves and accumulated profits."
        ],
        'action_points': [
            "Square Off Loans: Repay or square off all shareholder loans before March 31st to avoid Section 2(22)(e) deemed dividend tax.",
            "Document Commercial Intent: Maintain commercial agreements for all advances to prove they are genuine trade transactions.",
            "Limit Voting Power: Structure holdings to keep individual shareholding in closely-held companies below 10% to prevent applicability."
        ]
    },
    'bcci_itat_jurisdiction': {
        'dispute_details': [
            "Facts: The ITAT dismissed the Board of Control for Cricket in India's (BCCI) appeal as not maintainable, but then proceeded to pass orders on the merits of the tax disputes.",
            "Lower Court History: The BCCI challenged the ITAT's overstepping of jurisdiction in the Bombay High Court.",
            "Key Issues: Whether the ITAT can decide tax disputes on merits after already ruling that the appeal was not maintainable."
        ],
        'court_ratio': [
            "Jurisdictional Limits: The Bombay High Court held that the ITAT cannot decide appeals on merits once it has concluded that the appeal is not maintainable.",
            "Procedural Validity: Deciding merits after dismissing maintainability is a grave procedural error and exceeds the statutory powers of the ITAT.",
            "Remand for Rehearing: Aggrieved parties are entitled to have their cases remanded for a fresh hearing before a proper bench if jurisdictional boundaries are crossed."
        ],
        'key_evidence': [
            "ITAT Appeal Order: The official order showing both the dismissal on maintainability and the findings on merits.",
            "Bombay HC Writ Appeal: Writ petition filings challenging the ITAT's procedural overstep.",
            "BCCI Registration Records: Trust and registration documents disputing the tax department's jurisdiction."
        ],
        'action_points': [
            "Challenge Maintainability Dismissals: Object if any tribunal attempts to pass rulings on merits after declaring an appeal non-maintainable.",
            "Apply for Fresh Hearing: Request a remand of the appeal to a new bench of the ITAT if the previous order exceeded jurisdictional bounds.",
            "Document Procedural Defaults: Record all procedural oversteps during tribunal hearings to support subsequent High Court writ petitions."
        ]
    }
}

def get_case_study_type(slug):
    slug_lower = slug.lower()
    
    # 1. FAQ pages are never court case studies (they always have 15 FAQs)
    if slug_lower.startswith('faq-'):
        return None
        
    # 2. Check for strong case indicators or specific case names
    strong_case_markers = [
        'judgment', 'ruling', 'case-law', 'court', 'supreme-court', 'landmark', 
        'itat', 'hc-ruling', 'sc-order', 'sc-judgment', 'hc-judgment', 
        'appeal-ruling', 'tribunal-ruling', 'case-study'
    ]
    specific_case_names = [
        'hyatt', 'safari-retreats', 'yasho-industries', 'aberdare', 'brij-systems', 
        'suncraft', 'vidya-drolia', 'mrityunjay', 'singh-construction', 'b-braun', 
        'gameskraft', 'junglee-games', 'rajeev-bansal', 'tola-vs', 'ashish-agarwal', 
        'vkc-footsteps', 'blackstone', 'essar-steel', 'jsw-steel', 'ghanashyam-mishra',
        'pride-foramer', 'sharp-business', 'american-express', 'k-krishnamurthy',
        'balaji-landmarks', 'milan-kavin-parikh', 'milan-parikh', 'form-9a-misprint',
        'wise-investment', 'maruti-suzuki', 'circle-rate', 'deemed-dividend-section-2-22-e',
        'bcci-bombay-hc'
    ]
    
    has_strong_marker = any(m in slug_lower for m in strong_case_markers)
    has_specific_name = any(n in slug_lower for n in specific_case_names)
    
    # Check for versus patterns (e.g. x-vs-y) accompanied by a general case keyword
    has_vs = 'vs-' in slug_lower
    case_keywords = ['case', 'judgment', 'ruling', 'order', 'versus', 'sc-', 'hc-', 'itat', 'appeal', 'dispute', 'litigation', 'decision']
    is_vs_case = has_vs and any(ck in slug_lower for ck in case_keywords)
    
    # Must have at least one of these to be classified as a case study
    if not (has_strong_marker or has_specific_name or is_vs_case):
        return None

    # Now assign the specific case type (new cases checked first)
    if 'pride-foramer' in slug_lower:
        return 'pride_foramer'
    if 'sharp-business' in slug_lower:
        return 'sharp_business'
    if 'american-express' in slug_lower:
        return 'american_express'
    if any(k in slug_lower for k in ['prosecution', '276c', '271aaa', 'krishnamurthy']):
        return 'prosecution_evasion'
    if any(k in slug_lower for k in ['balaji-landmarks', 'ca-negligence', 'ca-fault', 'ca-mistake', 'ca-advice']):
        return 'ca_negligence_condonation'
    if any(k in slug_lower for k in ['milan-kavin-parikh', 'milan-parikh', '153a']):
        return 'search_153a_incriminating'
    if any(k in slug_lower for k in ['form-9a', 'form9a', 'form-9a-misprint']):
        return 'trust_form_9a_condonation'
    if any(k in slug_lower for k in ['wise-investment', 'nr-portfolio']):
        return 'wise_investment_sec68'
    if any(k in slug_lower for k in ['maruti-suzuki', 'non-existent-entity', 'non-existent-company']):
        return 'maruti_suzuki_non_existent'
    if any(k in slug_lower for k in ['50c', 'circle-rate', 'stamp-duty-value']):
        return 'section_50c_circle_rate'
    if any(k in slug_lower for k in ['deemed-dividend-section-2-22-e', '2-22-e', '222e']):
        return 'deemed_dividend_sec2_22_e'
    if any(k in slug_lower for k in ['bcci', 'itat-jurisdiction']):
        return 'bcci_itat_jurisdiction'

    if 'hyatt' in slug_lower or 'pe-ruling-india' in slug_lower or 'pe-india-ruling' in slug_lower:
        return 'hyatt_pe'
    if any(k in slug_lower for k in ['safari-retreats', 'yasho-industries', 'aberdare', 'brij-systems', 'itc-denied', 'bonafide-error', 'suncraft', 'vidya-drolia', 'mrityunjay', 'singh-construction', 'b-braun', 'substance-over-form', '16-4', '16-5']):
        return 'safari_itc'
    if any(k in slug_lower for k in ['gameskraft', 'junglee-games', 'dream11', 'fantasy-sports', 'rummy-28', 'poker-28', 'gaming-industry', 'gaming-tax']):
        return 'gameskraft_gaming'
    if any(k in slug_lower for k in ['rajeev-bansal', 'tola-vs', 'ashish-agarwal', 'reassessment-148', '148a', 'reassessment-limitation', 'faceless-reassessment']):
        return 'rajeev_bansal_tola'
    if 'vkc-footsteps' in slug_lower or 'inverted-duty' in slug_lower:
        return 'vkc_inverted'
    if 'blackstone' in slug_lower or 'dispute-trc' in slug_lower or 'trc-foreign' in slug_lower:
        return 'blackstone_trc'
    if '87a' in slug_lower:
        return 'section_87a_stcg'
    if 'rsu' in slug_lower or 'esop' in slug_lower:
        return 'rsu_esop_itat'
    if any(k in slug_lower for k in ['penalty', '271', '270a', 'natural-justice']):
        return 'penalty_reasonable_cause'
    if any(k in slug_lower for k in ['ibc-sc', 'essar-steel', 'jsw-steel', 'ghanashyam-mishra', 'government-dues-subordinate', 'personal-guarantor-ibc']):
        return 'ibc_priority'
    if any(k in slug_lower for k in ['engineering-analysis', 'software-royalty', 'apple-india', 'oracle-india', 'sap-india', 'cloud-computing', 'secondment-pe', 'samsung-heavy']):
        return 'software_royalty'
    return 'general_tax_litigation'

def map_file_to_sub_template(filename):
    fn = filename.lower()
    
    # -1. Supreme Court Case Study
    if get_case_study_type(filename):
        return 'supreme_court_case_study'

    # 0. GST Appeals, Notices & Disputes
    if 'gst' in fn and re.search(
        r'appeal|notice|demand|scn|drc-0|drc0|asmt-|asmt\d+|pre-deposit|gstat|show-cause|adjudication|invalid-notice',
        fn
    ) and 'notice-period' not in fn:
        return 'gst_appeals_notices'
    fn = filename.lower()
    
    # 1. Tax Reassessment, Notices & General IT Admin
    if re.search(
        r'\b148\b|\b147\b|reassessment|scrutiny|notice|demand|\b143-1\b|\b143-2\b|stay-of-demand|notice-148|rectification|\b154\b|\b144\b|best-judgment|penalty|tax-evasion|escaping|assessment|appeal|dispute|order|'
        r'circular|notification|challan|cbdt|cbic|refund|finance-bill|budget|surcharge|marginal-relief|\b234b\b|\b234c\b|interest|revision-petition|\b264\b|\b245\b|defective-return|\b139-9\b|e-verification|vivad-se-vishwas|'
        r'raja-benoy-kumar|sugar-mill|partial-integration|urban-farmland|rule-133-3c|rule-86a|it-act-2025|section-numbers|july-2026|return-filing|tax-payer|pan-card|aadhaar|it-services-safe-harbour|safe-harbour-it-services|'
        r'income-from-business|income-from-house|home-loan|hra-|new-regime|july-31|when-to-hire-a-ca|itat|\b15g\b|\b15h\b|non-compete-fee|carry-forward-losses|\bmat\b|mat-credit|mat-finality|\b115bab\b|\b14a\b|\b337\b|\b64-2\b|clubbing|section-68|cash-credit|'
        r'form-115|form-99',
        fn
    ):
        return 'tax_reassessment_notices'
        
    # 2. Commission/Brokerage TDS
    if re.search(r'\b194h\b|commission|brokerage', fn):
        return 'tds_commission_brokerage'
        
    # 3. Capital Gains, Investment Exemptions & Asset Valuations
    if re.search(
        r'capital-gain|ltcg|stcg|\b54ec\b|\b54f\b|property-sale|gold-tax|mutual-fund|sgb|sovereign-gold|capital-loss|indexation|circle-rate|stamp-duty|\b50c\b|agricultural-land|land-conversion|population-criteria|\b8km\b|conversion|'
        r'crypto|bitcoin|vda|section-509|section-54|section-56|gift|elss|nsc-interest|sukanya-samriddhi|ulip|life-insurance-5-lakh|grandfathering-equity|cost-inflation-index|indexed-cost|written-down-value|block-of-assets|depreciation-rates|goodwill-depreciation|rule-11ua-valuation|section-56-2-viib|angel-tax|'
        r'aggregate-premium|sbi-mis|rule-11ua|'
        r'fno-loss|fo-losses|fo-turnover|stt|kunwar-trivikram',
        fn
    ):
        return 'capital_gains_exemptions'
        
    # 4. NGO/Trust Compliance
    if re.search(r'ngo|trust|\b12a\b|\b12ab\b|\b80g\b|fcra|donation|charitable|religious|darpan|csr|section-8|rnpo|\b2-15\b|commercial-threshold|form-10ab', fn):
        return 'ngo_trust_compliance'
        
    # 5. GST Appeals, Rulings & GST Operations
    if re.search(
        r'aar|aaar|appellate-ruling|advance-ruling|ruling|profiteering|anti-profiteering|'
        r'gstin-structure|hsn-code|place-of-supply|e-invoice|irn-qr-code|eway-bill|isd|input-service-distributor|cross-charge|itc-04|job-work|itc-on-construction|itc-on-motor|demo-vehicles-itc|blocked-itc|section-17-5|composite-vs-mixed|principal-supply|principal-job-worker|qrmp-scheme|rcm|reverse-charge|gstat|cbic-circular|cbse-affiliation-services|hotel-restaurant-7500|restaurant-composition|restaurant-input-tax|goods-on-approval|milk-to-cheese|sad-refund|duty-drawback|fta-preferential|origin|customs|import|export|iec|icegate|bill-of-entry|shipping-bill|trade|anti-dumping|dumping|advance-authorization|authorization|dgft|epcg|'
        r'ims|ecrs|itc-denied|classification-case|operations-test|countervailing|ecommerce-seller|rfd-11|lut-filing|pre-shipment|rodtep|coaching-institute|tin-registration|\bitc\b|itc-|inverted-duty',
        fn
    ):
        return 'aar_aaar_rulings'
        
    # 6. LRS & TCS Remittance
    if re.search(r'lrs|remittance|tcs|forex|swiggy|zomato|foreign-transfer|sending-money-abroad|form-118', fn):
        return 'lrs_tcs_remittance'
        
    # 7. DTAA, NRI Compliance & International Tax
    if re.search(
        r'dtaa|double-tax|nri|schedule-fa|foreign-asset|foreign-share|beps|base-erosion|transfer-pricing|arms-length|associated-enterprise|'
        r'equalisation-levy|oecd-pillar-two|rnor-status|nro-to-nre|nro-nre-1-million|permanent-establishment|significant-economic-presence|sep-|apa-rollback|unilateral-vs-bilateral-apa|master-file|local-file|multi-year-block-alp|safe-harbour-form-49|safe-harbour-it-services|country-by-country-reporting|fdi-|focc-downstream|odi-|rbi-odi|gift-city|ifsc-unit|'
        r'equalization-levy|fast-ds|fema|form-10f|form-13-|form-141|form-145|form-146|form-15ca|form-15cb|form-a2|black-money|specified-domestic|stpi|softex|tpe-caution|section-9|range-concept|tolerance-band|form-56|3ceb|inr-payment',
        fn
    ):
        return 'dtaa_nri_compliance'
        
    # 8. Presumptive Taxation & Freelancers
    if re.search(r'\b44ad\b|\b44ada\b|\b44ae\b|presumptive|freelancer|content-creator|influencer|fiverr-invoices|home-office-deduction|platform-fee|business-expense-documentation|content-creation|freelancing-is-a-valid', fn):
        return 'presumptive_taxation'
        
    # 9. Audit, UDIN, Financial Certifications & CFO
    if re.search(
        r'audit|udin|statutory-audit|tax-audit|mr-3|secretarial-audit|caro|accountant|ca-|ca-in|auditor|balance-sheet|bookkeep|accounting|aqmm|peer-review|ledger|books-of-accounts|tally|zoho|bad-debts|empanelment|acca|icai|'
        r'net-worth-certificate|utilization-certificate|turnover-certificate|tender-revenue-certificate|certificate-of-origin|working-capital-certificate|'
        r'virtual-cfo|cfo|kpi-dashboard|mis-dashboard|mis-reporting|budget-preparation|budgeting-forecasting|cash-flow-management|financial-modeling|business-plan|project-report|cma-data|co-lending|consortium-lending|loan-documentation|loan-restructuring|loan-syndication|term-loan|cgtmse|mudra-loan|digital-lending|digital-loan|lending-service|lsp|npa-90-day|npa-classification|npa-resolution|one-time-settlement|willful-defaulter|debt-recovery|debt-rejection|bank-loan|loan-rejection|collateral-valuation|bank-fraud|asset-tracing|embezzlement|vendor-fraud|whistleblower|fraud|investigation|tracing|appraisal|valuation-report|valuation-services|asset-inventory-valuation|intangible-asset-valuation|brand-valuation|goodwill-valuation|dcf-valuation|business-valuation|registered-valuer|fair-value|fixed-asset-register|union-bank|deloitte|cox-and-kings|cisa-disa|rbi-2026|rbi-april-2026|rbi-asset-classification|rbi-fraud|rbi-master|rbi-ucn|npa-|nbfc|borrowing|ecb|risk-assurance|risk-control|'
        r'ind-as|internal-financial-controls|ifc-|investment-banking|project-financing|banks-reject|forensic|rbi-para|rbi-directions|section-247|\b269ss\b|\b269st\b|\b40a-3\b|\b43b-h\b|quickbooks|'
        r'credit-rating|tender-revenue-validation|\bvaluation\b|valuation-|government-tender|stock-statement|loan-recovery|multi-regulator',
        fn
    ):
        return 'audit_udin_compliance'
        
    # 10. Trademark & IP Compliance
    if re.search(r'trademark|patent|copyright|ipr|ip-valuation|objection-reply|brand-name|logo|design-registration|deceptive-similarity|prior-user|google-ads-infringement', fn):
        return 'trademark_ip_compliance'
        
    # 11. Salary, Allowances, PF, labor codes & Employment HR
    if re.search(
        r'salary|allowance|payroll|pf|epf|ctc|form-16|pay-slip|salary-slip|gratuity|bonus|provident|esi|professional-tax|annuity|pension|superannuation|employee-benefit|'
        r'posh|she-box|icc-internal|digital-harassment|retaliation-protection|labor-codes|retrenchment|severance|wrongful-termination|constructive-dismissal|workman|probation|esop|rsu|vesting|cliff|flexible-benefit|standard-deduction|rent-free|group-mediclaim|full-and-final|f&f|form-12b|form-130|employer-obligations|ghost-employee|'
        r'labour-codes|ptrc|ptec|section-10-|80e|80d|parents-health|senior-citizen|chapter-vi-a|stock-appreciation|'
        r'employees-enrolment|medical-deduction|nps-tier|perquisites-taxable',
        fn
    ):
        return 'salary_allowances_pf'
        
    # 12. Legal, NCLT, Insolvency, Wills & Corporate Law
    if re.search(
        r'nclt|nclat|ibc|court|insolvency|liquidation|strike-off|closure|benami|legal|adhiniyam|evidence-act|nyaya|civil|arbitration|contract|agreement|nda|sha|board-resolution|board-meeting|partnership|proprietorship|startup|llp|roc|mca|director|incorporation|udyam|msme|fssai|shop-establishment|dividend|shareholder|guarantor|clause|dilution|housing|\b80eea\b|'
        r'sebi|insider-trading|takeover-code|drhp|rights-issue|qip|sme-ipo|mainboard-ipo|ipo-merchant|ipo-readiness|material-subsidiary|related-party-transaction|mgt-14|dir-8|private-company-deemed|spice-plus|cooperative-society|opc-annual|pvt-ltd-annual|annual-compliance|annual-general-meeting|agm-video|mutuality|calcutta-club|cap-table|debenture|ccd|ccps|convertible|capital-structure|capital-contribution|rera|carpet-area|built-up|will|succession|probate|estate-succession|intestate-succession|gift-deed|family-settlement|mediation|drt|debt-recovery-tribunal|nfra|national-financial-reporting|committee-of-creditors|coc-|cirp|resolution-professional|resolution-plan|ibbi|society-maintenance|decriminalisation|companies-amendment|corporate-laws-amendment|corporate-representation|indemnity|limitation-of-liability|hindware-grohe|biocon|tambe|sat-case|sebi-case|sat-order|sat-appeal|sebi-order|avitel|hsbc|foreign-award|pc-jeweller|sunil-choudhary|x-vs-sahitya|'
        r'amfi-registration-arn|arn-|ccfs|due-diligence|company-secretary|digital-advertiser|dpiit|huf-|\bhuf\b|private-school|society-maintenance|business-registration|charge-search|clinical-establishment|cloud-kitchen|family-office|life-cycle-funds|investment-fund|wealth-management|portfolio-overlap|liquor-license|restaurant-licensing|nursing-home|occupation-certificate|real-estate-project|creditor|stressed-asset|euthanasia|pli-scheme|production-linked|pmla|private-limited-vs-opc|small-company-threshold|safe-note|term-sheet|managerial-remuneration|total-expense-ratio|tribunal|upsi|virtual-data-room|'
        r'digital-signature|case-law|real-estate-developer|section-29a|section-34|arbitral-award|letters-of-administration|merger-timeline|reverse-book-building',
        fn
    ):
        return 'legal_nclt_insolvency'
        
    return None

def parse_topic(filename, content):
    h1_match = re.search(r'<h1>(.*?)<br>', content, re.I) or re.search(r'<h1>(.*?)</h1>', content, re.I)
    if h1_match:
        topic = h1_match.group(1).strip()
        topic = re.sub(r'<[^>]+>', '', topic)
        topic = re.sub(r'^(faq|faq\s+|blog|blog\s+)', '', topic, flags=re.I).strip()
        topic = topic.lstrip(':- ').strip()
    else:
        topic = filename.replace('faq-', '').replace('blog-', '').replace('.html', '').replace('-', ' ').title()
    topic = re.sub(r'\s+', ' ', topic).strip()
    return topic

def get_dynamic_faqs(sub_template_name, topic):
    # Standard generic fallbacks if not matched
    q1 = f"What is the regulatory framework and applicability of {topic} in India?"
    a1 = f"Under Indian laws, {topic} is governed by specific compliance rules, tax guidelines, or corporate regulations. Businesses and individuals must verify applicability thresholds and timelines to avoid interest or penalties."
    q2 = f"What are the key compliance requirements or deadlines for {topic}?"
    a2 = f"Compliance for {topic} requires maintaining accurate transaction records, filing necessary returns (such as ITR or GST) before the specified due dates, and obtaining professional certification if statutory thresholds are exceeded."

    if sub_template_name == 'tax_reassessment_notices':
        q1 = f"What is the significance of {topic} in tax reassessment and scrutiny notices?"
        a1 = f"Under the Income Tax Act, {topic} often relates to scrutiny assessments or reassessment proceedings. If a notice is received, taxpayers must reconcile their filed ITRs and AIS records immediately."
        q2 = f"How should a taxpayer respond to a notice regarding {topic}?"
        a2 = f"For notices involving {topic}, a detailed reply along with supporting documents (bank statements, computations) must be submitted online on the e-filing portal within the specified timeline (usually 15-30 days)."
    elif sub_template_name == 'capital_gains_exemptions':
        q1 = f"How does {topic} impact capital gains taxation and exemptions in India?"
        a1 = f"Capital gains or transactions relating to {topic} are subject to specific holding periods and tax rates (such as LTCG at 12.5% or STCG). Reinvestment exemptions under Section 54 or 54F may be claimed subject to rules."
        q2 = f"What tax planning options are available for gains on {topic}?"
        a2 = f"Tax planning for {topic} involves offsetting capital losses, investing in Section 54EC capital gains bonds, or depositing unutilized gains in the Capital Gains Account Scheme (CGAS) before the ITR deadline."
    elif sub_template_name == 'ngo_trust_compliance':
        q1 = f"What are the key registration and compliance requirements for an NGO or trust involved in {topic}?"
        a1 = f"Charitable trusts or societies working on {topic} must obtain registrations under Section 12AB (for income tax exemption) and Section 80G (for donor tax deductions) from the Income Tax Department."
        q2 = f"What annual filings are mandatory for trusts working with {topic}?"
        a2 = f"NGOs dealing with {topic} must file their annual statement of donations in Form 10BD by May 31st, submit audit reports in Form 10B/10BB, and file their annual return in Form ITR-7 by October 31st."
    elif sub_template_name == 'aar_aaar_rulings':
        q1 = f"How does GST classification, rates, or Input Tax Credit (ITC) apply to {topic}?"
        a1 = f"GST applicability on {topic} depends on its HSN classification and whether it is a supply of goods or services. Input Tax Credit (ITC) can be claimed on business purchases unless blocked under Section 17(5)."
        q2 = f"Can a taxpayer seek an Advance Ruling (AAR) for GST issues related to {topic}?"
        a2 = f"Yes, if there is ambiguity regarding GST rates or registration requirements for {topic}, the taxpayer can file an application before the Authority for Advance Ruling (AAR) to obtain a legally binding decision."
    elif sub_template_name == 'lrs_tcs_remittance':
        q1 = f"What are the LRS remittance limits and TCS rules for outward transfers involving {topic}?"
        a1 = f"Foreign remittances for {topic} under the Liberalised Remittance Scheme (LRS) are subject to a USD 250,000 limit. Tax Collected at Source (TCS) applies at rates up to 20% on transactions exceeding ₹7 lakh."
        q2 = f"What documents are required to execute a foreign remittance for {topic}?"
        a2 = f"Remitting funds abroad for {topic} requires submitting Form A2 and a valid PAN to the authorized dealer bank, along with supporting invoices, agreements, or foreign institutional details."
    elif sub_template_name == 'dtaa_nri_compliance':
        q1 = f"How do DTAA provisions and NRI tax compliance apply to income from {topic}?"
        a1 = f"Under Double Taxation Avoidance Agreements (DTAA), NRIs can claim lower withholding tax (TDS) rates on income from {topic} by submitting a Tax Residency Certificate (TRC) and Form 10F online."
        q2 = f"What are the reporting requirements for residents holding foreign assets related to {topic}?"
        a2 = f"Resident taxpayers holding foreign shares, bank accounts, or investments related to {topic} must disclose them in Schedule FA (Foreign Assets) of their ITR to avoid heavy Black Money Act penalties."
    elif sub_template_name == 'presumptive_taxation':
        q1 = f"Can small businesses or professionals declare presumptive tax on income from {topic}?"
        a1 = f"Yes, eligible taxpayers can opt for presumptive taxation under Section 44AD (businesses declaring 6% or 8% profit) or Section 44ADA (professionals declaring 50% profit) for income from {topic}."
        q2 = f"What are the benefits of opting for presumptive tax for {topic}?"
        a2 = f"Opting for presumptive tax for {topic} exempts the taxpayer from maintaining detailed books of accounts under Section 44AA and undergoing a tax audit under Section 44AB, saving compliance costs."
    elif sub_template_name == 'audit_udin_compliance':
        q1 = f"What are the audit and accounting requirements for businesses dealing with {topic}?"
        a1 = f"Businesses involving {topic} must maintain proper books of accounts under Section 44AA. A tax audit under Section 44AB is mandatory if turnover exceeds ₹1 crore (or ₹10 crore for digital operations)."
        q2 = f"Why is a UDIN mandatory for CA certifications related to {topic}?"
        a2 = f"All CA-certified financial statements, net worth certificates, or audit reports for {topic} must carry a Unique Document Identification Number (UDIN) generated on the ICAI portal to be legally valid."
    elif sub_template_name == 'trademark_ip_compliance':
        q1 = f"How can a business protect its intellectual property, brand name, or logo for {topic}?"
        a1 = f"A business can file a trademark application (Form TM-A) under the relevant Nice classification class to protect its brand name, logo, or slogan associated with {topic}."
        q2 = f"What is the process and validity of patent or copyright protection for {topic}?"
        a2 = f"Patents for innovative products related to {topic} are valid for 20 years. Original literary, software, or artistic works can be registered under the Copyright Act, lasting for the author's lifetime plus 60 years."
    elif sub_template_name == 'salary_allowances_pf':
        q1 = f"How should salary components, allowances, and EPF be structured for employees working in {topic}?"
        a1 = f"Salary structures for {topic} should optimize Basic, HRA, and allowances to reduce tax liability. Employee EPF contributions are mandatory at 12% of basic pay if the company has 20 or more employees."
        q2 = f"What are the tax deductions and rules for retirement benefits in the context of {topic}?"
        a2 = f"Employees in {topic} can claim HRA exemption under the Old Regime, while standard deduction (₹75,000 under the New Regime) and tax-free gratuity up to ₹20 lakh apply under rules."
    elif sub_template_name == 'legal_nclt_insolvency':
        q1 = f"What legal procedures, ROC compliance, or NCLT litigation apply to {topic}?"
        a1 = f"Corporate disputes, mergers, or insolvency proceedings related to {topic} fall under the jurisdiction of the National Company Law Tribunal (NCLT). Statutory compliance must align with Companies Act rules."
        q2 = f"How are corporate agreements and contracts structured for {topic}?"
        a2 = f"Legal contracts for {topic} (such as Shareholder Agreements, NDAs, or Partnership deeds) must have clear dispute resolution clauses, correct stamp duties, and be executed legally under the Indian Contract Act."
    elif sub_template_name == 'tds_commission_brokerage':
        q1 = f"What are the TDS rates, sections, and thresholds applicable to commission or brokerage on {topic}?"
        a1 = f"Under Section 194H, TDS is deducted at 5% on payments for commission or brokerage related to {topic} if the aggregate annual payment exceeds the threshold limit of ₹15,000."
        q2 = f"What is the penalty for default or delay in TDS compliance for {topic}?"
        a2 = f"Failure to deduct or deposit TDS on {topic} on time attracts interest at 1% or 1.5% per month, late filing fees of ₹200 per day under Section 234E, and disallowance of expenses."

    return (q1, a1), (q2, a2)

def process_file(file_path):
    filename = file_path.name
    content = file_path.read_text(encoding="utf-8")
    
    # 1. Try standard grid boundaries first
    grid_start_pattern = re.compile(r'<div class="wi-rich-grid">\s*<div>')
    aside_start_pattern = re.compile(r'</div>\s*<aside[^>]*>')
    
    m_grid = grid_start_pattern.search(content)
    m_aside = aside_start_pattern.search(content)
    
    is_alternate_layout = False
    
    if m_grid and m_aside:
        idx_grid = m_grid.end()
        idx_aside = m_aside.start()
    else:
        # 2. Try alternate layout FAQ boundaries
        faq_section_pattern = re.compile(r'<section class="lp-section">\s*<div class="lp-section-eyebrow">(?:FAQ|Questions People Ask)</div>.*?<\/section>', re.S)
        m_faq = faq_section_pattern.search(content)
        if m_faq:
            is_alternate_layout = True
            idx_faq_start = m_faq.start()
            idx_faq_end = m_faq.end()
        else:
            print(f"Skipping {filename} (layout boundaries not found)")
            return False
            
    # Check category and subtopic
    category = get_category_for_file(filename)
    subtopic = get_subtopic_for_file(filename)
    
    sub_template = None
    # Select FAQs and Panels based on filename overrides
    if filename == 'blog-buyback-proceeds-deemed-dividend.html':
        faqs = get_buyback_faqs()
        panels_html = get_buyback_guide_content()
    elif filename == 'blog-pf-withdrawal-taxability-complete-guide.html':
        faqs = get_pf_withdrawal_faqs()
        panels_html = get_pf_withdrawal_guide_content()
    elif filename == 'blog-section-43b-msme-payment-rule.html':
        faqs = get_msme_faqs()
        panels_html = get_msme_guide_content()
    elif filename in ['blog-new-income-tax-act-2025.html', 'blog-income-tax-act-2025-section-mapping.html']:
        faqs = get_new_act_faqs()
        panels_html = get_new_act_guide_content()
    elif filename in ['blog-what-replaced-equalization-levy.html', 'blog-why-india-scrapped-the-google-tax.html']:
        faqs = get_eq_levy_faqs()
        panels_html = get_eq_levy_guide_content()
    elif filename in ['blog-unlisted-shares-24-month-ltcg-trap.html', 'blog-unlisted-shares-ltcg-india-2026.html', 'blog-unlisted-shares-tax-india-2026.html']:
        faqs = get_unlisted_shares_faqs()
        panels_html = get_unlisted_shares_guide_content()
    elif subtopic == 'ais_tis_26as':
        faqs = get_ais_tis_faqs()
        panels_html = get_ais_tis_guide_content()
    elif subtopic == 'salary_allowances':
        faqs = get_salary_allowances_faqs()
        panels_html = get_salary_allowances_guide_content()
    elif subtopic == 'crypto_vda':
        faqs = get_crypto_vda_faqs()
        panels_html = get_crypto_vda_guide_content()
    elif subtopic == 'gaming_lottery':
        faqs = get_gaming_lottery_faqs()
        panels_html = get_gaming_lottery_guide_content()
    else:
        sub_template = map_file_to_sub_template(filename)
        if sub_template == 'supreme_court_case_study':
            faqs = []
            case_type = get_case_study_type(filename)
            if not case_type:
                case_type = 'general_tax_litigation'
            panels = case_study_panels[case_type]
            panels_html = ""
            p_details = {
                'eyebrow': 'Dispute Details',
                'title': 'Facts & Lower Court History',
                'items': panels['dispute_details']
            }
            p_ratio = {
                'eyebrow': 'Court Ratio',
                'title': 'Legal Principles & Ratio Decidendi',
                'items': panels['court_ratio']
            }
            p_evidence = {
                'eyebrow': 'Key Evidence',
                'title': 'Agreements & Filings Evaluated',
                'items': panels['key_evidence']
            }
            p_action = {
                'eyebrow': 'Action Points',
                'title': 'Practical Mitigation & Compliance Steps',
                'items': panels['action_points']
            }
            panels_html += generate_panel_html(p_details)
            panels_html += generate_panel_html(p_ratio)
            panels_html += generate_panel_html(p_evidence)
            panels_html += generate_panel_html(p_action)
        elif sub_template:
            tpl = SUB_TEMPLATES[sub_template]
            topic = parse_topic(filename, content)
            dynamic_faq1, dynamic_faq2 = get_dynamic_faqs(sub_template, topic)
            faqs = []
            for idx, (q, a) in enumerate(tpl['faqs']):
                if idx == 0:
                    q, a = dynamic_faq1
                elif idx == 1:
                    q, a = dynamic_faq2
                else:
                    if idx < 3:
                        q = q.replace('{topic}', topic)
                        a = a.replace('{topic}', topic)
                faqs.append((q, a))
            panels_html = ""
            for panel in tpl['panels']:
                p_data = {
                    'eyebrow': panel['eyebrow'],
                    'title': panel['title'],
                    'items': [item.replace('{topic}', topic) for item in panel['items']]
                }
                panels_html += generate_panel_html(p_data)
        else:
            cat_data = categories[category]
            faqs = cat_data['faqs']
            panels_html = ""
            for panel in cat_data['panels']:
                panels_html += generate_panel_html(panel)
            
    # Dynamic Country-Specific NRI TDS adjustments
    country_info = get_country_specific_info(filename, content)
    if country_info and sub_template != 'supreme_court_case_study':
        adjusted_faqs = []
        has_nri_q = False
        has_dtaa_q = False
        for q, a in faqs:
            if ("double tax avoidance" in q.lower() or "dtaa" in q.lower()) and not has_dtaa_q:
                q = f"How does the double tax avoidance agreement (DTAA) help NRI investors residing in the {country_info['country']}?"
                a = country_info['dtaa_desc'] + " Submitting a TRC and Form 10F online to the Indian Income Tax Department is mandatory to claim these benefits."
                has_dtaa_q = True
            elif ("nri" in q.lower() or "non-resident" in q.lower()) and ("tds" in q.lower() or "withholding" in q.lower() or "rate" in q.lower()) and not has_nri_q:
                q = f"What is the TDS rate on payments made to Non-Resident Indians (NRIs) residing in the {country_info['country']}?"
                a = country_info['tds_desc'] + " A Tax Residency Certificate (TRC), Form 10F, and an Indian PAN are mandatory to claim this benefit."
                has_nri_q = True
            adjusted_faqs.append((q, a))
            
        # If the page didn't have these questions, append them to the end
        if not has_nri_q:
            adjusted_faqs.append((
                f"What is the TDS rate on payments made to NRIs residing in the {country_info['country']}?",
                country_info['tds_desc'] + " A Tax Residency Certificate (TRC), Form 10F, and an Indian PAN are mandatory to claim this benefit."
            ))
        if not has_dtaa_q:
            adjusted_faqs.append((
                f"How does the double tax avoidance agreement (DTAA) help NRI investors residing in the {country_info['country']}?",
                country_info['dtaa_desc'] + " Submitting a TRC and Form 10F online to the Indian Income Tax Department is mandatory to claim these benefits."
            ))
            
        # Maintain exactly 15 FAQs total
        if len(adjusted_faqs) > 15:
            adjusted_faqs = adjusted_faqs[:13] + adjusted_faqs[-2:]
        faqs = adjusted_faqs
        
        # Replace general NRI bullet in buyback guide if USA/Singapore etc. is specified
        if filename == 'blog-buyback-proceeds-deemed-dividend.html':
            old_bullet = "<li><strong>DTAA Treaty Benefits</strong>: NRIs can claim lower tax rates under Double Taxation Avoidance Agreements (DTAA) between India and their country of residence. For example, under the India-US DTAA, the withholding tax rate on dividends is typically capped at 15% or 25%. Under the India-Singapore or India-Mauritius DTAAs, the rate is capped at 10% or 15%.</li>"
            new_bullet = f"<li><strong>DTAA Treaty Benefits for residents of the {country_info['country']}</strong>: {country_info['dtaa_desc']}</li>"
            panels_html = panels_html.replace(old_bullet, new_bullet)

    if not is_alternate_layout:
        faq_html = generate_html_faqs(faqs) if sub_template != 'supreme_court_case_study' else ""
        new_main_content = "\n" + panels_html + "\n" + faq_html + "\n"
        
        before_grid = content[:idx_grid]
        after_aside = content[idx_aside:]
        updated_content = before_grid + new_main_content + after_aside
    else:
        # Alternate layout: just replace the FAQ section and keep original custom sections
        new_faq_html = generate_grid_faq_html(faqs) if sub_template != 'supreme_court_case_study' else ""
        before_faq = content[:idx_faq_start]
        after_faq = content[idx_faq_end:]
        updated_content = before_faq + new_faq_html + after_faq

    # Retrieve metadata dictionary and run head/hero replacements
    meta = get_premium_metadata(filename, category, subtopic)
    full_title = meta['title']
    if not full_title.endswith(" | WorkIndex"):
        full_title += " | WorkIndex"
        
    updated_content = re.sub(
        r'<title>.*?</title>',
        f'<title>{html.escape(full_title)}</title>',
        updated_content
    )
    updated_content = re.sub(
        r'<meta name="description" content="[^"]*"\s*/?>',
        f'<meta name="description" content="{html.escape(meta["meta_desc"], quote=True)}"/>',
        updated_content
    )
    updated_content = re.sub(
        r'<meta property="og:title" content="[^"]*"\s*/?>',
        f'<meta property="og:title" content="{html.escape(full_title, quote=True)}"/>',
        updated_content
    )
    updated_content = re.sub(
        r'<meta property="og:description" content="[^"]*"\s*/?>',
        f'<meta property="og:description" content="{html.escape(meta["meta_desc"], quote=True)}"/>',
        updated_content
    )
    
    canonical_url = f"https://workindex.co.in/seo-pages/{filename}"
    updated_content = re.sub(
        r'<link rel="canonical" href="[^"]*"\s*/?>',
        f'<link rel="canonical" href="{canonical_url}"/>',
        updated_content
    )
    updated_content = re.sub(
        r'<meta property="og:url" content="[^"]*"\s*/?>',
        f'<meta property="og:url" content="{canonical_url}"/>',
        updated_content
    )
    
    updated_content = re.sub(
        r'<div class="lp-breadcrumb">\s*<a href="/">WorkIndex</a>\s*<span>/</span>\s*<span>.*?</span>\s*</div>',
        f'<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>{html.escape(meta["title"])}</span></div>',
        updated_content,
        flags=re.S
    )
    
    updated_content = re.sub(
        r'<div class="lp-hero-eyebrow">(?:<div class="lp-hero-eyebrow-dot"></div>)?\s*.*?\s*</div>',
        f'<div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>{html.escape(meta["eyebrow"])}</div>',
        updated_content,
        flags=re.S
    )
    
    updated_content = re.sub(
        r'<h1>.*?</h1>\s*<p>.*?</p>',
        f'<h1>{html.escape(meta["h1"])}<br><span>{html.escape(meta["subtitle"])}</span></h1>\n<p>{html.escape(meta["hero_desc"])}</p>',
        updated_content,
        flags=re.S
    )
        
    # Check for visible fact check status (Mandatory check for ITR/Tax/TDS pages)
    if not re.search(r'Last fact-checked|Official fact-check status', updated_content, re.I):
        # Inject fact-check status into lp-hero-trust if present
        if '<div class="lp-hero-trust">' in updated_content:
            updated_content = updated_content.replace(
                '<div class="lp-hero-trust">',
                '<div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: 2026-06-24</div>'
            )
        elif '<div class="lp-hero-trust"><div class="lp-trust-item">' in updated_content:
            updated_content = updated_content.replace(
                '<div class="lp-hero-trust"><div class="lp-trust-item">',
                '<div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: 2026-06-24</div><div class="lp-trust-item">'
            )
            
    # Update Schema
    schema_pattern = r'<script type="application/ld\+json">(.*?)</script>'
    m_schema = re.search(schema_pattern, updated_content, re.S)
    if m_schema:
        original_schema = m_schema.group(1)
        new_schema = update_schema_metadata(original_schema, filename, full_title, meta["meta_desc"], faqs)
        updated_content = updated_content.replace(original_schema, new_schema)
        
    # Special adjustment for buyback page fact-check status text
    if filename == 'blog-buyback-proceeds-deemed-dividend.html':
        updated_content = updated_content.replace('Last fact-checked: 2026-06-24', 'Last fact-checked: 2026-06-24 | Official-source verified')
        
    file_path.write_text(updated_content, encoding="utf-8")
    return True

def main():
    blog_files = [f for f in seo_dir.iterdir() if f.is_file() and f.name.startswith('blog-') and f.name.endswith('.html')]
    print(f"Found {len(blog_files)} blog pages to process.")
    
    success_count = 0
    for f in blog_files:
        if process_file(f):
            success_count += 1
            
    print(f"Successfully updated {success_count} / {len(blog_files)} blog pages.")

if __name__ == '__main__':
    main()
