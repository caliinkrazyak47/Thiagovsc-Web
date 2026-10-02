import React from 'react';
import { Volume2, Eye, Flame } from 'lucide-react';
import { ThiagovscLogo } from './ThiagovscLogo';

export const AboutSection: React.FC = () => {
  const pillars = [
    {
      number: '01',
      title: 'SOUND',
      icon: Volume2,
      accent: '#D92CFF',
      description: 'Analog synthesizer synthesis, crisp percussive dynamics and sub-bass textures engineered to evoke distinct physical emotion.',
    },
    {
      number: '02',
      title: 'VISION',
      icon: Eye,
      accent: '#F03BBE',
      description: 'Cinematic framing, high-fashion styling and neon-drenched visual architecture captured with unrelenting discipline.',
    },
    {
      number: '03',
      title: 'FEELING',
      icon: Flame,
      accent: '#7136FF',
      description: 'Beyond technical excellence lies resonance. We create cultural artifacts designed to outlast algorithmic turnover.',
    },
  ];

  return (
    <section id="about" className="relative w-full py-24 md:py-36 section-hero-gradient-alt overflow-hidden select-none border-t border-white/10">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#D92CFF]/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Manifesto */}
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D92CFF] shadow-[0_0_10px_#D92CFF]" />
              <span className="text-[11px] font-mono-tech tracking-[0.3em] text-[#92909B] uppercase">
                ABOUT THE STUDIO
              </span>
            </div>

            <div className="mb-6">
              <ThiagovscLogo className="h-14 sm:h-18 w-auto max-w-[280px]" />
            </div>

            <h2 className="font-condensed font-extrabold text-5xl sm:text-6xl md:text-7xl uppercase tracking-wide leading-[0.95] mb-8">
              <span className="text-white">MORE THAN</span>
              <br />
              <span className="bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] bg-clip-text text-transparent">
                A NAME.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#F5F3F7]/90 leading-relaxed font-sans mb-8">
              THIAGOVSC is a creative universe where music, moving images, lifestyle and culture meet.
            </p>

            <p className="text-sm text-[#92909B] leading-relaxed font-sans mb-12">
              Conceived at the crossroads of European electronic minimalism and Latin American vibrant rhythm, the studio operates as a full-spectrum creative engine. Every release, reel, and visual campaign is an interconnected piece of a unified aesthetic universe.
            </p>

            {/* Studio Statistics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div>
                <span className="font-condensed font-extrabold text-3xl sm:text-4xl text-white">4.2M+</span>
                <span className="block text-[10px] font-mono-tech tracking-[0.2em] text-[#92909B] uppercase mt-1">
                  TOTAL REACH
                </span>
              </div>
              <div>
                <span className="font-condensed font-extrabold text-3xl sm:text-4xl text-[#D92CFF]">12+</span>
                <span className="block text-[10px] font-mono-tech tracking-[0.2em] text-[#92909B] uppercase mt-1">
                  PRODUCTIONS
                </span>
              </div>
              <div>
                <span className="font-condensed font-extrabold text-3xl sm:text-4xl text-white">100%</span>
                <span className="block text-[10px] font-mono-tech tracking-[0.2em] text-[#92909B] uppercase mt-1">
                  GOOD VIBES
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: The 3 Core Values (01 SOUND / 02 VISION / 03 FEELING) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="text-xs font-mono-tech tracking-[0.25em] text-[#92909B] uppercase">
              CORE PILLARS // PHILOSOPHY
            </span>

            <div className="flex flex-col gap-5">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;

                return (
                  <div
                    key={pillar.number}
                    className="group relative p-6 sm:p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/15 hover:border-[#D92CFF]/60 hover:bg-black/50 transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="font-mono-tech font-bold text-sm tracking-widest"
                          style={{ color: pillar.accent }}
                        >
                          {pillar.number} /
                        </span>
                        <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl text-white tracking-wide uppercase">
                          {pillar.title}
                        </h3>
                      </div>

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${pillar.accent}15` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: pillar.accent }} />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#92909B] leading-relaxed font-sans">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
