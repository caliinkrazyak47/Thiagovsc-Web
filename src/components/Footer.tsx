import React from 'react';
import { ArrowUp } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { ThiagovscLogo } from './ThiagovscLogo';

interface FooterProps {
  onOpenContact: () => void;
  onReplayPreloader?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact, onReplayPreloader }) => {
  const scrollToTop = () => {
    audioEngine.playClickFx();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-black border-t border-white/10 pt-20 pb-12 overflow-hidden select-none z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Main Footer Block */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 pb-16 border-b border-white/10">
          {/* Brand Wordmark & Triad */}
          <div>
            <div className="mb-6">
              <ThiagovscLogo className="h-12 sm:h-14 md:h-16 w-auto max-w-[220px] sm:max-w-[260px] hover:scale-105 transition-all duration-300" />
            </div>

            <div className="flex flex-col text-sm font-mono-tech tracking-[0.3em] text-[#92909B] space-y-1.5 uppercase">
              <span className="text-white hover:text-[#D92CFF] transition-colors">MUSIC.</span>
              <span className="text-white hover:text-[#D92CFF] transition-colors">MEDIA.</span>
              <span className="text-white hover:text-[#D92CFF] transition-colors">MOMENTS.</span>
            </div>
          </div>

          {/* Navigation & Social Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
            {/* Exploration */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono-tech tracking-[0.25em] text-[#D92CFF] uppercase font-bold">
                EXPLORE
              </span>
              <a
                href="#insta-feed"
                onClick={() => audioEngine.playClickFx()}
                className="text-xs font-mono-tech text-[#92909B] hover:text-white transition-colors"
              >
                INSTA FEED
              </a>
              <a
                href="#music"
                onClick={() => audioEngine.playClickFx()}
                className="text-xs font-mono-tech text-[#92909B] hover:text-white transition-colors"
              >
                MUSIC ARCHIVE
              </a>
              <a
                href="#tiktok"
                onClick={() => audioEngine.playClickFx()}
                className="text-xs font-mono-tech text-[#92909B] hover:text-white transition-colors"
              >
                TIKTOK · LIFE IN MOTION
              </a>
            </div>

            {/* Socials */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono-tech tracking-[0.25em] text-[#D92CFF] uppercase font-bold">
                CONNECT
              </span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => audioEngine.playClickFx()}
                className="text-xs font-mono-tech text-[#92909B] hover:text-white transition-colors"
              >
                INSTAGRAM ↗
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => audioEngine.playClickFx()}
                className="text-xs font-mono-tech text-[#92909B] hover:text-white transition-colors"
              >
                TIKTOK ↗
              </a>
              <a
                href="https://spotify.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => audioEngine.playClickFx()}
                className="text-xs font-mono-tech text-[#92909B] hover:text-white transition-colors"
              >
                SPOTIFY ↗
              </a>
              <button
                onClick={() => {
                  audioEngine.playClickFx();
                  onOpenContact();
                }}
                className="text-xs font-mono-tech text-left text-[#92909B] hover:text-white transition-colors cursor-pointer"
              >
                CONTACT ↗
              </button>
            </div>

            {/* Inquiries */}
            <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
              <span className="text-[10px] font-mono-tech tracking-[0.25em] text-[#D92CFF] uppercase font-bold">
                MANAGEMENT
              </span>
              <span className="text-xs font-mono-tech text-[#92909B]">
                LONDON · TOKYO · SÃO PAULO
              </span>
              <span className="text-xs font-mono-tech text-white">
                HELLO@THIAGOVSC.COM
              </span>
            </div>
          </div>

          {/* Scroll to Top Action */}
          <div className="flex flex-col items-start lg:items-end justify-between">
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-3 p-3.5 rounded-full border border-white/15 bg-white/5 hover:border-[#D92CFF] hover:bg-[#D92CFF]/10 text-white transition-all cursor-pointer"
              aria-label="Back to top"
            >
              <span className="text-xs font-mono-tech tracking-[0.2em] pl-2 uppercase">BACK TO TOP</span>
              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#D92CFF] flex items-center justify-center transition-colors">
                <ArrowUp className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Micro-Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono-tech text-[#92909B] tracking-[0.2em] gap-4">
          <span>© 2026 THIAGOVSC. ALL RIGHTS RESERVED.</span>

          {onReplayPreloader && (
            <button
              onClick={() => {
                audioEngine.playClickFx();
                onReplayPreloader();
              }}
              className="text-white/40 hover:text-[#D92CFF] text-[10px] font-mono-tech tracking-[0.25em] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D92CFF]" /> REPLAY INTRO PRELOADER
            </button>
          )}

          {/* Exact Prompt Tagline */}
          <span className="text-white tracking-[0.3em] font-semibold">
            MADE FOR THE FEELING.
          </span>
        </div>
      </div>
    </footer>
  );
};
