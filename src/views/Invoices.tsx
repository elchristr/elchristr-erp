import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Table, Th, Td, Button } from '../components';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

export function InvoicesView() {
  const { invoices, sales, products } = useStore();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);
  const relatedSale = selectedInvoice ? sales.find(s => s.id === selectedInvoice.saleId) : null;
  const relatedProduct = relatedSale ? products.find(p => p.id === relatedSale.productId) : null;

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadPdf = async () => {
    if (!selectedInvoice) return;
    const element = document.getElementById('invoice-document');
    if (!element) return;
    
    try {
      setIsGeneratingPdf(true);
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
      pdf.save(`${selectedInvoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold text-zinc-100">Invoices</h1>
        {!selectedInvoiceId && (
          <input
            type="text"
            placeholder="Search by Invoice #..."
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-sm p-2 text-sm w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </div>
      
      {!selectedInvoiceId ? (
        <Card className="print:hidden">
          <Table>
            <thead>
              <tr>
                <Th>Invoice #</Th>
                <Th>Date</Th>
                <Th>Customer</Th>
                <Th>Total</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="group">
                  <Td className="font-mono text-sm font-semibold">{inv.invoiceNumber}</Td>
                  <Td>{inv.date}</Td>
                  <Td>{inv.customerName}</Td>
                  <Td className="font-semibold">${inv.total.toFixed(2)}</Td>
                  <Td>
                    <Button variant="secondary" className="text-xs py-1" onClick={() => setSelectedInvoiceId(inv.id)}>
                      View Invoice
                    </Button>
                  </Td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <Td colSpan={5} className="text-center py-4 text-zinc-500">
                    {invoices.length === 0 ? "No invoices generated yet. Create a sale first." : "No invoices found matching your search."}
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      ) : (
        <div>
          <div className="flex gap-2 mb-4 print:hidden">
            <Button variant="secondary" onClick={() => setSelectedInvoiceId(null)}>
              &larr; Back to List
            </Button>
            <Button onClick={() => window.print()} className="ml-auto">
              Print
            </Button>
            <Button variant="secondary" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
          
          {/* Invoice Document Layout */}
          <div className="bg-white p-8 max-w-[400px] mx-auto font-sans text-[#111827] print:max-w-full print:w-full print:p-0" id="invoice-document">
            <div className="flex flex-col items-center mb-8">
              <img src="https://i.postimg.cc/zXpg7rTL/Polyligne-F.png" alt="Elie Group Logo" className="h-12 object-contain mb-3" crossOrigin="anonymous" />
              <h2 className="text-lg font-bold tracking-tight text-center uppercase">Elie Group S.A</h2>
              <p className="text-xs text-gray-500 text-center mt-1 leading-relaxed">
                123 Business Road<br />
                Commerce City, CC 12345<br />
                contact@elieerp.demo
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-semibold">Receipt</p>
                <p className="font-mono text-sm font-medium">{selectedInvoice?.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-gray-500">{selectedInvoice?.date}</p>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4 mb-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-semibold">Customer</p>
              <p className="font-medium text-sm">{selectedInvoice?.customerName || 'Walk-in'}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-semibold">
                <span>Item</span>
                <span>Amount</span>
              </div>
              {relatedSale && relatedProduct && (
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{relatedProduct.name}</p>
                    <p className="font-mono text-xs text-gray-500 mt-0.5">{relatedSale.quantity} × ${relatedSale.sellingPrice.toFixed(2)}</p>
                  </div>
                  <p className="font-mono text-sm font-medium">${(relatedSale.quantity * relatedSale.sellingPrice).toFixed(2)}</p>
                </div>
              )}
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono">${selectedInvoice?.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Discount</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 text-base font-bold">
                <span>Total</span>
                <span className="font-mono">${selectedInvoice?.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-medium">Cash / Card</span>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
