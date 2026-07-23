import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { useStore } from '../store';
import { Card, Table, Th, Td, Button } from '../components';

export function InvestmentPoolView() {
  const { contributors, purchases, products, addContributor } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedContributorId, setSelectedContributorId] = useState<string | null>(null);
  const [receiptContributorId, setReceiptContributorId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [amountAvailable, setAmountAvailable] = useState(0);
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addContributor({ name, phone, email, referenceId, amountAvailable, notes });
    setShowAdd(false);
    // Find the latest contributor ID we just created in a real app this is easier, but here we'll just let the list show it
    setName(''); setPhone(''); setEmail(''); setReferenceId(''); setAmountAvailable(0); setNotes('');
  };

  const selectedContributor = contributors.find(c => c.id === selectedContributorId);
  const contributorPurchases = purchases.filter(p => p.contributorId === selectedContributorId);
  const receiptContributor = contributors.find(c => c.id === receiptContributorId);

  const totalInvestmentFunds = contributors.reduce((sum, c) => sum + c.amountAvailable + c.amountUsed, 0);
  const totalInvestmentUsed = contributors.reduce((sum, c) => sum + c.amountUsed, 0);
  const totalInvestmentAvailable = contributors.reduce((sum, c) => sum + c.amountAvailable, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('receipt-document');
    if (element) {
      const dataUrl = await htmlToImage.toPng(element, { 
        quality: 1, 
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Investment_Receipt_${receiptContributor?.referenceId || receiptContributorId}.pdf`);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-zinc-100">Investment Pool</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Contributor'}
        </Button>
      </div>

      {!receiptContributorId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 print:hidden">
          <Card className="bg-zinc-950">
            <div className="text-xs font-semibold text-zinc-400 uppercase">Total Funds</div>
            <div className="text-xl font-bold text-zinc-100">${totalInvestmentFunds.toLocaleString()}</div>
          </Card>
          <Card className="bg-zinc-950">
            <div className="text-xs font-semibold text-zinc-400 uppercase">Total Used</div>
            <div className="text-xl font-bold text-rose-500">${totalInvestmentUsed.toLocaleString()}</div>
          </Card>
          <Card className="bg-zinc-950">
            <div className="text-xs font-semibold text-zinc-400 uppercase">Remaining Balance</div>
            <div className="text-xl font-bold text-emerald-400">${totalInvestmentAvailable.toLocaleString()}</div>
          </Card>
          <Card className="bg-zinc-950">
            <div className="text-xs font-semibold text-zinc-400 uppercase">Contributors</div>
            <div className="text-xl font-bold text-zinc-100">{contributors.length}</div>
          </Card>
        </div>
      )}

      {showAdd && !receiptContributorId && (
        <Card title="Add Contributor" className="border-rose-900">
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label><input type="text" required className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={name} onChange={e => setName(e.target.value)} /></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Phone</label><input type="text" required className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Email (optional)</label><input type="email" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Reference ID</label><input type="text" required className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={referenceId} onChange={e => setReferenceId(e.target.value)} /></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Amount Available ($)</label><input type="number" required min="1" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={amountAvailable} onChange={e => setAmountAvailable(Number(e.target.value))} /></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Notes</label><input type="text" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={notes} onChange={e => setNotes(e.target.value)} /></div>
            </div>
            <div className="flex justify-end"><Button type="submit">Save Contributor</Button></div>
          </form>
        </Card>
      )}

      {!receiptContributorId ? (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Contributor</Th>
                <Th>Reference ID</Th>
                <Th>Available Funds</Th>
                <Th>Funds Used</Th>
                <Th>Remaining Balance</Th>
                <Th>Status</Th>
                <Th>Date Added</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {contributors.map(c => (
                <tr key={c.id} className="group border-b border-zinc-800 last:border-b-0">
                  <Td className="font-semibold text-zinc-200">{c.name}</Td>
                  <Td className="font-mono text-xs text-zinc-400">{c.referenceId}</Td>
                  <Td>${(c.amountAvailable + c.amountUsed).toLocaleString()}</Td>
                  <Td className="text-rose-500">${c.amountUsed.toLocaleString()}</Td>
                  <Td className="font-bold text-emerald-400">${c.amountAvailable.toLocaleString()}</Td>
                  <Td><span className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${c.amountAvailable > 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>{c.amountAvailable > 0 ? 'Active' : 'Depleted'}</span></Td>
                  <Td>{c.dateAdded}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="px-2 py-0.5 text-xs" onClick={() => setSelectedContributorId(c.id)}>View</Button>
                      <Button variant="secondary" className="px-2 py-0.5 text-xs">Edit</Button>
                      <Button variant="secondary" className="px-2 py-0.5 text-xs" onClick={() => setReceiptContributorId(c.id)}>Receipt</Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : receiptContributor ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 print:hidden mb-4">
            <Button variant="secondary" onClick={() => setReceiptContributorId(null)}>← Back</Button>
            <Button variant="primary" onClick={handlePrint}>Print Receipt</Button>
            <Button variant="secondary" onClick={handleDownload}>Download PDF</Button>
          </div>

          <div className="bg-[#ffffff] border border-[#cbd5e1] shadow-md p-8 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-full print:w-full" id="receipt-document">
            <div className="flex justify-between items-start border-b border-[#e2e8f0] pb-6 mb-6">
              <div>
                <img src="https://i.postimg.cc/zXpg7rTL/Polyligne-F.png" alt="Elie Group Logo" className="h-10 object-contain mb-2" crossOrigin="anonymous" />
                <h2 className="text-lg font-black text-[#18181b] tracking-widest uppercase">ELIE GROUP INVENTORY</h2>
                <div className="mt-4 text-sm text-[#475569]">
                  <p>123 Business Road</p>
                  <p>Commerce City, CC 12345</p>
                  <p>contact@elieerp.demo</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-bold text-[#cbd5e1] uppercase tracking-widest mb-2">Receipt</h1>
                <p className="text-sm font-semibold text-[#334155]">Contribution Ref: {receiptContributor.referenceId}</p>
                <p className="text-sm text-[#64748b]">Date: {receiptContributor.dateAdded}</p>
              </div>
            </div>

            <div className="flex justify-between mb-8">
              <div>
                <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Contributor Details</h3>
                <p className="text-base font-bold text-[#1e293b]">{receiptContributor.name}</p>
                {receiptContributor.phone && <p className="text-sm text-[#475569]">{receiptContributor.phone}</p>}
                {receiptContributor.email && <p className="text-sm text-[#475569]">{receiptContributor.email}</p>}
              </div>
              <div className="text-right">
                <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Status</h3>
                <span className="px-3 py-1 bg-[#d1fae5] text-[#065f46] rounded-sm text-sm font-bold border border-[#a7f3d0]">
                  FUNDED
                </span>
              </div>
            </div>

            <div className="border border-[#e2e8f0] rounded-sm mb-8">
              <div className="bg-[#f8fafc] p-4 border-b border-[#e2e8f0] flex justify-between items-center">
                <span className="font-semibold text-[#334155]">Total Contribution Amount</span>
                <span className="text-2xl font-bold text-[#0f172a]">${(receiptContributor.amountAvailable + receiptContributor.amountUsed).toLocaleString()}</span>
              </div>
              <div className="p-4 flex flex-col gap-2 text-sm text-[#475569]">
                <div className="flex justify-between">
                  <span>Available Funds (Remaining Balance)</span>
                  <span className="font-medium text-[#059669]">${receiptContributor.amountAvailable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Funds Used</span>
                  <span className="font-medium text-[#e11d48]">${receiptContributor.amountUsed.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {receiptContributor.notes && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Notes</h3>
                <p className="text-sm text-[#475569] italic">{receiptContributor.notes}</p>
              </div>
            )}

            <div className="pt-8 border-t border-[#e2e8f0] text-center">
              <p className="text-sm text-[#64748b] mb-1">Thank you for your contribution to the Investment Pool.</p>
              <p className="text-xs text-[#94a3b8]">This receipt is auto-generated by ELIE ERP.</p>
            </div>
          </div>
        </div>
      ) : null}

      {selectedContributor && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-950">
              <h2 className="text-xl font-bold text-zinc-100">Contributor Profile: {selectedContributor.name}</h2>
              <button onClick={() => setSelectedContributorId(null)} className="text-zinc-500 hover:text-zinc-300">&times;</button>
            </div>
            
            <div className="p-4 flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 p-3 rounded-sm border border-zinc-800">
                  <div className="text-xs text-zinc-500 uppercase">Available</div>
                  <div className="text-lg font-bold text-emerald-400">${selectedContributor.amountAvailable.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-sm border border-zinc-800">
                  <div className="text-xs text-zinc-500 uppercase">Used</div>
                  <div className="text-lg font-bold text-rose-500">${selectedContributor.amountUsed.toLocaleString()}</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-sm border border-zinc-800">
                  <div className="text-xs text-zinc-500 uppercase">Total Provided</div>
                  <div className="text-lg font-bold text-zinc-100">${(selectedContributor.amountAvailable + selectedContributor.amountUsed).toLocaleString()}</div>
                </div>
                <div className="bg-zinc-900 p-3 rounded-sm border border-zinc-800">
                  <div className="text-xs text-zinc-500 uppercase">Status</div>
                  <div className="text-lg font-bold text-zinc-100">{selectedContributor.amountAvailable > 0 ? 'Active' : 'Depleted'}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-2">Purchase History</h3>
                {contributorPurchases.length === 0 ? (
                  <p className="text-sm text-zinc-500">No purchases funded by this contributor.</p>
                ) : (
                  <div className="border border-zinc-800 rounded-sm overflow-hidden">
                    <Table>
                      <thead>
                        <tr>
                          <Th>Date</Th>
                          <Th>PO Number</Th>
                          <Th>Product</Th>
                          <Th>Amount Used</Th>
                          <Th>Receipt</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {contributorPurchases.map(po => {
                          const product = products.find(p => p.id === po.productId);
                          return (
                            <tr key={po.id} className="border-t border-zinc-800">
                              <Td>{po.date}</Td>
                              <Td className="font-mono text-xs">{po.poNumber}</Td>
                              <Td>{product?.name}</Td>
                              <Td className="text-rose-500 font-semibold">${po.totalCost.toLocaleString()}</Td>
                              <Td>
                                {po.receiptUrl ? (
                                  <a href={po.receiptUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs">View Receipt</a>
                                ) : (
                                  <span className="text-zinc-600 text-xs">No Receipt</span>
                                )}
                              </Td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PurchasesView() {
  const { purchases, products, contributors, addPurchase, uploadPurchaseReceipt } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  
  const [supplierName, setSupplierName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState(0);
  const [fundingSource, setFundingSource] = useState<'Business Cash' | 'Investment Pool'>('Business Cash');
  const [contributorId, setContributorId] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addPurchase({
      poNumber: `PO-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, '0')}`,
      supplierName,
      date: new Date().toISOString().split('T')[0],
      productId,
      quantity,
      totalCost,
      status: 'Completed',
      fundingSource,
      contributorId: fundingSource === 'Investment Pool' ? contributorId : undefined,
    });
    setShowAdd(false);
    setProductSku('');
    setProductId('');
    setSupplierName('');
    setQuantity(1);
    setTotalCost(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-100">Purchases</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ New Purchase Order'}
        </Button>
      </div>

      {showAdd && (
        <Card title="Record Purchase Order" className="border-rose-900">
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Supplier Name</label><input type="text" required className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={supplierName} onChange={e => setSupplierName(e.target.value)} /></div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Product (by SKU)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter SKU..." 
                    className="w-1/3 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" 
                    value={productSku} 
                    onChange={e => {
                      setProductSku(e.target.value);
                      const found = products.find(p => p.sku.toLowerCase() === e.target.value.toLowerCase());
                      if (found) setProductId(found.id);
                      else setProductId('');
                    }} 
                  />
                  <select 
                    required 
                    className="flex-1 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" 
                    value={productId} 
                    onChange={e => {
                      setProductId(e.target.value);
                      const found = products.find(p => p.id === e.target.value);
                      if (found) setProductSku(found.sku);
                    }}
                  >
                    <option value="">Select or type SKU...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Quantity</label><input type="number" required min="1" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={quantity} onChange={e => setQuantity(Number(e.target.value))} /></div>
              <div><label className="block text-xs font-semibold text-zinc-400 mb-1">Total Cost ($)</label><input type="number" required min="1" className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={totalCost} onChange={e => setTotalCost(Number(e.target.value))} /></div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Funding Source</label>
                <select required className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={fundingSource} onChange={e => setFundingSource(e.target.value as any)}>
                  <option value="Business Cash">Business Cash</option>
                  <option value="Investment Pool">Investment Pool</option>
                </select>
              </div>
              {fundingSource === 'Investment Pool' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Select Contributor</label>
                  <select required className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm" value={contributorId} onChange={e => setContributorId(e.target.value)}>
                    <option value="">Select Contributor...</option>
                    {contributors.filter(c => c.amountAvailable >= totalCost).map(c => (
                      <option key={c.id} value={c.id}>{c.name} (${c.amountAvailable.toLocaleString()} available)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end"><Button type="submit">Create PO</Button></div>
          </form>
        </Card>
      )}

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>PO Number</Th>
              <Th>Date</Th>
              <Th>Supplier</Th>
              <Th>Product</Th>
              <Th>Qty</Th>
              <Th>Total Cost</Th>
              <Th>Funding Source</Th>
              <Th>Proof of Payment</Th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(po => {
              const product = products.find(p => p.id === po.productId);
              const contributor = contributors.find(c => c.id === po.contributorId);
              return (
                <tr key={po.id} className="group border-b border-zinc-800 last:border-b-0">
                  <Td className="font-mono text-xs text-zinc-400">{po.poNumber}</Td>
                  <Td>{po.date}</Td>
                  <Td>{po.supplierName}</Td>
                  <Td>{product?.name}</Td>
                  <Td>{po.quantity}</Td>
                  <Td className="font-semibold text-rose-500">${po.totalCost.toLocaleString()}</Td>
                  <Td>
                    {po.fundingSource === 'Investment Pool' ? (
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-400 rounded-sm text-xs font-semibold">
                        Pool: {contributor?.name || 'Unknown'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-sm text-xs font-semibold">
                        Business Cash
                      </span>
                    )}
                  </Td>
                  <Td>
                    {po.receiptUrl ? (
                      <a href={po.receiptUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                        View Receipt
                      </a>
                    ) : (
                      <Button variant="secondary" className="px-2 py-0.5 text-[10px]" onClick={() => uploadPurchaseReceipt(po.id, 'https://example.com/demo-receipt.pdf')}>
                        Upload Receipt
                      </Button>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
