import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import {
  Search,
  Plus,
  Palette,
  Book,
  Truck,
  Package,
  Heart,
  Star,
  Edit,
  Trash2,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { Customer, Swatch, SwatchBookShipment, SwatchSelection } from "@shared/schema";

const SHIPMENT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-gray-500', icon: Clock },
  shipped: { label: 'Shipped', color: 'bg-blue-500', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500', icon: CheckCircle },
};

export default function CRMSwatchesPage() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchTerm, setSearchTerm] = useState("");
  const [isSwatchDialogOpen, setIsSwatchDialogOpen] = useState(false);
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false);
  const [editingSwatch, setEditingSwatch] = useState<Swatch | null>(null);
  const [newSwatchData, setNewSwatchData] = useState({
    name: '',
    productLine: '',
    paperWeight: '',
    finish: '',
    colorInfo: '',
    sku: '',
    stockQuantity: '',
    notes: '',
    isActive: true,
  });
  const [newShipmentData, setNewShipmentData] = useState({
    customerId: '',
    shippingAddress: '',
    trackingNumber: '',
    swatchIds: [] as number[],
    notes: '',
  });
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  // Fetch data
  const { data: swatches = [], isLoading: swatchesLoading } = useQuery<Swatch[]>({
    queryKey: ['/api/crm/swatches'],
  });

  const { data: shipments = [] } = useQuery<SwatchBookShipment[]>({
    queryKey: ['/api/crm/swatch-shipments'],
  });

  const { data: selections = [] } = useQuery<SwatchSelection[]>({
    queryKey: ['/api/crm/swatch-selections'],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Create swatch mutation
  const createSwatchMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/crm/swatches', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/swatches'] });
      setIsSwatchDialogOpen(false);
      resetSwatchData();
      toast({ title: "Success", description: "Swatch added to catalog" });
      logActivity('SWATCH_CREATE', 'Added swatch to catalog');
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create swatch", variant: "destructive" });
    },
  });

  // Update swatch mutation
  const updateSwatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PUT', `/api/crm/swatches/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/swatches'] });
      setIsSwatchDialogOpen(false);
      setEditingSwatch(null);
      resetSwatchData();
      toast({ title: "Success", description: "Swatch updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update swatch", variant: "destructive" });
    },
  });

  // Delete swatch mutation
  const deleteSwatchMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/crm/swatches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/swatches'] });
      toast({ title: "Success", description: "Swatch removed from catalog" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete swatch", variant: "destructive" });
    },
  });

  // Create shipment mutation
  const createShipmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/crm/swatch-shipments', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/swatch-shipments'] });
      setIsShipmentDialogOpen(false);
      resetShipmentData();
      toast({ title: "Success", description: "Swatch book shipment created" });
      logActivity('SWATCH_SHIPMENT_CREATE', 'Created swatch book shipment');
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create shipment", variant: "destructive" });
    },
  });

  // Update shipment mutation  
  const updateShipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PUT', `/api/crm/swatch-shipments/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/swatch-shipments'] });
      toast({ title: "Success", description: "Shipment updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update shipment", variant: "destructive" });
    },
  });

  const resetSwatchData = () => {
    setNewSwatchData({
      name: '',
      productLine: '',
      paperWeight: '',
      finish: '',
      colorInfo: '',
      sku: '',
      stockQuantity: '',
      notes: '',
      isActive: true,
    });
  };

  const resetShipmentData = () => {
    setNewShipmentData({
      customerId: '',
      shippingAddress: '',
      trackingNumber: '',
      swatchIds: [],
      notes: '',
    });
  };

  // Customer map
  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);

  // Swatch map
  const swatchMap = useMemo(() => new Map(swatches.map(s => [s.id, s])), [swatches]);

  // Filter swatches
  const filteredSwatches = useMemo(() => {
    if (!searchTerm) return swatches;
    const term = searchTerm.toLowerCase();
    return swatches.filter(s => 
      s.name?.toLowerCase().includes(term) ||
      s.productLine?.toLowerCase().includes(term) ||
      s.sku?.toLowerCase().includes(term) ||
      s.finish?.toLowerCase().includes(term)
    );
  }, [swatches, searchTerm]);

  // Stats
  const stats = useMemo(() => ({
    totalSwatches: swatches.length,
    activeSwatches: swatches.filter(s => s.isActive).length,
    totalShipments: shipments.length,
    pendingShipments: shipments.filter(s => s.status === 'pending').length,
    totalSelections: selections.length,
  }), [swatches, shipments, selections]);

  const handleEditSwatch = (swatch: Swatch) => {
    setEditingSwatch(swatch);
    setNewSwatchData({
      name: swatch.name || '',
      productLine: swatch.productLine || '',
      paperWeight: swatch.paperWeight || '',
      finish: swatch.finish || '',
      colorInfo: swatch.colorInfo || '',
      sku: swatch.sku || '',
      stockQuantity: swatch.stockQuantity?.toString() || '',
      notes: swatch.notes || '',
      isActive: swatch.isActive ?? true,
    });
    setIsSwatchDialogOpen(true);
  };

  const handleSaveSwatch = () => {
    const data = {
      ...newSwatchData,
      stockQuantity: newSwatchData.stockQuantity ? parseInt(newSwatchData.stockQuantity) : null,
    };
    if (editingSwatch) {
      updateSwatchMutation.mutate({ id: editingSwatch.id, data });
    } else {
      createSwatchMutation.mutate(data);
    }
  };

  const handleCreateShipment = () => {
    if (!newShipmentData.customerId) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return;
    }
    const customer = customerMap.get(newShipmentData.customerId);
    createShipmentMutation.mutate({
      customerId: newShipmentData.customerId,
      customerName: customer?.company || `${customer?.firstName} ${customer?.lastName}`,
      shippingAddress: newShipmentData.shippingAddress,
      trackingNumber: newShipmentData.trackingNumber || null,
      swatchIds: newShipmentData.swatchIds,
      notes: newShipmentData.notes || null,
    });
  };

  const toggleSwatchInShipment = (swatchId: number) => {
    setNewShipmentData(prev => ({
      ...prev,
      swatchIds: prev.swatchIds.includes(swatchId)
        ? prev.swatchIds.filter(id => id !== swatchId)
        : [...prev.swatchIds, swatchId],
    }));
  };

  return (
    <div className="space-y-6" data-testid="crm-swatches-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">Swatch Manager</h1>
          <p className="text-gray-500">Manage paper swatches, books, and customer selections</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Total Swatches</p>
                <p className="text-xl font-bold">{stats.totalSwatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <p className="text-xl font-bold">{stats.activeSwatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Shipments</p>
                <p className="text-xl font-bold">{stats.totalShipments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-xl font-bold">{stats.pendingShipments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">Selections</p>
                <p className="text-xl font-bold">{stats.totalSelections}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="catalog" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            Swatch Catalog
          </TabsTrigger>
          <TabsTrigger value="shipments" className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            Shipments
          </TabsTrigger>
          <TabsTrigger value="selections" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            Customer Selections
          </TabsTrigger>
        </TabsList>

        {/* Catalog Tab */}
        <TabsContent value="catalog" className="mt-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search swatches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button onClick={() => { resetSwatchData(); setEditingSwatch(null); setIsSwatchDialogOpen(true); }} data-testid="btn-add-swatch">
              <Plus className="h-4 w-4 mr-1" />
              Add Swatch
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSwatches.map(swatch => (
              <Card key={swatch.id} className={`glass-card ${!swatch.isActive ? 'opacity-60' : ''}`} data-testid={`swatch-card-${swatch.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{swatch.name}</h3>
                      {swatch.sku && <p className="text-xs text-gray-500">SKU: {swatch.sku}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditSwatch(swatch)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-500"
                        onClick={() => deleteSwatchMutation.mutate(swatch.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {swatch.productLine && <Badge variant="outline">{swatch.productLine}</Badge>}
                    <div className="flex flex-wrap gap-2 text-gray-600">
                      {swatch.paperWeight && <span>{swatch.paperWeight}</span>}
                      {swatch.finish && <span>• {swatch.finish}</span>}
                    </div>
                    {swatch.stockQuantity != null && (
                      <p className="text-xs">
                        Stock: <span className={swatch.stockQuantity < 10 ? 'text-red-500 font-medium' : 'text-green-600'}>{swatch.stockQuantity}</span>
                      </p>
                    )}
                  </div>
                  {!swatch.isActive && <Badge variant="secondary" className="mt-2">Inactive</Badge>}
                </CardContent>
              </Card>
            ))}
            {filteredSwatches.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Palette className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No swatches found</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { resetShipmentData(); setIsShipmentDialogOpen(true); }} data-testid="btn-new-shipment">
              <Plus className="h-4 w-4 mr-1" />
              New Shipment
            </Button>
          </div>

          <Card className="glass-card">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y">
                  {shipments.map(shipment => {
                    const statusConfig = SHIPMENT_STATUS_CONFIG[shipment.status as keyof typeof SHIPMENT_STATUS_CONFIG] || SHIPMENT_STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div key={shipment.id} className="p-4 hover:bg-gray-50" data-testid={`shipment-row-${shipment.id}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{shipment.customerName}</h3>
                              <Badge className={`${statusConfig.color} text-white`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{shipment.shippingAddress}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              {shipment.trackingNumber && (
                                <span>Tracking: {shipment.trackingNumber}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(shipment.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Select 
                            value={shipment.status}
                            onValueChange={(v) => updateShipmentMutation.mutate({ id: shipment.id, data: { status: v } })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(SHIPMENT_STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                  {shipments.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No shipments yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Selections Tab */}
        <TabsContent value="selections" className="mt-4">
          <Card className="glass-card">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y">
                  {selections.map(selection => {
                    const customer = customerMap.get(selection.customerId);
                    const swatch = swatchMap.get(selection.swatchId);
                    return (
                      <div key={selection.id} className="p-4 hover:bg-gray-50" data-testid={`selection-row-${selection.id}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{customer?.company || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Palette className="h-4 w-4 text-gray-400" />
                              <span>{swatch?.name || 'Unknown Swatch'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selection.isFavorite && (
                              <Badge className="bg-red-500 text-white">
                                <Heart className="h-3 w-3 mr-1" />
                                Favorite
                              </Badge>
                            )}
                            <Badge variant="outline">{selection.interestLevel}</Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(selection.createdAt!).toLocaleDateString()}
                          </div>
                        </div>
                        {selection.notes && (
                          <p className="text-sm text-gray-600 mt-2 ml-6">{selection.notes}</p>
                        )}
                      </div>
                    );
                  })}
                  {selections.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No customer selections yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Swatch Dialog */}
      <Dialog open={isSwatchDialogOpen} onOpenChange={(open) => { setIsSwatchDialogOpen(open); if (!open) setEditingSwatch(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSwatch ? 'Edit Swatch' : 'Add Swatch'}</DialogTitle>
            <DialogDescription>
              {editingSwatch ? 'Update swatch details' : 'Add a new swatch to the catalog'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Name *</Label>
              <Input
                value={newSwatchData.name}
                onChange={(e) => setNewSwatchData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Graffiti Matte"
                data-testid="input-swatch-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Line</Label>
                <Input
                  value={newSwatchData.productLine}
                  onChange={(e) => setNewSwatchData(prev => ({ ...prev, productLine: e.target.value }))}
                  placeholder="e.g., Coated"
                />
              </div>
              <div>
                <Label>SKU</Label>
                <Input
                  value={newSwatchData.sku}
                  onChange={(e) => setNewSwatchData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="e.g., GM-80-SW"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Paper Weight</Label>
                <Input
                  value={newSwatchData.paperWeight}
                  onChange={(e) => setNewSwatchData(prev => ({ ...prev, paperWeight: e.target.value }))}
                  placeholder="e.g., 80lb Cover"
                />
              </div>
              <div>
                <Label>Finish</Label>
                <Input
                  value={newSwatchData.finish}
                  onChange={(e) => setNewSwatchData(prev => ({ ...prev, finish: e.target.value }))}
                  placeholder="e.g., Matte, Gloss"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color Info</Label>
                <Input
                  value={newSwatchData.colorInfo}
                  onChange={(e) => setNewSwatchData(prev => ({ ...prev, colorInfo: e.target.value }))}
                  placeholder="e.g., White, Cream"
                />
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={newSwatchData.stockQuantity}
                  onChange={(e) => setNewSwatchData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newSwatchData.notes}
                onChange={(e) => setNewSwatchData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={newSwatchData.isActive}
                onCheckedChange={(checked) => setNewSwatchData(prev => ({ ...prev, isActive: !!checked }))}
              />
              <Label htmlFor="isActive">Active (visible in catalog)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsSwatchDialogOpen(false); setEditingSwatch(null); }}>Cancel</Button>
            <Button 
              onClick={handleSaveSwatch} 
              disabled={createSwatchMutation.isPending || updateSwatchMutation.isPending}
              data-testid="btn-save-swatch"
            >
              {(createSwatchMutation.isPending || updateSwatchMutation.isPending) ? 'Saving...' : 'Save Swatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Shipment Dialog */}
      <Dialog open={isShipmentDialogOpen} onOpenChange={setIsShipmentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Swatch Book Shipment</DialogTitle>
            <DialogDescription>Create a swatch book shipment for a customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Customer *</Label>
              <Select value={newShipmentData.customerId} onValueChange={(v) => setNewShipmentData(prev => ({ ...prev, customerId: v }))}>
                <SelectTrigger data-testid="select-customer">
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company || `${customer.firstName} ${customer.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Shipping Address *</Label>
              <Textarea
                value={newShipmentData.shippingAddress}
                onChange={(e) => setNewShipmentData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                placeholder="Full shipping address..."
                rows={2}
              />
            </div>
            <div>
              <Label>Tracking Number</Label>
              <Input
                value={newShipmentData.trackingNumber}
                onChange={(e) => setNewShipmentData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                placeholder="Optional tracking number"
              />
            </div>
            <div>
              <Label>Select Swatches to Include</Label>
              <ScrollArea className="h-40 border rounded p-2 mt-1">
                <div className="space-y-2">
                  {swatches.filter(s => s.isActive).map(swatch => (
                    <div key={swatch.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`swatch-${swatch.id}`}
                        checked={newShipmentData.swatchIds.includes(swatch.id)}
                        onCheckedChange={() => toggleSwatchInShipment(swatch.id)}
                      />
                      <Label htmlFor={`swatch-${swatch.id}`} className="text-sm cursor-pointer">
                        {swatch.name} {swatch.paperWeight && `(${swatch.paperWeight})`}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-gray-500 mt-1">{newShipmentData.swatchIds.length} swatches selected</p>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newShipmentData.notes}
                onChange={(e) => setNewShipmentData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShipmentDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateShipment} 
              disabled={createShipmentMutation.isPending}
              data-testid="btn-create-shipment"
            >
              {createShipmentMutation.isPending ? 'Creating...' : 'Create Shipment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}