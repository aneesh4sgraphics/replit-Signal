import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  User,
  MapPin,
  Globe,
  DollarSign,
  UserCog,
  Check,
  X,
  Printer,
  FileText,
  Package,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Edit2,
  Save,
  ExternalLink,
} from "lucide-react";

interface SpotlightTask {
  id: string;
  customerId: string;
  taskType: 'hygiene' | 'sales';
  taskSubtype: string;
  priority: number;
  customer: {
    id: string;
    company: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    website: string | null;
    salesRepId: string | null;
    salesRepName: string | null;
    pricingTier: string | null;
  };
  context?: {
    quoteId?: number;
    followUpId?: number;
    followUpTitle?: string;
    followUpDueDate?: string;
  };
}

interface SpotlightSession {
  totalCompleted: number;
  hygieneCompleted: number;
  salesCompleted: number;
}

const PRICING_TIERS = ['retail', 'wholesale', 'distributor', 'vip'];

const taskTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  'hygiene_sales_rep': { label: 'Assign Sales Rep', icon: UserCog, color: '#6366F1' },
  'hygiene_pricing_tier': { label: 'Set Pricing Tier', icon: DollarSign, color: '#8B5CF6' },
  'hygiene_name': { label: 'Complete Name', icon: User, color: '#0EA5E9' },
  'hygiene_company': { label: 'Add Company', icon: Building2, color: '#14B8A6' },
  'hygiene_phone': { label: 'Add Phone', icon: Phone, color: '#F59E0B' },
  'hygiene_website': { label: 'Add Website', icon: Globe, color: '#EC4899' },
  'hygiene_address': { label: 'Complete Address', icon: MapPin, color: '#EF4444' },
  'sales_follow_up': { label: 'Follow Up', icon: RefreshCw, color: '#22C55E' },
  'sales_quote_follow_up': { label: 'Quote Follow Up', icon: FileText, color: '#3B82F6' },
  'sales_outreach': { label: 'Outreach', icon: Mail, color: '#F97316' },
  'sales_call': { label: 'Make Call', icon: Phone, color: '#A855F7' },
  'sales_sample_send': { label: 'Send Sample', icon: Package, color: '#06B6D4' },
};

