import * as React from 'react';
import { cn } from '@/lib/utils';

interface BallProps {
  x: number; // Horizontal position (percentage from left)
  y: number; // Vertical position (percentage from top)
  size?: number; // Size of the ball in pixels
  color?: string; // Tailwind color class
}

const Ball: React.FC<BallProps> = ({ x, y, size = 30, color = 'bg-red-500' }) => {
  return (
    <div
      className={cn(
        "absolute rounded-full shadow-xl transition-transform duration-50 ease-linear",
        "ring-2 ring-offset-2 ring-opacity-75", // Added ring for premium look
        color,
        color === 'bg-red-500' && 'ring-red-400',
        color === 'bg-green-500' && 'ring-green-400',
        color === 'bg-yellow-500' && 'ring-yellow-400',
        color === 'bg-purple-500' && 'ring-purple-400',
      )}
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)', // Center the ball based on x, y
      }}
    />
  );
};

export default Ball;