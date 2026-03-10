// src/components/form/CertificationsForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Award, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, Building2, Calendar, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Link as LinkIcon
} from 'lucide-react';
import Button from '../ui/Button';
import useCVStore from '../../store/useCVStore';

function CertCard({ cert, index, total, onEdit, onDelete }) {
  return (
    <div className="entry-card group animate-fade-up">
      <div className="entry-card-icon">
        <Award className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">{cert.name || '—'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-slate-600 truncate">{cert.issuer}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-400">{cert.year}</span>
            </div>
            {cert.link && (
              <div className="flex items-center gap-1.5 mt-1 text-blue-500 hover:underline cursor-pointer">
                <LinkIcon className="w-3 h-3" />
                <span className="text-[10px] font-medium truncate">{cert.link}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button type="button" onClick={onEdit} className="btn btn-secondary btn-icon w-8 h-8"><Pencil className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={onDelete} className="btn btn-ghost btn-icon w-8 h-8 text-red-400 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CertEntryForm({ initial = null, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || { name: '', issuer: '', year: '', link: '' }
  });

  const onSubmit = (data) => {
    onSave({ ...data, id: initial?.id || Date.now().toString() });
  };

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4 animate-scale-in">
      <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
        <Award className="w-4 h-4 text-blue-600" />
        {initial ? 'Edit Sertifikasi' : 'Tambah Sertifikasi'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="form-label">Nama Sertifikat <span className="text-red-500">*</span></label>
          <input {...register('name', { required: 'Nama wajib diisi' })} className="form-input" placeholder="Google UX Design Professional" />
        </div>
        <div className="space-y-1.5">
          <label className="form-label">Lembaga Penerbit <span className="text-red-500">*</span></label>
          <input {...register('issuer', { required: 'Lembaga wajib diisi' })} className="form-input" placeholder="Coursera / Google" />
        </div>
        <div className="space-y-1.5">
          <label className="form-label">Tahun Setifikat <span className="text-red-500">*</span></label>
          <input {...register('year', { required: 'Tahun wajib diisi' })} className="form-input" placeholder="2024" />
        </div>
        <div className="space-y-1.5">
          <label className="form-label">Link Verifikasi (Opsional)</label>
          <input {...register('link')} className="form-input" placeholder="https://..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Batal</Button>
        <Button size="sm" onClick={handleSubmit(onSubmit)}>Simpan</Button>
      </div>
    </div>
  );
}

export default function CertificationsForm({ onNext, onBack }) {
  const { cvData, addCertification, updateCertification, removeCertification } = useCVStore();
  const { certifications = [] } = cvData;
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const handleSave = (data) => {
    if (editTarget) updateCertification(editTarget.id, data);
    else addCertification(data);
    setShowForm(false); setEditTarget(null);
  };

  return (
    <div className="animate-fade-up">
      <div className="section-header">
        <div className="section-icon">
          <Award className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-xl font-bold text-slate-900">Sertifikasi</h2>
          <p className="text-sm text-slate-500">Lisensi dan sertifikat profesional</p>
        </div>
        {!showForm && !editTarget && (
          <Button size="sm" onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>Tambah</Button>
        )}
      </div>

      {(showForm || editTarget) ? (
        <CertEntryForm initial={editTarget} onSave={handleSave} onCancel={() => { setShowForm(false); setEditTarget(null); }} />
      ) : (
        <div className="space-y-3 mb-5">
          {certifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm italic">Belum ada sertifikasi.</div>
          ) : (
            certifications.map((c, i) => (
              <CertCard key={c.id} cert={c} onEdit={() => setEditTarget(c)} onDelete={() => removeCertification(c.id)} />
            ))
          )}
          {!showForm && !editTarget && (
            <button type="button" onClick={() => setShowForm(true)} className="btn-add-dashed">
              <Plus className="w-5 h-5" /> TAMBAH SERTIFIKAT LAGI
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-blue-50">
        <Button variant="secondary" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>Kembali</Button>
        <Button onClick={onNext} rightIcon={<ChevronRight className="w-4 h-4" />}>Lanjut: Proyek</Button>
      </div>
    </div>
  );
}
