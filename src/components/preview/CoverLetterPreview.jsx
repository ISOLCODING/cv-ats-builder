// src/components/preview/CoverLetterPreview.jsx
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import LetterDocument from '../pdf/LetterDocument';
import useCVStore from '../../store/useCVStore';

export default function CoverLetterPreview() {
  const { cvData, coverLetter } = useCVStore();

  if (!coverLetter?.content) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium">
        Belum ada konten surat untuk dipreview.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden border border-slate-200">
      <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
        <LetterDocument 
          content={coverLetter.content}
          personalInfo={cvData.personalInfo}
          jobPosition={coverLetter.jobPosition}
          education={cvData.education}
        />
      </PDFViewer>
    </div>
  );
}
