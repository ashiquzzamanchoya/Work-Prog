import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  ListTodo, 
  Calendar, 
  Users, 
  FileBox, 
  Archive, 
  Settings,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { users } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import NewTaskModal from './NewTaskModal';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Task Board', path: '/board', icon: KanbanSquare },
  { name: 'All Tasks', path: '/tasks', icon: ListTodo },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Team Workload', path: '/team', icon: Users },
  { name: 'Templates', path: '/templates', icon: FileBox },
  { name: 'Archive', path: '/archive', icon: Archive },
];

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currentUser, setCurrentUser } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background text-gray-100 flex overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface/50 backdrop-blur-xl border-r border-surface-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-surface-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <span className="font-display font-bold text-white text-lg">C</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight">CreateFlow</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 hide-scrollbar">
          <button 
            onClick={() => setIsNewTaskModalOpen(true)}
            className="w-full mb-6 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95"
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>

          <div className="space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</div>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                  isActive 
                    ? "text-white bg-white/5" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <item.icon size={18} className={cn("transition-colors", isActive ? "text-primary" : "group-hover:text-gray-300")} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 space-y-1">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</div>
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive ? "text-white bg-white/5" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <Settings size={18} className="group-hover:text-gray-300" />
              Settings
            </NavLink>
          </div>
        </div>

        <div className="p-4 border-t border-surface-border/50 relative" ref={userMenuRef}>
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 right-4 mb-2 bg-surface border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Switch User</div>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setIsUserMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left",
                      currentUser.id === u.id && "bg-primary/10 text-primary"
                    )}
                  >
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full border border-surface-border" />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", currentUser.id === u.id ? "text-primary" : "text-white")}>{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.role}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full border border-surface-border" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser.role}</p>
            </div>
            <ChevronUp size={16} className={cn("text-gray-500 transition-transform", isUserMenuOpen && "rotate-180")} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 lg:px-8 bg-background/80 backdrop-blur-md border-b border-surface-border/50 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search tasks, briefs, files..." 
                className="w-64 lg:w-96 bg-surface border border-surface-border rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-surface-hover rounded border border-surface-border">⌘</kbd>
                <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-surface-hover rounded border border-surface-border">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-surface">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-background"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <Outlet />
        </div>
      </main>

      <NewTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} />
    </div>
  );
}
