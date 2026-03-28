import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Clock, ShieldCheck, ArrowLeft, Eye, X, ZoomIn, Search, RefreshCw, Filter, MoreVertical, Crown, User, AlertCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard({ onClose }) {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedProof, setSelectedProof] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  if (user?.role?.toLowerCase() !== 'admin') {
    return (
      <div className="p-20 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold">Akses Terlarang</h2>
        <p className="text-slate-500">Anda tidak memiliki kredensial untuk mengakses pusat kontrol.</p>
        <button onClick={onClose} className="btn-primary px-8 mt-4">Keluar</button>
      </div>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ action: 'adminListUsers' })
      });
      const res = await response.json();
      if (res.success) setUsers(res.data);
    } catch (err) {
      setMessage('Gagal memuat data pengguna dari pangkalan data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (email) => {
    if (!window.confirm(`Setujui akun ${email} menjadi Premium?`)) return;
    try {
      const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ action: 'adminApproveUser', email })
      });
      const res = await response.json();
      if (res.success) {
        setMessage(`Akses Premium untuk ${email} telah diaktifkan.`);
        fetchUsers();
      } else {
        alert(`Gagal: ${res.message}`);
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungi server.');
    }
  };

  const handleReject = async (email) => {
    const reason = window.prompt(`Alasan penolakan untuk ${email}:`, 'Bukti transfer tidak jelas/valid');
    if (reason === null) return;
    try {
      const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ action: 'adminRejectUser', email, reason })
      });
      const res = await response.json();
      if (res.success) {
        setMessage(`Permintaan ${email} telah ditolak.`);
        fetchUsers();
      } else {
        alert(`Gagal: ${res.message}`);
      }
    } catch (e) {
      console.error(e);
      alert('Gagal menghubungi server.');
    }
  };

  const handleFixDatabase = async () => {
    if (!window.confirm("Sinkronisasi pangkalan data akan memperbaiki struktur kolom dan memulihkan data yang hilang. Lanjutkan?")) return;
    try {
      setLoading(true);
      const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ action: 'adminFixDatabase' })
      });
      const res = await response.json();
      setMessage(res.message);
      fetchUsers();
    } catch (e) {
      alert("Gagal melakukan sinkronisasi vault.");
    } finally {
      setLoading(false);
    }
  };

  const getDriveImageUrl = (url) => {
    if (!url || url === 'None') return '';
    // Handle Google Drive direct link
    if (url.includes('drive.google.com')) {
      const match = url.match(/[-\w]{25,}/);
      if (match) return `https://lh3.googleusercontent.com/d/${match[0]}`;
    }
    // If it's already a direct link or base64
    return url;
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h1 className="text-3xl font-display italic text-slate-800 mb-4">Akses Dibatasi</h1>
          <p className="text-slate-500 font-light leading-relaxed">
            Hanya personil dengan otorisasi khusus yang dapat mengakses pusat kendali ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-12 lg:p-16 max-w-[1600px] mx-auto min-h-screen font-sans bg-slate-50/30"
    >
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16">
        <div className="flex items-start gap-8">
          <button 
            onClick={onClose} 
            className="w-14 h-14 flex items-center justify-center bg-white hover:bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 shadow-soft group mt-2"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
          <div>
            <h1 className="text-5xl md:text-6xl font-display font-light text-slate-900 tracking-tight italic mb-3">
              Pusat Kendali <span className="text-slate-400">Registri</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-slate-200" />
              <p className="text-[11px] text-slate-400 font-medium tracking-[0.4em] uppercase">Manajemen Pengguna & Tata Kelola Global</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
            <input 
              type="text"
              placeholder="Cari entitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[2rem] w-full sm:w-[320px] text-sm focus:border-slate-300 transition-all shadow-soft outline-none italic font-light"
            />
          </div>
          
          <button 
            onClick={handleFixDatabase}
            className="px-8 h-14 bg-slate-900 text-white rounded-[2rem] text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black transition-all active:scale-95 flex items-center gap-3 shadow-premium"
          >
            <ShieldCheck className="w-4 h-4" />
            Sinkronisasi Vault
          </button>
          
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 rounded-[2rem] text-slate-400 hover:text-slate-800 transition-all shadow-soft active:rotate-180"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-10 p-5 bg-white border border-slate-100 text-slate-600 rounded-[2rem] text-sm font-light italic flex items-center gap-4 shadow-soft"
          >
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <span className="flex-1">{message}</span>
            <button onClick={() => setMessage('')} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {[
          { label: 'Total Entitas', value: users.length, icon: Users },
          { label: 'Elit Premium', value: users.filter(u => u.role === 'Premium').length, icon: Crown },
          { label: 'Penyetujuan Tertunda', value: users.filter(u => u.paymentStatus === 'Pending').length, icon: Clock },
          { label: 'Administrator Aktif', value: users.filter(u => u.role === 'Admin').length, icon: ShieldCheck },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-soft group hover:border-slate-200 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-all duration-500">
                <stat.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <div className="text-5xl font-display font-light text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold">
                <th className="p-10 pl-14">Identitas Entitas</th>
                <th className="p-10">Klasifikasi</th>
                <th className="p-10">Status Vault</th>
                <th className="p-10 pr-14 text-right">Direktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-32 text-center">
                    <RefreshCw className="w-12 h-12 text-slate-200 animate-spin mx-auto mb-6" />
                    <p className="text-slate-400 font-display italic text-xl">Mengakses Buku Besar...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-32 text-center">
                    <div className="max-w-xs mx-auto">
                      <Search className="w-12 h-12 text-slate-100 mx-auto mb-6" />
                      <p className="text-slate-400 font-light italic">Pencarian tidak menemukan hasil yang cocok dalam arsip.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-slate-50/20 transition-all duration-300">
                    <td 
                      className="p-10 pl-14 cursor-pointer"
                      onClick={() => {
                        if (u.paymentProof && u.paymentProof !== 'None') {
                          setSelectedProof({ url: u.paymentProof, name: u.name, status: u.paymentStatus });
                        } else {
                          setMessage(u.paymentStatus === 'Pending' ? `Konflik status: ${u.name} tertunda namun bukti tidak ditemukan.` : `${u.name} belum mengajukan kredensial.`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-all shadow-soft">
                          <User className="w-6 h-6 text-slate-300 group-hover:text-slate-600" />
                        </div>
                        <div>
                          <div className="font-display font-light text-2xl text-slate-800 group-hover:text-slate-900 transition-colors">
                            {u.name}
                          </div>
                          <div className="text-[12px] text-slate-400 font-medium tracking-tight mt-1">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-10">
                      <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                        u.role === 'Admin' ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' :
                        u.role === 'Premium' ? 'bg-white text-slate-800 border-slate-200' : 'bg-transparent text-slate-400 border-slate-100'
                      }`}>
                        {u.role === 'Admin' && <ShieldCheck className="w-3 h-3" />}
                        {u.role === 'Premium' && <Crown className="w-3 h-3 font-bold" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-10">
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                          u.paymentStatus === 'Approved' ? 'bg-white text-slate-600 border border-slate-100 shadow-soft' :
                          u.paymentStatus === 'Pending' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50/50 text-slate-300 border border-slate-50'
                        }`}>
                          {u.paymentStatus === 'Approved' ? <CheckCircle className="w-4 h-4" /> :
                           u.paymentStatus === 'Pending' ? <Clock className="w-4 h-4 animate-pulse text-slate-400" /> : null}
                          {u.paymentStatus || 'Unauthorized'}
                        </span>
                        
                        {(u.paymentProof && u.paymentProof !== 'None') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProof({ url: u.paymentProof, name: u.name, status: u.paymentStatus });
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 hover:border-slate-300 rounded-[1.2rem] text-slate-400 hover:text-slate-900 transition-all shadow-soft group/btn"
                            title="Verifikasi Kredensial"
                          >
                            <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-10 pr-14 text-right">
                      {u.paymentStatus === 'Pending' ? (
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleApprove(u.email); }}
                            className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase transition-all shadow-premium active:scale-95"
                          >
                            Validasi
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleReject(u.email); }}
                            className="px-8 py-3.5 bg-white border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase transition-all active:scale-95"
                          >
                            Batalkan
                          </button>
                        </div>
                      ) : (
                        <div className="text-slate-200 text-[10px] font-bold uppercase tracking-[0.4em] pr-4 italic">Selesai</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Overlay Modal */}
      <AnimatePresence>
        {selectedProof && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xl"
              onClick={() => setSelectedProof(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative bg-white rounded-[4rem] shadow-premium w-full max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200/50"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between p-8 md:p-10 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center shadow-soft">
                    <ZoomIn className="w-7 h-7 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-display font-light text-slate-900 tracking-tight italic flex items-center gap-4">
                      {selectedProof.name}
                      <span className="text-[10px] not-italic px-3 py-1 bg-slate-50 rounded-full text-slate-400 font-bold uppercase tracking-widest">{selectedProof.status}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium tracking-[0.3em] uppercase mt-2">Protokol Visibilitas Kredensial</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="w-14 h-14 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-all duration-300 group"
                >
                  <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>
              </div>

              {/* Modal Viewport */}
              <div className="flex-1 overflow-auto bg-slate-50/50 p-6 md:p-12 lg:p-16 flex items-center justify-center min-h-[400px]">
                <div className="relative w-full max-w-2xl group flex justify-center">
                  <img 
                    src={getDriveImageUrl(selectedProof.url)}
                    alt={`Proof for ${selectedProof.name}`} 
                    className="max-w-full h-auto rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border-[16px] border-white object-contain transition-all duration-700 hover:scale-[1.01]"
                    onError={(e) => {
                      const url = selectedProof.url;
                      const match = url.match(/[-\w]{25,}/);
                      if (match && !e.target.src.includes('thumbnail')) {
                         e.target.src = `https://drive.google.com/thumbnail?id=${match[0]}&sz=w1200`;
                      } else {
                         e.target.style.display = 'none';
                         const parent = e.target.parentElement;
                         if(parent && !parent.querySelector('.error-gate')) {
                            const errorEl = document.createElement('div');
                            errorEl.className = "error-gate text-center p-16 bg-white rounded-[3rem] border border-slate-100 shadow-soft max-w-sm";
                            errorEl.innerHTML = `
                              <div class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg class="w-8 h-8 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                              </div>
                              <h4 class="text-2xl font-display italic text-slate-800 mb-3">Gateway Error</h4>
                              <p class="text-[11px] text-slate-400 uppercase tracking-widest leading-loose mb-8">Credential visibility restricted by host protocol. Access denied at this node.</p>
                              <a href="${url}" target="_blank" class="inline-flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">Manual Override</a>
                            `;
                            parent.appendChild(errorEl);
                         }
                      }
                    }}
                  />
                  
                  <div className="absolute -bottom-6 bg-white text-slate-400 text-[9px] font-bold uppercase tracking-[0.4em] px-10 py-4 rounded-[1.5rem] shadow-soft flex items-center gap-3 border border-slate-100">
                    <ShieldCheck className="w-3.5 h-3.5" /> Akses Arsip Resolusi Tinggi
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-8 md:p-10 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <a 
                  href={selectedProof.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 h-18 flex items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-[2rem] text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-500 border border-slate-100"
                >
                  <ExternalLink className="w-5 h-5 text-slate-400" /> Periksa Sumber Orisinal
                </a>
                <button
                  onClick={() => setSelectedProof(null)}
                  className="w-full sm:w-auto px-16 h-18 bg-slate-900 text-white rounded-[2rem] text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black transition-all shadow-premium"
                >
                  Tutup Rekaman
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
