import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWebSocket } from './useWebSocket';
import { 
  WebSocketMessage, 
  GameStateMessage, 
  BetMessage,
  CashoutMessage,
  CrashMessage,
  PlayerUpdateMessage 
} from '@shared/schema';
import { useTelegram } from '@/lib/telegram';

type GameState = 'waiting' | 'active' | 'crashed';

interface ActivityItem {
  id: string;
  username: string;
  telegramId: string;
  amount: number;
  multiplier?: number;
  profit?: number;
  status: 'bet' | 'cashout' | 'crashed';
  timestamp: Date;
}

interface GameStateContextType {
  gameState: GameState;
  gameId: number | null;
  countdown: number | null;
  multiplier: number;
  crashPoint: number | null;
  activityFeed: ActivityItem[];
  playerCount: number;
  totalBetAmount: number;
  placeBet: (amount: number) => void;
  cashout: () => void;
  hasBet: boolean;
  hasCashedOut: boolean;
  betAmount: number | null;
}

const GameStateContext = createContext<GameStateContextType>({
  gameState: 'waiting',
  gameId: null,
  countdown: null,
  multiplier: 1.0,
  crashPoint: null,
  activityFeed: [],
  playerCount: 0,
  totalBetAmount: 0,
  placeBet: () => {},
  cashout: () => {},
  hasBet: false,
  hasCashedOut: false,
  betAmount: null,
});

export const useGameState = () => useContext(GameStateContext);

interface GameStateProviderProps {
  children: ReactNode;
}

export const GameStateProvider = ({ children }: GameStateProviderProps) => {
  const { lastMessage, sendMessage } = useWebSocket();
  const { user } = useTelegram();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [gameId, setGameId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  
  // Activity feed
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  
  // Player stats
  const [playerCount, setPlayerCount] = useState(0);
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  
  // User betting state
  const [hasBet, setHasBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [betAmount, setBetAmount] = useState<number | null>(null);
  
  // Process WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    switch (lastMessage.type) {
      case 'gameState':
        handleGameStateMessage(lastMessage);
        break;
      case 'bet':
        handleBetMessage(lastMessage);
        break;
      case 'cashout':
        handleCashoutMessage(lastMessage);
        break;
      case 'crash':
        handleCrashMessage(lastMessage);
        break;
      case 'playerUpdate':
        handlePlayerUpdateMessage(lastMessage);
        break;
    }
  }, [lastMessage]);
  
  // Reset bet state when a new game starts
  useEffect(() => {
    if (gameState === 'waiting' && gameId) {
      setHasBet(false);
      setHasCashedOut(false);
      setBetAmount(null);
      setCrashPoint(null);
    }
  }, [gameState, gameId]);
  
  // Handle different message types
  const handleGameStateMessage = (message: GameStateMessage) => {
    setGameState(message.state);
    
    if (message.gameId) {
      setGameId(message.gameId);
    }
    
    if (message.countdown !== undefined) {
      setCountdown(message.countdown);
    }
    
    if (message.multiplier !== undefined) {
      setMultiplier(message.multiplier);
    }
  };
  
  const handleBetMessage = (message: BetMessage) => {
    // Add to activity feed
    const newActivity: ActivityItem = {
      id: `bet-${message.userId}-${Date.now()}`,
      username: message.username,
      telegramId: message.telegramId,
      amount: message.amount,
      status: 'bet',
      timestamp: new Date(),
    };
    
    setActivityFeed(prev => [newActivity, ...prev].slice(0, 50));
    
    // If this is the current user's bet
    if (user && message.telegramId === user.id?.toString()) {
      setHasBet(true);
      setBetAmount(message.amount);
    }
  };
  
  const handleCashoutMessage = (message: CashoutMessage) => {
    // Add to activity feed
    const newActivity: ActivityItem = {
      id: `cashout-${message.userId}-${Date.now()}`,
      username: message.username,
      telegramId: message.telegramId,
      amount: message.amount,
      multiplier: message.multiplier,
      profit: message.profit,
      status: 'cashout',
      timestamp: new Date(),
    };
    
    setActivityFeed(prev => [newActivity, ...prev].slice(0, 50));
    
    // If this is the current user's cashout
    if (user && message.telegramId === user.id?.toString()) {
      setHasCashedOut(true);
    }
  };
  
  const handleCrashMessage = (message: CrashMessage) => {
    setCrashPoint(message.crashPoint);
    
    // Add to activity feed for users who didn't cash out
    if (hasBet && !hasCashedOut && betAmount) {
      const newActivity: ActivityItem = {
        id: `crash-${user?.id}-${Date.now()}`,
        username: user?.username || 'You',
        telegramId: user?.id?.toString() || '',
        amount: betAmount,
        multiplier: message.crashPoint,
        status: 'crashed',
        timestamp: new Date(),
      };
      
      setActivityFeed(prev => [newActivity, ...prev].slice(0, 50));
    }
  };
  
  const handlePlayerUpdateMessage = (message: PlayerUpdateMessage) => {
    setPlayerCount(message.count);
    setTotalBetAmount(message.totalBets);
  };
  
  // Game actions
  const placeBet = (amount: number) => {
    if (!user || !user.id) return;
    
    sendMessage({
      type: 'placeBet',
      telegramId: user.id.toString(),
      amount
    });
  };
  
  const cashout = () => {
    if (!user || !user.id) return;
    
    sendMessage({
      type: 'cashout',
      telegramId: user.id.toString()
    });
  };
  
  const value = {
    gameState,
    gameId,
    countdown,
    multiplier,
    crashPoint,
    activityFeed,
    playerCount,
    totalBetAmount,
    placeBet,
    cashout,
    hasBet,
    hasCashedOut,
    betAmount
  };
  
  return React.createElement(
    GameStateContext.Provider,
    { value },
    children
  );
}
