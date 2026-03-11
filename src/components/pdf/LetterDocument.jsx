 // src/components/pdf/LetterDocument.jsx
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

const SIZE_BODY    = 11; // Reduced from 12
const LINE_HEIGHT  = 1.18; // Reduced from 1.35
const MARGIN_PAGE  = 50; // Reduced from 72 (1 inch) to fit better

const S = StyleSheet.create({
  page: {
    fontSize:        SIZE_BODY,
    lineHeight:      LINE_HEIGHT,
    padding:         MARGIN_PAGE,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 10, // Reduced from 12
  },
  text: {
    textAlign: 'justify',
  },
  bold: {
    fontWeight: 'bold',
  },
  signatureBlock: {
    marginTop: 30,
    alignItems: 'flex-end', // Kanan
  },
  signatureImage: {
    width: 120,
    height: 60,
    marginVertical: 5,
    objectFit: 'contain',
  }
});

export function LetterDocument({ content, personalInfo, education, hrdName, company }) {
  const appSettings = useCVStore.getState().appSettings || {};
  const font = getFontFamily(appSettings.fontFamily || 'serif');

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Document title="Surat Lamaran">
      <Page size="A4" style={{ ...S.page, fontFamily: font.regular }}>
        <View style={{ alignItems: 'center', marginBottom: 15 }}>
          <Text style={[S.bold, { textDecoration: 'underline', fontFamily: font.bold }]}>SURAT LAMARAN KERJA</Text>
        </View>

        <View style={{ alignItems: 'flex-end', marginBottom: 15 }}>
          <Text>{personalInfo?.location || 'Jakarta'}, {today}</Text>
        </View>

        <View style={S.section}>
          <Text>Hal: Lamaran Pekerjaan</Text>
          <View style={{ marginTop: 5 }}>
            <Text>Kepada Yth,</Text>
            <Text style={{ fontFamily: font.bold }}>{hrdName || 'Manager Personalia'}</Text>
            <Text>{company || '[Nama Perusahaan]'}</Text>
            <Text>Di Tempat</Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          {htmlToReactPdf(content, { ...S.text, fontFamily: font.regular })}
        </View>

        <View style={{ marginLeft: 15, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ width: 80 }}>Nama</Text>
            <Text style={{ width: 10 }}>:</Text>
            <Text style={{ flex: 1, fontFamily: font.bold }}>{personalInfo?.name || ''}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ width: 80 }}>Pendidikan</Text>
            <Text style={{ width: 10 }}>:</Text>
            <Text style={{ flex: 1 }}>{education?.[0]?.institution || '-'} ({education?.[0]?.degree || '-'})</Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ width: 80 }}>Alamat</Text>
            <Text style={{ width: 10 }}>:</Text>
            <Text style={{ flex: 1 }}>{personalInfo?.location || '-'}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ width: 80 }}>Telepon</Text>
            <Text style={{ width: 10 }}>:</Text>
            <Text style={{ flex: 1 }}>{personalInfo?.phone || '-'}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <Text style={{ width: 80 }}>E-mail</Text>
            <Text style={{ width: 10 }}>:</Text>
            <Text style={{ flex: 1 }}>{personalInfo?.email || '-'}</Text>
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.text}>Sebagai bahan pertimbangan, saya lampirkan:</Text>
          <View style={{ marginLeft: 15, marginTop: 4 }}>
            <Text>1. Daftar Riwayat Hidup (CV)</Text>
            <Text>2. Portofolio Pekerjaan</Text>
            <Text>3. Dokumen Pendukung Lainnya</Text>
          </View>
        </View>

        <View style={[S.signatureBlock, { marginTop: 20 }]}>
          <Text>Hormat Saya,</Text>
          {personalInfo?.signature ? (
            <Image src={personalInfo.signature} style={S.signatureImage} />
          ) : (
            <View style={{ height: 40 }} />
          )}
          <Text style={[S.bold, { fontFamily: font.bold }]}>{personalInfo?.name || ''}</Text>
        </View>
      </Page>
    </Document>
  );
}

export default LetterDocument;
