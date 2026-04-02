import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  CalendarDays,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

export function DashboardPage() {
  // Grab user for welcome message
  let user: { name?: string } | null = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {}

  return (
    <div className="space-y-8">
      {/* ─── Hero Row: Quick Actions + Progress ─── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Quick Actions Card */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-sm font-medium text-muted-foreground">
              How can I help you today?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Create Task", icon: ClipboardList },
              { label: "Plan Today", icon: CalendarDays },
              { label: "Review Blocked", icon: AlertTriangle },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors group"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Time Tracker Card — vibrant orange */}
        <Card className="border-0 bg-primary text-white shadow-lg shadow-primary/20 relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70 text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sprint Timer
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            {/* Timer Display */}
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52 * 0.65} ${2 * Math.PI * 52 * 0.35}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tracking-tight">02:34</span>
                <span className="text-xs text-white/60 uppercase tracking-wider">Elapsed</span>
              </div>
            </div>
            <p className="text-sm text-white/70">
              05:26 <span className="text-white/50 ml-1">Remaining</span>
            </p>
          </CardContent>
          {/* Decorative glow */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        </Card>

        {/* Task Progress Card */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Task Progress</CardTitle>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">This Week</span>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Weekly snapshot of your workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Mini bar chart */}
            <div className="flex items-end justify-between gap-3 h-28 mb-3">
              {[
                { label: "Completed", value: 22, color: "bg-accent-foreground" },
                { label: "In Progress", value: 30, color: "bg-primary" },
                { label: "Blocked", value: 18, color: "bg-destructive/70" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xl font-bold text-foreground">{value}</span>
                    <div
                      className={`w-8 rounded-t-md ${color} transition-all duration-500`}
                      style={{ height: `${value * 2.5}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight text-center">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Trend pill */}
            <div className="flex items-center gap-1.5 bg-accent rounded-full px-3 py-1.5 w-fit mx-auto">
              <TrendingUp className="h-3.5 w-3.5 text-accent-foreground" />
              <span className="text-xs font-medium text-accent-foreground">+12% compared to last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Metrics Row ─── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Sprints", value: 3, icon: Clock, change: "+1 this week" },
          { label: "Tasks Completed", value: 47, icon: CheckCircle2, change: "+12 today" },
          { label: "Team Members", value: 16, icon: Users, change: "Across 4 teams" },
          { label: "Open Issues", value: 9, icon: AlertTriangle, change: "-3 from yesterday" },
        ].map(({ label, value, icon: Icon, change }, i) => (
          <Card
            key={i}
            className="border-border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Activity & Deadlines Row ─── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Activity stream across all projects.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-center text-muted-foreground/40 border-t border-border bg-muted/20 rounded-b-lg">
            <div className="text-center">
              <ClipboardList className="h-10 w-10 mx-auto mb-2 text-muted-foreground/20" />
              <p className="text-sm">Activity chart coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            <CardDescription>Tasks due in the next 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex flex-col items-center justify-center text-muted-foreground/40 border-t border-border bg-muted/20 rounded-b-lg">
            <div className="text-center">
              <CalendarDays className="h-10 w-10 mx-auto mb-2 text-muted-foreground/20" />
              <p className="text-sm">No upcoming deadlines</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
