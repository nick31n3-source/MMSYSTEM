const fs = require('fs');
let file = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const targetContent1 = `  // Compute operational statistics
  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + s.totalAmount, 0), [sales]);
  const avgTicket = useMemo(() => sales.length > 0 ? totalRevenue / sales.length : 0, [sales, totalRevenue]);`;

const replaceContent1 = `  // Compute operational statistics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySales = useMemo(() => {
    return sales.filter(s => new Date(s.timestamp) >= todayStart);
  }, [sales]);

  const totalRevenue = useMemo(() => todaySales.reduce((sum, s) => sum + s.totalAmount, 0), [todaySales]);
  const avgTicket = useMemo(() => todaySales.length > 0 ? totalRevenue / todaySales.length : 0, [todaySales, totalRevenue]);`;

if(file.includes(targetContent1)) {
    file = file.replace(targetContent1, replaceContent1);
    
    // Also change CONSOLIDADO SESSÃO to HOJE
    file = file.replace('CONSOLIDADO SESSÃO', 'HOJE');
    
    fs.writeFileSync('src/components/DashboardOverview.tsx', file);
    console.log("Patched successfully");
} else {
    console.log("Target not found");
}
