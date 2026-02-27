// src/components/features/CoverLetterGenerator.jsx
import React, { useState, useEffect } from 'react';
import { Wand2, FileText, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import Button from '../ui/Button';
import { generateCoverLetter } from '../../services/gemini';
import RichEditor from '../ui/RichEditor';

export default function CoverLetterGenerator({ onBack, onNext, onReady }) {
  const { cvData, coverLetter, updateCoverLetter, setCoverLetterContent, showToast } = useCVStore();
  const [generating, setGenerating] = useState(false);

  // Otomatis pindah preview ke 'Surat Lamaran' saat masuk step ini
  useEffect(() => {
    if (onReady) onReady('letter');
  }, [onReady]);

  const handleGenerate = async () => {
    if (!coverLetter.jobPosition) {
      return showToast('error', 'Masukkan posisi yang dilamar terlebih dahulu');
    }

    setGenerating(true);
    try {
      const content = await generateCoverLetter({
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
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Surat Lamaran (AI 2.5)</h2>
          <p className="text-sm text-slate-500">Auto-generate dari data CV Anda</p>
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
              <option value="formal">Formal & Profesional (Standard)</option>
              <option value="semi-formal">Semi-Formal & Friendly</option>
            </select>
          </div>
          
          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              loading={generating}
              variant="primary"
              leftIcon={<Wand2 className="w-4 h-4" />}
              className="w-full shadow-lg shadow-blue-200"
            >
              {coverLetter.status === 'generated' ? 'Regenerate Surat Baru' : 'Generate dengan AI 2.5'}
            </Button>
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-center">
           <h3 className="font-bold flex items-center gap-2 mb-2">
             <AlertTriangle className="w-5 h-5 text-blue-200" />
             Tips AI Generator
           </h3>
           <ul className="text-sm text-blue-100 space-y-2 list-disc ml-5">
             <li>Pastikan Summary di langkah sebelumnya sudah lengkap.</li>
             <li>AI akan otomatis menyisipkan Pendidikan & Skill Anda.</li>
             <li>Hasil di bawah bisa Anda edit secara manual.</li>
             <li>Cek <strong>Live Preview</strong> di panel sebelah kanan →</li>
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
      <div className="flex items-center justify-between pt-8 border-t border-slate-100">
        <Button
          variant="ghost"
          onClick={onBack}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Kembali
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          className="px-8"
        >
          Lanjut ke Simpan & Kirim
        </Button>
      </div>
    </div>
  );
}
