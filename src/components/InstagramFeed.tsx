import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  Maximize2,
  Check,
  Instagram,
  ArrowUpRight,
  MessageCircle,
  Bookmark,
  Share2,
  Heart,
  Music,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import MouseTiltCard from '@/ui/components/cards/MouseTiltCard';
import { SheetReel, fetchSheetsReels, FALLBACK_SHEET_REELS } from '../services/sheetsReelsService';
import { InstagramReelModal } from './InstagramReelModal';
import { audioEngine } from '../utils/audioEngine';

const POSTER_GRADIENTS = [
  'radial-gradient(circle at 50% 35%, rgba(217, 44, 255, 0.3) 0%, rgba(19, 11, 30, 0.95) 75%)',
  'radial-gradient(circle at 50% 35%, rgba(37, 244, 238, 0.25) 0%, rgba(8, 16, 28, 0.95) 75%)',
  'radial-gradient(circle at 50% 35%, rgba(254, 44, 85, 0.25) 0%, rgba(24, 8, 16, 0.95) 75%)',
  'radial-gradient(circle at 50% 35%, rgba(113, 54, 255, 0.25) 0%, rgba(16, 8, 30, 0.95) 75%)',
  'radial-gradient(circle at 50% 35%, rgba(240, 59, 190, 0.25) 0%, rgba(20, 8, 26, 0.95) 75%)',
];

