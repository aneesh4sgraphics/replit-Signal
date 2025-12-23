import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Package,
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Star,
  Calendar,
  User,
  Building2,
  FileText,
  AlertCircle,
} from "lucide-react";
import type { Customer, SampleRequest, TestOutcome, ProductPricingMaster } from "@shared/schema";

const SAMPLE_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-gray-500', icon: Clock },
  shipped: { label: 'Shipped', color: 'bg-blue-500', icon: Truck },
  testing: { label: 'Testing', color: 'bg-yellow-500', icon: FlaskConical },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
};

const TEST_RESULT_CONFIG = {
  pass: { label: 'Pass', color: 'bg-green-500', icon: CheckCircle },
  fail: { label: 'Fail', color: 'bg-red-500', icon: XCircle },
  conditional: { label: 'Conditional', color: 'bg-yellow-500', icon: AlertCircle },
};

export default function CRMSamplesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<SampleRequest | null>(null);
  const [newSampleData, setNewSampleData] = useState({
    customerId: '',
    productName: '',
    productId: null as number | null,
    competitorPaper: '',
    jobDescription: '',
    plannedTestDate: '',
    testOwnerName: '',
    testOwnerRole: '',
    quantity: '',
    notes: '',
  });
  const [newTestData, setNewTestData] = useState({
    testDate: '',
    pressman: '',
    overallResult: '',
    runScore: '',
    printScore: '',
    finishScore: '',
    notes: '',
  });
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  // Fetch data
  const { data: samples = [], isLoading: samplesLoading } = useQuery<SampleRequest[]>({
    queryKey: ['/api/crm/sample-requests'],
  });

  const { data: testOutcomes = [] } = useQuery<TestOutcome[]>({
    queryKey: ['/api/crm/test-outcomes'],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const { data: products = [] } = useQuery<ProductPricingMaster[]>({
    queryKey: ['/api/product-pricing-database'],
  });

  // Create sample mutation
  const createSampleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/crm/sample-requests', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/sample-requests'] });
      setIsCreateDialogOpen(false);
      resetNewSampleData();
      toast({ title: "Success", description: "Sample request created" });
      logActivity('SAMPLE_REQUEST_CREATE', 'Created new sample request');
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create sample request", variant: "destructive" });
    },
  });

  // Update sample mutation
  const updateSampleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PUT', `/api/crm/sample-requests/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/sample-requests'] });
      setSelectedSample(null);
      toast({ title: "Success", description: "Sample request updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update sample request", variant: "destructive" });
    },
  });

  // Create test outcome mutation
  const createTestMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/crm/test-outcomes', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/test-outcomes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/sample-requests'] });
      setIsTestDialogOpen(false);
      setSelectedSample(null);
      resetNewTestData();
      toast({ title: "Success", description: "Test outcome recorded" });
      logActivity('TEST_OUTCOME_CREATE', 'Recorded sample test outcome');
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to record test outcome", variant: "destructive" });
    },
  });

  const resetNewSampleData = () => {
    setNewSampleData({
      customerId: '',
      productName: '',
      productId: null,
      competitorPaper: '',
      jobDescription: '',
      plannedTestDate: '',
      testOwnerName: '',
      testOwnerRole: '',
      quantity: '',
      notes: '',
    });
  };

  const resetNewTestData = () => {
    setNewTestData({
      testDate: '',
      pressman: '',
      overallResult: '',
      runScore: '',
      printScore: '',
      finishScore: '',
      notes: '',
    });
  };

  // Customer map
  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c])), [customers]);

  // Test outcomes map
  const testsByRequest = useMemo(() => {
    const map = new Map<number, TestOutcome[]>();
    testOutcomes.forEach(t => {
      const existing = map.get(t.sampleRequestId) || [];
      map.set(t.sampleRequestId, [...existing, t]);
    });
    return map;
  }, [testOutcomes]);

  // Filter samples
  const filteredSamples = useMemo(() => {
    return samples.filter(s => {
      const customer = customerMap.get(s.customerId);
      const matchesSearch = !searchTerm || 
        s.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.competitorPaper?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer?.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [samples, searchTerm, statusFilter, customerMap]);

  // Stats
  const stats = useMemo(() => ({
    total: samples.length,
    pending: samples.filter(s => s.status === 'pending').length,
    shipped: samples.filter(s => s.status === 'shipped').length,
    testing: samples.filter(s => s.status === 'testing').length,
    completed: samples.filter(s => s.status === 'completed').length,
    passRate: testOutcomes.length > 0 
      ? Math.round((testOutcomes.filter(t => t.overallResult === 'pass').length / testOutcomes.length) * 100)
      : 0,
  }), [samples, testOutcomes]);

  const handleCreateSample = () => {
    if (!newSampleData.customerId) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
      return;
    }
    createSampleMutation.mutate({
      ...newSampleData,
      quantity: newSampleData.quantity ? parseInt(newSampleData.quantity) : null,
      plannedTestDate: newSampleData.plannedTestDate || null,
    });
  };

  const handleRecordTest = () => {
    if (!selectedSample || !newTestData.overallResult) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }
    createTestMutation.mutate({
      sampleRequestId: selectedSample.id,
      customerId: selectedSample.customerId,
      testDate: newTestData.testDate || null,
      pressman: newTestData.pressman || null,
      overallResult: newTestData.overallResult,
      runScore: newTestData.runScore ? parseInt(newTestData.runScore) : null,
      printScore: newTestData.printScore ? parseInt(newTestData.printScore) : null,
      finishScore: newTestData.finishScore ? parseInt(newTestData.finishScore) : null,
      notes: newTestData.notes || null,
    });
    // Update sample status to completed
    updateSampleMutation.mutate({
      id: selectedSample.id,
      data: { status: 'completed' },
    });
  };

  return (
    <div className="space-y-6" data-testid="crm-samples-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">Sample Requests & Testing</h1>
          <p className="text-gray-500">Manage paper sample requests and track test outcomes</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="btn-new-sample">
          <Plus className="h-4 w-4 mr-1" />
          New Sample Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Total Requests</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Shipped</p>
                <p className="text-xl font-bold">{stats.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-500">Testing</p>
                <p className="text-xl font-bold">{stats.testing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Pass Rate</p>
                <p className="text-xl font-bold">{stats.passRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by product, competitor, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(SAMPLE_STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sample Requests List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {filteredSamples.map(sample => {
                const customer = customerMap.get(sample.customerId);
                const statusConfig = SAMPLE_STATUS_CONFIG[sample.status as keyof typeof SAMPLE_STATUS_CONFIG] || SAMPLE_STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                const tests = testsByRequest.get(sample.id) || [];
                
                return (
                  <div 
                    key={sample.id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSample(sample)}
                    data-testid={`sample-row-${sample.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{sample.productName || 'Untitled Sample'}</h3>
                          <Badge className={`${statusConfig.color} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {tests.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {tests.length} test{tests.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {customer?.company || 'Unknown'}
                          </span>
                          {sample.competitorPaper && (
                            <span className="flex items-center gap-1">
                              vs. {sample.competitorPaper}
                            </span>
                          )}
                          {sample.quantity && (
                            <span className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {sample.quantity} sheets
                            </span>
                          )}
                          {sample.plannedTestDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(sample.plannedTestDate).toLocaleDateString()}
                            </span>
                          )}
                          {sample.testOwnerName && (
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {sample.testOwnerName}
                            </span>
                          )}
                        </div>
                        {sample.jobDescription && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-1">{sample.jobDescription}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {sample.status !== 'completed' && sample.status !== 'cancelled' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSample(sample);
                              setIsTestDialogOpen(true);
                            }}
                            data-testid={`btn-record-test-${sample.id}`}
                          >
                            <FlaskConical className="h-4 w-4 mr-1" />
                            Record Test
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Test Results Preview */}
                    {tests.length > 0 && (
                      <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                        {tests.map(test => {
                          const resultConfig = TEST_RESULT_CONFIG[test.overallResult as keyof typeof TEST_RESULT_CONFIG];
                          return resultConfig ? (
                            <Badge key={test.id} className={`${resultConfig.color} text-white`}>
                              {resultConfig.label}
                              {test.runScore && test.printScore && test.finishScore && (
                                <span className="ml-1 opacity-80">
                                  ({test.runScore}/{test.printScore}/{test.finishScore})
                                </span>
                              )}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredSamples.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No sample requests found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Sample Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Sample Request</DialogTitle>
            <DialogDescription>Create a new paper sample request for testing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Customer *</Label>
              <Select value={newSampleData.customerId} onValueChange={(v) => setNewSampleData(prev => ({ ...prev, customerId: v }))}>
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
              <Label>Product Name *</Label>
              <Input
                value={newSampleData.productName}
                onChange={(e) => setNewSampleData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="e.g., Graffiti Matte 80lb"
                data-testid="input-product-name"
              />
            </div>
            <div>
              <Label>Competitor Paper</Label>
              <Input
                value={newSampleData.competitorPaper}
                onChange={(e) => setNewSampleData(prev => ({ ...prev, competitorPaper: e.target.value }))}
                placeholder="e.g., Domtar Lynx"
              />
            </div>
            <div>
              <Label>Job Description</Label>
              <Textarea
                value={newSampleData.jobDescription}
                onChange={(e) => setNewSampleData(prev => ({ ...prev, jobDescription: e.target.value }))}
                placeholder="Describe the job/application..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity (sheets)</Label>
                <Input
                  type="number"
                  value={newSampleData.quantity}
                  onChange={(e) => setNewSampleData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="500"
                />
              </div>
              <div>
                <Label>Planned Test Date</Label>
                <Input
                  type="date"
                  value={newSampleData.plannedTestDate}
                  onChange={(e) => setNewSampleData(prev => ({ ...prev, plannedTestDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Test Owner Name</Label>
                <Input
                  value={newSampleData.testOwnerName}
                  onChange={(e) => setNewSampleData(prev => ({ ...prev, testOwnerName: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label>Test Owner Role</Label>
                <Input
                  value={newSampleData.testOwnerRole}
                  onChange={(e) => setNewSampleData(prev => ({ ...prev, testOwnerRole: e.target.value }))}
                  placeholder="Press Operator"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newSampleData.notes}
                onChange={(e) => setNewSampleData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSample} disabled={createSampleMutation.isPending} data-testid="btn-confirm-create">
              {createSampleMutation.isPending ? 'Creating...' : 'Create Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={(open) => { setIsTestDialogOpen(open); if (!open) setSelectedSample(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Test Outcome</DialogTitle>
            <DialogDescription>
              {selectedSample?.productName} - {customerMap.get(selectedSample?.customerId || '')?.company}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Test Date</Label>
                <Input
                  type="date"
                  value={newTestData.testDate}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, testDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Pressman</Label>
                <Input
                  value={newTestData.pressman}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, pressman: e.target.value }))}
                  placeholder="Operator name"
                />
              </div>
            </div>
            <div>
              <Label>Overall Result *</Label>
              <Select value={newTestData.overallResult} onValueChange={(v) => setNewTestData(prev => ({ ...prev, overallResult: v }))}>
                <SelectTrigger data-testid="select-result">
                  <SelectValue placeholder="Select result..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Run Score (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTestData.runScore}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, runScore: e.target.value }))}
                  placeholder="8"
                />
              </div>
              <div>
                <Label>Print Score (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTestData.printScore}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, printScore: e.target.value }))}
                  placeholder="9"
                />
              </div>
              <div>
                <Label>Finish Score (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newTestData.finishScore}
                  onChange={(e) => setNewTestData(prev => ({ ...prev, finishScore: e.target.value }))}
                  placeholder="7"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newTestData.notes}
                onChange={(e) => setNewTestData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Test observations, issues, recommendations..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsTestDialogOpen(false); setSelectedSample(null); }}>Cancel</Button>
            <Button onClick={handleRecordTest} disabled={createTestMutation.isPending} data-testid="btn-confirm-test">
              {createTestMutation.isPending ? 'Saving...' : 'Record Outcome'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sample Detail Dialog */}
      <Dialog open={!!selectedSample && !isTestDialogOpen} onOpenChange={() => setSelectedSample(null)}>
        <DialogContent className="max-w-lg">
          {selectedSample && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSample.productName}</DialogTitle>
                <DialogDescription>
                  {customerMap.get(selectedSample.customerId)?.company || 'Unknown Customer'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">Status:</Label>
                  <Select 
                    value={selectedSample.status}
                    onValueChange={(v) => updateSampleMutation.mutate({ id: selectedSample.id, data: { status: v } })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SAMPLE_STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSample.competitorPaper && (
                  <div>
                    <Label className="text-xs text-gray-500">Competitor Paper</Label>
                    <p>{selectedSample.competitorPaper}</p>
                  </div>
                )}
                {selectedSample.jobDescription && (
                  <div>
                    <Label className="text-xs text-gray-500">Job Description</Label>
                    <p className="text-sm">{selectedSample.jobDescription}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Quantity</Label>
                    <p>{selectedSample.quantity || '-'} sheets</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Planned Test Date</Label>
                    <p>{selectedSample.plannedTestDate ? new Date(selectedSample.plannedTestDate).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Test Owner</Label>
                    <p>{selectedSample.testOwnerName || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Role</Label>
                    <p>{selectedSample.testOwnerRole || '-'}</p>
                  </div>
                </div>
                {selectedSample.notes && (
                  <div>
                    <Label className="text-xs text-gray-500">Notes</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedSample.notes}</p>
                  </div>
                )}
                {/* Test Results */}
                {testsByRequest.get(selectedSample.id)?.length ? (
                  <div>
                    <Label className="text-xs text-gray-500">Test Results</Label>
                    <div className="space-y-2 mt-1">
                      {testsByRequest.get(selectedSample.id)?.map(test => {
                        const resultConfig = TEST_RESULT_CONFIG[test.overallResult as keyof typeof TEST_RESULT_CONFIG];
                        return (
                          <div key={test.id} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              {resultConfig && <Badge className={`${resultConfig.color} text-white`}>{resultConfig.label}</Badge>}
                              {test.testDate && <span className="text-xs text-gray-500">{new Date(test.testDate).toLocaleDateString()}</span>}
                            </div>
                            <div className="flex gap-4 text-sm">
                              <span>Run: {test.runScore}/10</span>
                              <span>Print: {test.printScore}/10</span>
                              <span>Finish: {test.finishScore}/10</span>
                            </div>
                            {test.notes && <p className="text-sm text-gray-600 mt-2">{test.notes}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSample(null)}>Close</Button>
                {selectedSample.status !== 'completed' && selectedSample.status !== 'cancelled' && (
                  <Button onClick={() => setIsTestDialogOpen(true)}>
                    <FlaskConical className="h-4 w-4 mr-1" />
                    Record Test
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}