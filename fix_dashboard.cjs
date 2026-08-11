const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

// Fix activeOrdersCount
const oldActiveOrdersCount = `  const activeOrdersCount = useMemo(() => orders.filter(o => o.status !== 'closed').filter(o => {
    return o.items.some(item => {
      const menuItem = menu.find(m => m.id === item.menuItemId);
      return menuItem && menuItem.category !== 'Beverages';
    });
  }).length, [orders, menu]);`;

const newActiveOrdersCount = `  const nonBeverageMenuIds = useMemo(() => {
    const set = new Set<string>();
    menu.forEach(m => {
      if (m.category !== 'Beverages') set.add(m.id);
    });
    return set;
  }, [menu]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status !== 'closed').filter(o => {
      return o.items.some(item => nonBeverageMenuIds.has(item.menuItemId));
    }).length;
  }, [orders, nonBeverageMenuIds]);`;

code = code.replace(oldActiveOrdersCount, newActiveOrdersCount);

// Fix recentSales
const oldRecentSales = `  // Recent transactions (last 5)
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);`;

const newRecentSales = `  // Recent transactions (last 5)
  const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [sales]);`;

code = code.replace(oldRecentSales, newRecentSales);

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
