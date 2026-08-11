const fs = require('fs');
let file = fs.readFileSync('src/components/FinancialReports.tsx', 'utf8');

const t2 = `  const currentPeriodName = useMemo(() => {
    if (period === 'daily') return 'Hoje';
    if (period === 'monthly') return 'Este Mês';
    return 'Este Ano';
  }, [period]);`;

const r2 = `  const currentPeriodName = useMemo(() => {
    if (period === 'daily') return 'Últimos 14 dias';
    if (period === 'monthly') return 'Últimos 12 meses';
    return 'Últimos 5 anos';
  }, [period]);`;

if(file.includes(t2)) {
    file = file.replace(t2, r2);
    fs.writeFileSync('src/components/FinancialReports.tsx', file);
    console.log("Patched correctly");
} else {
    console.log("Not found");
}
