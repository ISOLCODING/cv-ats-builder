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
      <div className="hidden lg:flex items-center justify-between relative px-6">
        {/* Connection Line */}
        <div className="absolute top-[1.4rem] left-16 right-16 h-[4px] bg-slate-100 rounded-full z-0 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "circOut" }}
            className="h-full bg-[#0A4174] shadow-[0_0_20px_rgba(10, 65, 116, 0.4)]"
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
              className={`relative z-10 flex flex-col items-center gap-4 transition-all duration-500 outline-none group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ width: '80px' }} // Adjusted width for more steps
            >
              <div className="relative">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.25 : 1,
                    backgroundColor: isActive ? "#0066FF" : isCompleted ? "#0066FF" : "#ffffff",
                    borderColor: isActive ? "#ffffff" : "#E3F2FD"
                  }}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'shadow-[0_10px_25px_-5px_rgba(0,102,255,0.5)] text-white ring-4 ring-blue-50' : isCompleted ? 'text-white' : 'text-[#BBDEFB]'
                    }`}
                >
                  {isCompleted ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4 stroke-[4]" /></motion.div>
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </motion.div>
                {isActive && (
                  <motion.div layoutId="royal-sparkle" className="absolute -top-1 -right-1 text-[#4E8EA2] bg-white rounded-full p-0.5 shadow-md border border-[#BDD8E9]">
                    <Stars className="w-2.5 h-2.5 fill-current" />
                  </motion.div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <p className={`text-[8px] font-black tracking-tighter uppercase transition-all duration-300 text-center leading-tight whitespace-nowrap ${isActive ? 'text-[#0066FF]' : isCompleted ? 'text-[#0066FF]/70' : 'text-slate-300'
                }`}>
                  {step.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Mobile Tactical View ──────────────── */}
      <div className="lg:hidden flex flex-col gap-5">
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                Phase {currentStep.toString().padStart(2, '0')}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
            </div>
            <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase tabular-nums">
              {STEPS[currentStep - 1]?.label}
            </h4>
          </div>

          <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center relative shadow-sm">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
              <motion.circle
                cx="24" cy="24" r="20" fill="transparent" stroke="#2563eb" strokeWidth="4"
                strokeDasharray="125.66"
                animate={{ strokeDashoffset: 125.66 - (125.66 * currentStep / totalSteps) }}
                transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            <span className="absolute text-[10px] font-black text-slate-900">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
