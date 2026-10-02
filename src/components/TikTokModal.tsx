import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Music,
  Plus,
  Check,
  Eye,
} from 'lucide-react';
import { TikTokItem } from '../services/tiktokSheetsService';
import { audioEngine } from '../utils/audioEngine';

export interface TikTokModalProps {
  isOpen: boolean;
  item?: TikTokItem | null;
  items?: TikTokItem[];
  initialIndex?: number;
  onClose: () => void;
}

export const TikTokModal: React.FC<TikTokModalProps> = ({
  isOpen,
  item,
  items = [],
  initialIndex = 0,
  onClose,
}) => {
  const itemList = items.length > 0 ? items : item ? [item] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // TikTok interactive states
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [flyingHearts, setFlyingHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastWheelTime = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const lastTapTime = useRef<number>(0);

  // Sync index when modal opens
  useEffect(() => {
    if (isOpen) {
      if (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < itemList.length) {
        setCurrentIndex(initialIndex);
      } else if (item) {
        const found = itemList.findIndex((it) => it.id === item.id || it.videoId === item.videoId);
        setCurrentIndex(found >= 0 ? found : 0);
      } else {
        setCurrentIndex(0);
      }
      setIsMuted(false);
      setIsPlaying(true);
    }
  }, [isOpen, initialIndex, item, itemList]);

  const currentItem = itemList[currentIndex] || item || null;

  // Next / Prev handlers
  const handleNext = useCallback(() => {
    if (itemList.length <= 1) return;
    audioEngine.playClickFx();
    setCurrentIndex((prev) => (prev + 1) % itemList.length);
    setProgress(0);
  }, [itemList.length]);

  const handlePrev = useCallback(() => {
    if (itemList.length <= 1) return;
    audioEngine.playClickFx();
    setCurrentIndex((prev) => (prev - 1 + itemList.length) % itemList.length);
    setProgress(0);
  }, [itemList.length]);

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

  // Autoplay on slide change
  useEffect(() => {
    if (isOpen && videoRef.current && currentItem) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    }
  }, [isOpen, currentIndex, currentItem?.videoId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (!isOpen || !currentItem) return null;

  // Wheel listener
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 350) return;
    if (Math.abs(e.deltaY) < 18) return;
    lastWheelTime.current = now;

    if (e.deltaY > 0) handleNext();
    else handlePrev();
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > 45) {
      if (deltaY < 0) handleNext();
      else handlePrev();
    }
  };

  // Double tap / double click to heart
  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const isDouble = now - lastTapTime.current < 280;
    lastTapTime.current = now;

    if (isDouble) {
      // Spawn floating TikTok heart
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setFlyingHearts((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setFlyingHearts((prev) => prev.filter((h) => h.id !== id));
      }, 900);

      setLikedMap((prev) => ({ ...prev, [currentItem.id]: true }));
      audioEngine.playClickFx();
      return;
    }

    // Single click toggles play/pause
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

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setLikedMap((prev) => ({ ...prev, [currentItem.id]: !prev[currentItem.id] }));
  };

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setBookmarkedMap((prev) => ({ ...prev, [currentItem.id]: !prev[currentItem.id] }));
  };

  const toggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setFollowedMap((prev) => ({ ...prev, [currentItem.id]: !prev[currentItem.id] }));
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  const isLiked = !!likedMap[currentItem.id];
  const isBookmarked = !!bookmarkedMap[currentItem.id];
  const isFollowed = !!followedMap[currentItem.id];

  return (
    <div
      onClick={onClose}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 select-none overflow-hidden animate-fadeIn"
    >
      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-3">
        <div className="px-3.5 py-1.5 rounded-full bg-black/75 border border-[#25F4EE]/40 backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(37,244,238,0.3)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#25F4EE] shadow-[0_0_10px_#25F4EE] animate-pulse" />
          <span className="text-xs font-mono-tech tracking-wider text-white uppercase font-bold">
            TIKTOK {currentIndex + 1} DE {itemList.length} · REPRODUCTOR OFICIAL
          </span>
        </div>
      </div>

      {/* Floating Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 rounded-full bg-black/75 hover:bg-black/95 border border-white/25 hover:border-[#FE2C55] flex items-center justify-center text-white hover:scale-105 transition-all cursor-pointer shadow-2xl"
        title="Cerrar reproductor (Esc)"
        aria-label="Cerrar reproductor"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main TikTok Phone Container (Exact 9:16 Real Size) */}
      <div className="relative flex items-center justify-center">
        <div
          onClick={handleVideoClick}
          className="relative w-[92vw] sm:w-[440px] md:w-[460px] max-w-[460px] h-[92vh] max-h-[880px] aspect-[9/16] rounded-[36px] overflow-hidden bg-black border-2 border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.98)] ring-1 ring-white/10 flex flex-col justify-between cursor-pointer group select-none transition-transform"
        >
          {/* Native HTML5 Video Element */}
          <video
            ref={videoRef}
            key={currentItem.videoUrl}
            src={currentItem.videoUrl}
            poster={currentItem.coverUrl}
            preload="auto"
            playsInline
            loop
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            className="absolute inset-0 w-full h-full object-cover z-0 transform-gpu will-change-transform"
          >
            <source src={currentItem.videoUrl} type="video/mp4" />
            <source src={`/videos/tiktok_${currentItem.videoId}.mp4`} type="video/mp4" />
            <source src={`/api/tiktok-stream/${currentItem.videoId}`} type="video/mp4" />
          </video>

          {/* Vignette Overlays for High Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none z-10" />

          {/* Floating animated double-tap hearts */}
          {flyingHearts.map((h) => (
            <div
              key={h.id}
              style={{ left: h.x - 40, top: h.y - 40 }}
              className="absolute z-40 pointer-events-none animate-ping text-[#FE2C55] drop-shadow-[0_0_20px_#FE2C55]"
            >
              <Heart className="w-20 h-20 fill-[#FE2C55]" />
            </div>
          ))}

          {/* Top Bar: "Siguiendo | Para ti" & Sound Toggle */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 p-4 sm:p-5 flex items-center justify-between pointer-events-auto"
          >
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className={`px-3 py-1.5 rounded-full border backdrop-blur-md flex items-center gap-2 text-xs font-mono-tech font-bold transition-all cursor-pointer shadow-lg ${
                !isMuted
                  ? 'bg-[#25F4EE]/25 border-[#25F4EE] text-[#25F4EE] shadow-[0_0_15px_rgba(37,244,238,0.5)]'
                  : 'bg-black/60 border-white/20 text-white/80'
              }`}
              title={isMuted ? 'Activar sonido (M)' : 'Silenciar (M)'}
            >
              {!isMuted ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#25F4EE]" />
                  <span className="text-[10px] tracking-wider uppercase font-bold">SONIDO ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#FE2C55]" />
                  <span className="text-[10px] tracking-wider uppercase text-white/70">SILENCIADO</span>
                </>
              )}
            </button>

            {/* TikTok Header Tabs: "Siguiendo | Para ti" */}
            <div className="flex items-center gap-4 text-xs font-sans font-bold">
              <span className="text-white/60 hover:text-white transition-colors cursor-pointer">
                Siguiendo
              </span>
              <span className="text-white border-b-2 border-white pb-0.5 shadow-sm">
                Para ti
              </span>
            </div>

            {/* Views & Counter */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#25F4EE]/40 text-[#25F4EE] text-[11px] font-mono-tech font-bold">
                <Eye className="w-3 h-3 text-[#25F4EE]" />
                <span>{currentItem.views}</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono-tech font-bold text-white tracking-widest uppercase">
                0{currentIndex + 1} / 0{itemList.length}
              </div>
            </div>
          </div>

          {/* Center Play Indicator when Paused */}
          {!isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/35">
              <div className="w-18 h-18 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-[0_0_40px_rgba(0,0,0,0.8)] scale-110">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Right Action Column (Signature TikTok Layout) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 sm:right-4 bottom-20 z-30 flex flex-col items-center gap-4 pointer-events-auto"
          >
            {/* Creator Avatar with Follow Button */}
            <div className="relative mb-2">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-lg bg-zinc-800">
                <img
                  src={currentItem.profilePic}
                  alt={currentItem.creatorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={toggleFollow}
                className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow-md transition-all cursor-pointer ${
                  isFollowed ? 'bg-[#25F4EE] scale-90' : 'bg-[#FE2C55] hover:scale-110'
                }`}
                title={isFollowed ? 'Siguiendo' : 'Seguir creador'}
              >
                {isFollowed ? <Check className="w-3 h-3 text-black stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            </div>

            {/* Like (Heart) Button */}
            <button
              onClick={toggleLike}
              className="flex flex-col items-center gap-1 group/btn cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-115">
                <Heart
                  className={`w-7 h-7 drop-shadow-md transition-colors ${
                    isLiked ? 'fill-[#FE2C55] text-[#FE2C55] scale-110' : 'text-white fill-white/20'
                  }`}
                />
              </div>
              <span className="text-[11px] font-mono-tech font-bold text-white drop-shadow">
                {isLiked ? 'Liked' : currentItem.likes}
              </span>
            </button>

            {/* Comment Button */}
            <button className="flex flex-col items-center gap-1 group/btn cursor-pointer">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-115">
                <MessageCircle className="w-7 h-7 text-white fill-white/20 drop-shadow-md" />
              </div>
              <span className="text-[11px] font-mono-tech font-bold text-white drop-shadow">
                {currentItem.commentsCount}
              </span>
            </button>

            {/* Bookmark / Favorite Button */}
            <button
              onClick={toggleBookmark}
              className="flex flex-col items-center gap-1 group/btn cursor-pointer"
              title="Favoritos reales"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-115">
                <Bookmark
                  className={`w-7 h-7 drop-shadow-md transition-colors ${
                    isBookmarked ? 'fill-[#FFD700] text-[#FFD700] scale-110' : 'text-white fill-white/20'
                  }`}
                />
              </div>
              <span className="text-[11px] font-mono-tech font-bold text-white drop-shadow">
                {currentItem.bookmarks}
              </span>
            </button>

            {/* Visualizaciones reales */}
            <div
              className="flex flex-col items-center gap-1 cursor-default"
              title="Visualizaciones reales en TikTok"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#25F4EE]">
                <Eye className="w-7 h-7 drop-shadow-[0_0_10px_rgba(37,244,238,0.7)]" />
              </div>
              <span className="text-[11px] font-mono-tech font-bold text-[#25F4EE] drop-shadow">
                {currentItem.views}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: currentItem.caption, url: currentItem.originalUrl }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(currentItem.originalUrl);
                  audioEngine.playClickFx();
                }
              }}
              className="flex flex-col items-center gap-1 group/btn cursor-pointer"
              title="Compartir TikTok"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover/btn:scale-115">
                <Share2 className="w-7 h-7 text-white fill-white/20 drop-shadow-md" />
              </div>
              <span className="text-[11px] font-mono-tech font-bold text-white drop-shadow">
                {currentItem.shares}
              </span>
            </button>

            {/* Rotating Vinyl Disc Record (Iconic TikTok Element) */}
            <div className="mt-2 relative flex items-center justify-center">
              <div className={`w-11 h-11 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-700 border-2 border-zinc-900 p-1 shadow-2xl flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/40">
                  <img
                    src={currentItem.profilePic}
                    alt="record"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Floating music note icon */}
              {isPlaying && (
                <div className="absolute -top-3 -left-2 text-[#25F4EE] animate-bounce pointer-events-none">
                  <Music className="w-3.5 h-3.5 drop-shadow-[0_0_8px_#25F4EE]" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Left Content: Username, Caption & Sound Marquee */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 p-5 pr-20 pointer-events-auto"
          >
            {/* Creator Username with Verified Checkmark */}
            <div className="flex items-center gap-2 mb-2">
              <a
                href={currentItem.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-base text-white tracking-wide hover:underline drop-shadow-md flex items-center gap-1.5"
              >
                <span>{currentItem.creatorHandle}</span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#25F4EE] text-black text-[9px] font-black flex items-center justify-center shadow-[0_0_6px_#25F4EE]">
                  ✓
                </span>
              </a>
              <span className="text-[11px] font-mono-tech text-white/70 uppercase">
                · {currentItem.creatorName}
              </span>
            </div>

            {/* Caption */}
            <p className="text-xs sm:text-sm text-white/95 font-sans leading-relaxed line-clamp-3 drop-shadow mb-3">
              {currentItem.caption}
            </p>

            {/* Music track ticker with animated note */}
            <div className="flex items-center gap-2 text-xs font-sans text-white/90 drop-shadow mb-3 overflow-hidden">
              <Music className="w-3.5 h-3.5 text-[#25F4EE] shrink-0 animate-pulse" />
              <div className="truncate">
                <span>{currentItem.soundName}</span>
              </div>
            </div>

            {/* Interactive Scrubber Bar */}
            <div
              onClick={(e) => {
                if (!videoRef.current || !videoRef.current.duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, clickX / rect.width));
                videoRef.current.currentTime = pct * videoRef.current.duration;
                setProgress(pct * 100);
              }}
              className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
              title="Haz clic para avanzar o retroceder"
            >
              <div
                className="h-full bg-gradient-to-r from-[#25F4EE] via-[#00F2FE] to-[#FE2C55] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Up / Down Navigation Buttons for Desktop */}
        {itemList.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex flex-col items-center gap-3 ml-4 z-40"
          >
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-black/80 hover:bg-[#25F4EE] hover:text-black border border-white/25 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xl cursor-pointer"
              title="TikTok anterior (Desliza o presiona ↑)"
              aria-label="TikTok anterior"
            >
              <ChevronUp className="w-6 h-6" />
            </button>

            <div className="py-2 px-2.5 rounded-full bg-black/80 border border-white/20 text-xs font-mono-tech font-bold text-white tracking-widest uppercase">
              0{currentIndex + 1} / 0{itemList.length}
            </div>

            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-black/80 hover:bg-[#FE2C55] border border-white/25 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xl cursor-pointer"
              title="Siguiente TikTok (Desliza o presiona ↓)"
              aria-label="Siguiente TikTok"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
