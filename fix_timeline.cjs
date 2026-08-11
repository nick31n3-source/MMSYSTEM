const fs = require('fs');
let code = fs.readFileSync('src/components/FinancialReports.tsx', 'utf8');

// I will replace the chartData useMemo block with one that generates a continuous timeline.

const oldChartDataBlock = `  // Format data for chart
  const chartData = useMemo(() => {
    let rawData = reports.byDay;
    let limit = 14;
    
    if (period === 'monthly') {
      rawData = reports.byMonth;
      limit = 12;
    } else if (period === 'yearly') {
      rawData = reports.byYear;
      limit = 5;
    }

    return Object.entries(rawData)
      .map(([key, value]: [string, any]) => ({ 
        name: key, 
        total: value.sales, 
        cost: value.costs,
        profit: value.profit,
        topItems: Object.entries(value.itemSales as Record<string, number>).sort((a,b) => (b[1] as number) - (a[1] as number)).slice(0, 3)
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-limit);
  }, [reports, period]);`;

const newChartDataBlock = `  // Format data for chart with continuous timeline
  const chartData = useMemo(() => {
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
    }

    return keys.map(key => {
      const value = rawData[key];
      if (value) {
        return {
          name: key,
          total: value.sales,
          cost: value.costs,
          profit: value.profit,
          topItems: Object.entries(value.itemSales as Record<string, number>).sort((a,b) => (b[1] as number) - (a[1] as number)).slice(0, 3)
        };
      } else {
        return {
          name: key,
          total: 0,
          cost: 0,
          profit: 0,
          topItems: []
        };
      }
    });
  }, [reports, period]);`;

code = code.replace(oldChartDataBlock, newChartDataBlock);
fs.writeFileSync('src/components/FinancialReports.tsx', code);
