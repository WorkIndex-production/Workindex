import json
from pathlib import Path

manifest_path = Path("C:/Ravish/workindex-frontend/batches63-66-downloaded-indexnow-urls.json")
urls_file = Path("C:/Ravish/indexer/urls.txt")
progress_file = Path("C:/Ravish/indexer/progress.json")

# 1. Read next_index from progress.json
progress = json.loads(progress_file.read_text(encoding="utf-8"))
next_index = progress.get("next_index", 4313)
print(f"next_index from progress.json is {next_index}")

# 2. Load new URLs from manifest
new_urls = json.loads(manifest_path.read_text(encoding="utf-8"))
print(f"Loaded {len(new_urls)} new URLs from manifest.")

# 3. Read existing urls.txt
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

print(f"Current URLs in urls.txt: {len(urls)}")

# 4. Check for duplicates and filter new URLs
existing_set = set(urls)
unique_new_urls = []
duplicate_count = 0
for url in new_urls:
    if url in existing_set:
        duplicate_count += 1
    else:
        unique_new_urls.append(url)

print(f"New URLs already present in urls.txt (duplicates): {duplicate_count}")
print(f"Unique new URLs to add: {len(unique_new_urls)}")

# 5. Partition based on next_index (preserved prefix)
preserved_urls = urls[:next_index]
remaining_urls = urls[next_index:] + unique_new_urls

# 6. Define tax keywords for sorting
positive_keywords = [
    # General income tax & filings
    "itr", "income-tax", "income-taxation", "tds", "tcs", "slab", "regime", "outstanding-tax",
    "double-taxation", "double-tax", "tax-free", "tax-saving", "tax-planning", "tax-audit",
    "tax-exemption", "tax-exempt", "tax-rebate", "tax-relief", "salary-tax",
    
    # NRI & LRS
    "nri", "dtaa", "rnor", "143-1", "26as", "ais", "tis", "form-10f", "form-67",
    "remittance", "repatriation", "form-15ca", "form-15cb", "remit", "repat",
    "lrs", "194r", "form-99", "form-115", "form-117", "form-118", "form-145", "form-146",
    
    # Sections & deductions
    "80c", "80d", "80g", "80e", "80u", "80dd", "80ee", "80tt", "80ia", "80-iac", "80ccd", "87a", "115bac", "115jb", "115jc",
    "section-44", "section-194", "section-143", "section-148", "section-10", "section-24", "section-54", "section-112", "section-111", "section-80",
    "section-89", "section-43b", "section-195", "section-234", "section-271", "section-12a", "section-115",
    "section-89", "section-43b", "section-195", "section-234", "section-271", "section-12a", "section-115",
    
    # Capital gains
    "capital-gains", "capital-gain", "capital-loss", "carry-forward", "stt-hike", "stt-increase",
    
    # Forms
    "form-16", "form-15g", "form-15h", "form-12bb", "form-10e", "form-35", "form-36", "form-26qb", "form-26qc", "form-26qd",
    
    # Tax saving instruments
    "elss", "ppf", "nps", "sgb", "nsc", "scss",
    
    # Salaried tax planning
    "gratuity-exemption", "salary-restructuring", "salary-slip", "ctc-vs-take-home", "family-pension-deduction",
    
    # Return deadlines & status
    "belated-return", "updated-return", "defective-return",
    
    # Budget tax changes
    "budget-2026-stt", "budget-2026-impact-salaried", "budget-2026-impact-stock", "budget-2026-impact-real-estate", 
    "rebate-87a", "esop-deferral-budget",
    
    # CA certification / UDIN related to tax
    "net-worth-certificate", "turnover-certificate", "udin", "foreign-remittance",
    
    # Senior citizen tax
    "senior-citizen", "super-senior-citizen", "pensioner", "retirement",
    
    # RSUs & ESOPs
    "rsu", "esop", "stock-option", "foreign-share", "vesting", "exercise", "perquisite",
    
    # Agricultural income
    "agricultural-income", "agriculture", "farm-income", "farm-land",

    # GIFT City & IFSC
    "gift-city", "ifsc",

    # Online gaming & fantasy sports
    "gaming", "fantasy", "194ba", "poker", "rummy",

    # OIDAR / Digital Economy
    "oidar",

    # Succession, Will, Nominee, Estate
    "will", "nominee", "heir", "succession", "estate-tax", "transmission", "demat-death",

    # Angel tax & buyback
    "angel-tax", "56-2-viib", "buyback", "115qa", "deemed-dividend"
]

