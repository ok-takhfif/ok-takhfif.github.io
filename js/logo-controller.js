/**
 * ZIJ Logo Controller & State Machine
 * Manages the power button interaction, inward energy convergence, 
 * letter 'Z' morphing, and brand title reveal.
 */
class LogoController {
  constructor() {
    this.heroSection = document.querySelector('.hero-section');
    this.logoContainer = document.querySelector('.logo-container');
    this.powerBtnGroup = document.querySelector('.power-btn-group');
    this.brandTitleWrap = document.querySelector('.brand-title-wrap');
    this.powerHint = document.querySelector('.power-hint');
    this.powerCycleBtn = document.querySelector('.power-cycle-btn');
    this.soundToggleBtn = document.querySelector('.sound-toggle-btn');
    this.statusText = document.querySelector('.status-text');

    this.state = 'STANDBY'; // 'STANDBY', 'CHARGING', 'POWERED'
    this.init();
  }

  init() {
    // Click handler for power button & standby container
    const handlePowerTrigger = (e) => {
      if (this.state === 'STANDBY') {
        e.stopPropagation();
        this.powerOn();
      }
    };

    if (this.powerBtnGroup) {
      this.powerBtnGroup.addEventListener('click', handlePowerTrigger);
    }
    if (this.logoContainer) {
      this.logoContainer.addEventListener('click', handlePowerTrigger);
    }

    // Reset button
    if (this.powerCycleBtn) {
      this.powerCycleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.reset();
      });
    }

    // Sound toggle button
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSound();
      });
    }
  }

  powerOn() {
    if (this.state !== 'STANDBY') return;
    this.state = 'CHARGING';

    // 1. Update UI classes
    this.heroSection.classList.add('charging');
    if (this.statusText) this.statusText.textContent = 'CONNECTING...';

    // 2. Audio feedback: Mechanical switch snap + rising electric surge
    if (window.AudioEngine) {
      window.AudioEngine.playSwitchClick();
      window.AudioEngine.playSurgeSound(1.9);
    }

    // 3. Trigger Inward Convergence Circuit Engine
    if (window.circuitEngine) {
      window.circuitEngine.startSurge(() => {
        this.onSurgeComplete();
      });
    } else {
      setTimeout(() => this.onSurgeComplete(), 1900);
    }
  }

  onSurgeComplete() {
    this.state = 'POWERED';

    // 1. Update Hero state classes
    this.heroSection.classList.remove('charging');
    this.heroSection.classList.add('powered-on');
    this.logoContainer.classList.remove('standby');
    if (this.statusText) this.statusText.textContent = 'ONLINE';

    // 2. Play harmonic cyber lock chime
    if (window.AudioEngine) {
      window.AudioEngine.playLockChime();
      window.AudioEngine.startAmbientDrone();
    }
  }

  reset() {
    if (this.state === 'STANDBY') return;
    this.state = 'STANDBY';

    // 1. Reset classes
    this.heroSection.classList.remove('charging', 'powered-on');
    this.logoContainer.classList.add('standby');
    if (this.statusText) this.statusText.textContent = 'OFFLINE';

    // 2. Stop audio drone
    if (window.AudioEngine) {
      window.AudioEngine.stopAmbientDrone();
      window.AudioEngine.playSwitchClick();
    }

    // 3. Reset circuit canvas
    if (window.circuitEngine) {
      window.circuitEngine.reset();
    }
  }

  toggleSound() {
    if (!window.AudioEngine) return;
    const isMuted = window.AudioEngine.toggleMute();
    const soundText = this.soundToggleBtn.querySelector('.sound-label');
    const soundIcon = this.soundToggleBtn.querySelector('.sound-icon');

    if (isMuted) {
      if (soundText) soundText.textContent = 'صدا: خاموش';
      if (soundIcon) {
        soundIcon.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        `;
      }
    } else {
      if (soundText) soundText.textContent = 'صدا: روشن';
      if (soundIcon) {
        soundIcon.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        `;
      }
    }
  }
}

window.LogoController = LogoController;
