import os
import re
import json
import html
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path("C:/Ravish/workindex-frontend")
SEO_DIR = ROOT / "seo-pages"
MANIFEST = ROOT / "batch97-expansion-indexnow-urls.json"

with open(MANIFEST, "r", encoding="utf-8") as f:
    urls = json.load(f)

# The newly generated 2752 files
filenames = [u.split('/')[-1] for u in urls if u.endswith('.html') and len(u.split('/')[-1]) > 5]
filenames = list(set(filenames))
print(f"Auditing specifically the {len(filenames)} Batch 97 files...")

placeholders = []
schema_errs = []
meta_errs = []
canonical_errs = []
fact_errs = []

for fn in filenames:
    fpath = SEO_DIR / fn
    if not fpath.exists():
        continue
    content = fpath.read_text(encoding="utf-8", errors="ignore")
    
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

print("\n=== BATCH 97 AUDIT REPORT ===")
print(f"Total Batch 97 Files Audited: {len(filenames)}")
print(f"Placeholders Found: {len(placeholders)}")
if placeholders:
    print(f"  Placeholder files: {placeholders[:5]}")
print(f"Missing Metadata: {len(meta_errs)}")
print(f"Canonical Errors: {len(canonical_errs)}")
print(f"Schema Errors: {len(schema_errs)}")
print(f"Fact-Check Errors: {len(fact_errs)}")
