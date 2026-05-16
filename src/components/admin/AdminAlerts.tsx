import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Megaphone, 
  AlertTriangle, 
  MessageSquare, 
  Send, 
  Trash2, 
  Users, 
  MapPin, 
  UserPlus, 
  Clock,
  MoreVertical,
  X,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Search,
  UsersRound,
  Baby,
  ChevronRight
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from './AdminLayout';
import { cn } from '../../lib/utils';
import { FestivalAnnouncement } from '../../types';

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<FestivalAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showMissingChildModal, setShowMissingChildModal] = useState(false);
  
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    type: 'notice' as any,
    priority: 'low' as any,
    relatedLocation: '',
    targetRoles: ['Visitor', 'Volunteer']
  });

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(20)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FestivalAnnouncement));
        setAlerts(data);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleSend = async (e: React.FormEvent, customData?: any) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const alertData = customData || {
        ...newAlert,
        iconType: newAlert.type === 'emergency' ? 'alert' : 'info',
        isNew: true,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'announcements'), alertData);
      
      // Also potentially send to notifications collection for history
      await addDoc(collection(db, 'notifications'), {
        ...alertData,
        sentBy: 'Admin',
        sentAt: serverTimestamp()
      });

      setNewAlert({
        title: '',
        message: '',
        type: 'notice',
        priority: 'low',
        relatedLocation: '',
        targetRoles: ['Visitor', 'Volunteer']
      });
      setShowMissingChildModal(false);
    } catch (err) {
      console.error('Error sending alert:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this announcement?')) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
      } catch (err) {
        console.error('Error deleting announcement:', err);
      }
    }
  };

  const triggerMissingChildAlert = () => {
    setShowMissingChildModal(true);
  };

  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const toggleHistory = () => {
    const nextState = !showHistory;
    setShowHistory(nextState);
    if (nextState) {
      setTimeout(() => {
        historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const toggleAlert = (id: string) => {
    setExpandedAlert(expandedAlert === id ? null : id);
  };

  return (
    <AdminLayout title="Broadcast System" activeTab="announcements">
      <div className="space-y-6 pb-20 -mx-4 md:-mx-0">
        {/* Overview Stats */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Broadcast Overview</h4>
            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Live Updates</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Sent', value: alerts.length, icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Emergency', value: alerts.filter(a => a.type === 'emergency').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Parking', value: alerts.filter(a => a.type === 'parking').length, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Critical', value: alerts.filter(a => a.priority === 'high').length, icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' },
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

        <div className="px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          {/* Left: Compose Alert */}
          <div className={cn(
            "space-y-6 transition-all duration-500",
            showHistory ? "lg:col-span-4" : "lg:col-span-8 lg:max-w-2xl"
          )}>
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-6">
               <div>
                  <h3 className="text-xl font-black text-[#1A1A2E]">Compose Message</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 uppercase">Send real-time notifications</p>
               </div>

               <div className="space-y-4">
                  <button 
                    onClick={triggerMissingChildAlert}
                    className="w-full bg-red-600 text-white p-5 rounded-[2rem] flex items-center gap-5 shadow-xl shadow-red-500/20 active:scale-95 transition-all group overflow-hidden relative border border-white/10"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                       <Baby className="w-16 h-16" />
                    </div>
                    <div className="relative w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="relative text-left flex-1 min-w-0">
                      <h5 className="font-black text-sm uppercase tracking-widest leading-none">Emergency: Missing Child</h5>
                      <p className="text-[10px] opacity-70 mt-1 font-bold whitespace-nowrap">Trigger global protocol</p>
                    </div>
                  </button>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                     {['notice', 'parking', 'emergency'].map((type) => (
                       <button
                        key={type}
                        onClick={() => setNewAlert({...newAlert, type})}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          newAlert.type === type 
                            ? "bg-purple-600 text-white shadow-md shadow-purple-600/20" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        )}
                       >
                         {type}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                     {['low', 'medium', 'high'].map((p) => (
                       <button
                        key={p}
                        onClick={() => setNewAlert({...newAlert, priority: p})}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          newAlert.priority === p 
                            ? (p === 'low' ? "bg-blue-500" : p === 'medium' ? "bg-orange-500" : "bg-red-500") + " text-white shadow-md"
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        )}
                       >
                         {p}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Title</label>
                  <input 
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                    placeholder="E.g. Parking Update..."
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Message</label>
                  <textarea 
                    rows={4}
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                    placeholder="Enter announcement text..."
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Related Location (Optional)</label>
                  <input 
                    value={newAlert.relatedLocation}
                    onChange={(e) => setNewAlert({...newAlert, relatedLocation: e.target.value})}
                    placeholder="E.g. Parking Area B..."
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <button 
                  onClick={handleSend}
                  disabled={formLoading || !newAlert.title || !newAlert.message}
                  className="w-full bg-purple-600 text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-purple-600/20 active:scale-95 transition-all disabled:opacity-50 mt-4 h-16"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <Send className="w-5 h-5" />
                      Broadcast Message
                    </>
                  )}
                </button>
             </div>

             <div className="pt-6 border-t border-gray-100">
                <button 
                  onClick={toggleHistory}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
                    showHistory 
                      ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200" 
                      : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  {showHistory ? 'Hide Broadcast History' : 'View Broadcast History'}
                  <motion.div
                    animate={{ rotate: showHistory ? -90 : 90 }}
                    className="flex shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </button>
             </div>
          </div>
        </div>

        <AnimatePresence>
          {showHistory && (
            <motion.div 
              ref={historyRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="lg:col-span-8 space-y-6"
            >
               <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#1A1A2E]">Broadcast History</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recently sent messages</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="p-3 bg-white rounded-2xl text-gray-400 hover:text-purple-600 transition-colors border border-gray-100 shadow-sm">
                       <Search className="w-5 h-5" />
                    </button>
                    <div className="h-10 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{alerts.length} Total</span>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center h-64">
                       <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                  ) : alerts.map((alert, idx) => {
                    const isExpanded = expandedAlert === alert.id;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "bg-white rounded-[1.5rem] border border-gray-100 shadow-sm border-l-4 overflow-hidden transition-all",
                          isExpanded ? "ring-2 ring-purple-500/10 shadow-lg" : "hover:border-gray-200"
                        )}
                        style={{ borderLeftColor: alert.priority === 'high' ? '#ef4444' : alert.priority === 'medium' ? '#f97316' : '#3b82f6' }}
                      >
                        <div 
                          onClick={() => toggleAlert(alert.id)}
                          className="w-full p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              alert.type === 'emergency' ? "bg-red-50 text-red-500" : alert.type === 'parking' ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                            )}>
                              {alert.type === 'emergency' ? <AlertTriangle className="w-5 h-5" /> : alert.type === 'parking' ? <MapPin className="w-5 h-5" /> : <Megaphone className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-[#1A1A2E] truncate">{alert.title}</h4>
                                <span className={cn(
                                  "text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.15em] shrink-0",
                                  alert.priority === 'high' ? "bg-red-50 text-red-500" : alert.priority === 'medium' ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"
                                )}>
                                  {alert.priority}
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-2 mt-0.5">
                                <Clock className="w-3 h-3" />
                                Recently
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2">
                               <button 
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                onClick={(e) => { e.stopPropagation(); handleDelete(alert.id); }}
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"
                            >
                              <ChevronRight className="w-4 h-4 rotate-90" />
                            </motion.div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                              <div className="p-6 pt-0 border-t border-gray-50">
                                <p className="text-xs font-medium text-gray-600 leading-relaxed max-w-2xl bg-gray-50/50 p-4 rounded-xl">
                                  {alert.message}
                                </p>
                                
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    {alert.relatedLocation && (
                                      <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <MapPin className="w-3 h-3 text-purple-500" />
                                        <span className="text-[#1A1A2E]">{alert.relatedLocation}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                       <UsersRound className="w-3 h-3 text-blue-500" />
                                       <span>Target: {alert.targetRoles?.join(', ') || 'All Users'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 sm:hidden">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDelete(alert.id); }}
                                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Missing Child Workflow Modal */}
      <AnimatePresence>
        {showMissingChildModal && (
          <div className="fixed inset-0 bg-red-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 40 }}
               className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl relative"
             >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
                   <Baby className="w-64 h-64" />
                </div>

                <div className="bg-red-500 p-8 text-white flex items-center justify-between relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-loading-bar" />
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center shadow-inner">
                        <AlertTriangle className="w-8 h-8 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight leading-none">Missing Child Alert</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-80 italic">Global Emergency Protocol Active</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setShowMissingChildModal(false)}
                    className="p-3 bg-black/10 rounded-2xl hover:bg-black/20 transition-all text-white"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="p-10 space-y-8 relative">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Child's Name / Description</label>
                        <input 
                          autoFocus
                          placeholder="E.g. Boy in blue shirt, aged 5..."
                          className="w-full bg-red-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-red-500 transition-all text-[#1A1A2E]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Last Seen Location</label>
                        <input 
                          placeholder="Main Temple Gate..."
                          className="w-full bg-red-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-red-500 transition-all text-[#1A1A2E]"
                        />
                      </div>
                   </div>

                   <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl flex gap-4">
                      <ShieldAlert className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-black text-[#1A1A2E]">Automatic Actions:</p>
                        <ul className="text-gray-500 font-bold space-y-1 mt-2 text-xs">
                          <li>• Pinned High-Priority Banner for all users</li>
                          <li>• Instant SMS & Push for Volunteers</li>
                          <li>• Digital Map Marker placement</li>
                          <li>• Area Lockdown recommendation</li>
                        </ul>
                      </div>
                   </div>

                   <button 
                    onClick={(e) => handleSend(e, {
                      title: "CRITICAL: MISSING CHILD ALERT",
                      message: "EMERGENCY: A child was reported missing near Main Temple Gate. Description: Boy, 5yrs, wearing blue shirt. If found, contact nearest volunteer or booth immediately.",
                      type: 'emergency',
                      priority: 'high',
                      iconType: 'alert',
                      isNew: true,
                      createdAt: serverTimestamp()
                    })}
                    disabled={formLoading}
                    className="w-full bg-red-600 text-white rounded-[2rem] py-6 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 shadow-2xl shadow-red-600/30 active:scale-[0.98] transition-all"
                   >
                     {formLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                       <>
                         <Megaphone className="w-6 h-6" />
                         ACTIVATE EMERGENCY BROADCAST
                       </>
                     )}
                   </button>
                   <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">Authorization: Main Admin Console • Secure Channel</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
      </div>
    </AdminLayout>
  );
}
