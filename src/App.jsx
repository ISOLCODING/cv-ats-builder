// src/App.jsx — Modern Blue UI
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  FileText, Download, Save, Upload, RefreshCw, X,
  Zap, CheckCircle2, AlertTriangle, Info, ZoomIn, ZoomOut,
  Trash2, Menu, History, LayoutDashboard, Mail, Target, Eye, Layers
} from 'lucide-react';
import Stepper    from './components/ui/Stepper';
import Button     from './components/ui/Button';
import PersonalInfoForm from './components/form/PersonalInfoForm';
import ExperienceForm   from './components/form/ExperienceForm';
import EducationForm    from './components/form/EducationForm';
import SkillsForm       from './components/form/SkillsForm';
import SummaryForm      from './components/form/SummaryForm';
import CoverLetterGenerator from './components/features/CoverLetterGenerator';
import ATSChecker from './components/features/ATSChecker';
import EmailSender from './components/features/EmailSender';
import HistoryDashboard from './components/features/HistoryDashboard';
import CVPreview        from './components/preview/CVPreview';
import LetterPreview from './components/preview/LetterPreview';
import useCVStore       from './store/useCVStore';
import { useGAS }       from './hooks/useGAS';
import { exportCVtoPDF, exportLetterToPDF } from './utils/exportPDF';

