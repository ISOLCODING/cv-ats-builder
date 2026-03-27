import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Linkedin,
  Globe, ChevronRight, Sparkles,
  QrCode, Fingerprint, Info
} from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import Button from '../ui/Button';
import QRCode from 'qrcode';

function FieldWithIcon({ label, icon: Icon, required, error, children }) {
  return (
    <div className="space-y-3 group/field">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 group-focus-within/field:text-slate-900 transition-colors">
          {label} {required && <span className="text-rose-400 font-normal">*</span>}
        </label>
        <AnimatePresence>
          {error && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-bold text-rose-500 uppercase tracking-widest"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-transform group-focus-within/field:scale-110 duration-500">
          <Icon className="w-4 h-4 text-slate-300 group-focus-within/field:text-slate-900 transition-colors" />
        </div>
        {children}
      </div>
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
    const sub = watch(async (data) => {
      if (data.portfolioUrl && data.portfolioUrl !== cvData.personalInfo.portfolioUrl) {
        try {
          const qrData = await QRCode.toDataURL(data.portfolioUrl, {
            width: 200,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' } // Slate 900
          });
          updatePersonalInfo({ ...data, qrCodeData: qrData });
        } catch (err) {
          updatePersonalInfo(data);
        }
      } else {
        updatePersonalInfo(data);
      }
    });
    return () => sub.unsubscribe();
  }, [watch, updatePersonalInfo, cvData.personalInfo.portfolioUrl]);

  const inputCls = (hasErr) => 
    `w-full pl-14 pr-7 py-5 rounded-2xl bg-slate-50 border transition-all outline-none font-semibold text-slate-700 text-sm placeholder:text-slate-300 placeholder:font-medium
     ${hasErr ? 'border-rose-100 bg-rose-50/10 focus:border-rose-300' : 'border-slate-50 focus:border-slate-900 focus:bg-white focus:shadow-premium'}`;

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onNext)}
      className="space-y-16 animate-fade-up"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
               <User size={28} className="group-hover:scale-110 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Step 02</span>
               <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic">
                 Identitas <span className="text-slate-400">Profesional</span>
               </h2>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-xl leading-relaxed italic px-2">
            Lengkapi identitas dasar untuk menginisialisasi arsitektur profil profesional Anda.
          </p>
        </div>

        <div className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm shrink-0">
           <div className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-pulse shadow-lg shadow-slate-200"></div>
           <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Sinkronisasi Sistem Aktif</span>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        <FieldWithIcon label="Nama Lengkap" icon={Fingerprint} required error={errors.name?.message}>
          <input
            type="text"
            placeholder="John Doe"
            className={inputCls(errors.name)}
            {...register('name', { required: 'Nama lengkap wajib diisi' })}
          />
        </FieldWithIcon>

        <FieldWithIcon label="Alamat Surel" icon={Mail} required error={errors.email?.message}>
          <input
            type="email"
            placeholder="john@example.com"
            className={inputCls(errors.email)}
            {...register('email', { required: 'Alamat surel wajib diisi' })}
          />
        </FieldWithIcon>

        <FieldWithIcon label="Nomor Telepon" icon={Phone}>
          <input type="tel" placeholder="+62 8xx..." className={inputCls(errors.phone)} {...register('phone')} />
        </FieldWithIcon>

        <FieldWithIcon label="Domisili" icon={MapPin}>
          <input type="text" placeholder="Kota, Negara" className={inputCls(errors.location)} {...register('location')} />
        </FieldWithIcon>

        <FieldWithIcon label="Tautan LinkedIn" icon={Linkedin}>
          <input type="text" placeholder="linkedin.com/in/username" className={inputCls(errors.linkedin)} {...register('linkedin')} />
        </FieldWithIcon>

        <FieldWithIcon label="Situs Portofolio" icon={Globe}>
          <input type="text" placeholder="https://portfolio.me" className={inputCls(errors.website)} {...register('website')} />
        </FieldWithIcon>

        <div className="md:col-span-2 flex items-end gap-10 bg-slate-50/30 p-10 rounded-[3rem] border border-slate-100/60 group/qr shadow-sm hover:shadow-premium transition-all duration-700">
          <div className="flex-1">
            <FieldWithIcon label="Referensi Kode QR Digital" icon={QrCode}>
              <input type="text" placeholder="Tautan untuk enkripsi QR otomatis" className={inputCls(errors.portfolioUrl)} {...register('portfolioUrl')} />
            </FieldWithIcon>
          </div>
          <AnimatePresence>
            {cvData.personalInfo.qrCodeData && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                className="w-24 h-24 bg-white border border-slate-100 rounded-[2rem] p-4 shadow-xl shadow-slate-200/50 overflow-hidden group-hover/qr:scale-110 transition-transform duration-500"
              >
                <img src={cvData.personalInfo.qrCodeData} alt="QR" className="w-full h-full object-contain grayscale-[0.5] contrast-[1.1] hover:grayscale-0 transition-all duration-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Advisory Section */}
      <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-800 shadow-sm">
             <Info size={20} />
           </div>
           <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-500 italic">Logika Optimasi</p>
        </div>
        <div className="flex flex-col md:flex-row gap-12 px-4">
           <div className="flex-1 space-y-4">
             <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Protokol Aksesibilitas</h4>
             <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
               Gunakan alamat surel profesional dan nomor telepon yang aktif secara global. Domisili cukup mencakup Kota dan Negara untuk privasi digital.
             </p>
           </div>
           <div className="flex-1 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Verifikasi Jaringan Profesional</h4>
              <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                Menyederhanakan akses ke profil LinkedIn akan meningkatkan indeks kredibilitas digital Anda di hadapan kurator profesional.
              </p>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-12 border-t border-slate-100">
          <button
            onClick={handleSubmit(onNext)}
            className="group flex items-center gap-8 px-10 py-5 rounded-full bg-slate-900 text-white shadow-premium hover:bg-black transition-all active:scale-[0.98]"
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">Inisialisasi Tahap 03</span>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
      </div>
    </motion.form>
  );
}
