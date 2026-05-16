import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  User, 
  CheckCircle, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  LogOut,
  Loader2,
  Briefcase,
  Home as HomeIcon,
  Bell
} from "lucide-react";
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import BottomNav from './BottomNav';

export default function VolunteerProfileView() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (err) {
          console.error('Fetch Volunteer Profile Error:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/splash');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  const volunteerStats = [
    { label: 'Total Hours', value: profile?.totalHours || 0, icon: <Clock className="w-4 h-4" /> },
    { label: 'People Helped', value: profile?.peopleHelped || 0, icon: <Users className="w-4 h-4" /> },
    { label: 'Rating', value: profile?.rating || 0, icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full pb-10"
    >
      {/* Header */}
      <div className="bg-white border-b border-indigo-100 flex items-center px-6 py-5 sticky top-0 z-50 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-indigo-900 active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-serif text-xl font-black text-indigo-900 uppercase tracking-tight">{t('volunteer')} Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Profile Card */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl rotate-3">
              {profile?.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} className="w-full h-full object-cover -rotate-3 scale-110" />
              ) : (
                <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-200">
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>
            {profile?.verified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-2xl p-2 border-4 border-white shadow-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-black text-[#002D72] mb-1">{profile?.fullName}</h2>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Verified Volunteer • ID: {profile?.volunteerId || 'V-00234'}</p>
            
            <div className="flex items-center justify-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn("w-4 h-4", s <= (profile?.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {volunteerStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm border border-indigo-50 text-center flex flex-col items-center gap-1">
              <div className="text-indigo-400 mb-1">{stat.icon}</div>
              <p className="text-lg font-black text-[#002D72] leading-none">{stat.value}</p>
              <p className="text-[8px] font-bold text-[#002D72]/40 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Info Sections */}
        <div className="space-y-4">
          {/* About */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-indigo-50 space-y-3">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">About Me</h4>
            <p className="text-xs font-medium text-[#002D72]/60 leading-relaxed">
              {profile?.about || "Dedicated volunteer with a passion for community service. Happy to help visitors explore our rich cultural heritage during the festival."}
            </p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-indigo-50 divide-y divide-indigo-50">
            <div className="flex items-center gap-4 py-4 first:pt-0">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] font-black text-[#002D72]/40 uppercase tracking-widest">Phone</p>
                <p className="text-sm font-bold text-[#002D72]">{profile?.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] font-black text-[#002D72]/40 uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-[#002D72]">{profile?.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] font-black text-[#002D72]/40 uppercase tracking-widest">Assigned Area</p>
                <p className="text-sm font-bold text-[#002D72]">{profile?.assignedArea || 'Main Temple'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-4 last:pb-0">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] font-black text-[#002D72]/40 uppercase tracking-widest">Joined Date</p>
                <p className="text-sm font-bold text-[#002D72]">12 April 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 rounded-3xl py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-red-500 hover:text-white border border-red-100 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Logout Account
          </button>
        </div>
      </div>

      <BottomNav activeTab="profile" />


    </motion.div>
  );
}
