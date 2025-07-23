import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Download, ArrowLeft, Users, UserCheck, UserX, Clock, TrendingUp, Package, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  createdAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/approve`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User approved",
        description: "User has been approved and can now access the system",
      });
    },
    onError: (error) => {
      toast({
        title: "Error approving user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/reject`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User rejected",
        description: "User has been rejected and cannot access the system",
      });
    },
    onError: (error) => {
      toast({
        title: "Error rejecting user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Download all data as ZIP
  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/admin/download-all-data', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download data');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success", 
        description: "All database files downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download data",
        variant: "destructive",
      });
    }
  };

  const downloadCompetitorPricing = async () => {
    try {
      const response = await fetch('/api/competitor-pricing');
      if (!response.ok) {
        throw new Error('Failed to fetch competitor pricing data');
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        toast({
          title: "No Data",
          description: "No competitor pricing data available",
          variant: "destructive",
        });
        return;
      }

      // Helper function to parse dimensions into width and height/length
      const parseDimensions = (item: any) => {
        // Use stored width/length/unit if available (newer format)
        if (item.width && item.length && item.unit) {
          return {
            width: `${item.width} ${item.unit}`,
            height: `${item.length} ${item.unit}`
          };
        }
        
        // Fallback to parsing dimensions string (older format)
        const match = item.dimensions.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*(in|ft)/);
        if (match) {
          const [, width, height, unit] = match;
          return {
            width: `${width} ${unit}`,
            height: `${height} ${unit}`
          };
        }
        
        // Fallback for unparseable dimensions
        return {
          width: item.dimensions,
          height: ""
        };
      };
      
      const headers = ["Source", "Type", "Width", "Height/Length", "Pack Qty", "Input Price", "Thickness", "Product Kind", "Surface Finish", "Supplier", "Info From", "Price/in²", "Price/ft²", "Price/m²", "Notes", "Date"];
      const csvContent = [
        headers.join(","),
        ...data.map((item: any) => {
          const { width, height } = parseDimensions(item);
          return [
            item.source,
            item.type,
            width,
            height,
            item.packQty,
            `$${item.inputPrice.toFixed(2)}`,
            `"${item.thickness}"`,
            `"${item.productKind}"`,
            `"${item.surfaceFinish}"`,
            `"${item.supplierInfo}"`,
            `"${item.infoReceivedFrom}"`,
            `$${item.pricePerSqIn.toFixed(4)}`,
            `$${item.pricePerSqFt.toFixed(4)}`,
            `$${item.pricePerSqMeter.toFixed(4)}`,
            `"${item.notes}"`,
            new Date(item.timestamp).toLocaleDateString()
          ].join(",");
        })
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `competitor-pricing-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Competitor pricing data downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download competitor pricing data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center justify-center gap-2">
              <Settings className="h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              User management and data export tools
            </p>
          </div>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Important Notice */}
        <Alert className="mb-8">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> For data uploads and management, use the dedicated Customer Management, Product Management, and Price Management apps from the dashboard.
          </AlertDescription>
        </Alert>

        {/* User Management Section */}
        <Card className="shadow-lg mb-8">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {usersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === 'approved' ? 'default' : 
                              user.status === 'pending' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {user.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => approveUserMutation.mutate(user.id)}
                                disabled={approveUserMutation.isPending}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectUserMutation.mutate(user.id)}
                                disabled={rejectUserMutation.isPending}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Data Export */}
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Export All Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-4">
                    Download all database files in a ZIP archive. This includes customer data, product data, pricing data, and quote records.
                  </p>
                  <p className="text-xs text-gray-500">
                    Note: For individual data management, use the dedicated Customer Management, Product Management, and Price Management apps from the dashboard.
                  </p>
                </div>

                <Button
                  onClick={handleDownloadData}
                  className="w-full"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Database Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Access dedicated management apps for specific tasks:
                </div>
                
                <div className="space-y-3">
                  <Link href="/customer-management">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Customer Management
                    </Button>
                  </Link>
                  
                  <Link href="/product-management">
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      Product Management
                    </Button>
                  </Link>
                  
                  <Link href="/price-management">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Price Management
                    </Button>
                  </Link>

                  <Button
                    onClick={downloadCompetitorPricing}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Download Competitor Data CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}