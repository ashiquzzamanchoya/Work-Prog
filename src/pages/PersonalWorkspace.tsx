import { useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, Category, Priority, Status } from "@/data/mockData";
import { usePersonalTasks, PersonalTask } from "@/context/PersonalTaskContext";
import { useTasks } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Clock,
  MoreHorizontal,
  Plus,
  X,
  Trash2,
  Calendar,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";

export default function PersonalWorkspace() {
  const { personalTasks, updatePersonalTask, addPersonalTask, deletePersonalTask } = usePersonalTasks();
  const { tasks, updateTask, deleteTask } = useTasks();
  const { currentUser } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  if (!currentUser || currentUser.email !== "lazerlit.me@gmail.com") {
    return (
      <div className="p-8 text-center text-gray-400">
        You do not have access to this page.
      </div>
    );
  }

  const myMainTasks = tasks.filter(t => t.assigneeId === currentUser.id).map(t => ({ ...t, isMainTask: true }));
  const myPersonalTasks = personalTasks.map(t => ({ ...t, isMainTask: false }));
  const allMyTasks = [...myMainTasks, ...myPersonalTasks];

  const personalStatuses = ["New Request", "Not Started", "In Progress", "Completed"];

  const getColumnTasks = (status: string) => {
    if (status === "In Progress") {
      return allMyTasks.filter(t => !["New Request", "Not Started", "Completed"].includes(t.status));
    }
    return allMyTasks.filter(t => t.status === status);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      const activeTask = allMyTasks.find((t) => t.id === activeId);
      const overTask = allMyTasks.find((t) => t.id === overId);

      if (activeTask && overTask && activeTask.status !== overTask.status) {
        const { isMainTask, ...taskData } = activeTask;
        if (isMainTask) {
          updateTask({ ...taskData, status: overTask.status as any });
        } else {
          updatePersonalTask({ ...(taskData as PersonalTask), status: overTask.status as any });
        }
      }
    }

    if (isActiveTask && isOverColumn) {
      const activeTask = allMyTasks.find((t) => t.id === activeId);
      if (activeTask && activeTask.status !== overId) {
        const { isMainTask, ...taskData } = activeTask;
        if (isMainTask) {
          updateTask({ ...taskData, status: overId as any });
        } else {
          updatePersonalTask({ ...(taskData as PersonalTask), status: overId as any });
        }
      }
    }
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
  };

  const handleDeleteTask = async (task: any) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    if (task.isMainTask) {
      await deleteTask(task.id);
    } else {
      await deletePersonalTask(task.id);
    }
  };

  const handleStatusChange = (task: any, newStatus: string) => {
    const { isMainTask, ...taskData } = task;
    if (isMainTask) {
      updateTask({ ...taskData, status: newStatus as any });
    } else {
      updatePersonalTask({ ...(taskData as PersonalTask), status: newStatus as any });
    }
  };

  const activeTask = activeId ? allMyTasks.find((t) => t.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 lg:p-8 pb-4 flex-shrink-0 flex items-center justify-between border-b border-surface-border/50">
        <div>
          <h1 className="text-2xl font-display font-bold">Personal Workspace</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track your personal and outside work
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New Personal Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 lg:p-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full items-start">
            {personalStatuses.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={getColumnTasks(status)}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      {isNewTaskModalOpen && (
        <NewPersonalTaskModal
          onClose={() => setIsNewTaskModalOpen(false)}
          onAdd={addPersonalTask}
          userId={currentUser.id}
        />
      )}
    </div>
  );
}

function Column({
  status,
  tasks,
  onDelete,
  onStatusChange,
}: {
  status: string;
  tasks: any[];
  onDelete: (task: any) => void;
  onStatusChange: (task: any, status: string) => void;
  key?: string | number;
}) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: "Column", status },
  });

  return (
    <div className="flex flex-col w-80 flex-shrink-0 max-h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-medium text-sm text-gray-300 flex items-center gap-2">
          {status}
          <span className="bg-surface-border text-gray-400 text-[10px] px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto bg-surface/30 rounded-xl p-2 border border-surface-border/50 min-h-[150px]"
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} onDelete={onDelete} onStatusChange={onStatusChange} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTaskCard({ task, onDelete, onStatusChange }: { task: any; onDelete: (task: any) => void; onStatusChange: (task: any, status: string) => void; key?: string | number }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="glass-card rounded-xl p-4 border-2 border-primary/50 opacity-30 h-[140px]"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onDelete={onDelete} onStatusChange={onStatusChange} />
    </div>
  );
}

function TaskCard({
  task,
  isOverlay,
  onDelete,
  onStatusChange,
}: {
  task: any;
  isOverlay?: boolean;
  onDelete?: (task: any) => void;
  onStatusChange?: (task: any, status: string) => void;
  key?: string | number;
}) {
  const isLate =
    isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  const displayStatus = ["New Request", "Not Started", "Completed"].includes(task.status) ? task.status : "In Progress";

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-4 group border border-surface-border cursor-grab active:cursor-grabbing bg-surface/80 relative",
        isOverlay && "rotate-2 scale-105 shadow-2xl border-primary/50",
        !isOverlay && "hover:border-surface-border/80 hover:bg-surface",
      )}
    >
      <div className="flex items-start justify-between mb-2">
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
          {task.isMainTask && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
              Team
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(task);
          }}
          className="text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h4 className="text-sm font-medium text-gray-100 mb-2 leading-snug">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-4 border-t border-surface-border/50 pt-3">
        <div className="flex items-center gap-2">
          <select
            value={displayStatus}
            onChange={(e) => onStatusChange?.(task, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface text-xs text-gray-200 border border-surface-border hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded px-2 py-1 cursor-pointer transition-all outline-none"
          >
            <option value="New Request" className="text-gray-900 bg-white">New Request</option>
            <option value="Not Started" className="text-gray-900 bg-white">Not Started</option>
            <option value="In Progress" className="text-gray-900 bg-white">In Progress</option>
            <option value="Completed" className="text-gray-900 bg-white">Completed</option>
          </select>
        </div>
        <div
          className={cn(
            "text-[10px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded",
            isLate
              ? "text-danger bg-danger/10"
              : isToday(new Date(task.dueDate))
                ? "text-warning bg-warning/10"
                : "text-gray-400",
          )}
        >
          <Clock size={10} />
          {format(new Date(task.dueDate), "MMM d")}
        </div>
      </div>
    </div>
  );
}

function NewPersonalTaskModal({ onClose, onAdd, userId }: { onClose: () => void, onAdd: (t: PersonalTask) => Promise<void>, userId: string }) {
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [category, setCategory] = useState<Category>("Other");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const newTask: PersonalTask = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        brief,
        category,
        priority,
        status: "Not Started",
        assigneeId: userId,
        reporterId: userId,
        dueDate: new Date(dueDate).toISOString(),
        createdAt: new Date().toISOString(),
        progress: 0,
        userId: userId,
      };

      await onAdd(newTask);
      onClose();
    } catch (error) {
      console.error("Failed to add personal task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface border border-surface-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-border/50">
          <h2 className="text-xl font-display font-bold">New Personal Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-surface-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Details / Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="w-full bg-background border border-surface-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors resize-none h-24"
              placeholder="Add any links or notes here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-background border border-surface-border rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  required
                />
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
