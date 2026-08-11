const fs = require('fs');
let code = fs.readFileSync('full-e2e.js', 'utf8');

code = code.replace(
  "setVal('input[placeholder=\"Ex: financeiro@forno.com.br\"]', 'client@test.com');",
  "setVal('input[placeholder=\"Ex: financeiro@forno.com.br\"]', 'client' + Date.now() + '@test.com');"
);

code = code.replace(
  "setVal('input[placeholder=\"Ex: bistro_admin\"]', 'client_adminx');",
  "setVal('input[placeholder=\"Ex: bistro_admin\"]', 'client_admin' + Date.now());"
);

// We need to capture these to use them in login. 
// Wait, for login, the script types 'client_adminx' directly.
// Let's use a fixed random suffix for the whole run.
const randomSuffix = Math.floor(Math.random() * 1000000);
code = code.replace(/'client@test.com'/g, "\`client\${" + randomSuffix + "}@test.com\`");
code = code.replace(/'client_adminx'/g, "\`client_admin\${" + randomSuffix + "}\`");

fs.writeFileSync('full-e2e.js', code);
