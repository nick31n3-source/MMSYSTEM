const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(/export interface SystemMetrics \{[\s\S]*?\n\}\n/m, '');
fs.writeFileSync('src/types.ts', code);
