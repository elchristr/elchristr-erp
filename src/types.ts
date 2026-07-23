export type ProductStatus = 'Active' | 'Inactive';

export interface Product {
  id: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  status: ProductStatus;
  imageUrl?: string;
}

export interface Purchase {
  id: string;
  poNumber: string;
  supplierName: string;
  date: string;
  productId: string;
  quantity: number;
  totalCost: number;
  status: 'Pending' | 'Completed';
  fundingSource: 'Business Cash' | 'Investment Pool';
  contributorId?: string;
  receiptUrl?: string;
}

export interface Contributor {
  id: string;
  name: string;
  phone: string;
  email: string;
  referenceId: string;
  amountAvailable: number;
  amountUsed: number;
  dateAdded: string;
  notes: string;
}

export interface Sale {
  id: string;
  customerName: string;
  productId: string;
  quantity: number;
  sellingPrice: number;
  profit: number;
  date: string;
}

export interface Expense {
  id: string;
  category: 'Transport' | 'Fuel' | 'Packaging' | 'Warehouse' | 'Marketing' | 'Repairs' | 'Internet' | 'Electricity' | 'Other';
  amount: number;
  date: string;
  description: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  saleId: string;
  customerName: string;
  date: string;
  total: number;
}
