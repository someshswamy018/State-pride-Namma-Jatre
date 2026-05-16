import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Search, 
  Settings, 
  Home as HomeIcon,
  LogOut,
  Menu,
  ChevronRight,
  TrendingUp,
  Package,
  Bell,
  Megaphone,
  Loader2,
  X
} from "lucide-react";
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  activeTab?: string;
}

export default function AdminLayout({ children, title, activeTab }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user is actually an admin in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        if (data?.userType !== 'Admin') {
          // If not admin, redirect to home
          navigate('/');
          return;
        }
        setAdminData(data);
        setIsVerifying(false);
      } catch (err) {
        console.error('Error verifying admin:', err);
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/splash');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/admin' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, path: '/admin/alerts' },
    { id: 'events', label: 'Events', icon: Calendar, path: '/admin/events' },
    { id: 'volunteers', label: 'Volunteers', icon: Users, path: '/admin/users' },
    { id: 'more', label: 'More', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col md:flex-row max-w-6xl mx-auto w-full">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#1A1A2E] text-white px-6 py-6 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 active:scale-95 transition-transform"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <div className="text-center">
          <h1 className="font-serif font-black text-lg tracking-tight leading-none uppercase">{title}</h1>
          <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">JATRE – NAMMA PRIDE</p>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate('/admin/alerts')}
            className="relative p-2 -mr-2"
          >
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-[#1A1A2E] text-[8px] flex items-center justify-center font-black">5</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <div key="mobile-drawer-portal" className="fixed inset-0 z-[100] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-80 bg-[#1A1A2E] text-white flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-serif font-black text-xl tracking-tight leading-none">JATRE</h1>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Admin Panel</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-white/50 hover:text-white active:scale-90 transition-transform"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path || activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all",
                        isActive 
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                          : "text-white/50 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-6 border-t border-white/5 mt-auto space-y-4">
                 <div className="flex items-center gap-4 px-4 py-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                       {adminData?.fullName?.[0] || 'A'}
                    </div>
                    <div>
                       <p className="text-sm font-black text-white uppercase tracking-tight">{adminData?.fullName || 'Admin'}</p>
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{adminData?.userType}</p>
                    </div>
                 </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-400/10 transition-all underline-offset-4 decoration-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex w-72 bg-[#1A1A2E] text-white flex-col sticky top-0 h-screen p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif font-black text-xl tracking-tight leading-none">JATRE</h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all group",
                  isActive 
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <div className="hidden md:flex h-20 bg-white border-b border-gray-100 items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="text-xl font-black text-[#1A1A2E]">{title}</h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-gray-100 border-none rounded-2xl py-2.5 pl-12 pr-6 text-sm font-bold text-[#1A1A2E] w-64 focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500" />
            </div>
            <button 
              onClick={() => navigate('/admin/alerts')}
              className="relative w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all active:scale-90"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div 
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-3 pl-4 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold group-hover:bg-purple-200 transition-colors">
                {adminData?.fullName?.[0] || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-[#1A1A2E] group-hover:text-purple-600 transition-colors uppercase tracking-tight">{adminData?.fullName || 'Admin User'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{adminData?.village || 'System Admin'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
