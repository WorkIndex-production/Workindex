---
name: process-seo-batches
description: Workflow for processing new SEO page batches, generating HTML pages, sorting indexer URLs, submitting via IndexNow, and deploying to production.
---

# SEO Batch Processing Workflow

Use this guide when the user downloads new SEO batches in `Downloads` (e.g., Batch 54+). It optimizes generation speed, ensures high-quality fact-checking, and details all deployment/indexing steps.

---

## 1. Single-Pass Implementation
Under Windows, writing or editing 1,000+ files sequentially in a loop can take up to 20-30 minutes due to antivirus scanning (e.g., Windows Defender) intercepting each write lock. 

To save time, **always do it in a single pass**. Do not generate generic files first and then run a separate update script. Inject the specific content, fact-checks, and FAQs *during* the initial HTML generation.

---

## 2. Generation Rules & Quality Checks

### A. Duplicate Checking
- Verify all proposed slugs in the new batch against the running master list (existing files in `seo-pages/` and the sitemap) before generation to ensure zero-coverage overlap.

### B. Brand Naming Conventions
- Always include both brand names: `WorkIndex` and `Work Index` (as the organization name and alternate name) in standard spacing in page titles, descriptions, and the `@graph` schema.
- Example meta description: `[Title] in India. Check facts, documents, official portals, deadlines, risks and expert brief before hiring on the WorkIndex work index.`

### C. Fact-Checking & Competitor Cross-Referencing
- If cross-referencing competitor pages, **never copy competitor details blindly** (they often contain outdated limits, sections, or dates). Always verify facts against official portals (Income Tax, GST, MCA).
- Ensure compliance with the current financial year rules (e.g., FY 2025-26 / AY 2026-27):
  - **Senior Citizens / Section 80TTB**: Old Regime basic exemptions (₹3L for 60-79, ₹5L for 80+) vs. default New Regime (₹4L for all). Section 80TTB limit is ₹50,000 (doubled to ₹1,00,000 under Budget 2026). Section 194P / Form 125 rules for 75+ age exemption.
  - **Agricultural Income**: Fully exempt under Section 10(1) ONLY if land is in India. Non-agricultural income rate increases via the "partial integration" method. Rural land is not a capital asset under Section 2(14); urban compulsory acquisitions can be exempt under Section 10(37). Income Tax Bill 2025 proposals (stricter documentation, urban land rentals taxable, value-added processing taxable).
  - **Secretarial Audit**: Mandatory under Section 204 (listed companies; public companies with paid-up capital >= ₹50 cr or turnover >= ₹250 cr; any company with outstanding PFI/bank loans >= ₹100 cr). SEBI LODR 24A material subsidiary audit (>10% net worth/income consolidated). Listed entities must appoint a Peer-Reviewed CS from April 1, 2025. MCA Chennai ROC Adjudication Order (Jan 7, 2026) penalty of ₹2,00,000 per director for MR-3 default.
  - **Equalization Levy**: 2% e-commerce levy was withdrawn from August 1, 2024. 6% Google Tax on online ads was abolished from April 1, 2025. Significant Economic Presence (SEP) is the successor digital taxing mechanism under Section 9(1)(i). Historical Form 1 return obligations remain active.

### D. Specific FAQs (For Slugs starting with `faq-`)
- Replace generic questions with 15 highly specific, fact-checked questions and answers directly addressing the page's topic category. Update both:
  1. **JSON-LD Schema**: The `@type: "FAQPage"` entity under `@graph`'s `mainEntity`.
  2. **HTML Body**: Rendered within the `<section class="wi-panel"><div class="lp-section-eyebrow">Questions People Ask</div>...` block.

