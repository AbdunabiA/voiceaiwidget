export class AudioPlayer {
  constructor() {
    this.audioContext = null;
    this.sourceNode = null;
    this.analyserNode = null;
  }

  async playAudio(base64Audio, mimeType) {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const binaryStr = atob(base64Audio);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = audioBuffer;
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);

    return new Promise((resolve) => {
      this.sourceNode.onended = () => {
        this.sourceNode = null;
        resolve();
      };
      this.sourceNode.start(0);
    });
  }

  getAnalyserNode() {
    return this.analyserNode;
  }

  stop() {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch (e) {
        // already stopped
      }
      this.sourceNode = null;
    }
  }
}
