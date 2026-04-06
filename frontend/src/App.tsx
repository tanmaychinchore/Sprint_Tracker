import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { TeamsPage } from "@/pages/TeamsPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { BoardPage } from "@/pages/BoardPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/:inviteToken" element={<RegisterPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            {/* Index redirection logic */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Route>
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
