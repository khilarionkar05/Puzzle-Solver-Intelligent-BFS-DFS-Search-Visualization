/**
 * Depth-First Search (DFS) Solver Module
 * Mini-Project for Design and Analysis of Algorithms (DAA)
 *
 * Traverses puzzle state space deeply along branches using a LIFO Stack.
 * Implements depth-limited / iterative deepening exploration to prevent infinite branches.
 */
import { getGoalState, getValidMoveIndices, isSolvable } from '../puzzles/numericalPuzzle.js';

/**
 * Executes Depth-First Search (DFS / Depth-Limited Stack) to find a path to the goal state.
 * @param {Array<number>} initialState
 * @param {Array<number>} [customGoalState]
 * @param {number} [gridSize=3]
 * @param {number} [maxDepth=30]
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
export function solveDFS(
  initialState,
  customGoalState = null,
  gridSize = 3,
  maxDepth = 35,
  maxStates = 150000
) {
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

  // LIFO Stack for Depth-First Search
  const stack = [
    {
      state: initialState,
      emptyIndex: initialEmptyIndex,
      parent: null,
      depth: 0,
    },
  ];

  // Map state string -> minimum depth encountered to prune suboptimal deeper visits
  const visitedDepth = new Map();
  visitedDepth.set(initialKey, 0);

  let statesExplored = 0;
  let nodesGenerated = 1;

  while (stack.length > 0) {
    const current = stack.pop();
    statesExplored++;

    // Check goal condition
    if (current.state.join(',') === goalKey) {
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

    // Depth limit check for DFS
    if (current.depth >= maxDepth) {
      continue;
    }

    const validMoves = getValidMoveIndices(current.emptyIndex, gridSize);

    // Push valid moves onto the stack (LIFO)
    for (let i = 0; i < validMoves.length; i++) {
      const targetIndex = validMoves[i];
      const nextState = [...current.state];
      nextState[current.emptyIndex] = nextState[targetIndex];
      nextState[targetIndex] = 0;

      const nextKey = nextState.join(',');
      const nextDepth = current.depth + 1;

      // Prune if state was already visited at an equal or shallower depth
      const prevDepth = visitedDepth.get(nextKey);
      if (prevDepth === undefined || nextDepth < prevDepth) {
        visitedDepth.set(nextKey, nextDepth);
        nodesGenerated++;

        stack.push({
          state: nextState,
          emptyIndex: targetIndex,
          parent: current,
          depth: nextDepth,
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
    error: `No solution found within maximum search depth limit of ${maxDepth}.`,
  };
}

export default {
  solveDFS,
};
