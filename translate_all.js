const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend/src/components');
const enLocalePath = path.join(__dirname, 'frontend/src/locales/en.json');

let enDict = {};
if (fs.existsSync(enLocalePath)) {
    enDict = JSON.parse(fs.readFileSync(enLocalePath, 'utf8'));
} else {
    enDict = { auto: {} };
}
if (!enDict.auto) enDict.auto = {};

const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));
let keyCounter = Object.keys(enDict.auto).length + 1;

for (const file of files) {
    if (['LanguageSwitcher.jsx', 'Navbar.jsx', 'Landing.jsx', 'Login.jsx', 'Signup.jsx'].includes(file)) continue;

    const fp = path.join(componentsDir, file);
    let content = fs.readFileSync(fp, 'utf8');
    let originalContent = content;

    // 1. Inject import
    if (!content.includes('import { useTranslation }')) {
        content = 'import { useTranslation } from "react-i18next";\n' + content;
    }

    // 2. Inject hook hook inside main component definition using a heuristic
    const compName = file.replace('.jsx', '');
    const sigRegex1 = new RegExp(`(function\\s+${compName}\\s*\\(.*?\\)\\s*{)`);
    const sigRegex2 = new RegExp(`(const\\s+${compName}\\s*=\\s*\\(.*?\\)\\s*=>\\s*{)`);
    const sigRegex3 = new RegExp(`(export\\s+default\\s+function\\s+${compName}\\s*\\(.*?\\)\\s*{)`);
    
    if (!content.includes('const { t } = useTranslation();')) {
      if (content.match(sigRegex1)) content = content.replace(sigRegex1, match => `${match}\n  const { t } = useTranslation();`);
      else if (content.match(sigRegex2)) content = content.replace(sigRegex2, match => `${match}\n  const { t } = useTranslation();`);
      else if (content.match(sigRegex3)) content = content.replace(sigRegex3, match => `${match}\n  const { t } = useTranslation();`);
      else {
        // Fallback for simple default export function
        const fallbackRegex = /(export default function\s*\([^\)]*\)\s*\{)/;
        if (content.match(fallbackRegex)) {
            content = content.replace(fallbackRegex, match => `${match}\n  const { t } = useTranslation();`);
        }
      }
    }

    // 3. Regex string replacement inside JSX tags (very heuristic)
    // Looking for lines like `<div ...> Some text </div>`
    const textRegex = />\s*([^<>{}]*[a-zA-Z][^<>{}]*?)\s*</g;
    
    let stringsFound = false;
    content = content.replace(textRegex, (match, txt) => {
        const clean = txt.trim();
        // Skip code-like or meaningless text
        if (clean.length < 2 || clean.includes("=>") || clean.includes("&&") || clean.includes("==") || clean.includes("${")) return match;
        
        stringsFound = true;
        const key = `auto_${keyCounter++}`;
        enDict.auto[key] = clean;

        // Escape double quotes for the React syntax string
        const escaped = clean.replace(/"/g, '\\"');
        
        // Return keeping the original surrounding spacing
        const beforeStr = match.substring(0, match.indexOf(txt));
        const afterStr = match.substring(match.indexOf(txt) + txt.length);
        
        return `${beforeStr}{t("auto.${key}", "${escaped}")}${afterStr}`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(fp, content);
        console.log(`Transformed ${file}`);
    }
}

fs.writeFileSync(enLocalePath, JSON.stringify(enDict, null, 2));
console.log("Dictionary updated successfully!");
