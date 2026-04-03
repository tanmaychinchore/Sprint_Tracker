import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Loader2 } from "lucide-react";

interface CreateTeamDialogProps {
  trigger?: React.ReactNode;
  onCreated?: () => void;
}

export function CreateTeamDialog({ trigger, onCreated }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await apiFetch("/teams", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1.5 rounded-lg text-[13px] font-semibold">
            <Users className="h-4 w-4" />
            Create Team
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new team</DialogTitle>
            <DialogDescription>
              Teams let you organize members and projects together.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team name</Label>
              <Input
                id="team-name"
                placeholder="e.g. Engineering, Design, Marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
