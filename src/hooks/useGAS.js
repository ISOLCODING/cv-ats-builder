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

  console.log('📡 Calling GAS Fetch:', payload.action);

  try {
    const response = await fetch(GAS_ENDPOINT, {
      method: 'POST',
      mode: 'cors', // Ubah ke 'cors' agar bisa baca response JSON
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS lebih suka text/plain untuk bypass preflight
      },
      body: JSON.stringify(payload),
    });

    // Cek jika response sukses (HTTP 200-299)
    if (!response.ok) {
      throw new Error(`GAS HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ GAS Fetch Error:', error);
    
    // Fallback message jika CORS error atau network error
    if (error.message.includes('fetch')) {
      throw new Error('Gagal menghubungi server (CORS/Network error). Pastikan GAS Web App di-publish ke "Anyone".');
    }
    throw error;
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
          saveCV:   'gsSaveCV',
          loadCV:   'gsLoadCV',
          listCVs:  'gsListCVs',
          deleteCV: 'gsDeleteCV',
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
          case 'loadCV':
            args = [payload.email];
            break;
          case 'deleteCV':
            args = [payload.id];
            break;
          case 'listCVs':
          default:
            args = [];
        }

        result = await callGASFunction(gasFunction, ...args);

      } else {
        // ── Mode 2: HTTP Fetch (development / external) ──────
        result = await callGASViaFetch({ action, ...payload });
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
    isLoading,
    error,
    isGASMode: isGASEnvironment(),
  };
}

export default useGAS;
