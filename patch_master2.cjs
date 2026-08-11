const fs = require('fs');
let code = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

code = code.replace(/\n\s*<button \n\s*onClick=\{\(\) => setActiveTab\('telemetry'\)\}[\s\S]*?<\/button>/, "");
code = code.replace(/\n\s*\{activeTab === 'telemetry' && \([\s\S]*?Histórico de Desempenho do NGINX Reverse Proxy[\s\S]*?<\/ResponsiveContainer>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}\n/, "\n");
code = code.replace(/'instances' \| 'telemetry' \| 'audit'/, "'instances' | 'audit'");

fs.writeFileSync('src/components/MasterDashboard.tsx', code);
