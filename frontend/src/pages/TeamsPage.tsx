import { Users, Mail, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const teams = [
  { name: "Design Team", members: 5, lead: "Alice K.", color: "bg-primary/15 text-primary" },
  { name: "Engineering", members: 8, lead: "Bob M.", color: "bg-accent text-accent-foreground" },
  { name: "Product", members: 4, lead: "Carol Z.", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { name: "QA & Testing", members: 3, lead: "Dan S.", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
];

export function TeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Teams</h3>
          <p className="text-muted-foreground text-sm">Manage your agile teams and members.</p>
        </div>
        <Button size="sm" className="gap-1.5 rounded-lg text-[13px] font-semibold">
          <Users className="h-4 w-4" />
          Create Team
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.name} className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${team.color}`}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">{team.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{team.members} members</p>
                </div>
              </div>
              <button className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Lead: <span className="text-foreground font-medium">{team.lead}</span></span>
                <button className="flex items-center gap-1 text-primary hover:underline">
                  <Mail className="h-3 w-3" />
                  Invite
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
