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
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/gh/googlefonts/roboto-2@main/src/hinted/Roboto-Regular.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/gh/googlefonts/roboto-2@main/src/hinted/Roboto-Bold.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/gh/googlefonts/roboto-2@main/src/hinted/Roboto-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
  ]
});

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/gh/rst10124492/inter@master/Inter-Regular.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/gh/rst10124492/inter@master/Inter-Bold.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/gh/rst10124492/inter@master/Inter-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
  ]
});

const getFontFamily = (f) => {
  if (f === 'serif') return { regular: 'Times-Roman', bold: 'Times-Roman', italic: 'Times-Roman' };
  if (f === 'sans') return { regular: 'Helvetica', bold: 'Helvetica', italic: 'Helvetica' };
  if (f === 'tahoma' || f === 'inter') return { regular: 'Inter', bold: 'Inter', italic: 'Inter' };
  if (f === 'roboto') return { regular: 'Roboto', bold: 'Roboto', italic: 'Roboto' };
  return { regular: 'Helvetica', bold: 'Helvetica', italic: 'Helvetica' };
};

const SIZE_BODY = 10;
const SIZE_SMALL = 8;
const SIZE_HEADER = 13;
const SIZE_SECTION = 10;
const LINE_HEIGHT = 1.2;
const PRIMARY_COLOR = '#000000';
const SECONDARY_COLOR = '#4B5563';

// ── Layout Styles ─────────────────────────────────────────────
const styles = {
  // ── 1. Standard ATS (Professional & Clean) ──
  standard_ats: StyleSheet.create({
    page: {
      fontSize:        SIZE_BODY,
      color:           '#000000',
      padding: 10,
      backgroundColor: '#ffffff',
    },
    header: {
      borderBottom: '1pt solid #000000',
      paddingBottom: 4,
      marginBottom: 4,
      textAlign: 'center',
    },
    headerName: {
      fontWeight: 'bold',
      fontSize: SIZE_HEADER,
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 6,
    },
    headerContacts: {
      fontSize: 9,
      marginTop: 4,
      color: '#333333',
    },
    sectionTitle: {
      fontSize: SIZE_SECTION,
      textTransform: 'uppercase',
      borderBottom: '1pt solid #000000',
      marginTop: 10,
      marginBottom: 8,
      paddingBottom: 1,
    },
    itemTitle: { fontSize: 10, fontWeight: 'bold' },
    itemSubtitle: { fontSize: 10, fontStyle: 'italic', marginBottom: 2 },
  }),

  // ── 2. Modern Creative (Dynamic 2-Column Sidebar) ──
  modern_creative: StyleSheet.create({
    page: {
      flexDirection: 'row',
      fontSize: 10,
      color: '#334155',
    },
    sidebar: {
      width: '32%',
      backgroundColor: '#f8fafc',
      padding: 14, // Reduced from 20
       /* height: '100%' */
      borderRight: '1pt solid #e2e8f0',
    },
    main: {
      width: '68%',
      padding: 14, // Reduced from 20
    },
    sidebarName: {
      fontSize: 19,
      fontWeight: 'bold',
      color: '#0f172a',
      marginBottom: 3,
      lineHeight: 1.0,
    },
    sidebarTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#3b82f6',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 5,
    },
    sectionTitle: {
      fontSize: 10, // Reduced from 10.5
      fontWeight: 'bold',
      color: '#0f172a',
      textTransform: 'uppercase',
      letterSpacing: 0.2,
      borderBottom: '2pt solid #3b82f6',
      paddingBottom: 1.5,
      marginBottom: 1.5, // Reduced from 2.5
      marginTop: 3, // Reduced from 6
    },
    sidebarSectionTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#1e293b',
      textTransform: 'uppercase',
      marginTop: 8,
      marginBottom: 2,
      borderBottom: '1pt solid #cbd5e1',
      paddingBottom: 2,
    },
    contactItem: { marginBottom: 3 },
    contactLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginBottom: 1 },
    contactValue: { fontSize: 8, color: '#334155' },
    itemTitle: { fontWeight: 'bold', fontSize: 10, color: '#0f172a' },
    itemSubtitle: { fontSize: 9, color: '#3b82f6', marginBottom: 1.5 },
  }),

  // ── 3. Minimalist (Elegant & Sophisticated) ──
  minimalist: StyleSheet.create({
    page: {
      fontSize: 10.5,
      color: '#444444',
      padding: 35, // Reduced from 50
      backgroundColor: '#ffffff',
    },
    header: {
      marginBottom: 35,
      textAlign: 'left',
    },
    headerName: {
      fontSize: 26,
      fontWeight: 'bold',
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
      fontWeight: 'bold',
      color: '#000000',
      textTransform: 'uppercase',
      letterSpacing: 3,
      marginTop: 15,
      marginBottom: 10,
      borderTop: '0.5pt solid #eeeeee',
      paddingTop: 5,
    },
    itemTitle: { fontWeight: 'bold', fontSize: 11, color: '#111111' },
    itemSubtitle: { fontSize: 10, color: '#222222', marginBottom: 4 },
  })
};

