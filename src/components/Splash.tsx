import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function Splash() {
  const navigate = useNavigate();
  const loadingDots = [0, 1, 2];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, check for profile
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            // Already registered - stay on splash for a bit then home
            setTimeout(() => navigate('/'), 2000);
          } else {
            // Not registered - go to register
            setTimeout(() => navigate('/register'), 2000);
          }
        } catch (err) {
          console.error('Error checking user profile:', err);
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        // Not logged in
        setTimeout(() => navigate('/login'), 2000);
      }
    });

    return () => unsub();
  }, [navigate]);

  return (
    <motion.div 
      id="splash-container" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full bg-[#FDF5E6] bg-gradient-to-b from-[#FFFBF0] to-[#FFF4E0] relative flex flex-col items-center overflow-hidden py-20 px-8"
    >
      {/* Top Decorations: Flower Garlands */}
      <div id="top-decorations" className="absolute top-0 left-0 right-0 pointer-events-none z-20">
        <svg className="absolute top-[-10px] left-[-10px] w-[140px] h-[140px]" viewBox="0 0 100 100">
          <path d="M0,0 Q30,10 50,40 Q70,70 100,80" fill="none" stroke="#F27D26" strokeWidth="4" strokeDasharray="1,8" strokeLinecap="round" />
          <circle cx="10" cy="10" r="6" fill="#F27D26" />
          <circle cx="35" cy="15" r="5" fill="#FFB300" />
          <circle cx="55" cy="35" r="6" fill="#F27D26" />
          <circle cx="75" cy="65" r="5" fill="#FFB300" />
        </svg>
        <svg className="absolute top-[-10px] right-[-10px] w-[140px] h-[140px] transform scale-x-[-1]" viewBox="0 0 100 100">
          <path d="M0,0 Q30,10 50,40 Q70,70 100,80" fill="none" stroke="#F27D26" strokeWidth="4" strokeDasharray="1,8" strokeLinecap="round" />
          <circle cx="10" cy="10" r="6" fill="#F27D26" />
          <circle cx="35" cy="15" r="5" fill="#FFB300" />
          <circle cx="55" cy="35" r="6" fill="#F27D26" />
          <circle cx="75" cy="65" r="5" fill="#FFB300" />
        </svg>
      </div>

      {/* Center Logo Section */}
      <div id="logo-section" className="flex flex-col items-center mt-20 z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-[100px] h-[100px] rounded-full border-2 border-[#F27D26] flex items-center justify-center bg-white shadow-lg p-4"
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#F27D26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 12h3v8h14v-8h3L12 2z" />
              <path d="M12 2v6" />
              <circle cx="12" cy="14" r="2" />
          </svg>
        </motion.div>

        <div id="app-title" className="text-center mt-8">
          <h1 className="font-serif text-[56px] font-black text-[#002D72] tracking-[1.5px] leading-tight">
            JATRE
          </h1>
          <h2 className="font-serif text-[36px] font-bold text-[#F27D26] tracking-[3px] mt-1 uppercase">
            NAMMA PRIDE
          </h2>
        </div>

        <div id="tagline" className="text-center mt-6">
          <p className="text-[#555555] text-[16px] font-normal leading-[1.6] font-sans">
            Your Digital Guide<br />to Village Fair
          </p>
        </div>
      </div>

      {/* Main Illustration Area */}
      <div id="temple-illustration" className="absolute bottom-[80px] left-0 right-0 flex flex-col justify-end items-center pointer-events-none">
          <div className="relative w-full max-w-[600px] aspect-[4/3] flex items-center justify-center">
            <div className="absolute inset-x-0 bottom-0 top-1/4 bg-[radial-gradient(circle_at_center,rgba(242,125,38,0.15)_0%,transparent_75%)]" />
            
            <svg width="450" height="340" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax meet" className="drop-shadow-2xl">
                <path d="M50 240 L150 240 L120 180 L80 180 Z" fill="#D35400" opacity="0.2" />
                <path d="M250 240 L350 240 L320 180 L280 180 Z" fill="#D35400" opacity="0.2" />
                <rect x="170" y="240" width="60" height="20" rx="4" fill="#5D4037" />
                <rect x="150" y="210" width="100" height="30" fill="#795548" />
                <path d="M140 210 L260 210 L240 160 L160 160 Z" fill="#F39C12" />
                <path d="M155 160 L245 160 L230 120 L170 120 Z" fill="#E67E22" />
                <path d="M170 120 L230 120 L220 80 L180 80 Z" fill="#F27D26" />
                <path d="M185 80 L215 80 L200 40 Z" fill="#FFB300" />
                <path d="M200 40 L200 20 L225 30 Z" fill="#F27D26" />
                <path d="M0 260 Q30 230 60 260 Q90 230 120 260 Q150 240 180 260 Q210 230 240 260 Q270 240 300 260 Q330 230 360 260 Q390 240 400 260 L400 300 L0 300 Z" fill="#2C3E50" opacity="0.8" />
                <circle cx="200" cy="185" r="8" fill="#FFFBF0" opacity="0.4" />
                <circle cx="200" cy="140" r="6" fill="#FFFBF0" opacity="0.4" />
            </svg>
          </div>
      </div>

      <div id="loading-indicator" className="absolute bottom-[50px] flex gap-3">
        {loadingDots.map((dot) => (
          <motion.div
            key={dot}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: dot * 0.2,
            }}
            className={`w-2 h-2 bg-[#F27D26] rounded-full ${dot === 1 ? 'shadow-[0_0_12px_#F27D26]' : ''}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
