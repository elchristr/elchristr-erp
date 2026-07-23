import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Table, Th, Td, Button } from '../components';
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

  const handleDownloadPdf = () => {
    if (!selectedInvoice || !relatedSale || !relatedProduct) return;
    setIsGeneratingPdf(true);

    try {
      const pageWidth = 280;
      const margin = 24;
      const pdf = new jsPDF({ unit: 'pt', format: [pageWidth, 500] });
      let y = 46;

      const center = (text: string, size: number, style: 'normal' | 'bold' | 'italic' = 'normal', font = 'courier') => {
        pdf.setFont(font, style);
        pdf.setFontSize(size);
        const w = pdf.getTextWidth(text);
        pdf.text(text, (pageWidth - w) / 2, y);
      };

      const dashedLine = () => {
        pdf.setLineDashPattern([2, 2], 0);
        pdf.setDrawColor(180);
        pdf.line(margin, y, pageWidth - margin, y);
        pdf.setLineDashPattern([], 0);
      };

      const row = (left: string, right: string, size = 9, boldRight = false) => {
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(size);
        pdf.setTextColor(40);
        pdf.text(left, margin, y);
        pdf.setFont('courier', boldRight ? 'bold' : 'normal');
        const w = pdf.getTextWidth(right);
        pdf.text(right, pageWidth - margin - w, y);
      };

      center('Elie', 28, 'italic', 'times');
      y += 30;

      center('Elie Group S.A', 12, 'bold');
      y += 15;
      pdf.setTextColor(120);
      center('Pétion-Ville, Haïti', 8);
      y += 11;
      center('contact@eliegroup.com', 8);
      y += 16;

      dashedLine();
      y += 18;

      pdf.setTextColor(20);
      row('Invoice:', selectedInvoice.invoiceNumber);
      y += 15;
      row('Date:', selectedInvoice.date);
      y += 15;
      row('Customer:', selectedInvoice.customerName || 'Walk-in');
      y += 16;

      dashedLine();
      y += 18;

      pdf.setFont('courier', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text('Item', margin, y);
      pdf.text('Qty', margin + 90, y);
      pdf.text('Price', margin + 130, y);
      const totalHeadW = pdf.getTextWidth('Total');
      pdf.text('Total', pageWidth - margin - totalHeadW, y);
      y += 16;

      const lineTotal = relatedSale.quantity * relatedSale.sellingPrice;
      pdf.setFont('courier', 'normal');
      pdf.setTextColor(20);
      pdf.text(relatedProduct.name.toUpperCase(), margin, y);
      pdf.text(String(relatedSale.quantity), margin + 90, y);
      pdf.text(`$${relatedSale.sellingPrice.toFixed(2)}`, margin + 130, y);
      const totalStr = `$${lineTotal.toFixed(2)}`;
      const totalW = pdf.getTextWidth(totalStr);
      pdf.text(totalStr, pageWidth - margin - totalW, y);
      y += 20;

      dashedLine();
      y += 18;

      row('Subtotal:', `$${lineTotal.toFixed(2)}`);
      y += 15;
      const discount = Math.max(0, lineTotal - selectedInvoice.total);
      if (discount > 0) {
        row('Discount:', `-$${discount.toFixed(2)}`);
        y += 15;
      }
      y += 3;
      dashedLine();
      y += 20;

      row('Total:', `$${selectedInvoice.total.toFixed(2)}`, 13, true);
      y += 30;

      pdf.setTextColor(120);
      center('Payment Method: CASH', 9);
      y += 26;

      pdf.setTextColor(20);
      center('Thank you for your business!', 10, 'bold');
      y += 13;
      pdf.setTextColor(120);
      center('Please keep this receipt for your records.', 8);

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

          <div className="bg-white p-8 max-w-[380px] mx-auto font-mono text-[#111827] print:max-w-full print:w-full print:p-0" id="invoice-document">
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-3xl italic font-serif text-gray-700 mb-1">Elie</h2>
              <h3 className="text-sm font-bold tracking-tight text-center">Elie Group S.A</h3>
              <p className="text-[11px] text-gray-500 text-center mt-1 leading-relaxed">
                Pétion-Ville, Haïti<br />
                contact@eliegroup.com
              </p>
            </div>

            <div className="border-b border-dashed border-gray-300 pb-3 mb-3" />

            <div className="mb-3 space-y-1 text-xs">
              <div className="flex justify-between"><span>Invoice:</span><span>{selectedInvoice?.invoiceNumber}</span></div>
              <div className="flex justify-between"><span>Date:</span><span>{selectedInvoice?.date}</span></div>
              <div className="flex justify-between"><span>Customer:</span><span>{selectedInvoice?.customerName || 'Walk-in'}</span></div>
            </div>

            <div className="border-b border-dashed border-gray-300 pb-3 mb-3" />

            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-gray-500 mb-2">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              {relatedSale && relatedProduct && (
                <div className="flex justify-between text-xs">
                  <span>{relatedProduct.name.toUpperCase()}</span>
                  <span>{relatedSale.quantity}</span>
                  <span>${relatedSale.sellingPrice.toFixed(2)}</span>
                  <span>${(relatedSale.quantity * relatedSale.sellingPrice).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-b border-dashed border-gray-300 pb-3 mb-3" />

            <div className="mb-3 space-y-1 text-xs">
              <div className="flex justify-between"><span>Subtotal:</span><span>${((relatedSale?.quantity || 0) * (relatedSale?.sellingPrice || 0)).toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-sm pt-1"><span>Total:</span><span>${selectedInvoice?.total.toFixed(2)}</span></div>
            </div>

            <p className="text-center text-xs text-gray-500 mb-4">Payment Method: CASH</p>

            <div className="text-center text-xs text-gray-600">
              <p className="font-bold">Thank you for your business!</p>
              <p className="text-gray-400 mt-1">Please keep this receipt for your records.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
