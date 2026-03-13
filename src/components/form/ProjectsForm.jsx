// src/components/form/ProjectsForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Rocket, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, LayoutGrid, Terminal, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Link as LinkIcon
} from 'lucide-react';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import MagicWriter from '../ui/MagicWriter';
import useCVStore from '../../store/useCVStore';

function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <div className="entry-card group animate-fade-up">
      <div className="entry-card-icon">
        <Rocket className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm truncate">{project.name || '—'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate">{project.techStack}</span>
            </div>
            {project.link && (
              <div className="flex items-center gap-1.5 mt-1 text-blue-500 hover:underline cursor-pointer">
                <LinkIcon className="w-3 h-3" />
                <span className="text-[10px] font-medium truncate">{project.link}</span>
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

function ProjectEntryForm({ initial = null, onSave, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initial || { name: '', description: '', techStack: '', link: '' }
  });
  const [desc, setDesc] = useState(initial?.description || '');

  const onSubmit = (data) => {
    onSave({ ...data, description: desc, id: initial?.id || Date.now().toString() });
  };

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 space-y-4 animate-scale-in">
      <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
        <Rocket className="w-4 h-4 text-blue-600" />
        {initial ? 'Edit Proyek' : 'Tambah Proyek Baru'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="form-label">Nama Proyek <span className="text-red-500">*</span></label>
          <input {...register('name', { required: 'Nama proyek wajib diisi' })} className="form-input" placeholder="CV ATS Builder" />
        </div>
        <div className="space-y-1.5">
          <label className="form-label">Tech Stack <span className="text-red-500">*</span></label>
          <input {...register('techStack', { required: 'Tech stack wajib diisi' })} className="form-input" placeholder="React, Node.js, Tailwind" />
        </div>
        <div className="col-span-1 sm:col-span-2 space-y-1.5">
          <label className="form-label">Link Proyek (GitHub/Demo)</label>
          <input {...register('link')} className="form-input" placeholder="https://github.com/..." />
        </div>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label !mb-0">Deskripsi Singkat</label>
          <MagicWriter 
            type="Project"
            content={desc}
            onApply={setDesc}
          />
        </div>
        <RichEditor
          label={null}
          value={desc}
          onChange={setDesc}
          placeholder="Deskripsikan fitur atau peran kamu dalam proyek ini..."
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

export default function ProjectsForm({ onNext, onBack }) {
  const { cvData, addProject, updateProject, removeProject } = useCVStore();
  const { projects = [] } = cvData;
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const handleSave = (data) => {
    if (editTarget) updateProject(editTarget.id, data);
    else addProject(data);
    setShowForm(false); setEditTarget(null);
  };

  return (
    <div className="animate-fade-up">
      <div className="section-header">
        <div className="section-icon">
          <Rocket className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-xl font-bold text-slate-900">Proyek</h2>
          <p className="text-sm text-slate-500">Karya atau proyek yang pernah dikerjakan</p>
        </div>
        {!showForm && !editTarget && (
          <Button size="sm" onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>Tambah</Button>
        )}
      </div>

      {(showForm || editTarget) ? (
        <ProjectEntryForm initial={editTarget} onSave={handleSave} onCancel={() => { setShowForm(false); setEditTarget(null); }} />
      ) : (
        <div className="space-y-3 mb-5">
          {projects.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm italic">Belum ada proyek.</div>
          ) : (
            projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} onEdit={() => setEditTarget(p)} onDelete={() => removeProject(p.id)} />
            ))
          )}
          {!showForm && !editTarget && (
            <button type="button" onClick={() => setShowForm(true)} className="btn-add-dashed">
              <Plus className="w-5 h-5" /> TAMBAH PROYEK LAGI
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-blue-50">
        <Button variant="secondary" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>Kembali</Button>
        <Button onClick={onNext} rightIcon={<ChevronRight className="w-4 h-4" />}>Lanjut: Organisasi</Button>
      </div>
    </div>
  );
}
