import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  acceptsEmailMarketing: boolean;
  totalSpent: number;
  totalOrders: number;
  note: string;
  tags: string;
}

interface SearchableCustomerSelectProps {
  customers: Customer[];
  selectedCustomer: string;
  onCustomerSelect: (customerId: string) => void;
  onNewCustomer: () => void;
  placeholder?: string;
}

export default function SearchableCustomerSelect({
  customers,
  selectedCustomer,
  onCustomerSelect,
  onNewCustomer,
  placeholder = "Search and select customer..."
}: SearchableCustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sort customers by company name and filter by search term
  const filteredAndSortedCustomers = useMemo(() => {
    const filtered = customers.filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.company.toLowerCase().includes(searchLower) ||
        customer.firstName.toLowerCase().includes(searchLower) ||
        customer.lastName.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => a.company.localeCompare(b.company));
  }, [customers, searchTerm]);

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Selected Customer Display / Trigger */}
      <Button
        variant="outline"
        className="w-full h-12 text-base justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {selectedCustomerData ? (
            <span className="truncate">
              {selectedCustomerData.company} - {selectedCustomerData.firstName} {selectedCustomerData.lastName}
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 w-full mt-1 z-50 shadow-lg border">
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Customer List */}
            <ScrollArea className="max-h-64">
              <div className="p-1">
                {filteredAndSortedCustomers.length > 0 ? (
                  filteredAndSortedCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer rounded transition-colors ${
                        selectedCustomer === customer.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="font-medium text-gray-900">
                        {customer.company}
                      </div>
                      <div className="text-sm text-gray-600">
                        {customer.firstName} {customer.lastName} • {customer.email}
                      </div>
                      {customer.city && customer.province && (
                        <div className="text-xs text-gray-500">
                          {customer.city}, {customer.province}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    {searchTerm ? 'No customers found matching your search' : 'No customers available'}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Add New Customer Button */}
            <div className="p-3 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onNewCustomer();
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
}