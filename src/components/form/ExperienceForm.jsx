// src/components/form/ExperienceForm.jsx
// Step 2 — Work Experience / Magang (Modern Blue UI + TipTap)

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Briefcase, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, Building2, Calendar, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Info
} from 'lucide-react';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
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
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center mb-4">
        <Briefcase className="w-7 h-7 text-blue-300" />
      </div>
      <p className="font-semibold text-slate-800 mb-1">Belum ada pengalaman kerja</p>
      <p className="text-sm text-slate-500 mb-1">
        Belum punya pengalaman kerja? <strong>Magang / internship</strong> juga bisa ditambahkan!
      </p>
      <p className="text-xs text-slate-400 mb-5">Freelance, voluntary, dan part-time juga diterima oleh kebanyakan ATS.</p>
      <Button onClick={onAdd} leftIcon={<Plus className="w-4 h-4" />} size="sm">
        Tambah Pengalaman
      </Button>
    </div>
  );
}

// ── Entry card ────────────────────────────────────────────────
function ExperienceCard({ exp, index, total, onEdit, onDelete, onMoveUp, onMoveDown }) {
  const dateStr = exp.isCurrent
    ? `${fmtDate(exp.startDate)} – Sekarang`
    : `${fmtDate(exp.startDate)}${exp.endDate ? ` – ${fmtDate(exp.endDate)}` : ''}`;

  return (
    <div className="entry-card flex gap-3 group animate-fade-up">
      {/* Drag handle / order buttons */}
      <div className="flex flex-col items-center gap-0.5 pt-0.5 entry-card-actions">
        <button type="button" onClick={onMoveUp} disabled={index === 0}
          className="btn btn-ghost btn-icon p-0.5 disabled:opacity-20" title="Pindah ke atas">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <GripVertical className="w-4 h-4 text-slate-300" />
        <button type="button" onClick={onMoveDown} disabled={index === total - 1}
          className="btn btn-ghost btn-icon p-0.5 disabled:opacity-20" title="Pindah ke bawah">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-sm truncate">{exp.position || '—'}</h4>
              {exp.isCurrent && (
                <span className="badge badge-blue text-[10px] flex-shrink-0">Saat ini</span>
              )}
              {exp.type === 'internship' && (
                <span className="badge badge-purple text-[10px] flex-shrink-0">Magang</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-slate-600 truncate">{exp.company}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-400">{dateStr}</span>
            </div>
            {exp.description && (
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                {stripHtml(exp.description)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <button type="button" onClick={onEdit}
              className="btn btn-secondary btn-icon w-8 h-8" title="Edit">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onDelete}
              className="btn btn-ghost btn-icon w-8 h-8 text-red-400 hover:bg-red-50" title="Hapus">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
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
    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4 animate-scale-in">
      <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-blue-600" />
        {isEdit ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
      </h3>

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

      {/* Description TipTap */}
      <RichEditor
        label="Deskripsi Pekerjaan / Pencapaian"
        value={desc}
        onChange={setDesc}
        placeholder="• Kembangkan fitur X menggunakan React yang meningkatkan konversi 15%&#10;• Kelola tim 3 developer dan deliver sprint tepat waktu&#10;• Implementasi CI/CD pipeline, memangkas waktu deploy dari 30 menit → 5 menit"
        minHeight={130}
        maxLength={1500}
        helper="Gunakan bullet points. Sertakan angka/metric jika ada untuk meningkatkan ATS score."
      />

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
    </div>
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
        <>
          {experiences.length === 0 && !showForm ? (
            <EmptyExperience onAdd={() => setShowForm(true)} />
          ) : (
            <div className="space-y-3 mb-5">
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
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-sm text-blue-500 font-medium hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Tambah Pengalaman Lagi
                </button>
              )}
            </div>
          )}
        </>
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
