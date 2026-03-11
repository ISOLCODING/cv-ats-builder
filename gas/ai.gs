/**
 * gas/ai.gs
 * ============================================================
 * Service untuk komunikasi dengan AI (Groq Primary) via GAS.
 * ============================================================
 */

var GroqService = (function () {
  var MODEL = 'llama-3.3-70b-versatile'; // Model powerfull dari Groq

  function getApiKey() {
    return PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
  }

  function callGroq(prompt, isJson) {
    var apiKey = getApiKey();
    if (!apiKey) throw new Error('GROQ_API_KEY tidak ditemukan di Script Properties.');

    var url = 'https://api.groq.com/openai/v1/chat/completions';
    var payload = {
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    };

    if (isJson) {
      payload.response_format = { type: 'json_object' };
    }

    var options = {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var body = response.getContentText();
    
    if (response.getResponseCode() !== 200) {
      throw new Error('Groq Error: ' + body);
    }

    var data = JSON.parse(body);
    return data.choices[0].message.content;
  }

  return { callGroq: callGroq };
})();

// ── Global Wrapper ──────────────────────────────────────────

function gsCallAI(prompt, isJson) {
  // Hanya gunakan Groq (Gemini dihapus sesuai permintaan)
  try {
    var groqKey = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
    if (!groqKey) {
      return Utils.errorResponse('GROQ_API_KEY tidak ditemukan. Silakan tambahkan di Settings GAS.');
    }
    
    Utils.log('Using Groq AI (' + 'llama-3.3-70b-versatile' + ')...');
    var result = GroqService.callGroq(prompt, isJson);
    return Utils.successResponse('Groq responded successfully', result);
  } catch (e) {
    Utils.logError(e, 'gsCallAI');
    return Utils.errorResponse(e.message);
  }
}

function gsGetActiveModel() {
  var groqKey = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
  return {
    provider: 'Groq',
    model: 'llama-3.3-70b-versatile',
    active: !!groqKey,
    timestamp: new Date().toISOString()
  };
}