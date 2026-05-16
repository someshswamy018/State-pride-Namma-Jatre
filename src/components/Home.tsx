import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  Bell, 
  ChevronLeft, 
  Calendar, 
  Search, 
  MapPin, 
  BookOpen, 
  PhoneCall, 
  Megaphone,
  Home as HomeIcon,
  User,
  Briefcase
} from "lucide-react";
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

const FEATURES = [
  {
    id: 'events',
    title: 'Live Events',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-orange-500',
    path: '/events'
  },
  {
    id: 'lost-found',
    title: 'Lost & Found',
    icon: <Search className="w-6 h-6" />,
    color: 'bg-green-500',
    path: '/lost-found'
  },
  {
    id: 'map',
    title: 'Parking & Safety Map',
    icon: <MapPin className="w-6 h-6" />,
    color: 'bg-blue-500',
    path: '/map'
  },
  {
    id: 'stories',
    title: 'Cultural Stories',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'bg-purple-500',
    path: '/stories'
  },
  {
    id: 'emergency',
    title: 'Emergency Help',
    icon: <PhoneCall className="w-6 h-6" />,
    color: 'bg-red-500',
    path: '/emergency'
  },
  {
    id: 'announcements',
    title: 'Announcements',
    icon: <Megaphone className="w-6 h-6" />,
    color: 'bg-yellow-500',
    path: '/announcements'
  }
];

import { useLanguage } from '../context/LanguageContext';

import BottomNav from './BottomNav';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('Guest');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1514222139-b57675ee0ed0?q=80&w=1000&auto=format&fit=crop');

  const FEATURES = [
    {
      id: 'events',
      title: t('liveSchedule'),
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-orange-500',
      path: '/events'
    },
    {
      id: 'lost-found',
      title: t('lostFound'),
      icon: <Search className="w-6 h-6" />,
      color: 'bg-green-500',
      path: '/lost-found'
    },
    {
      id: 'map',
      title: t('parking'),
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-blue-500',
      path: '/map'
    },
    {
      id: 'stories',
      title: t('culturalStories'),
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-purple-500',
      path: '/stories'
    },
    {
      id: 'emergency',
      title: t('emergencyHelp'),
      icon: <PhoneCall className="w-6 h-6" />,
      color: 'bg-red-500',
      path: '/emergency'
    },
    {
      id: 'announcements',
      title: t('announcements'),
      icon: <Megaphone className="w-6 h-6" />,
      color: 'bg-yellow-500',
      path: '/announcements'
    }
  ];

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/splash');
      } else {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            navigate('/register');
          } else {
            const data = userDoc.data();
            const isAdminEmail = (data?.email || user.email || '').toLowerCase().includes('someshswamy');
            
            if (isAdminEmail && data?.userType !== 'Admin') {
              await updateDoc(doc(db, 'users', user.uid), { userType: 'Admin' });
              navigate('/admin');
              return;
            }

            if (data?.userType === 'Admin') {
              navigate('/admin');
              return;
            }
            setUserName(data?.fullName?.split(' ')[0] || 'User');
            setUserType(data?.userType || 'Guest');
            setLoading(false);
          }
        } catch (err) {
          console.error('Home Profile Check Error:', err);
          setLoading(false);
        }
      }
    });

    // Fetch Banner
    const fetchBanner = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'banner'));
        if (docSnap.exists() && docSnap.data().url) {
          setBannerUrl(docSnap.data().url);
        }
      } catch (err) {
        console.error('Error fetching banner:', err);
      }
    };
    fetchBanner();

    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#F27D26] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F27D26] to-[#FF9800] px-6 py-6 flex items-center justify-between shadow-lg z-10">
        <button onClick={() => navigate('/splash')} className="p-2 -ml-2 text-white/80">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center text-center">
          <h1 className="font-serif text-lg font-black text-white tracking-widest leading-none">{t('appName')}</h1>
          <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1">Festive Village Guide</p>
        </div>
        <button onClick={() => navigate('/announcements')} className="p-2 -mr-2 text-white relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F27D26]"></span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Banner Section */}
        <div className="px-6 pt-6">
          <div className="relative h-48 rounded-[2rem] overflow-hidden shadow-xl shadow-orange-100 group bg-gray-100 flex items-center justify-center">
            <img 
              src={bannerUrl} 
              alt="Festival Banner" 
              className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-700" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544376430-19f86053f3e1?auto=format&fit=crop&q=80&w=800';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-white text-2xl font-black font-serif italic text-left">Namaskara, {userName}!</h2>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wider text-left">Experience the Grand Jatre 2026</p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {FEATURES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50 flex flex-col items-start gap-4 active:scale-95 transition-transform cursor-pointer"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", item.color)}>
                {item.icon}
              </div>
              <span className="font-bold text-[#002D72] text-[15px] leading-tight text-left">{item.title}</span>
            </motion.div>
          ))}
        </div>

        {/* Announcements Preview */}
        <div className="px-6 pb-6">
          <div className="bg-[#002D72] rounded-3xl p-6 text-white shadow-xl shadow-blue-100 flex items-center gap-5 cursor-pointer active:scale-[0.98] transition-all" onClick={() => navigate('/announcements')}>
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
                <Megaphone className="w-6 h-6 text-orange-400" />
             </div>
             <div className="flex-1 text-left">
               <h3 className="font-bold text-sm uppercase tracking-widest text-orange-400 mb-1">Latest Update</h3>
               <p className="text-sm font-medium opacity-90 leading-snug">Rathotsava ceremony starting at 6:00 PM at Main Square. Join in!</p>
             </div>
          </div>
        </div>
      </div>

      <BottomNav activeTab="home" />

    </motion.div>
  );
}

