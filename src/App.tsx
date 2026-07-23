import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, TrendingUp, 
  CreditCard, FileText, ShoppingCart, Briefcase, LogOut
} from 'lucide-react';

import { DashboardView } from './views/Dashboard';
import { ProductsView, SalesView } from './views/Operations';
import { ExpensesView, ReportsView } from './views/Finance';
import { InvoicesView } from './views/Invoices';
import { InvestmentPoolView, PurchasesView } from './views/Purchasing';
import { LoginView } from './views/Login';
import { supabase } from './supabase';

type ViewType = 'Dashboard' | 'Products' | 'Sales' | 'Expenses' | 'Invoices' | 'Reports' | 'Purchases' | 'Investment Pool';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('Dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      }
      setIsAuthLoading(false);
    }).catch((err) => {
      console.error("Auth error:", err);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const navItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Products', icon: Package, label: 'Products' },
    { id: 'Purchases', icon: ShoppingCart, label: 'Purchases' },
    { id: 'Sales', icon: TrendingUp, label: 'Sales' },
    { id: 'Expenses', icon: CreditCard, label: 'Expenses' },
    { id: 'Invoices', icon: FileText, label: 'Invoices' },
    { id: 'Investment Pool', icon: Briefcase, label: 'Investment Pool' },
    { id: 'Reports', icon: FileText, label: 'Reports' },
  ] as const;

  if (isAuthLoading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'Dashboard': return <DashboardView />;
      case 'Products': return <ProductsView />;
      case 'Purchases': return <PurchasesView />;
      case 'Sales': return <SalesView />;
      case 'Expenses': return <ExpensesView />;
      case 'Invoices': return <InvoicesView />;
      case 'Investment Pool': return <InvestmentPoolView />;
      case 'Reports': return <ReportsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen print:h-auto print:block bg-zinc-950 print:bg-white font-sans text-zinc-200">
      {/* Sidebar */}
      <div className="w-56 bg-zinc-900 text-zinc-400 flex flex-col shadow-xl z-10 shrink-0 overflow-y-auto print:hidden">
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 shrink-0 flex flex-col items-start gap-2">
          <img src="https://i.postimg.cc/zXpg7rTL/Polyligne-F.png" alt="Elie Group Logo" className="h-8 object-contain" crossOrigin="anonymous" />
          <h1 className="text-sm font-black text-white tracking-widest uppercase">ELIE GROUP INVENTORY</h1>
        </div>
        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                    currentView === item.id 
                      ? 'bg-rose-900/40 text-rose-100 font-semibold border-l-4 border-rose-700' 
                      : 'hover:bg-zinc-800 hover:text-zinc-200 border-l-4 border-transparent'
                  }`}
                >
                  <item.icon size={16} className="mr-3 shrink-0" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-600 flex justify-between items-center">
          <span>v1.1.0-simple</span>
          <button onClick={handleLogout} className="text-zinc-400 hover:text-rose-400 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:block">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-zinc-800 h-14 flex items-center px-6 shrink-0 justify-between shadow-sm print:hidden">
          <div className="text-sm font-semibold text-zinc-300">
            {currentView}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-bold">
              EG
            </div>
            <div className="text-xs font-medium text-zinc-300">Elie Group Admin</div>
          </div>
        </header>
        
        {/* Workspace */}
        <main className="flex-1 overflow-auto p-6 bg-zinc-950 print:p-0 print:bg-white print:overflow-visible print:block">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full print:m-0">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
