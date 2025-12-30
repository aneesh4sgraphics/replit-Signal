import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Phone,
  Copy,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Clock,
  DollarSign,
  Truck,
  Settings,
  Users,
  Calendar,
  ThumbsDown,
} from "lucide-react";
import type { Customer } from "@shared/schema";

const OUTCOME_REASONS = [
  { id: 'price', label: 'Price', icon: DollarSign },
  { id: 'compatibility', label: 'Compatibility', icon: Settings },
  { id: 'moq', label: 'MOQ / Volume', icon: Truck },
  { id: 'lead_time', label: 'Lead Time / Timing', icon: Clock },
  { id: 'has_supplier', label: 'Has Supplier', icon: Users },
  { id: 'not_a_fit', label: 'Not a fit', icon: ThumbsDown },
] as const;

const PROSPECT_SCRIPTS = [
  {
    id: 'permission_opener',
    title: 'Permission opener',
    script: "Hey [Name] — quick check-in. Is this still something you're considering, or should I step back for now?",
  },
  {
    id: 'missing_piece',
    title: 'Missing piece question',
    script: "I feel like we've covered the basics. What am I missing that's keeping this from moving?",
  },
  {
    id: 'compare_inertia',
    title: 'Compare vs inertia',
    script: "Are you comparing us against what you already use, or deciding whether to change at all?",
  },
  {
    id: 'value_vs_budget',
    title: 'Value vs budget',
    script: "When price comes up, is it more about budget, or about whether the value makes sense?",
  },
  {
    id: 'next_step_clarity',
    title: 'Next-step clarity',
    script: "If we were to move forward, what would you need to feel comfortable doing that?",
  },
];

const EXPANSION_SCRIPTS = [
  {
    id: 'low_pressure',
    title: 'Low-pressure expansion',
    script: "You're already using [current category]. Would it be useful if I showed you the closest alternatives we have for [adjacent category]?",
  },
  {
    id: 'standardization',
    title: 'Standardization framing',
    script: "Most shops running [machine type] usually standardize on 2–3 materials. Want me to suggest the simplest set?",
  },
  {
    id: 'blocker_id',
    title: 'Blocker identification',
    script: "What's the main reason you haven't tried [next category] yet — timing, fit, or just no need?",
  },
  {
    id: 'trial_ask',
    title: 'Trial ask',
    script: "Would you be open to a small test pack so you can compare it on your own press?",
  },
  {
    id: 'relationship_move',
    title: 'Relationship move',
    script: "Since you're ordering regularly, would a stocking plan or bundle pricing make your life easier?",
  },
];

const DISTRIBUTOR_SCRIPTS = [
  {
    id: 'fit_demand',
    title: 'Fit + demand',
    script: "What would you need to see to feel confident there's demand for this in your channel?",
  },
  {
    id: 'margin_clarity',
    title: 'Margin clarity',
    script: "Is the hesitation mostly margin structure, or sell-through confidence?",
  },
  {
    id: 'enablement',
    title: 'Enablement',
    script: "If I gave you a simple sell-sheet + sample pack for your reps, would that make it easier to move?",
  },
  {
    id: 'trial_stock',
    title: 'Trial stock',
    script: "Would you consider a small starter stocking order so you can test sell-through?",
  },
  {
    id: 'disqualify',
    title: 'Disqualify politely',
    script: "If this isn't aligned with your category focus right now, should we revisit later or drop it?",
  },
];

const END_CUSTOMER_SCRIPTS = [
  {
    id: 'risk_reduction',
    title: 'Risk reduction',
    script: "What's the biggest risk you're trying to avoid — compatibility, customer acceptance, or downtime?",
  },
  {
    id: 'supplier_lock',
    title: 'Supplier lock-in',
    script: "Are you happy with your current supplier, or just trying to avoid the hassle of switching?",
  },
  {
    id: 'proof_request',
    title: 'Proof request',
    script: "If we ran a quick test and you liked the results, would you be ready to place an order?",
  },
  {
    id: 'timing',
    title: 'Timing',
    script: "Is this a 'not now' problem, or a 'not sure' problem?",
  },
];

interface ConversationCoachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  accountState: string;
  isDistributor: boolean;
  stalledCategories?: string[];
}

