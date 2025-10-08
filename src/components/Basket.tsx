import * as React from 'react';
import { cn } from '@/lib/utils';

interface BasketProps {
  x: number; // Horizontal position (percentage from left)
  width?: number; // Width of the basket in pixels
  height?: number; // Height of the basket in pixels
}

const Basket: React.FC<BasketProps> = ({ x, width = 120, height = 30 }) => {
  return (
    <div
      className={cn(
        "absolute bottom-0 bg-blue-700 rounded-t-full shadow-xl border-t-4 border-blue-800",
        "transition-transform duration-75 ease-out" // Smooth movement
      )}
      style={{
        width: width,
        height: height,
        left: `${x}%`,
        transform: 'translateX(-50%)', // Center the basket based on x
      }}
    >
      <div className="absolute inset-x-0 top-0 h-2 bg-blue-900 rounded-t-full opacity-75"></div>
    </div>
  );
};

export default Basket;