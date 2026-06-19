const fs = require('fs');
const path = require('path');

const seoDir = path.join(__dirname, '..', 'seo-pages');

async function run() {
  const files = fs.readdirSync(seoDir).filter(f => f.endsWith('.html'));
  console.log(`Found ${files.length} HTML files to process.`);

  let processedCount = 0;
  let changedCount = 0;

  let schemaCount = 0;
  let sidebarCount = 0;
  let heroCount = 0;
  let metaCount = 0;
  let ctaCount = 0;

  for (const file of files) {
    const filePath = path.join(seoDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Schema
    const oldSchema = '"name":"WorkIndex","url":"https://workindex.co.in"';
    const newSchema = '"name":"WorkIndex","alternateName":"Work Index","url":"https://workindex.co.in"';
    if (content.includes(oldSchema)) {
      content = content.replaceAll(oldSchema, newSchema);
      schemaCount++;
    }

    // 2. Sidebar
    const oldSidebar = 'WorkIndex helps compare relevant specialists by scope, price and timeline.';
    const newSidebar = 'WorkIndex is a professional work index that helps you compare relevant specialists by scope, price and timeline.';
    if (content.includes(oldSidebar)) {
      content = content.replaceAll(oldSidebar, newSidebar);
      sidebarCount++;
    }

    // 3. Hero body copy
    const oldHero = 'before you compare experts on WorkIndex.';
    const newHero = 'before you compare experts on the WorkIndex work index.';
    if (content.includes(oldHero)) {
      content = content.replaceAll(oldHero, newHero);
      heroCount++;
    }

    // 4. Meta description
    const oldMeta = 'before hiring on WorkIndex.';
    const newMeta = 'before hiring on the WorkIndex work index.';
    if (content.includes(oldMeta)) {
      content = content.replaceAll(oldMeta, newMeta);
      metaCount++;
    }

    // 5. Bottom CTA copy
    const oldCta = 'compare relevant WorkIndex experts before hiring.';
    const newCta = 'compare relevant experts on the WorkIndex work index before hiring.';
    if (content.includes(oldCta)) {
      content = content.replaceAll(oldCta, newCta);
      ctaCount++;
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      changedCount++;
    }
    processedCount++;
  }

  console.log(`\nMigration completed:`);
  console.log(`- Total files processed: ${processedCount}`);
  console.log(`- Files updated: ${changedCount}`);
  console.log(`- Schema additions: ${schemaCount}`);
  console.log(`- Sidebar copy updates: ${sidebarCount}`);
  console.log(`- Hero copy updates: ${heroCount}`);
  console.log(`- Meta description updates: ${metaCount}`);
  console.log(`- Bottom CTA copy updates: ${ctaCount}`);
}

run().catch(console.error);
