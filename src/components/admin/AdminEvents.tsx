import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2,
  AlertTriangle,
  X,
  Upload,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import AdminLayout from './AdminLayout';
import { cn } from '../../lib/utils';
import { LiveEvent } from '../../types';

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<LiveEvent> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `all-photo/event_${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(uploadResult.ref);
      setCurrentEvent(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'live_schedule'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveEvent));
        setEvents(evs);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const eventData = {
        ...currentEvent,
        createdAt: isEditing ? currentEvent?.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (isEditing && currentEvent?.id) {
        await updateDoc(doc(db, 'live_schedule', currentEvent.id), eventData);
      } else {
        await addDoc(collection(db, 'live_schedule'), eventData);
      }
      setShowModal(false);
      setCurrentEvent(null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving event:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'live_schedule', id));
      } catch (err) {
        console.error('Error deleting event:', err);
      }
    }
  };

  const filteredEvents = events.filter(ev => {
    const title = ev.title || '';
    const locationName = ev.location || '';
    const category = ev.category || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AdminLayout title="Manage Events" activeTab="events">
      <div className="space-y-6 pb-20 -mx-4 md:-mx-0">
        {/* Overview Stats */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Schedule Overview</h4>
            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Festival Flow</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Events', value: events.length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Ongoing', value: events.filter(e => e.status === 'ongoing').length, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Cultural', value: events.filter(e => e.category === 'Cultural').length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Upcoming', value: events.filter(e => e.status === 'upcoming').length, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center text-center gap-3"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1A2E] leading-none mb-1">{stat.value}</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 space-y-4">
          <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest px-2">Quick Actions</h4>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Add Event', icon: Plus, color: 'bg-purple-600', action: () => { setIsEditing(false); setCurrentEvent({ title: '', description: '', location: '', category: 'Cultural', status: 'upcoming', date: '', startTime: '', endTime: '' }); setShowModal(true); } },
              { label: 'Filter Ongoing', icon: TrendingUp, color: 'bg-green-500', action: () => { /* Filter logic already handled by search/filter but could be simplified */ } },
              { label: 'Manage Map', icon: MapPin, color: 'bg-blue-600', action: () => navigate('/admin/lost-found') },
              { label: 'Categories', icon: Filter, color: 'bg-orange-500', action: () => { /* Open filter modal */ } },
            ].map((action, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={action.action}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={cn(
                  "w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
                  action.color
                )}>
                  <action.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <span className="text-[8px] md:text-[9px] font-black text-[#1A1A2E] uppercase tracking-wider text-center leading-tight">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="px-4 space-y-6 mt-4">
          {/* Actions bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search events by title, location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-400 hover:text-[#1A1A2E] transition-colors shadow-sm">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <button 
              onClick={() => { setIsEditing(false); setCurrentEvent({ title: '', description: '', location: '', category: 'Cultural', status: 'upcoming', date: '', startTime: '', endTime: '' }); setShowModal(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((ev, idx) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all group"
              >
                <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                  {ev.imageUrl ? (
                    <img 
                      src={ev.imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt={ev.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514222139-b57675ee0ed0?q=80&w=1000&auto=format&fit=crop';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                       <ImageIcon className="w-12 h-12" />
                       <p className="text-[8px] font-black uppercase tracking-widest">No Event Image</p>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm",
                      ev.status === 'ongoing' ? "bg-green-500" : ev.status === 'upcoming' ? "bg-blue-500" : "bg-gray-500"
                    )}>
                      {ev.status}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => { setIsEditing(true); setCurrentEvent(ev); setShowModal(true); }}
                      className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-gray-700 hover:text-purple-600 hover:bg-white transition-all shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(ev.id)}
                      className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-gray-700 hover:text-red-600 hover:bg-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">{ev.category}</p>
                    <h4 className="text-lg font-black text-[#1A1A2E] leading-tight">{ev.title}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{ev.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{ev.startTime} - {ev.endTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>{ev.location}</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-gray-500 line-clamp-2">
                    {ev.description}
                  </p>

                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Priority</p>
                       <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Heavy Crowd
                       </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-[#1A1A2E]">{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update festival live schedule</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-3 bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Event Title</label>
                  <input 
                    required
                    value={currentEvent?.title || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Grand Rathotsava..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={currentEvent?.description || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Brief description of the event..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Category</label>
                  <select 
                    value={currentEvent?.category || 'Cultural'}
                    onChange={(e) => setCurrentEvent({...currentEvent, category: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Religious">Religious</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Food">Food Festival</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Status</label>
                  <select 
                    value={currentEvent?.status || 'upcoming'}
                    onChange={(e) => setCurrentEvent({...currentEvent, status: e.target.value as any})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Location</label>
                  <input 
                    required
                    value={currentEvent?.location || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Main Temple Square"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Date</label>
                  <input 
                    required
                    type="date"
                    value={currentEvent?.date || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, date: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Start Time</label>
                  <input 
                    required
                    type="time"
                    value={currentEvent?.startTime || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, startTime: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">End Time</label>
                  <input 
                    required
                    type="time"
                    value={currentEvent?.endTime || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, endTime: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Event Image URL</label>
                    <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest">Live Preview</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 flex gap-4">
                      <input 
                        value={currentEvent?.imageUrl || ''}
                        onChange={(e) => setCurrentEvent({...currentEvent, imageUrl: e.target.value})}
                        className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="https://images.unsplash.com/..."
                      />
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="p-4 bg-purple-100 text-purple-600 rounded-2xl hover:bg-purple-600 hover:text-white transition-all shrink-0 flex items-center justify-center min-w-[56px]"
                      >
                        {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="h-24 md:h-full aspect-video md:aspect-auto rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center relative group">
                      {currentEvent?.imageUrl ? (
                        <img 
                          src={currentEvent.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt="Preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514222139-b57675ee0ed0?q=80&w=1000&auto=format&fit=crop';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-300">
                          <ImageIcon className="w-6 h-6" />
                          <p className="text-[8px] font-black uppercase tracking-widest">No Preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>

              <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-black uppercase tracking-widest text-[#1A1A2E] bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={formLoading}
                  className="flex-1 py-4 font-black uppercase tracking-widest text-white bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Save Event</span>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
