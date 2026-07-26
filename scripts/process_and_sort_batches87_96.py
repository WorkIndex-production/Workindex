import os
import json
from pathlib import Path

root = Path("C:/Ravish/workindex-frontend")
seo_dir = root / "seo-pages"
sitemap_path = root / "sitemap.xml"
manifest_path = root / "batch87-96-indexnow-urls.json"
progress_file = Path("C:/Ravish/indexer/progress.json")
urls_file = Path("C:/Ravish/indexer/urls.txt")

site = "https://workindex.co.in"
today = "2026-07-26"

# 1. Gather all files in seo-pages
print("Scanning all HTML files in seo-pages...")
all_files = sorted([f.name for f in seo_dir.glob("*.html")])
print(f"Total HTML files in seo-pages: {len(all_files)}")

# 2. Build sitemap.xml
print("Generating clean sitemap.xml...")
sitemap_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]

# Static pages
static_pages = [
    "index.html", "contact.html", "terms.html", "privacy-policy.html", "refund-policy.html"
]
for p in static_pages:
    loc = site if not p else f"{site}/{p}"
    sitemap_lines.append(f"  <url><loc>{loc}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>")

all_urls = []
for fname in all_files:
    url = f"{site}/seo-pages/{fname}"
    all_urls.append(url)
    sitemap_lines.append(f"  <url><loc>{url}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>")

sitemap_lines.append('</urlset>')

sitemap_path.write_text("\n".join(sitemap_lines) + "\n", encoding="utf-8")
print(f"sitemap.xml written successfully with {len(all_files) + len(static_pages)} entries.")

# 3. Read progress.json next_index
progress = json.loads(progress_file.read_text(encoding="utf-8"))
next_index = progress.get("next_index", 5109)
print(f"next_index from progress.json: {next_index}")

# 4. Load current urls.txt
content = urls_file.read_text(encoding="utf-8").splitlines()
urls = []
seen = set()
for line in content:
    url = line.strip()
    if not url or url.startswith("#"):
        continue
    if url in seen:
        continue
    seen.add(url)
    urls.append(url)

print(f"Existing URLs in urls.txt: {len(urls)}")

# 5. Filter new URLs
new_urls_to_add = []
manifest_urls = []

for url in all_urls:
    if url not in seen:
        new_urls_to_add.append(url)
        manifest_urls.append(url)

print(f"New unique URLs to append: {len(new_urls_to_add)}")

# Write IndexNow manifest
manifest_path.write_text(json.dumps(manifest_urls, indent=2), encoding="utf-8")
print(f"Manifest written to {manifest_path} with {len(manifest_urls)} URLs.")

# 6. Preserve first next_index URLs, reorder remaining pool
preserved_urls = urls[:next_index]
remaining_urls = urls[next_index:] + new_urls_to_add

positive_keywords = [
    "itr", "income-tax", "income-taxation", "tds", "tcs", "slab", "regime", "outstanding-tax",
    "double-taxation", "double-tax", "tax-free", "tax-saving", "tax-planning", "tax-audit",
    "tax-exemption", "tax-exempt", "tax-rebate", "tax-relief", "salary-tax", "nri", "dtaa",
    "rnor", "143-1", "26as", "ais", "tis", "form-10f", "form-67", "remittance", "repatriation",
    "form-15ca", "form-15cb", "lrs", "80c", "80d", "80g", "80e", "80u", "80dd", "80ee", "80tt",
    "section-44", "section-194", "section-143", "section-148", "section-10", "section-24",
    "capital-gains", "form-16", "elss", "ppf", "nps", "sgb", "rsu", "esop", "ca-services",
    "chartered-accountant", "gst", "gstr", "mca", "roc", "audit", "ai-"
]

tax_urls = []
other_urls = []

for url in remaining_urls:
    url_lower = url.lower()
    is_tax = any(kw in url_lower for kw in positive_keywords)
    if is_tax:
        tax_urls.append(url)
    else:
        other_urls.append(url)

tax_urls.sort()
other_urls.sort()

final_urls = preserved_urls + tax_urls + other_urls

# Backup existing urls.txt
urls_file.with_name("urls.txt.bak").write_text("\n".join(urls) + "\n", encoding="utf-8")

# Write updated urls.txt
urls_file.write_text("\n".join(final_urls) + "\n", encoding="utf-8")
print(f"Updated urls.txt written successfully with total {len(final_urls)} URLs.")

# Sanity assertions
assert len(final_urls) == len(urls) + len(new_urls_to_add), "URL count mismatch!"
for idx, (orig, new_val) in enumerate(zip(preserved_urls, final_urls[:next_index])):
    assert orig == new_val, f"Preserved URL changed at index {idx}!"

print("Sanity checks passed! First next_index URLs preserved byte-for-byte.")
