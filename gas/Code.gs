/**
 * gas/Code.gs
 * ============================================================
 * Main server logic untuk CV ATS Google Apps Script backend.
 * 
 * Endpoints:
 *   GET  → serve index.html (React app)
 *   POST → handle JSON actions:
 *          - "saveCV"   : simpan CV ke Google Sheets
 *          - "loadCV"   : load CV by email
 *          - "listCVs"  : list semua CV
 *          - "deleteCV" : hapus CV by id
 * ============================================================
 */

// ─── KONFIGURASI ────────────────────────────────────────────
// Ganti dengan Spreadsheet ID dari Google Sheets Anda
var SPREADSHEET_ID = '177poP43IF0Dea5VmC9kWcG5X26D4gYOuyWXDAGO8IM4';

// Nama sheet untuk menyimpan CV
var SHEET_NAME_CVS = 'CVs';

// ─── ENTRY POINTS ────────────────────────────────────────────

/**
 * doGet() — Serve React app sebagai Web App
 * Dipanggil saat user membuka URL Web App via browser
 */
function doGet(e) {
  try {
    var template = HtmlService.createHtmlOutputFromFile('index');
    template
      .setTitle('CV ATS Builder')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    
    return template;
  } catch (error) {
    // Fallback jika index.html belum di-push
    return HtmlService.createHtmlOutput(
      '<h1 style="font-family:Arial;text-align:center;margin-top:100px">' +
      '⚠️ Build belum di-deploy.<br>' +
      '<small>Jalankan npm run deploy terlebih dahulu.</small>' +
      '</h1>'
    );
  }
}

/**
 * doPost(e) — Handle semua POST request dari frontend React
 * Request body harus JSON dengan field "action"
 */
