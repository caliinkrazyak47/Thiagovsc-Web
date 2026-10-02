import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { ThiagovscLogo } from './ThiagovscLogo';

interface HeaderProps {
  onOpenContact: () => void;
  onOpenShowreel?: () => void;
  onOpenRadio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenContact, onOpenRadio, onOpenShowreel }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'TV ONLINE', href: '#tv-online', isLive: true },
    { label: 'RADIO EN VIVO', href: '#radio', isLive: false },
    { label: 'MUSIC', href: '#music' },
    { label: 'TIKTOK', href: '#tiktok' },
    { label: 'CONTACT', href: '#contact' },
  ];

  const secondaryLinks: { label: string; href: string }[] = [];

  const handleNavClick = (href: string) => {
    audioEngine.playClickFx();
    setMobileMenuOpen(false);
    if (href === '#radio') {
      if (onOpenRadio) onOpenRadio();
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0D0714]/90 backdrop-blur-md border-b border-white/10 py-2.5 sm:py-3 shadow-2xl shadow-black/80'
            : 'bg-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Left Zone: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                audioEngine.playClickFx();
              }}
              className="group flex items-center transition-transform duration-200"
              aria-label="Thiagovsc Home"
            >
              <ThiagovscLogo
                className={`${
                  isScrolled ? 'h-14 sm:h-16 md:h-18' : 'h-20 sm:h-24 md:h-28 lg:h-32'
                } w-auto max-w-[320px] sm:max-w-[420px] md:max-w-[500px] group-hover:scale-[1.02] transition-all duration-300`}
              />
            </a>

            <nav className="hidden lg:flex items-center gap-6 ml-4 pl-6 border-l border-white/10" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-xs font-mono-tech tracking-[0.18em] transition-colors duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    link.isLive ? 'text-[#D92CFF] hover:text-white font-bold' : 'text-[#92909B] hover:text-white'
                  }`}
                >
                  {link.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Zone: Secondary links, Contact CTA, Showreel trigger, Mobile toggle */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="hidden xl:flex items-center gap-5">
              {secondaryLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-xs font-mono-tech tracking-[0.18em] text-[#92909B] hover:text-white transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                audioEngine.playClickFx();
                onOpenContact();
              }}
              className="text-xs font-mono-tech tracking-[0.18em] text-white hover:text-[#D92CFF] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              CONTACT
              <ArrowUpRight className="w-3.5 h-3.5 text-[#D92CFF]" />
            </button>

            {/* Hamburger Menu Toggle (matching Screenshot 1) */}
            <button
              onClick={() => {
                audioEngine.playClickFx();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white transition-colors cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#D92CFF]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0D0714]/95 backdrop-blur-xl flex flex-col justify-between p-8 pt-28 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
            <span className="text-[10px] font-mono-tech tracking-[0.3em] text-[#D92CFF] uppercase">
              INDEX // NAVIGATION
            </span>
            <div className="flex flex-col gap-4">
              {[...navLinks, ...secondaryLinks].map((link, idx) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="flex items-center justify-between text-left py-2 border-b border-white/10 text-xl font-display tracking-wider text-white hover:text-[#D92CFF] transition-colors cursor-pointer"
                >
                  <span>{link.label}</span>
                  <span className="text-xs font-mono-tech text-[#92909B]">0{idx + 1}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenRadio) onOpenRadio();
                  else if (onOpenShowreel) onOpenShowreel();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#D92CFF] to-[#7136FF] text-white font-mono-tech text-xs tracking-[0.2em] font-semibold rounded-lg shadow-lg shadow-[#D92CFF]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span>RADIO EN VIVO ▶</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full py-3.5 border border-white/20 bg-white/5 text-white font-mono-tech text-xs tracking-[0.2em] rounded-lg hover:border-white/40 cursor-pointer"
              >
                GET IN TOUCH ↗
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto w-full pt-8 flex items-center justify-between text-xs font-mono-tech text-[#92909B] border-t border-white/10">
            <span>© 2026 THIAGOVSC</span>
            <span>INSTAGRAM · TIKTOK</span>
          </div>
        </div>
      )}
    </>
  );
};
