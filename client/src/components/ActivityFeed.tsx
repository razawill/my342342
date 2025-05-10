import { useGameState } from "@/hooks/useGameState";
import { formatDoge, formatMultiplier, getUserInitials } from "@/lib/game";

const ActivityFeed = () => {
  const { activityFeed } = useGameState();

  return (
    <div className="px-4 mb-4">
      <div className="bg-darkGray rounded-xl p-4">
        <h2 className="font-poppins font-medium text-lg mb-2">Live Activity</h2>
        
        <div className="max-h-48 overflow-y-auto">
          {activityFeed.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No activity yet
            </div>
          ) : (
            activityFeed.map((item) => (
              <div 
                key={item.id} 
                className="flex justify-between items-center py-2 border-b border-mediumGray"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-mediumGray rounded-full flex items-center justify-center">
                    <span className="text-xs">{getUserInitials(item.username)}</span>
                  </div>
                  <div>
                    <div className="font-medium">@{item.username}</div>
                    <div className="text-xs text-gray-400">
                      Bet {formatDoge(item.amount)}
                    </div>
                  </div>
                </div>
                
                {item.status === 'cashout' && (
                  <div className="text-success font-medium">
                    Cashed Out {item.multiplier ? formatMultiplier(item.multiplier) : ''}
                  </div>
                )}
                
                {item.status === 'crashed' && (
                  <div className="text-crash font-medium">
                    Crashed at {item.multiplier ? formatMultiplier(item.multiplier) : ''}
                  </div>
                )}
                
                {item.status === 'bet' && (
                  <div className="text-gray-400 font-medium">
                    Betting
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
