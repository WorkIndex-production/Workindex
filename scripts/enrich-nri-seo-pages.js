const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SEO_DIR = path.join(ROOT, 'seo-pages');
const TODAY = '18 June 2026';

const cityInfo = {
  bangalore: { name: 'Bangalore', display: 'Bengaluru', state: 'Karnataka', context: 'Bengaluru is home to many NRI tech professionals with global ESOPs, RSUs, double taxation relief (DTAA) queries, and property investments in high-growth zones.' },
  chennai: { name: 'Chennai', display: 'Chennai', state: 'Tamil Nadu', context: 'Chennai has a large NRI diaspora, especially in the US and Gulf countries, seeking tax consultation on ancestral property sales, NRO/NRE account setup, and capital repatriation.' },
  delhi: { name: 'Delhi', display: 'Delhi', state: 'Delhi NCR', context: 'Delhi NCR sees significant NRI activity in luxury real estate transactions, Lower TDS Certificates (Section 197), and CA certified Form 15CA/15CB for capital repatriation.' },
  hyderabad: { name: 'Hyderabad', display: 'Hyderabad', state: 'Telangana', context: 'Hyderabad has a massive NRI community investing in agricultural lands, commercial properties, and seeking specialized CA advisory on Section 54/54EC exemptions.' },
  india: { name: 'India', display: 'India', state: 'National', context: 'Our national network of chartered accountants assists NRIs across the globe with Indian tax residency tests, online DTAA claims, and compliance filing.' },
  kochi: { name: 'Kochi', display: 'Kochi', state: 'Kerala', context: 'Kerala has one of the highest densities of NRIs, particularly from the Gulf (GCC), USA, and UK, requiring expertise in NRE account interest exemption, rent TDS under Section 195, and gift tax rules.' },
  mumbai: { name: 'Mumbai', display: 'Mumbai', state: 'Maharashtra', context: 'Mumbai real estate is a prime destination for NRI investment, necessitating specialized CA assistance for TDS on property sales under Section 195, and Form 10F filing.' },
  pune: { name: 'Pune', display: 'Pune', state: 'Maharashtra', context: 'Pune tech hubs and residential projects draw NRIs who require support with returning-NRI tax planning, ESOP taxation, and NRO account conversion compliance.' },
  ahmedabad: { name: 'Ahmedabad', display: 'Ahmedabad', state: 'Gujarat', context: 'Ahmedabad has a prominent NRI base from the USA and UK, focusing on stock market capital gains, mutual fund investments, and gift tax exemptions under Section 56(2).' },
  kolkata: { name: 'Kolkata', display: 'Kolkata', state: 'West Bengal', context: 'Kolkata NRIs seek advisory on inheritance tax, sale of ancestral properties, Section 197 Lower TDS certificates, and NRO savings interest.' }
};

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function list(items) {
  return `<ul class="wi-detail-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function table(rows, heads = ['Topic', 'Current verified position', 'What to check']) {
  return `<table class="wi-table"><thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

function panel(eyebrow, heading, body) {
  return `<section class="wi-panel"><div class="lp-section-eyebrow">${eyebrow}</div><h2>${heading}</h2>${body}</section>`;
}

function getCategory(slug) {
  if (slug.includes('residency-test') || slug.includes('residential-status') || slug.includes('section-6') || slug.includes('resident-vs-nri') || slug.includes('status-determination') || slug.includes('returning-nri') || slug.includes('rnor')) {
    return 'residency';
  }
  if (slug.includes('property-tds') || slug.includes('property-sale') || slug.includes('rental-income') || slug.includes('section-195') || slug.includes('section-197') || slug.includes('lower-deduction') || slug.includes('section-54') || slug.includes('property-tax') || slug.includes('tan-requirement') || slug.includes('two-house-rule')) {
    return 'property';
  }
  if (slug.includes('dtaa') || slug.includes('double-taxation') || slug.includes('form-10f') || slug.includes('tax-residency-certificate')) {
    return 'dtaa';
  }
  if (slug.includes('savings-account') || slug.includes('account-conversion') || slug.includes('repatriation') || slug.includes('remittance') || slug.includes('gift') || slug.includes('fema') || slug.includes('form-145') || slug.includes('form-144')) {
    return 'accounts';
  }
  if (slug.includes('stock-market') || slug.includes('mutual-fund') || slug.includes('capital-gains') || slug.includes('equity') || slug.includes('sukanya') || slug.includes('ppf') || slug.includes('esop')) {
    return 'investments';
  }
  for (const city of Object.keys(cityInfo)) {
    if (slug.includes(`services-${city}`) || slug.includes(`taxation-services-${city}`) || slug.includes(`property-tax-services-${city}`)) {
      return 'location';
    }
  }
  return 'general';
}

function getContent(category, title, slug) {
  let matchedCity = null;
  let cityObj = null;
  if (category === 'location') {
    for (const city of Object.keys(cityInfo)) {
      if (slug.includes(city)) {
        matchedCity = city;
        cityObj = cityInfo[city];
        break;
      }
    }
    if (!cityObj) {
      cityObj = cityInfo.india;
    }
  }

  switch (category) {
    case 'residency':
      return {
        panels: [
          panel('Official residency rules', 'Section 6 Residency Status Criteria (AY 2026-27)', 
            `<p>Determining whether an individual qualifies as a Non-Resident Indian (NRI) or Resident but Not Ordinarily Resident (RNOR) is governed by Section 6 of the Income-tax Act, 1961. Use this verified guide to check physical stay rules.</p>` +
            table([
              ['Resident & Ordinarily Resident (ROR)', 'Stay of 182 days or more in India during the FY, OR stay of 60 days or more in the FY AND 365 days or more in the 4 preceding FYs.', 'Global income is taxable in India under Section 5.'],
              ['Non-Resident Indian (NRI)', 'Stay of less than 182 days in India during the FY (and does not meet the 60 days + 365 days test).', 'Only income received, accrued, or deemed to receive/accrue in India is taxable.'],
              ['Indian Citizen / PIO Visitor Exception', 'The 60-day threshold is extended to 182 days if Indian-sourced income is up to Rs. 15 Lakh, and to 120 days if Indian-sourced income exceeds Rs. 15 Lakh.', 'If stay is between 120 and 181 days, they are classified as RNOR.'],
              ['Deemed Resident (Section 6(1A))', 'Indian citizen with Indian-sourced income > Rs. 15 Lakh who is not liable to tax in any other country. Automatically RNOR.', 'Foreign income is not taxable in India. Only Indian-sourced income is taxed.']
            ], ['Residential category', 'Stay criteria in India (FY)', 'Taxation impact'])
          ),
          panel('Important residency checks', 'What a serious tax expert should verify', list([
            "Physical stay day-wise log based on passport entry and exit stamps (both arrival and departure days count as full days).",
            "Financial Year basis: Days of stay must be calculated on a Financial Year basis (April 1 to March 31) and not the Calendar Year.",
            "RNOR (Resident but Not Ordinarily Resident) benefits: Active if non-resident in 9 out of 10 preceding years, OR stay in India <= 729 days in 7 preceding years.",
            "Transition under Income Tax Act, 2025: Verify if new definitions affect Tax Year 2026-27 stay requirements."
          ])),
          panel('Required documentation', 'Documents to prepare for verification', list([
            "Passport (all pages with entry/exit stamps for the last 5 financial years).",
            "FCCS / residency proof in the foreign country.",
            "Annual Information Statement (AIS) and Form 26AS to track Indian income transactions.",
            "Detailed day count excel sheet reconciling passport stamps."
          ]))
        ],
        faq: [
          ['How is the number of days of stay in India calculated?', 'The calculation is based on actual physical stay in India during the financial year (April 1 to March 31). Both the day of arrival and day of departure in India are counted as full days of stay.'],
          ['What is the deemed residency rule under Section 6(1A)?', 'Introduced in the Finance Act, an Indian citizen is deemed a resident of India if their Indian-sourced income exceeds Rs. 15 Lakh and they are not liable to tax in any other country by reason of domicile, residence or similar criteria. They are classified as RNOR.'],
          ['Is global income taxable for an RNOR in India?', 'No. Resident but Not Ordinarily Resident (RNOR) individuals are taxed in India only on Indian-sourced income (received or accrued in India) and income from a business controlled or profession set up in India. Their foreign-sourced income is exempt.']
        ]
      };

    case 'property':
      return {
        panels: [
          panel('Property tax & TDS rates', 'TDS on NRI Property Sale & Rental Income (Section 195)',
            `<p>TDS on payments to NRIs is governed by Section 195 of the Income-tax Act, 1961. Unlike resident transactions, there are no basic exemption thresholds for NRI TDS.</p>` +
            table([
              ['TDS on Rent (Section 195)', '31.2% TDS (30% tax + 4% cess) applied to gross rental income.', 'No basic limit of Rs. 2.4 Lakh. Tenant must obtain a TAN to deduct and deposit this tax.'],
              ['LTCG Property Sale TDS', '20.8% TDS (20% tax + 4% cess + applicable surcharge) on gross sale value.', 'Applies if the property was held for more than 24 months. Indexation rules apply based on acquisition date.'],
              ['STCG Property Sale TDS', '30.9% to 42.74% TDS on gross sale value depending on the slab.', 'Applies if the property was held for 24 months or less.'],
              ['Lower TDS Certificate (Section 197)', 'Application via Form 13 on the e-filing portal to reduce TDS rate.', 'Enables the buyer to deduct TDS only on the actual capital gains rather than the total sale value.']
            ], ['Transaction type', 'TDS Rate & applicability', 'Key requirement'])
          ),
          panel('NRI property sale rules', 'Capital gains exemptions and buyer obligations', list([
            "No 50 Lakh Threshold: Unlike resident property sales where TDS is 1% under Section 194-IA (only if sale > 50 Lakh), NRI property sales are subject to TDS on the entire sale price under Section 195.",
            "Section 54 Exemption: NRI can save LTCG tax by investing in another residential house property in India (capped at Rs. 10 Crore).",
            "Section 54EC Exemption: NRI can save LTCG tax by investing in NHAI/REC capital gains bonds within 6 months of sale (capped at Rs. 50 Lakh).",
            "Buyer TAN Obligation: The buyer must obtain a TAN to deduct NRI TDS under Section 195 and file Form 27Q quarterly."
          ])),
          panel('Required documentation', 'Documents for property sale or rent tax filings', list([
            "Purchase deed and date of acquisition.",
            "Sale agreement / sale deed draft.",
            "Cost of improvement details (renovation, building, etc. with invoices).",
            "Form 13 Lower TDS certificate (if obtained).",
            "TAN certificate of the buyer or tenant."
          ]))
        ],
        faq: [
          ['What is the TDS rate when buying a property from an NRI?', 'The TDS rate is 20.8% for Long-Term Capital Gains (held > 24 months) and 30.9% (or higher depending on surcharge) for Short-Term Capital Gains, deducted on the total sale consideration.'],
          ['How can an NRI seller avoid high TDS on property sales?', 'The NRI seller can apply online for a Lower TDS Certificate under Section 197 using Form 13 on the e-filing portal. This directs the buyer to deduct tax only on the estimated capital gains instead of the entire sale price.'],
          ['Does a tenant have to deduct TDS when renting from an NRI landlord?', 'Yes. Under Section 195, the tenant must deduct TDS at 31.2% on the gross rent, irrespective of the rent amount. The tenant must also obtain a TAN (Tax Deduction and Collection Account Number) to deposit the tax.']
        ]
      };

    case 'dtaa':
      return {
        panels: [
          panel('DTAA relief rules', 'DTAA Relief, Tax Residency Certificate (TRC) & Form 10F',
            `<p>NRIs can claim tax treaty relief under Section 90 of the Income-tax Act, 1961 to avoid double taxation on income earned in India and their home country.</p>` +
            table([
              ['DTAA Lower Tax Rates', 'Withholding rates reduced to 10% to 15% on interest, dividends, royalties, and professional fees.', 'Rate depends on the specific country treaty (e.g. India-USA, India-UK, India-UAE).'],
              ['Tax Residency Certificate (TRC)', 'Mandatory certificate issued by the foreign government tax authority.', 'Primary proof of residency required under Section 90(4) to claim treaty benefits.'],
              ['Form 10F', 'Mandatory online form filed on the Indian e-filing portal.', 'Required if the TRC does not contain all details required under Section 90(4). Must be filed electronically.']
            ], ['DTAA item', 'Treaty relief and rules', 'Mandatory condition'])
          ),
          panel('DTAA claim checklist', 'How to claim tax treaty benefits safely', list([
            "Obtain the physical or digital TRC from your country of residence for the relevant financial year.",
            "Submit Form 10F online via the e-filing portal. Physical Form 10F is no longer accepted for PAN holders.",
            "Report the foreign income and DTAA relief claim explicitly in Schedule FSI and Schedule TR of the ITR.",
            "Verify that the lower DTAA rate is applied by the bank for NRO account interest (reduced from 30% to 15% or 12.5%)."
          ])),
          panel('Required documentation', 'Keep these ready before filing', list([
            "Tax Residency Certificate (TRC) for the current financial year.",
            "Form 10F online filing confirmation.",
            "Passport and visa/residency status copy.",
            "NRO account interest certificates and TDS certificates."
          ]))
        ],
        faq: [
          ['What is a Tax Residency Certificate (TRC)?', 'A TRC is an official certificate issued by the tax department of the country where the NRI resides, confirming that they are a tax resident of that country for the specified year.'],
          ['When is Form 10F required?', 'Form 10F is required under Section 90(4) when claiming DTAA benefits in India, if the TRC issued by the foreign government does not contain all mandatory details (such as nationality, tax identification number, period of residency, etc.).'],
          ['Can an NRI claim DTAA relief for NRO account interest?', 'Yes. Under most DTAA treaties (e.g., India-USA, India-UK), the TDS rate on NRO bank interest is reduced from the standard 30% to 15% (or 12.5% depending on the treaty) upon submitting the TRC and Form 10F.']
        ]
      };

    case 'accounts':
      return {
        panels: [
          panel('FEMA & bank accounts', 'NRE vs NRO vs FCNR Account Rules (AY 2026-27)',
            `<p>Operating bank accounts in India for NRIs is regulated under FEMA and the Income-tax Act, 1961. Resident accounts must be converted upon gaining NRI status.</p>` +
            table([
              ['NRE (Non-Resident External) Account', 'Fully exempt from tax under Section 10(4)(ii). Interest is not taxable in India.', 'Fully and freely repatriable. Held in Indian Rupees.'],
              ['NRO (Non-Resident Ordinary) Account', 'Fully taxable in India at standard slab rates. Subject to 30.9% TDS under Section 195.', 'Repatriation limited to USD 1 Million per financial year under FEMA.'],
              ['FCNR(B) Account', 'Fully exempt from tax in India for NRIs and RNORs.', 'Fully and freely repatriable (held in foreign currency).']
            ], ['Account type', 'Tax treatment in India', 'Repatriation rules'])
          ),
          panel('Outbound repatriation & FEMA compliance', 'Form 15CA & Form 15CB rules', list([
            "Account Conversion Requirement: Operating a standard resident savings account after becoming an NRI is a FEMA violation. Accounts must be converted to NRO.",
            "USD 1 Million Repatriation Limit: NRIs can repatriate up to USD 1 Million per financial year from their NRO account (e.g. from property sales or inheritance).",
            "Form 15CA & 15CB: Mandatory for NRO outward remittances. Form 15CA is a self-declaration, and Form 15CB is a Chartered Accountant certificate verifying tax clearance.",
            "Gift Tax (Section 56(2)(x)): Gifts received from resident relatives are tax-free, but gifts to non-relatives exceeding Rs. 50,000 are fully taxable."
          ])),
          panel('Required documentation', 'Keep these ready before remitting funds', list([
            "NRE/NRO interest certificates for the financial year.",
            "Source of funds proof (property sale deed, bank deposits, inheritance copy).",
            "Tax clearance proofs / challans.",
            "Draft Form 15CA and CA-certified Form 15CB."
          ]))
        ],
        faq: [
          ['Is interest earned on NRE accounts taxable in India?', 'No. Interest earned on Non-Resident External (NRE) accounts is fully exempt from income tax in India under Section 10(4)(ii).'],
          ['What is the maximum limit for repatriating funds from an NRO account?', 'Under RBI and FEMA guidelines, an NRI can repatriate up to USD 1 Million per financial year from their NRO account, subject to payment of applicable taxes and filing of Forms 15CA and 15CB.'],
          ['Can an NRI continue to hold a resident savings account in India?', 'No. Under FEMA regulations, once an individual\'s status changes to non-resident, they must convert their resident bank accounts to Non-Resident Ordinary (NRO) accounts. Operative resident accounts are illegal for NRIs.']
        ]
      };

    case 'investments':
      return {
        panels: [
          panel('Investment tax rates', 'Equity, Mutual Fund & Debt Tax Rates (AY 2026-27)',
            `<p>Taxation on NRI investments is governed by standard capital gains schedules, with specific withholding tax rates applied at source by brokers and mutual funds.</p>` +
            table([
              ['LTCG on Equity / Equity Mutual Funds', '12.5% tax on capital gains exceeding Rs. 1.25 Lakh. No indexation.', 'Applies if held for more than 12 months (Section 112A).'],
              ['STCG on Equity / Equity Mutual Funds', '20% tax on short-term capital gains.', 'Applies if held for 12 months or less (Section 111A).'],
              ['LTCG on Unlisted Shares / Property', '12.5% tax without indexation.', 'Applies if held for more than 24 months (Section 112).'],
              ['Debt Mutual Funds & Fixed Deposits', 'Taxed at standard slab rates. Fixed deposits TDS is 30.9% under Section 195.', 'Debt funds acquired on/after 1 April 2023 do not get LTCG benefits.']
            ], ['Investment type', 'Tax rate in India', 'Key condition'])
          ),
          panel('NRI investment restrictions', 'PIS, PPF, and Sukanya Samriddhi rules', list([
            "PIS (Portfolio Investment Scheme): NRIs must invest in Indian equities through a designated PIS account or Non-PIS account for mutual funds.",
            "PPF Account Restriction: NRIs cannot open a new PPF account. Existing PPF accounts can continue until maturity (15 years) on a non-repatriable basis, but cannot be extended.",
            "Sukanya Samriddhi Yojana (SSY): NRIs are strictly barred from opening or maintaining an SSY account for a girl child once their residency status changes.",
            "Mutual Fund FATCA: NRIs in USA/Canada must verify exchange restrictions before buying mutual funds in India."
          ])),
          panel('Required documentation', 'Documents to prepare for capital gains return', list([
            "Broker Capital Gains summary statement showing purchase date, purchase price, sale date, and sale price.",
            "PIS bank account statements showing transaction logs.",
            "Form 26AS/AIS showing mutual fund TDS credits.",
            "Mutual fund holding summaries."
          ]))
        ],
        faq: [
          ['What is the capital gains tax rate on equity for NRIs?', 'Long-term capital gains (held > 12 months) are taxed at 12.5% on gains exceeding Rs. 1.25 Lakh. Short-term capital gains (held <= 12 months) are taxed at 20% under Section 111A.'],
          ['Can an NRI invest in PPF or Sukanya Samriddhi Yojana?', 'No, NRIs are prohibited from opening new PPF or SSY accounts. However, if a resident had a PPF account before becoming an NRI, they can continue to deposit funds into it until its maturity on a non-repatriable basis.'],
          ['How does an NRI trade in the Indian stock market?', 'NRIs must route their equity market transactions through a Portfolio Investment Scheme (PIS) bank account as per RBI regulations, or use Non-PIS accounts for mutual fund transactions.']
        ]
      };

    case 'location':
      return {
        panels: [
          panel('NRI tax compliance', `NRI Taxation & Compliance Services in ${cityObj.display}`,
            `<p>${cityObj.context} NRIs must comply with Indian direct tax stay rules, account conversion requirements, and TDS rules.</p>` +
            table([
              ['Tax Filing Requirement', 'Mandatory if Indian gross income exceeds Rs. 3 Lakh (new regime) or Rs. 2.5 Lakh (old regime).', 'Required to claim refund of excess TDS deducted on bank interest or rent.'],
              ['Account Conversion', 'Mandatory conversion of resident savings account to NRO account.', 'Failure to convert accounts is a FEMA violation.'],
              ['TDS on property sale / rent', 'Buyers or tenants of NRI properties must deduct TDS under Section 195.', 'TDS on rent is 31.2%. TDS on property sale is 20.8% (LTCG) or 30.9% (STCG).']
            ], ['Compliance item', 'Requirement details', 'Why it matters'])
          ),
          panel(`Local expert support in ${cityObj.display}`, 'Specialized Chartered Accountant assistance', list([
            `Verify NRI/RNOR residential status using passport stamp day logs for the financial year.`,
            `Prepare and file Form 13 on the e-filing portal to obtain a Lower TDS Certificate under Section 197.`,
            `Issue CA-certified Form 15CB and prepare Form 15CA for outbound repatriation of capital (up to USD 1 Million per year).`,
            `Claim DTAA relief benefits (Form 10F online filing) to reduce TDS rates on Indian income.`
          ])),
          panel('Documents to keep ready', 'Keep these ready before hiring', list([
            "Passport copy showing all pages and stamps.",
            "NRE/NRO interest certificates and TDS certificates (Form 16A).",
            "Property purchase and sale deeds (for capital gains cases).",
            "Tax Residency Certificate (TRC) and online Form 10F."
          ]))
        ],
        faq: [
          [`How do I find NRI tax consultants in ${cityObj.display}?`, `Post your requirement on WorkIndex. Verified Chartered Accountants in ${cityObj.display} specializing in NRI taxation, FEMA rules, and double tax treaty claims will review the scope and provide quotes.`],
          ['Is interest earned on NRE accounts taxable in India?', 'No. Interest earned on Non-Resident External (NRE) accounts is fully exempt from income tax in India under Section 10(4)(ii).'],
          ['What forms are needed for outward remittance from an NRO account?', 'Remitting funds from an NRO account (e.g. sale proceeds of inherited property) requires filing Form 15CA online and obtaining a CA-certified Form 15CB verifying tax compliance.']
        ]
      };

    default: // general
      return {
        panels: [
          panel('General NRI taxation', 'NRI Income Tax Slabs & Mandatory Return Filing (AY 2026-27)',
            `<p>NRIs must file income tax returns in India if their gross Indian-sourced taxable income exceeds the basic exemption limit, or if they wish to claim TDS refunds.</p>` +
            table([
              ['Basic Exemption Limit', 'Rs. 2.5 Lakh under the Old regime, and Rs. 3 Lakh under the default New regime.', 'NRIs must pay tax on any income exceeding this limit. Slabs apply normally.'],
              ['Section 87A Rebate Exclusion', 'NRIs are NOT eligible for the Section 87A rebate.', 'The zero-tax result up to Rs. 7 Lakh or Rs. 12 Lakh is only for resident individuals.'],
              ['ITR Form Selection', 'ITR-2 is standard for NRI salary, property, and capital gains. ITR-3 applies if business/profession income exists.', 'NRIs are strictly barred from using the simplified ITR-1 form.'],
              ['Taxable Income scope', 'Includes Indian salary, rent from property in India, NRO interest, and capital gains on Indian assets.', 'Foreign-sourced income is completely exempt from tax in India.']
            ], ['ITR topic', 'Tax rules for NRIs', 'Key requirement'])
          ),
          panel('Core NRI tax rules', 'Important compliance checks for NRIs', list([
            "Physical stay rules: Verify if stay in India was less than 182 days (and does not meet 60 days + 365 days test) to confirm NRI status.",
            "TDS on NRI Payments: TDS is deducted under Section 195 on all payments to NRIs (rent TDS is 31.2%, property sale TDS is 20.8% LTCG / 30.9% STCG on gross value).",
            "NRE/NRO Account Setup: Interest on NRE and FCNR accounts is tax-free in India. NRO interest is fully taxable and subject to 30.9% TDS.",
            "DTAA Claims: NRIs can submit a Tax Residency Certificate (TRC) and file Form 10F online to reduce Indian TDS rates under tax treaties."
          ])),
          panel('Required documentation', 'Documents to prepare for NRI tax filing', list([
            "Passport copy showing all pages with entry/exit stamps.",
            "NRE and NRO interest certificates and Form 16A TDS certificates.",
            "Form 16 from Indian employers (if salaried in India).",
            "Demat capital gains statement and transaction summaries.",
            "Tax Residency Certificate (TRC) and Form 10F (for DTAA claims)."
          ]))
        ],
        faq: [
          ['Does an NRI get the Section 87A rebate?', 'No. The Section 87A rebate (which provides zero tax up to Rs. 7 Lakh or Rs. 12 Lakh in the new regime) is only available to resident individuals. NRIs must pay tax if their income exceeds the basic exemption limit.'],
          ['Which ITR form should an NRI file?', 'NRIs must use ITR-2 for salary, house property, capital gains, and other sources. If they have business or professional income in India, they must file ITR-3. NRIs cannot use ITR-1.'],
          ['What are the criteria under which an NRI must file an ITR in India?', 'An NRI must file an ITR if their total gross income in India (before deductions) exceeds the basic exemption limit (Rs. 2.5 Lakh under the old regime, Rs. 3 Lakh under the default new regime for AY 2026-27), or if they want to claim a refund for excess TDS.']
        ]
      };
  }
}

function getFactCheckPanel(title) {
  return panel(
    'Official fact-check status',
    `${title}: year and source check`,
    `<p><strong>Last fact-checked:</strong> ${TODAY}.</p>` +
    `<p>AY 2026-27 means FY 2025-26 income and is filed under the Income-tax Act, 1961. Tax Year 2026-27 means FY 2026-27 income under the Income Tax Act, 2025. Do not mix the two.</p>` +
    `<p>Verify stay days, TRC validity, DTAA rates, NRO interest, and Form 15CA/15CB requirements against official CBDT guidelines, notifications, and portal utilities before taking a filing position.</p>`
  );
}

function getFaqPanel(faq) {
  return panel(
    'Questions people ask',
    'FAQs',
    faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')
  );
}

function extractTitle(html, filename) {
  const match = html.match(/<title>(.*?)\s*\|?\s*WorkIndex<\/title>/i);
  return match ? match[1].trim() : filename.replace(/\.html$/, '').replace(/-/g, ' ');
}

function extractCanonical(html, filename) {
  const match = html.match(/<link rel="canonical" href="([^"]+)"/i);
  return match ? match[1].trim() : `https://workindex.co.in/seo-pages/${filename}`;
}

