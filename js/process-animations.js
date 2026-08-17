/**
 * ZIJ Process & Workflow Animations Controller
 * Implements:
 * 1. 3-Phase Typewriter / Backspacing loop in Stage (3)
 * 2. Dynamic Mouse-Follow Details Tooltip
 */
class ProcessAnimations {
  constructor() {
    this.section = document.getElementById('process-section');
    this.typingTarget = document.getElementById('liveTypingCode');
    this.tooltip = document.getElementById('cursorTooltip');
    this.stageNodes = document.querySelectorAll('.stage-node-item');
    
    this.codeLines = [
      'const core = new ZijEngine();',
      'await core.implementModules();',
      'return core.launchSystem();'
    ];
    
    this.lineIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.typingTimeout = null;

    this.init();
  }

  init() {
    if (!this.section) return;
    this.runTypewriter();
    this.initCursorTooltip();
  }

  /**
   * Realistic character-by-character typing and deleting loop (3 phrases)
   */
  runTypewriter() {
    if (!this.typingTarget) return;

    const currentLine = this.codeLines[this.lineIndex];

    if (!this.isDeleting) {
      // Typing phase
      this.charIndex++;
      this.renderFormattedCode(currentLine.substring(0, this.charIndex));

      if (this.charIndex === currentLine.length) {
        // Line fully typed, pause before deleting
        this.isDeleting = true;
        this.typingTimeout = setTimeout(() => this.runTypewriter(), 1800);
        return;
      }
      // Character typing speed
      const speed = 45 + Math.random() * 35;
      this.typingTimeout = setTimeout(() => this.runTypewriter(), speed);
    } else {
      // Deleting phase
      this.charIndex--;
      this.renderFormattedCode(currentLine.substring(0, this.charIndex));

      if (this.charIndex === 0) {
        // Line fully erased, advance to next line
        this.isDeleting = false;
        this.lineIndex = (this.lineIndex + 1) % this.codeLines.length;
        this.typingTimeout = setTimeout(() => this.runTypewriter(), 500);
        return;
      }
      // Backspace speed
      this.typingTimeout = setTimeout(() => this.runTypewriter(), 28);
    }
  }

  /**
   * Syntax highlights code strings dynamically
   */
  renderFormattedCode(rawText) {
    if (!this.typingTarget) return;
    let formatted = rawText
      .replace(/(const|await|return|new)/g, '<span style="color:#58a4b0; font-weight:600;">$1</span>')
      .replace(/(ZijEngine|implementModules|launchSystem)/g, '<span style="color:#a9bcd0;">$1</span>');

    this.typingTarget.innerHTML = formatted;
  }

  /**
   * Dynamic Mouse-Follow Details Tooltip
   */
  initCursorTooltip() {
    if (!this.tooltip || !this.stageNodes.length) return;

    this.stageNodes.forEach(node => {
      node.addEventListener('mouseenter', (e) => {
        const title = node.getAttribute('data-title') || '';
        const desc = node.getAttribute('data-desc') || '';
        const tags = (node.getAttribute('data-tags') || '').split(',');

        let tagsHtml = tags.map(t => `<span class="popover-tag">${t.trim()}</span>`).join('');

        this.tooltip.innerHTML = `
          <div class="popover-heading">${title}</div>
          <p class="popover-body">${desc}</p>
          <div class="popover-tags">${tagsHtml}</div>
        `;

        this.tooltip.classList.add('active');
        this.updateTooltipPosition(e);
      });

      node.addEventListener('mousemove', (e) => {
        this.updateTooltipPosition(e);
      });

      node.addEventListener('mouseleave', () => {
        this.tooltip.classList.remove('active');
      });
    });
  }

  updateTooltipPosition(e) {
    if (!this.tooltip) return;
    let x = e.clientX;
    let y = e.clientY;

    // Viewport edge guards
    const tooltipWidth = 320;
    const tooltipHeight = 150;

    if (x - tooltipWidth / 2 < 15) {
      x = tooltipWidth / 2 + 15;
    } else if (x + tooltipWidth / 2 > window.innerWidth - 15) {
      x = window.innerWidth - tooltipWidth / 2 - 15;
    }

    if (y - tooltipHeight < 20) {
      // If too close to top, show below cursor
      this.tooltip.style.transform = 'translate(-50%, 20px)';
    } else {
      // Default: show above cursor
      this.tooltip.style.transform = 'translate(-50%, -100%)';
    }

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
  }
}

window.ProcessAnimations = ProcessAnimations;
