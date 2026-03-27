// src/components/features/CoverLetterGenerator.jsx
import React, { useState, useEffect } from 'react';
import { Wand2, FileText, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, Upload, X, Fingerprint, Lock } from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import useAuthStore from '../../store/useAuthStore';
import Button from '../ui/Button';
import { useGroq } from '../../hooks/useGroq';
import RichEditor from '../ui/RichEditor';

export default function CoverLetterGenerator({ onBack, onNext, onReady }) {
  const { cvData, coverLetter, updateCoverLetter, setCoverLetterContent, updatePersonalInfo, showToast } = useCVStore();
  const { user, setShowUpgradeModal } = useAuthStore();
  const { generateCoverLetterAI } = useGroq();
  
  const isPremium = user?.role === 'Premium' || user?.role === 'Admin';
  const [generating, setGenerating] = useState(false);

  // Otomatis pindah preview ke 'Surat Lamaran' saat masuk step ini
  useEffect(() => {
    if (onReady) onReady('letter');
  }, [onReady]);

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return showToast('error', 'File harus berupa gambar (PNG/JPG)');
    }

    if (file.size > 2 * 1024 * 1024) {
      return showToast('error', 'Ukuran file terlalu besar (maks 2MB)');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updatePersonalInfo({ signature: event.target.result });
      showToast('success', 'Tanda tangan berhasil di-upload!');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!isPremium) {
      return setShowUpgradeModal(true);
    }

    if (!coverLetter.jobPosition) {
      return showToast('error', 'Masukkan posisi yang dilamar terlebih dahulu');
    }

    setGenerating(true);
    try {
      const content = await generateCoverLetterAI({
        cvData,
        tone: coverLetter.tone,
        jobPosition: coverLetter.jobPosition,
        company: coverLetter.company,
        hrdName: coverLetter.hrdName
      });
      setCoverLetterContent(content);
      showToast('success', 'Surat lamaran berhasil dibuat!');
    } catch (error) {
      showToast('error', 'Gagal membuat surat lamaran: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
               <Fingerprint size={28} className="group-hover:scale-110 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Tahap 10</span>
               <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic text-left">
                 Intelegensia <span className="text-slate-400">Surat Lamaran</span>
               </h2>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-xl leading-relaxed italic px-2">
            Generasi otomatis narasi berdampak tinggi yang disesuaikan dengan tolok ukur karier prospektif Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Posisi yang Dilamar
            </label>
            <input
              type="text"
              className="form-input bg-white shadow-sm"
              placeholder="Contoh: Senior Frontend Developer"
              value={coverLetter.jobPosition}
              onChange={(e) => updateCoverLetter({ jobPosition: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Nama Perusahaan
            </label>
            <input
              type="text"
              className="form-input bg-white shadow-sm"
              placeholder="Contoh: PT. Teknologi Maju"
              value={coverLetter.company || ''}
              onChange={(e) => updateCoverLetter({ company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Nama HRD (Jika Ada)
            </label>
            <input
              type="text"
              className="form-input bg-white shadow-sm"
              placeholder="Contoh: Ibu Rina / HR Manager"
              value={coverLetter.hrdName || ''}
              onChange={(e) => updateCoverLetter({ hrdName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Tone Gaya Bahasa
            </label>
            <select
              className="form-input bg-white shadow-sm"
              value={coverLetter.tone}
              onChange={(e) => updateCoverLetter({ tone: e.target.value })}
            >
              <option value="formal">Formal & Profesional (Standar)</option>
              <option value="semi-formal">Semi-Formal & Ramah</option>
            </select>
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-500" /> Tanda Tangan Digital
              </span>
              {cvData.personalInfo.signature && (
                <button 
                  onClick={() => updatePersonalInfo({ signature: '' })}
                  className="text-[10px] text-rose-500 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Hapus
                </button>
              )}
            </label>
            
            {!cvData.personalInfo.signature ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Unggah Tanda Tangan</p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG Transparan / JPG (Maks 2MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
              </label>
            ) : (
              <div className="relative group/sig border-2 border-blue-100 bg-white rounded-2xl p-4 flex items-center justify-center h-32 shadow-sm italic text-slate-400 overflow-hidden">
                 <img 
                    src={cvData.personalInfo.signature} 
                    alt="Tanda Tangan" 
                    className="max-h-full max-w-full object-contain"
                 />
                 <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/sig:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 shadow-sm border border-blue-100">UKURAN PDF: 120x60px</span>
                 </div>
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              loading={generating}
              variant={!isPremium ? "outline" : "primary"}
              leftIcon={!isPremium ? <Lock className="w-4 h-4 text-amber-500" /> : <Wand2 className="w-4 h-4" />}
              className="w-full shadow-lg shadow-blue-200"
            >
              {!isPremium ? 'Upgrade Premium untuk Akses AI' : coverLetter.status === 'generated' ? 'Generasi Ulang Narasi' : 'Inisialisasi Narasi AI'}
            </Button>
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
          {!isPremium && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10 flex-col gap-2 rounded-2xl">
              <Lock className="w-8 h-8 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Khusus Premium</span>
            </div>
          )}
           <h3 className="font-bold flex items-center gap-2 mb-2">
             <AlertTriangle className="w-5 h-5 text-blue-200" />
             Panduan Generator AI
           </h3>
           <ul className="text-sm text-blue-100 space-y-2 list-disc ml-5">
             <li>Pastikan Ringkasan pada langkah sebelumnya telah optimal.</li>
             <li>AI akan mensintesis data Pendidikan & Keahlian Anda secara otomatis.</li>
             <li>Hasil di bawah dapat dikalibrasi secara manual.</li>
             <li>Tinjau <strong>Pratinjau Langsung</strong> di panel sebelah kanan →</li>
           </ul>
        </div>
      </div>

      {coverLetter.content && (
        <div className="space-y-4 animate-scale-in">
          <div className="flex items-center gap-2 px-2">
             <FileText className="w-5 h-5 text-blue-600" />
             <h3 className="font-bold text-slate-800 text-lg">Edit Isi Surat</h3>
          </div>

          <div className="bg-slate-50 p-4 md:p-8 rounded-3xl border border-slate-200 shadow-inner">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
              <RichEditor
                value={coverLetter.content}
                onChange={(val) => updateCoverLetter({ content: val })}
                placeholder="Isi surat lamaran..."
                minHeight={500}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-12 border-t border-slate-100 mt-16 px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="rounded-full px-8 h-14 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Kembali
        </Button>
        
        <button
          onClick={onNext}
          className="group flex items-center gap-8 px-10 py-5 rounded-full bg-slate-900 text-white shadow-premium hover:bg-black transition-all active:scale-[0.98]"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">Inisialisasi Tahap 11</span>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
