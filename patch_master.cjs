const fs = require('fs');
let code = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

code = code.replace(/,\s*systemMetrics/g, '');

const tabButtonCode = `            <button 
              onClick={() => setActiveTab('telemetry')}
              className={\`py-2.5 px-4 font-bold uppercase tracking-wider text-xs whitespace-nowrap \${
              activeTab === 'telemetry' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-neutral-500 hover:text-neutral-700'
            }\`}
            >
              Telemetria & Infra
            </button>`;
code = code.replace(tabButtonCode, '');

// The telemetry tab content is quite large. I will use regex to remove it.
// It starts with `{activeTab === 'telemetry' && (` and ends with closing tag before `{activeTab === 'audit' && (`
code = code.replace(/\{activeTab === 'telemetry' && \([\s\S]*?\n\s*\}\)\s*\{activeTab === 'audit' && \(/m, "{activeTab === 'audit' && (");

fs.writeFileSync('src/components/MasterDashboard.tsx', code);
