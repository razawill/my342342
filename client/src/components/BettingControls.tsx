import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { useTelegram } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { MIN_BET } from "@/lib/wallet";

const BettingControls = () => {
  const { gameState, placeBet, hasBet } = useGameState();
  const { user } = useTelegram();
  const { toast } = useToast();
  
  const [betAmount, setBetAmount] = useState<string>("10.00");
  
  const handlePlaceBet = () => {
    const amount = parseFloat(betAmount);
    
    // Validate inputs
    if (!amount || isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }
    
    if (amount < MIN_BET) {
      toast({
        title: "Bet too small",
        description: `Minimum bet is ${MIN_BET} DOGE`,
        variant: "destructive",
      });
      return;
    }
    
    if (user?.balance && amount > user.balance) {
      toast({
        title: "Insufficient balance",
        description: "Your bet exceeds your balance",
        variant: "destructive",
      });
      return;
    }
    
    // Place bet - manual cashout only
    placeBet(amount);
  };
  
  const handleHalfBet = () => {
    const current = parseFloat(betAmount) || 0;
    setBetAmount((current / 2).toFixed(2));
  };
  
  const handleDoubleBet = () => {
    const current = parseFloat(betAmount) || 0;
    setBetAmount((current * 2).toFixed(2));
  };
  
  const handleMaxBet = () => {
    if (user?.balance) {
      setBetAmount(user.balance.toString());
    }
  };
  
  const isBettingDisabled = gameState !== 'waiting' || hasBet;

  return (
    <div className="px-4 mb-4">
      <div className="bg-darkGray rounded-xl p-4">
        <h2 className="font-poppins font-medium text-lg mb-3">Place Your Bet</h2>
        
        {/* Bet Amount Input */}
        <div className="flex mb-4 items-center">
          <div className="flex-1 relative">
            <input
              type="number"
              className="w-full bg-mediumGray text-white p-3 pr-16 rounded-l-lg input-focus"
              placeholder="Bet amount"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={isBettingDisabled}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-dogeGold font-medium">
              DOGE
            </div>
          </div>
          <button
            className="bg-mediumGray p-3 text-sm border-l border-dark"
            onClick={handleHalfBet}
            disabled={isBettingDisabled}
          >
            1/2
          </button>
          <button
            className="bg-mediumGray p-3 text-sm border-l border-dark"
            onClick={handleDoubleBet}
            disabled={isBettingDisabled}
          >
            2×
          </button>
          <button
            className="bg-mediumGray p-3 text-sm rounded-r-lg border-l border-dark"
            onClick={handleMaxBet}
            disabled={isBettingDisabled}
          >
            MAX
          </button>
        </div>
        
        {/* Note about manual cashout */}
        <div className="flex mb-4">
          <div className="bg-mediumGray p-3 w-full rounded-lg text-sm text-center text-telegramBlue">
            Remember to manually cash out before crash to win!
          </div>
        </div>
        
        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          className={`w-full py-3 ${isBettingDisabled ? 'bg-gray-500' : 'bg-dogeGold shine'} text-dark rounded-xl font-poppins font-bold text-xl`}
          disabled={isBettingDisabled}
        >
          {hasBet ? "BET PLACED" : "PLACE BET"}
        </button>
      </div>
    </div>
  );
};

export default BettingControls;
