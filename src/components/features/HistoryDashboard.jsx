import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Search, Building2, 
  RefreshCw, FileText, Calendar, 
  Clock, ArrowUpRight, Inbox,
  ChevronRight, Sparkles
} from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import { useGAS } from '../../hooks/useGAS';

// ── Variants untuk Framer Motion ───────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function HistoryDashboard() {
  const { cvData, history, setHistory, showToast } = useCVStore();
  const { callGAS, isGASMode } = useGAS();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const email = cvData.personalInfo.email;
      const res = await callGAS('listHistory', { email });
      if (res.success) {
        const sortedData = [...res.data].reverse();
        setHistory(sortedData);
      }
    } catch (e) {
      showToast('error', 'Gagal Sinkronisasi Sheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [cvData.personalInfo.email]);

  const filteredHistory = history.filter(item => 
    item.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-24 px-4">
      
      {/* ── Dynamic Header ───────────────────────────────────── */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-500/5">
          <div className="space-y-1">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-2"
            >
              <Sparkles className="w-3 h-3" /> Career Timeline
            </motion.div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              Application <span className="text-blue-600">Journey</span>
            </h2>
            <p className="text-sm font-medium text-slate-400">Jejak profesionalisme Anda tersimpan dengan aman.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                className="w-full md:w-72 pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold placeholder:text-slate-300 outline-none"
                placeholder="Search company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <motion.button 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={fetchHistory} 
              disabled={loading}
              className="p-4 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
               <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Main Activity Feed ───────────────────────────────── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => {
              const ts = String(item.timestamp || '');
              const [date, time] = ts.includes(' ') ? ts.split(' ') : [ts, '-'];
              
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ y: -4, scale: 1.005 }}
                  className="group relative bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Icon Section */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.status?.toUpperCase() === 'TERKIRIM' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">
                          {item.company || 'Unknown Destination'}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.status?.toUpperCase() === 'TERKIRIM' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-blue-50 text-blue-600'
                        }`}>
                          {item.status || 'Processed'}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                         <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                            <ArrowUpRight className="w-4 h-4 text-blue-500" />
                            {item.position || 'Professional Role'}
                         </div>
                         <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            {date || 'No Date'}
                         </div>
                         <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            {time || 'No Time'}
                         </div>
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="flex items-center gap-3">
                      {item.fileUrl && item.fileUrl.startsWith('http') ? (
                        <motion.a 
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-3 pl-6 pr-4 py-4 rounded-3xl bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 group/btn shadow-sm"
                        >
                          <span className="text-xs font-black uppercase tracking-widest">Open Documents</span>
                          <div className="w-8 h-8 rounded-2xl bg-white text-slate-900 flex items-center justify-center group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                        </motion.a>
                      ) : (
                        <div className="px-6 py-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-slate-400">
                           <p className="text-[10px] font-black uppercase tracking-widest text-center">
                              {item.fileUrl || 'Archived'}
                           </p>
                        </div>
                      )}
                      <div className="hidden md:flex p-2 text-slate-200 group-hover:text-blue-500 transition-colors">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200"
            >
              <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                 <Inbox className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Empty Journey</h3>
              <p className="text-slate-400 font-bold">Ayo buat langkah besar pertama Anda hari ini!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
