// API endpoints for Excel file upload and conversion
import multer from "multer";
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const upload = multer({ dest: 'uploads/' });

export function addPricingRoutes(app: any, isAuthenticated: any, requireAdmin: any) {
  // Upload and process Excel file
  app.post("/api/upload-pricing-excel", isAuthenticated, requireAdmin, upload.single('file'), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      
      // Read Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to CSV
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      // Write to attached_assets folder
      const outputPath = path.join(process.cwd(), 'attached_assets', 'converted_pricing_data.csv');
      fs.writeFileSync(outputPath, csv);
      
      // Count records
      const lines = csv.split('\n').filter(line => line.trim().length > 0);
      const recordsProcessed = Math.max(0, lines.length - 1); // Subtract header
      
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      
      res.json({
        success: true,
        message: "Excel file processed successfully",
        recordsProcessed: recordsProcessed,
        filename: 'converted_pricing_data.csv'
      });
      
    } catch (error) {
      console.error("Error processing Excel file:", error);
      res.status(500).json({ error: "Failed to process Excel file" });
    }
  });

  // Download current pricing data
  app.get("/api/download-pricing-data", isAuthenticated, requireAdmin, async (req: any, res: any) => {
    try {
      const filePath = path.join(process.cwd(), 'attached_assets', 'converted_pricing_data.csv');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Pricing data file not found" });
      }
      
      const csvContent = fs.readFileSync(filePath, 'utf-8');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="pricing-data.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error downloading pricing data:", error);
      res.status(500).json({ error: "Failed to download pricing data" });
    }
  });
}