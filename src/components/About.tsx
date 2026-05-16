import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { ChevronLeft, Info, Heart, Code, Globe, ShieldCheck } from "lucide-react";
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative shadow-2xl"
    >
      {/* Header */}
      <div className="bg-white border-b border-orange-100 flex items-center px-6 py-5 sticky top-0 z-50 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#002D72] active:scale-90 transition-transform">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-serif text-xl font-black text-[#002D72] uppercase tracking-tight">{t('aboutApp')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* App Branding */}
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl shadow-orange-100/50 mx-auto flex items-center justify-center mb-6 border border-orange-50">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3655/3655594.png')} />
          </div>
          <h2 className="font-serif text-2xl font-black text-[#002D72]">{t('appName')}</h2>
          <p className="text-[10px] font-black text-[#F27D26] uppercase tracking-[0.3em] mt-2">Namma Pride • Namma Festival</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-50 flex items-center gap-5">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-widest">{t('developer')}</p>
              <p className="font-black text-[#002D72]">Made By Somesh</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-50 flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#002D72]/40 uppercase tracking-widest">{t('version')}</p>
              <p className="font-black text-[#002D72]">2.0.4 Premium</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-50 space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                <Globe className="w-6 h-6" />
              </div>
              <p className="font-black text-[#002D72] text-[15px]">Official Festival Guide</p>
            </div>
            <p className="text-xs font-medium text-[#002D72]/60 leading-relaxed px-1">
              Jatre – Namma Pride is designed to provide devotees and visitors with real-time updates, safety alerts, and cultural stories of our heritage festival.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-orange-50 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="font-black text-[#002D72] text-[15px]">Privacy Policy</p>
            </div>
            <ChevronLeft className="w-5 h-5 text-[#002D72]/20 rotate-180" />
          </div>
        </div>

        {/* Footer credits */}
        <div className="text-center py-10 opacity-30">
          <p className="text-[10px] font-black text-[#002D72] uppercase tracking-[0.2em]">Designed with ❤️ in Rural India</p>
          <p className="text-[8px] font-bold text-[#002D72] mt-2 italic">© 2026 Festival Committee. All Rights Reserved.</p>
        </div>
      </div>
    </motion.div>
  );
}
