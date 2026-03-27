// src/components/features/EmailSender.jsx
import React, { useState } from 'react';
import { Send, Cloud, FileCode, CheckCircle2, ChevronLeft, Mail, User, Building, StickyNote, Eye, Building2, AlertTriangle, Lightbulb } from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import Button from '../ui/Button';
import { useGAS } from '../../hooks/useGAS';
import { exportCVtoPDF, generateCVBlob, generateLetterBlob } from '../../utils/exportPDF';
import { PDFViewer } from '@react-pdf/renderer';
import { CVDocument } from '../pdf/CVDocument';
import { LetterDocument } from '../pdf/LetterDocument';

export default function EmailSender({ onBack }) {
  const { cvData, coverLetter, showToast, addToHistory } = useCVStore();
  const { callGAS, isGASMode, hasEndpoint } = useGAS();

  const [emailInfo, setEmailInfo] = useState({
    hrdEmail: '',
    hrdName: coverLetter.hrdName || '',
    company: coverLetter.company || '',
    subject: `Lamaran Pekerjaan - ${coverLetter.jobPosition} - ${cvData.personalInfo.name}`,
    intro: `Halo ${coverLetter.hrdName ? `Bapak/Ibu ${coverLetter.hrdName}` : 'Bapak/Ibu HRD'},\n\nSaya bermaksud menyampaikan lamaran pekerjaan untuk posisi ${coverLetter.jobPosition}. Terlampir saya sampaikan CV dan Surat Lamaran saya.\n\nTerima kasih.`,
    jobType: 'Fulltime',
    source: 'LinkedIn'
  });

  const { updateCoverLetter } = useCVStore();

  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSaveToCloud = async () => {
    if (!isGASMode && !hasEndpoint) return showToast('info', 'Konfigurasi Diperlukan: Isi VITE_GAS_ENDPOINT di .env untuk jalankan fitur ini di localhost.');
    setSaving(true);
    try {
      const res = await callGAS('saveCV', { cvData });
      if (res.success) {
        showToast('success', 'Data CV & Lamaran berhasil dicatatkan!');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendEmail = async () => {
    if (!emailInfo.hrdEmail) return showToast('error', 'Email HRD wajib diisi');
    if (!isGASMode && !hasEndpoint) return showToast('info', 'Konfigurasi Diperlukan: Isi VITE_GAS_ENDPOINT di .env untuk mengirim email dari localhost.');

    setSending(true);
    try {
      // 0. Auto-Save CV Data to Sheets First
      showToast('info', 'Mencatat data pelamaran...');
      await handleSaveToCloud();

      showToast('info', 'Sedang menyiapkan dokumen PDF...');

      // 1. Generate & Upload CV
      const cvBlob = await generateCVBlob(cvData);
      const cvBase64 = await blobToBase64(cvBlob);
      const cvRes = await callGAS('saveToDrive', {
        fileData: {
          fileName: `CV_${cvData.personalInfo.name.replace(/\s+/g, '_')}.pdf`,
          contentType: 'application/pdf',
          blobData: cvBase64,
          userName: cvData.personalInfo.name
        },
        historyData: {
          email: cvData.personalInfo.email,
          company: emailInfo.company || 'Unknown',
          position: coverLetter.jobPosition,
          type: 'CV'
        }
      });

      if (!cvRes?.success) throw new Error(cvRes?.message || 'Gagal upload CV ke Drive');

      // 2. Generate & Upload Letter
      const letterBlob = await generateLetterBlob(
        coverLetter.content, 
        cvData.personalInfo, 
        coverLetter.jobPosition, 
        cvData.education,
        coverLetter.hrdName,
        coverLetter.company
      );
      const letterBase64 = await blobToBase64(letterBlob);
      const letterRes = await callGAS('saveToDrive', {
        fileData: {
          fileName: `Surat_Lamaran_${cvData.personalInfo.name.replace(/\s+/g, '_')}.pdf`,
          contentType: 'application/pdf',
          blobData: letterBase64,
          userName: cvData.personalInfo.name
        },
        historyData: {
          email: cvData.personalInfo.email,
          company: emailInfo.company || 'Unknown',
          position: coverLetter.jobPosition,
          type: 'Letter'
        }
      });

      if (!letterRes?.success) throw new Error(letterRes?.message || 'Gagal upload Surat Lamaran ke Drive');

      // 3. Send Email with Attachments
      showToast('info', 'Mengirim email dengan lampiran...');
      const emailOptions = {
        to: emailInfo.hrdEmail,
        nameHRD: emailInfo.hrdName,
        subject: emailInfo.subject,
        body: emailInfo.intro,
        senderName: cvData.personalInfo.name,
        // Gunakan optional chaining agar tidak crash jika data/id undefined (local dev mode)
        attachmentIds: [cvRes?.data?.id, letterRes?.data?.id].filter(Boolean),
        // Metadata tambahan untuk logging lengkap di Sheets
        applicantEmail: cvData.personalInfo.email,
        company: emailInfo.company,
        position: coverLetter.jobPosition,
        jobType: emailInfo.jobType,
        source: emailInfo.source
      };

      const res = await callGAS('sendEmail', emailOptions);
      if (res?.success) {
        showToast('success', 'Email Lamaran & Lampiran Berhasil Terkirim!');
        addToHistory({
          name: cvData.personalInfo.name,
          email: cvData.personalInfo.email,
          company: emailInfo.company || emailInfo.hrdName || emailInfo.hrdEmail,
          position: coverLetter.jobPosition,
          jobType: emailInfo.jobType,
          source: emailInfo.source,
          type: 'Application',
          status: 'Terkirim'
        });
      } else {
        throw new Error(res?.message || 'Gagal mengirim email. Periksa koneksi atau kuota Gmail harian Anda.');
      }
    } catch (error) {
      showToast('error', 'Gagal kirim: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 pb-12 border-b border-slate-100">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-premium group relative overflow-hidden">
               <Send size={28} className="group-hover:scale-110 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
             </div>
             <div className="space-y-1">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-400">Tahap 12</span>
               <h2 className="text-4xl md:text-5xl font-display font-light text-slate-900 tracking-tight italic text-left">
                 Transmisi <span className="text-slate-400">Final</span>
               </h2>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-xl leading-relaxed italic px-2">
            Eksekusi protokol pengarsipan dan transmisi final untuk portofolio profesional Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> Email HRD / Perusahaan
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="hrd@perusahaan.com"
              value={emailInfo.hrdEmail}
              onChange={(e) => setEmailInfo({ ...emailInfo, hrdEmail: e.target.value })}
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> Nama Perusahaan
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: PT. Maju Jaya"
                value={emailInfo.company}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmailInfo(prev => ({ ...prev, company: val }));
                  updateCoverLetter({ company: val });
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Nama HRD (Opsional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Bapak/Ibu ... "
                value={emailInfo.hrdName}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmailInfo(prev => ({ 
                    ...prev, 
                    hrdName: val,
                    intro: `Halo ${val ? `Bapak/Ibu ${val}` : 'Bapak/Ibu HRD'},\n\nSaya bermaksud menyampaikan lamaran pekerjaan untuk posisi ${coverLetter.jobPosition}. Terlampir saya sampaikan CV dan Surat Lamaran saya.\n\nTerima kasih.`
                  }));
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipe Pekerjaan</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                  value={emailInfo.jobType}
                  onChange={(e) => setEmailInfo({ ...emailInfo, jobType: e.target.value })}
                >
                  <option value="Fulltime">Penuh Waktu (Full-time)</option>
                  <option value="Intern">Magang (Internship)</option>
                  <option value="Contract">Kontrak (Contract)</option>
                  <option value="Freelance">Lepas (Freelance)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sumber Info</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                  value={emailInfo.source}
                  onChange={(e) => setEmailInfo({ ...emailInfo, source: e.target.value })}
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Jobstreet">Jobstreet</option>
                  <option value="Glints">Glints</option>
                  <option value="Job Fair">Job Fair</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-slate-400" /> Subjek Email
            </label>
            <input
              type="text"
              className="form-input"
              value={emailInfo.subject}
              onChange={(e) => setEmailInfo({ ...emailInfo, subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Pesan Pengantar</label>
            <textarea
              className="form-input min-h-[100px] text-sm"
              value={emailInfo.intro}
              onChange={(e) => setEmailInfo({ ...emailInfo, intro: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white text-blue-600 shadow-sm">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Pratinjau Pra-Pengiriman</p>
            <p className="text-xs text-slate-500">Pastikan CV & Surat Lamaran telah terverifikasi</p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setShowPreview(!showPreview)}
          className="w-full md:w-auto"
        >
          {showPreview ? 'Tutup Pratinjau' : 'Tampilkan Pratinjau'}
        </Button>
      </div>

      {showPreview && (
        <div className="space-y-8 animate-scale-in">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-500" /> Pratinjau CV (Mode PDF)
              </p>
              <div className="h-[600px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                 <PDFViewer width="100%" height="100%" showToolbar={false} className="border-none">
                    <CVDocument cvData={cvData} />
                 </PDFViewer>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-orange-500" /> Pratinjau Surat Lamaran (Mode PDF)
              </p>
              <div className="h-[600px] rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                 <PDFViewer width="100%" height="100%" showToolbar={false} className="border-none">
                    <LetterDocument 
                      content={coverLetter.content} 
                      personalInfo={cvData.personalInfo} 
                      jobPosition={coverLetter.jobPosition}
                      education={cvData.education}
                      hrdName={coverLetter.hrdName}
                      company={coverLetter.company}
                    />
                 </PDFViewer>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Catatan:</strong> Preview di atas adalah tampilan persis seperti yang akan dikirim/didownload. Format menggunakan <strong>Times New Roman 12pt</strong> sesuai standar profesional.
            </p>
          </div>
        </div>
      )}

      {/* ── Persiapan Karir (Detailed Features for Pencaker) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-[2rem] border-slate-200/60 bg-white/50 space-y-4">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-black text-xs uppercase tracking-widest">Daftar Verifikasi Pra-Transmisi</h3>
          </div>
          <ul className="space-y-2.5">
            {[
              'Nama file PDF sudah profesional (Contoh: CV_Nama_Lengkap.pdf)',
              'Email tujuan HRD sudah diperiksa ulang tidak ada typo',
              'Isi email pengantar sopan dan menyebutkan posisi yang dilamar',
              'Surat Lamaran (Cover Letter) sudah mencantumkan nama perusahaan',
              'Pastikan Portofolio/Link eksternal di CV dapat diakses umum'
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-xs text-slate-600 font-medium items-start">
                <input type="checkbox" className="mt-0.5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6 rounded-[2rem] border-amber-200/60 bg-amber-50/30 space-y-4">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <Lightbulb className="w-5 h-5" />
            <h3 className="font-black text-xs uppercase tracking-widest">Wawasan Wawancara Strategis</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-white/80 rounded-xl border border-amber-100 shadow-sm text-xs text-amber-900">
              <strong>"Bercerita dengan Data"</strong>: Jangan cuma bilang "Saya jago marketing", tapi "Saya naikkan trafik 40% lewat SEO".
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-amber-100 shadow-sm text-xs text-amber-900">
              <strong>Pertanyaan Balik</strong>: Tanya ke HRD: "Apa tantangan terbesar departemen ini dalam 6 bulan mendatang?"
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-amber-100 shadow-sm text-xs text-amber-900 text-center font-bold">
              💡 Selalu teliti profil perusahaan di LinkedIn sebelum mulai interview!
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-10">
        <button
          onClick={handleSendEmail}
          disabled={sending}
          className="group flex items-center gap-8 px-12 py-6 rounded-full bg-slate-900 text-white shadow-premium hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-white/90 group-hover:text-white transition-colors">
            {sending ? 'Transmisi Berjalan...' : 'Kirim Lamaran Sekarang'}
          </span>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <Send size={24} className={sending ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'} />
          </div>
        </button>
      </div>

      <div className="flex items-center justify-between pt-12 border-t border-slate-100 mt-16 px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="rounded-full px-8 h-14 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Kembali
        </Button>
      </div>
    </div>
  );
}
