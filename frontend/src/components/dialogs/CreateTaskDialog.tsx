import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { Project, TeamMember } from "@/types/models";
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
import { Plus, Loader2 } from "lucide-react";

interface CreateTaskDialogProps {
  trigger?: React.ReactNode;
  onCreated?: () => void;
  defaultProjectId?: string;
  defaultAssignedTo?: string;
}

export function CreateTaskDialog({ trigger, onCreated, defaultProjectId, defaultAssignedTo }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState(defaultAssignedTo || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      apiFetch<Project[]>("/projects/all").then(setProjects).catch(() => {});
      if (defaultProjectId) setProjectId(defaultProjectId);
    }
  }, [open, defaultProjectId]);

  // Fetch team members when project changes
  useEffect(() => {
    if (projectId) {
      apiFetch<TeamMember[]>(`/projects/${projectId}/members`)
        .then(setMembers)
        .catch(() => setMembers([]));
    } else {
      setMembers([]);
    }
    if (!defaultAssignedTo) {
      setAssignedTo(""); // Only reset if a default isn't explicitly requested
    }
  }, [projectId, defaultAssignedTo]);

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
    if (!title.trim() || !projectId) return;

    setLoading(true);
    setError(null);

    try {
      await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          projectId,
          priority,
          dueDate: dueDate || undefined,
          assignedTo: assignedTo || undefined,
        }),
      });
      setTitle("");
      setDescription("");
      setProjectId(defaultProjectId || "");
      setPriority("MEDIUM");
      setDueDate("");
      setAssignedTo(defaultAssignedTo || "");
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5 rounded-lg text-[13px] font-semibold">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new task</DialogTitle>
            <DialogDescription>
              Add a task to a project. It will start in the "To Do" column.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="e.g. Implement login page"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Description (optional)</Label>
              <Textarea
                id="task-desc"
                placeholder="Describe the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
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
                <Select value={priority} onValueChange={setPriority}>
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
                <Label>Assign to</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder={members.length === 0 ? "Select project first" : "Select member"} />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => {
                      const info = getMemberInfo(m);
                      if (!info) return null;
                      return (
                        <SelectItem key={info.id} value={info.id}>
                          <div className="flex flex-col">
                            <span>{info.name}</span>
                            <span className="text-[10px] text-muted-foreground">{info.email}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due">Due date (optional)</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            {projects.length === 0 && (
              <p className="text-xs text-muted-foreground">No projects yet. Create a project first.</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={!title.trim() || !projectId || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
