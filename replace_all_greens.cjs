const fs = require('fs');
const path = require('path');

function replaceColors(content) {
  let result = content;
  
  const replacements = [
    // Buttons
    [/bg-emerald-600 hover:bg-emerald-700 text-white/g, 'bg-white hover:bg-slate-200 text-black'],
    
    // Backgrounds + Borders + Text
    [/bg-emerald-950\/30 border border-emerald-200 text-emerald-800/g, 'bg-white/5 border border-white/20 text-slate-300'],
    [/bg-green-950\/30 border border-green-200 text-green-400/g, 'bg-white/5 border border-white/20 text-slate-300'],
    [/bg-emerald-950\/30 border-emerald-200 text-emerald-800/g, 'bg-white/5 border-white/20 text-slate-300'],
    [/bg-emerald-900\/40 text-emerald-800/g, 'bg-white/5 text-slate-300'],
    [/bg-emerald-950\/30 text-emerald-400 border-emerald-200/g, 'bg-white/5 text-slate-300 border-white/20'],
    [/bg-emerald-950\/30 border border-emerald-200/g, 'bg-white/5 border border-white/20'],
    
    // Text colors
    [/text-emerald-400/g, 'text-slate-300'],
    [/text-emerald-800/g, 'text-slate-300'],
  ];

  for (const [regex, replacement] of replacements) {
    result = result.replace(regex, replacement);
  }
  
  return result;
}

const componentsDir = 'src/components';
const files = fs.readdirSync(componentsDir)
  .filter(file => file.endsWith('.tsx') && file !== 'LandingPage.tsx' && file !== 'Login.tsx')
  .map(file => path.join(componentsDir, file));

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = replaceColors(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
}
