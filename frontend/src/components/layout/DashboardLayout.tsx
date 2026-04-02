import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content Pane */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
