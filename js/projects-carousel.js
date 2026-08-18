/**
 * ZIJ Projects Carousel Controller
 * Manages project card navigation, horizontal scroll alignment, and touch drag
 */
class ProjectsCarousel {
  constructor() {
    this.section = document.getElementById('projects-section');
    this.track = document.querySelector('.projects-track');
    this.cards = document.querySelectorAll('.project-card');
    this.btnPrev = document.querySelector('.btn-prev');
    this.btnNext = document.querySelector('.btn-next');
    this.currentIndex = 0;

    this.init();
  }

  init() {
    if (!this.section || !this.track) return;

    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', () => this.navigate(-1));
    }
    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => this.navigate(1));
    }

    // Touch swipe support for mobile carousel
    let startX = 0;
    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) this.navigate(1);
        else this.navigate(-1);
      }
    }, { passive: true });
  }

  navigate(dir) {
    if (this.cards.length <= 1) return;
    this.currentIndex = (this.currentIndex + dir + this.cards.length) % this.cards.length;
    const activeCard = this.cards[this.currentIndex];
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
}

window.ProjectsCarousel = ProjectsCarousel;
