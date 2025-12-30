import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Printer,
  FileText,
  Package,
  Phone,
  Mail,
  UserCheck,
  ShoppingCart,
  RefreshCw,
  Heart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface JourneyStage {
  id: string;
  label: string;
  icon: LucideIcon;
  showCount?: boolean;
}

const JOURNEY_STAGES: JourneyStage[] = [
  { id: 'machine_profile', label: 'Machine Profile', icon: Printer },
  { id: 'quotes', label: 'Quotes', icon: FileText, showCount: true },
  { id: 'press_kit', label: 'Press Kit', icon: Package, showCount: true },
  { id: 'call', label: 'Call', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail, showCount: true },
  { id: 'rep_visit', label: 'Rep Visit', icon: UserCheck },
  { id: 'buyer', label: 'Buyer', icon: ShoppingCart },
  { id: 'try_and_try', label: 'Try & Try', icon: RefreshCw },
  { id: 'dont_worry', label: "Don't Worry", icon: Heart },
];

interface JourneyProgressData {
  stages: Record<string, { completed: boolean; count: number }>;
  totalCompleted: number;
  totalStages: number;
}

interface JourneyProgressProps {
  customerId: string;
}

export default function JourneyProgress({ customerId }: JourneyProgressProps) {
  const { toast } = useToast();

  const { data: progress, isLoading } = useQuery<JourneyProgressData>({
    queryKey: ['/api/crm/journey-progress', customerId],
    queryFn: async () => {
      const res = await fetch(`/api/crm/journey-progress/${customerId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch journey progress');
      return res.json();
    },
  });

  const toggleStageMutation = useMutation({
    mutationFn: async ({ stage, completed }: { stage: string; completed: boolean }) => {
      const endpoint = completed ? 'uncomplete' : 'complete';
      const res = await apiRequest('POST', `/api/crm/journey-progress/${customerId}/${endpoint}`, { stage });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/journey-progress', customerId] });
      toast({ title: "Updated", description: "Journey stage updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update stage", variant: "destructive" });
    },
  });

  const isClickableStage = (stageId: string) => {
    return ['call', 'rep_visit', 'buyer', 'try_and_try', 'dont_worry'].includes(stageId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-pulse flex space-x-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="py-3 px-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-lg border border-purple-100" data-testid="journey-progress">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">Journey Progress</span>
        <span className="text-xs text-gray-400">{progress.totalCompleted}/{progress.totalStages} complete</span>
      </div>
      <div className="flex items-center justify-between gap-1">
        <TooltipProvider>
          {JOURNEY_STAGES.map((stage, index) => {
            const stageData = progress.stages[stage.id];
            const isCompleted = stageData?.completed || false;
            const count = stageData?.count || 0;
            const isClickable = isClickableStage(stage.id);
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      {stage.showCount && count > 0 && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-purple-500 rounded-full">
                            {count}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          if (isClickable) {
                            toggleStageMutation.mutate({ stage: stage.id, completed: isCompleted });
                          }
                        }}
                        disabled={!isClickable || toggleStageMutation.isPending}
                        className={`
                          w-9 h-9 rounded-full flex items-center justify-center transition-all
                          ${isCompleted 
                            ? 'bg-purple-500 text-white shadow-md' 
                            : 'bg-white text-gray-400 border-2 border-gray-200'
                          }
                          ${isClickable && !toggleStageMutation.isPending
                            ? 'hover:scale-110 cursor-pointer' 
                            : ''
                          }
                          ${!isClickable ? 'cursor-default' : ''}
                        `}
                        data-testid={`journey-stage-${stage.id}`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p className="font-medium">{stage.label}</p>
                    {stage.showCount && (
                      <p className="text-gray-500">{count} {stage.label.toLowerCase()}</p>
                    )}
                    {isCompleted ? (
                      <p className="text-green-600">Completed</p>
                    ) : (
                      <p className="text-gray-400">Not completed</p>
                    )}
                    {isClickable && (
                      <p className="text-purple-500 text-[10px] mt-1">Click to toggle</p>
                    )}
                  </TooltipContent>
                </Tooltip>
                {index < JOURNEY_STAGES.length - 1 && (
                  <div className={`w-3 h-0.5 mx-0.5 ${isCompleted ? 'bg-purple-300' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
