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

  // ── Helper: tambah header row ────────────────────────────
  function _addHeaders(sheet) {
    var headers = ['id', 'timestamp', 'name', 'email', 'data'];
    sheet.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold')
      .setBackground('#1e3a8a')
      .setFontColor('#ffffff');
    
    // Freeze baris header
    sheet.setFrozenRows(1);
    
    // Set lebar kolom
    sheet.setColumnWidth(1, 200);  // id
    sheet.setColumnWidth(2, 180);  // timestamp
    sheet.setColumnWidth(3, 200);  // name
    sheet.setColumnWidth(4, 200);  // email
    sheet.setColumnWidth(5, 400);  // data
  }

  // ── Helper: row array → object ───────────────────────────
  function _rowToObject(row) {
    return {
      id:        row[0] || '',
      timestamp: row[1] || '',
      name:      row[2] || '',
      email:     row[3] || '',
      data:      row[4] || ''
    };
  }

  // ── Helper: ambil semua data (tanpa header) ───────────────
  function _getAllRows(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return []; // hanya header atau kosong
    
    var range = sheet.getRange(2, 1, lastRow - 1, 5);
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
      Logger.log('Sheet "' + sheetName + '" sudah ada, skip inisialisasi.');
    }
    
    return sheet;
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
    deleteCVById:     deleteCVById
  };

})();
