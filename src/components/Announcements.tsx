import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  Bell, 
  Siren, 
  ParkingSquare, 
  Megaphone, 
  Info,
  Loader2,
  ArrowRight,
  Share2,
  Clock,
  Home as HomeIcon,
  User
} from "lucide-react";
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { FestivalAnnouncement } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

const SEED_ANNOUNCEMENTS: Partial<FestivalAnnouncement>[] = [
  {
    title: "Rathotsava delayed by 30 minutes",
    message: "Due to some technical adjustments, the Rathotsava procession will now start at 3:45 PM instead of 3:15 PM. We apologize for the inconvenience.",
    type: 'emergency',
    priority: 'high',
    iconType: 'siren',
    isNew: true,
    createdAt: Timestamp.fromMillis(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    title: "Parking Area B is Full",
    message: "Parking Area B has reached its maximum capacity. All incoming vehicles are advised to proceed to Parking Area A or the satellite parking near North Gate.",
    type: 'parking',
    priority: 'medium',
    iconType: 'parking',
    isNew: true,
    createdAt: Timestamp.fromMillis(Date.now() - 1000 * 60 * 120) // 2 hours ago
  },
  {
    title: "Missing child found near east gate",
    message: "A 5-year-old boy in a red shirt has been found near the East Gate. He is currently safe at the central help desk. Please come for identification.",
    type: 'missing',
    priority: 'high',
    iconType: 'megaphone',
    isNew: true,
    createdAt: Timestamp.fromMillis(Date.now() - 1000 * 60 * 240) // 4 hours ago
  },
  {
    title: "Stay hydrated & maintain cleanliness",
    message: "It's a warm day today. Please drink plenty of water and use the designated waste bins to keep our village and temple premises clean.",
    type: 'notice',
    priority: 'low',
    iconType: 'notice',
    isNew: false,
    createdAt: Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 24) // Yesterday
  }
];

import { useLanguage } from '../context/LanguageContext';

import BottomNav from './BottomNav';

export default function Announcements() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<FestivalAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const snap = await getDocs(collection(db, 'announcements'));
        if (snap.empty) {
          const secondSnap = await getDocs(collection(db, 'announcements'));
          if (secondSnap.empty) {
            for (const item of SEED_ANNOUNCEMENTS) {
              await addDoc(collection(db, 'announcements'), {
                ...item,
                createdAt: item.createdAt || serverTimestamp()
              });
            }
          }
        }
      } catch (err) {
        console.error('Seeding Error:', err);
      }
    };
    checkAndSeed();

    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FestivalAnnouncement));
      // Pin high priority at top while maintaining chronological order within groups
      const sorted = [...docs].sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return 0; // maintain createdAt order from query
      });
      setAnnouncements(sorted);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <Siren className="w-6 h-6 text-red-600" />;
      case 'parking': return <ParkingSquare className="w-6 h-6 text-yellow-600" />;
      case 'missing': return <Megaphone className="w-6 h-6 text-blue-600" />;
      case 'notice': return <Info className="w-6 h-6 text-green-600" />;
      default: return <Bell className="w-6 h-6 text-gray-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-50';
      case 'parking': return 'bg-yellow-50';
      case 'missing': return 'bg-blue-50';
      case 'notice': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative shadow-2xl pb-10"
    >
      {/* Header */}
      <div className="bg-white border-b border-orange-100 flex items-center justify-between px-6 py-5 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-[#002D72] active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-4 font-serif text-xl font-black text-[#002D72] uppercase tracking-tight">{t('announcements')}</h1>
        </div>
        <button className="p-2 text-[#002D72] active:scale-90 transition-transform relative">
          <Bell className="w-6 h-6" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
            <p className="text-[#002D72] font-bold opacity-40 uppercase tracking-widest text-[10px]">{t('loading')}</p>
          </div>
        ) : (
          announcements.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/announcement/${item.id}`)}
              className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer group"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", getIconBg(item.type))}>
                {getIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-serif text-[15px] font-black text-[#002D72] leading-tight line-clamp-1 group-hover:text-[#F27D26] transition-colors">
                    {item.title}
                  </h3>
                  {item.isNew && (
                    <span className="bg-[#F27D26] text-white text-[8px] font-black uppercase px-2 py-1 rounded-full whitespace-nowrap shadow-sm">
                      {t('new')}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#002D72]/40 uppercase tracking-widest mb-2">
                  <Clock className="w-3 h-3" />
                  {item.createdAt?.seconds ? format(item.createdAt.toDate(), 'HH:mm • MMM d') : 'Recently'}
                </div>

                <p className="text-[11px] font-medium text-[#002D72]/60 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </motion.div>
          ))
        )}

        {!loading && announcements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-30">
            <Megaphone className="w-16 h-16" />
            <p className="font-bold">No announcements yet.</p>
          </div>
        )}
      </div>

      <BottomNav activeTab="alerts" />


      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