export default function ConversationCoachModal({
  open,
  onOpenChange,
  customer,
  accountState,
  isDistributor,
  stalledCategories = [],
}: ConversationCoachModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const { toast } = useToast();

  const isProspect = accountState === 'prospect' || accountState === 'first_trust';
  const defaultTab = isDistributor ? 'distributor' : isProspect ? 'prospect' : 'expansion';

  const logOutcomeMutation = useMutation({
    mutationFn: async (data: { outcome: string; reason?: string }) => {
      const res = await apiRequest('POST', `/api/crm/conversation-outcome/${customer.id}`, {
        outcome: data.outcome,
        reason: data.reason,
        stalledCategories,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/category-trust', customer.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers', customer.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/customer-activity/events'] });
      
      const messages: Record<string, string> = {
        next_step_agreed: 'Great! Next step logged.',
        still_undecided: 'Status updated. Follow-up suggested.',
        not_moving_forward: 'Account paused. Will revisit later.',
      };
      
      toast({
        title: "Outcome logged",
        description: messages[selectedOutcome || ''] || 'Call outcome recorded.',
      });
      
      onOpenChange(false);
      setSelectedOutcome(null);
      setSelectedReason(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log outcome",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string, id: string) => {
    const personalized = text
      .replace('[Name]', customer.firstName || customer.company || 'there')
      .replace('[current category]', stalledCategories[0] || 'your current products')
      .replace('[adjacent category]', 'related products')
      .replace('[next category]', stalledCategories[0] || 'new products')
      .replace('[machine type]', 'your press');
    
    await navigator.clipboard.writeText(personalized);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOutcomeClick = (outcome: string) => {
    if (outcome === 'not_moving_forward') {
      setSelectedOutcome(outcome);
    } else {
      logOutcomeMutation.mutate({ outcome });
    }
  };

  const handleReasonClick = (reason: string) => {
    setSelectedReason(reason);
    logOutcomeMutation.mutate({ outcome: 'not_moving_forward', reason });
  };

  const renderScripts = (scripts: typeof PROSPECT_SCRIPTS) => (
    <div className="space-y-3">
      {scripts.map((script) => (
        <Card key={script.id} className="bg-gray-50/50">
          <CardContent className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 mb-1">{script.title}</p>
                <p className="text-sm text-gray-800 italic">"{script.script}"</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 h-8"
                onClick={() => copyToClipboard(script.script, script.id)}
                data-testid={`copy-script-${script.id}`}
              >
                {copiedId === script.id ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Have a Conversation</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">{customer.company || `${customer.firstName} ${customer.lastName}`}</span>
                <Badge variant="outline" className="text-xs">
                  {isProspect ? 'Prospect' : 'Expansion'}
                </Badge>
                {isDistributor && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    Distributor
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {selectedOutcome === 'not_moving_forward' ? (
          <div className="py-4">
            <p className="text-sm font-medium mb-3">What's the main reason?</p>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOME_REASONS.map((reason) => (
                <Button
                  key={reason.id}
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => handleReasonClick(reason.id)}
                  disabled={logOutcomeMutation.isPending}
                  data-testid={`reason-${reason.id}`}
                >
                  <reason.icon className="h-4 w-4 mr-2 text-gray-500" />
                  {reason.label}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => setSelectedOutcome(null)}
            >
              Back to scripts
            </Button>
          </div>
        ) : (
          <>
            <Tabs defaultValue={defaultTab} className="mt-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="prospect" data-testid="tab-prospect">Prospect</TabsTrigger>
                <TabsTrigger value="expansion" data-testid="tab-expansion">Expansion</TabsTrigger>
                <TabsTrigger value="distributor" data-testid="tab-distributor">Distributor</TabsTrigger>
                <TabsTrigger value="end_customer" data-testid="tab-end-customer">End Customer</TabsTrigger>
              </TabsList>
              <TabsContent value="prospect" className="mt-4">
                {renderScripts(PROSPECT_SCRIPTS)}
              </TabsContent>
              <TabsContent value="expansion" className="mt-4">
                {renderScripts(EXPANSION_SCRIPTS)}
              </TabsContent>
              <TabsContent value="distributor" className="mt-4">
                {renderScripts(DISTRIBUTOR_SCRIPTS)}
              </TabsContent>
              <TabsContent value="end_customer" className="mt-4">
                {renderScripts(END_CUSTOMER_SCRIPTS)}
              </TabsContent>
            </Tabs>

            <div className="border-t pt-4 mt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Call outcome</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1 bg-green-50 border-green-200 hover:bg-green-100"
                  onClick={() => handleOutcomeClick('next_step_agreed')}
                  disabled={logOutcomeMutation.isPending}
                  data-testid="outcome-next-step"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Next step agreed</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1 bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                  onClick={() => handleOutcomeClick('still_undecided')}
                  disabled={logOutcomeMutation.isPending}
                  data-testid="outcome-undecided"
                >
                  <HelpCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Still undecided</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1 bg-red-50 border-red-200 hover:bg-red-100"
                  onClick={() => handleOutcomeClick('not_moving_forward')}
                  disabled={logOutcomeMutation.isPending}
                  data-testid="outcome-not-moving"
                >
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Not moving forward</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
