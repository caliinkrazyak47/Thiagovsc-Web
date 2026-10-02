import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Copy, Check } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState('Music');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const projectOptions = [
    'Music',
    'Reels / TikTok',
    'Creative Direction',
    'Collaboration',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioEngine.playClickFx();
    if (!name || !email) return;

    setIsSubmitted(true);
    setTimeout(() => {
      // Keep feedback for 4 seconds, then reset
      setTimeout(() => {
        setIsSubmitted(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 4000);
    }, 100);
  };

  const handleCopyEmail = () => {
    audioEngine.playClickFx();
    navigator.clipboard.writeText('HELLO@THIAGOVSC.COM');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="contact" className="relative w-full py-24 md:py-36 section-hero-gradient overflow-hidden select-none border-t border-white/10 z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Huge Editorial Heading & Direct Contact Info */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#D92CFF] shadow-[0_0_10px_#D92CFF]" />
                <span className="text-[11px] font-mono-tech tracking-[0.3em] text-[#92909B] uppercase">
                  START A CONVERSATION
                </span>
              </div>

              {/* Exact Prompt Heading */}
              <h2 className="font-condensed font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-wide uppercase leading-[0.92] mb-8">
                LET'S MAKE
                <br />
                SOMETHING
                <br />
                <span className="bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] bg-clip-text text-transparent">
                  MATTER.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[#92909B] max-w-md font-sans mb-10 leading-relaxed">
                Available for worldwide brand collaborations, audio production commissions, high-retention short-form creative direction, and private showcase appearances.
              </p>
            </div>

            {/* Direct Email Pill with Copy Function */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <span className="text-[10px] font-mono-tech tracking-[0.25em] text-[#92909B] uppercase block mb-2">
                  DIRECT INBOX
                </span>

                <button
                  onClick={handleCopyEmail}
                  className="group flex items-center gap-3 text-lg sm:text-2xl font-mono-tech font-bold text-white hover:text-[#D92CFF] transition-colors cursor-pointer"
                >
                  <span>HELLO@THIAGOVSC.COM</span>
                  <span className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-[#D92CFF]">
                    {copiedEmail ? <Check className="w-4 h-4 text-[#D92CFF]" /> : <Copy className="w-4 h-4" />}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Luxury Underlined Form with frosted glass backdrop */}
          <div className="lg:col-span-6 bg-black/45 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {isSubmitted ? (
              <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#D92CFF]/20 border border-[#D92CFF] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(217,44,255,0.4)]">
                  <CheckCircle2 className="w-8 h-8 text-[#D92CFF]" />
                </div>
                <h3 className="font-condensed font-extrabold text-3xl sm:text-4xl text-white uppercase mb-2">
                  TRANSMISSION RECEIVED
                </h3>
                <p className="text-sm font-mono-tech text-[#92909B] max-w-sm tracking-wide">
                  Thank you for reaching out. We will review your proposal and respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* YOUR NAME */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-mono-tech tracking-[0.2em] text-[#92909B] uppercase">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ALEXIS VANCE"
                    className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-mono-tech text-base focus:border-[#D92CFF] focus:outline-none transition-colors placeholder:text-white/20"
                  />
                </div>

                {/* EMAIL ADDRESS */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-mono-tech tracking-[0.2em] text-[#92909B] uppercase">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ALEXIS@DOMAIN.COM"
                    className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-mono-tech text-base focus:border-[#D92CFF] focus:outline-none transition-colors placeholder:text-white/20"
                  />
                </div>

                {/* PROJECT TYPE SELECTOR */}
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-mono-tech tracking-[0.2em] text-[#92909B] uppercase">
                    PROJECT TYPE
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {projectOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => {
                          audioEngine.playClickFx();
                          setProjectType(opt);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-mono-tech tracking-[0.15em] transition-all cursor-pointer ${
                          projectType === opt
                            ? 'bg-[#D92CFF] text-white font-semibold shadow-[0_0_15px_rgba(217,44,255,0.4)]'
                            : 'border border-white/15 bg-white/5 text-[#92909B] hover:text-white hover:border-white/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* YOUR MESSAGE */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-mono-tech tracking-[0.2em] text-[#92909B] uppercase">
                    YOUR MESSAGE
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the timeline, scope and creative goals..."
                    className="w-full bg-transparent border-b border-white/20 pb-2 text-white font-mono-tech text-sm focus:border-[#D92CFF] focus:outline-none transition-colors placeholder:text-white/20 resize-none"
                  />
                </div>

                {/* CTA BUTTON */}
                <button
                  type="submit"
                  className="group w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-[#D92CFF] via-[#F03BBE] to-[#7136FF] text-white font-mono-tech text-xs tracking-[0.25em] font-bold uppercase shadow-[0_0_30px_rgba(217,44,255,0.5)] hover:shadow-[0_0_40px_rgba(217,44,255,0.8)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>SEND MESSAGE</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
