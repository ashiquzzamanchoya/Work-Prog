import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { statuses, Task } from "@/data/mockData";
import { useTasks } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Paperclip,
  Clock,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import NewTaskModal from "@/components/NewTaskModal";

export default function TaskBoard() {
  const { tasks, updateTask, resetTasks, deleteTask } = useTasks();
  const { currentUser } = useAuth();
  const { users } = useUsers();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [filter, setFilter] = useState<"all" | "mine">("all");

  if (!currentUser) return null;

  const isBoss = currentUser.role === "Boss" || currentUser.role === "admin" || currentUser.email === "lazerlit.me@gmail.com";

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to FRESH START? This will delete all current tasks and other user profiles to give you a clean slate.")) return;
    setIsResetting(true);
    try {
      await resetTasks();
    } finally {
      setIsResetting(false);
    }
  };

  const displayTasks =
    filter === "mine"
      ? tasks.filter(
          (t) =>
            t.assigneeId === currentUser.id || t.reporterId === currentUser.id,
        )
      : tasks;

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

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === overId);

      if (activeTask && overTask && activeTask.status !== overTask.status) {
        updateTask({ ...activeTask, status: overTask.status });
      }
    }

    // Dropping a task over a column
    if (isActiveTask && isOverColumn) {
      const activeTask = tasks.find((t) => t.id === activeId);
      if (activeTask && activeTask.status !== overId) {
        updateTask({ ...activeTask, status: overId as any });
      }
    }
  };

  const handleDragEnd = (event: any) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;
  };

  const handleDeleteTask = async (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    await deleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  const handleStatusChange = async (task: Task, newStatus: string) => {
    await updateTask({ ...task, status: newStatus as any });
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 lg:p-8 pb-4 flex-shrink-0 flex items-center justify-between border-b border-surface-border/50">
        <div>
          <h1 className="text-2xl font-display font-bold">Task Board</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your creative workflow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            {users.slice(0, 4).map((u) => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                className="w-8 h-8 rounded-full border-2 border-background"
              />
            ))}
          </div>
          <button
            onClick={() => setFilter(filter === "all" ? "mine" : "all")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
              filter === "mine"
                ? "bg-primary/20 text-primary border-primary/50"
                : "bg-surface hover:bg-surface-hover text-white border-surface-border",
            )}
          >
            {filter === "mine" ? "My Tasks" : "All Tasks"}
          </button>
          {isBoss && (
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="bg-danger/10 hover:bg-danger/20 text-danger px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-danger/20 flex items-center gap-2 disabled:opacity-50"
              title="FRESH START: Delete all tasks and other user profiles"
            >
              <RotateCcw size={16} className={isResetting ? "animate-spin" : ""} />
              Fresh Start
            </button>
          )}
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New Task
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
            {statuses.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={displayTasks.filter((t) => t.status === status)}
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
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />

      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface border border-surface-border rounded-2xl shadow-2xl w-full max-w-sm p-6"
          >
            <h3 className="text-xl font-display font-bold mb-2">Delete Task?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete "{taskToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 bg-danger hover:bg-danger/90 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
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
  tasks: Task[];
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: string) => void;
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
        <button className="text-gray-500 hover:text-white transition-colors">
          <Plus size={16} />
        </button>
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

function SortableTaskCard({ task, onDelete, onStatusChange }: { task: Task; onDelete: (task: Task) => void; onStatusChange: (task: Task, status: string) => void; key?: string | number }) {
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
  task: Task;
  isOverlay?: boolean;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: string) => void;
  key?: string | number;
}) {
  const navigate = useNavigate();
  const { users } = useUsers();
  const assignee = users.find((u) => u.id === task.assigneeId);
  const isLate =
    isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div
      onClick={() => navigate(`/task/${task.id}`)}
      className={cn(
        "glass-card rounded-xl p-4 group border border-surface-border cursor-grab active:cursor-grabbing bg-surface/80",
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

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <select
            value={task.status}
            onChange={(e) => onStatusChange?.(task, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface text-xs text-gray-200 border border-surface-border hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded px-2 py-1 cursor-pointer transition-all outline-none"
          >
            {statuses.map(s => (
              <option key={s} value={s} className="text-gray-900 bg-white">{s}</option>
            ))}
          </select>
          {assignee && (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-6 h-6 rounded-full border border-surface-border"
            />
          )}
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
