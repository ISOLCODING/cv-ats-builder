/**
 * gas/ai.gs
 * ============================================================
 * Service untuk komunikasi dengan Gemini AI API via Google Apps Script.
 * ============================================================
 */

var AIService = (function() {

  /**
   * getApiKey — Ambil API Key dari Script Properties (Sangat Aman)
   */
  function getApiKey() {
    var props = PropertiesService.getScriptProperties();
    var key = props.getProperty('GEMINI_API_KEY');
    
    if (!key) {
      Utils.log('⚠️ Error: GEMINI_API_KEY tidak ditemukan di Script Properties.');
      return null;
    }
    return key;
  }

  /**
   * callGemini — Panggil API Gemini 2.5 Flash dari Backend
   */
  function callGemini(prompt, isJson) {
    var apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Konfigurasi API AI belum lengkap (Missing API Key). Mohon hubungi admin.');
    }

    var MODEL = 'gemini-2.5-flash';
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent?key=' + apiKey;

    var payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048
      }
    };

    if (isJson) {
      payload.generationConfig.response_mime_type = "application/json";
    }

    var options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    try {
      var response = UrlFetchApp.fetch(url, options);
      var responseCode = response.getResponseCode();
      var responseBody = response.getContentText();

      if (responseCode !== 200) {
        var errorObj = Utils.safeJsonParse(responseBody);
        var errMsg = errorObj?.error?.message || 'Gemini API Error (' + responseCode + ')';
        Utils.log('Gemini API Error: ' + responseBody);
        throw new Error(errMsg);
      }

      var data = JSON.parse(responseBody);
      var text = data.candidates[0].content.parts[0].text;

      if (!text) {
        throw new Error('AI tidak memberikan respon yang valid.');
      }

      return text;

    } catch (e) {
      Utils.logError(e, 'AIService.callGemini');
      throw e;
    }
  }

  return {
    callGemini: callGemini
  };

})();

/**
 * Global Wrapper for Frontend Access
 */
function gsCallGemini(prompt, isJson) {
  try {
    var result = AIService.callGemini(prompt, isJson);
    return Utils.successResponse('AI responded successfully', result);
  } catch (e) {
    return Utils.errorResponse(e.message);
  }
}
