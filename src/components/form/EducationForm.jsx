// src/components/form/EducationForm.jsx
// Step 3 — Education (Modern Blue UI + TipTap)

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  GraduationCap, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, BookOpen, Calendar, Award, CheckCircle2,
  ExternalLink, Link as LinkIcon, ChevronUp, ChevronDown, GripVertical,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import MagicWriter from '../ui/MagicWriter';
import useCVStore from '../../store/useCVStore';

function fmtDate(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return m ? `${months[+m - 1]} ${y}` : y;
}
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}

const DEGREES = [
  { value: 'SD',           label: '🏫 SD / Sekolah Dasar' },
  { value: 'SMP',          label: '🏫 SMP / Sekolah Menengah Pertama' },
  { value: 'SMA/SMK',      label: '🏫 SMA / SMK' },
  { value: 'D1',           label: '🎓 D1 – Diploma 1' },
  { value: 'D2',           label: '🎓 D2 – Diploma 2' },
  { value: 'D3',           label: '🎓 D3 – Diploma 3' },
  { value: 'D4',           label: '🎓 D4 – Sarjana Terapan' },
  { value: 'S1',           label: '🎓 S1 – Sarjana' },
  { value: 'S2',           label: '🔬 S2 – Magister' },
  { value: 'S3',           label: '🔬 S3 – Doktor' },
  { value: 'Sertifikasi',  label: '📜 Sertifikasi Profesional' },
  { value: 'Bootcamp',     label: '⚡ Bootcamp / Online Course' },
  { value: 'Lainnya',      label: '📁 Lainnya' },
];

// ── Empty state ───────────────────────────────────────────────
function EmptyEducation({ onAdd }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center glass-card border-dashed border-2 border-slate-200"
    >
      <div className="w-20 h-20 rounded-3xl bg-blue-50/50 flex items-center justify-center mb-6 shadow-inner">
        <GraduationCap className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="font-display font-bold text-slate-800 text-lg mb-2">Belum ada riwayat pendidikan</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        Pendidikan formal, bootcamp, atau kursus online dapat membantu recruiter memahami latar belakang akademis Anda.
      </p>
      <Button 
        onClick={onAdd} 
        variant="primary"
        className="shadow-lg shadow-blue-200"
        leftIcon={<Plus className="w-4 h-4" />}
      >
        Tambah Pendidikan
      </Button>
    </motion.div>
  );
}

