import React, { useState } from 'react';

interface ThiagovscLogoProps {
  className?: string;
  alt?: string;
}

/**
 * Official Thiagovsc Logo Component.
 * Uses the user's authentic logo image provided at:
 * https://imgur.com/a/piDeiId (direct image hash NVy01bH)
 * 
 * Features:
 * - referrerPolicy="no-referrer" to guarantee cross-origin image loading from Imgur
 * - Automatic fallback chain for formats (.png, .jpeg, .webp, and album id)
 * - mix-blend-screen to automatically transparentize any black background seamlessly
 * - Graceful loading and styling for responsive fit across header, mobile drawer, and footer
 */
export const ThiagovscLogo: React.FC<ThiagovscLogoProps> = ({
  className = 'h-11 sm:h-12 md:h-14 w-auto',
  alt = 'Thiagovsc Official Logo',
}) => {
  const sources = [
    '/thiagovsc-logo.png',
    '/logo.png',
    '/thiagovsc-clean-logo.png',
    '/logo-transparent.png',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleError = () => {
    if (currentIndex < sources.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <img
      src={sources[currentIndex]}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={`${className} object-contain mix-blend-screen select-none transition-all duration-300 pointer-events-auto`}
      loading="eager"
      decoding="async"
    />
  );
};
