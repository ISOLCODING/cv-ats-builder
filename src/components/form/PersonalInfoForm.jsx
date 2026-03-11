import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Linkedin,
  Globe, ChevronRight, Sparkles,
  QrCode, Fingerprint, Stars
} from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import Button from '../ui/Button';
import QRCode from 'qrcode';

function FieldWithIcon({ label, icon: Icon, required, error, children }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-blue-600 transition-colors">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {error && (
          <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter animate-pulse">
            {error}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
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
            color: { dark: '#2563eb', light: '#ffffff' }
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
    `w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 transition-all outline-none font-bold text-slate-800 text-sm placeholder:text-slate-300
     ${hasErr ? 'border-rose-100 bg-rose-50/20 focus:border-rose-500' : 'border-slate-100 focus:border-blue-600 focus:shadow-[0_10px_20px_-10px_rgba(37,99,235,0.2)]'}`;

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onSubmit={handleSubmit(onNext)}
      className="space-y-12"
    >
      {/* ── Header System ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group relative">
            <User className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <Stars className="absolute -top-2 -right-2 w-5 h-5 fill-current text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Informasi <span className="text-blue-600">Pribadi</span></h2>
            <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mt-1.5 leading-none">Lengkapi Profil Anda</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-blue-600 shadow-xl shadow-blue-500/20 text-white text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></div>
            Sinkronasi Aktif
          </div>
        </div>
      </div>

      {/* ── Input Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <FieldWithIcon label="Nama Lengkap" icon={Fingerprint} required error={errors.name?.message}>
          <input
            type="text"
            placeholder="Masukkan Nama Lengkap Anda"
            className={inputCls(errors.name)}
            {...register('name', { required: 'Nama wajib diisi' })}
          />
        </FieldWithIcon>

        <FieldWithIcon label="Email" icon={Mail} required error={errors.email?.message}>
          <input
            type="email"
            placeholder="contoh@domain.com"
            className={inputCls(errors.email)}
            {...register('email', { required: 'Email wajib diisi' })}
          />
        </FieldWithIcon>

        <FieldWithIcon label="Nomor Telepon" icon={Phone}>
          <input type="tel" placeholder="+62 8xx xxxx xxxx" className={inputCls(errors.phone)} {...register('phone')} />
        </FieldWithIcon>

        <FieldWithIcon label="Domisili" icon={MapPin}>
          <input type="text" placeholder="Kota, Provinsi" className={inputCls(errors.location)} {...register('location')} />
        </FieldWithIcon>

        <FieldWithIcon label="LinkedIn" icon={Linkedin}>
          <input type="text" placeholder="linkedin.com/in/nama-anda" className={inputCls(errors.linkedin)} {...register('linkedin')} />
        </FieldWithIcon>

        <FieldWithIcon label="Website / Portofolio" icon={Globe}>
          <input type="text" placeholder="https://website-anda.com" className={inputCls(errors.website)} {...register('website')} />
        </FieldWithIcon>

        <div className="flex items-end gap-4 group/qr lg:col-span-2">
          <div className="flex-1">
            <FieldWithIcon label="Link QR Code" icon={QrCode}>
              <input type="text" placeholder="Tempel URL di sini untuk QR Code" className={inputCls(errors.portfolioUrl)} {...register('portfolioUrl')} />
            </FieldWithIcon>
          </div>
          <AnimatePresence>
            {cvData.personalInfo.qrCodeData && (
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-16 h-16 bg-white border-2 border-slate-100 rounded-2xl p-2 shadow-xl"
              >
                <img src={cvData.personalInfo.qrCodeData} alt="QR" className="w-full h-full object-contain" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>



      {/* ── Expert Advice ────────────────────────────── */}
      <div className="p-6 bg-blue-600 rounded-[2rem] flex gap-6 text-white shadow-2xl shadow-blue-500/20">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white flex-shrink-0 animate-bounce transition-all duration-[2s]">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-100">Tips Penulisan</h4>
          <p className="text-xs font-bold text-white/90 leading-relaxed">
            "PASTIKAN INFORMASI YANG ANDA MASUKKAN SUDAH AKURAT DAN SESUAI DENGAN PROFIL PROFESIONAL ANDA."
          </p>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="rounded-full shadow-blue"
          rightIcon={<ChevronRight className="w-5 h-5" />}
        >
          Lanjut ke Pengalaman Kerja
        </Button>
      </div>
    </motion.form>
  );
}
