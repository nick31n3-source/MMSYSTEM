const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { TenantSettings }')) {
  code = code.replace(/import \{ Sidebar \} from '\.\/components\/Sidebar';/, "import { Sidebar } from './components/Sidebar';\nimport { TenantSettings } from './components/TenantSettings';");
}

code = code.replace(/case 'employees': return <EmployeeManagement \/>;/, "case 'employees': return <EmployeeManagement />;\n      case 'settings': return <TenantSettings />;");
code = code.replace(/case 'employees': return 'Controle de Funcionários & Permissões';/, "case 'employees': return 'Controle de Funcionários & Permissões';\n      case 'settings': return 'Configurações da Conta';");

fs.writeFileSync('src/App.tsx', code);
