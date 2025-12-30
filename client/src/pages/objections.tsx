import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  Settings, 
  Package, 
  Truck, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Filter
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { CategoryObjection, Customer } from "@shared/schema";

const OBJECTION_TYPES = [
  { id: 'price', label: 'Price', icon: DollarSign, color: 'bg-red-100 text-red-700' },
  { id: 'compatibility', label: 'Compatibility', icon: Settings, color: 'bg-orange-100 text-orange-700' },
  { id: 'moq', label: 'MOQ', icon: Package, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'lead_time', label: 'Lead Time', icon: Truck, color: 'bg-blue-100 text-blue-700' },
  { id: 'has_supplier', label: 'Has Supplier', icon: Users, color: 'bg-purple-100 text-purple-700' },
  { id: 'not_a_fit', label: 'Not a Fit', icon: AlertTriangle, color: 'bg-gray-100 text-gray-700' },
];

const STATUS_OPTIONS = [
  { id: 'open', label: 'Open', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'addressed', label: 'Addressed', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  { id: 'won', label: 'Won', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { id: 'lost', label: 'Lost', icon: XCircle, color: 'bg-red-100 text-red-700' },
];

export default function ObjectionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: objections = [], isLoading: objectionsLoading } = useQuery<CategoryObjection[]>({
    queryKey: ['/api/crm/objections'],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const customerMap = new Map(customers.map(c => [c.id, c]));

  const filteredObjections = objections.filter(obj => {
    if (typeFilter !== "all" && obj.objectionType !== typeFilter) return false;
    if (statusFilter !== "all" && obj.status !== statusFilter) return false;
    return true;
  });

  const typeCounts = OBJECTION_TYPES.map(type => ({
    ...type,
    count: objections.filter(o => o.objectionType === type.id).length,
    openCount: objections.filter(o => o.objectionType === type.id && o.status === 'open').length,
  }));

  const totalOpen = objections.filter(o => o.status === 'open').length;
  const totalAddressed = objections.filter(o => o.status === 'addressed').length;
  const totalWon = objections.filter(o => o.status === 'won').length;
  const totalLost = objections.filter(o => o.status === 'lost').length;

  const getObjectionTypeInfo = (typeId: string) => {
    return OBJECTION_TYPES.find(t => t.id === typeId) || { label: typeId, icon: AlertTriangle, color: 'bg-gray-100 text-gray-700' };
  };

  const getStatusInfo = (statusId: string) => {
    return STATUS_OPTIONS.find(s => s.id === statusId) || { label: statusId, icon: Clock, color: 'bg-gray-100 text-gray-700' };
  };

  if (objectionsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">Objections Summary</h1>
          <p className="text-gray-500 mt-1">Track and manage customer objections across all categories</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{objections.length} total objections</span>
          <span className="text-yellow-600 font-medium">({totalOpen} open)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Open</p>
                <p className="text-2xl font-bold text-yellow-800" data-testid="text-open-count">{totalOpen}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Addressed</p>
                <p className="text-2xl font-bold text-blue-800" data-testid="text-addressed-count">{totalAddressed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Won</p>
                <p className="text-2xl font-bold text-green-800" data-testid="text-won-count">{totalWon}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Lost</p>
                <p className="text-2xl font-bold text-red-800" data-testid="text-lost-count">{totalLost}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Objections by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {typeCounts.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setTypeFilter(typeFilter === type.id ? "all" : type.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    typeFilter === type.id 
                      ? 'border-gray-900 bg-gray-100' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  data-testid={`button-filter-${type.id}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-full ${type.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{type.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">{type.count}</span>
                      {type.openCount > 0 && (
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">
                          {type.openCount} open
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Objections</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(typeFilter !== "all" || statusFilter !== "all") && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}
                  data-testid="button-clear-filters"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredObjections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No objections found</p>
              {(typeFilter !== "all" || statusFilter !== "all") && (
                <p className="text-sm">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Details</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredObjections.map(obj => {
                    const customer = customerMap.get(obj.customerId);
                    const typeInfo = getObjectionTypeInfo(obj.objectionType);
                    const statusInfo = getStatusInfo(obj.status);
                    const TypeIcon = typeInfo.icon;
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={obj.id} className="hover:bg-gray-50" data-testid={`row-objection-${obj.id}`}>
                        <td className="py-3">
                          <span className="font-medium">{customer?.company || 'Unknown'}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm">{obj.categoryName}</span>
                        </td>
                        <td className="py-3">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-gray-600 max-w-xs truncate block">
                            {obj.details || '-'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-gray-500">
                            {obj.createdAt ? format(new Date(obj.createdAt), 'MMM d, yyyy') : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
