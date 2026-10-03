import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Tv,
  Flame,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

// YouTube Live Playlist ID & Default Video from User
const YOUTUBE_PLAYLIST_ID = 'PLALJOp7e_srk';
const DEFAULT_VIDEO_ID = 'gFZfwWZV074';

export interface TVVideoTrack {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  views: string;
  genre: string;
  duration?: string;
}

// Minimal Urban Logo Marquee Preview at the bottom of the section
export const LogoMarqueePreview: React.FC = () => {
  const brands = [
    'RENTLUX VIP',
    'THIAGOVSC TV',
    'DOLBY ATMOS',
    'SONY 4K HDR',
    'LIVE BROADCAST',
    'URBAN BEATS',
    'STREET CULTURE',
    'HIGH FIDELITY',
  ];

  return (
    <div className="w-full mt-16 sm:mt-20 pt-8 pb-4 border-t border-white/10 overflow-hidden select-none opacity-60 hover:opacity-100 transition-opacity">
      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap">
        {brands.concat(brands).map((brand, i) => (
          <div key={`brand-${i}`} className="flex items-center gap-6 shrink-0">
            <span className="text-xs sm:text-sm font-mono-tech tracking-[0.25em] text-[#92909B] uppercase font-bold hover:text-[#25F4EE] transition-colors">
              {brand}
            </span>
            <span className="text-[#D92CFF] text-[10px]">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};


export const VideosSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Unmuted by default
  const [volume, setVolume] = useState(85);
  const [isShuffle, setIsShuffle] = useState(true); // Random playlist by default
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOsd, setShowOsd] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Live video info pulled dynamically from the YouTube Playlist
  const [currentVideoInfo, setCurrentVideoInfo] = useState<{
    title: string;
    artist: string;
    views: string;
    genre: string;
  }>({
    title: 'THIAGOVSC TV · SESIÓN EN VIVO',
    artist: 'THIAGOVSC',
    views: '4K ULTRA HD',
    genre: 'URBAN LATIN / 4K LIVE',
  });

  const [channelNumber, setChannelNumber] = useState(1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const osdTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const stallWatchdogRef = useRef<NodeJS.Timeout | number | null>(null);
  const skipDebounceRef = useRef<boolean>(false);

   // Embed URL pointing directly to the live YouTube Playlist with 1080p HD parameters and closed captions completely disabled
  const initialEmbedUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `https://www.youtube.com/embed/${DEFAULT_VIDEO_ID}?list=${YOUTUBE_PLAYLIST_ID}&listType=playlist&enablejsapi=1&autoplay=1&playsinline=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&cc_load_policy=0&loop=1&vq=hd1080&hd=1&origin=${encodeURIComponent(
      origin
    )}`;
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger OSD for 3 seconds on track change
  const triggerOsd = useCallback(() => {
    setShowOsd(true);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current as NodeJS.Timeout);
    osdTimerRef.current = setTimeout(() => {
      setShowOsd(false);
    }, 3200);
  }, []);

    // Enforce locked 1080p Full HD (or highest available HD/4K) quality via API & postMessage bridging, and completely disable CC/subtitles
  const forceMaximumQuality = useCallback((player: any) => {
    // 1. Direct API quality & subtitle enforcement
    if (player) {
      try {
        // Disable subtitles/captions
        player.unloadModule?.('captions');
        player.unloadModule?.('cc');
        player.setOption?.('captions', 'track', {});

        // Force maximum quality
        const available = player.getAvailableQualityLevels?.() || [];
        if (available.includes('hd1080')) {
          player.setPlaybackQuality('hd1080');
        } else if (available.includes('hd1440')) {
          player.setPlaybackQuality('hd1440');
        } else if (available.includes('hd2160')) {
          player.setPlaybackQuality('hd2160');
        } else if (available.includes('highres')) {
          player.setPlaybackQuality('highres');
        } else if (available.includes('hd720')) {
          player.setPlaybackQuality('hd720');
        } else {
          player.setPlaybackQuality('hd1080');
        }
        if (typeof player.setPlaybackQualityRange === 'function') {
          player.setPlaybackQualityRange('hd1080', 'highres');
        }
      } catch {}
    }

    // 2. Direct postMessage socket injection into iframe window (bypasses UI throttling)
    try {
      if (iframeRef.current?.contentWindow) {
        const target = iframeRef.current.contentWindow;
        
        // Force 1080p/HighRes quality
        target.postMessage(
          JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd1080'] }),
          '*'
        );
        target.postMessage(
          JSON.stringify({ event: 'command', func: 'setPlaybackQualityRange', args: ['hd1080', 'highres'] }),
          '*'
        );
        
        // Force disable captions modules
        target.postMessage(
          JSON.stringify({ event: 'command', func: 'unloadModule', args: ['captions'] }),
          '*'
        );
        target.postMessage(
          JSON.stringify({ event: 'command', func: 'unloadModule', args: ['cc'] }),
          '*'
        );
      }
    } catch {}
  }, []);

  // Fetch and update video metadata dynamically from YouTube
  const updateCurrentVideoData = useCallback((player: any) => {
    if (!player) return;
    try {
      const data = player.getVideoData?.();
      if (data && data.title) {
        setCurrentVideoInfo({
          title: data.title.toUpperCase(),
          artist: (data.author || 'THIAGOVSC TV').toUpperCase(),
          views: '4K ULTRA HD',
          genre: 'URBAN LATIN / 4K LIVE',
        });
      }
      const playlistIdx = player.getPlaylistIndex?.();
      if (typeof playlistIdx === 'number' && playlistIdx >= 0) {
        setChannelNumber(playlistIdx + 1);
      } else {
        setChannelNumber((prev) => (prev % 99) + 1);
      }
    } catch {}
  }, []);

  // Clear watchdog timer
  const clearStallWatchdog = useCallback(() => {
    if (stallWatchdogRef.current) {
      clearTimeout(stallWatchdogRef.current as NodeJS.Timeout);
      stallWatchdogRef.current = null;
    }
  }, []);

  // Next Video in Playlist (with debounce protection)
  const handleNext = useCallback(() => {
    if (skipDebounceRef.current) return;
    skipDebounceRef.current = true;
    setTimeout(() => {
      skipDebounceRef.current = false;
    }, 600);

    triggerOsd();
    if (playerRef.current) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 85);
        setIsMuted(false);
        if (typeof playerRef.current.nextVideo === 'function') {
          playerRef.current.nextVideo();
        }
        forceMaximumQuality(playerRef.current);
      } catch {}
    }
  }, [triggerOsd, forceMaximumQuality, volume]);

  // Previous Video in Playlist
  const handlePrev = useCallback(() => {
    if (skipDebounceRef.current) return;
    skipDebounceRef.current = true;
    setTimeout(() => {
      skipDebounceRef.current = false;
    }, 600);

    triggerOsd();
    if (playerRef.current) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 85);
        setIsMuted(false);
        if (typeof playerRef.current.previousVideo === 'function') {
          playerRef.current.previousVideo();
        }
        forceMaximumQuality(playerRef.current);
      } catch {}
    }
  }, [triggerOsd, forceMaximumQuality, volume]);

  // Start watchdog timer if a video stalls or fails to transition to PLAYING (e.g. unavailable video)
  const startStallWatchdog = useCallback(() => {
    clearStallWatchdog();
    stallWatchdogRef.current = setTimeout(() => {
      // If still stalled or unstarted after 2.2 seconds, silently auto-skip to next video
      if (playerRef.current) {
        try {
          const state = playerRef.current.getPlayerState?.();
          if (state !== 1 && state !== 2) {
            handleNext();
          }
        } catch {}
      }
    }, 2200);
  }, [clearStallWatchdog, handleNext]);

  // Unmute automatically upon any user interaction on page if initially restricted by browser
  useEffect(() => {
    const handleInitialUserGesture = () => {
      if (playerRef.current) {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume || 85);
          setIsMuted(false);
          playerRef.current.playVideo();
        } catch {}
      }
    };

    window.addEventListener('pointerdown', handleInitialUserGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleInitialUserGesture, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', handleInitialUserGesture);
      window.removeEventListener('keydown', handleInitialUserGesture);
    };
  }, [volume]);

  // Initialize YouTube IFrame API with Live Playlist & Silent Auto-Skip on Error
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;

    const onYouTubeIframeAPIReady = () => {
      if (typeof window !== 'undefined' && (window as any).YT && (window as any).YT.Player) {
        try {
          playerRef.current = new (window as any).YT.Player('youtube-player-frame', {
            events: {
              onReady: (event: any) => {
                try {
                  forceMaximumQuality(event.target);

                  // 1. Activate Shuffle and Loop
                  if (typeof event.target.setShuffle === 'function') {
                    event.target.setShuffle(true);
                  }
                  if (typeof event.target.setLoop === 'function') {
                    event.target.setLoop(true);
                  }

                  // 2. Start at a random video index (avoiding always starting at video #1)
                  const playlistTracks = event.target.getPlaylist?.() || [];
                  if (playlistTracks.length > 1) {
                    const randomIdx = Math.floor(Math.random() * (playlistTracks.length - 1)) + 1;
                    if (typeof event.target.playVideoAt === 'function') {
                      event.target.playVideoAt(randomIdx);
                    } else if (typeof event.target.nextVideo === 'function') {
                      event.target.nextVideo();
                    }
                  } else if (typeof event.target.nextVideo === 'function') {
                    event.target.nextVideo();
                  }

                  event.target.unMute();
                  event.target.setVolume(volume || 85);
                  setIsMuted(false);
                  event.target.playVideo();
                  setIsPlaying(true);

                  updateCurrentVideoData(event.target);
                } catch (err) {
                  try {
                    event.target.playVideo();
                  } catch {}
                }
              },
              onPlaybackQualityChange: (event: any) => {
                const currentQuality = event.data;
                if (
                  currentQuality &&
                  currentQuality !== 'hd1080' &&
                  currentQuality !== 'hd1440' &&
                  currentQuality !== 'hd2160' &&
                  currentQuality !== 'highres'
                ) {
                  forceMaximumQuality(event.target);
                }
              },
              onStateChange: (event: any) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING, -1 = UNSTARTED
                if (event.data === 1) {
                  setIsPlaying(true);
                  audioEngine.pause();
                  clearStallWatchdog();
                  forceMaximumQuality(event.target);
                  // Ensure 1080p quality is locked after stream metadata settles
                  setTimeout(() => forceMaximumQuality(event.target), 300);
                  setTimeout(() => forceMaximumQuality(event.target), 1200);
                  updateCurrentVideoData(event.target);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                  clearStallWatchdog();
                } else if (event.data === 0) {
                  // End of video -> move to next
                  try {
                    event.target.nextVideo();
                  } catch {}
                } else if (event.data === 3 || event.data === -1) {
                  startStallWatchdog();
                }
              },
              onError: (event: any) => {
                // Video not available (codes 2, 5, 100, 101, 150) -> auto-skip immediately without freezing
                clearStallWatchdog();
                try {
                  if (typeof event?.target?.nextVideo === 'function') {
                    event.target.nextVideo();
                  } else if (playerRef.current?.nextVideo) {
                    playerRef.current.nextVideo();
                  }
                  // Backup skip if next video was also restricted
                  setTimeout(() => {
                    try {
                      if (playerRef.current?.getPlayerState?.() === -1) {
                        playerRef.current?.nextVideo?.();
                      }
                    } catch {}
                  }, 400);
                } catch {}
              },
            },
          });
        } catch (err) {
          console.warn('YT.Player initialization fallback:', err);
        }
      }
    };

    if (typeof window !== 'undefined') {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
      } else if ((window as any).YT.Player) {
        onYouTubeIframeAPIReady();
      } else {
        checkInterval = setInterval(() => {
          if ((window as any).YT?.Player) {
            clearInterval(checkInterval!);
            onYouTubeIframeAPIReady();
          }
        }, 150);
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      clearStallWatchdog();
    };
  }, [clearStallWatchdog, forceMaximumQuality, startStallWatchdog, updateCurrentVideoData, volume]);

  // Progress update timer (1s interval for optimal CPU performance)
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current) {
          try {
            const cur = playerRef.current.getCurrentTime?.() || 0;
            const dur = playerRef.current.getDuration?.() || 0;
            setCurrentTime(cur);
            setDuration(dur);
          } catch {}
        }
      }, 1000);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current as NodeJS.Timeout);
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current as NodeJS.Timeout);
    };
  }, [isPlaying]);

  // Listen to Global App Audio Events: 'app-unmute-video' & 'app-mute-video'
  useEffect(() => {
    const handleUnmute = () => {
      setIsMuted(false);
      if (playerRef.current?.unMute) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    };

    const handleMute = () => {
      setIsMuted(true);
      if (playerRef.current?.mute) {
        playerRef.current.mute();
      }
    };

    window.addEventListener('app-unmute-video', handleUnmute);
    window.addEventListener('app-mute-video', handleMute);
    return () => {
      window.removeEventListener('app-unmute-video', handleUnmute);
      window.removeEventListener('app-mute-video', handleMute);
    };
  }, [volume]);

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    audioEngine.playClickFx();
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        audioEngine.pause();
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 85);
        setIsMuted(false);
        playerRef.current.playVideo();
        forceMaximumQuality(playerRef.current);
        setIsPlaying(true);
      }
    } catch (e) {
      console.warn('Error toggling play:', e);
    }
  }, [isPlaying, volume, forceMaximumQuality]);

  // Toggle Mute / Unmute
  const toggleMute = useCallback(() => {
    audioEngine.playClickFx();
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 85);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.warn('Error toggling mute:', e);
    }
  }, [isMuted, volume]);

  // Volume Change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value, 10);
    setVolume(newVol);
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(newVol);
        if (newVol > 0 && playerRef.current.isMuted()) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
      } catch {}
    }
  }, []);

  // Scrubber Seek
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = pct * duration;
    try {
      playerRef.current.seekTo(targetTime, true);
      setCurrentTime(targetTime);
    } catch {}
  }, [duration]);

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    audioEngine.playClickFx();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Fullscreen Auto-Hide Controls on inactivity
  const handleMouseMove = useCallback(() => {
    if (!isFullscreen) return;
    setControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current as NodeJS.Timeout);
    hideControlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, [isFullscreen]);

  // Initial OSD trigger
  useEffect(() => {
    triggerOsd();
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const channelDisplay = channelNumber.toString().padStart(2, '0');

  // LED Volume segments (10 steps)
  const volumeSegments = 10;
  const activeSegments = isMuted ? 0 : Math.round((volume / 100) * volumeSegments);

  return (
    <section
      id="tv-online"
      className="relative w-full py-20 md:py-28 section-hero-gradient overflow-hidden select-none border-t border-white/10 px-4 sm:px-6 lg:px-8"
    >
      {/* Atmospheric Concrete Texture / Neon Ambient Backing */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(37,244,238,0.12)_0%,rgba(217,44,255,0.08)_45%,transparent_75%)] pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[350px] bg-gradient-to-r from-[#25F4EE]/15 via-[#D92CFF]/20 to-[#7136FF]/15 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header: Urban Live Broadcast Brand */}
        <div className="text-center mb-10 sm:mb-14">
                    <h2 className="flex items-center justify-center gap-3 text-4xl sm:text-6xl md:text-7xl font-condensed font-black tracking-tight uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            <span className="text-white">TV</span>
            <span className="bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] bg-clip-text text-transparent">
              ONLINE
            </span>
          </h2>

                    {/* Aesthetic Cyber/Neon Underline */}
          <div className="mx-auto mt-4 flex items-center justify-center gap-2">
            <div className="h-[2px] w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#D92CFF] opacity-80" />
            <div className="h-1.5 w-6 rounded-full bg-[#F03BBE] shadow-[0_0_12px_#F03BBE]" />
            <div className="h-[2px] w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#7136FF] opacity-80" />
          </div>
          
          <p className="mt-4 text-xs sm:text-sm font-mono-tech text-[#DDD6E5]/80 max-w-xl mx-auto uppercase tracking-wider">
            Streaming ininterrumpido en alta fidelidad · Sesiones oficiales y videoclips de la cultura urbana
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 1. CARCASA DE LA TELEVISIÓN MODERNA URBANA */}
        {/* ========================================================================= */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className={`relative mx-auto transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-[999] w-screen h-screen bg-black flex flex-col justify-center items-center'
              : 'w-full max-w-5xl'
          }`}
        >
          {/* TV Outer Neon Glow Aura */}
          {!isFullscreen && (
            <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-[#25F4EE]/25 via-[#D92CFF]/30 to-[#7136FF]/25 rounded-[40px] blur-2xl -z-10 opacity-75 pointer-events-none" />
          )}

          {/* Physical TV Chassis Container */}
          <div
            className={`relative w-full bg-[#181520] border-4 border-[#2d273a] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.12),inset_0_-4px_8px_rgba(0,0,0,0.8)] ${
              isFullscreen
                ? 'w-full h-full border-0 rounded-0 p-0 bg-black'
                : 'rounded-[26px] sm:rounded-[36px] p-3 sm:p-5'
            }`}
          >
            {/* Urban Sticker Bomb / Duct Tape Details on the Frame */}
            {!isFullscreen && (
              <>
                {/* Top-Left Sticker: THIAGOVSC VIP PASS */}
                <div className="absolute -top-3.5 -left-2 z-30 transform -rotate-6 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#25F4EE] text-black font-condensed font-black text-xs uppercase tracking-wider shadow-lg border border-black/30 pointer-events-none select-none">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>VIP ON-AIR PASS</span>
                </div>

                {/* Top-Right Duct Tape: Silver industrial tape */}
                <div
                  className="absolute -top-3 right-6 z-30 w-20 h-6 bg-gradient-to-r from-neutral-400 via-neutral-200 to-neutral-500 opacity-80 transform rotate-3 shadow-md border-y border-white/20 pointer-events-none select-none hidden sm:block"
                  style={{ clipPath: 'polygon(0% 0%, 100% 5%, 95% 100%, 5% 95%)' }}
                />

                {/* Bottom-Left Sticker: RENTLUX */}
                <div className="absolute -bottom-3 left-8 z-30 transform rotate-4 hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#D92CFF] text-white font-mono-tech text-[10px] font-extrabold uppercase tracking-widest shadow-md border border-white/20 pointer-events-none">
                  <span>RENTLUX ✦ ALTA GAMA</span>
                </div>
              </>
            )}

            {/* ===================================================================== */}
            {/* 2. PANTALLA DE LA TV (SCREEN - CRYSTAL CLEAR 4K NO LAG) */}
            {/* ===================================================================== */}
            <div
              className={`relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center ${
                isFullscreen ? 'h-full aspect-auto rounded-none' : 'rounded-2xl sm:rounded-[24px]'
              }`}
              style={{ transform: 'translateZ(0)', willChange: 'transform' }}
            >
              {/* Stable YouTube IFrame API Element with live playlist & 4k quality */}
              <iframe
                id="youtube-player-frame"
                ref={iframeRef}
                src={initialEmbedUrl}
                title="TV Online Stream"
                className="absolute inset-0 w-full h-full pointer-events-none object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ transform: 'translateZ(0)' }}
              />

              {/* Click-to-Play/Pause Invisible Overlay */}
              <div
                onClick={togglePlay}
                className="absolute inset-0 z-20 cursor-pointer"
                title={isPlaying ? 'Pausar emisión (Espacio)' : 'Reproducir emisión con sonido (Espacio)'}
              />

              {/* On-Screen Display (OSD): Channel, Time & Quality Badge */}
              <div
                className={`absolute top-4 left-4 z-30 flex items-center gap-2.5 transition-opacity duration-500 pointer-events-none ${
                  showOsd || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="px-3 py-1 rounded bg-black/80 border border-[#25F4EE]/60 shadow-[0_0_12px_rgba(37,244,238,0.4)] backdrop-blur-md flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#25F4EE] animate-ping" />
                  <span className="font-mono-tech text-xs sm:text-sm font-bold text-[#25F4EE] tracking-wider">
                    CH {channelDisplay}
                  </span>
                  <span className="text-white/40 text-[10px]">|</span>
                  <span className="font-mono-tech text-[10px] text-white/90 uppercase font-semibold">
                    {currentVideoInfo.genre}
                  </span>
                </div>
              </div>

              {/* Top-Right OSD: Live Broadcast Clock & 4K Quality Flag */}
              <div
                className={`absolute top-4 right-4 z-30 flex items-center gap-2 transition-opacity duration-500 pointer-events-none ${
                  showOsd || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="px-2.5 py-1 rounded bg-black/80 border border-white/20 backdrop-blur-md font-mono-tech text-[10px] sm:text-xs text-white/90 font-bold flex items-center gap-1.5">
                  <span className="text-[#25F4EE] font-black">4K ULTRA HD · 60FPS</span>
                  <span className="text-white/40">·</span>
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>

              {/* Center Large Pause Icon when Paused */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 z-25 flex items-center justify-center cursor-pointer pointer-events-auto bg-black/30 backdrop-blur-[2px]"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/85 border-2 border-[#25F4EE] flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-[0_0_30px_rgba(37,244,238,0.5)] group/pbtn">
                    <Play className="w-9 h-9 sm:w-11 sm:h-11 fill-[#25F4EE] text-[#25F4EE] ml-1.5 group-hover/pbtn:scale-105 transition-transform" />
                  </div>
                </div>
              )}

              {/* Bottom Screen Ticker Bar: Live Current Track Info & Flame Views */}
              <div className="absolute bottom-0 inset-x-0 z-25 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-6 pb-2.5 px-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3 overflow-hidden pr-4">
                  <div className="px-2 py-0.5 rounded bg-red-600/90 text-white font-mono-tech text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    EN EL AIRE
                  </div>

                  <div className="overflow-hidden whitespace-nowrap">
                    <div className="animate-marquee inline-block font-condensed font-extrabold text-sm sm:text-base md:text-lg text-white tracking-wide uppercase">
                      <span className="text-[#25F4EE] mr-2">✦ {currentVideoInfo.artist}</span>
                      <span className="mr-8">— {currentVideoInfo.title}</span>
                      <span className="text-[#D92CFF] mr-2">✦ {currentVideoInfo.artist}</span>
                      <span className="mr-8">— {currentVideoInfo.title}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] font-mono-tech text-amber-300 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                  <span>{currentVideoInfo.views}</span>
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* TV BOTTOM BEZEL BAR: Logo, Speaker Grille, On Air Indicator & Power LED */}
            {/* ===================================================================== */}
            {!isFullscreen && (
              <div className="mt-3 px-2 sm:px-4 flex items-center justify-between">
                {/* Left: Speaker Dot Grille */}
                <div className="flex items-center gap-1 opacity-40 hidden sm:flex">
                  <div className="w-1 h-1 rounded-full bg-white/70" />
                  <div className="w-1 h-1 rounded-full bg-white/70" />
                  <div className="w-1 h-1 rounded-full bg-white/70" />
                  <div className="w-1 h-1 rounded-full bg-white/70" />
                  <div className="w-1 h-1 rounded-full bg-white/70" />
                </div>

                {/* Center: TV ONLINE Urban Display Logo */}
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#25F4EE]" />
                  <span className="font-condensed font-black tracking-[0.25em] text-sm sm:text-base text-white/90 uppercase drop-shadow">
                    THIAGOVSC · TV ONLINE
                  </span>
                </div>

                {/* Right: ON AIR pulsing badge & Green Power LED */}
                <div className="flex items-center gap-3">
                  <div
                    className={`px-2 py-0.5 rounded text-[9px] font-mono-tech font-black uppercase tracking-wider transition-colors ${
                      isPlaying
                        ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    ON AIR
                  </div>

                  {/* Power LED */}
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#25F4EE] shadow-[0_0_8px_#25F4EE] animate-pulse" />
                    <span className="text-[9px] font-mono-tech text-[#25F4EE]/70 uppercase hidden sm:inline">
                      PWR
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* TV STAND LEGS & GROUND SHADOW */}
          {/* ========================================================================= */}
          {!isFullscreen && (
            <>
              <div className="flex justify-between px-16 sm:px-28 -mt-1 pointer-events-none">
                {/* Left Leg */}
                <div
                  className="w-10 sm:w-14 h-4 sm:h-6 bg-gradient-to-b from-[#2d273a] to-[#120a1d] border-b-2 border-[#25F4EE]/40 shadow-xl"
                  style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
                />
                {/* Right Leg */}
                <div
                  className="w-10 sm:w-14 h-4 sm:h-6 bg-gradient-to-b from-[#2d273a] to-[#120a1d] border-b-2 border-[#D92CFF]/40 shadow-xl"
                  style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
                />
              </div>

              {/* Diffuse Ground Shadow */}
              <div className="w-[85%] mx-auto h-4 bg-black/80 blur-lg rounded-full -mt-2 pointer-events-none" />
            </>
          )}

          {/* ========================================================================= */}
          {/* 3. PANEL DE CONTROL = "MANDO / CONSOLA FÍSICA" */}
          {/* ========================================================================= */}
          <div
            className={`mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#150d22]/90 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 ${
              isFullscreen
                ? `absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl bg-black/90 transition-opacity duration-300 ${
                    controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`
                : ''
            }`}
          >
            {/* Fine VU/Tape Scrubber Bar */}
            <div className="flex items-center gap-3">
              <span className="font-mono-tech text-[11px] text-[#25F4EE] font-bold w-10 text-right">
                {formatTime(currentTime)}
              </span>

              <div
                onClick={handleSeek}
                className="relative flex-1 h-2 sm:h-2.5 bg-black/80 rounded-full overflow-hidden cursor-pointer border border-white/10 group/scrub"
                title="Buscar posición"
              >
                {/* Progress Gradient Track */}
                <div
                  className="h-full bg-gradient-to-r from-[#25F4EE] via-[#D92CFF] to-[#F03BBE] relative transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_#25F4EE] opacity-0 group-hover/scrub:opacity-100 transition-opacity" />
                </div>
              </div>

              <span className="font-mono-tech text-[11px] text-[#92909B] font-bold w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Tactile Control Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Left Group: Shuffle & Channel Navigation */}
              <div className="flex items-center gap-2">
                {/* Shuffle Button */}
                <button
                  onClick={() => {
                    audioEngine.playClickFx();
                    setIsShuffle((prev) => {
                      const next = !prev;
                      if (playerRef.current?.setShuffle) {
                        playerRef.current.setShuffle(next);
                      }
                      return next;
                    });
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md ${
                    isShuffle
                      ? 'bg-[#25F4EE] border-[#25F4EE] text-black shadow-[0_0_12px_rgba(37,244,238,0.6)]'
                      : 'bg-[#201533] hover:bg-[#2c1d45] border-white/15 text-white'
                  }`}
                  title={isShuffle ? 'Modo aleatorio activado' : 'Activar modo aleatorio'}
                  aria-label="Reproducción aleatoria"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Previous Video Button */}
                <button
                  onClick={handlePrev}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#201533] hover:bg-[#2c1d45] border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 shadow-md"
                  title="Canal anterior (J)"
                  aria-label="Vídeo anterior"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Main Central Play / Pause Button with Neon Aura */}
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#25F4EE] to-[#D92CFF] hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-all cursor-pointer shadow-[0_0_20px_rgba(37,244,238,0.6)] border-2 border-white/80"
                  title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir con sonido (Espacio)'}
                  aria-label={isPlaying ? 'Pausar emisión' : 'Reproducir emisión'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-black text-black" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black text-black ml-0.5" />
                  )}
                </button>

                {/* Next Video Button */}
                <button
                  onClick={handleNext}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#201533] hover:bg-[#2c1d45] border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 shadow-md"
                  title="Siguiente canal (K)"
                  aria-label="Siguiente vídeo"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Center/Right Group: 10-Segment LED VU Volume & Fullscreen */}
              <div className="flex items-center gap-3">
                {/* Mute Button */}
                <button
                  onClick={toggleMute}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md ${
                    isMuted
                      ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'bg-[#201533] hover:bg-[#2c1d45] border-white/15 text-white'
                  }`}
                  title={isMuted ? 'Activar sonido (M)' : 'Silenciar (M)'}
                  aria-label="Control de sonido"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* 10-Segment LED Volume VU Meter */}
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-black/60 border border-white/10">
                  {Array.from({ length: volumeSegments }).map((_, i) => {
                    const isActive = i < activeSegments;
                    return (
                      <div
                        key={`vu-${i}`}
                        className={`w-1.5 h-3.5 rounded-sm transition-all duration-150 ${
                          isActive
                            ? i < 5
                              ? 'bg-[#25F4EE] shadow-[0_0_6px_#25F4EE]'
                              : i < 8
                              ? 'bg-[#D92CFF] shadow-[0_0_6px_#D92CFF]'
                              : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
                            : 'bg-white/15'
                        }`}
                      />
                    );
                  })}

                  {/* Range slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 ml-2 accent-[#25F4EE] cursor-pointer"
                    title={`Volumen: ${isMuted ? 0 : volume}%`}
                    aria-label="Nivel de volumen"
                  />
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#201533] hover:bg-[#D92CFF] hover:border-[#D92CFF] border border-white/15 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95 shadow-md"
                  title="Pantalla completa (F)"
                  aria-label="Alternar pantalla completa"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Footer Logo Marquee of the TV Section */}
        <LogoMarqueePreview />
      </div>
    </section>
  );
};
