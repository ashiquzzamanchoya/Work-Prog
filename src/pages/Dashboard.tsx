import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  MoreHorizontal,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { users } from '@/data/mockData';
import { useTasks } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { format, isToday, isPast } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function Dashboard() {
  const { tasks } = useTasks();
  const { currentUser } = useAuth();
  
  // Filter tasks based on role
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const tasksIManage = tasks.filter(t => t.reporterId === currentUser.id);
  
  let urgentTasks = [];
  let recentActivity = [];
  
  if (currentUser.role === 'Graphics Designer') {
    urgentTasks = myTasks.filter(t => t.priority === 'Urgent' || (isPast(new Date(t.dueDate)) && t.status !== 'Completed')).slice(0, 3);
    recentActivity = myTasks.slice(0, 4);
  } else if (currentUser.role === 'Manager') {
    urgentTasks = tasksIManage.filter(t => t.status === 'Waiting for Review' || t.priority === 'Urgent').slice(0, 3);
    recentActivity = tasksIManage.slice(0, 4);
  } else {
    // Boss sees everything urgent or waiting for feedback
    urgentTasks = tasks.filter(t => t.status === 'Waiting for Boss Feedback' || t.priority === 'Urgent').slice(0, 3);
    recentActivity = tasks.slice(0, 4);
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold mb-2">Good morning, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-gray-400">
          {currentUser.role === 'Graphics Designer' ? "Here are your tasks for today." :
           currentUser.role === 'Manager' ? "Here's the team's progress." :
           "Here's the high-level overview of all projects."}
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <KpiCard 
          title={currentUser.role === 'Graphics Designer' ? "My Active Tasks" : "Total Active"} 
          value={currentUser.role === 'Graphics Designer' ? myTasks.filter(t => t.status !== 'Completed').length : tasks.filter(t => t.status !== 'Completed').length} 
          trend="+3 this week" 
          icon={TrendingUp} 
          color="text-primary" 
          bg="bg-primary/10" 
        />
        <KpiCard 
          title={currentUser.role === 'Graphics Designer' ? "Due Today" : "Urgent"} 
          value={currentUser.role === 'Graphics Designer' ? myTasks.filter(t => isToday(new Date(t.dueDate))).length : tasks.filter(t => t.priority === 'Urgent').length} 
          trend={currentUser.role === 'Graphics Designer' ? "2 urgent" : "Needs attention"} 
          icon={Clock} 
          color="text-warning" 
          bg="bg-warning/10" 
        />
        <KpiCard 
          title={currentUser.role === 'Boss' ? "Awaiting Feedback" : "Pending Review"} 
          value={currentUser.role === 'Boss' ? tasks.filter(t => t.status === 'Waiting for Boss Feedback').length : tasks.filter(t => t.status === 'Waiting for Review').length} 
          trend="Needs attention" 
          icon={AlertCircle} 
          color="text-secondary" 
          bg="bg-secondary/10" 
        />
        <KpiCard 
          title="Completed" 
          value={currentUser.role === 'Graphics Designer' ? myTasks.filter(t => t.status === 'Completed').length : tasks.filter(t => t.status === 'Completed').length} 
          trend="This week" 
          icon={CheckCircle2} 
          color="text-success" 
          bg="bg-success/10" 
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <motion.section variants={itemVariants} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger glow-danger"></span>
                {currentUser.role === 'Graphics Designer' ? "Today's Focus" : "Needs Attention"}
              </h2>
              <button className="text-sm text-primary hover:text-primary/80 font-medium">View all</button>
            </div>
            <div className="space-y-3">
              {urgentTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </motion.section>

          <motion.section variants={itemVariants} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold">Recent Activity</h2>
            </div>
            <div className="glass-card rounded-2xl p-1">
              {recentActivity.map((task, i) => (
                <div key={task.id} className={cn(
                  "flex items-start gap-4 p-4 hover:bg-white/5 transition-colors rounded-xl cursor-pointer",
                  i !== recentActivity.length - 1 && "border-b border-surface-border/50"
                )}>
                  <div className="w-8 h-8 rounded-full bg-surface-border flex items-center justify-center flex-shrink-0 mt-1">
                    <img src={users.find(u => u.id === task.assigneeId)?.avatar} alt="" className="w-full h-full rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium text-white">{users.find(u => u.id === task.assigneeId)?.name}</span> updated status to <span className="text-primary">{task.status}</span>
                    </p>
                    <p className="text-sm font-medium text-white mt-0.5 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <motion.section variants={itemVariants} initial="hidden" animate="visible">
            <h2 className="text-xl font-display font-semibold mb-4">Team Workload</h2>
            <div className="glass-card rounded-2xl p-5 space-y-5">
              {users.map(user => {
                const workload = Math.floor(Math.random() * 100);
                return (
                  <div key={user.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                        <span className="text-sm font-medium text-gray-200">{user.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{workload}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          workload > 80 ? "bg-danger" : workload > 60 ? "bg-warning" : "bg-primary"
                        )}
                        style={{ width: `${workload}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section variants={itemVariants} initial="hidden" animate="visible">
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <h3 className="text-lg font-display font-semibold mb-2">Need a new brief?</h3>
                <p className="text-sm text-gray-400 mb-4">Use our smart templates to create comprehensive briefs in seconds.</p>
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

function KpiCard({ title, value, trend, icon: Icon, color, bg }: any) {
  return (
    <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
        <Icon size={64} className={color} />
      </div>
      <div className="relative z-10">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", bg, color)}>
          <Icon size={20} />
        </div>
        <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-white mb-2">{value}</h3>
        <p className="text-xs text-gray-500">{trend}</p>
      </div>
    </motion.div>
  );
}

function TaskCard({ task }: { task: any; key?: string | number }) {
  const navigate = useNavigate();
  const assignee = users.find(u => u.id === task.assigneeId);
  const isLate = isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <div 
      onClick={() => navigate(`/task/${task.id}`)}
      className="glass-card rounded-xl p-4 hover:bg-surface/80 transition-all cursor-pointer group border border-surface-border hover:border-surface-border/80"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
            task.priority === 'Urgent' ? "bg-danger/20 text-danger border border-danger/20" :
            task.priority === 'High' ? "bg-warning/20 text-warning border border-warning/20" :
            "bg-surface-border text-gray-400"
          )}>
            {task.priority}
          </span>
          <span className="text-xs font-medium text-gray-500">{task.category}</span>
        </div>
        <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <h4 className="text-base font-medium text-gray-100 mb-3 group-hover:text-primary transition-colors line-clamp-1">{task.title}</h4>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-border/50">
        <div className="flex items-center gap-3">
          {assignee && (
            <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full border border-surface-border" title={assignee.name} />
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><MessageSquare size={12} /> {task.commentsCount}</span>
            <span className="flex items-center gap-1"><Paperclip size={12} /> {task.attachmentsCount}</span>
          </div>
        </div>
        <div className={cn(
          "text-xs font-medium flex items-center gap-1.5 px-2 py-1 rounded-md",
          isLate ? "text-danger bg-danger/10" : isToday(new Date(task.dueDate)) ? "text-warning bg-warning/10" : "text-gray-400"
        )}>
          <Clock size={12} />
          {format(new Date(task.dueDate), 'MMM d')}
        </div>
      </div>
    </div>
  );
}
