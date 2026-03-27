import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Target, Activity, Zap, Cpu } from 'lucide-react';
import useCVStore from '../../store/useCVStore';

/**
 * KeywordHeatmap Component
 * A premium, sticky sidebar widget that tracks ATS keywords in real-time.
 * Redesigned for the "Clean & Elegant" aesthetic.
 */
export default function KeywordHeatmap() {
  const { atsResult, jobDescription } = useCVStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!jobDescription || jobDescription.trim().length < 20) return null;

  const { matchedKeywords = [], missingKeywords = [], score = 0 } = atsResult;
  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  
  const hasAnalysis = score > 0;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: isCollapsed ? 280 : 0, opacity: 1 }}
      className="fixed right-8 top-40 z-40 hidden xl:flex flex-col gap-4 w-80"
    >
      {/* Toggle Button - Redesigned */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-12 top-6 w-10 h-10 flex items-center justify-center bg-white border border-slate-100 shadow-premium rounded-full text-slate-400 hover:text-slate-900 transition-all z-50 pointer-events-auto active:scale-90"
      >
        {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <div className={`bg-white/70 backdrop-blur-2xl border border-white/40 shadow-premium rounded-[3rem] p-8 transition-all duration-700 overflow-hidden ${isCollapsed ? 'opacity-0 scale-95 pointer-events-none translate-x-10' : 'opacity-100 scale-100'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-transform duration-500 group-hover:scale-110">
              <Activity size={18} />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-slate-900 text-[10px] uppercase tracking-[0.3em]">Heatmap</h3>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Live Sync</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-display font-light text-slate-900 italic tracking-tighter">{score}</span>
            <span className="text-[10px] font-bold text-slate-300 ml-1">%</span>
          </div>
        </div>

        {!hasAnalysis ? (
          <div className="py-12 text-center space-y-6">
             <div className="w-16 h-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-200 shadow-inner">
               <Cpu size={24} className="animate-pulse" />
             </div>
             <div className="space-y-2">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Neural Link Offline</p>
               <p className="text-[11px] text-slate-400 font-light italic leading-relaxed px-4">
                 Initialize "AI Analysis" to map keyword resonance.
               </p>
             </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mastery Progress */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Semantic Match</span>
                 <span className="text-[11px] font-display font-light text-slate-900 italic">{matchedKeywords.length} / {totalKeywords}</span>
               </div>
               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(matchedKeywords.length / totalKeywords) * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-slate-900 rounded-full shadow-lg shadow-slate-200"
                  />
               </div>
            </div>

            {/* Keyword Groups */}
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {matchedKeywords.length > 0 && (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-[10px] font-bold text-slate-800 uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" /> Detected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedKeywords.map((kw, i) => (
                      <motion.span 
                        key={kw}
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="px-3 py-1.5 bg-slate-50 text-slate-800 rounded-xl text-[10px] font-medium border border-slate-100 hover:border-slate-300 transition-all cursor-default"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {missingKeywords.length > 0 && (
                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Missing
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw, i) => (
                      <motion.span 
                        key={kw}
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="px-3 py-1.5 bg-white text-slate-400 rounded-xl text-[10px] font-light border border-dashed border-slate-100 hover:border-slate-300 transition-all cursor-default"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-400 group cursor-help">
                <Zap size={14} className="group-hover:text-slate-800 transition-colors" />
                <p className="text-[9px] leading-relaxed uppercase tracking-widest font-medium group-hover:text-slate-600 transition-colors">
                  Integrate missing tokens into experience to amplify score.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
