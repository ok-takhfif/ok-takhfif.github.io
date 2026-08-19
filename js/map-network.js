/**
 * ZIJ Iran Map Circuit Network & Node Pulse Animation Engine
 * Controls sequential pulse travel between 7 interior city nodes with 0.35s station rest timing
 */
class MapNetworkEngine {
  constructor() {
    this.svg = document.getElementById('iranMapSvg');
    this.pulseDot = document.getElementById('activeNetworkPulse');
    this.cityNodes = document.querySelectorAll('.city-node-group');

    // Strategic tech hubs positioned comfortably within the interior of Iran-map.png (2000x2000)
    this.nodes = [
      { id: 'tehran', name: 'تهران', x: 820, y: 580 },        // 0
      { id: 'tabriz', name: 'تبریز', x: 450, y: 420 },        // 1
      { id: 'ahvaz', name: 'اهواز', x: 620, y: 1080 },        // 2
      { id: 'shiraz', name: 'شیراز', x: 980, y: 1260 },       // 3
      { id: 'bandar', name: 'بندرعباس/کرمان', x: 1280, y: 1420 }, // 4
      { id: 'isfahan', name: 'اصفهان', x: 900, y: 920 },      // 5
      { id: 'mashhad', name: 'مشهد', x: 1420, y: 560 }        // 6
    ];

    // Traversal route sequence through the connected neighbor network (0 -> 1 -> 5 -> 2 -> 3 -> 4 -> 6 -> 0)
    this.route = [0, 1, 5, 2, 3, 4, 6, 0];
    this.currentSegment = 0;
    this.progress = 0;
    this.isResting = false;
    this.travelSpeed = 0.018; // Smooth travel speed (~0.9s per segment)
    this.restDurationMs = 350; // Nap time (0.35s) at each node

    this.init();
  }

  init() {
    if (!this.svg || !this.pulseDot) return;

    // Set initial position at Tehran
    this.setPulsePos(this.nodes[0].x, this.nodes[0].y);
    this.triggerNodeActive(0);

    // Start render loop
    requestAnimationFrame(() => this.tick());

    // Init copy-to-clipboard buttons
    this.initClipboardHandlers();
  }

  setPulsePos(x, y) {
    if (this.pulseDot) {
      this.pulseDot.setAttribute('cx', x);
      this.pulseDot.setAttribute('cy', y);
    }
  }

  triggerNodeActive(nodeIdx) {
    this.cityNodes.forEach((nodeEl, idx) => {
      if (idx === nodeIdx) {
        nodeEl.classList.add('active');
        // Reset ripple animation by re-triggering class
        const ripple = nodeEl.querySelector('.node-ripple-ring');
        if (ripple) {
          ripple.style.animation = 'none';
          void ripple.offsetWidth; // Trigger reflow
          ripple.style.animation = 'node-ripple-expand 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards';
        }
      } else {
        nodeEl.classList.remove('active');
      }
    });
  }

  tick() {
    if (!this.isResting) {
      this.progress += this.travelSpeed;

      const fromNode = this.nodes[this.route[this.currentSegment]];
      const toNode = this.nodes[this.route[this.currentSegment + 1]];

      if (this.progress >= 1) {
        // Reached destination node
        this.progress = 1;
        this.setPulsePos(toNode.x, toNode.y);

        const destNodeIdx = this.route[this.currentSegment + 1];
        this.triggerNodeActive(destNodeIdx);

        // Enter Rest / Nap State (0.35s)
        this.isResting = true;
        setTimeout(() => {
          this.isResting = false;
          this.progress = 0;
          this.currentSegment = (this.currentSegment + 1) % (this.route.length - 1);
        }, this.restDurationMs);

      } else {
        // Smooth linear interpolation along current segment
        const currentX = fromNode.x + (toNode.x - fromNode.x) * this.progress;
        const currentY = fromNode.y + (toNode.y - fromNode.y) * this.progress;
        this.setPulsePos(currentX, currentY);
      }
    }

    requestAnimationFrame(() => this.tick());
  }

  initClipboardHandlers() {
    const copyButtons = document.querySelectorAll('.copy-badge-btn');
    const copyToast = document.getElementById('copyToast');

    copyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const value = btn.getAttribute('data-copy');
        if (value && navigator.clipboard) {
          navigator.clipboard.writeText(value).then(() => {
            if (copyToast) {
              copyToast.classList.add('show');
              setTimeout(() => {
                copyToast.classList.remove('show');
              }, 2200);
            }
          }).catch(err => {
            console.warn('Copy failed:', err);
          });
        }
      });
    });
  }
}

window.MapNetworkEngine = MapNetworkEngine;
