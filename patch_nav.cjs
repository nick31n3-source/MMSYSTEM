const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(/{ label: 'Gestão de Suprimentos', view: 'supplies', permission: 'supplies' },/, "{ label: 'Gestão de Suprimentos', view: 'settings', permission: 'settings' },"); // wait, no I won't replace, I'll insert.

let newNav = `    { label: 'Funcionários & Permissões', view: 'employees', permission: 'employees' },
    { label: 'Configurações da Conta', view: 'settings', permission: 'employees' },`;

code = code.replace(/    \{ label: 'Funcionários & Permissões', view: 'employees', permission: 'employees' \},/, newNav);

fs.writeFileSync('src/components/Sidebar.tsx', code);
