// src/components/ui/Stepper.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, User, Briefcase, GraduationCap,
  Cpu, FileText, Mail, Target, Send, Stars,
  Award, Rocket, Users, Layout
} from 'lucide-react';

const STEPS = [
  { id: 1,  label: 'Template',      icon: Layout },
  { id: 2,  label: 'Profil',        icon: User },
  { id: 3,  label: 'Pengalaman',    icon: Briefcase },
  { id: 4,  label: 'Pendidikan',    icon: GraduationCap },
  { id: 5,  label: 'Keahlian',      icon: Cpu },
  { id: 6,  label: 'Sertifikasi',   icon: Award },
  { id: 7,  label: 'Proyek',        icon: Rocket },
  { id: 8,  label: 'Organisasi',    icon: Users },
  { id: 9,  label: 'Ringkasan',     icon: FileText },
  { id: 10, label: 'Surat Lamaran', icon: Mail },
  { id: 11, label: 'Analisis ATS',  icon: Target },
  { id: 12, label: 'Kirim Email',   icon: Send },
];

export default function Stepper({ currentStep, onStepClick }) {
  const totalSteps = STEPS.length;

  return (
    <div className="relative">
      {/* ── Royal Stepper ─────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between relative px-10">
        {/* Connection Line */}
        <div className="absolute top-[1.6rem] left-20 right-20 h-[2px] bg-slate-100 rounded-full z-0 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          />
        </div>

        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepClick?.(step.id)}
              className={`relative z-10 flex flex-col items-center gap-5 transition-all duration-500 outline-none group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ width: '90px' }}
            >
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.3 : 1,
                    backgroundColor: isActive ? "#0f172a" : isCompleted ? "#2563eb" : "#ffffff",
                    borderColor: isActive ? "#0f172a" : isCompleted ? "#2563eb" : "#f1f5f9"
                  }}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    isActive 
                      ? 'shadow-2xl shadow-slate-900/20 text-white' 
                      : isCompleted 
                        ? 'text-white shadow-lg shadow-blue-500/10' 
                        : 'text-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-5 h-5 stroke-[4]" /></motion.div>
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </motion.div>
                
                {isActive && (
                  <motion.div layoutId="royal-sparkle" className="absolute -top-1.5 -right-1.5 text-blue-500 bg-white rounded-full p-1 shadow-xl border border-blue-50">
                    <Stars className="w-3 h-3 fill-current" />
                  </motion.div>
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <p className={`text-[9px] font-black tracking-[0.1em] uppercase transition-all duration-500 text-center leading-tight whitespace-nowrap font-display ${
                  isActive ? 'text-slate-900' : isCompleted ? 'text-blue-600' : 'text-slate-300'
                }`}>
                  {step.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Mobile Tactical View ──────────────── */}
      <div className="lg:hidden">
        <div className="bg-white/50 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
                  Step {currentStep.toString().padStart(2, '0')}
                </span>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
              </div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase font-display italic">
                {STEPS[currentStep - 1]?.label}
              </h4>
            </div>

            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="32" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                <motion.circle
                  cx="40" cy="40" r="32" fill="transparent" stroke="#2563eb" strokeWidth="6"
                  strokeDasharray="201.06"
                  animate={{ strokeDashoffset: 201.06 - (201.06 * currentStep / totalSteps) }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xs font-black text-slate-900 font-display">{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
