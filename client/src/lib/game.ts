/**
 * Utility functions for game mechanics
 */

// Format number to DOGE display format
export function formatDoge(amount: number): string {
  if (amount === null || amount === undefined) return '0 DOGE';
  
  let formatted: string;
  
  if (amount >= 1000000) {
    formatted = (amount / 1000000).toFixed(2) + 'M';
  } else if (amount >= 1000) {
    formatted = (amount / 1000).toFixed(1) + 'K';
  } else {
    formatted = amount.toFixed(amount % 1 === 0 ? 0 : 2);
  }
  
  return `${formatted} DOGE`;
}

// Format multiplier with 2 decimal places and x suffix
export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(2)}×`;
}

// Format time remaining in seconds
export function formatTimeRemaining(seconds: number): string {
  if (seconds === null || seconds === undefined) return '';
  if (seconds <= 0) return 'Starting now';
  
  return `Starting in ${seconds}s`;
}

// Calculate height percentage for chart based on multiplier
export function calculateChartHeight(multiplier: number): number {
  // Logarithmic scale to make visualization better
  return Math.min(((Math.log(multiplier) / Math.log(10)) * 100), 100);
}

// Get x and y coordinates for rocket based on multiplier
export function getRocketPosition(multiplier: number): { x: number; y: number } {
  const height = calculateChartHeight(multiplier);
  
  return {
    x: height * 3,
    y: height * 1.5
  };
}

// Generate random crash point between 1.00 and 10.00
export function generateCrashPoint(): number {
  return 1 + Math.random() * 9;
}

// Calculate profit from bet amount and multiplier
export function calculateProfit(betAmount: number, multiplier: number): number {
  return betAmount * multiplier - betAmount;
}

// Get first two letters of username for avatar
export function getUserInitials(username: string): string {
  if (!username) return 'U';
  
  if (username.startsWith('@')) {
    username = username.slice(1);
  }
  
  if (username.length <= 2) {
    return username.toUpperCase();
  }
  
  return username.slice(0, 2).toUpperCase();
}
