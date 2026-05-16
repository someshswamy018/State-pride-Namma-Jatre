import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  Home as HomeIcon, 
  Bell, 
  User, 
  Briefcase 
} from "lucide-react";
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab?: 'home' | 'alerts' | 'volunteer' | 'profile';
}

export default function BottomNav({ activeTab: initialTab }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [userType, setUserType] = useState<string>('Guest');
  const [activeTab, setActiveTab] = useState(initialTab || 'home');

  useEffect(() => {
    // Determine active tab from location if not provided
    if (!initialTab) {
      const path = location.pathname;
      if (path === '/') setActiveTab('home');
      else if (path.includes('announcements')) setActiveTab('alerts');
      else if (path.includes('volunteer')) setActiveTab('volunteer');
      else if (path.includes('profile')) setActiveTab('profile');
    }
  }, [location, initialTab]);

  useEffect(() => {
    const fetchUserType = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserType(userDoc.data().userType || 'Guest');
          }
        } catch (err) {
          console.error('BottomNav UserType Error:', err);
        }
      }
    };
    fetchUserType();
  }, []);

  const navItems = [
    { id: 'home', icon: HomeIcon, label: t('home'), path: '/', color: 'text-[#F27D26]', dot: 'bg-[#F27D26]' },
    { id: 'alerts', icon: Bell, label: t('alerts'), path: '/announcements', color: 'text-[#F27D26]', dot: 'bg-[#F27D26]' },
    { 
      id: 'volunteer', 
      icon: Briefcase, 
      label: t('volunteer'), 
      path: '/volunteer/home', 
      color: 'text-purple-600', 
      dot: 'bg-purple-600',
      condition: userType === 'Volunteer'
    },
    { 
      id: 'profile', 
      icon: User, 
      label: t('profile'), 
      path: userType === 'Volunteer' ? '/volunteer/profile' : '/profile', 
      color: userType === 'Volunteer' ? 'text-purple-600' : 'text-[#F27D26]', 
      dot: userType === 'Volunteer' ? 'bg-purple-600' : 'bg-[#F27D26]' 
    },
    {
      id: 'admin',
      icon: Briefcase,
      label: 'Admin',
      path: '/admin',
      color: 'text-purple-600',
      dot: 'bg-purple-600',
      condition: userType === 'Admin'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-orange-100 flex items-center justify-around py-3 px-6 z-50">
      {navItems.map((item) => {
        if (item.condition === false) return null;
        
        const isActive = activeTab === item.id;
        const Icon = item.icon;
        
        return (
          <button 
            key={item.id}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? item.color : "text-gray-300 hover:text-gray-400"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive ? "scale-110" : "")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            {isActive && <motion.div layoutId="nav-dot" className={cn("w-1 h-1 rounded-full", item.dot)} />}
          </button>
        );
      })}
    </div>
  );
}
