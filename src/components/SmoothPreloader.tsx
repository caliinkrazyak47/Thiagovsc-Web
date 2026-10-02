import React, { useEffect, useRef, useState } from 'react';

interface WaterFillPreloaderProps {
  onComplete?: () => void;
  duration?: number;
}

/**
 * Water Fill Preloader:
 * - Uses the user's authentic signature logo cropped cleanly with zero geometry or background box
 * - Water wave liquid effect incorporates directly into the strokes of the logo
 * - Large original size centered in the middle of the screen
 * - User's exact mathematical wave polygon algorithm (waveClip) with 3 natural pauses
 * - "Cargando.. X%" tabular counter
 * - Slide up exit animation: translateY(-100%) with cubic-bezier(.76, 0, .24, 1)
 */
export const SmoothPreloader: React.FC<WaterFillPreloaderProps> = ({
  onComplete,
  duration = 3200,
}) => {
  const [percent, setPercent] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const fillRef = useRef<HTMLImageElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);

  // Authentic original high-resolution white signature logo
  const logoSrc = '/thiagovsc-logo.png';

  useEffect(() => {
    // Lock scroll during preloader
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const PAUSES = 3;
    const stops = Array.from({ length: PAUSES }, () => 10 + Math.random() * 80).sort((a, b) => a - b);
    const pauseAt = stops.map((p) => ({ p, t: 150 + Math.random() * 350, done: false }));

    let progress = 0;
    let shown = 0;
    let last = performance.now();
    let pauseLeft = 0;
    let animId: number;

    function waveClip(level: number, time: number) {
      const amp = 4 * Math.sin((Math.PI * Math.min(level, 100)) / 100) + (level > 0 && level < 100 ? 1.5 : 0);
      const y0 = 100 - level;
      const pts = ['0% 100%'];
      for (let x = 0; x <= 100; x += 4) {
        const y = y0 + amp * Math.sin((x / 100) * Math.PI * 4 + time / 260);
        pts.push(x + '% ' + Math.max(0, Math.min(100, y)).toFixed(2) + '%');
      }
      pts.push('100% 100%');
      return 'polygon(' + pts.join(',') + ')';
    }

    function frame(now: number) {
      const dt = now - last;
      last = now;

      if (pauseLeft > 0) {
        pauseLeft -= dt;
      } else {
        progress = Math.min(100, progress + (dt / duration) * 100);
        const s = pauseAt.find((o) => !o.done && progress >= o.p);
        if (s) {
          s.done = true;
          pauseLeft = s.t;
        }
      }

      shown += (progress - shown) * 0.12;
      const level = progress >= 100 && shown > 99.5 ? 110 : shown;

      if (fillRef.current) {
        fillRef.current.style.clipPath = waveClip(level, now);
      }

      const displayPct = Math.min(100, Math.round(shown));
      setPercent(displayPct);

      if (level >= 110) {
        setPercent(100);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => {
            setIsRemoved(true);
            document.body.style.overflow = originalOverflow;
            onComplete?.();
          }, 1100);
        }, 350);
        return;
      }

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      document.body.style.overflow = originalOverflow;
    };
  }, [duration, onComplete]);

  if (isRemoved) return null;

  return (
    <div
      ref={preloaderRef}
      id="preloader"
      aria-live="polite"
      className={isDone ? 'done' : ''}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#0e0e0e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        transition: 'transform 1s cubic-bezier(.76, 0, .24, 1)',
        transform: isDone ? 'translateY(-100%)' : 'translateY(0)',
        pointerEvents: isDone ? 'none' : 'auto',
      }}
    >
      {/* Centered Large Logo Container in Original Aspect Ratio (Zero background geometry) */}
      <div
        className="logo"
        style={{
          position: 'relative',
          width: 'clamp(320px, 82vw, 680px)',
          maxWidth: '92vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ghost Base Logo: Faint silhouette of the signature strokes only */}
        <img
          className="ghost"
          id="logoGhost"
          src={logoSrc}
          alt="Thiagovsc Logo"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            opacity: 0.14,
            filter: 'grayscale(1)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Liquid Water Fill Logo: The liquid wave fills directly inside the strokes of the logo */}
        <img
          ref={fillRef}
          className="fill"
          id="logoFill"
          src={logoSrc}
          alt="Water Fill"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            width: '100%',
            height: 'auto',
            clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
            userSelect: 'none',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.45))',
          }}
        />
      </div>

      {/* Counter */}
      <div
        className="counter"
        style={{
          fontSize: '12px',
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: '"Geist Mono", "Helvetica Neue", Arial, sans-serif',
          color: '#f4f4f0',
          opacity: 0.8,
          userSelect: 'none',
        }}
      >
        Cargando.. <span id="pct">{percent}</span>%
      </div>
    </div>
  );
};
