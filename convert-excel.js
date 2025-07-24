import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('attached_assets/cleaned_merged_product_pricing_1753380108894.xlsx');

// Get the first sheet name
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to CSV
const csv = XLSX.utils.sheet_to_csv(worksheet);

// Write to file
fs.writeFileSync('attached_assets/converted_pricing_data.csv', csv);

// Also log first few rows to understand structure
const lines = csv.split('\n').slice(0, 10);
console.log('Excel file converted to CSV. First 10 rows:');
lines.forEach((line, index) => {
  console.log(`Row ${index + 1}: ${line}`);
});