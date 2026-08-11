const fs = require('fs');
let file = fs.readFileSync('src/components/WaiterDashboard.tsx', 'utf8');

const targetContent = `                  {isOccupied && activeOrder && (
                    <div className="w-full flex items-center justify-between text-[10px] border-t border-white/10 pt-2 text-slate-400 mt-1">
                      <span className="truncate max-w-[70px] font-semibold">{activeOrder.waiterName.split(' ')[0]}</span>
                      <span className="font-mono font-bold text-white">{formatCurrency(activeOrder.totalAmount)}</span>
                    </div>
                  )}`;

const replaceContent = `                  <div className={\`w-full flex items-center justify-between text-[10px] border-t border-white/10 pt-2 mt-1 shrink-0 \${isOccupied ? 'opacity-100 text-slate-400' : 'opacity-0 invisible'}\`}>
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
