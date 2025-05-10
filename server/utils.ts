// Utility functions for the server

/**
 * Generate a random Dogecoin address for testing
 * In production, this would be replaced with a real address generation
 */
export function generateDogeAddress(): string {
  // Always return the same fixed address as requested
  return 'DN27evh4WA8bDgvUwQeRgRct8fwaTaKqrT';
}

/**
 * Format a number as DOGE with commas
 */
export function formatDoge(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' DOGE';
}

/**
 * Format a multiplier as a string with 2 decimal places
 */
export function formatMultiplier(multiplier: number): string {
  return multiplier.toFixed(2) + 'x';
}

/**
 * Generate a timestamp string
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Log a message with a timestamp
 */
export function logWithTimestamp(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Validates a Dogecoin address (basic validation)
 */
export function isValidDogeAddress(address: string): boolean {
  // Basic validation - starts with D and has 34 characters
  return /^D[a-zA-Z0-9]{33}$/.test(address);
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}