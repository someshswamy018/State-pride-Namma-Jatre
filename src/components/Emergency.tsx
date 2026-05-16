import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  Phone, 
  ShieldAlert, 
  Ambulance, 
  PlusSquare, 
  Users, 
  Navigation, 
  MessageSquare,
  ArrowRight,
  Shield,
  Loader2,
  Share2,
  AlertCircle
} from "lucide-react";
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { EmergencyContact } from '../types';
import { cn } from '../lib/utils';

const SEED_CONTACTS: Partial<EmergencyContact>[] = [
  { title: 'Call Police', contactNumber: '100', type: 'police', description: 'Immediate law enforcement help' },
  { title: 'Call Ambulance', contactNumber: '108', type: 'ambulance', description: 'Medical emergency transport' },
  { title: 'First Aid Center', contactNumber: '0812-345678', type: 'medical', description: 'Main medical camp at North Gate', location: 'Melukote Main Road' },
  { title: 'Volunteer Support', contactNumber: '9876543210', type: 'volunteer', description: 'Local assistance and information' }
];

export default function Emergency() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [recipient, setRecipient] = useState('All Services');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const snap = await getDocs(collection(db, 'emergency_contacts'));
        if (snap.empty) {
          // Double check to avoid race conditions
          const secondSnap = await getDocs(collection(db, 'emergency_contacts'));
          if (secondSnap.empty) {
            for (const contact of SEED_CONTACTS) {
              await addDoc(collection(db, 'emergency_contacts'), {
                ...contact,
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

    const unsub = onSnapshot(collection(db, 'emergency_contacts'), (snap) => {
      const allContacts = snap.docs.map(d => ({ id: d.id, ...d.data() } as EmergencyContact));
      // Deduplicate by title to be safe
      const uniqueContacts = allContacts.reduce((acc, current) => {
        const x = acc.find(item => item.title === current.title);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, [] as EmergencyContact[]);
      
      setContacts(uniqueContacts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return unsub;
  }, []);

  const handleCall = (number: string) => {
    window.open(`tel:${number}`);
  };

  const shareSOS = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Emergency SOS - Jatre App',
        text: 'I need help at Melukote Jatre! Here is my live location: ' + window.location.href,
        url: window.location.href,
      });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'emergency_messages'), {
        userId: 'temp-user', // In real app, get from auth
        userName: 'Visitor',
        recipient: recipient,
        message: message,
        status: 'sent',
        createdAt: serverTimestamp()
      });
      setMessage('');
      setRecipient('All Services');
      setIsMessageOpen(false);
      alert(`Your message has been sent to ${recipient}.`);
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try calling instead.');
    } finally {
      setIsSending(false);
    }
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'police': return <ShieldAlert className="w-8 h-8 text-blue-600" />;
      case 'ambulance': return <Ambulance className="w-8 h-8 text-pink-600" />;
      case 'medical': return <PlusSquare className="w-8 h-8 text-green-600" />;
      case 'volunteer': return <Users className="w-8 h-8 text-purple-600" />;
      default: return <Phone className="w-8 h-8 text-orange-600" />;
    }
  };

  const getContactBg = (type: string) => {
    switch (type) {
      case 'police': return 'bg-blue-50';
      case 'ambulance': return 'bg-pink-50';
      case 'medical': return 'bg-green-50';
      case 'volunteer': return 'bg-purple-50';
      default: return 'bg-orange-50';
    }
  };

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
        <h1 className="ml-4 font-serif text-xl font-black uppercase tracking-tight">Emergency Help</h1>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
            <p className="text-[#002D72] font-bold opacity-40 uppercase tracking-widest text-[10px]">Loading Emergency Services...</p>
          </div>
        ) : (
          <>
            {/* Emergency Info Card */}
            <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-5 flex items-start gap-4">
               <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
               <div>
                  <h4 className="font-black text-red-600 text-xs uppercase tracking-widest mb-1">Stay Calm & Alert</h4>
                  <p className="text-[11px] font-medium text-red-500 leading-relaxed">In case of any emergency, please find the nearest volunteer or use the help desks mentioned below.</p>
               </div>
            </div>

            {/* Emergency Grid */}
            <div className="grid grid-cols-2 gap-4">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => contact.type === 'medical' ? navigate('/map') : handleCall(contact.contactNumber)}
                  className={cn(
                    "rounded-[2.5rem] p-6 shadow-sm flex flex-col items-center text-center gap-4 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-orange-100",
                    getContactBg(contact.type)
                  )}
                >
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center mb-2">
                    {getContactIcon(contact.type)}
                  </div>
                  <div>
                    <h3 className="font-black text-[#002D72] text-[13px] uppercase tracking-tight mb-1">{contact.title}</h3>
                    <p className="text-[#F27D26] font-black text-lg leading-none">{contact.contactNumber}</p>
                    {contact.type === 'medical' && (
                      <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest mt-1 block">View on Map</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Community Support Section */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h4 className="font-serif text-lg font-black text-[#002D72]">Safety Section</h4>
               </div>
               
               <button 
                 onClick={() => navigate('/safety-guidelines')}
                 className="w-full bg-white rounded-3xl p-5 shadow-sm border border-orange-50 flex items-center justify-between group active:scale-[0.98] transition-transform"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F27D26]">
                     <Shield className="w-6 h-6" />
                   </div>
                   <div className="text-left">
                     <h5 className="font-black text-[#002D72] text-[15px] uppercase tracking-tight">Safety Guidelines</h5>
                     <p className="text-[11px] font-bold text-[#002D72]/40 uppercase tracking-widest">Tips to keep you safe</p>
                   </div>
                 </div>
                 <ArrowRight className="w-6 h-6 text-[#F27D26] group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </>
        )}
      </div>

      {/* Floating SOS Button */}
      <div className="fixed bottom-10 right-6 z-[100] flex flex-col gap-4">
         <motion.button 
           whileTap={{ scale: 0.9 }}
           onClick={shareSOS}
           className="w-16 h-16 bg-red-600 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center relative overflow-hidden group"
         >
           <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform rounded-full" />
           <Share2 className="w-7 h-7" />
         </motion.button>
         
         <motion.button 
           initial={{ scale: 0 }} 
           animate={{ scale: 1 }}
           onClick={() => setIsMessageOpen(true)}
           className="w-16 h-16 bg-[#002D72] text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"
         >
           <MessageSquare className="w-7 h-7" />
         </motion.button>
      </div>

      <AnimatePresence>
        {isMessageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMessageOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10"
            >
              <h3 className="font-serif text-2xl font-black text-[#002D72] mb-2">Send SOS Message</h3>
              <p className="text-xs text-[#002D72]/50 font-bold uppercase tracking-widest mb-6">Describe your emergency</p>
              
              <div className="mb-6">
                <label className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-widest mb-2 block">To whom?</label>
                <div className="flex flex-wrap gap-2">
                  {['All Services', 'Police', 'Ambulance', 'Volunteers'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRecipient(r)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        recipient === r ? "bg-[#F27D26] text-white shadow-lg" : "bg-orange-50 text-[#002D72]/50"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-32 bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 mb-6 resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setIsMessageOpen(false)}
                  className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[#002D72]/40 text-[10px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim()}
                  className="flex-1 bg-[#F27D26] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-100 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send SOS'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
