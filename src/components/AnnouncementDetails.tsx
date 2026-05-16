import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  Share2, 
  Bell, 
  Siren, 
  ParkingSquare, 
  Megaphone, 
  Info,
  Loader2,
  Calendar,
  AlertCircle,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react";
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FestivalAnnouncement } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function AnnouncementDetails() {
  const { announcementId } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<FestivalAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (announcementId) {
        try {
          const docSnap = await getDoc(doc(db, 'announcements', announcementId));
          if (docSnap.exists()) {
            setAnnouncement({ id: docSnap.id, ...docSnap.data() } as FestivalAnnouncement);
          }
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    };
    fetchAnnouncement();
  }, [announcementId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <Siren className="w-10 h-10 text-red-600" />;
      case 'parking': return <ParkingSquare className="w-10 h-10 text-yellow-600" />;
      case 'missing': return <Megaphone className="w-10 h-10 text-blue-600" />;
      case 'notice': return <Info className="w-10 h-10 text-green-600" />;
      default: return <Bell className="w-10 h-10 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
      </div>
    );
  }

  if (!announcement) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative shadow-2xl"
    >
      {/* Header */}
      <div className="bg-white px-6 py-8 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-orange-100 rounded-b-[2.5rem]">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-orange-50 rounded-2xl text-[#002D72] active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-serif text-lg font-black text-[#002D72] uppercase tracking-tight">Details</h1>
        <button className="p-3 bg-orange-50 rounded-2xl text-[#002D72] active:scale-95 transition-transform">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Main Content Card */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl shadow-orange-100/30 border border-orange-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
             {getIcon(announcement.type)}
          </div>

          {/* Time & Priority */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full">
              <Clock className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="text-[10px] font-black text-[#002D72] uppercase tracking-widest">
                {announcement.createdAt?.seconds ? format(announcement.createdAt.toDate(), 'p • MMM d, yyyy') : 'Recently'}
              </span>
            </div>
            <div className={cn("px-3 py-1.5 rounded-full", getPriorityColor(announcement.priority))}>
              <span className="text-[10px] font-black uppercase tracking-widest">{announcement.priority} Priority</span>
            </div>
          </div>

          <h2 className="font-serif text-2xl font-black text-[#002D72] mb-6 leading-tight">
            {announcement.title}
          </h2>

          <div className="space-y-4">
             <p className="text-[#002D72]/80 font-medium leading-relaxed text-[15px]">
               {announcement.message}
             </p>
          </div>

          {announcement.relatedLocation && (
            <div className="mt-10 p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                  <MapPin className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Location Mentioned</h4>
                  <p className="text-sm font-bold text-[#002D72]">{announcement.relatedLocation}</p>
               </div>
            </div>
          )}
        </div>

        {/* Safety Tips Quick Access */}
        <div className="bg-[#002D72] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
          <AlertCircle className="w-10 h-10 text-orange-400 mb-6" />
          <h3 className="font-serif text-xl font-black mb-3">General Safety Alert</h3>
          <p className="text-[13px] opacity-60 leading-relaxed mb-6">
            Please follow all official instructions from volunteers and security personnel for a safe Jatre experience.
          </p>
          <button 
            onClick={() => navigate('/safety-guidelines')}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-orange-400"
          >
            Safety Guidelines <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
