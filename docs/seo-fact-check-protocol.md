# WorkIndex SEO Fact-Check Protocol

Last updated: 2026-05-25

## Calculator Pages

Any page with `calculator` in the slug, title, H1, or schema must include a working calculator. Do not publish "calculator concept" pages.

Every calculator brief must provide:

- Applicable financial year / assessment year / tax year
- Governing law or notification
- Official source URL or local source file
- Formula and assumptions
- Inputs and outputs
- Edge cases excluded from the calculator
- Golden test examples with expected results
- Last fact-checked date

Calculator pages must load the shared calculator engine at `/js/wi-calculators.js` unless a more specific audited engine is created.

## Tax and GST Pages

Use official sources first:

- Income Tax e-Filing portal: `https://www.incometax.gov.in/iec/foportal/`
- Income tax returns and validation rules: `https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns`
- ICAI BoS material: `https://boslive.icai.org/sm_module.php?module=157`
- Local Income Tax Act, 2025 PDF supplied for transition-year checks: `C:\Users\ganap\Downloads\Income-tax-Act-2025_1772714227.pdf`
- GST portal: `https://www.gst.gov.in/`
- CBIC GST: `https://cbic-gst.gov.in/`

Competitor pages may be used for UX and topic discovery only. They are not a source of legal truth.

## Year Separation Rule

Do not mix AY 2026-27 with Tax Year 2026-27.

- AY 2026-27 maps to FY 2025-26 and uses the Income-tax Act, 1961 as applicable to that assessment year.
- Tax Year 2026-27 starts from 1 April 2026 under the Income Tax Act, 2025.

When a page discusses both, state the distinction visibly.

## Required Income Tax Calculator Golden Cases

- AY 2026-27, resident individual, old regime, taxable income `15,99,000`: income tax `2,92,200`, cess `11,688`, total `3,03,888`.
- FY 2025-26 / AY 2026-27, resident individual, new regime, gross salary `12,50,000`: standard deduction `75,000`, taxable income `11,75,000`, Section 87A rebate wipes out slab tax, total tax `0`.
- FY 2025-26 / AY 2026-27, resident individual, new regime, gross salary `12,75,000`: standard deduction `75,000`, taxable income `12,00,000`, total tax `0`.
- Special-rate income must be calculated separately and must not be reduced by Section 87A rebate in the calculator.

## Generator Guardrail

Before any SEO batch is committed, run:

```bash
node scripts/validate-seo-calculators.js
```

The validator must fail if calculator pages are missing the shared engine, still contain concept placeholders, or fail golden calculation cases.
