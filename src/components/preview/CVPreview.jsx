// src/components/preview/CVPreview.jsx
// ============================================================
// Live CV Preview — ATS-friendly, Times New Roman 12pt
// Margin: 2.54cm (1 inch) semua sisi, text-align justify
// ============================================================

import React, { forwardRef } from 'react';
import useCVStore from '../../store/useCVStore';

// ── Format date YYYY-MM → "Jan 2022" ────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  if (!year) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const m = month ? months[parseInt(month) - 1] : '';
  return m ? `${m} ${year}` : year;
}

// ── Render HTML dari TipTap ──────────────────────────────────
function RichContent({ html }) {
  if (!html?.trim()) return null;
  const isHTML = /<[a-z][\s\S]*>/i.test(html);
  if (!isHTML) {
    return (
      <p style={pStyle}>{html}</p>
    );
  }
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ fontSize: 'inherit', lineHeight: 'inherit', color: 'inherit' }}
      className="cv-rich"
    />
  );
}

// ── Base typography constants ────────────────────────────────
const FONT = "'Times New Roman', Times, serif";
const SIZE = '12pt';
const COLOR = '#000000';
const LINE_H = '1.5';

// Teks biasa (justify)
const pStyle = {
  margin: '0 0 4px 0',
  fontSize: SIZE,
  fontFamily: FONT,
  color: COLOR,
  lineHeight: LINE_H,
  textAlign: 'justify',
};