### E. Blog Pages (For Slugs starting with `blog-`)
- Blog pages must represent in-depth, topic-specific guides and avoid generic placeholders.
- Classify blog pages into 6 thematic categories: **GST**, **TDS/TCS**, **ITR & Income Tax**, **MCA & Corporate Law**, **Salary & EPF Compliance**, and **General Finance/Investments**.
- For each category, replace the generic checklists with 4 custom panels (What this page helps you decide, Accuracy notes before you act, Documents and facts to keep ready, and Common mistakes to avoid) and 15 custom FAQs.
- Update both the **JSON-LD Schema** and the **HTML body FAQ container** with the 15 category FAQs.
- **Dynamic Country-Specific DTAA/NRI rates**: If a country (e.g. USA, UK, Singapore, UAE, Germany, Canada, Australia) is mentioned in the file context, dynamically inject their specific treaty withholding tax rates (e.g., 15% or 25% for US, 10% or 15% for Singapore, 10% for UAE/Germany, 15% for UK/Australia) and double-taxation relief details (TRC, Form 10F, Form 1116) into the NRI FAQs. Keep the total FAQ list to exactly 15 questions to prevent layout/validator breakage.
- **Competitor Topic Overrides**: Implement long-form, custom-rendered overrides for the following topics:
  1. **Share Buyback Taxation (`blog-buyback-proceeds-deemed-dividend.html`)**: Detail the pre-Oct 2024, Oct 2024 - Mar 2026, and April 2026 onwards tax regimes (Section 115QA, Section 2(22)(f), Section 46A). Highlight the double-taxation "phantom loss" trap, promoter differential tax rates, worked math examples, and the legal/constitutional entry 82 competence debate u/s 2(22)(f).
  2. **Section 43B(h) MSME Payment Rule (`blog-section-43b-msme-payment-rule.html`)**: Detail the 15/45-day payment deadline, micro vs small vs medium size/turnover criteria, year-end add-back disallowance, the exclusion of retail/wholesale traders, and compound interest penalties at three times the RBI bank rate.
  3. **New Income Tax Act Transition (`blog-new-income-tax-act-2025.html`, `blog-income-tax-act-2025-section-mapping.html`)**: Explain the draft review, default New Tax Regime default mapping, and transition mapping of old section numbers.
  4. **Equalization Levy Abolition (`blog-what-replaced-equalization-levy.html`, `blog-why-india-scrapped-the-google-tax.html`)**: Explain the abolition of the 2% e-commerce levy, Significant Economic Presence (SEP) rules (₹2 cr / 3 lakh user thresholds), and OECD Pillar Two global minimum tax.
  5. **Unlisted Shares Capital Gains Trap (`blog-unlisted-shares-24-month-ltcg-trap.html`, etc.)**: Detail the 24-month LTCG holding period, 12.5% rate without indexation, and Section 50CA / Rule 11UA FMV tax trap.


---

## 3. Sitemap & Indexer Sorting

### A. Sitemap Update
- Re-generate `sitemap.xml` with all generated files.
- **Sitemap Cleanliness Check**: Ensure that every URL in `sitemap.xml` is unique, corresponds to a valid generated page, has the correct prefix, and uses correct tags.

### B. Indexer Queue (`urls.txt`)
- Read the active `next_index` from `C:\Ravish\indexer\progress.json` (e.g., `3318`).
- **Preserve the first `next_index` URLs byte-for-byte** to protect already-indexed progress from desynchronizing.
- Append new URLs to the end.
- Sort the remaining pool (from `next_index` onwards) to **prioritize tax-related pages first** (placing ITR, GST, TDS, senior citizen, and agricultural tax pages ahead of general corporate/legal pages).

---

## 4. Submission & Deployment

### A. Bing Webmaster / IndexNow Submission
- Write out the newly created URLs to a JSON manifest (e.g. `batches50-53-downloaded-indexnow-urls.json`).
- Submit the new URLs to Bing/Yandex Webmaster via the IndexNow API using our shared keys.

### B. Validation checks
- Run the validation suite: `C:\Ravish\indexer\.venv\Scripts\python.exe [validate_all_path]` to check that no generic text blocks remain, slabs match current tax codes, and files have fact-checked statuses.
- Run `bulk_index.py --dry-run` to verify that the indexer loads all sitemap URLs successfully.

### C. Live Status Checks
- Verify a few of the newly generated files by running a local server or curl checks:
  - Run the local dev server.
  - Request a couple of the new pages (e.g. using `curl -I http://localhost:3000/seo-pages/[page-name].html`) and confirm they return a **200 OK** HTTP status.

### D. Production Deployment
- Stage all new files: `git add seo-pages/ sitemap.xml`
- Commit changes: `git commit -m "feat: generate and deploy batches X-Y with customized fact-checks and sorted indexer URLs"`
- Push to production: `git push origin main`
