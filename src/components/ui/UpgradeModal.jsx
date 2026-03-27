import React, { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, AlertCircle, X, Check, Upload, Image as ImageIcon, Zap, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';

export default function UpgradeModal() {
  const { user, requestUpgrade, refreshUserStatus, isLoading, error, showUpgradeModal, setShowUpgradeModal } = useAuthStore();
  const [proof, setProof] = useState(null); // base64 string
  const [isResetting, setIsResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync dengan server saat modal dibuka
  React.useEffect(() => {
    if (showUpgradeModal) {
      refreshUserStatus();
      setProof(null);
      setIsResetting(false);
    }
  }, [showUpgradeModal]);

  if (!showUpgradeModal) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProof(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRequest = async () => {
    if (!proof) {
      alert("Silakan unggah bukti transfer terlebih dahulu!");
      return;
    }
    const success = await requestUpgrade(proof);
    if (success) {
      setProof(null);
      setIsResetting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProofPreview = () => {
    if (proof) return proof;
    if (user?.paymentProof && user.paymentProof !== 'None' && !isResetting) {
        const url = user.paymentProof;
        if (url.includes('drive.google.com')) {
            const match = url.match(/[-\w]{25,}/);
            if (match) return `https://lh3.googleusercontent.com/d/${match[0]}`;
        }
        return url;
    }
    return null;
  };

  const currentProof = getProofPreview();

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
        onClick={() => setShowUpgradeModal(false)}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-premium overflow-hidden flex flex-col border border-slate-200/50"
      >
        <button 
          onClick={() => setShowUpgradeModal(false)} 
          className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-all z-10 group"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <div className="p-10 pb-6 text-center">
          <div className="w-20 h-20 mx-auto bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-soft group border border-slate-100">
            <Crown className="w-10 h-10 text-slate-800 transition-transform duration-700 group-hover:rotate-12" />
          </div>
          <h3 className="text-4xl font-display font-light text-slate-900 italic tracking-tight mb-3">Premium <span className="text-slate-400">Upgrade</span></h3>
          <p className="text-[11px] text-slate-400 font-medium tracking-[0.3em] uppercase">Membuka Gerbang Karir Profesional Anda</p>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
          <div className="space-y-8">
            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-4">
               {[
                 { icon: Zap, label: "AI Writing Assistant" },
                 { icon: ImageIcon, label: "Premium Templates" },
                 { icon: ShieldCheck, label: "ATS Optimization" },
                 { icon: CheckCircle2, label: "Direct Recruiter Mail" }
               ].map((f, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 font-sans">
                   <f.icon className="w-4 h-4 text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">{f.label}</span>
                 </div>
               ))}
            </div>

            {/* Payment Instructions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Protocol Transaksi</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-premium relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                       <CheckCircle2 className="w-3 h-3 text-slate-500" /> Metode Pembayaran
                    </h4>
                    <div className="text-[11px] font-medium text-slate-300 uppercase tracking-widest mb-1">Bank Central Asia (BCA)</div>
                    <div className="text-3xl font-display font-light italic mb-2">1234 5678 90</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">a/n FAISHOL ANGGA REZZA</div>
                  </div>
                  <button 
                    onClick={() => copyToClipboard('1234567890')}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90"
                    title="Copy Account Number"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-400" />}
                  </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Nominal Transfer</span>
                  <span className="text-xl font-display font-light">Rp 49.000</span>
                </div>
              </div>
            </div>

            {/* Proof Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Autentikasi Pembayaran</label>
                {user?.paymentStatus === 'Pending' && !isResetting && (
                   <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest animate-pulse">Pending Review</span>
                )}
              </div>

              {!currentProof || isResetting ? (
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-100 rounded-[2.5rem] cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all group bg-slate-50/50">
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-soft border border-slate-50 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Unggah Bukti Struk</p>
                    <p className="text-[9px] text-slate-400 font-light italic">PNG/JPG up to 2MB</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative group border border-slate-100 bg-slate-50/50 rounded-[2.5rem] p-4 flex flex-col items-center justify-center h-auto min-h-[220px] shadow-soft overflow-hidden">
                    <img 
                      src={currentProof} 
                      alt="Bukti Transfer" 
                      className="max-h-64 max-w-full object-contain rounded-3xl shadow-premium border-4 border-white transition-all duration-700 hover:scale-[1.02]"
                      onError={(e) => {
                         // Hidden and show placeholder if failed
                         e.target.style.display = 'none';
                         const parent = e.target.parentElement;
                         if (parent && !parent.querySelector('.img-err')) {
                             const div = document.createElement('div');
                             div.className = "img-err text-center p-8";
                             div.innerHTML = '<div class="w-12 h-12 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div><p class="text-[10px] text-slate-400 uppercase tracking-widest">Credential Restricted</p>';
                             parent.appendChild(div);
                         }
                      }}
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => setIsResetting(true)}
                        className="w-10 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-slate-800 rounded-full shadow-lg transition-all"
                        title="Upload Ulang"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setProof(null); if (user?.paymentStatus !== 'Pending') setIsResetting(false); }}
                        className="w-10 h-10 flex items-center justify-center bg-rose-500 text-white rounded-full shadow-lg transition-all"
                        title="Hapus"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                </div>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-medium flex items-center gap-4 italic"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
              </motion.div>
            )}

            {user?.paymentStatus === 'Pending' && !isResetting ? (
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-center">
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                    Bukti transaksi sedang dalam proses verifikasi administratif. Mohon tunggu dalam kurun waktu 1x24 jam.
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRequest}
                disabled={isLoading || !proof}
                className="w-full py-6 bg-slate-900 hover:bg-black text-white rounded-[2rem] font-bold uppercase tracking-[0.3em] text-[11px] shadow-premium transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Memproses Arsip...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-400" />
                    Final Konfirmasi
                  </>
                )}
              </button>
            )}
            
            <p className="text-[9px] text-center text-slate-300 uppercase tracking-widest mt-4">
              Secure Encrypted Portal v8.4.1
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
