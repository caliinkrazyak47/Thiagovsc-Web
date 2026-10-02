import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Maximize2,
  Check,
  Plus,
  MessageCircle,
  Bookmark,
  Share2,
  Heart,
  Music2,
  Eye,
} from 'lucide-react';
import { TikTokItem, fetchTikTokSheets, FALLBACK_TIKTOK_ITEMS } from '../services/tiktokSheetsService';
import { TikTokModal } from './TikTokModal';
import { audioEngine } from '../utils/audioEngine';

// Authentic TikTok Icon with Cyan & Magenta Chromatic Aberration
export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.887 2.738 2.897 2.897 0 0 1-2.906-2.887 2.897 2.897 0 0 1 2.906-2.887c.334 0 .653.056.953.155V9.324a6.34 6.34 0 0 0-.953-.073A6.346 6.346 0 0 0 3 15.523 6.346 6.346 0 0 0 9.486 21.87a6.346 6.346 0 0 0 6.348-6.347V8.583a8.17 8.17 0 0 0 4.755 1.527V6.665c-.347.014-.68.021-1-.021v.042Z"
      fill="#25F4EE"
      className="translate-x-[-1px] translate-y-[-1px] mix-blend-screen opacity-90"
    />
    <path
      d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.887 2.738 2.897 2.897 0 0 1-2.906-2.887 2.897 2.897 0 0 1 2.906-2.887c.334 0 .653.056.953.155V9.324a6.34 6.34 0 0 0-.953-.073A6.346 6.346 0 0 0 3 15.523 6.346 6.346 0 0 0 9.486 21.87a6.346 6.346 0 0 0 6.348-6.347V8.583a8.17 8.17 0 0 0 4.755 1.527V6.665c-.347.014-.68.021-1-.021v.042Z"
      fill="#FE2C55"
      className="translate-x-[1px] translate-y-[1px] mix-blend-screen opacity-90"
    />
    <path
      d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.887 2.738 2.897 2.897 0 0 1-2.906-2.887 2.897 2.897 0 0 1 2.906-2.887c.334 0 .653.056.953.155V9.324a6.34 6.34 0 0 0-.953-.073A6.346 6.346 0 0 0 3 15.523 6.346 6.346 0 0 0 9.486 21.87a6.346 6.346 0 0 0 6.348-6.347V8.583a8.17 8.17 0 0 0 4.755 1.527V6.665c-.347.014-.68.021-1-.021v.042Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const ReelsSection: React.FC = () => {
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [likedCards, setLikedCards] = useState<{ [id: string]: boolean }>({});
  const [bookmarkedCards, setBookmarkedCards] = useState<{ [id: string]: boolean }>({});
  const [followedState, setFollowedState] = useState<{ [id: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [progresses, setProgresses] = useState<{ [id: string]: number }>({});

  // TikTok Google Sheets dynamic feed state
  const [tiktokItems, setTiktokItems] = useState<TikTokItem[]>(FALLBACK_TIKTOK_ITEMS);

  // TikTok Modal State
  const [activeModalItem, setActiveModalItem] = useState<TikTokItem | null>(null);
  const [activeModalIndex, setActiveModalIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Sync with Google Sheets CSV on mount & auto-update
  useEffect(() => {
    const syncTikTok = () => {
      fetchTikTokSheets(true).then((items) => {
        if (items && items.length > 0) {
          setTiktokItems(items);
        }
      });
    };
    syncTikTok();
    const interval = setInterval(syncTikTok, 20000);
    return () => clearInterval(interval);
  }, []);

  const displayCards = tiktokItems.map((item, index) => {
    const cardNum = (index + 1).toString().padStart(2, '0');
    return {
      id: item.id || `tiktok-${cardNum}`,
      videoId: item.videoId,
      number: cardNum,
      creatorHandle: item.creatorHandle || `@${item.username}`,
      creatorName: item.creatorName || item.username,
      username: item.username,
      profilePic: item.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      description: item.caption,
      videoUrl: item.videoUrl,
      coverUrl: item.coverUrl,
      likes: item.likes,
      comments: item.commentsCount,
      shares: item.shares,
      bookmarks: item.bookmarks,
      views: item.views,
      tags: item.hashtags,
      soundName: item.soundName,
      badge: item.badge || 'VIRAL',
      tiktokItem: item,
    };
  });

  // Open TikTok modal in real size with audio activated
  const handleOpenModal = (card: (typeof displayCards)[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioEngine.playClickFx();
    // Pause inline video before opening fullscreen modal
    const vid = videoRefs.current[card.id];
    if (vid) vid.pause();
    setPlayingCardId(null);

    const idx = displayCards.findIndex((c) => c.id === card.id);
    setActiveModalIndex(idx >= 0 ? idx : 0);
    setActiveModalItem(card.tiktokItem);
    setIsModalOpen(true);
  };

  const handleOpenFullscreen = (card: (typeof displayCards)[0], e?: React.MouseEvent) => {
    handleOpenModal(card, e);
  };

  const handleRestartCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    const vid = videoRefs.current[id];
    if (vid) {
      vid.currentTime = 0;
      vid.play()
        .then(() => setPlayingCardId(id))
        .catch(() => {});
    }
  };

  const handleCardMouseEnter = (id: string) => {
    const vid = videoRefs.current[id];
    if (vid && playingCardId !== id) {
      vid.muted = isMuted;
      vid.play()
        .then(() => setPlayingCardId(id))
        .catch(() => {});
    }
  };

  const handleCardMouseLeave = (id: string) => {
    const vid = videoRefs.current[id];
    if (vid && playingCardId === id) {
      vid.pause();
      setPlayingCardId(null);
    }
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setLikedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setBookmarkedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleFollow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    setFollowedState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = (card: (typeof displayCards)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickFx();
    if (navigator.share) {
      navigator.share({ title: card.description, url: card.tiktokItem.originalUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(card.tiktokItem.originalUrl);
      setCopiedId(card.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleTimeUpdate = (id: string) => {
    const vid = videoRefs.current[id];
    if (vid && vid.duration) {
      const pct = (vid.currentTime / vid.duration) * 100;
      setProgresses((prev) => ({ ...prev, [id]: pct }));
    }
  };

  const handleScrubberClick = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const vid = videoRefs.current[id];
    if (!vid || !vid.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    vid.currentTime = pct * vid.duration;
    setProgresses((prev) => ({ ...prev, [id]: pct * 100 }));
  };

  return (
    <section id="tiktok" className="relative w-full py-24 md:py-32 section-hero-gradient overflow-hidden select-none border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header: Pure TikTok Identity */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12">
          <div>
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider flex items-center gap-3">
              <span className="text-white">TIKTOK</span>
              <span className="bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] bg-clip-text text-transparent">
                FEED.
              </span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 md:mt-0">
            <p className="text-xs sm:text-sm font-mono-tech tracking-[0.15em] text-[#92909B] uppercase">
              TIKTOK · VIDEOS EN VIVO · EXCLUSIVE DROPS
            </p>
          </div>
        </div>

        {/* Video Player Grid Wrapped in MouseTiltCard (Maintains exact position of cards) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${displayCards.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6 md:gap-7`}>
          {displayCards.map((card) => {
            const isPlayingThis = playingCardId === card.id;
            const isLiked = !!likedCards[card.id];
            const isBookmarked = !!bookmarkedCards[card.id];
            const isFollowed = !!followedState[card.id];
            const progress = progresses[card.id] || 0;

            return (
              <div
                key={card.id}
                onMouseEnter={() => handleCardMouseEnter(card.id)}
                onMouseLeave={() => handleCardMouseLeave(card.id)}
                onClick={() => handleOpenModal(card)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/15 bg-black shadow-lg transition-all duration-300 hover:border-white/40 cursor-pointer select-none"
                title="Haz clic para ver a tamaño real con audio"
              >
                  {/* Zero-Lag Faststart HTML5 Video */}
                  <video
                    ref={(el) => {
                      videoRefs.current[card.id] = el;
                    }}
                    src={card.videoUrl}
                    poster={card.coverUrl}
                    preload="auto"
                    playsInline
                    loop
                    muted={isMuted}
                    onTimeUpdate={() => handleTimeUpdate(card.id)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 transform-gpu will-change-transform z-0"
                  >
                    <source src={card.videoUrl} type="video/mp4" />
                    <source src={`/videos/tiktok_${card.videoId}.mp4`} type="video/mp4" />
                    <source src={`/api/tiktok-stream/${card.videoId}`} type="video/mp4" />
                  </video>

                  {/* Dark Vignettes (Top & Bottom Dark gradients for high contrast, clear in center) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95 pointer-events-none z-10" />

                  {/* Top Header: Creator Handle, Views counter badge & Expansion button */}
                  <div className="absolute top-0 left-0 right-0 z-20 p-3.5 sm:p-4 flex items-center justify-between text-white/90">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                      <TikTokIcon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono-tech tracking-wider uppercase font-bold text-white/90">
                        {card.creatorHandle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Visualizaciones reales del video en TikTok */}
                      <div
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#25F4EE]/40 text-[#25F4EE] text-[10px] font-mono-tech font-bold shadow-sm"
                        title="Visualizaciones reales en TikTok"
                      >
                        <Eye className="w-3 h-3 text-[#25F4EE]" />
                        <span>{card.views}</span>
                      </div>

                      {/* Botón Pantalla Completa / Ampliar en la tarjeta */}
                      <button
                        onClick={(e) => handleOpenFullscreen(card, e)}
                        className="p-1.5 rounded-full bg-black/60 border border-white/20 hover:border-[#25F4EE] hover:bg-black/90 text-white/90 hover:text-white transition-all cursor-pointer shadow-md"
                        title="Ver en pantalla completa a tamaño real con audio"
                        aria-label="Solo video en pantalla completa"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Center Play Indicator when Paused */}
                  {!isPlayingThis && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white/90 shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Center Hover Tag */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/30 text-white flex items-center gap-1.5 shadow-xl">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                      <span className="text-[10px] font-mono-tech uppercase font-bold tracking-wider">
                        TAMAÑO REAL CON AUDIO
                      </span>
                    </div>
                  </div>

                  {/* Right Side Vertical Action Bar (TikTok Interactive Controls) */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-2 bottom-3.5 z-30 flex flex-col items-center gap-2 pointer-events-auto"
                  >
                    {/* Creator Avatar with Real Profile Picture and Follow (+) Button */}
                    <div className="relative mb-0.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-black p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                        <img
                          src={card.profilePic}
                          alt={card.creatorName}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <button
                        onClick={(e) => handleToggleFollow(card.id, e)}
                        title={isFollowed ? 'Siguiendo' : 'Seguir creador'}
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md ${
                          isFollowed ? 'bg-[#25F4EE] text-black' : 'bg-[#FE2C55] text-white'
                        }`}
                      >
                        {isFollowed ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                    </div>

                    {/* Heart / Me gusta reales */}
                    <button
                      onClick={(e) => handleToggleLike(card.id, e)}
                      className="group/btn flex flex-col items-center cursor-pointer"
                      title="Me gusta reales en TikTok"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isLiked ? 'text-[#FE2C55] scale-110' : 'text-white/90 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-[#FE2C55]' : 'fill-white/10'}`} />
                      </div>
                      <span className="text-[10px] font-mono-tech font-bold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        {isLiked ? 'Liked' : card.likes}
                      </span>
                    </button>

                    {/* Bookmark / Favoritos reales */}
                    <button
                      onClick={(e) => handleToggleBookmark(card.id, e)}
                      className="group/btn flex flex-col items-center cursor-pointer"
                      title="Favoritos reales en TikTok"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isBookmarked ? 'text-[#FACE15] scale-110' : 'text-white/90 hover:text-white'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 transition-transform ${isBookmarked ? 'fill-[#FACE15]' : 'fill-white/10'}`} />
                      </div>
                      <span className="text-[10px] font-mono-tech font-bold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        {isBookmarked ? 'Saved' : card.bookmarks}
                      </span>
                    </button>

                    {/* Visualizaciones reales */}
                    <div className="flex flex-col items-center" title="Visualizaciones reales en TikTok">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#25F4EE]">
                        <Eye className="w-5 h-5 drop-shadow-[0_0_8px_rgba(37,244,238,0.7)]" />
                      </div>
                      <span className="text-[10px] font-mono-tech font-bold text-[#25F4EE] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        {card.views}
                      </span>
                    </div>

                    {/* Comment Bubble (Abre la modal de TikTok) */}
                    <button
                      onClick={(e) => handleOpenModal(card, e)}
                      className="flex flex-col items-center cursor-pointer"
                      title="Ver en pantalla completa con comentarios"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-[#25F4EE] transition-colors">
                        <MessageCircle className="w-5 h-5 fill-white/10" />
                      </div>
                      <span className="text-[10px] font-mono-tech font-bold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        {card.comments}
                      </span>
                    </button>

                    {/* Share Arrow */}
                    <button
                      onClick={(e) => handleShare(card, e)}
                      className="group/btn relative flex flex-col items-center cursor-pointer"
                      title="Compartir enlace de TikTok"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors">
                        {copiedId === card.id ? <Check className="w-4 h-4 text-[#25F4EE]" /> : <Share2 className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-mono-tech font-bold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                        {copiedId === card.id ? '¡Copiado!' : card.shares}
                      </span>
                    </button>

                    {/* Botón para reiniciar video */}
                    <button
                      onClick={(e) => handleRestartCard(card.id, e)}
                      className="w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:scale-105 transition-all cursor-pointer"
                      title="Reiniciar video desde el inicio"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>

                    {/* Rotating Vinyl Disc Record (Iconic TikTok Element) */}
                    <div className="mt-0.5 relative">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-950 border border-neutral-700 p-0.5 flex items-center justify-center shadow-lg ${
                          isPlayingThis ? 'animate-[spin_4s_linear_infinite]' : ''
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-black" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Left Content (Username, Description/Reseña, Hashtags, Audio Marquee) - Pinned to the Bottom exactly like TikTok */}
                  <div className="absolute left-0 bottom-2.5 right-14 sm:right-16 z-20 p-3.5 pb-1 pointer-events-none flex flex-col justify-end">
                    {/* Verified Creator Profile Pic & Username */}
                    <div className="flex items-center gap-2 mb-2 pointer-events-auto">
                      <a
                        href={card.tiktokItem.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-8 h-8 rounded-full border-2 border-[#25F4EE]/80 overflow-hidden shrink-0 shadow-lg hover:scale-105 transition-transform bg-zinc-900"
                        title={`Ver perfil de ${card.creatorHandle}`}
                      >
                        <img
                          src={card.profilePic}
                          alt={card.creatorHandle}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                      </a>
                      <div className="flex flex-col leading-tight min-w-0">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={card.tiktokItem.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-condensed font-extrabold text-sm sm:text-base text-white tracking-wide hover:underline drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] truncate"
                          >
                            {card.creatorHandle}
                          </a>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#25F4EE] text-black text-[9px] font-black flex items-center justify-center shadow-sm shrink-0">
                            ✓
                          </span>
                        </div>
                        {card.creatorName && (
                          <span className="text-[10px] font-mono-tech text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] truncate">
                            {card.creatorName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description / Reseña */}
                    <p className="text-xs text-white/95 font-sans leading-snug line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mb-1.5">
                      {card.description}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {card.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono-tech font-bold text-[#25F4EE] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Audio Marquee Banner (Sonido Original) */}
                    <div className="flex items-center gap-1.5 overflow-hidden bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10 w-fit max-w-full">
                      <Music2 className="w-3 h-3 text-[#25F4EE] shrink-0 animate-bounce" />
                      <div className="overflow-hidden whitespace-nowrap text-[10px] font-mono-tech text-white/90">
                        <span className="inline-block animate-[marquee_12s_linear_infinite]">
                          {card.soundName} &nbsp; • &nbsp; {card.soundName} &nbsp; • &nbsp;
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Progress Bar Interactivo (Scrubber nativo en la base absoluta) */}
                  <div
                    onClick={(e) => handleScrubberClick(card.id, e)}
                    className="absolute bottom-0 left-0 right-0 z-30 h-[4px] bg-white/20 cursor-pointer group/scrub hover:h-[6px] transition-all"
                    title="Haz clic para avanzar o retroceder el video"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] transition-all duration-100 group-hover/scrub:brightness-125"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
            );
          })}
        </div>

        {/* Call-To-Action Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 flex items-center justify-center">
              <TikTokIcon className="w-7 h-7" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-condensed font-extrabold text-2xl text-white uppercase tracking-wide">
                  @THIAGOVSC_ EN TIKTOK
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FE2C55]/20 border border-[#FE2C55] text-[10px] font-mono-tech text-[#FE2C55] font-bold">
                  VERIFICADO
                </span>
              </div>
              <span className="text-xs font-mono-tech text-[#92909B] tracking-[0.15em] uppercase mt-0.5">
                EXCLUSIVOS · PRODUCCIONES EN DIRECTO · SINCRONIZADO CON GOOGLE SHEETS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reproductor Vertical Oficial de TikTok a Tamaño Real con Audio Activado */}
      <TikTokModal
        isOpen={isModalOpen}
        item={activeModalItem}
        items={displayCards.map((c) => c.tiktokItem)}
        initialIndex={activeModalIndex}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};
