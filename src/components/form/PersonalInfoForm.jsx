// src/components/form/PersonalInfoForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Linkedin, Globe, ChevronRight, Sparkles } from 'lucide-react';
import useCVStore from '../../store/useCVStore';

function FieldWithIcon({ label, icon: Icon, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-blue-400" />
        </div>
        {children}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export default function PersonalInfoForm({ onNext }) {
  const { cvData, updatePersonalInfo } = useCVStore();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: cvData.personalInfo,
    mode: 'onBlur',
  });

  useEffect(() => {
    const sub = watch((data) => updatePersonalInfo(data));
    return () => sub.unsubscribe();
  }, [watch, updatePersonalInfo]);

  const inputCls = (hasErr) =>
    `form-input pl-9 ${hasErr ? 'border-red-400 ring-2 ring-red-100' : ''}`;

  return (
    <form onSubmit={handleSubmit(onNext)} className="animate-fade-up">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Informasi Pribadi</h2>
          <p className="text-sm text-slate-500">Data diri yang tampil di bagian atas CV</p>
        </div>
      </div>

      {/* Grid 2 kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <FieldWithIcon label="Nama Lengkap" icon={User} required error={errors.name?.message}>
          <input
            type="text"
            placeholder="Contoh: Budi Santoso, S.Kom"
            className={inputCls(errors.name)}
            {...register('name', {
              required: 'Nama wajib diisi',
              minLength: { value: 2, message: 'Minimal 2 karakter' },
            })}
          />
        </FieldWithIcon>

        <FieldWithIcon label="Email Profesional" icon={Mail} required error={errors.email?.message}>
          <input
            type="email"
            placeholder="nama@email.com"
            className={inputCls(errors.email)}
            {...register('email', {
              required: 'Email wajib diisi',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' },
            })}
          />
        </FieldWithIcon>

        <FieldWithIcon label="Nomor Telepon" icon={Phone} error={errors.phone?.message}>
          <input
            type="tel"
            placeholder="+62 812 3456 7890"
            className={inputCls(errors.phone)}
            {...register('phone')}
          />
        </FieldWithIcon>

        <FieldWithIcon label="Kota / Lokasi" icon={MapPin} error={errors.location?.message}>
          <input
            type="text"
            placeholder="Jakarta, Indonesia"
            className={inputCls(errors.location)}
            {...register('location')}
          />
        </FieldWithIcon>

        <FieldWithIcon label="LinkedIn URL" icon={Linkedin} error={errors.linkedin?.message}>
          <input
            type="text"
            placeholder="linkedin.com/in/username"
            className={inputCls(errors.linkedin)}
            {...register('linkedin')}
          />
        </FieldWithIcon>

        <FieldWithIcon label="Website / Portfolio" icon={Globe} error={errors.website?.message}>
          <input
            type="text"
            placeholder="https://portfolio.com"
            className={inputCls(errors.website)}
            {...register('website')}
          />
        </FieldWithIcon>
      </div>

      {/* Tips ATS */}
      <div className="tip-box mb-6 flex gap-3">
        <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-1">💡 Tips ATS — Personal Info</p>
          <ul className="space-y-0.5 text-xs opacity-90">
            <li>• Gunakan email profesional (hindari nama lucu/angka acak)</li>
            <li>• Sertakan URL LinkedIn — kebanyakan ATS memverifikasi profil</li>
            <li>• Nama harus sama persis dengan LinkedIn dan dokumen resmi</li>
          </ul>
        </div>
      </div>

      {/* Next */}
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary gap-2">
          Lanjut: Pengalaman Kerja
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
