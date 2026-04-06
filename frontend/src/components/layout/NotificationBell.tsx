import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Notification } from "@/types/models";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, Loader2, Info, CheckCircle2, UserPlus, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await apiFetch<{ count: number }>("/notifications/unread-count");
      setUnreadCount(count);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Notification[]>("/notifications");
      setNotifications(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "TASK_SUBMITTED_FOR_REVIEW": return <Info className="h-4 w-4 text-blue-500" />;
      case "TASK_APPROVED": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "TASK_ASSIGNED": return <UserPlus className="h-4 w-4 text-purple-500" />;
      case "TEAM_INVITE": return <Star className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={(val) => { setOpen(val); if (!val) fetchUnreadCount(); }}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-accent transition-colors focus:outline-none">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <button 
              onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
              className="text-[11px] text-primary hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-xs text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem 
                key={n._id} 
                className={`flex flex-col items-start gap-1 p-4 cursor-default focus:bg-accent/50 ${!n.read ? 'bg-primary/5' : ''}`}
                onSelect={(e) => { e.preventDefault(); if (!n.read) markAsRead(n._id); }}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-xs leading-normal ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                      {!n.read && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2 text-center">
          <button className="text-[11px] text-muted-foreground hover:text-foreground">
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
