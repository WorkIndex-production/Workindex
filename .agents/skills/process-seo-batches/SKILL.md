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

---

## 5. Sub-Templates Reference & Custom Topic Matching

For any pages in the batch that are not covered by the 5 specific competitor topic overrides (buyback, MSME section 43B(h), new income tax act transition, equalization levy abolition, and unlisted shares capital gains trap) or the 4 specific subtopics (AIS/TIS/26AS, Salary & Allowances, Crypto/VDA, Online Gaming/Lottery), use the following 13 sub-templates.

### A. Sub-Templates List and Matching Rules
1. **`gst_appeals_notices`**: Matches filenames containing `gst` AND notice/appeal related terms (e.g. `appeal`, `notice`, `demand`, `scn`, `drc-0`, `drc0`, `asmt-`, `pre-deposit`, `gstat`, `show-cause`, `adjudication`), while excluding employee `notice-period-recovery`.
2. **`tax_reassessment_notices`**: Matches filenames containing: `148`, `147`, `reassessment`, `scrutiny`, `notice`, `demand`, `143-1`, `143-2`, `stay-of-demand`, `rectification`, `154`, `144`, `best-judgment`, `penalty`, `tax-evasion`, `escaping`, `assessment`, `appeal`, `dispute`, `order`, `circular`, `notification`, `challan`, `cbdt`, `cbic`, `refund`, `budget`, `surcharge`, `marginal-relief`, `234b`, `234c`, `interest`, `revision-petition`, `264`, `245`, `defective-return`, `139-9`, `e-verification`, `vivad-se-vishwas`, `itat`, `15g`, `15h`, `carry-forward-losses`, `mat`, `115bab`, `14a`, `clubbing`, `section-68`, `cash-credit`, etc.
3. **`tds_commission_brokerage`**: Matches filenames containing: `194h`, `commission`, `brokerage`.
4. **`capital_gains_exemptions`**: Matches filenames containing: `capital-gain`, `ltcg`, `stcg`, `54ec`, `54f`, `property-sale`, `gold-tax`, `mutual-fund`, `sgb`, `sovereign-gold`, `capital-loss`, `indexation`, `circle-rate`, `stamp-duty`, `50c`, `agricultural-land`, `land-conversion`, `section-54`, `section-56`, `gift`, `elss`, `nsc-interest`, `sukanya-samriddhi`, `ulip`, `grandfathering-equity`, `cost-inflation-index`, `indexed-cost`, `depreciation-rates`, `goodwill-depreciation`, `rule-11ua-valuation`, `angel-tax`, `fno-loss`, `fo-losses`, `fo-turnover`, `stt`.
5. **`ngo_trust_compliance`**: Matches filenames containing: `ngo`, `trust`, `12a`, `12ab`, `80g`, `fcra`, `donation`, `charitable`, `religious`, `darpan`, `csr`, `section-8`, `form-10ab`.
6. **`aar_aaar_rulings`**: Matches filenames containing: `aar`, `aaar`, `appellate-ruling`, `advance-ruling`, `ruling`, `profiteering`, `anti-profiteering`, `gstin-structure`, `hsn-code`, `place-of-supply`, `e-invoice`, `irn-qr-code`, `eway-bill`, `isd`, `input-service-distributor`, `cross-charge`, `itc-04`, `job-work`, `itc-on-construction`, `itc-on-motor`, `demo-vehicles-itc`, `blocked-itc`, `section-17-5`, `composite-vs-mixed`, `principal-supply`, `qrmp-scheme`, `rcm`, `reverse-charge`, `gstat`, `cbic-circular`, `goods-on-approval`, `sad-refund`, `duty-drawback`, `fta-preferential`, `customs`, `import`, `export`, `iec`, `bill-of-entry`, `shipping-bill`, `trade`, `anti-dumping`, `advance-authorization`, `dgft`, `epcg`, `ims`, `ecrs`, `itc-denied`, `classification-case`, `ecommerce-seller`, `lut-filing`, `rodtep`, `itc`.
7. **`lrs_tcs_remittance`**: Matches filenames containing: `lrs`, `remittance`, `tcs`, `forex`, `foreign-transfer`, `sending-money-abroad`, `form-118`.
8. **`dtaa_nri_compliance`**: Matches filenames containing: `dtaa`, `double-tax`, `nri`, `schedule-fa`, `foreign-asset`, `foreign-share`, `beps`, `base-erosion`, `transfer-pricing`, `arms-length`, `equalisation-levy`, `oecd-pillar-two`, `rnor-status`, `nro-to-nre`, `nro-nre-1-million`, `permanent-establishment`, `significant-economic-presence`, `apa-rollback`, `master-file`, `local-file`, `country-by-country-reporting`, `fdi-`, `focc-downstream`, `odi-`, `gift-city`, `ifsc-unit`, `equalization-levy`, `fema`, `form-10f`, `form-13-`, `form-15ca`, `form-15cb`, `form-a2`, `black-money`, `specified-domestic`, `stpi`, `softex`, `section-9`, `3ceb`.
9. **`presumptive_taxation`**: Matches filenames containing: `44ad`, `44ada`, `44ae`, `presumptive`, `freelancer`, `content-creator`, `influencer`, `fiverr-invoices`, `home-office-deduction`, `platform-fee`, `business-expense-documentation`, `content-creation`.
10. **`audit_udin_compliance`**: Matches filenames containing: `audit`, `udin`, `statutory-audit`, `tax-audit`, `mr-3`, `secretarial-audit`, `caro`, `accountant`, `auditor`, `balance-sheet`, `bookkeep`, `accounting`, `peer-review`, `ledger`, `books-of-accounts`, `tally`, `zoho`, `bad-debts`, `net-worth-certificate`, `utilization-certificate`, `turnover-certificate`, `working-capital-certificate`, `virtual-cfo`, `cfo`, `kpi-dashboard`, `mis-dashboard`, `mis-reporting`, `budgeting-forecasting`, `cash-flow-management`, `financial-modeling`, `business-plan`, `cma-data`, `co-lending`, `loan-documentation`, `loan-restructuring`, `mudra-loan`, `digital-lending`, `npa-90-day`, `npa-classification`, `willful-defaulter`, `debt-recovery`, `collateral-valuation`, `bank-fraud`, `asset-tracing`, `vendor-fraud`, `whistleblower`, `forensic`, `ind-as`, `internal-financial-controls`, `credit-rating`, `valuation`.
11. **`trademark_ip_compliance`**: Matches filenames containing: `trademark`, `patent`, `copyright`, `ipr`, `ip-valuation`, `objection-reply`, `brand-name`, `logo`, `design-registration`, `deceptive-similarity`, `google-ads-infringement`.
12. **`salary_allowances_pf`**: Matches filenames containing: `salary`, `allowance`, `payroll`, `pf`, `epf`, `ctc`, `form-16`, `pay-slip`, `salary-slip`, `gratuity`, `bonus`, `provident`, `esi`, `professional-tax`, `annuity`, `pension`, `superannuation`, `posh`, `labor-codes`, `wrongful-termination`, `esop`, `rsu`, `vesting`, `flexible-benefit`, `standard-deduction`, `full-and-final`, `form-12b`, `80e`, `80d`, `parents-health`, `nps-tier`.
13. **`legal_nclt_insolvency`**: Matches filenames containing: `nclt`, `nclat`, `ibc`, `court`, `insolvency`, `liquidation`, `strike-off`, `closure`, `benami`, `legal`, `evidence-act`, `nyaya`, `civil`, `arbitration`, `contract`, `agreement`, `nda`, `sha`, `board-resolution`, `board-meeting`, `partnership`, `proprietorship`, `startup`, `llp`, `roc`, `mca`, `director`, `incorporation`, `udyam`, `msme`, `fssai`, `shop-establishment`, `dividend`, `shareholder`, `guarantor`, `clause`, `sebi`, `insider-trading`, `takeover-code`, `drhp`, `rights-issue`, `qip`, `sme-ipo`, `related-party-transaction`, `mgt-14`, `dir-8`, `spice-plus`, `annual-compliance`, `agm-video`, `will`, `succession`, `probate`, `estate-succession`, `gift-deed`, `family-settlement`, `mediation`, `drt`, `nfra`, `cirp`, `resolution-professional`, `wealth-management`, `stressed-asset`, `pmla`, `private-limited-vs-opc`, `small-company-threshold`, `term-sheet`, `managerial-remuneration`.

### B. Custom Handling and Dynamic FAQs
To avoid semantic mismatches, **always replace the first two FAQs dynamically** with topic-specific questions and answers. Use the `get_dynamic_faqs(sub_template_name, topic)` function to formulate these dynamically using the parsed `{topic}`.

### C. Mismatches and Future Batch Policy
> [!IMPORTANT]
> If a future page's heading/filename does not match any of these 12 sub-templates, **do not map it to a generic or wrong category**.
> 1. Conduct thorough research on the new topic.
> 2. Create a new sub-template with its own panels and FAQs.
> 3. Register and document the new template/rules in this `SKILL.md` file.
> 4. Add the new template to `SUB_TEMPLATES` and mapping rules to `map_file_to_sub_template()` in `enrich_all_blog_pages.py`.

