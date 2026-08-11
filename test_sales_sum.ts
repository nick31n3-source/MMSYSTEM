import { generateTransactionReports } from './src/utils/transactionReports';

const today = new Date();
const sales = [
  { id: '1', orderId: 'o1', timestamp: new Date().toISOString(), totalAmount: 100, costAmount: 50, profitAmount: 50 },
  { id: '2', orderId: 'o2', timestamp: new Date(today.getTime() - 20 * 24 * 3600 * 1000).toISOString(), totalAmount: 200, costAmount: 100, profitAmount: 100 },
  { id: '3', orderId: 'o3', timestamp: new Date(today.getTime() - 400 * 24 * 3600 * 1000).toISOString(), totalAmount: 400, costAmount: 200, profitAmount: 200 },
] as any[];

const reports = generateTransactionReports(sales, [], []);

function getChartData(period) {
    let rawData = reports.byDay;
    let limit = 14;
    let keys: string[] = [];

    if (period === 'daily') {
      rawData = reports.byDay;
      limit = 14;
      for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        keys.push(`${y}-${m}-${day}`);
      }
    } else if (period === 'monthly') {
      rawData = reports.byMonth;
      limit = 12;
      for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        keys.push(`${y}-${m}`);
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
      if (value) return { name: key, total: value.sales };
      return { name: key, total: 0 };
    });
}

console.log("Daily:", getChartData('daily').reduce((a,b)=>a+b.total,0));
console.log("Monthly:", getChartData('monthly').reduce((a,b)=>a+b.total,0));
console.log("Yearly:", getChartData('yearly').reduce((a,b)=>a+b.total,0));
