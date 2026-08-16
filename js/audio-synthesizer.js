/**
 * ZIJ Web Audio Synthesizer
 * Procedurally generates futuristic cybernetic & electronic power-up sounds
 * without needing external audio files.
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
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Crisp mechanical & tactile switch click
   */
  playSwitchClick() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

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

    // High snap noise
    const bufferSize = this.ctx.sampleRate * 0.03;
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

  /**
   * Inward electric surge frequency sweep
   */
  playSurgeSound(duration = 2.0) {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Rising energy oscillator (Sawtooth for high-tech sizzle)
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
  }

  /**
   * Logo Lock & Awakening Chime (Harmonic Cyber Chord)
   */
  playLockChime() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Harmonic frequencies for high-tech resolution (e.g. C sharp major / F# high tech chord: 220, 277.18, 330, 440, 660)
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
  }

  /**
   * Soft ambient electrical hum when powered on
   */
  startAmbientDrone() {
    if (this.isMuted || this.ambientOsc) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();

    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.setValueAtTime(65, t); // 65Hz warm electrical hum

    this.ambientGain.gain.setValueAtTime(0.001, t);
    this.ambientGain.gain.linearRampToValueAtTime(0.03, t + 2.0);

    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    this.ambientOsc.start(t);
  }

  stopAmbientDrone() {
    if (this.ambientOsc && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, t + 0.5);
        this.ambientOsc.stop(t + 0.5);
      } catch(e) {}
      this.ambientOsc = null;
      this.ambientGain = null;
    }
  }
}

// Export singleton
window.AudioEngine = new AudioSynthesizer();
