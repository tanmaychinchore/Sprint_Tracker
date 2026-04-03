import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Team, User } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTeamDialog } from "@/components/dialogs/CreateTeamDialog";
import { Users, MoreHorizontal, Loader2, UserPlus } from "lucide-react";

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Team[]>("/teams");
      setTeams(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const getMemberName = (member: { user: User | string; role: string }) => {
    if (typeof member.user === "object" && member.user !== null) {
      return member.user.name;
    }
    return "Unknown";
  };

  const getLeadName = (team: Team) => {
    const admin = team.members.find((m) => m.role === "admin");
    if (admin) return getMemberName(admin);
    return getMemberName(team.members[0]);
  };

  const teamColors = [
    "bg-primary/15 text-primary",
    "bg-accent text-accent-foreground",
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
          <h3 className="text-2xl font-bold tracking-tight">Teams</h3>
          <p className="text-muted-foreground text-sm">Manage your agile teams and members.</p>
        </div>
        <CreateTeamDialog onCreated={fetchTeams} />
      </div>

      {teams.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h4 className="text-lg font-semibold text-foreground mb-1">No teams yet</h4>
            <p className="text-sm text-muted-foreground mb-4">Create your first team to get started.</p>
            <CreateTeamDialog onCreated={fetchTeams} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, i) => (
            <Card key={team._id} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${teamColors[i % teamColors.length]}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{team.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Lead: <span className="text-foreground font-medium">{getLeadName(team)}</span></span>
                  <button className="flex items-center gap-1 text-primary hover:underline">
                    <UserPlus className="h-3 w-3" />
                    Invite
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
