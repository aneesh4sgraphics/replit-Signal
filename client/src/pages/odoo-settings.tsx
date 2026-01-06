import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Settings, 
  Link2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Users,
  Package,
  FileText,
  Upload,
  Download,
  Search,
  Building2,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

export default function OdooSettingsPage() {
  const { toast } = useToast();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [partnerSearchTerm, setPartnerSearchTerm] = useState("");

  const { data: connectionTest, refetch: testConnection, isFetching: testingConnection } = useQuery<{
    success: boolean;
    message: string;
    uid?: number;
  }>({
    queryKey: ['/api/odoo/test-connection'],
    enabled: false,
    retry: false,
  });

  const { data: odooStatus } = useQuery<{
    connected: boolean;
    error: string | null;
  }>({
    queryKey: ['/api/odoo/status'],
  });

  const { data: odooPartners = [], isLoading: partnersLoading, refetch: refetchPartners } = useQuery<any[]>({
    queryKey: ['/api/odoo/partners'],
    enabled: !!connectionTest?.success,
  });

  const { data: odooProducts = [], isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/odoo/products'],
    enabled: !!connectionTest?.success,
  });

  const { data: odooPricelists = [] } = useQuery<any[]>({
    queryKey: ['/api/odoo/pricelists'],
    enabled: !!connectionTest?.success,
  });

  const { data: odooOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ['/api/odoo/orders'],
    enabled: !!connectionTest?.success,
  });

  const { data: odooUsers = [] } = useQuery<any[]>({
    queryKey: ['/api/odoo/users'],
    enabled: !!connectionTest?.success,
  });

  const { data: localCustomers = [] } = useQuery<any[]>({
    queryKey: ['/api/customers'],
  });

  const syncCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const res = await apiRequest('POST', `/api/odoo/sync/customer/${customerId}`, {});
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/odoo/partners'] });
      toast({ 
        title: data.action === 'created' ? "Customer synced to Odoo" : "Customer updated in Odoo",
        description: `Odoo Partner ID: ${data.odooId}`
      });
    },
    onError: (error: any) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    },
  });

  const bulkSyncMutation = useMutation({
    mutationFn: async (customerIds: string[]) => {
      const res = await apiRequest('POST', '/api/odoo/sync/customers', { customerIds });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/odoo/partners'] });
      setSelectedCustomers([]);
      toast({ 
        title: "Bulk sync complete",
        description: `Created: ${data.created}, Updated: ${data.updated}, Failed: ${data.failed}`
      });
    },
    onError: (error: any) => {
      toast({ title: "Bulk sync failed", description: error.message, variant: "destructive" });
    },
  });

  const filteredCustomers = localCustomers.filter((c: any) => {
    if (!customerSearchTerm) return true;
    const searchLower = customerSearchTerm.toLowerCase();
    return (
      (c.company || '').toLowerCase().includes(searchLower) ||
      (c.email || '').toLowerCase().includes(searchLower) ||
      (c.firstName || '').toLowerCase().includes(searchLower) ||
      (c.lastName || '').toLowerCase().includes(searchLower)
    );
  });

  const filteredPartners = odooPartners.filter((p: any) => {
    if (!partnerSearchTerm) return true;
    const searchLower = partnerSearchTerm.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(searchLower) ||
      (p.email || '').toLowerCase().includes(searchLower)
    );
  });

  const unsyncedCustomers = filteredCustomers.filter((c: any) => !c.odooPartnerId);
  const syncedCustomers = filteredCustomers.filter((c: any) => c.odooPartnerId);

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const selectAllUnsynced = () => {
    setSelectedCustomers(unsyncedCustomers.map((c: any) => c.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Odoo Integration
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect and sync your CRM data with Odoo V19 Enterprise
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connectionTest?.success ? (
            <Badge className="bg-green-100 text-green-700 gap-1">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
          ) : odooStatus?.error ? (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Disconnected
            </Badge>
          ) : (
            <Badge variant="secondary">Not tested</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connection Status
          </CardTitle>
          <CardDescription>
            Test your Odoo connection and view system information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => testConnection()}
              disabled={testingConnection}
              data-testid="btn-test-odoo-connection"
            >
              {testingConnection && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Test Connection
            </Button>
            
            {connectionTest && (
              <div className="flex items-center gap-2">
                {connectionTest.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">{connectionTest.message}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-700">{connectionTest.message}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {connectionTest?.success && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{odooPartners.length}</div>
                  <div className="text-sm text-muted-foreground">Odoo Partners</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{odooProducts.length}</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{odooPricelists.length}</div>
                  <div className="text-sm text-muted-foreground">Pricelists</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{odooUsers.length}</div>
                  <div className="text-sm text-muted-foreground">Users</div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sync" data-testid="tab-sync">
            <Upload className="h-4 w-4 mr-2" />
            Sync Customers
          </TabsTrigger>
          <TabsTrigger value="partners" data-testid="tab-partners">
            <Users className="h-4 w-4 mr-2" />
            Odoo Partners
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <FileText className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sync Customers to Odoo</CardTitle>
              <CardDescription>
                Push your local CRM customers to Odoo as partners. Customers already synced will be updated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-customer-search"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={selectAllUnsynced}
                    disabled={unsyncedCustomers.length === 0}
                    data-testid="btn-select-all-unsynced"
                  >
                    Select All Unsynced ({unsyncedCustomers.length})
                  </Button>
                  <Button 
                    onClick={() => bulkSyncMutation.mutate(selectedCustomers)}
                    disabled={selectedCustomers.length === 0 || bulkSyncMutation.isPending}
                    data-testid="btn-bulk-sync"
                  >
                    {bulkSyncMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    Sync Selected ({selectedCustomers.length})
                  </Button>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge variant="outline">
                    Total: {filteredCustomers.length}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    Synced: {syncedCustomers.length}
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-700">
                    Unsynced: {unsyncedCustomers.length}
                  </Badge>
                </div>

                <div className="border rounded-lg max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Odoo ID</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.slice(0, 100).map((customer: any) => (
                        <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={() => toggleCustomerSelection(customer.id)}
                              data-testid={`checkbox-customer-${customer.id}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {customer.company || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown'}
                            </div>
                            {customer.company && customer.firstName && (
                              <div className="text-sm text-muted-foreground">
                                {customer.firstName} {customer.lastName}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>
                            {customer.odooPartnerId ? (
                              <Badge className="bg-green-100 text-green-700">
                                #{customer.odooPartnerId}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not synced</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => syncCustomerMutation.mutate(customer.id)}
                              disabled={syncCustomerMutation.isPending}
                              data-testid={`btn-sync-customer-${customer.id}`}
                            >
                              {customer.odooPartnerId ? 'Update' : 'Sync'}
                              <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredCustomers.length > 100 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Showing first 100 of {filteredCustomers.length} customers. Use search to find specific customers.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Odoo Partners</CardTitle>
                  <CardDescription>
                    View partners (customers/companies) in your Odoo system
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchPartners()}
                  disabled={partnersLoading}
                  data-testid="btn-refresh-partners"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${partnersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search partners..."
                    value={partnerSearchTerm}
                    onChange={(e) => setPartnerSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-partner-search"
                  />
                </div>

                <div className="border rounded-lg max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>City</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partnersLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                            Loading partners...
                          </TableCell>
                        </TableRow>
                      ) : filteredPartners.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No partners found. Test your connection first.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPartners.slice(0, 100).map((partner: any) => (
                          <TableRow key={partner.id} data-testid={`row-partner-${partner.id}`}>
                            <TableCell className="font-mono text-sm">{partner.id}</TableCell>
                            <TableCell className="font-medium">{partner.name}</TableCell>
                            <TableCell>{partner.email || '-'}</TableCell>
                            <TableCell>{partner.phone || partner.mobile || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={partner.is_company ? 'default' : 'secondary'}>
                                {partner.is_company ? 'Company' : 'Contact'}
                              </Badge>
                            </TableCell>
                            <TableCell>{partner.city || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Odoo Products</CardTitle>
              <CardDescription>
                View products from your Odoo system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          Loading products...
                        </TableCell>
                      </TableRow>
                    ) : odooProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No products found. Test your connection first.
                        </TableCell>
                      </TableRow>
                    ) : (
                      odooProducts.slice(0, 100).map((product: any) => (
                        <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                          <TableCell className="font-mono text-sm">{product.id}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.default_code || '-'}</TableCell>
                          <TableCell>${product.list_price?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>
                            {product.categ_id ? product.categ_id[1] : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.type}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Odoo Sale Orders</CardTitle>
              <CardDescription>
                View recent sale orders and quotations from Odoo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Sales Rep</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          Loading orders...
                        </TableCell>
                      </TableRow>
                    ) : odooOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No orders found. Test your connection first.
                        </TableCell>
                      </TableRow>
                    ) : (
                      odooOrders.slice(0, 100).map((order: any) => (
                        <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                          <TableCell className="font-mono font-medium">{order.name}</TableCell>
                          <TableCell>{order.partner_id?.[1] || '-'}</TableCell>
                          <TableCell>
                            {order.date_order ? format(new Date(order.date_order), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              order.state === 'sale' ? 'default' :
                              order.state === 'done' ? 'secondary' :
                              order.state === 'cancel' ? 'destructive' :
                              'outline'
                            }>
                              {order.state === 'draft' ? 'Quotation' :
                               order.state === 'sent' ? 'Sent' :
                               order.state === 'sale' ? 'Sales Order' :
                               order.state === 'done' ? 'Done' :
                               order.state === 'cancel' ? 'Cancelled' :
                               order.state}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${order.amount_total?.toFixed(2) || '0.00'}
                          </TableCell>
                          <TableCell>{order.user_id?.[1] || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
