const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const targetStr = `  const addClientInstance = async (client: Omit<ClientInstance, 'id' | 'createdAt' | 'activeOrdersCount' | 'monthlyRevenue' | 'databaseSizeMB'>) => {`;
const replacement = `  const addClientInstance = async (client: Omit<ClientInstance, 'id' | 'createdAt' | 'activeOrdersCount' | 'monthlyRevenue' | 'databaseSizeMB'>) => {
    // Check for duplicate logins
    const proposedUsername = client.adminUsername ? client.adminUsername.trim().toLowerCase() : client.email.split('@')[0].toLowerCase();
    const proposedEmail = client.email.toLowerCase();
    
    const duplicateUser = users.find(u => 
      u.username.toLowerCase() === proposedUsername || 
      (u.email && u.email.toLowerCase() === proposedEmail)
    );
    
    if (duplicateUser) {
      alert("Error: A user with this username or email already exists.");
      throw new Error("A user with this username or email already exists.");
    }`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/context/RestaurantContext.tsx', code);
