const fs = require('fs');

let mainContent = fs.readFileSync('src/main.tsx', 'utf8');
mainContent = mainContent.replace(/const originalFetch = window\.fetch;[\s\S]*?return originalFetch\(input, init\);\n\};/m, ``);
fs.writeFileSync('src/main.tsx', mainContent);

