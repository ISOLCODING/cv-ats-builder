// src/components/features/ATSChecker.jsx
import React, { useState } from 'react';
import { Target, Search, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, BarChart3, Info, Sparkles, RefreshCw, Lock, Cpu, Zap, Microscope } from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import useAuthStore from '../../store/useAuthStore';
import Button from '../ui/Button';
import { useGroq } from '../../hooks/useGroq';

export default function ATSChecker({ onBack, onNext }) {
  const { 
    cvData, jobDescription, setJobDescription, 
    atsResult, setATSResult, showToast,
    updateSummary, updateSkills, coverLetter 
  } = useCVStore();
  const { user, setShowUpgradeModal } = useAuthStore();
  const { analyzeATSAI, optimizeCVAI } = useGroq();
  
  const isPremium = user?.role === 'Premium' || user?.role === 'Admin';
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      return showToast('error', 'Masukkan Job Description terlebih dahulu');
    }

    setAnalyzing(true);
    try {
      const result = await analyzeATSAI({ cvData, jobDescription, coverLetter });
      setATSResult(result);
      showToast('success', 'Analisis ATS selesai!');
    } catch (error) {
      showToast('error', 'Gagal menganalisis CV: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      const { optimizedSummary, suggestedSkills } = await optimizeCVAI({ cvData, jobDescription });
      
      updateSummary(optimizedSummary);
      const currentTechnical = cvData.skills.technical || [];
      const merged = [...new Set([...currentTechnical, ...suggestedSkills])];
      updateSkills({ ...cvData.skills, technical: merged });

      showToast('success', 'CV dioptimalkan otomatis! Menganalisis ulang...');
      
      const newResult = await analyzeATSAI({ 
        cvData: { ...cvData, summary: optimizedSummary, skills: { ...cvData.skills, technical: merged } }, 
        jobDescription,
        coverLetter
      });
      setATSResult(newResult);
    } catch (error) {
      showToast('error', 'Gagal mengoptimalkan CV: ' + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-10">
      {/* Header Section */}
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
               <Microscope size={28} className="group-hover:scale-110 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Tahap 11</span>
               <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic text-left">
                 Intelegensia <span className="text-slate-400">ATS</span>
               </h2>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-xl leading-relaxed italic px-2">
            Analisis kuantum profil profesional Anda terhadap tolok ukur perekrutan global.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-soft space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  Cetak Biru Target
                  <div className="h-px w-4 bg-slate-100" />
                </label>
                <p className="text-sm text-slate-600 font-light">Tempelkan deskripsi pekerjaan atau persyaratan di bawah ini untuk pencocokan presisi.</p>
              </div>
              
              <Button
                onClick={() => isPremium ? handleAnalyze() : setShowUpgradeModal(true)}
                loading={analyzing}
                className={`h-14 px-10 rounded-[1.25rem] font-medium tracking-wide transition-all shadow-premium active:scale-95 ${
                  isPremium ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                }`}
                leftIcon={isPremium ? <Search className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              >
                {isPremium ? 'Eksekusi Analisis AI' : 'Buka Intelegensia'}
              </Button>
            </div>

            <div className="relative group">
              <textarea
                className="w-full min-h-[250px] p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-sm font-light leading-relaxed text-slate-600 focus:bg-white focus:border-slate-300 transition-all outline-none placeholder:text-slate-300"
                placeholder="Tempelkan Deskripsi Pekerjaan di sini..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-widest shadow-sm">
                <Cpu className="w-3 h-3 text-slate-300" />
                Mesin Neural Siap
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {atsResult.score > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Main Score & Summary Card */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden group hover:border-slate-200 transition-all duration-500">
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
              {/* Score Visual */}
              <div className="p-12 md:p-16 flex flex-col items-center justify-center bg-slate-50/30 lg:w-[400px]">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Decorative background circle */}
                  <div className="absolute inset-0 rounded-full border-[10px] border-white shadow-inner" />
                  
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96" cy="96" r="86"
                      stroke="currentColor" strokeWidth="10"
                      fill="transparent" className="text-slate-100"
                    />
                    <circle
                      cx="96" cy="96" r="86"
                      stroke="currentColor" strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={540}
                      strokeDashoffset={540 - (540 * atsResult.score) / 100}
                      className="text-slate-900 transition-all duration-[1500ms] ease-out-expo"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-display font-light text-slate-900 italic tracking-tighter">{atsResult.score}</span>
                    <span className="text-[9px] uppercase font-bold tracking-[0.4em] text-slate-400 mt-1">Akurasi</span>
                  </div>
                </div>
                
                <div className="mt-10 flex flex-col items-center gap-3">
                   <div className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${
                     atsResult.score >= 80 ? 'bg-slate-900 text-white border-slate-900' : 
                     atsResult.score >= 50 ? 'bg-white text-slate-800 border-slate-200' : 'bg-transparent text-slate-400 border-slate-100'
                   }`}>
                     {atsResult.score >= 80 ? 'Pemimpin Pasar' : atsResult.score >= 50 ? 'Potensi Kandidat' : 'Restrukturisasi Diperlukan'}
                   </div>
                </div>
              </div>
              
              {/* AI Narrative & Optimization */}
              <div className="flex-1 p-12 md:p-16 flex flex-col justify-between space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-display font-light text-slate-800 italic tracking-tight">Ringkasan Eksekutif AI</h3>
                  </div>
                  <p className="text-xl text-slate-600 font-light leading-relaxed italic border-l-2 border-slate-100 pl-8">
                    "{atsResult.experienceRelevance}"
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-10 border-t border-slate-50">
                  <div className="flex gap-10">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.2em]">Format</p>
                      <p className="text-2xl font-display font-light text-slate-800">{atsResult.breakdown?.formatScore || 0}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.2em]">Kata Kunci</p>
                      <p className="text-2xl font-display font-light text-slate-800">{atsResult.breakdown?.keywordMatch || 0}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.2em]">Relevansi</p>
                      <p className="text-2xl font-display font-light text-slate-800">{atsResult.breakdown?.relevance || 0}%</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => isPremium ? handleOptimize() : setShowUpgradeModal(true)}
                    loading={optimizing}
                    className={`h-16 px-10 rounded-2xl font-bold tracking-[0.1em] uppercase transition-all shadow-premium active:scale-95 ${
                      isPremium ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-50 text-slate-300 border border-slate-100'
                    }`}
                    leftIcon={isPremium ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  >
                    {isPremium ? 'Optimasi Kuantum' : 'Khusus Premium'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Keywords - Redesigned to match SkillsForm tags */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-soft">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-display font-light text-slate-800 italic">Analisis Semantik Kata Kunci</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Penyelarasan Linguistik</p>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-10 shadow-soft">
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    Token Terdeteksi
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg text-[9px] border border-slate-100">
                      {atsResult.matchedKeywords?.length}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {atsResult.matchedKeywords?.map(kw => (
                      <span key={kw} className="px-4 py-2 bg-slate-50 text-slate-800 rounded-xl text-xs font-medium border border-slate-100 group hover:border-slate-300 transition-all cursor-default">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-slate-50" />

                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-3">
                    Kesenjangan Koneksi
                    <span className="px-2 py-0.5 bg-white text-slate-300 rounded-lg text-[9px] border border-slate-100">
                      {atsResult.missingKeywords?.length}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {atsResult.missingKeywords?.map(kw => (
                      <span key={kw} className="px-4 py-2 bg-white text-slate-400 rounded-xl text-xs font-light border border-dashed border-slate-200 hover:border-slate-300 transition-all cursor-default">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-soft">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-display font-light text-slate-800 italic">Penyesuaian Strategis</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Protokol Pemurnian</p>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-soft h-full">
                <ul className="space-y-6">
                  {atsResult.specificSuggestions?.map((sug, idx) => (
                    <li key={idx} className="flex gap-6 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold tracking-[0.1em] group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-500 shadow-sm">
                        0{idx + 1}
                      </div>
                      <div className="pt-2">
                        <p className="text-[13px] text-slate-600 font-light leading-relaxed group-hover:text-slate-900 transition-colors duration-500 italic">
                          {sug}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-12 border-t border-slate-100 mt-16 px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="rounded-full px-8 h-14 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Kembali
        </Button>
        
        <button
          onClick={onNext}
          className="group flex items-center gap-8 px-10 py-5 rounded-full bg-slate-900 text-white shadow-premium hover:bg-black transition-all active:scale-[0.98]"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">Inisialisasi Tahap Akhir</span>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
