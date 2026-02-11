import { ChatUI } from './ui/chat-ui.js';
import { VoiceManager } from './voice/voice-manager.js';
import { Navigator } from './navigation/navigator.js';
import { checkBrowserSupport } from './utils/browser-support.js';
import { detectPreferredLanguage } from './utils/language-detect.js';

export class WidgetCore {
  constructor(apiKey, config, apiBase) {
    this.apiKey = apiKey;
    this.config = config;
    this.apiBase = apiBase;
    this.conversationHistory = [];
    this.language = 'auto';
    this.isOpen = false;
  }

  init() {
    const support = checkBrowserSupport();
    this.chatUI = new ChatUI(this.config, {
      onToggle: () => this.toggle(),
      onMicPress: () => this.handleMicPress(),
      onMicRelease: () => this.handleMicRelease(),
      onTextSend: (text) => this.handleTextSend(text),
      onLanguageChange: (lang) => this.setLanguage(lang),
    });
    this.chatUI.render();

    this.navigator = new Navigator(this.config.primary_color || '#6C5CE7');

    // Detect browser language and set as default
    const detectedLang = detectPreferredLanguage(this.config.supported_languages);
    this.language = detectedLang;
    this.config._currentLanguage = detectedLang;
    this.chatUI.setActiveLanguage(detectedLang);

    this.voiceManager = new VoiceManager(this.apiKey, this.apiBase, this.config);
    // Share single conversation history with VoiceManager
    this.voiceManager.conversationHistory = this.conversationHistory;
    this.voiceManager.onStateChange = (state) => this.chatUI.setVoiceState(state);
    this.voiceManager.onTranscript = (text) => {
      this.chatUI.addMessage('user', text);
      this.conversationHistory.push({ role: 'user', content: text });
    };
    this.voiceManager.onResponse = (result) => {
      this.chatUI.addMessage('assistant', result.text);
      this.conversationHistory.push({ role: 'assistant', content: result.text });
      if (result.language && result.language !== 'auto') {
        this.language = result.language;
        this.config._currentLanguage = result.language;
      }
      for (const action of result.actions || []) {
        this.navigator.executeAction(action);
      }
    };
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.chatUI.showPanel();
      if (this.conversationHistory.length === 0) {
        const greeting = this.getGreeting();
        this.chatUI.addMessage('assistant', greeting);
        this.conversationHistory.push({ role: 'assistant', content: greeting });
      }
    } else {
      this.chatUI.hidePanel();
    }
  }

  getGreeting() {
    const greetings = {
      en: this.config.greeting_message || 'Hello! How can I help you?',
      ru: 'Здравствуйте! Чем могу помочь?',
      uz: 'Salom! Sizga qanday yordam bera olaman?',
    };
    return greetings[this.language] || greetings.en;
  }

  setLanguage(lang) {
    this.language = lang;
    this.config._currentLanguage = lang;
    this.chatUI.updateLanguage(lang);

    // Update greeting if it's the only message
    if (this.conversationHistory.length === 1 && this.conversationHistory[0].role === 'assistant') {
      const greeting = this.getGreeting();
      this.conversationHistory[0].content = greeting;
      this.chatUI.replaceFirstMessage(greeting);
    }
  }

  async handleMicPress() {
    if (!this.voiceManager) return;
    // Stop AI speech if playing
    this.voiceManager.stopSpeaking();
    try {
      await this.voiceManager.startListening();
    } catch (err) {
      console.error('[VoiceAI] Mic error:', err);
    }
  }

  handleMicRelease() {
    if (!this.voiceManager) return;
    this.voiceManager.stopListening();
  }

  async handleTextSend(text) {
    if (!text.trim()) return;
    this.chatUI.addMessage('user', text);
    this.chatUI.setVoiceState('processing');

    this.conversationHistory.push({ role: 'user', content: text });

    try {
      const response = await fetch(`${this.apiBase}/api/v1/widget/chat`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversation_history: this.conversationHistory.slice(-10),
          language: this.language,
          current_url: window.location.pathname,
        }),
      });

      const result = await response.json();
      this.chatUI.addMessage('assistant', result.text);
      this.conversationHistory.push({ role: 'assistant', content: result.text });

      if (result.language && result.language !== 'auto') {
        this.language = result.language;
        this.config._currentLanguage = result.language;
      }

      for (const action of result.actions || []) {
        this.navigator.executeAction(action);
      }

      // Use server audio if available, otherwise browser TTS
      const ttsLang = result.language || this.language || 'en';
      if (result.audio && result.audio.length > 0 && this.voiceManager) {
        this.chatUI.setVoiceState('speaking');
        await this.voiceManager.playAudio(result.audio, result.audio_format);
      } else if ('speechSynthesis' in window) {
        this.chatUI.setVoiceState('speaking');
        await new Promise((resolve) => {
          const u = new SpeechSynthesisUtterance(result.text);
          const langMap = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };
          u.lang = langMap[ttsLang] || 'en-US';
          u.onend = resolve;
          u.onerror = () => resolve();
          speechSynthesis.speak(u);
        });
      }
    } catch (err) {
      console.error('[VoiceAI] Chat error:', err);
      this.chatUI.addMessage('assistant', 'Sorry, something went wrong. Please try again.');
    }

    this.chatUI.setVoiceState('idle');
  }
}
