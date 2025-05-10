import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define Telegram user interface
interface TelegramUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  balance?: number;
  depositAddress?: string;
}

// Define Telegram context type
interface TelegramContextType {
  user: TelegramUser | null;
  loading: boolean;
  error: string | null;
  initTelegram: () => void;
  updateUserBalance: (amount: number) => void;
}

// Create context with default values
const TelegramContext = createContext<TelegramContextType>({
  user: null,
  loading: false,
  error: null,
  initTelegram: () => {},
  updateUserBalance: () => {},
});

// Hook to use Telegram context
export const useTelegram = () => useContext(TelegramContext);

// Props for the provider component
interface TelegramProviderProps {
  children: ReactNode;
}

// Telegram provider component
export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize Telegram
  const initTelegram = async () => {
    if (initialized) return;
    setLoading(true);
    
    try {
      // For now, just simulate with test user
      setUser({
        id: 123456789,
        username: 'test_user',
        first_name: 'Test',
        last_name: 'User',
        balance: 5000
      });
    } catch (err) {
      console.error('Error initializing Telegram:', err);
      setError('Failed to initialize');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Update user balance
  const updateUserBalance = (amount: number) => {
    if (user) {
      setUser({
        ...user,
        balance: (user.balance || 0) + amount
      });
    }
  };

  // Initialize on mount
  useEffect(() => {
    initTelegram();
  }, []);

  // Return provider with context value
  return (
    <TelegramContext.Provider
      value={{
        user,
        loading,
        error,
        initTelegram,
        updateUserBalance
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
};