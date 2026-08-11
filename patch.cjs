const fs = require('fs');
let file = fs.readFileSync('src/components/WaiterDashboard.tsx', 'utf8');

const targetContent = `                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Meio de Recebimento
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'card', label: 'CARTAO' },
                        { id: 'cash', label: 'DINHEIRO' },
                        { id: 'pix', label: 'PIX' },
                        { id: 'digital', label: 'CARTEIRA' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={\`
                            px-2 py-1 border text-[9px] font-bold cursor-pointer transition-all h-[36px] rounded-lg
                            \${paymentMethod === m.id 
                               ? 'bg-white border-white/50 text-white font-bold' 
                               : 'bg-[#070b14] border-white/10 text-slate-400 hover:text-white hover:bg-[#0c1622]'
                            }
                          \`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>`;

const replaceContent = `                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Meio de Recebimento
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'card', label: 'CARTAO' },
                        { id: 'cash', label: 'DINHEIRO' },
                        { id: 'pix', label: 'PIX' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPaymentMethod(m.id as any);
                          }}
                          className={\`
                            px-2 py-1 border text-[9px] font-bold cursor-pointer transition-all h-[36px] rounded-lg
                            \${paymentMethod === m.id 
                               ? 'bg-white border-white/50 text-[#0c1622] font-bold' 
                               : 'bg-[#070b14] border-white/10 text-slate-400 hover:text-white hover:bg-[#0c1622]'
                            }
                          \`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>`;

if(file.includes(targetContent)) {
    file = file.replace(targetContent, replaceContent);
    fs.writeFileSync('src/components/WaiterDashboard.tsx', file);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
