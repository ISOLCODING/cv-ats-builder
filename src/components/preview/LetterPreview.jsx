// src/components/preview/LetterPreview.jsx
import React from 'react';
import useCVStore from '../../store/useCVStore';

const FONT = "'Times New Roman', Times, serif";
const SIZE = '12pt';

export default function LetterPreview() {
  const { cvData, coverLetter } = useCVStore();
  const { personalInfo, education } = cvData;
  const { content } = coverLetter;

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        padding: '72px',
        fontFamily: FONT,
        fontSize: SIZE,
        lineHeight: '1.5',
        color: '#000000',
        boxSizing: 'border-box',
        overflow: 'hidden',
        textAlign: 'justify'
      }}
      className="letter-preview"
    >
      <style>{`
        .letter-preview p { margin-bottom: 12px; }
        .letter-preview strong { font-weight: bold; }
        .letter-preview .header { text-align: center; margin-bottom: 20px; }
        .letter-preview .date { text-align: right; margin-bottom: 20px; }
        .letter-preview .destination { margin-bottom: 15px; }
        .letter-preview .content { margin-bottom: 15px; }
        .letter-preview .details { margin-left: 20px; margin-bottom: 15px; }
        .letter-preview .details-row { display: flex; margin-bottom: 4px; }
        .letter-preview .details-label { width: 100px; }
        .letter-preview .details-colon { width: 15px; }
        .letter-preview .attachment { margin-bottom: 15px; }
        .letter-preview .attachment-list { margin-left: 20px; margin-top: 5px; }
        .letter-preview .signature { margin-top: 25px; text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
      `}</style>

      {/* Title */}
      <div className="header">
        <strong style={{ textDecoration: 'underline' }}>SURAT LAMARAN KERJA</strong>
      </div>

      {/* Date */}
      <div className="date">
        {personalInfo?.location || 'Jakarta'}, {today}
      </div>

      {/* Destination */}
      <div className="destination">
        <div>Hal: Lamaran Pekerjaan</div>
        <div style={{ marginTop: '10px' }}>
          <div>Kepada Yth,</div>
          <div>{coverLetter.hrdName || 'Manager Personalia'}</div>
          <div>{coverLetter.company || '[Nama Perusahaan]'}</div>
          <div>Di Tempat</div>
        </div>
      </div>

      {/* Main Content (AI Body) */}
      <div className="content">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Isi surat lamaran akan tampil di sini setelah digenerate...</p>
        )}
      </div>

      {/* Details */}
      <div className="details">
        <div className="details-row">
          <div className="details-label">Nama</div>
          <div className="details-colon">:</div>
          <div>{personalInfo?.name || '-'}</div>
        </div>
        <div className="details-row">
          <div className="details-label">Pendidikan</div>
          <div className="details-colon">:</div>
          <div>{education?.[0]?.institution || '-'} ({education?.[0]?.degree || '-'})</div>
        </div>
        <div className="details-row">
          <div className="details-label">Alamat</div>
          <div className="details-colon">:</div>
          <div>{personalInfo?.location || '-'}</div>
        </div>
        <div className="details-row">
          <div className="details-label">Telepon</div>
          <div className="details-colon">:</div>
          <div>{personalInfo?.phone || '-'}</div>
        </div>
        <div className="details-row">
          <div className="details-label">E-mail</div>
          <div className="details-colon">:</div>
          <div>{personalInfo?.email || '-'}</div>
        </div>
      </div>

      {/* Attachment */}
      <div className="attachment">
        <div>Sebagai bahan pertimbangan, saya lampirkan:</div>
        <div className="attachment-list">
          <div>1. Daftar Riwayat Hidup (CV)</div>
          <div>2. Portofolio Pekerjaan</div>
          <div>3. Dokumen Pendukung Lainnya</div>
        </div>
      </div>

      {/* Signature */}
      <div className="signature">
        <div>Hormat Saya,</div>
        {personalInfo?.signature ? (
          <img 
            src={personalInfo.signature} 
            alt="Signature" 
            style={{ height: '60px', width: 'auto', margin: '5px 0' }} 
          />
        ) : (
          <div style={{ height: '40px' }} />
        )}
        <strong style={{ textTransform: 'uppercase' }}>{personalInfo?.name || '[Nama Anda]'}</strong>
      </div>
    </div>
  );
}
