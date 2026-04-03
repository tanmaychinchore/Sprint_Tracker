import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Project, Team } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProjectDialog } from "@/components/dialogs/CreateProjectDialog";
import { FolderKanban, MoreHorizontal, Calendar, Loader2 } from "lucide-react";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Project[]>("/projects/all");
      setProjects(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const getTeamName = (project: Project) => {
    if (typeof project.team === "object" && project.team !== null) {
      return (project.team as Team).name;
    }
    return "—";
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return "No deadline";
    return new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const projectColors = [
    "bg-accent text-accent-foreground",
    "bg-primary/15 text-primary",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Projects</h3>
          <p className="text-muted-foreground text-sm">Manage your portfolios and milestones.</p>
        </div>
        <CreateProjectDialog onCreated={fetchProjects} />
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-1">No projects yet</h4>
            <p className="text-sm text-muted-foreground mb-4">Create a team first, then add projects to it.</p>
            <CreateProjectDialog onCreated={fetchProjects} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project, i) => (
            <Card key={project._id} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${projectColors[i % projectColors.length]}`}>
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                    )}
                  </div>
                </div>
                <button className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Team: <span className="text-foreground font-medium">{getTeamName(project)}</span></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDeadline(project.deadline)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
