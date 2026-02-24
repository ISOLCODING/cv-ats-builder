// src/components/form/SkillsForm.jsx
// Step 4 — Skills (Modern Blue UI + tags input)

import React, { useState, useRef } from 'react';
import { Cpu, Heart, Languages, X, Plus, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import useCVStore from '../../store/useCVStore';

// ── Skill suggestions ─────────────────────────────────────────
const SUGGESTIONS = {
  technical: [
    'JavaScript','TypeScript','Python','Java','Go','PHP','C++','C#','Rust','Swift','Kotlin',
    'React','Vue.js','Angular','Next.js','Node.js','Express.js','FastAPI','Django','Laravel','Spring Boot',
    'HTML','CSS','Tailwind CSS','Bootstrap','SASS',
    'MySQL','PostgreSQL','MongoDB','Redis','Firebase','Supabase','SQLite',
    'AWS','Google Cloud','Azure','Docker','Kubernetes','Terraform','CI/CD','GitHub Actions',
    'Git','REST API','GraphQL','gRPC','WebSocket',
    'React Native','Flutter',
    'Machine Learning','TensorFlow','PyTorch','scikit-learn','Pandas','NumPy',
    'Power BI','Tableau','Google Analytics','Excel','SQL',
    'Figma','Adobe XD','Photoshop',
    'Linux','Bash','PowerShell','Google Apps Script',
  ],
  softSkills: [
    'Leadership','Project Management','Problem Solving','Critical Thinking',
    'Komunikasi','Public Speaking','Presentasi','Negosiasi',
    'Time Management','Adaptasi','Kreativitas','Inovasi',
    'Teamwork','Kolaborasi','Mentoring','Coaching',
    'Analytical Thinking','Detail-Oriented','Decision Making',
    'Customer Service','Conflict Resolution','Stakeholder Management',
    'Agile / Scrum','Kanban','Design Thinking','Growth Mindset',
  ],
  languages: [
    'Bahasa Indonesia (Native)','Bahasa Inggris (Fluent)','Bahasa Inggris (Professional)',
    'Bahasa Inggris (Conversational)','Bahasa Inggris (Basic)',
    'Bahasa Mandarin','Bahasa Arab','Bahasa Jepang','Bahasa Korea',
    'Bahasa Jerman','Bahasa Prancis','Bahasa Spanyol','Bahasa Belanda',
  ],
};

const CAT_CONFIG = {
  technical: {
    label: 'Technical Skills',
    desc: 'Bahasa, framework, tools',
    icon: Cpu,
    colors: {
      tag:    'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
      delBtn: 'text-blue-400 hover:text-blue-700 hover:bg-blue-200',
      header: 'text-blue-600',
      bg:     'bg-blue-50',
      badge:  'badge badge-blue',
    },
  },
  softSkills: {
    label: 'Soft Skills',
    desc: 'Kemampuan interpersonal',
    icon: Heart,
    colors: {
      tag:    'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100',
      delBtn: 'text-violet-400 hover:text-violet-700 hover:bg-violet-200',
      header: 'text-violet-600',
      bg:     'bg-violet-50',
      badge:  'badge bg-violet-100 text-violet-700',
    },
  },
  languages: {
    label: 'Bahasa',
    desc: 'Kemampuan bahasa',
    icon: Languages,
    colors: {
      tag:    'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
      delBtn: 'text-amber-400 hover:text-amber-700 hover:bg-amber-200',
      header: 'text-amber-600',
      bg:     'bg-amber-50',
      badge:  'badge bg-amber-100 text-amber-700',
    },
  },
};

// ── Tag input per kategori ─────────────────────────────────────
function SkillTagInput({ category, skills = [], onAdd, onRemove }) {
  const [input, setInput]     = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const ref = useRef(null);
  const cfg = CAT_CONFIG[category];
  const Icon = cfg.icon;

  const allSuggestions = SUGGESTIONS[category] || [];
  const filtered = allSuggestions
    .filter((s) => s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s))
    .slice(0, 8);

  const doAdd = (val) => {
    const v = (val || input).trim();
    if (v) { onAdd(category, v); setInput(''); setShowDrop(false); ref.current?.focus(); }
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3 hover:border-blue-200 transition-colors">
      {/* Category header */}
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.colors.bg}`}>
          <Icon className={`w-4 h-4 ${cfg.colors.header}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800 leading-none">{cfg.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{cfg.desc}</p>
        </div>
        <span className={`${cfg.colors.badge} text-xs`}>{skills.length}</span>
      </div>

      {/* Tags display */}
      <div className="flex flex-wrap gap-1.5 min-h-[36px]">
        {skills.length === 0 && (
          <span className="text-xs text-slate-400 self-center italic">Belum ada — tambahkan di bawah</span>
        )}
        {skills.map((skill) => (
          <span
            key={skill}
            className={`skill-tag text-xs font-medium transition-all ${cfg.colors.tag}`}
          >
            {skill}
            <button
              type="button"
              onClick={() => onRemove(category, skill)}
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${cfg.colors.delBtn}`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>

      {/* Input + dropdown */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={ref}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowDrop(true); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); doAdd(input); }
              if (e.key === 'Escape') setShowDrop(false);
            }}
            onFocus={() => setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 180)}
            placeholder="Ketik skill lalu Enter, atau pilih saran…"
            className="form-input flex-1 text-sm py-2"
          />
          <button
            type="button"
            onClick={() => doAdd(input)}
            disabled={!input.trim()}
            className="btn btn-outline btn-sm flex-shrink-0 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dropdown */}
        {showDrop && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-blue-100 rounded-xl shadow-lg overflow-hidden">
            <div className="p-1.5 max-h-48 overflow-y-auto">
              <p className="text-[10px] text-slate-400 font-semibold px-2 py-1 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" /> Saran
              </p>
              {filtered.map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => doAdd(s)}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function SkillsForm({ onNext, onBack }) {
  const { cvData, addSkill, removeSkill } = useCVStore();
  const { skills } = cvData;

  const total = ['technical','softSkills','languages'].reduce(
    (acc, k) => acc + (skills[k]?.length || 0), 0
  );

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="section-header">
        <div className="section-icon">
          <Cpu className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Skills & Kemampuan</h2>
          <p className="text-sm text-slate-500">
            {total > 0 ? `${total} skill ditambahkan` : 'Tambahkan minimal 8 skill'}
          </p>
        </div>
        {total > 0 && (
          <span className="ml-auto badge badge-blue text-sm px-3 py-1 font-bold">{total}</span>
        )}
      </div>

      {/* Warning jika kurang */}
      {total < 5 && total > 0 && (
        <div className="warning-box mb-5 flex gap-2.5">
          <span className="flex-shrink-0 text-lg">💡</span>
          <div>
            <p className="font-semibold mb-0.5">Skills masih sedikit</p>
            <p>Tambahkan minimal 8–12 skills untuk meningkatkan ATS score secara signifikan.</p>
          </div>
        </div>
      )}

      {/* 3 kategori */}
      <div className="space-y-4 mb-6 stagger">
        {Object.keys(CAT_CONFIG).map((cat) => (
          <SkillTagInput
            key={cat}
            category={cat}
            skills={skills[cat] || []}
            onAdd={addSkill}
            onRemove={removeSkill}
          />
        ))}
      </div>

      {/* ATS tip */}
      <div className="tip-box mb-6">
        <p className="font-bold text-blue-800 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Tips Skills untuk ATS
        </p>
        <ul className="text-blue-700 text-xs space-y-1">
          <li>• Gunakan nama skill yang <strong>persis sama</strong> seperti di Job Description</li>
          <li>• Jangan singkat: tulis "JavaScript" bukan "JS", "PostgreSQL" bukan "Postgres"</li>
          <li>• Prioritaskan skill yang paling relevan dengan posisi yang dilamar</li>
          <li>• Sertifikasi aktif sangat disukai ATS — tambahkan di catatan bahasa</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-blue-50">
        <Button variant="secondary" onClick={onBack} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Kembali
        </Button>
        <Button onClick={onNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
          Lanjut: Summary & ATS Check
        </Button>
      </div>
    </div>
  );
}
