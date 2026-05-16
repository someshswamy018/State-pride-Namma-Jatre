import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  Bell, 
  User, 
  MapPin, 
  ClipboardList, 
  FileText, 
  Megaphone, 
  PhoneCall,
  Star as StarIcon,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  ChevronRight,
  Home as HomeIcon,
  AlertCircle,
  CheckSquare,
  Timer,
  Map,
  Sparkles,
  Plus,
  Minus,
  ShieldAlert,
  Send,
  X
} from "lucide-react";
import { auth, db } from '../lib/firebase';
import { 
  doc, 
  collection, 
  query, 
  where, 
  limit, 
  addDoc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile, VolunteerTask } from '../types';
import { cn } from '../lib/utils';

import BottomNav from './BottomNav';

export default function VolunteerHome() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasksCount, setTasksCount] = useState(0);
  const [activeTask, setActiveTask] = useState<VolunteerTask | null>(null);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [showSOS, setShowSOS] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('Medical');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    // Real-time listener for profile
    const unsubProfile = onSnapshot(doc(db, 'users', auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
      setLoading(false);
    });

    // Real-time listener for active tasks
    const tasksQuery = query(
      collection(db, 'volunteer_tasks'),
      where('assignedVolunteerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubTasks = onSnapshot(tasksQuery, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as VolunteerTask));
      setTasksCount(docs.filter(t => ['Assigned', 'In Progress'].includes(t.status)).length);
      
      const current = docs.find(t => t.status === 'In Progress') || docs.find(t => t.status === 'Assigned');
      setActiveTask(current || null);
    });

    // Real-time listener for latest announcement
    const announcementsQuery = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(4)
    );

    const unsubAnnouncements = onSnapshot(announcementsQuery, (snap) => {
      if (!snap.empty) {
        setAnnouncement({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
    });

    return () => {
      unsubProfile();
      unsubTasks();
      unsubAnnouncements();
    };
  }, []);

  const handleDutyToggle = async () => {
    if (!auth.currentUser || !profile) return;
    
    const isCurrentlyOnDuty = profile.dutyStatus === 'ON DUTY';
    const newStatus = isCurrentlyOnDuty ? 'OFF DUTY' : 'ON DUTY';
    
    try {
      const updateData: any = {
        dutyStatus: newStatus,
        updatedAt: serverTimestamp()
      };

      if (newStatus === 'ON DUTY') {
        updateData.checkInTime = serverTimestamp();
      } else {
        updateData.checkOutTime = serverTimestamp();
        if (profile.checkInTime) {
          const sessionStart = (profile.checkInTime as any).toDate ? (profile.checkInTime as any).toDate() : new Date();
          const sessionEnd = new Date();
          const hours = parseFloat(((sessionEnd.getTime() - sessionStart.getTime()) / (1000 * 60 * 60)).toFixed(2));
          updateData.totalHours = (profile.totalHours || 0) + hours;
        }
      }

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updateData);
      
      await addDoc(collection(db, 'volunteer_attendance'), {
        userId: auth.currentUser.uid,
        userName: profile.fullName,
        type: newStatus === 'ON DUTY' ? 'Check-in' : 'Check-out',
        timestamp: serverTimestamp(),
        location: profile.assignedArea || 'Not Specified'
      });
    } catch (err) {
      console.error('Duty Toggle Error:', err);
    }
  };

  const handleIncrementHelp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser || !profile) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        peopleHelped: (profile.peopleHelped || 0) + 1
      });
    } catch (err) {
      console.error('Increment Help Error:', err);
    }
  };

  const handleDecrementHelp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser || !profile || (profile.peopleHelped || 0) <= 0) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        peopleHelped: (profile.peopleHelped || 0) - 1
      });
    } catch (err) {
      console.error('Decrement Help Error:', err);
    }
  };

  const handleSOS = async () => {
    if (!auth.currentUser || !profile) return;
    try {
      await addDoc(collection(db, 'emergency_alerts'), {
        senderId: auth.currentUser.uid,
        senderName: profile.fullName,
        senderType: 'Volunteer',
        type: 'SOS',
        location: profile.assignedArea || 'Unknown',
        timestamp: serverTimestamp(),
        status: 'Active'
      });
      setShowSOS(false);
    } catch (err) {
      console.error('SOS Error:', err);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile) return;
    try {
      await addDoc(collection(db, 'volunteer_reports'), {
        reporterId: auth.currentUser.uid,
        reporterName: profile.fullName,
        type: reportType,
        description,
        location: profile.assignedArea || 'Main Area',
        timestamp: serverTimestamp(),
        status: 'Pending'
      });
      setShowReport(false);
      setDescription('');
    } catch (err) {
      console.error('Report Error:', err);
    }
  };

  const stats = [
    { label: t('tasks'), value: tasksCount, icon: <ClipboardList className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
    { label: t('hoursToday'), value: Math.floor(profile?.totalHours || 0), icon: <Clock className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
    { label: t('peopleHelped'), value: profile?.peopleHelped || 0, icon: <Users className="w-5 h-5" />, color: 'bg-green-100 text-green-600', interactive: true },
    { label: t('rating'), value: profile?.rating || 4.8, icon: <StarIcon className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative pb-24"
    >
      {/* Header with Purple Gradient */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-6 pb-12 rounded-b-[3rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <button className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="font-serif text-lg font-black tracking-widest leading-none">JATRE – NAMMA PRIDE</h1>
            <span className="text-[10px] font-bold opacity-70 uppercase mt-1 tracking-[0.2em]">{t('volunteer')} Dashboard</span>
          </div>
          <button className="p-2 -mr-2 relative hover:bg-white/10 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-purple-700"></span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black font-serif leading-tight">Serve Together,<br />Celebrate Culture</h2>
          <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Be a Volunteer. Make a Difference.</p>
        </div>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* Volunteer Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-5 shadow-2xl shadow-indigo-100/50 flex items-center gap-4 border border-indigo-50">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-50 shadow-sm">
              {profile?.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            {profile?.verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                <CheckCircle className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-[#002D72] truncate">{profile?.fullName}</h3>
              {profile?.verified && (
                <span className="text-[8px] font-black uppercase text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100 shrink-0">
                  {t('verifiedVolunteer')}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 mt-0.5">
               <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">ID: {profile?.volunteerId || 'V-00234'}</p>
                  <div className={cn(
                    "px-2 py-0.5 rounded-lg text-[8px] font-black flex items-center gap-1 shrink-0",
                    profile?.dutyStatus === 'ON DUTY' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", profile?.dutyStatus === 'ON DUTY' ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                    {profile?.dutyStatus === 'ON DUTY' ? 'ON DUTY' : 'OFF DUTY'}
                  </div>
               </div>
               <p className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Assigned: <span className="text-purple-600 font-black">{profile?.assignedArea || 'Main Temple Gate'}</span>
               </p>
            </div>
          </div>
        </div>

        {/* Duty Control Button Card */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleDutyToggle}
          className={cn(
            "w-full p-6 rounded-[2.5rem] shadow-xl transition-all flex items-center justify-between group overflow-hidden relative border border-indigo-50",
            profile?.dutyStatus === 'ON DUTY' 
              ? "bg-[#1A1A2E] text-white" 
              : "bg-gradient-to-r from-purple-600 to-indigo-700 text-white"
          )}
        >
          <div className="relative z-10 flex flex-col items-start gap-1">
            <h4 className="text-lg font-black uppercase tracking-tight">
              {profile?.dutyStatus === 'ON DUTY' ? 'End Duty Session' : 'Start Duty Session'}
            </h4>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
              {profile?.dutyStatus === 'ON DUTY' ? 'Calculates working hours automatically' : 'Check-in to start helping pilgrims'}
            </p>
          </div>
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
            {profile?.dutyStatus === 'ON DUTY' ? <Timer className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:translate-x-4 transition-transform" />
        </motion.button>

        {/* Today Overview Stat Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={stat.interactive && stat.label === t('tasks') ? () => navigate('/volunteer/tasks') : undefined}
              className={cn(
                "bg-white p-4 rounded-3xl shadow-sm border border-indigo-50 flex items-center gap-3 transition-all",
                stat.interactive && stat.label === t('tasks') ? "active:scale-95 cursor-pointer hover:border-purple-200" : ""
              )}
            >
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", stat.color)}>
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-[#002D72] leading-none">{stat.value}</p>
                  {stat.interactive && stat.label === t('peopleHelped') && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={handleDecrementHelp}
                        className="p-1 hover:bg-gray-100 rounded-lg text-purple-400 active:scale-90 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={handleIncrementHelp}
                        className="p-1 hover:bg-gray-100 rounded-lg text-purple-400 active:scale-90 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {stat.interactive && stat.label === t('tasks') && <ChevronRight className="w-4 h-4 text-purple-400" />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Active Task Card */}
        {activeTask && (
           <div className="space-y-3">
              <h4 className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                 <CheckSquare className="w-3 h-3" />
                 Current Active Task
              </h4>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-5 rounded-[2.5rem] border border-indigo-50 shadow-sm flex items-center gap-4 group cursor-pointer"
                onClick={() => navigate('/volunteer/tasks')}
              >
                 <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                    <Sparkles className="w-7 h-7" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#002D72] truncate">{activeTask.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Map className="w-3 h-3" />
                          {activeTask.location}
                       </p>
                       <span className="w-1 h-1 bg-gray-200 rounded-full" />
                       <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">{activeTask.status}</p>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: activeTask.status === 'In Progress' ? '70%' : '20%' }}
                          className="h-full bg-purple-500 rounded-full"
                       />
                    </div>
                 </div>
                 <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </motion.div>
           </div>
        )}

        {/* Announcement Preview */}
        {announcement && (
           <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                 <h4 className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-[0.2em]">Latest Announcement</h4>
                 <span className="text-[8px] font-black text-amber-500 uppercase">Flash Update</span>
              </div>
              <div className="bg-amber-50 p-5 rounded-[2.5rem] border border-amber-100 shadow-sm flex gap-4">
                 <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
                    <Megaphone className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-black text-[#002D72] leading-relaxed line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center justify-between mt-2">
                       <span className="text-[8px] font-bold text-amber-600 uppercase tracking-[0.1em]">Priority: {announcement.priority}</span>
                       <button onClick={() => navigate('/announcements')} className="text-[8px] font-black text-[#002D72] uppercase underline underline-offset-4">Read Full</button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-[0.2em] px-1">Quick Tools</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'tasks', label: t('myTasks'), color: 'bg-purple-600', icon: <ClipboardList className="w-5 h-5" />, path: '/volunteer/tasks' },
              { id: 'reports', label: t('reportHelp'), color: 'bg-indigo-600', icon: <FileText className="w-5 h-5" />, action: () => setShowReport(true) },
              { id: 'announcements', label: t('announcements'), color: 'bg-amber-500', icon: <Megaphone className="w-5 h-5" />, path: '/announcements' },
              { id: 'emergency', label: t('emergencyHelp'), color: 'bg-red-500', icon: <PhoneCall className="w-5 h-5" />, path: '/emergency' }
            ].map((action) => (
              <button 
                key={action.id}
                onClick={() => action.path ? navigate(action.path) : action.action?.()}
                className={cn("p-4 rounded-3xl text-white shadow-lg active:scale-95 transition-all text-left flex flex-col gap-3", action.color)}
              >
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  {action.icon}
                </div>
                <span className="text-xs font-black uppercase tracking-wider">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Contribution */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-indigo-50 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-[#002D72] uppercase tracking-wider">{t('weeklyContribution')}</h4>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{profile?.totalHours || 18} / 30 hours</span>
          </div>
          <div className="h-3 bg-indigo-50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
            />
          </div>
          <p className="text-[9px] font-bold text-[#002D72]/40 uppercase tracking-widest text-center">Remaining 12 hours for weekly goal</p>
        </div>
      </div>

      {/* Floating SOS Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowSOS(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl shadow-red-200 flex items-center justify-center z-40 border-4 border-white"
      >
        <AlertCircle className="w-8 h-8 animate-pulse" />
      </motion.button>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOS && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSOS(false)}
              className="absolute inset-0 bg-[#002D72]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[3rem] p-8 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-red-100 rounded-[2.5rem] flex items-center justify-center text-red-600 mx-auto">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#002D72] font-serif">Emergency SOS</h3>
                <p className="text-sm font-medium text-gray-500">This will notify all nearby admins and security personnel immediately.</p>
              </div>
              <div className="space-y-3 pt-4">
                <button 
                  onClick={handleSOS}
                  className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-bold text-sm shadow-xl shadow-red-200 active:scale-95"
                >
                  SEND ALERT NOW
                </button>
                <button 
                  onClick={() => setShowSOS(false)}
                  className="w-full bg-gray-100 text-[#002D72] py-5 rounded-[2rem] font-bold text-sm"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Report Drawer */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReport(false)}
              className="absolute inset-0 bg-[#002D72]/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto w-full max-w-md mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-[#002D72] font-serif tracking-tight">Quick Report</h3>
                </div>
                <button onClick={() => setShowReport(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleReport} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-widest ml-1">Report Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Medical', 'Crowd', 'Lost Child', 'Security'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setReportType(type)}
                        className={cn(
                          "p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center",
                          reportType === type ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-3xl p-6 text-xs font-bold text-[#002D72] min-h-[120px] focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Briefly describe the situation..."
                    required
                  />
                </div>

                <div className="bg-indigo-50 p-6 rounded-3xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Your Location</p>
                    <p className="text-xs font-black text-indigo-600">{profile?.assignedArea || 'Current GPS Location'}</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#1A1A2E] text-white py-6 rounded-[2.5rem] font-bold text-sm shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Send className="w-5 h-5" />
                  SUBMIT REPORT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav activeTab="volunteer" />
    </motion.div>
  );
}
