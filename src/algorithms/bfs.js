/**
 * Breadth-First Search (BFS) Solver Module
 * Mini-Project for Design and Analysis of Algorithms (DAA)
 *
 * Traverses the sliding puzzle state space tree level-by-level using a FIFO Queue.
 * Guarantees finding the optimal (shortest path) solution if one exists.
 */
import { getGoalState, getValidMoveIndices, isSolvable } from '../puzzles/numericalPuzzle.js';

export const MAX_STATES = 5000000;

/**
 * Executes Breadth-First Search to find the shortest path from initial to goal state.
 * @param {Array<number>} initialState
 * @param {Array<number>} [customGoalState]
 * @param {number} [gridSize=3]
 * @param {number} [maxStates=1000000]
 * @returns {{
 *   solved: boolean,
 *   terminationReason: 'solved' | 'unsolvable' | 'search_limit',
 *   algorithm: 'BFS',
 *   initialState: Array<number>,
 *   finalState: Array<number>,
 *   solutionPath: Array<Array<number>>,
 *   solutionDepth: number,
 *   statesExplored: number,
 *   nodesGenerated: number,
 *   executionTime: number,
 *   error?: string
 * }}
 */
export function solveBFS(initialState, customGoalState = null, gridSize = 3, maxStates = MAX_STATES) {
  const startTime = performance.now();

  const goalState = customGoalState || getGoalState(gridSize);
  const goalKey = goalState.join(',');
  const initialKey = initialState.join(',');

  // 1. Mathematical Solvability Verification BEFORE search
  if (!isSolvable(initialState, gridSize)) {
    const endTime = performance.now();
    return {
      solved: false,
      terminationReason: 'unsolvable',
      algorithm: 'BFS',
      initialState,
      finalState: initialState,
      solutionPath: [],
      solutionDepth: 0,
      statesExplored: 0,
      nodesGenerated: 0,
      executionTime: Number((endTime - startTime).toFixed(2)),
      error: 'The puzzle configuration is mathematically unsolvable.',
    };
  }

  // 2. Trivial Goal Check (0 moves)
  if (initialKey === goalKey) {
    const endTime = performance.now();
    return {
      solved: true,
      terminationReason: 'solved',
      algorithm: 'BFS',
      initialState,
      finalState: initialState,
      solutionPath: [initialState],
      solutionDepth: 0,
      statesExplored: 1,
      nodesGenerated: 1,
      executionTime: Number((endTime - startTime).toFixed(2)),
    };
  }

  const initialEmptyIndex = initialState.indexOf(0);

  // FIFO Queue with head pointer index to avoid O(N) Array.shift() overhead
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
        terminationReason: 'solved',
        algorithm: 'BFS',
        initialState,
        finalState: path[path.length - 1],
        solutionPath: path,
        solutionDepth: path.length - 1,
        statesExplored,
        nodesGenerated,
        executionTime: Number((endTime - startTime).toFixed(2)),
      };
    }

    if (statesExplored >= maxStates) {
      break;
    }

    const validMoves = getValidMoveIndices(current.emptyIndex, gridSize);

    for (let i = 0; i < validMoves.length; i++) {
      const targetIndex = validMoves[i];
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
    terminationReason: 'search_limit',
    algorithm: 'BFS',
    initialState,
    finalState: initialState,
    solutionPath: [],
    solutionDepth: 0,
    statesExplored,
    nodesGenerated,
    executionTime: Number((endTime - startTime).toFixed(2)),
    error: `Search stopped after exploring ${statesExplored.toLocaleString()} states without reaching goal.`,
  };
}

export default {
  solveBFS,
};
