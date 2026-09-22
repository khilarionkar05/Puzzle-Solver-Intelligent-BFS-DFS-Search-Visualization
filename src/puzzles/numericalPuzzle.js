/**
 * Numerical Puzzle Logic Module (8-Puzzle / 15-Puzzle)
 *
 * (Puzzle state transition & validation logic will be added in a later phase)
 */

export function getInitialNumericalState(gridSize = 3) {
  if (gridSize === 4) {
    // 4x4 (15-Puzzle) sample state
    return [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 0, 15,
    ];
  }
  // 3x3 (8-Puzzle) sample state
  return [
    6, 2, 3,
    7, 0, 5,
    8, 1, 4,
  ];
}

export function getGoalState(gridSize = 3) {
  const total = gridSize * gridSize;
  const goal = [];
  for (let i = 1; i < total; i++) {
    goal.push(i);
  }
  goal.push(0);
  return goal;
}

export default {
  getInitialNumericalState,
  getGoalState,
};
