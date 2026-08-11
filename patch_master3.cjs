const fs = require('fs');
let code = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

code = code.replace(
  "      onConfirm: () => {\n        try { addClientInstance(newInstance); setSuccessMsg(`Instância ${newInstance.name} provisionada com sucesso.`); setTimeout(() => setSuccessMsg(''), 5000); setShowAddForm(false); } catch(e: any) { alert(e.message); }",
  "      onConfirm: async () => {\n        try { await addClientInstance(newInstance); setSuccessMsg(`Instância ${newInstance.name} provisionada com sucesso.`); setTimeout(() => setSuccessMsg(''), 5000); setShowAddForm(false); } catch(e: any) { alert(e.message); }"
);

fs.writeFileSync('src/components/MasterDashboard.tsx', code);