// ── Toast ─────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const icon = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />,
    error:   <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    info:    <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  }[toast.type];
  const cls = { success: 'toast-success', error: 'toast-error', info: 'toast-info' }[toast.type];
  return (
    <div className="toast-wrap">
      <div className={`toast ${cls}`} role="alert">
        {icon}
        <span className="flex-1 text-slate-700 text-sm">{toast.message}</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Load Modal ─────────────────────────────────────────────────
function LoadModal({ onClose, onLoad }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { loadCV }            = useGAS();

  const handle = async () => {
    if (!email.trim()) return setError('Email tidak boleh kosong');
    setLoading(true); setError('');
    try {
      const res = await loadCV(email.trim());
      if (res?.success) { onLoad(res.data.cvData); onClose(); }
      else setError(res?.message || 'CV tidak ditemukan');
    } catch (e) { setError(`Error: ${e.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Load CV dari Cloud</h3>
          <button onClick={onClose} className="btn btn-ghost btn-icon w-8 h-8"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Masukkan email yang digunakan saat menyimpan CV.</p>
        <input
          type="email" autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handle()}
          placeholder="email@anda.com"
          className="form-input mb-3"
        />
        {error && <p className="form-error mb-3"><AlertTriangle className="w-3.5 h-3.5" />{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Batal</Button>
          <Button size="sm" loading={loading} onClick={handle} leftIcon={<Upload className="w-4 h-4" />}>
            Load CV
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const cvPreviewRef = useRef(null);
  const [exporting, setExporting]           = useState(false);
  const [exportPct, setExportPct]           = useState(0);
  const [zoom, setZoom] = useState(0.8);
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'preview' | 'history'
  const [previewType, setPreviewType] = useState('cv'); // 'cv' | 'letter'
  const [showLoadModal, setShowLoadModal]   = useState(false);

  const {
    currentStep, nextStep, prevStep, setCurrentStep,
    cvData, setCVData, resetCVData, savedCVId, setSavedCVId,
    coverLetter,
    isSaving, setIsSaving, toast, showToast, clearToast,
  } = useCVStore();

  const { saveCV, isGASMode } = useGAS();

  // ── Save ────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!cvData.personalInfo.email) {
      return showToast('error', 'Isi email terlebih dahulu (Step 1)');
    }
    setIsSaving(true);
    try {
      const res = await saveCV(cvData);
      if (res?.success) {
        setSavedCVId(res.data?.id);
        showToast('success', '✅ CV berhasil disimpan ke cloud!');
      } else {
        showToast('error', res?.message || 'Gagal menyimpan CV');
      }
    } catch {
      showToast(isGASMode ? 'error' : 'info',
        isGASMode ? 'Gagal koneksi ke GAS' : 'Mode lokal: Data tersimpan di browser');
    } finally { setIsSaving(false); }
  }, [cvData, saveCV, setIsSaving, setSavedCVId, showToast, isGASMode]);

  // ── Export PDF ──────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!cvData?.personalInfo?.name) {
      return showToast('error', 'Isi nama terlebih dahulu sebelum export');
    }
    setExporting(true); setExportPct(0);
    try {
      const name = cvData.personalInfo.name.replace(/\s+/g, '_');
      if (previewType === 'cv') {
        await exportCVtoPDF(null, name, setExportPct, cvData);
        showToast('success', '📄 CV PDF berhasil didownload!');
      } else {
        await exportLetterToPDF(
          coverLetter.content,
          cvData.personalInfo,
          coverLetter.jobPosition,
          cvData.education,
          setExportPct
        );
        showToast('success', '📄 Surat Lamaran PDF berhasil didownload!');
      }
    } catch (e) {
      showToast('error', `Gagal export: ${e.message}`);
    } finally {
      setExporting(false);
      setExportPct(0);
    }
  }, [cvData, previewType, coverLetter, showToast]);

  useEffect(() => {
    if (currentStep === 8) {
      setPreviewType('all');
    }
  }, [currentStep]);

  const renderForm = () => {
    if (activeTab === 'history') return <HistoryDashboard />;

    switch (currentStep) {
      case 1: return <PersonalInfoForm onNext={nextStep} />;
      case 2: return <ExperienceForm   onNext={nextStep} onBack={prevStep} />;
      case 3: return <EducationForm    onNext={nextStep} onBack={prevStep} />;
      case 4: return <SkillsForm       onNext={nextStep} onBack={prevStep} />;
      case 5: return <SummaryForm onNext={nextStep} onBack={prevStep} />;
      case 6: return <CoverLetterGenerator onNext={nextStep} onBack={prevStep} onReady={setPreviewType} />;
      case 7: return <ATSChecker onNext={nextStep} onBack={prevStep} />;
      case 8: return <EmailSender onBack={prevStep} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-mesh" style={{ background: 'linear-gradient(160deg,#eff6ff 0%,#f8fafc 60%,#f0f4ff 100%)' }}>
      <Toast toast={toast} onClose={clearToast} />
      {showLoadModal && (
        <LoadModal onClose={() => setShowLoadModal(false)} onLoad={(d) => { setCVData(d); showToast('success', 'CV dimuat!'); }} />
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="gradient-blue sticky top-0 z-40" style={{ boxShadow: '0 4px 24px rgba(37,99,235,0.25)' }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mr-auto cursor-pointer" onClick={() => { setActiveTab('form'); setCurrentStep(1); }}>
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-extrabold leading-none text-lg">CV ATS Builder</p>
              <p className="text-blue-200 text-[11px] leading-none font-medium">Buat CV yang lolos ATS</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center bg-white/10 rounded-2xl p-1 border border-white/20 mr-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all text-xs font-bold ${activeTab === 'form' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70 hover:text-white'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Editor
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl transition-all text-xs font-bold ${activeTab === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70 hover:text-white'}`}
            >
              <History className="w-3.5 h-3.5" /> History
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowLoadModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> Load CV
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/20 disabled:opacity-50"
            >
              {isSaving ? <span className="spinner w-4 h-4" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Menyimpan…' : 'Simpan'}
            </button>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-blue-700 text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60"
            >
              {exporting ? <><span className="spinner w-4 h-4 border-blue-600" />{exportPct}%</> : <><Download className="w-4 h-4" />Export</>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main layout ────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 md:py-6 pb-24 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

          {/* Left — Form panel */}
          <div className={`flex-1 w-full min-w-0 space-y-4 ${activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
            {/* Stepper card */}
            <div className="card py-4 sm:py-5 overflow-x-auto">
              <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
            </div>

            {/* Form card */}
            <div className="card">
              {renderForm()}
            </div>

            {/* Dev mode banner */}
            {!isGASMode && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-xs text-amber-700 mx-1">
                <Info className="w-5 h-5 flex-shrink-0 text-amber-500" />
                <span className="leading-relaxed">
                  <strong>Development Mode:</strong> Fitur Save/Load ke cloud memerlukan deploy ke Google Apps Script. 
                  Data saat ini tersimpan di localStorage browser Anda.
                </span>
              </div>
            )}
          </div>

          {/* Right — CV Preview panel */}
          <div className={`w-full lg:w-auto flex-shrink-0 ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-4">
              {/* Preview controls */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                      <Eye className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Live Preview</span>
                    <span className="badge badge-blue text-[10px]">A4</span>
                  </div>

                  <div className="flex items-center gap-0.5 bg-white border border-slate-200 shadow-sm rounded-xl p-1">
                    <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="btn btn-ghost btn-icon w-8 h-8 rounded-lg" title="Zoom out"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <span className="text-[11px] text-slate-500 px-1 font-bold w-10 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(1.2, z + 0.1))} className="btn btn-ghost btn-icon w-8 h-8 rounded-lg" title="Zoom in"><ZoomIn className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setZoom(0.8)} className="btn btn-ghost btn-icon w-8 h-8 rounded-lg" title="Reset"><RefreshCw className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {/* Doc Toggle */}
                <div className="bg-slate-200/50 p-1.5 rounded-2xl flex items-center gap-1 mx-1">
                  <button
                    onClick={() => setPreviewType('cv')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${previewType === 'cv' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Preview CV
                  </button>
                  <button
                    onClick={() => setPreviewType('letter')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${previewType === 'letter' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Surat Lamaran
                  </button>
                  <button
                    onClick={() => setPreviewType('all')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${previewType === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Semua
                  </button>
                </div>
              </div>

              {/* Preview window */}
              <div
                className="rounded-2xl border border-slate-200 shadow-xl bg-slate-100/50 backdrop-blur-sm overflow-auto mx-auto"
                style={{
                  maxHeight: 'calc(100vh - 180px)',
                  padding: '16px',
                  width: activeTab === 'preview' ? '100%' : `${794 * zoom + 32}px`,
                  maxWidth: '100%'
                }}
              >
                <div className="preview-container" style={{
                  width: `${794 * zoom}px`,
                  minHeight: `${1123 * zoom}px`,
                  position: 'relative',
                  margin: '0 auto',
                }}>
                  <div className="preview-scale-wrapper flex flex-col gap-8" style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    width: '794px',
                  }}>
                    {previewType === 'all' ? (
                      <>
                        <div style={{ backgroundColor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
                          <LetterPreview />
                        </div>
                        <div style={{ backgroundColor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
                          <CVPreview ref={cvPreviewRef} />
                        </div>
                      </>
                    ) : (
                      <div style={{ backgroundColor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
                        {previewType === 'cv' ? <CVPreview ref={cvPreviewRef} /> : <LetterPreview />}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile quick actions when in preview tab */}
              <div className="lg:hidden grid grid-cols-2 gap-3 pb-4">
                <Button 
                  onClick={handleExport}
                  disabled={exporting}
                  variant="primary"
                  className="w-full h-12 shadow-blue"
                  leftIcon={exporting ? null : <Download className="w-5 h-5" />}
                >
                  {exporting ? `${exportPct}%` : 'Download PDF'}
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="secondary"
                  className="w-full h-12"
                  leftIcon={isSaving ? null : <Save className="w-5 h-5" />}
                >
                  {isSaving ? 'Saving...' : 'Simpan Cloud'}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Mobile Navigation ──────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 lg:hidden px-6 py-3 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'form' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'form' ? 'bg-blue-100' : ''}`}>
            <Menu className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Isi Data</span>
        </button>

        <div className="w-12 h-12 -mt-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-white text-white active:scale-95 transition-transform" onClick={handleExport}>
          {exporting ? <span className="text-[10px] font-bold">{exportPct}%</span> : <Download className="w-6 h-6" />}
        </div>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'preview' ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'preview' ? 'bg-blue-100' : ''}`}>
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Preview</span>
        </button>
      </nav>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mt-16 py-6 border-t border-blue-100 text-center">
        <p className="text-sm text-slate-400">
          ⚡ <strong className="text-blue-600">CV ATS Builder</strong> — React + Vite + Google Apps Script
        </p>
        <p className="text-xs text-slate-300 mt-1">Data CV tersimpan aman di Google Sheets Anda</p>
      </footer>
    </div>
  );
}
