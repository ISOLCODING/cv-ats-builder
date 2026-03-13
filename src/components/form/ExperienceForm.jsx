// src/components/form/ExperienceForm.jsx
// Step 2 — Work Experience / Magang (Modern Blue UI + TipTap)

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Briefcase, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, Building2, Calendar, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Info
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
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

// Strip HTML tags dari TipTap content untuk keperluan display
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
}

// ── Empty state ───────────────────────────────────────────────
function EmptyExperience({ onAdd }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center glass-card border-dashed border-2 border-slate-200"
    >
      <div className="w-20 h-20 rounded-3xl bg-blue-50/50 flex items-center justify-center mb-6 shadow-inner">
        <Briefcase className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="font-display font-bold text-slate-800 text-lg mb-2">Belum ada pengalaman kerja</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        Belum punya pengalaman kerja? <span className="text-blue-600 font-semibold">Magang / internship</span> juga bisa ditambahkan untuk memperkuat profil Anda di mata recruiter.
      </p>
      <Button 
        onClick={onAdd} 
        variant="primary"
        className="shadow-lg shadow-blue-200"
        leftIcon={<Plus className="w-4 h-4" />}
      >
        Tambah Pengalaman Pertama
      </Button>
    </motion.div>
  );
}

// ── Entry card ────────────────────────────────────────────────
function ExperienceCard({ exp, index, total, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const dateStr = exp.isCurrent
    ? `${fmtDate(exp.startDate)} – Sekarang`
    : `${fmtDate(exp.startDate)}${exp.endDate ? ` – ${fmtDate(exp.endDate)}` : ''}`;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card group relative p-4 sm:p-5 hover:border-blue-300 transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Sorting Controls - Hidden on mobile, shown as drag handle maybe? For now just keep buttons */}
        <div className="hidden sm:flex flex-col items-center gap-1 self-start pt-1">
          <button 
            type="button" 
            onClick={onMoveUp} 
            disabled={index === 0}
            className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-20 transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-slate-400" />
          </button>
          <div className="w-px h-8 bg-slate-100" />
          <button 
            type="button" 
            onClick={onMoveDown} 
            disabled={index === total - 1}
            className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-20 transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-display font-bold text-slate-900 text-base leading-tight">
                  {exp.position || '—'}
                </h4>
                <div className="flex gap-1.5">
                  {exp.isCurrent && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">
                      Active
                    </span>
                  )}
                  {exp.type === 'internship' && (
                    <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-100">
                      Intern
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">{exp.company}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dateStr}</span>
                </div>
              </div>

              {exp.description && (
                <div 
                  className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: stripHtml(exp.description) }}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 self-end sm:self-start bg-slate-50/50 p-1 rounded-xl border border-slate-100">
              <button 
                type="button" 
                onClick={onEdit}
                className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button 
                type="button" 
                onClick={onDelete}
                className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
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
  { value: 'fulltime',    label: '💼 Full-time' },
  { value: 'internship',  label: '🎓 Magang / Internship' },
  { value: 'parttime',    label: '⏰ Part-time' },
  { value: 'freelance',   label: '🖥️ Freelance' },
  { value: 'contract',    label: '📋 Kontrak' },
  { value: 'volunteer',   label: '🤝 Volunteer' },
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-50/40 border border-blue-100 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Briefcase className="w-24 h-24 text-blue-900" />
      </div>

      <div className="relative">
        <h3 className="font-display font-bold text-blue-900 text-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Briefcase className="w-4 h-4" />
          </div>
          {isEdit ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Posisi */}
        <div className="space-y-1.5">
          <label className="form-label">Posisi / Jabatan <span className="text-red-500">*</span></label>
          <input
            placeholder="Contoh: Frontend Developer, Intern Data Analyst"
            {...register('position', { required: 'Posisi wajib diisi' })}
            className={`form-input ${errors.position ? 'form-input-error' : ''}`}
          />
          {errors.position && <p className="form-error">{errors.position.message}</p>}
        </div>

        {/* Perusahaan */}
        <div className="space-y-1.5">
          <label className="form-label">Nama Perusahaan / Institusi <span className="text-red-500">*</span></label>
          <input
            placeholder="PT. Example Indonesia"
            {...register('company', { required: 'Perusahaan wajib diisi' })}
            className={`form-input ${errors.company ? 'form-input-error' : ''}`}
          />
          {errors.company && <p className="form-error">{errors.company.message}</p>}
        </div>

        {/* Tipe */}
        <div className="space-y-1.5">
          <label className="form-label">Tipe Pekerjaan</label>
          <select {...register('type')} className="form-input">
            {EXP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Empty col */}
        <div />

        {/* Start date */}
        <div className="space-y-1.5">
          <label className="form-label">Tanggal Mulai <span className="text-red-500">*</span></label>
          <input
            type="month"
            {...register('startDate', { required: 'Tanggal mulai wajib diisi' })}
            className={`form-input ${errors.startDate ? 'form-input-error' : ''}`}
          />
          {errors.startDate && <p className="form-error">{errors.startDate.message}</p>}
        </div>

        {/* End date / isCurrent */}
        <div className="space-y-1.5">
          <label className="form-label">Tanggal Selesai</label>
          <input
            type="month"
            disabled={isCurrent}
            {...register('endDate')}
            className={`form-input ${isCurrent ? 'opacity-40 bg-slate-50' : ''}`}
          />
          <label className="flex items-center gap-2 cursor-pointer mt-1.5">
            <input
              type="checkbox"
              className="modern-check"
              {...register('isCurrent')}
              onChange={(e) => {
                setValue('isCurrent', e.target.checked);
                if (e.target.checked) setValue('endDate', '');
              }}
            />
            <span className="text-xs font-medium text-slate-600">Masih bekerja di sini</span>
          </label>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label !mb-0">Deskripsi Pekerjaan / Pencapaian</label>
          <MagicWriter 
            type="Experience Description"
            content={desc}
            onApply={setDesc}
          />
        </div>
        <RichEditor
          label={null}
          value={desc}
          onChange={setDesc}
          placeholder="• Kembangkan fitur X menggunakan React yang meningkatkan konversi 15%&#10;• Kelola tim 3 developer dan deliver sprint tepat waktu&#10;• Implementasi CI/CD pipeline, memangkas waktu deploy dari 30 menit → 5 menit"
          minHeight={130}
          maxLength={1500}
          helper="Gunakan bullet points. Sertakan angka/metric jika ada untuk meningkatkan ATS score."
        />
      </div>

      {/* Tip magang */}
      <div className="flex gap-2 p-3 bg-white rounded-xl border border-blue-100 text-xs text-blue-700">
        <Info className="w-4 h-4 flex-shrink-0 text-blue-400 mt-0.5" />
        <span>
          <strong>Belum punya pengalaman kerja?</strong> Magang, KKN, project kampus, atau volunteer 
          juga sangat dihargai ATS. Pilih tipe "Magang" atau "Volunteer" di atas.
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Batal</Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit(onSubmit)}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
        >
          {isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
        </Button>
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
    // Scroll ke atas
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
    <div className="animate-fade-up">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">Pengalaman Kerja</h2>
          <p className="text-sm text-slate-500">Termasuk magang, freelance, dan volunteer</p>
        </div>
        {experiences.length > 0 && !showForm && !editTarget && (
          <Button size="sm" onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah
          </Button>
        )}
      </div>

      {/* Inline form (new) */}
      {showForm && (
        <div className="mb-4">
          <ExperienceEntryForm onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Edit form */}
      {editTarget && (
        <div className="mb-4">
          <ExperienceEntryForm
            initial={editTarget}
            onSave={handleSave}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      )}

      {/* List / Empty */}
      {!editTarget && (
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {experiences.length === 0 && !showForm ? (
              <EmptyExperience key="empty" onAdd={() => setShowForm(true)} />
            ) : (
              <div className="space-y-4 mb-8">
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

                {!showForm && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-display font-bold text-sm tracking-wide group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    TAMBAH PENGALAMAN LAGI
                  </motion.button>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      {!showForm && !editTarget && (
        <div className="flex justify-between pt-4 border-t border-blue-50">
          <Button variant="secondary" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Kembali
          </Button>
          <Button onClick={onNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
            Lanjut: Pendidikan
          </Button>
        </div>
      )}
    </div>
  );
}
