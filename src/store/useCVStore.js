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
  summary: '',
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
      isSaving: false,
      isLoading: false,
      savedCVId: null,
      toast: null, // { type: 'success'|'error'|'info', message: string }

      // ── Step Navigation ───────────────────────────────────
      setCurrentStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({
        currentStep: Math.min(8, state.currentStep + 1) // 8 steps total now
      })),
      
      prevStep: () => set((state) => ({
        currentStep: Math.max(1, state.currentStep - 1)
      })),

      // ... existing methods (I'll use multi_replace for better precision if needed, but let's try to keep it clean)
      
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
        history: [{ id: generateId(), date: new Date().toISOString(), ...entry }, ...state.history]
      })),

      // ── Full CV Data ──────────────────────────────────────
      setCVData: (cvData) => set({ cvData }),
      
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
      }),
    }

  )
);

// Helper: generate unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export default useCVStore;
