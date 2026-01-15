import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
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
  ExternalLink,
  MessageSquare,
  Send,
  PhoneCall,
  PhoneMissed,
  Voicemail,
  Clock,
  Calendar,
  HelpCircle,
  Truck,
  Tag,
  CheckCircle,
  Target,
} from "lucide-react";

type TaskBucket = 'calls' | 'follow_ups' | 'outreach' | 'data_hygiene' | 'enablement';

interface TaskOutcome {
  id: string;
  label: string;
  icon?: string;
  nextAction?: {
    type: 'schedule_follow_up' | 'send_email' | 'mark_complete' | 'no_action';
    daysUntil?: number;
    taskType?: string;
  };
}

interface SpotlightTask {
  id: string;
  customerId: string;
  bucket: TaskBucket;
  taskSubtype: string;
  priority: number;
  whyNow: string;
  outcomes: TaskOutcome[];
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
    province: string | null;
    zip: string | null;
    country: string | null;
    website: string | null;
    salesRepId: string | null;
    salesRepName: string | null;
    pricingTier: string | null;
  };
  context?: {
    followUpId?: number;
    followUpTitle?: string;
    followUpDueDate?: string;
    lastContact?: string;
  };
}

interface BucketQuota {
  bucket: TaskBucket;
  target: number;
  completed: number;
  skipped: number;
}

interface SpotlightSession {
  totalCompleted: number;
  totalTarget: number;
  buckets: BucketQuota[];
  dayComplete: boolean;
}

const BUCKET_INFO: Record<TaskBucket, { label: string; icon: any; color: string }> = {
  calls: { label: 'Calls', icon: PhoneCall, color: '#A855F7' },
  follow_ups: { label: 'Follow-ups', icon: RefreshCw, color: '#22C55E' },
  outreach: { label: 'Outreach', icon: Send, color: '#F97316' },
  data_hygiene: { label: 'Data Hygiene', icon: UserCog, color: '#6366F1' },
  enablement: { label: 'Enablement', icon: Package, color: '#06B6D4' },
};

const OUTCOME_ICONS: Record<string, any> = {
  'check': Check,
  'user-check': CheckCircle,
  'x': X,
  'tag': Tag,
  'building': Building2,
  'truck': Truck,
  'help-circle': HelpCircle,
  'mail': Mail,
  'clock': Clock,
  'phone': Phone,
  'voicemail': Voicemail,
  'phone-missed': PhoneMissed,
  'calendar': Calendar,
  'send': Send,
  'package': Package,
  'file-text': FileText,
};

const PRICING_TIERS = ['retail', 'wholesale', 'distributor', 'vip'];

