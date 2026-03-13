import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Users, Plus, Trash2, Pencil, ChevronRight,
  ChevronLeft, Building2, Calendar, GripVertical,
  CheckCircle2, ChevronUp, ChevronDown, Award,
  Sparkles, ShieldCheck, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import RichEditor from '../ui/RichEditor';
import MagicWriter from '../ui/MagicWriter';
import useCVStore from '../../store/useCVStore';

function EmptyOrganizations() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200"
    >
      <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 relative rotate-3 hover:rotate-0 transition-transform duration-500">
        <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full" />
        <Users className="w-12 h-12 text-blue-500 relative z-10" />
      </div>
      <h3 className="text-2xl font-display font-black text-slate-800 mb-2">Leadership & Community</h3>
      <p className="text-slate-500 text-center max-w-sm text-sm leading-relaxed mb-10 font-medium">
        Showcase your organizational experience, volunteer work, and leadership roles that demonstrate teamwork and initiative.
      </p>
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
      className="group relative bg-white border border-slate-100 p-6 sm:p-8 rounded-[2.5rem] shadow-soft hover:shadow-2xl hover:border-blue-200 transition-all duration-500"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-blue-50 transition-colors">
          <Users className="w-8 h-8 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xl font-display font-black text-slate-800 leading-tight">
                {org.name || 'Organization Name'}
              </h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100/50">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">{org.role || 'Member'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-display font-bold text-[11px] uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" />
                  {org.period || 'Year - Year'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEdit}
                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
              >
                <Pencil className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {org.contribution && (
            <div 
              className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: org.contribution }}
            />
          )}
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50/40 border border-blue-100 rounded-[3rem] p-6 sm:p-10 space-y-8 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <ShieldCheck className="w-48 h-48 text-blue-500" />
      </div>

      <div className="relative">
        <h3 className="text-xl font-display font-black text-blue-950 flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          {initial ? 'Refine Experience' : 'New Leadership Entry'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Organization Name</label>
            <input 
              {...register('name', { required: 'Required' })} 
              className="form-input text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-14 rounded-2xl" 
              placeholder="e.g. Student Executive Board" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Your Role / Position</label>
            <input 
              {...register('role', { required: 'Required' })} 
              className="form-input text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-14 rounded-2xl" 
              placeholder="e.g. Lead Coordinator / Staff" 
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tenure Period</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                {...register('period', { required: 'Required' })} 
                className="form-input pl-12 text-sm font-bold bg-white/70 backdrop-blur-sm focus:bg-white transition-all border-none shadow-sm h-14 rounded-2xl" 
                placeholder="e.g. 2022 - 2023" 
              />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Key Contributions</label>
            <MagicWriter 
              type="Organization"
              content={desc}
              onApply={setDesc}
            />
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-[2rem] border border-blue-100 overflow-hidden shadow-sm">
            <RichEditor
              label={null}
              value={desc}
              onChange={setDesc}
              placeholder="Spearheaded the annual symposium for 500+ participants..."
              minHeight={160}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-10 pt-8 border-t border-blue-100">
          <Button variant="secondary" onClick={onCancel} className="px-8 font-display">Discard</Button>
          <Button 
            onClick={handleSubmit(onSubmit)} 
            className="px-10 shadow-xl shadow-blue-500/20"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Save Entry
          </Button>
        </div>
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

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 shadow-xl shadow-blue-200 flex items-center justify-center -rotate-6 hover:rotate-0 transition-transform duration-500">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-display font-black text-slate-800 tracking-tight">Organizations</h2>
              <p className="text-slate-500 font-medium font-display uppercase tracking-[0.3em] text-[10px] mt-2">Teamwork & Leadership skills</p>
            </div>
          </div>
          
          {!showForm && !editTarget && (
            <Button 
              onClick={() => setShowForm(true)} 
              variant="primary"
              className="hidden sm:flex shadow-2xl shadow-blue-500/20 px-8"
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Add Experience
            </Button>
          )}
        </div>
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
            className="space-y-6"
          >
            {organizations.length === 0 ? (
              <EmptyOrganizations />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {organizations.map((o) => (
                  <OrgCard 
                    key={o.id} 
                    org={o} 
                    onEdit={() => setEditTarget(o)} 
                    onDelete={() => removeOrganization(o.id)} 
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
              <Plus className="w-6 h-6" />
              Add More Organization
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
          Previous
        </Button>
        <Button 
          onClick={onNext} 
          className="px-12 h-14 rounded-2xl shadow-xl shadow-blue-500/20"
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Final Step: Summary Analysis
        </Button>
      </div>
    </div>
  );
}
