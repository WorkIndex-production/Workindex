---
name: process-seo-batches
description: Workflow for processing new SEO page batches, generating HTML pages, sorting indexer URLs, and injecting topic-specific fact-checks and FAQs in a single pass.
---

# SEO Batch Processing Workflow

Use this guide when the user downloads new SEO batches in `Downloads` (e.g. Batch 54+). It optimizes generation speed, ensures high-quality fact-checking, and avoids generic content.

## Why Sequential post-processing is slow
Under Windows, writing or editing 1,000+ files sequentially in a loop can take up to 20-30 minutes due to antivirus scanning (e.g., Windows Defender) intercepting each write lock. 

To save time, **always do it in a single pass**. Do not generate generic files first and then run a separate update script. Inject the specific content *during* the initial HTML generation.

---

## Step-by-Step Optimized Workflow

### 1. Identify and Categorize the Batches
Read the downloaded batch files (e.g., `workindex-seo-batch54.md`) from `C:\Users\LENOVO\Downloads`.
Map each slug in the batch to one of the target categories:
- **Senior Citizens / Section 80TTB / Form 15H**: Exemption limits, SCSS, 194P 75+ rule.
- **Entity Conversions & Closures**: Section 47(xiiib) company-to-LLP limits, strike-off vs winding-up, SPICe+/URC-1 21-day notice.
- **Agricultural Income Taxation**: Section 10(1) limits, partial integration steps, Section 2(14) rural land, Section 10(37).
- **Secretarial Audit & SEBI LODR**: Section 204 thresholds, SEBI LODR 24A material subsidiary, Peer-reviewed CS, MR-3.
- **Equalization Levy & Digital Tax / SEP**: 2% & 6% levy abolition dates, Significant Economic Presence (SEP) successor, Form 1.

### 2. Generate Pages in a Single Pass
Write a single generator script (e.g., `create-downloaded-seo-batches-54.py`) that incorporates the following specific templates directly during the file creation:

#### A. Specific Fact-Checks
Embed the category-specific fact check bullets directly into the HTML:
```html
<section class="wi-panel">
  <div class="lp-section-eyebrow">Fact check</div>
  <h2>Accuracy notes before you act</h2>
  <ul class="wi-detail-list">
    <!-- Category-specific <li> items here -->
  </ul>
</section>
```

#### B. Specific FAQs (For Slugs starting with `faq-`)
For FAQ pages, directly inject the 15 specific questions and answers into:
1. **JSON-LD Schema**: The `@type: "FAQPage"` entity under `@graph`'s `mainEntity`.
2. **HTML Body**: Renders under the `<section class="wi-panel"><div class="lp-section-eyebrow">Questions People Ask</div>...` section.

### 3. URL Sorting & Sitemap Rebuild
- **Sitemap**: Rebuild `sitemap.xml` with all generated files.
- **Indexer Queue (`urls.txt`)**: 
  - Read `next_index` from `C:\Ravish\indexer\progress.json` (e.g. `3318`).
  - **Preserve the first `next_index` URLs byte-for-byte** to prevent desynchronizing already-indexed progress.
  - Append the new URLs to the end, then sort the remaining pool (from `next_index` onwards) prioritizing tax-related pages.

### 4. Fast Validation
- Run the validation suite: `C:\Ravish\indexer\.venv\Scripts\python.exe C:\Users\LENOVO\.gemini\antigravity\brain\e0d9a89a-356a-49c3-9ac5-9794b8d54f2b/scratch/validate_all.py`
- Run `bulk_index.py --dry-run` to verify URLs load successfully.
