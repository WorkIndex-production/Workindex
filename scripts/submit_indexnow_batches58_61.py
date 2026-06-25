import json
import requests
from pathlib import Path

manifest_path = Path("C:/Ravish/workindex-frontend/batches58-61-downloaded-indexnow-urls.json")

if not manifest_path.exists():
    print(f"Error: Manifest not found at {manifest_path}")
    exit(1)

urls = json.loads(manifest_path.read_text(encoding="utf-8"))
print(f"Loaded {len(urls)} URLs to submit.")

# Payload
key = "2659be1032064f3daa05616e03df4296"
payload = {
    "host": "workindex.co.in",
    "key": key,
    "keyLocation": f"https://workindex.co.in/{key}.txt",
    "urlList": urls
}

print("Submitting to IndexNow API...")
response = requests.post(
    "https://api.indexnow.org/indexnow",
    headers={"Content-Type": "application/json"},
    json=payload,
    timeout=30
)

print(f"Status Code: {response.status_code}")
try:
    print(f"Response: {response.json()}")
except Exception:
    print(f"Response (text): {response.text}")
