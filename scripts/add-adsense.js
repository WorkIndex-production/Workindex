const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const snippet = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2627739469695660" crossorigin="anonymous"></script>';
const metaTag = '<meta name="google-adsense-account" content="ca-pub-2627739469695660">';

const publicRootPages = [
  'index.html',
  'contact.html',
  'payment-success.html',
  'privacy-policy.html',
  'refund-policy.html',
  'terms.html'
];

function inject(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  if (!html.includes('</head>')) {
    throw new Error(`Missing </head>: ${filePath}`);
  }
  if (!html.includes('name="google-adsense-account"')) {
    html = html.replace('</head>', `${metaTag}\n</head>`);
    changed = true;
  }
  if (!html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
    html = html.replace('</head>', `${snippet}\n</head>`);
    changed = true;
  }
  if (changed) fs.writeFileSync(filePath, html, 'utf8');
  return changed;
}

let changed = 0;

for (const page of publicRootPages) {
  const filePath = path.join(root, page);
  if (fs.existsSync(filePath) && inject(filePath)) changed += 1;
}

const seoDir = path.join(root, 'seo-pages');
for (const file of fs.readdirSync(seoDir).filter((item) => item.endsWith('.html'))) {
  if (inject(path.join(seoDir, file))) changed += 1;
}

console.log(`adsense_added_to=${changed}`);
