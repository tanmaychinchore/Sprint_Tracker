import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Task, TaskStatus } from "@/types/models";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from "@/types/models";
import { CreateTaskDialog } from "@/components/dialogs/CreateTaskDialog";
import { Loader2, KanbanSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Task[]>("/tasks/my");
      setTasks(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await apiFetch(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch {}
  };

  const getProjectName = (task: Task) => {
    if (typeof task.project === "object" && task.project !== null) {
      return (task.project as any).name;
    }
    return "";
  };

  const grouped: Record<TaskStatus, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  };
  tasks.forEach((task) => {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">My Tasks</h3>
          <p className="text-muted-foreground text-sm">
            {tasks.length === 0 ? "No tasks yet — create one to get started." : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} across all projects`}
          </p>
        </div>
        <CreateTaskDialog onCreated={fetchTasks} />
      </div>

      {tasks.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <KanbanSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-1">No tasks yet</h4>
            <p className="text-sm text-muted-foreground mb-4">Create a team and project first, then add tasks.</p>
            <CreateTaskDialog onCreated={fetchTasks} />
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <div key={status} className="w-80 shrink-0 flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
                  <h4 className="font-semibold text-sm text-foreground">{STATUS_LABELS[status]}</h4>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {grouped[status].length}
                  </span>
                </div>
                <CreateTaskDialog
                  onCreated={fetchTasks}
                  trigger={
                    <span className="text-muted-foreground text-lg cursor-pointer hover:text-foreground">+</span>
                  }
                />
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1">
                {grouped[status].map((task) => (
                  <div
                    key={task._id}
                    className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <h5 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {task.title}
                    </h5>
                    {task.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    {getProjectName(task) && (
                      <p className="text-[10px] text-muted-foreground/60 mb-2">
                        {getProjectName(task)}
                      </p>
                    )}
                    <div className="flex gap-1.5 flex-wrap items-center">
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      {/* Quick status change buttons */}
                      {status !== "DONE" && (
                        <button
                          onClick={() => {
                            const next = COLUMNS[COLUMNS.indexOf(status) + 1];
                            if (next) handleStatusChange(task._id, next);
                          }}
                          className="ml-auto text-[10px] text-primary hover:underline"
                        >
                          Move →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
