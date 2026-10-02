import React from 'react';
import { LIFESTYLE_ITEMS } from '../data/content';
import { ArrowUpRight, Compass } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const LifestyleSection: React.FC = () => {
  return (
    <section id="lifestyle" className="relative w-full py-24 md:py-36 section-hero-gradient overflow-hidden select-none border-t border-white/10">
      {/* Background Lighting */}
      <div className="absolute top-1/4 right-1/6 w-[600px] h-[600px] bg-[#7136FF]/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/6 w-[550px] h-[550px] bg-[#D92CFF]/8 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#F03BBE] shadow-[0_0_10px_#F03BBE]" />
              <span className="text-[11px] font-mono-tech tracking-[0.3em] text-[#92909B] uppercase">
                CURATED ENVIRONMENTS // EDITION 2026
              </span>
            </div>
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl md:text-7xl text-white tracking-wide uppercase">
              BEYOND ORDINARY.
            </h2>
          </div>

          {/* Editorial Quote matching prompt specifications */}
          <div className="mt-6 lg:mt-0 max-w-md">
            <blockquote className="text-base sm:text-lg text-white/90 font-light italic leading-relaxed border-l-2 border-[#D92CFF] pl-4">
              “Some nights become stories. Some stories become a way of life.”
            </blockquote>
            <span className="text-[11px] font-mono-tech tracking-[0.2em] text-[#92909B] block mt-2 pl-4 uppercase">
              — THIAGOVSC ARCHIVE
            </span>
          </div>
        </div>

        {/* Asymmetrical Magazine Layout */}
        <div className="grid grid-cols-12 gap-6 md:gap-8">
          {LIFESTYLE_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              className={`${item.aspect} group relative rounded-2xl overflow-hidden border border-white/15 min-h-[380px] md:min-h-[440px] flex flex-col justify-between p-6 sm:p-8 transition-all duration-300 hover:border-white/30`}
              style={{ background: item.gradient }}
            >
              {/* Subtle Architectural SVG Graphic */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`grid-${idx}`} width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-${idx})`} />
                </svg>
              </div>

              {/* Ambient Radial Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 pointer-events-none" />

              {/* Top Tag & Compass Pin */}
              <div className="relative z-10 flex items-center justify-between">
                <span
                  className="text-[10px] font-mono-tech tracking-[0.25em] uppercase font-bold px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10"
                  style={{ color: item.accent }}
                >
                  {item.tag}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono-tech text-white/70">
                  <Compass className="w-3.5 h-3.5 text-[#D92CFF]" />
                  <span className="hidden sm:inline">{item.location}</span>
                </div>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 max-w-lg">
                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-wide uppercase mb-2 group-hover:text-[#D92CFF] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#F5F3F7]/80 leading-relaxed font-sans mb-4">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-mono-tech text-[#92909B] group-hover:text-white transition-colors">
                  <span className="uppercase tracking-[0.2em]">VIEW STORY</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Editorial Banner with custom artwork backdrop */}
        <div className="relative overflow-hidden mt-12 p-8 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none mix-blend-luminosity"
            style={{ backgroundImage: `url('/site-background.jpg')` }}
          />
          <div className="relative z-10 flex flex-col">
            <span className="text-xs font-mono-tech text-[#D92CFF] tracking-[0.2em] uppercase font-semibold">
              EXPERIENCE ARCHITECTURE
            </span>
            <span className="font-condensed font-bold text-2xl text-white uppercase mt-1">
              WHERE CREATIVE DIRECTION MEETS SENSORY LUXURY
            </span>
          </div>

          <button
            onClick={() => {
              audioEngine.playClickFx();
              const contactEl = document.querySelector('#contact');
              if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-xl border border-white/20 hover:border-[#D92CFF] bg-white/5 hover:bg-[#D92CFF]/15 text-white font-mono-tech text-xs tracking-[0.2em] uppercase transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            INQUIRE COLLABORATION ↗
          </button>
        </div>
      </div>
    </section>
  );
};
