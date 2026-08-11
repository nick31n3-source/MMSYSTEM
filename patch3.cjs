const fs = require('fs');
let file = fs.readFileSync('src/components/WaiterDashboard.tsx', 'utf8');

const targetContentRegex = /<button[\s\S]*?key=\{table\.number\}[\s\S]*?onClick=\{\(\) => handleTableSelect\(table\.number\)\}[\s\S]*?<\/button>/;

const replaceContent = `<button
                  key={table.number}
                  onClick={() => handleTableSelect(table.number)}
                  className={\`
                    h-full min-h-[9rem] rounded-2xl border flex flex-col justify-between p-4 text-left transition-all group cursor-pointer relative shadow-sm
                    bg-[#070b14] hover:bg-[#0c1622]
                    \${isOccupied 
                       ? 'border-amber-400/50 hover:border-amber-400' 
                       : 'border-white/10 hover:border-white/30'
                    }
                  \`}
                >
                  <div className="flex justify-between items-start w-full shrink-0 gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mesa</span>
                    <span className={\`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 \${isOccupied ? 'bg-amber-900/40 border border-amber-200/50 text-amber-400' : 'bg-white/5 border border-white/10 text-slate-400'}\`}>
                      {isOccupied ? 'OCUPADA' : 'LIVRE'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
                    <span className={\`text-4xl font-extrabold font-sans tracking-tight block break-words \${isOccupied ? 'text-white' : 'text-slate-300'}\`}>
                      {table.number.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-1 break-words">
                      {isOccupied ? 'Comanda Aberta' : 'Disponível'}
                    </span>
                  </div>
                  <div className={\`w-full flex flex-wrap items-center justify-between gap-1 text-[10px] border-t border-white/10 pt-2 mt-1 shrink-0 \${isOccupied ? 'text-slate-400' : 'text-slate-600'}\`}>
                    <span className="font-semibold break-words flex-1 min-w-[50px]">{isOccupied && activeOrder ? activeOrder.waiterName.split(' ')[0] : 'Nenhum'}</span>
                    <span className={\`font-mono font-bold whitespace-nowrap text-right \${isOccupied ? 'text-white' : 'text-slate-500'}\`}>{isOccupied && activeOrder ? formatCurrency(activeOrder.totalAmount) : 'R$ 0,00'}</span>
                  </div>
                </button>`;

const match = file.match(targetContentRegex);

if (match) {
    file = file.replace(match[0], replaceContent);
    fs.writeFileSync('src/components/WaiterDashboard.tsx', file);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
