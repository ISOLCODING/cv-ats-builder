import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import useCVStore from '../../store/useCVStore';

/**
 * KeywordHeatmap Component
 * A premium, sticky sidebar widget that tracks ATS keywords in real-time.
 */
export default function KeywordHeatmap() {
  const { atsResult, jobDescription } = useCVStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!jobDescription || jobDescription.trim().length < 20) return null;

  const { matchedKeywords = [], missingKeywords = [], score = 0 } = atsResult;
  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  
  // If no analysis has been run yet
  const hasAnalysis = score > 0;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: isCollapsed ? 260 : 0, opacity: 1 }}
      className="fixed right-6 top-32 z-40 hidden xl:flex flex-col gap-2 w-72"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-10 top-4 p-2 bg-white border border-slate-200 shadow-xl rounded-full text-slate-400 hover:text-blue-600 transition-colors z-50 pointer-events-auto"
      >
        {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <div className={`bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2rem] p-6 transition-all duration-500 overflow-hidden ${isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
              <Flame size={16} />
            </div>
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest">Keyword Heatmap</h3>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-blue-600 tabular-nums">{score}</span>
            <span className="text-[10px] font-bold text-slate-400">/100</span>
          </div>
        </div>

        {!hasAnalysis ? (
          <div className="py-8 text-center space-y-3">
             <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
               <Target size={20} />
             </div>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider px-4">
               Silakan jalankan "Analisis ATS" untuk melihat heatmap keyword Anda.
             </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Heatmap Grid */}
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</span>
                 <span className="text-[10px] font-bold text-blue-600">{matchedKeywords.length} / {totalKeywords}</span>
               </div>
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(matchedKeywords.length / totalKeywords) * 100}%` }}
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                  />
               </div>
            </div>

            {/* Keyword Groups */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {matchedKeywords.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">
                    <CheckCircle2 size={12} /> Detected
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedKeywords.map((kw, i) => (
                      <motion.span 
                        key={kw}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-100/50"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {missingKeywords.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">
                    <AlertCircle size={12} /> Missing
                  </p>
                  <div className="flex flex-wrap gap-1.5 opacity-70">
                    {missingKeywords.map((kw, i) => (
                      <motion.span 
                        key={kw}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-medium border border-slate-200"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[9px] text-slate-400 leading-tight italic">
              *Masukkan keyword yang kurang ke dalam Pengalaman Kerja atau Skill untuk meningkatkan skor.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
