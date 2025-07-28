// stub-function.ts

import fs from "fs";
import path from "path";
import axios from "axios";
import { generatePaymentInstructionsHTML } from "./config/paymentInstructions";

// Cache for logo to avoid repeated network requests
let logoCache: string | null = null;

async function getLogoBase64FromURL(): Promise<string> {
  // Return cached logo if available
  if (logoCache !== null) {
    return logoCache;
  }
  
  // Use the logo from public directory
  const logoPath = path.join(process.cwd(), "client", "public", "4s-graphics-logo.png");
  
  if (fs.existsSync(logoPath)) {
    const buffer = fs.readFileSync(logoPath);
    logoCache = buffer.toString("base64");
    console.log("✓ Using 4S Graphics logo from public directory");
    return logoCache;
  }
  
  console.error("❌ 4S Graphics logo not found in public directory");
  logoCache = "";
  return logoCache;
}

export function generateQuoteNumber(): string {
  return `Q${Date.now()}`;
}

export function generateUniqueQuoteNumber(): string {
  // Generate 7-digit alphanumeric quote number
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(
    { length: 7 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function validateQuoteNumber(quoteNumber: string): boolean {
  return typeof quoteNumber === 'string' && quoteNumber.length > 0;
}

export async function generateQuoteHTMLForDownload(data: any): Promise<string> {
  const { customerName, quoteNumber, quoteItems, totalAmount, title = "QUICK QUOTE" } = data;
  const logo = await getLogoBase64FromURL();

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Group items by product type
  const itemsByType: { [key: string]: any[] } = {};
  quoteItems.forEach((item: any) => {
    if (!itemsByType[item.productType]) {
      itemsByType[item.productType] = [];
    }
    itemsByType[item.productType].push(item);
  });

  // Get category display name function
  function getCategoryDisplayName(productType: string): string {
    const categoryMappings: { [key: string]: string } = {
      // CLiQ products
      'CliQ Cold Press Paper 300gsm': 'CLiQ Aqueous Media',
      'Cold Press Paper 300gsm': 'CLiQ Aqueous Media',
      'CliQ Hot Press Paper 270gsm': 'CLiQ Aqueous Media',
      'CliQ Cotton Rag Paper 300gsm': 'CLiQ Aqueous Media',
      'CliQ Inkjet Matte Paper 230gsm': 'CLiQ Aqueous Media',
      'CliQ PETBull 7mil': 'CLiQ Aqueous Media',
      'CliQ Photo Paper 10.4mil': 'CLiQ Aqueous Media',
      'CliQ Photo Paper 11.2 mil': 'CLiQ Aqueous Media',
      'CliQ Banner Media - 15mil': 'CLiQ Aqueous Media',
      'CliQ Inkjet Matte Paper 170gsm': 'CLiQ Aqueous Media',
      'CliQ Photo Paper 8.4mil': 'CLiQ Aqueous Media',
      'CliQ Self Adhesive Vinyl - 5mil (PVC)': 'CLiQ Aqueous Media',
      'CliQ SlickStick 10.4mil': 'CLiQ Aqueous Media',
      // Graffiti products
      'Graffiti Polyester Paper': 'Graffiti Polyester Paper',
      'AuraBoard - Holographics': 'Graffiti Polyester Paper',
      'AuraBoard - Silver': 'Graffiti Polyester Paper',
      'thickness: 5mil': 'Graffiti Polyester Paper',
      'thickness: 8mil': 'Graffiti Polyester Paper',
      'thickness: 10mil': 'Graffiti Polyester Paper',
      'thickness: 11mil': 'Graffiti Polyester Paper',
      'thickness: 14mil': 'Graffiti Polyester Paper',
      // Solvit products
      'Solvit Poster Paper 175gsm': 'Solvit Sign & Display Media',
      'Solvit Backlit Film 8mil': 'Solvit Sign & Display Media',
      'Solvit Self Adhesive Vinyl - 4mil (Greyback)': 'Solvit Sign & Display Media',
      'Solvit Self Adhesive Vinyl - 6mil (white Back)': 'Solvit Sign & Display Media',
      // CoHo products
      'CoHo Films for Fabrics': 'DTF Films',
      // Rang products
      'Rang DL Polyester Canvas 280gsm': 'Rang Print Canvas',
      'Rang Duo PolyCotton Canvas 400gsm': 'Rang Print Canvas',
      'Rang Duo PolyCotton Canvas 420gsm': 'Rang Print Canvas',
      // EiE/eLe products
      'EiE Inkjet Waterproof Film': 'EiE Media',
      'eLe Frosted Laser Film': 'eLe Laser Media',
      'eLe Clear Laser Film': 'eLe Laser Media',
      'eLe Polyester Laser Plate MXP': 'MXP Media'
    };

    return categoryMappings[productType] || productType;
  }

  // Generate separate tables for each product type
  const productTables = Object.entries(itemsByType).map(([productType, items]) => {
    const categoryName = getCategoryDisplayName(productType);
    
    const productRows = items.map((item: any, index: number) => {
      // Use the updated quantity from the frontend
      const displayQty = item.quantity;
      // Use the already calculated total from the frontend (includes retail rounding)
      const itemTotal = item.total;
      // Determine unit based on minimum order quantity
      const unitLabel = (item.minOrderQty === 1) ? 'roll' : 'sheet';
      
      return `
        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
          <td style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:center;">${item.itemCode || '-'}</td>
          <td style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;">${item.size}</td>
          <td style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:center;">${displayQty}</td>
          <td style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:center;">${item.minOrderQty || 0}</td>
          <td style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:right;">$${item.pricePerSheet.toFixed(2)}/${unitLabel}</td>
          <td style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:right;font-weight:500;">$${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="margin-bottom: 25px;">
        <div style="margin-bottom: 10px;">
          <div style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; color: #1f2937;">${productType}</div>
        </div>
        <table width="100%" style="border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr style="background:#bfdbfe;color:#000000;">
              <th style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:center;font-weight:700;">Item Code</th>
              <th style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:left;font-weight:700;">Size</th>
              <th style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:center;font-weight:700;">Quantity</th>
              <th style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:center;font-weight:700;">Min Order Qty</th>
              <th style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:right;font-weight:700;">Price/Unit</th>
              <th style="font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding:8px;text-align:right;font-weight:700;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${title} - ${quoteNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
        body {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          font-weight: 400;
          padding: 24px;
          color: #333;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
          background-color: white;
          border: 1px solid #e5e7eb;
          padding: 20px;
          border-radius: 8px;
        }
        .header img {
          height: 45px;
          display: block;
          margin: 0 auto 15px auto;
        }
        .company-name {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 22px;
          font-weight: 700;
          margin-top: 10px;
        }
        .company-details {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 13px;
          font-weight: 300;
          margin-top: 4px;
          color: #374151;
        }
        .document-title {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 18px;
          font-weight: 700;
          margin: 15px 0;
          text-transform: uppercase;
          color: #1f2937;
          text-align: center;
        }
        .quote-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 6px;
        }
        .quote-info div {
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
        }
        th {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #f0f4f8;
          text-align: left;
          font-weight: 700;
        }
        .total {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          text-align: right;
          font-size: 16px;
          font-weight: 700;
          margin-top: 24px;
        }
        .footer {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 11px;
          font-weight: 300;
          margin-top: 40px;
          line-height: 1.5;
          color: #555;
        }
        .footer p {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          margin: 5px 0;
        }
        .footer strong {
          font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logo ? `<img src="data:image/png;base64,${logo}" alt="4S Graphics Logo" style="height: 45px; display: block; margin: 0 auto 15px auto;" />` : ''}
        <div class="company-name">4S Graphics, Inc.</div>
        <div class="company-details">
          764 NW 57th Court, Fort Lauderdale, FL 33309<br>
          Phone: (954) 493.6484 | Website: https://4sgraphics.com/
        </div>
      </div>

      <div class="document-title">${title}</div>

      <div><strong>Quote #:</strong> ${quoteNumber} <span style="float:right;"><strong>Date:</strong> ${currentDate}</span></div>
      <p><strong>Prepared for:</strong> ${customerName}</p>

      <div class="items-section">
        ${productTables}
      </div>

      <div class="total">Total Amount: $${totalAmount.toFixed(2)}</div>

      <div class="footer">
        <p><strong>Payment Instructions</strong></p>
        <p>All payments should be made to 4S GRAPHICS, INC. only.</p>
        <p>ACH Payments: Account# 0126734133 | Routing# 063104668 | SWIFT: UPNBUS44 / ABA: 062005690</p>
        <p>Credit Cards: Visa, MasterCard, and AmEx (4.5% processing fee applies)</p>
        <p>Zelle: 260-580-0526</p>
        <p>PayPal: info@4sgraphics.com (4.5% fee applies)</p>
        <p>Shipping Costs: At Actuals — Discuss with Sales Rep</p>
      </div>
    </body>
    </html>
  `;
}

// Category mapping function to get proper category display names
function getCategoryDisplayName(productName: string, productType: string): string {
  
  // Category mappings based on product types - comprehensive mapping for all products
  const categoryMappings: { [key: string]: string } = {
    // Graffiti Polyester Paper products
    'Graffiti Polyester Paper': 'Graffiti Polyester Paper',
    'AuraBoard - Holographics': 'Graffiti Polyester Paper',
    
    // Graffiti Blended Poly products
    'Graffiti Blended Poly': 'Graffiti Blended Poly',
    
    // Graffiti SOFT Poly products  
    'Graffiti SOFT Poly': 'Graffiti SOFT Poly',
    
    // Graffiti STICK products
    'Graffiti STICK': 'Graffiti STICK',
    
    // Solvit products
    'Solvit Poster Paper 175gsm': 'Solvit Sign & Display Media',
    'Solvit Backlit Film 8mil': 'Solvit Sign & Display Media',
    'Solvit Self Adhesive Vinyl - 4mil (Greyback)': 'Solvit Sign & Display Media',
    'Solvit Self Adhesive Vinyl - 6mil (white Back)': 'Solvit Sign & Display Media',
    'Solvit PolySign 11mil': 'Solvit Sign & Display Media',
    'Solvit PolySign 17mil': 'Solvit Sign & Display Media',
    'Solvit SlickStick 5mil Polyester': 'Solvit Sign & Display Media',
    
    // CLiQ products
    'CliQ Cold Press Paper 300gsm': 'CLiQ Aqueous Media',
    'Cold Press Paper 300gsm': 'CLiQ Aqueous Media',
    'CliQ Hot Press Paper 270gsm': 'CLiQ Aqueous Media',
    'CliQ Cotton Rag Paper 300gsm': 'CLiQ Aqueous Media',
    'CliQ Inkjet Matte Paper 230gsm': 'CLiQ Aqueous Media',
    'CliQ PETBull 7mil': 'CLiQ Aqueous Media',
    'CliQ Photo Paper 10.4mil': 'CLiQ Aqueous Media',
    'CliQ Photo Paper 11.2 mil': 'CLiQ Aqueous Media',
    'CliQ Banner Media - 15mil': 'CLiQ Aqueous Media',
    'CliQ Inkjet Matte Paper 170gsm': 'CLiQ Aqueous Media',
    'CliQ Photo Paper 8.4mil': 'CLiQ Aqueous Media',
    'CliQ Self Adhesive Vinyl - 5mil (PVC)': 'CLiQ Aqueous Media',
    'CliQ SlickStick 10.4mil': 'CLiQ Aqueous Media',
    
    // Rang products
    'Rang DL Polyester Canvas 280gsm': 'Rang Print Canvas',
    'Rang Duo PolyCotton Canvas 400gsm': 'Rang Print Canvas',
    'Rang Duo PolyCotton Canvas 420gsm': 'Rang Print Canvas',
    'Rang Lux PolyCotton Canvas 345gsm': 'Rang Print Canvas',
    'Rang Lux PolyCotton Canvas 380gsm': 'Rang Print Canvas',
    'Rang Lux PolyCotton Canvas 390gsm': 'Rang Print Canvas',
    
    // EiE/eLe products
    'EiE Inkjet Waterproof Film': 'EiE Media',
    'eLe Frosted Laser Film': 'eLe Laser Media',
    'eLe Clear Laser Film': 'eLe Laser Media',
    'eLe Polyester Laser Plate MXP': 'MXP Media',
    
    // CoHo products
    'CoHo DTF Films for Fabrics': 'DTF Films',
    'CoHo Films for Fabrics': 'DTF Films',
    
    // Screen Printing products
    'Screen Printing': 'Screen Printing Media',
    
    // Offset Plates products
    'Offset Plates': 'Offset Plates Media'
  };

  // Normalize input for fuzzy matching
  const normalized = productType.trim().toLowerCase();
  
  // Check for direct mapping first
  if (categoryMappings[productType]) {
    return categoryMappings[productType];
  }
  
  // Check for fuzzy matching (normalized)
  const normalizedKey = Object.keys(categoryMappings).find(key => key.toLowerCase() === normalized);
  if (normalizedKey) {
    return categoryMappings[normalizedKey];
  }
  
  // Pattern matching for common prefixes (normalized)
  if (normalized.startsWith('graffiti')) {
    if (normalized.includes('polyester paper')) return 'Graffiti Polyester Paper';
    if (normalized.includes('blended poly')) return 'Graffiti Blended Poly';
    if (normalized.includes('soft poly')) return 'Graffiti SOFT Poly';
    if (normalized.includes('stick')) return 'Graffiti STICK';
    return 'Graffiti Media';
  }
  
  if (normalized.startsWith('solvit')) {
    return 'Solvit Sign & Display Media';
  }
  
  if (normalized.startsWith('cliq') || normalized.startsWith('cold press')) {
    return 'CLiQ Aqueous Media';
  }
  
  if (normalized.startsWith('rang')) {
    return 'Rang Print Canvas';
  }
  
  if (normalized.startsWith('eie')) {
    return 'EiE Media';
  }
  
  if (normalized.startsWith('ele')) {
    return 'eLe Laser Media';
  }
  
  if (normalized.startsWith('coho')) {
    return 'DTF Films';
  }

  // Fall back to product name (category name) or original productType for display
  return productName || productType || 'Product Media';
}

export async function generatePriceListHTML(data: any): Promise<string> {
  const { categoryName, tierName, items, customerName, title = "PRICE LIST", quoteNumber } = data;
  const logo = await getLogoBase64FromURL();

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate quote number if not provided
  const listNumber = quoteNumber || `PL-${Date.now().toString().slice(-6)}`;

  const grouped = items.reduce((acc: any, item: any) => {
    if (!acc[item.productType]) acc[item.productType] = [];
    acc[item.productType].push(item);
    return acc;
  }, {});

  // Sort by the first item's sortOrder to preserve CSV file order
  const sortedProductTypes = Object.keys(grouped).sort((a, b) => {
    const aFirstItem = grouped[a][0];
    const bFirstItem = grouped[b][0];
    const aSortOrder = aFirstItem?.sortOrder || 999999;
    const bSortOrder = bFirstItem?.sortOrder || 999999;
    return aSortOrder - bSortOrder;
  });

  const sections = sortedProductTypes.map((type) => {
    const rows = grouped[type];
    const rowHtml = (rows as any[]).map((row: any, index: number) => {
      // Debug logging for each row - check all possible min qty field names
      console.log('Processing PDF row:', {
        size: row.size,
        itemCode: row.itemCode,
        minQty: row.minQty,
        minOrderQty: row.minOrderQty,
        minQuantity: row.minQuantity,
        min_quantity: row.min_quantity,
        pricePerSheet: row.pricePerSheet,
        pricePerPack: row.pricePerPack,
        total: row.total
      });
      
      // Try multiple field names for minimum quantity - minOrderQty is the correct field from frontend
      const minQtyValue = row.minOrderQty || row.minQty || row.minQuantity || row.min_quantity || 1;
      
      // Determine unit based on minimum order quantity: 1 = roll, >1 = sheet
      const unitLabel = minQtyValue === 1 ? 'roll' : 'sheet';
      
      return `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
        <td style="font-family: 'Roboto', Arial, sans-serif; padding: 4px 6px; border: 1px solid #ccc; font-size: 10px;">${row.size || 'N/A'}</td>
        <td style="font-family: 'Roboto', monospace; padding: 4px 6px; border: 1px solid #ccc; text-align: center; font-size: 10px;">${row.itemCode || '-'}</td>
        <td style="font-family: 'Roboto', Arial, sans-serif; padding: 4px 6px; border: 1px solid #ccc; text-align: center; font-size: 10px;">${minQtyValue}</td>
        <td style="font-family: 'Roboto', Arial, sans-serif; padding: 4px 6px; border: 1px solid #ccc; text-align: right; font-size: 10px;">$${(row.pricePerSheet || 0).toFixed(2)}/${unitLabel}</td>
        <td style="font-family: 'Roboto', Arial, sans-serif; padding: 4px 6px; border: 1px solid #ccc; text-align: right; font-size: 10px; font-weight: 500;">$${(row.total || row.pricePerPack || 0).toFixed(2)}</td>
      </tr>
      `;
    }).join('');

    // Extract category from the first row to display category + product type
    const firstRow = (rows as any[])[0];
    const productCategory = getCategoryDisplayName(
      firstRow?.productCategory || firstRow?.productName || categoryName,
      type
    );
    
    return `
      <div style="page-break-inside: avoid; margin-bottom: 12px;">
        <div style="margin: 8px 0 6px 0; border-bottom: 1px solid #3b82f6; padding-bottom: 4px;">
          <div style="font-family: 'Roboto', Arial, sans-serif; font-size: 12px; font-weight: 500; color: #3b82f6; margin-bottom: 1px;">${productCategory}</div>
          <div style="font-family: 'Roboto', Arial, sans-serif; font-size: 13px; font-weight: 700; color: #1f2937;">${type}</div>
        </div>
        <table width="100%" style="border-collapse:collapse;table-layout:fixed;">
          <thead>
            <tr style="background: #3b82f6;">
              <th style="font-family: 'Roboto', Arial, sans-serif; padding: 6px 8px; border: 1px solid #ccc; color: white; font-weight: 700; text-align: left; font-size: 11px;">Size</th>
              <th style="font-family: 'Roboto', Arial, sans-serif; padding: 6px 8px; border: 1px solid #ccc; color: white; font-weight: 700; text-align: center; font-size: 11px;">Item Code</th>
              <th style="font-family: 'Roboto', Arial, sans-serif; padding: 6px 8px; border: 1px solid #ccc; color: white; font-weight: 700; text-align: center; font-size: 11px;">Min Qty</th>
              <th style="font-family: 'Roboto', Arial, sans-serif; padding: 6px 8px; border: 1px solid #ccc; color: white; font-weight: 700; text-align: right; font-size: 11px;">Price/Unit</th>
              <th style="font-family: 'Roboto', Arial, sans-serif; padding: 6px 8px; border: 1px solid #ccc; color: white; font-weight: 700; text-align: right; font-size: 11px;">Price/Pack</th>
            </tr>
          </thead>
          <tbody>
            ${rowHtml}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>${title} - ${categoryName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Roboto', Arial, sans-serif;
          margin: 0;
          padding: 15px;
          font-size: 10px;
          font-weight: 400;
          color: #1f2937;
          background: #ffffff;
          max-width: 8.5in;
          line-height: 1.2;
        }
        
        .header {
          text-align: center;
          margin-bottom: 15px;
          padding: 12px;
          background: white;
          border: 1px solid #ccc;
          color: #1f2937;
        }
        
        .header img {
          height: 45px;
          margin-bottom: 8px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        
        .company-name {
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 22px;
          font-weight: 700;
          margin: 8px 0 4px;
        }
        
        .company-details {
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 12px;
          font-weight: 300;
          opacity: 0.95;
          line-height: 1.5;
        }
        
        .document-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin: 10px 0;
          padding: 8px;
          background: #f5f5f5;
          border-left: 3px solid #3b82f6;
        }
        
        .document-title {
          font-family: 'Roboto', Arial, sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .document-meta {
          text-align: right;
          font-size: 11px;
          color: #6b7280;
        }
        
        .customer-info {
          margin: 8px 0;
          padding: 6px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          font-size: 9px;
        }
        
        .customer-info strong {
          color: #374151;
          font-weight: 600;
        }
        
        .footer {
          margin-top: 15px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 8px;
          color: #6b7280;
          font-style: italic;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 20px;
            max-width: none;
          }
          .header { 
            break-inside: avoid; 
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logo ? `<img src="data:image/png;base64,${logo}" alt="4S Graphics Logo" style="display: block; margin: 0 auto 15px auto; height: 60px;" />` : ""}
        <div class="company-name">4S Graphics, Inc.</div>
        <div class="company-details">
          764 NW 57th Court, Fort Lauderdale, FL 33309<br>
          Phone: (954) 493-6484 | Website: www.4sgraphics.com
        </div>
      </div>

      <div class="document-info">
        <div>
          <div class="document-title">${title}</div>
          <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
            Category: <strong>${categoryName}</strong>
          </div>
        </div>
        <div class="document-meta">
          <div><strong>List #:</strong> ${listNumber}</div>
          <div><strong>Date:</strong> ${currentDate}</div>
        </div>
      </div>

      ${customerName && customerName !== "N/A" ? `
      <div class="customer-info">
        <strong>Prepared for:</strong> ${customerName}
      </div>
      ` : ''}

      ${sections}

      <div class="footer">
        This price list was generated on ${currentDate} by 4S Graphics, Inc.<br>
        For questions or to place an order, contact us at (954) 493-6484 or visit www.4sgraphics.com
      </div>
    </body>
    </html>
  `;
}