export default function Spotlight() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fieldValue, setFieldValue] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

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
    mutationFn: async (data: { taskId: string; outcomeId: string; field?: string; value?: string; notes?: string }) => {
      const res = await apiRequest('POST', '/api/spotlight/complete', data);
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/spotlight/current'] });
      setFieldValue("");
      setNotes("");
      setShowNotes(false);
      
      if (result.nextFollowUp) {
        const date = new Date(result.nextFollowUp.date).toLocaleDateString();
        toast({ 
          title: "Task completed", 
          description: `Follow-up scheduled for ${date}` 
        });
      } else {
        toast({ title: "Task completed", description: "Moving to next moment..." });
      }
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
      toast({ title: "Skipped", description: "Moving to next moment..." });
    },
  });

  const handleOutcome = (outcomeId: string, field?: string, value?: string) => {
    if (!currentTask?.task) return;
    completeMutation.mutate({ 
      taskId: currentTask.task.id, 
      outcomeId,
      field, 
      value,
      notes: notes.trim() || undefined,
    });
  };

  const handleSkip = () => {
    if (!currentTask?.task) return;
    skipMutation.mutate({ taskId: currentTask.task.id, reason: 'not_now' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#111111] mx-auto mb-4" />
          <p className="text-[#666666] text-sm font-medium">Loading Spotlight...</p>
        </div>
      </div>
    );
  }

  const session = currentTask?.session;
  const progress = session ? (session.totalCompleted / session.totalTarget) * 100 : 0;

  if (currentTask?.allDone || currentTask?.session?.dayComplete) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-[#EAEAEA] bg-white">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl mb-2 text-[#111111]">Day Complete!</CardTitle>
          <CardDescription className="text-[#666666] mb-6 text-base">
            You've finished your {session?.totalTarget || 30} moments for today. 
            <br />Great work building momentum!
          </CardDescription>
          
          {session && (
            <div className="grid grid-cols-5 gap-2 mb-6">
              {session.buckets.map((bucket) => {
                const info = BUCKET_INFO[bucket.bucket];
                const BucketIcon = info.icon;
                return (
                  <div key={bucket.bucket} className="text-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1"
                      style={{ backgroundColor: info.color + '20' }}
                    >
                      <BucketIcon className="w-5 h-5" style={{ color: info.color }} />
                    </div>
                    <p className="text-xs font-medium text-[#111111]">{bucket.completed}/{bucket.target}</p>
                    <p className="text-xs text-[#999999]">{info.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-[#EAEAEA] text-[#111111] hover:bg-[#F2F2F2]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentTask?.task) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-[#EAEAEA] bg-white">
          <div className="w-20 h-20 rounded-full bg-[#F2F2F2] flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-[#999999]" />
          </div>
          <CardTitle className="text-xl mb-2 text-[#111111]">No Tasks Available</CardTitle>
          <CardDescription className="text-[#666666] mb-6">
            Check back later or refresh to find new moments.
          </CardDescription>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-[#EAEAEA]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button onClick={() => refetch()} className="bg-[#111111] hover:bg-[#333333] text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const task = currentTask.task;
  const bucketInfo = BUCKET_INFO[task.bucket];
  const BucketIcon = bucketInfo.icon;
  const customer = task.customer;
  const customerName = customer.company || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Client';

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header with Progress */}
      <div className="bg-white border-b border-[#EAEAEA] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-[#666666] hover:text-[#111111] h-8 w-8">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-base font-semibold text-[#111111]">Spotlight</h1>
                <p className="text-xs text-[#666666]">
                  {session?.totalCompleted || 0} of {session?.totalTarget || 30} moments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session?.buckets.map((bucket) => {
                const info = BUCKET_INFO[bucket.bucket];
                const BIcon = info.icon;
                const isActive = bucket.bucket === task.bucket;
                return (
                  <div 
                    key={bucket.bucket}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isActive ? 'ring-2' : ''}`}
                    style={{ 
                      backgroundColor: info.color + '15',
                      color: info.color,
                      ringColor: info.color,
                    }}
                  >
                    <BIcon className="w-3 h-3" />
                    <span className="font-medium">{bucket.completed}/{bucket.target}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pt-6">
        {/* Why Now Card */}
        <div 
          className="rounded-xl p-4 mb-4 flex items-start gap-3"
          style={{ backgroundColor: bucketInfo.color + '10', borderLeft: `4px solid ${bucketInfo.color}` }}
        >
          <BucketIcon className="w-5 h-5 mt-0.5" style={{ color: bucketInfo.color }} />
          <div>
            <p className="font-medium text-[#111111] text-sm">{bucketInfo.label}</p>
            <p className="text-[#666666] text-sm mt-0.5">{task.whyNow}</p>
          </div>
        </div>

        {/* Main Client Card */}
        <Card className="border-[#EAEAEA] bg-white mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl text-[#111111] flex items-center gap-2">
                  {customerName}
                  <Link href={`/clients?id=${customer.id}&from=spotlight`}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-[#999999] hover:text-[#111111]">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-[#666666]">
                  {customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {customer.email}
                    </span>
                  )}
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {customer.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            {/* Follow-up context */}
            {task.context?.followUpTitle && (
              <div className="bg-[#F7F7F7] rounded-lg p-3 mb-4">
                <p className="font-medium text-[#111111] text-sm">{task.context.followUpTitle}</p>
                {task.context.followUpDueDate && (
                  <p className="text-xs text-[#666666] mt-1">
                    Due: {new Date(task.context.followUpDueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Data Hygiene: Sales Rep Assignment */}
            {task.taskSubtype === 'hygiene_sales_rep' && (
              <div className="space-y-3">
                <Label className="text-sm text-[#666666]">Assign sales rep:</Label>
                <Select onValueChange={(value) => handleOutcome('assigned', 'salesRepId', value)}>
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

            {/* Data Hygiene: Pricing Tier */}
            {task.taskSubtype === 'hygiene_pricing_tier' && (
              <div className="grid grid-cols-2 gap-2">
                {task.outcomes.filter(o => o.id !== 'skip').map((outcome) => (
                  <Button
                    key={outcome.id}
                    variant="outline"
                    className="border-[#EAEAEA] text-[#111111] hover:bg-[#F2F2F2] h-11 capitalize"
                    onClick={() => handleOutcome(outcome.id, 'pricingTier', outcome.id)}
                  >
                    {outcome.icon && OUTCOME_ICONS[outcome.icon] && (
                      (() => {
                        const Icon = OUTCOME_ICONS[outcome.icon];
                        return <Icon className="w-4 h-4 mr-2" />;
                      })()
                    )}
                    {outcome.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Data Hygiene: Email */}
            {task.taskSubtype === 'hygiene_email' && (
              <div className="space-y-3">
                <Label className="text-sm text-[#666666]">Enter primary email:</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder="email@company.com"
                    className="border-[#EAEAEA]"
                    onKeyDown={(e) => e.key === 'Enter' && fieldValue.trim() && handleOutcome('found', 'email', fieldValue.trim())}
                  />
                  <Button 
                    onClick={() => handleOutcome('found', 'email', fieldValue.trim())}
                    className="bg-[#111111] hover:bg-[#333333] text-white"
                    disabled={!fieldValue.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Data Hygiene: Name, Company, Phone */}
            {(task.taskSubtype === 'hygiene_name' || task.taskSubtype === 'hygiene_company' || task.taskSubtype === 'hygiene_phone') && (
              <div className="space-y-3">
                <Label className="text-sm text-[#666666]">
                  {task.taskSubtype === 'hygiene_name' && 'Enter contact name:'}
                  {task.taskSubtype === 'hygiene_company' && 'Enter company name:'}
                  {task.taskSubtype === 'hygiene_phone' && 'Enter phone number:'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder={
                      task.taskSubtype === 'hygiene_name' ? 'First Last' :
                      task.taskSubtype === 'hygiene_company' ? 'Company Name' : 
                      '(555) 555-5555'
                    }
                    className="border-[#EAEAEA]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && fieldValue.trim()) {
                        const field = task.taskSubtype === 'hygiene_name' ? 'firstName' :
                                      task.taskSubtype === 'hygiene_company' ? 'company' : 'phone';
                        handleOutcome('found', field, fieldValue.trim());
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      const field = task.taskSubtype === 'hygiene_name' ? 'firstName' :
                                    task.taskSubtype === 'hygiene_company' ? 'company' : 'phone';
                      handleOutcome('found', field, fieldValue.trim());
                    }}
                    className="bg-[#111111] hover:bg-[#333333] text-white"
                    disabled={!fieldValue.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Outcome Buttons for non-data-hygiene tasks */}
            {task.bucket !== 'data_hygiene' && task.outcomes.length > 0 && (
              <div className="space-y-2">
                {task.outcomes.map((outcome) => {
                  const OutcomeIcon = outcome.icon ? OUTCOME_ICONS[outcome.icon] : Check;
                  const isPositive = ['connected', 'completed', 'sent', 'done', 'email_sent', 'called', 'already_has', 'already_engaged'].includes(outcome.id);
                  const isNegative = ['bad_number', 'not_interested'].includes(outcome.id);
                  
                  return (
                    <Button
                      key={outcome.id}
                      variant={isPositive ? 'default' : 'outline'}
                      className={`w-full h-12 justify-start ${
                        isPositive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                        isNegative ? 'border-red-200 text-red-600 hover:bg-red-50' :
                        'border-[#EAEAEA] text-[#111111] hover:bg-[#F2F2F2]'
                      }`}
                      onClick={() => handleOutcome(outcome.id)}
                    >
                      {OutcomeIcon && <OutcomeIcon className="w-4 h-4 mr-3" />}
                      <span className="flex-1 text-left">{outcome.label}</span>
                      {outcome.nextAction?.daysUntil && (
                        <span className="text-xs opacity-70 ml-2">
                          +{outcome.nextAction.daysUntil}d
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Notes (optional) */}
        <div className="mb-4">
          {!showNotes ? (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-[#999999] hover:text-[#666666] w-full"
              onClick={() => setShowNotes(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Add a note (optional)
            </Button>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Quick note about this interaction..."
                className="border-[#EAEAEA] min-h-[80px] text-sm"
              />
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-[#999999]"
                  onClick={() => { setShowNotes(false); setNotes(""); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Client Details Summary */}
        <Card className="border-[#EAEAEA] bg-white/50">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[#999999] text-xs">Sales Rep</span>
                <p className="font-medium text-[#111111]">{customer.salesRepName || '—'}</p>
              </div>
              <div>
                <span className="text-[#999999] text-xs">Pricing Tier</span>
                <p className="font-medium text-[#111111] capitalize">{customer.pricingTier || '—'}</p>
              </div>
              {customer.address1 && (
                <div className="col-span-2">
                  <span className="text-[#999999] text-xs">Address</span>
                  <p className="font-medium text-[#111111]">
                    {customer.address1}{customer.city ? `, ${customer.city}` : ''}{customer.province ? `, ${customer.province}` : ''} {customer.zip || ''}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skip Button */}
        <div className="mt-6 flex justify-center pb-8">
          <Button 
            variant="ghost" 
            className="text-[#999999] hover:text-[#666666]"
            onClick={handleSkip}
            disabled={skipMutation.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Skip this one
          </Button>
        </div>
      </div>
    </div>
  );
}
