// src/components/preview/CVPreview.jsx
import React, { forwardRef } from 'react';
import useCVStore from '../../store/useCVStore';
import { getTranslation } from '../../utils/translations';

// ── Helpers ──────────────────────────────────────────────────
function formatDate(dateStr, lang = 'id') {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = lang === 'en' ? monthsEn : monthsId;
  return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}

function RichContent({ html, isAts = true }) {
  if (!html?.trim()) return null;
  return (
    <div 
      className={`cv-rich ${isAts ? 'font-times' : 'font-sans'}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function groupByName(items) {
  if (!items) return [];
  return items.reduce((acc, current) => {
    const existing = acc.find(group => (group.name || '').toLowerCase() === (current.name || '').toLowerCase());
    if (existing) {
      existing.items.push(current);
    } else {
      acc.push({ name: current.name, items: [current] });
    }
    return acc;
  }, []);
}

// ── Shared Sub-Components for Preview ────────────────────────

const SectionHeader = ({ title, template = 'ats' }) => {
  if (template === 'ats') {
    return <h2 className="text-[12pt] font-bold uppercase border-b border-black mb-2 mt-4">{title}</h2>;
  }
  if (template === 'creative') {
    return <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b-2 border-blue-500 pb-1 inline-block mb-4 mt-8">{title}</h2>;
  }
  return <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 border-t border-slate-100 pt-8 mb-6 text-center">{title}</h3>;
};

// ── Template Views ──────────────────────────────────────────

const StandardATSView = ({ data, lang }) => {
  const { personalInfo: info, experiences, education, skills, certifications, projects, organizations, summary } = data;
  return (
    <div className="p-[80px] bg-white text-black font-times text-[11pt] leading-[1.4] min-h-[1123px]">
      <div className="border-b-[1.5pt] border-black pb-3 mb-6 text-center">
        <h1 className="text-[18pt] font-bold uppercase tracking-widest leading-none mb-2">{info.name || 'NAMA ANDA'}</h1>
        <p className="text-[9pt]">{[info.email, info.phone, info.location].filter(Boolean).join('  |  ')}</p>
        {[info.website, info.linkedin].some(Boolean) && (
          <p className="text-[9pt] mt-1">{[info.linkedin, info.website].filter(Boolean).join('  |  ')}</p>
        )}
      </div>
      
      {summary && (
        <div className="mb-4">
          <SectionHeader title={getTranslation(lang, 'sec.summary')} template="ats" />
          <RichContent html={summary} isAts={true} />
        </div>
      )}

      {education?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title={getTranslation(lang, 'sec.education')} template="ats" />
          {education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline font-bold text-[11pt]">
                <span>{edu.degree} {edu.field ? `- ${edu.field}` : ''}</span>
                <span className="font-normal text-[10pt]">{formatDate(edu.startDate, lang)} – {formatDate(edu.endDate, lang)}</span>
              </div>
              <p className="italic text-[11pt]">{edu.institution}</p>
              {edu.gpa && <p className="text-[10pt]">GPA: {edu.gpa}</p>}
              {edu.description && (
                <div className="mt-1 text-[10pt]"><RichContent html={edu.description} isAts={true} /></div>
              )}
              {edu.link && <p className="text-[9pt] text-blue-600 underline">Sertifikat: {edu.link}</p>}
            </div>
          ))}
        </div>
      )}

      {((skills?.technical?.length > 0) || (skills?.softSkills?.length > 0) || (skills?.languages?.length > 0)) && (
        <div className="mb-4">
          <SectionHeader title={getTranslation(lang, 'sec.skills')} template="ats" />
          {skills?.technical?.length > 0 && (
            <p className="text-[10pt] mb-1"><strong>Technical Skills:</strong> {skills.technical.join(', ')}</p>
          )}
          {skills?.softSkills?.length > 0 && (
            <p className="text-[10pt] mb-1"><strong>Soft Skills:</strong> {skills.softSkills.join(', ')}</p>
          )}
          {skills?.languages?.length > 0 && (
            <p className="text-[10pt]"><strong>Languages:</strong> {skills.languages.join(', ')}</p>
          )}
        </div>
      )}

      {experiences?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title={getTranslation(lang, 'sec.experience')} template="ats" />
          {experiences.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline font-bold text-[11pt]">
                <span>{exp.position} {exp.type && `(${getTranslation(lang, `type.${exp.type}`)})`}</span>
                <span className="font-normal">{formatDate(exp.startDate, lang)} – {exp.isCurrent ? getTranslation(lang, 'sec.present', 'Present') : formatDate(exp.endDate, lang)}</span>
              </div>
              <p className="italic mb-1">{exp.company}</p>
              <RichContent html={exp.description} isAts={true} />
            </div>
          ))}
        </div>
      )}

      {projects?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title={getTranslation(lang, 'sec.projects')} template="ats" />
          {projects.map((p, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline font-bold text-[11pt]">
                <span>{p.name}</span>
                <span className="font-normal text-[10pt] italic">{p.techStack}</span>
              </div>
              {p.link && <p className="text-[9pt] text-blue-600 underline mb-1">{p.link}</p>}
              <RichContent html={p.description} isAts={true} />
            </div>
          ))}
        </div>
      )}

      {organizations?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title={getTranslation(lang, 'sec.organizations')} template="ats" />
          {groupByName(organizations).map((group, gi) => (
            <div key={gi} className="mb-3">
              <div className="font-bold text-[11pt] border-b border-black/10 mb-1">{group.name}</div>
              {group.items.map((org, i) => (
                <div key={i} className="mb-2 pl-4 border-l-2 border-slate-100 last:mb-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold italic text-[10pt]">{org.role}</span>
                    <span className="text-[10pt]">{org.period}</span>
                  </div>
                  {org.contribution && (
                    <div className="mt-1 text-[10pt] pl-2"><RichContent html={org.contribution} isAts={true} /></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {certifications?.length > 0 && (
        <div className="mb-4">
          <SectionHeader title={getTranslation(lang, 'sec.certifications')} template="ats" />
          {certifications.map((c, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-baseline font-bold">
                <span>{c.name}</span>
                <span className="font-normal">{c.year}</span>
              </div>
              <p className="text-[10pt]">{c.issuer}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

const ModernCreativeView = ({ data, lang }) => {
  const { personalInfo: info, experiences, education, skills, certifications, projects, organizations, summary } = data;
  const { technical = [], softSkills = [], languages = [] } = skills || {};

  return (
    <div className="flex min-h-[1123px] bg-white font-sans text-slate-700 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[32%] bg-slate-50 border-r border-slate-200 p-8 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">{info.name || 'Nama Anda'}</h1>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">
            {experiences?.[0]?.position || 'Professional'}
          </p>
          {info.qrCodeData && <img src={info.qrCodeData} className="w-24 h-24 bg-white p-2 border border-slate-100 rounded-xl shadow-sm mb-6" alt="QR" />}
        </div>

        <div className="space-y-4">
          <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1">{getTranslation(lang, 'sec.contact', 'Kontak')}</h3>
          {[
            { label: getTranslation(lang, 'label.email', 'Email'), val: info.email },
            { label: getTranslation(lang, 'label.phone', 'Telepon'), val: info.phone },
            { label: getTranslation(lang, 'label.location', 'Lokasi'), val: info.location },
            { label: getTranslation(lang, 'label.linkedin', 'LinkedIn'), val: info.linkedin },
            { label: getTranslation(lang, 'label.website', 'Website'), val: info.website },
            { label: getTranslation(lang, 'label.portfolio', 'Portofolio'), val: info.portfolioUrl }
          ].map(c => c.val && (
            <div key={c.label}>
              <p className="text-[7px] uppercase text-slate-400 font-bold mb-0.5">{c.label}</p>
              <p className="text-[11px] break-all leading-snug">{c.val}</p>
            </div>
          ))}
        </div>

        {technical.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1">{getTranslation(lang, 'sec.techskills', 'Keahlian Utama')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {technical.map(s => (
                <span key={s} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg shadow-sm">{s}</span>
              ))}
            </div>
          </div>
        )}

        {softSkills.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1">{getTranslation(lang, 'sec.softskills', 'Soft Skills')}</h3>
            <div className="flex flex-wrap gap-1.5">
              {softSkills.map(s => (
                <span key={s} className="px-2 py-1 bg-slate-100/50 text-slate-500 text-[9px] font-bold rounded-md">{s}</span>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200 pb-1">{getTranslation(lang, 'sec.languages', 'Bahasa')}</h3>
            <div className="space-y-1">
              {languages.map(l => <p key={l} className="text-[11px] font-medium">{l}</p>)}
            </div>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="flex-1 p-10 space-y-2">
        {summary && (
          <div className="space-y-3">
            <SectionHeader title={getTranslation(lang, 'sec.summary')} template="creative" />
            <div className="text-[13px] text-slate-600 leading-relaxed"><RichContent html={summary} isAts={false} /></div>
          </div>
        )}

        {education?.length > 0 && (
          <div className="space-y-6">
            <SectionHeader title={getTranslation(lang, 'sec.education')} template="creative" />
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-[13px] font-black text-slate-900">{edu.degree} {edu.field ? `di ${edu.field}` : ''}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{formatDate(edu.startDate, lang)} – {formatDate(edu.endDate, lang)}</span>
                  </div>
                  <p className="text-[12px] font-bold text-slate-500 italic">{edu.institution}</p>
                  {edu.gpa && <p className="text-[11px] text-slate-400 font-medium">GPA: {edu.gpa}</p>}
                  {edu.description && (
                    <div className="text-[11px] text-slate-500 leading-relaxed mt-1"><RichContent html={edu.description} isAts={false} /></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {experiences?.length > 0 && (
          <div className="space-y-6">
            <SectionHeader title={getTranslation(lang, 'sec.experience')} template="creative" />
            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-blue-100 last:border-transparent">
                  <div className="absolute w-3 h-3 rounded-full bg-blue-500 -left-[7.5px] top-1 shadow-md border-2 border-white"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-[14px] font-black text-slate-900 leading-tight">
                      {exp.position}
                      {exp.type && <span className="ml-2 text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter align-middle">{getTranslation(lang, `type.${exp.type}`)}</span>}
                    </h4>
                    <span className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-full uppercase tracking-tighter">
                      {formatDate(exp.startDate, lang)} – {exp.isCurrent ? getTranslation(lang, 'sec.present', 'Sekarang') : formatDate(exp.endDate, lang)}
                    </span>
                  </div>
                  <p className="text-[11px] font-black text-blue-600 mb-2 uppercase tracking-wide">{exp.company}</p>
                  <div className="text-[12px] leading-relaxed text-slate-600"><RichContent html={exp.description} isAts={false} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects?.length > 0 && (
          <div className="space-y-6">
            <SectionHeader title={getTranslation(lang, 'sec.projects')} template="creative" />
            <div className="grid grid-cols-1 gap-4">
              {projects.map((p, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between mb-2">
                    <h4 className="text-[13px] font-black text-slate-900">{p.name}</h4>
                    <span className="text-[9px] font-bold text-blue-500 uppercase">{p.techStack}</span>
                  </div>
                  <div className="text-[11px] text-slate-600"><RichContent html={p.description} isAts={false} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {organizations?.length > 0 && (
          <div className="space-y-6">
            <SectionHeader title={getTranslation(lang, 'sec.organizations')} template="creative" />
            <div className="space-y-6">
              {groupByName(organizations).map((group, gi) => (
                <div key={gi} className="space-y-3">
                  <div className="text-[11px] font-black text-blue-600 uppercase tracking-wide border-l-4 border-blue-500 pl-3">{group.name}</div>
                  <div className="space-y-4 ml-6">
                    {group.items.map((org, i) => (
                      <div key={i} className="space-y-1.5 relative before:absolute before:-left-3 before:top-2 before:w-1.5 before:h-1.5 before:bg-blue-100 before:rounded-full">
                        <div className="flex justify-between items-start">
                          <h4 className="text-[13px] font-black text-slate-900 leading-tight">{org.role}</h4>
                          <span className="text-[10px] font-bold text-slate-400">{org.period}</span>
                        </div>
                        {org.contribution && (
                          <div className="text-[11px] text-slate-500 leading-relaxed mt-1"><RichContent html={org.contribution} isAts={false} /></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications?.length > 0 && (
          <div className="space-y-6 text-slate-600">
            <SectionHeader title={getTranslation(lang, 'sec.certifications')} template="creative" />
            <div className="grid grid-cols-1 gap-3">
              {certifications.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl">
                  <div>
                    <h4 className="text-[12px] font-black text-slate-900">{c.name}</h4>
                    <p className="text-[11px] font-medium text-slate-400">{c.issuer}</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-300">{c.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MinimalistView = ({ data, lang }) => {
  const { personalInfo: info, experiences, education, skills, certifications, projects, organizations, summary } = data;
  const { technical = [], softSkills = [], languages = [] } = skills || {};
  return (
    <div className="p-16 bg-white text-slate-600 font-sans text-sm leading-relaxed min-h-[1123px]">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-light text-slate-900 tracking-tighter mb-4">{info.name || 'Nama Anda'}</h1>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.5em] font-black flex flex-wrap justify-center gap-x-4 gap-y-2">
          {[info.email, info.phone, info.location, info.linkedin, info.website, info.portfolioUrl].filter(Boolean).map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </p>
      </header>

      {summary && (
        <div className="mb-14 text-center max-w-xl mx-auto">
          <div className="text-[15px] leading-relaxed text-slate-500 italic opacity-80 underline underline-offset-8 decoration-slate-100">
            <RichContent html={summary} isAts={false} />
          </div>
        </div>
      )}

      {education?.length > 0 && (
        <div className="mb-12">
          <SectionHeader title={getTranslation(lang, 'sec.education')} template="minimal" />
          <div className="grid grid-cols-2 gap-x-12 gap-y-8">
            {education.map((edu, i) => (
              <div key={i} className="space-y-1">
                <h4 className="font-bold text-slate-900">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</h4>
                <p className="text-xs text-slate-400">{edu.institution}</p>
                <p className="text-[9px] font-black text-slate-300 uppercase">{formatDate(edu.startDate, lang)} — {formatDate(edu.endDate, lang)}</p>
                {edu.description && (
                  <div className="text-[10px] text-slate-500 mt-2"><RichContent html={edu.description} isAts={false} /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {((technical.length > 0) || (softSkills.length > 0) || (languages.length > 0)) && (
        <div className="mb-12">
          <SectionHeader title={getTranslation(lang, 'sec.skills')} template="minimal" />
          <div className="grid grid-cols-3 gap-8">
            {technical.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{getTranslation(lang, 'sec.techskills')}</h4>
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {technical.map(s => <span key={s} className="text-[12px] text-slate-500">{s}</span>)}
                </div>
              </div>
            )}
            {softSkills.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{getTranslation(lang, 'sec.softskills')}</h4>
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {softSkills.map(s => <span key={s} className="text-[12px] text-slate-500">{s}</span>)}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{getTranslation(lang, 'sec.languages')}</h4>
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {languages.map(l => <span key={l} className="text-[12px] text-slate-500">{l}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {experiences?.length > 0 && (
        <div className="mb-12">
          <SectionHeader title={getTranslation(lang, 'sec.experience')} template="minimal" />
          {experiences.map((exp, i) => (
            <div key={i} className="mb-8 flex gap-12">
              <div className="w-24 text-right shrink-0 mt-1">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{formatDate(exp.startDate, lang)}</p>
                <div className="h-4 w-[1px] bg-slate-100 mx-auto my-1 mr-0"></div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{exp.isCurrent ? getTranslation(lang, 'sec.present', 'Now') : formatDate(exp.endDate, lang)}</p>
              </div>
              <div className="flex-1">
                <h4 className="text-[16px] font-bold text-slate-900 mb-0.5">
                  {exp.position}
                  {exp.type && <span className="ml-3 text-[9px] font-black text-slate-300 uppercase tracking-widest">{getTranslation(lang, `type.${exp.type}`)}</span>}
                </h4>
                <p className="text-xs text-slate-400 font-medium italic mb-3">{exp.company}</p>
                <div className="text-[13px] text-slate-500"><RichContent html={exp.description} isAts={false} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {projects?.length > 0 && (
        <div className="mb-12">
          <SectionHeader title={getTranslation(lang, 'sec.projects')} template="minimal" />
          <div className="space-y-8">
            {projects.map((p, i) => (
              <div key={i} className="flex gap-12">
                <div className="w-24 shrink-0 mt-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-right">PROJECT</p>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-900 mb-1">{p.name}</h4>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">{p.techStack}</p>
                  <div className="text-[13px] text-slate-500 leading-relaxed"><RichContent html={p.description} isAts={false} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {organizations?.length > 0 && (
        <div className="mb-12">
          <SectionHeader title={getTranslation(lang, 'sec.organizations')} template="minimal" />
          <div className="space-y-10">
            {groupByName(organizations).map((group, gi) => (
              <div key={gi} className="flex gap-12">
                <div className="w-24 text-right shrink-0 mt-1 leading-tight">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{group.name}</p>
                </div>
                <div className="flex-1 space-y-6">
                  {group.items.map((org, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-base font-bold text-slate-900">{org.role}</h4>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{org.period}</span>
                      </div>
                      {org.contribution && (
                        <div className="text-[13px] text-slate-500"><RichContent html={org.contribution} isAts={false} /></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {certifications?.length > 0 && (
        <div className="mb-12">
          <SectionHeader title={getTranslation(lang, 'sec.certifications')} template="minimal" />
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">
            {certifications.map((c, i) => (
              <div key={i}>
                <h4 className="font-bold text-slate-800 text-[13px]">{c.name}</h4>
                <p className="text-xs text-slate-400">{c.issuer} — {c.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main CVPreview ──────────────────────────────────────────
const CVPreview = forwardRef(function CVPreview(_, ref) {
  const { cvData, appSettings } = useCVStore();
  const template = cvData.selectedTemplate || 'standard_ats';
  const lang = appSettings?.language || 'id';

  const isEmpty = !cvData.personalInfo?.name && !cvData.summary && !cvData.experiences?.length;

  return (
    <div ref={ref} id="cv-preview-content" className="w-[794px] min-h-[1123px] bg-white shadow-master relative">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[1123px] bg-slate-50/50">
          <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-indigo flex items-center justify-center mb-6">
            <span className="text-4xl">📄</span>
          </div>
          <p className="font-black text-2xl text-slate-900 tracking-tight">Pratinjau CV</p>
          <p className="text-sm font-bold text-slate-400 mt-2">Mulai isi data Anda di sisi kiri</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-700">
          {template === 'standard_ats' && <StandardATSView data={cvData} lang={lang} />}
          {template === 'modern_creative' && <ModernCreativeView data={cvData} lang={lang} />}
          {template === 'minimalist' && <MinimalistView data={cvData} lang={lang} />}
        </div>
      )}

      {/* Global Preview Styles */}
      <style>{`
        #cv-preview-content .font-times { font-family: 'Times New Roman', Times, serif; }
        #cv-preview-content .font-sans { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        #cv-preview-content .cv-rich ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
        #cv-preview-content .cv-rich ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important; }
        #cv-preview-content .cv-rich li { margin-bottom: 0.25rem !important; }
        #cv-preview-content .cv-rich p { margin-bottom: 0.5rem !important; }
        #cv-preview-content .cv-rich strong { font-weight: 700 !important; }
      `}</style>
    </div>
  );
});

export default CVPreview;