function doPost(e) {
  // Set CORS headers agar bisa dipanggil dari domain lain
  var response = {
    success: false,
    message: '',
    data: null
  };

  try {
    // Parse request body
    var requestBody = JSON.parse(e.postData.contents);
    var action = requestBody.action;
    
    Utils.log('doPost called with action: ' + action);

    // Route ke handler yang sesuai
    switch (action) {
      case 'saveCV':
        response = handleSaveCV(requestBody);
        break;
      
      case 'loadCV':
        response = handleLoadCV(requestBody);
        break;
      
      case 'listCVs':
        response = handleListCVs(requestBody);
        break;
      
      case 'deleteCV':
        response = handleDeleteCV(requestBody);
        break;
      
      default:
        response.message = 'Action tidak dikenal: ' + action;
    }

  } catch (error) {
    response.success = false;
    response.message = 'Error: ' + error.message;
    Utils.log('doPost error: ' + error.message + '\n' + error.stack);
  }

  // Return JSON response
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── HANDLERS ────────────────────────────────────────────────

/**
 * handleSaveCV — Simpan atau update data CV ke Google Sheets
 * 
 * Request: { action, cvData: { personalInfo, experiences, education, skills, summary } }
 * Response: { success, message, data: { id } }
 */
function handleSaveCV(requestBody) {
  var cvData = requestBody.cvData;
  
  if (!cvData) {
    return { success: false, message: 'Data CV tidak boleh kosong', data: null };
  }
  
  // Validasi field wajib
  if (!cvData.personalInfo || !cvData.personalInfo.email) {
    return { success: false, message: 'Email wajib diisi', data: null };
  }

  var email = cvData.personalInfo.email.toLowerCase().trim();
  var name = cvData.personalInfo.name || 'Unknown';
  
  // Cek apakah CV dengan email ini sudah ada (untuk update)
  var existingRow = SheetsDB.findCVByEmail(SPREADSHEET_ID, SHEET_NAME_CVS, email);
  
  var cvId;
  
  if (existingRow) {
    // UPDATE — CV dengan email ini sudah ada
    cvId = existingRow.id;
    SheetsDB.updateCV(SPREADSHEET_ID, SHEET_NAME_CVS, cvId, {
      name: name,
      email: email,
      data: JSON.stringify(cvData),
      timestamp: new Date().toISOString()
    });
    Utils.log('CV updated for email: ' + email + ', id: ' + cvId);
    
    return {
      success: true,
      message: 'CV berhasil diperbarui!',
      data: { id: cvId, action: 'updated' }
    };
    
  } else {
    // INSERT — CV baru
    cvId = Utils.generateId();
    SheetsDB.insertCV(SPREADSHEET_ID, SHEET_NAME_CVS, {
      id: cvId,
      timestamp: new Date().toISOString(),
      name: name,
      email: email,
      data: JSON.stringify(cvData)
    });
    Utils.log('CV inserted for email: ' + email + ', id: ' + cvId);
    
    return {
      success: true,
      message: 'CV berhasil disimpan!',
      data: { id: cvId, action: 'created' }
    };
  }
}

/**
 * handleLoadCV — Load CV dari Sheets berdasarkan email
 * 
 * Request: { action, email }
 * Response: { success, message, data: { cvData } }
 */
function handleLoadCV(requestBody) {
  var email = requestBody.email;
  
  if (!email) {
    return { success: false, message: 'Email tidak boleh kosong', data: null };
  }
  
  email = email.toLowerCase().trim();
  var row = SheetsDB.findCVByEmail(SPREADSHEET_ID, SHEET_NAME_CVS, email);
  
  if (!row) {
    return { success: false, message: 'CV tidak ditemukan untuk email: ' + email, data: null };
  }
  
  // Parse JSON data
  var cvData;
  try {
    cvData = JSON.parse(row.data);
  } catch (e) {
    return { success: false, message: 'Data CV rusak (invalid JSON)', data: null };
  }
  
  return {
    success: true,
    message: 'CV berhasil dimuat!',
    data: {
      id: row.id,
      timestamp: row.timestamp,
      name: row.name,
      email: row.email,
      cvData: cvData
    }
  };
}

/**
 * handleListCVs — Daftar semua CV yang tersimpan
 * 
 * Request: { action }
 * Response: { success, data: [ { id, timestamp, name, email } ] }
 */
function handleListCVs(requestBody) {
  var allRows = SheetsDB.getAllCVs(SPREADSHEET_ID, SHEET_NAME_CVS);
  
  // Strip "data" column karena terlalu besar — hanya kirim metadata
  var list = allRows.map(function(row) {
    return {
      id: row.id,
      timestamp: row.timestamp,
      name: row.name,
      email: row.email
    };
  });
  
  return {
    success: true,
    message: list.length + ' CV ditemukan',
    data: { cvs: list, total: list.length }
  };
}

/**
 * handleDeleteCV — Hapus CV berdasarkan ID
 * 
 * Request: { action, id }
 * Response: { success, message }
 */
function handleDeleteCV(requestBody) {
  var id = requestBody.id;
  
  if (!id) {
    return { success: false, message: 'ID CV tidak boleh kosong', data: null };
  }
  
  var deleted = SheetsDB.deleteCVById(SPREADSHEET_ID, SHEET_NAME_CVS, id);
  
  if (deleted) {
    return { success: true, message: 'CV berhasil dihapus', data: { id: id } };
  } else {
    return { success: false, message: 'CV dengan ID ' + id + ' tidak ditemukan', data: null };
  }
}

// ─── FUNGSI YANG BISA DIPANGGIL DARI google.script.run ──────

/**
 * Fungsi-fungsi ini dipanggil LANGSUNG dari frontend (embedded mode)
 * menggunakan google.script.run (bukan POST request)
 */

/**
 * gsSaveCV — Dipanggil via google.script.run.gsSaveCV(cvData)
 */
function gsSaveCV(cvData) {
  return handleSaveCV({ cvData: cvData });
}

/**
 * gsLoadCV — Dipanggil via google.script.run.gsLoadCV(email)
 */
function gsLoadCV(email) {
  return handleLoadCV({ email: email });
}

/**
 * gsListCVs — Dipanggil via google.script.run.gsListCVs()
 */
function gsListCVs() {
  return handleListCVs({});
}

/**
 * gsDeleteCV — Dipanggil via google.script.run.gsDeleteCV(id)
 */
function gsDeleteCV(id) {
  return handleDeleteCV({ id: id });
}

/**
 * gsInitSheet — Inisialisasi struktur sheet (panggil sekali di awal)
 * Bisa dipanggil manual dari GAS editor
 */
function gsInitSheet() {
  SheetsDB.initializeSheets(SPREADSHEET_ID, SHEET_NAME_CVS);
  return { success: true, message: 'Sheet berhasil diinisialisasi' };
}
