import { getWidgetStyles } from './styles.js';
import { MicButton } from './mic-button.js';

const MIC_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
const CLOSE_SVG = `&times;`;

const I18N = {
  en: {
    title: 'AI Assistant',
    placeholder: 'Or type here...',
    idle: 'Tap mic to speak',
    listening: 'Listening...',
    processing: 'Thinking...',
    speaking: 'Speaking...',
  },
  ru: {
    title: 'AI Ассистент',
    placeholder: 'Или напишите...',
    idle: 'Нажмите на микрофон',
    listening: 'Слушаю...',
    processing: 'Думаю...',
    speaking: 'Говорю...',
  },
  uz: {
    title: 'AI Yordamchi',
    placeholder: 'Yoki yozing...',
    idle: 'Mikrofon bosing',
    listening: 'Tinglayapman...',
    processing: 'O\'ylayapman...',
    speaking: 'Gapiryapman...',
  },
};

export class ChatUI {
  constructor(config, callbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.shadow = null;
    this.panel = null;
    this.messagesArea = null;
    this.micButton = null;
    this.currentLanguage = 'en';
    this.currentVoiceState = 'idle';
  }

  render() {
    const host = document.createElement('div');
    host.id = 'voiceai-widget-host';
    document.body.appendChild(host);

    this.shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = getWidgetStyles(this.config);
    this.shadow.appendChild(style);

    // Floating trigger button
    const trigger = document.createElement('button');
    trigger.id = 'voiceai-trigger';
    trigger.setAttribute('aria-label', 'Voice Assistant');
    trigger.innerHTML = `${MIC_SVG}<div class="pulse-ring"></div>`;
    trigger.addEventListener('click', () => this.callbacks.onToggle());
    this.shadow.appendChild(trigger);

    // Chat panel
    this.panel = document.createElement('div');
    this.panel.id = 'voiceai-panel';
    this.panel.className = 'hidden';

    const color = this.config.primary_color || '#6C5CE7';
    const langs = this.config.supported_languages || ['uz', 'ru', 'en'];

    const langButtons = langs
      .map((l) => `<button class="lang-btn" data-lang="${l}">${l.toUpperCase()}</button>`)
      .join('');

    this.panel.innerHTML = `
      <div class="panel-header">
        <div class="avatar">🤖</div>
        <span class="title">AI Assistant</span>
        <div class="lang-toggle">${langButtons}</div>
        <button class="close-btn">${CLOSE_SVG}</button>
      </div>
      <div class="messages-area" id="messages"></div>
      <div class="voice-visualizer">
        <canvas id="waveform" width="300" height="40"></canvas>
        <span class="status-text">Tap mic to speak</span>
      </div>
      <button class="mic-button" id="mic-btn">${MIC_SVG}</button>
      <div class="text-input-row">
        <input type="text" placeholder="Or type here..." id="text-input" />
        <button id="send-btn">➤</button>
      </div>
    `;

    this.shadow.appendChild(this.panel);

    this.messagesArea = this.panel.querySelector('#messages');
    const closeBtn = this.panel.querySelector('.close-btn');
    const micBtn = this.panel.querySelector('#mic-btn');
    const textInput = this.panel.querySelector('#text-input');
    const sendBtn = this.panel.querySelector('#send-btn');
    const langBtns = this.panel.querySelectorAll('.lang-btn');

    closeBtn.addEventListener('click', () => this.callbacks.onToggle());

    micBtn.addEventListener('click', () => this.callbacks.onMicToggle());

    const sendText = () => {
      const text = textInput.value.trim();
      if (text) {
        this.callbacks.onTextSend(text);
        textInput.value = '';
      }
    };

    sendBtn.addEventListener('click', sendText);
    textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendText();
    });

    langBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        langBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.callbacks.onLanguageChange(btn.dataset.lang);
      });
    });

    this.micButton = new MicButton(micBtn);
  }

  showPanel() {
    this.panel.classList.remove('hidden');
    this.panel.classList.add('visible');
  }

  hidePanel() {
    this.panel.classList.remove('visible');
    this.panel.classList.add('hidden');
  }

  addMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `message ${role}`;
    msg.textContent = text;
    this.messagesArea.appendChild(msg);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
  }

  setVoiceState(state) {
    this.currentVoiceState = state;
    const micBtn = this.panel.querySelector('#mic-btn');
    const statusText = this.panel.querySelector('.status-text');

    micBtn.className = 'mic-button';
    if (state !== 'idle') micBtn.classList.add(state);

    const t = I18N[this.currentLanguage] || I18N.en;
    statusText.textContent = t[state] || '';

    if (this.micButton) this.micButton.setState(state);
  }

  setActiveLanguage(lang) {
    const langBtns = this.panel?.querySelectorAll('.lang-btn');
    if (!langBtns) return;
    langBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    this.updateLanguage(lang);
  }

  updateLanguage(lang) {
    this.currentLanguage = lang;
    const t = I18N[lang] || I18N.en;

    const title = this.panel?.querySelector('.title');
    if (title) title.textContent = t.title;

    const textInput = this.panel?.querySelector('#text-input');
    if (textInput) textInput.placeholder = t.placeholder;

    const statusText = this.panel?.querySelector('.status-text');
    if (statusText) statusText.textContent = t[this.currentVoiceState] || '';
  }

  replaceFirstMessage(text) {
    const firstMsg = this.messagesArea?.querySelector('.message.assistant');
    if (firstMsg) firstMsg.textContent = text;
  }

  getCanvas() {
    return this.panel?.querySelector('#waveform');
  }
}
