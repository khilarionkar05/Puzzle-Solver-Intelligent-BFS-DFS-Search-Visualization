/**
 * Shared Puzzle Utilities (Solvability, checks, conversions, mathematical formulas)
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

/**
 * Serializes state array into a single compact string
 * @param {Array<number>} state
 * @returns {string}
 */
export function serializeState(state) {
  if (!state) return '';
  return state.join('');
}

/**
 * Converts 1D state array into a 2D matrix array M[r][c]
 * @param {Array<number>} state
 * @param {number} gridSize
 * @returns {Array<Array<number>>}
 */
export function get2DMatrix(state, gridSize = 3) {
  const matrix = [];
  for (let r = 0; r < gridSize; r++) {
    const row = [];
    for (let c = 0; c < gridSize; c++) {
      row.push(state[r * gridSize + c]);
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Computes factorial using BigInt to prevent precision loss
 * @param {number} n
 * @returns {bigint}
 */
export function factorialBigInt(n) {
  let res = 1n;
  for (let i = 2n; i <= BigInt(n); i++) {
    res *= i;
  }
  return res;
}

/**
 * Computes theoretical state space cardinality for N*N puzzle
 * @param {number} gridSize
 * @returns {{ totalPermutations: string, reachableStates: string }}
 */
export function calculateStateSpaceCardinality(gridSize = 3) {
  const n = gridSize * gridSize;
  const total = factorialBigInt(n);
  const reachable = total / 2n;

  return {
    totalPermutations: total.toLocaleString(),
    reachableStates: reachable.toLocaleString(),
  };
}

/**
 * Checks which directional moves are valid from the current blank tile position
 * @param {number} emptyIndex
 * @param {number} gridSize
 * @returns {{ UP: boolean, DOWN: boolean, LEFT: boolean, RIGHT: boolean }}
 */
export function getValidDirections(emptyIndex, gridSize = 3) {
  const row = Math.floor(emptyIndex / gridSize);
  const col = emptyIndex % gridSize;

  return {
    UP: row > 0, // Tile above slides DOWN into blank (or blank moves UP)
    DOWN: row < gridSize - 1,
    LEFT: col > 0,
    RIGHT: col < gridSize - 1,
  };
}

/**
 * Applies directional operator on state relative to blank slot
 * @param {Array<number>} state
 * @param {'UP' | 'DOWN' | 'LEFT' | 'RIGHT'} direction
 * @param {number} gridSize
 * @returns {Array<number>|null}
 */
export function applyDirectionalMove(state, direction, gridSize = 3) {
  const emptyIndex = state.indexOf(0);
  if (emptyIndex === -1) return null;

  const row = Math.floor(emptyIndex / gridSize);
  const col = emptyIndex % gridSize;
  let targetIndex = -1;

  if (direction === 'UP' && row > 0) {
    targetIndex = (row - 1) * gridSize + col;
  } else if (direction === 'DOWN' && row < gridSize - 1) {
    targetIndex = (row + 1) * gridSize + col;
  } else if (direction === 'LEFT' && col > 0) {
    targetIndex = row * gridSize + (col - 1);
  } else if (direction === 'RIGHT' && col < gridSize - 1) {
    targetIndex = row * gridSize + (col + 1);
  }

  if (targetIndex === -1) return null;

  const nextState = [...state];
  nextState[emptyIndex] = nextState[targetIndex];
  nextState[targetIndex] = 0;
  return nextState;
}

export default {
  isSolved,
  formatMoves,
  getTileCoordinates,
  serializeState,
  get2DMatrix,
  factorialBigInt,
  calculateStateSpaceCardinality,
  getValidDirections,
  applyDirectionalMove,
};
