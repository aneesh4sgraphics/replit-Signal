// Example implementation showing debounce usage across components
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";

export default function DebounceExample() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  
  // Debounce search and filter inputs to reduce re-renders
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedPriceFilter = useDebounce(priceFilter, 500);
  
  // Use debounced values for filtering/API calls
  const filteredData = mockData.filter(item => 
    item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
    (debouncedPriceFilter ? item.price >= parseFloat(debouncedPriceFilter) : true)
  );
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Input
            placeholder="Min price filter..."
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            type="number"
          />
          <div className="text-sm text-gray-500">
            Results: {filteredData.length} items (debounced)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const mockData = [
  { name: "Product 1", price: 10 },
  { name: "Product 2", price: 20 },
  { name: "Product 3", price: 30 },
];