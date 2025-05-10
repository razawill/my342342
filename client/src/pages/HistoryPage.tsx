import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDoge, formatMultiplier } from "@/lib/game";

interface GameHistory {
  id: number;
  crashPoint: number;
  startedAt: string;
  endedAt: string;
  status: string;
}

const HistoryPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'recent' | 'day' | 'week'>('recent');
  
  const { data: games, isLoading } = useQuery({
    queryKey: ['/api/history'],
    queryFn: async () => {
      const res = await fetch('/api/history?limit=100');
      if (!res.ok) throw new Error('Failed to fetch game history');
      return res.json() as Promise<GameHistory[]>;
    }
  });
  
  // Filter games by selected period
  const filteredGames = games ? filterGamesByPeriod(games, selectedPeriod) : [];
  
  function filterGamesByPeriod(games: GameHistory[], period: 'recent' | 'day' | 'week'): GameHistory[] {
    if (period === 'recent') {
      return games.slice(0, 20);
    }
    
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return games.filter(game => {
      const gameDate = new Date(game.startedAt);
      if (period === 'day') return gameDate >= dayAgo;
      if (period === 'week') return gameDate >= weekAgo;
      return true;
    });
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold font-poppins mb-2">Game History</h1>
        <p className="text-gray-400">View past game results and crashes</p>
      </div>
      
      {/* Period selector */}
      <div className="flex space-x-2 mb-4">
        <button 
          className={`px-4 py-2 rounded-lg ${selectedPeriod === 'recent' ? 'bg-telegramBlue' : 'bg-mediumGray'}`}
          onClick={() => setSelectedPeriod('recent')}
        >
          Recent
        </button>
        <button 
          className={`px-4 py-2 rounded-lg ${selectedPeriod === 'day' ? 'bg-telegramBlue' : 'bg-mediumGray'}`}
          onClick={() => setSelectedPeriod('day')}
        >
          24h
        </button>
        <button 
          className={`px-4 py-2 rounded-lg ${selectedPeriod === 'week' ? 'bg-telegramBlue' : 'bg-mediumGray'}`}
          onClick={() => setSelectedPeriod('week')}
        >
          7d
        </button>
      </div>
      
      {/* Game history list */}
      <div className="bg-darkGray rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Loading history...</div>
        ) : filteredGames.length === 0 ? (
          <div className="p-4 text-center">No game history available</div>
        ) : (
          <div className="divide-y divide-mediumGray">
            <div className="grid grid-cols-4 p-3 bg-mediumGray font-semibold">
              <div>Game ID</div>
              <div>Time</div>
              <div className="text-right">Crash Point</div>
              <div className="text-right">Status</div>
            </div>
            
            {filteredGames.map(game => (
              <div key={game.id} className="grid grid-cols-4 p-3 hover:bg-mediumGray transition-colors">
                <div>#{game.id}</div>
                <div>{new Date(game.startedAt).toLocaleTimeString()}</div>
                <div className={`text-right ${game.crashPoint < 2 ? 'text-crash' : game.crashPoint > 5 ? 'text-success' : ''}`}>
                  {formatMultiplier(game.crashPoint)}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${game.status === 'crashed' ? 'bg-crash bg-opacity-20 text-crash' : 'bg-success bg-opacity-20 text-success'}`}>
                    {game.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Game statistics */}
      {games && games.length > 0 && (
        <div className="mt-6 bg-darkGray rounded-xl p-4">
          <h2 className="font-poppins font-medium text-lg mb-3">Game Statistics</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-mediumGray p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Average Crash</div>
              <div className="text-xl font-bold">
                {formatMultiplier(games.reduce((sum, game) => sum + game.crashPoint, 0) / games.length)}
              </div>
            </div>
            
            <div className="bg-mediumGray p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Highest Crash</div>
              <div className="text-xl font-bold text-success">
                {formatMultiplier(Math.max(...games.map(g => g.crashPoint)))}
              </div>
            </div>
            
            <div className="bg-mediumGray p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Lowest Crash</div>
              <div className="text-xl font-bold text-crash">
                {formatMultiplier(Math.min(...games.map(g => g.crashPoint)))}
              </div>
            </div>
            
            <div className="bg-mediumGray p-3 rounded-lg">
              <div className="text-gray-400 text-sm">Crashes &lt; 2.00×</div>
              <div className="text-xl font-bold">
                {games.filter(g => g.crashPoint < 2).length} games
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
