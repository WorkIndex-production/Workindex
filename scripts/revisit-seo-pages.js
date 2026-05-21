const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const sitemapPath = path.join(root, 'sitemap.xml');
const site = 'https://workindex.co.in';
const today = '2026-05-21';

const servicePrefixes = [
  'accounting-services',
  'audit-services',
  'gst-services',
  'itr-filing'
];

const serviceInfo = {
  itr: {
    label: 'ITR filing',
    checklistTitle: 'ITR filing details a serious expert should check',
    points: [
      'Match Form 16, AIS, TIS and Form 26AS before final filing.',
      'Identify all income heads: salary, freelance, business, capital gains, rent, interest, crypto, ESOP/RSU or foreign income.',
      'Compare old and new tax regime with actual deductions instead of guessing.',
      'Choose the correct ITR form and explain why that form applies.',
      'Keep PAN, Aadhaar, bank validation, investment proofs, capital gain statements and loan/rent documents ready.'
    ],
    pricing: 'Simple salary ITR work is usually low-cost, while capital gains, business income, foreign assets, notices or revised returns need deeper review and a higher professional fee.',
    refs: [
      'blog-documents-needed-for-itr-filing',
      'documents-required-for-itr-filing-freelancers',
      'itr-filing-cost-india',
      'how-to-file-itr-online'
    ]
  },
  gst: {
    label: 'GST services',
    checklistTitle: 'GST details a serious expert should check',
    points: [
      'Registration type, principal place of business, additional places and business constitution.',
      'Sales register, purchase register, e-way bills, ecommerce reports, POS exports and bank receipts.',
      'GSTR-1, GSTR-3B and GSTR-2B reconciliation before claiming ITC.',
      'Reverse charge, blocked credits, place of supply and export/LUT treatment where relevant.',
      'Notice history, late fees, interest exposure and cancellation or revocation timelines.'
    ],
    pricing: 'Nil/simple GST filings are cheaper, but reconciliation-heavy monthly work, ecommerce sales, notices, cancellation/revocation or annual cleanup should be quoted after reviewing records.',
    refs: [
      'documents-required-for-gst-registration',
      'gst-registration-cost',
      'gst-filing-services',
      'gst-late-fee-calculator'
    ]
  },
  accounting: {
    label: 'accounting and bookkeeping',
    checklistTitle: 'Accounting details a serious expert should check',
    points: [
      'Monthly transaction volume, number of bank accounts and payment modes.',
      'Sales invoices, purchase bills, expense proofs, payroll, loans, assets and owner drawings.',
      'Whether books must be GST-ready, audit-ready, investor-ready or only for internal MIS.',
      'Backlog cleanup period and whether previous Tally, Zoho, Excel or other records exist.',
      'Frequency of reporting: monthly P&L, balance sheet, cash flow, receivable/payable ageing and compliance calendar.'
    ],
    pricing: 'Monthly bookkeeping fees depend heavily on transaction volume, backlog, software, GST linkage, payroll and reporting depth. A small shop and a high-volume ecommerce seller should not receive the same quote.',
    refs: [
      'accounting-bookkeeping-services',
      'accounting-for-ecommerce',
      'accounting-services-india',
      'accounting-services-karnataka'
    ]
  },
  audit: {
    label: 'audit services',
    checklistTitle: 'Audit details a serious expert should check',
    points: [
      'Whether the requirement is statutory audit, tax audit, internal audit, stock audit, due diligence or control review.',
      'Turnover, professional receipts, entity type, cash transaction levels and applicable audit threshold.',
      'Trial balance, ledgers, bank statements, GST/TDS filings, fixed assets, inventory and loan confirmations.',
      'Books quality, prior-year qualifications, related-party transactions and open compliance issues.',
      'Expected deliverable: audit report, management observations, Form 3CA/3CB/3CD support or internal control note.'
    ],
    pricing: 'Audit pricing should depend on turnover, transaction volume, locations, records quality, statutory scope and deadlines. Very low audit quotes without reviewing books are a warning sign.',
    refs: [
      'company-compliance-services',
      'ca-vs-tax-consultant',
      'audit-services-karnataka',
      'startup-compliance-checklist'
    ]
  },
  business: {
    label: 'business compliance',
    checklistTitle: 'Business compliance details a serious expert should check',
    points: [
      'Entity type, owners/partners/directors, registrations already taken and filings missed.',
      'PAN, Aadhaar/KYC, address proof, bank account, GST, TDS, payroll, contracts and previous filings.',
      'Whether the work is one-time registration, recurring compliance, cleanup, advisory or notice response.',
      'Deadline sensitivity and penalty exposure.',
      'Whether accounting and tax filings need to be coordinated together.'
    ],
    pricing: 'Registration and compliance pricing varies by entity type, number of promoters, government fees, professional certification, catch-up filings and urgency.',
    refs: [
      'company-registration-consultants',
      'business-registration',
      'startup-compliance-services',
      'documents-required-for-company-registration'
    ]
  }
};

