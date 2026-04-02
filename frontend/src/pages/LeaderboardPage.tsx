import { Trophy, Medal, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const leaders = [
  { rank: 1, name: "Alice K.", team: "Design", points: 142, change: "+12" },
  { rank: 2, name: "Bob M.", team: "Engineering", points: 128, change: "+8" },
  { rank: 3, name: "Carol Z.", team: "Product", points: 115, change: "+15" },
  { rank: 4, name: "Dan S.", team: "QA", points: 97, change: "+5" },
  { rank: 5, name: "Eve R.", team: "Engineering", points: 89, change: "+3" },
];

export function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Leaderboard</h3>
        <p className="text-muted-foreground text-sm">Recognize team productivity and velocity leaders.</p>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Contributors — This Sprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Team</div>
              <div className="col-span-2 text-right">Points</div>
              <div className="col-span-2 text-right">Change</div>
            </div>

            {leaders.map((leader) => (
              <div
                key={leader.rank}
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="col-span-1">
                  {leader.rank <= 3 ? (
                    <Medal className={`h-5 w-5 ${
                      leader.rank === 1 ? "text-amber-500" :
                      leader.rank === 2 ? "text-gray-400" : "text-orange-400"
                    }`} />
                  ) : (
                    <span className="text-sm text-muted-foreground font-medium ml-0.5">{leader.rank}</span>
                  )}
                </div>
                <div className="col-span-4 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {leader.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="text-sm font-medium text-foreground">{leader.name}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">{leader.team}</span>
                </div>
                <div className="col-span-2 text-right text-sm font-semibold text-foreground">{leader.points}</div>
                <div className="col-span-2 text-right">
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    {leader.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
