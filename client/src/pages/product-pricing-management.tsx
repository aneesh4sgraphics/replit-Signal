import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Upload, Download, RefreshCw, FileSpreadsheet, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ProductData {
  ItemCode: string;
  product_name: string;
  ProductType: string;
  size: string;
  total_sqm: number;
  min_quantity: number;
  Export: number;
  "M.Distributor": number;
  Dealer: number;
  Dealer2: number;
  ApprovalNeeded: number;
  TierStage25: number;
  TierStage2: number;
  TierStage15: number;
  TierStage1: number;
  Retail: number;
}

export default function ProductPricingManagement() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; count?: number; details?: any } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current product data stats
  const { data: productData = [], isLoading } = useQuery<ProductData[]>({
    queryKey: ['/api/product-pricing-data'],
  });

  const stats = {
    totalProducts: productData.length,
    categories: Array.from(new Set(productData.map(item => item.product_name))).length,
    lastUpdated: uploadResult?.details?.timestamp 
      ? new Date(uploadResult.details.timestamp).toLocaleString()
      : 'Not available'
  };

  const handleFileSelection = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file (.csv)",
        variant: "destructive",
      });
      return;
    }

    setPendingFile(file);
    setShowConfirmDialog(true);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    setUploadResult(null);
    setShowConfirmDialog(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(30);
      
      const response = await fetch('/api/upload-pricing-csv', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(70);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}`, details: errorText };
        }
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      setUploadProgress(100);
      
      setUploadResult({
        success: true,
        message: result.message || `Successfully processed ${result.recordsProcessed || 0} products`,
        count: result.recordsProcessed,
        details: result.replacementComplete ? {
          total: result.newRecordsCount,
          added: result.addedRecordsCount,
          updated: result.updatedRecordsCount,
          removed: result.removedRecordsCount,
          previous: result.oldRecordsCount,
          timestamp: result.timestamp
        } : null
      });

      // Force clear all cached data and refetch fresh data
      console.log("Upload successful, clearing cache and refetching data...");
      queryClient.removeQueries({ queryKey: ['/api/product-pricing-data'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/product-pricing-data'] });
      
      // Small delay to ensure file is fully written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force immediate refetch to ensure UI updates with new data
      const refetchResult = await queryClient.refetchQueries({ 
        queryKey: ['/api/product-pricing-data'],
        type: 'active'
      });
      console.log("Refetch completed:", refetchResult);

      toast({
        title: "Complete Data Replacement",
        description: result.replacementComplete 
          ? `${result.newRecordsCount} total products. ${result.addedRecordsCount} added, ${result.updatedRecordsCount} updated, ${result.removedRecordsCount} removed.`
          : `Processed ${result.recordsProcessed || 0} products from ${file.name}.`,
      });

    } catch (error) {
      console.error("Upload error:", error);
      
      let errorMessage = "Unknown error occurred";
      let errorDetails = "Please check the format and try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Try to get more details from response if it's a fetch error
      if (error && typeof error === 'object' && 'response' in error) {
        try {
          const responseText = await (error as any).response.text();
          const responseData = JSON.parse(responseText);
          if (responseData.error) {
            errorMessage = responseData.error;
          }
          if (responseData.details) {
            errorDetails = responseData.details;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
      }

      setUploadResult({
        success: false,
        message: `Upload failed: ${errorMessage}`
      });

      toast({
        title: "Upload Failed",
        description: errorDetails,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const confirmUpload = () => {
    if (pendingFile) {
      handleFileUpload(pendingFile);
      setPendingFile(null);
    }
  };

  const cancelUpload = () => {
    setPendingFile(null);
    setShowConfirmDialog(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const downloadCurrentData = async () => {
    try {
      const response = await fetch('/api/download-pricing-data');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pricing-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Complete",
          description: "Current pricing data has been downloaded",
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download current data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ProductPricing Management</h1>
          <p className="text-gray-600 mt-2">
            Upload and manage pricing data spreadsheets for QuickQuotes and Price List apps
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Admin Only
        </Badge>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {uploadResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={uploadResult.success ? "text-green-700" : "text-red-700"}>
            <div className="space-y-2">
              <div>{uploadResult.message}</div>
              {uploadResult.details && (
                <div className="text-sm space-y-1 mt-2 p-2 bg-white/50 rounded">
                  <div className="font-medium">Data Replacement Summary:</div>
                  <div>• Total Products: {uploadResult.details.total}</div>
                  <div>• Added: {uploadResult.details.added}</div>
                  <div>• Updated: {uploadResult.details.updated}</div>
                  <div>• Removed: {uploadResult.details.removed}</div>
                  <div>• Previous Total: {uploadResult.details.previous}</div>
                  {uploadResult.details.timestamp && (
                    <div className="text-xs text-gray-500 mt-1">
                      Last updated: {new Date(uploadResult.details.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Pricing Data
            </CardTitle>
            <CardDescription>
              Upload CSV file to update product pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Drop your CSV file here or click to browse
              </p>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Browse Files"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Current Data Status
            </CardTitle>
            <CardDescription>
              Information about the active pricing data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data Source:</span>
                  <span className="text-sm font-medium">converted_pricing_data.csv</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Products:</span>
                  <span className="text-sm font-medium">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Categories:</span>
                  <span className="text-sm font-medium">{stats.categories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated from CSV:</span>
                  <span className="text-sm font-medium">{stats.lastUpdated}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2 pt-2">
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={downloadCurrentData}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Current Data
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/product-pricing-data'] })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Update Pricing Data</CardTitle>
          <CardDescription>
            Step-by-step instructions for uploading new pricing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">1</Badge>
              <div>
                <h4 className="font-medium mb-1">Prepare Your CSV File</h4>
                <p className="text-gray-600">
                  Ensure your CSV file contains the required columns: ItemCode, product_name, ProductType, size, total_sqm, min_quantity, Export, M.Distributor, Dealer, Dealer2, ApprovalNeeded, TierStage25, TierStage2, TierStage15, TierStage1, Retail.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">2</Badge>
              <div>
                <h4 className="font-medium mb-1">Upload the File</h4>
                <p className="text-gray-600">
                  Drag and drop your CSV file into the upload area or click "Browse Files" to select it. The system will automatically process the data.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">3</Badge>
              <div>
                <h4 className="font-medium mb-1">Verify Data</h4>
                <p className="text-gray-600">
                  After successful upload, visit the QuickQuotes and Price List apps to verify that the new pricing data is properly loaded and all products are accessible.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Data Replacement
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>This will completely overwrite existing product and pricing data with the contents of <strong>{pendingFile?.name}</strong>.</p>
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border">
                <strong>Changes that will occur:</strong>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Products not in the new file will be deleted</li>
                  <li>• Existing products will be updated with new pricing</li>
                  <li>• New products in the file will be added</li>
                  <li>• All apps will immediately reflect these changes</li>
                </ul>
              </div>
              <p className="text-sm">Are you sure you want to continue?</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelUpload}>
              Cancel
            </Button>
            <Button onClick={confirmUpload} className="bg-blue-600 hover:bg-blue-700">
              Yes, Replace Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}