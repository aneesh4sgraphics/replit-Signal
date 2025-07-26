import { storage } from "./storage";
import { Customer, InsertCustomer } from "../shared/schema";

interface ParsedCustomerRow {
  customerId: string;
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
  defaultAddressPhone: string;
  phone: string;
  acceptsSmsMarketing: boolean;
  totalSpent: number;
  totalOrders: number;
  note: string;
  taxExempt: boolean;
  tags: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      // Check for escaped quotes
      if (i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

function parseCustomerRow(row: string[]): ParsedCustomerRow | null {
  if (row.length < 20) {
    console.log(`Skipping row with insufficient columns: ${row.length}`);
    return null;
  }

  // Clean customer ID by removing leading apostrophe if present
  const customerId = row[0].replace(/^'/, '').trim();
  
  if (!customerId) {
    console.log('Skipping row with empty customer ID');
    return null;
  }

  const firstName = row[1]?.trim() || '';
  const lastName = row[2]?.trim() || '';
  const email = row[3]?.trim() || '';
  const acceptsEmailMarketing = row[4]?.toLowerCase() === 'yes';
  const company = row[5]?.trim() || '';
  const address1 = row[6]?.trim() || '';
  const address2 = row[7]?.trim() || '';
  const city = row[8]?.trim() || '';
  const province = row[9]?.trim() || '';
  const country = row[10]?.trim() || '';
  const zip = row[11]?.trim() || '';
  const defaultAddressPhone = row[12]?.replace(/^'/, '').trim() || '';
  const phone = row[13]?.replace(/^'/, '').trim() || '';
  const acceptsSmsMarketing = row[14]?.toLowerCase() === 'yes';
  const totalSpent = parseFloat(row[15]) || 0;
  const totalOrders = parseInt(row[16]) || 0;
  const note = row[17]?.trim() || '';
  const taxExempt = row[18]?.toLowerCase() === 'yes';
  const tags = row[19]?.trim() || '';

  return {
    customerId,
    firstName,
    lastName,
    email,
    acceptsEmailMarketing,
    company,
    address1,
    address2,
    city,
    province,
    country,
    zip,
    defaultAddressPhone,
    phone,
    acceptsSmsMarketing,
    totalSpent,
    totalOrders,
    note,
    taxExempt,
    tags
  };
}

export async function parseCustomerCSV(csvContent: string): Promise<{
  newCustomers: number;
  updatedCustomers: number;
  errors: string[];
}> {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const errors: string[] = [];
  let newCustomers = 0;
  let updatedCustomers = 0;

  console.log(`Processing ${lines.length} lines from customer CSV`);

  // Parse all customers first
  const parsedCustomers: Array<{ customerData: InsertCustomer; lineNumber: number }> = [];
  
  // Skip the header row and parse all data
  for (let i = 1; i < lines.length; i++) {
    try {
      const row = parseCSVLine(lines[i]);
      const parsedCustomer = parseCustomerRow(row);

      if (!parsedCustomer) {
        continue;
      }

      const customerData: InsertCustomer = {
        id: parsedCustomer.customerId,
        firstName: parsedCustomer.firstName,
        lastName: parsedCustomer.lastName,
        email: parsedCustomer.email,
        acceptsEmailMarketing: parsedCustomer.acceptsEmailMarketing,
        company: parsedCustomer.company,
        address1: parsedCustomer.address1,
        address2: parsedCustomer.address2,
        city: parsedCustomer.city,
        province: parsedCustomer.province,
        country: parsedCustomer.country,
        zip: parsedCustomer.zip,
        phone: parsedCustomer.phone,
        defaultAddressPhone: parsedCustomer.defaultAddressPhone,
        acceptsSmsMarketing: parsedCustomer.acceptsSmsMarketing,
        totalSpent: parsedCustomer.totalSpent.toString(),
        totalOrders: parsedCustomer.totalOrders,
        note: parsedCustomer.note,
        taxExempt: parsedCustomer.taxExempt,
        tags: parsedCustomer.tags
      };

      parsedCustomers.push({ customerData, lineNumber: i + 1 });

    } catch (error) {
      const errorMsg = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  console.log(`Parsed ${parsedCustomers.length} valid customers, now processing batch operations...`);

  // Get all existing customers in one query for better performance
  const allExistingCustomers = await storage.getAllCustomers();
  const existingCustomerIds = new Set(allExistingCustomers.map(c => c.id));

  // Separate into new vs existing customers
  const customersToCreate: InsertCustomer[] = [];
  const customersToUpdate: Array<{ id: string; data: InsertCustomer }> = [];

  for (const { customerData } of parsedCustomers) {
    if (existingCustomerIds.has(customerData.id)) {
      customersToUpdate.push({ id: customerData.id, data: customerData });
    } else {
      customersToCreate.push(customerData);
    }
  }

  console.log(`Batch processing: ${customersToCreate.length} to create, ${customersToUpdate.length} to update`);

  // Process in batches for better performance
  const BATCH_SIZE = 50;

  // Create new customers in batches
  for (let i = 0; i < customersToCreate.length; i += BATCH_SIZE) {
    const batch = customersToCreate.slice(i, i + BATCH_SIZE);
    try {
      await storage.createCustomersBatch(batch);
      newCustomers += batch.length;
      console.log(`Created batch of ${batch.length} customers (${i + batch.length}/${customersToCreate.length})`);
    } catch (error) {
      console.error(`Error creating customer batch:`, error);
      errors.push(`Batch create error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update existing customers in batches
  for (let i = 0; i < customersToUpdate.length; i += BATCH_SIZE) {
    const batch = customersToUpdate.slice(i, i + BATCH_SIZE);
    try {
      await storage.updateCustomersBatch(batch);
      updatedCustomers += batch.length;
      console.log(`Updated batch of ${batch.length} customers (${i + batch.length}/${customersToUpdate.length})`);
    } catch (error) {
      console.error(`Error updating customer batch:`, error);
      errors.push(`Batch update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`Customer import completed: ${newCustomers} new, ${updatedCustomers} updated, ${errors.length} errors`);

  return {
    newCustomers,
    updatedCustomers,
    errors
  };
}