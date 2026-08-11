const fs = require('fs');
let code = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

code = code.replace(
  "              <button\n                onClick={handleResetDatabase}",
  "              <button onClick={() => openIpModal('global', 'enterprise')} className=\"bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-mono font-bold py-2 px-3 rounded-lg text-[9px] uppercase transition-colors cursor-pointer mr-2\">\n                Restrição de IP (Admin)\n              </button>\n              <button\n                onClick={handleResetDatabase}"
);

fs.writeFileSync('src/components/MasterDashboard.tsx', code);
