import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  Share2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Package,
  User,
  Loader2
} from "lucide-react";
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LostFoundReport } from '../types';
import { cn } from '../lib/utils';

export default function LostFoundDetails() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<LostFoundReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (reportId) {
        try {
          const docSnap = await getDoc(doc(db, 'lost_found', reportId));
          if (docSnap.exists()) {
            setReport({ id: docSnap.id, ...docSnap.data() } as LostFoundReport);
          }
        } catch (err) {
          console.error('Fetch Report Error:', err);
        }
      }
      setLoading(false);
    };
    fetchReport();
  }, [reportId]);

  const handleCall = () => {
    if (report?.contactNumber) {
      window.location.href = `tel:${report.contactNumber}`;
    }
  };

  const handleWhatsApp = () => {
    if (report?.contactNumber) {
      window.open(`https://wa.me/${report.contactNumber}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex flex-col items-center justify-center p-6 text-center gap-4">
        <AlertCircle className="w-16 h-16 text-red-300" />
        <h2 className="text-xl font-black text-[#002D72]">Report Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-[#F27D26] font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col pb-10"
    >
      {/* Media Gallery / Image */}
      <div className="relative h-96 group">
        {report.imageUrl ? (
          <img 
            src={report.imageUrl} 
            className="w-full h-full object-cover"
            alt={report.itemName}
          />
        ) : (
          <div className="w-full h-full bg-orange-100/50 flex flex-col items-center justify-center text-orange-200">
             <Package className="w-20 h-20" />
             <p className="font-bold text-sm uppercase tracking-widest mt-4">No image provided</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDF5E6] via-transparent to-black/30" />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
        >
          <ChevronLeft />
        </button>
      </div>

      {/* Details Card */}
      <div className="flex-1 px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-100/50 border border-orange-50">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
                report.type === 'lost' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
              )}>
                {report.type} Item
              </span>
              <span className="px-3 py-1 bg-orange-100 text-[#F27D26] text-[10px] font-black uppercase tracking-widest rounded-full">
                {report.category}
              </span>
            </div>
            {report.status === 'resolved' && (
              <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                <CheckCircle className="w-4 h-4" /> Resolved
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black text-[#002D72] font-serif leading-tight mb-2">{report.itemName}</h1>
          <p className="text-sm font-medium text-[#002D72]/60 mb-8">{report.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className={cn(
              "flex items-start gap-3 p-4 rounded-2xl transition-colors",
              report.type === 'found' ? "bg-green-50/50" : "bg-orange-50/50"
            )}>
               <Calendar className={cn("w-5 h-5", report.type === 'found' ? "text-green-600" : "text-[#F27D26]")} />
               <div>
                 <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Reported On</p>
                 <p className="text-sm font-bold text-[#002D72]">
                   {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                 </p>
               </div>
            </div>
            <div className={cn(
              "flex items-start gap-3 p-4 rounded-2xl transition-colors",
              report.type === 'found' ? "bg-green-50/50" : "bg-orange-50/50"
            )}>
               <Clock className={cn("w-5 h-5", report.type === 'found' ? "text-green-600" : "text-[#F27D26]")} />
               <div>
                 <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Time</p>
                 <p className="text-sm font-bold text-[#002D72]">{report.dateTime || 'Unknown'}</p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-1">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                report.type === 'found' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
              )}>
                 <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Location</p>
                 <p className="text-sm font-black text-[#002D72]">{report.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-1">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                report.type === 'found' ? "bg-green-50 text-green-600" : "bg-orange-50 text-[#F27D26]"
              )}>
                 <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Reported By</p>
                 <p className="text-sm font-black text-[#002D72]">{report.fullName}</p>
                 <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">{report.village}</p>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="mt-10 flex flex-col gap-4">
             <div className="grid grid-cols-2 gap-4">
               <button 
                 onClick={handleCall}
                 className="bg-green-600 py-5 rounded-2xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-green-100 active:scale-95 transition-transform"
               >
                 <Phone className="w-5 h-5" />
                 Call
               </button>
               <button 
                 onClick={handleWhatsApp}
                 className="bg-[#25D366] py-5 rounded-2xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-green-100 active:scale-95 transition-transform"
               >
                 <MessageCircle className="w-5 h-5" />
                 WhatsApp
               </button>
             </div>
             <button 
               className="w-full border-2 border-[#002D72]/10 py-5 rounded-2xl text-[#002D72] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform"
             >
               <Share2 className="w-5 h-5" />
               Share Report
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
