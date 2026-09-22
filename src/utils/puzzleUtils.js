/**
 * Puzzle Utilities (helpers, conversions, checkers)
 *
 * (Full solvability and state manipulation helpers will be added in a later phase)
 */

export function isSolved(currentState, goalState) {
  if (!currentState || !goalState || currentState.length !== goalState.length) {
    return false;
  }
  return currentState.every((val, idx) => val === goalState[idx]);
}

export function formatMoves(count) {
  return `${count} ${count === 1 ? 'move' : 'moves'}`;
}

export default {
  isSolved,
  formatMoves,
};
