import React, { useState } from 'react';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  className = '',
  intensity = 20
}) => {
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / centerY * intensity;
    const rotateY = (centerX - x) / centerX * intensity;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.3
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 0, y: 0, opacity: 0 });
  };

  return (
    <div
      className={`relative transform-gpu transition-transform duration-200 ease-out ${className}`}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Holographic background */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-green-500/20 animate-rainbow opacity-30" />
      
      {/* Glare effect */}
      <div
        className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.8) 0%, transparent 50%)`,
          opacity: glare.opacity
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default HolographicCard;