import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Table, Th, Td, Button } from '../components';
import { Expense } from '../types';

export function ExpensesView() {
  const { expenses, addExpense } = useStore();
  const [showNewExpense, setShowNewExpense] = useState(false);

  const [category, setCategory] = useState<Expense['category']>('Other');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      category,
      amount,
      description,
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowNewExpense(false);
    setCategory('Other');
    setAmount(0);
    setDescription('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-100">Expenses</h1>
        <Button onClick={() => setShowNewExpense(!showNewExpense)}>
          {showNewExpense ? 'Cancel' : '+ Record Expense'}
        </Button>
      </div>

      {showNewExpense && (
        <Card title="Record New Expense" className="border-rose-900">
          <form onSubmit={handleCreateExpense} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
                <select 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                >
                  <option value="Marketing">Marketing</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Transport">Transport</option>
                  <option value="Internet">Internet</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Amount ($)</label>
                <input 
                  type="number" min="0.01" step="0.01" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
                <input 
                  type="text" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Expense</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card className="bg-zinc-950">
          <div className="text-xs font-semibold text-zinc-400 uppercase">Total Expenses</div>
          <div className="text-xl font-bold text-zinc-100">${total.toLocaleString()}</div>
        </Card>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Category</Th>
              <Th>Description</Th>
              <Th>Amount</Th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <Td>{e.date}</Td>
                <Td>
                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-sm text-xs font-semibold">
                    {e.category}
                  </span>
                </Td>
                <Td>{e.description}</Td>
                <Td className="font-medium text-rose-500">${e.amount.toFixed(2)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export function ReportsView() {
  const { sales, expenses, products } = useStore();
  
  const totalRevenue = sales.reduce((sum, s) => sum + (s.sellingPrice * s.quantity), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  
  const bestProducts = [...products].sort((a, b) => {
    const aSales = sales.filter(s => s.productId === a.id).reduce((sum, s) => sum + s.quantity, 0);
    const bSales = sales.filter(s => s.productId === b.id).reduce((sum, s) => sum + s.quantity, 0);
    return bSales - aSales;
  });

  const lowestStock = [...products].sort((a, b) => a.currentStock - b.currentStock).slice(0, 3);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-zinc-100">System Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card title="Revenue" className="bg-emerald-950 border-emerald-900">
          <div className="text-2xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</div>
        </Card>
        <Card title="Expenses" className="bg-rose-950 border-rose-900">
          <div className="text-2xl font-bold text-rose-400">${totalExpenses.toLocaleString()}</div>
        </Card>
        <Card title="Net Profit" className="bg-zinc-900 border-zinc-800">
          <div className="text-2xl font-bold text-zinc-100">${netProfit.toLocaleString()}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Best Selling Products">
          <ul className="text-sm space-y-2 mt-2">
            {bestProducts.slice(0,3).map((p, i) => (
              <li key={p.id} className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-300">{i+1}. {p.name}</span>
                <span className="font-semibold text-zinc-100">{sales.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0)} units</span>
              </li>
            ))}
          </ul>
        </Card>
        
        <Card title="Lowest Stock Products">
          <ul className="text-sm space-y-2 mt-2">
            {lowestStock.map(p => (
              <li key={p.id} className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-300">{p.name}</span>
                <span className="font-semibold text-rose-500">{p.currentStock} left</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
