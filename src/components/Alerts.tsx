import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react";
import { ChevronLeft, Bell } from "lucide-react";

export default function Alerts() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FDF5E6] flex flex-col">
      <div className="bg-[#F27D26] text-white p-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)}><ChevronLeft /></button>
        <h1 className="text-xl font-black font-serif uppercase tracking-tight">Notification Alerts</h1>
      </div>
      <div className="p-6 flex flex-col items-center justify-center flex-1 text-[#002D72] opacity-40">
        <Bell className="w-16 h-16 mb-4" />
        <p className="font-bold">No new notifications.</p>
      </div>
    </motion.div>
  );
}
