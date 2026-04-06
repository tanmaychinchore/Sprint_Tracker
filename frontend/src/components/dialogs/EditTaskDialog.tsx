import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { Task, Project, TeamMember } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Edit2, ShieldAlert } from "lucide-react";

interface EditTaskDialogProps {
  task: Task;
  trigger?: React.ReactNode;
  onUpdated?: () => void;
  isAdmin?: boolean; 
}

export function EditTaskDialog({ task, trigger, onUpdated, isAdmin }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [projectId, setProjectId] = useState(typeof task.project === "string" ? task.project : task.project._id);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLocked = task.status === "DONE";

  useEffect(() => {
    // initialize from task
    setTitle(task.title);
    setDescription(task.description || "");
    setProjectId(typeof task.project === "string" ? task.project : task.project._id);
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "");
    if (task.assignedTo) {
      setAssignedTo(typeof task.assignedTo === "string" ? task.assignedTo : task.assignedTo._id);
    }
  }, [task, open]);

  useEffect(() => {
    if (open) {
      apiFetch<Project[]>("/projects/all").then(setProjects).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (projectId) {
      apiFetch<TeamMember[]>(`/projects/${projectId}/members`)
        .then(setMembers)
        .catch(() => setMembers([]));
    } else {
      setMembers([]);
    }
  }, [projectId]);

  const getMemberInfo = (member: TeamMember): { id: string; name: string; email: string } | null => {
    if (typeof member.user === "object" && member.user !== null) {
      return {
        id: member.user._id,
        name: member.user.name,
        email: member.user.email,
      };
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (!title.trim() || !projectId) return;

    setLoading(true);
    setError(null);

    try {
      await apiFetch(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          project: projectId,
          priority,
          dueDate: dueDate || undefined,
          assignedTo: assignedTo || null,
        }),
      });
      setOpen(false);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="p-1 text-muted-foreground hover:text-foreground">
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isLocked ? "View Task (Locked)" : "Edit Task"}
              {isLocked && <ShieldAlert className="h-4 w-4 text-amber-500" />}
            </DialogTitle>
            <DialogDescription>
              {isLocked 
                ? "This task is marked as Done and cannot be modified."
                : "Update task details or change the assignment."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading || isLocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || isLocked}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId} disabled={loading || isLocked}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)} disabled={loading || isLocked}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assign to {(!isAdmin) && <span className="text-[10px] font-normal text-muted-foreground">(Admin only)</span>}</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo} disabled={loading || isLocked || !isAdmin}>
                  <SelectTrigger>
                    <SelectValue placeholder={members.length === 0 ? "Loading team..." : "Unassigned"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {members.map((m) => {
                      const info = getMemberInfo(m);
                      if (!info) return null;
                      return (
                        <SelectItem key={info.id} value={info.id}>
                          <div className="flex flex-col">
                            <span>{info.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading || isLocked}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              {isLocked ? "Close" : "Cancel"}
            </Button>
            {!isLocked && (
              <Button type="submit" disabled={!title.trim() || !projectId || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
