const GAS_ENDPOINT = import.meta.env.VITE_GAS_ENDPOINT || '';

// ─── Core: Panggil AI via GAS Backend ────────────────────────────────────────

async function callAIService(prompt, isJson = false) {
  const isGASEnv =
    typeof window !== 'undefined' &&
    typeof window.google?.script !== 'undefined';

  try {
    let rawText = '';

    if (isGASEnv) {
      // Jalur GAS (produksi di Google Apps Script)
      rawText = await new Promise((resolve, reject) => {
        window.google.script.run
          .withSuccessHandler((res) =>
            res.success ? resolve(res.data) : reject(new Error(res.message))
          )
          .withFailureHandler((err) => reject(new Error(err.message)))
          .gsCallAI(prompt, isJson);
      });
    } else {
      // Jalur local dev via GAS Endpoint
      if (!GAS_ENDPOINT) {
        throw new Error('VITE_GAS_ENDPOINT tidak ditemukan di .env');
      }

      const res = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'callAI', prompt, isJson }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Gagal menghubungi AI Server');
      rawText = data.data;
    }

    if (!rawText) throw new Error('No response from AI model');

    // Sanitasi JSON jika diperlukan
    if (isJson) {
      const start = rawText.indexOf('{');
      const end   = rawText.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return rawText
          .substring(start, end + 1)
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
      }
    }

    return rawText;
  } catch (error) {
    console.error('[AI Service] Error:', error.message);
    throw error;
  }
}

// ─── Generate Cover Letter ────────────────────────────────────────────────────

export async function generateCoverLetter({ cvData, tone, jobPosition, company, hrdName }) {
  const greeting = hrdName
    ? `Dengan hormat Bapak/Ibu ${hrdName},`
    : 'Dengan hormat,';

  const prompt = `
Tuliskan SURAT LAMARAN KERJA (Cover Letter) dalam bahasa Indonesia dalam format HTML menggunakan tag <p> dan <strong>.

DATA PELAMAR:
Nama       : ${cvData.personalInfo.name}
Pendidikan : ${cvData.education?.[0]?.institution} (${cvData.education?.[0]?.degree})
Skill Utama: ${cvData.skills.technical.slice(0, 5).join(', ')}
Target Posisi: ${jobPosition}
Perusahaan : ${company || '[Tujuan Perusahaan]'}
Tone       : ${tone}

ATURAN:
- Mulai TEPAT dengan kalimat: "${greeting}"
- JANGAN sertakan header (alamat, tanggal, kop surat).
- JANGAN sertakan penutup nama/tanda tangan.
- Hanya tulis isi badan surat (body) saja.
  `.trim();

  return callAIService(prompt);
}

// ─── ATS Checker ─────────────────────────────────────────────────────────────

export async function analyzeATS({ cvData, jobDescription, coverLetter }) {
  const prompt = `
Analisis CV dan Surat Lamaran terhadap Job Description berikut.
Output HANYA JSON murni tanpa teks lain.

JOB DESCRIPTION:
${jobDescription}

DATA CV:
${JSON.stringify(cvData)}

ISI SURAT LAMARAN:
${coverLetter?.content || 'Tidak ada'}

FORMAT JSON WAJIB:
{
  "score": <number 0-100>,
  "breakdown": {
    "keywordMatch": <number>
    "formatScore" : <number>
    "relevance"   : <number>
  },
  "matchedKeywords"    : ["..."],
  "missingKeywords"    : ["..."],
  "specificSuggestions": ["minimum 5 saran konkret"],
  "experienceRelevance": "<kesimpulan singkat kecocokan>"
}
  `.trim();

  try {
    return JSON.parse(await callAIService(prompt, true));
  } catch (error) {
    console.warn('[ATS] Fallback aktif:', error.message);
    return {
      score: 50,
      breakdown: { keywordMatch: 50, formatScore: 80, relevance: 40 },
      matchedKeywords: [],
      missingKeywords: [],
      specificSuggestions: ['Gagal menganalisis. Pastikan koneksi internet stabil.'],
      experienceRelevance: 'Analisis tidak dapat disimpulkan.',
    };
  }
}

// ─── Optimize CV ──────────────────────────────────────────────────────────────

export async function optimizeCV({ cvData, jobDescription }) {
  const experiences = cvData.experiences.map((e) => ({
    pos : e.position,
    desc: e.description,
  }));

  const prompt = `
Tugas: Optimalkan CV agar lolos ATS secara cerdas.

JOB DESCRIPTION TARGET:
${jobDescription}

DATA CV SEKARANG:
Summary         : ${cvData.summary}
Technical Skills: ${cvData.skills.technical.join(', ')}
Experiences     : ${JSON.stringify(experiences)}

INSTRUKSI:
1. Buat "optimizedSummary" profesional, result-oriented, mengandung keyword dari JD. Gunakan tag HTML <p> dan <strong>.
2. Pilih "suggestedSkills" paling relevan dari JD (maks. 15 skill).
3. Output HANYA JSON murni, tanpa teks lain, tanpa newline literal di dalam string.

FORMAT JSON:
{
  "optimizedSummary": "<HTML di sini>",
  "suggestedSkills" : ["skill1", "skill2"]
}
  `.trim();

  try {
    return JSON.parse(await callAIService(prompt, true));
  } catch (error) {
    console.error('[OptimizeCV] Error:', error.message);
    throw new Error('Gagal mengolah optimasi AI. Pastikan input tidak terlalu panjang.');
  }
}

// ─── Translate CV + Cover Letter ─────────────────────────────────────────────

export async function translateCVContent({ cvData, coverLetter, targetLang }) {
  const langName = targetLang === 'en' ? 'English' : 'Indonesian';

  const safeJSON = (val, fallback = '') => {
    try { return JSON.stringify(val ?? fallback); }
    catch { return JSON.stringify(fallback); }
  };

  const prompt = `
Terjemahkan konten CV dan Surat Lamaran berikut ke dalam bahasa ${langName}.

ATURAN:
- Pertahankan struktur JSON persis sama seperti input.
- Terjemahkan hanya nilai string yang berupa kalimat/penjelasan.
- Jangan terjemahkan: nama orang, institusi, email, link, nama skill/teknologi.
- Bagian "summary", "description", "position" wajib diterjemahkan.
- Jika coverLetter berisi HTML, terjemahkan teksnya tapi biarkan tag HTML utuh.
- Output HANYA JSON murni tanpa markdown atau teks lain.

DATA JSON INPUT:
{
  "cvData": {
    "summary"       : ${safeJSON(cvData?.summary)},
    "experiences"   : ${safeJSON(cvData?.experiences, [])},
    "education"     : ${safeJSON(cvData?.education, [])},
    "projects"      : ${safeJSON(cvData?.projects, [])},
    "organizations" : ${safeJSON(cvData?.organizations, [])},
    "certifications": ${safeJSON(cvData?.certifications, [])},
    "skills"        : ${safeJSON(cvData?.skills, {})}
  },
  "coverLetter": ${safeJSON(coverLetter?.content)}
}

FORMAT OUTPUT:
{
  "cvData"     : { ...struktur sama, isi ditranslate... },
  "coverLetter": "<HTML yang sudah ditranslate>"
}
  `.trim();

  try {
    const raw = await callAIService(prompt, true);
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback: coba ambil JSON dari dalam string
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Response AI bukan JSON valid');
    }
  } catch (error) {
    console.error('[Translate AI] Error:', error.message);
    throw new Error('Gagal menerjemahkan konten. ' + error.message);
  }
}