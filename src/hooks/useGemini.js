// src/hooks/useGemini.js
import { useCallback } from 'react';
import { useGAS } from './useGAS';

/**
 * useGemini Hook
 * Wrapper untuk memanggil Gemini AI via GAS Backend (Mode Production)
 * atau fallback ke Direct Fetch (Mode Local).
 */
export function useGemini() {
  const { callGAS } = useGAS();

  /**
   * callAIPRoxy — Proxy pemanggilan AI ke backend
   */
  const callAIProxy = useCallback(async (prompt, isJson = false) => {
    try {
      const res = await callGAS('callGemini', { prompt, isJson });
      
      if (res && res.success) {
        return res.data; // Mengandung teks respon AI
      }
      
      throw new Error(res?.message || 'AI Backend Error');
    } catch (error) {
      console.error('AI Proxy Error:', error);
      throw error;
    }
  }, [callGAS]);

  /**
   * generateCoverLetter — Generate surat lamaran via AI
   */
  const generateCoverLetterAI = useCallback(async ({ cvData, tone, jobPosition, company, hrdName }) => {
    const prompt = `
      Tuliskan SURAT LAMARAN KERJA (Cover Letter) dalam format HTML menggunakan tag <p> dan <strong>.
      
      DATA PELAMAR:
      Nama: ${cvData.personalInfo.name}
      Pendidikan: ${cvData.education?.[0]?.institution} (${cvData.education?.[0]?.degree})
      Skill Utama: ${cvData.skills.technical.slice(0, 5).join(', ')}
      Target Posisi: ${jobPosition}
      Perusahaan: ${company || '[Tujuan Perusahaan]'}
      Nama HRD: ${hrdName || 'Bapak/Ibu HRD'}
      Tone: ${tone}
      
      ATURAN:
      - MULAI dari "Dengan hormat,".
      - Jika ada Nama HRD (${hrdName}), gunakan sapaan personal seperti "Dengan hormat Bapak/Ibu ${hrdName},".
      - JANGAN sertakan data pengirim/penerima di bagian HEADER (seperti Alamat/Tanggal).
      - JANGAN sertakan penutup Nama/Tanda Tangan di bawah.
      - HANYA isi suratnya saja (body).
    `;
    
    return await callAIProxy(prompt);
  }, [callAIProxy]);

  /**
   * analyzeATSAI — Cek kecocokan ATS via AI
   */
  const analyzeATSAI = useCallback(async ({ cvData, jobDescription, coverLetter }) => {
    const prompt = `
      Analisis CV dan Surat Lamaran terhadap Job Description berikut. 
      Output harus dalam JSON murni sesuai format.
      
      JOB DESCRIPTION: ${jobDescription}
      ---
      DATA CV: ${JSON.stringify(cvData)}
      ---
      ISI SURAT LAMARAN: ${coverLetter?.content || 'Tidak ada'}
      
      FORMAT JSON WAJIB:
      {
        "score": number (0-100),
        "breakdown": { "keywordMatch": number, "formatScore": number, "relevance": number },
        "matchedKeywords": ["array"],
        "missingKeywords": ["array"],
        "specificSuggestions": ["array minimum 5 saran"],
        "experienceRelevance": "string singkat kesimpulan kecocokan"
      }
    `;

    try {
      const response = await callAIProxy(prompt, true);
      return JSON.parse(response);
    } catch (e) {
      // Fallback data jika AI gagal
      return {
        score: 50,
        breakdown: { keywordMatch: 50, formatScore: 80, relevance: 40 },
        matchedKeywords: [],
        missingKeywords: [],
        specificSuggestions: ["Gagal menganalisis detail. Hubungi admin atau cek API Key di GAS Settings."],
        experienceRelevance: "Analisis tidak dapat disimpulkan."
      };
    }
  }, [callAIProxy]);

  /**
   * optimizeCVAI — Optimalkan data CV via AI
   */
  const optimizeCVAI = useCallback(async ({ cvData, jobDescription }) => {
    const prompt = `
      Tugas: Optimalkan CV agar lolos seleksi ATS (Applicant Tracking System) secara cerdas.
      
      JOB DESCRIPTION TARGET:
      ${jobDescription}
      
      DATA CV SEKARANG:
      Summary: ${cvData.summary}
      Technical Skills: ${cvData.skills.technical.join(", ")}
      Experience: ${JSON.stringify(cvData.experiences.map(e => ({ pos: e.position, desc: e.description })))}
      
      INSTRUKSI:
      1. Buat "optimizedSummary" yang profesional, kuat, dan mengandung keyword dari JD. Gunakan format HTML <p> dan <strong>.
      2. Pilih "suggestedSkills" yang paling relevan dari JD (maksimal 15 skills).
      3. HANYA OUTPUT JSON.
      
      FORMAT JSON:
      {
        "optimizedSummary": "isi HTML di sini...",
        "suggestedSkills": ["skill1", "skill2", ...]
      }
    `;

    const response = await callAIProxy(prompt, true);
    return JSON.parse(response);
  }, [callAIProxy]);

  return {
    generateCoverLetterAI,
    analyzeATSAI,
    optimizeCVAI
  };
}
