import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Users,
  SkipForward,
  Clock,
  TrendingUp,
  AlertTriangle,
  Activity,
  Phone,
  Calendar,
  Send,
  RefreshCw,
  Target
} from "lucide-react";

interface AdminSummary {
  avgTasksPerRepPerDay: number;
  skipRate: number;
  avgTimeToFirstAction: string;
  conversionByTaskType: Record<string, { total: number; converted: number; rate: number }>;
  repCount: number;
  totalSessions: number;
}

interface RedFlags {
  highActivityLowOutcome: Array<{ userId: string; email: string; avgTasks: number; conversionRate: number; recommendation: string }>;
  lowActivity: Array<{ userId: string; email: string; avgTasks: number; daysActive: number; recommendation: string }>;
}

const BUCKET_LABELS: Record<string, { label: string; icon: typeof Phone }> = {
  calls: { label: "Calls", icon: Phone },
  follow_ups: { label: "Follow-ups", icon: Calendar },
  outreach: { label: "Outreach", icon: Send },
  data_hygiene: { label: "Data Hygiene", icon: RefreshCw },
  enablement: { label: "Enablement", icon: Target },
};

export default function NowModeAdmin() {
  const [days, setDays] = useState(7);

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<AdminSummary>({
    queryKey: ["/api/now-mode/admin/summary", days],
    queryFn: async () => {
      const res = await fetch(`/api/now-mode/admin/summary?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      return res.json();
    },
  });

  const { data: redFlags, isLoading: flagsLoading, refetch: refetchFlags } = useQuery<RedFlags>({
    queryKey: ["/api/now-mode/admin/red-flags", days],
    queryFn: async () => {
      const res = await fetch(`/api/now-mode/admin/red-flags?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch red flags");
      return res.json();
    },
  });

  const totalRedFlags = (redFlags?.highActivityLowOutcome?.length || 0) + (redFlags?.lowActivity?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">NOW MODE Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            {[7, 14, 30].map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(d)}
                className={days === d ? "bg-purple-600" : ""}
              >
                {d}d
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchSummary(); refetchFlags(); }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {summaryLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary?.avgTasksPerRepPerDay || 0}</div>
                      <div className="text-sm text-gray-500">Avg Tasks/Rep/Day</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <SkipForward className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary?.skipRate || 0}%</div>
                      <div className="text-sm text-gray-500">Skip Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary?.avgTimeToFirstAction || "N/A"}</div>
                      <div className="text-sm text-gray-500">Time to First Action</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary?.repCount || 0}</div>
                      <div className="text-sm text-gray-500">Active Reps ({summary?.totalSessions || 0} sessions)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Conversion by Task Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary?.conversionByTaskType && Object.keys(summary.conversionByTaskType).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(summary.conversionByTaskType).map(([bucket, data]) => {
                        const bucketInfo = BUCKET_LABELS[bucket];
                        const Icon = bucketInfo?.icon || Activity;
                        return (
                          <div key={bucket} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{bucketInfo?.label || bucket}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-500">{data.converted}/{data.total}</span>
                              <Badge variant={data.rate >= 50 ? "default" : data.rate >= 20 ? "secondary" : "destructive"}>
                                {data.rate}%
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No activity data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className={totalRedFlags > 0 ? "border-red-200 bg-red-50" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${totalRedFlags > 0 ? "text-red-600" : "text-gray-400"}`} />
                    Red Flag Report
                    {totalRedFlags > 0 && (
                      <Badge variant="destructive">{totalRedFlags}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flagsLoading ? (
                    <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
                  ) : totalRedFlags === 0 ? (
                    <p className="text-green-600 text-center py-4">No red flags - team is performing well</p>
                  ) : (
                    <div className="space-y-4">
                      {redFlags?.highActivityLowOutcome && redFlags.highActivityLowOutcome.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            High Activity, Low Outcomes
                          </h4>
                          {redFlags.highActivityLowOutcome.map((rep) => (
                            <div key={rep.userId} className="p-3 bg-white rounded-lg border border-red-200 mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{rep.email}</span>
                                <div className="flex gap-2">
                                  <Badge variant="outline">{rep.avgTasks} tasks/day</Badge>
                                  <Badge variant="destructive">{rep.conversionRate}% conv</Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{rep.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {redFlags?.lowActivity && redFlags.lowActivity.length > 0 && (
                        <div>
                          <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Low Activity
                          </h4>
                          {redFlags.lowActivity.map((rep) => (
                            <div key={rep.userId} className="p-3 bg-white rounded-lg border border-orange-200 mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{rep.email}</span>
                                <div className="flex gap-2">
                                  <Badge variant="outline">{rep.avgTasks} tasks/day</Badge>
                                  <Badge variant="secondary">{rep.daysActive} days</Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{rep.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
