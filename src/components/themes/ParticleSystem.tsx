import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

interface ParticleSystemProps {
  type?: 'floating' | 'shimmer' | 'orbital' | 'bubble' | 'shard' | 'mixed';
  density?: 'low' | 'medium' | 'high';
  enabled?: boolean;
  className?: string;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  type = 'mixed',
  density = 'medium',
  enabled = true,
  className = '',
}) => {
  const { currentTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const getParticleCount = () => {
    switch (density) {
      case 'low':
        return 15;
      case 'high':
        return 50;
      default:
        return 30;
    }
  };

  const createParticle = (index: number, particleType: string) => {
    const delay = Math.random() * 5; // Random delay up to 5 seconds
    const left = Math.random() * 100; // Random horizontal position
    const size = Math.random() * 0.5 + 0.5; // Random size multiplier
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${left}%`,
      animationDelay: `${delay}s`,
      transform: `scale(${size})`,
    };

    switch (particleType) {
      case 'floating':
        return (
          <div
            key={`floating-${index}`}
            className="particle-floating"
            style={baseStyle}
          />
        );
      
      case 'shimmer':
        return (
          <div
            key={`shimmer-${index}`}
            className="particle-shimmer"
            style={{
              ...baseStyle,
              top: `${Math.random() * 100}%`,
            }}
          />
        );
      
      case 'orbital':
        return (
          <div
            key={`orbital-${index}`}
            className="particle-orbital"
            style={{
              ...baseStyle,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${size})`,
            }}
          />
        );
      
      case 'bubble':
        return (
          <div
            key={`bubble-${index}`}
            className="particle-bubble"
            style={baseStyle}
          />
        );
      
      case 'shard':
        return (
          <div
            key={`shard-${index}`}
            className="particle-shard"
            style={baseStyle}
          />
        );
      
      default:
        return null;
    }
  };

  const generateParticles = () => {
    const count = getParticleCount();
    const particles: React.ReactElement[] = [];
    
    if (type === 'mixed') {
      const types = ['floating', 'shimmer', 'bubble', 'shard'];
      for (let i = 0; i < count; i++) {
        const particleType = types[i % types.length];
        const particle = createParticle(i, particleType);
        if (particle) particles.push(particle);
      }
    } else {
      for (let i = 0; i < count; i++) {
        const particle = createParticle(i, type);
        if (particle) particles.push(particle);
      }
    }
    
    return particles;
  };

  const generateLightRays = () => {
    const rayCount = 3;
    const rays: React.ReactElement[] = [];
    
    for (let i = 0; i < rayCount; i++) {
      const delay = Math.random() * 8;
      const opacity = Math.random() * 0.3 + 0.1;
      
      rays.push(
        <div
          key={`light-ray-${i}`}
          className="light-ray"
          style={{
            animationDelay: `${delay}s`,
            opacity: opacity,
            left: `${Math.random() * 100}%`,
          }}
        />
      );
    }
    
    return rays;
  };

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion && containerRef.current) {
      containerRef.current.style.display = 'none';
    }
  }, []);

  // Don't render particles on mobile for performance
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        if (window.innerWidth < 768) {
          containerRef.current.style.display = 'none';
        } else {
          containerRef.current.style.display = enabled ? 'block' : 'none';
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`particle-container ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {generateParticles()}
      {generateLightRays()}
    </div>
  );
};

export default ParticleSystem;