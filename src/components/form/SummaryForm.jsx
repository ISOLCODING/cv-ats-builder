// src/components/form/SummaryForm.jsx
// Step 5 — Professional Summary + ATS Checker (Modern Blue UI + TipTap)

import React, { useEffect, useCallback, useState } from 'react';
import {
  FileText, Target, CheckCircle2, XCircle, AlertCircle,
  Lightbulb, RefreshCw, ChevronLeft, Zap, BarChart3,
  Sparkles
} from 'lucide-react';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import useCVStore from '../../store/useCVStore';
import { calculateATSScore, getScoreLabel } from '../../utils/atsScore';
import { optimizeCV } from '../../services/gemini';

// ── ATS Score animated ring ────────────────────────────────────
function ScoreRing({ score }) {
  const { label, color } = getScoreLabel(score);
  const radius = 40;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  const ringColor =
    score >= 80 ? '#22c55e' :
    score >= 60 ? '#3b82f6' :
    score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="9" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black" style={{ color: ringColor }}>{score}</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">ATS</span>
        </div>
      </div>
      <span className="text-sm font-bold" style={{ color: ringColor }}>{label}</span>
    </div>
  );
}

// ── Summary templates ──────────────────────────────────────────
const TEMPLATES = [
  {
    emoji: '💻',
    label: 'Software Developer',
    html: '<p>Pengembang software berpengalaman <strong>3+ tahun</strong> dalam membangun aplikasi web dan mobile yang scalable. Spesialisasi di <strong>React, Node.js, dan cloud infrastructure</strong>. Terbiasa bekerja dalam lingkungan Agile dengan track record menyelesaikan proyek tepat waktu.</p>',
  },
  {
    emoji: '📊',
    label: 'Data Analyst',
    html: '<p>Data analyst dengan keahlian dalam <strong>SQL, Python, dan Power BI</strong>. Terampil mengubah data kompleks menjadi insight bisnis yang actionable untuk mendukung pengambilan keputusan strategis di organisasi berbasis data.</p>',
  },
  {
    emoji: '🎯',
    label: 'Project Manager',
    html: '<p>Project Manager bersertifikat <strong>PMP</strong> dengan 5+ tahun memimpin tim lintas fungsi. Mengelola proyek hingga <strong>Rp 10 miliar</strong> dengan metodologi Agile dan Waterfall. Fokus pada deliverable berkualitas tinggi, tepat waktu, dan dalam anggaran.</p>',
  },
  {
    emoji: '🎨',
    label: 'UI/UX Designer',
    html: '<p>UI/UX Designer dengan passion menciptakan pengalaman digital yang intuitif. Menguasai <strong>Figma dan Adobe XD</strong>, terbiasa melakukan user research, wireframing, dan prototyping. Pendekatan human-centered design dengan track record meningkatkan konversi.</p>',
  },
  {
    emoji: '🌱',
    label: 'Fresh Graduate',
    html: '<p>Fresh graduate <strong>Teknik Informatika</strong> dengan pengetahuan mendalam di bidang pengembangan web. Memiliki pengalaman magang di startup teknologi dan aktif berkontribusi di proyek open-source. Semangat belajar tinggi dan adaptif terhadap teknologi baru.</p>',
  },
  {
    emoji: '📱',
    label: 'Digital Marketing',
    html: '<p>Digital marketing specialist dengan keahlian dalam <strong>SEO, Google Ads, dan Meta Ads</strong>. Terbukti meningkatkan ROAS rata-rata <strong>2.5x</strong> dan mengoptimalkan konversi melalui A/B testing dan analisis data kampanye secara berkelanjutan.</p>',
  },
];

