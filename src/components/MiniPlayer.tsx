import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
  Maximize2,
  Minimize2,
  Disc,
  Check,
} from 'lucide-react';
import { MUSIC_TRACKS, Track } from '../data/content';
import { audioEngine } from '../utils/audioEngine';
import { getCoverImageForTrack } from '../services/musicSheetsService';

interface MiniPlayerProps {
  currentTrackId: string | null;
  isPlaying: boolean;
  onClose: () => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  tracks?: Track[];
}

const DEFAULT_TRACK_INFO: Record<string, { title: string; artist: string }> = {
  '01': { title: 'BBY WOW', artist: 'Karol G' },
  '02': { title: 'VAMO A VEL', artist: 'Anuel AA Ft ROA' },
  '03': { title: 'DARDOS', artist: 'Romeo Santos Ft Prince Royce' },
  '04': { title: 'LA GRACIOSA', artist: 'Quevedo Ft Elvis Crespo' },
  '05': { title: 'Jamaican (Bam Bam)', artist: 'Hugel' },
};

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrackId,
  isPlaying,
  onClose,
  onPlayNext,
  onPlayPrev,
  tracks,
}) => {
  const [progress, setProgress] = useState(0);
  const [timeFormatted, setTimeFormatted] = useState('0:00');
  const [durationFormatted, setDurationFormatted] = useState('3:24');
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const trackList = tracks && tracks.length > 0 ? tracks : MUSIC_TRACKS;

  // Robust track finder matching id, number, or numeric digits
  const rawTrack =
    trackList.find(
      (t) =>
        t.id === currentTrackId ||
        t.number === currentTrackId ||
        t.id.replace(/\D/g, '') === currentTrackId?.replace(/\D/g, '')
    ) || trackList[0];

  // Guaranteed non-empty Title and Artist
  const trackNum = (rawTrack?.number || '01').padStart(2, '0');
  const defaultInfo = DEFAULT_TRACK_INFO[trackNum] || {
    title: 'BBY WOW',
    artist: 'Karol G',
  };
  const songTitle = rawTrack?.title && rawTrack.title.trim().length > 0 ? rawTrack.title : defaultInfo.title;
  const singerName = rawTrack?.artist && rawTrack.artist.trim().length > 0 ? rawTrack.artist : defaultInfo.artist;
  const coverUrl = getCoverImageForTrack(rawTrack);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((state) => {
      setProgress(state.progress);
      setTimeFormatted(state.timeFormatted);
      if (state.durationFormatted && state.durationFormatted !== '0:00') {
        setDurationFormatted(state.durationFormatted);
      }
    });
    return () => unsubscribe();
  }, []);

  const togglePlay = () => {
    audioEngine.playClickFx();
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.playTrack(
        rawTrack.id,
        rawTrack.audioFrequency,
        rawTrack.bpm,
        rawTrack.durationSec,
        rawTrack.audioUrl
      );
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    audioEngine.playClickFx();
    if (isMuted) {
      audioEngine.setVolume(volume);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    audioEngine.seek(pct);
  };

  const downloadFileUrl = rawTrack.downloadUrl || rawTrack.flacDownloadUrl || rawTrack.audioUrl;

  const handleDownload = () => {
    audioEngine.playClickFx();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <>
      {/* ========================================================
          APPLE MUSIC BOTTOM DOCK PLAYER
          ======================================================== */}
      <aside
        aria-label="Reproductor Apple Music"
        className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 animate-slideUp select-none"
      >
        <div className="relative rounded-2xl bg-[#141418]/92 backdrop-blur-3xl border border-white/15 p-2.5 sm:p-3 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Apple Music Interactive Scrubber Bar (Top edge) */}
          <div
            onClick={handleSeek}
            className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-white/10 hover:h-2.5 transition-all cursor-pointer group/scrub z-10"
            title="Adelantar o retroceder"
          >
            <div
              className="h-full bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] relative rounded-r-full"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/scrub:opacity-100 shadow-[0_0_10px_#D92CFF] transition-opacity" />
            </div>
          </div>

          {/* Main 3-Column Dock Layout */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 pt-1.5 sm:pt-1">
            {/* ----------------------------------------------------
                COLUMN 1: SONG & SINGER INFO (APPLE MUSIC STYLE)
                ---------------------------------------------------- */}
            <div
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:w-[36%] md:w-[32%] cursor-pointer group/info"
              title="Abrir vista completa Apple Music"
            >
              {/* Apple Music Square Cover Art */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 border border-white/15 shadow-md relative overflow-hidden bg-black/60 group-hover/info:scale-105 transition-transform duration-300">
                <img
                  src={coverUrl}
                  alt={songTitle}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = `/images/covers/thumb_${trackNum}.jpg`;
                    if (!target.src.endsWith(fallback)) {
                      target.src = fallback;
                    }
                  }}
                />
              </div>

              {/* Clear, Bold Song Title & Singer Name */}
              <div className="min-w-0 flex-1">
                <h4
                  className="font-bold text-white text-sm sm:text-base tracking-normal truncate leading-snug group-hover/info:text-[#D92CFF] transition-colors"
                  title={`Canción: ${songTitle}`}
                >
                  {songTitle}
                </h4>
                <p
                  className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-white truncate leading-tight mt-0.5"
                  title={`Cantante: ${singerName}`}
                >
                  {singerName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono-tech font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 border border-white/10">
                    Lossless
                  </span>
                  <span className="text-[10px] font-mono-tech text-zinc-400 sm:hidden">
                    {timeFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                COLUMN 2: APPLE MUSIC TRANSPORT CONTROLS & TIMELINE
                ---------------------------------------------------- */}
            <div className="flex flex-col items-center justify-center gap-1 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Previous */}
                <button
                  onClick={() => {
                    audioEngine.playClickFx();
                    onPlayPrev();
                  }}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Canción anterior"
                  title="Anterior"
                >
                  <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                </button>

                {/* Iconic Apple Music Circular Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                  title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-black text-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={() => {
                    audioEngine.playClickFx();
                    onPlayNext();
                  }}
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Siguiente canción"
                  title="Siguiente"
                >
                  <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                </button>
              </div>

              {/* Time display underneath */}
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono-tech text-zinc-400 tabular-nums">
                <span>{timeFormatted}</span>
                <span className="text-zinc-600">/</span>
                <span>{durationFormatted || rawTrack.duration}</span>
              </div>
            </div>

            {/* ----------------------------------------------------
                COLUMN 3: APPLE MUSIC ACTIONS & VOLUME
                ---------------------------------------------------- */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0 sm:w-[32%] md:w-[28%]">
              {/* Direct Download */}
              {downloadFileUrl && (
                <a
                  href={downloadFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDownload}
                  className="p-2 rounded-full text-zinc-400 hover:text-[#D92CFF] hover:bg-white/10 transition-colors cursor-pointer relative"
                  title={`Descargar ${songTitle} (${singerName})`}
                  aria-label="Descargar canción"
                >
                  {downloadSuccess ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </a>
              )}

              {/* Apple Music Volume Controls */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-[#D92CFF]"
                  title="Volumen"
                />
              </div>

              {/* Expand to Apple Music Full View */}
              <button
                onClick={() => setIsExpanded(true)}
                className="hidden sm:inline-flex p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Ampliar a pantalla completa"
                aria-label="Pantalla completa"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Close Dock Player */}
              <button
                onClick={() => {
                  audioEngine.playClickFx();
                  onClose();
                }}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Cerrar reproductor"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================
          APPLE MUSIC FULLSCREEN / NOW PLAYING MODAL
          ======================================================== */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fadeIn p-4 sm:p-8">
          {/* Dynamic Ambient Blurred Background */}
          <div
            className="absolute inset-0 opacity-40 blur-3xl scale-125 pointer-events-none"
            style={{
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Top Bar with Minimize & Brand */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-mono-tech tracking-widest uppercase text-white/60">
              <Disc className="w-4 h-4 text-[#D92CFF] animate-spin" />
              <span>Apple Music · Now Playing</span>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Minimizar reproductor"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Center Card */}
          <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
            {/* Big High-Res Album Cover */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] border border-white/20 relative group">
              <img
                src={coverUrl}
                alt={songTitle}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>

            {/* Prominent Song Title & Singer Name */}
            <div className="mt-8 w-full px-4">
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate drop-shadow-md"
                title={songTitle}
              >
                {songTitle}
              </h2>
              <p
                className="text-base sm:text-lg font-semibold text-[#D92CFF] mt-1.5 truncate drop-shadow-sm"
                title={singerName}
              >
                {singerName}
              </p>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-mono-tech text-zinc-300">
                <span>Apple Digital Master</span>
                <span>•</span>
                <span>Lossless 24-bit</span>
              </div>
            </div>

            {/* Apple Music Scrubber */}
            <div className="w-full mt-6 px-4">
              <div
                onClick={handleSeek}
                className="h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all relative overflow-hidden group/scrub"
              >
                <div
                  className="h-full bg-white rounded-full relative"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs font-mono-tech text-zinc-400 mt-2">
                <span>{timeFormatted}</span>
                <span>{durationFormatted || rawTrack.duration}</span>
              </div>
            </div>

            {/* Big Playback Transport Controls */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <button
                onClick={() => {
                  audioEngine.playClickFx();
                  onPlayPrev();
                }}
                className="p-3 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Canción anterior"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-black text-black" />
                ) : (
                  <Play className="w-7 h-7 fill-black text-black ml-1" />
                )}
              </button>

              <button
                onClick={() => {
                  audioEngine.playClickFx();
                  onPlayNext();
                }}
                className="p-3 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Siguiente canción"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>
            </div>

            {/* Download Button in Full View */}
            {downloadFileUrl && (
              <a
                href={downloadFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownload}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-sm font-medium text-white transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D92CFF]" />
                <span>Descargar archivo original ({rawTrack.releaseType || 'Hi-Res'})</span>
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
};
