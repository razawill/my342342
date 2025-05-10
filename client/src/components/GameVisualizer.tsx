import { useEffect, useRef } from "react";
import { useGameState } from "@/hooks/useGameState";
import { formatMultiplier, calculateChartHeight, getRocketPosition } from "@/lib/game";

const GameVisualizer = () => {
  const { 
    gameState, 
    countdown, 
    multiplier, 
    crashPoint,
    cashout,
    hasBet,
    hasCashedOut
  } = useGameState();
  
  const chartPathRef = useRef<HTMLDivElement>(null);
  const rocketElementRef = useRef<HTMLDivElement>(null);
  
  // Update chart visualization when multiplier changes
  useEffect(() => {
    if (gameState === 'active' && chartPathRef.current && rocketElementRef.current) {
      const heightPercentage = calculateChartHeight(multiplier);
      const position = getRocketPosition(multiplier);
      
      // Update chart path
      chartPathRef.current.style.height = heightPercentage + '%';
      chartPathRef.current.style.width = Math.min(heightPercentage * 3, 100) + '%';
      
      // Update rocket position
      rocketElementRef.current.style.transform = 
        `translate(${position.x}px, -${position.y}px)`;
    }
  }, [multiplier, gameState]);
  
  // Reset chart when game state changes
  useEffect(() => {
    if (gameState === 'waiting' && chartPathRef.current && rocketElementRef.current) {
      chartPathRef.current.style.height = '0%';
      chartPathRef.current.style.width = '1px';
      rocketElementRef.current.style.transform = 'translate(0, 0)';
    }
  }, [gameState]);

  return (
    <div id="gameVisualizer" className="relative h-64 bg-mediumGray rounded-xl overflow-hidden mb-2">
      {/* Waiting State */}
      {gameState === 'waiting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-poppins font-bold mb-2">Place your bets</p>
            <p className="text-gray-400 text-sm">
              Next game starts in <span className="text-telegramBlue font-medium">{countdown}</span> seconds
            </p>
            
            {/* Dogecoin rocket ready for launch */}
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mt-4 animate-bounce-slow"
            >
              <circle cx="50" cy="50" r="40" fill="#F2A900" />
              <path d="M40.58,39.95h10.5v4.55h-5.76v6.2h5.12v4.25h-5.12v6.6h5.96v4.5H40.58V39.95z M56.18,55.9c0-6.5,3.5-10.35,8.75-10.35 c5.25,0,8.7,3.85,8.7,10.35c0,6.5-3.45,10.6-8.7,10.6C59.68,66.5,56.18,62.4,56.18,55.9z M68.08,55.95c0-4-1.15-5.75-3.15-5.75 c-2,0-3.15,1.75-3.15,5.75c0,4,1.15,5.9,3.15,5.9C66.93,61.85,68.08,59.95,68.08,55.95z M27.48,48.8c1.05-1.55,2.5-2.2,4.1-2.2 c3.45,0,5.65,2.5,5.65,7.55c0,6.1-2.9,9.65-7.65,9.65c-5.65,0-9.6-4.15-9.6-11.95c0-8.75,4.15-14,10.9-14c3.65,0,6.55,1.8,8.25,4.55 c0.7,1.1,1.1,2.4,1.35,3.95l-5.35,1.15c-0.45-3.1-1.75-4.7-4.25-4.7c-3.1,0-4.9,3.25-4.9,8.7c0,0.25,0,0.6,0.05,1.1L27.48,48.8z M31.67,58.8c1.8,0,2.85-1.75,2.85-4.6c0-2.15-0.9-2.95-2.15-2.95c-0.9,0-1.6,0.5-2.2,1.45l-1.35-3.9c0,0.45,0.05,0.9,0.05,1.4 c0,0.15,0,0.35,0,0.5v1.45c0,4.55,0.95,6.7,2.8,6.7V58.8z" fill="white"/>
              <circle cx="50" cy="70" r="20" fill="#F2A900" opacity="0.3">
                <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>
      )}
      
      {/* Active Game State */}
      {gameState === 'active' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative w-full h-full">
            {/* Game Chart Background */}
            <div className="line-chart bg-opacity-30 rounded-xl w-full h-full">
              <div 
                ref={chartPathRef} 
                className="absolute bottom-0 left-0 h-0 w-1 bg-telegramBlue transition-all duration-100"
                style={{ height: '0%' }}
              ></div>
              
              {/* Rocket Element */}
              <div 
                ref={rocketElementRef}
                className="rocket-animation absolute bottom-0 left-0"
              >
                {/* Dogecoin rocket */}
                <svg 
                  width="48" 
                  height="48" 
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transform -translate-y-6"
                >
                  <path d="M50,20 L60,60 L50,50 L40,60 L50,20" fill="#F2A900" />
                  <circle cx="50" cy="35" r="15" fill="#F2A900" />
                  <path d="M40.58,29.95h10.5v4.55h-5.76v6.2h5.12v4.25h-5.12v6.6h5.96v4.5H40.58V29.95z" fill="white" transform="scale(0.5) translate(50, 30)" />
                  {/* Flame effect */}
                  <path d="M45,60 Q50,80 55,60" fill="orange" opacity="0.8">
                    <animate attributeName="d" values="M45,60 Q50,80 55,60;M45,60 Q50,70 55,60;M45,60 Q50,80 55,60" dur="0.5s" repeatCount="indefinite" />
                  </path>
                </svg>
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                <div className="border-t border-dashed border-gray-400"></div>
                <div className="border-t border-dashed border-gray-400"></div>
                <div className="border-t border-dashed border-gray-400"></div>
                <div className="border-t border-dashed border-gray-400"></div>
              </div>
              
              {/* Multiplier Markers */}
              <div className="absolute top-0 right-0 bottom-0 flex flex-col justify-between p-2 text-xs text-gray-400">
                <div>10.00x</div>
                <div>5.00x</div>
                <div>2.50x</div>
                <div>1.00x</div>
              </div>
            </div>
            
            {/* Current Multiplier (Centered) */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <div className="text-4xl font-poppins font-bold multiplier-grow text-white">
                {formatMultiplier(multiplier)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Crash State */}
      {gameState === 'crashed' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-poppins font-bold text-crash mb-2 crashAnimation">CRASHED!</div>
            <div className="text-3xl font-poppins font-bold">
              {crashPoint ? formatMultiplier(crashPoint) : '0.00×'}
            </div>
            
            {/* Crashed dogecoin rocket */}
            <svg 
              width="96" 
              height="96" 
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mt-4"
            >
              <circle cx="50" cy="50" r="40" fill="#F2A900" />
              <path d="M40.58,39.95h10.5v4.55h-5.76v6.2h5.12v4.25h-5.12v6.6h5.96v4.5H40.58V39.95z M56.18,55.9c0-6.5,3.5-10.35,8.75-10.35 c5.25,0,8.7,3.85,8.7,10.35c0,6.5-3.45,10.6-8.7,10.6C59.68,66.5,56.18,62.4,56.18,55.9z M68.08,55.95c0-4-1.15-5.75-3.15-5.75 c-2,0-3.15,1.75-3.15,5.75c0,4,1.15,5.9,3.15,5.9C66.93,61.85,68.08,59.95,68.08,55.95z M27.48,48.8c1.05-1.55,2.5-2.2,4.1-2.2 c3.45,0,5.65,2.5,5.65,7.55c0,6.1-2.9,9.65-7.65,9.65c-5.65,0-9.6-4.15-9.6-11.95c0-8.75,4.15-14,10.9-14c3.65,0,6.55,1.8,8.25,4.55 c0.7,1.1,1.1,2.4,1.35,3.95l-5.35,1.15c-0.45-3.1-1.75-4.7-4.25-4.7c-3.1,0-4.9,3.25-4.9,8.7c0,0.25,0,0.6,0.05,1.1L27.48,48.8z M31.67,58.8c1.8,0,2.85-1.75,2.85-4.6c0-2.15-0.9-2.95-2.15-2.95c-0.9,0-1.6,0.5-2.2,1.45l-1.35-3.9c0,0.45,0.05,0.9,0.05,1.4 c0,0.15,0,0.35,0,0.5v1.45c0,4.55,0.95,6.7,2.8,6.7V58.8z" fill="white"/>
              <circle cx="25" cy="70" r="15" fill="#FF424D" opacity="0.7" />
              <circle cx="75" cy="65" r="10" fill="#FF424D" opacity="0.5" />
              <path d="M20,20 L80,80 M80,20 L20,80" stroke="#FF424D" strokeWidth="3" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Cashout Button (Visible only during active game if user has placed a bet and not cashed out) */}
      {gameState === 'active' && hasBet && !hasCashedOut && (
        <button
          onClick={cashout}
          className="absolute bottom-4 left-4 right-4 py-3 bg-success rounded-xl font-poppins font-bold text-xl shine"
        >
          CASH OUT {formatMultiplier(multiplier)}
        </button>
      )}
    </div>
  );
};

export default GameVisualizer;