// ── Education card ─────────────────────────────────────────────
function EducationCard({ edu, index, total, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const dateStr = `${fmtDate(edu.startDate)}${edu.endDate ? ` – ${fmtDate(edu.endDate)}` : ''}`;
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card group relative p-4 sm:p-5 hover:border-blue-300 transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Sorting Controls */}
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
              <h4 className="font-display font-bold text-slate-900 text-base leading-tight">
                {edu.degree}{edu.field && `, ${edu.field}`}
              </h4>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium">{edu.institution}</span>
                </div>
                {dateStr && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>
                )}
                {edu.gpa && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold">IPK: {edu.gpa}</span>
                  </div>
                )}
              </div>

              {edu.description && (
                <div 
                  className="text-xs text-slate-500 line-clamp-1 mt-2 leading-relaxed opacity-70"
                  dangerouslySetInnerHTML={{ __html: stripHtml(edu.description) }}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 self-end sm:self-start bg-slate-50/50 p-1 rounded-xl border border-slate-100">
              {edu.link && (
                <a 
                  href={edu.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2 rounded-lg text-blue-500 hover:bg-white hover:shadow-sm transition-all"
                  title="Lihat Kredential"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
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

// ── Education entry form ───────────────────────────────────────
function EducationEntryForm({ initial = null, onSave, onCancel }) {
  const isEdit = !!initial;
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: initial || {
      institution: '', degree: 'S1', field: '',
      startDate: '', endDate: '', gpa: '', description: '',
      link: '',
    },
  });

  const selectedDegree = watch('degree');
  const isNonFormal = selectedDegree === 'Bootcamp' || selectedDegree === 'Sertifikasi';

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
        <GraduationCap className="w-24 h-24 text-blue-900" />
      </div>

      <div className="relative">
        <h3 className="font-display font-bold text-blue-900 text-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <GraduationCap className="w-4 h-4" />
          </div>
          {isEdit ? 'Edit Pendidikan' : 'Tambah Pendidikan Baru'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Jenjang */}
        <div className="space-y-1.5">
          <label className="form-label">Jenjang Pendidikan <span className="text-red-500">*</span></label>
          <select {...register('degree', { required: true })} className="form-input">
            {DEGREES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Field of study */}
        <div className="space-y-1.5">
          <label className="form-label">
            {isNonFormal ? 'Bidang Keahlian / Program' : 'Jurusan / Bidang Studi'}
          </label>
          <input
            placeholder={isNonFormal ? 'Contoh: Fullstack Web, UX Design' : 'Teknik Informatika, Manajemen, dll.'}
            {...register('field')}
            className="form-input"
          />
        </div>

        {/* Institution */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="form-label">
            {isNonFormal ? 'Platform / Penyelenggara' : 'Nama Institusi'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <input
              placeholder={isNonFormal ? 'Contoh: Dicoding, Coursera, Udemy' : 'Universitas Indonesia, SMK Negeri 1, dll.'}
              {...register('institution', { required: 'Wajib diisi' })}
              className={`form-input pl-10 ${errors.institution ? 'form-input-error' : ''}`}
            />
          </div>
          {errors.institution && <p className="form-error">{errors.institution.message}</p>}
        </div>

        {/* Start date */}
        <div className="space-y-1.5">
          <label className="form-label">Tahun Masuk</label>
          <input type="month" {...register('startDate')} className="form-input" />
        </div>

        {/* End date */}
        <div className="space-y-1.5">
          <label className="form-label">Tahun Lulus (estimasi OK)</label>
          <input type="month" {...register('endDate')} className="form-input" />
        </div>

        {/* GPA */}
        <div className="space-y-1.5">
          <label className="form-label">
            {isNonFormal ? 'Skor / Predikat (Opsional)' : 'IPK / Nilai Akhir'}
          </label>
          <div className="relative">
            <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              placeholder={isNonFormal ? 'Contoh: 90 / Distinction' : '3.85'}
              {...register('gpa')}
              className="form-input pl-10"
            />
          </div>
          <p className="form-helper">
            {isNonFormal ? 'Skor ujian atau predikat kelulusan.' : 'Skala 4.0. Kosongkan jika tidak ingin ditampilkan.'}
          </p>
        </div>

        {/* Link Sertifikat (Only for non-formal) */}
        {isNonFormal && (
          <div className="space-y-1.5">
            <label className="form-label">Link Sertifikat (URL)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400" />
              <input
                placeholder="https://credential.com/..."
                {...register('link')}
                className="form-input pl-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Description TipTap */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label !mb-0">Deskripsi / Prestasi (opsional)</label>
          <MagicWriter 
            type="Education"
            content={desc}
            onApply={setDesc}
          />
        </div>
        <RichEditor
          label={null}
          value={desc}
          onChange={setDesc}
          placeholder="• Ketua Himpunan Mahasiswa Teknik Informatika 2022&#10;• Juara 2 Hackathon Nasional 2023&#10;• Thesis: Implementasi Machine Learning untuk Prediksi Churn"
          minHeight={100}
          maxLength={800}
          helper="Isi dengan prestasi, kegiatan organisasi, atau topik tugas akhir."
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Batal</Button>
        <Button type="button" size="sm" onClick={handleSubmit(onSubmit)}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}>
          {isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main Export ────────────────────────────────────────────────
export default function EducationForm({ onNext, onBack }) {
  const { cvData, addEducation, updateEducation, removeEducation, reorderEducation } = useCVStore();
  const { education } = cvData;
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget]  = useState(null);

  const handleSave = (data) => {
    if (editTarget) { updateEducation(editTarget.id, data); setEditTarget(null); }
    else { addEducation(data); }
    setShowForm(false);
  };
  const handleEdit = (edu) => { setEditTarget(edu); setShowForm(false); };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newList = [...education];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    reorderEducation(newList);
  };
  const handleMoveDown = (index) => {
    if (index === education.length - 1) return;
    const newList = [...education];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    reorderEducation(newList);
  };

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon">
          <GraduationCap className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">Riwayat Pendidikan</h2>
          <p className="text-sm text-slate-500">Pendidikan formal, bootcamp, dan sertifikasi</p>
        </div>
        {education.length > 0 && !showForm && !editTarget && (
          <Button size="sm" onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <EducationEntryForm onSave={handleSave} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {editTarget && (
        <div className="mb-4">
          <EducationEntryForm initial={editTarget} onSave={handleSave} onCancel={() => setEditTarget(null)} />
        </div>
      )}

      {!editTarget && (
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {education.length === 0 && !showForm ? (
              <EmptyEducation key="empty" onAdd={() => setShowForm(true)} />
            ) : (
              <div className="space-y-4 mb-8">
                {education.map((edu, i) => (
                  <EducationCard
                    key={edu.id}
                    edu={edu}
                    index={i}
                    total={education.length}
                    onEdit={() => handleEdit(edu)}
                    onDelete={() => removeEducation(edu.id)}
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
                    TAMBAH PENDIDIKAN LAGI
                  </motion.button>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!showForm && !editTarget && (
        <div className="flex justify-between pt-4 border-t border-blue-50">
          <Button variant="secondary" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Kembali
          </Button>
          <Button onClick={onNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
            Lanjut: Skills
          </Button>
        </div>
      )}
    </div>
  );
}
