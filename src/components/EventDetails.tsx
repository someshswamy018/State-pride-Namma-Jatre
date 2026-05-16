import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { ChevronLeft, MapPin, Clock, Info, Share2, Calendar } from "lucide-react";
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LiveEvent } from '../types';

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        const docSnap = await getDoc(doc(db, 'live_schedule', eventId));
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() } as LiveEvent);
        }
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  if (loading) return null;
  if (!event) return <div className="p-10 text-center">Event not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col"
    >
      <div className="relative h-72 bg-gray-100 flex items-center justify-center">
        <img 
          src={event.imageUrl || "https://images.unsplash.com/photo-1514222139-b57675ee0ed0?q=80&w=1000&auto=format&fit=crop"} 
          className="w-full h-full object-cover"
          alt={event.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514222139-b57675ee0ed0?q=80&w=1000&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF5E6] via-transparent to-black/30" />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
        >
          <ChevronLeft />
        </button>
      </div>

      <div className="flex-1 px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-100/50 border border-orange-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-orange-100 text-[#F27D26] text-[10px] font-black uppercase tracking-widest rounded-full">
              {event.category || 'Festival'}
            </span>
            {event.status === 'ongoing' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                Live Now
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black text-[#002D72] font-serif leading-tight mb-6">{event.title}</h1>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-2xl">
               <Calendar className="w-5 h-5 text-[#F27D26]" />
               <div>
                 <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Date</p>
                 <p className="text-sm font-bold text-[#002D72]">{event.date}</p>
               </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-2xl">
               <Clock className="w-5 h-5 text-[#F27D26]" />
               <div>
                 <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Time</p>
                 <p className="text-sm font-bold text-[#002D72]">{event.startTime} - {event.endTime}</p>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8 p-1">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
               <MapPin className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Location</p>
               <p className="text-sm font-black text-[#002D72]">{event.location}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#F27D26]" />
              <h3 className="text-sm font-black text-[#002D72] uppercase tracking-[0.2em]">About Event</h3>
            </div>
            <p className="text-sm leading-relaxed text-[#002D72]/70 font-medium">
              {event.description || "Join us for this sacred celebration of culture and tradition. Experience the rituals, music, and vibrant atmosphere of the Jatre."}
            </p>
          </div>

          <button 
            className="w-full mt-10 bg-[#002D72] py-5 rounded-2xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-100 active:scale-95 transition-transform"
          >
            <Share2 className="w-5 h-5" />
            Share Event
          </button>
        </div>
      </div>
    </motion.div>
  );
}
