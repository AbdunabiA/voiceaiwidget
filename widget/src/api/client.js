export class ApiClient {
  constructor(apiBase, apiKey) {
    this.apiBase = apiBase;
    this.apiKey = apiKey;
  }

  async transcribe(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const res = await fetch(`${this.apiBase}/api/v1/widget/transcribe`, {
      method: 'POST',
      headers: { 'X-API-Key': this.apiKey },
      body: formData,
    });

    if (!res.ok) throw new Error(`Transcribe failed: ${res.status}`);
    return res.json();
  }

  async chat(message, conversationHistory, language, currentUrl) {
    const res = await fetch(`${this.apiBase}/api/v1/widget/chat`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
        language,
        current_url: currentUrl,
      }),
    });

    if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
    return res.json();
  }

  async getConfig() {
    const res = await fetch(`${this.apiBase}/api/v1/widget/config`, {
      headers: { 'X-API-Key': this.apiKey },
    });

    if (!res.ok) throw new Error(`Config failed: ${res.status}`);
    return res.json();
  }
}
