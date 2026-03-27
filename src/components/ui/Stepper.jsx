// src/components/ui/Stepper.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, User, Briefcase, GraduationCap,
  Cpu, FileText, Mail, Target, Send, Stars,
  Award, Rocket, Users, Layout
} from 'lucide-react';

const STEPS = [
  { id: 1,  label: 'Seleksi Desain',      icon: Layout },
  { id: 2,  label: 'Data Pribadi',        icon: User },
  { id: 3,  label: 'Pengalaman Kerja',    icon: Briefcase },
  { id: 4,  label: 'Riwayat Pendidikan',  icon: GraduationCap },
  { id: 5,  label: 'Matriks Keahlian',    icon: Cpu },
  { id: 6,  label: 'Sertifikasi & Penghargaan', icon: Award },
  { id: 7,  label: 'Portofolio Proyek',   icon: Rocket },
  { id: 8,  label: 'Aktivitas Organisasi', icon: Users },
  { id: 9,  label: 'Profil Profesional',  icon: FileText },
  { id: 10, label: 'Surat Lamaran',       icon: Mail },
  { id: 11, label: 'Penyelarasan ATS',    icon: Target },
  { id: 12, label: 'Finalisasi Dokumen',  icon: Send },
];

export default function Stepper({ currentStep, onStepClick }) {
  const totalSteps = STEPS.length;

  return (
    <div className="relative">
      {/* ── Desktop Workspace Nav ─────────────────────────── */}
      <div className="hidden lg:block relative bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] p-4 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center justify-between min-w-max gap-8 px-6 py-2 relative">
            {/* Connection Line */}
            <div className="absolute top-[1.4rem] left-16 right-16 h-px bg-slate-100/60 z-0">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-[var(--primary)] shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]"
              />
            </div>

            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const isClickable = step.id < currentStep || true;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepClick?.(step.id)}
                  className={`relative z-10 flex flex-col items-center gap-4 transition-all duration-500 outline-none group shrink-0 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  style={{ width: '100px' }}
                >
                  <div className="relative">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.15 : 1,
                        backgroundColor: isActive ? "var(--primary)" : isCompleted ? "var(--secondary)" : "#ffffff",
                        borderColor: isActive ? "var(--primary)" : isCompleted ? "var(--secondary)" : "#f1f5f9"
                      }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                        isActive 
                          ? 'shadow-xl shadow-[var(--primary)]/20 text-white' 
                          : isCompleted 
                            ? 'text-white shadow-md shadow-[var(--secondary)]/10' 
                            : 'text-slate-300 border-slate-100'
                      }`}
                    >
                      {isCompleted ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4 stroke-[3]" /></motion.div>
                      ) : (
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'group-hover:text-[var(--primary)]'} transition-colors`} />
                      )}
                    </motion.div>
                  </div>
                  
                  <p className={`text-[8px] font-bold tracking-[0.1em] uppercase transition-all duration-500 text-center leading-tight whitespace-pre-wrap font-display max-w-[100px] ${
                    isActive ? 'text-slate-800' : isCompleted ? 'text-[var(--secondary)]' : 'text-slate-400 opacity-60'
                  }`}>
                    {step.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile Progressive Nav ──────────────── */}
      <div className="lg:hidden">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 space-y-2 text-left min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-[9px] font-bold uppercase tracking-widest">
                  Tahap {currentStep}
                </span>
              </div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase font-display truncate">
                {STEPS[currentStep - 1]?.label}
              </h4>
            </div>

            <div className="relative w-14 h-14 flex flex-shrink-0 items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="24" fill="transparent" stroke="#f8fafc" strokeWidth="3" />
                <motion.circle
                  cx="28" cy="28" r="24" fill="transparent" stroke="var(--primary)" strokeWidth="3"
                  strokeDasharray="150.8"
                  animate={{ strokeDashoffset: 150.8 - (150.8 * currentStep / totalSteps) }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[9px] font-bold text-slate-400">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-3">
             <button 
               onClick={() => currentStep > 1 && onStepClick?.(currentStep - 1)}
               disabled={currentStep === 1}
               className="flex-1 py-3.5 px-4 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 transition-all border border-slate-100"
             >
               Kembali
             </button>
             <button 
               onClick={() => currentStep < totalSteps && onStepClick?.(currentStep + 1)}
               disabled={currentStep === totalSteps}
               className="flex-[2] py-3.5 px-4 rounded-xl bg-[var(--primary)] text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 shadow-lg shadow-[var(--primary)]/20 transition-all"
             >
               Lanjutkan
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
