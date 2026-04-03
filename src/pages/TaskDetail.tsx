import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Paperclip,
  MessageSquare,
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  Video,
  Send,
  Plus,
} from "lucide-react";
import { statuses, Task } from "@/data/mockData";
import { useTasks } from "@/context/TaskContext";
import { useUsers } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
  const { users } = useUsers();
  const { currentUser } = useAuth();

  // For demo purposes, if no ID or not found, use the first task
  const task = tasks.find((t) => t.id === id) || tasks[0];
  const assignee = users.find((u) => u.id === task?.assigneeId);
  const reporter = users.find((u) => u.id === task?.reporterId);
  const isLate = task
    ? isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
    : false;

  if (!task) return <div className="p-8 text-white">Task not found</div>;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-surface-border/50 bg-surface/30 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3"></div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                    task.priority === "Urgent"
                      ? "bg-danger/20 text-danger border border-danger/20"
                      : task.priority === "High"
                        ? "bg-warning/20 text-warning border border-warning/20"
                        : "bg-surface-border text-gray-400",
                  )}
                >
                  {task.priority}
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface border border-surface-border text-gray-300">
                  {task.category}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-primary font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary glow-primary"></span>
                  {task.status}
                </span>
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                {task.title}
              </h1>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                Created {format(new Date(task.createdAt), "MMM d, yyyy")} by
                <span className="font-medium text-gray-200">
                  {reporter?.name}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-6 bg-surface/50 p-4 rounded-xl border border-surface-border/50">
              <div>
                <p className="text-xs text-gray-500 mb-1">Assignee</p>
                <div className="flex items-center gap-2">
                  {assignee ? (
                    <>
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-white">
                        {assignee.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium",
                    isLate
                      ? "text-danger"
                      : isToday(new Date(task.dueDate))
                        ? "text-warning"
                        : "text-white",
                  )}
                >
                  <Clock size={16} />
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Brief */}
            <section className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Creative Brief
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">{task.brief}</p>
                {/* Mocking some extra brief content */}
                {task.category === "Thumbnail" && (
                  <ul className="mt-4 space-y-2 text-gray-300">
                    <li>
                      <strong>Text:</strong> "I SURVIVED" (Big, bold, yellow)
                    </li>
                    <li>
                      <strong>Face:</strong> Shocked expression, high contrast
                    </li>
                    <li>
                      <strong>Background:</strong> Dark, moody, blurred
                    </li>
                  </ul>
                )}
              </div>
            </section>

            {/* Attachments */}
            <section className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold flex items-center gap-2">
                  <Paperclip size={20} className="text-primary" />
                  Attachments ({task.attachmentsCount})
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Mock Attachments */}
                <div className="group relative aspect-video bg-surface rounded-xl border border-surface-border overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-hover">
                    <ImageIcon size={32} className="text-gray-600" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xs font-medium text-white truncate">
                      reference_1.jpg
                    </p>
                    <p className="text-[10px] text-gray-400">2.4 MB</p>
                  </div>
                </div>
                <div className="group relative aspect-video bg-surface rounded-xl border border-surface-border overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-hover">
                    <Video size={32} className="text-gray-600" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xs font-medium text-white truncate">
                      raw_footage.mp4
                    </p>
                    <p className="text-[10px] text-gray-400">1.2 GB</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Comments */}
            <section className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                Discussion
              </h3>

              <div className="space-y-6 mb-6">
                {/* Mock Comments */}
                <div className="flex gap-4">
                  <img
                    src={reporter?.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-sm text-white">
                        {reporter?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Yesterday at 2:30 PM
                      </span>
                    </div>
                    <div className="bg-surface p-3 rounded-xl rounded-tl-none border border-surface-border text-sm text-gray-300">
                      Hey {assignee?.name}, can we make the red arrow a bit more
                      vibrant? It's getting lost in the background.
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <img
                    src={assignee?.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-sm text-white">
                        {assignee?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Today at 9:15 AM
                      </span>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-xl rounded-tl-none border border-primary/20 text-sm text-gray-200">
                      Good call. I've updated it and uploaded v2. Let me know
                      what you think!
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <img
                  src={currentUser?.avatar || ""}
                  alt=""
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Add a comment or update..."
                    className="w-full bg-surface border border-surface-border rounded-xl p-3 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[80px] resize-none"
                  />
                  <button className="absolute bottom-3 right-3 p-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Action Panel */}
            <section className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Update Status
              </h3>
              <select
                value={task.status}
                onChange={(e) =>
                  updateTask({
                    ...task,
                    status: e.target.value as Task["status"],
                  })
                }
                className="w-full bg-surface border border-surface-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 cursor-pointer appearance-none"
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-[#1a1a1a] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </section>

            {/* Details */}
            <section className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Project/Show</p>
                  <p className="text-sm font-medium text-white">Main Channel</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Platform</p>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-1 bg-surface rounded text-xs text-gray-300 border border-surface-border">
                      YouTube
                    </span>
                    <span className="px-2 py-1 bg-surface rounded text-xs text-gray-300 border border-surface-border">
                      Twitter
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Time Tracked</p>
                  <p className="text-sm font-medium text-white">4h 30m</p>
                </div>
              </div>
            </section>

            {/* Activity Log */}
            <section className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Activity
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[9px] before:w-[2px] before:bg-surface-border">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-[20px] h-[20px] bg-background rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full glow-primary"></div>
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">
                      {assignee?.name}
                    </span>{" "}
                    moved to In Progress
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">2 days ago</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-[20px] h-[20px] bg-background rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-surface-border rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-white">
                      {reporter?.name}
                    </span>{" "}
                    created task
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">3 days ago</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
