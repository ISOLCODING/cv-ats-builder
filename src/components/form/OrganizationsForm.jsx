// src/components/form/OrganizationsForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Users, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, Building2, Calendar, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Award
} from 'lucide-react';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import MagicWriter from '../ui/MagicWriter';
import useCVStore from '../../store/useCVStore';

function OrgCard({ org, onEdit, onDelete }) {
  return (
    <div className="entry-card group animate-fade-up">
      <div className="entry-card-icon">
        <Users className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">{org.name || '—'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Award className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate">{org.role}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] font-medium">{org.period}</span>
            </div>
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

function OrgEntryForm({ initial = null, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || { name: '', role: '', period: '', contribution: '' }
  });
  const [desc, setDesc] = useState(initial?.contribution || '');

  const onSubmit = (data) => {
    onSave({ ...data, contribution: desc, id: initial?.id || Date.now().toString() });
  };

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4 animate-scale-in">
      <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-600" />
        {initial ? 'Edit Organisasi' : 'Tambah Organisasi baru'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="form-label">Nama Organisasi <span className="text-red-500">*</span></label>
          <input {...register('name', { required: 'Nama organisasi wajib diisi' })} className="form-input" placeholder="Himpunan Mahasiswa" />
        </div>
        <div className="space-y-1.5">
          <label className="form-label">Jabatan / Role <span className="text-red-500">*</span></label>
          <input {...register('role', { required: 'Jabatan wajib diisi' })} className="form-input" placeholder="Ketua / Staff" />
        </div>
        <div className="col-span-1 sm:col-span-2 space-y-1.5">
          <label className="form-label">Periode <span className="text-red-500">*</span></label>
          <input {...register('period', { required: 'Periode wajib diisi' })} className="form-input" placeholder="2022 - 2023" />
        </div>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label !mb-0">Kontribusi / Pencapaian</label>
          <MagicWriter 
            type="Organization"
            content={desc}
            onApply={setDesc}
          />
        </div>
        <RichEditor
          label={null}
          value={desc}
          onChange={setDesc}
          placeholder="Deskripsikan apa yang kamu kerjakan..."
          minHeight={100}
        />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel}>Batal</Button>
        <Button size="sm" onClick={handleSubmit(onSubmit)}>Simpan</Button>
      </div>
    </div>
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

  return (
    <div className="animate-fade-up">
      <div className="section-header">
        <div className="section-icon">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-xl font-bold text-slate-900">Organisasi</h2>
          <p className="text-sm text-slate-500">Pengalaman berorganisasi dan kepemimpinan</p>
        </div>
        {!showForm && !editTarget && (
          <Button size="sm" onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>Tambah</Button>
        )}
      </div>

      {(showForm || editTarget) ? (
        <OrgEntryForm initial={editTarget} onSave={handleSave} onCancel={() => { setShowForm(false); setEditTarget(null); }} />
      ) : (
        <div className="space-y-3 mb-5">
          {organizations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm italic">Belum ada data organisasi.</div>
          ) : (
            organizations.map((o, i) => (
              <OrgCard key={o.id} org={o} onEdit={() => setEditTarget(o)} onDelete={() => removeOrganization(o.id)} />
            ))
          )}
          {!showForm && !editTarget && (
            <button type="button" onClick={() => setShowForm(true)} className="btn-add-dashed">
              <Plus className="w-5 h-5" /> TAMBAH ORGANISASI LAGI
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-blue-50">
        <Button variant="secondary" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>Kembali</Button>
        <Button onClick={onNext} rightIcon={<ChevronRight className="w-4 h-4" />}>Lanjut: Summary</Button>
      </div>
    </div>
  );
}
