import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  ListMusic,
  Radio,
  Search,
  ExternalLink,
  Airplay,
  Share2,
  Check,
  Sparkles,
} from 'lucide-react';
import Hls from 'hls.js';
import { RadioStation, RADIO_STATIONS } from '../data/radioStations';
import { audioEngine } from '../utils/audioEngine';

export interface RadioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStationId?: string;
}

export const RadioPlayerModal: React.FC<RadioPlayerModalProps> = ({
  isOpen,
  onClose,
  initialStationId,
}) => {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [showStationList, setShowStationList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasError, setHasError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const currentStation: RadioStation = RADIO_STATIONS[currentStationIndex] || RADIO_STATIONS[0];

  // Initialize station and manage audio engine collisions
  useEffect(() => {
    if (isOpen) {
      audioEngine.pause();
      if (initialStationId) {
        const found = RADIO_STATIONS.findIndex((s) => s.id === initialStationId);
        if (found >= 0) setCurrentStationIndex(found);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setIsPlaying(false);
      setIsLoading(false);
      setShowStationList(false);
    }
  }, [isOpen, initialStationId]);

  // Audio streaming handler (Direct MP3/AAC and HLS m3u8)
  const playStation = useCallback(
    (station: RadioStation) => {
      setHasError(false);
      setIsLoading(true);

      const audio = audioRef.current;
      if (!audio) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const isHls = station.streamUrl.endsWith('.m3u8') || station.streamUrl.includes('.m3u8');

      if (isHls) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          });
          hlsRef.current = hls;

          hls.loadSource(station.streamUrl);
          hls.attachMedia(audio);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.volume = isMuted ? 0 : volume;
            audio
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(() => {
                setIsLoading(false);
                setIsPlaying(false);
              });
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  hls.destroy();
                  setHasError(true);
                  setIsLoading(false);
                  setIsPlaying(false);
                  break;
              }
            }
          });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = station.streamUrl;
          audio.volume = isMuted ? 0 : volume;
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch(() => {
              setIsLoading(false);
              setIsPlaying(false);
            });
        }
      } else {
        audio.src = station.streamUrl;
        audio.volume = isMuted ? 0 : volume;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            if (station.backupStreamUrl) {
              audio.src = station.backupStreamUrl;
              audio
                .play()
                .then(() => {
                  setIsPlaying(true);
                  setIsLoading(false);
                })
                .catch(() => {
                  setIsLoading(false);
                  setIsPlaying(false);
                  setHasError(true);
                });
            } else {
              setIsLoading(false);
              setIsPlaying(false);
              setHasError(true);
            }
          });
      }
    },
    [isMuted, volume]
  );

  const handleSelectStation = useCallback(
    (index: number) => {
      audioEngine.playClickFx();
      setCurrentStationIndex(index);
      playStation(RADIO_STATIONS[index]);
    },
    [playStation]
  );

  const handleTogglePlay = useCallback(() => {
    audioEngine.playClickFx();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      playStation(currentStation);
    }
  }, [isPlaying, currentStation, playStation]);

  const handleNext = useCallback(() => {
    audioEngine.playClickFx();
    const nextIdx = (currentStationIndex + 1) % RADIO_STATIONS.length;
    handleSelectStation(nextIdx);
  }, [currentStationIndex, handleSelectStation]);

  const handlePrev = useCallback(() => {
    audioEngine.playClickFx();
    const prevIdx = (currentStationIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    handleSelectStation(prevIdx);
  }, [currentStationIndex, handleSelectStation]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
    if (val === 0) setIsMuted(true);
    else if (isMuted) setIsMuted(false);
  };

  const handleToggleMute = () => {
    audioEngine.playClickFx();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  const handleShareStation = () => {
    audioEngine.playClickFx();
    navigator.clipboard.writeText(currentStation.streamUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showStationList) {
          setShowStationList(false);
        } else {
          onClose();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'l' || e.key === 'L') {
        setShowStationList((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showStationList, onClose, handleTogglePlay, handleNext, handlePrev]);

  // Start playback on open
  useEffect(() => {
    if (isOpen) {
      playStation(currentStation);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStations = RADIO_STATIONS.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q)
    );
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn overflow-hidden"
    >
      <audio
        ref={audioRef}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Apple Music Signature Dynamic Vibrant Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 opacity-60">
        <div
          className="absolute -top-[20%] -left-[20%] w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] rounded-full blur-[140px] transition-all duration-1000 animate-pulse"
          style={{ background: currentStation.brandColor || '#FA243C' }}
        />
        <div
          className="absolute -bottom-[20%] -right-[20%] w-[85vw] h-[85vw] max-w-[850px] max-h-[850px] rounded-full blur-[160px] transition-all duration-1000"
          style={{ background: '#7136FF' }}
        />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-3xl" />
      </div>

      {/* Apple Music Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[500px] bg-[#1C1C1E]/80 border border-white/20 rounded-[38px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col backdrop-blur-3xl transition-all duration-300 ring-1 ring-white/10"
      >
        {/* Apple Music Top Bar: Grabber, Header & Queue List Toggle Button */}
        <div className="px-6 pt-3 pb-2 flex flex-col items-center border-b border-white/5">
          {/* Top Apple Grabber Pill */}
          <div className="w-10 h-1.5 rounded-full bg-white/25 mb-3" />

          <div className="w-full flex items-center justify-between">
            {/* Minimize / Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Minimizar reproductor (Esc)"
              aria-label="Cerrar"
            >
              <ChevronDown className="w-5 h-5" />
            </button>

            {/* Apple Music Live Broadcast Label */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-pulse" />
              <span className="text-[11px] font-mono-tech tracking-wider text-white font-bold uppercase">
                {showStationList ? 'LISTA DE EMISORAS' : 'RADIO EN DIRECTO'}
              </span>
            </div>

            {/* Apple Music Iconic Queue / List Toggle Button */}
            <button
              onClick={() => {
                audioEngine.playClickFx();
                setShowStationList((prev) => !prev);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                showStationList
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
              }`}
              title={showStationList ? 'Volver al reproductor' : 'Mostrar lista de emisoras (L)'}
              aria-label="Alternar lista de emisoras"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic View: Main Apple Music Player OR Slide-in Station Picker List */}
        {!showStationList ? (
          /* ========================================================
             VIEW 1: ICONIC APPLE MUSIC NOW PLAYING SCREEN
             ======================================================== */
          <div className="p-6 sm:p-8 flex flex-col items-center animate-fadeIn">
            {/* Apple Music Big Square Artwork: Fully fills the entire frame (object-cover) */}
            <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/15 transition-transform duration-500 bg-black">
              <img
                src={currentStation.coverImage}
                alt={currentStation.name}
                decoding="async"
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isPlaying && !isLoading ? 'scale-100' : 'scale-[0.96] opacity-90'
                }`}
              />

              {/* Gloss Specular Highlight & Inner Border Overlay */}
              <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/20 pointer-events-none" />

              {/* Top Station Frequency Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono-tech tracking-wider text-white font-bold uppercase shadow-lg">
                {currentStation.frequency}
              </div>

              {/* Live Audio Waves when playing */}
              {isPlaying && !isLoading && (
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-lg">
                  <span className="w-1 h-3 bg-[#FF2D55] rounded-full animate-[bounce_0.8s_infinite]" />
                  <span className="w-1 h-2 bg-[#D92CFF] rounded-full animate-[bounce_0.6s_infinite_0.1s]" />
                  <span className="w-1 h-3.5 bg-[#25F4EE] rounded-full animate-[bounce_0.9s_infinite_0.2s]" />
                </div>
              )}
            </div>

            {/* Apple Music Track / Station Title Section */}
            <div className="w-full mt-6 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl text-white tracking-wide uppercase truncate">
                  {currentStation.name}
                </h3>
                <p className="text-xs sm:text-sm font-sans text-white/60 truncate mt-0.5">
                  {currentStation.location} · {currentStation.genre}
                </p>
                <p className="text-[11px] font-mono-tech text-[#D92CFF] mt-1 tracking-wider uppercase">
                  {currentStation.tagline}
                </p>
              </div>

              {/* Quick Share / Link Action */}
              <button
                onClick={handleShareStation}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0 mt-1"
                title="Copiar enlace de transmisión"
                aria-label="Copiar enlace"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#25F4EE]" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Apple Music Live Scrubber Bar */}
            <div className="w-full mt-5">
              <div className="relative w-full h-1 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D92CFF] via-[#FF2D55] to-[#25F4EE] rounded-full transition-all duration-300"
                  style={{ width: isPlaying && !isLoading ? '100%' : '0%' }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-tech text-white/50 mt-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D55] animate-pulse" />
                  <span className="text-[#FF2D55] font-bold">EN DIRECTO</span>
                </span>
                <span>
                  {isLoading
                    ? 'BUFFERING...'
                    : hasError
                    ? 'RECONECTANDO'
                    : isPlaying
                    ? '320 KBPS STEREO'
                    : 'PAUSADO'}
                </span>
              </div>
            </div>

            {/* Apple Music Primary Transport Controls */}
            <div className="w-full flex items-center justify-center gap-8 sm:gap-10 mt-6">
              {/* Previous Station */}
              <button
                onClick={handlePrev}
                className="text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Emisora anterior (←)"
                aria-label="Emisora anterior"
              >
                <SkipBack className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
              </button>

              {/* Large Apple Music Play/Pause Button */}
              <button
                onClick={handleTogglePlay}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 shadow-[0_10px_35px_rgba(255,255,255,0.3)] cursor-pointer"
                title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-black" />
                ) : (
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-black ml-1" />
                )}
              </button>

              {/* Next Station */}
              <button
                onClick={handleNext}
                className="text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Siguiente emisora (→)"
                aria-label="Siguiente emisora"
              >
                <SkipForward className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
              </button>
            </div>

            {/* Apple Music Volume Slider Bar */}
            <div className="w-full flex items-center gap-3 mt-6 px-2">
              <button
                onClick={handleToggleMute}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#FF2D55]" />
                ) : (
                  <Volume1 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                title="Volumen"
              />

              <Volume2 className="w-4 h-4 text-white/60" />
            </div>

            {/* Bottom Actions Bar (Trigger Station List, Airplay, Direct Stream) */}
            <div className="w-full flex items-center justify-between mt-6 pt-4 border-t border-white/10 px-2 text-white/70">
              <div className="flex items-center gap-2">
                <Airplay className="w-4 h-4 text-white/50" />
                <span className="text-[10px] font-mono-tech uppercase text-white/50">AIRPLAY / CAST</span>
              </div>

              {/* Center "Ver Lista de Emisoras" Button */}
              <button
                onClick={() => {
                  audioEngine.playClickFx();
                  setShowStationList(true);
                }}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono-tech text-white font-semibold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-md"
              >
                <ListMusic className="w-3.5 h-3.5 text-[#D92CFF]" />
                <span>14 EMISORAS</span>
              </button>

              <a
                href={currentStation.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                title="Abrir transmisión directa"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* ========================================================
             VIEW 2: APPLE MUSIC QUEUE / STATION PICKER LIST VIEW
             (Only shown when the user clicks the list button)
             ======================================================== */
          <div className="p-5 flex flex-col h-[560px] animate-fadeIn">
            {/* Search Input Bar */}
            <div className="relative w-full mb-3">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar emisora, frecuencia o género..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                autoFocus
              />
            </div>

            {/* Currently Playing Mini Banner */}
            <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentStation.coverImage}
                  alt={currentStation.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/15 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-condensed font-bold text-white uppercase truncate">
                    {currentStation.name}
                  </p>
                  <p className="text-[10px] font-mono-tech text-[#D92CFF] truncate">
                    EN REPRODUCCIÓN · {currentStation.frequency}
                  </p>
                </div>
              </div>

              <button
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
              </button>
            </div>

            {/* Scrollable Apple Music Style Station List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1 custom-scrollbar space-y-1">
              {filteredStations.map((station) => {
                const isSelected = station.id === currentStation.id;
                const origIndex = RADIO_STATIONS.findIndex((s) => s.id === station.id);

                return (
                  <div
                    key={station.id}
                    onClick={() => {
                      handleSelectStation(origIndex);
                      // On click, switch station smoothly
                    }}
                    className={`group relative flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-white/15 border border-white/20 shadow-md'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Numeric Dial Position */}
                      <span
                        className={`text-xs font-mono-tech font-bold w-5 text-right shrink-0 ${
                          isSelected ? 'text-[#FF2D55]' : 'text-white/40'
                        }`}
                      >
                        {(origIndex + 1).toString().padStart(2, '0')}
                      </span>

                      {/* Full-bleed Artwork Box */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-white/15 shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          src={station.coverImage}
                          alt={station.name}
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Station Name & Frequency */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-condensed font-extrabold text-sm uppercase tracking-wide truncate ${
                              isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'
                            }`}
                          >
                            {station.name}
                          </p>

                          {isSelected && isPlaying && !isLoading && (
                            <div className="flex items-center gap-0.5 h-2.5">
                              <span className="w-0.5 h-2.5 bg-[#FF2D55] animate-pulse rounded-full" />
                              <span className="w-0.5 h-1.5 bg-[#D92CFF] animate-pulse rounded-full" />
                              <span className="w-0.5 h-2 bg-[#25F4EE] animate-pulse rounded-full" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-mono-tech">
                          <span className="text-[#25F4EE]">{station.frequency}</span>
                          <span>•</span>
                          <span className="truncate">{station.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Genre Tag and Quick Play Button */}
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono-tech text-white/60 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 hidden sm:inline-block">
                        {station.genre.split('/')[0].trim()}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected) {
                            handleTogglePlay();
                          } else {
                            handleSelectStation(origIndex);
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isSelected && isPlaying
                            ? 'bg-white text-black shadow-md'
                            : 'bg-white/10 group-hover:bg-white/20 text-white'
                        }`}
                        title={isSelected && isPlaying ? 'Pausar' : 'Sintonizar'}
                      >
                        {isSelected && isPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-black" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredStations.length === 0 && (
                <div className="p-8 text-center text-white/50 font-mono-tech text-xs">
                  No se encontraron emisoras que coincidan con "{searchQuery}"
                </div>
              )}
            </div>

            {/* Back to Now Playing Player Button */}
            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setShowStationList(false)}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono-tech text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>VOLVER AL REPRODUCTOR</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
