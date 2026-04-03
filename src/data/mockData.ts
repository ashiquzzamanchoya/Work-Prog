export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type Status =
  | "New Request"
  | "Not Started"
  | "In Progress"
  | "Waiting for Assets"
  | "Waiting for Review"
  | "Waiting for Boss Feedback"
  | "Revision Needed"
  | "Approved"
  | "Completed";
export type Category =
  | "Thumbnail"
  | "Shorts"
  | "Commercial"
  | "Banner"
  | "Other";

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  brief: string;
  category: Category;
  priority: Priority;
  status: Status;
  assigneeId: string | null;
  reporterId: string;
  dueDate: string;
  createdAt: string;
  progress: number;
}

export const users: User[] = [];

export const mockTasks: Task[] = [];

export const statuses: Status[] = [
  "New Request",
  "Not Started",
  "In Progress",
  "Waiting for Assets",
  "Waiting for Review",
  "Waiting for Boss Feedback",
  "Revision Needed",
  "Approved",
  "Completed",
];

export const categories: Category[] = [
  "Thumbnail",
  "Shorts",
  "Commercial",
  "Banner",
  "Other",
];
export const priorities: Priority[] = ["Low", "Medium", "High", "Urgent"];
