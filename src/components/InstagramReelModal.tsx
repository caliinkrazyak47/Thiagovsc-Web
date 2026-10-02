import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Music,
  Maximize2,
} from 'lucide-react';
import { SheetReel } from '../services/sheetsReelsService';
import { audioEngine } from '../utils/audioEngine';

export interface InstagramReelModalProps {
  isOpen: boolean;
  reel?: SheetReel | null;
  reels?: SheetReel[];
  initialIndex?: number;
  onClose: () => void;
  initialFullscreenMode?: boolean;
}

export const InstagramReelModal: React.FC<InstagramReelModalProps> = ({
  isOpen,
  reel,
  reels = [],
  initialIndex = 0,
  onClose,
}) => {
  // Determine available reels list
  const reelList = reels.length > 0 ? reels : reel ? [reel] : [];
  
  // Find current index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // ALWAYS ACTIVATED BY DEFAULT

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const lastWheelTime = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // Sync index when modal opens: activate audio, start playing
  useEffect(() => {
    if (isOpen) {
      if (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < reelList.length) {
        setCurrentIndex(initialIndex);
      } else if (reel) {
        const found = reelList.findIndex((r) => r.id === reel.id || r.shortcode === reel.shortcode);
        setCurrentIndex(found >= 0 ? found : 0);
      } else {
        setCurrentIndex(0);
      }
      setIsMuted(false); // Enable audio on opening
      setIsPlaying(true);
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '0%';
      }
    }
  }, [isOpen, initialIndex, reel, reelList]);

  const currentReel = reelList[currentIndex] || reel || null;

  // Handle Next Reel (Scroll Down)
  const handleNext = useCallback(() => {
    if (reelList.length <= 1) return;
    audioEngine.playClickFx();
    setCurrentIndex((prev) => (prev + 1) % reelList.length);
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }
  }, [reelList.length]);

  // Handle Prev Reel (Scroll Up)
  const handlePrev = useCallback(() => {
    if (reelList.length <= 1) return;
    audioEngine.playClickFx();
    setCurrentIndex((prev) => (prev - 1 + reelList.length) % reelList.length);
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '0%';
    }
  }, [reelList.length]);

  // Keyboard navigation & ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Auto-play video with audio whenever current reel or modal open state changes
  useEffect(() => {
    if (isOpen && videoRef.current && currentReel) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If unmuted autoplay blocked by browser policy without prior gesture, fallback to muted
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    }
  }, [isOpen, currentIndex, currentReel?.shortcode]);

  // Sync mute state dynamically without restarting video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (!isOpen || !currentReel) return null;

  // Wheel listener: scroll down = next, scroll up = prev
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 350) return;
    if (Math.abs(e.deltaY) < 18) return;
    lastWheelTime.current = now;

    if (e.deltaY > 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  // Touch handlers for mobile swipe up / down
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) {
        handleNext(); // Swiped up -> next video
      } else {
        handlePrev(); // Swiped down -> prev video
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setIsMuted((prev) => !prev);
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration && progressBarRef.current) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      progressBarRef.current.style.width = `${pct}%`;
    }
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = pct * videoRef.current.duration;
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${pct * 100}%`;
    }
  };

  // Video URL without excessive cache buster
  const videoStreamUrl = `/api/video-stream/${currentReel.shortcode}`;
  const coverUrl = `/api/cover-image/${currentReel.shortcode}`;

  return (
    <div
      onClick={onClose}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden animate-fadeIn"
    >
      {/* Top Floating Controls Header */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-3">
        <div className="px-3.5 py-1.5 rounded-full bg-black/75 border border-white/20 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D92CFF] shadow-[0_0_10px_#D92CFF] animate-pulse" />
          <span className="text-xs font-mono-tech tracking-wider text-white uppercase font-bold">
            REEL {currentIndex + 1} DE {reelList.length} · TAMAÑO REAL
          </span>
        </div>
      </div>

      {/* Floating Close Button in Top Right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 rounded-full bg-black/75 hover:bg-black border border-white/25 hover:border-[#D92CFF] flex items-center justify-center text-white hover:scale-105 transition-transform cursor-pointer shadow-2xl"
        title="Cerrar reproductor (Esc)"
        aria-label="Cerrar reproductor"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Reel Container (Real Smartphone Reel Aspect Ratio 9:16) */}
      <div className="relative flex items-center justify-center">
        {/* Smartphone 9:16 Video Player Window with Hardware Acceleration */}
        <div
          onClick={togglePlay}
          style={{
            transform: 'translateZ(0)',
            willChange: 'transform',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
          className="relative w-[92vw] sm:w-[440px] md:w-[460px] max-w-[460px] h-[92vh] max-h-[880px] aspect-[9/16] rounded-[36px] overflow-hidden bg-black border-2 border-white/25 shadow-2xl ring-1 ring-white/10 flex flex-col justify-between cursor-pointer group select-none transition-transform"
        >
          {/* Custom Zero-Lag Native HTML5 Video with Byte-Range Streaming */}
          <video
            ref={videoRef}
            key={videoStreamUrl}
            src={videoStreamUrl}
            poster={coverUrl}
            {...({ decoding: 'async', 'webkit-playsinline': 'true', 'x5-playsinline': 'true' } as any)}
            preload="auto"
            autoPlay
            playsInline
            loop
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onCanPlay={() => {
              if (videoRef.current && isPlaying) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current && isPlaying) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          {/* Vignette Gradients for High Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none z-10" />

          {/* Top Bar inside the phone: Sound Toggle, Live Audio Waveform & Status */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 p-4 sm:p-5 flex items-center justify-between pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              {/* Audio Mute/Unmute Toggle */}
              <button
                onClick={toggleMute}
                className={`px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 text-xs font-mono-tech font-bold transition-all cursor-pointer shadow-lg ${
                  !isMuted
                    ? 'bg-[#25F4EE]/20 border-[#25F4EE] text-[#25F4EE] shadow-[0_0_15px_rgba(37,244,238,0.4)]'
                    : 'bg-black/60 border-white/20 text-white/80'
                }`}
                title={isMuted ? 'Activar sonido (M)' : 'Silenciar (M)'}
              >
                {!isMuted ? (
                  <>
                    <Volume2 className="w-4 h-4 text-[#25F4EE]" />
                    <span className="text-[10px] tracking-wider uppercase">AUDIO ACTIVO</span>
                    <span className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 h-3 bg-[#25F4EE] animate-pulse" />
                      <span className="w-0.5 h-2 bg-[#25F4EE] animate-pulse" />
                      <span className="w-0.5 h-2.5 bg-[#25F4EE] animate-pulse" />
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-[#FE2C55]" />
                    <span className="text-[10px] tracking-wider uppercase text-white/70">SILENCIADO</span>
                  </>
                )}
              </button>

              {/* Restart button */}
              <button
                onClick={handleRestart}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white hover:scale-105 transition-all cursor-pointer shadow-md"
                title="Reiniciar video desde el inicio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reel Counter Tag */}
            <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono-tech font-bold text-white tracking-widest uppercase">
              0{currentIndex + 1} / 0{reelList.length}
            </div>
          </div>

          {/* Center Play Indicator when Paused */}
          {!isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/35">
              <div className="w-18 h-18 rounded-full bg-[#D92CFF] flex items-center justify-center text-white shadow-[0_0_40px_rgba(217,44,255,0.85)] scale-110">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Video Info & Progress Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 p-5 pointer-events-auto"
          >
            {/* Creator Username & Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-condensed font-extrabold text-lg text-white tracking-wide uppercase drop-shadow-md">
                {currentReel.creatorHandle || `@${currentReel.username}`}
              </span>
              <span className="w-4 h-4 rounded-full bg-[#25F4EE] text-black text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_#25F4EE]">
                ✓
              </span>
              <span className="ml-auto text-[10px] font-mono-tech text-white/70 uppercase">
                {currentReel.personName}
              </span>
            </div>

            {/* Caption */}
            <p className="text-xs sm:text-sm text-white/90 font-sans leading-relaxed line-clamp-3 drop-shadow-md mb-3">
              {currentReel.caption}
            </p>

            {/* Music track ticker */}
            <div className="flex items-center gap-2 text-xs font-mono-tech text-[#25F4EE] mb-4">
              <Music className="w-3.5 h-3.5 animate-pulse" />
              <span className="truncate">{currentReel.soundName || `${currentReel.username} · Audio Original`}</span>
            </div>

            {/* Interactive Progress Bar */}
            <div
              onClick={handleScrubberClick}
              className="relative w-full h-2 bg-white/25 rounded-full overflow-hidden cursor-pointer group/scrub hover:h-2.5 transition-all"
              title="Haz clic para avanzar o retroceder"
            >
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#25F4EE]"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Vertical Scroll Navigation Buttons (Scroll Up & Down) */}
        {reelList.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex flex-col items-center gap-3 ml-4 z-40"
          >
            {/* Button Scroll Up (Previous Reel) */}
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-black/80 hover:bg-[#D92CFF] border border-white/25 hover:border-[#D92CFF] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xl cursor-pointer"
              title="Reel anterior (Desliza o presiona ↑)"
              aria-label="Reel anterior"
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            {/* Reel Counter Tag */}
            <div className="py-2 px-2.5 rounded-full bg-black/80 border border-white/20 text-xs font-mono-tech font-bold text-white tracking-widest uppercase">
              0{currentIndex + 1} / 0{reelList.length}
            </div>

            {/* Button Scroll Down (Next Reel) */}
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-black/80 hover:bg-[#D92CFF] border border-white/25 hover:border-[#D92CFF] text-white flex items-center justify-center transition-all hover:scale-110 shadow-xl cursor-pointer"
              title="Siguiente reel (Desliza o presiona ↓)"
              aria-label="Siguiente reel"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
