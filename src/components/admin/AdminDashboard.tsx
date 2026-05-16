import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { 
  Users, 
  Calendar, 
  Search, 
  UsersRound, 
  Megaphone,
  CheckCircle2,
  Bell,
  Settings,
  BarChart3,
  User,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  ChevronRight,
  TrendingUp,
  Package,
  ArrowUpRight
} from "lucide-react";
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import AdminLayout from './AdminLayout';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    volunteers: 78,
    events: 24,
    lostFound: 56,
    announcements: 128
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listeners for stats
    const unsubVolunteers = onSnapshot(query(collection(db, 'users'), where('userType', '==', 'Volunteer')), (snapshot) => {
      setStats(prev => ({ ...prev, volunteers: snapshot.size || 78 }));
    });

    const unsubEvents = onSnapshot(collection(db, 'live_schedule'), (snapshot) => {
      setStats(prev => ({ ...prev, events: snapshot.size || 24 }));
    });

    const unsubLost = onSnapshot(collection(db, 'lost_and_found_reports'), (snapshot) => {
      setStats(prev => ({ ...prev, lostFound: snapshot.size || 56 }));
    });

    const unsubAlerts = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      setStats(prev => ({ ...prev, announcements: snapshot.size || 128 }));
      setLoading(false);
    });

    return () => {
      unsubVolunteers();
      unsubEvents();
      unsubLost();
      unsubAlerts();
    };
  }, []);

  const overviewStats = [
    { label: 'Announcements', value: stats.announcements, icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Events', value: stats.events, icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Lost & Found', value: stats.lostFound, icon: Search, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Volunteers', value: stats.volunteers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const quickActions = [
    { label: 'Manage Announcements', icon: Megaphone, color: 'bg-purple-600', path: '/admin/alerts' },
    { label: 'Manage Events', icon: Calendar, color: 'bg-orange-500', path: '/admin/events' },
    { label: 'Lost & Found Requests', icon: Search, color: 'bg-green-500', path: '/admin/lost-found' },
    { label: 'Volunteer Management', icon: Users, color: 'bg-blue-600', path: '/admin/users' },
    { label: 'User Management', icon: User, color: 'bg-indigo-600', path: '/admin/users' },
    { label: 'Reports & Analytics', icon: BarChart3, color: 'bg-pink-500', path: '/admin/analytics' },
    { label: 'Push Notifications', icon: Bell, color: 'bg-blue-500', path: '/admin/alerts' },
    { label: 'App Settings', icon: Settings, color: 'bg-gray-600', path: '/admin/settings' },
  ];

  return (
    <AdminLayout title="Admin Dashboard" activeTab="dashboard">
      <div className="space-y-6 pb-20 -mx-4 md:-mx-0">
        {/* Welcome Card */}
        <div className="px-4">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-50 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-50 flex items-center justify-center border-4 border-white shadow-xl">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <User className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#1A1A2E]">Welcome, Admin!</h3>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Super Admin</span>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pt-1">
                Last Login: Today, 08:45 AM
              </p>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Overview</h4>
            <button onClick={() => navigate('/admin/analytics')} className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest">View All</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {overviewStats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center text-center gap-3"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1A2E] leading-none mb-1">{stat.value}</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="px-4 space-y-4">
          <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest px-2">Quick Actions</h4>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={cn(
                  "w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                  action.color
                )}>
                  <action.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <span className="text-[8px] md:text-[9px] font-black text-[#1A1A2E] uppercase tracking-wider text-center leading-tight">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
