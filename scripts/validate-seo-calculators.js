const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const seoDir = path.join(root, 'seo-pages');
const calculatorEngine = path.join(root, 'js', 'wi-calculators.js');

const requiredPages = [
  'income-tax-calculator.html',
  'income-tax-calculator-ay-2026-27.html',
  'salary-tax-calculator.html',
  'freelance-tax-calculator.html',
  'advance-tax-calculator.html',
  'tds-calculator-india.html',
  'tds-return-late-fee-calculator.html',
  'gst-calculator.html',
  'gst-2-rate-calculator.html',
  'gst-interest-calculator.html',
  'gst-late-fee-calculator.html',
  'hra-exemption-calculator.html',
  'business-loan-emi-calculator.html'
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function slabTax(income, slabs) {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (income > lower) tax += (Math.min(income, upper) - lower) * rate;
    lower = upper;
    if (income <= upper) break;
  }
  return Math.max(0, tax);
}

function goldenOldRegimeCase() {
  const slabs = [[250000, 0], [500000, 0.05], [1000000, 0.20], [Infinity, 0.30]];
  const tax = slabTax(1599000, slabs);
  const cess = tax * 0.04;
  return {
    incomeTax: Math.round(tax),
    rebate87A: 0,
    cess: Math.round(cess),
    total: Math.round(tax + cess)
  };
}

function newRegimeSlabCase() {
  const slabs = [[400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]];
  return Math.round(slabTax(1599000, slabs) * 1.04);
}

function newRegimeSalaryCase(grossSalary) {
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, grossSalary - standardDeduction);
  const slabs = [[400000, 0], [800000, 0.05], [1200000, 0.10], [1600000, 0.15], [2000000, 0.20], [2400000, 0.25], [Infinity, 0.30]];
  const slabTaxValue = slabTax(taxableIncome, slabs);
  let taxAfterRebate = slabTaxValue;
  if (taxableIncome <= 1200000) {
    taxAfterRebate = Math.max(0, slabTaxValue - Math.min(60000, slabTaxValue));
  } else {
    taxAfterRebate = Math.min(slabTaxValue, Math.max(0, taxableIncome - 1200000));
  }
  return {
    standardDeduction,
    taxableIncome,
    slabTaxValue: Math.round(slabTaxValue),
    total: Math.round(taxAfterRebate * 1.04)
  };
}

if (!fs.existsSync(calculatorEngine)) {
  fail('Missing shared calculator engine: js/wi-calculators.js');
} else {
  const engine = read(calculatorEngine);
  ['2026-05-25', 'Section 87A', 'Marginal relief', '400000', '2400000', '75000', '125000'].forEach((needle) => {
    if (!engine.includes(needle)) fail(`Calculator engine is missing required rule marker: ${needle}`);
  });
}

for (const page of requiredPages) {
  const file = path.join(seoDir, page);
  if (!fs.existsSync(file)) {
    fail(`Missing calculator page: ${page}`);
    continue;
  }
  const html = read(file);
  if (!html.includes('/js/wi-calculators.js')) fail(`${page} does not load the shared calculator engine`);
  if (/Calculator widget concept|Search widget concept/i.test(html)) fail(`${page} still contains a concept placeholder`);
}

const oldCase = goldenOldRegimeCase();
if (oldCase.incomeTax !== 292200 || oldCase.rebate87A !== 0 || oldCase.cess !== 11688 || oldCase.total !== 303888) {
  fail(`Golden AY 2026-27 old-regime case failed: ${JSON.stringify(oldCase)}`);
}

const newCaseTotal = newRegimeSlabCase();
if (newCaseTotal !== 124644) {
  fail(`New regime slab calculation failed for taxable income 15,99,000: got ${newCaseTotal}`);
}

const salary125 = newRegimeSalaryCase(1250000);
if (salary125.standardDeduction !== 75000 || salary125.taxableIncome !== 1175000 || salary125.slabTaxValue !== 57500 || salary125.total !== 0) {
  fail(`New regime salary case failed for gross salary 12,50,000: ${JSON.stringify(salary125)}`);
}

const salary1275 = newRegimeSalaryCase(1275000);
if (salary1275.taxableIncome !== 1200000 || salary1275.total !== 0) {
  fail(`New regime salary case failed for gross salary 12,75,000: ${JSON.stringify(salary1275)}`);
}

if (failures.length) {
  console.error('Calculator validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Calculator validation passed for ${requiredPages.length} pages.`);
