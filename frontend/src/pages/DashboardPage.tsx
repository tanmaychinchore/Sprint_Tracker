import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { Team, Project, Task } from "@/types/models";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateTaskDialog } from "@/components/dialogs/CreateTaskDialog";
import { CreateTeamDialog } from "@/components/dialogs/CreateTeamDialog";
import { CreateProjectDialog } from "@/components/dialogs/CreateProjectDialog";
import {
  ClipboardList,
  FolderKanban,
  Users,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export function DashboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [teamsData, projectsData, tasksData] = await Promise.all([
        apiFetch<Team[]>("/teams").catch(() => []),
        apiFetch<Project[]>("/projects/all").catch(() => []),
        apiFetch<Task[]>("/tasks/my").catch(() => []),
      ]);
      setTeams(teamsData);
      setProjects(projectsData);
      setTasks(tasksData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Compute real metrics
  const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0);
  const todoCount = tasks.filter((t) => t.status === "TODO").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const reviewCount = tasks.filter((t) => t.status === "REVIEW").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            <CreateTaskDialog
              onCreated={fetchAll}
              trigger={
                <button className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors group">
                  <span className="flex items-center gap-2.5">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    Create Task
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </button>
              }
            />
            <CreateTeamDialog
              onCreated={fetchAll}
              trigger={
                <button className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors group">
                  <span className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Create Team
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </button>
              }
            />
            <CreateProjectDialog
              onCreated={fetchAll}
              trigger={
                <button className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors group">
                  <span className="flex items-center gap-2.5">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    Create Project
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </button>
              }
            />
          </CardContent>
        </Card>

        {/* Sprint Timer Card — decorative */}
        <Card className="border-0 bg-primary text-white shadow-lg shadow-primary/20 relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70 text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sprint Overview
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52 * (tasks.length > 0 ? doneCount / tasks.length : 0)} ${2 * Math.PI * 52}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tracking-tight">{doneCount}</span>
                <span className="text-xs text-white/60 uppercase tracking-wider">Done</span>
              </div>
            </div>
            <p className="text-sm text-white/70">
              {tasks.length - doneCount} <span className="text-white/50 ml-1">Remaining</span>
            </p>
          </CardContent>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        </Card>

        {/* Task Progress Card */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Task Progress</CardTitle>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{tasks.length} total</span>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Your task breakdown by status
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-end justify-between gap-3 h-28 mb-3">
              {[
                { label: "Done", value: doneCount, color: "bg-accent-foreground" },
                { label: "In Progress", value: inProgressCount, color: "bg-primary" },
                { label: "To Do", value: todoCount, color: "bg-muted-foreground" },
                { label: "Review", value: reviewCount, color: "bg-amber-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xl font-bold text-foreground">{value}</span>
                    <div
                      className={`w-8 rounded-t-md ${color} transition-all duration-500`}
                      style={{ height: `${Math.max(value * 8, 4)}px`, maxHeight: "80px" }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground leading-tight text-center">{label}</span>
                </div>
              ))}
            </div>
            {tasks.length > 0 && (
              <div className="flex items-center gap-1.5 bg-accent rounded-full px-3 py-1.5 w-fit mx-auto">
                <TrendingUp className="h-3.5 w-3.5 text-accent-foreground" />
                <span className="text-xs font-medium text-accent-foreground">
                  {Math.round((doneCount / tasks.length) * 100)}% completion rate
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Metrics Row ─── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Teams", value: teams.length, icon: Users, sub: `${totalMembers} total members` },
          { label: "Projects", value: projects.length, sub: "Across all teams", icon: FolderKanban },
          { label: "Tasks Completed", value: doneCount, icon: CheckCircle2, sub: `of ${tasks.length} total` },
          { label: "In Progress", value: inProgressCount + reviewCount, icon: AlertTriangle, sub: `${todoCount} in backlog` },
        ].map(({ label, value, icon: Icon, sub }, i) => (
          <Card key={i} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
