/**
 * repair.js — Fixes broken JSX produced by translate_all.js
 * The prior script accidentally wrapped code (like `i.imageUrl);`, return statements,
 * filter chains, etc.) into t() calls. This script reverts ONLY those broken t() calls
 * where the value contains code patterns (semicolons, newlines, curly braces, etc.)
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend/src/components');
const enLocalePath = path.join(__dirname, 'frontend/src/locales/en.json');

let enDict = JSON.parse(fs.readFileSync(enLocalePath, 'utf8'));

// Keys whose values contain CODE patterns that were accidentally translated
const CODE_PATTERNS = [
  /;\s*\r?\n/,          // semicolons followed by newlines
  /\)\s*\r?\n/,         // closing parens with newlines
  /=>/,                  // arrow functions
  /\{\s*\r?\n/,         // opening braces with newlines
  /\.filter\(/,          // array methods
  /\.length\b/,          // .length checks
  /\+ r\./,              // aggregation patterns
  /return \(/,           // return statements
  /if \(/,               // if statements
  /const /,              // const declarations
  /\)\s*\{/,             // function body opens
  /\bpageLoading\b/,     // variable names
  /\.map\(/,             // map calls
  /!==/,                 // strict equality
];

function isCodeLike(str) {
  return CODE_PATTERNS.some(p => p.test(str));
}

const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));
let fixCount = 0;

for (const file of files) {
  const fp = path.join(componentsDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  let original = content;

  // Match all t("auto.auto_N", "...") patterns (including multiline values)
  const tCallRegex = /\{t\("auto\.(auto_\d+)",\s*"([\s\S]*?)"\)\}/g;

  content = content.replace(tCallRegex, (fullMatch, key, value) => {
    // Decode escaped quotes back
    const decoded = value.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    
    if (isCodeLike(decoded)) {
      // It's a broken code injection — restore original code, drop t() wrapper
      fixCount++;
      return decoded;
    }
    return fullMatch; // keep valid ones
  });

  if (content !== original) {
    fs.writeFileSync(fp, content);
    console.log(`Fixed: ${file}`);
  }
}

// Also clean up en.json — remove code-like auto keys
let cleaned = 0;
const auto = enDict.auto || {};
for (const [key, val] of Object.entries(auto)) {
  if (isCodeLike(val)) {
    delete auto[key];
    cleaned++;
  }
}
enDict.auto = auto;
fs.writeFileSync(enLocalePath, JSON.stringify(enDict, null, 2));

console.log(`\nDone. Fixed ${fixCount} JSX injection(s), removed ${cleaned} broken en.json keys.`);
