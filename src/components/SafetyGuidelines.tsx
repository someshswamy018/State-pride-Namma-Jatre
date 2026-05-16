import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  ShieldCheck, 
  Users, 
  Baby, 
  Flame, 
  HeartPulse, 
  PhoneForwarded,
  Loader2,
  CheckCircle2,
  Info
} from "lucide-react";
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { SafetyGuideline } from '../types';
import { cn } from '../lib/utils';

const SEED_GUIDELINES: Partial<SafetyGuideline>[] = [
  {
    title: "Emergency Evacuation",
    description: "In case of fire or stampede, follow the green illuminated exit signs. Stay calm and move in an orderly fashion towards the designated assembly points near the North and South gates.",
    category: "Evacuation"
  },
  {
    title: "Child Safety",
    description: "Keep a tag with your contact number in your child's pocket. If a child is lost, immediately report to the nearest Police Help Desk or the central announcement tower.",
    category: "Children"
  },
  {
    title: "Crowd Management",
    description: "Avoid pushing in queues. During peak hours (6 PM - 9 PM), try to stay in less congested zones. Follow the instructions of volunteers wearing orange vests.",
    category: "Crowd"
  },
  {
    title: "Fire Safety",
    description: "No smoking or open flames are allowed near the chariot or temporary stalls. Fire extinguishers are located at every 50 meters along the main temple road.",
    category: "Fire"
  },
  {
    title: "Medical Emergencies",
    description: "For any health issues, visit the 24/7 First Aid Center located behind the temple office. Ambulance services are stationed at all main entry/exit points.",
    category: "Medical"
  }
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'evacuation': return <ShieldCheck className="w-5 h-5" />;
    case 'children': return <Baby className="w-5 h-5" />;
    case 'crowd': return <Users className="w-5 h-5" />;
    case 'fire': return <Flame className="w-5 h-5" />;
    case 'medical': return <HeartPulse className="w-5 h-5" />;
    default: return <Info className="w-5 h-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'evacuation': return 'bg-blue-50 text-blue-600';
    case 'children': return 'bg-pink-50 text-pink-600';
    case 'crowd': return 'bg-purple-50 text-purple-600';
    case 'fire': return 'bg-orange-50 text-orange-600';
    case 'medical': return 'bg-green-50 text-green-600';
    default: return 'bg-gray-50 text-gray-600';
  }
};

export default function SafetyGuidelines() {
  const navigate = useNavigate();
  const [guidelines, setGuidelines] = useState<SafetyGuideline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const snap = await getDocs(collection(db, 'safety_guidelines'));
        if (snap.empty) {
          const secondSnap = await getDocs(collection(db, 'safety_guidelines'));
          if (secondSnap.empty) {
            for (const item of SEED_GUIDELINES) {
              await addDoc(collection(db, 'safety_guidelines'), {
                ...item,
                updatedAt: serverTimestamp()
              });
            }
          }
        }
      } catch (err) {
        console.error('Seeding Error:', err);
      }
    };
    checkAndSeed();

    const q = query(collection(db, 'safety_guidelines'), orderBy('updatedAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allGuidelines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SafetyGuideline));
      // Deduplicate by title
      const uniqueGuidelines = allGuidelines.reduce((acc, current) => {
        const x = acc.find(item => item.title === current.title);
        if (!x) return acc.concat([current]);
        return acc;
      }, [] as SafetyGuideline[]);
      
      setGuidelines(uniqueGuidelines);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative shadow-2xl"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F27D26] to-[#F27D26]/80 text-white flex items-center px-6 py-8 sticky top-0 z-50 rounded-b-[2.5rem] shadow-lg">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-serif text-xl font-black uppercase tracking-tight">Safety Guidelines</h1>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
            <p className="text-[#002D72] font-bold opacity-40 uppercase tracking-widest text-[10px]">Loading Safety Tips...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {guidelines.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-orange-50"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getCategoryColor(item.category))}>
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.category}</span>
                      <h3 className="font-serif text-lg font-black text-[#002D72] leading-tight">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#002D72]/70 leading-relaxed pl-14">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Emergency Support Card */}
            <div className="bg-[#002D72] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
               <h4 className="font-serif text-xl font-black mb-2">Need Immediate Help?</h4>
               <p className="text-xs opacity-70 mb-6 leading-relaxed">Our volunteers and emergency response teams are active 24/7. Reach out for any assistance.</p>
               
               <button 
                 onClick={() => navigate('/emergency')}
                 className="w-full bg-white text-[#002D72] py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform"
               >
                 <PhoneForwarded className="w-5 h-5" />
                 View Contacts
               </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
