import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Briefcase, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, Building2, Calendar, 
  CheckCircle2, ChevronUp, ChevronDown, Info, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import MagicWriter from '../ui/MagicWriter';
import useCVStore from '../../store/useCVStore';

// ── helpers ──────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return m ? `${months[+m - 1]} ${y}` : y;
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
}

// ── Empty state ───────────────────────────────────────────────
function EmptyExperience({ onAdd }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-10 text-center bg-white border border-dashed border-slate-200 rounded-[3rem] hover:border-slate-400 transition-colors duration-700"
    >
      <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-10 relative group-hover:scale-110 transition-transform duration-700">
        <Briefcase className="w-10 h-10 text-slate-300" />
        <div className="absolute inset-x-0 -bottom-2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight font-display mb-4 italic">Belum Ada Pengalaman Tercatat</h3>
      <p className="text-base font-medium text-slate-400 max-w-sm mb-12 leading-relaxed">
        Mari mulai menyusun narasi profesional Anda. Setiap peran berkontribusi pada trajektori strategis karier Anda.
      </p>
      <button 
        onClick={onAdd} 
        className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-200 hover:bg-black transition-all font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95"
      >
        <Plus size={18} />
        Tambah Pengalaman
      </button>
    </motion.div>
  );
}

// ── Entry card ────────────────────────────────────────────────
function ExperienceCard({ exp, index, total, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const dateStr = exp.isCurrent
    ? `${fmtDate(exp.startDate)} – Saat Ini`
    : `${fmtDate(exp.startDate)}${exp.endDate ? ` – ${fmtDate(exp.endDate)}` : ''}`;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative pl-12 md:pl-20 pb-16 last:pb-0"
    >
      {/* Vertical Timeline Line */}
      <div className="absolute left-[23px] md:left-[43px] top-0 bottom-0 w-px bg-slate-100 group-last:bg-gradient-to-b group-last:from-slate-100 group-last:to-transparent"></div>

      {/* Timeline Node Icon */}
      <div className={`absolute left-0 md:left-5 top-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-4 border-white shadow-premium ${
        exp.isCurrent ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-110' : 'bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-slate-900'
      }`}>
        <Briefcase size={20} className={exp.isCurrent ? 'animate-pulse' : ''} />
      </div>

      {/* Content Container */}
      <div className="relative pt-1">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 group-hover:translate-x-2 transition-transform duration-500">
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <div className="flex items-center gap-4 flex-wrap">
                <h4 className="font-display font-bold text-slate-900 text-2xl tracking-tight leading-tight italic">
                  {exp.position || 'Posisi Belum Ditentukan'}
                </h4>
                {exp.isCurrent && (
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-slate-200">
                    Aktif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
                <span className="text-slate-900">{exp.company}</span>
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="italic font-medium">{dateStr}</span>
              </div>
            </div>

            {exp.description && (
              <div 
                className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium opacity-80 italic max-w-2xl"
                dangerouslySetInnerHTML={{ __html: stripHtml(exp.description) }}
              />
            )}
          </div>

          {/* Action HUD - Appears on Hover */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1.5 shadow-premium">
              <button 
                type="button" 
                onClick={onMoveUp} 
                disabled={index === 0}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-400 hover:text-slate-900"
              >
                <ChevronUp size={18} />
              </button>
              <button 
                type="button" 
                onClick={onMoveDown} 
                disabled={index === total - 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-400 hover:text-slate-900"
              >
                <ChevronDown size={18} />
              </button>
              <div className="w-px h-6 bg-slate-100 mx-1" />
              <button 
                type="button" 
                onClick={onEdit}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
              >
                <Pencil size={18} />
              </button>
              <button 
                type="button" 
                onClick={onDelete}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Experience Form ────────────────────────────────────────────
const EXP_TYPES = [
  { value: 'fulltime',    label: '💼 Penuh Waktu' },
  { value: 'internship',  label: '🎓 Magang' },
  { value: 'parttime',    label: '⏰ Paruh Waktu' },
  { value: 'freelance',   label: '🖥️ Lepas Waktu (Freelance)' },
  { value: 'contract',    label: '📋 Kontrak' },
  { value: 'volunteer',   label: '🤝 Sukarelawan' },
];

function ExperienceEntryForm({ initial = null, onSave, onCancel }) {
  const isEdit = !!initial;
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initial || {
      position: '', company: '', type: 'fulltime',
      startDate: '', endDate: '', isCurrent: false, description: '',
    },
  });

  const isCurrent = watch('isCurrent');
  const [desc, setDesc] = useState(initial?.description || '');

  const onSubmit = (data) => {
    onSave({ ...data, description: desc, id: initial?.id || Date.now().toString() });
  };

  const inputCls = (hasErr) => 
    `w-full px-6 py-4.5 rounded-2xl bg-white border transition-all outline-none font-semibold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-medium
     ${hasErr ? 'border-rose-100 bg-rose-50/10 focus:border-rose-300' : 'border-slate-50 focus:border-slate-900 focus:shadow-premium'}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-50/50 border border-slate-100 rounded-[3rem] p-10 sm:p-14 space-y-12 relative overflow-hidden"
    >
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm relative overflow-hidden group/case">
               <Briefcase size={26} className="z-10 group-hover/case:scale-110 transition-transform duration-500" />
               <div className="absolute inset-x-0 -bottom-1 h-1 bg-slate-900/10" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-3xl tracking-tight italic">
                {isEdit ? 'Sunting Pengalaman' : 'Tambah Pengalaman Baru'}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-2">
                {isEdit ? 'Memperbarui rekam jejak karier' : 'Menambahkan kompetensi profesional baru'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Jabatan / Posisi</label>
          <input
            placeholder="misal: Desainer Strategis Senior"
            {...register('position', { required: 'Wajib diisi' })}
            className={inputCls(errors.position)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Nama Instansi / Perusahaan</label>
          <input
            placeholder="misal: Korporasi Teknologi Global"
            {...register('company', { required: 'Wajib diisi' })}
            className={inputCls(errors.company)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Tipe Pekerjaan</label>
          <select {...register('type')} className={inputCls(false)}>
            {EXP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Tanggal Mulai</label>
            <input
              type="month"
              {...register('startDate', { required: 'Wajib diisi' })}
              className={inputCls(errors.startDate)}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Tanggal Selesai</label>
            <input
              type="month"
              disabled={isCurrent}
              {...register('endDate')}
              className={`${inputCls(false)} ${isCurrent ? 'opacity-30 bg-white/40 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div className="sm:col-span-2 px-2">
           <label className="inline-flex items-center gap-4 cursor-pointer group">
            <div className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${isCurrent ? 'bg-slate-900 border-slate-900 shadow-lg shadow-slate-200' : 'border-slate-200 bg-white group-hover:border-slate-400'}`}>
               <input
                type="checkbox"
                className="sr-only"
                {...register('isCurrent')}
                onChange={(e) => {
                  setValue('isCurrent', e.target.checked);
                  if (e.target.checked) setValue('endDate', '');
                }}
              />
              {isCurrent && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
            <span className="text-[13px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-widest">Status Aktif: Saya sedang bekerja di sini</span>
          </label>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Dampak & Kontribusi Utama</label>
          <MagicWriter 
            type="Experience Description"
            content={desc}
            onApply={setDesc}
          />
        </div>
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden focus-within:border-slate-900 transition-all shadow-sm hover:shadow-md duration-500">
          <RichEditor
            label={null}
            value={desc}
            onChange={setDesc}
            placeholder={`• Architected a solution that scaled performance by 300%.\n• Orchestrated cross-functional teams to deliver $2M in value.\n• Optimized neural workflows reducing operational friction.`}
            minHeight={180}
            maxLength={3000}
          />
        </div>
        
        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-start gap-6">
           <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800 border border-slate-100 shrink-0">
             <Zap size={20} className="fill-slate-900 opacity-20" />
           </div>
           <div className="space-y-1">
             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900">Optimasi Semantik Konten</p>
             <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
               Mencatat dampak yang terukur (metrik kuantitatif) secara signifikan meningkatkan relevansi profil Anda bagi sistem seleksi otomatis (ATS).
             </p>
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-6 justify-end pt-10 border-t border-slate-100">
        <button 
          type="button"
          onClick={onCancel}
          className="px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors"
        >
          Batalkan
        </button>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-300 hover:bg-black transition-all active:scale-95 text-[11px] font-bold uppercase tracking-[0.3em]"
        >
          {isEdit ? 'Simpan Perubahan' : 'Simpan Pengalaman'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Export ────────────────────────────────────────────────
export default function ExperienceForm({ onNext, onBack }) {
  const { cvData, addExperience, updateExperience, removeExperience, reorderExperiences } = useCVStore();
  const { experiences } = cvData;

  const [showForm, setShowForm]    = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const handleSave = (data) => {
    if (editTarget) {
      updateExperience(editTarget.id, data);
      setEditTarget(null);
    } else {
      addExperience(data);
    }
    setShowForm(false);
  };

  const handleEdit = (exp) => {
    setEditTarget(exp);
    setShowForm(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newList = [...experiences];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    reorderExperiences(newList);
  };
  const handleMoveDown = (index) => {
    if (index === experiences.length - 1) return;
    const newList = [...experiences];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    reorderExperiences(newList);
  };

  return (
    <div className="animate-fade-up space-y-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
               <Briefcase size={28} className="group-hover:scale-110 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Step 03</span>
               <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic text-left">
                 Professional <span className="text-slate-400">Inventory</span>
               </h2>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-xl leading-relaxed italic px-2">
            Arsip kronologi keterlibatan profesional, magang, dan inisiatif strategis Anda.
          </p>
        </div>

        {experiences.length > 0 && !showForm && !editTarget && (
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-4 px-8 py-4 rounded-2xl border border-slate-100 hover:border-slate-900 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 transition-all shadow-sm group shrink-0"
          >
            <Plus size={16} className="text-slate-900 group-hover:rotate-90 transition-transform" />
            Tambah Pengalaman
          </button>
        )}
      </div>

      {/* Inline Form */}
      {(showForm || editTarget) && (
        <div className="animate-fade-in">
          <ExperienceEntryForm 
            initial={editTarget} 
            onSave={handleSave} 
            onCancel={() => { setShowForm(false); setEditTarget(null); }} 
          />
        </div>
      )}

      {/* List / Empty */}
      {!editTarget && !showForm && (
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {experiences.length === 0 ? (
              <EmptyExperience key="empty" onAdd={() => setShowForm(true)} />
            ) : (
              <div className="space-y-8">
                {experiences.map((exp, i) => (
                  <ExperienceCard
                    key={exp.id}
                    exp={exp}
                    index={i}
                    total={experiences.length}
                    onEdit={() => handleEdit(exp)}
                    onDelete={() => removeExperience(exp.id)}
                    onMoveUp={() => handleMoveUp(i)}
                    onMoveDown={() => handleMoveDown(i)}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full py-16 border border-dashed border-slate-200 rounded-[3rem] bg-slate-50/30 text-slate-400 hover:border-slate-900 hover:text-slate-900 hover:bg-white transition-all flex flex-col items-center justify-center gap-4 group shadow-sm hover:shadow-premium duration-700"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 group-hover:border-slate-300 flex items-center justify-center transition-all shadow-sm">
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-60 group-hover:opacity-100">Tambahkan Pengalaman Selanjutnya</span>
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Metadata Tip */}
      {!showForm && !editTarget && (
        <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-800 shadow-sm">
               <Info size={20} />
             </div>
             <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-500 italic">Saran Struktural</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 px-4">
            <div className="flex gap-5">
               <div className="w-2 h-2 rounded-full bg-slate-900 mt-2 shrink-0" />
               <p className="text-sm font-medium text-slate-400 leading-relaxed italic">Fokus pada 3-5 poin pencapaian per peran untuk menjaga densitas informasi yang optimal bagi kurator digital.</p>
            </div>
            <div className="flex gap-5">
               <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0" />
               <p className="text-sm font-medium text-slate-400 leading-relaxed italic">Gunakan reverse chronological order. Milestone terbaru harus menempati hierarki visual tertinggi.</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {!showForm && !editTarget && (
        <div className="flex justify-between items-center pt-12 border-t border-slate-100 mt-8">
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
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">Inisialisasi Tahap 04</span>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