const locationNames = {
  bangalore: 'Bengaluru',
  jayanagar: 'Jayanagar',
  'jp-nagar': 'JP Nagar',
  basavanagudi: 'Basavanagudi',
  'gandhi-bazar': 'Gandhi Bazar',
  banashankari: 'Banashankari',
  uttarahalli: 'Uttarahalli',
  kengeri: 'Kengeri',
  'rr-nagar': 'RR Nagar',
  vijayanagar: 'Vijayanagar',
  rajajinagar: 'Rajajinagar',
  malleshwaram: 'Malleshwaram',
  yeshwanthpur: 'Yeshwanthpur',
  hebbal: 'Hebbal',
  yelahanka: 'Yelahanka',
  'btm-layout': 'BTM Layout',
  indiranagar: 'Indiranagar',
  koramangala: 'Koramangala',
  whitefield: 'Whitefield',
  brookefield: 'Brookefield',
  marathahalli: 'Marathahalli',
  mahadevapura: 'Mahadevapura',
  'kr-puram': 'KR Puram',
  bellandur: 'Bellandur',
  'sarjapur-road': 'Sarjapur Road',
  mysore: 'Mysuru',
  mangalore: 'Mangaluru',
  hubli: 'Hubballi',
  dharwad: 'Dharwad',
  davanagere: 'Davanagere',
  shivamogga: 'Shivamogga',
  belagavi: 'Belagavi',
  tumkur: 'Tumakuru',
  hassan: 'Hassan',
  mandya: 'Mandya',
  kolar: 'Kolar',
  udupi: 'Udupi',
  ballari: 'Ballari',
  bidar: 'Bidar',
  bijapur: 'Vijayapura',
  gulbarga: 'Kalaburagi',
  raichur: 'Raichur',
  chitradurga: 'Chitradurga',
  chikkamagaluru: 'Chikkamagaluru'
};

const nearby = {
  bangalore: ['jayanagar', 'jp-nagar', 'basavanagudi', 'indiranagar', 'whitefield', 'hebbal', 'mysore', 'tumkur'],
  jayanagar: ['jp-nagar', 'basavanagudi', 'gandhi-bazar', 'banashankari', 'btm-layout', 'bangalore'],
  'jp-nagar': ['jayanagar', 'banashankari', 'btm-layout', 'uttarahalli', 'basavanagudi', 'bangalore'],
  basavanagudi: ['gandhi-bazar', 'jayanagar', 'banashankari', 'vijayanagar', 'bangalore'],
  'gandhi-bazar': ['basavanagudi', 'jayanagar', 'banashankari', 'vijayanagar', 'bangalore'],
  banashankari: ['jayanagar', 'jp-nagar', 'uttarahalli', 'basavanagudi', 'kengeri', 'bangalore'],
  uttarahalli: ['banashankari', 'jp-nagar', 'kengeri', 'rr-nagar', 'bangalore'],
  kengeri: ['rr-nagar', 'uttarahalli', 'vijayanagar', 'bangalore', 'mysore'],
  'rr-nagar': ['kengeri', 'vijayanagar', 'uttarahalli', 'rajajinagar', 'bangalore'],
  vijayanagar: ['rajajinagar', 'basavanagudi', 'rr-nagar', 'kengeri', 'bangalore'],
  rajajinagar: ['malleshwaram', 'vijayanagar', 'yeshwanthpur', 'basavanagudi', 'bangalore'],
  malleshwaram: ['rajajinagar', 'yeshwanthpur', 'hebbal', 'bangalore'],
  yeshwanthpur: ['malleshwaram', 'rajajinagar', 'hebbal', 'yelahanka', 'bangalore'],
  hebbal: ['yelahanka', 'yeshwanthpur', 'malleshwaram', 'kr-puram', 'bangalore'],
  yelahanka: ['hebbal', 'yeshwanthpur', 'bangalore'],
  indiranagar: ['koramangala', 'whitefield', 'kr-puram', 'mahadevapura', 'bangalore'],
  koramangala: ['indiranagar', 'btm-layout', 'jayanagar', 'bellandur', 'bangalore'],
  whitefield: ['brookefield', 'mahadevapura', 'marathahalli', 'kr-puram', 'bangalore'],
  brookefield: ['whitefield', 'marathahalli', 'mahadevapura', 'kr-puram', 'bangalore'],
  marathahalli: ['brookefield', 'whitefield', 'mahadevapura', 'bellandur', 'sarjapur-road', 'bangalore'],
  mahadevapura: ['whitefield', 'kr-puram', 'brookefield', 'marathahalli', 'bangalore'],
  'kr-puram': ['mahadevapura', 'whitefield', 'hebbal', 'bangalore'],
  bellandur: ['sarjapur-road', 'marathahalli', 'koramangala', 'btm-layout', 'bangalore'],
  'sarjapur-road': ['bellandur', 'marathahalli', 'koramangala', 'bangalore'],
  mysore: ['bangalore', 'mandya', 'hassan', 'tumkur'],
  tumkur: ['bangalore', 'hassan', 'chitradurga', 'mysore'],
  hubli: ['dharwad', 'belagavi', 'davanagere', 'bijapur'],
  dharwad: ['hubli', 'belagavi', 'davanagere', 'bijapur'],
  davanagere: ['shivamogga', 'chitradurga', 'hubli', 'dharwad'],
  shivamogga: ['davanagere', 'chikkamagaluru', 'udupi', 'hassan'],
  mangalore: ['udupi', 'chikkamagaluru', 'hassan', 'mysore'],
  udupi: ['mangalore', 'shivamogga', 'chikkamagaluru'],
  belagavi: ['hubli', 'dharwad', 'bijapur'],
  hassan: ['mysore', 'tumkur', 'chikkamagaluru', 'shivamogga'],
  mandya: ['mysore', 'bangalore', 'hassan'],
  kolar: ['bangalore', 'whitefield', 'kr-puram'],
  ballari: ['chitradurga', 'davanagere', 'raichur'],
  bidar: ['gulbarga', 'raichur'],
  bijapur: ['hubli', 'dharwad', 'belagavi', 'gulbarga'],
  gulbarga: ['bidar', 'raichur', 'bijapur'],
  raichur: ['gulbarga', 'bidar', 'ballari'],
  chitradurga: ['davanagere', 'tumkur', 'ballari'],
  chikkamagaluru: ['shivamogga', 'hassan', 'mangalore', 'udupi']
};

