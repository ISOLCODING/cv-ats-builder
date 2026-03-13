// src/store/useCVStore.js
// ============================================================
// Zustand global state management untuk CV ATS Builder.
//
// State:
//   currentStep     — Step form saat ini (1-5)
//   cvData          — Semua data CV terstruktur
//   atsResult       — Hasil ATS score analysis
//   jobDescription  — Text JD yang diinput user untuk ATS check
//   isSaving        — Loading state saat save ke GAS
//   isLoading       — Loading state saat load dari GAS
//   savedCVId       — ID CV yang terakhir disimpan
//   toast           — Notification toast state
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translateCVContent } from '../services/groq';


// Default shape untuk cvData
const defaultCVData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    website: '',
    portfolioUrl: '', // URL untuk QR Code
    qrCodeData: '',   // Base64 QR Image
    signature: '', // Base64 image
  },
  experiences: [
    // {
    //   id: string,
    //   company: string,
    //   position: string,
    //   startDate: string,
    //   endDate: string,
    //   isCurrent: boolean,
    //   description: string,  // bullet points, pisah dengan newline
    // }
  ],
  education: [
    // {
    //   id: string,
    //   institution: string,
    //   degree: string,
    //   field: string,
    //   startDate: string,
    //   endDate: string,
    //   gpa: string,
    //   description: string,
    // }
  ],
  skills: {
    technical: [],    // string[]
    softSkills: [],   // string[]
    languages: [],    // string[]
  },
  certifications: [], // { id, name, issuer, year, link }
  projects: [],       // { id, name, description, techStack, link }
  organizations: [],  // { id, name, role, period, contribution }
  summary: '',
  selectedTemplate: 'standard_ats', // 'standard_ats' | 'modern_creative' | 'minimalist'
};

// Default Settings (Royal Branding)
const defaultSettings = {
  appName: 'CV Master',
  appLogo: '', // Base64
  favicon: '', // Base64
  primaryColor: '#2563eb',
  accentColor: '#f59e0b',
  language: 'id', // 'id' | 'en'
  fontFamily: 'serif', // 'serif' (Times) | 'sans' (Helvetica) | 'tahoma' (Inter/Tahoma lookalike)
};

// Default ATS result
const defaultATSResult = {
  score: 0,
  matchedKeywords: [],
  missingKeywords: [],
  suggestions: [],
  totalKeywords: 0,
};

const useCVStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────
      currentStep: 1,
      cvData: defaultCVData,
      atsResult: {
        ...defaultATSResult,
        breakdown: { keywordMatch: 0, formatScore: 0, relevance: 0 },
        specificSuggestions: [],
        experienceRelevance: '',
      },
      jobDescription: '',
      coverLetter: {
        content: '',
        tone: 'formal',
        jobPosition: '',
        company: '',
        hrdName: '',
        status: 'draft', // 'draft' | 'generated'
      },
      history: [], // [{ id, date, company, position, type: 'cv'|'letter' }]
      appSettings: defaultSettings,
      isSaving: false,
      isLoading: false,
      savedCVId: null,
      toast: null, // { type: 'success'|'error'|'info', message: string }

      // ── Step Navigation ───────────────────────────────────
      setCurrentStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({
        currentStep: Math.min(12, state.currentStep + 1) // 12 steps total now
      })),
      
      prevStep: () => set((state) => ({
        currentStep: Math.max(1, state.currentStep - 1)
      })),

      // ... existing methods (I'll use multi_replace for better precision if needed, but let's try to keep it clean)
      
      // ── Settings ──────────────────────────────────────────
      updateSettings: (settings) => set((state) => ({
        appSettings: { ...state.appSettings, ...settings }
      })),

      setFontFamily: (font) => set((state) => ({
        appSettings: { ...state.appSettings, fontFamily: font }
      })),

      // ── Language Toggle & Translator ──────────────────────
      translateCVData: async (targetLang) => {
        set({ isSaving: true });
        try {
          const state = get();
          // Strip out base64 images or large payloads that don't need translation to save tokens
          const cvDataToTranslate = { ...state.cvData };
          if (cvDataToTranslate.personalInfo) {
            cvDataToTranslate.personalInfo = {
              ...cvDataToTranslate.personalInfo,
              qrCodeData: '',
              signature: ''
            };
          }

          const result = await translateCVContent({
            cvData: cvDataToTranslate,
            coverLetter: state.coverLetter,
            targetLang
          });

          // Helper to ensure we only save strings for text content
          const ensureString = (val, fallback = '') => (typeof val === 'string' ? val : (val && typeof val === 'object' ? JSON.stringify(val) : String(val || fallback)));

          // Replace translated fields while keeping non-translated intact like personalInfo
          set((prev) => ({
            cvData: {
              ...prev.cvData,
              summary: ensureString(result.cvData.summary, prev.cvData.summary),
              experiences: result.cvData.experiences || prev.cvData.experiences,
              education: result.cvData.education || prev.cvData.education,
              skills: result.cvData.skills || prev.cvData.skills,
              certifications: result.cvData.certifications || prev.cvData.certifications,
              projects: result.cvData.projects || prev.cvData.projects,
              organizations: result.cvData.organizations || prev.cvData.organizations,
            },
            coverLetter: {
              ...prev.coverLetter,
              content: ensureString(result.coverLetter, prev.coverLetter.content),
            },
            appSettings: {
              ...prev.appSettings,
              language: targetLang
            }
          }));

          get().showToast('success', `Translasi CV ke bahasa ${targetLang.toUpperCase()} berhasil menggunakan Groq AI!`);
        } catch (err) {
          // Tetap ganti bahasa UI meskipun translasi konten CV dari AI gagal karena limit
          set((prev) => ({
            appSettings: {
              ...prev.appSettings,
              language: targetLang
            }
          }));
          get().showToast('error', 'UI bahasa diubah, tapi translasi konten CV gagal limit AI: ' + err.message);
        } finally {
          set({ isSaving: false });
        }
      },

      // ── Personal Info ─────────────────────────────────────
      updatePersonalInfo: (info) => set((state) => ({
        cvData: {
          ...state.cvData,
          personalInfo: { ...state.cvData.personalInfo, ...info }
        }
      })),

      // ── Experience ────────────────────────────────────────
      addExperience: (experience) => set((state) => ({
        cvData: {
          ...state.cvData,
          experiences: [
            ...state.cvData.experiences,
            { id: generateId(), ...experience }
          ]
        }
      })),

      updateExperience: (id, data) => set((state) => ({
        cvData: {
          ...state.cvData,
          experiences: state.cvData.experiences.map((exp) =>
            exp.id === id ? { ...exp, ...data } : exp
          )
        }
      })),

      removeExperience: (id) => set((state) => ({
        cvData: {
          ...state.cvData,
          experiences: state.cvData.experiences.filter((exp) => exp.id !== id)
        }
      })),

      reorderExperiences: (experiences) => set((state) => ({
        cvData: { ...state.cvData, experiences }
      })),

      // ── Education ─────────────────────────────────────────
      addEducation: (education) => set((state) => ({
        cvData: {
          ...state.cvData,
          education: [
            ...state.cvData.education,
            { id: generateId(), ...education }
          ]
        }
      })),

      updateEducation: (id, data) => set((state) => ({
        cvData: {
          ...state.cvData,
          education: state.cvData.education.map((edu) =>
            edu.id === id ? { ...edu, ...data } : edu
          )
        }
      })),

      removeEducation: (id) => set((state) => ({
        cvData: {
          ...state.cvData,
          education: state.cvData.education.filter((edu) => edu.id !== id)
        }
      })),

      reorderEducation: (education) => set((state) => ({
        cvData: { ...state.cvData, education }
      })),

      // ── Certifications ───────────────────────────────────
      addCertification: (cert) => set((state) => ({
        cvData: {
          ...state.cvData,
          certifications: [
            ...state.cvData.certifications,
            { id: generateId(), ...cert }
          ]
        }
      })),

      updateCertification: (id, data) => set((state) => ({
        cvData: {
          ...state.cvData,
          certifications: state.cvData.certifications.map((c) =>
            c.id === id ? { ...c, ...data } : c
          )
        }
      })),

      removeCertification: (id) => set((state) => ({
        cvData: {
          ...state.cvData,
          certifications: state.cvData.certifications.filter((c) => c.id !== id)
        }
      })),

      // ── Projects ──────────────────────────────────────────
      addProject: (project) => set((state) => ({
        cvData: {
          ...state.cvData,
          projects: [
            ...state.cvData.projects,
            { id: generateId(), ...project }
          ]
        }
      })),

      updateProject: (id, data) => set((state) => ({
        cvData: {
          ...state.cvData,
          projects: state.cvData.projects.map((p) =>
            p.id === id ? { ...p, ...data } : p
          )
        }
      })),

      removeProject: (id) => set((state) => ({
        cvData: {
          ...state.cvData,
          projects: state.cvData.projects.filter((p) => p.id !== id)
        }
      })),

      // ── Organizations ─────────────────────────────────────
      addOrganization: (org) => set((state) => ({
        cvData: {
          ...state.cvData,
          organizations: [
            ...state.cvData.organizations,
            { id: generateId(), ...org }
          ]
        }
      })),

      updateOrganization: (id, data) => set((state) => ({
        cvData: {
          ...state.cvData,
          organizations: state.cvData.organizations.map((o) =>
            o.id === id ? { ...o, ...data } : o
          )
        }
      })),

      removeOrganization: (id) => set((state) => ({
        cvData: {
          ...state.cvData,
          organizations: state.cvData.organizations.filter((o) => o.id !== id)
        }
      })),

      // ── Skills ────────────────────────────────────────────
      addSkill: (category, skill) => set((state) => {
        const trimmed = skill.trim();
        if (!trimmed) return state;
        const current = state.cvData.skills[category] || [];
        if (current.includes(trimmed)) return state; // Hindari duplikat
        return {
          cvData: {
            ...state.cvData,
            skills: {
              ...state.cvData.skills,
              [category]: [...current, trimmed]
            }
          }
        };
      }),

      removeSkill: (category, skill) => set((state) => ({
        cvData: {
          ...state.cvData,
          skills: {
            ...state.cvData.skills,
            [category]: (state.cvData.skills[category] || []).filter((s) => s !== skill)
          }
        }
      })),

      updateSkills: (skills) => set((state) => ({
        cvData: { ...state.cvData, skills }
      })),

      // ── Summary ───────────────────────────────────────────
      updateSummary: (summary) => set((state) => ({
        cvData: { ...state.cvData, summary }
      })),

      setTemplate: (templateId) => set((state) => ({
        cvData: { ...state.cvData, selectedTemplate: templateId }
      })),

      // ── Cover Letter ──────────────────────────────────────
      updateCoverLetter: (data) => set((state) => ({
        coverLetter: { ...state.coverLetter, ...data }
      })),

      setCoverLetterContent: (content) => set((state) => ({
        coverLetter: { ...state.coverLetter, content, status: 'generated' }
      })),

      // ── History ───────────────────────────────────────────
      setHistory: (history) => set({ history }),
      addToHistory: (entry) => set((state) => ({
        history: [{ id: generateId(), date: new Date().toISOString(), status: 'Terkirim', ...entry }, ...state.history]
      })),
      updateHistoryItem: (id, updates) => set((state) => ({
        history: state.history.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),

      // ── Full CV Data ──────────────────────────────────────
      setCVData: (data) => {
        if (data && typeof data === 'object') {
          set({ cvData: data });
        }
      },
      
      resetCVData: () => set({
        cvData: defaultCVData,
        atsResult: defaultATSResult,
        currentStep: 1,
        savedCVId: null,
        jobDescription: '',
        coverLetter: {
          content: '',
          tone: 'formal',
          jobPosition: '',
          company: '',
          hrdName: '',
          status: 'draft',
        },
      }),

      // ── ATS Result ────────────────────────────────────────
      setATSResult: (result) => set({ atsResult: result }),
      
      setJobDescription: (jd) => set({ jobDescription: jd }),

      // ── Async State ───────────────────────────────────────
      setIsSaving: (isSaving) => set({ isSaving }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setSavedCVId: (id) => set({ savedCVId: id }),

      // ── Settings Cloud-Sync ──────────────────────────────
      syncSettings: async (method = "get") => {
        const { appSettings } = get();
        try {
          const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
          const response = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify({ action: "syncSettings", method, settings: appSettings })
          });
          const res = await response.json();
          if (res.success && method === "get" && res.data) {
            set({ appSettings: { ...appSettings, ...res.data } });
          }
          return res;
        } catch (err) {
          console.error("Settings sync failed:", err);
          return { success: false };
        }
      },

      // ── Analytics Logging ────────────────────────────────
      logAnalytics: async (analyticsData) => {
        try {
          const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
          await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify({ action: "logAnalytics", analyticsData })
          });
        } catch (err) {
          console.error("Analytics log failed:", err);
        }
      },

      // ── Portfolio Publishing ───────────────────────────
      publishPortfolio: async (isPublic) => {
        const { savedCVId, showToast } = get();
        if (!savedCVId) {
          showToast("error", "Simpan CV Anda terlebih dahulu!");
          return { success: false };
        }
        try {
          const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
          const response = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify({ action: "publishPortfolio", id: savedCVId, isPublic })
          });
          const res = await response.json();
          if (res.success) {
            showToast("success", isPublic ? "CV berhasil di-publish ke publik!" : "CV kini bersifat privat.");
          }
          return res;
        } catch (err) {
          console.error("Publish failed:", err);
          return { success: false };
        }
      },


      // ── Toast ─────────────────────────────────────────────
      showToast: (type, message) => {
        set({ toast: { type, message } });
        // Auto-dismiss setelah 4 detik
        setTimeout(() => {
          set((state) => {
            // Hanya clear jika toast ini yang masih aktif
            if (state.toast?.message === message) {
              return { toast: null };
            }
            return state;
          });
        }, 4000);
      },
      clearToast: () => set({ toast: null }),

      // ── Computed (getters) ────────────────────────────────
      getIsFormComplete: () => {
        const { cvData } = get();
        return (
          cvData.personalInfo.name &&
          cvData.personalInfo.email &&
          cvData.summary
        );
      },
    }),
    {
      name: 'cv-ats-storage', // localStorage key
      partialize: (state) => ({
        // Hanya persist data utama, bukan UI state
        cvData: state.cvData,
        jobDescription: state.jobDescription,
        savedCVId: state.savedCVId,
        coverLetter: state.coverLetter,
        history: state.history,
        appSettings: state.appSettings,
      }),
    }

  )
);

// Helper: generate unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
export default useCVStore;
