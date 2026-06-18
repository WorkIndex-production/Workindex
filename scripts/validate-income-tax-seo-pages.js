const fs = require("fs");
const path = require("path");

const root = process.cwd();
const seoDir = path.join(root, "seo-pages");

const slugPatterns = [
  "income-tax",
  "itr-",
  "itr-filing",
  "itr-for",
  "tds",
  "tcs",
  "form-",
  "section-",
  "tax-regime",
  "capital-gains",
  "hra",
  "vda",
  "crypto",
  "advance-tax",
  "ais",
  "26as",
  "outstanding-tax-demand",
  "tax-benefit",
  "tax-deduction",
  "tax-notice",
  "tax-demand",
  "tax-refund",
  "tax-saving",
  "mutual-fund-tax",
  "home-loan-tax",
  "education-loan",
  "44ad",
  "44ada",
  "44ae",
  "zero-tax",
  "nri",
  "dtaa",
  "rnor",
  "repatriation",
  "remittance",
];

const genericText = [
  /practical India-focused guidance/i,
  /Clear guidance before you hire/i,
  /Calculator widget concept/i,
  /Search widget concept/i,
  /How to compare WorkIndex responses/i,
  /Keep these ready before requesting quotes/i,
  /WorkIndex Posting Tips/i,
  /Is posting on WorkIndex free\?/i,
  /Can this be handled online\?/i,
  /How should I compare quotes\?/i,
];

const unsafeClaims = [
  { re: /Rs\. 3-7 lakh|Rs\. 7-10 lakh|Rs\. 10-12 lakh|Rs\. 12-15 lakh/i, msg: "Outdated AY 2025-26 new-regime slab wording found." },
  { re: /Form 130 (applies|replaces|will replace|is mandatory)/i, msg: "Form 130 stated as definitive instead of transition-tracked." },
  { re: /Form 131 (applies|replaces|will replace|is mandatory)/i, msg: "Form 131 stated as definitive instead of transition-tracked." },
  { re: /TCS (?:is |simplified to |reduced to )?flat 2%/i, msg: "TCS flat 2% stated as definitive." },
  { re: /ITR-3 and ITR-4 Deadline\s*-\s*August 31, 2026/i, msg: "Unverified August 31 ITR deadline stated as definitive." },
  { re: /Bengaluru, Pune, Hyderabad and Ahmedabad now qualify/i, msg: "HRA 8-city claim stated as definitive." },
  { re: /Income Tax Rules 2026 are the procedural backbone/i, msg: "Unverified Income Tax Rules 2026 assertion found." },
];

const allowNoFactCheck = [
  /^best-/,
  /^gst-/,
  /^llp-/,
];

function isTarget(name) {
  return name.endsWith(".html") && slugPatterns.some((p) => name.includes(p));
}

function shouldRequireFactCheck(name) {
  if (!isTarget(name)) return false;
  if (allowNoFactCheck.some((re) => re.test(name))) return false;
  return true;
}

const failures = [];

for (const name of fs.readdirSync(seoDir)) {
  if (!isTarget(name)) continue;
  const file = path.join(seoDir, name);
  const html = fs.readFileSync(file, "utf8");

  for (const re of genericText) {
    if (re.test(html)) failures.push(`${name}: generic placeholder/hiring copy remains: ${re}`);
  }

  for (const rule of unsafeClaims) {
    if (rule.re.test(html)) failures.push(`${name}: ${rule.msg}`);
  }

  if (shouldRequireFactCheck(name) && !/Last fact-checked|Official fact-check status/i.test(html)) {
    failures.push(`${name}: missing visible fact-check status.`);
  }

  if (/AY 2026-27/i.test(html) && /Income Tax Act, 2025/i.test(html) && !/Income-tax Act, 1961|1961 Act/i.test(html)) {
    failures.push(`${name}: mentions AY 2026-27 and 2025 Act without clarifying the 1961 Act transition.`);
  }
}

if (failures.length) {
  console.error(`Income-tax SEO validation failed with ${failures.length} issue(s):`);
  for (const failure of failures.slice(0, 200)) console.error(`- ${failure}`);
  if (failures.length > 200) console.error(`...and ${failures.length - 200} more`);
  process.exit(1);
}

console.log("Income-tax SEO validation passed.");
