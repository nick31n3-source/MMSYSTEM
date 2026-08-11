const fs = require('fs');
let file = fs.readFileSync('src/components/FinancialReports.tsx', 'utf8');

const target1 = `  const totalValue = chartData.reduce((acc, curr) => acc + curr.total, 0);`;
const replace1 = `  const totalValue = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear().toString();
    const m = \`\${y}-\${(today.getMonth() + 1).toString().padStart(2, '0')}\`;
    const d = \`\${m}-\${today.getDate().toString().padStart(2, '0')}\`;

    if (period === 'daily') {
      return reports.byDay[d]?.sales || 0;
    } else if (period === 'monthly') {
      return reports.byMonth[m]?.sales || 0;
    } else {
      return reports.byYear[y]?.sales || 0;
    }
  }, [reports, period]);`;

if (file.includes(target1)) {
    file = file.replace(target1, replace1);
    fs.writeFileSync('src/components/FinancialReports.tsx', file);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
