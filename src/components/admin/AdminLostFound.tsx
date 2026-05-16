import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Eye,
  Trash2,
  X,
  Loader2,
  Users,
  Camera
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from './AdminLayout';
import { cn } from '../../lib/utils';
import { LostFoundReport } from '../../types';

export default function AdminLostFound() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<LostFoundReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<LostFoundReport | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'lost_found'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LostFoundReport));
        setReports(data);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'pending' | 'resolved') => {
    try {
      await updateDoc(doc(db, 'lost_found', id), { status });
      setSelectedReport(null);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this report?')) {
      try {
        await deleteDoc(doc(db, 'lost_found', id));
        setSelectedReport(null);
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesTab = (activeTab === 'pending' ? r.status === 'pending' || r.status === 'urgent' : r.status === 'resolved');
    const itemName = r.itemName || '';
    const fullName = r.fullName || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         fullName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <AdminLayout title="Lost & Found Registry" activeTab="lost-found">
      <div className="space-y-6 pb-20 -mx-4 md:-mx-0">
        {/* Overview Stats */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Registry Overview</h4>
            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Found & Claims</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Pending', value: reports.filter(r => r.status === 'pending' || r.status === 'urgent').length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Lost Items', value: reports.filter(r => r.type === 'lost').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Found Items', value: reports.filter(r => r.type === 'found').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Resolved Today', value: reports.filter(r => r.status === 'resolved').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
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
          <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest px-2">Registry Tools</h4>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Register Item', icon: Package, color: 'bg-purple-600', action: () => {} },
              { label: 'Verify Claim', icon: CheckCircle2, color: 'bg-green-600', action: () => {} },
              { label: 'Notify User', icon: Phone, color: 'bg-blue-600', action: () => {} },
              { label: 'Global Alert', icon: AlertCircle, color: 'bg-red-600', action: () => navigate('/admin/alerts') },
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

        <div className="px-4 space-y-6 mt-4">
          {/* Header toolbar */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
             <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
                {['pending', 'resolved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    activeTab === tab 
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                      : "text-gray-400 hover:text-[#1A1A2E]"
                  )}
                >
                  {tab === 'pending' ? 'Active Reports' : 'Resolved'}
                </button>
              ))}
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                 <input 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search items or names..." 
                   className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
                 />
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-purple-600 transition-colors shadow-sm">
                 <Filter className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
             {filteredReports.map((report, idx) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-purple-500/5 transition-all cursor-pointer group flex flex-col"
                >
                   <div className="relative h-44 bg-gray-50 flex items-center justify-center">
                      {report.imageUrl ? (
                        <img 
                          src={report.imageUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt={report.itemName} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544376430-19f86053f3e1?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-200">
                           <Camera className="w-10 h-10 mb-2" />
                           <p className="text-[10px] font-black uppercase tracking-widest leading-none">No Image</p>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className={cn(
                          "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest text-white shadow-sm",
                          report.type === 'lost' ? "bg-red-500" : "bg-green-500"
                        )}>
                          {report.type}
                        </span>
                      </div>
                      {report.emergency && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-ping shadow-[0_0_8px_#ef4444]" />
                      )}
                   </div>
                   <div className="p-6 flex-1 flex flex-col gap-4">
                      <div>
                         <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">{report.category}</p>
                         <h4 className="text-lg font-black text-[#1A1A2E] leading-tight line-clamp-1">{report.itemName}</h4>
                      </div>

                      <div className="space-y-2.5">
                         <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <MapPin className="w-3.5 h-3.5 text-gray-300" />
                            <span className="truncate">{report.location}</span>
                         </div>
                         <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5 text-gray-300" />
                            <span>{report.dateTime}</span>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                               <User className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">{report.fullName.split(' ')[0]}</span>
                         </div>
                         <span className={cn(
                           "text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                           report.status === 'resolved' ? "bg-green-50 text-green-500" : "bg-orange-50 text-orange-500"
                         )}>
                           {report.status}
                         </span>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        )}
      </div>

      {/* Detail Sidebar */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[200] flex justify-end">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedReport(null)}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
             />
             <motion.div
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden"
             >
                <div className="px-8 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                   <div>
                      <h3 className="text-xl font-black text-[#1A1A2E]">Report Analysis</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage registry entry</p>
                   </div>
                   <button onClick={() => setSelectedReport(null)} className="p-3 bg-white rounded-2xl hover:bg-gray-100 transition-all shadow-sm">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                   {/* Item Image */}
                   <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-gray-50 border-4 border-white shadow-xl relative group flex items-center justify-center">
                      {selectedReport.imageUrl ? (
                        <img 
                          src={selectedReport.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt={selectedReport.itemName} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544376430-19f86053f3e1?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                           <Package className="w-16 h-16 mb-4" />
                           <p className="font-black text-xs uppercase tracking-widest">No Item Image</p>
                        </div>
                      )}
                      <div className="absolute top-6 left-6">
                        <span className={cn(
                          "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg",
                          selectedReport.type === 'lost' ? "bg-red-500" : "bg-green-500"
                        )}>
                          {selectedReport.type === 'lost' ? 'Lost Item Claim' : 'Found Item Record'}
                        </span>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                         <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1.5 leading-none">Report Details</p>
                         <h4 className="text-2xl font-black text-[#1A1A2E]">{selectedReport.itemName}</h4>
                      </div>

                      <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 flex flex-col gap-6">
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Category</p>
                               <span className="text-sm font-bold text-[#1A1A2E]">{selectedReport.category}</span>
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Status</p>
                               <span className={cn(
                                 "text-sm font-bold capitalize",
                                 selectedReport.status === 'resolved' ? "text-green-600" : "text-orange-500"
                               )}>{selectedReport.status}</span>
                            </div>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Location</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A2E]">
                               <MapPin className="w-4 h-4 text-purple-400" />
                               {selectedReport.location}
                            </div>
                         </div>
                         <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Description</p>
                            <p className="text-xs font-medium text-gray-500 leading-relaxed">{selectedReport.description}</p>
                         </div>
                      </div>
                   </div>

                   {/* Informant Details */}
                   <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reporter Information</h5>
                      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 flex items-center justify-between">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner">
                               <User className="w-7 h-7" />
                            </div>
                            <div>
                               <p className="text-lg font-black text-[#1A1A2E] leading-none mb-1.5">{selectedReport.fullName}</p>
                               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{selectedReport.village}</p>
                            </div>
                         </div>
                         <a href={`tel:${selectedReport.contactNumber}`} className="p-4 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all">
                            <Phone className="w-5 h-5" />
                         </a>
                      </div>
                   </div>

                   {/* Workflow Actions */}
                   <div className="pt-8 border-t border-gray-100 space-y-4">
                      <div className="flex gap-4">
                         <button 
                           onClick={() => handleUpdateStatus(selectedReport.id, selectedReport.status === 'resolved' ? 'pending' : 'resolved')}
                           className={cn(
                             "flex-1 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg",
                             selectedReport.status === 'resolved' 
                               ? "bg-orange-50 text-orange-600 border border-orange-100 shadow-orange-100" 
                               : "bg-green-600 text-white shadow-green-600/20"
                           )}
                         >
                            {selectedReport.status === 'resolved' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            {selectedReport.status === 'resolved' ? 'Mark Unclaimed' : 'Mark as Claimed'}
                         </button>
                         <button 
                           onClick={() => handleDelete(selectedReport.id)}
                           className="w-20 py-5 rounded-[2rem] bg-red-50 text-red-500 border border-red-100 flex items-center justify-center active:scale-[0.98] transition-all group"
                         >
                            <Trash2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                         </button>
                      </div>
                      <button className="w-full py-5 bg-purple-50 text-purple-600 rounded-[2rem] border border-purple-100 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                         <Users className="w-5 h-5" />
                         Assign Volunteer to Case
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
