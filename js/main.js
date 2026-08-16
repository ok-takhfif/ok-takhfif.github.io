/**
 * ZIJ Landing Page - Main Application Initializer
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Circuit Engine
  window.circuitEngine = new CircuitEngine('circuit-canvas');

  // 2. Initialize Logo & Interaction Controller
  window.logoController = new LogoController();

  // 3. User interaction listener to unlock Web Audio API on initial touch/click
  const unlockAudio = () => {
    if (window.AudioEngine) {
      window.AudioEngine.init();
      window.AudioEngine.resume();
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
});
