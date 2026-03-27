import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Save, Upload, RefreshCw, X,
  Zap, CheckCircle2, AlertTriangle, Info, ZoomIn, ZoomOut,
  Trash2, Menu, History, LayoutDashboard, Mail, Target, Eye, Layers,
  ChevronRight, Sparkles, Cloud, Stars, Settings, Globe, Users
} from 'lucide-react';
import Stepper    from './components/ui/Stepper';
import Button     from './components/ui/Button';
import TemplateSelector from './components/form/TemplateSelector';
import PersonalInfoForm from './components/form/PersonalInfoForm';
import ExperienceForm   from './components/form/ExperienceForm';
import EducationForm    from './components/form/EducationForm';
import SkillsForm       from './components/form/SkillsForm';
import CertificationsForm from './components/form/CertificationsForm';
import ProjectsForm     from './components/form/ProjectsForm';
import OrganizationsForm from './components/form/OrganizationsForm';
import SummaryForm      from './components/form/SummaryForm';
import CoverLetterGenerator from './components/features/CoverLetterGenerator';
import ATSChecker from './components/features/ATSChecker';
import EmailSender from './components/features/EmailSender';
import HistoryDashboard from './components/features/HistoryDashboard';
import SettingsPage from './components/features/SettingsPage';
import KeywordHeatmap from './components/features/KeywordHeatmap';
import CVPreview        from './components/preview/CVPreview';
import LetterPreview from './components/preview/LetterPreview';
import useCVStore       from './store/useCVStore';
import useAuthStore     from './store/useAuthStore';
import AuthPage         from './components/ui/AuthPage';
import AdminDashboard   from './components/admin/AdminDashboard';
import UpgradeModal     from './components/ui/UpgradeModal';
import { useGAS }       from './hooks/useGAS';
import { exportCVtoPDF, exportLetterToPDF } from './utils/exportPDF';

// ── Motion Variants ──────────────────────────────────────────
const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};

const navItemVariants = {
  active: { scale: 1.05, backgroundColor: "rgba(0, 102, 255, 0.1)", color: "#0066FF" },
  inactive: { scale: 1, backgroundColor: "transparent", color: "#64748b" }
};

