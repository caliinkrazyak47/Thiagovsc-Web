import React, { useState, useEffect } from 'react';
import { Play, Pause, Disc3, Radio, Download } from 'lucide-react';
import { MUSIC_TRACKS, Track } from '../data/content';
import { fetchMusicSheets } from '../services/musicSheetsService';
import { audioEngine } from '../utils/audioEngine';

interface MusicSectionProps {
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  tracks?: Track[];
}

export const MusicSection: React.FC<MusicSectionProps> = ({
  currentTrackId,
  isPlaying,
  onPlayTrack,
  tracks: propTracks,
}) => {
  const [internalTracks, setInternalTracks] = useState<Track[]>(propTracks || MUSIC_TRACKS);
  const [activeFrequencyData, setActiveFrequencyData] = useState<number[]>([]);

  useEffect(() => {
    fetchMusicSheets().then((syncedTracks) => {
      if (syncedTracks && syncedTracks.length > 0) {
        setInternalTracks(syncedTracks);
      }
    });
  }, []);

  useEffect(() => {
    if (propTracks && propTracks.length > 0) {
      setInternalTracks(propTracks);
    }
  }, [propTracks]);

  const displayTracks = propTracks && propTracks.length > 0 ? propTracks : internalTracks;

  useEffect(() => {
    let animId: number;
    const updateWaveform = () => {
      if (isPlaying) {
        const rawData = audioEngine.getAudioFrequencyData();
        const simplified = Array.from(rawData.slice(0, 16)).map((v) => Math.max(10, Math.min(100, (v / 255) * 100)));
        setActiveFrequencyData(simplified);
      }
      animId = requestAnimationFrame(updateWaveform);
    };
    animId = requestAnimationFrame(updateWaveform);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <section id="music" className="relative w-full py-24 md:py-32 section-hero-gradient overflow-hidden select-none border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#7136FF] shadow-[0_0_10px_#7136FF]" />
              <span className="text-[11px] font-mono-tech tracking-[0.3em] text-[#92909B] uppercase">
                DISCOGRAPHY // ARCHIVE
              </span>
            </div>
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider flex items-center gap-3">
              <span className="text-white">TOP</span>
              <span className="bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] bg-clip-text text-transparent">
                RANKING.
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="text-xs font-mono-tech tracking-[0.2em] text-[#92909B] uppercase flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#D92CFF] animate-pulse" />
              HI-FI AUDIO ENGINE ACTIVE
            </span>
          </div>
        </div>

        {/* Editorial Tracklist Table */}
        <div className="divide-y divide-white/10 border-b border-white/10">
          {displayTracks.map((track) => {
            const isThisTrackPlaying = isPlaying && currentTrackId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`group py-5 md:py-6 px-4 -mx-4 rounded-xl flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  isThisTrackPlaying
                    ? 'bg-white/5 border border-[#D92CFF]/30 shadow-[0_0_20px_rgba(217,44,255,0.15)]'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                {/* Left: Number, Vinyl Icon / Play, Title & Artist */}
                <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-1 min-w-0">
                  <span className="font-mono-tech text-xs sm:text-sm text-[#92909B] w-6 shrink-0">
                    {track.number}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTrack(track);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                      isThisTrackPlaying
                        ? 'bg-[#D92CFF] text-white shadow-[0_0_15px_#D92CFF]'
                        : 'border border-white/20 bg-white/5 text-white group-hover:border-[#D92CFF] group-hover:bg-[#D92CFF]/20'
                    }`}
                    aria-label={`Play ${track.title}`}
                  >
                    {isThisTrackPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  {track.coverImage && (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-sm hidden xs:block">
                      <img
                        src={track.coverImage}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3
                      className={`font-condensed font-extrabold text-xl sm:text-2xl tracking-wide uppercase truncate transition-colors ${
                        isThisTrackPlaying ? 'text-[#D92CFF]' : 'text-white group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </h3>
                    <p className="text-xs font-mono-tech tracking-[0.15em] text-[#92909B] truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Center / Waveform or Visual Frequency Bars */}
                <div className="hidden md:flex items-center gap-1 w-48 shrink-0 px-4">
                  {isThisTrackPlaying ? (
                    <div className="flex items-center gap-1 h-6">
                      {(activeFrequencyData.length ? activeFrequencyData : track.waveformPattern.slice(0, 16)).map(
                        (h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-[#D92CFF] rounded-full transition-all duration-100"
                            style={{ height: `${Math.max(15, h)}%` }}
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 h-6 opacity-30 group-hover:opacity-70 transition-opacity">
                      {track.waveformPattern.slice(0, 16).map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-white rounded-full"
                          style={{ height: `${h * 0.5}%` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Release Type, BPM / Key, Duration */}
                <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                  <span className="hidden sm:inline text-xs font-mono-tech tracking-[0.18em] text-[#92909B] uppercase">
                    {track.releaseType} / {track.year}
                  </span>

                  <span className="hidden lg:inline text-xs font-mono-tech tracking-[0.18em] text-white/60 uppercase">
                    {track.bpm} BPM · {track.key}
                  </span>

                  <span className="text-xs sm:text-sm font-mono-tech text-white tracking-widest tabular-nums w-12 text-right">
                    {track.duration}
                  </span>

                  {/* Small Download Button */}
                  {(track.downloadUrl || track.flacDownloadUrl) && (
                    <a
                      href={track.downloadUrl || track.flacDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        audioEngine.playClickFx();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#D92CFF]/20 border border-white/10 hover:border-[#D92CFF]/50 text-[#D92CFF] hover:text-white transition-all flex items-center gap-1 text-[11px] font-mono-tech tracking-wider cursor-pointer shadow-sm group/dl"
                      title={`Descargar ${track.title}`}
                      aria-label={`Descargar ${track.title}`}
                    >
                      <Download className="w-3.5 h-3.5 group-hover/dl:scale-110 transition-transform" />
                      <span className="hidden sm:inline font-bold">
                        {track.downloadUrl?.toLowerCase().includes('.mp3') ? 'MP3' : 'FLAC'}
                      </span>
                    </a>
                  )}

                  <Disc3
                    className={`w-5 h-5 text-[#92909B] group-hover:text-white transition-all ${
                      isThisTrackPlaying ? 'text-[#D92CFF] animate-spin' : ''
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Studio Note */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono-tech text-[#92909B] tracking-[0.15em] gap-4">
          <span>MASTERED IN TOKYO & BERLIN // 48KHZ 24-BIT LOSSLESS</span>
          <span>AVAILABLE ON SPOTIFY · APPLE MUSIC · BEATPORT</span>
        </div>
      </div>
    </section>
  );
};
