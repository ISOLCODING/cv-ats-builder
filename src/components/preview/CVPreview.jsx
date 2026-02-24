// src/components/preview/CVPreview.jsx
// ============================================================
// Live CV Preview — ATS-friendly, single-column layout
//
// Design principles:
// - Font: Arial/Helvetica (ATS-readable)
// - Single column (no tables, no multi-col)
// - No images, no decorative graphics
// - Clear section headers
// - Standard bullet formatting
// ============================================================

import React, { forwardRef } from 'react';
import useCVStore from '../../store/useCVStore';

// Format date YYYY-MM → "Jan 2022"
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  if (!year) return dateStr;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthName = month ? monthNames[parseInt(month) - 1] : '';
  return monthName ? `${monthName} ${year}` : year;
}

// Section Header Component
function CVSection({ title, children }) {
  if (!children) return null;
  return (
    <div style={{ marginBottom: '12px' }}>
      <h2 style={{
        fontSize: '11pt',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '2px solid #1e3a8a',
        paddingBottom: '3px',
        marginBottom: '8px',
        marginTop: '0',
        color: '#1e3a8a',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

// Personal Info Header
function CVHeader({ personalInfo }) {
  if (!personalInfo) return null;
  const { name, email, phone, linkedin, location, website } = personalInfo;

  const contacts = [
    email && email,
    phone && phone,
    location && location,
    linkedin && (linkedin.startsWith('http') ? linkedin.replace('https://www.', '').replace('https://', '') : linkedin),
    website && (website.startsWith('http') ? website.replace('https://', '') : website),
  ].filter(Boolean);

  return (
    <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
      <h1 style={{
        fontSize: '20pt',
        fontWeight: 'bold',
        margin: '0 0 6px 0',
        color: '#0f172a',
        letterSpacing: '0.02em',
      }}>
        {name || 'Nama Anda'}
      </h1>
      {contacts.length > 0 && (
        <p style={{
          fontSize: '9pt',
          color: '#475569',
          margin: '0',
          lineHeight: '1.6',
        }}>
          {contacts.join('  |  ')}
        </p>
      )}
    </div>
  );
}

// Summary Section
function CVSummary({ summary }) {
  if (!summary?.trim()) return null;
  return (
    <CVSection title="Professional Summary">
      <p style={{ fontSize: '10pt', color: '#1e293b', lineHeight: '1.5', margin: '0' }}>
        {summary}
      </p>
    </CVSection>
  );
}

// Experience Section
function CVExperience({ experiences }) {
  if (!experiences?.length) return null;
  return (
    <CVSection title="Work Experience">
      {experiences.map((exp, i) => {
        const dateStr = exp.isCurrent
          ? `${formatDate(exp.startDate)} – Sekarang`
          : `${formatDate(exp.startDate)} – ${formatDate(exp.endDate)}`;

        // Split description by newline dan render sebagai bullet points
        const descLines = exp.description
          ? exp.description.split('\n').filter((l) => l.trim())
          : [];

        return (
          <div key={exp.id || i} style={{ marginBottom: i < experiences.length - 1 ? '10px' : '0' }}>
            {/* Posisi + tanggal dalam satu baris */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: '10.5pt', color: '#0f172a' }}>
                {exp.position}
              </strong>
              <span style={{ fontSize: '9pt', color: '#64748b', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {dateStr}
              </span>
            </div>
            {/* Nama perusahaan */}
            <p style={{ fontSize: '10pt', color: '#334155', margin: '1px 0 4px 0', fontStyle: 'italic' }}>
              {exp.company}
            </p>
            {/* Deskripsi */}
            {descLines.length > 0 && (
              <ul style={{
                margin: '4px 0 0 0',
                paddingLeft: '18px',
                fontSize: '10pt',
                color: '#1e293b',
                lineHeight: '1.5',
              }}>
                {descLines.map((line, j) => {
                  // Hapus bullet karakter yang sudah ada
                  const cleanLine = line.replace(/^[\•\-\*]\s*/, '').trim();
                  return cleanLine ? <li key={j}>{cleanLine}</li> : null;
                })}
              </ul>
            )}
          </div>
        );
      })}
    </CVSection>
  );
}

// Education Section
function CVEducation({ education }) {
  if (!education?.length) return null;
  return (
    <CVSection title="Education">
      {education.map((edu, i) => (
        <div key={edu.id || i} style={{ marginBottom: i < education.length - 1 ? '8px' : '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: '10.5pt', color: '#0f172a' }}>
              {edu.degree}{edu.field && `, ${edu.field}`}
            </strong>
            <span style={{ fontSize: '9pt', color: '#64748b' }}>
              {formatDate(edu.startDate)}{edu.endDate && ` – ${formatDate(edu.endDate)}`}
            </span>
          </div>
          <p style={{ fontSize: '10pt', color: '#334155', margin: '1px 0', fontStyle: 'italic' }}>
            {edu.institution}
          </p>
          {edu.gpa && (
            <p style={{ fontSize: '9.5pt', color: '#475569', margin: '2px 0' }}>
              IPK: {edu.gpa}
            </p>
          )}
          {edu.description && (
            <p style={{ fontSize: '9.5pt', color: '#475569', margin: '2px 0' }}>
              {edu.description}
            </p>
          )}
        </div>
      ))}
    </CVSection>
  );
}

// Skills Section
function CVSkills({ skills }) {
  const { technical = [], softSkills = [], languages = [] } = skills || {};
  if (!technical.length && !softSkills.length && !languages.length) return null;

  return (
    <CVSection title="Skills">
      <div style={{ fontSize: '10pt', color: '#1e293b', lineHeight: '1.6' }}>
        {technical.length > 0 && (
          <p style={{ margin: '0 0 3px 0' }}>
            <strong>Technical:</strong>{' '}
            {technical.join(' • ')}
          </p>
        )}
        {softSkills.length > 0 && (
          <p style={{ margin: '0 0 3px 0' }}>
            <strong>Soft Skills:</strong>{' '}
            {softSkills.join(' • ')}
          </p>
        )}
        {languages.length > 0 && (
          <p style={{ margin: '0' }}>
            <strong>Bahasa:</strong>{' '}
            {languages.join(' • ')}
          </p>
        )}
      </div>
    </CVSection>
  );
}

// ── Main CVPreview Component ──────────────────────────────────

const CVPreview = forwardRef(function CVPreview(_, ref) {
  const { cvData } = useCVStore();
  const { personalInfo, summary, experiences, education, skills } = cvData;

  const isEmptyCV = !personalInfo.name && !summary && !experiences.length && !education.length;

  return (
    <div
      ref={ref}
      id="cv-preview-content"
      className="cv-preview-content"
      style={{
        // Dimensi A4 dalam pixel (96dpi): 210mm × 297mm
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        padding: '48px 56px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '10pt',
        lineHeight: '1.5',
        color: '#1e293b',
        boxSizing: 'border-box',
        // Shadow hanya tampil di browser, tidak di PDF
      }}
    >
      {isEmptyCV ? (
        // Placeholder saat CV masih kosong
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          color: '#94a3b8',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 8px 0' }}>CV Anda akan tampil di sini</p>
          <p style={{ fontSize: '10pt', margin: '0' }}>Mulai isi form di sebelah kiri untuk melihat preview</p>
        </div>
      ) : (
        <>
          {/* Header: Nama & Kontak */}
          <CVHeader personalInfo={personalInfo} />
          
          {/* Sections berurutan */}
          <CVSummary summary={summary} />
          <CVSkills skills={skills} />
          <CVExperience experiences={experiences} />
          <CVEducation education={education} />
        </>
      )}
    </div>
  );
});

export default CVPreview;
