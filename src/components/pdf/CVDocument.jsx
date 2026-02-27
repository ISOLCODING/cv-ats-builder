// src/components/pdf/CVDocument.jsx
// ============================================================
// @react-pdf/renderer — CV Document A4
// Font: Times-Roman 12pt | Margin: 2.54cm | Text: justify
// ============================================================

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { htmlToReactPdf } from '../../utils/htmlToReactPdf';

// ── Konstanta tipografi ────────────────────────────────────────
const FONT_REGULAR = 'Times-Roman';
const FONT_BOLD    = 'Times-Bold';
const FONT_ITALIC  = 'Times-Italic';
const SIZE_BODY    = 12;         // pt
const SIZE_SMALL   = 10.5;       // pt (tanggal, company)
const SIZE_HEADER  = 16;         // pt (nama)
const SIZE_SECTION = 11.5;       // pt (judul section)
const COLOR_BLACK  = '#000000';
const COLOR_DARK   = '#1a1a1a';
const COLOR_GRAY   = '#333333';
const LINE_HEIGHT = 1.25;      // Dikurangi dari 1.5 agar lebih padat
const MARGIN_1INCH = 54;         // Margin sedikit lebih kecil (0.75 inch = 54pt)
const MARGIN_SECTION = 10;       // Margin antar section

// ── StyleSheet ────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily:      FONT_REGULAR,
    fontSize:        SIZE_BODY,
    color:           COLOR_DARK,
    lineHeight:      LINE_HEIGHT,
    paddingTop:      MARGIN_1INCH,
    paddingBottom:   MARGIN_1INCH,
    paddingLeft:     MARGIN_1INCH,
    paddingRight:    MARGIN_1INCH,
    backgroundColor: '#ffffff',
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1.2pt solid #000000',
  },
  headerInfo: {
    flex: 1,
    textAlign: 'left',
  },
  headerName: {
    fontFamily: FONT_BOLD,
    fontSize: SIZE_HEADER,
    color: COLOR_BLACK,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  headerContacts: {
    fontFamily: FONT_REGULAR,
    fontSize: 9,
    color: COLOR_GRAY,
    lineHeight: 1.4,
  },
  qrContainer: {
    width: 50,
    height: 50,
    marginLeft: 15,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },

  // ── Section ─────────────────────────────────────────────────
  section: {
    marginBottom: MARGIN_SECTION,
  },
  sectionTitle: {
    fontFamily:   FONT_BOLD,
    fontSize:     SIZE_SECTION,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color:        COLOR_BLACK,
    borderBottom: '1.2pt solid #000000',
    paddingBottom: 1,
    marginBottom: 5,
  },

  // ── Experience / Education row ───────────────────────────────
  itemHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   1,
  },
  itemTitle: {
    fontFamily: FONT_BOLD,
    fontSize:   SIZE_BODY,
    color:      COLOR_BLACK,
    flex:       1,
  },
  itemDate: {
    fontFamily: FONT_REGULAR,
    fontSize:   SIZE_SMALL,
    color:      COLOR_GRAY,
    marginLeft: 8,
    flexShrink: 0,
  },
  itemSubtitle: {
    fontFamily:   FONT_ITALIC,
    fontSize:     SIZE_BODY,
    color:        '#222222',
    marginBottom: 4,
  },
  itemBlock: {
    marginBottom: 6,
  },

  // ── Body teks ───────────────────────────────────────────────
  bodyText: {
    fontFamily:  FONT_REGULAR,
    fontSize:    SIZE_BODY,
    color:       COLOR_DARK,
    lineHeight:  LINE_HEIGHT,
    textAlign:   'justify',
  },

  // ── Skills ──────────────────────────────────────────────────
  skillRow: {
    flexDirection: 'row',
    marginBottom:  3,
    flexWrap:      'wrap',
  },
  skillLabel: {
    fontFamily: FONT_BOLD,
    fontSize:   SIZE_BODY,
    color:      COLOR_BLACK,
    marginRight: 4,
  },
  skillValue: {
    fontFamily: FONT_REGULAR,
    fontSize:   SIZE_BODY,
    color:      COLOR_DARK,
    flex:       1,
    textAlign:  'justify',
  },

  // ── Bullet list ─────────────────────────────────────────────
  bulletRow: {
    flexDirection: 'row',
    marginBottom:  2,
  },
  bulletDot: {
    width:       14,
    flexShrink:  0,
    fontSize:    SIZE_BODY,
    fontFamily:  FONT_REGULAR,
    color:       COLOR_DARK,
  },
  bulletText: {
    flex:        1,
    fontSize:    SIZE_BODY,
    fontFamily:  FONT_REGULAR,
    color:       COLOR_DARK,
    lineHeight:  LINE_HEIGHT,
    textAlign:   'justify',
  },
});

// ── Helper: format date ────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  const [year, month] = d.split('-');
  if (!year) return d;
  const mn = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const m = month ? mn[parseInt(month) - 1] : '';
  return m ? `${m} ${year}` : year;
}

