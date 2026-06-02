import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, X, Check, RefreshCw } from 'lucide-react';
import { useGroq } from '../../hooks/useGroq';
import useCVStore from '../../store/useCVStore';

/**
 * MagicWriter Component
 * A premium AI writing assistant utility for CV sections.
 */
export default function MagicWriter({ type, content, onApply, className = "" }) {
  const [isImproving, setIsImproving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [improvedContent, setImprovedContent] = useState('');
  const { improveContentAI } = useGroq();
  const { cvData, showToast } = useCVStore();

  const handleImprove = async (mode = 'standard') => {
    if (!content || content.trim().length < 10) {
      return showToast('info', 'Tuliskan setidaknya beberapa kalimat agar AI bisa bekerja lebih maksimal.');
    }

    setIsImproving(true);
    try {
      const result = await improveContentAI({ type, content, cvData, mode });
      setImprovedContent(result);
      setShowPreview(true);
    } catch (error) {
      showToast('error', 'Gagal memanggil sihir AI: ' + error.message);
    } finally {
      setIsImproving(false);
    }
  };

  const handleApply = () => {
    onApply(improvedContent);
    setShowPreview(false);
    showToast('success', 'Sihir berhasil diterapkan!');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <div className="flex items-center gap-1">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleImprove('standard')}
          disabled={isImproving}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider disabled:opacity-50 transition-all bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
          title="Polish & Professionalism"
        >
          <Sparkles className="w-3 h-3" />
          <span>Polish</span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleImprove('xyz')}
          disabled={isImproving}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white shadow-lg text-[9.5px] font-black uppercase tracking-wider disabled:opacity-50 group overflow-hidden relative transition-all bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-500/20"
          title="XYZ Formula"
        >
          <motion.div
             animate={isImproving ? { rotate: 360 } : {}}
             transition={isImproving ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          >
            {isImproving ? <RefreshCw className="w-3.5 h-3.5" /> : <Wand2 className="w-3.5 h-3.5" />}
          </motion.div>
          <span>{isImproving ? 'Conjuring...' : 'XYZ Impact'}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
        </motion.button>
      </div>

      {/* Preview Modal (Glassmorphism) */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
              onClick={() => setShowPreview(false)}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white/10 border border-white/20 rounded-[3rem] p-10 shadow-2xl backdrop-blur-2xl overflow-hidden"
            >
              {/* Royal Accents */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight uppercase">AI Magic Evolution</h3>
                      <p className="text-amber-200/60 text-[10px] font-bold uppercase tracking-widest">Royal Writing Protocol</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPreview(false)}
                    className="p-3 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Before */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Original Draft</span>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 text-white/60 text-sm leading-relaxed min-h-[200px] max-h-[400px] overflow-y-auto italic custom-scrollbar">
                      "{content}"
                    </div>
                  </div>

                  {/* After */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                       Evolved Version <Sparkles className="w-3 h-3" />
                    </span>
                    <div 
                      className="p-6 rounded-3xl bg-white/10 border border-amber-400/30 text-white text-sm leading-relaxed min-h-[200px] max-h-[400px] overflow-y-auto shadow-inner custom-scrollbar"
                      dangerouslySetInnerHTML={{ __html: improvedContent }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleApply}
                    className="flex-[2] py-4 rounded-2xl bg-white text-blue-900 font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-amber-400 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Check className="w-4 h-4" /> Apply Royal Selection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
