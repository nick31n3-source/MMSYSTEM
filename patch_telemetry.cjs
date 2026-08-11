const fs = require('fs');
let dashboardOverview = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const telemetryBlock = `          {/* Platform Status */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-violet-50 pb-3">
              <span className="text-[9px] font-mono font-bold text-violet-500 uppercase tracking-widest block">TELEMETRIA</span>
              <h3 className="text-xs font-bold text-violet-950 uppercase tracking-wider mt-0.5">Status do Servidor</h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2.5 bg-violet-50/30 border border-violet-100 rounded-xl">
                <span className="text-violet-900 font-bold text-[10px] uppercase">LATÊNCIA API</span>
                <span className="text-violet-950 font-bold text-[11px]">8 ms</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-violet-50/30 border border-violet-100 rounded-xl">
                <span className="text-violet-900 font-bold text-[10px] uppercase">STATUS BANCO</span>
                <span className="text-emerald-700 font-extrabold text-[11px]">ATIVO</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-violet-50/30 border border-violet-100 rounded-xl">
                <span className="text-violet-900 font-bold text-[10px] uppercase">INTEGRIDADE DB</span>
                <span className="text-emerald-700 font-extrabold text-[11px]">100%</span>
              </div>
            </div>
          </div>`;
          
dashboardOverview = dashboardOverview.replace(telemetryBlock, '');
fs.writeFileSync('src/components/DashboardOverview.tsx', dashboardOverview);

let masterDashboard = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');
masterDashboard = masterDashboard.replace(/,\s*\{\s*label:\s*'Status da Infraestrutura',\s*value:\s*'OPERACIONAL',\s*details:\s*'Todos os endpoints respondendo \(200 OK\)',\s*isSuccess:\s*true\s*\}/, '');
masterDashboard = masterDashboard.replace(/grid-cols-1 md:grid-cols-4/g, 'grid-cols-1 md:grid-cols-3');

fs.writeFileSync('src/components/MasterDashboard.tsx', masterDashboard);
