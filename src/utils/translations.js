// src/utils/translations.js
export const t = {
  id: {
    // Stepper & Nav
    'app.dashboard': 'DASHBOARD',
    'app.history': 'RIWAYAT',
    'app.settings': 'PENGATURAN',
    'app.print_pdf': 'Cetak PDF',
    'app.preview_cv': 'Pratinjau CV',
    
    // Resume Sections
    'sec.summary': 'Profil Profesional',
    'sec.experience': 'Pengalaman Kerja',
    'sec.education': 'Pendidikan',
    'sec.certifications': 'Sertifikasi',
    'sec.projects': 'Proyek',
    'sec.organizations': 'Organisasi',
    'sec.skills': 'Keahlian' ,
    'sec.contact': 'Kontak',
    'sec.techskills': 'Keahlian Utama',
    'sec.softskills': 'Soft Skills',
    'sec.languages': 'Bahasa',
    'sec.present': 'Sekarang',
    
    // Forms
    'form.next': 'Lanjut',
    'form.back': 'Kembali',
    'form.save': 'Simpan',
    'form.add': 'Tambah',
    'form.delete': 'Hapus',
    
    // Labels
    'label.name': 'Nama Lengkap',
    'label.email': 'Email',
    'label.phone': 'Telepon',
    'label.location': 'Lokasi',
    'label.linkedin': 'LinkedIn',
    'label.portfolio': 'Website / Portfolio',
    
    'label.position': 'Posisi / Jabatan',
    'label.company': 'Perusahaan',
    'label.startDate': 'Tanggal Mulai',
    'label.endDate': 'Tanggal Selesai',
    'label.present': 'Saat ini',
    'label.description': 'Deskripsi (Gunakan Bullet Points)',
    
    'label.degree': 'Gelar',
    'label.field': 'Jurusan',
    'label.institution': 'Institusi',
    'label.gpa': 'IPK',
    
    'label.skillName': 'Nama Keahlian',
    'label.certName': 'Nama Sertifikat',
    'label.certIssuer': 'Penerbit',
    'label.certYear': 'Tahun',
    'label.certLink': 'Link Sertifikat',
    
    'label.projName': 'Nama Projek',
    'label.projStack': 'Tech Stack',
    'label.projLink': 'Link Projek',
    
    'label.orgName': 'Nama Organisasi',
    'label.orgRole': 'Peran',
    'label.orgPeriod': 'Periode',
  },
  en: {
    // Stepper & Nav
    'app.dashboard': 'DASHBOARD',
    'app.history': 'HISTORY',
    'app.settings': 'SETTINGS',
    'app.print_pdf': 'Export PDF',
    'app.preview_cv': 'CV Preview',

    // Resume Sections
    'sec.summary': 'Profile Summary',
    'sec.experience': 'Work Experience',
    'sec.education': 'Education',
    'sec.certifications': 'Certifications',
    'sec.projects': 'Projects',
    'sec.organizations': 'Organizations',
    'sec.skills': 'Skills',
    'sec.contact': 'Contact',
    'sec.techskills': 'Technical Skills',
    'sec.softskills': 'Soft Skills',
    'sec.languages': 'Languages',
    'sec.present': 'Present',

    // Forms
    'form.next': 'Next',
    'form.back': 'Back',
    'form.save': 'Save',
    'form.add': 'Add',
    'form.delete': 'Delete',

    // Labels
    'label.name': 'Full Name',
    'label.email': 'Email',
    'label.phone': 'Phone',
    'label.location': 'Location',
    'label.linkedin': 'LinkedIn',
    'label.portfolio': 'Website / Portfolio',
    
    'label.position': 'Position / Job Title',
    'label.company': 'Company',
    'label.startDate': 'Start Date',
    'label.endDate': 'End Date',
    'label.present': 'Present',
    'label.description': 'Description (Use Bullet Points)',
    
    'label.degree': 'Degree',
    'label.field': 'Field of Study',
    'label.institution': 'Institution',
    'label.gpa': 'GPA / Score',
    
    'label.skillName': 'Skill Name',
    'label.certName': 'Certification Name',
    'label.certIssuer': 'Issuer',
    'label.certYear': 'Year',
    'label.certLink': 'Credential Link',
    
    'label.projName': 'Project Name',
    'label.projStack': 'Tech Stack',
    'label.projLink': 'Project Link',
    
    'label.orgName': 'Organization Name',
    'label.orgRole': 'Role',
    'label.orgPeriod': 'Period',
  }
};

export function getTranslation(lang = 'id', key, fallback) {
  if (!t[lang]) return fallback || key;
  return t[lang][key] || fallback || key;
}
