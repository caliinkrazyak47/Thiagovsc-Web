import React, { useRef, useEffect, useCallback, useState } from 'react';

export interface CursorAnimationsProps {
  trailStyle?: 'constellation' | 'ribbon' | 'comet' | 'bubbles';
  trailColor?: string;
  particleSize?: number;
  trailIntensity?: number;
  fadeSpeed?: number;
  flowSpeed?: number;
  backgroundColor?: string;
  zIndex?: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  birth: number;
  vx: number;
  vy: number;
}

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

interface CometSpark {
  x: number;
  y: number;
  size: number;
  opacity: number;
  birth: number;
  vx: number;
  vy: number;
  rotation: number;
  twinkle: number;
}

interface Bubble {
  x: number;
  y: number;
  size: number;
  opacity: number;
  birth: number;
  vx: number;
  vy: number;
  wobble: number;
  wobbleSpeed: number;
}

function parseColor(color: string): RGB {
  const fallback: RGB = { r: 217, g: 44, b: 255 }; // #D92CFF
  if (!color) return fallback;

  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      };
    }
  }

  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  const hslMatch = color.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;
    if (s === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v };
    }
    const hue2rgb = (p: number, q: number, t: number) => {
      let val = t;
      if (val < 0) val += 1;
      if (val > 1) val -= 1;
      if (val < 1 / 6) return p + (q - p) * 6 * val;
      if (val < 1 / 2) return q;
      if (val < 2 / 3) return p + (q - p) * (2 / 3 - val) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
  }

  return fallback;
}

