/**
 * Shared Puzzle Utilities (Solvability, checks, coordinate conversions)
 */

/**
 * Check if the current state array strictly matches the goal state
 * @param {Array<number>} currentState
 * @param {Array<number>} goalState
 * @returns {boolean}
 */
export function isSolved(currentState, goalState) {
  if (!currentState || !goalState || currentState.length !== goalState.length) {
    return false;
  }
  return currentState.every((val, idx) => val === goalState[idx]);
}

/**
 * Formats move count into a human-friendly string
 * @param {number} count
 * @returns {string}
 */
export function formatMoves(count) {
  return `${count} ${count === 1 ? 'move' : 'moves'}`;
}

/**
 * Converts a 1D tile index to (row, col) coordinates
 * @param {number} index
 * @param {number} gridSize
 * @returns {{ row: number, col: number }}
 */
export function getTileCoordinates(index, gridSize = 3) {
  return {
    row: Math.floor(index / gridSize),
    col: index % gridSize,
  };
}

export default {
  isSolved,
  formatMoves,
  getTileCoordinates,
};
