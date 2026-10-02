import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useId,
  useMemo,
} from 'react';

export interface SpeedingTextProps {
  value?: number;
  from?: number;
  words?: string[];
  duration?: number;
  interval?: number;
  swapDuration?: number;
  travel?: number;
  decimals?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
  blurStrength?: number;
  maxBlur?: number;
  showSeparator?: boolean;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  italic?: boolean;
  textColor?: string;
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right';
  startOnView?: boolean;
  loop?: boolean;
  loopDelay?: number;
  paused?: boolean;
  width?: string | number;
  height?: string | number;
  overflow?: 'hidden' | 'visible';
  className?: string;
  style?: React.CSSProperties;
}

// Ease-out-quart: 1 - (1 - t)^4
const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

// Ease-in-out-cubic
const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const SpeedingText: React.FC<SpeedingTextProps> = ({
  value = 20000,
  from = 0,
  words,
  duration = 2200,
  interval = 1400,
  swapDuration = 520,
  travel = 90,
  decimals = 0,
  locale = 'en-US',
  prefix = '',
  suffix = '',
  blurStrength = 1,
  maxBlur = 14,
  showSeparator = true,
  fontSize = 96,
  fontWeight = 700,
  fontFamily,
  italic = true,
  textColor = '#0a0a0a',
  backgroundColor = 'transparent',
  align = 'center',
  startOnView = true,
  loop = false,
  loopDelay = 900,
  paused = false,
  width = '100%',
  height = '100%',
  overflow = 'hidden',
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const feBlurRef = useRef<SVGFEGaussianBlurElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);

  // For words mode
  const outgoingWordRef = useRef<HTMLDivElement | null>(null);
  const incomingWordRef = useRef<HTMLDivElement | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const rawId = useId();
  const filterId = useMemo(
    () => `speeding-blur-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [rawId]
  );

  const [hasEnteredView, setHasEnteredView] = useState(!startOnView);
  const [displayedText, setDisplayedText] = useState<string>('');

  // Track progress and elapsed time for pause/resume
  const elapsedRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const prevProgressRef = useRef<number>(0);
  const rAFRef = useRef<number | null>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  // Number formatter
  const formatNumber = (num: number) => {
    const formatted = new Intl.NumberFormat(locale, {
      useGrouping: showSeparator,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
    return `${prefix}${formatted}${suffix}`;
  };

  // Sizer representation
  const sizerContent = useMemo(() => {
    if (words && words.length > 0) {
      // Find longest word
      const longest = words.reduce(
        (a, b) => (a.length >= b.length ? a : b),
        words[0]
      );
      return `${prefix}${longest}${suffix}`;
    }
    return formatNumber(value);
  }, [words, value, decimals, locale, prefix, suffix, showSeparator]);

  // Reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  // IntersectionObserver for startOnView
  useEffect(() => {
    if (!startOnView || hasEnteredView) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView, hasEnteredView]);

  // Align flex justification
  const justifyStyle = useMemo(() => {
    if (align === 'left') return 'flex-start';
    if (align === 'right') return 'flex-end';
    return 'center';
  }, [align]);

  const transformOrigin = useMemo(() => {
    if (align === 'left') return '0% 50%';
    if (align === 'right') return '100% 50%';
    return '50% 50%';
  }, [align]);

  // ==========================================
  // NUMBER COUNTING MODE
  // ==========================================
  useEffect(() => {
    if (words && words.length > 0) return;

    if (prefersReducedMotion) {
      setDisplayedText(formatNumber(value));
      return;
    }

    if (!hasEnteredView) {
      setDisplayedText(formatNumber(from));
      return;
    }

    // Reset loop timeout and animation
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current as NodeJS.Timeout);
      loopTimeoutRef.current = null;
    }
    if (rAFRef.current) {
      cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
    }

    elapsedRef.current = 0;
    lastTimeRef.current = null;
    prevProgressRef.current = 0;

    const updateLayer = (intensity: number) => {
      const X = Math.min(maxBlur, intensity * maxBlur * blurStrength);
      const Y = X * 0.1;

      if (feBlurRef.current) {
        feBlurRef.current.setAttribute('stdDeviation', `${X} ${Y}`);
      }

      if (textLayerRef.current) {
        if (X < 0.05) {
          textLayerRef.current.style.filter = 'none';
        } else {
          textLayerRef.current.style.filter = `url(#${filterId})`;
        }
        textLayerRef.current.style.transform = `scaleX(${
          1 + intensity * 0.45 * blurStrength
        })`;
        textLayerRef.current.style.transformOrigin = transformOrigin;
      }
    };

    const animate = (timestamp: number) => {
      if (paused) {
        lastTimeRef.current = null;
        rAFRef.current = requestAnimationFrame(animate);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      let dt = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Clamp dt to 50ms to prevent huge skips on tab switch
      if (dt > 50) dt = 50;

      elapsedRef.current += dt;
      const t = Math.min(1, elapsedRef.current / duration);
      const p = easeOutQuart(t);

      // Speed calculation
      let speed = 0;
      if (dt > 0) {
        speed = ((p - prevProgressRef.current) * duration) / dt;
      }
      prevProgressRef.current = p;

      // Maximum speed with easeOutQuart is 4 at t=0
      const intensity = Math.min(1, Math.max(0, speed / 4));
      updateLayer(intensity);

      const currentVal = from + (value - from) * p;
      setDisplayedText(formatNumber(currentVal));

      if (t < 1) {
        rAFRef.current = requestAnimationFrame(animate);
      } else {
        // Complete
        setDisplayedText(formatNumber(value));
        updateLayer(0);

        if (loop) {
          loopTimeoutRef.current = setTimeout(() => {
            elapsedRef.current = 0;
            lastTimeRef.current = null;
            prevProgressRef.current = 0;
            rAFRef.current = requestAnimationFrame(animate);
          }, loopDelay);
        }
      }
    };

    rAFRef.current = requestAnimationFrame(animate);

    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current as NodeJS.Timeout);
    };
  }, [
    words,
    value,
    from,
    duration,
    decimals,
    locale,
    prefix,
    suffix,
    showSeparator,
    hasEnteredView,
    paused,
    loop,
    loopDelay,
    blurStrength,
    maxBlur,
    filterId,
    transformOrigin,
    prefersReducedMotion,
  ]);

  // ==========================================
  // WORDS CYCLING MODE
  // ==========================================
  useLayoutEffect(() => {
    if (!words || words.length === 0) return;

    if (outgoingWordRef.current) {
      outgoingWordRef.current.style.transform = 'translateX(0px) scaleX(1)';
      outgoingWordRef.current.style.opacity = '1';
      outgoingWordRef.current.style.filter = 'none';
    }
    if (incomingWordRef.current) {
      incomingWordRef.current.style.transform = `translateX(${travel}px) scaleX(1)`;
      incomingWordRef.current.style.opacity = '0';
      incomingWordRef.current.style.filter = 'none';
    }
  }, [currentWordIndex, words, travel]);

  useEffect(() => {
    if (!words || words.length === 0) return;

    if (prefersReducedMotion) {
      return;
    }

    if (!hasEnteredView || paused) return;

    let holdTimeout: NodeJS.Timeout | null = null;
    let animId: number | null = null;

    holdTimeout = setTimeout(() => {
      let start: number | null = null;
      let prevP = 0;

      const step = (now: number) => {
        if (!start) start = now;
        let dt = now - (start || now);
        if (dt > 50) dt = 50;

        const rawT = Math.min(1, (now - start) / swapDuration);
        const p = easeInOutCubic(rawT);

        // Maximum derivative of easeInOutCubic is 3 at center
        const speed = rawT > 0 ? ((p - prevP) * swapDuration) / 16.67 : 0;
        prevP = p;
        const intensity = Math.min(1, Math.max(0, speed / 3));

        const X = Math.min(maxBlur, intensity * maxBlur * blurStrength);
        const Y = X * 0.1;

        if (feBlurRef.current) {
          feBlurRef.current.setAttribute('stdDeviation', `${X} ${Y}`);
        }

        const filterStyle = X < 0.05 ? 'none' : `url(#${filterId})`;
        const scale = 1 + intensity * 0.45 * blurStrength;

        // Outgoing word: moves from 0 to -travel, opacity 1 -> 0
        if (outgoingWordRef.current) {
          outgoingWordRef.current.style.transform = `translateX(${
            -travel * p
          }px) scaleX(${scale})`;
          outgoingWordRef.current.style.transformOrigin = transformOrigin;
          outgoingWordRef.current.style.opacity = `${1 - p}`;
          outgoingWordRef.current.style.filter = filterStyle;
        }

        // Incoming word: comes from +travel to 0, opacity 0 -> 1
        if (incomingWordRef.current) {
          incomingWordRef.current.style.transform = `translateX(${
            travel * (1 - p)
          }px) scaleX(${scale})`;
          incomingWordRef.current.style.transformOrigin = transformOrigin;
          incomingWordRef.current.style.opacity = `${p}`;
          incomingWordRef.current.style.filter = filterStyle;
        }

        if (rawT < 1) {
          animId = requestAnimationFrame(step);
        } else {
          // Complete swap
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      };

      animId = requestAnimationFrame(step);
    }, interval);

    return () => {
      if (holdTimeout) clearTimeout(holdTimeout);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [
    words,
    currentWordIndex,
    hasEnteredView,
    paused,
    interval,
    swapDuration,
    travel,
    blurStrength,
    maxBlur,
    filterId,
    transformOrigin,
    prefersReducedMotion,
  ]);

  // Word pairs for words mode
  const currentWord = words ? words[currentWordIndex] : '';
  const nextWord = words ? words[(currentWordIndex + 1) % words.length] : '';

  // Render character spans with keys from the right to animate thousands separators
  const renderFormattedChars = (text: string) => {
    const chars = text.split('');
    return chars.map((char, index) => {
      // Key calculated from the right so adding thousands separators preserves digit keys
      const key = `${chars.length - index}_${char}`;
      const isSeparator = char === ',' || char === '.' || char === ' ';
      return (
        <span
          key={key}
          style={{
            display: 'inline-block',
            animation: isSeparator ? 'speedingFadeIn 420ms ease-out' : undefined,
          }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={`speeding-text-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: justifyStyle,
        width,
        height,
        overflow,
        fontFamily: fontFamily || 'Inter, system-ui, -apple-system, sans-serif',
        fontSize: fontSize !== undefined ? (typeof fontSize === 'number' ? `${fontSize}px` : fontSize) : undefined,
        fontWeight,
        fontStyle: italic ? 'italic' : 'normal',
        color: textColor,
        backgroundColor,
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Inline SVG Filter for horizontal blur */}
      <svg
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-60%" y="-40%" width="220%" height="180%">
            <feGaussianBlur ref={feBlurRef} stdDeviation="0 0" />
          </filter>
        </defs>
      </svg>

      {/* Invisible Sizer Layer to guarantee zero layout shifts */}
      <span
        aria-hidden="true"
        style={{
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {sizerContent}
      </span>

      {/* Visible Layer */}
      {words && words.length > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: justifyStyle,
            whiteSpace: 'nowrap',
          }}
        >
          {/* Outgoing Word Layer */}
          <div
            ref={outgoingWordRef}
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: justifyStyle,
              willChange: 'transform, opacity, filter',
            }}
          >
            {prefix}
            {currentWord}
            {suffix}
          </div>

          {/* Incoming Word Layer */}
          <div
            ref={incomingWordRef}
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: justifyStyle,
              willChange: 'transform, opacity, filter',
              opacity: 0,
            }}
          >
            {prefix}
            {nextWord}
            {suffix}
          </div>
        </div>
      ) : (
        <div
          ref={textLayerRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: justifyStyle,
            whiteSpace: 'nowrap',
            willChange: 'transform, filter',
          }}
        >
          {renderFormattedChars(displayedText || sizerContent)}
        </div>
      )}

      {/* Keyframe for separator fade-in */}
      <style>{`
        @keyframes speedingFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
