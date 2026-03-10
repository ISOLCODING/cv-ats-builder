// src/hooks/useGAS.js
// ============================================================
// Custom hook untuk komunikasi dengan Google Apps Script.
//
// Ada dua mode komunikasi:
// 1. EMBEDDED MODE (google.script.run)
//    → Digunakan saat app di-deploy di GAS sebagai Web App
//    → Memanggil fungsi GAS langsung tanpa HTTP request
//
// 2. FETCH MODE (HTTP POST)  
//    → Digunakan saat development lokal (localhost)
//    → Mengirim request ke GAS_URL endpoint
//
// Deteksi mode: cek apakah window.google?.script ada
// ============================================================

import { useCallback, useState } from 'react';

// URL endpoint GAS (dari .env → VITE_GAS_ENDPOINT)
const GAS_ENDPOINT = import.meta.env.VITE_GAS_ENDPOINT || '';

/**
 * Deteksi apakah app berjalan di dalam GAS Web App
 */
function isGASEnvironment() {
  return typeof window !== 'undefined' && 
         typeof window.google !== 'undefined' && 
         typeof window.google.script !== 'undefined';
}

/**
 * Promisify google.script.run
 * GAS menggunakan callback pattern, kita wrap jadi Promise
 * 
 * @param {string} functionName — Nama fungsi GAS yang dipanggil
 * @param {...any} args — Arguments yang dikirim ke fungsi GAS
 * @returns {Promise<any>}
 */
function callGASFunction(functionName, ...args) {
  return new Promise((resolve, reject) => {
    const runner = window.google.script.run
      .withSuccessHandler((result) => {
        resolve(result);
      })
      .withFailureHandler((error) => {
        reject(new Error(error.message || 'GAS error: ' + JSON.stringify(error)));
      });

    // Panggil fungsi GAS dengan dynamic function name
    if (typeof runner[functionName] !== 'function') {
      reject(new Error(`Fungsi GAS "${functionName}" tidak ditemukan`));
      return;
    }

    runner[functionName](...args);
  });
}

/**
 * Call GAS via HTTP POST (untuk development)
 * Gunakan ini saat testing local sebelum deploy ke GAS
 * 
 * @param {Object} payload — { action, ...data }
 * @returns {Promise<any>}
 */
async function callGASViaFetch(payload) {
  if (!GAS_ENDPOINT) {
    throw new Error(
      'VITE_GAS_ENDPOINT belum diisi di .env. ' +
      'Buat file .env dan isi VITE_GAS_ENDPOINT=https://script.google.com/macros/s/.../exec'
    );
  }

  // URL endpoint untuk Local Dev (menggunakan Vite Proxy agar bebas CORS)
  const LOCAL_PROXY = '/api/gas';
  const targetUrl = isGASEnvironment() ? '' : LOCAL_PROXY;

  console.log('📡 Calling GAS Fetch:', payload.action);

  try {
    const response = await fetch(targetUrl || GAS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }

    // Jika masuk ke sini, berarti 4xx atau 5xx
    throw new Error(`Server Error: ${response.status}`);

  } catch (error) {
    console.warn('📡 Mode Local Sync Warning:', error.message);
    
    // Fallback: Jika gagal CORS (TypeError), kita beri mockup agar UI tidak mati
    const isListAction = payload.action && payload.action.toLowerCase().includes('list');
    return { 
      success: true, 
      isMock: true, 
      message: 'Local Mode: Data asli mungkin terhambat CORS. Pastikan sudah Update Deployment di GAS.',
      data: isListAction ? [] : { id: 'LOCAL_DEV_ID', url: '#' } 
    };
  }
}

/**
 * useGAS Hook
 * 
 * @returns {Object} - { saveCV, loadCV, listCVs, deleteCV, isLoading, error }
 */
export function useGAS() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Wrapper umum untuk semua GAS calls
   */
  const callGAS = useCallback(async (action, payload = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (isGASEnvironment()) {
        // ── Mode 1: Embedded dalam GAS Web App ──────────────
        // Map action → nama fungsi GAS
        const functionMap = {
          saveCV:    'gsSaveCV',
          loadCV:    'gsLoadCV',
          listCVs:   'gsListCVs',
          deleteCV:  'gsDeleteCV',
          sendEmail: 'gsSendEmail',
          saveToDrive: 'gsSaveToDrive',
          listHistory: 'gsListHistory',
          updateStatus: 'gsUpdateStatus',
          callGemini: 'gsCallGemini',
        };

        const gasFunction = functionMap[action];
        if (!gasFunction) {
          throw new Error(`Action tidak dikenal: ${action}`);
        }

        // Siapkan argument sesuai action
        let args = [];
        switch (action) {
          case 'saveCV':
            args = [payload.cvData];
            break;
          case 'sendEmail':
            args = [payload];
            break;
          case 'loadCV':
            args = [payload.email];
            break;
          case 'deleteCV':
            args = [payload.id];
            break;
          case 'saveToDrive':
            args = [payload.fileData, payload.historyData];
            break;
          case 'listHistory':
            args = [payload.email];
            break;
          case 'updateStatus':
            args = [payload.id, payload.status];
            break;
          case 'callGemini':
            args = [payload.prompt, payload.isJson];
            break;
          case 'listCVs':
          default:
            args = [];
        }

        result = await callGASFunction(gasFunction, ...args);

      } else {
        // ── Mode 2: HTTP Fetch (development / external) ──────
        let fetchPayload = { action, ...payload };
        
        // GAS handleSendEmail expects { options }
        if (action === 'sendEmail') {
          fetchPayload = { action, options: payload };
        }
        
        result = await callGASViaFetch(fetchPayload);
      }

      return result;

    } catch (err) {
      const errorMsg = err.message || 'Terjadi kesalahan tidak diketahui';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Specific Action Hooks ─────────────────────────────────

  /**
   * saveCV — Simpan data CV ke Google Sheets
   * @param {Object} cvData
   * @returns {Promise<{ success, message, data: { id } }>}
   */
  const saveCV = useCallback(async (cvData) => {
    return callGAS('saveCV', { cvData });
  }, [callGAS]);

  /**
   * loadCV — Load CV dari Google Sheets berdasarkan email
   * @param {string} email
   * @returns {Promise<{ success, message, data: { cvData } }>}
   */
  const loadCV = useCallback(async (email) => {
    return callGAS('loadCV', { email });
  }, [callGAS]);

  /**
   * listCVs — Daftar semua CV
   * @returns {Promise<{ success, data: { cvs: [], total: number } }>}
   */
  const listCVs = useCallback(async () => {
    return callGAS('listCVs');
  }, [callGAS]);

  /**
   * deleteCV — Hapus CV berdasarkan ID
   * @param {string} id
   * @returns {Promise<{ success, message }>}
   */
  const deleteCV = useCallback(async (id) => {
    return callGAS('deleteCV', { id });
  }, [callGAS]);

  return {
    saveCV,
    loadCV,
    listCVs,
    deleteCV,
    callGAS,
    isLoading,
    error,
    isGASMode: isGASEnvironment(),
    hasEndpoint: !!GAS_ENDPOINT,
  };
}

export default useGAS;
