import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Rocket, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, LayoutGrid, Terminal, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Link as LinkIcon,
  Sparkles, ExternalLink, Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import MagicWriter from '../ui/MagicWriter';
import useCVStore from '../../store/useCVStore';

function EmptyProjects() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200"
    >
      <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mb-6 relative group">
        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full group-hover:scale-110 transition-transform duration-700" />
        <Rocket className="w-12 h-12 text-blue-500 relative z-10" />
      </div>
      <h3 className="text-2xl font-display font-black text-slate-800 mb-2">Portfolio Showcase</h3>
      <p className="text-slate-500 text-center max-w-sm text-sm leading-relaxed mb-8 font-medium">
        Highlight your best work, side projects, or open-source contributions to demonstrate your hands-on expertise.
      </p>
    </motion.div>
  );
}

function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group bg-white border border-slate-100 p-6 sm:p-8 rounded-[2.5rem] shadow-soft hover:shadow-2xl hover:border-blue-200 transition-all duration-500 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform duration-700" />
      
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-shrink-0 w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
          <Rocket className="w-8 h-8 text-white" />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-xl font-display font-black text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                {project.name || 'Untitled Masterpiece'}
              </h4>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 text-slate-600 border border-slate-200">
                  <Code2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{project.techStack || 'Various Technologies'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: '#eff6ff', color: '#2563eb' }}
                whileTap={{ scale: 0.9 }}
                onClick={onEdit}
                className="p-3 rounded-2xl bg-slate-50 text-slate-400 transition-all duration-300"
              >
                <Pencil className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: '#fff1f2', color: '#e11d48' }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-3 rounded-2xl bg-slate-50 text-slate-400 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {project.description && (
            <div 
              className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-3 prose prose-slate prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}

          {project.link && (
            <motion.a 
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 5 }}
              className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-display font-black text-[10px] uppercase tracking-widest pt-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Project Live
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-50/40 border border-blue-100 rounded-[3rem] p-6 sm:p-10 space-y-8 shadow-sm relative overflow-hidden"
    >
      <div className="absolute bottom-0 right-0 p-12 opacity-5">
        <LayoutGrid className="w-32 h-32 text-blue-500" />
      </div>

      <div className="relative">
        <h3 className="text-xl font-display font-black text-blue-950 flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Rocket className="w-6 h-6 text-blue-600" />
          </div>
          {initial ? 'Edit Masterpiece' : 'Launch New Project'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Project Name</label>
            <input 
              {...register('name', { required: 'Required' })} 
              className="form-input text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-14 rounded-2xl" 
              placeholder="e.g. AI-Powered CRM Dashboard" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tech Stack</label>
            <input 
              {...register('techStack', { required: 'Required' })} 
              className="form-input text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-14 rounded-2xl" 
              placeholder="e.g. Next.js, TypeScript, PostgreSQL" 
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Project URL / GitHub</label>
            <div className="relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                {...register('link')} 
                className="form-input pl-12 text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-14 rounded-2xl" 
                placeholder="https://github.com/username/project" 
              />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Project Narrative</label>
            <MagicWriter 
              type="Project"
              content={desc}
              onApply={setDesc}
            />
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-[2rem] border border-blue-100 overflow-hidden focus-within:border-blue-400 transition-all shadow-sm">
            <RichEditor
              label={null}
              value={desc}
              onChange={setDesc}
              placeholder="Architected the frontend using React 19 and implemented full-text search with..."
              minHeight={180}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-10 pt-8 border-t border-blue-100">
          <Button variant="secondary" onClick={onCancel} className="px-8">Discard</Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            className="px-10 shadow-xl shadow-blue-500/20"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Deploy Changes
          </Button>
        </div>
      </div>
    </motion.div>
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
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[2rem] bg-slate-900 shadow-2xl flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-500 group">
              <Rocket className="w-8 h-8 text-white group-hover:animate-bounce" />
            </div>
            <div>
              <h2 className="text-4xl font-display font-black text-slate-800 tracking-tight leading-none">Projects</h2>
              <p className="text-slate-500 font-medium font-display uppercase tracking-[0.3em] text-[10px] mt-2">Engineering excellence showcase</p>
            </div>
          </div>
          
          {!showForm && !editTarget && (
            <Button 
              onClick={() => setShowForm(true)} 
              variant="primary"
              className="hidden sm:flex shadow-2xl shadow-blue-500/20 px-8"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              New Project
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(showForm || editTarget) ? (
          <ProjectEntryForm 
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
            className="space-y-6"
          >
            {projects.length === 0 ? (
              <EmptyProjects />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {projects.map((p) => (
                  <ProjectCard 
                    key={p.id} 
                    project={p} 
                    onEdit={() => setEditTarget(p)} 
                    onDelete={() => removeProject(p.id)} 
                  />
                ))}
              </div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,1)', borderColor: '#2563eb' }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-4 py-8 rounded-[3rem] border-[3px] border-dashed border-slate-200 text-slate-400 font-display font-black uppercase tracking-[0.2em] text-[11px] hover:text-blue-600 transition-all duration-300"
            >
              <Plus className="w-6 h-6 animate-pulse" />
              Add Another Project Venture
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-10 border-t border-slate-100">
        <Button 
          variant="secondary" 
          onClick={onBack} 
          className="px-10 h-14 rounded-2xl"
          leftIcon={<ChevronLeft className="w-5 h-5" />}
        >
          Go Back
        </Button>
        <Button 
          onClick={onNext} 
          className="px-12 h-14 rounded-2xl shadow-xl shadow-blue-500/20"
          rightIcon={<ChevronRight className="w-5 h-5" />}
        >
          Continue: Organizations
        </Button>
      </div>
    </div>
  );
}
