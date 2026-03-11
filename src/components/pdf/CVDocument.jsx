// src/components/pdf/CVDocument.jsx
// ============================================================
// @react-pdf/renderer — CV Document Multi-Template
// ============================================================

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import { htmlToReactPdf } from '../../utils/htmlToReactPdf';
import useCVStore from '../../store/useCVStore';
import { getTranslation } from '../../utils/translations';

// ── Typography & Constants ─────────────────────────────────────
const FONT_REGULAR = 'Times-Roman';
const FONT_BOLD    = 'Times-Bold';
const FONT_ITALIC  = 'Times-Italic';
const SIZE_BODY    = 11;
const SIZE_SMALL   = 9;
const SIZE_HEADER  = 20;
const SIZE_SECTION = 12;
const LINE_HEIGHT  = 1.4;

// ── Layout Styles ─────────────────────────────────────────────
const styles = {
  // ── 1. Standard ATS (Professional & Clean) ──
  standard_ats: StyleSheet.create({
    page: {
      fontFamily:      FONT_REGULAR,
      fontSize:        SIZE_BODY,
      color:           '#000000',
      padding:         40,
      backgroundColor: '#ffffff',
    },
    header: {
      borderBottom: '1pt solid #000000',
      paddingBottom: 8,
      marginBottom: 15,
      textAlign: 'center',
    },
    headerName: {
      fontFamily: FONT_BOLD,
      fontSize: SIZE_HEADER,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    headerContacts: {
      fontSize: 9,
      marginTop: 4,
      color: '#333333',
    },
    sectionTitle: {
      fontFamily: FONT_BOLD,
      fontSize: SIZE_SECTION,
      textTransform: 'uppercase',
      borderBottom: '1pt solid #000000',
      marginTop: 12,
      marginBottom: 6,
      paddingBottom: 2,
    },
    itemTitle: { fontFamily: FONT_BOLD, fontSize: 11 },
    itemSubtitle: { fontFamily: FONT_ITALIC, fontSize: 11, marginBottom: 4 },
  }),

  // ── 2. Modern Creative (Dynamic 2-Column Sidebar) ──
  modern_creative: StyleSheet.create({
    page: {
      flexDirection: 'row',
      fontFamily: 'Helvetica',
      fontSize: 10,
      color: '#334155',
    },
    sidebar: {
      width: '32%',
      backgroundColor: '#f8fafc',
      padding: 25,
      height: '100%',
      borderRight: '1pt solid #e2e8f0',
    },
    main: {
      width: '68%',
      padding: 30,
    },
    sidebarName: {
      fontSize: 22,
      fontFamily: 'Helvetica-Bold',
      color: '#0f172a',
      marginBottom: 4,
      lineHeight: 1.1,
    },
    sidebarTitle: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: '#3b82f6',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: 'Helvetica-Bold',
      color: '#0f172a',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      borderBottom: '2pt solid #3b82f6',
      paddingBottom: 4,
      marginBottom: 12,
      marginTop: 18,
    },
    sidebarSectionTitle: {
      fontSize: 9,
      fontFamily: 'Helvetica-Bold',
      color: '#1e293b',
      textTransform: 'uppercase',
      marginTop: 20,
      marginBottom: 8,
      borderBottom: '1pt solid #cbd5e1',
      paddingBottom: 2,
    },
    contactItem: { marginBottom: 8 },
    contactLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginBottom: 1 },
    contactValue: { fontSize: 8.5, color: '#334155' },
    itemTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#0f172a' },
    itemSubtitle: { fontSize: 10, color: '#3b82f6', marginBottom: 2 },
  }),

  // ── 3. Minimalist (Elegant & Sophisticated) ──
  minimalist: StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 10.5,
      color: '#444444',
      padding: 50,
      backgroundColor: '#ffffff',
    },
    header: {
      marginBottom: 35,
      textAlign: 'left',
    },
    headerName: {
      fontSize: 26,
      fontFamily: 'Helvetica-Bold',
      color: '#111111',
      letterSpacing: -0.5,
    },
    headerTitle: {
      fontSize: 12,
      color: '#666666',
      marginTop: 5,
    },
    headerContacts: {
      fontSize: 9,
      marginTop: 5,
      color: '#888888',
      flexDirection: 'row',
      gap: 10,
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: 3,
      marginTop: 25,
      marginBottom: 10,
      borderTop: '0.5pt solid #eeeeee',
      paddingTop: 10,
    },
    itemTitle: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#111111' },
    itemSubtitle: { fontSize: 10, color: '#222222', marginBottom: 4 },
  })
};

