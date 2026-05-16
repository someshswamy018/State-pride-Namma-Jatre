import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock,
  RefreshCw,
  MoreVertical,
  Edit2,
  Calendar,
  Search,
  ChevronRight,
  Loader2,
  Settings
} from "lucide-react";
import { collection, query, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from './AdminLayout';
import { cn } from '../../lib/utils';
import { CrowdStatus } from '../../types';

export default function AdminCrowd() {
  const navigate = useNavigate();
  const [zones, setZones] = useState<CrowdStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'crowd_status'), async (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CrowdStatus));
      
      if (data.length === 0) {
        // Only seed if we haven't tried yet or if it's explicitly empty after first fetch
        await seedZones();
      } else {
        setZones(data);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const seedZones = async () => {
    const initialZones = [
      { location: 'Main Temple Area', level: 'Low' },
      { location: 'Food Court (Anna Dasoha)', level: 'Medium' },
      { location: 'Main Stage (Cultural)', level: 'Heavy' },
      { location: 'Parking Area A', level: 'Low' },
      { location: 'Parking Area B', level: 'Medium' },
      { location: 'Exhibition Ground', level: 'Low' }
    ];
    for (const zone of initialZones) {
       await addDoc(collection(db, 'crowd_status'), { ...zone, updatedAt: serverTimestamp() });
    }
  };

  const updateCrowdLevel = async (id: string, level: 'Low' | 'Medium' | 'Heavy') => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'crowd_status', id), { 
        level,
        updatedAt: serverTimestamp()
      });
      
      // Also broadcast announcement if level becomes Heavy
      if (level === 'Heavy') {
         const zone = zones.find(z => z.id === id);
         await addDoc(collection(db, 'announcements'), {
            title: `CROWD ALERT: ${zone?.location}`,
            message: `High density crowd detected at ${zone?.location}. Visitors are advised to follow volunteer instructions or move towards exit if needed.`,
            type: 'notice',
            priority: 'medium',
            iconType: 'info',
            isNew: true,
            createdAt: serverTimestamp(),
            relatedLocation: zone?.location
         });
      }
    } catch (err) {
      console.error('Error updating crowd level:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-500 bg-green-50 border-green-100 shadow-green-100';
      case 'Medium': return 'text-orange-500 bg-orange-50 border-orange-100 shadow-orange-100';
      case 'Heavy': return 'text-red-500 bg-red-50 border-red-100 shadow-red-100';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  const getIndicatorColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-orange-500';
      case 'Heavy': return 'bg-red-500 animate-pulse';
      default: return 'bg-gray-300';
    }
  };

  return (
    <AdminLayout title="Live Crowd Status" activeTab="crowd">
      <div className="space-y-6 pb-20 -mx-4 md:-mx-0">
        {/* Overview Stats */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Density Overview</h4>
            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Live Flow</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Safe Zones', value: zones.filter(z => z.level === 'Low').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Busy Areas', value: zones.filter(z => z.level === 'Medium').length, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Crowded', value: zones.filter(z => z.level === 'Heavy').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Avg Density', value: '42%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map((stat, idx) => (
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

        {/* Quick Actions */}
        <div className="px-4 space-y-4">
          <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest px-2">Crowd Control</h4>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Panic Mode', icon: AlertTriangle, color: 'bg-red-600', action: () => navigate('/admin/alerts') },
              { label: 'Clear Zone', icon: CheckCircle2, color: 'bg-green-500', action: () => {} },
              { label: 'Add Sensor', icon: MapPin, color: 'bg-blue-600', action: () => {} },
              { label: 'Safety Tips', icon: HelpCircle, color: 'bg-purple-600', action: () => {} },
            ].map((action, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
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

        <div className="px-4 space-y-8 mt-4">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
                <Users className="w-48 h-48" />
             </div>
             
             <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center text-purple-600 shadow-inner">
                      <TrendingUp className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-[#1A1A2E]">Crowd Density Control</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Real-time occupancy management</p>
                   </div>
                </div>
                <p className="text-sm font-medium text-gray-500 max-w-xl leading-relaxed">
                   Monitor and update the live crowd levels of various zones in the festival area. 
                   Marking a zone as <span className="text-red-500 font-black">Heavy</span> will automatically trigger a safety announcement.
                </p>
             </div>

             <div className="flex items-center gap-3 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <div className="text-center px-4 border-r border-gray-200">
                   <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1.5 leading-none">Safe</p>
                   <p className="text-xl font-black text-[#1A1A2E] leading-none">{zones.filter(z => z.level === 'Low').length}</p>
                </div>
                <div className="text-center px-4 border-r border-gray-200">
                   <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1.5 leading-none">Busy</p>
                   <p className="text-xl font-black text-[#1A1A2E] leading-none">{zones.filter(z => z.level === 'Medium').length}</p>
                </div>
                <div className="text-center px-4">
                   <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1.5 leading-none">Full</p>
                   <p className="text-xl font-black text-[#1A1A2E] leading-none">{zones.filter(z => z.level === 'Heavy').length}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {loading ? (
                <div className="col-span-full h-64 flex items-center justify-center">
                   <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                </div>
             ) : zones.map((zone, idx) => (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all group flex flex-col gap-8"
                >
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                            <MapPin className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-black text-[#1A1A2E]">{zone.location}</h4>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Live Updates Active</p>
                         </div>
                      </div>
                      <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2", getStatusColor(zone.level))}>
                         <div className={cn("w-2 h-2 rounded-full", getIndicatorColor(zone.level))} />
                         {zone.level}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 leading-none">Update Status Level</p>
                      <div className="grid grid-cols-3 gap-3">
                         {['Low', 'Medium', 'Heavy'].map((L) => (
                            <button
                               key={L}
                               disabled={updatingId === zone.id}
                               onClick={() => updateCrowdLevel(zone.id, L as any)}
                               className={cn(
                                 "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
                                 zone.level === L 
                                   ? (L === 'Low' ? "bg-green-500 text-white border-green-500 shadow-green-500/20" : L === 'Medium' ? "bg-orange-500 text-white border-orange-500 shadow-orange-500/20" : "bg-red-500 text-white border-red-500 shadow-red-500/20")
                                   : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
                               )}
                            >
                               {updatingId === zone.id && zone.level === L ? <RefreshCw className="w-3 h-3 animate-spin mx-auto" /> : L}
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="pt-6 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest italic leading-none">
                      <div className="flex items-center gap-2">
                         <Clock className="w-3 h-3 text-purple-400" />
                         Updated 5m ago
                      </div>
                      <button className="p-2 text-gray-200 hover:text-purple-600 transition-colors">
                         <Settings className="w-4 h-4" />
                      </button>
                   </div>
                </motion.div>
             ))}
          </div>
       </div>

       <style>{`
          @keyframes pulse-red {
            0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
            50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
          }
          .animate-pulse {
             animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
       `}</style>
       </div>
    </AdminLayout>
  );
}
