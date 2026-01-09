import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow, isPast, format } from "date-fns";
import { 
  Package, 
  CheckCircle2, 
  X, 
  Clock, 
  AlertTriangle,
  Truck,
  Mail,
  Building2,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

interface ShipmentFollowUpTask {
  id: number;
  shipmentType: string;
  carrier: string | null;
  trackingNumber: string | null;
  subject: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  customerCompany: string | null;
  customerId: string | null;
  sentAt: string | null;
  followUpDueDate: string;
  status: string;
  reminderCount: number;
  createdAt: string;
}

const shipmentTypeLabels: Record<string, { label: string; icon: string }> = {
  swatchbook: { label: "Swatchbook", icon: "🎨" },
  press_test_kit: { label: "Press Test Kit", icon: "🧪" },
  samples: { label: "Samples", icon: "📦" },
  package: { label: "Package", icon: "📬" },
};

const carrierLabels: Record<string, string> = {
  ups: "UPS",
  fedex: "FedEx",
  usps: "USPS",
  dhl: "DHL",
};

export default function ShipmentFollowUpWidget() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<ShipmentFollowUpTask[]>({
    queryKey: ["/api/shipment-followups", { status: "pending" }],
    queryFn: async () => {
      const res = await fetch("/api/shipment-followups?status=pending");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest("PATCH", `/api/shipment-followups/${taskId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipment-followups"] });
      toast({
        title: "Task completed",
        description: "Follow-up marked as done!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest("PATCH", `/api/shipment-followups/${taskId}/dismiss`, {
        reason: "Manually dismissed from dashboard",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipment-followups"] });
      toast({
        title: "Task dismissed",
        description: "Follow-up removed from list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to dismiss task",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="border-2 border-dashed border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            Shipment Follow-ups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return null;
  }

  const overdueTasks = tasks.filter(t => isPast(new Date(t.followUpDueDate)));
  const upcomingTasks = tasks.filter(t => !isPast(new Date(t.followUpDueDate)));

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-500" />
            Shipment Follow-ups
            {overdueTasks.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {overdueTasks.length} overdue
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            {tasks.length} pending
          </Badge>
        </div>
        <CardDescription>
          Customers awaiting response after receiving samples
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm font-medium mb-1">
              <AlertTriangle className="h-4 w-4" />
              Overdue - Follow up now!
            </div>
          </div>
        )}

        {tasks.slice(0, 5).map((task) => {
          const isOverdue = isPast(new Date(task.followUpDueDate));
          const typeConfig = shipmentTypeLabels[task.shipmentType] || { label: task.shipmentType, icon: "📦" };

          return (
            <div
              key={task.id}
              className={`p-3 rounded-lg border ${
                isOverdue 
                  ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-700" 
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{typeConfig.icon}</span>
                    <span className="font-medium text-sm truncate">
                      {task.customerCompany || task.recipientName || task.recipientEmail || "Unknown"}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {typeConfig.label}
                    </Badge>
                    {task.carrier && (
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {carrierLabels[task.carrier] || task.carrier}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Sent {task.sentAt ? formatDistanceToNow(new Date(task.sentAt), { addSuffix: true }) : "recently"}
                    </span>
                  </div>

                  <div className={`text-xs mt-1 ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}`}>
                    {isOverdue ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Overdue by {formatDistanceToNow(new Date(task.followUpDueDate))}
                        {task.reminderCount > 0 && ` (reminded ${task.reminderCount}x)`}
                      </span>
                    ) : (
                      <span>Follow up {formatDistanceToNow(new Date(task.followUpDueDate), { addSuffix: true })}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {task.customerId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <Link href={`/clients/${task.customerId}`}>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => completeMutation.mutate(task.id)}
                    disabled={completeMutation.isPending}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                    title="Mark as done"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissMutation.mutate(task.id)}
                    disabled={dismissMutation.isPending}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length > 5 && (
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/gmail-insights">
              View all {tasks.length} follow-ups
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