// Common Utility Styles
const CS = StyleSheet.create({
  itemBlock: { marginBottom: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  itemDate: { fontSize: 9, color: '#666666', flexShrink: 0, marginLeft: 10 },
  bodyText: { fontSize: 10, textAlign: 'justify', lineHeight: 1.4, color: '#333333' },
  linkText: { fontSize: 9, color: '#0066FF', marginBottom: 2 },
  bulletList: { marginTop: 4 },
  bulletRow: { flexDirection: 'row', marginBottom: 2 },
  bulletDot: { width: 10, fontSize: 10, color: '#333333' },
  bulletText: { flex: 1, fontSize: 10, textAlign: 'justify' },
});

// ── Helpers ──────────────────────────────────────────────────
function fmtDate(d, lang) {
  if (!d) return '';
  const [year, month] = d.split('-');
  if (!year) return d;
  const mnId = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const mnEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mn = lang === 'en' ? mnEn : mnId;
  const m = month ? mn[parseInt(month) - 1] : '';
  return m ? `${m} ${year}` : year;
}

function RichText({ html, style = CS.bodyText }) {
  if (!html || typeof html !== 'string' || !html.trim()) return null;
  const nodes = htmlToReactPdf(html, style);
  return <View>{nodes}</View>;
}

// ── Shared Sections ──────────────────────────────────────────

const Summary = ({ summary, S, lang }) => (summary && typeof summary === 'string' && summary.trim()) ? (
  <View style={{ marginBottom: 10 }}>
    <Text style={S.sectionTitle}>{getTranslation(lang, 'sec.summary')}</Text>
    <RichText html={summary} style={S.bodyText || CS.bodyText} />
  </View>
) : null;

const Experience = ({ experiences, S, lang }) => experiences?.length ? (
  <View style={{ marginBottom: 10 }}>
    <Text style={S.sectionTitle}>{getTranslation(lang, 'sec.experience')}</Text>
    {experiences.map((exp, i) => (
      <View key={exp.id || i} style={CS.itemBlock}>
        <View style={CS.itemHeader}>
          <Text style={S.itemTitle || CS.itemTitle}>
            {exp.position} {exp.type && `(${getTranslation(lang, `type.${exp.type}`)})`}
          </Text>
          <Text style={CS.itemDate}>
            {fmtDate(exp.startDate, lang)} – {exp.isCurrent ? getTranslation(lang, 'sec.present', 'Present') : fmtDate(exp.endDate, lang)}
          </Text>
        </View>
        <Text style={S.itemSubtitle || CS.itemSubtitle}>{exp.company}</Text>
        <RichText html={exp.description} />
      </View>
    ))}
  </View>
) : null;

const Education = ({ education, S, lang }) => education?.length ? (
  <View style={{ marginBottom: 10 }}>
    <Text style={S.sectionTitle}>{getTranslation(lang, 'sec.education')}</Text>
    {education.map((edu, i) => {
      const isBootcamp = edu.degree === 'Bootcamp' || edu.degree === 'Sertifikasi';
      return (
        <View key={edu.id || i} style={CS.itemBlock}>
          <View style={CS.itemHeader}>
            <Text style={S.itemTitle || CS.itemTitle}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
            </Text>
            <Text style={CS.itemDate}>
              {fmtDate(edu.startDate, lang)} – {fmtDate(edu.endDate, lang)}
            </Text>
          </View>
          <Text style={S.itemSubtitle || CS.itemSubtitle}>{edu.institution}</Text>
          {edu.gpa && (
            <Text style={{ ...CS.bodyText, fontSize: 9, marginBottom: 2 }}>
              {isBootcamp ? 'Skor / Predikat' : 'IPK / GPA'}: <Text style={{ fontFamily: FONT_BOLD }}>{edu.gpa}</Text>
            </Text>
          )}
          {edu.link && (
            <Text style={CS.linkText}>Sertifikat: {edu.link}</Text>
          )}
          <RichText html={edu.description} />
        </View>
      );
    })}
  </View>
) : null;

const Certifications = ({ certifications, S, lang }) => certifications?.length ? (
  <View style={{ marginBottom: 10 }}>
    <Text style={S.sectionTitle}>{getTranslation(lang, 'sec.certifications')}</Text>
    {certifications.map((c, i) => (
      <View key={c.id || i} style={{ marginBottom: 6 }}>
        <View style={CS.itemHeader}>
          <Text style={S.itemTitle || CS.itemTitle}>{c.name}</Text>
          <Text style={CS.itemDate}>{c.year}</Text>
        </View>
        <Text style={{ fontSize: 9, color: '#444' }}>
          {c.issuer}{c.link ? ` | ${c.link}` : ''}
        </Text>
      </View>
    ))}
  </View>
) : null;

const Projects = ({ projects, S, lang }) => projects?.length ? (
  <View style={{ marginBottom: 10 }}>
    <Text style={S.sectionTitle}>{getTranslation(lang, 'sec.projects')}</Text>
    {projects.map((p, i) => (
      <View key={p.id || i} style={CS.itemBlock}>
        <View style={CS.itemHeader}>
          <Text style={S.itemTitle || CS.itemTitle}>{p.name}</Text>
          <Text style={{ ...CS.itemDate, fontStyle: 'italic' }}>{p.techStack}</Text>
        </View>
        {p.link && <Text style={CS.linkText}>{p.link}</Text>}
        <RichText html={p.description} />
      </View>
    ))}
  </View>
) : null;

const Organizations = ({ organizations, S, lang }) => {
  if (!organizations?.length) return null;
  
  const groups = organizations.reduce((acc, current) => {
    const existing = acc.find(g => (g.name || '').toLowerCase() === (current.name || '').toLowerCase());
    if (existing) { existing.items.push(current); }
    else { acc.push({ name: current.name, items: [current] }); }
    return acc;
  }, []);

  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={S.sectionTitle}>{getTranslation(lang, 'sec.organizations')}</Text>
      {groups.map((group, gi) => (
        <View key={gi} style={{ marginBottom: 8 }}>
          <Text style={{ ...S.itemTitle, borderBottom: '0.5pt solid #eeeeee', marginBottom: 4, paddingBottom: 2 }}>{group.name}</Text>
          {group.items.map((org, i) => (
            <View key={org.id || i} style={{ marginLeft: 10, marginBottom: 4 }}>
              <View style={CS.itemHeader}>
                <Text style={{ ...S.itemSubtitle, fontFamily: FONT_BOLD, color: '#333', fontSize: 10 }}>{org.role}</Text>
                <Text style={CS.itemDate}>{org.period}</Text>
              </View>
              <RichText html={org.contribution} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};



const Skills = ({ skills, S, lang, sidebar = false }) => {
  const { technical = [], softSkills = [], languages = [] } = skills || {};
  if (!technical.length && !softSkills.length && !languages.length) return null;

  if (sidebar) {
    return (
      <View>
        <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.techskills', 'Technical Skills')}</Text></View>
        <Text style={{ fontSize: 8.5, color: '#334155' }}>{technical.join(', ')}</Text>
        
        {softSkills.length > 0 && (
          <>
            <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.softskills', 'Soft Skills')}</Text></View>
            <Text style={{ fontSize: 8.5, color: '#334155' }}>{softSkills.join(', ')}</Text>
          </>
        )}

        {languages.length > 0 && (
          <>
            <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.languages', 'Languages')}</Text></View>
            <Text style={{ fontSize: 8.5, color: '#334155' }}>{languages.join(', ')}</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={S.sectionTitle}>{getTranslation(lang, 'sec.skills')}</Text>
      <View style={{ gap: 4 }}>
        {technical.length > 0 && (
          <Text style={{ fontSize: 10 }}>
            <Text style={{ fontFamily: FONT_BOLD }}>{getTranslation(lang, 'sec.techskills', 'Technical')}: </Text>{technical.join(', ')}
          </Text>
        )}
        {softSkills.length > 0 && (
          <Text style={{ fontSize: 10 }}>
            <Text style={{ fontFamily: FONT_BOLD }}>{getTranslation(lang, 'sec.softskills', 'Soft Skills')}: </Text>{softSkills.join(', ')}
          </Text>
        )}
        {languages.length > 0 && (
          <Text style={{ fontSize: 10 }}>
            <Text style={{ fontFamily: FONT_BOLD }}>{getTranslation(lang, 'sec.languages', 'Languages')}: </Text>{languages.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
};

// ── Layout Components ──────────────────────────────────────────

const StandardATS = ({ data }) => {
  const S = styles.standard_ats;
  const { personalInfo: info } = data;
  return (
    <Page size="A4" style={S.page}>
      <View style={S.header}>
        <Text style={S.headerName}>{info.name || 'Nama Anda'}</Text>
        <Text style={S.headerContacts}>
          {[info.email, info.phone, info.location].filter(Boolean).join('  |  ')}
        </Text>
        {[info.website, info.linkedin, info.portfolioUrl].some(Boolean) && (
          <Text style={S.headerContacts}>
            {[info.linkedin, info.website, info.portfolioUrl].filter(Boolean).join('  |  ')}
          </Text>
        ) || null}
      </View>

      <Summary summary={data.summary} S={S} lang={data.lang} />
      <Education education={data.education} S={S} lang={data.lang} />
      <Skills skills={data.skills} S={S} lang={data.lang} />
      <Experience experiences={data.experiences} S={S} lang={data.lang} />
      <Projects projects={data.projects} S={S} lang={data.lang} />
      <Organizations organizations={data.organizations} S={S} lang={data.lang} />
      <Certifications certifications={data.certifications} S={S} lang={data.lang} />
    </Page>
  );
};

const ModernCreative = ({ data }) => {
  const S = styles.modern_creative;
  const { personalInfo: info } = data;
  return (
    <Page size="A4" style={S.page}>
      <View style={S.sidebar}>
        <Text style={S.sidebarName}>{info.name || 'Your Name'}</Text>
        <Text style={S.sidebarTitle}>{data.experiences?.[0]?.position || 'Professional'}</Text>

        {info.qrCodeData && (
          <View style={{ width: 80, height: 80, marginBottom: 20 }}>
            <Image src={info.qrCodeData} style={{ width: '100%', height: '100%' }} />
          </View>
        )}

        <View style={S.sidebarSectionTitle}><Text>{getTranslation(data.lang, 'sec.contact', 'Contact')}</Text></View>
        {[
          { label: 'Email', val: info.email },
          { label: 'Phone', val: info.phone },
          { label: 'Location', val: info.location },
          { label: 'LinkedIn', val: info.linkedin },
          { label: 'Web', val: info.website },
          { label: 'Portfolio', val: info.portfolioUrl }
        ].map(c => c.val && (
          <View key={c.label} style={S.contactItem}>
            <Text style={S.contactLabel}>{c.label}</Text>
            <Text style={S.contactValue}>{c.val}</Text>
          </View>
        ))}

        <Skills skills={data.skills} S={S} sidebar={true} lang={data.lang} />
      </View>

      <View style={S.main}>
        <Summary summary={data.summary} S={S} lang={data.lang} />
        <Education education={data.education} S={S} lang={data.lang} />
        <Experience experiences={data.experiences} S={S} lang={data.lang} />
        <Projects projects={data.projects} S={S} lang={data.lang} />
        <Organizations organizations={data.organizations} S={S} lang={data.lang} />
        <Certifications certifications={data.certifications} S={S} lang={data.lang} />
      </View>
    </Page>
  );
};

const MinimalistLayout = ({ data }) => {
  const S = styles.minimalist;
  const { personalInfo: info } = data;
  return (
    <Page size="A4" style={S.page}>
      <View style={S.header}>
        <Text style={S.headerName}>{info.name || 'Your Name'}</Text>
        <Text style={S.headerTitle}>{data.experiences?.[0]?.position || ''}</Text>
        <Text style={S.headerContacts}>
          {[info.email, info.phone, info.location, info.linkedin, info.website, info.portfolioUrl].filter(Boolean).join('  •  ')}
        </Text>
      </View>

      <Summary summary={data.summary} S={S} lang={data.lang} />
      <Education education={data.education} S={S} lang={data.lang} />
      <Skills skills={data.skills} S={S} lang={data.lang} />
      <Experience experiences={data.experiences} S={S} lang={data.lang} />
      <Projects projects={data.projects} S={S} lang={data.lang} />
      <Organizations organizations={data.organizations} S={S} lang={data.lang} />
      <Certifications certifications={data.certifications} S={S} lang={data.lang} />
    </Page>
  );
};

// ── Main Export ─────────────────────────────────────────────

export const CVDocument = ({ cvData }) => {
  const template = cvData?.selectedTemplate || 'standard_ats';
  const data = {
    ...cvData,
    lang: useCVStore.getState().appSettings?.language || 'id'
  };

  return (
    <Document 
      title={`${cvData?.personalInfo?.name || 'CV'} - Curriculum Vitae`} 
      author={cvData?.personalInfo?.name || ''}
      creator="CV Master Royal"
    >
      {template === 'standard_ats' && <StandardATS data={data} />}
      {template === 'modern_creative' && <ModernCreative data={data} />}
      {template === 'minimalist' && <MinimalistLayout data={data} />}
    </Document>
  );
};

export default CVDocument;
