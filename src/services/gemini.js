// src/services/gemini.js
const API_KEY = 'AIzaSyBNVIcRiwjzQI-mWwwd8T2o-61jz4vhQ-g';
// Menggunakan Gemini 2.5 Flash sesuai permintaan user
const MODEL = 'gemini-2.5-flash'; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

/**
 * Call Gemini API with a prompt
 */
async function callGemini(prompt, isJson = false) {
  try {
    const config = {
      temperature: 0.1, // Very low for strict consistency
      topK: 1,
      topP: 1,
      maxOutputTokens: 4096,
    };

    if (isJson) {
      config.response_mime_type = "application/json";
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: config,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from AI model");

    if (isJson) {
      // Robust extraction: find the first { and last }
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        text = text.substring(start, end + 1);
      }
      
      // Remove any literal control characters that break JSON.parse
      text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
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
