import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  KanbanSquare,
  Trophy,
  Zap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "My Tasks", href: "/board", icon: KanbanSquare },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
];

export function Sidebar() {
  // Grab user info for the bottom profile section
  let user: { name?: string; email?: string } | null = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {}

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col overflow-y-auto border-r border-border bg-card px-5 pb-4">
        
        {/* Brand / Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-foreground">
            Sprint Tracker
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 flex-col mt-6">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      isActive
                        ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active)] font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      "group flex gap-x-3 rounded-lg px-3 py-2.5 text-[14px] leading-6 font-medium transition-all duration-200"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          isActive
                            ? "text-[var(--color-sidebar-active)]"
                            : "text-muted-foreground group-hover:text-foreground",
                          "h-5 w-5 shrink-0 transition-colors duration-200"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom: User Profile */}
        <div className="border-t border-border pt-4 mt-2">
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
