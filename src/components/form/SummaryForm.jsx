// src/components/form/SummaryForm.jsx
// Step 5 — Professional Summary + ATS Checker (Modern Blue UI + TipTap)

import React, { useEffect, useCallback, useState } from 'react';
import {
  FileText, Target, CheckCircle2, XCircle, AlertCircle,
  Lightbulb, RefreshCw, ChevronLeft, Zap, BarChart3,
  Sparkles, Info, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import MagicWriter from '../ui/MagicWriter';
import useCVStore from '../../store/useCVStore';
import useAuthStore from '../../store/useAuthStore';
import { calculateATSScore, getScoreLabel } from '../../utils/atsScore';
import { optimizeCV } from '../../services/groq';

/**
 * ScoreRing Component
 * Redesigned with premium Slate/Sage aesthetic.
 */
function ScoreRing({ score }) {
  const { label } = getScoreLabel(score);
  const radius = 42;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  const ringColor =
    score >= 80 ? '#1e293b' : // Slate-800
      score >= 60 ? '#475569' : // Slate-600
        score >= 40 ? '#94a3b8' : '#cbd5e1'; // Slate-400 / Slate-300

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-40 h-40 group">
        <div className="absolute inset-2 rounded-full bg-white shadow-premium group-hover:scale-105 transition-transform duration-700" />
        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="5" />
          <motion.circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            strokeDasharray={circ}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-display font-light text-slate-900 tracking-tighter"
          >
            {score}
          </motion.div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.25em] -mt-1 italic">Indeks</span>
        </div>
      </div>
      <div className="px-6 py-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">{label}</span>
      </div>
    </div>
  );
}

// ── Summary templates ──────────────────────────────────────────
const TEMPLATES = [
  {
    emoji: '💻',
    label: 'Spesialis Rekayasa',
    html: '<p>Insinyur perangkat lunak berpengalaman <strong>3+ tahun</strong> dengan fokus pada arsitektur web & mobile yang skalabel. Ahli dalam ekosistem <strong>React, Node.js, dan Cloud</strong>. Terbukti unggul dalam pengiriman Agile dan optimasi sistem.</p>',
  },
  {
    emoji: '📊',
    label: 'Arsitek Wawasan',
    html: '<p>Pakar analisis data strategis dengan kemahiran pada kerangka kerja <strong>SQL, Python, dan BI</strong>. Terampil dalam mentransformasi dataset kompleks menjadi intelijen bisnis yang dapat ditindaklanjuti untuk mendukung pengambilan keputusan organisasional tingkat tinggi.</p>',
  },
  {
    emoji: '🎯',
    label: 'Direktur Proyek',
    html: '<p>Profesional bersertifikasi <strong>PMP</strong> dengan pengalaman 5+ tahun memimpin tim lintas fungsional berisiko tinggi. Mengelola portofolio hingga <strong>$1M+</strong> menggunakan kombinasi Agile/Waterfall untuk pengiriman tepat waktu yang konsisten.</p>',
  },
  {
    emoji: '🎨',
    label: 'Strategis UX',
    html: '<p>Desainer yang berfokus pada manusia dengan hasrat untuk ekosistem digital yang intuitif. Pakar dalam ekosistem <strong>Figma</strong>, riset pengguna, dan pembuatan prototipe strategis dengan fokus pada antarmuka konversi tinggi.</p>',
  },
  {
    emoji: '🌱',
    label: 'Talenta Berkembang',
    html: '<p>Lulusan <strong>Ilmu Komputer</strong> yang tangkas dengan fondasi mendalam pada sistem web modern. Pengalaman magang teknis di startup pertumbuhan tinggi dengan kontribusi aktif pada protokol sumber terbuka. Pembelajar cepat dan sangat adaptif.</p>',
  },
  {
    emoji: '📱',
    label: 'Analis Pasar',
    html: '<p>Pakar pemasaran digital strategis yang terspesialisasi dalam <strong>SEO dan Performance Marketing</strong>. Rekam jejak konsisten dalam pertumbuhan <strong>2.5x ROAS</strong> melalui pengujian A/B berbasis data dan optimasi kampanye algoritmik.</p>',
  },
];

