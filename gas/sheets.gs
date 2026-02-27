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

  // ── Helper: tambah header row dengan Style Premium ──────────
  function _addHeaders(sheet) {
    var headers = ['ID LAMARAN', 'WAKTU INPUT', 'NAMA LENGKAP', 'EMAIL USER', 'DATA JSON'];
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    
    headerRange
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(11)
      .setFontFamily('Montserrat')
      .setBackground('#0f172a') // Slate 900
      .setFontColor('#ffffff')
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('center');
    
    sheet.setRowHeight(1, 40);
    sheet.setFrozenRows(1);
    
    // Set lebar kolom profesional
    sheet.setColumnWidth(1, 150); // id
    sheet.setColumnWidth(2, 180); // timestamp
    sheet.setColumnWidth(3, 220); // name
    sheet.setColumnWidth(4, 250); // email
    sheet.setColumnWidth(5, 300); // data
  }

  // ── Helper: Format History Sheet Premium ───────────────────
  function _formatHistorySheet(sheet) {
    var headers = ['ID', 'TANGGAL & WAKTU', 'EMAIL PELAMAR', 'PERUSAHAAN', 'POSISI', 'KATEGORI', 'STATUS', 'URL BERKAS'];
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    
    headerRange
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(10)
      .setFontFamily('Roboto')
      .setBackground('#1e293b') // Slate 800
      .setFontColor('#f8fafc');
    
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);
    
    // Column widths
    var widths = [100, 180, 220, 200, 200, 120, 120, 300];
    widths.forEach(function(w, i) {
      sheet.setColumnWidth(i + 1, w);
    });

    // Conditional Formatting for Status
    _applyStatusFormatting(sheet);
  }

  function _applyStatusFormatting(sheet) {
    var range = sheet.getRange("G2:G1000");
    
    // Clean existing rules
    sheet.clearConditionalFormatRules();
    
    var rules = [];
    
    // Rule: Terkirim (Green)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("TERKIRIM")
      .setBackground("#dcfce7")
      .setFontColor("#15803d")
      .setRanges([range])
      .build());

    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Terkirim")
      .setBackground("#dcfce7")
      .setFontColor("#15803d")
      .setRanges([range])
      .build());

    // Rule: Saved/Draft (Blue)
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("Saved")
      .setBackground("#dbeafe")
      .setFontColor("#1d4ed8")
      .setRanges([range])
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
    var ts = row[1];
    // Jika data dari Sheets adalah objek Date, paksa ke string format Indo
    var formattedTs = '';
    if (ts instanceof Date) {
      formattedTs = Utilities.formatDate(ts, "GMT+7", "dd/MM/yyyy HH:mm:ss");
    } else if (ts) {
      formattedTs = String(ts);
    }

    return {
      id:        row[0] || '',
      timestamp: formattedTs,
      email:     row[2] || '',
      company:   row[3] || '',
      position:  row[4] || '',
      type:      row[5] || '',
      status:    row[6] || '',
      fileUrl:   row[7] || ''
    };
  }

  // ── Helper: ambil semua data (tanpa header) ───────────────
  function _getAllRows(sheet, colCount) {
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return []; // hanya header atau kosong
    
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
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      _addHeaders(sheet);
      Logger.log('Sheet "' + sheetName + '" berhasil dibuat.');
    } else {
      _addHeaders(sheet); // Update styling even if exists
    }
    
    // Inisialisasi Sheet History jika belum ada
    var historySheet = ss.getSheetByName('History');
    if (!historySheet) {
      historySheet = ss.insertSheet('History');
      _formatHistorySheet(historySheet);
    } else {
      _formatHistorySheet(historySheet); // Refresh styling
    }
    
    return sheet;
  }

  /**
   * insertHistory — Masukkan log history baru
   */
  function insertHistory(spreadsheetId, record) {
    var sheet = _getSheet(spreadsheetId, 'History');
    
    // Format Waktu Indonesia (WIB) yang cantik
    var now = new Date();
    var formattedDate = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm:ss");
    
    var row = [
      record.id || Utils.generateId(),
      formattedDate,
      record.email || '',
      record.company || '',
      record.position || '',
      record.type || 'CV',
      record.status || 'Draft',
      record.fileUrl || ''
    ];
    
    sheet.appendRow(row);
    
    // Apply styling to the new row
    var lastRow = sheet.getLastRow();
    var newRange = sheet.getRange(lastRow, 1, 1, row.length);
    newRange.setFontFamily('Inter').setFontSize(9).setVerticalAlignment('middle');
    
    // Alternating color
    if (lastRow % 2 === 0) {
      newRange.setBackground('#f8fafc');
    }
    
    return true;
  }

  /**
   * getHistory — Ambil semua history untuk email tertentu
   */
  function getHistory(spreadsheetId, email) {
    var sheet = _getSheet(spreadsheetId, 'History');
    var rows = _getAllRows(sheet, 8);
    var emailLower = (email || '').toLowerCase().trim();
    
    return rows
      .filter(function(row) { 
        return emailLower === '' || (row[2] || '').toLowerCase().trim() === emailLower; 
      })
      .map(_historyRowToObject);
  }

  /**
   * updateHistoryStatus — Update status history (misal "Terkirim")
   */
  function updateHistoryStatus(spreadsheetId, id, status) {
    var sheet = _getSheet(spreadsheetId, 'History');
    var rows = _getAllRows(sheet, 8);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        sheet.getRange(i + 2, 7).setValue(status);
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

  // ── Expose public methods ─────────────────────────────────
  return {
    initializeSheets: initializeSheets,
    insertCV:         insertCV,
    updateCV:         updateCV,
    findCVByEmail:    findCVByEmail,
    findCVById:       findCVById,
    getAllCVs:         getAllCVs,
    deleteCVById:     deleteCVById,
    insertHistory:    insertHistory,
    getHistory:       getHistory,
    updateHistoryStatus: updateHistoryStatus
  };

})();
