const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/  \/\/ Retrieves data from the external database if active[\s\S]*?  \/\/ Secure server-side authentication endpoint/m, '  // Secure server-side authentication endpoint');

fs.writeFileSync('server.ts', server);
