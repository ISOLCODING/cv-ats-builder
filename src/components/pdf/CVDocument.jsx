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

const SIZE_BODY    = 10; // Reduced from 11
const SIZE_SMALL   = 8;  // Reduced from 9
const SIZE_HEADER  = 18; // Reduced from 20
const SIZE_SECTION = 11; // Reduced from 12
const LINE_HEIGHT  = 1.05; // Aggressively tightened

// ── Layout Styles ─────────────────────────────────────────────
const styles = {
  // ── 1. Standard ATS (Professional & Clean) ──
  standard_ats: StyleSheet.create({
    page: {
      fontSize:        SIZE_BODY,
      color:           '#000000',
      padding:         30, // Reduced from 40
      backgroundColor: '#ffffff',
    },
    header: {
      borderBottom: '1pt solid #000000',
      paddingBottom: 4, // Reduced from 5
      marginBottom: 8, // Reduced from 10
      textAlign: 'center',
    },
    headerName: {
      fontWeight: 'bold',
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
      fontSize: SIZE_SECTION,
      textTransform: 'uppercase',
      borderBottom: '1pt solid #000000',
      marginTop: 4, // Reduced from 6
      marginBottom: 2, // Reduced from 3
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
      fontWeight: 'bold',
      color: '#0f172a',
      marginBottom: 4,
      lineHeight: 1.1,
    },
    sidebarTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#3b82f6',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
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
      fontWeight: 'bold',
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
    itemTitle: { fontWeight: 'bold', fontSize: 11, color: '#0f172a' },
    itemSubtitle: { fontSize: 10, color: '#3b82f6', marginBottom: 2 },
  }),

  // ── 3. Minimalist (Elegant & Sophisticated) ──
  minimalist: StyleSheet.create({
    page: {
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
      marginTop: 25,
      marginBottom: 10,
      borderTop: '0.5pt solid #eeeeee',
      paddingTop: 10,
    },
    itemTitle: { fontWeight: 'bold', fontSize: 11, color: '#111111' },
    itemSubtitle: { fontSize: 10, color: '#222222', marginBottom: 4 },
  })
};

