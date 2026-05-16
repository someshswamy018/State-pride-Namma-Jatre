import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Search, 
  Clock, 
  BarChart3, 
  PieChart as PieIcon, 
  LineChart as LineIcon,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ChevronRight,
  Settings
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import AdminLayout from './AdminLayout';
import { cn } from '../../lib/utils';

const visitorData = [
  { time: '08:00', visitors: 1200, lastWeek: 800 },
  { time: '10:00', visitors: 2800, lastWeek: 1500 },
  { time: '12:00', visitors: 5600, lastWeek: 3200 },
  { time: '14:00', visitors: 4200, lastWeek: 4500 },
  { time: '16:00', visitors: 8900, lastWeek: 5000 },
  { time: '18:00', visitors: 12500, lastWeek: 8500 },
  { time: '20:00', visitors: 15000, lastWeek: 11000 },
  { time: '22:00', visitors: 9800, lastWeek: 7000 },
];

const categoryDistribution = [
  { name: 'Cultural', value: 45, color: '#8b5cf6' },
  { name: 'Religious', value: 30, color: '#f59e0b' },
  { name: 'Food', value: 15, color: '#10b981' },
  { name: 'Parking', value: 10, color: '#3b82f6' },
];

const emergencyTrend = [
  { day: 'Mon', count: 2 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 12 },
  { day: 'Thu', count: 8 },
  { day: 'Fri', count: 25 },
  { day: 'Sat', count: 45 },
  { day: 'Sun', count: 30 },
];

