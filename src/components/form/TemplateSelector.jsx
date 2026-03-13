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
    <div className="space-y-12 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group relative">
            <Layout className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 fill-current text-white/50" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Pilih <span className="text-blue-600">Desain CV</span></h2>
            <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mt-1.5 leading-none">Sesuaikan tampilan CV Anda</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const isSelected = selected === t.id;
          
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`relative text-left p-8 rounded-[2.5rem] border-2 transition-all duration-300 group ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50/50 shadow-indigo translate-y-[-4px]' 
                  : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg'
              }`}
            >
              {isSelected && (
                <div className="absolute top-6 right-6 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center animate-scale-in shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600'
              }`}>
                <Icon className="w-7 h-7" />
              </div>

              <h3 className={`font-black text-sm uppercase tracking-tight mb-2 ${
                isSelected ? 'text-blue-900' : 'text-slate-800'
              }`}>
                {t.name}
              </h3>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                {t.desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="space-y-8 animate-fade-up delay-100">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center shadow-inner">
            <AlignLeft className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Tipografi <span className="text-blue-600">& Font</span></h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Gaya tulisan dokumen</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FONTS.map((f) => {
            const isFontSelected = selectedFont === f.id;
            return (
              <button
                type="button"
                key={f.id}
                onClick={() => setFontFamily(f.id)}
                className={`p-5 rounded-[2rem] border-2 transition-all duration-300 text-left group ${
                  isFontSelected 
                    ? 'border-blue-500 bg-white shadow-xl translate-y-[-2px]' 
                    : 'border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200'
                }`}
              >
                <div className={`text-2xl font-black mb-2 transition-colors ${f.class} ${isFontSelected ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                  Aa
                </div>
                <div className={`text-[11px] font-black uppercase tracking-tight ${isFontSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                  {f.name}
                </div>
                <div className="text-[9px] text-slate-400 font-bold leading-tight mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  {f.desc}
                </div>
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
