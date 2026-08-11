const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/admin\.initializeApp\(\{[\s\S]*?\}\);/m, `admin.initializeApp({
      projectId: "mm-systems-502601"
    });`);

fs.writeFileSync('server.ts', content);
