// src/components/form/TemplateSelector.jsx
import React from 'react';
import { Layout, Check, Sparkles, FileText, AlignLeft, ChevronRight } from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import Button from '../ui/Button';

const TEMPLATES = [
  {
    id: 'standard_ats',
    name: 'Standard ATS',
    desc: 'Boring but safe. Cocok untuk perusahaan korporat & ATS.',
    icon: FileText,
    color: 'slate'
  },
  {
    id: 'modern_creative',
    name: 'Modern Creative',
    desc: 'Stylish & interactive. Cocok untuk bidang kreatif & startup.',
    icon: Sparkles,
    color: 'blue'
  },
  {
    id: 'minimalist',
    name: 'Minimalist Clean',
    desc: 'Sangat bersih & to-the-point. Profesional untuk semua bidang.',
    icon: AlignLeft,
    color: 'emerald'
  }
];

const FONTS = [
  { id: 'serif', name: 'Times New Roman', desc: 'Klasik & Sangat Formal', class: 'font-serif' },
  { id: 'sans', name: 'Helvetica / Arial', desc: 'Modern & Mudah Dibaca', class: 'font-sans' },
  { id: 'tahoma', name: 'Tahoma / Verdana', desc: 'Humanist & Profesional', class: 'font-sans italic' },
  { id: 'roboto', name: 'Roboto', desc: 'Teknologi & Bersih', class: 'font-sans font-medium' },
];

export default function TemplateSelector({ onNext }) {
  const { cvData, setTemplate, appSettings, setFontFamily } = useCVStore();
  const selected = cvData?.selectedTemplate || 'standard_ats';
  const selectedFont = appSettings?.fontFamily || 'serif';

  return (
    <div className="space-y-16 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-900/40 group relative overflow-hidden">
            <Layout className="w-8 h-8 group-hover:scale-110 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
          </div>
          <div className="text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase font-display">Pilih <span className="text-blue-600">Blueprint</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 leading-none px-1">Tentukan fondasi visual karir Anda</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const isSelected = selected === t.id;
          
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`relative text-left p-10 rounded-[3rem] border-2 transition-all duration-500 group overflow-hidden ${
                isSelected 
                  ? 'border-blue-500 bg-white shadow-indigo translate-y-[-8px]' 
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl'
              }`}
            >
              {isSelected && (
                <div className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center animate-scale-in shadow-xl shadow-blue-500/30">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-8 transition-all duration-500 ${
                isSelected ? 'bg-slate-900 text-white scale-110 rotate-3' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500'
              }`}>
                <Icon className="w-8 h-8" />
              </div>

              <h3 className={`font-black text-base uppercase tracking-tight mb-3 font-display ${
                isSelected ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'
              }`}>
                {t.name}
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {t.desc}
              </p>
              
              <div className={`absolute bottom-0 left-0 right-0 h-1.5 transition-all duration-500 ${isSelected ? 'bg-blue-500' : 'bg-transparent'}`}></div>
            </button>
          );
        })}
      </div>

      <div className="space-y-10 pt-8">
        <div className="flex items-center gap-5 px-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner border border-blue-100/50">
            <AlignLeft className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-display">Elite <span className="text-blue-600">Typography</span></h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] leading-none mt-2 px-1">Karakter visual dokumen</p>
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
                    ? 'border-blue-600 bg-white shadow-2xl translate-y-[-4px]' 
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`text-3xl font-black mb-4 transition-colors ${f.class} ${isFontSelected ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                  Aa
                </div>
                <div className={`text-[11px] font-black uppercase tracking-wider ${isFontSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                  {f.name}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold leading-tight mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  {f.desc}
                </div>
                {isFontSelected && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-12 border-t border-slate-50">
        <Button
          onClick={onNext}
          variant="primary"
          size="lg"
          className="rounded-full shadow-blue px-10"
          rightIcon={<ChevronRight className="w-5 h-5" />}
        >
          Lanjut ke Data Profil
        </Button>
      </div>
    </div>
  );
}
