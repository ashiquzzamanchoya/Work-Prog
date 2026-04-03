import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { statuses, users, Task } from '@/data/mockData';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { MessageSquare, Paperclip, Clock, MoreHorizontal, Plus } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import NewTaskModal from '@/components/NewTaskModal';

export default function TaskBoard() {
  const { tasks, setTasks } = useTasks();
  const { currentUser } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const displayTasks = filter === 'mine' 
    ? tasks.filter(t => t.assigneeId === currentUser.id || t.reporterId === currentUser.id)
    : tasks;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Dropping a task over a column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex].status = overId;
        return arrayMove(newTasks, activeIndex, activeIndex);
      });
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

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 lg:p-8 pb-4 flex-shrink-0 flex items-center justify-between border-b border-surface-border/50">
        <div>
          <h1 className="text-2xl font-display font-bold">Task Board</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your creative workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            {users.slice(0, 4).map(u => (
              <img key={u.id} src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border-2 border-background" />
            ))}
          </div>
          <button 
            onClick={() => setFilter(filter === 'all' ? 'mine' : 'all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
              filter === 'mine' 
                ? "bg-primary/20 text-primary border-primary/50" 
                : "bg-surface hover:bg-surface-hover text-white border-surface-border"
            )}
          >
            {filter === 'mine' ? 'My Tasks' : 'All Tasks'}
          </button>
          <button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 lg:p-8 hide-scrollbar">
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
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      <NewTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} />
    </div>
  );
}

function Column({ status, tasks }: { status: string; tasks: Task[]; key?: string | number }) {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status },
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
        className="flex-1 overflow-y-auto hide-scrollbar bg-surface/30 rounded-xl p-2 border border-surface-border/50 min-h-[150px]"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTaskCard({ task }: { task: Task; key?: string | number }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
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
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task, isOverlay }: { task: Task; isOverlay?: boolean; key?: string | number }) {
  const navigate = useNavigate();
  const assignee = users.find(u => u.id === task.assigneeId);
  const isLate = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div 
      onClick={() => navigate(`/task/${task.id}`)}
      className={cn(
      "glass-card rounded-xl p-4 group border border-surface-border cursor-grab active:cursor-grabbing bg-surface/80",
      isOverlay && "rotate-2 scale-105 shadow-2xl border-primary/50",
      !isOverlay && "hover:border-surface-border/80 hover:bg-surface"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
            task.priority === 'Urgent' ? "bg-danger/20 text-danger border border-danger/20" :
            task.priority === 'High' ? "bg-warning/20 text-warning border border-warning/20" :
            "bg-surface-border text-gray-400"
          )}>
            {task.priority}
          </span>
        </div>
        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <h4 className="text-sm font-medium text-gray-100 mb-2 leading-snug">{task.title}</h4>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          {assignee && (
            <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full border border-surface-border" />
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {task.commentsCount > 0 && <span className="flex items-center gap-1"><MessageSquare size={12} /> {task.commentsCount}</span>}
            {task.attachmentsCount > 0 && <span className="flex items-center gap-1"><Paperclip size={12} /> {task.attachmentsCount}</span>}
          </div>
        </div>
        <div className={cn(
          "text-[10px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded",
          isLate ? "text-danger bg-danger/10" : isToday(new Date(task.dueDate)) ? "text-warning bg-warning/10" : "text-gray-400"
        )}>
          <Clock size={10} />
          {format(new Date(task.dueDate), 'MMM d')}
        </div>
      </div>
    </div>
  );
}
