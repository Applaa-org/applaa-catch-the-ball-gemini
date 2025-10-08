import * as React from 'react';
import { Link } from '@tanstack/react-router'; // Outlet is only needed in the root route, not here
import { MadeWithApplaa } from '@/components/made-with-applaa';
// import { cn } from '@/lib/utils'; // cn is not used in this component
import { Heart, Trophy } from 'lucide-react';

interface GameLayoutProps {
  score: number;
  lives: number;
  children: React.ReactNode;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ score, lives, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-400 to-purple-600 text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Catch the Ball
            </span>
          </Link>
          <div className="flex items-center space-x-6 text-gray-800">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold">Score: {score}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-lg font-semibold">Lives: {lives}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 bg-white/80 backdrop-blur-md text-center text-gray-600 text-sm shadow-inner">
        <MadeWithApplaa />
      </footer>
    </div>
  );
};

export default GameLayout;