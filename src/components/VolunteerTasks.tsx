import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Timer,
  ChevronRight,
  ParkingCircle,
  Shield,
  Stethoscope,
  Info,
  Loader2
} from "lucide-react";
import { auth, db } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { VolunteerTask, TaskStatus } from '../types';
import { cn } from '../lib/utils';

export default function VolunteerTasks() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TaskStatus | 'All'>('All');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'volunteer_tasks'),
      where('assignedVolunteerId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerTask));
      setTasks(taskList);
      setLoading(false);
    }, (err) => {
      console.error('Fetch Tasks Error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTasks = activeFilter === 'All' 
    ? tasks 
    : tasks.filter(t => t.status === activeFilter);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Assigned': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'In Progress': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Pending': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const getTaskIcon = (type?: string) => {
    switch (type) {
      case 'crowd': return <Shield className="w-5 h-5 text-purple-500" />;
      case 'parking': return <ParkingCircle className="w-5 h-5 text-blue-500" />;
      case 'medical': return <Stethoscope className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateDoc(doc(db, 'volunteer_tasks', taskId), {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Update Task Error:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative"
    >
      {/* Header */}
      <div className="bg-white border-b border-indigo-100 flex items-center px-6 py-5 sticky top-0 z-50 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-indigo-900 active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-serif text-xl font-black text-indigo-900 uppercase tracking-tight">{t('myTasks')}</h1>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white px-6 py-4 flex items-center gap-2 overflow-x-auto scrollbar-hide sticky top-[4.5rem] z-40">
        {['All', 'Assigned', 'In Progress', 'Completed'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter as any)}
            className={cn(
              "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
              activeFilter === filter 
                ? "bg-indigo-900 text-white border-indigo-900 shadow-lg shadow-indigo-100" 
                : "bg-indigo-50/50 text-indigo-400 border-indigo-100"
            )}
          >
            {filter === 'All' ? 'All' : t(filter.toLowerCase().replace(' ', '') as any)}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-indigo-900/40 text-[10px] font-black uppercase tracking-widest">Optimizing Workflow...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-indigo-900/40 text-sm font-bold">No tasks found in this category.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[2rem] p-5 shadow-sm border border-indigo-50 group active:scale-[0.98] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getTaskIcon(task.iconType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-black text-indigo-900 text-base leading-tight truncate">{task.title}</h3>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[8px] font-black uppercase border shadow-sm",
                        getStatusColor(task.status)
                      )}>
                        {t(task.status.toLowerCase().replace(' ', '') as any)}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[#002D72]/40">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{task.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#002D72]/40">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{task.startTime} – {task.endTime}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Status Toggle Buttons */}
                {task.status !== 'Completed' && (
                  <div className="mt-5 pt-4 border-t border-indigo-50 flex gap-2">
                    {task.status === 'Assigned' && (
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'In Progress')}
                        className="flex-1 py-3 bg-indigo-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <Timer className="w-4 h-4" /> Start Task
                      </button>
                    )}
                    {task.status === 'In Progress' && (
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'Completed')}
                        className="flex-1 py-3 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Complete
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
