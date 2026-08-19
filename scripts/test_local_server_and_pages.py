import http.server
import socketserver
import threading
import time
import requests
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path("C:/Ravish/workindex-frontend")
PORT = 8999

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, format, *args):
        pass # suppress server access logs

server = socketserver.TCPServer(("", PORT), Handler)
server_thread = threading.Thread(target=server.serve_forever, daemon=True)
server_thread.start()
print(f"Local test server running on http://127.0.0.1:{PORT}")
time.sleep(0.5)

test_slugs = [
    "index.html",
    "seo-pages/new-income-tax-act-section-mapping-guide-2026.html",
    "seo-pages/section-112a-ltcg-12-5-percent-calculation-guide-complete-handbook.html",
    "seo-pages/gstat-tribunal-appeal-filing-procedure-section-112-step-by-step-guide.html",
    "seo-pages/schedule-fa-foreign-asset-disclosure-rules-black-money-act-complete-guide-2026.html",
    "seo-pages/section-43b-h-msme-15-45-day-payment-rule-compliance-step-by-step-handbook.html",
    "seo-pages/section-44ada-presumptive-tax-75-lakh-limit-rules-complete-handbook-2026.html",
    "seo-pages/section-115bbh-crypto-tax-30-percent-flat-rate-rules-complete-guide-2026.html",
    "seo-pages/trademark-registration-form-tm-a-step-by-step-guide-complete-handbook-2026.html",
    "seo-pages/hire-chartered-accountant-bangalore-indiranagar.html",
    "seo-pages/chartered-accountant-gst-itr-surat-ring-road.html"
]

all_passed = True
print("\n--- Testing HTTP status and content integrity ---")
for slug in test_slugs:
    url = f"http://127.0.0.1:{PORT}/{slug}"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            print(f"[200 OK] {slug} (Length: {len(r.text)} bytes)")
        else:
            print(f"[{r.status_code} ERROR] {slug}")
            all_passed = False
    except Exception as e:
        print(f"[EXCEPTION] {slug}: {e}")
        all_passed = False

server.shutdown()
print(f"\nLocal Test Completed! Result: {'SUCCESS - All pages 200 OK' if all_passed else 'FAILED'}")