// Common Utility Styles
const CS = StyleSheet.create({
  itemBlock: { marginBottom: 8 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
  itemDate: { fontSize: 8, color: '#666666', flexShrink: 0, marginLeft: 10 },
  bodyText: { fontSize: 9, textAlign: 'justify', lineHeight: 1.02, color: '#333333' },
  linkText: { fontSize: 9, color: '#0066FF', marginBottom: 2 },
  bulletList: { marginTop: 0 },
  bulletRow: { flexDirection: 'row', marginBottom: 0.5 },
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
  // Langsung kembalikan hasil htmlToReactPdf (yang sudah berbentuk View)
  return htmlToReactPdf(html, style);
}

// ── Shared Sections ──────────────────────────────────────────

const Summary = ({ data, lang, S, SGlobal }) => {
  if (!data?.summary) return null;
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.summary')}</Text>
      <RichText html={data.summary} style={S.bodyText || CS.bodyText} />
    </View>
  );
};

const Experience = ({ data, lang, S, SGlobal }) => {
  if (!data?.experiences?.length) return null;
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.experience')}</Text>
      {data.experiences.map((exp, i) => (
        <View key={exp.id || i} style={CS.itemBlock}>
          <View style={CS.itemHeader}>
            <Text style={[S.itemTitle || CS.itemTitle, SGlobal.bold]}>
              {exp.position} {exp.type ? `(${getTranslation(lang, `type.${exp.type}`)})` : ''}
            </Text>
            <Text style={CS.itemDate}>
              {fmtDate(exp.startDate, lang)} – {exp.isCurrent ? getTranslation(lang, 'sec.present', 'Present') : fmtDate(exp.endDate, lang)}
            </Text>
          </View>
          <Text style={[S.itemSubtitle || CS.itemSubtitle, SGlobal.italic]}>{exp.company}</Text>
          <RichText html={exp.description} />
        </View>
      ))}
    </View>
  );
};

const Education = ({ data, lang, S, SGlobal }) => {
  if (!data?.education?.length) return null;
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.education')}</Text>
      {data.education.map((edu, i) => {
        const isBootcamp = edu.degree === 'Bootcamp' || edu.degree === 'Sertifikasi';
        return (
          <View key={edu.id || i} style={CS.itemBlock}>
            <View style={CS.itemHeader}>
              <Text style={[S.itemTitle || CS.itemTitle, SGlobal.bold]}>
                {edu.degree}{edu.field ? `, ${edu.field}` : ''}
              </Text>
              <Text style={CS.itemDate}>
                {fmtDate(edu.startDate, lang)} – {fmtDate(edu.endDate, lang)}
              </Text>
            </View>
            <Text style={[S.itemSubtitle || CS.itemSubtitle, SGlobal.italic]}>{edu.institution}</Text>
            {edu.gpa ? (
              <Text style={{ ...CS.bodyText, fontSize: 8, marginBottom: 1 }}>
                {isBootcamp ? 'Skor / Predikat' : 'IPK / GPA'}: <Text style={SGlobal.bold}>{edu.gpa}</Text>
              </Text>
            ) : null}
            {edu.link ? (
              <Text style={CS.linkText}>Sertifikat: {edu.link}</Text>
            ) : null}
            <RichText html={edu.description} />
          </View>
        );
      })}
    </View>
  );
};

