const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const oldClientPass = `          username: client.adminUsername ? client.adminUsername.trim().toLowerCase() : client.email.split('@')[0].toLowerCase(),
          password: client.adminPassword,
          name: client.ownerName,`;

const newClientPass = `          username: client.adminUsername ? client.adminUsername.trim().toLowerCase() : client.email.split('@')[0].toLowerCase(),
          password: client.adminPassword ? await hashPassword(client.adminPassword) : undefined,
          name: client.ownerName,`;

code = code.replace(oldClientPass, newClientPass);

// I should also ensure we are not saving the adminPassword in plaintext in the clientInstances collection itself!
// If addClientInstance spreads the client object, it will save client.adminPassword!
// Let's check where it creates newClient

const oldNewClient = `    const newClient: ClientInstance = {
      ...client,
      id: clientId,
      createdAt: new Date().toISOString(),`;

const newNewClient = `    // Prevent saving raw password in client instances
    const safeClient = { ...client };
    delete safeClient.adminPassword;

    const newClient: ClientInstance = {
      ...safeClient,
      id: clientId,
      createdAt: new Date().toISOString(),`;

code = code.replace(oldNewClient, newNewClient);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
