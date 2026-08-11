const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const oldNewClient = `    const newClient: ClientInstance = {
      ...client,
      id: \`client-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,`;

const newNewClient = `    const safeClient = { ...client };
    delete safeClient.adminPassword;

    const newClient: ClientInstance = {
      ...safeClient,
      id: \`client-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,`;

code = code.replace(oldNewClient, newNewClient);
fs.writeFileSync('src/context/RestaurantContext.tsx', code);
