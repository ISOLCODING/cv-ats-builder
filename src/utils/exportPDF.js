// src/utils/exportPDF.js
// ============================================================
// PDF Export menggunakan jsPDF + html2canvas
//
// Strategi:
// 1. Ambil DOM element CV Preview
// 2. html2canvas → tangkap sebagai gambar high-res
// 3. jsPDF → buat dokumen A4 dan embed gambar
// 4. Simpan sebagai [NamaUser]_CV.pdf
// ============================================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * exportCVtoPDF — Export elemen CV ke file PDF
 * 
 * @param {HTMLElement} element   — DOM element yang akan di-export
 * @param {string} fileName       — Nama file (tanpa .pdf)
 * @param {Function} onProgress   — Callback progress (0-100)
 * @returns {Promise<void>}
 */
export async function exportCVtoPDF(element, fileName, onProgress) {
  if (!element) {
    throw new Error('Element CV tidak ditemukan. Pastikan CV Preview tersedia.');
  }

  try {
    // ── Step 1: Notifikasi mulai ─────────────────────────────
    onProgress?.(10);

    // ── Step 2: Konfigurasi html2canvas ─────────────────────
    // Scale tinggi untuk resolusi PDF yang tajam
    const canvas = await html2canvas(element, {
      scale: 2,                    // 2x scale untuk kualitas tinggi
      useCORS: true,               // Izinkan gambar cross-origin
      allowTaint: false,
      backgroundColor: '#ffffff',  // Background putih
      logging: false,              // Matikan console log
      width:  element.scrollWidth,
      height: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Pastikan clone menggunakan font yang sama
        const clonedElement = clonedDoc.getElementById(element.id);
        if (clonedElement) {
          clonedElement.style.padding = '0';
        }
      },
    });

    onProgress?.(60);

    // ── Step 3: Setup dimensi PDF ────────────────────────────
    const imgWidth  = canvas.width;
    const imgHeight = canvas.height;

    // A4 paper: 210mm × 297mm → 595pt × 842pt (72dpi)
    const PDF_WIDTH  = 210; // mm
    const PDF_HEIGHT = 297; // mm
    const MARGIN     = 10;  // mm margin

    // Hitung rasio untuk fit ke A4
    const contentWidth  = PDF_WIDTH - (MARGIN * 2);
    const contentHeight = PDF_HEIGHT - (MARGIN * 2);
    
    // Scale image ke lebar A4 content area
    const ratio      = contentWidth / (imgWidth / 3.7795275591); // px to mm
    const pageHeight = (imgHeight / 3.7795275591) * ratio;

    onProgress?.(75);

    // ── Step 4: Buat PDF ─────────────────────────────────────
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit:        'mm',
      format:      'a4',
      compress:    true,
    });

    // Set PDF metadata
    pdf.setProperties({
      title:    fileName,
      creator:  'CV ATS Builder',
      author:   fileName.replace('_CV', ''),
      keywords: 'CV, Resume, ATS',
    });

    // Convert canvas ke data URL
    const imgData = canvas.toDataURL('image/jpeg', 0.92); // 92% quality JPEG

    // ── Step 5: Handle multi-halaman ────────────────────────
    if (pageHeight <= contentHeight) {
      // CV muat di satu halaman
      pdf.addImage(
        imgData,
        'JPEG',
        MARGIN,           // x
        MARGIN,           // y
        contentWidth,     // width
        pageHeight,       // height
      );
    } else {
      // CV multi-halaman — potong per A4
      let remainingHeight = pageHeight;
      let yOffset = 0;
      let pageNum = 0;

      while (remainingHeight > 0) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        const sliceHeight = Math.min(contentHeight, remainingHeight);

        // Buat partial canvas untuk halaman ini
        const pageCanvas = document.createElement('canvas');
        const pxPerMM = imgWidth / contentWidth;
        
        pageCanvas.width  = imgWidth;
        pageCanvas.height = Math.round(sliceHeight * pxPerMM * (3.7795275591 / 1));

        const ctx = pageCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        
        // Draw slice dari original canvas
        ctx.drawImage(
          canvas,
          0,                                          // sx
          Math.round(yOffset * pxPerMM * 3.7795275591), // sy
          imgWidth,                                   // sw
          pageCanvas.height,                          // sh
          0, 0,                                       // dx, dy
          pageCanvas.width,                           // dw
          pageCanvas.height                           // dh
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
        
        pdf.addImage(
          pageImgData,
          'JPEG',
          MARGIN,
          MARGIN,
          contentWidth,
          sliceHeight
        );

        yOffset         += sliceHeight;
        remainingHeight -= sliceHeight;
        pageNum++;
      }
    }

    onProgress?.(90);

    // ── Step 6: Simpan file ──────────────────────────────────
    const safeFileName = sanitizeFileName(fileName) + '_CV.pdf';
    pdf.save(safeFileName);

    onProgress?.(100);
    
    console.log(`✅ PDF berhasil diexport: ${safeFileName}`);

  } catch (error) {
    console.error('❌ Export PDF gagal:', error);
    throw new Error('Gagal mengexport PDF: ' + error.message);
  }
}

