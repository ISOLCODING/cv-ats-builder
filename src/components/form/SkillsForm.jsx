import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Heart, Languages, X, Plus, Sparkles, ChevronLeft, ChevronRight, Info, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import useCVStore from '../../store/useCVStore';
import { useGroq } from '../../hooks/useGroq';

// ── Skill suggestions ─────────────────────────────────────────
const SUGGESTIONS = {
  technical: [
    'JavaScript','TypeScript','Python','Java','Go','PHP','C++','C#','Rust','Swift','Kotlin',
    'React','Vue.js','Angular','Next.js','Node.js','Express.js','FastAPI','Django','Laravel','Spring Boot',
    'HTML','CSS','Tailwind CSS','Bootstrap','SASS',
    'MySQL','PostgreSQL','MongoDB','Redis','Firebase','Supabase','SQLite',
    'AWS','Google Cloud','Azure','Docker','Kubernetes','Terraform','CI/CD','GitHub Actions',
    'Git','REST API','GraphQL','gRPC','WebSocket',
    'React Native','Flutter',
    'Machine Learning','TensorFlow','PyTorch','scikit-learn','Pandas','NumPy',
    'Power BI','Tableau','Google Analytics','Excel','SQL',
    'Figma','Adobe XD','Photoshop',
    'Linux','Bash','PowerShell','Google Apps Script',
  ],
  softSkills: [
    'Leadership','Project Management','Problem Solving','Critical Thinking',
    'Komunikasi','Public Speaking','Presentasi','Negosiasi',
    'Time Management','Adaptasi','Kreativitas','Inovasi',
    'Teamwork','Kolaborasi','Mentoring','Coaching',
    'Analytical Thinking','Detail-Oriented','Decision Making',
    'Customer Service','Conflict Resolution','Stakeholder Management',
    'Agile / Scrum','Kanban','Design Thinking','Growth Mindset',
  ],
  languages: [
    'Bahasa Indonesia (Native)','Bahasa Inggris (Fluent)','Bahasa Inggris (Professional)',
    'Bahasa Inggris (Conversational)','Bahasa Inggris (Basic)',
    'Bahasa Mandarin','Bahasa Arab','Bahasa Jepang','Bahasa Korea',
    'Bahasa Jerman','Bahasa Prancis','Bahasa Spanyol','Bahasa Belanda',
  ],
};

const CAT_CONFIG = {
  technical: {
    label: 'Kepakaran Teknis',
    desc: 'Kerangka kerja, bahasa & perangkat',
    icon: Cpu,
    colors: {
      tag:    'bg-slate-50 text-slate-800 border-slate-100 hover:border-slate-300 hover:bg-white shadow-sm',
      delBtn: 'text-slate-300 hover:text-slate-900 transition-colors',
      header: 'text-slate-900',
      bg:     'bg-slate-50',
      badge:  'bg-slate-900 text-white',
    },
  },
  softSkills: {
    label: 'Arsitektur Humaniora',
    desc: 'Interpersonal & kepemimpinan',
    icon: Heart,
    colors: {
      tag:    'bg-slate-50 text-slate-800 border-slate-100 hover:border-slate-300 hover:bg-white shadow-sm',
      delBtn: 'text-slate-300 hover:text-slate-900 transition-colors',
      header: 'text-slate-900',
      bg:     'bg-slate-50',
      badge:  'bg-slate-900 text-white',
    },
  },
  languages: {
    label: 'Komunikasi Global',
    desc: 'Kemahiran berbahasa',
    icon: Languages,
    colors: {
      tag:    'bg-slate-50 text-slate-800 border-slate-100 hover:border-slate-300 hover:bg-white shadow-sm',
      delBtn: 'text-slate-300 hover:text-slate-900 transition-colors',
      header: 'text-slate-900',
      bg:     'bg-slate-50',
      badge:  'bg-slate-900 text-white',
    },
  },
};

