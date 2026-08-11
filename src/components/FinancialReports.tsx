import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { generateTransactionReports } from '../utils/transactionReports';
import { formatCurrency } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

type Period = 'daily' | 'monthly' | 'yearly';

export const FinancialReports: React.FC = () => {
  const { sales } = useRestaurant();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [period, setPeriod] = useState<Period>('daily');

  const { orders, menu } = useRestaurant();
  const sortedSales = useMemo(() => [...sales].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [sales]);

  const reports = useMemo(() => {
    return generateTransactionReports(sales, orders, menu);
  }, [sales, orders, menu]);

  // Format data for chart with continuous timeline
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
  }, [reports, period]);

  const totalValue = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear().toString();
    const m = `${y}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const d = `${m}-${today.getDate().toString().padStart(2, '0')}`;

    if (period === 'daily') {
      return reports.byDay[d]?.sales || 0;
    } else if (period === 'monthly') {
      return reports.byMonth[m]?.sales || 0;
    } else {
      return reports.byYear[y]?.sales || 0;
    }
  }, [reports, period]);
  
  const currentPeriodName = useMemo(() => {
    if (period === 'daily') return 'Últimos 14 dias';
    if (period === 'monthly') return 'Últimos 12 meses';
    return 'Últimos 5 anos';
  }, [period]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-white animate-fade-in">
      {/* Header */}
      <div className="border-b border-white/20 pb-6">
        
        <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-2">
          Relatórios Consolidados
        </h1>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar/Options */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0c1622] border border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display mb-4">
              Agrupamento
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setPeriod('daily')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${period === 'daily' ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-[#070b14] text-slate-400 hover:bg-white/10 hover:text-white'}`}
              >
                <span>DIÁRIO</span>
                {period === 'daily' && <span className="w-2 h-2 rounded-full bg-[#0c1622] animate-pulse"></span>}
              </button>
              
              <button
                onClick={() => setPeriod('monthly')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${period === 'monthly' ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-[#070b14] text-slate-400 hover:bg-white/10 hover:text-white'}`}
              >
                <span>MENSAL</span>
                {period === 'monthly' && <span className="w-2 h-2 rounded-full bg-[#0c1622] animate-pulse"></span>}
              </button>
              
              <button
                onClick={() => setPeriod('yearly')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${period === 'yearly' ? 'bg-white text-black shadow-md shadow-white/20' : 'bg-[#070b14] text-slate-400 hover:bg-white/10 hover:text-white'}`}
              >
                <span>ANUAL</span>
                {period === 'yearly' && <span className="w-2 h-2 rounded-full bg-[#0c1622] animate-pulse"></span>}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-transparent rounded-3xl p-6 text-white shadow-lg shadow-white/30">
            <span className="block text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest mb-1">
              Total Acumulado ({currentPeriodName})
            </span>
            <span className="block text-3xl font-extrabold font-mono tracking-tight">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0c1622] border border-white/10 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">
                Gráfico de Faturamento
              </h3>
              <span className="text-[10px] font-mono bg-[#091018] text-slate-400 px-2 py-1 rounded-md uppercase font-bold">
                {chartData.length} registros
              </span>
            </div>
            
            <div className="flex-1 w-full h-[300px] min-h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'monospace' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'monospace' }}
                      tickFormatter={(val) => `R$ ${(val / 1000).toFixed(1)}k`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value) => [formatCurrency(value as number), 'Faturamento']}
                      labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                    />
                    <Bar dataKey="total" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs font-mono bg-[#070b14] rounded-2xl border border-dashed border-white/10">
                  NENHUM DADO ENCONTRADO PARA O PERÍODO
                </div>
              )}
            </div>
          </div>
          
          {/* Detailed Data Table */}
          <div className="bg-[#0c1622] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-white/5 bg-[#070b14] flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Tabela de Consolidação
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0c1622] border-b border-white/10">
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Período</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Faturamento</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Custos</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Lucro</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Mais Vendidos</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.length > 0 ? (
                    chartData.map((data, idx) => (
                      <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-[#070b14] transition-colors">
                        <td className="py-3 px-4 text-xs font-mono font-medium text-slate-300">{data.name}</td>
                        <td className="py-3 px-4 text-xs font-mono font-bold text-white">{formatCurrency(data.total)}</td>
                        <td className="py-3 px-4 text-xs font-mono font-bold text-rose-400">{formatCurrency(data.cost)}</td>
                        <td className="py-3 px-4 text-xs font-mono font-bold text-slate-300">{formatCurrency(data.profit)}</td>
                        <td className="py-3 px-4 text-[10px] font-mono text-slate-400">
                          {data.topItems.map((item, i) => (
                            <div key={i}>{item[0]} ({item[1]}x)</div>
                          ))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-slate-500 italic">
                        Sem registros consolidados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw Transactions Table */}
          <div className="bg-[#0c1622] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-white/5 bg-[#070b14] flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Extrato de Transações
              </h3>
              <span className="text-[10px] font-mono bg-[#14293a] text-slate-400 px-2 py-1 rounded-md uppercase font-bold">
                {sales.length} transações
              </span>
            </div>
            
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 bg-[#0c1622] z-10 shadow-sm">
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0c1622]">Data/Hora</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0c1622]">Mesa</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0c1622]">Pagamento</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0c1622] text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length > 0 ? (
                    sortedSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((sale) => {
                        const dateObj = new Date(sale.timestamp);
                        const dateStr = dateObj.toLocaleDateString('pt-BR');
                        const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        
                        let paymentBadge = 'bg-[#091018] text-slate-300';
                        let paymentLabel = sale.paymentMethod;
                        if (sale.paymentMethod === 'cash') { paymentBadge = 'bg-white/5 text-slate-300'; paymentLabel = 'Dinheiro'; }
                        if (sale.paymentMethod === 'card') { paymentBadge = 'bg-white/20 text-white'; paymentLabel = 'Cartão'; }
                        if (sale.paymentMethod === 'pix') { paymentBadge = 'bg-white/10 text-white border-white/20 border'; paymentLabel = 'PIX'; }
                        
                        return (
                          <tr key={sale.id} className="border-b border-white/5 last:border-0 hover:bg-[#070b14] transition-colors">
                            <td className="py-3 px-4 text-xs font-mono font-medium text-slate-300">
                              {dateStr} <span className="text-slate-500 ml-1">{timeStr}</span>
                            </td>
                            <td className="py-3 px-4 text-xs font-mono font-medium text-slate-400">
                              {sale.tableNumber}
                            </td>
                            <td className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider">
                              <span className={`px-2 py-0.5 rounded-md ${paymentBadge}`}>
                                {paymentLabel}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs font-mono font-bold text-white text-right">
                              {formatCurrency(sale.totalAmount)}
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-slate-500 italic">
                        Nenhuma transação registrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
          {sortedSales.length > itemsPerPage && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, sortedSales.length)} de {sortedSales.length} vendas
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(sortedSales.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(sortedSales.length / itemsPerPage)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
          </div>

        </div>
      </div>
    </div>
  );
};