// ── Keyword chip ───────────────────────────────────────────────
function KeywordChip({ word, matched }) {
  return (
    <span className={`skill-tag text-xs ${
      matched
        ? 'bg-green-50 text-green-700 border border-green-200'
        : 'bg-red-50 text-red-600 border border-red-200'
    }`}>
      {matched ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
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
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Professional Summary</h2>
          <p className="text-sm text-slate-500">Ringkasan yang menarik perhatian recruiter dalam 6 detik</p>
        </div>
      </div>

      {/* TipTap rich editor untuk summary */}
      <RichEditor
        label="Summary CV"
        required
        value={cvData.summary}
        onChange={updateSummary}
        placeholder="Tulis ringkasan profesional Anda: siapa Anda, apa keahlian utama, dan nilai apa yang Anda bawa. Idealnya 3–5 kalimat padat."
        minHeight={180}
        maxLength={1200}
        helper="Gunakan bold untuk highlight skill kunci. Hindari kata sifat subjektif (rajin, jujur). Fokus pada pencahaian terukur."
      />

      {/* Template suggestions */}
      <div>
        <p className="text-xs font-bold text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
          Template cepat (klik untuk isi otomatis):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => updateSummary(t.html)}
              className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center gap-2"
            >
              <span className="text-base leading-none">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── ATS Checker ──────────────────────────────────────── */}
      <div className="border-t border-blue-50 pt-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="section-icon">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">ATS Score Checker</h3>
            <p className="text-sm text-slate-500">Paste JD → analisis keyword match secara real-time</p>
          </div>
        </div>

        {/* JD textarea */}
        <div className="space-y-1.5">
          <label className="form-label">Job Description (JD)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste deskripsi pekerjaan yang ingin Anda lamar di sini...&#10;&#10;Contoh:&#10;We are looking for a React Developer...&#10;Requirements:&#10;- Minimum 2 years experience in React&#10;- Familiar with TypeScript..."
            className="form-input resize-y font-mono text-xs leading-relaxed"
          />
          <p className="form-helper">Semakin lengkap JD yang di-paste, semakin akurat analisisnya.</p>
        </div>

        {/* ── Result ─────────────────────────────────────── */}
        {hasATS && (
          <div className="animate-fade-up space-y-4">
            {/* Score summary */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ScoreRing score={atsResult.score} />

                <div className="flex-1 w-full space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Analisis Keyword</h4>
                      <p className="text-xs text-slate-500">Skor Anda berdasarkan kecocokan keyword</p>
                    </div>

                    <Button
                      onClick={handleOptimize}
                      loading={optimizing}
                      variant="primary"
                      size="sm"
                      className="bg-blue-600 text-white shadow-lg shadow-blue-200"
                      leftIcon={<Sparkles className="w-4 h-4" />}
                    >
                      Optimasi CV dengan AI ✨
                    </Button>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm text-center">
                      <p className="text-lg font-black text-slate-900">{atsResult.totalKeywords}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Total</p>
                    </div>
                    <div className="p-2.5 bg-green-50 rounded-xl shadow-sm text-center border border-green-100">
                      <p className="text-lg font-black text-green-600">{atsResult.matchedKeywords.length}</p>
                      <p className="text-[10px] text-green-600 font-bold uppercase">Match</p>
                    </div>
                    <div className="p-2.5 bg-red-50 rounded-xl shadow-sm text-center border border-red-100">
                      <p className="text-lg font-black text-red-500">{atsResult.missingKeywords.length}</p>
                      <p className="text-[10px] text-red-500 font-bold uppercase">Missing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${atsResult.score}%`,
                    background: atsResult.score >= 80 ? '#22c55e' :
                      atsResult.score >= 60 ? '#3b82f6' :
                        atsResult.score >= 40 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <p className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{atsResult.score}% keyword match</p>
            </div>

            {/* Keyword matched */}
            {atsResult.matchedKeywords.length > 0 && (
              <div>
                <p className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Keyword yang ada di CV ({atsResult.matchedKeywords.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.matchedKeywords.slice(0, 25).map((kw) => (
                    <KeywordChip key={kw} word={kw} matched={true} />
                  ))}
                  {atsResult.matchedKeywords.length > 25 && (
                    <span className="badge badge-gray text-xs">+{atsResult.matchedKeywords.length - 25} lainnya</span>
                  )}
                </div>
              </div>
            )}

            {/* Keyword missing */}
            {atsResult.missingKeywords.length > 0 && (
              <div>
                <p className="text-sm font-bold text-red-600 mb-2 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Keyword yang belum ada ({atsResult.missingKeywords.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.missingKeywords.map((kw) => (
                    <KeywordChip key={kw} word={kw} matched={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {atsResult.suggestions?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <p className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Saran Perbaikan
                </p>
                <ul className="space-y-1.5">
                  {atsResult.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-amber-700">
                      <span className="text-amber-400 flex-shrink-0">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={runATS}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Analisis Ulang
            </Button>
          </div>
        )}

        {/* Placeholder saat belum ada JD cukup */}
        {!hasJD && (
          <div className="flex flex-col items-center py-8 text-center text-slate-400">
            <BarChart3 className="w-12 h-12 text-blue-100 mb-3" />
            <p className="text-sm font-semibold">Paste Job Description di atas</p>
            <p className="text-xs mt-1">Sistem akan menganalisis keyword match secara otomatis</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
        <Button variant="ghost" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Kembali
        </Button>
        <Button onClick={onNext} rightIcon={<Zap className="w-4 h-4" />}>
          Lanjut Buat Surat Lamaran
        </Button>
      </div>
    </div>
  );
}
