# ⚡ CV ATS Builder

> Buat CV profesional yang lolos sistem ATS (Applicant Tracking System) dengan mudah menggunakan React + Google Apps Script.

![CV ATS Builder](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3-teal) ![GAS](https://img.shields.io/badge/Backend-Google%20Apps%20Script-green)

---

## 🚀 Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 📋 Multi-step Form | 5 langkah: Personal Info → Experience → Education → Skills → Summary |
| 🎯 ATS Score Checker | Analisis real-time keyword match dengan Job Description |
| 👁️ Live Preview | CV preview langsung saat form diisi |
| 📄 PDF Export | Download CV sebagai PDF siap cetak (A4) |
| ☁️ Cloud Save | Simpan & load CV via Google Sheets |
| 🔄 Auto-save | Data tersimpan otomatis di localStorage |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3
- **Form**: React Hook Form
- **State**: Zustand (dengan persist)
- **PDF**: jsPDF + html2canvas
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Deploy**: clasp (Command Line Apps Script Projects)

---

## 📁 Struktur Project

```
my-cv-ats/
├── gas/                    # Google Apps Script (backend)
│   ├── Code.gs             # Main: doGet, doPost, handlers
│   ├── sheets.gs           # CRUD Google Sheets
│   ├── utils.gs            # Helper functions
│   ├── appsscript.json     # GAS manifest
│   └── index.html          # 🔄 Auto-generated dari build
│
├── src/                    # React Frontend
│   ├── components/
│   │   ├── form/           # 5 step forms
│   │   ├── preview/        # CVPreview (ATS-friendly)
│   │   └── ui/             # Button, Input, Stepper
│   ├── store/
│   │   └── useCVStore.js   # Zustand global state
│   ├── hooks/
│   │   └── useGAS.js       # GAS communication hook
│   ├── utils/
│   │   ├── atsScore.js     # ATS scoring engine
│   │   └── exportPDF.js    # PDF export logic
│   ├── App.jsx             # Root component
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles + design system
│
├── scripts/
│   └── copy-build.js       # Copy dist → gas/index.html
│
├── .clasp.json             # Clasp config (isi scriptId)
├── vite.config.js          # Single-file build config
└── package.json
```

---

## 🏃 Cara Menjalankan

### Development (Local)

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev
# → http://localhost:5173
```

### Production (Deploy ke Google Apps Script)

**Langkah 1: Setup Google Sheets**
1. Buat Google Spreadsheet baru
2. Catat **Spreadsheet ID** dari URL: `https://docs.google.com/spreadsheets/d/[INI_SPREADSHEET_ID]/edit`
3. Buka `gas/Code.gs` dan ganti `YOUR_SPREADSHEET_ID_HERE` dengan ID tersebut

**Langkah 2: Setup Google Apps Script**
1. Buka [Google Apps Script](https://script.google.com)
2. Buat project baru
3. Catat **Script ID** dari URL: `https://script.google.com/home/projects/[INI_SCRIPT_ID]/edit`

**Langkah 3: Setup Clasp**
```bash
# Install clasp global
npm install -g @google/clasp

# Login ke Google
clasp login

# Isi .clasp.json dengan Script ID Anda
# Edit file .clasp.json:
# { "scriptId": "SCRIPT_ID_ANDA", "rootDir": "./gas" }
```

**Langkah 4: Deploy**
```bash
# Build React + Copy ke gas/ + Push ke GAS
npm run deploy

# Atau step by step:
npm run build          # Build React app
node scripts/copy-build.js  # Copy ke gas/index.html
clasp push             # Push ke Google Apps Script
```

**Langkah 5: Publish Web App**
1. Buka Google Apps Script Editor
2. Click **Deploy** → **New deployment**
3. Pilih type: **Web App**
4. Execute as: **Me**
5. Who has access: **Anyone** (atau Anyone with Google account)
6. Click **Deploy** dan copy deployment URL

**Langkah 6: Setup .env (opsional untuk FETCH mode)**
```bash
# Salin .env.example ke .env
cp .env.example .env

# Isi VITE_GAS_ENDPOINT dengan deployment URL
VITE_GAS_ENDPOINT=https://script.google.com/macros/s/YOUR_ID/exec
```

**Langkah 7: Inisialisasi Sheet**
- Di GAS Editor, jalankan fungsi `gsInitSheet()` satu kali untuk membuat struktur sheet

---

## 📊 Struktur Google Sheets

Sheet: **CVs**

| Kolom | Isi |
|-------|-----|
| A: id | UUID unik |
| B: timestamp | ISO 8601 |
| C: name | Nama user |
| D: email | Email (lowercase) |
| E: data | JSON.stringify(cvData) |

---

## 🎯 ATS Score System

Cara kerja ATS Score Checker:
1. **Ekstrak keyword** dari Job Description (JD) yang di-paste user
2. **Build CV text** — gabungkan semua field CV menjadi satu string
3. **Keyword matching** — cek setiap keyword JD ada di teks CV
4. **Hitung score** = (matched / total) × 100
5. **Generate saran** berdasarkan score dan field yang kurang

Score interpretation:
- 🏆 80-100: **Excellent** — CV sangat relevan
- 🎯 60-79: **Good** — Cukup relevan, perlu sedikit improve
- 📈 40-59: **Fair** — Kurang relevan, perlu banyak keyword
- ⚠️ 0-39: **Poor** — Tidak relevan, perlu revisi signifikan

---

## 📄 CV Preview — Prinsip ATS-Friendly

CV Preview dirancang khusus agar lolos ATS:
- ✅ **Single column** — Tidak ada multi-column layout
- ✅ **Font standar** — Arial/Helvetica
- ✅ **No images atau grafik** — ATS tidak bisa baca gambar
- ✅ **No table** — Tabel sering gagal di-parse ATS
- ✅ **Clear section headers** — Uppercase, mudah diidentifikasi
- ✅ **Standard sections** — Work Experience, Education, Skills, Summary

---

## 🔧 Komunikasi Frontend → GAS

Ada dua mode:

### Mode 1: Embedded (GAS Web App)
Saat app berjalan di dalam GAS, gunakan `google.script.run`:
```js
// useGAS.js otomatis detect environment
window.google.script.run
  .withSuccessHandler(resolve)
  .withFailureHandler(reject)
  .gsSaveCV(cvData);
```

### Mode 2: HTTP Fetch (Development/External)
Saat development lokal, gunakan fetch ke GAS deployment URL:
```js
fetch(GAS_ENDPOINT, {
  method: 'POST',
  body: JSON.stringify({ action: 'saveCV', cvData })
});
```

---

## 📝 Environment Variables

| Variable | Deskripsi |
|----------|-----------|
| `VITE_GAS_ENDPOINT` | URL deployment GAS untuk mode fetch |

---

## 📋 Scripts

```bash
npm run dev          # Development server
npm run build        # Build production
npm run preview      # Preview build
npm run deploy       # Build + copy + clasp push
npm run copy-build   # Hanya copy dist ke gas/
npm run clasp:push   # Hanya push ke GAS
npm run clasp:open   # Buka GAS editor di browser
```

---

## 🐛 Troubleshooting

**Q: Save/Load tidak berfungsi di local dev**
A: Normal! Fitur cloud memerlukan GAS. Di local, data tersimpan di localStorage otomatis.

**Q: PDF export hasilnya buram**
A: Coba zoom in preview ke 100% sebelum export. html2canvas bekerja berdasarkan rendered size.

**Q: Clasp push error "Script ID not found"**
A: Pastikan `.clasp.json` sudah benar dan Anda sudah `clasp login`.

**Q: GAS "not found" setelah deploy**
A: Tunggu beberapa menit setelah deploy baru, dan pastikan Web App access = "Anyone".

---

## 📜 License

MIT — Bebas digunakan untuk kebutuhan pribadi maupun komersial.

---

*Dibuat dengan ❤️ menggunakan React + Google Apps Script*