function generateFullPage({ slug, title, canonical, content, panels }) {
  const newPanels = panels.join('\n');
  const relatedLinks = [
    ["NRI Taxation Guide", "/seo-pages/nri-taxation-complete-guide-2026.html"],
    ["DTAA Relief Guide", "/seo-pages/dtaa-india-usa-nri-guide.html"],
    ["Property Sale TDS", "/seo-pages/nri-property-tds-buyer-obligations.html"],
    ["Account Conversion", "/seo-pages/nri-savings-account-conversion-guide.html"]
  ].filter(([label, href]) => !href.includes(slug))
   .map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
  
  const schemaObj = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://workindex.co.in/#organization", name: "WorkIndex", url: "https://workindex.co.in" },
      { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: `${title} | WorkIndex` },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "WorkIndex", item: "https://workindex.co.in" },
        { "@type": "ListItem", position: 2, name: title, item: canonical }
      ] },
      { "@type": "FAQPage", mainEntity: content.faq.map(([q, a]) => ({
        "@type": "Question",
        "name": q,
        "acceptedAnswer": { "@type": "Answer", text: a }
      })) }
    ]
  };

  return `<!DOCTYPE html><html lang="en-IN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)} | WorkIndex</title><meta name="description" content="${esc(title)} in India. Check facts, documents, official portals, deadlines and expert brief before hiring on WorkIndex."/><link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${esc(title)} | WorkIndex"/><meta property="og:description" content="${esc(title)} in India. Check facts, documents, official portals, deadlines and expert brief before hiring on WorkIndex."/><meta property="og:url" content="${canonical}"/><meta property="og:type" content="website"/>
<link rel="icon" type="image/png" href="/favicon.png"/><link rel="stylesheet" href="/lp-styles.css"/>
<style>.wi-rich{padding:56px 24px;max-width:1160px;margin:0 auto}.wi-rich-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:28px;align-items:start}.wi-panel{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:28px;box-shadow:var(--shadow)}.wi-panel+.wi-panel{margin-top:20px}.wi-panel h2{font-size:24px;margin:0 0 14px}.wi-panel h3{font-size:17px;margin:18px 0 8px}.wi-panel p{color:var(--text-muted);font-size:15px;margin:0 0 12px;line-height:1.75}.wi-detail-list{margin:10px 0 0 18px;color:var(--text-muted);font-size:15px;line-height:1.75}.wi-detail-list li{margin-bottom:7px}.wi-side{position:sticky;top:82px}.wi-table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}.wi-table th,.wi-table td{border:1px solid var(--border);padding:11px;text-align:left;vertical-align:top}.wi-table th{background:var(--bg-gray);font-weight:800}.wi-ref a,.wi-related a{display:block;color:var(--primary);font-weight:800;text-decoration:none;margin:8px 0}@media(max-width:860px){.wi-rich-grid{grid-template-columns:1fr}.wi-side{position:static}}</style>
<script type="application/ld+json">${JSON.stringify(schemaObj)}</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script><meta name="google-adsense-account" content="ca-pub-2627739469695660"></head>
<body class="landing">
<main class="wi-rich">
<div class="lp-breadcrumb"><a href="/">WorkIndex</a><span>/</span><span>${esc(title)}</span></div>
<section class="lp-hero"><div class="lp-hero-eyebrow"><div class="lp-hero-eyebrow-dot"></div>Compliance guide</div><h1>${esc(title)}<br><span>India-specific preparation guide</span></h1><p>${esc(title)} needs current-law checks, portal verification, documents and a precise brief before you compare experts on WorkIndex.</p><a href="/?signup=true&role=client" class="lp-hero-cta">Post Your Requirement - Free</a><div class="lp-hero-trust"><div class="lp-trust-item">Last fact-checked: ${TODAY}</div><div class="lp-trust-item">Duplicate checked</div><div class="lp-trust-item">Official-source cautious</div><div class="lp-trust-item">India specific</div></div></section>
<div class="wi-rich-grid"><div>
${newPanels}
</div><aside>
<section class="wi-panel"><div class="lp-section-eyebrow">Official checks</div><h2>Useful source portals</h2><div class="wi-related"><a href="https://www.incometax.gov.in/iec/foportal/" rel="nofollow noopener">Income Tax Department e-Filing</a><a href="https://www.incometaxindia.gov.in/Pages/acts/income-tax-act.aspx" rel="nofollow noopener">Income Tax Act / Rules resources</a><a href="https://www.tdscpc.gov.in/" rel="nofollow noopener">TRACES</a></div></section>
<section class="wi-panel"><div class="lp-section-eyebrow">Hiring brief</div><h2>Ask experts these questions</h2><ul class="wi-detail-list"><li>Which law, form, utility or notification are you relying on?</li><li>What documents are missing before you can finalise the work?</li><li>What is included in your quote and what is excluded?</li><li>What timeline, proof of filing and post-filing support will you provide?</li></ul></section>
<section class="wi-panel wi-related"><h2>Related pages</h2><div class="wi-related">${relatedLinks}</div></section>
</aside></div>
</main>
</body>
</html>`;
}