const Certifications = ({ data, lang, S, SGlobal }) => {
  if (!data?.certifications || data.certifications.length === 0) return null;
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.certifications')}</Text>
      {data.certifications.map((c, i) => (
        <View key={c.id || i} style={{ marginBottom: 2 }}>
          <View style={CS.itemHeader}>
            <Text style={S.itemTitle || CS.itemTitle}>{c.name}</Text>
            <Text style={CS.itemDate}>{c.year}</Text>
          </View>
          <Text style={{ fontSize: SIZE_BODY - 1, color: '#444' }}>
            {c.issuer}{c.link ? ` | ${c.link}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
};

const Projects = ({ data, lang, S, SGlobal }) => {
  if (!data?.projects || data.projects.length === 0) return null;
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.projects')}</Text>
      {data.projects.map((p, i) => (
        <View key={p.id || i} style={CS.itemBlock}>
          <View style={CS.itemHeader}>
            <Text style={S.itemTitle || CS.itemTitle}>{p.name}</Text>
            <Text style={{ ...CS.itemDate, fontStyle: 'italic' }}>{p.techStack}</Text>
          </View>
          {p.link ? <Text style={CS.linkText}>{p.link}</Text> : null}
          <RichText html={p.description} />
        </View>
      ))}
    </View>
  );
};

const Organizations = ({ data, lang, S, SGlobal }) => {
  if (!data?.organizations?.length) return null;
  
  const groups = data.organizations.reduce((acc, current) => {
    const existing = acc.find(g => (g.name || '').toLowerCase() === (current.name || '').toLowerCase());
    if (existing) { existing.items.push(current); }
    else { acc.push({ name: current.name, items: [current] }); }
    return acc;
  }, []);

  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.organizations')}</Text>
      {groups.map((group, gi) => (
        <View key={gi} style={{ marginBottom: 3 }}>
          <Text style={{ ...S.itemTitle, borderBottom: '0.5pt solid #eeeeee', marginBottom: 4, paddingBottom: 2 }}>{group.name}</Text>
          {group.items.map((org, i) => (
            <View key={org.id || i} style={{ marginLeft: 10, marginBottom: 4 }}>
              <View style={CS.itemHeader}>
                <Text style={{ ...S.itemSubtitle, fontWeight: 'bold', color: '#333', fontSize: SIZE_BODY }}>{org.role}</Text>
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

const Skills = ({ data, lang, S, SGlobal, sidebar = false }) => {
  const { technical = [], softSkills = [], languages = [] } = data.skills || {};
  if (!technical.length && !softSkills.length && !languages.length) return null;

  if (sidebar) {
    return (
      <View>
        <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.techskills', 'Technical Skills')}</Text></View>
        {technical.length > 0 ? (
          <Text style={{ fontSize: SIZE_BODY - 1, color: '#334155' }}>{technical.join(', ')}</Text>
        ) : null}
        
        {softSkills.length > 0 ? (
          <>
            <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.softskills', 'Soft Skills')}</Text></View>
            <Text style={{ fontSize: SIZE_BODY - 1, color: '#334155' }}>{softSkills.join(', ')}</Text>
          </>
        ) : null}

        {languages.length > 0 ? (
          <>
            <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.languages', 'Languages')}</Text></View>
            <Text style={{ fontSize: SIZE_BODY - 1, color: '#334155' }}>{languages.join(', ')}</Text>
          </>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.skills')}</Text>
      <View style={{ gap: 2 }}>
        {technical.length > 0 ? (
          <Text style={{ fontSize: SIZE_BODY }}>
            <Text style={SGlobal.bold}>{getTranslation(lang, 'sec.techskills', 'Technical')}: </Text>{technical.join(', ')}
          </Text>
        ) : null}
        {softSkills.length > 0 ? (
          <Text style={{ fontSize: SIZE_BODY }}>
            <Text style={SGlobal.bold}>{getTranslation(lang, 'sec.softskills', 'Soft Skills')}: </Text>{softSkills.join(', ')}
          </Text>
        ) : null}
        {languages.length > 0 ? (
          <Text style={{ fontSize: SIZE_BODY }}>
            <Text style={SGlobal.bold}>{getTranslation(lang, 'sec.languages', 'Languages')}: </Text>{languages.join(', ')}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// ── Layout Components ──────────────────────────────────────────

const StandardATS = ({ data, SGlobal }) => {
  const S = styles.standard_ats;
  const { personalInfo: info } = data;
  return (
    <Page size="A4" style={[S.page, SGlobal.global]}>
      <View style={S.header}>
        <Text style={[S.headerName, SGlobal.bold]}>{info.name || ''}</Text>
        <Text style={S.headerContacts}>
          {[info.email, info.phone, info.location].filter(Boolean).join('  |  ')}
        </Text>
        {([info.website, info.linkedin, info.portfolioUrl].some(Boolean)) ? (
          <Text style={S.headerContacts}>
            {[info.linkedin, info.website, info.portfolioUrl].filter(Boolean).join('  |  ')}
          </Text>
        ) : null}
      </View>

      <Summary data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Education data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Skills data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Experience data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Projects data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Organizations data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Certifications data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
    </Page>
  );
};

const ModernCreative = ({ data, SGlobal }) => {
  const S = styles.modern_creative;
  const { personalInfo: info } = data;
  return (
    <Page size="A4" style={[S.page, SGlobal.global]}>
      <View style={S.sidebar}>
        <View style={{ marginBottom: 15 }}>
          <Text style={[S.sidebarName, SGlobal.bold]}>{info.name || ''}</Text>
          <Text style={S.sidebarTitle}>{data.experiences?.[0]?.position || 'Professional'}</Text>

          {(info.qrCodeData ? (
            <View style={{ marginBottom: 5 }}>
              <Image src={info.qrCodeData} style={{ width: 60, height: 60 }} />
            </View>
          ) : null)}
        </View>

        <View style={{ marginBottom: 10 }}>
          <View style={S.sidebarSectionTitle}><Text>{getTranslation(data.lang, 'sec.contact', 'Contact')}</Text></View>
          {[ 
            { label: 'Email', val: info.email },
            { label: 'Telepon', val: info.phone },
            { label: 'Lokasi', val: info.location },
            { label: 'LinkedIn', val: info.linkedin },
            { label: 'Website', val: info.website }
          ].map(c => c.val ? (
            <View key={c.label} style={S.contactItem}>
              <Text style={S.contactLabel}>{c.label}</Text>
              <Text style={S.contactValue}>{c.val}</Text>
            </View>
          ) : null)}
        </View>

        <Skills data={data} lang={data.lang} S={S} SGlobal={SGlobal} sidebar={true} />
      </View>

      <View style={S.main}>
        <Summary data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
        <Education data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
        <Experience data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
        <Projects data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
        <Organizations data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
        <Certifications data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      </View>
    </Page>
  );
};

const MinimalistLayout = ({ data, SGlobal }) => {
  const S = styles.minimalist;
  const { personalInfo: info } = data;
  return (
    <Page size="A4" style={[S.page, SGlobal.global]}>
      <View style={S.header}>
        <Text style={[S.headerName, SGlobal.bold]}>{info.name || ''}</Text>
        <Text style={S.headerTitle}>{data.experiences?.[0]?.position || ''}</Text>
        <Text style={S.headerContacts}>
          {[info.email, info.phone, info.location, info.linkedin].filter(Boolean).join('  •  ')}
        </Text>
      </View>

      <Summary data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Education data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Skills data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Experience data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Projects data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Organizations data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
      <Certifications data={data} lang={data.lang} S={S} SGlobal={SGlobal} />
    </Page>
  );
};

// ── Main CVDocument ──────────────────────────────────────────

export const CVDocument = ({ cvData }) => {
  const { appSettings } = useCVStore.getState();
  const lang = appSettings?.language || 'id';
  const themeFont = getFontFamily(appSettings?.fontFamily || 'serif');
  const template = cvData.selectedTemplate || 'standard_ats';

  const SGlobal = StyleSheet.create({
    global: {
      fontFamily: themeFont.regular,
      lineHeight: LINE_HEIGHT,
    },
    bold: {
      fontFamily: themeFont.bold,
    },
    italic: {
      fontFamily: themeFont.italic,
    }
  });

  return (
    <Document
      title={`CV - ${cvData.personalInfo?.name || 'Professional'}`}
      author={cvData.personalInfo?.name || ''}
      creator="CV Master Royal"
    >
      {template === 'standard_ats' && <StandardATS data={cvData} SGlobal={SGlobal} />}
      {template === 'modern_creative' && <ModernCreative data={cvData} SGlobal={SGlobal} />}
      {template === 'minimalist' && <MinimalistLayout data={cvData} SGlobal={SGlobal} />}
    </Document>
  );
};

export default CVDocument;
