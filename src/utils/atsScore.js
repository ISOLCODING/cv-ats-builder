// src/utils/atsScore.js
// ============================================================
// ATS Score Analysis Engine
//
// Cara kerja:
// 1. Ekstrak keywords dari Job Description (JD)
// 2. Bandingkan dengan isi CV (semua field)
// 3. Hitung persentase match
// 4. Generate saran improvement spesifik
// ============================================================

/**
 * Daftar stopwords yang diabaikan saat ekstraksi keywords
 */
const STOP_WORDS = new Set([
  'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'this', 'that', 'these',
  'those', 'i', 'you', 'we', 'they', 'he', 'she', 'it', 'my', 'your',
  'our', 'their', 'as', 'by', 'from', 'into', 'through', 'during',
  'about', 'up', 'out', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 's', 't', 'just', 'don', 'now', 'yang', 'dan', 'atau',
  'di', 'ke', 'dari', 'dengan', 'untuk', 'adalah', 'ini', 'itu',
  'juga', 'pada', 'ya', 'tidak', 'ada', 'akan', 'dapat', 'bisa',
]);

/**
 * extractKeywords — Ekstrak kata kunci dari teks
 * - Lowercase semua
 * - Hapus tanda baca
 * - Filter stopwords
 * - Filter kata < 3 karakter
 * - Deduplicate
 * 
 * @param {string} text
 * @returns {string[]} - Array of unique keywords
 */
export function extractKeywords(text) {
  if (!text) return [];

  // Lowercase + hapus karakter non-alfanumerik (kecuali spasi dan -)
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-+#.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split menjadi token
  const tokens = cleaned.split(/\s+/);

  // Filter dan deduplicate
  const keywords = new Set();
  
  tokens.forEach((token) => {
    // Hapus trailing/leading hyphens
    const word = token.replace(/^-+|-+$/g, '');
    
    // Filter: panjang >= 2, bukan stopword, bukan angka murni
    if (
      word.length >= 2 &&
      !STOP_WORDS.has(word) &&
      !/^\d+$/.test(word)
    ) {
      keywords.add(word);
    }
  });

  // Tambahkan bigrams (2-kata) yang umum di dunia kerja
  const bigrams = extractBigrams(cleaned);
  bigrams.forEach((b) => keywords.add(b));

  return Array.from(keywords);
}

/**
 * extractBigrams — Ekstrak frasa 2 kata yang bermakna
 */
function extractBigrams(text) {
  const words = text.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const bigrams = [];
  
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = words[i] + ' ' + words[i + 1];
    // Hanya bigrams yang umum dalam konteks kerja
    const techBigramPatterns = [
      /react\s+\w+/,
      /node\s+\w+/,
      /machine\s+learning/,
      /deep\s+learning/,
      /data\s+\w+/,
      /project\s+manage/,
      /team\s+lead/,
      /full\s+stack/,
      /\w+\s+developer/,
      /\w+\s+engineer/,
      /\w+\s+management/,
      /google\s+\w+/,
      /microsoft\s+\w+/,
      /agile\s+\w+/,
      /\w+\s+analysis/,
    ];
    
    if (techBigramPatterns.some((p) => p.test(bigram))) {
      bigrams.push(bigram);
    }
  }
  
  return bigrams;
}

/**
 * buildCVText — Gabungkan semua isi CV menjadi satu string
 * untuk keperluan keyword matching
 * 
 * @param {Object} cvData
 * @returns {string}
 */
export function buildCVText(cvData) {
  if (!cvData) return '';

  const parts = [];

  // Personal info
  if (cvData.personalInfo) {
    const pi = cvData.personalInfo;
    parts.push(pi.name || '', pi.email || '', pi.location || '');
  }

  // Summary
  if (cvData.summary) {
    parts.push(cvData.summary);
  }

  // Experiences
  if (cvData.experiences) {
    cvData.experiences.forEach((exp) => {
      parts.push(
        exp.company || '',
        exp.position || '',
        exp.description || ''
      );
    });
  }

  // Education
  if (cvData.education) {
    cvData.education.forEach((edu) => {
      parts.push(
        edu.institution || '',
        edu.degree || '',
        edu.field || '',
        edu.description || ''
      );
    });
  }

  // Skills
  if (cvData.skills) {
    const { technical = [], softSkills = [], languages = [] } = cvData.skills;
    parts.push(
      ...technical,
      ...softSkills,
      ...languages
    );
  }

  return parts.join(' ');
}

/**
 * calculateATSScore — Analisis ATS score lengkap
 * 
 * @param {string} jobDescription — Teks Job Description
 * @param {Object} cvData — Data CV dari Zustand store
 * @returns {Object} — { score, matchedKeywords, missingKeywords, suggestions, totalKeywords }
 */
