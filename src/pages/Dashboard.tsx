import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MoreHorizontal,
  Folder,
} from "lucide-react";
import { useTasks } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { format, isToday, isPast, formatDistanceToNow } from "date-fns";
import { RotateCcw } from "lucide-react";
import { categories } from "@/data/mockData";

import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function Dashboard() {
  const { tasks, resetTasks } = useTasks();
  const { currentUser } = useAuth();
  const { users } = useUsers();
  const [isResetting, setIsResetting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    "focus" | "active" | "due" | "review" | "completed"
  >("focus");

  const isAdminUser = currentUser.role === "Boss" || currentUser.role === "admin" || currentUser.email === "lazerlit.me@gmail.com";
  const isBossView = currentUser.role === "Boss" || currentUser.role === "admin";

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to FRESH START? This will delete all current tasks and other user profiles to give you a clean slate.")) return;
    setIsResetting(true);
    try {
      await resetTasks();
    } finally {
      setIsResetting(false);
    }
  };

  if (!currentUser) return null;

  // Filter tasks based on role
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);
  const tasksIManage = tasks.filter((t) => t.reporterId === currentUser.id);

  let focusTasks: any[] = [];
  let activeTasks: any[] = [];
  let dueTodayTasks: any[] = [];
  let reviewTasks: any[] = [];
  let completedTasks: any[] = [];
  let recentActivity: any[] = [];

  if (
    !isBossView && (currentUser.role === "Graphics Designer" || currentUser.role === "Manager")
  ) {
    const myUrgent = myTasks.filter(
      (t) =>
        (t.priority === "Urgent" && t.status !== "Completed") ||
        (isPast(new Date(t.dueDate)) && t.status !== "Completed"),
    );
    const teamReview =
      currentUser.role === "Manager"
        ? tasksIManage.filter((t) => t.status === "Waiting for Review")
        : [];

    focusTasks = Array.from(new Set([...myUrgent, ...teamReview]));
    activeTasks = myTasks.filter((t) => t.status !== "Completed");
    dueTodayTasks = myTasks.filter(
      (t) => isToday(new Date(t.dueDate)) && t.status !== "Completed",
    );
    reviewTasks =
      currentUser.role === "Manager"
        ? teamReview
        : myTasks.filter(
            (t) =>
              t.status === "Waiting for Review" ||
              t.status === "Waiting for Boss Feedback",
          );
    completedTasks = myTasks.filter((t) => t.status === "Completed");
  } else {
    // Boss sees everything urgent or waiting for feedback
    focusTasks = tasks.filter(
      (t) =>
        (t.status === "Waiting for Boss Feedback" || t.priority === "Urgent") && t.status !== "Completed",
    );
    activeTasks = tasks.filter((t) => t.status !== "Completed");
    dueTodayTasks = tasks.filter(
      (t) => isToday(new Date(t.dueDate)) && t.status !== "Completed",
    );
    reviewTasks = tasks.filter((t) => t.status === "Waiting for Boss Feedback");
    completedTasks = tasks.filter((t) => t.status === "Completed");
  }

  const allRelevantTasks = !isBossView && (currentUser.role === "Graphics Designer" || currentUser.role === "Manager")
    ? Array.from(new Set([...myTasks, ...tasksIManage]))
    : tasks;

  recentActivity = allRelevantTasks
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 4);

  const activeProjects = Array.from(
    new Set(tasks.filter((t) => t.status !== "Completed").map((t) => t.category)),
  );

  const displayedTasks =
    activeFilter === "focus"
      ? focusTasks.slice(0, 5)
      : activeFilter === "active"
        ? activeTasks
        : activeFilter === "due"
          ? dueTodayTasks
          : activeFilter === "review"
            ? reviewTasks
            : activeFilter === "completed"
              ? completedTasks
              : focusTasks.slice(0, 5);

  const getSectionTitle = () => {
    if (activeFilter === "focus")
      return (!isBossView) ? "Today's Focus" : "Needs Attention";
    if (activeFilter === "active")
      return (!isBossView)
        ? "My Active Tasks"
        : "Total Active Tasks";
    if (activeFilter === "due") return "Due Today";
    if (activeFilter === "review")
      return isBossView
        ? "Awaiting Feedback"
        : "Pending Review";
    if (activeFilter === "completed") return "Completed Tasks";
    return "Tasks";
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Good morning, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="text-gray-400">
              {!isBossView
                ? "Here are your tasks for today."
                : "Here's the high-level overview of all projects."}
            </p>
          </div>
          {isAdminUser && (
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-xl border border-danger/20 transition-all text-sm font-bold disabled:opacity-50"
            >
              <RotateCcw size={16} className={isResetting ? "animate-spin" : ""} />
              Fresh Start (Clear All)
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
      >
        <KpiCard
          title={!isBossView ? "My Active Tasks" : "Total Active"}
          value={activeTasks.length}
          trend="+3 this week"
          icon={TrendingUp}
          color="text-primary"
          bg="bg-primary/10"
          isActive={activeFilter === "active"}
          onClick={() => setActiveFilter("active")}
        />
        <KpiCard
          title="Active Projects"
          value={activeProjects.length}
          trend="Across categories"
          icon={Folder}
          color="text-indigo-400"
          bg="bg-indigo-400/10"
          isActive={false}
          onClick={() => {}}
        />
        <KpiCard
          title={!isBossView ? "Due Today" : "Urgent"}
          value={dueTodayTasks.length}
          trend={!isBossView ? "2 urgent" : "Needs attention"}
          icon={Clock}
          color="text-warning"
          bg="bg-warning/10"
          isActive={activeFilter === "due"}
          onClick={() => setActiveFilter("due")}
        />
        <KpiCard
          title={isBossView ? "Awaiting Feedback" : "Pending Review"}
          value={reviewTasks.length}
          trend="Needs attention"
          icon={AlertCircle}
          color="text-secondary"
          bg="bg-secondary/10"
          isActive={activeFilter === "review"}
          onClick={() => setActiveFilter("review")}
        />
        <KpiCard
          title="Completed"
          value={completedTasks.length}
          trend="This week"
          icon={CheckCircle2}
          color="text-success"
          bg="bg-success/10"
          isActive={activeFilter === "completed"}
          onClick={() => setActiveFilter("completed")}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                {activeFilter === "focus" && (
                  <span className="w-2 h-2 rounded-full bg-danger glow-danger"></span>
                )}
                {getSectionTitle()}
              </h2>
              {activeFilter !== "focus" && (
                <button
                  onClick={() => setActiveFilter("focus")}
                  className="text-sm text-gray-400 hover:text-white font-medium transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="space-y-3">
              {displayedTasks.length > 0 ? (
                displayedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="glass-card rounded-xl p-8 text-center border border-surface-border border-dashed">
                  <p className="text-gray-400">
                    No tasks found for this category.
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold">
                Recent Activity
              </h2>
            </div>
            <div className="glass-card rounded-2xl p-1">
              {recentActivity.map((task, i) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-4 p-4 hover:bg-white/5 transition-colors rounded-xl cursor-pointer",
                    i !== recentActivity.length - 1 &&
                      "border-b border-surface-border/50",
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-surface-border flex items-center justify-center flex-shrink-0 mt-1">
                    <img
                      src={users.find((u) => u.id === task.assigneeId)?.avatar}
                      alt=""
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">
                        {users.find((u) => u.id === task.assigneeId)?.name}
                      </span>{" "}
                      updated status to{" "}
                      <span className="text-primary">{task.status}</span>
                    </p>
                    <p className="text-sm font-medium text-white mt-0.5 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(task.updatedAt || task.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-xl font-display font-semibold mb-4">
              Active Projects
            </h2>
            <div className="glass-card rounded-2xl p-5 space-y-5">
              {categories.map((cat) => {
                const catTasks = tasks.filter((t) => t.category === cat);
                const activeCatTasks = catTasks.filter(
                  (t) => t.status !== "Completed",
                );
                if (activeCatTasks.length === 0) return null;

                const total = catTasks.length;
                const completed = catTasks.filter(
                  (t) => t.status === "Completed",
                );
                const progress =
                  total > 0 ? Math.round((completed.length / total) * 100) : 0;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium text-gray-200">
                          {cat}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {activeCatTasks.length} active
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-xl font-display font-semibold mb-4">
              Team Workload
            </h2>
            <div className="glass-card rounded-2xl p-5 space-y-5">
              {users.map((user) => {
                const userActiveTasks = tasks.filter(
                  (t) => t.assigneeId === user.id && t.status !== "Completed",
                );
                // Calculate workload: 5 tasks = 100%
                const workload = Math.min(
                  Math.round((userActiveTasks.length / 5) * 100),
                  100,
                );
                return (
                  <div key={user.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-200">
                          {user.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {userActiveTasks.length} tasks ({workload}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          workload > 80
                            ? "bg-danger"
                            : workload > 60
                              ? "bg-warning"
                              : "bg-primary",
                        )}
                        style={{ width: `${workload}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <h3 className="text-lg font-display font-semibold mb-2">
                  Need a new brief?
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Use our smart templates to create comprehensive briefs in
                  seconds.
                </p>
                <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
                  Browse Templates
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  trend,
  icon: Icon,
  color,
  bg,
  onClick,
  isActive,
}: any) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className={cn(
        "glass-card rounded-2xl p-5 relative overflow-hidden group cursor-pointer transition-all duration-300",
        isActive
          ? "border-primary/50 bg-surface/80 shadow-[0_0_30px_rgba(99,102,241,0.15)]"
          : "hover:bg-surface/60 hover:border-surface-border/80",
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 p-4 transition-all transform duration-500",
          isActive
            ? "opacity-30 scale-110"
            : "opacity-10 group-hover:opacity-20 group-hover:scale-110",
        )}
      >
        <Icon size={64} className={color} />
      </div>
      <div className="relative z-10">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
            bg,
            color,
          )}
        >
          <Icon size={20} />
        </div>
        <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-white mb-2">
          {value}
        </h3>
        <p className="text-xs text-gray-500">{trend}</p>
      </div>
    </motion.div>
  );
}

function TaskCard({ task }: { task: any; key?: string | number }) {
  const navigate = useNavigate();
  const { users } = useUsers();
  const assignee = users.find((u) => u.id === task.assigneeId);
  const isLate =
    isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div
      onClick={() => navigate(`/task/${task.id}`)}
      className="glass-card rounded-xl p-4 hover:bg-surface/80 transition-all cursor-pointer group border border-surface-border hover:border-surface-border/80"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
              task.priority === "Urgent"
                ? "bg-danger/20 text-danger border border-danger/20"
                : task.priority === "High"
                  ? "bg-warning/20 text-warning border border-warning/20"
                  : "bg-surface-border text-gray-400",
            )}
          >
            {task.priority}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {task.category}
          </span>
        </div>
        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <h4 className="text-base font-medium text-gray-100 mb-3 group-hover:text-primary transition-colors line-clamp-1">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-border/50">
        <div className="flex items-center gap-3">
          {assignee && (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-6 h-6 rounded-full border border-surface-border"
              title={assignee.name}
            />
          )}
        </div>
        <div
          className={cn(
            "text-xs font-medium flex items-center gap-1.5 px-2 py-1 rounded-md",
            isLate
              ? "text-danger bg-danger/10"
              : isToday(new Date(task.dueDate))
                ? "text-warning bg-warning/10"
                : "text-gray-400",
          )}
        >
          <Clock size={12} />
          {format(new Date(task.dueDate), "MMM d")}
        </div>
      </div>
    </div>
  );
}
