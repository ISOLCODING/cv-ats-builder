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
    
    // 3. CLEANUP: Delete Users and Payments sheets if they exist
    var usersSheet = ss.getSheetByName('Users');
    if (usersSheet) ss.deleteSheet(usersSheet);
    
    var paySheet = ss.getSheetByName('Payments');

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

  return {
    deleteCVById:     deleteCVById,
    insertHistory:    insertHistory,
    getHistory:       getHistory,
    updateHistoryStatus: updateHistoryStatus
  };

})();