export default function Spotlight() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState("");
  const [showQuotePopup, setShowQuotePopup] = useState(false);

  const { data: currentTask, isLoading, refetch } = useQuery<{ task: SpotlightTask | null; session: SpotlightSession; allDone: boolean }>({
    queryKey: ['/api/spotlight/current'],
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });

  const { data: salesReps = [] } = useQuery<{ id: string; email: string; firstName?: string; lastName?: string }[]>({
    queryKey: ['/api/admin/users'],
    staleTime: 5 * 60 * 1000,
  });

  const completeMutation = useMutation({
    mutationFn: async (data: { taskId: string; field?: string; value?: string }) => {
      const res = await apiRequest('POST', '/api/spotlight/complete', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
      setEditingField(null);
      setFieldValue("");
      toast({ title: "Task completed", description: "Moving to next task..." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const skipMutation = useMutation({
    mutationFn: async (data: { taskId: string; reason: string }) => {
      const res = await apiRequest('POST', '/api/spotlight/skip', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
      toast({ title: "Task skipped", description: "Moving to next task..." });
    },
  });

  const handleComplete = (field?: string, value?: string) => {
    if (!currentTask?.task) return;
    completeMutation.mutate({ taskId: currentTask.task.id, field, value });
  };

  const handleSkip = (reason: string = 'not_now') => {
    if (!currentTask?.task) return;
    skipMutation.mutate({ taskId: currentTask.task.id, reason });
  };

  const startEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setFieldValue(currentValue || "");
  };

  const saveField = () => {
    if (editingField && fieldValue.trim()) {
      handleComplete(editingField, fieldValue.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111111] mx-auto mb-4" />
          <p className="text-[#666666] text-sm font-medium">Loading Spotlight...</p>
        </div>
      </div>
    );
  }

  if (currentTask?.allDone || !currentTask?.task) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-[#EAEAEA]">
          <div className="w-20 h-20 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[#22C55E]" />
          </div>
          <CardTitle className="text-2xl mb-2 text-[#111111]">All Caught Up!</CardTitle>
          <CardDescription className="text-[#666666] mb-6">
            You've completed all available tasks for now. Great work!
          </CardDescription>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-[#EAEAEA] text-[#111111] hover:bg-[#F2F2F2]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Button onClick={() => refetch()} className="bg-[#111111] hover:bg-[#333333] text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const task = currentTask.task;
  const taskInfo = taskTypeLabels[task.taskSubtype] || { label: task.taskSubtype, icon: AlertCircle, color: '#666666' };
  const TaskIcon = taskInfo.icon;
  const customer = task.customer;
  const customerName = customer.company || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown';

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#EAEAEA] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-[#666666] hover:text-[#111111] hover:bg-[#F2F2F2]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-[#111111]">Spotlight</h1>
              <p className="text-sm text-[#666666]">One client at a time</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#666666]">
            <span className="font-medium">{currentTask.session.totalCompleted} completed</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 pt-6">
        {/* Task Type Badge */}
        <div className="flex items-center gap-2 mb-4">
          <Badge 
            style={{ backgroundColor: taskInfo.color + '20', color: taskInfo.color, borderColor: taskInfo.color }}
            className="font-medium px-3 py-1"
          >
            <TaskIcon className="w-4 h-4 mr-1.5" />
            {taskInfo.label}
          </Badge>
          {task.taskType === 'hygiene' && (
            <Badge variant="outline" className="text-[#666666] border-[#EAEAEA]">Data Cleanup</Badge>
          )}
          {task.taskType === 'sales' && (
            <Badge variant="outline" className="text-[#666666] border-[#EAEAEA]">Sales Activity</Badge>
          )}
        </div>

        {/* Main Client Card */}
        <Card className="border-[#EAEAEA] mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl text-[#111111] flex items-center gap-2">
                  {customerName}
                  <Link href={`/clients/${customer.id}`}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-[#999999] hover:text-[#111111]">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardTitle>
                {customer.email && (
                  <CardDescription className="flex items-center gap-1.5 mt-1">
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </CardDescription>
                )}
              </div>
              {/* Print Label Button for physical tasks */}
              {(task.taskSubtype === 'sales_sample_send' || task.taskSubtype === 'sales_swatch_send') && customer.address1 && (
                <Button variant="outline" size="sm" className="border-[#EAEAEA] text-[#666666] hover:text-[#111111]">
                  <Printer className="w-4 h-4 mr-1.5" />
                  Print Label
                </Button>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            {/* Task-specific content */}
            {task.taskSubtype === 'hygiene_sales_rep' && (
              <div className="space-y-4">
                <Label className="text-sm text-[#666666]">Assign a sales rep to this client:</Label>
                <Select onValueChange={(value) => handleComplete('salesRepId', value)}>
                  <SelectTrigger className="border-[#EAEAEA]">
                    <SelectValue placeholder="Select sales rep..." />
                  </SelectTrigger>
                  <SelectContent>
                    {salesReps.filter(r => r.email).map((rep) => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.firstName && rep.lastName ? `${rep.firstName} ${rep.lastName}` : rep.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {task.taskSubtype === 'hygiene_pricing_tier' && (
              <div className="space-y-4">
                <Label className="text-sm text-[#666666]">Set the pricing tier for this client:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PRICING_TIERS.map((tier) => (
                    <Button
                      key={tier}
                      variant="outline"
                      className="border-[#EAEAEA] text-[#111111] hover:bg-[#F2F2F2] capitalize h-12"
                      onClick={() => handleComplete('pricingTier', tier)}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {tier}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {(task.taskSubtype === 'hygiene_name' || task.taskSubtype === 'hygiene_company' || 
              task.taskSubtype === 'hygiene_phone' || task.taskSubtype === 'hygiene_website') && (
              <div className="space-y-4">
                <Label className="text-sm text-[#666666]">{taskInfo.label}:</Label>
                <div className="flex gap-2">
                  <Input
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder={`Enter ${taskInfo.label.toLowerCase()}...`}
                    className="border-[#EAEAEA]"
                    onKeyDown={(e) => e.key === 'Enter' && saveField()}
                  />
                  <Button 
                    onClick={saveField}
                    className="bg-[#111111] hover:bg-[#333333] text-white"
                    disabled={!fieldValue.trim()}
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save
                  </Button>
                </div>
              </div>
            )}

            {task.taskSubtype === 'hygiene_address' && (
              <div className="space-y-4">
                <Label className="text-sm text-[#666666]">Complete the address for this client:</Label>
                <div className="grid gap-3">
                  <Input 
                    placeholder="Address Line 1" 
                    className="border-[#EAEAEA]"
                    value={editingField === 'address1' ? fieldValue : customer.address1 || ''}
                    onFocus={() => startEditField('address1', customer.address1 || '')}
                    onChange={(e) => setFieldValue(e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input 
                      placeholder="City" 
                      className="border-[#EAEAEA]"
                      value={editingField === 'city' ? fieldValue : customer.city || ''}
                      onFocus={() => startEditField('city', customer.city || '')}
                      onChange={(e) => setFieldValue(e.target.value)}
                    />
                    <Input 
                      placeholder="State" 
                      className="border-[#EAEAEA]"
                      value={editingField === 'state' ? fieldValue : customer.state || ''}
                      onFocus={() => startEditField('state', customer.state || '')}
                      onChange={(e) => setFieldValue(e.target.value)}
                    />
                    <Input 
                      placeholder="ZIP" 
                      className="border-[#EAEAEA]"
                      value={editingField === 'zip' ? fieldValue : customer.zip || ''}
                      onFocus={() => startEditField('zip', customer.zip || '')}
                      onChange={(e) => setFieldValue(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={saveField}
                    className="bg-[#111111] hover:bg-[#333333] text-white"
                    disabled={!fieldValue.trim()}
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {task.taskSubtype === 'sales_quote_follow_up' && task.context?.quoteId && (
              <div className="space-y-4">
                <Label className="text-sm text-[#666666]">Follow up on quote #{task.context.quoteId}:</Label>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    className="border-[#EAEAEA] text-[#111111] hover:bg-[#F2F2F2]"
                    onClick={() => setShowQuotePopup(true)}
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    View Quote
                  </Button>
                  <Button 
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
                    onClick={() => handleComplete()}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            )}

            {(task.taskSubtype === 'sales_follow_up' || task.taskSubtype === 'sales_outreach' || 
              task.taskSubtype === 'sales_call') && (
              <div className="space-y-4">
                {task.context?.followUpTitle && (
                  <div className="bg-[#F7F7F7] rounded-lg p-4 mb-4">
                    <p className="font-medium text-[#111111]">{task.context.followUpTitle}</p>
                    {task.context.followUpDueDate && (
                      <p className="text-sm text-[#666666] mt-1">
                        Due: {new Date(task.context.followUpDueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button 
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white flex-1"
                    onClick={() => handleComplete()}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Mark Complete
                  </Button>
                </div>
              </div>
            )}

            {(task.taskSubtype === 'sales_sample_send' || task.taskSubtype === 'sales_swatch_send') && (
              <div className="space-y-4">
                {!customer.address1 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Address Required</p>
                        <p className="text-sm text-amber-700 mt-1">Add a shipping address before printing the label.</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  {customer.address1 && (
                    <Button variant="outline" className="border-[#EAEAEA] text-[#111111]">
                      <Printer className="w-4 h-4 mr-1.5" />
                      Print Label
                    </Button>
                  )}
                  <Button 
                    className="bg-[#22C55E] hover:bg-[#16A34A] text-white flex-1"
                    onClick={() => handleComplete()}
                    disabled={!customer.address1}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {customer.address1 ? 'Mark Sent' : 'Add Address First'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Info Summary */}
        <Card className="border-[#EAEAEA]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#666666]">Client Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#999999]">Sales Rep:</span>
                <p className="font-medium text-[#111111]">{customer.salesRepName || '—'}</p>
              </div>
              <div>
                <span className="text-[#999999]">Pricing Tier:</span>
                <p className="font-medium text-[#111111] capitalize">{customer.pricingTier || '—'}</p>
              </div>
              <div>
                <span className="text-[#999999]">Phone:</span>
                <p className="font-medium text-[#111111]">{customer.phone || '—'}</p>
              </div>
              <div>
                <span className="text-[#999999]">Website:</span>
                <p className="font-medium text-[#111111]">{customer.website || '—'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[#999999]">Address:</span>
                <p className="font-medium text-[#111111]">
                  {customer.address1 ? (
                    `${customer.address1}${customer.city ? `, ${customer.city}` : ''}${customer.state ? `, ${customer.state}` : ''} ${customer.zip || ''}`
                  ) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skip Button */}
        <div className="mt-6 flex justify-center">
          <Button 
            variant="ghost" 
            className="text-[#999999] hover:text-[#666666]"
            onClick={() => handleSkip('not_now')}
          >
            Skip for now
          </Button>
        </div>
      </div>

      {/* Quote Preview Dialog */}
      <Dialog open={showQuotePopup} onOpenChange={setShowQuotePopup}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quote #{task.context?.quoteId}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[#666666]">Quote details would be displayed here...</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuotePopup(false)}>Close</Button>
            <Button 
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
              onClick={() => {
                setShowQuotePopup(false);
                handleComplete();
              }}
            >
              <Check className="w-4 h-4 mr-1.5" />
              Mark Follow Up Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
