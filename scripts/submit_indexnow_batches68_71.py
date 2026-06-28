import json
import requests
from pathlib import Path
import time
import urllib.parse

manifest_path = Path("C:/Ravish/workindex-frontend/batches68-71-downloaded-indexnow-urls.json")

if not manifest_path.exists():
    print(f"Error: Manifest not found at {manifest_path}")
    exit(1)

urls = json.loads(manifest_path.read_text(encoding="utf-8"))
print(f"Loaded {len(urls)} URLs to submit.")

key = "2659be1032064f3daa05616e03df4296"
key_loc = f"https://workindex.co.in/{key}.txt"

print("Submitting to IndexNow API in streaming mode...")
session = requests.Session()
success_count = 0
fail_count = 0

for i, url in enumerate(urls):
    try:
        encoded_url = urllib.parse.quote(url, safe='')
        encoded_key_loc = urllib.parse.quote(key_loc, safe='')
        endpoint = f"https://api.indexnow.org/indexnow?url={encoded_url}&key={key}&keyLocation={encoded_key_loc}"
        
        response = session.get(endpoint, timeout=15)
        if response.status_code == 200:
            success_count += 1
            print(f"[{i+1}/{len(urls)}] OK   {url}")
        else:
            fail_count += 1
            print(f"[{i+1}/{len(urls)}] FAIL {response.status_code} {url}")
    except Exception as e:
        fail_count += 1
        print(f"[{i+1}/{len(urls)}] ERROR {str(e)} {url}")
        
    if i < len(urls) - 1:
        time.sleep(0.2)

print("\nStreaming Submission Completed:")
print(f"  Successfully submitted: {success_count}")
print(f"  Failed submissions:     {fail_count}")
