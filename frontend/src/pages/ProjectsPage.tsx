import { FolderKanban, MoreHorizontal, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const projects = [
  { name: "Sprint Tracker v2", status: "Active", tasks: 24, due: "Apr 15", color: "bg-accent text-accent-foreground" },
  { name: "Marketing Website", status: "Active", tasks: 18, due: "Apr 22", color: "bg-primary/15 text-primary" },
  { name: "Mobile App", status: "Planning", tasks: 8, due: "May 1", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { name: "API Integration", status: "On Hold", tasks: 12, due: "—", color: "bg-muted text-muted-foreground" },
];

export function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Projects</h3>
          <p className="text-muted-foreground text-sm">Manage your portfolios and milestones.</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-lg text-[13px] font-semibold">
          <FolderKanban className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.name} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${project.color}`}>
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold group-hover:text-primary transition-colors">{project.name}</CardTitle>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${project.color}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <button className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{project.tasks} tasks</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due {project.due}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
