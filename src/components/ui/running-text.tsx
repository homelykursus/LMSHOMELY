'use client';

import { useEffect, useState } from 'react';

interface RunningTextProps {
  text: string;
  speed?: number; // pixels per second
  className?: string;
}

export function RunningText({ text, speed = 50, className = '' }: RunningTextProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Calculate animation duration based on text length and speed
  const duration = Math.max(text.length * 0.1, 10); // minimum 10 seconds

  useEffect(() => {
    // Reset animation when text changes
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [text]);

  if (!text.trim()) {
    return null;
  }

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className={`inline-block ${isVisible ? 'animate-marquee' : ''}`}
        style={{
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite'
        }}
      >
        {text}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation-name: marquee;
        }
      `}</style>
    </div>
  );
}