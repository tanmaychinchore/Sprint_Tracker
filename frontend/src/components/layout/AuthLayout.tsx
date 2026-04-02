import { useState, useEffect, ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4">
      {/* ─── Animated Background ─── */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient — warm cream to soft peach */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-[#FAF7F2] to-amber-50 dark:from-[#1C1A17] dark:via-[#1F1D1A] dark:to-[#231F1C]" />

        {/* Floating orbs — warm orange / peach */}
        <div className="absolute top-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-orange-200/20 dark:bg-orange-800/10 blur-[100px] animate-float" />
        <div
          className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-amber-200/20 dark:bg-amber-800/10 blur-[120px] animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-[40%] right-[20%] h-[300px] w-[300px] rounded-full bg-orange-100/20 dark:bg-orange-900/8 blur-[80px] animate-float"
          style={{ animationDelay: "4s" }}
        />

        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ─── Theme Toggle ─── */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDark(!isDark)}
        className="fixed top-5 right-5 z-50 rounded-full bg-white/60 dark:bg-[#262320]/60 backdrop-blur-md border border-border/50 hover:bg-white/80 dark:hover:bg-[#262320]/80 shadow-lg"
        id="theme-toggle"
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          <Sun className="h-[18px] w-[18px] text-amber-500 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="h-[18px] w-[18px] text-orange-400 transition-transform duration-300" />
        )}
      </Button>

      {/* ─── Main Content ─── */}
      <div className="w-full max-w-[420px] animate-scale-in">
        {children}

        {/* Footer text */}
        <p
          className="text-center text-xs text-muted-foreground/40 mt-6 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          Sprint Tracker &middot; Built for agile teams
        </p>
      </div>
    </div>
  );
}
