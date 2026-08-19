import os
import re
import json
import html
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path("C:/Ravish/workindex-frontend")
SEO_DIR = ROOT / "seo-pages"
SITEMAP_PATH = ROOT / "sitemap.xml"
PROGRESS_FILE = Path("C:/Ravish/indexer/progress.json")
URLS_FILE = Path("C:/Ravish/indexer/urls.txt")
MANIFEST_PATH = ROOT / "batch97-expansion-indexnow-urls.json"

CTA_URL = "/?signup=true&role=client"
FACT_DATE = "2026-08-19"

# Re-read existing slugs from before our batch 97 start
existing_slugs_file = Path("C:/Ravish/indexer/urls.txt.bak")
if existing_slugs_file.exists():
    with open(existing_slugs_file, "r") as f:
        existing_urls_pre = set(l.strip() for l in f if l.strip())
else:
    existing_urls_pre = set()

# Current existing slugs
existing_slugs = set(f.stem.lower() for f in SEO_DIR.glob("*.html"))
print(f"Current total files in seo-pages: {len(existing_slugs)}")

# Import templates from batch 97
from importlib import import_module
b97 = import_module("create-batch97-expansion-seo-pages")
TEMPLATES = b97.TEMPLATES
slugify = b97.slugify
title_from_slug = b97.title_from_slug
generate_page_html = b97.generate_page_html

more_pages = []

# 1. Tier-2/3 Industrial & Tech Hubs CA Services (400 topics)
tier2_cities = [
    ("surat-ring-road", "Ring Road, Surat"),
    ("vadodara-alkapuri", "Alkapuri, Vadodara"),
    ("indore-vijay-nagar", "Vijay Nagar, Indore"),
    ("jaipur-c-scheme", "C-Scheme, Jaipur"),
    ("jaipur-malviya-nagar", "Malviya Nagar, Jaipur"),
    ("lucknow-gomti-nagar", "Gomti Nagar, Lucknow"),
    ("lucknow-hazratganj", "Hazratganj, Lucknow"),
    ("kochi-kadavanthra", "Kadavanthra, Kochi"),
    ("kochi-infopark-kakkanad", "Infopark Kakkanad, Kochi"),
    ("coimbatore-rs-puram", "RS Puram, Coimbatore"),
    ("bhubaneswar-patia-infocity", "Patia Infocity, Bhubaneswar"),
    ("chandigarh-sector-17", "Sector 17, Chandigarh"),
    ("nagpur-civil-lines", "Civil Lines, Nagpur"),
    ("visakhapatnam-dwarka-nagar", "Dwarka Nagar, Visakhapatnam"),
    ("mysore-vijayanagar", "Vijayanagar, Mysore"),
    ("mangalore-kadri", "Kadri, Mangalore"),
    ("rajkot-yagnik-road", "Yagnik Road, Rajkot"),
    ("ludhiana-model-town", "Model Town, Ludhiana"),
    ("nashik-college-road", "College Road, Nashik"),
    ("kanpur-civil-lines", "Civil Lines, Kanpur"),
    ("bhopal-mp-nagar", "MP Nagar, Bhopal"),
    ("trivandrum-technopark", "Technopark, Trivandrum"),
    ("calicut-cyberpark", "Cyberpark, Calicut"),
    ("vijayawada-benz-circle", "Benz Circle, Vijayawada")
]

tier2_services = [
    ("chartered-accountant-gst-itr", "Chartered Accountant for GST & ITR in {loc}", "income_tax_bill_2025"),
    ("tax-audit-section-44ab-expert", "Tax Audit Section 44AB Expert in {loc}", "income_tax_bill_2025"),
    ("gst-appeal-and-notice-consultant", "GST Appeal and Notice Consultant in {loc}", "gst_gstat_indirect"),
    ("company-roc-filing-and-compliance", "Company ROC Filing & Compliance in {loc}", "startup_mca_corporate"),
    ("nri-property-tax-form-15ca-15cb", "NRI Property Tax Form 15CA 15CB in {loc}", "nri_fema_international"),
    ("capital-gains-property-tax-advisor", "Capital Gains Property Tax Advisor in {loc}", "capital_gains_buyback"),
    ("freelancer-presumptive-tax-ca", "Freelancer Presumptive Tax CA in {loc}", "freelance_creator_presumptive"),
    ("trademark-and-ip-attorney", "Trademark and IP Attorney in {loc}", "ipr_patent_trademark")
]

for c_slug, c_name in tier2_cities:
    for s_slug, s_name, t_key in tier2_services:
        slug = slugify(f"{s_slug}-{c_slug}")
        if slug not in existing_slugs:
            more_pages.append({"slug": slug, "template": t_key})

