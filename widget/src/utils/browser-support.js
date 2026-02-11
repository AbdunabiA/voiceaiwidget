export function checkBrowserSupport() {
  return {
    microphone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    mediaRecorder: typeof MediaRecorder !== 'undefined',
  };
}
