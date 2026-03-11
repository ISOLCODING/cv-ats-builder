/**
 * gas/ai.gs
 * ============================================================
 * Service untuk komunikasi dengan Gemini AI API via Google Apps Script.
 *
 * ⚠️  PENTING: Setiap kali mengubah file ini, wajib buat versi baru
 *     di Deploy → Manage Deployments → Edit → New Version → Deploy
 * ============================================================
 */

var AIService = (function () {

  var MODEL = 'gemini-2.5-flash'; // ← Model aktif

  // ── Private: Ambil API Key dari Script Properties ──────────
  function getApiKey() {
    var key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!key) {
      Utils.log('⚠️ GEMINI_API_KEY tidak ditemukan di Script Properties.');
      throw new Error('Konfigurasi API AI belum lengkap. Hubungi admin.');
    }
    return key;
  }

  // ── Private: Validasi prompt ───────────────────────────────
  function validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Prompt tidak boleh kosong.');
    }
  }

  // ── Public: Panggil Gemini API ─────────────────────────────
  function callGemini(prompt, isJson) {
    var apiKey = getApiKey();
    validatePrompt(prompt);

    var url =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      MODEL + ':generateContent?key=' + apiKey;

    var payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    };

    if (isJson) {
      payload.generationConfig.response_mime_type = 'application/json';
    }

    var options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    try {
      var response     = UrlFetchApp.fetch(url, options);
      var responseCode = response.getResponseCode();
      var responseBody = response.getContentText();

      if (responseCode !== 200) {
        var errObj = Utils.safeJsonParse(responseBody);
        var errMsg = (errObj && errObj.error && errObj.error.message)
          ? errObj.error.message
          : 'Gemini API Error (HTTP ' + responseCode + ')';
        Utils.log('[AIService] Error response: ' + responseBody);
        throw new Error(errMsg);
      }

      var data = JSON.parse(responseBody);
      var text = data.candidates[0].content.parts[0].text;

      if (!text) throw new Error('AI tidak memberikan respon yang valid.');

      return text;

    } catch (e) {
      Utils.logError(e, 'AIService.callGemini [model: ' + MODEL + ']');
      throw e;
    }
  }

  return { callGemini: callGemini };

})();

// ── Global Wrapper (dipanggil dari frontend) ──────────────────

function gsCallGemini(prompt, isJson) {
  try {
    var result = AIService.callGemini(prompt, isJson);
    return Utils.successResponse('AI responded successfully', result);
  } catch (e) {
    return Utils.errorResponse(e.message);
  }
}