function esc(value) {
  return String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function titleCase(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bItr\b/g, 'ITR')
    .replace(/\bGst\b/g, 'GST')
    .replace(/\bCa\b/g, 'CA')
    .replace(/\bMsme\b/g, 'MSME')
    .replace(/\bNris\b/g, 'NRIs')
    .replace(/\bSaas\b/g, 'SaaS');
}

function topicForSlug(slug) {
  if (/gst/.test(slug)) return serviceInfo.gst;
  if (/itr|income-tax|tax-filing|tax-consultant|tax-regime|tax-notice|scrutiny|nri/.test(slug)) return serviceInfo.itr;
  if (/account|bookkeep|cfo|ledger|calculator|loan/.test(slug)) return serviceInfo.accounting;
  if (/audit|compliance|company|startup|registration|trademark|msme|business/.test(slug)) return serviceInfo.audit;
  return serviceInfo.business;
}

function locationPageParts(slug) {
  for (const prefix of servicePrefixes) {
    if (slug.startsWith(`${prefix}-`)) {
      const locSlug = slug.slice(prefix.length + 1);
      if (locationNames[locSlug]) return { prefix, locSlug };
    }
  }
  return null;
}

function pageExists(slug) {
  return fs.existsSync(path.join(seoDir, `${slug}.html`));
}

function linkCard(slug, title, desc) {
  return `<a class="lp-step" href="/seo-pages/${slug}.html" style="text-decoration:none;color:inherit;"><h3>${esc(title)}</h3><p>${esc(desc)}</p></a>`;
}

function serviceLabel(prefix) {
  if (prefix === 'itr-filing') return 'ITR filing';
  if (prefix === 'gst-services') return 'GST services';
  if (prefix === 'accounting-services') return 'accounting services';
  return 'audit services';
}

function nearbyCards(parts) {
  const cards = [];
  if (parts) {
    const candidates = nearby[parts.locSlug] || nearby.bangalore;
    for (const nearSlug of candidates) {
      const target = `${parts.prefix}-${nearSlug}`;
      if (pageExists(target)) {
        cards.push(linkCard(
          target,
          `${titleCase(serviceLabel(parts.prefix))} in ${locationNames[nearSlug]}`,
          `Compare ${serviceLabel(parts.prefix)} experts serving ${locationNames[nearSlug]} and nearby customers.`
        ));
      }
      if (cards.length >= 6) break;
    }
  }

  if (cards.length < 6) {
    const fallback = [
      ['itr-filing-bangalore', 'ITR Filing in Bengaluru'],
      ['gst-services-bangalore', 'GST Services in Bengaluru'],
      ['accounting-services-bangalore', 'Accounting Services in Bengaluru'],
      ['itr-filing-jayanagar', 'ITR Filing in Jayanagar'],
      ['gst-services-whitefield', 'GST Services in Whitefield'],
      ['accounting-services-hubli', 'Accounting Services in Hubballi'],
      ['itr-filing-mysore', 'ITR Filing in Mysuru']
    ];
    for (const [slug, title] of fallback) {
      if (!pageExists(slug) || cards.some((card) => card.includes(`/${slug}.html`))) continue;
      cards.push(linkCard(slug, title, 'Open a related WorkIndex local hiring page.'));
      if (cards.length >= 6) break;
    }
  }
  return cards.join('');
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
}

