/**
 * gas/utils.gs
 * ============================================================
 * Helper functions untuk CV ATS GAS backend.
 * ============================================================
 */

var Utils = (function() {

  // ── Logging ───────────────────────────────────────────────
  /**
   * log — Wrapper Logger.log dengan prefix timestamp
   */
  function log(message) {
    Logger.log('[CV ATS ' + new Date().toISOString() + '] ' + message);
  }

  /**
   * logError — Log error dengan stack trace
   */
  function logError(error, context) {
    var msg = '[ERROR]';
    if (context) msg += ' [' + context + ']';
    msg += ' ' + error.message;
    if (error.stack) msg += '\n' + error.stack;
    Logger.log(msg);
  }

  // ── ID Generator ─────────────────────────────────────────
  /**
   * generateId — Buat unique ID (UUID v4 sederhana)
   * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   */
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ── Response Helpers ─────────────────────────────────────
  /**
   * successResponse — Buat response object sukses
   */
  function successResponse(message, data) {
    return {
      success: true,
      message: message || 'Berhasil',
      data: data || null
    };
  }

  /**
   * errorResponse — Buat response object error
   */
  function errorResponse(message, data) {
    return {
      success: false,
      message: message || 'Terjadi kesalahan',
      data: data || null
    };
  }

  // ── Validation ───────────────────────────────────────────
  /**
   * isValidEmail — Validasi format email
   */
  function isValidEmail(email) {
    if (!email) return false;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  /**
   * sanitizeString — Bersihkan string dari karakter berbahaya
   */
  function sanitizeString(str) {
    if (!str) return '';
    return String(str)
      .trim()
      .replace(/[<>]/g, ''); // basic XSS prevention
  }

  // ── Date Helpers ─────────────────────────────────────────
  /**
   * formatDate — Format Date ke string lokal Indonesia
   */
  function formatDate(date) {
    if (!date) return '';
    var d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
  }

  /**
   * getTimestamp — Dapatkan timestamp ISO 8601 sekarang (WIB)
   */
  function getTimestamp() {
    return new Date().toISOString();
  }

  // ── JSON Helpers ─────────────────────────────────────────
  /**
   * safeJsonParse — Parse JSON tanpa throw error
   * @returns {Object|null}
   */
  function safeJsonParse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      log('safeJsonParse error: ' + e.message);
      return null;
    }
  }

  /**
   * safeJsonStringify — Stringify object ke JSON
   * @returns {string}
   */
  function safeJsonStringify(obj) {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      log('safeJsonStringify error: ' + e.message);
      return '{}';
    }
  }

  // ── Pagination ───────────────────────────────────────────
  /**
   * paginate — Slice array untuk pagination
   */
  function paginate(array, page, pageSize) {
    var p = Math.max(1, page || 1);
    var ps = Math.max(1, pageSize || 10);
    var start = (p - 1) * ps;
    var end = start + ps;
    
    return {
      data: array.slice(start, end),
      total: array.length,
      page: p,
      pageSize: ps,
      totalPages: Math.ceil(array.length / ps)
    };
  }

  // ── Expose ───────────────────────────────────────────────
  return {
    log:               log,
    logError:          logError,
    generateId:        generateId,
    successResponse:   successResponse,
    errorResponse:     errorResponse,
    isValidEmail:      isValidEmail,
    sanitizeString:    sanitizeString,
    formatDate:        formatDate,
    getTimestamp:      getTimestamp,
    safeJsonParse:     safeJsonParse,
    safeJsonStringify: safeJsonStringify,
    paginate:          paginate
  };

})();
