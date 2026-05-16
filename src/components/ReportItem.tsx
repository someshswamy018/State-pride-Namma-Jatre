import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  Camera, 
  Upload, 
  X, 
  AlertCircle,
  Package,
  MapPin,
  Calendar,
  Phone,
  User,
  Home as HomeIcon,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { auth, db, storage } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '../lib/utils';

const CATEGORIES = [
  'Mobile', 'Wallet', 'Bag', 'Jewelry', 'Child Missing', 'Documents', 'Other'
];

export default function ReportItem() {
  const navigate = useNavigate();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get('type') === 'found' ? 'found' : 'lost';
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Other',
    description: '',
    location: '',
    dateTime: new Date().toLocaleString(),
    emergency: false,
    contactNumber: '',
    fullName: '',
    village: '',
    phoneNumber: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        setLoading(true);
        const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setFormData(prev => ({
            ...prev,
            fullName: data.fullName || '',
            phoneNumber: data.phoneNumber || '',
            village: data.village || '',
            contactNumber: data.phoneNumber || ''
          }));
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `all-photo/${type}_${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'lost_found'), {
        ...formData,
        type,
        imageUrl,
        status: formData.emergency ? 'urgent' : 'pending',
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        uploadedAt: serverTimestamp()
      });

      navigate('/lost-found');
    } catch (err) {
      console.error('Report Submission Error:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#FDF5E6] flex flex-col pb-10"
    >
      {/* Header */}
      <div className={cn(
        "border-b flex items-center px-6 py-5 sticky top-0 z-50 transition-colors",
        type === 'found' ? "bg-white border-green-100" : "bg-white border-orange-100"
      )}>
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#002D72]">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-serif text-xl font-black text-[#002D72] uppercase tracking-tight">
          Report {type === 'lost' ? 'Lost' : 'Found'} Item
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8 max-w-md mx-auto w-full">
        {/* User Info (Pre-filled) */}
        <div className={cn(
          "rounded-3xl p-6 border space-y-4 transition-colors",
          type === 'found' ? "bg-green-50/50 border-green-100" : "bg-orange-50/50 border-orange-100"
        )}>
           <h3 className={cn(
             "text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
             type === 'found' ? "text-green-600" : "text-[#F27D26]"
           )}>
             <User className="w-3 h-3" /> Reporter Details
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Name</p>
                <p className="font-bold text-[#002D72] text-sm">{formData.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Mobile</p>
                <p className="font-bold text-[#002D72] text-sm">{formData.phoneNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">Village</p>
                <p className="font-bold text-[#002D72] text-sm">{formData.village}</p>
              </div>
           </div>
        </div>

        {/* Item Details */}
        <div className="space-y-5">
           <div className="space-y-2">
             <label className="text-xs font-black text-[#002D72] uppercase tracking-widest ml-1">Item Name</label>
             <div className="relative">
               <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input 
                 required
                 type="text"
                 placeholder="What did you lose/find?"
                 className={cn(
                   "w-full bg-white border rounded-2xl py-4 pl-12 pr-4 font-bold text-[#002D72] focus:outline-none shadow-sm transition-all",
                   type === 'found' ? "border-green-100 focus:ring-2 focus:ring-green-500/20" : "border-orange-100 focus:ring-2 focus:ring-[#F27D26]/20"
                 )}
                 value={formData.itemName}
                 onChange={e => setFormData({...formData, itemName: e.target.value})}
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-black text-[#002D72] uppercase tracking-widest ml-1">Category</label>
             <select 
               className={cn(
                 "w-full bg-white border rounded-2xl py-4 px-4 font-bold text-[#002D72] focus:outline-none shadow-sm appearance-none transition-all",
                 type === 'found' ? "border-green-100 focus:ring-2 focus:ring-green-500/20" : "border-orange-100 focus:ring-2 focus:ring-[#F27D26]/20"
               )}
               value={formData.category}
               onChange={e => setFormData({...formData, category: e.target.value})}
             >
               {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-black text-[#002D72] uppercase tracking-widest ml-1">Location</label>
             <div className="relative">
               <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
               <textarea 
                 required
                 placeholder={type === 'lost' ? "Where did you last see it?" : "Where did you find it?"}
                 className={cn(
                   "w-full bg-white border rounded-2xl py-4 pl-12 pr-4 font-bold text-[#002D72] focus:outline-none shadow-sm h-32 transition-all",
                   type === 'found' ? "border-green-100 focus:ring-2 focus:ring-green-500/20" : "border-orange-100 focus:ring-2 focus:ring-[#F27D26]/20"
                 )}
                 value={formData.location}
                 onChange={e => setFormData({...formData, location: e.target.value})}
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-black text-[#002D72] uppercase tracking-widest ml-1">Contact Number</label>
             <div className="relative">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input 
                 required
                 type="tel"
                 placeholder="Alternate contact number"
                 className={cn(
                   "w-full bg-white border rounded-2xl py-4 pl-12 pr-4 font-bold text-[#002D72] focus:outline-none shadow-sm transition-all",
                   type === 'found' ? "border-green-100 focus:ring-2 focus:ring-green-500/20" : "border-orange-100 focus:ring-2 focus:ring-[#F27D26]/20"
                 )}
                 value={formData.contactNumber}
                 onChange={e => setFormData({...formData, contactNumber: e.target.value})}
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-black text-[#002D72] uppercase tracking-widest ml-1">Description</label>
             <textarea 
               placeholder="Briefly describe the item (color, brand, any markings)"
               className={cn(
                 "w-full bg-white border rounded-2xl py-4 px-4 font-bold text-[#002D72] focus:outline-none shadow-sm h-32 transition-all",
                 type === 'found' ? "border-green-100 focus:ring-2 focus:ring-green-500/20" : "border-orange-100 focus:ring-2 focus:ring-[#F27D26]/20"
               )}
               value={formData.description}
               onChange={e => setFormData({...formData, description: e.target.value})}
             />
           </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
           <label className="text-xs font-black text-[#002D72] uppercase tracking-widest ml-1">Item Photo</label>
           
           {imagePreview ? (
             <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl aspect-video">
               <img src={imagePreview} className="w-full h-full object-cover" />
               <button 
                 type="button"
                 onClick={() => { setImageFile(null); setImagePreview(null); }}
                 className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-md"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
           ) : (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={cn(
                 "border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 active:bg-orange-50 cursor-pointer transition-all",
                 type === 'found' ? "border-green-200 bg-green-50/20" : "border-orange-200 bg-orange-50/20"
               )}
             >
               <div className={cn(
                 "w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm",
                 type === 'found' ? "text-green-500" : "text-[#F27D26]"
               )}>
                 <Camera className="w-8 h-8" />
               </div>
               <div className="text-center">
                 <p className="font-black text-[#002D72]">Upload Photo</p>
                 <p className="text-[10px] font-bold text-[#002D72]/40 uppercase tracking-widest">Camera or Gallery</p>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleImageChange}
               />
             </div>
           )}
        </div>

        {/* Emergency Toggle */}
        <div 
          onClick={() => setFormData({...formData, emergency: !formData.emergency})}
          className={cn(
            "p-5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all",
            formData.emergency 
              ? "bg-red-50 border-red-200" 
              : "bg-white border-orange-100"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              formData.emergency ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
            )}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className={cn("font-black text-sm", formData.emergency ? "text-red-700" : "text-[#002D72]")}>
                Emergency Report
              </p>
              <p className="text-[10px] font-bold text-[#002D72]/40 uppercase">High priority / Child Missing</p>
            </div>
          </div>
          <div className={cn(
            "w-12 h-6 rounded-full relative transition-colors",
            formData.emergency ? "bg-red-500" : "bg-gray-200"
          )}>
            <motion.div 
              animate={{ x: formData.emergency ? 24 : 4 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </div>
        </div>

        <button 
          disabled={submitting}
          type="submit"
          className={cn(
            "w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3",
            type === 'found' ? "bg-[#4CAF50] shadow-green-100" : "bg-[#F27D26] shadow-orange-100"
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6" />
              Submit Report
            </>
          )}
        </button>

      </form>
    </motion.div>
  );
}