general_tax_keywords = ["tax", "taxation", "taxes", "taxable", "taxpayer"]

tax_urls = []
other_urls = []

for url in remaining_urls:
    url_lower = url.lower()
    is_tax = False
    
    # Check positive keywords
    for kw in positive_keywords:
        if kw in url_lower:
            is_tax = True
            break
            
    # Check general tax keywords with exclusion logic
    if not is_tax:
        for kw in general_tax_keywords:
            if kw in url_lower:
                is_excluded = False
                if "gst" in url_lower or "customs" in url_lower or "import-duty" in url_lower or "property-tax" in url_lower or "municipal-tax" in url_lower:
                    is_excluded = True
                if "professional-tax" in url_lower:
                    is_excluded = True
                
                if not is_excluded:
                    is_tax = True
                    break
 
    if is_tax:
        tax_urls.append(url)
    else:
        other_urls.append(url)

# Reordered pools are sorted alphabetically for stability
tax_urls.sort()
other_urls.sort()

print(f"\nSorting stats:")
print(f"Preserved URLs count    : {len(preserved_urls)}")
print(f"Tax-related URLs count  : {len(tax_urls)}")
print(f"Other URLs count        : {len(other_urls)}")
print(f"Total reordered pool    : {len(tax_urls) + len(other_urls)}")

# Reassemble
final_urls = preserved_urls + tax_urls + other_urls

# Write a backup first
backup_file = urls_file.with_name("urls.txt.bak")
backup_file.write_text("\n".join(urls) + "\n", encoding="utf-8")
print(f"Backup written to {backup_file}")

# Write to urls.txt with trailing newline
urls_file.write_text("\n".join(final_urls) + "\n", encoding="utf-8")
print("\nUpdated urls.txt written successfully.")

# Sanity Check Verification
new_content = urls_file.read_text(encoding="utf-8").splitlines()
new_processed_urls = []
new_seen = set()
for line in new_content:
    url = line.strip()
    if not url or url.startswith("#"):
        continue
    if url in new_seen:
        continue
    new_seen.add(url)
    new_processed_urls.append(url)

print("\n--- SANITY CHECK RESULTS ---")
expected_total = len(urls) + len(unique_new_urls)
print(f"New total URLs count    : {len(new_processed_urls)} (Expected: {expected_total})")
assert len(new_processed_urls) == expected_total, f"Error: URL count mismatch!"
print("  [PASS] URL count is exactly correct")

# Verify preserved prefix is identical
for idx, (orig, new_val) in enumerate(zip(preserved_urls, new_processed_urls[:next_index])):
    assert orig == new_val, f"Error: Preserved URL at index {idx} changed!\nOriginal: {orig}\nNew     : {new_val}"
print(f"  [PASS] First {next_index} URLs are identical byte-for-byte")

# Verify tax priority start
print(f"Index {next_index} (line {next_index+1}) URL: {new_processed_urls[next_index]}")
is_idx_tax = "tax" in new_processed_urls[next_index].lower() or any(kw in new_processed_urls[next_index].lower() for kw in positive_keywords)
print(f"  Is index {next_index} tax-related? {is_idx_tax}")

# Check duplicate check
assert len(new_processed_urls) == len(set(new_processed_urls)), "Error: Duplicates found in new URLs list!"
print("  [PASS] No duplicates found in new URLs list")
print("----------------------------\n")
