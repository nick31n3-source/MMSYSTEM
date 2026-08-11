const fs = require('fs');
let file = fs.readFileSync('src/components/WaiterDashboard.tsx', 'utf8');

const targetContent = `                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mesa</span>
                    {isOccupied && (
                      <span className="text-[8px] font-mono bg-amber-900/40 border border-amber-200 text-amber-400 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        OCUPADA
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={\`text-4xl font-extrabold font-sans tracking-tight block \${isOccupied ? 'text-white' : 'text-slate-200'}\`}>
                      {table.number.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-1">
                      {isOccupied ? 'Comanda Aberta' : 'Livre'}
                    </span>
                  </div>
                  {isOccupied && activeOrder && (
                    <div className="w-full flex items-center justify-between text-[10px] border-t border-white/10 pt-2 text-slate-400 mt-1">
                      <span className="truncate max-w-[70px] font-semibold">{activeOrder.waiterName.split(' ')[0]}</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(activeOrder.totalAmount)}</span>
                    </div>
                  )}`;

const replaceContent = `                  <div className="flex justify-between items-start w-full shrink-0">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mesa</span>
                    {isOccupied && (
                      <span className="text-[8px] font-mono bg-amber-900/40 border border-amber-200 text-amber-400 px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ml-1">
                        OCUPADA
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-h-0">
                    <span className={\`text-4xl font-extrabold font-sans tracking-tight block truncate \${isOccupied ? 'text-white' : 'text-slate-200'}\`}>
                      {table.number.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5 truncate">
                      {isOccupied ? 'Comanda Aberta' : 'Livre'}
                    </span>
                  </div>
                  <div className={\`w-full flex items-center justify-between text-[10px] border-t border-white/10 pt-2 mt-1 shrink-0 \${isOccupied ? 'opacity-100 text-slate-400' : 'opacity-0 invisible'}\`}>
                    <span className="truncate max-w-[60px] font-semibold">{isOccupied && activeOrder ? activeOrder.waiterName.split(' ')[0] : '-'}</span>
                    <span className="font-mono font-bold text-white truncate ml-1">{isOccupied && activeOrder ? formatCurrency(activeOrder.totalAmount) : '-'}</span>
                  </div>`;

if(file.includes(targetContent)) {
    file = file.replace(targetContent, replaceContent);
    fs.writeFileSync('src/components/WaiterDashboard.tsx', file);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
