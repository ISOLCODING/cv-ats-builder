import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Users, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, Building2, Calendar, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Award,
  Sparkles, ShieldCheck, UserCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import MagicWriter from '../ui/MagicWriter';
import useCVStore from '../../store/useCVStore';

function EmptyOrganizations({ onAdd }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-10 text-center bg-white border border-dashed border-slate-200 rounded-[3rem] hover:border-slate-400 transition-colors duration-700"
    >
      <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center mb-10 relative group-hover:scale-110 transition-transform duration-700">
        <Users className="w-10 h-10 text-slate-300" />
        <div className="absolute inset-x-0 -bottom-2 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
      <h3 className="text-3xl font-bold text-slate-900 tracking-tight font-display mb-4 italic">Belum Ada Aktivitas Kepemimpinan</h3>
      <p className="text-base font-medium text-slate-400 max-w-sm mb-12 leading-relaxed">
        Tunjukkan pengalaman organisasi, kerja sukarela, dan peran kepemimpinan yang mendemonstrasikan kerja sama tim dan inisiatif Anda.
      </p>
      <button 
        onClick={onAdd} 
        className="flex items-center gap-4 px-10 py-5 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-200 hover:bg-black transition-all font-bold text-[11px] uppercase tracking-[0.3em] active:scale-95"
      >
        <Plus size={18} />
        Inisialisasi Pengalaman
      </button>
    </motion.div>
  );
}

function OrgCard({ org, onEdit, onDelete }) {
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

      {/* Timeline Node Icon (Users/Leadership) */}
      <div className={`absolute left-0 md:left-5 top-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-4 border-white shadow-premium bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white group-hover:scale-110 group-active:scale-95`}>
        <Users size={20} />
      </div>

      {/* Content Container */}
      <div className="relative pt-1">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 group-hover:translate-x-2 transition-transform duration-500">
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <h4 className="font-display font-bold text-slate-900 text-2xl tracking-tight leading-tight italic">
                {org.name || 'Nama Organisasi'}
              </h4>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
                <span className="text-slate-900 uppercase tracking-wider">{org.role || 'Anggota'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="italic font-medium uppercase tracking-widest">{org.period || 'Tahun - Tahun'}</span>
              </div>
            </div>

            {org.contribution && (
              <div 
                className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium opacity-80 italic max-w-2xl prose-slate"
                dangerouslySetInnerHTML={{ __html: org.contribution }}
              />
            )}
          </div>

          {/* Action HUD - Appears on Hover */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1.5 shadow-premium">
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

function OrgEntryForm({ initial = null, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || { name: '', role: '', period: '', contribution: '' }
  });
  const [desc, setDesc] = useState(initial?.contribution || '');

  const onSubmit = (data) => {
    onSave({ ...data, contribution: desc, id: initial?.id || Date.now().toString() });
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
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm relative overflow-hidden group/award">
               <Users size={26} className="z-10 group-hover/award:scale-110 transition-transform duration-500" />
               <div className="absolute inset-x-0 -bottom-1 h-1 bg-slate-900/10" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-3xl tracking-tight italic">
                {initial ? 'Kalibrasi Pengalaman' : 'Entri Kepemimpinan Baru'}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-2">
                {initial ? 'Menyesuaikan legasi organisasi' : 'Mencatat dampak komunitas Anda'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Nama Organisasi</label>
          <input 
            {...register('name', { required: 'Required' })} 
            className={inputCls(errors.name)} 
            placeholder="e.g. Student Executive Board" 
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Peran / Jabatan Anda</label>
          <div className="relative group/field">
            <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/field:text-slate-900 transition-colors" />
            <input 
              {...register('role', { required: 'Required' })} 
              className={`${inputCls(errors.role)} pl-14`}
              placeholder="misal: Koordinator Utama" 
            />
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-2">Masa Jabatan</label>
          <div className="relative group/field">
            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/field:text-slate-900 transition-colors" />
            <input 
              {...register('period', { required: 'Required' })} 
              className={`${inputCls(errors.period)} pl-14`}
              placeholder="e.g. 2022 - 2023" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Kontribusi Utama</label>
           <MagicWriter 
             type="Organization"
             content={desc}
             onApply={setDesc}
           />
        </div>
        <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-premium transition-shadow duration-700">
          <RichEditor
            label={null}
            value={desc}
            onChange={setDesc}
            placeholder="Memimpin simposium tahunan untuk 500+ peserta..."
            minHeight={160}
          />
        </div>
      </div>

      <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex items-start gap-8">
         <div className="w-14 h-14 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-200">
           <Zap size={24} />
         </div>
         <div className="space-y-2">
           <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-900">Integritas Kepemimpinan</p>
           <p className="text-base text-slate-400 font-medium leading-relaxed italic">
             Pengalaman organisasi menunjukkan kemampuan kolaborasi dan inisiatif yang krusial bagi dinamika tim profesional.
           </p>
         </div>
      </div>

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
          {initial ? 'Perbarui Data' : 'Simpan Entri'}
        </button>
      </div>
    </motion.div>
  );
}

export default function OrganizationsForm({ onNext, onBack }) {
  const { cvData, addOrganization, updateOrganization, removeOrganization } = useCVStore();
  const { organizations = [] } = cvData;
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const handleSave = (data) => {
    if (editTarget) updateOrganization(editTarget.id, data);
    else addOrganization(data);
    setShowForm(false); setEditTarget(null);
  };

  const handleEdit = (o) => {
    setEditTarget(o);
    setShowForm(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  return (
    <div className="animate-fade-up space-y-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
               <Users size={28} className="group-hover:scale-110 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Step 08</span>
               <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic text-left">
                 Kepemimpinan & <span className="text-slate-400">Komunitas</span>
               </h2>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-xl leading-relaxed italic px-2">
            Tunjukkan pengalaman organisasi, kerja sukarela, dan peran kepemimpinan yang mendemonstrasikan inisiatif Anda.
          </p>
        </div>

        {!showForm && !editTarget && (
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-4 px-8 py-4 rounded-2xl border border-slate-100 hover:border-slate-900 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 transition-all shadow-sm group shrink-0"
          >
            <Plus size={16} className="text-slate-900 group-hover:rotate-90 transition-transform" />
            Tambah Arsip
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {(showForm || editTarget) ? (
          <OrgEntryForm 
            key="form"
            initial={editTarget} 
            onSave={handleSave} 
            onCancel={() => { setShowForm(false); setEditTarget(null); }} 
          />
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {organizations.length === 0 ? (
              <EmptyOrganizations onAdd={() => setShowForm(true)} />
            ) : (
              <div className="space-y-10">
                {organizations.map((o) => (
                  <OrgCard 
                    key={o.id} 
                    org={o} 
                    onEdit={() => handleEdit(o)} 
                    onDelete={() => removeOrganization(o.id)} 
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
                  <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-60 group-hover:opacity-100">Tambah Peran Kepemimpinan</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">Inisialisasi Tahap 09</span>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
