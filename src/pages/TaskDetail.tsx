import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  MoreHorizontal,
  FileText,
  Plus,
  Maximize2,
  X,
} from "lucide-react";
import { statuses, Task } from "@/data/mockData";
import { useTasks } from "@/context/TaskContext";
import { usePersonalTasks } from "@/context/PersonalTaskContext";
import { useUsers } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

import ReactMarkdown from "react-markdown";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
  const { personalTasks, updatePersonalTask } = usePersonalTasks();
  const { users } = useUsers();
  const { currentUser } = useAuth();
  const [isBriefExpanded, setIsBriefExpanded] = useState(false);

  // For demo purposes, if no ID or not found, use the first task
  const task = tasks.find((t) => t.id === id) || personalTasks.find((t) => t.id === id) || tasks[0];
  const isPersonalTask = personalTasks.some((t) => t.id === task?.id);
  const assignee = users.find((u) => u.id === task?.assigneeId);
  const reporter = users.find((u) => u.id === task?.reporterId);
  const isLate = task
    ? isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
    : false;

  if (!task) return <div className="p-8 text-white">Task not found</div>;

  // Helper to parse script-like content
  const parseScript = (text: string) => {
    const scenes: any[] = [];
    const sceneRegex = /🎥\s*Scene\s*(\d+)\s*\((.*?)\)/gi;
    const parts = text.split(sceneRegex);
    
    // The split will give us: [pre-scene-text, sceneNum, time, sceneContent, sceneNum, time, sceneContent, ...]
    const intro = parts[0];
    
    for (let i = 1; i < parts.length; i += 3) {
      const num = parts[i];
      const time = parts[i + 1];
      const content = parts[i + 2] || "";
      
      const visual = content.match(/Visual:\s*(.*)/i)?.[1]?.trim() || "";
      const caption = content.match(/Caption:\s*([\s\S]*?)(?=Voice:|$)/i)?.[1]?.trim() || "";
      const voice = content.match(/Voice:\s*([\s\S]*?)(?=$)/i)?.[1]?.trim() || "";
      
      scenes.push({ num, time, visual, caption, voice });
    }
    
    return { intro, scenes };
  };

  const { intro, scenes } = parseScript(task.brief);
  const isScript = scenes.length > 0;

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
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">Project Brief</h3>
                    <p className="text-sm text-gray-500 italic">Creative direction and requirements</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBriefExpanded(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-border/30 hover:bg-surface-border/50 text-xs font-medium text-gray-300 rounded-lg transition-colors border border-surface-border/50"
                >
                  <Maximize2 size={14} /> Expand
                </button>
              </div>

              {/* Intro / General Description */}
              <div className="glass-card rounded-2xl p-8 border border-surface-border/50 bg-surface/20 shadow-xl">
                <div className="prose prose-invert max-w-none">
                  <div className="text-lg text-gray-200 leading-relaxed font-light whitespace-pre-wrap">
                    <ReactMarkdown>{isScript ? intro : task.brief}</ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Script / Storyboard View */}
              {isScript && (
                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary px-2">Storyboard / Script</h4>
                  <div className="space-y-4">
                    {scenes.map((scene, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card rounded-2xl border border-surface-border/50 bg-surface/30 overflow-hidden"
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-48 bg-black/20 p-6 border-b md:border-b-0 md:border-r border-surface-border/30 flex flex-col justify-center items-center text-center">
                            <span className="text-xs font-bold text-primary uppercase tracking-tighter mb-1">Scene</span>
                            <span className="text-4xl font-display font-black text-white leading-none">{scene.num}</span>
                            <span className="mt-3 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary border border-primary/20">
                              {scene.time}
                            </span>
                          </div>
                          <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Visual</h5>
                              <p className="text-sm text-gray-200 leading-relaxed">{scene.visual}</p>
                            </div>
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-warning">Caption</h5>
                              <p className="text-sm text-warning/90 leading-relaxed italic whitespace-pre-wrap">
                                {scene.caption}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Voice</h5>
                              <p className="text-sm text-gray-300 leading-relaxed bg-black/10 p-3 rounded-lg border border-white/5">
                                "{scene.voice}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Category Elements (e.g. Thumbnail) */}
              {task.category === "Thumbnail" && !isScript && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface/40 rounded-xl p-6 border border-surface-border/30">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-warning mb-4">Visual Elements</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0"></span>
                        <span><strong>Text:</strong> "I SURVIVED" (Big, bold, yellow)</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0"></span>
                        <span><strong>Face:</strong> Shocked expression, high contrast</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0"></span>
                        <span><strong>Background:</strong> Dark, moody, blurred</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface/40 rounded-xl p-6 border border-surface-border/30">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-danger mb-4">Key Objectives</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0"></span>
                        <span>Maximize Click-Through Rate (CTR)</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0"></span>
                        <span>Maintain brand consistency with MrBeast style</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
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
                onChange={(e) => {
                  if (isPersonalTask) {
                    updatePersonalTask({
                      ...task,
                      status: e.target.value as any,
                    } as any);
                  } else {
                    updateTask({
                      ...task,
                      status: e.target.value as any,
                    } as any);
                  }
                }}
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

      {/* Expanded Brief Modal */}
      <AnimatePresence>
        {isBriefExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-6xl h-full max-h-[90vh] bg-surface rounded-3xl border border-surface-border shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-surface-border bg-surface/50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">Full Project Brief</h2>
                    <p className="text-sm text-gray-400">{task.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBriefExpanded(false)}
                  className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div className="max-w-4xl mx-auto space-y-12">
                  {/* Original Script Section */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Original Script / Content</h3>
                      <div className="h-px flex-1 bg-surface-border/50 ml-6"></div>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-xl text-gray-200 leading-relaxed font-light whitespace-pre-wrap bg-black/20 p-8 rounded-3xl border border-white/5 shadow-inner">
                        <ReactMarkdown>{task.brief}</ReactMarkdown>
                      </div>
                    </div>
                  </section>

                  {/* Visual Storyboard Breakdown (If script) */}
                  {isScript && (
                    <section className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Storyboard Breakdown</h3>
                        <div className="h-px flex-1 bg-surface-border/50 ml-6"></div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {scenes.map((scene, idx) => (
                          <div
                            key={idx}
                            className="bg-surface/40 rounded-3xl border border-surface-border/50 overflow-hidden flex flex-col md:flex-row"
                          >
                            <div className="w-full md:w-40 bg-black/30 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-surface-border/30">
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Scene</span>
                              <span className="text-5xl font-display font-black text-white">{scene.num}</span>
                              <span className="mt-4 px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary border border-primary/20">
                                {scene.time}
                              </span>
                            </div>
                            <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-3">
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Visual Direction</h5>
                                <p className="text-base text-gray-200 leading-relaxed">{scene.visual}</p>
                              </div>
                              <div className="space-y-3">
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-warning">On-Screen Caption</h5>
                                <p className="text-base text-warning/90 leading-relaxed italic font-medium whitespace-pre-wrap">
                                  {scene.caption}
                                </p>
                              </div>
                              <div className="space-y-3">
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Voiceover / Audio</h5>
                                <p className="text-base text-gray-300 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">
                                  "{scene.voice}"
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex-shrink-0 p-6 border-t border-surface-border bg-surface/50 flex justify-end">
                <button
                  onClick={() => setIsBriefExpanded(false)}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                >
                  Close Brief
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
