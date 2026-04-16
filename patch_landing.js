const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/Landing.jsx', 'utf8');
c = c.replace(
  '<title>TerraSpotter \u2014 Land for Green Futures</title>',
  '<title>{t("landing.page_title", "TerraSpotter \u2014 Land for Green Futures")}</title>'
);
fs.writeFileSync('frontend/src/components/Landing.jsx', c);
console.log('Landing title patched');
