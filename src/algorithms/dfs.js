/**
 * Depth-First Search (DFS / Iterative Deepening IDDFS) Solver Module
 * Mini-Project for Design and Analysis of Algorithms (DAA)
 *
 * Traverses puzzle state space branches using Depth-First Search with path-based
 * cycle prevention and transposition-aware Iterative Deepening to prevent infinite
 * branch traps without incorrectly locking out valid alternative paths.
 */
import { getGoalState, getValidMoveIndices, isSolvable } from '../puzzles/numericalPuzzle.js';

export const MAX_STATES = 5000000;

/**
 * Executes Iterative Deepening Depth-First Search (IDDFS / Depth-Bounded Stack Search).
 * @param {Array<number>} initialState
 * @param {Array<number>} [customGoalState]
 * @param {number} [gridSize=3]
 * @param {number} [maxDepth=26] - Maximum search depth limit
 * @param {number} [maxStates=1000000] - Safety ceiling on explored states
 * @returns {{
 *   solved: boolean,
 *   terminationReason: 'solved' | 'unsolvable' | 'search_limit',
 *   algorithm: 'DFS',
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
export function solveDFS(
  initialState,
  customGoalState = null,
  gridSize = 3,
  maxDepth = 26,
  maxStates = MAX_STATES,
  onEvent = null
) {
  const startTime = performance.now();

  const goalState = customGoalState || getGoalState(gridSize);
  const goalKey = goalState.join(',');
  const initialKey = initialState.join(',');
  const emit = (type, payload = {}) => {
    if (typeof onEvent === 'function') {
      onEvent({ type, ...payload });
    }
  };

  // 1. Mathematical Solvability Verification BEFORE search
  if (!isSolvable(initialState, gridSize)) {
    const endTime = performance.now();
    return {
      solved: false,
      terminationReason: 'unsolvable',
      algorithm: 'DFS',
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

  // 2. Trivial Goal Check (0 moves required)
  if (initialKey === goalKey) {
    const endTime = performance.now();
    return {
      solved: true,
      terminationReason: 'solved',
      algorithm: 'DFS',
      initialState,
      finalState: initialState,
      solutionPath: [initialState],
      solutionDepth: 0,
      statesExplored: 1,
      nodesGenerated: 1,
      executionTime: Number((endTime - startTime).toFixed(2)),
    };
  }

  let statesExplored = 0;
  let nodesGenerated = 1;
  let reachedSafetyLimit = false;
  const nodeLookup = new Map();
  let nextNodeId = 1;

  const createNode = ({ state, parentId = null, depth = 0, move = null, searchOrder = null }) => {
    const key = state.join(',');
    let node = nodeLookup.get(key);
    if (!node) {
      node = {
        id: nextNodeId++,
        state: [...state],
        parentId,
        depth,
        move,
        searchOrder,
      };
      nodeLookup.set(key, node);
    }
    if (parentId !== null && node.parentId === null) node.parentId = parentId;
    if (searchOrder !== null) node.searchOrder = searchOrder;
    return node;
  };

  const rootNode = createNode({ state: initialState, depth: 0, searchOrder: 1 });
  emit('root', {
    nodeId: rootNode.id,
    state: initialState,
    parentId: null,
    depth: 0,
    move: null,
    searchOrder: 1,
  });

  // Transposition table mapping state string -> minimum depth encountered in current iteration
  const visitedMinDepth = new Map();

  /**
   * Recursive Depth-Limited Search (DLS)
   * Prevents cycles on the active call stack path while pruning states
   * already encountered at an equal or shallower depth in the current limit iteration.
   */
  function dls(state, emptyIndex, depth, limit, path, pathSet, parentNodeId = null) {
    statesExplored++;

    if (statesExplored >= maxStates) {
      reachedSafetyLimit = true;
      return null;
    }

    const currentNode = createNode({
      state,
      parentId: parentNodeId,
      depth,
      searchOrder: statesExplored,
    });

    emit('expand', {
      nodeId: currentNode.id,
      state,
      parentId: parentNodeId,
      depth,
      searchOrder: statesExplored,
    });

    const key = state.join(',');
    if (key === goalKey) {
      emit('goal', {
        nodeId: currentNode.id,
        state,
        parentId: parentNodeId,
        depth,
        searchOrder: statesExplored,
      });
      return path;
    }

    if (depth >= limit) {
      return null;
    }

    const validMoves = getValidMoveIndices(emptyIndex, gridSize);

    for (let i = 0; i < validMoves.length; i++) {
      const targetIndex = validMoves[i];
      const nextState = [...state];
      nextState[emptyIndex] = nextState[targetIndex];
      nextState[targetIndex] = 0;

      const nextKey = nextState.join(',');
      const nextDepth = depth + 1;
      const moveDirection = (() => {
        const blankRow = Math.floor(emptyIndex / gridSize);
        const blankCol = emptyIndex % gridSize;
        const targetRow = Math.floor(targetIndex / gridSize);
        const targetCol = targetIndex % gridSize;
        if (targetRow === blankRow - 1 && targetCol === blankCol) return 'UP';
        if (targetRow === blankRow + 1 && targetCol === blankCol) return 'DOWN';
        if (targetRow === blankRow && targetCol === blankCol - 1) return 'LEFT';
        if (targetRow === blankRow && targetCol === blankCol + 1) return 'RIGHT';
        return null;
      })();

      // 1. Active branch cycle check: Do not re-visit states on current call stack
      // 2. Transposition check: Prune if already explored at <= nextDepth
      if (!pathSet.has(nextKey)) {
        const prevDepth = visitedMinDepth.get(nextKey);
        if (prevDepth === undefined || nextDepth < prevDepth) {
          visitedMinDepth.set(nextKey, nextDepth);
          nodesGenerated++;

          pathSet.add(nextKey);
          path.push(nextState);

          const childNode = createNode({
            state: nextState,
            parentId: currentNode.id,
            depth: nextDepth,
            move: moveDirection,
          });

          emit('generate', {
            nodeId: childNode.id,
            parentId: currentNode.id,
            state: nextState,
            depth: nextDepth,
            move: moveDirection,
            searchOrder: nodesGenerated,
          });

          const result = dls(nextState, targetIndex, nextDepth, limit, path, pathSet, currentNode.id);
          if (result) return result;

          // Backtrack from current branch
          path.pop();
          pathSet.delete(nextKey);

          if (reachedSafetyLimit) return null;
        }
      }
    }

    return null;
  }

  const initialEmptyIndex = initialState.indexOf(0);

  // Iterative Deepening Loop (limit = 0, 1, 2, ... maxDepth)
  for (let limit = 0; limit <= maxDepth; limit++) {
    reachedSafetyLimit = false;
    visitedMinDepth.clear();
    visitedMinDepth.set(initialKey, 0);
    const pathSet = new Set([initialKey]);
    const path = [initialState];

    const solution = dls(initialState, initialEmptyIndex, 0, limit, path, pathSet, null);

    if (solution) {
      const endTime = performance.now();
      return {
        solved: true,
        terminationReason: 'solved',
        algorithm: 'DFS',
        initialState,
        finalState: solution[solution.length - 1],
        solutionPath: solution,
        solutionDepth: solution.length - 1,
        statesExplored,
        nodesGenerated,
        executionTime: Number((endTime - startTime).toFixed(2)),
      };
    }

    if (reachedSafetyLimit) {
      break;
    }
  }

  const endTime = performance.now();
  emit('search_limit', {
    statesExplored,
    nodesGenerated,
  });
  const errorMessage = reachedSafetyLimit
    ? `Search stopped after exploring ${statesExplored.toLocaleString()} states. The puzzle is solvable but requires a deeper search limit or BFS.`
    : `Search depth limit of ${maxDepth} reached without reaching goal state. The puzzle is solvable but requires a deeper search limit or BFS.`;

  return {
    solved: false,
    terminationReason: 'search_limit',
    algorithm: 'DFS',
    initialState,
    finalState: initialState,
    solutionPath: [],
    solutionDepth: 0,
    statesExplored,
    nodesGenerated,
    executionTime: Number((endTime - startTime).toFixed(2)),
    error: errorMessage,
  };
}

export default {
  solveDFS,
};
