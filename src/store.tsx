import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Sale, Expense, Invoice, Purchase, Contributor } from './types';

interface StoreState {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  invoices: Invoice[];
  purchases: Purchase[];
  contributors: Contributor[];
}

interface StoreContextType extends StoreState {
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'profit'>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  addPurchase: (purchase: Omit<Purchase, 'id'>) => void;
  uploadPurchaseReceipt: (purchaseId: string, receiptUrl: string) => void;
  addContributor: (contributor: Omit<Contributor, 'id' | 'amountUsed' | 'dateAdded'>) => void;
}

const mockProducts: Product[] = [];

const mockSales: Sale[] = [];

const mockExpenses: Expense[] = [];

const mockInvoices: Invoice[] = [];

const mockContributors: Contributor[] = [];

const mockPurchases: Purchase[] = [];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>({
    products: mockProducts,
    sales: mockSales,
    expenses: mockExpenses,
    invoices: mockInvoices,
    purchases: mockPurchases,
    contributors: mockContributors,
  });

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setState(prev => ({
      ...prev,
      expenses: [...prev.expenses, { ...expense, id: `e${Date.now()}` }]
    }));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setState(prev => ({
      ...prev,
      products: [...prev.products, { ...product, id: `p${Date.now()}` }]
    }));
  };

  const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'profit'>) => {
    setState(prev => {
      const product = prev.products.find(p => p.id === sale.productId);
      const cost = product ? product.purchasePrice * sale.quantity : 0;
      const revenue = sale.sellingPrice * sale.quantity;
      const profit = revenue - cost;
      const newSaleId = `so${Date.now()}`;
      
      const newSale: Sale = { ...sale, id: newSaleId, profit };
      
      // Auto generate invoice
      const newInvoice: Invoice = {
        id: `inv${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(prev.invoices.length + 1).padStart(3, '0')}`,
        saleId: newSaleId,
        customerName: sale.customerName,
        date: sale.date,
        total: revenue
      };

      return {
        ...prev,
        sales: [...prev.sales, newSale],
        invoices: [...prev.invoices, newInvoice],
        // Auto reduce stock
        products: prev.products.map(p => 
          p.id === sale.productId 
            ? { ...p, currentStock: Math.max(0, p.currentStock - sale.quantity) }
            : p
        )
      };
    });
  };

  const addPurchase = (purchase: Omit<Purchase, 'id'>) => {
    setState(prev => {
      let updatedContributors = prev.contributors;
      
      if (purchase.fundingSource === 'Investment Pool' && purchase.contributorId) {
        updatedContributors = prev.contributors.map(c => 
          c.id === purchase.contributorId
            ? { ...c, amountAvailable: c.amountAvailable - purchase.totalCost, amountUsed: c.amountUsed + purchase.totalCost }
            : c
        );
      }
      
      const updatedProducts = prev.products.map(p =>
        p.id === purchase.productId
          ? { ...p, currentStock: p.currentStock + purchase.quantity }
          : p
      );

      return {
        ...prev,
        purchases: [...prev.purchases, { ...purchase, id: `po${Date.now()}` }],
        contributors: updatedContributors,
        products: updatedProducts
      };
    });
  };

  const uploadPurchaseReceipt = (purchaseId: string, receiptUrl: string) => {
    setState(prev => ({
      ...prev,
      purchases: prev.purchases.map(p => 
        p.id === purchaseId ? { ...p, receiptUrl } : p
      )
    }));
  };

  const addContributor = (contributor: Omit<Contributor, 'id' | 'amountUsed' | 'dateAdded'>) => {
    setState(prev => ({
      ...prev,
      contributors: [...prev.contributors, { ...contributor, id: `c${Date.now()}`, amountUsed: 0, dateAdded: new Date().toISOString().split('T')[0] }]
    }));
  };

  return (
    <StoreContext.Provider value={{ ...state, addExpense, addSale, addProduct, updateProduct, deleteProduct, addPurchase, uploadPurchaseReceipt, addContributor }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
