// src/utils/exportPDF.js
// ============================================================
// PDF Export menggunakan @react-pdf/renderer
// Output: PDF dengan TEKS ASLI (bukan gambar) — ATS-friendly ✅
// ============================================================

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { CVDocument } from '../components/pdf/CVDocument';

/**
 * exportCVtoPDF
 * Menggunakan @react-pdf/renderer — output berisi teks asli,
 * bukan screenshot, sehingga ATS bisa baca dengan sempurna.
 *
 * @param {HTMLElement|null} _element  — tidak dipakai (legacy param)
 * @param {string}           fileName  — nama file (tanpa .pdf)
 * @param {Function}         onProgress
 * @param {object}           cvData    — data CV dari store
 */
export async function exportCVtoPDF(_element, fileName, onProgress, cvData) {
  if (!cvData) {
    throw new Error('Data CV tidak tersedia.');
  }

  try {
    onProgress?.(10);

    // ── Step 1: Buat PDF blob dari CVDocument ─────────────────
    const doc = React.createElement(CVDocument, { cvData });

    onProgress?.(30);

    // pdf() dari react-pdf: render → Blob
    const instance = pdf(doc);
    const blob     = await instance.toBlob();

    onProgress?.(80);

    // ── Step 2: Trigger download ──────────────────────────────
    const url  = URL.createObjectURL(blob);
    const safe = (fileName || 'CV')
      .replace(/[^a-zA-Z0-9_\- ]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50);

    const link = document.createElement('a');
    link.href     = url;
    link.download = `${safe}_CV.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup URL object
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    onProgress?.(100);
    console.log(`✅ PDF exported (react-pdf): ${safe}_CV.pdf`);

  } catch (error) {
    console.error('❌ Export PDF gagal:', error);
    throw new Error('Gagal mengexport PDF: ' + error.message);
  }
}

/**
 * downloadAsText — fallback: download sebagai .txt (ATS safe)
 */
export function downloadAsText(cvData, fileName) {
  const text = buildPlainText(cvData);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = ((fileName || 'CV').replace(/\s+/g, '_')) + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildPlainText(cvData) {
  if (!cvData) return '';
  const L = [];
  const { personalInfo: p, summary, experiences, education, skills } = cvData;

  if (p) {
    L.push(p.name || '');
    if (p.email)    L.push(`Email    : ${p.email}`);
    if (p.phone)    L.push(`Telp     : ${p.phone}`);
    if (p.location) L.push(`Lokasi   : ${p.location}`);
    if (p.linkedin) L.push(`LinkedIn : ${p.linkedin}`);
    if (p.website)  L.push(`Website  : ${p.website}`);
    L.push('');
  }
  if (summary) {
    L.push('PROFESSIONAL SUMMARY');
    L.push('-'.repeat(40));
    L.push(summary.replace(/<[^>]+>/g, ''));
    L.push('');
  }
  if (experiences?.length) {
    L.push('WORK EXPERIENCE');
    L.push('-'.repeat(40));
    experiences.forEach((e) => {
      L.push(`${e.position} — ${e.company}`);
      L.push(`${e.startDate} - ${e.isCurrent ? 'Sekarang' : e.endDate || ''}`);
      if (e.description) L.push(e.description.replace(/<[^>]+>/g, ''));
      L.push('');
    });
  }
  if (education?.length) {
    L.push('EDUCATION');
    L.push('-'.repeat(40));
    education.forEach((e) => {
      L.push(`${e.degree}${e.field ? `, ${e.field}` : ''}`);
      L.push(e.institution);
      L.push(`${e.startDate} - ${e.endDate || ''}`);
      if (e.gpa) L.push(`IPK: ${e.gpa}`);
      L.push('');
    });
  }
  if (skills) {
    L.push('SKILLS');
    L.push('-'.repeat(40));
    if (skills.technical?.length)  L.push(`Technical   : ${skills.technical.join(', ')}`);
    if (skills.softSkills?.length) L.push(`Soft Skills : ${skills.softSkills.join(', ')}`);
    if (skills.languages?.length)  L.push(`Bahasa      : ${skills.languages.join(', ')}`);
  }
  return L.join('\n');
}
