const fs = require('fs');
let code = fs.readFileSync('src/utils/transactionReports.ts', 'utf8');

const oldDateLogic = `  for (const sale of salesRecords) {
    const date = new Date(sale.timestamp);
    if (isNaN(date.getTime())) continue;

    const day = date.toISOString().split('T')[0];
    const month = day.substring(0, 7);
    const year = day.substring(0, 4);`;

const newDateLogic = `  for (const sale of salesRecords) {
    const date = new Date(sale.timestamp);
    if (isNaN(date.getTime())) continue;

    // Use local timezone to prevent evening sales from spilling into the next UTC day
    const yearNum = date.getFullYear();
    const monthNum = date.getMonth() + 1;
    const dayNum = date.getDate();

    const year = yearNum.toString();
    const month = \`\${year}-\${monthNum.toString().padStart(2, '0')}\`;
    const day = \`\${month}-\${dayNum.toString().padStart(2, '0')}\`;`;

code = code.replace(oldDateLogic, newDateLogic);
fs.writeFileSync('src/utils/transactionReports.ts', code);
