import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { users, categories, priorities, Category, Priority, Task } from '@/data/mockData';
import { useTasks } from '@/context/TaskContext';

export default function NewTaskModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addTask } = useTasks();
  
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<Category>('Other');
  const [priority, setPriority] = useState<Priority>('Medium');

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newTask: Task = {
      id: `t${Date.now()}`,
      title,
      brief,
      category,
      priority,
      status: 'New Request',
      assigneeId: assigneeId || null,
      reporterId: users[0].id, // Mocking current user
      dueDate: dueDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      progress: 0,
      commentsCount: 0,
      attachmentsCount: 0,
    };

    addTask(newTask);
    
    // Reset form
    setTitle('');
    setBrief('');
    setAssigneeId('');
    setDueDate('');
    setCategory('Other');
    setPriority('Medium');
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface/90 backdrop-blur-xl border border-surface-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-surface-border/50">
              <h2 className="text-xl font-display font-semibold">Create New Task</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <input 
                  type="text" 
                  placeholder="Task Title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-2xl font-display font-medium text-white placeholder:text-gray-600 focus:outline-none"
                  autoFocus
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="relative">
                  <select 
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="appearance-none flex items-center gap-2 pl-8 pr-8 py-1.5 rounded-lg bg-surface border border-surface-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors focus:outline-none cursor-pointer"
                  >
                    <option value="">Assignee</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="appearance-none flex items-center gap-2 pl-8 pr-4 py-1.5 rounded-lg bg-surface border border-surface-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="appearance-none flex items-center gap-2 pl-8 pr-8 py-1.5 rounded-lg bg-surface border border-surface-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors focus:outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="appearance-none flex items-center gap-2 pl-8 pr-8 py-1.5 rounded-lg bg-surface border border-surface-border text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors focus:outline-none cursor-pointer"
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <Flag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <textarea 
                  placeholder="Write a detailed brief..." 
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className="w-full h-32 bg-surface/50 border border-surface-border rounded-xl p-4 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-border/50 bg-black/20">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary/90 text-white transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Create Task
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