export const InstagramFeed: React.FC = () => {
  const [sheetReels, setSheetReels] = useState<SheetReel[]>(FALLBACK_SHEET_REELS);
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [likedCards, setLikedCards] = useState<{ [id: string]: boolean }>({});
  const [bookmarkedCards, setBookmarkedCards] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [progresses, setProgresses] = useState<{ [id: string]: number }>({});

  // Fullscreen Modal State
  const [activeModalIndex, setActiveModalIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Sync dynamically with Google Sheets CSV (Auto-updates every 15s when owner adds new URLs)
  useEffect(() => {
    let isMounted = true;

    const syncReels = () => {
      fetchSheetsReels(true).then((reels) => {
        if (!isMounted || !reels || reels.length === 0) return;
        setSheetReels((prev) => {
          if (prev.length === reels.length) {
            const hasChanged = reels.some(
              (r, i) => r.shortcode !== prev[i]?.shortcode || r.originalUrl !== prev[i]?.originalUrl
            );
            if (!hasChanged) return prev;
          }
          return reels;
        });
      });
    };

    syncReels();
    const interval = setInterval(syncReels, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Map every row from Google Sheets into an authentic Instagram Card
  const cards = useMemo(() => {
    const list = sheetReels.length > 0 ? sheetReels : FALLBACK_SHEET_REELS;
    return list.map((reel, idx) => {
      const cardNum = (idx + 1).toString().padStart(2, '0');
      const personName =
        reel.personName ||
        (reel.username ? reel.username.replace(/_/g, ' ').toUpperCase() : `CREADOR ${cardNum}`);
      const creatorHandle = reel.creatorHandle || `@${reel.username || 'instagram'}`;
      const profileUrl = `https://www.instagram.com/${reel.username || ''}/`;

      return {
        id: reel.id || `reel-${cardNum}`,
        number: cardNum,
        shortcode: reel.shortcode,
        personName,
        username: reel.username,
        handle: creatorHandle,
        profileUrl,
        caption: reel.caption || 'Reseña oficial del Reel de Instagram',
        views: `${(18 + idx * 6.5).toFixed(1)}K`,
        likes: reel.likes || '14.2K',
        shares: reel.shares || '1.8K',
        comments: reel.commentsCount || '48',
        bookmarks: reel.bookmarks || '840',
        hashtags:
          reel.hashtags && reel.hashtags.length > 0
            ? reel.hashtags
            : [`#${reel.username || 'thiago'}`, '#reels', '#lifestyle', '#exclusive'],
        videoUrl: `/api/video-stream/${reel.shortcode}`,
        coverUrl: `/api/cover-image/${reel.shortcode}`,
        posterBg: POSTER_GRADIENTS[idx % POSTER_GRADIENTS.length],
        badge: idx === 0 ? 'EN VIVO' : idx === 1 ? 'NUEVO DROP' : idx === 2 ? 'EXCLUSIVO' : 'TENDENCIA',
        soundName: reel.soundName || `${reel.username || 'Thiago VSC'} · Audio Original`,
        sheetReel: reel,
      };
    });
  }, [sheetReels]);

  // Pause all playing videos when modal opens
  useEffect(() => {
    if (isModalOpen) {
      Object.values(videoRefs.current).forEach((v) => {
        if (v && !v.paused) v.pause();
      });
      setPlayingCardId(null);
    }
  }, [isModalOpen]);

  const handleTogglePlay = useCallback(
    (cardId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      audioEngine.playClickFx();
      const vid = videoRefs.current[cardId];
      if (!vid) return;

      if (playingCardId === cardId && !vid.paused) {
        vid.pause();
        setPlayingCardId(null);
      } else {
        // Pause any other active video
        Object.entries(videoRefs.current).forEach(([id, otherVid]) => {
          if (id !== cardId && otherVid && !otherVid.paused) {
            otherVid.pause();
          }
        });
        vid
          .play()
          .then(() => setPlayingCardId(cardId))
          .catch(() => setPlayingCardId(null));
      }
    },
    [playingCardId]
  );

  const handleToggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setIsMuted((prev) => {
      const next = !prev;
      Object.values(videoRefs.current).forEach((v) => {
        if (v) v.muted = next;
      });
      return next;
    });
  }, []);

  const handleRestart = useCallback(
    (cardId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      audioEngine.playClickFx();
      const vid = videoRefs.current[cardId];
      if (vid) {
        vid.currentTime = 0;
        vid
          .play()
          .then(() => setPlayingCardId(cardId))
          .catch(() => {});
      }
    },
    []
  );

  const handleTimeUpdate = useCallback((cardId: string) => {
    const vid = videoRefs.current[cardId];
    if (!vid || !vid.duration || isNaN(vid.duration)) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    setProgresses((prev) => ({ ...prev, [cardId]: pct }));
  }, []);

  const handleVideoEnded = useCallback((cardId: string) => {
    const vid = videoRefs.current[cardId];
    if (!vid) return;
    vid.currentTime = 0;
    vid
      .play()
      .then(() => setPlayingCardId(cardId))
      .catch(() => setPlayingCardId(null));
  }, []);

  const handleScrubberClick = useCallback((cardId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const vid = videoRefs.current[cardId];
    if (!vid || !vid.duration || isNaN(vid.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    vid.currentTime = pct * vid.duration;
    setProgresses((prev) => ({ ...prev, [cardId]: pct * 100 }));
  }, []);

  const handleOpenModal = useCallback((index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioEngine.playClickFx();
    Object.values(videoRefs.current).forEach((v) => {
      if (v && !v.paused) v.pause();
    });
    setPlayingCardId(null);
    setActiveModalIndex(index);
    setIsModalOpen(true);
  }, []);

  const handleShare = useCallback((card: (typeof cards)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    const url = card.sheetReel.originalUrl || card.profileUrl;
    navigator.clipboard.writeText(url);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleToggleLike = useCallback((cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setLikedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }, []);

  const handleToggleBookmark = useCallback((cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setBookmarkedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }, []);

  // Determine responsive grid columns based on card count
  const gridColsClass = useMemo(() => {
    if (cards.length === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (cards.length === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    if (cards.length === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }, [cards.length]);

  return (
    <section
      id="insta-feed"
      className="relative w-full py-20 md:py-28 section-hero-gradient overflow-hidden select-none border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#D92CFF] animate-pulse shadow-[0_0_8px_#D92CFF]" />
              <span className="text-xs font-mono-tech tracking-[0.25em] text-[#DDD6E5] uppercase font-bold">
                REELS OFICIALES · ACTUALIZACIÓN AUTOMÁTICA
              </span>
            </div>

            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider flex items-center gap-3">
              <span className="text-white">INSTA</span>
              <span className="bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] bg-clip-text text-transparent">
                FEED.
              </span>
            </h2>
          </div>

          {/* Header Right: Real-time counter and Instagram Link */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono-tech text-[#DDD6E5]">
              <Sparkles className="w-3.5 h-3.5 text-[#D92CFF]" />
              <span>
                <strong className="text-white">{cards.length.toString().padStart(2, '0')}</strong> TARJETAS ACTIVAS
              </span>
            </div>

            <a
              href="https://www.instagram.com/thiagovsc/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioEngine.playClickFx()}
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] text-white font-mono-tech text-xs tracking-wider font-bold uppercase hover:scale-[1.02] transition-transform duration-200 cursor-pointer shadow-md"
            >
              <Instagram className="w-4 h-4 text-white" />
              <span>@THIAGOVSC</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* Dynamic Grid: Each URL in Google Sheets creates an authentic Reel Card */}
        <div className={`grid ${gridColsClass} gap-6 sm:gap-8`}>
          {cards.map((card, idx) => {
            const isPlayingThis = playingCardId === card.id;
            const isLiked = !!likedCards[card.id];
            const isBookmarked = !!bookmarkedCards[card.id];
            const currentProgress = progresses[card.id] || 0;

            return (
              <div key={card.id} className="flex flex-col">
                {/* 3D Smartphone Card Container */}
                <MouseTiltCard
                  tiltIntensity={12}
                  scale={1.02}
                  glareIntensity={0.08}
                  className="h-full rounded-[30px]"
                >
                  <div
                    onClick={() => handleTogglePlay(card.id)}
                    className="relative w-full aspect-[9/16] min-h-[560px] max-h-[640px] rounded-[30px] overflow-hidden border-2 border-white/15 hover:border-[#D92CFF]/80 bg-black flex flex-col justify-between cursor-pointer group select-none transition-colors duration-200 shadow-2xl"
                  >
                  {/* High-Performance 60FPS Video */}
                  <video
                    ref={(el) => {
                      videoRefs.current[card.id] = el;
                    }}
                    key={card.videoUrl}
                    src={card.videoUrl}
                    poster={card.coverUrl}
                    {...({ decoding: 'async', 'webkit-playsinline': 'true', 'x5-playsinline': 'true' } as any)}
                    preload="none"
                    playsInline
                    muted={isMuted}
                    onTimeUpdate={() => handleTimeUpdate(card.id)}
                    onEnded={() => handleVideoEnded(card.id)}
                    onPlay={() => setPlayingCardId(card.id)}
                    onPause={() => {
                      if (playingCardId === card.id) setPlayingCardId(null);
                    }}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />

                  {/* Gradient Vignette for perfect text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 pointer-events-none z-10" />

                  {/* Center Play Button: Direct Click to open and play reel in full size */}
                  <div
                    onClick={(e) => handleOpenModal(idx, e)}
                    className="absolute inset-0 z-25 flex items-center justify-center pointer-events-auto"
                    title="Reproducir reel en pantalla completa"
                  >
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-black/80 border-2 border-white/70 hover:border-[#D92CFF] flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 cursor-pointer shadow-xl group/playbtn">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white ml-1 group-hover/playbtn:fill-[#D92CFF] group-hover/playbtn:text-[#D92CFF] transition-colors" />
                    </div>
                  </div>

                  {/* Top Player HUD: Tarjeta Number, Mute, Restart, Fullscreen */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-20 p-4 flex items-center justify-between pointer-events-auto"
                  >
                    <div className="flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-mono-tech tracking-[0.2em] text-white/95 uppercase font-bold">
                        TARJETA #{card.number}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio Mute/Unmute */}
                      <button
                        onClick={handleToggleMute}
                        className="w-7 h-7 rounded-full bg-black/75 hover:bg-black border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                        title={isMuted ? 'Activar audio' : 'Silenciar'}
                      >
                        {isMuted ? (
                          <VolumeX className="w-3.5 h-3.5 text-[#FE2C55]" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-[#25F4EE]" />
                        )}
                      </button>

                      {/* Restart */}
                      <button
                        onClick={(e) => handleRestart(card.id, e)}
                        className="w-7 h-7 rounded-full bg-black/75 hover:bg-black border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                        title="Reiniciar reel"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Fullscreen Modal Launcher */}
                      <button
                        onClick={(e) => handleOpenModal(idx, e)}
                        className="w-7 h-7 rounded-full bg-[#D92CFF] hover:bg-[#F03BBE] border border-white/20 flex items-center justify-center text-white transition-transform hover:scale-105 cursor-pointer shadow-md"
                        title="Modo pantalla completa"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right Floating Vertical Action Bar (Iconic Instagram Interface) */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-3 bottom-20 z-25 flex flex-col items-center gap-3 pointer-events-auto"
                  >
                    {/* Like Button */}
                    <button
                      onClick={(e) => handleToggleLike(card.id, e)}
                      className="flex flex-col items-center gap-0.5 group/act cursor-pointer"
                      title="Me gusta"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          isLiked
                            ? 'bg-[#FE2C55] border-[#FE2C55] text-white shadow-[0_0_12px_rgba(254,44,85,0.6)] scale-110'
                            : 'bg-black/60 backdrop-blur-md border-white/20 text-white hover:scale-105'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                      </div>
                      <span className="text-[10px] font-mono-tech font-bold text-white drop-shadow">
                        {isLiked
                          ? (parseFloat(card.likes.replace('K', '')) + 0.1).toFixed(1) + 'K'
                          : card.likes}
                      </span>
                    </button>

                    {/* Comment Button (Opens modal) */}
                    <button
                      onClick={(e) => handleOpenModal(idx, e)}
                      className="flex flex-col items-center gap-0.5 group/act cursor-pointer"
                      title="Ver comentarios"
                    >
                      <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-105 transition-transform">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono-tech font-bold text-white drop-shadow">
                        {card.comments}
                      </span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={(e) => handleShare(card, e)}
                      className="flex flex-col items-center gap-0.5 group/act cursor-pointer"
                      title="Compartir enlace de Instagram"
                    >
                      <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-105 transition-transform">
                        {copiedId === card.id ? (
                          <Check className="w-4 h-4 text-[#25F4EE]" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono-tech font-bold text-white drop-shadow">
                        {copiedId === card.id ? 'Copiado' : card.shares}
                      </span>
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={(e) => handleToggleBookmark(card.id, e)}
                      className="flex flex-col items-center gap-0.5 group/act cursor-pointer"
                      title="Guardar"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          isBookmarked
                            ? 'bg-[#D92CFF] border-[#D92CFF] text-white shadow-[0_0_12px_rgba(217,44,255,0.6)]'
                            : 'bg-black/60 backdrop-blur-md border-white/20 text-white hover:scale-105'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                      </div>
                    </button>
                  </div>

                  {/* Bottom Content: Handle, Caption, Sound Ticker & Scrubber */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-20 p-4 pointer-events-auto pr-14"
                  >
                    {/* Creator Handle with Verified Check */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <a
                        href={card.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-condensed font-extrabold text-base text-white tracking-wide uppercase hover:underline drop-shadow"
                      >
                        {card.handle}
                      </a>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#25F4EE] text-black text-[9px] font-black flex items-center justify-center">
                        ✓
                      </span>
                    </div>

                    {/* Caption */}
                    <p className="text-xs text-white/95 font-sans leading-relaxed line-clamp-2 drop-shadow mb-2">
                      {card.caption}
                    </p>

                    {/* Audio Track Ticker */}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-[#25F4EE] mb-3">
                      <Music className="w-3 h-3 animate-pulse text-[#D92CFF]" />
                      <span className="truncate">{card.soundName}</span>
                    </div>

                    {/* 60FPS Scrubber Bar */}
                    <div
                      onClick={(e) => handleScrubberClick(card.id, e)}
                      className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group/scrub hover:h-1.5 transition-all"
                      title="Avanzar o retroceder"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#25F4EE]"
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </MouseTiltCard>

                {/* Direct Action Link below the card */}
                <div className="mt-3 flex items-center justify-between px-1">
                  <a
                    href={card.sheetReel.originalUrl || card.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => audioEngine.playClickFx()}
                    className="text-xs font-mono-tech text-[#DDD6E5] hover:text-[#D92CFF] flex items-center gap-1 transition-colors font-bold uppercase tracking-wider"
                  >
                    <span>VER EN INSTAGRAM</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={(e) => handleOpenModal(idx, e)}
                    className="text-xs font-mono-tech text-[#92909B] hover:text-white transition-colors uppercase tracking-wider"
                  >
                    PANTALLA COMPLETA
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reproductor Vertical Modal a Pantalla Completa con Audio y Comentarios */}
      <InstagramReelModal
        isOpen={isModalOpen}
        reel={cards[activeModalIndex]?.sheetReel || sheetReels[activeModalIndex] || FALLBACK_SHEET_REELS[0]}
        reels={cards.map((c) => c.sheetReel)}
        initialIndex={activeModalIndex}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};
