import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Settings, Bell, User, Shield, Database, Smartphone, Globe, ChevronRight, LogOut, Moon, Volume2, Lock, History, CloudLightning, Info, X, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import AdminLayout from './AdminLayout';
import { auth, db, storage } from '../../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function AdminSettings() {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [formData, setFormData] = useState({ fullName: '', village: '' });
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        // Fetch Admin Data
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const data = userDoc.data();
        setAdminData(data);
        if (data) {
          setFormData({
            fullName: data.fullName || '',
            village: data.village || ''
          });
        }

        // Fetch App Banner
        const settingsDoc = await getDoc(doc(db, 'settings', 'banner'));
        if (settingsDoc.exists()) {
          setBannerUrl(settingsDoc.data().url);
        }
      }
    };
    fetchData();
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const storageRef = ref(storage, `all-photo/banner_${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadResult.ref);
      
      await setDoc(doc(db, 'settings', 'banner'), {
        url,
        updatedAt: new Date(),
        updatedBy: auth.currentUser?.uid
      });
      
      setBannerUrl(url);
      alert('Banner updated successfully!');
    } catch (err) {
      console.error('Error uploading banner:', err);
      alert('Failed to upload banner');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        fullName: formData.fullName,
        village: formData.village,
        updatedAt: new Date()
      });
      setAdminData(prev => ({ ...prev, ...formData }));
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/splash');
  };

  const sections = [
    {
      title: 'General Settings',
      items: [
        { id: 'profile', label: 'Admin Profile', icon: User, color: 'text-purple-600', bg: 'bg-purple-50', value: 'Root Admin' },
        { id: 'notifications', label: 'System Notifications', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50', value: 'Active' },
        { id: 'appearance', label: 'Appearance', icon: Moon, color: 'text-gray-600', bg: 'bg-gray-50', value: 'System Default' },
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { id: 'security', label: 'Security Protocols', icon: Shield, color: 'text-green-600', bg: 'bg-green-50', value: 'Encrypted' },
        { id: '2fa', label: 'Two-Factor Auth', icon: Lock, color: 'text-orange-600', bg: 'bg-orange-50', value: 'Enabled' },
        { id: 'logs', label: 'Activity Logs', icon: History, color: 'text-indigo-600', bg: 'bg-indigo-50', value: 'View Logs' },
      ]
    },
    {
      title: 'App Customization',
      items: [
        { id: 'banner', label: 'Home Page Banner', icon: ImageIcon, color: 'text-orange-600', bg: 'bg-orange-50', value: bannerUrl ? 'Uploaded' : 'Default' },
      ]
    },
    {
      title: 'Infrastructure',
      items: [
        { id: 'backup', label: 'Backup & Restore', icon: Database, color: 'text-cyan-600', bg: 'bg-cyan-50', value: 'Daily 03:00' },
        { id: 'api', label: 'Service Integration', icon: CloudLightning, color: 'text-yellow-600', bg: 'bg-yellow-50', value: '3 Active' },
        { id: 'updates', label: 'App Version', icon: Info, color: 'text-gray-400', bg: 'bg-gray-100', value: 'v2.4.1-stable' },
      ]
    }
  ];

  return (
    <AdminLayout title="System Settings" activeTab="settings">
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
         
         {/* Profile Card Overlay */}
         <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-purple-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-110 transition-transform">
               <Settings className="w-64 h-64" />
            </div>
            
            <div className="relative">
               <div className="w-32 h-32 rounded-[2.5rem] bg-purple-500 flex items-center justify-center border-4 border-white/10 shadow-inner group-hover:rotate-6 transition-transform">
                  <User className="w-14 h-14" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-green-500 p-2.5 rounded-2xl border-4 border-[#1A1A2E]">
                  <CloudLightning className="w-4 h-4 text-white" />
               </div>
            </div>

            <div className="flex-1 text-center md:text-left">
               <h3 className="text-3xl font-black tracking-tight leading-none">{adminData?.fullName || 'Admin User'}</h3>
               <p className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mt-3 bg-purple-400/10 inline-block px-4 py-1.5 rounded-full border border-purple-400/20">
                 {adminData?.village ? `${adminData.village} Admin` : 'Main System Administrator'}
               </p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
                  <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                     <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1 leading-none">Last Login</p>
                     <p className="text-xs font-bold">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5">
                     <p className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1 leading-none">Access Level</p>
                     <p className="text-xs font-bold">{adminData?.userType === 'Admin' ? 'Root Access' : 'Limited Access'}</p>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-5 bg-red-500/10 text-red-500 rounded-[2rem] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl group"
            >
               <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
         </div>

         {/* Setting Sections */}
         <div className="space-y-12">
            {sections.map((section) => (
               <div key={section.title} className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{section.title}</h4>
                  <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden divide-y divide-gray-50 px-2">
                     {section.items.map((item) => (
                        <button 
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'profile') setIsEditingProfile(true);
                            if (item.id === 'banner') setIsEditingBanner(true);
                          }}
                          className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all group"
                        >
                           <div className="flex items-center gap-5">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
                                 <item.icon className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                 <p className="text-sm font-black text-[#1A1A2E] group-hover:text-purple-600 transition-colors">{item.label}</p>
                                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.id === 'updates' ? 'System stable' : 'Configure parameter'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.value}</span>
                              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors group-hover:translate-x-1" />
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
            ))}
         </div>

         {/* System Info */}
         <div className="text-center pt-10 border-t border-gray-100 space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">JATRE – NAMMA PRIDE • Professional Management Console</p>
            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.3em]">Crafted for the Grand Festival Experience</p>
         </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
              className="absolute inset-0 bg-[#1A1A2E]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1A1A2E] leading-none">Edit Profile</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Update admin credentials</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Village / Region</label>
                  <input 
                    type="text" 
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Enter village name"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-[#1A1A2E] text-white py-5 rounded-[2rem] font-bold text-sm shadow-xl shadow-purple-900/20 active:scale-[0.98] transition-all"
                >
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingBanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingBanner(false)}
              className="absolute inset-0 bg-[#1A1A2E]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1A1A2E] leading-none">Home Banner</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Update main app banner</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditingBanner(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="aspect-video rounded-3xl bg-gray-100 overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                  {bannerUrl ? (
                    <img src={bannerUrl} className="w-full h-full object-cover" alt="Banner Preview" />
                  ) : (
                    <div className="text-center text-gray-300">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Banner Set</p>
                    </div>
                  )}
                  {uploadingBanner && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <input 
                    type="file" 
                    ref={bannerInputRef} 
                    onChange={handleBannerUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <button 
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="w-full bg-orange-500 text-white py-5 rounded-[2rem] font-bold text-sm shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload New Banner</span>
                  </button>
                  <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest">Recommended size: 1200 x 600 px</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
