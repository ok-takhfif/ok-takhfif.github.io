/**
 * ZIJ Landing Page - Main Application Initializer & Discrete Section Navigation
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Circuit Engine
  window.circuitEngine = new CircuitEngine('circuit-canvas');

  // 2. Initialize Logo & Interaction Controller
  window.logoController = new LogoController();

  // 3. Initialize Process Section Infinity Animations
  if (window.ProcessAnimations) {
    window.processAnimations = new ProcessAnimations();
  }

  // 4. User interaction listener to unlock Web Audio API on initial touch/click
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

  // 5. Smooth Scroll Navigation for Explore Button
  const exploreBtn = document.getElementById('exploreBtn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (document.body.classList.contains('online-unlocked')) {
        scrollToSection(1);
      }
    });
  }

  // 6. Discrete Section Navigation (Snaps exactly 1 full section per scroll/wheel/swipe)
  let isNavigating = false;
  const sections = ['hero', 'process-section'];
  let currentSectionIdx = 0;

  const scrollToSection = (idx) => {
    if (idx < 0 || idx >= sections.length || isNavigating) return;
    isNavigating = true;
    currentSectionIdx = idx;
    const targetEl = document.getElementById(sections[idx]);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      isNavigating = false;
    }, 750);
  };

  // Sync index on native scroll
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const heroHeight = window.innerHeight * 0.5;
    currentSectionIdx = scrollPos > heroHeight ? 1 : 0;
  }, { passive: true });

  // Discrete Mouse Wheel Paging
  window.addEventListener('wheel', (e) => {
    // If offline: completely block scrolling
    if (!document.body.classList.contains('online-unlocked')) {
      e.preventDefault();
      return;
    }

    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0 && currentSectionIdx === 0) {
        e.preventDefault();
        scrollToSection(1);
      } else if (e.deltaY < 0 && currentSectionIdx === 1) {
        e.preventDefault();
        scrollToSection(0);
      }
    }
  }, { passive: false });

  // Discrete Keyboard Paging
  window.addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('online-unlocked')) {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.key)) {
        e.preventDefault();
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      if (currentSectionIdx === 0) {
        e.preventDefault();
        scrollToSection(1);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (currentSectionIdx === 1) {
        e.preventDefault();
        scrollToSection(0);
      }
    }
  });

  // Discrete Touch Swipe Paging for Mobile
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!document.body.classList.contains('online-unlocked')) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    if (Math.abs(diff) > 45) {
      if (diff > 0 && currentSectionIdx === 0) {
        scrollToSection(1);
      } else if (diff < 0 && currentSectionIdx === 1) {
        scrollToSection(0);
      }
    }
  }, { passive: true });
});
