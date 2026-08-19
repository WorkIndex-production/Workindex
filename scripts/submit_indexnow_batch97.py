import json
import requests
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

manifest_path = Path("C:/Ravish/workindex-frontend/batch97-expansion-indexnow-urls.json")

if not manifest_path.exists():
    print(f"Error: Manifest not found at {manifest_path}")
    sys.exit(1)

urls = json.loads(manifest_path.read_text(encoding="utf-8"))
print(f"Loaded {len(urls)} URLs for IndexNow submission.")

key = "2659be1032064f3daa05616e03df4296"
key_loc = f"https://workindex.co.in/{key}.txt"
host = "workindex.co.in"

# IndexNow batch payload (supports up to 10,000 URLs per POST)
payload = {
    "host": host,
    "key": key,
    "keyLocation": key_loc,
    "urlList": urls
}

headers = {
    "Content-Type": "application/json; charset=utf-8"
}

endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow"
]

print("\nSubmitting batch to IndexNow endpoints...")
for ep in endpoints:
    try:
        res = requests.post(ep, json=payload, headers=headers, timeout=30)
        print(f"[{ep}] Response: {res.status_code} ({res.reason})")
        if res.status_code in [200, 202]:
            print(f"  -> Successfully accepted {len(urls)} URLs by {ep}!")
        else:
            print(f"  -> Response text: {res.text[:200]}")
    except Exception as e:
        print(f"[{ep}] Error: {e}")

print("\nIndexNow batch submission completed successfully!")
