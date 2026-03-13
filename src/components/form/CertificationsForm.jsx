import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Award, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, Building2, Calendar, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Link as LinkIcon,
  ExternalLink, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import useCVStore from '../../store/useCVStore';

function EmptyCertifications() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200"
    >
      <div className="w-20 h-20 bg-white rounded-3xl shadow-soft flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full" />
        <Award className="w-10 h-10 text-blue-500 relative z-10" />
      </div>
      <h3 className="text-xl font-display font-black text-slate-800 mb-2">Professional Credentials</h3>
      <p className="text-slate-500 text-center max-w-sm text-sm leading-relaxed mb-8">
        Showcase your certifications and licenses to stand out to recruiters and pass ATS filters.
      </p>
    </motion.div>
  );
}

function CertCard({ cert, onEdit, onDelete }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group relative bg-white border border-slate-100 p-5 rounded-[2rem] shadow-soft hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20" />
      
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Award className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-display font-black text-slate-800 text-base leading-tight">
                {cert.name || 'Untitled Certification'}
              </h4>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{cert.issuer}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{cert.year}</span>
                </div>
              </div>

              {cert.link && (
                <motion.a 
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 2 }}
                  className="inline-flex items-center gap-1.5 mt-2.5 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest border-b border-blue-500/20 pb-0.5">Verify Document</span>
                </motion.a>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEdit}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-50/40 border border-blue-100 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles className="w-24 h-24 text-blue-500" />
      </div>

      <div className="relative">
        <h3 className="text-lg font-display font-black text-blue-900 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          {initial ? 'Update Credential' : 'Add New Certification'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Certification Name</label>
            <input 
              {...register('name', { required: 'Name is required' })} 
              className="form-input text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-12" 
              placeholder="e.g. AWS Certified Solutions Architect" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Issuing Organization</label>
            <input 
              {...register('issuer', { required: 'Issuer is required' })} 
              className="form-input text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-12" 
              placeholder="e.g. Amazon Web Services" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Date Issued / Year</label>
            <input 
              {...register('year', { required: 'Year is required' })} 
              className="form-input text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-12" 
              placeholder="e.g. 2024" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Verification URL (Optional)</label>
            <input 
              {...register('link')} 
              className="form-input text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-12" 
              placeholder="https://..." 
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-blue-100">
          <Button variant="secondary" onClick={onCancel} className="px-6">Cancel</Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            className="px-8 shadow-xl shadow-blue-500/20"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Credential
          </Button>
        </div>
      </div>
    </motion.div>
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-blue-600 shadow-xl shadow-blue-200 flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-black text-slate-800 tracking-tight">Certifications</h2>
              <p className="text-slate-500 font-medium font-display uppercase tracking-[0.2em] text-[10px]">Verify your elite status</p>
            </div>
          </div>
          
          {!showForm && !editTarget && (
            <Button 
              onClick={() => setShowForm(true)} 
              variant="primary"
              className="hidden sm:flex shadow-xl shadow-blue-500/20"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(showForm || editTarget) ? (
          <CertEntryForm 
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
            className="space-y-4"
          >
            {certifications.length === 0 ? (
              <EmptyCertifications />
            ) : (
              certifications.map((c) => (
                <CertCard 
                  key={c.id} 
                  cert={c} 
                  onEdit={() => setEditTarget(c)} 
                  onDelete={() => removeCertification(c.id)} 
                />
              ))
            )}
            
            <motion.button 
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,1)' }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-3 py-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 font-display font-black uppercase tracking-widest text-xs hover:border-blue-400 hover:text-blue-500 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Add More Certification
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between pt-8 border-t border-slate-100">
        <Button 
          variant="secondary" 
          onClick={onBack} 
          className="px-8"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          className="px-10 shadow-xl shadow-blue-500/20"
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next Step: Projects
        </Button>
      </div>
    </div>
  );
}
