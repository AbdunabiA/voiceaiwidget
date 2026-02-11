import { AudioPlayer } from './audio-player.js';
import { ApiClient } from '../api/client.js';

export class VoiceManager {
  constructor(apiKey, apiBase, config) {
    this.apiClient = new ApiClient(apiBase, apiKey);
    this.config = config;
    this.player = new AudioPlayer();
    this.state = 'idle';
    this.onStateChange = null;
    this.onTranscript = null;
    this.onResponse = null;
    this.conversationHistory = null; // shared reference, set by WidgetCore
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.useBrowserTTS = 'speechSynthesis' in window;
  }

  setState(state) {
    this.state = state;
    if (this.onStateChange) this.onStateChange(state);
  }

  stopSpeaking() {
    this.player.stop();
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    if (this.state === 'speaking') {
      this.setState('idle');
    }
  }

  async startListening() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error('[VoiceAI] Microphone access denied:', err);
      throw err;
    }

    this.audioChunks = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };

    this.mediaRecorder.onstop = async () => {
      this._stopMicStream();
      if (this.audioChunks.length === 0) {
        this.setState('idle');
        return;
      }
      const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
      await this._transcribeAndProcess(blob);
    };

    this.mediaRecorder.start();
    this.setState('listening');
  }

  stopListening() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  _stopMicStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }

  async _transcribeAndProcess(audioBlob) {
    this.setState('processing');

    try {
      const result = await this.apiClient.transcribe(audioBlob);
      const transcript = result.text;

      if (!transcript || !transcript.trim()) {
        this.setState('idle');
        return;
      }

      if (this.onTranscript) this.onTranscript(transcript);

      const history = this.conversationHistory || [];
      const language = result.language || 'auto';

      const chatResult = await this.apiClient.chat(
        transcript,
        history.slice(-10),
        language,
        window.location.pathname
      );

      if (chatResult.language && chatResult.language !== 'auto') {
        this.config._currentLanguage = chatResult.language;
      }

      if (this.onResponse) this.onResponse(chatResult);

      const ttsLang = chatResult.language || language || 'en';
      if (chatResult.audio && chatResult.audio.length > 0) {
        this.setState('speaking');
        await this.player.playAudio(chatResult.audio, chatResult.audio_format);
      } else if (this.useBrowserTTS) {
        this.setState('speaking');
        await this._browserSpeak(chatResult.text, ttsLang);
      }

      this.setState('idle');
      return chatResult;
    } catch (err) {
      console.error('[VoiceAI] Voice error:', err);
      this.setState('idle');
    }
  }

  _browserSpeak(text, language) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
      utterance.lang = langMap[language] || 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = resolve;
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }

  async playAudio(base64Audio, mimeType) {
    if (base64Audio && base64Audio.length > 0) {
      return this.player.playAudio(base64Audio, mimeType);
    }
  }
}
