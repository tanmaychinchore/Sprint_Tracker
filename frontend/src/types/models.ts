/* ─── Backend Model Types ─── */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface TeamMember {
  user: User | string;
  role: string;
  _id?: string;
}

export interface Team {
  _id: string;
  name: string;
  owner: string | User;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  team: string | Team;
  createdBy: string | User;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string | Project;
  sprint?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: User | string;
  createdBy: string | User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  _id: string;
  name: string;
  goal?: string;
  project: string;
  startDate?: string;
  endDate?: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  _id: string;
  user: User;
  xp: number;
  level: number;
  tasksCompleted: number;
}

export interface Notification {
  _id: string;
  user: string;
  type: "TASK_SUBMITTED_FOR_REVIEW" | "TASK_APPROVED" | "TASK_ASSIGNED" | "TEAM_INVITE";
  message: string;
  task?: { _id: string; title: string; status: TaskStatus };
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  email: string;
  teamName?: string;
  invitedBy?: string;
  role: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  expiresAt: string;
}

/* ─── Kanban Column Mapping ─── */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Under Review",
  DONE: "Completed",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-muted-foreground",
  IN_PROGRESS: "bg-primary",
  REVIEW: "bg-amber-500",
  DONE: "bg-accent-foreground",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: "bg-accent text-accent-foreground",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
