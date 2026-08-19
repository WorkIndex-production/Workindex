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

existing_files = set(f.name.lower() for f in SEO_DIR.glob("*.html"))
existing_slugs = set(f.stem.lower() for f in SEO_DIR.glob("*.html"))
print(f"Current total files in seo-pages: {len(existing_files)}")

from importlib import import_module
b97 = import_module("create-batch97-expansion-seo-pages")
TEMPLATES = b97.TEMPLATES
slugify = b97.slugify
title_from_slug = b97.title_from_slug
generate_page_html = b97.generate_page_html

target_additional = 250
extra_topics = [
    ("nfra-audit-quality-standards-listed-companies", "NFRA Audit Quality Standards for Listed Companies", "startup_mca_corporate"),
    ("caro-2020-clause-xxi-qualification-in-consolidated-statements", "CARO 2020 Clause XXI Qualification in Consolidated Financial Statements", "startup_mca_corporate"),
    ("section-185-loan-to-directors-exemptions-and-penalties", "Section 185 Loan to Directors Exemptions and Penalties", "startup_mca_corporate"),
    ("section-186-intercorporate-loan-limit-and-sro-filing", "Section 186 Intercorporate Loan Limit and SRO Filing", "startup_mca_corporate"),
    ("share-transfer-sh-4-stamp-duty-demat-rules", "Share Transfer SH 4 Stamp Duty and Demat Rules", "startup_mca_corporate"),
    ("share-pledge-form-chg-1-charge-creation-guide", "Share Pledge Form CHG 1 Charge Creation Guide", "startup_mca_corporate"),
    ("foreign-subsidiary-consolidation-ind-as-110-compliance", "Foreign Subsidiary Consolidation Ind AS 110 Compliance", "startup_mca_corporate"),
    ("transfer-pricing-safe-harbour-rules-it-services", "Transfer Pricing Safe Harbour Rules for IT Services", "nri_fema_international"),
    ("form-3ceb-international-transaction-ca-certification", "Form 3CEB International Transaction CA Certification", "nri_fema_international"),
    ("master-file-form-3ceaa-and-cbcr-form-3cead-rules", "Master File Form 3CEAA and CbCR Form 3CEAD Rules", "nri_fema_international"),
    ("significant-economic-presence-sep-rule-11ud-thresholds", "Significant Economic Presence SEP Rule 11UD Thresholds", "nri_fema_international"),
    ("equalization-levy-6-percent-google-tax-abolition-transition", "Equalization Levy 6 Percent Google Tax Abolition Transition", "nri_fema_international"),
    ("gift-city-ifsc-family-investment-fund-tax-rules", "GIFT City IFSC Family Investment Fund Tax Rules", "nri_fema_international"),
    ("gift-city-aircraft-and-ship-leasing-tax-holiday", "GIFT City Aircraft and Ship Leasing Tax Holiday", "nri_fema_international"),
    ("angel-investment-section-68-credit-worthiness-burden", "Angel Investment Section 68 Credit Worthiness Burden", "capital_gains_buyback"),
    ("safe-note-and-ccps-valuation-under-rule-11ua", "SAFE Note and CCPS Valuation under Rule 11UA", "capital_gains_buyback"),
    ("esop-trust-route-secondary-sale-tax-implications", "ESOP Trust Route Secondary Sale Tax Implications", "capital_gains_buyback"),
    ("sweat-equity-section-54-companies-act-valuation", "Sweat Equity Section 54 Companies Act Valuation", "startup_mca_corporate"),
    ("section-194s-crypto-p2p-arbitrage-tds-tracking", "Section 194S Crypto P2P Arbitrage TDS Tracking", "crypto_gaming_web3"),
    ("foreign-exchange-crypto-wallet-fiu-disclosure", "Foreign Exchange Crypto Wallet FIU Disclosure", "crypto_gaming_web3"),
    ("online-rummy-and-poker-net-winnings-tds-formula", "Online Rummy and Poker Net Winnings TDS Formula", "crypto_gaming_web3"),
    ("fno-turnover-calculation-broker-summary-reconciliation", "FnO Turnover Calculation Broker Summary Reconciliation", "capital_gains_buyback"),
    ("section-44ab-tax-audit-fno-traders-loss-reporting", "Section 44AB Tax Audit FnO Traders Loss Reporting", "income_tax_bill_2025"),
    ("stcg-vs-business-income-equity-delivery-classification", "STCG vs Business Income Equity Delivery Classification", "capital_gains_buyback"),
    ("listed-debentures-ltcg-12-5-without-indexation-rules", "Listed Debentures LTCG 12.5 Without Indexation Rules", "capital_gains_buyback")
]

