import os
import re
import json
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path("C:/Ravish/workindex-frontend")
SEO_DIR = ROOT / "seo-pages"

# Fix placeholder in section-43b-h-msme-payment-45-days.html
fpath = SEO_DIR / "section-43b-h-msme-payment-45-days.html"
if fpath.exists():
    c = fpath.read_text(encoding="utf-8", errors="ignore")
    if "{topic}" in c:
        c = c.replace("{topic}", "Section 43B(h) MSME Payment 45 Days")
        fpath.write_text(c, encoding="utf-8")
        print("Fixed placeholder in section-43b-h-msme-payment-45-days.html!")

# Get untracked files from git
res = subprocess.run(["git", "status", "-s"], cwd=ROOT, capture_output=True, text=True)
untracked_files = []
for line in res.stdout.splitlines():
    if line.startswith("?? seo-pages/"):
        fn = line.replace("?? seo-pages/", "").strip()
        untracked_files.append(fn)

print(f"Total Untracked New SEO Files in Git: {len(untracked_files)}")

# Audit ONLY these untracked new files
placeholders = []
schema_errs = []
meta_errs = []
canonical_errs = []
fact_errs = []

for fn in untracked_files:
    fp = SEO_DIR / fn
    content = fp.read_text(encoding="utf-8", errors="ignore")
    
    # 1. Placeholders
    matches = re.findall(r'\{[a-zA-Z0-9_-]+\}', content)
    if matches:
        placeholders.append((fn, matches))
        
    # 2. Metadata
    if "<title>" not in content or '<meta name="description"' not in content:
        meta_errs.append(fn)
        
    # 3. Canonical
    expected_canonical = f"https://workindex.co.in/seo-pages/{fn}"
    if f'<link rel="canonical" href="{expected_canonical}"/>' not in content:
        canonical_errs.append(fn)
        
    # 4. Schema
    schema_m = re.search(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
    if not schema_m:
        schema_errs.append(fn)
    else:
        try:
            d = json.loads(schema_m.group(1))
            types = [item.get("@type") for item in d.get("@graph", [])]
            if "FAQPage" not in types or "Organization" not in types:
                schema_errs.append(fn)
        except Exception as e:
            schema_errs.append(f"{fn}: {e}")
            
    # 5. Facts
    if re.search(r'Section\s*111A[^\.\n]*?15%', content):
        fact_errs.append((fn, "Outdated STCG 15%"))
    if re.search(r'Old\s*Regime[^\.\n]*?standard\s*deduction[^\.\n]*?75,000', content, re.I):
        fact_errs.append((fn, "Wrong standard deduction in old regime"))

print("\n=== UNTRACKED NEW FILES AUDIT REPORT ===")
print(f"Total New Untracked Files Audited: {len(untracked_files)}")
print(f"Placeholders Found: {len(placeholders)}")
print(f"Missing Metadata: {len(meta_errs)}")
print(f"Canonical Errors: {len(canonical_errs)}")
print(f"Schema Errors: {len(schema_errs)}")
print(f"Fact-Check Errors: {len(fact_errs)}")

# Save accurate IndexNow manifest with ONLY these untracked new URLs
manifest_urls = [f"https://workindex.co.in/seo-pages/{fn}" for fn in sorted(untracked_files)]
with open(ROOT / "batch97-expansion-indexnow-urls.json", "w", encoding="utf-8") as f:
    json.dump(manifest_urls, f, indent=2)

print(f"Updated batch97-expansion-indexnow-urls.json with {len(manifest_urls)} clean URLs!")