function detailSection(slug, parts) {
  const topic = topicForSlug(slug);
  const related = topic.refs
    .filter((ref) => ref !== slug && pageExists(ref))
    .slice(0, 4)
    .map((ref) => linkCard(ref, titleCase(ref), `Read the related WorkIndex guide for ${topic.label}.`))
    .join('');
  const locationSentence = parts
    ? `This page also links to nearby ${locationNames[parts.locSlug]} and Bengaluru/Karnataka pages so customers can compare experts in adjacent areas instead of starting a new search.`
    : 'This page links into Bengaluru and Karnataka local pages so customers can move from research to hiring in a nearby market quickly.';

  return `
<section class="lp-section wi-seo-revisit" data-wi-seo-revisit="service-depth">
  <div class="lp-section-eyebrow">Updated Hiring Guidance</div>
  <h2 class="lp-section-title">${esc(topic.checklistTitle)}</h2>
  <p class="lp-section-sub">We reviewed high-performing Indian tax, GST, accounting and compliance pages and strengthened this page around practical decision points: documents, scope, pricing, timelines, risks and local context. ${esc(locationSentence)}</p>
  <div class="wi-grid">
    <div class="lp-step"><h3>Before you request quotes</h3>${list(topic.points)}</div>
    <div class="lp-step"><h3>Pricing context</h3><p>${esc(topic.pricing)}</p></div>
    <div class="lp-step"><h3>What to expect from WorkIndex</h3>${list(['Post one structured requirement instead of calling many providers manually.', 'Let experts respond after seeing service type, budget, timeline and documents.', 'Compare ratings, profile strength, responses and pricing before proceeding.', 'Keep documents and communication organized for follow-up, corrections or notices.'])}</div>
  </div>
</section>
${related ? `<section class="lp-section wi-seo-revisit" data-wi-seo-revisit="topic-links"><div class="lp-section-eyebrow">Related WorkIndex Guides</div><h2 class="lp-section-title">Research the topic before hiring</h2><div class="lp-steps">${related}</div></section>` : ''}
<section class="lp-section wi-seo-revisit" data-wi-seo-revisit="nearby-links">
  <div class="lp-section-eyebrow">Nearby Pages</div>
  <h2 class="lp-section-title">Compare experts in nearby Bengaluru and Karnataka locations</h2>
  <p class="lp-section-sub">If your work can be handled online or your business operates across nearby areas, these local pages can help you compare more experts without losing local context.</p>
  <div class="lp-steps">${nearbyCards(parts)}</div>
</section>`;
}

function removeOldRevisitSections(html) {
  return html.replace(/\n?<section class="lp-section wi-seo-revisit" data-wi-seo-revisit="(?:service-depth|topic-links|nearby-links)">[\s\S]*?<\/section>/g, '');
}

function inject(html, slug) {
  const parts = locationPageParts(slug);
  let next = removeOldRevisitSections(html);
  next = removeBrokenSeoCards(next);
  const insert = detailSection(slug, parts);
  if (next.includes('<section class="lp-cta-section">')) {
    next = next.replace('<section class="lp-cta-section">', `${insert}\n<section class="lp-cta-section">`);
  } else if (next.includes('</body>')) {
    next = next.replace('</body>', `${insert}\n</body>`);
  } else {
    next += insert;
  }
  return next;
}

function removeBrokenSeoCards(html) {
  const files = new Set(fs.readdirSync(seoDir).filter((file) => file.endsWith('.html')).map((file) => `/seo-pages/${file}`));
  return html.replace(/<a class="lp-step" href="(\/seo-pages\/[^"]+\.html)" style="text-decoration:none;color:inherit;"><h3>[\s\S]*?<\/a>/g, (card, href) => {
    return files.has(href) ? card : '';
  });
}

function updateSitemap(touched) {
  if (!fs.existsSync(sitemapPath)) return;
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const slug of touched) {
    const url = `${site}/seo-pages/${slug}.html`;
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(<url><loc>${escaped}</loc><priority>[^<]+</priority><changefreq>monthly</changefreq><lastmod>)[^<]+(</lastmod></url>)`, 'g');
    sitemap = sitemap.replace(re, `$1${today}$2`);
  }
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

const files = fs.readdirSync(seoDir).filter((file) => file.endsWith('.html')).sort();
const touched = [];

for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  const filePath = path.join(seoDir, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = inject(original, slug);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    touched.push(slug);
  }
}

updateSitemap(touched);
console.log(`revisited=${touched.length}`);