// ── RichText: render HTML dari TipTap ─────────────────────────
function RichText({ html }) {
  if (!html?.trim()) return null;

  // Cek apakah plain text
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return <Text style={S.bodyText}>{html}</Text>;
  }

  // Parse HTML → react-pdf elements
  const nodes = htmlToReactPdf(html, {
    fontFamily: FONT_REGULAR,
    fontSize:   SIZE_BODY,
    color:      COLOR_DARK,
    lineHeight: LINE_HEIGHT,
    textAlign:  'justify',
  });

  return <View>{nodes}</View>;
}

// ── Header Section ─────────────────────────────────────────────
function Header({ info }) {
  if (!info) return null;
  const { name, email, phone, location, linkedin, website, qrCodeData } = info;

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
    <View style={S.header}>
      <View style={S.headerInfo}>
        <Text style={S.headerName}>{name || 'Nama Anda'}</Text>
        <Text style={S.headerContacts}>{contactsLine1}</Text>
        {contactsLine2 && <Text style={S.headerContacts}>{contactsLine2}</Text>}
      </View>

      {qrCodeData && (
        <View style={S.qrContainer}>
          <Image src={qrCodeData} style={S.qrImage} />
        </View>
      )}
    </View>
  );
}

// ── Professional Summary ───────────────────────────────────────
function Summary({ summary }) {
  if (!summary?.trim()) return null;
  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>Professional Summary</Text>
      <RichText html={summary} />
    </View>
  );
}

// ── Work Experience ────────────────────────────────────────────
function Experience({ experiences }) {
  if (!experiences?.length) return null;
  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>Work Experience</Text>
      {experiences.map((exp, i) => {
        const dateStr = exp.isCurrent
          ? `${fmtDate(exp.startDate)} – Sekarang`
          : `${fmtDate(exp.startDate)}${exp.endDate ? ` – ${fmtDate(exp.endDate)}` : ''}`;
        return (
          <View key={exp.id || i} style={i < experiences.length - 1 ? S.itemBlock : {}}>
            <View style={S.itemHeader}>
              <Text style={S.itemTitle}>{exp.position}</Text>
              <Text style={S.itemDate}>{dateStr}</Text>
            </View>
            <Text style={S.itemSubtitle}>{exp.company}</Text>
            {exp.description && <RichText html={exp.description} />}
          </View>
        );
      })}
    </View>
  );
}

// ── Education ──────────────────────────────────────────────────
function Education({ education }) {
  if (!education?.length) return null;
  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>Education</Text>
      {education.map((edu, i) => (
        <View key={edu.id || i} style={i < education.length - 1 ? S.itemBlock : {}}>
          <View style={S.itemHeader}>
            <Text style={S.itemTitle}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
            </Text>
            <Text style={S.itemDate}>
              {fmtDate(edu.startDate)}{edu.endDate ? ` – ${fmtDate(edu.endDate)}` : ''}
            </Text>
          </View>
          <Text style={S.itemSubtitle}>{edu.institution}</Text>
          {edu.gpa && (
            <Text style={{ ...S.bodyText, marginBottom: 2 }}>
              IPK / GPA: <Text style={{ fontFamily: FONT_BOLD }}>{edu.gpa}</Text>
            </Text>
          )}
          {edu.description && <RichText html={edu.description} />}
        </View>
      ))}
    </View>
  );
}

// ── Skills ─────────────────────────────────────────────────────
function Skills({ skills }) {
  const { technical = [], softSkills = [], languages = [] } = skills || {};
  if (!technical.length && !softSkills.length && !languages.length) return null;

  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>Skills</Text>
      {technical.length > 0 && (
        <View style={S.skillRow}>
          <Text style={S.skillLabel}>Technical: </Text>
          <Text style={S.skillValue}>{technical.join(', ')}</Text>
        </View>
      )}
      {softSkills.length > 0 && (
        <View style={S.skillRow}>
          <Text style={S.skillLabel}>Soft Skills: </Text>
          <Text style={S.skillValue}>{softSkills.join(', ')}</Text>
        </View>
      )}
      {languages.length > 0 && (
        <View style={S.skillRow}>
          <Text style={S.skillLabel}>Bahasa: </Text>
          <Text style={S.skillValue}>{languages.join(', ')}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main CVDocument ────────────────────────────────────────────
export function CVDocument({ cvData }) {
  const { personalInfo, summary, experiences, education, skills } = cvData || {};

  return (
    <Document
      title={`${personalInfo?.name || 'CV'} — Curriculum Vitae`}
      author={personalInfo?.name || ''}
      creator="CV ATS Builder"
      keywords="CV, Resume, ATS"
    >
      <Page size="A4" style={S.page}>
        <Header info={personalInfo} />
        <Summary summary={summary} />
        <Skills skills={skills} />
        <Experience experiences={experiences} />
        <Education education={education} />
      </Page>
    </Document>
  );
}

export default CVDocument;
