/**
 * Breadth-First Search (BFS) Solver Module
 * Mini-Project for Design and Analysis of Algorithms (DAA)
 *
 * Traverses the sliding puzzle state space tree level-by-level using a FIFO Queue.
 * Guarantees finding the optimal (shortest path) solution if one exists.
 */
import { getGoalState, getValidMoveIndices, isSolvable } from '../puzzles/numericalPuzzle.js';

/**
 * Executes Breadth-First Search to find the shortest path from initial to goal state.
 * @param {Array<number>} initialState
 * @param {Array<number>} [customGoalState]
 * @param {number} [gridSize=3]
 * @param {number} [maxStates=150000]
 * @returns {{
 *   solved: boolean,
 *   solutionPath: Array<Array<number>>,
 *   statesExplored: number,
 *   nodesGenerated: number,
 *   solutionDepth: number,
 *   executionTime: number,
 *   error?: string
 * }}
 */
export function solveBFS(initialState, customGoalState = null, gridSize = 3, maxStates = 150000) {
  const startTime = performance.now();

  const goalState = customGoalState || getGoalState(gridSize);
  const goalKey = goalState.join(',');
  const initialKey = initialState.join(',');

  // Solvability check
  if (!isSolvable(initialState, gridSize)) {
    const endTime = performance.now();
    return {
      solved: false,
      solutionPath: [],
      statesExplored: 0,
      nodesGenerated: 0,
      solutionDepth: 0,
      executionTime: Number((endTime - startTime).toFixed(2)),
      error: 'The puzzle configuration is mathematically unsolvable.',
    };
  }

  // If already at goal state
  if (initialKey === goalKey) {
    const endTime = performance.now();
    return {
      solved: true,
      solutionPath: [initialState],
      statesExplored: 1,
      nodesGenerated: 1,
      solutionDepth: 0,
      executionTime: Number((endTime - startTime).toFixed(2)),
    };
  }

  const initialEmptyIndex = initialState.indexOf(0);

  // FIFO Queue with pointer index to avoid O(N) Array.shift() overhead
  const queue = [
    {
      state: initialState,
      emptyIndex: initialEmptyIndex,
      parent: null,
      depth: 0,
    },
  ];

  const visited = new Set();
  visited.add(initialKey);

  let head = 0;
  let statesExplored = 0;
  let nodesGenerated = 1;

  while (head < queue.length) {
    const current = queue[head++];
    statesExplored++;

    // Check goal condition
    if (current.state.join(',') === goalKey) {
      // Reconstruct solution path
      const path = [];
      let curr = current;
      while (curr !== null) {
        path.push(curr.state);
        curr = curr.parent;
      }
      path.reverse();

      const endTime = performance.now();
      return {
        solved: true,
        solutionPath: path,
        statesExplored,
        nodesGenerated,
        solutionDepth: path.length - 1,
        executionTime: Number((endTime - startTime).toFixed(2)),
      };
    }

    if (statesExplored >= maxStates) {
      break;
    }

    const validMoves = getValidMoveIndices(current.emptyIndex, gridSize);

    for (let i = 0; i < validMoves.length; i++) {
      const targetIndex = validMoves[i];
      // Fast swap without full array copy overhead until necessary
      const nextState = [...current.state];
      nextState[current.emptyIndex] = nextState[targetIndex];
      nextState[targetIndex] = 0;

      const nextKey = nextState.join(',');
      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        nodesGenerated++;

        queue.push({
          state: nextState,
          emptyIndex: targetIndex,
          parent: current,
          depth: current.depth + 1,
        });
      }
    }
  }

  const endTime = performance.now();
  return {
    solved: false,
    solutionPath: [],
    statesExplored,
    nodesGenerated,
    solutionDepth: 0,
    executionTime: Number((endTime - startTime).toFixed(2)),
    error: 'Maximum search state limit reached without reaching goal.',
  };
}

export default {
  solveBFS,
};
