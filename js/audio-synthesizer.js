/**
 * ZIJ Web Audio Synthesizer
 * Procedurally generates futuristic cybernetic & electronic power-up sounds
 * with 100% fail-safe error boundaries.
 */
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API unavailable:', e);
    }
  }

  resume() {
    try {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {}
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      if (this.isMuted && this.ambientGain && this.ctx) {
        this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } catch (e) {}
    return this.isMuted;
  }

  /**
   * Crisp mechanical & tactile switch click
   */
  playSwitchClick() {
    if (this.isMuted) return;
    try {
      this.init();
      this.resume();
      if (!this.ctx) return;

      const t = Math.max(0.001, this.ctx.currentTime);

      // Sub click oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);

      // High snap noise burst
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.03);
      if (bufferSize > 0) {
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, t);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(t);
      }
    } catch (e) {
      console.warn('Audio click error caught:', e);
    }
  }

  /**
   * Inward electric surge frequency sweep
   */
  playSurgeSound(duration = 2.0) {
    if (this.isMuted) return;
    try {
      this.init();
      this.resume();
      if (!this.ctx) return;

      const t = Math.max(0.001, this.ctx.currentTime);

      // Rising energy oscillator
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + duration);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + duration);
      filter.Q.setValueAtTime(4, t);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35, t + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);

      // Deep sub-bass surge build-up
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(50, t);
      subOsc.frequency.linearRampToValueAtTime(110, t + duration);

      subGain.gain.setValueAtTime(0.05, t);
      subGain.gain.linearRampToValueAtTime(0.4, t + duration * 0.85);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(t);
      subOsc.stop(t + duration);
    } catch (e) {
      console.warn('Audio surge error caught:', e);
    }
  }

  /**
   * Logo Lock & Awakening Chime (Harmonic Cyber Chord)
   */
  playLockChime() {
    if (this.isMuted) return;
    try {
      this.init();
      this.resume();
      if (!this.ctx) return;

      const t = Math.max(0.001, this.ctx.currentTime);
      const freqs = [220, 330, 440, 660, 880];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        const delay = idx * 0.04;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.setValueAtTime(0.2 / (idx + 1), t + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + delay);
        osc.stop(t + delay + 1.8);
      });
    } catch (e) {
      console.warn('Audio chime error caught:', e);
    }
  }

  /**
   * Soft ambient electrical hum when powered on
   */
  startAmbientDrone() {
    if (this.isMuted || this.ambientOsc) return;
    try {
      this.init();
      this.resume();
      if (!this.ctx) return;

      const t = Math.max(0.001, this.ctx.currentTime);
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(65, t);

      this.ambientGain.gain.setValueAtTime(0.001, t);
      this.ambientGain.gain.linearRampToValueAtTime(0.03, t + 2.0);

      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start(t);
    } catch (e) {}
  }

  stopAmbientDrone() {
    try {
      if (this.ambientOsc && this.ctx) {
        const t = Math.max(0.001, this.ctx.currentTime);
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        this.ambientOsc.stop(t + 0.5);
      }
    } catch (e) {}
    this.ambientOsc = null;
    this.ambientGain = null;
  }
}

// Export singleton
window.AudioEngine = new AudioSynthesizer();
