const fs = require('fs');
let code = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

// 1. Remove modal state from MasterDashboard
code = code.replace(
  "  const [activeTab, setActiveTab] = React.useState<'instances' | 'audit'>('instances');\n  const [ipModalTenantId, setIpModalTenantId] = React.useState<string | null>(null);\n  const [tenantIps, setTenantIps] = React.useState<string[]>([]);\n  const [newIp, setNewIp] = React.useState('');",
  "  const [activeTab, setActiveTab] = React.useState<'instances' | 'audit'>('instances');"
);

// 2. Remove openIpModal and handlers
const ipModalFuncsRegex = /  const openIpModal = async \([\s\S]*?const handleRemoveIp = async \([\s\S]*?};\s*/;
code = code.replace(ipModalFuncsRegex, "");

// 3. Remove modal UI
const modalUIRegex = /        \{\/\* IP Modal \*\/\}\s*\{ipModalTenantId && \([\s\S]*?\}\s*/;
code = code.replace(modalUIRegex, "");

// 4. Remove openIpModal from ClientRow signature
code = code.replace(
  "const ClientRow = React.memo(({ client, isEditing, handleSaveEdit, setEditingClientId, startEditing, handleDeleteClient, openIpModal }: any) => {",
  "const ClientRow = React.memo(({ client, isEditing, handleSaveEdit, setEditingClientId, startEditing, handleDeleteClient }: any) => {"
);

// 5. Remove openIpModal prop from ClientRow instance
code = code.replace(
  "            handleDeleteClient={handleDeleteClient}\n            openIpModal={openIpModal}\n          />",
  "            handleDeleteClient={handleDeleteClient}\n          />"
);

// 6. Remove IPs button from ClientRow view mode actions
const ipsButtonRegex = /            <button\s*type="button"\s*onClick=\{\(\) => openIpModal\(client\.id, client\.subscriptionTier\)\}[\s\S]*?IPs\s*<\/button>/;
code = code.replace(ipsButtonRegex, "");

fs.writeFileSync('src/components/MasterDashboard.tsx', code);
