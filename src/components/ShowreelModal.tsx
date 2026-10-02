import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShowreelModal: React.FC<ShowreelModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else {
      document.body.style.overflow = 'auto';
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    audioEngine.playClickFx();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    audioEngine.playClickFx();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Close Button Top Right */}
      <button
        onClick={() => {
          audioEngine.playClickFx();
          onClose();
        }}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-[#D92CFF] text-white transition-colors cursor-pointer"
        aria-label="Close Showreel"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video Container Frame */}
      <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/20 bg-black shadow-[0_0_80px_rgba(217,44,255,0.25)] flex flex-col justify-between">
        <video
          ref={videoRef}
          src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42894-large.mp4"
          playsInline
          autoPlay
          loop
          onTimeUpdate={handleTimeUpdate}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

        {/* Top Header inside Modal */}
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono-tech tracking-[0.25em] text-white uppercase font-bold">
              OFFICIAL SHOWREEL 2026 // 4K CINEMATIC
            </span>
          </div>

          <span className="text-xs font-mono-tech tracking-[0.2em] text-[#D92CFF]">
            THIAGOVSC STUDIO
          </span>
        </div>

        {/* Center Play/Pause button */}
        <div className="relative z-10 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D92CFF]/90 hover:bg-[#D92CFF] text-white flex items-center justify-center shadow-[0_0_40px_rgba(217,44,255,0.8)] hover:scale-110 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="relative z-10 p-6">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#D92CFF] to-[#7136FF]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-condensed font-extrabold text-2xl text-white uppercase tracking-wider">
                THIAGOVSC // VISUAL ANTHOLOGY
              </h3>
              <p className="text-xs font-mono-tech text-[#92909B] tracking-[0.15em]">
                MUSIC · LUXURY LIFESTYLE · SHORT-FORM PHENOMENON
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