// Main execution block
const files = fs.readdirSync(SEO_DIR).filter(f => f.includes('nri') || f.includes('dtaa') || f.includes('rnor') || f.includes('returning-nri') || f.includes('remittance') || f.includes('repatriation'));

console.log(`Processing ${files.length} NRI/DTAA/residency pages...`);

let processed = 0;
for (const file of files) {
  const filePath = path.join(SEO_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  
  const slug = file.replace(/\.html$/, '');
  const category = getCategory(slug);
  
  // Extract Title and Canonical
  let title = extractTitle(html, file);
  let canonical = extractCanonical(html, file);

  if (slug.includes('for-nri')) {
    title = title.replace(/For Nri/gi, 'NRIs');
  }
  
  // Get Enriched Content
  const baseContent = getContent(category, title, slug);
  const panels = [
    ...baseContent.panels,
    getFactCheckPanel(title),
    getFaqPanel(baseContent.faq)
  ];
  
  // 1. Replace Content Grid Panels or Generate Full Page if it's mismatched (like for-nris.html)
  const gridRegex = /<div class="wi-rich-grid">\s*<div>/i;
  const asideRegex = /<\/div>\s*<aside[^>]*>/i;
  
  const gridMatch = html.match(gridRegex);
  const asideMatch = html.match(asideRegex);
  
  if (gridMatch && asideMatch) {
    const gridIndex = gridMatch.index + gridMatch[0].length;
    const remaining = html.substring(gridIndex);
    const remainingAsideMatch = remaining.match(asideRegex);
    
    if (remainingAsideMatch) {
      const asideIndex = remainingAsideMatch.index;
      const beforeGrid = html.substring(0, gridIndex);
      const afterGrid = remaining.substring(asideIndex);
      
      const newPanels = panels.join('\n');
      html = beforeGrid + '\n' + newPanels + '\n' + afterGrid;
    }
  } else {
    // Rebuild mismatched standard service pages as premium grid pages
    html = generateFullPage({ slug, title, canonical, content: baseContent, panels });
  }

  // 2. Clean up "For Nri" location-style errors (for ITR filing, etc.)
  if (slug.includes('for-nri')) {
    html = html
      .replace(/ITR Filing in For Nri/g, 'ITR Filing for NRIs')
      .replace(/itr filing in For Nri/g, 'ITR filing for NRIs')
      .replace(/For Nri, Karnataka/g, 'NRIs & Overseas Citizens')
      .replace(/For Nri context/g, 'NRI Tax Context')
      .replace(/Why For Nri customers/g, 'Why NRI Taxpayers')
      .replace(/For Nri customers include/g, 'NRI taxpayers include')
      .replace(/GST Services in For Nri/g, 'GST Services for NRIs')
      .replace(/Accounting Services in For Nri/g, 'Accounting Services for NRIs')
      .replace(/Audit Services in For Nri/g, 'Audit Services for NRIs')
      .replace(/For Nri/g, 'NRIs');
  }
  
  // 3. Replace/Update FAQ JSON Schema
  const schemaRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i;
  const schemaMatch = html.match(schemaRegex);
  if (schemaMatch) {
    try {
      const schemaObj = JSON.parse(schemaMatch[1]);
      
      // Look for BreadcrumbList or WebPage to clean up if needed
      if (schemaObj['@graph']) {
        for (let item of schemaObj['@graph']) {
          if (item['@type'] === 'FAQPage') {
            item.mainEntity = baseContent.faq.map(([q, a]) => ({
              '@type': 'Question',
              'name': q,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': a
              }
            }));
          }
          if (item['@type'] === 'Service' || item['@type'] === 'WebPage') {
            if (item.name && item.name.includes('For Nri')) {
              item.name = item.name.replace(/For Nri/g, 'NRIs');
            }
            if (item.description && item.description.includes('For Nri')) {
              item.description = item.description.replace(/For Nri/g, 'NRIs');
            }
          }
        }
      }
      
      const updatedSchemaString = JSON.stringify(schemaObj);
      html = html.replace(schemaMatch[0], `<script type="application/ld+json">${updatedSchemaString}</script>`);
    } catch (err) {
      console.error(`Error parsing schema in ${file}:`, err.message);
    }
  }

  // 4. Update the "Last fact-checked" dates to TODAY
  html = html.replace(/Last fact-checked:\s*\d{4}-\d{2}-\d{2}/g, `Last fact-checked: ${TODAY}`);
  html = html.replace(/Last fact-checked:\s*\d{1,2}\s+[A-Za-z]+\s+\d{4}/g, `Last fact-checked: ${TODAY}`);
  html = html.replace(/"dateModified":\s*"[^"]*"/g, `"dateModified":"2026-06-18"`);
  
  fs.writeFileSync(filePath, html, 'utf8');
  processed++;
}

console.log(`Successfully enriched ${processed} pages.`);
