import { useGameState } from "@/hooks/useGameState";
import { formatTimeRemaining, formatDoge } from "@/lib/game";
import GameVisualizer from "@/components/GameVisualizer";
import BettingControls from "@/components/BettingControls";
import ActivityFeed from "@/components/ActivityFeed";

const GamePage = () => {
  const { 
    playerCount, 
    totalBetAmount, 
    countdown, 
    gameState
  } = useGameState();

  return (
    <main className="flex-1 flex flex-col">
      {/* Game Area */}
      <div className="relative bg-darkGray p-4 rounded-b-xl mb-4">
        {/* Game Stats Bar */}
        <div className="flex justify-between items-center mb-3 text-sm">
          <div className="flex items-center space-x-1">
            <i className="ri-group-line text-gray-400"></i>
            <span>{playerCount} players</span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="ri-timer-line text-gray-400"></i>
            <span className="countdown-timer">
              {gameState === 'waiting' 
                ? formatTimeRemaining(countdown || 0) 
                : gameState === 'active' 
                  ? 'Game in progress' 
                  : 'Game ended'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="ri-award-line text-gray-400"></i>
            <span>{formatDoge(totalBetAmount)}</span>
          </div>
        </div>

        {/* Game Visualization Area */}
        <GameVisualizer />
      </div>

      {/* Betting Controls */}
      <BettingControls />

      {/* Real-time Activity Feed */}
      <ActivityFeed />
    </main>
  );
};

export default GamePage;
