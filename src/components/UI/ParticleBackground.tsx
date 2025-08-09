import React, { useEffect, useRef } from 'react';
import { getPerformanceSettings } from '../../utils/performance';

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  speed?: number;
  className?: string;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 50,
  colors = ['#22c55e', '#f97316', '#3b82f6', '#8b5cf6'],
  speed = 1,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
  }>>([]);
  const animationRef = useRef<number>();

  // Get performance settings
  const performanceSettings = getPerformanceSettings();
  const optimizedParticleCount = performanceSettings.enableParticles 
    ? Math.min(particleCount, performanceSettings.particleCount || 50)
    : 0;
  const optimizedSpeed = performanceSettings.enableParticles ? speed : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || optimizedParticleCount === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const createParticles = () => {
      particlesRef.current = [];
      const rect = canvas.getBoundingClientRect();
      
      for (let i = 0; i < optimizedParticleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * optimizedSpeed,
          vy: (Math.random() - 0.5) * optimizedSpeed,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.5 + 0.3
        });
      }
    };

    const animate = () => {
      if (!performanceSettings.enableParticles) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // Draw connections - only for nearby particles to improve performance
        particlesRef.current.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (100 - distance) / 100 * 0.2;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    
    if (performanceSettings.enableParticles) {
      animate();
    }

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [optimizedParticleCount, colors, optimizedSpeed, performanceSettings.enableParticles]);

  // Don't render if particles are disabled
  if (!performanceSettings.enableParticles) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        width: '100%', 
        height: '100%',
        willChange: 'transform' // Optimize for animations
      }}
    />
  );
};

export default ParticleBackground;