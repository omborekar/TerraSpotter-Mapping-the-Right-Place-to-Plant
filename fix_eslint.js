const fs = require('fs');
const path = require('path');

const filesToFix = [
  "frontend/src/components/About.jsx",
  "frontend/src/components/AdminLayout.jsx",
  "frontend/src/components/AdminNavbar.jsx",
  "frontend/src/components/CommunityFeed.jsx",
  "frontend/src/components/ContributionMap.jsx",
  "frontend/src/components/Footer.jsx",
  "frontend/src/components/ForgotPassword.jsx",
  "frontend/src/components/Forum.jsx",
  "frontend/src/components/GrowthTracker.jsx",
  "frontend/src/components/PlantationShowcase.jsx",
  "frontend/src/components/Profile.jsx",
  "frontend/src/components/Reviewspage.jsx",
  "frontend/src/components/SiteDetail.jsx"
];

const COMPONENT_REGEX = /(?:(?:export\s+(?:default\s+)?)?function\s+([A-Z]\w*)\s*\([^)]*\)\s*\{|const\s+([A-Z]\w*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>\s*\{)/g;

for (const file of filesToFix) {
  if (!fs.existsSync(file)) {
     console.log(`Skipping ${file}`);
     continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Ensure import exists
  if (!content.includes('import { useTranslation }')) {
    const importStr = 'import { useTranslation } from "react-i18next";\n';
    if (content.startsWith('import')) {
      content = importStr + content;
    } else {
      content = importStr + '\n' + content;
    }
  }

  // Find components and inject if missing
  let modifiedContent = content;
  let match;
  let offset = 0;

  // We need to loop through components and inject exactly after the {
  COMPONENT_REGEX.lastIndex = 0;
  while ((match = COMPONENT_REGEX.exec(content)) !== null) {
      const idx = match.index + match[0].length;
      
      // Determine end of this component block by matching braces (rough approximation)
      let openBraces = 1;
      let i = idx;
      for (; i < content.length; i++) {
          if (content[i] === '{') openBraces++;
          else if (content[i] === '}') openBraces--;
          if (openBraces === 0) break;
      }
      const componentBody = content.substring(idx, i);
      
      if (componentBody.includes('t(') && !componentBody.includes('const { t } = useTranslation()')) {
          modifiedContent = modifiedContent.slice(0, idx + offset) + '\n  const { t } = useTranslation();' + modifiedContent.slice(idx + offset);
          offset += 34; // length of injected string
      }
  }

  fs.writeFileSync(file, modifiedContent);
  console.log(`Fixed ${file}`);
}