// ── Components ────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const icon = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--secondary)]" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-[var(--primary)]" />,
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm"
    >
      <div className="card !p-4 !rounded-2xl flex items-center gap-4 bg-white/95 backdrop-blur-xl">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] leading-none mb-1.5">
            Notifikasi Sistem
          </p>
          <p className="text-xs font-semibold text-slate-700 leading-tight">{toast.message}</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function LoadModal({ onClose, onLoad }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loadCV } = useGAS();

  const handle = async () => {
    if (!email.trim()) return setError('Email is required');
    setLoading(true); setError('');
    try {
      const res = await loadCV(email.trim());
      if (res?.success) { onLoad(res.data.cvData); onClose(); }
      else setError(res?.message || 'CV not found');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative glass-card w-full max-w-md p-8 rounded-[2.5rem] shadow-master border-white"
      >
        <div className="mb-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-inner ring-8 ring-blue-50/50">
            <Cloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Pulihkan Data</h3>
          <p className="text-sm font-bold text-slate-400">Sinkronisasi dengan rekam jejak profesional Anda.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="form-label">ID Cloud (Email)</label>
            <input
              type="email" autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@career.com"
              className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-slate-100 focus:border-blue-500 focus:shadow-blue-500/10 transition-all outline-none font-bold text-slate-800"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-600 transition-colors">Batal</button>
            <button
              onClick={handle}
              disabled={loading}
              className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-blue hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Mendekripsi...' : 'Pulihkan Aset'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const cvPreviewRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [exportPct, setExportPct] = useState(0);
  const [zoom, setZoom] = useState(0.85);
  const [activeTab, setActiveTab] = useState('editor'); // editor, history, settings, admin
  const [previewType, setPreviewType] = useState('cv'); 
  const [showLoadModal, setShowLoadModal]   = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Authentication State
  const { user, logout } = useAuthStore();

  const {
    currentStep, nextStep, prevStep, setCurrentStep,
    cvData, setCVData, savedCVId, setSavedCVId,
    coverLetter,
    isSaving, setIsSaving, toast, showToast, clearToast,
    translateCVData
  } = useCVStore();

  const appSettings = useCVStore(state => state.appSettings);
  const appLogo = appSettings?.appLogo;
  const appName = appSettings?.appName || 'CV ATS Builder';
  const favicon = appSettings?.favicon;
  const language = appSettings?.language || 'id';

  const { saveCV, isGASMode } = useGAS();

  useEffect(() => {
    // Update Title
    document.title = `${appName} - Pembuat CV ATS`;

    // Update Favicon
    if (favicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = favicon;
    }
  }, [favicon, appName]);

  // ── Navigation Guard ──────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Basic check: if name or summary exists, warn. 
      // Ideally we'd have an isDirty flag, but checking content is safer for now.
      if (cvData.personalInfo.name || cvData.summary) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cvData]);

  const handleSave = useCallback(async () => {
    if (!cvData.personalInfo.email) return showToast('error', 'Email is required to save progress');
    setIsSaving(true);
    try {
      const res = await saveCV(cvData);
      if (res?.success) {
        setSavedCVId(res.data?.id);
        showToast('success', 'Data berhasil disimpan!');
      } else {
        showToast('error', res?.message || 'Sync failed');
      }
    } catch {
      showToast(isGASMode ? 'error' : 'info', isGASMode ? 'Koneksi terputus' : 'Mode Lokal: Progres disimpan secara lokal');
    } finally { setIsSaving(false); }
  }, [cvData, saveCV, setIsSaving, setSavedCVId, showToast, isGASMode]);

  const handleExport = useCallback(async () => {
    if (!cvData?.personalInfo?.name) return showToast('error', 'Name is required for PDF export');
    setExporting(true); setExportPct(0);
    try {
      const name = cvData.personalInfo.name.replace(/\s+/g, '_');
      if (previewType === 'cv') {
        await exportCVtoPDF(null, name, setExportPct, cvData);
        showToast('success', 'Ekspor PDF Selesai!');
      } else {
        await exportLetterToPDF(
          coverLetter.content,
          cvData.personalInfo,
          coverLetter.jobPosition,
          cvData.education,
          setExportPct,
          coverLetter.hrdName,
          coverLetter.company
        );
        showToast('success', 'Surat Lamaran Berhasil Diekspor!');
      }
    } catch (e) {
      showToast('error', `Export failed: ${e.message}`);
    } finally {
      setExporting(false);
      setExportPct(0);
    }
  }, [cvData, previewType, coverLetter, showToast]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:  return <TemplateSelector  onNext={nextStep} />;
      case 2:  return <PersonalInfoForm  onNext={nextStep} onBack={prevStep} />;
      case 3:  return <ExperienceForm    onNext={nextStep} onBack={prevStep} />;
      case 4:  return <EducationForm     onNext={nextStep} onBack={prevStep} />;
      case 5:  return <SkillsForm        onNext={nextStep} onBack={prevStep} />;
      case 6:  return <CertificationsForm onNext={nextStep} onBack={prevStep} />;
      case 7:  return <ProjectsForm      onNext={nextStep} onBack={prevStep} />;
      case 8:  return <OrganizationsForm onNext={nextStep} onBack={prevStep} />;
      case 9:  return <SummaryForm       onNext={nextStep} onBack={prevStep} />;
      case 10: return <CoverLetterGenerator onNext={nextStep} onBack={prevStep} onReady={setPreviewType} />;
      case 11: return <ATSChecker        onNext={nextStep} onBack={prevStep} />;
      case 12: return <EmailSender       onBack={prevStep} />;
      default: return null;
    }
  };

  // ── Authentication Lock Guard ──────────────────────────────
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-mesh overflow-x-hidden">
      <UpgradeModal />
      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={clearToast} />}
      </AnimatePresence>

      <KeywordHeatmap />

      <AnimatePresence>
        {showLoadModal && (
          <LoadModal
            onClose={() => setShowLoadModal(false)}
            onLoad={(d) => { setCVData(d); showToast('success', 'Welcome Back! Data restored.'); }}
          />
        )}
      </AnimatePresence>

      {/* ── Top Navigation (Minimalist) ──────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/85 backdrop-blur-xl shadow-sm rounded-3xl px-6 sm:px-10 py-5 flex items-center justify-between gap-6 border border-white/60 w-full max-w-[1400px] mx-auto"
        >
          {/* Brand */}
          <div className="flex items-center gap-4 cursor-pointer group flex-shrink-0" onClick={() => { setActiveTab('editor'); setCurrentStep(1); setShowMobileMenu(false); }}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-700 bg-[var(--primary-light)] group-hover:bg-[var(--primary)] group-hover:text-white`}>
              {appLogo ? (
                <img src={appLogo} alt="Logo" className="w-7 h-7 object-contain" />
              ) : (
                <Layers className="w-6 h-6 text-[var(--primary)] group-hover:text-white transition-colors" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-none font-display mb-1.5">{appName}</p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--secondary)]"></span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Kecerdasan Karier</p>
              </div>
            </div>
          </div>

          {/* Nav Tabs - Desktop */}
          <div className="hidden md:flex items-center gap-1 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            {[
              { id: 'editor', icon: <LayoutDashboard className="w-4 h-4" />, label: 'RUANG KERJA', show: true },
              { id: 'history', icon: <History className="w-4 h-4" />, label: 'ARSIP', show: true },
              { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'SISTEM', show: true },
              { id: 'admin', icon: <Users className="w-4 h-4" />, label: 'ADMIN', show: user?.role === 'Admin' }
             ].filter(tab => tab.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2.5 transition-all ${activeTab === tab.id ? 'bg-white text-[var(--primary)] shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              >
                {tab.icon}
                <span className="hidden lg:block">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 sm:gap-6 ml-auto lg:ml-0">
            
            <div className="hidden sm:flex items-center gap-2 lg:border-l border-slate-100 lg:pl-6">
              <button
                onClick={() => setShowLoadModal(true)}
                className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-2xl transition-all border border-transparent"
                title="Restore Progress"
              >
                <Cloud className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all border ${isSaving ? 'bg-[var(--primary-light)] text-[rgba(90,122,140,0.5)]' : 'text-slate-400 hover:text-[var(--secondary)] hover:bg-[rgba(108,158,124,0.05)]'}`}
                title="Auto Sync"
              >
                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--primary)] text-white shadow-xl shadow-[rgba(90,122,140,0.2)] hover:bg-[var(--primary-dark)] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {exporting ? <RefreshCw className="w-4 h-4 animate-spin text-white/80" /> : <Download className="w-4 h-4" />}
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {exporting ? `Menyusun...` : 'Ekspor PDF'}
              </span>
            </button>
            
            <div className="hidden lg:flex items-center gap-4 border-l border-slate-100 pl-6">
              <div className="text-right">
                <div className="text-[13px] font-bold text-slate-800 truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  Level {user.role}
                </div>
              </div>
              <button onClick={() => { logout(); setCVData(defaultCVData); }} className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all border border-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

             {/* Mobile Menu Toggle */}
             <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-4 right-4 z-40 p-4 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white md:hidden"
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'editor', icon: <LayoutDashboard className="w-5 h-5" />, label: 'PENYUSUN', show: true },
                  { id: 'history', icon: <History className="w-5 h-5" />, label: 'ARSIP', show: true },
                  { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'SISTEM', show: true },
                  { id: 'admin', icon: <Users className="w-5 h-5" />, label: 'ADMIN', show: user?.role === 'Admin' }
                ].filter(tab => tab.show).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setShowMobileMenu(false); }}
                    className={`p-4 rounded-3xl flex flex-col items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500'}`}
                  >
                    {tab.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user.name?.[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{user.name}</div>
                    <div className="text-[10px] text-slate-400">Anggota {user.role}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setShowLoadModal(true)} className="p-2 bg-white rounded-xl text-slate-400 shadow-sm"><Cloud className="w-4 h-4" /></button>
                   <button onClick={() => { logout(); setCVData(defaultCVData); }} className="p-2 bg-red-50 rounded-xl text-red-500 shadow-sm"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main Canvas ───────────────────────────────────── */}
      <main className="pt-32 sm:pt-40 pb-24 px-6 sm:px-12 max-w-[1500px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-12 lg:gap-20 items-start justify-center">

          {/* Left: Dynamic Workspace (Hidden when mobile is in preview mode) */}
          <div className={`w-full xl:max-w-4xl space-y-12 lg:space-y-16 ${previewType === 'preview_only' ? 'hidden xl:block' : 'block'}`}>
            <AnimatePresence mode="wait">
              {activeTab === 'editor' && (
                <motion.div key="editor" {...pageTransition} className="space-y-12 lg:space-y-16">
                  {/* Stepper HUD */}
                  <div className="card !p-4 sm:!p-10 !rounded-[2rem] sm:!rounded-[2.5rem] overflow-x-auto custom-scrollbar">
                    <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
                  </div>

                  {/* Contextual Form Workspace */}
                  <div className="card !p-8 sm:!p-16 !rounded-[3rem] min-h-[500px] sm:min-h-[700px] relative overflow-hidden group">
                    {/* Subtle Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-light)]/40 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-1000"></div>
                    
                    <div className="relative z-10">
                      {renderCurrentStep()}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="history" {...pageTransition}>
                   <div className="card !rounded-[2.5rem] !p-12">
                    <HistoryDashboard />
                   </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" {...pageTransition}>
                  <div className="card !p-10 sm:!p-16 !rounded-[3rem]">
                    <SettingsPage />
                  </div>
                </motion.div>
              )}

              {activeTab === 'admin' && user?.role === 'Admin' && (
                <motion.div key="admin" {...pageTransition}>
                  <div className="card !p-8 !rounded-[2.5rem]">
                    <AdminDashboard onClose={() => setActiveTab('editor')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Vision Console (Live Preview) */}
          {activeTab === 'editor' && (
            <motion.aside
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`w-full xl:w-[820px] xl:sticky xl:top-40 space-y-8 ${previewType === 'preview_only' ? 'block' : 'hidden xl:block'}`}
            >
              {/* Preview Controls Bar */}
              <div className="bg-white/80 backdrop-blur-xl p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 px-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800 font-display">Pratinjau Cerdas</span>
                </div>

                <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl">
                  {['cv', 'letter', 'all'].map(t => (
                    <button
                      key={t}
                      onClick={() => setPreviewType(t)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${previewType === t ? 'bg-[var(--primary)] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t === 'cv' ? 'CV' : t === 'letter' ? 'SURAT' : 'LENGKAP'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 border-l border-slate-100 pl-6 ml-2">
                  <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 text-slate-400 hover:text-[var(--primary)] transition-colors"><ZoomOut className="w-5 h-5" /></button>
                  <span className="text-[11px] font-bold text-slate-600 w-14 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(1.2, z + 0.1))} className="p-2 text-slate-400 hover:text-[var(--primary)] transition-colors"><ZoomIn className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Rendering Engine Container */}
              <div className="bg-white p-4 sm:p-8 rounded-[3rem] overflow-hidden shadow-master border border-slate-100 flex-1 h-[750px] xl:h-[calc(100vh-320px)] relative group">
                <div className="w-full h-full overflow-auto scroll-smooth flex justify-center custom-scrollbar">
                  <motion.div
                    layout
                    style={{ 
                      scale: zoom,
                      transformOrigin: 'top center',
                      width: '794px',
                      flexShrink: 0
                    }}
                    className="flex flex-col gap-16"
                  >
                    {previewType === 'all' ? (
                      <>
                        <div className="shadow-preview"><LetterPreview /></div>
                        <div className="shadow-preview"><CVPreview ref={cvPreviewRef} /></div>
                      </>
                    ) : (
                        <div className="shadow-preview">
                        {previewType === 'cv' || previewType === 'preview_only' ? <CVPreview ref={cvPreviewRef} /> : <LetterPreview />}
                        </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.aside>
          )}

        </div>
      </main>

      <footer className="py-24 border-t border-[var(--primary-light)] bg-white/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent"></div>
        <div className="max-w-[1400px] mx-auto px-12 flex flex-col items-center gap-10">
          <div className="flex items-center gap-4 text-[var(--accent)]">
            <div className="w-8 h-px bg-[var(--accent)] opacity-20"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] font-display">Protokol Kecerdasan Karier</p>
            <div className="w-8 h-px bg-[var(--accent)] opacity-20"></div>
          </div>
          <p className="text-xs font-medium text-slate-400 text-center max-w-sm leading-relaxed">
            Dirancang dengan presisi untuk profesional modern. <br />
            © 2026 {appName} — Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center gap-6">
             <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"><Layers className="w-3 h-3 text-slate-300" /></div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Mobile Preview Toggle */}
      <div className="xl:hidden fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setPreviewType(previewType === 'preview_only' ? 'cv' : 'preview_only')}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${previewType === 'preview_only' ? 'bg-slate-900 text-white rotate-[360deg]' : 'bg-[var(--primary)] text-white'}`}
        >
          {previewType === 'preview_only' ? <LayoutDashboard className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