/**
 * sanitizeFileName — Bersihkan nama file dari karakter invalid
 */
function sanitizeFileName(name) {
  if (!name) return 'CV';
  return name
    .replace(/[^a-zA-Z0-9_\-\s]/g, '') // Hapus karakter khusus
    .replace(/\s+/g, '_')               // Spasi → underscore
    .trim()
    .substring(0, 50);                  // Max 50 karakter
}

/**
 * downloadAsText — Download CV sebagai plain text (ATS-safe)
 * Alternatif jika PDF export tidak tersedia
 * 
 * @param {Object} cvData
 * @param {string} fileName
 */
export function downloadAsText(cvData, fileName) {
  const text = buildPlainTextCV(cvData);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = (sanitizeFileName(fileName) || 'CV') + '.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * buildPlainTextCV — Bangun representasi plain text CV
 * Berguna untuk copy-paste ke sistem ATS online
 */
function buildPlainTextCV(cvData) {
  if (!cvData) return '';
  
  const lines = [];
  const { personalInfo, summary, experiences, education, skills } = cvData;

  // Personal Info
  if (personalInfo) {
    lines.push(personalInfo.name || '');
    if (personalInfo.email)    lines.push(`Email: ${personalInfo.email}`);
    if (personalInfo.phone)    lines.push(`Phone: ${personalInfo.phone}`);
    if (personalInfo.linkedin) lines.push(`LinkedIn: ${personalInfo.linkedin}`);
    if (personalInfo.location) lines.push(`Location: ${personalInfo.location}`);
    lines.push('');
  }

  // Summary
  if (summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push('='.repeat(40));
    lines.push(summary);
    lines.push('');
  }

  // Experience
  if (experiences?.length > 0) {
    lines.push('WORK EXPERIENCE');
    lines.push('='.repeat(40));
    experiences.forEach((exp) => {
      lines.push(`${exp.position} at ${exp.company}`);
      const dateStr = exp.isCurrent
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate}`;
      lines.push(dateStr);
      if (exp.description) lines.push(exp.description);
      lines.push('');
    });
  }

  // Education
  if (education?.length > 0) {
    lines.push('EDUCATION');
    lines.push('='.repeat(40));
    education.forEach((edu) => {
      lines.push(`${edu.degree} in ${edu.field}`);
      lines.push(edu.institution);
      lines.push(`${edu.startDate} - ${edu.endDate}`);
      if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
      lines.push('');
    });
  }

  // Skills
  if (skills) {
    lines.push('SKILLS');
    lines.push('='.repeat(40));
    if (skills.technical?.length > 0)  lines.push(`Technical: ${skills.technical.join(', ')}`);
    if (skills.softSkills?.length > 0) lines.push(`Soft Skills: ${skills.softSkills.join(', ')}`);
    if (skills.languages?.length > 0)  lines.push(`Languages: ${skills.languages.join(', ')}`);
  }

  return lines.join('\n');
}
