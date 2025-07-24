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
  const { categoryName, tierName, items, customerName } = data;
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });

  // Group items by ProductType
  const groupedItems = items.reduce((groups: any, item: any) => {
    const type = item.productType || 'Unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {});

  const productSections = Object.entries(groupedItems).map(([productType, typeItems]: [string, any]) => {
    const itemRows = (typeItems as any[]).map(item => `
      <tr>
        <td style="padding: 8px; border-right: 1px solid #ddd;">${item.size || 'N/A'}</td>
        <td style="padding: 8px; border-right: 1px solid #ddd;">${item.itemCode || 'N/A'}</td>
        <td style="padding: 8px; border-right: 1px solid #ddd; text-align: center;">${item.minQty || 0} Sheets</td>
        <td style="padding: 8px; border-right: 1px solid #ddd; text-align: right;">$${(item.pricePerSheet || 0).toFixed(2)}</td>
        <td style="padding: 8px; text-align: right;">$${(item.pricePerPack || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="margin-bottom: 30px;">
        <h3 style="margin: 20px 0 10px 0; font-size: 14px; font-weight: bold;">${productType}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #000;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; border: 1px solid #000; text-align: left; font-size: 12px;">Size</th>
              <th style="padding: 8px; border: 1px solid #000; text-align: left; font-size: 12px;">Item Code</th>
              <th style="padding: 8px; border: 1px solid #000; text-align: center; font-size: 12px;">Min Qty</th>
              <th style="padding: 8px; border: 1px solid #000; text-align: right; font-size: 12px;">Price per Sheet</th>
              <th style="padding: 8px; border: 1px solid #000; text-align: right; font-size: 12px;">Price Per Pack</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  const totalPages = Math.ceil(Object.keys(groupedItems).length / 3) || 1;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Price List - ${categoryName}</title>
      <style>
        @media print {
          body { margin: 0; }
          .page-break { page-break-before: always; }
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #000;
          line-height: 1.3;
          font-size: 12px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .company-info {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .price-list-info {
          margin-bottom: 30px;
          text-align: left;
        }
        .main-title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin: 30px 0;
          text-transform: uppercase;
        }
        .footer {
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        .page-number {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          4S Graphics, Inc.<br>
          764 NW 57th Court<br>
          Fort Lauderdale, FL 33309<br>
          Phone: (954) 493.6484 | Website: https://www.4sgraphics.com/
        </div>
      </div>

      <div class="price-list-info">
        ${customerName ? `Price List for: ${customerName}<br>` : ''}
        Product Category: ${categoryName}<br>
        Date: ${currentDate}
      </div>

      <div class="main-title">PRICE LIST - ${categoryName.toUpperCase()}</div>

      ${productSections}

      <div class="page-number">
        Page 1 of ${totalPages}
      </div>

      <div class="footer">
        <p>This price list was generated on ${currentDate}${customerName ? ` for ${customerName}` : ''}</p>
        <p>Contact us at (954) 493.6484 or visit https://www.4sgraphics.com/ for more information</p>
      </div>
    </body>
    </html>
  `;
}

export function generatePriceListCSV(data: any): string {
  return 'Product,Price\nSample Product,$10.00';
}