more_list = []
for base_slug, base_title, t_key in extra_topics:
    for modifier in ["guide-2026", "faqs-handbook", "statutory-rules", "step-by-step-process", "audit-checklist", "expert-notes", "common-mistakes-to-avoid", "court-precedents", "for-finance-professionals", "compliance-calendar"]:
        slug = slugify(f"{base_slug}-{modifier}")
        if slug not in existing_slugs and slug not in [p["slug"] for p in more_list]:
            more_list.append({"slug": slug, "template": t_key})

print(f"Prepared {len(more_list)} additional pages.")
if len(more_list) > target_additional:
    more_list = more_list[:target_additional]

new_urls_additional = []
for idx, p in enumerate(more_list):
    slug = p["slug"]
    t_key = p["template"]
    html_str = generate_page_html(slug, t_key)
    out_file = SEO_DIR / f"{slug}.html"
    out_file.write_text(html_str, encoding="utf-8")
    new_urls_additional.append(f"https://workindex.co.in/seo-pages/{slug}.html")

print(f"Generated and wrote {len(more_list)} extra pages!")

# Finalize sitemap
all_html_files = sorted(list(SEO_DIR.glob("*.html")))
print(f"Total HTML files on disk now: {len(all_html_files)}")
sitemap_entries = ['<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
sitemap_entries.append('  <url><loc>https://workindex.co.in/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>')
sitemap_entries.append('  <url><loc>https://workindex.co.in/contact.html</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>')

for f in all_html_files:
    sitemap_entries.append(f'  <url><loc>https://workindex.co.in/seo-pages/{f.name}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>')
sitemap_entries.append('</urlset>')

SITEMAP_PATH.write_text("\n".join(sitemap_entries), encoding="utf-8")
print(f"sitemap.xml finalized with {len(all_html_files) + 2} URLs!")

# Collect all new URLs created in this entire session (files created today)
all_created_today = [f"https://workindex.co.in/seo-pages/{f.name}" for f in all_html_files if (len(all_html_files) - 37461) > 0 and f.name.lower() not in [x.lower() for x in existing_files if x.endswith('.html')][:37461]]

# Write complete manifest of all 2,752 new URLs
new_batch_urls = [f"https://workindex.co.in/seo-pages/{f.name}" for f in all_html_files if f.stat().st_mtime > 1755600000]
print(f"Total new URLs generated in this expansion: {len(new_batch_urls)}")
with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
    json.dump(new_batch_urls, f, indent=2)

# Update indexer urls.txt
with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
    prog = json.load(f)
runs = prog.get('runs', [])
max_indexed = max(r['start_index'] + r['submitted'] for r in runs)

with open(URLS_FILE, "r", encoding="utf-8") as f:
    existing_url_lines = [l.strip() for l in f if l.strip()]

indexed_head = existing_url_lines[:max_indexed]
remaining_existing = set(existing_url_lines[max_indexed:])
all_new_urls_set = set(new_batch_urls)
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

print(f"urls.txt updated with {len(final_urls)} total URLs!")
print(f"Total HTML files on disk: {len(all_html_files)} (Exactly {len(all_html_files) - 37461} brand-new pages added!)")
