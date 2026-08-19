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

  // 4. Initialize Projects Carousel Controller
  if (window.ProjectsCarousel) {
    window.projectsCarousel = new ProjectsCarousel();
  }

  // 5. Initialize Iran Map Circuit Network Engine
  if (window.MapNetworkEngine) {
    window.mapNetwork = new MapNetworkEngine();
  }

  // 6. User interaction listener to unlock Web Audio API on initial touch/click
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

  // 7. Smooth Scroll Navigation for Explore Button
  const exploreBtn = document.getElementById('exploreBtn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (document.body.classList.contains('online-unlocked')) {
        const targetEl = document.getElementById('process-section');
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }

  // 8. Discrete Section Navigation (Desktop Only: >= 992px)
  let isNavigating = false;
  const sections = ['hero', 'process-section', 'projects-section', 'contact-section'];
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
    const vh = window.innerHeight;
    if (scrollPos < vh * 0.5) {
      currentSectionIdx = 0;
    } else if (scrollPos < vh * 1.5) {
      currentSectionIdx = 1;
    } else if (scrollPos < vh * 2.5) {
      currentSectionIdx = 2;
    } else {
      currentSectionIdx = 3;
    }
  }, { passive: true });

  // Discrete Mouse Wheel Paging (Active strictly on Desktop screens >= 992px)
  window.addEventListener('wheel', (e) => {
    // If offline: completely block scrolling
    if (!document.body.classList.contains('online-unlocked')) {
      e.preventDefault();
      return;
    }

    // Discrete jump only on desktop viewports
    if (window.innerWidth >= 992) {
      if (Math.abs(e.deltaY) > 25) {
        if (e.deltaY > 0 && currentSectionIdx < sections.length - 1) {
          e.preventDefault();
          scrollToSection(currentSectionIdx + 1);
        } else if (e.deltaY < 0 && currentSectionIdx > 0) {
          e.preventDefault();
          scrollToSection(currentSectionIdx - 1);
        }
      }
    }
  }, { passive: false });

  // Discrete Keyboard Paging (Desktop only)
  window.addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('online-unlocked')) {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.key)) {
        e.preventDefault();
      }
      return;
    }
    if (window.innerWidth >= 992) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (currentSectionIdx < sections.length - 1) {
          e.preventDefault();
          scrollToSection(currentSectionIdx + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentSectionIdx > 0) {
          e.preventDefault();
          scrollToSection(currentSectionIdx - 1);
        }
      }
    }
  });
});
