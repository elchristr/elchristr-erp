import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Table, Th, Td, Button } from '../components';
import { Product } from '../types';

export function ProductsView() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [imageUrl, setImageUrl] = useState('');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name,
      sku,
      purchasePrice,
      sellingPrice,
      currentStock,
      imageUrl,
      status: 'Active'
    });
    
    setShowNewProduct(false);
    setName('');
    setSku('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setCurrentStock(0);
    setImageUrl('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-100">Products</h1>
        <Button onClick={() => setShowNewProduct(!showNewProduct)}>
          {showNewProduct ? 'Cancel' : '+ Add Product'}
        </Button>
      </div>

      {showNewProduct && (
        <Card title="Add New Product" className="border-emerald-900">
          <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Product Name</label>
                <input 
                  type="text" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">SKU</label>
                <input 
                  type="text" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Image URL (Optional)</label>
                <input 
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Purchase Price</label>
                <input 
                  type="number" min="0" step="0.01" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Selling Price</label>
                <input 
                  type="number" min="0" step="0.01" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Initial Stock</label>
                <input 
                  type="number" min="0" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={currentStock}
                  onChange={e => setCurrentStock(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Product</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Image</Th>
              <Th>SKU</Th>
              <Th>Product Name</Th>
              <Th>Purchase Price</Th>
              <Th>Selling Price</Th>
              <Th>Current Stock</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="group">
                <Td>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-sm border border-zinc-800" />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-800 rounded-sm border border-zinc-700 flex items-center justify-center text-xs text-zinc-500">No Img</div>
                  )}
                </Td>
                <Td className="font-mono text-xs text-zinc-400">{p.sku}</Td>
                <Td className="font-medium text-zinc-200">{p.name}</Td>
                <Td>${p.purchasePrice.toFixed(2)}</Td>
                <Td>${p.sellingPrice.toFixed(2)}</Td>
                <Td>
                  <span className={`px-2 py-0.5 rounded-sm font-semibold text-xs ${p.currentStock < 10 ? 'bg-rose-950 text-rose-400' : 'bg-zinc-800 text-zinc-300'}`}>
                    {p.currentStock}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="px-2 py-0.5 text-xs" onClick={() => updateProduct(p.id, { currentStock: p.currentStock + 5 })}>
                      Add Stock
                    </Button>
                    <Button variant="danger" className="px-2 py-0.5 text-xs" onClick={() => deleteProduct(p.id)}>
                      Delete
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

export function SalesView() {
  const { sales, products, addSale } = useStore();
  const [showNewSale, setShowNewSale] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    addSale({
      customerName,
      productId: product.id,
      quantity,
      sellingPrice: product.sellingPrice,
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowNewSale(false);
    setSelectedProduct('');
    setQuantity(1);
    setCustomerName('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-100">Sales</h1>
        <Button onClick={() => setShowNewSale(!showNewSale)}>
          {showNewSale ? 'Cancel' : '+ New Sale'}
        </Button>
      </div>

      {showNewSale && (
        <Card title="Record New Sale" className="border-rose-900">
          <form onSubmit={handleCreateSale} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Product</label>
                <select 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                >
                  <option value="">Select a product...</option>
                  {products.filter(p => p.currentStock > 0).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (${p.sellingPrice}) - Stock: {p.currentStock}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Quantity</label>
                <input 
                  type="number" min="1" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Customer Name</label>
                <input 
                  type="text" required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Complete Sale</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Product</Th>
              <Th>Qty</Th>
              <Th>Selling Price</Th>
              <Th>Revenue</Th>
              <Th>Profit</Th>
            </tr>
          </thead>
          <tbody>
            {sales.map(so => {
              const product = products.find(p => p.id === so.productId);
              const revenue = so.sellingPrice * so.quantity;
              return (
                <tr key={so.id} className="group">
                  <Td>{so.date}</Td>
                  <Td>{so.customerName}</Td>
                  <Td>{product?.name || 'Unknown Product'}</Td>
                  <Td>{so.quantity}</Td>
                  <Td>${so.sellingPrice.toFixed(2)}</Td>
                  <Td className="font-semibold">${revenue.toFixed(2)}</Td>
                  <Td className="text-emerald-400 font-semibold">${so.profit.toFixed(2)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
