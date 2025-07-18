import fs from 'fs';
import path from 'path';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  acceptsEmailMarketing: boolean;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  totalSpent: number;
  totalOrders: number;
  note: string;
  tags: string;
}

function parseCSV(csvContent: string): string[][] {
  const result: string[][] = [];
  const lines = csvContent.split('\n');
  let currentRow: string[] = [];
  let inQuotes = false;
  let currentCell = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        // Check if this is an escaped quote
        if (j + 1 < line.length && line[j + 1] === '"') {
          currentCell += '"';
          j++; // Skip the next quote
        } else {
          inQuotes = false;
        }
      } else if (char === ',' && !inQuotes) {
        // End of cell
        currentRow.push(currentCell.replace(/^'|'$/g, '').trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    
    // If we're not in quotes, this line is complete
    if (!inQuotes) {
      if (currentCell.trim() || currentRow.length > 0) {
        currentRow.push(currentCell.replace(/^'|'$/g, '').trim());
        if (currentRow.some(cell => cell.trim())) {
          result.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      }
    } else {
      // We're in quotes, so this line continues on the next line
      currentCell += '\n';
    }
  }
  
  // Handle any remaining content
  if (currentRow.length > 0 || currentCell.trim()) {
    currentRow.push(currentCell.replace(/^'|'$/g, '').trim());
    if (currentRow.some(cell => cell.trim())) {
      result.push(currentRow);
    }
  }
  
  return result;
}

export function parseCustomerData(): Customer[] {
  try {
    const csvPath = path.join(process.cwd(), 'attached_assets', 'customers_export.csv');
    console.log('Reading customer CSV from:', csvPath);
    
    if (!fs.existsSync(csvPath)) {
      console.log('Customer CSV file does not exist');
      return [];
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    console.log('CSV content length:', csvContent.length);
    console.log('First 200 chars:', csvContent.substring(0, 200));
    
    const rows = parseCSV(csvContent);
    console.log('Parsed rows count:', rows.length);
    
    if (rows.length === 0) {
      console.log('No rows parsed from CSV');
      return [];
    }
    
    console.log('Header row:', rows[0]);
    console.log('First data row length:', rows[1]?.length);
    console.log('First data row:', rows[1]);
    
    // Skip header row
    const dataRows = rows.slice(1);
    const customers: Customer[] = [];
    
    for (const row of dataRows) {
      if (row.length >= 20) {
        const customer: Customer = {
          id: row[0] || '',
          firstName: row[1] || '',
          lastName: row[2] || '',
          email: row[3] || '',
          acceptsEmailMarketing: row[4] === 'yes',
          company: row[5] || '',
          address1: row[6] || '',
          address2: row[7] || '',
          city: row[8] || '',
          province: row[9] || '',
          country: row[10] || '',
          zip: row[11] || '',
          phone: row[13] || '',
          totalSpent: parseFloat(row[15]) || 0,
          totalOrders: parseInt(row[16]) || 0,
          note: row[17] || '',
          tags: row[19] || ''
        };
        
        customers.push(customer);
      } else {
        console.log('Skipping row with insufficient columns:', row.length, row);
      }
    }
    
    console.log('Total customers parsed:', customers.length);
    return customers;
  } catch (error) {
    console.error('Error parsing customer data:', error);
    return [];
  }
}