export function calculateATSScore(jobDescription, cvData) {
  // Guard: JD dan CV harus ada
  if (!jobDescription?.trim() || !cvData) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      suggestions: [],
      totalKeywords: 0,
    };
  }

  // Step 1: Ekstrak keywords dari JD
  const jdKeywords = extractKeywords(jobDescription);
  
  // Step 2: Build CV text dan keywords
  const cvText = buildCVText(cvData).toLowerCase();
  
  // Step 3: Cek setiap keyword JD ada di CV
  const matched = [];
  const missing = [];

  jdKeywords.forEach((keyword) => {
    // Cek exact match atau substring match
    if (cvText.includes(keyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  // Step 4: Hitung score
  const totalKeywords = jdKeywords.length;
  const score = totalKeywords > 0
    ? Math.round((matched.length / totalKeywords) * 100)
    : 0;

  // Step 5: Generate saran improvement
  const suggestions = generateSuggestions(score, missing, cvData);

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing.slice(0, 20), // Max 20 saran keyword
    suggestions,
    totalKeywords,
  };
}

/**
 * generateSuggestions — Buat saran improvement berdasarkan analisis
 * 
 * @param {number} score
 * @param {string[]} missingKeywords
 * @param {Object} cvData
 * @returns {string[]}
 */
function generateSuggestions(score, missingKeywords, cvData) {
  const suggestions = [];

  // ── Saran berdasarkan Score ────────────────────────────────
  if (score < 30) {
    suggestions.push('⚠️ Score ATS sangat rendah. CV Anda kemungkinan besar tidak akan lolos screening otomatis.');
    suggestions.push('💡 Sesuaikan CV Anda agar lebih relevan dengan job description ini. Gunakan keyword yang sama persis.');
  } else if (score < 50) {
    suggestions.push('📈 Score ATS di bawah rata-rata. Tambahkan lebih banyak keyword dari JD ke CV Anda.');
  } else if (score < 70) {
    suggestions.push('✅ Score ATS cukup baik. Tambahkan beberapa keyword yang masih kurang untuk meningkatkan peluang.');
  } else if (score < 90) {
    suggestions.push('🎯 Score ATS bagus! CV Anda sudah relevan dengan JD ini.');
  } else {
    suggestions.push('🏆 Excellent! CV Anda sangat relevan dengan job description ini.');
  }

  // ── Saran berdasarkan Missing Keywords ────────────────────
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 5).join(', ');
    suggestions.push(`🔑 Tambahkan keyword berikut ke CV Anda: ${topMissing}`);
  }

  // ── Saran berdasarkan konten CV ───────────────────────────
  
  // Cek summary
  if (!cvData.summary || cvData.summary.length < 100) {
    suggestions.push('📝 Professional Summary terlalu pendek. Buat summary minimal 3-5 kalimat yang mencerminkan pengalaman Anda.');
  }

  // Cek experience
  if (!cvData.experiences || cvData.experiences.length === 0) {
    suggestions.push('💼 Tambahkan pengalaman kerja Anda. ATS sangat mempertimbangkan relevansi pengalaman.');
  } else {
    const hasDescriptions = cvData.experiences.some((e) => e.description && e.description.length > 50);
    if (!hasDescriptions) {
      suggestions.push('📋 Tambahkan deskripsi detail untuk setiap pengalaman kerja (minimal 2-3 bullet points per posisi).');
    }
  }

  // Cek skills
  const totalSkills = (
    (cvData.skills?.technical?.length || 0) +
    (cvData.skills?.softSkills?.length || 0) +
    (cvData.skills?.languages?.length || 0)
  );
  if (totalSkills < 5) {
    suggestions.push('🔧 Tambahkan lebih banyak skills. CV yang ideal memiliki minimal 8-12 skills yang relevan.');
  }

  // Cek education
  if (!cvData.education || cvData.education.length === 0) {
    suggestions.push('🎓 Tambahkan riwayat pendidikan Anda.');
  }

  // Saran format ATS-friendly
  suggestions.push('📄 Pastikan CV menggunakan format sederhana (satu kolom, tanpa tabel atau grafik) agar mudah dibaca ATS.');

  return suggestions;
}

/**
 * getScoreLabel — Dapatkan label dan warna berdasarkan score
 */
export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100', ring: 'stroke-green-500' };
  if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100', ring: 'stroke-blue-500' };
  if (score >= 40) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100', ring: 'stroke-yellow-500' };
  return { label: 'Poor', color: 'text-red-500', bg: 'bg-red-100', ring: 'stroke-red-400' };
}