// Common Utility Styles
const CS = StyleSheet.create({
  itemBlock: { marginBottom: 3 }, // Reduced from 6
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 1 },
  itemDate: { fontSize: 8, color: '#666666', flexShrink: 0, marginLeft: 10 },
  bodyText: { fontSize: 9, textAlign: 'justify', lineHeight: 1.3, color: '#333333' },
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

const Summary = ({ summary, S, lang, SGlobal }) => 
  (summary && typeof summary === 'string' && summary.trim()) ? (
    <View style={{ marginBottom: 8 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.summary')}</Text>
      <RichText html={summary} style={S.bodyText || CS.bodyText} />
    </View>
  ) : null;

const Experience = ({ experiences, S, lang, SGlobal }) => 
  (experiences && experiences.length > 0) ? (
    <View style={{ marginBottom: 8 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.experience')}</Text>
      {experiences.map((exp, i) => (
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
  ) : null;

const Education = ({ education, S, lang, SGlobal }) => 
  (education && education.length > 0) ? (
    <View style={{ marginBottom: 8 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.education')}</Text>
      {education.map((edu, i) => {
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
  ) : null;

const Certifications = ({ certifications, S, lang }) => 
  (certifications && certifications.length > 0) ? (
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

const Projects = ({ projects, S, lang }) => 
  (projects && projects.length > 0) ? (
    <View style={{ marginBottom: 10 }}>
      <Text style={S.sectionTitle}>{getTranslation(lang, 'sec.projects')}</Text>
      {projects.map((p, i) => (
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
                <Text style={{ ...S.itemSubtitle, fontWeight: 'bold', color: '#333', fontSize: 10 }}>{org.role}</Text>
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



const Skills = ({ skills, S, lang, SGlobal, sidebar = false }) => {
  const { technical = [], softSkills = [], languages = [] } = skills || {};
  if (!technical.length && !softSkills.length && !languages.length) return null;

  if (sidebar) {
    return (
      <View>
        <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.techskills', 'Technical Skills')}</Text></View>
        {technical.length > 0 ? (
          <Text style={{ fontSize: 8, color: '#334155' }}>{technical.join(', ')}</Text>
        ) : null}
        
        {softSkills.length > 0 ? (
          <>
            <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.softskills', 'Soft Skills')}</Text></View>
            <Text style={{ fontSize: 8, color: '#334155' }}>{softSkills.join(', ')}</Text>
          </>
        ) : null}

        {languages.length > 0 ? (
          <>
            <View style={S.sidebarSectionTitle}><Text>{getTranslation(lang, 'sec.languages', 'Languages')}</Text></View>
            <Text style={{ fontSize: 8, color: '#334155' }}>{languages.join(', ')}</Text>
          </>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={[S.sectionTitle, SGlobal.bold]}>{getTranslation(lang, 'sec.skills')}</Text>
      <View style={{ gap: 2 }}>
        {technical.length > 0 ? (
          <Text style={{ fontSize: 9 }}>
            <Text style={SGlobal.bold}>{getTranslation(lang, 'sec.techskills', 'Technical')}: </Text>{technical.join(', ')}
          </Text>
        ) : null}
        {softSkills.length > 0 ? (
          <Text style={{ fontSize: 9 }}>
            <Text style={SGlobal.bold}>{getTranslation(lang, 'sec.softskills', 'Soft Skills')}: </Text>{softSkills.join(', ')}
          </Text>
        ) : null}
        {languages.length > 0 ? (
          <Text style={{ fontSize: 9 }}>
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

      <Summary summary={data.summary} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Education education={data.education} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Skills skills={data.skills} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Experience experiences={data.experiences} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Projects projects={data.projects} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Organizations organizations={data.organizations} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Certifications certifications={data.certifications} S={S} lang={data.lang} SGlobal={SGlobal} />
    </Page>
  );
};

const ModernCreative = ({ data, SGlobal }) => {
  const S = styles.modern_creative;
  const { personalInfo: info } = data;
  return (
    <Page size="A4" style={[S.page, SGlobal.global]}>
      <View style={S.sidebar}>
        <Text style={[S.sidebarName, SGlobal.bold]}>{info.name || ''}</Text>
        <Text style={[S.sidebarTitle, SGlobal.bold]}>{data.experiences?.[0]?.position || ''}</Text>

        {info.qrCodeData ? (
          <View style={{ width: 60, height: 60, marginBottom: 15 }}>
            <Image src={info.qrCodeData} style={{ width: '100%', height: '100%' }} />
          </View>
        ) : null}

        <View style={S.sidebarSectionTitle}><Text>{getTranslation(data.lang, 'sec.contact', 'Contact')}</Text></View>
        {[
          { label: 'Email', val: info.email },
          { label: 'Phone', val: info.phone },
          { label: 'Location', val: info.location },
          { label: 'LinkedIn', val: info.linkedin },
          { label: 'Web', val: info.website },
          { label: 'Portfolio', val: info.portfolioUrl }
        ].map(c => c.val ? (
          <View key={c.label} style={S.contactItem}>
            <Text style={S.contactLabel}>{c.label}</Text>
            <Text style={S.contactValue}>{c.val}</Text>
          </View>
        ) : null)}

        <Skills skills={data.skills} S={S} sidebar={true} lang={data.lang} SGlobal={SGlobal} />
      </View>

      <View style={S.main}>
        <Summary summary={data.summary} S={S} lang={data.lang} SGlobal={SGlobal} />
        <Education education={data.education} S={S} lang={data.lang} SGlobal={SGlobal} />
        <Experience experiences={data.experiences} S={S} lang={data.lang} SGlobal={SGlobal} />
        <Projects projects={data.projects} S={S} lang={data.lang} SGlobal={SGlobal} />
        <Organizations organizations={data.organizations} S={S} lang={data.lang} SGlobal={SGlobal} />
        <Certifications certifications={data.certifications} S={S} lang={data.lang} SGlobal={SGlobal} />
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
          {[info.email, info.phone, info.location, info.linkedin, info.website, info.portfolioUrl].filter(Boolean).join('  •  ')}
        </Text>
      </View>

      <Summary summary={data.summary} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Education education={data.education} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Skills skills={data.skills} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Experience experiences={data.experiences} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Projects projects={data.projects} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Organizations organizations={data.organizations} S={S} lang={data.lang} SGlobal={SGlobal} />
      <Certifications certifications={data.certifications} S={S} lang={data.lang} SGlobal={SGlobal} />
    </Page>
  );
};

// ── Main Export ─────────────────────────────────────────────

export const CVDocument = ({ cvData }) => {
  const template = cvData?.selectedTemplate || 'standard_ats';
  const appSettings = useCVStore.getState().appSettings || {};
  const data = {
    ...cvData,
    lang: appSettings.language || 'id',
    font: getFontFamily(appSettings.fontFamily || 'serif')
  };

  const currentStyles = StyleSheet.create({
    global: {
      fontFamily: data.font.regular,
    },
    bold: {
      fontFamily: data.font.bold,
      fontWeight: 'bold',
    },
    italic: {
      fontFamily: data.font.italic,
      fontStyle: 'italic',
    }
  });

  return (
    <Document 
      title={`${cvData?.personalInfo?.name || 'CV'} - Curriculum Vitae`} 
      author={cvData?.personalInfo?.name || ''}
      creator="CV Master Royal"
    >
      <>
        {template === 'standard_ats' && <StandardATS data={data} SGlobal={currentStyles} />}
        {template === 'modern_creative' && <ModernCreative data={data} SGlobal={currentStyles} />}
        {template === 'minimalist' && <MinimalistLayout data={data} SGlobal={currentStyles} />}
      </>
    </Document>
  );
};

export default CVDocument;
