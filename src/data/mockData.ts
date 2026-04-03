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
  commentsCount: number;
  attachmentsCount: number;
}

export const users: User[] = [
  {
    id: "u1",
    name: "Anoy",
    avatar: "https://i.pravatar.cc/150?u=anoy",
    role: "Graphics Designer",
  },
  {
    id: "u2",
    name: "Choya",
    avatar: "https://i.pravatar.cc/150?u=choya",
    role: "Manager",
  },
  {
    id: "u3",
    name: "Rodney Bonds",
    avatar: "https://i.pravatar.cc/150?u=rodney",
    role: "Boss",
  },
];

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: 'MrBeast Style Thumbnail - "I Survived 50 Hours"',
    brief:
      "Create a high-contrast, highly saturated thumbnail. Needs big expressive face, glowing red arrow, and a timer in the background.",
    category: "Thumbnail",
    priority: "Urgent",
    status: "Revision Needed",
    assigneeId: "u1", // Anoy
    reporterId: "u2", // Choya
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    progress: 80,
    commentsCount: 5,
    attachmentsCount: 3,
  },
  {
    id: "t2",
    title: "Q3 Product Launch Commercial",
    brief:
      "Full 30s spot for the new product. Need motion graphics for the features section. Voiceover is attached.",
    category: "Commercial",
    priority: "High",
    status: "In Progress",
    assigneeId: "u2", // Choya
    reporterId: "u3", // Rodney
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    progress: 45,
    commentsCount: 12,
    attachmentsCount: 8,
  },
  {
    id: "t3",
    title: "TikTok Shorts Batch - Top 5 Tips",
    brief:
      "Cut the main podcast into 5 vertical shorts. Add dynamic captions (yellow/white) and zoom effects on punchlines.",
    category: "Shorts",
    priority: "Medium",
    status: "Waiting for Review",
    assigneeId: "u1", // Anoy
    reporterId: "u2", // Choya
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    progress: 95,
    commentsCount: 2,
    attachmentsCount: 5,
  },
  {
    id: "t4",
    title: "Summer Sale Web Banners",
    brief:
      "Standard sizes (300x250, 728x90, 160x600). Use the new summer brand guidelines. Needs to be bright and punchy.",
    category: "Banner",
    priority: "Low",
    status: "Not Started",
    assigneeId: "u1", // Anoy
    reporterId: "u2", // Choya
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    progress: 0,
    commentsCount: 0,
    attachmentsCount: 1,
  },
  {
    id: "t5",
    title: "Podcast Episode 42 Edit",
    brief:
      "Multicam edit. Clean up audio, remove dead air. Add intro/outro graphics.",
    category: "Other",
    priority: "Medium",
    status: "Waiting for Boss Feedback",
    assigneeId: "u2", // Choya
    reporterId: "u3", // Rodney
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    progress: 90,
    commentsCount: 3,
    attachmentsCount: 2,
  },
  {
    id: "t6",
    title: "Rebrand Announcement Teaser",
    brief:
      "15s hype video for social media. Fast cuts, glitch effects, heavy bass track.",
    category: "Commercial",
    priority: "Urgent",
    status: "Approved",
    assigneeId: "u1", // Anoy
    reporterId: "u3", // Rodney
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // Overdue
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    progress: 100,
    commentsCount: 8,
    attachmentsCount: 4,
  },
];

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
