import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Save, Upload, RefreshCw, X,
  Zap, CheckCircle2, AlertTriangle, Info, ZoomIn, ZoomOut,
  Trash2, Menu, History, LayoutDashboard, Mail, Target, Eye, Layers,
  ChevronRight, Sparkles, Cloud, Stars, Settings, Globe
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
import CVPreview        from './components/preview/CVPreview';
import LetterPreview from './components/preview/LetterPreview';
import useCVStore       from './store/useCVStore';
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
    success: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-amber-500" />,
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
    >
      <div className="glass-card shadow-indigo p-4 rounded-3xl flex items-center gap-4 border-white/80">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase mb-1">
            {toast.type === 'success' ? 'Brilliant!' : 'Perhatian'}
          </p>
          <p className="text-xs font-bold text-slate-500">{toast.message}</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
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
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Restore Data</h3>
          <p className="text-sm font-bold text-slate-400">Sync with your previous career intelligence.</p>
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
            <button onClick={onClose} className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <button
              onClick={handle}
              disabled={loading}
              className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-blue hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Decrypting...' : 'Restore Assets'}
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
  const [activeTab, setActiveTab] = useState('editor');
  const [previewType, setPreviewType] = useState('cv'); 
  const [showLoadModal, setShowLoadModal]   = useState(false);

  const {
    currentStep, nextStep, prevStep, setCurrentStep,
    cvData, setCVData, savedCVId, setSavedCVId,
    coverLetter,
    isSaving, setIsSaving, toast, showToast, clearToast,
    translateCVData
  } = useCVStore();

  const appSettings = useCVStore(state => state.appSettings);
  const appLogo = appSettings?.appLogo;
  const appName = appSettings?.appName || 'CV Master';
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
      showToast(isGASMode ? 'error' : 'info', isGASMode ? 'Connection lost' : 'Local Mode: Progress saved locally');
    } finally { setIsSaving(false); }
  }, [cvData, saveCV, setIsSaving, setSavedCVId, showToast, isGASMode]);

  const handleExport = useCallback(async () => {
    if (!cvData?.personalInfo?.name) return showToast('error', 'Name is required for PDF export');
    setExporting(true); setExportPct(0);
    try {
      const name = cvData.personalInfo.name.replace(/\s+/g, '_');
      if (previewType === 'cv') {
        await exportCVtoPDF(null, name, setExportPct, cvData);
        showToast('success', 'PDF Genesis Complete!');
      } else {
        await exportLetterToPDF(
          coverLetter.content,
          cvData.personalInfo,
          coverLetter.jobPosition,
          cvData.education,
          setExportPct
        );
        showToast('success', 'Letter Exported Successfully!');
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

  return (
    <div className="min-h-screen bg-mesh overflow-x-hidden">
      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={clearToast} />}
      </AnimatePresence>

      <AnimatePresence>
        {showLoadModal && (
          <LoadModal
            onClose={() => setShowLoadModal(false)}
            onLoad={(d) => { setCVData(d); showToast('success', 'Welcome Back! Data restored.'); }}
          />
        )}
      </AnimatePresence>

      {/* ── Top Navigation (Royal Blue) ──────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card shadow-master rounded-full px-8 py-3.5 flex items-center gap-12 border-white/80"
        >
          {/* Brand */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setActiveTab('editor'); setCurrentStep(1); }}>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${appLogo ? 'bg-transparent' : 'bg-[#0066FF] shadow-blue'}`}>
              {appLogo ? (
                <motion.img
                  key={appLogo}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={appLogo}
                  alt="Brand Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={`${import.meta.env.BASE_URL}logo.png`}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.classList.remove('hidden');
                    }}
                  />
                  <Stars className="w-6 h-6 fill-current text-white/90 hidden" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none">{appName}</p>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-400"></span> Royal Protocol
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 shadow-inner rounded-full">
            {[
              { id: 'editor', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'history', icon: <History className="w-4 h-4" /> },
              { id: 'settings', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variants={navItemVariants}
                animate={activeTab === tab.id ? 'active' : 'inactive'}
                className="px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all"
              >
                {tab.icon}
                {tab.id === 'editor' ? 'DASHBOARD' : tab.id === 'history' ? 'RIWAYAT' : 'PENGATURAN'}
              </motion.button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-4 border-l border-slate-100 pl-10 ml-2">
            
            {/* Language Toggle */}
            <div className="flex items-center bg-slate-50 rounded-full p-1 shadow-inner relative">
              <button
                onClick={() => language !== 'id' && translateCVData('id')}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all z-10 
                  ${language === 'id' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-slate-600'}`}
              >
                ID
              </button>
              <button
                onClick={() => language !== 'en' && translateCVData('en')}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all z-10 
                  ${language === 'en' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setShowLoadModal(true)}
              className="p-3.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
              title="Cloud Restore"
            >
              <Cloud className="w-5.5 h-5.5" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${isSaving ? 'bg-blue-50 text-blue-400' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
            >
              {isSaving ? <RefreshCw className="w-5.5 h-5.5 animate-spin" /> : <Save className="w-5.5 h-5.5" />}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="group flex items-center gap-3 px-8 py-3.5 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-[10px] active:scale-95 disabled:opacity-50"
            >
              {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />}
              {exporting ? `${exportPct}%` : 'Cetak PDF'}
            </button>
          </div>
        </motion.div>
      </header>

      {/* ── Main Canvas ───────────────────────────────────── */}
      <main className="pt-36 pb-24 px-8 max-w-[1920px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-16 items-start justify-center">

          {/* Left: Dynamic Workspace */}
          <div className="w-full xl:max-w-4xl space-y-12">
            <AnimatePresence mode="wait">
              {activeTab === 'editor' && (
                <motion.div key="editor" {...pageTransition} className="space-y-10">
                  {/* Stepper HUD */}
                  <div className="glass-card p-10 rounded-[3.5rem] shadow-master border-white/60">
                    <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
                  </div>

                  {/* Contextual Form Workspace */}
                  <div className="glass-card p-14 rounded-[4rem] shadow-master border-white/80 min-h-[600px] relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/40 rounded-full blur-3xl -mr-40 -mt-40 transition-transform group-hover:scale-125 duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/30 rounded-full blur-3xl -ml-32 -mb-32 transition-transform duration-1000"></div>

                    <div className="relative z-10">
                      {renderCurrentStep()}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="history" {...pageTransition}>
                  <HistoryDashboard />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" {...pageTransition}>
                  <div className="glass-card p-14 rounded-[3.5rem] shadow-master border-white/80 min-h-[600px]">
                    <SettingsPage />
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
              className="w-full xl:w-[820px] sticky top-32 space-y-6"
            >
              {/* Preview Controls Bar */}
              <div className="glass-card p-4 rounded-[2rem] flex items-center justify-between shadow-blue border-white/80">
                <div className="flex items-center gap-4 px-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-900">Pratinjau CV</span>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-2xl">
                  {['cv', 'letter', 'all'].map(t => (
                    <button
                      key={t}
                      onClick={() => setPreviewType(t)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${previewType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 border-l border-slate-100 pl-4 ml-2">
                  <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors"><ZoomOut className="w-5 h-5" /></button>
                  <span className="text-xs font-black text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(1.2, z + 0.1))} className="p-2.5 text-slate-400 hover:text-blue-600 transition-colors"><ZoomIn className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Rendering Engine Container */}
              <div className="glass-card p-6 rounded-[3rem] overflow-hidden shadow-master bg-white border-slate-100 h-[calc(100vh-280px)] relative group">
                <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none"></div>
                <div 
                  className="w-full h-full overflow-auto scroll-smooth p-6 flex justify-center custom-scrollbar"
                >
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
                        <div className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]"><LetterPreview /></div>
                        <div className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]"><CVPreview ref={cvPreviewRef} /></div>
                      </>
                    ) : (
                        <div className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] bg-white">
                        {previewType === 'cv' ? <CVPreview ref={cvPreviewRef} /> : <LetterPreview />}
                        </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.aside>
          )}

        </div>
      </main>

      <footer className="py-16 border-t border-slate-100 bg-white/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-8">
          <div className="flex items-center gap-3 text-amber-500">
            <Stars className="w-5 h-5 fill-current" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em]">Royal Protocol Activated</p>
            <Stars className="w-5 h-5 fill-current" />
          </div>
          <p className="text-[11px] font-bold text-slate-400 text-center max-w-sm leading-loose">
            Precision engineered for career excellence. Crafted with mastery in every pixel.
          </p>
        </div>
      </footer>
    </div>
  );
}
