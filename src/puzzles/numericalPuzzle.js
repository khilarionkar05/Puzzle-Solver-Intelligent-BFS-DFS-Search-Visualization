/**
 * Numerical Puzzle Logic Module (8-Puzzle / 15-Puzzle)
 * Pure helper functions for state generation, move validation, tile sliding, and solvable shuffling.
 */

/**
 * Returns the standard solved/goal state array for a given grid size.
 * e.g., 3x3 -> [1, 2, 3, 4, 5, 6, 7, 8, 0]
 * @param {number} gridSize - 3 for 3x3, 4 for 4x4
 * @returns {Array<number>}
 */
export function getGoalState(gridSize = 3) {
  const total = gridSize * gridSize;
  const goal = [];
  for (let i = 1; i < total; i++) {
    goal.push(i);
  }
  goal.push(0); // 0 represents the blank/empty space
  return goal;
}

/**
 * Alias for getGoalState (returns default initial solved state)
 * @param {number} gridSize
 * @returns {Array<number>}
 */
export function getInitialNumericalState(gridSize = 3) {
  return getGoalState(gridSize);
}

/**
 * Check if a clicked tile is adjacent to the empty tile (0)
 * @param {number} clickedIndex
 * @param {number} emptyIndex
 * @param {number} gridSize
 * @returns {boolean}
 */
export function isValidMove(clickedIndex, emptyIndex, gridSize = 3) {
  if (clickedIndex < 0 || clickedIndex >= gridSize * gridSize) return false;
  if (emptyIndex < 0 || emptyIndex >= gridSize * gridSize) return false;
  if (clickedIndex === emptyIndex) return false;

  const clickedRow = Math.floor(clickedIndex / gridSize);
  const clickedCol = clickedIndex % gridSize;
  const emptyRow = Math.floor(emptyIndex / gridSize);
  const emptyCol = emptyIndex % gridSize;

  const rowDiff = Math.abs(clickedRow - emptyRow);
  const colDiff = Math.abs(clickedCol - emptyCol);

  // Valid move if horizontally or vertically adjacent (Manhattan distance == 1)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Get all valid tile indices that can move into the empty tile
 * @param {number} emptyIndex
 * @param {number} gridSize
 * @returns {Array<number>}
 */
export function getValidMoveIndices(emptyIndex, gridSize = 3) {
  const moves = [];
  const emptyRow = Math.floor(emptyIndex / gridSize);
  const emptyCol = emptyIndex % gridSize;

  // Up
  if (emptyRow > 0) moves.push((emptyRow - 1) * gridSize + emptyCol);
  // Down
  if (emptyRow < gridSize - 1) moves.push((emptyRow + 1) * gridSize + emptyCol);
  // Left
  if (emptyCol > 0) moves.push(emptyRow * gridSize + (emptyCol - 1));
  // Right
  if (emptyCol < gridSize - 1) moves.push(emptyRow * gridSize + (emptyCol + 1));

  return moves;
}

/**
 * Moves a tile into the empty slot if valid, returning a new state array.
 * If move is invalid, returns null.
 * @param {Array<number>} tiles
 * @param {number} clickedIndex
 * @param {number} gridSize
 * @returns {Array<number>|null}
 */
export function moveTile(tiles, clickedIndex, gridSize = 3) {
  const emptyIndex = tiles.indexOf(0);
  if (emptyIndex === -1) return null;

  if (!isValidMove(clickedIndex, emptyIndex, gridSize)) {
    return null;
  }

  const newTiles = [...tiles];
  newTiles[emptyIndex] = newTiles[clickedIndex];
  newTiles[clickedIndex] = 0;
  return newTiles;
}

/**
 * Counts inversions in a puzzle state (excluding the blank 0).
 * @param {Array<number>} tiles
 * @returns {number}
 */
export function countInversions(tiles) {
  let inversions = 0;
  const nonZero = tiles.filter((val) => val !== 0);
  for (let i = 0; i < nonZero.length - 1; i++) {
    for (let j = i + 1; j < nonZero.length; j++) {
      if (nonZero[i] > nonZero[j]) {
        inversions++;
      }
    }
  }
  return inversions;
}

/**
 * Check whether a given puzzle state is mathematically solvable.
 * For odd grid (3x3): Inversions must be even.
 * For even grid (4x4): (Inversions + row of blank from bottom, 1-indexed) must be even.
 * @param {Array<number>} tiles
 * @param {number} gridSize
 * @returns {boolean}
 */
export function isSolvable(tiles, gridSize = 3) {
  const inversions = countInversions(tiles);
  if (gridSize % 2 === 1) {
    return inversions % 2 === 0;
  } else {
    const emptyIndex = tiles.indexOf(0);
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const blankRowFromBottom = gridSize - emptyRow; // 1-indexed from bottom
    return (inversions + blankRowFromBottom) % 2 === 1;
  }
}

/**
 * Generates a guaranteed-solvable shuffled puzzle state by performing
 * random valid sliding moves starting from the solved state.
 * @param {number} gridSize - 3 for 3x3, 4 for 4x4
 * @param {number} shuffleSteps - Number of valid random moves (default: 80)
 * @returns {Array<number>}
 */
export function generateSolvableShuffle(gridSize = 3, shuffleSteps = 80) {
  let state = getGoalState(gridSize);
  let previousEmptyIndex = -1;

  for (let step = 0; step < shuffleSteps; step++) {
    const currentEmptyIndex = state.indexOf(0);
    const validMoves = getValidMoveIndices(currentEmptyIndex, gridSize);
    // Avoid immediately undoing the move we just made
    const eligibleMoves = validMoves.filter((idx) => idx !== previousEmptyIndex);
    const chosenMoveIndex = eligibleMoves.length > 0
      ? eligibleMoves[Math.floor(Math.random() * eligibleMoves.length)]
      : validMoves[Math.floor(Math.random() * validMoves.length)];

    previousEmptyIndex = currentEmptyIndex;
    state = moveTile(state, chosenMoveIndex, gridSize);
  }

  // Ensure shuffled state is not already solved
  const goal = getGoalState(gridSize);
  const isAlreadySolved = state.every((val, idx) => val === goal[idx]);
  if (isAlreadySolved) {
    const emptyIndex = state.indexOf(0);
    const validMoves = getValidMoveIndices(emptyIndex, gridSize);
    state = moveTile(state, validMoves[0], gridSize);
  }

  return state;
}

export default {
  getGoalState,
  getInitialNumericalState,
  isValidMove,
  getValidMoveIndices,
  moveTile,
  countInversions,
  isSolvable,
  generateSolvableShuffle,
};