const volunteerHours = [
  { name: 'Active', hours: 450, color: '#8b5cf6' },
  { name: 'On Break', hours: 120, color: '#e5e7eb' },
  { name: 'Training', hours: 80, color: '#f59e0b' },
];

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('Today');

  const handleDownload = () => {
    // Generate CSV content for analytics export
    const headers = ['Metric', 'Category/Time', 'Value', 'Reference'];
    
    // 1. Visitor Data
    const visitorRows = visitorData.map(d => `Visitor Traffic,${d.time},${d.visitors},${d.lastWeek}`);
    
    // 2. Categories
    const categoryRows = categoryDistribution.map(c => `Zone Distribution,${c.name},${c.value}%,-`);
    
    // 3. Emergency Trend
    const emergencyRows = emergencyTrend.map(e => `Emergency Trend,${e.day},${e.count},-`);
    
    // 4. Volunteers
    const volunteerRows = volunteerHours.map(v => `Volunteer Activity,${v.name},${v.hours}h,-`);

    const csvContent = [
      headers.join(','),
      ...visitorRows,
      ...categoryRows,
      ...emergencyRows,
      ...volunteerRows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `festival_analytics_${period.toLowerCase().replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived data based on period
  const getFilteredVisitorData = () => {
    if (period === 'Today') return visitorData;
    if (period === 'This Week') {
       return [
          { time: 'Mon', visitors: 45000, lastWeek: 42000 },
          { time: 'Tue', visitors: 52000, lastWeek: 48000 },
          { time: 'Wed', visitors: 48000, lastWeek: 50000 },
          { time: 'Thu', visitors: 61000, lastWeek: 55000 },
          { time: 'Fri', visitors: 85000, lastWeek: 72000 },
          { time: 'Sat', visitors: 110000, lastWeek: 95000 },
          { time: 'Sun', visitors: 95000, lastWeek: 88000 },
       ];
    }
    return [
       { time: 'Week 1', visitors: 250000, lastWeek: 210000 },
       { time: 'Week 2', visitors: 310000, lastWeek: 280000 },
       { time: 'Week 3', visitors: 450000, lastWeek: 390000 },
       { time: 'Week 4', visitors: 580000, lastWeek: 510000 },
    ];
  };

  const filteredVisitorData = getFilteredVisitorData();

  return (
    <AdminLayout title="System Analytics" activeTab="analytics">
      <div className="space-y-6 pb-20 -mx-4 md:-mx-0">
        {/* Overview Stats */}
        <div className="px-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest">Key Performance</h4>
            <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest">Live Feed</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Avg Visit', value: '2.4h', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Uptime', value: '99.9%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Alerts', value: '12', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Peak Reach', value: '150k', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
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
          <h4 className="text-sm font-black text-[#1A1A2E] uppercase tracking-widest px-2">Analytics Tools</h4>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Report PDF', icon: Download, color: 'bg-purple-600', action: handleDownload },
              { label: 'Compare', icon: BarChart3, color: 'bg-blue-600', action: () => {} },
              { label: 'Time Filter', icon: Clock, color: 'bg-green-500', action: () => {} },
              { label: 'Settings', icon: Settings, color: 'bg-gray-700', action: () => navigate('/admin/settings') },
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

        <div className="px-4 space-y-10 mt-4">
          {/* Filter Header */}
            <div>
               <h3 className="text-2xl font-black text-[#1A1A2E]">Advanced Analytics</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Interpreting festival data patterns • {period}</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-white border border-gray-100 rounded-2xl p-1.5 flex gap-1 shadow-sm overflow-x-auto no-scrollbar max-w-[280px] xs:max-w-none">
                  {['Today', 'This Week', 'Full Festival'].map((p) => (
                    <button 
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        "px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        p === period ? "bg-[#1A1A2E] text-white shadow-lg scale-105" : "text-gray-400 hover:text-[#1A1A2E] hover:bg-gray-50"
                      )}
                    >
                      {p}
                    </button>
                  ))}
               </div>
               <button 
                 onClick={handleDownload}
                 className="p-4 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-600/20 active:scale-95 transition-all hover:bg-purple-700"
               >
                  <Download className="w-5 h-5" />
               </button>
            </div>
         </div>

         {/* Multi-Chart Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 1. Daily Visitors Area Chart (Large) */}
            <motion.div 
               key={period}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="lg:col-span-8 bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-gray-100 shadow-sm"
            >
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div>
                        <h4 className="font-black text-[#1A1A2E] text-sm md:text-base">Live Visitor Traffic</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time occupancy tracking</p>
                     </div>
                  </div>
                  <div className="text-left md:text-right">
                     <p className="text-xl md:text-2xl font-black text-[#1A1A2E] leading-none mb-1">
                        {period === 'Today' ? '15,402' : period === 'This Week' ? '541,000' : '1.58M'}
                     </p>
                     <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1 md:justify-end">
                        <TrendingUp className="w-3 h-3" />
                        +24.5% vs {period === 'Today' ? 'Yesterday' : 'Last Period'}
                     </p>
                  </div>
               </div>
               <div className="h-[250px] md:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={filteredVisitorData}>
                        <defs>
                           <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                           </linearGradient>
                           <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#e5e7eb" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#e5e7eb" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                        <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVis)" />
                        <Area type="monotone" dataKey="lastWeek" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorLast)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </motion.div>

            {/* 2. Category Distribution (Pie Chart) */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="lg:col-span-4 bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-gray-100 shadow-sm flex flex-col"
            >
               <h4 className="font-black text-[#1A1A2E] mb-2 text-center text-sm md:text-base">Crowd Distribution</h4>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 md:mb-10 text-center">Engagement by zone type</p>
               
               <div className="h-[200px] md:h-[250px] w-full mb-6 md:mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={categoryDistribution}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={100}
                           paddingAngle={8}
                           dataKey="value"
                        >
                           {categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>

               <div className="space-y-4">
                  {categoryDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-bold text-gray-600">{item.name}</span>
                       </div>
                       <span className="text-xs font-black text-[#1A1A2E]">{item.value}%</span>
                    </div>
                  ))}
               </div>
            </motion.div>

            {/* 3. Emergency Alerts Trend (Line Chart) */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="lg:col-span-6 bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-gray-100 shadow-sm"
            >
               <div className="flex items-center gap-4 mb-8 md:mb-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                     <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-[#1A1A2E] text-sm md:text-base">Emergency Alerts Trend</h4>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident frequency over time</p>
                  </div>
               </div>
               <div className="h-[200px] md:h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={emergencyTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                        <Tooltip />
                        <Line type="stepAfter" dataKey="count" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, fill: '#ef4444', strokeWidth: 4, stroke: '#fff' }} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </motion.div>

             {/* 4. Volunteer Activity Hours (Stacked Bar) */}
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
               className="lg:col-span-6 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm"
            >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                     <Clock className="w-6 h-6" />
                  </div>
                  <div>
                     <h4 className="font-black text-[#1A1A2E]">Volunteer Activity</h4>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total contribution hours</p>
                  </div>
               </div>
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={volunteerHours} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800, fill: '#1A1A2E' }} width={80} />
                        <Tooltip />
                        <Bar dataKey="hours" radius={[0, 20, 20, 0]} barSize={40}>
                           {volunteerHours.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-4 flex items-center justify-center gap-6">
                  {volunteerHours.map((h) => (
                    <div key={h.name} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h.name}: {h.hours}h</span>
                    </div>
                  ))}
               </div>
            </motion.div>
         </div>

         {/* Summary Row */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'System Efficiency', value: '98.2%', trend: '+0.5%', desc: 'Response rate up' },
              { label: 'Lost Recovery Rate', value: '74.5%', trend: '+8.2%', desc: '142 items returned' },
              { label: 'Volunteer Rating', value: '4.9/5', trend: 'Stable', desc: 'Positive feedback' }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-600/20 relative overflow-hidden group"
              >
                 <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-125 transition-transform">
                    <TrendingUp className="w-32 h-32" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{stat.label}</p>
                 <div className="flex items-baseline gap-4 mb-4">
                    <h5 className="text-4xl font-black">{stat.value}</h5>
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg">{stat.trend}</span>
                 </div>
                 <p className="text-xs font-bold opacity-80">{stat.desc}</p>
              </motion.div>
            ))}
         </div>
      </div>
    </AdminLayout>
  );
}
