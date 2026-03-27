// src/hooks/useGroq.js
import { useCallback } from 'react';
import { useGAS } from './useGAS';
import useAuthStore from '../store/useAuthStore';

/**
 * useGroq Hook
 * Wrapper untuk memanggil AI (Groq/Gemini) via GAS Backend
 */
export function useGroq() {
  const { callGAS } = useGAS();

  /**
   * callAIProxy — Proxy pemanggilan AI ke backend
   */
  const callAIProxy = useCallback(async (prompt, isJson = false) => {
    const { user } = useAuthStore.getState();
    const isPremium = user?.role === 'Premium' || user?.role === 'Admin';

    if (!isPremium) {
      throw new Error('Premium Required: Fitur AI ini khusus untuk pengguna Premium.');
    }

    try {
      const res = await callGAS('callAI', { prompt, isJson });
      
      if (res && res.success) {
        let result = res.data;
        // Penanganan defensif: Pastikan mengembalikan string jika bukan mode JSON
        if (!isJson && typeof result !== 'string') {
          result = typeof result === 'object' ? JSON.stringify(result) : String(result);
        }
        return result;
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

  /**
   * improveContentAI — Tingkatkan kualitas konten teks (Summary/Experience)
   * Sekarang mendukung mode XYZ Formula untuk Experience
   */
  const improveContentAI = useCallback(async ({ type, content, cvData, mode = 'standard' }) => {
    let specificInstructions = '';
    const typeLower = type.toLowerCase();
    const isProfile = typeLower.includes('summary') || typeLower.includes('profil') || typeLower.includes('profile');
    const isExperience = typeLower.includes('experience') || typeLower.includes('pengalaman');
    
    if (mode === 'xyz' && isExperience) {
      specificInstructions = `
        GUNAKAN GOOGLE XYZ FORMULA: "Berhasil mencapai [X] yang diukur dengan [Y], dengan melakukan [Z]".
        - Fokus pada ANGKA dan HASIL NYATA.
        - Buat maksimal 3-4 poin saja.
        - FORMAT: Gunakan tag HTML <ul> dan <li>.
      `;
    } else if (isProfile) {
      specificInstructions = `
        - Tulis dalam bentuk PARAGRAF (BUKAN BULLET POINTS).
        - Gunakan gaya bahasa "Human-like Professional": Tidak kaku, tidak menggunakan kata-kata klise AI (seperti "I hope this finds you well", "delve", "comprehensive"), tapi tetap berwibawa.
        - Jelaskan value proposition secara elegan.
        - FORMAT: Gunakan tag HTML <p> saja.
      `;
    } else if (isExperience) {
      specificInstructions = `
        - Berikan narasi yang mendalam namun tetap to-the-point.
        - Fokus pada dampak strategis.
        - Buat maksimal 3-4 poin saja.
        - FORMAT: Gunakan tag HTML <ul> dan <li>.
      `;
    } else {
      specificInstructions = `
        - BUAT SANGAT RINGKAS DAN PADAT.
        - Maksimal 2-3 poin pendek saja.
        - FORMAT: Gunakan tag HTML <ul> dan <li>.
      `;
    }

    const prompt = `
      Tugas: Tingkatkan penulisan untuk "${type}" CV dengan gaya bahasa Manusia (Professional Human Tone).
      
      KONTEN SAAT INI:
      "${content}"
      
      INSTRUKSI WAJIB:
      ${specificInstructions}
      1. JANGAN GUNAKAN MARKDOWN SEPERTI **. Gunakan tag <strong> jika perlu penekanan pada kata kunci penting.
      2. KELUARKAN HASIL HANYA DALAM KODE HTML.
      3. OUTPUT HANYA HASIL PERBAIKAN TANPA PENJELASAN.
      4. Bahasa: Indonesia.
    `;

    return await callAIProxy(prompt);
  }, [callAIProxy]);

  /**
   * getSmartSkillsAI — Rekomendasi skills berdasarkan profil, pengalaman, & pendidikan
   */
  const getSmartSkillsAI = useCallback(async ({ cvData }) => {
    const prompt = `
      Tugas: Berikan rekomendasi SKILL (Hard Skills & Soft Skills) yang sangat spesifik dan relevan berdasarkan data profil pengguna berikut.
      
      KONTEKS PENGGUNA:
      Profile Summary: ${cvData.summary || 'Belum diisi'}
      Pendidikan: ${JSON.stringify(cvData.education.map(e => ({ inst: e.institution, field: e.field || e.degree })))}
      Pengalaman: ${JSON.stringify(cvData.experiences.map(e => ({ pos: e.position, desc: e.description })))}
      
      INSTRUKSI:
      1. Tampilkan dalam gaya bahasa MANUSIA yang profesional dan industri-sentris. 
      2. HINDARI kata-kata "AI-ish" seperti: "Optimalisasi", "Adaptasi", "Pengembangan Strategis", "Kolaborasi Lintas Fungsi".
      3. GUNAKAN istilah langsung yang dipakai di lapangan. Contoh: "Servis Mesin", "Mengajar Kelas", "Closing Sales", "Desain UI/UX", "Adobe Photoshop".
      4. PISAHKAN antara skill Teknis (Hard Skills) dan kemampuan Interpersonal (Soft Skills).
      5. Jika latar belakang Otomotif, fokus ke alat/teknik bengkel. Jika Guru, fokus ke metode ajar.
      6. Bahasa: Indonesia.
      7. OUTPUT HANYA JSON MURNI sesuai format di bawah.
      
      FORMAT JSON WAJIB:
      {
        "technical": ["Skill Teknis 1", "Skill Teknis 2", ...],
        "softSkills": ["Soft Skill 1", "Soft Skill 2", ...]
      }
    `;

    try {
      const response = await callAIProxy(prompt, true);
      const parsed = JSON.parse(response);
      return {
        technical: parsed.technical || [],
        softSkills: parsed.softSkills || []
      };
    } catch (e) {
      console.error('Error generating smart skills:', e);
      return { technical: [], softSkills: [] };
    }
  }, [callAIProxy]);

  return {
    generateCoverLetterAI,
    analyzeATSAI,
    optimizeCVAI,
    improveContentAI,
    getSmartSkillsAI
  };
}
