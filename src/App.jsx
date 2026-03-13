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
import KeywordHeatmap from './components/features/KeywordHeatmap';
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
          setExportPct,
          coverLetter.hrdName,
          coverLetter.company
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

      <KeywordHeatmap />

      <AnimatePresence>
        {showLoadModal && (
          <LoadModal
            onClose={() => setShowLoadModal(false)}
            onLoad={(d) => { setCVData(d); showToast('success', 'Welcome Back! Data restored.'); }}
          />
        )}
      </AnimatePresence>

      {/* ── Top Navigation (Royal Blue) ──────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 sm:p-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card shadow-master rounded-3xl lg:rounded-full px-4 sm:px-8 py-3 flex items-center justify-between lg:justify-start gap-4 lg:gap-12 border-white/80 w-full max-w-7xl mx-auto"
        >
          {/* Brand */}
          <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group flex-shrink-0" onClick={() => { setActiveTab('editor'); setCurrentStep(1); }}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center relative overflow-hidden transition-all duration-700 group-hover:rotate-6 ${appLogo ? 'bg-transparent' : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-indigo'}`}>
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
                  <Stars className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white/90" />
                </div>
              )}
            </div>
            <div className="hidden xs:block">
              <p className="text-sm sm:text-lg font-black text-slate-900 tracking-tighter uppercase leading-none font-display">{appName}</p>
              <p className="text-[8px] sm:text-[9px] font-black text-blue-600/60 uppercase tracking-[0.3em] leading-none mt-1 sm:mt-2 flex items-center gap-1.5 px-0.5">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Elite
              </p>
            </div>
          </div>

          {/* Nav Tabs - Responsive Visibility */}
          <div className="hidden md:flex items-center gap-1.5 p-1.5 bg-slate-100/50 backdrop-blur-md shadow-inner rounded-full border border-slate-200/50">
            {[
              { id: 'editor', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'history', icon: <History className="w-4 h-4" /> },
              { id: 'settings', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 lg:px-6 py-2 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all duration-500 ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-master scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
              >
                {tab.icon}
                <span className="hidden lg:block">{tab.id === 'editor' ? 'BUILDER' : tab.id === 'history' ? 'ARCHIVE' : 'SYSTEM'}</span>
              </motion.button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4 md:border-l border-slate-200/60 md:pl-6 lg:pl-8 ml-auto lg:ml-2">
            
            {/* Mobile View Toggle (Editor vs Preview) - Visible only on mobile/tablet */}
            <div className="xl:hidden flex items-center bg-slate-100/50 rounded-2xl p-1 border border-slate-200/40">
               <button 
                 onClick={() => setPreviewType(previewType === 'preview_only' ? 'cv' : 'preview_only')}
                 className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${previewType === 'preview_only' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
               >
                 <Eye className="w-4 h-4" />
               </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowLoadModal(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-blue-100"
                title="Cloud Restore"
              >
                <Cloud className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all border ${isSaving ? 'bg-blue-50 border-blue-100 text-blue-400' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 hover:border-emerald-100'}`}
                title="Save"
              >
                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="relative group flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {exporting ? <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin relative z-10 text-blue-400" /> : <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 relative z-10" />}
              <span className="relative z-10 text-white font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] whitespace-nowrap">
                {exporting ? `${exportPct}%` : 'Cetak'}
              </span>
            </button>
          </div>
        </motion.div>
      </header>

      {/* ── Main Canvas ───────────────────────────────────── */}
      <main className="pt-28 sm:pt-36 pb-24 px-4 sm:px-8 max-w-[1920px] mx-auto">
        <div className="flex flex-col xl:flex-row gap-8 lg:gap-16 items-start justify-center">

          {/* Left: Dynamic Workspace (Hidden when mobile is in preview mode) */}
          <div className={`w-full xl:max-w-4xl space-y-8 lg:space-y-12 ${previewType === 'preview_only' ? 'hidden xl:block' : 'block'}`}>
            <AnimatePresence mode="wait">
              {activeTab === 'editor' && (
                <motion.div key="editor" {...pageTransition} className="space-y-8 lg:space-y-10">
                  {/* Stepper HUD */}
                  <div className="glass-card p-6 sm:p-10 rounded-3xl sm:rounded-[3.5rem] shadow-master border-white/60">
                    <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
                  </div>

                  {/* Contextual Form Workspace */}
                  <div className="glass-card p-6 sm:p-14 rounded-3xl sm:rounded-[4rem] shadow-master border-white/80 min-h-[400px] sm:min-h-[600px] relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-40 sm:w-80 h-40 sm:h-80 bg-blue-50/40 rounded-full blur-3xl -mr-20 -mt-20 sm:-mr-40 sm:-mt-40 transition-transform group-hover:scale-125 duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-amber-50/30 rounded-full blur-3xl -ml-16 -mb-16 sm:-ml-32 sm:-mb-32 transition-transform duration-1000"></div>

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
                  <div className="glass-card p-8 sm:p-14 rounded-3xl sm:rounded-[3.5rem] shadow-master border-white/80 min-h-[400px] sm:min-h-[600px]">
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
              className={`w-full xl:w-[820px] xl:sticky xl:top-32 space-y-6 ${previewType === 'preview_only' ? 'block' : 'hidden xl:block'}`}
            >
              {/* Preview Controls Bar */}
              <div className="glass-card p-3 sm:p-4 rounded-2xl sm:rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-blue border-white/80">
                <div className="flex items-center gap-4 px-3 self-start sm:self-auto">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-900 font-display">Pratinjau CV</span>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl sm:rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                  {['cv', 'letter', 'all'].map(t => (
                    <button
                      key={t}
                      onClick={() => setPreviewType(t)}
                      className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${previewType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t === 'cv' ? 'RESUME' : t === 'letter' ? 'LETTER' : 'FULL'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 sm:ml-2 w-full sm:w-auto justify-center">
                  <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><ZoomOut className="w-5 h-5" /></button>
                  <span className="text-[10px] font-black text-slate-500 w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(1.2, z + 0.1))} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><ZoomIn className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Rendering Engine Container */}
              <div className="glass-card p-2 sm:p-6 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-master bg-white border-slate-100 flex-1 h-[calc(100vh-280px)] xl:h-[calc(100vh-280px)] relative group">
                <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none"></div>
                <div 
                  className="w-full h-full overflow-auto scroll-smooth p-4 sm:p-6 flex justify-center custom-scrollbar"
                >
                  <motion.div
                    layout
                    style={{ 
                      scale: zoom,
                      transformOrigin: 'top center',
                      width: '794px',
                      flexShrink: 0
                    }}
                    className="flex flex-col gap-12 sm:gap-16"
                  >
                    {previewType === 'all' ? (
                      <>
                        <div className="shadow-preview"><LetterPreview /></div>
                        <div className="shadow-preview"><CVPreview ref={cvPreviewRef} /></div>
                      </>
                    ) : (
                        <div className="shadow-preview bg-white">
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

      {/* Floating Action Button for Mobile Preview Toggle */}
      <div className="xl:hidden fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => setPreviewType(previewType === 'preview_only' ? 'cv' : 'preview_only')}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${previewType === 'preview_only' ? 'bg-slate-900 text-white rotate-[360deg]' : 'bg-blue-600 text-white'}`}
        >
          {previewType === 'preview_only' ? <LayoutDashboard className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
      </div>


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
