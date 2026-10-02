import React from 'react';
import { Play } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { SpeedingText } from './SpeedingText';

interface HeroProps {
  onOpenRadio?: () => void;
  onOpenShowreel?: () => void;
  onOpenLayerGuide?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRadio, onOpenShowreel }) => {
  const handleRadioClick = () => {
    audioEngine.playClickFx();
    if (onOpenRadio) {
      onOpenRadio();
    } else if (onOpenShowreel) {
      onOpenShowreel();
    }
  };

  return (
    <section className="relative w-full h-screen min-h-[680px] bg-transparent flex flex-col justify-between overflow-hidden select-none">
      {/* Background Visual Layer: Real 16:9 Video Filling the Entire Section without darkening overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          src="https://res.cloudinary.com/v47hsuhi/video/upload/v1790524043/Cyborg_blowing_bubble_gum_1080p_20260927174619.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-100"
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pt-28 md:pt-36 lg:pt-40 flex-1 flex flex-col justify-center drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
        {/* Subtle Top Kicker / Small Label */}
        <div className="flex items-center gap-3 mb-2 md:mb-4">
          <div className="w-2 h-2 rounded-full bg-[#D92CFF] shadow-[0_0_10px_#D92CFF]" />
          <span className="text-[11px] md:text-xs font-mono-tech tracking-[0.3em] text-[#A898B8] uppercase font-semibold">
            WELCOME TO THE WORLD OF
          </span>
        </div>

        {/* Massive Stroked Typography from Screenshot 1: T H I A G O V S C */}
        <div className="relative">
          <h1 className="font-condensed font-extrabold uppercase leading-[0.88] tracking-tight">
            {/* Outlined THIAGOVSC */}
            <span className="block text-[64px] sm:text-[96px] md:text-[132px] lg:text-[170px] xl:text-[200px] text-stroke-thick hover:text-white transition-colors duration-500 select-none drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">
              THIAGOVSC
            </span>
            {/* Solid White OFICIAL matching Screenshot 1 */}
            <span className="block text-[44px] sm:text-[68px] md:text-[94px] lg:text-[120px] xl:text-[142px] text-white tracking-wide -mt-2 sm:-mt-4 md:-mt-6 lg:-mt-8 drop-shadow-[0_8px_30px_rgba(0,0,0,0.9)]">
              OFICIAL
            </span>
          </h1>

          {/* Right Floating Radio En Vivo Button */}
          <div className="absolute right-0 bottom-4 sm:bottom-8 lg:bottom-12 flex items-center gap-3 sm:gap-4">
            <span className="text-xs md:text-sm font-mono-tech tracking-[0.2em] hidden sm:inline-flex items-center gap-1.5 uppercase font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <span className="text-white">RADIO</span>
              <span className="bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] bg-clip-text text-transparent font-bold">
                EN VIVO
              </span>
            </span>
            <button
              onClick={handleRadioClick}
              className="group relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/40 bg-black/50 backdrop-blur-md flex items-center justify-center hover:border-[#D92CFF] hover:scale-105 transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.8)] cursor-pointer"
              aria-label="Abrir Radio En Vivo"
            >
              <div className="absolute inset-0 rounded-full bg-[#D92CFF]/25 scale-0 group-hover:scale-100 transition-transform duration-300" />
              <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white ml-0.5 group-hover:text-[#D92CFF] group-hover:fill-[#D92CFF] transition-colors" />
            </button>
          </div>
        </div>

        {/* Editorial Sub-text */}
        <p className="max-w-md text-xs sm:text-sm font-mono-tech tracking-[0.15em] text-[#DDD6E5] mt-4 sm:mt-6 uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          NOT JUST CONTENT.
          <br />
          <span className="text-white font-semibold">A FEELING THAT STAYS.</span>
        </p>
      </div>

      {/* Bottom Zone: Metrics (Left) & Scroll Indicator (Right) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-10 pb-6 md:pb-8 flex items-center justify-between gap-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
        {/* Left: Statistics with Speeding Text effect & balanced sizing */}
        <div className="flex items-center gap-6 sm:gap-10">
          {/* Instagram Metric */}
          <div className="group flex flex-col cursor-pointer select-none">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D92CFF] animate-pulse shadow-[0_0_8px_#D92CFF]" />
              <span className="text-[11px] sm:text-xs font-mono-tech tracking-[0.25em] text-[#DDD6E5] uppercase font-bold group-hover:text-white transition-colors">
                INSTAGRAM
              </span>
            </div>

            <div className="relative inline-flex items-baseline overflow-visible">
              <SpeedingText
                value={312}
                from={0}
                suffix="K"
                duration={2200}
                loop={true}
                loopDelay={1200}
                fontSize="clamp(1.85rem, 3.2vw, 2.75rem)"
                fontWeight={900}
                fontFamily="'Barlow Condensed', sans-serif"
                italic={true}
                textColor="#FFFFFF"
                align="left"
                blurStrength={1.2}
                maxBlur={14}
                width="auto"
                height="auto"
                overflow="visible"
                className="font-condensed font-black tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(217,44,255,0.35)]"
              />
            </div>

            {/* Kinetic Speed Trail Underline */}
            <div className="w-full h-[2px] bg-white/20 mt-1.5 speed-trail rounded-full">
              <div className="h-full bg-gradient-to-r from-transparent via-[#D92CFF] to-transparent w-full" />
            </div>
          </div>

          {/* Speeding Slanted Divider */}
          <div className="w-[1.5px] h-10 sm:h-12 bg-gradient-to-b from-white/40 via-[#D92CFF]/80 to-transparent transform -skew-x-12" />

          {/* TikTok Metric */}
          <div className="group flex flex-col cursor-pointer select-none">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE] animate-pulse shadow-[0_0_8px_#25F4EE]" />
              <span className="text-[11px] sm:text-xs font-mono-tech tracking-[0.25em] text-[#DDD6E5] uppercase font-bold group-hover:text-white transition-colors">
                TIKTOK
              </span>
            </div>

            <div className="relative inline-flex items-baseline overflow-visible">
              <SpeedingText
                value={38}
                from={0}
                suffix="K"
                duration={2200}
                loop={true}
                loopDelay={1200}
                fontSize="clamp(1.85rem, 3.2vw, 2.75rem)"
                fontWeight={900}
                fontFamily="'Barlow Condensed', sans-serif"
                italic={true}
                textColor="#FFFFFF"
                align="left"
                blurStrength={1.2}
                maxBlur={14}
                width="auto"
                height="auto"
                overflow="visible"
                className="font-condensed font-black tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(37,244,238,0.35)]"
              />
            </div>

            {/* Kinetic Speed Trail Underline */}
            <div className="w-full h-[2px] bg-white/20 mt-1.5 speed-trail rounded-full">
              <div className="h-full bg-gradient-to-r from-transparent via-[#25F4EE] to-transparent w-full" />
            </div>
          </div>
        </div>

        {/* Right: Vertical Scroll Indicator from Screenshot 1 */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[10px] font-mono-tech tracking-[0.3em] text-[#DDD6E5] uppercase font-semibold [writing-mode:vertical-rl] rotate-180">
            SCROLL
          </span>
          <div className="w-[1px] h-10 bg-white/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#D92CFF] animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};
