import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  Phone,
  Filter,
  AlertCircle,
  Package,
  ChevronRight,
  Loader2
} from "lucide-react";
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { LostFoundReport } from '../types';
import { cn } from '../lib/utils';

type TabType = 'lost' | 'found';

export default function LostAndFound() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [reports, setReports] = useState<LostFoundReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'lost_found'), 
      where('type', '==', activeTab)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LostFoundReport[];
      
      // Sort in memory to avoid index requirement
      const sortedList = list.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });

      setReports(sortedList);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const filteredReports = reports.filter(r => {
    const itemName = r.itemName || '';
    const description = r.description || '';
    const category = r.category || '';
    return itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col pb-24"
    >
      {/* Header */}
      <div className="bg-white border-b border-orange-100 flex items-center justify-between px-6 py-5 sticky top-0 z-50">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-[#002D72]">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-4 font-serif text-xl font-black text-[#002D72] uppercase tracking-tight">Lost & Found</h1>
        </div>
        <button className="p-2 text-gray-400">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="p-6 pb-2 space-y-4">
        <div className="flex bg-white/50 p-1 rounded-2xl border border-orange-100 items-center">
          {(['lost', 'found'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? (activeTab === 'lost' ? "bg-[#F27D26] text-white shadow-md shadow-orange-100" : "bg-[#4CAF50] text-white shadow-md shadow-green-100")
                  : "text-[#002D72] opacity-40 hover:opacity-60"
              )}
            >
              {tab} Items
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder={`Search ${activeTab} items...`}
            className={cn(
              "w-full bg-white border border-orange-100 rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-[#002D72] focus:outline-none shadow-sm transition-all",
              activeTab === 'found' ? "focus:ring-2 focus:ring-green-500/20" : "focus:ring-2 focus:ring-[#F27D26]/20"
            )}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className={cn("w-8 h-8 animate-spin", activeTab === 'found' ? "text-green-500" : "text-[#F27D26]")} />
            <p className="text-[#002D72] font-bold opacity-40">Scanning Database...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/lost-found/${report.id}`)}
                className={cn(
                  "bg-white border rounded-3xl p-4 shadow-sm flex gap-4 active:scale-[0.98] transition-transform cursor-pointer overflow-hidden",
                  report.emergency ? "border-red-100 bg-red-50/10" : "border-orange-50"
                )}
              >
                <div className={cn(
                  "w-24 h-24 rounded-2xl flex-shrink-0 overflow-hidden relative border",
                  activeTab === 'found' ? "bg-green-50/30 border-green-50" : "bg-orange-50 border-orange-50"
                )}>
                  {report.imageUrl ? (
                    <img src={report.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                      <Package className={cn("w-8 h-8", activeTab === 'found' ? "text-green-500" : "text-[#F27D26]")} />
                    </div>
                  )}
                  {report.emergency && (
                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-red-500 rounded-lg shadow-sm">
                      <span className="text-[7px] font-black text-white uppercase tracking-tighter">Urgent</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                   <div>
                     <div className="flex items-center justify-between gap-2 mb-1">
                       <h3 className="font-black text-[#002D72] text-[15px] leading-tight line-clamp-1">{report.itemName}</h3>
                       <span className={cn(
                         "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                         report.status === 'urgent' ? "bg-red-100 text-red-600" :
                         report.status === 'resolved' ? "bg-green-100 text-green-600" :
                         (activeTab === 'found' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600")
                       )}>
                         {report.status}
                       </span>
                     </div>
                     <p className="text-[10px] font-bold text-[#002D72]/50 line-clamp-2 leading-relaxed">
                       {report.description}
                     </p>
                   </div>

                   <div className="flex items-center gap-4 mt-2">
                      <div className={cn(
                        "flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg",
                        activeTab === 'found' ? "text-green-600 bg-green-50" : "text-[#F27D26] bg-orange-50"
                      )}>
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[80px]">{report.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-[#002D72]/40">
                         <Clock className="w-2.5 h-2.5" />
                         <span>{(report.createdAt?.toDate() || new Date()).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>
                <div className="flex flex-col justify-center text-gray-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            ))}

            {filteredReports.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                 <div className={cn(
                   "w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-dashed",
                   activeTab === 'found' ? "border-green-200" : "border-orange-200"
                 )}>
                    <Search className={cn("w-10 h-10", activeTab === 'found' ? "text-green-200" : "text-orange-200")} />
                 </div>
                 <p className="font-bold text-[#002D72]/30 text-sm">No items matching your search found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/report-item?type=${activeTab}`)}
        className={cn(
          "fixed bottom-10 left-1/2 -translate-x-1/2 text-white px-8 py-5 rounded-full shadow-2xl flex items-center gap-3 z-50 whitespace-nowrap transition-colors",
          activeTab === 'found' ? "bg-[#4CAF50] shadow-green-200" : "bg-[#F27D26] shadow-orange-200"
        )}
      >
        <Plus className="w-6 h-6" />
        <span className="font-black uppercase tracking-widest text-sm">Report {activeTab} Item</span>
      </motion.button>

    </motion.div>
  );
}

