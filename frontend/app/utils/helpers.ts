/**
 * Truncates an Ethereum address for display
 * @param address The Ethereum address to truncate
 * @returns Truncated address (e.g., 0x1234...5678)
 */
export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formats a number as a string with commas
 * @param num The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number | bigint): string {
  return new Intl.NumberFormat().format(Number(num));
}

/**
 * Converts a bigint to a number safely
 * @param value The bigint value to convert
 * @returns The number value or 0 if undefined
 */
export function bigintToNumber(value: bigint | undefined): number {
  if (value === undefined) return 0;
  return Number(value);
} 