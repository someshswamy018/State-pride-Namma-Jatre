import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  Volume2, 
  Share2, 
  Bookmark, 
  MessageCircle,
  PlayCircle,
  ArrowRight,
  Loader2,
  Calendar,
  Tag,
  Quote
} from "lucide-react";
import { db } from '../lib/firebase';
import { doc, getDoc, collection, limit, query, getDocs } from 'firebase/firestore';
import { CulturalStory } from '../types';
import { cn } from '../lib/utils';

export default function StoryDetails() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<CulturalStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<CulturalStory[]>([]);
  const [isNarrating, setIsNarrating] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      if (storyId) {
        try {
          const docSnap = await getDoc(doc(db, 'cultural_stories', storyId));
          if (docSnap.exists()) {
            setStory({ id: docSnap.id, ...docSnap.data() } as CulturalStory);
          }
          
          // Fetch related
          const relatedSnap = await getDocs(query(collection(db, 'cultural_stories'), limit(3)));
          setRelated(relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as CulturalStory))
            .filter(d => d.id !== storyId)
          );
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    };
    fetchStory();
  }, [storyId]);

  const handleTTS = () => {
    if (!story) return;
    
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(story.fullStory);
    utterance.onend = () => setIsNarrating(false);
    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF5E6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
      </div>
    );
  }

  if (!story) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative shadow-2xl"
    >
      {/* Banner */}
      <div className="relative h-[45vh] w-full shrink-0 bg-gray-100 flex items-center justify-center">
        <img 
          src={story.imageUrl} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544376430-19f86053f3e1?auto=format&fit=crop&q=80&w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-black/20 backdrop-blur-md rounded-2xl text-white active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button className="p-3 bg-black/20 backdrop-blur-md rounded-2xl text-white active:scale-90 transition-transform">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 bg-black/20 backdrop-blur-md rounded-2xl text-white active:scale-90 transition-transform">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Category Badge */}
        <div className="absolute bottom-12 left-6">
           <motion.span 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="px-4 py-1.5 bg-[#F27D26] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg"
           >
             {story.category}
           </motion.span>
        </div>
      </div>

      {/* Content Card */}
      <div className="px-4 -mt-8 relative z-10 flex-1">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-orange-100/30 border border-orange-50 min-h-[50vh] pb-12">
          {/* Audio Tool */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-bold text-[#002D72]/40 uppercase tracking-widest">Heritage Archive</span>
            </div>
            <button 
              onClick={handleTTS}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                isNarrating ? "bg-[#002D72] text-white shadow-lg" : "bg-orange-50 text-[#F27D26]"
              )}
            >
              {isNarrating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[9px] font-black uppercase tracking-widest">
                {isNarrating ? 'Reading...' : 'Listen'}
              </span>
            </button>
          </div>

          <h1 className="font-serif text-2xl font-black text-[#002D72] mb-4 leading-tight">
            {story.title}
          </h1>

          <div className="relative mb-8 pt-2">
            <Quote className="absolute -top-2 -left-2 w-10 h-10 text-orange-50 -z-10" />
            <p className="text-[#002D72]/80 font-medium leading-[1.7] text-[15px] first-letter:text-4xl first-letter:font-serif first-letter:font-black first-letter:mr-2 first-letter:float-left first-letter:text-[#F27D26]">
              {story.fullStory}
            </p>
          </div>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-4 my-8 opacity-20">
             <div className="h-[0.5px] flex-1 bg-[#002D72]" />
             <Tag className="w-3.5 h-3.5 text-[#002D72]" />
             <div className="h-[0.5px] flex-1 bg-[#002D72]" />
          </div>

          {/* Related Stories */}
          {related.length > 0 && (
            <div className="space-y-5">
              <h4 className="font-serif text-lg font-black text-[#002D72]">More from Archives</h4>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 snap-x">
                {related.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/story/${item.id}`)}
                    className="min-w-[180px] bg-orange-50/50 rounded-2xl p-3 flex flex-col gap-2 group active:scale-95 transition-transform snap-start"
                  >
                    <div className="h-24 rounded-xl overflow-hidden bg-orange-100">
                       <img src={item.imageUrl} className="w-full h-full object-cover" onError={(e) => {
                         (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400';
                       }} />
                    </div>
                    <h5 className="font-black text-[#002D72] text-[11px] leading-tight line-clamp-2">{item.title}</h5>
                    <button className="text-[8px] font-black uppercase tracking-widest text-[#F27D26] flex items-center gap-1 mt-auto">
                      Explore <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
