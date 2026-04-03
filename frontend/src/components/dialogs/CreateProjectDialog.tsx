import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { Team } from "@/types/models";
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
import { FolderKanban, Loader2 } from "lucide-react";

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

export function CreateProjectDialog({ trigger, onCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      apiFetch<Team[]>("/teams").then(setTeams).catch(() => {});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teamId) return;

    setLoading(true);
    setError(null);

    try {
      await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          teamId,
          deadline: deadline || undefined,
        }),
      });
      setName("");
      setDescription("");
      setTeamId("");
      setDeadline("");
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5 rounded-lg text-[13px] font-semibold">
            <FolderKanban className="h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
            <DialogDescription>
              Projects belong to a team and contain sprints and tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                placeholder="e.g. Sprint Tracker v2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description (optional)</Label>
              <Textarea
                id="project-desc"
                placeholder="Brief description of the project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {teams.length === 0 && (
                <p className="text-xs text-muted-foreground">No teams yet. Create a team first.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-deadline">Deadline (optional)</Label>
              <Input
                id="project-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || !teamId || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
