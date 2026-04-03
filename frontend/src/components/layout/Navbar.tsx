import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "@/components/dialogs/CreateTaskDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const location = useLocation();

  let user: { name?: string; email?: string } | null = null;
  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) user = JSON.parse(rawUser);
  } catch {}

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a contexutual page title
  const formatPathTitle = () => {
    const path = location.pathname.substring(1);
    if (!path || path === "dashboard") return null; // Welcome message handles this
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const pageTitle = formatPathTitle();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-border bg-card px-4 md:px-6">
      <div className="flex flex-1 items-center gap-x-4 lg:gap-x-6">
        {/* Left: Welcome message or page title */}
        <div className="flex-1">
          {pageTitle ? (
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {pageTitle}
            </h2>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                Welcome Back, {user?.name?.split(" ")[0] || "User"} 👋
              </h2>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Here's what's happening with your projects.
              </p>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-x-2.5">
          {/* Create Task button */}
          <div className="hidden sm:block">
            <CreateTaskDialog />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark(!isDark)}
            className="h-9 w-9 rounded-lg border border-border bg-background hover:bg-muted"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-[18px] w-[18px] text-amber-500 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="h-[18px] w-[18px] text-muted-foreground transition-transform duration-300" />
            )}
          </Button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "Sprint Tracker User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "No email assigned"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
