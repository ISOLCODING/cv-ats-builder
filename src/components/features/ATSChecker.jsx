// src/components/features/ATSChecker.jsx
import React, { useState } from 'react';
import { Target, Search, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, BarChart3, Info } from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import Button from '../ui/Button';
import { analyzeATS, optimizeCV } from '../../services/gemini';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function ATSChecker({ onBack, onNext }) {
  const { 
    cvData, jobDescription, setJobDescription, 
    atsResult, setATSResult, showToast,
    updateSummary, updateSkills, coverLetter 
  } = useCVStore();
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      return showToast('error', 'Masukkan Job Description terlebih dahulu');
    }

    setAnalyzing(true);
    try {
      const result = await analyzeATS({ cvData, jobDescription, coverLetter });
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
      const { optimizedSummary, suggestedSkills } = await optimizeCV({ cvData, jobDescription });
      
      // Update Summary
      updateSummary(optimizedSummary);
      
      // Update Technical Skills (Merge & Unique)
      const currentTechnical = cvData.skills.technical || [];
      const merged = [...new Set([...currentTechnical, ...suggestedSkills])];
      
      updateSkills({
        ...cvData.skills,
        technical: merged
      });

      showToast('success', 'CV dioptimalkan otomatis! Menganalisis ulang...');
      
      // Trigger re-analysis to show new score
      const newResult = await analyzeATS({ 
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Global Analysis</h2>
          <p className="text-sm text-slate-500">Analisis Kesiapan CV & Surat Lamaran</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            Job Description / Kriteria Lowongan
            <span className="text-[10px] font-normal text-slate-400">(Paste di sini)</span>
          </label>
          <textarea
            className="form-input min-h-[200px] text-sm font-mono leading-relaxed bg-slate-50/50"
            placeholder="Paste requirement atau deskripsi pekerjaan dari LinkedIn/Loker di sini..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleAnalyze}
            loading={analyzing}
            variant="primary"
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full md:w-auto px-8"
          >
            Mulai Analisis
          </Button>
        </div>
      </div>

      {atsResult.score > 0 && (
        <div className="space-y-6 animate-scale-in">
          {/* Main Score Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent" className="text-white/20"
                  />
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * atsResult.score) / 100}
                    className="text-white transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">{atsResult.score}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Score</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-5 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">Kesimpulan AI</h3>
                    <p className="text-blue-100 text-sm italic">"{atsResult.experienceRelevance}"</p>
                  </div>
                  
                  {/* Auto-Optimization Button */}
                  <Button
                    onClick={handleOptimize}
                    loading={optimizing}
                    variant="primary"
                    size="sm"
                    className="bg-white text-blue-700 hover:bg-blue-50 border-none shadow-lg whitespace-nowrap"
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Optimasi CV Otomatis
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-blue-200">Keywords</p>
                    <p className="text-lg font-bold">{atsResult.breakdown?.keywordMatch || 0}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-blue-200">Format</p>
                    <p className="text-lg font-bold">{atsResult.breakdown?.formatScore || 0}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-blue-200">Relevansi</p>
                    <p className="text-lg font-bold">{atsResult.breakdown?.relevance || 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keywords */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-800">Keyword Analysis</h4>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase mb-2">Ditemukan ({atsResult.matchedKeywords?.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.matchedKeywords?.map(kw => (
                      <span key={kw} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-[10px] font-medium border border-green-100">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase mb-2">Kurang ({atsResult.missingKeywords?.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.missingKeywords?.map(kw => (
                      <span key={kw} className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md text-[10px] font-medium border border-red-100">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Info className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-800">Saran Perbaikan</h4>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <ul className="space-y-3">
                  {atsResult.specificSuggestions?.map((sug, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      {sug}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <Button
          variant="ghost"
          onClick={onBack}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Kembali
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Lanjut ke Simpan & Kirim
        </Button>
      </div>
    </div>
  );
}
