// src/components/ui/Stepper.jsx
import React from 'react';
import { Check, User, Briefcase, GraduationCap, Cpu, FileText } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Personal',    short: 'Info',    icon: User },
  { id: 2, label: 'Pengalaman',  short: 'Kerja',   icon: Briefcase },
  { id: 3, label: 'Pendidikan',  short: 'Edu',     icon: GraduationCap },
  { id: 4, label: 'Skills',      short: 'Skills',  icon: Cpu },
  { id: 5, label: 'Summary',     short: 'CV',      icon: FileText },
];

export default function Stepper({ currentStep, onStepClick }) {
  return (
    <div className="px-2">
      {/* ── Desktop stepper ────────────────────────────────── */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-[1.125rem] left-0 right-0 h-0.5 bg-blue-100 z-0 mx-8" />
        <div
          className="absolute top-[1.125rem] left-0 h-0.5 bg-blue-500 z-0 mx-8 transition-all duration-500"
          style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 4rem)` }}
        />

        {STEPS.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < currentStep;
          const isActive    = step.id === currentStep;
          const isPending   = step.id > currentStep;
          const isClickable = step.id < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isClickable && onStepClick?.(step.id)}
              className={`relative z-10 flex flex-col items-center gap-1.5 focus:outline-none group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {/* Circle */}
              <div
                className={`step-circle text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-95'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-300 ring-4 ring-blue-100 scale-110'
                    : 'bg-white text-blue-300 border-2 border-blue-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                )}
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={`text-xs font-semibold leading-none transition-colors ${
                  isActive ? 'text-blue-700' : isCompleted ? 'text-blue-500' : 'text-slate-400'
                }`}>
                  {step.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Mobile stepper ─────────────────────────────────── */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-blue-400 font-medium uppercase tracking-wider">
              Step {currentStep} dari {STEPS.length}
            </p>
            <p className="text-base font-bold text-blue-900 leading-tight">
              {STEPS[currentStep - 1]?.label}
            </p>
          </div>
          <div className="flex gap-1.5">
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isActive    = step.id === currentStep;
              return (
                <div
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive    ? 'w-6 bg-blue-600' :
                    isCompleted ? 'w-3 bg-blue-400' :
                                  'w-3 bg-blue-100'
                  }`}
                />
              );
            })}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
