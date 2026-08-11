import { SalesRecord, Order, MenuItem } from '../types';

export interface ReportByPeriod {
  [period: string]: {
    sales: number;
    costs: number;
    profit: number;
    itemSales: Record<string, number>; // itemId -> quantity sold
    ingredientConsumption: Record<string, number>; // ingredientId -> quantity consumed
  };
}

export interface TransactionReportsOutput {
  byDay: ReportByPeriod;
  byMonth: ReportByPeriod;
  byYear: ReportByPeriod;
}

export function generateTransactionReports(
  salesRecords: SalesRecord[],
  orders: Order[],
  menu: MenuItem[]
): TransactionReportsOutput {
  const result: TransactionReportsOutput = {
    byDay: {},
    byMonth: {},
    byYear: {},
  };

  const getOrInitPeriod = (periodObj: ReportByPeriod, key: string) => {
    if (!periodObj[key]) {
      periodObj[key] = { sales: 0, costs: 0, profit: 0, itemSales: {}, ingredientConsumption: {} };
    }
    return periodObj[key];
  };

  for (const sale of salesRecords) {
    const date = new Date(sale.timestamp);
    if (isNaN(date.getTime())) continue;

    // Use local timezone to prevent evening sales from spilling into the next UTC day
    const yearNum = date.getFullYear();
    const monthNum = date.getMonth() + 1;
    const dayNum = date.getDate();

    const year = yearNum.toString();
    const month = `${year}-${monthNum.toString().padStart(2, '0')}`;
    const day = `${month}-${dayNum.toString().padStart(2, '0')}`;

    const relatedOrder = orders.find(o => o.id === sale.orderId);

    const updatePeriod = (pObj: ReportByPeriod, key: string) => {
      const p = getOrInitPeriod(pObj, key);
      p.sales += sale.totalAmount;
      p.costs += sale.costAmount;
      p.profit += sale.profitAmount;

      if (relatedOrder) {
        for (const item of relatedOrder.items) {
          p.itemSales[item.name] = (p.itemSales[item.name] || 0) + item.quantity;
          
          const menuItem = menu.find(m => m.id === item.menuItemId);
          if (menuItem) {
            for (const ing of menuItem.ingredients) {
              p.ingredientConsumption[ing.ingredientId] = 
                (p.ingredientConsumption[ing.ingredientId] || 0) + (ing.quantityNeeded * item.quantity);
            }
          }
        }
      }
    };

    updatePeriod(result.byDay, day);
    updatePeriod(result.byMonth, month);
    updatePeriod(result.byYear, year);
  }

  return result;
}
