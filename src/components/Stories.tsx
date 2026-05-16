import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  BookOpen, 
  Search, 
  Filter,
  ArrowRight,
  Heart,
  Share2,
  Loader2
} from "lucide-react";
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { CulturalStory } from '../types';
import { cn } from '../lib/utils';

const SEED_STORIES: Partial<CulturalStory>[] = [
  {
    title: "Why Rathotsava is Celebrated?",
    shortDescription: "Read about the significance of Rathotsava in our village and its ancient roots.",
    fullStory: "Rathotsava, or the Chariot Festival, is one of the most vibrant traditions in our village. It celebrates the journey of the deity through the streets, symbolizing the divine presence among the common people. The massive wooden chariot, painstakingly decorated with flowers and silk, is pulled by hundreds of devotees. It is believed that even a slight touch of the chariot ropes can wash away one's sins. This tradition dates back centuries, serving as a time for entire communities to unite in faith and celebration.",
    imageUrl: "https://images.unsplash.com/photo-1544376430-19f86053f3e1?auto=format&fit=crop&q=80&w=800",
    category: "Festivals",
    language: "English"
  },
  {
    title: "History of Our Village Goddess",
    shortDescription: "The divine story and importance of our protector goddess and her miracles.",
    fullStory: "Our village goddess has been the silent protector of this land for generations. Ancient legends tell of a time when the village faced a great drought, and the people prayed fervently. The goddess appeared in a dream to a young child, pointing toward a hidden spring. Today, the temple stands at that very spot. Every year during the Jatre, we offer our gratitude through special rituals and traditional songs that have been passed down for centuries.",
    imageUrl: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fcd1?auto=format&fit=crop&q=80&w=800",
    category: "Mythology",
    language: "English"
  },
  {
    title: "Legend Behind the Jatre",
    shortDescription: "The ancient legend that explains the origin of our famous village fair.",
    fullStory: "The origins of our Jatre are as colorful as the fair itself. It is said that the Jatre was first established by a benevolent ruler who wanted to create a space where farmers could trade their harvests and celebrate the end of the season. Over time, it evolved into a massive cultural phenomenon, blending commerce with spirituality. From the giant Ferris wheels to the local artisans showcasing their crafts, every element of the Jatre tells a story of survival, prosperity, and joy.",
    imageUrl: "https://images.unsplash.com/photo-1582234149811-0428ad749666?auto=format&fit=crop&q=80&w=800",
    category: "History",
    language: "English"
  }
];

export default function Stories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<CulturalStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const snap = await getDocs(collection(db, 'cultural_stories'));
        if (snap.empty) {
          for (const story of SEED_STORIES) {
            await addDoc(collection(db, 'cultural_stories'), {
              ...story,
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (err) {
        console.error('Seeding Error:', err);
      }
    };
    checkAndSeed();

    const q = query(collection(db, 'cultural_stories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CulturalStory)));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredStories = stories.filter(s => {
    const title = s.title || '';
    const shortDescription = s.shortDescription || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col pb-10 max-w-md mx-auto w-full relative shadow-2xl"
    >
      {/* Header */}
      <div className="bg-white border-b border-orange-100 flex items-center justify-between px-6 py-5 sticky top-0 z-50">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-[#002D72]">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-4 font-serif text-xl font-black text-[#002D72] uppercase tracking-tight">Cultural Stories</h1>
        </div>
        <button className="p-2 text-gray-400">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Search */}
      <div className="p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search folklores & legends..."
            className="w-full bg-white border border-orange-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-[#002D72] focus:outline-none focus:ring-2 focus:ring-[#F27D26]/20 shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stories List */}
      <div className="flex-1 px-6 flex flex-col gap-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
            <p className="text-[#002D72] font-bold opacity-40 uppercase tracking-widest text-[10px]">Unfolding Legends...</p>
          </div>
        ) : (
          filteredStories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/story/${story.id}`)}
              className="bg-white rounded-3xl p-4 shadow-sm border border-orange-50 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer overflow-hidden group"
            >
              <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-inner bg-gray-100 flex items-center justify-center">
                {story.imageUrl ? (
                  <img 
                    src={story.imageUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544376430-19f86053f3e1?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                ) : (
                  <BookOpen className="w-8 h-8 text-gray-300" />
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#F27D26] mb-1 inline-block">
                    {story.category}
                  </span>
                  <h3 className="font-serif text-[17px] font-black text-[#002D72] leading-tight line-clamp-2 mb-2">
                    {story.title}
                  </h3>
                  <p className="text-[11px] font-medium text-[#002D72]/50 line-clamp-2 leading-relaxed">
                    {story.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-black text-[#002D72] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Heart className="w-4 h-4" />
                    <Share2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {filteredStories.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-30">
            <BookOpen className="w-16 h-16" />
            <p className="font-bold">No stories found. Try a different search.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
