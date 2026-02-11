export class MicButton {
  constructor(element) {
    this.el = element;
    this.state = 'idle';
  }

  setState(state) {
    this.state = state;
    this.el.className = 'mic-button';

    if (state === 'listening') {
      this.el.classList.add('listening');
      this.el.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path fill="white" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
    } else if (state === 'processing') {
      this.el.classList.add('processing');
      this.el.innerHTML = `<div class="spinner"></div>`;
    } else if (state === 'speaking') {
      this.el.classList.add('speaking');
      this.el.innerHTML = `
        <div class="equalizer">
          <span></span><span></span><span></span><span></span><span></span>
        </div>`;
    } else {
      this.el.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path fill="white" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
    }
  }
}
