import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Sun,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Package,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  TrendingUp,
  RefreshCw,
  Flame,
  Users,
  Target,
  Zap,
  DollarSign,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Printer,
  Settings,
} from "lucide-react";
import { Link } from "wouter";
import { format, formatDistanceToNow, isToday, differenceInDays } from "date-fns";
import type { FollowUpTask, CustomerActivityEvent, Customer } from "@shared/schema";
import { QuoteFollowUpNotifications, QuoteFollowUpReminders } from "./QuoteFollowUpNotifications";

interface AuthUser {
  email: string;
  role: string;
  status: string;
  id?: string;
}

interface DashboardStats {
  todayTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  idleAccounts: number;
  pendingSamples: number;
  recentActivity: number;
}

interface CriticalClient {
  customerId: string;
  displayName: string;
  score: number;
  reasonCode: string;
  reasonText: string;
  recommendedAction: string;
  priority: 'critical' | 'high' | 'medium';
  consequence?: string;
  daysUntilRisk?: number;
}

export default function StartYourDayDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [taskView, setTaskView] = useState<'my' | 'team'>('my');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  const [showMoreSections, setShowMoreSections] = useState(false);

  const { data: currentUser } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const currentUserEmail = currentUser?.email;

  const { data: todayTasks, isLoading: loadingToday } = useQuery<FollowUpTask[]>({
    queryKey: ["/api/customer-activity/follow-ups/today"],
  });

  const { data: overdueTasks, isLoading: loadingOverdue } = useQuery<FollowUpTask[]>({
    queryKey: ["/api/customer-activity/follow-ups/overdue"],
  });

  const { data: allTasks } = useQuery<FollowUpTask[]>({
    queryKey: ["/api/customer-activity/follow-ups"],
  });

  const { data: recentEvents } = useQuery<CustomerActivityEvent[]>({
    queryKey: ["/api/customer-activity/events"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ["/api/customer-activity/dashboard-stats"],
  });

  const { data: criticalClients, isLoading: loadingCriticalClients } = useQuery<CriticalClient[]>({
    queryKey: ["/api/dashboard/critical-clients"],
  });

  const filterTasksByOwnership = (tasks: FollowUpTask[] | undefined, isMyTasks: boolean) => {
    if (!tasks) return [];
    if (!isAdmin) return tasks;
    
    return tasks.filter(task => {
      const isAssignedToMe = task.assignedTo === currentUserEmail || 
                             task.assignedTo === currentUser?.id;
      const isUnassigned = !task.assignedTo;
      
      if (isMyTasks) {
        return isAssignedToMe || isUnassigned;
      } else {
        return !isAssignedToMe && !isUnassigned;
      }
    });
  };

  const myTodayTasks = filterTasksByOwnership(todayTasks, true);
  const teamTodayTasks = filterTasksByOwnership(todayTasks, false);
  const myOverdueTasks = filterTasksByOwnership(overdueTasks, true);
  const teamOverdueTasks = filterTasksByOwnership(overdueTasks, false);
  const myPendingTasks = filterTasksByOwnership(allTasks?.filter(t => t.status === 'pending'), true);
  const teamPendingTasks = filterTasksByOwnership(allTasks?.filter(t => t.status === 'pending'), false);

  const displayedTodayTasks = taskView === 'my' ? myTodayTasks : teamTodayTasks;
  const displayedOverdueTasks = taskView === 'my' ? myOverdueTasks : teamOverdueTasks;

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest("POST", `/api/customer-activity/follow-ups/${taskId}/complete`, {
        completionNotes: "Completed from dashboard",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-activity/follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer-activity/follow-ups/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer-activity/follow-ups/overdue"] });
      toast({
        title: "Task completed",
        description: "The follow-up task has been marked as complete.",
      });
    },
  });

  const handleCompleteAction = (actionId: string) => {
    setCompletedActions(prev => {
      const newSet = new Set(prev);
      newSet.add(actionId);
      return newSet;
    });
    toast({
      title: "Action completed!",
      description: "Great work! Moving to the next priority.",
    });
  };

  useEffect(() => {
    if (completedActions.size >= 3 && !celebrationShown) {
      setShowCelebration(true);
      setCelebrationShown(true);
    }
  }, [completedActions.size, celebrationShown]);

  const handleLoadMoreTasks = () => {
    setShowCelebration(false);
    setCompletedActions(new Set());
    setCelebrationShown(false);
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/critical-clients"] });
    toast({
      title: "Ready for more!",
      description: "Here are your next 3 priorities.",
    });
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers?.find(c => c.id === customerId);
    if (customer) {
      if (customer.company) return customer.company;
      if (customer.firstName || customer.lastName) {
        return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
      }
    }
    return customerId;
  };

  const getTaskTypeIcon = (taskType: string | undefined | null) => {
    if (!taskType) return Clock;
    if (taskType.includes('quote')) return FileText;
    if (taskType.includes('sample')) return Package;
    if (taskType.includes('call')) return Phone;
    if (taskType.includes('email')) return Mail;
    return Clock;
  };

  const getActionIcon = (reasonCode: string | undefined) => {
    if (!reasonCode) return Target;
    if (reasonCode.includes('quote')) return FileText;
    if (reasonCode.includes('press') || reasonCode.includes('test')) return Printer;
    if (reasonCode.includes('sample')) return Package;
    if (reasonCode.includes('machine')) return Settings;
    if (reasonCode.includes('call')) return Phone;
    if (reasonCode.includes('email')) return Mail;
    return Target;
  };

  const getConsequence = (client: CriticalClient): string => {
    if (client.consequence) return client.consequence;
    
    const code = client.reasonCode || '';
    if (code.includes('quote') && code.includes('risk')) return "Quote will auto-close as lost in 2 days";
    if (code.includes('quote')) return "Deal may go cold without follow-up";
    if (code.includes('press') || code.includes('test')) return "Customer waiting - delays hurt trust";
    if (code.includes('overdue')) return "Client relationship at risk";
    if (code.includes('hot')) return "Hot lead - competitor may win";
    if (code.includes('machine')) return "Cannot recommend products without machine info";
    return "Opportunity may be missed";
  };

  const top3Actions = criticalClients
    ?.filter(c => !completedActions.has(c.customerId))
    ?.slice(0, 3) || [];

  const atRiskDeals = criticalClients
    ?.filter(c => 
      c.reasonCode?.includes('quote') || 
      c.reasonCode?.includes('sample') || 
      c.reasonCode?.includes('test') ||
      c.priority === 'critical'
    ) || [];

  const pendingTasks = allTasks?.filter(t => t.status === 'pending') || [];
  const completedToday = allTasks?.filter(t => 
    t.status === 'completed' && 
    t.completedAt && 
    isToday(new Date(t.completedAt))
  ) || [];

  const stats: DashboardStats = dashboardStats || {
    todayTasks: displayedTodayTasks?.length || 0,
    overdueTasks: displayedOverdueTasks?.length || 0,
    pendingTasks: pendingTasks.length,
    idleAccounts: 0,
    pendingSamples: 0,
    recentActivity: recentEvents?.length || 0,
  };

  if (loadingToday || loadingOverdue || loadingCriticalClients) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const renderActivityItem = (event: CustomerActivityEvent) => {
    const eventDate = new Date(event.eventDate || event.createdAt!);
    const getEventIcon = () => {
      if (event.eventType.includes('quote')) return FileText;
      if (event.eventType.includes('sample')) return Package;
      if (event.eventType.includes('call')) return Phone;
      if (event.eventType.includes('email')) return Mail;
      return Clock;
    };
    const EventIcon = getEventIcon();
    
    return (
      <div 
        key={event.id}
        data-testid={`activity-item-${event.id}`}
        className="flex items-start gap-3 p-3 border-b last:border-0"
      >
        <div className="p-2 rounded-full bg-muted">
          <EventIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{event.title}</p>
          <p className="text-sm text-muted-foreground">{getCustomerName(event.customerId)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(eventDate, { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  };

  const renderTaskCard = (task: FollowUpTask, isOverdue: boolean = false) => {
    const TaskIcon = getTaskTypeIcon(task.taskType);
    const dueDate = new Date(task.dueDate);
    
    return (
      <div 
        key={task.id}
        data-testid={`task-card-${task.id}`}
        className={`p-4 border rounded-lg transition-all hover:shadow-md ${
          isOverdue ? 'border-red-200 bg-red-50/50' : 'border-border bg-card'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${isOverdue ? 'bg-red-100' : 'bg-muted'}`}>
              <TaskIcon className={`h-4 w-4 ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/clients?customer=${task.customerId}`}>
                <p className="font-medium hover:text-primary cursor-pointer">{task.title}</p>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-xs">
                  {isOverdue ? 'Overdue' : format(dueDate, 'MMM d')}
                </Badge>
                {task.priority && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {task.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => completeTaskMutation.mutate(task.id)}
            disabled={completeTaskMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="start-your-day-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
            <Zap className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Your Focus Today</h1>
            <p className="text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d')} • {completedActions.size} of 3 actions done
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex bg-muted rounded-lg p-1" data-testid="task-view-toggle">
              <Button
                variant={taskView === 'my' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTaskView('my')}
                className="gap-2"
                data-testid="btn-my-tasks"
              >
                <User className="h-4 w-4" />
                My Tasks
              </Button>
              <Button
                variant={taskView === 'team' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTaskView('team')}
                className="gap-2"
                data-testid="btn-team-tasks"
              >
                <Users className="h-4 w-4" />
                Team
              </Button>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/dashboard/critical-clients"] });
              queryClient.invalidateQueries({ queryKey: ["/api/customer-activity"] });
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* TOP 3 ACTIONS - The Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="top-3-actions">
        {top3Actions.length > 0 ? (
          top3Actions.map((client, index) => {
            const ActionIcon = getActionIcon(client.reasonCode);
            const isSystemAction = client.customerId.startsWith('system-action-');
            const consequence = getConsequence(client);
            
            const priorityColors = {
              critical: 'from-red-500 to-red-600 border-red-300',
              high: 'from-orange-500 to-amber-500 border-orange-300',
              medium: 'from-blue-500 to-indigo-500 border-blue-300',
            };
            
            const bgColors = {
              critical: 'bg-red-50 hover:bg-red-100',
              high: 'bg-orange-50 hover:bg-orange-100',
              medium: 'bg-blue-50 hover:bg-blue-100',
            };
            
            return (
              <Card 
                key={client.customerId}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${bgColors[client.priority]} border-2 ${
                  client.priority === 'critical' ? 'border-red-200' :
                  client.priority === 'high' ? 'border-orange-200' : 'border-blue-200'
                }`}
                data-testid={`action-card-${index + 1}`}
              >
                {/* Priority indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${priorityColors[client.priority]}`} />
                
                <CardContent className="p-5 pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${
                      client.priority === 'critical' ? 'bg-red-100' :
                      client.priority === 'high' ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      <ActionIcon className={`h-5 w-5 ${
                        client.priority === 'critical' ? 'text-red-600' :
                        client.priority === 'high' ? 'text-orange-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-semibold ${
                        client.priority === 'critical' ? 'border-red-300 text-red-700 bg-red-100' :
                        client.priority === 'high' ? 'border-orange-300 text-orange-700 bg-orange-100' :
                        'border-blue-300 text-blue-700 bg-blue-100'
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                  </div>
                  
                  {/* Client Name */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                    {isSystemAction ? client.reasonText : client.displayName}
                  </h3>
                  
                  {/* Why Now - Reason */}
                  <p className="text-sm text-gray-600 mb-2">
                    {client.reasonText}
                  </p>
                  
                  {/* If Ignored - Consequence */}
                  <div className="flex items-start gap-2 mb-4 p-2 rounded-lg bg-white/60">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-500">
                      If ignored: {consequence}
                    </p>
                  </div>
                  
                  {/* Single CTA */}
                  <div className="flex items-center gap-2">
                    {isSystemAction ? (
                      <Button 
                        className="flex-1"
                        variant="default"
                        onClick={() => handleCompleteAction(client.customerId)}
                      >
                        {client.recommendedAction}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Link href={`/clients?customer=${client.customerId}`} className="flex-1">
                        <Button className="w-full" variant="default">
                          {client.recommendedAction}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCompleteAction(client.customerId);
                      }}
                      data-testid={`complete-action-${index + 1}`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-3 p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800">All caught up!</h3>
            <p className="text-green-600 mt-2">No urgent actions needed right now. Great work!</p>
          </Card>
        )}
      </div>

      {/* AT-RISK DEALS Section */}
      {atRiskDeals.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50" data-testid="at-risk-deals">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-800">At-Risk Deals</CardTitle>
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-100">
                {atRiskDeals.length} deals
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {atRiskDeals.slice(0, 6).map(deal => (
                <Link 
                  key={deal.customerId} 
                  href={`/clients?customer=${deal.customerId}`}
                  className="block"
                >
                  <div className="p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{deal.displayName}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{deal.reasonText}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quote Follow-up Reminders - Compact */}
      <QuoteFollowUpReminders />

      {/* COLLAPSIBLE: Stats & Activity */}
      <Collapsible open={showMoreSections} onOpenChange={setShowMoreSections}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between py-2 text-muted-foreground hover:text-foreground">
            <span className="flex items-center gap-2">
              {showMoreSections ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showMoreSections ? "Hide dashboard details" : "Show dashboard details"}
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span>{stats.todayTasks} tasks today</span>
              <span className={stats.overdueTasks > 0 ? 'text-red-600 font-medium' : ''}>{stats.overdueTasks} overdue</span>
              <span>{completedToday.length} completed</span>
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 mt-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card data-testid="stat-today-tasks">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Today's Tasks</p>
                    <p className="text-2xl font-bold">{stats.todayTasks}</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="stat-overdue-tasks" className={stats.overdueTasks > 0 ? 'border-red-200' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                    <p className={`text-2xl font-bold ${stats.overdueTasks > 0 ? 'text-red-600' : ''}`}>
                      {stats.overdueTasks}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${stats.overdueTasks > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <AlertTriangle className={`h-5 w-5 ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/client-database?filter=hot">
              <Card 
                data-testid="stat-hot-leads" 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  (customers?.filter(c => c.isHotProspect).length || 0) > 0 
                    ? 'border-orange-300 bg-orange-50/50' 
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hot Leads</p>
                      <p className={`text-2xl font-bold ${(customers?.filter(c => c.isHotProspect).length || 0) > 0 ? 'text-orange-600' : ''}`}>
                        {customers?.filter(c => c.isHotProspect).length || 0}
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${(customers?.filter(c => c.isHotProspect).length || 0) > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                      <Flame className={`h-5 w-5 ${(customers?.filter(c => c.isHotProspect).length || 0) > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card data-testid="stat-completed-today">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{completedToday.length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Follow-ups & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {isAdmin && taskView === 'team' ? "Team's Follow-ups" : "Today's Follow-ups"}
                    </CardTitle>
                  </div>
                  <Badge variant="outline">{displayedTodayTasks?.length || 0} tasks</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {displayedTodayTasks && displayedTodayTasks.length > 0 ? (
                    <div className="space-y-3">
                      {displayedTodayTasks.map(task => renderTaskCard(task))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                      <p className="font-medium">All caught up!</p>
                      <p className="text-sm text-muted-foreground">No follow-ups scheduled for today</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {recentEvents && recentEvents.length > 0 ? (
                    <div>
                      {recentEvents.slice(0, 8).map(event => renderActivityItem(event))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="font-medium">No recent activity</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Overdue Tasks */}
          {displayedOverdueTasks && displayedOverdueTasks.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Overdue Tasks
                  </CardTitle>
                  <Badge variant="destructive">{displayedOverdueTasks.length} overdue</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[250px] pr-4">
                  <div className="space-y-3">
                    {displayedOverdueTasks.map(task => renderTaskCard(task, true))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-center gap-2">
              Great momentum!
            </DialogTitle>
            <DialogDescription className="text-lg pt-4">
              You've completed your top 3 actions! Keep the energy going?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="text-6xl mb-4">🎯</div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCelebration(false)}
              className="w-full sm:w-auto"
            >
              Take a break
            </Button>
            <Button
              onClick={handleLoadMoreTasks}
              className="w-full sm:w-auto bg-primary"
            >
              Give me 3 more
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
