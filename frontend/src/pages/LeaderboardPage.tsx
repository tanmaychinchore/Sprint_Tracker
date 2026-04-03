import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { UserStats } from "@/types/models";
import { Trophy, Medal, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LeaderboardPage() {
  const [leaders, setLeaders] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<UserStats[]>("/stats/leaderboard")
      .then(setLeaders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
            Top Contributors — All Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaders.length === 0 ? (
            <div className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No stats yet. Complete tasks to earn XP and climb the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2 text-right">Level</div>
                <div className="col-span-2 text-right">XP</div>
                <div className="col-span-3 text-right">Tasks Done</div>
              </div>

              {leaders.map((entry, i) => {
                const rank = i + 1;
                const userName = entry.user?.name || "Unknown";
                const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);

                return (
                  <div
                    key={entry._id}
                    className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-1">
                      {rank <= 3 ? (
                        <Medal className={`h-5 w-5 ${
                          rank === 1 ? "text-amber-500" :
                          rank === 2 ? "text-gray-400" : "text-orange-400"
                        }`} />
                      ) : (
                        <span className="text-sm text-muted-foreground font-medium ml-0.5">{rank}</span>
                      )}
                    </div>
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {initials}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">{userName}</span>
                        <p className="text-[10px] text-muted-foreground">{entry.user?.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-right text-sm font-semibold text-foreground">Lv.{entry.level}</div>
                    <div className="col-span-2 text-right">
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
                        <TrendingUp className="h-3 w-3" />
                        {entry.xp}
                      </span>
                    </div>
                    <div className="col-span-3 text-right text-sm text-muted-foreground">{entry.tasksCompleted} tasks</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
