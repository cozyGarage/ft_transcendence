import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { score, gameMode, resetGame } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game state
    const paddleHeight = 100;
    const paddleWidth = 10;
    const ballRadius = 10;
    
    let paddle1Y = (canvas.height - paddleHeight) / 2;
    let paddle2Y = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 3;

    const keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = () => {
      // Move paddles
      if (keys['w'] && paddle1Y > 0) paddle1Y -= 8;
      if (keys['s'] && paddle1Y < canvas.height - paddleHeight) paddle1Y += 8;
      
      if (gameMode === 'local') {
        if (keys['ArrowUp'] && paddle2Y > 0) paddle2Y -= 8;
        if (keys['ArrowDown'] && paddle2Y < canvas.height - paddleHeight) paddle2Y += 8;
      } else {
        // AI for single player
        const aiSpeed = 4;
        if (paddle2Y + paddleHeight / 2 < ballY) {
          paddle2Y = Math.min(paddle2Y + aiSpeed, canvas.height - paddleHeight);
        } else {
          paddle2Y = Math.max(paddle2Y - aiSpeed, 0);
        }
      }

      // Move ball
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Ball collision with top/bottom
      if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
      }

      // Ball collision with paddles
      if (
        ballX - ballRadius < paddleWidth + 20 &&
        ballY > paddle1Y &&
        ballY < paddle1Y + paddleHeight
      ) {
        ballSpeedX = Math.abs(ballSpeedX);
        ballSpeedX *= 1.05;
      }

      if (
        ballX + ballRadius > canvas.width - paddleWidth - 20 &&
        ballY > paddle2Y &&
        ballY < paddle2Y + paddleHeight
      ) {
        ballSpeedX = -Math.abs(ballSpeedX);
        ballSpeedX *= 1.05;
      }

      // Score
      if (ballX < 0) {
        useGameStore.getState().updateScore(score.player, score.opponent + 1);
        resetBall();
      }
      if (ballX > canvas.width) {
        useGameStore.getState().updateScore(score.player + 1, score.opponent);
        resetBall();
      }
    };

    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
      ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    };

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw center line
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw paddles
      ctx.fillStyle = '#00FFFC';
      ctx.fillRect(20, paddle1Y, paddleWidth, paddleHeight);
      
      ctx.fillStyle = '#FF00FF';
      ctx.fillRect(canvas.width - paddleWidth - 20, paddle2Y, paddleWidth, paddleHeight);

      // Draw ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw score
      ctx.fillStyle = '#ffffff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(score.player.toString(), canvas.width / 4, 60);
      ctx.fillText(score.opponent.toString(), (3 * canvas.width) / 4, 60);
    };

    const gameLoop = () => {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameMode, score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-4xl mb-4">
        <Button variant="ghost" onClick={resetGame} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <h2 className="text-2xl font-bold text-white">Pong</h2>
        <div className="w-20" />
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border-2 border-dark-200 rounded-lg"
        />
      </div>

      <div className="text-center text-gray-500 mt-4">
        <p>Player 1: W/S keys | Player 2: Arrow keys</p>
      </div>
    </div>
  );
}
