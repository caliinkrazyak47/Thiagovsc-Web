import React, { useRef, useState, useCallback } from 'react';

export interface MouseTiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number; // Maximum rotation in degrees (e.g. 12)
  scale?: number; // Scale on hover (e.g. 1.03)
  glareIntensity?: number; // Maximum glare opacity (e.g. 0.08)
  perspective?: number; // CSS perspective in px (default 1000)
}

export const MouseTiltCard: React.FC<MouseTiltCardProps> = ({
  children,
  className = '',
  tiltIntensity = 12,
  scale = 1.03,
  glareIntensity = 0.08,
  perspective = 1000,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      // Calculate tilt angles: x axis controls rotateY, y axis controls rotateX
      const rotateY = (x - 0.5) * (tiltIntensity * 2);
      const rotateX = -(y - 0.5) * (tiltIntensity * 2);

      setTransform({
        rotateX,
        rotateY,
        scale,
        glareX: x * 100,
        glareY: y * 100,
        glareOpacity: glareIntensity,
      });
    },
    [tiltIntensity, scale, glareIntensity]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative transform-gpu will-change-transform ${className}`}
      style={{
        perspective: `${perspective}px`,
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-150 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${transform.rotateX.toFixed(2)}deg) rotateY(${transform.rotateY.toFixed(2)}deg) scale3d(${transform.scale}, ${transform.scale}, 1)`,
          transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0.8, 0.4, 1)' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.4, 1)',
        }}
      >
        {children}

        {/* Dynamic Specular Glare Overlay */}
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: transform.glareOpacity,
            background: `radial-gradient(circle 350px at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.1) 45%, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
};

export default MouseTiltCard;
