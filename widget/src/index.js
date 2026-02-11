import { WidgetCore } from './widget-core.js';
import { loadWidgetConfig } from './api/config-loader.js';

(function () {
  'use strict';

  const script =
    document.currentScript || document.querySelector('script[data-key]');
  const apiKey = script?.getAttribute('data-key');
  const apiBase = script?.getAttribute('data-api') ||
    (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://api.voiceai.uz');

  if (!apiKey) {
    console.error('[VoiceAI] Missing data-key attribute on script tag');
    return;
  }

  loadWidgetConfig(apiBase, apiKey)
    .then((config) => {
      const widget = new WidgetCore(apiKey, config, apiBase);
      widget.init();
    })
    .catch((err) => {
      console.error('[VoiceAI] Failed to initialize widget:', err);
    });
})();
