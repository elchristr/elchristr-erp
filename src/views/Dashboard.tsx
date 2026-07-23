import React from 'react';
import { useStore } from '../store';
import { Card, Table, Th, Td } from '../components';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { DollarSign, Package, TrendingUp, TrendingDown, ArrowRightLeft, CheckCircle } from 'lucide-react';

export function DashboardView() {
  const { products, sales, expenses, contributors } = useStore();

  const totalRevenue = sales.reduce((sum, s) => sum + (s.sellingPrice * s.quantity), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const inventoryValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
  const cashAvailable = netProfit; // cash from operations

  const activeProducts = products.filter(p => p.status === 'Active').length;
  
  const totalInvestmentFunds = contributors.reduce((sum, c) => sum + c.amountAvailable + c.amountUsed, 0);
  const totalInvestmentUsed = contributors.reduce((sum, c) => sum + c.amountUsed, 0);
  const totalInvestmentAvailable = contributors.reduce((sum, c) => sum + c.amountAvailable, 0);

  const chartData = [
    { name: 'May', Rev: 0, Exp: 0, Profit: 0 },
    { name: 'Jun', Rev: 0, Exp: 0, Profit: 0 },
    { name: 'Jul', Rev: totalRevenue, Exp: totalExpenses, Profit: netProfit },
  ];

  const KpiCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="flex flex-row items-center p-4">
      <div className={`p-3 rounded-sm text-zinc-100 mr-4 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</div>
        <div className="text-2xl font-bold text-zinc-100">{value}</div>
      </div>
    </Card>
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">Business Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Cash Available" value={`$${cashAvailable.toLocaleString()}`} icon={DollarSign} colorClass="bg-zinc-800 text-zinc-100" />
        <KpiCard title="Investment Available" value={`$${totalInvestmentAvailable.toLocaleString()}`} icon={DollarSign} colorClass="bg-rose-900 text-rose-100" />
        <KpiCard title="Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={TrendingUp} colorClass="bg-zinc-800 text-emerald-500" />
        <KpiCard title="Net Profit" value={`$${netProfit.toLocaleString()}`} icon={TrendingDown} colorClass={netProfit >= 0 ? "bg-zinc-800 text-emerald-500" : "bg-zinc-800 text-rose-500"} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card title="Financial Performance">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#a1a1aa'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#a1a1aa'}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip cursor={{fill: '#27272a'}} contentStyle={{borderRadius: '2px', border: '1px solid #3f3f46', fontSize: '12px', backgroundColor: '#18181b', color: '#e4e4e7'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', color: '#a1a1aa'}} />
                <Bar dataKey="Rev" name="Revenue" fill="#10b981" radius={[2,2,0,0]} barSize={40} />
                <Bar dataKey="Exp" name="Expenses" fill="#e11d48" radius={[2,2,0,0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Investment Pool Overview">
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Total Investment Funds</span>
              <span className="text-sm font-bold text-zinc-100">${totalInvestmentFunds.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Total Used</span>
              <span className="text-sm font-bold text-rose-400">${totalInvestmentUsed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Remaining Available</span>
              <span className="text-sm font-bold text-emerald-400">${totalInvestmentAvailable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm text-zinc-400">Number of Contributors</span>
              <span className="text-sm font-bold text-zinc-100">{contributors.length}</span>
            </div>
          </div>
        </Card>
        
        <Card title="Recent Activities">
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0,3).map(s => (
                <tr key={s.id} className="group border-b border-zinc-800 last:border-b-0">
                  <Td>{s.date}</Td>
                  <Td><span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded-sm text-xs font-semibold">Sale</span></Td>
                  <Td className="font-medium text-emerald-400">+${(s.sellingPrice * s.quantity).toLocaleString()}</Td>
                </tr>
              ))}
              {expenses.slice(0,2).map(e => (
                <tr key={e.id} className="group border-b border-zinc-800 last:border-b-0">
                  <Td>{e.date}</Td>
                  <Td><span className="px-2 py-0.5 bg-rose-950 text-rose-400 rounded-sm text-xs font-semibold">Expense</span></Td>
                  <Td className="font-medium text-rose-500">-${e.amount.toLocaleString()}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
