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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2, CheckCircle2, Mail } from "lucide-react";

interface InviteMemberDialogProps {
  teamId: string;
  teamName: string;
  trigger?: React.ReactNode;
  onInvited?: () => void;
}

export function InviteMemberDialog({ teamId, teamName, trigger, onInvited }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; type: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await apiFetch<{ message: string; type: string }>(
        `/teams/${teamId}/invite`,
        {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), role }),
        }
      );

      setSuccess(result);

      // Auto-close after 2 seconds
      setTimeout(() => {
        setEmail("");
        setRole("member");
        setSuccess(null);
        setOpen(false);
        onInvited?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setEmail("");
      setRole("member");
      setError(null);
      setSuccess(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-1 text-primary hover:underline text-xs">
            <UserPlus className="h-3 w-3" />
            Invite
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-14 w-14 bg-accent rounded-full flex items-center justify-center mb-4">
              {success.type === "ADDED" ? (
                <CheckCircle2 className="h-7 w-7 text-accent-foreground" />
              ) : (
                <Mail className="h-7 w-7 text-accent-foreground" />
              )}
            </div>
            <h3 className="text-lg font-bold mb-1">
              {success.type === "ADDED" ? "Member Added!" : "Invitation Sent!"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {success.type === "ADDED"
                ? `${email} has been added to ${teamName}.`
                : `An invite email has been sent to ${email}. They'll join the team once they register.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Invite to {teamName}
              </DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to invite. If they don't have an account, they'll receive a registration link.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Admins can invite members, assign tasks, and approve completions.
                </p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={!email.trim() || loading} className="gap-1.5">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
