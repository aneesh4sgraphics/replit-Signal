import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, 
  Settings, 
  Link2, 
  CheckCircle, 
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertTriangle,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

const ALL_PRODUCT_CATEGORIES = [
  'Commodity Cut-Size', 'Specialty Coated', 'Cover Stock', 'Text Weight',
  'Digital Toner', 'Digital Inkjet', 'Large Format', 'Labels',
  'Envelopes', 'Carbonless', 'Synthetic', 'Photo Paper'
];

export default function ShopifySettingsPage() {
  const { toast } = useToast();
  const [shopDomain, setShopDomain] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [newMappingTitle, setNewMappingTitle] = useState("");
  const [newMappingType, setNewMappingType] = useState("");
  const [newMappingCategory, setNewMappingCategory] = useState("");

  const { data: settings, isLoading: settingsLoading } = useQuery<{
    shopDomain?: string;
    webhookSecret?: string;
    isActive?: boolean;
    lastSyncAt?: string;
    ordersProcessed?: number;
  }>({
    queryKey: ['/api/shopify/settings'],
    refetchOnMount: true,
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ['/api/shopify/orders'],
  });

  const { data: mappings = [] } = useQuery<any[]>({
    queryKey: ['/api/shopify/product-mappings'],
  });

  // Sync form state with loaded settings
  if (settings && shopDomain === "" && settings.shopDomain) {
    setShopDomain(settings.shopDomain);
  }
  if (settings && webhookSecret === "" && settings.webhookSecret) {
    setWebhookSecret(settings.webhookSecret);
  }
  if (settings && !isActive && settings.isActive) {
    setIsActive(settings.isActive);
  }

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/shopify/settings', { shopDomain, webhookSecret, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopify/settings'] });
      toast({ title: "Settings saved!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createMappingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/shopify/product-mappings', {
        shopifyProductTitle: newMappingTitle || null,
        shopifyProductType: newMappingType || null,
        categoryName: newMappingCategory,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopify/product-mappings'] });
      setNewMappingTitle("");
      setNewMappingType("");
      setNewMappingCategory("");
      toast({ title: "Mapping created!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/shopify/product-mappings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopify/product-mappings'] });
      toast({ title: "Mapping deleted" });
    },
  });

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/shopify/orders`
    : '/api/webhooks/shopify/orders';

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({ title: "Copied to clipboard!" });
  };

  const unmatchedOrders = orders.filter(o => !o.customerId);

  if (settingsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-testid="text-page-title">
            <ShoppingCart className="h-6 w-6" />
            Shopify Integration
          </h1>
          <p className="text-gray-500 mt-1">Connect your Shopify store to sync orders and trigger coaching actions</p>
        </div>
        <Badge variant={settings?.isActive ? "default" : "secondary"} className="text-sm">
          {settings?.isActive ? (
            <><CheckCircle className="h-4 w-4 mr-1" /> Connected</>
          ) : (
            <><XCircle className="h-4 w-4 mr-1" /> Disconnected</>
          )}
        </Badge>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="mappings">Product Mappings</TabsTrigger>
          <TabsTrigger value="orders">
            Orders
            {unmatchedOrders.length > 0 && (
              <Badge variant="destructive" className="ml-2">{unmatchedOrders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Connection Settings
                </CardTitle>
                <CardDescription>Configure your Shopify store connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopDomain">Shop Domain</Label>
                  <Input
                    id="shopDomain"
                    placeholder="yourstore.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    data-testid="input-shop-domain"
                  />
                  <p className="text-xs text-gray-500">Your Shopify store URL</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    placeholder="shpss_..."
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    data-testid="input-webhook-secret"
                  />
                  <p className="text-xs text-gray-500">From Shopify Admin → Settings → Notifications → Webhooks</p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label>Enable Integration</Label>
                    <p className="text-xs text-gray-500">Activate Shopify order syncing</p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    data-testid="switch-active"
                  />
                </div>

                <Button 
                  onClick={() => saveSettingsMutation.mutate()} 
                  className="w-full"
                  disabled={saveSettingsMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Webhook Setup
                </CardTitle>
                <CardDescription>Configure webhooks in your Shopify admin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <p className="text-sm font-medium">Your Webhook URL:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white p-2 rounded border overflow-x-auto">
                      {webhookUrl}
                    </code>
                    <Button variant="outline" size="sm" onClick={copyWebhookUrl} data-testid="button-copy-webhook">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Go to Shopify Admin → Settings → Notifications</li>
                    <li>Scroll down to "Webhooks" section</li>
                    <li>Click "Create webhook"</li>
                    <li>Select Event: <strong>Order creation</strong></li>
                    <li>Format: JSON</li>
                    <li>Paste the webhook URL above</li>
                    <li>Click "Save"</li>
                    <li>Repeat for "Order payment" event</li>
                  </ol>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a 
                    href={`https://${shopDomain || 'admin.shopify.com'}/admin/settings/notifications`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid="link-shopify-admin"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Shopify Admin
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Sync Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold" data-testid="text-orders-processed">{settings?.ordersProcessed || 0}</p>
                    <p className="text-sm text-gray-500">Orders Processed</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold" data-testid="text-orders-matched">{orders.filter(o => o.customerId).length}</p>
                    <p className="text-sm text-gray-500">Matched to CRM</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600" data-testid="text-orders-unmatched">{unmatchedOrders.length}</p>
                    <p className="text-sm text-gray-500">Need Matching</p>
                  </div>
                </div>
                {settings?.lastSyncAt && (
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Last sync: {format(new Date(settings.lastSyncAt), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mappings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Category Mappings
              </CardTitle>
              <CardDescription>
                Map Shopify product titles/types to coaching categories. When an order contains matching products, 
                the customer's category trust will automatically advance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">How it works:</p>
                    <p>When a paid order comes in from Shopify, the system checks each line item's title and product type against these mappings. If a match is found, the customer's category trust automatically advances to "Adopted".</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <Label>Product Title Contains</Label>
                  <Input
                    placeholder="e.g., 24lb Bond"
                    value={newMappingTitle}
                    onChange={(e) => setNewMappingTitle(e.target.value)}
                    data-testid="input-mapping-title"
                  />
                </div>
                <div>
                  <Label>Product Type Contains</Label>
                  <Input
                    placeholder="e.g., Cut Sheet"
                    value={newMappingType}
                    onChange={(e) => setNewMappingType(e.target.value)}
                    data-testid="input-mapping-type"
                  />
                </div>
                <div>
                  <Label>Maps to Category</Label>
                  <Select value={newMappingCategory} onValueChange={setNewMappingCategory}>
                    <SelectTrigger data-testid="select-mapping-category">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_PRODUCT_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => createMappingMutation.mutate()}
                  disabled={!newMappingCategory || (!newMappingTitle && !newMappingType) || createMappingMutation.isPending}
                  data-testid="button-add-mapping"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Title Contains</TableHead>
                    <TableHead>Product Type Contains</TableHead>
                    <TableHead>Maps to Category</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No mappings yet. Add mappings above to auto-advance category trust when orders come in.
                      </TableCell>
                    </TableRow>
                  ) : (
                    mappings.map((mapping: any) => (
                      <TableRow key={mapping.id} data-testid={`row-mapping-${mapping.id}`}>
                        <TableCell>{mapping.shopifyProductTitle || '-'}</TableCell>
                        <TableCell>{mapping.shopifyProductType || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{mapping.categoryName}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMappingMutation.mutate(mapping.id)}
                            data-testid={`button-delete-mapping-${mapping.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Shopify Orders</CardTitle>
              <CardDescription>Orders synced from Shopify. Matched orders trigger coaching updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>CRM Match</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No orders synced yet. Configure webhooks in Shopify to start receiving orders.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.slice(0, 50).map((order: any) => (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.companyName || '-'}</TableCell>
                        <TableCell>${order.totalPrice}</TableCell>
                        <TableCell>
                          <Badge variant={order.financialStatus === 'paid' ? 'default' : 'secondary'}>
                            {order.financialStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.customerId ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" /> Matched
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Unmatched
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {order.shopifyCreatedAt ? format(new Date(order.shopifyCreatedAt), 'MMM d, yyyy') : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
