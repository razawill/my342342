import { apiRequest } from './queryClient';
import { useTelegram } from './telegram';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Mock Dogecoin price in USD
const DOGE_USD_PRICE = 0.095;

// Minimum amounts (in DOGE)
export const MIN_DEPOSIT = 100;
export const MIN_WITHDRAW = 20;
export const MIN_BET = 1;

// Convert DOGE to USD
export function dogeToUsd(amount: number): number {
  return amount * DOGE_USD_PRICE;
}

// Convert USD to DOGE
export function usdToDoge(amount: number): number {
  return amount / DOGE_USD_PRICE;
}

// Format USD
export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Hook for deposits
export function useDeposit() {
  const { user, updateUserBalance } = useTelegram();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      if (amount < MIN_DEPOSIT) {
        throw new Error(`Minimum deposit is ${MIN_DEPOSIT} DOGE`);
      }
      
      const response = await apiRequest('POST', '/api/deposit', {
        telegramId: user.id.toString(),
        amount
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update local user balance
      updateUserBalance(data.transaction.amount);
      
      // Invalidate transactions query
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    }
  });
}

// Hook for withdrawals
export function useWithdraw() {
  const { user, updateUserBalance } = useTelegram();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ amount, address }: { amount: number; address: string }) => {
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      if (amount < MIN_WITHDRAW) {
        throw new Error(`Minimum withdrawal is ${MIN_WITHDRAW} DOGE`);
      }
      
      if (user.balance && user.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      if (!address) {
        throw new Error('Withdrawal address is required');
      }
      
      const response = await apiRequest('POST', '/api/withdraw', {
        telegramId: user.id.toString(),
        amount,
        address
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      // Update local user balance
      updateUserBalance(data.transaction.amount);
      
      // Invalidate transactions query
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    }
  });
}

// Hook for fetching transaction history
export function useTransactionHistory() {
  const { user } = useTelegram();
  
  return useQuery({
    queryKey: ['/api/transactions', user?.id],
    queryFn: async () => {
      if (!user || !user.id) {
        return [];
      }
      
      const response = await fetch(`/api/transactions?telegramId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      return response.json();
    },
    enabled: !!user?.id
  });
}
