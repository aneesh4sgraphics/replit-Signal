import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Download, Plus } from "lucide-react";

interface CalculationResult {
  id: string;
  type: "sheets" | "roll";
  width: number;
  length: number;
  height: number;
  packQty: number;
  inputPrice: number;
  pricePerSqIn: number;
  pricePerSqFt: number;
  pricePerCubicFt: number;
  totalSqIn: number;
  totalSqFt: number;
  totalCubicFt: number;
  notes: string;
  timestamp: Date;
}

export default function AreaPricer() {
  const [calculationType, setCalculationType] = useState<"sheets" | "roll">("sheets");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [sheetsPerPack, setSheetsPerPack] = useState("");
  const [pricePerPack, setPricePerPack] = useState("");
  const [notes, setNotes] = useState("");
  const [calculations, setCalculations] = useState<CalculationResult[]>([]);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);

  const calculatePricing = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const qty = parseFloat(sheetsPerPack);
    const price = parseFloat(pricePerPack);

    if (!w || !h || !qty || !price) {
      return;
    }

    // Convert inches to feet for calculations
    const widthFt = w / 12;
    const heightFt = h / 12;
    
    // Calculate areas
    const areaPerSheetSqIn = w * h;
    const areaPerSheetSqFt = widthFt * heightFt;
    const totalSqIn = areaPerSheetSqIn * qty;
    const totalSqFt = areaPerSheetSqFt * qty;
    
    // For cubic feet, assuming standard thickness (this might need adjustment)
    const thicknessFt = 0.01; // Default thickness in feet
    const volumePerSheet = areaPerSheetSqFt * thicknessFt;
    const totalCubicFt = volumePerSheet * qty;
    
    // Calculate prices per unit
    const pricePerSqIn = price / totalSqIn;
    const pricePerSqFt = price / totalSqFt;
    const pricePerCubicFt = price / totalCubicFt;

    const result: CalculationResult = {
      id: Date.now().toString(),
      type: calculationType,
      width: w,
      length: h, // Using height as length for display
      height: thicknessFt * 12, // Convert back to inches for display
      packQty: qty,
      inputPrice: price,
      pricePerSqIn,
      pricePerSqFt,
      pricePerCubicFt,
      totalSqIn,
      totalSqFt,
      totalCubicFt,
      notes,
      timestamp: new Date()
    };

    setCurrentResult(result);
  };

  const addToSheet = () => {
    if (currentResult) {
      setCalculations([...calculations, currentResult]);
      // Clear form
      setWidth("");
      setHeight("");
      setSheetsPerPack("");
      setPricePerPack("");
      setNotes("");
      setCurrentResult(null);
    }
  };

  const exportToExcel = () => {
    if (calculations.length === 0) return;

    const headers = ["Type", "Width (in)", "Length (in)", "Height (in)", "Pack Qty", "Input Price", "Price/in²", "Price/ft²", "Price/ft³", "Notes"];
    const csvContent = [
      headers.join(","),
      ...calculations.map(calc => [
        calc.type,
        calc.width,
        calc.length,
        calc.height.toFixed(2),
        calc.packQty,
        `$${calc.inputPrice.toFixed(2)}`,
        `$${calc.pricePerSqIn.toFixed(4)}`,
        `$${calc.pricePerSqFt.toFixed(4)}`,
        `$${calc.pricePerCubicFt.toFixed(4)}`,
        `"${calc.notes}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `area-pricing-calculations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Calculator className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Area Pricing Calculator</h1>
        <p className="text-gray-600">Calculate unit pricing (in², ft², in³) for rolls or sheets. Log entries and export to Excel.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Input Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Select Calculation Type:</Label>
              <RadioGroup value={calculationType} onValueChange={(value: "sheets" | "roll") => setCalculationType(value)} className="flex space-x-8">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sheets" id="sheets" />
                  <Label htmlFor="sheets" className="flex items-center space-x-2 cursor-pointer">
                    <span>📄</span>
                    <span>Sheets</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="roll" id="roll" />
                  <Label htmlFor="roll" className="flex items-center space-x-2 cursor-pointer">
                    <span>📜</span>
                    <span>Roll</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Enter Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Sheet Width (inches)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="12"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Sheet Height (inches)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="18"
                  />
                </div>
                <div>
                  <Label htmlFor="sheets">Sheets per Pack</Label>
                  <Input
                    id="sheets"
                    type="number"
                    value={sheetsPerPack}
                    onChange={(e) => setSheetsPerPack(e.target.value)}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price for Pack ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={pricePerPack}
                    onChange={(e) => setPricePerPack(e.target.value)}
                    placeholder="44.50"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="resize-none"
                />
              </div>
              <Button onClick={calculatePricing} className="w-full mt-6" size="lg">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Pricing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        <Card>
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {currentResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Price / in²</div>
                    <div className="text-2xl font-bold text-gray-900">${currentResult.pricePerSqIn.toFixed(4)}</div>
                    <div className="text-xs text-gray-500 mt-1">Total in²: {currentResult.totalSqIn.toFixed(0)}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Price / ft²</div>
                    <div className="text-2xl font-bold text-gray-900">${currentResult.pricePerSqFt.toFixed(4)}</div>
                    <div className="text-xs text-gray-500 mt-1">Total ft²: {currentResult.totalSqFt.toFixed(4)}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Price / ft³</div>
                    <div className="text-2xl font-bold text-gray-900">${currentResult.pricePerCubicFt.toFixed(4)}</div>
                    <div className="text-xs text-gray-500 mt-1">Total ft³: {currentResult.totalCubicFt.toFixed(4)}</div>
                  </div>
                </div>
                
                <Button onClick={addToSheet} className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Sheet
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Enter values and click "Calculate Pricing" to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logged Calculations */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Logged Calculations</CardTitle>
              <CardDescription>Review your logged calculations. You can download them as an Excel file.</CardDescription>
            </div>
            <Button onClick={exportToExcel} disabled={calculations.length === 0} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {calculations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No calculations logged yet. Add some calculations to see them here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Width (in)</TableHead>
                    <TableHead>Length (in)</TableHead>
                    <TableHead>Height (in)</TableHead>
                    <TableHead>Pack Qty</TableHead>
                    <TableHead>Input Price</TableHead>
                    <TableHead>Price/in²</TableHead>
                    <TableHead>Price/ft²</TableHead>
                    <TableHead>Price/ft³</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell className="capitalize">{calc.type}</TableCell>
                      <TableCell>{calc.width}</TableCell>
                      <TableCell>{calc.length}</TableCell>
                      <TableCell>{calc.height.toFixed(2)}</TableCell>
                      <TableCell>{calc.packQty}</TableCell>
                      <TableCell>${calc.inputPrice.toFixed(2)}</TableCell>
                      <TableCell>${calc.pricePerSqIn.toFixed(4)}</TableCell>
                      <TableCell>${calc.pricePerSqFt.toFixed(4)}</TableCell>
                      <TableCell>${calc.pricePerCubicFt.toFixed(4)}</TableCell>
                      <TableCell>{calc.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}