import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  DollarSign, 
  Activity, 
  Clock, 
  Cpu, 
  Mail, 
  Bot,
  ArrowLeft,
  RefreshCw,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CostSummary {
  summary: {
    total_cost: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_calls: number;
  };
  byService: Array<{
    operation: string;
    call_count: number;
    cost: number;
  }>;
  settings: Record<string, { value: string; description: string | null; updatedAt: string | null }>;
  syncIntervals: {
    gmail: number;
    odoo: number;
    dripEmail: number;
  };
  aiFeatures: {
    emailAnalysis: boolean;
    ragChatbot: boolean;
  };
}

export default function CostDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: costData, isLoading, refetch } = useQuery<CostSummary>({
    queryKey: ["/api/admin/cost-summary"],
    enabled: !!user,
    refetchInterval: 60000,
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest("PUT", `/api/admin/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cost-summary"] });
      toast({
        title: "Setting updated",
        description: "The setting has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  const toggleAIFeature = (key: string, currentValue: boolean) => {
    updateSettingMutation.mutate({ key, value: currentValue ? "false" : "true" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalCost = Number(costData?.summary?.total_cost || 0);
  const totalCalls = Number(costData?.summary?.total_calls || 0);
  const avgCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;
  const potentialSavings = costData?.aiFeatures?.emailAnalysis ? totalCost * 0.4 : 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Cost Dashboard</h1>
              <p className="text-gray-500">Monitor and optimize API spending</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Total Cost (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">${totalCost.toFixed(4)}</p>
              <p className="text-xs text-gray-500">{totalCalls.toLocaleString()} API calls</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Avg Cost/Call
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">${avgCostPerCall.toFixed(6)}</p>
              <p className="text-xs text-gray-500">Using gpt-4o-mini (16x cheaper)</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-500" />
                Tokens Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">
                {((Number(costData?.summary?.total_input_tokens || 0) + Number(costData?.summary?.total_output_tokens || 0)) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500">
                In: {(Number(costData?.summary?.total_input_tokens || 0) / 1000).toFixed(1)}K / 
                Out: {(Number(costData?.summary?.total_output_tokens || 0) / 1000).toFixed(1)}K
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50/80 backdrop-blur-sm border-green-200/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Potential Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-700">${potentialSavings.toFixed(4)}</p>
              <p className="text-xs text-green-600">If AI analysis disabled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                AI Features (Cost Controls)
              </CardTitle>
              <CardDescription>
                Toggle AI features on/off to control costs. Rule-based detection still works when AI is disabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">AI Email Analysis</p>
                    <p className="text-sm text-gray-500">
                      OpenAI analyzes emails for sales insights
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={costData?.aiFeatures?.emailAnalysis ? "default" : "secondary"}>
                    {costData?.aiFeatures?.emailAnalysis ? "On" : "Off"}
                  </Badge>
                  <Switch
                    checked={costData?.aiFeatures?.emailAnalysis}
                    onCheckedChange={() => toggleAIFeature("ai_email_analysis_enabled", costData?.aiFeatures?.emailAnalysis || false)}
                    disabled={updateSettingMutation.isPending}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">RAG Chatbot</p>
                    <p className="text-sm text-gray-500">
                      AI-powered product Q&A assistant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={costData?.aiFeatures?.ragChatbot ? "default" : "secondary"}>
                    {costData?.aiFeatures?.ragChatbot ? "On" : "Off"}
                  </Badge>
                  <Switch
                    checked={costData?.aiFeatures?.ragChatbot}
                    onCheckedChange={() => toggleAIFeature("rag_chatbot_enabled", costData?.aiFeatures?.ragChatbot || false)}
                    disabled={updateSettingMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Sync Intervals
              </CardTitle>
              <CardDescription>
                Current background sync frequencies. Lower frequency = lower costs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Gmail Sync</p>
                    <p className="text-sm text-gray-500">Fetch new emails</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Every {costData?.syncIntervals?.gmail || 30} min
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Odoo Sync</p>
                    <p className="text-sm text-gray-500">Sync customers & products</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Daily (24h)
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Drip Campaigns</p>
                    <p className="text-sm text-gray-500">Send scheduled emails</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  Every {costData?.syncIntervals?.dripEmail || 10} min
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Cost by Operation (7 days)
            </CardTitle>
            <CardDescription>
              Breakdown of API costs by operation type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {costData?.byService && costData.byService.length > 0 ? (
              <div className="space-y-3">
                {costData.byService.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{service.operation?.replace(/_/g, ' ') || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{Number(service.call_count).toLocaleString()} calls</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">${Number(service.cost).toFixed(4)}</p>
                      <p className="text-xs text-gray-500">
                        ${(Number(service.cost) / Number(service.call_count || 1)).toFixed(6)}/call
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="font-medium text-gray-700">No API costs tracked yet</p>
                <p className="text-sm text-gray-500">Costs will appear here as API calls are made</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50/80 backdrop-blur-sm border-blue-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-5 w-5" />
              Current Optimizations Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Using gpt-4o-mini (16x cheaper than gpt-4o)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Batch processing emails (5 per API call)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Gmail sync interval: 30 minutes (was 15 min)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Max 20 emails analyzed per sync cycle
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Coaching tips cached for 5 days
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Marketing/notification emails excluded from analysis
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