// ── Tag input per kategori ─────────────────────────────────────
function SkillTagInput({ category, skills = [], onAdd, onRemove }) {
  const [input, setInput]     = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const ref = useRef(null);
  const cfg = CAT_CONFIG[category];
  const Icon = cfg.icon;

  const allSuggestions = SUGGESTIONS[category] || [];
  const filtered = allSuggestions
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s))
    .slice(0, 8);

  const doAdd = (val) => {
    const v = (val || input).trim();
    if (v) { onAdd(category, v); setInput(''); setShowDrop(false); ref.current?.focus(); }
  };

  return (
    <div className="p-12 bg-white rounded-[3.5rem] border border-slate-100 space-y-10 hover:shadow-premium transition-all duration-700 group/skill relative overflow-hidden">
      {/* Visual background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-0 group-hover/skill:opacity-100 transition-opacity duration-1000 -translate-y-12 translate-x-12" />

      {/* Category header */}
      <div className="flex items-center gap-6 relative z-10">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${cfg.colors.bg} border border-slate-50 shadow-sm transition-all duration-700 group-hover/skill:scale-110 group-hover/skill:bg-slate-900 group-hover/skill:text-white`}>
          <Icon size={24} className="transition-transform duration-500 group-hover/skill:rotate-[360deg]" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-none italic">{cfg.label}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-bold">{cfg.desc}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-display font-bold italic text-slate-900">{skills.length.toString().padStart(2, '0')}</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300">Nodes</span>
        </div>
      </div>

      {/* Tags display */}
      <div className="flex flex-wrap gap-3 min-h-[40px] px-2">
        {skills.length === 0 && (
          <span className="text-[11px] font-medium text-slate-300 self-center italic ml-1">Riwayat kosong — mulai ketik untuk menambahkan</span>
        )}
        {skills.map((skill) => (
          <motion.span
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={skill}
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${cfg.colors.tag}`}
          >
            {skill}
            <button
              type="button"
              onClick={() => onRemove(category, skill)}
              className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${cfg.colors.delBtn}`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </div>

      {/* Input + dropdown */}
      <div className="relative pt-2">
        <div className="flex gap-4">
          <div className="relative flex-1">
             <input
              ref={ref}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setShowDrop(true); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); doAdd(input); }
                if (e.key === 'Escape') setShowDrop(false);
              }}
              onFocus={() => setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 180)}
              placeholder="Tambahkan kompetensi baru…"
              className="w-full pl-6 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-50 focus:border-slate-900 focus:bg-white transition-all outline-none font-medium text-slate-700 text-sm placeholder:text-slate-300"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200">
               <Plus size={18} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => doAdd(input)}
            disabled={!input.trim()}
            className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-20 active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showDrop && filtered.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full left-0 right-14 z-50 mt-3 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-premium overflow-hidden"
            >
              <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
                <p className="text-[9px] text-slate-400 font-bold px-4 py-3 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Sparkles size={12} className="text-slate-800" /> Saran AI
                </p>
                {filtered.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => doAdd(s)}
                    className="w-full text-left px-5 py-3 text-sm rounded-xl hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function SkillsForm({ onNext, onBack }) {
  const { cvData, addSkill, removeSkill, atsResult, aiSuggestions, setAISuggestions } = useCVStore();
  const { getSmartSkillsAI } = useGroq();
  const { skills } = cvData;
  const { missingKeywords = [] } = atsResult;

  const [isLoadingSmart, setIsLoadingSmart] = useState(false);
  
  // Smart Skills Analysis
  useEffect(() => {
    fetchSmartSkills();
  }, []);

  const hasAISuggestions = aiSuggestions.technical?.length > 0 || aiSuggestions.softSkills?.length > 0;

  const fetchSmartSkills = async (force = false) => {
    if (!force && hasAISuggestions) return; 
    
    const hasSummary = cvData.summary && cvData.summary.length > 20;
    const hasExp = cvData.experiences && cvData.experiences.length > 0;
    const hasEdu = cvData.education && cvData.education.length > 0;

    if (hasSummary || hasExp || hasEdu) {
      setIsLoadingSmart(true);
      try {
        const result = await getSmartSkillsAI({ cvData });
        setAISuggestions(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingSmart(false);
      }
    }
  };

  const nudges = missingKeywords.filter(kw => !skills.technical?.includes(kw));

  const total = ['technical','softSkills','languages'].reduce(
    (acc, k) => acc + (skills[k]?.length || 0), 0
  );

  return (
    <div className="animate-fade-up space-y-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
               <Cpu size={28} className="group-hover:scale-110 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
             </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Tahap 05</span>
                <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic text-left">
                  Keahlian & <span className="text-slate-400">Spesialisasi</span>
                </h2>
              </div>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-xl leading-relaxed italic px-2">
            {total > 0 
              ? `Anda telah mengarsipkan ${total} kompetensi unik ke dalam profil profesional Anda.` 
              : 'Kumpulkan 8-12 kompetensi inti yang strategis untuk memaksimalkan keterbacaan sistem (ATS) dan relevansi profil Anda.'}
          </p>
        </div>

        {total > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-8 py-4 rounded-2xl bg-slate-950 text-white text-[10px] font-bold uppercase tracking-[0.4em] shadow-2xl shadow-slate-300 shrink-0"
          >
            {total} KOMPETENSI TERINDEKS
          </motion.div>
        )}
      </div>

      {/* Internal Calibration (AI Recommendations) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-slate-100 rounded-[4rem] blur-2xl opacity-40 transition duration-1000" />
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-10 py-12 bg-white border border-slate-100 rounded-[4rem] shadow-sm overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm relative overflow-hidden group/spark">
                <Sparkles size={28} className="z-10 group-hover/spark:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-200 to-transparent opacity-30 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-2xl tracking-tight leading-none italic">Kalibrasi Internal</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.3em] opacity-80">Pemetaan Kompetensi Berbasis AI</p>
              </div>
            </div>
            
            {!isLoadingSmart && (
               <button 
                 onClick={() => fetchSmartSkills(true)}
                 className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm group"
               >
                 <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                 Kalibrasi Ulang
               </button>
            )}
          </div>

          <div className="space-y-12">
            {isLoadingSmart ? (
              <div className="flex flex-wrap gap-4 px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-12 w-36 bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : hasAISuggestions ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {aiSuggestions.technical?.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 ml-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Technical tokens</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {aiSuggestions.technical
                        .filter(s => !skills.technical?.includes(s))
                        .map((s) => (
                        <motion.button
                          key={s}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => addSkill('technical', s)}
                          className="group flex items-center gap-3 px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-medium text-slate-700 hover:border-slate-900 hover:bg-white hover:text-slate-900 transition-all"
                        >
                          <Plus size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {aiSuggestions.softSkills?.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 ml-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Behavioral tokens</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {aiSuggestions.softSkills
                        .filter(s => !skills.softSkills?.includes(s))
                        .map((s) => (
                        <motion.button
                          key={s}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => addSkill('softSkills', s)}
                          className="group flex items-center gap-3 px-6 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-medium text-slate-700 hover:border-slate-900 hover:bg-white hover:text-slate-900 transition-all"
                        >
                          <Plus size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
               <div className="py-12 text-center">
                 <p className="text-slate-300 text-sm font-medium italic">Sinkronisasikan riwayat profesional Anda untuk memulai pemetaan kompetensi AI.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* External Calibration (JD Based Nudges) */}
      {nudges.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 bg-slate-900 rounded-[4rem] shadow-premium relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-16 opacity-5 scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
             <Cpu size={140} className="text-white" />
          </div>

          <div className="relative flex items-center gap-8 mb-12">
            <div className="w-16 h-16 rounded-[2rem] bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-inner">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-2xl tracking-tight leading-none italic uppercase">Protokol Eksternal</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.4em] opacity-80">Analisis Kesenjangan Semantik: Membutuhkan Target Aktif</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 relative px-4">
            {nudges.map((nudge) => (
              <motion.button
                key={nudge}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addSkill('technical', nudge)}
                className="group flex items-center gap-4 px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white hover:bg-white hover:text-slate-900 transition-all shadow-lg"
              >
                <Plus size={16} className="text-slate-500 group-hover:rotate-90 transition-transform" />
                {nudge}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Categories */}
      <div className="grid grid-cols-1 gap-10 stagger">
        {Object.keys(CAT_CONFIG).map((cat) => (
          <SkillTagInput
            key={cat}
            category={cat}
            skills={skills[cat] || []}
            onAdd={addSkill}
            onRemove={removeSkill}
          />
        ))}
      </div>

      {/* Meta Tip */}
      <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-800 shadow-sm">
             <Info size={20} />
           </div>
           <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-500 italic">Logika Optimasi</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 px-4">
          <div className="flex gap-5">
             <div className="w-2 h-2 rounded-full bg-slate-900 mt-2 shrink-0" />
             <p className="text-sm font-medium text-slate-400 leading-relaxed italic">Sinkronisasikan nomenklatur keahlian secara tepat dengan deskripsi pekerjaan target untuk memastikan kompatibilitas semantik yang tinggi.</p>
          </div>
          <div className="flex gap-5">
             <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0" />
             <p className="text-sm font-medium text-slate-400 leading-relaxed italic">Prioritaskan kompetensi inti. Hindari mencantumkan keahlian tersier yang tidak selaras dengan arsitektur peran yang ditargetkan.</p>
          </div>
          <div className="flex gap-5">
             <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0" />
             <p className="text-sm font-medium text-slate-400 leading-relaxed italic">Gunakan terminologi standar industri. Parser AI memprioritaskan frasa kanonikal dibandingkan sinonim kreatif.</p>
          </div>
          <div className="flex gap-5">
             <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0" />
             <p className="text-sm font-medium text-slate-400 leading-relaxed italic">Jaga keseimbangan antara kompetensi teknis yang spesifik dengan kemampuan interpersonal yang strategis.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-12 border-t border-slate-100 mt-16 px-4">
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
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">Inisialisasi Tahap 06</span>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
