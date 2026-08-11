const fs = require('fs');
const path = require('path');

const componentsDir = 'src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') && f !== 'LandingPage.tsx' && f !== 'Login.tsx');

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the <p> elements
  content = content.replace(/<p className="text-xs text-slate-400 mt-1[^>]*>[\s\S]*?<\/p>/g, '');
  
  // Remove specific span elements that act as over-titles
  content = content.replace(/<span className="text-\[10px\] font-mono font-bold tracking-widest text-white uppercase">[\s\S]*?<\/span>/g, '');

  fs.writeFileSync(filePath, content);
}
console.log("Done");
