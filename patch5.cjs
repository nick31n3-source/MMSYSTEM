const fs = require('fs');
let file = fs.readFileSync('src/components/FinancialReports.tsx', 'utf8');

const targetContent1 = `  const chartData = useMemo(() => {
    let rawData = reports.byDay;
    let limit = 14;
    let keys: string[] = [];
    const today = new Date();

    if (period === 'daily') {
      rawData = reports.byDay;
      limit = 14;
      for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        keys.push(\`\${y}-\${m}-\${day}\`);
      }
    } else if (period === 'monthly') {
      rawData = reports.byMonth;
      limit = 12;
      for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        keys.push(\`\${y}-\${m}\`);
      }
    } else if (period === 'yearly') {
      rawData = reports.byYear;
      limit = 5;
      for (let i = limit - 1; i >= 0; i--) {
        const y = today.getFullYear() - i;
        keys.push(y.toString());
      }
    }`;

const replaceContent1 = `  const chartData = useMemo(() => {
    let rawData = reports.byDay;

    if (period === 'daily') {
      rawData = reports.byDay;
    } else if (period === 'monthly') {
      rawData = reports.byMonth;
    } else if (period === 'yearly') {
      rawData = reports.byYear;
    }
    
    let keys = Object.keys(rawData).sort();`;

const targetContent2 = `  const currentPeriodName = useMemo(() => {
    if (period === 'daily') return 'Últimos 14 dias';
    if (period === 'monthly') return 'Últimos 12 meses';
    return 'Últimos 5 anos';
  }, [period]);`;

const replaceContent2 = `  const currentPeriodName = useMemo(() => {
    if (period === 'daily') return 'Diário';
    if (period === 'monthly') return 'Mensal';
    return 'Anual';
  }, [period]);`;

if(file.includes(targetContent1) && file.includes(targetContent2)) {
    file = file.replace(targetContent1, replaceContent1);
    file = file.replace(targetContent2, replaceContent2);
    fs.writeFileSync('src/components/FinancialReports.tsx', file);
    console.log("Patched FinancialReports.tsx successfully");
} else {
    console.log("Target not found");
}
