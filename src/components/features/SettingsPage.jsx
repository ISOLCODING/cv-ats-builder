import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Image, Layout, Save, RefreshCw, 
  Trash2, Stars, Cloud, Smartphone, Monitor, Shield
} from 'lucide-react';
import useCVStore from '../../store/useCVStore';
import Button from '../ui/Button';

export default function SettingsPage() {
  const { appSettings, updateSettings, showToast } = useCVStore();
  const logoInputRef = useRef(null);
  const favInputRef = useRef(null);
  
  const handleFileChange = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for localStorage safety
      showToast('error', 'File size too large. Max 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (v) => {
      updateSettings({ [type]: v.target.result });
      showToast('success', `${type === 'favicon' ? 'Favicon' : 'App Logo'} updated successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const resetToDefault = () => {
    updateSettings({
      appLogo: '',
      favicon: '',
      appName: 'CV ATS Builder Premium'
    });
    showToast('info', 'Pengaturan berhasil dikembalikan.');
  };

  return (
    <div className="space-y-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-6 pb-10 border-b border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-gold group relative">
          <Settings className="w-8 h-8 animate-spin-slow transition-transform" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
            Pengaturan <span className="text-blue-600">Sistem</span>
          </h2>
          <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mt-1.5 leading-none">
            Kelola Logo & Nama Aplikasi
          </p>
        </div>
      </div>

      {/* ── Branding Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* App Name Card */}
        <div className="glass-card p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Layout className="w-4 h-4" /></div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Nama Aplikasi</h4>
          </div>
          <div className="space-y-2">
            <input 
              type="text" 
              value={appSettings.appName}
              onChange={(e) => updateSettings({ appName: e.target.value })}
              placeholder="Your App Name"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none font-bold text-slate-800 text-sm transition-all"
            />
            <p className="text-[10px] font-bold text-slate-400">Nama ini akan muncul di navbar dan judul halaman.</p>
          </div>
        </div>

        {/* Global Controls Card */}
        <div className="glass-card p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center"><Shield className="w-4 h-4" /></div>
               <h4 className="text-xs font-black uppercase tracking-widest text-blue-100">Aksi Global</h4>
           </div>
           <div className="flex flex-col gap-3">
              <Button variant="secondary" size="sm" onClick={resetToDefault} className="w-full justify-start gap-3">
                 <RefreshCw className="w-4 h-4" /> Reset Logo & Nama
              </Button>
              <Button variant="danger" size="sm" onClick={() => localStorage.clear()} className="w-full justify-start gap-3">
                 <Trash2 className="w-4 h-4" /> Hapus Semua Data
              </Button>
           </div>
        </div>
      </div>

      {/* ── Icon Management ── */}
      <div className="glass-card p-10 rounded-[3rem] shadow-master border border-white/80 space-y-10 group overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 opacity-20 rounded-full blur-3xl -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-1000"></div>

        <div className="flex items-center gap-3 relative z-10">
           <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm"><Image className="w-5 h-5" /></div>
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Visual Assets Portfolio</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          {/* Logo Upload */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Primary Logo</p>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-lg uppercase">PNG / SVG / JPG</div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner group/logo relative">
                {appSettings.appLogo ? (
                  <img src={appSettings.appLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <Stars className="w-10 h-10 text-slate-100" />
                )}
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                   <Monitor className="text-white w-6 h-6" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <input 
                  type="file" 
                  ref={logoInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange('appLogo', e)} 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => logoInputRef.current?.click()}
                >
                  Upload New Logo
                </Button>
                <p className="text-[10px] font-bold text-slate-400">Used in high-visibility areas like the header navigation.</p>
              </div>
            </div>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Browser Favicon</p>
              <div className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-lg uppercase">ICO / PNG</div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner group/fav relative">
                {appSettings.favicon ? (
                  <img src={appSettings.favicon} alt="Favicon Preview" className="w-full h-full object-cover p-4" />
                ) : (
                  <Layout className="w-10 h-10 text-slate-100" />
                )}
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/fav:opacity-100 transition-opacity">
                   <Smartphone className="text-white w-6 h-6" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <input 
                  type="file" 
                  ref={favInputRef}
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange('favicon', e)} 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => favInputRef.current?.click()}
                >
                  Upload Favicon
                </Button>
                <p className="text-[10px] font-bold text-slate-400">Appears in browser tabs and mobile bookmark screens.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── System Intel ── */}
      <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] flex items-center gap-6 group">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
             <Cloud className="w-7 h-7" />
          </div>
          <div>
             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 mb-1">Persistent Intelligence</h5>
             <p className="text-xs font-bold text-slate-500 max-w-2xl leading-relaxed">
               All configurations are stored locally in your cryptographic browser storage. This ensures your branding remains consistent across sessions without external dependencies.
             </p>
          </div>
      </div>
    </div>
  );
}
