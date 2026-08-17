/**
 * ZIJ Circuit Engine - Clean Structured PCB & Terminal Bus System
 * Features:
 * - High-DPI hardware-accelerated canvas clearing
 * - Segment-based continuous radar proximity ghost in Standby
 * - Guaranteed fail-safe surge completion fallback
 * - Microprocessor socket terminal pins
 */
class CircuitEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.dpr = window.devicePixelRatio || 1;

    this.traces = [];
    this.terminals = [];
    this.surgePackets = [];
    this.ambientPackets = [];

    this.state = 'STANDBY'; // 'STANDBY', 'SURGING', 'POWERED'
    this.surgeDuration = 1800; // 1.8s
    this.surgeStartTime = 0;
    this.onSurgeComplete = null;
    this.fallbackTimer = null;

    this.mouse = { x: -1000, y: -1000, active: false };
    this.lastFrameTime = performance.now();

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    const updateMouse = (x, y) => {
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.active = true;
    };

    window.addEventListener('mousemove', (e) => updateMouse(e.clientX, e.clientY));
    window.addEventListener('pointermove', (e) => updateMouse(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
    window.addEventListener('touchend', () => {
      this.mouse.active = false;
    });

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.generateCircuits();
  }

  /**
   * Generates clean, parallel PCB buses terminating at the central socket boundary
   */
  generateCircuits() {
    this.traces = [];
    this.terminals = [];
    this.surgePackets = [];

    // Central exclusion box dimensions around the Logo (SVG is 400x240 aspect ratio)
    const isMobile = this.width < 768;
    const boxW = isMobile ? Math.min(310, this.width * 0.82) : 440;
    const boxH = isMobile ? 200 : 240;

    const left = this.centerX - boxW / 2;
    const right = this.centerX + boxW / 2;
    const top = this.centerY - boxH / 2;
    const bottom = this.centerY + boxH / 2;

    // --- 1. Top Bus (Vertical down with 45° bends to Top Terminal Pins) ---
    const topPinCount = isMobile ? 4 : 8;
    const topSpacing = (boxW * 0.7) / (topPinCount + 1);
    const topStartOffset = this.centerX - (topPinCount - 1) * topSpacing * 0.5;

    for (let i = 0; i < topPinCount; i++) {
      const endX = topStartOffset + i * topSpacing;
      const endY = top;
      const startX = endX + (i - (topPinCount - 1) / 2) * (isMobile ? 15 : 35);
      const startY = -10;

      const points = this.createPcbRoute(startX, startY, endX, endY, 'vertical');
      this.addTrace(points, endX, endY, 'top');
    }

    // --- 2. Bottom Bus (Vertical up with 45° bends to Bottom Terminal Pins) ---
    const bottomPinCount = isMobile ? 4 : 8;
    const bottomSpacing = (boxW * 0.7) / (bottomPinCount + 1);
    const bottomStartOffset = this.centerX - (bottomPinCount - 1) * bottomSpacing * 0.5;

    for (let i = 0; i < bottomPinCount; i++) {
      const endX = bottomStartOffset + i * bottomSpacing;
      const endY = bottom;
      const startX = endX + (i - (bottomPinCount - 1) / 2) * (isMobile ? 15 : 35);
      const startY = this.height + 10;

      const points = this.createPcbRoute(startX, startY, endX, endY, 'vertical');
      this.addTrace(points, endX, endY, 'bottom');
    }

    // --- 3. Left Bus (Horizontal right with 45° bends to Left Terminal Pins) ---
    const sidePinCount = isMobile ? 3 : 6;
    const sideSpacing = (boxH * 0.65) / (sidePinCount + 1);
    const leftStartOffset = this.centerY - (sidePinCount - 1) * sideSpacing * 0.5;

    for (let i = 0; i < sidePinCount; i++) {
      const endX = left;
      const endY = leftStartOffset + i * sideSpacing;
      const startX = -10;
      const startY = endY + (i - (sidePinCount - 1) / 2) * (isMobile ? 15 : 30);

      const points = this.createPcbRoute(startX, startY, endX, endY, 'horizontal');
      this.addTrace(points, endX, endY, 'left');
    }

    // --- 4. Right Bus (Horizontal left with 45° bends to Right Terminal Pins) ---
    for (let i = 0; i < sidePinCount; i++) {
      const endX = right;
      const endY = leftStartOffset + i * sideSpacing;
      const startX = this.width + 10;
      const startY = endY + (i - (sidePinCount - 1) / 2) * (isMobile ? 15 : 30);

      const points = this.createPcbRoute(startX, startY, endX, endY, 'horizontal');
      this.addTrace(points, endX, endY, 'right');
    }

    // --- 5. Corner 45-degree Angled Master Conduits ---
    const corners = [
      { sx: -10, sy: -10, ex: left, ey: top },
      { sx: this.width + 10, sy: -10, ex: right, ey: top },
      { sx: -10, sy: this.height + 10, ex: left, ey: bottom },
      { sx: this.width + 10, sy: this.height + 10, ex: right, ey: bottom },
    ];

    corners.forEach(c => {
      const midX = (c.sx + c.ex) * 0.5;
      const midY = (c.sy + c.ey) * 0.5;
      const points = [
        { x: c.sx, y: c.sy },
        { x: midX, y: midY },
        { x: c.ex, y: c.ey }
      ];
      this.addTrace(points, c.ex, c.ey, 'corner', 2.0);
    });
  }

  createPcbRoute(x1, y1, x2, y2, primaryDir) {
    const points = [{ x: x1, y: y1 }];
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (primaryDir === 'vertical') {
      const jogY = y1 + (y2 - y1) * 0.45;
      const jogX = x1 + dx * 0.8;
      points.push({ x: x1, y: jogY });
      points.push({ x: jogX, y: jogY + Math.sign(dy) * Math.min(Math.abs(dy) * 0.25, Math.abs(dx)) });
      points.push({ x: x2, y: y2 - Math.sign(dy) * 20 });
      points.push({ x: x2, y: y2 });
    } else {
      const jogX = x1 + (x2 - x1) * 0.45;
      const jogY = y1 + dy * 0.8;
      points.push({ x: jogX, y: y1 });
      points.push({ x: jogX + Math.sign(dx) * Math.min(Math.abs(dx) * 0.25, Math.abs(dy)), y: jogY });
      points.push({ x: x2 - Math.sign(dx) * 20, y: y2 });
      points.push({ x: x2, y: y2 });
    }

    return points;
  }

  addTrace(points, endX, endY, side, lineWidth = 1.4) {
    const length = this.calculatePathLength(points);
    this.traces.push({
      points,
      totalLength: length,
      lineWidth,
      alpha: 0.24,
      energizedAlpha: 0,
    });

    // Terminal Pin at socket boundary
    this.terminals.push({
      x: endX,
      y: endY,
      side,
      radius: 2.8,
      energized: false,
    });
  }

  calculatePathLength(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    }
    return total;
  }

  getPointAtDistance(points, distance) {
    let accumulated = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (accumulated + segLen >= distance) {
        const segProgress = (distance - accumulated) / (segLen || 1);
        return {
          x: p1.x + (p2.x - p1.x) * segProgress,
          y: p1.y + (p2.y - p1.y) * segProgress,
        };
      }
      accumulated += segLen;
    }
    return points[points.length - 1];
  }

  /**
   * Distance from point (px, py) to line segment (x1, y1) - (x2, y2)
   */
  distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  /**
   * Starts Inward Surge from perimeter toward central terminals
   */
  startSurge(onComplete) {
    this.state = 'SURGING';
    this.surgeStartTime = performance.now();
    this.onSurgeComplete = onComplete;
    this.surgePackets = [];

    this.traces.forEach((trace, idx) => {
      const delay = Math.random() * 250;
      this.surgePackets.push({
        trace,
        startTime: this.surgeStartTime + delay,
        duration: this.surgeDuration - 200,
        headLength: 50 + Math.random() * 30,
        color: idx % 3 === 0 ? '#a9bcd0' : '#58a4b0',
        completed: false,
      });
    });

    // Fail-safe timeout
    if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
    this.fallbackTimer = setTimeout(() => {
      if (this.state === 'SURGING') {
        this.finishSurge();
      }
    }, this.surgeDuration + 150);
  }

  finishSurge() {
    this.state = 'POWERED';
    this.terminals.forEach(t => t.energized = true);
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.onSurgeComplete) {
      const cb = this.onSurgeComplete;
      this.onSurgeComplete = null;
      cb();
    }
  }

  reset() {
    this.state = 'STANDBY';
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    this.surgePackets = [];
    this.ambientPackets = [];
    this.traces.forEach(t => t.energizedAlpha = 0);
    this.terminals.forEach(t => t.energized = false);
  }

  loop(timestamp) {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.scale(this.dpr, this.dpr);

    // In Standby mode: render radar ghost shadow of circuits near cursor
    if (this.state === 'STANDBY') {
      if (this.mouse.active) {
        this.drawStandbyGhostCircuits(timestamp);
      }
    } else {
      // 1. Draw structured base PCB traces
      this.drawBaseCircuits(timestamp);

      // 2. Draw surge animation packets
      if (this.state === 'SURGING') {
        this.drawSurgePackets(timestamp);
      }

      // 3. Draw ambient idle pulses when powered on
      if (this.state === 'POWERED') {
        this.drawAmbientPackets(timestamp);
      }

      // 4. Draw Terminal Connection Pins
      this.drawTerminals();
    }

    this.ctx.restore();
    requestAnimationFrame(this.loop);
  }

  /**
   * Soft radar / flashlight ghost shadow of circuits in Standby mode
   */
  drawStandbyGhostCircuits(timestamp) {
    const radarRadius = 240;
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';

    this.traces.forEach(trace => {
      let minDistance = Infinity;
      for (let i = 0; i < trace.points.length - 1; i++) {
        const p1 = trace.points[i];
        const p2 = trace.points[i + 1];
        const d = this.distToSegment(this.mouse.x, this.mouse.y, p1.x, p1.y, p2.x, p2.y);
        if (d < minDistance) minDistance = d;
      }

      if (minDistance < radarRadius) {
        const proximity = 1 - minDistance / radarRadius;
        const ghostAlpha = 0.08 + proximity * 0.42;

        this.ctx.beginPath();
        this.ctx.moveTo(trace.points[0].x, trace.points[0].y);
        for (let i = 1; i < trace.points.length; i++) {
          this.ctx.lineTo(trace.points[i].x, trace.points[i].y);
        }

        this.ctx.strokeStyle = `rgba(88, 164, 176, ${ghostAlpha})`;
        this.ctx.lineWidth = trace.lineWidth * (1 + proximity * 0.7);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowColor = '#58a4b0';
        this.ctx.shadowBlur = 8 * proximity;
        this.ctx.stroke();
      }
    });

    // Faint terminal connection dots near mouse in standby
    this.terminals.forEach(term => {
      const d = Math.hypot(this.mouse.x - term.x, this.mouse.y - term.y);
      if (d < radarRadius) {
        const proximity = 1 - d / radarRadius;
        this.ctx.beginPath();
        this.ctx.arc(term.x, term.y, term.radius * (1 + proximity * 0.4), 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(88, 164, 176, ${0.15 + proximity * 0.55})`;
        this.ctx.shadowColor = '#58a4b0';
        this.ctx.shadowBlur = 6 * proximity;
        this.ctx.fill();
      }
    });

    this.ctx.restore();
  }

  drawBaseCircuits(timestamp) {
    this.ctx.save();
    this.traces.forEach(trace => {
      this.ctx.beginPath();
      this.ctx.moveTo(trace.points[0].x, trace.points[0].y);
      for (let i = 1; i < trace.points.length; i++) {
        this.ctx.lineTo(trace.points[i].x, trace.points[i].y);
      }

      // Proximity glow to mouse
      let mouseGlow = 0;
      if (this.mouse.active) {
        const mid = trace.points[Math.floor(trace.points.length / 2)];
        const dist = Math.hypot(this.mouse.x - mid.x, this.mouse.y - mid.y);
        if (dist < 180) {
          mouseGlow = (1 - dist / 180) * 0.4;
        }
      }

      const alpha = Math.min(1, trace.alpha + trace.energizedAlpha + mouseGlow);

      if (this.state === 'POWERED') {
        this.ctx.strokeStyle = `rgba(88, 164, 176, ${alpha * 0.6})`;
      } else {
        this.ctx.strokeStyle = `rgba(55, 63, 81, ${alpha * 0.7})`;
      }

      this.ctx.lineWidth = trace.lineWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
    });
    this.ctx.restore();
  }

  drawSurgePackets(timestamp) {
    let allFinished = true;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    this.surgePackets.forEach(packet => {
      if (timestamp < packet.startTime) {
        allFinished = false;
        return;
      }

      const elapsed = timestamp - packet.startTime;
      const progress = Math.min(1, elapsed / packet.duration);

      if (progress < 1) {
        allFinished = false;
      } else {
        packet.completed = true;
      }

      const currentDist = progress * packet.trace.totalLength;
      const tailDist = Math.max(0, currentDist - packet.headLength);

      const headPoint = this.getPointAtDistance(packet.trace.points, currentDist);
      const tailPoint = this.getPointAtDistance(packet.trace.points, tailDist);

      packet.trace.energizedAlpha = Math.min(0.7, progress);

      // Glowing Pulse Segment
      this.ctx.beginPath();
      this.ctx.moveTo(tailPoint.x, tailPoint.y);
      this.ctx.lineTo(headPoint.x, headPoint.y);

      this.ctx.strokeStyle = packet.color;
      this.ctx.lineWidth = packet.trace.lineWidth * 2.8;
      this.ctx.shadowColor = packet.color;
      this.ctx.shadowBlur = 14;
      this.ctx.stroke();

      // Glowing head spark
      this.ctx.beginPath();
      this.ctx.arc(headPoint.x, headPoint.y, packet.trace.lineWidth * 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#58a4b0';
      this.ctx.shadowBlur = 18;
      this.ctx.fill();
    });

    this.ctx.restore();

    if (allFinished && this.state === 'SURGING') {
      this.finishSurge();
    }
  }

  drawAmbientPackets(timestamp) {
    if (Math.random() < 0.035 && this.ambientPackets.length < 6) {
      const trace = this.traces[Math.floor(Math.random() * this.traces.length)];
      this.ambientPackets.push({
        trace,
        startTime: timestamp,
        duration: 1600 + Math.random() * 1000,
        color: Math.random() > 0.4 ? 'rgba(88, 164, 176, 0.7)' : 'rgba(169, 188, 208, 0.6)',
      });
    }

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';

    this.ambientPackets = this.ambientPackets.filter(packet => {
      const elapsed = timestamp - packet.startTime;
      const progress = elapsed / packet.duration;

      if (progress >= 1) return false;

      const currentDist = progress * packet.trace.totalLength;
      const head = this.getPointAtDistance(packet.trace.points, currentDist);

      this.ctx.beginPath();
      this.ctx.arc(head.x, head.y, 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = packet.color;
      this.ctx.shadowColor = '#58a4b0';
      this.ctx.shadowBlur = 8;
      this.ctx.fill();

      return true;
    });

    this.ctx.restore();
  }

  drawTerminals() {
    this.ctx.save();
    this.terminals.forEach(term => {
      this.ctx.beginPath();
      this.ctx.arc(term.x, term.y, term.radius, 0, Math.PI * 2);

      if (this.state === 'POWERED') {
        this.ctx.fillStyle = '#58a4b0';
        this.ctx.shadowColor = '#58a4b0';
        this.ctx.shadowBlur = 6;
      } else {
        this.ctx.fillStyle = 'rgba(88, 164, 176, 0.5)';
      }

      this.ctx.fill();
    });
    this.ctx.restore();
  }
}

window.CircuitEngine = CircuitEngine;
