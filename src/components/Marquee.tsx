import React from 'react';

export const Marquee: React.FC = () => {
  const phrases = [
    'RENTLUX',
    'ALTA GAMA DEPORTIVOS',
    'SONIDO & VISION',
    'BUENAS VIBRAS',
    'DISEÑO UNICO',
    'EL MUNDO ES TUYO',
  ];

  return (
    <div className="relative w-full py-8 md:py-10 bg-[#120722]/90 backdrop-blur-2xl border-y border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden select-none z-20">
      {/* Ambient subtle violet glow layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_100%_at_50%_50%,rgba(217,44,255,0.08),transparent_70%)] pointer-events-none" />

      {/* Subtle edge fades matching the dark atmospheric background */}
      <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#120722] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#120722] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center">
        {/* First repetition */}
        <div className="flex items-center gap-10 md:gap-16 pr-10 md:pr-16 shrink-0">
          {phrases.map((phrase, idx) => (
            <div key={`phrase-1-${idx}`} className="flex items-center gap-10 md:gap-16">
              <span className="font-condensed font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-[0.12em] uppercase whitespace-nowrap drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] hover:text-[#D92CFF] transition-colors">
                {phrase}
              </span>
              <span className="text-lg md:text-xl text-[#D92CFF] select-none drop-shadow-[0_0_10px_rgba(217,44,255,0.7)]">
                ✦
              </span>
            </div>
          ))}
        </div>

        {/* Second repetition for infinite seamless loop */}
        <div className="flex items-center gap-10 md:gap-16 pr-10 md:pr-16 shrink-0">
          {phrases.map((phrase, idx) => (
            <div key={`phrase-2-${idx}`} className="flex items-center gap-10 md:gap-16">
              <span className="font-condensed font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-[0.12em] uppercase whitespace-nowrap drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] hover:text-[#D92CFF] transition-colors">
                {phrase}
              </span>
              <span className="text-lg md:text-xl text-[#D92CFF] select-none drop-shadow-[0_0_10px_rgba(217,44,255,0.7)]">
                ✦
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

