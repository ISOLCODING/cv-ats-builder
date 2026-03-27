/**
 * gas/sheets.gs
 * ============================================================
 * Google Sheets CRUD operations untuk CV ATS.
 * 
 * Struktur Sheet "CVs":
 *   Kolom A: id         (string, UUID)
 *   Kolom B: timestamp  (string, ISO 8601)
 *   Kolom C: name       (string)
 *   Kolom D: email      (string, lowercase)
 *   Kolom E: data       (string, JSON.stringify dari cvData)
 * ============================================================
 */

var SheetsDB = (function() {

  // ── Helper: dapatkan Spreadsheet ─────────────────────────
  function _getSpreadsheet(spreadsheetId) {
    if (!spreadsheetId || spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
      // Kalau ID belum diisi, coba cari spreadsheet aktif
      var activeSheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSheet) return activeSheet;
      throw new Error('SPREADSHEET_ID belum dikonfigurasi di Code.gs. Isi dengan ID Google Sheets Anda.');
    }
    return SpreadsheetApp.openById(spreadsheetId);
  }

  // ── Helper: dapatkan Sheet by name ───────────────────────
  function _getSheet(spreadsheetId, sheetName) {
    var ss = _getSpreadsheet(spreadsheetId);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      // Buat sheet baru kalau belum ada
      sheet = ss.insertSheet(sheetName);
      _addHeaders(sheet);
    }
    return sheet;
  }

  // ── Helper: tambah header row untuk sheet CVs (Internal Data) ──────────
  function _addHeaders(sheet) {
    if (sheet.getName() === 'History') return; // History punya format sendiri
    
    var headers = ['ID CV', 'WAKTU TERAKHIR', 'NAMA USER', 'EMAIL', 'DATA LENGKAP (JSON)'];
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    
    headerRange
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(10)
      .setFontFamily('Inter')
      .setBackground('#1e293b') // Slate 800
      .setFontColor('#ffffff')
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('center');
    
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);
    
    var widths = [120, 160, 200, 220, 400];
    widths.forEach(function(w, i) {
      sheet.setColumnWidth(i + 1, w);
    });
  }

  // ── Helper: Format Users Sheet (For Admin & Auth) ───────────
  function _formatUsersSheet(sheet) {
    var headers = ['ID', 'NAME', 'EMAIL', 'PASSWORD', 'ROLE', 'PAYMENT_STATUS', 'PAYMENT_PROOF', 'TIMESTAMP'];
    
    // Force set headers carefully
    for (var i = 0; i < headers.length; i++) {
        sheet.getRange(1, i + 1).setValue(headers[i]);
    }
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange
      .setFontWeight('bold')
      .setBackground('#4f46e5') // Indigo 600
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
      
    sheet.setFrozenRows(1);
    var widths = [120, 180, 220, 120, 100, 150, 250, 160];
    widths.forEach(function(w, i) {
      sheet.setColumnWidth(i + 1, w);
    });
    
    // Check if admin exists
    var headerMap = _getHeaderMap(sheet);
    var emailIdx = headerMap['EMAIL'] !== undefined ? headerMap['EMAIL'] : 2;
    var lastRow = sheet.getLastRow();
    var hasAdmin = false;
    
    if (lastRow > 1) {
      var rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
      for (var i = 0; i < rows.length; i++) {
        if ((rows[i][emailIdx] || '').toLowerCase().trim() === 'admin@mail.com') hasAdmin = true;
      }
    }
    
    if (!hasAdmin) {
      var adminData = {
        'ID': 'admin123',
        'NAME': 'Super Admin',
        'EMAIL': 'admin@mail.com',
        'PASSWORD': 'admin123',
        'ROLE': 'Admin',
        'PAYMENT_STATUS': 'Approved',
        'PAYMENT_PROOF': 'None',
        'TIMESTAMP': new Date().toISOString()
      };
      sheet.appendRow(headers.map(function(h) { return adminData[h]; }));
    }
  }

  // ── Helper: Format Payments Sheet (Logging) ────────────────
  function _formatPaymentsSheet(sheet) {
    var headers = ['ID', 'TIMESTAMP', 'EMAIL', 'NAME', 'PROOF_URL', 'STATUS'];
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    
    headerRange
      .setValues([headers])
      .setFontWeight('bold')
      .setBackground('#f59e0b') // Amber 500
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');
      
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 120); // ID
    sheet.setColumnWidth(2, 160); // Timestamp
    sheet.setColumnWidth(3, 220); // Email
    sheet.setColumnWidth(4, 200); // Name
    sheet.setColumnWidth(5, 400); // Proof URL
    sheet.setColumnWidth(6, 120); // Status
  }

  // ── Helper: Get Header Map (Dynamic Indexing) ──────────────
  function _getHeaderMap(sheet) {
    var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 10).getValues()[0];
    var map = {};
    headerRow.forEach(function(h, i) {
      if (h) map[String(h).toUpperCase().trim()] = i;
    });
    return map;
  }

  // ── Helper: Format History Sheet Premium ───────────────────
  function _formatHistorySheet(sheet) {
    // 0. Clean the sheet first for professional reset
    sheet.clear();
    sheet.getRange(1, 1, 1000, 20).clearFormat().clearDataValidations();
    
    // 1. Setup Header Progress Tracker (Gold/Premium Theme)
    sheet.getRange("A1:H1").merge().setValue("RECRUITMENT PROGRESS TRACKER 2026")
      .setBackground("#ca8a04") // Gold
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setFontSize(14)
      .setFontFamily("Inter");

    var headers = ['No', 'Company', 'Position/Program', 'Job Type', 'Source (Reff)', 'Link Document', 'Apply Date', 'Progress (Status)', 'Applicant Email', 'UID'];
    var headerRange = sheet.getRange(2, 1, 1, headers.length);
    
    headerRange
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(10)
      .setFontFamily('Inter')
      .setBackground('#0f172a') // Slate 900
      .setFontColor('#ffffff')
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('center');

    // Atur Lebar Kolom (A-J)
    var widths = [40, 180, 200, 100, 120, 150, 130, 140, 180, 120];
    widths.forEach(function(w, i) {
      sheet.setColumnWidth(i + 1, w);
    });
    
    sheet.setRowHeight(1, 45);
    sheet.setRowHeight(2, 40);
    sheet.setFrozenRows(2);
    
    var widths = [40, 200, 220, 100, 130, 250, 120, 140, 10, 10];
    widths.forEach(function(w, i) {
      sheet.setColumnWidth(i + 1, w);
    });

    // 2. Setup Dashboard Widgets (Sidebar J - S)
    _setupDashboardWidgets(sheet);

    // 3. Validation & Conditional Formatting
    _applyDataValidations(sheet);
    _applyStatusFormatting(sheet);
  }

  function _setupDashboardWidgets(sheet) {
    var startCol = 10; // J
    
    // --- Widget 1: Summary Progress ---
    var r1 = sheet.getRange(2, startCol, 1, 5);
    r1.merge().setValue("SUMMARY PROGRESS").setBackground("#0f172a").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(9);
    
    var sHeaders = ["On Process", "Declined", "Waiting", "Offering", "Total Apply"];
    sheet.getRange(3, startCol, 1, 5).setValues([sHeaders]).setBackground("#f8fafc").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(8).setBorder(true, true, true, true, true, true, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);
    
    var sFormulas = [
      '=COUNTIF(H3:H1000; "Interview")',
      '=COUNTIF(H3:H1000; "Ditolak")',
      '=COUNTIF(H3:H1000; "Terkirim")',
      '=COUNTIF(H3:H1000; "Offering")',
      '=COUNTA(B3:B1000)'
    ];
    sheet.getRange(4, startCol, 1, 5).setFormulas([sFormulas]).setBackground("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(11);

    // --- Widget 2: Job Type Overall ---
    var r2 = sheet.getRange(6, startCol, 1, 5);
    r2.merge().setValue("JOB TYPE OVERALL").setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(9);
    
    var jHeaders = ["Fulltime", "Intern", "Contract", "MT", "Freelance"];
    sheet.getRange(7, startCol, 1, 5).setValues([jHeaders]).setBackground("#f8fafc").setFontWeight("bold").setHorizontalAlignment("center").setFontSize(8);
    
    var jFormulas = [
      '=COUNTIF(D3:D1000; "Fulltime")',
      '=COUNTIF(D3:D1000; "Intern")',
      '=COUNTIF(D3:D1000; "Contract")',
      '=COUNTIF(D3:D1000; "MT")',
      '=COUNTIF(D3:D1000; "Freelance")'
    ];
    sheet.getRange(8, startCol, 1, 5).setFormulas([jFormulas]).setBackground("#ffffff").setHorizontalAlignment("center").setFontWeight("bold");

    // Padding & Border for Widgets
    sheet.getRange(2, startCol, 7, 5).setBorder(true, true, true, true, null, null, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  function _applyDataValidations(sheet) {
    // Tambahkan 'On Process' agar sinkron dengan backend
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['On Process', 'Terkirim', 'Interview', 'Assesment', 'Offering', 'Ditolak'], true)
      .build();
    sheet.getRange("H2:H1000").setDataValidation(statusRule);

    var typeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Fulltime', 'Intern', 'Contract', 'MT', 'Freelance'], true)
      .build();
    sheet.getRange("D2:D1000").setDataValidation(typeRule);
    
    var reffRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['LinkedIn', 'Jobstreet', 'Glints', 'Job Fair', 'Website', 'Referral'], true)
      .build();
    sheet.getRange("E2:E1000").setDataValidation(reffRule);
  }

  function _applyStatusFormatting(sheet) {
    var range = sheet.getRange("H2:H1000"); // Column H is STATUS now
    
    sheet.clearConditionalFormatRules();
    
    var rules = [];
    
    // Rule: TERKIRIM (Emerald)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Terkirim")
      .setBackground("#ecfdf5")
      .setFontColor("#065f46")
      .setRanges([range])
      .build());

    // Rule: ON PROCESS (Blue/Sky)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("On Process")
      .setBackground("#e0f2fe")
      .setFontColor("#0369a1")
      .setRanges([range])
      .build());

    // Rule: INTERVIEW (Purple)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Interview")
      .setBackground("#f5f3ff")
      .setFontColor("#5b21b6")
      .setRanges([range])
      .build());

    // Rule: DITOLAK (Rose)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Ditolak")
      .setBackground("#fff1f2")
      .setFontColor("#9f1239")
      .setRanges([range])
      .build());

    // Alternate Row Colors for entire table
    var tableRange = sheet.getRange("A2:I1000");
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied("=MOD(ROW(),2)=0")
      .setBackground("#f8fafc")
      .setRanges([tableRange])
      .build());

    sheet.setConditionalFormatRules(rules);
  }

  // ── Helper: row array → object ───────────────────────────
  function _rowToObject(row) {
    return {
      id:        row[0] || '',
      timestamp: row[1] ? (row[1] instanceof Date ? Utilities.formatDate(row[1], "GMT+7", "dd/MM/yyyy HH:mm:ss") : String(row[1])) : '',
      name:      row[2] || '',
      email:     row[3] || '',
      data:      row[4] || ''
    };
  }

  function _historyRowToObject(row) {
    var rawDate = row[6];
    var timestamp = '';
    if (rawDate instanceof Date) {
      timestamp = Utilities.formatDate(rawDate, "GMT+7", "dd/MM/yyyy HH:mm");
    } else {
      timestamp = String(rawDate || '');
    }

    return {
      no:        row[0] || '',
      company:   row[1] || '',
      position:  row[2] || '',
      jobType:   row[3] || '',
      source:    row[4] || '',
      fileUrl:   row[5] || '',
      timestamp: timestamp, // Using timestamp to match frontend
      status:    row[7] || '',
      email:     row[8] || '',
      id:        row[9] || '' // UID (J)
    };
  }

  // ── Helper: ambil semua data (tanpa header) ───────────────
  function _getAllRows(sheet, colCount) {
    var lastRow = sheet.getLastRow();
    var sheetName = sheet.getName();
    
    // History punya 2 baris header (Title + Header Labels)
    if (sheetName === 'History') {
      if (lastRow <= 2) return [];
      var range = sheet.getRange(3, 1, lastRow - 2, colCount || 10);
      return range.getValues();
    }
    
    // Sheet lain (CVs) punya 1 baris header
    if (lastRow <= 1) return [];
    var range = sheet.getRange(2, 1, lastRow - 1, colCount || 5);
    return range.getValues();
  }

  // ─── PUBLIC API ───────────────────────────────────────────

  /**
   * initializeSheets — Setup struktur awal Google Sheets
   * Panggil sekali saat pertama kali setup
   */
  function initializeSheets(spreadsheetId, sheetName) {
    var ss = _getSpreadsheet(spreadsheetId);
    
    // 1. Setup CVs Sheet
    var cvSheet = ss.getSheetByName('CVs');
    if (!cvSheet) cvSheet = ss.insertSheet('CVs');
    _addHeaders(cvSheet);
    
    // 2. Setup History Sheet (Premium Tracker)
    var historySheet = ss.getSheetByName('History');
    if (!historySheet) historySheet = ss.insertSheet('History');
    _formatHistorySheet(historySheet);
    
    // 3. Setup Users Sheet (For Auth & Roles)
    var usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) usersSheet = ss.insertSheet('Users');
    _formatUsersSheet(usersSheet);

    // 4. Setup Payments Sheet (Logging)
    var paySheet = ss.getSheetByName('Payments');
    if (!paySheet) paySheet = ss.insertSheet('Payments');
    _formatPaymentsSheet(paySheet);

    if (sheetName === 'Users') return usersSheet;
    if (sheetName === 'Payments') return paySheet;
    return (sheetName === 'History') ? historySheet : cvSheet;
  }

  /**
   * insertHistory — Masukkan log history baru
   */
  function insertHistory(spreadsheetId, record) {
    var sheet = _getSheet(spreadsheetId, 'History');
    
    // Cari baris terakhir khusus berdasarkan Kolom A agar tidak terpengaruh widget Dashboard di kolom kanan
    var aValues = sheet.getRange("A:A").getValues();
    var lastContentRow = 2; // Default jika kosong, data berawal di baris 3 (karena header di baris 1 & 2)
    for (var i = aValues.length - 1; i >= 0; i--) {
      if (aValues[i][0] !== "") {
        lastContentRow = i + 1;
        break;
      }
    }
    
    var nextNo = lastContentRow >= 2 ? (lastContentRow - 1) : 1; 
    var formattedDate = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm");

    // Susun row data (10 kolom lengkap)
    var row = [
      nextNo,                          // Kolom A: No
      record.company || '',           // Kolom B: Perusahaan
      record.position || '',          // Kolom C: Posisi
      record.jobType || '',           // Kolom D: Jenis Pekerjaan
      record.source || '',            // Kolom E: Sumber Loker
      record.fileUrl || '',           // Kolom F: Link Dokumen
      formattedDate,                  // Kolom G: Tanggal (WIB)
      record.status || 'Terkirim',    // Kolom H: Status Terbaru
      record.email || '',             // Kolom I: Email Pelamar
      record.id || Utils.generateId()  // Kolom J: UID Unik
    ];
    
    var currentRow = lastContentRow + 1;
    sheet.getRange(currentRow, 1, 1, row.length).setValues([row]);
    
    // Apply styling to the new row
    // Apply styling to the new row
    var newRange = sheet.getRange(currentRow, 1, 1, row.length);
    newRange.setFontFamily('Inter').setFontSize(9).setVerticalAlignment('middle');
    
    // Alternate Row Colors for table area only (A-H)
    if (currentRow % 2 === 0) {
      sheet.getRange(currentRow, 1, 1, 8).setBackground('#f8fafc');
    }
    
    return true;
  }

  /**
   * getHistory — Ambil semua history untuk email tertentu
   */
  function getHistory(spreadsheetId, email) {
    var sheet = _getSheet(spreadsheetId, 'History');
    var rows = _getAllRows(sheet, 10); // Now 10 columns
    var emailLower = (email || '').toLowerCase().trim();
    
    return rows
      .filter(function(row) { 
        return emailLower === '' || (row[8] || '').toLowerCase().trim() === emailLower; 
      })
      .map(_historyRowToObject);
  }

  /**
   * updateHistoryStatus — Update status history (misal "Terkirim")
   */
  function updateHistoryStatus(spreadsheetId, id, status) {
    var sheet = _getSheet(spreadsheetId, 'History');
    var rows = _getAllRows(sheet, 10); // Now looking at 10 columns
    for (var i = 0; i < rows.length; i++) {
      // UID is column J (index 9)
      if (rows[i][9] === id) { 
        sheet.getRange(i + 3, 8).setValue(status); // Column H
        return true;
      }
    }
    return false;
  }

  /**
   * insertCV — Masukkan baris CV baru ke sheet
   * @param {string} spreadsheetId
   * @param {string} sheetName
   * @param {Object} cvRecord - { id, timestamp, name, email, data }
   */
  function insertCV(spreadsheetId, sheetName, cvRecord) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    
    var row = [
      cvRecord.id,
      cvRecord.timestamp,
      cvRecord.name,
      cvRecord.email,
      cvRecord.data
    ];
    
    // Append ke baris terakhir
    sheet.appendRow(row);
    
    // Alternate row coloring untuk readability
    var lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, 5).setBackground('#f8fafc');
    }
    
    Utils.log('insertCV: row appended at row ' + lastRow + ' for email: ' + cvRecord.email);
    return true;
  }

  /**
   * updateCV — Update baris CV berdasarkan ID
   * @param {string} spreadsheetId
   * @param {string} sheetName
   * @param {string} id - CV ID yang akan diupdate
   * @param {Object} updateData - { name, email, data, timestamp }
   */
  function updateCV(spreadsheetId, sheetName, id, updateData) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        var rowNumber = i + 2; // +2 karena index 0-based + skip header
        
        // Update kolom: timestamp(B), name(C), email(D), data(E)
        sheet.getRange(rowNumber, 2).setValue(updateData.timestamp || new Date().toISOString());
        sheet.getRange(rowNumber, 3).setValue(updateData.name || rows[i][2]);
        sheet.getRange(rowNumber, 4).setValue(updateData.email || rows[i][3]);
        sheet.getRange(rowNumber, 5).setValue(updateData.data || rows[i][4]);
        
        Utils.log('updateCV: row ' + rowNumber + ' updated for id: ' + id);
        return true;
      }
    }
    
    Utils.log('updateCV: ID ' + id + ' tidak ditemukan');
    return false;
  }

  /**
   * findCVByEmail — Cari CV berdasarkan email (case-insensitive)
   * @returns {Object|null} - CV object atau null jika tidak ditemukan
   */
  function findCVByEmail(spreadsheetId, sheetName, email) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    var emailLower = email.toLowerCase().trim();
    
    for (var i = 0; i < rows.length; i++) {
      var rowEmail = (rows[i][3] || '').toLowerCase().trim();
      if (rowEmail === emailLower) {
        return _rowToObject(rows[i]);
      }
    }
    
    return null;
  }

  /**
   * findCVById — Cari CV berdasarkan ID
   * @returns {Object|null}
   */
  function findCVById(spreadsheetId, sheetName, id) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        return _rowToObject(rows[i]);
      }
    }
    
    return null;
  }

  /**
   * getAllCVs — Ambil semua CV dari sheet
   * @returns {Array} - Array of CV objects
   */
  function getAllCVs(spreadsheetId, sheetName) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    
    return rows
      .filter(function(row) { return row[0] !== ''; }) // filter baris kosong
      .map(_rowToObject);
  }

  /**
   * deleteCVById — Hapus baris CV berdasarkan ID
   * @returns {boolean} - true jika berhasil dihapus
   */
  function deleteCVById(spreadsheetId, sheetName, id) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        var rowNumber = i + 2; // +2: index + header
        sheet.deleteRow(rowNumber);
        Utils.log('deleteCVById: row ' + rowNumber + ' deleted for id: ' + id);
        return true;
      }
    }
    
    Utils.log('deleteCVById: ID ' + id + ' tidak ditemukan');
    return false;
  }

  /**
   * fixLayout — Force refresh layout jika berantakan
   */
  function fixLayout(spreadsheetId) {
    var ss = _getSpreadsheet(spreadsheetId);
    var historySheet = ss.getSheetByName('History');
    if (historySheet) _formatHistorySheet(historySheet);
    var cvSheet = ss.getSheetByName('CVs');
    if (cvSheet) _addHeaders(cvSheet);
    return true;
  }

  // ── Expose public methods ─────────────────────────────────
  return {
    initializeSheets: initializeSheets,
    fixLayout:        fixLayout,
    insertCV:         insertCV,
    updateCV:         updateCV,
    findCVByEmail:    findCVByEmail,
    findCVById:       findCVById,
    getAllCVs:         getAllCVs,
    deleteCVById:     deleteCVById,
    insertHistory:    insertHistory,
    getHistory:       getHistory,
    updateHistoryStatus: updateHistoryStatus,
    
    // --- Authentication & Users ---
    registerUser: function(spreadsheetId, name, email, password) {
      var sheet = _getSheet(spreadsheetId, 'Users');
      _formatUsersSheet(sheet); 
      
      var headerMap = _getHeaderMap(sheet);
      var emailIdx = headerMap['EMAIL'] !== undefined ? headerMap['EMAIL'] : 2;
      
      var rows = _getAllRows(sheet, sheet.getLastColumn());
      var emailLower = email.toLowerCase().trim();
      
      for (var i = 0; i < rows.length; i++) {
          if ((rows[i][emailIdx] || '').toLowerCase().trim() === emailLower) {
              return { success: false, message: 'Email sudah terdaftar!' };
          }
      }
      
      var uid = Utils.generateId ? Utils.generateId() : Math.random().toString(36).substring(2, 11);
      // Create object to ensure correct mapping
      var userData = {
        'ID': uid,
        'NAME': name,
        'EMAIL': emailLower,
        'PASSWORD': password,
        'ROLE': 'Basic',
        'PAYMENT_STATUS': 'None',
        'PAYMENT_PROOF': 'None',
        'TIMESTAMP': new Date().toISOString()
      };

      var headers = ['ID', 'NAME', 'EMAIL', 'PASSWORD', 'ROLE', 'PAYMENT_STATUS', 'PAYMENT_PROOF', 'TIMESTAMP'];
      var newRow = headers.map(function(h) { return userData[h]; });
      
      sheet.appendRow(newRow);
      return { success: true, message: 'Registrasi berhasil', data: { id: uid, name: name, email: emailLower, role: 'Basic', paymentStatus: 'None' } };
    },
    
    authenticateUser: function(spreadsheetId, email, password) {
      var sheet = _getSheet(spreadsheetId, 'Users');
      _formatUsersSheet(sheet); 
      
      var headerMap = _getHeaderMap(sheet);
      var emailIdx = headerMap['EMAIL'] !== undefined ? headerMap['EMAIL'] : 2;
      var passIdx = headerMap['PASSWORD'] !== undefined ? headerMap['PASSWORD'] : 3;
      
      var rows = _getAllRows(sheet, sheet.getLastColumn());
      var emailLower = (email || '').toLowerCase().trim();
      
      for (var i = 0; i < rows.length; i++) {
          var rEmail = (rows[i][emailIdx] || '').toLowerCase().trim();
          var rPass = rows[i][passIdx] || '';
          
          if (rEmail === emailLower && rPass === password) {
              return { 
                  success: true, 
                  message: 'Login berhasil',
                  data: {
                      id:            rows[i][headerMap['ID'] || 0],
                      name:          rows[i][headerMap['NAME'] || 1],
                      email:         rows[i][headerMap['EMAIL'] || 2],
                      role:          rows[i][headerMap['ROLE'] || 4],
                      paymentStatus: rows[i][headerMap['PAYMENT_STATUS'] || 5],
                      paymentProof:  rows[i][headerMap['PAYMENT_PROOF'] || 6]
                  }
              };
          }
      }
      return { success: false, message: 'Email atau password salah' };
    },
    
    requestPremium: function(spreadsheetId, email, paymentProof) {
      var sheet = _getSheet(spreadsheetId, 'Users');
      _formatUsersSheet(sheet); 
      
      var headerMap = _getHeaderMap(sheet);
      var emailIdx = headerMap['EMAIL'] !== undefined ? headerMap['EMAIL'] : 2;
      var statusIdx = (headerMap['PAYMENT_STATUS'] || 5) + 1; // +1 for getRange (1-based)
      var proofIdx = (headerMap['PAYMENT_PROOF'] || 6) + 1; 

      var rows = _getAllRows(sheet, sheet.getLastColumn());
      var emailLower = email.toLowerCase().trim();
      
      var finalProofValue = paymentProof || 'None';
      
      if (typeof finalProofValue === 'string' && finalProofValue.startsWith('data:image/')) {
        try {
          var parts = finalProofValue.split(';base64,');
          var contentType = parts[0].replace('data:', '');
          var blobData = parts[1];
          var fileName = 'Proof_' + emailLower.split('@')[0] + '_' + new Date().getTime() + '.png';
          
          var result = DriveDB.saveFile(fileName, contentType, blobData, 'Payment_Proofs');
          finalProofValue = result.url;
        } catch (err) {
          Utils.log('Error saving proof to Drive: ' + err.message);
        }
      }
      
      for (var i = 0; i < rows.length; i++) {
        if ((rows[i][emailIdx] || '').toLowerCase().trim() === emailLower) {
          var userName = rows[i][headerMap['NAME'] || 1];
          sheet.getRange(i + 2, statusIdx).setValue('Pending'); 
          sheet.getRange(i + 2, proofIdx).setValue(finalProofValue); 
          
          // --- LOG TO PAYMENTS SHEET ---
          var paySheet = _getSheet(spreadsheetId, 'Payments');
          _formatPaymentsSheet(paySheet);
          paySheet.appendRow([
            Utils.generateId ? Utils.generateId() : 'PAY_' + new Date().getTime(),
            new Date().toISOString(),
            emailLower,
            userName,
            finalProofValue,
            'Pending'
          ]);
          
          return { success: true, message: 'Permintaan upgrade berhasil dikirim. Menunggu verifikasi Admin.' };
        }
      }
      return { success: false, message: 'User tidak ditemukan' };
    },
    
    getAllUsers: function(spreadsheetId) {
      var sheet = _getSheet(spreadsheetId, 'Users');
      var headerMap = _getHeaderMap(sheet);
      var rows = _getAllRows(sheet, sheet.getLastColumn());
      
      return rows.map(function(row) {
          return {
              id:            row[headerMap['ID'] || 0],
              name:          row[headerMap['NAME'] || 1],
              email:         row[headerMap['EMAIL'] || 2],
              role:          row[headerMap['ROLE'] || 4],
              paymentStatus: row[headerMap['PAYMENT_STATUS'] || 5],
              paymentProof:  row[headerMap['PAYMENT_PROOF'] || 6],
              timestamp:     row[headerMap['TIMESTAMP'] || 7]
          };
      });
    },
    
    approvePremium: function(spreadsheetId, email) {
      var sheet = _getSheet(spreadsheetId, 'Users');
      var headerMap = _getHeaderMap(sheet);
      var rows = _getAllRows(sheet, sheet.getLastColumn());
      var emailLower = email.toLowerCase().trim();
      
      var emailIdx = headerMap['EMAIL'] !== undefined ? headerMap['EMAIL'] : 2;
      var roleCol = (headerMap['ROLE'] || 4) + 1;
      var statusCol = (headerMap['PAYMENT_STATUS'] || 5) + 1;

      for (var i = 0; i < rows.length; i++) {
          if ((rows[i][emailIdx] || '').toLowerCase().trim() === emailLower) {
              sheet.getRange(i + 2, roleCol).setValue('Premium'); 
              sheet.getRange(i + 2, statusCol).setValue('Approved'); 
              
              // --- SYNC WITH PAYMENTS SHEET ---
              try {
                var paySheet = _getSheet(spreadsheetId, 'Payments');
                var pHMap = _getHeaderMap(paySheet);
                var pEmailIdx = pHMap['EMAIL'] !== undefined ? pHMap['EMAIL'] : 2;
                var pStatusCol = (pHMap['STATUS'] || 5) + 1;
                var payRows = _getAllRows(paySheet, paySheet.getLastColumn());
                
                for (var j = payRows.length - 1; j >= 0; j--) {
                  if ((payRows[j][pEmailIdx] || '').toLowerCase().trim() === emailLower && payRows[j][pHMap['STATUS'] || 5] === 'Pending') {
                    paySheet.getRange(j + 2, pStatusCol).setValue('Approved');
                    break;
                  }
                }
              } catch (e) { Utils.log('Sync Payments error: ' + e.message); }

              return { success: true, message: 'User berhasil diupgrade ke Premium!' };
          }
      }
      return { success: false, message: 'User tidak ditemukan' };
    },

    rejectPremium: function(spreadsheetId, email, reason) {
      var sheet = _getSheet(spreadsheetId, 'Users');
      var headerMap = _getHeaderMap(sheet);
      var rows = _getAllRows(sheet, sheet.getLastColumn());
      var emailLower = email.toLowerCase().trim();

      var emailIdx = headerMap['EMAIL'] !== undefined ? headerMap['EMAIL'] : 2;
      var statusCol = (headerMap['PAYMENT_STATUS'] || 5) + 1;
      
      for (var i = 0; i < rows.length; i++) {
          if ((rows[i][emailIdx] || '').toLowerCase().trim() === emailLower) {
              sheet.getRange(i + 2, statusCol).setValue('Rejected: ' + (reason || 'Bukti tidak valid')); 
              
              // --- SYNC WITH PAYMENTS SHEET ---
              try {
                var paySheet = _getSheet(spreadsheetId, 'Payments');
                var pHMap = _getHeaderMap(paySheet);
                var pEmailIdx = pHMap['EMAIL'] !== undefined ? pHMap['EMAIL'] : 2;
                var pStatusCol = (pHMap['STATUS'] || 5) + 1;
                var payRows = _getAllRows(paySheet, paySheet.getLastColumn());

                for (var j = payRows.length - 1; j >= 0; j--) {
                  if ((payRows[j][pEmailIdx] || '').toLowerCase().trim() === emailLower && payRows[j][pHMap['STATUS'] || 5] === 'Pending') {
                    paySheet.getRange(j + 2, pStatusCol).setValue('Rejected');
                    break;
                  }
                }
              } catch (e) { Utils.log('Sync Payments error: ' + e.message); }

              return { success: true, message: 'Permintaan upgrade ditolak.' };
          }
      }
      return { success: false, message: 'User tidak ditemukan' };
    },
    
    getUserProfile: function(spreadsheetId, email) {
      var sheet = _getSheet(spreadsheetId, 'Users');
      var headerMap = _getHeaderMap(sheet);
      var rows = _getAllRows(sheet, sheet.getLastColumn());
      var emailLower = email.toLowerCase().trim();
      
      var emailIdx = headerMap['EMAIL'] !== undefined ? headerMap['EMAIL'] : 2;
      
      for (var i = 0; i < rows.length; i++) {
          if ((rows[i][emailIdx] || '').toLowerCase().trim() === emailLower) {
              return {
                  success: true,
                  data: {
                      id:            rows[i][headerMap['ID'] || 0],
                      name:          rows[i][headerMap['NAME'] || 1],
                      email:         rows[i][headerMap['EMAIL'] || 2],
                      role:          rows[i][headerMap['ROLE'] || 4],
                      paymentStatus: rows[i][headerMap['PAYMENT_STATUS'] || 5],
                      paymentProof:  rows[i][headerMap['PAYMENT_PROOF'] || 6],
                      timestamp:     rows[i][headerMap['TIMESTAMP'] || 7]
                  }
              };
          }
      }
      return { success: false, message: 'User tidak ditemukan' };
    },

    fixUserColumns: function(spreadsheetId) {
      try {
        var ss = _getSpreadsheet(spreadsheetId);
        var sheet = ss.getSheetByName('Users');
        if (!sheet) return { success: false, message: 'Sheet Users tidak ditemukan' };
        
        var oldHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
        var hMap = {};
        oldHeaders.forEach(function(h, i) { if(h) hMap[String(h).toUpperCase().trim()] = i; });
        
        var data = _getAllRows(sheet, sheet.getLastColumn());
        var newHeaders = ['ID', 'NAME', 'EMAIL', 'PASSWORD', 'ROLE', 'PAYMENT_STATUS', 'PAYMENT_PROOF', 'TIMESTAMP'];
        
        // --- SECONDARY SOURCE: Payments Sheet ---
        var paymentHistory = {};
        try {
          var pSheet = ss.getSheetByName('Payments');
          if (pSheet) {
            var pData = _getAllRows(pSheet, pSheet.getLastColumn());
            var phMap = _getHeaderMap(pSheet);
            var pEmailIdx = phMap['EMAIL'] !== undefined ? phMap['EMAIL'] : 1;
            var pProofIdx = phMap['PROOF'] !== undefined ? phMap['PROOF'] : 6;
            
            pData.forEach(function(pRow) {
               var pEmail = (pRow[pEmailIdx] || '').toLowerCase().trim();
               var pProof = pRow[pProofIdx];
               if (pEmail && pProof && pProof !== 'None') {
                 paymentHistory[pEmail] = pProof;
               }
            });
          }
        } catch (e) { Utils.log('History recovery skip: ' + e.message); }
        
        var transformedData = data.map(function(row) {
          var emailRaw = row[hMap['EMAIL']] || '';
          var emailKey = emailRaw.toLowerCase().trim();
          
          var obj = {
            'ID': row[hMap['ID']] || row[hMap['ID CV']] || '',
            'NAME': row[hMap['NAME']] || row[hMap['NAMA USER']] || '',
            'EMAIL': emailRaw,
            'PASSWORD': row[hMap['PASSWORD']] || 'password123',
            'ROLE': row[hMap['ROLE']] || 'Basic',
            'PAYMENT_STATUS': row[hMap['PAYMENT_STATUS']] || 'None',
            'PAYMENT_PROOF': row[hMap['PAYMENT_PROOF']] || 'None',
            'TIMESTAMP': row[hMap['TIMESTAMP']] || row[hMap['WAKTU TERAKHIR']] || new Date().toISOString()
          };
          
          // --- CASE A: PAYMENT_PROOF contains a timestamp (Old Data Error) ---
          if (obj.PAYMENT_PROOF && String(obj.PAYMENT_PROOF).includes('T') && String(obj.PAYMENT_PROOF).includes('Z')) {
            var actualTimestamp = obj.PAYMENT_PROOF;
            obj.TIMESTAMP = actualTimestamp;
            obj.PAYMENT_PROOF = paymentHistory[emailKey] || 'None'; // Try to recover from history
          }
          
          // --- CASE B: PAYMENT_STATUS contains a timestamp (Extreme Misalignment) ---
          if (obj.PAYMENT_STATUS && String(obj.PAYMENT_STATUS).includes('T') && String(obj.PAYMENT_STATUS).includes('Z')) {
            obj.TIMESTAMP = obj.PAYMENT_STATUS;
            obj.PAYMENT_PROOF = paymentHistory[emailKey] || 'None';
            obj.PAYMENT_STATUS = (obj.PAYMENT_PROOF !== 'None') ? 'Pending' : 'None';
          }
          
          // Recovery from history if still missing in Users
          if ((!obj.PAYMENT_PROOF || obj.PAYMENT_PROOF === 'None') && paymentHistory[emailKey]) {
            obj.PAYMENT_PROOF = paymentHistory[emailKey];
            if (obj.PAYMENT_STATUS === 'None') obj.PAYMENT_STATUS = 'Pending';
          }
          
          return newHeaders.map(function(h) { return obj[h]; });
        });
        
        // Reconstruct Sheet
        sheet.clear();
        _formatUsersSheet(sheet);
        if (transformedData.length > 0) {
          sheet.getRange(2, 1, transformedData.length, newHeaders.length).setValues(transformedData);
        }
        
        return { success: true, message: 'Database direkonstruksi! ' + transformedData.length + ' user diperbaiki & sinkron dengan history.' };
      } catch (err) {
        return { success: false, message: 'Gagal rekonstruksi: ' + err.message };
      }
    }
  };


})();
