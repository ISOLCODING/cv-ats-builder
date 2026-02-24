// src/components/form/EducationForm.jsx
// Step 3 — Education (Modern Blue UI + TipTap)

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  GraduationCap, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, BookOpen, Calendar, Award, CheckCircle2
} from 'lucide-react';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
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
  { value: 'D4/S1',        label: '🎓 D4 / S1 – Sarjana' },
  { value: 'S2',           label: '🔬 S2 – Magister' },
  { value: 'S3',           label: '🔬 S3 – Doktor' },
  { value: 'Sertifikasi',  label: '📜 Sertifikasi Profesional' },
  { value: 'Bootcamp',     label: '⚡ Bootcamp / Online Course' },
  { value: 'Lainnya',      label: '📁 Lainnya' },
];

// ── Empty state ───────────────────────────────────────────────
function EmptyEducation({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center mb-4">
        <GraduationCap className="w-7 h-7 text-blue-300" />
      </div>
      <p className="font-semibold text-slate-800 mb-1">Belum ada riwayat pendidikan</p>
      <p className="text-sm text-slate-500 mb-5">Tambahkan pendidikan formal maupun sertifikasi</p>
      <Button onClick={onAdd} leftIcon={<Plus className="w-4 h-4" />} size="sm">
        Tambah Pendidikan
      </Button>
    </div>
  );
}

// ── Education card ─────────────────────────────────────────────
function EducationCard({ edu, onEdit, onDelete }) {
  const dateStr = `${fmtDate(edu.startDate)}${edu.endDate ? ` – ${fmtDate(edu.endDate)}` : ''}`;
  return (
    <div className="entry-card flex gap-3 group animate-fade-up">
      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <GraduationCap className="w-4.5 h-4.5 text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {edu.degree}{edu.field && `, ${edu.field}`}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-slate-600 truncate">{edu.institution}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              {dateStr && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{dateStr}</span>
                </div>
              )}
              {edu.gpa && (
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-slate-500">IPK: <strong className="text-slate-700">{edu.gpa}</strong></span>
                </div>
              )}
            </div>
            {edu.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{stripHtml(edu.description)}</p>
            )}
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <button type="button" onClick={onEdit} className="btn btn-secondary btn-icon w-8 h-8">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onDelete} className="btn btn-ghost btn-icon w-8 h-8 text-red-400 hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Education entry form ───────────────────────────────────────
function EducationEntryForm({ initial = null, onSave, onCancel }) {
  const isEdit = !!initial;
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || {
      institution: '', degree: 'D4/S1', field: '',
      startDate: '', endDate: '', gpa: '', description: '',
    },
  });
  const [desc, setDesc] = useState(initial?.description || '');

  const onSubmit = (data) => {
    onSave({ ...data, description: desc, id: initial?.id || Date.now().toString() });
  };

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4 animate-scale-in">
      <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-blue-600" />
        {isEdit ? 'Edit Pendidikan' : 'Tambah Pendidikan Baru'}
      </h3>

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
          <label className="form-label">Jurusan / Bidang Studi</label>
          <input
            placeholder="Teknik Informatika, Manajemen, dll."
            {...register('field')}
            className="form-input"
          />
        </div>

        {/* Institution */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="form-label">Nama Institusi <span className="text-red-500">*</span></label>
          <div className="relative">
            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <input
              placeholder="Universitas Indonesia, SMK Negeri 1, Dicoding, dll."
              {...register('institution', { required: 'Institusi wajib diisi' })}
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
          <label className="form-label">IPK / Nilai Akhir</label>
          <div className="relative">
            <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="number"
              step="0.01"
              min="0" max="4"
              placeholder="3.85"
              {...register('gpa', {
                min: { value: 0, message: 'Minimal 0' },
                max: { value: 4, message: 'Skala 4.0' },
              })}
              className={`form-input pl-10 ${errors.gpa ? 'form-input-error' : ''}`}
            />
          </div>
          {errors.gpa && <p className="form-error">{errors.gpa.message}</p>}
          <p className="form-helper">Skala 4.0. Kosongkan jika tidak ingin ditampilkan.</p>
        </div>
      </div>

      {/* Description TipTap */}
      <RichEditor
        label="Deskripsi / Prestasi (opsional)"
        value={desc}
        onChange={setDesc}
        placeholder="• Ketua Himpunan Mahasiswa Teknik Informatika 2022&#10;• Juara 2 Hackathon Nasional 2023&#10;• Thesis: Implementasi Machine Learning untuk Prediksi Churn"
        minHeight={100}
        maxLength={800}
        helper="Isi dengan prestasi, kegiatan organisasi, atau topik tugas akhir."
      />

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Batal</Button>
        <Button type="button" size="sm" onClick={handleSubmit(onSubmit)}
          leftIcon={<CheckCircle2 className="w-4 h-4" />}>
          {isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
        </Button>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────
export default function EducationForm({ onNext, onBack }) {
  const { cvData, addEducation, updateEducation, removeEducation } = useCVStore();
  const { education } = cvData;
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget]  = useState(null);

  const handleSave = (data) => {
    if (editTarget) { updateEducation(editTarget.id, data); setEditTarget(null); }
    else { addEducation(data); }
    setShowForm(false);
  };
  const handleEdit = (edu) => { setEditTarget(edu); setShowForm(false); };

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
        <>
          {education.length === 0 && !showForm ? (
            <EmptyEducation onAdd={() => setShowForm(true)} />
          ) : (
            <div className="space-y-3 mb-5">
              {education.map((edu) => (
                <EducationCard
                  key={edu.id}
                  edu={edu}
                  onEdit={() => handleEdit(edu)}
                  onDelete={() => removeEducation(edu.id)}
                />
              ))}
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-sm text-blue-500 font-medium hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Tambah Pendidikan Lagi
                </button>
              )}
            </div>
          )}
        </>
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
