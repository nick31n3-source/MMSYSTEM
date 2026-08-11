import fs from 'fs';
const text = fs.readFileSync('src/components/MenuManagement.tsx', 'utf8');
console.log(text.includes('Selecione um Insumo'));
