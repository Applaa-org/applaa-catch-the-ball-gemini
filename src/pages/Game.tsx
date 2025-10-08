import * as React from 'react';
import GameLayout from '@/components/GameLayout';
import { Button } from '@/components/ui/button';
import Ball from '@/components/Ball';
import Basket from '@/components/Basket';
import { toast } from 'sonner'; // Using sonner for game notifications

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

const Game = () => {
  const [score, setScore] = React.useState(0);
  const [lives, setLives] = React.useState(3);
  const [isGameOver, setIsGameOver] = React.useState(false);
  const [gameActive, setGameActive] = React.useState(false);
  const [balls, setBalls] = React.useState<BallState[]>([]);
  const [basketX, setBasketX] = React.useState(GAME_AREA_WIDTH / 2); // Basket's horizontal position (percentage)

  const gameAreaRef = React.useRef<HTMLDivElement>(null);
  const animationFrameRef = React.useRef<number>();
  const lastBallSpawnTimeRef = React.useRef<number>(0);

  const spawnBall = React.useCallback(() => {
    const newBall: BallState = {
      id: Date.now() + Math.random(),
      x: Math.random() * (GAME_AREA_WIDTH - 5) + 2.5, // Random X position, avoiding edges
      y: -5, // Start above the visible area
      speed: 0.5 + Math.random() * 0.5, // Random speed
      color: ['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][Math.floor(Math.random() * 4)],
    };
    setBalls((prevBalls) => [...prevBalls, newBall]);
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setGameActive(true);
    setBalls([]);
    setBasketX(GAME_AREA_WIDTH / 2);
    lastBallSpawnTimeRef.current = performance.now();
    toast.success("Game Started! Catch the balls!");
  };

  const endGame = React.useCallback(() => {
    setGameActive(false);
    setIsGameOver(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    toast.error(`Game Over! Your final score: ${score}`);
  }, [score]);

  // Game Loop
  React.useEffect(() => {
    if (!gameActive) return;

    const gameLoop = (currentTime: DOMHighResTimeStamp) => {
      setBalls((prevBalls) => {
        const updatedBalls: BallState[] = [];
        let newLives = lives;
        let newScore = score;

        const gameAreaHeightPx = gameAreaRef.current?.clientHeight || 1;
        const gameAreaWidthPx = gameAreaRef.current?.clientWidth || 1;
        const basketWidthPx = (BASKET_WIDTH_PERCENT / 100) * gameAreaWidthPx;
        const basketXCenterPx = (basketX / 100) * gameAreaWidthPx;

        prevBalls.forEach((ball) => {
          const newY = ball.y + ball.speed * (100 / gameAreaHeightPx); // Adjust speed based on game area height
          const ballBottomYPx = (newY / 100) * gameAreaHeightPx + BALL_SIZE_PX / 2; // Ball's bottom edge in pixels
          const basketTopYPx = gameAreaHeightPx - (30 / gameAreaHeightPx) * 100; // Basket height is 30px, convert to percentage from top

          // Collision detection
          const isCollidingWithBasket =
            ballBottomYPx >= basketTopYPx &&
            ballBottomYPx <= gameAreaHeightPx && // Ball is within basket's vertical range
            (ball.x / 100) * gameAreaWidthPx >= basketXCenterPx - basketWidthPx / 2 && // Ball's left edge is within basket
            (ball.x / 100) * gameAreaWidthPx <= basketXCenterPx + basketWidthPx / 2; // Ball's right edge is within basket

          if (isCollidingWithBasket) {
            newScore += 10;
            toast.success("Caught!", { duration: 1000 });
          } else if (newY < GAME_AREA_HEIGHT + BALL_SIZE_PX) { // Ball is still within or just below the screen
            updatedBalls.push({ ...ball, y: newY });
          } else { // Ball missed
            newLives -= 1;
            toast.warning("Missed!", { duration: 1000 });
          }
        });

        setScore(newScore);
        setLives(newLives);

        if (newLives <= 0) {
          endGame();
        }

        return updatedBalls;
      });

      // Spawn new balls periodically
      const timeSinceLastSpawn = currentTime - lastBallSpawnTimeRef.current;
      if (timeSinceLastSpawn > 1500 - score / 50) { // Spawn faster as score increases
        spawnBall();
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
  }, [gameActive, lives, score, spawnBall, endGame, basketX]);

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
    <GameLayout score={score} lives={lives}>
      <div
        ref={gameAreaRef}
        className="relative w-full max-w-screen-lg h-[80vh] bg-white/20 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/30 flex items-center justify-center"
      >
        {/* Game Area */}
        {!gameActive && !isGameOver && (
          <div className="text-center text-white text-3xl font-bold">
            <p className="mb-4">Catch the falling balls to score points!</p>
            <Button onClick={startGame} className="mt-8 px-8 py-4 text-xl bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg">
              Start Game
            </Button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
            <h2 className="text-5xl font-extrabold text-white mb-4 animate-pulse">Game Over!</h2>
            <p className="text-3xl text-white mb-8">Final Score: {score}</p>
            <Button onClick={startGame} className="px-8 py-4 text-xl bg-green-500 hover:bg-green-600 transition-colors shadow-lg">
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