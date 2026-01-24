"use client"

import { Flame, CheckCircle2, Clock, Target } from "lucide-react"

interface UpcomingTask {
  id: string
  title: string
  time: string
  type: "call" | "meeting" | "followup"
}

interface DailyProgressHeroProps {
  completionPercent: number
  tasksToday: number
  overdueCount: number
  hotLeadsCount: number
  upcomingTasks?: UpcomingTask[]
  dailyGoal?: number
}

export function DailyProgressHero({
  completionPercent,
  tasksToday,
  overdueCount,
  hotLeadsCount,
  upcomingTasks = [
    { id: "1", title: "Call Summit Graphics", time: "10:30 AM", type: "call" },
    { id: "2", title: "Demo with PrintMax Ltd", time: "2:00 PM", type: "meeting" },
    { id: "3", title: "Follow up - Banner quote", time: "4:15 PM", type: "followup" },
  ],
  dailyGoal = 8,
}: DailyProgressHeroProps) {
  const circumference = 2 * Math.PI * 52
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference
  const completedTasks = Math.round((completionPercent / 100) * tasksToday)

  const getTypeColor = (type: UpcomingTask["type"]) => {
    switch (type) {
      case "call":
        return "bg-[#8B7EC8]"
      case "meeting":
        return "bg-[#7CB89E]"
      case "followup":
        return "bg-[#E5A853]"
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-card to-primary/5 p-6 backdrop-blur-sm border border-border shadow-sm">
      <div className="flex items-start justify-between gap-6">
        {/* Left Section: Progress Ring + Stats */}
        <div className="flex items-center gap-6">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-primary/10"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B7EC8" />
                  <stop offset="100%" stopColor="#7CB89E" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{completionPercent}%</span>
              <span className="text-xs text-muted-foreground">completed</span>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
              <span className="h-2 w-2 rounded-full bg-[#60a5fa]" />
              <span className="text-sm text-foreground font-medium">{tasksToday} tasks today</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-sm text-foreground font-medium">{overdueCount} overdue</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-sm border border-border">
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-sm text-foreground font-medium">{hotLeadsCount} hot leads</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-28 bg-border self-center" />

        {/* Right Section: Upcoming Tasks */}
        <div className="hidden lg:flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Up Next
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              <span>{completedTasks}/{dailyGoal} goal</span>
            </div>
          </div>
          <div className="space-y-2">
            {upcomingTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50 hover:bg-card hover:border-border transition-colors"
              >
                <div className={`w-1 h-8 rounded-full ${getTypeColor(task.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.time}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground/40 hover:text-secondary cursor-pointer transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