// ── Keyword chip ───────────────────────────────────────────────
function KeywordChip({ word, matched }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all ${
      matched
      ? 'bg-slate-50 text-slate-800 border-slate-100 hover:border-slate-300'
      : 'bg-white text-slate-300 border-dashed border-slate-100 hover:border-slate-200'
    }`}>
      {matched ? <CheckCircle2 className="w-3.5 h-3.5 text-slate-800" /> : <XCircle className="w-3.5 h-3.5 text-slate-200" />}
      {word}
    </span>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function SummaryForm({ onBack, onNext }) {
  const {
    cvData, updateSummary, jobDescription, setJobDescription,
    atsResult, setATSResult, updateSkills, showToast
  } = useCVStore();
  const { user, setShowUpgradeModal } = useAuthStore();

  const isPremium = user?.role === 'Premium' || user?.role === 'Admin';
  const [optimizing, setOptimizing] = useState(false);

  // ATS analysis (debounced)
  const runATS = useCallback(() => {
    if (jobDescription?.trim()) {
      setATSResult(calculateATSScore(jobDescription, cvData));
    }
  }, [jobDescription, cvData, setATSResult]);

  useEffect(() => {
    const t = setTimeout(runATS, 700);
    return () => clearTimeout(t);
  }, [runATS]);

  const handleOptimize = async () => {
    if (!jobDescription.trim()) {
      return showToast('error', 'Masukkan Job Description terlebih dahulu');
    }

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

      showToast('success', 'CV berhasil dioptimalkan dengan AI!');
      runATS(); // Update local ATS score
    } catch (error) {
      showToast('error', 'Gagal optimasi: ' + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  const hasJD  = jobDescription?.trim().length > 30;
  const hasATS = hasJD && atsResult?.totalKeywords > 0;

  return (
    <div className="animate-fade-up space-y-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
              <FileText size={28} className="group-hover:scale-110 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
            </div>
             <div className="space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Tahap 09</span>
               <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic text-left">
                 Ringkasan <span className="text-slate-400">Profesional</span>
               </h2>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-xl leading-relaxed italic px-2">
            Susun narasi strategis yang menyelaraskan arsitektur karier Anda dengan kebutuhan inti dari peran target.
          </p>
        </div>

        {cvData.summary?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-8 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-[0.4em] shadow-sm flex items-center gap-3 shrink-0"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-pulse shadow-lg shadow-slate-200" />
            <span className="text-slate-500">Manuskrip Aktif</span>
          </motion.div>
        )}
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 bg-slate-50/50 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Narasi Utama</label>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Wajib</span>
            </div>
            <MagicWriter
              type="Professional Summary"
              content={cvData.summary}
              onApply={updateSummary}
            />
          </div>
          <div className="rounded-[3rem] overflow-hidden border border-slate-100 bg-white shadow-premium">
            <RichEditor
              label={null}
              required={false}
              value={cvData.summary}
              onChange={updateSummary}
              placeholder="Siapa Anda? Apa kepakaran inti Anda? Nilai strategis apa yang Anda berikan? Fokus pada 3-5 kalimat berorientasi hasil."
              minHeight={250}
              maxLength={1200}
            />
          </div>
          <div className="flex items-center gap-4 mt-8 px-6">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
              <Info size={16} />
             </div>
            <p className="text-[12px] text-slate-400 font-medium italic">
              Rekomendasi: Sintesiskan pencapaian ke dalam pernyataan nilai yang kohesif, bukan sekadar riwayat kronologis.
            </p>
          </div>
        </div>
      </div>

      {/* Template suggestions */}
      <div className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100">
        <div className="flex items-center gap-4 mb-10 ml-2">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-800 shadow-sm">
            <Lightbulb size={18} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Arketipe Industri</p>
            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Cetak Biru Dasar</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((t) => (
            <motion.button
              key={t.label}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => updateSummary(t.html)}
              className="group text-left p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-slate-900 hover:shadow-premium transition-all duration-500"
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-500">
                    {t.emoji}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 size={14} className="text-slate-900" />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 tracking-tight group-hover:italic transition-all">{t.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── ATS Checker ──────────────────────────────────────── */}
      <div className="space-y-16 pt-16 border-t border-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-5">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
                <Target size={28} className="group-hover:scale-110 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
              </div>
               <div className="space-y-1">
                 <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Instrumen Kalibrasi</span>
                 <h3 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic text-left">Sinkronisasi <span className="text-slate-400">ATS</span></h3>
               </div>
            </div>
             <p className="text-sm font-medium text-slate-400 max-w-lg leading-relaxed italic px-2">
              Sinkronisasikan resume Anda dengan pola sistem pelacakan pelamar (ATS) untuk memastikan visibilitas maksimal.
            </p>
          </div>

          {!hasJD && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-8 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm shrink-0"
            >
               <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse shadow-lg" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Menunggu Input Kalibrasi</span>
             </motion.div>
          )}
        </div>

        {/* JD textarea */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-3">
               <label className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.3em]">Deskripsi Pekerjaan Target</label>
               <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Input Sistem</span>
             </div>
             <div className="flex items-center gap-3">
               <Sparkles size={14} className="text-slate-300" />
               <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Mesin Semantik Aktif</span>
             </div>
          </div>
          <div className="relative group/jd">
            <div className="absolute -inset-1 bg-slate-100 rounded-[3.5rem] blur-xl opacity-40 group-focus-within/jd:opacity-100 transition-opacity" />
            <textarea
               value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              placeholder="Tempelkan deskripsi pekerjaan target di sini. AI kami akan menganalisis kebutuhan dan menyinkronkan data CV Anda untuk memaksimalkan probabilitas kecocokan."
              className="relative w-full p-10 rounded-[3.5rem] border border-slate-100 bg-white shadow-premium focus:border-slate-900 focus:bg-white transition-all outline-none font-medium text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-normal leading-relaxed scrollbar-hide"
            />
          </div>
          <div className="flex items-center gap-4 mt-2 ml-6">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
              <Info size={16} />
            </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Analisis Mendalam Direkomendasikan: 250+ kata untuk pemetaan fidelitas tinggi.
            </p>
          </div>
        </div>

        {/* ── Result ─────────────────────────────────────── */}
        <AnimatePresence>
          {hasATS ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-16"
            >
              {/* Score summary */}
              <div className="p-10 sm:p-16 bg-white rounded-[4rem] border border-slate-100 shadow-premium relative overflow-hidden group">
                <div className="absolute -right-20 top-0 w-80 h-80 bg-slate-50 rounded-full blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="relative flex flex-col lg:flex-row items-center gap-16">
                  <div className="relative shrink-0">
                    <ScoreRing score={atsResult.score} />
                  </div>

                  <div className="flex-1 w-full space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                      <div className="space-y-3">
                         <div className="flex items-center gap-4">
                           <div className="w-2 h-2 rounded-full bg-slate-900" />
                           <h4 className="text-3xl font-display font-bold text-slate-900 tracking-tight italic">Matriks Kalibrasi</h4>
                         </div>
                         <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em] ml-6 leading-none">Protokol Verifikasi Kecocokan AI</p>
                       </div>

                      <button
                        onClick={() => isPremium ? handleOptimize() : setShowUpgradeModal(true)}
                        disabled={optimizing}
                        className={`group relative flex items-center gap-4 px-10 py-5 rounded-2xl transition-all duration-500 overflow-hidden ${isPremium
                            ? 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                          }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {isPremium ? <Sparkles size={16} className="text-slate-300" /> : <Lock size={16} />}
                         <span className="text-[11px] font-bold uppercase tracking-widest relative z-10 transition-all group-hover:tracking-[0.2em]">
                           {isPremium ? (optimizing ? 'Menyinkronkan...' : 'Sinkronisasi AI') : 'Buka Sinkronisasi Cerdas'}
                         </span>
                      </button>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-premium">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4">Token Wajib</p>
                        <p className="text-4xl font-display font-light text-slate-900 leading-none tracking-tighter">{atsResult.totalKeywords}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-premium">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4">Token Relevan</p>
                        <p className="text-4xl font-display font-light text-slate-900 leading-none tracking-tighter">{atsResult.matchedKeywords.length}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-premium">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4">Deviasi Struktural</p>
                        <p className="text-4xl font-display font-light text-slate-300 leading-none tracking-tighter italic">{atsResult.missingKeywords.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Detail */}
              <div className="space-y-5 px-8">
                <div className="flex justify-between items-end mb-2">
                   <div className="space-y-1">
                     <p className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.3em]">Amplitudo Sinyal</p>
                     <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest italic">Optimasi untuk Resonansi</p>
                   </div>
                  <p className="text-3xl font-display font-light text-slate-900 tracking-tighter">{atsResult.score}%</p>
                </div>
                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${atsResult.score}%` }}
                    transition={{ duration: 1.5, ease: 'circOut' }}
                    className="h-full rounded-full shadow-lg bg-slate-900 shadow-slate-200"
                  />
                </div>
              </div>

              {/* Details sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Keyword matched */}
                <div className="space-y-8 p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-premium">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-800">
                      <CheckCircle2 size={18} />
                    </div>
                     <div>
                       <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-[0.3em]">Resonansi Semantik</h5>
                       <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-medium">{atsResult.matchedKeywords.length} Entitas Terverifikasi</p>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {atsResult.matchedKeywords.slice(0, 30).map((kw) => (
                      <KeywordChip key={kw} word={kw} matched={true} />
                    ))}
                    {atsResult.matchedKeywords.length > 30 && (
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-300 uppercase tracking-widest self-center italic">+{atsResult.matchedKeywords.length - 30} more</span>
                    )}
                  </div>
                </div>

                {/* Keyword missing */}
                <div className="space-y-8 p-10 rounded-[3rem] bg-white border border-slate-100 border-dashed transition-all hover:shadow-premium">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-300">
                      <XCircle size={18} />
                    </div>
                     <div>
                       <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Kesenjangan Spektral</h5>
                       <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1 font-medium italic">{atsResult.missingKeywords.length} Entitas Tersembunyi</p>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {atsResult.missingKeywords.map((kw) => (
                      <KeywordChip key={kw} word={kw} matched={false} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {atsResult.suggestions?.length > 0 && (
                <div className="p-12 bg-slate-900 rounded-[3.5rem] shadow-2xl shadow-slate-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                    <Zap size={140} className="text-white" />
                  </div>

                  <div className="relative flex items-center gap-6 mb-12">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                      <AlertCircle size={24} />
                    </div>
                     <div className="space-y-1">
                       <h5 className="text-sm font-bold text-white uppercase tracking-[0.3em]">Audit Arsitektural</h5>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-80 italic">Optimasi untuk Fidelitas Kecocokan Maksimal</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
                    {atsResult.suggestions.map((s, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="flex gap-5 group/item"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 transition-all group-hover/item:bg-white group-hover/item:scale-125" />
                        <p className="text-sm font-medium text-slate-400 leading-relaxed group-hover/item:text-white transition-colors uppercase tracking-tight italic">
                          {s}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-8">
                <button
                  onClick={runATS}
                  className="group flex items-center gap-4 px-8 py-4 rounded-2xl border border-slate-100 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
                >
                   <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                   Kalibrasi Ulang Analisis
                 </button>
              </div>
            </motion.div>
          ) : !hasJD && (
            <div className="flex flex-col items-center py-20 text-center space-y-8">
              <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-100 border border-slate-50 shadow-inner group transition-all duration-700 hover:bg-white hover:text-slate-300 hover:shadow-premium">
                <BarChart3 size={40} className="transition-transform duration-700 group-hover:scale-110" />
              </div>
               <div className="space-y-3">
                 <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.4em]">Matriks Nonaktif</h4>
                 <p className="text-sm text-slate-300 font-medium italic">Sinkronisasikan metadata target untuk memulai pemetaan semantik.</p>
               </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-12 border-t border-slate-100 mt-8">
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
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">Inisialisasi Tahap 10</span>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <Zap size={20} className="group-hover:scale-110 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
