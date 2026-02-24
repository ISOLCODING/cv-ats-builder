// src/App.jsx — Modern Blue UI
import React, { useRef, useState, useCallback } from 'react';
import {
  FileText, Download, Save, Upload, RefreshCw, X,
  Zap, CheckCircle2, AlertTriangle, Info, ZoomIn, ZoomOut,
  Trash2, Menu,
} from 'lucide-react';
import Stepper    from './components/ui/Stepper';
import Button     from './components/ui/Button';
import PersonalInfoForm from './components/form/PersonalInfoForm';
import ExperienceForm   from './components/form/ExperienceForm';
import EducationForm    from './components/form/EducationForm';
import SkillsForm       from './components/form/SkillsForm';
import SummaryForm      from './components/form/SummaryForm';
import CVPreview        from './components/preview/CVPreview';
import useCVStore       from './store/useCVStore';
import { useGAS }       from './hooks/useGAS';
import { exportCVtoPDF } from './utils/exportPDF';

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
  const [zoom, setZoom]                     = useState(0.62);
  const [showMobile, setShowMobile]         = useState(false);
  const [showLoadModal, setShowLoadModal]   = useState(false);

  const {
    currentStep, nextStep, prevStep, setCurrentStep,
    cvData, setCVData, resetCVData, savedCVId, setSavedCVId,
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
    const el = document.getElementById('cv-preview-content');
    if (!el) return showToast('error', 'Preview CV tidak ditemukan');
    setExporting(true); setExportPct(0);
    try {
      const name = cvData.personalInfo.name?.replace(/\s+/g,'_') || 'CV';
      await exportCVtoPDF(el, name, setExportPct);
      showToast('success', `📄 PDF berhasil didownload!`);
    } catch (e) { showToast('error', `Gagal export: ${e.message}`); }
    finally { setExporting(false); setExportPct(0); }
  }, [cvData.personalInfo.name, showToast]);

  const renderForm = () => {
    switch (currentStep) {
      case 1: return <PersonalInfoForm onNext={nextStep} />;
      case 2: return <ExperienceForm   onNext={nextStep} onBack={prevStep} />;
      case 3: return <EducationForm    onNext={nextStep} onBack={prevStep} />;
      case 4: return <SkillsForm       onNext={nextStep} onBack={prevStep} />;
      case 5: return <SummaryForm      onBack={prevStep} />;
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
          <div className="flex items-center gap-3 mr-auto">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-extrabold leading-none text-lg">CV ATS Builder</p>
              <p className="text-blue-200 text-[11px] leading-none font-medium">Buat CV yang lolos ATS</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowLoadModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> Load CV
            </button>

            <button
              onClick={() => { if (window.confirm('Reset semua data?')) { resetCVData(); showToast('info','CV direset'); }}}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
              title="Reset CV"
            >
              <Trash2 className="w-4 h-4" />
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
              {exporting ? <><span className="spinner w-4 h-4 border-blue-600" />{exportPct}%</> : <><Download className="w-4 h-4" />Export PDF</>}
            </button>

            {/* Mobile preview toggle */}
            <button
              onClick={() => setShowMobile(!showMobile)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-all"
            >
              {showMobile ? <X className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main layout ────────────────────────────────────── */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6 xl:gap-8 items-start">

          {/* Left — Form panel */}
          <div className={`flex-1 min-w-0 space-y-4 ${showMobile ? 'hidden lg:block' : 'block'}`}>
            {/* Stepper card */}
            <div className="card py-5">
              <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
            </div>

            {/* Form card */}
            <div className="card">
              {renderForm()}
            </div>

            {/* Dev mode banner */}
            {!isGASMode && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 text-xs text-amber-700">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                <span>
                  <strong>Development Mode:</strong> Fitur Save/Load ke cloud memerlukan deploy ke Google Apps Script.
                  Data saat ini tersimpan di localStorage browser Anda.
                </span>
              </div>
            )}
          </div>

          {/* Right — CV Preview panel */}
          <div className={`w-auto flex-shrink-0 ${showMobile ? 'block w-full' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-3" style={{ width: `${794 * zoom + 32}px`, maxWidth: '100vw' }}>
              {/* Preview controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold text-slate-700">Live Preview</span>
                  <span className="badge badge-blue text-[10px]">A4</span>
                  {savedCVId && (
                    <span className="badge badge-green text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Tersimpan
                    </span>
                  )}
                </div>
                {/* Zoom */}
                <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setZoom(z => Math.max(0.4, z - 0.05))} className="btn btn-ghost btn-icon w-7 h-7 rounded-lg" title="Zoom out"><ZoomOut className="w-3.5 h-3.5" /></button>
                  <span className="text-xs text-slate-500 px-2 font-mono w-10 text-center">{Math.round(zoom*100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(1.1, z + 0.05))} className="btn btn-ghost btn-icon w-7 h-7 rounded-lg" title="Zoom in"><ZoomIn className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setZoom(0.62)} className="btn btn-ghost btn-icon w-7 h-7 rounded-lg" title="Reset"><RefreshCw className="w-3 h-3" /></button>
                </div>
              </div>

              {/* Preview window */}
              <div
                className="rounded-2xl border border-blue-100 shadow-lg bg-slate-200 overflow-auto"
                style={{ maxHeight: 'calc(100vh - 175px)', padding: '12px' }}
              >
                <div style={{
                  width: `${794 * zoom}px`,
                  height: `${1123 * zoom}px`,
                  position: 'relative',
                  margin: '0 auto',
                }}>
                  <div style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: '794px',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
                  }}>
                    <CVPreview ref={cvPreviewRef} />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="btn btn-primary flex-1 gap-2"
                >
                  {exporting
                    ? <><span className="spinner w-4 h-4" />{exportPct}%</>
                    : <><Download className="w-4 h-4" />Download PDF</>
                  }
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-secondary flex-1 gap-2"
                >
                  {isSaving ? <><span className="spinner w-4 h-4" />Menyimpan…</> : <><Save className="w-4 h-4" />Simpan CV</>}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

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
