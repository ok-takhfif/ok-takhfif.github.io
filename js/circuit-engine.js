/**
 * ZIJ Circuit Engine
 * Procedural electronic circuit / PCB generation with inward energy pulse simulation.
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
    this.vias = [];
    this.surgePackets = [];
    this.ambientPackets = [];

    this.state = 'STANDBY'; // 'STANDBY', 'SURGING', 'POWERED'
    this.surgeProgress = 0;
    this.surgeDuration = 2000; // 2.0s
    this.surgeStartTime = 0;
    this.onSurgeComplete = null;

    this.mouse = { x: -1000, y: -1000, active: false };
    this.lastFrameTime = performance.now();

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    window.addEventListener('mouseleave', () => {
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

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.generateCircuits();
  }

  /**
   * Generate inward-routing PCB traces with 45° bends, via pads, and IC terminals
   */
  generateCircuits() {
    this.traces = [];
    this.vias = [];
    this.surgePackets = [];

    const numTraces = Math.max(36, Math.floor((this.width + this.height) / 45));
    // Route traces directly into the center behind the logo element
    const targetRadius = Math.min(this.width, this.height) * 0.08; // Deep behind the center logo

    for (let i = 0; i < numTraces; i++) {
      // Determine origin along perimeter (0: top, 1: right, 2: bottom, 3: left)
      const edge = Math.floor(Math.random() * 4);
      let startX, startY;

      if (edge === 0) { // Top
        startX = Math.random() * this.width;
        startY = -10;
      } else if (edge === 1) { // Right
        startX = this.width + 10;
        startY = Math.random() * this.height;
      } else if (edge === 2) { // Bottom
        startX = Math.random() * this.width;
        startY = this.height + 10;
      } else { // Left
        startX = -10;
        startY = Math.random() * this.height;
      }

      // Target point deep behind the center logo container
      const targetAngle = Math.random() * Math.PI * 2;
      const endX = this.centerX + Math.cos(targetAngle) * (targetRadius * Math.random());
      const endY = this.centerY + Math.sin(targetAngle) * (targetRadius * Math.random());

      // Generate 45-degree Manhattan routing points
      const points = this.generatePcbPath(startX, startY, endX, endY);
      const pathLength = this.calculatePathLength(points);

      const trace = {
        points,
        totalLength: pathLength,
        lineWidth: Math.random() > 0.75 ? 2.2 : 1.2,
        busGroup: Math.floor(Math.random() * 4),
        alpha: 0.12 + Math.random() * 0.14,
        energizedAlpha: 0,
      };

      this.traces.push(trace);

      // Only add subtle via pads at outer perimeter corners/elbows far away from the logo center
      if (points.length > 2 && Math.random() > 0.6) {
        const midPoint = points[1];
        const distFromCenter = Math.hypot(midPoint.x - this.centerX, midPoint.y - this.centerY);
        if (distFromCenter > Math.min(this.width, this.height) * 0.3) {
          this.vias.push({
            x: midPoint.x,
            y: midPoint.y,
            radius: 2.5 + Math.random() * 1.5,
            alpha: 0.25,
          });
        }
      }
    }
  }

  /**
   * Generates PCB path with 45-degree chamfers
   */
  generatePcbPath(x1, y1, x2, y2) {
    const points = [{ x: x1, y: y1 }];
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Intermediate elbows with 45-degree segments
    const midX = x1 + dx * (0.3 + Math.random() * 0.4);
    const midY = y1 + dy * (0.3 + Math.random() * 0.4);

    // First leg: Horizontal or Vertical
    if (Math.abs(dx) > Math.abs(dy)) {
      points.push({ x: midX, y: y1 });
      // 45 degree jog
      const jog = Math.min(Math.abs(midY - y1), Math.abs(x2 - midX)) * 0.5;
      points.push({ x: midX + Math.sign(dx) * jog, y: y1 + Math.sign(dy) * jog });
      points.push({ x: midX + Math.sign(dx) * jog, y: y2 });
    } else {
      points.push({ x: x1, y: midY });
      const jog = Math.min(Math.abs(midX - x1), Math.abs(y2 - midY)) * 0.5;
      points.push({ x: x1 + Math.sign(dx) * jog, y: midY + Math.sign(dy) * jog });
      points.push({ x: x2, y: midY + Math.sign(dy) * jog });
    }

    points.push({ x: x2, y: y2 });
    return points;
  }

  calculatePathLength(points) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      total += Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }
    return total;
  }

  /**
   * Get coordinate along polyline at distance `d`
   */
  getPointAtDistance(points, distance) {
    let accumulated = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (accumulated + segLen >= distance) {
        const segProgress = (distance - accumulated) / segLen;
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
   * Trigger the Inward Convergence Surge Sequence
   */
  startSurge(onComplete) {
    this.state = 'SURGING';
    this.surgeStartTime = performance.now();
    this.onSurgeComplete = onComplete;
    this.surgePackets = [];

    // Create high-velocity energy packets on all traces
    this.traces.forEach((trace, idx) => {
      const delay = Math.random() * 400; // Staggered start
      const speedMultiplier = 0.85 + Math.random() * 0.3;

      this.surgePackets.push({
        trace,
        startTime: this.surgeStartTime + delay,
        duration: (this.surgeDuration - 300) * speedMultiplier,
        headLength: 40 + Math.random() * 30,
        color: Math.random() > 0.3 ? '#58a4b0' : '#a9bcd0',
        completed: false,
      });
    });
  }

  /**
   * Reset back to standby
   */
  reset() {
    this.state = 'STANDBY';
    this.surgePackets = [];
    this.ambientPackets = [];
    this.traces.forEach(t => t.energizedAlpha = 0);
  }

  loop(timestamp) {
    const dt = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw static PCB base traces
    this.drawBaseCircuits(timestamp);

    // 2. Draw surge animation packets (Inward Convergence)
    if (this.state === 'SURGING') {
      this.drawSurgePackets(timestamp);
    }

    // 3. Draw ambient idle pulses when powered on
    if (this.state === 'POWERED') {
      this.drawAmbientPackets(timestamp);
    }

    // 4. Draw Via Pads & Micro Nodes
    this.drawVias();

    requestAnimationFrame(this.loop);
  }

  drawBaseCircuits(timestamp) {
    this.ctx.save();
    this.traces.forEach(trace => {
      this.ctx.beginPath();
      this.ctx.moveTo(trace.points[0].x, trace.points[0].y);
      for (let i = 1; i < trace.points.length; i++) {
        this.ctx.lineTo(trace.points[i].x, trace.points[i].y);
      }

      // Check proximity to mouse
      let proximityBonus = 0;
      if (this.mouse.active) {
        const mid = trace.points[Math.floor(trace.points.length / 2)];
        const dist = Math.hypot(this.mouse.x - mid.x, this.mouse.y - mid.y);
        if (dist < 180) {
          proximityBonus = (1 - dist / 180) * 0.4;
        }
      }

      const currentAlpha = Math.min(1, trace.alpha + trace.energizedAlpha + proximityBonus);

      if (this.state === 'POWERED' || trace.energizedAlpha > 0) {
        this.ctx.strokeStyle = `rgba(88, 164, 176, ${currentAlpha * 0.6})`;
      } else {
        this.ctx.strokeStyle = `rgba(55, 63, 81, ${currentAlpha * 0.5})`;
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

      // Calculate head and tail positions along the path
      const currentDist = progress * packet.trace.totalLength;
      const tailDist = Math.max(0, currentDist - packet.headLength);

      const headPoint = this.getPointAtDistance(packet.trace.points, currentDist);
      const tailPoint = this.getPointAtDistance(packet.trace.points, tailDist);

      // Energize the trace behind the pulse
      packet.trace.energizedAlpha = Math.min(0.8, progress);

      // Draw glowing pulse segment
      this.ctx.beginPath();
      this.ctx.moveTo(tailPoint.x, tailPoint.y);
      this.ctx.lineTo(headPoint.x, headPoint.y);

      this.ctx.strokeStyle = packet.color;
      this.ctx.lineWidth = packet.trace.lineWidth * 2.5;
      this.ctx.shadowColor = packet.color;
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();

      // Bright glowing head spark
      this.ctx.beginPath();
      this.ctx.arc(headPoint.x, headPoint.y, packet.trace.lineWidth * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#58a4b0';
      this.ctx.shadowBlur = 16;
      this.ctx.fill();
    });

    this.ctx.restore();

    // Surge completed!
    if (allFinished && this.state === 'SURGING') {
      this.state = 'POWERED';
      if (this.onSurgeComplete) {
        this.onSurgeComplete();
      }
    }
  }

  drawAmbientPackets(timestamp) {
    // Randomly spawn gentle ambient pulses
    if (Math.random() < 0.04 && this.ambientPackets.length < 8) {
      const trace = this.traces[Math.floor(Math.random() * this.traces.length)];
      this.ambientPackets.push({
        trace,
        startTime: timestamp,
        duration: 1800 + Math.random() * 1200,
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
      this.ctx.arc(head.x, head.y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = packet.color;
      this.ctx.shadowColor = '#58a4b0';
      this.ctx.shadowBlur = 8;
      this.ctx.fill();

      return true;
    });

    this.ctx.restore();
  }

  drawVias() {
    this.ctx.save();
    this.vias.forEach(via => {
      this.ctx.beginPath();
      this.ctx.arc(via.x, via.y, via.radius, 0, Math.PI * 2);

      if (this.state === 'POWERED') {
        this.ctx.fillStyle = 'rgba(88, 164, 176, 0.4)';
        this.ctx.strokeStyle = 'rgba(216, 219, 226, 0.6)';
      } else {
        this.ctx.fillStyle = 'rgba(55, 63, 81, 0.3)';
        this.ctx.strokeStyle = 'rgba(88, 164, 176, 0.25)';
      }

      this.ctx.lineWidth = 1;
      this.ctx.fill();
      this.ctx.stroke();

      // Via inner hole
      this.ctx.beginPath();
      this.ctx.arc(via.x, via.y, via.radius * 0.4, 0, Math.PI * 2);
      this.ctx.fillStyle = '#1b1b1e';
      this.ctx.fill();
    });
    this.ctx.restore();
  }
}

window.CircuitEngine = CircuitEngine;
