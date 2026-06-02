/**
 * gas/sheets.gs
 * ============================================================
 * Google Sheets CRUD operations untuk CV ATS Builder.
 *
 * Sheet "CVs"  : id | timestamp | name | email | data (JSON)
 * Sheet "History": No | Company | Position | JobType | Source | FileUrl | Date | Status | Email | UID
 * ============================================================
 */

var SheetsDB = (function() {

  // ── Helpers Private ─────────────────────────────────────

  function _getSpreadsheet(spreadsheetId) {
    if (!spreadsheetId || spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
      var activeSheet = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSheet) return activeSheet;
      throw new Error('SPREADSHEET_ID belum dikonfigurasi di Code.gs.');
    }
    return SpreadsheetApp.openById(spreadsheetId);
  }

  function _getSheet(spreadsheetId, sheetName) {
    var ss = _getSpreadsheet(spreadsheetId);
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (sheetName === 'History') {
        _formatHistorySheet(sheet);
      } else {
        _addHeaders(sheet);
      }
    }
    return sheet;
  }

  function _addHeaders(sheet) {
    if (sheet.getName() === 'History') return;
    var headers = ['ID CV', 'WAKTU TERAKHIR', 'NAMA USER', 'EMAIL', 'DATA LENGKAP (JSON)'];
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(10)
      .setFontFamily('Inter')
      .setBackground('#1e293b')
      .setFontColor('#ffffff')
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('center');
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);
    var widths = [120, 160, 200, 220, 400];
    widths.forEach(function(w, i) { sheet.setColumnWidth(i + 1, w); });
  }

  function _formatHistorySheet(sheet) {
    sheet.clear();
    sheet.getRange(1, 1, 1000, 20).clearFormat().clearDataValidations();

    // Baris 1: Title
    sheet.getRange("A1:H1").merge()
      .setValue("RECRUITMENT PROGRESS TRACKER 2026")
      .setBackground("#ca8a04")
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle")
      .setFontSize(14)
      .setFontFamily("Inter");

    // Baris 2: Header kolom
    var headers = ['No', 'Company', 'Position/Program', 'Job Type', 'Source (Reff)', 'Link Document', 'Apply Date', 'Progress (Status)', 'Applicant Email', 'UID'];
    sheet.getRange(2, 1, 1, headers.length)
      .setValues([headers])
      .setFontWeight('bold')
      .setFontSize(10)
      .setFontFamily('Inter')
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('center');

    var widths = [40, 200, 220, 100, 130, 250, 120, 140, 180, 120];
    widths.forEach(function(w, i) { sheet.setColumnWidth(i + 1, w); });
    sheet.setRowHeight(1, 45);
    sheet.setRowHeight(2, 40);
    sheet.setFrozenRows(2);

    _setupDashboardWidgets(sheet);
    _applyDataValidations(sheet);
    _applyStatusFormatting(sheet);
  }

  function _setupDashboardWidgets(sheet) {
    var startCol = 11; // K (setelah kolom J = UID)

    var r1 = sheet.getRange(2, startCol, 1, 5);
    r1.merge().setValue("SUMMARY PROGRESS")
      .setBackground("#0f172a").setFontColor("#ffffff")
      .setFontWeight("bold").setHorizontalAlignment("center").setFontSize(9);

    var sHeaders = ["On Process", "Declined", "Waiting", "Offering", "Total Apply"];
    sheet.getRange(3, startCol, 1, 5).setValues([sHeaders])
      .setBackground("#f8fafc").setFontWeight("bold")
      .setHorizontalAlignment("center").setFontSize(8)
      .setBorder(true, true, true, true, true, true, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);

    var sFormulas = [
      '=COUNTIF(H3:H1000,"Interview")',
      '=COUNTIF(H3:H1000,"Ditolak")',
      '=COUNTIF(H3:H1000,"Terkirim")',
      '=COUNTIF(H3:H1000,"Offering")',
      '=COUNTA(B3:B1000)'
    ];
    sheet.getRange(4, startCol, 1, 5).setFormulas([sFormulas])
      .setBackground("#ffffff").setFontWeight("bold")
      .setHorizontalAlignment("center").setFontSize(11);

    var r2 = sheet.getRange(6, startCol, 1, 5);
    r2.merge().setValue("JOB TYPE OVERALL")
      .setBackground("#334155").setFontColor("#ffffff")
      .setFontWeight("bold").setHorizontalAlignment("center").setFontSize(9);

    var jHeaders = ["Fulltime", "Intern", "Contract", "MT", "Freelance"];
    sheet.getRange(7, startCol, 1, 5).setValues([jHeaders])
      .setBackground("#f8fafc").setFontWeight("bold")
      .setHorizontalAlignment("center").setFontSize(8);

    var jFormulas = [
      '=COUNTIF(D3:D1000,"Fulltime")',
      '=COUNTIF(D3:D1000,"Intern")',
      '=COUNTIF(D3:D1000,"Contract")',
      '=COUNTIF(D3:D1000,"MT")',
      '=COUNTIF(D3:D1000,"Freelance")'
    ];
    sheet.getRange(8, startCol, 1, 5).setFormulas([jFormulas])
      .setBackground("#ffffff").setHorizontalAlignment("center").setFontWeight("bold");

    sheet.getRange(2, startCol, 7, 5)
      .setBorder(true, true, true, true, null, null, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  function _applyDataValidations(sheet) {
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['On Process', 'Terkirim', 'Interview', 'Assesment', 'Offering', 'Ditolak'], true)
      .build();
    sheet.getRange("H3:H1000").setDataValidation(statusRule);

    var typeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Fulltime', 'Intern', 'Contract', 'MT', 'Freelance'], true)
      .build();
    sheet.getRange("D3:D1000").setDataValidation(typeRule);

    var reffRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['LinkedIn', 'Jobstreet', 'Glints', 'Job Fair', 'Website', 'Referral'], true)
      .build();
    sheet.getRange("E3:E1000").setDataValidation(reffRule);
  }

  function _applyStatusFormatting(sheet) {
    sheet.clearConditionalFormatRules();
    var range = sheet.getRange("H3:H1000");
    var tableRange = sheet.getRange("A3:I1000");
    var rules = [
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Terkirim").setBackground("#ecfdf5").setFontColor("#065f46").setRanges([range]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("On Process").setBackground("#e0f2fe").setFontColor("#0369a1").setRanges([range]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Interview").setBackground("#f5f3ff").setFontColor("#5b21b6").setRanges([range]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Ditolak").setBackground("#fff1f2").setFontColor("#9f1239").setRanges([range]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied("=MOD(ROW(),2)=0").setBackground("#f8fafc").setRanges([tableRange]).build()
    ];
    sheet.setConditionalFormatRules(rules);
  }

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
    var timestamp = rawDate instanceof Date
      ? Utilities.formatDate(rawDate, "GMT+7", "dd/MM/yyyy HH:mm")
      : String(rawDate || '');
    return {
      no:        row[0] || '',
      company:   row[1] || '',
      position:  row[2] || '',
      jobType:   row[3] || '',
      source:    row[4] || '',
      fileUrl:   row[5] || '',
      timestamp: timestamp,
      status:    row[7] || '',
      email:     row[8] || '',
      id:        row[9] || ''
    };
  }

  function _getAllRows(sheet, colCount) {
    var lastRow = sheet.getLastRow();
    var sheetName = sheet.getName();
    if (sheetName === 'History') {
      if (lastRow <= 2) return [];
      return sheet.getRange(3, 1, lastRow - 2, colCount || 10).getValues();
    }
    if (lastRow <= 1) return [];
    return sheet.getRange(2, 1, lastRow - 1, colCount || 5).getValues();
  }

  // ─── PUBLIC API ───────────────────────────────────────────

  function initializeSheets(spreadsheetId) {
    var ss = _getSpreadsheet(spreadsheetId);

    // Setup CVs
    var cvSheet = ss.getSheetByName('CVs');
    if (!cvSheet) cvSheet = ss.insertSheet('CVs');
    _addHeaders(cvSheet);

    // Setup History
    var historySheet = ss.getSheetByName('History');
    if (!historySheet) historySheet = ss.insertSheet('History');
    _formatHistorySheet(historySheet);

    // Hapus sheet yang tidak diperlukan
    ['Users', 'Payments', 'Login', 'Premium'].forEach(function(name) {
      var s = ss.getSheetByName(name);
      if (s) ss.deleteSheet(s);
    });

    return true;
  }

  function insertCV(spreadsheetId, sheetName, cvRecord) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var row = [cvRecord.id, cvRecord.timestamp, cvRecord.name, cvRecord.email, cvRecord.data];
    sheet.appendRow(row);
    var lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) sheet.getRange(lastRow, 1, 1, 5).setBackground('#f8fafc');
    Utils.log('insertCV: row ' + lastRow + ' for email: ' + cvRecord.email);
    return true;
  }

  function updateCV(spreadsheetId, sheetName, id, updateData) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        var rowNumber = i + 2;
        sheet.getRange(rowNumber, 2).setValue(updateData.timestamp || new Date().toISOString());
        sheet.getRange(rowNumber, 3).setValue(updateData.name || rows[i][2]);
        sheet.getRange(rowNumber, 4).setValue(updateData.email || rows[i][3]);
        sheet.getRange(rowNumber, 5).setValue(updateData.data || rows[i][4]);
        Utils.log('updateCV: row ' + rowNumber + ' updated for id: ' + id);
        return true;
      }
    }
    return false;
  }

  function findCVByEmail(spreadsheetId, sheetName, email) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    var emailLower = email.toLowerCase().trim();
    for (var i = 0; i < rows.length; i++) {
      if ((rows[i][3] || '').toLowerCase().trim() === emailLower) {
        return _rowToObject(rows[i]);
      }
    }
    return null;
  }

  function findCVById(spreadsheetId, sheetName, id) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) return _rowToObject(rows[i]);
    }
    return null;
  }

  function getAllCVs(spreadsheetId, sheetName) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    return _getAllRows(sheet).filter(function(row) { return row[0] !== ''; }).map(_rowToObject);
  }

  function deleteCVById(spreadsheetId, sheetName, id) {
    var sheet = _getSheet(spreadsheetId, sheetName);
    var rows = _getAllRows(sheet);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        sheet.deleteRow(i + 2);
        Utils.log('deleteCVById: deleted id: ' + id);
        return true;
      }
    }
    return false;
  }

  function insertHistory(spreadsheetId, record) {
    var sheet = _getSheet(spreadsheetId, 'History');
    var aValues = sheet.getRange("A:A").getValues();
    var lastContentRow = 2;
    for (var i = aValues.length - 1; i >= 0; i--) {
      if (aValues[i][0] !== "") { lastContentRow = i + 1; break; }
    }
    var nextNo = lastContentRow >= 2 ? (lastContentRow - 1) : 1;
    var formattedDate = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm");
    var row = [
      nextNo,
      record.company  || '',
      record.position || '',
      record.jobType  || '',
      record.source   || '',
      record.fileUrl  || '',
      formattedDate,
      record.status   || 'Terkirim',
      record.email    || '',
      record.id       || Utils.generateId()
    ];
    var currentRow = lastContentRow + 1;
    sheet.getRange(currentRow, 1, 1, row.length).setValues([row]);
    sheet.getRange(currentRow, 1, 1, row.length).setFontFamily('Inter').setFontSize(9).setVerticalAlignment('middle');
    if (currentRow % 2 === 0) sheet.getRange(currentRow, 1, 1, 8).setBackground('#f8fafc');
    return true;
  }

  function getHistory(spreadsheetId, email) {
    var sheet = _getSheet(spreadsheetId, 'History');
    var rows = _getAllRows(sheet, 10);
    var emailLower = (email || '').toLowerCase().trim();
    return rows
      .filter(function(row) {
        return emailLower === '' || (row[8] || '').toLowerCase().trim() === emailLower;
      })
      .map(_historyRowToObject);
  }

  function updateHistoryStatus(spreadsheetId, id, status) {
    var sheet = _getSheet(spreadsheetId, 'History');
    var rows = _getAllRows(sheet, 10);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][9] === id) {
        sheet.getRange(i + 3, 8).setValue(status);
        return true;
      }
    }
    return false;
  }

  function fixLayout(spreadsheetId) {
    var ss = _getSpreadsheet(spreadsheetId);
    var historySheet = ss.getSheetByName('History');
    if (historySheet) _formatHistorySheet(historySheet);
    var cvSheet = ss.getSheetByName('CVs');
    if (cvSheet) _addHeaders(cvSheet);
    return true;
  }

  return {
    initializeSheets:    initializeSheets,
    insertCV:            insertCV,
    updateCV:            updateCV,
    findCVByEmail:       findCVByEmail,
    findCVById:          findCVById,
    getAllCVs:            getAllCVs,
    deleteCVById:        deleteCVById,
    insertHistory:       insertHistory,
    getHistory:          getHistory,
    updateHistoryStatus: updateHistoryStatus,
    fixLayout:           fixLayout
  };

})();
