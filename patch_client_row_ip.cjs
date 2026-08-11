const fs = require('fs');
let code = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

const clientRowState = `const ClientRow = React.memo(({ client, isEditing, handleSaveEdit, setEditingClientId, startEditing, handleDeleteClient }: any) => {
  const [localForm, setLocalForm] = React.useState({
    subscriptionTier: client.subscriptionTier,
    subscriptionStatus: client.subscriptionStatus,
    subscriptionCost: client.subscriptionCost,
    nextBillingDate: client.nextBillingDate
  });
  
  const [ips, setIps] = React.useState<string[]>([]);
  const [newIp, setNewIp] = React.useState('');
  const [isIpLoading, setIsIpLoading] = React.useState(false);

  React.useEffect(() => {
    if (isEditing && (localForm.subscriptionTier === 'premium' || localForm.subscriptionTier === 'enterprise')) {
      setIsIpLoading(true);
      fetch(\`/api/superuser/ips?targetTenantId=\${client.id}\`, {
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('mm_jwt_token') || ''}\` }
      }).then(res => res.json()).then(data => {
        if (data.success) setIps(data.ips || []);
        setIsIpLoading(false);
      }).catch(err => {
        console.error(err);
        setIsIpLoading(false);
      });
    }
  }, [isEditing, localForm.subscriptionTier, client.id]);

  const handleAddIp = async () => {
    if (!newIp) return;
    try {
      await fetch('/api/superuser/ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('mm_jwt_token') || ''}\` },
        body: JSON.stringify({ targetTenantId: client.id, ip: newIp })
      });
      setIps([...ips, newIp]);
      setNewIp('');
    } catch (err) {}
  };

  const handleRemoveIp = async (ipToRemove: string) => {
    try {
      await fetch('/api/superuser/ips', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${localStorage.getItem('mm_jwt_token') || ''}\` },
        body: JSON.stringify({ targetTenantId: client.id, ip: ipToRemove })
      });
      setIps(ips.filter(ip => ip !== ipToRemove));
    } catch (err) {}
  };`;

const oldState = /const ClientRow = React\.memo\(\(\{ client, isEditing, handleSaveEdit, setEditingClientId, startEditing, handleDeleteClient \}: any\) => \{\s*const \[localForm, setLocalForm\] = React\.useState\(\{[\s\S]*?nextBillingDate: client\.nextBillingDate\s*\}\);/;
code = code.replace(oldState, clientRowState);

const renderWrapperRegex = /  return \(\s*<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 hover:bg-neutral-50\/50 transition-colors items-start border-b border-neutral-150">/;
const renderWrapperNew = `  return (
    <div className="flex flex-col border-b border-neutral-150 hover:bg-neutral-50/50 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 items-start">`;
code = code.replace(renderWrapperRegex, renderWrapperNew);

const closeWrapperRegex = /      <\/div>\s*<\/div>\s*\);\s*\}\);/;
const closeWrapperNew = `      </div>
      </div>
      
      {isEditing && (localForm.subscriptionTier === 'premium' || localForm.subscriptionTier === 'enterprise') && (
        <div className="p-4 bg-neutral-100/50 border-t border-neutral-200 font-mono">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Controle de Acesso por IP (Premium/Enterprise)</span>
            <span className="text-[9px] text-neutral-500 mb-2">Restrinja o acesso ao painel desta instância para IPs específicos. Deixe vazio para permitir todos os acessos.</span>
            
            <div className="flex gap-2 max-w-sm mb-2">
              <input 
                type="text" 
                value={newIp} 
                onChange={e => setNewIp(e.target.value)} 
                placeholder="Ex: 192.168.1.1" 
                className="flex-1 bg-white border border-neutral-300 rounded px-2 py-1.5 text-xs outline-none" 
              />
              <button 
                type="button"
                onClick={handleAddIp} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase cursor-pointer"
              >
                Adicionar
              </button>
            </div>
            
            {isIpLoading ? (
              <div className="text-xs text-neutral-400 italic">Carregando whitelist...</div>
            ) : (
              <ul className="space-y-1.5 max-w-sm">
                {ips.map(ip => (
                  <li key={ip} className="flex justify-between items-center bg-white p-2 rounded border border-neutral-200 text-xs shadow-sm">
                    <span className="font-bold text-blue-950">{ip}</span>
                    <button type="button" onClick={() => handleRemoveIp(ip)} className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase cursor-pointer">Remover</button>
                  </li>
                ))}
                {ips.length === 0 && <li className="text-[10px] text-neutral-400 italic border border-dashed border-neutral-300 p-2 rounded bg-neutral-50">Nenhuma restrição de IP ativa. Acesso aberto.</li>}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
});`;

code = code.replace(closeWrapperRegex, closeWrapperNew);

fs.writeFileSync('src/components/MasterDashboard.tsx', code);