export const CursorAnimations: React.FC<CursorAnimationsProps> = ({
  trailStyle = 'constellation',
  trailColor = '#D92CFF',
  particleSize = 6,
  trailIntensity = 6,
  fadeSpeed = 0.4,
  flowSpeed = 0.6,
  backgroundColor = 'transparent',
  zIndex = 9999,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailPointsRef = useRef<TrailPoint[]>([]);
  const cometSparksRef = useRef<CometSpark[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });
  const isVisibleRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const rgbRef = useRef<RGB>(parseColor(trailColor));
  const trailColorRef = useRef(trailColor);
  const trailStyleRef = useRef(trailStyle);

  useEffect(() => {
    rgbRef.current = parseColor(trailColor);
    trailColorRef.current = trailColor;
  }, [trailColor]);

  useEffect(() => {
    trailStyleRef.current = trailStyle;
    particlesRef.current = [];
    trailPointsRef.current = [];
    cometSparksRef.current = [];
    bubblesRef.current = [];
  }, [trailStyle]);

  // Check for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mediaQuery.matches;
    const handleChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Resize canvas with high DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Spawn particles for constellation mode
  const spawnParticles = useCallback(
    (x: number, y: number, vx: number, vy: number) => {
      const now = performance.now();
      const count = Math.min(trailIntensity, 8);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const spread = particleSize * 0.2;
        particlesRef.current.push({
          x: x + Math.cos(angle) * spread * Math.random(),
          y: y + Math.sin(angle) * spread * Math.random(),
          size: particleSize * (0.8 + Math.random() * 0.4),
          opacity: 1,
          birth: now,
          vx: vx * flowSpeed * 0.1 + (Math.random() - 0.5) * 8,
          vy: vy * flowSpeed * 0.1 + (Math.random() - 0.5) * 8,
        });
      }
      if (particlesRef.current.length > 100) {
        particlesRef.current = particlesRef.current.slice(-100);
      }
    },
    [trailIntensity, particleSize, flowSpeed]
  );

  // Mouse & Touch Tracking
  useEffect(() => {
    if (reducedMotionRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    let lastTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();
      const dt = Math.max((now - lastTime) / 1000, 0.001);
      lastTime = now;
      const vx = (x - mouseRef.current.lastX) / dt;
      const vy = (y - mouseRef.current.lastY) / dt;
      mouseRef.current = { x, y, lastX: x, lastY: y };
      const dist = Math.sqrt(vx * vx + vy * vy) * dt;

      if (dist > 1.5) {
        if (trailStyleRef.current === 'constellation') {
          spawnParticles(x, y, vx, vy);
        } else if (trailStyleRef.current === 'ribbon') {
          trailPointsRef.current.push({ x, y, time: now });
          const maxPoints = Math.floor(trailIntensity * 15);
          if (trailPointsRef.current.length > maxPoints) {
            trailPointsRef.current = trailPointsRef.current.slice(-maxPoints);
          }
        } else if (trailStyleRef.current === 'comet') {
          const sparkCount = Math.floor(trailIntensity * 0.6);
          for (let i = 0; i < sparkCount; i++) {
            const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 1.2;
            const speed = Math.random() * 2 + 0.5;
            cometSparksRef.current.push({
              x: x + (Math.random() - 0.5) * 6,
              y: y + (Math.random() - 0.5) * 6,
              size: particleSize * (0.2 + Math.random() * 0.5),
              opacity: 0.8 + Math.random() * 0.2,
              birth: now,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              rotation: Math.random() * Math.PI * 2,
              twinkle: Math.random() * Math.PI * 2,
            });
          }
          if (cometSparksRef.current.length > 120) {
            cometSparksRef.current = cometSparksRef.current.slice(-120);
          }
        } else if (trailStyleRef.current === 'bubbles') {
          const bubbleCount = Math.floor(trailIntensity * 0.4);
          for (let i = 0; i < bubbleCount; i++) {
            bubblesRef.current.push({
              x: x + (Math.random() - 0.5) * 20,
              y: y + (Math.random() - 0.5) * 20,
              size: particleSize * (0.6 + Math.random() * 1.2),
              opacity: 0.4 + Math.random() * 0.3,
              birth: now,
              vx: (Math.random() - 0.5) * 2,
              vy: -Math.random() * 2 - 0.5,
              wobble: Math.random() * Math.PI * 2,
              wobbleSpeed: 0.03 + Math.random() * 0.04,
            });
          }
          if (bubblesRef.current.length > 80) {
            bubblesRef.current = bubblesRef.current.slice(-80);
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        const now = performance.now();
        const dt = Math.max((now - lastTime) / 1000, 0.001);
        lastTime = now;
        const vx = (x - mouseRef.current.lastX) / dt;
        const vy = (y - mouseRef.current.lastY) / dt;
        mouseRef.current = { x, y, lastX: x, lastY: y };
        const dist = Math.sqrt(vx * vx + vy * vy) * dt;

        if (dist > 1.5) {
          if (trailStyleRef.current === 'constellation') {
            spawnParticles(x, y, vx, vy);
          } else if (trailStyleRef.current === 'ribbon') {
            trailPointsRef.current.push({ x, y, time: now });
            const maxPoints = Math.floor(trailIntensity * 15);
            if (trailPointsRef.current.length > maxPoints) {
              trailPointsRef.current = trailPointsRef.current.slice(-maxPoints);
            }
          } else if (trailStyleRef.current === 'comet') {
            const sparkCount = Math.floor(trailIntensity * 0.6);
            for (let i = 0; i < sparkCount; i++) {
              const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 1.2;
              const speed = Math.random() * 2 + 0.5;
              cometSparksRef.current.push({
                x: x + (Math.random() - 0.5) * 6,
                y: y + (Math.random() - 0.5) * 6,
                size: particleSize * (0.2 + Math.random() * 0.5),
                opacity: 0.8 + Math.random() * 0.2,
                birth: now,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rotation: Math.random() * Math.PI * 2,
                twinkle: Math.random() * Math.PI * 2,
              });
            }
            if (cometSparksRef.current.length > 120) {
              cometSparksRef.current = cometSparksRef.current.slice(-120);
            }
          } else if (trailStyleRef.current === 'bubbles') {
            const bubbleCount = Math.floor(trailIntensity * 0.4);
            for (let i = 0; i < bubbleCount; i++) {
              bubblesRef.current.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                size: particleSize * (0.6 + Math.random() * 1.2),
                opacity: 0.4 + Math.random() * 0.3,
                birth: now,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2 - 0.5,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.03 + Math.random() * 0.04,
              });
            }
            if (bubblesRef.current.length > 80) {
              bubblesRef.current = bubblesRef.current.slice(-80);
            }
          }
        }
      }
    };

    const rect = container.getBoundingClientRect();
    mouseRef.current = {
      x: rect.width / 2,
      y: rect.height / 2,
      lastX: rect.width / 2,
      lastY: rect.height / 2,
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [spawnParticles, trailIntensity, particleSize]);

  // Main Animation Loop with zero-lag scroll optimization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxAge = fadeSpeed * 1000;
    let isScrolling = false;
    let scrollTimeout: number;

    const handleScroll = () => {
      isScrolling = true;
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        isScrolling = false;
      }, 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Draw Ribbon Style
    const drawRibbon = (points: TrailPoint[], now: number) => {
      if (points.length < 2) return;
      const rgb = rgbRef.current;
      const baseWidth = particleSize * 2;
      const activePoints = points.filter((p) => now - p.time < maxAge);
      trailPointsRef.current = activePoints;
      if (activePoints.length < 2) return;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < activePoints.length; i++) {
        const p0 = activePoints[i - 1];
        const p1 = activePoints[i];
        const age0 = (now - p0.time) / maxAge;
        const age1 = (now - p1.time) / maxAge;
        const opacity = Math.pow(1 - age1, 2) * 0.85;
        const width = baseWidth * (1 - age1 * 0.7);
        if (width < 0.5) continue;

        const gradient = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        const opacity0 = Math.pow(1 - age0, 2) * 0.85;
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity0})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);

        if (i < activePoints.length - 1) {
          const p2 = activePoints[i + 1];
          const cpX = p1.x;
          const cpY = p1.y;
          const endX = (p1.x + p2.x) / 2;
          const endY = (p1.y + p2.y) / 2;
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        } else {
          ctx.lineTo(p1.x, p1.y);
        }
        ctx.stroke();
      }

      if (activePoints.length > 0) {
        const tip = activePoints[activePoints.length - 1];
        const tipGlow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, baseWidth * 1.5);
        tipGlow.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
        tipGlow.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
        tipGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, baseWidth * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = tipGlow;
        ctx.fill();
      }
    };

    // Draw Comet Style
    const drawComet = (now: number) => {
      const rgb = rgbRef.current;
      const newSparks: CometSpark[] = [];

      for (const spark of cometSparksRef.current) {
        const age = now - spark.birth;
        if (age > maxAge) continue;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.98;
        spark.vy *= 0.98;
        spark.twinkle += 0.15;

        const normalizedAge = age / maxAge;
        const baseFade = Math.pow(1 - normalizedAge, 2);
        const twinkleFactor = 0.7 + 0.3 * Math.sin(spark.twinkle);
        spark.opacity = baseFade * twinkleFactor;
        const size = spark.size * (1 - normalizedAge * 0.5);
        if (size < 0.5) continue;

        ctx.save();
        ctx.translate(spark.x, spark.y);
        ctx.rotate(spark.rotation + normalizedAge * 2);

        const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
        innerGlow.addColorStop(0, `rgba(255, 255, 255, ${spark.opacity * 0.9})`);
        innerGlow.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${spark.opacity * 0.7})`);
        innerGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = innerGlow;
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 255, 255, ${spark.opacity * 0.6})`;
        ctx.lineWidth = size * 0.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-size * 1.2, 0);
        ctx.lineTo(size * 1.2, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.2);
        ctx.lineTo(0, size * 1.2);
        ctx.stroke();
        ctx.restore();

        newSparks.push(spark);
      }
      cometSparksRef.current = newSparks;

      const headX = mouseRef.current.x;
      const headY = mouseRef.current.y;
      const headSize = particleSize * 1.2;

      const outerGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 3);
      outerGlow.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);
      outerGlow.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
      outerGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      ctx.beginPath();
      ctx.arc(headX, headY, headSize * 3, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      const midGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 1.5);
      midGlow.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
      midGlow.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`);
      midGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      ctx.beginPath();
      ctx.arc(headX, headY, headSize * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = midGlow;
      ctx.fill();

      const coreGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headSize * 0.7);
      coreGlow.addColorStop(0, `rgba(255, 255, 255, 1)`);
      coreGlow.addColorStop(0.6, `rgba(255, 255, 255, 0.8)`);
      coreGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
      ctx.beginPath();
      ctx.arc(headX, headY, headSize * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow;
      ctx.fill();
    };

    // Draw Bubbles Style
    const drawBubbles = (now: number) => {
      const rgb = rgbRef.current;
      const newBubbles: Bubble[] = [];

      for (const bubble of bubblesRef.current) {
        const age = now - bubble.birth;
        if (age > maxAge * 1.5) continue;
        bubble.wobble += bubble.wobbleSpeed;
        bubble.x += bubble.vx + Math.sin(bubble.wobble) * 0.5;
        bubble.y += bubble.vy;
        bubble.vy *= 0.995;
        bubble.vx *= 0.98;

        const normalizedAge = age / (maxAge * 1.5);
        const fadeOut = normalizedAge > 0.7 ? 1 - (normalizedAge - 0.7) / 0.3 : 1;
        bubble.opacity = bubble.opacity * fadeOut;
        const size = bubble.size * (1 + normalizedAge * 0.3);
        if (bubble.opacity < 0.05) continue;

        ctx.save();
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bubble.opacity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const bubbleGradient = ctx.createRadialGradient(
          bubble.x - size * 0.3,
          bubble.y - size * 0.3,
          0,
          bubble.x,
          bubble.y,
          size
        );
        bubbleGradient.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.3})`);
        bubbleGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bubble.opacity * 0.15})`);
        bubbleGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bubble.opacity * 0.05})`);
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, size, 0, Math.PI * 2);
        ctx.fillStyle = bubbleGradient;
        ctx.fill();

        const highlightSize = size * 0.35;
        const highlightX = bubble.x - size * 0.35;
        const highlightY = bubble.y - size * 0.35;
        const highlight = ctx.createRadialGradient(
          highlightX,
          highlightY,
          0,
          highlightX,
          highlightY,
          highlightSize
        );
        highlight.addColorStop(0, `rgba(255, 255, 255, ${bubble.opacity * 0.7})`);
        highlight.addColorStop(1, `rgba(255, 255, 255, 0)`);
        ctx.beginPath();
        ctx.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2);
        ctx.fillStyle = highlight;
        ctx.fill();

        const smallHighlightX = bubble.x + size * 0.25;
        const smallHighlightY = bubble.y + size * 0.3;
        const smallHighlightSize = size * 0.15;
        ctx.beginPath();
        ctx.arc(smallHighlightX, smallHighlightY, smallHighlightSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.4})`;
        ctx.fill();
        ctx.restore();

        newBubbles.push(bubble);
      }
      bubblesRef.current = newBubbles;

      const cursorX = mouseRef.current.x;
      const cursorY = mouseRef.current.y;
      const cursorSize = particleSize * 0.8;
      const cursorGlow = ctx.createRadialGradient(
        cursorX,
        cursorY,
        0,
        cursorX,
        cursorY,
        cursorSize * 2
      );
      cursorGlow.addColorStop(0, `rgba(255, 255, 255, 0.5)`);
      cursorGlow.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
      cursorGlow.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, cursorSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = cursorGlow;
      ctx.fill();
    };

    // Draw Constellation Style (Connected nodes web + core dot)
    const drawConstellation = (now: number) => {
      const newParticles: Particle[] = [];
      const rgb = rgbRef.current;

      for (const particle of particlesRef.current) {
        const age = now - particle.birth;
        if (age > maxAge) continue;
        particle.vx *= 0.96;
        particle.vy *= 0.96;
        particle.x += particle.vx * 0.016;
        particle.y += particle.vy * 0.016;

        const normalizedAge = age / maxAge;
        particle.opacity = Math.pow(1 - normalizedAge, 1.5);
        const size = particle.size * (1 - normalizedAge * 0.2);

        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          size
        );
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`);
        gradient.addColorStop(0.7, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        newParticles.push(particle);
      }

      // Draw connections
      const connectLimit = Math.min(newParticles.length, 40);
      ctx.lineWidth = 1;
      for (let i = 0; i < connectLimit; i++) {
        const p1 = newParticles[i];
        for (let j = i + 1; j < Math.min(i + 5, connectLimit); j++) {
          const p2 = newParticles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < particleSize * 5) {
            const opacity = (1 - dist / (particleSize * 5)) * p1.opacity * p2.opacity * 0.5;
            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      particlesRef.current = newParticles;

      // Draw cursor dot
      const cursorSize = particleSize * 1.5;
      const rgb2 = rgbRef.current;

      const glowGradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        cursorSize * 2.5
      );
      glowGradient.addColorStop(0, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.4)`);
      glowGradient.addColorStop(1, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0)`);
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, cursorSize * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      const coreGradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        cursorSize
      );
      coreGradient.addColorStop(0, `rgba(255, 255, 255, 0.9)`);
      coreGradient.addColorStop(0.3, trailColorRef.current);
      coreGradient.addColorStop(1, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.8)`);
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, cursorSize, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();
    };

    let lastCleared = false;

    const animate = () => {
      if (!isVisibleRef.current || reducedMotionRef.current || isScrolling) {
        if (!lastCleared) {
          const rect = containerRef.current?.getBoundingClientRect();
          const width = rect?.width || window.innerWidth;
          const height = rect?.height || window.innerHeight;
          ctx.clearRect(0, 0, width, height);
          lastCleared = true;
        }
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastCleared = false;
      const now = performance.now();
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || window.innerWidth;
      const height = rect?.height || window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      if (trailStyleRef.current === 'ribbon') {
        drawRibbon(trailPointsRef.current, now);
      } else if (trailStyleRef.current === 'comet') {
        drawComet(now);
      } else if (trailStyleRef.current === 'bubbles') {
        drawBubbles(now);
      } else {
        drawConstellation(now);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(scrollTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [fadeSpeed, particleSize]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex,
        backgroundColor,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