# 2. Detailed Direct Tax & TDS Compliance Scenarios (400 topics)
tds_topics = [
    "section-194q-vs-206c-1h-tds-tcs-purchase-sale-goods", "section-194r-pharma-doctor-conference-perquisite-tds",
    "section-194m-individual-huf-contractor-commission-tds", "section-194n-cash-withdrawal-exceeding-1-crore-tds",
    "section-194ia-property-purchase-1-percent-tds-form-26qb", "section-194ib-monthly-rent-exceeding-50000-tds-form-26qc",
    "section-206ab-higher-tds-rate-specified-non-filers", "section-206cca-higher-tcs-rate-non-filers-compliance",
    "form-27q-quarterly-nri-tds-return-filing-guide", "form-24q-salary-tds-annexure-ii-filing-rules",
    "form-26q-non-salary-tds-quarterly-correction-guide", "traces-justification-report-short-deduction-resolution",
    "tds-demand-notice-section-201-1-interest-and-penalties", "section-80ccd-2-employer-nps-tax-planning-strategy",
    "section-10-14-special-allowances-driver-uniform-conveyance", "company-car-perquisite-tax-rule-3-driver-maintenance",
    "esop-tax-deferral-eligible-dpitt-startups-section-80iac", "caro-2020-statutory-audit-reporting-inventory-loans",
    "internal-financial-controls-ifc-audit-documentation-india", "form-dir-12-director-appointment-resignation-filing",
    "form-mgt-14-special-resolution-e-filing-deadlines", "form-chg-1-charge-creation-modification-roc-filing",
    "form-chg-4-charge-satisfaction-bank-noc-compliance", "strike-off-revival-nclt-section-252-company-restoration"
]

for base in tds_topics:
    for mod in ["detailed-handbook-2026", "statutory-rules-and-limits", "faqs-explained-step-by-step", "audit-checklist-and-forms", "expert-advisory-notes", "common-compliance-traps", "documents-and-timelines", "for-businesses-and-cas", "for-finance-heads", "litigation-safeguards"]:
        slug = slugify(f"{base}-{mod}")
        if slug not in existing_slugs:
            more_pages.append({"slug": slug, "template": "income_tax_bill_2025" if "tds" in slug or "section" in slug else "startup_mca_corporate"})

# Filter unique
unique_more = []
seen_more = set()
for p in more_pages:
    sl = p["slug"]
    if sl not in existing_slugs and sl not in seen_more:
        seen_more.add(sl)
        unique_more.append(p)

# We need ~730 more pages to reach exactly 2,800 new pages
target_additional = 730
if len(unique_more) > target_additional:
    unique_more = unique_more[:target_additional]

print(f"Generating {len(unique_more)} additional unique pages to reach total target of ~2,800 new pages...")

new_urls_additional = []
for idx, p in enumerate(unique_more):
    if (idx + 1) % 200 == 0 or idx == len(unique_more) - 1:
        print(f"  Generated {idx + 1} / {len(unique_more)} pages...")
    slug = p["slug"]
    t_key = p["template"]
    html_str = generate_page_html(slug, t_key)
    out_file = SEO_DIR / f"{slug}.html"
    out_file.write_text(html_str, encoding="utf-8")
    new_urls_additional.append(f"https://workindex.co.in/seo-pages/{slug}.html")

print(f"\nSuccessfully wrote {len(unique_more)} additional pages!")

# Update manifest
with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
    batch97_manifest = json.load(f)

full_batch97_manifest = batch97_manifest + new_urls_additional
with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(full_batch97_manifest, f, indent=2)

print(f"Total Batch 97 URLs in manifest: {len(full_batch97_manifest)}")

# Update sitemap
print("Updating sitemap.xml...")
all_html_files = sorted(list(SEO_DIR.glob("*.html")))
sitemap_entries = ['<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
sitemap_entries.append('  <url><loc>https://workindex.co.in/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>')
sitemap_entries.append('  <url><loc>https://workindex.co.in/contact.html</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>')

for f in all_html_files:
    sitemap_entries.append(f'  <url><loc>https://workindex.co.in/seo-pages/{f.name}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>')
sitemap_entries.append('</urlset>')

SITEMAP_PATH.write_text("\n".join(sitemap_entries), encoding="utf-8")
print(f"sitemap.xml updated with {len(all_html_files) + 2} URLs!")

# Update urls.txt
with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
    prog = json.load(f)
runs = prog.get('runs', [])
max_indexed = max(r['start_index'] + r['submitted'] for r in runs)

with open(URLS_FILE, "r", encoding="utf-8") as f:
    existing_url_lines = [l.strip() for l in f if l.strip()]

indexed_head = existing_url_lines[:max_indexed]
remaining_existing = set(existing_url_lines[max_indexed:])
all_new_urls_set = set(full_batch97_manifest)

unindexed_pool = list((remaining_existing | all_new_urls_set) - set(indexed_head))

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

print(f"urls.txt successfully updated with {len(final_urls)} total URLs!")
print(f"Batch 97 Total New Pages Generated: {len(full_batch97_manifest)}")
