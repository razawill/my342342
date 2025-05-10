import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const TelegramContext = createContext({
  user: null,
  loading: false,
  error: null,
  initTelegram: () => {},
  updateUserBalance: () => {}
});

// Create a provider component
export function TelegramProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch test user
  const fetchTestUser = async () => {
    try {
      const response = await fetch('/api/user?telegramId=123456789');
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: 123456789,
          username: 'mock_user',
          first_name: 'Test',
          last_name: 'User',
          balance: userData.balance,
          depositAddress: userData.depositAddress
        });
      } else {
        throw new Error('Failed to fetch test user');
      }
    } catch (err) {
      console.error('Error fetching test user:', err);
      setError('Failed to connect to game server');
    }
  };

  // Initialize Telegram
  const initTelegram = async () => {
    if (initialized) return;
    setLoading(true);
    setError(null);

    try {
      // Check if we're in Telegram WebApp
      if (window.Telegram?.WebApp) {
        console.log('Initializing Telegram WebApp');
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();

        // Get user data from Telegram WebApp
        const telegramUser = window.Telegram.WebApp.user || {};
        console.log('Telegram user:', telegramUser);

        if (telegramUser.id) {
          // For now just use test user
          await fetchTestUser();
        } else {
          // If not in Telegram, use test user
          console.log('Not in Telegram WebApp, using test user');
          await fetchTestUser();
        }
      } else {
        // If not in Telegram, use test user
        console.log('Telegram WebApp not available, using test user');
        await fetchTestUser();
      }
    } catch (err) {
      console.error('Error initializing Telegram:', err);
      setError('Failed to initialize Telegram WebApp');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  // Update user balance
  const updateUserBalance = (amount) => {
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
}

// Create a custom hook to use the context
export function useTelegram() {
  return useContext(TelegramContext);
}