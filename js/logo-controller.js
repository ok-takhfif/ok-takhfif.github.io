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
    this.statusText = document.querySelector('.status-text');

    this.state = 'STANDBY'; // 'STANDBY', 'CHARGING', 'POWERED'
    this.init();
  }

  init() {
    // Universal trigger for power button in standby state
    const handlePowerTrigger = (e) => {
      if (this.state === 'STANDBY') {
        if (e && e.type !== 'touchstart') {
          try { e.preventDefault(); } catch (err) {}
          try { e.stopPropagation(); } catch (err) {}
        }
        this.powerOn();
      }
    };

    if (this.powerBtnGroup) {
      this.powerBtnGroup.addEventListener('click', handlePowerTrigger);
      this.powerBtnGroup.addEventListener('pointerup', handlePowerTrigger);
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
  }

  powerOn() {
    if (this.state !== 'STANDBY') return;
    this.state = 'CHARGING';

    // 1. Update UI classes
    if (this.heroSection) this.heroSection.classList.add('charging');
    if (this.statusText) this.statusText.textContent = 'CONNECTING...';

    // 2. Audio feedback: Mechanical switch snap + rising electric surge
    if (window.AudioEngine) {
      try {
        window.AudioEngine.playSwitchClick();
        window.AudioEngine.playSurgeSound(1.8);
      } catch (e) {
        console.warn('Audio feedback skipped:', e);
      }
    }

    // 3. Trigger Inward Convergence Circuit Engine
    let completed = false;
    const triggerComplete = () => {
      if (!completed) {
        completed = true;
        this.onSurgeComplete();
      }
    };

    if (window.circuitEngine) {
      try {
        window.circuitEngine.startSurge(triggerComplete);
      } catch (e) {
        console.warn('Circuit engine surge error:', e);
        setTimeout(triggerComplete, 1800);
      }
    } else {
      setTimeout(triggerComplete, 1800);
    }
  }

  onSurgeComplete() {
    this.state = 'POWERED';

    // 1. Update Hero state classes
    if (this.heroSection) {
      this.heroSection.classList.remove('charging');
      this.heroSection.classList.add('powered-on');
    }
    if (this.logoContainer) {
      this.logoContainer.classList.remove('standby');
    }
    if (this.statusText) {
      this.statusText.textContent = 'ONLINE';
    }

    // Unlock discrete page scrolling
    document.body.classList.remove('offline-locked');
    document.body.classList.add('online-unlocked');
    document.documentElement.classList.add('online-unlocked');

    // 2. Play harmonic cyber lock chime
    if (window.AudioEngine) {
      try {
        window.AudioEngine.playLockChime();
        window.AudioEngine.startAmbientDrone();
      } catch (e) {
        console.warn('Audio chime skipped:', e);
      }
    }
  }

  reset() {
    if (this.state === 'STANDBY') return;
    this.state = 'STANDBY';

    // 1. Reset classes
    if (this.heroSection) {
      this.heroSection.classList.remove('charging', 'powered-on');
    }
    if (this.logoContainer) {
      this.logoContainer.classList.add('standby');
    }
    if (this.statusText) {
      this.statusText.textContent = 'OFFLINE';
    }

    // Lock page scrolling when offline
    document.body.classList.remove('online-unlocked');
    document.documentElement.classList.remove('online-unlocked');
    document.body.classList.add('offline-locked');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. Stop audio drone
    if (window.AudioEngine) {
      try {
        window.AudioEngine.stopAmbientDrone();
        window.AudioEngine.playSwitchClick();
      } catch (e) {}
    }

    // 3. Reset circuit canvas
    if (window.circuitEngine) {
      try {
        window.circuitEngine.reset();
      } catch (e) {}
    }
  }
}

window.LogoController = LogoController;
