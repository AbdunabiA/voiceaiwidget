export function getWidgetStyles(config) {
  const color = config.primary_color || '#6C5CE7';
  const position = config.position || 'bottom-right';
  const posRight = position === 'bottom-right' ? '24px' : 'auto';
  const posLeft = position === 'bottom-left' ? '24px' : 'auto';

  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
      font-size: 14px;
      color: #333;
    }

    #voiceai-trigger {
      position: fixed;
      bottom: 24px;
      right: ${posRight};
      left: ${posLeft};
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${color};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    #voiceai-trigger:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(0,0,0,0.3);
    }

    #voiceai-trigger svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .pulse-ring {
      position: absolute;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid ${color};
      animation: pulse 2s ease-out infinite;
      pointer-events: none;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    #voiceai-panel {
      position: fixed;
      bottom: 96px;
      right: ${posRight};
      left: ${posLeft};
      width: 380px;
      height: min(480px, 70vh);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 999998;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    #voiceai-panel.hidden {
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
    }

    #voiceai-panel.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: ${color};
      color: white;
    }

    .panel-header .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .panel-header .title {
      flex: 1;
      font-weight: 600;
      font-size: 15px;
    }

    .lang-toggle {
      display: flex;
      gap: 4px;
    }

    .lang-toggle button {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .lang-toggle button:hover,
    .lang-toggle button.active {
      background: rgba(255,255,255,0.4);
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 22px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .message {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.5;
      word-wrap: break-word;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message.user {
      align-self: flex-end;
      background: ${color};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message.assistant {
      align-self: flex-start;
      background: #f0f0f0;
      color: #333;
      border-bottom-left-radius: 4px;
    }

    .voice-visualizer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 6px 16px;
    }

    .voice-visualizer canvas {
      display: none;
    }

    .status-text {
      font-size: 11px;
      color: #aaa;
    }

    .mic-button {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 6px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: ${color}20;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1.5px solid ${color}40;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .mic-button:hover {
      transform: scale(1.05);
      background: ${color}35;
    }

    .mic-button svg {
      width: 22px;
      height: 22px;
      fill: ${color};
    }

    .mic-button.listening {
      background: rgba(231,76,60,0.15);
      border-color: rgba(231,76,60,0.4);
      animation: mic-pulse 1s ease-in-out infinite;
    }

    .mic-button.listening svg {
      fill: #e74c3c;
    }

    @keyframes mic-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(231,76,60,0.3); }
      50% { box-shadow: 0 0 0 12px rgba(231,76,60,0); }
    }

    .mic-button.processing {
      background: rgba(243,156,18,0.15);
      border-color: rgba(243,156,18,0.4);
    }

    .mic-button.processing svg {
      fill: #f39c12;
    }

    .mic-button.speaking {
      background: rgba(39,174,96,0.15);
      border-color: rgba(39,174,96,0.4);
    }

    .mic-button.speaking svg {
      fill: #27ae60;
    }

    .text-input-row {
      display: flex;
      padding: 10px 12px;
      gap: 8px;
      border-top: 1px solid #eee;
    }

    .text-input-row input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 10px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }

    .text-input-row input:focus {
      border-color: ${color};
    }

    .text-input-row button {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: ${color};
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    .text-input-row button:hover { opacity: 0.85; }

    .spinner {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 2px solid rgba(243,156,18,0.2);
      border-top-color: #f39c12;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .equalizer {
      display: flex;
      align-items: flex-end;
      gap: 3px;
      height: 20px;
    }

    .equalizer span {
      width: 3px;
      background: #27ae60;
      border-radius: 2px;
      animation: eq 0.6s ease-in-out infinite alternate;
    }

    .equalizer span:nth-child(1) { animation-delay: 0s; height: 8px; }
    .equalizer span:nth-child(2) { animation-delay: 0.1s; height: 14px; }
    .equalizer span:nth-child(3) { animation-delay: 0.2s; height: 10px; }
    .equalizer span:nth-child(4) { animation-delay: 0.3s; height: 18px; }
    .equalizer span:nth-child(5) { animation-delay: 0.15s; height: 12px; }

    @keyframes eq {
      0% { height: 4px; }
      100% { height: 20px; }
    }

    @media (max-width: 768px) {
      #voiceai-panel {
        width: calc(100vw - 24px);
        height: min(400px, 55vh);
        right: 12px;
        left: 12px;
        bottom: 88px;
      }
    }
  `;
}
