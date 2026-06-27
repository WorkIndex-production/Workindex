import os
import sys
import re

sitemap_path = 'C:/Ravish/workindex-frontend/sitemap.xml'

if not os.path.exists(sitemap_path):
    print("sitemap.xml not found!")
    sys.exit(1)

with open(sitemap_path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Checking sitemap: {sitemap_path}")
print(f"File size: {len(content)} bytes")

errors = []

# 1. Basic formatting checks
if not content.startswith('<?xml version="1.0" encoding="UTF-8"?>'):
    errors.append('Sitemap does not start with standard XML declaration: <?xml version="1.0" encoding="UTF-8"?>')

if '<urlset' not in content or 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' not in content:
    errors.append('Sitemap is missing a valid <urlset> tag with correct xmlns namespace.')

if not content.strip().endswith('</urlset>'):
    errors.append('Sitemap does not end with closing </urlset> tag.')

# Check for conflict markers
lines = content.splitlines()
for idx, line in enumerate(lines, 1):
    if '<<<<<<<' in line or '=======' in line or '>>>>>>>' in line:
        errors.append(f"Conflict marker found on line {idx}: {line}")

# 2. Extract URLs and validate tags
url_blocks = re.findall(r'<url>([\s\S]*?)</url>', content)
urls = []
seen = set()
duplicates = 0

for block in url_blocks:
    loc_match = re.search(r'<loc>([\s\S]*?)</loc>', block, re.I)
    if not loc_match:
        errors.append(f"A <url> block is missing a <loc> tag. Content: {block}")
        continue
        
    loc = loc_match.group(1).strip()
    urls.append(loc)
    
    if loc in seen:
        errors.append(f"Duplicate URL found: {loc}")
        duplicates += 1
    else:
        seen.add(loc)
        
    if not loc.startswith('https://workindex.co.in/'):
        errors.append(f"Invalid domain or prefix in URL: {loc}")
        
    cf_match = re.search(r'<changefreq>([\s\S]*?)</changefreq>', block, re.I)
    if cf_match:
        cf = cf_match.group(1).strip()
        if cf not in ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']:
            errors.append(f"Invalid changefreq value \"{cf}\" for URL: {loc}")
            
    p_match = re.search(r'<priority>([\s\S]*?)</priority>', block, re.I)
    if p_match:
        try:
            p = float(p_match.group(1).strip())
            if p < 0.0 or p > 1.0:
                errors.append(f"Invalid priority value \"{p_match.group(1)}\" for URL: {loc}")
        except ValueError:
            errors.append(f"Invalid priority value \"{p_match.group(1)}\" for URL: {loc}")

print(f"Total URLs found: {len(urls)}")
print(f"Unique URLs found: {len(seen)}")
print(f"Duplicate URLs found: {duplicates}")

if errors:
    print("\n--- Sitemap Validation Failed! ---")
    for err in errors[:50]:
        print(f"Error: {err}")
    if len(errors) > 50:
        print(f"...and {len(errors) - 50} more errors.")
    sys.exit(1)
else:
    print("\n--- Sitemap Validation Passed! ---")
    print("Valid XML format: OK")
    print("No conflict markers: OK")
    print("No duplicate URLs: OK")
    print("All URLs belong to workindex.co.in: OK")
    sys.exit(0)
