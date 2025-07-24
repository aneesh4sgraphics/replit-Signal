// Stub functions for removed PDF generation functionality

export function generateQuoteNumber(): string {
  return `Q${Date.now()}`;
}

export function generateUniqueQuoteNumber(): string {
  return `Q${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateQuoteNumber(quoteNumber: string): boolean {
  return typeof quoteNumber === 'string' && quoteNumber.length > 0;
}

export function generateQuoteHTMLForDownload(data: any): string {
  const { customerName, quoteNumber, quoteItems, totalAmount } = data;
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const itemsHTML = quoteItems.map((item: any, index: number) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px; border-right: 1px solid #ddd;">${index + 1}</td>
      <td style="padding: 12px; border-right: 1px solid #ddd; font-weight: 500;">${item.productType}</td>
      <td style="padding: 12px; border-right: 1px solid #ddd;">${item.size}</td>
      <td style="padding: 12px; border-right: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-right: 1px solid #ddd; text-align: right;">$${item.pricePerSheet.toFixed(2)}</td>
      <td style="padding: 12px; text-align: right; font-weight: 500;">$${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quote ${quoteNumber}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: 'Roboto', Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #333;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .quote-title {
          font-size: 24px;
          font-weight: 600;
          margin: 20px 0 10px 0;
          color: #1f2937;
        }
        .quote-info {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 8px;
        }
        .quote-info div {
          text-align: left;
        }
        .quote-info strong {
          color: #374151;
          display: block;
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }
        th:last-child, td:last-child {
          text-align: right;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:hover {
          background-color: #f9fafb;
        }
        .total-row {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        .total-row td {
          padding: 20px 12px;
          border: none;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">4S Graphics</div>
        <div class="quote-title">QUOTATION</div>
      </div>

      <div class="quote-info">
        <div>
          <strong>Quote Number:</strong>
          ${quoteNumber}
        </div>
        <div>
          <strong>Date:</strong>
          ${currentDate}
        </div>
        <div>
          <strong>Prepared For:</strong>
          ${customerName}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 8%">#</th>
            <th style="width: 35%">Product</th>
            <th style="width: 20%">Size</th>
            <th style="width: 12%">Qty</th>
            <th style="width: 15%">Unit Price</th>
            <th style="width: 15%">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr class="total-row">
            <td colspan="5" style="text-align: right; padding-right: 20px;">TOTAL AMOUNT:</td>
            <td style="font-size: 20px;">$${totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p><strong>4S Graphics</strong> | Professional Printing Solutions</p>
        <p>Thank you for choosing 4S Graphics. Please contact us if you have any questions about this quote.</p>
      </div>
    </body>
    </html>
  `;
}

export function generatePriceListHTML(data: any): string {
  const { categoryName, tierName, items } = data;
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const itemsHTML = items.map((item: any, index: number) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px; border-right: 1px solid #ddd;">${item.size || 'N/A'}</td>
      <td style="padding: 12px; border-right: 1px solid #ddd;">${item.itemCode || 'N/A'}</td>
      <td style="padding: 12px; border-right: 1px solid #ddd; text-align: center;">${item.minQty || 0}</td>
      <td style="padding: 12px; border-right: 1px solid #ddd; text-align: right;">$${(item.pricePerSqM || 0).toFixed(2)}</td>
      <td style="padding: 12px; border-right: 1px solid #ddd; text-align: right;">$${(item.pricePerSheet || 0).toFixed(2)}</td>
      <td style="padding: 12px; text-align: right; font-weight: 500; color: #059669;">$${(item.pricePerPack || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Price List - ${categoryName}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: 'Roboto', Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #333;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #059669;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 32px;
          font-weight: bold;
          color: #059669;
          margin-bottom: 5px;
        }
        .price-list-title {
          font-size: 24px;
          font-weight: 600;
          margin: 20px 0 10px 0;
          color: #1f2937;
        }
        .price-list-info {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
          padding: 20px;
          background-color: #f0fdf4;
          border-radius: 8px;
        }
        .price-list-info div {
          text-align: left;
        }
        .price-list-info strong {
          color: #374151;
          display: block;
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
        }
        th:nth-child(3), th:nth-child(4), th:nth-child(5), th:nth-child(6) {
          text-align: right;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:hover {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        .tier-badge {
          display: inline-block;
          background: #059669;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">4S Graphics</div>
        <div class="price-list-title">PRICE LIST</div>
        <div class="tier-badge">${tierName} Pricing</div>
      </div>

      <div class="price-list-info">
        <div>
          <strong>Product Category:</strong>
          ${categoryName}
        </div>
        <div>
          <strong>Date:</strong>
          ${currentDate}
        </div>
        <div>
          <strong>Pricing Tier:</strong>
          ${tierName}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 25%">Size</th>
            <th style="width: 20%">Item Code</th>
            <th style="width: 12%">Min Qty</th>
            <th style="width: 15%">Price/Sq.M</th>
            <th style="width: 15%">Price/Sheet</th>
            <th style="width: 15%">Price Per Pack</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="footer">
        <p><strong>4S Graphics</strong> | Professional Printing Solutions</p>
        <p>All prices are in USD. Contact us for volume discounts and custom requirements.</p>
      </div>
    </body>
    </html>
  `;
}

export function generatePriceListCSV(data: any): string {
  return 'Product,Price\nSample Product,$10.00';
}