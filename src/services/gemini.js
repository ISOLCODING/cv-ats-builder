const GAS_ENDPOINT = import.meta.env.VITE_GAS_ENDPOINT || '';

/**
 * Call Gemini API with a prompt
 * Diarahkan melalui Google Apps Script Backend agar API Key jauh lebih aman.
 */
async function callGemini(prompt, isJson = false) {
  // Cek apakah di dalam environment GAS
  const isGASEnv = typeof window !== 'undefined' && 
                   typeof window.google !== 'undefined' && 
                   typeof window.google.script !== 'undefined';

  try {
    let rawText = '';

    if (isGASEnv) {
      rawText = await new Promise((resolve, reject) => {
        window.google.script.run
          .withSuccessHandler((res) => {
            if (res.success) resolve(res.data);
            else reject(new Error(res.message));
          })
          .withFailureHandler((err) => reject(new Error(err.message)))
          .gsCallGemini(prompt, isJson);
      });
    } else {
      // Local dev fetch via GAS Endpoint
      if (!GAS_ENDPOINT) throw new Error("VITE_GAS_ENDPOINT tidak ditemukan di .env");

      const response = await fetch(GAS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "callGemini", prompt, isJson }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Gagal menghubungi AI Server");
      
      rawText = data.data;
    }

    if (!rawText) throw new Error("No response from AI model");

    let text = rawText;
    if (isJson) {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        text = text.substring(start, end + 1);
      }
      text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error via GAS:", error);
    throw error;
  }
}

/**
 * Generate Cover Letter (Surat Lamaran)
 */
export async function generateCoverLetter({ cvData, tone, jobPosition, company, hrdName }) {
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
  
  return await callGemini(prompt);
}

/**
 * AI ATS Checker (CV + Cover Letter)
 */
export async function analyzeATS({ cvData, jobDescription, coverLetter }) {
  const prompt = `
    Analisis CV dan Surat Lamaran terhadap Job Description berikut. 
    Output harus dalam JSON murni.
    
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
    const response = await callGemini(prompt, true);
    return JSON.parse(response);
  } catch (error) {
    console.warn("ATS Analysis Fallback:", error);
    return {
      score: 50,
      breakdown: { keywordMatch: 50, formatScore: 80, relevance: 40 },
      matchedKeywords: [],
      missingKeywords: [],
      specificSuggestions: ["Gagal menganalisis detail. Pastikan koneksi internet stabil."],
      experienceRelevance: "Analisis tidak dapat disimpulkan."
    };
  }
}

/**
 * Optimize CV Data based on Job Description
 */
export async function optimizeCV({ cvData, jobDescription }) {
  const prompt = `
    Tugas: Optimalkan CV agar lolos seleksi ATS (Applicant Tracking System) secara cerdas.
    
    JOB DESCRIPTION TARGET:
    ${jobDescription}
    
    DATA CV SEKARANG:
    Summary: ${cvData.summary}
    Technical Skills: ${cvData.skills.technical.join(", ")}
    Experience: ${JSON.stringify(cvData.experiences.map(e => ({ pos: e.position, desc: e.description })))}
    
    INSTRUKSI:
    1. Buat "optimizedSummary" yang profesional, kuat, dan mengandung keyword dari JD. Gunakan format HTML <p> dan <strong>. Pastikan isinya berfokus pada hasil (result-oriented).
    2. Pilih "suggestedSkills" yang paling relevan dari JD (maksimal 15 skills).
    3. HANYA OUTPUT JSON. JANGAN ADA TEXT LAIN. JANGAN ADA NEWLINE LITERAL DALAM STRING.
    
    FORMAT JSON:
    {
      "optimizedSummary": "isi HTML di sini...",
      "suggestedSkills": ["skill1", "skill2", ...]
    }
  `;

  try {
    const response = await callGemini(prompt, true);
    return JSON.parse(response);
  } catch (error) {
    console.error("Optimize CV Error:", error);
    throw new Error("Gagal mengolah optimasi AI. Pastikan input tidak terlalu panjang.");
  }
}

/**
 * Translate CV Data & Cover Letter
 */
export async function translateCVContent({ cvData, coverLetter, targetLang }) {
  const langName = targetLang === 'en' ? 'English' : 'Indonesian';
  const prompt = `
    Tugas: Terjemahkan seluruh isi konten CV dan Surat Lamaran berikut ke dalam bahasa ${langName}.
    
    TETAPKAN struktur JSON persis seperti aslinya. Hanya nilai-nilai string (teks) yang mengandung kalimat/penjelasan yang perlu diterjemahkan. 
    Hal-hal yang BUKAN kalimat (seperti nama orang, institusi, gelar (kecuali gelar umum yang bisa diterjemahkan), email, link, skill bahasa pemrograman) biarkan saja atau sesuaikan secara wajar.
    Tapi pastikan bagian "summary", "description", "position" diterjemahkan sesuai bahasa target.
    Surat lamaran (coverLetter) JIKA ADA isi HTML nya, terjemahkan juga namun biarkan tag HTML utuh.

    DATA JSON INPUT:
    {
      "cvData": {
        "summary": ${JSON.stringify(cvData.summary || "")},
        "experiences": ${JSON.stringify(cvData.experiences || [])},
        "education": ${JSON.stringify(cvData.education || [])},
        "projects": ${JSON.stringify(cvData.projects || [])},
        "organizations": ${JSON.stringify(cvData.organizations || [])},
        "certifications": ${JSON.stringify(cvData.certifications || [])},
        "skills": ${JSON.stringify(cvData.skills || {})}
      },
      "coverLetter": ${JSON.stringify(coverLetter?.content || "")}
    }

    OUTPUT WAJIB JSON murni (tanpa markdown blok):
    {
      "cvData": { ...struktur cvData persis sama tapi isinya ditranslate... },
      "coverLetter": "isi HTML yang ditranslate"
    }
  `;

  try {
    const response = await callGemini(prompt, true);
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse Gemini translation output:", response);
      // Fallback: try to aggressively clean the string before parsing
      const cleanedMatch = response.match(/\{[\s\S]*\}/);
      if (cleanedMatch) {
        return JSON.parse(cleanedMatch[0]);
      }
      throw parseError;
    }
  } catch (error) {
    console.error("Translate CV Error:", error);
    throw new Error("Gagal menerjemahkan konten. " + error.message);
  }
}
