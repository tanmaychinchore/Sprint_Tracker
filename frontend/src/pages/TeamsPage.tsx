import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Team, User } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTeamDialog } from "@/components/dialogs/CreateTeamDialog";
import { InviteMemberDialog } from "@/components/dialogs/InviteMemberDialog";
import { CreateTaskDialog } from "@/components/dialogs/CreateTaskDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreHorizontal, Loader2, Shield, UserPlus } from "lucide-react";

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current user from localStorage
  let currentUserId = "";
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      currentUserId = parsed.id || parsed._id || "";
    }
  } catch {}

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

  const isTeamAdmin = (team: Team) => {
    return team.members.some((m) => {
      const userId = typeof m.user === "object" ? m.user._id : m.user;
      return userId === currentUserId && m.role === "admin";
    });
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
                {isTeamAdmin(team) && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Members list */}
                  <div className="flex flex-wrap gap-2">
                    {team.members.map((m, j) => {
                      const name = getMemberName(m);
                      const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
                      const userId = typeof m.user === "object" ? m.user._id : m.user;
                      
                      return (
                        <DropdownMenu key={j}>
                          <DropdownMenuTrigger asChild>
                            <div
                              className="w-8 h-8 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center border border-border cursor-pointer hover:border-primary transition-colors"
                              title={`${name} (${m.role})`}
                            >
                              {initials}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {name}
                            </div>
                            <CreateTaskDialog 
                              defaultAssignedTo={userId}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                                  <span>Assign Task</span>
                                </DropdownMenuItem>
                              }
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Lead: <span className="text-foreground font-medium">{getLeadName(team)}</span></span>
                    {isTeamAdmin(team) && (
                      <InviteMemberDialog
                        teamId={team._id}
                        teamName={team.name}
                        onInvited={fetchTeams}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
