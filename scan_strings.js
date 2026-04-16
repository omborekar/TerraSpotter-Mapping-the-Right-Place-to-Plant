const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend/src/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
const SKIP = ['LanguageSwitcher.jsx'];
const hardcodedPattern = />([^<>{}\n]+[a-zA-Z]{3,}[^<>{}\n]*)</g;

let results = {};
for (const file of files) {
  if (SKIP.includes(file)) continue;
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const lines = content.split('\n');
  const hits = [];
  lines.forEach((line, i) => {
    const skip = line.includes('t("') ||
      line.includes("t('") ||
      line.trim().startsWith('//') ||
      line.trim().startsWith('*') ||
      line.includes('import ') ||
      line.includes('className') ||
      line.includes('placeholder=') ||
      line.includes('label:') ||
      line.includes('desc:') ||
      line.includes('href=') ||
      line.includes('src=') ||
      line.includes('style=') ||
      line.includes('stroke=') ||
      line.includes('fill=') ||
      line.includes('viewBox');
    if (skip) return;
    let m;
    hardcodedPattern.lastIndex = 0;
    while ((m = hardcodedPattern.exec(line)) !== null) {
      const text = m[1].trim();
      if (text.length > 3 &&
          !text.includes('{') &&
          !text.includes('=>') &&
          !text.startsWith('©') &&
          !/^[\d\s\.\-\+\*\/\%\:\!\?\,\#]+$/.test(text)) {
        hits.push({ line: i + 1, text: text.substring(0, 80) });
      }
    }
  });
  if (hits.length) results[file] = hits;
}
console.log(JSON.stringify(results, null, 2));
