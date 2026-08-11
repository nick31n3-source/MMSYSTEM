const fs = require('fs');
let content = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

// Remove runInfrastructureAction
const runInfraRegex = /  const runInfrastructureAction = \([\s\S]*?\}, 4000\);\n  \};\n/;
content = content.replace(runInfraRegex, "");

// Remove handleResetDatabase
const handleResetRegex = /  const handleResetDatabase = \(\) => \{[\s\S]*?\}\);\n  \};\n/;
content = content.replace(handleResetRegex, "");

// Remove the buttons
const resetBtnRegex = /            <button\s*onClick=\{handleResetDatabase\}[\s\S]*?Factory Reset DB\s*<\/button>\s*/;
content = content.replace(resetBtnRegex, "");

const forceGcBtnRegex = /            <button\s*onClick=\{\(\) => runInfrastructureAction\('FORCE_GARBAGE_COLLECTION'[\s\S]*?Force GC\s*<\/button>\s*/;
content = content.replace(forceGcBtnRegex, "");

fs.writeFileSync('src/components/MasterDashboard.tsx', content);

