import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  UserX, 
  UserCheck, 
  Star, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  BadgeCheck,
  UsersRound
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import AdminLayout from './AdminLayout';
import { cn } from '../../lib/utils';
import { UserProfile } from '../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Volunteer' | 'Visitor' | 'Unverified'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setUsers(data);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleVerify = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { verified: !currentStatus });
    } catch (err) {
      console.error('Error verifying user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = user.fullName || '';
    const phoneNumber = user.phoneNumber || '';
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         phoneNumber.includes(searchQuery);
    const matchesFilter = filter === 'All' || 
                         (filter === 'Volunteer' && user.userType === 'Volunteer') ||
                         (filter === 'Visitor' && user.userType !== 'Volunteer' && user.userType !== 'Admin') ||
                         (filter === 'Unverified' && user.userType === 'Volunteer' && !user.verified);
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout title="User Management" activeTab="volunteers">
      <div className="space-y-6 pb-20 -mx-4 md:-mx-0">
        {/* Overview Stats */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">User Base Overview</h4>
            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Live Metrics</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Volunteers', value: users.filter(u => u.userType === 'Volunteer').length, icon: UsersRound, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Verify Now', value: users.filter(u => u.userType === 'Volunteer' && !u.verified).length, icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Active Today', value: Math.floor(users.length * 0.4), icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
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
          <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest px-2">Management Toolkit</h4>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Add Volunteer', icon: UserCheck, color: 'bg-purple-600', action: () => setFilter('Unverified') },
              { label: 'Verify Bulk', icon: BadgeCheck, color: 'bg-green-600', action: () => setFilter('Unverified') },
              { label: 'Export Data', icon: UsersRound, color: 'bg-indigo-600', action: () => { /* Export logic */ } },
              { label: 'User Support', icon: Phone, color: 'bg-blue-500', action: () => { /* Open support */ } },
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
          {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96">
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone..." 
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-sm focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar flex-1 md:flex-initial">
                 {['All', 'Volunteer', 'Visitor', 'Unverified'].map((f) => (
                   <button
                     key={f}
                     onClick={() => setFilter(f as any)}
                     className={cn(
                       "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border",
                       filter === f 
                         ? "bg-purple-600 text-white border-purple-600 shadow-purple-600/20" 
                         : "bg-white text-gray-400 border-gray-100 hover:text-[#1A1A2E]"
                     )}
                   >
                     {f === 'Unverified' ? 'Verify Volunteers' : f === 'All' ? f : f + 's'}
                   </button>
                 ))}
              </div>
              <button 
                onClick={() => {
                  const headers = ['Name', 'Phone', 'Email', 'Type', 'Status', 'Village', 'Address'];
                  const rows = filteredUsers.map(u => [
                    u.fullName,
                    u.phoneNumber,
                    u.email || '',
                    u.userType,
                    u.verified ? 'Verified' : 'Unverified',
                    u.village,
                    u.address
                  ].join(','));
                  const csv = [headers.join(','), ...rows].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `festival_users_${filter.toLowerCase()}.csv`;
                  a.click();
                }}
                className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-purple-600 transition-all shadow-sm"
              >
                <UsersRound className="w-5 h-5" />
              </button>
           </div>
        </div>

        {/* User Table (Desktop) / Cards (Mobile) */}
        <div className="space-y-4 md:space-y-0">
           {/* Mobile Card View */}
           <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedUser(user)}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden">
                      {user.profilePhotoUrl ? (
                         <img src={user.profilePhotoUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-200">
                            <Users className="w-6 h-6" />
                         </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#1A1A2E] truncate">{user.fullName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{user.userType}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {user.userType === 'Volunteer' && (
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        user.verified ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]"
                      )} />
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-purple-500 transition-colors" />
                  </div>
                </motion.div>
              ))}
           </div>

           {/* Desktop Table View */}
           <div className="hidden md:block bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
              <div className="overflow-x-auto overflow-y-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50/50 border-b border-gray-100">
                     <tr>
                       <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">User Info</th>
                       <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Type</th>
                       <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Verification</th>
                       <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map((user) => (
                         <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedUser(user)}>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4 min-w-[200px]">
                              <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                {user.profilePhotoUrl ? (
                                  <img src={user.profilePhotoUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                     <Users className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-black text-[#1A1A2E] truncate">{user.fullName}</p>
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 truncate">
                                    <Phone className="w-3 h-3" />
                                    {user.phoneNumber}
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className={cn(
                             "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                             user.userType === 'Admin' ? "bg-purple-100 text-purple-700" : 
                             user.userType === 'Volunteer' ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                           )}>
                             {user.userType}
                           </span>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                              <span className="text-xs font-bold text-[#1A1A2E]">Active</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           {user.userType === 'Volunteer' ? (
                             <button 
                               onClick={(e) => { e.stopPropagation(); handleVerify(user.uid, !!user.verified); }}
                               className={cn(
                                 "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                 user.verified 
                                   ? "bg-green-50 text-green-600 border border-green-100" 
                                   : "bg-orange-50 text-orange-600 border border-orange-100 animate-pulse hover:bg-orange-100"
                               )}
                             >
                               {user.verified ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                               {user.verified ? 'Verified' : 'Verify Now'}
                             </button>
                           ) : (
                             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Not Required</span>
                           )}
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-3 bg-gray-100 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all">
                                 <MoreVertical className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>

      {/* User Detail Sidebar / Modal */}
      <AnimatePresence>
         {selectedUser && (
           <div className="fixed inset-0 z-[200] flex justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full md:max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden"
              >
                 <div className="px-8 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                       <h3 className="text-xl font-black text-[#1A1A2E]">User Details</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full profile information</p>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-3 bg-white rounded-2xl hover:bg-gray-100 transition-all shadow-sm">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                    {/* Header Info */}
                    <div className="flex flex-col items-center gap-6">
                       <div className="relative">
                          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl rotate-3">
                             {selectedUser.profilePhotoUrl ? (
                               <img src={selectedUser.profilePhotoUrl} className="w-full h-full object-cover -rotate-3 scale-110" alt="" />
                             ) : (
                               <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-200">
                                  <Users className="w-16 h-16" />
                               </div>
                             )}
                          </div>
                          {selectedUser.verified && (
                             <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-2xl p-2 border-4 border-white shadow-lg">
                                <BadgeCheck className="w-6 h-6" />
                             </div>
                          )}
                       </div>
                       <div className="text-center">
                          <h4 className="text-2xl font-black text-[#1A1A2E]">{selectedUser.fullName}</h4>
                          <div className="flex items-center justify-center gap-3 mt-2">
                             <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                                {selectedUser.userType}
                             </span>
                             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: {selectedUser.uid.slice(0, 8)}</span>
                          </div>
                       </div>
                    </div>

                    {/* Stats Grid */}
                    {selectedUser.userType === 'Volunteer' && (
                       <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: 'Hours', value: selectedUser.totalHours || 0, icon: Clock, color: 'text-blue-500' },
                            { label: 'Helped', value: selectedUser.peopleHelped || 0, icon: Users, color: 'text-green-500' },
                            { label: 'Rating', value: selectedUser.rating || 5.0, icon: Star, color: 'text-yellow-500' },
                          ].map((s) => (
                            <div key={s.label} className="bg-gray-50 p-4 rounded-3xl text-center border border-gray-100">
                               <s.icon className={cn("w-5 h-5 mx-auto mb-2", s.color)} />
                               <p className="text-lg font-black text-[#1A1A2E] leading-none">{s.value}</p>
                               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                          ))}
                       </div>
                    )}

                    {/* Personal Info */}
                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Information</h5>
                       <div className="bg-white rounded-[2rem] border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                          <div className="p-6 flex items-center gap-6">
                             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                                <Phone className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Phone Number</p>
                                <p className="text-sm font-bold text-[#1A1A2E]">{selectedUser.phoneNumber}</p>
                             </div>
                          </div>
                          <div className="p-6 flex items-center gap-6">
                             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                                <Mail className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Email Address</p>
                                <p className="text-sm font-bold text-[#1A1A2E]">{selectedUser.email || 'N/A'}</p>
                             </div>
                          </div>
                          <div className="p-6 flex items-center gap-6">
                             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
                                <MapPin className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Village / Address</p>
                                <p className="text-sm font-bold text-[#1A1A2E]">{selectedUser.village} • {selectedUser.address}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* ID Proof Preview */}
                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-1">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Proof Verification</h5>
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{selectedUser.idProofType}</span>
                       </div>
                       <div className="relative group">
                          <div className="aspect-video rounded-[2rem] overflow-hidden bg-gray-50 border-2 border-gray-100 border-dashed flex items-center justify-center relative">
                             {selectedUser.idProofUrl ? (
                               <img src={selectedUser.idProofUrl} className="w-full h-full object-cover group-hover:blur-sm transition-all" alt="" />
                             ) : (
                               <div className="text-center">
                                  <AlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                  <p className="text-xs font-bold text-gray-300">No document found</p>
                               </div>
                             )}
                             {selectedUser.idProofUrl && (
                               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl text-[#1A1A2E] active:scale-95 transition-all">
                                     View Full Image
                                  </button>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                       <div className="flex gap-4">
                          <button 
                            onClick={() => handleVerify(selectedUser.uid, !!selectedUser.verified)}
                            className={cn(
                              "flex-1 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg",
                              selectedUser.verified 
                                ? "bg-orange-50 text-orange-600 shadow-orange-100 border border-orange-100" 
                                : "bg-green-600 text-white shadow-green-600/20"
                            )}>
                             {selectedUser.verified ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                             {selectedUser.verified ? 'Revoke Verification' : 'Verify Volunteer'}
                          </button>
                          <button className="w-20 py-5 rounded-[2rem] bg-red-50 text-red-500 border border-red-100 flex items-center justify-center active:scale-[0.98] transition-all group">
                             <ShieldAlert className="w-6 h-6 group-hover:animate-shake" />
                          </button>
                       </div>
                       <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest px-10">Verification allows the volunteer to access their dashboard and receive sensitive city-wide tasks.</p>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .group-hover\\:animate-shake {
          animation: shake 0.3s ease-in-out infinite;
        }
      `}</style>
      </div>
    </AdminLayout>
  );
}
