/**
 * Performance Tracking & Metric Formatting Utilities
 *
 * (Detailed benchmark tracking will be added in a later phase)
 */

export function formatTime(timeMs) {
  if (timeMs === undefined || timeMs === null) return '--';
  if (timeMs < 1) return '< 1 ms';
  if (timeMs < 1000) return `${Math.round(timeMs)} ms`;
  return `${(timeMs / 1000).toFixed(2)} s`;
}

export function formatNumber(num) {
  if (num === undefined || num === null) return '--';
  return Number(num).toLocaleString();
}

export default {
  formatTime,
  formatNumber,
};