// ── Section Header ───────────────────────────────────────────
function CVSection({ title, children }) {
  if (!children) return null;
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{
        fontSize: '12pt',
        fontFamily: FONT,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderBottom: '1.5px solid #000',
        paddingBottom: '2px',
        marginBottom: '8px',
        marginTop: '0',
        color: '#000',
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Header: Nama & Kontak ────────────────────────────────────
function CVHeader({ info }) {
  if (!info) return null;
  const { name, email, phone, linkedin, location, website, qrCodeData } = info;

  const contactsLine1 = [email, phone, location].filter(Boolean).join('  |  ');
  const contactsLine2 = [
    linkedin && (linkedin.startsWith('http')
      ? linkedin.replace('https://www.', '').replace('https://', '')
      : linkedin),
    website && (website.startsWith('http')
      ? website.replace('https://', '')
      : website),
  ].filter(Boolean).join('  |  ');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '18px',
      paddingBottom: '12px',
      borderBottom: '1.5px solid #000',
    }}>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <h1 style={{
          fontSize: '16pt',
          fontFamily: FONT,
          fontWeight: 'bold',
          margin: '0 0 4px 0',
          color: '#000',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {name || 'Nama Anda'}
        </h1>
        <p style={{ fontSize: '10pt', color: '#222', margin: '0', lineHeight: '1.4' }}>
          {contactsLine1}
        </p>
        {contactsLine2 && (
          <p style={{ fontSize: '10pt', color: '#222', margin: '0', lineHeight: '1.4' }}>
            {contactsLine2}
          </p>
        )}
      </div>

      {qrCodeData && (
        <div style={{ marginLeft: '15px' }}>
          <img
            src={qrCodeData}
            alt="QR Code"
            style={{ width: '60px', height: '60px' }}
          />
        </div>
      )}
    </div>
  );
}

// ── Summary ──────────────────────────────────────────────────
function CVSummary({ summary }) {
  if (!summary?.trim()) return null;
  return (
    <CVSection title="Professional Summary">
      <RichContent html={summary} />
    </CVSection>
  );
}

// ── Work Experience ──────────────────────────────────────────
function CVExperience({ experiences }) {
  if (!experiences?.length) return null;
  return (
    <CVSection title="Work Experience">
      {experiences.map((exp, i) => {
        const dateStr = exp.isCurrent
          ? `${formatDate(exp.startDate)} – Sekarang`
          : `${formatDate(exp.startDate)}${exp.endDate ? ` – ${formatDate(exp.endDate)}` : ''}`;
        return (
          <div key={exp.id || i} style={{ marginBottom: i < experiences.length - 1 ? '12px' : '0' }}>
            {/* Posisi + tanggal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ fontSize: SIZE, fontFamily: FONT, fontWeight: 'bold', color: COLOR }}>
                {exp.position}
              </strong>
              <span style={{ fontSize: '11pt', fontFamily: FONT, color: '#333', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                {dateStr}
              </span>
            </div>
            {/* Perusahaan */}
            <p style={{ fontSize: SIZE, fontFamily: FONT, color: '#222', margin: '1px 0 4px 0', fontStyle: 'italic' }}>
              {exp.company}
            </p>
            {/* Deskripsi */}
            {exp.description && <RichContent html={exp.description} />}
          </div>
        );
      })}
    </CVSection>
  );
}

// ── Education ────────────────────────────────────────────────
function CVEducation({ education }) {
  if (!education?.length) return null;
  return (
    <CVSection title="Education">
      {education.map((edu, i) => (
        <div key={edu.id || i} style={{ marginBottom: i < education.length - 1 ? '10px' : '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <strong style={{ fontSize: SIZE, fontFamily: FONT, color: COLOR }}>
              {edu.degree}{edu.field && `, ${edu.field}`}
            </strong>
            <span style={{ fontSize: '11pt', fontFamily: FONT, color: '#333' }}>
              {formatDate(edu.startDate)}{edu.endDate && ` – ${formatDate(edu.endDate)}`}
            </span>
          </div>
          <p style={{ fontSize: SIZE, fontFamily: FONT, color: '#222', margin: '1px 0', fontStyle: 'italic' }}>
            {edu.institution}
          </p>
          {edu.gpa && (
            <p style={{ fontSize: '11pt', fontFamily: FONT, color: '#333', margin: '2px 0' }}>
              IPK / GPA: <strong>{edu.gpa}</strong>
            </p>
          )}
          {edu.description && <RichContent html={edu.description} />}
        </div>
      ))}
    </CVSection>
  );
}

// ── Skills ───────────────────────────────────────────────────
function CVSkills({ skills }) {
  const { technical = [], softSkills = [], languages = [] } = skills || {};
  if (!technical.length && !softSkills.length && !languages.length) return null;
  return (
    <CVSection title="Skills">
      <div style={{ fontSize: SIZE, fontFamily: FONT, color: COLOR, lineHeight: '1.7' }}>
        {technical.length > 0 && (
          <p style={{ margin: '0 0 3px 0', textAlign: 'justify' }}>
            <strong>Technical: </strong>{technical.join(', ')}
          </p>
        )}
        {softSkills.length > 0 && (
          <p style={{ margin: '0 0 3px 0', textAlign: 'justify' }}>
            <strong>Soft Skills: </strong>{softSkills.join(', ')}
          </p>
        )}
        {languages.length > 0 && (
          <p style={{ margin: '0', textAlign: 'justify' }}>
            <strong>Bahasa: </strong>{languages.join(', ')}
          </p>
        )}
      </div>
    </CVSection>
  );
}

// ── Main CVPreview ────────────────────────────────────────────
const CVPreview = forwardRef(function CVPreview(_, ref) {
  const { cvData } = useCVStore();
  const { personalInfo, summary, experiences, education, skills } = cvData;

  const isEmpty =
    !personalInfo?.name &&
    !summary &&
    !experiences?.length &&
    !education?.length;

  return (
    <div
      ref={ref}
      id="cv-preview-content"
      style={{
        // A4: 794px × 1123px @ 96dpi
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        // Margin 2.54cm (1 inch) ≈ 96px pada 96dpi
        padding: '96px 96px 96px 96px',
        fontFamily: FONT,
        fontSize: SIZE,
        lineHeight: LINE_H,
        color: COLOR,
        boxSizing: 'border-box',
      }}
    >
      {/* Scoped CSS untuk rich content dari TipTap */}
      <style>{`
        #cv-preview-content .cv-rich p {
          margin: 0 0 3px 0;
          font-size: 12pt;
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          line-height: 1.5;
          text-align: justify;
        }
        #cv-preview-content .cv-rich ul,
        #cv-preview-content .cv-rich ol {
          margin: 2px 0 4px 0;
          padding-left: 20px;
          font-size: 12pt;
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          line-height: 1.5;
        }
        #cv-preview-content .cv-rich li {
          margin-bottom: 2px;
          text-align: justify;
        }
        #cv-preview-content .cv-rich ul  { list-style-type: disc; }
        #cv-preview-content .cv-rich ol  { list-style-type: decimal; }
        #cv-preview-content .cv-rich strong { font-weight: bold; }
        #cv-preview-content .cv-rich em     { font-style: italic; }
        #cv-preview-content .cv-rich u      { text-decoration: underline; }
        #cv-preview-content .cv-rich *:last-child { margin-bottom: 0; }
      `}</style>

      {isEmpty ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '500px', color: '#94a3b8', textAlign: 'center',
          fontFamily: FONT,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <p style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            CV Anda akan tampil di sini
          </p>
          <p style={{ fontSize: '11pt', margin: '0', color: '#aaa' }}>
            Mulai isi form di sebelah kiri untuk melihat preview
          </p>
        </div>
      ) : (
        <>
            <CVHeader info={personalInfo} />
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
