import * as React from 'react';
import GameLayout from '@/components/GameLayout';
import { Button } from '@/components/ui/button';
import Ball from '@/components/Ball';
import Basket from '@/components/Basket';
import { toast } from 'sonner';

interface BallState {
  id: number;
  x: number; // Percentage from left
  y: number; // Percentage from top
  speed: number;
  color: string;
}

const GAME_AREA_WIDTH = 100; // Percentage
const GAME_AREA_HEIGHT = 100; // Percentage
const BASKET_WIDTH_PERCENT = 12; // Approximate width of basket in percentage of game area
const BALL_SIZE_PX = 30; // Size of the ball in pixels
const LEVEL_UP_SCORE_THRESHOLD = 100; // Score needed to advance each level

const Game = () => {
  const [score, setScore] = React.useState(0);
  const [lives, setLives] = React.useState(3);
  const [level, setLevel] = React.useState(1); // New level state
  const [isGameOver, setIsGameOver] = React.useState(false);
  const [gameActive, setGameActive] = React.useState(false);
  const [balls, setBalls] = React.useState<BallState[]>([]);
  const [basketX, setBasketX] = React.useState(GAME_AREA_WIDTH / 2);

  const gameAreaRef = React.useRef<HTMLDivElement>(null);
  const animationFrameRef = React.useRef<number>();
  const lastBallSpawnTimeRef = React.useRef<number>(0);
  const lastScoreRef = React.useRef(0); // To track score changes for level up

  const spawnBall = React.useCallback((currentLevel: number) => {
    const baseSpeed = 0.5;
    const speedMultiplier = 0.15; // How much speed increases per level
    const newBall: BallState = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_AREA_WIDTH - 5) + 2.5,
      y: -5,
      speed: baseSpeed + (currentLevel - 1) * speedMultiplier + Math.random() * 0.3, // Speed increases with level
      color: ['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500'][Math.floor(Math.random() * 5)],
    };
    setBalls((prevBalls) => [...prevBalls, newBall]);
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setIsGameOver(false);
    setGameActive(true);
    setBalls([]);
    setBasketX(GAME_AREA_WIDTH / 2);
    lastBallSpawnTimeRef.current = performance.now();
    lastScoreRef.current = 0;
    toast.success("Game Started! Catch the balls!", { duration: 2000 });
  };

  const endGame = React.useCallback(() => {
    setGameActive(false);
    setIsGameOver(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    toast.error(`Game Over! You reached Level ${level} with a score of ${score}!`, { duration: 5000 });
  }, [score, level]);

  // Game Loop
  React.useEffect(() => {
    if (!gameActive) return;

    const gameLoop = (currentTime: DOMHighResTimeStamp) => {
      setBalls((prevBalls) => {
        const updatedBalls: BallState[] = [];
        let newLives = lives;
        let newScore = score;
        let currentLevel = level;

        const gameAreaHeightPx = gameAreaRef.current?.clientHeight || 1;
        const gameAreaWidthPx = gameAreaRef.current?.clientWidth || 1;
        const basketWidthPx = (BASKET_WIDTH_PERCENT / 100) * gameAreaWidthPx;
        const basketXCenterPx = (basketX / 100) * gameAreaWidthPx;
        const basketHeightPx = 30; // Fixed basket height
        const basketTopYPx = gameAreaHeightPx - basketHeightPx;

        prevBalls.forEach((ball) => {
          const newY = ball.y + ball.speed * (100 / gameAreaHeightPx); // Adjust speed based on game area height
          const ballBottomYPx = (newY / 100) * gameAreaHeightPx + BALL_SIZE_PX / 2;
          const ballCenterXPx = (ball.x / 100) * gameAreaWidthPx;

          // Collision detection
          const isCollidingWithBasket =
            ballBottomYPx >= basketTopYPx &&
            ballBottomYPx <= gameAreaHeightPx &&
            ballCenterXPx >= basketXCenterPx - basketWidthPx / 2 &&
            ballCenterXPx <= basketXCenterPx + basketWidthPx / 2;

          if (isCollidingWithBasket) {
            newScore += 10;
            toast.success("Caught!", { duration: 1000, style: { background: 'linear-gradient(to right, #10B981, #34D399)', color: 'white' } });
          } else if (newY < GAME_AREA_HEIGHT + BALL_SIZE_PX) {
            updatedBalls.push({ ...ball, y: newY });
          } else { // Ball missed
            newLives -= 1;
            toast.warning("Missed!", { duration: 1000, style: { background: 'linear-gradient(to right, #EF4444, #F87171)', color: 'white' } });
          }
        });

        // Level up logic
        if (newScore >= currentLevel * LEVEL_UP_SCORE_THRESHOLD && newScore > lastScoreRef.current) {
          currentLevel += 1;
          newLives += 1; // Bonus life for leveling up
          toast.info(`Level Up! You are now on Level ${currentLevel}! (+1 Life)`, { duration: 3000, style: { background: 'linear-gradient(to right, #6366F1, #818CF8)', color: 'white' } });
          setLevel(currentLevel);
        }
        lastScoreRef.current = newScore;

        setScore(newScore);
        setLives(newLives);

        if (newLives <= 0) {
          endGame();
        }

        return updatedBalls;
      });

      // Spawn new balls periodically
      const minSpawnInterval = 500; // Fastest spawn
      const maxSpawnInterval = 2000; // Slowest spawn
      const spawnRateReductionPerLevel = 100; // How much faster per level
      const currentSpawnInterval = Math.max(minSpawnInterval, maxSpawnInterval - (level - 1) * spawnRateReductionPerLevel);

      const timeSinceLastSpawn = currentTime - lastBallSpawnTimeRef.current;
      if (timeSinceLastSpawn > currentSpawnInterval) {
        spawnBall(level);
        lastBallSpawnTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameActive, lives, score, level, spawnBall, endGame, basketX]);

  // Keyboard controls for basket
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!gameActive) return;

      const step = 3; // Movement step in percentage
      if (event.key === 'ArrowLeft') {
        setBasketX((prevX) => Math.max(BASKET_WIDTH_PERCENT / 2, prevX - step));
      } else if (event.key === 'ArrowRight') {
        setBasketX((prevX) => Math.min(GAME_AREA_WIDTH - BASKET_WIDTH_PERCENT / 2, prevX + step));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameActive]);

  return (
    <GameLayout score={score} lives={lives} level={level}>
      <div
        ref={gameAreaRef}
        className="relative w-full max-w-screen-lg h-[80vh] bg-gradient-to-br from-blue-300/30 to-purple-500/30 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/30 flex items-center justify-center"
      >
        {/* Game Area */}
        {!gameActive && !isGameOver && (
          <div className="text-center text-white text-3xl font-bold p-8 bg-black/40 rounded-lg shadow-xl">
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">
              Catch the Ball!
            </h1>
            <p className="mb-6 text-xl">Use <span className="font-mono bg-white/20 px-2 py-1 rounded">←</span> and <span className="font-mono bg-white/20 px-2 py-1 rounded">→</span> to move your basket.</p>
            <p className="mb-8 text-xl">Catch falling balls to score points and level up!</p>
            <Button onClick={startGame} className="mt-8 px-10 py-5 text-2xl bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg transform hover:scale-105">
              Start Game
            </Button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 p-8">
            <h2 className="text-6xl font-extrabold text-white mb-4 animate-pulse bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              Game Over!
            </h2>
            <p className="text-3xl text-white mb-4">Final Score: <span className="font-bold text-yellow-300">{score}</span></p>
            <p className="text-3xl text-white mb-8">Level Reached: <span className="font-bold text-blue-300">{level}</span></p>
            <Button onClick={startGame} className="px-10 py-5 text-2xl bg-green-500 hover:bg-green-600 transition-colors shadow-lg transform hover:scale-105">
              Play Again
            </Button>
          </div>
        )}

        {gameActive && (
          <>
            {balls.map((ball) => (
              <Ball key={ball.id} x={ball.x} y={ball.y} size={BALL_SIZE_PX} color={ball.color} />
            ))}
            <Basket x={basketX} width={(BASKET_WIDTH_PERCENT / 100) * (gameAreaRef.current?.clientWidth || 1000)} />
          </>
        )}
      </div>
    </GameLayout>
  );
};

export default Game;