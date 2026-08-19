import os
import re
import json
import html
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

SEO_DIR = Path("C:/Ravish/workindex-frontend/seo-pages")
all_files = sorted(list(SEO_DIR.glob("*.html")))

# Identify the 2,752 newest files
new_files = [f for f in all_files if f.stat().st_mtime > 1755600000]
print(f"Auditing all {len(new_files)} newly created pages...")

placeholders_found = []
schema_errors = []
meta_errors = []
canonical_errors = []
fact_errors = []

for idx, fpath in enumerate(new_files):
    if (idx + 1) % 500 == 0 or idx == len(new_files) - 1:
        print(f"  Audited {idx + 1} / {len(new_files)} pages...")
        
    content = fpath.read_text(encoding="utf-8", errors="ignore")
    
    # 1. Placeholders
    if "{" in content and "}" in content:
        matches = re.findall(r'\{[a-zA-Z0-9_-]+\}', content)
        if matches:
            placeholders_found.append((fpath.name, matches))
            
    # 2. Meta tags
    if "<title>" not in content or "</title>" not in content:
        meta_errors.append((fpath.name, "Missing <title>"))
    if '<meta name="description"' not in content:
        meta_errors.append((fpath.name, "Missing description"))
        
    # 3. Canonical
    expected_canonical = f"https://workindex.co.in/seo-pages/{fpath.name}"
    if f'<link rel="canonical" href="{expected_canonical}"/>' not in content:
        canonical_errors.append((fpath.name, "Canonical mismatch"))
        
    # 4. JSON-LD Schema
    schema_m = re.search(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
    if not schema_m:
        schema_errors.append((fpath.name, "Missing JSON-LD script"))
    else:
        try:
            d = json.loads(schema_m.group(1))
            types = [item.get("@type") for item in d.get("@graph", [])]
            if "FAQPage" not in types or "Organization" not in types:
                schema_errors.append((fpath.name, "Incomplete schema graph"))
        except Exception as e:
            schema_errors.append((fpath.name, f"JSON decode error: {e}"))
            
    # 5. Fact checks
    if re.search(r'Section\s*111A[^\.\n]*?15%', content):
        fact_errors.append((fpath.name, "Outdated STCG 15%"))
    if re.search(r'Old\s*Regime[^\.\n]*?standard\s*deduction[^\.\n]*?75,000', content, re.I):
        fact_errors.append((fpath.name, "Wrong standard deduction in old regime"))

print("\n=== EXPANSION AUDIT RESULTS ===")
print(f"Total Pages Audited: {len(new_files)}")
print(f"Placeholders Found: {len(placeholders_found)}")
print(f"Missing Metadata: {len(meta_errors)}")
print(f"Canonical Errors: {len(canonical_errors)}")
print(f"Schema Errors: {len(schema_errors)}")
print(f"Fact-Check Errors: {len(fact_errors)}")
