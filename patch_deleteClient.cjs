const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const replacement = `  const deleteClientInstance = (clientId: string) => {
    const client = clientInstances.find(c => c.id === clientId);
    if (client) {
      setClientInstances(prev => prev.filter(c => c.id !== clientId));
      deleteDoc(doc(db, 'clientInstances', clientId)).catch(console.error);
      
      // Delete all users belonging to this tenant
      users.filter(u => u.tenantId === clientId).forEach(u => {
        deleteDoc(doc(db, 'users', u.id)).catch(console.error);
      });
      
      addAuditLog('CLIENT_DELETED', \`Tenant instance completely purged: "\${client.name}" (\${client.ownerName}).\`, client.id);
    }
  };`;

code = code.replace(/  const deleteClientInstance = \(clientId: string\) => {[\s\S]*?addAuditLog\('CLIENT_DELETED',[^;]+;[\s\S]*?}[\s\S]*?};/, replacement);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
