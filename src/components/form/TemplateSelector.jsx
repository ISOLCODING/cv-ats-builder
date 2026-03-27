// src/components/form/TemplateSelector.jsx
import React from 'react';
import { Layout, Check, Sparkles, FileText, AlignLeft, ChevronRight } from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import useAuthStore from '../../store/useAuthStore';
import Button from '../ui/Button';

const TEMPLATES = [
  {
    id: 'standard_ats',
    name: 'Format ATS Standar',
    desc: 'Struktur konvensional dengan tingkat keterbacaan tinggi. Dioptimalkan untuk sistem ATS dan koordinasi korporat.',
    icon: FileText,
    color: 'slate'
  },
  {
    id: 'modern_creative',
    name: 'Kreatif Kontemporer',
    desc: 'Desain dinamis dengan aksen visual modern. Ideal untuk sektor kreatif dan industri teknologi rintisan.',
    icon: Sparkles,
    color: 'sage'
  },
  {
    id: 'minimalist',
    name: 'Minimalis Murni',
    desc: 'Estetika minimalis yang mengutamakan esensi fungsional. Representasi profesional untuk berbagai disiplin ilmu.',
    icon: AlignLeft,
    color: 'taupe'
  }
];

const FONTS = [
  { id: 'serif', name: 'Times New Roman', desc: 'Klasik dan Formalitas Tinggi', class: 'font-serif' },
  { id: 'sans', name: 'Helvetica / Arial', desc: 'Modern dan Legibilitas Tinggi', class: 'font-sans' },
  { id: 'tahoma', name: 'Tahoma / Verdana', desc: 'Humanis dan Profesional', class: 'font-sans italic' },
  { id: 'roboto', name: 'Roboto', desc: 'Presisi dan Kontemporer', class: 'font-sans font-medium' },
];

export default function TemplateSelector({ onNext }) {
  const { cvData, setTemplate, appSettings, setFontFamily } = useCVStore();
  const { user, setShowUpgradeModal } = useAuthStore();
  const selected = cvData?.selectedTemplate || 'standard_ats';
  const selectedFont = appSettings?.fontFamily || 'serif';

  return (
    <div className="space-y-16 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
            <Layout className="w-8 h-8 group-hover:scale-110 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
          </div>
          <div className="text-left space-y-1">
             <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Step 01</span>
             <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic">
               Pilih <span className="text-slate-400">Blueprint</span>
             </h2>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const isSelected = selected === t.id;
          const isPremium = t.id !== 'standard_ats';
          const isLocked = isPremium && user?.role === 'Basic';
          
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => isLocked ? setShowUpgradeModal(true) : setTemplate(t.id)}
              className={`relative text-left p-10 rounded-[3rem] border-2 transition-all duration-500 group overflow-hidden ${
                isSelected 
                  ? 'border-[var(--primary)] bg-white shadow-premium translate-y-[-8px]' 
                  : isLocked
                  ? 'border-slate-100 bg-slate-50/50 opacity-60 hover:opacity-100 cursor-pointer'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-soft'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${
                  isSelected ? 'bg-slate-900 text-white scale-110 shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-600'
                }`}>
                  <Icon className="w-7 h-7" />
                </div>
                {isSelected && (
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center animate-scale-in">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <h3 className={`text-xl font-display italic tracking-tight mb-6 flex items-center gap-2 ${
                isSelected ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'
              }`}>
                {t.name}
              </h3>

              {/* Blueprint Preview - Visual instead of list */}
              <div className="space-y-3 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                {t.id === 'standard_ats' && (
                  <div className="space-y-1.5">
                    <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                    <div className="w-3/4 h-1 bg-slate-100 rounded-full"></div>
                    <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                  </div>
                )}
                {t.id === 'modern_creative' && (
                  <div className="flex gap-2">
                    <div className="w-1/3 h-8 bg-[var(--primary)]/10 rounded-md"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="w-full h-1 bg-slate-200 rounded-full"></div>
                      <div className="w-full h-1 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                )}
                {t.id === 'minimalist' && (
                  <div className="flex flex-col items-center space-y-1.5">
                    <div className="w-1/2 h-1 bg-slate-200 rounded-full"></div>
                    <div className="w-2/3 h-1 bg-slate-100 rounded-full"></div>
                  </div>
                )}
              </div>

              <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 ${isSelected ? 'bg-[var(--primary)] shadow-[0_-4px_10px_rgba(var(--primary-rgb),0.3)]' : 'bg-transparent'}`}></div>
            </button>
          );
        })}
      </div>

      <div className="space-y-10 pt-8">
        <div className="flex items-center gap-5 px-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center shadow-inner border border-slate-100">
            <AlignLeft className="w-7 h-7 font-bold" />
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-display font-light text-slate-900 italic tracking-tight">Tipografi <span className="text-slate-400">Eksklusif</span></h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] leading-none mt-2 px-1">Karakter visual dan legibilitas dokumen</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {FONTS.map((f) => {
            const isFontSelected = selectedFont === f.id;
            return (
              <button
                type="button"
                key={f.id}
                onClick={() => setFontFamily(f.id)}
                className={`p-6 rounded-[2.5rem] border-2 transition-all duration-500 text-left group relative overflow-hidden ${
                  isFontSelected 
                    ? 'border-[var(--primary)] bg-white shadow-premium translate-y-[-4px]' 
                    : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200 shadow-soft'
                }`}
              >
                <div className={`text-4xl font-black mb-6 transition-colors ${f.class} ${isFontSelected ? 'text-slate-900' : 'text-slate-200 group-hover:text-slate-400'}`}>
                  Aa
                </div>
                <div className={`text-[11px] font-bold uppercase tracking-widest ${isFontSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                  {f.name}
                </div>
                <div className="text-[10px] text-slate-400 font-medium leading-tight mt-2 opacity-60 group-hover:opacity-100 transition-opacity font-sans">
                  {f.desc}
                </div>
                {isFontSelected && <div className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse shadow-lg shadow-slate-200"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-12 border-t border-slate-100">
        <button
          onClick={onNext}
          className="group flex items-center gap-8 px-10 py-5 rounded-full bg-slate-900 text-white shadow-premium hover:bg-black transition-all active:scale-[0.98]"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">Lanjutkan ke Informasi Pribadi</span>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
