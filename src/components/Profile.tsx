import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  User, 
  LogOut, 
  Phone, 
  MapPin, 
  FileText, 
  Bell, 
  Globe, 
  HelpCircle, 
  Info, 
  ChevronRight,
  Home as HomeIcon,
  Camera,
  Loader2,
  Briefcase
} from "lucide-react";
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/translations';

export default function UserProfileScreen() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab] = useState('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/splash');
      } else {
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            if (data.userType === 'Volunteer') {
              navigate('/volunteer/profile');
              return;
            }
            setProfile({ uid: docSnap.id, ...data } as UserProfile);
          }
        } catch (err) {
          console.error('Fetch Profile Error:', err);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/splash');
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageSelect(false);
  };

  const MENU_ITEMS = [
    { id: 'reports', title: t('myReports'), icon: <FileText className="w-5 h-5 text-orange-500" />, path: '/lost-found' },
    { id: 'notifications', title: t('notifications'), icon: <Bell className="w-5 h-5 text-blue-500" />, path: '/alerts' },
    { id: 'language', title: t('language'), icon: <Globe className="w-5 h-5 text-green-500" />, sub: language === 'en' ? 'English' : 'ಕನ್ನಡ', path: 'language' },
    { id: 'help', title: t('helpSupport'), icon: <HelpCircle className="w-5 h-5 text-purple-500" />, path: '/emergency' },
    { id: 'about', title: t('aboutApp'), icon: <Info className="w-5 h-5 text-gray-500" />, path: '/about' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative pb-24"
    >
      {/* Header */}
      <div className="bg-white border-b border-orange-100 flex items-center px-6 py-5 sticky top-0 z-50 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#002D72] active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-serif text-xl font-black text-[#002D72] uppercase tracking-tight">{t('myProfile')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-orange-100/30 border border-orange-50 flex items-center gap-5 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-50" />
           
           <div className="relative">
             <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-50 shadow-md">
               {profile?.profilePhotoUrl ? (
                 <img src={profile.profilePhotoUrl} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-400">
                    <User className="w-10 h-10" />
                 </div>
               )}
             </div>
             <button className="absolute bottom-0 right-0 p-2 bg-[#F27D26] text-white rounded-full shadow-lg border-2 border-white active:scale-90 transition-transform">
               <Camera className="w-4 h-4" />
             </button>
           </div>

           <div className="flex-1 min-w-0">
             <h2 className="text-xl font-black text-[#002D72] leading-tight truncate">{profile?.fullName || 'User Name'}</h2>
             <div className="flex items-center gap-1 mt-1 font-bold text-[#F27D26] text-[11px] uppercase tracking-wider">
               <MapPin className="w-3 h-3" />
               {profile?.village || t('village')}
             </div>
             <div className="flex items-center gap-1 mt-0.5 text-[#002D72]/40 font-bold text-[10px] tracking-widest uppercase">
               <Phone className="w-2.5 h-2.5" />
               {profile?.phoneNumber}
             </div>
           </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-3">
          {MENU_ITEMS.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (item.id === 'language') setShowLanguageSelect(true);
                else if (item.path !== '#') navigate(item.path);
              }}
              className="w-full bg-white rounded-3xl p-4 shadow-sm border border-orange-50 flex items-center justify-between group active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-orange-50/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#002D72] text-[15px]">{item.title}</h4>
                  {item.sub && <p className="text-[10px] font-black uppercase text-[#F27D26] tracking-widest">{item.sub}</p>}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#002D72]/20 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="pt-4 flex flex-col items-center">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full bg-red-50 text-red-600 rounded-3xl py-5 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-red-500 hover:text-white group border border-red-100"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            {t('logout')}
          </button>
          <p className="mt-6 text-[10px] font-bold text-[#002D72]/20 uppercase tracking-widest">App Version 2.0.4 • Beta</p>
        </div>
      </div>

      {/* Language Selection Dialog */}
      <AnimatePresence>
        {showLanguageSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLanguageSelect(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10"
            >
              <h3 className="text-center font-serif text-2xl font-black text-[#002D72] mb-6">{t('language')}</h3>
              
              <div className="space-y-3">
                {[
                  { id: 'en', label: 'English', sub: 'English' },
                  { id: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id as Language)}
                    className={cn(
                      "w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95",
                      language === lang.id 
                        ? "bg-orange-50 border-[#F27D26] text-[#002D72]" 
                        : "bg-white border-orange-50 text-[#002D72]/40"
                    )}
                  >
                    <div className="text-left">
                      <p className="font-black text-lg leading-none mb-1">{lang.label}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{lang.sub}</p>
                    </div>
                    {language === lang.id && (
                      <div className="w-6 h-6 bg-[#F27D26] rounded-full flex items-center justify-center text-white">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowLanguageSelect(false)}
                className="w-full mt-6 py-4 bg-[#002D72] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-transform"
              >
                {t('cancel')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10"
            >
              <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                 <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-center font-serif text-2xl font-black text-[#002D72] mb-2">{t('logoutConfirmTitle')}</h3>
              <p className="text-center text-sm font-medium text-[#002D72]/50 mb-8 px-4">
                {t('logoutConfirmDesc')}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-4 bg-orange-50 text-[#002D72] font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-transform"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition-transform"
                >
                  {t('logout')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-orange-100 flex items-center justify-around py-3 px-6 z-50">
        <button 
          onClick={() => navigate('/')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'home' ? "text-[#F27D26]" : "text-gray-300 hover:text-gray-400"
          )}
        >
          <HomeIcon className={cn("w-6 h-6", activeTab === 'home' ? "scale-110" : "")} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('home')}</span>
          {activeTab === 'home' && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#F27D26] rounded-full" />}
        </button>

        <button 
          onClick={() => navigate('/announcements')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'alerts' ? "text-[#F27D26]" : "text-gray-300 hover:text-gray-400"
          )}
        >
          <Bell className={cn("w-6 h-6", activeTab === 'alerts' ? "scale-110" : "")} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('alerts')}</span>
          {activeTab === 'alerts' && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#F27D26] rounded-full" />}
        </button>

        {profile?.userType === 'Volunteer' && (
          <button 
            onClick={() => navigate('/volunteer/home')}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeTab === 'volunteer' ? "text-purple-600" : "text-gray-300 hover:text-gray-400"
            )}
          >
            <Briefcase className={cn("w-6 h-6", activeTab === 'volunteer' ? "scale-110" : "")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('volunteer')}</span>
            {activeTab === 'volunteer' && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-purple-600 rounded-full" />}
          </button>
        )}

        <button 
          onClick={() => navigate('/profile')}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === 'profile' ? "text-[#F27D26]" : "text-gray-300 hover:text-gray-400"
          )}
        >
          <User className={cn("w-6 h-6", activeTab === 'profile' ? "scale-110" : "")} />
          <span className="text-[10px] font-black uppercase tracking-widest">{t('profile')}</span>
          {activeTab === 'profile' && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#F27D26] rounded-full" />}
        </button>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
