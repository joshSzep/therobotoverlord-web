'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Ripple effect component for buttons and clickable elements
export const RippleEffect: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
}> = ({ children, className, color = 'rgba(255, 71, 87, 0.3)' }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const addRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: color,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );
};

// Hover lift effect for cards and interactive elements
export const HoverLift: React.FC<{
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}> = ({ children, className, intensity = 'medium' }) => {
  const intensityClasses = {
    subtle: 'hover:translate-y-[-2px] hover:shadow-md',
    medium: 'hover:translate-y-[-4px] hover:shadow-lg',
    strong: 'hover:translate-y-[-6px] hover:shadow-xl'
  };

  return (
    <div className={cn('transition-all duration-200 ease-out', intensityClasses[intensity], className)}>
      {children}
    </div>
  );
};

// Pulse animation for notifications and alerts
export const PulseAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  color?: string;
}> = ({ children, className, active = true, color = 'rgb(255, 71, 87)' }) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {active && (
        <div
          className="absolute inset-0 rounded-full animate-pulse opacity-75 pointer-events-none"
          style={{
            backgroundColor: color,
            animationDuration: '2s',
          }}
        />
      )}
    </div>
  );
};

// Bounce animation for success states and confirmations
export const BounceIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  trigger?: boolean;
}> = ({ children, className, trigger = true }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={cn(
      'transition-transform duration-300',
      shouldAnimate && 'animate-bounce',
      className
    )}>
      {children}
    </div>
  );
};

// Shake animation for errors and validation
export const ShakeAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
  trigger?: boolean;
}> = ({ children, className, trigger = false }) => {
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={cn(
      'transition-transform duration-100',
      shouldShake && 'animate-pulse',
      className
    )}>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      <div className={shouldShake ? 'animate-shake' : ''}>
        {children}
      </div>
    </div>
  );
};

// Glow effect for important elements
export const GlowEffect: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  active?: boolean;
}> = ({ children, className, color = 'rgb(255, 71, 87)', intensity = 'medium', active = true }) => {
  const intensityValues = {
    subtle: '0 0 10px',
    medium: '0 0 20px',
    strong: '0 0 30px'
  };

  return (
    <div
      className={cn('transition-all duration-300', className)}
      style={{
        boxShadow: active ? `${intensityValues[intensity]} ${color}` : 'none',
      }}
    >
      {children}
    </div>
  );
};

// Scale animation for interactive elements
export const ScaleOnHover: React.FC<{
  children: React.ReactNode;
  className?: string;
  scale?: number;
}> = ({ children, className, scale = 1.05 }) => {
  return (
    <div
      className={cn('transition-transform duration-200 ease-out cursor-pointer', className)}
      style={{
        transform: 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${scale})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {children}
    </div>
  );
};

// Fade in animation for content loading
export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ children, className, delay = 0, duration = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn('transition-opacity ease-in', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Slide in animation for panels and modals
export const SlideIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  trigger?: boolean;
  duration?: number;
}> = ({ children, className, direction = 'right', trigger = true, duration = 300 }) => {
  const [isVisible, setIsVisible] = useState(!trigger);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
    }
  }, [trigger]);

  const directionClasses = {
    left: isVisible ? 'translate-x-0' : '-translate-x-full',
    right: isVisible ? 'translate-x-0' : 'translate-x-full',
    up: isVisible ? 'translate-y-0' : '-translate-y-full',
    down: isVisible ? 'translate-y-0' : 'translate-y-full'
  };

  return (
    <div
      className={cn(
        'transition-transform ease-out',
        directionClasses[direction],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Loading dots animation
export const LoadingDots: React.FC<{
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className, color = 'rgb(255, 71, 87)', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn('rounded-full animate-pulse', sizeClasses[size])}
          style={{
            backgroundColor: color,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

// Typing indicator animation
export const TypingIndicator: React.FC<{
  className?: string;
  active?: boolean;
}> = ({ className, active = true }) => {
  if (!active) return null;

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <span className="text-muted-light text-sm">Typing</span>
      <LoadingDots size="sm" />
    </div>
  );
};

// Progress bar with animation
export const AnimatedProgressBar: React.FC<{
  progress: number;
  className?: string;
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
}> = ({
  progress,
  className,
  color = 'rgb(255, 71, 87)',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  height = 8,
  animated = true
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedProgress(progress), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animated]);

  return (
    <div
      className={cn('w-full rounded-full overflow-hidden', className)}
      style={{ backgroundColor, height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, animatedProgress))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

// Floating action button with micro-interactions
export const FloatingActionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}> = ({ children, onClick, className, position = 'bottom-right' }) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  return (
    <RippleEffect>
      <button
        onClick={onClick}
        className={cn(
          'w-14 h-14 bg-overlord-red hover:bg-authority-red text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 active:scale-95 z-50',
          positionClasses[position],
          className
        )}
      >
        {children}
      </button>
    </RippleEffect>
  );
};

export {
  RippleEffect as default,
};
