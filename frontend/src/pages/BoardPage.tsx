import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Task, TaskStatus } from "@/types/models";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from "@/types/models";
import { CreateTaskDialog } from "@/components/dialogs/CreateTaskDialog";
import { EditTaskDialog } from "@/components/dialogs/EditTaskDialog";
import { Loader2, KanbanSquare, CheckCircle, User as UserIcon, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

export function BoardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get("project");
  
  // Get current user
  let currentUser: any = null;
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) currentUser = JSON.parse(rawUser);
  } catch {}
  const currentUserId = currentUser?.id || currentUser?._id || "";

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [myTasks, teamTasks] = await Promise.all([
        apiFetch<Task[]>("/tasks/my").catch(() => []),
        apiFetch<Task[]>("/tasks/team").catch(() => []), 
      ]);
      
      // Combine and deduplicate
      let combined = [...myTasks];
      teamTasks.forEach(tt => {
        if (!combined.find(mt => mt._id === tt._id)) {
          combined.push(tt);
        }
      });

      if (projectFilter) {
        combined = combined.filter((t) => {
           const pInfo = typeof t.project === "object" && t.project !== null ? (t.project as any)._id : t.project;
           return pInfo === projectFilter;
        });
      }
      
      setTasks(combined);
    } catch {} finally {
      setLoading(false);
    }
  }, [projectFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const getProjectInfo = (task: Task) => {
    if (typeof task.project === "object" && task.project !== null) {
      return task.project as any;
    }
    return null;
  };

  const getAssigneeName = (task: Task) => {
    if (typeof task.assignedTo === "object" && task.assignedTo !== null) {
      return task.assignedTo.name;
    }
    return "Unassigned";
  };

  const isTaskAdmin = (task: Task) => {
    const project = getProjectInfo(task);
    if (!project || !project.team) return false;
    
    if (typeof project.team === 'object' && project.team.members) {
        return project.team.members.some((m: any) => 
            (m.user === currentUserId || m.user?._id === currentUserId) && m.role === 'admin'
        );
    }
    return false;
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    if (sourceStatus === destStatus) return;

    const isAdmin = isTaskAdmin(task);
    const isAssignee = task.assignedTo === currentUserId || (task.assignedTo as any)?._id === currentUserId;

    // Validation Rules:
    if (destStatus === "DONE" || (sourceStatus === "REVIEW" && destStatus === "IN_PROGRESS")) {
        if (!isAdmin) return;
    } 
    else if ((sourceStatus === "TODO" && destStatus === "IN_PROGRESS") || (sourceStatus === "IN_PROGRESS" && destStatus === "REVIEW")) {
        if (!isAssignee) return;
    } 
    else {
        return; // Invalid transition
    }

    // Optimistic update
    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: destStatus } : t));

    try {
      await apiFetch(`/tasks/${draggableId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: destStatus }),
      });
      fetchTasks();
    } catch {
      // Revert on error
      fetchTasks();
    }
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
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Board</h3>
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start flex-1 min-h-0">
            {COLUMNS.map((status) => (
              <div key={status} className="w-80 shrink-0 flex flex-col bg-muted/40 rounded-xl p-3 border border-border/40 max-h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />
                    <h4 className="font-semibold tracking-tight text-sm text-foreground">{STATUS_LABELS[status]}</h4>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted-foreground/10 rounded-full px-2 py-0.5">
                      {grouped[status].length}
                    </span>
                  </div>
                  <CreateTaskDialog
                    onCreated={fetchTasks}
                    trigger={
                      <span className="text-muted-foreground/60 text-xl font-light cursor-pointer hover:text-foreground transition-colors">+</span>
                    }
                  />
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 flex-1 overflow-y-auto px-1 py-1 min-h-[150px] transition-colors rounded-lg overflow-x-hidden ${snapshot.isDraggingOver ? 'bg-muted/60' : ''}`}
                    >
                      {grouped[status].map((task, index) => {
                        const project = getProjectInfo(task);
                        const assigneeName = getAssigneeName(task);
                        const isAdmin = isTaskAdmin(task);
                        const isLocked = task.status === "DONE" && !isAdmin;

                        return (
                          <Draggable 
                            key={task._id} 
                            draggableId={task._id} 
                            index={index}
                            isDragDisabled={isLocked}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                                className={`transition-transform pb-1 ${snapshot.isDragging ? 'z-50' : ''}`}
                              >
                                <div
                                  className={`bg-card border border-border/80 rounded-xl p-4 shadow-sm group hover:border-primary/30 transition-all ${isLocked ? 'opacity-70' : 'hover:-translate-y-0.5 hover:shadow-md'} ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-[1.02] border-primary/50' : ''}`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-sm font-semibold text-foreground leading-tight tracking-tight pr-2">
                                      {task.title}
                                    </h5>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {task.status === "DONE" && <CheckCircle className="h-4 w-4 shrink-0 text-green-500/80" />}
                                      <EditTaskDialog
                                        task={task}
                                        isAdmin={isAdmin || (task.createdBy === currentUserId || (task.createdBy as any)?._id === currentUserId)}
                                        onUpdated={fetchTasks}
                                        trigger={
                                          <button className="text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-muted" onClick={(e) => e.stopPropagation()}>
                                            <Edit2 className="h-3.5 w-3.5" />
                                          </button>
                                        }
                                      />
                                    </div>
                                  </div>
                                  
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center border border-border shrink-0">
                                      <UserIcon className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                    <span className="text-[11px] text-muted-foreground font-medium truncate">
                                      {assigneeName}
                                    </span>
                                  </div>

                                  {project && (
                                    <p className="text-[10px] text-muted-foreground/60 mb-3 font-medium truncate">
                                      {project.name}
                                    </p>
                                  )}

                                  <div className="flex gap-2 flex-wrap items-center pt-1 border-t border-border/40">
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
