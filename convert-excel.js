import ExcelJS from 'exceljs';
import fs from 'fs';

async function convertExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('attached_assets/cleaned_merged_product_pricing_1753380108894.xlsx');

  const worksheet = workbook.worksheets[0];

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    const rowValues = [];
    row.eachCell((cell, colNumber) => {
      rowValues[colNumber - 1] = cell.value ?? '';
    });
    rows.push(rowValues.join(','));
  });

  const csv = rows.join('\n');
  fs.writeFileSync('attached_assets/converted_pricing_data.csv', csv);

  const lines = csv.split('\n').slice(0, 10);
  console.log('Excel file converted to CSV. First 10 rows:');
  lines.forEach((line, index) => {
    console.log(`Row ${index + 1}: ${line}`);
  });
}

convertExcel().catch(console.error);
