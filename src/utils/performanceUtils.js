/**
 * Performance Tracking & Metric Formatting Utilities
 */

/**
 * Format execution time into a readable millisecond or second string
 * @param {number|undefined|null} timeMs
 * @returns {string}
 */
export function formatTime(timeMs) {
  if (timeMs === undefined || timeMs === null) return '--';
  if (timeMs < 0.01) return '< 0.01 ms';
  if (timeMs < 1000) return `${Number(timeMs.toFixed(2))} ms`;
  return `${(timeMs / 1000).toFixed(2)} s`;
}

/**
 * Format large numbers with locale comma separators
 * @param {number|undefined|null} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '--';
  return Number(num).toLocaleString();
}

export default {
  formatTime,
  formatNumber,
};
