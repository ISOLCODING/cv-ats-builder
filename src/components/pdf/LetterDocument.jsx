 // src/components/pdf/LetterDocument.jsx
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

const FONT_REGULAR = 'Times-Roman';
const FONT_BOLD    = 'Times-Bold';
const SIZE_BODY    = 12;
const LINE_HEIGHT  = 1.5;
const MARGIN_PAGE  = 72; // 1 inch standard

const S = StyleSheet.create({
  page: {
    fontFamily:      FONT_REGULAR,
    fontSize:        SIZE_BODY,
    lineHeight:      LINE_HEIGHT,
    padding:         MARGIN_PAGE,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 12,
  },
  text: {
    textAlign: 'justify',
  },
  bold: {
    fontFamily: FONT_BOLD,
  },
  signatureBlock: {
    marginTop: 30,
    alignItems: 'flex-end', // Kanan
  },
  signatureImage: {
    width: 120,
    height: 60,
    marginVertical: 5,
  }
});

export function LetterDocument({ content, personalInfo, education, hrdName, company }) {
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Document title="Surat Lamaran">
      <Page size="A4" style={S.page}><View style={{ alignItems: 'center', marginBottom: 20 }}><Text style={[S.bold, { textDecoration: 'underline' }]}>SURAT LAMARAN KERJA</Text></View><View style={{ alignItems: 'flex-end', marginBottom: 20 }}><Text>{personalInfo?.location || 'Jakarta'}, {today}</Text></View><View style={S.section}><Text>Hal: Lamaran Pekerjaan</Text><View style={{ marginTop: 10 }}><Text>Kepada Yth,</Text><Text>{hrdName || 'Manager Personalia'}</Text><Text>{company || '[Nama Perusahaan]'}</Text><Text>Di Tempat</Text></View></View><View style={{ marginBottom: 15 }}>{htmlToReactPdf(content, S.text)}</View><View style={{ marginLeft: 20, marginBottom: 15 }}><View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={{ width: 100 }}>Nama</Text><Text style={{ width: 10 }}>:</Text><Text style={{ flex: 1 }}>{personalInfo?.name || '-'}</Text></View><View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={{ width: 100 }}>Pendidikan</Text><Text style={{ width: 10 }}>:</Text><Text style={{ flex: 1 }}>{education?.[0]?.institution || '-'} ({education?.[0]?.degree || '-'})</Text></View><View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={{ width: 100 }}>Alamat</Text><Text style={{ width: 10 }}>:</Text><Text style={{ flex: 1 }}>{personalInfo?.location || '-'}</Text></View><View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={{ width: 100 }}>Telepon</Text><Text style={{ width: 10 }}>:</Text><Text style={{ flex: 1 }}>{personalInfo?.phone || '-'}</Text></View><View style={{ flexDirection: 'row', marginBottom: 4 }}><Text style={{ width: 100 }}>E-mail</Text><Text style={{ width: 10 }}>:</Text><Text style={{ flex: 1 }}>{personalInfo?.email || '-'}</Text></View></View><View style={S.section}><Text style={S.text}>Sebagai bahan pertimbangan, saya lampirkan:</Text><View style={{ marginLeft: 20, marginTop: 5 }}><Text>1. Daftar Riwayat Hidup (CV)</Text><Text>2. Portofolio Pekerjaan</Text><Text>3. Dokumen Pendukung Lainnya</Text></View></View><View style={S.signatureBlock}><Text>Hormat Saya,</Text>{personalInfo?.signature ? (<Image src={personalInfo.signature} style={S.signatureImage} />) : (<View style={{ height: 40 }} />)}<Text style={S.bold}>{personalInfo?.name || '[Nama Anda]'}</Text></View></Page>
    </Document>
  );
}

export default LetterDocument;
