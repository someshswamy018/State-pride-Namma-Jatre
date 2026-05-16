import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronRight,
  Play
} from "lucide-react";
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { LiveEvent } from '../types';
import { cn } from '../lib/utils';

const SEED_DATA: Partial<LiveEvent>[] = [
  {
    title: 'Rathotsava',
    description: 'The grand chariot procession through the village streets.',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '18:00',
    category: 'Sacred Ritual',
    status: 'ongoing',
    location: 'Main Temple Square',
    imageUrl: 'https://images.unsplash.com/photo-1514222139-b57675ee0ed0?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Wrestling Matches',
    description: 'Traditional village wrestling tournament (Kusti).',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '19:30',
    category: 'Sports',
    status: 'upcoming',
    location: 'Sports Ground',
    imageUrl: 'https://images.unsplash.com/photo-1590076215667-873d3148f325?q=80&w=1000&auto=format&fit=crop'
  },
  {
    title: 'Cultural Drama',
    description: 'Local stage play depicting mythological stories.',
    date: new Date().toISOString().split('T')[0],
    startTime: '20:00',
    endTime: '23:00',
    category: 'Culture',
    status: 'upcoming',
    location: 'Open Air Theater'
  }
];

type FilterType = 'today' | 'tomorrow' | 'all';

export default function Events() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('today');
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'live_schedule'));
        if (snapshot.empty) {
          for (const item of SEED_DATA) {
            await addDoc(collection(db, 'live_schedule'), {
              ...item,
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (err) {
        console.error('Seeding Error:', err);
      }
    };
    checkAndSeed();

    const q = query(collection(db, 'live_schedule'), orderBy('startTime', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LiveEvent[];
      setEvents(eventList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getFilteredEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];

    if (filter === 'today') return events.filter(e => e.date === today);
    if (filter === 'tomorrow') return events.filter(e => e.date === tomorrow);
    return events;
  };

  const filteredEvents = getFilteredEvents();
  const ongoingEvents = filteredEvents.filter(e => e.status === 'ongoing');
  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming');

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col pb-10 max-w-md mx-auto w-full relative shadow-2xl"
    >
      {/* Header */}
      <div className="bg-white border-b border-orange-100 flex items-center px-6 py-5 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#002D72]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-serif text-xl font-black text-[#002D72] uppercase tracking-tight">Live Schedule</h1>
      </div>

      {/* Tabs */}
      <div className="p-6 pb-2">
        <div className="flex bg-white/50 p-1 rounded-2xl border border-orange-100 items-center">
          {(['today', 'tomorrow', 'all'] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all",
                filter === tab 
                  ? "bg-[#F27D26] text-white shadow-md shadow-orange-100" 
                  : "text-[#002D72] opacity-40 hover:opacity-60"
              )}
            >
              {tab}
            </button>
          ))}
          <button className="p-3 text-[#F27D26] hover:bg-orange-50 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-3 border-[#F27D26] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#002D72] font-bold opacity-40">Loading Schedule...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              {/* Ongoing Section */}
              {ongoingEvents.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-black text-[#002D72] uppercase tracking-[0.2em] ml-1">Ongoing Now</h2>
                  <div className="flex flex-col gap-4">
                    {ongoingEvents.map(event => (
                      <div 
                        key={event.id}
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-3xl p-5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
                      >
                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Live Now</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-black text-[#002D72] mb-1">{event.title}</h3>
                            <p className="text-xs font-bold text-[#002D72]/60">{event.description}</p>
                          </div>
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                            <Play className="w-6 h-6 text-green-600 fill-current ml-1" />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-green-200/50 pt-4">
                          <div className="flex items-center gap-2 text-green-700">
                             <Clock className="w-4 h-4" />
                             <span className="text-xs font-bold">{event.startTime} - {event.endTime}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-green-700/50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Section */}
              <div className="space-y-4">
                <h2 className="text-sm font-black text-[#002D72] uppercase tracking-[0.2em] ml-1">Upcoming Events</h2>
                {upcomingEvents.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {upcomingEvents.map(event => (
                      <div 
                        key={event.id}
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="bg-white border border-orange-50 rounded-2xl p-4 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-50 rounded-xl flex flex-col items-center justify-center text-[#F27D26] flex-shrink-0">
                             <span className="text-[10px] font-black leading-none mb-1">PM</span>
                             <span className="text-sm font-black leading-none">{event.startTime.split(':')[0]}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-[#002D72]">{event.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-[10px] text-[#002D72]/40 font-bold">
                                <Clock className="w-3 h-3" />
                                <span>{event.startTime} – {event.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-[#002D72]/40 font-bold">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#002D72]/10" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/50 border-2 border-dashed border-orange-100 rounded-3xl p-10 flex flex-col items-center text-center gap-4">
                    <p className="text-sm font-bold text-[#002D72] opacity-30 italic">No events scheduled for this partition.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
